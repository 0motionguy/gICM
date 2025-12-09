#!/usr/bin/env node
/**
 * OPUS 67 Pre-Agent Hook
 *
 * Triggers skill detection before Task tool spawns an agent.
 * Maps agent types to relevant domain skills for better context.
 */
const {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  appendFileSync,
} = require("fs");
const { join } = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const cacheDir = join(projectDir, ".claude", ".opus67-cache");
const lastDetectFile = join(cacheDir, "last-detect.json");

// Agent type → Skills mapping (covering all 107 agents)
const agentSkillMap = {
  // Core Development
  "general-purpose": ["typescript-patterns", "code-review", "best-practices"],
  Explore: ["codebase-navigation", "search-patterns", "code-analysis"],
  Plan: ["architecture-design", "planning-patterns", "requirements-analysis"],

  // JavaScript/TypeScript
  "javascript-typescript:javascript-pro": [
    "javascript-patterns",
    "nodejs-expert",
    "async-patterns",
  ],
  "javascript-typescript:typescript-pro": [
    "typescript-patterns",
    "type-safety",
    "generics-expert",
  ],

  // API Development
  "api-scaffolding:backend-architect": [
    "api-design",
    "microservices",
    "system-architecture",
  ],
  "api-scaffolding:django-pro": [
    "django-expert",
    "python-patterns",
    "orm-optimization",
  ],
  "api-scaffolding:fastapi-pro": [
    "fastapi-expert",
    "async-python",
    "pydantic-patterns",
  ],
  "api-scaffolding:graphql-architect": [
    "graphql-expert",
    "schema-design",
    "federation",
  ],

  // Security
  "security-scanning:security-auditor": [
    "security-audit",
    "vulnerability-detection",
    "owasp-patterns",
  ],

  // CI/CD
  "cicd-automation:cloud-architect": [
    "cloud-infrastructure",
    "terraform",
    "aws-patterns",
  ],
  "cicd-automation:deployment-engineer": [
    "ci-cd-automation",
    "github-actions",
    "deployment-patterns",
  ],
  "cicd-automation:devops-troubleshooter": [
    "debugging-expert",
    "incident-response",
    "monitoring",
  ],
  "cicd-automation:kubernetes-architect": [
    "kubernetes-expert",
    "helm-charts",
    "gitops",
  ],
  "cicd-automation:terraform-specialist": [
    "terraform-expert",
    "iac-patterns",
    "state-management",
  ],

  // Full Stack
  "full-stack-orchestration:performance-engineer": [
    "performance-optimization",
    "profiling",
    "caching",
  ],
  "full-stack-orchestration:test-automator": [
    "testing-patterns",
    "e2e-testing",
    "test-automation",
  ],

  // Blockchain/Crypto Agents
  "solana-anchor-expert": [
    "solana-anchor-expert",
    "rust-solana-patterns",
    "pda-patterns",
  ],
  "bonding-curve-master": ["bonding-curve-master", "defi-math", "amm-patterns"],
  "evm-security-auditor": [
    "evm-security",
    "solidity-audit",
    "vulnerability-detection",
  ],
  "smart-contract-auditor": [
    "smart-contract-audit",
    "security-patterns",
    "formal-verification",
  ],
  "defi-integration-architect": [
    "defi-integration",
    "protocol-patterns",
    "yield-optimization",
  ],
  "whale-tracker": ["on-chain-analytics", "wallet-tracking", "trading-signals"],

  // ICM Trading Agents
  "icm-analyst": ["token-analysis", "market-research", "risk-assessment"],
  "sniper-bot": ["trading-automation", "mev-patterns", "speed-optimization"],
  "rug-detector": [
    "security-analysis",
    "contract-verification",
    "scam-detection",
  ],
  "sentiment-analyzer": ["social-analysis", "nlp-patterns", "market-sentiment"],

  // Frontend
  "frontend-fusion-engine": [
    "react-patterns",
    "nextjs-expert",
    "ui-components",
  ],
  "accessibility-advocate": [
    "accessibility-expert",
    "wcag-compliance",
    "aria-patterns",
  ],

  // Database
  "database-schema-oracle": [
    "database-design",
    "schema-optimization",
    "query-patterns",
  ],
  "data-engineering-specialist": [
    "data-pipelines",
    "etl-patterns",
    "analytics",
  ],

  // Documentation
  "technical-writer-pro": [
    "documentation-patterns",
    "api-docs",
    "technical-writing",
  ],
  "readme-architect": [
    "readme-patterns",
    "project-documentation",
    "markdown-expert",
  ],

  // Testing
  "test-automation-engineer": [
    "testing-patterns",
    "jest-vitest",
    "test-coverage",
  ],
  "qa-stress-tester": [
    "load-testing",
    "performance-testing",
    "chaos-engineering",
  ],

  // Default fallback
  default: ["general-coding", "best-practices"],
};

