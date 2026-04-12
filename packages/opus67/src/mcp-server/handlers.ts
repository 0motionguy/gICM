/**
 * OPUS 67 MCP Server Handlers
 * Implements all tool call handlers
 */

import type { Skill, MCPConnection, Mode, ToolArgs } from "./types.js";
import { loadSkillDefinition } from "./registry.js";
import { VERSION } from "../version.js";
import {
  getUnifiedMemory,
  initializeUnifiedMemory,
  type UnifiedMemory,
  type WriteType,
} from "../memory/unified/index.js";
import {
  ToolAnalytics,
  createToolAnalytics,
} from "../analytics/tool-tracker.js";

// Tool analytics singleton (lazily initialized)
let analyticsInstance: ToolAnalytics | null = null;

function getAnalytics(): ToolAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = createToolAnalytics();
  }
  return analyticsInstance;
}

// Memory singleton (lazily initialized)
let memoryInstance: UnifiedMemory | null = null;

async function getMemory(): Promise<UnifiedMemory> {
  if (!memoryInstance) {
    memoryInstance = getUnifiedMemory();
    if (!memoryInstance) {
      memoryInstance = await initializeUnifiedMemory();
    }
  }
  return memoryInstance;
}

export interface HandlerContext {
  skills: Skill[];
  mcpConnections: MCPConnection[];
  modes: Mode[];
  packageRoot: string;
}

