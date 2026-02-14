/**
 * @gicm/orchestrator - Task Decomposer
 * Breaks complex tasks into parallelizable sub-tasks using 8 built-in patterns
 */

import { EventEmitter } from "node:events";
import type { TaskDefinition, SubTask, TaskPriority } from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

interface TaskPattern {
  name: string;
  matcher: RegExp;
  decompose: (task: TaskDefinition, matches: RegExpMatchArray) => SubTask[];
}

export interface DecompositionResult {
  originalTask: TaskDefinition;
  subTasks: SubTask[];
  complexity: number;
  parallelGroups: SubTask[][];
  estimatedDuration: number;
  dependencies: Map<string, string[]>;
}

// =============================================================================
// COMPLEXITY KEYWORDS
// =============================================================================

const COMPLEXITY_KEYWORDS = [
  "architecture",
  "system",
  "integration",
  "migration",
  "refactor",
  "security",
  "performance",
  "scale",
  "distributed",
  "concurrent",
  "async",
  "real-time",
];

const PRIORITY_MULTIPLIER: Record<TaskPriority, number> = {
  critical: 1.5,
  high: 1.2,
  medium: 1.0,
  low: 0.8,
};

// =============================================================================
// TASK DECOMPOSER
// =============================================================================

export class TaskDecomposer extends EventEmitter {
  private patterns: TaskPattern[] = [];
  private taskCounter = 0;

  constructor() {
    super();
    this.registerDefaultPatterns();
  }

  /**
   * Decompose a task into sub-tasks based on pattern matching.
   */
  decompose(task: TaskDefinition): DecompositionResult {
    const complexity = this.calculateComplexity(task);
    let subTasks: SubTask[] = [];

    // Try patterns in registration order (highest priority first)
    for (const pattern of this.patterns) {
      const match = task.description.match(pattern.matcher);
      if (match) {
        subTasks = pattern.decompose(task, match);
        if (subTasks.length > 0) break;
      }
    }

    // Fallback: generic decomposition
    if (subTasks.length === 0) {
      subTasks = this.genericDecomposition(task);
    }

    this.emit("task:decomposed", task, subTasks);

    const dependencies = this.buildDependencyGraph(subTasks);
    const parallelGroups = this.identifyParallelGroups(subTasks, dependencies);
    const estimatedDuration = this.estimateDuration(parallelGroups);

    return {
      originalTask: task,
      subTasks,
      complexity,
      parallelGroups,
      estimatedDuration,
      dependencies,
    };
  }

  /**
   * Calculate task complexity on a 1-10 scale.
   */
  calculateComplexity(task: TaskDefinition): number {
    let complexity = 1;

    // Description length contribution
    complexity += Math.min(task.description.length / 100, 3);

    // Required capabilities count
    if (task.requiredCapabilities) {
      complexity += task.requiredCapabilities.length * 0.3;
    }

    // Keyword-based complexity
    const descLower = task.description.toLowerCase();
    for (const keyword of COMPLEXITY_KEYWORDS) {
      if (descLower.includes(keyword)) {
        complexity += 0.5;
      }
    }

    // Priority multiplier
    complexity *= PRIORITY_MULTIPLIER[task.priority];

    return Math.min(Math.max(Math.round(complexity * 10) / 10, 1), 10);
  }

  /**
   * Build a dependency graph from sub-tasks.
   * Returns a Map of taskId -> list of dependency taskIds.
   */
  buildDependencyGraph(subTasks: SubTask[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const st of subTasks) {
      graph.set(st.id, st.dependencies);
    }
    return graph;
  }

