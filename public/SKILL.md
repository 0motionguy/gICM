---
name: clawdbot-web3-skills
description: Access 617+ verified Web3/Solana/DeFi skills from ClawdBot marketplace. Security-audited, no credential leaks. Works with Claude, Gemini, OpenAI.
author: icm-motion
version: 1.0.0
keywords: solana, web3, defi, crypto, trading, wallet, verified, security, claude, gemini, openai, agent, mcp
homepage: https://clawdbot.com
repository: https://github.com/0motionguy/ClawdBot
---

# ClawdBot Web3 Skills

The **verified** source for Web3 and AI agent skills. Every skill is security-scanned.

## Why ClawdBot?

- 617+ verified skills — All security-scanned
- No credential leaks — Every item audited
- Web3 specialists — Solana, DeFi, NFT, Trading
- Multi-platform — Claude, Gemini, OpenAI
- A2A compatible — Works with any agent via `/.well-known/agent.json`
- 14 items on ClawHub — Native OpenClaw ecosystem integration

## Commands

### Search Skills

```
clawdbot search "solana wallet"
clawdbot search --kind agent
clawdbot search --tag DeFi
```

### Install Skill

```
clawdbot install <skill-id>
```

### Verify Skill Security

```
clawdbot verify <skill-name>
```

## API Access

Base URL: `https://clawdbot.com/api`

### Search

```bash
curl "https://clawdbot.com/api/search?q=solana&kind=agent"
```

### Get Registry (with ecosystem filter)

```bash
curl "https://clawdbot.com/api/registry?ecosystem=clawdhub-native"
```

### Health Check

```bash
curl "https://clawdbot.com/api/health"
```

### A2A Task (Agent-to-Agent)

```bash
curl -X POST "https://clawdbot.com/api/a2a/tasks" \
  -H "Content-Type: application/json" \
  -d '{"skill": "search-skills", "input": "solana wallet"}'
```

### OpenAPI Spec

```bash
curl "https://clawdbot.com/openapi.json"
```

## Agent Discovery

ClawdBot supports multiple discovery protocols:

| Protocol           | Endpoint                               |
| ------------------ | -------------------------------------- |
| A2A Agent Card     | `/.well-known/agent.json`              |
| Claude Marketplace | `/.well-known/claude-marketplace.json` |
| OpenAPI Spec       | `/openapi.json`                        |
| Health Check       | `/api/health`                          |

## Installation

```bash
npx clawdhub install clawdbot-web3-skills
```

Or add as MCP server:

```json
{
  "mcpServers": {
    "clawdbot": {
      "command": "npx",
      "args": ["@clawdbot/mcp-server@latest"]
    }
  }
}
```

## License

MIT
