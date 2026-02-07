#!/usr/bin/env tsx
/**
 * Security Hardening CLI
 *
 * One-command security hardening for ClawdBot projects.
 * Auto-fixes the most commonly reported security issues.
 *
 * Usage:
 *   pnpm security:harden          # Fix all issues
 *   pnpm security:harden --dry-run   # Preview fixes
 *   pnpm security:scan            # Scan only (no fixes)
 *
 * This is ClawdBot's USP vs ClawHub (341+ malicious skills, no protection)
 */

import {
  auditProjectSecurity,
  formatAuditResult,
} from "../src/lib/security-audit";
import {
  autoFixSecurityIssues,
  formatFixResult,
} from "../src/lib/security-auto-fix";

const PROJECT_PATH = process.cwd();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "harden";
  const isDryRun = args.includes("--dry-run");
  const isInteractive = args.includes("--interactive");

  console.log("🛡️  ClawdBot Security Hardening");
  console.log("=".repeat(60));
  console.log("");

  // Step 1: Run security audit
  console.log("Running security audit...\n");
  const auditResult = await auditProjectSecurity(PROJECT_PATH);

  // Display audit results
  console.log(formatAuditResult(auditResult));

  // If scan-only mode, exit here
  if (command === "scan" || args.includes("--scan-only")) {
    process.exit(auditResult.summary.criticalCount > 0 ? 1 : 0);
  }

  // Step 2: Auto-fix issues
  if (auditResult.summary.totalIssues === 0) {
    console.log("✅ No security issues found! Your project is secure.\n");
    process.exit(0);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔧 AUTO-FIXING ISSUES");
  console.log("=".repeat(60) + "\n");

  const allIssues = [
    ...auditResult.critical,
    ...auditResult.high,
    ...auditResult.medium,
    ...auditResult.low,
  ];

  const fixResult = await autoFixSecurityIssues(PROJECT_PATH, allIssues, {
    dryRun: isDryRun,
    interactive: isInteractive,
    backupFiles: true,
  });

  // Display fix results
  console.log(formatFixResult(fixResult));

  // Exit with appropriate code
  const hasUnfixed =
    fixResult.summary.failureCount > 0 || fixResult.summary.manualCount > 0;

  if (isDryRun) {
    console.log("ℹ️  Dry run complete. No changes were made.\n");
    console.log("Run without --dry-run to apply fixes.\n");
    process.exit(0);
  }

  if (fixResult.summary.successCount > 0) {
    console.log("🎉 Security hardening complete!\n");
    if (hasUnfixed) {
      console.log("⚠️  Some issues require manual intervention.\n");
      process.exit(1);
    }
    process.exit(0);
  } else {
    console.log(
      "❌ No issues were auto-fixed. Manual intervention required.\n"
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("\n❌ Fatal error during security hardening:");
  console.error(error);
  process.exit(1);
});
