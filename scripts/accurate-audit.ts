/**
 * Accurate Registry Audit using TypeScript imports
 * This script imports the actual registry data for precise analysis
 */

import * as fs from 'fs';
import * as path from 'path';

// Import all registries
import { REGISTRY } from '../src/lib/registry';
import { SETTINGS } from '../src/lib/settings-registry';
import { WORKFLOWS } from '../src/lib/workflows';

interface AuditResult {
  id: string;
  name: string;
  kind: string;
  category: string;
  qualityScore: number;
  status: 'VERIFIED' | 'NEEDS_FIX' | 'FLAGGED';
  hasCompatibility: boolean;
  hasPlatforms: boolean;
  hasAudit: boolean;
  issues: string[];
  missingFields: string[];
}

// All IDs for dependency checking
const allIds = new Set(REGISTRY.map(item => item.id));

function auditItem(item: any): AuditResult {
  const issues: string[] = [];
  const missingFields: string[] = [];
  let score = 0;

  // Check required fields
  if (item.id) score += 10;
  else missingFields.push('id');

  if (item.name && item.name.length > 2) score += 5;
  else missingFields.push('name');

  if (item.description && item.description.length > 20) score += 10;
  else issues.push('Short description');

  if (item.install && item.install.startsWith('npx')) score += 10;
  else issues.push('Missing install command');

  if (item.tags && item.tags.length > 0) score += 10;
  else issues.push('No tags');

  if (item.category) score += 5;
  else missingFields.push('category');

  // Check dependencies exist
  if (item.dependencies && item.dependencies.length > 0) {
    const missingDeps = item.dependencies.filter((d: string) => !allIds.has(d));
    if (missingDeps.length === 0) {
      score += 10;
    } else {
      issues.push(`Missing deps: ${missingDeps.join(', ')}`);
    }
  } else {
    score += 10; // No deps is fine
  }

  // Check compatibility (15 points)
  const hasCompatibility = !!(item.compatibility && item.compatibility.models);
  if (hasCompatibility) {
    score += 15;
  } else {
    issues.push('Missing compatibility');
  }

  // Check platforms (5 points)
  const hasPlatforms = !!(item.platforms && item.platforms.length > 0);
  if (hasPlatforms) {
    score += 5;
  } else {
    issues.push('Missing platforms');
  }

  // Check audit metadata (5 points)
  const hasAudit = !!item.audit;
  if (hasAudit) {
    score += 5;
  }

  // Additional quality points
  if (item.longDescription && item.longDescription.length > 50) score += 5;
  if (item.envKeys) score += 5;
  if (item.modelRecommendation) score += 5;

  // Determine status
  let status: 'VERIFIED' | 'NEEDS_FIX' | 'FLAGGED';
  if (score >= 70) status = 'VERIFIED';
  else if (score >= 50) status = 'NEEDS_FIX';
  else status = 'FLAGGED';

  return {
    id: item.id,
    name: item.name || item.id,
    kind: item.kind,
    category: item.category || 'Unknown',
    qualityScore: Math.min(score, 100),
    status,
    hasCompatibility,
    hasPlatforms,
    hasAudit,
    issues,
    missingFields,
  };
}

