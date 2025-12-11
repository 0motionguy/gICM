/**
 * OPUS 67 v6.3.0 - Hierarchical Memory System
 *
 * 6th memory source in the Unified Memory architecture.
 * Adds human-like memory consolidation as a new adapter alongside:
 * - GraphitiMemory (Neo4j/Local)
 * - LearningStore (evolution patterns)
 * - MarkdownLoader (.claude/memory)
 * - HMLRAdapter (multi-hop reasoning)
 * - SessionStore (session facts)
 *
 * Implements 4 memory layers:
 * 1. Working Memory (1-hour TTL, session-scoped)
 * 2. Episodic Memory (7-day TTL, recent events)
 * 3. Semantic Memory (permanent, consolidated knowledge)
 * 4. Skill Memory (permanent, reusable patterns)
 *
 * Features:
 * - Automatic promotion based on access frequency
 * - Smart eviction using LRU
 * - Deduplication for 95%+ similar memories
 * - Consolidation loop for memory management
 *
 * Based on Anthropic's Context Engineering research.
 */

import { EventEmitter } from "eventemitter3";

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
  importance: number; // 0-1 score
  ttl?: number; // milliseconds until expiration
}

export interface ConsolidationResult {
  promoted: number;
  evicted: number;
  merged: number;
  duration: number;
}

export interface HierarchicalMemoryConfig {
  maxWorkingMemory: number;
  maxEpisodicMemory: number;
  workingTTL: number; // 1 hour default
  episodicTTL: number; // 7 days default
  promotionThreshold: number; // Access count to trigger promotion
  similarityThreshold: number; // 0-1, threshold for deduplication
  consolidationInterval: number; // ms between consolidation runs
}

