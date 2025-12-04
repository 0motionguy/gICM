/**
 * OPUS 67 Token Tracker
 * Per-agent and per-model token usage tracking with cost calculation
 */

import { EventEmitter } from 'eventemitter3';

// Model cost rates (per 1M tokens)
export const MODEL_COSTS = {
  // Gemini - FREE tier
  'gemini-2.0-flash': { input: 0, output: 0 },
  'gemini-2.0-flash-thinking': { input: 0, output: 0 },
  'gemini-1.5-flash': { input: 0, output: 0 },
  'gemini-1.5-pro': { input: 0, output: 0 },

  // DeepSeek - CHEAP
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-coder': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },

  // Claude - QUALITY
  'claude-sonnet-4': { input: 3, output: 15 },
  'claude-opus-4': { input: 15, output: 75 },
  'claude-haiku-3.5': { input: 0.8, output: 4 },

  // OpenAI (fallback)
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
} as const;

export type ModelName = keyof typeof MODEL_COSTS;

export interface TokenUsage {
  input: number;
  output: number;
  cached?: number;
}

export interface AgentTokenRecord {
  agentId: string;
  agentType: string;
  model: ModelName;
  usage: TokenUsage;
  cost: number;
  timestamp: Date;
}

export interface SessionTokenSummary {
  totalInput: number;
  totalOutput: number;
  totalCached: number;
  totalCost: number;
  byModel: Map<ModelName, { usage: TokenUsage; cost: number }>;
  byAgent: Map<string, { usage: TokenUsage; cost: number; calls: number }>;
  byAgentType: Map<string, { usage: TokenUsage; cost: number; calls: number }>;
}

interface TrackerEvents {
  'usage:recorded': (record: AgentTokenRecord) => void;
  'budget:warning': (current: number, budget: number) => void;
  'budget:exceeded': (current: number, budget: number) => void;
}

/**
 * TokenTracker - Granular token usage tracking
 */
export class TokenTracker extends EventEmitter<TrackerEvents> {
  private records: AgentTokenRecord[] = [];
  private budget: number | null = null;
  private budgetWarningThreshold = 0.8; // Warn at 80%

  constructor(budget?: number) {
    super();
    if (budget) this.budget = budget;
  }

  /**
   * Calculate cost for token usage
   */
  calculateCost(model: ModelName, usage: TokenUsage): number {
    const rates = MODEL_COSTS[model] || MODEL_COSTS['claude-sonnet-4'];

    // Cached tokens are free
    const inputTokens = usage.input - (usage.cached || 0);

    return (
      (inputTokens / 1_000_000) * rates.input +
      (usage.output / 1_000_000) * rates.output
    );
  }

  /**
   * Record token usage for an agent
   */
  record(
    agentId: string,
    agentType: string,
    model: ModelName,
    usage: TokenUsage
  ): AgentTokenRecord {
    const cost = this.calculateCost(model, usage);

    const record: AgentTokenRecord = {
      agentId,
      agentType,
      model,
      usage,
      cost,
      timestamp: new Date()
    };

    this.records.push(record);
    this.emit('usage:recorded', record);

    // Check budget
    if (this.budget) {
      const totalCost = this.getTotalCost();
      if (totalCost >= this.budget) {
        this.emit('budget:exceeded', totalCost, this.budget);
      } else if (totalCost >= this.budget * this.budgetWarningThreshold) {
        this.emit('budget:warning', totalCost, this.budget);
      }
    }

    return record;
  }

