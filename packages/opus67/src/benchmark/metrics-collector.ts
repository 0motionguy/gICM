/**
 * OPUS 67 Metrics Collector
 * Central hub for performance, cost, and quality metrics
 */

import { EventEmitter } from 'eventemitter3';

// Types
export interface TokenMetrics {
  input: number;
  output: number;
  perAgent: Map<string, { input: number; output: number }>;
}

export interface CostMetrics {
  total: number;
  byModel: Map<string, number>;
  perAgent: Map<string, number>;
}

export interface LatencyMetrics {
  total: number;
  firstToken: number;
  samples: number[];
  p50: number;
  p95: number;
  p99: number;
}

export interface ThroughputMetrics {
  agentsSpawned: number;
  completed: number;
  failed: number;
  parallelEfficiency: number;
  peakConcurrency: number;
}

export interface QualityMetrics {
  successRate: number;
  errorRate: number;
  councilScore: number | null;
  retryCount: number;
}

export interface BenchmarkMetrics {
  tokens: TokenMetrics;
  cost: CostMetrics;
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
  quality: QualityMetrics;
  timestamp: Date;
  duration: number;
}

export interface MetricsSnapshot {
  id: string;
  name: string;
  metrics: BenchmarkMetrics;
  metadata: Record<string, unknown>;
}

interface CollectorEvents {
  'metric:recorded': (type: string, value: number) => void;
  'snapshot:created': (snapshot: MetricsSnapshot) => void;
  'threshold:exceeded': (metric: string, value: number, threshold: number) => void;
}

/**
 * MetricsCollector - Central metrics aggregation
 */
export class MetricsCollector extends EventEmitter<CollectorEvents> {
  private tokens: TokenMetrics;
  private cost: CostMetrics;
  private latencySamples: number[] = [];
  private throughput: ThroughputMetrics;
  private quality: { success: number; errors: number; retries: number; councilScores: number[] };
  private startTime: number;
  private snapshots: MetricsSnapshot[] = [];
  private currentConcurrency = 0;

  constructor() {
    super();
    this.startTime = Date.now();
    this.tokens = {
      input: 0,
      output: 0,
      perAgent: new Map()
    };
    this.cost = {
      total: 0,
      byModel: new Map(),
      perAgent: new Map()
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
  recordTokens(input: number, output: number, agentId?: string, model?: string): void {
    this.tokens.input += input;
    this.tokens.output += output;

    if (agentId) {
      const existing = this.tokens.perAgent.get(agentId) || { input: 0, output: 0 };
      this.tokens.perAgent.set(agentId, {
        input: existing.input + input,
        output: existing.output + output
      });
    }

    this.emit('metric:recorded', 'tokens', input + output);
  }

  /**
   * Record cost
   */
  recordCost(amount: number, model: string, agentId?: string): void {
    this.cost.total += amount;

    const modelCost = this.cost.byModel.get(model) || 0;
    this.cost.byModel.set(model, modelCost + amount);

    if (agentId) {
      const agentCost = this.cost.perAgent.get(agentId) || 0;
      this.cost.perAgent.set(agentId, agentCost + amount);
    }

    this.emit('metric:recorded', 'cost', amount);
  }

  /**
   * Record latency sample
   */
  recordLatency(ms: number, isFirstToken = false): void {
    this.latencySamples.push(ms);
    this.emit('metric:recorded', 'latency', ms);
  }

  /**
   * Record agent spawn
   */
  recordAgentSpawn(): void {
    this.throughput.agentsSpawned++;
    this.currentConcurrency++;

    if (this.currentConcurrency > this.throughput.peakConcurrency) {
      this.throughput.peakConcurrency = this.currentConcurrency;
    }

    this.emit('metric:recorded', 'spawn', 1);
  }

  /**
   * Record agent completion
   */
  recordAgentComplete(success: boolean): void {
    this.currentConcurrency = Math.max(0, this.currentConcurrency - 1);

    if (success) {
      this.throughput.completed++;
      this.quality.success++;
    } else {
      this.throughput.failed++;
      this.quality.errors++;
    }

    // Calculate parallel efficiency
    const totalTime = Date.now() - this.startTime;
    const theoreticalSequential = this.throughput.completed * this.getAverageLatency();
    this.throughput.parallelEfficiency = theoreticalSequential > 0
      ? theoreticalSequential / totalTime
      : 0;

    this.emit('metric:recorded', success ? 'complete' : 'fail', 1);
  }

  /**
   * Record retry attempt
   */
  recordRetry(): void {
    this.quality.retries++;
    this.emit('metric:recorded', 'retry', 1);
  }

  /**
   * Record council quality score
   */
  recordCouncilScore(score: number): void {
    this.quality.councilScores.push(score);
    this.emit('metric:recorded', 'council_score', score);
  }

  /**
   * Get average latency
   */
  private getAverageLatency(): number {
    if (this.latencySamples.length === 0) return 0;
    return this.latencySamples.reduce((a, b) => a + b, 0) / this.latencySamples.length;
  }

  /**
   * Calculate percentile
   */
  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): BenchmarkMetrics {
    const councilAvg = this.quality.councilScores.length > 0
      ? this.quality.councilScores.reduce((a, b) => a + b, 0) / this.quality.councilScores.length
      : null;

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
      timestamp: new Date(),
      duration: Date.now() - this.startTime
    };
  }

