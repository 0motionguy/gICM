---
name: rtk-token-compression
description: "RTK (Rust Token Killer) — 60-90% bash output compression for Claude Code."
version: 1.0.0
triggers:
  keywords:
    - rtk
    - token compression
    - reduce tokens
    - save tokens
    - token efficient
---

# RTK — 60-90% Bash Token Savings

RTK (24K GitHub stars) intercepts bash commands and compresses their output before Claude sees it. Zero config after install.

## Install

```bash
# Requires Rust (one-time)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install RTK
cargo install --git https://github.com/rtk-ai/rtk

# Auto-patch Claude Code (installs hook + patches settings)
rtk init -g --auto-patch

# Verify
rtk gain  # Shows savings dashboard
```

## What It Compresses

| Command                  | Before        | After             | Savings |
| ------------------------ | ------------- | ----------------- | ------- |
| `git status` (50 files)  | ~2,000 tokens | ~200 tokens       | 90%     |
| `npm test` (all pass)    | ~5,000 tokens | ~10 tokens ("ok") | 99%     |
| `cargo build` (warnings) | ~3,000 tokens | ~300 tokens       | 90%     |
| `ls -la` (100 files)     | ~1,500 tokens | ~200 tokens       | 87%     |

## How It Works

1. RTK installs a `PreToolUse` hook in Claude Code
2. When Claude runs `git status`, the hook intercepts it
3. Runs `rtk git status` instead (compressed output)
4. Claude sees clean, filtered output — no ANSI codes, no noise
5. If all tests pass: returns "ok" (not 5,000 lines of green checkmarks)

## Key Features

- **Smart truncation**: Keeps function signatures, imports, exports even when truncating
- **Match-output short-circuit**: "All tests pass" → returns "ok" (5 tokens, not 5,000)
- **TOML declarative filters**: 59 built-in filters, add your own per-project
- **Tracking**: `rtk gain` shows daily/weekly/monthly token savings

## Works With OPUS 67

RTK is transparent — it hooks into Claude Code's bash tool. OPUS 67 skills, MCP tools, and commands all benefit automatically. No OPUS 67 config needed.
