#!/usr/bin/env node
/**
 * PostToolUse Hook for Bash
 *
 * Tracks completions and sends notifications:
 * - Logs successful builds/tests/deploys
 * - Records wins for significant events
 * - Sends notifications on important completions
 *
 * FIXED: Using CommonJS require() instead of ES module imports
 */
const { appendFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  try {
    const hookData = JSON.parse(input);
    const command = hookData.tool_input?.command || '';
    const exitCode = hookData.tool_result?.exit_code ?? 0;
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

    // Only track successful commands
    if (exitCode !== 0) {
      process.exit(0);
    }

    // Detect significant completions
    let winType = null;
    let winCategory = 'agent';
    let winValue = 1;
    let winTitle = '';

    if (command.includes('pnpm build') || command.includes('npm run build')) {
      winType = 'build';
      winCategory = 'product';
      winTitle = 'Successful build';
    } else if (command.includes('pnpm test') || command.includes('vitest') || command.includes('jest')) {
      winType = 'test';
      winCategory = 'product';
      winTitle = 'Tests passed';
    } else if (command.includes('npm publish') || command.includes('pnpm publish')) {
      winType = 'publish';
      winCategory = 'product';
      winValue = 10;
      winTitle = 'Package published';
    } else if (command.includes('git push')) {
      winType = 'push';
      winCategory = 'agent';
      winTitle = 'Code pushed';
    } else if (command.includes('deploy')) {
      winType = 'deploy';
      winCategory = 'product';
      winValue = 5;
      winTitle = 'Deployment completed';
    }

    if (winType) {
      // Ensure logs directory exists
      const logsDir = join(projectDir, '.claude', 'logs');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }

      // Log the completion
      const today = new Date().toISOString().split('T')[0];
      const logFile = join(logsDir, `completions-${today}.jsonl`);

      const logEntry = {
        event: 'command_completed',
        type: winType,
        category: winCategory,
        value: winValue,
        title: winTitle,
        command: command.substring(0, 100),
        timestamp: new Date().toISOString()
      };

      appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

      // Also log to wins file for memory system
      const winsFile = join(projectDir, '.claude', 'memory', 'wins', `${today.substring(0, 7)}.md`);
      const winsDir = join(projectDir, '.claude', 'memory', 'wins');

      if (existsSync(winsDir)) {
        try {
          const winEntry = `\n### ${winTitle}\n- **Type:** ${winType}\n- **Value:** ${winValue}\n- **Time:** ${new Date().toLocaleTimeString()}\n`;
          appendFileSync(winsFile, winEntry);
        } catch {
          // Memory not set up yet, skip
        }
      }

      console.log(`Win: ${winTitle} (+${winValue})`);
    }

    process.exit(0);
  } catch (error) {
    // Don't block on errors
    process.exit(0);
  }
});
