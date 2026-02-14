# @gicm/cache

3-layer prompt caching system for AI agents. Reduce LLM costs by up to 90% through intelligent caching at three levels.

## Installation

```bash
npm install @gicm/cache
# or
pnpm add @gicm/cache
```

## Quick Start

```typescript
import { CacheManager } from "@gicm/cache";

const cache = new CacheManager({
  l2: { similarityThreshold: 0.85, ttlMinutes: 60 },
  l3: { defaultTtlMinutes: 30 },
});

// L1: Cache system prompt for 90% input token savings
cache.addPrefix(
  "You are a helpful assistant that writes TypeScript code.",
  "system"
);

// L2: Cache LLM responses for similar queries
const cachedResponse = cache.lookupResponse(
  "How do I use TypeScript generics?"
);
if (!cachedResponse) {
  const response = await llm.complete(query);
  cache.storeResponse(query, response, "anthropic/claude-3-haiku");
}

// L3: Cache tool call results
const fileContent = cache.lookupTool("readFile", { path: "src/index.ts" });
if (!fileContent) {
  const content = await fs.readFile("src/index.ts", "utf-8");
  cache.storeTool("readFile", { path: "src/index.ts" }, content);
}
```

## Cache Layers

### L1: Prefix Cache

Uses Anthropic's `cache_control` to cache static prompt content:

- System prompts
- Skill definitions
- Tool schemas
- Context that rarely changes

**Savings**: 90% on input tokens (0.025 vs 0.25 per 1M tokens for Haiku)
**TTL**: 5 minutes (managed by Anthropic)

### L2: Semantic Response Cache

Caches LLM responses based on semantic similarity:

- Uses 64-dim embeddings for query matching
- Configurable similarity threshold (default: 0.85)
- Returns cached response if similar query found
- No LLM call needed = 100% savings

**TTL**: Configurable (default: 1 hour)

### L3: Tool Result Cache

Caches deterministic tool call results:

- File reads
- API responses
- Database queries
- Any deterministic operation

**TTL**: Configurable per-tool (default: 30 minutes)

## API

### CacheManager

```typescript
class CacheManager {
  constructor(config?: Partial<CacheConfig>);

  // L1: Prefix cache
  addPrefix(
    content: string,
    type: "system" | "skill" | "tool" | "context"
  ): string;
  getPrefixBlocks(): L1PrefixBlock[];
  buildCacheControlMessages(): Message[];

  // L2: Response cache
  lookupResponse(query: string): string | null;
  storeResponse(query: string, response: string, model: string): void;

  // L3: Tool cache
  lookupTool(toolName: string, inputs: Record<string, unknown>): string | null;
  storeTool(
    toolName: string,
    inputs: Record<string, unknown>,
    result: string,
    ttlMinutes?: number
  ): void;
  registerTool(toolName: string, ttlMinutes: number): void;

  // Stats & management
  getStats(): CacheStats;
  calculateSavings(cachedTokens: number, model: string): number;
  evictExpired(): void;
  clear(layer?: CacheLayer): void;
}
```

### Configuration

```typescript
interface CacheConfig {
  l1: {
    enabled: boolean; // Default: true
    ttlMinutes: number; // Default: 5 (fixed by Anthropic)
    maxTokens: number; // Default: 100,000
  };
  l2: {
    enabled: boolean; // Default: true
    ttlMinutes: number; // Default: 60
    maxEntries: number; // Default: 1000
    similarityThreshold: number; // Default: 0.85
  };
  l3: {
    enabled: boolean; // Default: true
    defaultTtlMinutes: number; // Default: 30
    maxEntries: number; // Default: 5000
  };
}
```

### Events

```typescript
cache.on("cache:hit", (layer: CacheLayer, key: string) => void);
cache.on("cache:miss", (layer: CacheLayer, key: string) => void);
cache.on("cache:evict", (layer: CacheLayer, key: string) => void);
cache.on("cache:save", (dollars: number) => void);
```

## Examples

### Full Integration

