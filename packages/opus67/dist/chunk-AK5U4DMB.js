import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { parse } from 'yaml';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

// src/mcp/registrar.ts
var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = dirname(__filename$1);
function getPackageRoot() {
  let dir = __dirname$1;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return __dirname$1;
}
function loadClaudeSettings(projectRoot) {
  const localPath = join(projectRoot, ".claude", "settings.local.json");
  const globalPath = join(homedir(), ".claude", "settings.json");
  if (existsSync(localPath)) {
    try {
      return JSON.parse(readFileSync(localPath, "utf-8"));
    } catch {
    }
  }
  if (existsSync(globalPath)) {
    try {
      return JSON.parse(readFileSync(globalPath, "utf-8"));
    } catch {
    }
  }
  return { mcpServers: {} };
}
function saveClaudeSettings(projectRoot, settings) {
  const localDir = join(projectRoot, ".claude");
  const localPath = join(localDir, "settings.local.json");
  if (!existsSync(localDir)) {
    mkdirSync(localDir, { recursive: true });
  }
  writeFileSync(localPath, JSON.stringify(settings, null, 2));
}
function loadMCPRegistry() {
  const registryPath = join(getPackageRoot(), "mcp", "connections.yaml");
  if (!existsSync(registryPath)) {
    console.warn(`[MCP Registrar] connections.yaml not found at: ${registryPath}`);
    return { meta: { version: "6.0.0", total_connections: 0 } };
  }
  const content = readFileSync(registryPath, "utf-8");
  return parse(content);
}
function toClaudeFormat(mcp) {
  if (!mcp.connection?.command) {
    return null;
  }
  const config = {
    command: mcp.connection.command
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
async function registerAllMCPs(projectRoot = process.cwd()) {
  const settings = loadClaudeSettings(projectRoot);
  const registry = loadMCPRegistry();
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }
  let registered = 0;
  let skipped = 0;
  const processedCategories = [];
  const categories = [
    "blockchain",
    "social",
    "data",
    "productivity",
    "documentation",
    "testing",
    "ai_search",
    "persistence",
    "reasoning",
    "learning",
    "storage",
    "infrastructure",
    "solana_stack",
    "ai_ml",
    "evm_chains",
    "databases",
    "monitoring",
    "design",
    "project_management",
    "communication",
    "hosting",
    "payments",
    "web3",
    "realtime"
  ];
  for (const category of categories) {
    const categoryMCPs = registry[category];
    if (!categoryMCPs || typeof categoryMCPs !== "object") {
      continue;
    }
    processedCategories.push(category);
    for (const [id, mcp] of Object.entries(categoryMCPs)) {
      if (!mcp || typeof mcp !== "object" || !mcp.name) {
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
  settings.mcpServers["opus67"] = {
    command: "node",
    args: [join(getPackageRoot(), "dist", "mcp-server.js")]
  };
  registered++;
  saveClaudeSettings(projectRoot, settings);
  return {
    registered,
    skipped,
    categories: processedCategories
  };
}
function getRegisteredMCPs(projectRoot = process.cwd()) {
  const settings = loadClaudeSettings(projectRoot);
  return Object.keys(settings.mcpServers || {});
}
function isMCPRegistered(mcpId, projectRoot = process.cwd()) {
  const settings = loadClaudeSettings(projectRoot);
  return mcpId in (settings.mcpServers || {});
}

export { getRegisteredMCPs, isMCPRegistered, loadClaudeSettings, loadMCPRegistry, registerAllMCPs, saveClaudeSettings, toClaudeFormat };
