import figlet from "figlet";
import chalk from "chalk";
import { OPUS67_STATS, VERSION } from "./stats.js";

export const OPUS67_ASCII = `
   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗
  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║
  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝
  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝
  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║
   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝
`;

export { VERSION } from "./stats.js";

export function printBanner(): void {
  console.log(chalk.cyan(OPUS67_ASCII));
  console.log(
    chalk.gray(`                 Self-Evolving AI Runtime v${VERSION}`),
  );
  console.log();
  console.log(
    chalk.white(
      `  ${OPUS67_STATS.skills} Skills • ${OPUS67_STATS.mcps} MCPs • ${OPUS67_STATS.modes} Modes • ${OPUS67_STATS.agents} Agents`,
    ),
  );
  console.log();
  console.log(
    chalk.gray("  Created by ") +
      chalk.cyan("@0motionguy") +
      chalk.gray(" • 4ms routing • 566x faster"),
  );
  console.log();
}

export function printSuccessBanner(): void {
  console.log();
  console.log(
    chalk.green(
      `  ✓ OPUS 67 v${VERSION} "THE UNIFICATION" installed successfully!`,
    ),
  );
  console.log();
  console.log(chalk.gray("  What you get:"));
  console.log(
    chalk.white(
      `    • ${OPUS67_STATS.skills} specialist skills (auto-loaded based on task)`,
    ),
  );
  console.log(
    chalk.white(
      `    • ${OPUS67_STATS.mcps} MCP connections (live data, APIs, blockchain)`,
    ),
  );
  console.log(
    chalk.white(
      `    • ${OPUS67_STATS.modes} optimized modes (right context for each task)`,
    ),
  );
  console.log(
    chalk.white(
      `    • ${OPUS67_STATS.agents} expert agents (domain-specific personas)`,
    ),
  );
  console.log(
    chalk.white("    • Unified Memory System (graph + learning + markdown)"),
  );
  console.log();
  console.log(chalk.cyan("  🧠 NEW in v6.0:"));
  console.log(
    chalk.white(
      "    • Unified Memory - GraphitiMemory + LearningStore + MarkdownMemory",
    ),
  );
  console.log(
    chalk.white(
      "    • Context Indexing - 85%+ cache hit rate, <72ms E2E queries",
    ),
  );
  console.log(
    chalk.white("    • HMLR Adapter - Multi-hop reasoning (3-5 hop queries)"),
  );
  console.log(
    chalk.white(
      "    • VS Code Extension - Browse modes, skills, agents in sidebar",
    ),
  );
  console.log(
    chalk.white("    • Performance - 141 skills loaded in 44ms (0.32ms/skill)"),
  );
  console.log(
    chalk.white(
      "    • Token Efficiency - Hierarchical loading, context windowing",
    ),
  );
  console.log(
    chalk.white(
      "    • 30 Operating Modes - AUTO, ULTRA, THINK, BUILD, SWARM, etc.",
    ),
  );
  console.log(
    chalk.white("    • 107 Expert Agents - Domain-specific task automation"),
  );
  console.log();
  console.log(chalk.cyan("  Your AI just got superpowers. Start building."));
  console.log();
}

export function printErrorBanner(message: string): void {
  console.log();
  console.log(chalk.red(`  ✗ Error: ${message}`));
  console.log();
}

export function printInfo(message: string): void {
  console.log(chalk.blue(`  ℹ ${message}`));
}

export function printWarning(message: string): void {
  console.log(chalk.yellow(`  ⚠ ${message}`));
}
