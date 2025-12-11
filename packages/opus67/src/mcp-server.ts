#!/usr/bin/env node
/**
 * OPUS 67 MCP Server
 * Exposes all OPUS 67 capabilities to Claude Code as MCP tools
 *
 * Refactored from 633 lines to ~100 lines by extracting:
 * - mcp-server/types.ts: Type definitions
 * - mcp-server/registry.ts: YAML loading and parsing
 * - mcp-server/tools.ts: Tool definitions
 * - mcp-server/handlers.ts: Tool call handlers
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import {
  getPackageRoot,
  loadRegistries,
  loadSkillDefinition,
} from "./mcp-server/registry.js";
import { TOOL_DEFINITIONS } from "./mcp-server/tools.js";
import { handleToolCall, type HandlerContext } from "./mcp-server/handlers.js";
import type { ToolArgs } from "./mcp-server/types.js";
import { VERSION } from "./version.js";

// Initialize
const PACKAGE_ROOT = getPackageRoot();
const { skills, mcpConnections, modes } = loadRegistries(PACKAGE_ROOT);

const handlerContext: HandlerContext = {
  skills,
  mcpConnections,
  modes,
  packageRoot: PACKAGE_ROOT,
};

// Create MCP server with all capabilities
const server = new Server(
  { name: "opus67", version: VERSION },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

// Skill categories for prompts (slash commands)
const SKILL_CATEGORIES = [
  {
    name: "solana",
    description: "Solana/Anchor blockchain development expertise",
    category: "blockchain",
  },
  {
    name: "react",
    description: "React 19 + Next.js 15 frontend patterns",
    category: "frontend",
  },
  {
    name: "typescript",
    description: "Advanced TypeScript patterns and type safety",
    category: "language",
  },
  {
    name: "security",
    description: "Security auditing and vulnerability detection",
    category: "security",
  },
  {
    name: "backend",
    description: "Node.js/API backend development patterns",
    category: "backend",
  },
  {
    name: "devops",
    description: "Docker, CI/CD, deployment automation",
    category: "devops",
  },
  {
    name: "testing",
    description: "Unit, integration, and E2E testing patterns",
    category: "testing",
  },
  {
    name: "database",
    description: "Database design, SQL, and query optimization",
    category: "data",
  },
  {
    name: "web3",
    description: "DeFi, tokens, and blockchain integration",
    category: "blockchain",
  },
  {
    name: "grab",
    description: "Visual-to-code: screenshot to React components",
    category: "grab",
  },
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await handleToolCall(name, args as ToolArgs, handlerContext);
});

// List available prompts (become slash commands in Claude Code)
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: SKILL_CATEGORIES.map((cat) => ({
    name: cat.name,
    description: cat.description,
    arguments: [
      {
        name: "task",
        description: "Optional: specific task context",
        required: false,
      },
    ],
  })),
}));

// Get prompt content (loads skill expertise)
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const category = SKILL_CATEGORIES.find((c) => c.name === name);

  if (!category) {
    return {
      description: "Unknown skill category",
      messages: [
        { role: "user", content: { type: "text", text: "Skill not found" } },
      ],
    };
  }

  // Find all skills in this category
  const categorySkills = skills
    .filter(
      (s) =>
        s.category?.toLowerCase() === category.category.toLowerCase() ||
        s.id.includes(category.name)
    )
    .slice(0, 3);

  // Load skill definitions
  let skillContent = `# OPUS 67 - ${category.description}\n\n`;
  skillContent += `**Category:** ${category.category}\n\n`;
  skillContent += `## Loaded Skills\n\n`;

  for (const skill of categorySkills) {
    const defPath = join(
      PACKAGE_ROOT,
      "skills",
      "definitions",
      `${skill.id}.md`
    );
    if (existsSync(defPath)) {
      const content = readFileSync(defPath, "utf-8");
      skillContent += `### ${skill.name}\n\n${content}\n\n---\n\n`;
    } else {
      skillContent += `### ${skill.name}\n\n`;
      skillContent += `Capabilities: ${skill.capabilities?.join(", ") || "General assistance"}\n\n`;
    }
  }

  const taskContext =
    (args as Record<string, string>)?.task || "General development";
  skillContent += `\n## Current Task\n\n${taskContext}\n\n`;
  skillContent += `Apply the expertise above to complete this task effectively.`;

  return {
    description: `${category.description} - ${categorySkills.length} skills loaded`,
    messages: [
      {
        role: "user",
        content: { type: "text", text: skillContent },
      },
    ],
  };
});

// List resources (skill definitions + auto-context)
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    // Auto-loaded context resource - Claude Code should read this automatically
    {
      uri: "opus67://auto-context",
      name: "OPUS 67 Auto Context",
      description:
        "IMPORTANT: Auto-loaded skill detection context. Read this first!",
      mimeType: "text/markdown",
    },
    // Individual skill resources
    ...skills.map((skill) => ({
      uri: `opus67://skill/${skill.id}`,
      name: skill.name,
      description: `${skill.category} skill - ${skill.tokens} tokens`,
      mimeType: "text/markdown",
    })),
  ],
}));

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Auto-context resource - returns skill detection instructions
  if (uri === "opus67://auto-context") {
    const topSkills = skills
      .slice(0, 10)
      .map((s) => `- ${s.id}: ${s.name}`)
      .join("\n");
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
      contents: [{ uri, mimeType: "text/markdown", text: content }],
    };
  }

  // Individual skill resources
  if (uri.startsWith("opus67://skill/")) {
    const skillId = uri.replace("opus67://skill/", "");
    const skill = skills.find((s) => s.id === skillId);

    if (skill) {
      const defPath = join(
        PACKAGE_ROOT,
        "skills",
        "definitions",
        `${skillId}.md`
      );
      let content = `# ${skill.name}\n\n`;

      if (existsSync(defPath)) {
        content += readFileSync(defPath, "utf-8");
      } else {
        content += `Category: ${skill.category}\n`;
        content += `Tokens: ${skill.tokens}\n\n`;
        content += `## Capabilities\n`;
        content +=
          skill.capabilities?.map((c) => `- ${c}`).join("\n") ||
          "General assistance";
      }

      return {
        contents: [{ uri, mimeType: "text/markdown", text: content }],
      };
    }
  }

  return { contents: [] };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[OPUS67] MCP Server started");
  console.error(
    `[OPUS67] Skills: ${skills.length}, MCPs: ${mcpConnections.length}, Modes: ${modes.length}`
  );
}

main().catch((error) => {
  console.error("[OPUS67] Fatal error:", error);
  process.exit(1);
});
