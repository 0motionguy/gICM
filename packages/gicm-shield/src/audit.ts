/**
 * Audit Logger for @gicm/shield
 * Event logging with circular buffer
 */

import { EventEmitter } from "events";
import type { AuditEvent, AuditConfig } from "./types.js";

// ============================================================================
// AuditLogger Class
// ============================================================================

export class AuditLogger extends EventEmitter {
  private events: AuditEvent[] = [];
  private readonly config: Required<AuditConfig>;

  constructor(config?: Partial<AuditConfig>) {
    super();
    this.config = {
      maxEvents: config?.maxEvents ?? 10000,
      enableConsole: config?.enableConsole ?? false,
    };
  }

  log(event: Omit<AuditEvent, "timestamp">): void {
    const fullEvent: AuditEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Add to circular buffer
    this.events.push(fullEvent);
    if (this.events.length > this.config.maxEvents) {
      this.events.shift(); // Remove oldest
    }

    // Console logging if enabled
    if (this.config.enableConsole) {
      console.log(
        `[AUDIT] ${fullEvent.timestamp.toISOString()} - ${fullEvent.action} - ${fullEvent.result}`,
        fullEvent.actor ? `by ${fullEvent.actor}` : "",
        fullEvent.resource ? `on ${fullEvent.resource}` : ""
      );
    }

    // Emit event
    this.emit("audit:event", fullEvent);
  }

  getEvents(filter?: {
    action?: string;
    actor?: string;
    resource?: string;
    result?: "success" | "failure" | "blocked";
    since?: Date;
  }): AuditEvent[] {
    let filtered = this.events;

    if (filter) {
      filtered = filtered.filter((event) => {
        if (filter.action && event.action !== filter.action) return false;
        if (filter.actor && event.actor !== filter.actor) return false;
        if (filter.resource && event.resource !== filter.resource) return false;
        if (filter.result && event.result !== filter.result) return false;
        if (filter.since && event.timestamp < filter.since) return false;
        return true;
      });
    }

    return filtered;
  }

  getStats(): {
    totalEvents: number;
    successCount: number;
    failureCount: number;
    blockedCount: number;
    uniqueActors: number;
    uniqueActions: number;
  } {
    const actors = new Set<string>();
    const actions = new Set<string>();
    let successCount = 0;
    let failureCount = 0;
    let blockedCount = 0;

    for (const event of this.events) {
      if (event.actor) actors.add(event.actor);
      actions.add(event.action);

      switch (event.result) {
        case "success":
          successCount++;
          break;
        case "failure":
          failureCount++;
          break;
        case "blocked":
          blockedCount++;
          break;
      }
    }

    return {
      totalEvents: this.events.length,
      successCount,
      failureCount,
      blockedCount,
      uniqueActors: actors.size,
      uniqueActions: actions.size,
    };
  }

  clear(): void {
    this.events = [];
  }

  export(): AuditEvent[] {
    return [...this.events];
  }

  // Convenience methods for common audit events
  logAuth(
    actor: string,
    result: "success" | "failure",
    metadata?: Record<string, unknown>
  ): void {
    this.log({
      action: "auth.login",
      actor,
      result,
      metadata,
    });
  }

  logRateLimit(actor: string, resource: string, blocked: boolean): void {
    this.log({
      action: "rateLimit.check",
      actor,
      resource,
      result: blocked ? "blocked" : "success",
    });
  }

  logSecretAccess(actor: string, resource: string, found: boolean): void {
    this.log({
      action: "secret.accessed",
      actor,
      resource,
      result: found ? "success" : "failure",
    });
  }

  logInputGuard(actor: string, blocked: boolean, threats: string[]): void {
    this.log({
      action: "inputGuard.check",
      actor,
      result: blocked ? "blocked" : "success",
      metadata: { threats },
    });
  }
}
