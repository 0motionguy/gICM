/**
 * OPUS 67 Phase 3+4 MCP Handler Tests
 *
 * Tests the 11 new handlers added during the overhaul.
 * These are unit tests — they mock external services (Obsidian, fleet, Hermes).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the handler functions directly, not the MCP server
// Import types for handler context
import type { HandlerContext } from "../mcp-server/handlers.js";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Create a minimal handler context
function createMockContext(): HandlerContext {
  return {
    skills: [
      {
        id: "test-skill",
        name: "test-skill",
        description: "A test skill",
        category: "testing",
        token_cost: 500,
        keywords: ["test"],
        tier: 1,
      },
      {
        id: "react-patterns",
        name: "react-patterns",
        description: "React component patterns",
        category: "frontend",
        token_cost: 1200,
        keywords: ["react"],
        tier: 1,
      },
    ] as any[],
    mcpConnections: [] as any[],
    modes: [
      { id: "auto", name: "Auto", description: "Auto-detect" },
      { id: "build", name: "Build", description: "Code generation" },
      { id: "light", name: "Light", description: "Quick tasks" },
    ] as any[],
    packageRoot: "/mock/path",
  };
}

describe("Phase 2: Analytics Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleToolMetrics returns 'no metrics' when empty", async () => {
    const { handleToolMetrics } = await import("../mcp-server/handlers.js");
    const result = handleToolMetrics({});
    expect(result.content[0].text).toContain("No tool metrics recorded");
    expect(result.isError).toBeUndefined();
  });

  it("handleUnhealthyTools returns 'all healthy' when empty", async () => {
    const { handleUnhealthyTools } = await import("../mcp-server/handlers.js");
    const result = handleUnhealthyTools();
    expect(result.content[0].text).toContain("All tracked tools are healthy");
    expect(result.isError).toBeUndefined();
  });
});

describe("Phase 2: Progressive Disclosure", () => {
  it("handleSkillSummaries returns compact summaries", async () => {
    const { handleSkillSummaries } = await import("../mcp-server/handlers.js");
    const ctx = createMockContext();
    const result = handleSkillSummaries(ctx, {});
    expect(result.content[0].text).toContain("Skill Summaries");
    expect(result.content[0].text).toContain("test-skill");
    expect(result.content[0].text).toContain("react-patterns");
    expect(result.content[0].text).toContain("opus67_get_skill");
  });

  it("handleSkillSummaries filters by category", async () => {
    const { handleSkillSummaries } = await import("../mcp-server/handlers.js");
    const ctx = createMockContext();
    const result = handleSkillSummaries(ctx, { category: "frontend" });
    expect(result.content[0].text).toContain("react-patterns");
    expect(result.content[0].text).not.toContain("**test-skill**");
  });

  it("handleTokenBudget shows all modes", async () => {
    const { handleTokenBudget } = await import("../mcp-server/handlers.js");
    const ctx = createMockContext();
    const result = handleTokenBudget(ctx, { mode: "build" });
    expect(result.content[0].text).toContain("Token Budget");
    expect(result.content[0].text).toContain("**build**");
    expect(result.content[0].text).toContain("32,000 tokens");
  });
});

describe("Phase 3: Wiki Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleWikiSearch requires query param", async () => {
    const { handleWikiSearch } = await import("../mcp-server/handlers.js");
    const result = await handleWikiSearch({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("query is required");
  });

  it("handleWikiSearch returns results on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          filename: "venues/canggu.md",
          matches: [{ context: "Canggu is a popular coworking area" }],
        },
      ],
    });

    const { handleWikiSearch } = await import("../mcp-server/handlers.js");
    const result = await handleWikiSearch({ query: "canggu" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("canggu");
    expect(result.content[0].text).toContain("venues/canggu.md");
  });

  it("handleWikiSearch handles Obsidian offline gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const { handleWikiSearch } = await import("../mcp-server/handlers.js");
    const result = await handleWikiSearch({ query: "test" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("ECONNREFUSED");
    expect(result.content[0].text).toContain("Obsidian");
  });

  it("handleWikiRead requires path param", async () => {
    const { handleWikiRead } = await import("../mcp-server/handlers.js");
    const result = await handleWikiRead({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("path is required");
  });

  it("handleWikiWrite requires path and content", async () => {
    const { handleWikiWrite } = await import("../mcp-server/handlers.js");
    const result = await handleWikiWrite({ path: "test.md" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("path and content are required");
  });
});

describe("Phase 3: Fleet Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleFleetAgents returns hardcoded roster", async () => {
    const { handleFleetAgents } = await import("../mcp-server/handlers.js");
    const result = await handleFleetAgents();
    expect(result.content[0].text).toContain("OpenClaw Fleet Agents");
    expect(result.content[0].text).toContain("main");
    expect(result.content[0].text).toContain("coder");
    expect(result.content[0].text).toContain("researcher");
    expect(result.content[0].text).toContain("trading");
    expect(result.content[0].text).toContain("growth");
  });

  it("handleFleetStatus handles gateway offline gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ETIMEDOUT"));

    const { handleFleetStatus } = await import("../mcp-server/handlers.js");
    const result = await handleFleetStatus();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Fleet unreachable");
    expect(result.content[0].text).toContain("Tailscale");
  });

  it("handleFleetDispatch requires agent and task", async () => {
    const { handleFleetDispatch } = await import("../mcp-server/handlers.js");
    const result = await handleFleetDispatch({ agent: "coder" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("agent and task are required");
  });
});

describe("Phase 3: Hermes Handler", () => {
  it("handleHermesQuery requires query param", async () => {
    const { handleHermesQuery } = await import("../mcp-server/handlers.js");
    const result = await handleHermesQuery({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("query is required");
  });
});

describe("Router: all new tools are wired", () => {
  it("handleToolCall routes all Phase 2+3 tools", async () => {
    const { handleToolCall } = await import("../mcp-server/handlers.js");
    const ctx = createMockContext();

    // Phase 2 tools should NOT return "Unknown tool"
    const p2tools = [
      "opus67_toolMetrics",
      "opus67_unhealthyTools",
      "opus67_skillSummaries",
      "opus67_tokenBudget",
    ];
    for (const tool of p2tools) {
      const result = await handleToolCall(tool, {}, ctx);
      expect(result.content[0].text).not.toContain("Unknown tool");
    }

    // Phase 3 tools — wiki/fleet need external services but should NOT be "Unknown"
    const p3tools = [
      "opus67_wikiSearch",
      "opus67_wikiRead",
      "opus67_wikiWrite",
      "opus67_fleetStatus",
      "opus67_fleetDispatch",
      "opus67_fleetAgents",
      "opus67_hermesQuery",
    ];
    for (const tool of p3tools) {
      const result = await handleToolCall(tool, {}, ctx);
      // These will return errors (missing params or offline services) but NOT "Unknown tool"
      expect(result.content[0].text).not.toContain("Unknown tool");
    }
  });

  it("unknown tools return error", async () => {
    const { handleToolCall } = await import("../mcp-server/handlers.js");
    const ctx = createMockContext();
    const result = await handleToolCall("opus67_doesNotExist", {}, ctx);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown tool");
  });
});
