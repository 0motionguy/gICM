/**
 * OPUS 67 Unified Memory
 * Single interface for all memory sources
 *
 * Coordinates:
 * - GraphitiMemory (Neo4j/Local)
 * - LearningStore (evolution)
 * - MarkdownLoader (.claude/memory)
 * - HMLRAdapter (multi-hop reasoning)
 * - Future: claude-mem, SQLite, etc.
 */

import { EventEmitter } from "eventemitter3";
import { join } from "path";

import type {
  MemorySource,
  QueryType,
  UnifiedQuery,
  UnifiedResult,
  UnifiedContext,
  WritePayload,
  WriteResult,
  UnifiedMemoryConfig,
  MemoryStats,
  UnifiedMemoryEvents,
  MemoryAdapter,
  QUERY_PRIORITIES,
  WRITE_ROUTES,
  DEFAULT_CONFIG,
} from "./types.js";

import { UnifiedBus, createUnifiedBus } from "./unified-bus.js";
import { MarkdownLoader, createMarkdownLoader } from "./markdown-loader.js";
import {
  LearningSyncBridge,
  createLearningSyncBridge,
} from "./learning-sync.js";
import { HMLRAdapter, createHMLRAdapter } from "./adapters/hmlr-adapter.js";
import { SessionStore, createSessionStore } from "./adapters/session-store.js";
import { GraphitiMemory, createMemory } from "../graphiti.js";

// =============================================================================
// GRAPHITI ADAPTER WRAPPER
// =============================================================================

class GraphitiAdapter implements MemoryAdapter {
  readonly source: MemorySource = "graphiti";
  private graphiti: GraphitiMemory;
  private initialized = false;

  constructor(graphiti: GraphitiMemory) {
    this.graphiti = graphiti;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    await this.graphiti.connect();
    this.initialized = true;
    return true;
  }

  isAvailable(): boolean {
    return this.initialized;
  }

  async query(
    query: string,
    options?: Partial<UnifiedQuery>,
  ): Promise<UnifiedResult[]> {
    const results = await this.graphiti.search(query, {
      limit: options?.limit ?? 10,
    });

    return results.map((r) => ({
      id: r.node.id,
      source: "graphiti" as MemorySource,
      content: r.node.value,
      score: r.score,
      metadata: {
        type: r.node.type,
        key: r.node.key,
        timestamp: r.node.createdAt,
        originalNode: r.node,
      },
    }));
  }

  async write(payload: WritePayload): Promise<string | null> {
    const node = await this.graphiti.addFact(
      payload.key ?? `${payload.type}:${Date.now()}`,
      payload.content,
      payload.metadata,
    );
    return node.id;
  }

  async getStats(): Promise<{ count: number; lastSync?: Date }> {
    const stats = await this.graphiti.getStats();
    return {
      count: stats.totalMemories,
      lastSync: stats.newestMemory ?? undefined,
    };
  }

  async disconnect(): Promise<void> {
    await this.graphiti.disconnect();
    this.initialized = false;
  }

  getGraphiti(): GraphitiMemory {
    return this.graphiti;
  }
}

// =============================================================================
// UNIFIED MEMORY
// =============================================================================

export class UnifiedMemory extends EventEmitter<UnifiedMemoryEvents> {
  private config: Required<UnifiedMemoryConfig>;
  private bus: UnifiedBus;
  private initialized = false;

  // Adapters
  private graphitiAdapter: GraphitiAdapter | null = null;
  private markdownLoader: MarkdownLoader | null = null;
  private learningSyncBridge: LearningSyncBridge | null = null;
  private hmlrAdapter: HMLRAdapter | null = null;
  private sessionStore: SessionStore | null = null;

  // Cache
  private queryCache: Map<
    string,
    { results: UnifiedResult[]; timestamp: number }
  > = new Map();

