#!/usr/bin/env node
/**
 * OPUS 67 — One-Command Setup
 *
 * `npx @gicm/opus67` or `opus67 init`
 *
 * What it does:
 * 1. Adds OPUS 67 MCP server to ~/.claude/settings.json
 * 2. Copies the auto-detect hook to ~/.claude/hooks/
 * 3. Verifies the setup works
 *
 * That's it. No brain server, no registry loading, no workspace indexing.
 * Claude Code's MCP system does the rest.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
} from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const VERSION = "7.0.0";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// CORE: Patch Claude Code settings.json
// ============================================================

function getClaudeSettingsPath(): string {
  return join(homedir(), ".claude", "settings.json");
}

function getClaudeHooksDir(): string {
  return join(homedir(), ".claude", "hooks");
}

function patchSettings(): { success: boolean; message: string } {
  const settingsPath = getClaudeSettingsPath();
  const claudeDir = dirname(settingsPath);

  // Ensure ~/.claude/ exists
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  // Read existing settings or create new
  let settings: Record<string, unknown> = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
    } catch {
      // Corrupted settings — back up and start fresh
      const backup = settingsPath + ".backup";
      copyFileSync(settingsPath, backup);
      settings = {};
    }
  }

  // Add MCP server config
  const mcpServers = (settings.mcpServers || {}) as Record<string, unknown>;

  // Find the opus67 package path (where this script is running from)
  const pkgRoot = join(__dirname, "..");
  const mcpServerPath = join(pkgRoot, "dist", "mcp-server.js");

  if (!existsSync(mcpServerPath)) {
    return {
      success: false,
      message: `MCP server not found at ${mcpServerPath}. Run from installed package.`,
    };
  }

  mcpServers["opus67"] = {
    command: "node",
    args: [mcpServerPath],
    env: {},
  };

  settings.mcpServers = mcpServers;

  // Write back
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  return { success: true, message: `MCP server registered in ${settingsPath}` };
}

// ============================================================
// CORE: Install auto-detect hook
// ============================================================

function installHook(): { success: boolean; message: string } {
  const hooksDir = getClaudeHooksDir();

  // Ensure hooks dir exists
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  // The hook content — self-contained, no dependencies
  const hookContent = `#!/usr/bin/env node
/**
 * OPUS 67 Auto-Detect Hook (installed by opus67 init)
 * Detects project type on session start, outputs skill suggestions to stdout.
 */
const { existsSync } = require("fs");
const { join } = require("path");
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

const indicators = {
  solana: ["Anchor.toml", "programs/"],
  react: ["src/App.tsx", "src/App.jsx"],
  nextjs: ["next.config.js", "next.config.ts", "next.config.mjs"],
  node: ["package.json", "src/index.ts"],
  python: ["requirements.txt", "pyproject.toml"],
  rust: ["Cargo.toml", "src/main.rs"],
  go: ["go.mod", "main.go"],
};

try {
  const types = [];
  for (const [type, files] of Object.entries(indicators)) {
    for (const f of files) {
      if (existsSync(join(projectDir, f))) { types.push(type); break; }
    }
  }
  if (types.length > 0) {
    console.log("OPUS 67: " + types.join(", ") + " project. Use opus67_detect_skills for domain expertise.");
  }
} catch (e) { /* silent */ }
`;

  const hookPath = join(hooksDir, "opus67-auto-detect.js");
  writeFileSync(hookPath, hookContent);

  // Also need to register the hook in settings.json
  const settingsPath = getClaudeSettingsPath();
  if (existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
      const hooks = (settings.hooks || {}) as Record<string, unknown[]>;

      // Add SessionStart hook if not already there
      const sessionHooks = (hooks.SessionStart || []) as Array<
        Record<string, unknown>
      >;
      const alreadyRegistered = sessionHooks.some(
        (h) =>
          typeof h === "object" &&
          h !== null &&
          String(h.command || "").includes("opus67-auto-detect")
      );

      if (!alreadyRegistered) {
        sessionHooks.push({
          type: "command",
          command: `node "${hookPath.replace(/\\/g, "/")}"`,
        });
        hooks.SessionStart = sessionHooks;
        settings.hooks = hooks;
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      }
    } catch {
      // Settings parse error — hook installed but not registered
    }
  }

  return { success: true, message: `Hook installed at ${hookPath}` };
}

// ============================================================
// VERIFY
// ============================================================

function verify(): { mcp: boolean; hook: boolean; skills: number } {
  const settingsPath = getClaudeSettingsPath();
  let mcp = false;
  let hook = false;
  let skills = 0;

  if (existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
      mcp = !!(settings.mcpServers as Record<string, unknown>)?.["opus67"];
      const hooks = settings.hooks?.SessionStart as
        | Array<Record<string, unknown>>
        | undefined;
      hook = !!hooks?.some((h: Record<string, unknown>) =>
        String(h.command || "").includes("opus67")
      );
    } catch {
      /* ignore */
    }
  }

  // Count skills
  const skillsDir = join(__dirname, "..", "skills", "definitions");
  if (existsSync(skillsDir)) {
    try {
      const { readdirSync } = await_free_readdir();
      skills = readdirSync(skillsDir).filter((f: string) =>
        f.endsWith(".md")
      ).length;
    } catch {
      /* ignore */
    }
  }

  return { mcp, hook, skills };
}

// Sync readdir helper (avoid top-level await issues)
function await_free_readdir() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("fs") as typeof import("fs");
}

// ============================================================
// CLI
// ============================================================

function showHelp(): void {
  console.log(`