interface HierarchicalMemoryEvents {
  "memory:stored": [MemoryEntry];
  "memory:promoted": [MemoryEntry, MemoryLayer, MemoryLayer];
  "memory:evicted": [string, MemoryLayer];
  "memory:merged": [string, string, string]; // merged into
  "consolidation:start": [];
  "consolidation:complete": [ConsolidationResult];
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: HierarchicalMemoryConfig = {
  maxWorkingMemory: 100,
  maxEpisodicMemory: 1000,
  workingTTL: 60 * 60 * 1000, // 1 hour
  episodicTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  promotionThreshold: 5, // 5 accesses to promote
  similarityThreshold: 0.95, // 95% similarity for deduplication
  consolidationInterval: 5 * 60 * 1000, // 5 minutes
};

// =============================================================================
// HIERARCHICAL MEMORY
// =============================================================================

export class HierarchicalMemory extends EventEmitter<HierarchicalMemoryEvents> {
  private config: HierarchicalMemoryConfig;
  private layers: {
    working: Map<string, MemoryEntry>;
    episodic: Map<string, MemoryEntry>;
    semantic: Map<string, MemoryEntry>;
    skill: Map<string, MemoryEntry>;
  };
  private consolidationTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<HierarchicalMemoryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.layers = {
      working: new Map(),
      episodic: new Map(),
      semantic: new Map(),
      skill: new Map(),
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Store a new memory
   */
  async store(
    content: string,
    layer: MemoryLayer,
    metadata: Record<string, unknown> = {},
    importance: number = 0.5
  ): Promise<string> {
    const id = this.generateId();
    const now = new Date();

    // Set TTL based on layer
    let ttl: number | undefined;
    if (layer === "working") {
      ttl = this.config.workingTTL;
    } else if (layer === "episodic") {
      ttl = this.config.episodicTTL;
    }

    const entry: MemoryEntry = {
      id,
      content,
      layer,
      metadata,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
      importance,
      ttl,
    };

    // Check for duplicates before storing
    const duplicate = await this.findDuplicate(content, layer);
    if (duplicate) {
      // Update existing instead of creating new
      duplicate.accessCount++;
      duplicate.lastAccessedAt = now;
      duplicate.importance = Math.max(duplicate.importance, importance);
      this.emit("memory:merged", id, duplicate.id, duplicate.id);
      return duplicate.id;
    }

    // Store in appropriate layer
    this.layers[layer].set(id, entry);
    this.emit("memory:stored", entry);

    // Check layer capacity
    this.enforceLayerLimits(layer);

    return id;
  }

  /**
   * Retrieve memories by query
   */
  async retrieve(
    query: string,
    k: number = 10,
    layers?: MemoryLayer[]
  ): Promise<MemoryEntry[]> {
    const targetLayers = layers || ["working", "episodic", "semantic", "skill"];
    const results: MemoryEntry[] = [];
    const queryLower = query.toLowerCase();

    // Simple keyword-based retrieval
    for (const layer of targetLayers) {
      for (const entry of this.layers[layer as MemoryLayer].values()) {
        const contentLower = entry.content.toLowerCase();
        if (
          contentLower.includes(queryLower) ||
          this.keywordMatch(queryLower, contentLower)
        ) {
          results.push(entry);
          // Update access stats
          entry.accessCount++;
          entry.lastAccessedAt = new Date();
        }
      }
    }

    // Sort by relevance (importance + recency)
    results.sort((a, b) => {
      const scoreA = this.calculateRetrievalScore(a, query);
      const scoreB = this.calculateRetrievalScore(b, query);
      return scoreB - scoreA;
    });

    // Check for promotion after retrieval
    for (const entry of results) {
      this.checkPromotion(entry);
    }

    return results.slice(0, k);
  }

  /**
   * Simple keyword matching
   */
  private keywordMatch(query: string, content: string): boolean {
    const queryWords = query.split(/\s+/).filter((w) => w.length > 2);
    const contentWords = new Set(content.split(/\s+/));

    let matches = 0;
    for (const word of queryWords) {
      if (contentWords.has(word)) matches++;
    }

    return queryWords.length > 0 && matches / queryWords.length >= 0.5;
  }

  /**
   * Calculate retrieval score
   */
  private calculateRetrievalScore(entry: MemoryEntry, query: string): number {
    const now = Date.now();
    const age = now - entry.lastAccessedAt.getTime();
    const recencyScore = Math.exp(-age / (24 * 60 * 60 * 1000)); // Decay over 1 day

    // Layer priority (semantic and skill are more valuable)
    const layerScore =
      entry.layer === "semantic" || entry.layer === "skill" ? 1.2 : 1.0;

    return (
      entry.importance *
      recencyScore *
      layerScore *
      Math.log(entry.accessCount + 1)
    );
  }

  /**
   * Find duplicate memory
   */
  private async findDuplicate(
    content: string,
    layer: MemoryLayer
  ): Promise<MemoryEntry | null> {
    const contentLower = content.toLowerCase().trim();

    for (const entry of this.layers[layer].values()) {
      const entryLower = entry.content.toLowerCase().trim();

      // Simple exact match check
      if (contentLower === entryLower) {
        return entry;
      }

      // Check for high similarity (Jaccard on words)
      const similarity = this.calculateSimilarity(contentLower, entryLower);
      if (similarity >= this.config.similarityThreshold) {
        return entry;
      }
    }

    return null;
  }

  /**
   * Calculate text similarity (Jaccard)
   */
  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
    const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 2));

    if (wordsA.size === 0 && wordsB.size === 0) return 1;
    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    const union = wordsA.size + wordsB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Check if memory should be promoted
   */
  private checkPromotion(entry: MemoryEntry): void {
    if (entry.accessCount < this.config.promotionThreshold) return;

    const promotions: Record<MemoryLayer, MemoryLayer | null> = {
      working: "episodic",
      episodic: "semantic",
      semantic: null, // Can't promote further
      skill: null,
    };

    const targetLayer = promotions[entry.layer];
    if (!targetLayer) return;

    // Promote
    this.layers[entry.layer].delete(entry.id);
    entry.layer = targetLayer;
    entry.accessCount = 0; // Reset after promotion

    // Remove TTL for semantic/skill
    if (targetLayer === "semantic" || targetLayer === "skill") {
      entry.ttl = undefined;
    } else if (targetLayer === "episodic") {
      entry.ttl = this.config.episodicTTL;
    }

    this.layers[targetLayer].set(entry.id, entry);
    this.emit("memory:promoted", entry, entry.layer, targetLayer);
  }

