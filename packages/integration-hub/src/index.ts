/**
 * gICM Integration Hub
 *
 * Central coordination for all gICM engines:
 * - Event bus for cross-engine communication
 * - Engine health monitoring
 * - REST + WebSocket API
 * - Automated workflows
 */

// Main hub
export {
  IntegrationHub,
  type IntegrationHubConfig,
  type HubStatus,
  getHub,
  setHubInstance,
} from "./hub.js";

// Event bus
export {
  EventBus,
  eventBus,
  type EventCategory,
  type HubEvent,
  type EventBusEvents,
} from "./event-bus.js";

// Engine manager
export {
  EngineManager,
  type EngineId,
  type EngineHealth,
  type EngineManagerConfig,
} from "./engine-manager.js";

// API server
export { ApiServer, type ApiServerConfig } from "./api/server.js";

// Workflows
export {
  workflows,
  registerWorkflows,
  getWorkflows,
  type Workflow,
} from "./workflows/index.js";

// Analytics
export {
  AnalyticsManager,
  getAnalyticsManager,
  createPersistentAnalytics,
  type PipelineExecution as AnalyticsPipelineExecution,
  type StepExecution,
  type TokenUsage,
  type ExecutionCost,
  type DailyStats,
  type AnalyticsSummary,
  type AnalyticsConfig,
} from "./analytics.js";

// Storage (Supabase persistence)
export {
  SupabaseStorage,
  getSupabaseStorage,
  initializeStorage,
  type SupabaseConfig,
  type WebhookConfig,
  type WebhookEventType,
  type WebhookDelivery,
  type PipelineTemplate,
  type StorageEvents,
} from "./storage/index.js";

// Queue (background job processing)
export {
  PipelineQueue,
  BullPipelineQueue,
  createPipelineQueue,
  getPipelineQueue,
  PipelineWorker,
  createPipelineWorker,
  createAgentWorker,
  createAgentToolExecutor,
  type PipelineJob,
  type PipelineStep,
  type JobPriority,
  type JobStatus,
  type JobProgress,
  type QueueConfig,
  type QueueEvents,
  type WorkerConfig,
  type ToolExecutor,
  type ToolResult,
  type ExecutionContext,
  type WorkerEvents,
  type PipelineResult,
} from "./queue/index.js";

// Notifications (webhooks)
export {
  WebhookManager,
  getWebhookManager,
  createWebhookManager,
  type WebhookManagerConfig,
  type WebhookPayload,
  type DeliveryResult,
  type WebhookManagerEvents,
} from "./notifications/index.js";

// Execution (tool registry + agent executor)
export {
  toolRegistry,
  getToolRegistry,
  AgentExecutor,
  createAgentExecutor,
  getAgentExecutor,
  type ToolDefinition,
  type ToolCategory,
  type ToolResult as AgentToolResult,
  type ExecutorConfig,
  type ExecutionContext as AgentExecutionContext,
  type ExecutorEvents,
} from "./execution/index.js";

// Scheduler (cron-based pipeline scheduling)
export {
  ScheduleManager,
  getScheduleManager,
  createScheduleManager,
  cronToHuman,
  // Schemas
  CronExpressionSchema,
  TimezoneSchema,
  ScheduleStatusSchema,
  ScheduleConfigSchema,
  ScheduleSchema,
  ScheduledRunSchema,
  ScheduleExecutionSchema,
  ScheduleStatsSchema,
  // Types
  type ScheduleManagerConfig,
  type CronExpression,
  type Timezone,
  type ScheduleStatus,
  type ScheduleConfig,
  type Schedule,
  type ScheduledRun,
  type ScheduleExecution,
  type ScheduleStats,
  type SchedulerEvents,
  // Presets
  CRON_PRESETS,
  type CronPreset,
} from "./scheduler/index.js";

// Auth (Multi-Tenancy & RBAC - Phase 9A)
export {
  // Manager
  RBACManager,
  getRBACManager,
  createRBACManager,
  type RBACManagerConfig,

  // Organization types
  OrganizationSchema,
  CreateOrgSchema,
  UpdateOrgSchema,
  OrgSettingsSchema,
  OrgPlanSchema,
  type Organization,
  type CreateOrg,
  type UpdateOrg,
  type OrgSettings,
  type OrgPlan,

  // Member types
  OrgMemberSchema,
  AddMemberSchema,
  UpdateMemberSchema,
  MemberStatusSchema,
  type OrgMember,
  type AddMember,
  type UpdateMember,
  type MemberStatus,

  // Invite types
  OrgInviteSchema,
  CreateInviteSchema,
  InviteStatusSchema,
  type OrgInvite,
  type CreateInvite,
  type InviteStatus,

  // Role & Permission types
  RoleSchema,
  PermissionSchema,
  ResourceTypeSchema,
  ActionTypeSchema,
  type Role,
  type Permission,
  type ResourceType,
  type ActionType,

  // Permission check types
  PermissionCheckSchema,
  PermissionResultSchema,
  AuthContextSchema,
  type PermissionCheck,
  type PermissionResult,
  type AuthContext,

  // Permission helpers
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  ROLE_DESCRIPTIONS,
  buildPermission,
  parsePermission,
  roleHasPermission,
  getPermissionsForRole,
  isHigherRole,
  isAtLeastRole,
  mergePermissions,

  // Constants
  PLAN_LIMITS,
  ROLE_LEVELS,

  // Events
  type RBACEvents,
} from "./auth/index.js";

// Audit Logging (Phase 9B)
export {
  // Logger
  AuditLogger,
  getAuditLogger,
  createAuditLogger,
  type AuditLoggerConfig,

  // Event types
  AuditEventSchema,
  CreateAuditEventSchema,
  type AuditEvent,
  type CreateAuditEvent,

  // Categories & Actions
  AuditCategorySchema,
  AuditActionSchema,
  AuditSeveritySchema,
  AuditResultSchema,
  type AuditCategory,
  type AuditAction,
  type AuditSeverity,
  type AuditResult,

  // Context & Resource
  AuditContextSchema,
  AuditResourceSchema,
  AuditChangeSchema,
  type AuditContext,
  type AuditResource,
  type AuditChange,

  // Query
  AuditQuerySchema,
  AuditQueryResultSchema,
  type AuditQuery,
  type AuditQueryResult,

  // Export & Retention
  AuditExportOptionsSchema,
  AuditRetentionPolicySchema,
  type AuditExportOptions,
  type AuditRetentionPolicy,

  // Stats
  AuditStatsSchema,
  type AuditStats,

  // Constants
  DEFAULT_RETENTION_DAYS,
  SEVERITY_LEVELS,

  // Events
  type AuditLoggerEvents,
} from "./audit/index.js";

// Cache (Phase 9C)
export {
  // Manager
  CacheManager,
  getCacheManager,
  createCacheManager,

  // Types
  CacheStrategySchema,
  type CacheStrategy,
  EvictionPolicySchema,
  type EvictionPolicy,
  CacheEntrySchema,
  type CacheEntry,
  CacheOptionsSchema,
  type CacheOptions,
  CacheResultSchema,
  type CacheResult,
  CacheStatsSchema,
  type CacheStats,
  CacheManagerConfigSchema,
  type CacheManagerConfig,

  // Middleware
  cacheMiddleware,
  createCacheMiddleware,
  type CacheMiddlewareOptions,

  // Helpers
  CacheKeys,
  TTL,
  CacheTags,

  // Events
  type CacheEvents,
} from "./cache/index.js";

