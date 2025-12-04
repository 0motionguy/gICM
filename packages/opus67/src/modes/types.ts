/**
 * OPUS 67 Mode Types
 * Type definitions for mode selector
 */

export type ModeName =
  // Core modes (v1.0)
  | 'ultra' | 'think' | 'build' | 'vibe' | 'light'
  | 'creative' | 'data' | 'audit' | 'swarm' | 'auto'
  // v2.1 modes
  | 'background' | 'review'
  // v3.1 modes (THE EYES UPDATE)
  | 'grab' | 'clone' | 'research' | 'context'
  // v3.2 modes (THE SOLANA STACK)
  | 'solana' | 'infra' | 'memory' | 'debug'
  // v4.1 modes (LEARNING LAYER)
  | 'deep-research' | 'web-search' | 'design' | 'content'
  | 'business' | 'strategy' | 'marketing' | 'security' | 'teach' | 'ship';

export interface Mode {
  name: string;
  icon: string;
  color: string;
  description: string;
  token_budget: number | 'dynamic';
  thinking_depth: string;
  characteristics: string[];
  auto_trigger_when: {
    keywords?: string[];
    task_patterns?: string[];
    file_types?: string[];
    message_length?: string;
    file_count?: string;
    complexity_score?: string;
  };
  skills_priority: string[];
  mcp_priority?: string[];
  sub_agents: {
    enabled: boolean;
    max_agents: number;
    types?: string[];
    orchestration?: string;
  };
  model_routing: {
    primary?: string;
    fallback?: string;
    orchestrator?: string;
    workers?: string;
    simple_tasks?: string;
    analysis?: string;
    execution?: string;
    use_extended_thinking?: boolean;
  };
}

export interface ModeRegistry {
  meta: {
    version: string;
    total_modes: number;
    default_mode: string;
  };
  modes: Record<string, Mode>;
  complexity_scoring: {
    factors: Record<string, any>;
  };
  sub_agents: Record<string, any>;
}

export interface DetectionResult {
  mode: ModeName;
  confidence: number;
  reasons: string[];
  complexity_score: number;
  suggested_skills: string[];
  suggested_mcps: string[];
  sub_agents_recommended: string[];
}

export interface ModeContext {
  query: string;
  activeFiles?: string[];
  fileCount?: number;
  conversationLength?: number;
  previousMode?: ModeName;
  userPreference?: ModeName;
}

export interface TriggerMatchResult {
  matches: boolean;
  confidence: number;
  reasons: string[];
}
