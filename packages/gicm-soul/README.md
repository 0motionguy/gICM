# @gicm/soul

Dynamic SOUL.md mode switching for OpenClaw — load only relevant identity fragments, achieving 80% identity token reduction.

## Features

- **6 Specialized Modes**: BUILD, THINK, VIBE, TRADE, CREATE, AUDIT
- **Automatic Detection**: Regex and keyword-based mode classification
- **Token Efficiency**: ~80% reduction vs loading full SOUL.md
- **Event-Driven**: Listen to mode switches and detections
- **TypeScript First**: Full type safety with Zod validation
- **Extensible**: Custom mode fragments via JSON files

## Installation

```bash
npm install @gicm/soul
# or
pnpm add @gicm/soul
```

## Quick Start

```typescript
import { SoulEngine } from "@gicm/soul";

// Initialize with default configuration
const engine = new SoulEngine({
  defaultMode: "BUILD",
  autoSwitch: true,
});

// Resolve mode and get system prompt
const output = engine.resolve("build a React component");
console.log(output.mode); // 'BUILD'
console.log(output.savedPercent); // ~80%
console.log(output.systemPrompt); // Full identity prompt

// Manually switch modes
engine.switchMode("TRADE");

// Get current state
console.log(engine.getCurrentMode()); // 'TRADE'
console.log(engine.getTokenSavings()); // { current: 920, full: 4900, savedPercent: 81 }
```

## Modes

### BUILD

For code engineering, debugging, and implementation tasks.

- **Tokens**: 850
- **Triggers**: build, create, implement, code, develop, fix, debug, deploy, refactor, test
- **Keywords**: function, component, API, endpoint, bug, error, compile, lint

### THINK

For system architecture, design decisions, and strategic planning.

- **Tokens**: 780
- **Triggers**: architect, design system, plan, analyze, compare, evaluate, strategy
- **Keywords**: tradeoff, approach, architecture, pros cons, decision

### VIBE

For casual conversation, explanations, and general chat.

- **Tokens**: 650
- **Triggers**: hello, hi, hey, how are you, what's up, chat, casual
- **Keywords**: weather, joke, story, fun, cool, nice, thanks

### TRADE

For quantitative trading analysis, risk assessment, and DeFi operations.

- **Tokens**: 920
- **Triggers**: trade, buy, sell, market, polymarket, portfolio, hedge, arbitrage, position
- **Keywords**: USDC, profit, P&L, risk, whale, DeFi, swap, yield

### CREATE

For content writing, documentation, and creative composition.

- **Tokens**: 800
- **Triggers**: write, compose, draft, blog, tweet, creative, poem, story, content
- **Keywords**: article, post, copy, headline, title, description

### AUDIT

For security analysis, vulnerability scanning, and code auditing.

- **Tokens**: 900
- **Triggers**: audit, security, scan, vulnerability, CVE, exploit, penetration
- **Keywords**: reentrancy, overflow, injection, malicious, threat

## API

### SoulEngine

```typescript
class SoulEngine extends EventEmitter {
  constructor(config?: Partial<SoulConfig>);

  // Classify mode from message
  classifyMode(message: string): ClassifyResult;

  // Resolve mode and generate system prompt
  resolve(message: string): SoulOutput;

  // Manual mode switching
  switchMode(mode: Mode): ModeFragment;

  // State queries
  getCurrentMode(): Mode;
  getCurrentFragment(): ModeFragment | null;
  getTokenSavings(): { current: number; full: number; savedPercent: number };

  // Configuration
  updateConfig(config: Partial<SoulConfig>): void;
  getConfig(): SoulConfig;
}
```

### Events

```typescript
// Emitted when mode is auto-detected
engine.on("mode:detected", ({ mode, confidence, reasons }) => {
  console.log(`Detected ${mode} with ${confidence * 100}% confidence`);
});

// Emitted when mode is switched
engine.on("mode:switched", ({ from, to, fragment }) => {
  console.log(`Switched from ${from} to ${to}`);
});
```

### Types

```typescript
type Mode = "BUILD" | "THINK" | "VIBE" | "TRADE" | "CREATE" | "AUDIT";

interface SoulConfig {
  defaultMode: Mode;
  autoSwitch: boolean;
  fragmentsDir?: string;
  userPrefsPath?: string;
}

interface ClassifyResult {
  mode: Mode;
  confidence: number;
  reasons: string[];
  tokensSaved: number;
}

interface SoulOutput {
  mode: Mode;
  systemPrompt: string;
  tokenCount: number;
  fullTokenCount: number;
  savedPercent: number;
}
```

## Custom Fragments

You can provide custom mode fragments via JSON files:

```typescript
const engine = new SoulEngine({
  fragmentsDir: "/path/to/custom/fragments",
});
```

Each fragment file should be named `{mode}.json` (e.g., `build.json`) and match the `ModeFragment` interface:

```json
{
  "mode": "BUILD",
  "identity": "Your custom identity text...",
  "tools": ["typescript", "vitest"],
  "style": "Direct, technical",
  "tokenCost": 850
}
```

## Token Savings

Full SOUL.md with all 6 modes: **4900 tokens**

Per-mode costs:

- VIBE: 650 tokens (87% savings)
- THINK: 780 tokens (84% savings)
- CREATE: 800 tokens (84% savings)
- BUILD: 850 tokens (83% savings)
- AUDIT: 900 tokens (82% savings)
- TRADE: 920 tokens (81% savings)

Average savings: **~83%**

## Use Cases

### OpenClaw Integration

```typescript
import { SoulEngine } from "@gicm/soul";

const engine = new SoulEngine({ autoSwitch: true });

// In your message handler
async function handleMessage(message: string) {
  const { systemPrompt, mode, savedPercent } = engine.resolve(message);

  // Use systemPrompt as your agent's identity
  const response = await llm.complete({
    system: systemPrompt,
    user: message,
  });

  console.log(`Responded in ${mode} mode, saved ${savedPercent}% tokens`);
  return response;
}
```

### Agent Workflow Optimization

```typescript
// Start in BUILD mode for development
engine.switchMode("BUILD");

// Auto-switch based on user queries
engine.on("mode:detected", ({ mode, confidence }) => {
  if (confidence > 0.7) {
    console.log(`High confidence switch to ${mode}`);
  }
});

// Manual mode for specific workflows
if (isAuditWorkflow) {
  engine.switchMode("AUDIT");
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Watch mode
pnpm dev
```

## License

MIT

## Author

Mirko Basil Dölger <mirko@gicm.dev>

Part of the [gICM project](https://github.com/icm-motion/gicm)
