/**
 * Notification System
 *
 * Alerts human for escalations and batch reviews.
 */

import { EventEmitter } from "eventemitter3";
import type { Action, BatchApproval } from "../core/types.js";
import { Logger } from "../utils/logger.js";

export interface NotificationConfig {
  telegram?: {
    botToken: string;
    chatId: string;
  };
  discord?: {
    webhookUrl: string;
  };
  email?: {
    to: string;
  };
}

interface NotificationEvents {
  sent: (channel: string, type: string) => void;
  failed: (channel: string, error: Error) => void;
}

export class NotificationManager extends EventEmitter<NotificationEvents> {
  private config: NotificationConfig;
  private logger: Logger;

  constructor(config: NotificationConfig = {}) {
    super();
    this.config = config;
    this.logger = new Logger("Notifications");
  }

  /**
   * Update configuration
   */
  setConfig(config: NotificationConfig): void {
    this.config = config;
  }

  /**
   * Send escalation alert (immediate)
   */
  async escalate(action: Action): Promise<void> {
    const message = this.formatEscalation(action);
    await this.sendAll(message, "ESCALATION");
    this.logger.warn("Escalation sent: " + action.type);
  }

  /**
   * Send batch review notification
   */
  async notifyBatchReady(batch: BatchApproval): Promise<void> {
    const message = this.formatBatch(batch);
    await this.sendAll(message, "BATCH REVIEW");
    this.logger.info("Batch notification sent: " + batch.totalActions + " items");
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(summary: {
    autoExecuted: number;
    queued: number;
    escalated: number;
    costIncurred: number;
    revenueGenerated: number;
  }): Promise<void> {
    const message = [
      "Daily Autonomy Summary",
      "",
      "Auto-executed: " + summary.autoExecuted + " actions",
      "Queued for review: " + summary.queued,
      "Escalated: " + summary.escalated,
      "",
      "Cost: $" + summary.costIncurred.toFixed(2),
      "Revenue: $" + summary.revenueGenerated.toFixed(2),
    ].join("\n");

    await this.sendAll(message, "DAILY SUMMARY");
  }

  /**
   * Format escalation message
   */
  private formatEscalation(action: Action): string {
    const lines = [
      "Action Requires Immediate Review",
      "",
      "Type: " + action.type,
      "Engine: " + action.engine,
      "Risk Level: " + action.risk.level.toUpperCase(),
      "Risk Score: " + action.risk.score + "/100",
      "",
      "Est. Cost: $" + action.risk.estimatedCost,
      "Reversible: " + (action.risk.reversible ? "Yes" : "NO"),
      "",
      "Description:",
      action.description,
      "",
      "Risk Factors:",
    ];

    for (const factor of action.risk.factors) {
      lines.push("  - " + factor.name + ": " + (factor.exceeded ? "EXCEEDED" : "OK"));
    }

    lines.push("");
    lines.push("Reply with APPROVE or REJECT");

    return lines.join("\n");
  }

  /**
   * Format batch message
   */
  private formatBatch(batch: BatchApproval): string {
    const lines = [
      batch.totalActions + " Actions Pending Review",
      "",
      "By Engine:",
    ];

    for (const [engine, count] of Object.entries(batch.byEngine)) {
      lines.push("  " + engine + ": " + count);
    }

    lines.push("");
    lines.push("By Risk:");

    for (const [risk, count] of Object.entries(batch.byRisk)) {
      if (count > 0) {
        lines.push("  " + risk + ": " + count);
      }
    }

    lines.push("");
    lines.push("Total Est. Cost: $" + batch.estimatedTotalCost.toFixed(2));
    lines.push("");
    lines.push("Review at: [Dashboard]");

    return lines.join("\n");
  }

  /**
   * Send to all configured channels
   */
  private async sendAll(message: string, title: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.config.telegram) {
      promises.push(this.sendTelegram(message, title));
    }
    if (this.config.discord) {
      promises.push(this.sendDiscord(message, title));
    }

    // Log if no channels configured
    if (promises.length === 0) {
      this.logger.info("[" + title + "] " + message.split("\n")[0]);
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send via Telegram
   */
  private async sendTelegram(message: string, title: string): Promise<void> {
    if (!this.config.telegram) return;

    const { botToken, chatId } = this.config.telegram;
    const url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: title + "\n\n" + message,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        throw new Error("Telegram API error: " + response.status);
      }

      this.emit("sent", "telegram", title);
    } catch (error) {
      this.logger.error("Telegram send failed: " + (error as Error).message);
      this.emit("failed", "telegram", error as Error);
    }
  }

  /**
   * Send via Discord webhook
   */
  private async sendDiscord(message: string, title: string): Promise<void> {
    if (!this.config.discord) return;

    try {
      const response = await fetch(this.config.discord.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title,
              description: message,
              color: title.includes("ESCALATION") ? 0xff0000 : 0x00ff00,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Discord webhook error: " + response.status);
      }

      this.emit("sent", "discord", title);
    } catch (error) {
      this.logger.error("Discord send failed: " + (error as Error).message);
      this.emit("failed", "discord", error as Error);
    }
  }
}
