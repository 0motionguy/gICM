import { EventEmitter } from "node:events";
import { CostDatabase } from "./db.js";
import type {
  BudgetConfig,
  BudgetPeriod,
  BudgetStatus,
  CostEvent,
  GoldfishEvents,
  ThresholdLevel,
} from "./types.js";
import { BudgetConfigSchema } from "./types.js";

export interface BudgetManager {
  on<K extends keyof GoldfishEvents>(
    event: K,
    listener: GoldfishEvents[K]
  ): this;
  emit<K extends keyof GoldfishEvents>(
    event: K,
    ...args: Parameters<GoldfishEvents[K]>
  ): boolean;
}

export class BudgetManager extends EventEmitter {
  private config: BudgetConfig;
  private db: CostDatabase;
  private lastThresholds: Map<BudgetPeriod, ThresholdLevel | "ok"> = new Map();

  constructor(config: BudgetConfig, dbPath?: string) {
    super();
    this.config = BudgetConfigSchema.parse(config);
    this.db = new CostDatabase(dbPath);
  }

  recordCost(event: CostEvent): BudgetStatus {
    this.db.record(event);
    this.emit("cost:recorded", event);

    // Check all periods and emit threshold events
    const dailyStatus = this.getStatus("daily");
    const weeklyStatus = this.getStatus("weekly");
    const monthlyStatus = this.getStatus("monthly");

    this.checkAndEmitThreshold("daily", dailyStatus);
    this.checkAndEmitThreshold("weekly", weeklyStatus);
    this.checkAndEmitThreshold("monthly", monthlyStatus);

    return dailyStatus;
  }

  private checkAndEmitThreshold(
    period: BudgetPeriod,
    status: BudgetStatus
  ): void {
    const lastLevel = this.lastThresholds.get(period) || "ok";
    const currentLevel = status.level;

    if (lastLevel !== currentLevel) {
      this.lastThresholds.set(period, currentLevel);

      // Emit events for threshold crossings
      if (currentLevel === "soft") {
        this.emit("budget:soft", status);
      } else if (currentLevel === "throttle") {
        this.emit("budget:throttle", status);
      } else if (currentLevel === "hard") {
        this.emit("budget:hard", status);
      }
    }
  }

  getStatus(period?: BudgetPeriod): BudgetStatus {
    const targetPeriod = period || "daily";
    const { periodStart, periodEnd } = this.getPeriodBounds(targetPeriod);
    const limit = this.config[targetPeriod].amount;
    const spent = this.db.getSpend(targetPeriod, new Date(periodStart));
    const remaining = Math.max(0, limit - spent);
    const percentUsed = (spent / limit) * 100;
    const level = this.calculateLevel(percentUsed);

    return {
      period: targetPeriod,
      limit,
      spent,
      remaining,
      percentUsed,
      level,
      periodStart,
      periodEnd,
    };
  }

  private calculateLevel(percentUsed: number): ThresholdLevel | "ok" {
    const thresholds = this.config.thresholds;

    if (percentUsed >= thresholds.hard * 100) {
      return "hard";
    } else if (percentUsed >= thresholds.throttle * 100) {
      return "throttle";
    } else if (percentUsed >= thresholds.soft * 100) {
      return "soft";
    } else {
      return "ok";
    }
  }

  checkThreshold(period: BudgetPeriod): ThresholdLevel | "ok" {
    const status = this.getStatus(period);
    return status.level;
  }

  shouldThrottle(): boolean {
    const dailyLevel = this.checkThreshold("daily");
    return dailyLevel === "throttle" || dailyLevel === "hard";
  }

  shouldBlock(): boolean {
    const dailyLevel = this.checkThreshold("daily");
    return dailyLevel === "hard";
  }

  getReport(): {
    daily: BudgetStatus;
    weekly: BudgetStatus;
    monthly: BudgetStatus;
  } {
    return {
      daily: this.getStatus("daily"),
      weekly: this.getStatus("weekly"),
      monthly: this.getStatus("monthly"),
    };
  }

  resetPeriod(period: BudgetPeriod): void {
    // This doesn't delete historical data, just resets the tracking state
    this.lastThresholds.set(period, "ok");
  }

  private getPeriodBounds(period: BudgetPeriod): {
    periodStart: string;
    periodEnd: string;
  } {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (period === "daily") {
      const resetAt = this.config.daily.resetAt;
      const [hours, minutes] = resetAt.split(":").map(Number);

      periodStart = new Date(now);
      periodStart.setHours(hours, minutes, 0, 0);

      if (periodStart > now) {
        // Reset time hasn't occurred today, so period started yesterday
        periodStart.setDate(periodStart.getDate() - 1);
      }

      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 1);
    } else if (period === "weekly") {
      const resetDay = this.config.weekly.resetDay.toLowerCase();
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      const targetDay = dayMap[resetDay] || 1; // Default to Monday

      periodStart = new Date(now);
      const currentDay = periodStart.getDay();
      const daysBack =
        currentDay >= targetDay
          ? currentDay - targetDay
          : 7 - (targetDay - currentDay);

      periodStart.setDate(periodStart.getDate() - daysBack);
      periodStart.setHours(0, 0, 0, 0);

      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);
    } else {
      // monthly
      const resetDay = this.config.monthly.resetDay;

      periodStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        resetDay,
        0,
        0,
        0,
        0
      );

      if (periodStart > now) {
        // Reset day hasn't occurred this month, so period started last month
        periodStart.setMonth(periodStart.getMonth() - 1);
      }

      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
  }

  close(): void {
    this.db.close();
  }

  getDbPath(): string {
    return this.db.getPath();
  }
}

// Alias for convenience
export const Goldfish = BudgetManager;