  /**
   * Identify groups of tasks that can run in parallel.
   * Uses topological sorting to layer independent tasks.
   */
  identifyParallelGroups(
    subTasks: SubTask[],
    dependencies?: Map<string, string[]>
  ): SubTask[][] {
    const deps = dependencies ?? this.buildDependencyGraph(subTasks);
    const groups: SubTask[][] = [];
    const completed = new Set<string>();
    const remaining = new Set(subTasks.map((t) => t.id));

    while (remaining.size > 0) {
      const group: SubTask[] = [];

      for (const taskId of remaining) {
        const taskDeps = deps.get(taskId) ?? [];
        if (taskDeps.every((d) => completed.has(d))) {
          const task = subTasks.find((t) => t.id === taskId);
          if (task) group.push(task);
        }
      }

      // Circular dependency guard
      if (group.length === 0) break;

      groups.push(group);
      for (const task of group) {
        remaining.delete(task.id);
        completed.add(task.id);
      }
    }

    return groups;
  }

  /**
   * Register a custom decomposition pattern.
   */
  registerPattern(
    name: string,
    matcher: RegExp,
    decompose: (task: TaskDefinition, matches: RegExpMatchArray) => SubTask[]
  ): void {
    this.patterns.unshift({ name, matcher, decompose });
  }

  /**
   * Estimate total duration accounting for parallel execution.
   */
  estimateDuration(parallelGroups: SubTask[][]): number {
    const baseTimePerTask = 30_000; // 30s per task
    let total = 0;

    for (const group of parallelGroups) {
      // Duration of a group = slowest task in the group
      const maxDuration = Math.max(
        ...group.map((t) => t.estimatedDuration ?? baseTimePerTask)
      );
      total += maxDuration;
    }

    return total;
  }

  // ---------------------------------------------------------------------------
  // Private: Default patterns
  // ---------------------------------------------------------------------------

  private registerDefaultPatterns(): void {
    // 1. multi-file: Detects tasks affecting multiple files
    this.patterns.push({
      name: "multi-file",
      matcher: /(?:files?|components?|modules?)\s*[:=]?\s*\[([^\]]+)\]/i,
      decompose: (task, matches) => {
        const files = matches[1].split(",").map((f) => f.trim());
        return files.map((file) =>
          this.createSubTask(task, `Handle changes for: ${file}`, [])
        );
      },
    });

