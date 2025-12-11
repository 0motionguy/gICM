import type { RegistryItem } from "@/types/registry";
import { REGISTRY } from "@/lib/registry";

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditStatus = "VERIFIED" | "NEEDS_FIX" | "FLAGGED" | "DEPRECATED";

export interface AuditMetadata {
  lastAudited: string;
  qualityScore: number;
  status: AuditStatus;
  issues?: string[];
}

export interface ItemAuditResult {
  id: string;
  name: string;
  kind: string;
  qualityScore: number;
  status: AuditStatus;
  issues: string[];
  breakdown: {
    hasDescription: boolean;
    hasTags: boolean;
    hasDependencies: boolean;
    hasInstall: boolean;
    hasFiles: boolean;
  };
}

export interface AuditSummary {
  totalItems: number;
  averageScore: number;
  medianScore: number;
  byStatus: {
    VERIFIED: number;
    NEEDS_FIX: number;
    FLAGGED: number;
    DEPRECATED: number;
  };
  byKind: Record<string, { count: number; averageScore: number }>;
  scoreDistribution: {
    excellent: number; // 80-100
    good: number; // 60-79
    fair: number; // 40-59
    poor: number; // 0-39
  };
}

export interface AuditReport {
  generatedAt: string;
  summary: AuditSummary;
  items: ItemAuditResult[];
  topIssues: { issue: string; count: number }[];
  itemsNeedingAttention: ItemAuditResult[];
}

// ============================================================================
// QUALITY SCORE CALCULATION
// ============================================================================

/**
 * Calculate quality score for a registry item.
 * Scoring breakdown (100 points total):
 * - Has description (non-empty, > 10 chars): 20 points
 * - Has tags (at least 1 tag): 20 points
 * - Has dependencies defined (array exists, even if empty): 20 points
 * - Has install command (non-empty): 20 points
 * - Has files (array with at least 1 file): 20 points
 */
export function calculateQualityScore(item: RegistryItem): number {
  let score = 0;

  // Has description (20 points)
  // - Must be non-empty and meaningful (> 10 chars)
  if (item.description && item.description.trim().length > 10) {
    score += 20;
  }

  // Has tags (20 points)
  // - Must have at least one tag
  if (item.tags && item.tags.length > 0) {
    score += 20;
  }

  // Has dependencies (20 points)
  // - Array must be defined (even if empty, explicit definition is valuable)
  if (item.dependencies !== undefined) {
    score += 20;
  }

  // Has install command (20 points)
  // - Must have a non-empty install command
  if (item.install && item.install.trim().length > 0) {
    score += 20;
  }

  // Has files (20 points)
  // - Must have at least one file defined
  if (item.files && item.files.length > 0) {
    score += 20;
  }

  return score;
}

/**
 * Determine audit status based on quality score and detected issues.
 */
export function determineStatus(score: number, issues: string[]): AuditStatus {
  // Critical issues always flag
  const criticalIssues = issues.filter(
    (i) =>
      i.includes("Missing install command") || i.includes("Missing description")
  );

  if (criticalIssues.length > 0) {
    return "FLAGGED";
  }

  if (score >= 80) {
    return "VERIFIED";
  }

  if (score >= 40) {
    return "NEEDS_FIX";
  }

  return "FLAGGED";
}

/**
 * Identify issues with a registry item.
 */
export function identifyIssues(item: RegistryItem): string[] {
  const issues: string[] = [];

  // Description issues
  if (!item.description || item.description.trim().length === 0) {
    issues.push("Missing description");
  } else if (item.description.trim().length < 20) {
    issues.push("Description too short (< 20 chars)");
  }

  // Tag issues
  if (!item.tags || item.tags.length === 0) {
    issues.push("Missing tags");
  }

  // Dependencies not defined
  if (item.dependencies === undefined) {
    issues.push("Dependencies array not defined");
  }

  // Install command issues
  if (!item.install || item.install.trim().length === 0) {
    issues.push("Missing install command");
  }

  // Files issues
  if (!item.files || item.files.length === 0) {
    issues.push("No files specified");
  }

  // Additional quality checks
  if (!item.longDescription && item.kind === "agent") {
    issues.push("Agent missing longDescription");
  }

  if (!item.platforms && ["agent", "skill"].includes(item.kind)) {
    issues.push("Missing platforms specification");
  }

  if (!item.compatibility && ["agent", "skill", "mcp"].includes(item.kind)) {
    issues.push("Missing compatibility matrix");
  }

  return issues;
}

