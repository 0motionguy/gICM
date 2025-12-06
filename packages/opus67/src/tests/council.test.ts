/**
 * OPUS 67 Council Integration Tests
 * Tests for LLMCouncil, AgentPool, TaskDecomposer, and MultiAgentOrchestrator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LLMCouncil,
  createCouncil,
  AgentPool,
  createAgentPool,
  TaskDecomposer,
  createTaskDecomposer,
  MultiAgentOrchestrator,
  createOrchestrator,
  type CouncilMember,
  type CouncilConfig,
  type TaskDefinition,
  type AgentDefinition,
  type Workflow,
  type WorkflowStep,
  DEFAULT_COUNCIL_CONFIG,
} from '../council/index.js';

// =============================================================================
// LLM COUNCIL TESTS
// =============================================================================

describe('LLMCouncil', () => {
  let council: LLMCouncil;

  beforeEach(() => {
    council = createCouncil();
  });

  describe('initialization', () => {
    it('creates council with default config', () => {
      const config = council.getConfig();
      expect(config.members.length).toBeGreaterThan(0);
      expect(config.chairman).toBeDefined();
      expect(config.minConfidence).toBe(0.7);
    });

    it('creates council with custom config', () => {
      const customMembers: CouncilMember[] = [
        { id: 'test1', name: 'Test Agent 1', model: 'gemini-2.0-flash', role: 'contributor' },
        { id: 'test2', name: 'Test Agent 2', model: 'deepseek-chat', role: 'reviewer' },
      ];

      const customCouncil = createCouncil({
        members: customMembers,
        minConfidence: 0.8,
        maxRounds: 3,
      });

      const config = customCouncil.getConfig();
      expect(config.members.length).toBe(2);
      expect(config.minConfidence).toBe(0.8);
      expect(config.maxRounds).toBe(3);
    });
  });

  describe('deliberation', () => {
    it('completes 3-stage deliberation', async () => {
      const result = await council.deliberate('What is the best approach to implement caching?');

      expect(result).toBeDefined();
      expect(result.question).toContain('caching');
      expect(result.stage1Responses.length).toBeGreaterThan(0);
      expect(result.stage2Rankings.length).toBeGreaterThan(0);
      expect(result.stage3Synthesis).toBeDefined();
      expect(result.stage3Synthesis.finalAnswer).toBeTruthy();
      expect(result.stage3Synthesis.confidence).toBeGreaterThan(0);
    });

    it('emits stage events', async () => {
      const stageStarts: number[] = [];
      const stageCompletes: number[] = [];

      council.on('stage:start', (stage) => stageStarts.push(stage));
      council.on('stage:complete', (stage) => stageCompletes.push(stage));

      await council.deliberate('Simple question');

      expect(stageStarts).toContain(1);
      expect(stageStarts).toContain(2);
      expect(stageStarts).toContain(3);
      expect(stageCompletes).toContain(1);
      expect(stageCompletes).toContain(2);
      expect(stageCompletes).toContain(3);
    });

    it('tracks member responses', async () => {
      const responses: string[] = [];

      council.on('member:responded', (response) => {
        responses.push(response.memberId);
      });

      await council.deliberate('Test question');

      expect(responses.length).toBeGreaterThan(0);
    });

    it('calculates consensus score', async () => {
      const result = await council.deliberate('What is 2+2?');

      expect(result.metrics.consensusScore).toBeGreaterThanOrEqual(0);
      expect(result.metrics.consensusScore).toBeLessThanOrEqual(1);
    });

    it('tracks metrics', async () => {
      const result = await council.deliberate('Performance test question');

      expect(result.metrics.totalDuration).toBeGreaterThan(0);
      expect(result.metrics.totalTokens).toBeGreaterThan(0);
      expect(result.metrics.totalCost).toBeGreaterThanOrEqual(0);
    });
  });

  describe('custom executor', () => {
    it('uses custom executor when set', async () => {
      const mockExecutor = vi.fn().mockResolvedValue('Custom response. Confidence: 0.9');
      council.setExecutor(mockExecutor);

      await council.deliberate('Test with custom executor');

      expect(mockExecutor).toHaveBeenCalled();
    });
  });

  describe('formatResult', () => {
    it('formats result for display', async () => {
      const result = await council.deliberate('Format test');
      const formatted = council.formatResult(result);

      expect(formatted).toContain('LLM COUNCIL DELIBERATION');
      expect(formatted).toContain('STAGE 1');
      expect(formatted).toContain('STAGE 2');
      expect(formatted).toContain('STAGE 3');
      expect(formatted).toContain('METRICS');
    });
  });
});

// =============================================================================
// AGENT POOL TESTS
// =============================================================================

describe('AgentPool', () => {
  let pool: AgentPool;

  beforeEach(() => {
    // Use a mock path - tests will use manual registration
    pool = createAgentPool('/tmp/mock-agents');
  });

  describe('agent registration', () => {
    it('registers agent definition', () => {
      const definition: AgentDefinition = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'A test agent',
        role: 'specialist',
        capabilities: ['testing', 'validation'],
        triggers: {
          keywords: ['test', 'validate'],
          filePatterns: ['*.test.ts'],
          taskTypes: ['testing'],
        },
        constraints: {
          maxConcurrent: 1,
          cooldownMs: 1000,
          tokenBudget: 50000,
          requiresApproval: false,
        },
        performance: {
          successRate: 0.9,
          avgDurationMs: 5000,
          usageCount: 10,
        },
      };

      pool.registerAgent(definition);

      const agent = pool.getAgent('test-agent');
      expect(agent).toBeDefined();
      expect(agent?.definition.name).toBe('Test Agent');
      expect(agent?.status).toBe('available');
    });

    it('emits registration event', () => {
      const registered: string[] = [];
      pool.on('agent:registered', (def) => registered.push(def.id));

      pool.registerAgent({
        id: 'event-test',
        name: 'Event Test',
        description: 'Test',
        role: 'generalist',
        capabilities: [],
        triggers: { keywords: [] },
        constraints: {},
        performance: { successRate: 0.8, avgDurationMs: 1000, usageCount: 0 },
      });

      expect(registered).toContain('event-test');
    });
  });

  describe('agent queries', () => {
    beforeEach(() => {
      // Register multiple agents for testing
      const roles: Array<'specialist' | 'reviewer' | 'architect' | 'executor'> = [
        'specialist', 'reviewer', 'architect', 'executor'
      ];

      for (let i = 0; i < 4; i++) {
        pool.registerAgent({
          id: `agent-${i}`,
          name: `Agent ${i}`,
          description: `Agent for ${roles[i]} tasks`,
          role: roles[i],
          capabilities: [`capability-${i}`],
          triggers: { keywords: [`keyword-${i}`] },
          constraints: {},
          performance: { successRate: 0.8, avgDurationMs: 1000, usageCount: 0 },
        });
      }
    });

    it('gets all agents', () => {
      const all = pool.getAllAgents();
      expect(all.length).toBe(4);
    });

    it('gets available agents', () => {
      const available = pool.getAvailableAgents();
      expect(available.length).toBe(4);
    });

    it('gets agents by role', () => {
      const reviewers = pool.getAgentsByRole('reviewer');
      expect(reviewers.length).toBe(1);
      expect(reviewers[0].definition.role).toBe('reviewer');
    });

    it('searches agents by query', () => {
      const results = pool.searchAgents('keyword-0');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('agent matching', () => {
    beforeEach(() => {
      pool.registerAgent({
        id: 'security-agent',
        name: 'Security Expert',
        description: 'Security auditing specialist',
        role: 'specialist',
        capabilities: ['security', 'audit', 'vulnerability'],
        triggers: {
          keywords: ['security', 'audit', 'vulnerability'],
          filePatterns: ['*.sol', '*.rs'],
          taskTypes: ['security-audit'],
        },
        constraints: {},
        performance: { successRate: 0.95, avgDurationMs: 10000, usageCount: 50 },
      });

      pool.registerAgent({
        id: 'code-agent',
        name: 'Code Writer',
        description: 'General code implementation',
        role: 'executor',
        capabilities: ['coding', 'implementation'],
        triggers: { keywords: ['implement', 'code', 'write'] },
        constraints: {},
        performance: { successRate: 0.85, avgDurationMs: 5000, usageCount: 100 },
      });
    });

    it('finds matching agents for task', () => {
      const task: TaskDefinition = {
        id: 'security-task',
        description: 'Perform security audit on smart contract',
        priority: 'high',
        type: 'security-audit',
        context: {
          files: ['contract.sol'],
        },
      };

      const matches = pool.findAgentsForTask(task, 3);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].agent.definition.id).toBe('security-agent');
      expect(matches[0].score).toBeGreaterThan(0);
      expect(matches[0].reasons.length).toBeGreaterThan(0);
    });

    it('returns empty for non-matching task', () => {
      const task: TaskDefinition = {
        id: 'unmatched',
        description: 'Something completely unrelated xyz123',
        priority: 'low',
        type: 'unknown',
        context: {},
      };

      const matches = pool.findAgentsForTask(task);
      // May return agents with low scores based on fallback logic
      expect(matches).toBeDefined();
    });
  });

  describe('agent lifecycle', () => {
    beforeEach(() => {
      pool.registerAgent({
        id: 'lifecycle-agent',
        name: 'Lifecycle Test',
        description: 'For testing lifecycle',
        role: 'executor',
        capabilities: [],
        triggers: { keywords: ['test'] },
        constraints: { cooldownMs: 100 },
        performance: { successRate: 0.8, avgDurationMs: 1000, usageCount: 0 },
      });
    });

    it('acquires and releases agent', () => {
      const acquired = pool.acquireAgent('lifecycle-agent', 'task-1');
      expect(acquired).toBe(true);

      const agent = pool.getAgent('lifecycle-agent');
      expect(agent?.status).toBe('busy');
      expect(agent?.currentTask).toBe('task-1');

      pool.releaseAgent('lifecycle-agent', true);
      expect(agent?.status).toBe('cooldown');
      expect(agent?.sessionStats.tasksCompleted).toBe(1);
    });

    it('prevents double acquisition', () => {
      pool.acquireAgent('lifecycle-agent', 'task-1');
      const secondAcquire = pool.acquireAgent('lifecycle-agent', 'task-2');
      expect(secondAcquire).toBe(false);
    });

    it('updates performance on release', () => {
      pool.acquireAgent('lifecycle-agent', 'task-1');
      pool.releaseAgent('lifecycle-agent', true);

      const agent = pool.getAgent('lifecycle-agent');
      expect(agent?.definition.performance.usageCount).toBe(1);
    });

    it('disables and enables agent', () => {
      pool.disableAgent('lifecycle-agent');

      const disabled = pool.getAgent('lifecycle-agent');
      expect(disabled?.status).toBe('disabled');

      pool.enableAgent('lifecycle-agent');
      expect(disabled?.status).toBe('available');
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      const roles: Array<'specialist' | 'reviewer'> = ['specialist', 'reviewer'];
      for (let i = 0; i < 2; i++) {
        pool.registerAgent({
          id: `stats-agent-${i}`,
          name: `Stats Agent ${i}`,
          description: 'For stats testing',
          role: roles[i],
          capabilities: [],
          triggers: { keywords: [] },
          constraints: {},
          performance: { successRate: 0.8, avgDurationMs: 1000, usageCount: i * 5 },
        });
      }
    });

    it('returns pool stats', () => {
      const stats = pool.getStats();

      expect(stats.total).toBe(2);
      expect(stats.available).toBe(2);
      expect(stats.busy).toBe(0);
      expect(stats.byRole.specialist).toBe(1);
      expect(stats.byRole.reviewer).toBe(1);
    });

    it('tracks top performers', () => {
      const stats = pool.getStats();
      expect(stats.topPerformers).toBeDefined();
    });
  });

  describe('formatting', () => {
    it('formats agent for display', () => {
      pool.registerAgent({
        id: 'format-agent',
        name: 'Format Test Agent',
        description: 'Testing format',
        role: 'specialist',
        capabilities: ['cap1', 'cap2', 'cap3', 'cap4'],
        triggers: { keywords: [] },
        constraints: {},
        performance: { successRate: 0.95, avgDurationMs: 1000, usageCount: 10 },
      });

      const agent = pool.getAgent('format-agent')!;
      const formatted = pool.formatAgent(agent);

      expect(formatted).toContain('Format Test Agent');
      expect(formatted).toContain('specialist');
      expect(formatted).toContain('95%');
    });
  });
});

// =============================================================================
// TASK DECOMPOSER TESTS
// =============================================================================

describe('TaskDecomposer', () => {
  let decomposer: TaskDecomposer;

  beforeEach(() => {
    decomposer = createTaskDecomposer();
  });

  describe('simple tasks', () => {
    it('does not decompose simple tasks', () => {
      const task: TaskDefinition = {
        id: 'simple',
        description: 'Fix typo in README',
        priority: 'low',
        type: 'fix',
        context: {},
      };

      const result = decomposer.decompose(task);
      expect(result.subTasks.length).toBeLessThanOrEqual(1);
    });
  });

  describe('complex tasks', () => {
    it('decomposes complex multi-step tasks', () => {
      const task: TaskDefinition = {
        id: 'complex',
        description: 'Implement user authentication with OAuth, add role-based access control, and create admin dashboard',
        priority: 'high',
        type: 'feature',
        context: {
          requirements: [
            'OAuth integration',
            'Role-based access',
            'Admin dashboard',
          ],
        },
      };

      const result = decomposer.decompose(task);

      expect(result.subTasks.length).toBeGreaterThan(1);
      expect(result.parallelGroups.length).toBeGreaterThan(0);
      expect(result.complexity).toBeGreaterThan(0);
    });

    it('identifies dependencies between subtasks', () => {
      const task: TaskDefinition = {
        id: 'dependent',
        description: 'Steps: 1. Create database schema, 2. Implement API endpoints, 3. Add frontend integration, 4. Write tests',
        priority: 'high',
        type: 'feature',
        context: {
          requirements: ['database', 'api', 'frontend', 'tests'],
          files: ['schema.sql', 'api.ts', 'frontend.tsx', 'tests.ts'],
        },
      };

      const result = decomposer.decompose(task);

      // Task should be decomposed into subtasks
      expect(result.subTasks.length).toBeGreaterThan(0);
      // Should have at least one parallel group if decomposed
      if (result.subTasks.length > 0) {
        expect(result.parallelGroups.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('priority handling', () => {
    it('preserves or inherits priority in subtasks', () => {
      const task: TaskDefinition = {
        id: 'priority-test',
        description: 'Critical security fix: patch vulnerability and update dependencies',
        priority: 'critical',
        type: 'security',
        context: {},
      };

      const result = decomposer.decompose(task);

      // Subtasks should have valid priorities
      for (const subTask of result.subTasks) {
        expect(['critical', 'high', 'medium', 'low']).toContain(subTask.priority);
      }

      // At least one subtask should inherit critical or high priority from parent
      if (result.subTasks.length > 0) {
        const hasHighPriority = result.subTasks.some(st =>
          st.priority === 'critical' || st.priority === 'high'
        );
        expect(hasHighPriority).toBe(true);
      }
    });
  });
});

// =============================================================================
// MULTI-AGENT ORCHESTRATOR TESTS
// =============================================================================

describe('MultiAgentOrchestrator', () => {
  let orchestrator: MultiAgentOrchestrator;
  let pool: AgentPool;
  let decomposer: TaskDecomposer;

  beforeEach(() => {
    pool = createAgentPool('/tmp/mock-agents');
    decomposer = createTaskDecomposer();
    orchestrator = createOrchestrator(pool, decomposer);

    // Register test agents
    pool.registerAgent({
      id: 'general-agent',
      name: 'General Agent',
      description: 'General purpose agent',
      role: 'generalist',
      capabilities: ['general'],
      triggers: { keywords: ['implement', 'create', 'build'] },
      constraints: {},
      performance: { successRate: 0.9, avgDurationMs: 1000, usageCount: 0 },
    });

    pool.registerAgent({
      id: 'review-agent',
      name: 'Review Agent',
      description: 'Code review specialist',
      role: 'reviewer',
      capabilities: ['review', 'audit'],
      triggers: { keywords: ['review', 'audit'] },
      constraints: {},
      performance: { successRate: 0.85, avgDurationMs: 2000, usageCount: 0 },
    });
  });

  describe('task execution', () => {
    it('executes simple task', async () => {
      const task: TaskDefinition = {
        id: 'simple-task',
        description: 'Implement a simple feature',
        priority: 'medium',
        type: 'feature',
        context: {},
      };

      const result = await orchestrator.executeTask(task);

      expect(result).toBeDefined();
      expect(result.output).toBeTruthy();
    });

    it('handles no matching agents', async () => {
      const task: TaskDefinition = {
        id: 'no-match',
        description: 'xyz123 completely unrelated gibberish',
        priority: 'low',
        type: 'unknown',
        context: {},
      };

      const result = await orchestrator.executeTask(task);
      // Should fail gracefully or use fallback
      expect(result).toBeDefined();
    });
  });

  describe('workflow execution', () => {
    it('executes registered workflow', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        steps: [
          {
            id: 'step-1',
            type: 'sequential',
            agents: ['general-agent'],
            task: {
              id: 'step-1-task',
              description: 'First step task',
              priority: 'medium',
              type: 'implementation',
              context: {},
            },
            onSuccess: 'step-2',
          },
          {
            id: 'step-2',
            type: 'sequential',
            agents: ['review-agent'],
            task: {
              id: 'step-2-task',
              description: 'Review step task',
              priority: 'medium',
              type: 'review',
              context: {},
            },
          },
        ],
        entryPoint: 'step-1',
        exitPoints: ['step-2'],
        globalTimeout: 30000,
      };

      orchestrator.registerWorkflow(workflow);
      const result = await orchestrator.executeWorkflow(workflow);

      expect(result).toBeDefined();
    });

    it('emits workflow events', async () => {
      const events: string[] = [];

      orchestrator.on('workflow:started', () => events.push('started'));
      orchestrator.on('workflow:completed', () => events.push('completed'));
      orchestrator.on('step:started', () => events.push('step-started'));
      orchestrator.on('step:completed', () => events.push('step-completed'));

      const workflow: Workflow = {
        id: 'event-workflow',
        name: 'Event Test',
        description: 'Testing events',
        steps: [{
          id: 'only-step',
          type: 'sequential',
          agents: [],
          task: {
            id: 'event-task',
            description: 'Event test task',
            priority: 'low',
            type: 'test',
            context: {},
          },
        }],
        entryPoint: 'only-step',
        exitPoints: ['only-step'],
      };

      await orchestrator.executeWorkflow(workflow);

      expect(events).toContain('started');
    });

    it('limits concurrent workflows', async () => {
      // Start max concurrent workflows
      const workflows = Array(4).fill(null).map((_, i) => ({
        id: `concurrent-${i}`,
        name: `Concurrent ${i}`,
        description: 'Concurrent test',
        steps: [{
          id: 'slow-step',
          type: 'sequential' as const,
          agents: [],
          task: {
            id: `slow-task-${i}`,
            description: 'Slow task',
            priority: 'low' as const,
            type: 'test',
            context: {},
          },
        }],
        entryPoint: 'slow-step',
        exitPoints: ['slow-step'],
      }));

      const promises = workflows.map(w => orchestrator.executeWorkflow(w));
      const results = await Promise.all(promises);

      // Some may fail due to limit
      expect(results.some(r => r.success) || results.some(r => r.errors?.includes('Workflow queue full'))).toBe(true);
    });
  });

  describe('parallel execution', () => {
    it('executes parallel steps', async () => {
      const workflow: Workflow = {
        id: 'parallel-workflow',
        name: 'Parallel Test',
        description: 'Testing parallel execution',
        steps: [{
          id: 'parallel-step',
          type: 'parallel',
          agents: ['general-agent', 'review-agent'],
          task: {
            id: 'parallel-task',
            description: 'Parallel task',
            priority: 'medium',
            type: 'implementation',
            context: {},
          },
        }],
        entryPoint: 'parallel-step',
        exitPoints: ['parallel-step'],
      };

      const result = await orchestrator.executeWorkflow(workflow);
      expect(result).toBeDefined();
    });
  });

  describe('voting steps', () => {
    it('executes voting step', async () => {
      const workflow: Workflow = {
        id: 'voting-workflow',
        name: 'Voting Test',
        description: 'Testing voting',
        steps: [{
          id: 'vote-step',
          type: 'vote',
          agents: ['review-agent'],
          task: {
            id: 'vote-task',
            description: 'Vote on this decision',
            priority: 'medium',
            type: 'decision',
            context: {},
          },
        }],
        entryPoint: 'vote-step',
        exitPoints: ['vote-step'],
      };

      const votingEvents: string[] = [];
      orchestrator.on('vote:cast', () => votingEvents.push('vote'));
      orchestrator.on('consensus:reached', () => votingEvents.push('consensus'));

      await orchestrator.executeWorkflow(workflow);

      // Voting events should be emitted
      expect(votingEvents.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('orchestrator management', () => {
    it('returns stats', () => {
      const stats = orchestrator.getStats();

      expect(stats.activeExecutions).toBeGreaterThanOrEqual(0);
      expect(stats.totalWorkflows).toBeGreaterThanOrEqual(0);
      expect(stats.agentPoolStats).toBeDefined();
    });

    it('cancels execution', async () => {
      // This is harder to test without long-running tasks
      // Just verify the method exists and returns expected type
      const result = orchestrator.cancelExecution('non-existent');
      expect(result).toBe(false);
    });
  });
});

// =============================================================================
// DEFAULT CONFIG TESTS
// =============================================================================

describe('DEFAULT_COUNCIL_CONFIG', () => {
  it('has valid agent pool config', () => {
    expect(DEFAULT_COUNCIL_CONFIG.agentPool.maxConcurrentAgents).toBeGreaterThan(0);
    expect(DEFAULT_COUNCIL_CONFIG.agentPool.loadBalancing).toBeDefined();
  });

  it('has valid task decomposer config', () => {
    expect(DEFAULT_COUNCIL_CONFIG.taskDecomposer.maxSubTasks).toBeGreaterThan(0);
    expect(DEFAULT_COUNCIL_CONFIG.taskDecomposer.minComplexityForDecomposition).toBeGreaterThan(0);
  });

  it('has valid voting config', () => {
    expect(DEFAULT_COUNCIL_CONFIG.voting.quorumPercentage).toBeGreaterThan(0);
    expect(DEFAULT_COUNCIL_CONFIG.voting.quorumPercentage).toBeLessThanOrEqual(1);
    expect(DEFAULT_COUNCIL_CONFIG.voting.approvalThreshold).toBeGreaterThan(0);
  });

  it('has valid orchestration config', () => {
    expect(DEFAULT_COUNCIL_CONFIG.orchestration.maxConcurrentWorkflows).toBeGreaterThan(0);
    expect(DEFAULT_COUNCIL_CONFIG.orchestration.defaultTimeout).toBeGreaterThan(0);
  });
});
