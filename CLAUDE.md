# gICM Platform - Master Documentation

> **Last Updated:** 2025-12-01
> **Owner:** Mirko Basil Dölger
> **Purpose:** Complete reference for AI agents to understand and work with the gICM codebase

---

## 🚀 Active Development: Resilience & Infrastructure

**Current Focus:** Phase 12-16 - Production Hardening

### Completed
- ✅ 12A: Circuit Breaker (`@gicm/agent-core/src/resilience/circuit-breaker.ts`)
- ✅ 12B: Retry Strategy (`@gicm/agent-core/src/resilience/retry.ts`)
- ✅ 12C: Timeout Manager (`@gicm/agent-core/src/resilience/timeout.ts`)
- ✅ 12D: Health Aggregator (`@gicm/agent-core/src/resilience/health-aggregator.ts`)
- ✅ 13A: Secrets Manager (`@gicm/agent-core/src/security/secrets.ts`)
- ✅ 13B: Rate Limiter (`@gicm/agent-core/src/security/rate-limiter.ts`)
- ✅ 13C: API Authentication (`@gicm/agent-core/src/security/auth.ts`)
- ✅ 13D: Security Headers (`@gicm/agent-core/src/security/headers.ts`)
- ✅ 14A: OpenTelemetry (`@gicm/agent-core/src/observability/telemetry.ts`)
- ✅ 14B: Log Aggregator (`@gicm/agent-core/src/observability/log-aggregator.ts`)
- ✅ 14C: Metrics Registry (`@gicm/agent-core/src/observability/metrics-registry.ts`)
- ✅ 14D: SLO Manager (`@gicm/agent-core/src/observability/slo-manager.ts`)

### In Progress

**Phase 15 - Operations**
- 15A: Feature Flags
- 15B: Config Manager
- 15C: Multi-Region
- 15D: Deployment Manager

**Phase 16 - AI/LLM**
- 16A: LLM Cost Tracker
- 16B: Token Analytics
- 16C: Prompt Manager
- 16D: Model Evaluator

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

### 6. Integration Hub ⭐ (PTC Platform)
**Location:** `packages/integration-hub/`
**Package:** `@gicm/integration-hub`
**Purpose:** Central coordination for all gICM engines with PTC (Programmatic Tool Calling)

**Status:** Phase 8 COMPLETE ✅ | Phase 9 NEXT

**📚 Key Documentation:**
- `packages/integration-hub/BACKLOG.md` - Full product backlog (Phases 9-12)
- `packages/integration-hub/PROJECT_STATUS.md` - Quick status reference

**Completed Features (Phase 1-8):**
- ✅ Event bus & engine manager
- ✅ REST API server (Fastify)
- ✅ Workflows system
- ✅ Analytics & metrics
- ✅ Supabase storage integration
- ✅ Bull queue for job processing
- ✅ Webhook notifications
- ✅ Tool registry & agent executor
- ✅ Pipeline scheduling (cron)
- ✅ Real-time WebSockets
- ✅ Cost budgets & alerts
- ✅ Pipeline marketplace
- ✅ OpenAPI documentation
- ✅ E2E testing (Playwright)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION HUB                               │
├─────────────────────────────────────────────────────────────────┤
│  API Server (Fastify) ←→ WebSocket Manager                      │
│       ↓                        ↓                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Router  │  │Analytics│  │Scheduler│  │ Budgets │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       │            │            │            │                  │
│       ▼            ▼            ▼            ▼                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Event Bus                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Queue  │  │ Storage │  │Webhooks │  │Marketplace│           │
│  │ (Bull)  │  │(Supabase)│ │         │  │          │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Key Modules:**
| Module | Location | Purpose |
|--------|----------|---------|
| Event Bus | `src/event-bus.ts` | Cross-engine communication |
| API Server | `src/api/server.ts` | REST + WebSocket API |
| Scheduler | `src/scheduler/` | Cron-based pipeline execution |
| Budgets | `src/budgets/` | Cost tracking & alerts |
| Marketplace | `src/marketplace/` | Template sharing |
| Queue | `src/queue/` | Job processing (Bull) |
| Storage | `src/storage/` | Supabase persistence |

**Dashboard Pages:**
| Page | Route |
|------|-------|
| Pipelines | `/pipelines` |
| Schedules | `/pipelines/schedules` |
| Budgets | `/pipelines/budgets` |
| Marketplace | `/pipelines/marketplace` |
| API Docs | `/pipelines/api-docs` |

