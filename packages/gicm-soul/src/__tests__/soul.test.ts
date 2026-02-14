import { describe, it, expect, beforeEach } from "vitest";
import { SoulEngine } from "../soul-engine.js";
import type { Mode } from "../types.js";
import { FULL_SOUL_TOKEN_COST } from "../fragments.js";

describe("SoulEngine", () => {
  let engine: SoulEngine;

  beforeEach(() => {
    engine = new SoulEngine({ defaultMode: "BUILD", autoSwitch: true });
  });

  describe("classifyMode", () => {
    it('should classify "build a React component" as BUILD', () => {
      const result = engine.classifyMode("build a React component");
      expect(result.mode).toBe("BUILD");
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should classify "what\'s the weather" as VIBE', () => {
      const result = engine.classifyMode("what's the weather");
      expect(result.mode).toBe("VIBE");
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should classify "buy YES on election market" as TRADE', () => {
      const result = engine.classifyMode("buy YES on election market");
      expect(result.mode).toBe("TRADE");
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should classify "audit this smart contract" as AUDIT', () => {
      const result = engine.classifyMode("audit this smart contract");
      expect(result.mode).toBe("AUDIT");
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should classify "write a blog post" as CREATE', () => {
      const result = engine.classifyMode("write a blog post");
      expect(result.mode).toBe("CREATE");
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should classify "design system architecture" as THINK', () => {
      const result = engine.classifyMode("design system architecture");
      expect(result.mode).toBe("THINK");
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it("should use default mode when no match and confidence is low", () => {
      const result = engine.classifyMode("random gibberish xyz123");
      expect(result.mode).toBe("BUILD"); // default mode
      expect(result.confidence).toBeLessThanOrEqual(0.3);
    });

    it("should calculate token savings correctly", () => {
      const result = engine.classifyMode("build a function");
      expect(result.tokensSaved).toBeGreaterThan(0);
      expect(result.tokensSaved).toBe(FULL_SOUL_TOKEN_COST - 850); // BUILD costs 850
    });
  });

  describe("resolve", () => {
    it("should return correct fragment with token savings for BUILD mode", () => {
      const output = engine.resolve("create a new API endpoint");
      expect(output.mode).toBe("BUILD");
      expect(output.systemPrompt).toContain("BUILD MODE");
      expect(output.systemPrompt).toContain("precision code engineer");
      expect(output.tokenCount).toBe(850);
      expect(output.fullTokenCount).toBe(FULL_SOUL_TOKEN_COST);
      expect(output.savedPercent).toBeGreaterThan(70);
      expect(output.savedPercent).toBeLessThan(90);
    });

    it("should auto-switch mode when autoSwitch is enabled", () => {
      const output = engine.resolve("sell my tokens on Polymarket");
      expect(output.mode).toBe("TRADE");
      expect(engine.getCurrentMode()).toBe("TRADE");
    });

    it("should not auto-switch when autoSwitch is disabled", () => {
      const noAutoEngine = new SoulEngine({
        defaultMode: "BUILD",
        autoSwitch: false,
      });
      const output = noAutoEngine.resolve("write a poem");
      expect(output.mode).toBe("BUILD"); // stays in BUILD
      expect(noAutoEngine.getCurrentMode()).toBe("BUILD");
    });

    it("should emit mode:detected event when auto-switching", () => {
      const events: any[] = [];
      engine.on("mode:detected", (data) => {
        events.push(data);
      });
      engine.resolve("scan for vulnerabilities");
      expect(events.length).toBe(1);
      expect(events[0].mode).toBe("AUDIT");
      expect(events[0].confidence).toBeGreaterThan(0);
      expect(events[0].reasons).toBeDefined();
    });
  });

  describe("switchMode", () => {
    it("should manually switch mode", () => {
      const fragment = engine.switchMode("CREATE");
      expect(fragment.mode).toBe("CREATE");
      expect(engine.getCurrentMode()).toBe("CREATE");
    });

    it("should emit mode:switched event", () => {
      const events: any[] = [];
      engine.on("mode:switched", (data) => {
        events.push(data);
      });
      engine.switchMode("VIBE");
      expect(events.length).toBe(1);
      expect(events[0].from).toBe("BUILD");
      expect(events[0].to).toBe("VIBE");
      expect(events[0].fragment.mode).toBe("VIBE");
    });

    it("should return the correct fragment", () => {
      const fragment = engine.switchMode("THINK");
      expect(fragment.identity).toContain("systems architect");
      expect(fragment.tools).toContain("mermaid");
    });
  });

  describe("getCurrentMode", () => {
    it("should return the current mode", () => {
      expect(engine.getCurrentMode()).toBe("BUILD");
      engine.switchMode("TRADE");
      expect(engine.getCurrentMode()).toBe("TRADE");
    });
  });

  describe("getCurrentFragment", () => {
    it("should return the current fragment", () => {
      const fragment = engine.getCurrentFragment();
      expect(fragment).toBeDefined();
      expect(fragment?.mode).toBe("BUILD");
    });
  });

  describe("getTokenSavings", () => {
    it("should calculate token savings correctly", () => {
      engine.switchMode("VIBE"); // 650 tokens
      const savings = engine.getTokenSavings();
      expect(savings.current).toBe(650);
      expect(savings.full).toBe(FULL_SOUL_TOKEN_COST);
      expect(savings.savedPercent).toBeGreaterThan(75);
    });

    it("should show ~80% savings for typical modes", () => {
      const modes: Mode[] = ["BUILD", "THINK", "CREATE", "TRADE", "AUDIT"];
      for (const mode of modes) {
        engine.switchMode(mode);
        const savings = engine.getTokenSavings();
        expect(savings.savedPercent).toBeGreaterThan(70);
        expect(savings.savedPercent).toBeLessThan(90);
      }
    });
  });

  describe("configuration", () => {
    it("should use custom default mode", () => {
      const customEngine = new SoulEngine({ defaultMode: "TRADE" });
      expect(customEngine.getCurrentMode()).toBe("TRADE");
    });

    it("should update configuration", () => {
      engine.updateConfig({ autoSwitch: false });
      const config = engine.getConfig();
      expect(config.autoSwitch).toBe(false);
    });

    it("should get current configuration", () => {
      const config = engine.getConfig();
      expect(config.defaultMode).toBe("BUILD");
      expect(config.autoSwitch).toBe(true);
    });
  });

  describe("system prompt generation", () => {
    it("should include mode name in system prompt", () => {
      const output = engine.resolve("fix a bug");
      expect(output.systemPrompt).toContain("BUILD MODE");
    });

    it("should include identity text", () => {
      engine.switchMode("TRADE");
      const output = engine.resolve("buy tokens on polymarket");
      expect(output.systemPrompt).toContain("quantitative trading analyst");
    });

    it("should include response style", () => {
      const output = engine.resolve("implement feature");
      expect(output.systemPrompt).toContain("Response Style");
    });

    it("should include preferred tools", () => {
      const output = engine.resolve("write code");
      expect(output.systemPrompt).toContain("Preferred Tools");
      expect(output.systemPrompt).toContain("typescript");
    });
  });

  describe("edge cases", () => {
    it("should handle empty message", () => {
      const result = engine.classifyMode("");
      expect(result.mode).toBe("BUILD"); // default
      expect(result.confidence).toBe(0);
    });

    it("should handle very long message", () => {
      const longMessage = "build ".repeat(100) + "a component";
      const result = engine.classifyMode(longMessage);
      expect(result.mode).toBe("BUILD");
      expect(result.confidence).toBeGreaterThan(0);
    });

    it("should handle mixed signals", () => {
      const result = engine.classifyMode("build and audit a trading system");
      // Should pick the highest scoring mode
      expect(["BUILD", "AUDIT", "TRADE"]).toContain(result.mode);
    });
  });
});
