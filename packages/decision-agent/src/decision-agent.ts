import { BaseAgent } from "@gicm/agent-core";
import type { AgentConfig, AgentContext, AgentResult } from "@gicm/agent-core";
import type { HuntDiscovery } from "@gicm/hunter-agent";
import { DecisionScorer, type ScorerConfig } from "./scorer.js";
import type { DecisionResult, DecisionStatus, DecisionThresholds } from "./types.js";
import { DEFAULT_THRESHOLDS } from "./types.js";

export interface DecisionAgentConfig extends AgentConfig {
  llmProvider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model?: string;
  thresholds?: DecisionThresholds;
  onDecision?: (
    discovery: HuntDiscovery,
    result: DecisionResult,
    status: DecisionStatus
  ) => Promise<void>;
}

export interface ScoredDiscovery {
  discovery: HuntDiscovery;
  result: DecisionResult;
  status: DecisionStatus;
}

export class DecisionAgent extends BaseAgent {
  private scorer: DecisionScorer;
  private thresholds: DecisionThresholds;
  private onDecision?: DecisionAgentConfig["onDecision"];

  constructor(config: DecisionAgentConfig) {
    super("decision", config);

    this.thresholds = config.thresholds ?? DEFAULT_THRESHOLDS;
    this.onDecision = config.onDecision;

    const scorerConfig: ScorerConfig = {
      llmProvider: config.llmProvider,
      apiKey: config.apiKey,
      model: config.model,
      thresholds: this.thresholds,
    };

    this.scorer = new DecisionScorer(scorerConfig);
  }

  getSystemPrompt(): string {
    return `You are a decision engine for gICM Orchestrator.
Your role is to evaluate discoveries and determine:
1. Should we act on this? (score 0-100)
2. What action should we take? (build/integrate/monitor/ignore)
3. What are the risks?
4. How much effort is required?

Auto-approve if score >= ${this.thresholds.autoApprove}
Queue for human review if score >= ${this.thresholds.humanReview}
Auto-reject if score < ${this.thresholds.humanReview}`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const action = context.action ?? "evaluate";

    switch (action) {
      case "evaluate":
        return this.evaluateDiscovery(context.params?.discovery as HuntDiscovery);

      case "evaluate_batch":
        return this.evaluateBatch(context.params?.discoveries as HuntDiscovery[]);

      case "status":
        return this.createResult(
          true,
          {
            thresholds: this.thresholds,
            provider: (this.config as DecisionAgentConfig).llmProvider,
          },
          undefined,
          1.0,
          "Decision agent status"
        );

      default:
        return this.createResult(false, null, `Unknown action: ${action}`);
    }
  }

  async evaluate(discovery: HuntDiscovery): Promise<ScoredDiscovery> {
    this.log(`Evaluating: ${discovery.title}`);

    const result = await this.scorer.evaluate(discovery);
    const status = this.scorer.determineStatus(result.totalScore);

    this.log(
      `Score: ${result.totalScore}/100 | Status: ${status} | Recommendation: ${result.recommendation}`
    );

    // Notify callback if provided
    if (this.onDecision) {
      await this.onDecision(discovery, result, status);
    }

    return { discovery, result, status };
  }

  async evaluateMany(discoveries: HuntDiscovery[]): Promise<ScoredDiscovery[]> {
    this.log(`Evaluating ${discoveries.length} discoveries`);

    const results: ScoredDiscovery[] = [];

    for (const discovery of discoveries) {
      const scored = await this.evaluate(discovery);
      results.push(scored);
    }

    // Sort by score descending
    results.sort((a, b) => b.result.totalScore - a.result.totalScore);

    const approved = results.filter((r) => r.status === "auto_approve").length;
    const review = results.filter((r) => r.status === "human_review").length;
    const rejected = results.filter((r) => r.status === "reject").length;

    this.log(
      `Results: ${approved} auto-approved, ${review} for review, ${rejected} rejected`
    );

    return results;
  }

  private async evaluateDiscovery(
    discovery: HuntDiscovery | undefined
  ): Promise<AgentResult> {
    if (!discovery) {
      return this.createResult(false, null, "No discovery provided");
    }

    try {
      const scored = await this.evaluate(discovery);

      return this.createResult(
        true,
        scored,
        undefined,
        scored.result.confidence,
        `Evaluated "${discovery.title}": ${scored.result.totalScore}/100 (${scored.status})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.createResult(false, null, message);
    }
  }

  private async evaluateBatch(
    discoveries: HuntDiscovery[] | undefined
  ): Promise<AgentResult> {
    if (!discoveries || discoveries.length === 0) {
      return this.createResult(false, null, "No discoveries provided");
    }

    try {
      const results = await this.evaluateMany(discoveries);

      const summary = {
        total: results.length,
        autoApproved: results.filter((r) => r.status === "auto_approve"),
        forReview: results.filter((r) => r.status === "human_review"),
        rejected: results.filter((r) => r.status === "reject"),
        topDiscoveries: results.slice(0, 5),
      };

      return this.createResult(
        true,
        summary,
        undefined,
        0.9,
        `Evaluated ${results.length} discoveries: ${summary.autoApproved.length} auto-approved, ${summary.forReview.length} for review`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return this.createResult(false, null, message);
    }
  }

  // Convenience methods for filtering
  getAutoApproved(results: ScoredDiscovery[]): ScoredDiscovery[] {
    return results.filter((r) => r.status === "auto_approve");
  }

  getForReview(results: ScoredDiscovery[]): ScoredDiscovery[] {
    return results.filter((r) => r.status === "human_review");
  }

  getRejected(results: ScoredDiscovery[]): ScoredDiscovery[] {
    return results.filter((r) => r.status === "reject");
  }

  // Update thresholds dynamically
  setThresholds(thresholds: Partial<DecisionThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    this.log(`Updated thresholds: ${JSON.stringify(this.thresholds)}`);
  }
}
