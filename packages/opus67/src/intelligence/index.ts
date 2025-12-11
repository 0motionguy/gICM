/**
 * OPUS 67 v4.1 - Intelligence Layer
 *
 * Pre-indexed knowledge for skills, capabilities, synergies, and MCPs.
 * Powers anti-hallucination, intelligent routing, and optimal skill selection.
 * v4.1: Added AContext integration for self-learning and SOP generation.
 */

// Skill Metadata System
export {
  SkillMetadataLoader,
  getSkillMetadataLoader,
  resetSkillMetadataLoader,
  type DeepSkillMetadata,
  type SkillCapability,
  type AntiHallucinationRule,
  type SkillExample,
  type SkillSynergies,
} from "./skill-metadata.js";

// Capability Matrix
export {
  CapabilityMatrix,
  getCapabilityMatrix,
  resetCapabilityMatrix,
  type CapabilityCheck,
  type TaskValidation,
  type SkillMatch,
  type TaskAnalysis,
} from "./capability-matrix.js";

// Synergy Graph
export {
  SynergyGraph,
  getSynergyGraph,
  resetSynergyGraph,
  type SynergyEdge,
  type SkillNode,
  type CombinationScore,
} from "./synergy-graph.js";

// MCP Validator
export {
  MCPValidator,
  getMCPValidator,
  resetMCPValidator,
  type MCPEndpoint,
  type MCPParameter,
  type MCPServer,
  type ValidationResult,
} from "./mcp-validator.js";

// Knowledge Store (unified interface)
export {
  KnowledgeStore,
  getKnowledgeStore,
  resetKnowledgeStore,
  lookupSkill,
  canDo,
  getSynergy,
  validateMCP,
  type StorageConfig,
  type StorageMode,
  type KnowledgeStats,
  type QueryResult,
} from "./knowledge-store.js";

// SQLite Storage (production)
export {
  SQLiteStore,
  getSQLiteStore,
  resetSQLiteStore,
  type SQLiteConfig,
  type SearchResult as SQLiteSearchResult,
} from "./sqlite-store.js";

// Confidence Scorer
export {
  ConfidenceScorer,
  getConfidenceScorer,
  resetConfidenceScorer,
  type ConfidenceResult,
  type ConfidenceFactors,
  type TaskProfile,
} from "./confidence-scorer.js";

// Similarity Search
export {
  SimilaritySearch,
  getSimilaritySearch,
  resetSimilaritySearch,
  TFIDFVectorizer,
  type SimilarityResult,
  type EmbeddingVector,
} from "./similarity-search.js";

// Learning Loop (v4.1: AContext integration)
export {
  LearningLoop,
  getLearningLoop,
  resetLearningLoop,
  type Interaction,
  type UserFeedback,
  type LearnedPattern,
  type LearningStats,
  type LearningConfig,
  type AContextSyncResult,
} from "./learning-loop.js";

// Skill Search (v4.1: Vector embeddings for skill discovery)
export {
  SkillSearch,
  getSkillSearch,
  resetSkillSearch,
  type SkillSearchResult,
  type SkillSearchConfig,
} from "./skill-search.js";

// Multi-Stage Retrieval (v6.3.0: 4-stage pipeline for +17% precision)
export {
  MultiStageRetrieval,
  getMultiStageRetrieval,
  resetMultiStageRetrieval,
  searchSkillsMultiStage,
  type RetrievalConfig,
  type RetrievalStats,
} from "./multi-stage-retrieval.js";

// Query Augmentation (v6.3.0: Intent classification, term expansion)
export {
  augmentQuery,
  classifyIntent,
  expandTerms,
  extractEntities,
  classify,
  expand,
  extract,
  type QueryIntent,
  type AugmentedQuery,
  type ExtractedEntity,
} from "./query-augmentation.js";

// Cloud Sync
export {
  CloudSync,
  getCloudSync,
  resetCloudSync,
  type SyncConfig,
  type SyncResult,
  type SyncStatus,
} from "./cloud-sync.js";

// =============================================================================
// QUICK START API
// =============================================================================

import { getKnowledgeStore } from "./knowledge-store.js";
import { getConfidenceScorer } from "./confidence-scorer.js";
import { getSimilaritySearch } from "./similarity-search.js";

/**
 * Initialize all intelligence systems
 */
export async function initIntelligence(): Promise<void> {
  const store = getKnowledgeStore();
  await store.initialize();

  // Initialize similarity search in background
  getSimilaritySearch()
    .initialize()
    .catch(() => {});
}

/**
 * Score confidence for a task
 */
export async function scoreConfidence(
  task: string,
  skillIds: string[]
): Promise<{
  score: number;
  grade: string;
  canProceed: boolean;
  warnings: string[];
}> {
  const scorer = getConfidenceScorer();
  const result = await scorer.score(task, skillIds);
  return {
    score: result.score,
    grade: result.grade,
    canProceed: result.canProceed,
    warnings: result.warnings,
  };
}

/**
 * Find similar skills using semantic search
 */
export async function findSimilarSkills(
  query: string,
  topK: number = 5
): Promise<
  Array<{
    skillId: string;
    score: number;
  }>
> {
  const search = getSimilaritySearch();
  await search.initialize();
  return search.search(query, topK);
}

/**
 * Pre-flight check for a task
 */
export async function preFlightCheck(
  task: string,
  skillIds: string[]
): Promise<{
  pass: boolean;
  confidence: number;
  blockers: string[];
  warnings: string[];
  recommendations: string[];
}> {
  const store = getKnowledgeStore();
  await store.initialize();
  return store.preFlightCheck(task, skillIds);
}

/**
 * Find best skills for a task
 */
export async function findBestSkills(
  task: string,
  maxResults: number = 5
): Promise<
  Array<{
    skillId: string;
    score: number;
    matchedCapabilities: string[];
  }>
> {
  const store = getKnowledgeStore();
  await store.initialize();
  const result = await store.findSkillsForTask(task, maxResults);
  return result.data || [];
}

/**
 * Get intelligence statistics
 */
export async function getIntelligenceStats(): Promise<{
  skills: { total: number; withCapabilities: number };
  synergies: { totalEdges: number; amplifying: number; conflicting: number };
  mcps: { totalServers: number; totalEndpoints: number };
  storage: { mode: string; cacheHits: number; cacheMisses: number };
}> {
  const store = getKnowledgeStore();
  await store.initialize();
  const stats = await store.getStats();

  return {
    skills: {
      total: stats.skills.total,
      withCapabilities: stats.skills.withCapabilities,
    },
    synergies: {
      totalEdges: stats.synergies.totalEdges,
      amplifying: stats.synergies.amplifying,
      conflicting: stats.synergies.conflicting,
    },
    mcps: {
      totalServers: stats.mcps.totalServers,
      totalEndpoints: stats.mcps.totalEndpoints,
    },
    storage: {
      mode: stats.storage.mode,
      cacheHits: stats.storage.cacheHits,
      cacheMisses: stats.storage.cacheMisses,
    },
  };
}
