#!/usr/bin/env ts-node
/**
 * Marketplace Quality Audit Script
 *
 * Comprehensive quality scoring for all marketplace items:
 * - Documentation completeness (20%)
 * - Code quality (25%)
 * - Community engagement (15%)
 * - Maintenance activity (15%)
 * - Security posture (25%)
 *
 * Generates audit report with quality scores and recommendations.
 */

import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  existsSync,
} from "fs";
import { join } from "path";
import type { RegistryItem } from "../src/types/registry";

// ============================================================================
// Configuration
// ============================================================================

const REGISTRY_PATH = join(process.cwd(), "public/marketplace/registry.json");
const CACHE_DIR = join(process.cwd(), ".cache");
const AUDIT_REPORT_PATH = join(CACHE_DIR, "audit-report.json");

// Quality scoring weights
const WEIGHTS = {
  documentation: 0.2,
  codeQuality: 0.25,
  community: 0.15,
  maintenance: 0.15,
  security: 0.25,
};

// Quality thresholds
const QUALITY_THRESHOLDS = {
  VERIFIED: 80,
  NEEDS_FIX: 60,
  FLAGGED: 40,
};

// ============================================================================
// Types
// ============================================================================

interface QualityScores {
  documentation: number;
  codeQuality: number;
  community: number;
  maintenance: number;
  security: number;
  overall: number;
}

interface AuditIssue {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  message: string;
  recommendation: string;
}

interface ItemAudit {
  itemId: string;
  itemName: string;
  itemKind: string;
  scores: QualityScores;
  status: "VERIFIED" | "NEEDS_FIX" | "FLAGGED" | "DEPRECATED";
  issues: AuditIssue[];
  strengths: string[];
  lastAudited: string;
}

interface AuditReport {
  timestamp: string;
  totalItems: number;
  verified: number;
  needsFix: number;
  flagged: number;
  deprecated: number;
  averageScore: number;
  audits: ItemAudit[];
}

// ============================================================================
// Registry Loading
// ============================================================================

function loadRegistry(): RegistryItem[] {
  if (!existsSync(REGISTRY_PATH)) {
    console.error(`Registry not found at: ${REGISTRY_PATH}`);
    return [];
  }

  const content = readFileSync(REGISTRY_PATH, "utf-8");
  return JSON.parse(content);
}

// ============================================================================
// Quality Scoring Functions
// ============================================================================

/**
 * Documentation completeness score (0-100)
 */
function scoreDocumentation(item: RegistryItem): number {
  let score = 0;

  // Basic fields (40%)
  if (item.name && item.name.length > 0) score += 10;
  if (item.description && item.description.length > 50) score += 15;
  if (item.longDescription && item.longDescription.length > 200) score += 15;

  // Installation & setup (30%)
  if (item.install && item.install.length > 20) score += 15;
  if (item.setup && item.setup.length > 0) score += 15;

  // Additional docs (30%)
  if (item.docsUrl) score += 10;
  if (item.tags && item.tags.length >= 3) score += 10;
  if (item.screenshot) score += 10;

  return score;
}

/**
 * Code quality score (0-100)
 */
function scoreCodeQuality(item: RegistryItem): number {
  let score = 0;

  // Has dependencies tracked (20%)
  if (item.dependencies && item.dependencies.length > 0) score += 20;

  // Has files list (20%)
  if (item.files && item.files.length > 0) score += 20;

  // Has version (20%)
  if (item.version && /^\d+\.\d+\.\d+$/.test(item.version)) score += 20;

  // Has changelog (20%)
  if (item.changelog) score += 20;

  // Skills v2 compliance (20%)
  if (item.kind === "skill") {
    if (item.skillId) score += 10;
    if (item.progressiveDisclosure) score += 10;
  } else {
    score += 20; // Not applicable for non-skills
  }

  return score;
}

/**
 * Community engagement score (0-100)
 */
function scoreCommunity(item: RegistryItem): number {
  let score = 0;

  // Installs (40%)
  const installs = item.installs || 0;
  if (installs > 1000) score += 40;
  else if (installs > 100) score += 30;
  else if (installs > 10) score += 20;
  else if (installs > 0) score += 10;

  // Remixes (30%)
  const remixes = item.remixes || 0;
  if (remixes > 100) score += 30;
  else if (remixes > 10) score += 20;
  else if (remixes > 0) score += 10;

  // Has repo (30%)
  if (item.repoPath) score += 30;

  return score;
}

/**
 * Maintenance activity score (0-100)
 */
function scoreMaintenance(item: RegistryItem): number {
  let score = 50; // Start neutral

  // Has version (20%)
  if (item.version) score += 20;

  // Has changelog (20%)
  if (item.changelog && item.changelog.length > 100) score += 20;

  // Recent audit (20%)
  if (item.audit?.lastAudited) {
    const auditDate = new Date(item.audit.lastAudited);
    const daysSince =
      (Date.now() - auditDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) score += 20;
    else if (daysSince < 90) score += 10;
  }

  // Not deprecated (20%)
  if (item.audit?.status !== "DEPRECATED") {
    score += 20;
  } else {
    score = 0; // Deprecated items get 0
  }

  return Math.min(100, score);
}