    // 2. step-by-step: Sequential pipeline tasks
    this.patterns.push({
      name: "step-by-step",
      matcher: /(?:steps?|phases?|stages?)[\s:]+(?:\d+[.)]\s*[^,\n]+[,\n]?)+/i,
      decompose: (task) => {
        const stepMatch = task.description.match(/\d+[.)]\s*([^,\n]+)/g);
        if (!stepMatch) return [];

        let prevId: string | undefined;
        return stepMatch.map((step) => {
          const desc = step.replace(/^\d+[.)]\s*/, "").trim();
          const st = this.createSubTask(task, desc, prevId ? [prevId] : []);
          prevId = st.id;
          return st;
        });
      },
    });

    // 3. feature-impl: Feature = design -> implement -> test -> review
    this.patterns.push({
      name: "feature-impl",
      matcher:
        /(?:implement|add|create|build)\s+(?:a\s+)?(.+?)(?:\s+feature|\s+functionality)?$/i,
      decompose: (task, matches) => {
        const feature = matches[1];
        const design = this.createSubTask(
          task,
          `Design ${feature} architecture`,
          []
        );
        const impl = this.createSubTask(
          task,
          `Implement ${feature} core logic`,
          [design.id]
        );
        const test = this.createSubTask(task, `Write tests for ${feature}`, [
          impl.id,
        ]);
        const review = this.createSubTask(
          task,
          `Review ${feature} implementation`,
          [test.id]
        );
        return [design, impl, test, review];
      },
    });

    // 4. bug-fix: Reproduce -> diagnose -> fix -> verify
    this.patterns.push({
      name: "bug-fix",
      matcher: /(?:fix|resolve|debug|troubleshoot)\s+(.+)/i,
      decompose: (task, matches) => {
        const issue = matches[1];
        const reproduce = this.createSubTask(task, `Reproduce: ${issue}`, []);
        const diagnose = this.createSubTask(
          task,
          `Diagnose root cause of: ${issue}`,
          [reproduce.id]
        );
        const fix = this.createSubTask(task, `Implement fix for: ${issue}`, [
          diagnose.id,
        ]);
        const verify = this.createSubTask(
          task,
          `Verify fix and add regression test`,
          [fix.id]
        );
        return [reproduce, diagnose, fix, verify];
      },
    });

    // 5. refactor: Analyze -> plan -> execute -> validate
    this.patterns.push({
      name: "refactor",
      matcher: /(?:refactor|restructure|reorganize|optimize)\s+(.+)/i,
      decompose: (task, matches) => {
        const target = matches[1];
        const analyze = this.createSubTask(
          task,
          `Analyze current structure of: ${target}`,
          []
        );
        const plan = this.createSubTask(
          task,
          `Plan refactoring approach for: ${target}`,
          [analyze.id]
        );
        const execute = this.createSubTask(
          task,
          `Execute refactoring of: ${target}`,
          [plan.id]
        );
        const validate = this.createSubTask(
          task,
          `Validate and update tests after refactoring`,
          [execute.id]
        );
        return [analyze, plan, execute, validate];
      },
    });

    // 6. api-integration: Schema -> endpoint -> client -> test
    this.patterns.push({
      name: "api-integration",
      matcher: /(?:integrate|connect|api|endpoint)\s+(?:with\s+)?(.+)/i,
      decompose: (task, matches) => {
        const target = matches[1];
        const schema = this.createSubTask(
          task,
          `Define schema for ${target} integration`,
          []
        );
        const endpoint = this.createSubTask(
          task,
          `Implement ${target} endpoint`,
          [schema.id]
        );
        const client = this.createSubTask(task, `Build ${target} client`, [
          endpoint.id,
        ]);
        const test = this.createSubTask(
          task,
          `Write integration tests for ${target}`,
          [client.id]
        );
        return [schema, endpoint, client, test];
      },
    });

    // 7. security: Audit -> remediate -> verify
    this.patterns.push({
      name: "security",
      matcher: /(?:security|audit|vulnerability|pentest)/i,
      decompose: (task) => {
        const audit = this.createSubTask(task, "Perform security audit", []);
        const remediate = this.createSubTask(
          task,
          "Remediate identified vulnerabilities",
          [audit.id]
        );
        const verify = this.createSubTask(task, "Verify security fixes", [
          remediate.id,
        ]);
        return [audit, remediate, verify];
      },
    });

    // 8. review: Read -> analyze -> report
    this.patterns.push({
      name: "review",
      matcher: /(?:review|check|evaluate|assess)\s+(.+)/i,
      decompose: (task, matches) => {
        const target = matches[1];
        const read = this.createSubTask(task, `Read and scan: ${target}`, []);
        const analyze = this.createSubTask(task, `Analyze: ${target}`, [
          read.id,
        ]);
        const report = this.createSubTask(
          task,
          `Generate findings report for: ${target}`,
          [analyze.id]
        );
        return [read, analyze, report];
      },
    });
  }

  /**
   * Generic decomposition for tasks that match no specific pattern.
   */
  private genericDecomposition(task: TaskDefinition): SubTask[] {
    const analyze = this.createSubTask(
      task,
      `Analyze requirements: ${task.description.slice(0, 60)}`,
      []
    );
    const plan = this.createSubTask(task, "Plan implementation approach", [
      analyze.id,
    ]);
    const execute = this.createSubTask(task, "Execute main implementation", [
      plan.id,
    ]);
    const validate = this.createSubTask(task, "Review and validate results", [
      execute.id,
    ]);
    return [analyze, plan, execute, validate];
  }

  /**
   * Create a sub-task with auto-incrementing ID.
   */
  private createSubTask(
    parent: TaskDefinition,
    description: string,
    dependencies: string[]
  ): SubTask {
    const id = `subtask-${++this.taskCounter}`;

    return {
      id,
      parentId: parent.id,
      description,
      priority: parent.priority,
      dependencies,
      requiredCapabilities: parent.requiredCapabilities,
      metadata: parent.metadata,
    };
  }
}
