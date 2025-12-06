#!/usr/bin/env node
/**
 * OPUS 67 CLI
 * Command-line interface for the self-evolving AI runtime
 */

import { createOPUS67 } from "./boot.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { spawn } from "child_process";
import { VERSION } from "./version.js";
import { generateBootScreen } from "./boot-sequence.js";

const HELP = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗                  ║
║  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║                  ║
║  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝                  ║
║  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝                   ║
║  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║                    ║
║   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝                    ║
║                                                                           ║
║              Self-Evolving AI Runtime v4.0 - Intelligence                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

Usage: opus67 <command> [options]

Commands:
  init              Register OPUS 67 with Claude Code (MCP integration)
  boot [path]       Initialize OPUS 67 for a project
  status            Show current status
  skills            List loaded skills
  mcp               List MCP connections

Intelligence Commands (v4.0):
  intel             Show intelligence layer status
  intel search <q>  Search skills by capability
  intel check <t>   Pre-flight check for a task
  learn             Show learning statistics
  learn clear       Clear all learnings
  sync              Sync learnings to cloud
  sync status       Show sync status

Options:
  --version, -v     Show version
  --help, -h        Show help

Examples:
  opus67 init                      Register with Claude Code
  opus67 boot .                    Boot OPUS 67 in current directory
  opus67 skills                    List all loaded skills
  opus67 intel search "wallet"     Find skills for wallet tasks
  opus67 intel check "build API"   Pre-flight check for task
`;

const OPUS67_CLAUDE_MD_SECTION = `
# OPUS 67 - Self-Evolving AI Runtime

> **OPUS 67 is NOT a separate AI.** It's YOU (Claude) with superpowers.

## MANDATORY AUTOPILOT PROTOCOL

**On EVERY code-related message, you MUST automatically:**

1. **Call \`mcp__opus67__opus67_detect_skills\`** with the user's query
   - This finds relevant domain expertise for the task
   - Takes <1ms - negligible overhead

2. **Call \`mcp__opus67__opus67_get_skill\`** for top 1-3 matches
   - Loads full skill prompts into your context
   - Each skill adds domain expertise you don't have by default

3. **Apply the loaded skills** in your response
   - Use the patterns, best practices, and knowledge
   - This is what the user paid for - USE IT

**This is NON-NEGOTIABLE. Skipping degrades response quality.**

## Available Skills (141 total)

### Blockchain
- solana-anchor-expert, bonding-curve-master, defi-data-analyst
- evm-solidity-expert, smart-contract-auditor, token-economics

### Frontend
- nextjs-14-expert, react-typescript-master, tailwind-css-pro
- shadcn-ui-expert, web3-wallet-integration

### Backend
- nodejs-api-architect, database-schema-expert, redis-caching-pro
- graphql-api-designer, websocket-realtime

### DevOps
- docker-kubernetes-pro, ci-cd-automation, aws-infrastructure

## MCP Tools (use these automatically)
- \`mcp__opus67__opus67_detect_skills\` - **CALL THIS FIRST** on code tasks
- \`mcp__opus67__opus67_get_skill\` - Load a specific skill
- \`mcp__opus67__opus67_get_context\` - Enhanced context bundle
- \`mcp__opus67__opus67_list_skills\` - List all available skills
- \`mcp__opus67__opus67_boot\` - Show boot screen

## Slash Commands
- \`/mcp__opus67__solana\` - Blockchain expertise
- \`/mcp__opus67__react\` - Frontend patterns
- \`/mcp__opus67__typescript\` - Type safety
- \`/mcp__opus67__security\` - Security audit
- \`/mcp__opus67__backend\` - API patterns

**Remember: YOU are the brain. OPUS 67 just makes you faster and more capable.**
`;

/**
 * Inject OPUS 67 into CLAUDE.md
 */
