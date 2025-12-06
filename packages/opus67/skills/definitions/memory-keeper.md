# Memory Keeper

> **ID:** `memory-keeper`
> **Tier:** 2
> **Token Cost:** 5000
> **MCP Connections:** mem0

## What This Skill Does

- Store and retrieve semantic memories across conversation sessions using Mem0
- Build persistent knowledge graphs with temporal awareness
- Search memories using natural language queries and semantic similarity
- Maintain context continuity across long-running agent workflows
- Track facts, preferences, decisions, and learnings with confidence scores
- Implement memory hierarchies with namespaces for isolation
- Perform vector-based similarity search for intelligent information recall

## When to Use

This skill is automatically loaded when:

- **Keywords:** remember, recall, memory, context, persist, forget, cross-session, semantic memory, knowledge graph, vector search
- **File Types:** N/A (memory operations)
- **Directories:** packages/memory/, packages/opus67/src/memory/

## Core Capabilities

### 1. Mem0 Semantic Memory Integration

Leverage Mem0's vector-based memory storage to maintain intelligent, searchable context across sessions.

**Best Practices:**
- Initialize Mem0 with proper configuration including LLM provider and vector store
- Use meaningful entity IDs (user IDs, session IDs) to partition memories
- Set appropriate memory types (fact, preference, decision, learning) for organization
- Include confidence scores to track memory reliability over time
- Add expiration times for temporary or time-sensitive information

**Common Patterns:**

```typescript
import { MemoryClient } from "mem0ai";

interface Mem0Config {
  apiKey?: string;
  selfHosted?: boolean;
  llmProvider: "openai" | "anthropic" | "local";
  llmApiKey?: string;
  vectorStore: "qdrant" | "chroma" | "pinecone";
  vectorStoreUrl?: string;
  collectionName?: string;
}

class Mem0MemorySystem {
  private client: MemoryClient;
  private config: Mem0Config;

  constructor(config: Mem0Config) {
    this.config = config;

    if (config.selfHosted) {
      this.client = new MemoryClient({
        baseUrl: "http://localhost:8000",
        config: {
          llm: {
            provider: config.llmProvider,
            config: {
              model: config.llmProvider === "openai" ? "gpt-4" : "claude-3-5-sonnet-20241022",
              api_key: config.llmApiKey,
            },
          },
          vector_store: {
            provider: config.vectorStore,
            config: {
              url: config.vectorStoreUrl || "http://localhost:6333",
              collection_name: config.collectionName || "opus67_memories",
            },
          },
        },
      });
    } else {
      this.client = new MemoryClient({ apiKey: config.apiKey });
    }
  }

  async storeMemory(params: {
    message: string;
    userId: string;
    sessionId?: string;
    metadata?: Record<string, any>;
    type?: "fact" | "preference" | "decision" | "learning";
    confidence?: number;
  }): Promise<string> {
    const { message, userId, sessionId, metadata = {}, type = "fact", confidence = 1.0 } = params;

    const enrichedMetadata = {
      ...metadata,
      memory_type: type,
      confidence,
      session_id: sessionId,
      stored_at: new Date().toISOString(),
    };

    const result = await this.client.add(message, {
      user_id: userId,
      metadata: enrichedMetadata,
    });

    return result.id;
  }

  async getMemories(params: {
    userId: string;
    limit?: number;
    type?: string;
  }): Promise<Array<{
    id: string;
    memory: string;
    metadata: Record<string, any>;
    created_at: string;
  }>> {
    const { userId, limit, type } = params;
    const memories = await this.client.getAll({ user_id: userId });

    let filtered = memories;
    if (type) {
      filtered = memories.filter((m) => m.metadata?.memory_type === type);
    }
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  async searchMemories(params: {
    query: string;
    userId: string;
    limit?: number;
    threshold?: number;
  }): Promise<Array<{
    id: string;
    memory: string;
    score: number;
    metadata: Record<string, any>;
  }>> {
    const { query, userId, limit = 10, threshold = 0.7 } = params;

    const results = await this.client.search(query, {
      user_id: userId,
      limit,
    });

    return results
      .filter((r) => r.score >= threshold)
      .map((r) => ({
        id: r.id,
        memory: r.memory,
        score: r.score,
        metadata: r.metadata || {},
      }));
  }

  async updateMemory(params: {
    memoryId: string;
    newContent: string;
    userId: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { memoryId, newContent, userId, metadata } = params;

    await this.client.update(memoryId, {
      data: newContent,
      user_id: userId,
      metadata: {
        ...metadata,
        updated_at: new Date().toISOString(),
      },
    });
  }

  async deleteMemory(memoryId: string, userId: string): Promise<void> {
    await this.client.delete(memoryId, { user_id: userId });
  }

  async deleteAllMemories(userId: string): Promise<void> {
    await this.client.deleteAll({ user_id: userId });
  }

  async getMemoryHistory(memoryId: string, userId: string): Promise<any[]> {
    return await this.client.history(memoryId, { user_id: userId });
  }
}

// Usage
const memorySystem = new Mem0MemorySystem({
  selfHosted: true,
  llmProvider: "anthropic",
  llmApiKey: process.env.ANTHROPIC_API_KEY,
  vectorStore: "qdrant",
  vectorStoreUrl: "http://localhost:6333",
  collectionName: "opus67_memories",
});

await memorySystem.storeMemory({
  message: "User prefers TypeScript over JavaScript for all new projects",
  userId: "user_123",
  sessionId: "session_456",
  type: "preference",
  confidence: 1.0,
  metadata: { category: "development", language: "typescript" },
});

const results = await memorySystem.searchMemories({
  query: "What programming languages does the user prefer?",
  userId: "user_123",
  limit: 5,
  threshold: 0.8,
});
```

