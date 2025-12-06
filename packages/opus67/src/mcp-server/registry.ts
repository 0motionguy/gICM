/**
 * OPUS 67 MCP Server Registry
 * Loads skills, modes, and MCP connections from YAML files
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';
import type { Skill, MCPConnection, Mode } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Find the package root directory
 */
export function getPackageRoot(): string {
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
 * Load and parse a YAML file
 */
export function loadYaml<T>(relativePath: string, packageRoot: string): T | null {
  const fullPath = join(packageRoot, relativePath);
  if (!existsSync(fullPath)) {
    console.error(`[OPUS67] Registry not found: ${fullPath}`);
    return null;
  }
  try {
    const content = readFileSync(fullPath, 'utf-8');
    return parse(content) as T;
  } catch (e) {
    console.error(`[OPUS67] Failed to load ${relativePath}:`, e);
    return null;
  }
}

/**
 * Load all registries and return parsed data
 */
export function loadRegistries(packageRoot: string): {
  skills: Skill[];
  mcpConnections: MCPConnection[];
  modes: Mode[];
} {
  // Load skills - merge all skills keys (skills, skills_v31, skills_v41, etc.)
  const skillsRegistryRaw = loadYaml<Record<string, unknown>>('skills/registry.yaml', packageRoot);
  let skills: Skill[] = [];

  if (skillsRegistryRaw) {
    // Find all keys that start with "skills"
    const skillsKeys = Object.keys(skillsRegistryRaw).filter(key => key.startsWith('skills'));

    for (const key of skillsKeys) {
      const skillsData = skillsRegistryRaw[key];
      if (Array.isArray(skillsData)) {
        skills.push(...(skillsData as Skill[]));
      } else if (skillsData && typeof skillsData === 'object') {
        // Object format - convert to array
        for (const [id, skill] of Object.entries(skillsData as Record<string, unknown>)) {
          if (skill && typeof skill === 'object') {
            skills.push({ id, ...(skill as Omit<Skill, 'id'>) });
          }
        }
      }
    }
  }

  // Load MCP connections - dynamically iterate ALL categories
  const mcpRegistryRaw = loadYaml<Record<string, unknown>>('mcp/connections.yaml', packageRoot);
  const mcpConnections: MCPConnection[] = [];

  if (mcpRegistryRaw) {
    // Skip meta key, iterate all other keys as categories
    for (const [category, categoryData] of Object.entries(mcpRegistryRaw)) {
      if (category === 'meta' || category === 'groups') continue;
      if (categoryData && typeof categoryData === 'object' && !Array.isArray(categoryData)) {
        for (const [id, conn] of Object.entries(categoryData as Record<string, unknown>)) {
          if (conn && typeof conn === 'object' && 'name' in (conn as Record<string, unknown>)) {
            mcpConnections.push({ ...(conn as MCPConnection), id, category });
          }
        }
      }
    }
  }

  // Load modes
  const modesRegistryRaw = loadYaml<{ modes: Record<string, Omit<Mode, 'id'>> }>('modes/registry.yaml', packageRoot);
  const modes: Mode[] = [];

  if (modesRegistryRaw?.modes && typeof modesRegistryRaw.modes === 'object') {
    for (const [id, mode] of Object.entries(modesRegistryRaw.modes)) {
      if (mode && typeof mode === 'object' && 'name' in mode) {
        modes.push({
          id,
          name: mode.name || id,
          icon: (mode as { icon?: string }).icon || '🔧',
          description: (mode as { description?: string }).description || '',
          token_budget: (mode as { token_budget?: number }).token_budget || 10000,
          thinking_depth: (mode as { thinking_depth?: string }).thinking_depth || 'standard'
        });
      }
    }
  }

  return { skills, mcpConnections, modes };
}

/**
 * Load a skill definition file
 */
export function loadSkillDefinition(skillId: string, packageRoot: string): string {
  const defPath = join(packageRoot, 'skills', 'definitions', `${skillId}.md`);
  if (existsSync(defPath)) {
    return readFileSync(defPath, 'utf-8');
  }
  return '';
}
