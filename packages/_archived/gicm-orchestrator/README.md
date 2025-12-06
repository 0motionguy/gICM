# @gicm/gicm-orchestrator

The Brain - Autonomous orchestrator that discovers, evaluates, and integrates valuable tech.

## Installation

```bash
npm install @gicm/gicm-orchestrator
# or
pnpm add @gicm/gicm-orchestrator
```

## Features

- **Discovery** - Hunt for valuable tech across GitHub, HackerNews, Twitter
- **Evaluation** - LLM-powered scoring of opportunities
- **Building** - Automated code generation and integration
- **Deployment** - Autonomous deployment with quality gates

## Usage

```typescript
import { Orchestrator } from "@gicm/gicm-orchestrator";

const orchestrator = new Orchestrator({
  hunters: ["github", "hackernews", "twitter"],
  autoApproveThreshold: 80,
});

// Start the orchestrator
await orchestrator.start();

// Listen for discoveries
orchestrator.on("discovery", (item) => {
  console.log("Found:", item.title, "Score:", item.score);
});
```

## CLI

```bash
# Start the orchestrator
gicm-orchestrator start

# Trigger discovery manually
gicm-orchestrator discover

# View backlog
gicm-orchestrator backlog
```

## Agents

The orchestrator coordinates these agents:
- **Hunter Agent** - Discovers opportunities
- **Decision Agent** - Evaluates and scores
- **Builder Agent** - Generates code
- **Refactor Agent** - Improves code quality
- **Deployer Agent** - Handles deployment

## License

MIT
