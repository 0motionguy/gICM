import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { REGISTRY } from "@/lib/registry";
import type { RegistryItem } from "@/types/registry";
import {
  calculateCost,
  hashPrompt,
  trackAPIUsage,
  checkRateLimit,
  cacheWorkflowResponse,
  getCachedWorkflowResponse,
} from "@/lib/api-usage";
import { z } from "zod";

const WorkflowRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  sessionId: z.string().max(100).optional(),
});

// OPUS 67 - Always included as the BASE of every stack
const OPUS_67_BASE: RegistryItem = {
  id: "opus67-base",
  kind: "workflow",
  name: "OPUS 67",
  slug: "opus67",
  description:
    "The AI enhancement layer. 141 skills, 82 MCPs, 30 modes. Required foundation for all stacks.",
  longDescription:
    "OPUS 67 is the universal foundation that supercharges any AI model. It provides 141 specialist skills, 82 MCP server connections, 30 optimized modes, and persistent memory across sessions. Every stack recommendation starts with OPUS 67 as the base layer.",
  category: "Foundation",
  tags: ["base", "foundation", "required", "opus67", "core"],
  dependencies: [],
  files: [".claude/CLAUDE.md", ".gemini/GEMINI.md", ".openai/OPENAI.md"],
  install: "npx create-opus67@latest",
  layer: ".claude",
  modelRecommendation: "opus-4.5",
  envKeys: [],
  installs: 50000,
  remixes: 12000,
  tokenSavings: 95,
  platforms: ["claude", "gemini", "openai"],
  compatibility: {
    models: ["opus-4.5", "sonnet-4.5", "sonnet", "gemini-2.0-flash", "gpt-4o"],
    software: ["vscode", "cursor", "terminal", "windsurf"],
  },
  audit: {
    lastAudited: "2025-12-11",
    qualityScore: 99,
    status: "VERIFIED",
  },
};

