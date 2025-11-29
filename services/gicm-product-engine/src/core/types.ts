/**
 * gICM Product Engine Types
 */

// ============================================================================
// DISCOVERY
// ============================================================================

export type DiscoverySource =
  | "user_feedback"
  | "competitor"
  | "github"
  | "hackernews"
  | "technology"
  | "internal";

export type OpportunityType =
  | "new_agent"
  | "new_component"
  | "new_feature"
  | "improvement"
  | "bug_fix"
  | "integration";

export interface Opportunity {
  id: string;

  // Source
  source: DiscoverySource;
  sourceUrl?: string;

  // Details
  type: OpportunityType;
  title: string;
  description: string;

  // Scoring
  scores: {
    userDemand: number; // 0-100: How many users want this?
    competitiveValue: number; // 0-100: Does this differentiate us?
    technicalFit: number; // 0-100: How well does it fit our stack?
    effort: number; // 0-100: How easy to build? (higher = easier)
    impact: number; // 0-100: How much does it improve gICM?
    overall: number; // Weighted average
  };

  // Analysis
  analysis: {
    whatItDoes: string;
    whyItMatters: string;
    howToBuild: string;
    risks: string[];
    dependencies: string[];
    estimatedEffort: string; // "1 day", "1 week", etc.
  };

  // Status
  status:
    | "discovered"
    | "evaluated"
    | "approved"
    | "building"
    | "testing"
    | "deployed"
    | "rejected";
  priority: "critical" | "high" | "medium" | "low";

  // Assignment
  assignedTo?: string; // Which builder handles this

  // Timestamps
  discoveredAt: number;
  evaluatedAt?: number;
  approvedAt?: number;
  completedAt?: number;
}

export interface UserFeedback {
  id: string;

  // Source
  source: "discord" | "github" | "email" | "twitter" | "support";
  userId?: string;

  // Content
  type: "feature_request" | "bug_report" | "improvement" | "question";
  title: string;
  description: string;

  // Engagement
  upvotes: number;
  comments: number;

  // Processing
  processed: boolean;
  opportunityId?: string;

  // Timestamps
  createdAt: number;
}

export interface CompetitorFeature {
  competitor: string;
  feature: string;
  description: string;
  launchDate?: number;
  userReception: "positive" | "neutral" | "negative";
  weHaveIt: boolean;
  priority: "must_have" | "nice_to_have" | "ignore";
}

// ============================================================================
// BUILDING
// ============================================================================

export interface BuildTask {
  id: string;
  opportunityId: string;

  // What to build
  type: OpportunityType;
  title: string;
  specification: BuildSpec;

  // Status
  status: "queued" | "building" | "testing" | "review" | "done" | "failed";

  // Output
  artifacts: BuildArtifact[];
  outputPath?: string;

  // Error handling
  error?: string;

  // Quality
  testResults?: TestResults;
  reviewResults?: ReviewResults;

  // Timestamps
  startedAt?: number;
  completedAt?: number;

  // Logs
  logs: BuildLog[];
}

export interface BuildSpec {
  // What to create
  name: string;
  description: string;

  // Technical details
  technology: string[]; // ["typescript", "react", "solana"]
  dependencies: string[];
  apis: string[];

  // Requirements
  requirements: string[];
  acceptanceCriteria: string[];

  // Template
  template?: string;

  // Files to create
  files: FileSpec[];
}

export interface FileSpec {
  path: string;
  description: string;
  template?: string;
}

export interface BuildArtifact {
  type: "code" | "test" | "docs" | "config";
  path: string;
  content: string;
  language: string;
}

export interface BuildLog {
  timestamp: number;
  level: "info" | "warn" | "error";
  message: string;
  details?: unknown;
}

// ============================================================================
// AGENTS
// ============================================================================

export interface AgentSpec {
  // Identity
  name: string;
  slug: string;
  description: string;
  category: AgentCategory;

