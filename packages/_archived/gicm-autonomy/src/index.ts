/**
 * gICM Autonomy Level 2
 *
 * Bounded autonomous decision-making system.
 */

import { EventEmitter } from "eventemitter3";
import type { Action, Boundaries, EngineType, DecisionRoute } from "./core/types.js";
import { getDefaultBoundaries, mergeBoundaries } from "./core/config.js";
import { DecisionRouter } from "./router/index.js";
import { AutoExecutor } from "./executor/index.js";
import { ApprovalQueue, NotificationManager, type NotificationConfig } from "./approval/index.js";
import { AuditLogger } from "./audit/index.js";
import { Logger } from "./utils/logger.js";

export interface AutonomyConfig {
  boundaries?: Partial<Boundaries>;
  notifications?: NotificationConfig;
  enableBatching?: boolean;
}

interface AutonomyEvents {
  "action:auto_executed": (action: Action) => void;
  "action:queued": (action: Action) => void;
  "action:escalated": (action: Action) => void;
  "action:approved": (action: Action) => void;
  "action:rejected": (action: Action) => void;
  "action:executed": (action: Action) => void;
  "action:failed": (action: Action, error: Error) => void;
}

export class AutonomySystem extends EventEmitter<AutonomyEvents> {
  private router: DecisionRouter;
  private executor: AutoExecutor;
  private approvalQueue: ApprovalQueue;
  private notifications: NotificationManager;
  private auditLogger: AuditLogger;
  private logger: Logger;
  private boundaries: Boundaries;

  constructor(config: AutonomyConfig = {}) {
    super();
    this.logger = new Logger("Autonomy");
    this.boundaries = mergeBoundaries(getDefaultBoundaries(), config.boundaries || {});
    this.router = new DecisionRouter(this.boundaries);
    this.executor = new AutoExecutor();
    this.approvalQueue = new ApprovalQueue();
    this.notifications = new NotificationManager(config.notifications);
    this.auditLogger = new AuditLogger();
    this.setupEventHandlers();
    if (config.enableBatching !== false) {
      this.approvalQueue.startBatchTimer();
    }
    this.logger.info("Autonomy System initialized (Level 2)");
  }

  async processAction(action: Partial<Action> & { type: string; engine: EngineType }): Promise<{
    route: DecisionRoute;
    action: Action;
  }> {
    const fullAction: Action = {
      id: action.id || this.generateId(),
      engine: action.engine,
      type: action.type,
      description: action.description || action.type,
      params: action.params || {},
      risk: action.risk || {
        level: "safe",
        score: 0,
        factors: [],
        estimatedCost: 0,
        maxPotentialLoss: 0,
        reversible: true,
      },
      route: "queue",
      status: "pending",
      createdAt: Date.now(),
    };

    const route = await this.router.route(fullAction);

    if (route === "auto") {
      const success = await this.executor.execute(fullAction);
      this.auditLogger.log(fullAction, success ? "success" : "failed", fullAction.risk.estimatedCost);
      if (success) this.router.recordExecution(fullAction);
    } else if (route === "queue") {
      this.approvalQueue.add(fullAction, "Requires review");
    }

    return { route, action: fullAction };
  }

  async approveAction(actionId: string, feedback?: string): Promise<boolean> {
    const item = this.approvalQueue.get(actionId);
    if (!item) return false;
    this.approvalQueue.approve(actionId, feedback);
    const success = await this.executor.execute(item.action);
    this.auditLogger.log(item.action, success ? "success" : "failed", item.action.risk.estimatedCost);
    return success;
  }

  rejectAction(actionId: string, feedback?: string): boolean {
    const item = this.approvalQueue.get(actionId);
    if (!item) return false;
    this.approvalQueue.reject(actionId, feedback);
    this.auditLogger.log(item.action, "failed", 0, 0);
    return true;
  }

  getPendingApprovals() { return this.approvalQueue.getPending(); }
  getBatch() { return this.approvalQueue.getBatch(); }
  getBoundaries(): Boundaries { return this.boundaries; }
  
  updateBoundaries(newBoundaries: Partial<Boundaries>): void {
    this.boundaries = mergeBoundaries(this.boundaries, newBoundaries);
    this.router.updateBoundaries(this.boundaries);
  }

  getAuditSummary(since?: number) { return this.auditLogger.getSummary(since); }
  getDailySummary() { return this.auditLogger.getDailySummary(); }
  getQueueStats() { return this.approvalQueue.getStats(); }

  registerActionHandler(actionType: string, handler: (action: Action) => Promise<unknown>): void {
    this.executor.registerHandler(actionType, handler);
  }

  setNotificationConfig(config: NotificationConfig): void {
    this.notifications.setConfig(config);
  }

  async sendDailySummary(): Promise<void> {
    const summary = this.getDailySummary();
    await this.notifications.sendDailySummary(summary);
  }

  shutdown(): void {
    this.approvalQueue.stopBatchTimer();
    this.logger.info("Autonomy System shutdown");
  }

  private setupEventHandlers(): void {
    this.router.on("action:auto_approved", (action) => this.emit("action:auto_executed", action));
    this.router.on("action:queued", (action) => this.emit("action:queued", action));
    this.router.on("action:escalated", (action) => {
      this.emit("action:escalated", action);
      this.notifications.escalate(action).catch(() => {});
    });
    this.executor.on("executed", (action) => this.emit("action:executed", action));
    this.executor.on("failed", (action, error) => this.emit("action:failed", action, error));
    this.approvalQueue.on("item_approved", (item) => this.emit("action:approved", item.action));
    this.approvalQueue.on("item_rejected", (item) => this.emit("action:rejected", item.action));
    this.approvalQueue.on("batch_ready", (batch) => this.notifications.notifyBatchReady(batch).catch(() => {}));
  }

  private generateId(): string {
    return "action-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }
}

// Exports
export type { Action, Boundaries, RiskLevel, RiskAssessment, RiskFactor, DecisionRoute, EngineType, ApprovalItem, BatchApproval, AuditEntry, BoundaryCheckResult } from "./core/types.js";
export { getDefaultBoundaries, mergeBoundaries } from "./core/config.js";
export { DecisionRouter, RiskClassifier, BoundaryChecker, EscalationManager } from "./router/index.js";
export { AutoExecutor, SafeActions, RollbackManager } from "./executor/index.js";
export type { ActionHandler } from "./executor/index.js";
export { ApprovalQueue, NotificationManager } from "./approval/index.js";
export type { NotificationConfig } from "./approval/index.js";
export { AuditLogger } from "./audit/index.js";