// Plugins (Phase 9D)
export {
  // Manager
  PluginManager,
  getPluginManager,
  createPluginManager,

  // Schemas & Types
  PluginMetadataSchema,
  type PluginMetadata,
  PluginCapabilitySchema,
  type PluginCapability,
  PluginStatusSchema,
  type PluginStatus,
  PluginDefinitionSchema,
  type PluginDefinition,
  InstalledPluginSchema,
  type InstalledPlugin,
  PluginHookTypeSchema,
  type PluginHookType,
  PluginToolSchema,
  type PluginTool,
  PluginRouteSchema,
  type PluginRoute,
  PluginManagerConfigSchema,
  type PluginManagerConfig,

  // Events & Context
  type PluginEvents,
  type HookContext,
  type ToolExecutionContext,
} from "./plugins/index.js";

// Content Pipeline
export {
  // Content types
  type EngineName,
  type EngineEventType,
  type EngineEvent,
  type WinRecord,
  type ContentPrimaryGoal,
  type ContentNarrativeAngle,
  type ContentAudience,
  type ContentTimeScope,
  type ContentLength,
  type AutomatedChannel,
  type ApprovalChannel,
  type ContentChannel,
  type ContentCTA,
  type MarketContext,
  type ContentBrief,
  type ContentSEO,
  type ContentArticle,
  type DistributionPacket,
  type RSSEntry,
  type EmailDigest,
  type DistributionAttempt,
  type ContentMetrics,
} from "./types/content.js";

// Content workflows
export {
  generateContentBriefsDaily,
  materializeContentFromBriefs,
} from "./workflows/content.js";

// Distribution service
export {
  DistributionService,
  getDistributionService,
  type DistributionConfig,
  type DistributionResult,
} from "./distribution/index.js";

// Content Recycling Engine
export {
  ContentRecycler,
  getContentRecycler,
  createContentRecycler,
  type RecyclingConfig,
  type RecycledContent,
} from "./recycling/index.js";

// SDK (Phase 9E)
export {
  // Client
  IntegrationHubSDK,
  SDKError,
  createSDK,

  // Config
  SDKConfigSchema,
  type SDKConfig,

  // Resource types
  PipelineStepSchema as SDKPipelineStepSchema,
  type PipelineStep as SDKPipelineStep,
  PipelineSchema,
  type Pipeline as SDKPipeline,
  ExecutionStatusSchema,
  type ExecutionStatus,
  ExecutionSchema,
  type Execution as SDKExecution,
  ScheduleSchema as SDKScheduleSchema,
  type Schedule as SDKSchedule,
  BudgetSchema,
  type Budget as SDKBudget,
  WebhookSchema,
  type Webhook as SDKWebhook,
  AnalyticsSummarySchema,
  type AnalyticsSummary as SDKAnalyticsSummary,
  QueueJobSchema,
  type QueueJob as SDKQueueJob,
  OrganizationSchema as SDKOrganizationSchema,
  type Organization as SDKOrganization,
  MemberSchema,
  type Member as SDKMember,
  AuditEventSchema as SDKAuditEventSchema,
  type AuditEvent as SDKAuditEvent,

  // Input types
  CreatePipelineInputSchema,
  type CreatePipelineInput,
  ExecutePipelineInputSchema,
  type ExecutePipelineInput,
  CreateScheduleInputSchema,
  type CreateScheduleInput,
  CreateBudgetInputSchema,
  type CreateBudgetInput,
  CreateWebhookInputSchema,
  type CreateWebhookInput,
  CreateQueueJobInputSchema,
  type CreateQueueJobInput,
  InviteMemberInputSchema,
  type InviteMemberInput,
} from "./sdk/index.js";

// Performance (Phase 9F)
export {
  // Manager
  PerformanceManager,
  getPerformanceManager,
  createPerformanceManager,

  // Metric types
  MetricTypeSchema,
  type MetricType,
  MetricUnitSchema,
  type MetricUnit,
  MetricSchema,
  type Metric,

  // Trace & Span
  SpanStatusSchema,
  type SpanStatus,
  SpanSchema,
  type Span,
  TraceSchema,
  type Trace,

  // Summary
  LatencyPercentilesSchema,
  type LatencyPercentiles,
  ServiceStatsSchema,
  type ServiceStats,
  EndpointStatsSchema,
  type EndpointStats,
  PipelineStatsSchema,
  type PipelineStats,
  SystemHealthSchema,
  type SystemHealth,
  PerformanceSummarySchema,
  type PerformanceSummary,

  // Time Series
  TimeSeriesPointSchema,
  type TimeSeriesPoint,
  TimeSeriesSchema,
  type TimeSeries,

  // Alerts
  AlertSeveritySchema,
  type AlertSeverity as PerformanceAlertSeverity,
  AlertStatusSchema,
  type AlertStatus as PerformanceAlertStatus,
  AlertRuleSchema,
  type AlertRule,
  AlertSchema,
  type Alert as PerformanceAlert,

  // Config
  PerformanceConfigSchema,
  type PerformanceConfig,

  // Events
  type PerformanceEvents,

  // Constants
  DEFAULT_ALERT_RULES,
} from "./performance/index.js";

// Intelligence (Phase 10)
export {
  // Engine
  SuggestionEngine,
  getSuggestionEngine,
  createSuggestionEngine,

  // Suggestion types
  SuggestionTypeSchema,
  type SuggestionType,
  SuggestionPrioritySchema,
  type SuggestionPriority,
  SuggestionStatusSchema,
  type SuggestionStatus,
  SuggestionSchema,
  type Suggestion,

  // Similar pipeline
  SimilarPipelineSchema,
  type SimilarPipeline,

  // Optimization
  OptimizationCategorySchema,
  type OptimizationCategory,
  OptimizationSchema,
  type Optimization,

  // Error patterns & auto-fix
  ErrorPatternSchema,
  type ErrorPattern,
  AutoFixSchema,
  type AutoFix,

  // Analysis
  PipelineAnalysisSchema,
  type PipelineAnalysis,

  // Config
  IntelligenceConfigSchema,
  type IntelligenceConfig,

  // Events
  type IntelligenceEvents,

  // Constants
  OPTIMIZATION_TEMPLATES,
  COMMON_ERROR_PATTERNS,

  // Anomaly Detector
  AnomalyDetector,
  getAnomalyDetector,
  createAnomalyDetector,
  AnomalyTypeSchema,
  type AnomalyType,
  AnomalySeveritySchema,
  type AnomalySeverity,
  AnomalyStatusSchema,
  type AnomalyStatus,
  AnomalySchema,
  type Anomaly,
  IncidentSchema,
  type Incident,
  AnomalyDetectorConfigSchema,
  type AnomalyDetectorConfig,
  type AnomalyDetectorEvents,

  // Natural Language Builder
  NLBuilder,
  getNLBuilder,
  createNLBuilder,
  NLRequestSchema,
  type NLRequest,
  GeneratedStepSchema,
  type GeneratedStep,
  GeneratedPipelineSchema,
  type GeneratedPipeline,
  RefinementSchema,
  type Refinement,
  ConversationMessageSchema,
  type ConversationMessage,
  BuilderSessionSchema,
  type BuilderSession,
  NLBuilderConfigSchema,
  type NLBuilderConfig,
  type NLBuilderEvents,

  // Predictive Analytics
  PredictiveAnalytics,
  getPredictiveAnalytics,
  createPredictiveAnalytics,
  PredictionTypeSchema,
  type PredictionType,
  PredictionConfidenceSchema,
  type PredictionConfidence,
  PredictionSchema,
  type Prediction,
  ForecastSchema,
  type Forecast,
  CapacityPlanSchema,
  type CapacityPlan,
  UsageTrendSchema,
  type UsageTrend,
  PredictiveAnalyticsConfigSchema,
  type PredictiveAnalyticsConfig,
  type PredictiveAnalyticsEvents,
} from "./intelligence/index.js";

