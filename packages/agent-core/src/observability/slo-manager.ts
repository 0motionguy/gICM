/**
 * SLO Manager (Phase 14D)
 *
 * Service Level Objective (SLO) tracking and alerting.
 * Monitors availability, latency, error rate, and custom SLOs.
 * Calculates error budgets and triggers alerts when SLOs are at risk.
 */

import { getMetricsRegistry, type MetricsRegistry } from './metrics-registry.js';
import { getLogger, type LogAggregator } from './log-aggregator.js';

export interface SLO {
  id: string;
  name: string;
  description: string;
  target: number; // Target percentage (0-100)
  window: number; // Time window in seconds
  metricQuery: (registry: MetricsRegistry) => Promise<number>;
}

export interface SLOStatus {
  slo: SLO;
  current: number; // Current percentage (0-100)
  target: number; // Target percentage (0-100)
  errorBudget: number; // Remaining error budget (0-100)
  state: 'healthy' | 'warning' | 'critical';
  lastEvaluated: Date;
}

export interface SLOAlert {
  sloId: string;
  sloName: string;
  severity: 'warning' | 'critical';
  message: string;
  current: number;
  target: number;
  errorBudget: number;
  timestamp: Date;
}

export interface SLOManagerConfig {
  serviceName: string;
  evaluationInterval?: number; // Seconds between evaluations
  warningThreshold?: number; // % of error budget remaining to trigger warning
  criticalThreshold?: number; // % of error budget remaining to trigger critical
  alertCallback?: (alert: SLOAlert) => void | Promise<void>;
  metricsRegistry?: MetricsRegistry;
  logger?: LogAggregator;
}

const DEFAULT_CONFIG: Partial<SLOManagerConfig> = {
  evaluationInterval: 60, // 1 minute
  warningThreshold: 20, // Warning at 20% error budget remaining
  criticalThreshold: 5, // Critical at 5% error budget remaining
};

/**
 * SLO Manager
 */
export class SLOManager {
  private config: Required<SLOManagerConfig>;
  private slos = new Map<string, SLO>();
  private statuses = new Map<string, SLOStatus>();
  private evaluationInterval: NodeJS.Timeout | null = null;
  private running = false;

