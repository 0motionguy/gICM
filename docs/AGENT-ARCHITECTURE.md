# gICM Agent Architecture & Folder Management

> Documentation for the autonomous empire infrastructure - agents, engines, and workflows.

## Overview

gICM's autonomous system is organized as a **monorepo** with three core engines:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           gICM BRAIN                                     │
│                    packages/orchestrator/src/brain/                      │
│                                                                          │
│  Goal System → Decision Engine → Daily Cycle → Self-Improvement         │
└─────────────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  MONEY ENGINE   │  │  GROWTH ENGINE  │  │ PRODUCT ENGINE  │
│ packages/       │  │ packages/       │  │ packages/       │
│ money-engine/   │  │ growth-engine/  │  │ product-engine/ │
└─────────────────┘  └─────────────────┘  └─────────────────┘
           │                    │                    │
           └────────────────────┼────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SPECIALIZED AGENTS                                │
│                                                                          │
│  wallet-agent │ defi-agent │ audit-agent │ social-agent │ ...          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
gICM/
├── packages/                    # TypeScript packages (npm publishable)
│   │
│   │  ─────────── CORE ───────────
│   ├── agent-core/              # Shared agent utilities & base classes
│   ├── orchestrator/            # Multi-agent coordination & brain
│   │   └── src/brain/           # Goal system, decision engine
│   │
│   │  ─────────── ENGINES ───────────
│   ├── money-engine/            # Treasury, trading, expenses
│   ├── growth-engine/           # Content, social, SEO automation (blog, Twitter, SEO)
│   ├── product-engine/          # Discovery, building, quality (competitors, GitHub, HN)
│   │
│   │  ─────────── AGENTS ───────────
│   ├── wallet-agent/            # Wallet operations & balance tracking
│   ├── defi-agent/              # DeFi analytics & yield optimization
│   ├── audit-agent/             # Smart contract security analysis
│   ├── nft-agent/               # NFT analytics & minting
│   ├── dao-agent/               # Governance & DAO interactions
│   ├── social-agent/            # Social sentiment analysis
│   ├── bridge-agent/            # Cross-chain bridging
│   ├── hunter-agent/            # Discovery & opportunity scanning
│   ├── decision-agent/          # Decision-making logic
│   │
│   │  ─────────── TRADING ───────────
│   ├── backtester/              # Strategy backtesting
│   ├── quantagent/              # Quantitative analysis
│   │
│   │  ─────────── INFRA ───────────
│   ├── mcp-server/              # MCP tools for Claude Code
│   ├── cli/                     # Command-line interface
│   └── activity-logger/         # On-chain activity logging
│
├── services/                    # Python services (FastAPI/LangGraph)
│   ├── ai-hedge-fund/           # Multi-persona trading system
│   └── context-engine/          # Code indexing & MCP server
│
└── docs/                        # Documentation
    └── AGENT-ARCHITECTURE.md    # This file
```

---

## Package Structure Conventions

### TypeScript Packages (`packages/`)

Every package follows this structure:

```
packages/{package-name}/
├── package.json                 # @gicm/{name} - workspace linked
├── tsconfig.json                # Extends root config
├── tsup.config.ts               # Build configuration
│
├── src/
│   ├── index.ts                 # Main exports (barrel file)
│   │
│   ├── core/                    # Core types & constants
│   │   └── types.ts             # All TypeScript types
│   │
│   ├── {feature}/               # Feature modules
│   │   ├── index.ts             # Feature exports
│   │   └── {implementation}.ts  # Implementation files
│   │
│   └── utils/                   # Shared utilities
│       └── logger.ts            # Logging utility
│
├── dist/                        # Built output (git-ignored)
└── tests/                       # Test files
    └── {feature}.test.ts