// Helper to prepend OPUS 67 to any items list
function prependOpus67(items: RegistryItem[]): RegistryItem[] {
  // Filter out any duplicate if OPUS 67 is somehow already there
  const filtered = items.filter((i) => i.id !== "opus67-base");
  return [OPUS_67_BASE, ...filtered];
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Helper to get fallback items based on keywords
function getFallbackItems(prompt: string): {
  items: RegistryItem[];
  reasoning: string;
} {
  const promptLower = prompt.toLowerCase();
  let items: RegistryItem[] = [];
  let reasoning = "Here's a recommended stack based on your requirements:";

  // Match keywords to relevant items
  if (
    promptLower.includes("solana") ||
    promptLower.includes("defi") ||
    promptLower.includes("blockchain") ||
    promptLower.includes("trading") ||
    promptLower.includes("bot") ||
    promptLower.includes("crypto") ||
    promptLower.includes("token")
  ) {
    items = REGISTRY.filter((item) =>
      item.tags?.some((tag) => {
        const t = tag.toLowerCase();
        return (
          t.includes("solana") ||
          t.includes("blockchain") ||
          t.includes("defi") ||
          t.includes("web3") ||
          t.includes("crypto")
        );
      })
    ).slice(0, 6);
    reasoning =
      "For your Solana/DeFi project, here are the best agents and skills:";
  } else if (
    promptLower.includes("react") ||
    promptLower.includes("frontend") ||
    promptLower.includes("next") ||
    promptLower.includes("ui") ||
    promptLower.includes("tailwind") ||
    promptLower.includes("css")
  ) {
    items = REGISTRY.filter((item) =>
      item.tags?.some((tag) => {
        const t = tag.toLowerCase();
        return (
          t.includes("react") ||
          t.includes("frontend") ||
          t.includes("next") ||
          t.includes("typescript") ||
          t.includes("ui")
        );
      })
    ).slice(0, 6);
    reasoning = "For your frontend project, here are recommended tools:";
  } else if (
    promptLower.includes("api") ||
    promptLower.includes("backend") ||
    promptLower.includes("node") ||
    promptLower.includes("server") ||
    promptLower.includes("database")
  ) {
    items = REGISTRY.filter((item) =>
      item.tags?.some((tag) => {
        const t = tag.toLowerCase();
        return (
          t.includes("api") ||
          t.includes("backend") ||
          t.includes("node") ||
          t.includes("database") ||
          t.includes("server")
        );
      })
    ).slice(0, 6);
    reasoning = "For your backend project, here are recommended tools:";
  } else if (
    promptLower.includes("ai") ||
    promptLower.includes("content") ||
    promptLower.includes("workflow") ||
    promptLower.includes("automation")
  ) {
    items = REGISTRY.filter((item) =>
      item.tags?.some((tag) => {
        const t = tag.toLowerCase();
        return (
          t.includes("ai") ||
          t.includes("automation") ||
          t.includes("workflow") ||
          t.includes("llm")
        );
      })
    ).slice(0, 6);
    reasoning = "For your AI workflow, here are recommended tools:";
  }

  // If no matches or too few, get a mix of popular items
  if (items.length < 3) {
    const agents = REGISTRY.filter((i) => i.kind === "agent").slice(0, 2);
    const skills = REGISTRY.filter((i) => i.kind === "skill").slice(0, 2);
    const mcps = REGISTRY.filter((i) => i.kind === "mcp").slice(0, 2);
    items = [...agents, ...skills, ...mcps];
    reasoning = "Here's a versatile starter stack with essential tools:";
  }

  // Final fallback - most popular items
  if (items.length === 0) {
    items = [...REGISTRY]
      .sort((a, b) => (b.installs || 0) - (a.installs || 0))
      .slice(0, 6);
    reasoning = "Here are the most popular tools to get started:";
  }

  return { items, reasoning };
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let sessionId = "anonymous";
  let parsedPrompt = "";

  try {
    const body = await request.json();
    parsedPrompt = body.prompt || "";

    // Validate with Zod
    const parseResult = WorkflowRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { prompt, sessionId: clientSessionId } = parseResult.data;
    sessionId = clientSessionId || "anonymous";

    // Check rate limit
    const rateLimit = checkRateLimit(sessionId);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil(
        (rateLimit.resetTime - Date.now()) / 1000 / 60
      );
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Please wait ${waitMinutes} minute(s) before making another request`,
          resetTime: rateLimit.resetTime,
          remainingRequests: 0,
        },
        { status: 429 }
      );
    }

    // Check cache
    const promptHash = hashPrompt(prompt);
    const cachedResponse = getCachedWorkflowResponse(promptHash);
    if (cachedResponse) {
      // Track cache hit (no tokens used, no cost)
      trackAPIUsage({
        timestamp: new Date().toISOString(),
        sessionId,
        endpoint: "workflow/build",
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        responseTime: Date.now() - startTime,
        success: true,
        promptHash,
      });

      return NextResponse.json({
        ...cachedResponse,
        cached: true,
        remainingRequests: rateLimit.remainingRequests - 1,
      });
    }

    // Build a catalog description for Claude
    const catalogDescription = REGISTRY.map((item) => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      description: item.description,
      tags: item.tags,
      category: item.category,
      tokenSavings: item.tokenSavings,
    }));

    // Create the system prompt
    const systemPrompt = `You are an expert AI assistant helping developers build optimal tech stacks. You have access to a catalog of agents, skills, commands, and MCP integrations.

Your task is to analyze the user's project description and recommend the most suitable items from the catalog. Consider:
1. The user's specific needs and requirements
2. How items complement each other
3. Avoiding redundancy
4. Maximizing token savings
5. Best practices for the mentioned technologies

Available catalog items:
${JSON.stringify(catalogDescription, null, 2)}

Respond with a JSON object in this exact format:
{
  "itemIds": ["id1", "id2", "id3"],
  "reasoning": "Brief explanation of why these items were chosen and how they work together"
}

Only include item IDs that exist in the catalog. Be selective - quality over quantity.`;

    // Call Claude API with prompt caching
    // Cache the system prompt (catalog) for 5 minutes - saves 90% on repeated requests
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
    });

    // Parse Claude's response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (Claude might wrap it in markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const aiResponse = JSON.parse(jsonMatch[0]);
    const { itemIds, reasoning } = aiResponse;

    if (!Array.isArray(itemIds)) {
      throw new Error("Invalid response format from AI");
    }

    // Get the actual items
    const rawItems = itemIds
      .map((id) => REGISTRY.find((item) => item.id === id))
      .filter((item): item is RegistryItem => item !== undefined);

    if (rawItems.length === 0) {
      throw new Error("No matching items found");
    }

    // ALWAYS prepend OPUS 67 as the base layer
    const items = prependOpus67(rawItems);

    // Calculate stats (OPUS 67 counted as workflow)
    const breakdown = {
      agents: items.filter((i) => i!.kind === "agent").length,
      skills: items.filter((i) => i!.kind === "skill").length,
      commands: items.filter((i) => i!.kind === "command").length,
      mcps: items.filter((i) => i!.kind === "mcp").length,
      workflows: items.filter((i) => i!.kind === "workflow").length,
      settings: items.filter((i) => i!.kind === "setting").length,
    };

    const totalTokenSavings = items.reduce(
      (sum, item) => sum + (item!.tokenSavings || 0),
      0
    );

    const response = {
      items,
      reasoning: `**OPUS 67 (Base Layer)** provides 141 skills, 82 MCPs, and 30 modes as the foundation.\n\n${reasoning}`,
      totalTokenSavings,
      breakdown,
      cached: false,
      remainingRequests: rateLimit.remainingRequests - 1,
    };

    // Track API usage with cache info
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cacheCreationTokens = message.usage.cache_creation_input_tokens || 0;
    const cacheReadTokens = message.usage.cache_read_input_tokens || 0;
    const estimatedCost = calculateCost(
      inputTokens,
      outputTokens,
      cacheCreationTokens,
      cacheReadTokens
    );

    trackAPIUsage({
      timestamp: new Date().toISOString(),
      sessionId,
      endpoint: "workflow/build",
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCost,
      responseTime: Date.now() - startTime,
      success: true,
      promptHash,
    });

    // Cache the response
    cacheWorkflowResponse(promptHash, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Workflow build error:", error);

    // Track failed request
    trackAPIUsage({
      timestamp: new Date().toISOString(),
      sessionId,
      endpoint: "workflow/build",
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
      responseTime: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    // Use smart fallback - always returns results
    const fallbackResult = getFallbackItems(parsedPrompt);

    // ALWAYS prepend OPUS 67 as the base layer
    const items = prependOpus67(fallbackResult.items);

    const breakdown = {
      agents: items.filter((i) => i.kind === "agent").length,
      skills: items.filter((i) => i.kind === "skill").length,
      commands: items.filter((i) => i.kind === "command").length,
      mcps: items.filter((i) => i.kind === "mcp").length,
      workflows: items.filter((i) => i.kind === "workflow").length,
      settings: items.filter((i) => i.kind === "setting").length,
    };

    // Return 200 with fallback data - don't throw error to client
    return NextResponse.json({
      items,
      reasoning: `**OPUS 67 (Base Layer)** provides 141 skills, 82 MCPs, and 30 modes as the foundation.\n\n${fallbackResult.reasoning}`,
      totalTokenSavings: items.reduce(
        (sum, item) => sum + (item.tokenSavings || 0),
        0
      ),
      breakdown,
      fallback: true,
    });
  }
}

export const runtime = "nodejs";
