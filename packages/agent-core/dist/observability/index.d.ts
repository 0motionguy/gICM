import { Counter, Histogram, Tracer, Span, Attributes } from '@opentelemetry/api';

/**
 * Metrics Registry (Phase 14C)
 *
 * Centralized metrics collection with counters, gauges, histograms, and summaries.
 * Supports Prometheus, OpenTelemetry, and custom exporters.
 */

interface MetricsConfig {
    serviceName: string;
    prefix?: string;
    defaultLabels?: Record<string, string>;
}
type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
interface MetricMetadata {
    name: string;
    type: MetricType;
    description: string;
    unit?: string;
    labels: string[];
}
/**
 * Metrics Registry
 */
declare class MetricsRegistry {
    private config;
    private meter;
    private counters;
    private histograms;
    private gauges;
    private metadata;
    constructor(config: MetricsConfig);
    /**
     * Create or get a counter metric
     */
    counter(name: string, description: string, unit?: string): Counter;
    /**
     * Create or get a histogram metric
     */
    histogram(name: string, description: string, unit?: string, boundaries?: number[]): Histogram;
    /**
     * Create or get a gauge metric
     */
    gauge(name: string, description: string, unit?: string): {
        set: (value: number) => void;
        get: () => number;
    };
    /**
     * Increment a counter
     */
    inc(name: string, value?: number, labels?: Record<string, string>): void;
    /**
     * Decrement a counter (not standard but useful)
     */
    dec(name: string, value?: number, labels?: Record<string, string>): void;
    /**
     * Set a gauge value
     */
    set(name: string, value: number, labels?: Record<string, string>): void;
    /**
     * Record a histogram observation
     */
    observe(name: string, value: number, labels?: Record<string, string>): void;
    /**
     * Time a function execution and record duration
     */
    time<T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T>;
    /**
     * Time a sync function execution and record duration
     */
    timeSync<T>(name: string, fn: () => T, labels?: Record<string, string>): T;
    /**
     * Get metric metadata
     */
    getMetadata(name: string): MetricMetadata | undefined;
    /**
     * Get all registered metrics
     */
    getAllMetrics(): MetricMetadata[];
    /**
     * Clear all metrics
     */
    clear(): void;
    /**
     * Get full metric name with prefix
     */
    private getFullName;
    /**
     * Get configuration
     */
    getConfig(): Readonly<Required<MetricsConfig>>;
}
/**
 * Standard Metrics (pre-defined for common use cases)
 */
declare class StandardMetrics {
    private registry;
    requestsTotal: Counter;
    errorsTotal: Counter;
    retryTotal: Counter;
    requestDuration: Histogram;
    llmTokens: Histogram;
    llmCost: Histogram;
    activeRequests: ReturnType<MetricsRegistry['gauge']>;
    circuitBreakerState: ReturnType<MetricsRegistry['gauge']>;
    constructor(registry: MetricsRegistry);
    /**
     * Record a successful request
     */
    recordRequest(durationMs: number, labels?: Record<string, string>): void;
    /**
     * Record an error
     */
    recordError(errorType: string, labels?: Record<string, string>): void;
    /**
     * Record a retry
     */
    recordRetry(reason: string, labels?: Record<string, string>): void;
    /**
     * Record LLM usage
     */
    recordLLMUsage(tokens: number, costUsd: number, model: string, labels?: Record<string, string>): void;
    /**
     * Increment active requests
     */
    incActiveRequests(): void;
    /**
     * Decrement active requests
     */
    decActiveRequests(): void;
    /**
     * Set circuit breaker state
     */
    setCircuitBreakerState(state: 'closed' | 'open' | 'half-open'): void;
}
declare function initializeMetrics(config: MetricsConfig): {
    registry: MetricsRegistry;
    standard: StandardMetrics;
};
declare function getMetricsRegistry(): MetricsRegistry;
declare function getStandardMetrics(): StandardMetrics;

/**
 * Log Aggregator (Phase 14B)
 *
 * Centralized logging with structured output, log levels, and context enrichment.
 * Supports multiple transports (console, file, HTTP) and log correlation with traces.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    serviceName: string;
    traceId?: string;
    spanId?: string;
    context?: Record<string, any>;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}
interface LogTransport {
    name: string;
    log(entry: LogEntry): void | Promise<void>;
}
interface LogAggregatorConfig {
    serviceName: string;
    minLevel?: LogLevel;
    transports?: LogTransport[];
    enableTraceCorrelation?: boolean;
    enableConsole?: boolean;
    enableFile?: boolean;
    logDirectory?: string;
    contextEnricher?: (entry: LogEntry) => LogEntry;
}
/**
 * Console Transport
 */
declare class ConsoleTransport implements LogTransport {
    name: string;
    log(entry: LogEntry): void;
}
/**
 * File Transport
 */
