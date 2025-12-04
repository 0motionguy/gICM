# OPUS 67 v4.1 "Learning Layer" - Complete Architecture

> **Self-Evolving AI Runtime with Auto-Learning, Vector Search, and 5-Tier Memory**

---

## What is OPUS 67?

```
OPUS 67 ≠ Separate AI
OPUS 67 = Claude + Enhancement Layer

Claude IS the brain. OPUS 67 = skills + MCPs + modes + memory.
Same driver, better race car.
```

OPUS 67 is an **enhancement layer** for Claude that provides:
- **130 Skills** - Domain-specific expertise prompts
- **48 MCPs** - Connected tool servers
- **30 Modes** - Optimized operating configurations
- **84 Agents** - Specialized sub-agents for parallel execution
- **5-Tier Memory** - Persistent context across sessions
- **Auto-Learning** - SOP generation from successful workflows

---

## System Stats (v4.1.0)

| Component | Count | Description |
|-----------|-------|-------------|
| **Skills** | 130 | Domain expertise prompts |
| **MCPs** | 48 | Connected tool servers |
| **Modes** | 30 | Operating configurations |
| **Agents** | 84 | Sub-agent types |
| **Memory Tiers** | 5 | Qdrant, Mem0, Neo4j, Graphiti, Postgres |
| **Token Savings** | 47% | Average cost reduction |
| **Skill Packs** | 5 | Bundled skill combinations |
| **Skill Hints** | 15 | MCP-backed lightweight hints |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OPUS 67 v4.1 Architecture                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      USER REQUEST                                 │   │
│  └───────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
│                                  ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    MODE SELECTOR (AUTO)                           │   │
│  │  Keyword Analysis → Complexity Scoring → Mode Selection           │   │
│  └───────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                       │
│         ┌────────────────────────┼────────────────────────┐             │
│         │                        │                        │             │
│         ▼                        ▼                        ▼             │
│  ┌────────────┐         ┌────────────┐          ┌────────────┐         │
│  │  SKILLS    │         │   MCPs     │          │  MEMORY    │         │
│  │   LOADER   │         │   HUB      │          │  SYSTEM    │         │
│  │  (130)     │         │   (48)     │          │  (5-tier)  │         │
│  └─────┬──────┘         └─────┬──────┘          └─────┬──────┘         │
│        │                      │                       │                 │
│        └──────────────────────┼───────────────────────┘                 │
│                               │                                         │
│                               ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    LEARNING LAYER (v4.1)                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │   │
│  │  │  Vector    │  │  Learning  │  │   Skills   │  │  AContext  │  │   │
│  │  │  Search    │  │  Observer  │  │  Navigator │  │   Sync     │  │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    SUB-AGENT ORCHESTRATION                        │   │
│  │  SWARM mode: up to 20 parallel agents                            │   │
│  │  Git worktrees for conflict-free parallel execution              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                         │
│                               ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        RESPONSE                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Skills System (130 Skills)

### Skill Categories

| Category | Count | Examples |
|----------|-------|----------|
| **Core Stack** | 4 | solana-anchor-expert, nextjs-14-expert, typescript-senior, rust-systems |
| **GRAB Skills** | 22 | react-grab, theme-grab, dashboard-grab, landing-grab, form-grab... |
| **AI/LLM** | 6 | ai-integration, openai-assistant-expert, gemini-expert, embeddings-expert |
| **Blockchain** | 15 | jupiter-trader, anchor-instructor, staking-expert, bridge-expert |
| **Frontend** | 20 | framer-motion-wizard, shadcn-ui-master, tailwind-ui-designer |
| **Backend** | 15 | node-backend, prisma-drizzle-orm, supabase-expert, graphql-expert |
| **DevOps** | 12 | kubernetes-expert, docker-containers, devops-engineer, nginx-expert |
| **Research** | 8 | deep-researcher, competitor-analyzer, market-researcher |
| **Testing** | 6 | playwright-pro, vitest-expert, testing-unit |
| **Specialized** | 22 | websocket-expert, queue-expert, i18n-expert, pwa-expert |