**Gotchas:**
- Mem0 requires an LLM for semantic processing - ensure API keys are configured
- Self-hosted mode needs both Mem0 service and vector store running
- Memory IDs are immutable - updates create new versions internally
- Search results are ranked by semantic similarity, not keyword matching
- Large memory stores can impact search latency - use pagination

### 2. Context Persistence Across Sessions

Maintain conversation context and agent state across multiple sessions for continuity.

**Best Practices:**
- Use session IDs to group related memories together
- Store conversation summaries periodically for high-level context
- Implement memory consolidation to merge similar memories
- Set expiration policies for temporary context
- Use namespaces to isolate different projects or domains

**Common Patterns:**

```typescript
import { EventEmitter } from "eventemitter3";
import { randomUUID } from "crypto";

interface SessionContext {
  sessionId: string;
  userId: string;
  startedAt: string;
  lastActiveAt: string;
  metadata: Record<string, any>;
  conversationSummary?: string;
}

interface ContextualMemory {
  id: string;
  content: string;
  sessionId: string;
  timestamp: string;
  type: "conversation" | "decision" | "outcome";
  context: Record<string, any>;
}

class PersistentContextManager extends EventEmitter {
  private memorySystem: Mem0MemorySystem;
  private activeContexts: Map<string, SessionContext>;
  private contextWindow: number;

  constructor(memorySystem: Mem0MemorySystem, contextWindow: number = 20) {
    super();
    this.memorySystem = memorySystem;
    this.activeContexts = new Map();
    this.contextWindow = contextWindow;
  }

  async initializeSession(params: {
    userId: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<SessionContext> {
    const { userId, sessionId, metadata = {} } = params;
    const id = sessionId || randomUUID();
    const now = new Date().toISOString();

    if (sessionId) {
      const existingContext = await this.loadSessionContext(sessionId, userId);
      if (existingContext) {
        existingContext.lastActiveAt = now;
        this.activeContexts.set(id, existingContext);
        this.emit("session:resumed", existingContext);
        return existingContext;
      }
    }

    const context: SessionContext = {
      sessionId: id,
      userId,
      startedAt: now,
      lastActiveAt: now,
      metadata,
    };

    this.activeContexts.set(id, context);
    await this.saveSessionContext(context);
    this.emit("session:created", context);

    return context;
  }

  async addToSession(params: {
    sessionId: string;
    userId: string;
    content: string;
    type: "conversation" | "decision" | "outcome";
    context?: Record<string, any>;
  }): Promise<ContextualMemory> {
    const { sessionId, userId, content, type, context = {} } = params;

    const memory: ContextualMemory = {
      id: randomUUID(),
      content,
      sessionId,
      timestamp: new Date().toISOString(),
      type,
      context,
    };

    await this.memorySystem.storeMemory({
      message: content,
      userId,
      sessionId,
      metadata: { memory_id: memory.id, type, context },
      type: type === "decision" ? "decision" : "fact",
    });

    const sessionContext = this.activeContexts.get(sessionId);
    if (sessionContext) {
      sessionContext.lastActiveAt = memory.timestamp;
    }

    this.emit("memory:added", memory);
    return memory;
  }

  async getSessionContext(params: {
    sessionId: string;
    userId: string;
    includeHistory?: boolean;
  }): Promise<{
    session: SessionContext;
    recentMemories: ContextualMemory[];
    summary?: string;
  }> {
    const { sessionId, userId, includeHistory = true } = params;

    const session = this.activeContexts.get(sessionId) ||
      await this.loadSessionContext(sessionId, userId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    let recentMemories: ContextualMemory[] = [];
    if (includeHistory) {
      const memories = await this.memorySystem.getMemories({
        userId,
        limit: this.contextWindow,
      });

      recentMemories = memories
        .filter((m) => m.metadata?.session_id === sessionId)
        .map((m) => ({
          id: m.metadata?.memory_id || m.id,
          content: m.memory,
          sessionId,
          timestamp: m.metadata?.stored_at || m.created_at,
          type: m.metadata?.type || "conversation",
          context: m.metadata?.context || {},
        }));
    }

    return {
      session,
      recentMemories,
      summary: session.conversationSummary,
    };
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.activeContexts.get(sessionId);
    if (session) {
      await this.saveSessionContext(session);
      this.activeContexts.delete(sessionId);
      this.emit("session:closed", session);
    }
  }

  private async saveSessionContext(context: SessionContext): Promise<void> {
    await this.memorySystem.storeMemory({
      message: JSON.stringify(context),
      userId: context.userId,
      sessionId: context.sessionId,
      type: "fact",
      metadata: {
        is_session_context: true,
        session_id: context.sessionId,
      },
    });
  }

  private async loadSessionContext(
    sessionId: string,
    userId: string
  ): Promise<SessionContext | null> {
    const results = await this.memorySystem.searchMemories({
      query: `session context ${sessionId}`,
      userId,
      limit: 1,
    });

    const sessionMemory = results.find(
      (r) => r.metadata?.is_session_context && r.metadata?.session_id === sessionId
    );

    if (sessionMemory) {
      return JSON.parse(sessionMemory.memory);
    }

    return null;
  }
}

// Usage
const contextManager = new PersistentContextManager(memorySystem, 20);

const session = await contextManager.initializeSession({
  userId: "user_123",
  metadata: { project: "opus67", mode: "build" },
});

await contextManager.addToSession({
  sessionId: session.sessionId,
  userId: "user_123",
  content: "User requested to build a new React component with TypeScript",
  type: "conversation",
  context: { component_name: "DataTable", framework: "react" },
});
```

