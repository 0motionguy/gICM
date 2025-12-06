# @gicm/gicm-autonomy

gICM Autonomy Level 2 - Bounded autonomous decision-making system.

## Installation

```bash
npm install @gicm/gicm-autonomy
# or
pnpm add @gicm/gicm-autonomy
```

## Features

- **Autonomy Levels** - Level 1 (manual) to Level 4 (full autonomous)
- **Risk Classification** - Automatic risk scoring for actions
- **Boundary Enforcement** - Configurable limits and thresholds
- **Decision Routing** - Auto-execute, queue approval, or escalate

## Usage

```typescript
import { AutonomyEngine } from "@gicm/gicm-autonomy";

const autonomy = new AutonomyEngine({
  level: 2, // Bounded autonomy
  boundaries: {
    maxAutoExpense: 50,
    maxDailySpend: 100,
  },
});

// Route an action through the autonomy engine
const decision = await autonomy.route({
  type: "trading",
  action: "dca_buy",
  value: 25,
});

console.log(decision);
// { action: "auto_execute", reason: "Within boundaries" }
```

## CLI

```bash
# Start autonomy engine
gicm-autonomy start

# View pending approvals
gicm-autonomy queue

# Approve an action
gicm-autonomy approve <id>
```

## License

MIT
