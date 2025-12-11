/**
 * ASCII Art diagrams for OPUS 67 Dashboard hover cards
 */

export const OPUS67_ARCHITECTURE_ASCII = `
┌─────────────────────────────────────────────────────┐
│                    OPUS 67 v6.2.0                   │
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
│  │  Code   │    │ (8 active)│    │  System  │      │
│  └─────────┘    └───────────┘    └──────────┘      │
└─────────────────────────────────────────────────────┘
`;

export const MEMORY_ARCHITECTURE_ASCII = `
┌─────────────────────────────────────────────────────┐
│              UNIFIED MEMORY SYSTEM                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              UnifiedMemory API                │ │
│  │   query() │ write() │ multiHopQuery()         │ │
│  └──────────────────────┬────────────────────────┘ │
│                         │                          │
│  ┌──────────┬───────────┼───────────┬──────────┐  │
│  │          │           │           │          │  │
│  ▼          ▼           ▼           ▼          ▼  │
│ ┌────┐   ┌─────┐   ┌────────┐  ┌──────┐  ┌─────┐ │
│ │Grap│   │Learn│   │Markdown│  │ HMLR │  │Sess-│ │
│ │hiti│   │ ing │   │ Loader │  │1-5hop│  │ ion │ │
│ └────┘   └─────┘   └────────┘  └──────┘  └─────┘ │
│                                                    │
│  Events: Hooks → JSONL → Consumer → Memory        │
└─────────────────────────────────────────────────────┘
`;

export const USP_ASCII = `
┌─────────────────────────────────────────────────────┐
│              WHY OPUS 67 IS BETTER                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✓ ONE COMMAND BOOT                                │
│    └─ opus67 → Skills, MCPs, Hooks all load        │
│                                                     │
│  ✓ PROMPT CACHING                                  │
│    └─ Skills cached → 85%+ cache hit rate          │
│    └─ Saves tokens, faster responses               │
│                                                     │
│  ✓ MULTI-MODEL ROUTING (6 MODELS)                  │
│    └─ OPUS 67, DeepSeek V3, Claude 4.5             │
│    └─ Grok 3, GPT 5.1, Gemini 3 Pro                │
│    └─ 30 modes auto-select the right model         │
│                                                     │
│  ✓ ASYNC AGENT SPAWNING (NEW)                      │
│    └─ 108 specialized agents available             │
│    └─ 0.09ms spawn latency | 52K+ agents/sec       │
│    └─ SDK V2: send() → receive() → done()          │
│                                                     │
│  ✓ CROSS-SESSION MEMORY                            │
│    └─ Remembers decisions, patterns, wins          │
│    └─ Multi-hop reasoning (1-5 hops)               │
│                                                     │
│  ✓ ZERO CONFIG                                     │
│    └─ Works in Claude Code instantly               │
│    └─ No API keys, no setup, just works            │
│                                                     │
└─────────────────────────────────────────────────────┘
`;