  constructor(config: SLOManagerConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      metricsRegistry: config.metricsRegistry || getMetricsRegistry(),
      logger: config.logger || getLogger(),
      alertCallback: config.alertCallback || this.defaultAlertCallback.bind(this),
    } as Required<SLOManagerConfig>;
  }

  /**
   * Register an SLO
   */
  registerSLO(slo: SLO): void {
    if (this.slos.has(slo.id)) {
      this.config.logger.warn(`SLO ${slo.id} already registered, overwriting`);
    }

    this.slos.set(slo.id, slo);
    this.config.logger.info(`Registered SLO: ${slo.name} (target: ${slo.target}%)`);
  }

  /**
   * Unregister an SLO
   */
  unregisterSLO(sloId: string): void {
    this.slos.delete(sloId);
    this.statuses.delete(sloId);
    this.config.logger.info(`Unregistered SLO: ${sloId}`);
  }

  /**
   * Get all registered SLOs
   */
  getSLOs(): SLO[] {
    return Array.from(this.slos.values());
  }

  /**
   * Get SLO status
   */
  getStatus(sloId: string): SLOStatus | undefined {
    return this.statuses.get(sloId);
  }

  /**
   * Get all SLO statuses
   */
  getAllStatuses(): SLOStatus[] {
    return Array.from(this.statuses.values());
  }

  /**
   * Start periodic SLO evaluation
   */
  start(): void {
    if (this.running) {
      this.config.logger.warn('SLO Manager already running');
      return;
    }

    this.running = true;
    this.config.logger.info(`Starting SLO Manager (interval: ${this.config.evaluationInterval}s)`);

    // Initial evaluation
    this.evaluateAll();

    // Periodic evaluation
    this.evaluationInterval = setInterval(() => {
      this.evaluateAll();
    }, this.config.evaluationInterval * 1000);
  }

  /**
   * Stop periodic SLO evaluation
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    this.config.logger.info('SLO Manager stopped');
  }

  /**
   * Evaluate all SLOs
   */
  async evaluateAll(): Promise<void> {
    const promises = Array.from(this.slos.values()).map(slo => this.evaluateSLO(slo));
    await Promise.allSettled(promises);
  }

  /**
   * Evaluate a single SLO
   */
  async evaluateSLO(slo: SLO): Promise<SLOStatus> {
    try {
      const current = await slo.metricQuery(this.config.metricsRegistry);
      const errorBudget = this.calculateErrorBudget(current, slo.target);
      const state = this.determineState(errorBudget);

      const status: SLOStatus = {
        slo,
        current,
        target: slo.target,
        errorBudget,
        state,
        lastEvaluated: new Date(),
      };

      // Check previous status for state changes
      const previousStatus = this.statuses.get(slo.id);
      if (previousStatus && previousStatus.state !== state) {
        await this.handleStateChange(previousStatus, status);
      }

      // Update status
      this.statuses.set(slo.id, status);

      // Log status
      this.config.logger.debug(`SLO ${slo.name}: ${current.toFixed(2)}% (target: ${slo.target}%, budget: ${errorBudget.toFixed(2)}%)`, {
        sloId: slo.id,
        current,
        target: slo.target,
        errorBudget,
        state,
      });

      return status;
    } catch (error) {
      this.config.logger.error(`Failed to evaluate SLO ${slo.name}`, error as Error);
      throw error;
    }
  }

  /**
   * Calculate error budget
   */
  private calculateErrorBudget(current: number, target: number): number {
    const allowedError = 100 - target;
    const actualError = 100 - current;
    const budgetUsed = (actualError / allowedError) * 100;
    return Math.max(0, Math.min(100, 100 - budgetUsed));
  }

  /**
   * Determine SLO state based on error budget
   */
  private determineState(errorBudget: number): 'healthy' | 'warning' | 'critical' {
    if (errorBudget <= this.config.criticalThreshold) {
      return 'critical';
    } else if (errorBudget <= this.config.warningThreshold) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * Handle state changes
   */
  private async handleStateChange(previous: SLOStatus, current: SLOStatus): Promise<void> {
    this.config.logger.warn(
      `SLO ${current.slo.name} state changed: ${previous.state} → ${current.state}`,
      {
        sloId: current.slo.id,
        previousState: previous.state,
        currentState: current.state,
        current: current.current,
        target: current.target,
        errorBudget: current.errorBudget,
      }
    );

    // Trigger alert for warning or critical states
    if (current.state === 'warning' || current.state === 'critical') {
      const alert: SLOAlert = {
        sloId: current.slo.id,
        sloName: current.slo.name,
        severity: current.state,
        message: `SLO ${current.slo.name} is in ${current.state} state (${current.current.toFixed(2)}% vs target ${current.target}%)`,
        current: current.current,
        target: current.target,
        errorBudget: current.errorBudget,
        timestamp: new Date(),
      };

      await this.config.alertCallback(alert);
    }
  }

  /**
   * Default alert callback
   */
  private defaultAlertCallback(alert: SLOAlert): void {
    const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
    this.config.logger.error(
      `${emoji} SLO ALERT [${alert.severity.toUpperCase()}] ${alert.message}`,
      {
        sloId: alert.sloId,
        severity: alert.severity,
        current: alert.current,
        target: alert.target,
        errorBudget: alert.errorBudget,
      }
    );
  }

  /**
   * Get SLO summary report
   */
  getSummary(): {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    avgErrorBudget: number;
  } {
    const statuses = this.getAllStatuses();
    const total = statuses.length;
    const healthy = statuses.filter(s => s.state === 'healthy').length;
    const warning = statuses.filter(s => s.state === 'warning').length;
    const critical = statuses.filter(s => s.state === 'critical').length;
    const avgErrorBudget = statuses.length > 0
      ? statuses.reduce((sum, s) => sum + s.errorBudget, 0) / statuses.length
      : 100;

    return {
      total,
      healthy,
      warning,
      critical,
      avgErrorBudget,
    };
  }

  /**
   * Check if running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<SLOManagerConfig> {
    return Object.freeze({ ...this.config });
  }
}

/**
 * Standard SLO Definitions
 */
export class StandardSLOs {
  /**
   * Availability SLO: % of successful requests
   */
  static availability(target = 99.9, windowSeconds = 3600): SLO {
    return {
      id: 'availability',
      name: 'Availability',
      description: `${target}% of requests should succeed`,
      target,
      window: windowSeconds,
      metricQuery: async (registry) => {
        // This is a simplified example. In production, you'd query actual metrics.
        // For now, return a placeholder value.
        return 99.95;
      },
    };
  }

  /**
   * Latency SLO: % of requests below latency threshold
   */
  static latency(target = 95, thresholdMs = 1000, windowSeconds = 3600): SLO {
    return {
      id: 'latency',
      name: 'Latency',
      description: `${target}% of requests should complete within ${thresholdMs}ms`,
      target,
      window: windowSeconds,
      metricQuery: async (registry) => {
        // Placeholder
        return 96.5;
      },
    };
  }

  /**
   * Error Rate SLO: % of requests without errors
   */
  static errorRate(target = 99.5, windowSeconds = 3600): SLO {
    return {
      id: 'error_rate',
      name: 'Error Rate',
      description: `${target}% of requests should be error-free`,
      target,
      window: windowSeconds,
      metricQuery: async (registry) => {
        // Placeholder
        return 99.7;
      },
    };
  }
}

/**
 * Global SLO Manager (singleton pattern)
 */
let globalSLOManager: SLOManager | null = null;

export function initializeSLOManager(config: SLOManagerConfig): SLOManager {
  if (globalSLOManager) {
    console.warn('[SLOManager] Global instance already exists');
    return globalSLOManager;
  }

  globalSLOManager = new SLOManager(config);
  return globalSLOManager;
}

export function getSLOManager(): SLOManager {
  if (!globalSLOManager) {
    throw new Error('[SLOManager] Global instance not initialized. Call initializeSLOManager() first.');
  }
  return globalSLOManager;
}

export function shutdownSLOManager(): void {
  if (globalSLOManager) {
    globalSLOManager.stop();
    globalSLOManager = null;
  }
}
