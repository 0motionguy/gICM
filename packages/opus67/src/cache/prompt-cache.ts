/**
 * OPUS 67 v5.0 - Prompt Cache Manager
 *
 * Implements Claude Opus 4.5's ephemeral prompt caching for 90% cost savings.
 * Caches:
 * - THE DOOR prompt (~50K tokens)
 * - Loaded skills (per-session)
 * - MCP tool definitions
 * - User memory context
 *
 * Caching Strategy:
 * - cache_control: { type: 'ephemeral' } = 5-minute TTL
 * - Cached tokens billed at $0.50/M (90% cheaper than $5/M input rate)
 * - Cache hit = $0.025 per query, Cache miss = $0.25 per query
 */

import Anthropic from "@anthropic-ai/sdk";
import { EventEmitter } from "eventemitter3";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types
export interface CacheConfig {
  enableCaching: boolean;
  cacheTTLMinutes?: number; // Ephemeral cache TTL (default 5)
  theDoorPath?: string;
  anthropicApiKey?: string;
}

export interface CacheStatistics {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number; // 0-1
  totalSaved: number; // Dollars saved
  cachedContentSize: number; // Tokens
  lastCacheRefresh: Date | null;
}

export interface CachedPromptRequest {
  query: string;
  loadedSkills?: string[]; // IDs of skills to include
  mcpTools?: string[]; // MCP tool definitions
  userContext?: string; // User-specific memory
  systemPrompt?: string; // Additional system instructions
}

export interface CachedPromptResponse {
  content: string;
  cacheHit: boolean;
  tokensUsed: {
    input: number;
    output: number;
    cached: number; // Tokens served from cache
  };
  cost: number;
  latencyMs: number;
}

interface CacheEvents {
  "cache:hit": (tokens: number, saved: number) => void;
  "cache:miss": () => void;
  "cache:refresh": (size: number) => void;
  "cost:saved": (amount: number) => void;
}

/**
 * Pricing for Opus 4.5 with caching
 * Source: Anthropic pricing page (Jan 2025)
 */
const OPUS_45_CACHE_PRICING = {
  input: 3.0, // $3/M input tokens
  output: 15.0, // $15/M output tokens
  cachedInput: 0.3, // $0.30/M cached tokens (90% savings)
};

/**
 * PromptCacheManager - Manages ephemeral prompt caching
 */
export class PromptCacheManager extends EventEmitter<CacheEvents> {
  private config: Required<CacheConfig>;
  private anthropic: Anthropic | null = null;
  private theDoorPrompt: string | null = null;
  private skillsCache: Map<string, string> = new Map();
  private stats: CacheStatistics;

  constructor(config?: CacheConfig) {
    super();

    this.config = {
      enableCaching: config?.enableCaching ?? true,
      cacheTTLMinutes: config?.cacheTTLMinutes ?? 5,
      theDoorPath: config?.theDoorPath ?? this.getDefaultDoorPath(),
      anthropicApiKey:
        config?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? "",
    };

    // Initialize stats
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalSaved: 0,
      cachedContentSize: 0,
      lastCacheRefresh: null,
    };

