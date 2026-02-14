/**
 * @gicm/router - Intent Classifier Tests
 */

import { describe, it, expect } from "vitest";
import { classifyIntent } from "../intent.js";
import { DEFAULT_TIER_RULES } from "../tiers.js";

describe("classifyIntent", () => {
  describe("Tier 0 (Free/Regex)", () => {
    it("should classify 'what time is it' as Tier 0", () => {
      const tier = classifyIntent("what time is it", DEFAULT_TIER_RULES);
      expect(tier).toBe(0);
    });

    it("should classify 'what day is it' as Tier 0", () => {
      const tier = classifyIntent("what day is it today", DEFAULT_TIER_RULES);
      expect(tier).toBe(0);
    });

    it("should classify 'hello' as Tier 0", () => {
      const tier = classifyIntent("hello", DEFAULT_TIER_RULES);
      expect(tier).toBe(0);
    });

    it("should classify 'hi there' as Tier 0", () => {
      const tier = classifyIntent("hi there", DEFAULT_TIER_RULES);
      expect(tier).toBe(0);
    });

    it("should classify '2 + 2' as Tier 0", () => {
      const tier = classifyIntent("2 + 2", DEFAULT_TIER_RULES);
      expect(tier).toBe(0);
    });

    it("should classify '100 * 5' as Tier 0", () => {
      const tier = classifyIntent("100 * 5", DEFAULT_TIER_RULES);
      expect(tier).toBe(0);
    });
  });

  describe("Tier 1 (Cheap LLM)", () => {
    it("should classify 'summarize this email' as Tier 1", () => {
      const tier = classifyIntent(
        "summarize this email for me",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(1);
    });

    it("should classify 'translate to Spanish' as Tier 1", () => {
      const tier = classifyIntent(
        "translate this text to Spanish",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(1);
    });

    it("should classify 'format this list' as Tier 1", () => {
      const tier = classifyIntent(
        "format this list nicely",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(1);
    });

    it("should classify 'what is TypeScript' as Tier 1", () => {
      const tier = classifyIntent("what is TypeScript", DEFAULT_TIER_RULES);
      expect(tier).toBe(1);
    });

    it("should classify 'explain simply' as Tier 1", () => {
      const tier = classifyIntent(
        "explain simply how React works",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(1);
    });
  });

  describe("Tier 2 (Balanced)", () => {
    it("should classify 'refactor this function' as Tier 2", () => {
      const tier = classifyIntent(
        "refactor this function to be more efficient",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(2);
    });

    it("should classify 'review this PR' as Tier 2", () => {
      const tier = classifyIntent(
        "review this pull request",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(2);
    });

    it("should classify 'debug this code' as Tier 2", () => {
      const tier = classifyIntent(
        "debug this code that's failing",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(2);
    });

    it("should classify 'analyze this algorithm' as Tier 2", () => {
      const tier = classifyIntent(
        "analyze this algorithm complexity",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(2);
    });

    it("should classify 'implement a feature' as Tier 2", () => {
      const tier = classifyIntent(
        "implement a new feature for user auth",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(2);
    });

    it("should classify 'optimize performance' as Tier 2", () => {
      const tier = classifyIntent(
        "optimize the performance of this query",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(2);
    });
  });

  describe("Tier 3 (Premium)", () => {
    it("should classify 'design a distributed system architecture' as Tier 3", () => {
      const tier = classifyIntent(
        "design a distributed system architecture for millions of users",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3);
    });

    it("should classify 'security audit this contract' as Tier 3", () => {
      const tier = classifyIntent(
        "security audit this smart contract",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3);
    });

    it("should classify 'architect a blockchain solution' as Tier 3", () => {
      const tier = classifyIntent(
        "architect a blockchain solution for supply chain",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3);
    });

    it("should classify 'novel algorithm design' as Tier 3", () => {
      const tier = classifyIntent(
        "design a novel algorithm for graph optimization",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3);
    });

    it("should classify 'critical decision' as Tier 3", () => {
      const tier = classifyIntent(
        "help me make a critical decision about system architecture",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3);
    });

    it("should classify 'formal verification' as Tier 3", () => {
      const tier = classifyIntent(
        "perform formal verification on this protocol",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3);
    });
  });

  describe("Edge Cases", () => {
    it("should default to Tier 1 for unknown patterns", () => {
      const tier = classifyIntent(
        "something random that doesn't match",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(1);
    });

    it("should handle empty messages", () => {
      const tier = classifyIntent("", DEFAULT_TIER_RULES);
      expect(tier).toBe(1);
    });

    it("should be case-insensitive", () => {
      const tier1 = classifyIntent("REFACTOR THIS", DEFAULT_TIER_RULES);
      const tier2 = classifyIntent("refactor this", DEFAULT_TIER_RULES);
      expect(tier1).toBe(tier2);
      expect(tier1).toBe(2);
    });

    it("should prioritize Tier 3 over Tier 2 when both match", () => {
      const tier = classifyIntent(
        "architect and implement a distributed system",
        DEFAULT_TIER_RULES
      );
      expect(tier).toBe(3); // "architect" should win over "implement"
    });
  });
});
