#!/usr/bin/env node
import { VERSION } from './chunk-IEE3QXBQ.js';
import { getUnifiedMemory, initializeUnifiedMemory } from './chunk-GCLGOCG5.js';
import './chunk-2BMLDUKW.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';

var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = dirname(__filename$1);
function getPackageRoot() {
  let dir = __dirname$1;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return __dirname$1;
}
function loadYaml(relativePath, packageRoot) {
  const fullPath = join(packageRoot, relativePath);
  if (!existsSync(fullPath)) {
    console.error(`[OPUS67] Registry not found: ${fullPath}`);
    return null;
  }
  try {
    const content = readFileSync(fullPath, "utf-8");
    return parse(content);
  } catch (e) {
    console.error(`[OPUS67] Failed to load ${relativePath}:`, e);
    return null;
  }
}
function loadRegistries(packageRoot) {
  const skillsRegistryRaw = loadYaml("skills/registry.yaml", packageRoot);
  let skills2 = [];
  if (skillsRegistryRaw) {
    const skillsKeys = Object.keys(skillsRegistryRaw).filter((key) => key.startsWith("skills"));
    for (const key of skillsKeys) {
      const skillsData = skillsRegistryRaw[key];
      if (Array.isArray(skillsData)) {
        skills2.push(...skillsData);
      } else if (skillsData && typeof skillsData === "object") {
        for (const [id, skill] of Object.entries(skillsData)) {
          if (skill && typeof skill === "object") {
            skills2.push({ id, ...skill });
          }
        }
      }
    }
  }
  const mcpRegistryRaw = loadYaml("mcp/connections.yaml", packageRoot);
  const mcpConnections2 = [];
  if (mcpRegistryRaw) {
    for (const [category, categoryData] of Object.entries(mcpRegistryRaw)) {
      if (category === "meta" || category === "groups") continue;
      if (categoryData && typeof categoryData === "object" && !Array.isArray(categoryData)) {
        for (const [id, conn] of Object.entries(categoryData)) {
          if (conn && typeof conn === "object" && "name" in conn) {
            mcpConnections2.push({ ...conn, id, category });
          }
        }
      }
    }
  }
  const modesRegistryRaw = loadYaml("modes/registry.yaml", packageRoot);
  const modes2 = [];
  if (modesRegistryRaw?.modes && typeof modesRegistryRaw.modes === "object") {
    for (const [id, mode] of Object.entries(modesRegistryRaw.modes)) {
      if (mode && typeof mode === "object" && "name" in mode) {
        modes2.push({
          id,
          name: mode.name || id,
          icon: mode.icon || "\u{1F527}",
          description: mode.description || "",
          token_budget: mode.token_budget || 1e4,
          thinking_depth: mode.thinking_depth || "standard"
        });
      }
    }
  }
  return { skills: skills2, mcpConnections: mcpConnections2, modes: modes2 };
}
function loadSkillDefinition(skillId, packageRoot) {
  const defPath = join(packageRoot, "skills", "definitions", `${skillId}.md`);
  if (existsSync(defPath)) {
    return readFileSync(defPath, "utf-8");
  }
  return "";
}

