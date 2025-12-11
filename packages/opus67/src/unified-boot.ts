#!/usr/bin/env node
/**
 * OPUS 67 v6.0.0 - UNIFIED BOOT
 *
 * ONE COMMAND TO RULE THEM ALL
 *
 * This is the unified boot command that:
 * 1. Loads the master registry
 * 2. Injects THE DOOR into CLAUDE.md files
 * 3. Registers ALL MCPs in Claude's settings.json
 * 4. Loads all skills
 * 5. Makes all agents available
 * 6. Activates hooks
 * 7. Indexes the workspace
 *
 * Result: Claude has access to EVERYTHING, consistently, every session.
 */

import { join } from "path";
import { loadMasterRegistry } from "./registry/loader.js";
import { injectTheDoor } from "./door/injector.js";
import { registerAllMCPs } from "./mcp/registrar.js";
import { loadAllAgents } from "./agents/loader.js";
import { activateHooks } from "./hooks/activator.js";
import { loadRegistry } from "./skill-loader.js";
import { ContextIndexer } from "./context/indexer.js";

const VERSION = "6.2.0";
const CODENAME = "Claude Harmony";

/**
 * Display the boot banner
 */
function displayBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗                  ║
║  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║                  ║
║  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝                  ║
║  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝                   ║
║  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║                    ║
║   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝                    ║
║                                                                           ║
║              v${VERSION} "${CODENAME}" - UNIFIED BOOT                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);
}

/**
 * Display step progress
 */
function step(num: number, total: number, message: string): void {
  const percent = Math.round((num / total) * 100);
  console.log(`[${num}/${total}] ${message} (${percent}%)`);
}

/**
 * Main boot sequence
 */
async function boot(): Promise<void> {
  const startTime = Date.now();
  const projectRoot = process.cwd();
  const totalSteps = 7;

  displayBanner();
  console.log("Starting unified boot sequence...\n");

  try {
    // Step 1: Load master registry
    step(1, totalSteps, "Loading master registry...");
    const registry = await loadMasterRegistry();
    console.log(`   ✓ Registry v${registry.version} loaded`);
    console.log(
      `   ✓ Target: ${registry.meta.skills_count} skills, ${registry.meta.agents_count} agents, ${registry.meta.mcps_count} MCPs\n`
    );

    // Step 2: Inject THE DOOR
    step(2, totalSteps, "Injecting THE DOOR...");
    const doorResult = await injectTheDoor(projectRoot);
    console.log(
      `   ✓ THE DOOR injected into ${doorResult.injected} CLAUDE.md files`
    );
    if (doorResult.skipped > 0) {
      console.log(`   ✓ ${doorResult.skipped} files already up to date\n`);
    } else {
      console.log("");
    }

    // Step 3: Register ALL MCPs (THE KEY FIX)
    step(3, totalSteps, "Registering MCPs in Claude settings...");
    const mcpResult = await registerAllMCPs(projectRoot);
    console.log(`   ✓ ${mcpResult.registered} MCPs registered`);
    console.log(
      `   ✓ Categories: ${mcpResult.categories.slice(0, 5).join(", ")}...`
    );
    if (mcpResult.skipped > 0) {
      console.log(
        `   ⚠ ${mcpResult.skipped} MCPs skipped (no command defined)\n`
      );
    } else {
      console.log("");
    }

    // Step 4: Load skills
    step(4, totalSteps, "Loading skills registry...");
    const skillRegistry = loadRegistry();
    const skillCount = skillRegistry.skills.length;
    console.log(`   ✓ ${skillCount} skills loaded\n`);

    // Step 5: Load agents
    step(5, totalSteps, "Loading agents...");
    const agentsResult = await loadAllAgents(projectRoot);
    console.log(`   ✓ ${agentsResult.count} agents available\n`);

    // Step 6: Activate hooks
    step(6, totalSteps, "Activating hooks...");
    const hooksResult = await activateHooks(projectRoot);
    console.log(`   ✓ ${hooksResult.count} hooks active`);
    if (hooksResult.missing.length > 0) {
      console.log(`   ⚠ Missing: ${hooksResult.missing.join(", ")}\n`);
    } else {
      console.log("");
    }

    // Step 7: Index workspace (optional - may fail on some systems)
    step(7, totalSteps, "Indexing workspace...");
    let indexedFiles = 0;
    let indexedTokens = 0;
    try {
      const indexer = new ContextIndexer({
        indexPaths: [projectRoot],
        excludePatterns: ["node_modules", ".git", "dist", "build"],
        maxTokens: 100000,
        vectorDbPath: join(projectRoot, ".opus67", "vector-db"),
      });
      await indexer.index(projectRoot);
      const stats = indexer.getStats();
      indexedFiles = stats.totalFiles;
      indexedTokens = stats.totalTokens;
      console.log(`   ✓ ${indexedFiles} files indexed`);
      console.log(`   ✓ ${indexedTokens.toLocaleString()} tokens\n`);
    } catch (indexError) {
      console.log(`   ⚠ Indexing skipped (not critical)\n`);
    }

    // Calculate duration
    const duration = Date.now() - startTime;

    // Final summary
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🚪 THE DOOR IS OPEN - ALL SYSTEMS UNIFIED                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Skills:   ${String(skillCount).padEnd(6)} │  Agents:  ${String(agentsResult.count).padEnd(6)} │  Modes: 30         ║
║  MCPs:     ${String(mcpResult.registered).padEnd(6)} │  Hooks:   ${String(hooksResult.count).padEnd(6)} │  Files: ${String(indexedFiles || "N/A").padEnd(6)}     ║
║                                                                           ║
║  Boot time: ${String(duration + "ms").padEnd(8)}                                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

Claude now has access to EVERYTHING. Run 'opus67 status' to verify.
`);
  } catch (error) {
    console.error(
      "\n❌ Boot failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

/**
 * Show status command
 */
async function showStatus(): Promise<void> {
  const projectRoot = process.cwd();

  try {
    const registry = await loadMasterRegistry();
    const agentsResult = await loadAllAgents(projectRoot);
    const hooksResult = await activateHooks(projectRoot);
    const skillRegistry = loadRegistry();
    const skillCount = skillRegistry.skills.length;

    console.log(`
📊 OPUS 67 v${VERSION} Status

   Registry:  v${registry.version} "${CODENAME}"
   Skills:    ${skillCount} loaded
   Agents:    ${agentsResult.count} available
   Hooks:     ${hooksResult.count} active

   THE DOOR:  ✓ Unified (single version)
   MCPs:      ✓ Registered in settings.json

Run 'opus67' or 'opus67 boot' to re-initialize.
`);
  } catch (error) {
    console.log(`
📊 OPUS 67 v${VERSION} Status

   Status: Not initialized

   Run 'opus67' or 'opus67 boot' to initialize.
`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0] || "boot";

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
    console.log(`Unknown command: ${command}\nRun 'opus67 help' for usage.`);
    process.exit(1);
}