  constructor(config?: Partial<UnifiedMemoryConfig>) {
    super();

    const defaultConfig: Required<UnifiedMemoryConfig> = {
      enableNeo4j: true,
      enableSQLite: true,
      enableClaudeMem: true,
      enableHMLR: true,
      projectRoot: process.cwd(),
      markdownMemoryPath: ".claude/memory",
      sessionLogsPath: ".claude/logs",
      maxContextTokens: 4000,
      maxResults: 10,
      maxHops: 3,
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000,
    };

    this.config = { ...defaultConfig, ...config };
    this.bus = createUnifiedBus();
  }

  /**
   * Initialize all memory sources
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log("[UnifiedMemory] Initializing...");

    // Initialize Graphiti (always available with local fallback)
    const graphiti = createMemory();
    this.graphitiAdapter = new GraphitiAdapter(graphiti);
    this.bus.registerAdapter(this.graphitiAdapter);

    // Initialize MarkdownLoader
    const mdPath = join(
      this.config.projectRoot,
      this.config.markdownMemoryPath,
    );
    this.markdownLoader = createMarkdownLoader(mdPath);
    this.bus.registerAdapter(this.markdownLoader);

    // Initialize LearningSyncBridge
    this.learningSyncBridge = createLearningSyncBridge(
      undefined,
      this.graphitiAdapter.getGraphiti(),
      { syncEnabled: true },
    );
    this.bus.registerAdapter(this.learningSyncBridge);

    // Initialize HMLR if enabled
    if (this.config.enableHMLR) {
      this.hmlrAdapter = createHMLRAdapter(this.graphitiAdapter.getGraphiti(), {
        maxHops: this.config.maxHops,
      });
      this.bus.registerAdapter(this.hmlrAdapter);
    }

    // Initialize SessionStore (5th adapter)
    this.sessionStore = createSessionStore({
      projectRoot: this.config.projectRoot,
    });
    // Note: SessionStore is not a MemoryAdapter, but we query it directly

    // Initialize all adapters via bus
    await this.bus.initialize();

    this.initialized = true;
    this.emit("ready");

    console.log(
      "[UnifiedMemory] Initialized with sources:",
      this.bus.getAvailableSources(),
    );
  }

  /**
   * Auto-detect query type from query string
   */
  private detectQueryType(query: string): QueryType {
    const lower = query.toLowerCase();

    // Multi-hop indicators
    if (
      lower.includes("why") ||
      lower.includes("because") ||
      lower.includes("led to") ||
      lower.includes("caused") ||
      lower.includes("history of")
    ) {
      return "multi-hop";
    }

    // Temporal indicators
    if (
      lower.includes("yesterday") ||
      lower.includes("last week") ||
      lower.includes("when") ||
      lower.includes("recent")
    ) {
      return "temporal";
    }

    // Graph/relationship indicators
    if (
      lower.includes("related") ||
      lower.includes("connected") ||
      lower.includes("depends")
    ) {
      return "graph";
    }

    // Keyword/exact match indicators
    if (
      lower.includes("skill:") ||
      lower.includes("mcp:") ||
      lower.startsWith("find ")
    ) {
      return "keyword";
    }

    // Default to semantic
    return "semantic";
  }

  /**
   * Get sources for a query type
   */
  private getSourcesForQueryType(queryType: QueryType): MemorySource[] {
    const priorities: Record<QueryType, MemorySource[]> = {
      semantic: ["graphiti", "learning", "markdown"],
      keyword: ["markdown", "learning"],
      graph: ["graphiti", "hmlr", "learning"],
      temporal: ["graphiti", "markdown"],
      structured: ["graphiti"],
      "multi-hop": ["hmlr", "graphiti", "learning"],
    };

    return priorities[queryType] ?? ["graphiti", "markdown", "learning"];
  }

  /**
   * Query across all available memory sources
   */
  async query(params: UnifiedQuery): Promise<UnifiedResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { query } = params;
    const queryType = params.type ?? this.detectQueryType(query);
    const limit = params.limit ?? this.config.maxResults;
    const minScore = params.minScore ?? 0.3;

