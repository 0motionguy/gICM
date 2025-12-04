import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// src/mcp-hub.ts
var __dirname$1 = dirname(fileURLToPath(import.meta.url));
function loadMCPRegistry() {
  const registryPath = join(__dirname$1, "..", "mcp", "connections.yaml");
  const content = readFileSync(registryPath, "utf-8");
  return parse(content);
}
function getAllConnections() {
  const registry = loadMCPRegistry();
  const connections = [];
  const categories = ["blockchain", "social", "data", "productivity", "documentation", "testing", "ai_search", "persistence", "reasoning"];
  for (const category of categories) {
    const categoryConnections = registry[category];
    if (categoryConnections && typeof categoryConnections === "object") {
      for (const [id, connection] of Object.entries(categoryConnections)) {
        if (connection && connection.name) {
          connections.push({ id, connection });
        }
      }
    }
  }
  return connections;
}
function getConnectionsForSkills(skillIds) {
  const all = getAllConnections();
  const matched = [];
  for (const { id, connection } of all) {
    if (connection.auto_connect_when?.skills) {
      const hasMatch = connection.auto_connect_when.skills.some(
        (skill) => skillIds.includes(skill) || skill === "all"
      );
      if (hasMatch) {
        matched.push({ id, connection });
      }
    }
  }
  return matched;
}
function getConnectionsForKeywords(keywords) {
  const all = getAllConnections();
  const matched = [];
  const normalizedKeywords = keywords.map((k) => k.toLowerCase());
  for (const { id, connection } of all) {
    if (connection.auto_connect_when?.keywords) {
      const hasMatch = connection.auto_connect_when.keywords.some(
        (keyword) => normalizedKeywords.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        matched.push({ id, connection });
      }
    }
  }
  return matched;
}
function getConnectionGroup(groupId) {
  const registry = loadMCPRegistry();
  const group = registry.groups[groupId];
  if (!group) return [];
  const all = getAllConnections();
  return all.filter(({ id }) => group.connections.includes(id));
}
function checkConnectionAuth(connection) {
  if (!connection.auth || connection.auth.type === "none") {
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
function formatConnectionsForPrompt(connections) {
  if (connections.length === 0) {
    return "<!-- No MCPs connected -->";
  }
  let output = `<!-- OPUS 67: ${connections.length} MCPs available -->
`;
  output += "<available_mcps>\n";
  for (const { id, connection } of connections) {
    const authStatus = checkConnectionAuth(connection);
    const status = authStatus.ready ? "\u2713" : `\u2717 (missing: ${authStatus.missing})`;
    output += `
### ${connection.name} [${status}]
`;
    output += `Type: ${connection.type}
`;
    output += `Capabilities: ${connection.capabilities.join(", ")}
`;
    if (connection.rate_limit?.requests_per_minute) {
      output += `Rate limit: ${connection.rate_limit.requests_per_minute}/min
`;
    }
  }
  output += "\n</available_mcps>";
  return output;
}
function generateConnectionCode(id) {
  const all = getAllConnections();
  const found = all.find((c) => c.id === id);
  if (!found) return `// Connection "${id}" not found`;
  const { connection } = found;
  if (connection.type === "rest_api") {
    return `
// ${connection.name} REST API
const ${id}Client = {
  baseUrl: '${connection.base_url}',
  ${connection.auth?.env_var ? `apiKey: process.env.${connection.auth.env_var},` : ""}

  async fetch(endpoint: string, options?: RequestInit) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ${connection.auth?.header ? `'${connection.auth.header}': this.apiKey,` : ""}
    };

    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers: { ...headers, ...options?.headers }
    });

    if (!response.ok) throw new Error(\`${connection.name} error: \${response.status}\`);
    return response.json();
  },

  // Available methods: ${connection.capabilities.join(", ")}
};
`.trim();
  }
  if (connection.type === "graphql") {
    return `
// ${connection.name} GraphQL API
const ${id}Client = {
  endpoint: '${connection.base_url}',
  ${connection.auth?.env_var ? `apiKey: process.env.${connection.auth.env_var},` : ""}

  async query(query: string, variables?: Record<string, unknown>) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ${connection.auth?.header ? `'${connection.auth.header}': this.apiKey,` : ""}
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
  if (connection.type === "mcp_server" && connection.connection) {
    return `
// ${connection.name} MCP Server
// Start with: ${connection.connection.command} ${connection.connection.args?.join(" ")}
// Requires: ${connection.auth?.env_var || "no auth"}
`.trim();
  }
  return `// ${connection.name}: ${connection.type} - see documentation`;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("Testing MCP Hub\n---");
  const all = getAllConnections();
  console.log(`Total connections: ${all.length}`);
  const forSkills = getConnectionsForSkills(["defi-data-analyst", "crypto-twitter-analyst"]);
  console.log(`
Connections for defi+twitter skills: ${forSkills.map((c) => c.id).join(", ")}`);
  const forKeywords = getConnectionsForKeywords(["solana", "swap"]);
  console.log(`
Connections for solana+swap: ${forKeywords.map((c) => c.id).join(", ")}`);
  console.log("\n---\nSample code for jupiter:");
  console.log(generateConnectionCode("jupiter"));
}

export { checkConnectionAuth, formatConnectionsForPrompt, generateConnectionCode, getAllConnections, getConnectionGroup, getConnectionsForKeywords, getConnectionsForSkills, loadMCPRegistry };
