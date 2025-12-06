# @gicm/hunter-agent

> Tech discovery agent - Hunts GitHub, HackerNews, and Twitter for valuable opportunities

[![npm version](https://badge.fury.io/js/@gicm%2Fhunter-agent.svg)](https://www.npmjs.com/package/@gicm/hunter-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @gicm/hunter-agent
# or
pnpm add @gicm/hunter-agent
```

## Features

- **GitHub Hunter**: Trending repos, new releases, AI tools
- **HackerNews Hunter**: Top stories, Show HN, tech discussions
- **Twitter Hunter**: Crypto influencers, trending topics
- **Unified Discovery**: Aggregates and scores all sources

## Quick Start

```typescript
import { HunterAgent } from "@gicm/hunter-agent";

const hunter = new HunterAgent({
  sources: ["github", "hackernews", "twitter"],
  schedule: "0 */2 * * *", // Every 2 hours
});

const discoveries = await hunter.run();
```

## Exports

| Export | Description |
|--------|-------------|
| `@gicm/hunter-agent` | Main HunterAgent |
| `@gicm/hunter-agent/sources` | Individual source hunters |

## License

MIT - Built by [gICM](https://gicm.dev)
