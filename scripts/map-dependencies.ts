#!/usr/bin/env ts-node
/**
 * Bulk Dependency Mapping CLI
 *
 * Runs dependency detection for all registry items and generates
 * comprehensive reports with confidence-based categorization.
 *
 * Usage:
 *   npx ts-node scripts/map-dependencies.ts --dry-run --verbose
 *   npx ts-node scripts/map-dependencies.ts --min-confidence=80
 *   npx ts-node scripts/map-dependencies.ts --report-only --output=reports/deps.json
 *
 * Features:
 * - Load all registry items from src/lib/registry.ts
 * - Run dependency detection for each item
 * - Apply confidence thresholds:
 *   - 90-100: Auto-add
 *   - 70-89:  Add with comment (review recommended)
 *   - 50-69:  Add to review file
 *   - <50:    Discard
 * - Generate JSON report with coverage metrics
 * - Non-destructive: only add, never overwrite existing dependencies
 * - Dry-run mode for testing
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import type { RegistryItem, ItemKind } from "../src/types/registry";
import {
  batchDetectDependencies,
  type DependencyCandidate,
  type DetectionResult,
} from "../src/lib/dependency-mapper";

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CLIOptions {
  dryRun: boolean;
  verbose: boolean;
  reportOnly: boolean;
  minConfidence: number;
  output: string;
  help: boolean;
  kinds: ItemKind[];
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    dryRun: false,
    verbose: false,
    reportOnly: false,
    minConfidence: 50,
    output: "reports/dependency-mapping.json",
    help: false,
    kinds: [],
  };

  for (const arg of args) {
    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--report-only" || arg === "-r") {
      options.reportOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg.startsWith("--min-confidence=")) {
      const value = parseInt(arg.split("=")[1], 10);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        options.minConfidence = value;
      }
    } else if (arg.startsWith("--output=")) {
      options.output = arg.split("=")[1];
    } else if (arg.startsWith("--kind=")) {
      const kind = arg.split("=")[1] as ItemKind;
      if (
        [
          "agent",
          "skill",
          "command",
          "mcp",
          "setting",
          "workflow",
          "component",
        ].includes(kind)
      ) {
        options.kinds.push(kind);
      }
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Bulk Dependency Mapping CLI

USAGE:
  npx ts-node scripts/map-dependencies.ts [OPTIONS]

OPTIONS:
  -d, --dry-run              Don't write any changes, just report what would happen
  -v, --verbose              Print detailed information for each item
  -r, --report-only          Only generate report, don't modify registry
  -h, --help                 Show this help message

  --min-confidence=N         Minimum confidence threshold (0-100, default: 50)
  --output=PATH              Output path for JSON report (default: reports/dependency-mapping.json)
  --kind=TYPE                Filter by item kind (agent, skill, command, mcp, setting, workflow, component)
                             Can be specified multiple times

EXAMPLES:
  # Dry run with verbose output
  npx ts-node scripts/map-dependencies.ts --dry-run --verbose

  # Only auto-add high-confidence dependencies (90+)
  npx ts-node scripts/map-dependencies.ts --min-confidence=90

  # Generate report only, custom output path
  npx ts-node scripts/map-dependencies.ts --report-only --output=reports/deps.json

  # Map dependencies for agents only
  npx ts-node scripts/map-dependencies.ts --kind=agent --verbose

CONFIDENCE THRESHOLDS:
  90-100  Auto-add (high confidence, pattern/content matches)
  70-89   Add with review comment (medium-high confidence)
  50-69   Add to review file only (needs manual verification)
  <50     Discarded (too low confidence)
`);
}

// ============================================================================
// Types
// ============================================================================

interface DependencyChange {
  itemId: string;
  itemName: string;
  itemKind: ItemKind;
  action: "auto-add" | "review-add" | "manual-review" | "discarded";
  dependencyId: string;
  confidence: number;
  reason: string;
  source: string;
}

interface KindSummary {
  total: number;
  withDeps: number;
  withNewSuggestions: number;
  totalSuggestions: number;
  autoAdd: number;
  reviewAdd: number;
  manualReview: number;
}

interface MappingReport {
  summary: {
    totalItems: number;
    itemsWithDeps: number;
    itemsWithNewSuggestions: number;
    coveragePercentage: number;
    totalAutoAdd: number;
    totalReviewAdd: number;
    totalManualReview: number;
    totalDiscarded: number;
  };
  byKind: Record<string, KindSummary>;
  changes: DependencyChange[];
  reviewQueue: DependencyChange[];
  timestamp: string;
  options: CLIOptions;
}

// ============================================================================
// Registry Loading
// ============================================================================

/**
 * Load registry items from the registry file
 * Uses dynamic import to handle the TypeScript module
 */
