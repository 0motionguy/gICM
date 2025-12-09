/**
 * ASCII Art diagrams for OPUS 67 Dashboard hover cards
 */

export const OPUS67_ARCHITECTURE_ASCII = `
┌─────────────────────────────────────────────────────┐
│                    OPUS 67 v6.1.0                   │
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
│  ✓ AUTO PRE-BINDING                                │
│    └─ Detects project type on session start        │
│    └─ Pre-loads relevant skills before you ask     │
│                                                     │
│  ✓ MULTI-MODEL ROUTING                             │
│    └─ Complex → Opus | Fast → Sonnet | Simple → Haiku│
│    └─ 30 modes auto-select the right model         │
│                                                     │
│  ✓ ZERO CONFIG                                     │
│    └─ Works in Claude Code instantly               │
│    └─ No API keys, no setup, just works            │
│                                                     │
│  ✓ CROSS-SESSION MEMORY                            │
│    └─ Remembers decisions, patterns, wins          │
│    └─ Multi-hop reasoning (1-5 hops)               │
│                                                     │
│  ✓ 8 ACTIVE HOOKS                                  │
│    └─ Pre-bash, post-write, session-start          │
│                                                     │
└─────────────────────────────────────────────────────┘
`;
