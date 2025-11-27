/**
 * TypeScript types for gICM CLI
 */

export type ItemKind = "agent" | "skill" | "command" | "mcp" | "setting" | "bundle";

export interface RegistryItem {
  id: string;
  kind: ItemKind;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  dependencies?: string[];
  files?: string[];
  install: string;
  envKeys?: string[];
  installs?: number;
  remixes?: number;
  tokenSavings?: number;
  layer?: ".agent" | ".claude" | "docs";
  modelRecommendation?: "sonnet" | "opus" | "haiku";
}

export interface FileContent {
  path: string;      // Relative path after .claude/
  content: string;   // File contents
}

export interface BundleStats {
  selectedCount: number;
  totalCount: number;
  dependencyCount: number;
  tokenSavings: number;
  byKind: {
    agent: number;
    skill: number;
    command: number;
    mcp: number;
    setting?: number;
  };
}

export interface BundleResponse {
  command: string;
  items: RegistryItem[];
  stats: BundleStats;
}

export interface ParsedItem {
  kind: ItemKind;
  slug: string;
  original: string;
}

export type Platform = "claude" | "gemini" | "openai";

export interface CLIOptions {
  apiUrl?: string;
  verbose?: boolean;
  skipConfirm?: boolean;
  platform?: Platform;
}
