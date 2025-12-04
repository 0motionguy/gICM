/**
 * OPUS 67 - Memory Local Cache
 * In-memory cache for local fallback mode
 */

import type { MemoryNode, MemoryEdge, MemoryStats } from './types.js';

/**
 * Local memory cache for development and fallback
 */
export class LocalMemoryCache {
  private cache: Map<string, MemoryNode> = new Map();

  /**
   * Get a node by ID
   */
  get(id: string): MemoryNode | undefined {
    return this.cache.get(id);
  }

  /**
   * Set a node
   */
  set(id: string, node: MemoryNode): void {
    this.cache.set(id, node);
  }

  /**
   * Delete a node
   */
  delete(id: string): boolean {
    return this.cache.delete(id);
  }

  /**
   * Check if node exists
   */
  has(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Get all values
   */
  values(): IterableIterator<MemoryNode> {
    return this.cache.values();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get statistics from cache
   */
  getStats(): MemoryStats {
    const byType: Record<string, number> = {};
    let oldest: Date | null = null;
    let newest: Date | null = null;

    for (const node of this.cache.values()) {
      byType[node.type] = (byType[node.type] || 0) + 1;
      if (!oldest || node.createdAt < oldest) oldest = node.createdAt;
      if (!newest || node.createdAt > newest) newest = node.createdAt;
    }

    return {
      totalNodes: this.cache.size,
      totalMemories: this.cache.size,
      facts: byType['fact'] ?? 0,
      episodes: byType['episode'] ?? 0,
      goals: byType['goal'] ?? 0,
      improvements: byType['improvement'] ?? 0,
      byType,
      oldestMemory: oldest,
      newestMemory: newest
    };
  }

  /**
   * Search by time range
   */
  searchByTimeRange(
    startDate: Date,
    endDate: Date,
    options?: { type?: string; limit?: number }
  ): MemoryNode[] {
    const limit = options?.limit ?? 10;
    const results: MemoryNode[] = [];

    for (const node of this.cache.values()) {
      if (options?.type && node.type !== options.type) continue;
      if (node.createdAt >= startDate && node.createdAt <= endDate) {
        results.push(node);
      }
    }

    return results
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get related nodes via edges stored in metadata
   */
  getRelated(id: string, options?: { type?: MemoryEdge['type'] }): MemoryNode[] {
    const node = this.cache.get(id);
    if (!node) return [];

    const edges = (node.metadata._edges as MemoryEdge[]) ?? [];
    const relatedIds = edges
      .filter(e => !options?.type || e.type === options.type)
      .map(e => e.toId);

    return relatedIds
      .map(rid => this.cache.get(rid))
      .filter((n): n is MemoryNode => n !== undefined);
  }

  /**
   * Add edge between two nodes
   */
  addEdge(fromId: string, toId: string, edge: MemoryEdge): boolean {
    const fromNode = this.cache.get(fromId);
    const toNode = this.cache.get(toId);

    if (fromNode && toNode) {
      fromNode.metadata._edges = fromNode.metadata._edges ?? [];
      (fromNode.metadata._edges as MemoryEdge[]).push(edge);
      return true;
    }
    return false;
  }
}
