import { EventEmitter } from 'eventemitter3';

/**
 * Autonomy Level 2 Types
 */
type RiskLevel = "safe" | "moderate" | "high" | "critical";
type DecisionRoute = "auto" | "queue" | "escalate";
type EngineType = "orchestrator" | "money" | "growth" | "product" | "trading" | "hunter";
interface Action {
    id: string;
    engine: EngineType;
    type: string;
    description: string;
    params: Record<string, unknown>;
    risk: RiskAssessment;
    route: DecisionRoute;
    status: "pending" | "approved" | "rejected" | "executed" | "failed" | "rolled_back";
    result?: unknown;
    error?: string;
    createdAt: number;
    executedAt?: number;
    approvedAt?: number;
    approvedBy?: "auto" | "human" | "batch";
}
interface RiskAssessment {
    level: RiskLevel;
    score: number;
    factors: RiskFactor[];
    estimatedCost: number;
    maxPotentialLoss: number;
    reversible: boolean;
    rollbackPlan?: string;
}
interface RiskFactor {
    name: string;
    weight: number;
    value: number;
    threshold: number;
    exceeded: boolean;
}
interface Boundaries {
    financial: {
        maxAutoExpense: number;
        maxQueuedExpense: number;
        maxDailySpend: number;
        maxTradeSize: number;
        maxDailyTradingLoss: number;
        minTreasuryBalance: number;
    };
    content: {
        maxAutoPostsPerDay: number;
        maxAutoBlogsPerWeek: number;
        requireReviewForTopics: string[];
    };
    development: {
        maxAutoCommitLines: number;
        maxAutoFilesChanged: number;
        requireReviewForPaths: string[];
        autoDeployToStaging: boolean;
        autoDeployToProduction: boolean;
    };
    trading: {
        allowedBots: string[];
        allowedTokens: string[];
        maxPositionPercent: number;
        requireApprovalForNewTokens: boolean;
    };
    time: {
        activeHours: {
            start: number;
            end: number;
        };
        quietHours: {
            start: number;
            end: number;
        };
        maintenanceWindow: {
            day: number;
            hour: number;
        };
    };
}
interface ApprovalItem {
    action: Action;
    reason: string;
    recommendation: "approve" | "reject" | "modify";
    confidence: number;
    relatedActions: string[];
    urgency: "low" | "medium" | "high" | "critical";
    expiresAt?: number;
    status: "pending" | "approved" | "rejected" | "expired";
    reviewedAt?: number;
    reviewedBy?: string;
    feedback?: string;
}
interface BatchApproval {
    id: string;
    items: ApprovalItem[];
    totalActions: number;
    byEngine: Record<string, number>;
    byRisk: Record<RiskLevel, number>;
    estimatedTotalCost: number;
    approveAll: () => Promise<void>;
    rejectAll: () => Promise<void>;
    approveSelected: (ids: string[]) => Promise<void>;
}
interface AuditEntry {
    id: string;
    timestamp: number;
    actionId: string;
    actionType: string;
    engine: string;
    route: DecisionRoute;
    approvedBy: "auto" | "human" | "batch";
    status: "success" | "failed" | "rolled_back";
    result?: unknown;
    error?: string;
    costIncurred: number;
    revenueGenerated: number;
    wasGoodDecision?: boolean;
    notes?: string;
}
interface BoundaryCheckResult {
    withinLimits: boolean;
    needsReview: boolean;
    violated: boolean;
    violations: string[];
    warnings: string[];
}

/**
 * Approval Queue
 *
 * Manages pending approvals and batch review.
 */