/**
 * Audit a single registry item and return detailed results.
 */
export function auditItem(item: RegistryItem): ItemAuditResult {
  const qualityScore = calculateQualityScore(item);
  const issues = identifyIssues(item);
  const status = determineStatus(qualityScore, issues);

  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    qualityScore,
    status,
    issues,
    breakdown: {
      hasDescription: !!(
        item.description && item.description.trim().length > 10
      ),
      hasTags: !!(item.tags && item.tags.length > 0),
      hasDependencies: item.dependencies !== undefined,
      hasInstall: !!(item.install && item.install.trim().length > 0),
      hasFiles: !!(item.files && item.files.length > 0),
    },
  };
}

// ============================================================================
// FULL REGISTRY AUDIT
// ============================================================================

/**
 * Audit all registry items and generate a comprehensive report.
 */
export function auditRegistryItems(
  items: RegistryItem[] = REGISTRY
): AuditReport {
  const generatedAt = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const auditedItems: ItemAuditResult[] = items.map(auditItem);

  // Calculate summary statistics
  const scores = auditedItems.map((i) => i.qualityScore);
  const sortedScores = [...scores].sort((a, b) => a - b);
  const medianScore =
    sortedScores.length % 2 === 0
      ? (sortedScores[sortedScores.length / 2 - 1] +
          sortedScores[sortedScores.length / 2]) /
        2
      : sortedScores[Math.floor(sortedScores.length / 2)];

  // Count by status
  const byStatus = {
    VERIFIED: 0,
    NEEDS_FIX: 0,
    FLAGGED: 0,
    DEPRECATED: 0,
  };
  auditedItems.forEach((i) => byStatus[i.status]++);

  // Count and average by kind
  const byKind: Record<string, { count: number; totalScore: number }> = {};
  auditedItems.forEach((i) => {
    if (!byKind[i.kind]) {
      byKind[i.kind] = { count: 0, totalScore: 0 };
    }
    byKind[i.kind].count++;
    byKind[i.kind].totalScore += i.qualityScore;
  });

  const byKindFinal: Record<string, { count: number; averageScore: number }> =
    {};
  Object.entries(byKind).forEach(([kind, data]) => {
    byKindFinal[kind] = {
      count: data.count,
      averageScore: Math.round(data.totalScore / data.count),
    };
  });

  // Score distribution
  const scoreDistribution = {
    excellent: auditedItems.filter((i) => i.qualityScore >= 80).length,
    good: auditedItems.filter(
      (i) => i.qualityScore >= 60 && i.qualityScore < 80
    ).length,
    fair: auditedItems.filter(
      (i) => i.qualityScore >= 40 && i.qualityScore < 60
    ).length,
    poor: auditedItems.filter((i) => i.qualityScore < 40).length,
  };

  // Aggregate top issues
  const issueCount: Record<string, number> = {};
  auditedItems.forEach((i) => {
    i.issues.forEach((issue) => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
  });
  const topIssues = Object.entries(issueCount)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Items needing attention (FLAGGED or NEEDS_FIX with score < 60)
  const itemsNeedingAttention = auditedItems
    .filter((i) => i.status === "FLAGGED" || i.qualityScore < 60)
    .sort((a, b) => a.qualityScore - b.qualityScore);

  const summary: AuditSummary = {
    totalItems: auditedItems.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    medianScore: Math.round(medianScore),
    byStatus,
    byKind: byKindFinal,
    scoreDistribution,
  };

  return {
    generatedAt,
    summary,
    items: auditedItems,
    topIssues,
    itemsNeedingAttention,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate audit metadata for an item, ready to be added to the registry.
 */
export function generateAuditMetadata(item: RegistryItem): AuditMetadata {
  const qualityScore = calculateQualityScore(item);
  const issues = identifyIssues(item);
  const status = determineStatus(qualityScore, issues);

  return {
    lastAudited: new Date().toISOString().split("T")[0],
    qualityScore,
    status,
    ...(issues.length > 0 && { issues }),
  };
}

/**
 * Batch generate audit metadata for all items.
 * Returns a map of item ID to audit metadata.
 */
export function batchGenerateAuditMetadata(
  items: RegistryItem[] = REGISTRY
): Map<string, AuditMetadata> {
  const result = new Map<string, AuditMetadata>();

  items.forEach((item) => {
    result.set(item.id, generateAuditMetadata(item));
  });

  return result;
}

/**
 * Print a formatted audit report to console.
 */
export function printAuditReport(report: AuditReport): void {
  console.log("\n========================================");
  console.log("       REGISTRY AUDIT REPORT");
  console.log("========================================\n");
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Total Items: ${report.summary.totalItems}`);
  console.log(`Average Score: ${report.summary.averageScore}/100`);
  console.log(`Median Score: ${report.summary.medianScore}/100`);

  console.log("\n--- Status Distribution ---");
  console.log(`  VERIFIED:   ${report.summary.byStatus.VERIFIED}`);
  console.log(`  NEEDS_FIX:  ${report.summary.byStatus.NEEDS_FIX}`);
  console.log(`  FLAGGED:    ${report.summary.byStatus.FLAGGED}`);
  console.log(`  DEPRECATED: ${report.summary.byStatus.DEPRECATED}`);

  console.log("\n--- Score Distribution ---");
  console.log(
    `  Excellent (80-100): ${report.summary.scoreDistribution.excellent}`
  );
  console.log(`  Good (60-79):       ${report.summary.scoreDistribution.good}`);
  console.log(`  Fair (40-59):       ${report.summary.scoreDistribution.fair}`);
  console.log(`  Poor (0-39):        ${report.summary.scoreDistribution.poor}`);

  console.log("\n--- By Kind ---");
  Object.entries(report.summary.byKind).forEach(([kind, data]) => {
    console.log(`  ${kind}: ${data.count} items (avg: ${data.averageScore})`);
  });

  console.log("\n--- Top Issues ---");
  report.topIssues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue.issue} (${issue.count} items)`);
  });

  if (report.itemsNeedingAttention.length > 0) {
    console.log("\n--- Items Needing Attention (Top 10) ---");
    report.itemsNeedingAttention.slice(0, 10).forEach((item) => {
      console.log(`  [${item.qualityScore}] ${item.name} (${item.kind})`);
      item.issues.slice(0, 3).forEach((issue) => {
        console.log(`       - ${issue}`);
      });
    });
  }

  console.log("\n========================================\n");
}

