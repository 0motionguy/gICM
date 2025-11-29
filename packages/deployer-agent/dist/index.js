// src/index.ts
import { BaseAgent } from "@gicm/agent-core";
import { z } from "zod";
var DeployTargetSchema = z.enum(["gicm_registry", "npm", "github"]);
var DeployRequestSchema = z.object({
  buildId: z.string(),
  name: z.string(),
  version: z.string(),
  targets: z.array(DeployTargetSchema),
  changelog: z.string().optional()
});
var DeployResultSchema = z.object({
  deployId: z.string(),
  request: DeployRequestSchema,
  status: z.enum(["pending", "deploying", "completed", "failed"]),
  results: z.array(z.object({
    target: DeployTargetSchema,
    success: z.boolean(),
    url: z.string().optional(),
    error: z.string().optional()
  }))
});
var DeployerAgent = class extends BaseAgent {
  registryApiUrl;
  constructor(config) {
    super("deployer", config);
    this.registryApiUrl = config.registryApiUrl ?? "https://gicm.dev/api";
  }
  getSystemPrompt() {
    return `You are a deployment agent for gICM.
Your role is to publish built integrations to:
- gICM Registry (marketplace)
- npm (package manager)
- GitHub (releases)

Validate builds before deployment and handle rollbacks on failure.`;
  }
  async analyze(context) {
    const action = context.action ?? "deploy";
    switch (action) {
      case "deploy":
        return this.handleDeploy(context.params?.request);
      case "status":
        return this.createResult(true, { registryApiUrl: this.registryApiUrl });
      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }
  async deploy(request) {
    this.log(`Deploying ${request.name}@${request.version} to ${request.targets.join(", ")}`);
    const deployId = `deploy-${Date.now()}`;
    const results = [];
    for (const target of request.targets) {
      try {
        const url = await this.deployToTarget(target, request);
        results.push({ target, success: true, url });
        this.log(`\u2713 Deployed to ${target}: ${url}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Deploy failed";
        results.push({ target, success: false, error: msg });
        this.log(`\u2717 Failed to deploy to ${target}: ${msg}`);
      }
    }
    const allSuccess = results.every((r) => r.success);
    return {
      deployId,
      request,
      status: allSuccess ? "completed" : "failed",
      results
    };
  }
  async deployToTarget(target, request) {
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
  async deployToRegistry(request) {
    return `${this.registryApiUrl}/items/${request.name}`;
  }
  async deployToNpm(request) {
    return `https://npmjs.com/package/@gicm/${request.name}`;
  }
  async deployToGitHub(request) {
    return `https://github.com/gicm/${request.name}/releases/tag/v${request.version}`;
  }
  async handleDeploy(request) {
    if (!request) {
      return this.createResult(false, null, "No deploy request provided");
    }
    try {
      const result = await this.deploy(request);
      const success = result.status === "completed";
      return this.createResult(
        success,
        result,
        success ? void 0 : "Some deployments failed",
        success ? 1 : 0.5,
        `Deployed ${request.name}@${request.version}`
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Deploy failed";
      return this.createResult(false, null, msg);
    }
  }
};
export {
  DeployRequestSchema,
  DeployResultSchema,
  DeployTargetSchema,
  DeployerAgent
};
