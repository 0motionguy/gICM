/**
 * Quick Registry Validation
 *
 * Simple validation script that can be run with: node scripts/quick-validate.mjs
 * No TypeScript compilation needed - uses the dependency-resolver directly
 */

import { validateDependencies } from '../src/lib/dependency-resolver.ts';

console.log('🔍 Quick Registry Validation\n');
console.log('='.repeat(80));

try {
  const report = validateDependencies();

  console.log('\nSUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Items:              ${report.totalItems}`);
  console.log(`Items with Dependencies:  ${report.itemsWithDependencies}`);
  console.log(`Coverage:                 ${report.coveragePercentage}%`);
  console.log(`Missing Dependencies:     ${report.missingDependencies.length}`);
  console.log(`Circular Dependencies:    ${report.circularDependencies.length}`);
  console.log(`Orphaned Items:           ${report.orphanedItems.length}`);

  console.log('\n\nCOVERAGE BY KIND');
  console.log('-'.repeat(80));
  for (const [kind, stats] of Object.entries(report.byKind)) {
    const bar = '█'.repeat(Math.floor(stats.coverage / 5));
    console.log(`${kind.padEnd(20)} ${stats.withDeps}/${stats.total} (${stats.coverage}%) ${bar}`);
  }

  if (report.missingDependencies.length > 0) {
    console.log('\n\n❌ MISSING DEPENDENCIES');
    console.log('-'.repeat(80));
    for (const missing of report.missingDependencies.slice(0, 20)) {
      console.log(`${missing.itemName} (${missing.itemId})`);
      console.log(`  → Missing: "${missing.missingDepId}"`);
    }
    if (report.missingDependencies.length > 20) {
      console.log(`\n... and ${report.missingDependencies.length - 20} more`);
    }
  }

  if (report.circularDependencies.length > 0) {
    console.log('\n\n🔄 CIRCULAR DEPENDENCIES');
    console.log('-'.repeat(80));
    for (const circular of report.circularDependencies.slice(0, 10)) {
      console.log(`Cycle: ${circular.path.join(' → ')}`);
    }
    if (report.circularDependencies.length > 10) {
      console.log(`\n... and ${report.circularDependencies.length - 10} more`);
    }
  }

  if (report.orphanedItems.length > 0 && report.orphanedItems.length <= 30) {
    console.log('\n\n📦 ORPHANED ITEMS (no dependencies, nothing depends on them)');
    console.log('-'.repeat(80));
    console.log(report.orphanedItems.join(', '));
  } else if (report.orphanedItems.length > 30) {
    console.log(`\n\n📦 ORPHANED ITEMS: ${report.orphanedItems.length} (too many to display)`);
  }

  if (report.mostDependedOn.length > 0) {
    console.log('\n\n⭐ MOST DEPENDED ON (Top 10)');
    console.log('-'.repeat(80));
    for (const item of report.mostDependedOn.slice(0, 10)) {
      console.log(`${item.itemName.padEnd(50)} ${item.count} dependents`);
    }
  }

  if (report.mostDependencies.length > 0) {
    console.log('\n\n🔗 MOST DEPENDENCIES (Top 10)');
    console.log('-'.repeat(80));
    for (const item of report.mostDependencies.slice(0, 10)) {
      console.log(`${item.itemName.padEnd(50)} ${item.count} dependencies`);
    }
  }

  console.log('\n' + '='.repeat(80));

  // Exit with appropriate code
  const hasErrors = report.missingDependencies.length > 0 || report.circularDependencies.length > 0;

  if (hasErrors) {
    console.log('\n❌ Validation FAILED - Fix the issues above\n');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED - All dependencies are valid!\n');
    process.exit(0);
  }

} catch (error) {
  console.error('\n❌ Error during validation:');
  console.error(error);
  process.exit(1);
}