```

### Python Services (`services/`)

```
services/{service-name}/
├── pyproject.toml               # Poetry config
├── README.md
├── .env.example
│
├── src/
│   ├── __init__.py
│   ├── main.py                  # Entry point
│   ├── config.py                # Pydantic settings
│   │
│   ├── agents/                  # Agent implementations
│   │   ├── __init__.py
│   │   ├── base_agent.py        # Base class
│   │   ├── personas/            # Investor personas
│   │   ├── crypto/              # Crypto-native agents
│   │   └── management/          # Risk/portfolio managers
│   │
│   ├── api/                     # FastAPI routes
│   │   ├── __init__.py
│   │   ├── app.py               # FastAPI app
│   │   └── routes.py            # API endpoints
│   │
│   ├── data/                    # Data providers
│   │   ├── birdeye.py
│   │   ├── helius.py
│   │   └── market_data.py
│   │
│   ├── trading/                 # Trade execution
│   │   └── jupiter.py
│   │
│   └── workflow/                # LangGraph workflows
│       └── trading_graph.py
│
└── tests/
```

---

## The Three Engines

### 1. Money Engine (`packages/money-engine/`)

**Purpose:** Self-funding system - treasury management, expense tracking, trading bots.

```
money-engine/src/
├── core/
│   └── types.ts                 # Treasury, Trading, Expense, Budget types
│
├── treasury/
│   ├── manager.ts               # TreasuryManager class
│   │   ├── updateBalances()     # Update from blockchain
│   │   ├── getTotalValueUsd()   # Total portfolio value
│   │   ├── getAllocations()     # Trading/ops/growth/reserve splits
│   │   ├── needsRebalance()     # Check allocation drift
│   │   └── getStatus()          # Full treasury status
│   └── index.ts
│
├── expenses/
│   ├── tracker.ts               # ExpenseTracker class
│   │   ├── addExpense()         # Add recurring/one-time
│   │   ├── addDefaultExpenses() # Claude, Helius, Vercel, etc.
│   │   ├── markPaid()           # Record payment
│   │   ├── getUpcoming()        # Due within N days
│   │   ├── getBudgetStatus()    # Budget vs actual by category
│   │   └── getMonthlyTotal()    # Total monthly burn
│   └── index.ts
│
├── trading/                     # (Future)
│   ├── bots/
│   │   ├── dca.ts               # Dollar-cost averaging
│   │   ├── grid.ts              # Grid trading
│   │   └── yield.ts             # Yield optimization
│   └── risk-manager.ts
│
└── analytics/                   # (Future)
    ├── pnl.ts                   # Profit & loss
    └── reports.ts               # Financial reports
```

**Key Types:**
```typescript
// Treasury allocation
interface Treasury {
  balances: { sol, usdc, tokens };
  allocations: { trading: 40%, operations: 30%, growth: 20%, reserve: 10% };
  wallets: { main, trading, operations, cold };
  thresholds: { minOperatingBalance, maxTradingAllocation, rebalanceThreshold };
}

// Expense tracking
interface Expense {
  category: "api_subscriptions" | "infrastructure" | "marketing" | "tools" | "legal";
  type: "one-time" | "recurring";
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  autoPay: boolean;
}

