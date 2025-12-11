# MCP Integration Guide

> Complete documentation for Model Context Protocol (MCP) servers in the gICM ecosystem.

## Overview

Model Context Protocol (MCP) enables Claude to interact with external tools and services. gICM provides 82+ pre-configured MCP servers covering blockchain, databases, APIs, and development tools.

```
+------------------------------------------------------------------+
|                    MCP ARCHITECTURE                               |
+------------------------------------------------------------------+
|                                                                   |
|  Claude Desktop / Claude Code                                     |
|         |                                                         |
|         v                                                         |
|  +-------------+     +-------------+     +-------------+          |
|  |   MCP       |     |   MCP       |     |   MCP       |          |
|  | Transport   | --> |  Protocol   | --> |   Server    |          |
|  |  (stdio)    |     |  (JSON-RPC) |     | (Node/Py)   |          |
|  +-------------+     +-------------+     +-------------+          |
|                                                |                  |
|                                                v                  |
|                                    +--------------------+         |
|                                    |  External Service  |         |
|                                    | (API, DB, Chain)   |         |
|                                    +--------------------+         |
+------------------------------------------------------------------+
```

---

## Available MCP Servers

### Blockchain (15 servers)

| Server            | Description                     | Install                                 |
| ----------------- | ------------------------------- | --------------------------------------- |
| `anchor-mcp`      | Solana Anchor development tools | `npx @gicm/cli add mcp/anchor-mcp`      |
| `solana-rpc`      | Solana RPC operations           | `npx @gicm/cli add mcp/solana-rpc`      |
| `helius-mcp`      | Helius API integration          | `npx @gicm/cli add mcp/helius-mcp`      |
| `jupiter-mcp`     | Jupiter swap aggregator         | `npx @gicm/cli add mcp/jupiter-mcp`     |
| `birdeye-mcp`     | Birdeye token data              | `npx @gicm/cli add mcp/birdeye-mcp`     |
| `dexscreener-mcp` | DEX Screener data               | `npx @gicm/cli add mcp/dexscreener-mcp` |
| `pump-fun-mcp`    | Pump.fun token launches         | `npx @gicm/cli add mcp/pump-fun-mcp`    |
| `metaplex-mcp`    | NFT minting & metadata          | `npx @gicm/cli add mcp/metaplex-mcp`    |
| `raydium-mcp`     | Raydium liquidity pools         | `npx @gicm/cli add mcp/raydium-mcp`     |
| `orca-mcp`        | Orca concentrated liquidity     | `npx @gicm/cli add mcp/orca-mcp`        |
| `magic-eden-mcp`  | Magic Eden marketplace          | `npx @gicm/cli add mcp/magic-eden-mcp`  |
| `ethereum-mcp`    | Ethereum RPC operations         | `npx @gicm/cli add mcp/ethereum-mcp`    |
| `viem-mcp`        | Viem TypeScript client          | `npx @gicm/cli add mcp/viem-mcp`        |
| `foundry-mcp`     | Foundry development suite       | `npx @gicm/cli add mcp/foundry-mcp`     |
| `thirdweb-mcp`    | Thirdweb SDK                    | `npx @gicm/cli add mcp/thirdweb-mcp`    |

### Databases (12 servers)