interface QueueEvents {
    item_added: (item: ApprovalItem) => void;
    item_approved: (item: ApprovalItem) => void;
    item_rejected: (item: ApprovalItem) => void;
    batch_ready: (batch: BatchApproval) => void;
}
declare class ApprovalQueue extends EventEmitter<QueueEvents> {
    private queue;
    private logger;
    private batchInterval;
    private batchTimer?;
    constructor();
    /**
     * Start batch timer
     */
    startBatchTimer(): void;
    /**
     * Stop batch timer
     */
    stopBatchTimer(): void;
    /**
     * Add action to approval queue
     */
    add(action: Action, reason: string): ApprovalItem;
    /**
     * Approve an item
     */
    approve(actionId: string, feedback?: string): boolean;
    /**
     * Reject an item
     */
    reject(actionId: string, feedback?: string): boolean;
    /**
     * Get a specific item
     */
    get(actionId: string): ApprovalItem | undefined;
    /**
     * Get all pending items
     */
    getPending(): ApprovalItem[];
    /**
     * Get pending items for batch review
     */
    getBatch(): BatchApproval;
    /**
     * Get queue stats
     */
    getStats(): {
        pending: number;
        approved: number;
        rejected: number;
        byUrgency: Record<string, number>;
    };
    /**
     * Clear processed items
     */
    clearProcessed(): void;
    private generateRecommendation;
    private calculateConfidence;
    private determineUrgency;
}

/**
 * Notification System
 *
 * Alerts human for escalations and batch reviews.
 */

interface NotificationConfig {
    telegram?: {
        botToken: string;
        chatId: string;
    };
    discord?: {
        webhookUrl: string;
    };
    email?: {
        to: string;
    };
}
interface NotificationEvents {
    sent: (channel: string, type: string) => void;
    failed: (channel: string, error: Error) => void;
}
declare class NotificationManager extends EventEmitter<NotificationEvents> {
    private config;
    private logger;
    constructor(config?: NotificationConfig);
    /**
     * Update configuration
     */
    setConfig(config: NotificationConfig): void;
    /**
     * Send escalation alert (immediate)
     */
    escalate(action: Action): Promise<void>;
    /**
     * Send batch review notification
     */
    notifyBatchReady(batch: BatchApproval): Promise<void>;
    /**
     * Send daily summary
     */
    sendDailySummary(summary: {
        autoExecuted: number;
        queued: number;
        escalated: number;
        costIncurred: number;
        revenueGenerated: number;
    }): Promise<void>;
    /**
     * Format escalation message
     */
    private formatEscalation;
    /**
     * Format batch message
     */
    private formatBatch;
    /**
     * Send to all configured channels
     */
    private sendAll;
    /**
     * Send via Telegram
     */
    private sendTelegram;
    /**
     * Send via Discord webhook
     */
    private sendDiscord;
}

/**
 * Boundary Configuration Manager
 */

declare function getDefaultBoundaries(): Boundaries;
declare function mergeBoundaries(base: Boundaries, overrides: Partial<Boundaries>): Boundaries;

/**
 * Boundary Checker
 *
 * Validates actions against configured boundaries.
 */

declare class BoundaryChecker {
    private boundaries;
    private dailySpend;
    private dailyPosts;
    private weeklyBlogs;
    private lastResetDay;
    constructor(boundaries: Boundaries);
    /**
     * Check if action is within boundaries
     */
    check(action: Action): BoundaryCheckResult;
    private checkFinancialBoundaries;
    private checkContentBoundaries;
    private checkDevelopmentBoundaries;
    private checkTradingBoundaries;
    private checkTimeBoundaries;
    /**
     * Record that an action was executed (for daily limits)
     */
    recordExecution(action: Action): void;
    private resetDailyCountersIfNeeded;
    /**
     * Update boundaries
     */
    updateBoundaries(newBoundaries: Boundaries): void;
    /**
     * Get current boundaries
     */
    getBoundaries(): Boundaries;
}

/**
 * Escalation Manager
 *
 * Handles immediate notification for critical actions.
 */

interface EscalationEvents {
    escalated: (action: Action) => void;
    resolved: (actionId: string, approved: boolean) => void;
}
declare class EscalationManager extends EventEmitter<EscalationEvents> {
    private logger;
    private pendingEscalations;
    constructor();
    /**
     * Escalate an action for immediate human review
     */
    notify(action: Action): Promise<void>;
    /**
     * Resolve an escalation
     */
    resolve(actionId: string, approved: boolean, feedback?: string): void;
    /**
     * Get pending escalations
     */
    getPending(): Action[];
    /**
     * Get pending count
     */
    getPendingCount(): number;
    /**
     * Format escalation details for logging/notification
     */
    private formatEscalationDetails;
}

/**
 * Risk Classifier
 *
 * Assesses risk level of actions.
 */

