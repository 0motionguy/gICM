# Andy Setup Optimization Guide

> Generated: Feb 15, 2026 | Based on: Security audit + Skills analysis + State gap analysis

This guide compares your current OpenClaw setup with best practices from the official docs and the antigravity-awesome-skills ecosystem (856+ skills). Follow the sections in order — security first.

---

## Current State Summary

**What's Working:**

- Gateway running on :18789 with Telegram channel (@Andymainchatbot)
- 4 agents configured: scout (default), voice, trader, ops
- 4 nodes connected: Berni (EC2), PC-Docker, Saga, S22-Ultra
- Claude Bridge MCP on PC:3100 (PM2, 12h+ uptime)
- Model: anthropic/claude-sonnet-4-5 via OpenRouter

**What's NOT Working:**

- 0 MCP servers configured in openclaw.json
- 16/51 installed skills have missing dependencies
- AWCN state files are empty shells (zero tasks, zero budgets consumed)
- No model fallback chain (if primary fails, everything stops)
- Only 5/36 available plugins are loaded
- Security has 10 identified issues (3 high severity)

---

## 1. CRITICAL: Security Hardening (Do First)

### 1.1 Fix Secrets Directory Permissions

**Issue:** `~/.openclaw/secrets/` has 755 permissions (world-readable). Should be 700.

```bash
chmod 700 ~/.openclaw/secrets/
chmod 600 ~/.openclaw/secrets/*
```

**Verify:**

```bash
stat -f "%Lp %N" ~/.openclaw/secrets/
# Expected: 700 /Users/andy/.openclaw/secrets/
```

### 1.2 Remove Hardcoded API Keys from openclaw.json

**Issue:** Web search API key and skill API keys are stored in plaintext in `openclaw.json`. These should be in `auth-profiles.json` or environment variables.

**Current (BAD):**

```json
"tools": {
  "webSearch": { "apiKey": "sk-..." }
}
```

**Fixed (GOOD):**
Move keys to env vars or auth-profiles:

```bash
# Add to ~/.zshrc or ~/.bashrc
export OPENCLAW_WEB_SEARCH_KEY="sk-..."
export OPENCLAW_GOPLACES_KEY="..."
export OPENCLAW_WHISPER_KEY="..."
```

Then reference in openclaw.json:

```json
"tools": {
  "webSearch": { "apiKey": "${OPENCLAW_WEB_SEARCH_KEY}" }
}
```

### 1.3 Add Gateway Rate Limiting

**Issue:** No rate limiting configured. Any client with the gateway token can send unlimited requests.

Add to `gateway` section in `openclaw.json`:

```json
"gateway": {
  "port": 18789,
  "bind": "lan",
  "rateLimit": {
    "windowMs": 60000,
    "maxRequests": 30,
    "message": "Too many requests"
  }
}
```

### 1.4 Fix denyCommands (Current List is Bypassable)

**Issue:** Current `denyCommands` blocks literal commands like `rm -rf`, but agents can bypass with `bash -c "rm -rf /"` or backtick evaluation.

**Better approach — use allowCommands instead (whitelist):**

```json
"tools": {
  "bash": {
    "allowCommands": [
      "ls", "cat", "head", "tail", "grep", "find", "wc",
      "curl", "wget", "git", "npm", "node", "python3",
      "openclaw", "echo", "date", "pwd", "which", "env"
    ]
  }
}
```

If you need the blacklist approach, also block shell wrappers:

```json
"denyCommands": [
  "rm -rf /", "rm -rf ~", "rm -rf /*",
  "bash -c", "sh -c", "eval",
  "sudo", "su", "passwd", "chown", "chmod 777",
  "kill -9", "pkill", "killall",
  "nc", "ncat", "netcat",
  "curl.*|.*sh", "wget.*|.*sh"
]
```

### 1.5 Enable Sandbox Mode

**Issue:** No sandbox configured. Agents have unrestricted file system and network access.

Add to `openclaw.json`:

```json
"sandbox": {
  "enabled": true,
  "allowedPaths": [
    "/Users/andy/.openclaw/workspace",
    "/Users/andy/.openclaw/workspace-*",
    "/Users/andy/.openclaw/skills",
    "/Users/andy/.openclaw/awcn",
    "/tmp"
  ],
  "networkPolicy": "allow",
  "maxFileSize": "10MB"
}
```

### 1.6 Restrict Elevated Tool Defaults

**Issue:** Several powerful tools (bash, read, write) are enabled by default for all agents. Not all agents need all tools.

Per-agent tool restrictions (add to each agent in `agents.list`):

