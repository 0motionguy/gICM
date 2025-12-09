import { EventEmitter } from 'eventemitter3';

// src/benchmark/metrics-collector.ts
var MetricsCollector = class extends EventEmitter {
  tokens;
  cost;
  latencySamples = [];
  throughput;
  quality;
  startTime;
  snapshots = [];
  currentConcurrency = 0;
  constructor() {
    super();
    this.startTime = Date.now();
    this.tokens = {
      input: 0,
      output: 0,
      perAgent: /* @__PURE__ */ new Map()
    };
    this.cost = {
      total: 0,
      byModel: /* @__PURE__ */ new Map(),
      perAgent: /* @__PURE__ */ new Map()
    };
    this.throughput = {
      agentsSpawned: 0,
      completed: 0,
      failed: 0,
      parallelEfficiency: 0,
      peakConcurrency: 0
    };
    this.quality = {
      success: 0,
      errors: 0,
      retries: 0,
      councilScores: []
    };
  }
  /**
   * Record token usage
   */
  recordTokens(input, output, agentId, model) {
    this.tokens.input += input;
    this.tokens.output += output;
    if (agentId) {
      const existing = this.tokens.perAgent.get(agentId) || { input: 0, output: 0 };
      this.tokens.perAgent.set(agentId, {
        input: existing.input + input,
        output: existing.output + output
      });
    }
    this.emit("metric:recorded", "tokens", input + output);
  }
  /**
   * Record cost
   */
  recordCost(amount, model, agentId) {
    this.cost.total += amount;
    const modelCost = this.cost.byModel.get(model) || 0;
    this.cost.byModel.set(model, modelCost + amount);
    if (agentId) {
      const agentCost = this.cost.perAgent.get(agentId) || 0;
      this.cost.perAgent.set(agentId, agentCost + amount);
    }
    this.emit("metric:recorded", "cost", amount);
  }
  /**
   * Record latency sample
   */
  recordLatency(ms, isFirstToken = false) {
    this.latencySamples.push(ms);
    this.emit("metric:recorded", "latency", ms);
  }
  /**
   * Record agent spawn
   */
  recordAgentSpawn() {
    this.throughput.agentsSpawned++;
    this.currentConcurrency++;
    if (this.currentConcurrency > this.throughput.peakConcurrency) {
      this.throughput.peakConcurrency = this.currentConcurrency;
    }
    this.emit("metric:recorded", "spawn", 1);
  }
  /**
   * Record agent completion
   */
  recordAgentComplete(success) {
    this.currentConcurrency = Math.max(0, this.currentConcurrency - 1);
    if (success) {
      this.throughput.completed++;
      this.quality.success++;
    } else {
      this.throughput.failed++;
      this.quality.errors++;
    }
    const totalTime = Date.now() - this.startTime;
    const theoreticalSequential = this.throughput.completed * this.getAverageLatency();
    this.throughput.parallelEfficiency = theoreticalSequential > 0 ? theoreticalSequential / totalTime : 0;
    this.emit("metric:recorded", success ? "complete" : "fail", 1);
  }
  /**
   * Record retry attempt
   */
  recordRetry() {
    this.quality.retries++;
    this.emit("metric:recorded", "retry", 1);
  }
  /**
   * Record council quality score
   */
  recordCouncilScore(score) {
    this.quality.councilScores.push(score);
    this.emit("metric:recorded", "council_score", score);
  }
  /**
   * Get average latency
   */
  getAverageLatency() {
    if (this.latencySamples.length === 0) return 0;
    return this.latencySamples.reduce((a, b) => a + b, 0) / this.latencySamples.length;
  }
  /**
   * Calculate percentile
   */
  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(p / 100 * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  /**
   * Get current metrics snapshot
   */
  getMetrics() {
    const councilAvg = this.quality.councilScores.length > 0 ? this.quality.councilScores.reduce((a, b) => a + b, 0) / this.quality.councilScores.length : null;
    const totalOps = this.quality.success + this.quality.errors;
    return {
      tokens: { ...this.tokens },
      cost: { ...this.cost },
      latency: {
        total: this.latencySamples.reduce((a, b) => a + b, 0),
        firstToken: this.latencySamples[0] || 0,
        samples: [...this.latencySamples],
        p50: this.percentile(this.latencySamples, 50),
        p95: this.percentile(this.latencySamples, 95),
        p99: this.percentile(this.latencySamples, 99)
      },
      throughput: { ...this.throughput },
      quality: {
        successRate: totalOps > 0 ? this.quality.success / totalOps : 0,
        errorRate: totalOps > 0 ? this.quality.errors / totalOps : 0,
        councilScore: councilAvg,
        retryCount: this.quality.retries
      },
      timestamp: /* @__PURE__ */ new Date(),
      duration: Date.now() - this.startTime
    };
  }
  /**
   * Create named snapshot
   */
  createSnapshot(name, metadata = {}) {
    const snapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      metrics: this.getMetrics(),
      metadata
    };
    this.snapshots.push(snapshot);
    this.emit("snapshot:created", snapshot);
    return snapshot;
  }
  /**
   * Get all snapshots
   */
  getSnapshots() {
    return [...this.snapshots];
  }
  /**
   * Compare two snapshots
   */
  compareSnapshots(snapshotA, snapshotB) {
    const a = this.snapshots.find((s) => s.id === snapshotA || s.name === snapshotA);
    const b = this.snapshots.find((s) => s.id === snapshotB || s.name === snapshotB);
    if (!a || !b) {
      throw new Error("Snapshot not found");
    }
    const compare = (va, vb) => ({
      a: va,
      b: vb,
      diff: vb - va,
      pctChange: va > 0 ? (vb - va) / va * 100 : 0
    });
    return {
      "tokens.input": compare(a.metrics.tokens.input, b.metrics.tokens.input),
      "tokens.output": compare(a.metrics.tokens.output, b.metrics.tokens.output),
      "cost.total": compare(a.metrics.cost.total, b.metrics.cost.total),
      "latency.p50": compare(a.metrics.latency.p50, b.metrics.latency.p50),
      "latency.p95": compare(a.metrics.latency.p95, b.metrics.latency.p95),
      "throughput.completed": compare(a.metrics.throughput.completed, b.metrics.throughput.completed),
      "throughput.parallelEfficiency": compare(a.metrics.throughput.parallelEfficiency, b.metrics.throughput.parallelEfficiency),
      "quality.successRate": compare(a.metrics.quality.successRate, b.metrics.quality.successRate),
      "duration": compare(a.metrics.duration, b.metrics.duration)
    };
  }
  /**
   * Reset all metrics
   */
  reset() {
    this.startTime = Date.now();
    this.tokens = { input: 0, output: 0, perAgent: /* @__PURE__ */ new Map() };
    this.cost = { total: 0, byModel: /* @__PURE__ */ new Map(), perAgent: /* @__PURE__ */ new Map() };
    this.latencySamples = [];
    this.throughput = { agentsSpawned: 0, completed: 0, failed: 0, parallelEfficiency: 0, peakConcurrency: 0 };
    this.quality = { success: 0, errors: 0, retries: 0, councilScores: [] };
    this.currentConcurrency = 0;
  }
  /**
   * Format metrics for display
   */
  formatReport() {
    const m = this.getMetrics();
    return `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                    OPUS 67 BENCHMARK REPORT                       \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  TOKENS                                                           \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Input:  ${String(m.tokens.input).padEnd(15)} Output: ${String(m.tokens.output).padEnd(15)}  \u2551
\u2551  Total:  ${String(m.tokens.input + m.tokens.output).padEnd(15)}                              \u2551
\u2551                                                                   \u2551
\u2551  COST                                                             \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Total:  $${m.cost.total.toFixed(4).padEnd(14)}                              \u2551
${Array.from(m.cost.byModel.entries()).map(([model, cost]) => `\u2551  ${model.padEnd(12)} $${cost.toFixed(4).padEnd(14)}                              \u2551`).join("\n")}
\u2551                                                                   \u2551
\u2551  LATENCY                                                          \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  P50:    ${m.latency.p50.toFixed(0).padEnd(8)}ms   P95: ${m.latency.p95.toFixed(0).padEnd(8)}ms   P99: ${m.latency.p99.toFixed(0)}ms   \u2551
\u2551                                                                   \u2551
\u2551  THROUGHPUT                                                       \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Spawned: ${String(m.throughput.agentsSpawned).padEnd(6)} Completed: ${String(m.throughput.completed).padEnd(6)} Failed: ${String(m.throughput.failed).padEnd(4)}   \u2551
\u2551  Peak Concurrency: ${String(m.throughput.peakConcurrency).padEnd(4)} Efficiency: ${(m.throughput.parallelEfficiency * 100).toFixed(1)}%           \u2551
\u2551                                                                   \u2551
\u2551  QUALITY                                                          \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Success Rate: ${(m.quality.successRate * 100).toFixed(1)}%   Error Rate: ${(m.quality.errorRate * 100).toFixed(1)}%   Retries: ${m.quality.retryCount}   \u2551
${m.quality.councilScore !== null ? `\u2551  Council Score: ${m.quality.councilScore.toFixed(2)}                                         \u2551
` : ""}\u2551                                                                   \u2551
\u2551  Duration: ${(m.duration / 1e3).toFixed(2)}s                                              \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
  }
};
var metricsCollector = new MetricsCollector();
var MODEL_COSTS = {
  // Gemini - FREE tier
  "gemini-2.0-flash": { input: 0, output: 0 },
  "gemini-2.0-flash-thinking": { input: 0, output: 0 },
  "gemini-1.5-flash": { input: 0, output: 0 },
  "gemini-1.5-pro": { input: 0, output: 0 },
  // DeepSeek - CHEAP
  "deepseek-chat": { input: 0.14, output: 0.28 },
  "deepseek-coder": { input: 0.14, output: 0.28 },
  "deepseek-reasoner": { input: 0.55, output: 2.19 },
  // Claude - QUALITY
  "claude-sonnet-4": { input: 3, output: 15 },
  "claude-opus-4": { input: 15, output: 75 },
  "claude-opus-4.5": { input: 3, output: 15 },
  // Opus 4.5 with extended thinking
  "claude-haiku-3.5": { input: 0.8, output: 4 },
  // OpenAI (fallback)
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 }
};
var TokenTracker = class extends EventEmitter {
  records = [];
  budget = null;
  budgetWarningThreshold = 0.8;
  // Warn at 80%
  constructor(budget) {
    super();
    if (budget) this.budget = budget;
  }
  /**
   * Calculate cost for token usage
   */
  calculateCost(model, usage) {
    const rates = MODEL_COSTS[model] || MODEL_COSTS["claude-sonnet-4"];
    const inputTokens = usage.input - (usage.cached || 0);
    return inputTokens / 1e6 * rates.input + usage.output / 1e6 * rates.output;
  }
  /**
   * Record token usage for an agent
   */
  record(agentId, agentType, model, usage) {
    const cost = this.calculateCost(model, usage);
    const record = {
      agentId,
      agentType,
      model,
      usage,
      cost,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.records.push(record);
    this.emit("usage:recorded", record);
    if (this.budget) {
      const totalCost = this.getTotalCost();
      if (totalCost >= this.budget) {
        this.emit("budget:exceeded", totalCost, this.budget);
      } else if (totalCost >= this.budget * this.budgetWarningThreshold) {
        this.emit("budget:warning", totalCost, this.budget);
      }
    }
    return record;
  }
  /**
   * Get total cost
   */
  getTotalCost() {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }
  /**
   * Get session summary
   */
  getSummary() {
    const summary = {
      totalInput: 0,
      totalOutput: 0,
      totalCached: 0,
      totalCost: 0,
      byModel: /* @__PURE__ */ new Map(),
      byAgent: /* @__PURE__ */ new Map(),
      byAgentType: /* @__PURE__ */ new Map()
    };
    for (const record of this.records) {
      summary.totalInput += record.usage.input;
      summary.totalOutput += record.usage.output;
      summary.totalCached += record.usage.cached || 0;
      summary.totalCost += record.cost;
      const modelData = summary.byModel.get(record.model) || {
        usage: { input: 0, output: 0, cached: 0 },
        cost: 0
      };
      modelData.usage.input += record.usage.input;
      modelData.usage.output += record.usage.output;
      modelData.usage.cached = (modelData.usage.cached || 0) + (record.usage.cached || 0);
      modelData.cost += record.cost;
      summary.byModel.set(record.model, modelData);
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
  getCostSavings() {
    let actualCost = 0;
    let claudeOnlyCost = 0;
    const breakdown = {};
    for (const record of this.records) {
      actualCost += record.cost;
      const claudeCost = this.calculateCost("claude-sonnet-4", record.usage);
      claudeOnlyCost += claudeCost;
      const saved = claudeCost - record.cost;
      if (saved > 0) {
        breakdown[record.model] = (breakdown[record.model] || 0) + saved;
      }
    }
    const totalSaved = claudeOnlyCost - actualCost;
    const pctSaved = claudeOnlyCost > 0 ? totalSaved / claudeOnlyCost * 100 : 0;
    return {
      saved: totalSaved,
      pctSaved,
      breakdown
    };
  }
  /**
   * Get records for a specific agent
   */
  getAgentRecords(agentId) {
    return this.records.filter((r) => r.agentId === agentId);
  }
  /**
   * Get records for a specific model
   */
  getModelRecords(model) {
    return this.records.filter((r) => r.model === model);
  }
  /**
   * Set budget
   */
  setBudget(amount, warningThreshold = 0.8) {
    this.budget = amount;
    this.budgetWarningThreshold = warningThreshold;
  }
  /**
   * Get budget status
   */
  getBudgetStatus() {
    const spent = this.getTotalCost();
    return {
      budget: this.budget,
      spent,
      remaining: this.budget ? Math.max(0, this.budget - spent) : Infinity,
      pctUsed: this.budget ? spent / this.budget * 100 : 0
    };
  }
  /**
   * Reset tracker
   */
  reset() {
    this.records = [];
  }
  /**
   * Export records as JSON
   */
  export() {
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
  formatSummary() {
    const s = this.getSummary();
    const savings = this.getCostSavings();
    const budget = this.getBudgetStatus();
    let output = `
\u250C\u2500 TOKEN USAGE SUMMARY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  TOTALS                                                          \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Input:   ${String(s.totalInput).padEnd(12)} tokens                           \u2502
\u2502  Output:  ${String(s.totalOutput).padEnd(12)} tokens                           \u2502
\u2502  Cached:  ${String(s.totalCached).padEnd(12)} tokens (FREE)                    \u2502
\u2502  Cost:    $${s.totalCost.toFixed(4).padEnd(11)}                                \u2502
\u2502                                                                  \u2502
\u2502  BY MODEL                                                        \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
    for (const [model, data] of s.byModel) {
      output += `
\u2502  ${model.padEnd(24)} ${String(data.usage.input + data.usage.output).padEnd(10)} $${data.cost.toFixed(4).padEnd(8)} \u2502`;
    }
    output += `
\u2502                                                                  \u2502
\u2502  COST SAVINGS                                                    \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  vs Claude-only: $${savings.saved.toFixed(4)} saved (${savings.pctSaved.toFixed(1)}%)                    \u2502`;
    if (budget.budget) {
      output += `
\u2502                                                                  \u2502
\u2502  BUDGET                                                          \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Limit: $${budget.budget.toFixed(2)}   Spent: $${budget.spent.toFixed(4)}   Remaining: $${budget.remaining.toFixed(4)}  \u2502
\u2502  ${budget.pctUsed >= 100 ? "\u26A0\uFE0F  EXCEEDED" : budget.pctUsed >= 80 ? "\u26A0\uFE0F  WARNING" : "\u2713  OK"} (${budget.pctUsed.toFixed(1)}% used)                                       \u2502`;
    }
    output += `
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
    return output;
  }
};
var tokenTracker = new TokenTracker();
var LatencyProfiler = class extends EventEmitter {
  entries = /* @__PURE__ */ new Map();
  completedEntries = [];
  traces = [];
  activeSpanStack = [];
  /**
   * Generate unique ID
   */
  generateId() {
    return `span_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  /**
   * Start a timing span
   */
  startSpan(name, metadata) {
    const id = this.generateId();
    const parent = this.activeSpanStack[this.activeSpanStack.length - 1];
    const entry = {
      id,
      name,
      startTime: performance.now(),
      parent,
      metadata
    };
    this.entries.set(id, entry);
    this.activeSpanStack.push(id);
    this.emit("span:start", entry);
    return id;
  }
  /**
   * End a timing span
   */
  endSpan(id) {
    const entry = this.entries.get(id);
    if (!entry) {
      console.warn(`Span ${id} not found`);
      return 0;
    }
    entry.endTime = performance.now();
    entry.duration = entry.endTime - entry.startTime;
    const stackIndex = this.activeSpanStack.indexOf(id);
    if (stackIndex !== -1) {
      this.activeSpanStack.splice(stackIndex, 1);
    }
    this.completedEntries.push(entry);
    this.entries.delete(id);
    this.emit("span:end", entry);
    return entry.duration;
  }
  /**
   * Measure a function execution
   */
  async measure(name, fn, metadata) {
    const spanId = this.startSpan(name, metadata);
    try {
      const result = await fn();
      const duration = this.endSpan(spanId);
      return { result, duration };
    } catch (error) {
      this.endSpan(spanId);
      throw error;
    }
  }
  /**
   * Measure a sync function execution
   */
  measureSync(name, fn, metadata) {
    const spanId = this.startSpan(name, metadata);
    try {
      const result = fn();
      const duration = this.endSpan(spanId);
      return { result, duration };
    } catch (error) {
      this.endSpan(spanId);
      throw error;
    }
  }
  /**
   * Create a trace decorator
   */
  trace(name, metadata) {
    return async (fn) => {
      const { result } = await this.measure(name, fn, metadata);
      return result;
    };
  }
  /**
   * Build trace tree from completed entries
   */
  buildTrace() {
    const spanMap = /* @__PURE__ */ new Map();
    const rootSpans = [];
    for (const entry of this.completedEntries) {
      if (!entry.endTime || !entry.duration) continue;
      const span = {
        id: entry.id,
        name: entry.name,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        children: [],
        metadata: entry.metadata
      };
      spanMap.set(entry.id, span);
      if (!entry.parent) {
        rootSpans.push(span);
      }
    }
    for (const entry of this.completedEntries) {
      if (entry.parent) {
        const parent = spanMap.get(entry.parent);
        const child = spanMap.get(entry.id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    }
    const sortChildren = (span) => {
      span.children.sort((a, b) => a.startTime - b.startTime);
      span.children.forEach(sortChildren);
    };
    rootSpans.forEach(sortChildren);
    this.traces = rootSpans;
    return rootSpans;
  }
  /**
   * Get stats for a specific operation name
   */
  getStats(name) {
    const durations = this.completedEntries.filter((e) => e.duration !== void 0 && (!name || e.name === name)).map((e) => e.duration);
    if (durations.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0, stdDev: 0 };
    }
    const sorted = [...durations].sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const variance = durations.reduce((acc, d) => acc + Math.pow(d - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const percentile = (p) => {
      const index = Math.ceil(p / 100 * sorted.length) - 1;
      return sorted[Math.max(0, index)];
    };
    return {
      count: durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
      stdDev
    };
  }
  /**
   * Get all operation names
   */
  getOperationNames() {
    const names = /* @__PURE__ */ new Set();
    for (const entry of this.completedEntries) {
      names.add(entry.name);
    }
    return Array.from(names);
  }
  /**
   * Get entries for a specific operation
   */
  getEntries(name) {
    if (!name) return [...this.completedEntries];
    return this.completedEntries.filter((e) => e.name === name);
  }
  /**
   * Reset profiler
   */
  reset() {
    this.entries.clear();
    this.completedEntries = [];
    this.traces = [];
    this.activeSpanStack = [];
  }
  /**
   * Format trace as ASCII tree
   */
  formatTrace() {
    const traces = this.buildTrace();
    if (traces.length === 0) return "No traces recorded";
    let output = "";
    const formatSpan = (span, indent = 0, isLast = true) => {
      const prefix = indent === 0 ? "" : "  ".repeat(indent - 1) + (isLast ? "\u2514\u2500 " : "\u251C\u2500 ");
      output += `${prefix}${span.name} (${span.duration.toFixed(2)}ms)
`;
      span.children.forEach((child, i) => {
        formatSpan(child, indent + 1, i === span.children.length - 1);
      });
    };
    traces.forEach((trace) => formatSpan(trace));
    return output;
  }
  /**
   * Format stats summary
   */
  formatStats() {
    const names = this.getOperationNames();
    if (names.length === 0) return "No operations recorded";
    let output = `
\u250C\u2500 LATENCY STATS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  OPERATION               COUNT    AVG      P50      P95      P99 \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
    for (const name of names) {
      const stats = this.getStats(name);
      output += `
\u2502  ${name.slice(0, 22).padEnd(22)} ${String(stats.count).padEnd(6)} ${stats.avg.toFixed(1).padEnd(8)}ms ${stats.p50.toFixed(1).padEnd(8)}ms ${stats.p95.toFixed(1).padEnd(8)}ms ${stats.p99.toFixed(1)}ms \u2502`;
    }
    const overall = this.getStats();
    output += `
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  OVERALL                 ${String(overall.count).padEnd(6)} ${overall.avg.toFixed(1).padEnd(8)}ms ${overall.p50.toFixed(1).padEnd(8)}ms ${overall.p95.toFixed(1).padEnd(8)}ms ${overall.p99.toFixed(1)}ms \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
    return output;
  }
};
var latencyProfiler = new LatencyProfiler();
function timed(name) {
  return function(_target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args) {
      const spanName = name || propertyKey;
      const spanId = latencyProfiler.startSpan(spanName);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        latencyProfiler.endSpan(spanId);
      }
    };
    return descriptor;
  };
}
var Semaphore = class {
  permits;
  waiting = [];
  constructor(permits) {
    this.permits = permits;
  }
  async acquire() {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }
  release() {
    this.permits++;
    const next = this.waiting.shift();
    if (next) {
      this.permits--;
      next();
    }
  }
  get available() {
    return this.permits;
  }
  get waitingCount() {
    return this.waiting.length;
  }
};
var AgentSpawner = class extends EventEmitter {
  semaphore;
  activeAgents = /* @__PURE__ */ new Map();
  completedResults = [];
  agentCounter = 0;
  defaultTimeout;
  maxRetries;
  constructor(maxConcurrent = 10, options) {
    super();
    this.semaphore = new Semaphore(maxConcurrent);
    this.defaultTimeout = options?.timeout ?? 6e4;
    this.maxRetries = options?.maxRetries ?? 2;
  }
  /**
   * Generate unique agent ID
   */
  generateAgentId() {
    this.agentCounter++;
    return `agent_${Date.now()}_${this.agentCounter.toString().padStart(4, "0")}`;
  }
  /**
   * Spawn a single agent
   */
  async spawn(task, executor) {
    const agentId = this.generateAgentId();
    const spanId = latencyProfiler.startSpan(`agent:${task.type}`);
    await this.semaphore.acquire();
    this.emit("semaphore:acquired", agentId, this.semaphore.available);
    this.activeAgents.set(agentId, { task, startTime: Date.now() });
    metricsCollector.recordAgentSpawn();
    this.emit("agent:spawned", agentId, task);
    const timeout = task.timeout ?? this.defaultTimeout;
    let result;
    try {
      const output = await Promise.race([
        executor(task),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Agent timeout")), timeout);
        })
      ]);
      const duration = latencyProfiler.endSpan(spanId);
      result = {
        taskId: task.id,
        agentId,
        success: true,
        output,
        duration
      };
      metricsCollector.recordAgentComplete(true);
      metricsCollector.recordLatency(duration);
    } catch (error) {
      const duration = latencyProfiler.endSpan(spanId);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === "Agent timeout") {
        this.emit("agent:timeout", agentId);
      } else {
        this.emit("agent:failed", agentId, error instanceof Error ? error : new Error(errorMessage));
      }
      result = {
        taskId: task.id,
        agentId,
        success: false,
        error: errorMessage,
        duration
      };
      metricsCollector.recordAgentComplete(false);
    } finally {
      this.activeAgents.delete(agentId);
      this.semaphore.release();
      this.emit("semaphore:released", agentId, this.semaphore.available);
    }
    this.emit("agent:completed", result);
    this.completedResults.push(result);
    return result;
  }
  /**
   * Spawn multiple agents in parallel
   */
  async spawnBatch(tasks, executor, options) {
    const opts = {
      maxConcurrent: this.semaphore.available + this.activeAgents.size,
      timeout: this.defaultTimeout,
      retryOnFail: false,
      maxRetries: this.maxRetries,
      ...options
    };
    const originalSemaphore = this.semaphore;
    if (opts.maxConcurrent !== originalSemaphore.available) {
      this.semaphore = new Semaphore(opts.maxConcurrent);
    }
    this.emit("batch:started", tasks.length);
    const sortedTasks = [...tasks].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    let completed = 0;
    const results = [];
    const promises = sortedTasks.map(async (task) => {
      let attempts = 0;
      let result = null;
      while (attempts <= (opts.retryOnFail ? opts.maxRetries : 0)) {
        attempts++;
        result = await this.spawn(task, executor);
        if (result.success || !opts.retryOnFail) {
          break;
        }
        metricsCollector.recordRetry();
      }
      completed++;
      opts.onProgress?.(completed, tasks.length);
      return result;
    });
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    this.semaphore = originalSemaphore;
    latencyProfiler.startSpan("batch:complete");
    latencyProfiler.endSpan(latencyProfiler.startSpan("batch:complete"));
    this.emit("batch:completed", results);
    return results;
  }
  /**
   * Spawn agents with automatic scaling
   */
  async spawnScaled(tasks, executor, targetConcurrency) {
    const levels = targetConcurrency ? [targetConcurrency] : [5, 10, 15, 20];
    let bestConcurrency = levels[0];
    let bestThroughput = 0;
    if (tasks.length >= 10 && !targetConcurrency) {
      const calibrationTasks = tasks.slice(0, 5);
      for (const level of levels.slice(0, 2)) {
        const start = Date.now();
        await this.spawnBatch(calibrationTasks, executor, { maxConcurrent: level });
        const duration = Date.now() - start;
        const throughput = calibrationTasks.length / (duration / 1e3);
        if (throughput > bestThroughput) {
          bestThroughput = throughput;
          bestConcurrency = level;
        }
      }
    }
    return this.spawnBatch(tasks, executor, { maxConcurrent: bestConcurrency });
  }
  /**
   * Get active agent count
   */
  getActiveCount() {
    return this.activeAgents.size;
  }
  /**
   * Get semaphore status
   */
  getSemaphoreStatus() {
    return {
      available: this.semaphore.available,
      waiting: this.semaphore.waitingCount,
      active: this.activeAgents.size
    };
  }
  /**
   * Get all completed results
   */
  getResults() {
    return [...this.completedResults];
  }
  /**
   * Get success rate
   */
  getSuccessRate() {
    if (this.completedResults.length === 0) return 0;
    const successful = this.completedResults.filter((r) => r.success).length;
    return successful / this.completedResults.length;
  }
  /**
   * Get average duration
   */
  getAverageDuration() {
    if (this.completedResults.length === 0) return 0;
    const total = this.completedResults.reduce((sum, r) => sum + r.duration, 0);
    return total / this.completedResults.length;
  }
  /**
   * Clear results
   */
  clearResults() {
    this.completedResults = [];
  }
  /**
   * Update max concurrent limit
   */
  setMaxConcurrent(max) {
    this.semaphore = new Semaphore(max);
  }
  /**
   * Format spawner status
   */
  formatStatus() {
    const status = this.getSemaphoreStatus();
    const successRate = this.getSuccessRate() * 100;
    const avgDuration = this.getAverageDuration();
    return `
\u250C\u2500 AGENT SPAWNER STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  SEMAPHORE                                                       \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Available Slots: ${String(status.available).padEnd(5)} Active: ${String(status.active).padEnd(5)} Waiting: ${String(status.waiting).padEnd(5)} \u2502
\u2502                                                                  \u2502
\u2502  PERFORMANCE                                                     \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Completed: ${String(this.completedResults.length).padEnd(8)}                                     \u2502
\u2502  Success Rate: ${successRate.toFixed(1)}%                                         \u2502
\u2502  Avg Duration: ${avgDuration.toFixed(0)}ms                                        \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
function createSpawner(maxConcurrent = 10) {
  return new AgentSpawner(maxConcurrent);
}
var agentSpawner = new AgentSpawner(20);

export { AgentSpawner, LatencyProfiler, MODEL_COSTS, MetricsCollector, TokenTracker, agentSpawner, createSpawner, latencyProfiler, metricsCollector, timed, tokenTracker };