// Git Integration (Phase 11A)
export {
  // Manager
  GitManager,
  getGitManager,
  createGitManager,

  // Provider types
  GitProviderSchema,
  type GitProvider,

  // Repository Config
  RepoConfigSchema,
  CreateRepoConfigSchema,
  type RepoConfig,
  type CreateRepoConfig,

  // Pipeline YAML Format
  PipelineYAMLStepSchema,
  PipelineYAMLSchema,
  type PipelineYAMLStep,
  type PipelineYAML,

  // Sync Status
  SyncStatusSchema,
  SyncRecordSchema,
  type SyncStatus,
  type SyncRecord,

  // Webhooks
  GitWebhookEventSchema,
  type GitWebhookEvent,

  // Changes
  FileChangeSchema,
  PipelineChangeSchema,
  type FileChange,
  type PipelineChange,

  // PRs
  PipelinePRSchema,
  type PipelinePR,

  // Config
  GitManagerConfigSchema,
  type GitManagerConfig,

  // YAML Parser
  parsePipelineYAML,
  stringifyPipelineYAML,
  yamlToInternal,
  internalToYAML,
  validatePipelineYAML,
  generatePipelineDiff,
  EXAMPLE_PIPELINES,
  type ParseResult,
  type InternalPipeline,
  type InternalPipelineStep,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,

  // Events
  type GitEvents,
} from "./git/index.js";

// Chat Integration (Phase 11B)
export {
  // Manager
  ChatManager,
  getChatManager,
  createChatManager,

  // Platform types
  ChatPlatformSchema,
  type ChatPlatform,
  ConnectionStatusSchema,
  type ConnectionStatus,

  // Credentials
  SlackCredentialsSchema,
  type SlackCredentials,
  DiscordCredentialsSchema,
  type DiscordCredentials,
  TelegramCredentialsSchema,
  type TelegramCredentials,
  TeamsCredentialsSchema,
  type TeamsCredentials,
  ChatCredentialsSchema,
  type ChatCredentials,

  // Channel & User
  ChatChannelSchema,
  type ChatChannel,
  ChatUserSchema,
  type ChatUser,

  // Messages
  MessageAttachmentSchema,
  type MessageAttachment,
  MessageBlockSchema,
  type MessageBlock,
  ChatMessageSchema,
  type ChatMessage,
  SendMessageOptionsSchema,
  type SendMessageOptions,

  // Commands & Interactions
  SlashCommandSchema,
  type SlashCommand,
  CommandInvocationSchema,
  type CommandInvocation,
  ButtonInteractionSchema,
  type ButtonInteraction,

  // Notifications
  NotificationTypeSchema,
  type NotificationType,
  NotificationTemplateSchema,
  type NotificationTemplate,
  NotificationConfigSchema,
  type NotificationConfig,

  // Bot Configuration
  BotConfigSchema,
  type BotConfig,
  ChatManagerConfigSchema,
  type ChatManagerConfig,

  // Events
  type ChatEvents,

  // Constants
  DEFAULT_NOTIFICATION_TEMPLATES,
} from "./chat/index.js";

// Terraform Integration (Phase 11C)
export {
  // Manager
  TerraformManager,
  getTerraformManager,
  createTerraformManager,

  // Resource Types
  TerraformResourceTypeSchema,
  type TerraformResourceType,

  // Provider Config
  ProviderConfigSchema,
  type ProviderConfig as TerraformProviderConfig,

  // Resources
  PipelineStepResourceSchema,
  type PipelineStepResource,
  PipelineResourceSchema,
  type PipelineResource as TerraformPipelineResource,
  ScheduleResourceSchema,
  type ScheduleResource,
  WebhookResourceSchema,
  type WebhookResource,
  BudgetResourceSchema,
  type BudgetResource,
  NotificationResourceSchema,
  type NotificationResource,
  PluginResourceSchema,
  type PluginResource,

  // State Management
  ResourceStateSchema,
  type ResourceState,
  TerraformStateSchema,
  type TerraformState,

  // Plan & Apply
  ResourceChangeTypeSchema,
  type ResourceChangeType,
  ResourceChangeSchema,
  type ResourceChange,
  TerraformPlanSchema,
  type TerraformPlan,
  ApplyResultSchema,
  type ApplyResult as TerraformApplyResult,
  TerraformApplyResultSchema,
  type TerraformApplyResult as TerraformFullApplyResult,

  // HCL
  HCLBlockSchema,
  type HCLBlock,
  HCLConfigSchema,
  type HCLConfig,

  // Config
  TerraformManagerConfigSchema,
  type TerraformManagerConfig,

  // Events
  type TerraformEvents,

  // Examples
  EXAMPLE_TERRAFORM_CONFIG,
} from "./terraform/index.js";

// VS Code Extension (Phase 11D)
export {
  // Manager
  VSCodeManager,
  getVSCodeManager,
  createVSCodeManager,

  // Extension State
  ExtensionStateSchema,
  type ExtensionState,

  // Configuration
  ExtensionConfigSchema,
  type ExtensionConfig,

  // Tree View
  TreeItemTypeSchema,
  type TreeItemType,
  TreeItemStateSchema,
  type TreeItemState,
  TreeItemSchema,
  type TreeItem,

  // Editor
  EditorTypeSchema,
  type EditorType,
  EditorStateSchema,
  type EditorState,

  // Diagnostics
  DiagnosticSeveritySchema,
  type DiagnosticSeverity as VSCodeDiagnosticSeverity,
  DiagnosticSchema,
  type Diagnostic as VSCodeDiagnostic,

  // Commands
  CommandSchema,
  type Command as VSCodeCommand,

  // Status Bar
  StatusBarItemSchema,
  type StatusBarItem,

  // Quick Pick
  QuickPickItemSchema,
  type QuickPickItem,

  // Notifications
  NotificationTypeSchema as VSCodeNotificationTypeSchema,
  type VSCodeNotificationType,
  NotificationActionSchema,
  type NotificationAction,
  VSCodeNotificationSchema,
  type VSCodeNotification,

  // Webview
  WebviewTypeSchema,
  type WebviewType,
  WebviewMessageSchema,
  type WebviewMessage,
  WebviewStateSchema,
  type WebviewState,

  // Completion
  CompletionItemKindSchema,
  type CompletionItemKind,
  CompletionItemSchema,
  type CompletionItem,

  // Hover
  HoverContentSchema,
  type HoverContent,

  // Code Actions
  CodeActionKindSchema,
  type CodeActionKind,
  CodeActionSchema,
  type CodeAction,

  // Config
  VSCodeManagerConfigSchema,
  type VSCodeManagerConfig,

  // Events
  type VSCodeEvents,

  // Constants
  DEFAULT_COMMANDS,
  PIPELINE_SNIPPETS,
} from "./vscode/index.js";

