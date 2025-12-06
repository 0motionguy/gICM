/**
 * OPUS 67 MCP Hub
 * Manages connections to external data sources
 */

import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Types
export interface MCPConnection {
  name: string;
  type: 'rest_api' | 'graphql' | 'mcp_server' | 'custom_mcp';
  category: string;
  priority: number;
  description: string;
  base_url?: string;
  connection?: {
    type: string;
    command?: string;
    args?: string[];
  };
  auth?: {
    type: string;
    env_var?: string;
    header?: string;
  };
  capabilities: string[];
  rate_limit?: {
    requests_per_second?: number;
    requests_per_minute?: number;
    requests_per_day?: number;
  };
  pricing: {
    tier: string;
    free_limit: string;
    paid_starts?: string;
  };
  auto_connect_when: {
    keywords?: string[];
    skills?: string[];
  };
}

export interface MCPRegistry {
  meta: {
    version: string;
    total_connections: number;
    connection_timeout_ms: number;
    retry_attempts: number;
  };
  blockchain: Record<string, MCPConnection>;
  social: Record<string, MCPConnection>;
  data: Record<string, MCPConnection>;
  productivity: Record<string, MCPConnection>;
  groups: Record<string, {
    connections: string[];
    description: string;
  }>;
}

export interface ConnectionStatus {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'rate_limited';
  lastChecked: Date;
  error?: string;
}

/**
 * Load MCP registry from YAML
 */
export function loadMCPRegistry(): MCPRegistry {
  const registryPath = join(__dirname, '..', 'mcp', 'connections.yaml');
  const content = readFileSync(registryPath, 'utf-8');
  return parse(content) as MCPRegistry;
}

/**
 * Get all connections as flat list
 */
export function getAllConnections(): Array<{ id: string; connection: MCPConnection }> {
  const registry = loadMCPRegistry();
  const connections: Array<{ id: string; connection: MCPConnection }> = [];

  // All MCP categories from the registry
  const categories = ['blockchain', 'social', 'data', 'productivity', 'documentation', 'testing', 'ai_search', 'persistence', 'reasoning'] as const;

  for (const category of categories) {
    const categoryConnections = (registry as unknown as Record<string, Record<string, MCPConnection>>)[category];
    if (categoryConnections && typeof categoryConnections === 'object') {
      for (const [id, connection] of Object.entries(categoryConnections)) {
        if (connection && connection.name) {
          connections.push({ id, connection });
        }
      }
    }
  }

  return connections;
}

/**
 * Find connections that match given skills
 */
export function getConnectionsForSkills(skillIds: string[]): Array<{ id: string; connection: MCPConnection }> {
  const all = getAllConnections();
  const matched: Array<{ id: string; connection: MCPConnection }> = [];

  for (const { id, connection } of all) {
    if (connection.auto_connect_when?.skills) {
      const hasMatch = connection.auto_connect_when.skills.some(
        skill => skillIds.includes(skill) || skill === 'all'
      );
      if (hasMatch) {
        matched.push({ id, connection });
      }
    }
  }

  return matched;
}

/**
 * Find connections that match given keywords
 */
export function getConnectionsForKeywords(keywords: string[]): Array<{ id: string; connection: MCPConnection }> {
  const all = getAllConnections();
  const matched: Array<{ id: string; connection: MCPConnection }> = [];
  const normalizedKeywords = keywords.map(k => k.toLowerCase());

  for (const { id, connection } of all) {
    if (connection.auto_connect_when?.keywords) {
      const hasMatch = connection.auto_connect_when.keywords.some(
        keyword => normalizedKeywords.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        matched.push({ id, connection });
      }
    }
  }

  return matched;
}

/**
 * Get connection group
 */
export function getConnectionGroup(groupId: string): Array<{ id: string; connection: MCPConnection }> {
  const registry = loadMCPRegistry();
  const group = registry.groups[groupId];
  
  if (!group) return [];

  const all = getAllConnections();
  return all.filter(({ id }) => group.connections.includes(id));
}