export interface HandlerResult {
  [x: string]: unknown;
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Generate the boot screen
 */
export function handleBoot(ctx: HandlerContext): HandlerResult {
  const bootScreen = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ██████╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ███████╗                  ║
║  ██╔═══██╗██╔══██╗██║   ██║██╔════╝    ██╔════╝ ╚════██║                  ║
║  ██║   ██║██████╔╝██║   ██║███████╗    ███████╗     ██╔╝                  ║
║  ██║   ██║██╔═══╝ ██║   ██║╚════██║    ██╔═══██╗   ██╔╝                   ║
║  ╚██████╔╝██║     ╚██████╔╝███████║    ╚██████╔╝   ██║                    ║
║   ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝     ╚═════╝    ╚═╝                    ║
║                                                                           ║
║              Skill Orchestration Engine v${VERSION.padEnd(18)}              ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   LOADED CAPABILITIES                                                     ║
║   ───────────────────────────────────────────────────────────────────     ║
║   Skills:  ${String(ctx.skills.length).padEnd(4)} specialist prompts                                  ║
║   MCPs:    ${String(ctx.mcpConnections.length).padEnd(4)} data connections                                     ║
║   Modes:   ${String(ctx.modes.length).padEnd(4)} operating modes                                     ║
║                                                                           ║
║   READY TO ENHANCE CLAUDE CODE                                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

Use opus67_get_skill to load a specialist skill.
Use opus67_detect_skills to auto-detect relevant skills for your task.
Use opus67_get_context for full task context enhancement.
`;
  return { content: [{ type: "text", text: bootScreen }] };
}

/**
 * Get a specific skill by ID
 */
export function handleGetSkill(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const skillId = args.skill_id!;
  const skill = ctx.skills.find((s) => s.id === skillId);

  if (!skill) {
    return {
      content: [
        {
          type: "text",
          text: `Skill "${skillId}" not found. Use opus67_list_skills to see available skills.`,
        },
      ],
    };
  }

  const fullPrompt = loadSkillDefinition(skillId, ctx.packageRoot);

  const output = `
# ${skill.name}

**ID:** ${skill.id}
**Category:** ${skill.category}
**Tokens:** ${skill.tokens}
**Priority:** ${skill.priority}

## Triggers
- Extensions: ${skill.triggers?.extensions?.join(", ") || "any"}
- Keywords: ${skill.triggers?.keywords?.join(", ") || "any"}

## Capabilities
${skill.capabilities?.map((c) => `- ${c}`).join("\n") || "General assistance"}

${fullPrompt ? `## Full Skill Prompt\n\n${fullPrompt}` : ""}
`;
  return { content: [{ type: "text", text: output }] };
}

/**
 * List all skills
 */
export function handleListSkills(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const category = args.category;
  const filtered = category
    ? ctx.skills.filter(
        (s) => (s.category ?? "").toLowerCase() === category.toLowerCase()
      )
    : ctx.skills;

  const grouped: Record<string, Skill[]> = {};
  for (const skill of filtered) {
    const cat = skill.category ?? "uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(skill);
  }

  let output = `# OPUS 67 Skills (${filtered.length} total)\n\n`;

  for (const [cat, catSkills] of Object.entries(grouped)) {
    output += `## ${cat}\n`;
    for (const skill of catSkills) {
      const priority = (skill.priority ?? 5) <= 2 ? "⭐" : "  ";
      output += `${priority} **${skill.id}** - ${skill.name} (${skill.tokens ?? 0} tokens)\n`;
    }
    output += "\n";
  }

  return { content: [{ type: "text", text: output }] };
}

/**
 * Detect relevant skills
 */
export function handleDetectSkills(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const { query = "", extensions = [] } = args;
  const detected: Skill[] = [];
  const queryLower = query.toLowerCase();

  for (const skill of ctx.skills) {
    let score = 0;
    if (extensions.length > 0 && skill.triggers?.extensions) {
      for (const ext of extensions) {
        if (skill.triggers.extensions.includes(ext)) score += 10;
      }
    }
    if (skill.triggers?.keywords) {
      for (const kw of skill.triggers.keywords) {
        if (queryLower.includes(kw.toLowerCase())) score += 5;
      }
    }
    if (skill.capabilities) {
      for (const cap of skill.capabilities) {
        if (queryLower.includes(cap.toLowerCase().split(" ")[0])) score += 2;
      }
    }
    if (score > 0) detected.push({ ...skill, priority: score });
  }

  detected.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const top = detected.slice(0, 5);

  let output = `# Detected Skills for: "${query}"\n\n`;
  if (top.length === 0) {
    output += "No specific skills detected. Using general capabilities.\n";
  } else {
    output += `Found ${top.length} relevant skills:\n\n`;
    for (const skill of top) {
      output += `- **${skill.id}** (${skill.name}) - Score: ${skill.priority}\n`;
    }
    output += `\nUse \`opus67_get_skill\` to load the full skill prompt.\n`;
  }

  return { content: [{ type: "text", text: output }] };
}

/**
 * Get mode details
 */
export function handleGetMode(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const modeId = args.mode_id!;
  const mode = ctx.modes.find((m) => m.id === modeId);

  if (!mode) {
    return {
      content: [
        {
          type: "text",
          text: `Mode "${modeId}" not found. Available: ${ctx.modes.map((m) => m.id).join(", ")}`,
        },
      ],
    };
  }

  const output = `
# ${mode.icon} ${mode.name} Mode

**ID:** ${mode.id}
**Description:** ${mode.description}
**Token Budget:** ${mode.token_budget}
**Thinking Depth:** ${mode.thinking_depth}
`;
  return { content: [{ type: "text", text: output }] };
}

/**
 * List all modes
 */
export function handleListModes(ctx: HandlerContext): HandlerResult {
  let output = "# OPUS 67 Operating Modes\n\n";
  for (const mode of ctx.modes) {
    output += `${mode.icon} **${mode.id.toUpperCase()}** - ${mode.description}\n`;
  }
  return { content: [{ type: "text", text: output }] };
}

/**
 * List MCP connections
 */
export function handleListMcps(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const category = args.category;
  const filtered = category
    ? ctx.mcpConnections.filter(
        (m) => m.category?.toLowerCase() === category.toLowerCase()
      )
    : ctx.mcpConnections;

  let output = `# OPUS 67 MCP Connections (${filtered.length})\n\n`;

  const grouped: Record<string, MCPConnection[]> = {};
  for (const mcp of filtered) {
    const cat = mcp.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(mcp);
  }

  for (const [cat, mcps] of Object.entries(grouped)) {
    output += `## ${cat}\n`;
    for (const mcp of mcps) {
      output += `- **${mcp.id}** - ${mcp.name}\n`;
    }
    output += "\n";
  }

  return { content: [{ type: "text", text: output }] };
}

/**
 * Get enhanced context for a task
 */
export function handleGetContext(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const { task = "", files = [] } = args;
  const extensions = [...new Set(files.map((f) => "." + f.split(".").pop()))];
  const queryLower = task.toLowerCase();

  // Detect skills
  const detectedSkills: Skill[] = [];
  for (const skill of ctx.skills) {
    let score = 0;
    if (extensions.length > 0 && skill.triggers?.extensions) {
      for (const ext of extensions) {
        if (skill.triggers.extensions.includes(ext)) score += 10;
      }
    }
    if (skill.triggers?.keywords) {
      for (const kw of skill.triggers.keywords) {
        if (queryLower.includes(kw.toLowerCase())) score += 5;
      }
    }
    if (score > 0) detectedSkills.push({ ...skill, priority: score });
  }
  detectedSkills.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const topSkills = detectedSkills.slice(0, 3);

  // Detect mode
  let suggestedMode = "build";
  if (queryLower.includes("review") || queryLower.includes("audit"))
    suggestedMode = "review";
  else if (queryLower.includes("architect") || queryLower.includes("design"))
    suggestedMode = "architect";
  else if (queryLower.includes("debug") || queryLower.includes("fix"))
    suggestedMode = "debug";
  else if (queryLower.includes("scan") || queryLower.includes("find"))
    suggestedMode = "scan";

  const mode = ctx.modes.find((m) => m.id === suggestedMode) || ctx.modes[0];

  const output = `
# OPUS 67 Context Enhancement

## Task
${task}

## Suggested Mode
${mode?.icon || "🔧"} **${(mode?.id || "build").toUpperCase()}** - ${mode?.description || ""}
Token Budget: ${mode?.token_budget || 10000}

## Detected Skills
${
  topSkills.length > 0
    ? topSkills.map((s) => `- **${s.id}** - ${s.name}`).join("\n")
    : "No specific skills detected - using general capabilities"
}

## Active Files
${files.length > 0 ? files.map((f) => `- ${f}`).join("\n") : "None specified"}

---
*Use \`opus67_get_skill <id>\` to load full skill prompts*
`;
  return { content: [{ type: "text", text: output }] };
}

/**
 * Get OPUS 67 status
 */
export function handleStatus(ctx: HandlerContext): HandlerResult {
  const output = `
# OPUS 67 Status

- **Version:** ${VERSION}
- **Skills Loaded:** ${ctx.skills.length}
- **MCP Connections:** ${ctx.mcpConnections.length}
- **Operating Modes:** ${ctx.modes.length}
- **Status:** Active and ready

## Categories
- Blockchain: ${ctx.skills.filter((s) => s.category === "blockchain").length} skills
- Frontend: ${ctx.skills.filter((s) => s.category === "frontend").length} skills
- Backend: ${ctx.skills.filter((s) => s.category === "backend").length} skills
- DevOps: ${ctx.skills.filter((s) => s.category === "devops").length} skills
- Other: ${ctx.skills.filter((s) => !["blockchain", "frontend", "backend", "devops"].includes(s.category ?? "")).length} skills
`;
  return { content: [{ type: "text", text: output }] };
}

// =============================================================================
// MEMORY HANDLERS
// =============================================================================

/**
 * Query unified memory
 */
export async function handleQueryMemory(
  args: ToolArgs
): Promise<HandlerResult> {
  try {
    const memory = await getMemory();
    const results = await memory.query({
      query: args.query!,
      type: args.type as any,
      limit: args.limit ?? 10,
    });

    let output = `# Memory Query Results\n\n`;
    output += `**Query:** ${args.query}\n`;
    output += `**Results:** ${results.length}\n\n`;

    if (results.length === 0) {
      output += `No matching memories found.\n`;
    } else {
      for (const result of results) {
        output += `### ${result.metadata?.key || result.id}\n`;
        output += `**Source:** ${result.source} | **Score:** ${result.score.toFixed(2)}\n`;
        output += `${result.content.slice(0, 200)}${result.content.length > 200 ? "..." : ""}\n\n`;
      }
    }

    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Memory query failed: ${error}` }],
      isError: true,
    };
  }
}

/**
 * Multi-hop reasoning query
 */
export async function handleMultiHopQuery(
  args: ToolArgs
): Promise<HandlerResult> {
  try {
    const memory = await getMemory();
    const results = await memory.multiHopQuery(args.query!, args.maxHops ?? 3);

    let output = `# Multi-Hop Query Results\n\n`;
    output += `**Query:** ${args.query}\n`;
    output += `**Max Hops:** ${args.maxHops ?? 3}\n`;
    output += `**Results:** ${results.length}\n\n`;

    if (results.length === 0) {
      output += `No reasoning chain found.\n`;
    } else {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        output += `### Hop ${i + 1}: ${result.metadata?.key || result.id}\n`;
        output += `**Source:** ${result.source}\n`;
        output += `${result.content.slice(0, 300)}${result.content.length > 300 ? "..." : ""}\n\n`;
      }
    }

    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Multi-hop query failed: ${error}` }],
      isError: true,
    };
  }
}

/**
 * Write to unified memory
 */
export async function handleWriteMemory(
  args: ToolArgs
): Promise<HandlerResult> {
  try {
    const memory = await getMemory();
    const writeType = args.type as WriteType;
    const result = await memory.write({
      content: args.content!,
      type: writeType,
      key: args.key,
    });

    const idList = Object.values(result.ids).join(", ");
    const output = `# Memory Written\n\n**Type:** ${args.type}\n**Key:** ${args.key || "(auto-generated)"}\n**Status:** ${result.success ? "Success" : "Failed"}\n**IDs:** ${idList || "None"}`;

    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Memory write failed: ${error}` }],
      isError: true,
    };
  }
}

/**
 * Get memory statistics
 */
export async function handleMemoryStats(): Promise<HandlerResult> {
  try {
    const memory = await getMemory();
    const stats = await memory.getStats();

    let output = `# Unified Memory Statistics\n\n`;
    output += `## Sources\n\n`;

    for (const [source, info] of Object.entries(stats.sources)) {
      if (info.available) {
        output += `- **${source}**: ${info.count} memories`;
        if (info.lastSync) {
          output += ` (last sync: ${new Date(info.lastSync).toLocaleString()})`;
        }
        output += `\n`;
      }
    }

    output += `\n## Totals\n\n`;
    output += `- **Total Memories:** ${stats.totalMemories}\n`;
    output += `- **Neo4j:** ${stats.backends.neo4j ? "Connected" : "Local mode"}\n`;
    output += `- **HMLR (Multi-hop):** ${stats.backends.hmlr ? "Enabled" : "Disabled"}\n`;

    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Memory stats failed: ${error}` }],
      isError: true,
    };
  }
}

// =============================================================================
// TOOL ANALYTICS HANDLERS
// =============================================================================

/**
 * Get tool performance metrics
 */
export function handleToolMetrics(args: ToolArgs): HandlerResult {
  const analytics = getAnalytics();
  const toolId = args.tool_id as string | undefined;

  if (toolId) {
    const metrics = analytics.getMetrics(toolId);
    const recommendations = analytics.getRecommendations(toolId);
    const output = [
      `## Tool Metrics: ${toolId}`,
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total Calls | ${metrics.totalCalls} |`,
      `| Success Rate | ${(metrics.successRate * 100).toFixed(1)}% |`,
      `| Avg Latency | ${metrics.avgLatency.toFixed(0)}ms |`,
      `| p50 Latency | ${metrics.p50Latency.toFixed(0)}ms |`,
      `| p95 Latency | ${metrics.p95Latency.toFixed(0)}ms |`,
      `| p99 Latency | ${metrics.p99Latency.toFixed(0)}ms |`,
      `| Health | ${metrics.health} |`,
      `| Trend | ${metrics.trend} |`,
      `| Last Error | ${metrics.lastError || "none"} |`,
      "",
      "### Recommendations",
      ...recommendations.map((r) => `- ${r}`),
    ].join("\n");

    return { content: [{ type: "text", text: output }] };
  }

  // All tools
  const allMetrics = analytics.getAllMetrics();
  if (allMetrics.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "No tool metrics recorded yet. Metrics are collected as tools are used.",
        },
      ],
    };
  }

  const output = [
    `## Tool Metrics (${allMetrics.length} tools tracked)`,
    "",
    `| Tool | Calls | Success | Avg Latency | Health | Trend |`,
    `|------|-------|---------|-------------|--------|-------|`,
    ...allMetrics.map(
      (m) =>
        `| ${m.toolId} | ${m.totalCalls} | ${(m.successRate * 100).toFixed(0)}% | ${m.avgLatency.toFixed(0)}ms | ${m.health} | ${m.trend} |`
    ),
  ].join("\n");

