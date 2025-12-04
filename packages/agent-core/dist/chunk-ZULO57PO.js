// src/observability/metrics-registry.ts
import { metrics } from "@opentelemetry/api";
var MetricsRegistry = class {
  config;
  meter;
  counters = /* @__PURE__ */ new Map();
  histograms = /* @__PURE__ */ new Map();
  gauges = /* @__PURE__ */ new Map();
  metadata = /* @__PURE__ */ new Map();
  constructor(config) {
    this.config = {
      prefix: "gicm",
      defaultLabels: {},
      ...config
    };
    this.meter = metrics.getMeter(this.config.serviceName);
  }
  /**
   * Create or get a counter metric
   */
  counter(name, description, unit) {
    const fullName = this.getFullName(name);
    if (!this.counters.has(fullName)) {
      const counter = this.meter.createCounter(fullName, { description, unit });
      this.counters.set(fullName, counter);
      this.metadata.set(fullName, {
        name: fullName,
        type: "counter",
        description,
        unit,
        labels: []
      });
    }
    return this.counters.get(fullName);
  }
  /**
   * Create or get a histogram metric
   */
  histogram(name, description, unit, boundaries) {
    const fullName = this.getFullName(name);
    if (!this.histograms.has(fullName)) {
      const histogram = this.meter.createHistogram(fullName, { description, unit });
      this.histograms.set(fullName, histogram);
      this.metadata.set(fullName, {
        name: fullName,
        type: "histogram",
        description,
        unit,
        labels: []
      });
    }
    return this.histograms.get(fullName);
  }
  /**
   * Create or get a gauge metric
   */
  gauge(name, description, unit) {
    const fullName = this.getFullName(name);
    if (!this.gauges.has(fullName)) {
      let currentValue = 0;
      const observableGauge = this.meter.createObservableGauge(fullName, {
        description,
        unit
      });
      observableGauge.addCallback((result) => {
        result.observe(currentValue, this.config.defaultLabels);
      });
      this.gauges.set(fullName, {
        value: currentValue,
        callback: (value) => {
          currentValue = value;
        }
      });
      this.metadata.set(fullName, {
        name: fullName,
        type: "gauge",
        description,
        unit,
        labels: []
      });
    }
    const gauge = this.gauges.get(fullName);
    return {
      set: (value) => {
        gauge.callback(value);
        gauge.value = value;
      },
      get: () => gauge.value
    };
  }
  /**
   * Increment a counter
   */
  inc(name, value = 1, labels) {
    const counter = this.counter(name, `Counter: ${name}`);
    counter.add(value, { ...this.config.defaultLabels, ...labels });
  }
  /**
   * Decrement a counter (not standard but useful)
   */
  dec(name, value = 1, labels) {
    const counter = this.counter(name, `Counter: ${name}`);
    counter.add(-value, { ...this.config.defaultLabels, ...labels });
  }
  /**
   * Set a gauge value
   */
  set(name, value, labels) {
    const gauge = this.gauge(name, `Gauge: ${name}`);
    gauge.set(value);
  }
  /**
   * Record a histogram observation
   */
  observe(name, value, labels) {
    const histogram = this.histogram(name, `Histogram: ${name}`);
    histogram.record(value, { ...this.config.defaultLabels, ...labels });
  }
  /**
   * Time a function execution and record duration
   */
  async time(name, fn, labels) {
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
  timeSync(name, fn, labels) {
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
  getMetadata(name) {
    const fullName = this.getFullName(name);
    return this.metadata.get(fullName);
  }
  /**
   * Get all registered metrics
   */
  getAllMetrics() {
    return Array.from(this.metadata.values());
  }
  /**
   * Clear all metrics
   */
  clear() {
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    this.metadata.clear();
  }
  /**
   * Get full metric name with prefix
   */
  getFullName(name) {
    return `${this.config.prefix}_${name}`;
  }
  /**
   * Get configuration
   */
  getConfig() {
    return Object.freeze({ ...this.config });
  }
};
var StandardMetrics = class {
  registry;
  // Counters
  requestsTotal;
  errorsTotal;
  retryTotal;
  // Histograms
  requestDuration;
  llmTokens;
  llmCost;
  // Gauges
  activeRequests;
  circuitBreakerState;
  constructor(registry) {
    this.registry = registry;
    this.requestsTotal = registry.counter(
      "requests_total",
      "Total number of requests",
      "requests"
    );
    this.errorsTotal = registry.counter(
      "errors_total",
      "Total number of errors",
      "errors"
    );
    this.retryTotal = registry.counter(
      "retry_total",
      "Total number of retries",
      "retries"
    );
    this.requestDuration = registry.histogram(
      "request_duration_ms",
      "Request duration in milliseconds",
      "ms"
    );
    this.llmTokens = registry.histogram(
      "llm_tokens",
      "LLM tokens used per request",
      "tokens"
    );
    this.llmCost = registry.histogram(
      "llm_cost_usd",
      "LLM cost per request in USD",
      "usd"
    );
    this.activeRequests = registry.gauge(
      "active_requests",
      "Number of active requests",
      "requests"
    );
    this.circuitBreakerState = registry.gauge(
      "circuit_breaker_state",
      "Circuit breaker state (0=closed, 1=open, 2=half-open)",
      "state"
    );
  }
  /**
   * Record a successful request
   */
  recordRequest(durationMs, labels) {
    this.requestsTotal.add(1, labels);
    this.requestDuration.record(durationMs, labels);
  }
  /**
   * Record an error
   */
  recordError(errorType, labels) {
    this.errorsTotal.add(1, { ...labels, error_type: errorType });
  }
  /**
   * Record a retry
   */
  recordRetry(reason, labels) {
    this.retryTotal.add(1, { ...labels, reason });
  }
  /**
   * Record LLM usage
   */
  recordLLMUsage(tokens, costUsd, model, labels) {
    this.llmTokens.record(tokens, { ...labels, model });
    this.llmCost.record(costUsd, { ...labels, model });
  }
  /**
   * Increment active requests
   */
  incActiveRequests() {
    const current = this.activeRequests.get();
    this.activeRequests.set(current + 1);
  }
  /**
   * Decrement active requests
   */
  decActiveRequests() {
    const current = this.activeRequests.get();
    this.activeRequests.set(Math.max(0, current - 1));
  }
  /**
   * Set circuit breaker state
   */
  setCircuitBreakerState(state) {
    const stateValue = state === "closed" ? 0 : state === "open" ? 1 : 2;
    this.circuitBreakerState.set(stateValue);
  }
};
var globalRegistry = null;
var globalStandardMetrics = null;
function initializeMetrics(config) {
  if (globalRegistry) {
    console.warn("[MetricsRegistry] Global registry already exists");
    return {
      registry: globalRegistry,
      standard: globalStandardMetrics
    };
  }
  globalRegistry = new MetricsRegistry(config);
  globalStandardMetrics = new StandardMetrics(globalRegistry);
  return {
    registry: globalRegistry,
    standard: globalStandardMetrics
  };
}
function getMetricsRegistry() {
  if (!globalRegistry) {
    throw new Error("[MetricsRegistry] Global registry not initialized. Call initializeMetrics() first.");
  }
  return globalRegistry;
}
function getStandardMetrics() {
  if (!globalStandardMetrics) {
    throw new Error("[MetricsRegistry] Global standard metrics not initialized. Call initializeMetrics() first.");
  }
  return globalStandardMetrics;
}

export {
  MetricsRegistry,
  StandardMetrics,
  initializeMetrics,
  getMetricsRegistry,
  getStandardMetrics
};
//# sourceMappingURL=chunk-ZULO57PO.js.map