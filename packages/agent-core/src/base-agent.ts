import type {
  AgentConfig,
  AgentContext,
  AgentResult,
  AgentTool,
} from "./types.js";

export abstract class BaseAgent {
  protected name: string;
  protected config: AgentConfig;
  protected tools: AgentTool[] = [];

  constructor(name: string, config: AgentConfig) {
    this.name = name;
    this.config = {
      ...config,
      name,
    };
  }

  abstract getSystemPrompt(): string;

  abstract analyze(context: AgentContext): Promise<AgentResult>;

  getName(): string {
    return this.name;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  getTools(): AgentTool[] {
    return this.tools;
  }

  protected registerTool(tool: AgentTool): void {
    this.tools.push(tool);
  }

  protected createResult(
    success: boolean,
    data?: unknown,
    error?: string,
    confidence?: number,
    reasoning?: string
  ): AgentResult {
    return {
      agent: this.name,
      success,
      data,
      error,
      confidence,
      reasoning,
      timestamp: Date.now(),
    };
  }

  protected log(message: string, data?: unknown): void {
    if (this.config.verbose) {
      console.log(`[${this.name}] ${message}`, data ?? "");
    }
  }

  protected parseJSON<T>(response: string): T | null {
    try {
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      this.log("Failed to parse JSON from response");
      return null;
    }
  }
}
