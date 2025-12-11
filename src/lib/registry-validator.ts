/**
 * Registry Dependency Validator
 *
 * Comprehensive validation logic to ensure all dependencies are valid:
 * - All dependency IDs reference existing registry items
 * - No circular dependencies exist
 * - No self-references
 * - Dependencies use correct ID format (not slugs)
 * - Identifies orphaned items
 *
 * Export validation functions for use in CI/build process.
 */

import type { RegistryItem } from "@/types/registry";
import { REGISTRY, getItemById } from "./registry";
import {
  validateDependencies as baseValidateDependencies,
  type DependencyReport,
  type MissingDependency,
  type CircularDependency,
} from "./dependency-resolver";

// ============================================================================
// Enhanced Validation Types
// ============================================================================

export interface ValidationIssue {
  itemId: string;
  itemName: string;
  itemKind: string;
  severity: "error" | "warning" | "info";
  type:
    | "missing_dependency"
    | "circular_dependency"
    | "self_reference"
    | "slug_instead_of_id"
    | "orphaned_item"
    | "invalid_id_format";
  message: string;
  suggestion?: string;
}

export interface ValidationReport {
  timestamp: string;
  summary: {
    totalItems: number;
    itemsChecked: number;
    itemsWithDependencies: number;
    itemsValid: number;
    itemsWithIssues: number;
    errorCount: number;
    warningCount: number;
  };
  issues: ValidationIssue[];
  dependencyReport: DependencyReport;
  fixSuggestions: FixSuggestion[];
}

