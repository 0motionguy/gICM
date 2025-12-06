#!/usr/bin/env node
/**
 * OPUS 67 Plugin - Auto-Detection Hook
 *
 * Runs on session start to:
 * 1. Detect project type
 * 2. Pre-load relevant skills
 * 3. Inject additionalContext for Claude
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const cacheDir = join(projectDir, '.claude', '.opus67-cache');

// Ensure cache directory exists
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true });
}

// Project type detection
function detectProjectType() {
  const indicators = {
    solana: ['Anchor.toml', 'programs/', 'Cargo.toml'],
    react: ['package.json', 'src/App.tsx', 'src/App.jsx'],
    nextjs: ['next.config.js', 'next.config.ts', 'next.config.mjs', 'app/', 'pages/'],
    node: ['package.json', 'index.js', 'src/index.ts'],
    python: ['requirements.txt', 'setup.py', 'pyproject.toml'],
    rust: ['Cargo.toml', 'src/lib.rs', 'src/main.rs'],
    go: ['go.mod', 'go.sum', 'main.go'],
    vue: ['vue.config.js', 'nuxt.config.js', 'src/App.vue'],
    docker: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml']
  };

  const detected = [];

  for (const [type, files] of Object.entries(indicators)) {
    for (const file of files) {
      if (existsSync(join(projectDir, file))) {
        detected.push(type);
        break;
      }
    }
  }

  return detected;
}

// Map project types to recommended skills
const skillMap = {
  solana: ['solana-anchor-expert', 'rust-solana-patterns', 'anchor-macros-mastery'],
  react: ['react-component-builder', 'typescript-patterns', 'tailwind-styling'],
  nextjs: ['nextjs-14-expert', 'app-router-patterns', 'server-components'],
  node: ['nodejs-backend', 'api-design-patterns', 'express-fastify'],
  python: ['python-best-practices', 'fastapi-patterns', 'django-expert'],
  rust: ['rust-advanced-patterns', 'memory-safety', 'async-rust'],
  go: ['go-patterns', 'go-concurrency', 'go-microservices'],
  vue: ['vue3-composition', 'nuxt-patterns', 'vue-state-management'],
  docker: ['docker-best-practices', 'container-security', 'docker-compose-patterns']
};

try {
  const projectTypes = detectProjectType();
  const relevantSkills = [];

  for (const type of projectTypes) {
    if (skillMap[type]) {
      relevantSkills.push(...skillMap[type]);
    }
  }

  const topSkills = relevantSkills.slice(0, 5);

  // Cache the context
  const cacheContext = {
    timestamp: new Date().toISOString(),
    projectDir,
    projectTypes,
    preloadedSkills: topSkills
  };

  writeFileSync(
    join(cacheDir, 'session-context.json'),
    JSON.stringify(cacheContext, null, 2)
  );

  // Output structured additionalContext for Claude Code
  const additionalContext = `
OPUS 67 AUTOPILOT ACTIVE
========================

Project: ${projectTypes.length > 0 ? projectTypes.join(', ') : 'Generic'}
Skills: ${topSkills.length > 0 ? topSkills.join(', ') : 'Use opus67_detect_skills'}

MANDATORY: Call opus67_detect_skills on every code task.
Available: /mcp__opus67__solana, /mcp__opus67__react, /mcp__opus67__typescript, etc.
`;

  console.log(JSON.stringify({ additionalContext: additionalContext.trim() }));

} catch (err) {
  // Silent fail - don't block session
  console.error(`[OPUS 67] Plugin auto-detect failed: ${err.message}`);
}
