import { BaseAgent } from "@gicm/agent-core";
import type { AgentConfig, AgentContext, AgentResult } from "@gicm/agent-core";
import { z } from "zod";

export const DeployTargetSchema = z.enum(["gicm_registry", "npm", "github"]);
export type DeployTarget = z.infer<typeof DeployTargetSchema>;

export const DeployRequestSchema = z.object({
  buildId: z.string(),
  name: z.string(),
  version: z.string(),
  targets: z.array(DeployTargetSchema),
  changelog: z.string().optional(),
});
export type DeployRequest = z.infer<typeof DeployRequestSchema>;

export const DeployResultSchema = z.object({
  deployId: z.string(),
  request: DeployRequestSchema,
  status: z.enum(["pending", "deploying", "completed", "failed"]),
  results: z.array(z.object({
    target: DeployTargetSchema,
    success: z.boolean(),
    url: z.string().optional(),
    error: z.string().optional(),
  })),
});
export type DeployResult = z.infer<typeof DeployResultSchema>;

export interface DeployerAgentConfig extends AgentConfig {
  registryApiUrl?: string;
  npmToken?: string;
  githubToken?: string;
}

export class DeployerAgent extends BaseAgent {
  private registryApiUrl: string;

  constructor(config: DeployerAgentConfig) {
    super("deployer", config);
    this.registryApiUrl = config.registryApiUrl ?? "https://gicm.dev/api";
  }

  getSystemPrompt(): string {
    return `You are a deployment agent for gICM.
Your role is to publish built integrations to:
- gICM Registry (marketplace)
- npm (package manager)
- GitHub (releases)

Validate builds before deployment and handle rollbacks on failure.`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const action = context.action ?? "deploy";

    switch (action) {
      case "deploy":
        return this.handleDeploy(context.params?.request as DeployRequest);
      case "status":
        return this.createResult(true, { registryApiUrl: this.registryApiUrl });
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }

  async deploy(request: DeployRequest): Promise<DeployResult> {
    this.log(`Deploying ${request.name}@${request.version} to ${request.targets.join(", ")}`);

    const deployId = `deploy-${Date.now()}`;
    const results: DeployResult["results"] = [];

    for (const target of request.targets) {
      try {
        const url = await this.deployToTarget(target, request);
        results.push({ target, success: true, url });
        this.log(`✓ Deployed to ${target}: ${url}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Deploy failed";
        results.push({ target, success: false, error: msg });
        this.log(`✗ Failed to deploy to ${target}: ${msg}`);
      }
    }

    const allSuccess = results.every((r) => r.success);

    return {
      deployId,
      request,
      status: allSuccess ? "completed" : "failed",
      results,
    };
  }

  private async deployToTarget(
    target: DeployTarget,
    request: DeployRequest
  ): Promise<string> {
    switch (target) {
      case "gicm_registry":
        return this.deployToRegistry(request);
      case "npm":
        return this.deployToNpm(request);
      case "github":
        return this.deployToGitHub(request);
      default:
        throw new Error(`Unknown target: ${target}`);
    }
  }

  private async deployToRegistry(request: DeployRequest): Promise<string> {
    // Placeholder - would call gICM registry API
    return `${this.registryApiUrl}/items/${request.name}`;
  }

  private async deployToNpm(request: DeployRequest): Promise<string> {
    // Placeholder - would run npm publish
    return `https://npmjs.com/package/@gicm/${request.name}`;
  }

  private async deployToGitHub(request: DeployRequest): Promise<string> {
    // Placeholder - would create GitHub release
    return `https://github.com/gicm/${request.name}/releases/tag/v${request.version}`;
  }

  private async handleDeploy(request?: DeployRequest): Promise<AgentResult> {
    if (!request) {
      return this.createResult(false, null, "No deploy request provided");
    }

    try {
      const result = await this.deploy(request);
      const success = result.status === "completed";
      return this.createResult(
        success,
        result,
        success ? undefined : "Some deployments failed",
        success ? 1.0 : 0.5,
        `Deployed ${request.name}@${request.version}`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Deploy failed";
      return this.createResult(false, null, msg);
    }
  }
}
