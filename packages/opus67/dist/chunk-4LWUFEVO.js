import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, extname, basename } from 'path';

// src/agents/loader.ts
function parseAgentMetadata(content, filename) {
  const metadata = {};
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    metadata.name = headingMatch[1].trim();
  }
  const descMatch = content.match(/^#.+\n\n(.+?)(?:\n\n|$)/s);
  if (descMatch) {
    metadata.description = descMatch[1].trim().slice(0, 200);
  }
  metadata.id = basename(filename, ".md");
  return metadata;
}
async function loadAllAgents(projectRoot = process.cwd()) {
  const agentsDir = join(projectRoot, ".claude", "agents");
  if (!existsSync(agentsDir)) {
    return { count: 0, agents: [] };
  }
  const files = readdirSync(agentsDir);
  const agents = [];
  for (const file of files) {
    if (extname(file) !== ".md") {
      continue;
    }
    const filePath = join(agentsDir, file);
    const content = readFileSync(filePath, "utf-8");
    const metadata = parseAgentMetadata(content, file);
    agents.push({
      id: metadata.id || basename(file, ".md"),
      name: metadata.name || basename(file, ".md"),
      filename: file,
      path: filePath,
      description: metadata.description
    });
  }
  return {
    count: agents.length,
    agents
  };
}
function getAgent(agentId, projectRoot = process.cwd()) {
  const agentsDir = join(projectRoot, ".claude", "agents");
  const filePath = join(agentsDir, `${agentId}.md`);
  if (!existsSync(filePath)) {
    return null;
  }
  const content = readFileSync(filePath, "utf-8");
  const metadata = parseAgentMetadata(content, `${agentId}.md`);
  return {
    id: agentId,
    name: metadata.name || agentId,
    filename: `${agentId}.md`,
    path: filePath,
    description: metadata.description
  };
}
function listAgentIds(projectRoot = process.cwd()) {
  const agentsDir = join(projectRoot, ".claude", "agents");
  if (!existsSync(agentsDir)) {
    return [];
  }
  return readdirSync(agentsDir).filter((f) => extname(f) === ".md").map((f) => basename(f, ".md"));
}

export { getAgent, listAgentIds, loadAllAgents };
