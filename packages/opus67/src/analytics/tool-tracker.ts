/**
 * OPUS 67 v6.3.0 - Tool Analytics
 *
 * Monitors MCP tool health and reliability:
 * 1. Tracks success/failure rates per tool
 * 2. Measures latency distributions
 * 3. Identifies unhealthy tools
 * 4. Provides performance recommendations
 *
 * Expected improvement: Early detection of tool degradation
 */

import { EventEmitter } from "events";

// =============================================================================
// TYPES
// =============================================================================

export interface ToolCallRecord {
  toolId: string;
  timestamp: Date;
  success: boolean;
  latency: number; // ms
  error?: string;
  errorCode?: string;
  retryCount?: number;
  metadata?: Record<string, unknown>;
}

export interface ToolMetrics {
  toolId: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  lastSuccess?: Date;
  lastFailure?: Date;
  lastError?: string;
  trend: "improving" | "stable" | "degrading" | "unknown";
  health: "healthy" | "degraded" | "unhealthy" | "unknown";
}

export interface ToolAnalyticsConfig {
  /** Window size for metrics calculation (ms) */
  metricsWindow: number;
  /** Minimum calls before calculating health */
  minCallsForHealth: number;
  /** Success rate threshold for healthy status */
  healthySuccessRate: number;
  /** Success rate threshold for degraded status */
  degradedSuccessRate: number;
  /** Latency threshold for degraded status (ms) */
  degradedLatencyThreshold: number;
  /** Enable automatic cleanup of old records */
  autoCleanup: boolean;
  /** Cleanup interval (ms) */
  cleanupInterval: number;
}

export interface ToolAnalyticsEvents {
  "tool:call": [ToolCallRecord];
  "tool:degraded": [string, ToolMetrics];
  "tool:unhealthy": [string, ToolMetrics];
  "tool:recovered": [string, ToolMetrics];
  "cleanup:complete": [number];
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_ANALYTICS_CONFIG: ToolAnalyticsConfig = {
  metricsWindow: 60 * 60 * 1000, // 1 hour
  minCallsForHealth: 5,
  healthySuccessRate: 0.95,
  degradedSuccessRate: 0.8,
  degradedLatencyThreshold: 5000, // 5 seconds
  autoCleanup: true,
  cleanupInterval: 15 * 60 * 1000, // 15 minutes
};

// =============================================================================
// TOOL ANALYTICS
// =============================================================================

export class ToolAnalytics extends EventEmitter<ToolAnalyticsEvents> {
  private config: ToolAnalyticsConfig;
  private records: Map<string, ToolCallRecord[]> = new Map();
  private previousHealth: Map<string, ToolMetrics["health"]> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<ToolAnalyticsConfig>) {
    super();
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config };

