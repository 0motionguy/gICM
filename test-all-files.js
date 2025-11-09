/**
 * PHASE 1: Test ALL File Downloads
 * Validates that every file path exists and is readable
 */

const fs = require('fs');
const path = require('path');

console.log('📁 COMPLETE FILE DOWNLOAD TEST - ALL FILES');
console.log('═'.repeat(70));
console.log('Loading registry...\n');

// Load registries
const registryPath = path.join(__dirname, 'src', 'lib', 'registry.ts');
const settingsPath = path.join(__dirname, 'src', 'lib', 'settings-registry.ts');

const registryContent = fs.readFileSync(registryPath, 'utf8');
const settingsContent = fs.readFileSync(settingsPath, 'utf8');

// Extract all files
function extractFiles(content) {
  const allFiles = [];
  const matches = content.matchAll(/\{\s+id: "([^"]+)",\s+kind: "([^"]+)"[\s\S]*?files: \[([^\]]+)\]/g);

  for (const match of matches) {
    const [, id, kind, filesStr] = match;
    const files = [...filesStr.matchAll(/"([^"]+)"/g)].map(m => m[1]);

    allFiles.push({ id, kind, files });
  }

  return allFiles;
}

const registryItems = extractFiles(registryContent);
const settingItems = extractFiles(settingsContent);
const allItems = [...registryItems, ...settingItems];

// Get flat list of all files
const allFilePaths = allItems.flatMap(item =>
  item.files.map(file => ({
    item: item.id,
    kind: item.kind,
    file: file,
    relativePath: file.replace(/^\.claude\//, ''),
  }))
);

console.log(`📊 Found ${allFilePaths.length} total files across ${allItems.length} items\n`);

// Test file existence
const publicDir = path.join(__dirname, 'public', 'claude');
const results = {
  passed: 0,
  failed: 0,
  totalSize: 0,
  byKind: {
    agent: { passed: 0, failed: 0, size: 0 },
    skill: { passed: 0, failed: 0, size: 0 },
    command: { passed: 0, failed: 0, size: 0 },
    mcp: { passed: 0, failed: 0, size: 0 },
    setting: { passed: 0, failed: 0, size: 0 },
  },
  failures: [],
  fileSizes: [],
};

console.log('Testing file existence and size...\n');

for (const fileInfo of allFilePaths) {
  const fullPath = path.join(publicDir, fileInfo.relativePath);

  try {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    results.passed++;
    results.byKind[fileInfo.kind].passed++;
    results.totalSize += stats.size;
    results.byKind[fileInfo.kind].size += stats.size;
    results.fileSizes.push({ file: fileInfo.file, size: stats.size });

    process.stdout.write('✅');
  } catch (error) {
    results.failed++;
    results.byKind[fileInfo.kind].failed++;
    results.failures.push({
      item: fileInfo.item,
      kind: fileInfo.kind,
      file: fileInfo.file,
      path: fullPath,
      error: error.code,
    });

    process.stdout.write('❌');
  }

  // New line every 50 files
  if ((results.passed + results.failed) % 50 === 0) {
    process.stdout.write(` ${results.passed + results.failed}/${allFilePaths.length}\n`);
  }
}

console.log(`\n\n${'═'.repeat(70)}`);
console.log('📊 FINAL RESULTS\n');
console.log(`Total Files Tested: ${allFilePaths.length}`);
console.log(`Passed: ${results.passed} ✅`);
console.log(`Failed: ${results.failed} ❌`);
console.log(`Success Rate: ${((results.passed / allFilePaths.length) * 100).toFixed(1)}%`);
console.log(`Total Size: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB\n`);

console.log('By Category:');
for (const [kind, stats] of Object.entries(results.byKind)) {
  if (stats.passed + stats.failed > 0) {
    const total = stats.passed + stats.failed;
    const rate = ((stats.passed / total) * 100).toFixed(1);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    const status = stats.failed === 0 ? '✅' : '⚠️';
    console.log(`   ${status} ${kind.padEnd(8)}: ${stats.passed}/${total} (${rate}%) - ${sizeMB} MB`);
  }
}

// File size analysis
if (results.fileSizes.length > 0) {
  const sizes = results.fileSizes.map(f => f.size).sort((a, b) => a - b);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const minSize = sizes[0];
  const maxSize = sizes[sizes.length - 1];
  const medianSize = sizes[Math.floor(sizes.length / 2)];

  console.log('\n📏 File Size Statistics:');
  console.log(`   Average: ${(avgSize / 1024).toFixed(2)} KB`);
  console.log(`   Median:  ${(medianSize / 1024).toFixed(2)} KB`);
  console.log(`   Min:     ${(minSize / 1024).toFixed(2)} KB`);
  console.log(`   Max:     ${(maxSize / 1024).toFixed(2)} KB`);

  // Find largest files
  const largestFiles = results.fileSizes
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  console.log('\n📦 Top 5 Largest Files:');
  largestFiles.forEach((f, i) => {
    const sizeKB = (f.size / 1024).toFixed(2);
    const filename = path.basename(f.file);
    console.log(`   ${i + 1}. ${filename.padEnd(40)} ${sizeKB.padStart(8)} KB`);
  });
}

if (results.failures.length > 0) {
  console.log('\n❌ FAILED FILES:');
  results.failures.forEach(f => {
    console.log(`   ${f.kind}/${f.item}: ${f.file}`);
    console.log(`      Error: ${f.error} - ${f.path}`);
  });
}

console.log('\n' + '═'.repeat(70));

// Save results
const reportPath = path.join(__dirname, 'test-results-files.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalFiles: allFilePaths.length,
  results,
}, null, 2));

console.log(`\n📄 Results saved to: test-results-files.json\n`);

process.exit(results.failed > 0 ? 1 : 0);