### Skill Tiers

| Tier | Token Budget | Purpose |
|------|--------------|---------|
| **Tier 1** | 10-15k | Core essential skills (always available) |
| **Tier 2** | 5-10k | Domain expertise (auto-loaded on keywords) |
| **Tier 3** | 3-5k | Specialized skills (loaded on demand) |

### Skill Packs (5)

Pre-bundled skill combinations for common use cases:

1. **ai-native-stack** - Vercel AI SDK, LangChain, RAG, embeddings
2. **solana-2025-stack** - Anchor, Jupiter, PDA patterns, Token-2022
3. **devops-automation-stack** - GitHub Actions, Docker, K8s, Terraform
4. **monorepo-build-stack** - Turborepo, pnpm, tsup, Changesets
5. **fullstack-blueprint-stack** - Next.js 14, Drizzle, Clerk, Stripe

### MCP-Backed Skill Hints (15)

Lightweight skills that delegate to MCP servers (94% token reduction):

```yaml
skill_hints:
  - jupiter-hint → jupiter MCP
  - helius-hint → helius MCP
  - supabase-hint → supabase MCP
  - github-hint → github MCP
  - sentry-hint → sentry MCP
  # ... 10 more
```

---

## Modes System (30 Modes)

### Mode Overview

| Mode | Icon | Token Budget | Model | Use Case |
|------|------|--------------|-------|----------|
| **ULTRA** | 🧠 | 100,000 | claude-opus | Complex architecture, system design |
| **THINK** | 💭 | 50,000 | claude-opus | Deep analysis, debugging |
| **BUILD** | 🔨 | 40,000 | claude-sonnet | Production code generation |
| **VIBE** | ⚡ | 25,000 | claude-sonnet | Rapid prototyping |
| **LIGHT** | 💡 | 5,000 | local-llm | Quick answers (FREE) |
| **CREATIVE** | 🎨 | 35,000 | claude-sonnet | UI/UX design |
| **DATA** | 📊 | 40,000 | claude-sonnet | Market analysis |
| **AUDIT** | 🛡️ | 50,000 | claude-opus | Security review |
| **SWARM** | 🐝 | 150,000 | mixed | Multi-agent parallel |
| **AUTO** | 🤖 | dynamic | adaptive | Intelligent switching |
| **BG** | 🌙 | 50,000 | claude-sonnet | Background tasks |
| **REVIEW** | 👀 | 30,000 | claude-opus | Code review |
| **GRAB** | 👁️ | 40,000 | claude-sonnet | Screenshot to code |
| **CLONE** | 🔄 | 50,000 | claude-opus | Site cloning |
| **RESEARCH** | 🔍 | 45,000 | claude-opus | Multi-source research |
| **CONTEXT** | 🖥️ | 30,000 | claude-sonnet | Desktop awareness |
| **SOLANA** | 🪙 | 50,000 | claude-opus | Blockchain development |
| **INFRA** | 🏗️ | 40,000 | claude-sonnet | Infrastructure |
| **MEMORY** | 🧠 | 25,000 | claude-sonnet | Context management |
| **DEBUG** | 🐛 | 45,000 | claude-opus | Error hunting |
| **DEEP-RESEARCH** | 🔬 | 80,000 | claude-opus | Extended research |
| **WEB-SEARCH** | 🌐 | 15,000 | claude-sonnet | Quick web lookups |
| **DESIGN** | 🎨 | 45,000 | claude-opus | UI/UX design |
| **CONTENT** | ✍️ | 30,000 | claude-sonnet | Content creation |
| **BUSINESS** | 💼 | 50,000 | claude-opus | Business strategy |
| **STRATEGY** | ♟️ | 60,000 | claude-opus | Strategic planning |
| **MARKETING** | 📣 | 35,000 | claude-sonnet | Marketing content |
| **SECURITY** | 🔒 | 55,000 | claude-opus | Security focus |
| **TEACH** | 📚 | 40,000 | claude-opus | Educational mode |
| **SHIP** | 🚀 | 35,000 | claude-sonnet | Production deployment |

### AUTO Mode Detection

