# @gicm/decision-agent

> LLM-powered decision engine for evaluating discoveries

[![npm version](https://badge.fury.io/js/@gicm%2Fdecision-agent.svg)](https://www.npmjs.com/package/@gicm/decision-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @gicm/decision-agent
# or
pnpm add @gicm/decision-agent
```

## Features

- **Multi-Factor Scoring**: userDemand, competitiveValue, technicalFit, effort, impact
- **LLM Integration**: Claude/GPT-4 powered analysis
- **Confidence Metrics**: Tracks prediction accuracy
- **Threshold Filtering**: Auto-approve/reject based on scores

## Quick Start

```typescript
import { DecisionAgent } from "@gicm/decision-agent";

const agent = new DecisionAgent({
  model: "claude-opus-4-5-20251101",
  approvalThreshold: 75,
});

const decision = await agent.evaluate({
  discovery: {
    title: "New MCP server pattern",
    source: "github",
    url: "https://github.com/...",
  },
});

console.log(decision.score); // 0-100
console.log(decision.recommendation); // "approve" | "reject" | "review"
```

## License

MIT - Built by [gICM](https://gicm.dev)
