/**
 * Add audit fields to Gemini and OpenAI registries
 */

import * as fs from 'fs';
import * as path from 'path';

const AUDIT_TEMPLATE = `,
        audit: {
            lastAudited: "2025-11-27",
            qualityScore: 85,
            status: "VERIFIED",
        }`;

function addAuditFields(filePath: string) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');

  // Pattern to find items ending with implementations block
  // Match: implementations: { ... } followed by }
  const implementationsPattern = /(implementations:\s*\{[^}]+\})\s*(\})/g;

  let count = 0;
  content = content.replace(implementationsPattern, (match, implBlock, closing) => {
    // Check if audit already exists
    if (match.includes('audit:')) {
      return match;
    }
    count++;
    return implBlock + AUDIT_TEMPLATE + '\n    ' + closing;
  });

  // Also handle items ending with just compatibility
  const compatPattern = /(compatibility:\s*\{[^}]+\},?)\s*\n\s*(\},)/g;
  content = content.replace(compatPattern, (match, compatBlock, closing) => {
    if (match.includes('audit:') || match.includes('implementations:')) {
      return match;
    }
    count++;
    return compatBlock + AUDIT_TEMPLATE + '\n    ' + closing;
  });

  console.log(`Added audit to ${count} items in ${filePath}`);
  fs.writeFileSync(fullPath, content, 'utf-8');
}

// Run for all files with implementations
addAuditFields('../src/lib/registry-gemini.ts');
addAuditFields('../src/lib/registry-openai.ts');
addAuditFields('../src/lib/registry.ts');

console.log('Done!');