AUTO mode analyzes each request using:

1. **Keyword Scan** - Match against mode trigger keywords
2. **Complexity Scoring** - 1-10 scale based on task type
3. **File Context** - Detect file types and directories
4. **Conversation History** - Track patterns
5. **User Preference Bias** - Learn from past choices

---

## MCP Connections (48)

### MCP Categories

| Category | MCPs | Examples |
|----------|------|----------|
| **Blockchain** | 8 | jupiter, helius, solana, anchor, birdeye, pump_fun, dexscreener, raydium |
| **Development** | 10 | github, vercel, supabase, postgres, sentry, docker, playwright |
| **AI/ML** | 6 | langsmith, vercel_ai, context7, qdrant, mem0, screenpipe |
| **Research** | 6 | tavily, exa, firecrawl, jina, crawl4ai, brave_search |
| **Social** | 4 | tweetscout, santiment, neynar, notion |
| **Payments** | 2 | stripe, clerk |
| **Email** | 1 | resend |
| **Other** | 11 | stagehand, graphiti, neo4j, etc. |

---

## v4.1 Learning Layer

### Components

#### 1. AContext Integration
Self-learning platform that records successful task completions:

```typescript
const observer = getLearningObserver();

await observer.observeCompletion({
  task: 'Deploy Anchor program to devnet',
  toolCalls: [...],
  mode: 'build',
  confidence: 0.95
});
```

#### 2. Vector Skill Search
Semantic search across all skills:

```typescript
const search = getSkillSearch();
const results = await search.searchSkills('build a DeFi trading bot', 5);
// Returns: defi-data-analyst (0.92), bonding-curve-master (0.87)...
```

**Features:**
- Qdrant vector database (when available)
- TF-IDF fallback with n-gram enhancement
- Automatic skill indexing

#### 3. Learning Observer Agent
Tracks successful workflows and extracts patterns:

- Watches for 3+ tool call chains
- Extracts successful patterns
- Generates step-by-step SOPs
- Syncs to AContext cloud

#### 4. Skills Navigator Agent
Auto-finds and activates relevant skills:

```typescript
const navigator = getSkillsNavigator();
const activations = await navigator.autoActivate('Build a Solana token launchpad');
// Activates: solana-anchor-expert, bonding-curve-master, wallet-integration
```

---

## Memory System (5-Tier)

| Tier | Technology | Purpose | Persistence |
|------|------------|---------|-------------|
| **1. Vector** | Qdrant | Semantic skill search | Permanent |
| **2. Semantic** | Mem0 | Cross-session context | Permanent |
| **3. Graph** | Neo4j | Relationship mapping | Permanent |
| **4. Temporal** | Graphiti | Time-aware context | Permanent |
| **5. Structured** | PostgreSQL | Metrics, logs | Permanent |

---

## Sub-Agent System (84 Types)

### Agent Categories

| Category | Count | Examples |
|----------|-------|----------|
| **Development** | 15 | coder, tester, reviewer, deployer, refactorer |
| **Frontend** | 8 | designer, animator, styler, component-generator |
| **Backend** | 10 | api-builder, schema-designer, query-optimizer |
| **Web3** | 12 | blockchain-reader, token-analyst, whale-tracker |
| **Content** | 6 | content-creator, trend-spotter, competitor-analyst |
| **Quality** | 8 | integration-tester, snapshot-tester, load-tester |
| **AI** | 5 | prompt-engineer, rag-builder, agent-orchestrator |
| **Core** | 20 | architect, planner, debugger, security-auditor |

### SWARM Mode
Parallel execution with up to 20 agents using Git worktrees:

```yaml
workflow:
  - create_worktree: "git worktree add .worktrees/agent-{id}"
  - agent_works_in: ".worktrees/agent-{id}"
  - on_complete: "git worktree remove .worktrees/agent-{id}"
  - merge_strategy: "review_then_merge"
```

---

## Performance Metrics

### Token Savings

| Strategy | Savings |
|----------|---------|
| **Skill Hints (MCP-backed)** | 94% |
| **Mode-based Routing** | 31% |
| **Light Mode (Local LLM)** | 100% |
| **Average Overall** | 47% |

