#!/usr/bin/env node
/**
 * OPUS 67 MCP Server
 * Exposes all OPUS 67 capabilities to Claude Code as MCP tools
 *
 * Refactored from 633 lines to ~100 lines by extracting:
 * - mcp-server/types.ts: Type definitions
 * - mcp-server/registry.ts: YAML loading and parsing
 * - mcp-server/tools.ts: Tool definitions
 * - mcp-server/handlers.ts: Tool call handlers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { getPackageRoot, loadRegistries, loadSkillDefinition } from './mcp-server/registry.js';
import { TOOL_DEFINITIONS } from './mcp-server/tools.js';
import { handleToolCall, type HandlerContext } from './mcp-server/handlers.js';
import type { ToolArgs } from './mcp-server/types.js';

// Initialize
const PACKAGE_ROOT = getPackageRoot();
const { skills, mcpConnections, modes } = loadRegistries(PACKAGE_ROOT);

const handlerContext: HandlerContext = {
  skills,
  mcpConnections,
  modes,
  packageRoot: PACKAGE_ROOT
};

// Create MCP server
const server = new Server(
  { name: 'opus67', version: '3.2.2' },
  { capabilities: { tools: {}, resources: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleToolCall(name, args as ToolArgs, handlerContext);
});

// List resources (skill definitions)
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: skills.map(skill => ({
    uri: `opus67://skill/${skill.id}`,
    name: skill.name,
    description: `${skill.category} skill - ${skill.tokens} tokens`,
    mimeType: 'text/markdown',
  }))
}));

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri.startsWith('opus67://skill/')) {
    const skillId = uri.replace('opus67://skill/', '');
    const skill = skills.find(s => s.id === skillId);

    if (skill) {
      const defPath = join(PACKAGE_ROOT, 'skills', 'definitions', `${skillId}.md`);
      let content = `# ${skill.name}\n\n`;

      if (existsSync(defPath)) {
        content += readFileSync(defPath, 'utf-8');
      } else {
        content += `Category: ${skill.category}\n`;
        content += `Tokens: ${skill.tokens}\n\n`;
        content += `## Capabilities\n`;
        content += skill.capabilities?.map(c => `- ${c}`).join('\n') || 'General assistance';
      }

      return {
        contents: [{ uri, mimeType: 'text/markdown', text: content }]
      };
    }
  }

  return { contents: [] };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[OPUS67] MCP Server started');
  console.error(`[OPUS67] Skills: ${skills.length}, MCPs: ${mcpConnections.length}, Modes: ${modes.length}`);
}

main().catch((error) => {
  console.error('[OPUS67] Fatal error:', error);
  process.exit(1);
});
