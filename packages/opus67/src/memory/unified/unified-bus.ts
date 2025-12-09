/**
 * OPUS 67 Unified Memory Bus
 * Central event hub connecting all memory stores
 *
 * This is the nervous system of the unified memory architecture.
 * All memory events flow through here, enabling cross-store sync.
 */

import { EventEmitter } from "eventemitter3";
import type {
  MemorySource,
  UnifiedResult,
  WritePayload,
  WriteResult,
  UnifiedMemoryEvents,
  MemoryAdapter,
} from "./types.js";

// =============================================================================
// BUS EVENTS (Internal routing)
// =============================================================================

interface BusEvents extends UnifiedMemoryEvents {
  // Memory mutations
  "memory:add": (payload: WritePayload, source: MemorySource) => void;
  "memory:update": (id: string, content: string, source: MemorySource) => void;
  "memory:delete": (id: string, source: MemorySource) => void;

  // Cross-store sync
  "sync:request": (source: MemorySource, targetSources: MemorySource[]) => void;
  "sync:broadcast": (results: UnifiedResult[], source: MemorySource) => void;

  // Adapter registration
  "adapter:register": (source: MemorySource, adapter: MemoryAdapter) => void;
  "adapter:unregister": (source: MemorySource) => void;
}

// =============================================================================
// UNIFIED BUS
// =============================================================================

export class UnifiedBus extends EventEmitter<BusEvents> {
  private adapters: Map<MemorySource, MemoryAdapter> = new Map();
  private sourceStatus: Map<MemorySource, boolean> = new Map();
  private pendingWrites: Map<string, WritePayload> = new Map();
  private initialized = false;

  constructor() {
    super();
    this.setupInternalHandlers();
  }

  /**
   * Set up internal event handlers for cross-store communication
   */
  private setupInternalHandlers(): void {
    // When a memory is added to one store, optionally propagate to others
    this.on("memory:add", async (payload, source) => {
      // Log the event for debugging
      console.log(`[UnifiedBus] memory:add from ${source}: ${payload.type}`);

      // If destinations are specified and include other stores, propagate
      if (payload.destinations) {
        const otherDestinations = payload.destinations.filter(
          (d) => d !== source,
        );
        for (const dest of otherDestinations) {
          const adapter = this.adapters.get(dest);
          if (adapter?.write && this.sourceStatus.get(dest)) {
            try {
              await adapter.write(payload);
            } catch (error) {
              console.warn(
                `[UnifiedBus] Failed to propagate to ${dest}:`,
                error,
              );
            }
          }
        }
      }
    });

    // Handle sync broadcasts - when one store syncs, others can listen
    this.on("sync:broadcast", (results, source) => {
      console.log(
        `[UnifiedBus] sync:broadcast from ${source}: ${results.length} items`,
      );
    });
  }

  /**
   * Register a memory adapter
   */
  registerAdapter(adapter: MemoryAdapter): void {
    const source = adapter.source;
    this.adapters.set(source, adapter);
    this.sourceStatus.set(source, false);
    this.emit("adapter:register", source, adapter);
    console.log(`[UnifiedBus] Registered adapter: ${source}`);
  }

  /**
   * Unregister a memory adapter
   */
  unregisterAdapter(source: MemorySource): void {
    this.adapters.delete(source);
    this.sourceStatus.delete(source);
    this.emit("adapter:unregister", source);
    console.log(`[UnifiedBus] Unregistered adapter: ${source}`);
  }

  /**
   * Initialize all registered adapters
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const initPromises = Array.from(this.adapters.entries()).map(
      async ([source, adapter]) => {
        try {
          const available = await adapter.initialize();
          this.sourceStatus.set(source, available);
          if (available) {
            this.emit("source:available", source);
          } else {
            this.emit(
              "source:unavailable",
              source,
              new Error("Initialization returned false"),
            );
          }
          return { source, available };
        } catch (error) {
          this.sourceStatus.set(source, false);
          this.emit(
            "source:unavailable",
            source,
            error instanceof Error ? error : new Error(String(error)),
          );
          return { source, available: false };
        }
      },
    );

    const results = await Promise.all(initPromises);
    const availableCount = results.filter((r) => r.available).length;

    console.log(
      `[UnifiedBus] Initialized ${availableCount}/${results.length} adapters`,
    );
    this.initialized = true;
    this.emit("ready");
  }

  /**
   * Get an adapter by source
   */
  getAdapter(source: MemorySource): MemoryAdapter | undefined {
    return this.adapters.get(source);
  }

  /**
   * Check if a source is available
   */
  isAvailable(source: MemorySource): boolean {
    return this.sourceStatus.get(source) ?? false;
  }

  /**
   * Get all available sources
   */
  getAvailableSources(): MemorySource[] {
    return Array.from(this.sourceStatus.entries())
      .filter(([_, available]) => available)
      .map(([source]) => source);
  }

