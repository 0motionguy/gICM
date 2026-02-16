# What is SOUL.md? — Quick Explanation

## For You (the user)

**SOUL.md is the agent's personality file.** It tells the AI who it is, how to behave, and what it can do. Think of it like programming a character — but instead of code, it's plain text instructions.

### What it controls:

- **Identity** — The agent knows it's called "Andy" and belongs to you
- **Style** — Direct, no fluff, matches your language
- **Rules** — Never touches money without asking, never shares secrets
- **Delegation** — Knows it has 7 specialist agents it can hand tasks to
- **Decision making** — Quick questions = answer directly, complex tasks = delegate

### Where it lives:

```
~/.openclaw/workspace/SOUL.md
```

### How it works:

1. When the gateway starts, it reads SOUL.md **once** and injects it into every conversation
2. The agent follows these instructions for ALL interactions (Telegram, TUI, API)
3. You can edit it anytime — restart the gateway to apply changes
4. It does NOT get modified at runtime — it's read-only during operation

### Key things to know:

- **Don't bloat it.** Every token in SOUL.md costs money on every message. Keep it tight.
- **Don't put secrets in it.** It gets sent to the LLM provider (OpenRouter/Anthropic).
- **Memory is separate.** SOUL.md = personality. MEMORY.md = facts the agent remembers.
- **Editing requires restart.** Changes only take effect after `openclaw gateway stop && openclaw gateway`

### After installing, copy it:

```bash
cp /path/to/SOUL.md ~/.openclaw/workspace/SOUL.md
```

Or I (Claude Code) can push it via SSH once OpenClaw is reinstalled.
