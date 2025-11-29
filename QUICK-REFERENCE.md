# gICM Quick Reference Card

## Essential Commands

```bash
# Update everything
pnpm update:all

# Build specific
pnpm build:all          # All packages
pnpm build:agents       # All agents only
pnpm build:services     # All services only

# Run services
pnpm money status       # Money Engine status
pnpm product discover   # Product Engine discovery
```

## Package Build

```bash
# Single package
pnpm --filter @gicm/<name> build

# With dependencies
pnpm --filter @gicm/<name>... build

# Examples
pnpm --filter @gicm/wallet-agent build
pnpm --filter @gicm/defi-agent build
```

## Service CLIs

```bash
# Money Engine
node services/gicm-money-engine/dist/cli.js --help
node services/gicm-money-engine/dist/cli.js status
node services/gicm-money-engine/dist/cli.js expenses

# Product Engine
node services/gicm-product-engine/dist/cli.js --help
node services/gicm-product-engine/dist/cli.js discover
node services/gicm-product-engine/dist/cli.js backlog
node services/gicm-product-engine/dist/cli.js build-agent
```

## Project Structure

```
gICM/
├── packages/           # 27 packages
│   ├── agent-core/     # Base infrastructure
│   ├── *-agent/        # Agent packages (10)
│   └── */              # Utility packages
├── services/           # 4 services
│   ├── gicm-money-engine/    # Self-funding
│   ├── gicm-product-engine/  # Auto product dev
│   ├── context-engine/       # MCP server (Python)
│   └── ai-hedge-fund/        # Trading (Python)
└── apps/
    └── marketplace/    # Next.js frontend
```

## Agent Pattern

```typescript
import { EventEmitter } from "eventemitter3";

class MyAgent extends EventEmitter<AgentEvents> {
  async run(input: Input): Promise<Output> {
    this.emit("started");
    // ... logic
    this.emit("completed", result);
    return result;
  }
}
```

## New Package Template

```json
{
  "name": "@gicm/<name>",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean"
  }
}
```

## Troubleshooting

```bash
# Clean rebuild
rm -rf node_modules
pnpm install
pnpm -r build

# Missing types
pnpm add -D @types/<package>

# Workspace sync
pnpm install --force
```

---
*Full docs: CLAUDE.md*
