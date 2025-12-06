/**
 * OPUS 67 v6.0.0 - Master Registry Loader
 *
 * Loads the unified MASTER.yaml registry that orchestrates all components.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parse } from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export interface MasterRegistry {
  version: string;
  codename: string;
  generated: string;
  meta: {
    skills_count: number;
    agents_count: number;
    modes_count: number;
    mcps_count: number;
    hooks_count: number;
  };
  skills: {
    source: string;
    loaded_at_boot: boolean;
    auto_detect: boolean;
    max_concurrent: number;
    token_budget: number;
  };
  agents: {
    source: string;
    format: string;
    loaded_at_boot: boolean;
  };
  modes: {
    source: string;
    default: string;
    loaded_at_boot: boolean;
    available: string[];
  };
  mcps: {
    source: string;
    auto_connect: boolean;
    register_in_claude: boolean;
    connection_timeout_ms: number;
    retry_attempts: number;
    categories: string[];
  };
  hooks: {
    source: string;
    active: string[];
    visibility: boolean;
  };
  boot: {
    order: string[];
    display_banner: boolean;
    verify_access: boolean;
  };
  door: {
    source: string;
    version: string;
    inject_to_claude: boolean;
    marker: string;
  };
  unified: {
    version: string;
    single_boot_command: boolean;
    consistent_loading: boolean;
    all_mcps_registered: boolean;
    no_duplicate_doors: boolean;
    hooks_visible: boolean;
  };
}

/**
 * Load the master registry
 */
export async function loadMasterRegistry(): Promise<MasterRegistry> {
  const registryPath = join(getPackageRoot(), 'registry', 'MASTER.yaml');

  if (!existsSync(registryPath)) {
    throw new Error(`MASTER.yaml not found at: ${registryPath}`);
  }

  const content = readFileSync(registryPath, 'utf-8');
  const registry = parse(content) as MasterRegistry;

  // Validate required fields
  if (!registry.version || !registry.meta) {
    throw new Error('Invalid MASTER.yaml: missing required fields');
  }

  return registry;
}

/**
 * Get registry path
 */
export function getRegistryPath(): string {
  return join(getPackageRoot(), 'registry', 'MASTER.yaml');
}

/**
 * Check if registry exists
 */
export function registryExists(): boolean {
  return existsSync(getRegistryPath());
}

/**
 * Get registry version without loading full registry
 */
export function getRegistryVersion(): string | null {
  try {
    const registry = parse(readFileSync(getRegistryPath(), 'utf-8')) as { version?: string };
    return registry.version || null;
  } catch {
    return null;
  }
}
