/**
 * OPUS 67 v6.0.0 - Hooks Activator
 *
 * Verifies and reports on hook status
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, extname } from 'path';

export interface Hook {
  name: string;
  filename: string;
  path: string;
  exists: boolean;
  type: 'session' | 'pre' | 'post' | 'unknown';
}

export interface HooksStatus {
  count: number;
  active: Hook[];
  missing: string[];
}

/**
 * Determine hook type from filename
 */
function getHookType(filename: string): Hook['type'] {
  if (filename.includes('session')) return 'session';
  if (filename.startsWith('pre-')) return 'pre';
  if (filename.startsWith('post-')) return 'post';
  return 'unknown';
}

/**
 * Check and report on all hooks
 */
export async function activateHooks(projectRoot: string = process.cwd()): Promise<HooksStatus> {
  const hooksDir = join(projectRoot, '.claude', 'hooks');

  // Expected hooks based on MASTER.yaml
  const expectedHooks = [
    'session-start.js',
    'opus67-auto-detect.js',
    'pre-bash.js',
    'post-write.js',
    'post-bash.js',
  ];

  const active: Hook[] = [];
  const missing: string[] = [];

  if (!existsSync(hooksDir)) {
    return {
      count: 0,
      active: [],
      missing: expectedHooks,
    };
  }

  // Check each expected hook
  for (const hookFile of expectedHooks) {
    const hookPath = join(hooksDir, hookFile);

    if (existsSync(hookPath)) {
      active.push({
        name: hookFile.replace('.js', ''),
        filename: hookFile,
        path: hookPath,
        exists: true,
        type: getHookType(hookFile),
      });
    } else {
      missing.push(hookFile);
    }
  }

  // Also check for any additional hooks not in expected list
  const allFiles = readdirSync(hooksDir);
  for (const file of allFiles) {
    if (extname(file) !== '.js') continue;
    if (expectedHooks.includes(file)) continue;

    const hookPath = join(hooksDir, file);
    active.push({
      name: file.replace('.js', ''),
      filename: file,
      path: hookPath,
      exists: true,
      type: getHookType(file),
    });
  }

  return {
    count: active.length,
    active,
    missing,
  };
}

/**
 * Get hook content for inspection
 */
export function getHookContent(hookName: string, projectRoot: string = process.cwd()): string | null {
  const hooksDir = join(projectRoot, '.claude', 'hooks');
  const hookPath = join(hooksDir, `${hookName}.js`);

  if (!existsSync(hookPath)) {
    return null;
  }

  return readFileSync(hookPath, 'utf-8');
}

/**
 * Check if a specific hook exists
 */
export function hookExists(hookName: string, projectRoot: string = process.cwd()): boolean {
  const hooksDir = join(projectRoot, '.claude', 'hooks');
  const hookPath = join(hooksDir, `${hookName}.js`);
  return existsSync(hookPath);
}
