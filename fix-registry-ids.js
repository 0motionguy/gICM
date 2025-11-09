#!/usr/bin/env node

/**
 * FIX REGISTRY IDs - Add kind/ prefix to all item IDs
 *
 * Bug: All items have id: "slug" instead of id: "kind/slug"
 * This causes Stack Builder to generate malformed install commands like:
 * "agent-name/undefined" instead of "agent/agent-name"
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, 'src/lib/registry.ts');

console.log('🔧 Fixing Registry IDs...\n');

// Read registry file
let content = fs.readFileSync(REGISTRY_PATH, 'utf8');

// Track changes
let fixCount = 0;
const fixes = [];

// Pattern to match registry items with their kind and id
// Matches: kind: "agent", ... id: "some-slug",
const itemPattern = /kind:\s*"(agent|skill|command|mcp|setting)"[\s\S]*?id:\s*"([^"]+)"/g;

let match;
const replacements = [];

while ((match = itemPattern.exec(content)) !== null) {
  const kind = match[1];
  const currentId = match[2];

  // Check if ID already has the kind/ prefix
  if (!currentId.startsWith(`${kind}/`)) {
    const correctId = `${kind}/${currentId}`;

    // Store replacement info
    replacements.push({
      kind,
      old: currentId,
      new: correctId,
      fullMatch: match[0]
    });

    fixes.push(`  ${kind}: "${currentId}" → "${correctId}"`);
    fixCount++;
  }
}

console.log(`Found ${fixCount} items with incorrect IDs\n`);

if (fixCount === 0) {
  console.log('✅ All IDs are already correct!\n');
  process.exit(0);
}

// Perform replacements
// We need to be careful to only replace the id field, not other occurrences
replacements.forEach(({ kind, old, new: newId }) => {
  // Replace pattern: id: "old" where it follows kind: "kind"
  const searchPattern = new RegExp(
    `(kind:\\s*"${kind}"[\\s\\S]{0,500}?)id:\\s*"${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`,
    'g'
  );

  content = content.replace(searchPattern, `$1id: "${newId}"`);
});

// Write updated content
fs.writeFileSync(REGISTRY_PATH, content, 'utf8');

console.log('✅ Fixed all IDs!\n');
console.log('Summary by kind:');

// Group by kind for summary
const byKind = {};
replacements.forEach(({ kind }) => {
  byKind[kind] = (byKind[kind] || 0) + 1;
});

Object.entries(byKind).forEach(([kind, count]) => {
  console.log(`  ${kind}: ${count} items fixed`);
});

console.log(`\nTotal: ${fixCount} items updated\n`);
console.log('📄 File updated: src/lib/registry.ts\n');
