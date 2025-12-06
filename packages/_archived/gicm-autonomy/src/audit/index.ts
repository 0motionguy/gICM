/**
 * Audit Trail
 *
 * Logs all autonomous actions for review and learning.
 */

import type { Action, AuditEntry, DecisionRoute } from "../core/types.js";
import { Logger } from "../utils/logger.js";

export class AuditLogger {
  private entries: AuditEntry[] = [];
  private logger: Logger;
  private maxEntries = 10000;

  constructor() {
    this.logger = new Logger("Audit");
  }

  /**
   * Log an action
   */
  log(
    action: Action,
    outcome: "success" | "failed" | "rolled_back",
    costIncurred = 0,
    revenueGenerated = 0
  ): AuditEntry {
    const entry: AuditEntry = {
      id: "audit-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      timestamp: Date.now(),
      actionId: action.id,
      actionType: action.type,
      engine: action.engine,
      route: action.route,
      approvedBy: action.approvedBy || "auto",
      status: outcome,
      result: action.result,
      error: action.error,
      costIncurred,
      revenueGenerated,
    };

    this.entries.push(entry);

    // Cleanup old entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    this.logger.debug("Logged: " + action.type + " -> " + outcome);

    return entry;
  }

  /**
   * Add human feedback to an entry
   */
  addFeedback(entryId: string, wasGoodDecision: boolean, notes?: string): void {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) {
      entry.wasGoodDecision = wasGoodDecision;
      entry.notes = notes;
    }
  }

  /**
   * Get entries for time range
   */
  getEntries(options: {
    since?: number;
    until?: number;
    engine?: string;
    route?: DecisionRoute;
    status?: AuditEntry["status"];
    limit?: number;
  } = {}): AuditEntry[] {
    let filtered = this.entries;

    if (options.since) {
      filtered = filtered.filter((e) => e.timestamp >= options.since!);
    }
    if (options.until) {
      filtered = filtered.filter((e) => e.timestamp <= options.until!);
    }
    if (options.engine) {
      filtered = filtered.filter((e) => e.engine === options.engine);
    }
    if (options.route) {
      filtered = filtered.filter((e) => e.route === options.route);
    }
    if (options.status) {
      filtered = filtered.filter((e) => e.status === options.status);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Get summary statistics
   */
  getSummary(since?: number): {
    total: number;
    byRoute: Record<DecisionRoute, number>;
    byStatus: Record<string, number>;
    byEngine: Record<string, number>;
    totalCost: number;
    totalRevenue: number;
    successRate: number;
  } {
    let entries = this.entries;
    if (since) {
      entries = entries.filter((e) => e.timestamp >= since);
    }

    const byRoute: Record<DecisionRoute, number> = { auto: 0, queue: 0, escalate: 0 };
    const byStatus: Record<string, number> = {};
    const byEngine: Record<string, number> = {};
    let totalCost = 0;
    let totalRevenue = 0;
    let successes = 0;

    for (const entry of entries) {
      byRoute[entry.route]++;
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      byEngine[entry.engine] = (byEngine[entry.engine] || 0) + 1;
      totalCost += entry.costIncurred;
      totalRevenue += entry.revenueGenerated;

      if (entry.status === "success") {
        successes++;
      }
    }

    return {
      total: entries.length,
      byRoute,
      byStatus,
      byEngine,
      totalCost,
      totalRevenue,
      successRate: entries.length > 0 ? (successes / entries.length) * 100 : 0,
    };
  }

  /**
   * Get daily summary
   */
  getDailySummary(): {
    autoExecuted: number;
    queued: number;
    escalated: number;
    costIncurred: number;
    revenueGenerated: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const since = today.getTime();

    const summary = this.getSummary(since);

    return {
      autoExecuted: summary.byRoute.auto,
      queued: summary.byRoute.queue,
      escalated: summary.byRoute.escalate,
      costIncurred: summary.totalCost,
      revenueGenerated: summary.totalRevenue,
    };
  }

  /**
   * Export entries to JSON
   */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Import entries from JSON
   */
  import(json: string): void {
    const imported = JSON.parse(json) as AuditEntry[];
    this.entries = [...this.entries, ...imported];

    // Deduplicate by id
    const seen = new Set<string>();
    this.entries = this.entries.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }
}