```json
{
  "id": "scout",
  "tools": {
    "allow": ["read", "web_search", "memory"],
    "deny": ["bash", "write", "system"]
  }
},
{
  "id": "trader",
  "tools": {
    "allow": ["read", "web_search", "memory", "bash"],
    "deny": ["write", "system"]
  }
}
```

Only `ops` should have full `bash` + `system` access.

---

## 2. Model Fallback Chain

**Issue:** Single model configured. If anthropic/claude-sonnet-4-5 goes down or hits rate limits, all agents stop.

### Configure Fallback Models

Edit `openclaw.json` — add fallback chain:

```json
"models": {
  "default": "openrouter/anthropic/claude-sonnet-4-5",
  "fallback": [
    "openrouter/anthropic/claude-3.5-haiku",
    "ollama/minimax-m2.5:cloud"
  ],
  "providers": {
    "openrouter": {
      "baseUrl": "https://openrouter.ai/api/v1",
      "api": "openai-completions"
    },
    "ollama": {
      "baseUrl": "http://100.70.6.100:11434",
      "api": "openai-completions"
    }
  }
}
```

**Fallback priority:**

1. `anthropic/claude-sonnet-4-5` (primary — best quality)
2. `anthropic/claude-3.5-haiku` (fast, cheap, good for simple tasks)
3. `ollama/minimax-m2.5:cloud` on Berni (free, local, always available)

### Per-Agent Model Assignment

Not all agents need Sonnet 4.5. Save money with tiered models:

| Agent  | Model             | Reason                           |
| ------ | ----------------- | -------------------------------- |
| scout  | claude-sonnet-4-5 | User-facing, needs quality       |
| voice  | claude-3.5-haiku  | Simple responses, speed matters  |
| ops    | claude-3.5-haiku  | System checks, not creative work |
| trader | claude-sonnet-4-5 | Critical financial decisions     |

---

## 3. External Tool Integration (via SKILL.md REST API)

**Important:** OpenClaw does **NOT** support `mcpServers` as a config key in `openclaw.json`. Adding it causes config validation failure and puts the gateway in "best-effort" mode (which can break workspace assignment and agent routing).

**The correct approach:** Create a SKILL.md file in `~/.openclaw/skills/<tool-name>/` that teaches agents how to call external services via `curl` (REST API). This is how Claude Bridge already works.

### 3.1 Claude Bridge (DONE — Already Wired)

The bridge runs on PC (sisu) at `http://100.112.71.27:3100` and is integrated via:

**Skill file:** `~/.openclaw/skills/claude-bridge/SKILL.md`

The skill teaches agents to use 4 tools via REST API:

| Tool                | Endpoint                            | Use For                    |
| ------------------- | ----------------------------------- | -------------------------- |
| `claude_execute`    | `POST /api/tools/claude_execute`    | Build, code, fix, refactor |
| `claude_query`      | `POST /api/tools/claude_query`      | Read-only analysis         |
| `claude_read_file`  | `POST /api/tools/claude_read_file`  | Read a specific file       |
| `claude_git_status` | `POST /api/tools/claude_git_status` | Check repo status          |

**Auth:** Bearer token `bridge-opus-2026`
**Cost:** ~$0.04/call (cached), ~$0.23 first call
**Status:** Working and verified.

### 3.2 Adding New Tool Integrations

To add any new external tool (GitHub, web fetch, filesystem, etc.), create a SKILL.md:

```bash
mkdir -p ~/.openclaw/skills/<tool-name>
```

Then create `~/.openclaw/skills/<tool-name>/SKILL.md` with:

```markdown
---
name: <tool-name>
description: <what it does>
user-invocable: true
metadata: { "openclaw": { "emoji": "<icon>" } }
---

# <Tool Name>

<Instructions for the agent on when and how to use the tool>

## Usage

\`\`\`bash
curl -s -X POST http://<host>:<port>/api/<endpoint> \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <token>" \
 -d '{"param": "value"}'
\`\`\`
```

Then restart the gateway to pick up the new skill:

```bash
openclaw gateway stop && sleep 2 && openclaw gateway
```

### 3.3 Planned Integrations

| Tool                 | Status                      | Priority |
| -------------------- | --------------------------- | -------- |
| Claude Bridge (PC)   | DONE                        | -        |
| Fleet API (Mac:3100) | Code complete, pending test | High     |
| GitHub API           | Not started                 | Medium   |
| Web Fetch            | Not started                 | Low      |

---

## 4. Skill Optimization

### 4.1 Skills with Missing Dependencies (16 broken)

These skills are installed but can't load because their dependencies are missing. Either install the deps or remove the broken skills:

