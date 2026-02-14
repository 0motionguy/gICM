import { EventEmitter } from "events";
import type {
  MemoryConfig,
  MemoryEntry,
  MemoryLayer,
  MemoryType,
  SearchResult,
  FlushDecision,
  MemoryStats,
  MemoryEvents,
} from "./types.js";
import { MemoryConfigSchema } from "./types.js";
import { MemoryDatabase } from "./db.js";
import { simpleEmbed, cosineSimilarity } from "./embeddings.js";

interface RememberOptions {
  type?: MemoryType;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

interface SearchOptions {
  layers?: MemoryLayer[];
  limit?: number;
  threshold?: number;
}

/**
 * 4-layer memory engine for AI agents.
 * - Hot: In-memory, session-scoped recent context
 * - Warm: 7-day indexed memory with embeddings
 * - Cold: 90-day compressed summaries
 * - Archive: Permanent extracted facts
 */
export class MemoryEngine extends EventEmitter {
  private config: MemoryConfig;
  private db: MemoryDatabase;
  private hotLayer: Map<string, MemoryEntry> = new Map();

  constructor(config: Partial<MemoryConfig> = {}) {
    super();
    this.config = MemoryConfigSchema.parse(config);
    this.db = new MemoryDatabase(this.config.dbPath);
  }

