#!/usr/bin/env node
/**
 * SessionStart Hook - Logs session start and sets up environment
 *
 * Integrates with:
 * - Session tracking in .claude/logs/
 * - Autonomy notifications
 *
 * FIXED: Using CommonJS require() instead of ES module imports
 */
const { appendFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const logsDir = join(projectDir, ".claude", "logs");
const envFile = process.env.CLAUDE_ENV_FILE;

// Ensure logs directory exists
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Log session start
const sessionLog = {
  event: "session_start",
  timestamp: new Date().toISOString(),
  sessionId: process.env.CLAUDE_SESSION_ID || `session_${Date.now()}`,
  projectDir,
  autonomyLevel: process.env.GICM_AUTONOMY_LEVEL || "2",
};

const today = new Date().toISOString().split("T")[0];
const logFile = join(logsDir, `sessions-${today}.jsonl`);

try {
  appendFileSync(logFile, JSON.stringify(sessionLog) + "\n");
} catch (err) {
  // Silent fail - don't block session
}

// Set environment variables for the session
if (envFile) {
  try {
    const envVars = [
      `export GICM_SESSION_START=${Date.now()}`,
      `export GICM_SESSION_ID=${sessionLog.sessionId}`,
      `export NODE_ENV=development`,
    ];
    appendFileSync(envFile, envVars.join("\n") + "\n");
  } catch (err) {
    // Silent fail
  }
}

// Output to stdout - appears as "hook success: <message>" in Claude Code startup
console.log(`OPUS 67 v6.0.0 ● ONLINE ● Skills: 141 ● MCPs: 82`);