function generateReport(results: AuditResult[]): string {
  const date = new Date().toISOString().split('T')[0];

  const verified = results.filter(r => r.status === 'VERIFIED').length;
  const needsFix = results.filter(r => r.status === 'NEEDS_FIX').length;
  const flagged = results.filter(r => r.status === 'FLAGGED').length;
  const withCompat = results.filter(r => r.hasCompatibility).length;
  const withPlatforms = results.filter(r => r.hasPlatforms).length;
  const withAudit = results.filter(r => r.hasAudit).length;
  const avgScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;

  // Count by kind
  const byKind: Record<string, number> = {};
  results.forEach(r => {
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
  });

  return `# Registry Audit Report
Generated: ${date}
Auditor: Claude Code Automated Audit (Accurate Import Method)

## Executive Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Items** | ${results.length} | 100% |
| **VERIFIED** | ${verified} | ${((verified/results.length)*100).toFixed(1)}% |
| **NEEDS_FIX** | ${needsFix} | ${((needsFix/results.length)*100).toFixed(1)}% |
| **FLAGGED** | ${flagged} | ${((flagged/results.length)*100).toFixed(1)}% |
| **Average Quality Score** | ${avgScore.toFixed(1)}/100 | - |

## Field Coverage

| Field | Has Field | Missing | Coverage |
|-------|-----------|---------|----------|
| Compatibility | ${withCompat} | ${results.length - withCompat} | ${((withCompat/results.length)*100).toFixed(1)}% |
| Platforms | ${withPlatforms} | ${results.length - withPlatforms} | ${((withPlatforms/results.length)*100).toFixed(1)}% |
| Audit Metadata | ${withAudit} | ${results.length - withAudit} | ${((withAudit/results.length)*100).toFixed(1)}% |

## Quality Distribution

| Score Range | Count | Percentage |
|-------------|-------|------------|
| 90-100 (Excellent) | ${results.filter(r => r.qualityScore >= 90).length} | ${((results.filter(r => r.qualityScore >= 90).length/results.length)*100).toFixed(1)}% |
| 70-89 (Good) | ${results.filter(r => r.qualityScore >= 70 && r.qualityScore < 90).length} | ${((results.filter(r => r.qualityScore >= 70 && r.qualityScore < 90).length/results.length)*100).toFixed(1)}% |
| 50-69 (Needs Work) | ${results.filter(r => r.qualityScore >= 50 && r.qualityScore < 70).length} | ${((results.filter(r => r.qualityScore >= 50 && r.qualityScore < 70).length/results.length)*100).toFixed(1)}% |
| <50 (Flagged) | ${results.filter(r => r.qualityScore < 50).length} | ${((results.filter(r => r.qualityScore < 50).length/results.length)*100).toFixed(1)}% |

## Items by Kind

| Kind | Count | Verified | Needs Fix | Flagged |
|------|-------|----------|-----------|---------|
${Object.entries(byKind).map(([kind, count]) => {
  const kindResults = results.filter(r => r.kind === kind);
  return `| ${kind} | ${count} | ${kindResults.filter(r => r.status === 'VERIFIED').length} | ${kindResults.filter(r => r.status === 'NEEDS_FIX').length} | ${kindResults.filter(r => r.status === 'FLAGGED').length} |`;
}).join('\n')}

## Platform Support Matrix

Based on explicit \`platforms\` field declarations:

| Platform | Declared Support |
|----------|------------------|
| Claude | ${results.filter(r => r.hasPlatforms).length} (via platforms field) |
| Gemini | ${results.filter(r => r.hasCompatibility).length} (via compatibility) |
| OpenAI | ${results.filter(r => r.hasCompatibility).length} (via compatibility) |

---

## Items Missing Compatibility

These items need the \`compatibility\` field added:

${results.filter(r => !r.hasCompatibility).slice(0, 50).map(r => `- \`${r.id}\` (${r.kind}) - Score: ${r.qualityScore}`).join('\n')}
${results.filter(r => !r.hasCompatibility).length > 50 ? `\n... and ${results.filter(r => !r.hasCompatibility).length - 50} more items\n` : ''}

## Items Missing Platforms

${results.filter(r => !r.hasPlatforms).slice(0, 50).map(r => `- \`${r.id}\` (${r.kind})`).join('\n')}
${results.filter(r => !r.hasPlatforms).length > 50 ? `\n... and ${results.filter(r => !r.hasPlatforms).length - 50} more items\n` : ''}

---

## VERIFIED Items (Score >= 70)

