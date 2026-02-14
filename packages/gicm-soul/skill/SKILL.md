---
name: gicm-soul
description: >
  Dynamic identity mode fragments for OpenClaw. Load only the personality context
  relevant to your current task. 6 built-in modes: Build, Think, Vibe, Trade,
  Create, Audit. Custom modes supported. Reduces identity tokens by 80%.
  Does NOT modify SOUL.md — works via skill-level prompt injection.
user-invocable: true
metadata:
  openclaw:
    emoji: "👻"
    install:
      - id: npm
        kind: node
        pkg: "@gicm/soul"
        label: "Install gICM Soul+"
    env:
      GICM_SOUL_DEFAULT_MODE: "BUILD"
      GICM_SOUL_AUTO_SWITCH: "true"
---

# gICM Soul+ — Dynamic Identity Fragments

Your agent doesn't need full personality context for every task.

**Important:** Soul+ does NOT modify your SOUL.md or any workspace files. It works as a skill-level prompt layer — injecting only the relevant mode fragment into context alongside your existing identity.

## The Problem

Loading full personality context into every message adds 3-8K tokens overhead. That's $50-150/month just on identity tokens.

## The Fix

Soul+ provides mode-specific fragments that inject relevant context via this skill. Your SOUL.md stays untouched:

| Mode   | Tokens | When                             |
| ------ | ------ | -------------------------------- |
| BUILD  | ~800   | Coding, debugging, deployment    |
| THINK  | ~700   | Architecture, planning, analysis |
| VIBE   | ~400   | Casual chat, greetings           |
| TRADE  | ~900   | Polymarket, DeFi, portfolio      |
| CREATE | ~600   | Writing, content, design         |
| AUDIT  | ~500   | Security scanning, code review   |
| Full   | ~4000  | Only when explicitly needed      |

## Setup

Install the skill and fragments are ready to use immediately. No initialization needed — Soul+ ships with 6 built-in mode fragments.

Optionally customize fragments in the skill's `templates/` directory:

```
~/.openclaw/skills/gicm-soul/templates/
├── work.md
├── creative.md
├── trading.md
├── research.md
└── security.md
```

Your SOUL.md is never read or modified by Soul+.

## Commands

Tell me to:

- `switch to trading mode` — load trading identity
- `switch to research mode` — load research identity
- `go full mode` — load everything (for complex cross-domain tasks)
- `what mode am I in?` — show current mode
- `auto mode` — let Soul+ pick based on conversation context

## Auto-Switching

When `GICM_SOUL_AUTO_SWITCH=true`, Soul+ detects task type and switches automatically:

- "Buy YES on the election market" → Trading mode
- "Refactor this Rust code" → Build mode
- "Write me a poem" → Creative mode

No manual switching needed.