// Trading modes
type TradingMode = "paper" | "micro" | "live";
```

---

### 2. Growth Engine (`packages/growth-engine/`)

**Purpose:** Autonomous content and marketing automation. Goal: 10x traffic every 6 months.

**Targets:**
- 3 blog posts/week
- 5 tweets/day
- SEO optimization
- Discord engagement

```
growth-engine/src/
├── core/
│   └── types.ts                 # BlogPost, Tweet, Keyword, ContentCalendar, GrowthMetrics types
│
├── content/
│   └── blog/
│       ├── generator.ts         # BlogGenerator class
│       │   ├── generate()       # Generate full blog post with AI
│       │   ├── findKeywords()   # Research target keywords
│       │   ├── generateContent()# Generate markdown content
│       │   ├── generateTitle()  # SEO-optimized title
│       │   ├── generateExcerpt()# Generate excerpt
│       │   └── generateSEO()    # Meta tags generation
│       └── templates.ts         # Blog post templates by category
│
├── social/
│   └── twitter/
│       ├── client.ts            # TwitterClient (twitter-api-v2 wrapper)
│       │   ├── init()           # Verify credentials
│       │   ├── tweet()          # Post single tweet
│       │   ├── thread()         # Post tweet thread
│       │   ├── getMetrics()     # Get tweet metrics
│       │   ├── search()         # Search tweets
│       │   └── uploadMedia()    # Upload images/videos
│       │
│       ├── queue.ts             # TweetQueue class
│       │   ├── add()            # Add to schedule
│       │   ├── addBatch()       # Add multiple tweets
│       │   ├── findNextSlot()   # Find optimal posting time
│       │   ├── processQueue()   # Execute due tweets
│       │   └── getStatus()      # Queue metrics
│       │
│       ├── generator.ts         # TweetGenerator class
│       │   ├── generate()       # Single tweet by topic/type
│       │   ├── generateThread() # Multi-tweet thread
│       │   ├── fromBlogPost()   # Promote blog post
│       │   ├── generateDailyBatch() # 5 tweets/day
│       │   └── review()         # AI tweet review
│       │
│       └── index.ts             # TwitterManager orchestrator
│           ├── init()           # Initialize Twitter automation
│           ├── start()          # Start queue + daily cron
│           ├── stop()           # Stop automation
│           ├── generateDailyContent() # Generate daily tweets
│           ├── promoteBlogPost()# Queue blog promo tweets
│           └── findEngagementOpportunities()
│
├── seo/
│   ├── keywords.ts              # KeywordResearcher class
│   │   ├── research()           # Research keywords for topic
│   │   ├── findRelated()        # Find related keywords
│   │   ├── analyze()            # Analyze single keyword
│   │   ├── findContentGaps()    # Find missing content
│   │   └── cluster()            # Group keywords by topic
│   │
│   ├── optimizer.ts             # SEOOptimizer class
│   │   ├── analyze()            # Analyze content for SEO
│   │   ├── optimize()           # AI-powered optimization
│   │   ├── generateMeta()       # Generate meta tags
│   │   ├── analyzeBlogPost()    # Blog-specific analysis
│   │   ├── generateSchema()     # JSON-LD schema markup
│   │   └── analyzeUrl()         # URL SEO check
│   │
│   └── index.ts
│
├── utils/
│   ├── logger.ts                # Pino logger
│   └── llm.ts                   # Anthropic SDK wrapper
│
├── index.ts                     # GrowthEngine main class
│   ├── start()                  # Start all automation
│   ├── stop()                   # Stop automation
│   ├── generateWeeklyContent()  # Weekly content cycle
│   ├── collectMetrics()         # Metrics collection
│   ├── generateNow()            # Generate on-demand
│   └── researchKeywords()       # Keyword research
│
└── cli.ts                       # CLI interface
    └── Commands: start, generate, keywords, status, help
```

**CLI Commands:**
```bash
gicm-growth start              # Start autonomous engine
gicm-growth generate blog      # Generate blog post now
gicm-growth generate tweet     # Generate tweets now
gicm-growth keywords <topic>   # Research keywords
gicm-growth status             # Show metrics
```

**Key Types:**
```typescript
// Blog categories with templates
type BlogCategory = "tutorial" | "announcement" | "comparison" | "guide" |
                    "case-study" | "thought-leadership" | "changelog";

// Content calendar
interface ContentCalendar {
  schedule: { monday: ContentSlot[], tuesday: ContentSlot[], ... };
  upcoming: ScheduledContent[];
  mix: { blog: 3/week, twitter: 5/day, discord: 3/day };
}

