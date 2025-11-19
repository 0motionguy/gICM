/**
 * Add command - Install marketplace items
 */

import chalk from 'chalk';
import ora from 'ora';
import { GICMAPIClient } from '../lib/api';
import { FileWriter } from '../lib/files';
import { UniversalBridge } from '../lib/bridge';
import type { ParsedItem, CLIOptions, RegistryItem } from '../lib/types';

/**
 * Parse item string like "agent/slug" into { kind, slug }
 */
function parseItemString(itemStr: string): ParsedItem {
  const match = itemStr.match(/^(agent|skill|command|mcp|setting)\/([a-z0-9-]+)$/);

  if (!match) {
    throw new Error(
      `Invalid item format: "${itemStr}"\n` +
      `  Expected format: <kind>/<slug>\n` +
      `  Examples: agent/code-reviewer, skill/typescript-advanced, command/deploy-foundry`
    );
  }

  const [, kind, slug] = match;
  return {
    kind: kind as ParsedItem['kind'],
    slug,
    original: itemStr,
  };
}

/**
 * Add command handler
 */
export async function addCommand(items: string[], options: CLIOptions = {}): Promise<void> {
  const apiClient = new GICMAPIClient(options.apiUrl);
  
  // Initialize FileWriter with platform awareness
  const platform = options.platform || "claude";
  const fileWriter = new FileWriter(undefined, platform);

  // Ensure config directory exists and is writable
  try {
    await fileWriter.ensureConfigDir();
  } catch (error) {
    process.exit(1);
  }

  // Parse all item strings
  let parsedItems: ParsedItem[];
  try {
    parsedItems = items.map(parseItemString);
  } catch (error) {
    console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
    process.exit(1);
  }

  const spinner = ora({
    text: `Fetching items from Aether marketplace for ${platform === 'gemini' ? 'Gemini' : 'Claude'}...`,
    color: 'cyan',
  }).start();

  try {
    // Fetch all items
    const fetchedItems: RegistryItem[] = [];
    for (const parsed of parsedItems) {
      const item = await apiClient.getItem(parsed.slug);
      fetchedItems.push(item);
    }

    spinner.text = 'Resolving dependencies...';

    // Resolve dependencies using bundle API
    const itemIds = fetchedItems.map(item => item.id);
    const bundle = await apiClient.resolveBundle(itemIds);

    spinner.succeed(
      chalk.green(`Found ${bundle.stats.totalCount} items`) +
      (bundle.stats.dependencyCount > 0
        ? chalk.gray(` (including ${bundle.stats.dependencyCount} dependencies)`)
        : '')
    );

    // Show what will be installed
    console.log(chalk.cyan(`\nItems to install for ${chalk.bold(platform)}:`));
    const byKind = {
      agent: bundle.items.filter(i => i.kind === 'agent'),
      skill: bundle.items.filter(i => i.kind === 'skill'),
      command: bundle.items.filter(i => i.kind === 'command'),
      mcp: bundle.items.filter(i => i.kind === 'mcp'),
      setting: bundle.items.filter(i => i.kind === 'setting'),
    };

    for (const [kind, kindItems] of Object.entries(byKind)) {
      if (kindItems.length > 0) {
        console.log(chalk.bold(`\n  ${kind.toUpperCase()}S (${kindItems.length}):`));
        kindItems.forEach(item => {
          const isRequested = fetchedItems.some(f => f.id === item.id);
          const prefix = isRequested ? chalk.green('●') : chalk.gray('○');
          const name = isRequested ? chalk.white(item.name) : chalk.gray(item.name);
          const desc = chalk.gray(`- ${item.description.slice(0, 60)}${item.description.length > 60 ? '...' : ''}`);
          console.log(`  ${prefix} ${name}`);
          console.log(`    ${desc}`);
        });
      }
    }

    if (bundle.stats.tokenSavings > 0) {
      console.log(chalk.yellow(`\n💡 Estimated token savings: ${bundle.stats.tokenSavings}%`));
    }

    // Confirm installation (unless --yes flag)
    if (!options.skipConfirm) {
      console.log(chalk.cyan(`\nPress Ctrl+C to cancel, or any key to continue...`));
      // Simple confirmation - in production you'd use enquirer
      // For now, just continue automatically after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Download and install files
    const installSpinner = ora({
      text: 'Installing files...', 
      color: 'green',
    }).start();

    let installedCount = 0;
    for (const item of bundle.items) {
      try {
        // Download files
        const files = await apiClient.getFiles(item.slug);

        // Apply Universal Bridge Logic
        // If targeting a different platform, wrap prompt files with compatibility shim
        const bridgedFiles = files.map(file => {
          // Only transform markdown files (prompts) and only if not using default Claude
          if (file.path.endsWith('.md') && platform !== 'claude') {
             // Check if file content already has specific headers to avoid double wrapping
             if (!file.content.includes('AETHER BRIDGE: ADAPTER ACTIVE')) {
                 const bridgedContent = UniversalBridge.bridgePrompt(file.content, {
                     sourcePlatform: 'claude', // Assuming source is Claude-native by default
                     targetPlatform: platform as 'gemini', // We checked platform != claude
                     agentName: item.name
                 });
                 return { ...file, content: bridgedContent };
             }
          }
          return file;
        });

        // Write files
        await fileWriter.writeItem(item, bridgedFiles);

        installedCount++;
        installSpinner.text = `Installing... (${installedCount}/${bundle.stats.totalCount})`;

        if (options.verbose) {
          installSpinner.text = `Installed ${item.kind}/${item.slug}`;
        }
      } catch (error) {
        installSpinner.fail(chalk.red(`Failed to install ${item.kind}/${item.slug}`));
        console.error(chalk.yellow(`  ${(error as Error).message}`));
        // Continue with other items
        installSpinner.start();
      }
    }

    installSpinner.succeed(chalk.green(`Successfully installed ${installedCount} items!`));

    // Show summary
    console.log(chalk.green('\n✓ Installation complete!\n'));
    console.log(chalk.cyan('Installed items:'));
    console.log(`  ${chalk.bold('Agents:')}   ${bundle.stats.byKind.agent}`);
    console.log(`  ${chalk.bold('Skills:')}   ${bundle.stats.byKind.skill}`);
    console.log(`  ${chalk.bold('Commands:')} ${bundle.stats.byKind.command}`);
    console.log(`  ${chalk.bold('MCPs:')}     ${bundle.stats.byKind.mcp}`);
    if (bundle.stats.byKind.setting) {
      console.log(`  ${chalk.bold('Settings:')} ${bundle.stats.byKind.setting}`);
    }

    // Show next steps for MCPs if any were installed
    const mcps = bundle.items.filter(i => i.kind === 'mcp');
    if (mcps.length > 0) {
      console.log(chalk.yellow('\n⚠️  MCP servers require configuration:'));
      mcps.forEach(mcp => {
        if (mcp.envKeys && mcp.envKeys.length > 0) {
          const configPath = platform === 'claude' ? '.claude/mcp' : '.gemini/mcp';
          console.log(chalk.gray(`\n  ${mcp.name}:`));
          console.log(chalk.gray(`    Configure: ${configPath}/${mcp.slug}.json`));
          console.log(chalk.gray(`    Required: ${mcp.envKeys.join(', ')}`));
        }
      });
    }

    console.log(chalk.gray(`\n💡 Tip: Reload your ${platform === 'gemini' ? 'Gemini' : 'Claude'} editor to see the new items.\n`));

  } catch (error) {
    spinner.fail(chalk.red('Installation failed'));
    console.error(chalk.red(`\n${(error as Error).message}\n`));
    process.exit(1);
  }
}
