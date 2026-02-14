# @gicm/goldfish

Token budget management for OpenClaw — soft/throttle/hard limits, per-agent cost tracking, bill shock prevention.

## Features

- **Multi-period budgets**: Daily, weekly, and monthly budget tracking
- **Three-tier thresholds**: Soft warnings (70%), throttle (90%), and hard limits (100%)
- **Comprehensive cost tracking**: Per-agent, per-session, and per-model analytics
- **Event-driven**: Real-time notifications when budgets cross thresholds
- **Persistent storage**: SQLite database with WAL mode for performance
- **Model pricing**: Built-in pricing table for all major AI providers

## Installation

```bash
pnpm add @gicm/goldfish
```

## Quick Start

```typescript
import { BudgetManager, calculateCost } from "@gicm/goldfish";

// Configure your budgets
const config = {
  daily: { amount: 10.0, resetAt: "00:00" },
  weekly: { amount: 50.0, resetDay: "monday" },
  monthly: { amount: 200.0, resetDay: 1 },
  thresholds: {
    soft: 0.7, // 70% - warning
    throttle: 0.9, // 90% - start throttling
    hard: 1.0, // 100% - hard block
  },
};

// Create budget manager
const goldfish = new BudgetManager(config);

// Listen to threshold events
goldfish.on("budget:soft", (status) => {
  console.log(`⚠️  Approaching budget limit: ${status.percentUsed}% used`);
});

goldfish.on("budget:throttle", (status) => {
  console.log(`🚨 Throttling requests: ${status.percentUsed}% used`);
});

goldfish.on("budget:hard", (status) => {
  console.log(`🛑 Budget exceeded! ${status.percentUsed}% used`);
});

// Record costs
const cost = calculateCost("claude-sonnet-4-5", {
  input: 100_000,
  output: 50_000,
  cacheRead: 200_000,
  cacheWrite: 50_000,
});

goldfish.recordCost({
  timestamp: new Date().toISOString(),
  model: "claude-sonnet-4-5",
  provider: "anthropic",
  inputTokens: 100_000,
  outputTokens: 50_000,
  cacheReadTokens: 200_000,
  cacheWriteTokens: 50_000,
  cost,
  agentId: "andy-agent",
  sessionId: "session-123",
  taskType: "chat",
  tier: 1,
});

// Check status
const status = goldfish.getStatus("daily");
console.log(
  `Daily budget: $${status.spent.toFixed(2)} / $${status.limit.toFixed(2)}`
);
console.log(`Remaining: $${status.remaining.toFixed(2)}`);

// Quick checks
if (goldfish.shouldThrottle()) {
  console.log("Should throttle requests");
}

if (goldfish.shouldBlock()) {
  console.log("Should block requests entirely");
}
```

## API

### `BudgetManager`

Main class for budget management.

#### Constructor

```typescript
new BudgetManager(config: BudgetConfig, dbPath?: string)
```

- `config` - Budget configuration (validated with Zod)
- `dbPath` - Optional database path (defaults to `~/.openclaw/gicm/goldfish.db`)

#### Methods

- `recordCost(event: CostEvent): BudgetStatus` - Record a cost event
- `getStatus(period?: BudgetPeriod): BudgetStatus` - Get current budget status
- `checkThreshold(period: BudgetPeriod): ThresholdLevel | 'ok'` - Check threshold level
- `shouldThrottle(): boolean` - Should requests be throttled?
- `shouldBlock(): boolean` - Should requests be blocked?
- `getReport(): { daily, weekly, monthly }` - Get full multi-period report
- `resetPeriod(period: BudgetPeriod): void` - Reset period tracking

#### Events

- `budget:soft` - Emitted when soft threshold (70%) is crossed
- `budget:throttle` - Emitted when throttle threshold (90%) is crossed
- `budget:hard` - Emitted when hard limit (100%) is reached
- `cost:recorded` - Emitted when a cost is recorded

### `calculateCost()`

Calculate cost for a model based on token usage.

```typescript
calculateCost(
  model: string,
  tokens: {
    input: number;
    output: number;
    cacheRead?: number;
    cacheWrite?: number;
  }
): number
```

Returns cost in USD.

### Supported Models

The package includes pricing for:

- **Anthropic**: Claude Opus 4.6, Sonnet 4.5, Haiku 4.5, Haiku 3
- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-5.3-codex (estimated)
- **Google**: Gemini 2.0 Flash (free), Gemini 1.5 Pro
- **DeepSeek**: DeepSeek Chat, DeepSeek Reasoner
- **xAI**: Grok-2, Grok-3 (estimated)
- **Moonshot**: Kimi K2.5

Unknown models fall back to average mid-tier pricing.

## Database

Goldfish uses SQLite with WAL mode for persistent cost tracking. The database is stored at:

```
~/.openclaw/gicm/goldfish.db
```

You can override this by passing a custom path to the constructor, or use `:memory:` for in-memory storage (useful for testing).

## TypeScript

Fully typed with strict mode enabled. All types are exported:

```typescript
import type {
  BudgetConfig,
  BudgetPeriod,
  BudgetStatus,
  CostEvent,
  ThresholdLevel,
} from "@gicm/goldfish";
```

## License

MIT