async function loadRegistry(): Promise<RegistryItem[]> {
  // Import the registry module dynamically
  const registryModule = await import("../src/lib/registry");
  return registryModule.REGISTRY;
}

// ============================================================================
// Dependency Processing
// ============================================================================

/**
 * Categorize a dependency candidate by confidence threshold
 */
function categorizeByConfidence(
  confidence: number
): "auto-add" | "review-add" | "manual-review" | "discarded" {
  if (confidence >= 90) return "auto-add";
  if (confidence >= 70) return "review-add";
  if (confidence >= 50) return "manual-review";
  return "discarded";
}

/**
 * Process detection results and generate changes list
 */
function processResults(
  results: Map<string, DetectionResult>,
  items: RegistryItem[],
  minConfidence: number
): DependencyChange[] {
  const changes: DependencyChange[] = [];
  const itemMap = new Map(items.map((i) => [i.id, i]));

  for (const [itemId, result] of results) {
    const item = itemMap.get(itemId);
    if (!item) continue;

    for (const suggestion of result.newSuggestions) {
      if (suggestion.confidence < minConfidence) continue;

      const action = categorizeByConfidence(suggestion.confidence);

      changes.push({
        itemId: item.id,
        itemName: item.name,
        itemKind: item.kind,
        action,
        dependencyId: suggestion.targetId,
        confidence: suggestion.confidence,
        reason: suggestion.reason,
        source: suggestion.source,
      });
    }
  }

  return changes;
}

/**
 * Generate summary statistics by item kind
 */
function generateKindSummary(
  results: Map<string, DetectionResult>,
  items: RegistryItem[],
  changes: DependencyChange[]
): Record<string, KindSummary> {
  const summary: Record<string, KindSummary> = {};
  const itemMap = new Map(items.map((i) => [i.id, i]));

  // Initialize summaries for all kinds
  const kinds: ItemKind[] = [
    "agent",
    "skill",
    "command",
    "mcp",
    "setting",
    "workflow",
    "component",
  ];
  for (const kind of kinds) {
    summary[kind] = {
      total: 0,
      withDeps: 0,
      withNewSuggestions: 0,
      totalSuggestions: 0,
      autoAdd: 0,
      reviewAdd: 0,
      manualReview: 0,
    };
  }

  // Count totals
  for (const item of items) {
    summary[item.kind].total++;
    if (item.dependencies && item.dependencies.length > 0) {
      summary[item.kind].withDeps++;
    }
  }

  // Count suggestions
  for (const [itemId, result] of results) {
    const item = itemMap.get(itemId);
    if (!item) continue;

    if (result.newSuggestions.length > 0) {
      summary[item.kind].withNewSuggestions++;
      summary[item.kind].totalSuggestions += result.newSuggestions.length;
    }
  }

  // Count by action
  for (const change of changes) {
    if (change.action === "auto-add") {
      summary[change.itemKind].autoAdd++;
    } else if (change.action === "review-add") {
      summary[change.itemKind].reviewAdd++;
    } else if (change.action === "manual-review") {
      summary[change.itemKind].manualReview++;
    }
  }

  return summary;
}

/**
 * Generate the full mapping report
 */
