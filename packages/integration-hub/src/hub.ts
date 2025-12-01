/**
 * Integration Hub - Central coordination for all gICM engines
 *
 * Provides:
 * - Event bus for cross-engine communication
 * - Engine health monitoring
 * - REST + WebSocket API
 * - Automated workflows
 */

import { EventBus, eventBus } from "./event-bus.js";
import { EngineManager } from "./engine-manager.js";
import { ApiServer } from "./api/server.js";
import { registerWorkflows } from "./workflows/index.js";
import { getContentScheduler, ContentScheduler } from "./scheduler/content-scheduler.js";

// Type imports for optional engines
import type { GicmBrain } from "@gicm/orchestrator";
import type { MoneyEngine } from "@gicm/money-engine";
import type { GrowthEngine } from "@gicm/growth-engine";
import type { ProductEngine } from "@gicm/product-engine";
import type { Opus67 } from "@gicm/opus67";

// ============================================================================
// TYPES
// ============================================================================

export interface IntegrationHubConfig {
  apiPort?: number;
  apiHost?: string;
  enableWorkflows?: boolean;
  enableHealthChecks?: boolean;
}

export interface HubStatus {
  running: boolean;
  startedAt: number | null;
  apiPort: number;
  engines: ReturnType<EngineManager["getAggregatedStatus"]>;
  workflows: number;
}

// ============================================================================
// INTEGRATION HUB
// ============================================================================

export class IntegrationHub {
  private config: Required<IntegrationHubConfig>;
  private eventBusInstance: EventBus;
  private engineManager: EngineManager;
  private apiServer: ApiServer;
  private contentScheduler: ContentScheduler;
  private running = false;
  private startedAt: number | null = null;

  // Engine references (optional)
  private brain?: GicmBrain;
  private moneyEngine?: MoneyEngine;
  private growthEngine?: GrowthEngine;
  private productEngine?: ProductEngine;
  private opus67?: Opus67;

