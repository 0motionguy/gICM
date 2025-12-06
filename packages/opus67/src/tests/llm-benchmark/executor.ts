/**
 * OPUS 67 LLM Benchmark - Code Executor
 * Executes Python code safely (Docker or fallback to Node child_process)
 */

import { spawn, execSync } from 'child_process';
import type { ExecutionResult } from './types.js';

const TIMEOUT_MS = 30_000;

export async function executeCode(
  code: string,
  testCode: string
): Promise<ExecutionResult> {
  // Check if Docker is available
  const dockerAvailable = await checkDocker();

  if (dockerAvailable) {
    return executeWithDocker(code, testCode);
  } else {
    return executeWithPython(code, testCode);
  }
}

async function checkDocker(): Promise<boolean> {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function executeWithDocker(
  code: string,
  testCode: string
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const fullCode = code + '\n\n' + testCode;
    const input = JSON.stringify({ code: fullCode, test: '' });

    const docker = spawn('docker', [
      'run',
      '--rm',
      '-i',
      '--memory=256m',
      '--cpus=0.5',
      '--network=none',
      'opus67-python-sandbox'
    ], { timeout: TIMEOUT_MS });

    let stdout = '';
    let stderr = '';

    docker.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    docker.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    docker.on('close', (code) => {
      try {
        if (stdout.trim()) {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } else {
          resolve({
            passed: false,
            error: stderr || `Docker exited with code ${code}`,
            error_type: 'runtime'
          });
        }
      } catch {
        resolve({
          passed: false,
          error: stderr || stdout || 'Unknown error',
          error_type: 'runtime'
        });
      }
    });

    docker.on('error', (err) => {
      resolve({
        passed: false,
        error: err.message,
        error_type: 'runtime'
      });
    });

    docker.stdin.write(input);
    docker.stdin.end();

    // Timeout handler
    setTimeout(() => {
      docker.kill();
      resolve({
        passed: false,
        error: 'Execution timed out',
        error_type: 'timeout'
      });
    }, TIMEOUT_MS);
  });
}

async function executeWithPython(
  code: string,
  testCode: string
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    // Check if Python is available
    let pythonCmd = 'python3';
    try {
      execSync('python3 --version', { stdio: 'ignore' });
    } catch {
      try {
        execSync('python --version', { stdio: 'ignore' });
        pythonCmd = 'python';
      } catch {
        resolve({
          passed: false,
          error: 'Python not available. Install Python 3.11+ or Docker.',
          error_type: 'runtime'
        });
        return;
      }
    }

    const fullCode = code + '\n\n' + testCode;

    const python = spawn(pythonCmd, ['-c', fullCode], {
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve({
          passed: true,
          output: stdout
        });
      } else {
        // Parse error type
        let errorType: 'syntax' | 'runtime' | 'assertion' = 'runtime';
        if (stderr.includes('SyntaxError')) {
          errorType = 'syntax';
        } else if (stderr.includes('AssertionError')) {
          errorType = 'assertion';
        }

        resolve({
          passed: false,
          error: stderr || `Exit code: ${exitCode}`,
          error_type: errorType
        });
      }
    });

    python.on('error', (err) => {
      resolve({
        passed: false,
        error: err.message,
        error_type: 'runtime'
      });
    });

    // Timeout handler
    setTimeout(() => {
      python.kill();
      resolve({
        passed: false,
        error: 'Execution timed out',
        error_type: 'timeout'
      });
    }, TIMEOUT_MS);
  });
}

export function checkDockerSync(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function checkPythonSync(): boolean {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync('python --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}