function generateReport(
  items: RegistryItem[],
  results: Map<string, DetectionResult>,
  changes: DependencyChange[],
  options: CLIOptions
): MappingReport {
  const itemsWithDeps = items.filter(
    (i) => i.dependencies && i.dependencies.length > 0
  ).length;
  const itemsWithNewSuggestions = new Set(changes.map((c) => c.itemId)).size;

  const autoAdd = changes.filter((c) => c.action === "auto-add").length;
  const reviewAdd = changes.filter((c) => c.action === "review-add").length;
  const manualReview = changes.filter(
    (c) => c.action === "manual-review"
  ).length;
  const discarded = changes.filter((c) => c.action === "discarded").length;

  // Calculate total discarded from all results
  let totalDiscarded = 0;
  for (const [, result] of results) {
    totalDiscarded += result.newSuggestions.filter(
      (s) => s.confidence < options.minConfidence
    ).length;
  }

  const byKind = generateKindSummary(results, items, changes);

  return {
    summary: {
      totalItems: items.length,
      itemsWithDeps,
      itemsWithNewSuggestions,
      coveragePercentage: parseFloat(
        ((itemsWithDeps / items.length) * 100).toFixed(1)
      ),
      totalAutoAdd: autoAdd,
      totalReviewAdd: reviewAdd,
      totalManualReview: manualReview,
      totalDiscarded,
    },
    byKind,
    changes: changes.filter((c) => c.action !== "discarded"),
    reviewQueue: changes.filter((c) => c.action === "manual-review"),
    timestamp: new Date().toISOString(),
    options,
  };
}

// ============================================================================
// Output & Reporting
// ============================================================================

/**
 * Print verbose information for an item
 */
function printItemVerbose(
  item: RegistryItem,
  result: DetectionResult,
  changes: DependencyChange[]
): void {
  const itemChanges = changes.filter((c) => c.itemId === item.id);
  const hasChanges = itemChanges.length > 0;

  const icon = hasChanges ? "+" : "-";
  console.log(`\n[${icon}] ${item.name} (${item.kind})`);
  console.log(`    ID: ${item.id}`);
  console.log(
    `    Existing deps: ${result.existingDependencies.length > 0 ? result.existingDependencies.join(", ") : "none"}`
  );

  if (hasChanges) {
    console.log(`    New suggestions: ${itemChanges.length}`);
    for (const change of itemChanges) {
      const actionIcon =
        change.action === "auto-add"
          ? "A"
          : change.action === "review-add"
            ? "R"
            : "M";
      console.log(
        `      [${actionIcon}] ${change.dependencyId} (${change.confidence}%)`
      );
      console.log(`          Reason: ${change.reason.substring(0, 80)}...`);
    }
  }
}

/**
 * Print summary to console
 */
function printSummary(report: MappingReport): void {
  console.log("\n" + "=".repeat(70));
  console.log("DEPENDENCY MAPPING SUMMARY");
  console.log("=".repeat(70));
  console.log(`Timestamp:              ${report.timestamp}`);
  console.log(`Total Items:            ${report.summary.totalItems}`);
  console.log(`Items with Deps:        ${report.summary.itemsWithDeps}`);
  console.log(`Coverage:               ${report.summary.coveragePercentage}%`);
  console.log("");
  console.log("CHANGES BY ACTION:");
  console.log(`  Auto-add (90-100):    ${report.summary.totalAutoAdd}`);
  console.log(`  Review-add (70-89):   ${report.summary.totalReviewAdd}`);
  console.log(`  Manual review (50-69): ${report.summary.totalManualReview}`);
  console.log(
    `  Discarded (<${report.options.minConfidence}):       ${report.summary.totalDiscarded}`
  );
  console.log("");
  console.log("BY KIND:");

  for (const [kind, stats] of Object.entries(report.byKind)) {
    if (stats.total === 0) continue;
    const coverage = ((stats.withDeps / stats.total) * 100).toFixed(1);
    console.log(
      `  ${kind.padEnd(12)} ${stats.total} items, ${stats.withDeps} with deps (${coverage}%), +${stats.autoAdd + stats.reviewAdd} suggested`
    );
  }

  console.log("=".repeat(70));
}

/**
 * Save report to JSON file
 */
function saveReport(report: MappingReport, outputPath: string): void {
  const fullPath = join(process.cwd(), outputPath);
  const dir = dirname(fullPath);

  // Ensure output directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(fullPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nReport saved to: ${fullPath}`);
}

