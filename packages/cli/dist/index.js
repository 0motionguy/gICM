#!/usr/bin/env node
"use strict";
/**
 * Aether CLI - Official command-line interface for the Aether marketplace
 * (Formerly gICM)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const add_1 = require("./commands/add");
const search_1 = require("./commands/search");
const list_1 = require("./commands/list");
const health_1 = require("./commands/health");
const validate_1 = require("./commands/validate");
const update_1 = require("./commands/update");
const create_mcp_1 = require("./commands/create-mcp");
const install_stack_1 = require("./commands/install-stack");
const search_tools_1 = require("./commands/search-tools");
const init_1 = require("./commands/init");
const index_codebase_1 = require("./commands/index-codebase");
const setup_claude_1 = require("./commands/setup-claude");
const dev_1 = require("./commands/dev");
const status_1 = require("./commands/status");
const context_1 = require("./commands/context");
const suggest_1 = require("./commands/suggest");
const workflow_1 = require("./commands/workflow");
const watch_1 = require("./commands/watch");
const memory_1 = require("./commands/memory");
const team_1 = require("./commands/team");
const commit_1 = require("./commands/commit");
const opus67_1 = require("./commands/opus67");
const program = new commander_1.Command();
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
    .action(async (items, options) => {
    try {
        await (0, add_1.addCommand)(items, {
            apiUrl: options.apiUrl,
            platform: options.platform,
            skipConfirm: options.yes,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
    .action(async (query, options) => {
    try {
        await (0, search_1.searchCommand)(query, {
            apiUrl: options.apiUrl,
            kind: options.kind,
            category: options.category,
            tags: options.tags,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, list_1.listCommand)({
            apiUrl: options.apiUrl,
            kind: options.kind,
            category: options.category,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, health_1.healthCommand)({
            apiUrl: options.apiUrl,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, validate_1.validateCommand)({
            fix: options.fix,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, update_1.updateCommand)({
            registry: options.registry,
            cli: options.cli,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, create_mcp_1.createMCPCommand)({
            name: options.name,
            skipConfirm: options.yes,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
    .action(async (stackId, options) => {
    try {
        await (0, install_stack_1.installStackCommand)(stackId, {
            apiUrl: options.apiUrl,
            platform: options.platform,
            skipConfirm: options.yes,
            list: options.list,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
    .action(async (query, options) => {
    try {
        await (0, search_tools_1.searchToolsCommand)(query, {
            apiUrl: options.apiUrl,
            platform: options.platform,
            limit: parseInt(options.limit, 10),
            kind: options.kind,
            minQuality: options.minQuality ? parseInt(options.minQuality, 10) : undefined,
            json: options.json,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, init_1.initCommand)({
            force: options.force,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, index_codebase_1.indexCommand)({
            contextEngineUrl: options.contextEngineUrl,
            full: options.full,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, setup_claude_1.setupClaudeCommand)({
            mcpPort: parseInt(options.mcpPort, 10),
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, dev_1.devCommand)({
            all: options.all,
            autonomous: options.autonomous,
            dashboard: options.dashboard,
            contextEngineOnly: options.contextEngineOnly,
            mcpOnly: options.mcpOnly,
            live: options.live,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, status_1.statusCommand)({
            verbose: options.verbose,
            json: options.json,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, context_1.contextSaveCommand)({
            apiUrl: options.apiUrl,
            name: options.name,
            description: options.description,
            public: options.public,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
contextCmd
    .command('load <contextId>')
    .description('Load a context from cloud or local storage')
    .option('--api-url <url>', 'Custom API URL', DEFAULT_API_URL)
    .option('-f, --force', 'Overwrite existing configuration', false)
    .option('-v, --verbose', 'Show verbose output', false)
    .action(async (contextId, options) => {
    try {
        await (0, context_1.contextLoadCommand)(contextId, {
            apiUrl: options.apiUrl,
            force: options.force,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
        await (0, context_1.contextListCommand)({
            apiUrl: options.apiUrl,
            mine: options.mine,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
    .action(async (task, options) => {
    try {
        await (0, suggest_1.suggestCommand)(task, {
            apiUrl: options.apiUrl,
            autoInstall: options.auto,
            limit: parseInt(options.limit, 10),
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
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
    .action(async (name, options) => {
    try {
        await (0, workflow_1.workflowCreateCommand)(name, {
            template: options.template,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
workflowCmd
    .command('list')
    .description('List available workflows')
    .option('-v, --verbose', 'Show verbose output', false)
    .action(async (options) => {
    try {
        await (0, workflow_1.workflowListCommand)({
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
workflowCmd
    .command('run <name>')
    .description('Execute a workflow')
    .option('-i, --input <json>', 'Input variables as JSON')
    .option('--dry-run', 'Preview execution without running', false)
    .option('-v, --verbose', 'Show verbose output', false)
    .action(async (name, options) => {
    try {
        await (0, workflow_1.workflowRunCommand)(name, {
            input: options.input,
            dryRun: options.dryRun,
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
workflowCmd
    .command('status [id]')
    .description('Check workflow execution status')
    .option('-v, --verbose', 'Show verbose output', false)
    .action(async (id, options) => {
    try {
        await (0, workflow_1.workflowStatusCommand)(id, {
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
workflowCmd
    .command('history')
    .description('View past workflow executions')
    .option('-v, --verbose', 'Show verbose output', false)
    .action(async (options) => {
    try {
        await (0, workflow_1.workflowHistoryCommand)({
            verbose: options.verbose,
        });
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
workflowCmd
    .command('delete <id>')
    .description('Delete a workflow')
    .action(async (id) => {
    try {
        await (0, workflow_1.workflowDeleteCommand)(id);
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
workflowCmd
    .command('templates')
    .description('List available workflow templates')
    .action(async () => {
    try {
        await (0, workflow_1.workflowTemplatesCommand)();
    }
    catch (error) {
        console.error(chalk_1.default.red(`\n✗ ${error.message}\n`));
        process.exit(1);
    }
});
// Watch command group - Live file watching with auto-reindex
(0, watch_1.registerWatchCommands)(program);
// Memory command group - Persistent context storage
(0, memory_1.registerMemoryCommands)(program);
// Team command group - Collaborative contexts
(0, team_1.registerTeamCommands)(program);
// Commit command group - AI-powered git workflow
(0, commit_1.registerCommitCommands)(program);
// OPUS67 command group - Self-Evolving AI Runtime
(0, opus67_1.registerOpus67Commands)(program);
// Show help if no arguments
if (process.argv.length === 2) {
    program.help();
}
// Parse arguments
program.parse(process.argv);
//# sourceMappingURL=index.js.map