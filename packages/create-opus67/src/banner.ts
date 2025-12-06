import figlet from 'figlet';
import chalk from 'chalk';
import { OPUS67_STATS, VERSION } from './stats.js';

export const OPUS67_ASCII = `
   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗
  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║
  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝
  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝
  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║
   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝
`;

export { VERSION } from './stats.js';

export function printBanner(): void {
  console.log(chalk.cyan(OPUS67_ASCII));
  console.log(chalk.gray(`                 Self-Evolving AI Runtime v${VERSION}`));
  console.log();
  console.log(chalk.white(`  ${OPUS67_STATS.skills} Skills • ${OPUS67_STATS.mcps} MCPs • ${OPUS67_STATS.modes} Modes • ${OPUS67_STATS.agents} Agents`));
  console.log();
  console.log(chalk.gray('  Created by ') + chalk.cyan('@0motionguy') + chalk.gray(' • 4ms routing • 566x faster'));
  console.log();
}

export function printSuccessBanner(): void {
  console.log();
  console.log(chalk.green('  ✓ OPUS 67 v5.1.8 "THE PRECISION UPDATE" installed successfully!'));
  console.log();
  console.log(chalk.gray('  What you get:'));
  console.log(chalk.white(`    • ${OPUS67_STATS.skills} specialist skills (auto-loaded based on task)`));
  console.log(chalk.white(`    • ${OPUS67_STATS.mcps} MCP connections (live data, APIs, blockchain)`));
  console.log(chalk.white(`    • ${OPUS67_STATS.modes} optimized modes (right context for each task)`));
  console.log(chalk.white(`    • ${OPUS67_STATS.agents} expert agents (domain-specific personas)`));
  console.log(chalk.white('    • Multi-model routing (Opus/Sonnet/Haiku)'));
  console.log();
  console.log(chalk.cyan('  🧠 NEW in v5.0:'));
  console.log(chalk.white('    • Extended Thinking - Claude Opus 4.5 with 4 complexity modes'));
  console.log(chalk.white('    • Prompt Caching - 90% cost savings on repeated context'));
  console.log(chalk.white('    • Dynamic Tool Discovery - AI-powered MCP recommendations'));
  console.log(chalk.white('    • File-Aware Memory - Track dependencies across 14 languages'));
  console.log(chalk.white('    • SWE-bench Patterns - Precise multi-file code edits'));
  console.log(chalk.white('    • Long-Horizon Planning - Multi-step task decomposition'));
  console.log(chalk.white('    • Verification Loops - Auto-verify code changes'));
  console.log(chalk.white('    • Unified Brain API - One simple API for everything'));
  console.log();
  console.log(chalk.cyan('  Your AI just got superpowers. Start building.'));
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
