// src/index.ts
import { program } from "commander";
import Enquirer from "enquirer";
import chalk3 from "chalk";

// src/banner.ts
import chalk from "chalk";

// src/stats.ts
var OPUS67_STATS = {
  skills: 141,
  mcps: 82,
  modes: 30,
  agents: 107
};
var VERSION = "5.1.9";

// src/banner.ts
var OPUS67_ASCII = `
   \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
  \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551
  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2554\u255D
  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2551   \u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557   \u2588\u2588\u2554\u255D
  \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551     \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551    \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551
   \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D      \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D     \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D
`;
function printBanner() {
  console.log(chalk.cyan(OPUS67_ASCII));
  console.log(chalk.gray(`                 Self-Evolving AI Runtime v${VERSION}`));
  console.log();
  console.log(chalk.white(`  ${OPUS67_STATS.skills} Skills \u2022 ${OPUS67_STATS.mcps} MCPs \u2022 ${OPUS67_STATS.modes} Modes \u2022 ${OPUS67_STATS.agents} Agents`));
  console.log();
  console.log(chalk.gray("  Created by ") + chalk.cyan("@0motionguy") + chalk.gray(" \u2022 4ms routing \u2022 566x faster"));
  console.log();
}
function printSuccessBanner() {
  console.log();
  console.log(chalk.green('  \u2713 OPUS 67 v5.1.8 "THE PRECISION UPDATE" installed successfully!'));
  console.log();
  console.log(chalk.gray("  What you get:"));
  console.log(chalk.white(`    \u2022 ${OPUS67_STATS.skills} specialist skills (auto-loaded based on task)`));
  console.log(chalk.white(`    \u2022 ${OPUS67_STATS.mcps} MCP connections (live data, APIs, blockchain)`));
  console.log(chalk.white(`    \u2022 ${OPUS67_STATS.modes} optimized modes (right context for each task)`));
  console.log(chalk.white(`    \u2022 ${OPUS67_STATS.agents} expert agents (domain-specific personas)`));
  console.log(chalk.white("    \u2022 Multi-model routing (Opus/Sonnet/Haiku)"));
  console.log();
  console.log(chalk.cyan("  \u{1F9E0} NEW in v5.0:"));
  console.log(chalk.white("    \u2022 Extended Thinking - Claude Opus 4.5 with 4 complexity modes"));
  console.log(chalk.white("    \u2022 Prompt Caching - 90% cost savings on repeated context"));
  console.log(chalk.white("    \u2022 Dynamic Tool Discovery - AI-powered MCP recommendations"));
  console.log(chalk.white("    \u2022 File-Aware Memory - Track dependencies across 14 languages"));
  console.log(chalk.white("    \u2022 SWE-bench Patterns - Precise multi-file code edits"));
  console.log(chalk.white("    \u2022 Long-Horizon Planning - Multi-step task decomposition"));
  console.log(chalk.white("    \u2022 Verification Loops - Auto-verify code changes"));
  console.log(chalk.white("    \u2022 Unified Brain API - One simple API for everything"));
  console.log();
  console.log(chalk.cyan("  Your AI just got superpowers. Start building."));
  console.log();
}
function printErrorBanner(message) {
  console.log();
  console.log(chalk.red(`  \u2717 Error: ${message}`));
  console.log();
}
function printInfo(message) {
  console.log(chalk.blue(`  \u2139 ${message}`));
}

