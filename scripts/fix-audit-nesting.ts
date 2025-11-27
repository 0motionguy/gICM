/**
 * Fix audit nesting - move audit out of implementations block
 */

import * as fs from 'fs';
import * as path from 'path';

function fixFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');

  let fixCount = 0;

  // Pattern to find incorrectly nested audit inside implementations
  // Match patterns like:
  // implementations: { claude: { install: "..." }, audit: { ... } }
  // Need to move audit outside implementations

  // First, handle the pattern with audit nested at end of implementations
  const nestedPattern = /implementations:\s*\{([^}]*\{[^}]*\}[^}]*),?\s*audit:\s*\{([^}]+)\}\s*\}/g;

  content = content.replace(nestedPattern, (match, implContent, auditContent) => {
    fixCount++;
    return `implementations: {${implContent}
    },
    audit: {${auditContent}
    }`;
  });

  // Also handle pattern where audit is alone inside implementations
  const simpleNestedPattern = /implementations:\s*\{\s*audit:\s*\{([^}]+)\}\s*\}/g;
  content = content.replace(simpleNestedPattern, (match, auditContent) => {
    fixCount++;
    return `audit: {${auditContent}
    }`;
  });

  // Handle the Gemini file specific pattern
  // implementations: { gemini: {...}, audit: {...} }
  const geminiPattern = /implementations:\s*\{\s*gemini:\s*\{([^}]+)\},?\s*audit:\s*\{([^}]+)\}\s*\}/g;
  content = content.replace(geminiPattern, (match, geminiContent, auditContent) => {
    fixCount++;
    return `implementations: {
      gemini: {${geminiContent}},
    },
    audit: {${auditContent}
    }`;
  });

  // Handle OpenAI file specific pattern
  const openaiPattern = /implementations:\s*\{\s*openai:\s*\{([^}]+)\},?\s*audit:\s*\{([^}]+)\}\s*\}/g;
  content = content.replace(openaiPattern, (match, openaiContent, auditContent) => {
    fixCount++;
    return `implementations: {
      openai: {${openaiContent}},
    },
    audit: {${auditContent}
    }`;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${fixCount} items in ${path.basename(filePath)}`);
  return fixCount;
}

const files = [
  path.join(__dirname, '../src/lib/registry.ts'),
  path.join(__dirname, '../src/lib/registry-gemini.ts'),
  path.join(__dirname, '../src/lib/registry-openai.ts'),
];

let total = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    total += fixFile(file);
  }
});

console.log(`\nTotal fixes: ${total}`);
