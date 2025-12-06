/**
 * OPUS 67 Task Decomposer
 * Breaks complex tasks into parallelizable sub-tasks
 */

import { EventEmitter } from 'eventemitter3';
import {
  TaskDefinition,
  SubTask,
  TaskPriority,
  CouncilSystemConfig,
  DEFAULT_COUNCIL_CONFIG,
} from './types.js';

// =============================================================================
// TYPES
// =============================================================================

interface DecomposerEvents {
  'task:analyzed': (task: TaskDefinition, complexity: number) => void;
  'task:decomposed': (task: TaskDefinition, subTasks: SubTask[]) => void;
  'subtask:created': (subTask: SubTask) => void;
  'error': (error: Error) => void;
}

interface TaskPattern {
  name: string;
  pattern: RegExp;
  decomposition: (task: TaskDefinition, matches: RegExpMatchArray) => SubTask[];
  priority: number;
}

interface DecompositionResult {
  originalTask: TaskDefinition;
  subTasks: SubTask[];
  complexity: number;
  parallelGroups: SubTask[][];
  estimatedDuration: number;
  dependencies: Map<string, string[]>;
}

// =============================================================================
// TASK DECOMPOSER
// =============================================================================

export class TaskDecomposer extends EventEmitter<DecomposerEvents> {
  private config: CouncilSystemConfig['taskDecomposer'];
  private patterns: TaskPattern[] = [];
  private taskCounter = 0;

  constructor(config?: Partial<CouncilSystemConfig['taskDecomposer']>) {
    super();
    this.config = { ...DEFAULT_COUNCIL_CONFIG.taskDecomposer, ...config };
    this.registerDefaultPatterns();
  }

  /**
   * Register default task decomposition patterns
   */
  private registerDefaultPatterns(): void {
    // Multi-file changes
    this.registerPattern({
      name: 'multi-file',
      pattern: /(?:files?|components?|modules?)\s*[:=]?\s*\[([^\]]+)\]/i,
      decomposition: (task, matches) => {
        const files = matches[1].split(',').map(f => f.trim());
        return files.map((file, i) => this.createSubTask(task, {
          description: `Handle changes for: ${file}`,
          type: 'file-change',
          context: { ...task.context, files: [file] },
          priority: task.priority,
        }));
      },
      priority: 10,
    });

