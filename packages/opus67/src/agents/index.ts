/**
 * OPUS 67 v4.1 - Agents Index
 *
 * Export all learning layer agents.
 */

export {
  LearningObserverAgent,
  getLearningObserver,
  resetLearningObserver,
  type TaskContext,
  type ToolCall,
  type SOP,
  type SuccessMetric,
  type LearningObserverConfig,
} from "./learning-observer.js";

export {
  SkillsNavigatorAgent,
  getSkillsNavigator,
  resetSkillsNavigator,
  type SkillCombination,
  type ActivationResult,
  type UsageRecord,
  type SkillsNavigatorConfig,
} from "./skills-navigator.js";

// =============================================================================
// OPUS 67 v6.1 - Async Subagent System
// =============================================================================

export {
  SubagentOrchestrator,
  subagentOrchestrator,
  createOrchestrator,
  type AgentPlan,
  type AgentSuggestion,
  type AgentDefinition,
  type AggregatedResult,
  type AgentResult,
} from "./subagent-orchestrator.js";

export {
  AsyncAgentRunner,
  asyncAgentRunner,
  createAsyncRunner,
  type AgentJobStatus,
  type AgentConfig,
  type AgentJob,
  type AgentMessage,
} from "./async-runner.js";

export {
  AgentJobQueue,
  agentJobQueue,
  createJobQueue,
  type JobPriority,
  type ExecutionMode,
  type QueuedJob,
  type QueueStats,
} from "./job-queue.js";

// =============================================================================
// OPUS 67 v6.2 - Orchestration Patterns
// =============================================================================

export {
  // Pipeline Pattern
  PipelineOrchestrator,
  createPipeline,
  type StageConfig,
  type StageResult,
  type PipelineResult,
  type StageHandler,
  // Parallel Pattern
  ParallelOrchestrator,
  createParallel,
  type WorkerConfig,
  type WorkerResult,
  type ParallelResult,
  // Single-Job Subagent
  SingleJobSubagent,
  createSubagent,
  type SubagentConfig,
  type SubagentDefinition,
  // Context Isolation
  IsolatedContext,
  createIsolatedContext,
  type IsolatedContextConfig,
  type ContextWindow,
  type ContextSummary,
  // Templates
  SubagentTemplates,
  PipelineTemplates,
  // Schemas
  InputSchemaBase,
  OutputSchemaBase,
  type InputSchema,
  type OutputSchema,
  // Executor Interface
  type AgentExecutor,
} from "./orchestration-patterns.js";
