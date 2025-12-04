/**
 * Metrics Registry (Phase 14C)
 *
 * Centralized metrics collection with counters, gauges, histograms, and summaries.
 * Supports Prometheus, OpenTelemetry, and custom exporters.
 */

import { metrics, type Meter, type Counter, type Histogram, type ObservableGauge } from '@opentelemetry/api';

export interface MetricsConfig {
  serviceName: string;
  prefix?: string;
  defaultLabels?: Record<string, string>;
}

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricMetadata {
  name: string;
  type: MetricType;
  description: string;
  unit?: string;
  labels: string[];
}

/**
 * Metrics Registry
 */
export class MetricsRegistry {
  private config: Required<MetricsConfig>;
  private meter: Meter;
  private counters = new Map<string, Counter>();
  private histograms = new Map<string, Histogram>();
  private gauges = new Map<string, { value: number; callback: (value: number) => void }>();
  private metadata = new Map<string, MetricMetadata>();

  constructor(config: MetricsConfig) {
    this.config = {
      prefix: 'gicm',
      defaultLabels: {},
      ...config,
    };

    this.meter = metrics.getMeter(this.config.serviceName);
  }

  /**
   * Create or get a counter metric
   */
  counter(
    name: string,
    description: string,
    unit?: string
  ): Counter {
    const fullName = this.getFullName(name);

    if (!this.counters.has(fullName)) {
      const counter = this.meter.createCounter(fullName, { description, unit });
      this.counters.set(fullName, counter);

      this.metadata.set(fullName, {
        name: fullName,
        type: 'counter',
        description,
        unit,
        labels: [],
      });
    }

    return this.counters.get(fullName)!;
  }

  /**
   * Create or get a histogram metric
   */
  histogram(
    name: string,
    description: string,
    unit?: string,
    boundaries?: number[]
  ): Histogram {
    const fullName = this.getFullName(name);

    if (!this.histograms.has(fullName)) {
      const histogram = this.meter.createHistogram(fullName, { description, unit });
      this.histograms.set(fullName, histogram);

      this.metadata.set(fullName, {
        name: fullName,
        type: 'histogram',
        description,
        unit,
        labels: [],
      });
    }

    return this.histograms.get(fullName)!;
  }

  /**
   * Create or get a gauge metric
   */
  gauge(
    name: string,
    description: string,
    unit?: string
  ): { set: (value: number) => void; get: () => number } {
    const fullName = this.getFullName(name);

    if (!this.gauges.has(fullName)) {
      let currentValue = 0;

      const observableGauge = this.meter.createObservableGauge(fullName, {
        description,
        unit,
      });

      observableGauge.addCallback((result) => {
        result.observe(currentValue, this.config.defaultLabels);
      });

      this.gauges.set(fullName, {
        value: currentValue,
        callback: (value: number) => {
          currentValue = value;
        },
      });

      this.metadata.set(fullName, {
        name: fullName,
        type: 'gauge',
        description,
        unit,
        labels: [],
      });
    }

    const gauge = this.gauges.get(fullName)!;

    return {
      set: (value: number) => {
        gauge.callback(value);
        gauge.value = value;
      },
      get: () => gauge.value,
    };
  }

  /**
   * Increment a counter
   */
  inc(name: string, value = 1, labels?: Record<string, string>): void {
    const counter = this.counter(name, `Counter: ${name}`);
    counter.add(value, { ...this.config.defaultLabels, ...labels });
  }

  /**
   * Decrement a counter (not standard but useful)
   */
  dec(name: string, value = 1, labels?: Record<string, string>): void {
    const counter = this.counter(name, `Counter: ${name}`);
    counter.add(-value, { ...this.config.defaultLabels, ...labels });
  }

  /**
   * Set a gauge value
   */
  set(name: string, value: number, labels?: Record<string, string>): void {
    const gauge = this.gauge(name, `Gauge: ${name}`);
    gauge.set(value);
  }

  /**
   * Record a histogram observation
   */
  observe(name: string, value: number, labels?: Record<string, string>): void {
    const histogram = this.histogram(name, `Histogram: ${name}`);
    histogram.record(value, { ...this.config.defaultLabels, ...labels });
  }

  /**
   * Time a function execution and record duration
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      this.observe(`${name}_duration_ms`, duration, labels);
    }
  }

  /**
   * Time a sync function execution and record duration
   */
  timeSync<T>(
    name: string,
    fn: () => T,
    labels?: Record<string, string>
  ): T {
    const start = Date.now();
    try {
      return fn();
    } finally {
      const duration = Date.now() - start;
      this.observe(`${name}_duration_ms`, duration, labels);
    }
  }

  /**
   * Get metric metadata
   */
  getMetadata(name: string): MetricMetadata | undefined {
    const fullName = this.getFullName(name);
    return this.metadata.get(fullName);
  }

