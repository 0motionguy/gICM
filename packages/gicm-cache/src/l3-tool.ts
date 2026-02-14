import type { L3ToolEntry } from "./types.js";

/**
 * L3 Tool Result Cache
 *
 * Caches results of deterministic tool calls to avoid redundant executions.
 * Each tool can have its own TTL configuration.
 */
export class L3ToolCache {
  private cache = new Map<string, L3ToolEntry>();
  private toolTTLs = new Map<string, number>();
  private hits = 0;
  private misses = 0;

  constructor(
    private defaultTtlMinutes: number = 30,
    private maxEntries: number = 5000
  ) {}

  /**
   * Registers a tool with a specific TTL override.
   */
  registerTool(toolName: string, ttlMinutes: number): void {
    this.toolTTLs.set(toolName, ttlMinutes);
  }

  /**
   * Looks up a cached tool result.
   * Returns cached result if not expired, null otherwise.
   */
  lookup(toolName: string, inputs: Record<string, unknown>): string | null {
    const key = this.buildKey(toolName, inputs);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    const now = new Date();
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.result;
  }

  /**
   * Stores a tool result in the cache.
   */
  store(
    toolName: string,
    inputs: Record<string, unknown>,
    result: string,
    ttlMinutes?: number
  ): void {
    const key = this.buildKey(toolName, inputs);
    const inputHash = this.hashInputs(inputs);
    const now = new Date();

    const ttl =
      ttlMinutes ?? this.toolTTLs.get(toolName) ?? this.defaultTtlMinutes;
    const expiresAt = new Date(now.getTime() + ttl * 60 * 1000);

    const entry: L3ToolEntry = {
      toolName,
      inputHash,
      result,
      createdAt: now,
      expiresAt,
      hits: 0,
      ttlMinutes: ttl,
    };

    this.cache.set(key, entry);
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
   * Clears all cached tool results.
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
   * Builds a cache key from tool name and inputs.
   */
  private buildKey(toolName: string, inputs: Record<string, unknown>): string {
    const inputHash = this.hashInputs(inputs);
    return `${toolName}:${inputHash}`;
  }

  /**
   * Hashes tool inputs for cache key generation.
   */
  private hashInputs(inputs: Record<string, unknown>): string {
    const normalized = JSON.stringify(inputs, Object.keys(inputs).sort());
    return this.hashString(normalized);
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
}
