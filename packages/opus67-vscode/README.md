<p align="center">
  <img src="https://raw.githubusercontent.com/gicm-dev/gicm/main/packages/opus67-vscode/resources/icons/opus67-logo.png" alt="OPUS 67" width="200"/>
</p>

<h1 align="center">OPUS 67</h1>

<p align="center">
  <strong>The AI Engine That Ships Code</strong><br/>
  141 Skills • 83 MCPs • 30 Modes • 107 Agents
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=gicm.opus67">
    <img src="https://img.shields.io/visual-studio-marketplace/v/gicm.opus67?style=flat-square&label=VS%20Code" alt="VS Code Marketplace"/>
  </a>
  <a href="https://www.npmjs.com/package/create-opus67">
    <img src="https://img.shields.io/npm/v/create-opus67?style=flat-square&label=npm" alt="npm"/>
  </a>
</p>

---

## Quick Install

```bash
npx create-opus67@latest
```

One command installs everything: skills, MCPs, hooks, agents, and memory system for Claude Code/Desktop.

---

## Features

### Unified Memory System

OPUS 67 features a **unified memory architecture** that coordinates multiple memory sources:

| Source             | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| **GraphitiMemory** | Graph database for relational context                |
| **LearningStore**  | Pattern evolution and learnings                      |
| **MarkdownMemory** | `.claude/memory/` files (wins, decisions, learnings) |
| **HMLR Adapter**   | Multi-hop reasoning (3-5 hop queries)                |
| **SessionStore**   | Current session context                              |

### Context Indexing

Intelligent context enhancement that:

- Pulls relevant memories from ALL sources
- Injects context automatically into prompts
- Manages token budgets efficiently
- Supports 85%+ cache hit rate

### Performance Benchmarks

| Metric             | Value              |
| ------------------ | ------------------ |
| **Boot Time**      | ~108ms             |
| **Skill Loading**  | 141 skills in 44ms |
| **Time Per Skill** | 0.32ms             |
| **Cache Hit Rate** | 85%+               |
| **E2E Query**      | <72ms              |
| **Memory Usage**   | ~140MB RAM         |

### 30 Operating Modes

| Mode         | Use Case                             |
| ------------ | ------------------------------------ |
| **AUTO**     | Intelligent mode selection (default) |
| **ULTRA**    | Maximum reasoning for architecture   |
| **THINK**    | Deep analysis and debugging          |
| **BUILD**    | Production code generation           |
| **VIBE**     | Rapid prototyping                    |
| **LIGHT**    | Simple questions and syntax          |
| **CREATIVE** | Visual design and UI                 |
| **DATA**     | Analytics and market data            |
| **AUDIT**    | Security review                      |
| **SWARM**    | Multi-agent parallel execution       |

### 141 Domain Skills

Pre-built expertise including:

- `solana-anchor-expert` - Blockchain development
- `react-typescript-master` - Frontend patterns
- `smart-contract-auditor` - Security analysis
- `nextjs-14-expert` - App Router patterns
- `defi-data-analyst` - DeFi analytics
- And 136 more...

### 107 Specialized Agents

Spawn task-specific agents for:

- Code review and refactoring
- Security audits
- Performance optimization
- Documentation generation
- Test automation

---

## VS Code Extension Usage

### Sidebar Panel

Look for the **OPUS 67** icon in the Activity Bar (left sidebar):

- **Modes (30)** - Browse and switch modes
- **Skills (141)** - Load domain expertise
- **Agents (107)** - Spawn specialized agents

### Status Bar

The current mode is shown in the status bar (bottom right). Click to switch modes.

### Commands (Ctrl+Shift+P)

| Command                   | Description             |
| ------------------------- | ----------------------- |
| `OPUS 67: Switch Mode`    | Change operating mode   |
| `OPUS 67: Load Skill`     | Load domain expertise   |
| `OPUS 67: Spawn Agent`    | Spawn specialized agent |
| `OPUS 67: Show Dashboard` | Visual overview         |
| `OPUS 67: Refresh`        | Refresh all views       |

---

## Installation

### Full Installation (Recommended)

```bash
npx create-opus67@latest
```

This installs the complete OPUS 67 system:

- MCP tools for Claude Code/Desktop
- 141 skills with context injection
- Memory system with unified sources
- Hooks for automation

### VS Code Extension Only

**From Marketplace:**

1. Open VS Code → Extensions (`Ctrl+Shift+X`)
2. Search **"OPUS 67"**
3. Click Install

**From Command Line:**

```bash
code --install-extension gicm.opus67
```

**From VSIX:**

```bash
code --install-extension opus67-1.0.2.vsix
```

---

## Extension Settings

| Setting                    | Default | Description               |
| -------------------------- | ------- | ------------------------- |
| `opus67.defaultMode`       | `auto`  | Default operating mode    |
| `opus67.showStatusBar`     | `true`  | Show mode in status bar   |
| `opus67.autoInjectContext` | `true`  | Auto-inject skill context |

---

## Token Efficiency

OPUS 67 optimizes token usage through:

- **Hierarchical skill loading** - Load only what's needed
- **Context windowing** - Smart truncation and prioritization
- **Prompt caching** - 85%+ cache hit rate
- **Mode-specific budgets** - Each mode has optimized token limits

---

## Requirements

- VS Code 1.85.0+
- Node.js 18+ (for npx installer)
- Claude Code or Claude Desktop (for full functionality)

---

## Links

- **NPX Installer**: `npx create-opus67@latest`
- **Marketplace**: https://marketplace.visualstudio.com/items?itemName=gicm.opus67
- **Dashboard**: https://gicm-marketplace.vercel.app/opus67
- **Repository**: https://github.com/gicm-dev/gicm

---

## License

MIT
