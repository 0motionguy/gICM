/**
 * OPUS 67 Fragment Loader
 * Load and cache skill fragments for inheritance
 */

import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Fragment, Skill, ResolvedSkill } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fragment cache
const fragmentCache = new Map<string, Fragment>();

/**
 * Find package root by walking up to find package.json
 */
function getPackageRoot(): string {
  let dir = __dirname;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return __dirname;
}

/**
 * Load a fragment by ID
 */
export function loadFragment(fragmentId: string): Fragment | null {
  if (fragmentCache.has(fragmentId)) {
    return fragmentCache.get(fragmentId)!;
  }

  const fragmentPath = join(getPackageRoot(), 'skills', 'fragments', `${fragmentId}.yaml`);

  if (!existsSync(fragmentPath)) {
    console.warn(`Fragment not found: ${fragmentId}`);
    return null;
  }

  try {
    const content = readFileSync(fragmentPath, 'utf-8');
    const fragment = parse(content) as Fragment;
    fragmentCache.set(fragmentId, fragment);
    return fragment;
  } catch (error) {
    console.error(`Error loading fragment ${fragmentId}:`, error);
    return null;
  }
}

/**
 * Resolve inheritance for a skill
 * Merges capabilities and anti_hallucination from all extended fragments
 */
export function resolveInheritance(skill: Skill): ResolvedSkill {
  const inherited_capabilities: string[] = [];
  const inherited_anti_hallucination: Array<{ trigger: string; response: string }> = [];

  if (skill.extends && skill.extends.length > 0) {
    for (const fragmentId of skill.extends) {
      const fragment = loadFragment(fragmentId);
      if (fragment) {
        for (const cap of fragment.capabilities) {
          if (!inherited_capabilities.includes(cap) && !skill.capabilities.includes(cap)) {
            inherited_capabilities.push(cap);
          }
        }
        if (fragment.anti_hallucination) {
          inherited_anti_hallucination.push(...fragment.anti_hallucination);
        }
      }
    }
  }

  return {
    ...skill,
    inherited_capabilities,
    inherited_anti_hallucination
  };
}

/**
 * Clear fragment cache (useful for testing or hot-reload)
 */
export function clearFragmentCache(): void {
  fragmentCache.clear();
}
