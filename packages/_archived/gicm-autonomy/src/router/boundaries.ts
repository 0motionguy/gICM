/**
 * Boundary Checker
 *
 * Validates actions against configured boundaries.
 */

import type { Action, Boundaries, BoundaryCheckResult } from "../core/types.js";

export class BoundaryChecker {
  private boundaries: Boundaries;
  private dailySpend = 0;
  private dailyPosts = 0;
  private weeklyBlogs = 0;
  private lastResetDay = new Date().getDate();

  constructor(boundaries: Boundaries) {
    this.boundaries = boundaries;
  }

  /**
   * Check if action is within boundaries
   */
  check(action: Action): BoundaryCheckResult {
    this.resetDailyCountersIfNeeded();

    const violations: string[] = [];
    const warnings: string[] = [];

    // Check financial boundaries
    this.checkFinancialBoundaries(action, violations, warnings);

    // Check content boundaries
    this.checkContentBoundaries(action, violations, warnings);

    // Check development boundaries
    this.checkDevelopmentBoundaries(action, violations, warnings);

    // Check trading boundaries
    this.checkTradingBoundaries(action, violations, warnings);

    // Check time boundaries
    this.checkTimeBoundaries(action, warnings);

    return {
      withinLimits: violations.length === 0 && warnings.length === 0,
      needsReview: warnings.length > 0,
      violated: violations.length > 0,
      violations,
      warnings,
    };
  }

  private checkFinancialBoundaries(
    action: Action,
    violations: string[],
    warnings: string[]
  ): void {
    const params = action.params as Record<string, number | undefined>;
    const amount = params.amount || params.cost || 0;

    if (amount > 0) {
      // Check single expense limit
      if (amount > this.boundaries.financial.maxQueuedExpense) {
        violations.push(
          "Expense " + amount + " exceeds max queued limit (" +
          this.boundaries.financial.maxQueuedExpense + ")"
        );
      } else if (amount > this.boundaries.financial.maxAutoExpense) {
        warnings.push(
          "Expense " + amount + " exceeds auto-approve limit (" +
          this.boundaries.financial.maxAutoExpense + ")"
        );
      }

      // Check daily spend
      if (this.dailySpend + amount > this.boundaries.financial.maxDailySpend) {
        violations.push(
          "Would exceed daily spend limit (" +
          this.boundaries.financial.maxDailySpend + ")"
        );
      }
    }

    // Check trade size
    if (action.type.includes("trade")) {
      if (amount > this.boundaries.financial.maxTradeSize) {
        violations.push(
          "Trade size " + amount + " exceeds limit (" +
          this.boundaries.financial.maxTradeSize + ")"
        );
      }
    }
  }

  private checkContentBoundaries(
    action: Action,
    violations: string[],
    warnings: string[]
  ): void {
    const params = action.params as Record<string, string | undefined>;

    // Check post limits
    if (action.type.includes("tweet") || action.type.includes("post")) {
      if (this.dailyPosts >= this.boundaries.content.maxAutoPostsPerDay) {
        warnings.push(
          "Daily post limit reached (" +
          this.boundaries.content.maxAutoPostsPerDay + ")"
        );
      }
    }

    // Check blog limits
    if (action.type.includes("blog")) {
      if (this.weeklyBlogs >= this.boundaries.content.maxAutoBlogsPerWeek) {
        warnings.push(
          "Weekly blog limit reached (" +
          this.boundaries.content.maxAutoBlogsPerWeek + ")"
        );
      }
    }

    // Check topic restrictions
    const topic = params.topic || params.category || "";
    if (this.boundaries.content.requireReviewForTopics.some((t) =>
      topic.toLowerCase().includes(t.toLowerCase())
    )) {
      warnings.push("Topic '" + topic + "' requires human review");
    }
  }

  private checkDevelopmentBoundaries(
    action: Action,
    violations: string[],
    warnings: string[]
  ): void {
    const params = action.params as Record<string, number | string | string[] | undefined>;

    // Check commit size
    if (action.type.includes("commit")) {
      const lines = (params.linesChanged || 0) as number;
      const files = (params.filesChanged || 0) as number;

      if (lines > this.boundaries.development.maxAutoCommitLines) {
        warnings.push(
          "Commit has " + lines + " lines (limit: " +
          this.boundaries.development.maxAutoCommitLines + ")"
        );
      }

      if (files > this.boundaries.development.maxAutoFilesChanged) {
        warnings.push(
          "Commit changes " + files + " files (limit: " +
          this.boundaries.development.maxAutoFilesChanged + ")"
        );
      }
    }

    // Check path restrictions
    const paths = (params.paths || []) as string[];
    for (const path of paths) {
      if (this.boundaries.development.requireReviewForPaths.some((p) =>
        path.includes(p)
      )) {
        warnings.push("Path '" + path + "' requires human review");
      }
    }

    // Check production deployment
    if (action.type.includes("deploy_prod")) {
      if (!this.boundaries.development.autoDeployToProduction) {
        violations.push("Production deployments require approval");
      }
    }
  }

  private checkTradingBoundaries(
    action: Action,
    violations: string[],
    warnings: string[]
  ): void {
    const params = action.params as Record<string, string | undefined>;

    if (action.type.includes("trade")) {
      // Check bot allowlist
      const bot = params.bot || "";
      if (bot && !this.boundaries.trading.allowedBots.includes(bot)) {
        violations.push("Bot '" + bot + "' not in allowed list");
      }

      // Check token allowlist
      const token = params.token || "";
      if (token && !this.boundaries.trading.allowedTokens.includes(token)) {
        if (this.boundaries.trading.requireApprovalForNewTokens) {
          warnings.push("Token '" + token + "' requires approval");
        }
      }
    }
  }

  private checkTimeBoundaries(action: Action, warnings: string[]): void {
    const hour = new Date().getUTCHours();
    const { activeHours, quietHours } = this.boundaries.time;

    // Outside active hours - queue unless urgent
    if (hour < activeHours.start || hour > activeHours.end) {
      warnings.push("Outside active hours (" + activeHours.start + "-" + activeHours.end + " UTC)");
    }

    // During quiet hours - no notifications
    if (hour >= quietHours.start || hour < quietHours.end) {
      // This is informational, doesn't affect routing
    }
  }

  /**
   * Record that an action was executed (for daily limits)
   */
  recordExecution(action: Action): void {
    const params = action.params as Record<string, number | undefined>;
    const amount = params.amount || params.cost || 0;

    this.dailySpend += amount;

    if (action.type.includes("tweet") || action.type.includes("post")) {
      this.dailyPosts++;
    }

    if (action.type.includes("blog")) {
      this.weeklyBlogs++;
    }
  }

  private resetDailyCountersIfNeeded(): void {
    const today = new Date().getDate();
    if (today !== this.lastResetDay) {
      this.dailySpend = 0;
      this.dailyPosts = 0;
      this.lastResetDay = today;

      // Reset weekly on Sunday
      if (new Date().getDay() === 0) {
        this.weeklyBlogs = 0;
      }
    }
  }

  /**
   * Update boundaries
   */
  updateBoundaries(newBoundaries: Boundaries): void {
    this.boundaries = newBoundaries;
  }

  /**
   * Get current boundaries
   */
  getBoundaries(): Boundaries {
    return this.boundaries;
  }
}