**Option A — Remove broken skills:**

```bash
cd ~/.openclaw/skills/
# List skills with missing deps
for dir in */; do
  if [ -f "$dir/SKILL.md" ]; then
    # Check if skill has required env vars
    grep -l "requires" "$dir/SKILL.md" 2>/dev/null
  fi
done
```

**Option B — Install missing deps:**
Check each skill's `requires.env` in its SKILL.md and set the missing env vars.

### 4.2 Skills to Remove (Low Value / Broken)

Review and archive skills that haven't been used in 30+ days:

```bash
mkdir -p ~/.openclaw/skills-archive/
# Move unused skills
mv ~/.openclaw/skills/<skill-name> ~/.openclaw/skills-archive/
```

### 4.3 Skills to Add from antigravity-awesome-skills

**Source:** github.com/sickn33/antigravity-awesome-skills (856+ skills)

**High-priority for your fleet:**

| Skill                      | Why                                                                     | Install        |
| -------------------------- | ----------------------------------------------------------------------- | -------------- |
| `parallel-agents`          | Multi-agent task orchestration — lets main coordinate fleet efficiently | Copy from repo |
| `multi-agent-patterns`     | Coordination patterns (consensus, voting, delegation)                   | Copy from repo |
| `error-detective`          | Systematic debugging — helps ops agent diagnose issues faster           | Copy from repo |
| `event-sourcing-architect` | State management patterns — useful for AWCN event tracking              | Copy from repo |
| `inngest`                  | Background job scheduling — for scheduled fleet health checks           | Copy from repo |
| `trigger-dev`              | Event-driven task automation                                            | Copy from repo |
| `crewai`                   | AI crew orchestration patterns                                          | Copy from repo |

**Install process:**

```bash
# Clone the repo
git clone https://github.com/sickn33/antigravity-awesome-skills /tmp/awesome-skills

# Copy individual skills
cp -r /tmp/awesome-skills/parallel-agents ~/.openclaw/skills/
cp -r /tmp/awesome-skills/multi-agent-patterns ~/.openclaw/skills/
cp -r /tmp/awesome-skills/error-detective ~/.openclaw/skills/

# Restart gateway to pick up new skills
openclaw gateway stop && sleep 2 && openclaw gateway
```

### 4.4 Missing Skill Categories

Your fleet has gaps in these areas:

- **Trading/Financial skills** — No Polymarket, DeFi, or portfolio management skills
- **Telegram-specific skills** — No formatting, inline keyboards, or bot management
- **Fleet management skills** — No node health, auto-reconnect, or deployment skills

---

## 5. AWCN State Activation

**Issue:** AWCN state files exist at `~/.openclaw/awcn/state/` but are mostly empty. The system tracks nothing.

### 5.1 Initialize health.json

```bash
cat > ~/.openclaw/awcn/state/health.json << 'EOF'
{
  "lastCheck": null,
  "gateway": { "status": "ok", "uptime": 0 },
  "nodes": {
    "Berni": { "status": "connected", "ip": "100.70.6.100", "platform": "linux" },
    "Saga": { "status": "connected", "ip": "100.70.170.54", "platform": "android" },
    "S22-Ultra": { "status": "connected", "ip": "100.117.160.64", "platform": "android" },
    "PC-Docker": { "status": "connected", "ip": "100.112.71.27", "platform": "windows" }
  },
  "agents": {
    "scout": { "status": "ok", "model": "anthropic/claude-sonnet-4-5" },
    "voice": { "status": "pending", "model": "anthropic/claude-sonnet-4-5" },
    "trader": { "status": "pending", "model": "anthropic/claude-sonnet-4-5" },
    "ops": { "status": "pending", "model": "anthropic/claude-sonnet-4-5" }
  }
}
EOF
```

### 5.2 Initialize budgets.json

```bash
cat > ~/.openclaw/awcn/state/budgets.json << 'EOF'
{
  "daily": {
    "limit": 5.00,
    "used": 0.00,
    "resetAt": "00:00"
  },
  "perAgent": {
    "scout": { "limit": 2.00, "used": 0.00 },
    "voice": { "limit": 1.00, "used": 0.00 },
    "trader": { "limit": 1.50, "used": 0.00 },
    "ops": { "limit": 0.50, "used": 0.00 }
  },
  "thresholds": {
    "soft": 0.80,
    "throttle": 0.95,
    "hard": 1.00
  }
}
EOF
```

### 5.3 Initialize tasks.json