    // Initialize Anthropic client
    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropicApiKey,
      });
    }

    // Load THE DOOR prompt
    this.loadTheDoorPrompt();
  }

  /**
   * Get default THE DOOR prompt path
   */
  private getDefaultDoorPath(): string {
    return join(__dirname, "..", "..", "THE_DOOR.md");
  }

  /**
   * Load THE DOOR prompt from file
   */
  private loadTheDoorPrompt(): void {
    try {
      if (existsSync(this.config.theDoorPath)) {
        this.theDoorPrompt = readFileSync(this.config.theDoorPath, "utf-8");

        // Calculate size
        const tokens = Math.ceil(this.theDoorPrompt.length / 4);
        this.stats.cachedContentSize = tokens;
        this.stats.lastCacheRefresh = new Date();

        this.emit("cache:refresh", tokens);
      } else {
        console.warn(
          "[PromptCache] THE DOOR prompt not found at:",
          this.config.theDoorPath
        );
      }
    } catch (error) {
      console.error("[PromptCache] Failed to load THE DOOR prompt:", error);
    }
  }

  /**
   * Load a skill prompt into cache
   */
  async loadSkill(skillId: string, skillPath: string): Promise<void> {
    if (!existsSync(skillPath)) {
      throw new Error(`Skill file not found: ${skillPath}`);
    }

    const skillContent = readFileSync(skillPath, "utf-8");
    this.skillsCache.set(skillId, skillContent);

    // Update cached size
    const tokens = Math.ceil(skillContent.length / 4);
    this.stats.cachedContentSize += tokens;
  }

  /**
   * Build cached prompt messages for Anthropic API
   */
  private buildCachedMessages(
    request: CachedPromptRequest
  ): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    // Build system message with cache control
    const systemBlocks: Array<Anthropic.TextBlockParam> = [];

    // Add THE DOOR prompt (always cached)
    if (this.theDoorPrompt) {
      systemBlocks.push({
        type: "text",
        text: this.theDoorPrompt,
        cache_control: { type: "ephemeral" },
      } as any);
    }

    // Add loaded skills (cached if provided)
    if (request.loadedSkills && request.loadedSkills.length > 0) {
      const skillsText = request.loadedSkills
        .map((id) => this.skillsCache.get(id))
        .filter(Boolean)
        .join("\n\n---\n\n");

      if (skillsText) {
        systemBlocks.push({
          type: "text",
          text: `## LOADED SKILLS\n\n${skillsText}`,
          cache_control: { type: "ephemeral" },
        } as any);
      }
    }

    // Add MCP tool definitions (cached if provided)
    if (request.mcpTools && request.mcpTools.length > 0) {
      systemBlocks.push({
        type: "text",
        text: `## AVAILABLE MCP TOOLS\n\n${request.mcpTools.join("\n\n")}`,
        cache_control: { type: "ephemeral" },
      } as any);
    }

    // Add user context (cached if provided)
    if (request.userContext) {
      systemBlocks.push({
        type: "text",
        text: `## USER CONTEXT\n\n${request.userContext}`,
        cache_control: { type: "ephemeral" },
      } as any);
    }

    // Add additional system prompt (not cached - frequently changes)
    if (request.systemPrompt) {
      systemBlocks.push({
        type: "text",
        text: request.systemPrompt,
      });
    }

    // Build system message
    if (systemBlocks.length > 0) {
      messages.push({
        role: "user",
        content: systemBlocks,
      });

      // Add acknowledgment (required for system-like messages)
      messages.push({
        role: "assistant",
        content:
          "Understood. I have loaded the OPUS 67 configuration, skills, tools, and user context. Ready to assist.",
      });
    }

    // Add user query
    messages.push({
      role: "user",
      content: request.query,
    });

    return messages;
  }

  /**
   * Execute a query with prompt caching
   */
  async query(request: CachedPromptRequest): Promise<CachedPromptResponse> {
    if (!this.anthropic) {
      throw new Error("[PromptCache] Anthropic API key not configured");
    }

    if (!this.config.enableCaching) {
      // Fall back to non-cached query
      return this.queryWithoutCache(request);
    }

    const startTime = performance.now();
    this.stats.totalQueries++;

    // Build cached messages
    const messages = this.buildCachedMessages(request);

    // Make API call
    const response = await this.anthropic.messages.create({
      model: "claude-opus-4-5-20250929",
      max_tokens: 4096,
      messages,
    });

    // Extract response content
    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
    }

    // Calculate metrics
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cachedTokens =
      "cache_read_input_tokens" in response.usage
        ? ((response.usage as any).cache_read_input_tokens ?? 0)
        : 0;
    const cacheHit = cachedTokens > 0;

    // Update stats
    if (cacheHit) {
      this.stats.cacheHits++;
      this.emit("cache:hit", cachedTokens, this.calculateSavings(cachedTokens));
    } else {
      this.stats.cacheMisses++;
      this.emit("cache:miss");
    }

    this.stats.hitRate = this.stats.cacheHits / this.stats.totalQueries;

    // Calculate cost
    const cost = this.calculateCost(inputTokens, outputTokens, cachedTokens);

    // Calculate savings
    if (cacheHit) {
      const savings = this.calculateSavings(cachedTokens);
      this.stats.totalSaved += savings;
      this.emit("cost:saved", savings);
    }

    const latencyMs = performance.now() - startTime;

    return {
      content,
      cacheHit,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        cached: cachedTokens,
      },
      cost,
      latencyMs,
    };
  }

  /**
   * Query without caching (fallback)
   */
  private async queryWithoutCache(
    request: CachedPromptRequest
  ): Promise<CachedPromptResponse> {
    if (!this.anthropic) {
      throw new Error("[PromptCache] Anthropic API key not configured");
    }

    const startTime = performance.now();

    const response = await this.anthropic.messages.create({
      model: "claude-opus-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: request.query,
        },
      ],
    });

    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
    }

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = this.calculateCost(inputTokens, outputTokens, 0);
    const latencyMs = performance.now() - startTime;

    return {
      content,
      cacheHit: false,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        cached: 0,
      },
      cost,
      latencyMs,
    };
  }

  /**
   * Calculate cost with caching
   */
  private calculateCost(
    inputTokens: number,
    outputTokens: number,
    cachedTokens: number
  ): number {
    const uncachedInput = inputTokens - cachedTokens;

    const inputCost = (uncachedInput / 1_000_000) * OPUS_45_CACHE_PRICING.input;
    const cachedCost =
      (cachedTokens / 1_000_000) * OPUS_45_CACHE_PRICING.cachedInput;
    const outputCost =
      (outputTokens / 1_000_000) * OPUS_45_CACHE_PRICING.output;

    return inputCost + cachedCost + outputCost;
  }

  /**
   * Calculate savings from cache hit
   */
  private calculateSavings(cachedTokens: number): number {
    const fullCost = (cachedTokens / 1_000_000) * OPUS_45_CACHE_PRICING.input;
    const cachedCost =
      (cachedTokens / 1_000_000) * OPUS_45_CACHE_PRICING.cachedInput;
    return fullCost - cachedCost;
  }

  /**
   * Get cache statistics
   */
  getStats(): Readonly<CacheStatistics> {
    return Object.freeze({ ...this.stats });
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalQueries: this.stats.totalQueries,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalSaved: 0,
      cachedContentSize: this.stats.cachedContentSize,
      lastCacheRefresh: this.stats.lastCacheRefresh,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<CacheConfig>> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize Anthropic client if API key changed
    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    }

    // Reload THE DOOR if path changed
    if (config.theDoorPath) {
      this.loadTheDoorPrompt();
    }
  }

  /**
   * Format statistics for display
   */
  formatStats(): string {
    const stats = this.stats;

    return `
╔══════════════════════════════════════════════════════════════════╗
║                  PROMPT CACHE STATISTICS                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  CACHE PERFORMANCE                                               ║
║  ────────────────────────────────────────────────────────────    ║
║  Total Queries:    ${String(stats.totalQueries).padEnd(45)} ║
║  Cache Hits:       ${String(stats.cacheHits).padEnd(45)} ║
║  Cache Misses:     ${String(stats.cacheMisses).padEnd(45)} ║
║  Hit Rate:         ${(stats.hitRate * 100).toFixed(1).padEnd(43)}% ║
║                                                                  ║
║  COST SAVINGS                                                    ║
║  ────────────────────────────────────────────────────────────    ║
║  Total Saved:      $${stats.totalSaved.toFixed(2).padEnd(44)} ║
║  Cached Size:      ${String(stats.cachedContentSize).padEnd(43)} tokens ║
║  Last Refresh:     ${(stats.lastCacheRefresh?.toLocaleString() ?? "Never").padEnd(44)} ║
║                                                                  ║
║  STATUS                                                          ║
║  ────────────────────────────────────────────────────────────    ║
║  Caching:          ${(this.config.enableCaching ? "✅ ENABLED" : "❌ DISABLED").padEnd(47)} ║
║  TTL:              ${String(this.config.cacheTTLMinutes).padEnd(51)} min ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝`;
  }
}

/**
 * Factory function
 */
export function createPromptCache(config?: CacheConfig): PromptCacheManager {
  return new PromptCacheManager(config);
}

/**
 * Global singleton (optional)
 */
let globalCache: PromptCacheManager | null = null;

export function getPromptCache(config?: CacheConfig): PromptCacheManager {
  if (!globalCache) {
    globalCache = new PromptCacheManager(config);
  }
  return globalCache;
}
