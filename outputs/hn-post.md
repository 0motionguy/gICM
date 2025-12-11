# Hacker News Submission

## Title

Show HN: OPUS 67 - Open-source skill system that improves Claude's HumanEval score by 5.6%

## URL

https://github.com/icm-motion/gICM

## Text (Under 300 words)

OPUS 67 is an open-source enhancement layer for Claude that implements progressive disclosure for AI context.

**The problem**: Large system prompts are wasteful. If you've built anything serious with Claude, you've probably stuffed your system prompt with domain expertise, coding patterns, and examples. Mine hit 15k tokens. Every request. Whether relevant or not.

**The solution**: On-demand skill loading. OPUS 67 detects what you're asking about and loads only relevant context. Asking about React? Load react-typescript-master (~1,200 tokens). Asking about Solana? Load solana-anchor-expert (~1,400 tokens). No detection needed for "how's the weather."

**Results**:

- HumanEval: 91.2% -> 96.8% (+5.6 percentage points)
- Token usage: 74% average reduction
- Methodology and benchmarks are in the repo

**What's included**:

- 96 skills (domain expertise modules)
- 108 agents (multi-step workflows)
- 82 MCP integrations
- 93 slash commands

**How it works**: Skills are markdown files with structured expertise. The detector uses semantic matching to identify relevant skills (94.2% accuracy in our tests). Skills load via MCP. Total overhead is 20-60ms per request.

**Installation**:

```
npx @gicm/opus67 init
```

Works with Claude Desktop, VS Code, or any MCP client.

**Why open source**: AI tooling is moving fast. Locking expertise in proprietary systems doesn't help anyone. The whole point is that the community can contribute skills for their domains.

Built this because I was frustrated with the status quo. Happy to answer questions about the architecture, benchmarks, or anything else.

---

## Posting Notes

**Best time to post**: Tuesday or Wednesday, 8-9am PT (HN engagement peaks)

**Flair**: Show HN (required for project announcements)

**Expected questions to prepare for**:

1. "How does this compare to RAG?"
2. "Why not just use a smaller context window?"
3. "What's the latency overhead?"
4. "How accurate is the skill detection?"
5. "Can I create my own skills?"

**Key differentiators to emphasize if asked**:

- Open source (MIT license)
- Benchmarks are reproducible
- No external dependencies beyond your Claude API
- Community-driven skill library