**Gotchas:**
- Session IDs must be unique across reconnections
- Large conversation histories exceed LLM context windows - use summarization
- Memory consolidation should run periodically
- Timestamps must use ISO 8601 format for temporal queries
- Session metadata should be indexed for filtering

### 3. Memory Search with Semantic Similarity

Implement intelligent memory retrieval using vector similarity and natural language.

**Best Practices:**
- Use natural language queries for better results than keyword matching
- Set similarity thresholds: 0.7-0.8 for strict, 0.5-0.6 for broad
- Combine semantic search with metadata filters
- Cache frequently accessed memories to reduce latency
- Implement re-ranking strategies for multi-stage retrieval

**Common Patterns:**

```typescript
interface SearchFilter {
  userId: string;
  sessionId?: string;
  type?: string;
  tags?: string[];
  dateRange?: { start: string; end: string };
  minConfidence?: number;
}

interface SearchResult {
  memory: ContextualMemory;
  score: number;
  relevanceReason?: string;
}

class SemanticMemorySearch {
  private memorySystem: Mem0MemorySystem;
  private cache: Map<string, SearchResult[]>;
  private cacheExpiry: number;

  constructor(memorySystem: Mem0MemorySystem, cacheExpiryMs: number = 300000) {
    this.memorySystem = memorySystem;
    this.cache = new Map();
    this.cacheExpiry = cacheExpiryMs;
  }

  async search(params: {
    query: string;
    filters: SearchFilter;
    limit?: number;
    threshold?: number;
    useCache?: boolean;
  }): Promise<SearchResult[]> {
    const { query, filters, limit = 10, threshold = 0.7, useCache = true } = params;

    const cacheKey = this.getCacheKey(query, filters);
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const rawResults = await this.memorySystem.searchMemories({
      query,
      userId: filters.userId,
      limit: limit * 2,
      threshold: threshold * 0.8,
    });

    let filtered = rawResults.filter((result) => {
      const metadata = result.metadata;

      if (filters.sessionId && metadata.session_id !== filters.sessionId) {
        return false;
      }

      if (filters.type && metadata.memory_type !== filters.type) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const memoryTags = metadata.tags || [];
        if (!filters.tags.some((tag) => memoryTags.includes(tag))) {
          return false;
        }
      }

      if (filters.dateRange) {
        const memoryDate = new Date(metadata.stored_at || result.metadata.created_at);
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        if (memoryDate < start || memoryDate > end) {
          return false;
        }
      }

      if (filters.minConfidence !== undefined) {
        const confidence = metadata.confidence || 1.0;
        if (confidence < filters.minConfidence) {
          return false;
        }
      }

      return true;
    });

    const scored = filtered
      .filter((r) => r.score >= threshold)
      .map((r) => ({
        memory: {
          id: r.id,
          content: r.memory,
          sessionId: r.metadata.session_id,
          timestamp: r.metadata.stored_at,
          type: r.metadata.memory_type || "fact",
          context: r.metadata.context || {},
        },
        score: r.score,
        relevanceReason: this.explainRelevance(query, r.memory, r.score),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (useCache) {
      this.cache.set(cacheKey, scored);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
    }

    return scored;
  }

  async multiSearch(params: {
    queries: string[];
    filters: SearchFilter;
    limit?: number;
    fusionStrategy?: "max" | "average" | "reciprocal_rank";
  }): Promise<SearchResult[]> {
    const { queries, filters, limit = 10, fusionStrategy = "reciprocal_rank" } = params;

    const resultSets = await Promise.all(
      queries.map((query) =>
        this.search({
          query,
          filters,
          limit: limit * 2,
          threshold: 0.6,
          useCache: true,
        })
      )
    );

    const fusedScores = new Map<string, number>();
    const memoryMap = new Map<string, ContextualMemory>();

    resultSets.forEach((results) => {
      results.forEach((result, rank) => {
        const memoryId = result.memory.id;
        memoryMap.set(memoryId, result.memory);

        let score = 0;
        switch (fusionStrategy) {
          case "max":
            score = Math.max(fusedScores.get(memoryId) || 0, result.score);
            break;
          case "average":
            const currentScore = fusedScores.get(memoryId) || 0;
            const currentCount = currentScore > 0 ? 1 : 0;
            score = (currentScore + result.score) / (currentCount + 1);
            break;
          case "reciprocal_rank":
            const rrScore = 1 / (rank + 1);
            score = (fusedScores.get(memoryId) || 0) + rrScore;
            break;
        }

        fusedScores.set(memoryId, score);
      });
    });

    return Array.from(fusedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([memoryId, score]) => ({
        memory: memoryMap.get(memoryId)!,
        score,
        relevanceReason: `Fused from ${queries.length} queries`,
      }));
  }

  private explainRelevance(query: string, memory: string, score: number): string {
    if (score > 0.9) return "Highly relevant - direct match";
    if (score > 0.8) return "Very relevant - strong similarity";
    if (score > 0.7) return "Relevant - good match";
    return "Potentially relevant";
  }

  private getCacheKey(query: string, filters: SearchFilter): string {
    return `${query}:${JSON.stringify(filters)}`;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Usage
const searchEngine = new SemanticMemorySearch(memorySystem);

const results = await searchEngine.search({
  query: "What are the user's preferences for React development?",
  filters: {
    userId: "user_123",
    type: "preference",
    tags: ["development", "react"],
    minConfidence: 0.8,
  },
  limit: 5,
  threshold: 0.75,
});
```