export interface FixSuggestion {
  itemId: string;
  itemName: string;
  action: "remove_dependency" | "update_dependency" | "add_dependency";
  currentValue?: string;
  suggestedValue?: string;
  reason: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates that a dependency ID exists in the registry
 */
function validateDependencyExists(depId: string): boolean {
  return getItemById(depId) !== undefined;
}

/**
 * Validates that an ID is not a slug (slugs contain spaces or special chars)
 */
function validateIdFormat(id: string): boolean {
  // Valid IDs should be kebab-case: lowercase, hyphens, alphanumeric
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(id) || /^[a-z0-9]$/.test(id);
}

/**
 * Checks if a dependency might be a slug instead of an ID
 */
function isProbablySlug(depId: string): boolean {
  const item = REGISTRY.find((i) => i.slug === depId);
  return item !== undefined && !validateDependencyExists(depId);
}

/**
 * Finds the correct ID for a slug
 */
function findIdForSlug(slug: string): string | undefined {
  const item = REGISTRY.find((i) => i.slug === slug);
  return item?.id;
}

/**
 * Checks if an item has a self-reference in dependencies
 */
function hasSelfReference(item: RegistryItem): boolean {
  const deps = item.dependencies || [];
  return deps.includes(item.id);
}

/**
 * Checks if an item is orphaned (no dependencies and nothing depends on it)
 */
function isOrphaned(itemId: string): boolean {
  const item = getItemById(itemId);
  if (!item) return false;

  const hasDependencies = (item.dependencies || []).length > 0;
  const hasDependents = REGISTRY.some((regItem) => {
    const deps = regItem.dependencies || [];
    return deps.includes(itemId);
  });

  return !hasDependencies && !hasDependents;
}

/**
 * Detects if a dependency uses a slug instead of an ID
 */
function detectSlugUsage(
  item: RegistryItem
): { depId: string; correctId: string }[] {
  const deps = item.dependencies || [];
  const slugIssues: { depId: string; correctId: string }[] = [];

  for (const depId of deps) {
    if (isProbablySlug(depId)) {
      const correctId = findIdForSlug(depId);
      if (correctId) {
        slugIssues.push({ depId, correctId });
      }
    }
  }

  return slugIssues;
}

/**
 * Comprehensive validation of all registry items
 */
export function validateRegistry(): ValidationReport {
  const issues: ValidationIssue[] = [];
  const fixSuggestions: FixSuggestion[] = [];
  let itemsValid = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Get base dependency report
  const dependencyReport = baseValidateDependencies();

  // Validate each item
  for (const item of REGISTRY) {
    let itemHasIssues = false;
    const deps = item.dependencies || [];

    // Check 1: Self-references
    if (hasSelfReference(item)) {
      itemHasIssues = true;
      errorCount++;
      issues.push({
        itemId: item.id,
        itemName: item.name,
        itemKind: item.kind,
        severity: "error",
        type: "self_reference",
        message: `Item "${item.name}" references itself in dependencies`,
        suggestion: `Remove "${item.id}" from dependencies array`,
      });

      fixSuggestions.push({
        itemId: item.id,
        itemName: item.name,
        action: "remove_dependency",
        currentValue: item.id,
        reason: "Self-reference detected",
      });
    }

    // Check 2: Invalid ID format in dependencies
    for (const depId of deps) {
      if (!validateIdFormat(depId)) {
        itemHasIssues = true;
        warningCount++;
        issues.push({
          itemId: item.id,
          itemName: item.name,
          itemKind: item.kind,
          severity: "warning",
          type: "invalid_id_format",
          message: `Dependency "${depId}" has invalid ID format (should be kebab-case)`,
          suggestion: "Ensure dependency IDs follow kebab-case format",
        });
      }
    }

    // Check 3: Slug instead of ID
    const slugIssues = detectSlugUsage(item);
    for (const { depId, correctId } of slugIssues) {
      itemHasIssues = true;
      errorCount++;
      issues.push({
        itemId: item.id,
        itemName: item.name,
        itemKind: item.kind,
        severity: "error",
        type: "slug_instead_of_id",
        message: `Dependency "${depId}" appears to be a slug instead of an ID`,
        suggestion: `Use ID "${correctId}" instead of slug "${depId}"`,
      });

      fixSuggestions.push({
        itemId: item.id,
        itemName: item.name,
        action: "update_dependency",
        currentValue: depId,
        suggestedValue: correctId,
        reason: "Slug used instead of ID",
      });
    }

    // Check 4: Missing dependencies (from base report)
    const missingForItem = dependencyReport.missingDependencies.filter(
      (m) => m.itemId === item.id
    );
    for (const missing of missingForItem) {
      itemHasIssues = true;
      errorCount++;
      issues.push({
        itemId: item.id,
        itemName: item.name,
        itemKind: item.kind,
        severity: "error",
        type: "missing_dependency",
        message: `Dependency "${missing.missingDepId}" does not exist in registry`,
        suggestion: `Remove invalid dependency or add missing item to registry`,
      });

      fixSuggestions.push({
        itemId: item.id,
        itemName: item.name,
        action: "remove_dependency",
        currentValue: missing.missingDepId,
        reason: "Dependency does not exist in registry",
      });
    }

    // Check 5: Circular dependencies (from base report)
    for (const circular of dependencyReport.circularDependencies) {
      if (circular.path.includes(item.id)) {
        itemHasIssues = true;
        errorCount++;
        issues.push({
          itemId: item.id,
          itemName: item.name,
          itemKind: item.kind,
          severity: "error",
          type: "circular_dependency",
          message: `Circular dependency detected: ${circular.path.join(" -> ")}`,
          suggestion: "Break the circular dependency chain",
        });
      }
    }

    // Check 6: Orphaned items (info level)
    if (isOrphaned(item.id)) {
      itemHasIssues = true;
      issues.push({
        itemId: item.id,
        itemName: item.name,
        itemKind: item.kind,
        severity: "info",
        type: "orphaned_item",
        message: `Item has no dependencies and nothing depends on it`,
        suggestion:
          "Consider adding relevant dependencies or removing if unused",
      });
    }

    if (!itemHasIssues) {
      itemsValid++;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalItems: REGISTRY.length,
      itemsChecked: REGISTRY.length,
      itemsWithDependencies: dependencyReport.itemsWithDependencies,
      itemsValid,
      itemsWithIssues: REGISTRY.length - itemsValid,
      errorCount,
      warningCount,
    },
    issues: issues.sort((a, b) => {
      // Sort by severity: error > warning > info
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    dependencyReport,
    fixSuggestions,
  };
}

/**
 * Validates a specific item's dependencies
 */
export function validateItem(itemId: string): ValidationIssue[] {
  const item = getItemById(itemId);
  if (!item) {
    return [
      {
        itemId,
        itemName: "Unknown",
        itemKind: "unknown",
        severity: "error",
        type: "missing_dependency",
        message: `Item with ID "${itemId}" not found in registry`,
      },
    ];
  }

  const fullReport = validateRegistry();
  return fullReport.issues.filter((issue) => issue.itemId === itemId);
}

/**
 * Generates a human-readable validation report
 */
export function generateValidationReport(report: ValidationReport): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("REGISTRY DEPENDENCY VALIDATION REPORT");
  lines.push("=".repeat(80));
  lines.push("");
  lines.push(`Generated: ${report.timestamp}`);
  lines.push("");

  // Summary
  lines.push("SUMMARY");
  lines.push("-".repeat(80));
  lines.push(`Total Items:              ${report.summary.totalItems}`);
  lines.push(
    `Items with Dependencies:  ${report.summary.itemsWithDependencies}`
  );
  lines.push(`Items Valid:              ${report.summary.itemsValid}`);
  lines.push(`Items with Issues:        ${report.summary.itemsWithIssues}`);
  lines.push(`Errors:                   ${report.summary.errorCount}`);
  lines.push(`Warnings:                 ${report.summary.warningCount}`);
  lines.push("");

  // Dependency Statistics
  lines.push("DEPENDENCY STATISTICS");
  lines.push("-".repeat(80));
  lines.push(
    `Coverage:                 ${report.dependencyReport.coveragePercentage}%`
  );
  lines.push(
    `Missing Dependencies:     ${report.dependencyReport.missingDependencies.length}`
  );
  lines.push(
    `Circular Dependencies:    ${report.dependencyReport.circularDependencies.length}`
  );
  lines.push(
    `Orphaned Items:           ${report.dependencyReport.orphanedItems.length}`
  );
  lines.push("");

  // Coverage by Kind
  lines.push("COVERAGE BY KIND");
  lines.push("-".repeat(80));
  for (const [kind, stats] of Object.entries(report.dependencyReport.byKind)) {
    lines.push(
      `${kind.padEnd(20)} ${stats.withDeps}/${stats.total} (${stats.coverage}%)`
    );
  }
  lines.push("");

  // Issues
  if (report.issues.length > 0) {
    lines.push("ISSUES");
    lines.push("-".repeat(80));

    const errorIssues = report.issues.filter((i) => i.severity === "error");
    const warningIssues = report.issues.filter((i) => i.severity === "warning");
    const infoIssues = report.issues.filter((i) => i.severity === "info");

    if (errorIssues.length > 0) {
      lines.push("");
      lines.push(`ERRORS (${errorIssues.length})`);
      lines.push("");
      for (const issue of errorIssues) {
        lines.push(
          `[${issue.type.toUpperCase()}] ${issue.itemName} (${issue.itemId})`
        );
        lines.push(`  ${issue.message}`);
        if (issue.suggestion) {
          lines.push(`  Suggestion: ${issue.suggestion}`);
        }
        lines.push("");
      }
    }

    if (warningIssues.length > 0) {
      lines.push("");
      lines.push(`WARNINGS (${warningIssues.length})`);
      lines.push("");
      for (const issue of warningIssues) {
        lines.push(
          `[${issue.type.toUpperCase()}] ${issue.itemName} (${issue.itemId})`
        );
        lines.push(`  ${issue.message}`);
        if (issue.suggestion) {
          lines.push(`  Suggestion: ${issue.suggestion}`);
        }
        lines.push("");
      }
    }

    if (infoIssues.length > 0 && infoIssues.length <= 20) {
      lines.push("");
      lines.push(`INFO (${infoIssues.length})`);
      lines.push("");
      for (const issue of infoIssues) {
        lines.push(
          `[${issue.type.toUpperCase()}] ${issue.itemName} (${issue.itemId})`
        );
        lines.push(`  ${issue.message}`);
        lines.push("");
      }
    } else if (infoIssues.length > 20) {
      lines.push("");
      lines.push(`INFO (${infoIssues.length} - too many to display)`);
      lines.push("");
    }
  } else {
    lines.push("NO ISSUES FOUND - All dependencies are valid!");
    lines.push("");
  }

  // Fix Suggestions
  if (report.fixSuggestions.length > 0) {
    lines.push("");
    lines.push("FIX SUGGESTIONS");
    lines.push("-".repeat(80));
    for (const fix of report.fixSuggestions) {
      lines.push(`${fix.itemName} (${fix.itemId})`);
      lines.push(`  Action: ${fix.action}`);
      if (fix.currentValue) {
        lines.push(`  Current: "${fix.currentValue}"`);
      }
      if (fix.suggestedValue) {
        lines.push(`  Suggested: "${fix.suggestedValue}"`);
      }
      lines.push(`  Reason: ${fix.reason}`);
      lines.push("");
    }
  }

  // Most Depended On
  if (report.dependencyReport.mostDependedOn.length > 0) {
    lines.push("");
    lines.push("MOST DEPENDED ON (Top 10)");
    lines.push("-".repeat(80));
    for (const item of report.dependencyReport.mostDependedOn.slice(0, 10)) {
      lines.push(`${item.itemName.padEnd(40)} ${item.count} dependents`);
    }
    lines.push("");
  }

  // Most Dependencies
  if (report.dependencyReport.mostDependencies.length > 0) {
    lines.push("");
    lines.push("MOST DEPENDENCIES (Top 10)");
    lines.push("-".repeat(80));
    for (const item of report.dependencyReport.mostDependencies.slice(0, 10)) {
      lines.push(`${item.itemName.padEnd(40)} ${item.count} dependencies`);
    }
    lines.push("");
  }

  lines.push("=".repeat(80));
  return lines.join("\n");
}

/**
 * Validates registry and throws if errors found (for CI/build)
 */
export function validateRegistryStrict(): void {
  const report = validateRegistry();

  if (report.summary.errorCount > 0) {
    const errorReport = generateValidationReport(report);
    throw new Error(
      `Registry validation failed with ${report.summary.errorCount} errors:\n\n${errorReport}`
    );
  }
}

/**
 * Returns a list of all orphaned items
 */
export function getOrphanedItems(): RegistryItem[] {
  return REGISTRY.filter((item) => isOrphaned(item.id));
}

/**
 * Returns a list of all items with missing dependencies
 */
export function getItemsWithMissingDependencies(): {
  item: RegistryItem;
  missingDeps: string[];
}[] {
  const result: { item: RegistryItem; missingDeps: string[] }[] = [];

  for (const item of REGISTRY) {
    const deps = item.dependencies || [];
    const missing = deps.filter((depId) => !validateDependencyExists(depId));

    if (missing.length > 0) {
      result.push({ item, missingDeps: missing });
    }
  }

  return result;
}

/**
 * Returns a list of all items with circular dependencies
 */
export function getItemsWithCircularDependencies(): {
  item: RegistryItem;
  circularPath: string[];
}[] {
  const report = baseValidateDependencies();
  const result: { item: RegistryItem; circularPath: string[] }[] = [];

  for (const circular of report.circularDependencies) {
    for (const itemId of circular.path) {
      const item = getItemById(itemId);
      if (item && !result.some((r) => r.item.id === itemId)) {
        result.push({ item, circularPath: circular.path });
      }
    }
  }

  return result;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  validateRegistry,
  validateItem,
  generateValidationReport,
  validateRegistryStrict,
  getOrphanedItems,
  getItemsWithMissingDependencies,
  getItemsWithCircularDependencies,
};
