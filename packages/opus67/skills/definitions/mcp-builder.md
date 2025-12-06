# MCP Builder Expert

> **ID:** `mcp-builder`
> **Tier:** 2
> **Token Cost:** 6000
> **MCP Connections:** context7

## 🎯 What This Skill Does

Build production-ready Model Context Protocol (MCP) servers that extend Claude and other AI assistants with custom tools, resources, and prompts.

**Key Capabilities:**
- Design and implement MCP servers using @modelcontextprotocol/sdk
- Create tool definitions with JSON Schema validation
- Build resource providers with URI schemes
- Configure Claude Desktop and Cursor integration
- Debug with MCP Inspector and logging

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** mcp, model context protocol, tool, server, resource, stdio
- **File Types:** MCP server files
- **Directories:** mcp-server/, servers/, tools/

## 🚀 Core Capabilities

### 1. MCP Protocol Overview

**Protocol Primitives:**
- Tools: Functions Claude can call
- Resources: Data sources Claude can read
- Prompts: Reusable templates
- Sampling: Request AI completions

**Best Practices:**
- Validate inputs with JSON Schema
- Use resources for reads, tools for actions
- Handle errors with meaningful messages
- Keep responses concise

**Common Patterns:**
```typescript
interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}
```

**Gotchas:**
- stdio transport only (not HTTP)
- Stdout for JSON-RPC only
- Use stderr for logging

### 2. Server Implementation

**Best Practices:**
- Use TypeScript for type safety
- Separate tools into modules
- Validate inputs with Zod
- Log to stderr only
- Version your server

**Common Patterns:**
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0"
}, {
  capabilities: { tools: {}, resources: {} }
});
```

**Gotchas:**
- Must use ES modules
- Call server.connect(transport)
- Async handlers return promises

### 3. Tool Definitions

**Best Practices:**
- Use verb_noun naming
- Document all parameters
- Mark required parameters
- Return structured data
- Handle errors gracefully

**Common Patterns:**
```typescript
const tool = {
  name: "query_database",
  description: "Execute SQL query",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" }
    },
    required: ["query"]
  }
};
```

**Gotchas:**
- Tool names must be unique
- inputSchema must be valid JSON Schema
- Don't return overly large responses

### 4. Resource Providers

**Best Practices:**
- Use consistent URI schemes
- Include metadata
- Implement access control
- Cache expensive lists
- Paginate large datasets

**Common Patterns:**
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "config://app/settings",
      name: "Settings",
      mimeType: "application/json"
    }
  ]
}));
```

**Gotchas:**
- URIs must be unique and stable
- Resources are read-only
- Use base64 for binary data

### 5. Client Integration

**Claude Desktop Config:**
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server/dist/index.js"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

**Best Practices:**
- Use absolute paths
- Store secrets in env vars
- Document required vars
- Test on all platforms

**Gotchas:**
- Restart Claude after config changes
- Windows paths need forward slashes
- Environment variables are strings

### 6. Testing & Debugging

**MCP Inspector:**
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

**Best Practices:**
- Log to stderr only
- Use structured logging
- Write integration tests
- Monitor performance

**Gotchas:**
- console.log breaks JSON-RPC
- Uncaught exceptions crash silently
- Large payloads exceed limits

## 💡 Real-World Examples

### Example 1: Database Query Server

Complete PostgreSQL MCP server with query execution, table listing, and schema inspection.

### Example 2: GitHub Integration

GitHub API server with repository management, issue creation, and code search.

## 🔗 Related Skills

- **api-builder** - REST API patterns
- **typescript-advanced** - Advanced types
- **nodejs-backend** - Node.js patterns
- **testing-patterns** - Testing strategies

## 📖 Further Reading

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Claude Desktop](https://claude.ai/download)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
*Last updated: 2025-12-05*
