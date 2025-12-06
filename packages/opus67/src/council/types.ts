/**
 * OPUS 67 Council Types
 * Enhanced types for multi-agent orchestration
 */

// =============================================================================
// AGENT TYPES
// =============================================================================

export type AgentRole =
  | 'specialist'    // Domain expert (security, performance, etc.)
  | 'generalist'    // Broad capability agent
  | 'reviewer'      // Code/design review specialist
  | 'architect'     // System design expert
  | 'executor'      // Task execution agent
  | 'coordinator';  // Workflow orchestration

export type AgentStatus =
  | 'available'
  | 'busy'
  | 'cooldown'
  | 'disabled';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  capabilities: string[];
  triggers: {
    keywords?: string[];
    filePatterns?: string[];
    taskTypes?: string[];
  };
  constraints: {
    maxConcurrent?: number;
    cooldownMs?: number;
    tokenBudget?: number;
    requiresApproval?: boolean;
  };
  performance: {
    successRate: number;
    avgDurationMs: number;
    usageCount: number;
  };
}

export interface AgentInstance {
  definition: AgentDefinition;
  status: AgentStatus;
  currentTask?: string;
  lastUsed?: string;
  sessionStats: {
    tasksCompleted: number;
    tasksFailed: number;
    tokensUsed: number;
  };
}

// =============================================================================
// TASK TYPES
// =============================================================================

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'failed';

export interface TaskDefinition {
  id: string;
  description: string;
  priority: TaskPriority;
  type: string;
  context: {
    files?: string[];
    codeSnippets?: string[];
    requirements?: string[];
    constraints?: string[];
  };
  dependencies?: string[];  // Task IDs this depends on
  deadline?: number;        // Timeout in ms
  metadata?: Record<string, unknown>;
}

export interface SubTask extends TaskDefinition {
  parentId: string;
  assignedAgent?: string;
  status: TaskStatus;
  result?: TaskResult;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskResult {
  success: boolean;
  output: string;
  artifacts?: Array<{
    type: 'code' | 'file' | 'analysis' | 'recommendation';
    content: string;
    path?: string;
  }>;
  metrics?: {
    durationMs: number;
    tokensUsed: number;
    confidence: number;
  };
  errors?: string[];
  warnings?: string[];
}

// =============================================================================
// VOTING & CONSENSUS
// =============================================================================

export type VoteType = 'approve' | 'reject' | 'abstain' | 'defer';

export interface Vote {
  voterId: string;
  voterRole: AgentRole;
  type: VoteType;
  confidence: number;
  reasoning: string;
  suggestions?: string[];
  timestamp: string;
}

export interface VotingRound {
  id: string;
  topic: string;
  votes: Vote[];
  quorum: number;
  requiredMajority: number;
  status: 'open' | 'closed' | 'decided';
  decision?: {
    outcome: 'approved' | 'rejected' | 'deferred' | 'no_quorum';
    confidence: number;
    summary: string;
  };
}

export interface ConsensusConfig {
  quorumPercentage: number;      // Min % of agents that must vote
  approvalThreshold: number;      // % of approvals needed
  vetoEnabled: boolean;           // Can specialist veto in their domain?
  tieBreaker: 'chairman' | 'defer' | 'random';
  maxRounds: number;
  roundTimeoutMs: number;
}

// =============================================================================
// ORCHESTRATION
// =============================================================================

export interface WorkflowStep {
  id: string;
  type: 'parallel' | 'sequential' | 'conditional' | 'vote';
  agents: string[];             // Agent IDs to involve
  task: TaskDefinition;
  condition?: string;           // For conditional steps
  onSuccess?: string;           // Next step ID
  onFailure?: string;           // Fallback step ID
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  entryPoint: string;           // First step ID
  exitPoints: string[];         // Terminal step IDs
  globalTimeout?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  completedSteps: string[];
  stepResults: Map<string, TaskResult>;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// =============================================================================
// ORCHESTRATOR EVENTS
// =============================================================================

export interface OrchestratorEvents {
  'workflow:started': (execution: WorkflowExecution) => void;
  'workflow:completed': (execution: WorkflowExecution) => void;
  'workflow:failed': (execution: WorkflowExecution, error: Error) => void;
  'step:started': (step: WorkflowStep, execution: WorkflowExecution) => void;
  'step:completed': (step: WorkflowStep, result: TaskResult) => void;
  'agent:assigned': (agent: AgentInstance, task: SubTask) => void;
  'agent:completed': (agent: AgentInstance, result: TaskResult) => void;
  'vote:cast': (vote: Vote, round: VotingRound) => void;
  'consensus:reached': (round: VotingRound) => void;
  'error': (error: Error) => void;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface CouncilSystemConfig {
  // Agent pool settings
  agentPool: {
    maxConcurrentAgents: number;
    defaultCooldownMs: number;
    loadBalancing: 'round-robin' | 'least-loaded' | 'best-match';
  };
  // Task decomposition settings
  taskDecomposer: {
    maxSubTasks: number;
    minComplexityForDecomposition: number;
    parallelizationThreshold: number;
  };
  // Voting settings
  voting: ConsensusConfig;
  // Orchestration settings
  orchestration: {
    maxConcurrentWorkflows: number;
    defaultTimeout: number;
    retryEnabled: boolean;
    maxRetries: number;
  };
  // Integration settings
  integration: {
    useEvolutionLearnings: boolean;
    trackUsage: boolean;
    enableMetrics: boolean;
  };
}

export const DEFAULT_COUNCIL_CONFIG: CouncilSystemConfig = {
  agentPool: {
    maxConcurrentAgents: 5,
    defaultCooldownMs: 1000,
    loadBalancing: 'best-match',
  },
  taskDecomposer: {
    maxSubTasks: 10,
    minComplexityForDecomposition: 3,
    parallelizationThreshold: 2,
  },
  voting: {
    quorumPercentage: 0.6,
    approvalThreshold: 0.7,
    vetoEnabled: true,
    tieBreaker: 'chairman',
    maxRounds: 3,
    roundTimeoutMs: 30000,
  },
  orchestration: {
    maxConcurrentWorkflows: 3,
    defaultTimeout: 300000,  // 5 minutes
    retryEnabled: true,
    maxRetries: 2,
  },
  integration: {
    useEvolutionLearnings: true,
    trackUsage: true,
    enableMetrics: true,
  },
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type AgentSelector = (
  agents: AgentInstance[],
  task: TaskDefinition
) => AgentInstance[];

export type TaskDecomposer = (
  task: TaskDefinition
) => SubTask[];

export type ResultAggregator = (
  results: TaskResult[]
) => TaskResult;
