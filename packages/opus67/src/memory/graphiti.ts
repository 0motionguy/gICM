/**
 * OPUS 67 Graphiti Memory
 * Temporal knowledge graph using Neo4j for persistent AI memory
 *
 * Refactored from 882 lines to ~350 lines by extracting:
 * - types.ts: Type definitions
 * - embeddings.ts: Embedding functions
 * - cache.ts: Local cache implementation
 * - search.ts: Search operations
 */

// Type declaration for optional dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Neo4jDriver = any;

import { EventEmitter } from "eventemitter3";
import type {
  MemoryNode,
  MemoryEdge,
  Episode,
  Improvement,
  Goal,
  SearchResult,
  GraphitiConfig,
  GraphitiEvents,
  MemoryStats,
} from "./types.js";
import { generateEmbedding } from "./embeddings.js";
import { LocalMemoryCache } from "./cache.js";
import {
  searchLocalCache,
  searchNeo4j,
  formatContext,
  type SearchOptions,
} from "./search.js";

// Re-export types for backwards compatibility
export type {
  MemoryNode,
  MemoryEdge,
  Episode,
  Improvement,
  Goal,
  SearchResult,
  GraphitiConfig,
};

/**
 * GraphitiMemory - Neo4j-based temporal knowledge graph
 */
export class GraphitiMemory extends EventEmitter<GraphitiEvents> {
  private config: GraphitiConfig;
  private connected = false;
  private driver: any = null;
  private localCache = new LocalMemoryCache();
  private useLocalFallback = true;

  constructor(config?: Partial<GraphitiConfig>) {
    super();
    this.config = {
      uri: config?.uri ?? process.env.NEO4J_URI ?? "",
      username: config?.username ?? process.env.NEO4J_USERNAME ?? "neo4j",
      password: config?.password ?? process.env.NEO4J_PASSWORD ?? "",
      database: config?.database ?? "neo4j",
      namespace: config?.namespace ?? "opus67",
      embeddingModel: config?.embeddingModel ?? "local",
      maxResults: config?.maxResults ?? 10,
      fallbackToLocal: config?.fallbackToLocal ?? true,
    };

    if (
      this.config.fallbackToLocal ||
      !this.config.uri ||
      !this.config.password
    ) {
      this.useLocalFallback = true;
    }
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async connect(): Promise<boolean> {
    if (!this.config.uri || !this.config.password) {
      console.warn("[Graphiti] No Neo4j credentials, using local fallback");
      this.useLocalFallback = true;
      return false;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const neo4j = (await import("neo4j-driver").catch(() => null)) as any;
      if (!neo4j) {
        console.warn(
          "[Graphiti] neo4j-driver not installed, using local fallback"
        );
        this.useLocalFallback = true;
        return false;
      }

      this.driver = neo4j.default.driver(
        this.config.uri,
        neo4j.default.auth.basic(this.config.username, this.config.password)
      );

      const session = this.driver.session({ database: this.config.database });
      await session.run("RETURN 1");
      await session.close();

      this.connected = true;
      this.useLocalFallback = false;
      this.emit("connected");
      await this.initializeSchema();
      return true;
    } catch (error) {
      console.warn(
        "[Graphiti] Connection failed, using local fallback:",
        error
      );
      this.useLocalFallback = true;
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  private async initializeSchema(): Promise<void> {
    if (!this.driver) return;
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(
        `CREATE INDEX memory_key IF NOT EXISTS FOR (m:Memory) ON (m.key)`
      );
      await session.run(
        `CREATE INDEX memory_namespace IF NOT EXISTS FOR (m:Memory) ON (m.namespace)`
      );
      await session.run(
        `CREATE INDEX memory_type IF NOT EXISTS FOR (m:Memory) ON (m.type)`
      );
    } finally {
      await session.close();
    }
  }

  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      this.connected = false;
      this.emit("disconnected");
    }
  }

  private async createNode(
    key: string,
    value: string,
    type: MemoryNode["type"],
    metadata: Record<string, unknown> = {}
  ): Promise<MemoryNode> {
    const embedding = await generateEmbedding(`${key} ${value}`);
    const node: MemoryNode = {
      id: this.generateId(),
      key,
      value,
      namespace: this.config.namespace!,
      type,
      embedding,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.useLocalFallback) {
      this.localCache.set(node.id, node);
    } else {
      await this.writeNode(node);
    }

    this.emit("memory:added", node);
    return node;
  }

  async addEpisode(episode: Episode): Promise<MemoryNode> {
    const key =
      episode.name ?? `episode:${episode.type ?? "general"}:${Date.now()}`;
    return this.createNode(key, episode.content, "episode", {
      episodeType: episode.type,
      source: episode.source,
      actors: episode.actors,
      context: episode.context,
      originalTimestamp: episode.timestamp,
    });
  }