  return { content: [{ type: "text", text: output }] };
}

/**
 * List unhealthy/degraded tools
 */
export function handleUnhealthyTools(): HandlerResult {
  const analytics = getAnalytics();
  const degraded = analytics.getUnhealthyTools("degraded");

  if (degraded.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "All tracked tools are healthy. No degraded or unhealthy tools detected.",
        },
      ],
    };
  }

  const output = [
    `## Unhealthy Tools (${degraded.length} found)`,
    "",
    ...degraded.map((m) => {
      const recommendations = analytics.getRecommendations(m.toolId);
      return [
        `### ${m.toolId} (${m.health})`,
        `- Success Rate: ${(m.successRate * 100).toFixed(1)}%`,
        `- Avg Latency: ${m.avgLatency.toFixed(0)}ms`,
        `- Trend: ${m.trend}`,
        `- Last Error: ${m.lastError || "none"}`,
        "- Recommendations:",
        ...recommendations.map((r) => `  - ${r}`),
        "",
      ].join("\n");
    }),
  ].join("\n");

  return { content: [{ type: "text", text: output }] };
}

/**
 * Get skill summaries (progressive disclosure - compact format)
 */
export function handleSkillSummaries(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const category = args.category as string | undefined;

  let skills = ctx.skills;
  if (category) {
    skills = skills.filter(
      (s) => s.category?.toLowerCase() === category.toLowerCase()
    );
  }

  const summaries = skills.map((s) => {
    const desc =
      s.description?.slice(0, 80) || s.name.replace(/-/g, " ");
    return `- **${s.name}** — ${desc}`;
  });

  const output = [
    `## Skill Summaries (${summaries.length} skills)`,
    category ? `Category: ${category}` : "All categories",
    "",
    ...summaries,
    "",
    "Use `opus67_get_skill` with a skill_id to load the full content.",
  ].join("\n");

  return { content: [{ type: "text", text: output }] };
}

