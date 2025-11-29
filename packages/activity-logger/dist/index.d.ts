import { A as ActivityLoggerConfig, C as CreateActivityInput, a as CreateDiscoveryInput, b as CreateDecisionInput, c as Activity, D as Discovery, d as Decision } from './types-Bpw3NPzK.js';
export { i as ActivitySchema, h as ActivityStatus, g as ActivityStatusSchema, f as ActivityType, e as ActivityTypeSchema, B as ArweaveActivityRecord, z as ArweaveActivityRecordSchema, r as DecisionSchema, q as DecisionScores, p as DecisionScoresSchema, n as DecisionStatus, m as DecisionStatusSchema, l as DiscoverySchema, k as DiscoverySource, j as DiscoverySourceSchema, o as Recommendation, R as RecommendationSchema, y as SolanaMemo, x as SolanaMemoSchema, w as SyncQueueItem, v as SyncQueueItemSchema, u as SyncStatus, t as SyncStatusSchema, s as SyncTarget, S as SyncTargetSchema } from './types-Bpw3NPzK.js';
export { SQLiteDB } from './db/index.js';
export { SolanaLogResult, SolanaLoggerConfig, SolanaMemoLogger, createMemoPayload } from './solana/index.js';
export { ArweaveUploadResult, ArweaveUploader, ArweaveUploaderConfig, verifyArweaveRecord } from './arweave/index.js';
import 'zod';
import '@solana/web3.js';

declare class ActivityLogger {
    private db;
    private solana;
    private arweave;
    private config;
    private immediateTypes;
    private flushInterval;
    constructor(config?: ActivityLoggerConfig);
    logActivity(input: CreateActivityInput, options?: {
        discovery?: CreateDiscoveryInput;
        decision?: CreateDecisionInput;
        immediate?: boolean;
    }): Promise<{
        activity: Activity;
        discovery?: Discovery;
        decision?: Decision;
    }>;
    private syncActivity;
    private queueForSync;
    private getPriority;
    private startBackgroundSync;
    private processSyncQueue;
    createDiscovery(activityId: string, input: CreateDiscoveryInput): Discovery;
    getDiscovery(id: string): Discovery | null;
    listDiscoveries(options?: Parameters<typeof this$1.db.listDiscoveries>[0]): Discovery[];
    createDecision(activityId: string, input: CreateDecisionInput): Decision;
    getDecision(id: string): Decision | null;
    listPendingDecisions(): Decision[];
    approveDecision(id: string, approvedBy: string, reason?: string): Promise<void>;
    rejectDecision(id: string, rejectedBy: string, reason: string): Promise<void>;
    getActivity(id: string): Activity | null;
    listActivities(options?: Parameters<typeof this$1.db.listActivities>[0]): Activity[];
    getStats(): ReturnType<typeof this$1.db.getStats>;
    close(): void;
    flush(): Promise<void>;
}

export { Activity, ActivityLogger, ActivityLoggerConfig, CreateActivityInput, CreateDecisionInput, CreateDiscoveryInput, Decision, Discovery };
