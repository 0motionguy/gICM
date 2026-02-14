---
name: gicm-memory
description: >
  4-layer memory engine library for AI agents. Hot/warm/cold/archive with
  semantic search and automatic tier migration. Standalone library — works
  alongside OpenClaw's built-in memory, does NOT replace memory-core plugin.
user-invocable: true
metadata:
  openclaw:
    emoji: "🧠"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/memory"
        label: "Install gICM Memory"
---

# @gicm/memory

4-layer memory engine **library** for AI agents.

**Important:** This is a standalone library for custom agent workflows and skill development. It does NOT replace or conflict with OpenClaw's built-in `memory-core` plugin. Your `MEMORY.md` and `memory/` daily logs remain untouched.

## Layers

| Layer   | TTL       | Storage   | Purpose                 |
| ------- | --------- | --------- | ----------------------- |
| Hot     | Session   | In-memory | Recent context          |
| Warm    | 7 days    | SQLite    | Indexed with embeddings |
| Cold    | 90 days   | SQLite    | Compressed summaries    |
| Archive | Permanent | SQLite    | Extracted facts         |

## Commands

- `remember <key> <value>` — Store a memory
- `search <query>` — Semantic + keyword search across all layers
- `flush` — Migrate entries between layers based on age
- `stats` — Show memory statistics
- `export` — Export all memories as JSON

## Usage

```typescript
import { MemoryEngine } from "@gicm/memory";

const memory = new MemoryEngine({
  hot: { maxEntries: 50, maxTokens: 8000 },
  namespace: "my-agent",
});

memory.remember("user-preference", "Prefers TypeScript over JavaScript");
const results = await memory.search("typescript preference");
```

## Architecture

### Hot Layer (In-Memory)

- Fast, session-scoped storage
- Automatic flush when capacity reached
- No persistence between restarts

### Warm Layer (SQLite)

- 7-day TTL with semantic search
- Full embeddings for similarity matching
- Hybrid scoring: 60% keyword + 40% semantic

### Cold Layer (SQLite)

- 90-day TTL with compression
- Values truncated to 200 chars
- Preserves key metadata

### Archive Layer (SQLite)

- Permanent fact storage
- Extracted key information
- Searchable across all time

## Events

Listen to memory operations:

```typescript
engine.on("memory:added", (entry) => {
  console.log(`Added: ${entry.key}`);
});

engine.on("memory:flushed", (decision) => {
  console.log(
    `Flushed ${decision.entriesToFlush.length} to ${decision.targetLayer}`
  );
});

engine.on("memory:searched", (query, results) => {
  console.log(`Search "${query}" found ${results.length} results`);
});

engine.on("memory:compacted", (layer, count) => {
  console.log(`Compacted ${count} entries from ${layer}`);
});
```

## Configuration

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

## Search Options

```typescript
interface SearchOptions {
  layers?: MemoryLayer[]; // Filter by layer
  limit?: number; // Max results (default: 10)
  threshold?: number; // Min score (default: 0.3)
}
```

## Memory Types

- `episode` — Conversational exchanges
- `fact` — Verified information
- `improvement` — Performance insights
- `goal` — Objectives and targets
- `context` — Situational data

## Best Practices

1. **Namespace isolation** — Use unique namespaces per agent
2. **Regular flushing** — Call `flush()` periodically to migrate layers
3. **Semantic queries** — Phrase searches naturally for better semantic matching
4. **Type classification** — Set appropriate `type` for better organization
5. **Metadata enrichment** — Add context via metadata for enhanced retrieval

## Performance

- Hot layer lookups: O(n) where n = hot entries
- Warm/Cold/Archive: O(log n) with SQLite indices
- Embedding generation: ~1ms per entry (64-dim)
- Hybrid search: ~10ms for 1000 entries

## Fallback Mode

If `better-sqlite3` fails to load:

- Automatically falls back to in-memory Map storage
- All features work except persistence
- Warning logged to console

## Integration Examples

### With OpenClaw Skills

```typescript
import { MemoryEngine } from "@gicm/memory";

// Use a separate DB path — do NOT write to ~/.openclaw/memory/
const memory = new MemoryEngine({
  namespace: process.env.OPENCLAW_AGENT_ID || "main",
  dbPath: "~/.openclaw/gicm/memory.db",
});

// Store skill-specific data (does not touch MEMORY.md or memory/ daily logs)
await memory.remember("telegram-user-id", "1447270711");
await memory.remember("preferred-model", "anthropic/claude-3-haiku-20240307");

// Recall context
const prefs = await memory.search("user preferences");
```

### With Claude Desktop

```typescript
const memory = new MemoryEngine({
  namespace: "claude-desktop",
  hot: { maxEntries: 100, maxTokens: 16000 },
});

// Store conversation context
await memory.remember("current-task", "Building @gicm/memory package", {
  type: "context",
  metadata: { project: "gICM", priority: "high" },
});

// Search across session
const context = await memory.search("current task");
```

## License

MIT