| Server            | Description              | Install                                 |
| ----------------- | ------------------------ | --------------------------------------- |
| `supabase-mcp`    | Supabase full-stack      | `npx @gicm/cli add mcp/supabase-mcp`    |
| `postgres-mcp`    | PostgreSQL operations    | `npx @gicm/cli add mcp/postgres-mcp`    |
| `prisma-mcp`      | Prisma ORM               | `npx @gicm/cli add mcp/prisma-mcp`      |
| `drizzle-mcp`     | Drizzle ORM              | `npx @gicm/cli add mcp/drizzle-mcp`     |
| `redis-mcp`       | Redis caching            | `npx @gicm/cli add mcp/redis-mcp`       |
| `mongodb-mcp`     | MongoDB operations       | `npx @gicm/cli add mcp/mongodb-mcp`     |
| `firebase-mcp`    | Firebase/Firestore       | `npx @gicm/cli add mcp/firebase-mcp`    |
| `planetscale-mcp` | PlanetScale MySQL        | `npx @gicm/cli add mcp/planetscale-mcp` |
| `turso-mcp`       | Turso SQLite             | `npx @gicm/cli add mcp/turso-mcp`       |
| `neon-mcp`        | Neon serverless Postgres | `npx @gicm/cli add mcp/neon-mcp`        |
| `upstash-mcp`     | Upstash Redis/Kafka      | `npx @gicm/cli add mcp/upstash-mcp`     |
| `xata-mcp`        | Xata serverless DB       | `npx @gicm/cli add mcp/xata-mcp`        |

### APIs & Services (20 servers)

| Server           | Description           | Install                                |
| ---------------- | --------------------- | -------------------------------------- |
| `github-mcp`     | GitHub API operations | `npx @gicm/cli add mcp/github-mcp`     |
| `vercel-mcp`     | Vercel deployments    | `npx @gicm/cli add mcp/vercel-mcp`     |
| `stripe-mcp`     | Stripe payments       | `npx @gicm/cli add mcp/stripe-mcp`     |
| `sendgrid-mcp`   | SendGrid email        | `npx @gicm/cli add mcp/sendgrid-mcp`   |
| `twilio-mcp`     | Twilio SMS/voice      | `npx @gicm/cli add mcp/twilio-mcp`     |
| `slack-mcp`      | Slack messaging       | `npx @gicm/cli add mcp/slack-mcp`      |
| `discord-mcp`    | Discord bots          | `npx @gicm/cli add mcp/discord-mcp`    |
| `notion-mcp`     | Notion workspace      | `npx @gicm/cli add mcp/notion-mcp`     |
| `linear-mcp`     | Linear project mgmt   | `npx @gicm/cli add mcp/linear-mcp`     |
| `openai-mcp`     | OpenAI API            | `npx @gicm/cli add mcp/openai-mcp`     |
| `replicate-mcp`  | Replicate AI models   | `npx @gicm/cli add mcp/replicate-mcp`  |
| `cloudflare-mcp` | Cloudflare Workers    | `npx @gicm/cli add mcp/cloudflare-mcp` |
| `aws-mcp`        | AWS services          | `npx @gicm/cli add mcp/aws-mcp`        |
| `google-mcp`     | Google Cloud          | `npx @gicm/cli add mcp/google-mcp`     |
| `docker-mcp`     | Docker operations     | `npx @gicm/cli add mcp/docker-mcp`     |
| `kubernetes-mcp` | K8s cluster mgmt      | `npx @gicm/cli add mcp/kubernetes-mcp` |
| `shopify-mcp`    | Shopify storefront    | `npx @gicm/cli add mcp/shopify-mcp`    |
| `airtable-mcp`   | Airtable bases        | `npx @gicm/cli add mcp/airtable-mcp`   |
| `algolia-mcp`    | Algolia search        | `npx @gicm/cli add mcp/algolia-mcp`    |
| `sanity-mcp`     | Sanity CMS            | `npx @gicm/cli add mcp/sanity-mcp`     |

### Development Tools (20 servers)