```bash
cat > ~/.openclaw/awcn/state/tasks.json << 'EOF'
{
  "queue": [],
  "active": [],
  "completed": [],
  "stats": {
    "totalCompleted": 0,
    "totalFailed": 0,
    "avgDuration": 0
  }
}
EOF
```

---

## 6. Plugin Activation

**Issue:** Only 5/36 available plugins are loaded. Key plugins are disabled.

### Priority Plugins to Enable

Check which plugins are available:

```bash
openclaw plugins list
```

Enable these if available:

```bash
openclaw plugins enable memory-core     # File-based memory (CRITICAL)
openclaw plugins enable cost-tracker    # Token cost tracking
openclaw plugins enable session-logger  # Session history
openclaw plugins enable health-monitor  # Agent health checks
openclaw plugins enable web-search      # Web search capability
```

**Important:** The `memory` plugin slot is EXCLUSIVE — only one memory plugin at a time. Use `memory-core` (OpenClaw's built-in).

---

## 7. Quick Wins Checklist

10-minute fixes with outsized impact:

- [ ] `chmod 700 ~/.openclaw/secrets/` — Fix permissions (30 seconds)
- [ ] Add `"rateLimit"` to gateway config (2 minutes)
- [ ] Move API keys from openclaw.json to env vars (5 minutes)
- [ ] Add Claude Bridge MCP to `mcpServers` (2 minutes)
- [ ] Add `"fallback"` model array to config (2 minutes)
- [ ] Run `openclaw plugins enable memory-core` (30 seconds)
- [ ] Initialize `health.json` with real node data (1 minute)
- [ ] Initialize `budgets.json` with daily limits (1 minute)
- [ ] Archive 16 broken skills to `skills-archive/` (3 minutes)
- [ ] Restart gateway to pick up all changes (30 seconds)

---

## 8. MEMORY.md vs Reality Check

Your MEMORY.md (or SOUL.md docs) claim:

- **83 MCPs** — Reality: **0 configured** in openclaw.json
- **141 skills** — Reality: **51 installed**, only **35 functional** (16 have missing deps)
- **Active AWCN** — Reality: **State files are empty shells**

This is because OPUS 67 metadata was written for the gICM monorepo's development environment, not for the production OpenClaw gateway. The numbers reflect the PC-side OPUS 67 install, not Andy's Mac fleet.

**Fix:** Update MEMORY.md to reflect actual state:

```markdown
## Current Fleet Reality

- MCPs: 0 (pending: claude-bridge, github, fetch, filesystem)
- Skills: 35 functional / 51 installed / 16 broken
- Nodes: 4 connected (Berni, PC-Docker, Saga, S22-Ultra)
- Agents: 4 (scout, voice, trader, ops)
- AWCN: Initialized but no live task tracking yet
```

---

## 9. Recommended Architecture Improvements

### 9.1 Gateway as LaunchAgent (Auto-Start on Mac Boot)

If not already set up:

```bash
openclaw doctor --fix --non-interactive --yes
```

This installs the gateway as a macOS LaunchAgent so it starts automatically after reboots.

### 9.2 Compaction Mode

Current setting: `"safeguard"` — only compacts when hitting context limits. This is correct. Don't change it.

### 9.3 Telegram Bot Hygiene

- Only ONE process should poll `getUpdates` for a given bot token
- If you see 409 Conflict errors, another process is competing for updates
- Fix: `openclaw gateway stop` → kill any stale processes → `openclaw gateway`
- Never reuse bot tokens across devices (each device needs its own bot)

### 9.4 Node Sleep Protection

Android nodes (Saga, S22-Ultra) will disconnect when the phone sleeps.

**Mitigations:**

- Install Termux:Boot + auto-start scripts (already done for S22-Ultra)
- Use `termux-wake-lock` to prevent Termux from being killed
- Keep a while-loop retry in the boot script (already done)

```bash
# Add to boot script:
termux-wake-lock
```

---

## 10. Next Steps (Priority Order)

1. **Today:** Apply Quick Wins Checklist (section 7)
2. **Today:** Wire Claude Bridge MCP in openclaw.json (section 3.1)
3. **This week:** Install 3-4 skills from antigravity-awesome-skills (section 4.3)
4. **This week:** Configure model fallback chain (section 2)
5. **Next week:** Set up remaining MCP servers (GitHub, filesystem, fetch)
6. **Next week:** Build Fleet API for `/fleet` dashboard
7. **Ongoing:** Monitor token costs and adjust per-agent budgets

---

_This guide was generated by Claude Code (Opus 4.6) based on a comprehensive audit of Andy's OpenClaw configuration, installed skills, AWCN state, and comparison with the antigravity-awesome-skills ecosystem._
