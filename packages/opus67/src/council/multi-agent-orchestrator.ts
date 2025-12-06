/**
 * OPUS 67 Multi-Agent Orchestrator
 * Coordinates complex multi-agent workflows
 */

import { EventEmitter } from 'eventemitter3';
import {
  TaskDefinition,
  SubTask,
  TaskResult,
  AgentInstance,
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  Vote,
  VotingRound,
  OrchestratorEvents,
  CouncilSystemConfig,
  DEFAULT_COUNCIL_CONFIG,
} from './types.js';
import { AgentPool } from './agent-pool.js';
import { TaskDecomposer } from './task-decomposer.js';

// =============================================================================
// TYPES
// =============================================================================

interface ExecutionContext {
  execution: WorkflowExecution;
  results: Map<string, TaskResult>;
  agentAssignments: Map<string, string>; // taskId -> agentId
  activePromises: Map<string, Promise<TaskResult>>;
}

interface OrchestratorConfig {
  orchestration: CouncilSystemConfig['orchestration'];
  voting: CouncilSystemConfig['voting'];
}

// =============================================================================
// MULTI-AGENT ORCHESTRATOR
// =============================================================================

export class MultiAgentOrchestrator extends EventEmitter<OrchestratorEvents> {
  private config: OrchestratorConfig;
  private agentPool: AgentPool;
  private taskDecomposer: TaskDecomposer;
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, ExecutionContext> = new Map();
  private executionCounter = 0;

  constructor(
    agentPool: AgentPool,
    taskDecomposer: TaskDecomposer,
    config?: Partial<OrchestratorConfig>
  ) {
    super();
    this.agentPool = agentPool;
    this.taskDecomposer = taskDecomposer;
    this.config = {
      orchestration: { ...DEFAULT_COUNCIL_CONFIG.orchestration, ...config?.orchestration },
      voting: { ...DEFAULT_COUNCIL_CONFIG.voting, ...config?.voting },
    };
  }

  /**
   * Register a workflow template
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Execute a task with automatic agent orchestration
   */
  async executeTask(task: TaskDefinition): Promise<TaskResult> {
    // Decompose task if complex
    const decomposition = this.taskDecomposer.decompose(task);

    if (decomposition.subTasks.length === 0) {
      // Simple task - execute directly
      return this.executeSingleTask(task);
    }

    // Complex task - create dynamic workflow
    const workflow = this.createDynamicWorkflow(task, decomposition);
    return this.executeWorkflow(workflow);
  }

  /**
   * Execute a single task with best-matching agent
   */
  private async executeSingleTask(task: TaskDefinition): Promise<TaskResult> {
    // Find best agents
    const matches = this.agentPool.findAgentsForTask(task, 3);

    if (matches.length === 0) {
      return {
        success: false,
        output: 'No suitable agents available for this task',
        errors: ['No agent match found'],
      };
    }

    // Try agents in order until one succeeds
    for (const match of matches) {
      const agent = match.agent;

      if (!this.agentPool.acquireAgent(agent.definition.id, task.id)) {
        continue; // Agent not available
      }

      try {
        const result = await this.runAgentTask(agent, task);
        this.agentPool.releaseAgent(agent.definition.id, result.success);

        if (result.success) {
          this.emit('agent:completed', agent, result);
          return result;
        }
      } catch (error) {
        this.agentPool.releaseAgent(agent.definition.id, false);
        console.error(`[Orchestrator] Agent ${agent.definition.id} failed:`, error);
      }
    }

    return {
      success: false,
      output: 'All agents failed to complete the task',
      errors: ['Exhausted all agent options'],
    };
  }

  /**
   * Run a task with a specific agent
   */
  private async runAgentTask(agent: AgentInstance, task: TaskDefinition): Promise<TaskResult> {
    const startTime = Date.now();

    // Simulate agent execution (in real implementation, this would call the actual agent)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));

    const duration = Date.now() - startTime;

    // Mock result - in production this would be actual agent output
    const result: TaskResult = {
      success: Math.random() > 0.1, // 90% success rate for simulation
      output: `Agent ${agent.definition.name} completed: ${task.description}`,
      metrics: {
        durationMs: duration,
        tokensUsed: Math.floor(Math.random() * 1000) + 500,
        confidence: 0.8 + Math.random() * 0.2,
      },
    };

    return result;
  }

