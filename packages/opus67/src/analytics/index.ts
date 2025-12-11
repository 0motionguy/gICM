/**
 * OPUS 67 v6.3.0 - Analytics Module
 *
 * Tool performance tracking and monitoring:
 * - Success/failure rate tracking
 * - Latency measurement (p50, p95, p99)
 * - Health status detection
 * - Performance recommendations
 */

export {
  ToolAnalytics,
  createToolAnalytics,
  wrapToolCall,
  DEFAULT_ANALYTICS_CONFIG,
  type ToolCallRecord,
  type ToolMetrics,
  type ToolAnalyticsConfig,
  type ToolAnalyticsEvents,
} from "./tool-tracker.js";
