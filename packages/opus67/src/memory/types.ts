/**
 * OPUS 67 - Memory Types
 * Type definitions for Graphiti memory system
 */

export interface MemoryNode {
  id: string;
  key: string;
  value: string;
  namespace: string;
  type: 'episode' | 'fact' | 'improvement' | 'goal' | 'context';
  embedding?: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface MemoryEdge {
  id: string;
  fromId: string;
  toId: string;
  type: 'relates_to' | 'caused_by' | 'improves' | 'references' | 'follows';
  weight: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface Episode {
  name?: string;
  content: string;
  type?: 'success' | 'failure' | 'learning' | 'decision';
  source?: string;
  actors?: string[];
  context?: Record<string, unknown>;
  timestamp?: Date;
}

export interface Improvement {
  component: string;
  changeType: 'fix' | 'enhancement' | 'refactor' | 'optimization';
  before: string;
  after: string;
  impact: number;
  automated: boolean;
}

export interface Goal {
  description: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  milestones?: string[];
}

export interface SearchResult {
  node: MemoryNode;
  score: number;
  matchType: 'semantic' | 'keyword' | 'exact';
}

export interface GraphitiConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
  namespace?: string;
  embeddingModel?: string;
  maxResults?: number;
  fallbackToLocal?: boolean;
}

export interface GraphitiEvents {
  'connected': () => void;
  'disconnected': () => void;
  'error': (error: Error) => void;
  'memory:added': (node: MemoryNode) => void;
  'memory:updated': (node: MemoryNode) => void;
  'memory:deleted': (id: string) => void;
  'search:complete': (query: string, results: SearchResult[]) => void;
}

export interface MemoryStats {
  totalNodes: number;
  totalMemories: number;
  facts: number;
  episodes: number;
  goals: number;
  improvements: number;
  byType: Record<string, number>;
  oldestMemory: Date | null;
  newestMemory: Date | null;
}