    if (this.config.autoCleanup) {
      this.startCleanup();
    }
  }

  /**
   * Track a tool call
   */
  async track(
    toolId: string,
    result: {
      success: boolean;
      latency: number;
      error?: string;
      errorCode?: string;
      retryCount?: number;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const record: ToolCallRecord = {
      toolId,
      timestamp: new Date(),
      ...result,
    };

    // Store record
    if (!this.records.has(toolId)) {
      this.records.set(toolId, []);
    }
    this.records.get(toolId)!.push(record);

    this.emit("tool:call", record);

    // Check for health changes
    await this.checkHealthChange(toolId);
  }

  /**
   * Get metrics for a specific tool
   */
  getMetrics(toolId: string): ToolMetrics {
    const records = this.getRecentRecords(toolId);

    if (records.length === 0) {
      return {
        toolId,
        totalCalls: 0,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        avgLatency: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        errorRate: 0,
        trend: "unknown",
        health: "unknown",
      };
    }

    const successCount = records.filter((r) => r.success).length;
    const failureCount = records.length - successCount;
    const successRate = successCount / records.length;
    const latencies = records.map((r) => r.latency).sort((a, b) => a - b);

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p50Latency = this.percentile(latencies, 50);
    const p95Latency = this.percentile(latencies, 95);
    const p99Latency = this.percentile(latencies, 99);

    const lastSuccess = records
      .filter((r) => r.success)
      .sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )[0]?.timestamp;

    const lastFailureRecord = records
      .filter((r) => !r.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    const trend = this.calculateTrend(records);
    const health = this.calculateHealth(
      successRate,
      avgLatency,
      records.length
    );

    return {
      toolId,
      totalCalls: records.length,
      successCount,
      failureCount,
      successRate,
      avgLatency,
      p50Latency,
      p95Latency,
      p99Latency,
      errorRate: failureCount / records.length,
      lastSuccess,
      lastFailure: lastFailureRecord?.timestamp,
      lastError: lastFailureRecord?.error,
      trend,
      health,
    };
  }

  /**
   * Get metrics for all tracked tools
   */
  getAllMetrics(): ToolMetrics[] {
    const toolIds = Array.from(this.records.keys());
    return toolIds.map((id) => this.getMetrics(id));
  }

  /**
   * Get unhealthy tools
   */
  getUnhealthyTools(
    threshold: "degraded" | "unhealthy" = "unhealthy"
  ): ToolMetrics[] {
    const all = this.getAllMetrics();
    const levels: ToolMetrics["health"][] =
      threshold === "unhealthy" ? ["unhealthy"] : ["degraded", "unhealthy"];

    return all.filter((m) => levels.includes(m.health));
  }

  /**
   * Get tool recommendations based on metrics
   */
  getRecommendations(toolId: string): string[] {
    const metrics = this.getMetrics(toolId);
    const recommendations: string[] = [];

    if (metrics.health === "unknown") {
      recommendations.push("Insufficient data to assess tool health");
      return recommendations;
    }

    if (metrics.successRate < this.config.degradedSuccessRate) {
      recommendations.push(
        `Low success rate (${(metrics.successRate * 100).toFixed(1)}%). Consider adding retry logic or fallback tools.`
      );
    }

    if (metrics.avgLatency > this.config.degradedLatencyThreshold) {
      recommendations.push(
        `High average latency (${metrics.avgLatency.toFixed(0)}ms). Consider caching or timeout optimization.`
      );
    }

    if (metrics.p95Latency > metrics.avgLatency * 3) {
      recommendations.push(
        `Large latency variance (p95: ${metrics.p95Latency.toFixed(0)}ms). Consider investigating outliers.`
      );
    }

    if (metrics.trend === "degrading") {
      recommendations.push(
        "Tool performance is degrading. Monitor closely and prepare fallback."
      );
    }

    if (metrics.lastError) {
      recommendations.push(`Last error: ${metrics.lastError}`);
    }

    if (recommendations.length === 0) {
      recommendations.push("Tool is performing well. No action needed.");
    }

    return recommendations;
  }

  /**
   * Clear metrics for a tool
   */
  clearMetrics(toolId: string): void {
    this.records.delete(toolId);
    this.previousHealth.delete(toolId);
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.records.clear();
    this.previousHealth.clear();
  }

  /**
   * Export metrics for persistence
   */
  exportMetrics(): { toolId: string; records: ToolCallRecord[] }[] {
    return Array.from(this.records.entries()).map(([toolId, records]) => ({
      toolId,
      records,
    }));
  }

  /**
   * Import metrics from persistence
   */
  importMetrics(data: { toolId: string; records: ToolCallRecord[] }[]): void {
    for (const { toolId, records } of data) {
      const existing = this.records.get(toolId) || [];
      const restored = records.map((r) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
      this.records.set(toolId, [...existing, ...restored]);
    }
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private getRecentRecords(toolId: string): ToolCallRecord[] {
    const records = this.records.get(toolId) || [];
    const cutoff = Date.now() - this.config.metricsWindow;
    return records.filter((r) => r.timestamp.getTime() >= cutoff);
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateTrend(records: ToolCallRecord[]): ToolMetrics["trend"] {
    if (records.length < 10) return "unknown";

    // Compare first half to second half
    const midpoint = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, midpoint);
    const secondHalf = records.slice(midpoint);

    const firstSuccessRate =
      firstHalf.filter((r) => r.success).length / firstHalf.length;
    const secondSuccessRate =
      secondHalf.filter((r) => r.success).length / secondHalf.length;

    const diff = secondSuccessRate - firstSuccessRate;

    if (diff > 0.1) return "improving";
    if (diff < -0.1) return "degrading";
    return "stable";
  }

  private calculateHealth(
    successRate: number,
    avgLatency: number,
    callCount: number
  ): ToolMetrics["health"] {
    if (callCount < this.config.minCallsForHealth) {
      return "unknown";
    }

    if (successRate < this.config.degradedSuccessRate) {
      return "unhealthy";
    }

    if (
      successRate < this.config.healthySuccessRate ||
      avgLatency > this.config.degradedLatencyThreshold
    ) {
      return "degraded";
    }

    return "healthy";
  }

  private async checkHealthChange(toolId: string): Promise<void> {
    const metrics = this.getMetrics(toolId);
    const previousHealth = this.previousHealth.get(toolId);

    if (previousHealth !== metrics.health) {
      // Health changed
      if (metrics.health === "degraded") {
        this.emit("tool:degraded", toolId, metrics);
      } else if (metrics.health === "unhealthy") {
        this.emit("tool:unhealthy", toolId, metrics);
      } else if (
        metrics.health === "healthy" &&
        (previousHealth === "degraded" || previousHealth === "unhealthy")
      ) {
        this.emit("tool:recovered", toolId, metrics);
      }

      this.previousHealth.set(toolId, metrics.health);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      let cleaned = 0;
      const cutoff = Date.now() - this.config.metricsWindow;

      for (const [toolId, records] of this.records.entries()) {
        const filtered = records.filter((r) => r.timestamp.getTime() >= cutoff);
        const removed = records.length - filtered.length;
        cleaned += removed;

        if (filtered.length === 0) {
          this.records.delete(toolId);
          this.previousHealth.delete(toolId);
        } else {
          this.records.set(toolId, filtered);
        }
      }

      if (cleaned > 0) {
        this.emit("cleanup:complete", cleaned);
      }
    }, this.config.cleanupInterval);
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a tool analytics instance with default config
 */
export function createToolAnalytics(
  config?: Partial<ToolAnalyticsConfig>
): ToolAnalytics {
  return new ToolAnalytics(config);
}

// =============================================================================
// MCP WRAPPER HELPER
// =============================================================================

/**
 * Wrap an MCP tool call with analytics tracking
 */
export function wrapToolCall<T>(
  analytics: ToolAnalytics,
  toolId: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  return fn()
    .then((result) => {
      analytics.track(toolId, {
        success: true,
        latency: Date.now() - start,
      });
      return result;
    })
    .catch((error) => {
      analytics.track(toolId, {
        success: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error?.code,
      });
      throw error;
    });
}