// High Availability (Phase 12A)
export {
  // HA Manager
  HAManager,
  getHAManager,
  createHAManager,
  DEFAULT_HA_CONFIG,

  // Health Checker
  HealthChecker,
  getHealthChecker,
  createHealthChecker,

  // Load Balancer
  LoadBalancer,
  getLoadBalancer,
  createLoadBalancer,

  // Failover Manager
  FailoverManager,
  getFailoverManager,
  createFailoverManager,

  // Region types
  RegionSchema,
  type Region,
  RegionStatusSchema,
  type RegionStatus,
  RegionConfigSchema,
  type RegionConfig,

  // Health Check types
  HealthCheckTypeSchema,
  type HealthCheckType,
  HealthCheckResultSchema,
  type HealthCheckResult,
  HealthCheckConfigSchema,
  type HealthCheckConfig,

  // Load Balancing types
  LoadBalanceStrategySchema,
  type LoadBalanceStrategy,
  RouteDecisionSchema,
  type RouteDecision,

  // Failover types
  FailoverModeSchema,
  type FailoverMode,
  FailoverEventSchema,
  type FailoverEvent,
  FailoverConfigSchema,
  type FailoverConfig,

  // Replication types
  ReplicationModeSchema,
  type ReplicationMode,
  ReplicationStatusSchema,
  type ReplicationStatus,
  ReplicationConfigSchema,
  type ReplicationConfig,

  // Session Affinity
  SessionAffinitySchema,
  type SessionAffinity,

  // Manager Config
  HAManagerConfigSchema,
  type HAManagerConfig,

  // State
  HAStateSchema,
  type HAState,

  // Events
  type HAEvents,

  // Constants
  REGION_DISPLAY_NAMES,
  DEFAULT_HEALTH_CHECK_CONFIG,
  DEFAULT_FAILOVER_CONFIG,
} from "./ha/index.js";

// Reliability (Phase 12)
export {
  // Circuit Breaker (12A)
  CircuitBreaker,
  CircuitBreakerRegistry,
  CircuitOpenError,
  getCircuitBreakerRegistry,
  createCircuitBreakerRegistry,
  createCircuitBreaker,
  CircuitStateSchema,
  type CircuitState,
  CircuitBreakerConfigSchema,
  type CircuitBreakerConfig,
  CircuitStatsSchema,
  type CircuitStats,
  CircuitBreakerStateSchema,
  type CircuitBreakerState,

  // Retry Strategy (12B)
  RetryStrategy,
  RetryExhaustedError,
  createRetryStrategy,
  withRetry,
  retryWithBackoff,
  DEFAULT_RETRY_STRATEGIES,
  RetryStrategyTypeSchema,
  type RetryStrategyType,
  RetryConfigSchema,
  type RetryConfig,
  RetryAttemptSchema,
  type RetryAttempt,
  RetryResultSchema,
  type RetryResult,

  // Timeout Manager (12C)
  TimeoutManager,
  TimeoutError,
  getTimeoutManager,
  createTimeoutManager,
  withTimeout,
  raceWithTimeout,
  TIMEOUT_PRESETS,
  TimeoutConfigSchema,
  type TimeoutConfig,
  TimeoutContextSchema,
  type TimeoutContext,
  TimeoutResultSchema,
  type TimeoutResult,

  // Health Aggregator (12D)
  HealthAggregator,
  HealthCheckError,
  getHealthAggregator,
  createHealthAggregator,
  HealthStatusSchema,
  type HealthStatus as ReliabilityHealthStatus,
  HealthCheckTypeSchema as ReliabilityHealthCheckTypeSchema,
  type HealthCheckType as ReliabilityHealthCheckType,
  ServiceHealthSchema,
  type ServiceHealth,
  DependencySchema,
  type Dependency,
  HealthAggregatorConfigSchema,
  type HealthAggregatorConfig,
  AggregatedHealthSchema,
  type AggregatedHealth,
  HealthHistoryEntrySchema,
  type HealthHistoryEntry,

  // Manager Config
  ReliabilityManagerConfigSchema,
  type ReliabilityManagerConfig,

  // Events
  type CircuitBreakerEvents,
  type RetryEvents,
  type TimeoutEvents,
  type HealthEvents,
  type ReliabilityEvents,
} from "./reliability/index.js";

// Disaster Recovery (Phase 12B)
export {
  // Backup Manager
  BackupManager,
  getBackupManager,
  createBackupManager,

  // Restore Manager
  RestoreManager,
  getRestoreManager,
  createRestoreManager,

  // Backup types
  BackupTypeSchema,
  type BackupType,
  BackupStatusSchema,
  type BackupStatus,
  BackupStorageSchema,
  type BackupStorage,

  // Configuration
  BackupScheduleSchema,
  type BackupSchedule,
  StorageConfigSchema,
  type StorageConfig as DRStorageConfig,

  // Manifest
  BackupItemSchema,
  type BackupItem,
  BackupManifestSchema,
  type BackupManifest,

  // Restore types
  RestoreStatusSchema,
  type RestoreStatus,
  RestoreModeSchema,
  type RestoreMode,
  RestoreOptionsSchema,
  type RestoreOptions,
  RestoreProgressSchema,
  type RestoreProgress,

  // Point in Time Recovery
  WALEntrySchema,
  type WALEntry,
  RecoveryPointSchema,
  type RecoveryPoint,

  // Verification
  VerificationStatusSchema,
  type VerificationStatus,
  VerificationResultSchema,
  type VerificationResult,

  // Config & State
  DRManagerConfigSchema,
  type DRManagerConfig,
  DRStateSchema,
  type DRState,

  // Events
  type DREvents,

  // Constants
  DEFAULT_BACKUP_SCHEDULE,
  BACKUP_RESOURCES,
  type BackupResource,
} from "./dr/index.js";

// Observability (Phase 12D)
export {
  // Manager
  ObservabilityManager,
  getObservabilityManager,
  createObservabilityManager,

  // Tracer
  Tracer as OTelTracer,
  SpanBuilder,
  getTracer as getOTelTracer,
  createTracer as createOTelTracer,
  generateTraceId,
  generateSpanId,
  type SpanOptions,

  // Metrics
  MetricsCollector,
  Counter,
  Gauge,
  Histogram,
  getMetricsCollector,
  createMetricsCollector,

  // Logger (structured)
  Logger as StructuredLogger,
  getLogger as getStructuredLogger,
  createLogger as createStructuredLogger,

  // Trace Context
  TraceContextSchema as OTelTraceContextSchema,
  type TraceContext as OTelTraceContext,

  // Span types
  SpanStatusCodeSchema,
  type SpanStatusCode,
  SpanStatusSchema as OTelSpanStatusSchema,
  type SpanStatus as OTelSpanStatus,
  SpanKindSchema as OTelSpanKindSchema,
  type SpanKind as OTelSpanKind,
  SpanEventSchema as OTelSpanEventSchema,
  type SpanEvent as OTelSpanEvent,
  SpanLinkSchema as OTelSpanLinkSchema,
  type SpanLink as OTelSpanLink,
  SpanSchema as OTelSpanSchema,
  type Span as OTelSpan,
  TraceSchema as OTelTraceSchema,
  type Trace as OTelTrace,

  // Metric types
  MetricTypeSchema as OTelMetricTypeSchema,
  type MetricType as OTelMetricType,
  MetricUnitSchema as OTelMetricUnitSchema,
  type MetricUnit as OTelMetricUnit,
  MetricPointSchema,
  type MetricPoint,
  HistogramBucketsSchema,
  type HistogramBuckets,
  MetricDefinitionSchema,
  type MetricDefinition,
  MetricDataSchema,
  type MetricData,

  // Log types
  LogSeveritySchema,
  type LogSeverity,
  LogRecordSchema,
  type LogRecord,

  // Exporters & Samplers
  ExporterTypeSchema as OTelExporterTypeSchema,
  type ExporterType as OTelExporterType,
  ExporterConfigSchema as OTelExporterConfigSchema,
  type ExporterConfig as OTelExporterConfig,
  SamplerTypeSchema as OTelSamplerTypeSchema,
  type SamplerType as OTelSamplerType,
  SamplerConfigSchema as OTelSamplerConfigSchema,
  type SamplerConfig as OTelSamplerConfig,

  // Configuration
  ObservabilityConfigSchema,
  type ObservabilityConfig,

  // Queries
  TraceQuerySchema as OTelTraceQuerySchema,
  type TraceQuery as OTelTraceQuery,
  MetricQuerySchema as OTelMetricQuerySchema,
  type MetricQuery as OTelMetricQuery,
  LogQuerySchema,
  type LogQuery,

  // Summary
  TraceSummarySchema,
  type TraceSummary,
  MetricsSummarySchema,
  type MetricsSummary,
  ObservabilitySummarySchema,
  type ObservabilitySummary,

  // Events
  type ObservabilityEvents,

  // Constants
  BUILTIN_METRICS,
  SPAN_ATTRIBUTES,
} from "./observability/index.js";

