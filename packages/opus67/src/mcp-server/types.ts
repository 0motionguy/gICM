/**
 * OPUS 67 MCP Server Types
 */

export interface Skill {
  id: string;
  name: string;
  tier?: number;
  token_cost?: number;
  capabilities?: string[];
  auto_load_when?: {
    keywords?: string[];
    file_types?: string[];
    directories?: string[];
  };
  mcp_connections?: string[];
  // Legacy fields for backward compatibility
  category?: string;
  tokens?: number;
  priority?: number;
  triggers?: {
    extensions?: string[];
    keywords?: string[];
  };
  prompt?: string;
}

export interface MCPConnection {
  id: string;
  name: string;
  category: string;
  transport: string;
  base_url?: string;
  tools?: { name: string; description: string }[];
}

export interface Mode {
  id: string;
  name: string;
  icon: string;
  description: string;
  token_budget: number;
  thinking_depth: string;
}

export interface ToolArgs {
  skill_id?: string;
  mode_id?: string;
  category?: string;
  query?: string;
  extensions?: string[];
  task?: string;
  files?: string[];
}
