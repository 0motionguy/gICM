/**
 * Multi-Platform Agent Converter
 * Converts Claude agents to Gemini and OpenAI formats
 */

import * as fs from 'fs';
import * as path from 'path';

const CLAUDE_AGENTS_DIR = path.join(__dirname, '../.claude/agents');
const GEMINI_AGENTS_DIR = path.join(__dirname, '../.gemini/agents');
const OPENAI_AGENTS_DIR = path.join(__dirname, '../.openai/agents');

// Create directories if they don't exist
[GEMINI_AGENTS_DIR, OPENAI_AGENTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

interface AgentFrontmatter {
  name: string;
  description: string;
  tools?: string;
  model?: string;
  author?: string;
  version?: string;
}

function parseFrontmatter(content: string): { frontmatter: AgentFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: { name: '', description: '' }, body: content };
  }

  const frontmatterLines = match[1].split('\n');
  const frontmatter: AgentFrontmatter = { name: '', description: '' };

  frontmatterLines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      (frontmatter as any)[key.trim()] = value;
    }
  });

  return { frontmatter, body: match[2] };
}

function removeClaudeSpecificContent(body: string): string {
  let cleaned = body;

  // Remove Claude-specific sections
  cleaned = cleaned.replace(/## Available MCP Tools[\s\S]*?(?=## |# |$)/g, '');
  cleaned = cleaned.replace(/### Context7[\s\S]*?(?=### |## |# |$)/g, '');
  cleaned = cleaned.replace(/@context7\s+[^\n]+/g, '');

  // Remove references to Claude artifacts
  cleaned = cleaned.replace(/\bartifacts?\b/gi, 'outputs');
  cleaned = cleaned.replace(/\bthinking\s+blocks?\b/gi, 'reasoning');

  // Update model recommendations
  cleaned = cleaned.replace(/Model Recommendation:.*Claude Opus/gi, 'Model Recommendation: Gemini 3.0 Pro or GPT-4o');
  cleaned = cleaned.replace(/\bopus\b/gi, 'advanced model');
  cleaned = cleaned.replace(/\bsonnet\b/gi, 'standard model');
  cleaned = cleaned.replace(/\bhaiku\b/gi, 'fast model');

  return cleaned;
}

function convertToGemini(filename: string, frontmatter: AgentFrontmatter, body: string): string {
  const cleanBody = removeClaudeSpecificContent(body);

  // Create Gemini frontmatter
  const geminiFrontmatter = `---
name: ${frontmatter.name}
description: ${frontmatter.description}
author: gICM
version: 1.0.0
model: gemini-3.0-pro
platforms: [gemini, claude, openai]
---`;

  // Add Gemini-specific header
  const geminiHeader = `
> **Universal Agent**: This agent works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o

`;

  return geminiFrontmatter + '\n' + geminiHeader + cleanBody;
}

function convertToOpenAI(filename: string, frontmatter: AgentFrontmatter, body: string): string {
  const cleanBody = removeClaudeSpecificContent(body);

  // Create OpenAI frontmatter (GPTs-style)
  const openaiFrontmatter = `---
name: ${frontmatter.name}
description: ${frontmatter.description}
author: gICM
version: 1.0.0
model: gpt-4o
platforms: [openai, claude, gemini]
capabilities:
  - code_interpreter
  - web_browsing
---`;

  // Add OpenAI-specific header
  const openaiHeader = `
> **Universal Agent**: This agent works across OpenAI, Claude, and Gemini platforms.
> Optimized for: GPT-4o | Also compatible with: Claude Opus, Gemini 3.0 Pro

`;

  return openaiFrontmatter + '\n' + openaiHeader + cleanBody;
}

function processAgents() {
  const claudeFiles = fs.readdirSync(CLAUDE_AGENTS_DIR).filter(f => f.endsWith('.md'));

  let converted = { gemini: 0, openai: 0, skipped: 0 };

  claudeFiles.forEach(filename => {
    const claudePath = path.join(CLAUDE_AGENTS_DIR, filename);
    const geminiPath = path.join(GEMINI_AGENTS_DIR, filename);
    const openaiPath = path.join(OPENAI_AGENTS_DIR, filename);

    // Skip if already exists in Gemini
    if (fs.existsSync(geminiPath)) {
      converted.skipped++;
      return;
    }

    const content = fs.readFileSync(claudePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    // Convert to Gemini
    const geminiContent = convertToGemini(filename, frontmatter, body);
    fs.writeFileSync(geminiPath, geminiContent, 'utf-8');
    converted.gemini++;

    // Convert to OpenAI
    const openaiContent = convertToOpenAI(filename, frontmatter, body);
    fs.writeFileSync(openaiPath, openaiContent, 'utf-8');
    converted.openai++;

    console.log(`✓ Converted: ${filename}`);
  });

  console.log(`\n=== Conversion Complete ===`);
  console.log(`Gemini agents created: ${converted.gemini}`);
  console.log(`OpenAI agents created: ${converted.openai}`);
  console.log(`Skipped (already exist): ${converted.skipped}`);
}

// Run
processAgents();