// =============================================================================
// Phase 13: Security & Secrets
// =============================================================================

// Secrets Management (13A)
export {
  // Provider Types
  SecretProviderSchema,
  type SecretProvider,

  // Provider Configs
  EnvProviderConfigSchema,
  type EnvProviderConfig,
  VaultProviderConfigSchema,
  type VaultProviderConfig,
  AWSProviderConfigSchema,
  type AWSProviderConfig,
  AzureProviderConfigSchema,
  type AzureProviderConfig,
  GCPProviderConfigSchema,
  type GCPProviderConfig,

  // Secret Types
  SecretMetadataSchema,
  type SecretMetadata,
  SecretEntrySchema,
  type SecretEntry,
  SecretLeaseSchema,
  type SecretLease,
  SecretPolicySchema,
  type SecretPolicy,
  RotationConfigSchema,
  type RotationConfig,

  // Manager
  SecretsManagerConfigSchema,
  type SecretsManagerConfig,
  SecretsManager,
  SecretNotFoundError,
  SecretAccessDeniedError,
  SecretProviderError,
  getSecretsManager,
  createSecretsManager,

  // Events & Constants
  type SecretsEvents,
  SECRET_REFERENCE_PATTERN,
} from "./secrets/index.js";

// Rate Limiting (13B)
export {
  // Algorithms
  RateLimitAlgorithmSchema,
  type RateLimitAlgorithm,

  // Algorithm Configs
  TokenBucketConfigSchema,
  type TokenBucketConfig,
  SlidingWindowConfigSchema,
  type SlidingWindowConfig,
  FixedWindowConfigSchema,
  type FixedWindowConfig,
  LeakyBucketConfigSchema,
  type LeakyBucketConfig,
  AlgorithmConfigSchema,
  type AlgorithmConfig,

  // Rules
  RateLimitRuleSchema,
  type RateLimitRule,

  // Request/Result
  RateLimitRequestSchema,
  type RateLimitRequest,
  RateLimitResultSchema,
  type RateLimitResult,

  // State
  TokenBucketStateSchema,
  type TokenBucketState,
  SlidingWindowStateSchema,
  type SlidingWindowState,
  FixedWindowStateSchema,
  type FixedWindowState,
  LeakyBucketStateSchema,
  type LeakyBucketState,
  LimiterStateSchema,
  type LimiterState,

  // Stats & Config
  RateLimitStatsSchema,
  type RateLimitStats,
  RateLimiterConfigSchema,
  type RateLimiterConfig,

  // Distributed
  DistributedSyncSchema,
  type DistributedSync,

  // Manager
  RateLimiter,
  RateLimiterRegistry,
  RateLimitExceededError,
  getRateLimiterRegistry,
  createRateLimiterRegistry,
  createRateLimiter,
  withRateLimit,
  RATE_LIMIT_PRESETS,

  // Events & Interfaces
  type RateLimitEvents,
  type RateLimitStorage,
  type RateLimitQueue,
} from "./ratelimit/index.js";

// API Authentication (13C)
export {
  // Auth Methods
  AuthMethodSchema,
  type AuthMethod,

  // API Key
  ApiKeyLocationSchema,
  type ApiKeyLocation,
  ApiKeyConfigSchema,
  type ApiKeyConfig,
  ApiKeySchema,
  type ApiKey,

  // JWT
  JwtAlgorithmSchema,
  type JwtAlgorithm,
  JwtConfigSchema,
  type JwtConfig,
  JwtPayloadSchema,
  type JwtPayload,

  // OAuth2
  OAuth2GrantTypeSchema,
  type OAuth2GrantType,
  OAuth2ConfigSchema,
  type OAuth2Config,
  OAuth2TokenSchema,
  type OAuth2Token,

  // Basic Auth
  BasicAuthConfigSchema,
  type BasicAuthConfig,
  BasicCredentialsSchema,
  type BasicCredentials,

  // Bearer & Custom
  BearerConfigSchema,
  type BearerConfig,
  CustomAuthConfigSchema,
  type CustomAuthConfig,

  // Combined Config
  ApiAuthConfigSchema,
  type ApiAuthConfig,

  // Request/Result
  ApiAuthRequestSchema,
  type ApiAuthRequest,
  ApiAuthResultSchema,
  type ApiAuthResult,

  // Token & Session
  StoredTokenSchema,
  type StoredToken,
  ApiSessionSchema,
  type ApiSession,

  // Manager Config
  ApiAuthManagerConfigSchema,
  type ApiAuthManagerConfig,

  // Audit
  ApiAuthAuditEntrySchema,
  type ApiAuthAuditEntry,

  // Manager
  ApiAuthManager,
  AuthenticationError,
  TokenExpiredError,
  TokenRevokedError,
  InvalidCredentialsError,
  getApiAuthManager,
  createApiAuthManager,

  // Events & Interfaces
  type ApiAuthEvents,
  type ApiAuthProvider,
  type ApiAuthStorage,
} from "./apiauth/index.js";

// Security Headers (13D)
export {
  // CSP
  CSPDirectiveSchema,
  type CSPDirective,
  CSPSourceSchema,
  type CSPSource,
  CSPConfigSchema,
  type CSPConfig,

  // CORS
  CORSConfigSchema,
  type CORSConfig,

  // HSTS
  HSTSConfigSchema,
  type HSTSConfig,

  // Frame Options
  FrameOptionsSchema,
  type FrameOptions,
  FrameOptionsConfigSchema,
  type FrameOptionsConfig,

  // Content Type Options
  ContentTypeOptionsConfigSchema,
  type ContentTypeOptionsConfig,

  // Referrer Policy
  ReferrerPolicySchema,
  type ReferrerPolicy,
  ReferrerPolicyConfigSchema,
  type ReferrerPolicyConfig,

  // Permissions Policy
  PermissionsPolicyFeatureSchema,
  type PermissionsPolicyFeature,
  PermissionsPolicyConfigSchema,
  type PermissionsPolicyConfig,

  // Cross-Origin Policies
  CrossOriginOpenerPolicySchema,
  type CrossOriginOpenerPolicy,
  CrossOriginEmbedderPolicySchema,
  type CrossOriginEmbedderPolicy,
  CrossOriginResourcePolicySchema,
  type CrossOriginResourcePolicy,
  CrossOriginPoliciesConfigSchema,
  type CrossOriginPoliciesConfig,

  // Cache Control
  CacheControlConfigSchema,
  type CacheControlConfig,

  // Custom & Remove Headers
  CustomHeaderSchema,
  type CustomHeader,
  RemoveHeadersConfigSchema,
  type RemoveHeadersConfig,

  // Main Config
  SecurityHeadersConfigSchema,
  type SecurityHeadersConfig,

  // Request/Response
  SecurityRequestSchema,
  type SecurityRequest,
  SecurityResponseSchema,
  type SecurityResponse,

  // Path & Manager Config
  PathConfigSchema,
  type PathConfig,
  SecurityManagerConfigSchema,
  type SecurityManagerConfig,

  // Manager
  SecurityHeadersManager,
  getSecurityHeadersManager,
  createSecurityHeadersManager,
  SECURITY_PRESETS,
  CSPBuilder,
  csp,

  // Events
  type SecurityHeadersEvents,
} from "./security/index.js";