  // Capabilities
  capabilities: string[];
  inputs: AgentInput[];
  outputs: AgentOutput[];

  // Technical
  dependencies: string[];
  apis: string[];

  // Configuration
  defaultConfig: Record<string, unknown>;

  // Metadata
  version: string;
  author: string;
  license: string;
}

export type AgentCategory =
  | "trading"
  | "research"
  | "content"
  | "automation"
  | "analytics"
  | "social"
  | "development";

export interface AgentInput {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: unknown;
}

export interface AgentOutput {
  name: string;
  type: string;
  description: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export interface ComponentSpec {
  // Identity
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;

  // Technical
  framework: "react" | "vanilla" | "node";
  language: "typescript" | "javascript";

  // Props/API
  props?: PropSpec[];
  exports?: ExportSpec[];

  // Dependencies
  dependencies: string[];
  peerDependencies: string[];

  // Metadata
  version: string;
  author: string;
  license: string;
  tags: string[];
}

export type ComponentCategory =
  | "ui"
  | "form"
  | "data"
  | "chart"
  | "wallet"
  | "trading"
  | "utility"
  | "hook";

export interface PropSpec {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ExportSpec {
  name: string;
  type: "function" | "class" | "constant" | "type";
  description: string;
}

// ============================================================================
// QUALITY
// ============================================================================

export interface TestResults {
  passed: boolean;

  // Test counts
  total: number;
  passed_count: number;
  failed_count: number;
  skipped: number;

  // Coverage
  coverage?: {
    lines: number;
    branches: number;
    functions: number;
  };

  // Details
  tests: TestResult[];

  // Timing
  duration: number;
}

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

export interface ReviewResults {
  approved: boolean;

  // Scores
  scores: {
    codeQuality: number; // 0-100
    security: number;
    performance: number;
    maintainability: number;
    overall: number;
  };

  // Issues
  issues: ReviewIssue[];

  // Suggestions
  suggestions: string[];
}

export interface ReviewIssue {
  severity: "critical" | "major" | "minor" | "info";
  category: "security" | "performance" | "quality" | "style";
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

// ============================================================================
// DEPLOYMENT
// ============================================================================

export interface Deployment {
  id: string;

  // What was deployed
  type: "agent" | "component" | "feature";
  name: string;
  version: string;

  // Where
  environment: "staging" | "production";

  // Status
  status: "deploying" | "deployed" | "failed" | "rolled_back";

  // Artifacts
  artifacts: string[];

  // Health
  healthCheck?: {
    status: "healthy" | "degraded" | "unhealthy";
    latency: number;
    errors: number;
  };

  // Timestamps
  deployedAt: number;
  rolledBackAt?: number;

  // Metadata
  deployedBy: string;
  commit?: string;
  changelog: string;
}

// ============================================================================
// LEARNING
// ============================================================================

export interface ProductMetrics {
  // Pipeline counts
  discovered: number;
  built: number;
  deployed: number;
  failed: number;

  // Performance
  avgBuildTime: number;
  avgQualityScore: number;

  // Usage
  usage: {
    agentsUsed: number;
    componentsDownloaded: number;
    apiCalls: number;
  };

  // Quality
  quality: {
    bugReports: number;
    crashRate: number;
    userSatisfaction: number;
  };

  // Growth
  growth: {
    newAgents: number;
    newComponents: number;
    improvements: number;
  };

  // Efficiency
  efficiency: {
    avgBuildTime: number;
    successRate: number;
    automationRate: number;
  };
}

// ============================================================================
// CONFIG
// ============================================================================

export interface ProductEngineConfig {
  // Discovery
  enableDiscovery: boolean;
  discoveryInterval: string; // Cron expression

  // Building
  enableAutoBuilding: boolean;
  autoApproveThreshold: number; // Score threshold for auto-approve

  // Deployment
  enableAutoDeploy: boolean;
  deployToStaging: boolean;
  deployToProduction: boolean;
}