  /**
   * Enforce layer capacity limits
   */
  private enforceLayerLimits(layer: MemoryLayer): void {
    const limits: Record<MemoryLayer, number> = {
      working: this.config.maxWorkingMemory,
      episodic: this.config.maxEpisodicMemory,
      semantic: Infinity,
      skill: Infinity,
    };

    const layerMap = this.layers[layer];
    const limit = limits[layer];

    if (layerMap.size <= limit) return;

    // Evict oldest/least accessed
    const entries = Array.from(layerMap.values()).sort((a, b) => {
      // LRU eviction
      const scoreA = a.lastAccessedAt.getTime() + a.accessCount * 1000;
      const scoreB = b.lastAccessedAt.getTime() + b.accessCount * 1000;
      return scoreA - scoreB;
    });

    // Remove excess
    const toRemove = layerMap.size - limit;
    for (let i = 0; i < toRemove; i++) {
      const entry = entries[i];
      layerMap.delete(entry.id);
      this.emit("memory:evicted", entry.id, layer);
    }
  }

  /**
   * Promote a memory to a specific layer
   */
  async promote(id: string, targetLayer: MemoryLayer): Promise<boolean> {
    // Find the entry
    let entry: MemoryEntry | undefined;
    let sourceLayer: MemoryLayer | undefined;

    for (const [layer, map] of Object.entries(this.layers) as [
      MemoryLayer,
      Map<string, MemoryEntry>,
    ][]) {
      if (map.has(id)) {
        entry = map.get(id);
        sourceLayer = layer;
        break;
      }
    }

    if (!entry || !sourceLayer) return false;

    // Can't demote
    const layerOrder: MemoryLayer[] = [
      "working",
      "episodic",
      "semantic",
      "skill",
    ];
    if (layerOrder.indexOf(targetLayer) <= layerOrder.indexOf(sourceLayer)) {
      return false;
    }

    // Move to target layer
    this.layers[sourceLayer].delete(id);
    entry.layer = targetLayer;

    // Remove TTL for permanent layers
    if (targetLayer === "semantic" || targetLayer === "skill") {
      entry.ttl = undefined;
    }

    this.layers[targetLayer].set(id, entry);
    this.emit("memory:promoted", entry, sourceLayer, targetLayer);

    return true;
  }

  /**
   * Run consolidation loop
   */
  async consolidate(): Promise<ConsolidationResult> {
    const startTime = Date.now();
    this.emit("consolidation:start");

    const result: ConsolidationResult = {
      promoted: 0,
      evicted: 0,
      merged: 0,
      duration: 0,
    };

    const now = Date.now();

    // 1. Evict expired memories
    for (const layer of ["working", "episodic"] as MemoryLayer[]) {
      for (const [id, entry] of this.layers[layer]) {
        if (entry.ttl && now - entry.createdAt.getTime() > entry.ttl) {
          this.layers[layer].delete(id);
          this.emit("memory:evicted", id, layer);
          result.evicted++;
        }
      }
    }

    // 2. Promote frequently accessed memories
    for (const layer of ["working", "episodic"] as MemoryLayer[]) {
      for (const entry of this.layers[layer].values()) {
        if (entry.accessCount >= this.config.promotionThreshold) {
          const oldLayer = entry.layer;
          this.checkPromotion(entry);
          if (entry.layer !== oldLayer) {
            result.promoted++;
          }
        }
      }
    }

    // 3. Merge similar memories in semantic/skill layers
    for (const layer of ["semantic", "skill"] as MemoryLayer[]) {
      const entries = Array.from(this.layers[layer].values());
      const toRemove: string[] = [];

      for (let i = 0; i < entries.length; i++) {
        if (toRemove.includes(entries[i].id)) continue;

        for (let j = i + 1; j < entries.length; j++) {
          if (toRemove.includes(entries[j].id)) continue;

          const similarity = this.calculateSimilarity(
            entries[i].content,
            entries[j].content
          );

          if (similarity >= this.config.similarityThreshold) {
            // Merge into the one with more access
            if (entries[i].accessCount >= entries[j].accessCount) {
              entries[i].accessCount += entries[j].accessCount;
              entries[i].importance = Math.max(
                entries[i].importance,
                entries[j].importance
              );
              toRemove.push(entries[j].id);
            } else {
              entries[j].accessCount += entries[i].accessCount;
              entries[j].importance = Math.max(
                entries[i].importance,
                entries[j].importance
              );
              toRemove.push(entries[i].id);
              break;
            }
            result.merged++;
          }
        }
      }

      for (const id of toRemove) {
        this.layers[layer].delete(id);
      }
    }

    result.duration = Date.now() - startTime;
    this.emit("consolidation:complete", result);

    return result;
  }

