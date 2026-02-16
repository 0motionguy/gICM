# AWCN Fleet API + MCP Gateway — Architecture Document

> Comprehensive architecture reference for the AWCN Integration Hub running on Mac (andys-macbook-air).
> Use this to plan features, add MCP servers, expand skills, and understand every moving part.

---

## Table of Contents

1. [Overview](#overview)
2. [Network Topology](#network-topology)
3. [Architecture Diagram](#architecture-diagram)
4. [Source File Map](#source-file-map)
5. [Server Configuration](#server-configuration)
6. [Fleet Manager](#fleet-manager)
7. [Fleet REST API](#fleet-rest-api)
8. [Fleet Zod Type System](#fleet-zod-type-system)
9. [Device Registry](#device-registry)
10. [WebSocket Events](#websocket-events)
11. [MCP Gateway](#mcp-gateway)
12. [MCP Connection Lifecycle](#mcp-connection-lifecycle)
13. [MCP Process Manager](#mcp-process-manager)
14. [MCP Gateway REST API](#mcp-gateway-rest-api)
15. [Integration Hub — Full Module Map](#integration-hub--full-module-map)
16. [Integration Hub — Full Endpoint Reference](#integration-hub--full-endpoint-reference)
17. [Authentication & Security](#authentication--security)
18. [State Files & Data Directories](#state-files--data-directories)
19. [Dependencies](#dependencies)
20. [Current Limitations](#current-limitations)
21. [Expansion Opportunities](#expansion-opportunities)

---

## Overview

The **AWCN Integration Hub** (`@gicm/integration-hub`) is the central nervous system of the AI Worker Compute Network. It runs on the Mac (andys-macbook-air) and serves three major roles:

1. **Fleet API** — Monitors and controls a mesh of OpenClaw nodes (EC2, Android phones, Windows PC) connected via Tailscale
2. **MCP Gateway** — REST-to-JSON-RPC proxy that lets OpenClaw agents call MCP tools without a native MCP client
3. **Integration Hub** — Event bus, engine manager, pipeline orchestration, analytics, webhooks, RBAC, and 30+ module systems for the full gICM SaaS platform

**Key facts:**

- **Port**: 3100 (Mac — no conflict with Claude Bridge on PC:3100, different machine)
- **Framework**: Fastify 5.2 + @fastify/cors + @fastify/websocket
- **Runtime**: `npx tsx src/server.ts` (no dist build yet)
- **Package**: `@gicm/integration-hub` v0.1.1
- **Auth**: Bearer token + IP allowlist (Tailscale IPs only)
- **Cost**: $0/call, <100ms latency

---

## Network Topology

```
                              Tailscale Mesh (100.x.x.x)
                    ┌──────────────────────────────────────────┐
                    │                                          │
  ┌─────────────┐   │   ┌──────────────────────────────────┐   │
  │  PC (sisu)  │───┼──▶│  Mac (andys-macbook-air)         │   │
  │ 100.112.71.27│  │   │  100.107.81.60                   │   │
  │             │   │   │                                  │   │
  │ Claude Code │   │   │  ┌──────────────────────────┐    │   │
  │ Bridge:3100 │   │   │  │ Fleet API :3100          │    │   │
  └─────────────┘   │   │  │  /api/fleet/*            │    │   │
                    │   │  │  /api/mcp/*              │    │   │
  ┌─────────────┐   │   │  │  /ws (WebSocket)         │    │   │
  │ Berni (EC2) │───┼──▶│  └──────────────────────────┘    │   │
  │ 100.70.6.100│   │   │                                  │   │
  │ Ollama,n8n  │   │   │  ┌──────────────────────────┐    │   │
  └─────────────┘   │   │  │ OpenClaw Gateway :18789  │    │   │
                    │   │  │  5 agents (andy/saga/     │    │   │
  ┌─────────────┐   │   │  │  jim/berni/leet)         │    │   │
  │ Saga (Phone)│───┼──▶│  └──────────────────────────┘    │   │
  │100.70.170.54│   │   │                                  │   │
  └─────────────┘   │   └──────────────────────────────────┘   │
                    │                                          │
  ┌─────────────┐   │                                          │
  │ S22 (Phone) │───┘                                          │
  │100.117.160.64                                              │
  └─────────────┘                                              │
                    └──────────────────────────────────────────┘
```

**Request flow (agent → Fleet API):**

```
OpenClaw Agent (Telegram)
  → OpenClaw Gateway :18789
    → SKILL.md (skill definition)
      → HTTP to Fleet API :3100 (Tailscale)
        → FleetManager (CLI/SSH)
          → openclaw nodes status / SSH reconnect
        → MCP Gateway (JSON-RPC over stdio)
          → MCP child process (github, filesystem, etc.)
```

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                  AWCN Integration Hub (Mac:3100)               │
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────────┐ │
│  │  Fastify    │  │ @fastify/  │  │ @fastify/websocket       │ │
│  │  Server     │  │ cors       │  │  /ws?token=xxx           │ │
│  └─────┬──────┘  └────────────┘  └──────────┬───────────────┘ │
│        │                                     │                 │
│  ┌─────▼─────────────────────────────────────▼───────────────┐ │
│  │                   Route Registration                       │ │
│  │                                                            │ │
│  │  Fleet Routes          MCP Gateway Routes                  │ │
│  │  ─────────────         ──────────────────                  │ │
│  │  GET  /api/fleet/*     GET  /api/mcp/servers               │ │
│  │  POST /api/fleet/*     GET  /api/mcp/status                │ │
│  │                        GET  /api/mcp/:server/tools         │ │
│  │  Integration Hub       POST /api/mcp/:server/:tool         │ │
│  │  Routes (50+)          POST /api/mcp/:server/restart       │ │
│  │  ─────────────                                             │ │
│  │  /api/status           Delegated Route Modules             │ │
│  │  /api/engines/*        ─────────────────────               │ │
│  │  /api/brain/*          content-routes.ts                   │ │
│  │  /api/treasury         org-routes.ts (RBAC)                │ │
│  │  /api/predictions/*    audit-routes.ts                     │ │
│  │  /api/pipelines/*      git-routes.ts                       │ │
│  │  /api/analytics/*      bot-routes.ts                       │ │
│  │  /api/webhooks/*       terraform-routes.ts                 │ │
│  │  /api/queue/*          vscode-routes.ts                    │ │
│  │  /api/autonomy/*       ha-routes.ts                        │ │
│  │  /api/events/*         dr-routes.ts                        │ │
│  │  /api/backlog          observability-routes.ts             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  FleetManager     │  │ MCPProcessManager│  │ IntegrationHub│ │
│  │  ───────────────  │  │ ────────────────  │  │ ─────────────│ │
│  │  CLI exec         │  │ spawn child proc │  │ EventBus     │ │
│  │  SSH reconnect    │  │ JSON-RPC stdio   │  │ EngineManager│ │
│  │  Unicode parser   │  │ Lazy start       │  │ Analytics    │ │
│  │  Health loop 30s  │  │ Idle timeout 30s │  │ Workflows    │ │
│  │  5s cache TTL     │  │ Auto-restart     │  │ Queue/Worker │ │
│  │  EventEmitter     │  │ Singleton        │  │ Auth/RBAC    │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ fleet-devices│  │ mcp-servers  │  │ AWCN State Files     │ │
│  │ .json        │  │ .json        │  │ health.json          │ │
│  │ (4 nodes)    │  │ (N servers)  │  │ budgets.json         │ │
│  └──────────────┘  └──────────────┘  │ tasks.json           │ │
│                                      └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## Source File Map

### Fleet API (Mac: `~/.openclaw/awcn-repo/packages/integration-hub/`)

| File                         | Purpose                                            | Lines |
| ---------------------------- | -------------------------------------------------- | ----- |
| `src/server.ts`              | Standalone Fastify server, auth, CORS, WebSocket   | ~150  |
| `src/fleet/fleet-manager.ts` | Core FleetManager class — CLI, SSH, parser, health | ~350  |
| `src/api/fleet-routes.ts`    | Fleet REST endpoint handlers                       | ~120  |
| `src/api/fleet-types.ts`     | Zod schemas for fleet domain                       | ~100  |
| `config/fleet-devices.json`  | 4-node device registry                             | ~50   |

### MCP Gateway (PC: `packages/integration-hub/src/mcp/`)

| File                       | Purpose                                       | Lines |
| -------------------------- | --------------------------------------------- | ----- |
| `src/mcp/types.ts`         | Zod schemas + TS types for MCP protocol       | 116   |
| `src/mcp/connection.ts`    | MCPConnection — single server child process   | 296   |
| `src/mcp/manager.ts`       | MCPProcessManager — multi-server orchestrator | 259   |
| `src/mcp/routes.ts`        | Fastify REST endpoints for MCP proxy          | 125   |
| `mcp-servers.json`         | Runtime config (gitignored)                   | —     |
| `mcp-servers.example.json` | Example config (committed)                    | 38    |

### Integration Hub Core (PC: `packages/integration-hub/src/`)

| File                              | Purpose                                    | Lines |
| --------------------------------- | ------------------------------------------ | ----- |
| `src/index.ts`                    | Package exports — 30+ modules              | ~2505 |
| `src/api/routes.ts`               | Main REST routes — 50+ endpoints           | ~2067 |
| `src/hub.ts`                      | IntegrationHub class — central coordinator | —     |
| `src/event-bus.ts`                | Cross-engine pub/sub event system          | —     |
| `src/engine-manager.ts`           | Engine health monitoring                   | —     |
| `src/analytics.ts`                | Pipeline execution analytics               | —     |
| `src/api/content-routes.ts`       | Content engine routes                      | —     |
| `src/api/org-routes.ts`           | Organization & RBAC routes                 | —     |
| `src/api/audit-routes.ts`         | Audit logging routes                       | —     |
| `src/api/git-routes.ts`           | Git integration routes                     | —     |
| `src/api/bot-routes.ts`           | Chat bot routes (Slack/Discord/Telegram)   | —     |
| `src/api/terraform-routes.ts`     | Infrastructure-as-code routes              | —     |
| `src/api/vscode-routes.ts`        | VS Code extension routes                   | —     |
| `src/api/ha-routes.ts`            | High availability routes                   | —     |
| `src/api/dr-routes.ts`            | Disaster recovery routes                   | —     |
| `src/api/observability-routes.ts` | Observability routes                       | —     |

---

## Server Configuration

**File**: `src/server.ts` (Standalone entry point on Mac)

```typescript
// Key configuration
const PORT = process.env.FLEET_PORT ?? 3100;
const HOST = "0.0.0.0";

// Auth: Bearer token
const AUTH_TOKEN = process.env.FLEET_AUTH_TOKEN ?? "fleet-awcn-2026";

// IP Allowlist (all Tailscale IPs)
const ALLOWED_IPS = [
  "100.112.71.27", // sisu (PC)
  "100.107.81.60", // Mac (localhost equivalent)
  "100.70.6.100", // Berni (EC2)
  "100.70.170.54", // Saga (Android)
  "100.117.160.64", // S22 Ultra (Android)
  "100.74.250.80", // S25 Ultra (Android)
  "127.0.0.1", // localhost
];

// CORS restricted to Tailscale
const CORS_ORIGINS = ALLOWED_IPS.map((ip) => `http://${ip}:*`);
```

**Lifecycle:**

1. Create Fastify instance with CORS + WebSocket plugins
2. Register `onRequest` hook for Bearer token auth (skip `/health`)
3. Register `onRequest` hook for IP allowlist
4. Register fleet routes (`fleet-routes.ts`)
5. Register MCP gateway routes (`mcp/routes.ts`)
6. Initialize FleetManager + start health loop
7. Listen on 0.0.0.0:3100

**WebSocket:**

```
ws://100.107.81.60:3100/ws?token=fleet-awcn-2026
```

Pushes `fleet:status` events from FleetManager health loop every 30 seconds.

---

## Fleet Manager

**File**: `src/fleet/fleet-manager.ts`
**Class**: `FleetManager extends EventEmitter`

### Core Responsibilities

1. **Node Status** — Executes `openclaw nodes status` CLI and parses Unicode table output
2. **Agent Status** — Reads AWCN state files + hardcoded agent list
3. **SSH Reconnect** — SSHes into disconnected nodes to restart `openclaw node run`
4. **Health Loop** — Polls every 30 seconds, emits `fleet:status` events
5. **Cache** — 5-second TTL cache to avoid hammering CLI on rapid requests

### Node Status Parsing

The `openclaw nodes status` command outputs a Unicode box-drawing table:

```
┌──────┬──────────────┬──────────┬──────────────┬──────┐
│ Name │ ID           │ Status   │ Address      │ Type │
├──────┼──────────────┼──────────┼──────────────┼──────┤
│ Ber  │ a1b2c3d4...  │ paired   │ 100.70.6.100 │ node │
│ ni   │              │          │              │      │
├──────┼──────────────┼──────────┼──────────────┼──────┤
│ Saga │ e5f6g7h8...  │ connected│ 100.70.170.54│ node │
└──────┴──────────────┴──────────┴──────────────┴──────┘
```

**Parser strategy** (`parseNodesOutput()`):

1. Strip ANSI escape codes
2. Split on `│` delimiter, trim each cell
3. Group rows by hex ID in column[1] — when col[1] is empty, it's a continuation of the previous row
4. Concatenate wrapped names (e.g., "Ber" + "ni" → "Berni")
5. Handles names spanning up to 3 rows (e.g., "PC-Docker")
6. Returns `NodeInfo[]` with name, id, status, address, type

### SSH Reconnect

Per device type, the reconnect command is:

| Device         | SSH Command                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Berni (EC2)    | `ssh -i <key> ubuntu@100.70.6.100 'export PATH="$HOME/.npm-global/bin:$PATH" && OPENCLAW_GATEWAY_TOKEN=<token> openclaw node run --host 100.107.81.60 --port 18789 --display-name Berni &'` |
| Saga (Android) | `ssh -p 8022 100.70.170.54 'PATH=$HOME/.npm-global/bin:$PATH OPENCLAW_GATEWAY_TOKEN=<token> openclaw node run --host 100.107.81.60 --port 18789 --display-name Saga &'`                     |
| S22 (Android)  | `ssh -p 8022 100.117.160.64 'PATH=$HOME/.npm-global/bin:$PATH OPENCLAW_GATEWAY_TOKEN=<token> openclaw node run --host 100.107.81.60 --port 18789 --display-name S22-Ultra &'`               |
| Leet (PC)      | Not SSH — Windows node managed differently                                                                                                                                                  |

### Health Loop

```typescript
setInterval(async () => {
  const status = await this.getFleetStatus();
  this.emit("fleet:status", status);
}, 30_000); // 30 seconds
```

### Cache System

```typescript
private cache: { data: FleetStatus | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
private CACHE_TTL = 5_000; // 5 seconds

async getFleetStatus(): Promise<FleetStatus> {
  const now = Date.now();
  if (this.cache.data && now - this.cache.timestamp < this.CACHE_TTL) {
    return this.cache.data;
  }
  // ... fetch fresh data
}
```

### Known Agent IDs (STALE)

```typescript
// CURRENT in code (WRONG — needs update):
const KNOWN_AGENTS = ["andy", "scout", "voice", "ops", "trader"];

// SHOULD BE (as of Feb 16 2026):
const KNOWN_AGENTS = ["andy", "saga", "jim", "berni", "leet"];
```

---

## Fleet REST API

**Base**: `http://100.107.81.60:3100`
**Auth**: `Authorization: Bearer fleet-awcn-2026`

### Endpoints

| Method | Path                         | Description                      | Response                                        |
| ------ | ---------------------------- | -------------------------------- | ----------------------------------------------- |
| `GET`  | `/health`                    | Health check (no auth)           | `{ status: "ok" }`                              |
| `GET`  | `/api/fleet/status`          | Full fleet status                | `FleetStatus` (nodes + agents + tasks + budget) |
| `GET`  | `/api/fleet/nodes`           | All node statuses                | `{ nodes: NodeInfo[] }`                         |
| `GET`  | `/api/fleet/agents`          | All agent statuses               | `{ agents: AgentInfo[] }`                       |
| `GET`  | `/api/fleet/tasks`           | Active tasks                     | `{ tasks: TaskInfo[] }`                         |
| `POST` | `/api/fleet/sync`            | Reconnect all disconnected nodes | `SyncResponse`                                  |
| `POST` | `/api/fleet/reconnect/:name` | Reconnect specific node          | `ReconnectResponse`                             |

### Example: Full Fleet Status

```bash
curl -H "Authorization: Bearer fleet-awcn-2026" \
  http://100.107.81.60:3100/api/fleet/status
```

```json
{
  "nodes": [
    {
      "name": "Berni",
      "id": "a1b2c3d4e5f6...",
      "status": "connected",
      "address": "100.70.6.100",
      "type": "node",
      "capabilities": ["ollama", "n8n"]
    }
  ],
  "agents": [
    {
      "id": "andy",
      "status": "active",
      "model": "openrouter/anthropic/claude-sonnet-4.5"
    }
  ],
  "tasks": [],
  "budget": {
    "daily": 10.0,
    "spent": 2.45,
    "remaining": 7.55
  }
}
```

### Example: Reconnect a Node

```bash
curl -X POST -H "Authorization: Bearer fleet-awcn-2026" \
  http://100.107.81.60:3100/api/fleet/reconnect/Berni
```

```json
{
  "ok": true,
  "node": "Berni",
  "message": "Reconnect initiated via SSH"
}
```

---

## Fleet Zod Type System

**File**: `src/api/fleet-types.ts`

### Schemas

```typescript
// Node status from openclaw nodes status
const NodeInfoSchema = z.object({
  name: z.string(),
  id: z.string(),
  status: z.enum(["connected", "paired", "disconnected", "unknown"]),
  address: z.string(),
  type: z.enum(["node", "gateway"]),
  capabilities: z.array(z.string()).default([]),
});

// Agent running on the gateway
const AgentInfoSchema = z.object({
  id: z.string(),
  status: z.enum(["active", "idle", "error", "offline"]),
  model: z.string().optional(),
  lastActivity: z.number().optional(),
});

// Active task
const TaskInfoSchema = z.object({
  id: z.string(),
  agent: z.string(),
  description: z.string(),
  status: z.enum(["running", "queued", "completed", "failed"]),
  startedAt: z.number(),
});

// Budget tracking
const BudgetInfoSchema = z.object({
  daily: z.number(),
  spent: z.number(),
  remaining: z.number(),
});

// Full fleet status
const FleetStatusSchema = z.object({
  nodes: z.array(NodeInfoSchema),
  agents: z.array(AgentInfoSchema),
  tasks: z.array(TaskInfoSchema),
  budget: BudgetInfoSchema,
});

// Device config for fleet-devices.json
const DeviceConfigSchema = z.object({
  name: z.string(),
  tailscaleIp: z.string(),
  os: z.enum(["linux", "android", "windows", "macos"]),
  sshPort: z.number().default(22),
  sshUser: z.string().optional(),
  sshKey: z.string().optional(),
  displayName: z.string(),
  capabilities: z.array(z.string()).default([]),
});

// Reconnect response
const ReconnectResponseSchema = z.object({
  ok: z.boolean(),
  node: z.string(),
  message: z.string(),
});

// Sync response
const SyncResponseSchema = z.object({
  ok: z.boolean(),
  reconnected: z.array(z.string()),
  failed: z.array(z.string()),
  alreadyConnected: z.array(z.string()),
});

// WebSocket event
const FleetEventSchema = z.object({
  type: z.literal("fleet:status"),
  data: FleetStatusSchema,
  timestamp: z.number(),
});
```

---

## Device Registry

**File**: `config/fleet-devices.json`

```json
{
  "devices": [
    {
      "name": "berni",
      "tailscaleIp": "100.70.6.100",
      "os": "linux",
      "sshUser": "ubuntu",
      "sshKey": "~/.ssh/ec2-berni.pem",
      "sshPort": 22,
      "displayName": "Berni",
      "capabilities": ["ollama", "n8n", "docker"]
    },
    {
      "name": "saga",
      "tailscaleIp": "100.70.170.54",
      "os": "android",
      "sshPort": 8022,
      "displayName": "Saga",
      "capabilities": ["termux", "node"]
    },
    {
      "name": "jim",
      "tailscaleIp": "100.117.160.64",
      "os": "android",
      "sshPort": 8022,
      "displayName": "S22-Ultra",
      "capabilities": ["termux", "node"]
    },
    {
      "name": "leet",
      "tailscaleIp": "100.112.71.27",
      "os": "windows",
      "displayName": "Leet",
      "capabilities": ["claude-code", "bridge-mcp", "gpu"]
    }
  ]
}
```

---

## WebSocket Events

**Endpoint**: `ws://100.107.81.60:3100/ws?token=fleet-awcn-2026`

### Connection

```javascript
const ws = new WebSocket("ws://100.107.81.60:3100/ws?token=fleet-awcn-2026");

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  // msg.type === 'fleet:status'
  // msg.data === FleetStatus
  // msg.timestamp === Date.now()
};
```

### Events Pushed

| Event Type     | Frequency | Data                      |
| -------------- | --------- | ------------------------- |
| `fleet:status` | Every 30s | Full `FleetStatus` object |

### Future Events (planned)

| Event Type             | When                  |
| ---------------------- | --------------------- |
| `node:connected`       | Node comes online     |
| `node:disconnected`    | Node goes offline     |
| `agent:task_started`   | Agent begins a task   |
| `agent:task_completed` | Agent finishes a task |
| `mcp:tool_called`      | MCP tool invocation   |

---

## MCP Gateway

The MCP Gateway is a **REST-to-JSON-RPC proxy** that spawns MCP server child processes and exposes their tools over HTTP. This allows OpenClaw agents (which have no native MCP client) to call any MCP tool via simple REST calls.

### Architecture

```
OpenClaw Agent
  → HTTP POST /api/mcp/github/search_repositories
    → MCPProcessManager.callTool("github", "search_repositories", args)
      → MCPConnection("github")
        → spawn("npx", ["-y", "@modelcontextprotocol/server-github"])
          → JSON-RPC 2.0 over stdio
            → { jsonrpc: "2.0", method: "tools/call", params: {...}, id: 1 }
          ← { jsonrpc: "2.0", result: {...}, id: 1 }
        ← MCPToolResult
      ← MCPToolResult
    ← HTTP 200 JSON
  ← Tool result
```

### Key Design Decisions

1. **Lazy Start** — Servers only spawn when first tool is called (saves resources)
2. **Idle Timeout** — Servers auto-stop after 30s idle (configurable per server)
3. **Auto-Restart** — Failed servers restart automatically on next call
4. **Singleton Manager** — One `MCPProcessManager` instance manages all servers
5. **Buffer Parsing** — Newline-delimited JSON over stdout, handles partial reads
6. **Request Timeout** — 30s per JSON-RPC request, rejects on timeout

---

## MCP Connection Lifecycle

**File**: `src/mcp/connection.ts`
**Class**: `MCPConnection extends EventEmitter`

### State Machine

```
stopped ──start()──▶ starting ──init+discover──▶ running
   ▲                     │                          │
   │                     │ (error)                  │ stop()
   │                     ▼                          ▼
   └──────────────── error ◀──────────────────── stopped
                         │
                         │ restart()
                         ▼
                     restarting ──start()──▶ running
```

### Protocol Handshake

```
Client (Fleet API)                     Server (MCP Process)
        │                                       │
        │──── initialize ──────────────────────▶│
        │     { protocolVersion: "2024-11-05",  │
        │       capabilities: {},                │
        │       clientInfo: {                    │
        │         name: "gicm-fleet-api",       │
        │         version: "1.0.0" } }          │
        │                                       │
        │◀─── initialize result ───────────────│
        │     { protocolVersion: "2024-11-05",  │
        │       capabilities: { tools: {} } }    │
        │                                       │
        │──── notifications/initialized ───────▶│
        │     (no response expected)             │
        │                                       │
        │──── tools/list ──────────────────────▶│
        │                                       │
        │◀─── tools/list result ───────────────│
        │     { tools: [...] }                   │
        │                                       │
        │     === CONNECTION READY ===           │
```

### JSON-RPC 2.0 Transport

- **Transport**: stdio (stdin/stdout of child process)
- **Framing**: Newline-delimited JSON (one JSON object per line)
- **Request IDs**: Auto-incrementing integers
- **Pending Map**: `Map<id, { resolve, reject, timeout }>` with 30s per-request timeout
- **Buffer**: String buffer for partial reads, processes complete lines

### Key Methods

```typescript
class MCPConnection {
  // Lifecycle
  async start(): Promise<void>; // spawn + init + discover
  async stop(): Promise<void>; // kill process
  async restart(): Promise<void>; // kill + start, increment restartCount

  // Tool operations (lazy-start if not running)
  async callTool(
    name: string,
    args?: Record<string, unknown>
  ): Promise<MCPToolResult>;
  async listTools(): Promise<MCPToolDefinition[]>;

  // State
  get status(): MCPServerStatus; // stopped|starting|running|error|restarting
  get tools(): MCPToolDefinition[]; // discovered tools
  get pid(): number | undefined; // OS process ID
  get startedAt(): number | undefined;
  get lastUsed(): number | undefined;
  get restartCount(): number;
  get error(): string | undefined;
}
```

### Events

| Event          | When                                    | Payload               |
| -------------- | --------------------------------------- | --------------------- |
| `ready`        | After successful start + tool discovery | —                     |
| `error`        | Process error or protocol failure       | `Error`               |
| `closed`       | Process exited                          | —                     |
| `toolsChanged` | Tool list updated                       | `MCPToolDefinition[]` |

---

## MCP Process Manager

**File**: `src/mcp/manager.ts`
**Class**: `MCPProcessManager extends EventEmitter`
**Pattern**: Singleton via `getMCPManager()`

### Config Loading

Reads `mcp-servers.json` (Zod-validated):

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." },
      "eager": false,
      "idleTimeout": 30000
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "eager": false,
      "idleTimeout": 60000
    }
  }
}
```

### Config Schema

```typescript
MCPServerConfigSchema = z.object({
  command: z.string(), // e.g. "npx", "uvx", "node"
  args: z.array(z.string()), // e.g. ["-y", "@mcp/server-github"]
  env: z.record(z.string()), // extra env vars (merged with process.env)
  eager: z.boolean().default(false), // start immediately on load
  idleTimeout: z.number().default(30_000), // ms before auto-stop (0 = never)
});
```

### Lifecycle

```
loadConfig()
  → parse mcp-servers.json
  → store configs Map<name, MCPServerConfig>
  → eager-start marked servers

callTool(server, tool, args)
  → getOrCreateConnection(server)
    → if running, return existing
    → else create new MCPConnection + start()
  → conn.callTool(tool, args)
  → resetIdleTimer(server)
  → return result

idleTimer fires (30s default)
  → conn.stop()
  → emit server:stopped
```

### Key Methods

```typescript
class MCPProcessManager {
  loadConfig(): void; // Load mcp-servers.json
  listServers(): MCPServerInfo[]; // All servers with status
  getTools(server: string): Promise<MCPToolDefinition[]>; // Lazy-start
  callTool(server, tool, args): Promise<MCPToolResult>; // Lazy-start
  restartServer(server: string): Promise<void>;
  getStatus(): MCPGatewayStatus; // Aggregated stats
  shutdown(): Promise<void>; // Stop all, cleanup
}
```

### Events

| Event            | Payload                                              |
| ---------------- | ---------------------------------------------------- |
| `server:started` | `(name: string)`                                     |
| `server:stopped` | `(name: string)`                                     |
| `server:error`   | `(name: string, error: Error)`                       |
| `tool:called`    | `(server: string, tool: string, durationMs: number)` |

### Auto-Restart

If `callTool()` catches an error and the connection status is `error` or `stopped`:

1. Logs warning: `[MCP-Manager] Restarting ${server} after failure`
2. Calls `conn.restart()`
3. Retries the tool call once
4. If retry fails, throws to caller

---

## MCP Gateway REST API

**Base**: `http://100.107.81.60:3100`
**Auth**: `Authorization: Bearer fleet-awcn-2026`

### Endpoints

| Method | Path                       | Description                           | Response                                 |
| ------ | -------------------------- | ------------------------------------- | ---------------------------------------- |
| `GET`  | `/api/mcp/servers`         | List all servers + full status        | `MCPGatewayStatus`                       |
| `GET`  | `/api/mcp/status`          | Quick health summary                  | `{ ok, servers, running, tools, calls }` |
| `GET`  | `/api/mcp/:server/tools`   | List tools for a server (lazy-starts) | `{ server, tools: MCPToolDefinition[] }` |
| `POST` | `/api/mcp/:server/:tool`   | Call a tool (lazy-starts)             | `{ server, tool, duration, result }`     |
| `POST` | `/api/mcp/:server/restart` | Force restart a server                | `{ ok, server, message }`                |

### Example: List MCP Servers

```bash
curl -H "Authorization: Bearer fleet-awcn-2026" \
  http://100.107.81.60:3100/api/mcp/servers
```

```json
{
  "timestamp": 1739750000000,
  "servers": [
    {
      "name": "github",
      "status": "stopped",
      "tools": [],
      "restartCount": 0
    },
    {
      "name": "filesystem",
      "status": "running",
      "tools": [
        { "name": "read_file", "description": "Read a file" },
        { "name": "write_file", "description": "Write a file" }
      ],
      "pid": 12345,
      "startedAt": 1739749900000,
      "lastUsed": 1739749950000,
      "restartCount": 0
    }
  ],
  "stats": {
    "totalServers": 2,
    "running": 1,
    "stopped": 1,
    "errors": 0,
    "totalTools": 2,
    "totalCalls": 5
  }
}
```

### Example: Call a Tool

```bash
curl -X POST -H "Authorization: Bearer fleet-awcn-2026" \
  -H "Content-Type: application/json" \
  -d '{"arguments": {"query": "gicm", "per_page": 5}}' \
  http://100.107.81.60:3100/api/mcp/github/search_repositories
```

```json
{
  "server": "github",
  "tool": "search_repositories",
  "duration": 1234,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ ... search results ... }"
      }
    ]
  }
}
```

### Body Format

Two formats accepted for `POST /api/mcp/:server/:tool`:

```json
// Format 1: Wrapped (standard)
{ "arguments": { "query": "hello" } }

// Format 2: Direct (convenience)
{ "query": "hello" }
```

---

## Integration Hub — Full Module Map

The `@gicm/integration-hub` exports 30+ module systems from `src/index.ts`. Here's every module:

| Module               | Purpose                           | Key Exports                                                                            |
| -------------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| **Hub**              | Central coordinator               | `IntegrationHub`, `getHub()`                                                           |
| **Event Bus**        | Cross-engine pub/sub              | `EventBus`, `eventBus`                                                                 |
| **Engine Manager**   | Health monitoring for 6 engines   | `EngineManager`, engine IDs: brain/money/growth/product/trading/opus67                 |
| **API Server**       | Fastify HTTP server               | `ApiServer`                                                                            |
| **Workflows**        | Automated multi-step flows        | `workflows`, `registerWorkflows()`                                                     |
| **Analytics**        | Pipeline execution metrics        | `AnalyticsManager`, `createPersistentAnalytics()`                                      |
| **Storage**          | Supabase persistence              | `SupabaseStorage`, `initializeStorage()`                                               |
| **Queue**            | Background job processing (Bull)  | `PipelineQueue`, `BullPipelineQueue`, `PipelineWorker`                                 |
| **Notifications**    | Webhook delivery                  | `WebhookManager`                                                                       |
| **Execution**        | Tool registry + agent executor    | `toolRegistry`, `AgentExecutor`                                                        |
| **Scheduler**        | Cron-based scheduling             | `ScheduleManager`, `CRON_PRESETS`                                                      |
| **Auth/RBAC**        | Multi-tenancy + role-based access | `RBACManager`, `PERMISSIONS`, `PLAN_LIMITS`                                            |
| **Audit**            | Audit event logging               | `AuditLogger`, severity levels                                                         |
| **Cache**            | Multi-strategy caching            | `CacheManager`, `cacheMiddleware`                                                      |
| **Plugins**          | Plugin system                     | `PluginManager`, `PluginLoader`                                                        |
| **Content**          | Content pipeline + distribution   | `ContentPipeline`, `ContentDistributor`, `ContentRecycler`                             |
| **SDK**              | Client SDK                        | `GICMClient`, `createGICMClient()`                                                     |
| **Performance**      | Performance monitoring            | `PerformanceMonitor`, `QueryAnalyzer`, `MemoryProfiler`                                |
| **Intelligence**     | AI-powered insights               | `SuggestionEngine`, `AnomalyDetector`, `PredictiveAnalytics`, `NaturalLanguageBuilder` |
| **Git**              | Repository management             | `GitManager`, `BranchProtection`, `PRWorkflow`                                         |
| **Chat**             | Multi-platform bots               | `ChatManager`, Slack/Discord/Telegram/Teams integrations                               |
| **Terraform**        | IaC management                    | `TerraformManager`, `TerraformPlan`, `TerraformState`                                  |
| **VS Code**          | Editor extension API              | `VSCodeExtension`, `InlineCompletion`, `DiagnosticsProvider`                           |
| **HA**               | High availability                 | `HealthChecker`, `LoadBalancer`, `FailoverManager`                                     |
| **Reliability**      | Resilience patterns               | `CircuitBreaker`, `RetryManager`, `TimeoutManager`, `HealthAggregator`                 |
| **DR**               | Disaster recovery                 | `BackupManager`, `RestoreManager`                                                      |
| **Observability**    | Distributed tracing               | `Tracer`, `MetricsCollector`, `Logger`                                                 |
| **Secrets**          | Secret management                 | `SecretManager`, `SecretRotation`                                                      |
| **Rate Limiting**    | Request throttling                | `RateLimiter`, `RateLimitMiddleware`                                                   |
| **API Auth**         | Multiple auth strategies          | `APIKeyAuth`, `JWTAuth`, `OAuth2Auth`, `BasicAuth`, `BearerAuth`                       |
| **Security Headers** | HTTP security                     | CSP, CORS, HSTS middleware                                                             |
| **Telemetry**        | OpenTelemetry integration         | `TelemetryManager`, `TraceExporter`, `MetricExporter`                                  |
| **Log Aggregator**   | Centralized logging               | `LogAggregator`, `LogRouter`                                                           |
| **Metrics Registry** | Custom metrics                    | `MetricsRegistry`, `Counter`, `Histogram`, `Gauge`                                     |
| **SLO Manager**      | Service-level objectives          | `SLOManager`, `SLODefinition`                                                          |
| **Feature Flags**    | Feature toggles                   | `FeatureFlagManager`, `FlagEvaluator`                                                  |
| **Config Manager**   | Dynamic configuration             | `ConfigManager`, `ConfigSource`                                                        |
| **Multi-Region**     | Geographic distribution           | `RegionManager`, `RegionConfig`                                                        |
| **Deployment**       | Release management                | `DeploymentManager`, `RollbackManager`                                                 |
| **LLM Cost Tracker** | AI spending tracking              | `LLMCostTracker`, `TokenCounter`                                                       |
| **Token Analytics**  | Token usage analysis              | `TokenAnalytics`, `UsageReport`                                                        |
| **Prompt Manager**   | Prompt versioning                 | `PromptManager`, `PromptTemplate`                                                      |
| **Model Evaluator**  | Model comparison                  | `ModelEvaluator`, `EvalResult`                                                         |
| **MCP Gateway**      | REST-to-MCP proxy                 | `getMCPManager()`, `MCPProcessManager`, `MCPConnection`                                |

---

## Integration Hub — Full Endpoint Reference

### Main Routes (`routes.ts` — 2067 lines)

#### Delegated Route Modules (registered first)

| Module               | Prefix                 | Registration                          |
| -------------------- | ---------------------- | ------------------------------------- |
| Content Routes       | `/api/content/*`       | `registerContentRoutes(fastify, hub)` |
| Org/RBAC Routes      | `/api/orgs/*`          | `registerOrgRoutes(fastify)`          |
| Audit Routes         | `/api/audit/*`         | `registerAuditRoutes(fastify)`        |
| Git Routes           | `/api/git/*`           | `gitRoutes(fastify)`                  |
| Bot Routes           | `/api/bots/*`          | `botRoutes(fastify)`                  |
| Terraform Routes     | `/api/terraform/*`     | `terraformRoutes(fastify)`            |
| VS Code Routes       | `/api/vscode/*`        | `vscodeRoutes(fastify)`               |
| HA Routes            | `/api/ha/*`            | `haRoutes(fastify)`                   |
| DR Routes            | `/api/dr/*`            | `drRoutes(fastify)`                   |
| Observability Routes | `/api/observability/*` | `observabilityRoutes(fastify)`        |
| MCP Routes           | `/api/mcp/*`           | `mcpRoutes(fastify)`                  |

#### Engine Registration

| Method | Path                      | Description                                                 |
| ------ | ------------------------- | ----------------------------------------------------------- |
| `POST` | `/api/engines/register`   | Register engine (brain/money/growth/product/trading/opus67) |
| `POST` | `/api/engines/heartbeat`  | Engine heartbeat                                            |
| `POST` | `/api/engines/unregister` | Unregister engine                                           |

#### System Status

| Method | Path                   | Description                                   |
| ------ | ---------------------- | --------------------------------------------- |
| `GET`  | `/api/status`          | Overall system status (all engines)           |
| `GET`  | `/api/brain/status`    | Brain orchestrator status                     |
| `GET`  | `/api/money/status`    | Money engine (treasury, balances, trading)    |
| `GET`  | `/api/growth/status`   | Growth engine (traffic, content, social, SEO) |
| `GET`  | `/api/product/status`  | Product engine (backlog, builds, metrics)     |
| `GET`  | `/api/hunter/status`   | Hunter agent (discovery sources, signals)     |
| `GET`  | `/api/autonomy/status` | Autonomy engine (level, queue, audit, usage)  |

#### Brain Control

| Method | Path                     | Description              |
| ------ | ------------------------ | ------------------------ |
| `POST` | `/api/brain/start`       | Start brain orchestrator |
| `POST` | `/api/brain/stop`        | Stop brain orchestrator  |
| `POST` | `/api/brain/phase`       | Trigger specific phase   |
| `GET`  | `/api/brain/stats`       | Knowledge stats          |
| `GET`  | `/api/brain/recent`      | Recent knowledge items   |
| `GET`  | `/api/brain/patterns`    | Discovered patterns      |
| `GET`  | `/api/brain/predictions` | Active predictions       |
| `POST` | `/api/brain/search`      | Search knowledge base    |
| `POST` | `/api/brain/ingest`      | Trigger ingestion        |

#### Treasury

| Method | Path            | Description                                      |
| ------ | --------------- | ------------------------------------------------ |
| `GET`  | `/api/treasury` | Treasury status (SOL, USDC, allocations, runway) |

#### Autonomy Control

| Method | Path                        | Description                  |
| ------ | --------------------------- | ---------------------------- |
| `GET`  | `/api/autonomy/status`      | Autonomy level, queue, audit |
| `GET`  | `/api/autonomy/queue`       | Pending approval queue       |
| `POST` | `/api/autonomy/approve/:id` | Approve pending request      |
| `POST` | `/api/autonomy/reject/:id`  | Reject pending request       |
| `GET`  | `/api/autonomy/boundaries`  | Current safety boundaries    |

#### Prediction Markets

| Method | Path                         | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| `GET`  | `/api/predictions/status`    | Aggregated Polymarket + Kalshi data |
| `GET`  | `/api/v1/predictions/status` | Same (dashboard compat alias)       |

Fetches live data from:

- **Polymarket**: `https://gamma-api.polymarket.com/markets?closed=false&limit=100`
- **Kalshi**: `https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=200`

Categories: politics, crypto, macro, other. Includes trending by activity score.

#### Pipeline Execution

| Method | Path                        | Description                   |
| ------ | --------------------------- | ----------------------------- |
| `POST` | `/api/pipelines/execute`    | Execute a multi-step pipeline |
| `GET`  | `/api/pipelines/:id/status` | Pipeline execution status     |
| `GET`  | `/api/pipelines/executions` | List all executions           |
| `POST` | `/api/pipelines/:id/cancel` | Cancel running pipeline       |

Pipelines support:

- Step dependencies (`dependsOn`)
- Async execution with progress tracking
- EventBus integration (`pipeline.started`, `pipeline.step_completed`, etc.)
- In-memory execution store (TODO: Redis/DB)

#### Analytics

| Method | Path                          | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| `GET`  | `/api/analytics/summary`      | Summary (period: day/week/month) |
| `GET`  | `/api/analytics/executions`   | Recent execution analytics       |
| `GET`  | `/api/analytics/daily`        | Daily statistics                 |
| `GET`  | `/api/analytics/tokens`       | Token usage breakdown            |
| `GET`  | `/api/analytics/costs`        | Cost breakdown                   |
| `GET`  | `/api/analytics/success-rate` | Success rate metrics             |

#### Events

| Method | Path                     | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| `GET`  | `/api/events`            | Recent events (raw)                 |
| `GET`  | `/api/events/enriched`   | Events with titles, icons, severity |
| `GET`  | `/api/events/categories` | Available event categories          |

#### Discovery & Content

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| `GET`  | `/api/backlog`          | Product backlog                      |
| `POST` | `/api/discovery/run`    | Run product discovery                |
| `POST` | `/api/content/generate` | Generate content (blog/tweet/thread) |

#### Webhooks

| Method   | Path                     | Description       |
| -------- | ------------------------ | ----------------- |
| `GET`    | `/api/webhooks`          | List all webhooks |
| `GET`    | `/api/webhooks/:id`      | Get webhook by ID |
| `POST`   | `/api/webhooks`          | Create webhook    |
| `PATCH`  | `/api/webhooks/:id`      | Update webhook    |
| `DELETE` | `/api/webhooks/:id`      | Delete webhook    |
| `POST`   | `/api/webhooks/:id/test` | Send test payload |

#### Queue

| Method | Path                  | Description      |
| ------ | --------------------- | ---------------- |
| `GET`  | `/api/queue/stats`    | Queue statistics |
| `POST` | `/api/queue/jobs`     | Add job to queue |
| `GET`  | `/api/queue/jobs/:id` | Get job status   |
| `POST` | `/api/queue/pause`    | Pause queue      |
| `POST` | `/api/queue/resume`   | Resume queue     |

---

## Authentication & Security

### Bearer Token Auth

Every request (except `/health`) requires:

```
Authorization: Bearer fleet-awcn-2026
```

Implemented as Fastify `onRequest` hook — rejects with 401 if missing/invalid.

### IP Allowlist

Only Tailscale mesh IPs + localhost accepted:

```
100.112.71.27   — sisu (PC)
100.107.81.60   — Mac (self)
100.70.6.100    — Berni (EC2)
100.70.170.54   — Saga (Android)
100.117.160.64  — S22 Ultra (Android)
100.74.250.80   — S25 Ultra (Android)
127.0.0.1       — localhost
```

Rejects with 403 if IP not in list.

### WebSocket Auth

Token passed as query parameter:

```
ws://host:3100/ws?token=fleet-awcn-2026
```

### CORS

Restricted to Tailscale-origin HTTP requests. Blocks external browser requests.

### MCP Server Isolation

Each MCP server runs as a separate child process with:

- Inherited `process.env` + server-specific env vars
- No direct network access from servers to Fleet API
- Separate stdin/stdout for JSON-RPC (no shared state)
- Kill on idle timeout (SIGTERM)

---

## State Files & Data Directories

**Location on Mac**: `~/.openclaw/awcn-repo/`

| File/Directory              | Contents                                  |
| --------------------------- | ----------------------------------------- |
| `state/health.json`         | Node health status (read by FleetManager) |
| `state/budgets.json`        | Daily budget tracking                     |
| `state/tasks.json`          | Active task list                          |
| `data/agents/`              | Per-agent state and history               |
| `config/fleet-devices.json` | Device registry                           |
| `mcp-servers.json`          | MCP server configs (gitignored)           |
| `mcp-servers.example.json`  | Example MCP configs (committed)           |

---

## Dependencies

### Runtime

| Package              | Version | Purpose                    |
| -------------------- | ------- | -------------------------- |
| `fastify`            | ^4.28.0 | HTTP server framework      |
| `@fastify/cors`      | ^9.0.0  | CORS middleware            |
| `@fastify/websocket` | ^10.0.0 | WebSocket support          |
| `zod`                | ^3.23.0 | Schema validation          |
| `eventemitter3`      | ^5.0.0  | Event system (Fleet + MCP) |
| `bullmq`             | ^5.0.0  | Background job queue       |
| `commander`          | ^12.0.0 | CLI framework              |
| `cron`               | ^3.1.0  | Cron scheduling            |
| `uuid`               | ^13.0.0 | ID generation              |
| `yaml`               | ^2.4.0  | YAML parsing               |
| `fastify-plugin`     | ^4.5.0  | Plugin helper              |

### Workspace Dependencies

| Package                | Purpose                  |
| ---------------------- | ------------------------ |
| `@gicm/agent-core`     | Agent core utilities     |
| `@gicm/autonomy`       | Autonomy engine          |
| `@gicm/growth-engine`  | Growth/marketing engine  |
| `@gicm/money-engine`   | Treasury/trading engine  |
| `@gicm/product-engine` | Product discovery engine |
| `@gicm/opus67`         | OPUS 67 skill system     |
| `@gicm/orchestrator`   | Brain orchestrator       |

### Dev Dependencies

| Package               | Version | Purpose       |
| --------------------- | ------- | ------------- |
| `typescript`          | ^5.4.0  | Type checking |
| `tsup`                | ^8.0.0  | Build tool    |
| `vitest`              | ^2.1.0  | Test runner   |
| `@vitest/coverage-v8` | ^2.1.0  | Coverage      |
| `@vitest/ui`          | ^2.1.0  | Test UI       |

---

## Current Limitations

### Fleet API

1. **Stale agent IDs** — FleetManager hardcodes `['andy', 'scout', 'voice', 'ops', 'trader']` but current agents are `['andy', 'saga', 'jim', 'berni', 'leet']`. Needs update.
2. **No persistence** — Runs via `nohup` with `disown`. Not a systemd service or PM2 process. Stops on terminal close or Mac restart.
3. **No tests** — Zero test files for fleet-manager, fleet-routes, or fleet-types.
4. **No dist build** — Runs via `npx tsx` (TypeScript JIT). Never been compiled with `tsup`.
5. **npm vs pnpm mismatch** — Package has npm lockfile but monorepo uses pnpm.
6. **Single-threaded health loop** — 30s poll interval means up to 30s stale data.
7. **SSH key hardcoded** — EC2 key path in fleet-devices.json is relative, may break if repo moves.
8. **No retry on SSH** — Single attempt per reconnect; doesn't retry on timeout.
9. **AWCN state files may not exist** — FleetManager reads health.json/budgets.json/tasks.json but doesn't create defaults if missing.

### MCP Gateway

10. **Config not hot-reloaded** — `mcp-servers.json` is read once at startup. Adding a server requires restart.
11. **No auth per server** — All MCP servers share the same Gateway auth. No per-server access control.
12. **Idle timeout kills mid-request** — If a tool call takes longer than idleTimeout, the server might be killed during execution.
13. **No request queue** — Concurrent calls to the same server could overwhelm it.
14. **No metrics persistence** — `totalCalls` counter resets on restart.
15. **No health endpoint for MCP servers** — Can only check via `/api/mcp/status`, no per-server health.

### Integration Hub

16. **Pipeline execution is simulated** — `simulateStepExecution()` uses random delays + 10% failure rate. Not wired to real PTC Coordinator.
17. **In-memory stores** — Pipeline executions, webhook deliveries stored in memory (lost on restart).
18. **Many TODO stubs** — Brain knowledge, hunter discoveries, growth analytics return placeholder data.
19. **Heavy import chain** — `routes.ts` imports 11+ route modules, each with their own deps. Cold start could be slow.
20. **api-server.test.ts fails** — Missing `@gicm/agent-core/security/auth` module.

---

## Expansion Opportunities

### New MCP Servers to Add

| Server                  | npm Package                                        | API Key Needed       | Use Case                |
| ----------------------- | -------------------------------------------------- | -------------------- | ----------------------- |
| **Brave Search**        | `@modelcontextprotocol/server-brave-search`        | Yes (BRAVE_API_KEY)  | Web search for agents   |
| **Tavily**              | `tavily-mcp-server`                                | Yes (TAVILY_API_KEY) | AI-optimized search     |
| **Firecrawl**           | `firecrawl-mcp-server`                             | Yes                  | Web scraping/crawling   |
| **Fetch**               | `@modelcontextprotocol/server-fetch`               | No                   | HTTP fetch for agents   |
| **Sequential Thinking** | `@modelcontextprotocol/server-sequential-thinking` | No                   | Structured reasoning    |
| **Slack**               | `@modelcontextprotocol/server-slack`               | Yes (SLACK_TOKEN)    | Team notifications      |
| **Neo4j**               | `@neo4j/mcp-neo4j-cypher`                          | Yes                  | Knowledge graph queries |
| **Supabase**            | `supabase-mcp-server`                              | Yes                  | Direct DB access        |
| **Playwright**          | `@playwright/mcp`                                  | No                   | Browser automation      |
| **Time**                | `mcp-server-time`                                  | No                   | Timezone operations     |

### Skills to Expose via SKILL.md

Create `~/.openclaw/skills/` entries for:

1. **fleet-status** — Agent reads fleet status without full API
2. **mcp-search** — Agent searches web via Brave/Tavily MCP
3. **mcp-github** — Agent manages GitHub repos/issues/PRs
4. **mcp-memory** — Agent stores/retrieves persistent memories
5. **mcp-fetch** — Agent fetches web pages
6. **mcp-neo4j** — Agent queries knowledge graph

### Feature Ideas

1. **Dashboard WebSocket** — Stream all fleet + MCP events to a React dashboard in real-time
2. **MCP Config Hot-Reload** — Watch `mcp-servers.json` for changes, add/remove servers without restart
3. **Per-Server Auth** — Different API keys for different MCP servers (e.g., admin-only servers)
4. **Agent-to-MCP Mapping** — Define which agents can access which MCP servers
5. **Request Queue per Server** — Rate limit concurrent calls to a single MCP server
6. **Metrics Dashboard** — Expose Prometheus-compatible `/metrics` for Grafana
7. **Fleet Auto-Heal** — Auto-reconnect nodes that go offline (currently manual via `/api/fleet/sync`)
8. **Agent Task Tracking** — Wire task creation/completion to fleet status (currently placeholder)
9. **PM2/systemd Persistence** — Make Fleet API survive Mac restarts
10. **Build Pipeline** — Add `tsup` build step, publish as npm package with dist/
11. **Fix Agent IDs** — Update FleetManager's KNOWN_AGENTS to match current fleet
12. **Bridge Integration** — Let Fleet API forward complex tasks to Claude Bridge on PC
13. **Multi-Gateway** — Support multiple OpenClaw gateways (not just Mac)
14. **Ollama Integration** — Route LLM calls through Berni's Ollama for free local inference
15. **Cost Tracking** — Track per-agent, per-MCP-server costs across the fleet

---

_Last updated: 2026-02-16 — @gicm/integration-hub v0.1.1 with Fleet API + MCP Gateway_
