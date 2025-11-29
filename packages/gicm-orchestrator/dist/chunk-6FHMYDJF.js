// src/orchestrator.ts
import { EventEmitter } from "events";
import { CronJob } from "cron";
import { ActivityLogger } from "@gicm/activity-logger";
import { HunterAgent } from "@gicm/hunter-agent";
import { DecisionAgent } from "@gicm/decision-agent";
import { BuilderAgent } from "@gicm/builder-agent";
import { RefactorAgent } from "@gicm/refactor-agent";
import { DeployerAgent } from "@gicm/deployer-agent";
var GICMOrchestrator = class extends EventEmitter {
  config;
  state = "idle";
  autonomyLevel;
  // Agents
  hunter = null;
  decision = null;
  builder = null;
  refactor = null;
  deployer = null;
  // Activity logger
  logger = null;
  // Scheduled jobs
  jobs = /* @__PURE__ */ new Map();
  // Approval queue (for Level 2)
  pendingApprovals = /* @__PURE__ */ new Map();
  constructor(config) {
    super();
    this.config = config;
    this.autonomyLevel = config.autonomyLevel;
  }
  async start() {
    if (this.state === "running") {
      console.log("[Orchestrator] Already running");
      return;
    }
    this.state = "starting";
    console.log(`[Orchestrator] Starting in ${this.autonomyLevel} mode...`);
    try {
      if (this.config.activityLogger) {
        this.logger = new ActivityLogger({
          solana: this.config.activityLogger.solanaPrivateKey ? {
            rpcUrl: this.config.activityLogger.solanaRpcUrl ?? "https://api.mainnet-beta.solana.com",
            privateKey: this.config.activityLogger.solanaPrivateKey
          } : void 0
        });
      }
      await this.initializeAgents();
      this.scheduleJobs();
      this.state = "running";
      this.emit("started");
      console.log("[Orchestrator] Started successfully");
      await this.logActivity("discovery", "completed", {
        action: "orchestrator:started",
        autonomyLevel: this.autonomyLevel
      });
    } catch (error) {
      this.state = "error";
      console.error("[Orchestrator] Failed to start:", error);
      throw error;
    }
  }
  async stop() {
    if (this.state !== "running" && this.state !== "paused") {
      return;
    }
    this.state = "stopping";
    console.log("[Orchestrator] Stopping...");
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`[Orchestrator] Stopped job: ${name}`);
    }
    this.jobs.clear();
    if (this.hunter) {
      await this.hunter.stop();
    }
    if (this.logger) {
      await this.logger.flush();
      this.logger.close();
    }
    this.state = "stopped";
    this.emit("stopped");
    console.log("[Orchestrator] Stopped");
  }
  async huntNow(sources) {
    if (!this.hunter) {
      throw new Error("Hunter agent not initialized");
    }
    console.log("[Orchestrator] Manual hunt triggered");
    this.emit("hunt:started");
    const discoveries = await this.hunter.huntNow(sources);
    this.emit("hunt:completed", discoveries);
    await this.processDiscoveries(discoveries);
    return discoveries;
  }
  async approveDecision(id, reason) {
    const approval = this.pendingApprovals.get(id);
    if (!approval) {
      throw new Error(`Approval not found: ${id}`);
    }
    console.log(`[Orchestrator] Approved: ${approval.title}`);
    this.pendingApprovals.delete(id);
    await this.logActivity("approval", "completed", {
      approvalId: id,
      action: "approved",
      reason
    });
    this.emit("approval:granted", approval);
    if (this.autonomyLevel === "delegated" || this.autonomyLevel === "autonomous") {
      await this.triggerBuild(approval);
    }
  }
  async rejectDecision(id, reason) {
    const approval = this.pendingApprovals.get(id);
    if (!approval) {
      throw new Error(`Approval not found: ${id}`);
    }
    console.log(`[Orchestrator] Rejected: ${approval.title} - ${reason}`);
    this.pendingApprovals.delete(id);
    await this.logActivity("approval", "completed", {
      approvalId: id,
      action: "rejected",
      reason
    });
    this.emit("approval:rejected", { approval, reason });
  }
  getPendingApprovals() {
    return Array.from(this.pendingApprovals.values());
  }
  getStatus() {
    return {
      state: this.state,
      autonomyLevel: this.autonomyLevel,
      pendingApprovals: this.pendingApprovals.size,
      activeJobs: Array.from(this.jobs.keys()),
      stats: this.logger?.getStats() ?? null
    };
  }
  async initializeAgents() {
    const commonDefaults = {
      llmProvider: this.config.decision.llmProvider,
      apiKey: this.config.decision.apiKey,
      temperature: 0.7,
      maxTokens: 4096
    };
    if (this.config.hunter.enabled) {
      this.hunter = new HunterAgent({
        name: "hunter",
        verbose: true,
        ...commonDefaults,
        sources: this.config.hunter.sources.map((source) => ({
          source,
          enabled: true,
          apiToken: source === "github" ? this.config.hunter.githubToken : void 0,
          apifyToken: source === "twitter" ? this.config.hunter.apifyToken : void 0
        })),
        onDiscovery: async (discoveries) => {
          await this.processDiscoveries(discoveries);
        }
      });
    }
    this.decision = new DecisionAgent({
      name: "decision",
      verbose: true,
      ...commonDefaults,
      model: this.config.decision.model,
      thresholds: {
        autoApprove: this.config.decision.autoApproveThreshold ?? 85,
        humanReview: 50
      },
      onDecision: async (discovery, result, status) => {
        await this.handleDecision(discovery, result, status);
      }
    });
    this.builder = new BuilderAgent({
      name: "builder",
      verbose: true,
      ...commonDefaults
    });
    this.refactor = new RefactorAgent({
      name: "refactor",
      verbose: true,
      ...commonDefaults
    });
    this.deployer = new DeployerAgent({
      name: "deployer",
      verbose: true,
      ...commonDefaults
    });
  }
  scheduleJobs() {
    const schedules = this.config.schedules ?? {};
    if (this.config.hunter.enabled && this.hunter) {
      this.hunter.start();
    }
    const refactorSchedule = schedules.refactor ?? "0 3 * * *";
    const refactorJob = new CronJob(refactorSchedule, async () => {
      console.log("[Orchestrator] Running daily refactor analysis...");
      await this.refactor?.analyzeCode();
    });
    refactorJob.start();
    this.jobs.set("refactor", refactorJob);
  }
  async processDiscoveries(discoveries) {
    if (!this.decision || discoveries.length === 0) return;
    console.log(`[Orchestrator] Processing ${discoveries.length} discoveries...`);
    for (const discovery of discoveries) {
      this.emit("discovery:found", discovery);
      await this.logActivity("discovery", "completed", {
        discoveryId: discovery.id,
        source: discovery.source,
        title: discovery.title,
        url: discovery.sourceUrl
      });
    }
    const results = await this.decision.evaluateMany(discoveries);
    for (const scored of results) {
      await this.handleDecision(
        scored.discovery,
        scored.result,
        scored.status
      );
    }
  }
  async handleDecision(discovery, result, status) {
    await this.logActivity("decision", "completed", {
      discoveryId: discovery.id,
      title: discovery.title,
      score: result.totalScore,
      status,
      recommendation: result.recommendation
    });
    this.emit("decision:made", { discovery, result, status });
    if (status === "auto_approve") {
      if (this.autonomyLevel === "autonomous" || this.autonomyLevel === "delegated") {
        await this.triggerBuild({
          id: discovery.id,
          discoveryId: discovery.id,
          decisionId: discovery.id,
          title: discovery.title,
          source: discovery.source,
          score: result.totalScore,
          recommendation: result.recommendation,
          reasoning: result.reasoning,
          createdAt: /* @__PURE__ */ new Date()
        });
      } else {
        this.queueForApproval(discovery, result);
      }
    } else if (status === "human_review") {
      this.queueForApproval(discovery, result);
    }
  }
  queueForApproval(discovery, result) {
    const approval = {
      id: `approval-${Date.now()}`,
      discoveryId: discovery.id,
      decisionId: discovery.id,
      title: discovery.title,
      source: discovery.source,
      score: result.totalScore,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.pendingApprovals.set(approval.id, approval);
    this.emit("approval:required", approval);
    console.log(
      `[Orchestrator] Queued for approval: ${discovery.title} (${result.totalScore}/100)`
    );
  }
  async triggerBuild(approval) {
    if (!this.builder) return;
    console.log(`[Orchestrator] Triggering build: ${approval.title}`);
    this.emit("build:started", approval);
    await this.logActivity("build", "in_progress", {
      approvalId: approval.id,
      title: approval.title
    });
    const result = await this.builder.build({
      discoveryId: approval.discoveryId,
      type: "integration",
      name: approval.title.toLowerCase().replace(/\s+/g, "-"),
      description: approval.reasoning,
      sourceUrl: `https://example.com/${approval.discoveryId}`
    });
    this.emit("build:completed", result);
    await this.logActivity("build", "completed", {
      approvalId: approval.id,
      buildId: result.buildId,
      status: result.status
    });
  }
  async logActivity(type, status, data) {
    if (!this.logger) return;
    try {
      await this.logger.logActivity({
        type,
        status,
        inputData: data,
        agentId: "orchestrator"
      });
    } catch (error) {
      console.error("[Orchestrator] Failed to log activity:", error);
    }
  }
};

export {
  GICMOrchestrator
};
//# sourceMappingURL=chunk-6FHMYDJF.js.map