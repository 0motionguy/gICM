#!/usr/bin/env node
/**
 * gICM Context MCP Server
 *
 * Provides semantic search over gICM marketplace components
 * for Claude Code, Cursor, and Windsurf.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { tools, handleToolCall } from "./tools/index.js";
import { getResources } from "./resources/indexed-repos.js";
const server = new Server({
    name: "gicm-context",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.entries(tools).map(([name, config]) => ({
        name,
        description: config.description,
        inputSchema: {
            type: "object",
            properties: config.parameters,
            required: Object.entries(config.parameters)
                .filter(([_, v]) => !v.optional)
                .map(([k]) => k),
        },
    })),
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(name, args);
});
// List resources (indexed repos)
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: await getResources(),
}));
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("gICM Context MCP server running");
}
main().catch(console.error);
//# sourceMappingURL=index.js.map