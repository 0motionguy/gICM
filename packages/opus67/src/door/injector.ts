/**
 * OPUS 67 v6.0.0 - THE DOOR Injector
 *
 * Ensures THE DOOR (master orchestrator prompt) is consistently
 * injected into CLAUDE.md files. This fixes the inconsistent
 * loading issue where sessions had different configurations.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Find package root by walking up to find package.json
 */
function getPackageRoot(): string {
  let dir = __dirname;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return __dirname;
}

// Marker to identify injected DOOR content
const DOOR_START_MARKER = '<!-- OPUS 67 THE DOOR v6.0.0 START -->';
const DOOR_END_MARKER = '<!-- OPUS 67 THE DOOR v6.0.0 END -->';

/**
 * Load THE DOOR from the unified source
 */
export function loadTheDoor(): string {
  const doorPath = join(getPackageRoot(), 'THE_DOOR.md');

  if (!existsSync(doorPath)) {
    throw new Error(`THE DOOR not found at: ${doorPath}`);
  }

  return readFileSync(doorPath, 'utf-8');
}

/**
 * Check if a file already has THE DOOR injected
 */
export function hasDoorInjected(content: string): boolean {
  return content.includes(DOOR_START_MARKER) && content.includes(DOOR_END_MARKER);
}

/**
 * Remove existing DOOR injection (for updates)
 */
export function removeDoorInjection(content: string): string {
  if (!hasDoorInjected(content)) {
    return content;
  }

  const startIndex = content.indexOf(DOOR_START_MARKER);
  const endIndex = content.indexOf(DOOR_END_MARKER) + DOOR_END_MARKER.length;

  // Also remove any trailing newlines after the marker
  let cleanEnd = endIndex;
  while (content[cleanEnd] === '\n') {
    cleanEnd++;
  }

  return content.slice(0, startIndex) + content.slice(cleanEnd);
}

/**
 * Create the injection block
 */
export function createInjectionBlock(doorContent: string): string {
  // Create a condensed version for CLAUDE.md (full DOOR is too large)
  const condensedDoor = `
# OPUS 67 v6.0.0 - THE DOOR IS OPEN

> Unified AI Runtime - 141 Skills | 107 Agents | 30 Modes | 82 MCPs

## Active Capabilities

- **Skills**: Auto-detected based on task keywords
- **Agents**: Spawnable via Task tool (107 specialized agents)
- **Modes**: AUTO (default), ULTRA, THINK, BUILD, VIBE, LIGHT, CREATIVE, DATA, AUDIT, SWARM
- **MCPs**: Auto-connected based on task domain

## Commands

- \`opus67 status\` - Show loaded components
- \`opus67 skills\` - List available skills
- \`opus67 agents\` - List available agents
- \`opus67 mcps\` - List connected MCPs

## Mode Override

Say "set mode X" to manually switch modes:
- "set mode ultra" - Maximum reasoning
- "set mode think" - Deep analysis
- "set mode build" - Production code
- "set mode vibe" - Rapid prototyping

## Auto-Pilot Active

OPUS 67 automatically:
1. Detects project type (Solana, React, Node, etc.)
2. Loads relevant skills
3. Selects optimal mode
4. Connects required MCPs

**Just ask. THE DOOR is open.**
`;

  return `${DOOR_START_MARKER}
${condensedDoor.trim()}
${DOOR_END_MARKER}

`;
}

/**
 * Inject THE DOOR into a single file
 */
export function injectIntoFile(filePath: string, doorContent: string): boolean {
  if (!existsSync(filePath)) {
    return false;
  }

  let content = readFileSync(filePath, 'utf-8');

  // Remove existing injection if present
  content = removeDoorInjection(content);

  // Create injection block
  const injectionBlock = createInjectionBlock(doorContent);

  // Prepend to file
  const newContent = injectionBlock + content;

  writeFileSync(filePath, newContent);
  return true;
}

/**
 * Inject THE DOOR into all CLAUDE.md files in the workspace
 */
export async function injectTheDoor(projectRoot: string = process.cwd()): Promise<{
  injected: number;
  skipped: number;
  files: string[];
}> {
  // Load THE DOOR
  const doorContent = loadTheDoor();

  // Find all CLAUDE.md files
  const claudeFiles = await glob('**/CLAUDE.md', {
    cwd: projectRoot,
    ignore: [
      '**/node_modules/**',
      '**/_archived/**',
      '**/dist/**',
      '**/.git/**',
    ],
    absolute: true,
  });

  let injected = 0;
  let skipped = 0;
  const processedFiles: string[] = [];

  for (const file of claudeFiles) {
    const content = readFileSync(file, 'utf-8');

    // Check if already has current version
    if (content.includes('OPUS 67 v6.0.0')) {
      skipped++;
      continue;
    }

    if (injectIntoFile(file, doorContent)) {
      injected++;
      processedFiles.push(file);
    } else {
      skipped++;
    }
  }

  return {
    injected,
    skipped,
    files: processedFiles,
  };
}

/**
 * Get THE DOOR version from a file
 */
export function getDoorVersion(filePath: string): string | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');

  // Look for version pattern
  const versionMatch = content.match(/OPUS 67 v(\d+\.\d+\.\d+)/);
  return versionMatch ? versionMatch[1] : null;
}

// Export marker constants for testing
export { DOOR_START_MARKER, DOOR_END_MARKER };
