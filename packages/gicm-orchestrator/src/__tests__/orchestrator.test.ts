/**
 * @gicm/orchestrator - Test Suite
 * ~30 tests covering AgentPool, TaskDecomposer, Council, Ranking, Synthesis, Orchestrator
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AgentPool } from "../agent-pool.js";
import { TaskDecomposer } from "../task-decomposer.js";
import { Council } from "../council.js";
import {
  parseRankingText,
  aggregateRankings,
  detectConflicts,
  normalizeScores,
  determineConsensus,
} from "../ranking.js";
import { selectStrategy, SYNTHESIS_STRATEGIES } from "../synthesis.js";
import { Orchestrator } from "../orchestrator.js";
import type {
  AgentDefinition,
  AgentInstance,
  AgentExecutor,
  TaskDefinition,
  TaskResult,
} from "../types.js";

// =============================================================================
// MOCK EXECUTOR
// =============================================================================

function createMockExecutor(): AgentExecutor {
  return {
    execute: async (
      agent: AgentInstance,
      task: TaskDefinition
    ): Promise<TaskResult> => ({
      taskId: task.id,
      agentId: agent.id,
      status: "completed",
      output: "mock result",
      duration: 100,
      startedAt: new Date(),
      completedAt: new Date(),
    }),
  };
}

function createFailingExecutor(failCount: number): AgentExecutor {
  let calls = 0;
  return {
    execute: async (
      agent: AgentInstance,
      task: TaskDefinition
    ): Promise<TaskResult> => {
      calls++;
      if (calls <= failCount) {
        return {
          taskId: task.id,
          agentId: agent.id,
          status: "failed",
          error: `Failure #${calls}`,
          duration: 50,
          startedAt: new Date(),
          completedAt: new Date(),
        };
      }
      return {
        taskId: task.id,
        agentId: agent.id,
        status: "completed",
        output: `Success after ${calls} attempts`,
        duration: 100,
        startedAt: new Date(),
        completedAt: new Date(),
      };
    },
  };
}

// =============================================================================
// HELPER: Create agent definitions
// =============================================================================

function makeAgent(
  id: string,
  overrides?: Partial<AgentDefinition>
): AgentDefinition {
  return {
    id,
    name: `Agent ${id}`,
    role: "generalist",
    capabilities: ["coding", "analysis"],
    triggers: ["build", "test"],
    keywords: ["typescript", "node"],
    maxConcurrent: 1,
    ...overrides,
  };
}

function makeTask(
  id: string,
  description: string,
  overrides?: Partial<TaskDefinition>
): TaskDefinition {
  return {
    id,
    description,
    priority: "medium",
    ...overrides,
  };
}

// =============================================================================
// AGENT POOL TESTS (8 tests)
// =============================================================================

describe("AgentPool", () => {
  let pool: AgentPool;

  beforeEach(() => {
    pool = new AgentPool();
  });

  it("should register agent and retrieve it", () => {
    const def = makeAgent("alpha");
    pool.registerAgent(def);

    const retrieved = pool.getAgent("alpha");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe("alpha");
    expect(retrieved!.status).toBe("idle");
  });

  it("should acquire available agent", () => {
    pool.registerAgent(makeAgent("alpha"));
    pool.registerAgent(makeAgent("beta"));

    const agent = pool.acquireAgent();
    expect(agent).not.toBeNull();
    expect(agent!.status).toBe("busy");
  });

  it("should release agent back to pool", () => {
    pool.registerAgent(makeAgent("alpha"));

    const agent = pool.acquireAgent()!;
    expect(agent.status).toBe("busy");

    pool.releaseAgent("alpha", { success: true, duration: 200 });
    const released = pool.getAgent("alpha")!;
    expect(released.status).toBe("idle");
    expect(released.stats.totalTasks).toBe(1);
    expect(released.stats.successRate).toBe(1);
  });

  it("should score best-match by capabilities", () => {
    pool.registerAgent(
      makeAgent("ts-expert", {
        capabilities: ["typescript", "react"],
        keywords: ["frontend"],
      })
    );
    pool.registerAgent(
      makeAgent("py-expert", {
        capabilities: ["python", "django"],
        keywords: ["backend"],
      })
    );

    const task = makeTask("t1", "build frontend typescript component", {
      requiredCapabilities: ["typescript"],
    });

    const tsScore = pool.matchScore(pool.getAgent("ts-expert")!, task);
    const pyScore = pool.matchScore(pool.getAgent("py-expert")!, task);

    expect(tsScore).toBeGreaterThan(pyScore);
  });

  it("should use round-robin load balancing", () => {
    const rrPool = new AgentPool({ loadBalancing: "round-robin" });
    rrPool.registerAgent(makeAgent("a1"));
    rrPool.registerAgent(makeAgent("a2"));
    rrPool.registerAgent(makeAgent("a3"));

    const first = rrPool.acquireAgent()!;
    rrPool.releaseAgent(first.id);

    const second = rrPool.acquireAgent()!;
    rrPool.releaseAgent(second.id);

    const third = rrPool.acquireAgent()!;
    rrPool.releaseAgent(third.id);

    // Three different agents should be picked in rotation
    const ids = [first.id, second.id, third.id];
    expect(new Set(ids).size).toBe(3);
  });

  it("should use least-loaded selection", () => {
    const llPool = new AgentPool({ loadBalancing: "least-loaded" });
    llPool.registerAgent(makeAgent("a1"));
    llPool.registerAgent(makeAgent("a2"));

    // Give a1 some usage history
    const a1 = llPool.acquireAgent()!;
    llPool.releaseAgent(a1.id, { success: true, duration: 100 });
    llPool.releaseAgent(a1.id, { success: true, duration: 100 });

    // Now least-loaded should prefer a2
    const next = llPool.acquireAgent()!;
    expect(next.id).toBe("a2");
  });

  it("should return null when no agents found", () => {
    const agent = pool.getAgent("nonexistent");
    expect(agent).toBeNull();
  });

  it("should track pool stats", () => {
    pool.registerAgent(makeAgent("a1", { role: "specialist" }));
    pool.registerAgent(makeAgent("a2", { role: "reviewer" }));

    const a1 = pool.acquireAgent()!;
    pool.releaseAgent(a1.id, { success: true, duration: 100 });

    const stats = pool.getStats();
    expect(stats.total).toBe(2);
    expect(stats.available).toBe(2);
    expect(stats.busy).toBe(0);
    expect(stats.byRole["specialist"]).toBe(1);
    expect(stats.byRole["reviewer"]).toBe(1);
    expect(stats.topPerformers.length).toBe(1);
  });
});

// =============================================================================
// TASK DECOMPOSER TESTS (7 tests)
// =============================================================================

describe("TaskDecomposer", () => {
  let decomposer: TaskDecomposer;

  beforeEach(() => {
    decomposer = new TaskDecomposer();
  });

  it('should decompose "build feature" into design/implement/test/review', () => {
    const task = makeTask("t1", "implement user authentication feature");
    const result = decomposer.decompose(task);

    expect(result.subTasks.length).toBe(4);
    expect(result.subTasks[0].description).toContain("Design");
    expect(result.subTasks[1].description).toContain("Implement");
    expect(result.subTasks[2].description).toContain("tests");
    expect(result.subTasks[3].description).toContain("Review");
  });

  it('should decompose "fix bug" into reproduce/diagnose/fix/verify', () => {
    const task = makeTask("t2", "fix login timeout error");
    const result = decomposer.decompose(task);

    expect(result.subTasks.length).toBe(4);
    expect(result.subTasks[0].description).toContain("Reproduce");
    expect(result.subTasks[1].description).toContain("Diagnose");
    expect(result.subTasks[2].description).toContain("fix");
    expect(result.subTasks[3].description).toContain("Verify");
  });

  it("should calculateComplexity in range 1-10", () => {
    const simple = makeTask("t3", "rename variable", {
      priority: "low",
    });
    const complex = makeTask(
      "t4",
      "refactor distributed architecture for real-time concurrent system integration with security migration",
      { priority: "critical" }
    );

    const simpleC = decomposer.calculateComplexity(simple);
    const complexC = decomposer.calculateComplexity(complex);

    expect(simpleC).toBeGreaterThanOrEqual(1);
    expect(simpleC).toBeLessThanOrEqual(10);
    expect(complexC).toBeGreaterThanOrEqual(1);
    expect(complexC).toBeLessThanOrEqual(10);
    expect(complexC).toBeGreaterThan(simpleC);
  });

  it("should identify parallel groups correctly", () => {
    const task = makeTask("t5", "update files: [auth.ts, db.ts, ui.ts]");
    const result = decomposer.decompose(task);

    // Multi-file pattern produces parallel tasks (no deps)
    expect(result.parallelGroups.length).toBeGreaterThanOrEqual(1);
    // First group should contain all parallel tasks
    expect(result.parallelGroups[0].length).toBe(3);
  });

  it("should produce acyclic dependency graph", () => {
    const task = makeTask("t6", "implement search functionality");
    const result = decomposer.decompose(task);

    // Verify no circular dependencies by checking topological ordering
    const completed = new Set<string>();
    for (const group of result.parallelGroups) {
      for (const st of group) {
        // All deps should already be in completed
        for (const dep of st.dependencies) {
          expect(completed.has(dep)).toBe(true);
        }
      }
      for (const st of group) {
        completed.add(st.id);
      }
    }
  });

  it("should support custom pattern registration", () => {
    decomposer.registerPattern(
      "deploy",
      /(?:deploy)\s+(.+)/i,
      (task, matches) => {
        const target = matches[1];
        return [
          {
            id: "deploy-build",
            parentId: task.id,
            description: `Build ${target}`,
            priority: task.priority,
            dependencies: [],
          },
          {
            id: "deploy-push",
            parentId: task.id,
            description: `Push ${target}`,
            priority: task.priority,
            dependencies: ["deploy-build"],
          },
        ];
      }
    );

    const task = makeTask("t7", "deploy production server");
    const result = decomposer.decompose(task);

    expect(result.subTasks.length).toBe(2);
    expect(result.subTasks[0].description).toContain("Build");
    expect(result.subTasks[1].description).toContain("Push");
  });

  it("should give generic decomposition for unknown tasks", () => {
    const task = makeTask("t8", "do something completely novel and weird");
    const result = decomposer.decompose(task);

    // Should get generic 4-step decomposition
    expect(result.subTasks.length).toBe(4);
    expect(result.subTasks[0].description).toContain("Analyze");
    expect(result.subTasks[1].description).toContain("Plan");
    expect(result.subTasks[2].description).toContain("Execute");
    expect(result.subTasks[3].description).toContain("validate");
  });
});

// =============================================================================
// COUNCIL TESTS (5 tests)
// =============================================================================

describe("Council", () => {
  let executor: AgentExecutor;
  let council: Council;
  let members: AgentInstance[];

  beforeEach(() => {
    executor = createMockExecutor();
    council = new Council(executor);
    members = [
      {
        ...makeAgent("member-a", { role: "specialist" }),
        status: "idle",
        stats: { totalTasks: 0, successRate: 1, avgDuration: 0 },
      },
      {
        ...makeAgent("member-b", { role: "reviewer" }),
        status: "idle",
        stats: { totalTasks: 0, successRate: 1, avgDuration: 0 },
      },
      {
        ...makeAgent("member-c", { role: "generalist" }),
        status: "idle",
        stats: { totalTasks: 0, successRate: 1, avgDuration: 0 },
      },
    ];
  });

  it("should complete 3-stage deliberation with mock executor", async () => {
    const task = makeTask("council-1", "What is the best testing strategy?");
    const result = await council.deliberate(task, members);

    expect(result.finalAnswer).toBeDefined();
    expect(result.stages.stage1.length).toBe(3);
    expect(result.stages.stage2.length).toBe(3);
    expect(result.stages.stage3.chairman).toBeDefined();
  });

  it("should produce independent responses from all members", async () => {
    const task = makeTask("council-2", "Evaluate code quality");
    const result = await council.deliberate(task, members);

    const memberIds = result.stages.stage1.map((r) => r.memberId);
    expect(memberIds).toContain("member-a");
    expect(memberIds).toContain("member-b");
    expect(memberIds).toContain("member-c");
  });

  it("should aggregate rankings across reviewers", async () => {
    const task = makeTask("council-3", "Best architecture pattern?");
    const result = await council.deliberate(task, members);

    expect(result.rankings.length).toBe(3);
    for (const ranking of result.rankings) {
      expect(ranking.rankerId).toBeDefined();
      expect(ranking.rankings.length).toBeGreaterThanOrEqual(0);
    }
  });

  it("should determine consensus level", async () => {
    const task = makeTask("council-4", "Choose a framework");
    const result = await council.deliberate(task, members);

    const validLevels = ["unanimous", "strong", "moderate", "weak", "split"];
    expect(validLevels).toContain(result.consensusLevel);
  });

  it("should use highest-ranked member as chairman", async () => {
    const task = makeTask("council-5", "Design system overview");
    const result = await council.deliberate(task, members);

    // Chairman should be one of the member IDs
    const memberIds = members.map((m) => m.id);
    expect(memberIds).toContain(result.stages.stage3.chairman);
  });
});

// =============================================================================
// RANKING TESTS (4 tests)
// =============================================================================

describe("Ranking", () => {
  it("should parseRankingText and extract scores", () => {
    const text = `1. Response A (Score: 9/10) - Excellent analysis
2. Response B (Score: 7/10) - Good but incomplete
3. Response C (Score: 5/10) - Basic coverage`;

    const entries = parseRankingText(text);
    expect(entries.length).toBe(3);
    expect(entries[0].responseId).toBe("A");
    expect(entries[0].score).toBe(9);
    expect(entries[0].rank).toBe(1);
    expect(entries[1].score).toBe(7);
    expect(entries[2].score).toBe(5);
  });

  it("should aggregateRankings by averaging across reviewers", () => {
    const rankings = [
      { responseId: "A", rank: 1, score: 9 },
      { responseId: "A", rank: 2, score: 7 },
      { responseId: "B", rank: 2, score: 6 },
      { responseId: "B", rank: 1, score: 8 },
    ];

    const agg = aggregateRankings(rankings);
    expect(agg.get("A")).toBe(8); // (9+7)/2
    expect(agg.get("B")).toBe(7); // (6+8)/2
  });

  it("should detectConflicts when ranks disagree", () => {
    const rankings = [
      { responseId: "A", rank: 1, score: 9 },
      { responseId: "A", rank: 5, score: 3 },
      { responseId: "B", rank: 2, score: 7 },
      { responseId: "B", rank: 2, score: 7 },
    ];

    const conflicts = detectConflicts(rankings);
    // A has range of 4 (1 to 5) -- high severity
    const aConflict = conflicts.find((c) => c.responseId === "A");
    expect(aConflict).toBeDefined();
    expect(aConflict!.severity).toBe("high");

    // B has no conflict (same rank)
    const bConflict = conflicts.find((c) => c.responseId === "B");
    expect(bConflict).toBeUndefined();
  });

  it("should normalizeScores to 0-1 range", () => {
    const scores = new Map<string, number>();
    scores.set("A", 10);
    scores.set("B", 5);
    scores.set("C", 0);

    const normalized = normalizeScores(scores);
    expect(normalized.get("A")).toBe(1);
    expect(normalized.get("B")).toBe(0.5);
    expect(normalized.get("C")).toBe(0);
  });
});

// =============================================================================
// SYNTHESIS TESTS (3 tests)
// =============================================================================

describe("Synthesis", () => {
  it("should map consensusLevel to correct strategy", () => {
    expect(selectStrategy("unanimous").name).toBe("best-of-n");
    expect(selectStrategy("strong").name).toBe("best-of-n");
    expect(selectStrategy("moderate").name).toBe("merge-top");
    expect(selectStrategy("weak").name).toBe("consensus-filter");
    expect(selectStrategy("split").name).toBe("debate-resolution");
  });

  it("should have best-of-n strategy that picks highest score", () => {
    const bestOfN = SYNTHESIS_STRATEGIES.find((s) => s.name === "best-of-n");
    expect(bestOfN).toBeDefined();
    expect(bestOfN!.description).toContain("highest-ranked");
  });

  it("should have merge-top strategy that combines top responses", () => {
    const mergeTop = SYNTHESIS_STRATEGIES.find((s) => s.name === "merge-top");
    expect(mergeTop).toBeDefined();
    expect(mergeTop!.description).toContain("Merge");
  });
});

// =============================================================================
// ORCHESTRATOR TESTS (5 tests)
// =============================================================================

describe("Orchestrator", () => {
  let pool: AgentPool;
  let decomposer: TaskDecomposer;
  let executor: AgentExecutor;
  let orchestrator: Orchestrator;

  beforeEach(() => {
    pool = new AgentPool();
    decomposer = new TaskDecomposer();
    executor = createMockExecutor();
    orchestrator = new Orchestrator(pool, decomposer, executor);

    // Register some agents
    pool.registerAgent(makeAgent("agent-1"));
    pool.registerAgent(makeAgent("agent-2"));
    pool.registerAgent(makeAgent("agent-3"));
  });

  it("should register and execute workflow", async () => {
    orchestrator.registerWorkflow({
      id: "wf-1",
      name: "Test Workflow",
      steps: [
        {
          id: "step-1",
          name: "First step",
          strategy: "sequential",
        },
        {
          id: "step-2",
          name: "Second step",
          strategy: "sequential",
          dependencies: ["step-1"],
        },
      ],
    });

    const results = await orchestrator.executeWorkflow("wf-1");
    expect(results.length).toBe(2);
    expect(results[0].status).toBe("completed");
    expect(results[1].status).toBe("completed");
  });

  it("should execute steps sequentially respecting order", async () => {
    const executionOrder: string[] = [];
    const trackingExecutor: AgentExecutor = {
      execute: async (agent, task) => {
        executionOrder.push(task.id);
        return {
          taskId: task.id,
          agentId: agent.id,
          status: "completed",
          output: `done ${task.id}`,
          duration: 50,
          startedAt: new Date(),
          completedAt: new Date(),
        };
      },
    };

    const seqOrch = new Orchestrator(pool, decomposer, trackingExecutor);

    seqOrch.registerWorkflow({
      id: "wf-seq",
      name: "Sequential Workflow",
      steps: [
        { id: "s1", name: "Step 1", strategy: "sequential" },
        {
          id: "s2",
          name: "Step 2",
          strategy: "sequential",
          dependencies: ["s1"],
        },
        {
          id: "s3",
          name: "Step 3",
          strategy: "sequential",
          dependencies: ["s2"],
        },
      ],
    });

    await seqOrch.executeWorkflow("wf-seq");

    // Verify order: s1 before s2 before s3
    expect(executionOrder.indexOf("s1")).toBeLessThan(
      executionOrder.indexOf("s2")
    );
    expect(executionOrder.indexOf("s2")).toBeLessThan(
      executionOrder.indexOf("s3")
    );
  });

  it("should execute parallel steps via Promise.all", async () => {
    orchestrator.registerWorkflow({
      id: "wf-par",
      name: "Parallel Workflow",
      steps: [
        {
          id: "p1",
          name: "Parallel step",
          strategy: "parallel",
          agentRoles: ["generalist", "specialist"],
        },
      ],
    });

    const results = await orchestrator.executeWorkflow("wf-par");
    expect(results.length).toBe(1);
    expect(results[0].status).toBe("completed");
  });

  it("should retry on failure up to retryAttempts", async () => {
    const failingExec = createFailingExecutor(2); // Fails twice, then succeeds

    const retryOrch = new Orchestrator(pool, decomposer, failingExec, {
      retryAttempts: 3,
      retryDelayMs: 10, // fast retries for testing
    });

    const task = makeTask("retry-task", "do something");
    const result = await retryOrch.executeTask(task);

    expect(result.status).toBe("completed");
    expect(result.output).toContain("Success");
  });

  it("should decompose and run via executeDynamic", async () => {
    const task = makeTask("dynamic-1", "implement user dashboard feature");

    const results = await orchestrator.executeDynamic(task);

    // Feature impl decomposes into 4 subtasks
    expect(results.length).toBe(4);
    for (const r of results) {
      expect(r.status).toBe("completed");
    }
  });
});
