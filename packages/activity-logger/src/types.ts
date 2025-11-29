import { z } from "zod";

// Activity types
export const ActivityTypeSchema = z.enum([
  "discovery",
  "decision",
  "build",
  "deployment",
  "approval",
  "error",
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const ActivityStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  type: ActivityTypeSchema,
  status: ActivityStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  completedAt: z.date().optional(),
  inputData: z.unknown().optional(),
  outputData: z.unknown().optional(),
  reasoning: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  parentId: z.string().optional(),
  workflowId: z.string().optional(),
  agentId: z.string().optional(),
  solanaTxHash: z.string().optional(),
  arweaveTxId: z.string().optional(),
  contentHash: z.string().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

// Discovery types
export const DiscoverySourceSchema = z.enum([
  "github",
  "hackernews",
  "twitter",
]);
export type DiscoverySource = z.infer<typeof DiscoverySourceSchema>;

export const DiscoverySchema = z.object({
  id: z.string(),
  activityId: z.string(),
  source: DiscoverySourceSchema,
  sourceId: z.string().optional(),
  sourceUrl: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
  trendScore: z.number().optional(),
  qualityScore: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  language: z.string().optional(),
  // GitHub specific
  stars: z.number().optional(),
  forks: z.number().optional(),
  openIssues: z.number().optional(),
  lastCommit: z.date().optional(),
  license: z.string().optional(),
  // HackerNews specific
  hnPoints: z.number().optional(),
  hnComments: z.number().optional(),
  // Twitter specific
  likes: z.number().optional(),
  reposts: z.number().optional(),
  analyzed: z.boolean().default(false),
  decisionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});
export type Discovery = z.infer<typeof DiscoverySchema>;

// Decision types
export const DecisionStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "expired",
]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const RecommendationSchema = z.enum([
  "build",
  "integrate",
  "monitor",
  "ignore",
]);
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const DecisionScoresSchema = z.object({
  relevance: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  effort: z.number().min(0).max(100),
  timing: z.number().min(0).max(100),
  quality: z.number().min(0).max(100),
});
export type DecisionScores = z.infer<typeof DecisionScoresSchema>;

export const DecisionSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  discoveryId: z.string().optional(),
  scores: DecisionScoresSchema,
  totalScore: z.number().min(0).max(100),
  reasoning: z.string(),
  summary: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  riskFactors: z.array(z.string()).default([]),
  recommendation: RecommendationSchema,
  recommendedPriority: z.number().optional(),
  estimatedEffort: z.string().optional(),
  requiresApproval: z.boolean().default(true),
  approvalStatus: DecisionStatusSchema.default("pending"),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  approvalReason: z.string().optional(),
  createdAt: z.date(),
});
export type Decision = z.infer<typeof DecisionSchema>;

// Sync queue types
export const SyncTargetSchema = z.enum(["solana", "arweave"]);
export type SyncTarget = z.infer<typeof SyncTargetSchema>;

export const SyncStatusSchema = z.enum([
  "queued",
  "processing",
  "completed",
  "failed",
]);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const SyncQueueItemSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  target: SyncTargetSchema,
  priority: z.number().default(0),
  content: z.string(),
  contentHash: z.string(),
  status: SyncStatusSchema.default("queued"),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
  scheduledAt: z.date().optional(),
  processedAt: z.date().optional(),
});
export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;

// Solana memo format
export const SolanaMemoSchema = z.object({
  v: z.literal(1),
  t: z.literal("gicm:activity"),
  id: z.string(),
  type: ActivityTypeSchema,
  ts: z.number(),
  h: z.string(),
  ar: z.string().optional(),
});
export type SolanaMemo = z.infer<typeof SolanaMemoSchema>;

// Arweave activity record
export const ArweaveActivityRecordSchema = z.object({
  "@context": z.literal("https://gicm.dev/schemas/activity/v1"),
  "@type": z.literal("OrchestratorActivity"),
  id: z.string(),
  version: z.literal(1),
  orchestrator: z.object({
    id: z.string(),
    version: z.string(),
    owner: z.string(),
  }),
  activity: z.object({
    type: ActivityTypeSchema,
    status: ActivityStatusSchema,
    priority: z.number(),
    createdAt: z.string(),
    completedAt: z.string().optional(),
    input: z.unknown().optional(),
    output: z.unknown().optional(),
    reasoning: z.string().optional(),
    confidence: z.number().optional(),
  }),
  relationships: z.object({
    parentId: z.string().optional(),
    workflowId: z.string().optional(),
    agentId: z.string().optional(),
    discoveryId: z.string().optional(),
    decisionId: z.string().optional(),
  }),
  onChain: z.object({
    solanaTx: z.string().optional(),
    solanaSlot: z.number().optional(),
    contentHash: z.string(),
  }),
  discovery: DiscoverySchema.optional(),
  decision: DecisionSchema.optional(),
  signature: z.object({
    algorithm: z.literal("ed25519"),
    publicKey: z.string(),
    value: z.string(),
  }),
});
export type ArweaveActivityRecord = z.infer<typeof ArweaveActivityRecordSchema>;

// Configuration
export interface ActivityLoggerConfig {
  dbPath?: string;
  solana?: {
    rpcUrl: string;
    privateKey: string;
    commitment?: "processed" | "confirmed" | "finalized";
  };
  arweave?: {
    gatewayUrl?: string;
    minPayloadSize?: number;
  };
  batchSize?: number;
  flushInterval?: number;
  immediateTypes?: ActivityType[];
}

// Input types for creating records
export type CreateActivityInput = Omit<
  Activity,
  "id" | "createdAt" | "contentHash"
>;
export type CreateDiscoveryInput = Omit<
  Discovery,
  "id" | "activityId" | "createdAt"
>;
export type CreateDecisionInput = Omit<
  Decision,
  "id" | "activityId" | "createdAt"
>;