/**
 * Security posture score (0-100)
 */
function scoreSecurity(item: RegistryItem): number {
  let score = 60; // Start neutral-positive

  // Has environment keys documented (20%)
  if (item.envKeys && item.envKeys.length > 0) score += 20;

  // Code execution sandbox (20% for skills)
  if (item.kind === "skill" && item.codeExecution) {
    if (item.codeExecution.sandbox) score += 15;
    if (!item.codeExecution.networkAccess) score += 5;
  } else {
    score += 20; // Not applicable
  }

  // Has dependencies list (20%)
  if (item.dependencies) {
    if (item.dependencies.length === 0)
      score += 20; // No deps is good
    else if (item.dependencies.length < 5) score += 15;
    else if (item.dependencies.length < 10) score += 10;
    else score += 5;
  }

  return Math.min(100, score);
}

/**
 * Calculate overall quality score
 */
function calculateOverallScore(scores: Omit<QualityScores, "overall">): number {
  return (
    scores.documentation * WEIGHTS.documentation +
    scores.codeQuality * WEIGHTS.codeQuality +
    scores.community * WEIGHTS.community +
    scores.maintenance * WEIGHTS.maintenance +
    scores.security * WEIGHTS.security
  );
}

// ============================================================================
// Issue Detection
// ============================================================================

function detectIssues(item: RegistryItem, scores: QualityScores): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Documentation issues
  if (scores.documentation < 50) {
    issues.push({
      severity: "high",
      category: "documentation",
      message: "Insufficient documentation",
      recommendation:
        "Add detailed description, installation guide, and examples",
    });
  }

  if (!item.longDescription) {
    issues.push({
      severity: "medium",
      category: "documentation",
      message: "Missing detailed description",
      recommendation: "Add longDescription field with usage examples",
    });
  }

  // Code quality issues
  if (!item.version) {
    issues.push({
      severity: "medium",
      category: "code-quality",
      message: "No version specified",
      recommendation: "Add semantic version (e.g., 1.0.0)",
    });
  }

  if (item.kind === "skill" && !item.skillId) {
    issues.push({
      severity: "high",
      category: "code-quality",
      message: "Skill missing skillId",
      recommendation: "Add skillId field for Agent Skills v2 compliance",
    });
  }

  // Security issues
  if (
    item.kind === "skill" &&
    item.codeExecution?.networkAccess &&
    !item.codeExecution?.sandbox
  ) {
    issues.push({
      severity: "critical",
      category: "security",
      message: "Network access without sandbox",
      recommendation: "Enable sandbox mode when allowing network access",
    });
  }

  if (item.envKeys && item.envKeys.length > 0 && !item.setup) {
    issues.push({
      severity: "medium",
      category: "security",
      message: "Environment variables required but no setup guide",
      recommendation:
        "Add setup instructions for configuring environment variables",
    });
  }

  // Maintenance issues
  if (scores.maintenance < 40) {
    issues.push({
      severity: "medium",
      category: "maintenance",
      message: "Item appears unmaintained",
      recommendation: "Update version, add changelog, or mark as deprecated",
    });
  }

  return issues;
}

function identifyStrengths(
  item: RegistryItem,
  scores: QualityScores
): string[] {
  const strengths: string[] = [];

  if (scores.documentation >= 80) strengths.push("Excellent documentation");
  if (scores.codeQuality >= 80) strengths.push("High code quality");
  if (scores.community >= 80) strengths.push("Strong community adoption");
  if (scores.security >= 90) strengths.push("Robust security posture");
  if (item.installs && item.installs > 1000)
    strengths.push("Popular with >1000 installs");
  if (item.version && item.changelog)
    strengths.push("Well-maintained with versioning");

  return strengths;
}

// ============================================================================
// Audit Orchestration
// ============================================================================

function auditItem(item: RegistryItem): ItemAudit {
  const scores: Omit<QualityScores, "overall"> = {
    documentation: scoreDocumentation(item),
    codeQuality: scoreCodeQuality(item),
    community: scoreCommunity(item),
    maintenance: scoreMaintenance(item),
    security: scoreSecurity(item),
  };

  const overall = calculateOverallScore(scores);

  const fullScores: QualityScores = {
    ...scores,
    overall,
  };

  // Determine status
  let status: ItemAudit["status"];
  if (item.audit?.status === "DEPRECATED") {
    status = "DEPRECATED";
  } else if (overall >= QUALITY_THRESHOLDS.VERIFIED) {
    status = "VERIFIED";
  } else if (overall >= QUALITY_THRESHOLDS.NEEDS_FIX) {
    status = "NEEDS_FIX";
  } else {
    status = "FLAGGED";
  }

  const issues = detectIssues(item, fullScores);
  const strengths = identifyStrengths(item, fullScores);

  return {
    itemId: item.id,
    itemName: item.name,
    itemKind: item.kind,
    scores: fullScores,
    status,
    issues,
    strengths,
    lastAudited: new Date().toISOString(),
  };
}

