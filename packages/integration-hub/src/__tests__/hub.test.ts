/**
 * Integration Hub Tests
 * Phase 17B: Core Module Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { EventBus } from "../event-bus.js";
import { EngineManager } from "../engine-manager.js";

// Use vi.hoisted to create mocks that work with hoisted vi.mock calls
const { mockApiServer, mockContentScheduler, mockRegisterWorkflows } =
  vi.hoisted(() => ({
    mockApiServer: {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
    },
    mockContentScheduler: {
      start: vi.fn(),
      stop: vi.fn(),
    },
    mockRegisterWorkflows: vi.fn(),
  }));

// Mock external dependencies
vi.mock("../api/server.js", () => ({
  ApiServer: vi.fn().mockImplementation(() => mockApiServer),
}));

vi.mock("../workflows/index.js", () => ({
  registerWorkflows: mockRegisterWorkflows,
}));

vi.mock("../scheduler/content-scheduler.js", () => ({
  getContentScheduler: vi.fn().mockReturnValue(mockContentScheduler),
  ContentScheduler: vi.fn(),
}));

// Import after mocks are set up
import { IntegrationHub } from "../hub.js";

describe("IntegrationHub", () => {
  let hub: IntegrationHub;

  beforeEach(() => {
    // Reset mock implementations (must be done before clearing)
    mockApiServer.start = vi.fn().mockResolvedValue(undefined);
    mockApiServer.stop = vi.fn().mockResolvedValue(undefined);
    mockContentScheduler.start = vi.fn();
    mockContentScheduler.stop = vi.fn();
    mockRegisterWorkflows.mockReset();
  });

  afterEach(async () => {
    // Clean up any running hub
    if (hub) {
      try {
        await hub.stop();
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  // ===========================================================================
  // CONSTRUCTOR TESTS
  // ===========================================================================

  describe("constructor", () => {
    it("should initialize with default config", () => {
      hub = new IntegrationHub();

      const status = hub.getStatus();
      expect(status.apiPort).toBe(3001);
      expect(status.running).toBe(false);
    });

    it("should accept custom config", () => {
      hub = new IntegrationHub({
        apiPort: 4000,
        apiHost: "127.0.0.1",
        enableWorkflows: false,
        enableHealthChecks: false,
      });

      const status = hub.getStatus();
      expect(status.apiPort).toBe(4000);
    });

    it("should initialize event bus and engine manager", () => {
      hub = new IntegrationHub();

      expect(hub.getEventBus()).toBeInstanceOf(EventBus);
      expect(hub.getEngineManager()).toBeInstanceOf(EngineManager);
    });

    it("should initialize with no connected engines", () => {
      hub = new IntegrationHub();

      expect(hub.getBrain()).toBeUndefined();
      expect(hub.getMoneyEngine()).toBeUndefined();
      expect(hub.getGrowthEngine()).toBeUndefined();
      expect(hub.getProductEngine()).toBeUndefined();
    });
  });

  // ===========================================================================
  // START TESTS
  // ===========================================================================

  describe("start", () => {
    it("should start the hub successfully", async () => {
      hub = new IntegrationHub();

      await hub.start();

      const status = hub.getStatus();
      expect(status.running).toBe(true);
      expect(status.startedAt).not.toBeNull();
    });

    it("should start health checks when enabled", async () => {
      hub = new IntegrationHub({ enableHealthChecks: true });
      const engineManager = hub.getEngineManager();
      const startHealthChecksSpy = vi.spyOn(engineManager, "startHealthChecks");

      await hub.start();

      expect(startHealthChecksSpy).toHaveBeenCalled();
    });

    it("should not start health checks when disabled", async () => {
      hub = new IntegrationHub({ enableHealthChecks: false });
      const engineManager = hub.getEngineManager();
      const startHealthChecksSpy = vi.spyOn(engineManager, "startHealthChecks");

      await hub.start();

      expect(startHealthChecksSpy).not.toHaveBeenCalled();
    });

    it("should register workflows when enabled", async () => {
      hub = new IntegrationHub({ enableWorkflows: true });

      await hub.start();

      expect(mockRegisterWorkflows).toHaveBeenCalledWith(hub);
    });

    it("should not register workflows when disabled", async () => {
      hub = new IntegrationHub({ enableWorkflows: false });

      await hub.start();

      expect(mockRegisterWorkflows).not.toHaveBeenCalled();
    });

    it("should publish engine.started event", async () => {
      hub = new IntegrationHub();
      const eventBus = hub.getEventBus();
      const handler = vi.fn();
      eventBus.on("engine.started", handler);

      await hub.start();

      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.source).toBe("hub");
      expect(event.payload.engine).toBe("hub");
    });

    it("should not start twice", async () => {
      hub = new IntegrationHub();

      await hub.start();
      const firstStartedAt = hub.getStatus().startedAt;

      await hub.start();
      const secondStartedAt = hub.getStatus().startedAt;

      expect(firstStartedAt).toBe(secondStartedAt);
    });
  });

  // ===========================================================================
  // STOP TESTS
  // ===========================================================================

  describe("stop", () => {
    it("should stop the hub", async () => {
      hub = new IntegrationHub();
      await hub.start();
      expect(hub.getStatus().running).toBe(true);

      await hub.stop();

      expect(hub.getStatus().running).toBe(false);
    });

    it("should stop health checks", async () => {
      hub = new IntegrationHub({ enableHealthChecks: true });
      const engineManager = hub.getEngineManager();
      const stopHealthChecksSpy = vi.spyOn(engineManager, "stopHealthChecks");

      await hub.start();
      await hub.stop();

      expect(stopHealthChecksSpy).toHaveBeenCalled();
    });

    it("should publish engine.stopped event", async () => {
      hub = new IntegrationHub();
      await hub.start();

      const eventBus = hub.getEventBus();
      const handler = vi.fn();
      eventBus.on("engine.stopped", handler);

      await hub.stop();

      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.source).toBe("hub");
      expect(event.payload.engine).toBe("hub");
    });

    it("should not stop if not running", async () => {
      hub = new IntegrationHub();
      const eventBus = hub.getEventBus();
      const handler = vi.fn();
      eventBus.on("engine.stopped", handler);

      await hub.stop();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // ENGINE CONNECTION TESTS
  // ===========================================================================

  describe("engine connections", () => {
    beforeEach(() => {
      hub = new IntegrationHub();
    });

    describe("connectBrain", () => {
      it("should connect the brain", () => {
        const mockBrain = { id: "brain" } as any;

        hub.connectBrain(mockBrain);

        expect(hub.getBrain()).toBe(mockBrain);
      });

      it("should mark brain as connected in engine manager", () => {
        const mockBrain = { id: "brain" } as any;

        hub.connectBrain(mockBrain);

        const health = hub.getEngineManager().getHealth("brain");
        expect(health?.connected).toBe(true);
        expect(health?.status).toBe("healthy");
      });
    });

    describe("connectMoneyEngine", () => {
      it("should connect the money engine", () => {
        const mockEngine = {
          on: vi.fn(),
        } as any;

        hub.connectMoneyEngine(mockEngine);

        expect(hub.getMoneyEngine()).toBe(mockEngine);
      });

      it("should mark money engine as connected", () => {
        const mockEngine = { on: vi.fn() } as any;

        hub.connectMoneyEngine(mockEngine);

        const health = hub.getEngineManager().getHealth("money");
        expect(health?.connected).toBe(true);
      });

      it("should wire up trade events", () => {
        const mockEngine = { on: vi.fn() } as any;

        hub.connectMoneyEngine(mockEngine);

        expect(mockEngine.on).toHaveBeenCalledWith(
          "trade",
          expect.any(Function)
        );
      });

      it("should wire up alert events", () => {
        const mockEngine = { on: vi.fn() } as any;

        hub.connectMoneyEngine(mockEngine);

        expect(mockEngine.on).toHaveBeenCalledWith(
          "alert",
          expect.any(Function)
        );
      });

      it("should publish trade events to event bus", () => {
        const mockEngine = { on: vi.fn() } as any;
        hub.connectMoneyEngine(mockEngine);

        const eventBus = hub.getEventBus();
        const handler = vi.fn();
        eventBus.on("trade.executed", handler);

        // Get the trade handler that was registered
        const tradeHandler = mockEngine.on.mock.calls.find(
          (call: [string, Function]) => call[0] === "trade"
        )?.[1];

        // Simulate a trade event
        const mockTrade = {
          id: "trade-1",
          executedAt: Date.now(),
          side: "buy",
          symbol: "SOL",
          price: { toNumber: () => 100 },
          size: { toNumber: () => 1 },
          valueUsd: { toNumber: () => 100 },
          realizedPnL: { toNumber: () => 0 },
        };

        tradeHandler?.(mockTrade);

        expect(handler).toHaveBeenCalled();
      });
    });

    describe("connectGrowthEngine", () => {
      it("should connect the growth engine", () => {
        const mockEngine = { id: "growth" } as any;

        hub.connectGrowthEngine(mockEngine);

        expect(hub.getGrowthEngine()).toBe(mockEngine);
      });

      it("should mark growth engine as connected", () => {
        const mockEngine = { id: "growth" } as any;

        hub.connectGrowthEngine(mockEngine);

        const health = hub.getEngineManager().getHealth("growth");
        expect(health?.connected).toBe(true);
      });
    });

    describe("connectProductEngine", () => {
      it("should connect the product engine", () => {
        const mockEngine = { id: "product" } as any;

        hub.connectProductEngine(mockEngine);

        expect(hub.getProductEngine()).toBe(mockEngine);
      });

      it("should mark product engine as connected", () => {
        const mockEngine = { id: "product" } as any;

        hub.connectProductEngine(mockEngine);

        const health = hub.getEngineManager().getHealth("product");
        expect(health?.connected).toBe(true);
      });
    });
  });

  // ===========================================================================
  // STATUS TESTS
  // ===========================================================================

  describe("getStatus", () => {
    it("should return correct status when not running", () => {
      hub = new IntegrationHub();

      const status = hub.getStatus();

      expect(status).toEqual({
        running: false,
        startedAt: null,
        apiPort: 3001,
        engines: {
          healthy: 0,
          degraded: 0,
          offline: 6,
          total: 6,
        },
        workflows: 6,
      });
    });

    it("should return correct status when running", async () => {
      hub = new IntegrationHub();
      await hub.start();

      const status = hub.getStatus();

      expect(status.running).toBe(true);
      expect(status.startedAt).not.toBeNull();
      expect(status.apiPort).toBe(3001);
    });

    it("should return workflows count based on config", () => {
      hub = new IntegrationHub({ enableWorkflows: false });

      const status = hub.getStatus();

      expect(status.workflows).toBe(0);
    });

    it("should reflect connected engines in status", () => {
      hub = new IntegrationHub();
      hub.connectBrain({ id: "brain" } as any);
      hub.connectGrowthEngine({ id: "growth" } as any);

      const status = hub.getStatus();

      expect(status.engines.healthy).toBe(2);
      expect(status.engines.offline).toBe(4);
    });
  });

  // ===========================================================================
  // LIFECYCLE INTEGRATION TESTS
  // ===========================================================================

  describe("lifecycle integration", () => {
    it("should handle start/stop/start cycle", async () => {
      hub = new IntegrationHub();

      await hub.start();
      expect(hub.getStatus().running).toBe(true);

      await hub.stop();
      expect(hub.getStatus().running).toBe(false);

      await hub.start();
      expect(hub.getStatus().running).toBe(true);
    });

    it("should maintain engine connections after restart", async () => {
      hub = new IntegrationHub();
      hub.connectBrain({ id: "brain" } as any);

      await hub.start();
      await hub.stop();

      // Brain reference should still exist
      expect(hub.getBrain()).toBeDefined();
    });
  });
});