// src/mcp-server/tools.ts
var TOOL_DEFINITIONS = [
  {
    name: "opus67_boot",
    description: "Boot OPUS 67 and show the boot screen with all loaded capabilities",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "opus67_get_skill",
    description: "Get a specific skill prompt by ID. Returns the full skill definition including prompt and capabilities.",
    inputSchema: {
      type: "object",
      properties: {
        skill_id: {
          type: "string",
          description: 'The skill ID (e.g., "solana-anchor-expert", "nextjs-14-expert")'
        }
      },
      required: ["skill_id"]
    }
  },
  {
    name: "opus67_list_skills",
    description: "List all available OPUS 67 skills with their categories and token costs",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: 'Filter by category (e.g., "blockchain", "frontend", "backend")'
        }
      },
      required: []
    }
  },
  {
    name: "opus67_detect_skills",
    description: "Auto-detect relevant skills based on a query or file extensions",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The task or query to analyze"
        },
        extensions: {
          type: "array",
          items: { type: "string" },
          description: 'File extensions in the project (e.g., [".rs", ".ts"])'
        }
      },
      required: []
    }
  },
  {
    name: "opus67_get_mode",
    description: "Get details about an operating mode",
    inputSchema: {
      type: "object",
      properties: {
        mode_id: {
          type: "string",
          description: "Mode ID (auto, scan, build, review, architect, debug, ultra, think, vibe, light, swarm, bg)"
        }
      },
      required: ["mode_id"]
    }
  },
  {
    name: "opus67_list_modes",
    description: "List all available operating modes",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "opus67_list_mcps",
    description: "List all MCP connections available in OPUS 67",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: 'Filter by category (e.g., "blockchain", "social", "data")'
        }
      },
      required: []
    }
  },
  {
    name: "opus67_get_context",
    description: "Get enhanced context for a task including relevant skills, modes, and MCPs",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task description"
        },
        files: {
          type: "array",
          items: { type: "string" },
          description: "Active file paths"
        }
      },
      required: ["task"]
    }
  },
  {
    name: "opus67_status",
    description: "Get OPUS 67 status including loaded skills, MCPs, and modes count",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  // Memory tools
  {
    name: "opus67_queryMemory",
    description: "Query OPUS 67 unified memory (semantic + keyword search across all sources)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        },
        type: {
          type: "string",
          enum: ["semantic", "keyword", "graph", "temporal", "multi-hop"],
          description: "Query type (default: auto-detect)"
        },
        limit: {
          type: "number",
          description: "Maximum results to return (default: 10)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "opus67_multiHopQuery",
    description: "Multi-hop reasoning query - follows relationships across memories (1-5 hops)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: 'The reasoning query (e.g., "why did we choose X")'
        },
        maxHops: {
          type: "number",
          description: "Maximum relationship hops (1-5, default: 3)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "opus67_writeMemory",
    description: "Write a fact, episode, learning, or win to unified memory",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to remember"
        },
        type: {
          type: "string",
          enum: ["fact", "episode", "learning", "win", "decision"],
          description: "Type of memory"
        },
        key: {
          type: "string",
          description: "Optional unique key for this memory"
        }
      },
      required: ["content", "type"]
    }
  },
  {
    name: "opus67_memoryStats",
    description: "Get unified memory statistics across all sources",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// src/mcp-server/handlers.ts
var memoryInstance = null;
async function getMemory() {
  if (!memoryInstance) {
    memoryInstance = getUnifiedMemory();
    if (!memoryInstance) {
      memoryInstance = await initializeUnifiedMemory();
    }
  }
  return memoryInstance;
}
function handleBoot(ctx) {
  const bootScreen = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                                           \u2551
\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557                  \u2551
\u2551  \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551                  \u2551
\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2554\u255D                  \u2551
\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u255D \u2588\u2588\u2551   \u2588\u2588\u2551\u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557   \u2588\u2588\u2554\u255D                   \u2551
\u2551  \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551     \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551    \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D   \u2588\u2588\u2551                    \u2551
\u2551   \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D      \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D     \u255A\u2550\u2550\u2550\u2550\u2550\u255D    \u255A\u2550\u255D                    \u2551
\u2551                                                                           \u2551
\u2551              Self-Evolving AI Runtime v${VERSION.padEnd(20)}              \u2551
\u2551                                                                           \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                           \u2551
\u2551   LOADED CAPABILITIES                                                     \u2551
\u2551   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500     \u2551
\u2551   Skills:  ${String(ctx.skills.length).padEnd(4)} specialist prompts                                  \u2551
\u2551   MCPs:    ${String(ctx.mcpConnections.length).padEnd(4)} data connections                                     \u2551
\u2551   Modes:   ${String(ctx.modes.length).padEnd(4)} operating modes                                     \u2551
\u2551                                                                           \u2551
\u2551   READY TO ENHANCE CLAUDE CODE                                            \u2551
\u2551                                                                           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

Use opus67_get_skill to load a specialist skill.
Use opus67_detect_skills to auto-detect relevant skills for your task.
Use opus67_get_context for full task context enhancement.
`;
  return { content: [{ type: "text", text: bootScreen }] };
}
function handleGetSkill(ctx, args) {
  const skillId = args.skill_id;
  const skill = ctx.skills.find((s) => s.id === skillId);
  if (!skill) {
    return {
      content: [
        {
          type: "text",
          text: `Skill "${skillId}" not found. Use opus67_list_skills to see available skills.`
        }
      ]
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

${fullPrompt ? `## Full Skill Prompt

${fullPrompt}` : ""}
`;
  return { content: [{ type: "text", text: output }] };
}
function handleListSkills(ctx, args) {
  const category = args.category;
  const filtered = category ? ctx.skills.filter(
    (s) => s.category.toLowerCase() === category.toLowerCase()
  ) : ctx.skills;
  const grouped = {};
  for (const skill of filtered) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }
  let output = `# OPUS 67 Skills (${filtered.length} total)

`;
  for (const [cat, catSkills] of Object.entries(grouped)) {
    output += `## ${cat}
`;
    for (const skill of catSkills) {
      const priority = skill.priority <= 2 ? "\u2B50" : "  ";
      output += `${priority} **${skill.id}** - ${skill.name} (${skill.tokens} tokens)
`;
    }
    output += "\n";
  }
  return { content: [{ type: "text", text: output }] };
}
function handleDetectSkills(ctx, args) {
  const { query = "", extensions = [] } = args;
  const detected = [];
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
  detected.sort((a, b) => b.priority - a.priority);
  const top = detected.slice(0, 5);
  let output = `# Detected Skills for: "${query}"

`;
  if (top.length === 0) {
    output += "No specific skills detected. Using general capabilities.\n";
  } else {
    output += `Found ${top.length} relevant skills:

`;
    for (const skill of top) {
      output += `- **${skill.id}** (${skill.name}) - Score: ${skill.priority}
`;
    }
    output += `
Use \`opus67_get_skill\` to load the full skill prompt.
`;
  }
  return { content: [{ type: "text", text: output }] };
}
function handleGetMode(ctx, args) {
  const modeId = args.mode_id;
  const mode = ctx.modes.find((m) => m.id === modeId);
  if (!mode) {
    return {
      content: [
        {
          type: "text",
          text: `Mode "${modeId}" not found. Available: ${ctx.modes.map((m) => m.id).join(", ")}`
        }
      ]
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
function handleListModes(ctx) {
  let output = "# OPUS 67 Operating Modes\n\n";
  for (const mode of ctx.modes) {
    output += `${mode.icon} **${mode.id.toUpperCase()}** - ${mode.description}
`;
  }
  return { content: [{ type: "text", text: output }] };
}
function handleListMcps(ctx, args) {
  const category = args.category;
  const filtered = category ? ctx.mcpConnections.filter(
    (m) => m.category?.toLowerCase() === category.toLowerCase()
  ) : ctx.mcpConnections;
  let output = `# OPUS 67 MCP Connections (${filtered.length})

`;
  const grouped = {};
  for (const mcp of filtered) {
    const cat = mcp.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(mcp);
  }
  for (const [cat, mcps] of Object.entries(grouped)) {
    output += `## ${cat}
`;
    for (const mcp of mcps) {
      output += `- **${mcp.id}** - ${mcp.name}
`;
    }
    output += "\n";
  }
  return { content: [{ type: "text", text: output }] };
}
function handleGetContext(ctx, args) {
  const { task = "", files = [] } = args;
  const extensions = [...new Set(files.map((f) => "." + f.split(".").pop()))];
  const queryLower = task.toLowerCase();
  const detectedSkills = [];
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
  detectedSkills.sort((a, b) => b.priority - a.priority);
  const topSkills = detectedSkills.slice(0, 3);
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
${mode?.icon || "\u{1F527}"} **${(mode?.id || "build").toUpperCase()}** - ${mode?.description || ""}
Token Budget: ${mode?.token_budget || 1e4}

## Detected Skills
${topSkills.length > 0 ? topSkills.map((s) => `- **${s.id}** - ${s.name}`).join("\n") : "No specific skills detected - using general capabilities"}

## Active Files
${files.length > 0 ? files.map((f) => `- ${f}`).join("\n") : "None specified"}

---
*Use \`opus67_get_skill <id>\` to load full skill prompts*
`;
  return { content: [{ type: "text", text: output }] };
}
function handleStatus(ctx) {
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
- Other: ${ctx.skills.filter((s) => !["blockchain", "frontend", "backend", "devops"].includes(s.category)).length} skills
`;
  return { content: [{ type: "text", text: output }] };
}
async function handleQueryMemory(args) {
  try {
    const memory = await getMemory();
    const results = await memory.query({
      query: args.query,
      type: args.type,
      limit: args.limit ?? 10
    });
    let output = `# Memory Query Results

`;
    output += `**Query:** ${args.query}
`;
    output += `**Results:** ${results.length}

`;
    if (results.length === 0) {
      output += `No matching memories found.
`;
    } else {
      for (const result of results) {
        output += `### ${result.metadata?.key || result.id}
`;
        output += `**Source:** ${result.source} | **Score:** ${result.score.toFixed(2)}
`;
        output += `${result.content.slice(0, 200)}${result.content.length > 200 ? "..." : ""}

`;
      }
    }
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Memory query failed: ${error}` }],
      isError: true
    };
  }
}
async function handleMultiHopQuery(args) {
  try {
    const memory = await getMemory();
    const results = await memory.multiHopQuery(args.query, args.maxHops ?? 3);
    let output = `# Multi-Hop Query Results

`;
    output += `**Query:** ${args.query}
`;
    output += `**Max Hops:** ${args.maxHops ?? 3}
`;
    output += `**Results:** ${results.length}

`;
    if (results.length === 0) {
      output += `No reasoning chain found.
`;
    } else {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        output += `### Hop ${i + 1}: ${result.metadata?.key || result.id}
`;
        output += `**Source:** ${result.source}
`;
        output += `${result.content.slice(0, 300)}${result.content.length > 300 ? "..." : ""}

`;
      }
    }
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Multi-hop query failed: ${error}` }],
      isError: true
    };
  }
}
async function handleWriteMemory(args) {
  try {
    const memory = await getMemory();
    const result = await memory.write({
      content: args.content,
      type: args.type,
      key: args.key
    });
    const output = `# Memory Written

**Type:** ${args.type}
**Key:** ${args.key || "(auto-generated)"}
**Status:** ${result.success ? "Success" : "Failed"}
**IDs:** ${result.ids.join(", ") || "None"}`;
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Memory write failed: ${error}` }],
      isError: true
    };
  }
}
async function handleMemoryStats() {
  try {
    const memory = await getMemory();
    const stats = await memory.getStats();
    let output = `# Unified Memory Statistics

`;
    output += `## Sources

`;
    for (const [source, info] of Object.entries(stats.sources)) {
      if (info.available) {
        output += `- **${source}**: ${info.count} memories`;
        if (info.lastSync) {
          output += ` (last sync: ${new Date(info.lastSync).toLocaleString()})`;
        }
        output += `
`;
      }
    }
    output += `
## Totals

`;
    output += `- **Total Memories:** ${stats.totalMemories}
`;
    output += `- **Neo4j:** ${stats.backends.neo4j ? "Connected" : "Local mode"}
`;
    output += `- **HMLR (Multi-hop):** ${stats.backends.hmlr ? "Enabled" : "Disabled"}
`;
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Memory stats failed: ${error}` }],
      isError: true
    };
  }
}
async function handleToolCall(name, args, ctx) {
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
        isError: true
      };
  }
}

// src/mcp-server.ts
var PACKAGE_ROOT = getPackageRoot();
var { skills, mcpConnections, modes } = loadRegistries(PACKAGE_ROOT);
var handlerContext = {
  skills,
  mcpConnections,
  modes,
  packageRoot: PACKAGE_ROOT
};
var server = new Server(
  { name: "opus67", version: VERSION },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);
var SKILL_CATEGORIES = [
  { name: "solana", description: "Solana/Anchor blockchain development expertise", category: "blockchain" },
  { name: "react", description: "React 19 + Next.js 15 frontend patterns", category: "frontend" },
  { name: "typescript", description: "Advanced TypeScript patterns and type safety", category: "language" },
  { name: "security", description: "Security auditing and vulnerability detection", category: "security" },
  { name: "backend", description: "Node.js/API backend development patterns", category: "backend" },
  { name: "devops", description: "Docker, CI/CD, deployment automation", category: "devops" },
  { name: "testing", description: "Unit, integration, and E2E testing patterns", category: "testing" },
  { name: "database", description: "Database design, SQL, and query optimization", category: "data" },
  { name: "web3", description: "DeFi, tokens, and blockchain integration", category: "blockchain" },
  { name: "grab", description: "Visual-to-code: screenshot to React components", category: "grab" }
];
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleToolCall(name, args, handlerContext);
});
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: SKILL_CATEGORIES.map((cat) => ({
    name: cat.name,
    description: cat.description,
    arguments: [
      {
        name: "task",
        description: "Optional: specific task context",
        required: false
      }
    ]
  }))
}));
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const category = SKILL_CATEGORIES.find((c) => c.name === name);
  if (!category) {
    return {
      description: "Unknown skill category",
      messages: [{ role: "user", content: { type: "text", text: "Skill not found" } }]
    };
  }
  const categorySkills = skills.filter(
    (s) => s.category?.toLowerCase() === category.category.toLowerCase() || s.id.includes(category.name)
  ).slice(0, 3);
  let skillContent = `# OPUS 67 - ${category.description}

`;
  skillContent += `**Category:** ${category.category}

`;
  skillContent += `## Loaded Skills

`;
  for (const skill of categorySkills) {
    const defPath = join(PACKAGE_ROOT, "skills", "definitions", `${skill.id}.md`);
    if (existsSync(defPath)) {
      const content = readFileSync(defPath, "utf-8");
      skillContent += `### ${skill.name}

${content}

---

`;
    } else {
      skillContent += `### ${skill.name}

`;
      skillContent += `Capabilities: ${skill.capabilities?.join(", ") || "General assistance"}

`;
    }
  }
  const taskContext = args?.task || "General development";
  skillContent += `
## Current Task

${taskContext}

`;
  skillContent += `Apply the expertise above to complete this task effectively.`;
  return {
    description: `${category.description} - ${categorySkills.length} skills loaded`,
    messages: [
      {
        role: "user",
        content: { type: "text", text: skillContent }
      }
    ]
  };
});
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    // Auto-loaded context resource - Claude Code should read this automatically
    {
      uri: "opus67://auto-context",
      name: "OPUS 67 Auto Context",
      description: "IMPORTANT: Auto-loaded skill detection context. Read this first!",
      mimeType: "text/markdown"
    },
    // Individual skill resources
    ...skills.map((skill) => ({
      uri: `opus67://skill/${skill.id}`,
      name: skill.name,
      description: `${skill.category} skill - ${skill.tokens} tokens`,
      mimeType: "text/markdown"
    }))
  ]
}));
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === "opus67://auto-context") {
    const topSkills = skills.slice(0, 10).map((s) => `- ${s.id}: ${s.name}`).join("\n");
    const content = `# OPUS 67 - MANDATORY SKILL DETECTION

## YOU MUST DO THIS ON EVERY CODE-RELATED MESSAGE

Before responding to ANY user request involving code, you MUST:

1. **Call \`opus67_detect_skills\`** with the user's query
   - This finds relevant domain expertise
   - Takes 0.25ms - negligible overhead

2. **Call \`opus67_get_skill\`** for top 3 matches
   - Loads full skill prompts into your context
   - Each skill is ~10KB of domain expertise

3. **Apply the loaded skills** in your response
   - Use the patterns, best practices, and knowledge
   - Reference the skill when relevant

## WHY THIS IS MANDATORY

- Skills contain domain expertise you don't have by default
- Skipping this step results in lower quality responses
- The user paid for OPUS 67 - use it!

## AVAILABLE SKILLS (Top 10)

${topSkills}

## QUICK COMMANDS

\`\`\`
opus67_detect_skills({ query: "user's message here" })
opus67_get_skill({ id: "skill-id-here" })
opus67_get_context({ task: "description", skills: true, mcps: true })
\`\`\`

---
*This context is auto-loaded by OPUS 67 v${VERSION}*
`;
    return {
      contents: [{ uri, mimeType: "text/markdown", text: content }]
    };
  }
  if (uri.startsWith("opus67://skill/")) {
    const skillId = uri.replace("opus67://skill/", "");
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      const defPath = join(PACKAGE_ROOT, "skills", "definitions", `${skillId}.md`);
      let content = `# ${skill.name}

`;
      if (existsSync(defPath)) {
        content += readFileSync(defPath, "utf-8");
      } else {
        content += `Category: ${skill.category}
`;
        content += `Tokens: ${skill.tokens}

`;
        content += `## Capabilities
`;
        content += skill.capabilities?.map((c) => `- ${c}`).join("\n") || "General assistance";
      }
      return {
        contents: [{ uri, mimeType: "text/markdown", text: content }]
      };
    }
  }
  return { contents: [] };
});
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[OPUS67] MCP Server started");
  console.error(`[OPUS67] Skills: ${skills.length}, MCPs: ${mcpConnections.length}, Modes: ${modes.length}`);
}
main().catch((error) => {
  console.error("[OPUS67] Fatal error:", error);
  process.exit(1);
});
