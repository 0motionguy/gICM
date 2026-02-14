import { z } from "zod";

export const ContextConfigSchema = z.object({
  maxTokens: z.number().min(100).max(200_000).default(8000),
  maxSkills: z.number().min(1).max(50).default(5),
  boostFactors: z
    .object({
      nameMatch: z.number().default(10),
      tagMatch: z.number().default(5),
      descriptionMatch: z.number().default(3),
      contentMatch: z.number().default(1),
    })
    .default({}),
  excludePatterns: z.array(z.string()).default([]),
});

export type ContextConfig = z.infer<typeof ContextConfigSchema>;

export interface SkillEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  content: string; // Full SKILL.md content
  tokens: number; // Estimated token count
  path: string; // File path or identifier
  version?: string;
  author?: string;
}

export interface ScoredSkill {
  skill: SkillEntry;
  score: number;
  matchReasons: string[]; // e.g., ["name:react", "tag:frontend"]
}

export interface InjectionResult {
  skills: ScoredSkill[];
  totalTokens: number;
  budgetUsed: number; // 0-1 (fraction of maxTokens used)
  prompt: string; // Formatted context string ready for injection
}

export interface ContextStats {
  totalSkills: number;
  totalTokens: number;
  lastIndexed: Date | null;
  avgTokensPerSkill: number;
  topSkills: Array<{ id: string; hitCount: number }>;
}

export interface ContextEvents {
  "context:indexed": (count: number) => void;
  "context:injected": (skills: string[], tokens: number) => void;
  "context:budget-exceeded": (requested: number, budget: number) => void;
}
