---
name: wiki-compiler
description: "Compiled Truth pattern for wiki maintenance. Turns raw inputs into living knowledge pages."
version: 1.0.0
triggers:
  keywords:
    - compile wiki
    - wiki compile
    - knowledge base
    - compiled truth
    - maintain wiki
    - update wiki
---

# Wiki Compiler — Compiled Truth Pattern

Inspired by gbrain (Garry Tan) and the "compiler not retriever" principle (Karpathy).

## The Problem

Append-only knowledge bases become unreadable. To answer "what's the status of venue X?" you'd need to read 200 log entries across multiple files. Nobody does this.

## The Solution: Compiled Truth

Every wiki page has two zones:

```markdown
---
title: Venue Name
updated: 2026-04-12
updated_by: opus67
type: permanent
---

# Venue Name

## Compiled Truth
[Current synthesis — rewritten each time new evidence arrives]
Status: Active, 3 bookings/week, Sam clone deployed.
Key contact: owner@venue.com
Revenue: $450/month

---

## Evidence Trail (append-only)
### 2026-04-12 — OPUS 67
- Sam reported 3 new bookings this week
- Owner requested menu integration

### 2026-04-05 — Andy
- Initial onboarding completed
- WiFi speed: 45 Mbps, adequate
```

**Above the `---`**: Living synthesis. Rewritten as evidence changes. Always current.
**Below the `---`**: Append-only evidence trail. Never edited. The proof.

## How to Use

### Manual Compilation
```
opus67_wikiCompile({
  topic: "venue-canggu-dojo",
  sources: ["memory/andy-memory.md", "daily/2026-04-12.md"]
})
```

### Weekly Batch Compilation
Use `/opus67-compile-wiki` to:
1. Read recent memory/ entries from agnt-wiki
2. Group by topic
3. Compile into existing wiki articles
4. Append new evidence to timelines
5. Update _index.md

### Information Flow
```
raw inputs (daily logs, memory, agent reports)
    ↓ compile
wiki/ pages (compiled truth + evidence trail)
    ↓ reference
output (decisions, reports, outreach)
```

## Rules

1. **Never delete compiled truth** — rewrite it with new synthesis
2. **Never edit evidence trail** — only append
3. **Always cite source** in evidence entries (agent name + date)
4. **Update frontmatter** — `updated` date and `updated_by` agent
5. **Create [[wikilinks]]** to related pages when compiling
6. **Prioritize permanent > literature > fleeting** notes as sources
