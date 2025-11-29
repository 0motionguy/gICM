# gICM Platform - Master Documentation

> **Last Updated:** 2025-11-29
> **Owner:** Mirko Basil Dölger
> **Purpose:** Complete reference for AI agents to understand and work with the gICM codebase

---

## Quick Reference

```bash
# Build everything
pnpm install && pnpm -r build

# Build specific package
pnpm --filter @gicm/<package-name> build

# Build all services
pnpm --filter "./services/*" build

# Run dev mode
pnpm dev
```

---

## Project Structure

```
gICM/
├── apps/                    # Frontend applications
│   └── marketplace/         # Next.js marketplace app
│
├── packages/                # Shared packages & agents
│   ├── agent-core/          # Base agent infrastructure
│   ├── cli/                 # gICM CLI tool
│   └── [agents]/            # Individual agent packages
│
├── services/                # Backend services
│   ├── gicm-money-engine/   # Self-funding system
│   ├── gicm-product-engine/ # Automated product dev
│   ├── context-engine/      # MCP server (Python)
│   └── ai-hedge-fund/       # Trading system (Python)
│
├── pnpm-workspace.yaml      # Workspace configuration
└── package.json             # Root package.json
```

---

## Workspace Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'services/*'
```

All packages use ESM modules with TypeScript.

---

## Services (Backend)

### 1. gicm-money-engine
**Location:** `services/gicm-money-engine/`
**Package:** `@gicm/money-engine`
**Purpose:** Self-funding system for the gICM platform

**Features:**
- Treasury management (SOL/USDC balances, allocations)
- DCA trading bots (paper/micro/live modes)
- Expense tracking with auto-pay
- Risk management

**CLI Commands:**
```bash
gicm-money start              # Start the engine
gicm-money status             # Show financial status
gicm-money expenses           # Show expense breakdown
gicm-money trade              # Trigger manual DCA
```

**Key Files:**
- `src/index.ts` - MoneyEngine class
- `src/cli.ts` - CLI interface
- `src/core/treasury.ts` - TreasuryManager
- `src/trading/bots/dca.ts` - DCABot
- `src/expenses/index.ts` - ExpenseManager

**Build:**
```bash
cd services/gicm-money-engine && pnpm build
```

---

### 2. Product Engine
**Location:** `packages/product-engine/`
**Package:** `@gicm/product-engine`
**Purpose:** Autonomous product development - discovery, building, quality, deployment

**Features:**
- **Discovery System:** Scans competitors (Cursor, Replit, v0, Bolt, Lovable), GitHub trends, HackerNews
- **Opportunity Evaluation:** LLM-powered scoring (userDemand, competitiveValue, technicalFit, effort, impact)
- **Agent Builder:** Auto-generates agents from templates (basic, tool_agent, trading_agent, research_agent)
- **Quality Gate:** Automated testing (vitest) + AI code review
- **Cron Automation:** Discovery every 6h, builds hourly

**CLI Commands:**
```bash
gicm-product start              # Start autonomous engine (24/7)
gicm-product discover           # Run discovery now
gicm-product backlog            # View opportunity backlog
gicm-product approve <id>       # Approve for building
gicm-product reject <id> [why]  # Reject opportunity
gicm-product build              # Build next approved
gicm-product status             # Show engine metrics
```

**Key Files:**
- `src/index.ts` - ProductEngine class (main orchestrator)
- `src/cli.ts` - CLI interface
- `src/discovery/index.ts` - DiscoveryManager
- `src/discovery/evaluator.ts` - OpportunityEvaluator
- `src/discovery/sources/competitors.ts` - Competitor scanning
- `src/discovery/sources/github.ts` - GitHub trend discovery
- `src/discovery/sources/hackernews.ts` - HN discovery
- `src/builder/agents/agent-builder.ts` - Agent code generator
- `src/builder/agents/templates.ts` - Agent templates
- `src/quality/testing.ts` - TestRunner
- `src/quality/review.ts` - CodeReviewer

**Build:**
```bash
cd packages/product-engine && pnpm build
```

---

### 3. Growth Engine
**Location:** `packages/growth-engine/`
**Package:** `@gicm/growth-engine`
**Purpose:** Autonomous content and marketing automation - 10x traffic every 6 months

**Targets:**
- 3 blog posts/week (AI-generated, SEO-optimized)
- 5 tweets/day (auto-generated and scheduled)
- SEO keyword research and optimization
- Discord engagement (future)

**Features:**
- **Blog Generator:** AI-powered blog posts with templates, SEO optimization
- **Twitter Automation:** Client, queue, generator for scheduled posting
- **SEO System:** Keyword research, content optimization, meta generation
- **Cron Automation:** Weekly blog generation, daily tweets, metrics collection

**CLI Commands:**
```bash
gicm-growth start              # Start autonomous engine (24/7)
gicm-growth generate blog      # Generate blog post now
gicm-growth generate tweet     # Generate tweets now
gicm-growth keywords <topic>   # Research keywords for topic
gicm-growth status             # Show engine metrics
```

**Key Files:**
- `src/index.ts` - GrowthEngine class (main orchestrator)
- `src/cli.ts` - CLI interface
- `src/content/blog/generator.ts` - BlogGenerator
- `src/social/twitter/client.ts` - Twitter API wrapper
- `src/social/twitter/queue.ts` - Tweet scheduling queue
- `src/social/twitter/generator.ts` - AI tweet generation
- `src/social/twitter/index.ts` - TwitterManager
- `src/seo/keywords.ts` - KeywordResearcher
- `src/seo/optimizer.ts` - SEOOptimizer

**Build:**
```bash
cd packages/growth-engine && pnpm build
```

---

### 4. context-engine
**Location:** `services/context-engine/`
**Language:** Python
**Purpose:** MCP server for codebase understanding

**Features:**
- Gemini embeddings (free tier)
- Semantic code search
- File indexing

**Run:**
```bash
cd services/context-engine
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

