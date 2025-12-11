#!/usr/bin/env ts-node
/**
 * Marketplace Repository Sync Script
 *
 * Fetches latest content from community GitHub repositories:
 * - anthropics/skills
 * - obra/superpowers
 * - Other registered community repos
 *
 * Updates local cache and tracks changes for marketplace integration.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

// ============================================================================
// Configuration
// ============================================================================

interface RepoConfig {
  name: string;
  owner: string;
  repo: string;
  branch: string;
  path: string; // Local cache path
  contentPath?: string; // Subdirectory within repo to sync (e.g., "skills/")
}

const REPOS: RepoConfig[] = [
  {
    name: "Anthropic Official Skills",
    owner: "anthropics",
    repo: "skills",
    branch: "main",
    path: ".cache/repos/anthropic-skills",
    contentPath: "skills/",
  },
  {
    name: "Obra Superpowers",
    owner: "obra",
    repo: "superpowers",
    branch: "main",
    path: ".cache/repos/superpowers",
  },
  {
    name: "Community Skills Collection",
    owner: "gicm-community",
    repo: "skills",
    branch: "main",
    path: ".cache/repos/community-skills",
  },
];

const CACHE_DIR = join(process.cwd(), ".cache");
const REPOS_DIR = join(CACHE_DIR, "repos");
const SYNC_LOG_PATH = join(CACHE_DIR, "sync-log.json");

// ============================================================================
// Types
// ============================================================================

interface SyncResult {
  repo: string;
  success: boolean;
  changes: number;
  newFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
  commitHash: string;
  syncedAt: string;
  error?: string;
}

interface SyncReport {
  timestamp: string;
  duration: number;
  totalRepos: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalChanges: number;
  results: SyncResult[];
}

interface SyncLog {
  lastSync: string;
  repos: Record<
    string,
    {
      lastCommit: string;
      lastSyncedAt: string;
      fileCount: number;
    }
  >;
}

// ============================================================================
// Utilities
// ============================================================================

function exec(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"], // Suppress stderr
    });
  } catch (error: any) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadSyncLog(): SyncLog {
  if (existsSync(SYNC_LOG_PATH)) {
    return JSON.parse(readFileSync(SYNC_LOG_PATH, "utf-8"));
  }
  return {
    lastSync: new Date(0).toISOString(),
    repos: {},
  };
}

function saveSyncLog(log: SyncLog): void {
  writeFileSync(SYNC_LOG_PATH, JSON.stringify(log, null, 2));
}

// ============================================================================
// Git Operations
// ============================================================================

function cloneRepo(config: RepoConfig): void {
  const repoUrl = `https://github.com/${config.owner}/${config.repo}.git`;
  console.log(`  Cloning ${repoUrl}...`);

  ensureDir(REPOS_DIR);
  exec(
    `git clone --depth 1 --branch ${config.branch} ${repoUrl} ${config.path}`,
    process.cwd()
  );
}

function updateRepo(config: RepoConfig): SyncResult {
  const result: SyncResult = {
    repo: config.name,
    success: false,
    changes: 0,
    newFiles: [],
    modifiedFiles: [],
    deletedFiles: [],
    commitHash: "",
    syncedAt: new Date().toISOString(),
  };

  try {
    // Check if repo exists, clone if not
    if (!existsSync(config.path)) {
      cloneRepo(config);
    }

    // Get current commit hash before pull
    const oldCommit = exec("git rev-parse HEAD", config.path).trim();

    // Fetch latest changes
    exec(`git fetch origin ${config.branch}`, config.path);

    // Check for changes
    const status = exec(
      `git diff --name-status origin/${config.branch}`,
      config.path
    );

    if (status.trim()) {
      // Parse changes
      const lines = status.trim().split("\n");
      for (const line of lines) {
        const [status, file] = line.split("\t");
        if (status === "A") result.newFiles.push(file);
        else if (status === "M") result.modifiedFiles.push(file);
        else if (status === "D") result.deletedFiles.push(file);
      }

      result.changes =
        result.newFiles.length +
        result.modifiedFiles.length +
        result.deletedFiles.length;

      // Pull changes
      exec(`git pull origin ${config.branch}`, config.path);
    }

    // Get new commit hash
    result.commitHash = exec("git rev-parse HEAD", config.path).trim();
    result.success = true;

    console.log(`  ✓ Synced ${config.name}: ${result.changes} changes`);
    if (result.changes > 0) {
      console.log(`    - New files: ${result.newFiles.length}`);
      console.log(`    - Modified files: ${result.modifiedFiles.length}`);
      console.log(`    - Deleted files: ${result.deletedFiles.length}`);
    }
  } catch (error: any) {
    result.error = error.message;
    console.error(`  ✗ Failed to sync ${config.name}: ${error.message}`);
  }

  return result;
}

// ============================================================================
// Sync Orchestration
// ============================================================================

async function syncAllRepos(): Promise<SyncReport> {
  console.log("🔄 Starting marketplace repository sync...\n");

  const startTime = Date.now();
  const results: SyncResult[] = [];

  // Ensure cache directory exists
  ensureDir(CACHE_DIR);
  ensureDir(REPOS_DIR);

  // Sync each repository
  for (const repo of REPOS) {
    console.log(`Syncing: ${repo.name}`);
    const result = updateRepo(repo);
    results.push(result);
    console.log("");
  }

  // Calculate summary statistics
  const duration = Date.now() - startTime;
  const successfulSyncs = results.filter((r) => r.success).length;
  const failedSyncs = results.filter((r) => !r.success).length;
  const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);

  const report: SyncReport = {
    timestamp: new Date().toISOString(),
    duration,
    totalRepos: REPOS.length,
    successfulSyncs,
    failedSyncs,
    totalChanges,
    results,
  };

  // Update sync log
  const syncLog = loadSyncLog();
  syncLog.lastSync = report.timestamp;
  for (const result of results) {
    if (result.success) {
      syncLog.repos[result.repo] = {
        lastCommit: result.commitHash,
        lastSyncedAt: result.syncedAt,
        fileCount: result.newFiles.length + result.modifiedFiles.length,
      };
    }
  }
  saveSyncLog(syncLog);

  return report;
}

// ============================================================================
// Reporting
// ============================================================================

function printReport(report: SyncReport): void {
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log("📊 SYNC REPORT");
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`Timestamp:        ${report.timestamp}`);
  console.log(`Duration:         ${(report.duration / 1000).toFixed(2)}s`);
  console.log(`Total Repos:      ${report.totalRepos}`);
  console.log(`Successful:       ${report.successfulSyncs}`);
  console.log(`Failed:           ${report.failedSyncs}`);
  console.log(`Total Changes:    ${report.totalChanges}`);
  console.log("");

  if (report.failedSyncs > 0) {
    console.log("❌ FAILED SYNCS:");
    report.results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.repo}: ${r.error}`);
      });
    console.log("");
  }

  if (report.totalChanges > 0) {
    console.log("📝 CHANGES BY REPOSITORY:");
    report.results
      .filter((r) => r.changes > 0)
      .forEach((r) => {
        console.log(`  ${r.repo} (${r.changes} changes):`);
        if (r.newFiles.length > 0) {
          console.log(`    + ${r.newFiles.length} new files`);
        }
        if (r.modifiedFiles.length > 0) {
          console.log(`    ~ ${r.modifiedFiles.length} modified files`);
        }
        if (r.deletedFiles.length > 0) {
          console.log(`    - ${r.deletedFiles.length} deleted files`);
        }
      });
  } else {
    console.log("✅ All repositories up to date - no changes detected");
  }

  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
}

function saveReport(report: SyncReport): void {
  const reportPath = join(CACHE_DIR, `sync-report-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    const report = await syncAllRepos();
    printReport(report);
    saveReport(report);

    // Exit with error code if any syncs failed
    if (report.failedSyncs > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Fatal error during sync:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { syncAllRepos, REPOS };
export type { SyncReport, SyncResult };