    // Check cache
    const cacheKey = `${queryType}:${query}:${limit}`;
    if (this.config.cacheEnabled) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
        return cached.results;
      }
    }

    this.emit("query:start", params);
    const startTime = Date.now();

    // Determine which sources to query
    const sources = params.sources ?? this.getSourcesForQueryType(queryType);
    const availableSources = sources.filter((s) => this.bus.isAvailable(s));

    // Query sources in parallel
    const results = await this.bus.queryParallel(query, availableSources, {
      limit: limit * 2, // Get more and filter
      minScore,
    });

    // Add SessionStore results (not in bus, queried directly)
    if (this.sessionStore) {
      const sessionResults = this.sessionStore.query(query, limit);
      results.push(...sessionResults);
    }

    // Sort by score and deduplicate
    const seen = new Set<string>();
    const dedupedResults = results.filter((r) => {
      // Dedupe by content similarity (first 100 chars)
      const contentKey = r.content.slice(0, 100).toLowerCase();
      if (seen.has(contentKey)) return false;
      seen.add(contentKey);
      return true;
    });

    const finalResults = dedupedResults.slice(0, limit);
    const latency = Date.now() - startTime;

    // Cache results
    if (this.config.cacheEnabled) {
      this.queryCache.set(cacheKey, {
        results: finalResults,
        timestamp: Date.now(),
      });
    }

    this.emit("query:complete", query, finalResults, latency);
    return finalResults;
  }

  /**
   * Write to appropriate destinations
   */
  async write(payload: WritePayload): Promise<WriteResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Determine destinations based on type
    const writeRoutes: Record<string, MemorySource[]> = {
      fact: ["graphiti"],
      episode: ["graphiti"],
      learning: ["learning", "graphiti"],
      win: ["markdown", "graphiti"],
      decision: ["markdown", "graphiti"],
      goal: ["graphiti", "learning"],
      improvement: ["graphiti", "learning"],
    };

    const destinations = payload.destinations ??
      writeRoutes[payload.type] ?? ["graphiti"];

    // Write to destinations
    const result = await this.bus.writeToDestinations(payload, destinations);

    this.emit("write:complete", payload, result);
    return result;
  }

  /**
   * Get context bundle for a topic
   */
  async getContext(topic: string, maxTokens?: number): Promise<UnifiedContext> {
    const tokenLimit = maxTokens ?? this.config.maxContextTokens;

    // Query with semantic type
    const results = await this.query({
      query: topic,
      type: "semantic",
      limit: 20,
    });

    // Calculate token estimate (rough: 4 chars = 1 token)
    let tokenEstimate = 0;
    const filteredResults: UnifiedResult[] = [];

    for (const result of results) {
      const resultTokens = Math.ceil(result.content.length / 4);
      if (tokenEstimate + resultTokens <= tokenLimit) {
        filteredResults.push(result);
        tokenEstimate += resultTokens;
      }
    }

    // Count by source
    const sources: Record<MemorySource, number> = {
      graphiti: 0,
      learning: 0,
      sqlite: 0,
      context: 0,
      markdown: 0,
      session: 0,
      "claude-mem": 0,
      hmlr: 0,
    };

    for (const result of filteredResults) {
      sources[result.source]++;
    }

    return {
      results: filteredResults,
      sources,
      tokenEstimate,
      query: topic,
      queryType: "semantic",
    };
  }

  /**
   * Multi-hop query using HMLR
   */
  async multiHopQuery(
    query: string,
    maxHops?: number,
  ): Promise<UnifiedResult[]> {
    if (!this.hmlrAdapter || !this.hmlrAdapter.isAvailable()) {
      console.warn(
        "[UnifiedMemory] HMLR not available, falling back to semantic query",
      );
      return this.query({ query, type: "semantic" });
    }

    return this.hmlrAdapter.query(query, {
      maxHops: maxHops ?? this.config.maxHops,
      limit: this.config.maxResults,
    });
  }

  /**
   * Get memory stats
   */
  async getStats(): Promise<MemoryStats> {
    const stats: MemoryStats = {
      sources: {
        graphiti: { available: false, count: 0 },
        learning: { available: false, count: 0 },
        sqlite: { available: false, count: 0 },
        context: { available: false, count: 0 },
        markdown: { available: false, count: 0 },
        session: { available: false, count: 0 },
        "claude-mem": { available: false, count: 0 },
        hmlr: { available: false, count: 0 },
      },
      totalMemories: 0,
      backends: {
        neo4j: false,
        sqlite: false,
        claudeMem: false,
        hmlr: false,
      },
    };

    const availableSources = this.bus.getAvailableSources();

    for (const source of availableSources) {
      const adapter = this.bus.getAdapter(source);
      if (adapter?.getStats) {
        const adapterStats = await adapter.getStats();
        stats.sources[source] = {
          available: true,
          count: adapterStats.count,
          lastSync: adapterStats.lastSync,
        };
        stats.totalMemories += adapterStats.count;
      } else {
        stats.sources[source] = { available: true, count: 0 };
      }
    }

    // Update backend flags
    stats.backends.neo4j = this.graphitiAdapter?.isAvailable() ?? false;
    stats.backends.hmlr = this.hmlrAdapter?.isAvailable() ?? false;

    // Add SessionStore stats
    if (this.sessionStore) {
      const sessionStats = this.sessionStore.getStats();
      stats.sources.session = {
        available: sessionStats.available,
        count: sessionStats.currentFacts + sessionStats.totalSessions,
      };
      stats.totalMemories += sessionStats.currentFacts;
    }

    return stats;
  }

  /**
   * Format status for display
   */
  async formatStatus(): Promise<string> {
    const stats = await this.getStats();
    const sources = this.bus.getAvailableSources();

    let output = `
┌─ UNIFIED MEMORY STATUS ─────────────────────────────────────────┐
│  SOURCES: ${sources.length} available                                        │
`;

    for (const [source, info] of Object.entries(stats.sources)) {
      if (info.available) {
        output += `│  • ${source.padEnd(12)}: ${String(info.count).padEnd(6)} memories                      │\n`;
      }
    }

    output += `│  ─────────────────────────────────────────────────────────────  │
│  TOTAL: ${String(stats.totalMemories).padEnd(6)} memories                                    │
│  HMLR: ${stats.backends.hmlr ? "● ENABLED" : "○ DISABLED"}                                          │
└──────────────────────────────────────────────────────────────────┘`;

    return output;
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * Shutdown
   */
  async shutdown(): Promise<void> {
    await this.bus.shutdown();
    this.initialized = false;
    this.queryCache.clear();
    console.log("[UnifiedMemory] Shutdown complete");
  }

  /**
   * Get the underlying bus
   */
  getBus(): UnifiedBus {
    return this.bus;
  }

  /**
   * Get Graphiti instance
   */
  getGraphiti(): GraphitiMemory | null {
    return this.graphitiAdapter?.getGraphiti() ?? null;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export async function createUnifiedMemory(
  config?: Partial<UnifiedMemoryConfig>,
): Promise<UnifiedMemory> {
  const memory = new UnifiedMemory(config);
  await memory.initialize();
  return memory;
}

// Global singleton
let globalMemory: UnifiedMemory | null = null;

export function getUnifiedMemory(): UnifiedMemory {
  if (!globalMemory) {
    globalMemory = new UnifiedMemory();
  }
  return globalMemory;
}

export async function initializeUnifiedMemory(
  config?: Partial<UnifiedMemoryConfig>,
): Promise<UnifiedMemory> {
  globalMemory = new UnifiedMemory(config);
  await globalMemory.initialize();
  return globalMemory;
}

export function resetUnifiedMemory(): void {
  if (globalMemory) {
    globalMemory.shutdown();
    globalMemory = null;
  }
}
