/**
 * ASCII Art diagrams for OPUS 67 Dashboard hover cards
 */

export const OPUS67_ARCHITECTURE_ASCII = `
┌─────────────────────────────────────────────────────┐
│                    OPUS 67 v6.3.0                   │
│             "Context Engineering Edition"           │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ Skills  │  │  MCPs   │  │  Modes  │  │ Agents │ │
│  │   141   │  │   83    │  │   30    │  │  108   │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘ │
│       │            │            │            │      │
│       └────────────┴────────────┴────────────┘      │
│                        │                            │
│               ┌────────▼────────┐                   │
│               │  Unified Boot   │                   │
│               │  (opus67 cmd)   │                   │
│               └────────┬────────┘                   │
│                        │                            │
│       ┌────────────────┼────────────────┐           │
│       ▼                ▼                ▼           │
│  ┌─────────┐    ┌───────────┐    ┌──────────┐      │
│  │ Claude  │    │   Hooks   │    │  Memory  │      │
│  │  Code   │    │ (8 active)│    │ 6 Layers │      │
│  └─────────┘    └───────────┘    └──────────┘      │
└─────────────────────────────────────────────────────┘
`;

export const MEMORY_ARCHITECTURE_ASCII = `
┌─────────────────────────────────────────────────────┐
│           UNIFIED MEMORY SYSTEM v6.3.0             │
│        + 4-Layer Hierarchical Memory (NEW)         │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │              UnifiedMemory API                │ │
│  │   query() │ write() │ multiHopQuery()         │ │
│  └──────────────────────┬────────────────────────┘ │
│                         │                          │
│  ┌──────┬──────┬───────┼───────┬──────┬───────┐  │
│  ▼      ▼      ▼       ▼       ▼      ▼       ▼  │
│ ┌────┐┌────┐┌─────┐┌──────┐┌─────┐┌─────┐┌────┐ │
│ │Grap││Hier││Learn││Markdn││HMLR ││Sess-││Ctx │ │
│ │hiti││arch││ ing ││Loader││1-5hp││ ion ││Prun│ │
│ └────┘└────┘└─────┘└──────┘└─────┘└─────┘└────┘ │
│         ↑                                         │
│  ┌──────┴──────────────────────────────────────┐ │
│  │ HIERARCHICAL: Working→Episodic→Semantic→Skill│ │
│  │ (1hr TTL)    (7-day)   (perm)    (perm)     │ │
│  └─────────────────────────────────────────────┘ │
│  Events: Hooks → JSONL → Consumer → Memory        │
└─────────────────────────────────────────────────────┘
`;

export const USP_ASCII = `
┌─────────────────────────────────────────────────────┐
│         WHY OPUS 67 v6.3.0 IS BETTER               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✓ ONE COMMAND BOOT                                │
│    └─ opus67 → Skills, MCPs, Hooks all load        │
│                                                     │
│  ✓ 4-STAGE SKILL RETRIEVAL (v6.3.0 NEW)           │
│    └─ +17% detection precision (92% accuracy)      │
│    └─ Keyword→Vector→Rerank→Diversity pipeline     │
│                                                     │
│  ✓ 4-LAYER HIERARCHICAL MEMORY (v6.3.0 NEW)       │
│    └─ Working → Episodic → Semantic → Skill        │
│    └─ Auto-consolidation & promotion               │
│    └─ 3x faster retrieval (50ms → 15ms)            │
│                                                     │
│  ✓ ADAPTIVE CONTEXT PRUNING (v6.3.0 NEW)          │
│    └─ +42% token efficiency                        │
│    └─ Greedy, Knapsack, MMR strategies             │
│                                                     │
│  ✓ TOOL HEALTH ANALYTICS (v6.3.0 NEW)             │
│    └─ P50/P95/P99 latency tracking                 │
│    └─ Auto-detect unhealthy tools                  │
│                                                     │
│  ✓ MULTI-MODEL ROUTING (6 MODELS)                  │
│    └─ DeepSeek V3, Claude 4.5, Grok 3              │
│    └─ GPT 5.1, Gemini 3 Pro                        │
│    └─ 30 modes auto-select the right model         │
│                                                     │
│  ✓ CROSS-SESSION MEMORY                            │
│    └─ Remembers decisions, patterns, wins          │
│    └─ Multi-hop reasoning (1-5 hops)               │
│                                                     │
└─────────────────────────────────────────────────────┘
`;
