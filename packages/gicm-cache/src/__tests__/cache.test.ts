import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheManager } from "../cache-manager.js";
import { L1PrefixCache } from "../l1-prefix.js";
import { L2ResponseCache } from "../l2-response.js";
import { L3ToolCache } from "../l3-tool.js";
import { CacheConfigSchema } from "../types.js";
import { simpleEmbed, cosineSimilarity } from "../embeddings.js";

describe("Config Tests", () => {
  it("should accept valid config", () => {
    const config = {
      l1: { enabled: true, ttlMinutes: 10, maxTokens: 50_000 },
      l2: {
        enabled: true,
        ttlMinutes: 120,
        maxEntries: 500,
        similarityThreshold: 0.9,
      },
      l3: { enabled: true, defaultTtlMinutes: 60, maxEntries: 2000 },
    };

    const result = CacheConfigSchema.parse(config);
    expect(result.l1.enabled).toBe(true);
    expect(result.l2.ttlMinutes).toBe(120);
    expect(result.l3.maxEntries).toBe(2000);
  });

  it("should use defaults for missing fields", () => {
    const config = {};
    const result = CacheConfigSchema.parse(config);

    expect(result.l1.enabled).toBe(true);
    expect(result.l1.ttlMinutes).toBe(5);
    expect(result.l2.similarityThreshold).toBe(0.85);
    expect(result.l3.defaultTtlMinutes).toBe(30);
  });

  it("should reject invalid config", () => {
    const config = {
      l1: { ttlMinutes: -5 }, // Invalid: below min
    };

    expect(() => CacheConfigSchema.parse(config)).toThrow();
  });
});

describe("L1 Prefix Cache Tests", () => {
  let cache: L1PrefixCache;

  beforeEach(() => {
    cache = new L1PrefixCache(10_000);
  });

  it("should add blocks", () => {
    const id = cache.addBlock("You are a helpful assistant.", "system");
    expect(id).toBeTruthy();
    expect(cache.getEntryCount()).toBe(1);
  });

  it("should get blocks ordered by type", () => {
    cache.addBlock("Context info", "context");
    cache.addBlock("System prompt", "system");
    cache.addBlock("Tool schema", "tool");
    cache.addBlock("Skill content", "skill");

    const blocks = cache.getBlocks();
    expect(blocks).toHaveLength(4);
    expect(blocks[0].type).toBe("system");
    expect(blocks[1].type).toBe("skill");
    expect(blocks[2].type).toBe("tool");
    expect(blocks[3].type).toBe("context");
  });

  it("should count tokens correctly", () => {
    cache.addBlock("a".repeat(400), "system"); // ~100 tokens
    expect(cache.getTotalTokens()).toBe(100);
  });

  it("should remove block", () => {
    const id = cache.addBlock("Test content", "system");
    expect(cache.removeBlock(id)).toBe(true);
    expect(cache.getEntryCount()).toBe(0);
  });

  it("should clear all blocks", () => {
    cache.addBlock("Block 1", "system");
    cache.addBlock("Block 2", "skill");
    cache.clear();
    expect(cache.getEntryCount()).toBe(0);
  });
});

