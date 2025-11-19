import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { GICMAPIClient } from '../lib/api';

const AETHER_API_URL = 'http://localhost:3001/api';

interface TemplateOptions {
  apiUrl?: string;
  platform?: 'bolt' | 'lovable' | 'local';
  skipConfirm?: boolean;
  verbose?: boolean;
}

/**
 * Template Add - Install a template locally
 */
export async function templateAddCommand(slug: string, options: TemplateOptions = {}) {
  const apiUrl = options.apiUrl || AETHER_API_URL;
  const spinner = ora();

  try {
    // Fetch template
    spinner.start(`Fetching template: ${slug}`);
    const response = await fetch(`${apiUrl}/templates/${slug}`);

    if (!response.ok) {
      throw new Error(`Template not found: ${slug}`);
    }

    const { template } = await response.json();
    spinner.succeed(`Found template: ${chalk.cyan(template.name)}`);

    // Display template info
    console.log(`\n${chalk.bold('Description:')} ${template.description}`);
    console.log(`${chalk.bold('Category:')} ${template.category}`);
    console.log(`${chalk.bold('Framework:')} ${template.framework}`);
    console.log(`${chalk.bold('Platforms:')} ${template.platforms.join(', ')}`);
    console.log(`${chalk.bold('Installs:')} ${template.installs}`);

    // Confirm installation
    if (!options.skipConfirm) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Install this template?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('\n✗ Installation cancelled\n'));
        return;
      }
    }

    // Create local directory
    const targetDir = path.join(process.cwd(), `.aether/templates/${slug}`);
    await fs.ensureDir(targetDir);

    // Save template metadata
    await fs.writeJSON(path.join(targetDir, 'template.json'), template, { spaces: 2 });

    spinner.succeed(`Template installed to: ${chalk.cyan(targetDir)}`);

    console.log(chalk.green('\n✓ Installation complete!\n'));
    console.log(`Next steps:`);
    console.log(`  ${chalk.cyan(`npx @gicm/cli template create my-project --from=${slug}`)}`);
    console.log(`  ${chalk.cyan(`npx @gicm/cli template deploy ./my-project --to=bolt`)}\n`);

  } catch (error) {
    spinner.fail('Installation failed');
    throw error;
  }
}

/**
 * Template Create - Create a new project from template
 */
export async function templateCreateCommand(
  projectName: string,
  options: TemplateOptions & { from?: string } = {}
) {
  const spinner = ora();

  try {
    // Get template slug
    let templateSlug = options.from;

    if (!templateSlug) {
      const { slug } = await inquirer.prompt([
        {
          type: 'input',
          name: 'slug',
          message: 'Enter template slug (e.g., saas-starter-pro):',
          validate: (input) => input.length > 0 || 'Template slug is required',
        },
      ]);
      templateSlug = slug;
    }

    // Load template
    const templatePath = path.join(process.cwd(), `.aether/templates/${templateSlug}/template.json`);

    if (!await fs.pathExists(templatePath)) {
      throw new Error(
        `Template not found locally. Install it first:\n  npx @gicm/cli template add ${templateSlug}`
      );
    }

    const template = await fs.readJSON(templatePath);
    spinner.succeed(`Loaded template: ${chalk.cyan(template.name)}`);

    // Create project directory
    const projectDir = path.join(process.cwd(), projectName);

    if (await fs.pathExists(projectDir)) {
      throw new Error(`Directory already exists: ${projectDir}`);
    }

    spinner.start(`Creating project: ${projectName}`);
    await fs.ensureDir(projectDir);

    // Generate files from template
    if (template.implementations?.bolt?.projectStructure) {
      const { files, dependencies, scripts } = template.implementations.bolt.projectStructure;

      // Write files
      for (const [filePath, content] of Object.entries(files as Record<string, any>)) {
        const fullPath = path.join(projectDir, filePath);
        await fs.ensureDir(path.dirname(fullPath));

        if (typeof content === 'string') {
          await fs.writeFile(fullPath, content);
        }
      }

      // Create package.json
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        private: true,
        scripts: scripts || {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: dependencies || {},
      };

      await fs.writeJSON(path.join(projectDir, 'package.json'), packageJson, { spaces: 2 });

      // Create README
      const readme = `# ${projectName}

Created from template: **${template.name}**

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## Deploy

\`\`\`bash
# Deploy to Bolt.new
npx @gicm/cli template deploy . --to=bolt

# Deploy to Lovable.dev
npx @gicm/cli template deploy . --to=lovable
\`\`\`

---

Template: [${template.name}](${AETHER_API_URL.replace('/api', '')}/templates/${templateSlug})
`;

      await fs.writeFile(path.join(projectDir, 'README.md'), readme);
    }

    spinner.succeed(`Project created: ${chalk.cyan(projectDir)}`);

    console.log(chalk.green('\n✓ Project created successfully!\n'));
    console.log(`Next steps:`);
    console.log(`  ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  ${chalk.cyan('npm install')}`);
    console.log(`  ${chalk.cyan('npm run dev')}\n`);

  } catch (error) {
    spinner.fail('Project creation failed');
    throw error;
  }
}

