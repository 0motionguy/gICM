---
description: "OPUS 67 orchestration. 97 skills, 25 MCP tools, wiki/fleet/research integration."
triggers:
  keywords:
    - opus67
    - load skill
    - fleet
---

# OPUS 67 — 25 MCP Tools

**Skills**: `opus67_detect_skills` (auto-find) | `opus67_get_skill` (load full) | `opus67_skillSummaries` (browse compact) | `opus67_tokenBudget` (budgets)
**Wiki**: `opus67_wikiSearch` | `opus67_wikiRead` | `opus67_wikiWrite` (190-page Obsidian vault)
**Fleet**: `opus67_fleetStatus` | `opus67_fleetAgents` | `opus67_fleetDispatch` (8 OpenClaw agents)
**Memory**: `opus67_queryMemory` | `opus67_multiHopQuery` | `opus67_writeMemory` | `opus67_memoryStats`
**Analytics**: `opus67_toolMetrics` | `opus67_unhealthyTools`
**External**: `opus67_hermesQuery` (Python agent)

**Research** (other MCPs): Context7 `get-library-docs` (official docs) | Tavily `tavily_research` (web)

Load `context7-deep-search` for library ID mappings. Load `tavily-research` for query patterns. Load `task-planning` for GSD-style plans. Load `wiki-compiler` for compiled truth pattern.
