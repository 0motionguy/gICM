/**
 * @fileoverview Unit tests for Budget Enforcer
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  checkBudget,
  recordSpend,
  getDailySpend,
  resetDailyBudgets,
  setAgentDailyLimit,
  getAgentBudget,
  getAllBudgets,
  deleteAgentBudget,
  configureBudget,
  resetBudgetConfig,
  getBudgetPath,
  setDefaultDailyLimit,
  getDefaultDailyLimit,
  type AgentBudget,
} from "../budget";
import { configureLogger, resetLoggerConfig } from "../logger";

describe("Budget Enforcer", () => {
  let testDir: string;
  let testBudgetFile: string;
  let testLogDir: string;

  beforeEach(() => {
    // Create unique test directories
    const uniqueId = Date.now() + "-" + Math.random().toString(36).slice(2);
    testDir = path.join(os.tmpdir(), "awcn-budget-test-" + uniqueId);
    testBudgetFile = "test-budgets.json";
    testLogDir = path.join(os.tmpdir(), "awcn-budget-logs-" + uniqueId);

    configureBudget(testDir, testBudgetFile);
    configureLogger(testLogDir, "test-events.ndjson");

    // Reset default daily limit
    setDefaultDailyLimit(100);
  });

  afterEach(() => {
    resetBudgetConfig();
    resetLoggerConfig();

    // Clean up test files
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      if (fs.existsSync(testLogDir)) {
        fs.rmSync(testLogDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("configureBudget", () => {
    it("should set custom budget path", () => {
      const customDir = path.join(os.tmpdir(), "custom-budget-dir");
      const customFile = "custom.json";

      configureBudget(customDir, customFile);
      expect(getBudgetPath()).toBe(path.join(customDir, customFile));
    });

    it("should use default file name when not specified", () => {
      const customDir = path.join(os.tmpdir(), "custom-dir");
      configureBudget(customDir);
      expect(getBudgetPath()).toBe(path.join(customDir, "budgets.json"));
    });
  });

  describe("setDefaultDailyLimit", () => {
    it("should set the default daily limit", () => {
      setDefaultDailyLimit(250);
      expect(getDefaultDailyLimit()).toBe(250);
    });

    it("should throw error for negative limit", () => {
      expect(() => setDefaultDailyLimit(-10)).toThrow(
        "Daily limit must be non-negative"
      );
    });

    it("should allow zero limit", () => {
      setDefaultDailyLimit(0);
      expect(getDefaultDailyLimit()).toBe(0);
    });
  });

  describe("checkBudget", () => {
    it("should return true when agent has sufficient budget", async () => {
      const result = await checkBudget("agent-1", 50);
      expect(result).toBe(true);
    });

    it("should return true when cost equals remaining budget", async () => {
      await setAgentDailyLimit("agent-1", 100);
      await recordSpend("agent-1", 50);

      const result = await checkBudget("agent-1", 50);
      expect(result).toBe(true);
    });

    it("should return false when cost exceeds remaining budget", async () => {
      await setAgentDailyLimit("agent-1", 100);
      await recordSpend("agent-1", 60);

      const result = await checkBudget("agent-1", 50);
      expect(result).toBe(false);
    });

    it("should return false when no budget remaining", async () => {
      await setAgentDailyLimit("agent-1", 100);
      await recordSpend("agent-1", 100);

      const result = await checkBudget("agent-1", 1);
      expect(result).toBe(false);
    });

    it("should create agent budget if not exists", async () => {
      const result = await checkBudget("new-agent", 10);
      expect(result).toBe(true);

      const budget = await getAgentBudget("new-agent");
      expect(budget.dailyLimit).toBe(100); // default limit
      expect(budget.dailySpend).toBe(0);
    });

    it("should throw error for empty agent ID", async () => {
      await expect(checkBudget("", 10)).rejects.toThrow(
        "Agent ID must be a non-empty string"
      );
    });

    it("should throw error for negative cost", async () => {
      await expect(checkBudget("agent-1", -10)).rejects.toThrow(
        "Cost must be non-negative"
      );
    });

    it("should allow zero cost check", async () => {
      const result = await checkBudget("agent-1", 0);
      expect(result).toBe(true);
    });
  });

  describe("recordSpend", () => {
    it("should record spend successfully", async () => {
      await recordSpend("agent-1", 25);

      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(25);
    });

    it("should accumulate multiple spends", async () => {
      await recordSpend("agent-1", 10);
      await recordSpend("agent-1", 20);
      await recordSpend("agent-1", 15);

      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(45);
    });

    it("should throw error when spend exceeds limit", async () => {
      await setAgentDailyLimit("agent-1", 50);
      await recordSpend("agent-1", 30);

      await expect(recordSpend("agent-1", 25)).rejects.toThrow(
        /Budget exceeded/
      );
    });

    it("should allow spend up to exact limit", async () => {
      await setAgentDailyLimit("agent-1", 100);
      await recordSpend("agent-1", 50);
      await recordSpend("agent-1", 50);

      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(100);
    });

    it("should throw error for empty agent ID", async () => {
      await expect(recordSpend("", 10)).rejects.toThrow(
        "Agent ID must be a non-empty string"
      );
    });

    it("should throw error for negative cost", async () => {
      await expect(recordSpend("agent-1", -10)).rejects.toThrow(
        "Cost must be non-negative"
      );
    });

    it("should allow zero cost spend", async () => {
      await recordSpend("agent-1", 0);
      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(0);
    });
  });

  describe("getDailySpend", () => {
    it("should return 0 for new agent", async () => {
      const spend = await getDailySpend("new-agent");
      expect(spend).toBe(0);
    });

    it("should return current daily spend", async () => {
      await recordSpend("agent-1", 42);
      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(42);
    });

    it("should throw error for empty agent ID", async () => {
      await expect(getDailySpend("")).rejects.toThrow(
        "Agent ID must be a non-empty string"
      );
    });
  });

  describe("resetDailyBudgets", () => {
    it("should reset all agents daily spend to zero", async () => {
      await recordSpend("agent-1", 50);
      await recordSpend("agent-2", 75);
      await recordSpend("agent-3", 25);

      await resetDailyBudgets();

      expect(await getDailySpend("agent-1")).toBe(0);
      expect(await getDailySpend("agent-2")).toBe(0);
      expect(await getDailySpend("agent-3")).toBe(0);
    });

    it("should preserve daily limits after reset", async () => {
      await setAgentDailyLimit("agent-1", 200);
      await recordSpend("agent-1", 100);

      await resetDailyBudgets();

      const budget = await getAgentBudget("agent-1");
      expect(budget.dailyLimit).toBe(200);
      expect(budget.dailySpend).toBe(0);
    });

    it("should work with no agents", async () => {
      // Should not throw
      await resetDailyBudgets();
    });
  });

  describe("setAgentDailyLimit", () => {
    it("should set daily limit for agent", async () => {
      await setAgentDailyLimit("agent-1", 500);

      const budget = await getAgentBudget("agent-1");
      expect(budget.dailyLimit).toBe(500);
    });

    it("should update existing limit", async () => {
      await setAgentDailyLimit("agent-1", 100);
      await setAgentDailyLimit("agent-1", 200);

      const budget = await getAgentBudget("agent-1");
      expect(budget.dailyLimit).toBe(200);
    });

    it("should throw error for negative limit", async () => {
      await expect(setAgentDailyLimit("agent-1", -50)).rejects.toThrow(
        "Daily limit must be non-negative"
      );
    });

    it("should allow zero limit", async () => {
      await setAgentDailyLimit("agent-1", 0);

      const budget = await getAgentBudget("agent-1");
      expect(budget.dailyLimit).toBe(0);
    });

    it("should throw error for empty agent ID", async () => {
      await expect(setAgentDailyLimit("", 100)).rejects.toThrow(
        "Agent ID must be a non-empty string"
      );
    });
  });

  describe("getAgentBudget", () => {
    it("should return full budget details", async () => {
      await setAgentDailyLimit("agent-1", 150);
      await recordSpend("agent-1", 75);

      const budget = await getAgentBudget("agent-1");

      expect(budget.agentId).toBe("agent-1");
      expect(budget.dailyLimit).toBe(150);
      expect(budget.dailySpend).toBe(75);
      expect(budget.date).toBeDefined();
      expect(budget.updatedAt).toBeDefined();
    });

    it("should create budget for new agent", async () => {
      const budget = await getAgentBudget("brand-new-agent");

      expect(budget.agentId).toBe("brand-new-agent");
      expect(budget.dailyLimit).toBe(100); // default
      expect(budget.dailySpend).toBe(0);
    });

    it("should throw error for empty agent ID", async () => {
      await expect(getAgentBudget("")).rejects.toThrow(
        "Agent ID must be a non-empty string"
      );
    });
  });

  describe("getAllBudgets", () => {
    it("should return empty array when no agents", async () => {
      const budgets = await getAllBudgets();
      expect(budgets).toEqual([]);
    });

    it("should return all agent budgets", async () => {
      await recordSpend("agent-1", 10);
      await recordSpend("agent-2", 20);
      await setAgentDailyLimit("agent-3", 300);

      const budgets = await getAllBudgets();

      expect(budgets.length).toBe(3);
      expect(budgets.find((b) => b.agentId === "agent-1")).toBeDefined();
      expect(budgets.find((b) => b.agentId === "agent-2")).toBeDefined();
      expect(budgets.find((b) => b.agentId === "agent-3")).toBeDefined();
    });
  });

  describe("deleteAgentBudget", () => {
    it("should delete existing agent budget", async () => {
      await recordSpend("agent-1", 50);

      const deleted = await deleteAgentBudget("agent-1");
      expect(deleted).toBe(true);

      // Agent should be reset if accessed again
      const budget = await getAgentBudget("agent-1");
      expect(budget.dailySpend).toBe(0);
    });

    it("should return false for non-existent agent", async () => {
      const deleted = await deleteAgentBudget("non-existent-agent");
      expect(deleted).toBe(false);
    });

    it("should throw error for empty agent ID", async () => {
      await expect(deleteAgentBudget("")).rejects.toThrow(
        "Agent ID must be a non-empty string"
      );
    });
  });

  describe("persistence", () => {
    it("should persist budgets across reads", async () => {
      await recordSpend("agent-1", 50);
      await setAgentDailyLimit("agent-2", 200);

      // Verify data persists
      const budget1 = await getAgentBudget("agent-1");
      const budget2 = await getAgentBudget("agent-2");

      expect(budget1.dailySpend).toBe(50);
      expect(budget2.dailyLimit).toBe(200);
    });

    it("should create budget directory if not exists", async () => {
      expect(fs.existsSync(testDir)).toBe(false);

      await recordSpend("agent-1", 10);

      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.existsSync(getBudgetPath())).toBe(true);
    });
  });

  describe("daily reset on date change", () => {
    it("should reset spend when date changes", async () => {
      await recordSpend("agent-1", 75);

      // Manually modify the date in the budget file to simulate yesterday
      const dbPath = getBudgetPath();
      const content = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      content.agents["agent-1"].date = "2024-01-01"; // Old date
      fs.writeFileSync(dbPath, JSON.stringify(content));

      // Now getDailySpend should see it's a new day and reset
      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle very small costs", async () => {
      await recordSpend("agent-1", 0.01);
      await recordSpend("agent-1", 0.001);

      const spend = await getDailySpend("agent-1");
      expect(spend).toBeCloseTo(0.011);
    });

    it("should handle large costs", async () => {
      await setAgentDailyLimit("agent-1", 1000000);
      await recordSpend("agent-1", 999999.99);

      const spend = await getDailySpend("agent-1");
      expect(spend).toBe(999999.99);
    });

    it("should handle special characters in agent ID", async () => {
      const specialId = "agent:test-123_special";
      await recordSpend(specialId, 25);

      const spend = await getDailySpend(specialId);
      expect(spend).toBe(25);
    });
  });
});
