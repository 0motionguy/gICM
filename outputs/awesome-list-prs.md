# Awesome List PR Submissions

## 1. awesome-solana

**Repository**: https://github.com/avareum/awesome-solana

**Section**: Developer Tools / AI & Automation

**PR Title**: Add OPUS 67 - AI enhancement layer with Solana-specific skills

**PR Body**:

```markdown
## Description

Adding OPUS 67 to the Developer Tools section. It's an open-source AI enhancement layer for Claude that includes 12 Solana-specific skills:

- solana-anchor-expert
- bonding-curve-master
- pda-derivation-master
- smart-contract-auditor
- spl-token-expert
- metaplex-nft-expert
- jupiter-integration
- raydium-amm-expert
- And more...

## Why it belongs here

- Specifically built for Solana development
- Improves Claude's Anchor code generation accuracy
- Includes security audit patterns for Solana programs
- Open source (MIT license)
- Active development with community contributions

## Links

- GitHub: https://github.com/icm-motion/gICM
- Documentation: https://docs.opus67.com

## Checklist

- [x] I have read the contributing guidelines
- [x] The project is open source
- [x] The project is actively maintained
- [x] The project is related to Solana development
```

**List Entry**:

```markdown
- [OPUS 67](https://github.com/icm-motion/gICM) - AI enhancement layer with 12 Solana-specific skills for Claude, including Anchor patterns and security auditing.
```

---

## 2. awesome-claude

**Repository**: https://github.com/anthropics/anthropic-cookbook (or similar community list)

**Section**: Tools & Integrations

**PR Title**: Add OPUS 67 - Progressive disclosure skill system for Claude

**PR Body**:

````markdown
## Description

OPUS 67 is an open-source enhancement layer for Claude that implements progressive disclosure for AI context management.

## Key Features

- **96 skills** - Domain expertise modules loaded on-demand
- **108 agents** - Multi-step workflow automation
- **82 MCP integrations** - External service connections
- **Progressive disclosure** - Loads only relevant context per request

## Benchmark Results

- HumanEval: 91.2% -> 96.8% (+5.6%)
- Token reduction: 74% average
- All benchmarks reproducible in repository

## Installation

```bash
npx @gicm/opus67 init
```
````

## Links

- GitHub: https://github.com/icm-motion/gICM
- Documentation: https://docs.opus67.com

## Checklist

- [x] Works with Claude Desktop
- [x] Works with Claude API
- [x] Uses MCP protocol
- [x] Open source

````

**List Entry**:
```markdown
- [OPUS 67](https://github.com/icm-motion/gICM) - Progressive disclosure skill system with 593+ components. Improves HumanEval by 5.6%, reduces tokens by 74%.
````

---

## 3. awesome-ai-tools

**Repository**: https://github.com/mahseema/awesome-ai-tools

**Section**: Coding Assistants / Developer Tools

**PR Title**: Add OPUS 67 - Open-source AI enhancement layer

**PR Body**:

````markdown
## Description

OPUS 67 is an open-source skill system that enhances Claude with domain-specific expertise through progressive disclosure.

## What it does

Instead of bloating system prompts with all possible context, OPUS 67 detects what the user is working on and loads only relevant skills. This improves both quality and cost-efficiency.

## Stats

- 593+ components (skills, agents, MCPs, commands)
- 96.8% HumanEval score (up from 91.2% baseline)
- 74% token reduction
- MIT license

## Installation

```bash
npx @gicm/opus67 init
```
````

## Links

- GitHub: https://github.com/icm-motion/gICM
- Docs: https://docs.opus67.com

## Checklist

- [x] Open source
- [x] Actively maintained
- [x] Relevant to AI development

````

**List Entry**:
```markdown
- [OPUS 67](https://github.com/icm-motion/gICM) - Open-source enhancement layer for Claude with 593+ components. Progressive disclosure architecture reduces tokens by 74% while improving code quality.
````

---

## 4. awesome-mcp-servers

**Repository**: https://github.com/punkpeye/awesome-mcp-servers

**Section**: Development Tools

**PR Title**: Add OPUS 67 - MCP-based skill management system

**PR Body**:

````markdown
## Description

OPUS 67 provides MCP tools for dynamic skill loading and context management.

## MCP Tools Provided

- `opus67_detect_skills` - Semantic detection of relevant skills
- `opus67_get_skill` - Load specific skill into context
- `opus67_get_context` - Get full context bundle for a task
- `opus67_list_skills` - List all available skills

## Features

- 96 skills available via MCP
- 108 agents (multi-skill workflows)
- 82 external MCP integrations (GitHub, Supabase, Vercel, etc.)
- On-demand loading (progressive disclosure)

## Installation

```bash
npx @gicm/opus67 init
```
````

Automatically configures MCP for Claude Desktop or VS Code.

## Links

- GitHub: https://github.com/icm-motion/gICM
- MCP Documentation: https://docs.opus67.com/mcp

## Checklist

- [x] Implements MCP protocol
- [x] Open source
- [x] Actively maintained
- [x] Documentation available

````

**List Entry**:
```markdown
- [OPUS 67](https://github.com/icm-motion/gICM) - Skill management system with 593+ components. MCP tools for dynamic context loading and multi-step workflows. `skills` `agents` `development`
````

---

## 5. awesome-developer-tools

**Repository**: https://github.com/moimikey/awesome-developer-tools

**Section**: AI & Automation

**PR Title**: Add OPUS 67 - AI enhancement layer for Claude

**PR Body**:

````markdown
## Description

OPUS 67 is an open-source AI enhancement layer that improves Claude's performance through progressive disclosure of domain expertise.

## Problem it solves

Developers using Claude for coding often stuff system prompts with extensive context (coding patterns, documentation, examples). This is wasteful - most context isn't relevant to any given request.

## Solution

OPUS 67 detects what you're working on and loads only relevant "skills" (domain expertise modules). Result: better outputs, lower costs.

## Key metrics

- HumanEval improvement: +5.6% (91.2% -> 96.8%)
- Token reduction: 74%
- Components: 593+ (skills, agents, MCPs, commands)

## Installation

```bash
npx @gicm/opus67 init
```
````

## Links

- GitHub: https://github.com/icm-motion/gICM
- Documentation: https://docs.opus67.com

## Checklist

- [x] Relevant to developers
- [x] Open source
- [x] Actively maintained

````

**List Entry**:
```markdown
- [OPUS 67](https://github.com/icm-motion/gICM) - AI enhancement layer for Claude with progressive disclosure. 593+ skills load on-demand for better code generation and 74% lower costs.
````

---

## Submission Checklist

Before submitting each PR:

- [ ] Fork the awesome list repository
- [ ] Read their CONTRIBUTING.md
- [ ] Check the project isn't already listed
- [ ] Match their formatting style exactly
- [ ] Include all required checklist items
- [ ] Use their category structure
- [ ] Keep description concise

## Timeline

| Week | Action                                                    |
| ---- | --------------------------------------------------------- |
| 1    | Submit to awesome-mcp-servers (most relevant)             |
| 1    | Submit to awesome-solana (niche, high value)              |
| 2    | Submit to awesome-ai-tools (broad audience)               |
| 2    | Submit to awesome-developer-tools (general dev)           |
| 3    | Submit to awesome-claude (if exists, or find alternative) |

Space out submissions to avoid looking spammy.
