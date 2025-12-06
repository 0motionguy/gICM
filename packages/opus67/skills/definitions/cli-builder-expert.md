# CLI Builder Expert

> **ID:** `cli-builder-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

This skill provides comprehensive expertise in building production-ready command-line interfaces (CLIs) using Node.js. It covers the entire spectrum from argument parsing and interactive prompts to output formatting, configuration management, error handling, and npm distribution. You'll learn to build CLIs that are intuitive, robust, and professional-grade.

The skill emphasizes modern tooling (Commander.js, Inquirer, Chalk, Ora) and best practices for creating tools that developers love to use.

## When to Use

Load this skill when you need to:

- **Build a new CLI tool** - From scratch scaffolding to distribution
- **Add interactivity** - Prompts, confirmations, multi-select menus
- **Improve CLI UX** - Colors, spinners, progress bars, tables
- **Parse complex commands** - Subcommands, options, variadic arguments
- **Manage CLI configuration** - Config files, environment variables, defaults
- **Handle errors gracefully** - Exit codes, help text, validation messages
- **Package for distribution** - npm publishing, binary executables, versioning
- **Debug CLI issues** - Argument parsing bugs, terminal compatibility

This skill is essential for building developer tools, automation scripts, build systems, database migration tools, project scaffolders, and any application with a terminal interface.

## Core Capabilities

### 1. Command Parsing (Commander.js)

Commander.js is the de facto standard for parsing command-line arguments in Node.js. It provides a declarative API for defining commands, options, and arguments.

#### Basic CLI Structure

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('myapp')
  .description('A powerful CLI tool for developers')
  .version(packageJson.version, '-v, --version', 'Display version number');

program
  .option('-d, --debug', 'Enable debug mode')
  .option('-c, --config <path>', 'Path to config file', './config.json')
  .option('-e, --env <environment>', 'Environment to use', 'development')
  .option('--no-color', 'Disable colored output');

program.parse(process.argv);

const options = program.opts();

if (options.debug) {
  console.log('Debug mode enabled');
  console.log('Options:', options);
}
```

#### Subcommands with Arguments

```typescript
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

// Database command with subcommands
const db = program
  .command('db')
  .description('Database management commands');

db.command('migrate')
  .description('Run database migrations')
  .option('-d, --dry-run', 'Show what would be migrated without running')
  .option('-s, --step <number>', 'Number of migrations to run', '0')
  .action(async (options) => {
    console.log(chalk.blue('Running migrations...'));

    if (options.dryRun) {
      console.log(chalk.yellow('DRY RUN - No changes will be made'));
    }

    const step = parseInt(options.step, 10);
    if (step > 0) {
      console.log(`Running ${step} migration(s)`);
    } else {
      console.log('Running all pending migrations');
    }
  });

db.command('rollback')
  .description('Rollback database migrations')
  .option('-s, --steps <number>', 'Number of steps to rollback', '1')
  .action(async (options) => {
    const steps = parseInt(options.steps, 10);
    console.log(chalk.red(`Rolling back ${steps} migration(s)...`));
  });

db.command('seed')
  .description('Seed the database')
  .argument('<seeder>', 'Name of the seeder to run')
  .option('--fresh', 'Drop all tables before seeding')
  .action(async (seeder, options) => {
    if (options.fresh) {
      console.log(chalk.red('Dropping all tables...'));
    }
    console.log(chalk.green(`Running seeder: ${seeder}`));
  });

// Init command with required and optional arguments
program
  .command('init')
  .description('Initialize a new project')
  .argument('<name>', 'Project name')
  .argument('[directory]', 'Target directory', '.')
  .option('-t, --template <name>', 'Template to use', 'default')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-install', 'Skip npm install')
  .action(async (name, directory, options) => {
    console.log(chalk.bold.blue(`Initializing project: ${name}`));
    console.log(chalk.gray(`Directory: ${directory}`));
    console.log(chalk.gray(`Template: ${options.template}`));

    if (!options.skipGit) {
      console.log(chalk.green('Initializing git repository...'));
    }

    if (!options.skipInstall) {
      console.log(chalk.green('Installing dependencies...'));
    }
  });

// Variadic arguments
program
  .command('deploy')
  .description('Deploy services')
  .argument('<services...>', 'Services to deploy')
  .option('-e, --env <environment>', 'Target environment', 'staging')
  .action(async (services, options) => {
    console.log(chalk.blue(`Deploying to ${options.env}:`));
    services.forEach(service => {
      console.log(chalk.green(`  ✓ ${service}`));
    });
  });

program.parse();
```

#### Custom Help and Error Handling

```typescript
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

// Custom help
program.addHelpText('before', chalk.bold.blue('\n🚀 MyApp CLI Tool\n'));
program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.gray('$')} myapp init my-project
  ${chalk.gray('$')} myapp db migrate --dry-run
  ${chalk.gray('$')} myapp deploy api web --env production

${chalk.bold('Documentation:')}
  https://docs.example.com

${chalk.bold('Support:')}
  https://github.com/example/myapp/issues
`);

// Custom error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (err: any) {
  if (err.code === 'commander.missingArgument') {
    console.error(chalk.red('Error:'), err.message);
    console.log(chalk.yellow('\nRun with --help for usage information'));
  } else if (err.code === 'commander.unknownOption') {
    console.error(chalk.red('Error:'), err.message);
  } else {
    console.error(chalk.red('Unexpected error:'), err.message);
  }
  process.exit(1);
}

// No command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

#### Environment-Aware Configuration

