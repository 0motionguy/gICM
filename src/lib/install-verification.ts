/**
 * Installation Verification System
 * Verifies that items (agents, skills, commands, MCPs) are installed correctly
 */

import type { RegistryItem } from "@/types/registry";

export interface InstallationResult {
  success: boolean;
  itemId: string;
  itemName: string;
  itemKind: string;
  filesCreated: string[];
  filesExpected: string[];
  filesMissing: string[];
  dependenciesResolved: boolean;
  dependenciesMissing: string[];
  timestamp: string;
  error?: string;
  verificationMethod: "api" | "browser-limited" | "cli";
}

export interface InstallationStatus {
  itemId: string;
  status: "pending" | "installing" | "success" | "failed" | "verified";
  result?: InstallationResult;
  progress: number; // 0-100
  message: string;
}

/**
 * Verify that files were created for an installed item
 */
export async function verifyFilesCreated(
  item: RegistryItem,
  targetDir: string = ".claude",
): Promise<{
  success: boolean;
  filesCreated: string[];
  filesMissing: string[];
  verificationMethod: "api" | "browser-limited" | "cli";
}> {
  const filesExpected = item.files || [];
  const filesCreated: string[] = [];
  const filesMissing: string[] = [];
  let verificationMethod: "api" | "browser-limited" | "cli" = "browser-limited";

  // No files expected = success
  if (filesExpected.length === 0) {
    return {
      success: true,
      filesCreated: [],
      filesMissing: [],
      verificationMethod: "browser-limited",
    };
  }

  for (const file of filesExpected) {
    const result = await checkFileExists(file, targetDir);
    verificationMethod = result.verificationMethod;

    if (result.exists) {
      filesCreated.push(file);
    } else {
      filesMissing.push(file);
    }
  }

  return {
    success: filesMissing.length === 0,
    filesCreated,
    filesMissing,
    verificationMethod,
  };
}

/**
 * Check if file exists via API call
 * Browser cannot verify local files - must use server-side verification
 */
async function checkFileExists(
  file: string,
  targetDir: string,
): Promise<{ exists: boolean; verificationMethod: "api" | "browser-limited" }> {
  // Try to verify via API endpoint
  try {
    const response = await fetch("/api/verify-installation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, targetDir }),
    });

    if (response.ok) {
      const data = await response.json();
      return { exists: data.exists, verificationMethod: "api" };
    }
  } catch {
    // API not available, fall through to browser-limited
  }

  // Browser cannot verify local files - return unknown (false) with indication
  // This is conservative: we don't claim files exist unless we can verify
  return { exists: false, verificationMethod: "browser-limited" };
}

/**
 * Verify dependencies are resolved
 */
export function verifyDependencies(
  item: RegistryItem,
  installedItems: string[],
): { resolved: boolean; missing: string[] } {
  const dependencies = item.dependencies || [];
  const missing = dependencies.filter((dep) => !installedItems.includes(dep));

  return {
    resolved: missing.length === 0,
    missing,
  };
}

/**
 * Run full installation verification
 */
export async function verifyInstallation(
  item: RegistryItem,
  installedItems: string[],
  targetDir: string = ".claude",
): Promise<InstallationResult> {
  const timestamp = new Date().toISOString();

  try {
    // Check files
    const fileCheck = await verifyFilesCreated(item, targetDir);

    // Check dependencies
    const depCheck = verifyDependencies(item, installedItems);

    const success = fileCheck.success && depCheck.resolved;

    return {
      success,
      itemId: item.id,
      itemName: item.name,
      itemKind: item.kind,
      filesCreated: fileCheck.filesCreated,
      filesExpected: item.files || [],
      filesMissing: fileCheck.filesMissing,
      dependenciesResolved: depCheck.resolved,
      dependenciesMissing: depCheck.missing,
      timestamp,
      verificationMethod: fileCheck.verificationMethod,
    };
  } catch (error) {
    return {
      success: false,
      itemId: item.id,
      itemName: item.name,
      itemKind: item.kind,
      filesCreated: [],
      filesExpected: item.files || [],
      filesMissing: item.files || [],
      dependenciesResolved: false,
      dependenciesMissing: item.dependencies || [],
      timestamp,
      error: error instanceof Error ? error.message : "Unknown error",
      verificationMethod: "browser-limited",
    };
  }
}

/**
 * Batch verify multiple installations
 */
export async function verifyMultipleInstallations(
  items: RegistryItem[],
  installedItems: string[],
  targetDir: string = ".claude",
): Promise<InstallationResult[]> {
  const results = await Promise.all(
    items.map((item) => verifyInstallation(item, installedItems, targetDir)),
  );

  return results;
}

/**
 * Get installation status summary
 */
