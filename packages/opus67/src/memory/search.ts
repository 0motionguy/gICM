/**
 * OPUS 67 - Memory Search
 * Search operations for memory system
 */

import type { MemoryNode, SearchResult } from './types.js';
import { simpleEmbed, cosineSimilarity } from './embeddings.js';
import type { LocalMemoryCache } from './cache.js';

export interface SearchOptions {
  type?: string;
  limit?: number;
  semantic?: boolean;
}

/**
 * Search local cache with semantic and keyword matching
 */
export async function searchLocalCache(
  cache: LocalMemoryCache,
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 10;
  const useSemantic = options?.semantic ?? true;
  const results: SearchResult[] = [];

  const queryLower = query.toLowerCase();
  const queryEmbedding = useSemantic && query ? simpleEmbed(query) : null;

  for (const node of cache.values()) {
    // Filter by type if specified
    if (options?.type && node.type !== options.type) continue;

    // Empty query returns all (filtered by type above)
    if (!query) {
      results.push({
        node,
        score: 0.5,
        matchType: 'keyword'
      });
      continue;
    }

    // Match by key and value (keyword search)
    const nodeKey = node.key ?? '';
    const nodeValue = node.value ?? '';
    const keyMatch = nodeKey.toLowerCase().includes(queryLower);
    const valueMatch = nodeValue.toLowerCase().includes(queryLower);

    // Semantic search using embeddings
    let semanticScore = 0;
    if (queryEmbedding && node.embedding) {
      semanticScore = cosineSimilarity(queryEmbedding, node.embedding);
    }

    // Combine keyword and semantic scores
    const keywordScore = keyMatch ? 1.0 : valueMatch ? 0.8 : 0;
    const combinedScore = Math.max(keywordScore, semanticScore);

    if (combinedScore > 0.3) {
      results.push({
        node,
        score: combinedScore,
        matchType: semanticScore > keywordScore ? 'semantic' : 'keyword'
      });
    }
  }

  // Sort by score and limit
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Search Neo4j database
 */
export async function searchNeo4j(
  driver: any,
  database: string,
  namespace: string,
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 10;
  const results: SearchResult[] = [];

  const session = driver.session({ database });
  try {
    const result = await session.run(`
      MATCH (m:Memory)
      WHERE m.namespace = $namespace
        AND (m.key CONTAINS $query OR m.value CONTAINS $query)
        ${options?.type ? 'AND m.type = $type' : ''}
      RETURN m
      ORDER BY m.updatedAt DESC
      LIMIT $limit
    `, {
      namespace,
      query,
      type: options?.type,
      limit
    });

    for (const record of result.records) {
      const m = record.get('m').properties;
      results.push({
        node: {
          id: m.id,
          key: m.key,
          value: m.value,
          namespace: m.namespace,
          type: m.type,
          metadata: JSON.parse(m.metadata || '{}'),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        },
        score: 0.9,
        matchType: 'keyword'
      });
    }
  } finally {
    await session.close();
  }

  return results;
}

/**
 * Get context for a topic
 */
export function formatContext(memories: MemoryNode[], topic: string): string {
  if (memories.length === 0) {
    return `No memories found for "${topic}"`;
  }

  return `Found ${memories.length} relevant memories:\n${
    memories.map(m => `- ${m.key}: ${m.value.slice(0, 100)}...`).join('\n')
  }`;
}
