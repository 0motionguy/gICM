/**
 * Escalation Manager
 *
 * Handles immediate notification for critical actions.
 */

import { EventEmitter } from "eventemitter3";
import type { Action } from "../core/types.js";
import { Logger } from "../utils/logger.js";

interface EscalationEvents {
  escalated: (action: Action) => void;
  resolved: (actionId: string, approved: boolean) => void;
}

export class EscalationManager extends EventEmitter<EscalationEvents> {
  private logger: Logger;
  private pendingEscalations: Map<string, Action> = new Map();

  constructor() {
    super();
    this.logger = new Logger("Escalation");
  }

  /**
   * Escalate an action for immediate human review
   */
  async notify(action: Action): Promise<void> {
    this.pendingEscalations.set(action.id, action);

    this.logger.warn(
      "ESCALATION: " + action.type + " from " + action.engine +
      " (Risk: " + action.risk.level + ", Score: " + action.risk.score + ")"
    );

    // Format escalation details
    const details = this.formatEscalationDetails(action);
    this.logger.warn(details);

    // Emit event for notification handlers
    this.emit("escalated", action);
  }

  /**
   * Resolve an escalation
   */
  resolve(actionId: string, approved: boolean, feedback?: string): void {
    const action = this.pendingEscalations.get(actionId);
    if (!action) {
      this.logger.warn("No pending escalation found for: " + actionId);
      return;
    }

    this.pendingEscalations.delete(actionId);

    action.status = approved ? "approved" : "rejected";
    action.approvedBy = "human";
    action.approvedAt = Date.now();

    if (feedback) {
      (action as Action & { feedback?: string }).feedback = feedback;
    }

    this.logger.info(
      "Escalation " + (approved ? "APPROVED" : "REJECTED") + ": " + action.type
    );

    this.emit("resolved", actionId, approved);
  }

  /**
   * Get pending escalations
   */
  getPending(): Action[] {
    return Array.from(this.pendingEscalations.values());
  }

  /**
   * Get pending count
   */
  getPendingCount(): number {
    return this.pendingEscalations.size;
  }

  /**
   * Format escalation details for logging/notification
   */
  private formatEscalationDetails(action: Action): string {
    const lines = [
      "----------------------------------------",
      "ACTION REQUIRES IMMEDIATE REVIEW",
      "----------------------------------------",
      "Type: " + action.type,
      "Engine: " + action.engine,
      "Description: " + action.description,
      "",
      "Risk Assessment:",
      "  Level: " + action.risk.level.toUpperCase(),
      "  Score: " + action.risk.score + "/100",
      "  Est. Cost: $" + action.risk.estimatedCost,
      "  Max Loss: $" + action.risk.maxPotentialLoss,
      "  Reversible: " + (action.risk.reversible ? "Yes" : "NO"),
      "",
      "Risk Factors:",
    ];

    for (const factor of action.risk.factors) {
      lines.push(
        "  - " + factor.name + ": " +
        (factor.exceeded ? "EXCEEDED" : "OK") +
        " (" + factor.value + "/" + factor.threshold + ")"
      );
    }

    if (action.risk.rollbackPlan) {
      lines.push("");
      lines.push("Rollback Plan: " + action.risk.rollbackPlan);
    }

    lines.push("----------------------------------------");

    return lines.join("\n");
  }
}