```typescript
import { Command } from 'commander';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';

const program = new Command();

// Load environment-specific .env file
function loadEnvironment(env: string) {
  const envFile = `.env.${env}`;
  const envPath = resolve(process.cwd(), envFile);

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(chalk.green(`Loaded ${envFile}`));
  } else {
    dotenv.config(); // Load default .env
  }
}

program
  .option('-e, --env <environment>', 'Environment', 'development')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    loadEnvironment(options.env);
  });

program
  .command('start')
  .description('Start the application')
  .action(() => {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database:', process.env.DATABASE_URL);
  });

program.parse();
```

### 2. Interactive Prompts (@inquirer/prompts)

Modern Inquirer provides a modular approach to terminal prompts with full TypeScript support.

#### Basic Prompts

```typescript
import {
  input,
  confirm,
  select,
  checkbox,
  password,
  number,
  editor
} from '@inquirer/prompts';
import chalk from 'chalk';

interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  license: string;
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm';
  typescript: boolean;
}

async function collectProjectInfo(): Promise<ProjectConfig> {
  console.log(chalk.bold.blue('\n📦 Project Setup\n'));

  const name = await input({
    message: 'Project name:',
    default: 'my-project',
    validate: (value) => {
      if (!value.trim()) {
        return 'Project name is required';
      }
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Project name must be lowercase with hyphens only';
      }
      return true;
    },
  });

  const description = await input({
    message: 'Description:',
    default: 'A new project',
  });

  const author = await input({
    message: 'Author:',
    default: process.env.USER || '',
  });

  const license = await select({
    message: 'License:',
    choices: [
      { name: 'MIT', value: 'MIT' },
      { name: 'Apache-2.0', value: 'Apache-2.0' },
      { name: 'GPL-3.0', value: 'GPL-3.0' },
      { name: 'ISC', value: 'ISC' },
      { name: 'Unlicensed', value: 'UNLICENSED' },
    ],
    default: 'MIT',
  });

  const features = await checkbox({
    message: 'Select features:',
    choices: [
      { name: 'ESLint', value: 'eslint', checked: true },
      { name: 'Prettier', value: 'prettier', checked: true },
      { name: 'Jest', value: 'jest' },
      { name: 'Vitest', value: 'vitest' },
      { name: 'Husky (Git hooks)', value: 'husky' },
      { name: 'GitHub Actions', value: 'github-actions' },
      { name: 'Docker', value: 'docker' },
    ],
    validate: (answer) => {
      if (answer.length < 1) {
        return 'You must select at least one feature';
      }
      return true;
    },
  });

  const packageManager = await select({
    message: 'Package manager:',
    choices: [
      { name: 'npm', value: 'npm' as const },
      { name: 'yarn', value: 'yarn' as const },
      { name: 'pnpm', value: 'pnpm' as const },
    ],
    default: 'npm' as const,
  });

  const typescript = await confirm({
    message: 'Use TypeScript?',
    default: true,
  });

  return {
    name,
    description,
    author,
    license,
    features,
    packageManager,
    typescript,
  };
}
```

#### Advanced Prompts with Conditional Logic

```typescript
import { input, select, confirm, password } from '@inquirer/prompts';
import chalk from 'chalk';

interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'sqlite' | 'mongodb';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  poolSize?: number;
}

async function configureDatabaseConnection(): Promise<DatabaseConfig> {
  console.log(chalk.bold.blue('\n🗄️  Database Configuration\n'));

  const type = await select({
    message: 'Database type:',
    choices: [
      { name: 'PostgreSQL', value: 'postgres' as const },
      { name: 'MySQL', value: 'mysql' as const },
      { name: 'SQLite', value: 'sqlite' as const },
      { name: 'MongoDB', value: 'mongodb' as const },
    ],
  });

  const config: DatabaseConfig = { type, database: '' };

  if (type === 'sqlite') {
    config.database = await input({
      message: 'Database file path:',
      default: './database.sqlite',
    });
  } else {
    config.host = await input({
      message: 'Host:',
      default: 'localhost',
    });

    const defaultPort =
      type === 'postgres' ? 5432 :
      type === 'mysql' ? 3306 :
      type === 'mongodb' ? 27017 : 5432;

    config.port = await input({
      message: 'Port:',
      default: defaultPort.toString(),
      validate: (value) => {
        const port = parseInt(value, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          return 'Port must be a number between 1 and 65535';
        }
        return true;
      },
    }).then(val => parseInt(val, 10));

    config.database = await input({
      message: 'Database name:',
      validate: (value) => value.trim() ? true : 'Database name is required',
    });

    config.username = await input({
      message: 'Username:',
      default: type === 'postgres' ? 'postgres' : 'root',
    });

    config.password = await password({
      message: 'Password:',
      mask: '*',
    });

    const advanced = await confirm({
      message: 'Configure advanced options?',
      default: false,
    });

    if (advanced) {
      config.ssl = await confirm({
        message: 'Use SSL?',
        default: false,
      });

      config.poolSize = await input({
        message: 'Connection pool size:',
        default: '10',
        validate: (value) => {
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 1 || num > 100) {
            return 'Pool size must be between 1 and 100';
          }
          return true;
        },
      }).then(val => parseInt(val, 10));
    }
  }

  return config;
}
```

#### Multi-Step Wizard