${results.filter(r => r.status === 'VERIFIED').map(r => `- **${r.name}** (\`${r.id}\`) - Score: ${r.qualityScore}`).join('\n') || 'None'}

---

## NEEDS_FIX Items (Score 50-69)

${results.filter(r => r.status === 'NEEDS_FIX').map(r => `- **${r.name}** (\`${r.id}\`) - Score: ${r.qualityScore} - Issues: ${r.issues.join(', ')}`).join('\n') || 'None'}

---

## FLAGGED Items (Score < 50)

${results.filter(r => r.status === 'FLAGGED').slice(0, 30).map(r => `- **${r.name}** (\`${r.id}\`) - Score: ${r.qualityScore} - Issues: ${r.issues.join(', ')}`).join('\n') || 'None'}
${results.filter(r => r.status === 'FLAGGED').length > 30 ? `\n... and ${results.filter(r => r.status === 'FLAGGED').length - 30} more flagged items\n` : ''}

---

## Recommendations

1. **Add compatibility fields** to ${results.length - withCompat} items missing this field
2. **Add platforms field** to ${results.length - withPlatforms} items missing this field
3. **Add audit metadata** to all ${results.length} items for tracking
4. **Review ${flagged} flagged items** for potential improvement

---

*Generated by gICM Accurate Registry Audit Script*
`;
}

async function main() {
  console.log('Starting Accurate Registry Audit...\n');

  // Combine all items
  const allItems = [
    ...REGISTRY,
    ...SETTINGS,
    ...WORKFLOWS,
  ];

  console.log(`Total items from imports: ${allItems.length}`);
  console.log(`- REGISTRY: ${REGISTRY.length}`);
  console.log(`- SETTINGS: ${SETTINGS.length}`);
  console.log(`- WORKFLOWS: ${WORKFLOWS.length}`);

  // Audit each item
  console.log('\nAuditing items...');
  const results = allItems.map(auditItem);

  // Generate statistics
  const verified = results.filter(r => r.status === 'VERIFIED').length;
  const needsFix = results.filter(r => r.status === 'NEEDS_FIX').length;
  const flagged = results.filter(r => r.status === 'FLAGGED').length;
  const withCompat = results.filter(r => r.hasCompatibility).length;
  const withPlatforms = results.filter(r => r.hasPlatforms).length;

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Items: ${results.length}`);
  console.log(`VERIFIED: ${verified} (${((verified/results.length)*100).toFixed(1)}%)`);
  console.log(`NEEDS_FIX: ${needsFix} (${((needsFix/results.length)*100).toFixed(1)}%)`);
  console.log(`FLAGGED: ${flagged} (${((flagged/results.length)*100).toFixed(1)}%)`);
  console.log(`With Compatibility: ${withCompat}`);
  console.log(`With Platforms: ${withPlatforms}`);

  // Generate and save report
  const report = generateReport(results);
  const auditDir = path.join(__dirname, '..', 'audit');
  fs.mkdirSync(auditDir, { recursive: true });

  fs.writeFileSync(path.join(auditDir, 'AUDIT_REPORT.md'), report);
  console.log('\nReport saved to audit/AUDIT_REPORT.md');

  // Save JSON results
  fs.writeFileSync(
    path.join(auditDir, 'audit-results.json'),
    JSON.stringify({ results, summary: { verified, needsFix, flagged, withCompat, withPlatforms } }, null, 2)
  );
  console.log('JSON saved to audit/audit-results.json');

  // List items needing compatibility
  const needsCompat = results.filter(r => !r.hasCompatibility);
  console.log(`\nItems needing compatibility field: ${needsCompat.length}`);

  // Save list of IDs needing updates
  fs.writeFileSync(
    path.join(auditDir, 'needs-compatibility.txt'),
    needsCompat.map(r => r.id).join('\n')
  );
  console.log('IDs saved to audit/needs-compatibility.txt');

  console.log('\nDone!');
}

main().catch(console.error);
