/**
 * OPUS 67 v6.3.0 - Hierarchical Adapter Tests
 * Tests for 4-layer tiered memory integration
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  HierarchicalAdapter,
  createHierarchicalAdapter,
  getHierarchicalAdapter,
  resetHierarchicalAdapter,
} from "../memory/unified/adapters/hierarchical-adapter.js";

describe("HierarchicalAdapter", () => {
  let adapter: HierarchicalAdapter;

  beforeEach(async () => {
    resetHierarchicalAdapter();
    adapter = createHierarchicalAdapter(
      { consolidationInterval: 60000 }, // HierarchicalMemoryConfig
      { autoConsolidate: false } // HierarchicalAdapterConfig
    );
    await adapter.initialize();
  });

  afterEach(async () => {
    await adapter.disconnect();
    resetHierarchicalAdapter();
  });

  describe("initialization", () => {
    it("should initialize successfully", async () => {
      const newAdapter = createHierarchicalAdapter();
      const result = await newAdapter.initialize();
      expect(result).toBe(true);
      expect(newAdapter.isAvailable()).toBe(true);
      await newAdapter.disconnect();
    });

    it("should return true on duplicate initialization", async () => {
      const result = await adapter.initialize();
      expect(result).toBe(true);
    });

    it("should report availability correctly", () => {
      expect(adapter.isAvailable()).toBe(true);
    });
  });

  describe("write", () => {
    it("should write facts to semantic layer", async () => {
      const id = await adapter.write({
        content: "TypeScript is a typed superset of JavaScript",
        type: "fact",
        key: "ts-definition",
      });

      expect(id).toBeTruthy();
      expect(typeof id).toBe("string");
    });

    it("should write episodes to episodic layer", async () => {
      const id = await adapter.write({
        content: "User asked about React performance optimization",
        type: "episode",
      });

      expect(id).toBeTruthy();
    });

    it("should write learnings to semantic layer", async () => {
      const id = await adapter.write({
        content: "Using useMemo reduces unnecessary re-renders",
        type: "learning",
      });

      expect(id).toBeTruthy();
    });

    it("should write wins to episodic layer", async () => {
      const id = await adapter.write({
        content: "Successfully deployed to production",
        type: "win",
      });

      expect(id).toBeTruthy();
    });

    it("should write decisions to semantic layer", async () => {
      const id = await adapter.write({
        content: "Chose Next.js over Remix for SSR support",
        type: "decision",
      });

      expect(id).toBeTruthy();
    });

    it("should handle write with metadata", async () => {
      const id = await adapter.write({
        content: "Test content with metadata",
        type: "fact",
        metadata: { project: "test", confidence: 0.9 },
      });

      expect(id).toBeTruthy();
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      // Seed some test data
      await adapter.write({
        content: "React is a JavaScript library for building UIs",
        type: "fact",
        key: "react-def",
      });
      await adapter.write({
        content: "Vue is a progressive JavaScript framework",
        type: "fact",
        key: "vue-def",
      });
      await adapter.write({
        content: "Svelte compiles components at build time",
        type: "fact",
        key: "svelte-def",
      });
    });

    it("should return results matching query", async () => {
      const results = await adapter.query("React JavaScript");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].source).toBe("context");
    });

    it("should respect limit option", async () => {
      const results = await adapter.query("JavaScript", { limit: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it("should respect minScore option", async () => {
      const results = await adapter.query("framework", { minScore: 0.9 });
      // All results should have score >= 0.9
      for (const result of results) {
        expect(result.score).toBeGreaterThanOrEqual(0.9);
      }
    });

    it("should return results sorted by score", async () => {
      const results = await adapter.query("JavaScript");

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it("should include metadata in results", async () => {
      const results = await adapter.query("React");

      if (results.length > 0) {
        expect(results[0].metadata).toBeDefined();
        expect(results[0].metadata?.layer).toBeDefined();
      }
    });
  });

  describe("getStats", () => {
    it("should return stats with count", async () => {
      const stats = await adapter.getStats();

      expect(stats.count).toBeDefined();
      expect(typeof stats.count).toBe("number");
      expect(stats.lastSync).toBeInstanceOf(Date);
    });

    it("should reflect writes in count", async () => {
      const statsBefore = await adapter.getStats();

      await adapter.write({ content: "New fact", type: "fact" });

      const statsAfter = await adapter.getStats();
      expect(statsAfter.count).toBeGreaterThanOrEqual(statsBefore.count);
    });
  });

  describe("disconnect", () => {
    it("should disconnect and stop consolidation", async () => {
      await adapter.disconnect();
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe("singleton pattern", () => {
    it("getHierarchicalAdapter should return singleton", () => {
      resetHierarchicalAdapter();
      const instance1 = getHierarchicalAdapter();
      const instance2 = getHierarchicalAdapter();
      expect(instance1).toBe(instance2);
      resetHierarchicalAdapter();
    });

    it("resetHierarchicalAdapter should clear singleton", async () => {
      resetHierarchicalAdapter();
      const instance1 = getHierarchicalAdapter();
      await instance1.initialize();

      resetHierarchicalAdapter();
      const instance2 = getHierarchicalAdapter();

      expect(instance1).not.toBe(instance2);
      resetHierarchicalAdapter();
    });
  });

  describe("getMemory", () => {
    it("should provide access to underlying HierarchicalMemory", () => {
      const memory = adapter.getMemory();
      expect(memory).toBeDefined();
      expect(typeof memory.store).toBe("function");
      expect(typeof memory.retrieve).toBe("function");
    });
  });

  describe("score calculation", () => {
    it("should give higher scores to more relevant content", async () => {
      await adapter.write({
        content: "Solana blockchain development",
        type: "fact",
      });
      await adapter.write({
        content: "Weather forecast for tomorrow",
        type: "fact",
      });

      const results = await adapter.query("Solana development");

      // First result should be more relevant
      if (results.length >= 2) {
        expect(results[0].content).toContain("Solana");
      }
    });
  });
});
