/**
 * Approval Queue
 *
 * Manages pending approvals and batch review.
 */

import { EventEmitter } from "eventemitter3";
import type { Action, ApprovalItem, BatchApproval, RiskLevel } from "../core/types.js";
import { Logger } from "../utils/logger.js";

interface QueueEvents {
  item_added: (item: ApprovalItem) => void;
  item_approved: (item: ApprovalItem) => void;
  item_rejected: (item: ApprovalItem) => void;
  batch_ready: (batch: BatchApproval) => void;
}

export class ApprovalQueue extends EventEmitter<QueueEvents> {
  private queue: Map<string, ApprovalItem> = new Map();
  private logger: Logger;
  private batchInterval: number = 4 * 60 * 60 * 1000; // 4 hours
  private batchTimer?: NodeJS.Timeout;

  constructor() {
    super();
    this.logger = new Logger("ApprovalQueue");
  }

  /**
   * Start batch timer
   */
  startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      const stats = this.getStats();
      if (stats.pending > 0) {
        const batch = this.getBatch();
        this.emit("batch_ready", batch);
      }
    }, this.batchInterval);
  }

  /**
   * Stop batch timer
   */
  stopBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Add action to approval queue
   */
  add(action: Action, reason: string): ApprovalItem {
    const item: ApprovalItem = {
      action,
      reason,
      recommendation: this.generateRecommendation(action),
      confidence: this.calculateConfidence(action),
      relatedActions: [],
      urgency: this.determineUrgency(action),
      status: "pending",
    };

    // Set expiry for time-sensitive items
    if (item.urgency === "critical") {
      item.expiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    } else if (item.urgency === "high") {
      item.expiresAt = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
    }

    this.queue.set(action.id, item);
    this.logger.info("Added to queue: " + action.type + " (" + item.urgency + ")");
    this.emit("item_added", item);

    return item;
  }

  /**
   * Approve an item
   */
  approve(actionId: string, feedback?: string): boolean {
    const item = this.queue.get(actionId);
    if (!item) return false;

    item.status = "approved";
    item.reviewedAt = Date.now();
    item.reviewedBy = "human";
    item.feedback = feedback;
    item.action.status = "approved";
    item.action.approvedBy = "human";
    item.action.approvedAt = Date.now();

    this.logger.info("Approved: " + item.action.type);
    this.emit("item_approved", item);

    return true;
  }

  /**
   * Reject an item
   */
  reject(actionId: string, feedback?: string): boolean {
    const item = this.queue.get(actionId);
    if (!item) return false;

    item.status = "rejected";
    item.reviewedAt = Date.now();
    item.reviewedBy = "human";
    item.feedback = feedback;
    item.action.status = "rejected";

    this.logger.info("Rejected: " + item.action.type);
    this.emit("item_rejected", item);

    return true;
  }

  /**
   * Get a specific item
   */
  get(actionId: string): ApprovalItem | undefined {
    return this.queue.get(actionId);
  }

  /**
   * Get all pending items
   */
  getPending(): ApprovalItem[] {
    return Array.from(this.queue.values()).filter((i) => i.status === "pending");
  }

  /**
   * Get pending items for batch review
   */
  getBatch(): BatchApproval {
    const items = this.getPending();

    const byEngine: Record<string, number> = {};
    const byRisk: Record<RiskLevel, number> = { safe: 0, moderate: 0, high: 0, critical: 0 };
    let totalCost = 0;

    for (const item of items) {
      byEngine[item.action.engine] = (byEngine[item.action.engine] || 0) + 1;
      byRisk[item.action.risk.level]++;
      totalCost += item.action.risk.estimatedCost;
    }

    const self = this;
    return {
      id: "batch-" + Date.now(),
      items,
      totalActions: items.length,
      byEngine,
      byRisk,
      estimatedTotalCost: totalCost,
      approveAll: async () => {
        for (const item of items) {
          self.approve(item.action.id);
        }
      },
      rejectAll: async () => {
        for (const item of items) {
          self.reject(item.action.id);
        }
      },
      approveSelected: async (ids: string[]) => {
        for (const id of ids) {
          self.approve(id);
        }
      },
    };
  }

  /**
   * Get queue stats
   */
  getStats(): {
    pending: number;
    approved: number;
    rejected: number;
    byUrgency: Record<string, number>;
  } {
    const items = Array.from(this.queue.values());
    const byUrgency: Record<string, number> = {};

    for (const item of items) {
      if (item.status === "pending") {
        byUrgency[item.urgency] = (byUrgency[item.urgency] || 0) + 1;
      }
    }

    return {
      pending: items.filter((i) => i.status === "pending").length,
      approved: items.filter((i) => i.status === "approved").length,
      rejected: items.filter((i) => i.status === "rejected").length,
      byUrgency,
    };
  }

  /**
   * Clear processed items
   */
  clearProcessed(): void {
    for (const [id, item] of this.queue) {
      if (item.status !== "pending") {
        this.queue.delete(id);
      }
    }
  }

  private generateRecommendation(action: Action): ApprovalItem["recommendation"] {
    if (action.risk.score < 30) return "approve";
    if (action.risk.score > 70) return "reject";
    return "modify";
  }

  private calculateConfidence(action: Action): number {
    const wellKnown = ["dca_buy", "blog_generate", "tweet_post"];
    if (wellKnown.some((w) => action.type.includes(w))) {
      return 85;
    }
    return 60;
  }

  private determineUrgency(action: Action): ApprovalItem["urgency"] {
    if (action.risk.level === "critical") return "critical";
    if (action.type.includes("trade") || action.type.includes("alert")) return "high";
    if (action.type.includes("deploy")) return "medium";
    return "low";
  }
}
