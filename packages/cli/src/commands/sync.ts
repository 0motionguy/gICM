/**
 * gICM CLI - Sync Command
 * Sync marketplace items from community repos
 */

import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import axios from "axios";
import { z } from "zod";
import { loadConfig, getGICMDir } from "../lib/config";

// ============================================================================
// Types & Schemas
// ============================================================================

const RepoConfigSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  branch: z.string().default("main"),
  paths: z
    .object({
      skills: z.string().default("skills"),
      agents: z.string().default("agents"),
      commands: z.string().default("commands"),
      mcps: z.string().default("mcps"),
    })
    .default({}),
  enabled: z.boolean().default(true),
  lastSync: z.string().datetime().optional(),
});

type RepoConfig = z.infer<typeof RepoConfigSchema>;

const SyncConfigSchema = z.object({
  repos: z.array(RepoConfigSchema).default([]),
  autoSync: z.boolean().default(false),
  syncInterval: z.number().int().min(60).default(3600), // seconds
});

type SyncConfig = z.infer<typeof SyncConfigSchema>;

export interface SyncOptions {
  repo?: string;
  all?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

interface SyncResult {
  repo: string;
  itemsSynced: number;
  itemsSkipped: number;
  errors: string[];
}

// ============================================================================
// Default Community Repos
// ============================================================================

const DEFAULT_REPOS: RepoConfig[] = [
  {
    name: "gicm-community",
    url: "https://github.com/gicm-dev/community-skills",
    branch: "main",
    paths: {
      skills: "skills",
      agents: "agents",
      commands: "commands",
      mcps: "mcps",
    },
    enabled: true,
  },
];

// ============================================================================
// Sync Command Implementation
// ============================================================================

/**
 * Load sync configuration from .gicm/sync.json
 */
async function loadSyncConfig(
  basePath: string = process.cwd()
): Promise<SyncConfig> {
  const configPath = path.join(getGICMDir(basePath), "sync.json");

  if (await fs.pathExists(configPath)) {
    try {
      const raw = await fs.readJson(configPath);
      return SyncConfigSchema.parse(raw);
    } catch (error) {
      console.warn(chalk.yellow("Warning: Invalid sync.json, using defaults"));
    }
  }

  return { repos: DEFAULT_REPOS, autoSync: false, syncInterval: 3600 };
}

/**
 * Save sync configuration
 */
async function saveSyncConfig(
  config: SyncConfig,
  basePath: string = process.cwd()
): Promise<void> {
  const configPath = path.join(getGICMDir(basePath), "sync.json");
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Fetch raw file from GitHub
 */
async function fetchGitHubFile(
  repoUrl: string,
  branch: string,
  filePath: string
): Promise<string | null> {
  try {
    // Convert GitHub URL to raw content URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

    const response = await axios.get(rawUrl, { timeout: 10000 });
    return response.data;
  } catch {
    return null;
  }
}

/**
 * List files in a GitHub directory
 */
async function listGitHubDir(
  repoUrl: string,
  branch: string,
  dirPath: string
): Promise<string[]> {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return [];

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "gicm-cli",
      },
    });

    if (Array.isArray(response.data)) {
      return response.data
        .filter((item: { type: string }) => item.type === "file")
        .map((item: { name: string }) => item.name);
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Sync items from a single repo
 */
async function syncRepo(
  repo: RepoConfig,
  options: SyncOptions,
  spinner: ReturnType<typeof ora>
): Promise<SyncResult> {
  const result: SyncResult = {
    repo: repo.name,
    itemsSynced: 0,
    itemsSkipped: 0,
    errors: [],
  };

  const claudeDir = path.join(process.cwd(), ".claude");

  // Sync each item type
  const itemTypes: Array<{
    type: string;
    remotePath: string;
    localDir: string;
  }> = [
    { type: "skills", remotePath: repo.paths.skills, localDir: "skills" },
    { type: "agents", remotePath: repo.paths.agents, localDir: "agents" },
    { type: "commands", remotePath: repo.paths.commands, localDir: "commands" },
    { type: "mcps", remotePath: repo.paths.mcps, localDir: "mcp" },
  ];

  for (const { type, remotePath, localDir } of itemTypes) {
    spinner.text = `Syncing ${type} from ${repo.name}...`;

    const files = await listGitHubDir(repo.url, repo.branch, remotePath);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const content = await fetchGitHubFile(
        repo.url,
        repo.branch,
        `${remotePath}/${file}`
      );

      if (!content) {
        result.errors.push(`Failed to fetch ${type}/${file}`);
        continue;
      }

      const localPath = path.join(claudeDir, localDir, file);

      // Check if file exists and is different
      const exists = await fs.pathExists(localPath);
      if (exists) {
        const existingContent = await fs.readFile(localPath, "utf-8");
        if (existingContent === content) {
          result.itemsSkipped++;
          continue;
        }
      }

      if (options.dryRun) {
        if (options.verbose) {
          console.log(chalk.gray(`  [dry-run] Would sync: ${type}/${file}`));
        }
        result.itemsSynced++;
        continue;
      }

      // Write the file
      await fs.ensureDir(path.dirname(localPath));
      await fs.writeFile(localPath, content, "utf-8");
      result.itemsSynced++;

      if (options.verbose) {
        console.log(chalk.green(`  + ${type}/${file}`));
      }
    }
  }

  return result;
}

