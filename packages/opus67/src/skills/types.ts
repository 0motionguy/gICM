/**
 * OPUS 67 Skill Loader Types
 * Type definitions for skill loading system
 */

export interface Fragment {
  id: string;
  type: 'fragment';
  version: string;
  semantic?: {
    purpose: string;
  };
  capabilities: string[];
  anti_hallucination: Array<{
    trigger: string;
    response: string;
  }>;
  common_patterns?: Record<string, string>;
}

export interface Skill {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  token_cost: number;
  capabilities: string[];
  extends?: string[];
  auto_load_when: {
    keywords?: string[];
    file_types?: string[];
    directories?: string[];
    task_patterns?: string[];
  };
  mcp_connections: string[];
  anti_hallucination?: Array<{
    trigger: string;
    response: string;
  }>;
  semantic?: {
    purpose: string;
    what_it_does?: string[];
    what_it_cannot?: string[];
  };
}

export interface ResolvedSkill extends Skill {
  inherited_capabilities: string[];
  inherited_anti_hallucination: Array<{
    trigger: string;
    response: string;
  }>;
}

export interface SkillRegistry {
  meta: {
    version: string;
    total_skills: number;
    max_skills_per_session: number;
    token_budget: number;
  };
  skills: Skill[];
  combinations: Record<string, {
    skills: string[];
    token_cost: number;
  }>;
}

export interface LoadContext {
  query: string;
  activeFiles?: string[];
  currentDirectory?: string;
  taskType?: 'code' | 'architecture' | 'data' | 'content' | 'ops';
}

export interface LoadResult {
  skills: Skill[];
  totalTokenCost: number;
  mcpConnections: string[];
  reason: string[];
}

export interface MatchResult {
  matches: boolean;
  reason: string;
}