// Tweet templates
const TWEET_TEMPLATES = {
  product_update: "🚀 New: {feature_name}...",
  educational: "💡 {title}...",
  engagement: "❓ {question}...",
  alpha: "🔥 {insight}...",
};
```

---

### 3. Brain / Orchestrator (`packages/orchestrator/src/brain/`)

**Purpose:** Goal system, decision engine, daily operating cycle.

```
orchestrator/src/
├── brain/
│   ├── goal-system.json         # Configuration (metrics, schedules, values)
│   └── goal-system.ts           # GoalSystemManager class
│       ├── getPrimeDirective()
│       ├── getCoreValues()
│       ├── getCurrentAutonomyLevel()
│       ├── evaluateScore()      # auto_approve | manual_review | auto_reject
│       ├── getCurrentPhase()    # morning_scan | execution | reflection | ...
│       ├── getTodayFocus()      # Monday=Planning, Tuesday=Building, ...
│       └── canProgressTradingMode()
│
├── workflows/
│   ├── research.ts              # Research workflow
│   ├── portfolio.ts             # Portfolio management
│   └── trading.ts               # Trading decisions
│
├── coordination/
│   ├── router.ts                # Route requests to agents
│   └── memory.ts                # Shared memory/context
│
└── types.ts
```

**Goal System Structure (`goal-system.json`):**
```json
{
  "primeDirective": "Become the world's most advanced autonomous AI development platform",

  "coreValues": [
    { "name": "safety_first", "priority": 1 },
    { "name": "continuous_improvement", "priority": 2 },
    { "name": "speed_of_iteration", "priority": 3 },
    { "name": "user_value", "priority": 4 },
    { "name": "transparency", "priority": 5 },
    { "name": "self_reliance", "priority": 6 }
  ],

  "autonomyLevels": {
    "current": 2,
    "targets": { "2025": 3, "2027": 6 }
  },

  "metrics": {
    "daily": { "discoveries_scanned": 100, "integrations": 1, "uptime": 99.9 },
    "weekly": { "new_components": 5, "user_features": 3, "innovations": 1 },
    "monthly": { "major_capabilities": 3, "autonomy_increase": 0.5 }
  },

  "decisionThresholds": {
    "auto_approve_score": 85,
    "manual_review_score": 70,
    "auto_reject_score": 40
  },

  "schedule": {
    "morning_scan": "00:00-04:00",
    "decision_planning": "04:00-06:00",
    "execution": "06:00-20:00",
    "reflection": "20:00-23:00",
    "maintenance": "23:00-00:00"
  },

  "trading": {
    "default_mode": "paper",
    "progression_rules": {
      "paper_to_micro": { "win_rate_min": 60, "profitable_days_min": 30, "requires_approval": true },
      "micro_to_live": { "win_rate_min": 65, "profitable_months_min": 3, "requires_approval": true }
    }
  }
}
```

---

### 4. Product Engine (`packages/product-engine/`)

**Purpose:** Autonomous product development - discovers opportunities, builds agents/components, and deploys automatically.

**Workflow:**
1. **Discover** - Scan competitors, GitHub trends, HackerNews for opportunities
2. **Evaluate** - LLM-powered scoring and prioritization
3. **Build** - Auto-generate agents/components from templates
4. **Quality** - Automated testing and code review
5. **Deploy** - Auto-publish to npm (future)

```
product-engine/src/
├── core/
│   └── types.ts                 # Opportunity, BuildTask, AgentSpec, ComponentSpec types
│
├── discovery/
│   ├── index.ts                 # DiscoveryManager orchestrator
│   │   ├── start()              # Start cron schedule (every 6h)
│   │   ├── stop()               # Stop discovery
│   │   ├── runDiscovery()       # Full discovery cycle
│   │   ├── discoverFromSource() # Single source
│   │   ├── getBacklog()         # Prioritized backlog
│   │   ├── approveOpportunity() # Approve for building
│   │   └── rejectOpportunity()  # Reject with reason
│   │
│   ├── evaluator.ts             # OpportunityEvaluator class
│   │   ├── evaluate()           # LLM scoring (0-100)
│   │   │   └── Scores: userDemand, competitiveValue, technicalFit, effort, impact
│   │   └── reEvaluateAll()      # Re-score all
│   │
│   └── sources/
│       ├── competitors.ts       # CompetitorDiscovery
│       │   └── Scans: Cursor, Replit, v0, Bolt, Lovable
│       ├── github.ts            # GitHubDiscovery
│       │   └── Searches: ai coding assistant, claude code, solana typescript, etc.
│       └── hackernews.ts        # HackerNewsDiscovery
│           └── Top 30 stories analysis
│
├── builder/
│   └── agents/
│       ├── templates.ts         # Agent templates
│       │   └── Templates: basic, tool_agent, trading_agent, research_agent
│       │
│       └── agent-builder.ts     # AgentBuilder class
│           ├── designAgent()    # LLM designs agent spec from opportunity
│           ├── buildAgent()     # Generate code from spec
│           ├── generateToolsFile()  # Generate tools.ts
│           ├── generateTests()  # Generate test file
│           ├── selectTemplate() # Pick best template
│           └── buildFromOpportunity() # Full pipeline
│
├── quality/
│   ├── index.ts                 # QualityGate class
│   │   ├── check()              # Full quality check (tests + review)
│   │   ├── quickCheck()         # Review only
│   │   └── generateReport()     # Quality report
│   │
│   ├── testing.ts               # TestRunner class
│   │   ├── runTests()           # Execute vitest
│   │   ├── testsExist()         # Check for tests
│   │   └── generateReport()     # Test report
│   │
│   └── review.ts                # CodeReviewer class
│       ├── review()             # AI code review
│       ├── reviewFile()         # Single file review
│       ├── securityCheck()      # Security patterns check
│       └── generateReport()     # Review report
│
├── utils/
│   ├── logger.ts                # Pino logger
│   └── llm.ts                   # Anthropic SDK wrapper
│
├── index.ts                     # ProductEngine main class
│   ├── start()                  # Start discovery + build crons
│   ├── stop()                   # Stop automation
│   ├── runDiscovery()           # Manual discovery
│   ├── processNextBuild()       # Build next approved opportunity
│   ├── buildOpportunity()       # Build specific opportunity
│   ├── approveOpportunity()     # Approve for building
│   ├── rejectOpportunity()      # Reject with reason
│   └── getStatus()              # Engine metrics
│
└── cli.ts                       # CLI interface
    └── Commands: start, discover, backlog, approve, reject, build, status, help
