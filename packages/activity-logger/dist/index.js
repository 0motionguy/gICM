import {
  ArweaveUploader,
  verifyArweaveRecord
} from "./chunk-6OBPNQQO.js";
import {
  SQLiteDB
} from "./chunk-3KR3GUZ4.js";
import {
  SolanaMemoLogger,
  createMemoPayload
} from "./chunk-DVSJMKOX.js";

// src/logger.ts
var DEFAULT_IMMEDIATE_TYPES = [
  "decision",
  "deployment",
  "approval"
];
var ActivityLogger = class {
  db;
  solana = null;
  arweave = null;
  config;
  immediateTypes;
  flushInterval = null;
  constructor(config = {}) {
    this.config = config;
    this.db = new SQLiteDB(config.dbPath);
    this.immediateTypes = config.immediateTypes ?? DEFAULT_IMMEDIATE_TYPES;
    if (config.solana) {
      this.solana = new SolanaMemoLogger({
        rpcUrl: config.solana.rpcUrl,
        privateKey: config.solana.privateKey,
        commitment: config.solana.commitment
      });
    }
    if (config.arweave || config.solana) {
      this.arweave = new ArweaveUploader({
        solanaRpcUrl: config.solana?.rpcUrl ?? "https://api.mainnet-beta.solana.com",
        solanaPrivateKey: config.solana?.privateKey ?? "",
        gatewayUrl: config.arweave?.gatewayUrl,
        minPayloadSize: config.arweave?.minPayloadSize
      });
    }
    if (this.solana || this.arweave) {
      this.startBackgroundSync();
    }
  }
  // Activity logging
  async logActivity(input, options) {
    const activity = this.db.createActivity(input);
    let discovery;
    let decision;
    if (options?.discovery) {
      discovery = this.db.createDiscovery(activity.id, options.discovery);
    }
    if (options?.decision) {
      decision = this.db.createDecision(activity.id, options.decision);
      if (discovery) {
        this.db.markDiscoveryAnalyzed(discovery.id, decision.id);
      }
    }
    const shouldSyncImmediately = options?.immediate ?? this.immediateTypes.includes(input.type);
    if (shouldSyncImmediately && (this.solana || this.arweave)) {
      await this.syncActivity(activity, discovery, decision);
    } else if (this.solana || this.arweave) {
      this.queueForSync(activity);
    }
    return { activity, discovery, decision };
  }
  // Sync a single activity to on-chain
  async syncActivity(activity, discovery, decision) {
    let solanaTxHash;
    let arweaveTxId;
    try {
      if (this.arweave) {
        const arweaveResult = await this.arweave.uploadActivity(activity, {
          discovery,
          decision
        });
        arweaveTxId = arweaveResult.txId;
      }
      if (this.solana) {
        const solanaResult = await this.solana.logActivity(
          activity,
          arweaveTxId
        );
        solanaTxHash = solanaResult.signature;
      }
      this.db.updateActivity(activity.id, {
        solanaTxHash,
        arweaveTxId
      });
    } catch (error) {
      console.error(`[ActivityLogger] Failed to sync activity ${activity.id}:`, error);
      this.queueForSync(activity);
    }
  }
  queueForSync(activity) {
    if (this.solana) {
      this.db.enqueueSyncItem(
        activity.id,
        "solana",
        activity,
        this.getPriority(activity.type)
      );
    }
    if (this.arweave) {
      this.db.enqueueSyncItem(
        activity.id,
        "arweave",
        activity,
        this.getPriority(activity.type)
      );
    }
  }
  getPriority(type) {
    const priorities = {
      decision: 3,
      deployment: 3,
      approval: 3,
      build: 2,
      discovery: 1,
      error: 2
    };
    return priorities[type] ?? 1;
  }
  startBackgroundSync() {
    const interval = this.config.flushInterval ?? 6e4;
    this.flushInterval = setInterval(async () => {
      await this.processSyncQueue();
    }, interval);
  }
  async processSyncQueue() {
    const batchSize = this.config.batchSize ?? 10;
    if (this.solana) {
      const solanaItems = this.db.getNextSyncItems("solana", batchSize);
      for (const item of solanaItems) {
        try {
          this.db.updateSyncItemStatus(item.id, "processing");
          const activity = this.db.getActivity(item.activityId);
          if (activity) {
            const result = await this.solana.logActivity(activity);
            this.db.updateActivity(activity.id, {
              solanaTxHash: result.signature
            });
            this.db.updateSyncItemStatus(item.id, "completed");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          this.db.updateSyncItemStatus(item.id, "failed", message);
        }
      }
    }
    if (this.arweave) {
      const arweaveItems = this.db.getNextSyncItems("arweave", batchSize);
      if (arweaveItems.length > 0) {
        try {
          const activities = arweaveItems.map((item) => {
            const activity = this.db.getActivity(item.activityId);
            return activity ? { activity } : null;
          }).filter((a) => a !== null);
          if (activities.length > 0) {
            const result = await this.arweave.uploadBatch(activities);
            for (const item of arweaveItems) {
              this.db.updateSyncItemStatus(item.id, "completed");
              this.db.updateActivity(item.activityId, {
                arweaveTxId: result.txId
              });
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          for (const item of arweaveItems) {
            this.db.updateSyncItemStatus(item.id, "failed", message);
          }
        }
      }
    }
  }
  // Discovery methods
  createDiscovery(activityId, input) {
    return this.db.createDiscovery(activityId, input);
  }
  getDiscovery(id) {
    return this.db.getDiscovery(id);
  }
  listDiscoveries(options) {
    return this.db.listDiscoveries(options ?? {});
  }
  // Decision methods
  createDecision(activityId, input) {
    return this.db.createDecision(activityId, input);
  }
  getDecision(id) {
    return this.db.getDecision(id);
  }
  listPendingDecisions() {
    return this.db.listPendingDecisions();
  }
  async approveDecision(id, approvedBy, reason) {
    this.db.approveDecision(id, approvedBy, reason);
    const decision = this.db.getDecision(id);
    if (decision) {
      await this.logActivity({
        type: "approval",
        status: "completed",
        inputData: { decisionId: id, approvedBy, reason },
        outputData: { approved: true },
        reasoning: reason,
        agentId: approvedBy
      });
    }
  }
  async rejectDecision(id, rejectedBy, reason) {
    this.db.rejectDecision(id, rejectedBy, reason);
    await this.logActivity({
      type: "approval",
      status: "completed",
      inputData: { decisionId: id, rejectedBy, reason },
      outputData: { approved: false },
      reasoning: reason,
      agentId: rejectedBy
    });
  }
  // Activity methods
  getActivity(id) {
    return this.db.getActivity(id);
  }
  listActivities(options) {
    return this.db.listActivities(options ?? {});
  }
  // Stats
  getStats() {
    return this.db.getStats();
  }
  // Cleanup
  close() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.db.close();
  }
  // Force sync pending items
  async flush() {
    await this.processSyncQueue();
  }
};

// src/types.ts
import { z } from "zod";
var ActivityTypeSchema = z.enum([
  "discovery",
  "decision",
  "build",
  "deployment",
  "approval",
  "error"
]);
var ActivityStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled"
]);
var ActivitySchema = z.object({
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
  contentHash: z.string().optional()
});
var DiscoverySourceSchema = z.enum([
  "github",
  "hackernews",
  "twitter"
]);
var DiscoverySchema = z.object({
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
  updatedAt: z.date().optional()
});
var DecisionStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "expired"
]);
var RecommendationSchema = z.enum([
  "build",
  "integrate",
  "monitor",
  "ignore"
]);
var DecisionScoresSchema = z.object({
  relevance: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  effort: z.number().min(0).max(100),
  timing: z.number().min(0).max(100),
  quality: z.number().min(0).max(100)
});
var DecisionSchema = z.object({
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
  createdAt: z.date()
});
var SyncTargetSchema = z.enum(["solana", "arweave"]);
var SyncStatusSchema = z.enum([
  "queued",
  "processing",
  "completed",
  "failed"
]);
var SyncQueueItemSchema = z.object({
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
  processedAt: z.date().optional()
});
var SolanaMemoSchema = z.object({
  v: z.literal(1),
  t: z.literal("gicm:activity"),
  id: z.string(),
  type: ActivityTypeSchema,
  ts: z.number(),
  h: z.string(),
  ar: z.string().optional()
});
var ArweaveActivityRecordSchema = z.object({
  "@context": z.literal("https://gicm.dev/schemas/activity/v1"),
  "@type": z.literal("OrchestratorActivity"),
  id: z.string(),
  version: z.literal(1),
  orchestrator: z.object({
    id: z.string(),
    version: z.string(),
    owner: z.string()
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
    confidence: z.number().optional()
  }),
  relationships: z.object({
    parentId: z.string().optional(),
    workflowId: z.string().optional(),
    agentId: z.string().optional(),
    discoveryId: z.string().optional(),
    decisionId: z.string().optional()
  }),
  onChain: z.object({
    solanaTx: z.string().optional(),
    solanaSlot: z.number().optional(),
    contentHash: z.string()
  }),
  discovery: DiscoverySchema.optional(),
  decision: DecisionSchema.optional(),
  signature: z.object({
    algorithm: z.literal("ed25519"),
    publicKey: z.string(),
    value: z.string()
  })
});
export {
  ActivityLogger,
  ActivitySchema,
  ActivityStatusSchema,
  ActivityTypeSchema,
  ArweaveActivityRecordSchema,
  ArweaveUploader,
  DecisionSchema,
  DecisionScoresSchema,
  DecisionStatusSchema,
  DiscoverySchema,
  DiscoverySourceSchema,
  RecommendationSchema,
  SQLiteDB,
  SolanaMemoLogger,
  SolanaMemoSchema,
  SyncQueueItemSchema,
  SyncStatusSchema,
  SyncTargetSchema,
  createMemoPayload,
  verifyArweaveRecord
};
//# sourceMappingURL=index.js.map