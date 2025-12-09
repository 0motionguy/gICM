/**
 * OPUS 67 Unified Memory Types
 * Shared interfaces for the unified memory system
 */

import type { MemoryNode, MemoryEdge, SearchResult } from "../types.js";

// =============================================================================
// MEMORY SOURCES
// =============================================================================

export type MemorySource =
  | "graphiti" // Neo4j/local temporal graph
  | "learning" // Pattern learnings from LearningStore
  | "sqlite" // Skill metadata catalog
  | "context" // Code/file context from indexer
  | "markdown" // Human-readable .claude/memory files
  | "session" // Hook logs (JSONL)
  | "claude-mem" // External session persistence plugin
  | "hmlr"; // Multi-hop reasoning layer

// =============================================================================
// QUERY TYPES
// =============================================================================

export type QueryType =
  | "semantic" // Embedding-based similarity search
  | "keyword" // Full-text search (FTS5)
  | "graph" // Relationship traversal
  | "temporal" // Time-range queries
  | "structured" // SQL/exact match
  | "multi-hop"; // Chain reasoning (HMLR)

export interface UnifiedQuery {
  query: string;
  type?: QueryType; // Auto-detected if not specified
  sources?: MemorySource[]; // All available sources if not specified
  limit?: number; // Default: 10
  minScore?: number; // Default: 0.3
  timeRange?: {
    start?: Date;
    end?: Date;
  };
  filters?: Record<string, unknown>;
  maxHops?: number; // For multi-hop queries
}

// =============================================================================
// RESULTS
// =============================================================================

export interface UnifiedResult {
  id: string;
  source: MemorySource;
  content: string;
  score: number;
  metadata: {
    type: string; // fact, episode, skill, file, win, decision, etc.
    key?: string;
    timestamp?: Date;
    path?: string; // For file-based sources
    hops?: number; // For multi-hop results (0 = direct match)
    reasoning?: string[]; // For HMLR results
    originalNode?: MemoryNode; // Reference to source node
    // Allow additional properties for source-specific metadata
    [key: string]: unknown;
  };
}

export interface UnifiedContext {
  results: UnifiedResult[];
  sources: Record<MemorySource, number>; // Count per source
  tokenEstimate: number;
  query: string;
  queryType: QueryType;
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

export type WriteType =
  | "fact"
  | "episode"
  | "learning"
  | "win"
  | "decision"
  | "goal"
  | "improvement";

export interface WritePayload {
  type: WriteType;
  content: string;
  key?: string;
  metadata?: Record<string, unknown>;
  destinations?: MemorySource[]; // Auto-routed if not specified
}

export interface WriteResult {
  success: boolean;
  destinations: MemorySource[];
  ids: Record<MemorySource, string>;
  errors?: Record<MemorySource, string>;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface UnifiedMemoryConfig {
  // Backend toggles
  enableNeo4j?: boolean; // Try Neo4j, fallback to local
  enableSQLite?: boolean; // Try SQLite, fallback to JSON
  enableClaudeMem?: boolean; // Integrate claude-mem if installed
  enableHMLR?: boolean; // Enable multi-hop reasoning

  // Paths
  projectRoot?: string;
  markdownMemoryPath?: string; // Default: .claude/memory
  sessionLogsPath?: string; // Default: .claude/logs

  // Limits
  maxContextTokens?: number; // Default: 4000
  maxResults?: number; // Default: 10
  maxHops?: number; // Default: 3 for multi-hop

  // Caching
  cacheEnabled?: boolean;
  cacheTTL?: number; // Milliseconds
}

export const DEFAULT_CONFIG: Required<UnifiedMemoryConfig> = {
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
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

// =============================================================================
// STATS & STATUS
// =============================================================================

export interface MemoryStats {
  sources: Record<
    MemorySource,
    {
      available: boolean;
      count: number;
      lastSync?: Date;
    }
  >;
  totalMemories: number;
  backends: {
    neo4j: boolean;
    sqlite: boolean;
    claudeMem: boolean;
    hmlr: boolean;
  };
}

export interface SourceStatus {
  source: MemorySource;
  available: boolean;
  lastError?: Error;
  lastSync?: Date;
}

// =============================================================================
// EVENTS
// =============================================================================

export interface UnifiedMemoryEvents {
  ready: () => void;
  "query:start": (query: UnifiedQuery) => void;
  "query:complete": (
    query: string,
    results: UnifiedResult[],
    latencyMs: number,
  ) => void;
  "write:complete": (payload: WritePayload, result: WriteResult) => void;
  "source:available": (source: MemorySource) => void;
  "source:unavailable": (source: MemorySource, error: Error) => void;
  "sync:start": (source: MemorySource) => void;
  "sync:complete": (source: MemorySource, count: number) => void;
  error: (error: Error) => void;
}

// =============================================================================
// MARKDOWN MEMORY TYPES
// =============================================================================

export interface MarkdownWin {
  title: string;
  type: string;
  value: number;
  description?: string;
  timestamp: Date;
}

export interface MarkdownDecision {
  title: string;
  description: string;
  rationale?: string;
  review?: string;
  timestamp: Date;
}

export interface MarkdownLearning {
  title: string;
  content: string;
  category?: string;
  timestamp: Date;
}

// =============================================================================
// SESSION LOG TYPES
// =============================================================================

export interface SessionLogEntry {
  event: string;
  type: string;
  category?: string;
  value?: number;
  title?: string;
  command?: string;
  timestamp: string;
}

// =============================================================================
// HMLR TYPES (TypeScript Port)
// =============================================================================

export interface HMLRFact {
  id: string;
  key: string;
  value: string;
  confidence: number;
  source: "extraction" | "inference" | "user";
  createdAt: Date;
  updatedAt: Date;
  validFrom?: Date;
  validTo?: Date;
  supersededBy?: string;
}

export interface HMLRMultiHopResult {
  results: UnifiedResult[];
  hopsUsed: number;
  reasoning: string[];
  factsChained: string[];
}

export interface HMLRGovernorDecision {
  action: "single_hop" | "multi_hop" | "temporal" | "graph";
  maxHops: number;
  confidence: number;
  reasoning: string;
}

// =============================================================================
// ADAPTERS
// =============================================================================

export interface MemoryAdapter {
  readonly source: MemorySource;

  initialize(): Promise<boolean>;
  isAvailable(): boolean;

  query(
    query: string,
    options?: Partial<UnifiedQuery>,
  ): Promise<UnifiedResult[]>;
  write?(payload: WritePayload): Promise<string | null>;

  getStats?(): Promise<{ count: number; lastSync?: Date }>;
  disconnect?(): Promise<void>;
}

// =============================================================================
// PRIORITY ROUTING
// =============================================================================

export const QUERY_PRIORITIES: Record<QueryType, MemorySource[]> = {
  semantic: ["graphiti", "learning", "claude-mem", "context"],
  keyword: ["sqlite", "context", "markdown", "session"],
  graph: ["graphiti", "hmlr", "learning"],
  temporal: ["graphiti", "session", "markdown"],
  structured: ["sqlite", "graphiti"],
  "multi-hop": ["hmlr", "graphiti", "learning"],
};

export const WRITE_ROUTES: Record<WriteType, MemorySource[]> = {
  fact: ["graphiti", "claude-mem"],
  episode: ["graphiti", "claude-mem"],
  learning: ["learning", "graphiti"],
  win: ["markdown", "session", "graphiti"],
  decision: ["markdown", "graphiti"],
  goal: ["graphiti", "learning"],
  improvement: ["graphiti", "learning"],
};
