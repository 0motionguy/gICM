/**
 * Test Dependency Resolution
 * Verifies that dependencies are correctly resolved
 */

const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, 'src', 'lib', 'registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf8');

console.log('🔗 DEPENDENCY RESOLUTION TESTING');
console.log('═'.repeat(60));
console.log('');

// Extract items with dependencies
const itemsWithDeps = [];
const itemRegex = /\{\s+id: "([^"]+)",[\s\S]*?dependencies: \[([^\]]+)\]/g;

let match;
while ((match = itemRegex.exec(registryContent)) !== null) {
  const id = match[1];
  const depsStr = match[2];

  if (depsStr.trim() && !depsStr.includes('//')) {
    const deps = [...depsStr.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    if (deps.length > 0) {
      itemsWithDeps.push({ id, deps });
    }
  }
}

console.log(`📊 Found ${itemsWithDeps.length} items with dependencies\n`);

// Test cases
const testCases = [
  {
    name: 'ICM Anchor Architect',
    id: 'icm-anchor-architect',
    expectedDeps: ['rust-systems-architect', 'solana-guardian-auditor'],
  },
  {
    name: 'Backend API Specialist',
    id: 'backend-api-specialist',
    expectedDeps: ['database-schema-oracle', 'api-design-architect'],
  },
  {
    name: 'Fullstack Orchestrator',
    id: 'fullstack-orchestrator',
    expectedDeps: ['frontend-fusion-engine', 'backend-api-specialist', 'database-schema-oracle'],
  },
];

console.log('🧪 Testing Specific Dependency Cases:\n');

let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const item = itemsWithDeps.find(i => i.id === test.id);

  if (!item) {
    console.log(`   ❌ ${test.name}: Item not found`);
    failed++;
    return;
  }

  const hasAllDeps = test.expectedDeps.every(dep => item.deps.includes(dep));
  const hasExtraDeps = item.deps.length !== test.expectedDeps.length;

  if (hasAllDeps && !hasExtraDeps) {
    console.log(`   ✅ ${test.name}: ${item.deps.length} dependencies`);
    passed++;
  } else {
    console.log(`   ❌ ${test.name}:`);
    console.log(`      Expected: [${test.expectedDeps.join(', ')}]`);
    console.log(`      Got: [${item.deps.join(', ')}]`);
    failed++;
  }
});

// Test deep dependency chains
console.log('\n\n🔍 Analyzing Dependency Chains:\n');

function getDependencyChain(id, visited = new Set()) {
  if (visited.has(id)) {
    return { circular: true, chain: [...visited, id] };
  }

  visited.add(id);

  const item = itemsWithDeps.find(i => i.id === id);
  if (!item || item.deps.length === 0) {
    return { circular: false, depth: visited.size };
  }

  let maxDepth = visited.size;
  for (const dep of item.deps) {
    const result = getDependencyChain(dep, new Set(visited));
    if (result.circular) {
      return result;
    }
    maxDepth = Math.max(maxDepth, result.depth);
  }

  return { circular: false, depth: maxDepth };
}

// Find deepest chains
const chains = itemsWithDeps.map(item => ({
  id: item.id,
  ...getDependencyChain(item.id),
})).sort((a, b) => b.depth - a.depth);

console.log('   Top 5 Deepest Dependency Chains:');
chains.slice(0, 5).forEach((chain, i) => {
  if (chain.circular) {
    console.log(`   ${i + 1}. ❌ ${chain.id}: CIRCULAR DEPENDENCY!`);
  } else {
    console.log(`   ${i + 1}. ${chain.id}: ${chain.depth} levels deep`);
  }
});

// Check for circular dependencies
const circularDeps = chains.filter(c => c.circular);

console.log('\n\n🔄 Circular Dependency Check:\n');
if (circularDeps.length === 0) {
  console.log('   ✅ No circular dependencies detected');
} else {
  console.log(`   ❌ Found ${circularDeps.length} circular dependencies:`);
  circularDeps.forEach(c => {
    console.log(`      ${c.id}: ${c.chain.join(' → ')}`);
  });
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 DEPENDENCY TESTING SUMMARY\n');
console.log(`   Total items with deps: ${itemsWithDeps.length}`);
console.log(`   Test cases passed: ${passed}/${testCases.length}`);
console.log(`   Test cases failed: ${failed}/${testCases.length}`);
console.log(`   Circular dependencies: ${circularDeps.length}`);
console.log(`   Max dependency depth: ${chains[0].depth} levels`);

if (failed === 0 && circularDeps.length === 0) {
  console.log('\n✅ ALL DEPENDENCY TESTS PASSED!');
} else {
  console.log('\n❌ SOME TESTS FAILED!');
}

console.log('\n' + '═'.repeat(60));

process.exit(failed > 0 || circularDeps.length > 0 ? 1 : 0);
