/**
 * @gicm/router - SmartRouter Class
 *
 * 4-tier intelligent LLM routing with health tracking and session pinning
 */

import { EventEmitter } from "node:events";
import type {
  RouterConfig,
  RouteRequest,
  RouteResult,
  ModelHealth,
  RoutingStats,
  Tier,
} from "./types.js";
import { classifyIntent } from "./intent.js";
import { DEFAULT_TIER_CONFIGS, DEFAULT_TIER_RULES } from "./tiers.js";

/**
 * Smart router for 4-tier LLM selection
 *
 * Features:
 * - Intent-based tier classification (regex + keywords)
 * - Model health tracking (3-strike rule)
 * - Session pinning (same model for multi-turn conversations)
 * - Automatic fallback on unhealthy models
 * - Cost estimation
 * - Event emission for observability
 */
export class SmartRouter extends EventEmitter {
  private config: RouterConfig;
  private modelHealth: Map<string, ModelHealth> = new Map();
  private sessionModels: Map<string, string> = new Map();
  private stats: RoutingStats = {
    totalRequests: 0,
    byTier: { 0: 0, 1: 0, 2: 0, 3: 0 },
    byModel: {},
    avgLatency: 0,
    cacheHits: 0,
  };
  private latencies: number[] = [];

  constructor(config?: Partial<RouterConfig>) {
    super();
    this.config = {
      tiers: DEFAULT_TIER_CONFIGS,
      defaultTier: 1,
      sessionPinning: true,
      ollamaUrl: "http://localhost:11434",
      ...config,
    };
  }

  /**
   * Route a request to the appropriate model
   *
   * @param request - Routing request
   * @returns Routing result with model selection
   */
  route(request: RouteRequest): RouteResult {
    const startTime = Date.now();

    // Check session pinning
    if (this.config.sessionPinning && request.sessionId) {
      const pinnedModel = this.sessionModels.get(request.sessionId);
      if (pinnedModel && this.isModelHealthy(pinnedModel)) {
        this.recordStats(0, pinnedModel, startTime, true);
        return {
          model: pinnedModel,
          tier: this.getModelTier(pinnedModel),
          estimatedCostPer1k: this.getModelCost(pinnedModel),
          reason: "session-pinned",
          fromCache: true,
        };
      }
    }

    // Determine tier
    let tier: Tier;
    if (request.forceTier !== undefined) {
      tier = request.forceTier;
    } else {
      tier = classifyIntent(
        request.message,
        DEFAULT_TIER_RULES,
        this.config.defaultTier
      );
    }

    // Get tier config
    const tierConfig = this.config.tiers[tier];
    if (!tierConfig) {
      tier = this.config.defaultTier;
    }

    // Select model (with fallback if unhealthy)
    const model = this.selectModel(tier);

    // Pin to session if enabled
    if (this.config.sessionPinning && request.sessionId) {
      this.sessionModels.set(request.sessionId, model);
    }

    // Record stats
    this.recordStats(tier, model, startTime, false);

    const result: RouteResult = {
      model,
      tier,
      estimatedCostPer1k: this.getModelCost(model),
      reason:
        request.forceTier !== undefined ? "forced-tier" : "intent-classified",
      fromCache: false,
    };

    this.emit("route:selected", result);
    return result;
  }

  /**
   * Select a healthy model for a tier (with fallback)
   *
   * @param tier - Target tier
   * @returns Model ID
   */
  private selectModel(tier: Tier): string {
    const tierConfig = this.config.tiers[tier];
    if (!tierConfig) {
      // Fallback to default tier
      return this.selectModel(this.config.defaultTier);
    }

    // Try primary model
    if (this.isModelHealthy(tierConfig.primary)) {
      return tierConfig.primary;
    }

    // Try fallback chain
    for (const fallback of tierConfig.fallback) {
      if (this.isModelHealthy(fallback)) {
        this.emit("route:fallback", {
          from: tierConfig.primary,
          to: fallback,
          tier,
        });
        return fallback;
      }
    }

    // All unhealthy - return primary anyway (will mark as used)
    this.emit("route:fallback", {
      from: tierConfig.primary,
      to: tierConfig.primary,
      tier,
      reason: "all-fallbacks-unhealthy",
    });
    return tierConfig.primary;
  }