```

**CLI Commands:**
```bash
gicm-product start              # Start autonomous engine
gicm-product discover           # Run discovery now
gicm-product backlog            # View opportunity backlog
gicm-product approve <id>       # Approve for building
gicm-product reject <id> [why]  # Reject opportunity
gicm-product build              # Build next approved
gicm-product status             # Show engine metrics
```

**Key Types:**
```typescript
// Opportunity types
type OpportunityType = "new_agent" | "new_component" | "new_feature" | "improvement" | "bug_fix" | "integration";
type DiscoverySource = "user_feedback" | "competitor" | "github" | "hackernews" | "technology" | "internal";

// Scoring (0-100 each)
interface OpportunityScores {
  userDemand: number;      // How many users want this?
  competitiveValue: number; // Differentiation from competitors
  technicalFit: number;    // Fits TypeScript/React/Solana stack?
  effort: number;          // Ease of building (100 = easy)
  impact: number;          // Platform improvement value
  overall: number;         // Weighted average
}

// Quality thresholds
interface QualityGateConfig {
  minTestScore: number;    // Default: 80
  minReviewScore: number;  // Default: 70
  requireTests: boolean;
  requireReview: boolean;
}
```

**Competitors Monitored:**
- Cursor (changelog.cursor.com)
- Replit (blog.replit.com)
- v0 (v0.dev)
- Bolt (bolt.new)
- Lovable (lovable.dev)

---

## AI Hedge Fund (`services/ai-hedge-fund/`)

Multi-persona trading system using LangChain/LangGraph.

### Agent Hierarchy

```
ai-hedge-fund/src/agents/
├── base_agent.py                # Abstract base class
│
├── personas/                    # Famous investor strategies
│   ├── warren_buffett.py        # Value investing, moats
│   ├── michael_burry.py         # Contrarian, deep value
│   ├── charlie_munger.py        # Quality at fair price
│   ├── cathie_wood.py           # Disruptive innovation
│   └── bill_ackman.py           # Activist, concentrated
│
├── crypto/                      # Crypto-native strategies
│   ├── degen_agent.py           # High-risk memecoin plays
│   ├── solana_agent.py          # Solana ecosystem specialist
│   ├── whale_agent.py           # Follow whale wallets
│   ├── onchain_agent.py         # On-chain data analysis
│   └── pump_trader.py           # Pump.fun launch trading
│
└── management/                  # Portfolio management
    ├── risk_manager.py          # Risk limits, stop losses
    └── portfolio_manager.py     # Allocation, rebalancing