    // Step-by-step tasks
    this.registerPattern({
      name: 'step-by-step',
      pattern: /(?:steps?|phases?|stages?)[\s:]+(?:\d+[.\)]\s*([^,\n]+)[,\n]?)+/i,
      decomposition: (task) => {
        const stepMatch = task.description.match(/\d+[.\)]\s*([^,\n]+)/g);
        if (!stepMatch) return [];

        let prevId: string | undefined;
        return stepMatch.map((step, i) => {
          const subTask = this.createSubTask(task, {
            description: step.replace(/^\d+[.\)]\s*/, '').trim(),
            type: 'sequential-step',
            priority: task.priority,
            dependencies: prevId ? [prevId] : undefined,
          });
          prevId = subTask.id;
          return subTask;
        });
      },
      priority: 9,
    });

    // Feature implementation
    this.registerPattern({
      name: 'feature-impl',
      pattern: /(?:implement|add|create|build)\s+(?:a\s+)?(.+?)(?:\s+feature|\s+functionality)?$/i,
      decomposition: (task, matches) => {
        const feature = matches[1];
        return [
          this.createSubTask(task, {
            description: `Design ${feature} architecture`,
            type: 'design',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Implement ${feature} core logic`,
            type: 'implementation',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Write tests for ${feature}`,
            type: 'testing',
            priority: 'medium',
          }),
          this.createSubTask(task, {
            description: `Document ${feature}`,
            type: 'documentation',
            priority: 'low',
          }),
        ];
      },
      priority: 5,
    });

    // Bug fix
    this.registerPattern({
      name: 'bug-fix',
      pattern: /(?:fix|resolve|debug|troubleshoot)\s+(.+)/i,
      decomposition: (task, matches) => {
        const issue = matches[1];
        return [
          this.createSubTask(task, {
            description: `Investigate root cause of: ${issue}`,
            type: 'investigation',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Implement fix for: ${issue}`,
            type: 'fix',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Verify fix and add regression test`,
            type: 'verification',
            priority: 'medium',
          }),
        ];
      },
      priority: 6,
    });

    // Refactoring
    this.registerPattern({
      name: 'refactor',
      pattern: /(?:refactor|restructure|reorganize|optimize)\s+(.+)/i,
      decomposition: (task, matches) => {
        const target = matches[1];
        return [
          this.createSubTask(task, {
            description: `Analyze current structure of: ${target}`,
            type: 'analysis',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Plan refactoring approach for: ${target}`,
            type: 'planning',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Execute refactoring of: ${target}`,
            type: 'refactor',
            priority: 'medium',
          }),
          this.createSubTask(task, {
            description: `Update tests after refactoring`,
            type: 'testing',
            priority: 'medium',
          }),
        ];
      },
      priority: 6,
    });

    // API/Integration
    this.registerPattern({
      name: 'api-integration',
      pattern: /(?:integrate|connect|api|endpoint)\s+(?:with\s+)?(.+)/i,
      decomposition: (task, matches) => {
        const target = matches[1];
        return [
          this.createSubTask(task, {
            description: `Research ${target} API/documentation`,
            type: 'research',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Design integration interface for ${target}`,
            type: 'design',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Implement ${target} client/connector`,
            type: 'implementation',
            priority: 'medium',
          }),
          this.createSubTask(task, {
            description: `Add error handling and retry logic`,
            type: 'robustness',
            priority: 'medium',
          }),
          this.createSubTask(task, {
            description: `Write integration tests for ${target}`,
            type: 'testing',
            priority: 'medium',
          }),
        ];
      },
      priority: 7,
    });

    // Security audit
    this.registerPattern({
      name: 'security',
      pattern: /(?:security|audit|vulnerability|pentest)/i,
      decomposition: (task) => [
        this.createSubTask(task, {
          description: 'Scan for known vulnerabilities (dependencies)',
          type: 'dependency-scan',
          priority: 'critical',
        }),
        this.createSubTask(task, {
          description: 'Static code analysis for security issues',
          type: 'sast',
          priority: 'critical',
        }),
        this.createSubTask(task, {
          description: 'Check authentication/authorization logic',
          type: 'auth-review',
          priority: 'high',
        }),
        this.createSubTask(task, {
          description: 'Review input validation and sanitization',
          type: 'input-validation',
          priority: 'high',
        }),
        this.createSubTask(task, {
          description: 'Generate security report with recommendations',
          type: 'report',
          priority: 'medium',
        }),
      ],
      priority: 8,
    });

    // Review task
    this.registerPattern({
      name: 'review',
      pattern: /(?:review|check|evaluate|assess)\s+(.+)/i,
      decomposition: (task, matches) => {
        const target = matches[1];
        return [
          this.createSubTask(task, {
            description: `Initial scan of ${target}`,
            type: 'scan',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Detailed review of ${target}`,
            type: 'review',
            priority: 'high',
          }),
          this.createSubTask(task, {
            description: `Generate findings and recommendations`,
            type: 'report',
            priority: 'medium',
          }),
        ];
      },
      priority: 4,
    });
  }

  /**
   * Register a custom decomposition pattern
   */
  registerPattern(pattern: TaskPattern): void {
    this.patterns.push(pattern);
    this.patterns.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate task complexity score
   */
  calculateComplexity(task: TaskDefinition): number {
    let complexity = 1;

    // Length of description
    complexity += Math.min(task.description.length / 100, 3);

    // Number of files involved
    if (task.context.files) {
      complexity += task.context.files.length * 0.5;
    }

    // Requirements count
    if (task.context.requirements) {
      complexity += task.context.requirements.length * 0.3;
    }

    // Keywords indicating complexity
    const complexKeywords = [
      'architecture', 'system', 'integration', 'migration',
      'refactor', 'security', 'performance', 'scale',
      'distributed', 'concurrent', 'async', 'real-time',
    ];
    for (const keyword of complexKeywords) {
      if (task.description.toLowerCase().includes(keyword)) {
        complexity += 0.5;
      }
    }

    // Priority boost
    const priorityMultiplier = {
      critical: 1.5,
      high: 1.2,
      medium: 1.0,
      low: 0.8,
    };
    complexity *= priorityMultiplier[task.priority];

    this.emit('task:analyzed', task, complexity);
    return Math.min(complexity, 10); // Cap at 10
  }

  /**
   * Decompose a task into sub-tasks
   */
  decompose(task: TaskDefinition): DecompositionResult {
    const complexity = this.calculateComplexity(task);
    let subTasks: SubTask[] = [];

    // Only decompose if complexity exceeds threshold
    if (complexity >= this.config.minComplexityForDecomposition) {
      // Try patterns in priority order
      for (const pattern of this.patterns) {
        const match = task.description.match(pattern.pattern);
        if (match) {
          subTasks = pattern.decomposition(task, match);
          if (subTasks.length > 0) break;
        }
      }

      // Fallback: generic decomposition if no pattern matched
      if (subTasks.length === 0 && complexity >= this.config.minComplexityForDecomposition + 2) {
        subTasks = this.genericDecomposition(task);
      }
    }

    // Limit number of sub-tasks
    subTasks = subTasks.slice(0, this.config.maxSubTasks);

    // Build dependency graph
    const dependencies = this.buildDependencyGraph(subTasks);

    // Identify parallel groups
    const parallelGroups = this.identifyParallelGroups(subTasks, dependencies);

    // Estimate duration
    const estimatedDuration = this.estimateDuration(subTasks, parallelGroups);

    this.emit('task:decomposed', task, subTasks);

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
   * Generic decomposition for complex tasks without specific patterns
   */
  private genericDecomposition(task: TaskDefinition): SubTask[] {
    return [
      this.createSubTask(task, {
        description: `Analyze requirements: ${task.description.slice(0, 50)}...`,
        type: 'analysis',
        priority: 'high',
      }),
      this.createSubTask(task, {
        description: `Plan implementation approach`,
        type: 'planning',
        priority: 'high',
      }),
      this.createSubTask(task, {
        description: `Execute main implementation`,
        type: 'implementation',
        priority: 'medium',
      }),
      this.createSubTask(task, {
        description: `Review and validate results`,
        type: 'review',
        priority: 'medium',
      }),
    ];
  }

  /**
   * Create a sub-task
   */
  private createSubTask(
    parent: TaskDefinition,
    override: Partial<SubTask> & { description: string }
  ): SubTask {
    const id = `subtask-${++this.taskCounter}-${Date.now()}`;

    const subTask: SubTask = {
      id,
      parentId: parent.id,
      description: override.description,
      type: override.type || 'general',
      priority: override.priority as TaskPriority || parent.priority,
      context: override.context || parent.context,
      dependencies: override.dependencies,
      status: 'pending',
      metadata: { ...parent.metadata, ...override.metadata },
    };

    this.emit('subtask:created', subTask);
    return subTask;
  }

  /**
   * Build dependency graph from sub-tasks
   */
  private buildDependencyGraph(subTasks: SubTask[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const task of subTasks) {
      graph.set(task.id, task.dependencies || []);
    }

    return graph;
  }

  /**
   * Identify groups of tasks that can run in parallel
   */
  private identifyParallelGroups(
    subTasks: SubTask[],
    dependencies: Map<string, string[]>
  ): SubTask[][] {
    const groups: SubTask[][] = [];
    const completed = new Set<string>();
    const remaining = new Set(subTasks.map(t => t.id));

    while (remaining.size > 0) {
      const group: SubTask[] = [];

      for (const taskId of remaining) {
        const deps = dependencies.get(taskId) || [];
        if (deps.every(d => completed.has(d))) {
          const task = subTasks.find(t => t.id === taskId);
          if (task) group.push(task);
        }
      }

      if (group.length === 0) {
        // Circular dependency or other issue - break out
        console.warn('[TaskDecomposer] Could not resolve all dependencies');
        break;
      }

      groups.push(group);

      for (const task of group) {
        remaining.delete(task.id);
        completed.add(task.id);
      }
    }

    return groups;
  }

  /**
   * Estimate total duration based on parallel execution
   */
  private estimateDuration(subTasks: SubTask[], parallelGroups: SubTask[][]): number {
    // Base estimate: 30s per sub-task
    const baseTime = 30000;

    // Sum the max time of each parallel group
    let totalTime = 0;
    for (const group of parallelGroups) {
      // Time is determined by the slowest task in the group
      const groupTime = Math.max(...group.map(() => baseTime));
      totalTime += groupTime;
    }

    return totalTime;
  }

  /**
   * Check if a task should be decomposed
   */
  shouldDecompose(task: TaskDefinition): boolean {
    const complexity = this.calculateComplexity(task);
    return complexity >= this.config.minComplexityForDecomposition;
  }

  /**
   * Format decomposition result for display
   */
  formatResult(result: DecompositionResult): string {
    let output = `
┌─ TASK DECOMPOSITION ─────────────────────────────────────────────┐
│ Original: ${result.originalTask.description.slice(0, 50).padEnd(50)} │
│ Complexity: ${result.complexity.toFixed(1).padEnd(5)} | Sub-tasks: ${result.subTasks.length.toString().padEnd(3)} | Est: ${(result.estimatedDuration / 1000).toFixed(0)}s     │
├──────────────────────────────────────────────────────────────────┤`;

    for (let i = 0; i < result.parallelGroups.length; i++) {
      const group = result.parallelGroups[i];
      const prefix = group.length > 1 ? '║' : '│';

      output += `\n│ Group ${i + 1} (${group.length > 1 ? 'parallel' : 'sequential'})                                             │`;

      for (const task of group) {
        output += `\n${prefix}  ├─ [${task.type.padEnd(15)}] ${task.description.slice(0, 40).padEnd(40)} │`;
      }
    }

    output += `\n└──────────────────────────────────────────────────────────────────┘`;
    return output;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createTaskDecomposer(
  config?: Partial<CouncilSystemConfig['taskDecomposer']>
): TaskDecomposer {
  return new TaskDecomposer(config);
}
