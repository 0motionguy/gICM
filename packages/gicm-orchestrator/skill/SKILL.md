---
name: gicm-orchestrator
description: >
  Multi-agent task orchestration. Agent pools with 3 load-balancing strategies,
  task decomposition (8 patterns), 3-stage council deliberation, 4 synthesis
  strategies, workflow execution with dependency resolution.
user-invocable: true
metadata:
  openclaw:
    emoji: "🎭"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/orchestrator"
        label: "Install gICM Orchestrator"
---

# @gicm/orchestrator

Multi-agent orchestration: agent pools with load balancing, task decomposition (8 patterns), 3-stage council deliberation, workflow execution with dependency resolution.

## Quick Start

```typescript
import { AgentPool, TaskDecomposer, Orchestrator } from "@gicm/orchestrator";
const pool = new AgentPool();
const decomposer = new TaskDecomposer();
const orchestrator = new Orchestrator(pool, decomposer, myExecutor);
```
