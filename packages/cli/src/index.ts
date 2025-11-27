#!/usr/bin/env node

/**
 * Aether CLI - Official command-line interface for the Aether marketplace
 * (Formerly gICM)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { addCommand } from './commands/add';
import { searchCommand } from './commands/search';
import { listCommand } from './commands/list';
import { healthCommand } from './commands/health';
import { validateCommand } from './commands/validate';
import { updateCommand } from './commands/update';
import { createMCPCommand } from './commands/create-mcp';

const program = new Command();

const DEFAULT_API_URL = 'https://gicm-marketplace.vercel.app/api';

program
  .name('aether')
  .description('Official CLI for Aether marketplace - The Universal AI Workflow Marketplace')
  .version('1.1.0');

// Add command - Install items from marketplace
program
  .command('add <items...>')
  .alias('install')
  .description('Install one or more items from the marketplace')
  .option('--api-url <url>', 'Custom API URL (for testing)', DEFAULT_API_URL)
  .option('-p, --platform <platform>', 'Target platform (claude, gemini, openai)', 'claude')
  .option('-y, --yes', 'Skip confirmation prompt', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (items: string[], options) => {
    try {
      await addCommand(items, {
        apiUrl: options.apiUrl,
        platform: options.platform,
        skipConfirm: options.yes,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Search command - Search marketplace catalog
program
  .command('search <query>')
  .description('Search for agents, skills, commands, MCPs, and settings')
  .option('--api-url <url>', 'Custom API URL (for testing)', DEFAULT_API_URL)
  .option('--kind <kind>', 'Filter by kind (agent, skill, command, mcp, setting)')
  .option('--category <category>', 'Filter by category')
  .option('--tags <tags...>', 'Filter by tags')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (query: string, options) => {
    try {
      await searchCommand(query, {
        apiUrl: options.apiUrl,
        kind: options.kind,
        category: options.category,
        tags: options.tags,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// List command - List all available items
program
  .command('list')
  .description('List all available items in the marketplace')
  .option('--api-url <url>', 'Custom API URL (for testing)', DEFAULT_API_URL)
  .option('--kind <kind>', 'Filter by kind (agent, skill, command, mcp, setting)')
  .option('--category <category>', 'Filter by category')
  .option('-v, --verbose', 'Show detailed output', false)
  .action(async (options) => {
    try {
      await listCommand({
        apiUrl: options.apiUrl,
        kind: options.kind,
        category: options.category,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Health command - Check CLI and API health
program
  .command('health')
  .description('Check health status of CLI and API connectivity')
  .option('--api-url <url>', 'Custom API URL (for testing)', DEFAULT_API_URL)
  .option('-v, --verbose', 'Show detailed health information', false)
  .action(async (options) => {
    try {
      await healthCommand({
        apiUrl: options.apiUrl,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Validate command - Validate project setup
program
  .command('validate')
  .description('Validate project setup and installed items')
  .option('--fix', 'Automatically fix issues where possible', false)
  .option('-v, --verbose', 'Show detailed validation output', false)
  .action(async (options) => {
    try {
      await validateCommand({
        fix: options.fix,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Update command - Update CLI and registry cache
program
  .command('update')
  .description('Update CLI to latest version and refresh registry cache')
  .option('--registry', 'Update only registry cache', false)
  .option('--cli', 'Update only CLI package', false)
  .option('-v, --verbose', 'Show detailed update information', false)
  .action(async (options) => {
    try {
      await updateCommand({
        registry: options.registry,
        cli: options.cli,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Create MCP command - Interactive MCP creation wizard
program
  .command('create-mcp')
  .description('Create a new MCP (Model Context Protocol) plugin with interactive wizard')
  .option('--name <name>', 'MCP name (lowercase, no spaces)')
  .option('-y, --yes', 'Skip confirmation prompts', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      await createMCPCommand({
        name: options.name,
        skipConfirm: options.yes,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Parse arguments
program.parse(process.argv);