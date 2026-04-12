# OPUS 67

> Skill Orchestration Engine for Claude Code v6.3.0 — 91 Skills, 10 Modes, 107 Agents

---

## What is OPUS 67?

OPUS 67 is a **context orchestration layer** for Claude Code. It organizes domain knowledge into keyword-matchable skill files and automates context selection so Claude gets the right expertise for each task.

**OPUS 67 is NOT a separate AI.** It enhances Claude Code with:

- **91 registered skills** — domain-specific knowledge bases (blockchain, frontend, DevOps, security, etc.)
- **10 operating modes** — complexity-based token budgeting (LIGHT 8k to ULTRA 100k)
- **107 agent definitions** — pre-written subagent prompts for specialized tasks
- **MCP integration** — tool definitions for skill loading and context management
- **Mode selector** — auto-detects task complexity and selects appropriate context budget

## How It Works

```
User query → Mode Selector (complexity 1-10) → Skill Matcher (keyword match)
                                                        ↓
                                              Load relevant skills
                                                        ↓
                                              Claude responds with
                                              domain expertise loaded
```

The skill loader reads YAML metadata from each skill file, matches against the user's query keywords, and returns relevant skill content within a token budget. That's the core value: **less manual context management, more focused Claude responses.**

## Limitations

- Skills are **static markdown files**, not trained models. They provide reference material, not intelligence.
- Mode detection uses **heuristic scoring**, not ML. It works well but isn't magic.
- Agent definitions are **prompt templates**. They don't execute independently.
- The pattern detection engine logs patterns but does not auto-apply changes by default.

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

### 1. Start the Server

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

# Check status
curl http://localhost:3100/api/brain/status

# Process a query (returns matched skills + mode)
curl -X POST http://localhost:3100/api/brain/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Build a REST API with authentication"}'

# Get/set current mode
curl http://localhost:3100/api/brain/mode
curl -X POST http://localhost:3100/api/brain/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "build"}'
```

### 3. Programmatic Usage

```typescript
import { Opus67 } from "@gicm/opus67";

const opus = new Opus67();
console.log(opus.boot());

const session = opus.process("design a microservices architecture");
console.log(session.mode);   // 'architect'
console.log(session.skills); // matched skill definitions
console.log(session.prompt); // generated context prompt
```

## Environment Variables

```bash
# Required: At least one AI provider
ANTHROPIC_API_KEY=sk-ant-...     # Claude (primary)

# Optional: Additional providers for routing
GEMINI_API_KEY=...               # Google Gemini
DEEPSEEK_API_KEY=...             # DeepSeek

# Server config
PORT=3100                        # Server port
HOST=0.0.0.0                     # Server host
LOG_LEVEL=info                   # Logging level
```

## API Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/health`               | Health check             |
| GET    | `/api/brain/status`     | Runtime status           |
| GET    | `/api/brain/metrics`    | Metrics                  |
| GET    | `/api/brain/mode`       | Get current mode         |
| POST   | `/api/brain/mode`       | Set mode                 |
| POST   | `/api/brain/query`      | Process query            |
| WS     | `/api/brain/ws`         | Real-time updates        |

## 10 Operating Modes

| Mode      | Description           | Token Budget |
| --------- | --------------------- | ------------ |
| AUTO      | Auto-detect best mode | Variable     |
| SCAN      | Quick file scanning   | 8k           |
| BUILD     | Code generation       | 32k          |
| REVIEW    | Code review           | 16k          |
| ARCHITECT | System design         | 64k          |
| DEBUG     | Debugging             | 32k          |
| ULTRA     | Maximum context       | 100k         |
| THINK     | Deep reasoning        | 64k          |
| VIBE      | Creative mode         | 16k          |
| LIGHT     | Fast/cheap mode       | 8k           |

## Skill Categories

| Category | Count | Examples |
|----------|-------|---------|
| Blockchain/Web3 | 20+ | Solana, Anchor, EVM, DeFi, Smart Contracts |
| Frontend | 15+ | React, Next.js, Tailwind, Framer Motion |
| Backend | 12+ | Node.js, GraphQL, REST, gRPC |
| DevOps | 10+ | Docker, Kubernetes, CI/CD, Terraform |
| Security | 5+ | Auditing, OWASP, Penetration Testing |
| Testing | 8+ | Jest, Playwright, k6, Foundry |
| Database | 6+ | PostgreSQL, Redis, Elasticsearch |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OPUS 67 v6 Runtime                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Skill Loader │  │Mode Selector │  │  MCP Server  │   │
│  │  (keyword    │  │ (complexity  │  │  (tool defs  │   │
│  │   matching)  │  │   scoring)   │  │   for Claude)│   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                 │                  │            │
│         ▼                 ▼                  ▼            │
│  ┌─────────────────────────────────────────────────┐     │
│  │     91 Skills  │  10 Modes  │  107 Agents       │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Pattern Detection │ Multi-Model Router │ Memory Store   │
└─────────────────────────────────────────────────────────┘
```

## License

MIT (c) Mirko Basil Dolger

---

**[Documentation](./docs)** | **[gICM Marketplace](https://gicm.io)**
