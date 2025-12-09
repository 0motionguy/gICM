#!/usr/bin/env node
/**
 * OPUS 67 Pre-Read Hook
 *
 * Triggers skill detection before file read operations.
 * This ensures relevant skills are loaded when Claude explores code.
 */
const { execSync } = require("child_process");
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join, extname } = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const cacheDir = join(projectDir, ".claude", ".opus67-cache");
const lastDetectFile = join(cacheDir, "last-detect.json");

// Rate limit: only run detection every 30 seconds
function shouldRunDetection() {
  try {
    if (!existsSync(lastDetectFile)) return true;

    const lastDetect = JSON.parse(readFileSync(lastDetectFile, "utf8"));
    const elapsed = Date.now() - lastDetect.timestamp;

    // Run if more than 30 seconds since last detection
    return elapsed > 30000;
  } catch (e) {
    return true;
  }
}

function updateLastDetect(query, skills) {
  try {
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    writeFileSync(
      lastDetectFile,
      JSON.stringify(
        {
          timestamp: Date.now(),
          query,
          skills,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    // Ignore write errors
  }
}

// Get file extension to determine context
function getFileContext() {
  const toolInput = process.env.MCP_TOOL_INPUT || "{}";
  try {
    const input = JSON.parse(toolInput);
    const filePath = input.file_path || input.path || input.pattern || "";
    const ext = extname(filePath).toLowerCase();

    const contextMap = {
      ".ts": "typescript",
      ".tsx": "react typescript",
      ".js": "javascript",
      ".jsx": "react javascript",
      ".py": "python",
      ".rs": "rust",
      ".go": "go",
      ".sol": "solidity smart contract",
      ".md": "documentation",
      ".json": "configuration",
      ".yaml": "configuration",
      ".yml": "configuration",
      ".css": "styling",
      ".scss": "styling",
      ".sql": "database",
    };

    return contextMap[ext] || "code";
  } catch (e) {
    return "code";
  }
}

try {
  if (!shouldRunDetection()) {
    // Output nothing - use cached detection
    process.exit(0);
  }

  const fileContext = getFileContext();

  // Build a query from file context
  const query = `working with ${fileContext} files`;

  // Output instruction to call opus67_detect_skills
  const hookOutput = {
    additionalContext: `
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 OPUS 67: Detected ${fileContext.toUpperCase()} context                              │
│                                                                             │
│ REMINDER: Call mcp__opus67__opus67_detect_skills("${query}")       │
│ to load specialized expertise for this file type.                          │
└─────────────────────────────────────────────────────────────────────────────┘
`.trim(),
  };

  console.log(JSON.stringify(hookOutput));

  // Update rate limit tracker
  updateLastDetect(query, []);

  // Log activity
  const logDir = join(projectDir, ".claude", "logs");
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  const logFile = join(logDir, "opus67-pre-read.log");
  const logEntry = `[${new Date().toISOString()}] Pre-read hook: ${fileContext}\n`;
  require("fs").appendFileSync(logFile, logEntry);
} catch (err) {
  // Silent fail - don't block the read operation
  try {
    const logDir = join(projectDir, ".claude", "logs");
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    const logFile = join(logDir, "hook-errors.log");
    require("fs").appendFileSync(
      logFile,
      `[${new Date().toISOString()}] opus67-pre-read error: ${err.message}\n`,
    );
  } catch (e) {
    // Truly silent
  }
}