| Server           | Description          | Install                                |
| ---------------- | -------------------- | -------------------------------------- |
| `filesystem-mcp` | File operations      | `npx @gicm/cli add mcp/filesystem-mcp` |
| `git-mcp`        | Git operations       | `npx @gicm/cli add mcp/git-mcp`        |
| `npm-mcp`        | npm package mgmt     | `npx @gicm/cli add mcp/npm-mcp`        |
| `pnpm-mcp`       | pnpm operations      | `npx @gicm/cli add mcp/pnpm-mcp`       |
| `eslint-mcp`     | ESLint analysis      | `npx @gicm/cli add mcp/eslint-mcp`     |
| `prettier-mcp`   | Code formatting      | `npx @gicm/cli add mcp/prettier-mcp`   |
| `typescript-mcp` | TypeScript compiler  | `npx @gicm/cli add mcp/typescript-mcp` |
| `vitest-mcp`     | Vitest testing       | `npx @gicm/cli add mcp/vitest-mcp`     |
| `playwright-mcp` | E2E testing          | `npx @gicm/cli add mcp/playwright-mcp` |
| `vite-mcp`       | Vite bundler         | `npx @gicm/cli add mcp/vite-mcp`       |
| `nextjs-mcp`     | Next.js dev tools    | `npx @gicm/cli add mcp/nextjs-mcp`     |
| `tailwind-mcp`   | Tailwind CSS         | `npx @gicm/cli add mcp/tailwind-mcp`   |
| `shadcn-mcp`     | shadcn/ui components | `npx @gicm/cli add mcp/shadcn-mcp`     |
| `astro-mcp`      | Astro framework      | `npx @gicm/cli add mcp/astro-mcp`      |
| `turborepo-mcp`  | Turborepo monorepo   | `npx @gicm/cli add mcp/turborepo-mcp`  |
| `biome-mcp`      | Biome linter         | `npx @gicm/cli add mcp/biome-mcp`      |
| `sqlite-mcp`     | SQLite browser       | `npx @gicm/cli add mcp/sqlite-mcp`     |
| `browser-mcp`    | Browser automation   | `npx @gicm/cli add mcp/browser-mcp`    |
| `puppeteer-mcp`  | Puppeteer scraping   | `npx @gicm/cli add mcp/puppeteer-mcp`  |
| `fetch-mcp`      | HTTP requests        | `npx @gicm/cli add mcp/fetch-mcp`      |

### Analytics & Monitoring (15 servers)

| Server           | Description           | Install                                |
| ---------------- | --------------------- | -------------------------------------- |
| `posthog-mcp`    | PostHog analytics     | `npx @gicm/cli add mcp/posthog-mcp`    |
| `amplitude-mcp`  | Amplitude analytics   | `npx @gicm/cli add mcp/amplitude-mcp`  |
| `mixpanel-mcp`   | Mixpanel tracking     | `npx @gicm/cli add mcp/mixpanel-mcp`   |
| `sentry-mcp`     | Sentry error tracking | `npx @gicm/cli add mcp/sentry-mcp`     |
| `datadog-mcp`    | Datadog monitoring    | `npx @gicm/cli add mcp/datadog-mcp`    |
| `grafana-mcp`    | Grafana dashboards    | `npx @gicm/cli add mcp/grafana-mcp`    |
| `prometheus-mcp` | Prometheus metrics    | `npx @gicm/cli add mcp/prometheus-mcp` |
| `axiom-mcp`      | Axiom logging         | `npx @gicm/cli add mcp/axiom-mcp`      |
| `logflare-mcp`   | Logflare logs         | `npx @gicm/cli add mcp/logflare-mcp`   |
| `plausible-mcp`  | Plausible analytics   | `npx @gicm/cli add mcp/plausible-mcp`  |
| `fathom-mcp`     | Fathom analytics      | `npx @gicm/cli add mcp/fathom-mcp`     |
| `hotjar-mcp`     | Hotjar heatmaps       | `npx @gicm/cli add mcp/hotjar-mcp`     |
| `logrocket-mcp`  | LogRocket sessions    | `npx @gicm/cli add mcp/logrocket-mcp`  |
| `newrelic-mcp`   | New Relic APM         | `npx @gicm/cli add mcp/newrelic-mcp`   |
| `pagerduty-mcp`  | PagerDuty alerts      | `npx @gicm/cli add mcp/pagerduty-mcp`  |

