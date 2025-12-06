/**
 * OPUS 67 v6.0.0 - Agents Loader
 *
 * Loads all 107 agents from .claude/agents/ directory
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

export interface Agent {
  id: string;
  name: string;
  filename: string;
  path: string;
  description?: string;
  capabilities?: string[];
}

/**
 * Parse agent metadata from markdown file
 */
function parseAgentMetadata(content: string, filename: string): Partial<Agent> {
  const metadata: Partial<Agent> = {};

  // Try to extract name from first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    metadata.name = headingMatch[1].trim();
  }

  // Try to extract description from first paragraph
  const descMatch = content.match(/^#.+\n\n(.+?)(?:\n\n|$)/s);
  if (descMatch) {
    metadata.description = descMatch[1].trim().slice(0, 200);
  }

  // Generate ID from filename
  metadata.id = basename(filename, '.md');

  return metadata;
}

/**
 * Load all agents from a directory
 */
export async function loadAllAgents(projectRoot: string = process.cwd()): Promise<{
  count: number;
  agents: Agent[];
}> {
  const agentsDir = join(projectRoot, '.claude', 'agents');

  if (!existsSync(agentsDir)) {
    return { count: 0, agents: [] };
  }

  const files = readdirSync(agentsDir);
  const agents: Agent[] = [];

  for (const file of files) {
    if (extname(file) !== '.md') {
      continue;
    }

    const filePath = join(agentsDir, file);
    const content = readFileSync(filePath, 'utf-8');
    const metadata = parseAgentMetadata(content, file);

    agents.push({
      id: metadata.id || basename(file, '.md'),
      name: metadata.name || basename(file, '.md'),
      filename: file,
      path: filePath,
      description: metadata.description,
    });
  }

  return {
    count: agents.length,
    agents,
  };
}

/**
 * Get a specific agent by ID
 */
export function getAgent(agentId: string, projectRoot: string = process.cwd()): Agent | null {
  const agentsDir = join(projectRoot, '.claude', 'agents');
  const filePath = join(agentsDir, `${agentId}.md`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  const metadata = parseAgentMetadata(content, `${agentId}.md`);

  return {
    id: agentId,
    name: metadata.name || agentId,
    filename: `${agentId}.md`,
    path: filePath,
    description: metadata.description,
  };
}

/**
 * List all available agent IDs
 */
export function listAgentIds(projectRoot: string = process.cwd()): string[] {
  const agentsDir = join(projectRoot, '.claude', 'agents');

  if (!existsSync(agentsDir)) {
    return [];
  }

  return readdirSync(agentsDir)
    .filter(f => extname(f) === '.md')
    .map(f => basename(f, '.md'));
}
