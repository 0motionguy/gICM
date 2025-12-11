# OPUS 67

> Self-Evolving AI Runtime v6.3.0 - 141 Skills • 82 MCPs • 10 Modes • 107 Agents

---

## What is OPUS 67?

> **OPUS 67 is NOT a separate AI.** It's Claude with superpowers.

```
┌─────────────────────────────────────────────────────────────┐
│  OPUS 67 ≠ Separate AI                                      │
│  OPUS 67 = Claude + Enhancement Layer                       │
│                                                             │
│  Claude IS the brain.                                       │
│  OPUS 67 gives Claude superpowers (skills, MCPs, memory).   │
│                                                             │
│  Same driver, better race car.                              │
└─────────────────────────────────────────────────────────────┘
```

**OPUS 67** wraps Claude with:

- **141 specialist skills** (auto-loaded based on task)
- **82 MCP connections** (live data, APIs, blockchain)
- **10 optimized modes** (right context for each task)
- **107 expert agents** (domain-specific personas)
- **Persistent memory** (remembers across sessions)
- **Multi-model routing** (Opus/Sonnet/Haiku for cost optimization)

**You ARE the AI. OPUS 67 just makes you faster, cheaper, and more capable.**

See [docs/WHAT-IS-OPUS67.md](./docs/WHAT-IS-OPUS67.md) for the full explanation.

---

<div align="center">

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗                  ║
║  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║                  ║
║  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝                  ║
║  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝                   ║
║  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║                    ║
║   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝                    ║
║                                                                           ║
║                    Self-Evolving AI Runtime v6.3.0                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**141 Skills • 82 MCPs • 10 Modes • 107 Agents • Unified Brain API**

</div>

---

## Installation

```bash
# Global install (recommended)
npm install -g @gicm/opus67

# Or with pnpm
pnpm add -g @gicm/opus67

# Or as project dependency
npm install @gicm/opus67
```

## Quick Start

### 1. Start the BRAIN Server

```bash
# Start server on port 3100
opus67-server

# Or with custom port
PORT=8080 opus67-server
```

### 2. Use the API

```bash
# Health check
curl http://localhost:3100/health

# Get boot screen
curl http://localhost:3100/api/brain/boot

# Check status
curl http://localhost:3100/api/brain/status

# Process a query
curl -X POST http://localhost:3100/api/brain/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Build a REST API with authentication"}'

# Get current mode
curl http://localhost:3100/api/brain/mode

# Set mode
curl -X POST http://localhost:3100/api/brain/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "build"}'
```

### 3. WebSocket Real-time Updates

```javascript
const ws = new WebSocket("ws://localhost:3100/api/brain/ws");

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(msg.type, msg.payload);
};

// Send query via WebSocket
ws.send(
  JSON.stringify({
    method: "query",
    payload: { query: "Optimize this function" },
  })
);
```

## Programmatic Usage

```typescript
import {
  Opus67,
  brainRuntime,
  router,
  council,
  memory,
  evolutionLoop,
} from "@gicm/opus67";

// Simple usage
const opus = new Opus67();
console.log(opus.boot());

const session = opus.process("design a microservices architecture");
console.log(session.mode); // 'architect'
console.log(session.skills); // loaded skills
console.log(session.prompt); // generated context prompt

// Advanced: Use BRAIN Runtime
const brain = brainRuntime;
brain.boot();

const response = await brain.process({
  query: "Build a trading bot",
  forceCouncil: true, // Use LLM council for complex decisions
});

console.log(response.response); // AI response
console.log(response.model); // Model used
console.log(response.cost); // Cost in $
console.log(response.latencyMs); // Response time
```

## Environment Variables

```bash
# Required: At least one AI provider
ANTHROPIC_API_KEY=sk-ant-...     # Claude (primary)

# Optional: Additional providers for routing
GEMINI_API_KEY=...               # Google Gemini
DEEPSEEK_API_KEY=...             # DeepSeek (cheapest)

# Server config
PORT=3100                        # Server port
HOST=0.0.0.0                     # Server host
LOG_LEVEL=info                   # Logging level
```

## API Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/health`               | Health check             |
| GET    | `/api/brain/boot`       | Boot screen              |
| GET    | `/api/brain/status`     | Runtime status           |
| GET    | `/api/brain/metrics`    | Comprehensive metrics    |
| GET    | `/api/brain/history`    | Query history            |
| GET    | `/api/brain/mode`       | Get current mode         |
| POST   | `/api/brain/mode`       | Set mode                 |
| POST   | `/api/brain/query`      | Process query            |
| POST   | `/api/brain/evolution`  | Control evolution engine |
| POST   | `/api/brain/deliberate` | Invoke LLM council       |
| WS     | `/api/brain/ws`         | Real-time updates        |

## 10 Operating Modes

| Mode      | Icon | Description           |
| --------- | ---- | --------------------- |
| AUTO      | 🤖   | Auto-detect best mode |
| SCAN      | 👀   | Quick file scanning   |
| BUILD     | 🔨   | Code generation       |
| REVIEW    | 📊   | Code review           |
| ARCHITECT | 🧠   | System design         |
| DEBUG     | 🐛   | Debugging             |
| ULTRA     | ⚡   | Maximum power         |
| THINK     | 💭   | Deep reasoning        |
| VIBE      | 🎨   | Creative mode         |
| LIGHT     | 💡   | Fast/cheap mode       |
| SWARM     | 🐝   | Multi-agent           |
| BG        | 🌙   | Background tasks      |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      OPUS 67 v6 BRAIN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              BRAIN Runtime (Orchestrator)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │  Multi  │   │   LLM   │   │ Graphiti│   │Evolution│        │
│  │  Model  │   │ Council │   │ Memory  │   │  Loop   │        │
│  │ Router  │   │         │   │         │   │         │        │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Claude │ Gemini │ DeepSeek │ Local LLM │ Fallback Chain │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  141 Skills │ 82 MCPs │ 10 Modes │ Cost Tracking │ 205 Tests   │
└─────────────────────────────────────────────────────────────────┘
```

## v6 Features

### Multi-Model Router

Automatically routes to the best model based on task type:

- **Claude Opus** - Complex reasoning
- **Claude Sonnet** - Balanced tasks
- **Claude Haiku** - Fast/cheap queries
- **Gemini Flash** - Ultra-fast scanning
- **DeepSeek** - Cost-effective coding

### LLM Council

For high-complexity decisions, multiple models deliberate:

```typescript
const result = await brain.deliberate(
  "Should we use microservices or monolith?"
);
console.log(result.finalAnswer); // Synthesized answer
console.log(result.responses); // Individual model responses
console.log(result.consensus); // Agreement level
```

### Graphiti Memory

Persistent memory across sessions:

```typescript
import { memory } from "@gicm/opus67";

await memory.addEpisode({
  name: "user-preference",
  content: "User prefers functional programming",
  type: "preference",
});

const context = await memory.search("programming style");
```

### Evolution Engine

Self-improvement through pattern detection:

```typescript
import { evolutionLoop } from "@gicm/opus67";

evolutionLoop.start();

// Detects patterns and suggests improvements
const opportunities = evolutionLoop.getPendingOpportunities();
```

## Benchmarks

Run benchmarks to compare OPUS 67 vs raw model:

```typescript
import { runComparisonCLI, runStressTestCLI } from "@gicm/opus67";

// Compare runtimes
await runComparisonCLI();

// Stress test
await runStressTestCLI();
```

## License

MIT © Mirko Basil Dölger

---

<div align="center">

**[Documentation](./docs)** • **[Examples](./examples)** • **[Discord](https://discord.gg/gicm)**

</div>
