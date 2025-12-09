# OPUS 67 Status

Show the current OPUS 67 system status including loaded skills, active hooks, and session info.

Read the following files and display a formatted status report:

1. `.claude/.opus67-cache/session-context.json` - Current session context
2. `.claude/logs/opus67-autodetect.log` - Recent auto-detection logs (last 3 entries)
3. `.claude/settings.local.json` - Active hooks and MCPs

Format the output as:

```
╔═══════════════════════════════════════════════════════════════╗
║  OPUS 67 v6.0.0 │ ● ONLINE │ Skills: 141 │ MCPs: 82          ║
╚═══════════════════════════════════════════════════════════════╝

Project Types: [from session-context.json]
Pre-loaded Skills: [from session-context.json]

Active Hooks:
  - SessionStart: session-start.js, opus67-auto-detect.js
  - PreToolUse: pre-bash.js, opus67-pre-read.js, opus67-pre-mcp.js, opus67-pre-agent.js
  - PostToolUse: post-write.js, post-bash.js

Recent Activity:
  [Last 3 log entries from opus67-autodetect.log]

Session ID: [from session-context.json]
```
