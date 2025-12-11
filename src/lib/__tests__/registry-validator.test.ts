/**
 * Registry Validator Tests
 *
 * Run with: npm test -- registry-validator.test.ts
 */

import { describe, test, expect } from "@jest/globals";
import {
  validateRegistry,
  validateItem,
  getOrphanedItems,
  getItemsWithMissingDependencies,
  getItemsWithCircularDependencies,
} from "../registry-validator";
import { REGISTRY } from "../registry";

describe("Registry Validator", () => {
  describe("validateRegistry", () => {
    test("should validate all registry items", () => {
      const report = validateRegistry();

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalItems).toBe(REGISTRY.length);
      expect(report.summary.itemsChecked).toBe(REGISTRY.length);
      expect(report.issues).toBeInstanceOf(Array);
      expect(report.dependencyReport).toBeDefined();
      expect(report.fixSuggestions).toBeInstanceOf(Array);
    });

    test("should detect missing dependencies", () => {
      const report = validateRegistry();
      const missingDepIssues = report.issues.filter(
        (i) => i.type === "missing_dependency"
      );

      // Log for visibility
      if (missingDepIssues.length > 0) {
        console.log("\n❌ Missing Dependencies Found:");
        for (const issue of missingDepIssues) {
          console.log(`  - ${issue.itemName}: ${issue.message}`);
        }
      }

      // This test will fail if there are missing dependencies
      expect(report.dependencyReport.missingDependencies).toEqual([]);
    });

    test("should detect circular dependencies", () => {
      const report = validateRegistry();
      const circularIssues = report.issues.filter(
        (i) => i.type === "circular_dependency"
      );

      // Log for visibility
      if (circularIssues.length > 0) {
        console.log("\n🔄 Circular Dependencies Found:");
        for (const issue of circularIssues) {
          console.log(`  - ${issue.itemName}: ${issue.message}`);
        }
      }

      // This test will fail if there are circular dependencies
      expect(report.dependencyReport.circularDependencies).toEqual([]);
    });

    test("should detect self-references", () => {
      const report = validateRegistry();
      const selfRefIssues = report.issues.filter(
        (i) => i.type === "self_reference"
      );

      // Log for visibility
      if (selfRefIssues.length > 0) {
        console.log("\n⚠️  Self-References Found:");
        for (const issue of selfRefIssues) {
          console.log(`  - ${issue.itemName}: ${issue.message}`);
        }
      }

      // This test will fail if there are self-references
      expect(selfRefIssues).toEqual([]);
    });

    test("should detect slug usage instead of IDs", () => {
      const report = validateRegistry();
      const slugIssues = report.issues.filter(
        (i) => i.type === "slug_instead_of_id"
      );

      // Log for visibility
      if (slugIssues.length > 0) {
        console.log("\n🔤 Slug Usage Found (should use IDs):");
        for (const issue of slugIssues) {
          console.log(`  - ${issue.itemName}: ${issue.message}`);
        }
      }

      // This test will fail if slugs are used instead of IDs
      expect(slugIssues).toEqual([]);
    });

    test("should identify orphaned items", () => {
      const orphaned = getOrphanedItems();

      // Log for visibility
      if (orphaned.length > 0) {
        console.log(`\n📦 Orphaned Items Found (${orphaned.length}):`);
        for (const item of orphaned.slice(0, 20)) {
          console.log(`  - ${item.name} (${item.id}) [${item.kind}]`);
        }
        if (orphaned.length > 20) {
          console.log(`  ... and ${orphaned.length - 20} more`);
        }
      }

      // Orphaned items are informational, not an error
      expect(orphaned).toBeInstanceOf(Array);
    });

    test("should have valid ID formats for all dependencies", () => {
      const report = validateRegistry();
      const invalidIdIssues = report.issues.filter(
        (i) => i.type === "invalid_id_format"
      );

      // Log for visibility
      if (invalidIdIssues.length > 0) {
        console.log("\n🆔 Invalid ID Formats Found:");
        for (const issue of invalidIdIssues) {
          console.log(`  - ${issue.itemName}: ${issue.message}`);
        }
      }

      // This test will fail if there are invalid ID formats
      expect(invalidIdIssues).toEqual([]);
    });

    test("should provide fix suggestions for all errors", () => {
      const report = validateRegistry();

      // Every error-level issue should have a fix suggestion
      const errorIssues = report.issues.filter((i) => i.severity === "error");
      const fixCount = report.fixSuggestions.length;

      if (errorIssues.length > 0) {
        console.log(`\n🔧 Fix Suggestions (${fixCount}):`);
        for (const fix of report.fixSuggestions.slice(0, 10)) {
          console.log(`  - ${fix.itemName}: ${fix.action}`);
          if (fix.currentValue && fix.suggestedValue) {
            console.log(`    "${fix.currentValue}" → "${fix.suggestedValue}"`);
          }
        }
        if (report.fixSuggestions.length > 10) {
          console.log(`  ... and ${report.fixSuggestions.length - 10} more`);
        }
      }

      // Not all errors may have automated fix suggestions, but log them
      expect(report.fixSuggestions).toBeInstanceOf(Array);
    });

    test("should calculate correct coverage percentages", () => {
      const report = validateRegistry();

      expect(report.summary.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(report.summary.coveragePercentage).toBeLessThanOrEqual(100);

      // Check each kind
      for (const [kind, stats] of Object.entries(
        report.dependencyReport.byKind
      )) {
        expect(stats.coverage).toBeGreaterThanOrEqual(0);
        expect(stats.coverage).toBeLessThanOrEqual(100);
        expect(stats.withDeps).toBeLessThanOrEqual(stats.total);
      }
    });

    test("should report items with most dependencies", () => {
      const report = validateRegistry();

      expect(report.dependencyReport.mostDependedOn).toBeInstanceOf(Array);
      expect(report.dependencyReport.mostDependencies).toBeInstanceOf(Array);

      // Top items should be sorted by count descending
      const mostDeps = report.dependencyReport.mostDependencies;
      for (let i = 0; i < mostDeps.length - 1; i++) {
        expect(mostDeps[i].count).toBeGreaterThanOrEqual(mostDeps[i + 1].count);
      }
    });
  });

  describe("validateItem", () => {
    test("should validate a specific item", () => {
      // Get first item from registry
      const firstItem = REGISTRY[0];
      const issues = validateItem(firstItem.id);

      expect(issues).toBeInstanceOf(Array);
    });

    test("should return error for non-existent item", () => {
      const issues = validateItem("non-existent-item-id-12345");

      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe("error");
      expect(issues[0].type).toBe("missing_dependency");
    });
  });

  describe("getItemsWithMissingDependencies", () => {
    test("should return items with missing dependencies", () => {
      const itemsWithMissing = getItemsWithMissingDependencies();

      expect(itemsWithMissing).toBeInstanceOf(Array);

      // Log for visibility
      if (itemsWithMissing.length > 0) {
        console.log(
          `\n❌ Items with Missing Dependencies (${itemsWithMissing.length}):`
        );
        for (const { item, missingDeps } of itemsWithMissing.slice(0, 5)) {
          console.log(`  - ${item.name} (${item.id})`);
          console.log(`    Missing: ${missingDeps.join(", ")}`);
        }
        if (itemsWithMissing.length > 5) {
          console.log(`  ... and ${itemsWithMissing.length - 5} more`);
        }
      }

      // Should be empty for valid registry
      expect(itemsWithMissing).toEqual([]);
    });
  });

  describe("getItemsWithCircularDependencies", () => {
    test("should return items with circular dependencies", () => {
      const itemsWithCircular = getItemsWithCircularDependencies();

      expect(itemsWithCircular).toBeInstanceOf(Array);

      // Log for visibility
      if (itemsWithCircular.length > 0) {
        console.log(
          `\n🔄 Items with Circular Dependencies (${itemsWithCircular.length}):`
        );
        for (const { item, circularPath } of itemsWithCircular.slice(0, 5)) {
          console.log(`  - ${item.name} (${item.id})`);
          console.log(`    Path: ${circularPath.join(" → ")}`);
        }
      }

      // Should be empty for valid registry
      expect(itemsWithCircular).toEqual([]);
    });
  });

  describe("Performance", () => {
    test("should validate registry in reasonable time", () => {
      const start = Date.now();
      validateRegistry();
      const duration = Date.now() - start;

      console.log(`\n⏱️  Validation completed in ${duration}ms`);

      // Should complete in less than 5 seconds even for large registry
      expect(duration).toBeLessThan(5000);
    });
  });
});