declare class FileTransport implements LogTransport {
    name: string;
    private logDirectory;
    private logFile;
    constructor(logDirectory: string);
    log(entry: LogEntry): void;
}
/**
 * HTTP Transport (for log aggregation services like Grafana Loki)
 */
declare class HttpTransport implements LogTransport {
    name: string;
    private endpoint;
    private batchSize;
    private batch;
    private flushInterval;
    constructor(endpoint: string, batchSize?: number, flushIntervalMs?: number);
    log(entry: LogEntry): void;
    flush(): Promise<void>;
    destroy(): void;
}
/**
 * Log Aggregator
 */
declare class LogAggregator {
    private config;
    private transports;
    constructor(config: LogAggregatorConfig);
    private initializeTransports;
    /**
     * Log a message
     */
    log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void;
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, errorOrContext?: Error | Record<string, any>, context?: Record<string, any>): void;
    fatal(message: string, errorOrContext?: Error | Record<string, any>, context?: Record<string, any>): void;
    /**
     * Create a child logger with additional context
     */
    child(additionalContext: Record<string, any>): LogAggregator;
    /**
     * Add a new transport
     */
    addTransport(transport: LogTransport): void;
    /**
     * Remove a transport by name
     */
    removeTransport(name: string): void;
    /**
     * Get all transports
     */
    getTransports(): LogTransport[];
    /**
     * Flush all transports (for HTTP transports with buffering)
     */
    flush(): Promise<void>;
    /**
     * Destroy all transports and clean up
     */
    destroy(): void;
}
declare function initializeLogger(config: LogAggregatorConfig): LogAggregator;
declare function getLogger(): LogAggregator;
declare function destroyLogger(): void;

/**
 * SLO Manager (Phase 14D)
 *
 * Service Level Objective (SLO) tracking and alerting.
 * Monitors availability, latency, error rate, and custom SLOs.
 * Calculates error budgets and triggers alerts when SLOs are at risk.
 */

interface SLO {
    id: string;
    name: string;
    description: string;
    target: number;
    window: number;
    metricQuery: (registry: MetricsRegistry) => Promise<number>;
}
interface SLOStatus {
    slo: SLO;
    current: number;
    target: number;
    errorBudget: number;
    state: 'healthy' | 'warning' | 'critical';
    lastEvaluated: Date;
}
interface SLOAlert {
    sloId: string;
    sloName: string;
    severity: 'warning' | 'critical';
    message: string;
    current: number;
    target: number;
    errorBudget: number;
    timestamp: Date;
}
interface SLOManagerConfig {
    serviceName: string;
    evaluationInterval?: number;
    warningThreshold?: number;
    criticalThreshold?: number;
    alertCallback?: (alert: SLOAlert) => void | Promise<void>;
    metricsRegistry?: MetricsRegistry;
    logger?: LogAggregator;
}
/**
 * SLO Manager
 */
declare class SLOManager {
    private config;
    private slos;
    private statuses;
    private evaluationInterval;
    private running;
    constructor(config: SLOManagerConfig);
    /**
     * Register an SLO
     */
    registerSLO(slo: SLO): void;
    /**
     * Unregister an SLO
     */
    unregisterSLO(sloId: string): void;
    /**
     * Get all registered SLOs
     */
    getSLOs(): SLO[];
    /**
     * Get SLO status
     */
    getStatus(sloId: string): SLOStatus | undefined;
    /**
     * Get all SLO statuses
     */
    getAllStatuses(): SLOStatus[];
    /**
     * Start periodic SLO evaluation
     */
    start(): void;
    /**
     * Stop periodic SLO evaluation
     */
    stop(): void;
    /**
     * Evaluate all SLOs
     */
    evaluateAll(): Promise<void>;
    /**
     * Evaluate a single SLO
     */
    evaluateSLO(slo: SLO): Promise<SLOStatus>;
    /**
     * Calculate error budget
     */
    private calculateErrorBudget;
    /**
     * Determine SLO state based on error budget
     */
    private determineState;
    /**
     * Handle state changes
     */
    private handleStateChange;
    /**
     * Default alert callback
     */
    private defaultAlertCallback;
    /**
     * Get SLO summary report
     */
    getSummary(): {
        total: number;
        healthy: number;
        warning: number;
        critical: number;
        avgErrorBudget: number;
    };
    /**
     * Check if running
     */
    isRunning(): boolean;
    /**
     * Get configuration
     */
    getConfig(): Readonly<SLOManagerConfig>;
}
/**
 * Standard SLO Definitions
 */
