/**
 * Build Platform Assets
 * Copies platform-specific files from source dirs to /public/ for serving
 *
 * Source: .claude/, .gemini/, .openai/
 * Dest:   public/claude/, public/gemini/, public/openai/
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

interface CopyStats {
  files: number;
  dirs: number;
  errors: string[];
}

function copyDir(src: string, dest: string, stats: CopyStats): void {
  if (!fs.existsSync(src)) {
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    stats.dirs++;
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, stats);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
        stats.files++;
      } catch (err) {
        stats.errors.push(`Failed to copy ${srcPath}: ${err}`);
      }
    }
  }
}

function buildPlatformAssets() {
  console.log('=== Building Platform Assets ===\n');

  const platforms = [
    {
      name: 'claude',
      source: path.join(ROOT, '.claude'),
      dest: path.join(PUBLIC, 'claude'),
      folders: ['agents', 'skills', 'commands', 'mcp', 'settings']
    },
    {
      name: 'gemini',
      source: path.join(ROOT, '.gemini'),
      dest: path.join(PUBLIC, 'gemini'),
      folders: ['agents', 'skills', 'commands'] // No MCP for Gemini
    },
    {
      name: 'openai',
      source: path.join(ROOT, '.openai'),
      dest: path.join(PUBLIC, 'openai'),
      folders: ['agents', 'skills', 'commands'] // No MCP for OpenAI
    }
  ];

  const results: Record<string, CopyStats> = {};

  for (const platform of platforms) {
    console.log(`\n📦 Processing ${platform.name.toUpperCase()}...`);

    const stats: CopyStats = { files: 0, dirs: 0, errors: [] };

    // Ensure platform dest exists
    if (!fs.existsSync(platform.dest)) {
      fs.mkdirSync(platform.dest, { recursive: true });
      console.log(`  Created: ${platform.dest}`);
    }

    for (const folder of platform.folders) {
      const srcFolder = path.join(platform.source, folder);
      const destFolder = path.join(platform.dest, folder);

      if (fs.existsSync(srcFolder)) {
        console.log(`  Copying ${folder}/...`);
        copyDir(srcFolder, destFolder, stats);
      } else {
        console.log(`  ⚠ Skipping ${folder}/ (not found)`);
      }
    }

    results[platform.name] = stats;
    console.log(`  ✓ ${stats.files} files, ${stats.dirs} dirs`);

    if (stats.errors.length > 0) {
      console.log(`  ⚠ ${stats.errors.length} errors`);
      stats.errors.forEach(e => console.log(`    - ${e}`));
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  let totalFiles = 0;
  for (const [platform, stats] of Object.entries(results)) {
    console.log(`${platform}: ${stats.files} files`);
    totalFiles += stats.files;
  }
  console.log(`\nTotal: ${totalFiles} files deployed to /public/`);

  // Verify
  console.log('\n=== Verification ===');
  for (const platform of platforms) {
    for (const folder of platform.folders) {
      const destFolder = path.join(platform.dest, folder);
      if (fs.existsSync(destFolder)) {
        const count = fs.readdirSync(destFolder).length;
        console.log(`/public/${platform.name}/${folder}/: ${count} items`);
      }
    }
  }
}

// Run
buildPlatformAssets();
