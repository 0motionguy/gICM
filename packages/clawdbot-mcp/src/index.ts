#!/usr/bin/env node
/**
 * @clawdbot/mcp-server
 *
 * MCP server for ClawdBot — the verified Web3/AI agent marketplace.
 * Exposes search, install, and verify tools over stdio transport.
 *
 * Usage:
 *   npx @clawdbot/mcp-server
 *
 * Or add to claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "clawdbot": {
 *         "command": "npx",
 *         "args": ["-y", "@clawdbot/mcp-server@latest"]
 *       }
 *     }
 *   }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { toolDefinitions, handleTool } from "./tools.js";

const server = new Server(
  {
    name: "clawdbot",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleTool(name, (args ?? {}) as Record<string, unknown>);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ClawdBot MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start ClawdBot MCP server:", error);
  process.exit(1);
});
