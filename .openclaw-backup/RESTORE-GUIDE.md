# OpenClaw Restore Guide — Feb 15 2026

## What Was Lost in Uninstall

- Gateway service + LaunchAgent
- Server state (sessions, cron jobs)
- Config was reset to bare minimum (no providers, no agents, no telegram)
- Workspace was emptied (MEMORY.md, SOUL.md, all agent workspaces gone)
- Skills directory wiped
- Auth profiles wiped

## What's Preserved (this backup)

- `device.json` — device identity (keypair)
- `openclaw-FULL-BACKUP.json` — reconstructed full config from memory
- `RESTORE-GUIDE.md` — this file
- PC MEMORY.md at `C:\Users\mirko\.claude\projects\c--Users-mirko-OneDrive-Desktop-gICM\memory\MEMORY.md`

## Restore Steps After Reinstall

### 1. Install OpenClaw

```bash
npm install -g openclaw
```

### 2. Run initial setup

```bash
openclaw
# Complete the wizard
```

### 3. Restore config

Copy `openclaw-FULL-BACKUP.json` to `~/.openclaw/openclaw.json` (remove `_backup_notes` key first).
Fill in the Telegram bot token from BotFather for @Andymainchatbot.

```bash
# From PC via SSH:
scp .openclaw-backup/openclaw-FULL-BACKUP.json andy@100.107.81.60:~/.openclaw/openclaw.json
# Then SSH in and remove _backup_notes key
```

### 4. Set gateway mode

```bash
openclaw config set gateway.mode local
```

### 5. Start gateway

```bash
openclaw gateway
```

### 6. Reconnect nodes

```bash
# On Berni:
OPENCLAW_GATEWAY_TOKEN=main-token-2026 openclaw node run --host 100.107.81.60 --port 18789 --display-name Berni

# On Saga:
OPENCLAW_GATEWAY_TOKEN=main-token-2026 openclaw node run --host 100.107.81.60 --port 18789 --display-name Saga

# On S22:
PATH=$HOME/.npm-global/bin:$PATH OPENCLAW_GATEWAY_TOKEN=main-token-2026 openclaw node run --host 100.107.81.60 --port 18789 --display-name S22-Ultra
```

## Key Credentials

- **OpenRouter API key**: `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`
- **Gateway auth token**: `1756f3f14e5b11aff816055f7799bc360782e8bc0f448aa8`
- **Node connection token**: `main-token-2026`
- **Telegram bot**: @Andymainchatbot (token from BotFather)
- **Telegram user ID**: 1447270711
- **SSH to Mac**: `ssh andy@100.107.81.60` (key auth or password: Kermit123!)

## Agent Fleet (8 agents)

| Agent        | Role                             | Model                                  |
| ------------ | -------------------------------- | -------------------------------------- |
| main         | Control plane                    | openrouter/anthropic/claude-sonnet-4.5 |
| coder        | Code/builds                      | ollama/minimax-m2.5:cloud              |
| builder      | Technical construction           | ollama/minimax-m2.5:cloud              |
| researcher   | Research/analysis                | ollama/minimax-m2.5:cloud              |
| intelligence | Market intel (spawns researcher) | ollama/minimax-m2.5:cloud              |
| trading      | Market decisions                 | ollama/minimax-m2.5:cloud              |
| growth       | Marketing/content                | ollama/minimax-m2.5:cloud              |
| ops          | System health (spawns builder)   | ollama/minimax-m2.5:cloud              |