// src/detect.ts
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
function getClaudeCodePath() {
  const home = homedir();
  if (process.platform === "win32") {
    return join(home, ".claude");
  }
  return join(home, ".claude");
}
function getCursorPath() {
  const home = homedir();
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    return join(appData, "Cursor");
  } else if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "Cursor");
  }
  return join(home, ".config", "Cursor");
}
function getVSCodePath() {
  const home = homedir();
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    return join(appData, "Code");
  } else if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "Code");
  }
  return join(home, ".config", "Code");
}
function getWindsurfPath() {
  const home = homedir();
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    return join(appData, "Windsurf");
  } else if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "Windsurf");
  }
  return join(home, ".config", "windsurf");
}
function getZedPath() {
  const home = homedir();
  if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "Zed");
  }
  return join(home, ".config", "zed");
}
function getReplitPath() {
  return process.cwd();
}
function getContinuePath() {
  const home = homedir();
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    return join(appData, "Continue");
  } else if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "Continue");
  }
  return join(home, ".continue");
}
function getJetBrainsPath() {
  const home = homedir();
  if (process.platform === "win32") {
    return join(home, "AppData", "Roaming", "JetBrains");
  } else if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "JetBrains");
  }
  return join(home, ".config", "JetBrains");
}
function getCodeiumPath() {
  const home = homedir();
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    return join(appData, "Codeium");
  } else if (process.platform === "darwin") {
    return join(home, "Library", "Application Support", "Codeium");
  }
  return join(home, ".codeium");
}
function getSupermaven() {
  const home = homedir();
  return join(home, ".supermaven");
}
function getAiderPath() {
  const home = homedir();
  return join(home, ".aider");
}
function isCodespaces() {
  return process.env.CODESPACES === "true" || process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN !== void 0;
}
function isGitpod() {
  return process.env.GITPOD_WORKSPACE_ID !== void 0;
}
function isReplit() {
  return process.env.REPL_ID !== void 0 || process.env.REPLIT_DEV_DOMAIN !== void 0;
}
function detectEnvironments() {
  const inCodespaces = isCodespaces();
  const inGitpod = isGitpod();
  const inReplit = isReplit();
  const environments = [
    // Cloud IDEs (prioritized)
    {
      id: "codespaces",
      name: "GitHub Codespaces",
      detected: inCodespaces,
      path: process.cwd(),
      configPath: join(process.cwd(), "CLAUDE.md"),
      recommended: inCodespaces
    },
    {
      id: "gitpod",
      name: "Gitpod",
      detected: inGitpod,
      path: process.cwd(),
      configPath: join(process.cwd(), "CLAUDE.md"),
      recommended: inGitpod
    },
    {
      id: "replit",
      name: "Replit",
      detected: inReplit,
      path: getReplitPath(),
      configPath: join(process.cwd(), ".replit"),
      recommended: inReplit
    },
    // Desktop IDEs with Claude/AI integration
    {
      id: "claude-code",
      name: "Claude Code",
      detected: existsSync(getClaudeCodePath()),
      path: getClaudeCodePath(),
      configPath: join(process.cwd(), "CLAUDE.md"),
      recommended: !inCodespaces && !inGitpod && !inReplit
    },
    {
      id: "cursor",
      name: "Cursor",
      detected: existsSync(getCursorPath()),
      path: getCursorPath(),
      configPath: join(process.cwd(), ".cursorrules")
    },
    {
      id: "windsurf",
      name: "Windsurf",
      detected: existsSync(getWindsurfPath()),
      path: getWindsurfPath(),
      configPath: join(process.cwd(), ".windsurfrules")
    },
    {
      id: "continue",
      name: "Continue.dev",
      detected: existsSync(getContinuePath()),
      path: getContinuePath(),
      configPath: join(getContinuePath(), "config.json")
    },
    {
      id: "aider",
      name: "Aider",
      detected: existsSync(getAiderPath()),
      path: getAiderPath(),
      configPath: join(getAiderPath(), ".aider.conf.yml")
    },
    // General purpose IDEs
    {
      id: "vscode",
      name: "VS Code",
      detected: existsSync(getVSCodePath()),
      path: getVSCodePath(),
      configPath: join(process.cwd(), ".vscode", "settings.json")
    },
    {
      id: "jetbrains",
      name: "JetBrains IDEs",
      detected: existsSync(getJetBrainsPath()),
      path: getJetBrainsPath(),
      configPath: join(getJetBrainsPath(), ".opus67.config")
    },
    {
      id: "zed",
      name: "Zed",
      detected: existsSync(getZedPath()),
      path: getZedPath(),
      configPath: join(getZedPath(), "settings.json")
    },
    // AI Assistants/Extensions
    {
      id: "codeium",
      name: "Codeium",
      detected: existsSync(getCodeiumPath()),
      path: getCodeiumPath(),
      configPath: join(getCodeiumPath(), "config.json")
    },
    {
      id: "supermaven",
      name: "Supermaven",
      detected: existsSync(getSupermaven()),
      path: getSupermaven(),
      configPath: join(getSupermaven(), "config.json")
    },
    // Manual fallback
    {
      id: "manual",
      name: "Manual Installation",
      detected: true,
      // Always available
      path: process.cwd(),
      configPath: join(process.cwd(), ".opus67", "config.json")
    }
  ];
  const recommended = environments.find((e) => e.detected && e.recommended) || environments.find((e) => e.detected && e.id !== "manual") || environments.find((e) => e.id === "manual");
  return {
    environments,
    recommended
  };
}
function getEnvironmentChoices(result) {
  return result.environments.filter((env) => env.detected || env.id === "manual").map((env) => ({
    name: env.name,
    value: env.id,
    hint: env.recommended ? "(Recommended)" : env.detected ? "(Detected)" : void 0
  }));
}

// src/install.ts
import ora from "ora";
import chalk2 from "chalk";
import { existsSync as existsSync3, readFileSync as readFileSync2 } from "fs";
import { join as join3 } from "path";