declare class StandardSLOs {
    /**
     * Availability SLO: % of successful requests
     */
    static availability(target?: number, windowSeconds?: number): SLO;
    /**
     * Latency SLO: % of requests below latency threshold
     */
    static latency(target?: number, thresholdMs?: number, windowSeconds?: number): SLO;
    /**
     * Error Rate SLO: % of requests without errors
     */
    static errorRate(target?: number, windowSeconds?: number): SLO;
}
declare function initializeSLOManager(config: SLOManagerConfig): SLOManager;
declare function getSLOManager(): SLOManager;
declare function shutdownSLOManager(): void;

/**
 * OpenTelemetry Integration (Phase 14A)
 *
 * Provides distributed tracing, metrics, and context propagation for gICM agents.
 * Supports OTLP exporters for Grafana, Jaeger, Zipkin, etc.
 */

interface TelemetryConfig {
    serviceName: string;
    serviceVersion?: string;
    environment?: 'development' | 'staging' | 'production';
    traceEndpoint?: string;
    metricsEndpoint?: string;
    enableTracing?: boolean;
    enableMetrics?: boolean;
    enableAutoInstrumentation?: boolean;
    traceSampleRate?: number;
    attributes?: Record<string, string | number | boolean>;
}
declare class TelemetryManager {
    private sdk;
    private tracer;
    private config;
    private initialized;
    constructor(config: TelemetryConfig);
    /**
     * Initialize OpenTelemetry SDK
     */
    initialize(): Promise<void>;
    /**
     * Shutdown telemetry gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Get the tracer instance
     */
    getTracer(): Tracer;
    /**
     * Create a span and execute a function within its context
     */
    traceAsync<T>(name: string, fn: (span: Span) => Promise<T>, attributes?: Attributes): Promise<T>;
    /**
     * Create a span and execute a synchronous function within its context
     */
    traceSync<T>(name: string, fn: (span: Span) => T, attributes?: Attributes): T;
    /**
     * Wrap an async function with automatic tracing
     */
    wrapAsync<TArgs extends any[], TReturn>(name: string, fn: (...args: TArgs) => Promise<TReturn>, attributesExtractor?: (...args: TArgs) => Attributes): (...args: TArgs) => Promise<TReturn>;
    /**
     * Wrap a sync function with automatic tracing
     */
    wrapSync<TArgs extends any[], TReturn>(name: string, fn: (...args: TArgs) => TReturn, attributesExtractor?: (...args: TArgs) => Attributes): (...args: TArgs) => TReturn;
    /**
     * Get the current active span
     */
    getCurrentSpan(): Span | undefined;
    /**
     * Add attributes to the current active span
     */
    addAttributes(attributes: Attributes): void;
    /**
     * Add an event to the current active span
     */
    addEvent(name: string, attributes?: Attributes): void;
    /**
     * Record an exception in the current active span
     */
    recordException(error: Error): void;
    /**
     * Check if telemetry is initialized
     */
    isInitialized(): boolean;
    /**
     * Get current configuration
     */
    getConfig(): Readonly<Required<TelemetryConfig>>;
}
declare function initializeTelemetry(config: TelemetryConfig): TelemetryManager;
declare function getTelemetry(): TelemetryManager;
declare function shutdownTelemetry(): Promise<void>;
/**
 * Decorator for automatic method tracing
 */
declare function Trace(name?: string, attributesExtractor?: (...args: any[]) => Attributes): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

/**
 * Initialize complete observability stack
 *
 * @example
 * ```typescript
 * import { initializeObservability } from '@gicm/agent-core/observability';
 *
 * await initializeObservability({
 *   serviceName: 'wallet-agent',
 *   serviceVersion: '1.0.0',
 *   environment: 'production',
 * });
 * ```
 */
declare function initializeObservability(config: {
    serviceName: string;
    serviceVersion?: string;
    environment?: 'development' | 'staging' | 'production';
    traceEndpoint?: string;
    metricsEndpoint?: string;
    enableFileLogging?: boolean;
    logDirectory?: string;
}): Promise<{
    telemetry: TelemetryManager;
    logger: LogAggregator;
    registry: MetricsRegistry;
    standard: StandardMetrics;
    sloManager: SLOManager;
}>;
/**
 * Shutdown complete observability stack
 */
declare function shutdownObservability(): Promise<void>;

export { ConsoleTransport, FileTransport, HttpTransport, LogAggregator, type LogAggregatorConfig, type LogEntry, type LogLevel, type LogTransport, type MetricMetadata, type MetricType, type MetricsConfig, MetricsRegistry, type SLO, type SLOAlert, SLOManager, type SLOManagerConfig, type SLOStatus, StandardMetrics, StandardSLOs, type TelemetryConfig, TelemetryManager, Trace, destroyLogger, getLogger, getMetricsRegistry, getSLOManager, getStandardMetrics, getTelemetry, initializeLogger, initializeMetrics, initializeObservability, initializeSLOManager, initializeTelemetry, shutdownObservability, shutdownSLOManager, shutdownTelemetry };
