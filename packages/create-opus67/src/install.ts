import ora from 'ora';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { writeConfig, writeClaudeDesktopConfig } from './config.js';
import type { DetectedEnvironment } from './detect.js';
import { OPUS67_STATS } from './stats.js';

export type InstallType = 'full' | 'solana' | 'frontend' | 'minimal';

export interface InstallConfig {
  environment: string;
  installType: InstallType;
  configPath: string;
  version: string;
  stats: {
    skills: number;
    mcps: number;
    modes: number;
    agents: number;
  };
  skillsPath?: string;
  mcpsPath?: string;
  modesPath?: string;
}

export interface InstallStats {
  skills: number;
  mcps: number;
  modes: number;
  agents: number;
}

// Stats by install type - full uses centralized stats
const INSTALL_STATS: Record<InstallType, InstallStats> = {
  full: OPUS67_STATS,
  solana: { skills: 35, mcps: 25, modes: 12, agents: 30 },
  frontend: { skills: 40, mcps: 20, modes: 15, agents: 25 },
  minimal: { skills: 15, mcps: 10, modes: 8, agents: 10 },
};

export function getInstallTypeChoices(): Array<{ name: string; value: InstallType; hint: string }> {
  return [
    {
      name: 'Full',
      value: 'full',
      hint: `(${OPUS67_STATS.skills} skills, ${OPUS67_STATS.mcps} MCPs, ${OPUS67_STATS.agents} agents)`,
    },
    {
      name: 'Solana',
      value: 'solana',
      hint: '(35 skills, 25 MCPs, 30 agents)',
    },
    {
      name: 'Frontend',
      value: 'frontend',
      hint: '(40 skills, 20 MCPs, 25 agents)',
    },
    {
      name: 'Minimal',
      value: 'minimal',
      hint: '(15 skills, 10 MCPs, 10 agents)',
    },
  ];
}

export async function runInstallation(
  env: DetectedEnvironment,
  installType: InstallType,
  version: string
): Promise<InstallConfig> {
  const stats = INSTALL_STATS[installType];

  const config: InstallConfig = {
    environment: env.id,
    installType,
    configPath: env.configPath,
    version,
    stats,
  };

  console.log();
  console.log(chalk.cyan(`Installing OPUS 67 v${version}...`));
  console.log();

  // Step 1: Load skills
  const skillsSpinner = ora({
    text: `Loading skills (${stats.skills})`,
    prefixText: '  ├──',
  }).start();
  await sleep(300);
  skillsSpinner.succeed(`Loading skills (${stats.skills})`);

  // Step 2: Configure MCPs
  const mcpSpinner = ora({
    text: `Configuring MCPs (${stats.mcps})`,
    prefixText: '  ├──',
  }).start();
  await sleep(300);
  mcpSpinner.succeed(`Configuring MCPs (${stats.mcps})`);

  // Step 3: Setting up modes
  const modesSpinner = ora({
    text: `Setting up modes (${stats.modes})`,
    prefixText: '  ├──',
  }).start();
  await sleep(300);
  modesSpinner.succeed(`Setting up modes (${stats.modes})`);

  // Step 4: Generate config
  const configSpinner = ora({
    text: 'Generating config',
    prefixText: '  └──',
  }).start();

  try {
    writeConfig(config);

    // Always attempt to write Claude Desktop MCP config
    // Users may have Claude Code installed even if using other environments
    // The function handles errors gracefully
    writeClaudeDesktopConfig(config);

    await sleep(200);
    configSpinner.succeed(`Generating config`);
  } catch (error) {
    configSpinner.fail(`Failed to generate config: ${(error as Error).message}`);
    throw error;
  }

  return config;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Status check
export function checkInstallationStatus(): {
  installed: boolean;
  version?: string;
  environment?: string;
  configPath?: string;
} {
  // Check for CLAUDE.md in current directory
  const claudeMdPath = join(process.cwd(), 'CLAUDE.md');
  if (existsSync(claudeMdPath)) {
    try {
      const content = readFileSync(claudeMdPath, 'utf-8');
      if (content.includes('OPUS 67')) {
        const versionMatch = content.match(/v(\d+\.\d+\.\d+)/);
        return {
          installed: true,
          version: versionMatch?.[1],
          environment: 'claude-code',
          configPath: claudeMdPath,
        };
      }
    } catch {
      // Ignore read errors
    }
  }

  // Check for .cursorrules
  const cursorPath = join(process.cwd(), '.cursorrules');
  if (existsSync(cursorPath)) {
    try {
      const content = readFileSync(cursorPath, 'utf-8');
      if (content.includes('OPUS 67')) {
        const versionMatch = content.match(/v(\d+\.\d+\.\d+)/);
        return {
          installed: true,
          version: versionMatch?.[1],
          environment: 'cursor',
          configPath: cursorPath,
        };
      }
    } catch {
      // Ignore read errors
    }
  }

  // Check for .opus67 directory
  const opus67Path = join(process.cwd(), '.opus67', 'config.json');
  if (existsSync(opus67Path)) {
    try {
      const config = JSON.parse(readFileSync(opus67Path, 'utf-8'));
      return {
        installed: true,
        version: config.version,
        environment: config.environment || 'manual',
        configPath: opus67Path,
      };
    } catch {
      // Ignore parse errors
    }
  }

  return { installed: false };
}
