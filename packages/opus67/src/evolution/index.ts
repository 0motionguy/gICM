/**
 * OPUS 67 Evolution Module
 * Self-improving 24/7 system with learning capabilities
 */

// =============================================================================
// CORE EVOLUTION LOOP
// =============================================================================

export {
  EvolutionLoop,
  evolutionLoop,
  createEvolutionLoop,
  type EvolutionConfig,
  type ImprovementOpportunity,
  type EvolutionCycle,
  type EvolutionMetrics,
  type DetectorContext,
} from "./evolution-loop.js";

export {
  PatternDetector,
  patternDetector,
  createPatternDetector,
  type PatternType,
  type DetectedPattern,
  type PatternDetectorConfig,
} from "./pattern-detector.js";

export {
  CodeImprover,
  codeImprover,
  createCodeImprover,
  type CodeChange,
  type ImprovementResult,
  type CodeImproverConfig,
} from "./code-improver.js";

// =============================================================================
// LEARNING SYSTEM - Types
// =============================================================================

export {
  // Types
  type Learning,
  type LearningType,
  type UsageEvent,
  type UsageSession,
  type OutcomeSignal,
  type SignalType,
  type SignalSource,
  type Evidence,
  type TriggerCondition,
  type EntityType,
  type InvocationTrigger,
  type EntityStats,
  type LearningStats,
  // Configs
  type UsageTrackerConfig,
  type LearningGeneratorConfig,
  type AdaptiveMatcherConfig,
  type EvolutionEnhancementConfig,
  // Constants
  DEFAULT_EVOLUTION_CONFIG,
  POSITIVE_SIGNALS,
  NEGATIVE_SIGNALS,
  // Utilities
  generateId,
  hashTask,
  truncate,
} from "./types.js";

// =============================================================================
// LEARNING SYSTEM - Usage Tracking
// =============================================================================

export {
  UsageTracker,
  usageTracker,
  createUsageTracker,
} from "./usage-tracker.js";

// =============================================================================
// LEARNING SYSTEM - Signal Collection
// =============================================================================

export { SignalCollector, createSignalCollector } from "./signal-collector.js";

// =============================================================================
// LEARNING SYSTEM - Learning Store
// =============================================================================

export {
  LearningStore,
  learningStore,
  createLearningStore,
} from "./learning-store.js";

// =============================================================================
// LEARNING SYSTEM - Learning Generator
// =============================================================================

export {
  LearningGenerator,
  createLearningGenerator,
} from "./learning-generator.js";

// =============================================================================
// LEARNING SYSTEM - Adaptive Matcher
// =============================================================================

export { AdaptiveMatcher, createAdaptiveMatcher } from "./adaptive-matcher.js";
