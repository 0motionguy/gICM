---
name: clawpulse-streaming
description: "ClawPulse agent event streaming and real-time coordination patterns."
version: 1.0.0
triggers:
  keywords:
    - clawpulse
    - agent streaming
    - agent events
    - real-time agents
---

# ClawPulse — Agent Event Streaming

ClawPulse is the real-time intelligence streaming network for autonomous agents. It connects OPUS 67 to the broader agent ecosystem.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  OPUS 67 (this session)                              │
│  └─ UnifiedBus (local event emitter)                │
│       ├─ skill:loaded, skill:detected               │
│       ├─ memory:write, memory:query                 │
│       └─ tool:call, tool:error                      │
└──────────────────┬──────────────────────────────────┘
                   │ (events)
                   ▼
┌─────────────────────────────────────────────────────┐
│  ClawPulse Gateway                                   │
│  └─ Routes events to subscribed agents              │
│       ├─ OpenClaw fleet (Mac: 8 agents)             │
│       ├─ Hermes agent (local Python)                │
│       └─ External subscribers (webhook/SSE)         │
└─────────────────────────────────────────────────────┘
```

## Available via Anthropic Skill

The `anthropic-skills:clawpulse` skill provides the ClawPulse connection protocol. To activate it, the session needs:

1. ClawPulse gateway running (typically on the Integration Hub)
2. Agent registration with capabilities manifest
3. Event subscription for relevant topics

## Integration with OPUS 67

OPUS 67 can stream events to ClawPulse via:

1. **opus67_fleetDispatch** — send tasks to OpenClaw agents
2. **opus67_fleetStatus** — check agent availability
3. **opus67_writeMemory** — persist findings for other agents to discover
4. **opus67_wikiWrite** — write to shared Obsidian wiki

## Event Types

| Event | Source | Use |
|-------|--------|-----|
| `task:dispatched` | OPUS 67 → Fleet | Task sent to agent |
| `task:completed` | Fleet → OPUS 67 | Agent finished task |
| `memory:written` | Any agent | New knowledge stored |
| `alert:triggered` | Sentinel agent | System issue detected |
| `wiki:updated` | Any agent | Documentation changed |

## Coordination Patterns

### Fan-Out (one task, many agents)
```
opus67_fleetDispatch("researcher", "analyze competitor X")
opus67_fleetDispatch("growth", "draft positioning against X")
opus67_fleetDispatch("intelligence", "find X's pricing model")
→ All three run in parallel, results merge via memory
```

### Chain (sequential agents)
```
opus67_fleetDispatch("researcher", "find top 10 Bali coworking spaces")
→ Wait for result
opus67_fleetDispatch("growth", "draft outreach emails for these 10 venues")
→ Wait for result
opus67_wikiWrite("business/pipeline.md", "New outreach batch: ...")
```