**Gotchas:**
- Vector similarity is not intuitive - test threshold values
- Metadata filtering happens after semantic search
- Cache invalidation is critical when memories change
- Multi-query fusion is computationally expensive
- Temporal queries need consistent timestamps

### 4. Cross-Session Recall and Memory Lifecycle

Manage memory lifecycle including retrieval, consolidation, and expiration.

**Best Practices:**
- Implement confidence decay for time-sensitive information
- Consolidate duplicate or conflicting memories periodically
- Use memory versioning to track evolution
- Set appropriate expiration policies by memory type
- Maintain memory relationships for traversal

**Common Patterns:**

```typescript
interface MemoryLifecycleConfig {
  consolidationInterval: number;
  confidenceDecayRate: number;
  expirationPolicies: Record<string, number>;
}

class MemoryLifecycleManager {
  private memorySystem: Mem0MemorySystem;
  private config: MemoryLifecycleConfig;

  constructor(memorySystem: Mem0MemorySystem, config: Partial<MemoryLifecycleConfig> = {}) {
    this.memorySystem = memorySystem;
    this.config = {
      consolidationInterval: config.consolidationInterval || 3600000,
      confidenceDecayRate: config.confidenceDecayRate || 0.1,
      expirationPolicies: config.expirationPolicies || {
        fact: 90 * 24 * 60 * 60 * 1000,
        preference: 180 * 24 * 60 * 60 * 1000,
        decision: 30 * 24 * 60 * 60 * 1000,
        learning: 365 * 24 * 60 * 60 * 1000,
      },
    };
  }

  async crossSessionRecall(params: {
    userId: string;
    query: string;
    sessionIds?: string[];
    enrichWithContext?: boolean;
  }): Promise<{
    memories: any[];
    context: string;
    confidence: number;
  }> {
    const { userId, query, sessionIds, enrichWithContext = true } = params;

    const searchEngine = new SemanticMemorySearch(this.memorySystem);
    const memories = await searchEngine.search({
      query,
      filters: { userId },
      limit: 10,
      threshold: 0.7,
    });

    let filteredMemories = memories;
    if (sessionIds && sessionIds.length > 0) {
      filteredMemories = memories.filter((m) =>
        sessionIds.includes(m.memory.sessionId)
      );
    }

    const avgConfidence = filteredMemories.reduce((sum, m) => sum + m.score, 0) /
      (filteredMemories.length || 1);

    let context = "";
    if (enrichWithContext && filteredMemories.length > 0) {
      context = this.buildContextFromMemories(filteredMemories);
    }

    return { memories: filteredMemories, context, confidence: avgConfidence };
  }

  private buildContextFromMemories(memories: SearchResult[]): string {
    const grouped = new Map<string, SearchResult[]>();

    memories.forEach((m) => {
      const type = m.memory.type;
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(m);
    });

    let context = "Relevant context:\n\n";
    grouped.forEach((mems, type) => {
      context += `${type.toUpperCase()}S:\n`;
      mems.forEach((m, i) => {
        context += `${i + 1}. ${m.memory.content} (confidence: ${m.score.toFixed(2)})\n`;
      });
      context += "\n";
    });

    return context;
  }
}

// Usage
const lifecycleManager = new MemoryLifecycleManager(memorySystem);

const recalled = await lifecycleManager.crossSessionRecall({
  userId: "user_123",
  query: "What are the project requirements?",
  enrichWithContext: true,
});
```

