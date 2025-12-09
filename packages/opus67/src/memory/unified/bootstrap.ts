/**
 * OPUS 67 - Memory Bootstrap
 *
 * Seeds initial memory data from project files:
 * - .claude/memory/wins/*.md → wins/facts
 * - CLAUDE.md → project facts
 * - THE_DOOR.md → system facts
 *
 * Run via: pnpm bootstrap:memory
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { getUnifiedMemory, initializeUnifiedMemory } from "./unified-memory.js";

// =============================================================================
// TYPES
// =============================================================================

interface ParsedWin {
  title: string;
  type: string;
  value: number;
  description: string;
  impact?: string;
  timestamp?: Date;
}

interface BootstrapResult {
  wins: number;
  projectFacts: number;
  systemFacts: number;
  total: number;
  errors: number;
}

// =============================================================================
// PARSERS
// =============================================================================

/**
 * Parse a wins markdown file
 */
function parseWinsFile(filePath: string): ParsedWin[] {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, "utf-8");
  const wins: ParsedWin[] = [];

  // Split by ### headers
  const sections = content.split(/^### /gm).slice(1); // Skip header before first ###

  for (const section of sections) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.trim() || "Unknown";

    // Parse metadata
    let type = "general";
    let value = 1;
    let impact = "";
    let description = "";

    for (const line of lines.slice(1)) {
      const typeMatch = line.match(/\*\*Type:\*\*\s*(.+)/i);
      if (typeMatch) type = typeMatch[1].trim();

      const valueMatch = line.match(/\*\*Value:\*\*\s*(\d+)/i);
      if (valueMatch) value = parseInt(valueMatch[1], 10);

      const impactMatch = line.match(/\*\*Impact:\*\*\s*(.+)/i);
      if (impactMatch) impact = impactMatch[1].trim();

      const descMatch = line.match(/\*\*Description:\*\*\s*(.+)/i);
      if (descMatch) description = descMatch[1].trim();
    }

    // If no description found, use remaining content
    if (!description) {
      description = lines
        .slice(1)
        .filter((l) => !l.startsWith("- **"))
        .join(" ")
        .trim()
        .slice(0, 200);
    }

    wins.push({
      title,
      type,
      value,
      description: description || title,
      impact,
    });
  }

  return wins;
}

/**
 * Parse CLAUDE.md for project facts
 */
function parseClaudeMd(filePath: string): string[] {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, "utf-8");
  const facts: string[] = [];

  // Extract key facts from CLAUDE.md
  // Look for bullet points and key sections
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract ## headers as facts
    if (line.startsWith("## ")) {
      const fact = line.replace("## ", "").trim();
      if (fact.length > 5 && fact.length < 100) {
        facts.push(`Project section: ${fact}`);
      }
    }

    // Extract table rows with counts (like | Skills | 141 |)
    const tableMatch = line.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*(\d+)\s*\|/);
    if (tableMatch) {
      facts.push(`Project has ${tableMatch[2]} ${tableMatch[1].toLowerCase()}`);
    }

    // Extract mode information
    if (line.includes("| AUTO ") || line.includes("| ULTRA ")) {
      const modeMatch = line.match(/\|\s*(\w+)\s*\|/);
      if (modeMatch) {
        facts.push(`Operating mode available: ${modeMatch[1]}`);
      }
    }
  }

  return facts.slice(0, 50); // Limit to 50 facts
}

/**
 * Parse THE_DOOR.md for system facts
 */
function parseTheDoor(filePath: string): string[] {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, "utf-8");
  const facts: string[] = [];

  // Extract key system information
  const lines = content.split("\n");

  for (const line of lines) {
    // Extract version info
    if (line.includes("version") || line.includes("v6.")) {
      const versionMatch = line.match(/v?\d+\.\d+\.\d+/);
      if (versionMatch) {
        facts.push(`System version: ${versionMatch[0]}`);
      }
    }

    // Extract capability counts
    const countMatch = line.match(/(\d+)\s+(skills?|mcps?|agents?|modes?)/i);
    if (countMatch) {
      facts.push(`System has ${countMatch[1]} ${countMatch[2].toLowerCase()}`);
    }
  }

  return [...new Set(facts)].slice(0, 20); // Dedupe and limit
}

// =============================================================================
// BOOTSTRAP FUNCTION
// =============================================================================

/**
 * Bootstrap memory with initial data
 */
export async function bootstrapMemory(
  projectRoot?: string,
): Promise<BootstrapResult> {
  const root = projectRoot || process.cwd();

  console.log("[Bootstrap] Starting memory bootstrap...");
  console.log(`[Bootstrap] Project root: ${root}`);

  // Initialize memory if not already
  const memory =
    getUnifiedMemory() ||
    (await initializeUnifiedMemory({ projectRoot: root }));

  const result: BootstrapResult = {
    wins: 0,
    projectFacts: 0,
    systemFacts: 0,
    total: 0,
    errors: 0,
  };

  // 1. Seed wins from .claude/memory/wins/*.md
  const winsDir = join(root, ".claude", "memory", "wins");
  if (existsSync(winsDir)) {
    const winsFiles = readdirSync(winsDir).filter((f) => f.endsWith(".md"));

    for (const file of winsFiles) {
      const wins = parseWinsFile(join(winsDir, file));

      for (const win of wins) {
        try {
          await memory.write({
            type: "win",
            content: `${win.title}: ${win.description}`,
            key: win.title,
            metadata: {
              winType: win.type,
              value: win.value,
              impact: win.impact,
              source: "bootstrap",
            },
          });
          result.wins++;
        } catch (error) {
          console.warn(`[Bootstrap] Failed to write win: ${win.title}`);
          result.errors++;
        }
      }
    }
  }

  // 2. Seed project facts from CLAUDE.md
  const claudeMdPath = join(root, "CLAUDE.md");
  const projectFacts = parseClaudeMd(claudeMdPath);

  for (const fact of projectFacts) {
    try {
      await memory.write({
        type: "fact",
        content: fact,
        key: `project:${fact.slice(0, 30)}`,
        metadata: {
          source: "bootstrap",
          origin: "CLAUDE.md",
        },
      });
      result.projectFacts++;
    } catch (error) {
      result.errors++;
    }
  }

  // 3. Seed system facts from THE_DOOR.md
  const doorPath = join(root, "packages", "opus67", "THE_DOOR.md");
  const systemFacts = parseTheDoor(doorPath);

  for (const fact of systemFacts) {
    try {
      await memory.write({
        type: "fact",
        content: fact,
        key: `system:${fact.slice(0, 30)}`,
        metadata: {
          source: "bootstrap",
          origin: "THE_DOOR.md",
        },
      });
      result.systemFacts++;
    } catch (error) {
      result.errors++;
    }
  }

  result.total = result.wins + result.projectFacts + result.systemFacts;

  console.log(`[Bootstrap] Complete!`);
  console.log(`  Wins: ${result.wins}`);
  console.log(`  Project facts: ${result.projectFacts}`);
  console.log(`  System facts: ${result.systemFacts}`);
  console.log(`  Total: ${result.total}`);
  console.log(`  Errors: ${result.errors}`);

  return result;
}

// =============================================================================
// CLI ENTRY
// =============================================================================

// Run if called directly
async function main() {
  const projectRoot = process.argv[2] || process.cwd();
  const result = await bootstrapMemory(projectRoot);

  console.log("\n=== BOOTSTRAP SUMMARY ===");
  console.log(JSON.stringify(result, null, 2));
}

// Check if running as main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Bootstrap failed:", error);
    process.exit(1);
  });
}

export default bootstrapMemory;
