// src/index.ts
import { BaseAgent } from "@gicm/agent-core";
import { z } from "zod";
var BuildRequestSchema = z.object({
  discoveryId: z.string(),
  type: z.enum(["agent", "skill", "mcp", "integration"]),
  name: z.string(),
  description: z.string(),
  sourceUrl: z.string().url()
});
var BuildResultSchema = z.object({
  buildId: z.string(),
  request: BuildRequestSchema,
  status: z.enum(["pending", "building", "testing", "completed", "failed"]),
  outputPath: z.string().optional(),
  artifacts: z.array(z.string()).default([]),
  error: z.string().optional()
});
var BuilderAgent = class extends BaseAgent {
  outputDir;
  constructor(config) {
    super("builder", config);
    this.outputDir = config.outputDir ?? "./generated";
  }
  getSystemPrompt() {
    return `You are a code generation agent for gICM.
Your role is to create integrations from approved discoveries:
- Agent wrappers for external tools
- Skills for the marketplace
- MCP server integrations
- Direct library integrations

Generate clean, TypeScript-first code following gICM patterns.`;
  }
  async analyze(context) {
    const action = context.action ?? "build";
    switch (action) {
      case "build":
        return this.handleBuild(context.params?.request);
      case "status":
        return this.createResult(true, { outputDir: this.outputDir });
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }
  async build(request) {
    this.log(`Building ${request.type}: ${request.name}`);
    const buildId = `build-${Date.now()}`;
    return {
      buildId,
      request,
      status: "completed",
      outputPath: `${this.outputDir}/${request.name}`,
      artifacts: [`${request.name}/index.ts`, `${request.name}/package.json`]
    };
  }
  async handleBuild(request) {
    if (!request) {
      return this.createResult(false, null, "No build request provided");
    }
    try {
      const result = await this.build(request);
      return this.createResult(true, result, void 0, 0.9, `Built ${request.name}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Build failed";
      return this.createResult(false, null, msg);
    }
  }
};
export {
  BuildRequestSchema,
  BuildResultSchema,
  BuilderAgent
};
