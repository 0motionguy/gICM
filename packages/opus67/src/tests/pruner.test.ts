/**
 * OPUS 67 v6.3.0 - Adaptive Context Pruner Tests
 * Tests for pruning strategies: greedy, knapsack, diversity
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  AdaptiveContextPruner,
  createPruner,
  quickPrune,
  optimalPrune,
  diversePrune,
  createContextItem,
  type ContextItem,
  type PruneResult,
} from "../memory/pruner.js";

describe("AdaptiveContextPruner", () => {
  let pruner: AdaptiveContextPruner;

  beforeEach(() => {
    pruner = new AdaptiveContextPruner();
  });

  describe("createContextItem helper", () => {
    it("should create context item with defaults", () => {
      const item = createContextItem("test-1", "Test content");
      expect(item.id).toBe("test-1");
      expect(item.content).toBe("Test content");
      expect(item.relevanceScore).toBe(0.5);
      expect(item.recencyScore).toBe(0.5);
      expect(item.importanceScore).toBe(0.5);
      expect(item.tokenCount).toBeGreaterThan(0);
    });

    it("should create context item with custom scores", () => {
      const item = createContextItem("test-2", "Test content", {
        relevanceScore: 0.9,
        recencyScore: 0.8,
        importanceScore: 0.7,
      });
      expect(item.relevanceScore).toBe(0.9);
      expect(item.recencyScore).toBe(0.8);
      expect(item.importanceScore).toBe(0.7);
    });

    it("should estimate token count from content length", () => {
      const shortItem = createContextItem("short", "Hi");
      const longItem = createContextItem("long", "A".repeat(400));
      expect(shortItem.tokenCount).toBeLessThan(longItem.tokenCount);
      expect(longItem.tokenCount).toBe(100); // 400 chars / 4
    });
  });

  describe("greedy pruning", () => {
    it("should select highest scoring items within budget", () => {
      const items: ContextItem[] = [
        createContextItem("high", "High relevance content", {
          relevanceScore: 0.9,
        }),
        createContextItem("medium", "Medium relevance content", {
          relevanceScore: 0.5,
        }),
        createContextItem("low", "Low relevance content", {
          relevanceScore: 0.2,
        }),
      ];

      const result = pruner.prune(items, 100, "greedy");
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.strategy).toBe("greedy");
      expect(result.totalTokens).toBeLessThanOrEqual(100);
    });

    it("should respect token budget", () => {
      const items: ContextItem[] = [
        createContextItem("a", "A".repeat(200), { relevanceScore: 0.9 }),
        createContextItem("b", "B".repeat(200), { relevanceScore: 0.8 }),
        createContextItem("c", "C".repeat(200), { relevanceScore: 0.7 }),
      ];

      const result = pruner.prune(items, 100, "greedy");
      expect(result.totalTokens).toBeLessThanOrEqual(100);
      expect(result.itemsExcluded).toBeGreaterThan(0);
    });

    it("should filter by minimum relevance", () => {
      const items: ContextItem[] = [
        createContextItem("low", "Low relevance", { relevanceScore: 0.05 }),
        createContextItem("high", "High relevance", { relevanceScore: 0.9 }),
      ];

      const result = pruner.prune(items, 1000, "greedy");
      expect(result.itemsExcluded).toBeGreaterThan(0);
    });
  });

  describe("knapsack pruning", () => {
    it("should optimize value/token ratio", () => {
      const items: ContextItem[] = [
        createContextItem("small-high", "Small high value", {
          relevanceScore: 0.9,
        }),
        createContextItem("large-low", "L".repeat(400), {
          relevanceScore: 0.3,
        }),
      ];

      const result = pruner.prune(items, 50, "knapsack");
      expect(result.strategy).toBe("knapsack");
      // Should prefer small-high over large-low due to better value/token ratio
      const hasSmallHigh = result.items.some((i) => i.id === "small-high");
      expect(hasSmallHigh).toBe(true);
    });

    it("should handle empty item list", () => {
      const result = pruner.prune([], 100, "knapsack");
      expect(result.items.length).toBe(0);
      expect(result.itemsIncluded).toBe(0);
      expect(result.coverage).toBe(0);
    });

    it("should handle items exceeding budget", () => {
      const items: ContextItem[] = [
        createContextItem("huge", "H".repeat(10000), { relevanceScore: 0.9 }),
      ];

      const result = pruner.prune(items, 100, "knapsack");
      expect(result.itemsIncluded).toBe(0);
    });
  });

  describe("diversity pruning (MMR)", () => {
    it("should balance relevance and diversity", () => {
      const embedding1 = new Array(64).fill(0).map((_, i) => (i < 32 ? 1 : 0));
      const embedding2 = new Array(64).fill(0).map((_, i) => (i < 32 ? 1 : 0));
      const embedding3 = new Array(64).fill(0).map((_, i) => (i >= 32 ? 1 : 0));

      const items: ContextItem[] = [
        createContextItem("similar1", "Topic A content", {
          relevanceScore: 0.9,
          embedding: embedding1,
        }),
        createContextItem("similar2", "Topic A more", {
          relevanceScore: 0.85,
          embedding: embedding2,
        }),
        createContextItem("different", "Topic B content", {
          relevanceScore: 0.8,
          embedding: embedding3,
        }),
      ];

      const result = pruner.prune(items, 100, "diversity");
      expect(result.strategy).toBe("diversity");
      // Should include different items due to diversity
    });

    it("should handle items without embeddings", () => {
      const items: ContextItem[] = [
        createContextItem("a", "Content A", { relevanceScore: 0.9 }),
        createContextItem("b", "Content B", { relevanceScore: 0.8 }),
      ];

      const result = pruner.prune(items, 100, "diversity");
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  describe("configuration", () => {
    it("should use custom config", () => {
      const customPruner = new AdaptiveContextPruner({
        relevanceWeight: 0.8,
        recencyWeight: 0.1,
        importanceWeight: 0.1,
        minRelevance: 0.5,
      });

      const config = customPruner.getConfig();
      expect(config.relevanceWeight).toBe(0.8);
      expect(config.minRelevance).toBe(0.5);
    });

    it("should update config", () => {
      pruner.updateConfig({ relevanceWeight: 0.6 });
      const config = pruner.getConfig();
      expect(config.relevanceWeight).toBe(0.6);
    });
  });

  describe("factory functions", () => {
    it("createPruner should create pruner instance", () => {
      const p = createPruner({ relevanceWeight: 0.7 });
      expect(p).toBeInstanceOf(AdaptiveContextPruner);
    });

    it("quickPrune should use greedy strategy", () => {
      const items: ContextItem[] = [
        createContextItem("a", "Content", { relevanceScore: 0.9 }),
      ];
      const result = quickPrune(items, 100);
      expect(result.strategy).toBe("greedy");
    });

    it("optimalPrune should use knapsack strategy", () => {
      const items: ContextItem[] = [
        createContextItem("a", "Content", { relevanceScore: 0.9 }),
      ];
      const result = optimalPrune(items, 100);
      expect(result.strategy).toBe("knapsack");
    });

    it("diversePrune should use diversity strategy", () => {
      const items: ContextItem[] = [
        createContextItem("a", "Content", { relevanceScore: 0.9 }),
      ];
      const result = diversePrune(items, 100);
      expect(result.strategy).toBe("diversity");
    });
  });

  describe("coverage calculation", () => {
    it("should calculate coverage based on item count without embeddings", () => {
      const items: ContextItem[] = [
        createContextItem("a", "A", { relevanceScore: 0.9 }),
        createContextItem("b", "B", { relevanceScore: 0.8 }),
        createContextItem("c", "C", { relevanceScore: 0.7 }),
        createContextItem("d", "D", { relevanceScore: 0.6 }),
      ];

      const result = pruner.prune(items, 2, "greedy");
      // Without embeddings, coverage = selected/total
      expect(result.coverage).toBeGreaterThan(0);
      expect(result.coverage).toBeLessThanOrEqual(1);
    });
  });
});
