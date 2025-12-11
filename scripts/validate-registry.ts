#!/usr/bin/env tsx
/**
 * Registry Validation CLI
 *
 * Usage:
 *   npx tsx scripts/validate-registry.ts           # Full validation report
 *   npx tsx scripts/validate-registry.ts --strict  # Exit with error if issues found
 *   npx tsx scripts/validate-registry.ts --json    # Output JSON report
 *   npx tsx scripts/validate-registry.ts --item <id> # Validate specific item
 */

import {
  validateRegistry,
  validateItem,
  generateValidationReport,
  validateRegistryStrict,
  getOrphanedItems,
  getItemsWithMissingDependencies,
  getItemsWithCircularDependencies,
} from "../src/lib/registry-validator";

const args = process.argv.slice(2);
const isStrict = args.includes("--strict");
const isJson = args.includes("--json");
const itemIndex = args.indexOf("--item");
const itemId = itemIndex >= 0 ? args[itemIndex + 1] : null;

async function main() {
  console.log("🔍 Validating gICM Registry...\n");

  try {
    // Validate specific item
    if (itemId) {
      const issues = validateItem(itemId);

      if (isJson) {
        console.log(JSON.stringify(issues, null, 2));
      } else {
        console.log(`\nValidation results for item: ${itemId}\n`);
        if (issues.length === 0) {
          console.log("✅ No issues found!");
        } else {
          for (const issue of issues) {
            console.log(`\n[${issue.severity.toUpperCase()}] ${issue.type}`);
            console.log(`  ${issue.message}`);
            if (issue.suggestion) {
              console.log(`  💡 ${issue.suggestion}`);
            }
          }
        }
      }

      process.exit(issues.some((i) => i.severity === "error") ? 1 : 0);
    }

    // Strict mode - throw on errors
    if (isStrict) {
      validateRegistryStrict();
      console.log("✅ Registry validation passed with no errors!\n");
      process.exit(0);
    }

    // Full validation report
    const report = validateRegistry();

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      const textReport = generateValidationReport(report);
      console.log(textReport);

      // Print summary to console
      if (
        report.summary.errorCount === 0 &&
        report.summary.warningCount === 0
      ) {
        console.log("\n✅ All validation checks passed!\n");
      } else if (report.summary.errorCount === 0) {
        console.log(
          `\n⚠️  Validation completed with ${report.summary.warningCount} warnings\n`
        );
      } else {
        console.log(
          `\n❌ Validation failed with ${report.summary.errorCount} errors and ${report.summary.warningCount} warnings\n`
        );
      }

      // Additional detailed breakdowns
      console.log("\nDETAILED BREAKDOWNS");
      console.log("=".repeat(80));

      // Missing dependencies
      const itemsWithMissing = getItemsWithMissingDependencies();
      if (itemsWithMissing.length > 0) {
        console.log(
          `\nItems with Missing Dependencies (${itemsWithMissing.length}):`
        );
        for (const { item, missingDeps } of itemsWithMissing.slice(0, 10)) {
          console.log(`  - ${item.name} (${item.id})`);
          console.log(`    Missing: ${missingDeps.join(", ")}`);
        }
        if (itemsWithMissing.length > 10) {
          console.log(`  ... and ${itemsWithMissing.length - 10} more`);
        }
      }

      // Circular dependencies
      const itemsWithCircular = getItemsWithCircularDependencies();
      if (itemsWithCircular.length > 0) {
        console.log(
          `\nItems with Circular Dependencies (${itemsWithCircular.length}):`
        );
        for (const { item, circularPath } of itemsWithCircular.slice(0, 5)) {
          console.log(`  - ${item.name} (${item.id})`);
          console.log(`    Path: ${circularPath.join(" → ")}`);
        }
        if (itemsWithCircular.length > 5) {
          console.log(`  ... and ${itemsWithCircular.length - 5} more`);
        }
      }

      // Orphaned items
      const orphaned = getOrphanedItems();
      if (orphaned.length > 0 && orphaned.length <= 20) {
        console.log(`\nOrphaned Items (${orphaned.length}):`);
        for (const item of orphaned) {
          console.log(`  - ${item.name} (${item.id}) [${item.kind}]`);
        }
      } else if (orphaned.length > 20) {
        console.log(
          `\nOrphaned Items: ${orphaned.length} (too many to display)`
        );
      }

      console.log("\n" + "=".repeat(80) + "\n");
    }

    // Exit with appropriate code
    if (report.summary.errorCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Validation failed with error:");
    console.error(error);
    process.exit(1);
  }
}

main();
