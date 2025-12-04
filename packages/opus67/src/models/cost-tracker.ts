/**
 * OPUS 67 Cost Tracker
 * Session-level cost tracking with budgets and alerts
 */

import { EventEmitter } from 'eventemitter3';
import { tokenTracker, type ModelName, type TokenUsage } from '../benchmark/token-tracker.js';
import { MODELS } from './config.js';

export interface CostEntry {
  id: string;
  timestamp: Date;
  model: ModelName;
  tier: 'free' | 'cheap' | 'quality';
  usage: TokenUsage;
  cost: number;
  operation: string;
  agentId?: string;
}

export interface CostBudget {
  daily: number;
  session: number;
  perOperation: number;
}

export interface CostAlert {
  type: 'warning' | 'exceeded';
  budget: keyof CostBudget;
  current: number;
  limit: number;
  message: string;
  timestamp: Date;
}

export interface CostSummary {
  today: number;
  session: number;
  allTime: number;
  byTier: Record<'free' | 'cheap' | 'quality', number>;
  byModel: Record<string, number>;
  byOperation: Record<string, number>;
  savingsVsClaude: number;
  avgCostPerOp: number;
  operationCount: number;
}

interface CostTrackerEvents {
  'cost:recorded': (entry: CostEntry) => void;
  'alert:triggered': (alert: CostAlert) => void;
  'budget:updated': (budget: CostBudget) => void;
}

/**
 * CostTracker - Session cost management
 */
export class CostTracker extends EventEmitter<CostTrackerEvents> {
  private entries: CostEntry[] = [];
  private sessionStart: Date;
  private budget: CostBudget;
  private alerts: CostAlert[] = [];

