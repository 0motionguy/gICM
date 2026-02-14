/**
 * ClawdBot MCP Tools
 *
 * Wraps the ClawdBot API into MCP-compatible tool definitions.
 * Each tool calls the live ClawdBot API at clawdbot.com.
 */

const API_BASE = "https://clawdbot.com/api";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "clawdbot_search",
    description:
      "Search the ClawdBot marketplace for Web3/Solana/DeFi skills, agents, MCPs, and commands. Returns matching items with install instructions.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query (e.g. 'solana wallet', 'defi yield', 'nft mint')",
        },
        kind: {
          type: "string",
          enum: ["agent", "skill", "mcp", "command"],
          description: "Filter by item kind",
        },
        ecosystem: {
          type: "string",
          enum: ["clawdhub-native", "clawdbot-exclusive"],
          description: "Filter by ecosystem",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "clawdbot_install",
    description:
      "Get installation instructions for a ClawdBot skill. Returns install command, dependencies, and environment variables needed.",
    inputSchema: {
      type: "object",
      properties: {
        skill_id: {
          type: "string",
          description: "Skill ID, slug, or name to install",
        },
      },
      required: ["skill_id"],
    },
  },
  {
    name: "clawdbot_verify",
    description:
      "Check the security status and audit results for a ClawdBot skill. Returns threat level, security score, and vulnerability count.",
    inputSchema: {
      type: "object",
      properties: {
        skill_name: {
          type: "string",
          description: "Skill name, ID, or slug to verify",
        },
      },
      required: ["skill_name"],
    },
  },
];

async function apiCall(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "clawdbot-mcp-server/1.0.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `ClawdBot API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    let result: unknown;

    switch (name) {
      case "clawdbot_search": {
        const params = new URLSearchParams();
        params.set("q", args.query as string);
        if (args.kind) params.set("kind", args.kind as string);
        if (args.ecosystem) params.set("ecosystem", args.ecosystem as string);
        result = await apiCall(`${API_BASE}/search?${params}`);
        break;
      }

      case "clawdbot_install": {
        // Use the A2A tasks endpoint for install
        const response = await fetch(`${API_BASE}/a2a/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "clawdbot-mcp-server/1.0.0",
          },
          body: JSON.stringify({
            skill: "install-skill",
            input: args.skill_id as string,
          }),
        });
        result = await response.json();
        break;
      }

      case "clawdbot_verify": {
        // Use the A2A tasks endpoint for verify
        const response = await fetch(`${API_BASE}/a2a/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "clawdbot-mcp-server/1.0.0",
          },
          body: JSON.stringify({
            skill: "verify-skill",
            input: args.skill_name as string,
          }),
        });
        result = await response.json();
        break;
      }

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
