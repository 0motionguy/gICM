import { EventEmitter } from "events";
import { L1PrefixCache } from "./l1-prefix.js";
import { L2ResponseCache } from "./l2-response.js";
import { L3ToolCache } from "./l3-tool.js";
import { CacheConfigSchema } from "./types.js";
import type {
  CacheConfig,
  CacheLayer,
  CacheStats,
  L1PrefixBlock,
} from "./types.js";

/**
 * Pricing data for cost estimation (per million tokens).
 */
const CACHE_PRICING = {
  "anthropic/claude-3-haiku": { input: 0.25, cached: 0.025, output: 1.25 },
  "anthropic/claude-sonnet-4.5": { input: 3.0, cached: 0.3, output: 15.0 },
  "anthropic/claude-opus-4.6": { input: 15.0, cached: 1.5, output: 75.0 },
};

/**
 * Main Cache Manager
 *
 * Orchestrates all three cache layers (L1 prefix, L2 response, L3 tool).
 * Provides unified interface and event emissions for monitoring.
 */
export class CacheManager extends EventEmitter {
  private l1: L1PrefixCache;
  private l2: L2ResponseCache;
  private l3: L3ToolCache;
  private config: CacheConfig;
  private totalSavings = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    super();

    this.config = CacheConfigSchema.parse(config);

    this.l1 = new L1PrefixCache(this.config.l1.maxTokens);
    this.l2 = new L2ResponseCache(
      this.config.l2.ttlMinutes,
      this.config.l2.maxEntries,
      this.config.l2.similarityThreshold
    );
    this.l3 = new L3ToolCache(
      this.config.l3.defaultTtlMinutes,
      this.config.l3.maxEntries
    );
  }

  /**
   * L1: Adds a prefix block to the cache.
   */
  addPrefix(content: string, type: L1PrefixBlock["type"]): string {
    if (!this.config.l1.enabled) return "";
    return this.l1.addBlock(content, type);
  }

  /**
   * L1: Gets all prefix blocks.
   */
  getPrefixBlocks(): L1PrefixBlock[] {
    return this.l1.getBlocks();
  }

  /**
   * L1: Builds cache control messages for Anthropic API.
   */
  buildCacheControlMessages(): Array<{
    type: string;
    text: string;
    cache_control?: { type: string };
  }> {
    return this.l1.buildCacheControlMessages();
  }

  /**
   * L2: Looks up a cached response for a query.
   */
  lookupResponse(query: string): string | null {
    if (!this.config.l2.enabled) return null;

    const result = this.l2.lookup(query);

    if (result) {
      this.emit("cache:hit", "L2", query);
    } else {
      this.emit("cache:miss", "L2", query);
    }

    return result;
  }

  /**
   * L2: Stores a response in the cache.
   */
  storeResponse(query: string, response: string, model: string): void {
    if (!this.config.l2.enabled) return;
    this.l2.store(query, response, model);
  }

  /**
   * L3: Looks up a cached tool result.
   */
  lookupTool(toolName: string, inputs: Record<string, unknown>): string | null {
    if (!this.config.l3.enabled) return null;

    const result = this.l3.lookup(toolName, inputs);

    if (result) {
      this.emit("cache:hit", "L3", toolName);
    } else {
      this.emit("cache:miss", "L3", toolName);
    }

    return result;
  }

  /**
   * L3: Stores a tool result in the cache.
   */
  storeTool(
    toolName: string,
    inputs: Record<string, unknown>,
    result: string,
    ttlMinutes?: number
  ): void {
    if (!this.config.l3.enabled) return;
    this.l3.store(toolName, inputs, result, ttlMinutes);
  }

  /**
   * L3: Registers a tool with specific TTL.
   */
  registerTool(toolName: string, ttlMinutes: number): void {
    this.l3.registerTool(toolName, ttlMinutes);
  }

  /**
   * Returns aggregated statistics across all cache layers.
   */
  getStats(): CacheStats {
    const l2Stats = this.l2.getStats();
    const l3Stats = this.l3.getStats();

    return {
      l1: {
        entries: this.l1.getEntryCount(),
        tokens: this.l1.getTotalTokens(),
        hitRate: 0, // L1 is always a hit when enabled
      },
      l2: l2Stats,
      l3: l3Stats,
      totalSaved: this.totalSavings,
    };
  }

  /**
   * Calculates cost savings from using cached tokens.
   *
   * @param cachedTokens Number of tokens served from cache
   * @param model Model name (e.g., "anthropic/claude-3-haiku")
   * @returns Estimated dollars saved
   */
  calculateSavings(cachedTokens: number, model: string): number {
    const pricing = CACHE_PRICING[model as keyof typeof CACHE_PRICING];
    if (!pricing) return 0;

    const uncachedCost = (cachedTokens / 1_000_000) * pricing.input;
    const cachedCost = (cachedTokens / 1_000_000) * pricing.cached;
    const savings = uncachedCost - cachedCost;

    this.totalSavings += savings;
    this.emit("cache:save", savings);

    return savings;
  }

  /**
   * Evicts expired entries from all layers.
   */
  evictExpired(): void {
    this.l2.evictExpired();
    this.l3.evictExpired();
  }

  /**
   * Clears cache for specific layer or all layers.
   */
  clear(layer?: CacheLayer): void {
    if (!layer || layer === "L1") {
      this.l1.clear();
      this.emit("cache:evict", "L1", "all");
    }

    if (!layer || layer === "L2") {
      this.l2.clear();
      this.emit("cache:evict", "L2", "all");
    }

    if (!layer || layer === "L3") {
      this.l3.clear();
      this.emit("cache:evict", "L3", "all");
    }

    if (!layer) {
      this.totalSavings = 0;
    }
  }
}
