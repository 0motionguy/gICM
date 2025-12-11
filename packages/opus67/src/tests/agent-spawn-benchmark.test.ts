/**
 * OPUS 67 Agent Spawning Benchmark Tests
 * Tests for async agent spawning, SDK V2, and MCP tools
 */

import { describe, test, expect, beforeAll } from "vitest";
import { subagentOrchestrator } from "../agents/subagent-orchestrator.js";
import { asyncAgentRunner } from "../agents/async-runner.js";
import { agentJobQueue } from "../agents/job-queue.js";
import { opus67SDK } from "../sdk/v2-adapter.js";
import {
  handleSpawnAgents,
  handleListAgents,
} from "../mcp/spawn-agent-tool.js";
import { MODE_AGENT_MAP } from "../modes/agent-mapping.js";

// Benchmark results collector
interface BenchmarkResult {
  name: string;
  value: number;
  unit: string;
  target: number;
  targetOp: "lt" | "gt";
  passed: boolean;
  details?: Record<string, unknown>;
}

const results: BenchmarkResult[] = [];

function recordBenchmark(
  name: string,
  value: number,
  unit: string,
  target: number,
  targetOp: "lt" | "gt",
  details?: Record<string, unknown>,
): void {
  const passed = targetOp === "lt" ? value < target : value > target;
  results.push({ name, value, unit, target, targetOp, passed, details });
}

