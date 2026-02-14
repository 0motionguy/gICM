# @clawdbot/claude-bridge-mcp

Bidirectional MCP bridge that exposes Claude Code capabilities over HTTP+SSE, allowing remote agents (like OpenClaw) to execute tasks on your machine.

## Architecture

```
Remote Agent (Mac)                    This Machine (PC)
┌──────────────┐    Tailscale/LAN    ┌──────────────────┐
│   OpenClaw   │◄── mcp-remote ────►│  claude-bridge   │
│   :3000/sse  │                     │  :3100/sse       │
│              │                     │  → Claude CLI    │
└──────────────┘                     └──────────────────┘
```

## Quick Start

```bash
# Install & run
cd packages/claude-bridge-mcp
pnpm install
pnpm dev

# Or build and run
pnpm build
pnpm start
```

## Connect from Remote Agent

On the remote machine (e.g., Mac running OpenClaw):

```json
{
  "mcpServers": {
    "claude-bridge": {
      "command": "npx",
      "args": ["mcp-remote", "http://<pc-tailscale-ip>:3100/sse"]
    }
  }
}
```

## Available Tools

| Tool                | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `claude_execute`    | Run a task via Claude Code (full coding capabilities) |
| `claude_query`      | Ask a question (read-only, fast)                      |
| `claude_read_file`  | Read a file from this machine                         |
| `claude_git_status` | Get git status of a local repo                        |

## Configuration

Environment variables:

| Variable                | Default              | Description                         |
| ----------------------- | -------------------- | ----------------------------------- |
| `BRIDGE_HOST`           | `0.0.0.0`            | Bind address                        |
| `BRIDGE_PORT`           | `3100`               | Server port                         |
| `BRIDGE_ALLOWED_IPS`    | `100.123.82.111`     | Comma-separated allowed IPs         |
| `BRIDGE_ALLOWED_DIRS`   | `C:\Users\mirko\...` | Comma-separated allowed directories |
| `BRIDGE_TIMEOUT`        | `120000`             | Execution timeout (ms)              |
| `BRIDGE_MAX_CONCURRENT` | `2`                  | Max parallel executions             |

## Run as Service (PM2)

```bash
npm install -g pm2
pm2 start dist/index.js --name claude-bridge
pm2 save && pm2 startup
```