/**
 * Get session token budget and usage info
 */
export function handleTokenBudget(
  ctx: HandlerContext,
  args: ToolArgs
): HandlerResult {
  const mode = (args.mode as string) || "auto";
  const modeConfig = ctx.modes.find(
    (m) => m.id.toLowerCase() === mode.toLowerCase()
  );

  const budgets: Record<string, string> = {
    light: "8,000 tokens",
    scan: "8,000 tokens",
    vibe: "16,000 tokens",
    review: "16,000 tokens",
    build: "32,000 tokens",
    debug: "32,000 tokens",
    architect: "64,000 tokens",
    think: "64,000 tokens",
    ultra: "100,000 tokens",
    auto: "Variable (based on complexity)",
  };

  const output = [
    `## Token Budget`,
    "",
    `| Mode | Budget |`,
    `|------|--------|`,
    ...Object.entries(budgets).map(
      ([m, b]) => `| ${m === mode ? `**${m}**` : m} | ${m === mode ? `**${b}**` : b} |`
    ),
    "",
    `Current mode: **${mode}** → ${budgets[mode] || "Unknown"}`,
    "",
    `### Skill Token Costs`,
    `| Skill | Est. Tokens |`,
    `|-------|-------------|`,
    ...ctx.skills
      .filter((s) => s.token_cost)
      .slice(0, 10)
      .map((s) => `| ${s.name} | ~${s.token_cost?.toLocaleString()} |`),
    "",
    `Total skills available: ${ctx.skills.length}`,
  ].join("\n");

  return { content: [{ type: "text", text: output }] };
}