  async addFact(
    key: string,
    value: string,
    metadata?: Record<string, unknown>
  ): Promise<MemoryNode> {
    return this.createNode(key, value, "fact", metadata ?? {});
  }

  async storeImprovement(improvement: Improvement): Promise<MemoryNode> {
    return this.createNode(
      `improvement:${improvement.component}`,
      JSON.stringify(improvement),
      "improvement",
      {
        component: improvement.component,
        changeType: improvement.changeType,
        impact: improvement.impact,
        automated: improvement.automated,
      }
    );
  }

  async trackGoal(goal: Goal): Promise<MemoryNode> {
    return this.createNode(
      `goal:${goal.description.slice(0, 50)}`,
      JSON.stringify(goal),
      "goal",
      {
        progress: goal.progress,
        status: goal.status,
        milestones: goal.milestones,
      }
    );
  }

  private async writeNode(node: MemoryNode): Promise<void> {
    if (!this.driver) return;
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(
        `
        MERGE (m:Memory {id: $id})
        SET m.key = $key, m.value = $value, m.namespace = $namespace,
            m.type = $type, m.metadata = $metadata,
            m.createdAt = $createdAt, m.updatedAt = $updatedAt
      `,
        {
          id: node.id,
          key: node.key,
          value: node.value,
          namespace: node.namespace,
          type: node.type,
          metadata: JSON.stringify(node.metadata),
          createdAt: node.createdAt.toISOString(),
          updatedAt: node.updatedAt.toISOString(),
        }
      );
    } finally {
      await session.close();
    }
  }

  async search(
    query: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    const limit = options?.limit ?? this.config.maxResults!;
    const searchOpts = { ...options, limit };

    const results = this.useLocalFallback
      ? await searchLocalCache(this.localCache, query, searchOpts)
      : await searchNeo4j(
          this.driver,
          this.config.database!,
          this.config.namespace!,
          query,
          searchOpts
        );

    this.emit("search:complete", query, results);
    return results;
  }

  async getContext(
    topic: string
  ): Promise<{ memories: MemoryNode[]; summary: string }> {
    const results = await this.search(topic, { limit: 5 });
    const memories = results.map((r) => r.node);
    return { memories, summary: formatContext(memories, topic) };
  }

  async getImprovements(): Promise<Improvement[]> {
    const results = await this.search("", { type: "improvement", limit: 100 });
    return results.map((r) => JSON.parse(r.node.value) as Improvement);
  }

  async getGoals(): Promise<Goal[]> {
    const results = await this.search("", { type: "goal", limit: 100 });
    return results.map((r) => JSON.parse(r.node.value) as Goal);
  }

  async updateGoal(
    goalId: string,
    progress: number,
    status?: Goal["status"]
  ): Promise<MemoryNode | null> {
    if (this.useLocalFallback) {
      const node = this.localCache.get(goalId);
      if (node && node.type === "goal") {
        const goal = JSON.parse(node.value) as Goal;
        goal.progress = progress;
        if (status) goal.status = status;
        node.value = JSON.stringify(goal);
        node.metadata.progress = progress;
        node.metadata.status = status ?? goal.status;
        node.updatedAt = new Date();
        this.emit("memory:updated", node);
        return node;
      }
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    if (this.useLocalFallback) {
      const deleted = this.localCache.delete(id);
      if (deleted) this.emit("memory:deleted", id);
      return deleted;
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(`MATCH (m:Memory {id: $id}) DELETE m`, { id });
      this.emit("memory:deleted", id);
      return true;
    } finally {
      await session.close();
    }
  }

  async createRelationship(
    fromId: string,
    toId: string,
    type: MemoryEdge["type"],
    metadata?: Record<string, unknown>
  ): Promise<MemoryEdge | null> {
    const edge: MemoryEdge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromId,
      toId,
      type,
      weight: 1.0,
      metadata: metadata ?? {},
      createdAt: new Date(),
    };

    if (this.useLocalFallback) {
      return this.localCache.addEdge(fromId, toId, edge) ? edge : null;
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(
        `
        MATCH (from:Memory {id: $fromId}), (to:Memory {id: $toId})
        CREATE (from)-[r:${type.toUpperCase()} {
          id: $edgeId, weight: $weight, metadata: $metadata, createdAt: $createdAt
        }]->(to) RETURN r
      `,
        {
          fromId,
          toId,
          edgeId: edge.id,
          weight: edge.weight,
          metadata: JSON.stringify(edge.metadata),
          createdAt: edge.createdAt.toISOString(),
        }
      );
      return edge;
    } finally {
      await session.close();
    }
  }

  async getRelated(
    id: string,
    options?: { type?: MemoryEdge["type"]; depth?: number }
  ): Promise<MemoryNode[]> {
    if (this.useLocalFallback) {
      return this.localCache.getRelated(id, options);
    }

    const depth = options?.depth ?? 1;
    const session = this.driver.session({ database: this.config.database });
    try {
      const typeClause = options?.type ? `:${options.type.toUpperCase()}` : "";
      const result = await session.run(
        `
        MATCH (m:Memory {id: $id})-[${typeClause}*1..${depth}]->(related:Memory)
        RETURN DISTINCT related
      `,
        { id }
      );

      return result.records.map((record: any) => {
        const m = record.get("related").properties;
        return {
          id: m.id,
          key: m.key,
          value: m.value,
          namespace: m.namespace,
          type: m.type,
          metadata: JSON.parse(m.metadata || "{}"),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        };
      });
    } finally {
      await session.close();
    }
  }

  async searchByTimeRange(
    startDate: Date,
    endDate: Date,
    options?: { type?: string; limit?: number }
  ): Promise<MemoryNode[]> {
    if (this.useLocalFallback) {
      return this.localCache.searchByTimeRange(startDate, endDate, options);
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(
        `
        MATCH (m:Memory)
        WHERE m.namespace = $namespace
          AND datetime(m.createdAt) >= datetime($startDate)
          AND datetime(m.createdAt) <= datetime($endDate)
          ${options?.type ? "AND m.type = $type" : ""}
        RETURN m ORDER BY m.createdAt DESC LIMIT $limit
      `,
        {
          namespace: this.config.namespace,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: options?.type,
          limit: options?.limit ?? this.config.maxResults,
        }
      );

      return result.records.map((record: any) => {
        const m = record.get("m").properties;
        return {
          id: m.id,
          key: m.key,
          value: m.value,
          namespace: m.namespace,
          type: m.type,
          metadata: JSON.parse(m.metadata || "{}"),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
        };
      });
    } finally {
      await session.close();
    }
  }

  async getRecent(limit = 10, type?: string): Promise<MemoryNode[]> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.searchByTimeRange(weekAgo, now, { type, limit });
  }

  async getStats(): Promise<MemoryStats> {
    if (this.useLocalFallback) {
      return this.localCache.getStats();
    }

    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(
        `
        MATCH (m:Memory {namespace: $namespace})
        RETURN m.type as type, count(*) as count,
               min(m.createdAt) as oldest, max(m.createdAt) as newest
      `,
        { namespace: this.config.namespace }
      );

      const byType: Record<string, number> = {};
      let oldest: Date | null = null;
      let newest: Date | null = null;
      let total = 0;

      for (const record of result.records) {
        const type = record.get("type");
        const count = record.get("count").toNumber();
        byType[type] = count;
        total += count;
        const o = record.get("oldest");
        const n = record.get("newest");
        if (o && (!oldest || new Date(o) < oldest)) oldest = new Date(o);
        if (n && (!newest || new Date(n) > newest)) newest = new Date(n);
      }

      return {
        totalNodes: total,
        totalMemories: total,
        facts: byType["fact"] ?? 0,
        episodes: byType["episode"] ?? 0,
        goals: byType["goal"] ?? 0,
        improvements: byType["improvement"] ?? 0,
        byType,
        oldestMemory: oldest,
        newestMemory: newest,
      };
    } finally {
      await session.close();
    }
  }

  isConnected(): boolean {
    return this.connected && !this.useLocalFallback;
  }

  async formatStatus(): Promise<string> {
    const stats = await this.getStats();
    const mode = this.useLocalFallback ? "LOCAL FALLBACK" : "NEO4J CONNECTED";
    return `
┌─ GRAPHITI MEMORY STATUS ────────────────────────────────────────┐
│  MODE: ${mode.padEnd(54)} │
│  NAMESPACE: ${this.config.namespace?.padEnd(49)} │
│  Total Memories: ${String(stats.totalMemories).padEnd(44)} │
│  Facts: ${String(stats.facts).padEnd(53)} │
│  Episodes: ${String(stats.episodes).padEnd(50)} │
│  Goals: ${String(stats.goals).padEnd(53)} │
│  Improvements: ${String(stats.improvements).padEnd(46)} │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// Factory and singleton exports
export function createMemory(config?: Partial<GraphitiConfig>): GraphitiMemory {
  return new GraphitiMemory(config);
}

export const memory = new GraphitiMemory();
