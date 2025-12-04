/**
 * OPUS 67 Evolution Module
 * Self-improving 24/7 system
 */

export {
  EvolutionLoop,
  evolutionLoop,
  createEvolutionLoop,
  type EvolutionConfig,
  type ImprovementOpportunity,
  type EvolutionCycle,
  type EvolutionMetrics,
  type DetectorContext
} from './evolution-loop.js';

export {
  PatternDetector,
  patternDetector,
  createPatternDetector,
  type PatternType,
  type DetectedPattern,
  type PatternDetectorConfig
} from './pattern-detector.js';

export {
  CodeImprover,
  codeImprover,
  createCodeImprover,
  type CodeChange,
  type ImprovementResult,
  type CodeImproverConfig
} from './code-improver.js';