  /**
   * Get all registered metrics
   */
  getAllMetrics(): MetricMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    this.metadata.clear();
  }

  /**
   * Get full metric name with prefix
   */
  private getFullName(name: string): string {
    return `${this.config.prefix}_${name}`;
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<Required<MetricsConfig>> {
    return Object.freeze({ ...this.config });
  }
}

/**
 * Standard Metrics (pre-defined for common use cases)
 */
export class StandardMetrics {
  private registry: MetricsRegistry;

  // Counters
  public requestsTotal: Counter;
  public errorsTotal: Counter;
  public retryTotal: Counter;

  // Histograms
  public requestDuration: Histogram;
  public llmTokens: Histogram;
  public llmCost: Histogram;

  // Gauges
  public activeRequests: ReturnType<MetricsRegistry['gauge']>;
  public circuitBreakerState: ReturnType<MetricsRegistry['gauge']>;

  constructor(registry: MetricsRegistry) {
    this.registry = registry;

    // Initialize counters
    this.requestsTotal = registry.counter(
      'requests_total',
      'Total number of requests',
      'requests'
    );

    this.errorsTotal = registry.counter(
      'errors_total',
      'Total number of errors',
      'errors'
    );

    this.retryTotal = registry.counter(
      'retry_total',
      'Total number of retries',
      'retries'
    );

    // Initialize histograms
    this.requestDuration = registry.histogram(
      'request_duration_ms',
      'Request duration in milliseconds',
      'ms'
    );

    this.llmTokens = registry.histogram(
      'llm_tokens',
      'LLM tokens used per request',
      'tokens'
    );

    this.llmCost = registry.histogram(
      'llm_cost_usd',
      'LLM cost per request in USD',
      'usd'
    );

    // Initialize gauges
    this.activeRequests = registry.gauge(
      'active_requests',
      'Number of active requests',
      'requests'
    );

    this.circuitBreakerState = registry.gauge(
      'circuit_breaker_state',
      'Circuit breaker state (0=closed, 1=open, 2=half-open)',
      'state'
    );
  }

  /**
   * Record a successful request
   */
  recordRequest(durationMs: number, labels?: Record<string, string>): void {
    this.requestsTotal.add(1, labels);
    this.requestDuration.record(durationMs, labels);
  }

  /**
   * Record an error
   */
  recordError(errorType: string, labels?: Record<string, string>): void {
    this.errorsTotal.add(1, { ...labels, error_type: errorType });
  }

  /**
   * Record a retry
   */
  recordRetry(reason: string, labels?: Record<string, string>): void {
    this.retryTotal.add(1, { ...labels, reason });
  }

  /**
   * Record LLM usage
   */
  recordLLMUsage(
    tokens: number,
    costUsd: number,
    model: string,
    labels?: Record<string, string>
  ): void {
    this.llmTokens.record(tokens, { ...labels, model });
    this.llmCost.record(costUsd, { ...labels, model });
  }

  /**
   * Increment active requests
   */
  incActiveRequests(): void {
    const current = this.activeRequests.get();
    this.activeRequests.set(current + 1);
  }

  /**
   * Decrement active requests
   */
  decActiveRequests(): void {
    const current = this.activeRequests.get();
    this.activeRequests.set(Math.max(0, current - 1));
  }

  /**
   * Set circuit breaker state
   */
  setCircuitBreakerState(state: 'closed' | 'open' | 'half-open'): void {
    const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
    this.circuitBreakerState.set(stateValue);
  }
}

/**
 * Global metrics registry (singleton pattern)
 */
let globalRegistry: MetricsRegistry | null = null;
let globalStandardMetrics: StandardMetrics | null = null;

export function initializeMetrics(config: MetricsConfig): {
  registry: MetricsRegistry;
  standard: StandardMetrics;
} {
  if (globalRegistry) {
    console.warn('[MetricsRegistry] Global registry already exists');
    return {
      registry: globalRegistry,
      standard: globalStandardMetrics!,
    };
  }

  globalRegistry = new MetricsRegistry(config);
  globalStandardMetrics = new StandardMetrics(globalRegistry);

  return {
    registry: globalRegistry,
    standard: globalStandardMetrics,
  };
}

export function getMetricsRegistry(): MetricsRegistry {
  if (!globalRegistry) {
    throw new Error('[MetricsRegistry] Global registry not initialized. Call initializeMetrics() first.');
  }
  return globalRegistry;
}

export function getStandardMetrics(): StandardMetrics {
  if (!globalStandardMetrics) {
    throw new Error('[MetricsRegistry] Global standard metrics not initialized. Call initializeMetrics() first.');
  }
  return globalStandardMetrics;
}
