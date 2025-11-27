/**
 * Multi-Platform Skills Converter
 * Converts Claude skills to Gemini and OpenAI formats
 */

import * as fs from 'fs';
import * as path from 'path';

const CLAUDE_SKILLS_DIR = path.join(__dirname, '../.claude/skills');
const GEMINI_SKILLS_DIR = path.join(__dirname, '../.gemini/skills');
const OPENAI_SKILLS_DIR = path.join(__dirname, '../.openai/skills');

// Create directories if they don't exist
[GEMINI_SKILLS_DIR, OPENAI_SKILLS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

function removeClaudeSpecificContent(content: string): string {
  let cleaned = content;

  // Remove Claude-specific sections
  cleaned = cleaned.replace(/## Available MCP Tools[\s\S]*?(?=## |# |$)/g, '');
  cleaned = cleaned.replace(/### Context7[\s\S]*?(?=### |## |# |$)/g, '');
  cleaned = cleaned.replace(/@context7\s+[^\n]+/g, '');

  // Remove references to Claude artifacts
  cleaned = cleaned.replace(/\bartifacts?\b/gi, 'outputs');
  cleaned = cleaned.replace(/\bthinking\s+blocks?\b/gi, 'reasoning');

  // Update model recommendations
  cleaned = cleaned.replace(/Claude Opus/gi, 'advanced model');
  cleaned = cleaned.replace(/Claude Sonnet/gi, 'standard model');
  cleaned = cleaned.replace(/Claude Haiku/gi, 'fast model');
  cleaned = cleaned.replace(/\bopus\b/gi, 'advanced model');
  cleaned = cleaned.replace(/\bsonnet\b/gi, 'standard model');
  cleaned = cleaned.replace(/\bhaiku\b/gi, 'fast model');

  return cleaned;
}

function addPlatformHeader(content: string, platform: 'gemini' | 'openai'): string {
  const platformConfig = {
    gemini: {
      model: 'Gemini 2.0 Flash / Gemini 3.0 Pro',
      others: 'Claude Opus, GPT-4o'
    },
    openai: {
      model: 'GPT-4o / GPT-4o-mini',
      others: 'Claude Opus, Gemini 3.0 Pro'
    }
  };

  const config = platformConfig[platform];
  const header = `> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: ${config.model} | Also compatible with: ${config.others}

`;

  // Insert header after the first # heading
  const firstHeadingMatch = content.match(/^(# .+\n)/);
  if (firstHeadingMatch) {
    return content.replace(firstHeadingMatch[0], firstHeadingMatch[0] + '\n' + header);
  }

  return header + content;
}

function copySkillDirectory(srcDir: string, destDir: string, platform: 'gemini' | 'openai') {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copySkillDirectory(srcPath, destPath, platform);
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(srcPath, 'utf-8');
      content = removeClaudeSpecificContent(content);
      content = addPlatformHeader(content, platform);
      fs.writeFileSync(destPath, content, 'utf-8');
    } else {
      // Copy non-markdown files as-is
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function processSkills() {
  const skillDirs = fs.readdirSync(CLAUDE_SKILLS_DIR);

  let converted = { gemini: 0, openai: 0, skipped: 0 };

  skillDirs.forEach(skillName => {
    const claudePath = path.join(CLAUDE_SKILLS_DIR, skillName);
    const geminiPath = path.join(GEMINI_SKILLS_DIR, skillName);
    const openaiPath = path.join(OPENAI_SKILLS_DIR, skillName);

    const stat = fs.statSync(claudePath);

    // Skip if already exists in both
    if (fs.existsSync(geminiPath) && fs.existsSync(openaiPath)) {
      converted.skipped++;
      return;
    }

    if (stat.isDirectory()) {
      // Copy directory with converted content
      if (!fs.existsSync(geminiPath)) {
        copySkillDirectory(claudePath, geminiPath, 'gemini');
        converted.gemini++;
      }
      if (!fs.existsSync(openaiPath)) {
        copySkillDirectory(claudePath, openaiPath, 'openai');
        converted.openai++;
      }
    } else if (skillName.endsWith('.md')) {
      // Handle standalone .md files
      let content = fs.readFileSync(claudePath, 'utf-8');

      if (!fs.existsSync(geminiPath)) {
        const geminiContent = addPlatformHeader(removeClaudeSpecificContent(content), 'gemini');
        fs.writeFileSync(geminiPath, geminiContent, 'utf-8');
        converted.gemini++;
      }
      if (!fs.existsSync(openaiPath)) {
        const openaiContent = addPlatformHeader(removeClaudeSpecificContent(content), 'openai');
        fs.writeFileSync(openaiPath, openaiContent, 'utf-8');
        converted.openai++;
      }
    }

    console.log(`✓ Converted: ${skillName}`);
  });

  console.log(`\n=== Skills Conversion Complete ===`);
  console.log(`Gemini skills created: ${converted.gemini}`);
  console.log(`OpenAI skills created: ${converted.openai}`);
  console.log(`Skipped (already exist): ${converted.skipped}`);
}

// Run
processSkills();
