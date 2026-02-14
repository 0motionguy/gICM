---
name: gicm-opus67
description: >
  Self-evolving AI runtime. 141 skills, 82 MCP connections, 10 operating modes,
  107 agents. Multi-model routing, prompt caching, context engineering,
  cross-session memory, evolution engine.
user-invocable: true
metadata:
  openclaw:
    emoji: "🧠"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/opus67"
        label: "Install OPUS 67"
    requires:
      env:
        - ANTHROPIC_API_KEY
---

# OPUS 67 — Self-Evolving AI Runtime

141 skills, 82 MCP connections, 10 modes, 107 agents. Multi-model routing (Claude/Gemini/DeepSeek/local), prompt caching, cross-session memory, evolution engine.

## Quick Start

```typescript
import { Opus67 } from "@gicm/opus67";
const opus = new Opus67();
const session = opus.process("design the system architecture");
// session.mode = "architect", session.skills = [...], session.prompt = "..."
```

## Operating Modes

| Mode      | Description                 | Token Budget |
| --------- | --------------------------- | ------------ |
| AUTO      | Auto-detect from query      | Varies       |
| BUILD     | Code generation             | High         |
| REVIEW    | Code review + testing       | Medium       |
| ARCHITECT | System design               | High         |
| DEBUG     | Debugging + troubleshooting | Medium       |
| ULTRA     | Maximum capability          | Maximum      |
| THINK     | Deep reasoning              | High         |
| VIBE      | Creative/exploratory        | Medium       |
| LIGHT     | Quick tasks                 | Low          |
| SWARM     | Multi-agent orchestration   | High         |

## Key Features

- **Multi-Model Router**: Routes to optimal model per task (Opus for architecture, Haiku for quick tasks)
- **Skill Detection**: Auto-loads domain expertise from 141 skills based on query analysis
- **MCP Hub**: Connects to 82 tool servers (GitHub, Supabase, Sentry, Solana RPC, etc.)
- **Cross-Session Memory**: Graphiti-based persistent memory with SQLite + vector search
- **Evolution Engine**: Self-improvement through pattern detection and code improvement
- **Brain Runtime**: HTTP/WebSocket server for real-time AI processing

## API

```typescript
// Boot
const opus = new Opus67({ defaultMode: "auto", tokenBudget: 50000 });
opus.boot(); // Returns boot screen

// Process query
const session = opus.process("query", { activeFiles: ["src/index.ts"] });
session.mode; // Detected mode
session.skills; // Loaded skills
session.mcpConnections; // Available MCPs
session.prompt; // Generated context prompt

// Manual mode
opus.setMode("architect");

// Skill loading
import { loadSkills, formatSkillsForPrompt } from "@gicm/opus67";
const skills = loadSkills({ query: "build a REST API" });

// MCP connections
import { getConnectionsForSkills } from "@gicm/opus67";
const mcps = getConnectionsForSkills(["nextjs-14-expert"]);

// Mode detection
import { detectMode } from "@gicm/opus67";
const result = detectMode({ query: "find and fix the auth bug" });
// result.mode = "debug", result.confidence = 0.92
```

## License

MIT