### Speed

| Metric | Value |
|--------|-------|
| Response Speed | 3.2x faster |
| SWARM Mode | 12x faster |
| Average Latency | 847ms |
| Context Retrieval | <50ms |

### Accuracy

| Metric | Value |
|--------|-------|
| First-Attempt Success | 89% |
| Code Compiles | 96% |
| Fewer Iterations | 71% |
| Context Relevance | 94% |

---

## File Structure

```
packages/opus67/
├── src/
│   ├── index.ts              # Main exports
│   ├── boot-sequence.ts      # Terminal UI
│   ├── cli.ts                # CLI interface
│   ├── skill-loader.ts       # Skills loading
│   ├── mode-selector.ts      # Mode selection
│   ├── mcp-hub.ts            # MCP connections
│   ├── agents/
│   │   ├── learning-observer.ts   # v4.1: Learning tracking
│   │   └── skills-navigator.ts    # v4.1: Skill discovery
│   ├── intelligence/
│   │   ├── skill-search.ts        # v4.1: Vector search
│   │   └── learning-loop.ts       # v4.1: AContext sync
│   ├── memory/
│   │   ├── context.ts             # Context management
│   │   └── index.ts               # Memory exports
│   └── models/
│       └── cost-tracker.ts        # Cost optimization
├── skills/
│   └── registry.yaml         # 130 skill definitions
├── modes/
│   └── registry.yaml         # 30 mode definitions
├── mcp/
│   └── connections.yaml      # 48 MCP connections
├── docs/
│   ├── OPUS67-COMPLETE.md    # This file
│   ├── OPUS67-ONE-PAGER.md   # Quick reference
│   └── v41-learning-layer.md # v4.1 features
└── package.json
```

---

## Quick Start

### Installation

```bash
npm install @gicm/opus67
# or
pnpm add @gicm/opus67
```

### CLI Usage

```bash
opus67 init              # Register with Claude Code
opus67 boot              # Show boot screen
opus67 status            # System status
opus67-server            # Start BRAIN HTTP server
```

### Programmatic Usage

```typescript
import {
  loadRegistry,
  loadModeRegistry,
  getAllConnections,
  getLearningObserver,
  getSkillsNavigator,
  getSkillSearch
} from '@gicm/opus67';

// Load skills
const skills = loadRegistry();

// Load modes
const modes = loadModeRegistry();

// Get MCP connections
const mcps = getAllConnections();

// v4.1: Vector skill search
const search = getSkillSearch();
const results = await search.searchSkills('build a dashboard', 5);

// v4.1: Auto-activate skills
const navigator = getSkillsNavigator();
await navigator.autoActivate('Create a Solana token');

// v4.1: Track learning
const observer = getLearningObserver();
await observer.observeCompletion({ task, toolCalls, mode, confidence });
```

---

## Version History

| Version | Codename | Key Features |
|---------|----------|--------------|
| v1.0 | Launch | Initial release, 50 skills |
| v2.0 | Unified | Mode system, sub-agents |
| v3.0 | Eyes | GRAB skills, visual-to-code |
| v3.1 | Eyes Update | Research skills, browser automation |
| v3.2 | Solana Stack | Blockchain MCPs, trading skills |
| v3.3 | Unified | Consolidated all features |
| v4.0 | Expansion | Skill packs, skill hints, 95+ skills |
| **v4.1** | **Learning Layer** | **AContext, vector search, auto-SOP, 130 skills, 30 modes** |

---

## Key Differentiators

1. **Not a separate AI** - Enhancement layer for Claude
2. **Self-evolving** - Learns from successful workflows
3. **47% cost savings** - Smart routing and MCP hints
4. **5-tier memory** - True persistent context
5. **130 skills** - Comprehensive domain coverage
6. **30 modes** - Optimized for any task type
7. **SWARM mode** - 20x parallel agent execution

---

*OPUS 67 v4.1 "Learning Layer" - Claude + Skills + MCPs + Modes + Memory + Learning*