```typescript
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

interface DeploymentConfig {
  environment: string;
  services: string[];
  region: string;
  autoScaling: boolean;
  notifications: {
    email?: string;
    slack?: string;
  };
}

async function deploymentWizard(): Promise<DeploymentConfig> {
  console.log(chalk.bold.blue('\n🚀 Deployment Wizard\n'));

  // Step 1: Environment
  console.log(chalk.bold('Step 1/4: Environment Selection'));
  const environment = await select({
    message: 'Select environment:',
    choices: [
      { name: '🧪 Development', value: 'development' },
      { name: '🎭 Staging', value: 'staging' },
      { name: '🏭 Production', value: 'production' },
    ],
  });

  // Step 2: Services
  console.log(chalk.bold('\nStep 2/4: Service Selection'));
  const allServices = ['api', 'web', 'worker', 'cache', 'queue'];
  const services: string[] = [];

  for (const service of allServices) {
    const include = await confirm({
      message: `Deploy ${service}?`,
      default: true,
    });
    if (include) {
      services.push(service);
    }
  }

  if (services.length === 0) {
    console.log(chalk.red('Error: At least one service must be selected'));
    process.exit(1);
  }

  // Step 3: Region
  console.log(chalk.bold('\nStep 3/4: Region Selection'));
  const region = await select({
    message: 'Select region:',
    choices: [
      { name: 'US East (N. Virginia)', value: 'us-east-1' },
      { name: 'US West (Oregon)', value: 'us-west-2' },
      { name: 'EU (Ireland)', value: 'eu-west-1' },
      { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
    ],
  });

  // Step 4: Configuration
  console.log(chalk.bold('\nStep 4/4: Advanced Configuration'));
  const autoScaling = await confirm({
    message: 'Enable auto-scaling?',
    default: environment === 'production',
  });

  const notifications: DeploymentConfig['notifications'] = {};

  const enableNotifications = await confirm({
    message: 'Enable deployment notifications?',
    default: environment === 'production',
  });

  if (enableNotifications) {
    const emailNotif = await confirm({
      message: 'Email notifications?',
      default: true,
    });

    if (emailNotif) {
      notifications.email = await input({
        message: 'Email address:',
        validate: (value) => {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Invalid email address';
          }
          return true;
        },
      });
    }

    const slackNotif = await confirm({
      message: 'Slack notifications?',
      default: false,
    });

    if (slackNotif) {
      notifications.slack = await input({
        message: 'Slack webhook URL:',
        validate: (value) => {
          if (!value.startsWith('https://hooks.slack.com/')) {
            return 'Invalid Slack webhook URL';
          }
          return true;
        },
      });
    }
  }

  return {
    environment,
    services,
    region,
    autoScaling,
    notifications,
  };
}
```

### 3. Output Formatting (chalk, ora, cli-table3)

Professional CLIs need clear, colorful, and informative output.

#### Colors with Chalk

```typescript
import chalk from 'chalk';

// Basic colors
console.log(chalk.blue('Info message'));
console.log(chalk.green('Success message'));
console.log(chalk.yellow('Warning message'));
console.log(chalk.red('Error message'));
console.log(chalk.gray('Debug message'));

// Modifiers
console.log(chalk.bold('Bold text'));
console.log(chalk.italic('Italic text'));
console.log(chalk.underline('Underlined text'));
console.log(chalk.dim('Dimmed text'));

// Combinations
console.log(chalk.bold.blue('Bold blue'));
console.log(chalk.red.bgYellow('Red on yellow background'));
console.log(chalk.green.inverse('Inverted green'));

// Custom theme
const theme = {
  success: chalk.bold.green,
  error: chalk.bold.red,
  warning: chalk.bold.yellow,
  info: chalk.bold.blue,
  code: chalk.cyan,
  path: chalk.gray.underline,
  command: chalk.magenta,
};

console.log(theme.success('✓ Build completed'));
console.log(theme.error('✗ Build failed'));
console.log(theme.warning('⚠ Deprecated API used'));
console.log(theme.info('ℹ Starting server...'));
console.log(theme.code('const x = 42;'));
console.log(theme.path('/path/to/file'));
console.log(theme.command('npm install'));
```

#### Spinners with Ora

```typescript
import ora, { Ora } from 'ora';
import chalk from 'chalk';

async function performTask() {
  const spinner = ora('Initializing...').start();

  try {
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));
    spinner.text = 'Loading configuration...';

    await new Promise(resolve => setTimeout(resolve, 1000));
    spinner.text = 'Connecting to database...';

    await new Promise(resolve => setTimeout(resolve, 1000));
    spinner.succeed('Task completed successfully');
  } catch (error) {
    spinner.fail('Task failed');
    throw error;
  }
}

// Multi-step process
async function buildProject() {
  const steps = [
    { name: 'Cleaning build directory', duration: 500 },
    { name: 'Compiling TypeScript', duration: 2000 },
    { name: 'Bundling assets', duration: 1500 },
    { name: 'Minifying code', duration: 1000 },
    { name: 'Generating source maps', duration: 800 },
  ];

  for (const step of steps) {
    const spinner = ora(step.name).start();
    await new Promise(resolve => setTimeout(resolve, step.duration));
    spinner.succeed();
  }

  console.log(chalk.bold.green('\n✓ Build completed successfully\n'));
}

// Parallel tasks with custom spinners
async function deployServices() {
  const spinners: Record<string, Ora> = {
    api: ora({ text: 'Deploying API...', color: 'blue' }),
    web: ora({ text: 'Deploying Web...', color: 'green' }),
    worker: ora({ text: 'Deploying Worker...', color: 'yellow' }),
  };

  spinners.api.start();
  spinners.web.start();
  spinners.worker.start();

  // Simulate async deployment
  setTimeout(() => spinners.api.succeed('API deployed'), 1000);
  setTimeout(() => spinners.web.succeed('Web deployed'), 1500);
  setTimeout(() => spinners.worker.succeed('Worker deployed'), 2000);
}
```

#### Progress Bars