// Rate limit: only run detection every 30 seconds
function shouldRunDetection() {
  try {
    if (!existsSync(lastDetectFile)) return true;
    const lastDetect = JSON.parse(readFileSync(lastDetectFile, "utf8"));
    const elapsed = Date.now() - lastDetect.timestamp;
    return elapsed > 30000;
  } catch (e) {
    return true;
  }
}

function updateLastDetect(agentType, skills) {
  try {
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    writeFileSync(
      lastDetectFile,
      JSON.stringify(
        {
          timestamp: Date.now(),
          source: "pre-agent",
          agent: agentType,
          skills,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    // Ignore
  }
}

// Read tool input from stdin
function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
    // Timeout after 100ms if no stdin
    setTimeout(() => resolve(data), 100);
  });
}

async function main() {
  try {
    if (!shouldRunDetection()) {
      process.exit(0);
    }

    // Try to get agent type from stdin (Task tool input)
    const stdinData = await readStdin();
    let agentType = "general-purpose";
    let taskPrompt = "";

    try {
      if (stdinData) {
        const input = JSON.parse(stdinData);
        agentType =
          input.subagent_type || input.agent_type || "general-purpose";
        taskPrompt = input.prompt || input.description || "";
      }
    } catch (e) {
      // Use default
    }

    // Find matching skills
    let skills = agentSkillMap[agentType];

    // Try partial match if exact match not found
    if (!skills) {
      const partialMatch = Object.keys(agentSkillMap).find(
        (key) =>
          agentType.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(agentType.toLowerCase()),
      );
      skills = partialMatch
        ? agentSkillMap[partialMatch]
        : agentSkillMap["default"];
    }

    const hookOutput = {
      additionalContext: `
┌─────────────────────────────────────────────────────────────────────────────┐
│ OPUS 67: Agent Spawning - ${agentType.substring(0, 48).padEnd(48)}│
├─────────────────────────────────────────────────────────────────────────────┤
│ Pre-loading Skills:                                                         │
│ ${skills
        .map((s) => `- ${s}`)
        .join("\n│ ")
        .padEnd(73)}│
│                                                                             │
│ The spawned agent will benefit from these skills being loaded.              │
└─────────────────────────────────────────────────────────────────────────────┘
`.trim(),
    };

    console.log(JSON.stringify(hookOutput));
    updateLastDetect(agentType, skills);

    // Log activity
    const logDir = join(projectDir, ".claude", "logs");
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    appendFileSync(
      join(logDir, "opus67-pre-agent.log"),
      `[${new Date().toISOString()}] Agent: ${agentType} -> Skills: ${skills.join(", ")}\n`,
    );
  } catch (err) {
    // Silent fail
    try {
      const logDir = join(projectDir, ".claude", "logs");
      if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
      appendFileSync(
        join(logDir, "hook-errors.log"),
        `[${new Date().toISOString()}] opus67-pre-agent error: ${err.message}\n`,
      );
    } catch (e) {}
  }
}

main();