/**
 * Template Deploy - Deploy project to platform
 */
export async function templateDeployCommand(
  projectPath: string = '.',
  options: TemplateOptions & { to?: string; name?: string } = {}
) {
  const apiUrl = options.apiUrl || AETHER_API_URL;
  const spinner = ora();

  try {
    // Determine platform
    let platform = options.to;

    if (!platform) {
      const { selectedPlatform } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedPlatform',
          message: 'Select deployment platform:',
          choices: [
            { name: '⚡ Bolt.new', value: 'bolt' },
            { name: '💜 Lovable.dev', value: 'lovable' },
            { name: '💻 Local (zip export)', value: 'local' },
          ],
        },
      ]);
      platform = selectedPlatform;
    }

    // Get project name
    const projectName =
      options.name ||
      (await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: path.basename(path.resolve(projectPath)),
        },
      ])).name;

    // Read package.json to get template info
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('No package.json found. Are you in a project directory?');
    }

    const packageJson = await fs.readJSON(packageJsonPath);

    spinner.start(`Deploying to ${platform}...`);

    // Call deployment API
    const response = await fetch(`${apiUrl}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateSlug: packageJson.templateSlug || 'custom',
        platform,
        projectName,
        userId: 'cli-user', // TODO: Get from auth
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Deployment failed');
    }

    spinner.succeed(`Deployed to ${platform}!`);

    console.log(chalk.green('\n✓ Deployment successful!\n'));
    console.log(`${chalk.bold('Project URL:')} ${chalk.cyan(result.project.url)}`);

    if (result.project.editorUrl) {
      console.log(`${chalk.bold('Editor URL:')} ${chalk.cyan(result.project.editorUrl)}`);
    }

    console.log();

  } catch (error) {
    spinner.fail('Deployment failed');
    throw error;
  }
}

/**
 * Template List - List all available templates
 */
export async function templateListCommand(options: TemplateOptions & { category?: string } = {}) {
  const apiUrl = options.apiUrl || AETHER_API_URL;
  const spinner = ora('Fetching templates...').start();

  try {
    let url = `${apiUrl}/templates`;
    if (options.category) {
      url += `?category=${options.category}`;
    }

    const response = await fetch(url);
    const { templates } = await response.json();

    spinner.succeed(`Found ${templates.length} templates`);

    console.log();

    for (const template of templates) {
      console.log(chalk.bold(template.name));
      console.log(`  ${chalk.dim(template.description)}`);
      console.log(`  ${chalk.cyan(`Slug:`)} ${template.slug}`);
      console.log(`  ${chalk.cyan(`Category:`)} ${template.category}`);
      console.log(`  ${chalk.cyan(`Platforms:`)} ${template.platforms.join(', ')}`);
      console.log(`  ${chalk.cyan(`Installs:`)} ${template.installs}`);
      console.log();
    }

    console.log(`Install a template:`);
    console.log(`  ${chalk.cyan('npx @gicm/cli template add <slug>')}\n`);

  } catch (error) {
    spinner.fail('Failed to fetch templates');
    throw error;
  }
}

/**
 * Template Search - Search for templates
 */
export async function templateSearchCommand(query: string, options: TemplateOptions = {}) {
  const apiUrl = options.apiUrl || AETHER_API_URL;
  const spinner = ora(`Searching for: ${query}`).start();

  try {
    const response = await fetch(`${apiUrl}/templates?q=${encodeURIComponent(query)}`);
    const { templates } = await response.json();

    spinner.succeed(`Found ${templates.length} matching templates`);

    if (templates.length === 0) {
      console.log(chalk.yellow('\nNo templates found. Try a different search term.\n'));
      return;
    }

    console.log();

    for (const template of templates) {
      console.log(chalk.bold(template.name));
      console.log(`  ${chalk.dim(template.description)}`);
      console.log(`  ${chalk.cyan(`npx @gicm/cli template add ${template.slug}`)}`);
      console.log();
    }

  } catch (error) {
    spinner.fail('Search failed');
    throw error;
  }
}

/**
 * Template Sync - Sync project with platform
 */
export async function templateSyncCommand(
  projectPath: string = '.',
  options: TemplateOptions & { platform?: string } = {}
) {
  const spinner = ora('Syncing project...').start();

  try {
    // TODO: Implement bidirectional sync with webhooks
    spinner.info('Sync feature coming in Phase 4!');

    console.log(chalk.yellow('\nBidirectional sync is not yet implemented.\n'));
    console.log('This feature will allow you to:');
    console.log('  • Pull changes from Bolt.new or Lovable.dev');
    console.log('  • Push local changes to the platform');
    console.log('  • Resolve conflicts automatically\n');
    console.log(`Track progress: ${chalk.cyan('https://github.com/aether-marketplace/aether/issues')}\n`);

  } catch (error) {
    spinner.fail('Sync failed');
    throw error;
  }
}
