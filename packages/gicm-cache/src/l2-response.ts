import { simpleEmbed, cosineSimilarity } from "./embeddings.js";
import type { L2ResponseEntry } from "./types.js";

/**
 * L2 Semantic Response Cache
 *
 * Caches LLM responses by semantic similarity. If a similar query was asked before,
 * returns the cached response without calling the LLM.
 */
export class L2ResponseCache {
  private cache = new Map<string, L2ResponseEntry>();
  private hits = 0;
  private misses = 0;

  constructor(
    private ttlMinutes: number = 60,
    private maxEntries: number = 1000,
    private similarityThreshold: number = 0.85
  ) {}

  /**
   * Looks up a cached response for a semantically similar query.
   * Returns cached response if similarity above threshold, null otherwise.
   */
  lookup(query: string): string | null {
    const queryEmbedding = simpleEmbed(query);
    const now = new Date();

    let bestMatch: L2ResponseEntry | null = null;
    let bestSimilarity = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt < now) continue;

      const similarity = cosineSimilarity(queryEmbedding, entry.queryEmbedding);

      if (
        similarity > bestSimilarity &&
        similarity >= this.similarityThreshold
      ) {
        bestSimilarity = similarity;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      bestMatch.hits++;
      this.hits++;
      return bestMatch.response;
    }

    this.misses++;
    return null;
  }

  /**
   * Stores a query-response pair in the cache.
   */
  store(query: string, response: string, model: string): void {
    const queryHash = this.hashString(query);
    const queryEmbedding = simpleEmbed(query);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlMinutes * 60 * 1000);
    const tokens = this.estimateTokens(response);

    const entry: L2ResponseEntry = {
      queryHash,
      queryEmbedding,
      queryText: query,
      response,
      model,
      tokens,
      createdAt: now,
      expiresAt,
      hits: 0,
    };

    this.cache.set(queryHash, entry);
    this.evictIfNeeded();
  }

  /**
   * Removes expired entries.
   */
  evictExpired(): void {
    const now = new Date();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears all cached responses.
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Returns cache statistics.
   */
  getStats(): {
    entries: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      entries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  /**
   * Evicts least-recently-used entries if cache exceeds maxEntries.
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxEntries) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].hits - b[1].hits);

    const toRemove = entries.slice(0, entries.length - this.maxEntries);
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }
  }

  /**
   * Simple string hash function.
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Estimates tokens using character-based heuristic.
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
