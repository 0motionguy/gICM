/**
 * PR Creator
 *
 * Creates pull requests via GitHub CLI (gh)
 */

import { exec } from "child_process";
import { promisify } from "util";
import type { PROptions, PRResult, DiffSummary } from "../core/types.js";
import { MessageGenerator } from "../message/generator.js";

const execAsync = promisify(exec);

export interface PRCreatorConfig {
  cwd?: string;
  timeout?: number;
  apiKey?: string;
}

export class PRCreator {
  private cwd: string;
  private timeout: number;
  private messageGenerator: MessageGenerator;

  constructor(config: PRCreatorConfig = {}) {
    this.cwd = config.cwd ?? process.cwd();
    this.timeout = config.timeout ?? 60000;
    this.messageGenerator = new MessageGenerator({ apiKey: config.apiKey });
  }

  /**
   * Create a pull request using gh CLI
   */
  async create(options: Partial<PROptions> = {}): Promise<PRResult> {
    if (options.dryRun) {
      return {
        success: true,
        title: options.title || "PR Title",
        error: "Dry run - PR not created",
      };
    }

    try {
      // Check if gh CLI is available
      await this.exec(["gh", "--version"]);

      const args = ["gh", "pr", "create"];

      if (options.title) {
        args.push("--title", options.title);
      }

      if (options.body) {
        args.push("--body", options.body);
      }

      if (options.base) {
        args.push("--base", options.base);
      }

      if (options.head) {
        args.push("--head", options.head);
      }

      if (options.draft) {
        args.push("--draft");
      }

      const output = await this.exec(args);

      // Extract PR URL from output
      const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);

      return {
        success: true,
        url: urlMatch?.[0],
        title: options.title,
      };
    } catch (error) {
      const err = error as { stderr?: string; message: string };
      return {
        success: false,
        error: err.stderr || err.message,
      };
    }
  }

  /**
   * Generate PR title and body from commits and diff
   */
  async generatePR(
    commits: string[],
    diff: DiffSummary
  ): Promise<{ title: string; body: string }> {
    const result = await this.messageGenerator.generatePRBody(commits, diff);
    return {
      title: result.title,
      body: result.body,
    };
  }

  /**
   * Check if there's an existing PR for the current branch
   */
  async existingPR(): Promise<{ exists: boolean; url?: string; number?: number }> {
    try {
      const output = await this.exec(["gh", "pr", "view", "--json", "url,number"]);
      const data = JSON.parse(output);
      return {
        exists: true,
        url: data.url,
        number: data.number,
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Execute a command
   */
  private async exec(args: string[]): Promise<string> {
    const command = args.join(" ");
    const { stdout } = await execAsync(command, {
      cwd: this.cwd,
      timeout: this.timeout,
    });
    return stdout.trim();
  }
}
