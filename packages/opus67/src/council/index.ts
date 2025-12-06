/**
 * OPUS 67 Council Module
 * LLM Council with 3-stage peer review deliberation + Multi-Agent Orchestration
 */

// =============================================================================
// LLM COUNCIL (Karpathy-style deliberation)
// =============================================================================

export {
  LLMCouncil,
  council,
  createCouncil,
  type CouncilMember,
  type CouncilResponse,
  type PeerRanking,
  type DeliberationResult,
  type CouncilConfig
} from './council.js';

export {
  parseRankingText,
  aggregateRankings,
  calculateWeightedScore,
  detectConflicts,
  generateRankingReport,
  normalizeScores,
  DEFAULT_CRITERIA,
  type RankingScore,
  type RankingAggregation,
  type RankingCriteria
} from './ranking.js';

export {
  generateSynthesisPrompt,
  parseSynthesisResponse,
  selectStrategy,
  formatSynthesis,
  SYNTHESIS_PROMPTS,
  SYNTHESIS_STRATEGIES,
  type SynthesisPrompt,
  type SynthesisStrategy
} from './synthesis.js';

// =============================================================================
// MULTI-AGENT ORCHESTRATION TYPES
// =============================================================================

export {
  // Agent types
  type AgentRole,
  type AgentStatus,
  type AgentDefinition,
  type AgentInstance,
  // Task types
  type TaskPriority,
  type TaskStatus,
  type TaskDefinition,
  type SubTask,
  type TaskResult,
  // Voting types
  type VoteType,
  type Vote,
  type VotingRound,
  type ConsensusConfig,
  // Workflow types
  type WorkflowStep,
  type Workflow,
  type WorkflowExecution,
  type OrchestratorEvents,
  // Config
  type CouncilSystemConfig,
  DEFAULT_COUNCIL_CONFIG,
  // Utilities
  type AgentSelector,
  type TaskDecomposer as TaskDecomposerFn,
  type ResultAggregator,
} from './types.js';

// =============================================================================
// AGENT POOL
// =============================================================================

export {
  AgentPool,
  createAgentPool,
} from './agent-pool.js';

// =============================================================================
// TASK DECOMPOSER
// =============================================================================

export {
  TaskDecomposer,
  createTaskDecomposer,
} from './task-decomposer.js';

// =============================================================================
// MULTI-AGENT ORCHESTRATOR
// =============================================================================

export {
  MultiAgentOrchestrator,
  createOrchestrator,
} from './multi-agent-orchestrator.js';