```

### Trading Modes (`config.py`)

```python
class Settings(BaseSettings):
    # Trading mode: paper (simulated), micro ($100-1000), live (full)
    trading_mode: Literal["paper", "micro", "live"] = "paper"

    # Limits for micro/live modes
    max_position_size_usd: float = 100.0
    daily_loss_limit_usd: float = 50.0

    # Safety
    require_approval: bool = True
    enable_live_trading: bool = False
```

### Data Flow

```
Market Data (Birdeye, Helius)
          │
          ▼
┌─────────────────────┐
│  Persona Agents     │──▶ Individual analysis
│  (Buffett, Burry)   │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Crypto Agents      │──▶ Crypto-specific signals
│  (Degen, Whale)     │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Risk Manager       │──▶ Position sizing, limits
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Portfolio Manager  │──▶ Final decision
└─────────────────────┘
          │
          ▼
    Trade Execution (Jupiter)
```

---

## MCP Integration (`packages/mcp-server/`)

Exposes gICM functionality to Claude Code.

### Tool Registry

```
mcp-server/src/tools/
├── index.ts                     # Main tool registry
│
├── get-file-context.ts          # Code file context
├── search-codebase.ts           # Search code
├── search-components.ts         # Find components
├── index-repository.ts          # Index a repo
│
└── trading/
    ├── index.ts                 # Trading tool exports
    ├── get-market-data.ts       # Token prices (DexScreener)
    ├── analyze-token.ts         # Multi-persona analysis
    └── hedge-fund.ts            # Hedge fund integration
```

### Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_market_data` | Real-time token prices | `token`, `chain?` |
| `analyze_token` | AI multi-persona analysis | `token`, `mode?`, `chain?` |
| `hedge_fund_status` | Trading mode, P&L, positions | - |
| `hedge_fund_analyze` | Run hedge fund analysis | `token`, `mode?` |
| `hedge_fund_positions` | Current holdings | - |
| `hedge_fund_trades` | Trade history | `limit?` |
| `hedge_fund_set_mode` | Switch paper/micro/live | `mode`, `approval_code?` |
| `hedge_fund_trade` | Execute a trade | `token`, `side`, `amount_usd` |

---

## Daily Operating Cycle