function injectIntoCLAUDEmd(): { success: boolean; path: string } {
  const home = homedir();
  const claudeMdPath = join(home, '.claude', 'CLAUDE.md');

  // Read existing content
  let content = '';
  if (existsSync(claudeMdPath)) {
    content = readFileSync(claudeMdPath, 'utf-8');
  }

  // Remove old OPUS 67 section if exists (to allow updates)
  const opus67Marker = '# OPUS 67 - Self-Evolving AI Runtime';
  if (content.includes(opus67Marker)) {
    // Find and remove the old section
    const startIdx = content.indexOf('---\n' + opus67Marker);
    if (startIdx !== -1) {
      content = content.substring(0, startIdx).trim();
    } else {
      const altStartIdx = content.indexOf(opus67Marker);
      if (altStartIdx !== -1) {
        content = content.substring(0, altStartIdx).trim();
      }
    }
  }

  // Append updated OPUS 67 section
  const newContent = content + '\n\n---\n' + OPUS67_CLAUDE_MD_SECTION;

  // Ensure directory exists
  const dir = dirname(claudeMdPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(claudeMdPath, newContent);
  return { success: true, path: claudeMdPath };
}

/**
 * Register OPUS 67 as MCP server in Claude Code settings
 */
function registerWithClaudeCode(): { success: boolean; message: string } {
  // Find Claude Code settings
  const home = homedir();
  const possiblePaths = [
    join(home, '.claude', 'settings.json'),
    join(home, 'AppData', 'Roaming', 'Claude', 'settings.json'),
    join(home, '.config', 'claude', 'settings.json'),
  ];

  let settingsPath: string | null = null;
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      settingsPath = p;
      break;
    }
  }

  // If no settings exist, create in default location
  if (!settingsPath) {
    settingsPath = possiblePaths[0];
    const dir = dirname(settingsPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // Load or create settings
  let settings: Record<string, unknown> = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }
  }

  // Add OPUS 67 MCP server
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }

  const mcpServers = settings.mcpServers as Record<string, unknown>;

  // Always update to latest config
  const isWindows = process.platform === 'win32';

  // Use opus67-mcp binary directly for proper stdio communication
  mcpServers.opus67 = isWindows
    ? {
        command: 'cmd',
        args: ['/c', 'npx', '-y', '-p', '@gicm/opus67', 'opus67-mcp'],
      }
    : {
        command: 'npx',
        args: ['-y', '-p', '@gicm/opus67', 'opus67-mcp'],
      };

  // Save settings
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  // Also inject into CLAUDE.md
  const claudeResult = injectIntoCLAUDEmd();

  return {
    success: true,
    message: `OPUS 67 registered!\n- MCP: ${settingsPath}\n- CLAUDE.md: ${claudeResult.path}\nRestart Claude Code to activate.`
  };
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "-h" || command === "--help") {
    console.log(HELP);
    return;
  }

  if (command === "--version" || command === "-v") {
    console.log(`OPUS 67 v${VERSION}`);
    return;
  }

  switch (command) {
    case "init": {
      console.log("\n🚪 Registering OPUS 67 with Claude Code...\n");

      const result = registerWithClaudeCode();

      if (result.success) {
        // Show the full boot screen with dynamic counts
        console.log(generateBootScreen({
          defaultMode: 'auto',
          version: VERSION,
          projectName: 'Claude Code'
        }));

        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  ✅ OPUS 67 REGISTERED SUCCESSFULLY                                       ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  MCP Server:  ${result.message.split('\n')[0].replace('OPUS 67 registered!', '').trim().padEnd(58)}║
║                                                                           ║
║  Available MCP Tools:                                                     ║
║  • opus67_boot            - Show boot screen                              ║
║  • opus67_detect_skills   - Auto-detect skills for your task              ║
║  • opus67_get_skill       - Load a specific skill                         ║
║  • opus67_get_context     - Get enhanced context bundle                   ║
║  • opus67_list_skills     - List all available skills                     ║
║                                                                           ║
║  Slash Commands:                                                          ║
║  /mcp__opus67__solana, /mcp__opus67__react, /mcp__opus67__typescript...   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

        // Auto-launch Claude Code in the same terminal
        console.log("🚀 Launching Claude Code...\n");

        // Use exec to replace current process with claude
        const { execSync } = await import('child_process');
        try {
          execSync('claude', { stdio: 'inherit' });
        } catch {
          // Claude exited or wasn't found
        }
      } else {
        console.log(`❌ ${result.message}`);
      }
      break;
    }

    case "mcp-serve": {
      // This is called by Claude Code - run the MCP server
      const { spawn } = await import('child_process');
      const { fileURLToPath } = await import('url');

      // Use fileURLToPath for proper Windows path handling
      const currentFilePath = fileURLToPath(import.meta.url);
      const serverPath = join(dirname(currentFilePath), 'mcp-server.js');

      const nodePath = process.execPath;
      const child = spawn(nodePath, [serverPath], {
        stdio: 'inherit'
      });

      child.on('error', (err) => {
        console.error('Failed to start MCP server:', err);
        process.exit(1);
      });

      // Keep alive
      await new Promise(() => {});
      break;
    }

    case "boot": {
      const projectPath = args[1] || process.cwd();
      console.log(`\n🚪 Initializing OPUS 67 for: ${projectPath}\n`);

      try {
        const opus = await createOPUS67(projectPath);

        // Count total skills from definitions folder
        const { readdirSync } = await import("fs");
        const skillsDefPath = join(dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1'), "..", "skills", "definitions");
        let totalSkills = 0;
        try {
          const files = readdirSync(skillsDefPath);
          totalSkills = files.filter(f => f.endsWith('.md')).length;
        } catch {
          totalSkills = 140; // Fallback to known count
        }

        console.log("\n✅ OPUS 67 is ready");
        console.log(`   📁 Files indexed: ${opus.contextStats.totalFiles}`);
        console.log(`   📝 Tokens: ${opus.contextStats.totalTokens}`);
        console.log(`   🧠 Skills available: ${totalSkills}`);
        console.log(`   🔌 MCPs connected: ${opus.connectedMCPs.length}`);
        console.log("\n🚪 THE DOOR IS OPEN\n");
      } catch (error) {
        console.error("\n❌ Boot failed:", error);
        process.exit(1);
      }
      break;
    }

    case "status": {
      console.log("\n📊 OPUS 67 Status\n");
      console.log("   Version: " + VERSION);
      console.log("   Status: Ready for boot command");
      console.log("\n   Run 'opus67 boot .' to initialize\n");
      break;
    }

    case "skills": {
      console.log("\n🧠 Skills Registry\n");
      
      try {
        const registryPath = join(process.cwd(), "skills", "registry.yaml");
        const { parse } = await import("yaml");
        const content = readFileSync(registryPath, "utf-8");
        const registry = parse(content);
        
        console.log(`   Total skills: ${registry.skills?.length || 0}`);
        console.log("");
        
        for (const skill of registry.skills || []) {
          const status = skill.priority <= 2 ? "⭐" : "  ";
          console.log(`   ${status} ${skill.id} (${skill.tokens} tokens)`);
        }
        
        console.log("");
      } catch {
        console.log("   No skills registry found. Run 'opus67 boot' first.\n");
      }
      break;
    }

    case "mcp": {
      console.log("\n🔌 MCP Connections\n");
      
      try {
        const configPath = join(process.cwd(), "mcp", "connections.yaml");
        const { parse } = await import("yaml");
        const content = readFileSync(configPath, "utf-8");
        const config = parse(content);
        
        console.log(`   Total connections: ${config.connections?.length || 0}`);
        console.log("");
        
        for (const conn of config.connections || []) {
          const status = conn.status === "ready" ? "✅" : conn.status === "pending" ? "⏳" : "❌";
          console.log(`   ${status} ${conn.id} - ${conn.name}`);
        }
        
        console.log("");
      } catch {
        console.log("   No MCP config found. Run 'opus67 boot' first.\n");
      }
      break;
    }

    case "analyze": {
      console.log("\n🔍 Pattern Analysis\n");
      console.log("   Analysis requires active OPUS 67 instance.");
      console.log("   Run 'opus67 boot' first, then use programmatic API.\n");
      break;
    }

    case "suggest": {
      console.log("\n💡 Skill Suggestions\n");
      console.log("   Suggestions require interaction history.");
      console.log("   Use OPUS 67 for a while, then run analyze.\n");
      break;
    }

    // =========================================================================
    // INTELLIGENCE COMMANDS (v4.0)
    // =========================================================================

    case "intel": {
      const subCommand = args[1];

      if (!subCommand) {
        // Show intelligence layer status
        console.log("\n🧠 Intelligence Layer Status\n");

        try {
          const { getIntelligenceStats } = await import("./intelligence/index.js");
          const stats = await getIntelligenceStats();

          console.log("   Skills:");
          console.log(`     Total: ${stats.skills.total}`);
          console.log(`     With capabilities: ${stats.skills.withCapabilities}`);
          console.log("");
          console.log("   Synergies:");
          console.log(`     Total edges: ${stats.synergies.totalEdges}`);
          console.log(`     Amplifying: ${stats.synergies.amplifying}`);
          console.log(`     Conflicting: ${stats.synergies.conflicting}`);
          console.log("");
          console.log("   MCPs:");
          console.log(`     Servers: ${stats.mcps.totalServers}`);
          console.log(`     Endpoints: ${stats.mcps.totalEndpoints}`);
          console.log("");
          console.log("   Storage:");
          console.log(`     Mode: ${stats.storage.mode}`);
          console.log(`     Cache hits: ${stats.storage.cacheHits}`);
          console.log(`     Cache misses: ${stats.storage.cacheMisses}`);
          console.log("");
        } catch (error) {
          console.error("   Failed to get intelligence stats:", error);
        }
        break;
      }

      if (subCommand === "search") {
        const query = args.slice(2).join(" ");
        if (!query) {
          console.log("\n❌ Usage: opus67 intel search <query>\n");
          break;
        }

        console.log(`\n🔍 Searching skills for: "${query}"\n`);

        try {
          const { findSimilarSkills } = await import("./intelligence/index.js");
          const results = await findSimilarSkills(query, 10);

          if (results.length === 0) {
            console.log("   No matching skills found.\n");
          } else {
            for (const result of results) {
              const score = (result.score * 100).toFixed(1);
              console.log(`   ${score}% - ${result.skillId}`);
            }
            console.log("");
          }
        } catch (error) {
          console.error("   Search failed:", error);
        }
        break;
      }

      if (subCommand === "check") {
        const task = args.slice(2).join(" ");
        if (!task) {
          console.log("\n❌ Usage: opus67 intel check <task description>\n");
          break;
        }

        console.log(`\n✈️ Pre-flight check for: "${task}"\n`);

        try {
          const { findBestSkills, preFlightCheck } = await import("./intelligence/index.js");

          // Find best skills first
          const skillMatches = await findBestSkills(task, 5);
          const skillIds = skillMatches.map(m => m.skillId);

          console.log("   Recommended skills:");
          for (const match of skillMatches) {
            const score = (match.score * 100).toFixed(1);
            console.log(`     ${score}% - ${match.skillId}`);
          }
          console.log("");

          // Run pre-flight check
          const check = await preFlightCheck(task, skillIds);

          const status = check.pass ? "✅ PASS" : "⚠️ REVIEW NEEDED";
          console.log(`   Status: ${status}`);
          console.log(`   Confidence: ${(check.confidence * 100).toFixed(1)}%`);

          if (check.blockers.length > 0) {
            console.log("\n   Blockers:");
            for (const blocker of check.blockers) {
              console.log(`     ❌ ${blocker}`);
            }
          }

          if (check.warnings.length > 0) {
            console.log("\n   Warnings:");
            for (const warning of check.warnings) {
              console.log(`     ⚠️ ${warning}`);
            }
          }

          if (check.recommendations.length > 0) {
            console.log("\n   Recommendations:");
            for (const rec of check.recommendations) {
              console.log(`     💡 ${rec}`);
            }
          }
          console.log("");
        } catch (error) {
          console.error("   Pre-flight check failed:", error);
        }
        break;
      }

      console.log(`\n❌ Unknown intel command: ${subCommand}`);
      console.log("   Available: intel, intel search <q>, intel check <task>\n");
      break;
    }

    case "learn": {
      const subCommand = args[1];

      if (subCommand === "clear") {
        console.log("\n🧹 Clearing all learnings...\n");

        try {
          const { getLearningLoop } = await import("./intelligence/learning-loop.js");
          const loop = getLearningLoop();
          await loop.clear();
          console.log("   ✅ All learnings cleared.\n");
        } catch (error) {
          console.error("   Failed to clear learnings:", error);
        }
        break;
      }

      // Show learning statistics
      console.log("\n📚 Learning Statistics\n");

      try {
        const { getLearningLoop } = await import("./intelligence/learning-loop.js");
        const loop = getLearningLoop();
        const stats = await loop.getStats();

        console.log(`   Total interactions: ${stats.totalInteractions}`);
        console.log(`   Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
        console.log(`   Avg confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
        console.log(`   Avg latency: ${stats.avgLatencyMs}ms`);
        console.log(`   Patterns learned: ${stats.patterns}`);

        if (stats.topSkills.length > 0) {
          console.log("\n   Top skills:");
          for (const skill of stats.topSkills.slice(0, 5)) {
            console.log(`     ${skill.count}x - ${skill.skillId}`);
          }
        }
        console.log("");
      } catch (error) {
        console.error("   Failed to get learning stats:", error);
      }
      break;
    }

    case "sync": {
      const subCommand = args[1];

      if (subCommand === "status") {
        console.log("\n☁️ Sync Status\n");

        try {
          const { getCloudSync } = await import("./intelligence/cloud-sync.js");
          const sync = getCloudSync();
          const status = sync.getStatus();

          console.log(`   Last sync: ${status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}`);
          console.log(`   Pending uploads: ${status.pendingUploads}`);
          console.log(`   Online: ${status.isOnline ? 'Yes' : 'No (no endpoint configured)'}`);
          console.log(`   Sync in progress: ${status.syncInProgress ? 'Yes' : 'No'}`);
          console.log("");
        } catch (error) {
          console.error("   Failed to get sync status:", error);
        }
        break;
      }

      // Trigger sync
      console.log("\n☁️ Syncing learnings to cloud...\n");

      try {
        const { getCloudSync } = await import("./intelligence/cloud-sync.js");
        const sync = getCloudSync();
        const result = await sync.forceSync();

        if (result.success) {
          console.log("   ✅ Sync completed");
          console.log(`   Uploaded: ${result.uploaded} interactions`);
          console.log(`   Downloaded: ${result.downloaded} interactions`);
          if (result.conflicts > 0) {
            console.log(`   Conflicts resolved: ${result.conflicts}`);
          }
        } else {
          console.log(`   ⚠️ Sync failed: ${result.error}`);
        }
        console.log("");
      } catch (error) {
        console.error("   Sync failed:", error);
      }
      break;
    }

    default: {
      console.error(`\n❌ Unknown command: ${command}`);
      console.log("   Run 'opus67 help' for usage information.\n");
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
