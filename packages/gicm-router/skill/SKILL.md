---
name: gicm-router
description: >
  Token-aware LLM routing for OpenClaw. Classifies intent and routes to the
  cheapest capable model. 4 tiers: Free (Ollama/regex) → Haiku → Sonnet → Opus.
  Saves 70-95% on API costs. Native plugin — no proxy needed.
metadata:
  openclaw:
    emoji: "🔀"
    requires:
      env:
        - OPENROUTER_API_KEY
    install:
      - id: npm
        kind: npm
        pkg: "@gicm/router"
        label: "Install gICM Router"
    env:
      GICM_ROUTER_ENABLED: "true"
      GICM_ROUTER_DEFAULT_TIER: "1"
      GICM_ROUTER_OLLAMA_URL: "http://localhost:11434"
---

# gICM Smart Router

Route every request to the cheapest model that can handle it.

## How It Works

The router classifies each message by complexity:

| Tier | When                                              | Model                    | Cost   |
| ---- | ------------------------------------------------- | ------------------------ | ------ |
| 0    | Time checks, simple math, regex-solvable          | None / Ollama local      | $0     |
| 1    | Summaries, simple Q&A, formatting                 | Haiku 4.5 / Gemini Flash | $0.001 |
| 2    | Code review, analysis, complex writing            | Sonnet 4.5 / GPT-4o      | $0.01  |
| 3    | Architecture, novel reasoning, critical decisions | Opus 4.6 / GPT-5.3       | $0.05  |

## Setup

```bash
# Set your OpenRouter key (for BYOK multi-model access)
export OPENROUTER_API_KEY="sk-or-v1-..."

# Optional: local Ollama for Tier 0
ollama pull llama3.2:3b
```

## Commands

Tell me to:

- `route this to haiku` — force Tier 1
- `use opus for this` — force Tier 3
- `show routing stats` — see tier distribution
- `reset router` — clear routing cache

## Configuration

In `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "gicm-router": {
      "env": {
        "GICM_ROUTER_DEFAULT_TIER": "1",
        "GICM_ROUTER_OLLAMA_URL": "http://localhost:11434",
        "OPENROUTER_API_KEY": "sk-or-v1-..."
      }
    }
  }
}
```

## Integration

Works with:

- **@gicm/goldfish** — respects budget limits, auto-downgrades tier when budget is low
- **@gicm/dashboard** — shows routing analytics (tier distribution, cost per tier)
- **@gicm/context** — routes based on matched skill complexity

## Why Not ClawRouter?

ClawRouter uses a proxy (adds latency, sees your prompts). This runs natively inside OpenClaw's process — zero network hop, your data stays local.
