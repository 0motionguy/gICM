# OPUS 67

> Self-Evolving AI Runtime - The AI that learns you

<div align="center">

```
╔═══════════════════════════════════════════════════════════════╗
║                        OPUS 67                                 ║
║              Self-Evolving AI Runtime                          ║
╚═══════════════════════════════════════════════════════════════╝
```

**100 Skills • 50+ MCPs • Pre-loaded Context • Self-Improving**

</div>

---

## What is OPUS 67?

OPUS 67 is an AI runtime that:
- **Pre-indexes your entire codebase** (no more "can you share the code?")
- **Auto-loads 100 specialist skills** based on your task
- **Connects to 50+ live data sources** via MCP
- **Learns from every interaction** and improves over time
- **Routes to the best model** for each task (Claude, local LLM, etc.)

## Installation

```bash
# From npm
npm install -g @gicm/opus67

# Or in your project
pnpm add @gicm/opus67
```

## Quick Start

```bash
# Initialize OPUS 67 in your project
opus67 boot .

# Check status
opus67 status

# List loaded skills
opus67 skills

# List MCP connections
opus67 mcp
```

## Programmatic Usage

```typescript
import { createOPUS67 } from "@gicm/opus67";

// Boot OPUS 67
const opus = await createOPUS67("./my-project");

// Process a task (auto-loads skills, connects MCPs, retrieves context)
const context = await opus.processTask("Implement bonding curve buy function");

// context.theDoor    - Master orchestrator prompt
// context.skills     - Loaded specialist skills
// context.mcpTools   - Available live data tools
// context.context    - Relevant project files
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         OPUS 67                                  │
├─────────────────────────────────────────────────────────────────┤
│  THE DOOR (Master Orchestrator Prompt)                           │
│       ↓                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Context │  │  Skills │  │   MCP   │  │  Self   │            │
│  │ Indexer │  │  Loader │  │   Hub   │  │Improve  │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       │ 50K tokens  │ 100 skills │ 50 MCPs   │ Learns           │
│       ▼            ▼            ▼            ▼                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Unified AI Interface                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Context Indexer
Pre-indexes all project files for instant retrieval.

```typescript
import { ContextIndexer } from "@gicm/opus67/context";

const indexer = new ContextIndexer({
  indexPaths: ["./src"],
  excludePatterns: ["node_modules"],
  maxTokens: 50000,
  vectorDbPath: "./.opus67/vectors"
});

await indexer.index("./my-project");
const context = await indexer.retrieve("bonding curve");
```

### 2. Skill Loader
100 specialist skills that auto-load based on task.

```typescript
import { SkillLoader } from "@gicm/opus67/skills";

const loader = new SkillLoader("./skills/registry.yaml");
await loader.loadRegistry();

// Auto-detect and load skills
const skills = loader.detectSkills("implement anchor program");
// → ["solana-anchor-expert", "rust-systems"]

await loader.loadForTask(skills);
```

### 3. MCP Hub
50+ live data connections.

```typescript
import { MCPHub } from "@gicm/opus67/mcp";

const hub = new MCPHub("./mcp/connections.yaml");
await hub.connectAll();

// Call a tool
const price = await hub.callTool("jupiter", "jupiter_price", {
  ids: ["SOL"]
});
```

### 4. Autonomy Engine
Self-improvement through interaction logging.

```typescript
import { AutonomyEngine } from "@gicm/opus67/autonomy";

const autonomy = new AutonomyEngine({ level: 2 });
await autonomy.initialize();

// Log interaction
autonomy.logInteraction({
  taskType: "code",
  input: "implement buy function",
  skillsUsed: ["solana-anchor-expert"],
  mcpsUsed: ["helius"],
  tokensIn: 1500,
  tokensOut: 2000,
  executionTimeMs: 5000,
  success: true
});

// Analyze patterns
const patterns = autonomy.analyzePatterns();
const suggestions = autonomy.generateSkillSuggestions();
```

## Skills Registry

Skills are defined in `skills/registry.yaml`:

```yaml
skills:
  - id: solana-anchor-expert
    name: "Solana Anchor Expert"
    category: blockchain
    tokens: 15000
    priority: 1
    triggers:
      extensions: [".rs"]
      keywords: ["anchor", "solana", "program"]
    mcp_connections:
      - helius
      - solscan
    capabilities:
      - Anchor program architecture
      - PDA derivation
      - CPI patterns
```

## MCP Connections

Connections are defined in `mcp/connections.yaml`:

```yaml
connections:
  - id: helius
    name: "Helius RPC"
    category: blockchain
    transport: http
    base_url: "https://api.helius.xyz/v0"
    auth:
      type: api_key
      env_var: HELIUS_API_KEY
    tools:
      - name: helius_get_assets
        description: "Get NFTs/tokens for wallet"
```

## Environment Variables

Create `.env` with your API keys:

```bash
# Blockchain
HELIUS_API_KEY=
BIRDEYE_API_KEY=

# Social Intelligence
SANTIMENT_API_KEY=
TWEETSCOUT_API_KEY=
NEYNAR_API_KEY=

# AI
ANTHROPIC_API_KEY=
```

## Roadmap

- [x] v1.0 - Core runtime (context, skills, MCP)
- [ ] v1.1 - Vector embeddings for semantic retrieval
- [ ] v1.2 - Local LLM integration (Ollama)
- [ ] v1.3 - Auto skill generation
- [ ] v2.0 - Full self-improvement loop

## License

MIT © Mirko Basil Dölger