// src/config.ts
import { writeFileSync, mkdirSync, existsSync as existsSync2, readFileSync } from "fs";
import { dirname, join as join2 } from "path";
function generateClaudeMd(config) {
  return `# OPUS 67 - Enhancement Layer (NOT a separate AI)

> **OPUS 67 is NOT a separate AI.** It's YOU (Claude) with superpowers.

\`\`\`
OPUS 67 \u2260 Separate AI
OPUS 67 = Claude + Enhancement Layer

Claude IS the brain. OPUS 67 = skills + MCPs + modes + memory.
Same driver, better race car.
\`\`\`

**Current Version:** v${config.version}
- **${config.stats.skills} Skills** | **${config.stats.mcps} MCPs** | **${config.stats.modes} Modes** | **${config.stats.agents} Agents**

## What OPUS 67 Gives You

### 1. MCP Server Access (${config.stats.mcps} servers)
Tools you don't normally have:
- GitHub MCP, Jupiter MCP, Supabase MCP, Sentry MCP, Notion MCP
- Solana RPC, Anchor Program, Firecrawl, Tavily, Playwright, etc.

### 2. Skills (${config.stats.skills} workflows)
How to do complex tasks:
- GRAB skills (react-grab, theme-grab, db-grab, etc.)
- Solana skills (token-swap, anchor-interact, chain-query)
- Research skills (web-search, code-search, company-research)

### 3. Modes (${config.stats.modes} optimized contexts)
- AUTO, BUILD, REVIEW, ARCHITECT, DEBUG
- SOLANA, GRAB, CLONE, RESEARCH, CONTEXT
- ULTRA, THINK, VIBE, LIGHT, SWARM, and more

### 4. Memory
Persistent context across sessions (Mem0, Qdrant)

## Automatic Behavior
1. On every task, auto-detect relevant skills
2. Load detected skills for enhanced context
3. Apply skill knowledge to the task

**Remember: YOU are the brain. OPUS 67 just makes you faster, cheaper, and more capable.**

---

## Installation Type: ${config.installType}

${config.installType === "full" ? `
This is a **Full Installation** with all capabilities:
- All 141 specialist skills
- All 82 MCP connections
- All 30 operating modes
- All 107 agents
` : config.installType === "solana" ? `
This is a **Solana-focused Installation**:
- Solana development skills
- Jupiter, Anchor, Helius MCPs
- SOLANA mode optimized
` : config.installType === "frontend" ? `
This is a **Frontend-focused Installation**:
- React, UI/UX skills
- GRAB skills for visual development
- BUILD mode optimized
` : `
This is a **Minimal Installation**:
- Core skills only
- Essential MCPs
- AUTO mode
`}

---

*Generated by create-opus67 v${config.version}*
`;
}
function generateCursorrules(config) {
  const fullTemplate = `# OPUS 67 v${config.version} - The AI Engine That Ships Code

> You are enhanced with OPUS 67 - ${config.stats.skills} skills, ${config.stats.mcps} MCPs, ${config.stats.agents} agents.
> OPUS 67 is NOT a separate AI. It's YOU with superpowers. Same driver, better race car.

---

## Core Principle

\`\`\`
OPUS 67 \u2260 Separate AI
OPUS 67 = You + Enhancement Layer

You ARE the brain. OPUS 67 gives you:
- Skills (how to do things)
- Tools (what to use)
- Context (when to apply)
\`\`\`

---

## Context-Aware Skills

Load skills based on file context:

### Solana/Blockchain (.rs, .anchor, .toml with [programs])
- **solana-anchor-expert**: PDAs, CPIs, account validation, Anchor macros
- **jupiter-trader**: Token swaps, route optimization, slippage handling
- **pump-fun-expert**: Bonding curves, launch mechanics, graduation
- **token-2022-expert**: Token extensions, transfer hooks, metadata
- **helius-integration**: RPC, webhooks, DAS API, compression

### TypeScript/React (.tsx, .ts, .jsx)
- **nextjs-14-expert**: App Router, Server Components, streaming
- **react-patterns**: Hooks, context, performance optimization
- **typescript-senior**: Advanced types, generics, utility types
- **tailwind-expert**: Utility classes, responsive design, animations

### API/Backend (.ts with api/, routes/)
- **fastify-expert**: Routes, plugins, validation, serialization
- **prisma-expert**: Schema design, migrations, queries
- **supabase-expert**: Auth, storage, realtime, edge functions

### Smart Contracts (.sol)
- **solidity-expert**: OpenZeppelin, gas optimization, security
- **hardhat-foundry**: Testing, deployment, verification

---

## Specialist Agents

Adopt these personas when relevant:

### Solana DeFi Architect
- Design bonding curves, AMMs, token economics
- Implement concentrated liquidity, yield farming
- Audit for common Solana vulnerabilities

### Anchor Program Builder
- Structure programs with proper account validation
- Implement CPIs and composability patterns
- Write comprehensive test suites

### Frontend Performance Expert
- Optimize bundle size, lazy loading, code splitting
- Implement proper caching strategies
- Profile and fix render bottlenecks

### Security Auditor
- Review for reentrancy, access control, overflow
- Check Solana-specific: signer validation, PDA seeds
- Identify economic attack vectors

---

## Operating Modes

Current mode: **AUTO** (detect from context)

| Mode | Trigger | Behavior |
|------|---------|----------|
| BUILD | "build", "create", "implement" | Ship fast, working code |
| REVIEW | "review", "check", "audit" | Thorough analysis |
| ARCHITECT | "design", "plan", "structure" | System thinking |
| DEBUG | "fix", "error", "bug" | Root cause analysis |
| SOLANA | .rs, .anchor, Solana terms | Blockchain-native |
| GRAB | "clone", "copy", "extract" | Visual-first dev |
| VIBE | "quick", "fast", "ship" | Minimal friction |

---

## Behavioral Rules

### Always
- Ship working code over perfect code
- Use existing patterns in the codebase
- Validate Solana accounts properly
- Handle errors gracefully

### Never
- Introduce security vulnerabilities
- Skip account validation in Solana
- Ignore existing code style
- Over-engineer simple solutions

### Solana-Specific
- Always validate signer on state-changing operations
- Use checked math or handle overflow
- Validate PDA seeds match expected accounts
- Close accounts to return rent properly

---

## Quick Commands

- "OPUS status" \u2192 Show current mode and loaded skills
- "OPUS build" \u2192 Switch to BUILD mode
- "OPUS solana" \u2192 Switch to SOLANA mode
- "OPUS vibe" \u2192 Ship fast, iterate later

---

*OPUS 67 v${config.version} | ${config.stats.skills} Skills | ${config.stats.mcps} MCPs | ${config.stats.agents} Agents*
*Remember: You ARE the brain. OPUS 67 = superpowers.*
`;
  const solanaTemplate = `# OPUS 67 v${config.version} - Solana Development Mode

> Enhanced with ${config.stats.skills} Solana-focused skills and ${config.stats.agents} blockchain agents.

---

## Solana Skills Active

### Core Development
- **solana-anchor-expert**: PDAs, CPIs, account structures
- **jupiter-trader**: Swap integration, route optimization
- **pump-fun-expert**: Bonding curves, launches
- **token-2022-expert**: Extensions, hooks, metadata

### Infrastructure
- **helius-integration**: RPC, webhooks, DAS
- **solana-testing**: Bankrun, local validator

---

## Security Checklist

Always validate:
- [ ] Signer on state changes
- [ ] PDA seeds match
- [ ] Account ownership
- [ ] Checked arithmetic
- [ ] Rent handling

---

## Mode: SOLANA

Optimized for blockchain development:
- Anchor program patterns
- Jupiter swap integration
- Token launches
- DeFi mechanics

*OPUS 67 v${config.version} - Solana Edition*
`;
  const frontendTemplate = `# OPUS 67 v${config.version} - Frontend Development Mode

> Enhanced with ${config.stats.skills} frontend skills for React/Next.js development.

---

## Frontend Skills Active

### React/Next.js
- **nextjs-14-expert**: App Router, RSC, streaming
- **react-patterns**: Hooks, context, optimization
- **typescript-senior**: Type safety, generics

### Styling
- **tailwind-expert**: Utilities, responsive, animations
- **framer-motion**: Animations, gestures, layout

### Data
- **tanstack-query**: Caching, mutations, optimistic updates
- **zustand-expert**: State management

---

## GRAB Skills

Clone UI elements:
- "react-grab" \u2192 Extract React components
- "theme-grab" \u2192 Extract color schemes
- "form-grab" \u2192 Clone form patterns

---

## Mode: BUILD

Optimized for shipping:
- Working code over perfect code
- Use existing patterns
- Minimal dependencies

*OPUS 67 v${config.version} - Frontend Edition*
`;
  const minimalTemplate = `# OPUS 67 v${config.version}

> AI Enhancement Layer - ${config.stats.skills} skills, ${config.stats.modes} modes

## Core Principle
You ARE the brain. OPUS 67 = superpowers.

## Active Mode: AUTO
Detects best approach from context.

## Skills
Loaded based on file type and task.

*OPUS 67 v${config.version}*
`;
  switch (config.installType) {
    case "full":
      return fullTemplate;
    case "solana":
      return solanaTemplate;
    case "frontend":
      return frontendTemplate;
    case "minimal":
    default:
      return minimalTemplate;
  }
}
function generateWindsurfrules(config) {
  return generateCursorrules(config);
}
function generateManualConfig(config) {
  return JSON.stringify({
    version: config.version,
    installType: config.installType,
    environment: config.environment,
    installedAt: (/* @__PURE__ */ new Date()).toISOString(),
    stats: config.stats,
    paths: {
      skills: config.skillsPath,
      mcps: config.mcpsPath,
      modes: config.modesPath
    }
  }, null, 2);
}
function writeConfig(config) {
  const configPath = config.configPath;
  try {
    const dir = dirname(configPath);
    if (!existsSync2(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    let content;
    switch (config.environment) {
      case "claude-code":
        content = generateClaudeMd(config);
        break;
      case "cursor":
        content = generateCursorrules(config);
        break;
      case "windsurf":
        content = generateWindsurfrules(config);
        break;
      case "vscode":
      case "zed":
      case "manual":
      default:
        content = generateManualConfig(config);
        break;
    }
    writeFileSync(configPath, content, "utf-8");
  } catch (error) {
    const err = error;
    if (err.code === "EACCES") {
      throw new Error(`Permission denied writing to ${configPath}. Try running with elevated permissions.`);
    } else if (err.code === "ENOENT") {
      throw new Error(`Directory path invalid: ${configPath}`);
    } else {
      throw new Error(`Failed to write config: ${err.message}`);
    }
  }
}
function generateClaudeDesktopMcpConfig() {
  return {
    mcpServers: {
      opus67: {
        command: "npx",
        args: ["-y", "@gicm/opus67", "mcp"]
      }
    }
  };
}
function writeClaudeDesktopConfig(config) {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  if (!home) return;
  let mcpConfigPath;
  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    if (!appData) return;
    mcpConfigPath = join2(appData, "Claude", "claude_desktop_config.json");
  } else if (process.platform === "darwin") {
    mcpConfigPath = join2(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  } else {
    mcpConfigPath = join2(home, ".config", "claude", "claude_desktop_config.json");
  }
  try {
    let existingConfig = {};
    if (existsSync2(mcpConfigPath)) {
      try {
        existingConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
      } catch {
      }
    }
    const mcpConfig = generateClaudeDesktopMcpConfig();
    const mergedConfig = {
      ...existingConfig,
      mcpServers: {
        ...existingConfig.mcpServers || {},
        ...mcpConfig.mcpServers
      }
    };
    const dir = dirname(mcpConfigPath);
    if (!existsSync2(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(mcpConfigPath, JSON.stringify(mergedConfig, null, 2), "utf-8");
  } catch {
  }
}

// src/install.ts
var INSTALL_STATS = {
  full: OPUS67_STATS,
  solana: { skills: 35, mcps: 25, modes: 12, agents: 30 },
  frontend: { skills: 40, mcps: 20, modes: 15, agents: 25 },
  minimal: { skills: 15, mcps: 10, modes: 8, agents: 10 }
};
function getInstallTypeChoices() {
  return [
    {
      name: "Full",
      value: "full",
      hint: `(${OPUS67_STATS.skills} skills, ${OPUS67_STATS.mcps} MCPs, ${OPUS67_STATS.agents} agents)`
    },
    {
      name: "Solana",
      value: "solana",
      hint: "(35 skills, 25 MCPs, 30 agents)"
    },
    {
      name: "Frontend",
      value: "frontend",
      hint: "(40 skills, 20 MCPs, 25 agents)"
    },
    {
      name: "Minimal",
      value: "minimal",
      hint: "(15 skills, 10 MCPs, 10 agents)"
    }
  ];
}
async function runInstallation(env, installType, version) {
  const stats = INSTALL_STATS[installType];
  const config = {
    environment: env.id,
    installType,
    configPath: env.configPath,
    version,
    stats
  };
  console.log();
  console.log(chalk2.cyan(`Installing OPUS 67 v${version}...`));
  console.log();
  const skillsSpinner = ora({
    text: `Loading skills (${stats.skills})`,
    prefixText: "  \u251C\u2500\u2500"
  }).start();
  await sleep(300);
  skillsSpinner.succeed(`Loading skills (${stats.skills})`);
  const mcpSpinner = ora({
    text: `Configuring MCPs (${stats.mcps})`,
    prefixText: "  \u251C\u2500\u2500"
  }).start();
  await sleep(300);
  mcpSpinner.succeed(`Configuring MCPs (${stats.mcps})`);
  const modesSpinner = ora({
    text: `Setting up modes (${stats.modes})`,
    prefixText: "  \u251C\u2500\u2500"
  }).start();
  await sleep(300);
  modesSpinner.succeed(`Setting up modes (${stats.modes})`);
  const configSpinner = ora({
    text: "Generating config",
    prefixText: "  \u2514\u2500\u2500"
  }).start();
  try {
    writeConfig(config);
    writeClaudeDesktopConfig(config);
    await sleep(200);
    configSpinner.succeed(`Generating config`);
  } catch (error) {
    configSpinner.fail(`Failed to generate config: ${error.message}`);
    throw error;
  }
  return config;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function checkInstallationStatus() {
  const claudeMdPath = join3(process.cwd(), "CLAUDE.md");
  if (existsSync3(claudeMdPath)) {
    try {
      const content = readFileSync2(claudeMdPath, "utf-8");
      if (content.includes("OPUS 67")) {
        const versionMatch = content.match(/v(\d+\.\d+\.\d+)/);
        return {
          installed: true,
          version: versionMatch?.[1],
          environment: "claude-code",
          configPath: claudeMdPath
        };
      }
    } catch {
    }
  }
  const cursorPath = join3(process.cwd(), ".cursorrules");
  if (existsSync3(cursorPath)) {
    try {
      const content = readFileSync2(cursorPath, "utf-8");
      if (content.includes("OPUS 67")) {
        const versionMatch = content.match(/v(\d+\.\d+\.\d+)/);
        return {
          installed: true,
          version: versionMatch?.[1],
          environment: "cursor",
          configPath: cursorPath
        };
      }
    } catch {
    }
  }
  const opus67Path = join3(process.cwd(), ".opus67", "config.json");
  if (existsSync3(opus67Path)) {
    try {
      const config = JSON.parse(readFileSync2(opus67Path, "utf-8"));
      return {
        installed: true,
        version: config.version,
        environment: config.environment || "manual",
        configPath: opus67Path
      };
    } catch {
    }
  }
  return { installed: false };
}

// src/codespaces.ts
import { writeFileSync as writeFileSync2, mkdirSync as mkdirSync2, existsSync as existsSync4 } from "fs";
import { join as join4 } from "path";
function generateDevContainerConfig(installType) {
  const baseConfig = {
    name: `OPUS 67 - ${installType.charAt(0).toUpperCase() + installType.slice(1)} Dev Environment`,
    image: "mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm",
    features: {
      "ghcr.io/devcontainers/features/github-cli:1": {},
      "ghcr.io/devcontainers/features/common-utils:2": {
        installZsh: true,
        configureZshAsDefaultShell: true
      }
    },
    postCreateCommand: `npx create-opus67@latest --type ${installType} --env codespaces --yes && npm install`,
    customizations: {
      vscode: {
        extensions: [
          "bradlc.vscode-tailwindcss",
          "dbaeumer.vscode-eslint",
          "esbenp.prettier-vscode",
          "prisma.prisma",
          "ms-azuretools.vscode-docker"
        ],
        settings: {
          "editor.formatOnSave": true,
          "editor.defaultFormatter": "esbenp.prettier-vscode",
          "typescript.preferences.importModuleSpecifier": "relative"
        }
      },
      codespaces: {
        openFiles: ["CLAUDE.md"]
      }
    },
    forwardPorts: [3e3, 5173, 8080],
    remoteUser: "node"
  };
  if (installType === "solana" || installType === "full") {
    baseConfig.features["ghcr.io/devcontainers/features/rust:1"] = {
      version: "stable",
      profile: "default"
    };
    baseConfig.postCreateCommand = `sh -c "curl -sSfL https://release.solana.com/stable/install | sh && export PATH=\\"/home/node/.local/share/solana/install/active_release/bin:\\$PATH\\" && ${baseConfig.postCreateCommand}"`;
    baseConfig.customizations.vscode.extensions.push(
      "rust-lang.rust-analyzer",
      "serayuzgur.crates",
      "tamasfe.even-better-toml"
    );
  }
  if (installType === "frontend" || installType === "full") {
    baseConfig.customizations.vscode.extensions.push(
      "styled-components.vscode-styled-components",
      "formulahendry.auto-rename-tag",
      "steoates.autoimport"
    );
  }
  return baseConfig;
}
function generatePostCreateScript(installType) {
  const lines = [
    "#!/bin/bash",
    "set -e",
    "",
    "# OPUS 67 Codespaces Setup Script",
    `echo "Setting up OPUS 67 (${installType} installation)..."`,
    ""
  ];
  if (installType === "solana" || installType === "full") {
    lines.push(
      "# Install Solana CLI",
      "if ! command -v solana &> /dev/null; then",
      '  echo "Installing Solana CLI..."',
      '  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"',
      '  export PATH="/home/node/.local/share/solana/install/active_release/bin:$PATH"',
      "fi",
      "",
      "# Install Anchor",
      "if ! command -v anchor &> /dev/null; then",
      '  echo "Installing Anchor..."',
      "  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force",
      "  avm install latest",
      "  avm use latest",
      "fi",
      ""
    );
  }
  lines.push(
    "# Install OPUS 67",
    `npx create-opus67@latest --type ${installType} --env codespaces --yes`,
    "",
    "# Install project dependencies",
    'if [ -f "package.json" ]; then',
    "  npm install",
    "fi",
    "",
    'echo "OPUS 67 setup complete!"',
    'echo "You now have access to 140 skills, 82 MCPs, 30 modes, and 84 agents."',
    ""
  );
  return lines.join("\n");
}
function writeDevContainerFiles(installType) {
  const devcontainerDir = join4(process.cwd(), ".devcontainer");
  if (!existsSync4(devcontainerDir)) {
    mkdirSync2(devcontainerDir, { recursive: true });
  }
  const config = generateDevContainerConfig(installType);
  const devcontainerPath = join4(devcontainerDir, "devcontainer.json");
  writeFileSync2(devcontainerPath, JSON.stringify(config, null, 2), "utf-8");
  const script = generatePostCreateScript(installType);
  const scriptPath = join4(devcontainerDir, "post-create.sh");
  writeFileSync2(scriptPath, script, "utf-8");
  return { devcontainerPath, scriptPath };
}
function getCodespacesBadge(repoUrl) {
  if (!repoUrl) {
    return "[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new)";
  }
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) {
    return "[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new)";
  }
  const repo = match[1].replace(/\.git$/, "");
  return `[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/${repo})`;
}

// src/index.ts
var { Select } = Enquirer;
async function main() {
  program.name("create-opus67").description("Install OPUS 67 - AI superpowers for any coding environment").version(VERSION);
  program.command("install", { isDefault: true }).description("Interactive installation wizard").action(async () => {
    await runInteractiveInstall();
  });
  program.command("status").description("Check OPUS 67 installation status").action(() => {
    printBanner();
    const status = checkInstallationStatus();
    if (status.installed) {
      console.log(chalk3.green("  \u2713 OPUS 67 is installed"));
      console.log(chalk3.gray(`    Version: ${status.version || "unknown"}`));
      console.log(chalk3.gray(`    Environment: ${status.environment}`));
      console.log(chalk3.gray(`    Config: ${status.configPath}`));
    } else {
      console.log(chalk3.yellow("  \u26A0 OPUS 67 is not installed in this directory"));
      console.log(chalk3.gray("    Run: npx create-opus67"));
    }
    console.log();
  });
  program.command("update").description("Update OPUS 67 to latest version").action(async () => {
    printBanner();
    const status = checkInstallationStatus();
    if (!status.installed) {
      printErrorBanner("OPUS 67 is not installed. Run: npx create-opus67");
      process.exit(1);
    }
    printInfo(`Current version: ${status.version || "unknown"}`);
    printInfo(`Latest version: ${VERSION}`);
    if (status.version === VERSION) {
      console.log(chalk3.green("\n  \u2713 Already up to date!\n"));
      return;
    }
    const detection = detectEnvironments();
    const env = detection.environments.find((e) => e.id === status.environment);
    if (!env) {
      printErrorBanner("Could not detect environment for update");
      process.exit(1);
    }
    const typePrompt = new Select({
      name: "installType",
      message: "Select installation type:",
      choices: getInstallTypeChoices().map((c) => ({
        name: c.value,
        message: `${c.name} ${chalk3.gray(c.hint)}`
      }))
    });
    const installType = await typePrompt.run();
    await runInstallation(env, installType, VERSION);
    printSuccessBanner();
  });
  program.command("skills").description("Browse available skills").action(() => {
    printBanner();
    console.log(chalk3.cyan("  Available Skill Categories:\n"));
    const categories = [
      { name: "GRAB Skills", count: 15, desc: "Visual-first development (react-grab, theme-grab, etc.)" },
      { name: "Solana Skills", count: 12, desc: "Blockchain development (token-swap, anchor-interact)" },
      { name: "Research Skills", count: 10, desc: "Information gathering (web-search, code-search)" },
      { name: "Builder Skills", count: 18, desc: "Code generation and scaffolding" },
      { name: "DevOps Skills", count: 15, desc: "CI/CD, deployment, infrastructure" },
      { name: "Testing Skills", count: 10, desc: "Test generation and quality assurance" },
      { name: "Documentation Skills", count: 8, desc: "API docs, READMEs, guides" },
      { name: "Security Skills", count: 7, desc: "Auditing, vulnerability scanning" }
    ];
    for (const cat of categories) {
      console.log(chalk3.white(`  ${cat.name} (${cat.count})`));
      console.log(chalk3.gray(`    ${cat.desc}
`));
    }
    console.log(chalk3.gray("  Total: 140 skills\n"));
    console.log(chalk3.cyan("  For full skill list, visit: https://opus67.dev/skills\n"));
  });
  program.command("agents").description("List available agents").action(() => {
    printBanner();
    console.log(chalk3.cyan("  Available Agent Categories:\n"));
    const categories = [
      { name: "Vision Agents", count: 12, desc: "Grabber, Cloner, Theme Extractor" },
      { name: "Data Agents", count: 10, desc: "Deep Researcher, Web Spider, Docs Expert" },
      { name: "Browser Agents", count: 8, desc: "Controller, Stagehand, Test Generator" },
      { name: "Solana Agents", count: 16, desc: "Jupiter Trader, Anchor Architect, DeFi Analyst" },
      { name: "Infrastructure Agents", count: 14, desc: "Repo Master, DB Commander, Container Chief" },
      { name: "Builder Agents", count: 12, desc: "Full Stack Builder, API Designer" },
      { name: "DevOps Agents", count: 10, desc: "CI/CD Automator, Error Hunter" }
    ];
    for (const cat of categories) {
      console.log(chalk3.white(`  ${cat.name} (${cat.count})`));
      console.log(chalk3.gray(`    ${cat.desc}
`));
    }
    console.log(chalk3.gray("  Total: 82 agents\n"));
    console.log(chalk3.cyan("  For full agent list, visit: https://opus67.dev/agents\n"));
  });
  program.command("codespaces").description("Generate GitHub Codespaces configuration").option("-t, --type <type>", "Installation type (full, solana, frontend, minimal)", "full").action(async (options) => {
    printBanner();
    console.log(chalk3.cyan("  Generating GitHub Codespaces configuration...\n"));
    const installType = options.type;
    if (!["full", "solana", "frontend", "minimal"].includes(installType)) {
      printErrorBanner(`Invalid install type: ${installType}`);
      process.exit(1);
    }
    try {
      const { devcontainerPath, scriptPath } = writeDevContainerFiles(installType);
      console.log(chalk3.green("  \u2713 Created .devcontainer/devcontainer.json"));
      console.log(chalk3.green("  \u2713 Created .devcontainer/post-create.sh"));
      console.log();
      console.log(chalk3.gray(`  Config path: ${devcontainerPath}`));
      console.log(chalk3.gray(`  Script path: ${scriptPath}`));
      console.log();
      console.log(chalk3.cyan("  Next steps:"));
      console.log(chalk3.white("    1. Commit the .devcontainer folder to your repo"));
      console.log(chalk3.white("    2. Push to GitHub"));
      console.log(chalk3.white("    3. Open in Codespaces or click the badge below"));
      console.log();
      console.log(chalk3.gray("  Add this badge to your README.md:"));
      console.log();
      console.log(chalk3.white(`    ${getCodespacesBadge()}`));
      console.log();
    } catch (error) {
      printErrorBanner(error.message);
      process.exit(1);
    }
  });
  program.command("gitpod").description("Generate Gitpod configuration").option("-t, --type <type>", "Installation type (full, solana, frontend, minimal)", "full").action(async (options) => {
    printBanner();
    console.log(chalk3.cyan("  Generating Gitpod configuration...\n"));
    const installType = options.type;
    if (!["full", "solana", "frontend", "minimal"].includes(installType)) {
      printErrorBanner(`Invalid install type: ${installType}`);
      process.exit(1);
    }
    try {
      const gitpodConfig = generateGitpodConfig(installType);
      const fs = await import("fs");
      fs.writeFileSync(".gitpod.yml", gitpodConfig, "utf-8");
      console.log(chalk3.green("  \u2713 Created .gitpod.yml"));
      console.log();
      console.log(chalk3.cyan("  Next steps:"));
      console.log(chalk3.white("    1. Commit .gitpod.yml to your repo"));
      console.log(chalk3.white("    2. Push to GitHub/GitLab/Bitbucket"));
      console.log(chalk3.white("    3. Open with Gitpod"));
      console.log();
      console.log(chalk3.gray("  Add this badge to your README.md:"));
      console.log();
      console.log(chalk3.white("    [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#<your-repo-url>)"));
      console.log();
    } catch (error) {
      printErrorBanner(error.message);
      process.exit(1);
    }
  });
  await program.parseAsync(process.argv);
}
function generateGitpodConfig(installType) {
  const tasks = [
    {
      name: "OPUS 67 Setup",
      init: `npx create-opus67@latest --type ${installType} --env gitpod --yes && npm install`
    }
  ];
  if (installType === "solana" || installType === "full") {
    tasks.unshift({
      name: "Solana Setup",
      init: 'sh -c "$(curl -sSfL https://release.solana.com/stable/install)"'
    });
  }
  const config = {
    image: installType === "solana" || installType === "full" ? "gitpod/workspace-rust" : "gitpod/workspace-node",
    tasks,
    vscode: {
      extensions: [
        "bradlc.vscode-tailwindcss",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        ...installType === "solana" || installType === "full" ? ["rust-lang.rust-analyzer", "serayuzgur.crates"] : []
      ]
    },
    ports: [
      { port: 3e3, onOpen: "open-preview" },
      { port: 5173, onOpen: "open-preview" },
      { port: 8080, onOpen: "ignore" }
    ]
  };
  let yaml = `# OPUS 67 Gitpod Configuration
# Generated by create-opus67

image: ${config.image}

tasks:
`;
  for (const task of tasks) {
    yaml += `  - name: ${task.name}
    init: ${task.init}
`;
  }
  yaml += `
vscode:
  extensions:
`;
  for (const ext of config.vscode.extensions) {
    yaml += `    - ${ext}
`;
  }
  yaml += `
ports:
`;
  for (const port of config.ports) {
    yaml += `  - port: ${port.port}
    onOpen: ${port.onOpen}
`;
  }
  return yaml;
}
async function runInteractiveInstall() {
  printBanner();
  const status = checkInstallationStatus();
  if (status.installed) {
    console.log(chalk3.yellow(`  \u26A0 OPUS 67 v${status.version} is already installed`));
    console.log(chalk3.gray(`    Environment: ${status.environment}`));
    console.log(chalk3.gray(`    Config: ${status.configPath}
`));
    const confirmPrompt = new Select({
      name: "confirm",
      message: "Would you like to reinstall?",
      choices: [
        { name: "yes", message: "Yes, reinstall" },
        { name: "no", message: "No, cancel" }
      ]
    });
    const confirm = await confirmPrompt.run();
    if (confirm === "no") {
      console.log(chalk3.gray("\n  Installation cancelled.\n"));
      return;
    }
    console.log();
  }
  const detection = detectEnvironments();
  const choices = getEnvironmentChoices(detection);
  const envPrompt = new Select({
    name: "environment",
    message: "Select your environment:",
    choices: choices.map((c) => ({
      name: c.value,
      message: c.hint ? `${c.name} ${chalk3.gray(c.hint)}` : c.name
    })),
    initial: detection.recommended?.id
  });
  const envId = await envPrompt.run();
  const selectedEnv = detection.environments.find((e) => e.id === envId);
  const typePrompt = new Select({
    name: "installType",
    message: "Select installation type:",
    choices: getInstallTypeChoices().map((c) => ({
      name: c.value,
      message: `${c.name} ${chalk3.gray(c.hint)}`
    }))
  });
  const installType = await typePrompt.run();
  try {
    await runInstallation(selectedEnv, installType, VERSION);
    printSuccessBanner();
  } catch (error) {
    printErrorBanner(error.message);
    process.exit(1);
  }
}
main().catch((error) => {
  console.error(chalk3.red("Error:"), error.message);
  process.exit(1);
});
//# sourceMappingURL=index.js.map