```typescript
import { CacheManager } from "@gicm/cache";

const cache = new CacheManager();

// Add static content to L1
cache.addPrefix("You are an expert TypeScript developer.", "system");
cache.addPrefix(skillContent, "skill");
cache.addPrefix(JSON.stringify(toolSchema), "tool");

// Build messages for Anthropic API
const messages = cache.buildCacheControlMessages();

// L2: Check for cached response
const query = "How do I implement a generic constraint?";
let response = cache.lookupResponse(query);

if (!response) {
  // Cache miss - call LLM
  response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    messages: [
      ...messages, // L1 cached content
      { role: "user", content: query },
    ],
  });

  cache.storeResponse(query, response.content, "anthropic/claude-3-haiku");
}

// L3: Cache tool results
cache.registerTool("readFile", 10); // 10 minute TTL

const toolInput = { path: "src/types.ts" };
let fileContent = cache.lookupTool("readFile", toolInput);

if (!fileContent) {
  fileContent = await fs.readFile(toolInput.path, "utf-8");
  cache.storeTool("readFile", toolInput, fileContent);
}
```

### Stats Monitoring

```typescript
const stats = cache.getStats();

console.log(`
L1 Prefix Cache:
  Entries: ${stats.l1.entries}
  Tokens: ${stats.l1.tokens.toLocaleString()}

L2 Response Cache:
  Entries: ${stats.l2.entries}
  Hit Rate: ${(stats.l2.hitRate * 100).toFixed(1)}%
  Hits: ${stats.l2.hits}
  Misses: ${stats.l2.misses}

L3 Tool Cache:
  Entries: ${stats.l3.entries}
  Hit Rate: ${(stats.l3.hitRate * 100).toFixed(1)}%
  Hits: ${stats.l3.hits}
  Misses: ${stats.l3.misses}

Total Savings: $${stats.totalSaved.toFixed(4)}
`);
```

### Cost Calculation

```typescript
// Calculate savings from L1 cache
const l1Tokens = cache.getStats().l1.tokens;
const l1Savings = cache.calculateSavings(l1Tokens, "anthropic/claude-opus-4.6");

console.log(`L1 saved $${l1Savings.toFixed(4)} on ${l1Tokens} tokens`);
```

## Cost Savings Example

For a typical agent session with Claude Opus 4.6 ($15 input / $75 output per 1M tokens):

| Scenario           | Without Cache | With Cache   | Savings         |
| ------------------ | ------------- | ------------ | --------------- |
| 50k system tokens  | $0.75         | $0.075 (L1)  | $0.675 (90%)    |
| 10k repeat queries | $0.15         | $0 (L2 hits) | $0.15 (100%)    |
| 5k tool calls      | $0.075        | $0 (L3 hits) | $0.075 (100%)   |
| **Total**          | **$0.975**    | **$0.075**   | **$0.90 (92%)** |

## Best Practices

1. **L1**: Add all static content early in the conversation
   - System prompts
   - Skill definitions
   - Tool schemas
   - Any context that doesn't change per request

2. **L2**: Best for agents with repeated question patterns
   - User support bots
   - Documentation assistants
   - Code explanation agents

3. **L3**: Register tools with appropriate TTLs
   - File reads: 5-10 minutes
   - Static APIs: 30-60 minutes
   - Dynamic APIs: 1-5 minutes
   - Never cache non-deterministic operations

4. **Monitoring**: Check stats periodically and adjust thresholds
   - Low L2 hit rate? Increase `similarityThreshold`
   - High L3 misses? Increase TTLs
   - Memory issues? Reduce `maxEntries`

## TypeScript Support

Full TypeScript support with strict type checking:

```typescript
import type { CacheConfig, CacheStats, CacheLayer } from "@gicm/cache";

const config: CacheConfig = {
  l1: { enabled: true, ttlMinutes: 5, maxTokens: 100_000 },
  l2: {
    enabled: true,
    ttlMinutes: 60,
    maxEntries: 1000,
    similarityThreshold: 0.85,
  },
  l3: { enabled: true, defaultTtlMinutes: 30, maxEntries: 5000 },
};
```

## License

MIT

## Author

Mirko Basil Dölger <mirko@gicm.dev>
