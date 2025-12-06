#!/usr/bin/env node
/**
 * PreToolUse Hook for Bash
 *
 * Validates commands before execution:
 * - Runs lint before git push
 * - Runs tests before npm publish
 * - Validates deployment commands with autonomy level
 *
 * FIXED: Using CommonJS require() instead of ES module imports
 */
const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  try {
    const hookData = JSON.parse(input);
    const command = hookData.tool_input?.command || '';
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

    // Check for git push - run lint first
    if (command.includes('git push') && !command.includes('--no-verify')) {
      console.log('Pre-push: Running lint check...');
      try {
        execSync('pnpm lint --quiet', {
          cwd: projectDir,
          stdio: 'pipe',
          timeout: 60000
        });
        console.log('Lint passed!');
      } catch (lintError) {
        // Output JSON to signal blocking
        const output = {
          decision: 'block',
          reason: 'Lint check failed. Fix lint errors before pushing.'
        };
        console.log(JSON.stringify(output));
        process.exit(2);
      }
    }

    // Check for npm/pnpm publish - run tests first
    if (command.includes('publish') && (command.includes('npm') || command.includes('pnpm'))) {
      console.log('Pre-publish: Running tests...');
      try {
        execSync('pnpm test:run --passWithNoTests', {
          cwd: projectDir,
          stdio: 'pipe',
          timeout: 120000
        });
        console.log('Tests passed!');
      } catch (testError) {
        const output = {
          decision: 'block',
          reason: 'Tests failed. Fix failing tests before publishing.'
        };
        console.log(JSON.stringify(output));
        process.exit(2);
      }
    }

    // Check for production deployment
    if (command.includes('deploy') && command.includes('production')) {
      const autonomyLevel = parseInt(process.env.GICM_AUTONOMY_LEVEL || '2');
      if (autonomyLevel < 3) {
        const output = {
          decision: 'ask',
          reason: 'Production deployment requires approval at autonomy level 2.'
        };
        console.log(JSON.stringify(output));
      }
    }

    // Allow the command
    process.exit(0);
  } catch (error) {
    // Don't block on parse errors
    process.exit(0);
  }
});
