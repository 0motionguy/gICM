import { EventEmitter } from "events";
import { CronJob } from "cron";
import { ActivityLogger } from "@gicm/activity-logger";
import { HunterAgent, type HuntDiscovery } from "@gicm/hunter-agent";
import { DecisionAgent, type ScoredDiscovery } from "@gicm/decision-agent";
import { BuilderAgent } from "@gicm/builder-agent";
import { RefactorAgent } from "@gicm/refactor-agent";
import { DeployerAgent } from "@gicm/deployer-agent";
import type {
  AutonomyLevel,
  OrchestratorConfig,
  OrchestratorEvent,
  OrchestratorState,
  PendingApproval,
} from "./types.js";

export class GICMOrchestrator extends EventEmitter {
  private config: OrchestratorConfig;
  private state: OrchestratorState = "idle";
  private autonomyLevel: AutonomyLevel;

  // Agents
  private hunter: HunterAgent | null = null;
  private decision: DecisionAgent | null = null;
  private builder: BuilderAgent | null = null;
  private refactor: RefactorAgent | null = null;
  private deployer: DeployerAgent | null = null;

  // Activity logger
  private logger: ActivityLogger | null = null;

  // Scheduled jobs
  private jobs: Map<string, CronJob> = new Map();

  // Approval queue (for Level 2)
  private pendingApprovals: Map<string, PendingApproval> = new Map();

  constructor(config: OrchestratorConfig) {
    super();
    this.config = config;
    this.autonomyLevel = config.autonomyLevel;
  }

  async start(): Promise<void> {
    if (this.state === "running") {
      console.log("[Orchestrator] Already running");
      return;
    }

    this.state = "starting";
    console.log(`[Orchestrator] Starting in ${this.autonomyLevel} mode...`);

    try {
      // Initialize activity logger
      if (this.config.activityLogger) {
        this.logger = new ActivityLogger({
          solana: this.config.activityLogger.solanaPrivateKey
            ? {
                rpcUrl:
                  this.config.activityLogger.solanaRpcUrl ??
                  "https://api.mainnet-beta.solana.com",
                privateKey: this.config.activityLogger.solanaPrivateKey,
              }
            : undefined,
        });
      }

      // Initialize agents
      await this.initializeAgents();

      // Schedule jobs
      this.scheduleJobs();

      this.state = "running";
      this.emit("started");
      console.log("[Orchestrator] Started successfully");

      // Log activity
      await this.logActivity("discovery", "completed", {
        action: "orchestrator:started",
        autonomyLevel: this.autonomyLevel,
      });
    } catch (error) {
      this.state = "error";
      console.error("[Orchestrator] Failed to start:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state !== "running" && this.state !== "paused") {
      return;
    }

    this.state = "stopping";
    console.log("[Orchestrator] Stopping...");

    // Stop all jobs
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`[Orchestrator] Stopped job: ${name}`);
    }
    this.jobs.clear();

    // Stop hunter agent
    if (this.hunter) {
      await this.hunter.stop();
    }

    // Flush activity logger
    if (this.logger) {
      await this.logger.flush();
      this.logger.close();
    }

