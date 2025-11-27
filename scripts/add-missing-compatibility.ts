/**
 * Add compatibility fields to items that don't have them
 */

import * as fs from 'fs';
import * as path from 'path';

const FILES_TO_UPDATE = [
  { path: '../src/lib/registry.ts', sections: ['MCPS'] },
  { path: '../src/lib/workflows.ts', sections: ['WORKFLOWS'] },
];

const COMPATIBILITY_TEMPLATE = `
    platforms: ['claude', 'gemini', 'openai'],
    compatibility: {
      models: ['opus-4.5', 'sonnet-4.5', 'sonnet', 'gemini-2.0-flash', 'gemini-3.0-pro', 'gpt-4o'],
      software: ['vscode', 'cursor', 'terminal', 'windsurf']
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 65,
      status: "NEEDS_FIX",
    },`;

function addCompatibilityToItems(filePath: string) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');

  // Pattern to find items ending with just },
  // that have installs/remixes but no platforms
  // Match pattern: end of object properties before closing }
  // Look for items that have "remixes:" or "installs:" followed by }, without platforms

  const itemEndPattern = /(installs:\s*\d+,\s*\n\s*remixes:\s*\d+,)(\s*\n\s*\},)/g;

  let count = 0;
  content = content.replace(itemEndPattern, (match, statsBlock, ending) => {
    // Check if platforms already exists nearby (within 200 chars before)
    const before = content.substring(content.lastIndexOf(match) - 200, content.lastIndexOf(match));
    if (before.includes('platforms:')) {
      return match;
    }
    count++;
    return statsBlock + COMPATIBILITY_TEMPLATE + ending;
  });

  // Also handle items with envKeys at the end
  const envKeysEndPattern = /(envKeys:\s*\[[^\]]*\],)(\s*\n\s*\},)/g;
  content = content.replace(envKeysEndPattern, (match, envBlock, ending) => {
    // Check if platforms already exists
    if (match.includes('platforms:') || content.includes('platforms:')) {
      return match;
    }
    count++;
    return envBlock + COMPATIBILITY_TEMPLATE + ending;
  });

  console.log(`Updated ${count} items in ${filePath}`);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

// Run for all files
FILES_TO_UPDATE.forEach(file => {
  addCompatibilityToItems(file.path);
});

console.log('Done adding compatibility fields!');
