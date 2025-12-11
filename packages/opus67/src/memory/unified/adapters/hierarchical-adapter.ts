/**
 * OPUS 67 v6.3.0 - Hierarchical Memory Adapter
 *
 * Wraps HierarchicalMemory to integrate as the 6th adapter
 * in the UnifiedMemory system.
 *
 * Memory Sources (6 total):
 * 1. GraphitiMemory - Neo4j/local temporal graph
 * 2. LearningStore - Evolution patterns
 * 3. MarkdownLoader - .claude/memory files
 * 4. HMLRAdapter - Multi-hop reasoning
 * 5. SessionStore - Session facts from logs
 * 6. HierarchicalAdapter - 4-layer tiered memory (NEW)
 */

import type {
  MemoryAdapter,
  MemorySource,
  UnifiedResult,
  UnifiedQuery,
  WritePayload,
  WriteType,
} from "../types.js";
import {
  HierarchicalMemory,
  type MemoryEntry,
  type MemoryLayer,
  type HierarchicalMemoryConfig,
} from "../../hierarchical.js";

// =============================================================================
// TYPES
// =============================================================================

export interface HierarchicalAdapterConfig {
  autoConsolidate: boolean;
  defaultWriteLayer: MemoryLayer;
  queryLayerPriority: MemoryLayer[];
}

const DEFAULT_ADAPTER_CONFIG: HierarchicalAdapterConfig = {
  autoConsolidate: true,
  defaultWriteLayer: "working",
  queryLayerPriority: ["skill", "semantic", "episodic", "working"],
};

// =============================================================================
// HIERARCHICAL ADAPTER
// =============================================================================

export class HierarchicalAdapter implements MemoryAdapter {
  // Use 'context' as the source since it maps to the existing MemorySource type
  readonly source: MemorySource = "context";

  private memory: HierarchicalMemory;
  private config: HierarchicalAdapterConfig;
  private initialized = false;

  constructor(
    memoryConfig?: Partial<HierarchicalMemoryConfig>,
    adapterConfig?: Partial<HierarchicalAdapterConfig>
  ) {
    this.memory = new HierarchicalMemory(memoryConfig);
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...adapterConfig };
  }

  /**
   * Initialize the adapter
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    // Start consolidation if enabled
    if (this.config.autoConsolidate) {
      this.memory.startConsolidation();
    }

    this.initialized = true;
    console.log("[HierarchicalAdapter] Initialized 4-layer memory system");
    return true;
  }

  /**
   * Check if adapter is available
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Query hierarchical memory
   */
  async query(
    query: string,
    options?: Partial<UnifiedQuery>
  ): Promise<UnifiedResult[]> {
    const limit = options?.limit ?? 10;
    const minScore = options?.minScore ?? 0.3;

    // Retrieve from hierarchical memory
    const entries = await this.memory.retrieve(
      query,
      limit * 2, // Get more to filter
      this.config.queryLayerPriority
    );

    // Convert to UnifiedResults
    const results: UnifiedResult[] = [];

    for (const entry of entries) {
      // Calculate a score based on importance and recency
      const score = this.calculateScore(entry, query);

      if (score >= minScore) {
        results.push({
          id: entry.id,
          source: this.source,
          content: entry.content,
          score,
          metadata: {
            type: this.getTypeFromLayer(entry.layer),
            key: entry.id,
            timestamp: entry.createdAt,
            layer: entry.layer,
            accessCount: entry.accessCount,
            importance: entry.importance,
            ...entry.metadata,
          },
        });
      }
    }

    // Sort by score and limit
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Write to hierarchical memory
   */
  async write(payload: WritePayload): Promise<string | null> {
    const layer = this.getLayerFromType(payload.type);
    const importance = this.getImportanceFromType(payload.type);

    try {
      const id = await this.memory.store(
        payload.content,
        layer,
        payload.metadata,
        importance
      );
      return id;
    } catch (error) {
      console.error("[HierarchicalAdapter] Write failed:", error);
      return null;
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{ count: number; lastSync?: Date }> {
    const stats = this.memory.getStats();
    return {
      count: stats.total,
      lastSync: new Date(),
    };
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    this.memory.stopConsolidation();
    this.initialized = false;
  }

  // =============================================================================
  // PRIVATE HELPERS
  // =============================================================================

  /**
   * Calculate relevance score for a memory entry
   */
  private calculateScore(entry: MemoryEntry, query: string): number {
    const now = Date.now();
    const age = now - entry.lastAccessedAt.getTime();
    const recencyScore = Math.exp(-age / (24 * 60 * 60 * 1000)); // Decay over 1 day

    // Content match score (simple keyword overlap)
    const queryWords = new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
    const contentWords = entry.content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    let matches = 0;
    for (const word of contentWords) {
      if (queryWords.has(word)) matches++;
    }
    const matchScore =
      queryWords.size > 0 ? Math.min(matches / queryWords.size, 1) : 0.5;

    // Layer priority bonus
    const layerBonus =
      entry.layer === "skill" ? 1.2 : entry.layer === "semantic" ? 1.1 : 1.0;

    // Combined score
    return (
      0.4 * matchScore +
      0.3 * recencyScore +
      0.3 * entry.importance * layerBonus
    );
  }

  /**
   * Map memory layer to type string
   */
  private getTypeFromLayer(layer: MemoryLayer): string {
    const typeMap: Record<MemoryLayer, string> = {
      working: "working_memory",
      episodic: "episode",
      semantic: "fact",
      skill: "skill",
    };
    return typeMap[layer];
  }

  /**
   * Map write type to memory layer
   */
  private getLayerFromType(type: WriteType): MemoryLayer {
    const layerMap: Record<WriteType, MemoryLayer> = {
      fact: "semantic",
      episode: "episodic",
      learning: "semantic",
      win: "episodic",
      decision: "semantic",
      goal: "episodic",
      improvement: "semantic",
    };
    return layerMap[type] ?? this.config.defaultWriteLayer;
  }

  /**
   * Get importance based on write type
   */
  private getImportanceFromType(type: WriteType): number {
    const importanceMap: Record<WriteType, number> = {
      fact: 0.7,
      episode: 0.4,
      learning: 0.8,
      win: 0.9,
      decision: 0.8,
      goal: 0.6,
      improvement: 0.7,
    };
    return importanceMap[type] ?? 0.5;
  }

  /**
   * Get direct access to the underlying HierarchicalMemory
   */
  getMemory(): HierarchicalMemory {
    return this.memory;
  }
}

// =============================================================================
// FACTORY & SINGLETON
// =============================================================================

let instance: HierarchicalAdapter | null = null;

export function createHierarchicalAdapter(
  memoryConfig?: Partial<HierarchicalMemoryConfig>,
  adapterConfig?: Partial<HierarchicalAdapterConfig>
): HierarchicalAdapter {
  return new HierarchicalAdapter(memoryConfig, adapterConfig);
}

export function getHierarchicalAdapter(): HierarchicalAdapter {
  if (!instance) {
    instance = new HierarchicalAdapter();
  }
  return instance;
}

export function resetHierarchicalAdapter(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