// =============================================================================
// Phase 14: Observability
// =============================================================================

// OpenTelemetry (14A)
export {
  // Trace Context
  TraceIdSchema,
  type TraceId,
  SpanIdSchema,
  type SpanId,
  TraceFlagsSchema,
  type TraceFlags,
  TraceContextSchema,
  type TraceContext,

  // Span Status & Kind
  SpanStatusCodeSchema as TelemetrySpanStatusCodeSchema,
  type SpanStatusCode as TelemetrySpanStatusCode,
  SpanStatusSchema as TelemetrySpanStatusSchema,
  type SpanStatus as TelemetrySpanStatus,
  SpanKindSchema,
  type SpanKind,

  // Attributes
  AttributeValueSchema,
  type AttributeValue,
  AttributesSchema,
  type Attributes,

  // Span Components
  SpanEventSchema,
  type SpanEvent,
  SpanLinkSchema,
  type SpanLink,
  SpanSchema as TelemetrySpanSchema,
  type Span as TelemetrySpan,

  // Resource & Scope
  ResourceSchema,
  type Resource as TelemetryResource,
  InstrumentationScopeSchema,
  type InstrumentationScope,

  // Sampler
  SamplerTypeSchema,
  type SamplerType,
  SamplerConfigSchema,
  type SamplerConfig,

  // Exporter
  ExporterTypeSchema,
  type ExporterType,
  ExporterConfigSchema,
  type ExporterConfig,

  // Processor
  ProcessorTypeSchema,
  type ProcessorType,
  BatchProcessorConfigSchema,
  type BatchProcessorConfig,

  // Propagator
  PropagatorTypeSchema,
  type PropagatorType,

  // Tracer Config
  TracerConfigSchema,
  type TracerConfig,

  // Baggage
  BaggageEntrySchema,
  type BaggageEntry,
  BaggageSchema,
  type Baggage,

  // Context
  ContextCarrierSchema,
  type ContextCarrier,
  SpanOptionsSchema as TelemetrySpanOptionsSchema,
  type SpanOptions as TelemetrySpanOptions,

  // Tracer
  Tracer as TelemetryTracer,
  getTracer,
  createTracer,
  traced,
  withSpan,
  withSpanAsync,

  // Events
  type TelemetryEvents,

  // Semantic Conventions
  HTTP_ATTRIBUTES,
  DB_ATTRIBUTES,
  RPC_ATTRIBUTES,
  MESSAGING_ATTRIBUTES,
  ERROR_ATTRIBUTES,
  SERVICE_ATTRIBUTES,
} from "./telemetry/index.js";

// Log Aggregator (14B)
export {
  // Log Levels
  LogLevelSchema,
  type LogLevel,
  LOG_LEVEL_VALUES,

  // Log Entry
  LogEntrySchema,
  type LogEntry,

  // Transport Types
  TransportTypeSchema,
  type TransportType,

  // Transport Configs
  ConsoleTransportConfigSchema,
  type ConsoleTransportConfig,
  FileTransportConfigSchema,
  type FileTransportConfig,
  HttpTransportConfigSchema,
  type HttpTransportConfig,
  MemoryTransportConfigSchema,
  type MemoryTransportConfig,
  ElasticsearchTransportConfigSchema,
  type ElasticsearchTransportConfig,
  LokiTransportConfigSchema,
  type LokiTransportConfig,
  TransportConfigSchema,
  type TransportConfig,

  // Formatter
  FormatterTypeSchema,
  type FormatterType,
  FormatterConfigSchema,
  type FormatterConfig,

  // Filter
  LogFilterSchema,
  type LogFilter,

  // Sampling
  SamplingConfigSchema as LogSamplingConfigSchema,
  type SamplingConfig as LogSamplingConfig,

  // Redaction
  RedactionConfigSchema,
  type RedactionConfig,

  // Aggregator Config
  LogAggregatorConfigSchema,
  type LogAggregatorConfig,

  // Query & Stats
  LogAggregatorQuerySchema,
  type LogAggregatorQuery,
  LogStatsSchema,
  type LogStats,

  // Aggregator
  LogAggregator,
  Logger as LogAggregatorLogger,
  getLogAggregator,
  createLogAggregator,

  // Events & Interface
  type LoggingEvents,
  type LogTransport,
} from "./logging/index.js";

// Metrics Registry (14C)
export {
  // Metric Kinds
  MetricKindSchema,
  type MetricKind,

  // Metric Definition
  MetricDefSchema,
  type MetricDef,

  // Label Config
  LabelConfigSchema,
  type LabelConfig,

  // Bucket Config
  BucketConfigSchema,
  type BucketConfig,

  // Quantile Config
  QuantileConfigSchema,
  type QuantileConfig,

  // Metric Sample
  MetricSampleSchema,
  type MetricSample,

  // Counter Metric
  CounterMetricSchema,
  type CounterMetric,

  // Gauge Metric
  GaugeMetricSchema,
  type GaugeMetric,

  // Histogram Metric
  HistogramMetricSchema,
  type HistogramMetric,

  // Summary Metric
  SummaryMetricSchema,
  type SummaryMetric,

  // Combined Metric
  MetricSchema as MetricsMetricSchema,
  type Metric as MetricsMetric,

  // Registry Config
  MetricsRegistryConfigSchema,
  type MetricsRegistryConfig,

  // Export Format
  ExportFormatSchema,
  type ExportFormat,

  // Push Gateway Config
  PushGatewayConfigSchema,
  type PushGatewayConfig,

  // Collector Config
  CollectorConfigSchema,
  type CollectorConfig,

  // Metric Classes
  Counter as MetricsCounter,
  Gauge as MetricsGauge,
  Histogram as MetricsHistogram,
  Summary as MetricsSummaryCollector,

  // Registry
  MetricsRegistry,
  getMetricsRegistry,
  createMetricsRegistry,

  // Events
  type MetricsEvents,

  // Presets
  DEFAULT_BUCKETS,
  DEFAULT_QUANTILES,
  DEFAULT_METRICS,
  HTTP_METRICS,
  DB_METRICS,
  CACHE_METRICS,
} from "./metrics/index.js";

// SLO Manager (14D)
export {
  // SLI Types
  SLITypeSchema,
  type SLIType,
  SLIMetricSourceSchema,
  type SLIMetricSource,
  SLIConfigSchema,
  type SLIConfig,
  SLIMeasurementSchema,
  type SLIMeasurement,

  // SLO Window
  SLOWindowTypeSchema,
  type SLOWindowType,
  SLOWindowSchema,
  type SLOWindow,

  // SLO Target
  SLOTargetSchema,
  type SLOTarget,

  // SLO Status
  SLOStatusSchema,
  type SLOStatus,

  // SLO Definition
  SLODefinitionSchema,
  type SLODefinition,

  // Error Budget
  ErrorBudgetSchema,
  type ErrorBudget,
  BurnRateAlertSchema,
  type BurnRateAlert,

  // SLO State & History
  SLOStateSchema,
  type SLOState,
  SLOHistoryEntrySchema,
  type SLOHistoryEntry,

  // Reports
  SLOReportPeriodSchema,
  type SLOReportPeriod,
  SLOReportSchema,
  type SLOReport,
  SLOSummarySchema,
  type SLOSummary,

  // Alerts
  SLOAlertTypeSchema,
  type SLOAlertType,
  SLOAlertSchema,
  type SLOAlert,

  // Config
  SLOManagerConfigSchema,
  type SLOManagerConfig,

  // Manager
  SLOManager,
  getSLOManager,
  createSLOManager,

  // Events & Interfaces
  type SLOEvents,
  type SLOStorage,
  type SLIMetricProvider,

  // Presets
  SLO_PRESETS,
  BURN_RATE_PRESETS,
} from "./slo/index.js";

