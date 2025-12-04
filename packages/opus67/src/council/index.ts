/**
 * OPUS 67 Council Module
 * LLM Council with 3-stage peer review deliberation
 */

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
