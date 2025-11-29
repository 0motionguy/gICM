/**
 * gICM Goal System
 *
 * Loads and provides access to the goal system configuration.
 * This is the "soul" of gICM - defining what the platform strives for.
 */

import { z } from "zod";
import goalSystemConfig from "./goal-system.json";

// ============================================================================
// SCHEMAS
// ============================================================================

const CoreValueSchema = z.object({
  name: z.string(),
  priority: z.number(),
  description: z.string(),
});

const MetricTargetSchema = z.object({
  target: z.union([z.number(), z.boolean()]),
  description: z.string(),
});

const CompetitorSchema = z.object({
  name: z.string(),
  category: z.string(),
});

const PhaseSchema = z.object({
  start: z.string(),
  end: z.string(),
  description: z.string(),
});

const GoalSystemSchema = z.object({
  version: z.string(),
  primeDirective: z.string(),
  coreValues: z.array(CoreValueSchema),
  autonomyLevels: z.object({
    current: z.number(),
    descriptions: z.record(z.string()),
    targets: z.record(z.number()),
  }),
  metrics: z.object({
    daily: z.record(MetricTargetSchema),
    weekly: z.record(MetricTargetSchema),
    monthly: z.record(MetricTargetSchema),
    yearly_2025: z.record(MetricTargetSchema),
  }),
  decisionThresholds: z.object({
    auto_approve_score: z.number(),
    manual_review_score: z.number(),
    auto_reject_score: z.number(),
    escalate_above_impact: z.number(),
    escalate_above_risk: z.number(),
  }),
  competitors: z.array(CompetitorSchema),
  focusAreas: z.array(z.string()),
  schedule: z.object({
    timezone: z.string(),
    phases: z.record(PhaseSchema),
    weekly: z.record(z.string()),
  }),
  treasury: z.object({
    allocations: z.record(z.number()),
    thresholds: z.record(z.number()),
    expenses_monthly: z.record(z.number()),
  }),
  trading: z.object({
    default_mode: z.enum(["paper", "micro", "live"]),
    progression_rules: z.record(z.object({
      win_rate_min: z.number().optional(),
      profitable_days_min: z.number().optional(),
      profitable_months_min: z.number().optional(),
      max_drawdown_percent: z.number().optional(),
      requires_approval: z.boolean(),
    })),
    risk_limits: z.record(z.number()),
  }),
});

export type GoalSystem = z.infer<typeof GoalSystemSchema>;
export type CoreValue = z.infer<typeof CoreValueSchema>;
export type MetricTarget = z.infer<typeof MetricTargetSchema>;
export type Competitor = z.infer<typeof CompetitorSchema>;

// ============================================================================
// GOAL SYSTEM CLASS
// ============================================================================

export class GoalSystemManager {
  private config: GoalSystem;

  constructor() {
    this.config = GoalSystemSchema.parse(goalSystemConfig);
  }

  /**
   * Get the prime directive
   */
  getPrimeDirective(): string {
    return this.config.primeDirective;
  }

