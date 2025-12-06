/**
 * Autonomy Level 2 Types
 */

// ============================================================================
// DECISION ROUTING
// ============================================================================

export type RiskLevel = "safe" | "moderate" | "high" | "critical";
export type DecisionRoute = "auto" | "queue" | "escalate";
export type EngineType = "orchestrator" | "money" | "growth" | "product" | "trading" | "hunter";

export interface Action {
  id: string;

  // Source
  engine: EngineType;
  type: string;

  // Details
  description: string;
  params: Record<string, unknown>;

  // Risk assessment
  risk: RiskAssessment;

  // Routing
  route: DecisionRoute;

  // Status
  status: "pending" | "approved" | "rejected" | "executed" | "failed" | "rolled_back";

  // Results
  result?: unknown;
  error?: string;

  // Timestamps
  createdAt: number;
  executedAt?: number;
  approvedAt?: number;
  approvedBy?: "auto" | "human" | "batch";
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0-100

  // Risk factors
  factors: RiskFactor[];

  // Cost assessment
  estimatedCost: number; // USD
  maxPotentialLoss: number;

  // Reversibility
  reversible: boolean;
  rollbackPlan?: string;
}

export interface RiskFactor {
  name: string;
  weight: number; // How much this contributes to risk
  value: number; // Current value
  threshold: number; // When it becomes risky
  exceeded: boolean;
}

// ============================================================================
// BOUNDARIES
// ============================================================================

export interface Boundaries {
  // Financial limits
  financial: {
    maxAutoExpense: number; // Auto-approve expenses under this ($50)
    maxQueuedExpense: number; // Queue for review under this ($200)
    maxDailySpend: number; // Total daily auto-spend limit ($100)
    maxTradeSize: number; // Single trade limit ($500)
    maxDailyTradingLoss: number; // Stop trading if exceeded (5%)
    minTreasuryBalance: number; // Alert if below ($1000)
  };

  // Content limits
  content: {
    maxAutoPostsPerDay: number; // Auto-post limit (10)
    maxAutoBlogsPerWeek: number; // Auto-publish blogs (3)
    requireReviewForTopics: string[]; // Topics needing human review
  };

  // Development limits
  development: {
    maxAutoCommitLines: number; // Auto-commit if under (100 lines)
    maxAutoFilesChanged: number; // Auto-commit if under (5 files)
    requireReviewForPaths: string[]; // Paths needing review
    autoDeployToStaging: boolean; // Auto-deploy to staging?
    autoDeployToProduction: boolean; // Auto-deploy to prod? (false!)
  };

  // Trading limits
  trading: {
    allowedBots: string[]; // Which bots can auto-trade
    allowedTokens: string[]; // Which tokens can trade
    maxPositionPercent: number; // Max % of portfolio per position
    requireApprovalForNewTokens: boolean;
  };

  // Time boundaries
  time: {
    activeHours: { start: number; end: number }; // e.g., 6-22 UTC
    quietHours: { start: number; end: number }; // No alerts
    maintenanceWindow: { day: number; hour: number };
  };
}

// ============================================================================
// APPROVAL QUEUE
// ============================================================================

export interface ApprovalItem {
  action: Action;

  // Context
  reason: string; // Why it needs approval
  recommendation: "approve" | "reject" | "modify";
  confidence: number; // How confident in recommendation

  // Related items
  relatedActions: string[]; // Other actions this depends on

  // Urgency
  urgency: "low" | "medium" | "high" | "critical";
  expiresAt?: number; // Auto-reject if not reviewed by

  // Status
  status: "pending" | "approved" | "rejected" | "expired";
  reviewedAt?: number;
  reviewedBy?: string;
  feedback?: string;
}

export interface BatchApproval {
  id: string;
  items: ApprovalItem[];

  // Summary
  totalActions: number;
  byEngine: Record<string, number>;
  byRisk: Record<RiskLevel, number>;
  estimatedTotalCost: number;

  // Quick actions
  approveAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
  approveSelected: (ids: string[]) => Promise<void>;
}

// ============================================================================
// AUDIT
// ============================================================================

export interface AuditEntry {
  id: string;
  timestamp: number;

  // Action
  actionId: string;
  actionType: string;
  engine: string;

  // Decision
  route: DecisionRoute;
  approvedBy: "auto" | "human" | "batch";

  // Outcome
  status: "success" | "failed" | "rolled_back";
  result?: unknown;
  error?: string;

  // Impact
  costIncurred: number;
  revenueGenerated: number;

  // Learning
  wasGoodDecision?: boolean; // Human feedback
  notes?: string;
}

// ============================================================================
// LEARNING
// ============================================================================

export interface LearningData {
  // Approval patterns
  approvalPatterns: {
    actionType: string;
    approvalRate: number; // % approved by human
    avgTimeToApproval: number; // How long human takes
    commonRejectionReasons: string[];
  }[];

  // Boundary suggestions
  boundarySuggestions: {
    boundary: string;
    currentValue: number;
    suggestedValue: number;
    reason: string;
    confidence: number;
  }[];

  // Autonomy score
  autonomyScore: {
    current: number; // 0-100
    trend: "increasing" | "stable" | "decreasing";
    blockingFactors: string[]; // What's preventing more autonomy
  };
}

// ============================================================================
// BOUNDARY CHECK RESULT
// ============================================================================

export interface BoundaryCheckResult {
  withinLimits: boolean;
  needsReview: boolean;
  violated: boolean;
  violations: string[];
  warnings: string[];
}
