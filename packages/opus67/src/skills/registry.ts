/**
 * OPUS 67 Skill Registry
 * Load and manage skill registry from YAML
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { parse } from 'yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Skill, SkillRegistry } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
 * Load skill metadata from category subdirectories
 * Scans: skills/metadata/<category>/<skill-id>.yaml
 */
export function loadSkillMetadata(skillId: string): Skill | null {
  const metadataBase = join(getPackageRoot(), 'skills', 'metadata');

  // First try direct file
  const directPath = join(metadataBase, `${skillId}.yaml`);
  if (existsSync(directPath)) {
    try {
      const content = readFileSync(directPath, 'utf-8');
      return parse(content) as Skill;
    } catch (error) {
      console.error(`Error loading skill metadata ${skillId}:`, error);
    }
  }

  // Then scan category subdirectories
  if (existsSync(metadataBase)) {
    const entries = readdirSync(metadataBase);
    for (const entry of entries) {
      const categoryPath = join(metadataBase, entry);
      if (statSync(categoryPath).isDirectory()) {
        const skillPath = join(categoryPath, `${skillId}.yaml`);
        if (existsSync(skillPath)) {
          try {
            const content = readFileSync(skillPath, 'utf-8');
            return parse(content) as Skill;
          } catch (error) {
            console.error(`Error loading skill metadata ${skillId} from ${entry}:`, error);
          }
        }
      }
    }
  }

  return null;
}

/**
 * Load and parse the skills registry
 * v4.1: Combines skills from all sections (skills, skills_v31, skills_v41)
 */
export function loadRegistry(): SkillRegistry {
  const registryPath = join(getPackageRoot(), 'skills', 'registry.yaml');
  const content = readFileSync(registryPath, 'utf-8');
  const raw = parse(content) as {
    meta: SkillRegistry['meta'];
    skills: Skill[];
    skills_v31?: Skill[];
    skills_v41?: Skill[];
    combinations: SkillRegistry['combinations'];
    v4_combinations?: Record<string, { skills: string[]; token_cost: number; description?: string }>;
  };

  // Combine all skill sections
  const allSkills: Skill[] = [
    ...(raw.skills || []),
    ...(raw.skills_v31 || []),
    ...(raw.skills_v41 || [])
  ];

  // Combine all combinations
  const allCombinations = {
    ...raw.combinations,
    ...raw.v4_combinations
  };

  return {
    meta: raw.meta,
    skills: allSkills,
    combinations: allCombinations
  };
}