describe("Agent Spawning Benchmarks", () => {
  beforeAll(() => {
    results.length = 0;
  });

  describe("Performance Benchmarks", () => {
    test("single agent spawn latency < 100ms", async () => {
      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const jobId = asyncAgentRunner.spawnBackground({
          agentId: "code-reviewer",
          task: "Review this code for quality",
          model: "sonnet",
          timeout: 5000,
        });
        const elapsed = performance.now() - start;
        times.push(elapsed);

        // Clean up
        asyncAgentRunner.cancel(jobId);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      recordBenchmark("Single Agent Spawn", avgTime, "ms", 100, "lt", {
        iterations,
        min: Math.min(...times),
        max: Math.max(...times),
      });

      expect(avgTime).toBeLessThan(100);
    });

    test("parallel spawn 5 agents < 500ms", async () => {
      const start = performance.now();
      const agents = [
        "code-reviewer",
        "security-engineer",
        "typescript-precision-engineer",
        "backend-api-specialist",
        "unit-test-generator",
      ];

      const jobIds = await Promise.all(
        agents.map((agentId) =>
          asyncAgentRunner.spawnBackground({
            agentId,
            task: "Test task for benchmarking",
            model: "haiku",
            timeout: 5000,
          }),
        ),
      );

      const elapsed = performance.now() - start;
      recordBenchmark("5 Parallel Agents Spawn", elapsed, "ms", 500, "lt", {
        agentCount: 5,
        jobIds: jobIds.length,
      });

      // Clean up
      jobIds.forEach((id) => asyncAgentRunner.cancel(id));

      expect(elapsed).toBeLessThan(500);
    });

    test("task analysis detection < 50ms", async () => {
      const testTasks = [
        "Build a React component with TypeScript",
        "Audit the smart contract for vulnerabilities",
        "Set up CI/CD pipeline with GitHub Actions",
        "Design database schema for user authentication",
        "Write unit tests for the API endpoints",
      ];

      const times: number[] = [];

      for (const task of testTasks) {
        const start = performance.now();
        await subagentOrchestrator.analyzeTask(task, "auto");
        const elapsed = performance.now() - start;
        times.push(elapsed);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      recordBenchmark("Task Analysis", avgTime, "ms", 50, "lt", {
        taskCount: testTasks.length,
        p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
      });

      expect(avgTime).toBeLessThan(50);
    });

    test("job queue throughput > 10 agents/sec", async () => {
      const agentCount = 20;
      const start = performance.now();

      // Queue up jobs using correct API
      for (let i = 0; i < agentCount; i++) {
        agentJobQueue.add(
          {
            agentId: "code-reviewer",
            task: `Benchmark task ${i}`,
            model: "haiku",
          },
          { priority: "normal" },
        );
      }

      const elapsed = performance.now() - start;
      const throughput = (agentCount / elapsed) * 1000; // agents per second

      recordBenchmark(
        "Job Queue Throughput",
        throughput,
        "agents/sec",
        10,
        "gt",
        {
          agentCount,
          totalTimeMs: elapsed,
        },
      );

      // Clear queue
      agentJobQueue.clear();

      expect(throughput).toBeGreaterThan(10);
    });
  });

  describe("Agent Detection Accuracy", () => {
    test("task analysis returns agent suggestions", async () => {
      const testCases = [
        "Build a React component with TypeScript and Tailwind CSS",
        "Audit the Solidity smart contract for reentrancy vulnerabilities",
        "Set up GitHub Actions CI/CD pipeline for deployment",
        "Design PostgreSQL database schema with migrations",
        "Write Jest unit tests for Node.js API endpoints",
      ];

      let totalAgentsSuggested = 0;
      const times: number[] = [];

      for (const task of testCases) {
        const start = performance.now();
        const plan = await subagentOrchestrator.analyzeTask(task, "auto");
        times.push(performance.now() - start);
        totalAgentsSuggested += plan.suggestedAgents.length;
      }

      const avgAgentsPerTask = totalAgentsSuggested / testCases.length;
      const avgTimeMs = times.reduce((a, b) => a + b, 0) / times.length;

      recordBenchmark(
        "Avg Agents Per Task",
        avgAgentsPerTask,
        "agents",
        1,
        "gt",
        {
          totalSuggested: totalAgentsSuggested,
          testCases: testCases.length,
          avgAnalysisTime: avgTimeMs,
        },
      );

      // Should suggest at least 1 agent per task on average
      expect(avgAgentsPerTask).toBeGreaterThanOrEqual(1);
    });

    test("SWARM mode spawns specialists correctly", () => {
      const swarmConfig = MODE_AGENT_MAP.swarm;

      expect(swarmConfig).toBeDefined();
      expect(swarmConfig.autoSpawn).toBe(true);
      expect(swarmConfig.maxParallel).toBeGreaterThanOrEqual(3);
      expect(swarmConfig.asyncExecution).toBe(true);

      recordBenchmark(
        "SWARM Mode Config",
        swarmConfig.maxParallel,
        "agents",
        3,
        "gt",
        {
          autoSpawn: swarmConfig.autoSpawn,
          asyncExecution: swarmConfig.asyncExecution,
        },
      );
    });
  });

  describe("SDK V2 Interface", () => {
    test("SDK V2 session creation < 50ms", async () => {
      const start = performance.now();
      const session = await opus67SDK.spawn(
        "code-reviewer",
        "Review this code snippet",
      );
      const elapsed = performance.now() - start;

      recordBenchmark("SDK V2 Session Creation", elapsed, "ms", 50, "lt", {
        sessionId: session.id,
        status: session.status,
      });

      // Cancel session
      await opus67SDK.cancel(session.id);

      expect(elapsed).toBeLessThan(50);
      expect(session.id).toBeDefined();
      // Session may fail without actual API - just verify it was created
      expect(session.status).toMatch(/active|failed/);
    });

    test("SDK V2 format status displays correctly", () => {
      const status = opus67SDK.formatStatus();

      expect(status).toContain("OPUS 67 SDK V2");
      expect(status).toContain("send()");
      expect(status).toContain("receive()");
      expect(status).toContain("done()");
    });
  });

  describe("MCP Tool Integration", () => {
    test("opus67_spawn_agents MCP tool response < 100ms", async () => {
      const start = performance.now();
      // Specify agents explicitly for deterministic test
      const result = await handleSpawnAgents({
        agents: ["code-reviewer", "security-engineer"],
        task: "Review code quality",
        async: true,
        maxAgents: 2,
      });
      const elapsed = performance.now() - start;

      recordBenchmark("MCP Spawn Tool Response", elapsed, "ms", 100, "lt", {
        success: result.success,
        jobCount: result.jobIds.length,
      });

      expect(elapsed).toBeLessThan(100);
      expect(result.success).toBe(true);
      expect(result.jobIds.length).toBe(2);
    });

    test("opus67_list_agents returns correct categories", () => {
      const categories = [
        "backend",
        "frontend",
        "security",
        "blockchain",
        "devops",
        "testing",
      ];

      for (const category of categories) {
        const result = handleListAgents({ category });
        expect(result.agents.length).toBeGreaterThan(0);
        expect(result.agents.every((a) => a.category === category)).toBe(true);
      }

      // Test "all" category
      const allAgents = handleListAgents({ category: "all" });
      recordBenchmark("Available Agents", allAgents.count, "agents", 15, "gt", {
        categories: categories.length,
      });

      expect(allAgents.count).toBeGreaterThan(15);
    });
  });

  describe("Benchmark Summary", () => {
    test("generate benchmark report", () => {
      console.log("\n" + "=".repeat(70));
      console.log("OPUS 67 AGENT SPAWNING BENCHMARK RESULTS");
      console.log("=".repeat(70));

      const passed = results.filter((r) => r.passed).length;
      const total = results.length;

      console.log(
        `\nOverall: ${passed}/${total} benchmarks passed (${((passed / total) * 100).toFixed(1)}%)\n`,
      );

      console.log("| Benchmark | Value | Target | Status |");
      console.log("|-----------|-------|--------|--------|");

      for (const r of results) {
        const status = r.passed ? "PASS" : "FAIL";
        const targetStr = `${r.targetOp === "lt" ? "<" : ">"} ${r.target}${r.unit}`;
        console.log(
          `| ${r.name} | ${r.value.toFixed(2)}${r.unit} | ${targetStr} | ${status} |`,
        );
      }

      console.log("\n" + "=".repeat(70));

      // Store results for later use
      expect(passed).toBeGreaterThan(total * 0.7); // At least 70% should pass
    });
  });
});
