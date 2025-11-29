/**
 * Agent Templates
 *
 * Starter templates for different agent types.
 */

export interface AgentTemplate {
  name: string;
  description: string;
  files: {
    path: string;
    content: string;
  }[];
  dependencies: string[];
  devDependencies: string[];
}

export const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  /**
   * Basic agent template
   */
  basic: {
    name: "Basic Agent",
    description: "Simple agent with LLM integration",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async run(input: string): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: input }],
      system: \`You are the {{NAME}} agent. {{DESCRIPTION}}\`,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }
    return "";
  }
}

export default {{CLASS_NAME}}Agent;
`,
      },
      {
        path: "src/types.ts",
        content: `/**
 * {{NAME}} Agent Types
 */

export interface {{CLASS_NAME}}Config {
  // Add configuration options here
}

export interface {{CLASS_NAME}}Result {
  success: boolean;
  data: unknown;
  error?: string;
}
`,
      },
      {
        path: "package.json",
        content: `{
  "name": "@gicm/{{PACKAGE_NAME}}-agent",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
`,
      },
    ],
    dependencies: ["@anthropic-ai/sdk"],
    devDependencies: ["tsup", "typescript", "vitest"],
  },

  /**
   * Tool-using agent template
   */
  tool_agent: {
    name: "Tool Agent",
    description: "Agent with tool/function calling capability",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Tool, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;
  private tools: Map<string, AgentTool> = new Map();

  constructor() {
    this.client = new Anthropic();
  }

  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  private getToolDefinitions(): Tool[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema as Tool["input_schema"],
    }));
  }

  async run(input: string): Promise<string> {
    const messages: Anthropic.Messages.MessageParam[] = [
      { role: "user", content: input },
    ];

    let response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: this.getToolDefinitions(),
      messages,
      system: \`You are the {{NAME}} agent. {{DESCRIPTION}}\`,
    });

    // Handle tool calls
    while (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter((c) => c.type === "tool_use");
      const toolResults: ToolResultBlockParam[] = [];

      for (const toolUse of toolUses) {
        if (toolUse.type !== "tool_use") continue;

        const tool = this.tools.get(toolUse.name);
        if (!tool) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: \`Unknown tool: \${toolUse.name}\`,
            is_error: true,
          });
          continue;
        }

        try {
          const result = await tool.execute(toolUse.input as Record<string, unknown>);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: \`Error: \${error}\`,
            is_error: true,
          });
        }
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: this.getToolDefinitions(),
        messages,
        system: \`You are the {{NAME}} agent. {{DESCRIPTION}}\`,
      });
    }

    const textContent = response.content.find((c) => c.type === "text");
    return textContent?.type === "text" ? textContent.text : "";
  }
}

export default {{CLASS_NAME}}Agent;
`,
      },
    ],
    dependencies: ["@anthropic-ai/sdk"],
    devDependencies: ["tsup", "typescript", "vitest"],
  },

  /**
   * Trading agent template
   */
  trading_agent: {
    name: "Trading Agent",
    description: "Agent for DeFi/trading operations",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Trading Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";
import { Connection, PublicKey } from "@solana/web3.js";

export interface TradingConfig {
  rpcUrl: string;
  walletAddress?: string;
}

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;
  private connection: Connection;
  private walletAddress?: PublicKey;

  constructor(config: TradingConfig) {
    this.client = new Anthropic();
    this.connection = new Connection(config.rpcUrl);
    if (config.walletAddress) {
      this.walletAddress = new PublicKey(config.walletAddress);
    }
  }

  async analyze(token: string): Promise<{
    recommendation: "buy" | "sell" | "hold";
    confidence: number;
    reasoning: string;
  }> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: \`Analyze token \${token} for trading opportunities.
Provide a recommendation (buy/sell/hold), confidence (0-100), and reasoning.\`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return { recommendation: "hold", confidence: 0, reasoning: "No analysis" };
    }

    // Parse response (simplified)
    const text = content.text.toLowerCase();
    return {
      recommendation: text.includes("buy") ? "buy" : text.includes("sell") ? "sell" : "hold",
      confidence: 50,
      reasoning: content.text,
    };
  }

  async getBalance(): Promise<number> {
    if (!this.walletAddress) return 0;
    return this.connection.getBalance(this.walletAddress);
  }
}

export default {{CLASS_NAME}}Agent;
`,
      },
    ],
    dependencies: ["@anthropic-ai/sdk", "@solana/web3.js"],
    devDependencies: ["tsup", "typescript", "vitest"],
  },

  /**
   * Research agent template
   */
  research_agent: {
    name: "Research Agent",
    description: "Agent for web research and analysis",
    files: [
      {
        path: "src/index.ts",
        content: `/**
 * {{NAME}} Research Agent
 *
 * {{DESCRIPTION}}
 */

import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import * as cheerio from "cheerio";

export interface ResearchResult {
  topic: string;
  summary: string;
  sources: string[];
  keyFindings: string[];
  confidence: number;
}

export class {{CLASS_NAME}}Agent {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async research(topic: string, sources?: string[]): Promise<ResearchResult> {
    // Fetch content from sources if provided
    let context = "";
    const usedSources: string[] = [];

    if (sources?.length) {
      for (const url of sources.slice(0, 3)) {
        try {
          const { data } = await axios.get(url, { timeout: 10000 });
          const $ = cheerio.load(data);
          const text = $("body").text().slice(0, 3000);
          context += \`\\n\\nSource (\${url}):\\n\${text}\`;
          usedSources.push(url);
        } catch {
          // Skip failed sources
        }
      }
    }

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: \`Research the following topic: \${topic}

\${context ? \`Available context:\\n\${context}\` : ""}

Provide:
1. A comprehensive summary
2. Key findings (bullet points)
3. Confidence level (0-100)\`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return {
        topic,
        summary: "Research failed",
        sources: usedSources,
        keyFindings: [],
        confidence: 0,
      };
    }

    return {
      topic,
      summary: content.text,
      sources: usedSources,
      keyFindings: [],
      confidence: 75,
    };
  }
}

export default {{CLASS_NAME}}Agent;
`,
      },
    ],
    dependencies: ["@anthropic-ai/sdk", "axios", "cheerio"],
    devDependencies: ["tsup", "typescript", "vitest", "@types/cheerio"],
  },
};

/**
 * Get template by name
 */
export function getTemplate(name: string): AgentTemplate | undefined {
  return AGENT_TEMPLATES[name];
}

/**
 * List available templates
 */
export function listTemplates(): Array<{ name: string; description: string }> {
  return Object.entries(AGENT_TEMPLATES).map(([key, template]) => ({
    name: key,
    description: template.description,
  }));
}
