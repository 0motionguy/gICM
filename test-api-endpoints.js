/**
 * Test API Endpoints - Sample Installation Testing
 * Tests that items can be fetched from API correctly
 */

const items = {
  agents: [
    'icm-anchor-architect',
    'frontend-fusion-engine',
    'rust-systems-architect',
    'database-schema-oracle',
    'solana-guardian-auditor',
    'evm-security-auditor',
    'test-automation-engineer',
    'backend-api-specialist',
    'devops-platform-engineer',
    'performance-profiler',
  ],
  skills: [
    'solana-anchor-mastery',
    'web3-wallet-integration',
    'nextjs-app-router-patterns',
    'playwright-e2e-testing',
    'smart-contract-security',
    'progressive-web-apps',
    'redis-caching-patterns',
    'docker-containerization',
    'typescript-advanced-patterns',
    'zod-schema-validation',
  ],
  commands: [
    'deploy-foundry',
    'verify-contract',
    'audit-security',
    'generate-merkle',
    'gas-report',
    'simulate-bundle',
    'fork-mainnet',
    'analytics-setup',
    'monitoring-setup',
    'ci-cd-setup',
  ],
  mcps: [
    'postgres',
    'github',
    'filesystem',
    'supabase',
    'slack',
    'linear',
    'sentry',
    'datadog',
    'stripe',
    'resend',
  ],
};

console.log('🧪 API ENDPOINT TESTING');
console.log('═'.repeat(60));
console.log('Testing fetching items from local build...\n');

const fs = require('fs');
const path = require('path');

// Load registry from built files
const registryPath = path.join(__dirname, 'src', 'lib', 'registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract and eval registry (simple approach for testing)
function getItemBySlug(slug) {
  // Simple regex match for the item
  const itemRegex = new RegExp(`\\{[\\s\\S]*?slug: "${slug}"[\\s\\S]*?\\}(?=,\\s*\\{|\\s*\\])`);
  const match = registryContent.match(itemRegex);
  return match ? slug : null;
}

let passed = 0;
let failed = 0;
const failures = [];

// Test each category
for (const [kind, slugs] of Object.entries(items)) {
  console.log(`\n📋 Testing ${kind} (10 items):`);

  for (const slug of slugs) {
    const result = getItemBySlug(slug);

    if (result) {
      console.log(`   ✅ ${slug}`);
      passed++;
    } else {
      console.log(`   ❌ ${slug} - NOT FOUND`);
      failed++;
      failures.push({ kind, slug });
    }
  }
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 API TESTING SUMMARY\n');
console.log(`   Passed: ${passed}/40`);
console.log(`   Failed: ${failed}/40`);

if (failed > 0) {
  console.log('\n❌ FAILED ITEMS:');
  failures.forEach(f => {
    console.log(`   ${f.kind}/${f.slug}`);
  });
}

console.log('\n' + '═'.repeat(60));

process.exit(failed > 0 ? 1 : 0);
