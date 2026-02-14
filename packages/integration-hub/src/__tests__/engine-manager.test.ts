/**
 * Engine Manager Tests
 * Phase 17B: Core Module Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { EngineManager, type EngineId } from "../engine-manager.js";
import { EventBus } from "../event-bus.js";
import { createEngineEvent } from "./factories/event.factory.js";

describe("EngineManager", () => {
  let eventBus: EventBus;
  let engineManager: EngineManager;

  beforeEach(() => {
    eventBus = new EventBus();
    engineManager = new EngineManager(eventBus);
  });

  afterEach(() => {
    engineManager.stopHealthChecks();
  });

  // ===========================================================================
  // INITIALIZATION TESTS
  // ===========================================================================

  describe("initialization", () => {
    it("should initialize with all engines in offline state", () => {
      const allHealth = engineManager.getAllHealth();

      expect(allHealth).toHaveLength(6);
      for (const engine of allHealth) {
        expect(engine.connected).toBe(false);
        expect(engine.status).toBe("offline");
        expect(engine.lastHeartbeat).toBeNull();
      }
    });

    it("should initialize all expected engine IDs", () => {
      const engineIds: EngineId[] = [
        "brain",
        "money",
        "growth",
        "product",
        "trading",
        "opus67",
      ];

      for (const id of engineIds) {
        const health = engineManager.getHealth(id);
        expect(health).toBeDefined();
        expect(health?.id).toBe(id);
      }
    });

    it("should use default config values", () => {
      // Create with no config
      const manager = new EngineManager(eventBus);
      // Config values are private, but we can verify behavior with timers
      expect(manager).toBeDefined();
    });

    it("should use custom config values", () => {
      const customManager = new EngineManager(eventBus, {
        healthCheckInterval: 10000,
        heartbeatTimeout: 30000,
      });
      expect(customManager).toBeDefined();
    });
  });

  // ===========================================================================
  // HEARTBEAT TESTS
  // ===========================================================================

  describe("recordHeartbeat", () => {
    it("should update engine state on heartbeat", () => {
      engineManager.recordHeartbeat("brain");

      const health = engineManager.getHealth("brain");
      expect(health?.connected).toBe(true);
      expect(health?.status).toBe("healthy");
      expect(health?.lastHeartbeat).not.toBeNull();
      expect(health?.error).toBeUndefined();
    });

    it("should update lastHeartbeat timestamp", () => {
      const before = Date.now();
      engineManager.recordHeartbeat("money");
      const after = Date.now();

      const health = engineManager.getHealth("money");
      expect(health?.lastHeartbeat).toBeGreaterThanOrEqual(before);
      expect(health?.lastHeartbeat).toBeLessThanOrEqual(after);
    });

    it("should clear error on heartbeat", () => {
      engineManager.markError("growth", "Some error");
      expect(engineManager.getHealth("growth")?.error).toBe("Some error");

      engineManager.recordHeartbeat("growth");
      expect(engineManager.getHealth("growth")?.error).toBeUndefined();
    });

    it("should respond to heartbeat events", () => {
      const event = createEngineEvent("heartbeat");
      event.source = "product";

      eventBus.emit("engine.heartbeat", event);

      const health = engineManager.getHealth("product");
      expect(health?.connected).toBe(true);
      expect(health?.status).toBe("healthy");
    });
  });

  // ===========================================================================
  // CONNECTION STATE TESTS
  // ===========================================================================

  describe("markConnected", () => {
    it("should mark engine as connected and healthy", () => {
      engineManager.markConnected("brain");

      const health = engineManager.getHealth("brain");
      expect(health?.connected).toBe(true);
      expect(health?.status).toBe("healthy");
    });

    it("should respond to engine.started events", () => {
      const event = createEngineEvent("started");
      event.source = "money";

      eventBus.emit("engine.started", event);

      const health = engineManager.getHealth("money");
      expect(health?.connected).toBe(true);
      expect(health?.status).toBe("healthy");
    });
  });

  describe("markDisconnected", () => {
    it("should mark engine as disconnected and offline", () => {
      // First connect
      engineManager.markConnected("brain");
      expect(engineManager.getHealth("brain")?.status).toBe("healthy");

      // Then disconnect
      engineManager.markDisconnected("brain");

      const health = engineManager.getHealth("brain");
      expect(health?.connected).toBe(false);
      expect(health?.status).toBe("offline");
    });

    it("should respond to engine.stopped events", () => {
      engineManager.markConnected("growth");

      const event = createEngineEvent("stopped");
      event.source = "growth";

      eventBus.emit("engine.stopped", event);

      const health = engineManager.getHealth("growth");
      expect(health?.connected).toBe(false);
      expect(health?.status).toBe("offline");
    });
  });

  describe("markError", () => {
    it("should mark engine as degraded with error message", () => {
      engineManager.markError("trading", "Connection lost");

      const health = engineManager.getHealth("trading");
      expect(health?.status).toBe("degraded");
      expect(health?.error).toBe("Connection lost");
    });

    it("should emit engine.error event", () => {
      const handler = vi.fn();
      eventBus.on("engine.error", handler);

      engineManager.markError("brain", "Test error");

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toMatchObject({
        source: "brain",
        payload: { error: "Test error" },
      });
    });
  });

  // ===========================================================================
  // HEALTH CHECK TESTS
  // ===========================================================================

  describe("health checks", () => {
    it("should start health check timer", () => {
      vi.useFakeTimers();
      const setIntervalSpy = vi.spyOn(global, "setInterval");

      engineManager.startHealthChecks();

      expect(setIntervalSpy).toHaveBeenCalled();

      engineManager.stopHealthChecks();
      vi.useRealTimers();
    });

    it("should stop health check timer", () => {
      vi.useFakeTimers();
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      engineManager.startHealthChecks();
      engineManager.stopHealthChecks();

      expect(clearIntervalSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("should mark engine as degraded on heartbeat timeout", async () => {
      vi.useFakeTimers();
      // Create manager with short timeout
      const manager = new EngineManager(eventBus, {
        healthCheckInterval: 100,
        heartbeatTimeout: 50,
      });

      // Connect engine
      manager.markConnected("brain");
      expect(manager.getHealth("brain")?.status).toBe("healthy");

      // Start health checks
      manager.startHealthChecks();

      // Wait for health check to run
      await vi.advanceTimersByTimeAsync(150);

      const health = manager.getHealth("brain");
      expect(health?.status).toBe("degraded");
      expect(health?.error).toBe("Heartbeat timeout");

      manager.stopHealthChecks();
      vi.useRealTimers();
    });

    it("should not mark disconnected engine as degraded", async () => {
      vi.useFakeTimers();
      const manager = new EngineManager(eventBus, {
        healthCheckInterval: 100,
        heartbeatTimeout: 50,
      });

      // Engine stays disconnected
      expect(manager.getHealth("brain")?.connected).toBe(false);

      manager.startHealthChecks();
      await vi.advanceTimersByTimeAsync(150);

      // Should still be offline, not degraded
      expect(manager.getHealth("brain")?.status).toBe("offline");

      manager.stopHealthChecks();
      vi.useRealTimers();
    });
  });

  // ===========================================================================
  // QUERY TESTS
  // ===========================================================================

  describe("getAllHealth", () => {
    it("should return all engine health statuses", () => {
      const allHealth = engineManager.getAllHealth();

      expect(allHealth).toHaveLength(6);
      expect(allHealth.map((h) => h.id).sort()).toEqual([
        "brain",
        "growth",
        "money",
        "opus67",
        "product",
        "trading",
      ]);
    });

    it("should reflect current state changes", () => {
      engineManager.markConnected("brain");
      engineManager.markError("money", "Error");

      const allHealth = engineManager.getAllHealth();

      const brain = allHealth.find((h) => h.id === "brain");
      const money = allHealth.find((h) => h.id === "money");

      expect(brain?.status).toBe("healthy");
      expect(money?.status).toBe("degraded");
    });
  });

  describe("getHealth", () => {
    it("should return health for existing engine", () => {
      const health = engineManager.getHealth("brain");
      expect(health).toBeDefined();
      expect(health?.id).toBe("brain");
    });

    it("should return undefined for non-existent engine", () => {
      const health = engineManager.getHealth("nonexistent" as EngineId);
      expect(health).toBeUndefined();
    });
  });

  describe("getAggregatedStatus", () => {
    it("should return all offline when no engines connected", () => {
      const status = engineManager.getAggregatedStatus();

      expect(status).toEqual({
        healthy: 0,
        degraded: 0,
        offline: 6,
        total: 6,
      });
    });

    it("should count healthy engines correctly", () => {
      engineManager.markConnected("brain");
      engineManager.markConnected("money");

      const status = engineManager.getAggregatedStatus();

      expect(status.healthy).toBe(2);
      expect(status.offline).toBe(4);
    });

    it("should count degraded engines correctly", () => {
      engineManager.markConnected("brain");
      engineManager.markError("brain", "Error");
      engineManager.markConnected("money");

      const status = engineManager.getAggregatedStatus();

      expect(status.healthy).toBe(1);
      expect(status.degraded).toBe(1);
      expect(status.offline).toBe(4);
    });

    it("should have correct total", () => {
      const status = engineManager.getAggregatedStatus();
      expect(status.total).toBe(6);
      expect(status.healthy + status.degraded + status.offline).toBe(
        status.total
      );
    });
  });

  // ===========================================================================
  // LIFECYCLE TESTS
  // ===========================================================================

  describe("lifecycle", () => {
    it("should handle rapid state changes", () => {
      engineManager.markConnected("brain");
      engineManager.markDisconnected("brain");
      engineManager.markConnected("brain");
      engineManager.markError("brain", "Temp error");
      engineManager.recordHeartbeat("brain");

      const health = engineManager.getHealth("brain");
      expect(health?.status).toBe("healthy");
      expect(health?.error).toBeUndefined();
    });

    it("should handle all engines changing state", () => {
      const engines: EngineId[] = [
        "brain",
        "money",
        "growth",
        "product",
        "trading",
        "opus67",
      ];

      for (const id of engines) {
        engineManager.markConnected(id);
      }

      const status = engineManager.getAggregatedStatus();
      expect(status.healthy).toBe(6);
      expect(status.offline).toBe(0);

      for (const id of engines) {
        engineManager.markDisconnected(id);
      }

      const statusAfter = engineManager.getAggregatedStatus();
      expect(statusAfter.healthy).toBe(0);
      expect(statusAfter.offline).toBe(6);
    });
  });
});
