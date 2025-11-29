import { BaseAgent } from "@gicm/agent-core";
import type { AgentConfig, AgentContext, AgentResult } from "@gicm/agent-core";
import { z } from "zod";

export const BuildRequestSchema = z.object({
  discoveryId: z.string(),
  type: z.enum(["agent", "skill", "mcp", "integration"]),
  name: z.string(),
  description: z.string(),
  sourceUrl: z.string().url(),
});
export type BuildRequest = z.infer<typeof BuildRequestSchema>;

export const BuildResultSchema = z.object({
  buildId: z.string(),
  request: BuildRequestSchema,
  status: z.enum(["pending", "building", "testing", "completed", "failed"]),
  outputPath: z.string().optional(),
  artifacts: z.array(z.string()).default([]),
  error: z.string().optional(),
});
export type BuildResult = z.infer<typeof BuildResultSchema>;

export interface BuilderAgentConfig extends AgentConfig {
  outputDir?: string;
}

export class BuilderAgent extends BaseAgent {
  private outputDir: string;

  constructor(config: BuilderAgentConfig) {
    super("builder", config);
    this.outputDir = config.outputDir ?? "./generated";
  }

  getSystemPrompt(): string {
    return `You are a code generation agent for gICM.
Your role is to create integrations from approved discoveries:
- Agent wrappers for external tools
- Skills for the marketplace
- MCP server integrations
- Direct library integrations

Generate clean, TypeScript-first code following gICM patterns.`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const action = context.action ?? "build";

    switch (action) {
      case "build":
        return this.handleBuild(context.params?.request as BuildRequest);
      case "status":
        return this.createResult(true, { outputDir: this.outputDir });
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }

  async build(request: BuildRequest): Promise<BuildResult> {
    this.log(`Building ${request.type}: ${request.name}`);

    // For MVP, create a placeholder build result
    // Full implementation would use LLM to generate code
    const buildId = `build-${Date.now()}`;

    return {
      buildId,
      request,
      status: "completed",
      outputPath: `${this.outputDir}/${request.name}`,
      artifacts: [`${request.name}/index.ts`, `${request.name}/package.json`],
    };
  }

  private async handleBuild(request?: BuildRequest): Promise<AgentResult> {
    if (!request) {
      return this.createResult(false, null, "No build request provided");
    }

    try {
      const result = await this.build(request);
      return this.createResult(true, result, undefined, 0.9, `Built ${request.name}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Build failed";
      return this.createResult(false, null, msg);
    }
  }
}
