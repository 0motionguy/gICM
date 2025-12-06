/**
 * OPUS 67 Evolution Types
 * Types for usage tracking, learning, and self-improvement
 */

// =============================================================================
// USAGE TRACKING TYPES
// =============================================================================

/**
 * Entity types that can be tracked
 */
export type EntityType = 'skill' | 'mode' | 'agent' | 'mcp';

/**
 * How the entity was invoked
 */
export type InvocationTrigger = 'auto' | 'manual' | 'bundle' | 'council';

/**
 * Usage event - recorded when a skill/mode/agent/mcp is invoked
 */
export interface UsageEvent {
  id: string;
  timestamp: string;
  type: EntityType;
  entityId: string;
  entityName: string;
  trigger: InvocationTrigger;
  taskContext: string;       // First 200 chars of task description
  taskHash: string;          // For deduplication and grouping
  sessionId: string;
  durationMs?: number;       // How long the entity was active
  metadata: Record<string, unknown>;
}

/**
 * Usage session - groups related usage events
 */
export interface UsageSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  usageEventIds: string[];
  outcome?: SessionOutcome;
  outcomeSignals: OutcomeSignal[];
  taskSummary?: string;
}

export type SessionOutcome = 'success' | 'partial' | 'failure' | 'unknown';

// =============================================================================
// OUTCOME SIGNAL TYPES
// =============================================================================

/**
 * Signal types indicating success or failure
 */
export type SignalType = 'success' | 'failure' | 'neutral';

/**
 * Source of the outcome signal
 */
export type SignalSource = 'hook' | 'user' | 'system' | 'inferred';

/**
 * Outcome signal - indicates success/failure of a task
 */
export interface OutcomeSignal {
  id: string;
  timestamp: string;
  type: SignalType;
  source: SignalSource;
  signal: string;            // Description of the signal
  weight: number;            // 0-1 importance/confidence
  relatedUsageIds: string[]; // Usage events this signal relates to
  metadata: Record<string, unknown>;
}

/**
 * Positive signal patterns
 */
export const POSITIVE_SIGNALS = [
  'build succeeded',
  'tests passed',
  'deployment successful',
  'no errors',
  'task completed',
  'commit created',
  'linting passed',
] as const;

/**
 * Negative signal patterns
 */
export const NEGATIVE_SIGNALS = [
  'build failed',
  'test failed',
  'error',
  'exception',
  'timeout',
  'deployment failed',
  'rollback',
] as const;

// =============================================================================
// LEARNING TYPES
// =============================================================================

/**
 * Types of learnings
 */
export type LearningType =
  | 'skill_affinity'      // This skill works well for this type of task
  | 'skill_correlation'   // These skills are often used together
  | 'mode_preference'     // This mode works well for this context
  | 'agent_effectiveness' // This agent succeeds more often for this task
  | 'pattern'             // General pattern observed
  | 'anti_pattern'        // Something that doesn't work well
  | 'optimization';       // Performance optimization

/**
 * Evidence supporting a learning
 */
export interface Evidence {
  usageEventId: string;
  sessionId: string;
  outcome: 'positive' | 'negative';
  weight: number;
  timestamp: string;
}

/**
 * Trigger condition for when to apply a learning
 */
export interface TriggerCondition {
  type: 'keyword' | 'file_pattern' | 'task_type' | 'context' | 'entity';
  value: string;
  weight: number;
}

/**
 * Learning - an insight derived from usage patterns
 */
export interface Learning {
  id: string;
  createdAt: string;
  updatedAt: string;

  // What was learned
  type: LearningType;
  insight: string;           // Human-readable description

  // Confidence
  confidence: number;        // 0-1, increases with evidence
  evidenceCount: number;
  evidence: Evidence[];      // Supporting evidence

  // When to apply
  triggerConditions: TriggerCondition[];

  // Affected entities
  entities: Array<{
    type: EntityType;
    id: string;
    effect: 'boost' | 'reduce' | 'require' | 'exclude';
    weight: number;
  }>;

  // Impact tracking
  expectedBenefit: number;   // 0-1 estimated impact
  actualBenefit?: number;    // 0-1 measured impact after application
  applicationCount: number;  // How many times this learning has been applied

  // Status
  status: 'active' | 'inactive' | 'deprecated';
}

// =============================================================================
// STATS & METRICS TYPES
// =============================================================================

/**
 * Aggregated stats for an entity
 */
export interface EntityStats {
  entityId: string;
  entityType: EntityType;
  entityName: string;

  // Usage metrics
  totalInvocations: number;
  manualInvocations: number;
  autoInvocations: number;

  // Success metrics
  successCount: number;
  failureCount: number;
  successRate: number;       // 0-1

  // Correlation
  coOccurrence: Record<string, number>;  // Other entities used together

  // Time metrics
  firstUsed: string;
  lastUsed: string;
  avgDurationMs?: number;
}

/**
 * Session stats
 */
export interface SessionStats {
  totalSessions: number;
  successfulSessions: number;
  partialSessions: number;
  failedSessions: number;
  successRate: number;
  avgSessionDurationMs: number;
  avgEntitiesPerSession: number;
}

/**
 * Learning stats
 */
export interface LearningStats {
  totalLearnings: number;
  activeLearnings: number;
  avgConfidence: number;
  totalApplications: number;
  avgBenefit: number;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Usage tracker configuration
 */
export interface UsageTrackerConfig {
  enabled: boolean;
  bufferSize: number;        // Events to buffer before flush
  flushIntervalMs: number;   // How often to flush
  storageLocation: string;   // Where to store logs
  maxEventsPerDay: number;   // Limit per day
  trackContext: boolean;     // Whether to store task context
  contextMaxLength: number;  // Max length of context to store
}

/**
 * Learning generator configuration
 */
export interface LearningGeneratorConfig {
  enabled: boolean;
  minEvidenceCount: number;     // Min evidence before creating learning
  minConfidence: number;        // Min confidence to activate learning
  confidenceDecay: number;      // How much confidence decays over time
  generateIntervalMs: number;   // How often to generate learnings
}

/**
 * Adaptive matcher configuration
 */
export interface AdaptiveMatcherConfig {
  enabled: boolean;
  learningBoostWeight: number;  // How much to boost scores from learnings
  maxBoost: number;             // Maximum boost multiplier
  minConfidenceToApply: number; // Min learning confidence to apply
}

/**
 * Full evolution configuration
 */
export interface EvolutionEnhancementConfig {
  usageTracker: UsageTrackerConfig;
  learningGenerator: LearningGeneratorConfig;
  adaptiveMatcher: AdaptiveMatcherConfig;
}

/**
 * Default evolution enhancement configuration
 */
export const DEFAULT_EVOLUTION_CONFIG: EvolutionEnhancementConfig = {
  usageTracker: {
    enabled: true,
    bufferSize: 20,
    flushIntervalMs: 5000,
    storageLocation: '.opus67/evolution/usage',
    maxEventsPerDay: 10000,
    trackContext: true,
    contextMaxLength: 200,
  },
  learningGenerator: {
    enabled: true,
    minEvidenceCount: 3,
    minConfidence: 0.6,
    confidenceDecay: 0.01,
    generateIntervalMs: 60000,
  },
  adaptiveMatcher: {
    enabled: true,
    learningBoostWeight: 0.3,
    maxBoost: 1.5,
    minConfidenceToApply: 0.5,
  },
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'evo'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Hash a string for task grouping
 */
export function hashTask(task: string): string {
  let hash = 0;
  for (let i = 0; i < task.length; i++) {
    const char = task.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