// =============================================================================
// Phase 15: Deployment & Operations
// =============================================================================

// Feature Flags (15A)
export {
  // Flag Types
  FlagTypeSchema,
  type FlagType,
  FlagVariationSchema,
  type FlagVariation,
  FlagStatusSchema,
  type FlagStatus,

  // Operators
  OperatorSchema,
  type Operator,

  // Targeting
  TargetingConditionSchema,
  type TargetingCondition,
  TargetingRuleSchema,
  type TargetingRule,

  // Segments
  SegmentSchema as FlagSegmentSchema,
  type Segment as FlagSegment,
  SegmentRuleSchema,
  type SegmentRule,

  // Rollout
  RolloutWeightSchema,
  type RolloutWeight,
  PercentageRolloutSchema,
  type PercentageRollout,

  // Scheduled
  ScheduledChangeSchema,
  type ScheduledChange,

  // Flag Definition
  FlagDefinitionSchema,
  type FlagDefinition,

  // Evaluation
  EvaluationContextSchema,
  type EvaluationContext,
  EvaluationReasonSchema,
  type EvaluationReason,
  EvaluationResultSchema,
  type EvaluationResult,

  // Analytics
  FlagEvaluationEventSchema,
  type FlagEvaluationEvent,
  FlagStatsSchema,
  type FlagStats,

  // Config
  FlagManagerConfigSchema,
  type FlagManagerConfig,

  // Manager
  FeatureFlagsManager,
  getFeatureFlagsManager,
  createFeatureFlagsManager,

  // Events & Interfaces
  type FlagEvents,
  type FlagStorage,
  type FlagProvider,

  // Helpers
  createBooleanFlag,
  createStringFlag,
  createPercentageRollout,
  createTargetingRule,
} from "./flags/index.js";

// Config Manager (15B)
export {
  // Value Types
  ConfigValueTypeSchema,
  type ConfigValueType,
  ConfigValueSchema,
  type ConfigValue,

  // Sources
  ConfigSourceTypeSchema,
  type ConfigSourceType,
  ConfigSourceSchema,
  type ConfigSource,

  // Validation
  ConfigValidationSchema,
  type ConfigValidation,

  // Definition
  ConfigDefinitionSchema,
  type ConfigDefinition,

  // Entry
  ConfigEntrySchema,
  type ConfigEntry,

  // Changes
  ConfigChangeTypeSchema,
  type ConfigChangeType,
  ConfigChangeSchema,
  type ConfigChange,

  // Snapshots
  ConfigSnapshotSchema,
  type ConfigSnapshot,

  // Environment
  EnvironmentSchema as ConfigEnvironmentSchema,
  type Environment as ConfigEnvironment,

  // Namespace
  ConfigNamespaceSchema,
  type ConfigNamespace,

  // Watch
  type WatchCallback,
  WatchOptionsSchema,
  type WatchOptions,

  // Validation Result
  ConfigValidationResultSchema,
  type ConfigValidationResult,

  // Config
  ConfigManagerConfigSchema,
  type ConfigManagerConfig,

  // Manager
  ConfigManager,
  getConfigManager,
  createConfigManager,

  // Events & Interfaces
  type ConfigEvents,
  type ConfigStorage,
  type ConfigSourceProvider,

  // Constants
  DEFAULT_ENVIRONMENTS,
  CONFIG_CATEGORIES,
  type ConfigCategory,
} from "./config/index.js";

// Multi-Region (15C)
export {
  // Region Types
  RegionIdSchema,
  type RegionId,
  RegionStatusSchema as MultiRegionStatusSchema,
  type MultiRegionStatus,
  RegionRoleSchema,
  type RegionRole,
  RegionDefinitionSchema,
  type RegionDefinition,

  // Replication
  ReplicationModeSchema as MultiRegionReplicationModeSchema,
  type MultiRegionReplicationMode,
  ConflictResolutionSchema,
  type ConflictResolution,
  ReplicationConfigSchema as MultiRegionReplicationConfigSchema,
  type MultiRegionReplicationConfig,
  ReplicationStatusSchema as MultiRegionReplicationStatusSchema,
  type MultiRegionReplicationStatus,

  // Conflicts
  ConflictSchema as MultiRegionConflictSchema,
  type MultiRegionConflict,

  // Routing
  RoutingStrategySchema,
  type RoutingStrategy,
  RoutingRuleSchema,
  type RoutingRule,
  RoutingDecisionSchema,
  type RoutingDecision,

  // Sync
  SyncOperationSchema,
  type SyncOperation,
  SyncBatchSchema,
  type SyncBatch,

  // Health
  RegionHealthSchema,
  type RegionHealth,

  // Failover
  FailoverTriggerSchema,
  type FailoverTrigger,
  FailoverEventSchema as MultiRegionFailoverEventSchema,
  type MultiRegionFailoverEvent,

  // Config
  MultiRegionConfigSchema,
  type MultiRegionConfig,

  // Manager
  MultiRegionManager,
  getMultiRegionManager,
  createMultiRegionManager,

  // Events & Interfaces
  type MultiRegionEvents,
  type MultiRegionStorage,

  // Constants
  DEFAULT_REGIONS,
  REPLICATION_LAG_THRESHOLDS,
} from "./multiregion/index.js";

// Deployment Manager (15D)
export {
  // Strategy
  DeploymentStrategySchema,
  type DeploymentStrategy,
  DeploymentStatusSchema,
  type DeploymentStatus,

  // Version & Artifact
  SemanticVersionSchema,
  type SemanticVersion,
  ArtifactTypeSchema,
  type ArtifactType,
  ArtifactSchema,
  type Artifact,

  // Environment & Target
  DeploymentEnvironmentSchema,
  type DeploymentEnvironment,
  DeploymentTargetSchema,
  type DeploymentTarget,

  // Strategy Configs
  RollingConfigSchema,
  type RollingConfig,
  BlueGreenConfigSchema,
  type BlueGreenConfig,
  CanaryConfigSchema,
  type CanaryConfig,
  StrategyConfigSchema,
  type StrategyConfig,

  // Definition
  DeploymentDefinitionSchema,
  type DeploymentDefinition,

  // State
  DeploymentPhaseSchema,
  type DeploymentPhase,
  DeploymentStateSchema,
  type DeploymentState,

  // Checks
  CheckResultSchema,
  type CheckResult,

  // Approval
  ApprovalStatusSchema,
  type ApprovalStatus,
  ApprovalSchema,
  type Approval,

  // Metrics & Analysis
  DeploymentMetricsSchema,
  type DeploymentMetrics,
  AnalysisResultSchema,
  type AnalysisResult,

  // Rollback
  RollbackReasonSchema,
  type RollbackReason,
  RollbackSchema,
  type Rollback,

  // Config
  DeploymentManagerConfigSchema,
  type DeploymentManagerConfig,

  // Manager
  DeploymentManager,
  getDeploymentManager,
  createDeploymentManager,

  // Events & Interfaces
  type DeploymentEvents,
  type DeploymentStorage,
} from "./deployment/index.js";

// =============================================================================
// Phase 16: AI Operations / MLOps
// =============================================================================

