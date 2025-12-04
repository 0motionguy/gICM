/**
 * OPUS 67 Mode Registry
 * Load and access mode definitions
 */

import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ModeRegistry, Mode, ModeName } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedRegistry: ModeRegistry | null = null;

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
 * Load mode registry from YAML
 */
export function loadModeRegistry(): ModeRegistry {
  if (cachedRegistry) return cachedRegistry;

  const registryPath = join(getPackageRoot(), 'modes', 'registry.yaml');
  const content = readFileSync(registryPath, 'utf-8');
  cachedRegistry = parse(content) as ModeRegistry;
  return cachedRegistry;
}

/**
 * Get a specific mode by name
 */
export function getMode(modeName: ModeName): Mode | null {
  const registry = loadModeRegistry();
  return registry.modes[modeName] || null;
}

/**
 * Get all available modes including advanced feature modes
 */
export function getAllModes(): Array<{ id: ModeName; mode: Mode }> {
  const registry = loadModeRegistry();
  const modes: Array<{ id: ModeName; mode: Mode }> = [];

  // Main modes
  for (const [id, mode] of Object.entries(registry.modes)) {
    modes.push({ id: id as ModeName, mode });
  }

  // Advanced feature modes
  const advancedFeatures = (registry as any).advanced_features;
  if (advancedFeatures) {
    const advancedModeIds = [
      'background', 'review',
      'grab', 'clone', 'research', 'context',
      'solana', 'infra', 'memory', 'debug',
      'deep-research', 'web-search', 'design', 'content',
      'business', 'strategy', 'marketing', 'security', 'teach', 'ship'
    ];

    for (const key of advancedModeIds) {
      if (advancedFeatures[key]?.icon) {
        modes.push({ id: key as ModeName, mode: advancedFeatures[key] });
      }
    }
  }

  return modes;
}
