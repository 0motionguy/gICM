/**
 * Update registry implementations for multi-platform support
 * Adds Gemini and OpenAI implementations to agents and skills
 * MCPs remain Claude-only
 */

import * as fs from 'fs';
import * as path from 'path';

const REGISTRY_PATH = path.join(__dirname, '../src/lib/registry.ts');

function updateImplementations() {
  let content = fs.readFileSync(REGISTRY_PATH, 'utf-8');

  let agentCount = 0;
  let skillCount = 0;
  let mcpSkipped = 0;

  // Pattern to find implementations block with only Claude
  // Match: implementations: { claude: { ... } }
  const implementationsPattern = /implementations:\s*\{\s*claude:\s*\{\s*install:\s*"([^"]+)",?\s*\},?\s*audit:/g;

  content = content.replace(implementationsPattern, (match, installCmd) => {
    // Check if this is an MCP - skip those
    const itemContext = content.substring(
      Math.max(0, content.indexOf(match) - 500),
      content.indexOf(match) + 200
    );

    if (itemContext.includes('kind: "mcp"') || installCmd.includes('/mcp/')) {
      mcpSkipped++;
      return match;
    }

    // Determine type from install command
    let geminiPath = '';
    let openaiPath = '';

    if (installCmd.includes('/agent/')) {
      const agentName = installCmd.match(/agent\/([^"]+)/)?.[1] || '';
      geminiPath = `.gemini/agents/${agentName}.md`;
      openaiPath = `.openai/agents/${agentName}.md`;
      agentCount++;
    } else if (installCmd.includes('/skill/')) {
      const skillName = installCmd.match(/skill\/([^"]+)/)?.[1] || '';
      geminiPath = `.gemini/skills/${skillName}`;
      openaiPath = `.openai/skills/${skillName}`;
      skillCount++;
    } else {
      return match;
    }

    return `implementations: {
      claude: {
        install: "${installCmd}",
      },
      gemini: {
        install: "npx @gicm/cli add --platform=gemini ${installCmd.split(' ').pop()}",
        files: ["${geminiPath}"],
      },
      openai: {
        install: "npx @gicm/cli add --platform=openai ${installCmd.split(' ').pop()}",
        files: ["${openaiPath}"],
      },
      audit:`;
  });

  fs.writeFileSync(REGISTRY_PATH, content, 'utf-8');

  console.log(`=== Registry Implementations Updated ===`);
  console.log(`Agents updated: ${agentCount}`);
  console.log(`Skills updated: ${skillCount}`);
  console.log(`MCPs skipped (Claude-only): ${mcpSkipped}`);
}

updateImplementations();
