---
name: gicm-cache
description: >
  3-layer prompt caching for AI agents. L1 prefix cache (90% input savings),
  L2 semantic response cache, L3 tool result cache. Up to 92% cost reduction.
user-invocable: true
metadata:
  openclaw:
    emoji: "💾"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/cache"
        label: "Install gICM Cache"
---

# @gicm/cache

3-layer prompt caching system for up to 90% cost reduction.

## Cache Layers

| Layer | What                          | TTL    | Savings                |
| ----- | ----------------------------- | ------ | ---------------------- |
| L1    | System prompts, skills, tools | 5 min  | 90% input tokens       |
| L2    | Similar query responses       | 1 hour | 100% (cached response) |
| L3    | Tool call results             | 30 min | Avoids redundant calls |

## Commands

- `cache stats` — Show hit rates and savings
- `cache clear [layer]` — Clear cache (L1/L2/L3/all)
- `cache warm <skills...>` — Pre-cache skill content

## Usage

```typescript
import { CacheManager } from "@gicm/cache";

const cache = new CacheManager({
  l2: { similarityThreshold: 0.85, ttlMinutes: 60 },
  l3: { defaultTtlMinutes: 30 },
});

// L1: Cache system prompt
cache.addPrefix("You are a helpful assistant...", "system");

// L2: Check for cached response
const cached = cache.lookupResponse("How do I use TypeScript generics?");
if (!cached) {
  const response = await llm.complete(query);
  cache.storeResponse(query, response, "claude-3-haiku");
}

// L3: Cache tool results
const fileContent = cache.lookupTool("readFile", { path: "src/index.ts" });
```

## Architecture

### L1 Prefix Cache

- Uses Anthropic's `cache_control: { type: "ephemeral" }` markers
- Caches static content: system prompts, skill definitions, tool schemas
- Provides 90% savings on input tokens
- 5-minute TTL (Anthropic managed)

### L2 Response Cache

- Semantic similarity matching using 64-dim embeddings
- Threshold: 0.85 (configurable)
- Returns cached responses for similar queries
- Configurable TTL (default: 1 hour)

### L3 Tool Cache

- Caches deterministic tool call results
- Per-tool TTL configuration
- Hash-based key generation from inputs
- Avoids redundant file reads, API calls, etc.

## Cost Savings Example

For a typical agent session with Claude Opus 4.6:

```
Without Cache:
- 50k system tokens × $15/M = $0.75
- 10k repeat queries × $15/M = $0.15
- 5k tool calls × $15/M = $0.075
Total: $0.975

With Cache:
- 50k L1 cached × $1.5/M = $0.075
- 10k L2 hits = $0 (no LLM call)
- 5k L3 hits = $0 (no execution)
Total: $0.075

Savings: $0.90 (92%)
```

## Events

```typescript
cache.on("cache:hit", (layer, key) => {
  console.log(`Cache hit: ${layer} - ${key}`);
});

cache.on("cache:miss", (layer, key) => {
  console.log(`Cache miss: ${layer} - ${key}`);
});

cache.on("cache:save", (dollars) => {
  console.log(`Saved $${dollars.toFixed(4)}`);
});
```

## Configuration

```typescript
const config = {
  l1: {
    enabled: true,
    ttlMinutes: 5,
    maxTokens: 100_000,
  },
  l2: {
    enabled: true,
    ttlMinutes: 60,
    maxEntries: 1000,
    similarityThreshold: 0.85,
  },
  l3: {
    enabled: true,
    defaultTtlMinutes: 30,
    maxEntries: 5000,
  },
};

const cache = new CacheManager(config);
```

## Best Practices

1. **L1**: Add all static content that rarely changes (system prompts, skill content, tool schemas)
2. **L2**: Use for repeated question patterns across sessions
3. **L3**: Register deterministic tools with appropriate TTLs:
   - File reads: 5-10 minutes
   - Static APIs: 30-60 minutes
   - Dynamic APIs: 1-5 minutes

## Stats Monitoring

```typescript
const stats = cache.getStats();

console.log(`L1: ${stats.l1.entries} blocks, ${stats.l1.tokens} tokens`);
console.log(`L2: ${stats.l2.hitRate * 100}% hit rate`);
console.log(`L3: ${stats.l3.hitRate * 100}% hit rate`);
console.log(`Total saved: $${stats.totalSaved.toFixed(2)}`);
```