```typescript
import cliProgress from 'cli-progress';
import chalk from 'chalk';

// Single progress bar
function downloadFile(size: number) {
  const bar = new cliProgress.SingleBar({
    format: `Downloading |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total} MB`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  bar.start(size, 0);

  const interval = setInterval(() => {
    bar.increment();
    if (bar.value >= size) {
      bar.stop();
      clearInterval(interval);
      console.log(chalk.green('✓ Download complete'));
    }
  }, 100);
}

// Multi-bar progress
function buildMultipleProjects() {
  const multibar = new cliProgress.MultiBar({
    format: '{project} |{bar}| {percentage}% | {value}/{total}',
    clearOnComplete: false,
    hideCursor: true,
  });

  const projects = [
    { name: 'API     ', total: 50 },
    { name: 'Web     ', total: 75 },
    { name: 'Mobile  ', total: 100 },
  ];

  const bars = projects.map(project =>
    multibar.create(project.total, 0, { project: project.name })
  );

  const intervals = bars.map((bar, i) =>
    setInterval(() => {
      bar.increment();
      if (bar.value >= projects[i].total) {
        clearInterval(intervals[i]);
      }
    }, Math.random() * 100 + 50)
  );

  setTimeout(() => {
    multibar.stop();
    console.log(chalk.green('\n✓ All projects built\n'));
  }, 8000);
}
```

#### Tables with cli-table3

```typescript
import Table from 'cli-table3';
import chalk from 'chalk';

// Basic table
function showDatabaseStatus() {
  const table = new Table({
    head: [
      chalk.bold.blue('Service'),
      chalk.bold.blue('Status'),
      chalk.bold.blue('Uptime'),
      chalk.bold.blue('Memory'),
    ],
    colWidths: [20, 15, 15, 15],
  });

  table.push(
    ['PostgreSQL', chalk.green('Running'), '5d 3h 22m', '256 MB'],
    ['Redis', chalk.green('Running'), '5d 3h 22m', '64 MB'],
    ['RabbitMQ', chalk.yellow('Starting'), '0h 0m 5s', '128 MB'],
    ['MongoDB', chalk.red('Stopped'), '-', '-']
  );

  console.log(table.toString());
}

// Colored table with alignment
function showDeploymentSummary() {
  const table = new Table({
    head: [
      chalk.bold('Service'),
      chalk.bold('Environment'),
      chalk.bold('Version'),
      chalk.bold('Instances'),
      chalk.bold('Status'),
    ],
    colAligns: ['left', 'left', 'center', 'right', 'center'],
    style: {
      head: [],
      border: ['gray'],
    },
  });

  table.push(
    [
      'api',
      'production',
      'v2.3.1',
      '3',
      chalk.green('✓ Healthy'),
    ],
    [
      'web',
      'production',
      'v1.5.0',
      '5',
      chalk.green('✓ Healthy'),
    ],
    [
      'worker',
      'production',
      'v2.1.0',
      '2',
      chalk.yellow('⚠ Warning'),
    ],
    [
      'cache',
      'production',
      'v1.0.0',
      '1',
      chalk.red('✗ Down'),
    ]
  );

  console.log('\n' + table.toString() + '\n');
}

// Nested tables
function showProjectStructure() {
  const table = new Table({
    head: [chalk.bold('Package'), chalk.bold('Version'), chalk.bold('Dependencies')],
    colWidths: [30, 15, 50],
  });

  table.push(
    ['@myapp/core', '1.0.0', 'lodash, axios'],
    ['@myapp/api', '2.1.0', '@myapp/core, express, pg'],
    ['@myapp/web', '1.5.0', '@myapp/core, react, next']
  );

  console.log(table.toString());
}
```

### 4. Configuration Management

Professional CLIs need flexible configuration from multiple sources.

#### Config File Management

```typescript
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

interface Config {
  apiKey?: string;
  endpoint?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor(appName: string) {
    // Config in user home directory
    this.configPath = join(homedir(), `.${appName}rc.json`);
    this.config = this.load();
  }

  load(): Config {
    if (!existsSync(this.configPath)) {
      return this.getDefaults();
    }

    try {
      const content = readFileSync(this.configPath, 'utf-8');
      return { ...this.getDefaults(), ...JSON.parse(content) };
    } catch (error) {
      console.error(chalk.yellow('Warning: Failed to parse config file, using defaults'));
      return this.getDefaults();
    }
  }

  save(config: Partial<Config>) {
    this.config = { ...this.config, ...config };
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    console.log(chalk.green(`✓ Config saved to ${this.configPath}`));
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  set<K extends keyof Config>(key: K, value: Config[K]) {
    this.config[key] = value;
    this.save(this.config);
  }

  delete(key: keyof Config) {
    delete this.config[key];
    this.save(this.config);
  }

  show() {
    console.log(chalk.bold('\nCurrent Configuration:\n'));
    Object.entries(this.config).forEach(([key, value]) => {
      console.log(chalk.blue(key.padEnd(15)), value);
    });
    console.log(chalk.gray(`\nConfig file: ${this.configPath}\n`));
  }

  reset() {
    this.config = this.getDefaults();
    this.save(this.config);
    console.log(chalk.green('✓ Config reset to defaults'));
  }

  private getDefaults(): Config {
    return {
      endpoint: 'https://api.example.com',
      timeout: 30000,
      retries: 3,
      debug: false,
    };
  }
}

// Usage in CLI
import { Command } from 'commander';

const program = new Command();
const config = new ConfigManager('myapp');

program
  .command('config')
  .description('Manage configuration');

program
  .command('config:get <key>')
  .description('Get configuration value')
  .action((key) => {
    const value = config.get(key as keyof Config);
    if (value !== undefined) {
      console.log(value);
    } else {
      console.error(chalk.red(`Config key "${key}" not found`));
      process.exit(1);
    }
  });

program
  .command('config:set <key> <value>')
  .description('Set configuration value')
  .action((key, value) => {
    config.set(key as keyof Config, value);
  });

program
  .command('config:show')
  .description('Show all configuration')
  .action(() => {
    config.show();
  });

program
  .command('config:reset')
  .description('Reset to defaults')
  .action(() => {
    config.reset();
  });
```

