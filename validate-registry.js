/**
 * Comprehensive Registry Validation Script
 * Checks all 409 items for data integrity issues
 */

const fs = require('fs');
const path = require('path');

// Read registry
const registryPath = path.join(__dirname, 'src', 'lib', 'registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract REGISTRY array
const registryMatch = registryContent.match(/export const REGISTRY: RegistryItem\[\] = \[([\s\S]*?)\];/);
if (!registryMatch) {
  console.error('❌ Could not parse REGISTRY array');
  process.exit(1);
}

console.log('📋 GICM REGISTRY VALIDATION REPORT');
console.log('═'.repeat(60));
console.log('');

// Count items by kind
const agentCount = (registryContent.match(/kind: "agent"/g) || []).length;
const skillCount = (registryContent.match(/kind: "skill"/g) || []).length;
const commandCount = (registryContent.match(/kind: "command"/g) || []).length;
const mcpCount = (registryContent.match(/kind: "mcp"/g) || []).length;
const settingCount = (registryContent.match(/kind: "setting"/g) || []).length;

const totalCount = agentCount + skillCount + commandCount + mcpCount + settingCount;

console.log('📊 Item Counts:');
console.log(`   Agents:   ${agentCount}`);
console.log(`   Skills:   ${skillCount}`);
console.log(`   Commands: ${commandCount}`);
console.log(`   MCPs:     ${mcpCount}`);
console.log(`   Settings: ${settingCount}`);
console.log(`   ────────────────`);
console.log(`   Total:    ${totalCount}`);
console.log('');

// Check 1: Slug-Install Mismatch (for @gicm/cli items only)
console.log('🔍 Check 1: Slug-Install Command Matching (Agents/Skills/Commands)');
const slugMismatches = [];
const itemsWithInstall = registryContent.matchAll(/\{\s+id: "([^"]+)",\s+kind: "([^"]+)"[\s\S]*?slug: "([^"]+)"[\s\S]*?install: "([^"]+)"/g);

for (const match of itemsWithInstall) {
  const id = match[1];
  const kind = match[2];
  const actualSlug = match[3];
  const installCmd = match[4];

  // Only check @gicm/cli commands (skip MCPs with native installs)
  if (installCmd.includes('@gicm/cli add')) {
    const installSlugMatch = installCmd.match(/add (agent|skill|command|setting)\/([a-z0-9-]+)/);
    if (installSlugMatch) {
      const installSlug = installSlugMatch[2];
      if (actualSlug !== installSlug) {
        slugMismatches.push({ id, actualSlug, installSlug, kind });
      }
    }
  }
}

if (slugMismatches.length === 0) {
  console.log('   ✅ All install commands match slugs');
} else {
  console.log(`   ❌ Found ${slugMismatches.length} mismatches`);
  slugMismatches.slice(0, 5).forEach(m => {
    console.log(`      ${m.kind}/${m.installSlug} → ${m.actualSlug}`);
  });
  if (slugMismatches.length > 5) {
    console.log(`      ... and ${slugMismatches.length - 5} more`);
  }
}
console.log('');

// Check 2: File Paths Exist
console.log('🔍 Check 2: File Paths Validation');
const publicDir = path.join(__dirname, 'public', 'claude');
const fileMatches = registryContent.matchAll(/files: \[(.*?)\]/g);
const missingFiles = [];
const validFiles = [];

for (const match of fileMatches) {
  const filesStr = match[1];
  const files = filesStr.match(/"([^"]+)"/g);

  if (files) {
    for (const fileQuoted of files) {
      const file = fileQuoted.replace(/"/g, '');
      // Remove .claude/ prefix and check in public/claude/
      const relativePath = file.replace(/^\.claude\//, '');
      const fullPath = path.join(publicDir, relativePath);

      if (fs.existsSync(fullPath)) {
        validFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }
  }
}

if (missingFiles.length === 0) {
  console.log(`   ✅ All ${validFiles.length} file paths exist`);
} else {
  console.log(`   ❌ Found ${missingFiles.length} missing files`);
  missingFiles.slice(0, 5).forEach(f => {
    console.log(`      ${f}`);
  });
  if (missingFiles.length > 5) {
    console.log(`      ... and ${missingFiles.length - 5} more`);
  }
}
console.log('');

// Check 3: Duplicate Slugs/IDs
console.log('🔍 Check 3: Duplicate Detection');
const slugs = [...registryContent.matchAll(/slug: "([^"]+)"/g)].map(m => m[1]);
const ids = [...registryContent.matchAll(/id: "([^"]+)"/g)].map(m => m[1]);

const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

if (duplicateSlugs.length === 0 && duplicateIds.length === 0) {
  console.log('   ✅ No duplicate slugs or IDs');
} else {
  if (duplicateSlugs.length > 0) {
    console.log(`   ❌ Found ${duplicateSlugs.length} duplicate slugs`);
    [...new Set(duplicateSlugs)].forEach(s => console.log(`      ${s}`));
  }
  if (duplicateIds.length > 0) {
    console.log(`   ❌ Found ${duplicateIds.length} duplicate IDs`);
    [...new Set(duplicateIds)].forEach(i => console.log(`      ${i}`));
  }
}
console.log('');

// Check 4: Dependency References
console.log('🔍 Check 4: Dependency Validation');
const allIds = [...new Set(ids)];
const dependencyMatches = registryContent.matchAll(/dependencies: \[(.*?)\]/g);
const invalidDeps = [];

for (const match of dependencyMatches) {
  const depsStr = match[1];
  const deps = depsStr.match(/"([^"]+)"/g);

  if (deps) {
    for (const depQuoted of deps) {
      const dep = depQuoted.replace(/"/g, '');
      if (!allIds.includes(dep)) {
        invalidDeps.push(dep);
      }
    }
  }
}

if (invalidDeps.length === 0) {
  console.log('   ✅ All dependencies reference valid items');
} else {
  console.log(`   ❌ Found ${invalidDeps.length} invalid dependencies`);
  [...new Set(invalidDeps)].slice(0, 5).forEach(d => {
    console.log(`      ${d}`);
  });
}
console.log('');

// Check 5: Install Command Format
console.log('🔍 Check 5: Install Command Format');
const invalidInstallCommands = [];
const itemBlocks = registryContent.matchAll(/\{\s+id: "([^"]+)",\s+kind: "([^"]+)"[\s\S]*?install: "([^"]+)"/g);

for (const match of itemBlocks) {
  const id = match[1];
  const kind = match[2];
  const cmd = match[3];

  // Skip comments
  if (cmd.startsWith('#')) continue;

  // MCPs can have native install commands (npx @modelcontextprotocol/... or npm install -g @...)
  if (kind === 'mcp') {
    // Allow npx or npm install commands for MCPs
    if (!cmd.match(/^(npx|npm install)/)) {
      invalidInstallCommands.push({ id, kind, cmd });
    }
  } else {
    // Agents, skills, commands, settings must use @gicm/cli format
    if (!cmd.match(/^npx @gicm\/cli add (agent|skill|command|setting)\/[a-z0-9-]+$/)) {
      invalidInstallCommands.push({ id, kind, cmd });
    }
  }
}

if (invalidInstallCommands.length === 0) {
  console.log('   ✅ All install commands have correct format');
} else {
  console.log(`   ❌ Found ${invalidInstallCommands.length} invalid install commands`);
  invalidInstallCommands.slice(0, 5).forEach(item => {
    console.log(`      [${item.kind}/${item.id}] ${item.cmd.substring(0, 50)}...`);
  });
}
console.log('');

// Summary
console.log('═'.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('');

const issues = [
  { name: 'Slug mismatches', count: slugMismatches.length },
  { name: 'Missing files', count: missingFiles.length },
  { name: 'Duplicate slugs/IDs', count: duplicateSlugs.length + duplicateIds.length },
  { name: 'Invalid dependencies', count: invalidDeps.length },
  { name: 'Invalid install commands', count: invalidInstallCommands.length },
];

const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);

if (totalIssues === 0) {
  console.log('✅ ALL CHECKS PASSED! Registry is valid.');
  console.log(`   ${totalCount} items validated successfully`);
} else {
  console.log(`❌ FOUND ${totalIssues} ISSUES:`);
  issues.forEach(issue => {
    if (issue.count > 0) {
      console.log(`   ${issue.name}: ${issue.count}`);
    }
  });
}

console.log('');
console.log('═'.repeat(60));

process.exit(totalIssues > 0 ? 1 : 0);