async function auditMarketplace(): Promise<AuditReport> {
  console.log("🔍 Starting marketplace quality audit...\n");

  const items = loadRegistry();
  console.log(`Loaded ${items.length} items from registry\n`);

  const audits: ItemAudit[] = [];

  for (const item of items) {
    const audit = auditItem(item);
    audits.push(audit);

    // Print immediate feedback
    const statusIcon = {
      VERIFIED: "✅",
      NEEDS_FIX: "⚠️",
      FLAGGED: "❌",
      DEPRECATED: "🔒",
    }[audit.status];

    console.log(`${statusIcon} ${audit.itemName} (${audit.itemKind})`);
    console.log(`   Overall Score: ${audit.scores.overall.toFixed(1)}/100`);
    console.log(`   Status: ${audit.status}`);

    if (audit.issues.length > 0) {
      const criticalCount = audit.issues.filter(
        (i) => i.severity === "critical"
      ).length;
      const highCount = audit.issues.filter(
        (i) => i.severity === "high"
      ).length;
      if (criticalCount > 0 || highCount > 0) {
        console.log(`   Issues: ${criticalCount} critical, ${highCount} high`);
      }
    }

    console.log("");
  }

  const verified = audits.filter((a) => a.status === "VERIFIED").length;
  const needsFix = audits.filter((a) => a.status === "NEEDS_FIX").length;
  const flagged = audits.filter((a) => a.status === "FLAGGED").length;
  const deprecated = audits.filter((a) => a.status === "DEPRECATED").length;
  const averageScore =
    audits.reduce((sum, a) => sum + a.scores.overall, 0) / audits.length;

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalItems: items.length,
    verified,
    needsFix,
    flagged,
    deprecated,
    averageScore,
    audits,
  };

  return report;
}

// ============================================================================
// Reporting
// ============================================================================

function printSummary(report: AuditReport): void {
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log("📊 AUDIT SUMMARY");
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`Timestamp:        ${report.timestamp}`);
  console.log(`Total Items:      ${report.totalItems}`);
  console.log(`Average Score:    ${report.averageScore.toFixed(1)}/100`);
  console.log("");
  console.log("STATUS BREAKDOWN:");
  console.log(
    `  ✅ Verified:     ${report.verified} (${((report.verified / report.totalItems) * 100).toFixed(1)}%)`
  );
  console.log(
    `  ⚠️  Needs Fix:    ${report.needsFix} (${((report.needsFix / report.totalItems) * 100).toFixed(1)}%)`
  );
  console.log(
    `  ❌ Flagged:      ${report.flagged} (${((report.flagged / report.totalItems) * 100).toFixed(1)}%)`
  );
  console.log(`  🔒 Deprecated:   ${report.deprecated}`);
  console.log("");

  if (report.flagged > 0) {
    console.log("🚨 FLAGGED ITEMS (Quality Score <40):");
    report.audits
      .filter((a) => a.status === "FLAGGED")
      .forEach((a) => {
        console.log(`  ${a.itemName} (${a.scores.overall.toFixed(1)}/100)`);
        a.issues.slice(0, 2).forEach((issue) => {
          console.log(`    - ${issue.message}`);
        });
      });
    console.log("");
  }

  if (report.needsFix > 0) {
    console.log("⚠️  TOP ITEMS NEEDING IMPROVEMENT:");
    report.audits
      .filter((a) => a.status === "NEEDS_FIX")
      .sort((a, b) => a.scores.overall - b.scores.overall)
      .slice(0, 5)
      .forEach((a) => {
        console.log(`  ${a.itemName} (${a.scores.overall.toFixed(1)}/100)`);
        const topIssue = a.issues.find(
          (i) => i.severity === "high" || i.severity === "critical"
        );
        if (topIssue) {
          console.log(`    💡 ${topIssue.recommendation}`);
        }
      });
  }

  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
}

function saveReport(report: AuditReport): void {
  writeFileSync(AUDIT_REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full audit report saved to: ${AUDIT_REPORT_PATH}`);
}

function updateRegistry(report: AuditReport): void {
  console.log("\n🔄 Updating registry with audit metadata...");

  const items = loadRegistry();
  let updated = 0;

  for (const audit of report.audits) {
    const item = items.find((i) => i.id === audit.itemId);
    if (item) {
      item.audit = {
        lastAudited: audit.lastAudited,
        qualityScore: Math.round(audit.scores.overall),
        status: audit.status,
        issues: audit.issues.map((i) => i.message),
      };
      updated++;
    }
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(items, null, 2));
  console.log(`✅ Updated ${updated} items in registry`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    const report = await auditMarketplace();
    printSummary(report);
    saveReport(report);
    updateRegistry(report);

    // Exit with warning if many flagged items
    if (report.flagged > report.totalItems * 0.2) {
      console.log("\n⚠️  Warning: >20% of items flagged for quality issues");
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Fatal error during audit:", error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { auditMarketplace, auditItem };
export type { AuditReport, ItemAudit, QualityScores, AuditIssue };
