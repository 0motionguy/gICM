/**
 * Tool Search API - Anthropic Tool Search Tool Implementation
 *
 * Converts ClawdBot registry items to Claude-compatible tool definitions.
 * Enables dynamic tool discovery with 85% context reduction.
 */

import { NextRequest, NextResponse } from "next/server";
import { REGISTRY } from "@/lib/registry";
import { z } from "zod";

const SearchPostSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).default(5),
  platform: z.enum(["claude", "gemini", "openai"]).optional(),
  kind: z
    .enum(["agent", "skill", "command", "mcp", "setting", "component"])
    .optional(),
  minQuality: z.number().min(0).max(100).default(0),
});

const SearchGetSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(20).default(5),
  platform: z.enum(["claude", "gemini", "openai"]).optional(),
  kind: z
    .enum(["agent", "skill", "command", "mcp", "setting", "component"])
    .optional(),
});

// Claude-compatible tool definition
interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: string[];
      }
    >;
    required: string[];
  };
}

// Search result with metadata
interface ToolSearchResult {
  tool: ToolDefinition;
  metadata: {
    id: string;
    kind: string;
    category: string;
    tags: string[];
    install: string;
    platforms: string[];
    qualityScore: number;
    installs: number;
  };
  score: number;
}

// Generate input schema based on agent type
function generateInputSchema(
  item: (typeof REGISTRY)[0]
): ToolDefinition["input_schema"] {
  const baseSchema: ToolDefinition["input_schema"] = {
    type: "object",
    properties: {
      task: {
        type: "string",
        description: "The specific task or query for this tool to perform",
      },
    },
    required: ["task"],
  };

  // Add category-specific parameters
  if (item.category === "Trading & DeFi") {
    baseSchema.properties.token = {
      type: "string",
      description: "Token address or symbol",
    };
    baseSchema.properties.chain = {
      type: "string",
      description: "Blockchain network",
      enum: ["solana", "ethereum", "base", "arbitrum", "polygon"],
    };
  }

  if (item.category === "Security & Audit") {
    baseSchema.properties.contract = {
      type: "string",
      description: "Contract address or code to audit",
    };
    baseSchema.properties.severity = {
      type: "string",
      description: "Minimum severity level to report",
      enum: ["low", "medium", "high", "critical"],
    };
  }

  if (item.category === "Content & Marketing") {
    baseSchema.properties.topic = {
      type: "string",
      description: "Content topic or keyword",
    };
    baseSchema.properties.format = {
      type: "string",
      description: "Output format",
      enum: ["blog", "tweet", "thread", "documentation"],
    };
  }

  if (item.kind === "component") {
    baseSchema.properties.customization = {
      type: "string",
      description: "Customization requirements for the component",
    };
  }

  return baseSchema;
}

// Convert registry item to Claude tool definition
function itemToToolDefinition(item: (typeof REGISTRY)[0]): ToolDefinition {
  // Create a valid tool name (alphanumeric + underscores only)
  const toolName = item.slug.replace(/-/g, "_");

  return {
    name: toolName,
    description: `${item.name}: ${item.description}${item.longDescription ? ` ${item.longDescription.slice(0, 200)}...` : ""}`,
    input_schema: generateInputSchema(item),
  };
}

// Simple text search scoring
function scoreMatch(item: (typeof REGISTRY)[0], query: string): number {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);
  let score = 0;

  // Exact name match
  if (item.name.toLowerCase() === queryLower) score += 100;
  if (item.slug.includes(queryLower.replace(/\s+/g, "-"))) score += 80;

  // Partial matches
  for (const word of words) {
    if (item.name.toLowerCase().includes(word)) score += 30;
    if (item.description.toLowerCase().includes(word)) score += 20;
    if (item.longDescription?.toLowerCase().includes(word)) score += 10;
    if (item.tags.some((t) => t.toLowerCase().includes(word))) score += 25;
    if (item.category.toLowerCase().includes(word)) score += 15;
  }

  // Boost by quality and popularity
  score += (item.audit?.qualityScore || 0) * 0.2;
  score += Math.log((item.installs || 0) + 1) * 2;

  return score;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parseResult = SearchPostSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { query, limit, platform, kind, minQuality } = parseResult.data;

    const startTime = performance.now();

    // Filter and score items
    let items = REGISTRY.filter((item) => {
      if (platform && !(item.platforms || []).includes(platform)) return false;
      if (kind && item.kind !== kind) return false;
      if (minQuality && (item.audit?.qualityScore || 0) < minQuality)
        return false;
      return true;
    })
      .map((item) => ({
        item,
        score: scoreMatch(item, query),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(limit, 20));

    // Convert to tool definitions
    const results: ToolSearchResult[] = items.map(({ item, score }) => ({
      tool: itemToToolDefinition(item),
      metadata: {
        id: item.id,
        kind: item.kind,
        category: item.category,
        tags: item.tags,
        install: item.install,
        platforms: item.platforms || [],
        qualityScore: item.audit?.qualityScore || 0,
        installs: item.installs || 0,
      },
      score,
    }));

    const searchTime = performance.now() - startTime;

    return NextResponse.json({
      tools: results.map((r) => r.tool),
      results,
      meta: {
        query,
        totalMatches: results.length,
        searchTime: Math.round(searchTime * 100) / 100,
        platform,
        kind,
      },
    });
  } catch (error) {
    console.error("Tool search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET for simple queries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate with Zod
  const parseResult = SearchGetSchema.safeParse({
    query: searchParams.get("q") || searchParams.get("query") || "",
    limit: searchParams.get("limit") || "5",
    platform: searchParams.get("platform") || undefined,
    kind: searchParams.get("kind") || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parseResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { query, limit, platform, kind } = parseResult.data;

  // Reuse POST logic
  const fakeRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify({ query, limit, platform, kind }),
  });

  return POST(fakeRequest);
}

export const runtime = "nodejs";
