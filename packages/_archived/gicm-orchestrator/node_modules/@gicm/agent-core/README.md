# @gicm/agent-core

> Core utilities for gICM Web3 AI agents - shared types, base classes, and chain abstractions

[![npm version](https://badge.fury.io/js/@gicm%2Fagent-core.svg)](https://www.npmjs.com/package/@gicm/agent-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @gicm/agent-core
# or
pnpm add @gicm/agent-core
```

## Features

- **BaseAgent Class**: Event-driven agent foundation with progress tracking
- **LLM Client**: Universal client for Claude, GPT-4, Gemini with effort optimization
- **Chain Abstractions**: Solana and EVM chain utilities
- **Type Safety**: Full TypeScript with Zod validation

## Quick Start

```typescript
import { BaseAgent, createLLMClient } from "@gicm/agent-core";

// Create an LLM client
const llm = createLLMClient({
  provider: "anthropic",
  model: "claude-opus-4-5-20251101",
  effort: "medium", // Token optimization
});

const response = await llm.chat([
  { role: "user", content: "Analyze this token..." }
]);
```

## LLM Client with Opus 4.5 Features

```typescript
import { createPowerClient, createBalancedClient } from "@gicm/agent-core/llm";

// High-power mode with extended thinking
const powerClient = createPowerClient({
  extendedThinking: {
    enabled: true,
    budgetTokens: 16000,
  },
});

// Balanced mode for everyday use (50% token savings)
const balancedClient = createBalancedClient();
```

## Creating Custom Agents

```typescript
import { BaseAgent } from "@gicm/agent-core";

class MyAgent extends BaseAgent {
  async run(input: unknown): Promise<unknown> {
    this.emit("started");
    this.emit("progress", 50, "Processing...");

    // Your agent logic here
    const result = await this.processInput(input);

    this.emit("completed", result);
    return result;
  }
}
```

## Exports

| Export | Description |
|--------|-------------|
| `@gicm/agent-core` | Main exports (BaseAgent, types) |
| `@gicm/agent-core/llm` | LLM client and utilities |
| `@gicm/agent-core/chains` | Chain abstractions (Solana, EVM) |

## License

MIT - Built by [gICM](https://gicm.dev)