**Next Phase (9) - Enterprise & Security:**
- 9A: Multi-Tenancy & RBAC
- 9B: Audit Logging
- 9C: Advanced Caching
- 9D: Plugin System
- 9E: SDK Generation
- 9F: Performance Dashboard

**Build:**
```bash
pnpm --filter @gicm/integration-hub build
```

---

### 7. THE DOOR (MCP Integration System)
**Purpose:** Complete MCP-native development environment with 8 integrated phases

**Completed Phases:**
- ✅ Phase 1: Core Commands (`init`, `index`, `setup-claude`)
- ✅ Phase 2: Local Dev (`dev`, `status`, docker-compose)
- ✅ Phase 3: Cloud Connect (`context save/load/list`)
- ✅ Phase 4: Capability Router (`suggest`, `dev.suggest_capabilities`)
- ✅ Phase 5: Agent Orchestration (`@gicm/workflow-engine`)
- ✅ Phase 6: Live Sync (`@gicm/watcher`)
- ✅ Phase 7: AI Memory (`@gicm/memory`)
- ✅ Phase 8: Team Mode (team CLI commands)

**CLI Commands:**
```bash
# Workflows
gicm workflow create <name>    # Create workflow
gicm workflow list             # List workflows
gicm workflow run <name>       # Execute workflow
gicm workflow status [id]      # Check status

# File Watching
gicm watch start               # Start file watcher
gicm watch stop                # Stop watcher
gicm watch status              # Show status
gicm watch changes             # Recent changes

# AI Memory
gicm memory remember <key>     # Store memory
gicm memory recall <key>       # Recall memory
gicm memory search <query>     # Search memories
gicm memory forget <key>       # Delete memory
gicm memory stats              # Memory statistics

# Team Collaboration
gicm team create <name>        # Create team
gicm team list                 # List teams
gicm team add-member           # Add member
gicm team share <type> <name>  # Share resource
gicm team sync                 # Sync shared resources
```

**MCP Tools (dev.* namespace):**
| Tool | Description |
|------|-------------|
| `dev.workflow_create` | Create workflow definition |
| `dev.workflow_run` | Execute workflow |
| `dev.workflow_status` | Get execution status |
| `dev.workflow_list` | List available workflows |
| `dev.watch_status` | File watcher status |
| `dev.watch_changes` | Recent file changes |
| `dev.watch_reindex` | Trigger re-indexing |
| `dev.watch_clear` | Clear change history |
| `dev.memory_remember` | Store a memory |
| `dev.memory_recall` | Recall a memory |
| `dev.memory_search` | Search memories |
| `dev.memory_forget` | Delete a memory |
| `dev.memory_stats` | Memory statistics |
| `dev.team_create` | Create a team |
| `dev.team_list` | List teams |
| `dev.team_show` | Show team details |
| `dev.team_add_member` | Add team member |
| `dev.team_share` | Share resource with team |
| `dev.team_shared` | List shared resources |
| `dev.team_sync` | Sync shared resources |
| `dev.team_delete` | Delete a team |

**Key Packages:**
- `@gicm/workflow-engine` - Multi-agent workflow orchestration
- `@gicm/watcher` - File watching with debounce and auto-reindex
- `@gicm/memory` - Persistent memory storage with namespaces

---

### 8. Autonomy Engine
**Location:** `packages/autonomy/`
**Package:** `@gicm/autonomy`
**Purpose:** Level 2+ bounded autonomous execution with human oversight

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMY ENGINE                               │
├─────────────────────────────────────────────────────────────────┤
│  Action → RiskClassifier → BoundaryChecker → DecisionRouter     │
│              ↓                                                   │
│      ┌───────┴───────────┬──────────────┬──────────────┐        │
│      ↓                   ↓              ↓              ↓        │
│  auto_execute     queue_approval    escalate       reject       │
│      ↓                   ↓              ↓                       │
│  AutoExecutor      ApprovalQueue   NotificationMgr              │
│      ↓                   ↓                                      │
│  AuditLogger ←───────────┴──────────────────────────────        │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Risk Classification:** 0-100 score with weighted factors (financial 35%, reversibility 20%, category 15%, urgency 15%, visibility 15%)
- **Decision Routing:** auto_execute | queue_approval | escalate | reject
- **Autonomy Levels:** 1 (manual) → 2 (bounded) → 3 (supervised) → 4 (autonomous)
- **Boundary Enforcement:** Daily limits, value thresholds, blocked keywords
- **Approval Queue:** Priority ordering, auto-expiration, batch operations
- **Audit Trail:** Hash-chain integrity, complete action history

