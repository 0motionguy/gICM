#!/usr/bin/env node
/**
 * OPUS 67 Auto-Detection Hook
 *
 * This hook runs on session start to pre-load skill context
 * and create a reminder file for Claude to use OPUS 67 tools.
 *
 * FIXED: Using CommonJS require() instead of ES module imports
 */
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const cacheDir = join(projectDir, '.claude', '.opus67-cache');

// Ensure cache directory exists
try {
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
} catch (e) {
  // Ignore mkdir errors
}

// Try to detect project type and pre-load relevant skills
function detectProjectType() {
  const indicators = {
    solana: ['Anchor.toml', 'programs/', 'Cargo.toml'],
    react: ['package.json', 'src/App.tsx', 'src/App.jsx'],
    nextjs: ['next.config.js', 'next.config.ts', 'next.config.mjs', 'app/', 'pages/'],
    node: ['package.json', 'index.js', 'src/index.ts'],
    python: ['requirements.txt', 'setup.py', 'pyproject.toml'],
    rust: ['Cargo.toml', 'src/lib.rs', 'src/main.rs'],
    go: ['go.mod', 'go.sum', 'main.go']
  };

  const detected = [];

  for (const [type, files] of Object.entries(indicators)) {
    for (const file of files) {
      try {
        if (existsSync(join(projectDir, file))) {
          detected.push(type);
          break;
        }
      } catch (e) {
        // Ignore file check errors
      }
    }
  }

  return detected;
}

// Map project types to skill IDs
const skillMap = {
  solana: ['solana-anchor-expert', 'rust-solana-patterns', 'anchor-macros-mastery'],
  react: ['react-component-builder', 'typescript-patterns', 'tailwind-styling'],
  nextjs: ['nextjs-14-expert', 'app-router-patterns', 'server-components'],
  node: ['nodejs-backend', 'api-design-patterns', 'express-fastify'],
  python: ['python-best-practices', 'fastapi-patterns', 'django-expert'],
  rust: ['rust-advanced-patterns', 'memory-safety', 'async-rust'],
  go: ['go-patterns', 'go-concurrency', 'go-microservices']
};

try {
  const projectTypes = detectProjectType();
  const relevantSkills = [];

  for (const type of projectTypes) {
    if (skillMap[type]) {
      relevantSkills.push(...skillMap[type]);
    }
  }

  const topSkills = relevantSkills.slice(0, 5);

  // Write pre-detected context to cache
  const cacheContext = {
    timestamp: new Date().toISOString(),
    projectDir,
    projectTypes,
    preloadedSkills: topSkills,
    reminder: 'ALWAYS call opus67_detect_skills before responding to code tasks'
  };

  writeFileSync(
    join(cacheDir, 'session-context.json'),
    JSON.stringify(cacheContext, null, 2)
  );

  // Output structured additionalContext for Claude Code auto-injection
  const additionalContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         OPUS 67 AUTOPILOT ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Project Types: ${projectTypes.length > 0 ? projectTypes.join(', ') : 'Generic'}
🎯 Pre-loaded Skills: ${topSkills.length > 0 ? topSkills.join(', ') : 'None detected'}

┌─────────────────────────────────────────────────────────────────────────────┐
│ MANDATORY SKILL LOADING PROTOCOL                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ On EVERY code-related task, you MUST:                                       │
│                                                                             │
│ 1. Call mcp__opus67__opus67_detect_skills with the user's query             │
│ 2. Call mcp__opus67__opus67_get_skill for top 1-3 matches                   │
│ 3. Apply the loaded expertise in your response                              │
│                                                                             │
│ Available slash commands: /mcp__opus67__solana, /mcp__opus67__react, etc.   │
└─────────────────────────────────────────────────────────────────────────────┘

Skills are YOUR superpowers. The user paid for OPUS 67 - use it on every task!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // Output as structured JSON for Claude Code additionalContext injection
  const hookOutput = {
    additionalContext: additionalContext.trim()
  };

  console.log(JSON.stringify(hookOutput));

  // v6.0.0: Add visible logging for hook activity
  const logDir = join(projectDir, '.claude', 'logs');
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  const logFile = join(logDir, 'opus67-autodetect.log');
  const logEntry = `[${new Date().toISOString()}] OPUS 67 v6.0.0 Auto-detect: ${projectTypes.join(', ') || 'generic'} -> ${topSkills.join(', ') || 'base skills'}\n`;
  require('fs').appendFileSync(logFile, logEntry);

  // Also output to stderr for Claude Code to capture
  console.error(`[OPUS67] Auto-detected: ${projectTypes.join(', ') || 'generic'} project`);

} catch (err) {
  // Log error to file instead of stderr to avoid Claude Code warning
  try {
    const logDir = join(projectDir, '.claude', 'logs');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    const logFile = join(logDir, `hook-errors-${new Date().toISOString().split('T')[0]}.jsonl`);
    const errorLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      hook: 'opus67-auto-detect',
      error: err.message,
      stack: err.stack
    }) + '\n';
    require('fs').appendFileSync(logFile, errorLog);
  } catch (e) {
    // Truly silent fail
  }
}
