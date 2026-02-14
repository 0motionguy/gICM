# @gicm/router

Smart 4-tier LLM routing for OpenClaw — intelligent model selection with 70-95% cost savings.

## Features

- **4-Tier Classification** — Regex + keyword-based intent detection (<5ms)
- **Model Health Tracking** — Automatic fallback on unhealthy models (3-strike rule)
- **Session Pinning** — Same model for multi-turn conversations
- **Cost Optimization** — 70-95% cost savings vs always-premium routing
- **BYOK Multi-Provider** — OpenRouter, Anthropic, OpenAI, Ollama support
- **Zero Dependencies** — Only `zod` for validation, `node:events` for emitting

## Installation

```bash
pnpm add @gicm/router
```

## Quick Start

```typescript
import { route } from "@gicm/router";

// Simple usage - automatic tier detection
const result = route({ message: "Summarize this email" });
console.log(result.model); // "anthropic/claude-3-haiku-20240307"
console.log(result.tier); // 1 (cheap LLM)
console.log(result.estimatedCostPer1k); // 0.000625
```

## 4-Tier System

| Tier  | Use Case        | Example Models      | Patterns/Keywords                              |
| ----- | --------------- | ------------------- | ---------------------------------------------- |
| **0** | Free/Regex      | No LLM              | `what time`, `hello`, `2 + 2`                  |
| **1** | Simple Q&A      | Haiku, Gemini Flash | `summarize`, `translate`, `format`             |
| **2** | Code & Analysis | Sonnet 4.5, GPT-4o  | `refactor`, `debug`, `review`, `analyze`       |
| **3** | Architecture    | Opus 4.6, o1        | `architect`, `design system`, `security audit` |

## Advanced Usage

### Custom Router Instance

```typescript
import { SmartRouter } from "@gicm/router";

const router = new SmartRouter({
  defaultTier: 1,
  sessionPinning: true,
  ollamaUrl: "http://localhost:11434",
  openrouterKey: process.env.OPENROUTER_API_KEY,
});

const result = router.route({
  message: "Refactor this function",
  sessionId: "user-123", // Pins model to session
  contextTokens: 5000,
});
```

### Force Specific Tier

```typescript
const result = route({
  message: "Simple task",
  forceTier: 3, // Override intent classification
});
```

### Model Health Tracking

```typescript
import { router } from "@gicm/router";

// Mark model as unhealthy after API error
router.setModelHealth("anthropic/claude-sonnet-4.5-20250514", false);

// Router automatically falls back to next model
const result = router.route({ message: "refactor this" });
console.log(result.model); // "openai/gpt-4o" (fallback)

// Listen to health events
router.on("health:changed", ({ model, healthy, errorCount }) => {
  console.log(`${model} is now ${healthy ? "healthy" : "unhealthy"}`);
});
```

### Session Pinning

```typescript
// First request establishes the model
const result1 = router.route({
  message: "Refactor this function",
  sessionId: "session-abc",
});
console.log(result1.model); // "anthropic/claude-sonnet-4.5-20250514"
console.log(result1.fromCache); // false

// Second request uses same model (even for different intent)
const result2 = router.route({
  message: "Summarize this", // Would normally be Tier 1
  sessionId: "session-abc",
});
console.log(result2.model); // "anthropic/claude-sonnet-4.5-20250514" (pinned)
console.log(result2.fromCache); // true

// Clear session to allow new model selection
router.clearSession("session-abc");
```

### Routing Statistics

```typescript
const stats = router.getStats();

console.log(stats.totalRequests); // 127
console.log(stats.byTier); // { 0: 5, 1: 82, 2: 35, 3: 5 }
console.log(stats.byModel); // { "anthropic/claude-3-haiku-20240307": 82, ... }
console.log(stats.avgLatency); // 2.3 ms
console.log(stats.cacheHits); // 43
```

### Event Listeners

```typescript
router.on("route:selected", (result) => {
  console.log(`Selected ${result.model} for tier ${result.tier}`);
});

router.on("route:fallback", ({ from, to, tier }) => {
  console.log(`Falling back from ${from} to ${to} for tier ${tier}`);
});

router.on("health:changed", ({ model, healthy, errorCount }) => {
  if (!healthy) {
    console.warn(`Model ${model} marked unhealthy after ${errorCount} errors`);
  }
});
```

## Custom Tier Configuration

```typescript
import { SmartRouter, DEFAULT_TIER_CONFIGS } from "@gicm/router";

const customTiers = {
  ...DEFAULT_TIER_CONFIGS,
  1: {
    primary: "ollama/llama3.2",
    fallback: ["anthropic/claude-3-haiku-20240307"],
    maxTokens: 128_000,
    costPer1kInput: 0,
    costPer1kOutput: 0,
  },
};

const router = new SmartRouter({
  tiers: customTiers,
});
```

## Intent Classification

The router uses pure regex/keyword matching for fast (<5ms) tier classification:

```typescript
import { classifyIntent, DEFAULT_TIER_RULES } from "@gicm/router";

const tier = classifyIntent("refactor this function", DEFAULT_TIER_RULES);
console.log(tier); // 2

// Custom rules
const customRules = [
  {
    tier: 2,
    patterns: [/fix.*bug/i],
    keywords: ["bugfix", "hotfix"],
  },
];
```

## API Reference

### `route(request: RouteRequest): RouteResult`

Convenience function using singleton router.

### `SmartRouter`

Main router class with full configuration.

**Methods:**

- `route(request: RouteRequest): RouteResult` - Route a request
- `setModelHealth(model: string, healthy: boolean): void` - Set model health
- `getModelHealth(model: string): ModelHealth | undefined` - Get model health
- `getStats(): RoutingStats` - Get routing statistics
- `resetStats(): void` - Reset statistics
- `clearSession(sessionId: string): void` - Clear session pin
- `clearAllSessions(): void` - Clear all session pins

**Events:**

- `route:selected` - Emitted when model selected
- `route:fallback` - Emitted when falling back to alternative model
- `health:changed` - Emitted when model health changes

### Types

```typescript
type Tier = 0 | 1 | 2 | 3;

interface RouteRequest {
  message: string;
  contextTokens?: number;
  forceTier?: Tier;
  sessionId?: string;
  agentId?: string;
}

interface RouteResult {
  model: string;
  tier: Tier;
  estimatedCostPer1k: number;
  reason: string;
  fromCache: boolean;
}
```

## OpenClaw Integration

```typescript
// In your OpenClaw agent hook
import { route } from "@gicm/router";

async function selectModel(message: string, sessionId: string) {
  const result = route({
    message,
    sessionId,
  });

  // Use result.model in your OpenClaw client
  return {
    model: result.model,
    estimatedCost: result.estimatedCostPer1k,
  };
}
```

## Cost Savings Example

**Before (always Claude Opus 4.6):**

- 1000 requests × 200k tokens avg = 200M tokens
- Cost: 200M × $0.015/1k = $3,000

**After (smart routing):**

- 800 Tier 1 requests: 160M × $0.00025/1k = $40
- 150 Tier 2 requests: 30M × $0.003/1k = $90
- 50 Tier 3 requests: 10M × $0.015/1k = $150
- **Total: $280 (91% savings)**

## Development

```bash
# Build
pnpm build

# Test
pnpm test

# Dev mode
pnpm dev
```

## License

MIT - See LICENSE file

## Credits

Built by Mirko Basil Dölger for the gICM project.
