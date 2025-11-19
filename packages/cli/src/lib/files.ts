/**
 * File writing utilities for gICM CLI
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import type { RegistryItem, FileContent } from './types';

export class FileWriter {
  private basePath: string;
  private platform: "claude" | "gemini";

  constructor(basePath?: string, platform: "claude" | "gemini" = "claude") {
    this.basePath = basePath || process.cwd();
    this.platform = platform;
  }

  /**
   * Get the root configuration directory name (.claude or .gemini)
   */
  private get configDirName(): string {
    return `.${this.platform}`;
  }

  /**
   * Write files for a marketplace item
   */
  async writeItem(item: RegistryItem, files: FileContent[]): Promise<void> {
    try {
      for (const file of files) {
        await this.writeFile(file.path, file.content);
      }
    } catch (error) {
      this.handleError(error, item);
      throw error;
    }
  }

  /**
   * Write a single file
   */
  private async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.basePath, this.configDirName, relativePath);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Check if config directory exists and is writable
   */
  async ensureConfigDir(): Promise<void> {
    const configDir = path.join(this.basePath, this.configDirName);

    try {
      // Create directory if it doesn't exist
      await fs.ensureDir(configDir);

      // Test write permissions
      const testFile = path.join(configDir, '.aether-test');
      await fs.writeFile(testFile, 'test', 'utf-8');
      await fs.remove(testFile);
    } catch (error) {
      console.error(chalk.red(`\n✗ Cannot write to ${this.configDirName} directory`));
      console.error(chalk.yellow('  Please check folder permissions.\n'));
      throw error;
    }
  }

  /**
   * Get installation paths for different item types
   */
  getInstallPath(item: RegistryItem): string {
    const basePath = path.join(this.basePath, this.configDirName);

    switch (item.kind) {
      case 'agent':
        return path.join(basePath, 'agents', `${item.slug}.md`);

      case 'skill':
        return path.join(basePath, 'skills', item.slug, 'SKILL.md');

      case 'command':
        return path.join(basePath, 'commands', `${item.slug}.md`);

      case 'mcp':
        return path.join(basePath, 'mcp', `${item.slug}.json`);

      case 'setting': {
        // Settings are in category folders
        const category = item.category.toLowerCase().replace(/\s+/g, '-');
        return path.join(basePath, 'settings', category, `${item.slug}.md`);
      }

      default:
        throw new Error(`Unknown item kind: ${item.kind}`);
    }
  }

  /**
   * Check if item is already installed
   */
  async isInstalled(item: RegistryItem): Promise<boolean> {
    const installPath = this.getInstallPath(item);
    return fs.pathExists(installPath);
  }

  /**
   * Get list of installed items by kind
   */
  async getInstalledItems(kind?: string): Promise<string[]> {
    const basePath = path.join(this.basePath, this.configDirName);
    const installed: string[] = [];

    try {
      if (!kind || kind === 'agent') {
        const agentsDir = path.join(basePath, 'agents');
        if (await fs.pathExists(agentsDir)) {
          const files = await fs.readdir(agentsDir);
          installed.push(...files.filter(f => f.endsWith('.md')).map(f => `agent/${f.replace('.md', '')}`));
        }
      }

      if (!kind || kind === 'skill') {
        const skillsDir = path.join(basePath, 'skills');
        if (await fs.pathExists(skillsDir)) {
          const dirs = await fs.readdir(skillsDir);
          for (const dir of dirs) {
            const skillFile = path.join(skillsDir, dir, 'SKILL.md');
            if (await fs.pathExists(skillFile)) {
              installed.push(`skill/${dir}`);
            }
          }
        }
      }

      if (!kind || kind === 'command') {
        const commandsDir = path.join(basePath, 'commands');
        if (await fs.pathExists(commandsDir)) {
          const files = await fs.readdir(commandsDir);
          installed.push(...files.filter(f => f.endsWith('.md')).map(f => `command/${f.replace('.md', '')}`));
        }
      }

      if (!kind || kind === 'mcp') {
        const mcpDir = path.join(basePath, 'mcp');
        if (await fs.pathExists(mcpDir)) {
          const files = await fs.readdir(mcpDir);
          installed.push(...files.filter(f => f.endsWith('.json')).map(f => `mcp/${f.replace('.json', '')}`));
        }
      }

      if (!kind || kind === 'setting') {
        const settingsDir = path.join(basePath, 'settings');
        if (await fs.pathExists(settingsDir)) {
          const categories = await fs.readdir(settingsDir);
          for (const category of categories) {
            const categoryPath = path.join(settingsDir, category);
            const stat = await fs.stat(categoryPath);
            if (stat.isDirectory()) {
              const files = await fs.readdir(categoryPath);
              installed.push(...files.filter(f => f.endsWith('.md')).map(f => `setting/${f.replace('.md', '')}`));
            }
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist yet, return empty array
      return [];
    }

    return installed;
  }

  /**
   * Handle file writing errors
   */
  private handleError(error: unknown, item: RegistryItem): void {
    const err = error as NodeJS.ErrnoException;

    if (err.code === 'EACCES') {
      console.error(chalk.red(`\n✗ Permission denied writing ${item.kind}/${item.slug}`));
      console.error(chalk.yellow('  Please check folder permissions.\n'));
    } else if (err.code === 'ENOSPC') {
      console.error(chalk.red('\n✗ Disk full'));
      console.error(chalk.yellow('  Please free up space and try again.\n'));
    } else {
      console.error(chalk.red(`\n✗ Failed to write ${item.kind}/${item.slug}`));
      console.error(chalk.yellow(`  ${err.message}\n`));
    }
  }
}