  /**
   * Check if a model is healthy
   *
   * @param model - Model ID
   * @returns True if healthy or unknown (optimistic)
   */
  private isModelHealthy(model: string): boolean {
    const health = this.modelHealth.get(model);
    if (!health) return true; // Optimistic for unknown models
    return health.healthy;
  }

  /**
   * Get the tier for a model
   *
   * @param model - Model ID
   * @returns Tier (or defaultTier if not found)
   */
  private getModelTier(model: string): Tier {
    for (const [tier, config] of Object.entries(this.config.tiers)) {
      if (config.primary === model || config.fallback.includes(model)) {
        return Number(tier) as Tier;
      }
    }
    return this.config.defaultTier;
  }

  /**
   * Get estimated cost per 1k tokens for a model
   *
   * @param model - Model ID
   * @returns Cost per 1k (avg of input/output)
   */
  private getModelCost(model: string): number {
    const tier = this.getModelTier(model);
    const tierConfig = this.config.tiers[tier];
    if (!tierConfig) return 0;

    // Return average of input/output
    return (tierConfig.costPer1kInput + tierConfig.costPer1kOutput) / 2;
  }

  /**
   * Record routing statistics
   *
   * @param tier - Selected tier
   * @param model - Selected model
   * @param startTime - Request start time
   * @param fromCache - Whether from cache
   */
  private recordStats(
    tier: Tier,
    model: string,
    startTime: number,
    fromCache: boolean
  ): void {
    const latency = Date.now() - startTime;

    this.stats.totalRequests++;
    this.stats.byTier[tier] = (this.stats.byTier[tier] || 0) + 1;
    this.stats.byModel[model] = (this.stats.byModel[model] || 0) + 1;

    if (fromCache) {
      this.stats.cacheHits++;
    }

    this.latencies.push(latency);
    if (this.latencies.length > 100) {
      this.latencies.shift(); // Keep last 100
    }

    this.stats.avgLatency =
      this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  /**
   * Set model health status
   *
   * @param model - Model ID
   * @param healthy - Is healthy
   */
  setModelHealth(model: string, healthy: boolean): void {
    const existing = this.modelHealth.get(model);

    if (healthy) {
      // Reset to healthy
      this.modelHealth.set(model, {
        healthy: true,
        errorCount: 0,
      });
      if (existing?.healthy === false) {
        this.emit("health:changed", { model, healthy: true });
      }
    } else {
      // Increment error count
      const errorCount = (existing?.errorCount || 0) + 1;
      const nowUnhealthy = errorCount >= 3;

      this.modelHealth.set(model, {
        healthy: !nowUnhealthy,
        lastError: new Date(),
        errorCount,
      });

      if (nowUnhealthy && existing?.healthy !== false) {
        this.emit("health:changed", { model, healthy: false, errorCount });
      }
    }
  }

  /**
   * Get routing statistics
   *
   * @returns Current stats
   */
  getStats(): RoutingStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      byTier: { 0: 0, 1: 0, 2: 0, 3: 0 },
      byModel: {},
      avgLatency: 0,
      cacheHits: 0,
    };
    this.latencies = [];
  }

  /**
   * Get model health status
   *
   * @param model - Model ID
   * @returns Health status
   */
  getModelHealth(model: string): ModelHealth | undefined {
    return this.modelHealth.get(model);
  }

  /**
   * Clear session pinning for a session
   *
   * @param sessionId - Session ID
   */
  clearSession(sessionId: string): void {
    this.sessionModels.delete(sessionId);
  }

  /**
   * Clear all session pins
   */
  clearAllSessions(): void {
    this.sessionModels.clear();
  }
}