  /**
   * Get total cost
   */
  getTotalCost(): number {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get session summary
   */
  getSummary(): SessionTokenSummary {
    const summary: SessionTokenSummary = {
      totalInput: 0,
      totalOutput: 0,
      totalCached: 0,
      totalCost: 0,
      byModel: new Map(),
      byAgent: new Map(),
      byAgentType: new Map()
    };

    for (const record of this.records) {
      // Totals
      summary.totalInput += record.usage.input;
      summary.totalOutput += record.usage.output;
      summary.totalCached += record.usage.cached || 0;
      summary.totalCost += record.cost;

      // By model
      const modelData = summary.byModel.get(record.model) || {
        usage: { input: 0, output: 0, cached: 0 },
        cost: 0
      };
      modelData.usage.input += record.usage.input;
      modelData.usage.output += record.usage.output;
      modelData.usage.cached = (modelData.usage.cached || 0) + (record.usage.cached || 0);
      modelData.cost += record.cost;
      summary.byModel.set(record.model, modelData);

      // By agent
      const agentData = summary.byAgent.get(record.agentId) || {
        usage: { input: 0, output: 0, cached: 0 },
        cost: 0,
        calls: 0
      };
      agentData.usage.input += record.usage.input;
      agentData.usage.output += record.usage.output;
      agentData.usage.cached = (agentData.usage.cached || 0) + (record.usage.cached || 0);
      agentData.cost += record.cost;
      agentData.calls++;
      summary.byAgent.set(record.agentId, agentData);

      // By agent type
      const typeData = summary.byAgentType.get(record.agentType) || {
        usage: { input: 0, output: 0, cached: 0 },
        cost: 0,
        calls: 0
      };
      typeData.usage.input += record.usage.input;
      typeData.usage.output += record.usage.output;
      typeData.usage.cached = (typeData.usage.cached || 0) + (record.usage.cached || 0);
      typeData.cost += record.cost;
      typeData.calls++;
      summary.byAgentType.set(record.agentType, typeData);
    }

    return summary;
  }

  /**
   * Get cost savings from using cheaper models
   */
  getCostSavings(): { saved: number; pctSaved: number; breakdown: Record<string, number> } {
    let actualCost = 0;
    let claudeOnlyCost = 0;
    const breakdown: Record<string, number> = {};

    for (const record of this.records) {
      actualCost += record.cost;

      // Calculate what it would cost with Claude Sonnet 4
      const claudeCost = this.calculateCost('claude-sonnet-4', record.usage);
      claudeOnlyCost += claudeCost;

      const saved = claudeCost - record.cost;
      if (saved > 0) {
        breakdown[record.model] = (breakdown[record.model] || 0) + saved;
      }
    }

    const totalSaved = claudeOnlyCost - actualCost;
    const pctSaved = claudeOnlyCost > 0 ? (totalSaved / claudeOnlyCost) * 100 : 0;

    return {
      saved: totalSaved,
      pctSaved,
      breakdown
    };
  }

  /**
   * Get records for a specific agent
   */
  getAgentRecords(agentId: string): AgentTokenRecord[] {
    return this.records.filter(r => r.agentId === agentId);
  }

  /**
   * Get records for a specific model
   */
  getModelRecords(model: ModelName): AgentTokenRecord[] {
    return this.records.filter(r => r.model === model);
  }

  /**
   * Set budget
   */
  setBudget(amount: number, warningThreshold = 0.8): void {
    this.budget = amount;
    this.budgetWarningThreshold = warningThreshold;
  }

  /**
   * Get budget status
   */
  getBudgetStatus(): { budget: number | null; spent: number; remaining: number; pctUsed: number } {
    const spent = this.getTotalCost();
    return {
      budget: this.budget,
      spent,
      remaining: this.budget ? Math.max(0, this.budget - spent) : Infinity,
      pctUsed: this.budget ? (spent / this.budget) * 100 : 0
    };
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.records = [];
  }

  /**
   * Export records as JSON
   */
  export(): string {
    return JSON.stringify({
      summary: this.getSummary(),
      savings: this.getCostSavings(),
      budget: this.getBudgetStatus(),
      records: this.records
    }, (key, value) => {
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }, 2);
  }

  /**
   * Format summary for display
   */
  formatSummary(): string {
    const s = this.getSummary();
    const savings = this.getCostSavings();
    const budget = this.getBudgetStatus();

    let output = `
┌─ TOKEN USAGE SUMMARY ───────────────────────────────────────────┐
│                                                                  │
│  TOTALS                                                          │
│  ────────────────────────────────────────────────────────────    │
│  Input:   ${String(s.totalInput).padEnd(12)} tokens                           │
│  Output:  ${String(s.totalOutput).padEnd(12)} tokens                           │
│  Cached:  ${String(s.totalCached).padEnd(12)} tokens (FREE)                    │
│  Cost:    $${s.totalCost.toFixed(4).padEnd(11)}                                │
│                                                                  │
│  BY MODEL                                                        │
│  ────────────────────────────────────────────────────────────    │`;

    for (const [model, data] of s.byModel) {
      output += `
│  ${model.padEnd(24)} ${String(data.usage.input + data.usage.output).padEnd(10)} $${data.cost.toFixed(4).padEnd(8)} │`;
    }

    output += `
│                                                                  │
│  COST SAVINGS                                                    │
│  ────────────────────────────────────────────────────────────    │
│  vs Claude-only: $${savings.saved.toFixed(4)} saved (${savings.pctSaved.toFixed(1)}%)                    │`;

    if (budget.budget) {
      output += `
│                                                                  │
│  BUDGET                                                          │
│  ────────────────────────────────────────────────────────────    │
│  Limit: $${budget.budget.toFixed(2)}   Spent: $${budget.spent.toFixed(4)}   Remaining: $${budget.remaining.toFixed(4)}  │
│  ${budget.pctUsed >= 100 ? '⚠️  EXCEEDED' : budget.pctUsed >= 80 ? '⚠️  WARNING' : '✓  OK'} (${budget.pctUsed.toFixed(1)}% used)                                       │`;
    }

    output += `
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;

    return output;
  }
}

// Export singleton
export const tokenTracker = new TokenTracker();
