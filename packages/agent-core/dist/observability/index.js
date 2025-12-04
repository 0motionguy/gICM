import {
  SLOManager,
  StandardSLOs,
  getSLOManager,
  initializeSLOManager,
  shutdownSLOManager
} from "../chunk-JBPLYGBS.js";
import {
  MetricsRegistry,
  StandardMetrics,
  getMetricsRegistry,
  getStandardMetrics,
  initializeMetrics
} from "../chunk-ZULO57PO.js";
import {
  TelemetryManager,
  Trace,
  getTelemetry,
  initializeTelemetry,
  shutdownTelemetry
} from "../chunk-7RCNZMBJ.js";
import {
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  LogAggregator,
  destroyLogger,
  getLogger,
  initializeLogger
} from "../chunk-G2FCOWJL.js";
import "../chunk-DGUM43GV.js";

// src/observability/index.ts
async function initializeObservability(config) {
  const { initializeTelemetry: initializeTelemetry2 } = await import("../telemetry-WYV2OVMA.js");
  const telemetry = initializeTelemetry2({
    serviceName: config.serviceName,
    serviceVersion: config.serviceVersion,
    environment: config.environment,
    traceEndpoint: config.traceEndpoint,
    metricsEndpoint: config.metricsEndpoint
  });
  await telemetry.initialize();
  const { initializeLogger: initializeLogger2 } = await import("../log-aggregator-TT22H6IO.js");
  const logger = initializeLogger2({
    serviceName: config.serviceName,
    enableFile: config.enableFileLogging ?? false,
    logDirectory: config.logDirectory,
    enableConsole: true,
    minLevel: config.environment === "production" ? "info" : "debug"
  });
  const { initializeMetrics: initializeMetrics2 } = await import("../metrics-registry-M6DUJOGN.js");
  const { registry, standard } = initializeMetrics2({
    serviceName: config.serviceName,
    prefix: "gicm"
  });
  const { initializeSLOManager: initializeSLOManager2, StandardSLOs: StandardSLOs2 } = await import("../slo-manager-JAVNYBYM.js");
  const sloManager = initializeSLOManager2({
    serviceName: config.serviceName,
    metricsRegistry: registry,
    logger
  });
  sloManager.registerSLO(StandardSLOs2.availability(99.9, 3600));
  sloManager.registerSLO(StandardSLOs2.latency(95, 1e3, 3600));
  sloManager.registerSLO(StandardSLOs2.errorRate(99.5, 3600));
  sloManager.start();
  logger.info("Observability stack initialized", {
    serviceName: config.serviceName,
    version: config.serviceVersion,
    environment: config.environment
  });
  return {
    telemetry,
    logger,
    registry,
    standard,
    sloManager
  };
}
async function shutdownObservability() {
  const { shutdownTelemetry: shutdownTelemetry2 } = await import("../telemetry-WYV2OVMA.js");
  const { destroyLogger: destroyLogger2 } = await import("../log-aggregator-TT22H6IO.js");
  const { shutdownSLOManager: shutdownSLOManager2 } = await import("../slo-manager-JAVNYBYM.js");
  shutdownSLOManager2();
  destroyLogger2();
  await shutdownTelemetry2();
}
export {
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  LogAggregator,
  MetricsRegistry,
  SLOManager,
  StandardMetrics,
  StandardSLOs,
  TelemetryManager,
  Trace,
  destroyLogger,
  getLogger,
  getMetricsRegistry,
  getSLOManager,
  getStandardMetrics,
  getTelemetry,
  initializeLogger,
  initializeMetrics,
  initializeObservability,
  initializeSLOManager,
  initializeTelemetry,
  shutdownObservability,
  shutdownSLOManager,
  shutdownTelemetry
};
//# sourceMappingURL=index.js.map