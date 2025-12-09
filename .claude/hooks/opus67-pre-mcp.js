#!/usr/bin/env node
/**
 * OPUS 67 Pre-MCP Hook
 *
 * Triggers skill detection before ANY MCP tool is used.
 * Maps MCP tools to relevant domain skills for better context.
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

// MCP → Skills mapping
const mcpSkillMap = {
  // Blockchain
  solana: ["solana-anchor-expert", "rust-solana-patterns", "defi-data-analyst"],
  anchor: ["solana-anchor-expert", "anchor-macros-mastery", "pda-patterns"],
  chainstack: [
    "solana-anchor-expert",
    "rpc-optimization",
    "web3-infrastructure",
  ],
  solana_web3: [
    "solana-anchor-expert",
    "wallet-integration",
    "transaction-patterns",
  ],

  // Databases
  postgres: ["database-design-expert", "sql-optimization", "schema-patterns"],
  supabase: ["database-design-expert", "supabase-patterns", "realtime-db"],
  sqlite: ["database-design-expert", "embedded-db-patterns"],

  // GitHub/DevOps
  github: ["git-workflow-expert", "ci-cd-automation", "pr-review-patterns"],
  linear: ["project-management", "agile-patterns", "issue-tracking"],

  // Payments
  stripe: [
    "payment-integration",
    "security-best-practices",
    "subscription-patterns",
  ],

  // AI/Vector
  qdrant: ["vector-db-expert", "semantic-search", "embeddings-patterns"],
  memory: ["context-management", "learning-systems", "memory-patterns"],
  sequential_thinking: ["reasoning-patterns", "step-by-step-logic"],

  // Web Automation
  playwright: ["web-automation", "testing-patterns", "e2e-testing"],
  stagehand: ["web-automation", "browser-control", "scraping-patterns"],

  // Communication
  discord: ["bot-development", "api-patterns", "discord-js"],
  slack: ["bot-development", "api-patterns", "slack-sdk"],

  // Infrastructure
  docker: ["container-best-practices", "devops", "dockerfile-patterns"],

  // Search & Scraping
  firecrawl: ["web-scraping", "data-extraction", "crawling-patterns"],
  jina: ["web-scraping", "document-parsing", "ai-extraction"],
  tavily: ["web-search", "research-patterns", "data-gathering"],
  brave_search: ["web-search", "research-patterns"],

  // Knowledge
  notion: ["api-integration", "documentation-patterns", "notion-sdk"],
  context7: ["context-management", "documentation-retrieval"],

  // Graph
  neo4j: ["graph-database", "cypher-queries", "knowledge-graphs"],
  graphiti: ["graph-database", "knowledge-graphs", "entity-relations"],

  // OPUS 67 itself - skip to avoid recursion
  opus67: null,
  "gicm-dev": null,
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

function updateLastDetect(mcpName, skills) {
  try {
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    writeFileSync(
      lastDetectFile,
      JSON.stringify(
        {
          timestamp: Date.now(),
          source: "pre-mcp",
          mcp: mcpName,
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

function getMcpName() {
  // Try to extract MCP name from tool name pattern: mcp__<server>__<tool>
  const toolName = process.env.MCP_TOOL_NAME || "";
  const match = toolName.match(/^mcp__([^_]+)__/);
  if (match) return match[1];

  // Fallback: try stdin for tool input
  return "unknown";
}

try {
  const mcpName = getMcpName();

  // Skip OPUS 67 itself to avoid recursion
  if (mcpName === "opus67" || mcpName === "gicm-dev" || mcpName === "unknown") {
    process.exit(0);
  }

  if (!shouldRunDetection()) {
    process.exit(0);
  }

  const skills = mcpSkillMap[mcpName] || ["general-coding"];

  if (!skills) {
    // MCP marked as null - skip
    process.exit(0);
  }

  // Slim output: cache only, no context injection to avoid compaction issues
  // (Claude Code bug: thinking blocks + additionalContext = compaction failure)
  updateLastDetect(mcpName, skills);

  // Log activity
  const logDir = join(projectDir, ".claude", "logs");
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  appendFileSync(
    join(logDir, "opus67-pre-mcp.log"),
    `[${new Date().toISOString()}] MCP: ${mcpName} -> Skills: ${skills.join(", ")}\n`,
  );
} catch (err) {
  // Silent fail
  try {
    const logDir = join(projectDir, ".claude", "logs");
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
    appendFileSync(
      join(logDir, "hook-errors.log"),
      `[${new Date().toISOString()}] opus67-pre-mcp error: ${err.message}\n`,
    );
  } catch (e) {}
}
