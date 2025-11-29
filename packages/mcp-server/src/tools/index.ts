/**
 * MCP Tools for gICM Context Engine
 */

import { searchComponents } from "./search-components.js";
import { searchCodebase } from "./search-codebase.js";
import { getFileContext } from "./get-file-context.js";
import { indexRepository } from "./index-repository.js";
import {
  getMarketData,
  analyzeToken,
  tradingTools,
} from "./trading/index.js";

// Tool definitions
export const tools = {
  search_components: {
    description:
      "Find gICM marketplace components, agents, skills, MCPs, and workflows by natural language query",
    parameters: {
      query: {
        type: "string",
        description: "Natural language description of what you need",
      },
      kind: {
        type: "string",
        description: "Filter by kind",
        enum: ["agent", "skill", "command", "mcp", "workflow", "component"],
        optional: true,
      },
      platform: {
        type: "string",
        description: "Filter by platform compatibility",
        enum: ["claude", "gemini", "openai"],
        optional: true,
      },
      limit: {
        type: "number",
        description: "Maximum results to return",
        default: 5,
        optional: true,
      },
    },
  },

  search_codebase: {
    description: "Semantic search across indexed Git repositories",
    parameters: {
      query: {
        type: "string",
        description: "Natural language search query",
      },
      repository: {
        type: "string",
        description: "Filter to specific repository name",
        optional: true,
      },
      language: {
        type: "string",
        description: "Filter by programming language (e.g., 'ts', 'py', 'rs')",
        optional: true,
      },
      limit: {
        type: "number",
        description: "Maximum results to return",
        default: 10,
        optional: true,
      },
    },
  },

  get_file_context: {
    description: "Get specific lines from an indexed file",
    parameters: {
      repository: {
        type: "string",
        description: "Repository name",
      },
      file_path: {
        type: "string",
        description: "Path to file within repository",
      },
      start_line: {
        type: "number",
        description: "Starting line number",
      },
      end_line: {
        type: "number",
        description: "Ending line number (max 200 lines)",
      },
    },
  },

  index_repository: {
    description: "Index a Git repository for future searches",
    parameters: {
      url: {
        type: "string",
        description: "Git repository URL",
      },
      branch: {
        type: "string",
        description: "Branch to index",
        default: "main",
        optional: true,
      },
    },
  },

  // Trading tools
  ...tradingTools,
};

// Tool handler
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    let result: unknown;

    switch (name) {
      case "search_components":
        result = await searchComponents(
          args.query as string,
          args.kind as string | undefined,
          args.platform as string | undefined,
          (args.limit as number) || 5
        );
        break;

      case "search_codebase":
        result = await searchCodebase(
          args.query as string,
          args.repository as string | undefined,
          args.language as string | undefined,
          (args.limit as number) || 10
        );
        break;

      case "get_file_context":
        result = await getFileContext(
          args.repository as string,
          args.file_path as string,
          args.start_line as number,
          args.end_line as number
        );
        break;

      case "index_repository":
        result = await indexRepository(
          args.url as string,
          (args.branch as string) || "main"
        );
        break;

      // Trading tools
      case "get_market_data":
        result = await getMarketData(
          args.token as string,
          (args.chain as string) || "solana"
        );
        break;

      case "analyze_token":
        result = await analyzeToken(
          args.token as string,
          (args.chain as string) || "solana",
          (args.mode as "full" | "fast" | "degen") || "full"
        );
        break;

      case "quick_signal":
        result = await analyzeToken(
          args.token as string,
          (args.chain as string) || "solana",
          "fast"
        );
        break;

      case "compare_tokens":
        const tokens = args.tokens as string[];
        const chain = (args.chain as string) || "solana";
        const comparisons = await Promise.all(
          tokens.slice(0, 5).map((t) => analyzeToken(t, chain, "fast"))
        );
        result = {
          tokens: comparisons.map((c) => ({
            token: c.token,
            sentiment: c.sentiment,
            action: c.action,
            confidence: c.confidence,
          })),
          recommendation: comparisons
            .filter((c) => c.action === "buy")
            .map((c) => c.token),
        };
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}
