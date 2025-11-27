/**
 * Update registry files arrays for multi-platform support
 * Adds Gemini and OpenAI file paths to agents and skills
 */

import * as fs from 'fs';
import * as path from 'path';

const REGISTRY_PATH = path.join(__dirname, '../src/lib/registry.ts');

function updateFilesArrays() {
  let content = fs.readFileSync(REGISTRY_PATH, 'utf-8');

  let agentCount = 0;
  let skillCount = 0;

  // Pattern to find agent files arrays with only .claude path
  // Match: files: [".claude/agents/name.md"],
  const agentFilesPattern = /files:\s*\["\.claude\/agents\/([^"]+)\.md"\],/g;

  content = content.replace(agentFilesPattern, (match, agentName) => {
    agentCount++;
    return `files: [".claude/agents/${agentName}.md", ".gemini/agents/${agentName}.md", ".openai/agents/${agentName}.md"],`;
  });

  // Pattern for skill files arrays
  // Match: files: [".claude/skills/name/SKILL.md"],
  const skillFilesPattern = /files:\s*\["\.claude\/skills\/([^"]+)\/SKILL\.md"\],/g;

  content = content.replace(skillFilesPattern, (match, skillName) => {
    skillCount++;
    return `files: [".claude/skills/${skillName}/SKILL.md", ".gemini/skills/${skillName}/SKILL.md", ".openai/skills/${skillName}/SKILL.md"],`;
  });

  // Also update simpler skill pattern
  const skillFilesSimplePattern = /files:\s*\["\.claude\/skills\/([^"]+)"\],/g;
  content = content.replace(skillFilesSimplePattern, (match, skillPath) => {
    if (!skillPath.includes('.md')) {
      skillCount++;
      return `files: [".claude/skills/${skillPath}", ".gemini/skills/${skillPath}", ".openai/skills/${skillPath}"],`;
    }
    return match;
  });

  fs.writeFileSync(REGISTRY_PATH, content, 'utf-8');

  console.log(`=== Files Arrays Updated ===`);
  console.log(`Agents updated: ${agentCount}`);
  console.log(`Skills updated: ${skillCount}`);
}

updateFilesArrays();
