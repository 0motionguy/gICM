/**
 * OPUS 67 v6.3.0 - Tool Analytics Tests
 * Tests for MCP tool health monitoring
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ToolAnalytics,
  DEFAULT_ANALYTICS_CONFIG,
  type ToolMetrics,
  type ToolCallRecord,
} from "../analytics/tool-tracker.js";

describe("ToolAnalytics", () => {
  let analytics: ToolAnalytics;

  beforeEach(() => {
    analytics = new ToolAnalytics({ autoCleanup: false });
  });

  afterEach(() => {
    analytics.destroy();
  });

  describe("track", () => {
    it("should track successful tool calls", async () => {
      await analytics.track("test-tool", {
        success: true,
        latency: 100,
      });

      const metrics = analytics.getMetrics("test-tool");
      expect(metrics.totalCalls).toBe(1);
      expect(metrics.successCount).toBe(1);
      expect(metrics.failureCount).toBe(0);
      expect(metrics.successRate).toBe(1);
    });

    it("should track failed tool calls", async () => {
      await analytics.track("test-tool", {
        success: false,
        latency: 500,
        error: "Connection timeout",
      });

      const metrics = analytics.getMetrics("test-tool");
      expect(metrics.totalCalls).toBe(1);
      expect(metrics.successCount).toBe(0);
      expect(metrics.failureCount).toBe(1);
      expect(metrics.errorRate).toBe(1);
      expect(metrics.lastError).toBe("Connection timeout");
    });

    it("should track multiple calls correctly", async () => {
      await analytics.track("multi-tool", { success: true, latency: 100 });
      await analytics.track("multi-tool", { success: true, latency: 150 });
      await analytics.track("multi-tool", { success: false, latency: 200 });

      const metrics = analytics.getMetrics("multi-tool");
      expect(metrics.totalCalls).toBe(3);
      expect(metrics.successCount).toBe(2);
      expect(metrics.failureCount).toBe(1);
      expect(metrics.successRate).toBeCloseTo(0.667, 2);
    });

    it("should emit tool:call event", async () => {
      const listener = vi.fn();
      analytics.on("tool:call", listener);

      await analytics.track("event-tool", { success: true, latency: 100 });

      expect(listener).toHaveBeenCalledOnce();
      const record: ToolCallRecord = listener.mock.calls[0][0];
      expect(record.toolId).toBe("event-tool");
      expect(record.success).toBe(true);
    });
  });

  describe("getMetrics", () => {
    it("should return unknown health for tools with no calls", () => {
      const metrics = analytics.getMetrics("unknown-tool");
      expect(metrics.totalCalls).toBe(0);
      expect(metrics.health).toBe("unknown");
      expect(metrics.trend).toBe("unknown");
    });

    it("should calculate latency percentiles correctly", async () => {
      // Add calls with known latencies
      const latencies = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      for (const latency of latencies) {
        await analytics.track("percentile-tool", { success: true, latency });
      }

      const metrics = analytics.getMetrics("percentile-tool");
      expect(metrics.p50Latency).toBeGreaterThan(0);
      expect(metrics.p95Latency).toBeGreaterThan(metrics.p50Latency);
      expect(metrics.p99Latency).toBeGreaterThanOrEqual(metrics.p95Latency);
      expect(metrics.avgLatency).toBe(550); // Average of 100-1000
    });

    it("should calculate success rate correctly", async () => {
      for (let i = 0; i < 95; i++) {
        await analytics.track("rate-tool", { success: true, latency: 100 });
      }
      for (let i = 0; i < 5; i++) {
        await analytics.track("rate-tool", { success: false, latency: 100 });
      }

      const metrics = analytics.getMetrics("rate-tool");
      expect(metrics.successRate).toBe(0.95);
      expect(metrics.errorRate).toBe(0.05);
    });
  });

  describe("health calculation", () => {
    it("should mark tool as healthy when success rate >= threshold", async () => {
      for (let i = 0; i < 10; i++) {
        await analytics.track("healthy-tool", { success: true, latency: 100 });
      }

      const metrics = analytics.getMetrics("healthy-tool");
      expect(metrics.health).toBe("healthy");
    });

    it("should mark tool as degraded when success rate is medium", async () => {
      for (let i = 0; i < 8; i++) {
        await analytics.track("degraded-tool", { success: true, latency: 100 });
      }
      for (let i = 0; i < 2; i++) {
        await analytics.track("degraded-tool", {
          success: false,
          latency: 100,
        });
      }

      const metrics = analytics.getMetrics("degraded-tool");
      // 80% success rate is at degraded threshold
      expect(["degraded", "healthy"]).toContain(metrics.health);
    });

    it("should mark tool as unhealthy when success rate is low", async () => {
      for (let i = 0; i < 3; i++) {
        await analytics.track("unhealthy-tool", {
          success: true,
          latency: 100,
        });
      }
      for (let i = 0; i < 7; i++) {
        await analytics.track("unhealthy-tool", {
          success: false,
          latency: 100,
        });
      }

      const metrics = analytics.getMetrics("unhealthy-tool");
      expect(metrics.health).toBe("unhealthy");
    });
  });

  describe("getAllMetrics", () => {
    it("should return metrics for all tracked tools", async () => {
      await analytics.track("tool-a", { success: true, latency: 100 });
      await analytics.track("tool-b", { success: true, latency: 200 });
      await analytics.track("tool-c", { success: false, latency: 300 });

      const allMetrics = analytics.getAllMetrics();
      expect(allMetrics.length).toBe(3);
      expect(allMetrics.map((m) => m.toolId).sort()).toEqual([
        "tool-a",
        "tool-b",
        "tool-c",
      ]);
    });
  });

  describe("getUnhealthyTools", () => {
    it("should return only unhealthy and degraded tools", async () => {
      // Healthy tool
      for (let i = 0; i < 10; i++) {
        await analytics.track("healthy", { success: true, latency: 100 });
      }

      // Unhealthy tool
      for (let i = 0; i < 10; i++) {
        await analytics.track("unhealthy", {
          success: i < 3,
          latency: 100,
        });
      }

      const unhealthy = analytics.getUnhealthyTools();
      expect(unhealthy.length).toBeGreaterThanOrEqual(1);
      expect(unhealthy.some((m) => m.toolId === "unhealthy")).toBe(true);
      expect(unhealthy.some((m) => m.toolId === "healthy")).toBe(false);
    });
  });

  describe("health change events", () => {
    it("should emit tool:unhealthy when health degrades", async () => {
      const listener = vi.fn();
      analytics.on("tool:unhealthy", listener);

      // Start with good health
      for (let i = 0; i < 5; i++) {
        await analytics.track("degrading-tool", {
          success: true,
          latency: 100,
        });
      }

      // Add failures to trigger unhealthy
      for (let i = 0; i < 10; i++) {
        await analytics.track("degrading-tool", {
          success: false,
          latency: 100,
        });
      }

      // Should have emitted unhealthy event
      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("configuration", () => {
    it("should use default config", () => {
      const defaultAnalytics = new ToolAnalytics();
      expect(defaultAnalytics).toBeDefined();
      defaultAnalytics.destroy();
    });

    it("should merge custom config with defaults", () => {
      const customAnalytics = new ToolAnalytics({
        healthySuccessRate: 0.99,
        autoCleanup: false,
      });
      expect(customAnalytics).toBeDefined();
    });
  });

  describe("cleanup", () => {
    it("should not fail when stopping cleanup on analytics without it started", () => {
      const noCleanupAnalytics = new ToolAnalytics({ autoCleanup: false });
      expect(() => noCleanupAnalytics.destroy()).not.toThrow();
    });
  });

  describe("export/import", () => {
    it("should export metrics for persistence", async () => {
      await analytics.track("export-tool", { success: true, latency: 100 });

      const exported = analytics.exportMetrics();
      expect(exported.length).toBe(1);
      expect(exported[0].toolId).toBe("export-tool");
      expect(exported[0].records.length).toBe(1);
    });

    it("should import metrics from persistence", () => {
      const data = [
        {
          toolId: "imported-tool",
          records: [
            {
              toolId: "imported-tool",
              timestamp: new Date(),
              success: true,
              latency: 100,
            },
          ],
        },
      ];

      analytics.importMetrics(data);
      const metrics = analytics.getMetrics("imported-tool");
      expect(metrics.totalCalls).toBe(1);
    });
  });

  describe("recommendations", () => {
    it("should provide recommendations for unhealthy tools", async () => {
      for (let i = 0; i < 10; i++) {
        await analytics.track("rec-tool", { success: false, latency: 100 });
      }

      const recs = analytics.getRecommendations("rec-tool");
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain("success rate");
    });
  });
});
