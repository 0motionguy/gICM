/**
 * Engine Manager - Central engine connection management
 *
 * Manages lifecycle and health of all gICM engines.
 */

import { EventBus } from "./event-bus.js";

// ============================================================================
// TYPES
// ============================================================================

export type EngineId = "brain" | "money" | "growth" | "product" | "trading" | "opus67";

export interface EngineHealth {
  id: EngineId;
  connected: boolean;
  lastHeartbeat: number | null;
  status: "healthy" | "degraded" | "offline";
  error?: string;
}

export interface EngineManagerConfig {
  healthCheckInterval?: number; // ms, default 30000
  heartbeatTimeout?: number; // ms, default 60000
}

// ============================================================================
// ENGINE MANAGER
// ============================================================================

export class EngineManager {
  private eventBus: EventBus;
  private engines: Map<EngineId, EngineHealth> = new Map();
  private healthCheckTimer?: NodeJS.Timeout;
  private config: Required<EngineManagerConfig>;

  constructor(eventBus: EventBus, config?: EngineManagerConfig) {
    this.eventBus = eventBus;
    this.config = {
      healthCheckInterval: config?.healthCheckInterval ?? 30000,
      heartbeatTimeout: config?.heartbeatTimeout ?? 60000,
    };

    // Initialize engine states
    const engineIds: EngineId[] = ["brain", "money", "growth", "product", "trading", "opus67"];
    for (const id of engineIds) {
      this.engines.set(id, {
        id,
        connected: false,
        lastHeartbeat: null,
        status: "offline",
      });
    }

    // Listen for heartbeats
    this.eventBus.on("engine.heartbeat", (event) => {
      const engineId = event.source as EngineId;
      this.recordHeartbeat(engineId);
    });

    // Listen for engine start/stop
    this.eventBus.on("engine.started", (event) => {
      const engineId = event.source as EngineId;
      this.markConnected(engineId);
    });

    this.eventBus.on("engine.stopped", (event) => {
      const engineId = event.source as EngineId;
      this.markDisconnected(engineId);
    });
  }

  /**
   * Start health monitoring
   */
  startHealthChecks(): void {
    this.healthCheckTimer = setInterval(() => {
      this.checkAllEngines();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Record a heartbeat from an engine
   */
  recordHeartbeat(engineId: EngineId): void {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.lastHeartbeat = Date.now();
      engine.connected = true;
      engine.status = "healthy";
      engine.error = undefined;
    }
  }

  /**
   * Mark an engine as connected
   */
  markConnected(engineId: EngineId): void {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.connected = true;
      engine.lastHeartbeat = Date.now();
      engine.status = "healthy";
      engine.error = undefined;
    }
  }

  /**
   * Mark an engine as disconnected
   */
  markDisconnected(engineId: EngineId): void {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.connected = false;
      engine.status = "offline";
    }
  }

  /**
   * Mark an engine as having an error
   */
  markError(engineId: EngineId, error: string): void {
    const engine = this.engines.get(engineId);
    if (engine) {
      engine.status = "degraded";
      engine.error = error;
    }

    this.eventBus.publish(engineId, "engine.error", { error });
  }

  /**
   * Check all engines for health
   */
  private checkAllEngines(): void {
    const now = Date.now();

    for (const [id, engine] of this.engines) {
      if (engine.connected && engine.lastHeartbeat) {
        const timeSinceHeartbeat = now - engine.lastHeartbeat;

        if (timeSinceHeartbeat > this.config.heartbeatTimeout) {
          engine.status = "degraded";
          engine.error = "Heartbeat timeout";
        }
      }
    }
  }

  /**
   * Get health status for all engines
   */
  getAllHealth(): EngineHealth[] {
    return Array.from(this.engines.values());
  }

  /**
   * Get health status for a specific engine
   */
  getHealth(engineId: EngineId): EngineHealth | undefined {
    return this.engines.get(engineId);
  }

  /**
   * Get aggregated status
   */
  getAggregatedStatus(): {
    healthy: number;
    degraded: number;
    offline: number;
    total: number;
  } {
    let healthy = 0;
    let degraded = 0;
    let offline = 0;

    for (const engine of this.engines.values()) {
      switch (engine.status) {
        case "healthy":
          healthy++;
          break;
        case "degraded":
          degraded++;
          break;
        case "offline":
          offline++;
          break;
      }
    }

    return { healthy, degraded, offline, total: this.engines.size };
  }
}
