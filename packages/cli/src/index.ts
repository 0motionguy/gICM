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
import { installStackCommand } from './commands/install-stack';
import { searchToolsCommand } from './commands/search-tools';
import { initCommand } from './commands/init';
import { indexCommand } from './commands/index-codebase';
import { setupClaudeCommand } from './commands/setup-claude';
import { devCommand } from './commands/dev';
import { statusCommand } from './commands/status';
import { contextSaveCommand, contextLoadCommand, contextListCommand } from './commands/context';
import { suggestCommand } from './commands/suggest';
import {
  workflowCreateCommand,
  workflowListCommand,
  workflowRunCommand,
  workflowStatusCommand,
  workflowHistoryCommand,
  workflowDeleteCommand,
  workflowTemplatesCommand,
} from './commands/workflow';
import { registerWatchCommands } from './commands/watch';
import { registerMemoryCommands } from './commands/memory';
import { registerTeamCommands } from './commands/team';
import { registerCommitCommands } from './commands/commit';
import { registerOpus67Commands } from './commands/opus67';

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

// Install Stack command - Install a complete pre-configured stack
program
  .command('install-stack [stackId]')
  .description('Install a complete stack of tools from the marketplace')
  .option('--api-url <url>', 'Custom API URL (for testing)', DEFAULT_API_URL)
  .option('-p, --platform <platform>', 'Target platform (claude, gemini, openai)', 'claude')
  .option('-y, --yes', 'Skip confirmation prompt', false)
  .option('-l, --list', 'List all available stacks', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (stackId: string | undefined, options) => {
    try {
      await installStackCommand(stackId, {
        apiUrl: options.apiUrl,
        platform: options.platform,
        skipConfirm: options.yes,
        list: options.list,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Search Tools command - Search for PTC-compatible tools
program
  .command('search-tools <query>')
  .description('Search for PTC-compatible tools in the marketplace')
  .option('--api-url <url>', 'Custom API URL (for testing)', DEFAULT_API_URL)
  .option('-p, --platform <platform>', 'Target platform (claude, gemini, openai)', 'claude')
  .option('-l, --limit <number>', 'Maximum results to return', '10')
  .option('-k, --kind <kind>', 'Filter by kind (agent, skill, command, mcp)')
  .option('-q, --min-quality <number>', 'Minimum quality score (0-100)')
  .option('--json', 'Output results as JSON', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (query: string, options) => {
    try {
      await searchToolsCommand(query, {
        apiUrl: options.apiUrl,
        platform: options.platform,
        limit: parseInt(options.limit, 10),
        kind: options.kind,
        minQuality: options.minQuality ? parseInt(options.minQuality, 10) : undefined,
        json: options.json,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Init command - Initialize project for gICM
program
  .command('init')
  .description('Initialize a project for gICM (creates .gicm/ directory)')
  .option('-f, --force', 'Force reinitialization', false)
  .option('-v, --verbose', 'Show detailed output', false)
  .action(async (options) => {
    try {
      await initCommand({
        force: options.force,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Index command - Index codebase for semantic search
program
  .command('index')
  .description('Index codebase for semantic search via context-engine')
  .option('--context-engine-url <url>', 'Context engine URL')
  .option('--full', 'Force full reindex', false)
  .option('-v, --verbose', 'Show detailed output', false)
  .action(async (options) => {
    try {
      await indexCommand({
        contextEngineUrl: options.contextEngineUrl,
        full: options.full,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Setup Claude command - Configure Claude Code integration
program
  .command('setup-claude')
  .description('Configure Claude Code integration with gICM MCP server')
  .option('--mcp-port <port>', 'MCP server port', '3100')
  .option('-v, --verbose', 'Show detailed output', false)
  .action(async (options) => {
    try {
      await setupClaudeCommand({
        mcpPort: parseInt(options.mcpPort, 10),
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Dev command - Start all gICM services for local development
program
  .command('dev')
  .description('Start all gICM services for local development')
  .option('--all', 'Start everything (dashboard + autonomous engines)', false)
  .option('--autonomous', 'Start autonomous engines (Money, Growth, Product, Hub)', false)
  .option('--dashboard', 'Also start the dashboard UI', false)
  .option('--context-engine-only', 'Start only context engine', false)
  .option('--mcp-only', 'Start only MCP server', false)
  .option('--live', 'Enable LIVE mode (real money/actions)', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      await devCommand({
        all: options.all,
        autonomous: options.autonomous,
        dashboard: options.dashboard,
        contextEngineOnly: options.contextEngineOnly,
        mcpOnly: options.mcpOnly,
        live: options.live,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Status command - Show project and service status
program
  .command('status')
  .description('Show gICM project and service status')
  .option('-v, --verbose', 'Show detailed status', false)
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    try {
      await statusCommand({
        verbose: options.verbose,
        json: options.json,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Context command group - Save/load/list dev contexts
const contextCmd = program
  .command('context')
  .description('Manage dev contexts (save/load/list)');

contextCmd
  .command('save')
  .description('Save current project context to cloud')
  .option('--api-url <url>', 'Custom API URL', DEFAULT_API_URL)
  .option('-n, --name <name>', 'Context name')
  .option('-d, --description <desc>', 'Context description')
  .option('--public', 'Make context public', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      await contextSaveCommand({
        apiUrl: options.apiUrl,
        name: options.name,
        description: options.description,
        public: options.public,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

contextCmd
  .command('load <contextId>')
  .description('Load a context from cloud or local storage')
  .option('--api-url <url>', 'Custom API URL', DEFAULT_API_URL)
  .option('-f, --force', 'Overwrite existing configuration', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (contextId: string, options) => {
    try {
      await contextLoadCommand(contextId, {
        apiUrl: options.apiUrl,
        force: options.force,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

contextCmd
  .command('list')
  .description('List available contexts')
  .option('--api-url <url>', 'Custom API URL', DEFAULT_API_URL)
  .option('--mine', 'Show only my contexts', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      await contextListCommand({
        apiUrl: options.apiUrl,
        mine: options.mine,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Suggest command - Capability router
program
  .command('suggest <task>')
  .description('Analyze task and suggest relevant capabilities to install')
  .option('--api-url <url>', 'Custom API URL', DEFAULT_API_URL)
  .option('-a, --auto', 'Auto-install high-relevance capabilities (>=80%)', false)
  .option('-l, --limit <number>', 'Maximum suggestions', '5')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (task: string, options) => {
    try {
      await suggestCommand(task, {
        apiUrl: options.apiUrl,
        autoInstall: options.auto,
        limit: parseInt(options.limit, 10),
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Workflow command group - Multi-agent workflow orchestration
const workflowCmd = program
  .command('workflow')
  .description('Manage multi-agent workflows (create/run/list/status)');

workflowCmd
  .command('create <name>')
  .description('Create a new workflow')
  .option('-t, --template <template>', 'Create from template (audit-deploy, research-decide-trade, scan-all-chains)')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (name: string, options) => {
    try {
      await workflowCreateCommand(name, {
        template: options.template,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

workflowCmd
  .command('list')
  .description('List available workflows')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      await workflowListCommand({
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

workflowCmd
  .command('run <name>')
  .description('Execute a workflow')
  .option('-i, --input <json>', 'Input variables as JSON')
  .option('--dry-run', 'Preview execution without running', false)
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (name: string, options) => {
    try {
      await workflowRunCommand(name, {
        input: options.input,
        dryRun: options.dryRun,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

workflowCmd
  .command('status [id]')
  .description('Check workflow execution status')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (id: string | undefined, options) => {
    try {
      await workflowStatusCommand(id, {
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

workflowCmd
  .command('history')
  .description('View past workflow executions')
  .option('-v, --verbose', 'Show verbose output', false)
  .action(async (options) => {
    try {
      await workflowHistoryCommand({
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

workflowCmd
  .command('delete <id>')
  .description('Delete a workflow')
  .action(async (id: string) => {
    try {
      await workflowDeleteCommand(id);
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

workflowCmd
  .command('templates')
  .description('List available workflow templates')
  .action(async () => {
    try {
      await workflowTemplatesCommand();
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// Watch command group - Live file watching with auto-reindex
registerWatchCommands(program);

// Memory command group - Persistent context storage
registerMemoryCommands(program);

// Team command group - Collaborative contexts
registerTeamCommands(program);

// Commit command group - AI-powered git workflow
registerCommitCommands(program);

// OPUS67 command group - Self-Evolving AI Runtime
registerOpus67Commands(program);

// Show help if no arguments
if (process.argv.length === 2) {
  program.help();
}

// Parse arguments
program.parse(process.argv);