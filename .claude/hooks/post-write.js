#!/usr/bin/env node
/**
 * PostToolUse Hook for Write|Edit|MultiEdit
 *
 * Auto-formats TypeScript/TSX files with Prettier after write
 * Tracks successful formats in logs
 *
 * FIXED: Using CommonJS require() instead of ES module imports
 */
const { execSync } = require('child_process');
const { appendFileSync, existsSync, mkdirSync } = require('fs');
const { join, extname } = require('path');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  try {
    const hookData = JSON.parse(input);
    const filePath = hookData.tool_input?.file_path || hookData.tool_input?.path;

    if (!filePath) {
      process.exit(0);
    }

    const ext = extname(filePath).toLowerCase();
    const formattableExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md'];

    if (!formattableExts.includes(ext)) {
      process.exit(0);
    }

    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

    // Run Prettier
    try {
      execSync(`npx prettier --write "${filePath}"`, {
        cwd: projectDir,
        stdio: 'pipe',
        timeout: 30000
      });

      // Log the format action
      const logsDir = join(projectDir, '.claude', 'logs');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }

      const today = new Date().toISOString().split('T')[0];
      const logFile = join(logsDir, `format-${today}.jsonl`);

      appendFileSync(logFile, JSON.stringify({
        event: 'file_formatted',
        file: filePath,
        ext,
        timestamp: new Date().toISOString()
      }) + '\n');

    } catch (formatError) {
      // Prettier failed - log but don't block
      console.error(`Format warning: ${formatError.message}`);
    }

    process.exit(0);
  } catch (error) {
    // Don't block on parse errors
    process.exit(0);
  }
});