**Gotchas:**
- Consolidation is expensive - run during low-traffic periods
- Confidence decay should be gradual
- Conflict detection needs domain-specific logic
- Memory merging must preserve all metadata
- Cross-session recall can return stale data

## Real-World Examples

### Example 1: AI Agent with Persistent Memory

```typescript
import { EventEmitter } from "eventemitter3";

interface AgentConfig {
  userId: string;
  agentId: string;
  memorySystem: Mem0MemorySystem;
  contextManager: PersistentContextManager;
  searchEngine: SemanticMemorySearch;
}

interface AgentTask {
  id: string;
  type: string;
  input: string;
  context: Record<string, any>;
}

interface AgentResponse {
  taskId: string;
  output: string;
  memoriesUsed: string[];
  newMemories: string[];
}

class PersistentMemoryAgent extends EventEmitter {
  private config: AgentConfig;
  private sessionId: string | null = null;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    const session = await this.config.contextManager.initializeSession({
      userId: this.config.userId,
      metadata: {
        agent_id: this.config.agentId,
        initialized_at: new Date().toISOString(),
      },
    });

    this.sessionId = session.sessionId;
    this.emit("initialized", { sessionId: this.sessionId });
  }

  async processTask(task: AgentTask): Promise<AgentResponse> {
    if (!this.sessionId) {
      throw new Error("Agent not initialized");
    }

    const relevantMemories = await this.config.searchEngine.multiSearch({
      queries: [
        task.input,
        `Previous tasks similar to: ${task.type}`,
      ],
      filters: { userId: this.config.userId },
      limit: 5,
      fusionStrategy: "reciprocal_rank",
    });

    const memoryContext = relevantMemories
      .map((r) => `- ${r.memory.content}`)
      .join("\n");

    const output = `Task ${task.type} completed with memory augmentation`;

    const taskMemoryId = await this.config.memorySystem.storeMemory({
      message: `Completed: ${task.type} - ${task.input}`,
      userId: this.config.userId,
      sessionId: this.sessionId,
      type: "decision",
      confidence: 0.9,
      metadata: { task_id: task.id },
    });

    return {
      taskId: task.id,
      output,
      memoriesUsed: relevantMemories.map((m) => m.memory.id),
      newMemories: [taskMemoryId],
    };
  }
}
```