  constructor(config?: IntegrationHubConfig) {
    this.config = {
      apiPort: config?.apiPort ?? 3001,  // Dashboard expects 3001
      apiHost: config?.apiHost ?? "0.0.0.0",
      enableWorkflows: config?.enableWorkflows ?? true,
      enableHealthChecks: config?.enableHealthChecks ?? true,
    };

    this.eventBusInstance = eventBus;
    this.engineManager = new EngineManager(this.eventBusInstance);
    this.apiServer = new ApiServer(this, {
      port: this.config.apiPort,
      host: this.config.apiHost,
    });
    this.contentScheduler = getContentScheduler();
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /**
   * Start the integration hub
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log("[HUB] Already running");
      return;
    }

    console.log("[HUB] Starting Integration Hub...");

    // Start health checks
    if (this.config.enableHealthChecks) {
      this.engineManager.startHealthChecks();
    }

    // Register workflows
    if (this.config.enableWorkflows) {
      registerWorkflows(this);
    }

    // Start API server
    await this.apiServer.start();

    // Start Content Scheduler
    this.contentScheduler.start();

    this.running = true;
    this.startedAt = Date.now();

    console.log("[HUB] Integration Hub started on port", this.config.apiPort);
    this.eventBusInstance.publish("hub", "engine.started", { engine: "hub" });
  }

  /**
   * Stop the integration hub
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.log("[HUB] Not running");
      return;
    }

    console.log("[HUB] Stopping Integration Hub...");

    // Stop health checks
    this.engineManager.stopHealthChecks();

    // Stop API server
    await this.apiServer.stop();

    // Stop Content Scheduler
    this.contentScheduler.stop();

    this.running = false;

    console.log("[HUB] Integration Hub stopped");
    this.eventBusInstance.publish("hub", "engine.stopped", { engine: "hub" });
  }

  // =========================================================================
  // ENGINE CONNECTIONS
  // =========================================================================

  /**
   * Connect the Brain
   */
  connectBrain(brain: GicmBrain): void {
    this.brain = brain;
    this.engineManager.markConnected("brain");
    console.log("[HUB] Brain connected");
  }

  /**
   * Connect the Money Engine
   */
  connectMoneyEngine(engine: MoneyEngine): void {
    this.moneyEngine = engine;
    this.engineManager.markConnected("money");
    console.log("[HUB] Money Engine connected");

    // Wire up events
    this.moneyEngine.on("trade", (trade) => {
      this.eventBusInstance.publish("money", "trade.executed", {
        id: trade.id,
        timestamp: new Date(trade.executedAt).toISOString(),
        engine: "money",
        type: "trade_executed",
        title: `${trade.side.toUpperCase()} ${trade.symbol}`,
        description: `Executed ${trade.side} ${trade.size} ${trade.symbol} @ $${trade.price}`,
        metrics: {
          price: trade.price.toNumber(),
          size: trade.size.toNumber(),
          valueUsd: trade.valueUsd.toNumber(),
          pnl: trade.realizedPnL?.toNumber() || 0,
        },
        tags: ["trading", trade.symbol.toLowerCase(), trade.side],
        source: trade,
      });
    });

    this.moneyEngine.on("alert", (message) => {
        // TODO: Handle alerts
        console.log(`[HUB] Money Engine Alert: ${message}`);
    });
  }

  /**
   * Connect the Growth Engine
   */
  connectGrowthEngine(engine: GrowthEngine): void {
    this.growthEngine = engine;
    this.engineManager.markConnected("growth");
    console.log("[HUB] Growth Engine connected");
  }

  /**
   * Connect the Product Engine
   */
  connectProductEngine(engine: ProductEngine): void {
    this.productEngine = engine;
    this.engineManager.markConnected("product");
    console.log("[HUB] Product Engine connected");
  }

  /**
   * Connect OPUS67 Runtime
   */
  connectOpus67(runtime: Opus67): void {
    this.opus67 = runtime;
    this.engineManager.markConnected("opus67");
    console.log("[HUB] OPUS67 connected");

    // Emit boot event
    this.eventBusInstance.publish("opus67", "opus67.boot", {
      mode: runtime.getMode(),
      version: "2.0.0",
    });
  }

  // =========================================================================
  // GETTERS
  // =========================================================================

  getEventBus(): EventBus {
    return this.eventBusInstance;
  }

  getEngineManager(): EngineManager {
    return this.engineManager;
  }

  getBrain(): GicmBrain | undefined {
    return this.brain;
  }

  getMoneyEngine(): MoneyEngine | undefined {
    return this.moneyEngine;
  }

  getGrowthEngine(): GrowthEngine | undefined {
    return this.growthEngine;
  }

  getProductEngine(): ProductEngine | undefined {
    return this.productEngine;
  }

  getOpus67(): Opus67 | undefined {
    return this.opus67;
  }

  /**
   * Get hub status
   */
  getStatus(): HubStatus {
    return {
      running: this.running,
      startedAt: this.startedAt,
      apiPort: this.config.apiPort,
      engines: this.engineManager.getAggregatedStatus(),
      workflows: this.config.enableWorkflows ? 6 : 0, // +2 for content scheduler workflows
    };
  }
}

// ============================================================================
// SINGLETON ACCESS
// ============================================================================

let hubInstance: IntegrationHub | null = null;

/**
 * Set the global hub instance (called from CLI when starting)
 */
export function setHubInstance(hub: IntegrationHub): void {
  hubInstance = hub;
}

/**
 * Get the global hub instance for engines to emit events
 * Returns a simplified interface for engine event emission
 */
export function getHub(): {
  engineStarted(name: string): void;
  heartbeat(name: string): void;
  publish(source: string, type: string, payload: Record<string, unknown>): void;
} | null {
  if (!hubInstance) return null;

  const eventBus = hubInstance.getEventBus();

  return {
    engineStarted: (name: string) => {
      eventBus.publish(name, "engine.started", { engine: name, timestamp: Date.now() });
    },
    heartbeat: (name: string) => {
      eventBus.publish(name, "engine.heartbeat", { engine: name, timestamp: Date.now() });
    },
    publish: (source: string, type: string, payload: Record<string, unknown>) => {
      eventBus.publish(source, type, payload);
    },
  };
}