---

### 5. ai-hedge-fund
**Location:** `services/ai-hedge-fund/`
**Language:** Python (LangChain)
**Purpose:** Trading system with multiple strategies

---

## Packages (TypeScript)

### Core Infrastructure

| Package | Location | Purpose |
|---------|----------|---------|
| `@gicm/agent-core` | `packages/agent-core/` | Base agent class, LLM client, shared types |
| `@gicm/cli` | `packages/cli/` | Main gICM CLI tool |
| `@gicm/mcp-server` | `packages/mcp-server/` | MCP server implementation |
| `@gicm/platform-adapters` | `packages/platform-adapters/` | Platform integration adapters |

### Agent Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@gicm/wallet-agent` | `packages/wallet-agent/` | Wallet operations, token swaps |
| `@gicm/defi-agent` | `packages/defi-agent/` | DeFi protocols, yield farming |
| `@gicm/audit-agent` | `packages/audit-agent/` | Smart contract auditing |
| `@gicm/hunter-agent` | `packages/hunter-agent/` | Token opportunity hunting |
| `@gicm/decision-agent` | `packages/decision-agent/` | Trade decision making |
| `@gicm/nft-agent` | `packages/nft-agent/` | NFT operations |
| `@gicm/dao-agent` | `packages/dao-agent/` | DAO governance |
| `@gicm/social-agent` | `packages/social-agent/` | Social media automation |
| `@gicm/bridge-agent` | `packages/bridge-agent/` | Cross-chain bridging |

### Utility Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@gicm/orchestrator` | `packages/orchestrator/` | Multi-agent orchestration |
| `@gicm/gicm-orchestrator` | `packages/gicm-orchestrator/` | gICM-specific orchestration |
| `@gicm/backtester` | `packages/backtester/` | Strategy backtesting |
| `@gicm/quantagent` | `packages/quantagent/` | Quantitative analysis |
| `@gicm/activity-logger` | `packages/activity-logger/` | Activity logging |
| `@gicm/growth-engine` | `packages/growth-engine/` | Autonomous content/marketing (blog, Twitter, SEO) |

### Builder Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@gicm/builder-agent` | `packages/builder-agent/` | Code generation |
| `@gicm/refactor-agent` | `packages/refactor-agent/` | Code refactoring |
| `@gicm/deployer-agent` | `packages/deployer-agent/` | Deployment automation |

### UI Packages

| Package | Location | Purpose |
|---------|----------|---------|
| `@gicm/react-grab` | `packages/react-grab/` | Click-to-copy element context |

---

## Agent Architecture Pattern

All agents follow the same base pattern from `@gicm/agent-core`:

```typescript
import { EventEmitter } from "eventemitter3";

export interface AgentEvents {
  started: () => void;
  completed: (result: unknown) => void;
  error: (error: Error) => void;
  progress: (percent: number, message: string) => void;
}

export abstract class BaseAgent extends EventEmitter<AgentEvents> {
  protected config: AgentConfig;

  constructor(config: Partial<AgentConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  abstract run(input: unknown): Promise<unknown>;
}
```

