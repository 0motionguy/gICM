/**
 * OPUS 67 v4.1 - Learning Observer Agent
 *
 * Tracks successful workflows and auto-generates SOPs.
 * Integrates with AContext for persistent learning.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  success: boolean;
  timestamp: number;
}

export interface TaskContext {
  id: string;
  query: string;
  startTime: number;
  endTime?: number;
  toolChain: ToolCall[];
  skillsUsed: string[];
  success: boolean;
  userFeedback?: "positive" | "negative" | "neutral";
}

export interface SOP {
  id: string;
  use_when: string;
  preferences: string;
  tool_sops: Array<{
    tool_name: string;
    action: string;
    order: number;
  }>;
  created_at: string;
  success_rate: number;
  usage_count: number;
}

export interface SuccessMetric {
  skillId: string;
  totalUses: number;
  successes: number;
  failures: number;
  avgDuration: number;
  lastUsed: number;
}

export interface LearningObserverConfig {
  acontextUrl: string;
  acontextApiKey?: string;
  minComplexity: "low" | "medium" | "high";
  minToolChainLength: number;
  autoSopThreshold: number;
  batchSize: number;
  syncIntervalMs: number;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: LearningObserverConfig = {
  acontextUrl: process.env.ACONTEXT_API_URL || "http://localhost:8029/api/v1",
  acontextApiKey: process.env.ACONTEXT_API_KEY,
  minComplexity: "medium",
  minToolChainLength: 3,
  autoSopThreshold: 0.8,
  batchSize: 10,
  syncIntervalMs: 5 * 60 * 1000, // 5 minutes
};

// =============================================================================
// LEARNING OBSERVER AGENT
// =============================================================================

export class LearningObserverAgent {
  private config: LearningObserverConfig;
  private pendingTasks: TaskContext[] = [];
  private successMetrics: Map<string, SuccessMetric> = new Map();
  private generatedSOPs: Map<string, SOP> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LearningObserverConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the learning observer
   */
  start(): void {
    if (this.syncTimer) return;

    this.syncTimer = setInterval(
      () => this.syncToAContext(),
      this.config.syncIntervalMs
    );

    console.log(
      "[LearningObserver] Started with sync interval:",
      this.config.syncIntervalMs
    );
  }

  /**
   * Stop the learning observer
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Observe a task completion
   */
  async observeCompletion(context: TaskContext): Promise<void> {
    // Check if task is complex enough to learn from
    if (!this.isComplexEnough(context)) {
      return;
    }

    // Update success metrics for used skills
    for (const skillId of context.skillsUsed) {
      this.updateSuccessMetric(
        skillId,
        context.success,
        context.endTime! - context.startTime
      );
    }

    // Queue for SOP extraction if successful
    if (
      context.success &&
      context.toolChain.length >= this.config.minToolChainLength
    ) {
      this.pendingTasks.push(context);

      // Process batch if full
      if (this.pendingTasks.length >= this.config.batchSize) {
        await this.processPendingTasks();
      }
    }
  }

  /**
   * Check if task is complex enough to learn from
   */
  private isComplexEnough(context: TaskContext): boolean {
    const complexity = this.calculateComplexity(context);

    switch (this.config.minComplexity) {
      case "low":
        return complexity >= 1;
      case "medium":
        return complexity >= 3;
      case "high":
        return complexity >= 5;
      default:
        return complexity >= 3;
    }
  }

  /**
   * Calculate task complexity score
   */
  private calculateComplexity(context: TaskContext): number {
    let score = 0;

    // Tool chain length
    score += context.toolChain.length * 0.5;

    // Number of skills used
    score += context.skillsUsed.length;

    // Duration (longer = more complex)
    const durationMins = (context.endTime! - context.startTime) / 60000;
    if (durationMins > 1) score += 1;
    if (durationMins > 5) score += 1;

    // Query length
    if (context.query.length > 100) score += 1;

    return score;
  }

  /**
   * Update success metrics for a skill
   */
  private updateSuccessMetric(
    skillId: string,
    success: boolean,
    duration: number
  ): void {
    const existing = this.successMetrics.get(skillId) || {
      skillId,
      totalUses: 0,
      successes: 0,
      failures: 0,
      avgDuration: 0,
      lastUsed: Date.now(),
    };

    existing.totalUses++;
    if (success) {
      existing.successes++;
    } else {
      existing.failures++;
    }

    // Update running average duration
    existing.avgDuration =
      (existing.avgDuration * (existing.totalUses - 1) + duration) /
      existing.totalUses;
    existing.lastUsed = Date.now();

    this.successMetrics.set(skillId, existing);
  }

  /**
   * Extract SOP from a task context
   */
  async extractSOP(context: TaskContext): Promise<SOP | null> {
    if (context.toolChain.length < this.config.minToolChainLength) {
      return null;
    }

    // Build SOP from tool chain
    const toolSops = context.toolChain
      .filter((tc) => tc.success)
      .map((tc, idx) => ({
        tool_name: tc.name,
        action: this.describeToolAction(tc),
        order: idx + 1,
      }));

    if (toolSops.length < 2) {
      return null;
    }

    const sop: SOP = {
      id: `sop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      use_when: context.query,
      preferences: this.extractPreferences(context),
      tool_sops: toolSops,
      created_at: new Date().toISOString(),
      success_rate: 1.0, // First success
      usage_count: 1,
    };

    this.generatedSOPs.set(sop.id, sop);
    return sop;
  }

  /**
   * Describe a tool action in natural language
   */
  private describeToolAction(toolCall: ToolCall): string {
    const name = toolCall.name;
    const args = Object.keys(toolCall.args);

    if (args.length === 0) {
      return `Execute ${name}`;
    }

    return `Execute ${name} with ${args.join(", ")}`;
  }

  /**
   * Extract preferences from task context
   */
  private extractPreferences(context: TaskContext): string {
    const prefs: string[] = [];

    // Check for common patterns
    if (context.skillsUsed.includes("solana-anchor-expert")) {
      prefs.push("Use Anchor framework for Solana");
    }
    if (context.skillsUsed.includes("nextjs-14-expert")) {
      prefs.push("Use Next.js App Router");
    }

    return prefs.join(", ") || "default settings";
  }

  /**
   * Process pending tasks and generate SOPs
   */
  private async processPendingTasks(): Promise<void> {
    const tasks = this.pendingTasks.splice(0, this.config.batchSize);

    for (const task of tasks) {
      try {
        await this.extractSOP(task);
      } catch (error) {
        console.error("[LearningObserver] Failed to extract SOP:", error);
      }
    }
  }

  /**
   * Record a successful skill usage
   */
  async recordSuccess(skillId: string, taskType?: string): Promise<number> {
    const metric = this.successMetrics.get(skillId);

    if (metric) {
      metric.successes++;
      metric.totalUses++;
      metric.lastUsed = Date.now();
      return metric.successes;
    }

    // Create new metric
    const newMetric: SuccessMetric = {
      skillId,
      totalUses: 1,
      successes: 1,
      failures: 0,
      avgDuration: 0,
      lastUsed: Date.now(),
    };

    this.successMetrics.set(skillId, newMetric);
    return 1;
  }

  /**
   * Get success rate for a skill
   */
  getSuccessRate(skillId: string): {
    rate: number;
    totalUses: number;
    successes: number;
  } {
    const metric = this.successMetrics.get(skillId);

    if (!metric || metric.totalUses === 0) {
      return { rate: 0, totalUses: 0, successes: 0 };
    }

    return {
      rate: metric.successes / metric.totalUses,
      totalUses: metric.totalUses,
      successes: metric.successes,
    };
  }

  /**
   * Sync learned data to AContext
   */
  private async syncToAContext(): Promise<void> {
    if (this.generatedSOPs.size === 0 && this.successMetrics.size === 0) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.config.acontextApiKey) {
        headers["Authorization"] = `Bearer ${this.config.acontextApiKey}`;
      }

      // Sync SOPs
      for (const [id, sop] of this.generatedSOPs) {
        await fetch(`${this.config.acontextUrl}/sops`, {
          method: "POST",
          headers,
          body: JSON.stringify(sop),
        });
      }

      // Sync metrics
      await fetch(`${this.config.acontextUrl}/metrics`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          metrics: Array.from(this.successMetrics.values()),
          timestamp: new Date().toISOString(),
        }),
      });

      console.log(
        `[LearningObserver] Synced ${this.generatedSOPs.size} SOPs and ${this.successMetrics.size} metrics to AContext`
      );

      // Clear synced SOPs (keep metrics for rolling window)
      this.generatedSOPs.clear();
    } catch (error) {
      console.error("[LearningObserver] Failed to sync to AContext:", error);
    }
  }

  /**
   * Get all generated SOPs
   */
  getSOPs(): SOP[] {
    return Array.from(this.generatedSOPs.values());
  }

  /**
   * Get all success metrics
   */
  getMetrics(): SuccessMetric[] {
    return Array.from(this.successMetrics.values());
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    pendingTasks: number;
    generatedSOPs: number;
    trackedSkills: number;
    isRunning: boolean;
  } {
    return {
      pendingTasks: this.pendingTasks.length,
      generatedSOPs: this.generatedSOPs.size,
      trackedSkills: this.successMetrics.size,
      isRunning: this.syncTimer !== null,
    };
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: LearningObserverAgent | null = null;

export function getLearningObserver(): LearningObserverAgent {
  if (!instance) {
    instance = new LearningObserverAgent();
  }
  return instance;
}

export function resetLearningObserver(): void {
  if (instance) {
    instance.stop();
  }
  instance = null;
}
