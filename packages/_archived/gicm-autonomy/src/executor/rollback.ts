/**
 * Rollback Manager
 *
 * Manages checkpoints and rollback for reversible actions.
 */

import type { Action } from "../core/types.js";
import { Logger } from "../utils/logger.js";

interface Checkpoint {
  actionId: string;
  createdAt: number;
  state: unknown;
  rollbackFn?: () => Promise<void>;
}

export class RollbackManager {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private logger: Logger;
  private maxCheckpoints = 100;

  constructor() {
    this.logger = new Logger("Rollback");
  }

  /**
   * Create a checkpoint before executing an action
   */
  async createCheckpoint(action: Action, state?: unknown): Promise<void> {
    const checkpoint: Checkpoint = {
      actionId: action.id,
      createdAt: Date.now(),
      state,
    };

    // Generate rollback function based on action type
    checkpoint.rollbackFn = this.generateRollbackFn(action);

    this.checkpoints.set(action.id, checkpoint);
    this.logger.debug("Checkpoint created for: " + action.id);

    // Cleanup old checkpoints
    this.cleanupOldCheckpoints();
  }

  /**
   * Restore from checkpoint (rollback)
   */
  async restore(action: Action): Promise<void> {
    const checkpoint = this.checkpoints.get(action.id);

    if (!checkpoint) {
      this.logger.warn("No checkpoint found for: " + action.id);
      throw new Error("No checkpoint available for rollback");
    }

    if (checkpoint.rollbackFn) {
      this.logger.info("Executing rollback for: " + action.id);
      await checkpoint.rollbackFn();
      this.logger.info("Rollback completed for: " + action.id);
    } else {
      this.logger.warn("No rollback function for: " + action.id);
    }

    // Remove checkpoint after use
    this.checkpoints.delete(action.id);
  }

  /**
   * Check if rollback is available
   */
  hasCheckpoint(actionId: string): boolean {
    return this.checkpoints.has(actionId);
  }

  /**
   * Get checkpoint state
   */
  getState(actionId: string): unknown | undefined {
    return this.checkpoints.get(actionId)?.state;
  }

  /**
   * Clear checkpoint (after successful verification)
   */
  clearCheckpoint(actionId: string): void {
    this.checkpoints.delete(actionId);
    this.logger.debug("Checkpoint cleared for: " + actionId);
  }

  /**
   * Generate rollback function based on action type
   */
  private generateRollbackFn(action: Action): (() => Promise<void>) | undefined {
    const type = action.type;

    if (type.includes("commit")) {
      return async () => {
        this.logger.info("Would execute: git revert " + action.params.commitHash);
        // In real implementation: await execAsync("git revert --no-commit " + action.params.commitHash);
      };
    }

    if (type.includes("deploy:staging")) {
      return async () => {
        this.logger.info("Would rollback staging deployment");
        // In real implementation: trigger rollback deployment
      };
    }

    if (type.includes("config:update")) {
      return async () => {
        this.logger.info("Would restore previous config");
        // In real implementation: restore from checkpoint state
      };
    }

    // Default: no automatic rollback
    return undefined;
  }

  /**
   * Cleanup old checkpoints (keep last N)
   */
  private cleanupOldCheckpoints(): void {
    if (this.checkpoints.size <= this.maxCheckpoints) {
      return;
    }

    // Sort by creation time and remove oldest
    const entries = Array.from(this.checkpoints.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    const toRemove = entries.slice(0, entries.length - this.maxCheckpoints);
    for (const [id] of toRemove) {
      this.checkpoints.delete(id);
    }

    this.logger.debug("Cleaned up " + toRemove.length + " old checkpoints");
  }
}