**Key points:**
- `BaseAgent` is NOT generic (no type parameters)
- Use `EventEmitter3` for events
- LLM client pattern: `createLLMClient()` function

---

## Build Commands

### Build Everything
```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm -r build

# Or build in parallel
pnpm -r --parallel build
```

### Build Specific Packages
```bash
# Build single package
pnpm --filter @gicm/agent-core build

# Build package and its dependencies
pnpm --filter @gicm/wallet-agent... build

# Build all agents
pnpm --filter "@gicm/*-agent" build

# Build all services
pnpm --filter "./services/*" build
```

### Build Order (if needed)
```bash
# Core first
pnpm --filter @gicm/agent-core build

# Then dependent packages
pnpm --filter @gicm/wallet-agent build
pnpm --filter @gicm/defi-agent build
# ... etc
```

---

## Development Workflow

### 1. Starting Fresh
```bash
cd c:\Users\mirko\OneDrive\Desktop\gICM
pnpm install
pnpm -r build
```

### 2. Working on a Package
```bash
# Watch mode (if available)
cd packages/<package-name>
pnpm dev

# Or rebuild on changes
pnpm build --watch
```

### 3. Adding a New Package
```bash
# Create directory
mkdir packages/new-agent

# Initialize package.json
cd packages/new-agent
pnpm init

# Add to workspace (automatic via pnpm-workspace.yaml)
pnpm install
```

### 4. Running Services
```bash
# Money Engine
cd services/gicm-money-engine
node dist/cli.js status

# Product Engine
cd services/gicm-product-engine
node dist/cli.js discover

# Context Engine (Python)
cd services/context-engine
python -m uvicorn src.main:app --port 8000
```

---

## Package.json Template

For new TypeScript packages:

```json
{
  "name": "@gicm/<package-name>",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean",
    "dev": "tsup src/index.ts --format esm --dts --watch"
  },
  "dependencies": {
    "@gicm/agent-core": "workspace:*",
    "eventemitter3": "^5.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## TypeScript Configuration

Standard `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Common Issues & Fixes

### 1. Module Not Found
```bash
# Rebuild the dependency
pnpm --filter @gicm/<dep-name> build

# Then rebuild your package
pnpm --filter @gicm/<your-package> build
```

### 2. Type Errors
```bash
# Check for missing types
pnpm add -D @types/<package-name>
```

### 3. Workspace Sync
```bash
# Force reinstall
pnpm install --force

# Clean and rebuild
rm -rf node_modules
pnpm install
pnpm -r build
```

### 4. tsup Not Found
```bash
# Install at workspace root
pnpm add -D tsup -w

# Or in specific package
cd packages/<name> && pnpm add -D tsup
```

---

## Environment Variables

### Services
```bash
# gicm-money-engine
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
GICM_PRIVATE_KEY=<base64 or JSON array>
DCA_AMOUNT_PER_BUY=10
DCA_SCHEDULE=0 */4 * * *

# gicm-product-engine
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
DISCOVERY_INTERVAL=0 */6 * * *
AUTO_APPROVE_THRESHOLD=80
```

---

## Quick Update Script

To bring all agents up to date:

```bash
#!/bin/bash
# update-all.sh

cd c:\Users\mirko\OneDrive\Desktop\gICM

echo "Installing dependencies..."
pnpm install

echo "Building core packages..."
pnpm --filter @gicm/agent-core build

echo "Building all packages..."
pnpm -r build

echo "Done! All packages built."
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         gICM Platform                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Services   │  │   Packages   │          │
│  │    (apps)    │  │  (backend)   │  │  (library)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    @gicm/agent-core                       │  │
│  │  BaseAgent | LLMClient | Types | EventEmitter            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │  Trading Agents│ │ Builder Agents │ │ Utility Agents │     │
│  │  wallet-agent  │ │ builder-agent  │ │  orchestrator  │     │
│  │  defi-agent    │ │ refactor-agent │ │  backtester    │     │
│  │  hunter-agent  │ │ deployer-agent │ │  activity-log  │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contact & Support

**Owner:** Mirko Basil Dölger
**Role:** Elite full-stack blockchain engineer

---

*This document is the source of truth for AI agents working on gICM.*
