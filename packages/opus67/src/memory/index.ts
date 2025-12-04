/**
 * OPUS 67 Memory Module
 * Temporal knowledge graph with Neo4j Graphiti
 *
 * Refactored structure:
 * - types.ts: Type definitions
 * - embeddings.ts: Embedding functions
 * - cache.ts: Local cache implementation
 * - search.ts: Search operations
 * - graphiti.ts: Main GraphitiMemory class
 */

// Types (re-exported from graphiti for backwards compatibility)
export type {
  MemoryNode,
  MemoryEdge,
  Episode,
  Improvement,
  Goal,
  SearchResult,
  GraphitiConfig
} from './graphiti.js';

// Additional types
export type { MemoryStats, GraphitiEvents } from './types.js';

// Embedding utilities
export { simpleEmbed, cosineSimilarity, generateEmbedding } from './embeddings.js';

// Local cache
export { LocalMemoryCache } from './cache.js';

// Search operations
export { searchLocalCache, searchNeo4j, formatContext, type SearchOptions } from './search.js';

// Main class and factory
export { GraphitiMemory, memory, createMemory } from './graphiti.js';

export {
  ContextEnhancer,
  contextEnhancer,
  createContextEnhancer,
  enhancePrompt,
  getContextFor,
  type ContextWindow,
  type ContextEnhancement,
  type ContextConfig
} from './context.js';