declare class RiskClassifier {
    /**
     * Assess risk of an action
     */
    assess(action: Action): Promise<RiskAssessment>;
    /**
     * Identify risk factors for an action
     */
    private identifyRiskFactors;
    /**
     * Calculate overall risk score
     */
    private calculateScore;
    /**
     * Determine risk level from score
     */
    private determineLevel;
    private estimateCost;
    private estimateMaxLoss;
    private isReversible;
    private generateRollbackPlan;
    private isQuietHours;
}

/**
 * Decision Router
 *
 * Routes actions to auto-execute, queue, or escalate based on boundaries.
 */

interface RouterEvents {
    "action:routed": (action: Action, route: DecisionRoute) => void;
    "action:auto_approved": (action: Action) => void;
    "action:queued": (action: Action, reason: string) => void;
    "action:escalated": (action: Action) => void;
}
declare class DecisionRouter extends EventEmitter<RouterEvents> {
    private classifier;
    private boundaryChecker;
    private escalation;
    private logger;
    private boundaries;
    constructor(boundaries: Boundaries);
    /**
     * Route an action to the appropriate handler
     */
    route(action: Action): Promise<DecisionRoute>;
    /**
     * Handle action based on route
     */
    private handleRoute;
    /**
     * Record that an action was executed (updates daily limits)
     */
    recordExecution(action: Action): void;
    /**
     * Update boundaries
     */
    updateBoundaries(newBoundaries: Boundaries): void;
    /**
     * Get current boundaries
     */
    getBoundaries(): Boundaries;
    /**
     * Get escalation manager (for handling escalations)
     */
    getEscalationManager(): EscalationManager;
    /**
     * Get boundary checker (for manual checks)
     */
    getBoundaryChecker(): BoundaryChecker;
}

/**
 * Safe Actions Registry
 *
 * Defines and executes pre-approved action types.
 */

type ActionHandler = (action: Action) => Promise<unknown>;
declare class SafeActions {
    private handlers;
    private logger;
    constructor();
    /**
     * Register a handler for an action type
     */
    register(actionType: string, handler: ActionHandler): void;
    /**
     * Execute an action using registered handler
     */
    execute(action: Action): Promise<unknown>;
    /**
     * Check if action type has a handler
     */
    hasHandler(actionType: string): boolean;
    /**
     * Find handler for action type (supports wildcards)
     */
    private findHandler;
    /**
     * Register default safe action handlers
     */
    private registerDefaultHandlers;
}

/**
 * Rollback Manager
 *
 * Manages checkpoints and rollback for reversible actions.
 */

declare class RollbackManager {
    private checkpoints;
    private logger;
    private maxCheckpoints;
    constructor();
    /**
     * Create a checkpoint before executing an action
     */
    createCheckpoint(action: Action, state?: unknown): Promise<void>;
    /**
     * Restore from checkpoint (rollback)
     */
    restore(action: Action): Promise<void>;
    /**
     * Check if rollback is available
     */
    hasCheckpoint(actionId: string): boolean;
    /**
     * Get checkpoint state
     */
    getState(actionId: string): unknown | undefined;
    /**
     * Clear checkpoint (after successful verification)
     */
    clearCheckpoint(actionId: string): void;
    /**
     * Generate rollback function based on action type
     */
    private generateRollbackFn;
    /**
     * Cleanup old checkpoints (keep last N)
     */
    private cleanupOldCheckpoints;
}

/**
 * Auto-Executor
 *
 * Executes approved actions automatically.
 */

interface ExecutorEvents {
    executed: (action: Action) => void;
    failed: (action: Action, error: Error) => void;
    rolled_back: (action: Action) => void;
}
declare class AutoExecutor extends EventEmitter<ExecutorEvents> {
    private safeActions;
    private rollback;
    private logger;
    private executing;
    constructor();
    /**
     * Execute an auto-approved action
     */
    execute(action: Action): Promise<boolean>;
    /**
     * Attempt to rollback a failed action
     */
    private attemptRollback;
    /**
     * Execute multiple actions in sequence
     */
    executeBatch(actions: Action[]): Promise<{
        success: Action[];
        failed: Action[];
    }>;
    /**
     * Register custom action handler
     */
    registerHandler(actionType: string, handler: ActionHandler): void;
    /**
     * Check if action type can be executed
     */
    canExecute(actionType: string): boolean;
    /**
     * Get rollback manager
     */
    getRollbackManager(): RollbackManager;
}