  /**
   * Create named snapshot
   */
  createSnapshot(name: string, metadata: Record<string, unknown> = {}): MetricsSnapshot {
    const snapshot: MetricsSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      metrics: this.getMetrics(),
      metadata
    };

    this.snapshots.push(snapshot);
    this.emit('snapshot:created', snapshot);
    return snapshot;
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): MetricsSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(snapshotA: string, snapshotB: string): Record<string, { a: number; b: number; diff: number; pctChange: number }> {
    const a = this.snapshots.find(s => s.id === snapshotA || s.name === snapshotA);
    const b = this.snapshots.find(s => s.id === snapshotB || s.name === snapshotB);

    if (!a || !b) {
      throw new Error('Snapshot not found');
    }

    const compare = (va: number, vb: number) => ({
      a: va,
      b: vb,
      diff: vb - va,
      pctChange: va > 0 ? ((vb - va) / va) * 100 : 0
    });

    return {
      'tokens.input': compare(a.metrics.tokens.input, b.metrics.tokens.input),
      'tokens.output': compare(a.metrics.tokens.output, b.metrics.tokens.output),
      'cost.total': compare(a.metrics.cost.total, b.metrics.cost.total),
      'latency.p50': compare(a.metrics.latency.p50, b.metrics.latency.p50),
      'latency.p95': compare(a.metrics.latency.p95, b.metrics.latency.p95),
      'throughput.completed': compare(a.metrics.throughput.completed, b.metrics.throughput.completed),
      'throughput.parallelEfficiency': compare(a.metrics.throughput.parallelEfficiency, b.metrics.throughput.parallelEfficiency),
      'quality.successRate': compare(a.metrics.quality.successRate, b.metrics.quality.successRate),
      'duration': compare(a.metrics.duration, b.metrics.duration)
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.startTime = Date.now();
    this.tokens = { input: 0, output: 0, perAgent: new Map() };
    this.cost = { total: 0, byModel: new Map(), perAgent: new Map() };
    this.latencySamples = [];
    this.throughput = { agentsSpawned: 0, completed: 0, failed: 0, parallelEfficiency: 0, peakConcurrency: 0 };
    this.quality = { success: 0, errors: 0, retries: 0, councilScores: [] };
    this.currentConcurrency = 0;
  }

  /**
   * Format metrics for display
   */
  formatReport(): string {
    const m = this.getMetrics();

    return `
╔══════════════════════════════════════════════════════════════════╗
║                    OPUS 67 BENCHMARK REPORT                       ║
╠══════════════════════════════════════════════════════════════════╣
║  TOKENS                                                           ║
║  ─────────────────────────────────────────────────────────────    ║
║  Input:  ${String(m.tokens.input).padEnd(15)} Output: ${String(m.tokens.output).padEnd(15)}  ║
║  Total:  ${String(m.tokens.input + m.tokens.output).padEnd(15)}                              ║
║                                                                   ║
║  COST                                                             ║
║  ─────────────────────────────────────────────────────────────    ║
║  Total:  $${m.cost.total.toFixed(4).padEnd(14)}                              ║
${Array.from(m.cost.byModel.entries()).map(([model, cost]) =>
`║  ${model.padEnd(12)} $${cost.toFixed(4).padEnd(14)}                              ║`).join('\n')}
║                                                                   ║
║  LATENCY                                                          ║
║  ─────────────────────────────────────────────────────────────    ║
║  P50:    ${m.latency.p50.toFixed(0).padEnd(8)}ms   P95: ${m.latency.p95.toFixed(0).padEnd(8)}ms   P99: ${m.latency.p99.toFixed(0)}ms   ║
║                                                                   ║
║  THROUGHPUT                                                       ║
║  ─────────────────────────────────────────────────────────────    ║
║  Spawned: ${String(m.throughput.agentsSpawned).padEnd(6)} Completed: ${String(m.throughput.completed).padEnd(6)} Failed: ${String(m.throughput.failed).padEnd(4)}   ║
║  Peak Concurrency: ${String(m.throughput.peakConcurrency).padEnd(4)} Efficiency: ${(m.throughput.parallelEfficiency * 100).toFixed(1)}%           ║
║                                                                   ║
║  QUALITY                                                          ║
║  ─────────────────────────────────────────────────────────────    ║
║  Success Rate: ${(m.quality.successRate * 100).toFixed(1)}%   Error Rate: ${(m.quality.errorRate * 100).toFixed(1)}%   Retries: ${m.quality.retryCount}   ║
${m.quality.councilScore !== null ? `║  Council Score: ${m.quality.councilScore.toFixed(2)}                                         ║\n` : ''}║                                                                   ║
║  Duration: ${(m.duration / 1000).toFixed(2)}s                                              ║
╚══════════════════════════════════════════════════════════════════╝`;
  }
}

// Export singleton
export const metricsCollector = new MetricsCollector();