```
00:00 ─── MORNING SCAN ───────────────────────────────────
         │ • Hunter agent scans GitHub trending
         │ • Context engine indexes discoveries
         │ • Score opportunities against goal system
         │ • Queue high-value items for integration
         ▼
04:00 ─── DECISION & PLANNING ────────────────────────────
         │ • Evaluate discoveries (auto_approve if score >= 85)
         │ • Generate daily objectives
         │ • Prioritize task queue
         │ • Allocate resources
         ▼
06:00 ─── EXECUTION ──────────────────────────────────────
         │ • Build new features / integrate discoveries
         │ • Trading bots execute strategies
         │ • Growth engine posts to social media
         │ • Context engine re-indexes changed files
         ▼
20:00 ─── REFLECTION ─────────────────────────────────────
         │ • Generate daily summary report
         │ • Extract learnings (what worked, what didn't)
         │ • Update scoring models
         │ • Prepare tomorrow's priorities
         ▼
23:00 ─── MAINTENANCE ────────────────────────────────────
         │ • Cleanup logs, caches
         │ • Backup critical data
         │ • Reset counters for new day
         │ • Pre-fetch data for morning scan
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Package directory | `kebab-case` | `money-engine/` |
| TypeScript file | `kebab-case.ts` | `goal-system.ts` |
| Python file | `snake_case.py` | `trading_graph.py` |
| Type file | `types.ts` | `core/types.ts` |
| Index file | `index.ts` | Always `index.ts` |
| Config | `{name}.config.ts` | `tsup.config.ts` |
| Test | `{name}.test.ts` | `treasury.test.ts` |
| JSON config | `kebab-case.json` | `goal-system.json` |

---

## Adding a New Agent

### 1. Create Package

```bash
mkdir -p packages/{agent-name}/src
```

### 2. Create package.json

```json
{
  "name": "@gicm/{agent-name}",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@gicm/agent-core": "workspace:*"
  }
}
```

### 3. Implement Agent

```typescript
// packages/{agent-name}/src/index.ts
import { BaseAgent, AgentInput, AgentOutput } from "@gicm/agent-core";

export class MyAgent extends BaseAgent {
  name = "my-agent";
  description = "Does something useful";

  async execute(input: AgentInput): Promise<AgentOutput> {
    // Implementation
  }
}
```

### 4. Register with Orchestrator

```typescript
// packages/orchestrator/src/agents/registry.ts
import { MyAgent } from "@gicm/my-agent";
registry.register(new MyAgent());
```

### 5. Expose via MCP (optional)

```typescript
// packages/mcp-server/src/tools/my-agent.ts
export const myAgentTools = {
  my_agent_action: {
    description: "...",
    parameters: { ... }
  }
};
```

---

## Build Commands

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter @gicm/money-engine build

# Development mode (watch)
pnpm --filter @gicm/orchestrator dev

# Type check
pnpm --filter @gicm/growth-engine typecheck

# Run tests
pnpm --filter @gicm/backtester test
```

### Python Services

```bash
cd services/ai-hedge-fund
poetry install
poetry run uvicorn src.api.app:app --reload --port 8001
```

---

## Summary Table

| Component | Location | Language | Purpose |
|-----------|----------|----------|---------|
| **Brain** | `packages/orchestrator/src/brain/` | TypeScript | Goal system, decisions |
| **Money Engine** | `packages/money-engine/` | TypeScript | Treasury, trading, expenses |
| **Growth Engine** | `packages/growth-engine/` | TypeScript | Content (blog, Twitter, SEO) |
| **Product Engine** | `packages/product-engine/` | TypeScript | Discovery, building, quality |
| **AI Hedge Fund** | `services/ai-hedge-fund/` | Python | Multi-persona trading |
| **Context Engine** | `services/context-engine/` | Python | Code indexing (MCP) |
| **Agents** | `packages/*-agent/` | TypeScript | Specialized capabilities |
| **MCP Tools** | `packages/mcp-server/` | TypeScript | Claude Code integration |

## Engine Comparison

| Feature | Money Engine | Growth Engine | Product Engine |
|---------|--------------|---------------|----------------|
| **Runs 24/7** | Yes (trading bots) | Yes (content crons) | Yes (discovery crons) |
| **LLM-Powered** | No | Yes (content gen) | Yes (scoring, building) |
| **External APIs** | Solana, Jupiter | Twitter, Discord | GitHub, competitor sites |
| **Output** | Trades, expenses | Blog posts, tweets | Agents, components |
| **CLI** | `gicm-money` | `gicm-growth` | `gicm-product` |
