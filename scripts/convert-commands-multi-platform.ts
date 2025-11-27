/**
 * Multi-Platform Commands Converter
 * Converts Claude commands to Gemini and OpenAI formats
 */

import * as fs from 'fs';
import * as path from 'path';

const CLAUDE_COMMANDS_DIR = path.join(__dirname, '../.claude/commands');
const GEMINI_COMMANDS_DIR = path.join(__dirname, '../.gemini/commands');
const OPENAI_COMMANDS_DIR = path.join(__dirname, '../.openai/commands');

// Create directories if they don't exist
[GEMINI_COMMANDS_DIR, OPENAI_COMMANDS_DIR].forEach(dir => {
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
  cleaned = cleaned.replace(/\bopus\b/gi, 'advanced');
  cleaned = cleaned.replace(/\bsonnet\b/gi, 'standard');
  cleaned = cleaned.replace(/\bhaiku\b/gi, 'fast');

  return cleaned;
}

function addPlatformHeader(content: string, platform: 'gemini' | 'openai'): string {
  const platformConfig = {
    gemini: {
      model: 'Gemini 2.0 Flash',
      others: 'Claude, GPT-4o'
    },
    openai: {
      model: 'GPT-4o',
      others: 'Claude, Gemini'
    }
  };

  const config = platformConfig[platform];
  const header = `> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: ${config.model} | Also compatible with: ${config.others}

`;

  // Insert header after the first # heading
  const firstHeadingMatch = content.match(/^(# .+\n)/);
  if (firstHeadingMatch) {
    return content.replace(firstHeadingMatch[0], firstHeadingMatch[0] + '\n' + header);
  }

  return header + content;
}

function processCommands() {
  const commandFiles = fs.readdirSync(CLAUDE_COMMANDS_DIR).filter(f => f.endsWith('.md'));

  let converted = { gemini: 0, openai: 0, skipped: 0 };

  commandFiles.forEach(filename => {
    const claudePath = path.join(CLAUDE_COMMANDS_DIR, filename);
    const geminiPath = path.join(GEMINI_COMMANDS_DIR, filename);
    const openaiPath = path.join(OPENAI_COMMANDS_DIR, filename);

    // Skip if already exists in both
    if (fs.existsSync(geminiPath) && fs.existsSync(openaiPath)) {
      converted.skipped++;
      return;
    }

    const content = fs.readFileSync(claudePath, 'utf-8');
    const cleanedContent = removeClaudeSpecificContent(content);

    // Convert to Gemini
    if (!fs.existsSync(geminiPath)) {
      const geminiContent = addPlatformHeader(cleanedContent, 'gemini');
      fs.writeFileSync(geminiPath, geminiContent, 'utf-8');
      converted.gemini++;
    }

    // Convert to OpenAI
    if (!fs.existsSync(openaiPath)) {
      const openaiContent = addPlatformHeader(cleanedContent, 'openai');
      fs.writeFileSync(openaiPath, openaiContent, 'utf-8');
      converted.openai++;
    }

    console.log(`✓ Converted: ${filename}`);
  });

  console.log(`\n=== Commands Conversion Complete ===`);
  console.log(`Gemini commands created: ${converted.gemini}`);
  console.log(`OpenAI commands created: ${converted.openai}`);
  console.log(`Skipped (already exist): ${converted.skipped}`);
}

// Run
processCommands();
