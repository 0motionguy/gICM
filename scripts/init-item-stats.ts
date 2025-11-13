/**
 * Initialize item statistics with realistic placeholder data
 *
 * Usage: npx tsx scripts/init-item-stats.ts
 */

import { REGISTRY } from '../src/lib/registry';
import { batchSetItemStats } from '../src/lib/item-stats';
import type { RegistryItem } from '../src/types/registry';

// Category popularity scores (base install range)
const CATEGORY_SCORES: Record<string, number> = {
  'Solana': 100,
  'DeFi': 90,
  'Smart Contract': 85,
  'DevTools': 80,
  'Blockchain': 75,
  'Frontend': 70,
  'Web3': 65,
  'NFT': 60,
  'Testing': 55,
  'Security': 50,
  'Documentation': 40,
  'Utilities': 35,
  'Experimental': 25,
};

// Item kind multipliers
const KIND_MULTIPLIERS: Record<string, number> = {
  'agent': 1.3,
  'skill': 1.1,
  'mcp': 1.0,
  'command': 0.9,
  'workflow': 1.2,
  'setting': 0.7,
};

// Popular tags that boost install counts
const POPULAR_TAGS = [
  'solana',
  'ethereum',
  'defi',
  'nft',
  'web3',
  'typescript',
  'testing',
  'analytics',
  'security',
  'devtools',
];

/**
 * Calculate category score for an item
 */
function getCategoryScore(item: RegistryItem): number {
  const category = item.category || 'Utilities';
  return CATEGORY_SCORES[category] || 30;
}

/**
 * Calculate kind multiplier for an item
 */
function getKindMultiplier(item: RegistryItem): number {
  return KIND_MULTIPLIERS[item.kind] || 1.0;
}

/**
 * Calculate tag popularity bonus
 */
function calculateTagBonus(item: RegistryItem): number {
  if (!item.tags || item.tags.length === 0) {
    return 0;
  }

  const matchingTags = item.tags.filter(tag =>
    POPULAR_TAGS.some(popularTag =>
      tag.toLowerCase().includes(popularTag.toLowerCase())
    )
  );

  return matchingTags.length * 5; // +5 per popular tag
}

/**
 * Check if item is featured (boosted visibility)
 */
function isFeatured(item: RegistryItem): boolean {
  return item.tags?.includes('featured') || false;
}

/**
 * Generate realistic install/remix counts for an item
 */
function generateStats(item: RegistryItem): { installs: number; remixes: number } {
  // Base score from category
  const categoryScore = getCategoryScore(item);

  // Multiplier from item kind
  const kindMultiplier = getKindMultiplier(item);

  // Tag popularity bonus
  const tagBonus = calculateTagBonus(item);

  // Featured items get a boost
  const featuredBoost = isFeatured(item) ? 1.25 : 1.0;

  // Calculate base installs (before random variance)
  const baseScore = (categoryScore * kindMultiplier + tagBonus) * featuredBoost;

  // Apply random variance (0.3 to 1.0 multiplier for organic feel)
  const variance = 0.3 + Math.random() * 0.7;

  // Calculate installs (clamp to 1-127 range as requested)
  const installs = Math.max(1, Math.min(127, Math.floor(baseScore * variance)));

  // Calculate remixes (25-35% of installs with additional variance)
  const remixRatio = 0.25 + Math.random() * 0.10;
  const remixes = Math.max(1, Math.floor(installs * remixRatio));

  return { installs, remixes };
}

/**
 * Main initialization function
 */
function initializeStats() {
  console.log('🚀 Initializing item statistics...\n');

  const stats: Record<string, { installs: number; remixes: number }> = {};
  let totalInstalls = 0;
  let totalRemixes = 0;

  // Generate stats for all registry items
  REGISTRY.forEach(item => {
    const { installs, remixes } = generateStats(item);
    stats[item.id] = { installs, remixes };

    totalInstalls += installs;
    totalRemixes += remixes;

    console.log(`  ${item.id}`);
    console.log(`    Category: ${item.category || 'N/A'}`);
    console.log(`    Kind: ${item.kind}`);
    console.log(`    Installs: ${installs}`);
    console.log(`    Remixes: ${remixes}`);
    console.log('');
  });

  // Write all stats to file
  console.log('💾 Writing stats to .metrics/item-stats.json...\n');
  batchSetItemStats(stats);

  // Print summary
  console.log('✅ Initialization complete!\n');
  console.log('Summary:');
  console.log(`  Total items: ${REGISTRY.length}`);
  console.log(`  Total installs: ${totalInstalls.toLocaleString()}`);
  console.log(`  Total remixes: ${totalRemixes.toLocaleString()}`);
  console.log(`  Average installs per item: ${Math.floor(totalInstalls / REGISTRY.length)}`);
  console.log(`  Average remixes per item: ${Math.floor(totalRemixes / REGISTRY.length)}`);
  console.log('');
  console.log('📊 Stats file created at: .metrics/item-stats.json');
  console.log('🎉 You can now use the dynamic stats in your application!');
}

// Run initialization
try {
  initializeStats();
} catch (error) {
  console.error('❌ Failed to initialize stats:', error);
  process.exit(1);
}