  constructor(budget?: Partial<CostBudget>) {
    super();
    this.sessionStart = new Date();
    this.budget = {
      daily: budget?.daily ?? 10.00,     // $10/day default
      session: budget?.session ?? 5.00,   // $5/session default
      perOperation: budget?.perOperation ?? 0.50  // $0.50/op default
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `cost_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Record a cost entry
   */
  record(
    model: ModelName,
    usage: TokenUsage,
    operation: string,
    agentId?: string
  ): CostEntry {
    const config = MODELS[model];
    const tier = config?.tier || 'quality';
    const cost = tokenTracker.calculateCost(model, usage);

    const entry: CostEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      model,
      tier,
      usage,
      cost,
      operation,
      agentId
    };

    this.entries.push(entry);
    this.emit('cost:recorded', entry);

    // Also record in token tracker
    if (agentId) {
      tokenTracker.record(agentId, operation, model, usage);
    }

    // Check budgets
    this.checkBudgets(cost);

    return entry;
  }

  /**
   * Check all budgets
   */
  private checkBudgets(newCost: number): void {
    const summary = this.getSummary();

    // Check session budget
    if (summary.session >= this.budget.session) {
      this.triggerAlert('exceeded', 'session', summary.session, this.budget.session);
    } else if (summary.session >= this.budget.session * 0.8) {
      this.triggerAlert('warning', 'session', summary.session, this.budget.session);
    }

    // Check daily budget
    if (summary.today >= this.budget.daily) {
      this.triggerAlert('exceeded', 'daily', summary.today, this.budget.daily);
    } else if (summary.today >= this.budget.daily * 0.8) {
      this.triggerAlert('warning', 'daily', summary.today, this.budget.daily);
    }

    // Check per-operation budget
    if (newCost > this.budget.perOperation) {
      this.triggerAlert('exceeded', 'perOperation', newCost, this.budget.perOperation);
    }
  }

  /**
   * Trigger a budget alert
   */
  private triggerAlert(
    type: 'warning' | 'exceeded',
    budget: keyof CostBudget,
    current: number,
    limit: number
  ): void {
    const message = type === 'exceeded'
      ? `${budget} budget exceeded: $${current.toFixed(4)} / $${limit.toFixed(2)}`
      : `${budget} budget warning: $${current.toFixed(4)} / $${limit.toFixed(2)} (${((current/limit) * 100).toFixed(0)}%)`;

    const alert: CostAlert = {
      type,
      budget,
      current,
      limit,
      message,
      timestamp: new Date()
    };

    this.alerts.push(alert);
    this.emit('alert:triggered', alert);
  }

  /**
   * Get cost summary
   */
  getSummary(): CostSummary {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let today = 0;
    let session = 0;
    let allTime = 0;
    const byTier: Record<'free' | 'cheap' | 'quality', number> = { free: 0, cheap: 0, quality: 0 };
    const byModel: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    let claudeOnlyCost = 0;

    for (const entry of this.entries) {
      allTime += entry.cost;

      if (entry.timestamp >= this.sessionStart) {
        session += entry.cost;
      }

      if (entry.timestamp >= todayStart) {
        today += entry.cost;
      }

      byTier[entry.tier] += entry.cost;
      byModel[entry.model] = (byModel[entry.model] || 0) + entry.cost;
      byOperation[entry.operation] = (byOperation[entry.operation] || 0) + entry.cost;

      // Calculate Claude-only equivalent
      claudeOnlyCost += tokenTracker.calculateCost('claude-sonnet-4', entry.usage);
    }

    return {
      today,
      session,
      allTime,
      byTier,
      byModel,
      byOperation,
      savingsVsClaude: claudeOnlyCost - allTime,
      avgCostPerOp: this.entries.length > 0 ? allTime / this.entries.length : 0,
      operationCount: this.entries.length
    };
  }

  /**
   * Set budget
   */
  setBudget(budget: Partial<CostBudget>): void {
    this.budget = { ...this.budget, ...budget };
    this.emit('budget:updated', this.budget);
  }

  /**
   * Get current budget
   */
  getBudget(): CostBudget {
    return { ...this.budget };
  }

  /**
   * Get budget status
   */
  getBudgetStatus(): Record<keyof CostBudget, { spent: number; limit: number; remaining: number; pct: number }> {
    const summary = this.getSummary();

    return {
      daily: {
        spent: summary.today,
        limit: this.budget.daily,
        remaining: Math.max(0, this.budget.daily - summary.today),
        pct: (summary.today / this.budget.daily) * 100
      },
      session: {
        spent: summary.session,
        limit: this.budget.session,
        remaining: Math.max(0, this.budget.session - summary.session),
        pct: (summary.session / this.budget.session) * 100
      },
      perOperation: {
        spent: summary.avgCostPerOp,
        limit: this.budget.perOperation,
        remaining: Math.max(0, this.budget.perOperation - summary.avgCostPerOp),
        pct: (summary.avgCostPerOp / this.budget.perOperation) * 100
      }
    };
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 10): CostAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.sessionStart = new Date();
  }

  /**
   * Get entries for export
   */
  getEntries(since?: Date): CostEntry[] {
    if (!since) return [...this.entries];
    return this.entries.filter(e => e.timestamp >= since);
  }

  /**
   * Calculate projected costs
   */
  getProjections(): { hourly: number; daily: number; monthly: number } {
    const summary = this.getSummary();
    const sessionDuration = (Date.now() - this.sessionStart.getTime()) / 1000 / 60 / 60; // hours

    if (sessionDuration < 0.1 || summary.session === 0) {
      return { hourly: 0, daily: 0, monthly: 0 };
    }

    const hourlyRate = summary.session / sessionDuration;

    return {
      hourly: hourlyRate,
      daily: hourlyRate * 24,
      monthly: hourlyRate * 24 * 30
    };
  }

  /**
   * Format cost report
   */
  formatReport(): string {
    const summary = this.getSummary();
    const budget = this.getBudgetStatus();
    const projections = this.getProjections();

    return `
┌─ COST TRACKER REPORT ───────────────────────────────────────────┐
│                                                                  │
│  SESSION COSTS                                                   │
│  ────────────────────────────────────────────────────────────    │
│  Today:    $${summary.today.toFixed(4).padEnd(12)} (${budget.daily.pct.toFixed(1)}% of daily budget)     │
│  Session:  $${summary.session.toFixed(4).padEnd(12)} (${budget.session.pct.toFixed(1)}% of session budget)  │
│  All Time: $${summary.allTime.toFixed(4).padEnd(12)}                               │
│                                                                  │
│  BY TIER                                                         │
│  ────────────────────────────────────────────────────────────    │
│  FREE (Gemini):    $${summary.byTier.free.toFixed(4).padEnd(12)} ✓ No cost              │
│  CHEAP (DeepSeek): $${summary.byTier.cheap.toFixed(4).padEnd(12)}                       │
│  QUALITY (Claude): $${summary.byTier.quality.toFixed(4).padEnd(12)}                       │
│                                                                  │
│  SAVINGS                                                         │
│  ────────────────────────────────────────────────────────────    │
│  vs Claude-only: $${summary.savingsVsClaude.toFixed(4)} saved                         │
│  Avg per operation: $${summary.avgCostPerOp.toFixed(4)}                              │
│  Operations: ${summary.operationCount}                                               │
│                                                                  │
│  PROJECTIONS                                                     │
│  ────────────────────────────────────────────────────────────    │
│  Hourly:  $${projections.hourly.toFixed(4).padEnd(12)}                               │
│  Daily:   $${projections.daily.toFixed(4).padEnd(12)}                               │
│  Monthly: $${projections.monthly.toFixed(2).padEnd(12)}                               │
│                                                                  │
│  BUDGET STATUS                                                   │
│  ────────────────────────────────────────────────────────────    │
│  Daily:   ${budget.daily.pct >= 100 ? '⚠️  EXCEEDED' : budget.daily.pct >= 80 ? '⚠️  WARNING' : '✓  OK'} (${budget.daily.pct.toFixed(1)}%) $${budget.daily.remaining.toFixed(2)} remaining       │
│  Session: ${budget.session.pct >= 100 ? '⚠️  EXCEEDED' : budget.session.pct >= 80 ? '⚠️  WARNING' : '✓  OK'} (${budget.session.pct.toFixed(1)}%) $${budget.session.remaining.toFixed(2)} remaining       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// Export singleton
export const costTracker = new CostTracker();