  /**
   * Start automatic consolidation
   */
  startConsolidation(): void {
    if (this.consolidationTimer) return;

    this.consolidationTimer = setInterval(() => {
      this.consolidate().catch(console.error);
    }, this.config.consolidationInterval);
  }

  /**
   * Stop automatic consolidation
   */
  stopConsolidation(): void {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
      this.consolidationTimer = null;
    }
  }

  /**
   * Get memory by ID
   */
  get(id: string): MemoryEntry | null {
    for (const map of Object.values(this.layers)) {
      if (map.has(id)) {
        const entry = map.get(id)!;
        entry.accessCount++;
        entry.lastAccessedAt = new Date();
        return entry;
      }
    }
    return null;
  }

  /**
   * Delete a memory
   */
  delete(id: string): boolean {
    for (const [layer, map] of Object.entries(this.layers) as [
      MemoryLayer,
      Map<string, MemoryEntry>,
    ][]) {
      if (map.has(id)) {
        map.delete(id);
        this.emit("memory:evicted", id, layer);
        return true;
      }
    }
    return false;
  }

  /**
   * Get statistics
   */
  getStats(): {
    working: number;
    episodic: number;
    semantic: number;
    skill: number;
    total: number;
  } {
    return {
      working: this.layers.working.size,
      episodic: this.layers.episodic.size,
      semantic: this.layers.semantic.size,
      skill: this.layers.skill.size,
      total:
        this.layers.working.size +
        this.layers.episodic.size +
        this.layers.semantic.size +
        this.layers.skill.size,
    };
  }

  /**
   * Clear all memories
   */
  clear(layer?: MemoryLayer): void {
    if (layer) {
      this.layers[layer].clear();
    } else {
      for (const map of Object.values(this.layers)) {
        map.clear();
      }
    }
  }

  /**
   * Export memories for persistence
   */
  export(): Record<MemoryLayer, MemoryEntry[]> {
    return {
      working: Array.from(this.layers.working.values()),
      episodic: Array.from(this.layers.episodic.values()),
      semantic: Array.from(this.layers.semantic.values()),
      skill: Array.from(this.layers.skill.values()),
    };
  }

  /**
   * Import memories from persistence
   */
  import(data: Record<MemoryLayer, MemoryEntry[]>): void {
    for (const [layer, entries] of Object.entries(data) as [
      MemoryLayer,
      MemoryEntry[],
    ][]) {
      for (const entry of entries) {
        // Restore Date objects
        entry.createdAt = new Date(entry.createdAt);
        entry.lastAccessedAt = new Date(entry.lastAccessedAt);
        this.layers[layer].set(entry.id, entry);
      }
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: HierarchicalMemory | null = null;

export function getHierarchicalMemory(): HierarchicalMemory {
  if (!instance) {
    instance = new HierarchicalMemory();
  }
  return instance;
}

export function resetHierarchicalMemory(): void {
  if (instance) {
    instance.stopConsolidation();
  }
  instance = null;
}