  /**
   * Store a memory in the hot layer.
   */
  async remember(
    key: string,
    value: string,
    opts: RememberOptions = {}
  ): Promise<MemoryEntry> {
    const id = `${this.config.namespace}:${key}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    const tokens = this.estimateTokens(value);
    const embedding = simpleEmbed(value, this.config.embeddingDims);

    const entry: MemoryEntry = {
      id,
      key,
      value,
      layer: "hot",
      type: opts.type || "episode",
      namespace: this.config.namespace,
      embedding,
      metadata: opts.metadata || {},
      tokens,
      createdAt: now,
      updatedAt: now,
      expiresAt: opts.expiresAt,
      compressed: false,
    };

    this.hotLayer.set(id, entry);
    this.emit("memory:added", entry);

    // Auto-flush if hot layer is full
    if (this.shouldFlushHot()) {
      await this.flush();
    }

    return entry;
  }

  /**
   * Search across all memory layers with hybrid keyword + semantic scoring.
   */
  async search(
    query: string,
    opts: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      layers = ["hot", "warm", "cold", "archive"],
      limit = 10,
      threshold = 0.3,
    } = opts;

    const queryEmbedding = simpleEmbed(query, this.config.embeddingDims);
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search hot layer
    if (layers.includes("hot")) {
      for (const entry of this.hotLayer.values()) {
        const score = this.calculateScore(entry, queryLower, queryEmbedding);
        if (score >= threshold) {
          results.push({
            entry,
            score,
            matchType: this.getMatchType(entry, queryLower, queryEmbedding),
          });
        }
      }
    }

    // Search persistent layers
    const persistentLayers = layers.filter((l) => l !== "hot");
    if (persistentLayers.length > 0) {
      const dbEntries = this.db.search(
        query,
        this.config.namespace,
        persistentLayers,
        queryEmbedding
      );
      for (const entry of dbEntries) {
        const score = this.calculateScore(entry, queryLower, queryEmbedding);
        if (score >= threshold) {
          results.push({
            entry,
            score,
            matchType: this.getMatchType(entry, queryLower, queryEmbedding),
          });
        }
      }
    }

    // Sort by score descending and limit
    const sorted = results.sort((a, b) => b.score - a.score).slice(0, limit);

    this.emit("memory:searched", query, sorted);
    return sorted;
  }

  /**
   * Flush entries between layers based on age and capacity.
   */
  async flush(): Promise<void> {
    const now = new Date();

    // Hot → Warm: Move entries older than 5 minutes OR if hot is full
    const hotToWarm: MemoryEntry[] = [];
    for (const entry of this.hotLayer.values()) {
      const ageMinutes =
        (now.getTime() - entry.createdAt.getTime()) / 1000 / 60;
      if (ageMinutes > 5 || this.hotLayer.size >= this.config.hot.maxEntries) {
        hotToWarm.push(entry);
      }
    }

    if (hotToWarm.length > 0) {
      for (const entry of hotToWarm) {
        const warmEntry: MemoryEntry = {
          ...entry,
          layer: "warm",
          updatedAt: now,
        };
        this.db.insert(warmEntry);
        this.hotLayer.delete(entry.id);
      }

      this.emit("memory:flushed", {
        entriesToFlush: hotToWarm,
        targetLayer: "warm",
        reason: `Flushed ${hotToWarm.length} entries from hot to warm`,
      });
    }

    // Warm → Cold: Entries older than warm.maxAgeDays
    const warmEntries = this.db.getByLayer("warm", this.config.namespace);
    const warmToCold: MemoryEntry[] = [];
    for (const entry of warmEntries) {
      const ageDays =
        (now.getTime() - entry.createdAt.getTime()) / 1000 / 60 / 60 / 24;
      if (ageDays > this.config.warm.maxAgeDays) {
        warmToCold.push(entry);
      }
    }

    if (warmToCold.length > 0) {
      for (const entry of warmToCold) {
        const coldEntry: MemoryEntry = {
          ...entry,
          layer: "cold",
          value: this.compress(entry.value),
          compressed: true,
          updatedAt: now,
        };
        this.db.insert(coldEntry);
        this.db.delete(entry.id);
      }

      this.emit("memory:flushed", {
        entriesToFlush: warmToCold,
        targetLayer: "cold",
        reason: `Flushed ${warmToCold.length} entries from warm to cold`,
      });
    }

    // Cold → Archive: Entries older than cold.maxAgeDays
    const coldEntries = this.db.getByLayer("cold", this.config.namespace);
    const coldToArchive: MemoryEntry[] = [];
    for (const entry of coldEntries) {
      const ageDays =
        (now.getTime() - entry.createdAt.getTime()) / 1000 / 60 / 60 / 24;
      if (ageDays > this.config.cold.maxAgeDays) {
        coldToArchive.push(entry);
      }
    }

    if (coldToArchive.length > 0) {
      const facts = this.extractFacts(coldToArchive);
      for (const fact of facts) {
        const archiveEntry: MemoryEntry = {
          ...fact,
          layer: "archive",
          type: "fact",
          updatedAt: now,
        };
        this.db.insert(archiveEntry);
      }

      // Delete old cold entries
      for (const entry of coldToArchive) {
        this.db.delete(entry.id);
      }

      this.emit("memory:flushed", {
        entriesToFlush: coldToArchive,
        targetLayer: "archive",
        reason: `Flushed ${coldToArchive.length} entries from cold to archive`,
      });
    }

    // Compact each layer if over capacity
    await this.compact();
  }

  /**
   * Get memory statistics across all layers.
   */
  getStats(): MemoryStats {
    const dbStats = this.db.getStats(this.config.namespace);

    // Add hot layer stats
    dbStats.byLayer.hot = this.hotLayer.size;
    dbStats.totalEntries += this.hotLayer.size;

    let hotTokens = 0;
    let oldestHot: Date | undefined;
    let newestHot: Date | undefined;

    for (const entry of this.hotLayer.values()) {
      hotTokens += entry.tokens;
      if (!oldestHot || entry.createdAt < oldestHot) {
        oldestHot = entry.createdAt;
      }
      if (!newestHot || entry.createdAt > newestHot) {
        newestHot = entry.createdAt;
      }
    }

    dbStats.totalTokens += hotTokens;

    if (
      oldestHot &&
      (!dbStats.oldestEntry || oldestHot < dbStats.oldestEntry)
    ) {
      dbStats.oldestEntry = oldestHot;
    }
    if (
      newestHot &&
      (!dbStats.newestEntry || newestHot > dbStats.newestEntry)
    ) {
      dbStats.newestEntry = newestHot;
    }

    return dbStats;
  }

  /**
   * Compress text for cold layer storage.
   */
  compress(text: string): string {
    if (text.length <= 200) return text;
    return text.slice(0, 200) + "...";
  }

  /**
   * Extract key facts from entries for archive layer.
   */
  extractFacts(entries: MemoryEntry[]): MemoryEntry[] {
    return entries.map((entry) => {
      // Extract first sentence or first 100 chars
      const sentences = entry.value.split(/[.!?]+/);
      const firstSentence = sentences[0]?.trim() || "";
      const fact = firstSentence.slice(0, 100);

      return {
        ...entry,
        value: `${entry.key}: ${fact}`,
        compressed: true,
      };
    });
  }

  /**
   * Compact layers to stay within capacity limits.
   */
  private async compact(): Promise<void> {
    // Compact warm layer
    const warmDeleted = this.db.compact(
      "warm",
      this.config.namespace,
      this.config.warm.maxEntries
    );
    if (warmDeleted > 0) {
      this.emit("memory:compacted", "warm", warmDeleted);
    }

    // Compact cold layer
    const coldDeleted = this.db.compact(
      "cold",
      this.config.namespace,
      this.config.cold.maxEntries
    );
    if (coldDeleted > 0) {
      this.emit("memory:compacted", "cold", coldDeleted);
    }

    // Compact archive layer
    const archiveDeleted = this.db.compact(
      "archive",
      this.config.namespace,
      this.config.archive.maxEntries
    );
    if (archiveDeleted > 0) {
      this.emit("memory:compacted", "archive", archiveDeleted);
    }
  }

  /**
   * Check if hot layer should be flushed.
   */
  private shouldFlushHot(): boolean {
    if (this.hotLayer.size >= this.config.hot.maxEntries) {
      return true;
    }

    let totalTokens = 0;
    for (const entry of this.hotLayer.values()) {
      totalTokens += entry.tokens;
    }

    return totalTokens >= this.config.hot.maxTokens;
  }

  /**
   * Calculate hybrid score (keyword 60% + semantic 40%).
   */
  private calculateScore(
    entry: MemoryEntry,
    queryLower: string,
    queryEmbedding: number[]
  ): number {
    // Keyword score
    const keywordScore = this.keywordScore(entry, queryLower);

    // Semantic score
    const semanticScore = entry.embedding
      ? cosineSimilarity(queryEmbedding, entry.embedding)
      : 0;

    // Hybrid: 60% keyword, 40% semantic
    return keywordScore * 0.6 + semanticScore * 0.4;
  }

  /**
   * Calculate keyword match score using word boundaries.
   */
  private keywordScore(entry: MemoryEntry, queryLower: string): number {
    const keyLower = entry.key.toLowerCase();
    const valueLower = entry.value.toLowerCase();

    // Exact match
    if (keyLower === queryLower || valueLower === queryLower) {
      return 1.0;
    }

    // Word boundary match
    const queryWords = queryLower.split(/\s+/);
    let matchCount = 0;

    for (const word of queryWords) {
      const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, "i");
      if (regex.test(keyLower) || regex.test(valueLower)) {
        matchCount++;
      }
    }

    if (matchCount === queryWords.length) {
      return 0.8; // All words matched
    }

    if (matchCount > 0) {
      return 0.5 * (matchCount / queryWords.length); // Partial match
    }

    // Substring match (fallback)
    if (keyLower.includes(queryLower) || valueLower.includes(queryLower)) {
      return 0.3;
    }

    return 0;
  }

  /**
   * Determine match type for result.
   */
  private getMatchType(
    entry: MemoryEntry,
    queryLower: string,
    queryEmbedding: number[]
  ): "semantic" | "keyword" | "exact" {
    const keyLower = entry.key.toLowerCase();
    const valueLower = entry.value.toLowerCase();

    if (keyLower === queryLower || valueLower === queryLower) {
      return "exact";
    }

    const semanticScore = entry.embedding
      ? cosineSimilarity(queryEmbedding, entry.embedding)
      : 0;
    const keywordScore = this.keywordScore(entry, queryLower);

    return semanticScore > keywordScore ? "semantic" : "keyword";
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 chars).
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Escape special regex characters.
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Close database connection.
   */
  close(): void {
    this.db.close();
  }
}

// Type-safe event emitter
export interface MemoryEngine {
  on<K extends keyof MemoryEvents>(
    event: K,
    listener: (...args: MemoryEvents[K]) => void
  ): this;
  emit<K extends keyof MemoryEvents>(
    event: K,
    ...args: MemoryEvents[K]
  ): boolean;
}
