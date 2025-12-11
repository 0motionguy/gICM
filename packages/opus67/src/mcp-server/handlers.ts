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
║              Self-Evolving AI Runtime v${VERSION.padEnd(20)}              ║
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
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}