  /**
   * Get core values in priority order
   */
  getCoreValues(): CoreValue[] {
    return [...this.config.coreValues].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get current autonomy level
   */
  getCurrentAutonomyLevel(): number {
    return this.config.autonomyLevels.current;
  }

  /**
   * Get autonomy level description
   */
  getAutonomyDescription(level: number): string {
    return this.config.autonomyLevels.descriptions[level.toString()] ?? "Unknown";
  }

  /**
   * Get daily metric targets
   */
  getDailyMetrics(): Record<string, MetricTarget> {
    return this.config.metrics.daily;
  }

  /**
   * Get weekly metric targets
   */
  getWeeklyMetrics(): Record<string, MetricTarget> {
    return this.config.metrics.weekly;
  }

  /**
   * Get decision thresholds
   */
  getDecisionThresholds() {
    return this.config.decisionThresholds;
  }

  /**
   * Evaluate a discovery score against thresholds
   */
  evaluateScore(score: number): "auto_approve" | "manual_review" | "auto_reject" | "defer" {
    const thresholds = this.config.decisionThresholds;

    if (score >= thresholds.auto_approve_score) {
      return "auto_approve";
    } else if (score >= thresholds.manual_review_score) {
      return "manual_review";
    } else if (score < thresholds.auto_reject_score) {
      return "auto_reject";
    } else {
      return "defer";
    }
  }

  /**
   * Get competitors to monitor
   */
  getCompetitors(): Competitor[] {
    return this.config.competitors;
  }

  /**
   * Get current schedule phase based on UTC time
   */
  getCurrentPhase(): { name: string; phase: { start: string; end: string; description: string } } | null {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    for (const [name, phase] of Object.entries(this.config.schedule.phases)) {
      const [startHour, startMinute] = phase.start.split(":").map(Number);
      const [endHour, endMinute] = phase.end.split(":").map(Number);

      const startTime = startHour * 60 + startMinute;
      let endTime = endHour * 60 + endMinute;

      // Handle overnight phases (e.g., 23:00 - 00:00)
      if (endTime <= startTime) {
        endTime += 24 * 60;
        const adjustedCurrentTime = currentTime < startTime ? currentTime + 24 * 60 : currentTime;
        if (adjustedCurrentTime >= startTime && adjustedCurrentTime < endTime) {
          return { name, phase };
        }
      } else if (currentTime >= startTime && currentTime < endTime) {
        return { name, phase };
      }
    }

    return null;
  }

  /**
   * Get today's weekly focus
   */
  getTodayFocus(): string {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = days[new Date().getUTCDay()];
    return this.config.schedule.weekly[today] ?? "General";
  }

  /**
   * Get treasury allocation config
   */
  getTreasuryAllocations() {
    return this.config.treasury.allocations;
  }

  /**
   * Get trading risk limits
   */
  getTradingRiskLimits() {
    return this.config.trading.risk_limits;
  }

  /**
   * Get trading mode
   */
  getDefaultTradingMode(): "paper" | "micro" | "live" {
    return this.config.trading.default_mode;
  }

  /**
   * Check if progression from current to next trading mode is allowed
   */
  canProgressTradingMode(
    fromMode: "paper" | "micro",
    stats: { winRate: number; profitableDays?: number; profitableMonths?: number; maxDrawdown?: number }
  ): { allowed: boolean; requiresApproval: boolean; reason?: string } {
    const toMode = fromMode === "paper" ? "micro" : "live";
    const ruleKey = `${fromMode}_to_${toMode}`;
    const rules = this.config.trading.progression_rules[ruleKey];

    if (!rules) {
      return { allowed: false, requiresApproval: false, reason: "No progression rules defined" };
    }

    if (rules.win_rate_min && stats.winRate < rules.win_rate_min) {
      return { allowed: false, requiresApproval: false, reason: `Win rate ${stats.winRate}% below minimum ${rules.win_rate_min}%` };
    }

    if (rules.profitable_days_min && (stats.profitableDays ?? 0) < rules.profitable_days_min) {
      return { allowed: false, requiresApproval: false, reason: `Profitable days ${stats.profitableDays ?? 0} below minimum ${rules.profitable_days_min}` };
    }

    if (rules.profitable_months_min && (stats.profitableMonths ?? 0) < rules.profitable_months_min) {
      return { allowed: false, requiresApproval: false, reason: `Profitable months ${stats.profitableMonths ?? 0} below minimum ${rules.profitable_months_min}` };
    }

    if (rules.max_drawdown_percent && (stats.maxDrawdown ?? 0) > rules.max_drawdown_percent) {
      return { allowed: false, requiresApproval: false, reason: `Max drawdown ${stats.maxDrawdown}% exceeds limit ${rules.max_drawdown_percent}%` };
    }

    return { allowed: true, requiresApproval: rules.requires_approval };
  }

  /**
   * Get the full config
   */
  getConfig(): GoalSystem {
    return this.config;
  }
}

// Export singleton instance
export const goalSystem = new GoalSystemManager();
