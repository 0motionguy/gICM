#!/usr/bin/env node
/**
 * Memory Bridge - CommonJS bridge for hooks to emit to UnifiedMemory
 *
 * Hooks are CommonJS, but UnifiedMemory is TypeScript ESM.
 * This bridge writes to a JSONL file that the memory bus processes.
 */
const { appendFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");

const MEMORY_EVENTS_FILE = ".gicm/memory-events.jsonl";

/**
 * Ensure .gicm directory exists
 */
function ensureDir(projectDir) {
  const gicmDir = join(projectDir, ".gicm");
  if (!existsSync(gicmDir)) {
    mkdirSync(gicmDir, { recursive: true });
  }
  return gicmDir;
}

/**
 * Emit an event to the memory bus
 *
 * @param {object} event - Event to emit
 * @param {string} event.type - Event type: 'episode' | 'fact' | 'learning' | 'win'
 * @param {string} event.content - Event content/description
 * @param {object} [event.metadata] - Additional metadata
 * @param {string} [projectDir] - Project directory (defaults to cwd)
 */
function emitToMemory(
  event,
  projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd(),
) {
  try {
    const gicmDir = ensureDir(projectDir);
    const eventsFile = join(gicmDir, "memory-events.jsonl");

    const fullEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      source: "hook",
      sessionId: process.env.CLAUDE_SESSION_ID || `session_${Date.now()}`,
    };

    const line = JSON.stringify(fullEvent);
    appendFileSync(eventsFile, line + "\n");

    return true;
  } catch (error) {
    // Don't fail hooks on memory errors
    console.error("[MemoryBridge] Error:", error.message);
    return false;
  }
}

/**
 * Emit a fact (permanent knowledge)
 */
function emitFact(content, metadata = {}, projectDir) {
  return emitToMemory(
    {
      type: "fact",
      content,
      metadata: { category: "knowledge", ...metadata },
    },
    projectDir,
  );
}

/**
 * Emit an episode (temporal event)
 */
function emitEpisode(action, content, metadata = {}, projectDir) {
  return emitToMemory(
    {
      type: "episode",
      content,
      metadata: { action, ...metadata },
    },
    projectDir,
  );
}

/**
 * Emit a learning (pattern discovery)
 */
function emitLearning(
  content,
  learningType = "pattern",
  metadata = {},
  projectDir,
) {
  return emitToMemory(
    {
      type: "learning",
      content,
      metadata: { learningType, ...metadata },
    },
    projectDir,
  );
}

/**
 * Emit a win (achievement/success)
 */
function emitWin(title, winType, value = 1, metadata = {}, projectDir) {
  return emitToMemory(
    {
      type: "win",
      content: title,
      metadata: { winType, value, ...metadata },
    },
    projectDir,
  );
}

/**
 * Get memory events file path
 */
function getEventsFilePath(
  projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd(),
) {
  return join(projectDir, MEMORY_EVENTS_FILE);
}

module.exports = {
  emitToMemory,
  emitFact,
  emitEpisode,
  emitLearning,
  emitWin,
  getEventsFilePath,
  ensureDir,
};