/**
 * Save review queue to separate file
 */
function saveReviewQueue(
  changes: DependencyChange[],
  outputPath: string
): void {
  const reviewChanges = changes.filter(
    (c) => c.action === "manual-review" || c.action === "review-add"
  );

  if (reviewChanges.length === 0) return;

  const reviewPath = outputPath.replace(".json", "-review.json");
  const fullPath = join(process.cwd(), reviewPath);

  writeFileSync(fullPath, JSON.stringify(reviewChanges, null, 2), "utf-8");
  console.log(`Review queue saved to: ${fullPath}`);
}

// ============================================================================
// Registry Update
// ============================================================================

/**
 * Apply dependency changes to the registry
 * NOTE: This modifies the registry source file - use with caution!
 */
function applyChangesToRegistry(
  changes: DependencyChange[],
  dryRun: boolean
): number {
  if (dryRun) {
    console.log("\n[DRY RUN] Would apply the following changes:");
    const autoAddChanges = changes.filter((c) => c.action === "auto-add");
    const reviewAddChanges = changes.filter((c) => c.action === "review-add");

    console.log(`  Auto-add: ${autoAddChanges.length} dependencies`);
    console.log(`  Review-add: ${reviewAddChanges.length} dependencies`);
    return autoAddChanges.length + reviewAddChanges.length;
  }

  // In a real implementation, this would:
  // 1. Parse the registry.ts file
  // 2. Find each item by ID
  // 3. Add the new dependencies (preserving existing ones)
  // 4. Write the file back

  // For safety, we only output what would be changed
  // The actual registry modification should be done manually or via a separate tool
  console.log("\n[INFO] Registry modification is manual-only for safety.");
  console.log("Use the generated report to update the registry manually.");

  return 0;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log("Dependency Mapping CLI v1.0.0");
  console.log("".padEnd(50, "-"));
  console.log(
    `Mode: ${options.dryRun ? "DRY RUN" : options.reportOnly ? "REPORT ONLY" : "FULL"}`
  );
  console.log(`Min Confidence: ${options.minConfidence}`);
  console.log(`Output: ${options.output}`);
  if (options.kinds.length > 0) {
    console.log(`Filtering kinds: ${options.kinds.join(", ")}`);
  }
  console.log("");

  // Load registry
  console.log("Loading registry...");
  let items: RegistryItem[];
  try {
    items = await loadRegistry();
    console.log(`Loaded ${items.length} items from registry`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load registry: ${message}`);
    process.exit(1);
  }

  // Filter by kind if specified
  if (options.kinds.length > 0) {
    items = items.filter((item) => options.kinds.includes(item.kind));
    console.log(
      `Filtered to ${items.length} items of kinds: ${options.kinds.join(", ")}`
    );
  }

  // Run dependency detection
  console.log("\nRunning dependency detection...");
  const results = batchDetectDependencies(items);
  console.log(`Processed ${results.size} items`);

  // Process results
  const changes = processResults(results, items, options.minConfidence);
  console.log(`Found ${changes.length} potential dependency changes`);

  // Print verbose output if requested
  if (options.verbose) {
    console.log("\n--- DETAILED RESULTS ---");
    for (const item of items) {
      const result = results.get(item.id);
      if (result) {
        printItemVerbose(item, result, changes);
      }
    }
  }

  // Generate report
  const report = generateReport(items, results, changes, options);

  // Print summary
  printSummary(report);

  // Save reports
  saveReport(report, options.output);
  saveReviewQueue(changes, options.output);

  // Apply changes if not report-only
  if (!options.reportOnly) {
    const applied = applyChangesToRegistry(changes, options.dryRun);
    if (options.dryRun) {
      console.log(`\n[DRY RUN] Would apply ${applied} dependency changes`);
    }
  }

  // Exit code based on results
  if (report.summary.totalManualReview > 10) {
    console.log(
      "\nWARNING: Many items need manual review. Check the review queue."
    );
  }

  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });
}

// Export for testing
export {
  parseArgs,
  categorizeByConfidence,
  processResults,
  generateReport,
  type MappingReport,
  type DependencyChange,
  type CLIOptions,
};
