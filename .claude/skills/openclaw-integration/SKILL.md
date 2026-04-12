---
name: openclaw-integration
description: "OpenClaw fleet integration. Cross-compatible skills, agent dispatch, gateway connection."
version: 1.0.0
triggers:
  keywords:
    - openclaw
    - fleet agent
    - dispatch agent
    - remote agent
---

# OpenClaw Integration — Fleet Dispatch & Cross-Compatible Skills

OpenClaw (npm v2026.4.11) is a multi-channel AI gateway. OPUS 67 skills work in both Claude Code and OpenClaw.

## Fleet Architecture

```
Claude Code (this session)
    ↓ opus67_fleetDispatch
OpenClaw Gateway (Mac: 100.107.81.60:18789)
    ├── main (control plane, claude-sonnet-4.5)
    ├── coder (code & builds)
    ├── builder (technical construction)
    ├── researcher (research & analysis)
    ├── intelligence (market intel)
    ├── trading (market decisions)
    ├── growth (marketing & content)
    └── ops (system health)
```

## OPUS 67 Fleet Tools

```
opus67_fleetStatus   — Check if gateway is reachable
opus67_fleetAgents   — List all 8 agents with roles
opus67_fleetDispatch — Send a task to a specific agent
```

## Dispatch Examples

```
# Research task
opus67_fleetDispatch({ agent: "researcher", task: "analyze competitor pricing for AI agent marketplaces" })

# Content task
opus67_fleetDispatch({ agent: "growth", task: "draft a tweet thread about our new skill system" })

# Parallel fan-out
opus67_fleetDispatch({ agent: "researcher", task: "find top 10 coworking spaces in Seminyak" })
opus67_fleetDispatch({ agent: "growth", task: "draft outreach template for coworking venues" })
```

## Cross-Compatible Skills

OPUS 67 SKILL.md files work in OpenClaw without modification:

```yaml
---
name: my-skill
description: "What this skill does"
triggers:
  keywords:
    - trigger word
---
# Skill content here
```

Place in `~/.openclaw/skills/<name>/SKILL.md` for OpenClaw, or `.claude/skills/<name>/SKILL.md` for Claude Code.

## Gateway Connection

- **Host**: `100.107.81.60` (Mac via Tailscale)
- **Port**: `18789`
- **Auth**: Bearer token (configured in OPUS 67 handlers)
- **Fallback**: If gateway unreachable, tools report error with Tailscale troubleshooting
