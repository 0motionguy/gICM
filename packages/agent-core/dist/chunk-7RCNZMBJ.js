// src/observability/telemetry.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes, defaultResource } from "@opentelemetry/resources";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT
} from "@opentelemetry/semantic-conventions";
import {
  trace,
  SpanStatusCode
} from "@opentelemetry/api";
var DEFAULT_CONFIG = {
  serviceVersion: "1.0.0",
  environment: "development",
  traceEndpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || "http://localhost:4318/v1/traces",
  metricsEndpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || "http://localhost:4318/v1/metrics",
  enableTracing: true,
  enableMetrics: true,
  enableAutoInstrumentation: true,
  traceSampleRate: 1
};
var TelemetryManager = class {
  sdk = null;
  tracer = null;
  config;
  initialized = false;
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Initialize OpenTelemetry SDK
   */
  async initialize() {
    if (this.initialized) {
      console.warn("[Telemetry] Already initialized");
      return;
    }
    const resource = defaultResource().merge(
      resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: this.config.serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: this.config.serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: this.config.environment,
        ...this.config.attributes
      })
    );
    const traceExporter = new OTLPTraceExporter({
      url: this.config.traceEndpoint
    });
    const metricExporter = new OTLPMetricExporter({
      url: this.config.metricsEndpoint
    });
    this.sdk = new NodeSDK({
      resource,
      traceExporter: this.config.enableTracing ? traceExporter : void 0,
      metricReader: this.config.enableMetrics ? new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 6e4
        // 1 minute
      }) : void 0,
      instrumentations: this.config.enableAutoInstrumentation ? [getNodeAutoInstrumentations()] : []
    });
    await this.sdk.start();
    this.tracer = trace.getTracer(this.config.serviceName, this.config.serviceVersion);
    this.initialized = true;
    console.log(`[Telemetry] Initialized for ${this.config.serviceName} v${this.config.serviceVersion}`);
  }
  /**
   * Shutdown telemetry gracefully
   */
  async shutdown() {
    if (!this.initialized || !this.sdk) {
      return;
    }
    await this.sdk.shutdown();
    this.initialized = false;
    console.log("[Telemetry] Shutdown complete");
  }
  /**
   * Get the tracer instance
   */
  getTracer() {
    if (!this.tracer) {
      throw new Error("[Telemetry] Not initialized. Call initialize() first.");
    }
    return this.tracer;
  }
  /**
   * Create a span and execute a function within its context
   */
  async traceAsync(name, fn, attributes) {
    const tracer = this.getTracer();
    return tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error)
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
  /**
   * Create a span and execute a synchronous function within its context
   */
  traceSync(name, fn, attributes) {
    const tracer = this.getTracer();
    return tracer.startActiveSpan(name, { attributes }, (span) => {
      try {
        const result = fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error)
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
  /**
   * Wrap an async function with automatic tracing
   */
  wrapAsync(name, fn, attributesExtractor) {
    return async (...args) => {
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
  wrapSync(name, fn, attributesExtractor) {
    return (...args) => {
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
  getCurrentSpan() {
    return trace.getActiveSpan();
  }
  /**
   * Add attributes to the current active span
   */
  addAttributes(attributes) {
    const span = this.getCurrentSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }
  /**
   * Add an event to the current active span
   */
  addEvent(name, attributes) {
    const span = this.getCurrentSpan();
    if (span) {
      span.addEvent(name, attributes);
    }
  }
  /**
   * Record an exception in the current active span
   */
  recordException(error) {
    const span = this.getCurrentSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
    }
  }
  /**
   * Check if telemetry is initialized
   */
  isInitialized() {
    return this.initialized;
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return Object.freeze({ ...this.config });
  }
};
var globalTelemetry = null;
function initializeTelemetry(config) {
  if (globalTelemetry) {
    console.warn("[Telemetry] Global instance already exists");
    return globalTelemetry;
  }
  globalTelemetry = new TelemetryManager(config);
  return globalTelemetry;
}
function getTelemetry() {
  if (!globalTelemetry) {
    throw new Error("[Telemetry] Global instance not initialized. Call initializeTelemetry() first.");
  }
  return globalTelemetry;
}
function shutdownTelemetry() {
  if (!globalTelemetry) {
    return Promise.resolve();
  }
  return globalTelemetry.shutdown();
}
function Trace(name, attributesExtractor) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const traceName = name || `${target.constructor.name}.${propertyKey}`;
    descriptor.value = async function(...args) {
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

export {
  TelemetryManager,
  initializeTelemetry,
  getTelemetry,
  shutdownTelemetry,
  Trace
};
//# sourceMappingURL=chunk-7RCNZMBJ.js.map