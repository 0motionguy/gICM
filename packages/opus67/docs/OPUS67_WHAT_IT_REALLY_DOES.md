# OPUS 67 - What It Really Does

> **100% Honest Documentation** - No marketing, no fluff, just facts.

---

## TL;DR

**OPUS 67 is a knowledge library + MCP server.**

It gives Claude Code access to 141 domain expertise markdown files via keyword matching. When you run `opus67 init`, it registers an MCP server that Claude Code can query.

**It does NOT run automatically.** Claude Code must explicitly call the MCP tools. The "magic" is that your CLAUDE.md file contains instructions telling Claude to use these tools.

**It does NOT connect 82 MCPs.** Those are YAML definitions listing what MCPs *could* be connected. You need to run the servers and set up API keys yourself.

---

## What OPUS 67 Actually IS

### 1. A Curated Knowledge Library

```
packages/opus67/skills/
├── definitions/           # 141 markdown files
│   ├── solana-anchor-expert.md
│   ├── react-component-builder.md
│   ├── nextjs-14-expert.md
│   └── ... (138 more)
├── registry.yaml          # Indexes all skills with triggers
└── metadata/              # YAML metadata files
```

Each skill is a **static markdown file** (~5-20KB) containing:
- Domain expertise prompts
- Best practices
- Code patterns
- Common mistakes to avoid

**They are NOT runtime code.** They're text files that get loaded into Claude's context.

### 2. An MCP Server for Introspection

When you run `opus67 init`, it registers the `opus67-mcp` server with Claude Code.

This server exposes **9 tools**:

| Tool | What It Does |
|------|--------------|
| `opus67_boot` | Shows the OPUS 67 logo |
| `opus67_list_skills` | Lists skills from registry.yaml |
| `opus67_detect_skills` | Keyword matches your query against skill triggers |
| `opus67_get_skill` | Reads a skill markdown file from disk |
| `opus67_get_context` | Bundles skills + modes + MCPs for a task |
| `opus67_list_modes` | Lists operating modes |
| `opus67_get_mode` | Gets mode details |
| `opus67_list_mcps` | Lists MCP definitions from YAML |
| `opus67_status` | Shows system status |

**These tools only read files.** They don't connect to external services.

### 3. Instructions in CLAUDE.md

When you run `opus67 init`, it adds this to your `~/.claude/CLAUDE.md`:

```markdown
## Automatic Behavior
1. On every task, run opus67_detect_skills to find relevant skills
2. Load detected skills with opus67_get_skill
3. Apply skill knowledge to the task
```

**This is an INSTRUCTION to Claude, not automatic behavior from OPUS 67.**

Claude Code reads this instruction and (if it follows it) calls the MCP tools. OPUS 67 itself has no background processes, no watchers, no auto-triggers.

---

## What OPUS 67 is NOT

### NOT an Autopilot System

There are no background processes. Nothing runs automatically. The code shows:

```typescript
// From boot.ts - this is ALL that happens
async boot(): Promise<void> {
  await this.loadTheDoor();      // Read file from disk
  await this.skills.loadRegistry(); // Parse YAML
  await this.mcp.connectAll();   // Does nothing if no MCPs configured
  // Then STOPS. No watchers. No timers. No magic.
}
```

### NOT Auto-Connecting 82 MCPs

The `mcp/connections.yaml` file lists 82 MCP definitions like:

```yaml
postgres:
  type: mcp_server
  command: npx
  args: ["-y", "@modelcontextprotocol/server-postgres"]

jupiter:
  type: rest_api
  base_url: https://quote-api.jup.ag/v6
```

**These are definitions, not connections.**

The actual `connectAll()` code:
```typescript
async connectAll(): Promise<void> {
  const alwaysConnect = this.config?.auto_connect?.always || [];
  // If empty (which it is by default), nothing happens
  if (alwaysConnect.length === 0) {
    console.log("[MCPHub] No auto-connect MCPs configured");
  }
}
```

To use these MCPs, YOU need to:
1. Install the MCP server package
2. Run it separately
3. Set API keys in `.env`
4. Configure it in your MCP settings

### NOT Auto-Injecting Skills

Skills are only loaded when Claude Code calls `opus67_get_skill(id)`.

The detection flow:
```
Your query: "Build a React component"
        ↓
Claude calls: opus67_detect_skills("Build a React component")
        ↓
OPUS 67: Searches registry.yaml for keywords
        ↓
Returns: ["react-component-builder", "typescript-patterns", ...]
        ↓
Claude calls: opus67_get_skill("react-component-builder")
        ↓
OPUS 67: Reads skills/definitions/react-component-builder.md
        ↓
Returns: The full markdown text
        ↓
Claude: Uses this in its response
```

**If Claude doesn't call the tools, nothing happens.**

### NOT a Memory System

The "5-tier memory" requires YOUR infrastructure:

| Tier | Technology | Your Requirement |
|------|------------|------------------|
| Tier 1 | Qdrant | Deploy Qdrant server |
| Tier 2 | Mem0 | Deploy Mem0 server |
| Tier 3 | Neo4j | Deploy Neo4j database |
| Tier 4 | Graphiti | Deploy Graphiti server |
| Tier 5 | PostgreSQL | Deploy PostgreSQL database |

OPUS 67 has the **client code** to talk to these, but nothing is deployed or connected by default.

---

