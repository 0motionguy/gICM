# @clawdbot/mcp-server

MCP server for [ClawdBot](https://clawdbot.com) — search, install, and verify 617+ Web3/AI skills.

## Quick Start

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clawdbot": {
      "command": "npx",
      "args": ["-y", "@clawdbot/mcp-server@latest"]
    }
  }
}
```

Or run directly:

```bash
npx @clawdbot/mcp-server
```

## Tools

### clawdbot_search

Search the ClawdBot marketplace for Web3/Solana/DeFi skills.

```
query: "solana wallet"
kind: "agent" | "skill" | "mcp" | "command"
ecosystem: "clawdhub-native" | "clawdbot-exclusive"
```

### clawdbot_install

Get installation instructions for a skill.

```
skill_id: "jupiter-swap-agent"
```

### clawdbot_verify

Check security status and audit results.

```
skill_name: "jupiter-swap-agent"
```

## API

All tools call the live ClawdBot API at `https://clawdbot.com/api`.

- Search: `GET /api/search?q=solana`
- A2A Tasks: `POST /api/a2a/tasks`
- Health: `GET /api/health`
- Agent Card: `GET /.well-known/agent.json`

## License

MIT