export function getInstallationSummary(results: InstallationResult[]): {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  totalFilesExpected: number;
  totalFilesCreated: number;
  totalFilesMissing: number;
} {
  const total = results.length;
  const successful = results.filter((r) => r.success).length;
  const failed = total - successful;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  const totalFilesExpected = results.reduce(
    (sum, r) => sum + r.filesExpected.length,
    0,
  );
  const totalFilesCreated = results.reduce(
    (sum, r) => sum + r.filesCreated.length,
    0,
  );
  const totalFilesMissing = results.reduce(
    (sum, r) => sum + r.filesMissing.length,
    0,
  );

  return {
    total,
    successful,
    failed,
    successRate,
    totalFilesExpected,
    totalFilesCreated,
    totalFilesMissing,
  };
}

/**
 * Generate installation report
 */
export function generateInstallationReport(
  results: InstallationResult[],
): string {
  const summary = getInstallationSummary(results);

  let report = `# Installation Verification Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Items:** ${summary.total}\n`;
  report += `- **Successful:** ${summary.successful}\n`;
  report += `- **Failed:** ${summary.failed}\n`;
  report += `- **Success Rate:** ${summary.successRate.toFixed(1)}%\n\n`;
  report += `- **Files Expected:** ${summary.totalFilesExpected}\n`;
  report += `- **Files Created:** ${summary.totalFilesCreated}\n`;
  report += `- **Files Missing:** ${summary.totalFilesMissing}\n\n`;

  if (summary.failed > 0) {
    report += `## Failed Installations\n\n`;

    results
      .filter((r) => !r.success)
      .forEach((r) => {
        report += `### ${r.itemName} (${r.itemKind})\n\n`;

        if (r.filesMissing.length > 0) {
          report += `**Missing Files:**\n`;
          r.filesMissing.forEach((file) => {
            report += `- ${file}\n`;
          });
          report += `\n`;
        }

        if (r.dependenciesMissing.length > 0) {
          report += `**Missing Dependencies:**\n`;
          r.dependenciesMissing.forEach((dep) => {
            report += `- ${dep}\n`;
          });
          report += `\n`;
        }

        if (r.error) {
          report += `**Error:** ${r.error}\n\n`;
        }
      });
  }

  return report;
}

/**
 * Save installation history to localStorage
 */
export function saveInstallationHistory(result: InstallationResult): void {
  try {
    const history = getInstallationHistory();
    history.push(result);

    // Keep only last 100 installations
    const trimmed = history.slice(-100);

    localStorage.setItem("gicm_install_history", JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save installation history:", error);
  }
}

/**
 * Get installation history from localStorage
 */
export function getInstallationHistory(): InstallationResult[] {
  try {
    const data = localStorage.getItem("gicm_install_history");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read installation history:", error);
    return [];
  }
}

/**
 * Clear installation history
 */
export function clearInstallationHistory(): void {
  try {
    localStorage.removeItem("gicm_install_history");
  } catch (error) {
    console.error("Failed to clear installation history:", error);
  }
}

/**
 * Get recent installations (last N)
 */
export function getRecentInstallations(
  limit: number = 10,
): InstallationResult[] {
  const history = getInstallationHistory();
  return history.slice(-limit).reverse();
}

/**
 * Check if item is installed (based on history)
 */
export function isItemInstalled(itemId: string): boolean {
  const history = getInstallationHistory();
  const latest = history
    .filter((r) => r.itemId === itemId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];

  return latest?.success || false;
}

/**
 * Get installation stats for analytics
 */
export function getInstallationStats(): {
  totalInstalls: number;
  successfulInstalls: number;
  failedInstalls: number;
  successRate: number;
  byKind: Record<string, number>;
  recentActivity: Array<{ date: string; count: number }>;
} {
  const history = getInstallationHistory();

  const totalInstalls = history.length;
  const successfulInstalls = history.filter((r) => r.success).length;
  const failedInstalls = totalInstalls - successfulInstalls;
  const successRate =
    totalInstalls > 0 ? (successfulInstalls / totalInstalls) * 100 : 0;

  // Count by kind
  const byKind: Record<string, number> = {};
  history.forEach((r) => {
    byKind[r.itemKind] = (byKind[r.itemKind] || 0) + 1;
  });

  // Recent activity (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentActivity: Array<{ date: string; count: number }> = [];

  const activityMap = new Map<string, number>();
  history
    .filter((r) => new Date(r.timestamp) >= sevenDaysAgo)
    .forEach((r) => {
      const date = r.timestamp.split("T")[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

  activityMap.forEach((count, date) => {
    recentActivity.push({ date, count });
  });

  return {
    totalInstalls,
    successfulInstalls,
    failedInstalls,
    successRate,
    byKind,
    recentActivity: recentActivity.sort((a, b) => a.date.localeCompare(b.date)),
  };
}
