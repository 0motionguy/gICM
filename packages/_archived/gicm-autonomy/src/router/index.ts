/**
 * Decision Router
 *
 * Routes actions to auto-execute, queue, or escalate based on boundaries.
 */

import { EventEmitter } from "eventemitter3";
import type { Action, Boundaries, DecisionRoute } from "../core/types.js";
import { RiskClassifier } from "./classifier.js";
import { BoundaryChecker } from "./boundaries.js";
import { EscalationManager } from "./escalation.js";
import { Logger } from "../utils/logger.js";

interface RouterEvents {
  "action:routed": (action: Action, route: DecisionRoute) => void;
  "action:auto_approved": (action: Action) => void;
  "action:queued": (action: Action, reason: string) => void;
  "action:escalated": (action: Action) => void;
}

export class DecisionRouter extends EventEmitter<RouterEvents> {
  private classifier: RiskClassifier;
  private boundaryChecker: BoundaryChecker;
  private escalation: EscalationManager;
  private logger: Logger;
  private boundaries: Boundaries;

  constructor(boundaries: Boundaries) {
    super();
    this.boundaries = boundaries;
    this.classifier = new RiskClassifier();
    this.boundaryChecker = new BoundaryChecker(boundaries);
    this.escalation = new EscalationManager();
    this.logger = new Logger("DecisionRouter");

    // Forward escalation events
    this.escalation.on("escalated", (action) => {
      this.emit("action:escalated", action);
    });
  }

  /**
   * Route an action to the appropriate handler
   */
  async route(action: Action): Promise<DecisionRoute> {
    this.logger.info("Routing action: " + action.type + " from " + action.engine);

    // 1. Assess risk
    const risk = await this.classifier.assess(action);
    action.risk = risk;

    // 2. Check boundaries
    const boundaryResult = this.boundaryChecker.check(action);

    // 3. Determine route
    let route: DecisionRoute;
    let reason = "";

    if (risk.level === "critical" || boundaryResult.violated) {
      route = "escalate";
      reason = boundaryResult.violations.join("; ") || "Critical risk level";
    } else if (risk.level === "high" || boundaryResult.needsReview) {
      route = "queue";
      reason = boundaryResult.warnings.join("; ") || "High risk requires review";
    } else if (risk.level === "safe" && boundaryResult.withinLimits) {
      route = "auto";
      reason = "Within safe boundaries";
    } else {
      route = "queue"; // Default to queue if uncertain
      reason = "Moderate risk - queued for review";
    }

    action.route = route;

    this.logger.info(
      "Action routed: " + route + " (risk: " + risk.level + ", score: " + risk.score + ")"
    );

    // 4. Handle based on route
    await this.handleRoute(action, route, reason);

    // 5. Emit event
    this.emit("action:routed", action, route);

    return route;
  }

  /**
   * Handle action based on route
   */
  private async handleRoute(
    action: Action,
    route: DecisionRoute,
    reason: string
  ): Promise<void> {
    switch (route) {
      case "auto":
        // Auto-approve
        this.logger.info("Auto-approved: " + action.type);
        action.status = "approved";
        action.approvedBy = "auto";
        action.approvedAt = Date.now();
        this.emit("action:auto_approved", action);
        break;

      case "queue":
        // Add to approval queue
        this.logger.info("Queued for review: " + action.type + " - " + reason);
        action.status = "pending";
        this.emit("action:queued", action, reason);
        break;

      case "escalate":
        // Notify human immediately
        this.logger.warn("Escalating: " + action.type + " - " + reason);
        action.status = "pending";
        await this.escalation.notify(action);
        break;
    }
  }

  /**
   * Record that an action was executed (updates daily limits)
   */
  recordExecution(action: Action): void {
    this.boundaryChecker.recordExecution(action);
  }

  /**
   * Update boundaries
   */
  updateBoundaries(newBoundaries: Boundaries): void {
    this.boundaries = newBoundaries;
    this.boundaryChecker.updateBoundaries(newBoundaries);
    this.logger.info("Boundaries updated");
  }

  /**
   * Get current boundaries
   */
  getBoundaries(): Boundaries {
    return this.boundaries;
  }

  /**
   * Get escalation manager (for handling escalations)
   */
  getEscalationManager(): EscalationManager {
    return this.escalation;
  }

  /**
   * Get boundary checker (for manual checks)
   */
  getBoundaryChecker(): BoundaryChecker {
    return this.boundaryChecker;
  }
}

// Re-exports
export { RiskClassifier } from "./classifier.js";
export { BoundaryChecker } from "./boundaries.js";
export { EscalationManager } from "./escalation.js";
