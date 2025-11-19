/**
 * Template Commands Extension for Aether CLI
 * Add these to the main index.ts file
 */

// Import at top of file (after other imports):
import {
  templateAddCommand,
  templateCreateCommand,
  templateDeployCommand,
  templateListCommand,
  templateSearchCommand,
  templateSyncCommand,
} from './commands/template';

// Add after the create-mcp command (around line 170):

// Template commands - Manage and deploy templates
const templateCmd = program
  .command('template')
  .description('Manage and deploy templates from Aether marketplace');

// template add
templateCmd
  .command('add <slug>')
  .description('Download and install a template locally')
  .option('--api-url <url>', 'Custom API URL', 'http://localhost:3001/api')
  .option('-y, --yes', 'Skip confirmation', false)
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (slug: string, options) => {
    try {
      await templateAddCommand(slug, {
        apiUrl: options.apiUrl,
        skipConfirm: options.yes,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// template create
templateCmd
  .command('create <name>')
  .description('Create a new project from a template')
  .option('--from <slug>', 'Template slug to use')
  .option('--api-url <url>', 'Custom API URL', 'http://localhost:3001/api')
  .option('-y, --yes', 'Skip confirmation', false)
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (name: string, options) => {
    try {
      await templateCreateCommand(name, {
        from: options.from,
        apiUrl: options.apiUrl,
        skipConfirm: options.yes,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// template deploy
templateCmd
  .command('deploy [path]')
  .description('Deploy project to a platform')
  .option('--to <platform>', 'Target platform (bolt, lovable, local)')
  .option('--name <name>', 'Project name')
  .option('--api-url <url>', 'Custom API URL', 'http://localhost:3001/api')
  .option('-y, --yes', 'Skip confirmation', false)
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (projectPath: string = '.', options) => {
    try {
      await templateDeployCommand(projectPath, {
        to: options.to,
        name: options.name,
        apiUrl: options.apiUrl,
        skipConfirm: options.yes,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// template list
templateCmd
  .command('list')
  .description('List all available templates')
  .option('--category <category>', 'Filter by category')
  .option('--api-url <url>', 'Custom API URL', 'http://localhost:3001/api')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    try {
      await templateListCommand({
        category: options.category,
        apiUrl: options.apiUrl,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// template search
templateCmd
  .command('search <query>')
  .description('Search for templates')
  .option('--api-url <url>', 'Custom API URL', 'http://localhost:3001/api')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (query: string, options) => {
    try {
      await templateSearchCommand(query, {
        apiUrl: options.apiUrl,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });

// template sync
templateCmd
  .command('sync [path]')
  .description('Sync project with platform')
  .option('--platform <platform>', 'Platform to sync with')
  .option('--api-url <url>', 'Custom API URL', 'http://localhost:3001/api')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (projectPath: string = '.', options) => {
    try {
      await templateSyncCommand(projectPath, {
        platform: options.platform,
        apiUrl: options.apiUrl,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error(chalk.red(`\n✗ ${(error as Error).message}\n`));
      process.exit(1);
    }
  });