### Example 2: Multi-User Memory Isolation

```typescript
interface TenantConfig {
  tenantId: string;
  namespace: string;
  memorySystem: Mem0MemorySystem;
}

class MultiTenantMemoryManager {
  private tenants: Map<string, TenantConfig>;

  constructor() {
    this.tenants = new Map();
  }

  async registerTenant(config: TenantConfig): Promise<void> {
    this.tenants.set(config.tenantId, config);

    await config.memorySystem.storeMemory({
      message: `Tenant ${config.tenantId} registered`,
      userId: `system_${config.tenantId}`,
      type: "fact",
      metadata: { tenant_id: config.tenantId },
    });
  }

  async storeMemory(params: {
    tenantId: string;
    userId: string;
    content: string;
    type: string;
  }): Promise<string> {
    const { tenantId, userId, content, type } = params;

    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not registered`);
    }

    return await tenant.memorySystem.storeMemory({
      message: content,
      userId: `${tenantId}:${userId}`,
      type: type as any,
      metadata: { tenant_id: tenantId },
    });
  }
}
```

## Related Skills

- `ai-native-stack` - Building AI-powered applications with memory integration
- `vector-wizard` - Vector database operations and embeddings
- `graph-navigator` - Neo4j graph database and Cypher queries
- `embeddings-expert` - Generating and managing vector embeddings
- `caching-expert` - Local caching strategies for memory performance
- `langchain-expert` - LangChain memory modules and chat history

## Further Reading

- [Mem0 Documentation](https://mem0.ai/docs) - Official Mem0 docs and API reference
- [Neo4j Graph Database](https://neo4j.com/docs/) - Graph database for knowledge graphs
- [Qdrant Vector Database](https://qdrant.tech/documentation/) - Vector storage and similarity search
- [Vector Similarity Search](https://www.pinecone.io/learn/vector-similarity/) - Understanding vector search
- [Semantic Memory Systems](https://www.anthropic.com/research/memory) - Research on AI memory
- [Knowledge Graphs](https://arxiv.org/abs/2003.02320) - Academic papers on knowledge graphs

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
*Comprehensive memory management for persistent AI context*
