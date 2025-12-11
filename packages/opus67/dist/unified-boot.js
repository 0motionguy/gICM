#!/usr/bin/env node
import { loadAllAgents } from './chunk-4LWUFEVO.js';
import { injectTheDoor } from './chunk-UR5S6OCC.js';
import { activateHooks } from './chunk-IHBBUDGB.js';
import { registerAllMCPs } from './chunk-AK5U4DMB.js';
import { loadMasterRegistry } from './chunk-WYL3BHNW.js';
import { ContextIndexer } from './chunk-XVOLIGJS.js';
import { loadRegistry } from './chunk-L3KXA3WY.js';
import './chunk-YINZDDDM.js';
import { join } from 'path';

var VERSION = "6.2.0";
var CODENAME = "Claude Harmony";
function displayBanner() {
  console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                                           \u2551
\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557                  \u2551
\u2551  \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551                  \u2551
\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2554\u255D                  \u2551
\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2551   \u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557   \u2588\u2588\u2554\u255D                   \u2551
\u2551  \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551     \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551    \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551                    \u2551
\u2551   \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D      \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D     \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D                    \u2551
\u2551                                                                           \u2551
\u2551              v${VERSION} "${CODENAME}" - UNIFIED BOOT                           \u2551
\u2551                                                                           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`);
}
function step(num, total, message) {
  const percent = Math.round(num / total * 100);
  console.log(`[${num}/${total}] ${message} (${percent}%)`);
}
async function boot() {
  const startTime = Date.now();
  const projectRoot = process.cwd();
  const totalSteps = 7;
  displayBanner();
  console.log("Starting unified boot sequence...\n");
  try {
    step(1, totalSteps, "Loading master registry...");
    const registry = await loadMasterRegistry();
    console.log(`   \u2713 Registry v${registry.version} loaded`);
    console.log(
      `   \u2713 Target: ${registry.meta.skills_count} skills, ${registry.meta.agents_count} agents, ${registry.meta.mcps_count} MCPs
`
    );
    step(2, totalSteps, "Injecting THE DOOR...");
    const doorResult = await injectTheDoor(projectRoot);
    console.log(
      `   \u2713 THE DOOR injected into ${doorResult.injected} CLAUDE.md files`
    );
    if (doorResult.skipped > 0) {
      console.log(`   \u2713 ${doorResult.skipped} files already up to date
`);
    } else {
      console.log("");
    }
    step(3, totalSteps, "Registering MCPs in Claude settings...");
    const mcpResult = await registerAllMCPs(projectRoot);
    console.log(`   \u2713 ${mcpResult.registered} MCPs registered`);
    console.log(
      `   \u2713 Categories: ${mcpResult.categories.slice(0, 5).join(", ")}...`
    );
    if (mcpResult.skipped > 0) {
      console.log(
        `   \u26A0 ${mcpResult.skipped} MCPs skipped (no command defined)
`
      );
    } else {
      console.log("");
    }
    step(4, totalSteps, "Loading skills registry...");
    const skillRegistry = loadRegistry();
    const skillCount = skillRegistry.skills.length;
    console.log(`   \u2713 ${skillCount} skills loaded
`);
    step(5, totalSteps, "Loading agents...");
    const agentsResult = await loadAllAgents(projectRoot);
    console.log(`   \u2713 ${agentsResult.count} agents available
`);
    step(6, totalSteps, "Activating hooks...");
    const hooksResult = await activateHooks(projectRoot);
    console.log(`   \u2713 ${hooksResult.count} hooks active`);
    if (hooksResult.missing.length > 0) {
      console.log(`   \u26A0 Missing: ${hooksResult.missing.join(", ")}
`);
    } else {
      console.log("");
    }
    step(7, totalSteps, "Indexing workspace...");
    let indexedFiles = 0;
    let indexedTokens = 0;
    try {
      const indexer = new ContextIndexer({
        indexPaths: [projectRoot],
        excludePatterns: ["node_modules", ".git", "dist", "build"],
        maxTokens: 1e5,
        vectorDbPath: join(projectRoot, ".opus67", "vector-db")
      });
      await indexer.index(projectRoot);
      const stats = indexer.getStats();
      indexedFiles = stats.totalFiles;
      indexedTokens = stats.totalTokens;
      console.log(`   \u2713 ${indexedFiles} files indexed`);
      console.log(`   \u2713 ${indexedTokens.toLocaleString()} tokens
`);
    } catch (indexError) {
      console.log(`   \u26A0 Indexing skipped (not critical)
`);
    }
    const duration = Date.now() - startTime;
    console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  \u{1F6AA} THE DOOR IS OPEN - ALL SYSTEMS UNIFIED                                \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551  Skills:   ${String(skillCount).padEnd(6)} \u2502  Agents:  ${String(agentsResult.count).padEnd(6)} \u2502  Modes: 30         \u2551
\u2551  MCPs:     ${String(mcpResult.registered).padEnd(6)} \u2502  Hooks:   ${String(hooksResult.count).padEnd(6)} \u2502  Files: ${String(indexedFiles || "N/A").padEnd(6)}     \u2551
\u2551                                                                           \u2551
\u2551  Boot time: ${String(duration + "ms").padEnd(8)}                                              \u2551
\u2551                                                                           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

Claude now has access to EVERYTHING. Run 'opus67 status' to verify.
`);
  } catch (error) {
    console.error(
      "\n\u274C Boot failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
async function showStatus() {
  const projectRoot = process.cwd();
  try {
    const registry = await loadMasterRegistry();
    const agentsResult = await loadAllAgents(projectRoot);
    const hooksResult = await activateHooks(projectRoot);
    const skillRegistry = loadRegistry();
    const skillCount = skillRegistry.skills.length;
    console.log(`
\u{1F4CA} OPUS 67 v${VERSION} Status

   Registry:  v${registry.version} "${CODENAME}"
   Skills:    ${skillCount} loaded
   Agents:    ${agentsResult.count} available
   Hooks:     ${hooksResult.count} active

   THE DOOR:  \u2713 Unified (single version)
   MCPs:      \u2713 Registered in settings.json

Run 'opus67' or 'opus67 boot' to re-initialize.
`);
  } catch (error) {
    console.log(`
\u{1F4CA} OPUS 67 v${VERSION} Status

   Status: Not initialized

   Run 'opus67' or 'opus67 boot' to initialize.
`);
  }
}
var args = process.argv.slice(2);
var command = args[0] || "boot";
switch (command) {
  case "boot":
  case "":
    boot();
    break;
  case "status":
    showStatus();
    break;
  case "help":
  case "--help":
  case "-h":
    console.log(`
OPUS 67 v${VERSION} - Unified AI Runtime

Usage: opus67 [command]

Commands:
  boot     Full boot sequence (default)
  status   Show current status
  help     Show this help

Examples:
  opus67           # Full boot
  opus67 boot      # Full boot (explicit)
  opus67 status    # Show status
`);
    break;
  case "--version":
  case "-v":
    console.log(`opus67 v${VERSION}`);
    break;
  default:
    console.log(`Unknown command: ${command}
Run 'opus67 help' for usage.`);
    process.exit(1);
}