/**
 * Get items that are missing audit metadata.
 */
export function getItemsMissingAudit(
  items: RegistryItem[] = REGISTRY
): RegistryItem[] {
  return items.filter((item) => !item.audit);
}

/**
 * Get items with outdated audits (older than specified days).
 */
export function getItemsWithOutdatedAudit(
  items: RegistryItem[] = REGISTRY,
  maxAgeDays: number = 30
): RegistryItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  return items.filter((item) => {
    if (!item.audit) return true;
    return item.audit.lastAudited < cutoffStr;
  });
}

/**
 * Validate that an item's existing audit metadata matches recalculated values.
 * Returns true if audit is accurate, false if it needs updating.
 */
export function validateExistingAudit(item: RegistryItem): boolean {
  if (!item.audit) return false;

  const recalculated = generateAuditMetadata(item);

  return (
    item.audit.qualityScore === recalculated.qualityScore &&
    item.audit.status === recalculated.status
  );
}

/**
 * Get a summary of audit coverage across the registry.
 */
export function getAuditCoverage(items: RegistryItem[] = REGISTRY): {
  total: number;
  audited: number;
  unaudited: number;
  coveragePercent: number;
} {
  const audited = items.filter((i) => i.audit).length;

  return {
    total: items.length,
    audited,
    unaudited: items.length - audited,
    coveragePercent: Math.round((audited / items.length) * 100),
  };
}
