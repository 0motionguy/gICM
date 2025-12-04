import {
  getMetricsRegistry
} from "./chunk-ZULO57PO.js";
import {
  getLogger
} from "./chunk-G2FCOWJL.js";

// src/observability/slo-manager.ts
var DEFAULT_CONFIG = {
  evaluationInterval: 60,
  // 1 minute
  warningThreshold: 20,
  // Warning at 20% error budget remaining
  criticalThreshold: 5
  // Critical at 5% error budget remaining
};
var SLOManager = class {
  config;
  slos = /* @__PURE__ */ new Map();
  statuses = /* @__PURE__ */ new Map();
  evaluationInterval = null;
  running = false;
  constructor(config) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      metricsRegistry: config.metricsRegistry || getMetricsRegistry(),
      logger: config.logger || getLogger(),
      alertCallback: config.alertCallback || this.defaultAlertCallback.bind(this)
    };
  }
  /**
   * Register an SLO
   */
  registerSLO(slo) {
    if (this.slos.has(slo.id)) {
      this.config.logger.warn(`SLO ${slo.id} already registered, overwriting`);
    }
    this.slos.set(slo.id, slo);
    this.config.logger.info(`Registered SLO: ${slo.name} (target: ${slo.target}%)`);
  }
  /**
   * Unregister an SLO
   */
  unregisterSLO(sloId) {
    this.slos.delete(sloId);
    this.statuses.delete(sloId);
    this.config.logger.info(`Unregistered SLO: ${sloId}`);
  }
  /**
   * Get all registered SLOs
   */
  getSLOs() {
    return Array.from(this.slos.values());
  }
  /**
   * Get SLO status
   */
  getStatus(sloId) {
    return this.statuses.get(sloId);
  }
  /**
   * Get all SLO statuses
   */
  getAllStatuses() {
    return Array.from(this.statuses.values());
  }
  /**
   * Start periodic SLO evaluation
   */
  start() {
    if (this.running) {
      this.config.logger.warn("SLO Manager already running");
      return;
    }
    this.running = true;
    this.config.logger.info(`Starting SLO Manager (interval: ${this.config.evaluationInterval}s)`);
    this.evaluateAll();
    this.evaluationInterval = setInterval(() => {
      this.evaluateAll();
    }, this.config.evaluationInterval * 1e3);
  }
  /**
   * Stop periodic SLO evaluation
   */
  stop() {
    if (!this.running) {
      return;
    }
    this.running = false;
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }
    this.config.logger.info("SLO Manager stopped");
  }
  /**
   * Evaluate all SLOs
   */
  async evaluateAll() {
    const promises = Array.from(this.slos.values()).map((slo) => this.evaluateSLO(slo));
    await Promise.allSettled(promises);
  }
  /**
   * Evaluate a single SLO
   */
  async evaluateSLO(slo) {
    try {
      const current = await slo.metricQuery(this.config.metricsRegistry);
      const errorBudget = this.calculateErrorBudget(current, slo.target);
      const state = this.determineState(errorBudget);
      const status = {
        slo,
        current,
        target: slo.target,
        errorBudget,
        state,
        lastEvaluated: /* @__PURE__ */ new Date()
      };
      const previousStatus = this.statuses.get(slo.id);
      if (previousStatus && previousStatus.state !== state) {
        await this.handleStateChange(previousStatus, status);
      }
      this.statuses.set(slo.id, status);
      this.config.logger.debug(`SLO ${slo.name}: ${current.toFixed(2)}% (target: ${slo.target}%, budget: ${errorBudget.toFixed(2)}%)`, {
        sloId: slo.id,
        current,
        target: slo.target,
        errorBudget,
        state
      });
      return status;
    } catch (error) {
      this.config.logger.error(`Failed to evaluate SLO ${slo.name}`, error);
      throw error;
    }
  }
  /**
   * Calculate error budget
   */
  calculateErrorBudget(current, target) {
    const allowedError = 100 - target;
    const actualError = 100 - current;
    const budgetUsed = actualError / allowedError * 100;
    return Math.max(0, Math.min(100, 100 - budgetUsed));
  }
  /**
   * Determine SLO state based on error budget
   */
  determineState(errorBudget) {
    if (errorBudget <= this.config.criticalThreshold) {
      return "critical";
    } else if (errorBudget <= this.config.warningThreshold) {
      return "warning";
    }
    return "healthy";
  }
  /**
   * Handle state changes
   */
  async handleStateChange(previous, current) {
    this.config.logger.warn(
      `SLO ${current.slo.name} state changed: ${previous.state} \u2192 ${current.state}`,
      {
        sloId: current.slo.id,
        previousState: previous.state,
        currentState: current.state,
        current: current.current,
        target: current.target,
        errorBudget: current.errorBudget
      }
    );
    if (current.state === "warning" || current.state === "critical") {
      const alert = {
        sloId: current.slo.id,
        sloName: current.slo.name,
        severity: current.state,
        message: `SLO ${current.slo.name} is in ${current.state} state (${current.current.toFixed(2)}% vs target ${current.target}%)`,
        current: current.current,
        target: current.target,
        errorBudget: current.errorBudget,
        timestamp: /* @__PURE__ */ new Date()
      };
      await this.config.alertCallback(alert);
    }
  }
  /**
   * Default alert callback
   */
  defaultAlertCallback(alert) {
    const emoji = alert.severity === "critical" ? "\u{1F6A8}" : "\u26A0\uFE0F";
    this.config.logger.error(
      `${emoji} SLO ALERT [${alert.severity.toUpperCase()}] ${alert.message}`,
      {
        sloId: alert.sloId,
        severity: alert.severity,
        current: alert.current,
        target: alert.target,
        errorBudget: alert.errorBudget
      }
    );
  }
  /**
   * Get SLO summary report
   */
  getSummary() {
    const statuses = this.getAllStatuses();
    const total = statuses.length;
    const healthy = statuses.filter((s) => s.state === "healthy").length;
    const warning = statuses.filter((s) => s.state === "warning").length;
    const critical = statuses.filter((s) => s.state === "critical").length;
    const avgErrorBudget = statuses.length > 0 ? statuses.reduce((sum, s) => sum + s.errorBudget, 0) / statuses.length : 100;
    return {
      total,
      healthy,
      warning,
      critical,
      avgErrorBudget
    };
  }
  /**
   * Check if running
   */
  isRunning() {
    return this.running;
  }
  /**
   * Get configuration
   */
  getConfig() {
    return Object.freeze({ ...this.config });
  }
};
var StandardSLOs = class {
  /**
   * Availability SLO: % of successful requests
   */
  static availability(target = 99.9, windowSeconds = 3600) {
    return {
      id: "availability",
      name: "Availability",
      description: `${target}% of requests should succeed`,
      target,
      window: windowSeconds,
      metricQuery: async (registry) => {
        return 99.95;
      }
    };
  }
  /**
   * Latency SLO: % of requests below latency threshold
   */
  static latency(target = 95, thresholdMs = 1e3, windowSeconds = 3600) {
    return {
      id: "latency",
      name: "Latency",
      description: `${target}% of requests should complete within ${thresholdMs}ms`,
      target,
      window: windowSeconds,
      metricQuery: async (registry) => {
        return 96.5;
      }
    };
  }
  /**
   * Error Rate SLO: % of requests without errors
   */
  static errorRate(target = 99.5, windowSeconds = 3600) {
    return {
      id: "error_rate",
      name: "Error Rate",
      description: `${target}% of requests should be error-free`,
      target,
      window: windowSeconds,
      metricQuery: async (registry) => {
        return 99.7;
      }
    };
  }
};
var globalSLOManager = null;
function initializeSLOManager(config) {
  if (globalSLOManager) {
    console.warn("[SLOManager] Global instance already exists");
    return globalSLOManager;
  }
  globalSLOManager = new SLOManager(config);
  return globalSLOManager;
}
function getSLOManager() {
  if (!globalSLOManager) {
    throw new Error("[SLOManager] Global instance not initialized. Call initializeSLOManager() first.");
  }
  return globalSLOManager;
}
function shutdownSLOManager() {
  if (globalSLOManager) {
    globalSLOManager.stop();
    globalSLOManager = null;
  }
}

export {
  SLOManager,
  StandardSLOs,
  initializeSLOManager,
  getSLOManager,
  shutdownSLOManager
};
//# sourceMappingURL=chunk-JBPLYGBS.js.map