---

## Configuration

### Claude Desktop Configuration

MCP servers are configured in `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

### Configuration Format

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_ANON_KEY": "${SUPABASE_ANON_KEY}"
      }
    },
    "solana-rpc": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-solana"],
      "env": {
        "SOLANA_RPC_URL": "${SOLANA_RPC_URL}"
      }
    }
  }
}
```

### Server Configuration Schema

```typescript
interface MCPServerConfig {
  // Command to start the server
  command: string; // "npx", "node", "python"

  // Arguments for the command
  args: string[]; // ["-y", "@gicm/mcp-server"]

  // Environment variables
  env?: Record<string, string>;

  // Working directory (optional)
  cwd?: string;

  // Timeout in milliseconds (optional)
  timeout?: number;

  // Restart policy (optional)
  restart?: "always" | "on-failure" | "never";
}
```

---

## Adding New MCPs

### Using the CLI

```bash
# Add a single MCP
npx @gicm/cli add mcp/github-mcp

# Add multiple MCPs
npx @gicm/cli add mcp/github-mcp mcp/supabase-mcp mcp/vercel-mcp

# Add with custom config
npx @gicm/cli add mcp/github-mcp --env GITHUB_TOKEN=xxx
```

### Manual Configuration

1. **Edit configuration file:**

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-my-server"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

2. **Restart Claude Desktop**

3. **Verify connection:**
   - Open Claude Desktop
   - Check for MCP indicator in status bar
   - Test with a server-specific command

---

## Creating Custom MCP Servers

### Project Structure

```
packages/mcp-my-server/
  src/
    index.ts        # Entry point
    tools/
      my-tool.ts    # Tool implementations
    types.ts        # TypeScript types
  package.json
  tsconfig.json
  tsup.config.ts
```

