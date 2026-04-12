#!/usr/bin/env node
/**
 * OPUS 67 Context Budget Monitor (inspired by GSD)
 *
 * Runs PostToolUse to estimate context window usage and warn
 * when degradation is likely. 4 levels:
 *   PEAK (0-65% used)    — full operations
 *   GOOD (65-75% used)   — prefer delegation
 *   DEGRADING (75-85%)   — checkpoint recommended
 *   POOR (85%+ used)     — emergency: delegate everything
 *
 * Hook output goes to stdout → Claude sees it as additionalContext.
 */
const fs = require("fs");
const path = require("path");

// Rate limit: only check every 60 seconds
const CACHE_DIR = path.join(
  process.env.CLAUDE_PROJECT_DIR || process.cwd(),
  ".claude",
  ".opus67-cache"
);
const CACHE_FILE = path.join(CACHE_DIR, "last-context-check.json");
const CHECK_INTERVAL_MS = 60_000;

try {
  // Rate limit check
  if (fs.existsSync(CACHE_FILE)) {
    const last = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    if (Date.now() - last.timestamp < CHECK_INTERVAL_MS) {
      process.exit(0); // Too soon, skip
    }
  }

  // Estimate context usage from conversation stats
  // Claude Code sets these env vars (when available)
  const conversationTokens = parseInt(
    process.env.CLAUDE_CONVERSATION_TOKENS || "0",
    10
  );
  const maxTokens = parseInt(
    process.env.CLAUDE_MAX_CONTEXT_TOKENS || "1000000",
    10
  );

  // Fallback: estimate from session duration and tool call count
  const sessionStart = parseInt(
    process.env.CLAUDE_SESSION_START || String(Date.now()),
    10
  );
  const sessionDuration = Date.now() - sessionStart;
  const toolCallCount = parseInt(
    process.env.CLAUDE_TOOL_CALL_COUNT || "0",
    10
  );

  let usagePercent;
  if (conversationTokens > 0 && maxTokens > 0) {
    usagePercent = (conversationTokens / maxTokens) * 100;
  } else {
    // Heuristic: ~500 tokens per tool call avg, ~1000 tokens per minute of session
    const estimatedTokens =
      toolCallCount * 500 + (sessionDuration / 60_000) * 1000;
    usagePercent = (estimatedTokens / maxTokens) * 100;
  }

  // Write timestamp for rate limiting
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ timestamp: Date.now(), usagePercent })
    );
  } catch (e) {
    // Silent
  }

  // Determine level and output warning if needed
  const remaining = 100 - usagePercent;

  if (remaining <= 15) {
    console.log(
      `[OPUS 67 CONTEXT: POOR] ~${remaining.toFixed(0)}% remaining. ` +
        `DELEGATE to subagents immediately. Save state with /memory. ` +
        `Do not attempt complex multi-file operations.`
    );
  } else if (remaining <= 25) {
    console.log(
      `[OPUS 67 CONTEXT: DEGRADING] ~${remaining.toFixed(0)}% remaining. ` +
        `Consider checkpointing progress and delegating remaining work to subagents.`
    );
  } else if (remaining <= 35) {
    console.log(
      `[OPUS 67 CONTEXT: GOOD] ~${remaining.toFixed(0)}% remaining. ` +
        `Prefer subagents for research. Keep main context for decisions.`
    );
  }
  // PEAK: no output (don't waste tokens)
} catch (err) {
  // Silent fail — never break the session
}
