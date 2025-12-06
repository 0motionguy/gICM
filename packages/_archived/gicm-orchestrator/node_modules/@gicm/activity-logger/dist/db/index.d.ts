import { C as CreateActivityInput, c as Activity, f as ActivityType, h as ActivityStatus, a as CreateDiscoveryInput, D as Discovery, b as CreateDecisionInput, d as Decision, s as SyncTarget, w as SyncQueueItem, u as SyncStatus } from '../types-Bpw3NPzK.js';
import 'zod';

declare class SQLiteDB {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    private getDefaultDbPath;
    private ensureDirectory;
    private runMigrations;
    private getCurrentMigrationVersion;
    createActivity(input: CreateActivityInput): Activity;
    getActivity(id: string): Activity | null;
    updateActivity(id: string, updates: Partial<Pick<Activity, "status" | "outputData" | "reasoning" | "solanaTxHash" | "arweaveTxId" | "completedAt">>): void;
    listActivities(options: {
        type?: ActivityType;
        status?: ActivityStatus;
        limit?: number;
        offset?: number;
        since?: Date;
    }): Activity[];
    createDiscovery(activityId: string, input: CreateDiscoveryInput): Discovery;
    getDiscovery(id: string): Discovery | null;
    listDiscoveries(options: {
        source?: string;
        analyzed?: boolean;
        limit?: number;
        minRelevance?: number;
    }): Discovery[];
    markDiscoveryAnalyzed(id: string, decisionId: string): void;
    createDecision(activityId: string, input: CreateDecisionInput): Decision;
    getDecision(id: string): Decision | null;
    listPendingDecisions(): Decision[];
    approveDecision(id: string, approvedBy: string, reason?: string): void;
    rejectDecision(id: string, approvedBy: string, reason: string): void;
    enqueueSyncItem(activityId: string, target: SyncTarget, content: unknown, priority?: number): SyncQueueItem;
    getNextSyncItems(target: SyncTarget, limit?: number): SyncQueueItem[];
    updateSyncItemStatus(id: string, status: SyncStatus, errorMessage?: string): void;
    getStats(): {
        activities: number;
        discoveries: number;
        pendingDecisions: number;
        syncQueue: {
            solana: number;
            arweave: number;
        };
    };
    private computeHash;
    private rowToActivity;
    private rowToDiscovery;
    private rowToDecision;
    private rowToSyncQueueItem;
    close(): void;
}

export { SQLiteDB };