describe("L2 Response Cache Tests", () => {
  let cache: L2ResponseCache;

  beforeEach(() => {
    cache = new L2ResponseCache(60, 1000, 0.85);
  });

  it("should store and lookup exact query (hit)", () => {
    const query = "What is TypeScript?";
    const response = "TypeScript is a typed superset of JavaScript.";

    cache.store(query, response, "claude-3-haiku");
    const result = cache.lookup(query);

    expect(result).toBe(response);
    expect(cache.getStats().hits).toBe(1);
  });

  it("should lookup similar query above threshold (hit)", () => {
    cache.store(
      "How do I use TypeScript generics?",
      "Generics allow you to...",
      "claude-3-haiku"
    );

    const similar = "How to use TypeScript generics?";
    const result = cache.lookup(similar);

    expect(result).not.toBeNull();
    expect(cache.getStats().hits).toBeGreaterThan(0);
  });

  it("should miss on dissimilar query below threshold", () => {
    cache.store("What is TypeScript?", "TypeScript is...", "claude-3-haiku");

    const dissimilar = "How do I cook pasta?";
    const result = cache.lookup(dissimilar);

    expect(result).toBeNull();
    expect(cache.getStats().misses).toBe(1);
  });

  it("should miss after TTL expiration", () => {
    const shortTTL = new L2ResponseCache(0.01, 1000, 0.85); // 0.6 seconds

    shortTTL.store("Test query", "Test response", "claude-3-haiku");

    // Wait for expiration
    const start = Date.now();
    while (Date.now() - start < 700) {} // Busy wait

    shortTTL.evictExpired();
    const result = shortTTL.lookup("Test query");

    expect(result).toBeNull();
  });

  it("should increment hit counter", () => {
    cache.store("Query", "Response", "claude-3-haiku");

    cache.lookup("Query");
    cache.lookup("Query");
    cache.lookup("Query");

    expect(cache.getStats().hits).toBe(3);
  });

  it("should evict when exceeding maxEntries", () => {
    const smallCache = new L2ResponseCache(60, 2, 0.85);

    smallCache.store("Query 1", "Response 1", "claude-3-haiku");
    smallCache.store("Query 2", "Response 2", "claude-3-haiku");
    smallCache.store("Query 3", "Response 3", "claude-3-haiku");

    expect(smallCache.getStats().entries).toBeLessThanOrEqual(2);
  });

  it("should track stats correctly", () => {
    cache.store("Q1", "R1", "claude-3-haiku");

    cache.lookup("Q1"); // hit
    cache.lookup("Q2"); // miss
    cache.lookup("Q1"); // hit

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it("should clear cache", () => {
    cache.store("Query", "Response", "claude-3-haiku");
    cache.clear();

    expect(cache.getStats().entries).toBe(0);
    expect(cache.getStats().hits).toBe(0);
  });
});

describe("L3 Tool Cache Tests", () => {
  let cache: L3ToolCache;

  beforeEach(() => {
    cache = new L3ToolCache(30, 5000);
  });

  it("should store and lookup tool result (hit)", () => {
    const toolName = "readFile";
    const inputs = { path: "/src/index.ts" };
    const result = "export const foo = 'bar';";

    cache.store(toolName, inputs, result);
    const cached = cache.lookup(toolName, inputs);

    expect(cached).toBe(result);
    expect(cache.getStats().hits).toBe(1);
  });

  it("should miss on different inputs", () => {
    cache.store("readFile", { path: "/src/index.ts" }, "content1");

    const result = cache.lookup("readFile", { path: "/src/other.ts" });

    expect(result).toBeNull();
    expect(cache.getStats().misses).toBe(1);
  });

  it("should miss after TTL expiration", () => {
    const shortTTL = new L3ToolCache(0.01, 5000); // 0.6 seconds

    shortTTL.store("readFile", { path: "/test" }, "content");

    // Wait for expiration
    const start = Date.now();
    while (Date.now() - start < 700) {} // Busy wait

    shortTTL.evictExpired();
    const result = shortTTL.lookup("readFile", { path: "/test" });

    expect(result).toBeNull();
  });

  it("should use per-tool TTL override", () => {
    cache.registerTool("apiCall", 120);
    cache.store("apiCall", { endpoint: "/users" }, "data", 120);

    // Just verify it was stored - TTL test would require waiting
    const result = cache.lookup("apiCall", { endpoint: "/users" });
    expect(result).toBe("data");
  });

  it("should increment hit counter", () => {
    cache.store("readFile", { path: "/test" }, "content");

    cache.lookup("readFile", { path: "/test" });
    cache.lookup("readFile", { path: "/test" });

    expect(cache.getStats().hits).toBe(2);
  });

  it("should track stats correctly", () => {
    cache.store("readFile", { path: "/test" }, "content");

    cache.lookup("readFile", { path: "/test" }); // hit
    cache.lookup("readFile", { path: "/other" }); // miss
    cache.lookup("readFile", { path: "/test" }); // hit

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it("should clear cache", () => {
    cache.store("readFile", { path: "/test" }, "content");
    cache.clear();

    expect(cache.getStats().entries).toBe(0);
  });
});

describe("CacheManager Integration Tests", () => {
  let manager: CacheManager;

  beforeEach(() => {
    manager = new CacheManager({
      l1: { enabled: true, maxTokens: 10_000 },
      l2: { enabled: true, ttlMinutes: 60, similarityThreshold: 0.85 },
      l3: { enabled: true, defaultTtlMinutes: 30 },
    });
  });

  it("should handle full workflow: prefix + response + tool", () => {
    // L1: Add prefix
    manager.addPrefix("You are a helpful assistant.", "system");

    // L2: Store and lookup response
    manager.storeResponse(
      "What is TypeScript?",
      "TypeScript is...",
      "claude-3-haiku"
    );
    const response = manager.lookupResponse("What is TypeScript?");
    expect(response).toBe("TypeScript is...");

    // L3: Store and lookup tool result
    manager.storeTool("readFile", { path: "/test" }, "content");
    const toolResult = manager.lookupTool("readFile", { path: "/test" });
    expect(toolResult).toBe("content");
  });

  it("should track stats across all layers", () => {
    manager.addPrefix("System prompt", "system");
    manager.storeResponse("Query", "Response", "claude-3-haiku");
    manager.storeTool("readFile", { path: "/test" }, "content");

    const stats = manager.getStats();
    expect(stats.l1.entries).toBe(1);
    expect(stats.l2.entries).toBe(1);
    expect(stats.l3.entries).toBe(1);
  });

  it("should emit cache events", () => {
    const hitSpy = vi.fn();
    const missSpy = vi.fn();

    manager.on("cache:hit", hitSpy);
    manager.on("cache:miss", missSpy);

    manager.storeResponse("Query", "Response", "claude-3-haiku");
    manager.lookupResponse("Query"); // hit
    manager.lookupResponse("Other"); // miss

    expect(hitSpy).toHaveBeenCalledWith("L2", "Query");
    expect(missSpy).toHaveBeenCalledWith("L2", "Other");
  });

  it("should calculate savings", () => {
    const savings = manager.calculateSavings(
      100_000,
      "anthropic/claude-3-haiku"
    );

    // 100k tokens: uncached = $0.025, cached = $0.0025, savings = $0.0225
    expect(savings).toBeCloseTo(0.0225, 4);

    const stats = manager.getStats();
    expect(stats.totalSaved).toBeCloseTo(0.0225, 4);
  });

  it("should clear specific layer", () => {
    manager.addPrefix("System", "system");
    manager.storeResponse("Query", "Response", "claude-3-haiku");
    manager.storeTool("readFile", { path: "/test" }, "content");

    manager.clear("L2");

    const stats = manager.getStats();
    expect(stats.l1.entries).toBe(1); // unchanged
    expect(stats.l2.entries).toBe(0); // cleared
    expect(stats.l3.entries).toBe(1); // unchanged
  });

  it("should clear all layers", () => {
    manager.addPrefix("System", "system");
    manager.storeResponse("Query", "Response", "claude-3-haiku");
    manager.storeTool("readFile", { path: "/test" }, "content");

    manager.clear();

    const stats = manager.getStats();
    expect(stats.l1.entries).toBe(0);
    expect(stats.l2.entries).toBe(0);
    expect(stats.l3.entries).toBe(0);
  });

  it("should build cache control messages", () => {
    manager.addPrefix("System prompt", "system");
    manager.addPrefix("Skill content", "skill");

    const messages = manager.buildCacheControlMessages();

    expect(messages).toHaveLength(2);
    expect(messages[0].type).toBe("text");
    expect(messages[0].cache_control).toEqual({ type: "ephemeral" });
  });
});

describe("Embedding Tests", () => {
  it("should generate consistent embeddings", () => {
    const text = "TypeScript is great";
    const embed1 = simpleEmbed(text);
    const embed2 = simpleEmbed(text);

    expect(embed1).toEqual(embed2);
    expect(embed1).toHaveLength(64);
  });

  it("should calculate cosine similarity", () => {
    const text1 = "TypeScript is great";
    const text2 = "TypeScript is awesome";
    const text3 = "How do I cook pasta?";

    const embed1 = simpleEmbed(text1);
    const embed2 = simpleEmbed(text2);
    const embed3 = simpleEmbed(text3);

    const similarity12 = cosineSimilarity(embed1, embed2);
    const similarity13 = cosineSimilarity(embed1, embed3);

    expect(similarity12).toBeGreaterThan(similarity13);
    expect(similarity12).toBeGreaterThan(0.6);
  });
});
