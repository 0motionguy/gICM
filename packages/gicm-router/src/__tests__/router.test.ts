/**
 * @gicm/router - SmartRouter Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SmartRouter } from "../router.js";
import type { RouteRequest } from "../types.js";

describe("SmartRouter", () => {
  let router: SmartRouter;

  beforeEach(() => {
    router = new SmartRouter();
    router.resetStats();
  });

  describe("Basic Routing", () => {
    it("should route simple messages to Tier 1", () => {
      const result = router.route({
        message: "summarize this text",
      });

      expect(result.tier).toBe(1);
      expect(result.model).toBe("anthropic/claude-3-haiku-20240307");
      expect(result.fromCache).toBe(false);
    });

    it("should route code tasks to Tier 2", () => {
      const result = router.route({
        message: "refactor this function",
      });

      expect(result.tier).toBe(2);
      expect(result.model).toBe("anthropic/claude-sonnet-4.5-20250514");
    });

    it("should route architecture tasks to Tier 3", () => {
      const result = router.route({
        message: "design a distributed system architecture",
      });

      expect(result.tier).toBe(3);
      expect(result.model).toBe("anthropic/claude-opus-4-6-20250514");
    });

    it("should route trivial tasks to Tier 0", () => {
      const result = router.route({
        message: "what time is it",
      });

      expect(result.tier).toBe(0);
      expect(result.model).toBe("regex");
      expect(result.estimatedCostPer1k).toBe(0);
    });
  });

  describe("Forced Tier Override", () => {
    it("should use forced tier when specified", () => {
      const result = router.route({
        message: "summarize this",
        forceTier: 3,
      });

      expect(result.tier).toBe(3);
      expect(result.reason).toBe("forced-tier");
      expect(result.model).toBe("anthropic/claude-opus-4-6-20250514");
    });

    it("should override intent classification with forceTier", () => {
      const result = router.route({
        message: "what time is it", // Would be Tier 0
        forceTier: 2,
      });

      expect(result.tier).toBe(2);
      expect(result.model).toBe("anthropic/claude-sonnet-4.5-20250514");
    });
  });

  describe("Session Pinning", () => {
    it("should pin model to session on first request", () => {
      const sessionId = "test-session-1";

      const result1 = router.route({
        message: "refactor this",
        sessionId,
      });

      expect(result1.tier).toBe(2);
      expect(result1.fromCache).toBe(false);

      // Second request should use same model
      const result2 = router.route({
        message: "summarize this", // Different tier
        sessionId,
      });

      expect(result2.model).toBe(result1.model);
      expect(result2.fromCache).toBe(true);
      expect(result2.reason).toBe("session-pinned");
    });

    it("should use different models for different sessions", () => {
      const result1 = router.route({
        message: "refactor this",
        sessionId: "session-1",
      });

      const result2 = router.route({
        message: "summarize this",
        sessionId: "session-2",
      });

      expect(result1.model).not.toBe(result2.model);
      expect(result1.tier).toBe(2);
      expect(result2.tier).toBe(1);
    });

    it("should allow clearing a session pin", () => {
      const sessionId = "test-session-clear";

      router.route({
        message: "refactor this",
        sessionId,
      });

      router.clearSession(sessionId);

      const result = router.route({
        message: "summarize this",
        sessionId,
      });

      expect(result.fromCache).toBe(false);
      expect(result.tier).toBe(1);
    });

    it("should allow clearing all sessions", () => {
      router.route({ message: "refactor this", sessionId: "s1" });
      router.route({ message: "refactor this", sessionId: "s2" });

      router.clearAllSessions();

      const result = router.route({
        message: "summarize this",
        sessionId: "s1",
      });

      expect(result.fromCache).toBe(false);
    });
  });

  describe("Model Health Tracking", () => {
    it("should mark model unhealthy after 3 errors", () => {
      const model = "anthropic/claude-sonnet-4.5-20250514";

      // Report 3 errors
      router.setModelHealth(model, false);
      router.setModelHealth(model, false);
      router.setModelHealth(model, false);

      const health = router.getModelHealth(model);
      expect(health?.healthy).toBe(false);
      expect(health?.errorCount).toBe(3);
    });

    it("should fall back to next model when primary is unhealthy", () => {
      const primaryModel = "anthropic/claude-sonnet-4.5-20250514";

      // Mark primary unhealthy
      router.setModelHealth(primaryModel, false);
      router.setModelHealth(primaryModel, false);
      router.setModelHealth(primaryModel, false);

      const result = router.route({
        message: "refactor this function",
      });

      // Should use fallback
      expect(result.tier).toBe(2);
      expect(result.model).not.toBe(primaryModel);
      expect(result.model).toBe("openai/gpt-4o"); // First fallback
    });

    it("should reset health when model recovers", () => {
      const model = "anthropic/claude-sonnet-4.5-20250514";

      // Mark unhealthy
      router.setModelHealth(model, false);
      router.setModelHealth(model, false);
      router.setModelHealth(model, false);

      expect(router.getModelHealth(model)?.healthy).toBe(false);

      // Mark healthy again
      router.setModelHealth(model, true);

      const health = router.getModelHealth(model);
      expect(health?.healthy).toBe(true);
      expect(health?.errorCount).toBe(0);
    });

    it("should emit health:changed event", () => {
      const model = "anthropic/claude-3-haiku-20240307";
      const events: any[] = [];

      router.on("health:changed", (event) => {
        events.push(event);
      });

      // Mark unhealthy
      router.setModelHealth(model, false);
      router.setModelHealth(model, false);
      router.setModelHealth(model, false);

      expect(events.length).toBe(1);
      expect(events[0].model).toBe(model);
      expect(events[0].healthy).toBe(false);

      // Mark healthy
      router.setModelHealth(model, true);

      expect(events.length).toBe(2);
      expect(events[1].healthy).toBe(true);
    });
  });

  describe("Statistics Tracking", () => {
    it("should track total requests", () => {
      router.route({ message: "test 1" });
      router.route({ message: "test 2" });
      router.route({ message: "test 3" });

      const stats = router.getStats();
      expect(stats.totalRequests).toBe(3);
    });

    it("should track requests by tier", () => {
      router.route({ message: "summarize this" }); // Tier 1
      router.route({ message: "refactor this" }); // Tier 2
      router.route({ message: "refactor this" }); // Tier 2

      const stats = router.getStats();
      expect(stats.byTier[1]).toBe(1);
      expect(stats.byTier[2]).toBe(2);
    });

    it("should track requests by model", () => {
      router.route({ message: "summarize this" });
      router.route({ message: "summarize this" });
      router.route({ message: "refactor this" });

      const stats = router.getStats();
      expect(stats.byModel["anthropic/claude-3-haiku-20240307"]).toBe(2);
      expect(stats.byModel["anthropic/claude-sonnet-4.5-20250514"]).toBe(1);
    });

    it("should track cache hits", () => {
      const sessionId = "test-cache";

      router.route({ message: "refactor this", sessionId });
      router.route({ message: "summarize this", sessionId }); // Cache hit

      const stats = router.getStats();
      expect(stats.cacheHits).toBe(1);
    });

    it("should calculate average latency", () => {
      router.route({ message: "test 1" });
      router.route({ message: "test 2" });
      router.route({ message: "test 3" });

      const stats = router.getStats();
      expect(stats.avgLatency).toBeGreaterThanOrEqual(0);
      expect(stats.avgLatency).toBeLessThan(100); // Should be very fast
    });

    it("should reset stats", () => {
      router.route({ message: "test 1" });
      router.route({ message: "test 2" });

      expect(router.getStats().totalRequests).toBe(2);

      router.resetStats();

      const stats = router.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.avgLatency).toBe(0);
    });
  });

  describe("Events", () => {
    it("should emit route:selected event", () => {
      const events: any[] = [];

      router.on("route:selected", (event) => {
        events.push(event);
      });

      router.route({ message: "summarize this" });

      expect(events.length).toBe(1);
      expect(events[0].model).toBe("anthropic/claude-3-haiku-20240307");
      expect(events[0].tier).toBe(1);
    });

    it("should emit route:fallback event when falling back", () => {
      const events: any[] = [];

      router.on("route:fallback", (event) => {
        events.push(event);
      });

      // Mark primary unhealthy
      const primary = "anthropic/claude-sonnet-4.5-20250514";
      router.setModelHealth(primary, false);
      router.setModelHealth(primary, false);
      router.setModelHealth(primary, false);

      router.route({ message: "refactor this" });

      expect(events.length).toBe(1);
      expect(events[0].from).toBe(primary);
      expect(events[0].to).toBe("openai/gpt-4o");
      expect(events[0].tier).toBe(2);
    });
  });

  describe("Cost Estimation", () => {
    it("should estimate zero cost for Tier 0", () => {
      const result = router.route({ message: "what time is it" });
      expect(result.estimatedCostPer1k).toBe(0);
    });

    it("should estimate low cost for Tier 1", () => {
      const result = router.route({ message: "summarize this" });
      expect(result.estimatedCostPer1k).toBeLessThan(0.001);
    });

    it("should estimate higher cost for Tier 3", () => {
      const result = router.route({ message: "architect a system" });
      expect(result.estimatedCostPer1k).toBeGreaterThan(0.01);
    });
  });

  describe("Custom Configuration", () => {
    it("should use custom default tier", () => {
      const customRouter = new SmartRouter({
        defaultTier: 2,
      });

      const result = customRouter.route({
        message: "something random",
      });

      expect(result.tier).toBe(2);
    });

    it("should support disabling session pinning", () => {
      const customRouter = new SmartRouter({
        sessionPinning: false,
      });

      const sessionId = "test";

      const result1 = customRouter.route({
        message: "refactor this",
        sessionId,
      });

      const result2 = customRouter.route({
        message: "summarize this",
        sessionId,
      });

      expect(result2.fromCache).toBe(false);
      expect(result2.tier).toBe(1); // Should use intent classification
    });
  });
});