/**
 * Main sync command handler
 */
export async function syncCommand(options: SyncOptions = {}): Promise<void> {
  console.log(chalk.bold("\nSync - Community Repository Sync\n"));

  // Check if project is initialized
  const config = await loadConfig();
  if (!config) {
    console.error(chalk.red("Project not initialized. Run `gicm init` first."));
    process.exit(1);
  }

  // Load sync config
  const syncConfig = await loadSyncConfig();

  // Determine which repos to sync
  let reposToSync: RepoConfig[];

  if (options.repo) {
    const repo = syncConfig.repos.find((r) => r.name === options.repo);
    if (!repo) {
      console.error(
        chalk.red(
          `Repository "${options.repo}" not found in sync configuration.`
        )
      );
      console.log(chalk.gray("\nAvailable repos:"));
      syncConfig.repos.forEach((r) => {
        console.log(
          chalk.gray(`  - ${r.name} (${r.enabled ? "enabled" : "disabled"})`)
        );
      });
      process.exit(1);
    }
    reposToSync = [repo];
  } else if (options.all) {
    reposToSync = syncConfig.repos;
  } else {
    reposToSync = syncConfig.repos.filter((r) => r.enabled);
  }

  if (reposToSync.length === 0) {
    console.log(
      chalk.yellow("No repositories configured or enabled for sync.")
    );
    console.log(chalk.gray("\nTo add a repository, edit .gicm/sync.json"));
    return;
  }

  if (options.dryRun) {
    console.log(chalk.yellow("DRY RUN MODE - No files will be modified\n"));
  }

  console.log(
    chalk.cyan(`Syncing from ${reposToSync.length} repository(ies):\n`)
  );
  reposToSync.forEach((r) => {
    console.log(chalk.gray(`  - ${r.name}: ${r.url}`));
  });
  console.log();

  const spinner = ora({ text: "Starting sync...", color: "cyan" }).start();

  const results: SyncResult[] = [];

  for (const repo of reposToSync) {
    try {
      const result = await syncRepo(repo, options, spinner);
      results.push(result);

      // Update last sync time
      if (!options.dryRun) {
        const repoIndex = syncConfig.repos.findIndex(
          (r) => r.name === repo.name
        );
        if (repoIndex !== -1) {
          syncConfig.repos[repoIndex].lastSync = new Date().toISOString();
        }
      }
    } catch (error) {
      results.push({
        repo: repo.name,
        itemsSynced: 0,
        itemsSkipped: 0,
        errors: [(error as Error).message],
      });
    }
  }

  // Save updated sync config
  if (!options.dryRun) {
    await saveSyncConfig(syncConfig);
  }

  spinner.stop();

  // Display results
  console.log(chalk.bold("\nSync Results:\n"));

  let totalSynced = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const result of results) {
    const statusIcon =
      result.errors.length === 0 ? chalk.green("") : chalk.yellow("");
    console.log(`${statusIcon} ${chalk.bold(result.repo)}`);
    console.log(
      chalk.gray(
        `   Synced: ${result.itemsSynced}, Skipped: ${result.itemsSkipped}`
      )
    );

    if (result.errors.length > 0) {
      result.errors.forEach((err) => {
        console.log(chalk.red(`   ! ${err}`));
      });
    }

    totalSynced += result.itemsSynced;
    totalSkipped += result.itemsSkipped;
    totalErrors += result.errors.length;
  }

  console.log(chalk.bold("\nSummary:"));
  console.log(chalk.green(`  Items synced: ${totalSynced}`));
  console.log(chalk.gray(`  Items skipped (unchanged): ${totalSkipped}`));
  if (totalErrors > 0) {
    console.log(chalk.red(`  Errors: ${totalErrors}`));
  }

  if (options.dryRun) {
    console.log(chalk.yellow("\n[DRY RUN] No files were actually modified."));
  }

  console.log();
}