### Minimal Server Implementation

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "my-mcp-server",
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
  tools: [
    {
      name: "my_tool",
      description: "Description of what the tool does",
      inputSchema: {
        type: "object",
        properties: {
          param1: {
            type: "string",
            description: "First parameter",
          },
          param2: {
            type: "number",
            description: "Second parameter",
          },
        },
        required: ["param1"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_tool") {
    const result = await myToolImplementation(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Tool Implementation Pattern

```typescript
// src/tools/fetch-data.ts
import { z } from "zod";

// Input schema
export const FetchDataInputSchema = z.object({
  endpoint: z.string().url(),
  method: z.enum(["GET", "POST"]).default("GET"),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
});

export type FetchDataInput = z.infer<typeof FetchDataInputSchema>;

// Implementation
export async function fetchData(input: FetchDataInput) {
  const validated = FetchDataInputSchema.parse(input);

  const response = await fetch(validated.endpoint, {
    method: validated.method,
    headers: validated.headers,
    body: validated.body ? JSON.stringify(validated.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return {
    status: response.status,
    data: await response.json(),
  };
}

// Tool definition for MCP
export const fetchDataTool = {
  name: "fetch_data",
  description: "Fetch data from an HTTP endpoint",
  inputSchema: {
    type: "object",
    properties: {
      endpoint: {
        type: "string",
        description: "The URL to fetch",
      },
      method: {
        type: "string",
        enum: ["GET", "POST"],
        default: "GET",
      },
      headers: {
        type: "object",
        additionalProperties: { type: "string" },
      },
      body: {
        type: "object",
      },
    },
    required: ["endpoint"],
  },
};
```

### Package Configuration

```json
{
  "name": "@gicm/mcp-my-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "mcp-my-server": "dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Build Configuration

```typescript
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

---

## Security Considerations

### Environment Variables

**NEVER** hardcode secrets in configuration:

```json
// BAD
{
  "env": {
    "API_KEY": "sk-live-1234567890"
  }
}

// GOOD
{
  "env": {
    "API_KEY": "${API_KEY}"
  }
}
```

### API Key Management

1. **Use environment variables**
2. **Rotate keys regularly**
3. **Limit key permissions**
4. **Monitor usage**

### Allowed Operations

Define what each MCP can do:

```typescript
// Restrict file access
const allowedPaths = [process.cwd(), path.join(process.env.HOME!, ".config")];

function validatePath(requestedPath: string): boolean {
  const resolved = path.resolve(requestedPath);
  return allowedPaths.some((allowed) => resolved.startsWith(allowed));
}
```

### Network Access Control

```typescript
// Allowlist for network requests
const allowedHosts = [
  "api.github.com",
  "api.supabase.co",
  "mainnet.helius-rpc.com",
];

function validateUrl(url: string): boolean {
  const parsed = new URL(url);
  return allowedHosts.includes(parsed.host);
}
```

### Audit Logging

```typescript
// Log all tool invocations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Log invocation
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      tool: name,
      args: sanitizeForLog(args),
    })
  );

  // Process request...
});
```

---

## Troubleshooting

### Common Issues

#### Server Not Starting

```bash
# Check if server is installed
npx @gicm/mcp-server --version

# Test manual start
npx @gicm/mcp-server

# Check logs
tail -f ~/Library/Logs/Claude/mcp-server.log
```

#### Authentication Errors

```bash
# Verify environment variables
echo $GITHUB_TOKEN
echo $SUPABASE_URL

# Test API key directly
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/test
```

#### Connection Timeout

```json
{
  "mcpServers": {
    "slow-server": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-slow"],
      "timeout": 30000
    }
  }
}
```

### Debug Mode

Enable verbose logging:

```bash
# Set environment variable
export MCP_DEBUG=true

# Restart Claude Desktop
```

### Health Check

```typescript
// Add health check tool
{
  name: "health_check",
  description: "Check server health",
  inputSchema: { type: "object", properties: {} }
}

// Implementation
if (name === "health_check") {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        status: "healthy",
        version: "1.0.0",
        uptime: process.uptime(),
      })
    }]
  };
}
```

---

## Best Practices

### Performance

1. **Batch operations** when possible
2. **Cache responses** with appropriate TTL
3. **Use connection pooling** for databases
4. **Implement timeouts** for all external calls

### Error Handling

```typescript
try {
  const result = await externalService.call(args);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
} catch (error) {
  // Return structured error
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: true,
          message: error.message,
          code: error.code || "UNKNOWN",
        }),
      },
    ],
    isError: true,
  };
}
```

### Documentation

Every MCP tool should have:

1. **Clear description** - What the tool does
2. **Input schema** - Required/optional parameters
3. **Output format** - Expected response structure
4. **Examples** - Common use cases
5. **Error codes** - Possible error conditions

---

## Registry Entry

Add your MCP to the registry:

```typescript
// src/lib/registry.ts
{
  id: "my-awesome-mcp",
  kind: "mcp",
  name: "My Awesome MCP",
  slug: "my-awesome-mcp",
  description: "What this MCP does in one line",
  longDescription: "Detailed description...",
  category: "Development Tools",
  tags: ["Tool", "API", "Automation"],
  install: "npx @gicm/cli add mcp/my-awesome-mcp",
  files: [".claude/mcp/my-awesome-mcp.json"],
  envKeys: ["MY_API_KEY", "MY_SECRET"],
  docsUrl: "https://docs.example.com",
  version: "1.0.0",
  audit: {
    lastAudited: "2024-12-01",
    qualityScore: 85,
    status: "VERIFIED"
  }
}
```

---

## See Also

- [Marketplace V2 Schema](./MARKETPLACE-V2.md) - Complete schema documentation
- [Contributing Skills](./CONTRIBUTING-SKILLS.md) - How to create skills
- [Agent Architecture](./AGENT-ARCHITECTURE.md) - Full system architecture
- [MCP SDK Documentation](https://modelcontextprotocol.io/docs)