/**
 * Check if required env vars are set for a connection
 */
export function checkConnectionAuth(connection: MCPConnection): { ready: boolean; missing?: string } {
  if (!connection.auth || connection.auth.type === 'none') {
    return { ready: true };
  }

  if (connection.auth.env_var) {
    const value = process.env[connection.auth.env_var];
    if (!value) {
      return { ready: false, missing: connection.auth.env_var };
    }
  }

  return { ready: true };
}

/**
 * Format connections for prompt context
 */
export function formatConnectionsForPrompt(connections: Array<{ id: string; connection: MCPConnection }>): string {
  if (connections.length === 0) {
    return '<!-- No MCPs connected -->';
  }

  let output = `<!-- OPUS 67: ${connections.length} MCPs available -->\n`;
  output += '<available_mcps>\n';

  for (const { id, connection } of connections) {
    const authStatus = checkConnectionAuth(connection);
    const status = authStatus.ready ? '✓' : `✗ (missing: ${authStatus.missing})`;
    
    output += `\n### ${connection.name} [${status}]\n`;
    output += `Type: ${connection.type}\n`;
    output += `Capabilities: ${connection.capabilities.join(', ')}\n`;
    if (connection.rate_limit?.requests_per_minute) {
      output += `Rate limit: ${connection.rate_limit.requests_per_minute}/min\n`;
    }
  }

  output += '\n</available_mcps>';
  return output;
}

/**
 * Generate connection code snippet
 */
export function generateConnectionCode(id: string): string {
  const all = getAllConnections();
  const found = all.find(c => c.id === id);
  
  if (!found) return `// Connection "${id}" not found`;

  const { connection } = found;

  if (connection.type === 'rest_api') {
    return `
// ${connection.name} REST API
const ${id}Client = {
  baseUrl: '${connection.base_url}',
  ${connection.auth?.env_var ? `apiKey: process.env.${connection.auth.env_var},` : ''}

  async fetch(endpoint: string, options?: RequestInit) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ${connection.auth?.header ? `'${connection.auth.header}': this.apiKey,` : ''}
    };

    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers: { ...headers, ...options?.headers }
    });

    if (!response.ok) throw new Error(\`${connection.name} error: \${response.status}\`);
    return response.json();
  },

  // Available methods: ${connection.capabilities.join(', ')}
};
`.trim();
  }

  if (connection.type === 'graphql') {
    return `
// ${connection.name} GraphQL API
const ${id}Client = {
  endpoint: '${connection.base_url}',
  ${connection.auth?.env_var ? `apiKey: process.env.${connection.auth.env_var},` : ''}

  async query(query: string, variables?: Record<string, unknown>) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ${connection.auth?.header ? `'${connection.auth.header}': this.apiKey,` : ''}
      },
      body: JSON.stringify({ query, variables })
    });

    const { data, errors } = await response.json();
    if (errors) throw new Error(errors[0].message);
    return data;
  }
};
`.trim();
  }

  if (connection.type === 'mcp_server' && connection.connection) {
    return `
// ${connection.name} MCP Server
// Start with: ${connection.connection.command} ${connection.connection.args?.join(' ')}
// Requires: ${connection.auth?.env_var || 'no auth'}
`.trim();
  }

  return `// ${connection.name}: ${connection.type} - see documentation`;
}

// CLI test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Testing MCP Hub\n---');
  
  const all = getAllConnections();
  console.log(`Total connections: ${all.length}`);
  
  const forSkills = getConnectionsForSkills(['defi-data-analyst', 'crypto-twitter-analyst']);
  console.log(`\nConnections for defi+twitter skills: ${forSkills.map(c => c.id).join(', ')}`);
  
  const forKeywords = getConnectionsForKeywords(['solana', 'swap']);
  console.log(`\nConnections for solana+swap: ${forKeywords.map(c => c.id).join(', ')}`);
  
  console.log('\n---\nSample code for jupiter:');
  console.log(generateConnectionCode('jupiter'));
}