**CLI Commands:**
```bash
gicm-autonomy status            # Show engine status
gicm-autonomy queue             # List pending approvals
gicm-autonomy approve <id>      # Approve a request
gicm-autonomy reject <id>       # Reject a request
gicm-autonomy batch-approve     # Batch approve (--safe, --category, --risk)
gicm-autonomy boundaries        # Show/update operational boundaries
gicm-autonomy audit             # View audit log
gicm-autonomy stats             # Show detailed statistics
```

**Key Files:**
- `src/index.ts` - AutonomyEngine class (main orchestrator)
- `src/cli.ts` - CLI interface
- `src/core/types.ts` - Zod schemas for all types
- `src/core/config.ts` - Configuration management
- `src/core/constants.ts` - Risk weights and thresholds
- `src/decision/risk-classifier.ts` - RiskClassifier
- `src/decision/boundary-checker.ts` - BoundaryChecker
- `src/decision/decision-router.ts` - DecisionRouter
- `src/execution/auto-executor.ts` - AutoExecutor
- `src/execution/safe-actions.ts` - Safe action definitions
- `src/execution/rollback-manager.ts` - RollbackManager
- `src/approval/approval-queue.ts` - ApprovalQueue
- `src/approval/notification-manager.ts` - NotificationManager
- `src/approval/batch-approval.ts` - BatchApproval
- `src/audit/audit-logger.ts` - AuditLogger
- `src/integration/engine-adapter.ts` - Base adapter
- `src/integration/money-adapter.ts` - MoneyEngine adapter
- `src/integration/growth-adapter.ts` - GrowthEngine adapter
- `src/integration/product-adapter.ts` - ProductEngine adapter

**Engine Adapters:**
```typescript
import { MoneyEngineAdapter } from "@gicm/autonomy/integration";

const moneyAdapter = new MoneyEngineAdapter();
const action = moneyAdapter.createDCAAction({ asset: "SOL", amount: 10 });
const decision = await autonomy.route(action);
```

**Risk Thresholds:**
- Safe: 0-20 → auto_execute
- Low: 21-40 → auto_execute (content), queue_approval (trading)
- Medium: 41-60 → queue_approval
- High: 61-80 → escalate
- Critical: 81-100 → reject (or escalate)

**Default Boundaries:**
```json
{
  "financial": { "maxAutoExpense": 50, "maxDailySpend": 100, "maxTradeSize": 500 },
  "content": { "maxAutoPostsPerDay": 10, "maxAutoBlogsPerWeek": 3 },
  "development": { "maxAutoCommitLines": 100, "autoDeployToProduction": false }
}
```

**Build:**
```bash
cd packages/autonomy && pnpm build
```

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
| `@gicm/autonomy` | `packages/autonomy/` | Level 2+ bounded autonomous execution |
| `@gicm/backtester` | `packages/backtester/` | Strategy backtesting |
| `@gicm/quantagent` | `packages/quantagent/` | Quantitative analysis |
| `@gicm/activity-logger` | `packages/activity-logger/` | Activity logging |
| `@gicm/growth-engine` | `packages/growth-engine/` | Autonomous content/marketing (blog, Twitter, SEO) |

### THE DOOR Packages (MCP Integration)

| Package | Location | Purpose |
|---------|----------|---------|
| `@gicm/workflow-engine` | `packages/workflow-engine/` | Multi-agent workflow orchestration |
| `@gicm/watcher` | `packages/watcher/` | Live file sync with auto-reindex |
| `@gicm/memory` | `packages/memory/` | AI persistent memory across sessions |

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

# @gicm/autonomy
GICM_AUTONOMY_LEVEL=2              # 1=manual, 2=bounded, 3=supervised, 4=autonomous
GICM_APPROVAL_EXPIRE_HOURS=24      # Auto-expire pending approvals
GICM_NOTIFICATION_RATE_LIMIT=10    # Max notifications per minute
TELEGRAM_BOT_TOKEN=<token>         # Optional: Telegram notifications
TELEGRAM_CHAT_ID=<chat_id>         # Optional: Telegram chat
DISCORD_WEBHOOK_URL=<url>          # Optional: Discord notifications
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
│  │                    @gicm/autonomy                         │  │
│  │  RiskClassifier | BoundaryChecker | ApprovalQueue        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
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

## NPM Packages (Published)

All packages are published to npm under the `@gicm` organization.

**Install any package:**
```bash
npm install @gicm/<package-name>
# or
pnpm add @gicm/<package-name>
```

### Published Packages (33 total)

