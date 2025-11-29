import { z } from "zod";

// Decision scores
export const DecisionScoresSchema = z.object({
  relevance: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  effort: z.number().min(0).max(100), // Higher = easier
  timing: z.number().min(0).max(100),
  quality: z.number().min(0).max(100),
});
export type DecisionScores = z.infer<typeof DecisionScoresSchema>;

// Decision recommendation
export const RecommendationSchema = z.enum([
  "build",      // Create new component/agent based on this
  "integrate",  // Integrate this tool/library directly
  "monitor",    // Keep watching, not ready yet
  "ignore",     // Not relevant or too risky
]);
export type Recommendation = z.infer<typeof RecommendationSchema>;

// Decision result
export const DecisionResultSchema = z.object({
  scores: DecisionScoresSchema,
  totalScore: z.number().min(0).max(100),
  recommendation: RecommendationSchema,
  reasoning: z.string(),
  summary: z.string(),
  suggestedAction: z.string(),
  tags: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskFactors: z.array(z.string()),
  estimatedEffort: z.string(),
  confidence: z.number().min(0).max(1),
});
export type DecisionResult = z.infer<typeof DecisionResultSchema>;

// Thresholds for autonomy levels
export interface DecisionThresholds {
  autoApprove: number;   // Score >= this: auto-approve
  humanReview: number;   // Score >= this: queue for review
  // Below humanReview: auto-reject
}

export const DEFAULT_THRESHOLDS: DecisionThresholds = {
  autoApprove: 85,
  humanReview: 50,
};

// Decision status
export type DecisionStatus = "auto_approve" | "human_review" | "reject";

// LLM response schema
export const LLMDecisionResponseSchema = z.object({
  scores: z.object({
    relevance: z.object({
      score: z.number(),
      reasoning: z.string(),
    }),
    impact: z.object({
      score: z.number(),
      reasoning: z.string(),
    }),
    effort: z.object({
      score: z.number(),
      reasoning: z.string(),
    }),
    timing: z.object({
      score: z.number(),
      reasoning: z.string(),
    }),
    quality: z.object({
      score: z.number(),
      reasoning: z.string(),
    }),
  }),
  totalScore: z.number(),
  recommendation: RecommendationSchema,
  reasoning: z.string(),
  summary: z.string(),
  suggestedAction: z.string(),
  tags: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskFactors: z.array(z.string()),
  estimatedEffort: z.string(),
  confidence: z.number(),
});
export type LLMDecisionResponse = z.infer<typeof LLMDecisionResponseSchema>;

// Scoring weights
export const SCORING_WEIGHTS = {
  relevance: 0.30,
  impact: 0.25,
  effort: 0.20,
  timing: 0.15,
  quality: 0.10,
} as const;
