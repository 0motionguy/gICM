#!/usr/bin/env node
/**
 * OPUS 67 Session Start Hook
 *
 * Detects project type and outputs a concise skill summary to stdout.
 * Claude Code captures stdout from hooks as additionalContext.
 *
 * Outputs ~50 tokens of useful context, not marketing banners.
 */
const { existsSync, appendFileSync, mkdirSync } = require("fs");
const { join } = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

function detectProjectType() {
  const indicators = {
    solana: ["Anchor.toml", "programs/", "Cargo.toml"],
    react: ["package.json", "src/App.tsx", "src/App.jsx"],
    nextjs: [
      "next.config.js",
      "next.config.ts",
      "next.config.mjs",
      "app/",
      "pages/",
    ],
    node: ["package.json", "index.js", "src/index.ts"],
    python: ["requirements.txt", "setup.py", "pyproject.toml"],
    rust: ["Cargo.toml", "src/lib.rs", "src/main.rs"],
    go: ["go.mod", "go.sum", "main.go"],
  };

  const detected = [];
  for (const [type, files] of Object.entries(indicators)) {
    for (const file of files) {
      try {
        if (existsSync(join(projectDir, file))) {
          detected.push(type);
          break;
        }
      } catch (e) {
        // Ignore
      }
    }
  }
  return detected;
}

const skillMap = {
  solana: ["solana-anchor-mastery", "bonding-curve-mathematics"],
  react: ["react-performance-optimization", "typescript-advanced-types"],
  nextjs: ["nextjs-app-router-patterns", "tailwind-design-system"],
  node: ["api-rate-limiting", "error-handling-patterns"],
  python: ["database-migration-strategies"],
  rust: ["solana-program-optimization"],
  go: ["grpc-communication", "caching-strategies"],
};

try {
  const types = detectProjectType();
  const skills = [];
  for (const type of types) {
    if (skillMap[type]) skills.push(...skillMap[type]);
  }
  const topSkills = [...new Set(skills)].slice(0, 5);

  // Output to stdout — Claude Code captures this as context
  // Keep it concise: ~50 tokens, no ASCII art, no demands
  const output = [
    `OPUS 67: ${types.join(", ") || "generic"} project detected.`,
    topSkills.length > 0
      ? `Relevant skills: ${topSkills.join(", ")}.`
      : "",
    `Use opus67_detect_skills or opus67_skillSummaries to load domain expertise.`,
  ]
    .filter(Boolean)
    .join(" ");

  console.log(output);

  // Minimal debug log (no cache files)
  const logDir = join(projectDir, ".claude", "logs");
  try {
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
    appendFileSync(
      join(logDir, "opus67-autodetect.log"),
      `[${new Date().toISOString()}] ${types.join(",") || "generic"} -> ${topSkills.join(",") || "base"}\n`
    );
  } catch (e) {
    // Silent
  }
} catch (err) {
  // Silent fail — don't break session start
}