#### Environment Variable Support

```typescript
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';

interface AppConfig {
  apiKey: string;
  endpoint: string;
  timeout: number;
  retries: number;
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

class EnvironmentConfig {
  private config: AppConfig;

  constructor() {
    this.loadEnvironment();
    this.config = this.buildConfig();
  }

  private loadEnvironment() {
    // Load .env file if it exists
    const envPath = resolve(process.cwd(), '.env');
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }

    // Also try .env.local
    const localEnvPath = resolve(process.cwd(), '.env.local');
    if (existsSync(localEnvPath)) {
      dotenv.config({ path: localEnvPath, override: true });
    }
  }

  private buildConfig(): AppConfig {
    return {
      apiKey: this.requireEnv('API_KEY'),
      endpoint: process.env.API_ENDPOINT || 'https://api.example.com',
      timeout: parseInt(process.env.TIMEOUT || '30000', 10),
      retries: parseInt(process.env.RETRIES || '3', 10),
      debug: process.env.DEBUG === 'true',
      logLevel: (process.env.LOG_LEVEL as AppConfig['logLevel']) || 'info',
    };
  }

  private requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      console.error(chalk.red(`Error: Required environment variable ${key} is not set`));
      console.log(chalk.yellow('Set it in .env file or export it:'));
      console.log(chalk.gray(`  export ${key}=your-value`));
      process.exit(1);
    }
    return value;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }
}

// Merge config sources with priority
class MergedConfig {
  private fileConfig: ConfigManager;
  private envConfig: EnvironmentConfig;

  constructor(appName: string) {
    this.fileConfig = new ConfigManager(appName);
    this.envConfig = new EnvironmentConfig();
  }

  // Priority: CLI args > env vars > config file > defaults
  get<K extends keyof Config>(key: K, cliValue?: any): any {
    if (cliValue !== undefined) return cliValue;

    const envValue = this.envConfig.get(key as any);
    if (envValue !== undefined) return envValue;

    return this.fileConfig.get(key);
  }
}
```

### 5. Error Handling

Robust error handling is critical for production CLIs.

#### Error Classes and Exit Codes

```typescript
export class CLIError extends Error {
  constructor(
    message: string,
    public exitCode: number = 1,
    public showHelp: boolean = false
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

export class ValidationError extends CLIError {
  constructor(message: string) {
    super(message, 1, true);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends CLIError {
  constructor(message: string, public url?: string) {
    super(`Network error: ${message}`, 2);
    this.name = 'NetworkError';
  }
}

export class ConfigError extends CLIError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 3);
    this.name = 'ConfigError';
  }
}

export class FileSystemError extends CLIError {
  constructor(message: string, public path?: string) {
    super(`File system error: ${message}`, 4);
    this.name = 'FileSystemError';
  }
}

// Exit codes
export enum ExitCode {
  Success = 0,
  GeneralError = 1,
  NetworkError = 2,
  ConfigError = 3,
  FileSystemError = 4,
  PermissionError = 5,
  NotFound = 6,
  Timeout = 7,
}
```

#### Global Error Handler

```typescript
import chalk from 'chalk';
import { Command } from 'commander';
import { CLIError, ExitCode } from './errors';

export function setupErrorHandling(program: Command) {
  // Uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error(chalk.bold.red('\n✗ Uncaught Exception:\n'));
    console.error(chalk.red(error.message));
    if (process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(ExitCode.GeneralError);
  });

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    console.error(chalk.bold.red('\n✗ Unhandled Promise Rejection:\n'));
    console.error(chalk.red(reason?.message || reason));
    if (process.env.DEBUG && reason?.stack) {
      console.error(chalk.gray(reason.stack));
    }
    process.exit(ExitCode.GeneralError);
  });

  // SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nInterrupted by user'));
    process.exit(130); // Standard exit code for SIGINT
  });

  // SIGTERM
  process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n\nTerminated'));
    process.exit(143); // Standard exit code for SIGTERM
  });
}

export function handleError(error: Error, program: Command) {
  if (error instanceof CLIError) {
    console.error(chalk.bold.red(`\n✗ ${error.name}:\n`));
    console.error(chalk.red(error.message));

    if (error.showHelp) {
      console.log(chalk.yellow('\nRun with --help for usage information\n'));
    }

    if (process.env.DEBUG && error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }

    process.exit(error.exitCode);
  } else {
    console.error(chalk.bold.red('\n✗ Unexpected Error:\n'));
    console.error(chalk.red(error.message));

    if (error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }

    console.log(chalk.yellow('\nThis is likely a bug. Please report it at:'));
    console.log(chalk.blue('https://github.com/example/myapp/issues\n'));

    process.exit(ExitCode.GeneralError);
  }
}

// Usage
import { Command } from 'commander';

const program = new Command();
setupErrorHandling(program);

program
  .command('deploy')
  .action(async () => {
    try {
      await deploy();
    } catch (error) {
      handleError(error as Error, program);
    }
  });
```

#### Validation with Helpful Messages

