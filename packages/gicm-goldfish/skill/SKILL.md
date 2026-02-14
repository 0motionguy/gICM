---
name: gicm-goldfish
description: >
  Token budget management for OpenClaw. Set daily/weekly/monthly spend limits.
  Three enforcement levels: soft (alert) → throttle (downgrade model) → hard (stop).
  Tracks cost per agent, per model, per task. Prevents bill shock.
user-invocable: true
metadata:
  openclaw:
    emoji: "🐠"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/goldfish"
        label: "Install gICM Goldfish"
    env:
      GICM_GOLDFISH_ENABLED: "true"
      GICM_GOLDFISH_DAILY_LIMIT: "10.00"
      GICM_GOLDFISH_SOFT_THRESHOLD: "0.7"
      GICM_GOLDFISH_THROTTLE_THRESHOLD: "0.9"
---

# gICM Goldfish — Budget Manager

Never get surprised by your AI bill again.

## How It Works

Set a daily budget. Goldfish tracks every token spent and enforces limits:

| Threshold | What Happens                                                  |
| --------- | ------------------------------------------------------------- |
| 70% used  | Soft alert — "Hey, you've used $7 of $10 today"               |
| 90% used  | Throttle — auto-downgrades to cheaper models via @gicm/router |
| 100% used | Hard stop — no more API calls until reset                     |

## Quick Setup

Just set your daily limit:

```
Set my daily budget to $5
```

Or in config:

```json
{
  "skills": {
    "gicm-goldfish": {
      "env": {
        "GICM_GOLDFISH_DAILY_LIMIT": "5.00"
      }
    }
  }
}
```

## Commands

Tell me to:

- `goldfish status` — show current spend vs budget
- `goldfish report` — detailed breakdown by model/agent
- `goldfish set $X` — change daily limit
- `goldfish reset` — reset daily counter
- `goldfish history` — show last 7 days of spend

## Separate Trading Budget

If you use @gicm/polyclaw-pro, trading API costs are tracked separately:

```
Set trading budget to $20/day
Set inference budget to $5/day
```

## Data Storage

All cost data stored locally in SQLite:

```
~/.openclaw/gicm/goldfish.db
```

No cloud. No telemetry. Your spend data stays on your machine.
