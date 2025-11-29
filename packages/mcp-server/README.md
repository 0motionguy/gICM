# @gicm/mcp-server

MCP (Model Context Protocol) server for gICM marketplace. Provides semantic search over 390+ components directly in Claude Code, Cursor, and Windsurf.

## Features

- **search_components** - Find agents, skills, MCPs, workflows by natural language
- **search_codebase** - Semantic search across indexed Git repositories
- **get_file_context** - Get specific lines from indexed files
- **index_repository** - Queue Git repos for indexing

## Installation

### Claude Code

Add to `~/.config/claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "gicm-context": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-server"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "gicm-context": {
      "command": "npx",
      "args": ["-y", "@gicm/mcp-server"]
    }
  }
}
```

## Prerequisites

1. **Qdrant** running on `localhost:6333`
2. **Gemini API Key** for embeddings (free tier available)
3. **Indexed gICM registry** (run the indexer first)

## Quick Start

```bash
# Start Qdrant (from services/context-engine/)
docker compose up -d

# Index gICM registry
cd services/context-engine
python scripts/index-gicm-registry.py

# Now Claude Code can use the MCP server!
```

## Usage Examples

In Claude Code, Cursor, or Windsurf:

```
"Find me a Solana trading bot agent"
→ Uses search_components to find relevant agents

"Search for authentication code"
→ Uses search_codebase to find auth implementations

"Index the repo https://github.com/user/project"
→ Queues repository for indexing
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QDRANT_URL` | Qdrant server URL | `http://localhost:6333` |
| `INDEXER_API` | Indexer service URL | `http://localhost:8000` |
| `GEMINI_API_KEY` | Gemini API key (free tier) | Required |

## Development

```bash
cd packages/mcp-server
npm install
npm run dev
```

## License

MIT