/**
 * Audit Trail
 *
 * Logs all autonomous actions for review and learning.
 */

declare class AuditLogger {
    private entries;
    private logger;
    private maxEntries;
    constructor();
    /**
     * Log an action
     */
    log(action: Action, outcome: "success" | "failed" | "rolled_back", costIncurred?: number, revenueGenerated?: number): AuditEntry;
    /**
     * Add human feedback to an entry
     */
    addFeedback(entryId: string, wasGoodDecision: boolean, notes?: string): void;
    /**
     * Get entries for time range
     */
    getEntries(options?: {
        since?: number;
        until?: number;
        engine?: string;
        route?: DecisionRoute;
        status?: AuditEntry["status"];
        limit?: number;
    }): AuditEntry[];
    /**
     * Get summary statistics
     */
    getSummary(since?: number): {
        total: number;
        byRoute: Record<DecisionRoute, number>;
        byStatus: Record<string, number>;
        byEngine: Record<string, number>;
        totalCost: number;
        totalRevenue: number;
        successRate: number;
    };
    /**
     * Get daily summary
     */
    getDailySummary(): {
        autoExecuted: number;
        queued: number;
        escalated: number;
        costIncurred: number;
        revenueGenerated: number;
    };
    /**
     * Export entries to JSON
     */
    export(): string;
    /**
     * Import entries from JSON
     */
    import(json: string): void;
}

interface AutonomyConfig {
    boundaries?: Partial<Boundaries>;
    notifications?: NotificationConfig;
    enableBatching?: boolean;
}
interface AutonomyEvents {
    "action:auto_executed": (action: Action) => void;
    "action:queued": (action: Action) => void;
    "action:escalated": (action: Action) => void;
    "action:approved": (action: Action) => void;
    "action:rejected": (action: Action) => void;
    "action:executed": (action: Action) => void;
    "action:failed": (action: Action, error: Error) => void;
}
declare class AutonomySystem extends EventEmitter<AutonomyEvents> {
    private router;
    private executor;
    private approvalQueue;
    private notifications;
    private auditLogger;
    private logger;
    private boundaries;
    constructor(config?: AutonomyConfig);
    processAction(action: Partial<Action> & {
        type: string;
        engine: EngineType;
    }): Promise<{
        route: DecisionRoute;
        action: Action;
    }>;
    approveAction(actionId: string, feedback?: string): Promise<boolean>;
    rejectAction(actionId: string, feedback?: string): boolean;
    getPendingApprovals(): ApprovalItem[];
    getBatch(): BatchApproval;
    getBoundaries(): Boundaries;
    updateBoundaries(newBoundaries: Partial<Boundaries>): void;
    getAuditSummary(since?: number): {
        total: number;
        byRoute: Record<DecisionRoute, number>;
        byStatus: Record<string, number>;
        byEngine: Record<string, number>;
        totalCost: number;
        totalRevenue: number;
        successRate: number;
    };
    getDailySummary(): {
        autoExecuted: number;
        queued: number;
        escalated: number;
        costIncurred: number;
        revenueGenerated: number;
    };
    getQueueStats(): {
        pending: number;
        approved: number;
        rejected: number;
        byUrgency: Record<string, number>;
    };
    registerActionHandler(actionType: string, handler: (action: Action) => Promise<unknown>): void;
    setNotificationConfig(config: NotificationConfig): void;
    sendDailySummary(): Promise<void>;
    shutdown(): void;
    private setupEventHandlers;
    private generateId;
}

export { type Action, type ActionHandler, type ApprovalItem, ApprovalQueue, type AuditEntry, AuditLogger, AutoExecutor, type AutonomyConfig, AutonomySystem, type BatchApproval, type Boundaries, type BoundaryCheckResult, BoundaryChecker, type DecisionRoute, DecisionRouter, type EngineType, EscalationManager, type NotificationConfig, NotificationManager, type RiskAssessment, RiskClassifier, type RiskFactor, type RiskLevel, RollbackManager, SafeActions, getDefaultBoundaries, mergeBoundaries };
