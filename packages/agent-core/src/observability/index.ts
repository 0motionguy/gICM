/**
 * Observability Module (Phase 14)
 *
 * Production-grade observability infrastructure for gICM agents:
 * - OpenTelemetry distributed tracing
 * - Centralized logging with correlation
 * - Metrics registry with Prometheus/OTLP support
 * - SLO tracking and alerting
 *
 * @module observability
 */

// Telemetry (14A)
export {
  TelemetryManager,
  initializeTelemetry,
  getTelemetry,
  shutdownTelemetry,
  Trace,
  type TelemetryConfig,
} from './telemetry.js';

// Log Aggregator (14B)
export {
  LogAggregator,
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  initializeLogger,
  getLogger,
  destroyLogger,
  type LogLevel,
  type LogEntry,
  type LogTransport,
  type LogAggregatorConfig,
} from './log-aggregator.js';

// Metrics Registry (14C)
export {
  MetricsRegistry,
  StandardMetrics,
  initializeMetrics,
  getMetricsRegistry,
  getStandardMetrics,
  type MetricsConfig,
  type MetricType,
  type MetricMetadata,
} from './metrics-registry.js';

// SLO Manager (14D)
export {
  SLOManager,
  StandardSLOs,
  initializeSLOManager,
  getSLOManager,
  shutdownSLOManager,
  type SLO,
  type SLOStatus,
  type SLOAlert,
  type SLOManagerConfig,
} from './slo-manager.js';

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
export async function initializeObservability(config: {
  serviceName: string;
  serviceVersion?: string;
  environment?: 'development' | 'staging' | 'production';
  traceEndpoint?: string;
  metricsEndpoint?: string;
  enableFileLogging?: boolean;
  logDirectory?: string;
}) {
  // Initialize telemetry
  const { initializeTelemetry } = await import('./telemetry.js');
  const telemetry = initializeTelemetry({
    serviceName: config.serviceName,
    serviceVersion: config.serviceVersion,
    environment: config.environment,
    traceEndpoint: config.traceEndpoint,
    metricsEndpoint: config.metricsEndpoint,
  });
  await telemetry.initialize();

  // Initialize logger
  const { initializeLogger } = await import('./log-aggregator.js');
  const logger = initializeLogger({
    serviceName: config.serviceName,
    enableFile: config.enableFileLogging ?? false,
    logDirectory: config.logDirectory,
    enableConsole: true,
    minLevel: config.environment === 'production' ? 'info' : 'debug',
  });

  // Initialize metrics
  const { initializeMetrics } = await import('./metrics-registry.js');
  const { registry, standard } = initializeMetrics({
    serviceName: config.serviceName,
    prefix: 'gicm',
  });

  // Initialize SLO manager
  const { initializeSLOManager, StandardSLOs } = await import('./slo-manager.js');
  const sloManager = initializeSLOManager({
    serviceName: config.serviceName,
    metricsRegistry: registry,
    logger,
  });

  // Register standard SLOs
  sloManager.registerSLO(StandardSLOs.availability(99.9, 3600));
  sloManager.registerSLO(StandardSLOs.latency(95, 1000, 3600));
  sloManager.registerSLO(StandardSLOs.errorRate(99.5, 3600));

  // Start SLO monitoring
  sloManager.start();

  logger.info('Observability stack initialized', {
    serviceName: config.serviceName,
    version: config.serviceVersion,
    environment: config.environment,
  });

  return {
    telemetry,
    logger,
    registry,
    standard,
    sloManager,
  };
}

/**
 * Shutdown complete observability stack
 */
export async function shutdownObservability() {
  const { shutdownTelemetry } = await import('./telemetry.js');
  const { destroyLogger } = await import('./log-aggregator.js');
  const { shutdownSLOManager } = await import('./slo-manager.js');

  shutdownSLOManager();
  destroyLogger();
  await shutdownTelemetry();
}
