---
name: mcp-starter-packs
description: "Recommended MCP server packs by role. Developer, Knowledge Worker, Data, Content, DevOps."
version: 1.0.0
triggers:
  keywords:
    - which MCP
    - install MCP
    - MCP servers
    - recommended tools
    - setup MCP
---

# MCP Starter Packs — Install the Right Tools for Your Role

Don't install all 40. Pick your starter pack, add more as needed.

## Developer Pack (5 servers)

```bash
# Filesystem + GitHub + Context7 + Sentry + Codebase Memory
npx @anthropic-ai/mcp-server-filesystem    # Read/write local files
npx @anthropic-ai/mcp-server-github         # PRs, issues, code search
npx -y @upstash/context7-mcp               # Up-to-date library docs
npx @sentry/mcp-server                     # Error monitoring
npx codebase-memory-mcp                    # Project knowledge graph
```

## Knowledge Worker Pack (5 servers)

```bash
npx @anthropic-ai/mcp-server-filesystem
npx @anthropic-ai/mcp-server-gdrive        # Google Drive
npx gmail-mcp                              # Email triage
npx google-calendar-mcp                    # Scheduling
npx @anthropic-ai/mcp-server-notion        # Notion databases
```

## Data Analyst Pack (5 servers)

```bash
npx @anthropic-ai/mcp-server-filesystem
npx @anthropic-ai/mcp-server-sqlite        # Local databases
npx @anthropic-ai/mcp-server-postgres      # Production databases
npx excel-mcp-server                       # Spreadsheet manipulation
npx tavily-mcp                             # Web research
```

## Content Creator Pack (5 servers)

```bash
npx @anthropic-ai/mcp-server-filesystem
npx tavily-mcp                             # Web research
npx obsidian-mcp                           # Knowledge base
npx markdownify-mcp                        # PDF/image to markdown
npx @anthropic-ai/mcp-server-slack         # Team communication
```

## DevOps Pack (5 servers)

```bash
npx @anthropic-ai/mcp-server-filesystem
npx @anthropic-ai/mcp-server-docker        # Container management
npx @anthropic-ai/mcp-server-github        # Code management
npx aws-mcp-server                         # AWS infrastructure
npx mcp-k8s                                # Kubernetes
```

## Essential Add-Ons (any role)

- **RTK** (`cargo install --git https://github.com/rtk-ai/rtk`) — 60-90% bash token compression
- **Context7** — always useful for up-to-date docs
- **Tavily** — always useful for web research

## How to Add an MCP Server to Claude Code

```bash
# In Claude Code settings.json (mcpServers section):
{
  "server-name": {
    "command": "npx",
    "args": ["-y", "package-name"],
    "env": { "API_KEY": "your-key" }
  }
}
```