    this.state = "stopped";
    this.emit("stopped");
    console.log("[Orchestrator] Stopped");
  }

  async huntNow(sources?: Array<"github" | "hackernews" | "twitter">): Promise<HuntDiscovery[]> {
    if (!this.hunter) {
      throw new Error("Hunter agent not initialized");
    }

    console.log("[Orchestrator] Manual hunt triggered");
    this.emit("hunt:started");

    const discoveries = await this.hunter.huntNow(sources);
    this.emit("hunt:completed", discoveries);

    // Process discoveries
    await this.processDiscoveries(discoveries);

    return discoveries;
  }

  async approveDecision(id: string, reason?: string): Promise<void> {
    const approval = this.pendingApprovals.get(id);
    if (!approval) {
      throw new Error(`Approval not found: ${id}`);
    }

    console.log(`[Orchestrator] Approved: ${approval.title}`);
    this.pendingApprovals.delete(id);

    // Log approval
    await this.logActivity("approval", "completed", {
      approvalId: id,
      action: "approved",
      reason,
    });

    this.emit("approval:granted", approval);

    // Trigger build if auto mode
    if (this.autonomyLevel === "delegated" || this.autonomyLevel === "autonomous") {
      await this.triggerBuild(approval);
    }
  }

  async rejectDecision(id: string, reason: string): Promise<void> {
    const approval = this.pendingApprovals.get(id);
    if (!approval) {
      throw new Error(`Approval not found: ${id}`);
    }

    console.log(`[Orchestrator] Rejected: ${approval.title} - ${reason}`);
    this.pendingApprovals.delete(id);

    // Log rejection
    await this.logActivity("approval", "completed", {
      approvalId: id,
      action: "rejected",
      reason,
    });

    this.emit("approval:rejected", { approval, reason });
  }

  getPendingApprovals(): PendingApproval[] {
    return Array.from(this.pendingApprovals.values());
  }

  getStatus(): {
    state: OrchestratorState;
    autonomyLevel: AutonomyLevel;
    pendingApprovals: number;
    activeJobs: string[];
    stats: ReturnType<ActivityLogger["getStats"]> | null;
  } {
    return {
      state: this.state,
      autonomyLevel: this.autonomyLevel,
      pendingApprovals: this.pendingApprovals.size,
      activeJobs: Array.from(this.jobs.keys()),
      stats: this.logger?.getStats() ?? null,
    };
  }

  private async initializeAgents(): Promise<void> {
    // Common agent defaults
    const commonDefaults = {
      llmProvider: this.config.decision.llmProvider,
      apiKey: this.config.decision.apiKey,
      temperature: 0.7,
      maxTokens: 4096,
    } as const;

    // Hunter agent
    if (this.config.hunter.enabled) {
      this.hunter = new HunterAgent({
        name: "hunter",
        verbose: true,
        ...commonDefaults,
        sources: this.config.hunter.sources.map((source) => ({
          source,
          enabled: true,
          apiToken: source === "github" ? this.config.hunter.githubToken : undefined,
          apifyToken: source === "twitter" ? this.config.hunter.apifyToken : undefined,
        })),
        onDiscovery: async (discoveries) => {
          await this.processDiscoveries(discoveries);
        },
      });
    }

    // Decision agent
    this.decision = new DecisionAgent({
      name: "decision",
      verbose: true,
      ...commonDefaults,
      model: this.config.decision.model,
      thresholds: {
        autoApprove: this.config.decision.autoApproveThreshold ?? 85,
        humanReview: 50,
      },
      onDecision: async (discovery, result, status) => {
        await this.handleDecision(discovery, result, status);
      },
    });

    // Builder agent
    this.builder = new BuilderAgent({
      name: "builder",
      verbose: true,
      ...commonDefaults,
    });

    // Refactor agent
    this.refactor = new RefactorAgent({
      name: "refactor",
      verbose: true,
      ...commonDefaults,
    });

    // Deployer agent
    this.deployer = new DeployerAgent({
      name: "deployer",
      verbose: true,
      ...commonDefaults,
    });
  }

  private scheduleJobs(): void {
    const schedules = this.config.schedules ?? {};

    // Hunter jobs
    if (this.config.hunter.enabled && this.hunter) {
      // Start the hunter's internal scheduler
      this.hunter.start();
    }

    // Refactor job (daily)
    const refactorSchedule = schedules.refactor ?? "0 3 * * *"; // 3 AM daily
    const refactorJob = new CronJob(refactorSchedule, async () => {
      console.log("[Orchestrator] Running daily refactor analysis...");
      await this.refactor?.analyzeCode();
    });
    refactorJob.start();
    this.jobs.set("refactor", refactorJob);
  }

  private async processDiscoveries(discoveries: HuntDiscovery[]): Promise<void> {
    if (!this.decision || discoveries.length === 0) return;

    console.log(`[Orchestrator] Processing ${discoveries.length} discoveries...`);

    for (const discovery of discoveries) {
      this.emit("discovery:found", discovery);

      // Log discovery
      await this.logActivity("discovery", "completed", {
        discoveryId: discovery.id,
        source: discovery.source,
        title: discovery.title,
        url: discovery.sourceUrl,
      });
    }

    // Evaluate discoveries
    const results = await this.decision.evaluateMany(discoveries);

    for (const scored of results) {
      await this.handleDecision(
        scored.discovery,
        scored.result,
        scored.status
      );
    }
  }

  private async handleDecision(
    discovery: HuntDiscovery,
    result: ScoredDiscovery["result"],
    status: ScoredDiscovery["status"]
  ): Promise<void> {
    // Log decision
    await this.logActivity("decision", "completed", {
      discoveryId: discovery.id,
      title: discovery.title,
      score: result.totalScore,
      status,
      recommendation: result.recommendation,
    });

    this.emit("decision:made", { discovery, result, status });

    if (status === "auto_approve") {
      // Auto-approved: proceed based on autonomy level
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
          createdAt: new Date(),
        });
      } else {
        // Even auto-approved needs human confirmation in supervised mode
        this.queueForApproval(discovery, result);
      }
    } else if (status === "human_review") {
      // Queue for human review
      this.queueForApproval(discovery, result);
    }
    // Rejected: no action needed
  }

  private queueForApproval(
    discovery: HuntDiscovery,
    result: ScoredDiscovery["result"]
  ): void {
    const approval: PendingApproval = {
      id: `approval-${Date.now()}`,
      discoveryId: discovery.id,
      decisionId: discovery.id,
      title: discovery.title,
      source: discovery.source,
      score: result.totalScore,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      createdAt: new Date(),
    };

    this.pendingApprovals.set(approval.id, approval);
    this.emit("approval:required", approval);

    console.log(
      `[Orchestrator] Queued for approval: ${discovery.title} (${result.totalScore}/100)`
    );
  }

  private async triggerBuild(approval: PendingApproval): Promise<void> {
    if (!this.builder) return;

    console.log(`[Orchestrator] Triggering build: ${approval.title}`);
    this.emit("build:started", approval);

    // Log build start
    await this.logActivity("build", "in_progress", {
      approvalId: approval.id,
      title: approval.title,
    });

    // Trigger builder
    const result = await this.builder.build({
      discoveryId: approval.discoveryId,
      type: "integration",
      name: approval.title.toLowerCase().replace(/\s+/g, "-"),
      description: approval.reasoning,
      sourceUrl: `https://example.com/${approval.discoveryId}`,
    });

    this.emit("build:completed", result);

    // Log build completion
    await this.logActivity("build", "completed", {
      approvalId: approval.id,
      buildId: result.buildId,
      status: result.status,
    });
  }

  private async logActivity(
    type: "discovery" | "decision" | "build" | "deployment" | "approval" | "error",
    status: "pending" | "in_progress" | "completed" | "failed",
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.logger) return;

    try {
      await this.logger.logActivity({
        type,
        status,
        inputData: data,
        agentId: "orchestrator",
      });
    } catch (error) {
      console.error("[Orchestrator] Failed to log activity:", error);
    }
  }
}
