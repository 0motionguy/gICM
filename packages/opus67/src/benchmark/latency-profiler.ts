/**
 * OPUS 67 Latency Profiler
 * High-precision timing for operations, with trace support
 */

import { EventEmitter } from 'eventemitter3';

export interface TimingEntry {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parent?: string;
  metadata?: Record<string, unknown>;
}

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  children: TraceSpan[];
  metadata?: Record<string, unknown>;
}

export interface LatencyStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
  stdDev: number;
}

interface ProfilerEvents {
  'span:start': (entry: TimingEntry) => void;
  'span:end': (entry: TimingEntry) => void;
  'trace:complete': (trace: TraceSpan) => void;
}

/**
 * LatencyProfiler - High-precision timing and tracing
 */
export class LatencyProfiler extends EventEmitter<ProfilerEvents> {
  private entries: Map<string, TimingEntry> = new Map();
  private completedEntries: TimingEntry[] = [];
  private traces: TraceSpan[] = [];
  private activeSpanStack: string[] = [];

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Start a timing span
   */
  startSpan(name: string, metadata?: Record<string, unknown>): string {
    const id = this.generateId();
    const parent = this.activeSpanStack[this.activeSpanStack.length - 1];

    const entry: TimingEntry = {
      id,
      name,
      startTime: performance.now(),
      parent,
      metadata
    };

    this.entries.set(id, entry);
    this.activeSpanStack.push(id);
    this.emit('span:start', entry);

    return id;
  }

  /**
   * End a timing span
   */
  endSpan(id: string): number {
    const entry = this.entries.get(id);
    if (!entry) {
      console.warn(`Span ${id} not found`);
      return 0;
    }

    entry.endTime = performance.now();
    entry.duration = entry.endTime - entry.startTime;

    // Remove from active stack
    const stackIndex = this.activeSpanStack.indexOf(id);
    if (stackIndex !== -1) {
      this.activeSpanStack.splice(stackIndex, 1);
    }

    // Move to completed
    this.completedEntries.push(entry);
    this.entries.delete(id);

    this.emit('span:end', entry);

    return entry.duration;
  }

  /**
   * Measure a function execution
   */
  async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<{ result: T; duration: number }> {
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
  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): { result: T; duration: number } {
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
  trace(name: string, metadata?: Record<string, unknown>): <T>(fn: () => Promise<T>) => Promise<T> {
    return async <T>(fn: () => Promise<T>): Promise<T> => {
      const { result } = await this.measure(name, fn, metadata);
      return result;
    };
  }

  /**
   * Build trace tree from completed entries
   */
  buildTrace(): TraceSpan[] {
    const spanMap = new Map<string, TraceSpan>();
    const rootSpans: TraceSpan[] = [];

    // Create spans
    for (const entry of this.completedEntries) {
      if (!entry.endTime || !entry.duration) continue;

      const span: TraceSpan = {
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

    // Build tree
    for (const entry of this.completedEntries) {
      if (entry.parent) {
        const parent = spanMap.get(entry.parent);
        const child = spanMap.get(entry.id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    }

    // Sort children by start time
    const sortChildren = (span: TraceSpan) => {
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
  getStats(name?: string): LatencyStats {
    const durations = this.completedEntries
      .filter(e => e.duration !== undefined && (!name || e.name === name))
      .map(e => e.duration!);

    if (durations.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0, stdDev: 0 };
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;

    const variance = durations.reduce((acc, d) => acc + Math.pow(d - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
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
  getOperationNames(): string[] {
    const names = new Set<string>();
    for (const entry of this.completedEntries) {
      names.add(entry.name);
    }
    return Array.from(names);
  }

  /**
   * Get entries for a specific operation
   */
  getEntries(name?: string): TimingEntry[] {
    if (!name) return [...this.completedEntries];
    return this.completedEntries.filter(e => e.name === name);
  }

  /**
   * Reset profiler
   */
  reset(): void {
    this.entries.clear();
    this.completedEntries = [];
    this.traces = [];
    this.activeSpanStack = [];
  }

  /**
   * Format trace as ASCII tree
   */
  formatTrace(): string {
    const traces = this.buildTrace();
    if (traces.length === 0) return 'No traces recorded';

    let output = '';

    const formatSpan = (span: TraceSpan, indent = 0, isLast = true): void => {
      const prefix = indent === 0 ? '' : '  '.repeat(indent - 1) + (isLast ? '└─ ' : '├─ ');
      output += `${prefix}${span.name} (${span.duration.toFixed(2)}ms)\n`;

      span.children.forEach((child, i) => {
        formatSpan(child, indent + 1, i === span.children.length - 1);
      });
    };

    traces.forEach(trace => formatSpan(trace));
    return output;
  }

  /**
   * Format stats summary
   */
  formatStats(): string {
    const names = this.getOperationNames();
    if (names.length === 0) return 'No operations recorded';

    let output = `
┌─ LATENCY STATS ─────────────────────────────────────────────────┐
│                                                                  │
│  OPERATION               COUNT    AVG      P50      P95      P99 │
│  ────────────────────────────────────────────────────────────    │`;

    for (const name of names) {
      const stats = this.getStats(name);
      output += `
│  ${name.slice(0, 22).padEnd(22)} ${String(stats.count).padEnd(6)} ${stats.avg.toFixed(1).padEnd(8)}ms ${stats.p50.toFixed(1).padEnd(8)}ms ${stats.p95.toFixed(1).padEnd(8)}ms ${stats.p99.toFixed(1)}ms │`;
    }

    const overall = this.getStats();
    output += `
│  ────────────────────────────────────────────────────────────    │
│  OVERALL                 ${String(overall.count).padEnd(6)} ${overall.avg.toFixed(1).padEnd(8)}ms ${overall.p50.toFixed(1).padEnd(8)}ms ${overall.p95.toFixed(1).padEnd(8)}ms ${overall.p99.toFixed(1)}ms │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;

    return output;
  }
}

// Export singleton
export const latencyProfiler = new LatencyProfiler();

// Convenience decorator factory
export function timed(name?: string) {
  return function<T extends (...args: any[]) => Promise<any>>(
    _target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;

    descriptor.value = async function(this: any, ...args: any[]) {
      const spanName = name || propertyKey;
      const spanId = latencyProfiler.startSpan(spanName);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        latencyProfiler.endSpan(spanId);
      }
    } as T;

    return descriptor;
  };
}