```typescript
import chalk from 'chalk';
import { ValidationError } from './errors';
import { existsSync } from 'fs';

export class Validator {
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError(
        `Invalid email address: ${email}\n\n` +
        `Example: user@example.com`
      );
    }
  }

  static validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new ValidationError(
        `Invalid URL: ${url}\n\n` +
        `URL must include protocol (http:// or https://)\n` +
        `Example: https://api.example.com`
      );
    }
  }

  static validatePort(port: string | number): void {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new ValidationError(
        `Invalid port: ${port}\n\n` +
        `Port must be a number between 1 and 65535`
      );
    }
  }

  static validatePath(path: string, shouldExist: boolean = true): void {
    if (shouldExist && !existsSync(path)) {
      throw new ValidationError(
        `Path does not exist: ${path}\n\n` +
        `Please check the path and try again`
      );
    }
  }

  static validateEnum<T>(
    value: string,
    enumValues: T[],
    name: string
  ): void {
    if (!enumValues.includes(value as any)) {
      throw new ValidationError(
        `Invalid ${name}: ${value}\n\n` +
        `Valid options are:\n` +
        enumValues.map(v => `  - ${v}`).join('\n')
      );
    }
  }

  static validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(
        `${fieldName} is required\n\n` +
        `Please provide a value for ${fieldName}`
      );
    }
  }
}
```

### 6. Distribution & Publishing

Getting your CLI into users' hands.

#### package.json Configuration

```json
{
  "name": "my-awesome-cli",
  "version": "1.0.0",
  "description": "A powerful CLI tool for developers",
  "main": "dist/index.js",
  "bin": {
    "myapp": "./dist/cli.js",
    "myapp-dev": "./dist/cli-dev.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/cli.ts",
    "prepublishOnly": "npm run build && npm test",
    "test": "vitest run",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "cli",
    "tool",
    "automation",
    "developer-tools"
  ],
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "@inquirer/prompts": "^3.3.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.1",
    "cli-table3": "^0.6.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "vitest": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

#### TypeScript Configuration for CLIs

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### CLI Entry Point with Shebang

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { setupErrorHandling } from './utils/errors.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

// Setup global error handling
setupErrorHandling(program);

// Configure program
program
  .name('myapp')
  .description(packageJson.description)
  .version(packageJson.version);

// Import commands
import { initCommand } from './commands/init.js';
import { deployCommand } from './commands/deploy.js';
import { configCommand } from './commands/config.js';

// Register commands
program.addCommand(initCommand);
program.addCommand(deployCommand);
program.addCommand(configCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

#### Publishing Workflow

**Step 1: Version Bump**
```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

**Step 2: Build & Test**
```bash
npm run build
npm test
```

**Step 3: Publish to npm**
```bash
# First time: login to npm
npm login

# Publish (respects prepublishOnly script)
npm publish

# Publish with tag
npm publish --tag beta
```

**Step 4: Create GitHub Release**
```bash
# Tag is already created by npm version
git push --follow-tags

# Create GitHub release
gh release create v1.0.0 --notes "Release notes here"
```

#### GitHub Actions CI/CD

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

#### Automated Changelog Generation

```typescript
// scripts/changelog.ts
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

interface Commit {
  hash: string;
  type: string;
  scope?: string;
  subject: string;
}

function parseCommit(line: string): Commit | null {
  const match = line.match(/^(\w+)(?:\(([^)]+)\))?: (.+)$/);
  if (!match) return null;

  return {
    hash: '',
    type: match[1],
    scope: match[2],
    subject: match[3],
  };
}

function generateChangelog() {
  // Get commits since last tag
  let lastTag: string;
  try {
    lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
  } catch {
    lastTag = '';
  }

  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const commits = execSync(`git log ${range} --oneline`, { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);

  const features: string[] = [];
  const fixes: string[] = [];
  const others: string[] = [];

  commits.forEach(line => {
    const commit = parseCommit(line.split(' ').slice(1).join(' '));
    if (!commit) return;

    const scope = commit.scope ? `**${commit.scope}:** ` : '';
    const message = `- ${scope}${commit.subject}`;

    if (commit.type === 'feat') features.push(message);
    else if (commit.type === 'fix') fixes.push(message);
    else others.push(message);
  });

  const version = JSON.parse(readFileSync('package.json', 'utf-8')).version;
  const date = new Date().toISOString().split('T')[0];

  let changelog = `## [${version}] - ${date}\n\n`;

  if (features.length) {
    changelog += `### Features\n\n${features.join('\n')}\n\n`;
  }

  if (fixes.length) {
    changelog += `### Bug Fixes\n\n${fixes.join('\n')}\n\n`;
  }

  if (others.length) {
    changelog += `### Other Changes\n\n${others.join('\n')}\n\n`;
  }

  // Prepend to existing CHANGELOG.md
  const existing = existsSync('CHANGELOG.md')
    ? readFileSync('CHANGELOG.md', 'utf-8')
    : '';
  writeFileSync('CHANGELOG.md', changelog + existing);

  console.log('Changelog updated');
}

generateChangelog();
```

## Real-World Examples

### Example 1: Database Migration CLI

A complete database migration tool with rollback support.

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { Pool } from 'pg';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface DBConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class MigrationRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor(config: DBConfig, migrationsDir: string = './migrations') {
    this.pool = new Pool(config);
    this.migrationsDir = migrationsDir;
  }

  async ensureMigrationsTable() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    return result.rows.map(row => row.name);
  }

  async getPendingMigrations(): Promise<string[]> {
    const files = readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const executed = await this.getExecutedMigrations();
    return files.filter(f => !executed.includes(f));
  }

  async migrate(steps: number = 0) {
    await this.ensureMigrationsTable();
    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log(chalk.green('✓ No pending migrations'));
      return;
    }

    const toRun = steps > 0 ? pending.slice(0, steps) : pending;

    console.log(chalk.bold.blue(`\nRunning ${toRun.length} migration(s):\n`));

    for (const migration of toRun) {
      const spinner = ora(`Running ${migration}`).start();

      try {
        const sql = readFileSync(
          join(this.migrationsDir, migration),
          'utf-8'
        );

        await this.pool.query('BEGIN');
        await this.pool.query(sql);
        await this.pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration]
        );
        await this.pool.query('COMMIT');

        spinner.succeed(`Migrated ${migration}`);
      } catch (error: any) {
        await this.pool.query('ROLLBACK');
        spinner.fail(`Failed ${migration}`);
        throw error;
      }
    }

    console.log(chalk.bold.green('\n✓ All migrations completed\n'));
  }

  async rollback(steps: number = 1) {
    await this.ensureMigrationsTable();
    const executed = await this.getExecutedMigrations();

    if (executed.length === 0) {
      console.log(chalk.yellow('No migrations to rollback'));
      return;
    }

    const toRollback = executed.slice(-steps).reverse();

    console.log(chalk.bold.red(`\nRolling back ${toRollback.length} migration(s):\n`));

    for (const migration of toRollback) {
      const rollbackFile = migration.replace('.sql', '.down.sql');
      const spinner = ora(`Rolling back ${migration}`).start();

      try {
        const sql = readFileSync(
          join(this.migrationsDir, rollbackFile),
          'utf-8'
        );

        await this.pool.query('BEGIN');
        await this.pool.query(sql);
        await this.pool.query(
          'DELETE FROM migrations WHERE name = $1',
          [migration]
        );
        await this.pool.query('COMMIT');

        spinner.succeed(`Rolled back ${migration}`);
      } catch (error: any) {
        await this.pool.query('ROLLBACK');
        spinner.fail(`Failed to rollback ${migration}`);
        throw error;
      }
    }

    console.log(chalk.bold.green('\n✓ Rollback completed\n'));
  }

  async status() {
    await this.ensureMigrationsTable();
    const executed = await this.getExecutedMigrations();
    const pending = await this.getPendingMigrations();

    const table = new Table({
      head: [chalk.bold('Migration'), chalk.bold('Status')],
      colWidths: [50, 20],
    });

    executed.forEach(name => {
      table.push([name, chalk.green('✓ Executed')]);
    });

    pending.forEach(name => {
      table.push([name, chalk.yellow('⧗ Pending')]);
    });

    console.log('\n' + table.toString() + '\n');
    console.log(chalk.blue(`Executed: ${executed.length}`));
    console.log(chalk.yellow(`Pending: ${pending.length}\n`));
  }

  async create(name: string) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const filename = `${timestamp}_${name}`;
    const upFile = join(this.migrationsDir, `${filename}.sql`);
    const downFile = join(this.migrationsDir, `${filename}.down.sql`);

    writeFileSync(upFile, `-- Migration: ${name}\n-- Created: ${new Date().toISOString()}\n\n`);
    writeFileSync(downFile, `-- Rollback: ${name}\n-- Created: ${new Date().toISOString()}\n\n`);

    console.log(chalk.green('\n✓ Created migration files:\n'));
    console.log(chalk.blue(upFile));
    console.log(chalk.blue(downFile));
    console.log();
  }

  async close() {
    await this.pool.end();
  }
}

// CLI Program
const program = new Command();

program
  .name('db-migrate')
  .description('Database migration tool')
  .version('1.0.0');

program
  .command('migrate')
  .description('Run pending migrations')
  .option('-s, --steps <number>', 'Number of migrations to run', '0')
  .option('-d, --dry-run', 'Show pending migrations without running')
  .action(async (options) => {
    const runner = new MigrationRunner({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'myapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

    try {
      if (options.dryRun) {
        await runner.status();
      } else {
        await runner.migrate(parseInt(options.steps));
      }
    } finally {
      await runner.close();
    }
  });

program
  .command('rollback')
  .description('Rollback migrations')
  .option('-s, --steps <number>', 'Number of migrations to rollback', '1')
  .action(async (options) => {
    const runner = new MigrationRunner({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'myapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

    const confirmed = await confirm({
      message: `Rollback ${options.steps} migration(s)?`,
      default: false,
    });

    if (!confirmed) {
      console.log(chalk.yellow('Cancelled'));
      process.exit(0);
    }

    try {
      await runner.rollback(parseInt(options.steps));
    } finally {
      await runner.close();
    }
  });

program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    const runner = new MigrationRunner({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'myapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

    try {
      await runner.status();
    } finally {
      await runner.close();
    }
  });

program
  .command('create <name>')
  .description('Create a new migration')
  .action(async (name) => {
    const runner = new MigrationRunner({
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      user: 'postgres',
      password: '',
    });

    await runner.create(name);
  });

program.parse();
```

### Example 2: Project Scaffolding CLI

A full-featured project generator with interactive setup.

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { input, select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  license: string;
  framework: 'react' | 'vue' | 'next' | 'express';
  typescript: boolean;
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

class ProjectScaffolder {
  constructor(private config: ProjectConfig) {}

  async create() {
    const { name } = this.config;

    console.log(chalk.bold.blue(`\n🚀 Creating project: ${name}\n`));

    this.createDirectory();
    await this.generatePackageJson();
    await this.generateGitignore();
    await this.generateReadme();
    await this.generateSourceFiles();

    if (await confirm({ message: 'Install dependencies?', default: true })) {
      await this.installDependencies();
    }

    if (await confirm({ message: 'Initialize git?', default: true })) {
      await this.initGit();
    }

    console.log(chalk.bold.green(`\n✓ Project ${name} created successfully!\n`));
    console.log(chalk.blue('Next steps:\n'));
    console.log(chalk.gray(`  cd ${name}`));
    console.log(chalk.gray(`  ${this.config.packageManager} run dev\n`));
  }

  private createDirectory() {
    const spinner = ora('Creating directory structure').start();

    const dirs = [
      this.config.name,
      join(this.config.name, 'src'),
      join(this.config.name, 'public'),
      join(this.config.name, 'tests'),
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    spinner.succeed('Created directory structure');
  }

  private async generatePackageJson() {
    const spinner = ora('Generating package.json').start();

    const pkg = {
      name: this.config.name,
      version: '0.1.0',
      description: this.config.description,
      author: this.config.author,
      license: this.config.license,
      scripts: this.getScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
    };

    writeFileSync(
      join(this.config.name, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );

    spinner.succeed('Generated package.json');
  }

  private getScripts(): Record<string, string> {
    const scripts: Record<string, string> = {};

    if (this.config.framework === 'next') {
      scripts.dev = 'next dev';
      scripts.build = 'next build';
      scripts.start = 'next start';
    } else if (this.config.framework === 'react') {
      scripts.dev = 'vite';
      scripts.build = 'vite build';
      scripts.preview = 'vite preview';
    } else if (this.config.framework === 'express') {
      scripts.dev = this.config.typescript ? 'tsx watch src/index.ts' : 'nodemon src/index.js';
      scripts.build = this.config.typescript ? 'tsc' : 'echo "No build needed"';
      scripts.start = this.config.typescript ? 'node dist/index.js' : 'node src/index.js';
    }

    if (this.config.features.includes('jest')) {
      scripts.test = 'jest';
    }

    return scripts;
  }

  private getDependencies(): Record<string, string> {
    const deps: Record<string, string> = {};

    if (this.config.framework === 'react') {
      deps.react = '^18.2.0';
      deps['react-dom'] = '^18.2.0';
    } else if (this.config.framework === 'express') {
      deps.express = '^4.18.2';
    }

    return deps;
  }

  private getDevDependencies(): Record<string, string> {
    const devDeps: Record<string, string> = {};

    if (this.config.typescript) {
      devDeps.typescript = '^5.3.0';
      devDeps['@types/node'] = '^20.10.0';
    }

    if (this.config.framework === 'react') {
      devDeps.vite = '^5.0.0';
      devDeps['@vitejs/plugin-react'] = '^4.2.0';
    }

    return devDeps;
  }

  private async generateGitignore() {
    const spinner = ora('Generating .gitignore').start();

    const gitignore = `
node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log
coverage/
.next/
`.trim();

    writeFileSync(join(this.config.name, '.gitignore'), gitignore);
    spinner.succeed('Generated .gitignore');
  }

  private async generateReadme() {
    const spinner = ora('Generating README.md').start();

    const readme = `# ${this.config.name}

${this.config.description}

## Getting Started

\`\`\`bash
${this.config.packageManager} install
${this.config.packageManager} run dev
\`\`\`

## License

${this.config.license}
`;

    writeFileSync(join(this.config.name, 'README.md'), readme);
    spinner.succeed('Generated README.md');
  }

  private async generateSourceFiles() {
    const spinner = ora('Generating source files').start();

    if (this.config.framework === 'express') {
      const ext = this.config.typescript ? 'ts' : 'js';
      const indexFile = `
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
`.trim();

      writeFileSync(join(this.config.name, 'src', `index.${ext}`), indexFile);
    }

    spinner.succeed('Generated source files');
  }

  private async installDependencies() {
    const spinner = ora('Installing dependencies').start();

    try {
      execSync(`cd ${this.config.name} && ${this.config.packageManager} install`, {
        stdio: 'pipe',
      });
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw error;
    }
  }

  private async initGit() {
    const spinner = ora('Initializing git repository').start();

    try {
      execSync(`cd ${this.config.name} && git init && git add . && git commit -m "Initial commit"`, {
        stdio: 'pipe',
      });
      spinner.succeed('Git repository initialized');
    } catch (error) {
      spinner.fail('Failed to initialize git');
      throw error;
    }
  }
}

// CLI
const program = new Command();

program
  .name('create-app')
  .description('Project scaffolding tool')
  .version('1.0.0');

program
  .command('init [name]')
  .description('Initialize a new project')
  .action(async (name) => {
    const config: ProjectConfig = {
      name: name || await input({
        message: 'Project name:',
        default: 'my-app',
      }),
      description: await input({
        message: 'Description:',
        default: 'A new project',
      }),
      author: await input({
        message: 'Author:',
        default: process.env.USER || '',
      }),
      license: await select({
        message: 'License:',
        choices: [
          { name: 'MIT', value: 'MIT' },
          { name: 'Apache-2.0', value: 'Apache-2.0' },
        ],
      }),
      framework: await select({
        message: 'Framework:',
        choices: [
          { name: 'React', value: 'react' as const },
          { name: 'Express', value: 'express' as const },
        ],
      }),
      typescript: await confirm({
        message: 'Use TypeScript?',
        default: true,
      }),
      features: await checkbox({
        message: 'Select features:',
        choices: [
          { name: 'ESLint', value: 'eslint', checked: true },
          { name: 'Jest', value: 'jest' },
        ],
      }),
      packageManager: await select({
        message: 'Package manager:',
        choices: [
          { name: 'npm', value: 'npm' as const },
          { name: 'pnpm', value: 'pnpm' as const },
        ],
      }),
    };

    const scaffolder = new ProjectScaffolder(config);
    await scaffolder.create();
  });

program.parse();
```

## Related Skills

- **nodejs-backend-patterns** - Node.js server architecture and Express/Fastify patterns
- **javascript-testing-patterns** - Testing CLIs with Jest and Vitest
- **typescript-advanced-types** - Type-safe CLI argument parsing
- **github-actions-templates** - CI/CD for CLI publishing

## Further Reading

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Inquirer.js Documentation](https://github.com/SBoudrias/Inquirer.js)
- [Chalk Documentation](https://github.com/chalk/chalk)
- [Ora Documentation](https://github.com/sindresorhus/ora)
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)
- [CLI Guidelines](https://clig.dev/)
- [Node.js CLI Best Practices](https://github.com/lirantal/nodejs-cli-apps-best-practices)
