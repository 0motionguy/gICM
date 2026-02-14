import { z } from "zod";

export const ModeSchema = z.enum([
  "BUILD",
  "THINK",
  "VIBE",
  "TRADE",
  "CREATE",
  "AUDIT",
]);
export type Mode = z.infer<typeof ModeSchema>;

export interface ModeFragment {
  mode: Mode;
  identity: string; // Core identity text for this mode
  tools: string[]; // Preferred tools
  style: string; // Response style guidance
  tokenCost: number; // Estimated tokens this fragment adds
}

export interface SoulConfig {
  defaultMode: Mode;
  autoSwitch: boolean;
  fragmentsDir?: string;
  userPrefsPath?: string;
}

export interface ClassifyResult {
  mode: Mode;
  confidence: number;
  reasons: string[];
  tokensSaved: number; // vs loading full SOUL.md
}

export interface SoulOutput {
  mode: Mode;
  systemPrompt: string;
  tokenCount: number;
  fullTokenCount: number;
  savedPercent: number;
}