| Package | Version | Description |
|---------|---------|-------------|
| **Core Infrastructure** |||
| `@gicm/agent-core` | 1.0.0 | Base agent class, LLM client, shared types |
| `@gicm/brain-config` | 1.0.0 | Centralized configuration management |
| `@gicm/cli` | 1.1.3 | Main gICM CLI tool |
| `@gicm/mcp-server` | 1.0.1 | MCP server implementation |
| `@gicm/platform-adapters` | 1.0.0 | Platform integration adapters |
| **Trading Agents** |||
| `@gicm/wallet-agent` | 1.0.0 | Wallet operations, token swaps |
| `@gicm/defi-agent` | 1.0.1 | DeFi protocols, yield farming |
| `@gicm/hunter-agent` | 0.1.1 | Token opportunity hunting |
| `@gicm/decision-agent` | 0.1.1 | Trade decision making |
| **Utility Agents** |||
| `@gicm/audit-agent` | 1.0.1 | Smart contract auditing |
| `@gicm/nft-agent` | 0.1.1 | NFT operations |
| `@gicm/dao-agent` | 0.1.1 | DAO governance |
| `@gicm/social-agent` | 0.1.0 | Social media automation |
| `@gicm/bridge-agent` | 0.1.1 | Cross-chain bridging |
| **Builder Agents** |||
| `@gicm/builder-agent` | 0.1.1 | Code generation |
| `@gicm/refactor-agent` | 0.1.0 | Code refactoring |
| `@gicm/deployer-agent` | 0.1.1 | Deployment automation |
| **Engines** |||
| `@gicm/money-engine` | 1.0.0 | Self-funding treasury system |
| `@gicm/growth-engine` | 1.0.1 | Content & marketing automation |
| `@gicm/product-engine` | 1.0.0 | Autonomous product development |
| **Orchestration** |||
| `@gicm/orchestrator` | 0.1.0 | Multi-agent orchestration |
| `@gicm/gicm-orchestrator` | 0.1.1 | gICM-specific orchestration |
| `@gicm/autonomy` | 1.0.0 | Level 2+ bounded autonomous execution |
| `@gicm/gicm-autonomy` | 0.1.0 | gICM autonomy integration |
| `@gicm/integration-hub` | 0.1.1 | Service integration hub |
| `@gicm/hub` | 1.0.1 | Central coordination hub |
| `@gicm/hyper-brain` | 1.0.0 | Advanced AI orchestration |
| `@gicm/ptc-coordinator` | 1.0.0 | PTC coordination system |
| **Utilities** |||
| `@gicm/activity-logger` | 0.1.0 | Activity logging |
| `@gicm/backtester` | 0.1.1 | Strategy backtesting |
| `@gicm/quantagent` | 1.0.0 | Quantitative analysis |
| `@gicm/wins` | 1.0.0 | Win tracking system |
| `@gicm/react-grab` | 1.0.0 | Click-to-copy element context for AI |

### Publishing New Versions

```bash
# Bump version and publish
cd packages/<package-name>
npm version patch  # or minor/major
pnpm publish --access public --no-git-checks
```

---

## OPUS 67 - Enhancement Layer (NOT a separate AI)

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

**Location:** `packages/opus67/`
**Package:** `@gicm/opus67`
**Version:** v3.3.0 "Unified"

**Stats:**
- **95 Skills** | **84 MCPs** | **30 Modes** | **82 Agents**

**Key Documentation:**
- `packages/opus67/docs/WHAT-IS-OPUS67.md` - Full explanation
- `packages/opus67/docs/VERSION-HISTORY.md` - Version changelog
- `packages/opus67/docs/v31-eyes-update.md` - v3.1 features
- `packages/opus67/docs/v32-solana-stack.md` - v3.2 features

**What It Provides:**
1. **MCP Servers (84)** - GitHub, Jupiter, Supabase, Sentry, etc.
2. **Skills (95)** - GRAB skills, Solana skills, Research skills
3. **Modes (30)** - AUTO, BUILD, SOLANA, GRAB, CLONE, RESEARCH
4. **Memory** - Persistent context via Mem0 and Qdrant

**CLI:**
```bash
opus67 init              # Register with Claude Code
opus67 boot              # Show boot screen
opus67 status            # System status
opus67-server            # Start BRAIN HTTP server
```

**Remember: Claude IS the brain. OPUS 67 just makes Claude faster, cheaper, and more capable.**

---

## Contact & Support

**Owner:** Mirko Basil Dölger
**Role:** Elite full-stack blockchain engineer
**NPM Org:** [@gicm](https://www.npmjs.com/org/gicm)

---

*This document is the source of truth for AI agents working on gICM.*
