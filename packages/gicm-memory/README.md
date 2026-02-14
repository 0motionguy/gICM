# @gicm/memory

> 4-layer AI agent memory engine with semantic search and automatic tier migration

[![npm version](https://img.shields.io/npm/v/@gicm/memory.svg)](https://www.npmjs.com/package/@gicm/memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **4-layer architecture** — Hot/Warm/Cold/Archive with automatic aging
- **Hybrid search** — 60% keyword + 40% semantic similarity
- **Namespace isolation** — Multi-agent support
- **Event-driven** — Subscribe to memory operations
- **SQLite persistence** — With automatic fallback to in-memory storage
- **Type-safe** — Full TypeScript support with Zod validation
- **Zero external APIs** — Simple 64-dim embeddings, no OpenAI required

## Installation

```bash
npm install @gicm/memory
# or
pnpm add @gicm/memory
# or
yarn add @gicm/memory
```

### Optional: SQLite persistence

For persistent storage across sessions, install `better-sqlite3`:

```bash
npm install better-sqlite3
```

Without it, the package automatically falls back to in-memory storage.

## Quick Start

```typescript
import { MemoryEngine } from "@gicm/memory";

// Create memory engine
const memory = new MemoryEngine({
  namespace: "my-agent",
  hot: { maxEntries: 50, maxTokens: 8000 },
});

// Store memories
await memory.remember("user-name", "Alice");
await memory.remember("user-preference", "Prefers TypeScript over JavaScript");

// Search with hybrid keyword + semantic matching
const results = await memory.search("typescript preference");
console.log(results[0].entry.value); // "Prefers TypeScript over JavaScript"

// Get statistics
const stats = memory.getStats();
console.log(`Total entries: ${stats.totalEntries}`);
console.log(`Hot layer: ${stats.byLayer.hot}`);

// Flush to migrate entries between layers
await memory.flush();
```

## Architecture

### 4-Layer Memory System

| Layer   | TTL       | Storage   | Purpose                 | Features                      |
| ------- | --------- | --------- | ----------------------- | ----------------------------- |
| Hot     | Session   | In-memory | Recent context          | Fast, uncompressed            |
| Warm    | 7 days    | SQLite    | Indexed with embeddings | Full semantic search          |
| Cold    | 90 days   | SQLite    | Compressed summaries    | Values truncated to 200 chars |
| Archive | Permanent | SQLite    | Extracted facts         | Key information preserved     |

Entries automatically migrate between layers based on age:

- **Hot → Warm**: After 5 minutes or when hot layer is full
- **Warm → Cold**: After 7 days
- **Cold → Archive**: After 90 days (with fact extraction)

### Hybrid Search

Search uses a weighted combination:

- **60% keyword matching** — Word boundary detection with regex
- **40% semantic similarity** — 64-dimensional embeddings with cosine similarity
- **Threshold filtering** — Default 0.3, configurable

## API Reference

### MemoryEngine

```typescript
class MemoryEngine extends EventEmitter {
  constructor(config?: Partial<MemoryConfig>);

  remember(
    key: string,
    value: string,
    opts?: RememberOptions
  ): Promise<MemoryEntry>;
  search(query: string, opts?: SearchOptions): Promise<SearchResult[]>;
  flush(): Promise<void>;
  getStats(): MemoryStats;
  close(): void;
}
```

### Configuration

```typescript
interface MemoryConfig {
  hot: {
    maxEntries: number; // Default: 50
    maxTokens: number; // Default: 8000
  };
  warm: {
    maxAgeDays: number; // Default: 7
    maxEntries: number; // Default: 500
  };
  cold: {
    maxAgeDays: number; // Default: 90
    maxEntries: number; // Default: 2000
  };
  archive: {
    maxEntries: number; // Default: 10000
  };
  embeddingDims: number; // Default: 64
  namespace: string; // Default: "default"
  dbPath?: string; // Default: ":memory:"
}
```

### Remember Options

```typescript
interface RememberOptions {
  type?: "episode" | "fact" | "improvement" | "goal" | "context";
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}
```

### Search Options

```typescript
interface SearchOptions {
  layers?: ("hot" | "warm" | "cold" | "archive")[];
  limit?: number; // Default: 10
  threshold?: number; // Default: 0.3
}
```

## Events

Subscribe to memory operations:

```typescript
// Memory added to hot layer
memory.on("memory:added", (entry: MemoryEntry) => {
  console.log(`Added: ${entry.key}`);
});

// Entries flushed between layers
memory.on("memory:flushed", (decision: FlushDecision) => {
  console.log(
    `Flushed ${decision.entriesToFlush.length} to ${decision.targetLayer}`
  );
});

// Search performed
memory.on("memory:searched", (query: string, results: SearchResult[]) => {
  console.log(`Search "${query}" found ${results.length} results`);
});

// Layer compacted (old entries removed)
memory.on("memory:compacted", (layer: MemoryLayer, count: number) => {
  console.log(`Compacted ${count} entries from ${layer}`);
});
```

## Examples

### Multi-Agent Isolation

```typescript
const agent1 = new MemoryEngine({ namespace: "agent-1" });
const agent2 = new MemoryEngine({ namespace: "agent-2" });

await agent1.remember("task", "Build API");
await agent2.remember("task", "Write tests");

const results1 = await agent1.search("task"); // "Build API"
const results2 = await agent2.search("task"); // "Write tests"
```

### Type Classification

```typescript
await memory.remember("typescript-fact", "TypeScript adds type safety", {
  type: "fact",
  metadata: { confidence: 0.95, source: "docs" },
});

await memory.remember("user-goal", "Learn advanced TypeScript patterns", {
  type: "goal",
  metadata: { priority: "high", deadline: "2026-03-01" },
});
```

### Layer Filtering

```typescript
// Search only in hot layer (recent context)
const recentResults = await memory.search("task", { layers: ["hot"] });

// Search in persistent layers only
const historicalResults = await memory.search("task", {
  layers: ["warm", "cold", "archive"],
});
```

### Custom Threshold

```typescript
// Strict matching (higher threshold)
const strictResults = await memory.search("exact match", { threshold: 0.8 });

// Lenient matching (lower threshold)
const lenientResults = await memory.search("fuzzy match", { threshold: 0.2 });
```

## Performance

- **Hot layer lookups**: O(n) where n = hot entries (typically < 50)
- **Warm/Cold/Archive**: O(log n) with SQLite B-tree indices
- **Embedding generation**: ~1ms per entry (64-dimensional)
- **Hybrid search**: ~10ms for 1000 entries

## Fallback Mode

If `better-sqlite3` cannot be loaded (native binary issues), the package automatically falls back to in-memory Map storage:

- All features continue to work
- No persistence across restarts
- Warning logged to console: `[MemoryDatabase] better-sqlite3 not available, using in-memory fallback`

## Integration

### With OpenClaw

```typescript
import { MemoryEngine } from "@gicm/memory";

const memory = new MemoryEngine({
  namespace: process.env.OPENCLAW_AGENT_ID || "main",
  dbPath: "~/.openclaw/memory.db",
});

// Store agent preferences
await memory.remember("telegram-user-id", "1447270711");
await memory.remember("preferred-model", "anthropic/claude-3-haiku-20240307");

// Recall context in conversations
const prefs = await memory.search("telegram user");
```

### With Claude Desktop MCP

```typescript
import { MemoryEngine } from "@gicm/memory";

const memory = new MemoryEngine({
  namespace: "claude-desktop",
  hot: { maxEntries: 100, maxTokens: 16000 },
});

// Store session context
await memory.remember("current-project", "gICM monorepo", {
  type: "context",
  metadata: { cwd: "/Users/mirko/gICM" },
});

// Search for context
const context = await memory.search("current project");
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm dev
```

## Testing

```bash
# Run full test suite (30+ tests)
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

## License

MIT © [ICM Motion](https://github.com/icm-motion)

## Contributing

Contributions welcome! Please read the [contributing guide](../../CONTRIBUTING.md) first.

## Support

- [GitHub Issues](https://github.com/icm-motion/gicm/issues)
- [Discord Community](https://discord.gg/icm-motion)

## Related Packages

- [@gicm/goldfish](../gicm-goldfish) — Ephemeral in-memory cache for AI agents
- [@gicm/agent-core](../agent-core) — Core agent runtime primitives
- [@gicm/integration-hub](../integration-hub) — Multi-engine workflow orchestration