## The Actual Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           YOUR SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐         ┌─────────────────┐                        │
│  │   Claude Code   │ ──────→ │   opus67-mcp    │                        │
│  │   (The Brain)   │ ←────── │   (MCP Server)  │                        │
│  └─────────────────┘         └─────────────────┘                        │
│         │                            │                                   │
│         │ Reads CLAUDE.md            │ Reads from disk                   │
│         │ which says:                │                                   │
│         │ "call opus67 tools"        ▼                                   │
│         │                    ┌───────────────────┐                       │
│         │                    │ skills/           │                       │
│         │                    │ ├── registry.yaml │                       │
│         │                    │ └── definitions/  │                       │
│         │                    │     └── *.md      │                       │
│         │                    └───────────────────┘                       │
│         │                                                                │
│         │                    ┌───────────────────┐                       │
│         │                    │ mcp/              │                       │
│         │                    │ └── connections.  │ ← Just YAML,          │
│         │                    │     yaml          │   not connections     │
│         │                    └───────────────────┘                       │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     NOT INCLUDED / YOUR SETUP                    │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  External MCP Servers:    Memory Backends:     API Keys:        │    │
│  │  • postgres-mcp           • Qdrant             • OpenAI         │    │
│  │  • github-mcp             • Neo4j              • Anthropic      │    │
│  │  • supabase-mcp           • PostgreSQL         • Jupiter        │    │
│  │  • etc.                   • Mem0               • etc.           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## What Works Out of the Box

These things work immediately after `npm install -g @gicm/opus67 && opus67 init`:

| Feature | What Happens | Verified |
|---------|--------------|----------|
| `opus67 init` | Registers MCP server with Claude Code | ✅ |
| `opus67_detect_skills` | Keyword matching on registry | ✅ Benchmarked: 0.25ms |
| `opus67_get_skill` | Reads markdown from disk | ✅ Benchmarked: 0.22ms/skill |
| `opus67_list_skills` | Lists all 141 skills | ✅ |
| `opus67_list_modes` | Lists all 30 modes | ✅ |
| `opus67_list_mcps` | Lists 82 MCP definitions | ✅ |
| Registry loading | Parses YAML files | ✅ Benchmarked: 32ms |
| Boot time | Full initialization | ✅ Benchmarked: 79ms |

---

## What Requires Your Setup

| Feature | What You Need | Effort |
|---------|---------------|--------|
| Using external MCPs | Install + run MCP servers, set API keys | Medium |
| Memory persistence | Deploy Qdrant/Neo4j/PostgreSQL | High |
| Prompt caching | Use Anthropic's caching API | Low |
| Extended thinking | Enable in Anthropic API | Low |

---

## Claims vs Reality

| Marketing Claim | Reality |
|-----------------|---------|
| "82 MCP connections" | 82 MCP **definitions** in YAML. Not connected. |
| "Auto-detect skills" | Claude must call `opus67_detect_skills`. No auto-trigger. |
| "5-tier memory" | Client code exists. Backends need YOUR setup. |
| "3-5x faster" | Projection. Not A/B tested. |
| "57% cost savings" | Calculated estimate. Not measured on real billing. |
| "89% success rate" | Aspirational. Not measured across real tasks. |
| "Auto-pilot" | No background processes. Claude must follow CLAUDE.md instructions. |

---

## Real Benchmarks (Actually Measured)

These numbers come from `pnpm test:benchmark` - actual code execution:

| Metric | Value | How Measured |
|--------|-------|--------------|
| Boot time | 79ms | `performance.now()` around boot() |
| Skill load time | 0.22ms/skill | Timed 141 skill loads |
| Mode detection | 0.25ms | Timed mode matching |
| Registry parse | 32ms | Timed YAML parsing |
| E2E query processing | 63ms | Full detect → load → format |

**Not measured:**
- Actual task completion times (would need user study)
- Cost savings (would need billing data)
- Success rates (would need graded outputs)

---

## When OPUS 67 Is Worth It

### Worth It If:

1. **You want curated domain expertise**
   - 141 well-written skill prompts covering Solana, React, DevOps, etc.
   - Saves you from writing these prompts yourself

2. **You use Claude Code regularly**
   - The MCP integration means skills are one tool call away
   - CLAUDE.md instructions remind Claude to use them

3. **You're building in supported domains**
   - Solana/Web3 development (18 skills)
   - React/Next.js (15 skills)
   - GRAB visual-to-code (22 skills)

### NOT Worth It If:

1. **You expect autopilot**
   - OPUS 67 doesn't run automatically
   - Claude must call the tools

2. **You expect 82 working MCPs**
   - They're definitions, not connections
   - You'd need to set each one up yourself

3. **You expect memory out of the box**
   - Memory tiers need your infrastructure
   - Qdrant, Neo4j, PostgreSQL not included

---

## Honest Summary

**OPUS 67 is valuable as a curated knowledge library.**

It's 141 high-quality skill prompts, indexed and searchable, accessible via MCP tools. When Claude Code follows the CLAUDE.md instructions, it loads relevant skills into context.

**It's NOT a magic system that runs automatically.**

The "auto-detection" is Claude reading instructions and calling tools. The "82 MCPs" are config entries. The "5-tier memory" needs your servers.

**The real value proposition:**
- Save time writing domain-specific prompts
- Consistent skill quality across sessions
- Fast keyword-based skill matching (0.25ms)
- Clean MCP interface for tool access

**What you still need to do:**
- Trust that Claude will follow CLAUDE.md instructions
- Set up external MCPs if you want them
- Deploy memory backends if you want persistence
- Manage API keys yourself

---

## Running the Benchmarks Yourself

```bash
cd packages/opus67

# Core performance benchmarks
pnpm test:benchmark

# Full test suite
pnpm test

# See what's actually in the registry
cat skills/registry.yaml | head -100
```

---

*This document reflects the actual code as of OPUS 67 v5.1.9*
*Generated with 100% brutal honesty*
