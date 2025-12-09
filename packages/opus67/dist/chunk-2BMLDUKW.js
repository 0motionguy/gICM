import { EventEmitter } from 'eventemitter3';

// src/memory/graphiti.ts

// src/memory/embeddings.ts
function simpleEmbed(text) {
  const words = text.toLowerCase().split(/\s+/);
  const dims = 64;
  const embedding = new Array(dims).fill(0);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const idx = word.charCodeAt(j) * (j + 1) % dims;
      embedding[idx] += 1 / words.length;
    }
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? embedding.map((v) => v / magnitude) : embedding;
}
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}
async function generateEmbedding(text) {
  return simpleEmbed(text);
}

// src/memory/cache.ts
var LocalMemoryCache = class {
  cache = /* @__PURE__ */ new Map();
  /**
   * Get a node by ID
   */
  get(id) {
    return this.cache.get(id);
  }
  /**
   * Set a node
   */
  set(id, node) {
    this.cache.set(id, node);
  }
  /**
   * Delete a node
   */
  delete(id) {
    return this.cache.delete(id);
  }
  /**
   * Check if node exists
   */
  has(id) {
    return this.cache.has(id);
  }
  /**
   * Get all values
   */
  values() {
    return this.cache.values();
  }
  /**
   * Get cache size
   */
  get size() {
    return this.cache.size;
  }
  /**
   * Clear all entries
   */
  clear() {
    this.cache.clear();
  }
  /**
   * Get statistics from cache
   */
  getStats() {
    const byType = {};
    let oldest = null;
    let newest = null;
    for (const node of this.cache.values()) {
      byType[node.type] = (byType[node.type] || 0) + 1;
      if (!oldest || node.createdAt < oldest) oldest = node.createdAt;
      if (!newest || node.createdAt > newest) newest = node.createdAt;
    }
    return {
      totalNodes: this.cache.size,
      totalMemories: this.cache.size,
      facts: byType["fact"] ?? 0,
      episodes: byType["episode"] ?? 0,
      goals: byType["goal"] ?? 0,
      improvements: byType["improvement"] ?? 0,
      byType,
      oldestMemory: oldest,
      newestMemory: newest
    };
  }
  /**
   * Search by time range
   */
  searchByTimeRange(startDate, endDate, options) {
    const limit = options?.limit ?? 10;
    const results = [];
    for (const node of this.cache.values()) {
      if (options?.type && node.type !== options.type) continue;
      if (node.createdAt >= startDate && node.createdAt <= endDate) {
        results.push(node);
      }
    }
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }
  /**
   * Get related nodes via edges stored in metadata
   */
  getRelated(id, options) {
    const node = this.cache.get(id);
    if (!node) return [];
    const edges = node.metadata._edges ?? [];
    const relatedIds = edges.filter((e) => !options?.type || e.type === options.type).map((e) => e.toId);
    return relatedIds.map((rid) => this.cache.get(rid)).filter((n) => n !== void 0);
  }
  /**
   * Add edge between two nodes
   */
  addEdge(fromId, toId, edge) {
    const fromNode = this.cache.get(fromId);
    const toNode = this.cache.get(toId);
    if (fromNode && toNode) {
      fromNode.metadata._edges = fromNode.metadata._edges ?? [];
      fromNode.metadata._edges.push(edge);
      return true;
    }
    return false;
  }
};

