/**
 * Auto-Executor
 *
 * Executes approved actions automatically.
 */

import { EventEmitter } from "eventemitter3";
import type { Action } from "../core/types.js";
import { SafeActions, type ActionHandler } from "./safe-actions.js";
import { RollbackManager } from "./rollback.js";
import { Logger } from "../utils/logger.js";

interface ExecutorEvents {
  executed: (action: Action) => void;
  failed: (action: Action, error: Error) => void;
  rolled_back: (action: Action) => void;
}

export class AutoExecutor extends EventEmitter<ExecutorEvents> {
  private safeActions: SafeActions;
  private rollback: RollbackManager;
  private logger: Logger;
  private executing: Set<string> = new Set();

  constructor() {
    super();
    this.safeActions = new SafeActions();
    this.rollback = new RollbackManager();
    this.logger = new Logger("AutoExecutor");
  }

  /**
   * Execute an auto-approved action
   */
  async execute(action: Action): Promise<boolean> {
    if (action.route !== "auto" || !action.approvedBy) {
      this.logger.error("Action " + action.id + " not approved for auto-execution");
      return false;
    }

    if (this.executing.has(action.id)) {
      this.logger.warn("Action " + action.id + " already executing");
      return false;
    }

    this.executing.add(action.id);
    this.logger.info("Executing: " + action.type);

    try {
      // Create rollback point if reversible
      if (action.risk.reversible) {
        await this.rollback.createCheckpoint(action);
      }

      // Execute the action
      const result = await this.safeActions.execute(action);

      action.status = "executed";
      action.executedAt = Date.now();
      action.result = result;

      this.logger.info("Executed successfully: " + action.type);
      this.emit("executed", action);

      // Clear checkpoint on success
      if (action.risk.reversible) {
        this.rollback.clearCheckpoint(action.id);
      }

      return true;
    } catch (error) {
      action.status = "failed";
      action.error = (error as Error).message;

      this.logger.error("Execution failed: " + action.type + " - " + action.error);
      this.emit("failed", action, error as Error);

      // Auto-rollback if possible
      if (action.risk.reversible) {
        await this.attemptRollback(action);
      }

      return false;
    } finally {
      this.executing.delete(action.id);
    }
  }

  /**
   * Attempt to rollback a failed action
   */
  private async attemptRollback(action: Action): Promise<void> {
    try {
      await this.rollback.restore(action);
      action.status = "rolled_back";
      this.logger.info("Rolled back: " + action.type);
      this.emit("rolled_back", action);
    } catch (error) {
      this.logger.error("Rollback failed: " + action.type);
    }
  }

  /**
   * Execute multiple actions in sequence
   */
  async executeBatch(actions: Action[]): Promise<{ success: Action[]; failed: Action[] }> {
    const success: Action[] = [];
    const failed: Action[] = [];

    for (const action of actions) {
      const result = await this.execute(action);
      if (result) {
        success.push(action);
      } else {
        failed.push(action);
      }
    }

    return { success, failed };
  }

  /**
   * Register custom action handler
   */
  registerHandler(actionType: string, handler: ActionHandler): void {
    this.safeActions.register(actionType, handler);
  }

  /**
   * Check if action type can be executed
   */
  canExecute(actionType: string): boolean {
    return this.safeActions.hasHandler(actionType);
  }

  /**
   * Get rollback manager
   */
  getRollbackManager(): RollbackManager {
    return this.rollback;
  }
}

// Re-exports
export { SafeActions, type ActionHandler } from "./safe-actions.js";
export { RollbackManager } from "./rollback.js";
