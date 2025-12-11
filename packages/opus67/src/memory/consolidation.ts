/**
 * OPUS 67 v6.3.0 - Memory Consolidation Loop
 *
 * Implements human-like memory consolidation:
 * 1. Promotes frequently accessed memories to higher layers
 * 2. Evicts stale working memory (>1 hour)
 * 3. Merges 95%+ similar memories
 * 4. Updates access counts and importance scores
 *
 * Runs as background process every 5 minutes.
 */

import { EventEmitter } from "events";

// =============================================================================
// TYPES
// =============================================================================

export type MemoryLayer = "working" | "episodic" | "semantic" | "skill";

export interface MemoryEntry {
  id: string;
  content: string;
  layer: MemoryLayer;
  embedding?: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  importance: number;
}

export interface ConsolidationConfig {
  /** Interval between consolidation runs (ms) */
  interval: number;
  /** Minimum access count for promotion */
  promotionThreshold: number;
  /** Similarity threshold for merging (0-1) */
  mergeThreshold: number;
  /** TTL for working memory (ms) */
  workingMemoryTTL: number;
  /** TTL for episodic memory (ms) */
  episodicMemoryTTL: number;
  /** Max entries per layer */
  layerCapacity: {
    working: number;
    episodic: number;
    semantic: number;
    skill: number;
  };
}

export interface ConsolidationResult {
  promoted: number;
  evicted: number;
  merged: number;
  duration: number;
  timestamp: Date;
}

export interface ConsolidationEvents {
  "consolidation:start": [];
  "consolidation:complete": [ConsolidationResult];
  "consolidation:error": [Error];
  "memory:promoted": [string, MemoryLayer, MemoryLayer];
  "memory:evicted": [string, MemoryLayer, string];
  "memory:merged": [string, string, string];
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_CONSOLIDATION_CONFIG: ConsolidationConfig = {
  interval: 5 * 60 * 1000, // 5 minutes
  promotionThreshold: 3, // Access 3+ times to promote
  mergeThreshold: 0.95, // 95% similarity to merge
  workingMemoryTTL: 60 * 60 * 1000, // 1 hour
  episodicMemoryTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  layerCapacity: {
    working: 100,
    episodic: 500,
    semantic: 2000,
    skill: 500,
  },
};

// =============================================================================
// CONSOLIDATION LOOP
// =============================================================================

export class MemoryConsolidationLoop extends EventEmitter<ConsolidationEvents> {
  private config: ConsolidationConfig;
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  // External memory store interface
  private getMemories: (layer: MemoryLayer) => Promise<MemoryEntry[]>;
  private updateMemory: (entry: MemoryEntry) => Promise<void>;
  private deleteMemory: (id: string) => Promise<void>;
  private moveMemory: (id: string, targetLayer: MemoryLayer) => Promise<void>;
  private mergeMemories: (
    keepId: string,
    mergeId: string,
    mergedContent: string
  ) => Promise<void>;

  constructor(
    memoryInterface: {
      getMemories: (layer: MemoryLayer) => Promise<MemoryEntry[]>;
      updateMemory: (entry: MemoryEntry) => Promise<void>;
      deleteMemory: (id: string) => Promise<void>;
      moveMemory: (id: string, targetLayer: MemoryLayer) => Promise<void>;
      mergeMemories: (
        keepId: string,
        mergeId: string,
        mergedContent: string
      ) => Promise<void>;
    },
    config?: Partial<ConsolidationConfig>
  ) {
    super();
    this.config = { ...DEFAULT_CONSOLIDATION_CONFIG, ...config };
    this.getMemories = memoryInterface.getMemories;
    this.updateMemory = memoryInterface.updateMemory;
    this.deleteMemory = memoryInterface.deleteMemory;
    this.moveMemory = memoryInterface.moveMemory;
    this.mergeMemories = memoryInterface.mergeMemories;
  }

