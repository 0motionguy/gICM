/**
 * OPUS 67 Skill Loader v4.1
 * Automatically loads relevant skills based on context
 *
 * Refactored from 449 lines to ~90 lines by extracting:
 * - skills/types.ts: Type definitions
 * - skills/fragment.ts: Fragment loading and inheritance
 * - skills/registry.ts: Registry loading
 * - skills/matcher.ts: Context matching
 * - skills/formatter.ts: Output formatting
 */

import { fileURLToPath } from 'url';

// Re-export types for backwards compatibility
export type {
  Fragment,
  Skill,
  ResolvedSkill,
  SkillRegistry,
  LoadContext,
  LoadResult
} from './skills/types.js';

// Re-export functions from extracted modules
export { loadFragment, resolveInheritance, clearFragmentCache } from './skills/fragment.js';
export { loadRegistry, loadSkillMetadata } from './skills/registry.js';
export { extractKeywords, skillMatchesContext } from './skills/matcher.js';
export { formatSkillsForPrompt } from './skills/formatter.js';

// Import for internal use
import type { Skill, LoadContext, LoadResult } from './skills/types.js';
import { loadRegistry } from './skills/registry.js';
import { skillMatchesContext } from './skills/matcher.js';

/**
 * Load skills based on context
 */
export function loadSkills(context: LoadContext): LoadResult {
  const registry = loadRegistry();
  const matchedSkills: Array<{ skill: Skill; reason: string }> = [];

  for (const skill of registry.skills) {
    const { matches, reason } = skillMatchesContext(skill, context);
    if (matches) {
      matchedSkills.push({ skill, reason });
    }
  }

  // Sort by tier (lower = higher priority) and token cost
  matchedSkills.sort((a, b) => {
    if (a.skill.tier !== b.skill.tier) return a.skill.tier - b.skill.tier;
    return a.skill.token_cost - b.skill.token_cost;
  });

  // Apply token budget and max skills limit
  const selectedSkills: Skill[] = [];
  const reasons: string[] = [];
  let totalCost = 0;
  const seenMcps = new Set<string>();

  for (const { skill, reason } of matchedSkills) {
    if (selectedSkills.length >= registry.meta.max_skills_per_session) break;
    if (totalCost + skill.token_cost > registry.meta.token_budget) continue;

    selectedSkills.push(skill);
    reasons.push(`${skill.id} (${reason})`);
    totalCost += skill.token_cost;

    for (const mcp of skill.mcp_connections) {
      seenMcps.add(mcp);
    }
  }

  return {
    skills: selectedSkills,
    totalTokenCost: totalCost,
    mcpConnections: Array.from(seenMcps),
    reason: reasons
  };
}

/**
 * Load a specific skill combination
 */
export function loadCombination(combinationId: string): LoadResult {
  const registry = loadRegistry();
  const combination = registry.combinations[combinationId];

  if (!combination) {
    return {
      skills: [],
      totalTokenCost: 0,
      mcpConnections: [],
      reason: [`Combination "${combinationId}" not found`]
    };
  }

  const skills = registry.skills.filter(s => combination.skills.includes(s.id));
  const mcps = new Set<string>();

  for (const skill of skills) {
    for (const mcp of skill.mcp_connections) {
      mcps.add(mcp);
    }
  }

  return {
    skills,
    totalTokenCost: combination.token_cost,
    mcpConnections: Array.from(mcps),
    reason: [`combination: ${combinationId}`]
  };
}

// CLI test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { formatSkillsForPrompt } = await import('./skills/formatter.js');

  const testContext: LoadContext = {
    query: process.argv[2] || 'build anchor program for bonding curve',
    activeFiles: ['.rs', '.tsx'],
    currentDirectory: 'programs/curve'
  };

  console.log('Testing skill loader with context:', testContext);
  console.log('---');

  const result = loadSkills(testContext);
  console.log('Loaded skills:', result.skills.map(s => s.id));
  console.log('Token cost:', result.totalTokenCost);
  console.log('MCP connections:', result.mcpConnections);
  console.log('Reasons:', result.reason);
  console.log('---');
  console.log(formatSkillsForPrompt(result));
}
