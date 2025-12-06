/**
 * OPUS 67 v6.0.0 - MCP Registrar
 *
 * THE KEY MISSING PIECE - Registers ALL MCPs in Claude's settings.json
 *
 * Previously, MCPs were DEFINED in connections.yaml but NEVER REGISTERED
 * in Claude's settings. This module fixes that.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { parse } from 'yaml';
import { homedir } from 'os';
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

// Types
interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface ClaudeSettings {
  mcpServers: Record<string, MCPServerConfig>;
  [key: string]: unknown;
}

interface MCPConnection {
  name: string;
  type: string;
  category: string;
  description: string;
  connection?: {
    type: string;
    command?: string;
    args?: string[];
  };
  auth?: {
    type: string;
    env_var?: string;
  };
  capabilities: string[];
  auto_connect_when?: {
    keywords?: string[];
    skills?: string[];
  };
}

interface MCPRegistry {
  meta: {
    version: string;
    total_connections: number;
  };
  [category: string]: Record<string, MCPConnection> | unknown;
}

/**
 * Load Claude's settings.json (local or global)
 */
function loadClaudeSettings(projectRoot: string): ClaudeSettings {
  const localPath = join(projectRoot, '.claude', 'settings.local.json');
  const globalPath = join(homedir(), '.claude', 'settings.json');

  // Try local first
  if (existsSync(localPath)) {
    try {
      return JSON.parse(readFileSync(localPath, 'utf-8'));
    } catch {
      // Fall through to global
    }
  }

  // Try global
  if (existsSync(globalPath)) {
    try {
      return JSON.parse(readFileSync(globalPath, 'utf-8'));
    } catch {
      // Fall through to default
    }
  }

  // Default empty settings
  return { mcpServers: {} };
}

/**
 * Save settings back to local file
 */
function saveClaudeSettings(projectRoot: string, settings: ClaudeSettings): void {
  const localDir = join(projectRoot, '.claude');
  const localPath = join(localDir, 'settings.local.json');

  // Ensure directory exists
  if (!existsSync(localDir)) {
    mkdirSync(localDir, { recursive: true });
  }

  writeFileSync(localPath, JSON.stringify(settings, null, 2));
}

/**
 * Load MCP connections from YAML registry
 */
function loadMCPRegistry(): MCPRegistry {
  const registryPath = join(getPackageRoot(), 'mcp', 'connections.yaml');

  if (!existsSync(registryPath)) {
    console.warn(`[MCP Registrar] connections.yaml not found at: ${registryPath}`);
    return { meta: { version: '6.0.0', total_connections: 0 } };
  }

  const content = readFileSync(registryPath, 'utf-8');
  return parse(content) as MCPRegistry;
}

/**
 * Convert MCP connection to Claude settings format
 */
function toClaudeFormat(mcp: MCPConnection): MCPServerConfig | null {
  if (!mcp.connection?.command) {
    return null;
  }

  const config: MCPServerConfig = {
    command: mcp.connection.command,
  };

  if (mcp.connection.args && mcp.connection.args.length > 0) {
    config.args = mcp.connection.args;
  }

  if (mcp.auth?.env_var) {
    const envValue = process.env[mcp.auth.env_var];
    if (envValue) {
      config.env = { [mcp.auth.env_var]: envValue };
    }
  }

  return config;
}

/**
 * Register ALL MCPs in Claude's settings.json
 *
 * This is THE KEY FIX - previously MCPs were defined but never registered
 */
export async function registerAllMCPs(projectRoot: string = process.cwd()): Promise<{
  registered: number;
  skipped: number;
  categories: string[];
}> {
  const settings = loadClaudeSettings(projectRoot);
  const registry = loadMCPRegistry();

  // Initialize mcpServers if not exists
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }

  let registered = 0;
  let skipped = 0;
  const processedCategories: string[] = [];

  // All MCP categories from connections.yaml
  const categories = [
    'blockchain',
    'social',
    'data',
    'productivity',
    'documentation',
    'testing',
    'ai_search',
    'persistence',
    'reasoning',
    'learning',
    'storage',
    'infrastructure',
    'solana_stack',
    'ai_ml',
    'evm_chains',
    'databases',
    'monitoring',
    'design',
    'project_management',
    'communication',
    'hosting',
    'payments',
    'web3',
    'realtime',
  ];

  for (const category of categories) {
    const categoryMCPs = registry[category] as Record<string, MCPConnection> | undefined;

    if (!categoryMCPs || typeof categoryMCPs !== 'object') {
      continue;
    }

    processedCategories.push(category);

    for (const [id, mcp] of Object.entries(categoryMCPs)) {
      if (!mcp || typeof mcp !== 'object' || !mcp.name) {
        skipped++;
        continue;
      }

      const config = toClaudeFormat(mcp);

      if (config) {
        settings.mcpServers[id] = config;
        registered++;
      } else {
        skipped++;
      }
    }
  }

  // Also add the OPUS 67 MCP server itself
  settings.mcpServers['opus67'] = {
    command: 'node',
    args: [join(getPackageRoot(), 'dist', 'mcp-server.js')],
  };
  registered++;

  // Save updated settings
  saveClaudeSettings(projectRoot, settings);

  return {
    registered,
    skipped,
    categories: processedCategories,
  };
}

/**
 * Get currently registered MCPs
 */
export function getRegisteredMCPs(projectRoot: string = process.cwd()): string[] {
  const settings = loadClaudeSettings(projectRoot);
  return Object.keys(settings.mcpServers || {});
}

/**
 * Check if a specific MCP is registered
 */
export function isMCPRegistered(mcpId: string, projectRoot: string = process.cwd()): boolean {
  const settings = loadClaudeSettings(projectRoot);
  return mcpId in (settings.mcpServers || {});
}

// Export for testing
export { loadMCPRegistry, toClaudeFormat, loadClaudeSettings, saveClaudeSettings };
