/**
 * Workflows Tests
 * Phase 17B: Core Module Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { EventBus } from "../event-bus.js";

// Use vi.hoisted to create mocks that work with hoisted vi.mock calls
const { mockHub, mockEventBus, mockGrowthEngine, mockBrain } = vi.hoisted(
  () => ({
    mockEventBus: {
      on: vi.fn(),
      publish: vi.fn(),
    },
    mockGrowthEngine: {
      announceFeature: vi.fn().mockResolvedValue(undefined),
      generateNow: vi.fn().mockResolvedValue(undefined),
    },
    mockBrain: { id: "brain" },
    mockHub: {
      getEventBus: vi.fn(),
      getGrowthEngine: vi.fn(),
      getBrain: vi.fn(),
    },
  })
);

// Import after mocks are set up
import {
  registerWorkflows,
  getWorkflows,
  workflows,
  type Workflow,
} from "../workflows/index.js";

describe("Workflows", () => {
  beforeEach(() => {
    // Reset mocks
    mockEventBus.on.mockClear();
    mockEventBus.publish.mockClear();
    mockGrowthEngine.announceFeature.mockClear();
    mockGrowthEngine.announceFeature.mockResolvedValue(undefined);
    mockGrowthEngine.generateNow.mockClear();
    mockGrowthEngine.generateNow.mockResolvedValue(undefined);
    mockHub.getEventBus.mockReturnValue(mockEventBus);
    mockHub.getGrowthEngine.mockReturnValue(mockGrowthEngine);
    mockHub.getBrain.mockReturnValue(mockBrain);
  });

  // ===========================================================================
  // WORKFLOW DEFINITIONS TESTS
  // ===========================================================================

  describe("workflow definitions", () => {
    it("should have 7 workflows defined", () => {
      expect(workflows).toHaveLength(7);
    });

    it("should have feature-announcement workflow", () => {
      const workflow = workflows.find((w) => w.id === "feature-announcement");
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe("Feature Announcement");
      expect(workflow?.trigger).toBe("build.completed");
      expect(workflow?.enabled).toBe(true);
    });

    it("should have profitable-trade workflow", () => {
      const workflow = workflows.find((w) => w.id === "profitable-trade");
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe("Profitable Trade Tweet");
      expect(workflow?.trigger).toBe("trade.profit");
      expect(workflow?.enabled).toBe(true);
    });

    it("should have low-treasury-alert workflow", () => {
      const workflow = workflows.find((w) => w.id === "low-treasury-alert");
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe("Low Treasury Alert");
      expect(workflow?.trigger).toBe("treasury.critical");
      expect(workflow?.enabled).toBe(true);
    });

    it("should have daily-summary workflow", () => {
      const workflow = workflows.find((w) => w.id === "daily-summary");
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe("Daily Summary");
      expect(workflow?.trigger).toBe("brain.phase_completed");
      expect(workflow?.enabled).toBe(true);
    });

    it("should have unique IDs for all workflows", () => {
      const ids = workflows.map((w) => w.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid workflow structure for all workflows", () => {
      for (const workflow of workflows) {
        expect(workflow.id).toBeDefined();
        expect(workflow.name).toBeDefined();
        expect(workflow.description).toBeDefined();
        expect(workflow.trigger).toBeDefined();
        expect(typeof workflow.enabled).toBe("boolean");
        expect(typeof workflow.execute).toBe("function");
      }
    });
  });

  // ===========================================================================
  // GET WORKFLOWS TESTS
  // ===========================================================================

  describe("getWorkflows", () => {
    it("should return all workflows", () => {
      const result = getWorkflows();
      expect(result).toBe(workflows);
      expect(result).toHaveLength(7);
    });

    it("should return same reference as workflows array", () => {
      const result = getWorkflows();
      expect(result).toStrictEqual(workflows);
    });
  });

  // ===========================================================================
  // REGISTER WORKFLOWS TESTS
  // ===========================================================================

  describe("registerWorkflows", () => {
    it("should register enabled workflows with event bus", () => {
      registerWorkflows(mockHub as any);

      // Should register handlers for all enabled workflows
      const enabledCount = workflows.filter((w) => w.enabled).length;
      expect(mockEventBus.on).toHaveBeenCalledTimes(enabledCount);
    });

    it("should register correct event types", () => {
      registerWorkflows(mockHub as any);

      const registeredEvents = mockEventBus.on.mock.calls.map(
        (call) => call[0]
      );
      expect(registeredEvents).toContain("build.completed");
      expect(registeredEvents).toContain("trade.profit");
      expect(registeredEvents).toContain("treasury.critical");
      expect(registeredEvents).toContain("brain.phase_completed");
    });
  });

  // ===========================================================================
  // FEATURE ANNOUNCEMENT WORKFLOW TESTS
  // ===========================================================================

  describe("feature-announcement workflow", () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = workflows.find((w) => w.id === "feature-announcement")!;
    });

    it("should announce feature when payload has name", async () => {
      await workflow.execute(mockHub as any, {
        name: "New Feature",
        description: "A great new feature",
      });

      expect(mockGrowthEngine.announceFeature).toHaveBeenCalledWith({
        name: "New Feature",
        description: "A great new feature",
      });
    });

    it("should use default description when not provided", async () => {
      await workflow.execute(mockHub as any, {
        name: "New Feature",
      });

      expect(mockGrowthEngine.announceFeature).toHaveBeenCalledWith({
        name: "New Feature",
        description: "New feature deployed!",
      });
    });

    it("should not announce when name is missing", async () => {
      await workflow.execute(mockHub as any, {
        description: "No name provided",
      });

      expect(mockGrowthEngine.announceFeature).not.toHaveBeenCalled();
    });

    it("should not announce when growth engine is unavailable", async () => {
      mockHub.getGrowthEngine.mockReturnValue(undefined);

      await workflow.execute(mockHub as any, {
        name: "New Feature",
      });

      expect(mockGrowthEngine.announceFeature).not.toHaveBeenCalled();
    });

    it("should publish content.published event on success", async () => {
      await workflow.execute(mockHub as any, {
        name: "New Feature",
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "workflow",
        "content.published",
        expect.objectContaining({
          workflow: "feature-announcement",
          feature: "New Feature",
        })
      );
    });

    it("should handle errors gracefully", async () => {
      mockGrowthEngine.announceFeature.mockRejectedValue(
        new Error("API error")
      );

      // Should not throw
      await expect(
        workflow.execute(mockHub as any, { name: "New Feature" })
      ).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // PROFITABLE TRADE WORKFLOW TESTS
  // ===========================================================================

  describe("profitable-trade workflow", () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = workflows.find((w) => w.id === "profitable-trade")!;
    });

    it("should generate tweet for profit above threshold", async () => {
      await workflow.execute(mockHub as any, {
        profit: 150,
        symbol: "SOL",
      });

      expect(mockGrowthEngine.generateNow).toHaveBeenCalledWith("tweet");
    });

    it("should not tweet for profit below threshold", async () => {
      await workflow.execute(mockHub as any, {
        profit: 50,
        symbol: "SOL",
      });

      expect(mockGrowthEngine.generateNow).not.toHaveBeenCalled();
    });

    it("should tweet for exactly threshold profit", async () => {
      // Workflow triggers for profit >= 100 (profit < 100 returns early)
      await workflow.execute(mockHub as any, {
        profit: 100,
        symbol: "SOL",
      });

      expect(mockGrowthEngine.generateNow).toHaveBeenCalledWith("tweet");
    });

    it("should not tweet when profit is undefined", async () => {
      await workflow.execute(mockHub as any, {
        symbol: "SOL",
      });

      expect(mockGrowthEngine.generateNow).not.toHaveBeenCalled();
    });

    it("should not tweet when growth engine is unavailable", async () => {
      mockHub.getGrowthEngine.mockReturnValue(undefined);

      await workflow.execute(mockHub as any, {
        profit: 200,
        symbol: "SOL",
      });

      expect(mockGrowthEngine.generateNow).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockGrowthEngine.generateNow.mockRejectedValue(new Error("Tweet failed"));

      await expect(
        workflow.execute(mockHub as any, { profit: 200, symbol: "SOL" })
      ).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // LOW TREASURY ALERT WORKFLOW TESTS
  // ===========================================================================

  describe("low-treasury-alert workflow", () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = workflows.find((w) => w.id === "low-treasury-alert")!;
    });

    it("should publish engine.error event with treasury info", async () => {
      await workflow.execute(mockHub as any, {
        totalUsd: 500,
        threshold: 1000,
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "workflow",
        "engine.error",
        expect.objectContaining({
          workflow: "low-treasury-alert",
          message: "Treasury critically low - manual review required",
          totalUsd: 500,
        })
      );
    });

    it("should not act when brain is unavailable", async () => {
      mockHub.getBrain.mockReturnValue(undefined);

      await workflow.execute(mockHub as any, {
        totalUsd: 500,
        threshold: 1000,
      });

      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    it("should handle missing payload values", async () => {
      await workflow.execute(mockHub as any, {});

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "workflow",
        "engine.error",
        expect.objectContaining({
          workflow: "low-treasury-alert",
          totalUsd: undefined,
        })
      );
    });
  });

  // ===========================================================================
  // DAILY SUMMARY WORKFLOW TESTS
  // ===========================================================================

  describe("daily-summary workflow", () => {
    let workflow: Workflow;

    beforeEach(() => {
      workflow = workflows.find((w) => w.id === "daily-summary")!;
    });

    it("should generate thread for night_summary phase", async () => {
      await workflow.execute(mockHub as any, {
        phase: "night_summary",
      });

      expect(mockGrowthEngine.generateNow).toHaveBeenCalledWith("thread");
    });

    it("should not generate for other phases", async () => {
      await workflow.execute(mockHub as any, {
        phase: "morning_analysis",
      });

      expect(mockGrowthEngine.generateNow).not.toHaveBeenCalled();
    });

    it("should not generate when phase is undefined", async () => {
      await workflow.execute(mockHub as any, {});

      expect(mockGrowthEngine.generateNow).not.toHaveBeenCalled();
    });

    it("should not generate when growth engine is unavailable", async () => {
      mockHub.getGrowthEngine.mockReturnValue(undefined);

      await workflow.execute(mockHub as any, {
        phase: "night_summary",
      });

      expect(mockGrowthEngine.generateNow).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockGrowthEngine.generateNow.mockRejectedValue(
        new Error("Thread failed")
      );

      await expect(
        workflow.execute(mockHub as any, { phase: "night_summary" })
      ).resolves.not.toThrow();
    });
  });
});

// =============================================================================
// CONTENT WORKFLOW TESTS
// =============================================================================

// Note: Content workflow tests are simplified to avoid LLM API calls.
// The content.ts module makes real LLM calls which are difficult to mock
// without significant restructuring. We test the core workflow behaviors
// through the workflow definitions tests above.

describe("Content Workflows Module", () => {
  it("should export generateContentBriefsDaily function", async () => {
    // Dynamic import to avoid side effects
    const { generateContentBriefsDaily } = await import(
      "../workflows/content.js"
    );
    expect(typeof generateContentBriefsDaily).toBe("function");
  });

  it("should export materializeContentFromBriefs function", async () => {
    const { materializeContentFromBriefs } = await import(
      "../workflows/content.js"
    );
    expect(typeof materializeContentFromBriefs).toBe("function");
  });
});