OPUS 67 v${VERSION} — Skill Orchestration Engine for Claude Code

Usage:
  opus67 init       Set up OPUS 67 (patches settings.json + installs hook)
  opus67 status     Check if OPUS 67 is configured
  opus67 doctor     Verify installation
  opus67 help       Show this help

First time? Just run:
  npx @gicm/opus67 init
`);
}

async function init(): Promise<void> {
  console.log(`\nOPUS 67 v${VERSION} — Setting up...\n`);

  // Step 1: Patch settings.json
  const mcpResult = patchSettings();
  if (mcpResult.success) {
    console.log(`✅ MCP server registered`);
    console.log(`   ${mcpResult.message}`);
  } else {
    console.log(`❌ MCP registration failed: ${mcpResult.message}`);
    process.exit(1);
  }

  // Step 2: Install hook
  const hookResult = installHook();
  if (hookResult.success) {
    console.log(`✅ Auto-detect hook installed`);
    console.log(`   ${hookResult.message}`);
  } else {
    console.log(`⚠️  Hook installation failed: ${hookResult.message}`);
  }

  // Step 3: Verify
  const check = verify();
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  MCP Server:  ${check.mcp ? "✅ registered" : "❌ missing"}`);
  console.log(`  Auto-detect: ${check.hook ? "✅ installed" : "❌ missing"}`);
  console.log(`  Skills:      ${check.skills} definitions bundled`);
  console.log(`${"─".repeat(50)}`);

  if (check.mcp) {
    console.log(`
✅ OPUS 67 is ready. Restart Claude Code to activate.

What happens next:
  1. On session start, OPUS 67 detects your project type
  2. Use opus67_detect_skills to find relevant domain expertise
  3. Use opus67_get_skill to load full skill content
  4. 24 MCP tools available (skills, wiki, fleet, memory, analytics)

Available commands in Claude Code:
  /opus67-plan           GSD-style task planning
  /opus67-compile-wiki   Compile raw notes into wiki articles
  /opus67-create-skill   Build a skill from a successful run
`);
  } else {
    console.log(`\n❌ Setup incomplete. Run again or check permissions.`);
    process.exit(1);
  }
}

function status(): void {
  const check = verify();
  console.log(`
OPUS 67 v${VERSION} Status

  MCP Server:  ${check.mcp ? "✅ registered in settings.json" : "❌ not registered — run: opus67 init"}
  Auto-detect: ${check.hook ? "✅ hook installed" : "❌ not installed — run: opus67 init"}
  Skills:      ${check.skills} definitions bundled
`);
}

// Parse CLI args
const args = process.argv.slice(2);
const command = args[0] || "init"; // Default to init (not boot)

switch (command) {
  case "init":
  case "setup":
  case "":
    init();
    break;
  case "status":
  case "doctor":
    status();
    break;
  case "help":
  case "--help":
  case "-h":
    showHelp();
    break;
  case "--version":
  case "-v":
    console.log(`opus67 v${VERSION}`);
    break;
  default:
    console.log(`Unknown command: ${command}\nRun 'opus67 help' for usage.`);
    process.exit(1);
}
