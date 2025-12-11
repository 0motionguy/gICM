/**
 * OPUS 67 - Memory MCP Tools
 *
 * Exposes UnifiedMemory as MCP tools:
 * - queryMemory: Semantic/keyword search
 * - multiHopQuery: Multi-hop reasoning
 * - writeMemory: Store facts/episodes/learnings
 */

import {
  UnifiedMemory,
  getUnifiedMemory,
  type UnifiedResult,
  type QueryType,
  type MemorySource,
} from "../memory/unified/index.js";

// =============================================================================
// TYPES
// =============================================================================

export interface MemoryToolParams {
  query?: string;
  content?: string;
  type?: QueryType | "fact" | "episode" | "learning" | "win";
  limit?: number;
  maxHops?: number;
  minScore?: number;
  sources?: MemorySource[];
  metadata?: Record<string, unknown>;
}

export interface MemoryToolResult {
  success: boolean;
  data?: UnifiedResult[] | { id: string };
  error?: string;
  stats?: {
    count: number;
    sources: string[];
    latencyMs: number;
  };
}

export type MemoryToolHandler = (
  params: MemoryToolParams
) => Promise<MemoryToolResult>;

// =============================================================================
// TOOL HANDLERS
// =============================================================================

/**
 * Query unified memory (semantic + keyword search)
 */
export async function handleQueryMemory(
  params: MemoryToolParams
): Promise<MemoryToolResult> {
  const startTime = Date.now();

  if (!params.query) {
    return { success: false, error: "Query parameter is required" };
  }

  try {
    const memory = getUnifiedMemory();
    if (!memory) {
      return { success: false, error: "UnifiedMemory not initialized" };
    }

    const results = await memory.query({
      query: params.query,
      type: (params.type as QueryType) || "semantic",
      limit: params.limit || 10,
      minScore: params.minScore || 0.1,
      sources: params.sources,
    });

    const uniqueSources = [...new Set(results.map((r) => r.source))];

    return {
      success: true,
      data: results,
      stats: {
        count: results.length,
        sources: uniqueSources,
        latencyMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Query failed: ${error}`,
    };
  }
}

/**
 * Multi-hop reasoning query (follows relationships 1-5 hops)
 */
export async function handleMultiHopQuery(
  params: MemoryToolParams
): Promise<MemoryToolResult> {
  const startTime = Date.now();

  if (!params.query) {
    return { success: false, error: "Query parameter is required" };
  }

  try {
    const memory = getUnifiedMemory();
    if (!memory) {
      return { success: false, error: "UnifiedMemory not initialized" };
    }

    const results = await memory.multiHopQuery(
      params.query,
      params.maxHops || 3
    );

    const uniqueSources = [...new Set(results.map((r) => r.source))];

    return {
      success: true,
      data: results,
      stats: {
        count: results.length,
        sources: uniqueSources,
        latencyMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Multi-hop query failed: ${error}`,
    };
  }
}

/**
 * Write fact/episode/learning to memory
 */
export async function handleWriteMemory(
  params: MemoryToolParams
): Promise<MemoryToolResult> {
  if (!params.content) {
    return { success: false, error: "Content parameter is required" };
  }

  if (!params.type) {
    return { success: false, error: "Type parameter is required" };
  }

  try {
    const memory = getUnifiedMemory();
    if (!memory) {
      return { success: false, error: "UnifiedMemory not initialized" };
    }

    const result = await memory.write({
      content: params.content,
      type: params.type as "fact" | "episode" | "learning" | "win",
      metadata: params.metadata,
    });

    const idList = Object.values(result.ids).join(", ");
    return {
      success: true,
      data: { id: idList },
    };
  } catch (error) {
    return {
      success: false,
      error: `Write failed: ${error}`,
    };
  }
}

// =============================================================================
// TOOL DEFINITIONS (for MCP registration)
// =============================================================================

export const memoryToolDefinitions = [
  {
    name: "opus67_queryMemory",
    description:
      "Query OPUS 67 unified memory system. Supports semantic search, keyword search, and cross-source queries.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        type: {
          type: "string",
          enum: ["semantic", "keyword", "graph", "temporal"],
          description: "Query type (default: semantic)",
        },
        limit: {
          type: "number",
          description: "Max results to return (default: 10)",
        },
        minScore: {
          type: "number",
          description: "Minimum relevance score 0-1 (default: 0.1)",
        },
      },
      required: ["query"],
    },
    handler: handleQueryMemory,
  },
  {
    name: "opus67_multiHopQuery",
    description:
      "Multi-hop reasoning query. Follows relationships in the knowledge graph to find connected facts (1-5 hops).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The reasoning query",
        },
        maxHops: {
          type: "number",
          description: "Maximum relationship hops (1-5, default: 3)",
        },
      },
      required: ["query"],
    },
    handler: handleMultiHopQuery,
  },
  {
    name: "opus67_writeMemory",
    description:
      "Write a fact, episode, or learning to OPUS 67 memory for future recall.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to store",
        },
        type: {
          type: "string",
          enum: ["fact", "episode", "learning", "win"],
          description: "Type of memory entry",
        },
        metadata: {
          type: "object",
          description: "Additional metadata (optional)",
        },
      },
      required: ["content", "type"],
    },
    handler: handleWriteMemory,
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export const memoryTools = {
  queryMemory: handleQueryMemory,
  multiHopQuery: handleMultiHopQuery,
  writeMemory: handleWriteMemory,
};

export default memoryTools;
