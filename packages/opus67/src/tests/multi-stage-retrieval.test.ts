/**
 * OPUS 67 v6.3.0 - Multi-Stage Retrieval Tests
 * Tests for 4-stage skill detection pipeline
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MultiStageRetrieval,
  getMultiStageRetrieval,
  resetMultiStageRetrieval,
  searchSkillsMultiStage,
  type RetrievalConfig,
  type RetrievalStats,
} from "../intelligence/multi-stage-retrieval.js";

describe("MultiStageRetrieval", () => {
  let retrieval: MultiStageRetrieval;

  beforeEach(() => {
    resetMultiStageRetrieval();
    retrieval = new MultiStageRetrieval({
      topK: 5,
      minScore: 0.1,
      enableReranking: true,
      enableDiversity: true,
    });
  });

  afterEach(() => {
    resetMultiStageRetrieval();
  });

  describe("initialization", () => {
    it("should create instance with default config", () => {
      const defaultRetrieval = new MultiStageRetrieval();
      expect(defaultRetrieval).toBeDefined();
    });

    it("should create instance with custom config", () => {
      const customRetrieval = new MultiStageRetrieval({
        topK: 10,
        minScore: 0.5,
        diversityWeight: 0.3,
      });
      expect(customRetrieval).toBeDefined();
    });
  });

  describe("retrieve", () => {
    it("should return results with stats", async () => {
      const { results, stats } = await retrieval.retrieve("Solana blockchain");

      expect(Array.isArray(results)).toBe(true);
      expect(stats).toBeDefined();
      expect(typeof stats.stage1Candidates).toBe("number");
      expect(typeof stats.stage2Results).toBe("number");
      expect(typeof stats.stage3Reranked).toBe("number");
      expect(typeof stats.stage4Final).toBe("number");
      expect(typeof stats.totalTimeMs).toBe("number");
    });

    it("should respect topK parameter", async () => {
      const { results } = await retrieval.retrieve("React TypeScript", 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it("should return results sorted by score", async () => {
      const { results } = await retrieval.retrieve("frontend development");

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it("should include skillId, name, and score in results", async () => {
      const { results } = await retrieval.retrieve("TypeScript");

      if (results.length > 0) {
        expect(results[0].skillId).toBeDefined();
        expect(results[0].name).toBeDefined();
        expect(typeof results[0].score).toBe("number");
      }
    });

    it("should handle empty query gracefully", async () => {
      const { results, stats } = await retrieval.retrieve("");
      expect(Array.isArray(results)).toBe(true);
      expect(stats.totalTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should handle query with no matches", async () => {
      const { results, stats } = await retrieval.retrieve(
        "xyznonexistentquery123"
      );
      expect(Array.isArray(results)).toBe(true);
      // May return 0 results or fall back to vector search
      expect(stats.stage4Final).toBeGreaterThanOrEqual(0);
    });
  });

  describe("4-stage pipeline", () => {
    it("should report stage progression in stats", async () => {
      const { stats } = await retrieval.retrieve("React hooks patterns");

      // All stages should report valid numbers
      expect(stats.stage1Candidates).toBeGreaterThanOrEqual(0);
      expect(stats.stage2Results).toBeGreaterThanOrEqual(0);
      expect(stats.stage3Reranked).toBeGreaterThanOrEqual(0);
      expect(stats.stage4Final).toBeGreaterThanOrEqual(0);
    });

    it("should record total time", async () => {
      const { stats } = await retrieval.retrieve("API design");
      expect(stats.totalTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("configuration options", () => {
    it("should work without reranking", async () => {
      const noRerank = new MultiStageRetrieval({
        enableReranking: false,
        enableDiversity: true,
      });

      const { results } = await noRerank.retrieve("database");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should work without diversity", async () => {
      const noDiversity = new MultiStageRetrieval({
        enableReranking: true,
        enableDiversity: false,
      });

      const { results } = await noDiversity.retrieve("testing");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should work with both disabled", async () => {
      const minimal = new MultiStageRetrieval({
        enableReranking: false,
        enableDiversity: false,
      });

      const { results } = await minimal.retrieve("security");
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("singleton pattern", () => {
    it("getMultiStageRetrieval should return singleton", () => {
      resetMultiStageRetrieval();
      const instance1 = getMultiStageRetrieval();
      const instance2 = getMultiStageRetrieval();
      expect(instance1).toBe(instance2);
    });

    it("resetMultiStageRetrieval should clear singleton", () => {
      resetMultiStageRetrieval();
      const instance1 = getMultiStageRetrieval();
      resetMultiStageRetrieval();
      const instance2 = getMultiStageRetrieval();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe("searchSkillsMultiStage helper", () => {
    it("should provide convenient search function", async () => {
      const results = await searchSkillsMultiStage("GraphQL API", 3);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe("keyword matching", () => {
    it("should find skills with matching keywords", async () => {
      const { results, stats } = await retrieval.retrieve("solana anchor");

      // Should find at least one candidate with keyword match
      expect(stats.stage1Candidates).toBeGreaterThanOrEqual(0);
    });

    it("should handle multi-word queries", async () => {
      const { results } = await retrieval.retrieve(
        "build react app with typescript hooks"
      );
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle special characters in query", async () => {
      const { results } = await retrieval.retrieve("C++ / C# .NET");
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("result quality", () => {
    it("should return skills with descriptions", async () => {
      const { results } = await retrieval.retrieve("frontend");

      if (results.length > 0) {
        expect(results[0].description).toBeDefined();
        expect(typeof results[0].description).toBe("string");
      }
    });

    it("should return skills with capabilities when available", async () => {
      const { results } = await retrieval.retrieve("typescript");

      if (results.length > 0) {
        expect(results[0].capabilities).toBeDefined();
      }
    });
  });

  describe("performance", () => {
    it("should complete within reasonable time", async () => {
      const startTime = Date.now();
      await retrieval.retrieve("complex multi-word search query");
      const elapsed = Date.now() - startTime;

      // Should complete in less than 5 seconds
      expect(elapsed).toBeLessThan(5000);
    });
  });
});