  /**
   * Start the consolidation loop
   */
  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.runConsolidation().catch((err) => {
        this.emit("consolidation:error", err);
      });
    }, this.config.interval);

    // Run immediately on start
    this.runConsolidation().catch((err) => {
      this.emit("consolidation:error", err);
    });
  }

  /**
   * Stop the consolidation loop
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Run a single consolidation pass
   */
  async runConsolidation(): Promise<ConsolidationResult> {
    if (this.running) {
      return {
        promoted: 0,
        evicted: 0,
        merged: 0,
        duration: 0,
        timestamp: new Date(),
      };
    }

    this.running = true;
    const startTime = Date.now();
    this.emit("consolidation:start");

    const result: ConsolidationResult = {
      promoted: 0,
      evicted: 0,
      merged: 0,
      duration: 0,
      timestamp: new Date(),
    };

    try {
      // Phase 1: Evict stale memories
      result.evicted += await this.evictStaleMemories("working");
      result.evicted += await this.evictStaleMemories("episodic");

      // Phase 2: Promote frequently accessed memories
      result.promoted += await this.promoteMemories("working", "episodic");
      result.promoted += await this.promoteMemories("episodic", "semantic");

      // Phase 3: Merge similar memories
      result.merged += await this.mergeSimilarMemories("episodic");
      result.merged += await this.mergeSimilarMemories("semantic");

      // Phase 4: Enforce layer capacity
      result.evicted += await this.enforceCapacity("working");
      result.evicted += await this.enforceCapacity("episodic");

      result.duration = Date.now() - startTime;
      this.emit("consolidation:complete", result);
    } catch (error) {
      this.emit("consolidation:error", error as Error);
      throw error;
    } finally {
      this.running = false;
    }

    return result;
  }

  /**
   * Evict stale memories from a layer
   */
  private async evictStaleMemories(layer: MemoryLayer): Promise<number> {
    const memories = await this.getMemories(layer);
    const now = Date.now();
    let evicted = 0;

    const ttl =
      layer === "working"
        ? this.config.workingMemoryTTL
        : layer === "episodic"
          ? this.config.episodicMemoryTTL
          : Infinity;

    for (const memory of memories) {
      const age = now - memory.lastAccessedAt.getTime();
      if (age > ttl) {
        await this.deleteMemory(memory.id);
        this.emit("memory:evicted", memory.id, layer, "stale");
        evicted++;
      }
    }

    return evicted;
  }

  /**
   * Promote frequently accessed memories to higher layer
   */
  private async promoteMemories(
    fromLayer: MemoryLayer,
    toLayer: MemoryLayer
  ): Promise<number> {
    const memories = await this.getMemories(fromLayer);
    let promoted = 0;

    for (const memory of memories) {
      if (memory.accessCount >= this.config.promotionThreshold) {
        await this.moveMemory(memory.id, toLayer);
        this.emit("memory:promoted", memory.id, fromLayer, toLayer);
        promoted++;
      }
    }

    return promoted;
  }

  /**
   * Merge similar memories within a layer
   */
  private async mergeSimilarMemories(layer: MemoryLayer): Promise<number> {
    const memories = await this.getMemories(layer);
    let merged = 0;

    // Compare each pair
    const toDelete = new Set<string>();

    for (let i = 0; i < memories.length; i++) {
      if (toDelete.has(memories[i].id)) continue;

      for (let j = i + 1; j < memories.length; j++) {
        if (toDelete.has(memories[j].id)) continue;

        const similarity = this.calculateSimilarity(
          memories[i].embedding,
          memories[j].embedding
        );

        if (similarity >= this.config.mergeThreshold) {
          // Keep the one with higher importance/access count
          const keep =
            memories[i].importance * memories[i].accessCount >=
            memories[j].importance * memories[j].accessCount
              ? memories[i]
              : memories[j];
          const merge = keep === memories[i] ? memories[j] : memories[i];

          // Merge content (simple concatenation with dedup)
          const mergedContent = this.mergeContent(keep.content, merge.content);

          await this.mergeMemories(keep.id, merge.id, mergedContent);
          toDelete.add(merge.id);
          this.emit("memory:merged", keep.id, merge.id, mergedContent);
          merged++;
        }
      }
    }

    return merged;
  }

  /**
   * Enforce layer capacity by evicting lowest-value memories
   */
  private async enforceCapacity(layer: MemoryLayer): Promise<number> {
    const memories = await this.getMemories(layer);
    const capacity = this.config.layerCapacity[layer];
    let evicted = 0;

    if (memories.length <= capacity) return 0;

    // Sort by value (importance * accessCount / age)
    const now = Date.now();
    const scored = memories.map((m) => ({
      memory: m,
      value:
        (m.importance * m.accessCount) / (now - m.lastAccessedAt.getTime() + 1),
    }));

    scored.sort((a, b) => b.value - a.value);

    // Evict lowest value entries
    const toEvict = scored.slice(capacity);
    for (const { memory } of toEvict) {
      await this.deleteMemory(memory.id);
      this.emit("memory:evicted", memory.id, layer, "capacity");
      evicted++;
    }

    return evicted;
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private calculateSimilarity(
    a: number[] | undefined,
    b: number[] | undefined
  ): number {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Merge content from two memories
   */
  private mergeContent(a: string, b: string): string {
    // Simple approach: keep longer content and append unique info
    const longer = a.length >= b.length ? a : b;
    const shorter = a.length < b.length ? a : b;

    // Check if shorter is a subset of longer
    if (longer.includes(shorter)) {
      return longer;
    }

    // Otherwise concatenate with separator
    return `${longer}\n\n---\n\n${shorter}`;
  }

  /**
   * Get current config
   */
  getConfig(): ConsolidationConfig {
    return { ...this.config };
  }

  /**
   * Update config (takes effect on next run)
   */
  updateConfig(updates: Partial<ConsolidationConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a consolidation loop with default config
 */
export function createConsolidationLoop(
  memoryInterface: {
    getMemories: (layer: MemoryLayer) => Promise<MemoryEntry[]>;
    updateMemory: (entry: MemoryEntry) => Promise<void>;
    deleteMemory: (id: string) => Promise<void>;
    moveMemory: (id: string, targetLayer: MemoryLayer) => Promise<void>;
    mergeMemories: (
      keepId: string,
      mergeId: string,
      mergedContent: string
    ) => Promise<void>;
  },
  config?: Partial<ConsolidationConfig>
): MemoryConsolidationLoop {
  return new MemoryConsolidationLoop(memoryInterface, config);
}
