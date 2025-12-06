import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// src/door/injector.ts
var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = dirname(__filename$1);
function getPackageRoot() {
  let dir = __dirname$1;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return __dirname$1;
}
var DOOR_START_MARKER = "<!-- OPUS 67 THE DOOR v6.0.0 START -->";
var DOOR_END_MARKER = "<!-- OPUS 67 THE DOOR v6.0.0 END -->";
function loadTheDoor() {
  const doorPath = join(getPackageRoot(), "THE_DOOR.md");
  if (!existsSync(doorPath)) {
    throw new Error(`THE DOOR not found at: ${doorPath}`);
  }
  return readFileSync(doorPath, "utf-8");
}
function hasDoorInjected(content) {
  return content.includes(DOOR_START_MARKER) && content.includes(DOOR_END_MARKER);
}
function removeDoorInjection(content) {
  if (!hasDoorInjected(content)) {
    return content;
  }
  const startIndex = content.indexOf(DOOR_START_MARKER);
  const endIndex = content.indexOf(DOOR_END_MARKER) + DOOR_END_MARKER.length;
  let cleanEnd = endIndex;
  while (content[cleanEnd] === "\n") {
    cleanEnd++;
  }
  return content.slice(0, startIndex) + content.slice(cleanEnd);
}
function createInjectionBlock(doorContent) {
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
function injectIntoFile(filePath, doorContent) {
  if (!existsSync(filePath)) {
    return false;
  }
  let content = readFileSync(filePath, "utf-8");
  content = removeDoorInjection(content);
  const injectionBlock = createInjectionBlock();
  const newContent = injectionBlock + content;
  writeFileSync(filePath, newContent);
  return true;
}
async function injectTheDoor(projectRoot = process.cwd()) {
  loadTheDoor();
  const claudeFiles = await glob("**/CLAUDE.md", {
    cwd: projectRoot,
    ignore: [
      "**/node_modules/**",
      "**/_archived/**",
      "**/dist/**",
      "**/.git/**"
    ],
    absolute: true
  });
  let injected = 0;
  let skipped = 0;
  const processedFiles = [];
  for (const file of claudeFiles) {
    const content = readFileSync(file, "utf-8");
    if (content.includes("OPUS 67 v6.0.0")) {
      skipped++;
      continue;
    }
    if (injectIntoFile(file)) {
      injected++;
      processedFiles.push(file);
    } else {
      skipped++;
    }
  }
  return {
    injected,
    skipped,
    files: processedFiles
  };
}
function getDoorVersion(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  const content = readFileSync(filePath, "utf-8");
  const versionMatch = content.match(/OPUS 67 v(\d+\.\d+\.\d+)/);
  return versionMatch ? versionMatch[1] : null;
}

export { DOOR_END_MARKER, DOOR_START_MARKER, createInjectionBlock, getDoorVersion, hasDoorInjected, injectIntoFile, injectTheDoor, loadTheDoor, removeDoorInjection };