  /**
   * Create a dynamic workflow from task decomposition
   */
  private createDynamicWorkflow(
    task: TaskDefinition,
    decomposition: ReturnType<TaskDecomposer['decompose']>
  ): Workflow {
    const steps: WorkflowStep[] = [];
    let stepCounter = 0;

    // Create steps from parallel groups
    for (let i = 0; i < decomposition.parallelGroups.length; i++) {
      const group = decomposition.parallelGroups[i];
      const isParallel = group.length > 1;

      const step: WorkflowStep = {
        id: `step-${++stepCounter}`,
        type: isParallel ? 'parallel' : 'sequential',
        agents: [], // Will be assigned dynamically
        task: {
          id: `group-${i}`,
          description: group.map(t => t.description).join('; '),
          priority: task.priority,
          type: 'compound',
          context: task.context,
        },
        onSuccess: i < decomposition.parallelGroups.length - 1 ? `step-${stepCounter + 1}` : undefined,
      };

      steps.push(step);
    }

    return {
      id: `workflow-${task.id}`,
      name: `Dynamic workflow for: ${task.description.slice(0, 50)}`,
      description: `Auto-generated workflow with ${steps.length} steps`,
      steps,
      entryPoint: 'step-1',
      exitPoints: [`step-${steps.length}`],
      globalTimeout: this.config.orchestration.defaultTimeout,
    };
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: Workflow): Promise<TaskResult> {
    // Check concurrent workflow limit
    const activeCount = Array.from(this.executions.values())
      .filter(e => e.execution.status === 'running').length;

    if (activeCount >= this.config.orchestration.maxConcurrentWorkflows) {
      return {
        success: false,
        output: 'Maximum concurrent workflows reached',
        errors: ['Workflow queue full'],
      };
    }

    // Create execution context
    const execution: WorkflowExecution = {
      id: `exec-${++this.executionCounter}-${Date.now()}`,
      workflowId: workflow.id,
      status: 'running',
      currentStep: workflow.entryPoint,
      completedSteps: [],
      stepResults: new Map(),
      startedAt: new Date().toISOString(),
    };

    const context: ExecutionContext = {
      execution,
      results: new Map(),
      agentAssignments: new Map(),
      activePromises: new Map(),
    };

    this.executions.set(execution.id, context);
    this.emit('workflow:started', execution);

    try {
      // Execute workflow steps
      await this.executeWorkflowSteps(workflow, context);

      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      this.emit('workflow:completed', execution);

      // Aggregate results
      return this.aggregateResults(context);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      this.emit('workflow:failed', execution, error as Error);

      return {
        success: false,
        output: 'Workflow execution failed',
        errors: [execution.error],
      };
    } finally {
      this.executions.delete(execution.id);
    }
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflowSteps(workflow: Workflow, context: ExecutionContext): Promise<void> {
    let currentStepId: string | undefined = workflow.entryPoint;
    const timeout = workflow.globalTimeout || this.config.orchestration.defaultTimeout;
    const startTime = Date.now();

    while (currentStepId) {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Workflow timeout exceeded');
      }

      const step = workflow.steps.find(s => s.id === currentStepId);
      if (!step) {
        throw new Error(`Step not found: ${currentStepId}`);
      }

      context.execution.currentStep = currentStepId;
      this.emit('step:started', step, context.execution);

      // Execute step based on type
      const result = await this.executeStep(step, context);

      context.results.set(step.id, result);
      context.execution.completedSteps.push(step.id);
      this.emit('step:completed', step, result);

      // Determine next step
      if (result.success) {
        currentStepId = step.onSuccess;
      } else if (step.onFailure) {
        currentStepId = step.onFailure;
      } else if (this.config.orchestration.retryEnabled && step.retryPolicy) {
        // Retry logic
        let retries = 0;
        while (retries < (step.retryPolicy.maxRetries || this.config.orchestration.maxRetries)) {
          await new Promise(r => setTimeout(r, step.retryPolicy!.backoffMs * (retries + 1)));
          const retryResult = await this.executeStep(step, context);
          if (retryResult.success) {
            context.results.set(step.id, retryResult);
            currentStepId = step.onSuccess;
            break;
          }
          retries++;
        }
        if (retries >= (step.retryPolicy.maxRetries || this.config.orchestration.maxRetries)) {
          throw new Error(`Step ${step.id} failed after ${retries} retries`);
        }
      } else {
        throw new Error(`Step ${step.id} failed with no fallback`);
      }

      // Check if we've reached an exit point
      if (!currentStepId || workflow.exitPoints.includes(step.id)) {
        break;
      }
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: WorkflowStep, context: ExecutionContext): Promise<TaskResult> {
    switch (step.type) {
      case 'parallel':
        return this.executeParallelStep(step, context);

      case 'sequential':
        return this.executeSequentialStep(step, context);

      case 'conditional':
        return this.executeConditionalStep(step, context);

      case 'vote':
        return this.executeVotingStep(step, context);

      default:
        return this.executeSingleTask(step.task);
    }
  }

  /**
   * Execute tasks in parallel
   */
  private async executeParallelStep(step: WorkflowStep, context: ExecutionContext): Promise<TaskResult> {
    // Find agents for this step
    const matches = this.agentPool.findAgentsForTask(step.task, step.agents.length || 3);

    const promises = matches.map(async match => {
      const subTask: TaskDefinition = {
        ...step.task,
        id: `${step.task.id}-${match.agent.definition.id}`,
      };

      if (this.agentPool.acquireAgent(match.agent.definition.id, subTask.id)) {
        try {
          const result = await this.runAgentTask(match.agent, subTask);
          this.agentPool.releaseAgent(match.agent.definition.id, result.success);
          return result;
        } catch (error) {
          this.agentPool.releaseAgent(match.agent.definition.id, false);
          throw error;
        }
      }
      return null;
    });

    const results = (await Promise.all(promises)).filter((r): r is TaskResult => r !== null);

    // Aggregate parallel results
    const successCount = results.filter(r => r.success).length;
    const allOutputs = results.map(r => r.output).join('\n---\n');

    return {
      success: successCount >= Math.ceil(results.length / 2),
      output: allOutputs,
      artifacts: results.flatMap(r => r.artifacts || []),
      metrics: {
        durationMs: Math.max(...results.map(r => r.metrics?.durationMs || 0)),
        tokensUsed: results.reduce((sum, r) => sum + (r.metrics?.tokensUsed || 0), 0),
        confidence: results.reduce((sum, r) => sum + (r.metrics?.confidence || 0), 0) / results.length,
      },
    };
  }

  /**
   * Execute tasks sequentially
   */
  private async executeSequentialStep(step: WorkflowStep, _context: ExecutionContext): Promise<TaskResult> {
    return this.executeSingleTask(step.task);
  }

  /**
   * Execute conditional step
   */
  private async executeConditionalStep(step: WorkflowStep, context: ExecutionContext): Promise<TaskResult> {
    // Evaluate condition based on previous results
    const condition = step.condition || 'true';
    const previousResults = Array.from(context.results.values());

    // Simple condition evaluation
    const shouldExecute = this.evaluateCondition(condition, previousResults);

    if (shouldExecute) {
      return this.executeSingleTask(step.task);
    }

    return {
      success: true,
      output: 'Conditional step skipped',
      metrics: { durationMs: 0, tokensUsed: 0, confidence: 1 },
    };
  }

  /**
   * Execute voting step
   */
  private async executeVotingStep(step: WorkflowStep, _context: ExecutionContext): Promise<TaskResult> {
    // Find reviewers
    const reviewers = this.agentPool.getAgentsByRole('reviewer').slice(0, 3);

    if (reviewers.length === 0) {
      return {
        success: false,
        output: 'No reviewers available for voting',
        errors: ['No reviewer agents'],
      };
    }

    const round: VotingRound = {
      id: `vote-${Date.now()}`,
      topic: step.task.description,
      votes: [],
      quorum: Math.ceil(reviewers.length * this.config.voting.quorumPercentage),
      requiredMajority: this.config.voting.approvalThreshold,
      status: 'open',
    };

    // Collect votes
    for (const reviewer of reviewers) {
      const vote: Vote = {
        voterId: reviewer.definition.id,
        voterRole: reviewer.definition.role,
        type: Math.random() > 0.3 ? 'approve' : 'reject', // Simulated vote
        confidence: 0.7 + Math.random() * 0.3,
        reasoning: `Review by ${reviewer.definition.name}`,
        timestamp: new Date().toISOString(),
      };

      round.votes.push(vote);
      this.emit('vote:cast', vote, round);
    }

    // Calculate decision
    const approvals = round.votes.filter(v => v.type === 'approve').length;
    const approvalRate = approvals / round.votes.length;

    round.status = 'decided';
    round.decision = {
      outcome: approvalRate >= round.requiredMajority ? 'approved' : 'rejected',
      confidence: approvalRate,
      summary: `${approvals}/${round.votes.length} approved`,
    };

    this.emit('consensus:reached', round);

    return {
      success: round.decision.outcome === 'approved',
      output: `Voting result: ${round.decision.outcome} (${round.decision.summary})`,
      metrics: {
        durationMs: 0,
        tokensUsed: 0,
        confidence: round.decision.confidence,
      },
    };
  }

  /**
   * Evaluate a condition string
   */
  private evaluateCondition(condition: string, previousResults: TaskResult[]): boolean {
    const lowerCondition = condition.toLowerCase();

    if (lowerCondition === 'true') return true;
    if (lowerCondition === 'false') return false;

    // Check if all previous succeeded
    if (lowerCondition.includes('all_success')) {
      return previousResults.every(r => r.success);
    }

    // Check if any failed
    if (lowerCondition.includes('any_failure')) {
      return previousResults.some(r => !r.success);
    }

    // Default: check if previous step succeeded
    return previousResults.length === 0 || previousResults[previousResults.length - 1].success;
  }

  /**
   * Aggregate results from all steps
   */
  private aggregateResults(context: ExecutionContext): TaskResult {
    const results = Array.from(context.results.values());

    if (results.length === 0) {
      return {
        success: false,
        output: 'No results produced',
        errors: ['Empty result set'],
      };
    }

    const successCount = results.filter(r => r.success).length;
    const allOutputs = results.map(r => r.output).join('\n\n---\n\n');
    const allArtifacts = results.flatMap(r => r.artifacts || []);
    const allErrors = results.flatMap(r => r.errors || []);
    const allWarnings = results.flatMap(r => r.warnings || []);

    return {
      success: successCount === results.length,
      output: allOutputs,
      artifacts: allArtifacts,
      metrics: {
        durationMs: results.reduce((sum, r) => sum + (r.metrics?.durationMs || 0), 0),
        tokensUsed: results.reduce((sum, r) => sum + (r.metrics?.tokensUsed || 0), 0),
        confidence: results.reduce((sum, r) => sum + (r.metrics?.confidence || 0), 0) / results.length,
      },
      errors: allErrors.length > 0 ? allErrors : undefined,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    };
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId)?.execution;
  }

  /**
   * Cancel a running execution
   */
  cancelExecution(executionId: string): boolean {
    const context = this.executions.get(executionId);
    if (!context || context.execution.status !== 'running') {
      return false;
    }

    context.execution.status = 'cancelled';
    this.executions.delete(executionId);
    return true;
  }

  /**
   * Get orchestrator stats
   */
  getStats(): {
    activeExecutions: number;
    totalWorkflows: number;
    agentPoolStats: ReturnType<AgentPool['getStats']>;
  } {
    return {
      activeExecutions: Array.from(this.executions.values())
        .filter(e => e.execution.status === 'running').length,
      totalWorkflows: this.workflows.size,
      agentPoolStats: this.agentPool.getStats(),
    };
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createOrchestrator(
  agentPool: AgentPool,
  taskDecomposer: TaskDecomposer,
  config?: Partial<OrchestratorConfig>
): MultiAgentOrchestrator {
  return new MultiAgentOrchestrator(agentPool, taskDecomposer, config);
}
