/**
 * Fix MCP platforms - MCPs should be Claude-only
 */

import * as fs from 'fs';
import * as path from 'path';

const REGISTRY_PATH = path.join(__dirname, '../src/lib/registry.ts');

function fixMcpPlatforms() {
  let content = fs.readFileSync(REGISTRY_PATH, 'utf-8');

  // Split into items based on { id: pattern
  const items = content.split(/(?=\{\s*id:\s*")/);
  let mcpCount = 0;

  const fixedItems = items.map(item => {
    // Check if this is an MCP
    if (item.includes('kind: "mcp"')) {
      mcpCount++;
      // Replace platforms array to Claude-only
      item = item.replace(
        /platforms:\s*\['claude',\s*'gemini',\s*'openai'\]/,
        "platforms: ['claude']"
      );
      // Also update compatibility models for MCPs
      item = item.replace(
        /models:\s*\['opus-4\.5',\s*'sonnet-4\.5',\s*'sonnet',\s*'gemini-2\.0-flash',\s*'gemini-3\.0-pro',\s*'gpt-4o'\]/,
        "models: ['opus-4.5', 'sonnet-4.5', 'sonnet']"
      );
    }
    return item;
  });

  content = fixedItems.join('');
  fs.writeFileSync(REGISTRY_PATH, content, 'utf-8');

  console.log(`=== MCP Platforms Fixed ===`);
  console.log(`MCPs set to Claude-only: ${mcpCount}`);
}

fixMcpPlatforms();