// src/memory/search.ts
async function searchLocalCache(cache, query, options) {
  const limit = options?.limit ?? 10;
  const useSemantic = options?.semantic ?? true;
  const results = [];
  const queryLower = query.toLowerCase();
  const queryEmbedding = useSemantic && query ? simpleEmbed(query) : null;
  for (const node of cache.values()) {
    if (options?.type && node.type !== options.type) continue;
    if (!query) {
      results.push({
        node,
        score: 0.5,
        matchType: "keyword"
      });
      continue;
    }
    const nodeKey = node.key ?? "";
    const nodeValue = node.value ?? "";
    const keyMatch = nodeKey.toLowerCase().includes(queryLower);
    const valueMatch = nodeValue.toLowerCase().includes(queryLower);
    let semanticScore = 0;
    if (queryEmbedding && node.embedding) {
      semanticScore = cosineSimilarity(queryEmbedding, node.embedding);
    }
    const keywordScore = keyMatch ? 1 : valueMatch ? 0.8 : 0;
    const combinedScore = Math.max(keywordScore, semanticScore);
    if (combinedScore > 0.3) {
      results.push({
        node,
        score: combinedScore,
        matchType: semanticScore > keywordScore ? "semantic" : "keyword"
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
async function searchNeo4j(driver, database, namespace, query, options) {
  const limit = options?.limit ?? 10;
  const results = [];
  const session = driver.session({ database });
  try {
    const result = await session.run(`
      MATCH (m:Memory)
      WHERE m.namespace = $namespace
        AND (m.key CONTAINS $query OR m.value CONTAINS $query)
        ${options?.type ? "AND m.type = $type" : ""}
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
      const m = record.get("m").properties;
      results.push({
        node: {
          id: m.id,
          key: m.key,
          value: m.value,
          namespace: m.namespace,
          type: m.type,
          metadata: JSON.parse(m.metadata || "{}"),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        },
        score: 0.9,
        matchType: "keyword"
      });
    }
  } finally {
    await session.close();
  }
  return results;
}
function formatContext(memories, topic) {
  if (memories.length === 0) {
    return `No memories found for "${topic}"`;
  }
  return `Found ${memories.length} relevant memories:
${memories.map((m) => `- ${m.key}: ${m.value.slice(0, 100)}...`).join("\n")}`;
}

// src/memory/graphiti.ts
var GraphitiMemory = class extends EventEmitter {
  config;
  connected = false;
  driver = null;
  localCache = new LocalMemoryCache();
  useLocalFallback = true;
  constructor(config) {
    super();
    this.config = {
      uri: config?.uri ?? process.env.NEO4J_URI ?? "",
      username: config?.username ?? process.env.NEO4J_USERNAME ?? "neo4j",
      password: config?.password ?? process.env.NEO4J_PASSWORD ?? "",
      database: config?.database ?? "neo4j",
      namespace: config?.namespace ?? "opus67",
      embeddingModel: config?.embeddingModel ?? "local",
      maxResults: config?.maxResults ?? 10,
      fallbackToLocal: config?.fallbackToLocal ?? true
    };
    if (this.config.fallbackToLocal || !this.config.uri || !this.config.password) {
      this.useLocalFallback = true;
    }
  }
  generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  async connect() {
    if (!this.config.uri || !this.config.password) {
      console.warn("[Graphiti] No Neo4j credentials, using local fallback");
      this.useLocalFallback = true;
      return false;
    }
    try {
      const neo4j = await import('neo4j-driver').catch(() => null);
      if (!neo4j) {
        console.warn("[Graphiti] neo4j-driver not installed, using local fallback");
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
      console.warn("[Graphiti] Connection failed, using local fallback:", error);
      this.useLocalFallback = true;
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
  async initializeSchema() {
    if (!this.driver) return;
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(`CREATE INDEX memory_key IF NOT EXISTS FOR (m:Memory) ON (m.key)`);
      await session.run(`CREATE INDEX memory_namespace IF NOT EXISTS FOR (m:Memory) ON (m.namespace)`);
      await session.run(`CREATE INDEX memory_type IF NOT EXISTS FOR (m:Memory) ON (m.type)`);
    } finally {
      await session.close();
    }
  }
  async disconnect() {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      this.connected = false;
      this.emit("disconnected");
    }
  }
  async createNode(key, value, type, metadata = {}) {
    const embedding = await generateEmbedding(`${key} ${value}`);
    const node = {
      id: this.generateId(),
      key,
      value,
      namespace: this.config.namespace,
      type,
      embedding,
      metadata,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (this.useLocalFallback) {
      this.localCache.set(node.id, node);
    } else {
      await this.writeNode(node);
    }
    this.emit("memory:added", node);
    return node;
  }
  async addEpisode(episode) {
    const key = episode.name ?? `episode:${episode.type ?? "general"}:${Date.now()}`;
    return this.createNode(key, episode.content, "episode", {
      episodeType: episode.type,
      source: episode.source,
      actors: episode.actors,
      context: episode.context,
      originalTimestamp: episode.timestamp
    });
  }
  async addFact(key, value, metadata) {
    return this.createNode(key, value, "fact", metadata ?? {});
  }
  async storeImprovement(improvement) {
    return this.createNode(
      `improvement:${improvement.component}`,
      JSON.stringify(improvement),
      "improvement",
      {
        component: improvement.component,
        changeType: improvement.changeType,
        impact: improvement.impact,
        automated: improvement.automated
      }
    );
  }
  async trackGoal(goal) {
    return this.createNode(
      `goal:${goal.description.slice(0, 50)}`,
      JSON.stringify(goal),
      "goal",
      {
        progress: goal.progress,
        status: goal.status,
        milestones: goal.milestones
      }
    );
  }
  async writeNode(node) {
    if (!this.driver) return;
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(`
        MERGE (m:Memory {id: $id})
        SET m.key = $key, m.value = $value, m.namespace = $namespace,
            m.type = $type, m.metadata = $metadata,
            m.createdAt = $createdAt, m.updatedAt = $updatedAt
      `, {
        id: node.id,
        key: node.key,
        value: node.value,
        namespace: node.namespace,
        type: node.type,
        metadata: JSON.stringify(node.metadata),
        createdAt: node.createdAt.toISOString(),
        updatedAt: node.updatedAt.toISOString()
      });
    } finally {
      await session.close();
    }
  }
  async search(query, options) {
    const limit = options?.limit ?? this.config.maxResults;
    const searchOpts = { ...options, limit };
    const results = this.useLocalFallback ? await searchLocalCache(this.localCache, query, searchOpts) : await searchNeo4j(this.driver, this.config.database, this.config.namespace, query, searchOpts);
    this.emit("search:complete", query, results);
    return results;
  }
  async getContext(topic) {
    const results = await this.search(topic, { limit: 5 });
    const memories = results.map((r) => r.node);
    return { memories, summary: formatContext(memories, topic) };
  }
  async getImprovements() {
    const results = await this.search("", { type: "improvement", limit: 100 });
    return results.map((r) => JSON.parse(r.node.value));
  }
  async getGoals() {
    const results = await this.search("", { type: "goal", limit: 100 });
    return results.map((r) => JSON.parse(r.node.value));
  }
  async updateGoal(goalId, progress, status) {
    if (this.useLocalFallback) {
      const node = this.localCache.get(goalId);
      if (node && node.type === "goal") {
        const goal = JSON.parse(node.value);
        goal.progress = progress;
        if (status) goal.status = status;
        node.value = JSON.stringify(goal);
        node.metadata.progress = progress;
        node.metadata.status = status ?? goal.status;
        node.updatedAt = /* @__PURE__ */ new Date();
        this.emit("memory:updated", node);
        return node;
      }
    }
    return null;
  }
  async delete(id) {
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
  async createRelationship(fromId, toId, type, metadata) {
    const edge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fromId,
      toId,
      type,
      weight: 1,
      metadata: metadata ?? {},
      createdAt: /* @__PURE__ */ new Date()
    };
    if (this.useLocalFallback) {
      return this.localCache.addEdge(fromId, toId, edge) ? edge : null;
    }
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run(`
        MATCH (from:Memory {id: $fromId}), (to:Memory {id: $toId})
        CREATE (from)-[r:${type.toUpperCase()} {
          id: $edgeId, weight: $weight, metadata: $metadata, createdAt: $createdAt
        }]->(to) RETURN r
      `, {
        fromId,
        toId,
        edgeId: edge.id,
        weight: edge.weight,
        metadata: JSON.stringify(edge.metadata),
        createdAt: edge.createdAt.toISOString()
      });
      return edge;
    } finally {
      await session.close();
    }
  }
  async getRelated(id, options) {
    if (this.useLocalFallback) {
      return this.localCache.getRelated(id, options);
    }
    const depth = options?.depth ?? 1;
    const session = this.driver.session({ database: this.config.database });
    try {
      const typeClause = options?.type ? `:${options.type.toUpperCase()}` : "";
      const result = await session.run(`
        MATCH (m:Memory {id: $id})-[${typeClause}*1..${depth}]->(related:Memory)
        RETURN DISTINCT related
      `, { id });
      return result.records.map((record) => {
        const m = record.get("related").properties;
        return {
          id: m.id,
          key: m.key,
          value: m.value,
          namespace: m.namespace,
          type: m.type,
          metadata: JSON.parse(m.metadata || "{}"),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        };
      });
    } finally {
      await session.close();
    }
  }
  async searchByTimeRange(startDate, endDate, options) {
    if (this.useLocalFallback) {
      return this.localCache.searchByTimeRange(startDate, endDate, options);
    }
    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(`
        MATCH (m:Memory)
        WHERE m.namespace = $namespace
          AND datetime(m.createdAt) >= datetime($startDate)
          AND datetime(m.createdAt) <= datetime($endDate)
          ${options?.type ? "AND m.type = $type" : ""}
        RETURN m ORDER BY m.createdAt DESC LIMIT $limit
      `, {
        namespace: this.config.namespace,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: options?.type,
        limit: options?.limit ?? this.config.maxResults
      });
      return result.records.map((record) => {
        const m = record.get("m").properties;
        return {
          id: m.id,
          key: m.key,
          value: m.value,
          namespace: m.namespace,
          type: m.type,
          metadata: JSON.parse(m.metadata || "{}"),
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        };
      });
    } finally {
      await session.close();
    }
  }
  async getRecent(limit = 10, type) {
    const now = /* @__PURE__ */ new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    return this.searchByTimeRange(weekAgo, now, { type, limit });
  }
  async getStats() {
    if (this.useLocalFallback) {
      return this.localCache.getStats();
    }
    const session = this.driver.session({ database: this.config.database });
    try {
      const result = await session.run(`
        MATCH (m:Memory {namespace: $namespace})
        RETURN m.type as type, count(*) as count,
               min(m.createdAt) as oldest, max(m.createdAt) as newest
      `, { namespace: this.config.namespace });
      const byType = {};
      let oldest = null;
      let newest = null;
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
        newestMemory: newest
      };
    } finally {
      await session.close();
    }
  }
  isConnected() {
    return this.connected && !this.useLocalFallback;
  }
  async formatStatus() {
    const stats = await this.getStats();
    const mode = this.useLocalFallback ? "LOCAL FALLBACK" : "NEO4J CONNECTED";
    return `
\u250C\u2500 GRAPHITI MEMORY STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  MODE: ${mode.padEnd(54)} \u2502
\u2502  NAMESPACE: ${this.config.namespace?.padEnd(49)} \u2502
\u2502  Total Memories: ${String(stats.totalMemories).padEnd(44)} \u2502
\u2502  Facts: ${String(stats.facts).padEnd(53)} \u2502
\u2502  Episodes: ${String(stats.episodes).padEnd(50)} \u2502
\u2502  Goals: ${String(stats.goals).padEnd(53)} \u2502
\u2502  Improvements: ${String(stats.improvements).padEnd(46)} \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
function createMemory(config) {
  return new GraphitiMemory(config);
}
var memory = new GraphitiMemory();

export { GraphitiMemory, createMemory, memory };