// =============================================================================
// PHASE 3: NATIVE INTEGRATIONS
// =============================================================================

const OBSIDIAN_URL = "http://127.0.0.1:27123";
const OBSIDIAN_API_KEY =
  "46826c4eb34cfc8b84b9377b7934c2152eef779bc2c72f6a7e566a722da980d7";
const FLEET_GATEWAY = "http://100.107.81.60:18789";
const FLEET_TOKEN = "469d967453959c1613228983f9805e23103b72a07499fffe";

async function obsidianFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${OBSIDIAN_API_KEY}`,
    Accept: "application/vnd.olrapi.note+json",
    ...((options.headers as Record<string, string>) || {}),
  };
  return fetch(`${OBSIDIAN_URL}${path}`, { ...options, headers, signal: AbortSignal.timeout(10000) });
}

async function fleetFetch(path: string): Promise<Response> {
  return fetch(`${FLEET_GATEWAY}${path}`, {
    headers: { Authorization: `Bearer ${FLEET_TOKEN}` },
    signal: AbortSignal.timeout(15000),
  });
}

/**
 * Search the agnt-wiki via Obsidian REST API
 */
export async function handleWikiSearch(args: ToolArgs): Promise<HandlerResult> {
  const query = args.query as string;
  if (!query) {
    return {
      content: [{ type: "text", text: "Error: query is required" }],
      isError: true,
    };
  }

  try {
    const res = await obsidianFetch("/search/simple/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, contextLength: 100 }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        content: [
          {
            type: "text",
            text: `Wiki search failed (${res.status}): ${text}\n\nIs Obsidian running with the REST API plugin on port 27123?`,
          },
        ],
        isError: true,
      };
    }

    const results = (await res.json()) as Array<{
      filename: string;
      matches: Array<{ match: { start: number; end: number }; context: string }>;
    }>;

    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `No wiki results for "${query}"` }],
      };
    }

    const output = [
      `## Wiki Search: "${query}" (${results.length} pages)`,
      "",
      ...results.slice(0, 15).map((r) => {
        const ctx = r.matches?.[0]?.context?.slice(0, 120) || "";
        return `- **${r.filename}** — ${ctx}...`;
      }),
      "",
      "Use `opus67_wikiRead` with a path to read full content.",
    ].join("\n");

    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Wiki search error: ${error instanceof Error ? error.message : String(error)}\n\nEnsure Obsidian is running with REST API plugin on port 27123.`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Read a specific wiki page
 */
export async function handleWikiRead(args: ToolArgs): Promise<HandlerResult> {
  const path = args.path as string;
  if (!path) {
    return {
      content: [{ type: "text", text: "Error: path is required" }],
      isError: true,
    };
  }

  try {
    const res = await obsidianFetch(`/vault/${encodeURIComponent(path)}`);

    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Wiki page not found: ${path} (${res.status})`,
          },
        ],
        isError: true,
      };
    }

    const data = await res.json() as { content: string };
    const content = data.content || (await res.text());

    // Truncate very long pages
    const maxLen = 8000;
    const truncated =
      content.length > maxLen
        ? content.slice(0, maxLen) + `\n\n... (truncated, ${content.length} chars total)`
        : content;

    return {
      content: [{ type: "text", text: `## ${path}\n\n${truncated}` }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Wiki read error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Append content to a wiki page
 */
export async function handleWikiWrite(args: ToolArgs): Promise<HandlerResult> {
  const path = args.path as string;
  const content = args.content as string;
  if (!path || !content) {
    return {
      content: [{ type: "text", text: "Error: path and content are required" }],
      isError: true,
    };
  }

  // Add timestamp header
  const timestamped = `\n\n---\n_Updated: ${new Date().toISOString()} by OPUS 67_\n\n${content}`;

  try {
    const res = await obsidianFetch(`/vault/${encodeURIComponent(path)}`, {
      method: "POST",
      headers: { "Content-Type": "text/markdown" },
      body: timestamped,
    });

    if (!res.ok) {
      return {
        content: [
          { type: "text", text: `Wiki write failed (${res.status}): ${await res.text()}` },
        ],
        isError: true,
      };
    }

    return {
      content: [
        { type: "text", text: `Appended ${content.length} chars to ${path}` },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Wiki write error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get OpenClaw fleet status
 */
export async function handleFleetStatus(): Promise<HandlerResult> {
  try {
    const res = await fleetFetch("/api/fleet/status");

    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Fleet gateway returned ${res.status}. Is the Mac gateway running at ${FLEET_GATEWAY}?`,
          },
        ],
        isError: true,
      };
    }

    const status = await res.json();
    const output = [
      "## OpenClaw Fleet Status",
      "",
      `Gateway: ${FLEET_GATEWAY}`,
      "",
      "```json",
      JSON.stringify(status, null, 2).slice(0, 3000),
      "```",
    ].join("\n");

    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Fleet unreachable: ${error instanceof Error ? error.message : String(error)}\n\nThe Mac gateway at ${FLEET_GATEWAY} may be offline. Check Tailscale connectivity.`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Dispatch a task to an OpenClaw agent
 */
export async function handleFleetDispatch(
  args: ToolArgs
): Promise<HandlerResult> {
  const agent = args.agent as string;
  const task = args.task as string;
  if (!agent || !task) {
    return {
      content: [{ type: "text", text: "Error: agent and task are required" }],
      isError: true,
    };
  }

  try {
    const res = await fetch(`${FLEET_GATEWAY}/api/fleet/dispatch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLEET_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent, task }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Fleet dispatch failed (${res.status}): ${await res.text()}`,
          },
        ],
        isError: true,
      };
    }

    const result = await res.json();
    return {
      content: [
        {
          type: "text",
          text: `Task dispatched to **${agent}**:\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Fleet dispatch error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * List available fleet agents
 */
export async function handleFleetAgents(): Promise<HandlerResult> {
  // Hardcoded agent roster (from memory: 8 agents on Mac)
  const agents = [
    { name: "main", role: "Control plane", model: "claude-sonnet-4.5", canSpawn: "all 7 sub-agents" },
    { name: "coder", role: "Code & builds", model: "minimax-m2.5:cloud", canSpawn: "none" },
    { name: "builder", role: "Technical construction", model: "minimax-m2.5:cloud", canSpawn: "none" },
    { name: "researcher", role: "Research & analysis", model: "minimax-m2.5:cloud", canSpawn: "none" },
    { name: "intelligence", role: "Market intel", model: "minimax-m2.5:cloud", canSpawn: "researcher" },
    { name: "trading", role: "Market decisions", model: "minimax-m2.5:cloud", canSpawn: "none" },
    { name: "growth", role: "Marketing & content", model: "minimax-m2.5:cloud", canSpawn: "none" },
    { name: "ops", role: "System health", model: "minimax-m2.5:cloud", canSpawn: "builder" },
  ];

  const output = [
    "## OpenClaw Fleet Agents",
    "",
    `Gateway: ${FLEET_GATEWAY}`,
    "",
    "| Agent | Role | Model | Can Spawn |",
    "|-------|------|-------|-----------|",
    ...agents.map(
      (a) => `| **${a.name}** | ${a.role} | ${a.model} | ${a.canSpawn} |`
    ),
    "",
    "Use `opus67_fleetDispatch` to send a task to any agent.",
    "Use `opus67_fleetStatus` to check live connectivity.",
  ].join("\n");

  return { content: [{ type: "text", text: output }] };
}

/**
 * Query the Hermes Python agent
 */
export async function handleHermesQuery(
  args: ToolArgs
): Promise<HandlerResult> {
  const query = args.query as string;
  const timeout = (args.timeout as number) || 60;

  if (!query) {
    return {
      content: [{ type: "text", text: "Error: query is required" }],
      isError: true,
    };
  }

  try {
    const { execSync } = await import("child_process");
    const hermesPath = "C:\\Users\\mirko\\AppData\\Local\\hermes\\hermes-agent";

    const result = execSync(
      `cd "${hermesPath}" && python -m hermes_agent.cli --query "${query.replace(/"/g, '\\"')}" --format json`,
      { timeout: timeout * 1000, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );

    return {
      content: [
        {
          type: "text",
          text: `## Hermes Response\n\n${result.slice(0, 5000)}`,
        },
      ],
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Provide actionable error
    if (msg.includes("ENOENT") || msg.includes("not found")) {
      return {
        content: [
          {
            type: "text",
            text: `Hermes agent not found. Expected at C:\\Users\\mirko\\AppData\\Local\\hermes\\hermes-agent\\\n\nVerify installation with: \`python -m hermes_agent.cli --help\``,
          },
        ],
        isError: true,
      };
    }
    if (msg.includes("ETIMEDOUT") || msg.includes("timeout")) {
      return {
        content: [
          { type: "text", text: `Hermes timed out after ${timeout}s. Try a simpler query or increase timeout.` },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Hermes error: ${msg}` }],
      isError: true,
    };
  }
}

// =============================================================================
// ROUTER
// =============================================================================

/**
 * Route tool calls to handlers
 */
export async function handleToolCall(
  name: string,
  args: ToolArgs,
  ctx: HandlerContext
): Promise<HandlerResult> {
  switch (name) {
    case "opus67_boot":
      return handleBoot(ctx);
    case "opus67_get_skill":
      return handleGetSkill(ctx, args);
    case "opus67_list_skills":
      return handleListSkills(ctx, args);
    case "opus67_detect_skills":
      return handleDetectSkills(ctx, args);
    case "opus67_get_mode":
      return handleGetMode(ctx, args);
    case "opus67_list_modes":
      return handleListModes(ctx);
    case "opus67_list_mcps":
      return handleListMcps(ctx, args);
    case "opus67_get_context":
      return handleGetContext(ctx, args);
    case "opus67_status":
      return handleStatus(ctx);
    // Memory tools
    case "opus67_queryMemory":
      return handleQueryMemory(args);
    case "opus67_multiHopQuery":
      return handleMultiHopQuery(args);
    case "opus67_writeMemory":
      return handleWriteMemory(args);
    case "opus67_memoryStats":
      return handleMemoryStats();
    // Analytics tools
    case "opus67_toolMetrics":
      return handleToolMetrics(args);
    case "opus67_unhealthyTools":
      return handleUnhealthyTools();
    // Phase 2 tools
    case "opus67_skillSummaries":
      return handleSkillSummaries(ctx, args);
    case "opus67_tokenBudget":
      return handleTokenBudget(ctx, args);
    // Phase 3: Native integrations
    case "opus67_wikiSearch":
      return handleWikiSearch(args);
    case "opus67_wikiRead":
      return handleWikiRead(args);
    case "opus67_wikiWrite":
      return handleWikiWrite(args);
    case "opus67_fleetStatus":
      return handleFleetStatus();
    case "opus67_fleetDispatch":
      return handleFleetDispatch(args);
    case "opus67_fleetAgents":
      return handleFleetAgents();
    case "opus67_hermesQuery":
      return handleHermesQuery(args);
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}
