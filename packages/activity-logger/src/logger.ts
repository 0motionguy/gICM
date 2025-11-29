import { SQLiteDB } from "./db/sqlite.js";
import { SolanaMemoLogger } from "./solana/memo-logger.js";
import { ArweaveUploader } from "./arweave/irys-uploader.js";
import type {
  Activity,
  ActivityLoggerConfig,
  ActivityType,
  CreateActivityInput,
  CreateDecisionInput,
  CreateDiscoveryInput,
  Decision,
  Discovery,
} from "./types.js";

const DEFAULT_IMMEDIATE_TYPES: ActivityType[] = [
  "decision",
  "deployment",
  "approval",
];

export class ActivityLogger {
  private db: SQLiteDB;
  private solana: SolanaMemoLogger | null = null;
  private arweave: ArweaveUploader | null = null;
  private config: ActivityLoggerConfig;
  private immediateTypes: ActivityType[];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: ActivityLoggerConfig = {}) {
    this.config = config;
    this.db = new SQLiteDB(config.dbPath);
    this.immediateTypes = config.immediateTypes ?? DEFAULT_IMMEDIATE_TYPES;

    if (config.solana) {
      this.solana = new SolanaMemoLogger({
        rpcUrl: config.solana.rpcUrl,
        privateKey: config.solana.privateKey,
        commitment: config.solana.commitment,
      });
    }

    if (config.arweave || config.solana) {
      // Arweave uses the same Solana credentials
      this.arweave = new ArweaveUploader({
        solanaRpcUrl: config.solana?.rpcUrl ?? "https://api.mainnet-beta.solana.com",
        solanaPrivateKey: config.solana?.privateKey ?? "",
        gatewayUrl: config.arweave?.gatewayUrl,
        minPayloadSize: config.arweave?.minPayloadSize,
      });
    }

    // Start background sync if on-chain is enabled
    if (this.solana || this.arweave) {
      this.startBackgroundSync();
    }
  }

  // Activity logging
  async logActivity(
    input: CreateActivityInput,
    options?: {
      discovery?: CreateDiscoveryInput;
      decision?: CreateDecisionInput;
      immediate?: boolean;
    }
  ): Promise<{
    activity: Activity;
    discovery?: Discovery;
    decision?: Decision;
  }> {
    // Create activity in database
    const activity = this.db.createActivity(input);

    // Create related records if provided
    let discovery: Discovery | undefined;
    let decision: Decision | undefined;

    if (options?.discovery) {
      discovery = this.db.createDiscovery(activity.id, options.discovery);
    }

    if (options?.decision) {
      decision = this.db.createDecision(activity.id, options.decision);
      if (discovery) {
        this.db.markDiscoveryAnalyzed(discovery.id, decision.id);
      }
    }

    // Determine if we should sync immediately
    const shouldSyncImmediately =
      options?.immediate ?? this.immediateTypes.includes(input.type);

    if (shouldSyncImmediately && (this.solana || this.arweave)) {
      await this.syncActivity(activity, discovery, decision);
    } else if (this.solana || this.arweave) {
      // Queue for batch sync
      this.queueForSync(activity);
    }

    return { activity, discovery, decision };
  }

  // Sync a single activity to on-chain
  private async syncActivity(
    activity: Activity,
    discovery?: Discovery,
    decision?: Decision
  ): Promise<void> {
    let solanaTxHash: string | undefined;
    let arweaveTxId: string | undefined;

    try {
      // Upload to Arweave first (if enabled)
      if (this.arweave) {
        const arweaveResult = await this.arweave.uploadActivity(activity, {
          discovery,
          decision,
        });
        arweaveTxId = arweaveResult.txId;
      }

      // Log to Solana (if enabled)
      if (this.solana) {
        const solanaResult = await this.solana.logActivity(
          activity,
          arweaveTxId
        );
        solanaTxHash = solanaResult.signature;
      }

      // Update activity with on-chain references
      this.db.updateActivity(activity.id, {
        solanaTxHash,
        arweaveTxId,
      });
    } catch (error) {
      console.error(`[ActivityLogger] Failed to sync activity ${activity.id}:`, error);
      // Queue for retry
      this.queueForSync(activity);
    }
  }

  private queueForSync(activity: Activity): void {
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

  private getPriority(type: ActivityType): number {
    const priorities: Record<ActivityType, number> = {
      decision: 3,
      deployment: 3,
      approval: 3,
      build: 2,
      discovery: 1,
      error: 2,
    };
    return priorities[type] ?? 1;
  }

  private startBackgroundSync(): void {
    const interval = this.config.flushInterval ?? 60000; // 1 minute default

    this.flushInterval = setInterval(async () => {
      await this.processSyncQueue();
    }, interval);
  }

  private async processSyncQueue(): Promise<void> {
    const batchSize = this.config.batchSize ?? 10;

    // Process Solana queue
    if (this.solana) {
      const solanaItems = this.db.getNextSyncItems("solana", batchSize);
      for (const item of solanaItems) {
        try {
          this.db.updateSyncItemStatus(item.id, "processing");
          const activity = this.db.getActivity(item.activityId);
          if (activity) {
            const result = await this.solana.logActivity(activity);
            this.db.updateActivity(activity.id, {
              solanaTxHash: result.signature,
            });
            this.db.updateSyncItemStatus(item.id, "completed");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          this.db.updateSyncItemStatus(item.id, "failed", message);
        }
      }
    }

    // Process Arweave queue
    if (this.arweave) {
      const arweaveItems = this.db.getNextSyncItems("arweave", batchSize);
      if (arweaveItems.length > 0) {
        try {
          // Batch upload for efficiency
          const activities = arweaveItems
            .map((item) => {
              const activity = this.db.getActivity(item.activityId);
              return activity ? { activity } : null;
            })
            .filter((a): a is { activity: Activity } => a !== null);

          if (activities.length > 0) {
            const result = await this.arweave.uploadBatch(activities);

            // Mark all items as completed
            for (const item of arweaveItems) {
              this.db.updateSyncItemStatus(item.id, "completed");
              this.db.updateActivity(item.activityId, {
                arweaveTxId: result.txId,
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
  createDiscovery(activityId: string, input: CreateDiscoveryInput): Discovery {
    return this.db.createDiscovery(activityId, input);
  }

  getDiscovery(id: string): Discovery | null {
    return this.db.getDiscovery(id);
  }

  listDiscoveries(options?: Parameters<typeof this.db.listDiscoveries>[0]): Discovery[] {
    return this.db.listDiscoveries(options ?? {});
  }

  // Decision methods
  createDecision(activityId: string, input: CreateDecisionInput): Decision {
    return this.db.createDecision(activityId, input);
  }

  getDecision(id: string): Decision | null {
    return this.db.getDecision(id);
  }

  listPendingDecisions(): Decision[] {
    return this.db.listPendingDecisions();
  }

  async approveDecision(id: string, approvedBy: string, reason?: string): Promise<void> {
    this.db.approveDecision(id, approvedBy, reason);

    // Log approval activity
    const decision = this.db.getDecision(id);
    if (decision) {
      await this.logActivity({
        type: "approval",
        status: "completed",
        inputData: { decisionId: id, approvedBy, reason },
        outputData: { approved: true },
        reasoning: reason,
        agentId: approvedBy,
      });
    }
  }

  async rejectDecision(id: string, rejectedBy: string, reason: string): Promise<void> {
    this.db.rejectDecision(id, rejectedBy, reason);

    // Log rejection activity
    await this.logActivity({
      type: "approval",
      status: "completed",
      inputData: { decisionId: id, rejectedBy, reason },
      outputData: { approved: false },
      reasoning: reason,
      agentId: rejectedBy,
    });
  }

  // Activity methods
  getActivity(id: string): Activity | null {
    return this.db.getActivity(id);
  }

  listActivities(options?: Parameters<typeof this.db.listActivities>[0]): Activity[] {
    return this.db.listActivities(options ?? {});
  }

  // Stats
  getStats(): ReturnType<typeof this.db.getStats> {
    return this.db.getStats();
  }

  // Cleanup
  close(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.db.close();
  }

  // Force sync pending items
  async flush(): Promise<void> {
    await this.processSyncQueue();
  }
}
