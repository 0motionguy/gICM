/**
 * OPUS 67 v6.3.0 MCP Server Tool Definitions
 *
 * v6.3.0 "Context Engineering" additions:
 * - opus67_detect_skills: Now uses 4-stage multi-stage retrieval (+17% precision)
 * - opus67_toolMetrics: View tool performance analytics
 * - opus67_unhealthyTools: List degraded/unhealthy tools
 */

export const TOOL_DEFINITIONS = [
  {
    name: "opus67_boot",
    description:
      "Boot OPUS 67 and show the boot screen with all loaded capabilities",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "opus67_get_skill",
    description:
      "Get a specific skill prompt by ID. Returns the full skill definition including prompt and capabilities.",
    inputSchema: {
      type: "object",
      properties: {
        skill_id: {
          type: "string",
          description:
            'The skill ID (e.g., "solana-anchor-expert", "nextjs-14-expert")',
        },
      },
      required: ["skill_id"],
    },
  },
  {
    name: "opus67_list_skills",
    description:
      "List all available OPUS 67 skills with their categories and token costs",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            'Filter by category (e.g., "blockchain", "frontend", "backend")',
        },
      },
      required: [],
    },
  },
  {
    name: "opus67_detect_skills",
    description:
      "Auto-detect relevant skills using 4-stage multi-stage retrieval (v6.3.0: keyword filter → vector search → cross-encoder reranking → MMR diversity)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The task or query to analyze",
        },
        extensions: {
          type: "array",
          items: { type: "string" },
          description: 'File extensions in the project (e.g., [".rs", ".ts"])',
        },
      },
      required: [],
    },
  },
  {
    name: "opus67_get_mode",
    description: "Get details about an operating mode",
    inputSchema: {
      type: "object",
      properties: {
        mode_id: {
          type: "string",
          description:
            "Mode ID (auto, scan, build, review, architect, debug, ultra, think, vibe, light, swarm, bg)",
        },
      },
      required: ["mode_id"],
    },
  },
  {
    name: "opus67_list_modes",
    description: "List all available operating modes",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "opus67_list_mcps",
    description: "List all MCP connections available in OPUS 67",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            'Filter by category (e.g., "blockchain", "social", "data")',
        },
      },
      required: [],
    },
  },
  {
    name: "opus67_get_context",
    description:
      "Get enhanced context for a task including relevant skills, modes, and MCPs",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task description",
        },
        files: {
          type: "array",
          items: { type: "string" },
          description: "Active file paths",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "opus67_status",
    description:
      "Get OPUS 67 status including loaded skills, MCPs, and modes count",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  // Memory tools
  {
    name: "opus67_queryMemory",
    description:
      "Query OPUS 67 unified memory (semantic + keyword search across all sources)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        type: {
          type: "string",
          enum: ["semantic", "keyword", "graph", "temporal", "multi-hop"],
          description: "Query type (default: auto-detect)",
        },
        limit: {
          type: "number",
          description: "Maximum results to return (default: 10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "opus67_multiHopQuery",
    description:
      "Multi-hop reasoning query - follows relationships across memories (1-5 hops)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: 'The reasoning query (e.g., "why did we choose X")',
        },
        maxHops: {
          type: "number",
          description: "Maximum relationship hops (1-5, default: 3)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "opus67_writeMemory",
    description: "Write a fact, episode, learning, or win to unified memory",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to remember",
        },
        type: {
          type: "string",
          enum: ["fact", "episode", "learning", "win", "decision"],
          description: "Type of memory",
        },
        key: {
          type: "string",
          description: "Optional unique key for this memory",
        },
      },
      required: ["content", "type"],
    },
  },
  {
    name: "opus67_memoryStats",
    description: "Get unified memory statistics across all sources",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  // Tool Analytics (v6.3.0)
  {
    name: "opus67_toolMetrics",
    description:
      "Get performance metrics for MCP tools (success rate, latency p50/p95/p99, health status)",
    inputSchema: {
      type: "object",
      properties: {
        tool_id: {
          type: "string",
          description:
            "Specific tool ID to get metrics for (omit for all tools)",
        },
      },
      required: [],
    },
  },
  {
    name: "opus67_unhealthyTools",
    description:
      "List all degraded or unhealthy tools with their error patterns and recommendations",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];