  /**
   * Query across multiple sources in parallel
   */
  async queryParallel(
    query: string,
    sources: MemorySource[],
    options?: { limit?: number; minScore?: number },
  ): Promise<UnifiedResult[]> {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;

    const availableSources = sources.filter((s) => this.isAvailable(s));

    const queryPromises = availableSources.map(async (source) => {
      const adapter = this.adapters.get(source);
      if (!adapter) return [];

      try {
        const results = await adapter.query(query, { limit, minScore });
        return results;
      } catch (error) {
        console.warn(`[UnifiedBus] Query failed for ${source}:`, error);
        return [];
      }
    });

    const allResults = await Promise.all(queryPromises);
    const flatResults = allResults.flat();

    // Sort by score and deduplicate by content
    const seen = new Set<string>();
    return flatResults
      .filter((r) => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .filter((r) => {
        const key = `${r.source}:${r.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }

  /**
   * Write to multiple destinations
   */
  async writeToDestinations(
    payload: WritePayload,
    destinations: MemorySource[],
  ): Promise<WriteResult> {
    const result: WriteResult = {
      success: false,
      destinations: [],
      ids: {} as Record<MemorySource, string>,
      errors: {} as Record<MemorySource, string>,
    };

    const availableDestinations = destinations.filter((d) =>
      this.isAvailable(d),
    );

    if (availableDestinations.length === 0) {
      result.errors = { graphiti: "No available destinations" } as Record<
        MemorySource,
        string
      >;
      return result;
    }

    // Write to primary (first) destination - must succeed
    const primary = availableDestinations[0];
    const primaryAdapter = this.adapters.get(primary);

    if (!primaryAdapter?.write) {
      result.errors![primary] = "Adapter does not support write";
      return result;
    }

    try {
      const id = await primaryAdapter.write(payload);
      if (id) {
        result.ids[primary] = id;
        result.destinations.push(primary);
        result.success = true;

        // Emit event for cross-store sync
        this.emit("memory:add", payload, primary);
      } else {
        result.errors![primary] = "Write returned null";
        return result;
      }
    } catch (error) {
      result.errors![primary] = String(error);
      return result;
    }

    // Write to secondary destinations (best-effort)
    const secondaryDestinations = availableDestinations.slice(1);
    const secondaryPromises = secondaryDestinations.map(async (dest) => {
      const adapter = this.adapters.get(dest);
      if (!adapter?.write) return { dest, id: null, error: "No write support" };

      try {
        const id = await adapter.write(payload);
        return { dest, id, error: null };
      } catch (error) {
        return { dest, id: null, error: String(error) };
      }
    });

    const secondaryResults = await Promise.allSettled(secondaryPromises);

    for (const settledResult of secondaryResults) {
      if (settledResult.status === "fulfilled") {
        const { dest, id, error } = settledResult.value;
        if (id) {
          result.ids[dest] = id;
          result.destinations.push(dest);
        } else if (error) {
          result.errors![dest] = error;
        }
      }
    }

    this.emit("write:complete", payload, result);
    return result;
  }

  /**
   * Request sync from one source to targets
   */
  async requestSync(
    source: MemorySource,
    targets?: MemorySource[],
  ): Promise<number> {
    const adapter = this.adapters.get(source);
    if (!adapter || !this.isAvailable(source)) {
      console.warn(`[UnifiedBus] Cannot sync - ${source} not available`);
      return 0;
    }

    this.emit("sync:start", source);

    try {
      // Query all items from source (limited to recent/relevant)
      const results = await adapter.query("", { limit: 100 });

      // Broadcast to other adapters
      const targetSources =
        targets ?? this.getAvailableSources().filter((s) => s !== source);
      this.emit("sync:broadcast", results, source);
      this.emit("sync:complete", source, results.length);

      return results.length;
    } catch (error) {
      console.error(`[UnifiedBus] Sync failed for ${source}:`, error);
      return 0;
    }
  }

  /**
   * Get status of all sources
   */
  getStatus(): Record<MemorySource, boolean> {
    return Object.fromEntries(this.sourceStatus) as Record<
      MemorySource,
      boolean
    >;
  }

  /**
   * Shutdown all adapters
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.adapters.entries()).map(
      async ([source, adapter]) => {
        if (adapter.disconnect) {
          try {
            await adapter.disconnect();
          } catch (error) {
            console.warn(`[UnifiedBus] Failed to disconnect ${source}:`, error);
          }
        }
      },
    );

    await Promise.all(shutdownPromises);
    this.adapters.clear();
    this.sourceStatus.clear();
    this.initialized = false;
    console.log("[UnifiedBus] Shutdown complete");
  }
}

// =============================================================================
// FACTORY & SINGLETON
// =============================================================================

export function createUnifiedBus(): UnifiedBus {
  return new UnifiedBus();
}

// Global singleton for easy access
let globalBus: UnifiedBus | null = null;

export function getUnifiedBus(): UnifiedBus {
  if (!globalBus) {
    globalBus = new UnifiedBus();
  }
  return globalBus;
}

export function resetUnifiedBus(): void {
  if (globalBus) {
    globalBus.shutdown();
    globalBus = null;
  }
}
