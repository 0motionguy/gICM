/**
 * OpenTelemetry Integration (Phase 14A)
 *
 * Provides distributed tracing, metrics, and context propagation for gICM agents.
 * Supports OTLP exporters for Grafana, Jaeger, Zipkin, etc.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes, defaultResource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT
} from '@opentelemetry/semantic-conventions';
import {
  trace,
  context,
  SpanStatusCode,
  Span,
  Tracer,
  type Attributes
} from '@opentelemetry/api';

export interface TelemetryConfig {
  serviceName: string;
  serviceVersion?: string;
  environment?: 'development' | 'staging' | 'production';

  // OTLP endpoints
  traceEndpoint?: string;
  metricsEndpoint?: string;

  // Feature flags
  enableTracing?: boolean;
  enableMetrics?: boolean;
  enableAutoInstrumentation?: boolean;

  // Sampling
  traceSampleRate?: number; // 0-1

  // Custom attributes
  attributes?: Record<string, string | number | boolean>;
}

const DEFAULT_CONFIG: Partial<TelemetryConfig> = {
  serviceVersion: '1.0.0',
  environment: 'development',
  traceEndpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
  metricsEndpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
  enableTracing: true,
  enableMetrics: true,
  enableAutoInstrumentation: true,
  traceSampleRate: 1.0,
};

export class TelemetryManager {
  private sdk: NodeSDK | null = null;
  private tracer: Tracer | null = null;
  private config: Required<TelemetryConfig>;
  private initialized = false;

  constructor(config: TelemetryConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<TelemetryConfig>;
  }

  /**
   * Initialize OpenTelemetry SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Telemetry] Already initialized');
      return;
    }

    const resource = defaultResource().merge(
      resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: this.config.serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: this.config.serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: this.config.environment,
        ...this.config.attributes,
      })
    );

    const traceExporter = new OTLPTraceExporter({
      url: this.config.traceEndpoint,
    });

    const metricExporter = new OTLPMetricExporter({
      url: this.config.metricsEndpoint,
    });

    this.sdk = new NodeSDK({
      resource,
      traceExporter: this.config.enableTracing ? traceExporter : undefined,
      metricReader: this.config.enableMetrics ?
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 60000, // 1 minute
        }) : undefined,
      instrumentations: this.config.enableAutoInstrumentation
        ? [getNodeAutoInstrumentations()]
        : [],
    });

    await this.sdk.start();
    this.tracer = trace.getTracer(this.config.serviceName, this.config.serviceVersion);
    this.initialized = true;

    console.log(`[Telemetry] Initialized for ${this.config.serviceName} v${this.config.serviceVersion}`);
  }

  /**
   * Shutdown telemetry gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.initialized || !this.sdk) {
      return;
    }

    await this.sdk.shutdown();
    this.initialized = false;
    console.log('[Telemetry] Shutdown complete');
  }

  /**
   * Get the tracer instance
   */
  getTracer(): Tracer {
    if (!this.tracer) {
      throw new Error('[Telemetry] Not initialized. Call initialize() first.');
    }
    return this.tracer;
  }

  /**
   * Create a span and execute a function within its context
   */
  async traceAsync<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: Attributes
  ): Promise<T> {
    const tracer = this.getTracer();

    return tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Create a span and execute a synchronous function within its context
   */
  traceSync<T>(
    name: string,
    fn: (span: Span) => T,
    attributes?: Attributes
  ): T {
    const tracer = this.getTracer();

    return tracer.startActiveSpan(name, { attributes }, (span) => {
      try {
        const result = fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Wrap an async function with automatic tracing
   */
  wrapAsync<TArgs extends any[], TReturn>(
    name: string,
    fn: (...args: TArgs) => Promise<TReturn>,
    attributesExtractor?: (...args: TArgs) => Attributes
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs) => {
      const attributes = attributesExtractor?.(...args);
      return this.traceAsync(name, async (span) => {
        if (attributes) {
          span.setAttributes(attributes);
        }
        return fn(...args);
      });
    };
  }

  /**
   * Wrap a sync function with automatic tracing
   */
  wrapSync<TArgs extends any[], TReturn>(
    name: string,
    fn: (...args: TArgs) => TReturn,
    attributesExtractor?: (...args: TArgs) => Attributes
  ): (...args: TArgs) => TReturn {
    return (...args: TArgs) => {
      const attributes = attributesExtractor?.(...args);
      return this.traceSync(name, (span) => {
        if (attributes) {
          span.setAttributes(attributes);
        }
        return fn(...args);
      });
    };
  }

  /**
   * Get the current active span
   */
  getCurrentSpan(): Span | undefined {
    return trace.getActiveSpan();
  }

  /**
   * Add attributes to the current active span
   */
  addAttributes(attributes: Attributes): void {
    const span = this.getCurrentSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }

  /**
   * Add an event to the current active span
   */
  addEvent(name: string, attributes?: Attributes): void {
    const span = this.getCurrentSpan();
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  /**
   * Record an exception in the current active span
   */
  recordException(error: Error): void {
    const span = this.getCurrentSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    }
  }

  /**
   * Check if telemetry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<TelemetryConfig>> {
    return Object.freeze({ ...this.config });
  }
}

/**
 * Global telemetry instance (singleton pattern)
 */
let globalTelemetry: TelemetryManager | null = null;

export function initializeTelemetry(config: TelemetryConfig): TelemetryManager {
  if (globalTelemetry) {
    console.warn('[Telemetry] Global instance already exists');
    return globalTelemetry;
  }

  globalTelemetry = new TelemetryManager(config);
  return globalTelemetry;
}

export function getTelemetry(): TelemetryManager {
  if (!globalTelemetry) {
    throw new Error('[Telemetry] Global instance not initialized. Call initializeTelemetry() first.');
  }
  return globalTelemetry;
}

export function shutdownTelemetry(): Promise<void> {
  if (!globalTelemetry) {
    return Promise.resolve();
  }
  return globalTelemetry.shutdown();
}

/**
 * Decorator for automatic method tracing
 */
export function Trace(name?: string, attributesExtractor?: (...args: any[]) => Attributes) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const traceName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const telemetry = getTelemetry();
      const attributes = attributesExtractor?.(...args);

      return telemetry.traceAsync(traceName, async (span) => {
        if (attributes) {
          span.setAttributes(attributes);
        }
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
