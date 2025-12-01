import { EventEmitter } from 'eventemitter3';
import { D as DiffSummary, C as CommitRiskAssessment } from '../types-IMH_luwC.js';
import 'zod';

/**
 * Commit Engine Adapter for Autonomy Integration
 *
 * Routes git operations through the autonomy system for risk assessment
 */

type ActionCategory = "trading" | "content" | "build" | "deployment" | "configuration";
type EngineType = "money" | "growth" | "product" | "orchestrator";
type Urgency = "low" | "normal" | "high" | "critical";
type DecisionOutcome = "auto_execute" | "queue_approval" | "escalate" | "reject";
interface ActionMetadata {
    estimatedValue?: number;
    reversible: boolean;
    urgency: Urgency;
    dependencies?: string[];
    linesChanged?: number;
    filesChanged?: number;
}
interface Action {
    id: string;
    engine: EngineType;
    category: ActionCategory;
    type: string;
    description: string;
    params: Record<string, unknown>;
    metadata: ActionMetadata;
    timestamp: number;
}
interface CommitActionParams {
    message: string;
    diff: DiffSummary;
    risk: CommitRiskAssessment;
    amend?: boolean;
}
interface PushActionParams {
    remote: string;
    branch: string;
    force?: boolean;
    commitCount?: number;
}
interface PRActionParams {
    title: string;
    body: string;
    base: string;
    draft?: boolean;
}
interface CommitAdapterEvents {
    "action:submitted": (action: Action) => void;
    "decision:received": (decision: {
        action: Action;
        outcome: DecisionOutcome;
        reason: string;
    }) => void;
}
interface CommitAdapterConfig {
    engineName?: string;
    autoExecuteMaxScore?: number;
    queueApprovalMaxScore?: number;
    escalateMaxScore?: number;
}
/**
 * Adapter for integrating commit operations with autonomy system
 */
declare class CommitEngineAdapter extends EventEmitter<CommitAdapterEvents> {
    private config;
    private actionCount;
    constructor(config?: CommitAdapterConfig);
    /**
     * Create an action for committing changes
     */
    createCommitAction(params: CommitActionParams): Action;
    /**
     * Create an action for pushing changes
     */
    createPushAction(params: PushActionParams): Action;
    /**
     * Create an action for creating a PR
     */
    createPRAction(params: PRActionParams): Action;
    /**
     * Determine decision outcome based on risk score
     */
    getDecisionOutcome(riskScore: number): DecisionOutcome;
    /**
     * Check if an action should auto-execute
     */
    shouldAutoExecute(action: Action): boolean;
    /**
     * Create a generic action
     */
    private createAction;
    /**
     * Map action type to category
     */
    private getCategoryForType;
    /**
     * Get engine name
     */
    getEngineName(): string;
    /**
     * Get action count
     */
    getActionCount(): number;
}

export { type CommitActionParams, type CommitAdapterConfig, type CommitAdapterEvents, CommitEngineAdapter, type PRActionParams, type PushActionParams };