// LLM Cost Tracker (16A)
export {
  // Provider & Model Types
  LLMProviderSchema,
  type LLMProvider,
  ModelTierSchema,
  type ModelTier,
  ModelCapabilitySchema,
  type ModelCapability,
  ModelDefinitionSchema,
  type ModelDefinition,

  // Usage Tracking
  TokenUsageSchema as LLMTokenUsageSchema,
  type TokenUsage as LLMTokenUsage,
  LLMRequestSchema,
  type LLMRequest,

  // Aggregation
  AggregationPeriodSchema,
  type AggregationPeriod,
  CostAggregationSchema,
  type CostAggregation,

  // Budgets
  BudgetPeriodSchema,
  type BudgetPeriod,
  BudgetScopeSchema,
  type BudgetScope,
  BudgetDefinitionSchema,
  type BudgetDefinition,
  BudgetStatusSchema as LLMBudgetStatusSchema,
  type BudgetStatus as LLMBudgetStatus,
  BudgetStateSchema,
  type BudgetState,

  // Alerts
  CostAlertTypeSchema,
  type CostAlertType,
  CostAlertSchema,
  type CostAlert,

  // Optimization
  CostOptimizationTypeSchema,
  type CostOptimizationType,
  CostOptimizationSchema,
  type CostOptimization,

  // Reports
  CostReportTypeSchema,
  type CostReportType,
  CostReportSchema,
  type CostReport,

  // Config
  LLMCostTrackerConfigSchema,
  type LLMCostTrackerConfig,

  // Tracker
  LLMCostTracker,
  getLLMCostTracker,
  createLLMCostTracker,

  // Events & Interfaces
  type LLMCostEvents,
  type LLMCostStorage,

  // Pricing Database
  MODEL_PRICING,

  // Helpers
  calculateRequestCost,
  getPeriodBounds,
  formatCost,
  formatTokenCount,
} from "./llm/index.js";

// Token Analytics (16B)
export {
  // Token Classification
  TokenCategorySchema,
  type TokenCategory,
  TokenBreakdownSchema,
  type TokenBreakdown,

  // Efficiency
  EfficiencyMetricSchema,
  type EfficiencyMetric,
  TokenEfficiencySchema,
  type TokenEfficiency,

  // Usage Patterns
  UsagePatternTypeSchema,
  type UsagePatternType,
  UsagePatternSchema,
  type UsagePattern,

  // Anomaly Detection
  TokenAnomalyTypeSchema,
  type TokenAnomalyType,
  TokenAnomalySchema,
  type TokenAnomaly,

  // Model Comparison
  ModelComparisonSchema,
  type ModelComparison,

  // Project Analytics
  ProjectAnalyticsSchema,
  type ProjectAnalytics,

  // Time Series
  TimeGranularitySchema,
  type TimeGranularity,
  TokenTimeSeriesPointSchema,
  type TokenTimeSeriesPoint,
  TokenTimeSeriesSchema,
  type TokenTimeSeries,

  // Forecasting
  ForecastMethodSchema,
  type ForecastMethod,
  TokenForecastSchema,
  type TokenForecast,

  // Optimization
  OptimizationImpactSchema,
  type OptimizationImpact,
  TokenOptimizationSchema,
  type TokenOptimization,

  // Summary
  TokenAnalyticsSummarySchema,
  type TokenAnalyticsSummary,

  // Config
  TokenAnalyticsConfigSchema,
  type TokenAnalyticsConfig,

  // Manager
  TokenAnalyticsManager,
  getTokenAnalyticsManager,
  createTokenAnalyticsManager,

  // Events & Interfaces
  type TokenAnalyticsEvents,
  type TokenAnalyticsStorage,

  // Benchmarks & Helpers
  EFFICIENCY_BENCHMARKS,
  calculateEfficiencyRating,
  formatTokens,
  calculateTokenEfficiency,
} from "./analytics/index.js";

// Prompt Manager (16C)
export {
  // Prompt Types
  PromptTypeSchema,
  type PromptType,
  PromptStatusSchema,
  type PromptStatus,
  VariableTypeSchema,
  type VariableType,

  // Template
  PromptVariableSchema,
  type PromptVariable,
  PromptTemplateSchema,
  type PromptTemplate,

  // Versions
  PromptVersionSchema,
  type PromptVersion,

  // Execution
  PromptExecutionSchema,
  type PromptExecution,

  // A/B Testing
  ExperimentStatusSchema,
  type ExperimentStatus,
  ExperimentVariantSchema,
  type ExperimentVariant,
  ExperimentSchema,
  type Experiment,
  ExperimentResultSchema,
  type ExperimentResult,

  // Chains
  ChainStepSchema,
  type ChainStep,
  PromptChainSchema,
  type PromptChain,
  ChainExecutionSchema,
  type ChainExecution,

  // Optimization
  OptimizationGoalSchema,
  type OptimizationGoal,
  PromptOptimizationSchema,
  type PromptOptimization,

  // Collections
  PromptCollectionSchema,
  type PromptCollection,

  // Config
  PromptManagerConfigSchema,
  type PromptManagerConfig,

  // Manager
  PromptManager,
  getPromptManager,
  createPromptManager,

  // Events & Interfaces
  type PromptManagerEvents,
  type PromptStorage,

  // Helpers
  parseTemplateVariables,
  renderTemplate,
  validateVariables,
  incrementVersion,
} from "./prompts/index.js";

// =============================================================================
// MODEL EVALUATOR (Phase 16D)
// =============================================================================

export {
  // Model Registry (aliased to avoid conflict with LLM module)
  ModelCapabilitySchema as EvalModelCapabilitySchema,
  type ModelCapability as EvalModelCapability,
  ModelPricingSchema as EvalModelPricingSchema,
  type ModelPricing as EvalModelPricing,
  ModelLimitsSchema as EvalModelLimitsSchema,
  type ModelLimits as EvalModelLimits,
  ModelInfoSchema as EvalModelInfoSchema,
  type ModelInfo as EvalModelInfo,
  ModelProviderSchema as EvalModelProviderSchema,
  type ModelProvider as EvalModelProvider,

  // Evaluation Tasks
  EvalMetricTypeSchema,
  type EvalMetricType,
  EvalMetricSchema,
  type EvalMetric,
  EvalTaskSchema,
  type EvalTask,
  EvalResultSchema,
  type EvalResult,

  // Benchmarks
  BenchmarkSchema,
  type Benchmark,
  BenchmarkResultSchema,
  type BenchmarkResult,

  // Comparisons
  ModelRankingSchema,
  type ModelRanking,
  ComparisonResultSchema,
  type ComparisonResult,

  // Selection
  ModelSelectionCriteriaSchema,
  type ModelSelectionCriteria,
  ModelRecommendationSchema,
  type ModelRecommendation,

  // Leaderboards
  LeaderboardEntrySchema,
  type LeaderboardEntry,
  LeaderboardSchema,
  type Leaderboard,

  // Config
  ModelEvaluatorConfigSchema,
  type ModelEvaluatorConfig,

  // Constants
  EVALUATION_PROMPTS,

  // Manager
  ModelEvaluator,
  getModelEvaluator,
  createModelEvaluator,

  // Events & Interfaces
  type ModelEvaluatorEvents,
  type ModelEvaluatorStorage,
} from "./evaluation/index.js";

// =============================================================================
// MCP GATEWAY (Phase MCP)
// =============================================================================

export { MCPProcessManager, getMCPManager } from "./mcp/manager.js";

export { MCPConnection } from "./mcp/connection.js";

export { mcpRoutes } from "./mcp/routes.js";

export {
  MCPServerConfigSchema,
  MCPConfigFileSchema,
  MCPToolCallRequestSchema,
  type MCPServerConfig,
  type MCPConfigFile,
  type MCPToolCallRequest,
  type MCPToolDefinition,
  type MCPToolResult,
  type MCPServerStatus,
  type MCPServerInfo,
  type MCPGatewayStatus,
  type JsonRpcRequest,
  type JsonRpcResponse,
} from "./mcp/types.js";
