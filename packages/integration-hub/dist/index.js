import {
  ActionTypeSchema,
  AddMemberSchema,
  ApiServer,
  ApplyResultSchema,
  AuditActionSchema,
  AuditCategorySchema,
  AuditChangeSchema,
  AuditContextSchema,
  AuditEventSchema,
  AuditExportOptionsSchema,
  AuditLogger,
  AuditQueryResultSchema,
  AuditQuerySchema,
  AuditResourceSchema,
  AuditResultSchema,
  AuditRetentionPolicySchema,
  AuditSeveritySchema,
  AuditStatsSchema,
  AuthContextSchema,
  BACKUP_RESOURCES,
  BUILTIN_METRICS,
  BackupItemSchema,
  BackupManager,
  BackupManifestSchema,
  BackupScheduleSchema,
  BackupStatusSchema,
  BackupStorageSchema,
  BackupTypeSchema,
  BotConfigSchema,
  BudgetResourceSchema,
  ButtonInteractionSchema,
  ChatChannelSchema,
  ChatCredentialsSchema,
  ChatManager,
  ChatManagerConfigSchema,
  ChatMessageSchema,
  ChatPlatformSchema,
  ChatUserSchema,
  CodeActionKindSchema,
  CodeActionSchema,
  CommandInvocationSchema,
  CommandSchema,
  CompletionItemKindSchema,
  CompletionItemSchema,
  ConnectionStatusSchema,
  Counter,
  CreateAuditEventSchema,
  CreateInviteSchema,
  CreateOrgSchema,
  CreateRepoConfigSchema,
  DEFAULT_BACKUP_SCHEDULE,
  DEFAULT_COMMANDS,
  DEFAULT_FAILOVER_CONFIG,
  DEFAULT_HA_CONFIG,
  DEFAULT_HEALTH_CHECK_CONFIG,
  DEFAULT_NOTIFICATION_TEMPLATES,
  DEFAULT_RETENTION_DAYS,
  DRManagerConfigSchema,
  DRStateSchema,
  DiagnosticSchema,
  DiagnosticSeveritySchema,
  DiscordCredentialsSchema,
  DistributionService,
  EXAMPLE_PIPELINES,
  EXAMPLE_TERRAFORM_CONFIG,
  EditorStateSchema,
  EditorTypeSchema,
  EngineManager,
  EventBus,
  ExporterConfigSchema,
  ExporterTypeSchema,
  ExtensionConfigSchema,
  ExtensionStateSchema,
  FailoverConfigSchema,
  FailoverEventSchema,
  FailoverManager,
  FailoverModeSchema,
  FileChangeSchema,
  Gauge,
  GitManager,
  GitManagerConfigSchema,
  GitProviderSchema,
  GitWebhookEventSchema,
  HAManager,
  HAManagerConfigSchema,
  HAStateSchema,
  HCLBlockSchema,
  HCLConfigSchema,
  HealthCheckConfigSchema,
  HealthCheckResultSchema,
  HealthCheckTypeSchema,
  HealthChecker,
  Histogram,
  HistogramBucketsSchema,
  HoverContentSchema,
  IntegrationHub,
  InviteStatusSchema,
  LoadBalanceStrategySchema,
  LoadBalancer,
  LogQuerySchema,
  LogRecordSchema,
  LogSeveritySchema,
  Logger,
  MemberStatusSchema,
  MessageAttachmentSchema,
  MessageBlockSchema,
  MetricDataSchema,
  MetricDefinitionSchema,
  MetricPointSchema,
  MetricQuerySchema,
  MetricTypeSchema,
  MetricUnitSchema,
  MetricsCollector,
  MetricsSummarySchema,
  NotificationActionSchema,
  NotificationConfigSchema,
  NotificationResourceSchema,
  NotificationTemplateSchema,
  NotificationTypeSchema,
  NotificationTypeSchema2,
  ObservabilityConfigSchema,
  ObservabilityManager,
  ObservabilitySummarySchema,
  OrgInviteSchema,
  OrgMemberSchema,
  OrgPlanSchema,
  OrgSettingsSchema,
  OrganizationSchema,
  PERMISSIONS,
  PERMISSION_GROUPS,
  PIPELINE_SNIPPETS,
  PLAN_LIMITS,
  PermissionCheckSchema,
  PermissionResultSchema,
  PermissionSchema,
  PipelineChangeSchema,
  PipelinePRSchema,
  PipelineResourceSchema,
  PipelineStepResourceSchema,
  PipelineYAMLSchema,
  PipelineYAMLStepSchema,
  PluginResourceSchema,
  ProviderConfigSchema,
  QuickPickItemSchema,
  RBACManager,
  REGION_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  RecoveryPointSchema,
  RegionConfigSchema,
  RegionSchema,
  RegionStatusSchema,
  ReplicationConfigSchema,
  ReplicationModeSchema,
  ReplicationStatusSchema,
  RepoConfigSchema,
  ResourceChangeSchema,
  ResourceChangeTypeSchema,
  ResourceStateSchema,
  ResourceTypeSchema,
  RestoreManager,
  RestoreModeSchema,
  RestoreOptionsSchema,
  RestoreProgressSchema,
  RestoreStatusSchema,
  RoleSchema,
  RouteDecisionSchema,
  SEVERITY_LEVELS,
  SPAN_ATTRIBUTES,
  SamplerConfigSchema,
  SamplerTypeSchema,
  ScheduleResourceSchema,
  SendMessageOptionsSchema,
  SessionAffinitySchema,
  SlackCredentialsSchema,
  SlashCommandSchema,
  SpanBuilder,
  SpanEventSchema,
  SpanKindSchema,
  SpanLinkSchema,
  SpanSchema,
  SpanStatusCodeSchema,
  SpanStatusSchema,
  StatusBarItemSchema,
  StorageConfigSchema,
  SyncRecordSchema,
  SyncStatusSchema,
  TeamsCredentialsSchema,
  TelegramCredentialsSchema,
  TerraformApplyResultSchema,
  TerraformManager,
  TerraformManagerConfigSchema,
  TerraformPlanSchema,
  TerraformResourceTypeSchema,
  TerraformStateSchema,
  TraceContextSchema,
  TraceQuerySchema,
  TraceSchema,
  TraceSummarySchema,
  Tracer,
  TreeItemSchema,
  TreeItemStateSchema,
  TreeItemTypeSchema,
  UpdateMemberSchema,
  UpdateOrgSchema,
  VSCodeManager,
  VSCodeManagerConfigSchema,
  VSCodeNotificationSchema,
  VerificationResultSchema,
  VerificationStatusSchema,
  WALEntrySchema,
  WebhookResourceSchema,
  WebviewMessageSchema,
  WebviewStateSchema,
  WebviewTypeSchema,
  buildPermission,
  createAuditLogger,
  createBackupManager,
  createChatManager,
  createFailoverManager,
  createGitManager,
  createHAManager,
  createHealthChecker,
  createLoadBalancer,
  createLogger,
  createMetricsCollector,
  createObservabilityManager,
  createRBACManager,
  createRestoreManager,
  createTerraformManager,
  createTracer,
  createVSCodeManager,
  eventBus,
  generateContentBriefsDaily,
  generatePipelineDiff,
  generateSpanId,
  generateTraceId,
  getAuditLogger,
  getBackupManager,
  getChatManager,
  getDistributionService,
  getFailoverManager,
  getGitManager,
  getHAManager,
  getHealthChecker,
  getHub,
  getLoadBalancer,
  getLogger,
  getMetricsCollector,
  getObservabilityManager,
  getPermissionsForRole,
  getRBACManager,
  getRestoreManager,
  getTerraformManager,
  getTracer,
  getVSCodeManager,
  getWorkflows,
  internalToYAML,
  isAtLeastRole,
  isHigherRole,
  materializeContentFromBriefs,
  mergePermissions,
  parsePermission,
  parsePipelineYAML,
  registerWorkflows,
  roleHasPermission,
  setHubInstance,
  stringifyPipelineYAML,
  validatePipelineYAML,
  workflows,
  yamlToInternal
} from "./chunk-OW2SLFFR.js";
import {
  SupabaseStorage,
  getSupabaseStorage,
  initializeStorage
} from "./chunk-XWSPDE76.js";
import {
  AnalyticsManager,
  createPersistentAnalytics,
  getAnalyticsManager
} from "./chunk-SWYYQHAY.js";
import {
  WebhookManager,
  createWebhookManager,
  getWebhookManager
} from "./chunk-EM3I6ZL5.js";
import {
  AgentExecutor,
  createAgentExecutor,
  getAgentExecutor,
  getToolRegistry,
  toolRegistry
} from "./chunk-JXCADD2Q.js";
import {
  BullPipelineQueue,
  PipelineQueue,
  PipelineWorker,
  createAgentToolExecutor,
  createAgentWorker,
  createPipelineQueue,
  createPipelineWorker,
  getPipelineQueue
} from "./chunk-UOZH5NC2.js";

// src/scheduler/schedule-manager.ts
import { EventEmitter } from "eventemitter3";
import { randomUUID } from "crypto";

// src/scheduler/types.ts
import { z } from "zod";
var CronExpressionSchema = z.string().regex(
  /^(\*|([0-5]?\d)(,([0-5]?\d))*(-([0-5]?\d))?|(\*\/([0-5]?\d)))\s+(\*|([01]?\d|2[0-3])(,([01]?\d|2[0-3]))*(-([01]?\d|2[0-3]))?|(\*\/([01]?\d|2[0-3])))\s+(\*|([1-9]|[12]\d|3[01])(,([1-9]|[12]\d|3[01]))*(-([1-9]|[12]\d|3[01]))?|(\*\/([1-9]|[12]\d|3[01])))\s+(\*|(1[0-2]|[1-9])(,(1[0-2]|[1-9]))*(-(1[0-2]|[1-9]))?|(\*\/(1[0-2]|[1-9])))\s+(\*|[0-6](,[0-6])*(-[0-6])?|(\*\/[0-6]))$/,
  { message: "Invalid cron expression" }
).describe("Cron expression (minute hour day-of-month month day-of-week)");
var TimezoneSchema = z.string().default("UTC").describe("IANA timezone identifier");
var ScheduleStatusSchema = z.enum(["active", "paused", "disabled", "error"]);
var ScheduleConfigSchema = z.object({
  pipelineId: z.string().min(1),
  pipelineName: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cronExpression: CronExpressionSchema,
  timezone: TimezoneSchema,
  enabled: z.boolean().default(true),
  inputs: z.record(z.unknown()).default({}),
  maxRetries: z.number().int().min(0).max(10).default(3),
  timeoutMs: z.number().int().min(1e3).max(36e5).default(3e5),
  webhookUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({})
});
var ScheduleSchema = ScheduleConfigSchema.extend({
  id: z.string().uuid(),
  status: ScheduleStatusSchema.default("active"),
  nextRun: z.date().nullable(),
  lastRun: z.date().nullable(),
  lastStatus: z.enum(["completed", "failed", "cancelled"]).nullable(),
  runCount: z.number().int().default(0),
  consecutiveFailures: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date()
});
var ScheduledRunSchema = z.object({
  scheduleId: z.string().uuid(),
  scheduleName: z.string(),
  pipelineId: z.string(),
  pipelineName: z.string(),
  scheduledTime: z.date(),
  cronExpression: z.string(),
  timezone: z.string(),
  inputs: z.record(z.unknown())
});
var ScheduleExecutionSchema = z.object({
  id: z.string().uuid(),
  scheduleId: z.string().uuid(),
  pipelineId: z.string(),
  executionId: z.string().nullable(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
  scheduledAt: z.date(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  error: z.string().nullable(),
  attempt: z.number().int().default(1),
  result: z.unknown().nullable()
});
var ScheduleStatsSchema = z.object({
  totalSchedules: z.number().int(),
  activeSchedules: z.number().int(),
  pausedSchedules: z.number().int(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  successRate: z.number(),
  avgDurationMs: z.number(),
  nextScheduledRuns: z.array(ScheduledRunSchema)
});
var CRON_PRESETS = {
  everyMinute: "* * * * *",
  every5Minutes: "*/5 * * * *",
  every15Minutes: "*/15 * * * *",
  every30Minutes: "*/30 * * * *",
  hourly: "0 * * * *",
  every2Hours: "0 */2 * * *",
  every4Hours: "0 */4 * * *",
  every6Hours: "0 */6 * * *",
  every12Hours: "0 */12 * * *",
  daily: "0 0 * * *",
  dailyAt9am: "0 9 * * *",
  dailyAt6pm: "0 18 * * *",
  weekly: "0 0 * * 0",
  weekdays: "0 9 * * 1-5",
  weekends: "0 10 * * 0,6",
  monthly: "0 0 1 * *",
  quarterly: "0 0 1 */3 *"
};

// src/scheduler/schedule-manager.ts
function getNextRunDate(cronExpression, timezone, after = /* @__PURE__ */ new Date()) {
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression");
  }
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const next = new Date(after);
  next.setSeconds(0);
  next.setMilliseconds(0);
  next.setMinutes(next.getMinutes() + 1);
  if (minute === "*" && hour === "*") {
    return next;
  }
  if (minute.startsWith("*/")) {
    const interval = parseInt(minute.slice(2));
    const currentMinute = next.getMinutes();
    const nextMinute = Math.ceil(currentMinute / interval) * interval;
    if (nextMinute >= 60) {
      next.setHours(next.getHours() + 1);
      next.setMinutes(nextMinute % 60);
    } else {
      next.setMinutes(nextMinute);
    }
    return next;
  }
  if (minute !== "*" && hour !== "*") {
    const targetMinute = parseInt(minute);
    const targetHour = parseInt(hour);
    next.setMinutes(targetMinute);
    next.setHours(targetHour);
    if (next <= after) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
  if (minute !== "*" && hour === "*") {
    const targetMinute = parseInt(minute);
    next.setMinutes(targetMinute);
    if (next <= after) {
      next.setHours(next.getHours() + 1);
    }
    return next;
  }
  return next;
}
function cronToHuman(cronExpression) {
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) return cronExpression;
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute";
  }
  if (minute.startsWith("*/") && hour === "*") {
    return `Every ${minute.slice(2)} minutes`;
  }
  if (minute !== "*" && hour === "*" && dayOfMonth === "*") {
    return `Every hour at :${minute.padStart(2, "0")}`;
  }
  if (minute !== "*" && hour !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }
  if (dayOfWeek !== "*" && dayOfMonth === "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[parseInt(dayOfWeek)] || dayOfWeek;
    return `Weekly on ${dayName} at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }
  if (dayOfMonth !== "*" && month === "*") {
    return `Monthly on day ${dayOfMonth} at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }
  return cronExpression;
}
var ScheduleManager = class extends EventEmitter {
  schedules = /* @__PURE__ */ new Map();
  executions = /* @__PURE__ */ new Map();
  runningExecutions = /* @__PURE__ */ new Set();
  checkTimer = null;
  isRunning = false;
  config;
  constructor(config = {}) {
    super();
    this.config = {
      checkInterval: config.checkInterval || 6e4,
      maxConcurrent: config.maxConcurrent || 10,
      autoDisableAfterFailures: config.autoDisableAfterFailures || 5,
      executor: config.executor || (async () => ({ executionId: "", result: null }))
    };
  }
  /**
   * Start the scheduler
   */
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[Scheduler] Starting schedule manager...");
    await this.checkSchedules();
    this.checkTimer = setInterval(() => {
      this.checkSchedules().catch((err) => {
        console.error("[Scheduler] Check error:", err);
        this.emit("error", err);
      });
    }, this.config.checkInterval);
    console.log("[Scheduler] Schedule manager started");
  }
  /**
   * Stop the scheduler
   */
  async stop() {
    this.isRunning = false;
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    console.log("[Scheduler] Schedule manager stopped");
  }
  /**
   * Create a new schedule
   */
  async createSchedule(config) {
    const validated = ScheduleConfigSchema.parse(config);
    const schedule = {
      ...validated,
      id: randomUUID(),
      status: validated.enabled ? "active" : "disabled",
      nextRun: validated.enabled ? getNextRunDate(validated.cronExpression, validated.timezone) : null,
      lastRun: null,
      lastStatus: null,
      runCount: 0,
      consecutiveFailures: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.schedules.set(schedule.id, schedule);
    this.emit("schedule:created", schedule);
    console.log(`[Scheduler] Created schedule: ${schedule.name} (${schedule.id})`);
    return schedule;
  }
  /**
   * Update an existing schedule
   */
  async updateSchedule(id, updates) {
    const existing = this.schedules.get(id);
    if (!existing) {
      throw new Error(`Schedule not found: ${id}`);
    }
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (updates.cronExpression || updates.enabled !== void 0 || updates.timezone) {
      updated.nextRun = updated.enabled && updated.status === "active" ? getNextRunDate(updated.cronExpression, updated.timezone) : null;
    }
    this.schedules.set(id, updated);
    this.emit("schedule:updated", updated);
    return updated;
  }
  /**
   * Delete a schedule
   */
  async deleteSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) return false;
    this.schedules.delete(id);
    this.emit("schedule:deleted", id);
    console.log(`[Scheduler] Deleted schedule: ${schedule.name} (${id})`);
    return true;
  }
  /**
   * Get a schedule by ID
   */
  getSchedule(id) {
    return this.schedules.get(id);
  }
  /**
   * Get all schedules
   */
  getAllSchedules() {
    return Array.from(this.schedules.values());
  }
  /**
   * Get schedules by pipeline ID
   */
  getSchedulesByPipeline(pipelineId) {
    return this.getAllSchedules().filter((s) => s.pipelineId === pipelineId);
  }
  /**
   * Enable a schedule
   */
  async enableSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule not found: ${id}`);
    }
    schedule.enabled = true;
    schedule.status = "active";
    schedule.nextRun = getNextRunDate(schedule.cronExpression, schedule.timezone);
    schedule.consecutiveFailures = 0;
    schedule.updatedAt = /* @__PURE__ */ new Date();
    this.emit("schedule:enabled", schedule);
    return schedule;
  }
  /**
   * Disable a schedule
   */
  async disableSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule not found: ${id}`);
    }
    schedule.enabled = false;
    schedule.status = "disabled";
    schedule.nextRun = null;
    schedule.updatedAt = /* @__PURE__ */ new Date();
    this.emit("schedule:disabled", schedule);
    return schedule;
  }
  /**
   * Pause a schedule (temporary)
   */
  async pauseSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule not found: ${id}`);
    }
    schedule.status = "paused";
    schedule.updatedAt = /* @__PURE__ */ new Date();
    this.emit("schedule:paused", schedule);
    return schedule;
  }
  /**
   * Resume a paused schedule
   */
  async resumeSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule not found: ${id}`);
    }
    schedule.status = "active";
    schedule.nextRun = getNextRunDate(schedule.cronExpression, schedule.timezone);
    schedule.updatedAt = /* @__PURE__ */ new Date();
    this.emit("schedule:resumed", schedule);
    return schedule;
  }
  /**
   * Trigger a schedule manually (run now)
   */
  async triggerSchedule(id) {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new Error(`Schedule not found: ${id}`);
    }
    return this.executeSchedule(schedule);
  }
  /**
   * Get upcoming scheduled runs
   */
  getNextRuns(limit = 10) {
    const runs = [];
    for (const schedule of this.schedules.values()) {
      if (schedule.status === "active" && schedule.enabled && schedule.nextRun) {
        runs.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          pipelineId: schedule.pipelineId,
          pipelineName: schedule.pipelineName,
          scheduledTime: schedule.nextRun,
          cronExpression: schedule.cronExpression,
          timezone: schedule.timezone,
          inputs: schedule.inputs
        });
      }
    }
    return runs.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()).slice(0, limit);
  }
  /**
   * Get execution history for a schedule
   */
  getExecutions(scheduleId, limit = 20) {
    return Array.from(this.executions.values()).filter((e) => e.scheduleId === scheduleId).sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()).slice(0, limit);
  }
  /**
   * Get scheduler statistics
   */
  getStats() {
    const schedules = this.getAllSchedules();
    const executions = Array.from(this.executions.values());
    const activeSchedules = schedules.filter((s) => s.status === "active" && s.enabled).length;
    const pausedSchedules = schedules.filter((s) => s.status === "paused").length;
    const completedExecutions = executions.filter((e) => e.status === "completed");
    const failedExecutions = executions.filter((e) => e.status === "failed");
    const totalRuns = completedExecutions.length + failedExecutions.length;
    const successRate = totalRuns > 0 ? completedExecutions.length / totalRuns * 100 : 0;
    const durations = completedExecutions.filter((e) => e.startedAt && e.completedAt).map((e) => e.completedAt.getTime() - e.startedAt.getTime());
    const avgDurationMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return {
      totalSchedules: schedules.length,
      activeSchedules,
      pausedSchedules,
      totalRuns,
      successfulRuns: completedExecutions.length,
      failedRuns: failedExecutions.length,
      successRate: Math.round(successRate * 100) / 100,
      avgDurationMs: Math.round(avgDurationMs),
      nextScheduledRuns: this.getNextRuns(5)
    };
  }
  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================
  async checkSchedules() {
    const now = /* @__PURE__ */ new Date();
    for (const schedule of this.schedules.values()) {
      if (schedule.status !== "active" || !schedule.enabled || !schedule.nextRun) {
        continue;
      }
      if (this.runningExecutions.size >= this.config.maxConcurrent) {
        continue;
      }
      if (schedule.nextRun <= now) {
        this.executeSchedule(schedule).catch((err) => {
          console.error(`[Scheduler] Execution error for ${schedule.name}:`, err);
        });
        schedule.nextRun = getNextRunDate(schedule.cronExpression, schedule.timezone, now);
        schedule.updatedAt = /* @__PURE__ */ new Date();
      }
    }
  }
  async executeSchedule(schedule) {
    const executionId = randomUUID();
    const execution = {
      id: executionId,
      scheduleId: schedule.id,
      pipelineId: schedule.pipelineId,
      executionId: null,
      status: "pending",
      scheduledAt: /* @__PURE__ */ new Date(),
      startedAt: null,
      completedAt: null,
      error: null,
      attempt: 1,
      result: null
    };
    this.executions.set(executionId, execution);
    this.runningExecutions.add(executionId);
    this.emit("run:scheduled", {
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      pipelineId: schedule.pipelineId,
      pipelineName: schedule.pipelineName,
      scheduledTime: execution.scheduledAt,
      cronExpression: schedule.cronExpression,
      timezone: schedule.timezone,
      inputs: schedule.inputs
    });
    try {
      execution.status = "running";
      execution.startedAt = /* @__PURE__ */ new Date();
      this.emit("run:started", execution);
      const result = await this.config.executor(schedule);
      execution.executionId = result.executionId;
      execution.result = result.result;
      execution.status = "completed";
      execution.completedAt = /* @__PURE__ */ new Date();
      schedule.lastRun = execution.completedAt;
      schedule.lastStatus = "completed";
      schedule.runCount++;
      schedule.consecutiveFailures = 0;
      this.emit("run:completed", execution);
      console.log(`[Scheduler] Completed: ${schedule.name} (execution: ${result.executionId})`);
    } catch (error) {
      execution.status = "failed";
      execution.completedAt = /* @__PURE__ */ new Date();
      execution.error = error instanceof Error ? error.message : String(error);
      schedule.lastRun = execution.completedAt;
      schedule.lastStatus = "failed";
      schedule.runCount++;
      schedule.consecutiveFailures++;
      this.emit("run:failed", execution, error instanceof Error ? error : new Error(String(error)));
      console.error(`[Scheduler] Failed: ${schedule.name}:`, error);
      if (schedule.consecutiveFailures >= this.config.autoDisableAfterFailures) {
        schedule.status = "error";
        schedule.enabled = false;
        console.warn(`[Scheduler] Auto-disabled ${schedule.name} after ${schedule.consecutiveFailures} failures`);
        this.emit("schedule:disabled", schedule);
      }
    } finally {
      this.runningExecutions.delete(executionId);
    }
    return execution;
  }
};
var managerInstance = null;
function getScheduleManager(config) {
  if (!managerInstance) {
    managerInstance = new ScheduleManager(config);
  }
  return managerInstance;
}
function createScheduleManager(config) {
  return new ScheduleManager(config);
}

// src/cache/types.ts
import { z as z2 } from "zod";
var CacheStrategySchema = z2.enum([
  "none",
  // No caching
  "memory",
  // In-memory only
  "redis",
  // Redis only
  "tiered",
  // Memory + Redis (L1 + L2)
  "distributed"
  // Distributed cache with replication
]);
var EvictionPolicySchema = z2.enum([
  "lru",
  // Least Recently Used
  "lfu",
  // Least Frequently Used
  "fifo",
  // First In First Out
  "ttl",
  // Time To Live only
  "random"
  // Random eviction
]);
var CacheEntrySchema = z2.object({
  key: z2.string(),
  value: z2.unknown(),
  metadata: z2.object({
    createdAt: z2.number(),
    accessedAt: z2.number(),
    expiresAt: z2.number().optional(),
    ttl: z2.number().optional(),
    accessCount: z2.number().default(0),
    size: z2.number().optional(),
    tags: z2.array(z2.string()).default([])
  })
});
var CacheOptionsSchema = z2.object({
  ttl: z2.number().optional(),
  // Time to live in seconds
  tags: z2.array(z2.string()).optional(),
  // Tags for invalidation
  compress: z2.boolean().optional(),
  // Compress large values
  skipL1: z2.boolean().optional(),
  // Skip memory cache
  skipL2: z2.boolean().optional(),
  // Skip Redis cache
  staleWhileRevalidate: z2.number().optional(),
  // Serve stale while refreshing
  onMiss: z2.function().optional()
  // Function to call on cache miss
});
var CacheResultSchema = z2.object({
  hit: z2.boolean(),
  value: z2.unknown().optional(),
  source: z2.enum(["memory", "redis", "origin"]).optional(),
  stale: z2.boolean().default(false),
  latencyMs: z2.number()
});
var CacheStatsSchema = z2.object({
  hits: z2.number(),
  misses: z2.number(),
  hitRate: z2.number(),
  entries: z2.number(),
  memoryUsage: z2.number(),
  evictions: z2.number(),
  latency: z2.object({
    avg: z2.number(),
    p50: z2.number(),
    p95: z2.number(),
    p99: z2.number()
  }),
  byTag: z2.record(z2.object({
    hits: z2.number(),
    misses: z2.number(),
    entries: z2.number()
  })).optional()
});
var MemoryCacheConfigSchema = z2.object({
  maxSize: z2.number().default(1e3),
  // Max entries
  maxMemory: z2.number().default(100 * 1024 * 1024),
  // 100MB
  evictionPolicy: EvictionPolicySchema.default("lru"),
  checkPeriod: z2.number().default(6e4)
  // Cleanup interval
});
var RedisCacheConfigSchema = z2.object({
  url: z2.string().default("redis://localhost:6379"),
  prefix: z2.string().default("gicm:cache:"),
  maxRetriesPerRequest: z2.number().default(3),
  enableOfflineQueue: z2.boolean().default(true),
  connectTimeout: z2.number().default(5e3),
  commandTimeout: z2.number().default(5e3)
});
var CacheManagerConfigSchema = z2.object({
  strategy: CacheStrategySchema.default("memory"),
  defaultTtl: z2.number().default(300),
  // 5 minutes
  memory: MemoryCacheConfigSchema.optional(),
  redis: RedisCacheConfigSchema.optional(),
  compression: z2.object({
    enabled: z2.boolean().default(false),
    threshold: z2.number().default(1024)
    // Min size to compress
  }).optional(),
  metrics: z2.object({
    enabled: z2.boolean().default(true),
    sampleRate: z2.number().default(1)
    // 0-1
  }).optional()
});
var CacheKeyPatternSchema = z2.object({
  pattern: z2.string(),
  ttl: z2.number().optional(),
  tags: z2.array(z2.string()).optional(),
  compression: z2.boolean().optional()
});
var CacheKeys = {
  // Organization
  org: (orgId) => `org:${orgId}`,
  orgMembers: (orgId) => `org:${orgId}:members`,
  orgSettings: (orgId) => `org:${orgId}:settings`,
  // Pipeline
  pipeline: (pipelineId) => `pipeline:${pipelineId}`,
  pipelineList: (orgId) => `pipelines:${orgId}`,
  pipelineExecution: (executionId) => `execution:${executionId}`,
  // Schedule
  schedule: (scheduleId) => `schedule:${scheduleId}`,
  scheduleList: (orgId) => `schedules:${orgId}`,
  // Budget
  budget: (budgetId) => `budget:${budgetId}`,
  budgetList: (orgId) => `budgets:${orgId}`,
  budgetUsage: (budgetId) => `budget:${budgetId}:usage`,
  // Analytics
  analytics: (orgId, period) => `analytics:${orgId}:${period}`,
  analyticsSummary: (orgId) => `analytics:${orgId}:summary`,
  // User
  user: (userId) => `user:${userId}`,
  userPermissions: (userId, orgId) => `user:${userId}:perms:${orgId}`,
  // API
  apiRateLimit: (key) => `rate:${key}`,
  // Content
  content: (contentId) => `content:${contentId}`,
  contentList: (orgId, type) => `content:${orgId}:${type}`,
  // Marketplace
  marketplaceItem: (itemId) => `marketplace:${itemId}`,
  marketplaceList: (category) => `marketplace:list:${category}`
};
var TTL = {
  VERY_SHORT: 30,
  // 30 seconds
  SHORT: 60,
  // 1 minute
  MEDIUM: 300,
  // 5 minutes
  LONG: 900,
  // 15 minutes
  VERY_LONG: 3600,
  // 1 hour
  DAY: 86400,
  // 24 hours
  WEEK: 604800,
  // 7 days
  // Specific use cases
  RATE_LIMIT: 60,
  SESSION: 86400,
  API_RESPONSE: 60,
  ANALYTICS: 300,
  USER_PERMISSIONS: 300,
  ORG_SETTINGS: 600,
  PIPELINE_LIST: 60,
  MARKETPLACE: 300
};
var CacheTags = {
  // Invalidation groups
  ORG: (orgId) => `org:${orgId}`,
  USER: (userId) => `user:${userId}`,
  PIPELINE: (pipelineId) => `pipeline:${pipelineId}`,
  SCHEDULE: (scheduleId) => `schedule:${scheduleId}`,
  BUDGET: (budgetId) => `budget:${budgetId}`,
  // Resource types
  PIPELINES: "type:pipelines",
  SCHEDULES: "type:schedules",
  BUDGETS: "type:budgets",
  ANALYTICS: "type:analytics",
  MARKETPLACE: "type:marketplace",
  CONTENT: "type:content"
};

// src/cache/cache-manager.ts
import { EventEmitter as EventEmitter2 } from "eventemitter3";
var MemoryCache = class {
  cache = /* @__PURE__ */ new Map();
  accessOrder = [];
  // For LRU
  maxSize;
  maxMemory;
  evictionPolicy;
  currentMemory = 0;
  constructor(config) {
    this.maxSize = config.maxSize;
    this.maxMemory = config.maxMemory;
    this.evictionPolicy = config.evictionPolicy;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return void 0;
    if (entry.metadata.expiresAt && Date.now() > entry.metadata.expiresAt) {
      this.delete(key);
      return void 0;
    }
    entry.metadata.accessedAt = Date.now();
    entry.metadata.accessCount++;
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
    this.accessOrder.push(key);
    return entry;
  }
  set(key, value, options) {
    const size = this.estimateSize(value);
    while (this.cache.size >= this.maxSize || this.currentMemory + size > this.maxMemory) {
      if (!this.evict()) break;
    }
    const now = Date.now();
    const entry = {
      key,
      value,
      metadata: {
        createdAt: now,
        accessedAt: now,
        expiresAt: options?.ttl ? now + options.ttl * 1e3 : void 0,
        ttl: options?.ttl,
        accessCount: 0,
        size,
        tags: options?.tags || []
      }
    };
    const existing = this.cache.get(key);
    if (existing) {
      this.currentMemory -= existing.metadata.size || 0;
    }
    this.cache.set(key, entry);
    this.currentMemory += size;
    this.accessOrder.push(key);
  }
  delete(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    this.cache.delete(key);
    this.currentMemory -= entry.metadata.size || 0;
    const idx = this.accessOrder.indexOf(key);
    if (idx > -1) {
      this.accessOrder.splice(idx, 1);
    }
    return true;
  }
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.metadata.expiresAt && Date.now() > entry.metadata.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }
  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.currentMemory = 0;
  }
  keys() {
    return Array.from(this.cache.keys());
  }
  size() {
    return this.cache.size;
  }
  memoryUsage() {
    return this.currentMemory;
  }
  deleteByTag(tag) {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.tags.includes(tag)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }
  deleteByPattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }
  evict() {
    if (this.cache.size === 0) return false;
    let keyToEvict = null;
    switch (this.evictionPolicy) {
      case "lru":
        keyToEvict = this.accessOrder[0] || null;
        break;
      case "lfu":
        let minAccess = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          if (entry.metadata.accessCount < minAccess) {
            minAccess = entry.metadata.accessCount;
            keyToEvict = key;
          }
        }
        break;
      case "fifo":
        keyToEvict = this.cache.keys().next().value || null;
        break;
      case "ttl":
        let earliestExpiry = Infinity;
        for (const [key, entry] of this.cache.entries()) {
          const expiry = entry.metadata.expiresAt || Infinity;
          if (expiry < earliestExpiry) {
            earliestExpiry = expiry;
            keyToEvict = key;
          }
        }
        break;
      case "random":
        const keys = Array.from(this.cache.keys());
        keyToEvict = keys[Math.floor(Math.random() * keys.length)] || null;
        break;
    }
    if (keyToEvict) {
      this.delete(keyToEvict);
      return true;
    }
    return false;
  }
  estimateSize(value) {
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024;
    }
  }
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.expiresAt && entry.metadata.expiresAt < now) {
        this.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
};
var RedisCache = class {
  connected = false;
  prefix;
  mockStorage = /* @__PURE__ */ new Map();
  constructor(config) {
    this.prefix = config.prefix;
    this.connected = true;
  }
  async get(key) {
    const prefixedKey = this.prefix + key;
    const entry = this.mockStorage.get(prefixedKey);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.mockStorage.delete(prefixedKey);
      return null;
    }
    return entry.value;
  }
  async set(key, value, ttlSeconds) {
    const prefixedKey = this.prefix + key;
    this.mockStorage.set(prefixedKey, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1e3 : void 0
    });
  }
  async delete(key) {
    const prefixedKey = this.prefix + key;
    return this.mockStorage.delete(prefixedKey);
  }
  async deleteByPattern(pattern) {
    const regex = new RegExp((this.prefix + pattern).replace(/\*/g, ".*"));
    let count = 0;
    for (const key of this.mockStorage.keys()) {
      if (regex.test(key)) {
        this.mockStorage.delete(key);
        count++;
      }
    }
    return count;
  }
  async exists(key) {
    const value = await this.get(key);
    return value !== null;
  }
  async clear() {
    for (const key of this.mockStorage.keys()) {
      if (key.startsWith(this.prefix)) {
        this.mockStorage.delete(key);
      }
    }
  }
  isConnected() {
    return this.connected;
  }
  async disconnect() {
    this.connected = false;
  }
};
var CacheManager = class extends EventEmitter2 {
  config;
  memory;
  redis;
  stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    latencies: []
  };
  cleanupTimer;
  constructor(config = {}) {
    super();
    this.config = {
      strategy: config.strategy || "memory",
      defaultTtl: config.defaultTtl || TTL.MEDIUM,
      memory: {
        maxSize: config.memory?.maxSize || 1e3,
        maxMemory: config.memory?.maxMemory || 100 * 1024 * 1024,
        evictionPolicy: config.memory?.evictionPolicy || "lru",
        checkPeriod: config.memory?.checkPeriod || 6e4
      },
      redis: config.redis,
      compression: config.compression,
      metrics: config.metrics
    };
    this.memory = new MemoryCache({
      maxSize: this.config.memory.maxSize,
      maxMemory: this.config.memory.maxMemory,
      evictionPolicy: this.config.memory.evictionPolicy
    });
    if (this.config.strategy === "redis" || this.config.strategy === "tiered") {
      this.redis = new RedisCache({
        url: this.config.redis?.url || "redis://localhost:6379",
        prefix: this.config.redis?.prefix || "gicm:cache:"
      });
    }
    this.startCleanup();
  }
  // ==========================================================================
  // CORE OPERATIONS
  // ==========================================================================
  /**
   * Get value from cache
   */
  async get(key) {
    const start = Date.now();
    try {
      if (this.config.strategy !== "redis") {
        const memEntry = this.memory.get(key);
        if (memEntry) {
          this.recordHit(key, "memory", start);
          return {
            hit: true,
            value: memEntry.value,
            source: "memory",
            stale: false,
            latencyMs: Date.now() - start
          };
        }
      }
      if (this.redis && this.config.strategy !== "memory") {
        const redisValue = await this.redis.get(key);
        if (redisValue) {
          const value = JSON.parse(redisValue);
          if (this.config.strategy === "tiered") {
            this.memory.set(key, value);
          }
          this.recordHit(key, "redis", start);
          return {
            hit: true,
            value,
            source: "redis",
            stale: false,
            latencyMs: Date.now() - start
          };
        }
      }
      this.recordMiss(key, start);
      return {
        hit: false,
        source: "origin",
        stale: false,
        latencyMs: Date.now() - start
      };
    } catch (error) {
      this.emit("error", error);
      return {
        hit: false,
        source: "origin",
        stale: false,
        latencyMs: Date.now() - start
      };
    }
  }
  /**
   * Set value in cache
   */
  async set(key, value, options) {
    const ttl = options?.ttl ?? this.config.defaultTtl;
    try {
      if (this.config.strategy !== "redis" && !options?.skipL1) {
        this.memory.set(key, value, { ...options, ttl });
      }
      if (this.redis && this.config.strategy !== "memory" && !options?.skipL2) {
        const serialized = JSON.stringify(value);
        await this.redis.set(key, serialized, ttl);
      }
      this.emit("set", key, ttl);
    } catch (error) {
      this.emit("error", error);
    }
  }
  /**
   * Delete value from cache
   */
  async delete(key) {
    let deleted = false;
    if (this.memory.delete(key)) {
      deleted = true;
    }
    if (this.redis) {
      if (await this.redis.delete(key)) {
        deleted = true;
      }
    }
    if (deleted) {
      this.emit("delete", key);
    }
    return deleted;
  }
  /**
   * Check if key exists
   */
  async has(key) {
    if (this.memory.has(key)) return true;
    if (this.redis) {
      return await this.redis.exists(key);
    }
    return false;
  }
  /**
   * Get or set with factory function
   */
  async getOrSet(key, factory, options) {
    const result = await this.get(key);
    if (result.hit) {
      return result.value;
    }
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }
  /**
   * Clear all cache
   */
  async clear() {
    this.memory.clear();
    if (this.redis) {
      await this.redis.clear();
    }
  }
  // ==========================================================================
  // INVALIDATION
  // ==========================================================================
  /**
   * Invalidate by tag
   */
  async invalidateByTag(tag) {
    let count = this.memory.deleteByTag(tag);
    this.emit("invalidate", `tag:${tag}`, count);
    return count;
  }
  /**
   * Invalidate by pattern
   */
  async invalidateByPattern(pattern) {
    let count = this.memory.deleteByPattern(pattern);
    if (this.redis) {
      count += await this.redis.deleteByPattern(pattern);
    }
    this.emit("invalidate", pattern, count);
    return count;
  }
  /**
   * Invalidate multiple keys
   */
  async invalidateMany(keys) {
    let count = 0;
    for (const key of keys) {
      if (await this.delete(key)) {
        count++;
      }
    }
    return count;
  }
  // ==========================================================================
  // STATS & MONITORING
  // ==========================================================================
  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const latencies = [...this.stats.latencies].sort((a, b) => a - b);
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      entries: this.memory.size(),
      memoryUsage: this.memory.memoryUsage(),
      evictions: this.stats.evictions,
      latency: {
        avg: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
        p50: this.percentile(latencies, 50),
        p95: this.percentile(latencies, 95),
        p99: this.percentile(latencies, 99)
      }
    };
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      latencies: []
    };
  }
  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  /**
   * Wrap a function with caching
   */
  wrap(fn, keyFn, options) {
    return (async (...args) => {
      const key = keyFn(...args);
      return this.getOrSet(key, () => fn(...args), options);
    });
  }
  /**
   * Create a memoized version of a function
   */
  memoize(fn, options) {
    const prefix = options?.keyPrefix || fn.name || "memo";
    return this.wrap(
      fn,
      (...args) => `${prefix}:${JSON.stringify(args)}`,
      options
    );
  }
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  recordHit(key, source, startTime) {
    this.stats.hits++;
    this.recordLatency(startTime);
    this.emit("hit", key, source);
  }
  recordMiss(key, startTime) {
    this.stats.misses++;
    this.recordLatency(startTime);
    this.emit("miss", key);
  }
  recordLatency(startTime) {
    const latency = Date.now() - startTime;
    this.stats.latencies.push(latency);
    if (this.stats.latencies.length > 1e3) {
      this.stats.latencies.shift();
    }
  }
  percentile(sortedArr, p) {
    if (sortedArr.length === 0) return 0;
    const idx = Math.ceil(p / 100 * sortedArr.length) - 1;
    return sortedArr[Math.max(0, Math.min(idx, sortedArr.length - 1))];
  }
  startCleanup() {
    const checkPeriod = this.config.memory?.checkPeriod || 6e4;
    this.cleanupTimer = setInterval(() => {
      const cleaned = this.memory.cleanup();
      if (cleaned > 0) {
        this.stats.evictions += cleaned;
      }
    }, checkPeriod);
  }
  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================
  /**
   * Stop the cache manager
   */
  async stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.redis) {
      await this.redis.disconnect();
      this.emit("disconnected", "redis");
    }
  }
  /**
   * Get current strategy
   */
  getStrategy() {
    return this.config.strategy;
  }
  /**
   * Check Redis connection
   */
  isRedisConnected() {
    return this.redis?.isConnected() ?? false;
  }
};
var cacheManagerInstance = null;
function getCacheManager() {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
  }
  return cacheManagerInstance;
}
function createCacheManager(config) {
  return new CacheManager(config);
}

// src/cache/middleware.ts
var DEFAULT_OPTIONS = {
  defaultTtl: TTL.SHORT,
  methods: ["GET"],
  excludePaths: ["/health", "/metrics", "/api/auth"],
  varyByUser: true,
  varyByOrg: true,
  statusCodes: [200],
  addStatusHeader: true
};
function generateCacheKey(request, options) {
  if (options.keyGenerator) {
    return options.keyGenerator(request);
  }
  const parts = [
    request.method,
    request.url
  ];
  if (options.varyByUser && request.userId) {
    parts.push(`user:${request.userId}`);
  }
  if (options.varyByOrg && request.orgId) {
    parts.push(`org:${request.orgId}`);
  }
  const queryString = new URL(request.url, "http://localhost").search;
  if (queryString) {
    parts.push(queryString);
  }
  return `api:${parts.join(":")}`;
}
function createCacheMiddleware(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cache = opts.cacheManager || getCacheManager();
  return async function cacheMiddleware2(request, reply) {
    if (!opts.methods?.includes(request.method)) {
      return;
    }
    const url = request.url.split("?")[0];
    for (const pattern of opts.excludePaths || []) {
      if (typeof pattern === "string" && url.startsWith(pattern)) {
        return;
      }
      if (pattern instanceof RegExp && pattern.test(url)) {
        return;
      }
    }
    if (opts.condition && !opts.condition(request)) {
      return;
    }
    const cacheKey = generateCacheKey(request, opts);
    const result = await cache.get(cacheKey);
    if (result.hit) {
      if (opts.addStatusHeader) {
        reply.header("X-Cache", "HIT");
        reply.header("X-Cache-Source", result.source || "unknown");
      }
      reply.send(result.value);
      return;
    }
    if (opts.addStatusHeader) {
      reply.header("X-Cache", "MISS");
    }
    const originalSend = reply.send.bind(reply);
    reply.send = function(payload) {
      if (opts.statusCodes?.includes(reply.statusCode)) {
        if (opts.skipIfHeader && reply.getHeader(opts.skipIfHeader)) {
          return originalSend(payload);
        }
        cache.set(cacheKey, payload, {
          ttl: opts.defaultTtl,
          tags: [request.orgId ? `org:${request.orgId}` : "global"]
        }).catch(() => {
        });
      }
      return originalSend(payload);
    };
  };
}
var cacheMiddleware = createCacheMiddleware();

// src/plugins/types.ts
import { z as z3 } from "zod";
var PluginMetadataSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  version: z3.string(),
  description: z3.string().optional(),
  author: z3.string().optional(),
  license: z3.string().optional(),
  homepage: z3.string().url().optional(),
  repository: z3.string().url().optional(),
  keywords: z3.array(z3.string()).default([]),
  category: z3.enum([
    "integration",
    // External service integrations
    "tool",
    // Pipeline tools
    "transform",
    // Data transformers
    "notification",
    // Notification channels
    "analytics",
    // Analytics extensions
    "security",
    // Security features
    "ui",
    // UI components
    "other"
  ]).default("other")
});
var PluginCapabilitySchema = z3.enum([
  "tools",
  // Provides pipeline tools
  "hooks",
  // Provides lifecycle hooks
  "routes",
  // Provides API routes
  "middleware",
  // Provides middleware
  "storage",
  // Provides storage adapters
  "notifications",
  // Provides notification channels
  "transforms",
  // Provides data transformers
  "validators",
  // Provides validators
  "ui_components"
  // Provides UI components
]);
var PluginStatusSchema = z3.enum([
  "registered",
  // Plugin registered but not installed
  "installing",
  // Plugin being installed
  "installed",
  // Plugin installed but not enabled
  "enabled",
  // Plugin enabled and active
  "disabled",
  // Plugin disabled
  "error",
  // Plugin in error state
  "uninstalling"
  // Plugin being uninstalled
]);
var PluginConfigFieldSchema = z3.object({
  key: z3.string(),
  type: z3.enum(["string", "number", "boolean", "select", "multiselect", "secret"]),
  label: z3.string(),
  description: z3.string().optional(),
  required: z3.boolean().default(false),
  default: z3.unknown().optional(),
  options: z3.array(z3.object({
    value: z3.string(),
    label: z3.string()
  })).optional(),
  validation: z3.object({
    min: z3.number().optional(),
    max: z3.number().optional(),
    pattern: z3.string().optional()
  }).optional()
});
var PluginConfigSchema = z3.object({
  fields: z3.array(PluginConfigFieldSchema),
  values: z3.record(z3.unknown()).default({})
});
var PluginHookTypeSchema = z3.enum([
  // Lifecycle hooks
  "onInit",
  "onStart",
  "onStop",
  "onDestroy",
  // Pipeline hooks
  "beforePipelineExecute",
  "afterPipelineExecute",
  "onPipelineError",
  // Step hooks
  "beforeStepExecute",
  "afterStepExecute",
  "onStepError",
  // Tool hooks
  "beforeToolCall",
  "afterToolCall",
  "onToolError",
  // Auth hooks
  "onLogin",
  "onLogout",
  "onPermissionCheck",
  // Data hooks
  "beforeSave",
  "afterSave",
  "beforeDelete",
  "afterDelete",
  // Custom hooks
  "custom"
]);
var PluginHookSchema = z3.object({
  type: PluginHookTypeSchema,
  priority: z3.number().default(100),
  handler: z3.function().args(z3.unknown()).returns(z3.promise(z3.unknown()))
});
var PluginToolSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  description: z3.string(),
  category: z3.string().default("custom"),
  inputs: z3.array(z3.object({
    name: z3.string(),
    type: z3.string(),
    description: z3.string().optional(),
    required: z3.boolean().default(true),
    default: z3.unknown().optional()
  })),
  outputs: z3.array(z3.object({
    name: z3.string(),
    type: z3.string(),
    description: z3.string().optional()
  })).optional(),
  execute: z3.function().args(z3.unknown()).returns(z3.promise(z3.unknown()))
});
var PluginRouteMethodSchema = z3.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);
var PluginRouteSchema = z3.object({
  method: PluginRouteMethodSchema,
  path: z3.string(),
  handler: z3.function().args(z3.unknown(), z3.unknown()).returns(z3.promise(z3.unknown())),
  auth: z3.boolean().default(true),
  permissions: z3.array(z3.string()).optional()
});
var PluginDefinitionSchema = z3.object({
  // Metadata
  metadata: PluginMetadataSchema,
  // Capabilities
  capabilities: z3.array(PluginCapabilitySchema).default([]),
  // Dependencies
  dependencies: z3.array(z3.object({
    pluginId: z3.string(),
    version: z3.string().optional(),
    optional: z3.boolean().default(false)
  })).default([]),
  // Configuration schema
  configSchema: PluginConfigSchema.optional(),
  // Resources provided
  tools: z3.array(PluginToolSchema).optional(),
  hooks: z3.array(PluginHookSchema).optional(),
  routes: z3.array(PluginRouteSchema).optional(),
  // Lifecycle methods
  onInstall: z3.function().returns(z3.promise(z3.void())).optional(),
  onUninstall: z3.function().returns(z3.promise(z3.void())).optional(),
  onEnable: z3.function().returns(z3.promise(z3.void())).optional(),
  onDisable: z3.function().returns(z3.promise(z3.void())).optional(),
  onConfigChange: z3.function().args(z3.unknown()).returns(z3.promise(z3.void())).optional()
});
var InstalledPluginSchema = z3.object({
  id: z3.string(),
  metadata: PluginMetadataSchema,
  status: PluginStatusSchema,
  capabilities: z3.array(PluginCapabilitySchema),
  config: z3.record(z3.unknown()).default({}),
  installedAt: z3.date(),
  enabledAt: z3.date().optional(),
  lastError: z3.string().optional(),
  stats: z3.object({
    hooksCalled: z3.number().default(0),
    toolsExecuted: z3.number().default(0),
    routesHit: z3.number().default(0),
    errors: z3.number().default(0)
  }).default({})
});
var PluginRegistryEntrySchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  description: z3.string(),
  author: z3.string(),
  version: z3.string(),
  category: z3.string(),
  downloads: z3.number().default(0),
  rating: z3.number().min(0).max(5).default(0),
  verified: z3.boolean().default(false),
  featured: z3.boolean().default(false),
  packageUrl: z3.string().url(),
  iconUrl: z3.string().url().optional(),
  capabilities: z3.array(PluginCapabilitySchema),
  createdAt: z3.date(),
  updatedAt: z3.date()
});
var PluginManagerConfigSchema = z3.object({
  // Storage location for plugins
  pluginsDir: z3.string().default("./plugins"),
  // Registry URL for discovering plugins
  registryUrl: z3.string().url().optional(),
  // Auto-enable plugins on install
  autoEnable: z3.boolean().default(false),
  // Sandbox plugin execution
  sandboxed: z3.boolean().default(true),
  // Max plugins allowed
  maxPlugins: z3.number().default(50),
  // Plugin timeout (ms)
  timeout: z3.number().default(3e4)
});

// src/plugins/plugin-manager.ts
import { EventEmitter as EventEmitter3 } from "eventemitter3";
var PluginManager = class extends EventEmitter3 {
  config;
  definitions = /* @__PURE__ */ new Map();
  installed = /* @__PURE__ */ new Map();
  hooks = /* @__PURE__ */ new Map();
  tools = /* @__PURE__ */ new Map();
  routes = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = {
      pluginsDir: config.pluginsDir || "./plugins",
      autoEnable: config.autoEnable ?? false,
      sandboxed: config.sandboxed ?? true,
      maxPlugins: config.maxPlugins || 50,
      timeout: config.timeout || 3e4
    };
  }
  // ==========================================================================
  // REGISTRATION
  // ==========================================================================
  /**
   * Register a plugin definition
   */
  register(definition) {
    const { id } = definition.metadata;
    if (this.definitions.has(id)) {
      throw new Error(`Plugin ${id} is already registered`);
    }
    this.validateDefinition(definition);
    this.definitions.set(id, definition);
    this.emit("plugin:registered", id);
  }
  /**
   * Unregister a plugin definition
   */
  unregister(pluginId) {
    if (!this.definitions.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }
    if (this.installed.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} must be uninstalled before unregistering`);
    }
    this.definitions.delete(pluginId);
  }
  // ==========================================================================
  // INSTALLATION
  // ==========================================================================
  /**
   * Install a registered plugin
   */
  async install(pluginId, config) {
    const definition = this.definitions.get(pluginId);
    if (!definition) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }
    if (this.installed.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already installed`);
    }
    if (this.installed.size >= this.config.maxPlugins) {
      throw new Error(`Maximum plugin limit (${this.config.maxPlugins}) reached`);
    }
    await this.checkDependencies(definition);
    const plugin = {
      id: pluginId,
      metadata: definition.metadata,
      status: "installing",
      capabilities: definition.capabilities,
      config: config || {},
      installedAt: /* @__PURE__ */ new Date(),
      stats: {
        hooksCalled: 0,
        toolsExecuted: 0,
        routesHit: 0,
        errors: 0
      }
    };
    this.installed.set(pluginId, plugin);
    try {
      if (definition.onInstall) {
        await this.runWithTimeout(definition.onInstall, this.config.timeout);
      }
      this.registerPluginResources(pluginId, definition);
      plugin.status = "installed";
      this.emit("plugin:installed", pluginId);
      if (this.config.autoEnable) {
        await this.enable(pluginId);
      }
      return plugin;
    } catch (error) {
      plugin.status = "error";
      plugin.lastError = error instanceof Error ? error.message : String(error);
      this.emit("plugin:error", pluginId, error);
      throw error;
    }
  }
  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId) {
    const plugin = this.installed.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    const definition = this.definitions.get(pluginId);
    if (plugin.status === "enabled") {
      await this.disable(pluginId);
    }
    plugin.status = "uninstalling";
    try {
      if (definition?.onUninstall) {
        await this.runWithTimeout(definition.onUninstall, this.config.timeout);
      }
      this.unregisterPluginResources(pluginId);
      this.installed.delete(pluginId);
      this.emit("plugin:uninstalled", pluginId);
    } catch (error) {
      plugin.status = "error";
      plugin.lastError = error instanceof Error ? error.message : String(error);
      this.emit("plugin:error", pluginId, error);
      throw error;
    }
  }
  // ==========================================================================
  // ENABLE / DISABLE
  // ==========================================================================
  /**
   * Enable a plugin
   */
  async enable(pluginId) {
    const plugin = this.installed.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    if (plugin.status === "enabled") {
      return;
    }
    const definition = this.definitions.get(pluginId);
    try {
      if (definition?.onEnable) {
        await this.runWithTimeout(definition.onEnable, this.config.timeout);
      }
      plugin.status = "enabled";
      plugin.enabledAt = /* @__PURE__ */ new Date();
      this.emit("plugin:enabled", pluginId);
    } catch (error) {
      plugin.status = "error";
      plugin.lastError = error instanceof Error ? error.message : String(error);
      this.emit("plugin:error", pluginId, error);
      throw error;
    }
  }
  /**
   * Disable a plugin
   */
  async disable(pluginId) {
    const plugin = this.installed.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    if (plugin.status !== "enabled") {
      return;
    }
    const definition = this.definitions.get(pluginId);
    try {
      if (definition?.onDisable) {
        await this.runWithTimeout(definition.onDisable, this.config.timeout);
      }
      plugin.status = "disabled";
      plugin.enabledAt = void 0;
      this.emit("plugin:disabled", pluginId);
    } catch (error) {
      plugin.status = "error";
      plugin.lastError = error instanceof Error ? error.message : String(error);
      this.emit("plugin:error", pluginId, error);
      throw error;
    }
  }
  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================
  /**
   * Update plugin configuration
   */
  async configure(pluginId, config) {
    const plugin = this.installed.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    const definition = this.definitions.get(pluginId);
    if (definition?.configSchema) {
      this.validateConfig(config, definition.configSchema.fields);
    }
    const oldConfig = { ...plugin.config };
    plugin.config = { ...plugin.config, ...config };
    try {
      if (definition?.onConfigChange) {
        await definition.onConfigChange({ old: oldConfig, new: plugin.config });
      }
      this.emit("plugin:config_changed", pluginId, plugin.config);
    } catch (error) {
      plugin.config = oldConfig;
      throw error;
    }
  }
  // ==========================================================================
  // HOOKS
  // ==========================================================================
  /**
   * Execute hooks for a given type
   */
  async executeHooks(hookType, context) {
    const hookEntries = this.hooks.get(hookType) || [];
    const results = [];
    const sorted = [...hookEntries].sort((a, b) => a.hook.priority - b.hook.priority);
    for (const entry of sorted) {
      const plugin = this.installed.get(entry.pluginId);
      if (!plugin || plugin.status !== "enabled") {
        continue;
      }
      try {
        const fullContext = {
          pluginId: entry.pluginId,
          hookType,
          timestamp: Date.now(),
          data: context.data,
          metadata: context.metadata || {}
        };
        const result = await this.runWithTimeout(
          () => entry.hook.handler(fullContext),
          this.config.timeout
        );
        results.push(result);
        plugin.stats.hooksCalled++;
        this.emit("hook:executed", entry.pluginId, hookType);
      } catch (error) {
        plugin.stats.errors++;
        this.emit("plugin:error", entry.pluginId, error);
      }
    }
    return results;
  }
  // ==========================================================================
  // TOOLS
  // ==========================================================================
  /**
   * Execute a plugin tool
   */
  async executeTool(toolId, context) {
    const toolEntry = this.tools.get(toolId);
    if (!toolEntry) {
      throw new Error(`Tool ${toolId} not found`);
    }
    const plugin = this.installed.get(toolEntry.pluginId);
    if (!plugin || plugin.status !== "enabled") {
      throw new Error(`Plugin ${toolEntry.pluginId} is not enabled`);
    }
    const fullContext = {
      pluginId: toolEntry.pluginId,
      toolId,
      inputs: context.inputs || {},
      executionId: context.executionId || `exec_${Date.now()}`,
      pipelineId: context.pipelineId,
      stepId: context.stepId,
      userId: context.userId,
      orgId: context.orgId
    };
    try {
      const result = await this.runWithTimeout(
        () => toolEntry.tool.execute(fullContext),
        this.config.timeout
      );
      plugin.stats.toolsExecuted++;
      this.emit("tool:executed", toolEntry.pluginId, toolId);
      return result;
    } catch (error) {
      plugin.stats.errors++;
      this.emit("plugin:error", toolEntry.pluginId, error);
      throw error;
    }
  }
  /**
   * Get all available tools
   */
  getTools() {
    return Array.from(this.tools.values()).filter((entry) => {
      const plugin = this.installed.get(entry.pluginId);
      return plugin && plugin.status === "enabled";
    });
  }
  /**
   * Get tool by ID
   */
  getTool(toolId) {
    return this.tools.get(toolId)?.tool;
  }
  // ==========================================================================
  // ROUTES
  // ==========================================================================
  /**
   * Get all plugin routes
   */
  getRoutes() {
    return Array.from(this.routes.values()).filter((entry) => {
      const plugin = this.installed.get(entry.pluginId);
      return plugin && plugin.status === "enabled";
    });
  }
  // ==========================================================================
  // QUERIES
  // ==========================================================================
  /**
   * Get all registered plugins
   */
  getRegistered() {
    return Array.from(this.definitions.values());
  }
  /**
   * Get all installed plugins
   */
  getInstalled() {
    return Array.from(this.installed.values());
  }
  /**
   * Get plugin by ID
   */
  getPlugin(pluginId) {
    return this.installed.get(pluginId);
  }
  /**
   * Get plugins by capability
   */
  getByCapability(capability) {
    return this.getInstalled().filter((p) => p.capabilities.includes(capability));
  }
  /**
   * Get enabled plugins
   */
  getEnabled() {
    return this.getInstalled().filter((p) => p.status === "enabled");
  }
  /**
   * Check if plugin is installed
   */
  isInstalled(pluginId) {
    return this.installed.has(pluginId);
  }
  /**
   * Check if plugin is enabled
   */
  isEnabled(pluginId) {
    const plugin = this.installed.get(pluginId);
    return plugin?.status === "enabled";
  }
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  validateDefinition(definition) {
    const { metadata } = definition;
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error("Plugin must have id, name, and version");
    }
    if (!/^\d+\.\d+\.\d+/.test(metadata.version)) {
      throw new Error("Plugin version must be semver format (x.y.z)");
    }
  }
  validateConfig(config, fields) {
    for (const field of fields) {
      if (field.required && !(field.key in config)) {
        throw new Error(`Missing required config field: ${field.key}`);
      }
      const value = config[field.key];
      if (value !== void 0) {
        switch (field.type) {
          case "number":
            if (typeof value !== "number") {
              throw new Error(`Config field ${field.key} must be a number`);
            }
            if (field.validation?.min !== void 0 && value < field.validation.min) {
              throw new Error(`Config field ${field.key} must be >= ${field.validation.min}`);
            }
            if (field.validation?.max !== void 0 && value > field.validation.max) {
              throw new Error(`Config field ${field.key} must be <= ${field.validation.max}`);
            }
            break;
          case "boolean":
            if (typeof value !== "boolean") {
              throw new Error(`Config field ${field.key} must be a boolean`);
            }
            break;
          case "string":
          case "secret":
            if (typeof value !== "string") {
              throw new Error(`Config field ${field.key} must be a string`);
            }
            if (field.validation?.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(value)) {
                throw new Error(`Config field ${field.key} doesn't match pattern`);
              }
            }
            break;
        }
      }
    }
  }
  async checkDependencies(definition) {
    for (const dep of definition.dependencies || []) {
      const depPlugin = this.installed.get(dep.pluginId);
      if (!depPlugin) {
        if (dep.optional) {
          continue;
        }
        throw new Error(`Missing required dependency: ${dep.pluginId}`);
      }
      if (depPlugin.status !== "enabled") {
        if (dep.optional) {
          continue;
        }
        throw new Error(`Dependency ${dep.pluginId} is not enabled`);
      }
    }
  }
  registerPluginResources(pluginId, definition) {
    for (const hook of definition.hooks || []) {
      const hookList = this.hooks.get(hook.type) || [];
      hookList.push({ pluginId, hook });
      this.hooks.set(hook.type, hookList);
    }
    for (const tool of definition.tools || []) {
      const toolId = `${pluginId}:${tool.id}`;
      this.tools.set(toolId, { pluginId, tool: { ...tool, id: toolId } });
    }
    for (const route of definition.routes || []) {
      const routeKey = `${route.method}:${route.path}`;
      this.routes.set(routeKey, { pluginId, route });
    }
  }
  unregisterPluginResources(pluginId) {
    for (const [hookType, hooks] of this.hooks.entries()) {
      this.hooks.set(hookType, hooks.filter((h) => h.pluginId !== pluginId));
    }
    for (const [toolId, entry] of this.tools.entries()) {
      if (entry.pluginId === pluginId) {
        this.tools.delete(toolId);
      }
    }
    for (const [routeKey, entry] of this.routes.entries()) {
      if (entry.pluginId === pluginId) {
        this.routes.delete(routeKey);
      }
    }
  }
  async runWithTimeout(fn, timeout) {
    return Promise.race([
      fn(),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Plugin operation timed out")), timeout)
      )
    ]);
  }
};
var pluginManagerInstance = null;
function getPluginManager() {
  if (!pluginManagerInstance) {
    pluginManagerInstance = new PluginManager();
  }
  return pluginManagerInstance;
}
function createPluginManager(config) {
  return new PluginManager(config);
}

// src/recycling/index.ts
var DEFAULT_LIMITS = {
  twitter: 280,
  farcaster: 1024,
  bluesky: 300,
  linkedin: 3e3,
  mastodon: 500,
  threads: 500
};
var DEFAULT_CONFIG = {
  limits: DEFAULT_LIMITS,
  includeLinks: true,
  includeHashtags: true,
  maxHashtags: 5,
  brandVoice: "professional",
  ctaEnabled: true,
  ctaText: "Read more:"
};
var ContentRecycler = class {
  config;
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Recycle an article into all distribution formats
   */
  async recycle(article, brief, canonicalUrl) {
    const title = brief.keyIdea || this.extractTitle(article.markdown);
    const slug = article.seo?.slug || this.generateSlug(title);
    const keyPoints = this.extractKeyPoints(article.markdown);
    const hashtags = this.generateHashtags(brief, article);
    const [
      twitterThread,
      farcasterThread,
      blueskyThread,
      linkedinPost,
      mastodonPost,
      threadsPost,
      farcasterCast,
      blueskyPost,
      lensPost,
      paragraphPost,
      redditPost,
      hnPost,
      emailDigest,
      rssEntry
    ] = await Promise.all([
      this.generateTwitterThread(article, brief, keyPoints, hashtags, canonicalUrl),
      this.generateFarcasterThread(article, brief, keyPoints, canonicalUrl),
      this.generateBlueskyThread(article, brief, keyPoints, canonicalUrl),
      this.generateLinkedInPost(article, brief, keyPoints, hashtags, canonicalUrl),
      this.generateMastodonPost(article, brief, keyPoints, hashtags, canonicalUrl),
      this.generateThreadsPost(article, brief, keyPoints, canonicalUrl),
      this.generateFarcasterCast(article, brief, keyPoints, canonicalUrl),
      this.generateBlueskyPost(article, brief, keyPoints, canonicalUrl),
      this.generateLensPost(article, brief, keyPoints, canonicalUrl),
      this.generateParagraphPost(article, brief),
      this.generateRedditPost(article, brief, keyPoints, canonicalUrl),
      this.generateHNPost(article, brief, canonicalUrl),
      this.generateEmailDigest(article, brief, keyPoints, canonicalUrl),
      this.generateRSSEntry(article, brief, canonicalUrl)
    ]);
    return {
      twitterThread,
      farcasterThread,
      blueskyThread,
      linkedinPost,
      mastodonPost,
      threadsPost,
      farcasterCast,
      blueskyPost,
      lensPost,
      paragraphPost,
      redditPost,
      hnPost,
      emailDigest,
      rssEntry,
      hashtags,
      keyPoints,
      title,
      slug
    };
  }
  /**
   * Create a distribution packet from recycled content
   */
  createDistributionPacket(recycled, article, canonicalUrl) {
    return {
      articleId: article.id,
      baseSlug: recycled.slug,
      canonicalUrl,
      blogPost: article.markdown,
      substackBody: article.markdown,
      mirrorBody: article.markdown,
      mediumBody: article.markdown,
      devtoBody: article.markdown,
      hashnodeBody: article.markdown,
      githubReadme: this.generateReadme(article, recycled),
      rssEntry: recycled.rssEntry,
      emailDigest: recycled.emailDigest,
      farcasterCast: recycled.farcasterCast,
      lensPost: recycled.lensPost,
      paragraphPost: recycled.paragraphPost,
      blueskyPost: recycled.blueskyPost,
      mastodonPost: recycled.mastodonPost,
      twitterThread: recycled.twitterThread,
      linkedinPost: recycled.linkedinPost,
      redditDraft: recycled.redditPost,
      threadsDraft: recycled.threadsPost,
      status: "ready"
    };
  }
  // ===========================================================================
  // THREAD GENERATORS
  // ===========================================================================
  async generateTwitterThread(article, brief, keyPoints, hashtags, canonicalUrl) {
    const limit = this.config.limits?.twitter || 280;
    const thread = [];
    const hook = this.generateHook(brief, "twitter");
    thread.push(this.truncate(hook, limit));
    for (const point of keyPoints.slice(0, 5)) {
      const tweet = `\u2192 ${point}`;
      thread.push(this.truncate(tweet, limit));
    }
    if (this.config.ctaEnabled && canonicalUrl) {
      const hashtagStr = this.config.includeHashtags ? `

${hashtags.slice(0, 3).map((h) => `#${h}`).join(" ")}` : "";
      const cta = `${this.config.ctaText || "Read more:"}
${canonicalUrl}${hashtagStr}`;
      thread.push(this.truncate(cta, limit));
    }
    return thread;
  }
  async generateFarcasterThread(article, brief, keyPoints, canonicalUrl) {
    const limit = this.config.limits?.farcaster || 1024;
    const thread = [];
    const hook = this.generateHook(brief, "farcaster");
    const intro = `${hook}

Key takeaways:`;
    thread.push(this.truncate(intro, limit));
    let currentPost = "";
    for (const point of keyPoints) {
      const addition = `
\u2022 ${point}`;
      if ((currentPost + addition).length > limit - 100) {
        thread.push(currentPost.trim());
        currentPost = addition;
      } else {
        currentPost += addition;
      }
    }
    if (currentPost.trim()) {
      thread.push(currentPost.trim());
    }
    if (canonicalUrl) {
      thread.push(`Read the full article: ${canonicalUrl}`);
    }
    return thread;
  }
  async generateBlueskyThread(article, brief, keyPoints, canonicalUrl) {
    const limit = this.config.limits?.bluesky || 300;
    const thread = [];
    const hook = this.generateHook(brief, "bluesky");
    thread.push(this.truncate(hook, limit));
    for (const point of keyPoints.slice(0, 4)) {
      thread.push(this.truncate(`\u2192 ${point}`, limit));
    }
    if (canonicalUrl) {
      thread.push(this.truncate(`Full article: ${canonicalUrl}`, limit));
    }
    return thread;
  }
  // ===========================================================================
  // SINGLE POST GENERATORS
  // ===========================================================================
  async generateLinkedInPost(article, brief, keyPoints, hashtags, canonicalUrl) {
    const limit = this.config.limits?.linkedin || 3e3;
    const hook = this.generateHook(brief, "linkedin");
    const pointsList = keyPoints.map((p) => `\u2022 ${p}`).join("\n");
    const hashtagStr = this.config.includeHashtags ? `

${hashtags.slice(0, 5).map((h) => `#${h}`).join(" ")}` : "";
    const link = canonicalUrl ? `

\u{1F517} ${canonicalUrl}` : "";
    const post = `${hook}

${pointsList}${link}${hashtagStr}`;
    return this.truncate(post, limit);
  }
  async generateMastodonPost(article, brief, keyPoints, hashtags, canonicalUrl) {
    const limit = this.config.limits?.mastodon || 500;
    const hook = this.generateHook(brief, "mastodon");
    const points = keyPoints.slice(0, 2).map((p) => `\u2022 ${p}`).join("\n");
    const hashtagStr = this.config.includeHashtags ? `

${hashtags.slice(0, 3).map((h) => `#${h}`).join(" ")}` : "";
    const link = canonicalUrl ? `

${canonicalUrl}` : "";
    const post = `${hook}

${points}${link}${hashtagStr}`;
    return this.truncate(post, limit);
  }
  async generateThreadsPost(article, brief, keyPoints, canonicalUrl) {
    const limit = this.config.limits?.threads || 500;
    const hook = this.generateHook(brief, "threads");
    const points = keyPoints.slice(0, 2).map((p) => `\u2192 ${p}`).join("\n");
    const link = canonicalUrl ? `

${canonicalUrl}` : "";
    const post = `${hook}

${points}${link}`;
    return this.truncate(post, limit);
  }
  async generateFarcasterCast(article, brief, keyPoints, canonicalUrl) {
    const limit = this.config.limits?.farcaster || 1024;
    const hook = this.generateHook(brief, "farcaster");
    const points = keyPoints.slice(0, 3).map((p) => `\u2022 ${p}`).join("\n");
    const link = canonicalUrl ? `

${canonicalUrl}` : "";
    const post = `${hook}

${points}${link}`;
    return this.truncate(post, limit);
  }
  async generateBlueskyPost(article, brief, keyPoints, canonicalUrl) {
    const limit = this.config.limits?.bluesky || 300;
    const hook = this.generateHook(brief, "bluesky");
    const link = canonicalUrl ? `

${canonicalUrl}` : "";
    const post = `${hook}${link}`;
    return this.truncate(post, limit);
  }
  async generateLensPost(article, brief, keyPoints, canonicalUrl) {
    const limit = 5e3;
    const hook = this.generateHook(brief, "lens");
    const points = keyPoints.map((p) => `\u2022 ${p}`).join("\n");
    const link = canonicalUrl ? `

Read more: ${canonicalUrl}` : "";
    const post = `${hook}

${points}${link}`;
    return this.truncate(post, limit);
  }
  async generateParagraphPost(article, brief) {
    return article.markdown;
  }
  // ===========================================================================
  // LONG-FORM GENERATORS
  // ===========================================================================
  async generateRedditPost(article, brief, keyPoints, canonicalUrl) {
    const title = brief.keyIdea;
    const tldr = keyPoints.slice(0, 3).map((p) => `- ${p}`).join("\n");
    const link = canonicalUrl ? `

[Full article](${canonicalUrl})` : "";
    return `# ${title}

**TL;DR:**
${tldr}

---

${article.markdown.slice(0, 5e3)}${link}`;
  }
  async generateHNPost(article, brief, canonicalUrl) {
    return canonicalUrl || brief.keyIdea;
  }
  // ===========================================================================
  // EMAIL/RSS GENERATORS
  // ===========================================================================
  async generateEmailDigest(article, brief, keyPoints, canonicalUrl) {
    const title = brief.keyIdea;
    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a;">${title}</h1>

  <h2 style="color: #666;">Key Takeaways</h2>
  <ul>
    ${keyPoints.map((p) => `<li>${p}</li>`).join("\n    ")}
  </ul>

  ${canonicalUrl ? `<p><a href="${canonicalUrl}" style="color: #0066cc;">Read the full article \u2192</a></p>` : ""}

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">You're receiving this because you subscribed to gICM updates.</p>
</body>
</html>`;
    const textBody = `${title}

${keyPoints.map((p) => `\u2022 ${p}`).join("\n")}

${canonicalUrl ? `Read more: ${canonicalUrl}` : ""}`;
    return {
      subject: title,
      previewText: keyPoints[0] || title,
      htmlBody,
      textBody
    };
  }
  async generateRSSEntry(article, brief, canonicalUrl) {
    const title = brief.keyIdea;
    const link = canonicalUrl || `https://gicm.dev/blog/${article.seo?.slug || "post"}`;
    return {
      title,
      link,
      description: article.seo?.metaDescription || article.markdown.slice(0, 500),
      pubDate: (/* @__PURE__ */ new Date()).toISOString(),
      guid: article.id,
      categories: brief.seedKeywords
    };
  }
  // ===========================================================================
  // HELPERS
  // ===========================================================================
  generateHook(brief, platform) {
    const hooks = {
      twitter: `\u{1F9F5} ${brief.keyIdea}`,
      farcaster: `${brief.keyIdea}`,
      bluesky: `${brief.keyIdea}`,
      linkedin: `${brief.keyIdea}

Here's what you need to know:`,
      mastodon: `${brief.keyIdea}`,
      threads: `${brief.keyIdea}`,
      lens: `${brief.keyIdea}`
    };
    return hooks[platform] || brief.keyIdea;
  }
  extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1] : "Untitled";
  }
  extractKeyPoints(markdown) {
    const points = [];
    const bulletMatches = markdown.match(/^[-*•]\s+(.+)$/gm);
    if (bulletMatches) {
      points.push(...bulletMatches.slice(0, 10).map((m) => m.replace(/^[-*•]\s+/, "").trim()));
    }
    const numberedMatches = markdown.match(/^\d+\.\s+(.+)$/gm);
    if (numberedMatches) {
      points.push(...numberedMatches.slice(0, 10).map((m) => m.replace(/^\d+\.\s+/, "").trim()));
    }
    if (points.length === 0) {
      const paragraphs = markdown.split(/\n\n+/).filter((p) => !p.startsWith("#") && p.length > 50);
      for (const para of paragraphs.slice(0, 5)) {
        const firstSentence = para.match(/^[^.!?]+[.!?]/);
        if (firstSentence) {
          points.push(firstSentence[0].trim());
        }
      }
    }
    return points.slice(0, 7);
  }
  generateHashtags(brief, article) {
    const hashtags = /* @__PURE__ */ new Set();
    for (const keyword of brief.seedKeywords || []) {
      hashtags.add(keyword.replace(/\s+/g, "").toLowerCase());
    }
    for (const keyword of article.seo?.keywords || []) {
      hashtags.add(keyword.replace(/\s+/g, "").toLowerCase());
    }
    const defaults = ["web3", "crypto", "ai", "defi", "solana"];
    for (const d of defaults) {
      if (hashtags.size < (this.config.maxHashtags || 5)) {
        hashtags.add(d);
      }
    }
    return Array.from(hashtags).slice(0, this.config.maxHashtags || 5);
  }
  generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  }
  generateReadme(article, recycled) {
    return `# ${recycled.title}

${article.markdown}`;
  }
  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  }
};
var instance = null;
function getContentRecycler(config) {
  if (!instance) {
    instance = new ContentRecycler(config);
  }
  return instance;
}
function createContentRecycler(config) {
  return new ContentRecycler(config);
}

// src/sdk/types.ts
import { z as z4 } from "zod";
var SDKConfigSchema = z4.object({
  baseUrl: z4.string().url(),
  apiKey: z4.string().optional(),
  timeout: z4.number().default(3e4),
  retries: z4.number().default(3),
  headers: z4.record(z4.string()).optional()
});
var PipelineSchema = z4.object({
  id: z4.string(),
  name: z4.string(),
  description: z4.string().optional(),
  status: z4.enum(["draft", "active", "paused", "archived"]),
  steps: z4.array(z4.object({
    id: z4.string(),
    tool: z4.string(),
    name: z4.string().optional(),
    inputs: z4.record(z4.unknown()),
    dependsOn: z4.array(z4.string()).optional()
  })),
  createdAt: z4.string(),
  updatedAt: z4.string()
});
var ExecutionSchema = z4.object({
  id: z4.string(),
  pipelineId: z4.string(),
  pipelineName: z4.string(),
  status: z4.enum(["pending", "running", "completed", "failed", "cancelled"]),
  progress: z4.number(),
  currentStep: z4.string().nullable(),
  steps: z4.array(z4.object({
    id: z4.string(),
    name: z4.string(),
    status: z4.enum(["pending", "running", "completed", "failed", "skipped"]),
    startedAt: z4.number().nullable(),
    completedAt: z4.number().nullable(),
    output: z4.unknown().nullable(),
    error: z4.string().nullable()
  })),
  startedAt: z4.number(),
  completedAt: z4.number().nullable(),
  result: z4.unknown().nullable(),
  error: z4.string().nullable()
});
var ScheduleSchema2 = z4.object({
  id: z4.string(),
  pipelineId: z4.string(),
  name: z4.string(),
  description: z4.string().optional(),
  cron: z4.string(),
  timezone: z4.string(),
  status: z4.enum(["active", "paused", "disabled"]),
  nextRunAt: z4.string().optional(),
  lastRunAt: z4.string().optional(),
  createdAt: z4.string(),
  updatedAt: z4.string()
});
var BudgetSchema = z4.object({
  id: z4.string(),
  name: z4.string(),
  description: z4.string().optional(),
  limit: z4.number(),
  spent: z4.number(),
  period: z4.enum(["daily", "weekly", "monthly"]),
  scope: z4.enum(["global", "pipeline", "user"]),
  scopeId: z4.string().optional(),
  status: z4.enum(["active", "paused", "exceeded"]),
  alertThresholds: z4.array(z4.number()),
  autoPause: z4.boolean(),
  createdAt: z4.string(),
  updatedAt: z4.string()
});
var WebhookSchema = z4.object({
  id: z4.string(),
  name: z4.string(),
  url: z4.string().url(),
  events: z4.array(z4.string()),
  enabled: z4.boolean(),
  lastTriggeredAt: z4.string().optional(),
  lastStatus: z4.number().optional(),
  failureCount: z4.number(),
  createdAt: z4.string(),
  updatedAt: z4.string()
});
var AnalyticsSummarySchema = z4.object({
  period: z4.string(),
  totalExecutions: z4.number(),
  successRate: z4.number(),
  avgDuration: z4.number(),
  totalTokens: z4.number(),
  totalCost: z4.number(),
  executionTrend: z4.number(),
  costTrend: z4.number(),
  topPipelines: z4.array(z4.object({
    id: z4.string(),
    name: z4.string(),
    count: z4.number(),
    successRate: z4.number()
  }))
});
var QueueJobSchema = z4.object({
  id: z4.string(),
  pipelineId: z4.string(),
  pipelineName: z4.string(),
  status: z4.enum(["waiting", "active", "completed", "failed", "delayed"]),
  priority: z4.enum(["low", "normal", "high", "critical"]),
  progress: z4.number(),
  createdAt: z4.string(),
  startedAt: z4.string().optional(),
  completedAt: z4.string().optional()
});
var OrganizationSchema2 = z4.object({
  id: z4.string(),
  name: z4.string(),
  slug: z4.string(),
  plan: z4.enum(["free", "pro", "team", "enterprise"]),
  settings: z4.record(z4.unknown()),
  createdAt: z4.string(),
  updatedAt: z4.string()
});
var MemberSchema = z4.object({
  id: z4.string(),
  userId: z4.string(),
  email: z4.string(),
  displayName: z4.string(),
  avatarUrl: z4.string().optional(),
  role: z4.enum(["owner", "admin", "editor", "viewer"]),
  status: z4.enum(["active", "inactive", "suspended"]),
  joinedAt: z4.string(),
  lastActiveAt: z4.string().optional()
});
var AuditEventSchema2 = z4.object({
  id: z4.string(),
  timestamp: z4.string(),
  category: z4.string(),
  action: z4.string(),
  severity: z4.enum(["debug", "info", "warning", "error", "critical"]),
  result: z4.enum(["success", "failure", "partial", "pending"]),
  description: z4.string(),
  context: z4.object({
    userId: z4.string().optional(),
    userEmail: z4.string().optional(),
    orgId: z4.string().optional(),
    ipAddress: z4.string().optional()
  }),
  resource: z4.object({
    type: z4.string(),
    id: z4.string(),
    name: z4.string().optional()
  }).optional()
});
var CreatePipelineInputSchema = z4.object({
  name: z4.string(),
  description: z4.string().optional(),
  steps: z4.array(z4.object({
    id: z4.string(),
    tool: z4.string(),
    name: z4.string().optional(),
    inputs: z4.record(z4.unknown()),
    dependsOn: z4.array(z4.string()).optional()
  }))
});
var ExecutePipelineInputSchema = z4.object({
  pipelineId: z4.string(),
  inputs: z4.record(z4.unknown()).optional()
});
var CreateScheduleInputSchema = z4.object({
  pipelineId: z4.string(),
  name: z4.string(),
  description: z4.string().optional(),
  cron: z4.string(),
  timezone: z4.string().optional()
});
var CreateBudgetInputSchema = z4.object({
  name: z4.string(),
  description: z4.string().optional(),
  limit: z4.number().positive(),
  period: z4.enum(["daily", "weekly", "monthly"]),
  scope: z4.enum(["global", "pipeline", "user"]).optional(),
  scopeId: z4.string().optional(),
  alertThresholds: z4.array(z4.number()).optional(),
  autoPause: z4.boolean().optional()
});
var CreateWebhookInputSchema = z4.object({
  name: z4.string(),
  url: z4.string().url(),
  secret: z4.string().optional(),
  events: z4.array(z4.string()),
  enabled: z4.boolean().optional()
});
var CreateQueueJobInputSchema = z4.object({
  pipelineId: z4.string(),
  pipelineName: z4.string(),
  inputs: z4.record(z4.unknown()).optional(),
  steps: z4.array(z4.object({
    id: z4.string(),
    tool: z4.string(),
    inputs: z4.record(z4.unknown()).optional(),
    dependsOn: z4.array(z4.string()).optional()
  })),
  priority: z4.enum(["low", "normal", "high", "critical"]).optional(),
  webhookUrl: z4.string().url().optional()
});
var InviteMemberInputSchema = z4.object({
  email: z4.string().email(),
  role: z4.enum(["admin", "editor", "viewer"]),
  message: z4.string().optional()
});

// src/sdk/client.ts
var HttpClient = class {
  baseUrl;
  headers;
  timeout;
  retries;
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout || 3e4;
    this.retries = config.retries || 3;
    this.headers = {
      "Content-Type": "application/json",
      ...config.apiKey && { Authorization: `Bearer ${config.apiKey}` },
      ...config.headers
    };
  }
  async request(method, path, options) {
    let url = `${this.baseUrl}${path}`;
    if (options?.query) {
      const params = new URLSearchParams(options.query);
      url += `?${params.toString()}`;
    }
    let lastError = null;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        const response = await fetch(url, {
          method,
          headers: this.headers,
          body: options?.body ? JSON.stringify(options.body) : void 0,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new SDKError(
            errorData.error || `HTTP ${response.status}`,
            response.status,
            errorData
          );
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        if (error instanceof SDKError && error.status >= 400 && error.status < 500) {
          throw error;
        }
        if (attempt < this.retries) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1e3));
        }
      }
    }
    throw lastError;
  }
  get(path, query) {
    return this.request("GET", path, { query });
  }
  post(path, body) {
    return this.request("POST", path, { body });
  }
  put(path, body) {
    return this.request("PUT", path, { body });
  }
  patch(path, body) {
    return this.request("PATCH", path, { body });
  }
  delete(path) {
    return this.request("DELETE", path);
  }
};
var SDKError = class extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "SDKError";
  }
};
var PipelinesClient = class {
  constructor(http) {
    this.http = http;
  }
  async list(options) {
    return this.http.get("/api/pipelines", {
      page: String(options?.page || 1),
      pageSize: String(options?.pageSize || 20)
    });
  }
  async get(id) {
    const response = await this.http.get(`/api/pipelines/${id}`);
    return response.pipeline;
  }
  async create(input) {
    const response = await this.http.post("/api/pipelines", input);
    return response.pipeline;
  }
  async update(id, input) {
    const response = await this.http.patch(`/api/pipelines/${id}`, input);
    return response.pipeline;
  }
  async delete(id) {
    await this.http.delete(`/api/pipelines/${id}`);
  }
  async execute(input) {
    const response = await this.http.post("/api/pipelines/execute", {
      pipeline: { id: input.pipelineId, name: "", steps: [] },
      inputs: input.inputs
    });
    return this.getExecution(response.executionId);
  }
  async getExecution(executionId) {
    const response = await this.http.get(`/api/pipelines/${executionId}/status`);
    return response.execution;
  }
  async listExecutions(options) {
    const response = await this.http.get("/api/pipelines/executions", {
      ...options?.status && { status: options.status },
      ...options?.limit && { limit: String(options.limit) }
    });
    return response.executions;
  }
  async cancelExecution(executionId) {
    await this.http.post(`/api/pipelines/${executionId}/cancel`);
  }
};
var SchedulesClient = class {
  constructor(http) {
    this.http = http;
  }
  async list() {
    const response = await this.http.get("/api/schedules");
    return response.schedules;
  }
  async get(id) {
    const response = await this.http.get(`/api/schedules/${id}`);
    return response.schedule;
  }
  async create(input) {
    const response = await this.http.post("/api/schedules", input);
    return response.schedule;
  }
  async update(id, input) {
    const response = await this.http.patch(`/api/schedules/${id}`, input);
    return response.schedule;
  }
  async delete(id) {
    await this.http.delete(`/api/schedules/${id}`);
  }
  async pause(id) {
    await this.http.post(`/api/schedules/${id}/pause`);
  }
  async resume(id) {
    await this.http.post(`/api/schedules/${id}/resume`);
  }
  async trigger(id) {
    await this.http.post(`/api/schedules/${id}/trigger`);
  }
};
var BudgetsClient = class {
  constructor(http) {
    this.http = http;
  }
  async list() {
    const response = await this.http.get("/api/budgets");
    return response.budgets;
  }
  async get(id) {
    const response = await this.http.get(`/api/budgets/${id}`);
    return response.budget;
  }
  async create(input) {
    const response = await this.http.post("/api/budgets", input);
    return response.budget;
  }
  async update(id, input) {
    const response = await this.http.patch(`/api/budgets/${id}`, input);
    return response.budget;
  }
  async delete(id) {
    await this.http.delete(`/api/budgets/${id}`);
  }
  async pause(id) {
    await this.http.post(`/api/budgets/${id}/pause`);
  }
  async resume(id) {
    await this.http.post(`/api/budgets/${id}/resume`);
  }
  async reset(id) {
    await this.http.post(`/api/budgets/${id}/reset`);
  }
};
var WebhooksClient = class {
  constructor(http) {
    this.http = http;
  }
  async list() {
    const response = await this.http.get("/api/webhooks");
    return response.webhooks;
  }
  async get(id) {
    const response = await this.http.get(`/api/webhooks/${id}`);
    return response.webhook;
  }
  async create(input) {
    const response = await this.http.post("/api/webhooks", input);
    return response.webhook;
  }
  async update(id, input) {
    const response = await this.http.patch(`/api/webhooks/${id}`, input);
    return response.webhook;
  }
  async delete(id) {
    await this.http.delete(`/api/webhooks/${id}`);
  }
  async test(id) {
    await this.http.post(`/api/webhooks/${id}/test`);
  }
};
var AnalyticsClient = class {
  constructor(http) {
    this.http = http;
  }
  async getSummary(period) {
    const response = await this.http.get("/api/analytics/summary", {
      ...period && { period }
    });
    return response.summary;
  }
  async getExecutions(options) {
    const response = await this.http.get("/api/analytics/executions", {
      ...options?.limit && { limit: String(options.limit) },
      ...options?.pipelineId && { pipelineId: options.pipelineId }
    });
    return response.executions;
  }
  async getTokenUsage(period) {
    return this.http.get("/api/analytics/tokens", { ...period && { period } });
  }
  async getCosts(period) {
    return this.http.get("/api/analytics/costs", { ...period && { period } });
  }
};
var QueueClient = class {
  constructor(http) {
    this.http = http;
  }
  async getStats() {
    const response = await this.http.get("/api/queue/stats");
    return response.stats;
  }
  async addJob(input) {
    const response = await this.http.post("/api/queue/jobs", input);
    return response.jobId;
  }
  async getJob(id) {
    const response = await this.http.get(`/api/queue/jobs/${id}`);
    return response.job;
  }
  async pause() {
    await this.http.post("/api/queue/pause");
  }
  async resume() {
    await this.http.post("/api/queue/resume");
  }
};
var OrganizationsClient = class {
  constructor(http) {
    this.http = http;
  }
  async getCurrent() {
    const response = await this.http.get("/api/orgs/current");
    return response.organization;
  }
  async update(input) {
    const response = await this.http.patch("/api/orgs/current", input);
    return response.organization;
  }
  async listMembers() {
    const response = await this.http.get("/api/orgs/current/members");
    return response.members;
  }
  async inviteMember(input) {
    return this.http.post("/api/orgs/current/invites", input);
  }
  async updateMemberRole(memberId, role) {
    const response = await this.http.patch(`/api/orgs/current/members/${memberId}`, { role });
    return response.member;
  }
  async removeMember(memberId) {
    await this.http.delete(`/api/orgs/current/members/${memberId}`);
  }
};
var AuditClient = class {
  constructor(http) {
    this.http = http;
  }
  async list(options) {
    return this.http.get("/api/audit", {
      ...options?.category && { category: options.category },
      ...options?.severity && { severity: options.severity },
      ...options?.startDate && { startDate: options.startDate },
      ...options?.endDate && { endDate: options.endDate },
      ...options?.limit && { limit: String(options.limit) },
      ...options?.offset && { offset: String(options.offset) }
    });
  }
  async get(id) {
    return this.http.get(`/api/audit/${id}`);
  }
  async getStats(days) {
    return this.http.get("/api/audit/stats", { ...days && { days: String(days) } });
  }
  async getSecurityEvents(options) {
    const response = await this.http.get("/api/audit/security", {
      ...options?.severity && { severity: options.severity },
      ...options?.limit && { limit: String(options.limit) }
    });
    return response.events;
  }
  async export(format, options) {
    return this.http.post("/api/audit/export", { format, ...options });
  }
};
var IntegrationHubSDK = class {
  pipelines;
  schedules;
  budgets;
  webhooks;
  analytics;
  queue;
  organizations;
  audit;
  http;
  constructor(config) {
    this.http = new HttpClient(config);
    this.pipelines = new PipelinesClient(this.http);
    this.schedules = new SchedulesClient(this.http);
    this.budgets = new BudgetsClient(this.http);
    this.webhooks = new WebhooksClient(this.http);
    this.analytics = new AnalyticsClient(this.http);
    this.queue = new QueueClient(this.http);
    this.organizations = new OrganizationsClient(this.http);
    this.audit = new AuditClient(this.http);
  }
  /**
   * Get system status
   */
  async getStatus() {
    return this.http.get("/api/status");
  }
  /**
   * Health check
   */
  async health() {
    try {
      const response = await this.http.get("/api/status");
      return response.ok;
    } catch {
      return false;
    }
  }
};
function createSDK(config) {
  return new IntegrationHubSDK(config);
}

// src/performance/types.ts
import { z as z5 } from "zod";
var MetricTypeSchema2 = z5.enum([
  "counter",
  "gauge",
  "histogram",
  "summary"
]);
var MetricUnitSchema2 = z5.enum([
  "ms",
  "seconds",
  "bytes",
  "percent",
  "count",
  "requests",
  "errors",
  "tokens",
  "dollars"
]);
var MetricSchema = z5.object({
  name: z5.string(),
  type: MetricTypeSchema2,
  value: z5.number(),
  unit: MetricUnitSchema2,
  labels: z5.record(z5.string()).optional(),
  timestamp: z5.date()
});
var SpanStatusSchema2 = z5.enum(["ok", "error", "timeout", "cancelled"]);
var SpanSchema2 = z5.object({
  spanId: z5.string(),
  traceId: z5.string(),
  parentSpanId: z5.string().optional(),
  name: z5.string(),
  service: z5.string(),
  operation: z5.string(),
  startTime: z5.date(),
  endTime: z5.date().optional(),
  duration: z5.number().optional(),
  // ms
  status: SpanStatusSchema2,
  attributes: z5.record(z5.unknown()).optional(),
  events: z5.array(
    z5.object({
      name: z5.string(),
      timestamp: z5.date(),
      attributes: z5.record(z5.unknown()).optional()
    })
  ).optional()
});
var TraceSchema2 = z5.object({
  traceId: z5.string(),
  rootSpan: SpanSchema2,
  spans: z5.array(SpanSchema2),
  startTime: z5.date(),
  endTime: z5.date().optional(),
  totalDuration: z5.number().optional(),
  // ms
  services: z5.array(z5.string()),
  status: SpanStatusSchema2
});
var LatencyPercentilesSchema = z5.object({
  p50: z5.number(),
  p75: z5.number(),
  p90: z5.number(),
  p95: z5.number(),
  p99: z5.number()
});
var ServiceStatsSchema = z5.object({
  service: z5.string(),
  requestCount: z5.number(),
  errorCount: z5.number(),
  errorRate: z5.number(),
  // percentage
  avgLatency: z5.number(),
  // ms
  latencyPercentiles: LatencyPercentilesSchema,
  throughput: z5.number()
  // requests/sec
});
var EndpointStatsSchema = z5.object({
  endpoint: z5.string(),
  method: z5.string(),
  requestCount: z5.number(),
  errorCount: z5.number(),
  errorRate: z5.number(),
  avgLatency: z5.number(),
  latencyPercentiles: LatencyPercentilesSchema,
  cacheHitRate: z5.number().optional()
});
var PipelineStatsSchema = z5.object({
  pipelineId: z5.string(),
  pipelineName: z5.string(),
  executionCount: z5.number(),
  successCount: z5.number(),
  failureCount: z5.number(),
  successRate: z5.number(),
  avgDuration: z5.number(),
  // ms
  avgTokenUsage: z5.number(),
  avgCost: z5.number()
  // dollars
});
var SystemHealthSchema = z5.object({
  status: z5.enum(["healthy", "degraded", "unhealthy"]),
  uptime: z5.number(),
  // seconds
  cpuUsage: z5.number().optional(),
  // percentage
  memoryUsage: z5.number().optional(),
  // percentage
  activeConnections: z5.number(),
  queueDepth: z5.number(),
  cacheHitRate: z5.number(),
  errorRate: z5.number()
});
var PerformanceSummarySchema = z5.object({
  period: z5.enum(["hour", "day", "week", "month"]),
  startTime: z5.date(),
  endTime: z5.date(),
  systemHealth: SystemHealthSchema,
  services: z5.array(ServiceStatsSchema),
  endpoints: z5.array(EndpointStatsSchema),
  pipelines: z5.array(PipelineStatsSchema),
  totalRequests: z5.number(),
  totalErrors: z5.number(),
  totalTokens: z5.number(),
  totalCost: z5.number()
});
var TimeSeriesPointSchema = z5.object({
  timestamp: z5.date(),
  value: z5.number()
});
var TimeSeriesSchema = z5.object({
  name: z5.string(),
  unit: MetricUnitSchema2,
  points: z5.array(TimeSeriesPointSchema),
  aggregation: z5.enum(["sum", "avg", "min", "max", "count"])
});
var AlertSeveritySchema = z5.enum(["info", "warning", "error", "critical"]);
var AlertStatusSchema = z5.enum(["firing", "resolved", "acknowledged"]);
var AlertRuleSchema = z5.object({
  id: z5.string(),
  name: z5.string(),
  description: z5.string().optional(),
  metric: z5.string(),
  condition: z5.enum(["gt", "gte", "lt", "lte", "eq", "neq"]),
  threshold: z5.number(),
  duration: z5.number(),
  // seconds - how long condition must be true
  severity: AlertSeveritySchema,
  labels: z5.record(z5.string()).optional(),
  enabled: z5.boolean()
});
var AlertSchema = z5.object({
  id: z5.string(),
  ruleId: z5.string(),
  ruleName: z5.string(),
  severity: AlertSeveritySchema,
  status: AlertStatusSchema,
  message: z5.string(),
  value: z5.number(),
  threshold: z5.number(),
  startedAt: z5.date(),
  resolvedAt: z5.date().optional(),
  acknowledgedAt: z5.date().optional(),
  acknowledgedBy: z5.string().optional(),
  labels: z5.record(z5.string()).optional()
});
var PerformanceConfigSchema = z5.object({
  // Collection
  metricsEnabled: z5.boolean().default(true),
  tracingEnabled: z5.boolean().default(true),
  samplingRate: z5.number().min(0).max(1).default(0.1),
  // 10% by default
  // Retention
  metricsRetentionDays: z5.number().default(30),
  tracesRetentionDays: z5.number().default(7),
  alertsRetentionDays: z5.number().default(90),
  // Aggregation
  aggregationIntervalMs: z5.number().default(6e4),
  // 1 minute
  // Alerting
  alertingEnabled: z5.boolean().default(true),
  alertWebhookUrl: z5.string().url().optional()
});
var DEFAULT_ALERT_RULES = [
  {
    name: "High Error Rate",
    description: "Error rate exceeds 5%",
    metric: "error_rate",
    condition: "gt",
    threshold: 5,
    duration: 300,
    // 5 minutes
    severity: "error",
    enabled: true
  },
  {
    name: "High Latency",
    description: "P95 latency exceeds 2 seconds",
    metric: "latency_p95",
    condition: "gt",
    threshold: 2e3,
    duration: 300,
    severity: "warning",
    enabled: true
  },
  {
    name: "High Queue Depth",
    description: "Queue depth exceeds 1000 jobs",
    metric: "queue_depth",
    condition: "gt",
    threshold: 1e3,
    duration: 600,
    // 10 minutes
    severity: "warning",
    enabled: true
  },
  {
    name: "Low Cache Hit Rate",
    description: "Cache hit rate below 50%",
    metric: "cache_hit_rate",
    condition: "lt",
    threshold: 50,
    duration: 900,
    // 15 minutes
    severity: "info",
    enabled: true
  },
  {
    name: "High Token Usage",
    description: "Token usage exceeds daily budget",
    metric: "daily_token_usage",
    condition: "gt",
    threshold: 1e6,
    // 1M tokens
    duration: 0,
    // Immediate
    severity: "warning",
    enabled: true
  },
  {
    name: "Service Unhealthy",
    description: "Service health check failing",
    metric: "service_health",
    condition: "eq",
    threshold: 0,
    // 0 = unhealthy
    duration: 120,
    // 2 minutes
    severity: "critical",
    enabled: true
  }
];

// src/performance/performance-manager.ts
import { EventEmitter as EventEmitter4 } from "eventemitter3";
import { randomUUID as randomUUID2 } from "crypto";
var PerformanceManager = class extends EventEmitter4 {
  config;
  metrics = /* @__PURE__ */ new Map();
  activeSpans = /* @__PURE__ */ new Map();
  traces = /* @__PURE__ */ new Map();
  alerts = /* @__PURE__ */ new Map();
  alertRules = /* @__PURE__ */ new Map();
  startTime;
  aggregationTimer;
  alertCheckTimer;
  constructor(config = {}) {
    super();
    this.config = PerformanceConfigSchema.parse(config);
    this.startTime = /* @__PURE__ */ new Date();
    for (const rule of DEFAULT_ALERT_RULES) {
      const id = randomUUID2();
      this.alertRules.set(id, { ...rule, id });
    }
  }
  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================
  start() {
    if (this.config.metricsEnabled) {
      this.aggregationTimer = setInterval(() => {
        this.aggregate();
      }, this.config.aggregationIntervalMs);
    }
    if (this.config.alertingEnabled) {
      this.alertCheckTimer = setInterval(() => {
        this.checkAlerts();
      }, 3e4);
    }
  }
  stop() {
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
    }
    if (this.alertCheckTimer) {
      clearInterval(this.alertCheckTimer);
    }
  }
  // ==========================================================================
  // METRICS
  // ==========================================================================
  recordMetric(name, value, options = {}) {
    if (!this.config.metricsEnabled) return;
    const metric = {
      name,
      value,
      type: options.type || "gauge",
      unit: options.unit || "count",
      labels: options.labels,
      timestamp: /* @__PURE__ */ new Date()
    };
    const key = this.getMetricKey(name, options.labels);
    const existing = this.metrics.get(key) || [];
    existing.push(metric);
    const cutoff = Date.now() - 36e5;
    const filtered = existing.filter((m) => m.timestamp.getTime() > cutoff);
    this.metrics.set(key, filtered);
    this.emit("metric:recorded", metric);
  }
  incrementCounter(name, value = 1, labels) {
    this.recordMetric(name, value, { type: "counter", unit: "count", labels });
  }
  recordLatency(name, durationMs, labels) {
    this.recordMetric(name, durationMs, { type: "histogram", unit: "ms", labels });
  }
  recordGauge(name, value, unit = "count", labels) {
    this.recordMetric(name, value, { type: "gauge", unit, labels });
  }
  getMetricKey(name, labels) {
    if (!labels) return name;
    const labelStr = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join(",");
    return `${name}{${labelStr}}`;
  }
  getMetricTimeSeries(name, labels, aggregation = "avg") {
    const key = this.getMetricKey(name, labels);
    const metrics = this.metrics.get(key) || [];
    const buckets = /* @__PURE__ */ new Map();
    for (const m of metrics) {
      const bucket = Math.floor(m.timestamp.getTime() / 6e4) * 6e4;
      const values = buckets.get(bucket) || [];
      values.push(m.value);
      buckets.set(bucket, values);
    }
    const points = [];
    for (const [timestamp, values] of buckets) {
      let value;
      switch (aggregation) {
        case "sum":
          value = values.reduce((a, b) => a + b, 0);
          break;
        case "min":
          value = Math.min(...values);
          break;
        case "max":
          value = Math.max(...values);
          break;
        case "count":
          value = values.length;
          break;
        default:
          value = values.reduce((a, b) => a + b, 0) / values.length;
      }
      points.push({ timestamp: new Date(timestamp), value });
    }
    points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return {
      name,
      unit: metrics[0]?.unit || "count",
      points,
      aggregation
    };
  }
  // ==========================================================================
  // TRACING
  // ==========================================================================
  startSpan(name, options = {}) {
    if (!this.config.tracingEnabled) {
      return {
        spanId: "",
        traceId: "",
        name,
        service: "",
        operation: "",
        startTime: /* @__PURE__ */ new Date(),
        status: "ok"
      };
    }
    if (Math.random() > this.config.samplingRate) {
      return {
        spanId: "",
        traceId: "",
        name,
        service: "",
        operation: "",
        startTime: /* @__PURE__ */ new Date(),
        status: "ok"
      };
    }
    const span = {
      spanId: randomUUID2(),
      traceId: options.traceId || randomUUID2(),
      parentSpanId: options.parentSpanId,
      name,
      service: options.service || "integration-hub",
      operation: options.operation || name,
      startTime: /* @__PURE__ */ new Date(),
      status: "ok",
      attributes: options.attributes,
      events: []
    };
    this.activeSpans.set(span.spanId, span);
    if (!this.traces.has(span.traceId)) {
      this.traces.set(span.traceId, {
        traceId: span.traceId,
        rootSpan: span,
        spans: [span],
        startTime: span.startTime,
        services: [span.service],
        status: "ok"
      });
    } else {
      const trace = this.traces.get(span.traceId);
      trace.spans.push(span);
      if (!trace.services.includes(span.service)) {
        trace.services.push(span.service);
      }
    }
    this.emit("span:started", span);
    return span;
  }
  endSpan(spanId, options = {}) {
    const span = this.activeSpans.get(spanId);
    if (!span || !span.spanId) return void 0;
    span.endTime = /* @__PURE__ */ new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = options.status || "ok";
    if (options.attributes) {
      span.attributes = { ...span.attributes, ...options.attributes };
    }
    this.activeSpans.delete(spanId);
    this.emit("span:ended", span);
    this.recordLatency(`${span.service}.${span.operation}.latency`, span.duration, {
      service: span.service,
      operation: span.operation
    });
    const trace = this.traces.get(span.traceId);
    if (trace) {
      const allEnded = trace.spans.every((s) => s.endTime);
      if (allEnded) {
        trace.endTime = /* @__PURE__ */ new Date();
        trace.totalDuration = trace.endTime.getTime() - trace.startTime.getTime();
        trace.status = trace.spans.some((s) => s.status === "error") ? "error" : trace.spans.some((s) => s.status === "timeout") ? "timeout" : "ok";
        this.emit("trace:completed", trace);
      }
    }
    return span;
  }
  addSpanEvent(spanId, eventName, attributes) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;
    span.events = span.events || [];
    span.events.push({
      name: eventName,
      timestamp: /* @__PURE__ */ new Date(),
      attributes
    });
  }
  getTrace(traceId) {
    return this.traces.get(traceId);
  }
  getRecentTraces(limit = 100) {
    const traces = Array.from(this.traces.values());
    traces.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    return traces.slice(0, limit);
  }
  // ==========================================================================
  // ALERTS
  // ==========================================================================
  addAlertRule(rule) {
    const id = randomUUID2();
    const alertRule = { ...rule, id };
    this.alertRules.set(id, alertRule);
    return alertRule;
  }
  updateAlertRule(id, updates) {
    const rule = this.alertRules.get(id);
    if (!rule) return void 0;
    const updated = { ...rule, ...updates, id };
    this.alertRules.set(id, updated);
    return updated;
  }
  deleteAlertRule(id) {
    return this.alertRules.delete(id);
  }
  getAlertRules() {
    return Array.from(this.alertRules.values());
  }
  getAlerts(status) {
    const alerts = Array.from(this.alerts.values());
    if (status) {
      return alerts.filter((a) => a.status === status);
    }
    return alerts;
  }
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status !== "firing") return void 0;
    alert.status = "acknowledged";
    alert.acknowledgedAt = /* @__PURE__ */ new Date();
    alert.acknowledgedBy = userId;
    return alert;
  }
  checkAlerts() {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;
      const value = this.getCurrentMetricValue(rule.metric);
      if (value === void 0) continue;
      const conditionMet = this.evaluateCondition(value, rule.condition, rule.threshold);
      const existingAlert = this.findAlertByRule(rule.id);
      if (conditionMet) {
        if (!existingAlert) {
          const alert = {
            id: randomUUID2(),
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            status: "firing",
            message: rule.description || `${rule.name} triggered`,
            value,
            threshold: rule.threshold,
            startedAt: /* @__PURE__ */ new Date(),
            labels: rule.labels
          };
          this.alerts.set(alert.id, alert);
          this.emit("alert:fired", alert);
        }
      } else if (existingAlert && existingAlert.status === "firing") {
        existingAlert.status = "resolved";
        existingAlert.resolvedAt = /* @__PURE__ */ new Date();
        this.emit("alert:resolved", existingAlert);
      }
    }
  }
  getCurrentMetricValue(metricName) {
    const key = this.getMetricKey(metricName);
    const metrics = this.metrics.get(key);
    if (!metrics || metrics.length === 0) return void 0;
    return metrics[metrics.length - 1].value;
  }
  evaluateCondition(value, condition, threshold) {
    switch (condition) {
      case "gt":
        return value > threshold;
      case "gte":
        return value >= threshold;
      case "lt":
        return value < threshold;
      case "lte":
        return value <= threshold;
      case "eq":
        return value === threshold;
      case "neq":
        return value !== threshold;
      default:
        return false;
    }
  }
  findAlertByRule(ruleId) {
    for (const alert of this.alerts.values()) {
      if (alert.ruleId === ruleId && alert.status === "firing") {
        return alert;
      }
    }
    return void 0;
  }
  // ==========================================================================
  // HEALTH & SUMMARY
  // ==========================================================================
  getSystemHealth() {
    const now = Date.now();
    const uptime = Math.floor((now - this.startTime.getTime()) / 1e3);
    const totalRequests = this.getAggregatedValue("http.requests.total", "sum") || 0;
    const totalErrors = this.getAggregatedValue("http.errors.total", "sum") || 0;
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests * 100 : 0;
    const queueDepth = this.getAggregatedValue("queue.depth", "avg") || 0;
    const cacheHits = this.getAggregatedValue("cache.hits", "sum") || 0;
    const cacheMisses = this.getAggregatedValue("cache.misses", "sum") || 0;
    const cacheTotal = cacheHits + cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? cacheHits / cacheTotal * 100 : 0;
    let status = "healthy";
    if (errorRate > 10 || queueDepth > 5e3) {
      status = "unhealthy";
    } else if (errorRate > 5 || queueDepth > 1e3 || cacheHitRate < 30) {
      status = "degraded";
    }
    const health = {
      status,
      uptime,
      activeConnections: this.activeSpans.size,
      queueDepth,
      cacheHitRate,
      errorRate
    };
    this.emit("health:changed", health);
    return health;
  }
  getSummary(period = "day") {
    const now = /* @__PURE__ */ new Date();
    const periodMs = {
      hour: 36e5,
      day: 864e5,
      week: 6048e5,
      month: 2592e6
    }[period];
    const startTime = new Date(now.getTime() - periodMs);
    return {
      period,
      startTime,
      endTime: now,
      systemHealth: this.getSystemHealth(),
      services: this.getServiceStats(startTime),
      endpoints: this.getEndpointStats(startTime),
      pipelines: this.getPipelineStats(startTime),
      totalRequests: this.getAggregatedValue("http.requests.total", "sum", startTime) || 0,
      totalErrors: this.getAggregatedValue("http.errors.total", "sum", startTime) || 0,
      totalTokens: this.getAggregatedValue("llm.tokens.total", "sum", startTime) || 0,
      totalCost: this.getAggregatedValue("cost.total", "sum", startTime) || 0
    };
  }
  getAggregatedValue(metricName, aggregation, since) {
    const key = this.getMetricKey(metricName);
    let metrics = this.metrics.get(key) || [];
    if (since) {
      metrics = metrics.filter((m) => m.timestamp >= since);
    }
    if (metrics.length === 0) return void 0;
    const values = metrics.map((m) => m.value);
    switch (aggregation) {
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "avg":
        return values.reduce((a, b) => a + b, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
    }
  }
  getServiceStats(since) {
    const services = /* @__PURE__ */ new Map();
    for (const trace of this.traces.values()) {
      if (trace.startTime < since) continue;
      for (const span of trace.spans) {
        const stats = services.get(span.service) || {
          requests: 0,
          errors: 0,
          latencies: []
        };
        stats.requests++;
        if (span.status === "error") stats.errors++;
        if (span.duration) stats.latencies.push(span.duration);
        services.set(span.service, stats);
      }
    }
    return Array.from(services.entries()).map(([service, stats]) => ({
      service,
      requestCount: stats.requests,
      errorCount: stats.errors,
      errorRate: stats.requests > 0 ? stats.errors / stats.requests * 100 : 0,
      avgLatency: stats.latencies.length > 0 ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length : 0,
      latencyPercentiles: this.calculatePercentiles(stats.latencies),
      throughput: stats.requests / ((Date.now() - since.getTime()) / 1e3)
    }));
  }
  getEndpointStats(since) {
    const endpoints = /* @__PURE__ */ new Map();
    for (const [key, metrics] of this.metrics) {
      if (!key.includes("endpoint=")) continue;
      const filtered = metrics.filter((m) => m.timestamp >= since);
      if (filtered.length === 0) continue;
      const match = key.match(/endpoint=([^,}]+)/);
      const endpoint = match?.[1] || "unknown";
      const stats = endpoints.get(endpoint) || {
        requests: 0,
        errors: 0,
        latencies: []
      };
      for (const m of filtered) {
        if (m.name.includes("request")) stats.requests += m.value;
        if (m.name.includes("error")) stats.errors += m.value;
        if (m.name.includes("latency")) stats.latencies.push(m.value);
      }
      endpoints.set(endpoint, stats);
    }
    return Array.from(endpoints.entries()).map(([endpoint, stats]) => ({
      endpoint,
      method: "ALL",
      requestCount: stats.requests,
      errorCount: stats.errors,
      errorRate: stats.requests > 0 ? stats.errors / stats.requests * 100 : 0,
      avgLatency: stats.latencies.length > 0 ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length : 0,
      latencyPercentiles: this.calculatePercentiles(stats.latencies)
    }));
  }
  getPipelineStats(since) {
    const pipelines = /* @__PURE__ */ new Map();
    for (const [key, metrics] of this.metrics) {
      if (!key.includes("pipeline_id=")) continue;
      const filtered = metrics.filter((m) => m.timestamp >= since);
      if (filtered.length === 0) continue;
      const match = key.match(/pipeline_id=([^,}]+)/);
      const pipelineId = match?.[1] || "unknown";
      const stats = pipelines.get(pipelineId) || {
        executions: 0,
        successes: 0,
        failures: 0,
        durations: [],
        tokens: [],
        costs: []
      };
      for (const m of filtered) {
        if (m.name.includes("execution")) stats.executions++;
        if (m.name.includes("success")) stats.successes += m.value;
        if (m.name.includes("failure")) stats.failures += m.value;
        if (m.name.includes("duration")) stats.durations.push(m.value);
        if (m.name.includes("tokens")) stats.tokens.push(m.value);
        if (m.name.includes("cost")) stats.costs.push(m.value);
      }
      pipelines.set(pipelineId, stats);
    }
    return Array.from(pipelines.entries()).map(([pipelineId, stats]) => ({
      pipelineId,
      pipelineName: pipelineId,
      // Would need to look up actual name
      executionCount: stats.executions,
      successCount: stats.successes,
      failureCount: stats.failures,
      successRate: stats.executions > 0 ? stats.successes / stats.executions * 100 : 0,
      avgDuration: stats.durations.length > 0 ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length : 0,
      avgTokenUsage: stats.tokens.length > 0 ? stats.tokens.reduce((a, b) => a + b, 0) / stats.tokens.length : 0,
      avgCost: stats.costs.length > 0 ? stats.costs.reduce((a, b) => a + b, 0) / stats.costs.length : 0
    }));
  }
  calculatePercentiles(values) {
    if (values.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const percentile = (p) => {
      const index = Math.ceil(p / 100 * sorted.length) - 1;
      return sorted[Math.max(0, index)];
    };
    return {
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99)
    };
  }
  // ==========================================================================
  // AGGREGATION & CLEANUP
  // ==========================================================================
  aggregate() {
    const now = Date.now();
    const metricsRetentionMs = this.config.metricsRetentionDays * 864e5;
    const tracesRetentionMs = this.config.tracesRetentionDays * 864e5;
    for (const [key, metrics] of this.metrics) {
      const cutoff = now - metricsRetentionMs;
      const filtered = metrics.filter((m) => m.timestamp.getTime() > cutoff);
      if (filtered.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filtered);
      }
    }
    const traceCutoff = now - tracesRetentionMs;
    for (const [traceId, trace] of this.traces) {
      if (trace.startTime.getTime() < traceCutoff) {
        this.traces.delete(traceId);
      }
    }
    const alertsCutoff = now - this.config.alertsRetentionDays * 864e5;
    for (const [alertId, alert] of this.alerts) {
      if (alert.status === "resolved" && alert.resolvedAt && alert.resolvedAt.getTime() < alertsCutoff) {
        this.alerts.delete(alertId);
      }
    }
  }
};
var instance2 = null;
function getPerformanceManager() {
  if (!instance2) {
    instance2 = new PerformanceManager();
  }
  return instance2;
}
function createPerformanceManager(config = {}) {
  instance2 = new PerformanceManager(config);
  return instance2;
}

// src/intelligence/types.ts
import { z as z6 } from "zod";
var SuggestionTypeSchema = z6.enum([
  "optimization",
  // Performance improvements
  "cost_reduction",
  // Cost saving opportunities
  "error_fix",
  // Fix for common errors
  "best_practice",
  // Industry best practices
  "security",
  // Security improvements
  "reliability",
  // Reliability enhancements
  "similar_pipeline"
  // Similar existing pipelines
]);
var SuggestionPrioritySchema = z6.enum(["low", "medium", "high", "critical"]);
var SuggestionStatusSchema = z6.enum([
  "pending",
  "applied",
  "dismissed",
  "expired"
]);
var SuggestionSchema = z6.object({
  id: z6.string(),
  type: SuggestionTypeSchema,
  priority: SuggestionPrioritySchema,
  status: SuggestionStatusSchema,
  title: z6.string(),
  description: z6.string(),
  reasoning: z6.string(),
  pipelineId: z6.string().optional(),
  stepIndex: z6.number().optional(),
  // Impact estimates
  estimatedImpact: z6.object({
    costReduction: z6.number().optional(),
    // percentage
    speedImprovement: z6.number().optional(),
    // percentage
    reliabilityGain: z6.number().optional(),
    // percentage
    tokenSavings: z6.number().optional()
    // absolute
  }).optional(),
  // Auto-fix capability
  autoFixAvailable: z6.boolean(),
  autoFixConfig: z6.record(z6.unknown()).optional(),
  // Metadata
  confidence: z6.number().min(0).max(1),
  createdAt: z6.date(),
  expiresAt: z6.date().optional(),
  appliedAt: z6.date().optional(),
  dismissedAt: z6.date().optional(),
  dismissReason: z6.string().optional()
});
var SimilarPipelineSchema = z6.object({
  pipelineId: z6.string(),
  pipelineName: z6.string(),
  similarity: z6.number().min(0).max(1),
  // 0-1 score
  matchedFeatures: z6.array(z6.string()),
  differingFeatures: z6.array(z6.string()),
  performanceComparison: z6.object({
    avgDuration: z6.number(),
    avgCost: z6.number(),
    successRate: z6.number()
  }).optional()
});
var OptimizationCategorySchema = z6.enum([
  "prompt_efficiency",
  // Reduce token usage in prompts
  "step_consolidation",
  // Merge redundant steps
  "parallel_execution",
  // Run steps in parallel
  "caching",
  // Add caching for repeated calls
  "model_selection",
  // Use appropriate model for task
  "retry_strategy",
  // Optimize retry logic
  "batching",
  // Batch similar operations
  "early_termination"
  // Add early exit conditions
]);
var OptimizationSchema = z6.object({
  id: z6.string(),
  category: OptimizationCategorySchema,
  title: z6.string(),
  description: z6.string(),
  currentValue: z6.string(),
  suggestedValue: z6.string(),
  estimatedSavings: z6.object({
    tokens: z6.number().optional(),
    cost: z6.number().optional(),
    time: z6.number().optional()
    // ms
  }),
  codeChange: z6.object({
    before: z6.string(),
    after: z6.string(),
    stepIndex: z6.number().optional()
  }).optional(),
  confidence: z6.number().min(0).max(1)
});
var ErrorPatternSchema = z6.object({
  id: z6.string(),
  pattern: z6.string(),
  // Regex or string pattern
  errorType: z6.string(),
  frequency: z6.number(),
  // How often this occurs
  description: z6.string(),
  commonCauses: z6.array(z6.string()),
  suggestedFixes: z6.array(z6.object({
    title: z6.string(),
    description: z6.string(),
    autoFixable: z6.boolean(),
    fixConfig: z6.record(z6.unknown()).optional()
  }))
});
var AutoFixSchema = z6.object({
  id: z6.string(),
  errorPatternId: z6.string(),
  pipelineId: z6.string(),
  stepIndex: z6.number().optional(),
  fixType: z6.enum(["config_change", "step_modification", "retry_config", "model_change", "prompt_edit"]),
  originalConfig: z6.record(z6.unknown()),
  fixedConfig: z6.record(z6.unknown()),
  applied: z6.boolean(),
  appliedAt: z6.date().optional(),
  rollbackAvailable: z6.boolean()
});
var PipelineAnalysisSchema = z6.object({
  pipelineId: z6.string(),
  analyzedAt: z6.date(),
  // Health scores (0-100)
  scores: z6.object({
    overall: z6.number(),
    efficiency: z6.number(),
    reliability: z6.number(),
    costEffectiveness: z6.number(),
    maintainability: z6.number()
  }),
  // Findings
  suggestions: z6.array(SuggestionSchema),
  optimizations: z6.array(OptimizationSchema),
  similarPipelines: z6.array(SimilarPipelineSchema),
  errorPatterns: z6.array(ErrorPatternSchema),
  // Stats
  executionStats: z6.object({
    totalExecutions: z6.number(),
    successRate: z6.number(),
    avgDuration: z6.number(),
    avgCost: z6.number(),
    avgTokens: z6.number()
  })
});
var IntelligenceConfigSchema = z6.object({
  // Analysis settings
  analysisEnabled: z6.boolean().default(true),
  autoAnalyzeNewPipelines: z6.boolean().default(true),
  analysisIntervalHours: z6.number().default(24),
  // Suggestions
  suggestionsEnabled: z6.boolean().default(true),
  minConfidenceThreshold: z6.number().min(0).max(1).default(0.7),
  maxSuggestionsPerPipeline: z6.number().default(10),
  // Auto-fix
  autoFixEnabled: z6.boolean().default(false),
  // Opt-in
  autoFixMinConfidence: z6.number().min(0).max(1).default(0.9),
  autoFixCategories: z6.array(z6.string()).default([]),
  // Similar pipelines
  similarityThreshold: z6.number().min(0).max(1).default(0.7),
  maxSimilarPipelines: z6.number().default(5),
  // LLM settings
  llmModel: z6.string().default("claude-3-haiku-20240307"),
  maxAnalysisTokens: z6.number().default(4e3)
});
var OPTIMIZATION_TEMPLATES = {
  prompt_efficiency: {
    title: "Optimize Prompt Length",
    description: "Reduce token usage by streamlining prompts",
    checkFn: "checkPromptEfficiency"
  },
  step_consolidation: {
    title: "Consolidate Steps",
    description: "Merge similar or redundant pipeline steps",
    checkFn: "checkStepConsolidation"
  },
  parallel_execution: {
    title: "Enable Parallel Execution",
    description: "Run independent steps concurrently",
    checkFn: "checkParallelOpportunities"
  },
  caching: {
    title: "Add Result Caching",
    description: "Cache repeated LLM calls with same inputs",
    checkFn: "checkCachingOpportunities"
  },
  model_selection: {
    title: "Optimize Model Selection",
    description: "Use cost-effective models for simpler tasks",
    checkFn: "checkModelSelection"
  },
  retry_strategy: {
    title: "Improve Retry Strategy",
    description: "Optimize retry logic to reduce failures",
    checkFn: "checkRetryStrategy"
  },
  batching: {
    title: "Batch Operations",
    description: "Combine multiple similar operations",
    checkFn: "checkBatchingOpportunities"
  },
  early_termination: {
    title: "Add Early Exit",
    description: "Skip unnecessary steps based on conditions",
    checkFn: "checkEarlyTermination"
  }
};
var COMMON_ERROR_PATTERNS = [
  {
    pattern: "rate_limit|429|too many requests",
    errorType: "rate_limit",
    description: "API rate limit exceeded",
    commonCauses: [
      "Too many concurrent requests",
      "Burst of requests without backoff",
      "Missing rate limiting on client side"
    ],
    suggestedFixes: [
      {
        title: "Add exponential backoff",
        description: "Implement exponential backoff with jitter",
        autoFixable: true,
        fixConfig: { retryDelay: "exponential", maxRetries: 3 }
      },
      {
        title: "Add request queuing",
        description: "Queue requests to respect rate limits",
        autoFixable: true,
        fixConfig: { enableQueue: true, maxConcurrent: 5 }
      }
    ]
  },
  {
    pattern: "timeout|ETIMEDOUT|deadline exceeded",
    errorType: "timeout",
    description: "Request timed out",
    commonCauses: [
      "Long-running LLM inference",
      "Network latency",
      "Timeout too short for task"
    ],
    suggestedFixes: [
      {
        title: "Increase timeout",
        description: "Extend timeout for complex operations",
        autoFixable: true,
        fixConfig: { timeout: 12e4 }
      },
      {
        title: "Break into smaller steps",
        description: "Split long operations into smaller chunks",
        autoFixable: false
      }
    ]
  },
  {
    pattern: "context.length|max.tokens|token limit",
    errorType: "token_limit",
    description: "Token limit exceeded",
    commonCauses: [
      "Prompt too long",
      "Input data too large",
      "Accumulated context in conversation"
    ],
    suggestedFixes: [
      {
        title: "Truncate input",
        description: "Limit input size to fit context window",
        autoFixable: true,
        fixConfig: { maxInputTokens: 3e3 }
      },
      {
        title: "Use larger context model",
        description: "Switch to model with larger context window",
        autoFixable: true,
        fixConfig: { model: "claude-3-sonnet-20240229" }
      }
    ]
  },
  {
    pattern: "invalid.json|JSON.parse|Unexpected token",
    errorType: "json_parse",
    description: "Failed to parse JSON response",
    commonCauses: [
      "LLM returned malformed JSON",
      "Missing JSON mode instruction",
      "Response truncated"
    ],
    suggestedFixes: [
      {
        title: "Add JSON mode",
        description: "Force JSON output format",
        autoFixable: true,
        fixConfig: { outputFormat: "json" }
      },
      {
        title: "Add JSON validation prompt",
        description: "Include explicit JSON formatting instructions",
        autoFixable: true
      }
    ]
  },
  {
    pattern: "authentication|unauthorized|401|invalid.key",
    errorType: "auth_error",
    description: "Authentication failed",
    commonCauses: [
      "Invalid or expired API key",
      "Missing credentials",
      "Wrong environment"
    ],
    suggestedFixes: [
      {
        title: "Check API key",
        description: "Verify API key is valid and not expired",
        autoFixable: false
      }
    ]
  }
];

// src/intelligence/suggestion-engine.ts
import { EventEmitter as EventEmitter5 } from "eventemitter3";
import { randomUUID as randomUUID3 } from "crypto";
var SuggestionEngine = class extends EventEmitter5 {
  config;
  suggestions = /* @__PURE__ */ new Map();
  analyses = /* @__PURE__ */ new Map();
  autoFixes = /* @__PURE__ */ new Map();
  pipelineCache = /* @__PURE__ */ new Map();
  executionCache = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = IntelligenceConfigSchema.parse(config);
  }
  // ==========================================================================
  // PIPELINE ANALYSIS
  // ==========================================================================
  async analyzePipeline(pipeline, history) {
    if (!this.config.analysisEnabled) {
      throw new Error("Analysis is disabled");
    }
    this.emit("analysis:started", pipeline.id);
    this.pipelineCache.set(pipeline.id, pipeline);
    if (history) {
      this.executionCache.set(pipeline.id, history);
    }
    const [suggestions, optimizations, similarPipelines, errorPatterns] = await Promise.all([
      this.generateSuggestions(pipeline, history),
      this.findOptimizations(pipeline, history),
      this.findSimilarPipelines(pipeline),
      this.analyzeErrorPatterns(pipeline, history)
    ]);
    const scores = this.calculateScores(pipeline, history, optimizations);
    const executionStats = this.computeExecutionStats(history);
    const analysis = {
      pipelineId: pipeline.id,
      analyzedAt: /* @__PURE__ */ new Date(),
      scores,
      suggestions: suggestions.slice(0, this.config.maxSuggestionsPerPipeline),
      optimizations,
      similarPipelines: similarPipelines.slice(0, this.config.maxSimilarPipelines),
      errorPatterns,
      executionStats
    };
    this.analyses.set(pipeline.id, analysis);
    this.emit("analysis:completed", analysis);
    return analysis;
  }
  getAnalysis(pipelineId) {
    return this.analyses.get(pipelineId);
  }
  // ==========================================================================
  // SUGGESTIONS
  // ==========================================================================
  async generateSuggestions(pipeline, history) {
    const suggestions = [];
    if (pipeline.steps.length > 5) {
      suggestions.push(this.createSuggestion({
        type: "optimization",
        priority: "medium",
        title: "Consider breaking down pipeline",
        description: `Pipeline has ${pipeline.steps.length} steps. Consider splitting into smaller, focused pipelines for better maintainability.`,
        reasoning: "Pipelines with many steps are harder to debug and maintain. Smaller pipelines are more reusable.",
        pipelineId: pipeline.id,
        confidence: 0.75,
        estimatedImpact: { reliabilityGain: 15 }
      }));
    }
    const hasRetryConfig = pipeline.steps.some((s) => s.config?.retry);
    if (!hasRetryConfig && pipeline.steps.length > 2) {
      suggestions.push(this.createSuggestion({
        type: "reliability",
        priority: "high",
        title: "Add retry logic",
        description: "Pipeline lacks retry configuration. Add retry logic to handle transient failures.",
        reasoning: "LLM APIs can have intermittent failures. Retry logic improves reliability.",
        pipelineId: pipeline.id,
        confidence: 0.85,
        autoFixAvailable: true,
        autoFixConfig: { addRetry: true, maxRetries: 3, retryDelay: 1e3 },
        estimatedImpact: { reliabilityGain: 25 }
      }));
    }
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      if (this.isExpensiveModel(step.model) && this.isSimpleTask(step)) {
        suggestions.push(this.createSuggestion({
          type: "cost_reduction",
          priority: "medium",
          title: `Use smaller model for "${step.name}"`,
          description: `Step "${step.name}" uses an expensive model but appears to be a simple task. Consider using a smaller model.`,
          reasoning: "Smaller models are faster and cheaper for classification, extraction, and simple generation tasks.",
          pipelineId: pipeline.id,
          stepIndex: i,
          confidence: 0.7,
          autoFixAvailable: true,
          autoFixConfig: { model: "claude-3-haiku-20240307" },
          estimatedImpact: { costReduction: 50, speedImprovement: 30 }
        }));
      }
    }
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      if (step.prompt && step.prompt.length > 2e3) {
        suggestions.push(this.createSuggestion({
          type: "optimization",
          priority: "low",
          title: `Optimize prompt length in "${step.name}"`,
          description: `Prompt in step "${step.name}" is ${step.prompt.length} characters. Consider condensing for efficiency.`,
          reasoning: "Shorter prompts reduce token usage and cost while often maintaining quality.",
          pipelineId: pipeline.id,
          stepIndex: i,
          confidence: 0.65,
          estimatedImpact: { tokenSavings: Math.floor(step.prompt.length * 0.3) }
        }));
      }
    }
    if (history && history.executions.length >= 5) {
      const failureRate = history.executions.filter((e) => e.status === "failure").length / history.executions.length;
      if (failureRate > 0.2) {
        suggestions.push(this.createSuggestion({
          type: "reliability",
          priority: "critical",
          title: "High failure rate detected",
          description: `Pipeline has a ${(failureRate * 100).toFixed(1)}% failure rate. Review error patterns and add error handling.`,
          reasoning: "High failure rates indicate systematic issues that should be addressed.",
          pipelineId: pipeline.id,
          confidence: 0.95
        }));
      }
      const costs = history.executions.map((e) => e.cost);
      const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
      const maxCost = Math.max(...costs);
      if (maxCost > avgCost * 3) {
        suggestions.push(this.createSuggestion({
          type: "cost_reduction",
          priority: "high",
          title: "Cost variance detected",
          description: `Some executions cost ${(maxCost / avgCost).toFixed(1)}x more than average. Consider adding cost limits.`,
          reasoning: "High cost variance may indicate runaway loops or inefficient paths.",
          pipelineId: pipeline.id,
          confidence: 0.8,
          autoFixAvailable: true,
          autoFixConfig: { maxCost: avgCost * 2 }
        }));
      }
    }
    const hasSecrets = pipeline.steps.some(
      (s) => JSON.stringify(s.config).match(/password|secret|key|token|api_key/i)
    );
    if (hasSecrets) {
      suggestions.push(this.createSuggestion({
        type: "security",
        priority: "critical",
        title: "Potential hardcoded secrets",
        description: "Pipeline configuration may contain hardcoded secrets. Use environment variables instead.",
        reasoning: "Hardcoded secrets are a security risk and make rotation difficult.",
        pipelineId: pipeline.id,
        confidence: 0.9
      }));
    }
    for (const suggestion of suggestions) {
      if (suggestion.confidence >= this.config.minConfidenceThreshold) {
        this.suggestions.set(suggestion.id, suggestion);
        this.emit("suggestion:created", suggestion);
      }
    }
    return suggestions.filter((s) => s.confidence >= this.config.minConfidenceThreshold);
  }
  createSuggestion(data) {
    return {
      ...data,
      id: randomUUID3(),
      status: "pending",
      autoFixAvailable: data.autoFixAvailable ?? false,
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  getSuggestions(pipelineId) {
    const all = Array.from(this.suggestions.values());
    if (pipelineId) {
      return all.filter((s) => s.pipelineId === pipelineId);
    }
    return all;
  }
  async applySuggestion(suggestionId) {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion || suggestion.status !== "pending") {
      return false;
    }
    if (!suggestion.autoFixAvailable) {
      throw new Error("This suggestion does not support auto-fix");
    }
    suggestion.status = "applied";
    suggestion.appliedAt = /* @__PURE__ */ new Date();
    this.emit("suggestion:applied", suggestion);
    return true;
  }
  dismissSuggestion(suggestionId, reason) {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion || suggestion.status !== "pending") {
      return false;
    }
    suggestion.status = "dismissed";
    suggestion.dismissedAt = /* @__PURE__ */ new Date();
    suggestion.dismissReason = reason;
    this.emit("suggestion:dismissed", suggestion);
    return true;
  }
  // ==========================================================================
  // OPTIMIZATIONS
  // ==========================================================================
  async findOptimizations(pipeline, history) {
    const optimizations = [];
    const independentSteps = this.findIndependentSteps(pipeline);
    if (independentSteps.length > 1) {
      optimizations.push({
        id: randomUUID3(),
        category: "parallel_execution",
        title: OPTIMIZATION_TEMPLATES.parallel_execution.title,
        description: `Steps ${independentSteps.join(", ")} can run in parallel`,
        currentValue: "Sequential execution",
        suggestedValue: "Parallel execution",
        estimatedSavings: {
          time: this.estimateParallelSavings(pipeline, independentSteps, history)
        },
        confidence: 0.85
      });
    }
    const repeatableSteps = this.findRepeatableSteps(pipeline, history);
    if (repeatableSteps.length > 0) {
      optimizations.push({
        id: randomUUID3(),
        category: "caching",
        title: OPTIMIZATION_TEMPLATES.caching.title,
        description: `Steps ${repeatableSteps.join(", ")} have repeated calls with same inputs`,
        currentValue: "No caching",
        suggestedValue: "Enable result caching",
        estimatedSavings: {
          tokens: this.estimateCachingSavings(history, repeatableSteps),
          cost: this.estimateCachingCostSavings(history, repeatableSteps)
        },
        confidence: 0.8
      });
    }
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      const recommendedModel = this.recommendModel(step, history);
      if (recommendedModel && recommendedModel !== step.model) {
        optimizations.push({
          id: randomUUID3(),
          category: "model_selection",
          title: `${OPTIMIZATION_TEMPLATES.model_selection.title} for "${step.name}"`,
          description: OPTIMIZATION_TEMPLATES.model_selection.description,
          currentValue: step.model || "default",
          suggestedValue: recommendedModel,
          estimatedSavings: {
            cost: this.estimateModelSavings(step.model, recommendedModel)
          },
          codeChange: {
            before: `model: "${step.model || "default"}"`,
            after: `model: "${recommendedModel}"`,
            stepIndex: i
          },
          confidence: 0.75
        });
      }
    }
    const consolidatableSteps = this.findConsolidatableSteps(pipeline);
    if (consolidatableSteps.length > 0) {
      for (const group of consolidatableSteps) {
        optimizations.push({
          id: randomUUID3(),
          category: "step_consolidation",
          title: OPTIMIZATION_TEMPLATES.step_consolidation.title,
          description: `Steps ${group.join(", ")} can be merged into a single step`,
          currentValue: `${group.length} separate steps`,
          suggestedValue: "1 consolidated step",
          estimatedSavings: {
            time: 500 * (group.length - 1),
            // Estimated overhead per step
            tokens: 100 * (group.length - 1)
            // System prompt overhead
          },
          confidence: 0.7
        });
      }
    }
    return optimizations;
  }
  // ==========================================================================
  // SIMILAR PIPELINES
  // ==========================================================================
  async findSimilarPipelines(pipeline) {
    const similar = [];
    for (const [id, cached] of this.pipelineCache) {
      if (id === pipeline.id) continue;
      const similarity = this.calculateSimilarity(pipeline, cached);
      if (similarity >= this.config.similarityThreshold) {
        const matchedFeatures = this.getMatchedFeatures(pipeline, cached);
        const differingFeatures = this.getDifferingFeatures(pipeline, cached);
        const history = this.executionCache.get(id);
        const stats = history ? this.computeExecutionStats(history) : void 0;
        similar.push({
          pipelineId: id,
          pipelineName: cached.name,
          similarity,
          matchedFeatures,
          differingFeatures,
          performanceComparison: stats ? {
            avgDuration: stats.avgDuration,
            avgCost: stats.avgCost,
            successRate: stats.successRate
          } : void 0
        });
      }
    }
    similar.sort((a, b) => b.similarity - a.similarity);
    if (similar.length > 0) {
      this.emit("similar:found", pipeline.id, similar);
    }
    return similar;
  }
  calculateSimilarity(a, b) {
    let score = 0;
    let factors = 0;
    const stepDiff = Math.abs(a.steps.length - b.steps.length);
    score += Math.max(0, 1 - stepDiff / 10);
    factors++;
    const aTypes = new Set(a.steps.map((s) => s.type));
    const bTypes = new Set(b.steps.map((s) => s.type));
    const typeOverlap = [...aTypes].filter((t) => bTypes.has(t)).length;
    score += typeOverlap / Math.max(aTypes.size, bTypes.size);
    factors++;
    const aWords = new Set((a.name + " " + (a.description || "")).toLowerCase().split(/\W+/));
    const bWords = new Set((b.name + " " + (b.description || "")).toLowerCase().split(/\W+/));
    const wordOverlap = [...aWords].filter((w) => bWords.has(w) && w.length > 3).length;
    score += Math.min(1, wordOverlap / 5);
    factors++;
    return score / factors;
  }
  getMatchedFeatures(a, b) {
    const matched = [];
    const aTypes = new Set(a.steps.map((s) => s.type));
    const bTypes = new Set(b.steps.map((s) => s.type));
    for (const type of aTypes) {
      if (bTypes.has(type)) {
        matched.push(`Uses ${type} step`);
      }
    }
    if (a.steps.length === b.steps.length) {
      matched.push("Same number of steps");
    }
    return matched;
  }
  getDifferingFeatures(a, b) {
    const differing = [];
    const aTypes = new Set(a.steps.map((s) => s.type));
    const bTypes = new Set(b.steps.map((s) => s.type));
    for (const type of aTypes) {
      if (!bTypes.has(type)) {
        differing.push(`Only A has ${type}`);
      }
    }
    for (const type of bTypes) {
      if (!aTypes.has(type)) {
        differing.push(`Only B has ${type}`);
      }
    }
    return differing;
  }
  // ==========================================================================
  // ERROR PATTERNS
  // ==========================================================================
  async analyzeErrorPatterns(pipeline, history) {
    if (!history) return [];
    const patterns = [];
    const errorMessages = history.executions.filter((e) => e.error).map((e) => e.error);
    for (const template of COMMON_ERROR_PATTERNS) {
      const regex = new RegExp(template.pattern, "i");
      const matches = errorMessages.filter((msg) => regex.test(msg));
      if (matches.length > 0) {
        patterns.push({
          ...template,
          id: randomUUID3(),
          frequency: matches.length
        });
      }
    }
    return patterns;
  }
  // ==========================================================================
  // AUTO-FIX
  // ==========================================================================
  async applyAutoFix(pipelineId, errorPatternId, fixIndex = 0) {
    const analysis = this.analyses.get(pipelineId);
    if (!analysis) return null;
    const pattern = analysis.errorPatterns.find((p) => p.id === errorPatternId);
    if (!pattern || !pattern.suggestedFixes[fixIndex]?.autoFixable) {
      return null;
    }
    const fix = {
      id: randomUUID3(),
      errorPatternId,
      pipelineId,
      fixType: "config_change",
      originalConfig: {},
      // Would store original
      fixedConfig: pattern.suggestedFixes[fixIndex].fixConfig || {},
      applied: true,
      appliedAt: /* @__PURE__ */ new Date(),
      rollbackAvailable: true
    };
    this.autoFixes.set(fix.id, fix);
    this.emit("autofix:applied", fix);
    return fix;
  }
  async rollbackAutoFix(fixId) {
    const fix = this.autoFixes.get(fixId);
    if (!fix || !fix.rollbackAvailable) {
      return false;
    }
    fix.applied = false;
    this.emit("autofix:rolled_back", fix);
    return true;
  }
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  isExpensiveModel(model) {
    if (!model) return false;
    return model.includes("opus") || model.includes("gpt-4") || model.includes("sonnet");
  }
  isSimpleTask(step) {
    const simpleTypes = ["classify", "extract", "summarize", "translate", "format"];
    if (simpleTypes.some((t) => step.type.toLowerCase().includes(t))) return true;
    if (step.prompt && step.prompt.length < 500) return true;
    return false;
  }
  findIndependentSteps(pipeline) {
    const independent = [];
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      const configStr = JSON.stringify(step.config);
      if (!configStr.includes("{{") && !step.prompt?.includes("{{")) {
        independent.push(i);
      }
    }
    return independent;
  }
  findRepeatableSteps(pipeline, history) {
    return [];
  }
  findConsolidatableSteps(pipeline) {
    const groups = [];
    let currentGroup = [];
    let lastType = "";
    for (let i = 0; i < pipeline.steps.length; i++) {
      if (pipeline.steps[i].type === lastType) {
        currentGroup.push(i);
      } else {
        if (currentGroup.length > 1) {
          groups.push([...currentGroup]);
        }
        currentGroup = [i];
        lastType = pipeline.steps[i].type;
      }
    }
    if (currentGroup.length > 1) {
      groups.push(currentGroup);
    }
    return groups;
  }
  recommendModel(step, history) {
    if (this.isSimpleTask(step) && this.isExpensiveModel(step.model)) {
      return "claude-3-haiku-20240307";
    }
    return null;
  }
  estimateParallelSavings(pipeline, independentSteps, history) {
    if (!history || history.executions.length === 0) return 1e3;
    const avgDuration = history.executions.reduce((sum, e) => sum + e.duration, 0) / history.executions.length;
    const avgStepDuration = avgDuration / pipeline.steps.length;
    return Math.floor(avgStepDuration * (independentSteps.length - 1));
  }
  estimateCachingSavings(history, steps) {
    if (!history) return 0;
    return 500 * steps.length;
  }
  estimateCachingCostSavings(history, steps) {
    if (!history) return 0;
    const avgCost = history.executions.reduce((sum, e) => sum + e.cost, 0) / history.executions.length;
    return avgCost * 0.1 * steps.length;
  }
  estimateModelSavings(current, recommended) {
    if (!current || !recommended) return 0;
    if (current.includes("sonnet") && recommended.includes("haiku")) {
      return 90;
    }
    return 0;
  }
  calculateScores(pipeline, history, optimizations) {
    let efficiency = 70;
    let reliability = 70;
    let costEffectiveness = 70;
    let maintainability = 70;
    if (optimizations.length > 0) {
      efficiency -= optimizations.length * 5;
    }
    if (pipeline.steps.length > 10) {
      maintainability -= 20;
    }
    if (history) {
      const successRate = history.executions.filter((e) => e.status === "success").length / history.executions.length;
      reliability = Math.round(successRate * 100);
    }
    const overall = Math.round((efficiency + reliability + costEffectiveness + maintainability) / 4);
    return {
      overall: Math.max(0, Math.min(100, overall)),
      efficiency: Math.max(0, Math.min(100, efficiency)),
      reliability: Math.max(0, Math.min(100, reliability)),
      costEffectiveness: Math.max(0, Math.min(100, costEffectiveness)),
      maintainability: Math.max(0, Math.min(100, maintainability))
    };
  }
  computeExecutionStats(history) {
    if (!history || history.executions.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        avgDuration: 0,
        avgCost: 0,
        avgTokens: 0
      };
    }
    const executions = history.executions;
    const successful = executions.filter((e) => e.status === "success");
    return {
      totalExecutions: executions.length,
      successRate: successful.length / executions.length * 100,
      avgDuration: executions.reduce((sum, e) => sum + e.duration, 0) / executions.length,
      avgCost: executions.reduce((sum, e) => sum + e.cost, 0) / executions.length,
      avgTokens: executions.reduce((sum, e) => sum + e.tokenUsage, 0) / executions.length
    };
  }
};
var instance3 = null;
function getSuggestionEngine() {
  if (!instance3) {
    instance3 = new SuggestionEngine();
  }
  return instance3;
}
function createSuggestionEngine(config = {}) {
  instance3 = new SuggestionEngine(config);
  return instance3;
}

// src/intelligence/anomaly-detector.ts
import { EventEmitter as EventEmitter6 } from "eventemitter3";
import { randomUUID as randomUUID4 } from "crypto";
import { z as z7 } from "zod";
var AnomalyTypeSchema = z7.enum([
  "cost_spike",
  // Unusual cost increase
  "latency_spike",
  // Unusual latency increase
  "error_spike",
  // Unusual error rate increase
  "token_spike",
  // Unusual token usage
  "traffic_spike",
  // Unusual request volume
  "traffic_drop",
  // Unusual request drop
  "pattern_change",
  // Execution pattern changed
  "performance_regression"
  // Gradual performance decline
]);
var AnomalySeveritySchema = z7.enum(["low", "medium", "high", "critical"]);
var AnomalyStatusSchema = z7.enum([
  "active",
  "investigating",
  "resolved",
  "false_positive"
]);
var AnomalySchema = z7.object({
  id: z7.string(),
  type: AnomalyTypeSchema,
  severity: AnomalySeveritySchema,
  status: AnomalyStatusSchema,
  title: z7.string(),
  description: z7.string(),
  // Affected resources
  pipelineId: z7.string().optional(),
  stepIndex: z7.number().optional(),
  service: z7.string().optional(),
  // Detection details
  metric: z7.string(),
  expectedValue: z7.number(),
  actualValue: z7.number(),
  deviation: z7.number(),
  // Standard deviations from mean
  confidence: z7.number().min(0).max(1),
  // Time range
  detectedAt: z7.date(),
  startedAt: z7.date(),
  endedAt: z7.date().optional(),
  resolvedAt: z7.date().optional(),
  // Related data
  relatedAnomalies: z7.array(z7.string()).optional(),
  possibleCauses: z7.array(z7.string()).optional(),
  suggestedActions: z7.array(z7.string()).optional(),
  // Incident
  incidentId: z7.string().optional(),
  acknowledgedBy: z7.string().optional(),
  acknowledgedAt: z7.date().optional(),
  notes: z7.string().optional()
});
var IncidentSchema = z7.object({
  id: z7.string(),
  title: z7.string(),
  description: z7.string(),
  severity: AnomalySeveritySchema,
  status: z7.enum(["open", "investigating", "mitigating", "resolved", "closed"]),
  anomalyIds: z7.array(z7.string()),
  createdAt: z7.date(),
  updatedAt: z7.date(),
  resolvedAt: z7.date().optional(),
  assignedTo: z7.string().optional(),
  timeline: z7.array(z7.object({
    timestamp: z7.date(),
    event: z7.string(),
    actor: z7.string().optional()
  })),
  postmortem: z7.string().optional()
});
var AnomalyDetectorConfigSchema = z7.object({
  enabled: z7.boolean().default(true),
  checkIntervalMs: z7.number().default(6e4),
  // 1 minute
  // Thresholds (standard deviations)
  costSpikeThreshold: z7.number().default(3),
  latencySpikeThreshold: z7.number().default(2.5),
  errorSpikeThreshold: z7.number().default(2),
  tokenSpikeThreshold: z7.number().default(3),
  trafficSpikeThreshold: z7.number().default(3),
  trafficDropThreshold: z7.number().default(-2),
  // Time windows
  baselineWindowHours: z7.number().default(168),
  // 1 week
  detectionWindowMinutes: z7.number().default(15),
  // Auto-incident creation
  autoCreateIncident: z7.boolean().default(true),
  incidentThresholdSeverity: AnomalySeveritySchema.default("high"),
  // Alerting
  alertWebhookUrl: z7.string().url().optional(),
  alertSlackChannel: z7.string().optional()
});
var AnomalyDetector = class extends EventEmitter6 {
  config;
  anomalies = /* @__PURE__ */ new Map();
  incidents = /* @__PURE__ */ new Map();
  metrics = /* @__PURE__ */ new Map();
  checkTimer;
  baselines = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = AnomalyDetectorConfigSchema.parse(config);
  }
  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================
  start() {
    if (!this.config.enabled) return;
    this.checkTimer = setInterval(() => {
      this.runDetection();
    }, this.config.checkIntervalMs);
    this.runDetection();
  }
  stop() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }
  // ==========================================================================
  // METRIC INGESTION
  // ==========================================================================
  recordMetric(name, value, labels) {
    const series = this.metrics.get(name) || { name, points: [] };
    series.points.push({
      timestamp: /* @__PURE__ */ new Date(),
      value,
      labels
    });
    const cutoff = Date.now() - this.config.baselineWindowHours * 36e5;
    series.points = series.points.filter((p) => p.timestamp.getTime() > cutoff);
    this.metrics.set(name, series);
    this.updateBaseline(name);
  }
  recordCost(pipelineId, cost) {
    this.recordMetric("cost", cost, { pipeline_id: pipelineId });
  }
  recordLatency(pipelineId, latencyMs) {
    this.recordMetric("latency", latencyMs, { pipeline_id: pipelineId });
  }
  recordError(pipelineId) {
    this.recordMetric("errors", 1, { pipeline_id: pipelineId });
  }
  recordTokens(pipelineId, tokens) {
    this.recordMetric("tokens", tokens, { pipeline_id: pipelineId });
  }
  recordRequest(service) {
    this.recordMetric("requests", 1, { service });
  }
  // ==========================================================================
  // DETECTION
  // ==========================================================================
  runDetection() {
    this.detectCostAnomalies();
    this.detectLatencyAnomalies();
    this.detectErrorAnomalies();
    this.detectTokenAnomalies();
    this.detectTrafficAnomalies();
    this.checkResolvedAnomalies();
  }
  detectCostAnomalies() {
    this.detectAnomalyForMetric("cost", "cost_spike", this.config.costSpikeThreshold);
  }
  detectLatencyAnomalies() {
    this.detectAnomalyForMetric("latency", "latency_spike", this.config.latencySpikeThreshold);
  }
  detectErrorAnomalies() {
    this.detectAnomalyForMetric("errors", "error_spike", this.config.errorSpikeThreshold);
  }
  detectTokenAnomalies() {
    this.detectAnomalyForMetric("tokens", "token_spike", this.config.tokenSpikeThreshold);
  }
  detectTrafficAnomalies() {
    this.detectAnomalyForMetric("requests", "traffic_spike", this.config.trafficSpikeThreshold);
    this.detectAnomalyForMetric("requests", "traffic_drop", this.config.trafficDropThreshold, true);
  }
  detectAnomalyForMetric(metricName, anomalyType, threshold, detectDrop = false) {
    const baseline = this.baselines.get(metricName);
    if (!baseline || baseline.stdDev === 0) return;
    const recentValue = this.getRecentValue(metricName);
    if (recentValue === null) return;
    const deviation = (recentValue - baseline.mean) / baseline.stdDev;
    const isAnomaly = detectDrop ? deviation < threshold : deviation > threshold;
    if (isAnomaly) {
      const existingAnomaly = this.findActiveAnomaly(metricName, anomalyType);
      if (!existingAnomaly) {
        const anomaly = this.createAnomaly({
          type: anomalyType,
          severity: this.calculateSeverity(Math.abs(deviation)),
          title: this.generateTitle(anomalyType, metricName),
          description: this.generateDescription(
            anomalyType,
            metricName,
            baseline.mean,
            recentValue,
            deviation
          ),
          metric: metricName,
          expectedValue: baseline.mean,
          actualValue: recentValue,
          deviation: Math.abs(deviation),
          confidence: this.calculateConfidence(Math.abs(deviation), baseline),
          possibleCauses: this.inferCauses(anomalyType, metricName),
          suggestedActions: this.suggestActions(anomalyType)
        });
        this.anomalies.set(anomaly.id, anomaly);
        this.emit("anomaly:detected", anomaly);
        if (this.config.autoCreateIncident && this.compareSeverity(anomaly.severity, this.config.incidentThresholdSeverity) >= 0) {
          this.createIncidentFromAnomaly(anomaly);
        }
      }
    }
  }
  checkResolvedAnomalies() {
    for (const anomaly of this.anomalies.values()) {
      if (anomaly.status !== "active") continue;
      const baseline = this.baselines.get(anomaly.metric);
      if (!baseline) continue;
      const recentValue = this.getRecentValue(anomaly.metric);
      if (recentValue === null) continue;
      const deviation = Math.abs((recentValue - baseline.mean) / baseline.stdDev);
      if (deviation < 1.5) {
        anomaly.status = "resolved";
        anomaly.endedAt = /* @__PURE__ */ new Date();
        anomaly.resolvedAt = /* @__PURE__ */ new Date();
        this.emit("anomaly:resolved", anomaly);
      }
    }
  }
  // ==========================================================================
  // ANOMALY MANAGEMENT
  // ==========================================================================
  createAnomaly(data) {
    return {
      ...data,
      id: randomUUID4(),
      status: "active",
      detectedAt: /* @__PURE__ */ new Date(),
      startedAt: /* @__PURE__ */ new Date()
    };
  }
  getAnomalies(options) {
    let anomalies = Array.from(this.anomalies.values());
    if (options?.status) {
      anomalies = anomalies.filter((a) => a.status === options.status);
    }
    if (options?.type) {
      anomalies = anomalies.filter((a) => a.type === options.type);
    }
    if (options?.severity) {
      anomalies = anomalies.filter((a) => a.severity === options.severity);
    }
    if (options?.pipelineId) {
      anomalies = anomalies.filter((a) => a.pipelineId === options.pipelineId);
    }
    return anomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }
  acknowledgeAnomaly(anomalyId, userId, notes) {
    const anomaly = this.anomalies.get(anomalyId);
    if (!anomaly) return false;
    anomaly.status = "investigating";
    anomaly.acknowledgedBy = userId;
    anomaly.acknowledgedAt = /* @__PURE__ */ new Date();
    if (notes) anomaly.notes = notes;
    return true;
  }
  markFalsePositive(anomalyId, reason) {
    const anomaly = this.anomalies.get(anomalyId);
    if (!anomaly) return false;
    anomaly.status = "false_positive";
    anomaly.resolvedAt = /* @__PURE__ */ new Date();
    if (reason) anomaly.notes = reason;
    return true;
  }
  // ==========================================================================
  // INCIDENTS
  // ==========================================================================
  createIncidentFromAnomaly(anomaly) {
    const incident = {
      id: randomUUID4(),
      title: `Incident: ${anomaly.title}`,
      description: anomaly.description,
      severity: anomaly.severity,
      status: "open",
      anomalyIds: [anomaly.id],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      timeline: [
        {
          timestamp: /* @__PURE__ */ new Date(),
          event: "Incident created automatically from detected anomaly"
        }
      ]
    };
    this.incidents.set(incident.id, incident);
    anomaly.incidentId = incident.id;
    this.emit("incident:created", incident);
    return incident;
  }
  getIncidents(status) {
    let incidents = Array.from(this.incidents.values());
    if (status) {
      incidents = incidents.filter((i) => i.status === status);
    }
    return incidents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  updateIncident(incidentId, updates) {
    const incident = this.incidents.get(incidentId);
    if (!incident) return void 0;
    if (updates.status) {
      incident.status = updates.status;
      incident.timeline.push({
        timestamp: /* @__PURE__ */ new Date(),
        event: `Status changed to ${updates.status}`
      });
      if (updates.status === "resolved" || updates.status === "closed") {
        incident.resolvedAt = /* @__PURE__ */ new Date();
      }
    }
    if (updates.assignedTo) {
      incident.assignedTo = updates.assignedTo;
      incident.timeline.push({
        timestamp: /* @__PURE__ */ new Date(),
        event: `Assigned to ${updates.assignedTo}`
      });
    }
    if (updates.notes) {
      incident.timeline.push({
        timestamp: /* @__PURE__ */ new Date(),
        event: updates.notes
      });
    }
    incident.updatedAt = /* @__PURE__ */ new Date();
    this.emit("incident:updated", incident);
    if (incident.status === "resolved") {
      this.emit("incident:resolved", incident);
    }
    return incident;
  }
  addPostmortem(incidentId, postmortem) {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;
    incident.postmortem = postmortem;
    incident.timeline.push({
      timestamp: /* @__PURE__ */ new Date(),
      event: "Postmortem added"
    });
    incident.updatedAt = /* @__PURE__ */ new Date();
    this.emit("incident:updated", incident);
    return true;
  }
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  updateBaseline(metricName) {
    const series = this.metrics.get(metricName);
    if (!series || series.points.length < 10) return;
    const baselineCutoff = Date.now() - this.config.detectionWindowMinutes * 6e4;
    const baselinePoints = series.points.filter(
      (p) => p.timestamp.getTime() < baselineCutoff
    );
    if (baselinePoints.length < 10) return;
    const values = baselinePoints.map((p) => p.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    this.baselines.set(metricName, { mean, stdDev: stdDev || 1 });
  }
  getRecentValue(metricName) {
    const series = this.metrics.get(metricName);
    if (!series || series.points.length === 0) return null;
    const windowStart = Date.now() - this.config.detectionWindowMinutes * 6e4;
    const recentPoints = series.points.filter(
      (p) => p.timestamp.getTime() >= windowStart
    );
    if (recentPoints.length === 0) return null;
    return recentPoints.reduce((sum, p) => sum + p.value, 0) / recentPoints.length;
  }
  findActiveAnomaly(metric, type) {
    for (const anomaly of this.anomalies.values()) {
      if (anomaly.metric === metric && anomaly.type === type && anomaly.status === "active") {
        return anomaly;
      }
    }
    return void 0;
  }
  calculateSeverity(deviation) {
    if (deviation >= 5) return "critical";
    if (deviation >= 4) return "high";
    if (deviation >= 3) return "medium";
    return "low";
  }
  calculateConfidence(deviation, baseline) {
    const deviationFactor = Math.min(deviation / 5, 1);
    const series = Array.from(this.metrics.values())[0];
    const dataFactor = series ? Math.min(series.points.length / 100, 1) : 0.5;
    return 0.5 + deviationFactor * 0.3 + dataFactor * 0.2;
  }
  compareSeverity(a, b) {
    const order = { low: 0, medium: 1, high: 2, critical: 3 };
    return order[a] - order[b];
  }
  generateTitle(type, metric) {
    const titles = {
      cost_spike: `Cost spike detected for ${metric}`,
      latency_spike: `Latency spike detected`,
      error_spike: `Error rate spike detected`,
      token_spike: `Token usage spike detected`,
      traffic_spike: `Traffic spike detected`,
      traffic_drop: `Traffic drop detected`,
      pattern_change: `Execution pattern change detected`,
      performance_regression: `Performance regression detected`
    };
    return titles[type];
  }
  generateDescription(type, metric, expected, actual, deviation) {
    const change = ((actual - expected) / expected * 100).toFixed(1);
    const direction = actual > expected ? "above" : "below";
    return `${metric} is ${Math.abs(parseFloat(change))}% ${direction} normal. Expected: ${expected.toFixed(2)}, Actual: ${actual.toFixed(2)} (${deviation.toFixed(1)} standard deviations from mean)`;
  }
  inferCauses(type, metric) {
    const causes = {
      cost_spike: [
        "Increased execution volume",
        "Using more expensive models",
        "Longer prompts or responses",
        "Retry loops causing duplicate calls"
      ],
      latency_spike: [
        "API provider experiencing slowdown",
        "Network latency issues",
        "Complex prompts requiring more processing",
        "Rate limiting causing delays"
      ],
      error_spike: [
        "API provider outage",
        "Invalid configuration",
        "Rate limit exceeded",
        "Authentication issues"
      ],
      token_spike: [
        "Longer inputs than usual",
        "More verbose outputs",
        "Missing input truncation",
        "Conversation context accumulation"
      ],
      traffic_spike: [
        "Marketing campaign driving traffic",
        "Bot or crawler activity",
        "Batch job execution",
        "User behavior change"
      ],
      traffic_drop: [
        "Service disruption",
        "DNS or networking issues",
        "Deployment problems",
        "External dependency failure"
      ],
      pattern_change: [
        "Configuration change",
        "Model update",
        "Workflow modification"
      ],
      performance_regression: [
        "Code changes affecting performance",
        "Data growth",
        "Resource contention"
      ]
    };
    return causes[type] || [];
  }
  suggestActions(type) {
    const actions = {
      cost_spike: [
        "Review recent execution logs",
        "Check for retry loops",
        "Consider adding cost limits",
        "Evaluate model selection"
      ],
      latency_spike: [
        "Check API provider status",
        "Review network connectivity",
        "Consider adding timeouts",
        "Implement request queuing"
      ],
      error_spike: [
        "Check API provider status page",
        "Review error logs",
        "Verify API keys and credentials",
        "Check rate limit status"
      ],
      token_spike: [
        "Review input data size",
        "Check prompt templates",
        "Implement input truncation",
        "Add token budgets"
      ],
      traffic_spike: [
        "Scale resources if needed",
        "Enable rate limiting",
        "Check for bot traffic",
        "Review recent deployments"
      ],
      traffic_drop: [
        "Check service health",
        "Review recent deployments",
        "Check DNS and networking",
        "Contact API provider if needed"
      ],
      pattern_change: [
        "Review recent configuration changes",
        "Check for model updates",
        "Verify workflow definitions"
      ],
      performance_regression: [
        "Review recent code changes",
        "Profile slow operations",
        "Check resource utilization"
      ]
    };
    return actions[type] || [];
  }
};
var instance4 = null;
function getAnomalyDetector() {
  if (!instance4) {
    instance4 = new AnomalyDetector();
  }
  return instance4;
}
function createAnomalyDetector(config = {}) {
  instance4 = new AnomalyDetector(config);
  return instance4;
}

// src/intelligence/nl-builder.ts
import { EventEmitter as EventEmitter7 } from "eventemitter3";
import { randomUUID as randomUUID5 } from "crypto";
import { z as z8 } from "zod";
var NLRequestSchema = z8.object({
  description: z8.string().min(10),
  context: z8.string().optional(),
  constraints: z8.object({
    maxSteps: z8.number().optional(),
    maxCost: z8.number().optional(),
    preferredModels: z8.array(z8.string()).optional(),
    requiredCapabilities: z8.array(z8.string()).optional()
  }).optional()
});
var GeneratedStepSchema = z8.object({
  name: z8.string(),
  type: z8.enum([
    "llm_call",
    "data_transform",
    "api_call",
    "condition",
    "loop",
    "parallel",
    "human_review"
  ]),
  description: z8.string(),
  config: z8.record(z8.unknown()),
  prompt: z8.string().optional(),
  model: z8.string().optional(),
  dependencies: z8.array(z8.number()).optional(),
  // indices of dependent steps
  estimatedTokens: z8.number().optional(),
  estimatedCost: z8.number().optional()
});
var GeneratedPipelineSchema = z8.object({
  id: z8.string(),
  name: z8.string(),
  description: z8.string(),
  steps: z8.array(GeneratedStepSchema),
  inputSchema: z8.record(z8.object({
    type: z8.string(),
    description: z8.string(),
    required: z8.boolean(),
    default: z8.unknown().optional()
  })),
  outputSchema: z8.record(z8.object({
    type: z8.string(),
    description: z8.string()
  })),
  estimatedTotalTokens: z8.number(),
  estimatedTotalCost: z8.number(),
  confidence: z8.number().min(0).max(1),
  reasoning: z8.string(),
  alternatives: z8.array(z8.object({
    description: z8.string(),
    tradeoffs: z8.string()
  })).optional()
});
var RefinementSchema = z8.object({
  type: z8.enum(["add_step", "remove_step", "modify_step", "reorder", "change_model", "add_validation", "other"]),
  instruction: z8.string(),
  stepIndex: z8.number().optional()
});
var ConversationMessageSchema = z8.object({
  role: z8.enum(["user", "assistant"]),
  content: z8.string(),
  timestamp: z8.date(),
  pipelineSnapshot: GeneratedPipelineSchema.optional()
});
var BuilderSessionSchema = z8.object({
  id: z8.string(),
  status: z8.enum(["active", "completed", "abandoned"]),
  originalRequest: NLRequestSchema,
  currentPipeline: GeneratedPipelineSchema.optional(),
  conversation: z8.array(ConversationMessageSchema),
  refinements: z8.array(RefinementSchema),
  createdAt: z8.date(),
  updatedAt: z8.date(),
  completedAt: z8.date().optional()
});
var NLBuilderConfigSchema = z8.object({
  enabled: z8.boolean().default(true),
  model: z8.string().default("claude-3-sonnet-20240229"),
  maxConversationTurns: z8.number().default(10),
  maxStepsPerPipeline: z8.number().default(20),
  defaultCostLimit: z8.number().default(1),
  templateMatching: z8.boolean().default(true),
  autoSuggestImprovements: z8.boolean().default(true)
});
var PIPELINE_TEMPLATES = [
  {
    id: "content-generation",
    name: "Content Generation",
    description: "Generate content from a topic or brief",
    keywords: ["write", "generate", "create", "content", "article", "blog", "post"],
    steps: [
      {
        name: "Research Topic",
        type: "llm_call",
        description: "Research and gather information about the topic",
        config: {},
        prompt: "Research the following topic and provide key points: {{topic}}",
        model: "claude-3-haiku-20240307",
        estimatedTokens: 500,
        estimatedCost: 1e-3
      },
      {
        name: "Generate Outline",
        type: "llm_call",
        description: "Create a structured outline",
        config: {},
        prompt: "Create an outline for content about: {{topic}}\n\nResearch: {{step_0_output}}",
        model: "claude-3-haiku-20240307",
        dependencies: [0],
        estimatedTokens: 300,
        estimatedCost: 6e-4
      },
      {
        name: "Write Content",
        type: "llm_call",
        description: "Write the full content based on outline",
        config: {},
        prompt: "Write engaging content based on this outline: {{step_1_output}}",
        model: "claude-3-sonnet-20240229",
        dependencies: [1],
        estimatedTokens: 2e3,
        estimatedCost: 0.02
      }
    ],
    inputSchema: {
      topic: { type: "string", description: "The topic to write about", required: true }
    },
    outputSchema: {
      content: { type: "string", description: "The generated content" }
    }
  },
  {
    id: "data-extraction",
    name: "Data Extraction",
    description: "Extract structured data from unstructured text",
    keywords: ["extract", "parse", "data", "information", "structured", "json"],
    steps: [
      {
        name: "Analyze Structure",
        type: "llm_call",
        description: "Analyze the input and identify extractable fields",
        config: {},
        prompt: "Analyze this text and identify the key data fields that can be extracted:\n\n{{input_text}}",
        model: "claude-3-haiku-20240307",
        estimatedTokens: 400,
        estimatedCost: 8e-4
      },
      {
        name: "Extract Data",
        type: "llm_call",
        description: "Extract the identified data into JSON format",
        config: { outputFormat: "json" },
        prompt: "Extract the following fields from the text and return as JSON:\nFields: {{step_0_output}}\n\nText: {{input_text}}",
        model: "claude-3-sonnet-20240229",
        dependencies: [0],
        estimatedTokens: 600,
        estimatedCost: 6e-3
      },
      {
        name: "Validate Output",
        type: "data_transform",
        description: "Validate the extracted JSON",
        config: { validate: true },
        dependencies: [1]
      }
    ],
    inputSchema: {
      input_text: { type: "string", description: "The text to extract data from", required: true }
    },
    outputSchema: {
      extracted_data: { type: "object", description: "The extracted structured data" }
    }
  },
  {
    id: "summarization",
    name: "Summarization",
    description: "Summarize long documents or text",
    keywords: ["summarize", "summary", "condense", "brief", "tldr", "shorten"],
    steps: [
      {
        name: "Chunk Document",
        type: "data_transform",
        description: "Split long document into manageable chunks",
        config: { chunkSize: 4e3, overlap: 200 }
      },
      {
        name: "Summarize Chunks",
        type: "loop",
        description: "Summarize each chunk",
        config: { iterateOver: "step_0_output" },
        prompt: "Summarize the following text concisely:\n\n{{chunk}}",
        model: "claude-3-haiku-20240307",
        dependencies: [0],
        estimatedTokens: 1e3,
        estimatedCost: 2e-3
      },
      {
        name: "Combine Summaries",
        type: "llm_call",
        description: "Combine chunk summaries into final summary",
        config: {},
        prompt: "Combine these summaries into a cohesive final summary:\n\n{{step_1_output}}",
        model: "claude-3-sonnet-20240229",
        dependencies: [1],
        estimatedTokens: 800,
        estimatedCost: 8e-3
      }
    ],
    inputSchema: {
      document: { type: "string", description: "The document to summarize", required: true },
      max_length: { type: "number", description: "Maximum summary length", required: false, default: 500 }
    },
    outputSchema: {
      summary: { type: "string", description: "The generated summary" }
    }
  },
  {
    id: "classification",
    name: "Classification",
    description: "Classify text into categories",
    keywords: ["classify", "categorize", "label", "tag", "category", "sentiment"],
    steps: [
      {
        name: "Classify",
        type: "llm_call",
        description: "Classify the input into specified categories",
        config: { outputFormat: "json" },
        prompt: 'Classify the following text into one of these categories: {{categories}}\n\nText: {{input_text}}\n\nRespond with JSON: {"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}',
        model: "claude-3-haiku-20240307",
        estimatedTokens: 200,
        estimatedCost: 4e-4
      }
    ],
    inputSchema: {
      input_text: { type: "string", description: "The text to classify", required: true },
      categories: { type: "array", description: "List of possible categories", required: true }
    },
    outputSchema: {
      category: { type: "string", description: "The assigned category" },
      confidence: { type: "number", description: "Classification confidence" }
    }
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translate text between languages",
    keywords: ["translate", "translation", "language", "convert", "localize"],
    steps: [
      {
        name: "Translate",
        type: "llm_call",
        description: "Translate text to target language",
        config: {},
        prompt: "Translate the following text to {{target_language}}. Preserve the original meaning and tone:\n\n{{input_text}}",
        model: "claude-3-sonnet-20240229",
        estimatedTokens: 500,
        estimatedCost: 5e-3
      },
      {
        name: "Quality Check",
        type: "llm_call",
        description: "Verify translation quality",
        config: { outputFormat: "json" },
        prompt: 'Review this translation for accuracy:\nOriginal: {{input_text}}\nTranslation: {{step_0_output}}\n\nRespond with JSON: {"quality_score": 0-100, "issues": [], "suggestions": []}',
        model: "claude-3-haiku-20240307",
        dependencies: [0],
        estimatedTokens: 300,
        estimatedCost: 6e-4
      }
    ],
    inputSchema: {
      input_text: { type: "string", description: "Text to translate", required: true },
      target_language: { type: "string", description: "Target language", required: true }
    },
    outputSchema: {
      translated_text: { type: "string", description: "The translated text" },
      quality_score: { type: "number", description: "Translation quality score" }
    }
  }
];
var NLBuilder = class extends EventEmitter7 {
  config;
  sessions = /* @__PURE__ */ new Map();
  templates = PIPELINE_TEMPLATES;
  constructor(config = {}) {
    super();
    this.config = NLBuilderConfigSchema.parse(config);
  }
  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================
  async startSession(request) {
    const session = {
      id: randomUUID5(),
      status: "active",
      originalRequest: request,
      conversation: [
        {
          role: "user",
          content: request.description,
          timestamp: /* @__PURE__ */ new Date()
        }
      ],
      refinements: [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sessions.set(session.id, session);
    this.emit("session:started", session);
    const pipeline = await this.generatePipeline(request);
    session.currentPipeline = pipeline;
    session.conversation.push({
      role: "assistant",
      content: this.formatPipelineResponse(pipeline),
      timestamp: /* @__PURE__ */ new Date(),
      pipelineSnapshot: pipeline
    });
    this.emit("session:updated", session);
    this.emit("pipeline:generated", pipeline);
    return session;
  }
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
  async refineSession(sessionId, instruction) {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return void 0;
    if (session.conversation.length >= this.config.maxConversationTurns * 2) {
      throw new Error("Maximum conversation turns reached");
    }
    session.conversation.push({
      role: "user",
      content: instruction,
      timestamp: /* @__PURE__ */ new Date()
    });
    const refinement = this.parseRefinement(instruction, session.currentPipeline);
    session.refinements.push(refinement);
    if (session.currentPipeline) {
      const refined = await this.applyRefinement(session.currentPipeline, refinement);
      session.currentPipeline = refined;
      session.conversation.push({
        role: "assistant",
        content: this.formatRefinementResponse(refinement, refined),
        timestamp: /* @__PURE__ */ new Date(),
        pipelineSnapshot: refined
      });
      this.emit("pipeline:refined", refined, refinement);
    }
    session.updatedAt = /* @__PURE__ */ new Date();
    this.emit("session:updated", session);
    return session;
  }
  completeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return void 0;
    session.status = "completed";
    session.completedAt = /* @__PURE__ */ new Date();
    session.updatedAt = /* @__PURE__ */ new Date();
    this.emit("session:completed", session);
    return session;
  }
  abandonSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.status = "abandoned";
    session.updatedAt = /* @__PURE__ */ new Date();
    return true;
  }
  // ==========================================================================
  // PIPELINE GENERATION
  // ==========================================================================
  async generatePipeline(request) {
    if (this.config.templateMatching) {
      const matchedTemplate = this.matchTemplate(request.description);
      if (matchedTemplate) {
        return this.templateToPipeline(matchedTemplate, request);
      }
    }
    return this.generateCustomPipeline(request);
  }
  matchTemplate(description) {
    const words = description.toLowerCase().split(/\W+/);
    let bestMatch = null;
    let bestScore = 0;
    for (const template of this.templates) {
      const score = template.keywords.filter(
        (kw) => words.some((w) => w.includes(kw) || kw.includes(w))
      ).length;
      if (score > bestScore && score >= 2) {
        bestScore = score;
        bestMatch = template;
      }
    }
    return bestMatch;
  }
  templateToPipeline(template, request) {
    const totalTokens = template.steps.reduce(
      (sum, s) => sum + (s.estimatedTokens || 0),
      0
    );
    const totalCost = template.steps.reduce(
      (sum, s) => sum + (s.estimatedCost || 0),
      0
    );
    return {
      id: randomUUID5(),
      name: this.generatePipelineName(request.description),
      description: request.description,
      steps: template.steps,
      inputSchema: template.inputSchema,
      outputSchema: template.outputSchema,
      estimatedTotalTokens: totalTokens,
      estimatedTotalCost: totalCost,
      confidence: 0.85,
      reasoning: `Matched template "${template.name}" based on your description. This is a proven pattern for ${template.description.toLowerCase()}.`,
      alternatives: this.findAlternativeApproaches(template, request)
    };
  }
  async generateCustomPipeline(request) {
    const steps = [
      {
        name: "Process Input",
        type: "llm_call",
        description: "Process the input according to requirements",
        config: {},
        prompt: `You are helping with: ${request.description}

Process this input: {{input}}`,
        model: this.config.model,
        estimatedTokens: 1e3,
        estimatedCost: 0.01
      },
      {
        name: "Format Output",
        type: "data_transform",
        description: "Format the output as needed",
        config: {},
        dependencies: [0]
      }
    ];
    return {
      id: randomUUID5(),
      name: this.generatePipelineName(request.description),
      description: request.description,
      steps,
      inputSchema: {
        input: { type: "string", description: "The input to process", required: true }
      },
      outputSchema: {
        output: { type: "string", description: "The processed output" }
      },
      estimatedTotalTokens: 1e3,
      estimatedTotalCost: 0.01,
      confidence: 0.6,
      reasoning: "Generated a basic custom pipeline. Consider refining the steps to better match your specific requirements.",
      alternatives: [
        {
          description: "Add validation step",
          tradeoffs: "Increases reliability but adds latency and cost"
        },
        {
          description: "Split into multiple specialized steps",
          tradeoffs: "Better modularity but higher total cost"
        }
      ]
    };
  }
  generatePipelineName(description) {
    const words = description.split(/\W+/).filter((w) => w.length > 3).slice(0, 3);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") + " Pipeline";
  }
  findAlternativeApproaches(template, request) {
    const alternatives = [];
    if (!template.steps.some((s) => s.type === "data_transform" && s.config.validate)) {
      alternatives.push({
        description: "Add output validation step",
        tradeoffs: "More reliable but slightly higher cost (+$0.001)"
      });
    }
    if (template.steps.some((s) => s.model?.includes("sonnet"))) {
      alternatives.push({
        description: "Use faster/cheaper Haiku model for all steps",
        tradeoffs: "50% cheaper, faster, but may reduce quality for complex tasks"
      });
    }
    const independentSteps = template.steps.filter(
      (s) => !s.dependencies || s.dependencies.length === 0
    );
    if (independentSteps.length > 1) {
      alternatives.push({
        description: "Run initial steps in parallel",
        tradeoffs: "Faster execution but requires more concurrent API calls"
      });
    }
    return alternatives;
  }
  // ==========================================================================
  // REFINEMENT
  // ==========================================================================
  parseRefinement(instruction, pipeline) {
    const lower = instruction.toLowerCase();
    if (lower.includes("add") && (lower.includes("step") || lower.includes("validation"))) {
      return { type: "add_step", instruction };
    }
    if (lower.includes("remove") || lower.includes("delete")) {
      const stepMatch = instruction.match(/step\s*(\d+)/i);
      return {
        type: "remove_step",
        instruction,
        stepIndex: stepMatch ? parseInt(stepMatch[1]) - 1 : void 0
      };
    }
    if (lower.includes("change") || lower.includes("modify") || lower.includes("update")) {
      const stepMatch = instruction.match(/step\s*(\d+)/i);
      return {
        type: "modify_step",
        instruction,
        stepIndex: stepMatch ? parseInt(stepMatch[1]) - 1 : void 0
      };
    }
    if (lower.includes("reorder") || lower.includes("move")) {
      return { type: "reorder", instruction };
    }
    if (lower.includes("model") || lower.includes("haiku") || lower.includes("sonnet")) {
      return { type: "change_model", instruction };
    }
    return { type: "other", instruction };
  }
  async applyRefinement(pipeline, refinement) {
    const updated = { ...pipeline, id: randomUUID5() };
    switch (refinement.type) {
      case "add_step":
        updated.steps = [
          ...updated.steps,
          {
            name: "New Step",
            type: "llm_call",
            description: "Added step based on refinement",
            config: {},
            model: "claude-3-haiku-20240307",
            estimatedTokens: 200,
            estimatedCost: 4e-4
          }
        ];
        break;
      case "remove_step":
        if (refinement.stepIndex !== void 0 && refinement.stepIndex < updated.steps.length) {
          updated.steps = updated.steps.filter((_, i) => i !== refinement.stepIndex);
          updated.steps = updated.steps.map((s) => ({
            ...s,
            dependencies: s.dependencies?.filter((d) => d !== refinement.stepIndex).map((d) => d > refinement.stepIndex ? d - 1 : d)
          }));
        }
        break;
      case "change_model":
        const targetModel = refinement.instruction.toLowerCase().includes("haiku") ? "claude-3-haiku-20240307" : "claude-3-sonnet-20240229";
        updated.steps = updated.steps.map(
          (s) => s.model ? { ...s, model: targetModel } : s
        );
        break;
      case "add_validation":
        updated.steps.push({
          name: "Validate Output",
          type: "data_transform",
          description: "Validate the output format and content",
          config: { validate: true },
          dependencies: [updated.steps.length - 1]
        });
        break;
    }
    updated.estimatedTotalTokens = updated.steps.reduce(
      (sum, s) => sum + (s.estimatedTokens || 0),
      0
    );
    updated.estimatedTotalCost = updated.steps.reduce(
      (sum, s) => sum + (s.estimatedCost || 0),
      0
    );
    return updated;
  }
  // ==========================================================================
  // FORMATTING
  // ==========================================================================
  formatPipelineResponse(pipeline) {
    let response = `I've generated a pipeline for you:

`;
    response += `**${pipeline.name}**

`;
    response += `${pipeline.reasoning}

`;
    response += `**Steps (${pipeline.steps.length}):**
`;
    pipeline.steps.forEach((step, i) => {
      response += `${i + 1}. **${step.name}** - ${step.description}`;
      if (step.model) response += ` (${step.model.split("-").pop()})`;
      response += `
`;
    });
    response += `
**Estimated Cost:** $${pipeline.estimatedTotalCost.toFixed(4)}
`;
    response += `**Confidence:** ${(pipeline.confidence * 100).toFixed(0)}%

`;
    if (pipeline.alternatives && pipeline.alternatives.length > 0) {
      response += `**Alternative approaches:**
`;
      pipeline.alternatives.forEach((alt) => {
        response += `- ${alt.description}: ${alt.tradeoffs}
`;
      });
    }
    response += `
You can refine this by saying things like "add a validation step" or "use haiku for all steps".`;
    return response;
  }
  formatRefinementResponse(refinement, pipeline) {
    let response = `I've updated the pipeline based on your request.

`;
    response += `**Updated Steps (${pipeline.steps.length}):**
`;
    pipeline.steps.forEach((step, i) => {
      response += `${i + 1}. **${step.name}** - ${step.description}
`;
    });
    response += `
**New Estimated Cost:** $${pipeline.estimatedTotalCost.toFixed(4)}
`;
    response += `
Anything else you'd like to change?`;
    return response;
  }
  // ==========================================================================
  // TEMPLATE MANAGEMENT
  // ==========================================================================
  addTemplate(template) {
    this.templates.push(template);
  }
  getTemplates() {
    return [...this.templates];
  }
};
var instance5 = null;
function getNLBuilder() {
  if (!instance5) {
    instance5 = new NLBuilder();
  }
  return instance5;
}
function createNLBuilder(config = {}) {
  instance5 = new NLBuilder(config);
  return instance5;
}

// src/intelligence/predictive-analytics.ts
import { EventEmitter as EventEmitter8 } from "eventemitter3";
import { randomUUID as randomUUID6 } from "crypto";
import { z as z9 } from "zod";
var PredictionTypeSchema = z9.enum([
  "execution_time",
  "cost",
  "token_usage",
  "success_rate",
  "traffic",
  "capacity"
]);
var PredictionConfidenceSchema = z9.enum(["low", "medium", "high"]);
var PredictionSchema = z9.object({
  id: z9.string(),
  type: PredictionTypeSchema,
  target: z9.string(),
  // pipeline ID, service name, etc.
  targetType: z9.enum(["pipeline", "service", "organization", "global"]),
  // Prediction details
  predictedValue: z9.number(),
  unit: z9.string(),
  confidence: PredictionConfidenceSchema,
  confidenceScore: z9.number().min(0).max(1),
  // Range
  lowerBound: z9.number(),
  upperBound: z9.number(),
  // Time frame
  horizon: z9.enum(["hour", "day", "week", "month"]),
  predictedFor: z9.date(),
  createdAt: z9.date(),
  // Factors
  factors: z9.array(z9.object({
    name: z9.string(),
    impact: z9.number(),
    // -1 to 1, negative = decreases, positive = increases
    description: z9.string()
  })).optional(),
  // Model info
  modelVersion: z9.string(),
  dataPointsUsed: z9.number()
});
var ForecastSchema = z9.object({
  id: z9.string(),
  type: PredictionTypeSchema,
  target: z9.string(),
  horizon: z9.enum(["day", "week", "month", "quarter"]),
  startDate: z9.date(),
  endDate: z9.date(),
  predictions: z9.array(z9.object({
    date: z9.date(),
    value: z9.number(),
    lowerBound: z9.number(),
    upperBound: z9.number()
  })),
  trend: z9.enum(["increasing", "decreasing", "stable", "volatile"]),
  trendStrength: z9.number().min(0).max(1),
  seasonality: z9.object({
    detected: z9.boolean(),
    period: z9.string().optional(),
    // "daily", "weekly", "monthly"
    amplitude: z9.number().optional()
  }),
  createdAt: z9.date()
});
var CapacityPlanSchema = z9.object({
  id: z9.string(),
  target: z9.string(),
  currentCapacity: z9.number(),
  currentUsage: z9.number(),
  usagePercent: z9.number(),
  projectedUsage: z9.array(z9.object({
    date: z9.date(),
    usage: z9.number(),
    percent: z9.number()
  })),
  recommendations: z9.array(z9.object({
    action: z9.enum(["scale_up", "scale_down", "optimize", "no_action"]),
    description: z9.string(),
    timing: z9.string(),
    impact: z9.string(),
    priority: z9.enum(["low", "medium", "high"])
  })),
  alertThresholds: z9.object({
    warning: z9.number(),
    // percent
    critical: z9.number()
  }),
  createdAt: z9.date()
});
var UsageTrendSchema = z9.object({
  metric: z9.string(),
  period: z9.enum(["day", "week", "month"]),
  dataPoints: z9.array(z9.object({
    date: z9.date(),
    value: z9.number()
  })),
  trend: z9.object({
    direction: z9.enum(["up", "down", "stable"]),
    percentChange: z9.number(),
    slope: z9.number()
  }),
  comparison: z9.object({
    previousPeriod: z9.number(),
    percentChange: z9.number()
  })
});
var PredictiveAnalyticsConfigSchema = z9.object({
  enabled: z9.boolean().default(true),
  updateIntervalMs: z9.number().default(36e5),
  // 1 hour
  minDataPoints: z9.number().default(30),
  forecastHorizons: z9.array(z9.enum(["day", "week", "month", "quarter"])).default(["day", "week"]),
  confidenceLevel: z9.number().default(0.95),
  seasonalityDetection: z9.boolean().default(true),
  anomalyAdjustment: z9.boolean().default(true)
});
var PredictiveAnalytics = class extends EventEmitter8 {
  config;
  historicalData = /* @__PURE__ */ new Map();
  predictions = /* @__PURE__ */ new Map();
  forecasts = /* @__PURE__ */ new Map();
  capacityPlans = /* @__PURE__ */ new Map();
  updateTimer;
  constructor(config = {}) {
    super();
    this.config = PredictiveAnalyticsConfigSchema.parse(config);
  }
  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================
  start() {
    if (!this.config.enabled) return;
    this.updateTimer = setInterval(() => {
      this.updatePredictions();
    }, this.config.updateIntervalMs);
  }
  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }
  // ==========================================================================
  // DATA INGESTION
  // ==========================================================================
  recordDataPoint(metric, target, value, metadata) {
    const key = `${metric}:${target}`;
    const series = this.historicalData.get(key) || {
      metric,
      target,
      points: []
    };
    series.points.push({
      timestamp: /* @__PURE__ */ new Date(),
      value,
      metadata
    });
    const cutoff = Date.now() - 90 * 24 * 36e5;
    series.points = series.points.filter((p) => p.timestamp.getTime() > cutoff);
    this.historicalData.set(key, series);
  }
  recordExecution(pipelineId, duration, cost, tokens, success) {
    this.recordDataPoint("execution_time", pipelineId, duration);
    this.recordDataPoint("cost", pipelineId, cost);
    this.recordDataPoint("tokens", pipelineId, tokens);
    this.recordDataPoint("success", pipelineId, success ? 1 : 0);
  }
  recordTraffic(service, requestCount) {
    this.recordDataPoint("traffic", service, requestCount);
  }
  // ==========================================================================
  // PREDICTIONS
  // ==========================================================================
  async predictExecutionTime(pipelineId) {
    const data = this.getHistoricalData("execution_time", pipelineId);
    const prediction = this.generatePrediction(
      "execution_time",
      pipelineId,
      "pipeline",
      data,
      "ms"
    );
    this.predictions.set(prediction.id, prediction);
    this.emit("prediction:created", prediction);
    return prediction;
  }
  async predictCost(pipelineId, horizon = "day") {
    const data = this.getHistoricalData("cost", pipelineId);
    const prediction = this.generatePrediction(
      "cost",
      pipelineId,
      "pipeline",
      data,
      "USD",
      horizon
    );
    this.predictions.set(prediction.id, prediction);
    this.emit("prediction:created", prediction);
    return prediction;
  }
  async predictTokenUsage(pipelineId, horizon = "day") {
    const data = this.getHistoricalData("tokens", pipelineId);
    const prediction = this.generatePrediction(
      "token_usage",
      pipelineId,
      "pipeline",
      data,
      "tokens",
      horizon
    );
    this.predictions.set(prediction.id, prediction);
    this.emit("prediction:created", prediction);
    return prediction;
  }
  async predictSuccessRate(pipelineId) {
    const data = this.getHistoricalData("success", pipelineId);
    const prediction = this.generatePrediction(
      "success_rate",
      pipelineId,
      "pipeline",
      data,
      "%"
    );
    prediction.predictedValue *= 100;
    prediction.lowerBound *= 100;
    prediction.upperBound *= 100;
    this.predictions.set(prediction.id, prediction);
    this.emit("prediction:created", prediction);
    return prediction;
  }
  async predictTraffic(service, horizon = "day") {
    const data = this.getHistoricalData("traffic", service);
    const prediction = this.generatePrediction(
      "traffic",
      service,
      "service",
      data,
      "requests",
      horizon
    );
    this.predictions.set(prediction.id, prediction);
    this.emit("prediction:created", prediction);
    return prediction;
  }
  getPrediction(predictionId) {
    return this.predictions.get(predictionId);
  }
  getLatestPredictions(target, type) {
    const predictions = Array.from(this.predictions.values()).filter((p) => p.target === target && (!type || p.type === type)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return predictions;
  }
  // ==========================================================================
  // FORECASTING
  // ==========================================================================
  async generateForecast(type, target, horizon = "week") {
    const metricMap = {
      execution_time: "execution_time",
      cost: "cost",
      token_usage: "tokens",
      success_rate: "success",
      traffic: "traffic",
      capacity: "traffic"
    };
    const data = this.getHistoricalData(metricMap[type], target);
    const forecast = this.buildForecast(type, target, data, horizon);
    this.forecasts.set(forecast.id, forecast);
    this.emit("forecast:updated", forecast);
    return forecast;
  }
  getForecast(forecastId) {
    return this.forecasts.get(forecastId);
  }
  // ==========================================================================
  // CAPACITY PLANNING
  // ==========================================================================
  async generateCapacityPlan(target, currentCapacity) {
    const trafficData = this.getHistoricalData("traffic", target);
    const plan = this.buildCapacityPlan(target, currentCapacity, trafficData);
    this.capacityPlans.set(plan.id, plan);
    if (plan.usagePercent > plan.alertThresholds.warning) {
      this.emit("capacity:warning", plan);
    }
    return plan;
  }
  getCapacityPlan(target) {
    return this.capacityPlans.get(target);
  }
  // ==========================================================================
  // TRENDS
  // ==========================================================================
  analyzeTrend(metric, target, period = "week") {
    const data = this.getHistoricalData(metric, target);
    const trend = this.calculateTrend(metric, data, period);
    this.emit("trend:detected", trend);
    return trend;
  }
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  getHistoricalData(metric, target) {
    const key = `${metric}:${target}`;
    const series = this.historicalData.get(key);
    return series?.points || [];
  }
  generatePrediction(type, target, targetType, data, unit, horizon = "day") {
    const values = data.map((d) => d.value);
    const stats = this.calculateStats(values);
    const ema = this.calculateEMA(values);
    const predictedValue = ema;
    const confidence = this.calculateConfidence(data.length, stats.cv);
    const margin = stats.stdDev * (confidence === "high" ? 1.5 : confidence === "medium" ? 2 : 2.5);
    const factors = this.identifyFactors(data, stats);
    const horizonMs = {
      hour: 36e5,
      day: 864e5,
      week: 6048e5,
      month: 2592e6
    }[horizon];
    return {
      id: randomUUID6(),
      type,
      target,
      targetType,
      predictedValue: Math.max(0, predictedValue),
      unit,
      confidence,
      confidenceScore: confidence === "high" ? 0.9 : confidence === "medium" ? 0.7 : 0.5,
      lowerBound: Math.max(0, predictedValue - margin),
      upperBound: predictedValue + margin,
      horizon,
      predictedFor: new Date(Date.now() + horizonMs),
      createdAt: /* @__PURE__ */ new Date(),
      factors,
      modelVersion: "1.0.0",
      dataPointsUsed: data.length
    };
  }
  buildForecast(type, target, data, horizon) {
    const values = data.map((d) => d.value);
    const stats = this.calculateStats(values);
    const horizonDays = { day: 1, week: 7, month: 30, quarter: 90 }[horizon];
    const predictions = [];
    const trend = this.detectTrend(values);
    const seasonality = this.detectSeasonality(data);
    for (let i = 1; i <= horizonDays; i++) {
      const date = new Date(Date.now() + i * 864e5);
      const baseValue = stats.mean;
      let value = baseValue + trend.slope * i;
      if (seasonality.detected && seasonality.amplitude) {
        const dayOfWeek = date.getDay();
        value += seasonality.amplitude * Math.sin(dayOfWeek / 7 * 2 * Math.PI);
      }
      const margin = stats.stdDev * 1.96;
      predictions.push({
        date,
        value: Math.max(0, value),
        lowerBound: Math.max(0, value - margin),
        upperBound: value + margin
      });
    }
    return {
      id: randomUUID6(),
      type,
      target,
      horizon,
      startDate: /* @__PURE__ */ new Date(),
      endDate: new Date(Date.now() + horizonDays * 864e5),
      predictions,
      trend: trend.direction === "up" ? "increasing" : trend.direction === "down" ? "decreasing" : Math.abs(trend.slope) < 0.01 ? "stable" : "volatile",
      trendStrength: Math.min(1, Math.abs(trend.slope) / stats.mean),
      seasonality,
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  buildCapacityPlan(target, currentCapacity, data) {
    const values = data.map((d) => d.value);
    const stats = this.calculateStats(values);
    const trend = this.detectTrend(values);
    const currentUsage = values.length > 0 ? values[values.length - 1] : 0;
    const usagePercent = currentUsage / currentCapacity * 100;
    const projectedUsage = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date(Date.now() + i * 864e5);
      const usage = currentUsage + trend.slope * i;
      projectedUsage.push({
        date,
        usage: Math.max(0, usage),
        percent: Math.max(0, usage) / currentCapacity * 100
      });
    }
    const recommendations = [];
    const maxProjectedPercent = Math.max(...projectedUsage.map((p) => p.percent));
    if (maxProjectedPercent > 90) {
      recommendations.push({
        action: "scale_up",
        description: "Projected usage will exceed 90% capacity",
        timing: "Within 2 weeks",
        impact: "Prevent service degradation",
        priority: "high"
      });
    } else if (maxProjectedPercent > 75) {
      recommendations.push({
        action: "scale_up",
        description: "Projected usage approaching capacity limits",
        timing: "Within 4 weeks",
        impact: "Maintain performance headroom",
        priority: "medium"
      });
    } else if (usagePercent < 30 && trend.direction !== "up") {
      recommendations.push({
        action: "scale_down",
        description: "Current usage is well below capacity",
        timing: "Consider in next review",
        impact: "Reduce costs by 20-40%",
        priority: "low"
      });
    }
    if (stats.cv > 0.5) {
      recommendations.push({
        action: "optimize",
        description: "High usage variance detected",
        timing: "As soon as possible",
        impact: "More predictable capacity needs",
        priority: "medium"
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        action: "no_action",
        description: "Current capacity is appropriate",
        timing: "Review in 30 days",
        impact: "None needed",
        priority: "low"
      });
    }
    return {
      id: randomUUID6(),
      target,
      currentCapacity,
      currentUsage,
      usagePercent,
      projectedUsage,
      recommendations,
      alertThresholds: {
        warning: 75,
        critical: 90
      },
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  calculateStats(values) {
    if (values.length === 0) {
      return { mean: 0, stdDev: 0, cv: 0, min: 0, max: 0 };
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return {
      mean,
      stdDev,
      cv: mean > 0 ? stdDev / mean : 0,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }
  calculateEMA(values, smoothing = 0.2) {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = values[i] * smoothing + ema * (1 - smoothing);
    }
    return ema;
  }
  calculateConfidence(dataPoints, cv) {
    if (dataPoints < this.config.minDataPoints) return "low";
    if (cv > 0.5) return "low";
    if (dataPoints >= 100 && cv < 0.2) return "high";
    return "medium";
  }
  identifyFactors(data, stats) {
    const factors = [];
    if (data.length >= 7) {
      const recentValues = data.slice(-7).map((d) => d.value);
      const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      const trendImpact = (recentMean - stats.mean) / stats.mean;
      if (Math.abs(trendImpact) > 0.1) {
        factors.push({
          name: "Recent trend",
          impact: trendImpact > 0 ? 0.3 : -0.3,
          description: trendImpact > 0 ? "Recent values trending above historical average" : "Recent values trending below historical average"
        });
      }
    }
    const dayPatterns = /* @__PURE__ */ new Map();
    data.forEach((d) => {
      const day = d.timestamp.getDay();
      const values = dayPatterns.get(day) || [];
      values.push(d.value);
      dayPatterns.set(day, values);
    });
    const today = (/* @__PURE__ */ new Date()).getDay();
    const todayValues = dayPatterns.get(today);
    if (todayValues && todayValues.length > 3) {
      const todayMean = todayValues.reduce((a, b) => a + b, 0) / todayValues.length;
      const dayImpact = (todayMean - stats.mean) / stats.mean;
      if (Math.abs(dayImpact) > 0.15) {
        factors.push({
          name: "Day-of-week pattern",
          impact: dayImpact > 0 ? 0.2 : -0.2,
          description: dayImpact > 0 ? "This day typically has higher than average values" : "This day typically has lower than average values"
        });
      }
    }
    return factors;
  }
  detectTrend(values) {
    if (values.length < 3) {
      return { direction: "stable", slope: 0 };
    }
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const mean = sumY / n;
    const relativeSlope = slope / (mean || 1);
    if (relativeSlope > 0.01) return { direction: "up", slope };
    if (relativeSlope < -0.01) return { direction: "down", slope };
    return { direction: "stable", slope };
  }
  detectSeasonality(data) {
    if (!this.config.seasonalityDetection || data.length < 14) {
      return { detected: false };
    }
    const dayAverages = /* @__PURE__ */ new Map();
    data.forEach((d) => {
      const day = d.timestamp.getDay();
      const values = dayAverages.get(day) || [];
      values.push(d.value);
      dayAverages.set(day, values);
    });
    if (dayAverages.size < 7) {
      return { detected: false };
    }
    const dailyMeans = Array.from(dayAverages.values()).map(
      (vals) => vals.reduce((a, b) => a + b, 0) / vals.length
    );
    const overallMean = dailyMeans.reduce((a, b) => a + b, 0) / dailyMeans.length;
    const variance = dailyMeans.reduce((sum, v) => sum + Math.pow(v - overallMean, 2), 0) / dailyMeans.length;
    const amplitude = Math.sqrt(variance);
    if (amplitude / overallMean > 0.1) {
      return {
        detected: true,
        period: "weekly",
        amplitude
      };
    }
    return { detected: false };
  }
  calculateTrend(metric, data, period) {
    const periodMs = { day: 864e5, week: 6048e5, month: 2592e6 }[period];
    const cutoff = Date.now() - periodMs;
    const periodData = data.filter((d) => d.timestamp.getTime() > cutoff);
    const previousCutoff = cutoff - periodMs;
    const previousData = data.filter(
      (d) => d.timestamp.getTime() > previousCutoff && d.timestamp.getTime() <= cutoff
    );
    const currentSum = periodData.reduce((sum, d) => sum + d.value, 0);
    const previousSum = previousData.reduce((sum, d) => sum + d.value, 0);
    const trend = this.detectTrend(periodData.map((d) => d.value));
    const percentChange = previousSum > 0 ? (currentSum - previousSum) / previousSum * 100 : 0;
    return {
      metric,
      period,
      dataPoints: periodData.map((d) => ({ date: d.timestamp, value: d.value })),
      trend: {
        direction: trend.direction,
        percentChange,
        slope: trend.slope
      },
      comparison: {
        previousPeriod: previousSum,
        percentChange
      }
    };
  }
  updatePredictions() {
    for (const [key] of this.historicalData) {
      const [metric, target] = key.split(":");
      const typeMap = {
        execution_time: "execution_time",
        cost: "cost",
        tokens: "token_usage",
        success: "success_rate",
        traffic: "traffic"
      };
      const type = typeMap[metric];
      if (type) {
        const data = this.getHistoricalData(metric, target);
        if (data.length >= this.config.minDataPoints) {
          const prediction = this.generatePrediction(
            type,
            target,
            "pipeline",
            data,
            type === "cost" ? "USD" : type === "execution_time" ? "ms" : "units"
          );
          this.predictions.set(`${type}:${target}`, prediction);
        }
      }
    }
  }
};
var instance6 = null;
function getPredictiveAnalytics() {
  if (!instance6) {
    instance6 = new PredictiveAnalytics();
  }
  return instance6;
}
function createPredictiveAnalytics(config = {}) {
  instance6 = new PredictiveAnalytics(config);
  return instance6;
}

// src/reliability/types.ts
import { z as z10 } from "zod";
var CircuitStateSchema = z10.enum(["closed", "open", "half_open"]);
var CircuitBreakerConfigSchema = z10.object({
  name: z10.string(),
  failureThreshold: z10.number().min(1).default(5),
  successThreshold: z10.number().min(1).default(3),
  timeout: z10.number().min(1e3).default(3e4),
  // Time in OPEN before trying HALF_OPEN
  volumeThreshold: z10.number().min(1).default(10),
  // Min requests before tripping
  errorPercentageThreshold: z10.number().min(0).max(100).default(50),
  rollingWindowMs: z10.number().default(6e4),
  // Window for calculating error rate
  halfOpenMaxCalls: z10.number().min(1).default(3)
  // Max calls in HALF_OPEN
});
var CircuitStatsSchema = z10.object({
  totalRequests: z10.number(),
  successfulRequests: z10.number(),
  failedRequests: z10.number(),
  rejectedRequests: z10.number(),
  lastFailureTime: z10.date().optional(),
  lastSuccessTime: z10.date().optional(),
  stateChangedAt: z10.date(),
  consecutiveFailures: z10.number(),
  consecutiveSuccesses: z10.number()
});
var CircuitBreakerStateSchema = z10.object({
  name: z10.string(),
  state: CircuitStateSchema,
  stats: CircuitStatsSchema,
  config: CircuitBreakerConfigSchema
});
var RetryStrategyTypeSchema = z10.enum([
  "fixed",
  "linear",
  "exponential",
  "exponential_jitter"
]);
var RetryConfigSchema = z10.object({
  maxRetries: z10.number().min(0).default(3),
  strategy: RetryStrategyTypeSchema.default("exponential_jitter"),
  baseDelayMs: z10.number().min(0).default(1e3),
  maxDelayMs: z10.number().min(0).default(3e4),
  jitterFactor: z10.number().min(0).max(1).default(0.2),
  retryableErrors: z10.array(z10.string()).optional(),
  // Error codes/names to retry
  nonRetryableErrors: z10.array(z10.string()).optional(),
  // Error codes to never retry
  retryBudgetPerMinute: z10.number().optional(),
  // Max retries per minute
  onRetry: z10.function().args(z10.number(), z10.unknown()).optional()
});
var RetryAttemptSchema = z10.object({
  attempt: z10.number(),
  delay: z10.number(),
  error: z10.unknown().optional(),
  timestamp: z10.date()
});
var RetryResultSchema = z10.object({
  success: z10.boolean(),
  result: z10.unknown().optional(),
  error: z10.unknown().optional(),
  attempts: z10.array(RetryAttemptSchema),
  totalTime: z10.number()
});
var TimeoutConfigSchema = z10.object({
  defaultTimeout: z10.number().min(0).default(3e4),
  operationTimeouts: z10.record(z10.number()).optional(),
  // Per-operation overrides
  cascadingBudget: z10.boolean().default(true),
  // Reduce timeout for child operations
  budgetReservePercent: z10.number().min(0).max(50).default(10)
  // Reserve for cleanup
});
var TimeoutContextSchema = z10.object({
  operationId: z10.string(),
  parentId: z10.string().optional(),
  timeout: z10.number(),
  startTime: z10.date(),
  deadline: z10.date(),
  remainingMs: z10.number(),
  abortController: z10.instanceof(AbortController).optional()
});
var TimeoutResultSchema = z10.object({
  operationId: z10.string(),
  timedOut: z10.boolean(),
  elapsedMs: z10.number(),
  remainingMs: z10.number()
});
var HealthStatusSchema = z10.enum([
  "healthy",
  "degraded",
  "unhealthy",
  "unknown"
]);
var HealthCheckTypeSchema2 = z10.enum([
  "liveness",
  "readiness",
  "startup",
  "deep"
]);
var ServiceHealthSchema = z10.object({
  name: z10.string(),
  status: HealthStatusSchema,
  latency: z10.number().optional(),
  lastCheck: z10.date(),
  message: z10.string().optional(),
  metadata: z10.record(z10.unknown()).optional()
});
var DependencySchema = z10.object({
  name: z10.string(),
  type: z10.enum(["required", "optional"]),
  checkFn: z10.function().returns(z10.promise(z10.boolean())).optional(),
  timeout: z10.number().default(5e3),
  weight: z10.number().min(0).max(1).default(1)
  // Impact on overall health
});
var HealthAggregatorConfigSchema = z10.object({
  checkInterval: z10.number().default(3e4),
  unhealthyThreshold: z10.number().default(3),
  // Consecutive failures
  healthyThreshold: z10.number().default(2),
  // Consecutive successes to recover
  historySize: z10.number().default(100),
  dependencies: z10.array(DependencySchema).optional()
});
var AggregatedHealthSchema = z10.object({
  status: HealthStatusSchema,
  services: z10.array(ServiceHealthSchema),
  dependencies: z10.array(ServiceHealthSchema),
  uptime: z10.number(),
  lastUpdated: z10.date(),
  version: z10.string().optional()
});
var HealthHistoryEntrySchema = z10.object({
  timestamp: z10.date(),
  status: HealthStatusSchema,
  services: z10.record(HealthStatusSchema)
});
var ReliabilityManagerConfigSchema = z10.object({
  defaultCircuitBreaker: CircuitBreakerConfigSchema.optional(),
  defaultRetry: RetryConfigSchema.optional(),
  defaultTimeout: TimeoutConfigSchema.optional(),
  healthAggregator: HealthAggregatorConfigSchema.optional()
});

// src/reliability/circuit-breaker.ts
import { EventEmitter as EventEmitter9 } from "eventemitter3";
var CircuitOpenError = class extends Error {
  constructor(circuitName, state, stats) {
    super(`Circuit breaker '${circuitName}' is ${state}`);
    this.circuitName = circuitName;
    this.state = state;
    this.stats = stats;
    this.name = "CircuitOpenError";
  }
};
var CircuitBreaker = class extends EventEmitter9 {
  config;
  state = "closed";
  stats;
  halfOpenCalls = 0;
  requestTimestamps = [];
  failureTimestamps = [];
  stateTimer = null;
  constructor(config) {
    super();
    this.config = CircuitBreakerConfigSchema.parse(config);
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      stateChangedAt: /* @__PURE__ */ new Date(),
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };
  }
  // ============================================================================
  // Public API
  // ============================================================================
  /**
   * Execute a function with circuit breaker protection
   */
  async execute(fn) {
    if (!this.allowRequest()) {
      this.stats.rejectedRequests++;
      this.emit("requestRejected", this.config.name);
      throw new CircuitOpenError(this.config.name, this.state, this.stats);
    }
    const startTime = Date.now();
    try {
      const result = await fn();
      this.recordSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordFailure(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  /**
   * Wrap a function with circuit breaker
   */
  wrap(fn) {
    return async (...args) => {
      return this.execute(() => fn(...args));
    };
  }
  /**
   * Get current state
   */
  getState() {
    return {
      name: this.config.name,
      state: this.state,
      stats: { ...this.stats },
      config: { ...this.config }
    };
  }
  /**
   * Manually open the circuit
   */
  open() {
    this.transitionTo("open");
  }
  /**
   * Manually close the circuit
   */
  close() {
    this.transitionTo("closed");
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      stateChangedAt: /* @__PURE__ */ new Date(),
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };
    this.requestTimestamps = [];
    this.failureTimestamps = [];
  }
  /**
   * Get error rate in rolling window
   */
  getErrorRate() {
    this.cleanupOldTimestamps();
    if (this.requestTimestamps.length < this.config.volumeThreshold) {
      return 0;
    }
    return this.failureTimestamps.length / this.requestTimestamps.length * 100;
  }
  /**
   * Check if circuit is allowing requests
   */
  isAllowing() {
    return this.allowRequest();
  }
  /**
   * Dispose of the circuit breaker
   */
  dispose() {
    if (this.stateTimer) {
      clearTimeout(this.stateTimer);
      this.stateTimer = null;
    }
    this.removeAllListeners();
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  allowRequest() {
    switch (this.state) {
      case "closed":
        return true;
      case "open":
        return false;
      case "half_open":
        if (this.halfOpenCalls < this.config.halfOpenMaxCalls) {
          this.halfOpenCalls++;
          return true;
        }
        return false;
      default:
        return false;
    }
  }
  recordSuccess(duration) {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.stats.totalRequests++;
    this.stats.successfulRequests++;
    this.stats.lastSuccessTime = /* @__PURE__ */ new Date();
    this.stats.consecutiveSuccesses++;
    this.stats.consecutiveFailures = 0;
    this.emit("requestSuccess", this.config.name, duration);
    if (this.state === "half_open") {
      if (this.stats.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionTo("closed");
      }
    }
    this.cleanupOldTimestamps();
  }
  recordFailure(error) {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.failureTimestamps.push(now);
    this.stats.totalRequests++;
    this.stats.failedRequests++;
    this.stats.lastFailureTime = /* @__PURE__ */ new Date();
    this.stats.consecutiveFailures++;
    this.stats.consecutiveSuccesses = 0;
    this.emit("requestFailure", this.config.name, error);
    if (this.state === "closed") {
      if (this.shouldTrip()) {
        this.transitionTo("open");
      }
    } else if (this.state === "half_open") {
      this.transitionTo("open");
    }
    this.cleanupOldTimestamps();
  }
  shouldTrip() {
    if (this.requestTimestamps.length < this.config.volumeThreshold) {
      return false;
    }
    if (this.stats.consecutiveFailures >= this.config.failureThreshold) {
      return true;
    }
    const errorRate = this.getErrorRate();
    return errorRate >= this.config.errorPercentageThreshold;
  }
  transitionTo(newState) {
    if (this.state === newState) {
      return;
    }
    const oldState = this.state;
    this.state = newState;
    this.stats.stateChangedAt = /* @__PURE__ */ new Date();
    if (this.stateTimer) {
      clearTimeout(this.stateTimer);
      this.stateTimer = null;
    }
    this.emit("stateChanged", this.config.name, oldState, newState);
    switch (newState) {
      case "open":
        this.halfOpenCalls = 0;
        this.emit("opened", this.config.name, { ...this.stats });
        this.stateTimer = setTimeout(() => {
          this.transitionTo("half_open");
        }, this.config.timeout);
        break;
      case "closed":
        this.stats.consecutiveFailures = 0;
        this.stats.consecutiveSuccesses = 0;
        this.emit("closed", this.config.name, { ...this.stats });
        break;
      case "half_open":
        this.halfOpenCalls = 0;
        this.stats.consecutiveSuccesses = 0;
        this.emit("halfOpen", this.config.name);
        break;
    }
  }
  cleanupOldTimestamps() {
    const cutoff = Date.now() - this.config.rollingWindowMs;
    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > cutoff);
    this.failureTimestamps = this.failureTimestamps.filter((ts) => ts > cutoff);
  }
};
var CircuitBreakerRegistry = class extends EventEmitter9 {
  breakers = /* @__PURE__ */ new Map();
  defaultConfig;
  constructor(defaultConfig = {}) {
    super();
    this.defaultConfig = defaultConfig;
  }
  /**
   * Get or create a circuit breaker
   */
  get(name, config) {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker({
        name,
        ...this.defaultConfig,
        ...config
      });
      this.forwardEvents(breaker);
      this.breakers.set(name, breaker);
    }
    return breaker;
  }
  /**
   * Get all circuit breakers
   */
  getAll() {
    return new Map(this.breakers);
  }
  /**
   * Get all circuit breaker states
   */
  getAllStates() {
    return Array.from(this.breakers.values()).map((b) => b.getState());
  }
  /**
   * Remove a circuit breaker
   */
  remove(name) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.dispose();
      this.breakers.delete(name);
      return true;
    }
    return false;
  }
  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.resetStats();
      breaker.close();
    }
  }
  /**
   * Get summary of all circuit breakers
   */
  getSummary() {
    const states = this.getAllStates();
    return {
      total: states.length,
      closed: states.filter((s) => s.state === "closed").length,
      open: states.filter((s) => s.state === "open").length,
      halfOpen: states.filter((s) => s.state === "half_open").length
    };
  }
  /**
   * Dispose of all circuit breakers
   */
  dispose() {
    for (const breaker of this.breakers.values()) {
      breaker.dispose();
    }
    this.breakers.clear();
    this.removeAllListeners();
  }
  forwardEvents(breaker) {
    breaker.on("stateChanged", (...args) => this.emit("stateChanged", ...args));
    breaker.on("opened", (...args) => this.emit("opened", ...args));
    breaker.on("closed", (...args) => this.emit("closed", ...args));
    breaker.on("halfOpen", (...args) => this.emit("halfOpen", ...args));
    breaker.on("requestRejected", (...args) => this.emit("requestRejected", ...args));
    breaker.on("requestSuccess", (...args) => this.emit("requestSuccess", ...args));
    breaker.on("requestFailure", (...args) => this.emit("requestFailure", ...args));
  }
};
var registryInstance = null;
function getCircuitBreakerRegistry(config) {
  if (!registryInstance) {
    registryInstance = new CircuitBreakerRegistry(config);
  }
  return registryInstance;
}
function createCircuitBreakerRegistry(config) {
  return new CircuitBreakerRegistry(config);
}
function createCircuitBreaker(config) {
  return new CircuitBreaker(config);
}

// src/reliability/retry-strategy.ts
import { EventEmitter as EventEmitter10 } from "eventemitter3";
var RetryExhaustedError = class extends Error {
  constructor(attempts, lastError) {
    super(`Retry exhausted after ${attempts.length} attempts`);
    this.attempts = attempts;
    this.lastError = lastError;
    this.name = "RetryExhaustedError";
  }
};
var RetryStrategy = class extends EventEmitter10 {
  config;
  retryBudgetUsed = 0;
  budgetResetTime = Date.now();
  constructor(config = {}) {
    super();
    this.config = RetryConfigSchema.parse(config);
  }
  // ============================================================================
  // Public API
  // ============================================================================
  /**
   * Execute a function with retry logic
   */
  async execute(fn) {
    const attempts = [];
    const startTime = Date.now();
    let lastError;
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      if (attempt > 0 && !this.checkBudget()) {
        this.emit("budgetExhausted");
        return {
          success: false,
          error: new RetryExhaustedError(attempts, lastError),
          attempts,
          totalTime: Date.now() - startTime
        };
      }
      const delay = attempt > 0 ? this.calculateDelay(attempt) : 0;
      if (delay > 0) {
        this.emit("retrying", attempt, delay, lastError);
        if (this.config.onRetry) {
          this.config.onRetry(attempt, lastError);
        }
        await this.sleep(delay);
      }
      try {
        const result = await fn();
        const attemptRecord = {
          attempt,
          delay,
          timestamp: /* @__PURE__ */ new Date()
        };
        attempts.push(attemptRecord);
        this.emit("success", attempt);
        return {
          success: true,
          result,
          attempts,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error;
        const attemptRecord = {
          attempt,
          delay,
          error,
          timestamp: /* @__PURE__ */ new Date()
        };
        attempts.push(attemptRecord);
        if (!this.isRetryable(error)) {
          return {
            success: false,
            error,
            attempts,
            totalTime: Date.now() - startTime
          };
        }
        if (attempt > 0) {
          this.consumeBudget();
        }
      }
    }
    this.emit("exhausted", attempts);
    return {
      success: false,
      error: new RetryExhaustedError(attempts, lastError),
      attempts,
      totalTime: Date.now() - startTime
    };
  }
  /**
   * Wrap a function with retry logic
   */
  wrap(fn) {
    return async (...args) => {
      return this.execute(() => fn(...args));
    };
  }
  /**
   * Execute with automatic unwrap (throws on failure)
   */
  async executeOrThrow(fn) {
    const result = await this.execute(fn);
    if (!result.success) {
      throw result.error;
    }
    return result.result;
  }
  /**
   * Calculate delay for a given attempt
   */
  calculateDelay(attempt) {
    let delay;
    switch (this.config.strategy) {
      case "fixed":
        delay = this.config.baseDelayMs;
        break;
      case "linear":
        delay = this.config.baseDelayMs * attempt;
        break;
      case "exponential":
        delay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
        break;
      case "exponential_jitter":
        delay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
        const jitter = delay * this.config.jitterFactor * (Math.random() * 2 - 1);
        delay = delay + jitter;
        break;
      default:
        delay = this.config.baseDelayMs;
    }
    return Math.min(delay, this.config.maxDelayMs);
  }
  /**
   * Get remaining retry budget
   */
  getRemainingBudget() {
    if (!this.config.retryBudgetPerMinute) {
      return void 0;
    }
    this.refreshBudget();
    return Math.max(0, this.config.retryBudgetPerMinute - this.retryBudgetUsed);
  }
  /**
   * Reset retry budget
   */
  resetBudget() {
    this.retryBudgetUsed = 0;
    this.budgetResetTime = Date.now();
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  isRetryable(error) {
    const errorName = error instanceof Error ? error.name : String(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (this.config.nonRetryableErrors?.length) {
      for (const pattern of this.config.nonRetryableErrors) {
        if (errorName.includes(pattern) || errorMessage.includes(pattern)) {
          return false;
        }
      }
    }
    if (this.config.retryableErrors?.length) {
      for (const pattern of this.config.retryableErrors) {
        if (errorName.includes(pattern) || errorMessage.includes(pattern)) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
  checkBudget() {
    if (!this.config.retryBudgetPerMinute) {
      return true;
    }
    this.refreshBudget();
    return this.retryBudgetUsed < this.config.retryBudgetPerMinute;
  }
  consumeBudget() {
    if (this.config.retryBudgetPerMinute) {
      this.retryBudgetUsed++;
    }
  }
  refreshBudget() {
    const now = Date.now();
    if (now - this.budgetResetTime >= 6e4) {
      this.retryBudgetUsed = 0;
      this.budgetResetTime = now;
    }
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
function withRetry(fn, config) {
  const strategy = new RetryStrategy(config);
  return async (...args) => {
    const result = await strategy.execute(() => fn(...args));
    if (!result.success) {
      throw result.error;
    }
    return result.result;
  };
}
async function retryWithBackoff(fn, options) {
  const strategy = new RetryStrategy({
    maxRetries: options?.maxRetries ?? 3,
    baseDelayMs: options?.baseDelay ?? 1e3,
    maxDelayMs: options?.maxDelay ?? 3e4,
    strategy: "exponential_jitter"
  });
  return strategy.executeOrThrow(fn);
}
function createRetryStrategy(config) {
  return new RetryStrategy(config);
}
var DEFAULT_RETRY_STRATEGIES = {
  // Aggressive retry for transient failures
  aggressive: {
    maxRetries: 5,
    strategy: "exponential_jitter",
    baseDelayMs: 100,
    maxDelayMs: 5e3,
    jitterFactor: 0.3
  },
  // Conservative retry for external APIs
  conservative: {
    maxRetries: 3,
    strategy: "exponential",
    baseDelayMs: 1e3,
    maxDelayMs: 3e4,
    jitterFactor: 0.2
  },
  // Quick retry for cache operations
  quick: {
    maxRetries: 2,
    strategy: "fixed",
    baseDelayMs: 100,
    maxDelayMs: 500
  },
  // No retry
  none: {
    maxRetries: 0
  }
};

// src/reliability/timeout-manager.ts
import { EventEmitter as EventEmitter11 } from "eventemitter3";
import { randomUUID as randomUUID7 } from "crypto";
var TimeoutError = class extends Error {
  constructor(operationId, timeout, elapsed) {
    super(`Operation '${operationId}' timed out after ${elapsed}ms (limit: ${timeout}ms)`);
    this.operationId = operationId;
    this.timeout = timeout;
    this.elapsed = elapsed;
    this.name = "TimeoutError";
  }
};
var TimeoutManager = class extends EventEmitter11 {
  config;
  activeContexts = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = TimeoutConfigSchema.parse(config);
  }
  // ============================================================================
  // Public API
  // ============================================================================
  /**
   * Execute a function with timeout
   */
  async execute(fn, options) {
    const operationId = options?.operationId ?? randomUUID7();
    const context = this.createContext(operationId, options?.timeout, options?.parentContext);
    this.activeContexts.set(operationId, context);
    this.emit("started", operationId, context.timeout);
    const abortController = new AbortController();
    context.abortController = abortController;
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        abortController.abort();
        const elapsed = Date.now() - context.startTime.getTime();
        this.emit("timedOut", operationId);
        reject(new TimeoutError(operationId, context.timeout, elapsed));
      }, context.timeout);
      abortController.signal.addEventListener("abort", () => {
        clearTimeout(timer);
      });
    });
    try {
      const result = await Promise.race([fn(abortController.signal), timeoutPromise]);
      const elapsed = Date.now() - context.startTime.getTime();
      this.emit("completed", operationId, elapsed);
      return result;
    } finally {
      this.activeContexts.delete(operationId);
    }
  }
  /**
   * Execute with child context (inherits parent timeout budget)
   */
  async executeChild(parentContext, fn, options) {
    const remaining = this.getRemainingTime(parentContext);
    if (remaining <= 0) {
      throw new TimeoutError(
        options?.operationId ?? "child",
        0,
        parentContext.timeout
      );
    }
    let childTimeout = remaining;
    if (this.config.cascadingBudget) {
      const reserve = remaining * (this.config.budgetReservePercent / 100);
      childTimeout = remaining - reserve;
    }
    if (options?.maxTimeout) {
      childTimeout = Math.min(childTimeout, options.maxTimeout);
    }
    return this.execute(fn, {
      operationId: options?.operationId,
      timeout: childTimeout,
      parentContext
    });
  }
  /**
   * Create a timeout context without executing
   */
  createContext(operationId, timeout, parent) {
    const now = /* @__PURE__ */ new Date();
    let effectiveTimeout = timeout ?? this.getTimeout(operationId);
    if (parent) {
      const remaining = this.getRemainingTime(parent);
      effectiveTimeout = Math.min(effectiveTimeout, remaining);
    }
    return {
      operationId,
      parentId: parent?.operationId,
      timeout: effectiveTimeout,
      startTime: now,
      deadline: new Date(now.getTime() + effectiveTimeout),
      remainingMs: effectiveTimeout
    };
  }
  /**
   * Get remaining time for a context
   */
  getRemainingTime(context) {
    const elapsed = Date.now() - context.startTime.getTime();
    return Math.max(0, context.timeout - elapsed);
  }
  /**
   * Check if context has timed out
   */
  hasTimedOut(context) {
    return this.getRemainingTime(context) <= 0;
  }
  /**
   * Cancel an active operation
   */
  cancel(operationId) {
    const context = this.activeContexts.get(operationId);
    if (context?.abortController) {
      context.abortController.abort();
      this.activeContexts.delete(operationId);
      this.emit("cancelled", operationId);
      return true;
    }
    return false;
  }
  /**
   * Get timeout for an operation
   */
  getTimeout(operationId) {
    if (this.config.operationTimeouts?.[operationId]) {
      return this.config.operationTimeouts[operationId];
    }
    return this.config.defaultTimeout;
  }
  /**
   * Set timeout for an operation
   */
  setTimeout(operationId, timeout) {
    if (!this.config.operationTimeouts) {
      this.config.operationTimeouts = {};
    }
    this.config.operationTimeouts[operationId] = timeout;
  }
  /**
   * Get all active contexts
   */
  getActiveContexts() {
    return Array.from(this.activeContexts.values());
  }
  /**
   * Get results for completed/timed out operations
   */
  getResult(context) {
    const elapsed = Date.now() - context.startTime.getTime();
    return {
      operationId: context.operationId,
      timedOut: elapsed >= context.timeout,
      elapsedMs: elapsed,
      remainingMs: Math.max(0, context.timeout - elapsed)
    };
  }
  /**
   * Wrap a function with timeout
   */
  wrap(fn, options) {
    return async (...args) => {
      return this.execute(
        (signal) => fn(signal, ...args),
        options
      );
    };
  }
  /**
   * Create a deadline from duration
   */
  createDeadline(ms) {
    return new Date(Date.now() + ms);
  }
  /**
   * Check if deadline has passed
   */
  isDeadlinePassed(deadline) {
    return Date.now() >= deadline.getTime();
  }
  /**
   * Get summary of timeout manager
   */
  getSummary() {
    return {
      activeOperations: this.activeContexts.size,
      defaultTimeout: this.config.defaultTimeout,
      customTimeouts: Object.keys(this.config.operationTimeouts || {}).length
    };
  }
};
async function withTimeout(fn, timeout, operationId) {
  const manager = new TimeoutManager({ defaultTimeout: timeout });
  return manager.execute(fn, { operationId });
}
async function raceWithTimeout(promises, timeout) {
  const abortController = new AbortController();
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      abortController.abort();
      reject(new TimeoutError("race", timeout, timeout));
    }, timeout);
    abortController.signal.addEventListener("abort", () => {
      clearTimeout(timer);
    });
  });
  try {
    return await Promise.race([...promises, timeoutPromise]);
  } finally {
    abortController.abort();
  }
}
var timeoutManagerInstance = null;
function getTimeoutManager(config) {
  if (!timeoutManagerInstance) {
    timeoutManagerInstance = new TimeoutManager(config);
  }
  return timeoutManagerInstance;
}
function createTimeoutManager(config) {
  return new TimeoutManager(config);
}
var TIMEOUT_PRESETS = {
  fast: 5e3,
  // 5s - cache, local ops
  normal: 3e4,
  // 30s - most API calls
  slow: 12e4,
  // 2min - file operations, AI calls
  veryLong: 6e5
  // 10min - batch processing
};

// src/reliability/health-aggregator.ts
import { EventEmitter as EventEmitter12 } from "eventemitter3";
var HealthCheckError = class extends Error {
  constructor(service, checkType, message) {
    super(`Health check failed for ${service} (${checkType}): ${message}`);
    this.service = service;
    this.checkType = checkType;
    this.name = "HealthCheckError";
  }
};
var HealthAggregator = class extends EventEmitter12 {
  config;
  services = /* @__PURE__ */ new Map();
  dependencies = /* @__PURE__ */ new Map();
  history = [];
  consecutiveFailures = /* @__PURE__ */ new Map();
  consecutiveSuccesses = /* @__PURE__ */ new Map();
  checkInterval = null;
  startTime;
  currentStatus = "unknown";
  constructor(config = {}) {
    super();
    this.config = HealthAggregatorConfigSchema.parse(config);
    this.startTime = /* @__PURE__ */ new Date();
    if (this.config.dependencies) {
      for (const dep of this.config.dependencies) {
        this.registerDependency(dep);
      }
    }
  }
  // ============================================================================
  // Public API
  // ============================================================================
  /**
   * Start periodic health checks
   */
  start() {
    if (this.checkInterval) {
      return;
    }
    this.runChecks();
    this.checkInterval = setInterval(() => {
      this.runChecks();
    }, this.config.checkInterval);
  }
  /**
   * Stop periodic health checks
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  /**
   * Register a service health check
   */
  registerService(name, checkFn, options) {
    this.services.set(name, {
      name,
      status: "unknown",
      lastCheck: /* @__PURE__ */ new Date()
    });
    if (checkFn) {
      this.services.get(name).checkFn = checkFn;
      this.services.get(name).timeout = options?.timeout ?? 5e3;
    }
  }
  /**
   * Register a dependency
   */
  registerDependency(dependency) {
    this.dependencies.set(dependency.name, {
      name: dependency.name,
      status: "unknown",
      lastCheck: /* @__PURE__ */ new Date(),
      metadata: {
        type: dependency.type,
        weight: dependency.weight,
        timeout: dependency.timeout
      }
    });
    if (dependency.checkFn) {
      this.dependencies.get(dependency.name).checkFn = dependency.checkFn;
    }
  }
  /**
   * Update service health manually
   */
  updateServiceHealth(name, status, options) {
    const service = this.services.get(name);
    const oldStatus = service?.status;
    const newHealth = {
      name,
      status,
      latency: options?.latency,
      lastCheck: /* @__PURE__ */ new Date(),
      message: options?.message,
      metadata: options?.metadata
    };
    this.services.set(name, newHealth);
    if (oldStatus !== status) {
      this.emit("serviceHealthChanged", name, status);
    }
    this.calculateOverallHealth();
  }
  /**
   * Get aggregated health
   */
  getHealth() {
    return {
      status: this.currentStatus,
      services: Array.from(this.services.values()),
      dependencies: Array.from(this.dependencies.values()),
      uptime: Date.now() - this.startTime.getTime(),
      lastUpdated: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Get health for a specific type
   */
  async checkHealth(type = "liveness") {
    switch (type) {
      case "liveness":
        return {
          status: "healthy",
          services: [],
          dependencies: [],
          uptime: Date.now() - this.startTime.getTime(),
          lastUpdated: /* @__PURE__ */ new Date()
        };
      case "readiness":
        await this.checkRequiredDependencies();
        return this.getHealth();
      case "startup":
        await this.runChecks();
        return this.getHealth();
      case "deep":
        await this.runChecks();
        return this.getHealth();
      default:
        return this.getHealth();
    }
  }
  /**
   * Get health history
   */
  getHistory(limit) {
    const entries = [...this.history];
    if (limit) {
      return entries.slice(-limit);
    }
    return entries;
  }
  /**
   * Check if system is healthy
   */
  isHealthy() {
    return this.currentStatus === "healthy";
  }
  /**
   * Check if system is at least degraded (not unhealthy)
   */
  isOperational() {
    return this.currentStatus === "healthy" || this.currentStatus === "degraded";
  }
  /**
   * Get uptime in milliseconds
   */
  getUptime() {
    return Date.now() - this.startTime.getTime();
  }
  /**
   * Get summary
   */
  getSummary() {
    const serviceStatuses = Array.from(this.services.values());
    const depStatuses = Array.from(this.dependencies.values());
    return {
      status: this.currentStatus,
      services: {
        total: serviceStatuses.length,
        healthy: serviceStatuses.filter((s) => s.status === "healthy").length,
        unhealthy: serviceStatuses.filter((s) => s.status === "unhealthy").length
      },
      dependencies: {
        total: depStatuses.length,
        healthy: depStatuses.filter((s) => s.status === "healthy").length,
        unhealthy: depStatuses.filter((s) => s.status === "unhealthy").length
      },
      uptime: this.getUptime()
    };
  }
  /**
   * Dispose
   */
  dispose() {
    this.stop();
    this.services.clear();
    this.dependencies.clear();
    this.history = [];
    this.removeAllListeners();
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  async runChecks() {
    try {
      await Promise.all(
        Array.from(this.services.entries()).map(async ([name, service]) => {
          await this.checkService(name, service);
        })
      );
      await Promise.all(
        Array.from(this.dependencies.entries()).map(async ([name, dep]) => {
          await this.checkDependency(name, dep);
        })
      );
      this.calculateOverallHealth();
      this.recordHistory();
      this.emit("checkCompleted", this.getHealth());
    } catch (error) {
      this.emit("checkFailed", error instanceof Error ? error : new Error(String(error)));
    }
  }
  async checkService(name, service) {
    const checkFn = service.checkFn;
    const timeout = service.timeout ?? 5e3;
    if (!checkFn) {
      return;
    }
    const startTime = Date.now();
    try {
      const result = await this.withTimeout(checkFn(), timeout);
      const latency = Date.now() - startTime;
      if (result) {
        this.recordSuccess(name, "service", latency);
      } else {
        this.recordFailure(name, "service", "Check returned false");
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      this.recordFailure(
        name,
        "service",
        error instanceof Error ? error.message : "Unknown error",
        latency
      );
    }
  }
  async checkDependency(name, dep) {
    const checkFn = dep.checkFn;
    const timeout = dep.metadata?.timeout ?? 5e3;
    if (!checkFn) {
      return;
    }
    const startTime = Date.now();
    try {
      const result = await this.withTimeout(checkFn(), timeout);
      const latency = Date.now() - startTime;
      if (result) {
        this.recordSuccess(name, "dependency", latency);
      } else {
        this.recordFailure(name, "dependency", "Check returned false");
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      this.recordFailure(
        name,
        "dependency",
        error instanceof Error ? error.message : "Unknown error",
        latency
      );
    }
  }
  async checkRequiredDependencies() {
    const required = Array.from(this.dependencies.entries()).filter(
      ([, dep]) => dep.metadata?.type === "required"
    );
    await Promise.all(
      required.map(async ([name, dep]) => {
        await this.checkDependency(name, dep);
      })
    );
  }
  recordSuccess(name, type, latency) {
    const map = type === "service" ? this.services : this.dependencies;
    const existing = map.get(name);
    const failures = this.consecutiveFailures.get(name) ?? 0;
    const successes = (this.consecutiveSuccesses.get(name) ?? 0) + 1;
    this.consecutiveSuccesses.set(name, successes);
    this.consecutiveFailures.set(name, 0);
    let newStatus = existing?.status ?? "unknown";
    if (successes >= this.config.healthyThreshold) {
      newStatus = "healthy";
    } else if (failures > 0) {
      newStatus = "degraded";
    }
    const oldStatus = existing?.status;
    const newHealth = {
      ...existing,
      name,
      status: newStatus,
      latency,
      lastCheck: /* @__PURE__ */ new Date(),
      message: void 0
    };
    map.set(name, newHealth);
    if (oldStatus !== newStatus) {
      this.emit("serviceHealthChanged", name, newStatus);
    }
  }
  recordFailure(name, type, message, latency) {
    const map = type === "service" ? this.services : this.dependencies;
    const existing = map.get(name);
    const failures = (this.consecutiveFailures.get(name) ?? 0) + 1;
    this.consecutiveFailures.set(name, failures);
    this.consecutiveSuccesses.set(name, 0);
    let newStatus = existing?.status ?? "unknown";
    if (failures >= this.config.unhealthyThreshold) {
      newStatus = "unhealthy";
    } else {
      newStatus = "degraded";
    }
    const oldStatus = existing?.status;
    const newHealth = {
      ...existing,
      name,
      status: newStatus,
      latency,
      lastCheck: /* @__PURE__ */ new Date(),
      message
    };
    map.set(name, newHealth);
    if (oldStatus !== newStatus) {
      this.emit("serviceHealthChanged", name, newStatus);
    }
  }
  calculateOverallHealth() {
    const oldStatus = this.currentStatus;
    const allHealth = [];
    for (const service of this.services.values()) {
      allHealth.push({
        status: service.status,
        weight: 1,
        required: false
      });
    }
    for (const dep of this.dependencies.values()) {
      allHealth.push({
        status: dep.status,
        weight: dep.metadata?.weight ?? 1,
        required: dep.metadata?.type === "required"
      });
    }
    if (allHealth.length === 0) {
      this.currentStatus = "healthy";
      return;
    }
    const requiredUnhealthy = allHealth.filter(
      (h) => h.required && h.status === "unhealthy"
    );
    if (requiredUnhealthy.length > 0) {
      this.currentStatus = "unhealthy";
    } else {
      let totalWeight = 0;
      let healthyWeight = 0;
      let degradedWeight = 0;
      for (const h of allHealth) {
        totalWeight += h.weight;
        if (h.status === "healthy") {
          healthyWeight += h.weight;
        } else if (h.status === "degraded") {
          degradedWeight += h.weight;
        }
      }
      const healthScore = (healthyWeight + degradedWeight * 0.5) / totalWeight;
      if (healthScore >= 0.9) {
        this.currentStatus = "healthy";
      } else if (healthScore >= 0.5) {
        this.currentStatus = "degraded";
      } else {
        this.currentStatus = "unhealthy";
      }
    }
    if (oldStatus !== this.currentStatus) {
      this.emit("statusChanged", oldStatus, this.currentStatus);
    }
  }
  recordHistory() {
    const entry = {
      timestamp: /* @__PURE__ */ new Date(),
      status: this.currentStatus,
      services: {}
    };
    for (const [name, service] of this.services) {
      entry.services[name] = service.status;
    }
    for (const [name, dep] of this.dependencies) {
      entry.services[`dep:${name}`] = dep.status;
    }
    this.history.push(entry);
    if (this.history.length > this.config.historySize) {
      this.history = this.history.slice(-this.config.historySize);
    }
  }
  async withTimeout(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), timeout);
      })
    ]);
  }
};
var healthAggregatorInstance = null;
function getHealthAggregator(config) {
  if (!healthAggregatorInstance) {
    healthAggregatorInstance = new HealthAggregator(config);
  }
  return healthAggregatorInstance;
}
function createHealthAggregator(config) {
  return new HealthAggregator(config);
}

// src/secrets/types.ts
import { z as z11 } from "zod";
var SecretProviderSchema = z11.enum([
  "env",
  "vault",
  "aws",
  "azure",
  "gcp",
  "memory"
]);
var SecretTypeSchema = z11.enum([
  "string",
  "json",
  "certificate",
  "key_pair",
  "api_key",
  "connection_string"
]);
var SecretMetadataSchema = z11.object({
  type: SecretTypeSchema.default("string"),
  version: z11.number().default(1),
  createdAt: z11.date(),
  updatedAt: z11.date(),
  expiresAt: z11.date().optional(),
  rotatedAt: z11.date().optional(),
  provider: SecretProviderSchema,
  path: z11.string(),
  tags: z11.record(z11.string()).optional()
});
var SecretValueSchema = z11.object({
  name: z11.string(),
  value: z11.string(),
  metadata: SecretMetadataSchema
});
var EnvProviderConfigSchema = z11.object({
  provider: z11.literal("env"),
  prefix: z11.string().optional(),
  transform: z11.enum(["none", "uppercase", "lowercase"]).default("uppercase")
});
var VaultProviderConfigSchema = z11.object({
  provider: z11.literal("vault"),
  address: z11.string().url(),
  token: z11.string().optional(),
  roleId: z11.string().optional(),
  secretId: z11.string().optional(),
  namespace: z11.string().optional(),
  mountPath: z11.string().default("secret"),
  engineVersion: z11.enum(["v1", "v2"]).default("v2"),
  tlsSkipVerify: z11.boolean().default(false),
  renewLease: z11.boolean().default(true)
});
var AWSProviderConfigSchema = z11.object({
  provider: z11.literal("aws"),
  region: z11.string(),
  accessKeyId: z11.string().optional(),
  secretAccessKey: z11.string().optional(),
  sessionToken: z11.string().optional(),
  profile: z11.string().optional(),
  roleArn: z11.string().optional()
});
var AzureProviderConfigSchema = z11.object({
  provider: z11.literal("azure"),
  vaultUrl: z11.string().url(),
  clientId: z11.string().optional(),
  clientSecret: z11.string().optional(),
  tenantId: z11.string().optional(),
  useManagedIdentity: z11.boolean().default(false)
});
var GCPProviderConfigSchema = z11.object({
  provider: z11.literal("gcp"),
  projectId: z11.string(),
  credentials: z11.string().optional(),
  // JSON credentials
  useDefaultCredentials: z11.boolean().default(true)
});
var MemoryProviderConfigSchema = z11.object({
  provider: z11.literal("memory"),
  encrypted: z11.boolean().default(false),
  encryptionKey: z11.string().optional()
});
var ProviderConfigSchema2 = z11.discriminatedUnion("provider", [
  EnvProviderConfigSchema,
  VaultProviderConfigSchema,
  AWSProviderConfigSchema,
  AzureProviderConfigSchema,
  GCPProviderConfigSchema,
  MemoryProviderConfigSchema
]);
var RotationStrategySchema = z11.enum([
  "manual",
  "scheduled",
  "on_expiry",
  "on_access_count"
]);
var RotationConfigSchema = z11.object({
  enabled: z11.boolean().default(false),
  strategy: RotationStrategySchema.default("manual"),
  intervalDays: z11.number().optional(),
  maxAccessCount: z11.number().optional(),
  notifyBeforeDays: z11.number().default(7),
  autoRotate: z11.boolean().default(false),
  rotationFunction: z11.string().optional()
  // Function name to call for rotation
});
var SecretAccessSchema = z11.object({
  secretName: z11.string(),
  accessor: z11.string(),
  // User/service identifier
  action: z11.enum(["read", "write", "delete", "rotate"]),
  timestamp: z11.date(),
  allowed: z11.boolean(),
  reason: z11.string().optional()
});
var SecretPolicySchema = z11.object({
  name: z11.string(),
  pattern: z11.string(),
  // Glob pattern for secret names
  allowedAccessors: z11.array(z11.string()).optional(),
  deniedAccessors: z11.array(z11.string()).optional(),
  permissions: z11.array(z11.enum(["read", "write", "delete", "rotate"])),
  conditions: z11.object({
    timeWindow: z11.object({
      start: z11.string(),
      // HH:mm
      end: z11.string(),
      timezone: z11.string()
    }).optional(),
    ipWhitelist: z11.array(z11.string()).optional(),
    requireMfa: z11.boolean().optional()
  }).optional()
});
var SecretLeaseSchema = z11.object({
  id: z11.string(),
  secretName: z11.string(),
  duration: z11.number(),
  // Seconds
  renewable: z11.boolean(),
  createdAt: z11.date(),
  expiresAt: z11.date(),
  renewedAt: z11.date().optional(),
  renewCount: z11.number().default(0),
  maxRenewals: z11.number().optional()
});
var SecretsManagerConfigSchema = z11.object({
  providers: z11.array(ProviderConfigSchema2).min(1),
  defaultProvider: SecretProviderSchema.default("env"),
  cacheEnabled: z11.boolean().default(true),
  cacheTTL: z11.number().default(3e5),
  // 5 minutes
  auditEnabled: z11.boolean().default(true),
  encryptionAtRest: z11.boolean().default(false),
  encryptionKey: z11.string().optional(),
  rotationConfig: RotationConfigSchema.optional(),
  policies: z11.array(SecretPolicySchema).optional()
});
var SecretReferenceSchema = z11.object({
  name: z11.string(),
  provider: SecretProviderSchema.optional(),
  version: z11.number().optional(),
  key: z11.string().optional()
  // For JSON secrets, specific key to extract
});
var SECRET_REFERENCE_PATTERN = /\$\{secret:([a-zA-Z0-9_\-\/]+)(#[a-zA-Z0-9_\-\.]+)?\}/g;
var EncryptedSecretSchema = z11.object({
  algorithm: z11.string().default("aes-256-gcm"),
  iv: z11.string(),
  // Base64 encoded
  ciphertext: z11.string(),
  // Base64 encoded
  authTag: z11.string().optional(),
  // For GCM mode
  keyId: z11.string().optional()
  // Key identifier for rotation
});

// src/secrets/secrets-manager.ts
import { EventEmitter as EventEmitter13 } from "eventemitter3";
import { randomUUID as randomUUID8, createCipheriv, createDecipheriv, randomBytes } from "crypto";
var SecretsError = class extends Error {
  constructor(message, code, secretName, provider) {
    super(message);
    this.code = code;
    this.secretName = secretName;
    this.provider = provider;
    this.name = "SecretsError";
  }
};
var EnvProvider = class {
  name = "env";
  prefix;
  transform;
  constructor(config) {
    this.prefix = config.prefix ?? "";
    this.transform = config.transform ?? "uppercase";
  }
  async connect() {
  }
  async disconnect() {
  }
  async get(name) {
    const key = this.transformKey(name);
    return process.env[key];
  }
  async set(name, value) {
    const key = this.transformKey(name);
    process.env[key] = value;
  }
  async delete(name) {
    const key = this.transformKey(name);
    delete process.env[key];
  }
  async list(prefix) {
    const fullPrefix = this.prefix + (prefix ?? "");
    return Object.keys(process.env).filter((key) => key.startsWith(fullPrefix)).map((key) => key.slice(this.prefix.length));
  }
  async exists(name) {
    const key = this.transformKey(name);
    return key in process.env;
  }
  transformKey(name) {
    let key = this.prefix + name.replace(/[.\-\/]/g, "_");
    switch (this.transform) {
      case "uppercase":
        return key.toUpperCase();
      case "lowercase":
        return key.toLowerCase();
      default:
        return key;
    }
  }
};
var MemoryProvider = class {
  name = "memory";
  secrets = /* @__PURE__ */ new Map();
  encrypted;
  encryptionKey;
  constructor(config) {
    this.encrypted = config.encrypted ?? false;
    if (config.encryptionKey) {
      this.encryptionKey = Buffer.from(config.encryptionKey, "base64");
    }
  }
  async connect() {
  }
  async disconnect() {
    this.secrets.clear();
  }
  async get(name) {
    const value = this.secrets.get(name);
    if (!value) return void 0;
    if (this.encrypted && this.encryptionKey) {
      return this.decrypt(value);
    }
    return value;
  }
  async set(name, value) {
    if (this.encrypted && this.encryptionKey) {
      this.secrets.set(name, this.encrypt(value));
    } else {
      this.secrets.set(name, value);
    }
  }
  async delete(name) {
    this.secrets.delete(name);
  }
  async list(prefix) {
    const keys = Array.from(this.secrets.keys());
    if (prefix) {
      return keys.filter((k) => k.startsWith(prefix));
    }
    return keys;
  }
  async exists(name) {
    return this.secrets.has(name);
  }
  encrypt(value) {
    if (!this.encryptionKey) throw new Error("No encryption key");
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-gcm", this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return JSON.stringify({
      iv: iv.toString("base64"),
      ciphertext: encrypted.toString("base64"),
      authTag: authTag.toString("base64")
    });
  }
  decrypt(encryptedData) {
    if (!this.encryptionKey) throw new Error("No encryption key");
    const { iv, ciphertext, authTag } = JSON.parse(encryptedData);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.encryptionKey,
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64")),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  }
};
var SecretsManager = class extends EventEmitter13 {
  config;
  providers = /* @__PURE__ */ new Map();
  cache = /* @__PURE__ */ new Map();
  leases = /* @__PURE__ */ new Map();
  accessLog = [];
  versions = /* @__PURE__ */ new Map();
  constructor(config) {
    super();
    this.config = SecretsManagerConfigSchema.parse(config);
    this.initializeProviders();
  }
  // ============================================================================
  // Public API
  // ============================================================================
  /**
   * Get a secret value
   */
  async get(name, options) {
    const provider = options?.provider ?? this.config.defaultProvider;
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(`${provider}:${name}`);
      if (cached && cached.expiresAt > Date.now()) {
        this.logAccess(name, "system", "read", true);
        this.emit("secretAccessed", name, "system");
        return cached.value;
      }
    }
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new SecretsError(
        `Provider not configured: ${provider}`,
        "PROVIDER_NOT_FOUND",
        name,
        provider
      );
    }
    const value = await providerInstance.get(name, options?.version);
    if (value === void 0) {
      throw new SecretsError(
        `Secret not found: ${name}`,
        "SECRET_NOT_FOUND",
        name,
        provider
      );
    }
    if (this.config.cacheEnabled) {
      this.cache.set(`${provider}:${name}`, {
        value,
        expiresAt: Date.now() + this.config.cacheTTL
      });
    }
    this.logAccess(name, "system", "read", true);
    this.emit("secretAccessed", name, "system");
    return value;
  }
  /**
   * Get a secret with type coercion
   */
  async getTyped(name, parser, options) {
    const value = await this.get(name, options);
    return parser(value);
  }
  /**
   * Get a JSON secret
   */
  async getJSON(name, options) {
    const value = await this.get(name, options);
    const parsed = JSON.parse(value);
    if (options?.key) {
      const keys = options.key.split(".");
      let result = parsed;
      for (const k of keys) {
        result = result?.[k];
      }
      return result;
    }
    return parsed;
  }
  /**
   * Set a secret value
   */
  async set(name, value, options) {
    const provider = options?.provider ?? this.config.defaultProvider;
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new SecretsError(
        `Provider not configured: ${provider}`,
        "PROVIDER_NOT_FOUND",
        name,
        provider
      );
    }
    const exists = await providerInstance.exists(name);
    await providerInstance.set(name, value);
    const currentVersion = this.versions.get(name) ?? 0;
    this.versions.set(name, currentVersion + 1);
    this.cache.delete(`${provider}:${name}`);
    this.logAccess(name, "system", "write", true);
    if (exists) {
      this.emit("secretUpdated", name, currentVersion + 1);
    } else {
      this.emit("secretCreated", name);
    }
  }
  /**
   * Delete a secret
   */
  async delete(name, options) {
    const provider = options?.provider ?? this.config.defaultProvider;
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new SecretsError(
        `Provider not configured: ${provider}`,
        "PROVIDER_NOT_FOUND",
        name,
        provider
      );
    }
    await providerInstance.delete(name);
    this.cache.delete(`${provider}:${name}`);
    this.logAccess(name, "system", "delete", true);
    this.emit("secretDeleted", name);
  }
  /**
   * Check if a secret exists
   */
  async exists(name, options) {
    const provider = options?.provider ?? this.config.defaultProvider;
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      return false;
    }
    return providerInstance.exists(name);
  }
  /**
   * List secrets
   */
  async list(options) {
    const provider = options?.provider ?? this.config.defaultProvider;
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      return [];
    }
    return providerInstance.list(options?.prefix);
  }
  /**
   * Resolve secret references in a string
   * Format: ${secret:name} or ${secret:provider/name} or ${secret:name#key}
   */
  async resolveReferences(template) {
    let result = template;
    let match;
    SECRET_REFERENCE_PATTERN.lastIndex = 0;
    while ((match = SECRET_REFERENCE_PATTERN.exec(template)) !== null) {
      const [fullMatch, path, keyPart] = match;
      const key = keyPart?.slice(1);
      let provider;
      let name;
      if (path.includes("/")) {
        [provider, name] = path.split("/");
      } else {
        name = path;
      }
      try {
        let value;
        if (key) {
          value = await this.getJSON(name, { provider, key });
        } else {
          value = await this.get(name, { provider });
        }
        result = result.replace(fullMatch, value);
      } catch {
      }
    }
    return result;
  }
  /**
   * Rotate a secret
   */
  async rotate(name, newValue, options) {
    const provider = options?.provider ?? this.config.defaultProvider;
    await this.set(name, newValue, { provider });
    const newVersion = this.versions.get(name) ?? 1;
    this.emit("secretRotated", name, newVersion);
    return newVersion;
  }
  /**
   * Create a lease for a secret
   */
  createLease(secretName, options) {
    const now = /* @__PURE__ */ new Date();
    const duration = options?.duration ?? 3600;
    const lease = {
      id: randomUUID8(),
      secretName,
      duration,
      renewable: options?.renewable ?? true,
      createdAt: now,
      expiresAt: new Date(now.getTime() + duration * 1e3),
      renewCount: 0,
      maxRenewals: options?.maxRenewals
    };
    this.leases.set(lease.id, lease);
    this.emit("leaseCreated", lease);
    return lease;
  }
  /**
   * Renew a lease
   */
  renewLease(leaseId) {
    const lease = this.leases.get(leaseId);
    if (!lease) {
      throw new SecretsError("Lease not found", "LEASE_NOT_FOUND");
    }
    if (!lease.renewable) {
      throw new SecretsError("Lease is not renewable", "LEASE_NOT_RENEWABLE");
    }
    if (lease.maxRenewals && lease.renewCount >= lease.maxRenewals) {
      throw new SecretsError("Max renewals reached", "MAX_RENEWALS_REACHED");
    }
    const now = /* @__PURE__ */ new Date();
    lease.renewedAt = now;
    lease.expiresAt = new Date(now.getTime() + lease.duration * 1e3);
    lease.renewCount++;
    this.leases.set(leaseId, lease);
    this.emit("leaseRenewed", lease);
    return lease;
  }
  /**
   * Revoke a lease
   */
  revokeLease(leaseId) {
    const lease = this.leases.get(leaseId);
    if (!lease) {
      return false;
    }
    this.leases.delete(leaseId);
    this.emit("leaseExpired", lease);
    return true;
  }
  /**
   * Get active leases
   */
  getActiveLeases() {
    const now = Date.now();
    return Array.from(this.leases.values()).filter(
      (lease) => lease.expiresAt.getTime() > now
    );
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * Get access log
   */
  getAccessLog(options) {
    let log = [...this.accessLog];
    if (options?.secretName) {
      log = log.filter((a) => a.secretName === options.secretName);
    }
    if (options?.limit) {
      log = log.slice(-options.limit);
    }
    return log;
  }
  /**
   * Register a custom provider
   */
  registerProvider(provider) {
    this.providers.set(provider.name, provider);
    this.emit("providerConnected", provider.name);
  }
  /**
   * Get summary
   */
  getSummary() {
    return {
      providers: Array.from(this.providers.keys()),
      cacheSize: this.cache.size,
      activeLeases: this.getActiveLeases().length,
      accessLogSize: this.accessLog.length
    };
  }
  /**
   * Dispose
   */
  async dispose() {
    for (const provider of this.providers.values()) {
      try {
        await provider.disconnect();
      } catch {
      }
    }
    this.providers.clear();
    this.cache.clear();
    this.leases.clear();
    this.removeAllListeners();
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  initializeProviders() {
    for (const providerConfig of this.config.providers) {
      const provider = this.createProvider(providerConfig);
      this.providers.set(provider.name, provider);
    }
  }
  createProvider(config) {
    switch (config.provider) {
      case "env":
        return new EnvProvider({
          prefix: config.prefix,
          transform: config.transform
        });
      case "memory":
        return new MemoryProvider({
          encrypted: config.encrypted,
          encryptionKey: config.encryptionKey
        });
      case "vault":
      case "aws":
      case "azure":
      case "gcp":
        return {
          name: config.provider,
          connect: async () => {
          },
          disconnect: async () => {
          },
          get: async () => {
            throw new SecretsError(
              `Provider ${config.provider} not implemented`,
              "PROVIDER_NOT_IMPLEMENTED"
            );
          },
          set: async () => {
            throw new SecretsError(
              `Provider ${config.provider} not implemented`,
              "PROVIDER_NOT_IMPLEMENTED"
            );
          },
          delete: async () => {
            throw new SecretsError(
              `Provider ${config.provider} not implemented`,
              "PROVIDER_NOT_IMPLEMENTED"
            );
          },
          list: async () => [],
          exists: async () => false
        };
      default:
        throw new SecretsError(`Unknown provider: ${config.provider}`, "UNKNOWN_PROVIDER");
    }
  }
  logAccess(secretName, accessor, action, allowed, reason) {
    if (!this.config.auditEnabled) {
      return;
    }
    const access = {
      secretName,
      accessor,
      action,
      timestamp: /* @__PURE__ */ new Date(),
      allowed,
      reason
    };
    this.accessLog.push(access);
    if (this.accessLog.length > 1e4) {
      this.accessLog = this.accessLog.slice(-5e3);
    }
    if (!allowed) {
      this.emit("accessDenied", access);
    }
  }
};
var secretsManagerInstance = null;
function getSecretsManager(config) {
  if (!secretsManagerInstance) {
    secretsManagerInstance = new SecretsManager(
      config ?? { providers: [{ provider: "env" }] }
    );
  }
  return secretsManagerInstance;
}
function createSecretsManager(config) {
  return new SecretsManager(config);
}

// src/ratelimit/types.ts
import { z as z12 } from "zod";
var RateLimitAlgorithmSchema = z12.enum([
  "token_bucket",
  "sliding_window",
  "fixed_window",
  "leaky_bucket"
]);
var TokenBucketConfigSchema = z12.object({
  algorithm: z12.literal("token_bucket"),
  capacity: z12.number().min(1).describe("Maximum tokens in bucket"),
  refillRate: z12.number().min(0).describe("Tokens added per interval"),
  refillIntervalMs: z12.number().min(1).default(1e3).describe("Refill interval")
});
var SlidingWindowConfigSchema = z12.object({
  algorithm: z12.literal("sliding_window"),
  windowMs: z12.number().min(1).describe("Window duration in ms"),
  maxRequests: z12.number().min(1).describe("Max requests per window"),
  precision: z12.number().min(1).default(10).describe("Number of sub-windows")
});
var FixedWindowConfigSchema = z12.object({
  algorithm: z12.literal("fixed_window"),
  windowMs: z12.number().min(1).describe("Window duration in ms"),
  maxRequests: z12.number().min(1).describe("Max requests per window")
});
var LeakyBucketConfigSchema = z12.object({
  algorithm: z12.literal("leaky_bucket"),
  capacity: z12.number().min(1).describe("Bucket capacity"),
  leakRate: z12.number().min(0).describe("Requests leaked per interval"),
  leakIntervalMs: z12.number().min(1).default(1e3).describe("Leak interval")
});
var AlgorithmConfigSchema = z12.discriminatedUnion("algorithm", [
  TokenBucketConfigSchema,
  SlidingWindowConfigSchema,
  FixedWindowConfigSchema,
  LeakyBucketConfigSchema
]);
var RateLimitRuleSchema = z12.object({
  id: z12.string(),
  name: z12.string(),
  description: z12.string().optional(),
  enabled: z12.boolean().default(true),
  priority: z12.number().default(0).describe("Higher = evaluated first"),
  match: z12.object({
    path: z12.string().optional().describe("Path pattern (glob)"),
    method: z12.array(z12.string()).optional(),
    headers: z12.record(z12.string()).optional(),
    clientId: z12.string().optional(),
    tags: z12.array(z12.string()).optional()
  }),
  config: AlgorithmConfigSchema,
  actions: z12.object({
    onLimit: z12.enum(["reject", "queue", "throttle"]).default("reject"),
    retryAfterMs: z12.number().optional(),
    queueTimeoutMs: z12.number().optional(),
    customResponse: z12.object({
      statusCode: z12.number().default(429),
      message: z12.string().default("Too many requests"),
      headers: z12.record(z12.string()).optional()
    }).optional()
  })
});
var RateLimitResultSchema = z12.object({
  allowed: z12.boolean(),
  remaining: z12.number(),
  limit: z12.number(),
  resetMs: z12.number().describe("Ms until limit resets"),
  retryAfterMs: z12.number().optional(),
  rule: z12.string().optional().describe("Matched rule ID"),
  queuePosition: z12.number().optional()
});
var RateLimitRequestSchema = z12.object({
  key: z12.string().describe("Unique identifier for rate limiting"),
  path: z12.string().optional(),
  method: z12.string().optional(),
  headers: z12.record(z12.string()).optional(),
  clientId: z12.string().optional(),
  tags: z12.array(z12.string()).optional(),
  cost: z12.number().default(1).describe("Request cost (tokens consumed)"),
  timestamp: z12.number().optional()
});
var TokenBucketStateSchema = z12.object({
  algorithm: z12.literal("token_bucket"),
  tokens: z12.number(),
  lastRefill: z12.number()
});
var SlidingWindowStateSchema = z12.object({
  algorithm: z12.literal("sliding_window"),
  windows: z12.array(z12.object({
    start: z12.number(),
    count: z12.number()
  }))
});
var FixedWindowStateSchema = z12.object({
  algorithm: z12.literal("fixed_window"),
  windowStart: z12.number(),
  count: z12.number()
});
var LeakyBucketStateSchema = z12.object({
  algorithm: z12.literal("leaky_bucket"),
  level: z12.number(),
  lastLeak: z12.number()
});
var LimiterStateSchema = z12.discriminatedUnion("algorithm", [
  TokenBucketStateSchema,
  SlidingWindowStateSchema,
  FixedWindowStateSchema,
  LeakyBucketStateSchema
]);
var RateLimitStatsSchema = z12.object({
  key: z12.string(),
  rule: z12.string(),
  totalRequests: z12.number(),
  allowedRequests: z12.number(),
  rejectedRequests: z12.number(),
  queuedRequests: z12.number(),
  averageWaitMs: z12.number(),
  peakUsage: z12.number(),
  lastRequest: z12.number()
});
var RateLimiterConfigSchema = z12.object({
  defaultRule: AlgorithmConfigSchema.optional(),
  rules: z12.array(RateLimitRuleSchema).default([]),
  enableStats: z12.boolean().default(true),
  statsRetentionMs: z12.number().default(24 * 60 * 60 * 1e3),
  // 24 hours
  enableDistributed: z12.boolean().default(false),
  redis: z12.object({
    host: z12.string().default("localhost"),
    port: z12.number().default(6379),
    keyPrefix: z12.string().default("ratelimit:"),
    password: z12.string().optional()
  }).optional(),
  queueConfig: z12.object({
    maxSize: z12.number().default(1e3),
    defaultTimeoutMs: z12.number().default(3e4)
  }).optional()
});
var DistributedSyncSchema = z12.object({
  nodeId: z12.string(),
  timestamp: z12.number(),
  states: z12.record(LimiterStateSchema)
});

// src/ratelimit/rate-limiter.ts
import { EventEmitter as EventEmitter14 } from "eventemitter3";
var RateLimitExceededError = class extends Error {
  constructor(key, result) {
    super(`Rate limit exceeded for ${key}`);
    this.key = key;
    this.result = result;
    this.name = "RateLimitExceededError";
  }
};
var MemoryStorage = class {
  store = /* @__PURE__ */ new Map();
  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.state;
  }
  async set(key, state, ttlMs) {
    this.store.set(key, {
      state,
      expiresAt: ttlMs ? Date.now() + ttlMs : void 0
    });
  }
  async delete(key) {
    this.store.delete(key);
  }
  async increment(_key, _field, _amount) {
    return 0;
  }
  async getMulti(keys) {
    const result = /* @__PURE__ */ new Map();
    for (const key of keys) {
      const state = await this.get(key);
      if (state) result.set(key, state);
    }
    return result;
  }
  async setMulti(entries, ttlMs) {
    for (const [key, state] of entries) {
      await this.set(key, state, ttlMs);
    }
  }
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
};
var MemoryQueue = class {
  queues = /* @__PURE__ */ new Map();
  async enqueue(key, request) {
    if (!this.queues.has(key)) {
      this.queues.set(key, []);
    }
    const queue = this.queues.get(key);
    queue.push(request);
    return queue.length;
  }
  async dequeue(key) {
    const queue = this.queues.get(key);
    if (!queue || queue.length === 0) return null;
    return queue.shift();
  }
  async peek(key) {
    const queue = this.queues.get(key);
    if (!queue || queue.length === 0) return null;
    return queue[0];
  }
  async size(key) {
    return this.queues.get(key)?.length ?? 0;
  }
  async clear(key) {
    this.queues.delete(key);
  }
};
function processTokenBucket(state, config, cost, now) {
  if (!state) {
    state = {
      algorithm: "token_bucket",
      tokens: config.capacity,
      lastRefill: now
    };
  }
  const elapsed = now - state.lastRefill;
  const tokensToAdd = Math.floor(elapsed / config.refillIntervalMs) * config.refillRate;
  const newTokens = Math.min(config.capacity, state.tokens + tokensToAdd);
  const lastRefill = tokensToAdd > 0 ? now : state.lastRefill;
  const allowed = newTokens >= cost;
  const remaining = allowed ? newTokens - cost : newTokens;
  const tokensNeeded = config.capacity - remaining;
  const intervalsNeeded = Math.ceil(tokensNeeded / config.refillRate);
  const resetMs = intervalsNeeded * config.refillIntervalMs;
  return {
    newState: {
      algorithm: "token_bucket",
      tokens: allowed ? remaining : newTokens,
      lastRefill
    },
    result: {
      allowed,
      remaining: Math.floor(remaining),
      limit: config.capacity,
      resetMs,
      retryAfterMs: allowed ? void 0 : Math.ceil((cost - newTokens) / config.refillRate * config.refillIntervalMs)
    }
  };
}
function processSlidingWindow(state, config, cost, now) {
  const subWindowMs = config.windowMs / config.precision;
  if (!state) {
    state = {
      algorithm: "sliding_window",
      windows: []
    };
  }
  const windowStart = now - config.windowMs;
  const windows = state.windows.filter((w) => w.start >= windowStart);
  let currentCount = 0;
  for (const window of windows) {
    const age = now - window.start;
    const weight = 1 - age / config.windowMs;
    currentCount += window.count * weight;
  }
  const allowed = currentCount + cost <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - currentCount - (allowed ? cost : 0));
  if (allowed) {
    const currentSubWindow = Math.floor(now / subWindowMs) * subWindowMs;
    const existingWindow = windows.find((w) => w.start === currentSubWindow);
    if (existingWindow) {
      existingWindow.count += cost;
    } else {
      windows.push({ start: currentSubWindow, count: cost });
    }
  }
  const oldestWindow = windows.length > 0 ? Math.min(...windows.map((w) => w.start)) : now;
  const resetMs = Math.max(0, oldestWindow + config.windowMs - now);
  return {
    newState: {
      algorithm: "sliding_window",
      windows
    },
    result: {
      allowed,
      remaining: Math.floor(remaining),
      limit: config.maxRequests,
      resetMs,
      retryAfterMs: allowed ? void 0 : resetMs
    }
  };
}
function processFixedWindow(state, config, cost, now) {
  const currentWindow = Math.floor(now / config.windowMs) * config.windowMs;
  if (!state || state.windowStart !== currentWindow) {
    state = {
      algorithm: "fixed_window",
      windowStart: currentWindow,
      count: 0
    };
  }
  const allowed = state.count + cost <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - state.count - (allowed ? cost : 0));
  const resetMs = currentWindow + config.windowMs - now;
  return {
    newState: {
      algorithm: "fixed_window",
      windowStart: currentWindow,
      count: allowed ? state.count + cost : state.count
    },
    result: {
      allowed,
      remaining: Math.floor(remaining),
      limit: config.maxRequests,
      resetMs,
      retryAfterMs: allowed ? void 0 : resetMs
    }
  };
}
function processLeakyBucket(state, config, cost, now) {
  if (!state) {
    state = {
      algorithm: "leaky_bucket",
      level: 0,
      lastLeak: now
    };
  }
  const elapsed = now - state.lastLeak;
  const leaked = Math.floor(elapsed / config.leakIntervalMs) * config.leakRate;
  const newLevel = Math.max(0, state.level - leaked);
  const lastLeak = leaked > 0 ? now : state.lastLeak;
  const allowed = newLevel + cost <= config.capacity;
  const remaining = Math.max(0, config.capacity - newLevel - (allowed ? cost : 0));
  const intervalsToEmpty = Math.ceil(newLevel / config.leakRate);
  const resetMs = intervalsToEmpty * config.leakIntervalMs;
  return {
    newState: {
      algorithm: "leaky_bucket",
      level: allowed ? newLevel + cost : newLevel,
      lastLeak
    },
    result: {
      allowed,
      remaining: Math.floor(remaining),
      limit: config.capacity,
      resetMs,
      retryAfterMs: allowed ? void 0 : Math.ceil((newLevel + cost - config.capacity) / config.leakRate * config.leakIntervalMs)
    }
  };
}
var RateLimiter = class extends EventEmitter14 {
  config;
  storage;
  queue;
  stats = /* @__PURE__ */ new Map();
  cleanupInterval;
  constructor(config = {}) {
    super();
    this.config = RateLimiterConfigSchema.parse(config);
    this.storage = new MemoryStorage();
    this.queue = new MemoryQueue();
    this.cleanupInterval = setInterval(() => {
      if (this.storage instanceof MemoryStorage) {
        this.storage.cleanup();
      }
      this.cleanupStats();
    }, 6e4);
  }
  // ---------------------------------------------------------------------------
  // Core Methods
  // ---------------------------------------------------------------------------
  async check(request) {
    const now = request.timestamp ?? Date.now();
    const rule = this.findMatchingRule(request);
    const config = rule?.config ?? this.config.defaultRule;
    if (!config) {
      return {
        allowed: true,
        remaining: Infinity,
        limit: Infinity,
        resetMs: 0
      };
    }
    const stateKey = this.getStateKey(request.key, rule?.id);
    const currentState = await this.storage.get(stateKey);
    const { newState, result } = this.processRequest(currentState, config, request.cost, now);
    await this.storage.set(stateKey, newState, this.getStateTTL(config));
    result.rule = rule?.id;
    if (this.config.enableStats) {
      this.updateStats(request.key, rule?.id ?? "default", result);
    }
    if (result.allowed) {
      this.emit("allowed", request.key, result);
    } else {
      this.emit("rejected", request.key, result);
      this.emit("limitReached", request.key, rule?.id ?? "default");
    }
    if (rule) {
      this.emit("ruleMatched", request.key, rule.id);
    }
    return result;
  }
  async consume(request) {
    const result = await this.check(request);
    if (!result.allowed) {
      const rule = this.findMatchingRule(request);
      if (rule?.actions.onLimit === "queue" && this.config.queueConfig) {
        const queueKey = `queue:${request.key}`;
        const position = await this.queue.enqueue(queueKey, request);
        if (position <= this.config.queueConfig.maxSize) {
          this.emit("queued", request.key, position);
          return {
            ...result,
            queuePosition: position
          };
        }
      }
      throw new RateLimitExceededError(request.key, result);
    }
    return result;
  }
  async acquire(request) {
    return this.consume(request);
  }
  // ---------------------------------------------------------------------------
  // Rule Management
  // ---------------------------------------------------------------------------
  addRule(rule) {
    const existing = this.config.rules.findIndex((r) => r.id === rule.id);
    if (existing >= 0) {
      this.config.rules[existing] = rule;
      this.emit("ruleUpdated", rule);
    } else {
      this.config.rules.push(rule);
      this.config.rules.sort((a, b) => b.priority - a.priority);
      this.emit("ruleAdded", rule);
    }
  }
  removeRule(ruleId) {
    const index = this.config.rules.findIndex((r) => r.id === ruleId);
    if (index >= 0) {
      this.config.rules.splice(index, 1);
      this.emit("ruleRemoved", ruleId);
      return true;
    }
    return false;
  }
  getRule(ruleId) {
    return this.config.rules.find((r) => r.id === ruleId);
  }
  getRules() {
    return [...this.config.rules];
  }
  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------
  getStats(key) {
    if (key) {
      const stat = this.stats.get(key);
      return stat ? [stat] : [];
    }
    return Array.from(this.stats.values());
  }
  resetStats(key) {
    if (key) {
      this.stats.delete(key);
    } else {
      this.stats.clear();
    }
  }
  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  async reset(key, ruleId) {
    const stateKey = this.getStateKey(key, ruleId);
    await this.storage.delete(stateKey);
    this.emit("limitReset", key, ruleId ?? "default");
  }
  async getState(key, ruleId) {
    const stateKey = this.getStateKey(key, ruleId);
    return this.storage.get(stateKey);
  }
  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.removeAllListeners();
  }
  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------
  findMatchingRule(request) {
    for (const rule of this.config.rules) {
      if (!rule.enabled) continue;
      if (rule.match.path && request.path) {
        if (!this.matchPath(request.path, rule.match.path)) continue;
      }
      if (rule.match.method && request.method) {
        if (!rule.match.method.includes(request.method.toUpperCase())) continue;
      }
      if (rule.match.clientId && request.clientId) {
        if (rule.match.clientId !== request.clientId) continue;
      }
      if (rule.match.tags && request.tags) {
        const hasAllTags = rule.match.tags.every((t) => request.tags.includes(t));
        if (!hasAllTags) continue;
      }
      if (rule.match.headers && request.headers) {
        const headersMatch = Object.entries(rule.match.headers).every(
          ([key, value]) => request.headers[key] === value
        );
        if (!headersMatch) continue;
      }
      return rule;
    }
    return void 0;
  }
  matchPath(path, pattern) {
    const regex = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(`^${regex}$`).test(path);
  }
  getStateKey(key, ruleId) {
    return ruleId ? `${key}:${ruleId}` : key;
  }
  getStateTTL(config) {
    switch (config.algorithm) {
      case "token_bucket":
        return config.refillIntervalMs * Math.ceil(config.capacity / config.refillRate) * 2;
      case "sliding_window":
        return config.windowMs * 2;
      case "fixed_window":
        return config.windowMs * 2;
      case "leaky_bucket":
        return config.leakIntervalMs * Math.ceil(config.capacity / config.leakRate) * 2;
    }
  }
  processRequest(state, config, cost, now) {
    switch (config.algorithm) {
      case "token_bucket":
        return processTokenBucket(
          state,
          config,
          cost,
          now
        );
      case "sliding_window":
        return processSlidingWindow(
          state,
          config,
          cost,
          now
        );
      case "fixed_window":
        return processFixedWindow(
          state,
          config,
          cost,
          now
        );
      case "leaky_bucket":
        return processLeakyBucket(
          state,
          config,
          cost,
          now
        );
    }
  }
  updateStats(key, ruleId, result) {
    const statsKey = `${key}:${ruleId}`;
    let stat = this.stats.get(statsKey);
    if (!stat) {
      stat = {
        key,
        rule: ruleId,
        totalRequests: 0,
        allowedRequests: 0,
        rejectedRequests: 0,
        queuedRequests: 0,
        averageWaitMs: 0,
        peakUsage: 0,
        lastRequest: Date.now()
      };
      this.stats.set(statsKey, stat);
    }
    stat.totalRequests++;
    if (result.allowed) {
      stat.allowedRequests++;
    } else {
      stat.rejectedRequests++;
    }
    if (result.queuePosition) {
      stat.queuedRequests++;
    }
    stat.lastRequest = Date.now();
    const usage = 1 - result.remaining / result.limit;
    if (usage > stat.peakUsage) {
      stat.peakUsage = usage;
    }
  }
  cleanupStats() {
    const cutoff = Date.now() - this.config.statsRetentionMs;
    for (const [key, stat] of this.stats) {
      if (stat.lastRequest < cutoff) {
        this.stats.delete(key);
      }
    }
  }
};
var RateLimiterRegistry = class {
  limiters = /* @__PURE__ */ new Map();
  create(name, config = {}) {
    if (this.limiters.has(name)) {
      throw new Error(`Rate limiter '${name}' already exists`);
    }
    const limiter = new RateLimiter(config);
    this.limiters.set(name, limiter);
    return limiter;
  }
  get(name) {
    return this.limiters.get(name);
  }
  getOrCreate(name, config = {}) {
    const existing = this.limiters.get(name);
    if (existing) return existing;
    return this.create(name, config);
  }
  remove(name) {
    const limiter = this.limiters.get(name);
    if (limiter) {
      limiter.destroy();
      this.limiters.delete(name);
      return true;
    }
    return false;
  }
  list() {
    return Array.from(this.limiters.keys());
  }
  destroy() {
    for (const limiter of this.limiters.values()) {
      limiter.destroy();
    }
    this.limiters.clear();
  }
};
var defaultRegistry = null;
function getRateLimiterRegistry() {
  if (!defaultRegistry) {
    defaultRegistry = new RateLimiterRegistry();
  }
  return defaultRegistry;
}
function createRateLimiterRegistry() {
  return new RateLimiterRegistry();
}
function createRateLimiter(config = {}) {
  return new RateLimiter(config);
}
function withRateLimit(limiter, keyFn, fn) {
  return (async (...args) => {
    const key = keyFn(...args);
    await limiter.acquire({ key });
    return fn(...args);
  });
}
var RATE_LIMIT_PRESETS = {
  api: {
    algorithm: "token_bucket",
    capacity: 100,
    refillRate: 10,
    refillIntervalMs: 1e3
  },
  burst: {
    algorithm: "token_bucket",
    capacity: 50,
    refillRate: 1,
    refillIntervalMs: 1e3
  },
  strict: {
    algorithm: "fixed_window",
    windowMs: 6e4,
    maxRequests: 60
  },
  smooth: {
    algorithm: "leaky_bucket",
    capacity: 100,
    leakRate: 10,
    leakIntervalMs: 1e3
  }
};

// src/apiauth/types.ts
import { z as z13 } from "zod";
var AuthMethodSchema = z13.enum([
  "api_key",
  "jwt",
  "oauth2",
  "basic",
  "bearer",
  "custom"
]);
var ApiKeyLocationSchema = z13.enum(["header", "query", "cookie"]);
var ApiKeyConfigSchema = z13.object({
  method: z13.literal("api_key"),
  location: ApiKeyLocationSchema.default("header"),
  name: z13.string().default("X-API-Key"),
  prefix: z13.string().optional(),
  hashAlgorithm: z13.enum(["sha256", "sha512", "none"]).default("sha256")
});
var ApiKeySchema = z13.object({
  id: z13.string(),
  key: z13.string().describe("The hashed key (or plain if hash is none)"),
  name: z13.string(),
  description: z13.string().optional(),
  clientId: z13.string().optional(),
  scopes: z13.array(z13.string()).default([]),
  rateLimit: z13.number().optional().describe("Requests per hour"),
  expiresAt: z13.number().optional(),
  createdAt: z13.number(),
  lastUsedAt: z13.number().optional(),
  enabled: z13.boolean().default(true),
  metadata: z13.record(z13.unknown()).optional()
});
var JwtAlgorithmSchema = z13.enum([
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
  "PS256",
  "PS384",
  "PS512"
]);
var JwtConfigSchema = z13.object({
  method: z13.literal("jwt"),
  algorithm: JwtAlgorithmSchema.default("RS256"),
  secret: z13.string().optional().describe("For HS* algorithms"),
  publicKey: z13.string().optional().describe("For RS*/ES*/PS* algorithms"),
  privateKey: z13.string().optional().describe("For signing"),
  issuer: z13.string().optional(),
  audience: z13.union([z13.string(), z13.array(z13.string())]).optional(),
  clockTolerance: z13.number().default(60).describe("Seconds"),
  maxAge: z13.number().optional().describe("Max token age in seconds"),
  jwksUri: z13.string().optional().describe("JWKS endpoint for key rotation"),
  jwksCacheTtl: z13.number().default(3600).describe("Cache TTL in seconds")
});
var JwtPayloadSchema = z13.object({
  sub: z13.string().optional(),
  iss: z13.string().optional(),
  aud: z13.union([z13.string(), z13.array(z13.string())]).optional(),
  exp: z13.number().optional(),
  nbf: z13.number().optional(),
  iat: z13.number().optional(),
  jti: z13.string().optional(),
  // Custom claims
  scopes: z13.array(z13.string()).optional(),
  roles: z13.array(z13.string()).optional(),
  clientId: z13.string().optional()
}).passthrough();
var OAuth2GrantTypeSchema = z13.enum([
  "authorization_code",
  "client_credentials",
  "refresh_token",
  "password",
  "device_code"
]);
var OAuth2ConfigSchema = z13.object({
  method: z13.literal("oauth2"),
  clientId: z13.string(),
  clientSecret: z13.string().optional(),
  authorizationUrl: z13.string().optional(),
  tokenUrl: z13.string(),
  userInfoUrl: z13.string().optional(),
  jwksUri: z13.string().optional(),
  scopes: z13.array(z13.string()).default([]),
  redirectUri: z13.string().optional(),
  grantTypes: z13.array(OAuth2GrantTypeSchema).default(["authorization_code"]),
  pkce: z13.boolean().default(true),
  state: z13.boolean().default(true)
});
var OAuth2TokenSchema = z13.object({
  accessToken: z13.string(),
  tokenType: z13.string().default("Bearer"),
  expiresIn: z13.number().optional(),
  refreshToken: z13.string().optional(),
  scope: z13.string().optional(),
  idToken: z13.string().optional()
});
var BasicAuthConfigSchema = z13.object({
  method: z13.literal("basic"),
  realm: z13.string().default("API"),
  hashAlgorithm: z13.enum(["bcrypt", "argon2", "scrypt", "none"]).default("bcrypt")
});
var BasicCredentialsSchema = z13.object({
  id: z13.string(),
  username: z13.string(),
  passwordHash: z13.string(),
  scopes: z13.array(z13.string()).default([]),
  enabled: z13.boolean().default(true),
  createdAt: z13.number(),
  lastLoginAt: z13.number().optional()
});
var BearerConfigSchema = z13.object({
  method: z13.literal("bearer"),
  validateFn: z13.string().optional().describe("Custom validation function name"),
  tokenFormat: z13.enum(["opaque", "jwt"]).default("opaque")
});
var CustomAuthConfigSchema = z13.object({
  method: z13.literal("custom"),
  handler: z13.string().describe("Handler function name"),
  config: z13.record(z13.unknown()).optional()
});
var ApiAuthConfigSchema = z13.discriminatedUnion("method", [
  ApiKeyConfigSchema,
  JwtConfigSchema,
  OAuth2ConfigSchema,
  BasicAuthConfigSchema,
  BearerConfigSchema,
  CustomAuthConfigSchema
]);
var ApiAuthResultSchema = z13.object({
  authenticated: z13.boolean(),
  method: AuthMethodSchema.optional(),
  principal: z13.object({
    id: z13.string(),
    type: z13.enum(["user", "service", "api_key", "anonymous"]),
    name: z13.string().optional(),
    email: z13.string().optional(),
    scopes: z13.array(z13.string()).default([]),
    roles: z13.array(z13.string()).default([]),
    metadata: z13.record(z13.unknown()).optional()
  }).optional(),
  token: z13.object({
    raw: z13.string(),
    type: z13.string(),
    expiresAt: z13.number().optional()
  }).optional(),
  error: z13.object({
    code: z13.string(),
    message: z13.string()
  }).optional()
});
var ApiAuthRequestSchema = z13.object({
  headers: z13.record(z13.string()).optional(),
  query: z13.record(z13.string()).optional(),
  cookies: z13.record(z13.string()).optional(),
  body: z13.record(z13.unknown()).optional(),
  method: z13.string().optional(),
  path: z13.string().optional(),
  ip: z13.string().optional(),
  userAgent: z13.string().optional()
});
var StoredTokenSchema = z13.object({
  id: z13.string(),
  token: z13.string(),
  tokenType: z13.enum(["access", "refresh", "id"]),
  principalId: z13.string(),
  clientId: z13.string().optional(),
  scopes: z13.array(z13.string()).default([]),
  issuedAt: z13.number(),
  expiresAt: z13.number().optional(),
  revokedAt: z13.number().optional(),
  metadata: z13.record(z13.unknown()).optional()
});
var ApiSessionSchema = z13.object({
  id: z13.string(),
  principalId: z13.string(),
  createdAt: z13.number(),
  expiresAt: z13.number(),
  lastActivityAt: z13.number(),
  ip: z13.string().optional(),
  userAgent: z13.string().optional(),
  data: z13.record(z13.unknown()).default({})
});
var ApiAuthManagerConfigSchema = z13.object({
  methods: z13.array(ApiAuthConfigSchema).min(1),
  defaultMethod: AuthMethodSchema.optional(),
  fallbackToAnonymous: z13.boolean().default(false),
  sessionConfig: z13.object({
    enabled: z13.boolean().default(false),
    ttlSeconds: z13.number().default(3600),
    renewOnActivity: z13.boolean().default(true),
    cookieName: z13.string().default("session_id"),
    secure: z13.boolean().default(true),
    sameSite: z13.enum(["strict", "lax", "none"]).default("lax")
  }).optional(),
  tokenRefresh: z13.object({
    enabled: z13.boolean().default(true),
    refreshThresholdSeconds: z13.number().default(300)
  }).optional(),
  audit: z13.object({
    enabled: z13.boolean().default(true),
    logSuccessful: z13.boolean().default(true),
    logFailed: z13.boolean().default(true)
  }).optional()
});
var ApiAuthAuditEntrySchema = z13.object({
  id: z13.string(),
  timestamp: z13.number(),
  method: AuthMethodSchema,
  success: z13.boolean(),
  principalId: z13.string().optional(),
  clientId: z13.string().optional(),
  ip: z13.string().optional(),
  userAgent: z13.string().optional(),
  path: z13.string().optional(),
  errorCode: z13.string().optional(),
  errorMessage: z13.string().optional(),
  metadata: z13.record(z13.unknown()).optional()
});

// src/apiauth/auth-manager.ts
import { EventEmitter as EventEmitter15 } from "eventemitter3";
import { createHash, randomBytes as randomBytes2, timingSafeEqual } from "crypto";
var AuthenticationError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AuthenticationError";
  }
};
var TokenExpiredError = class extends AuthenticationError {
  constructor(message = "Token has expired") {
    super("TOKEN_EXPIRED", message);
    this.name = "TokenExpiredError";
  }
};
var TokenRevokedError = class extends AuthenticationError {
  constructor(message = "Token has been revoked") {
    super("TOKEN_REVOKED", message);
    this.name = "TokenRevokedError";
  }
};
var InvalidCredentialsError = class extends AuthenticationError {
  constructor(message = "Invalid credentials") {
    super("INVALID_CREDENTIALS", message);
    this.name = "InvalidCredentialsError";
  }
};
var MemoryAuthStorage = class {
  apiKeys = /* @__PURE__ */ new Map();
  apiKeysByHash = /* @__PURE__ */ new Map();
  tokens = /* @__PURE__ */ new Map();
  sessions = /* @__PURE__ */ new Map();
  credentials = /* @__PURE__ */ new Map();
  async getApiKey(id) {
    return this.apiKeys.get(id) ?? null;
  }
  async getApiKeyByHash(hash) {
    return this.apiKeysByHash.get(hash) ?? null;
  }
  async saveApiKey(apiKey) {
    this.apiKeys.set(apiKey.id, apiKey);
    this.apiKeysByHash.set(apiKey.key, apiKey);
  }
  async deleteApiKey(id) {
    const apiKey = this.apiKeys.get(id);
    if (apiKey) {
      this.apiKeysByHash.delete(apiKey.key);
      this.apiKeys.delete(id);
    }
  }
  async listApiKeys(clientId) {
    const keys = Array.from(this.apiKeys.values());
    return clientId ? keys.filter((k) => k.clientId === clientId) : keys;
  }
  async getToken(id) {
    return this.tokens.get(id) ?? null;
  }
  async saveToken(token) {
    this.tokens.set(token.id, token);
  }
  async deleteToken(id) {
    this.tokens.delete(id);
  }
  async deleteTokensByPrincipal(principalId) {
    for (const [id, token] of this.tokens) {
      if (token.principalId === principalId) {
        this.tokens.delete(id);
      }
    }
  }
  async getSession(id) {
    const session = this.sessions.get(id);
    if (session && session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      return null;
    }
    return session ?? null;
  }
  async saveSession(session) {
    this.sessions.set(session.id, session);
  }
  async deleteSession(id) {
    this.sessions.delete(id);
  }
  async deleteSessionsByPrincipal(principalId) {
    for (const [id, session] of this.sessions) {
      if (session.principalId === principalId) {
        this.sessions.delete(id);
      }
    }
  }
  async getCredentials(username) {
    return this.credentials.get(username) ?? null;
  }
  async saveCredentials(credentials) {
    this.credentials.set(credentials.username, credentials);
  }
  async deleteCredentials(username) {
    this.credentials.delete(username);
  }
};
var ApiKeyProvider = class {
  constructor(config, storage) {
    this.config = config;
    this.storage = storage;
  }
  method = "api_key";
  async authenticate(request) {
    let rawKey;
    switch (this.config.location) {
      case "header":
        rawKey = request.headers?.[this.config.name.toLowerCase()];
        break;
      case "query":
        rawKey = request.query?.[this.config.name];
        break;
      case "cookie":
        rawKey = request.cookies?.[this.config.name];
        break;
    }
    if (!rawKey) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "NO_API_KEY", message: "API key not provided" }
      };
    }
    if (this.config.prefix && rawKey.startsWith(this.config.prefix)) {
      rawKey = rawKey.slice(this.config.prefix.length);
    }
    const keyHash = this.config.hashAlgorithm === "none" ? rawKey : createHash(this.config.hashAlgorithm).update(rawKey).digest("hex");
    const apiKey = await this.storage.getApiKeyByHash(keyHash);
    if (!apiKey) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "INVALID_API_KEY", message: "Invalid API key" }
      };
    }
    if (!apiKey.enabled) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "API_KEY_DISABLED", message: "API key is disabled" }
      };
    }
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "API_KEY_EXPIRED", message: "API key has expired" }
      };
    }
    apiKey.lastUsedAt = Date.now();
    await this.storage.saveApiKey(apiKey);
    return {
      authenticated: true,
      method: this.method,
      principal: {
        id: apiKey.clientId ?? apiKey.id,
        type: "api_key",
        name: apiKey.name,
        scopes: apiKey.scopes,
        roles: [],
        metadata: apiKey.metadata
      }
    };
  }
};
var BasicAuthProvider = class {
  constructor(config, storage) {
    this.config = config;
    this.storage = storage;
  }
  method = "basic";
  async authenticate(request) {
    const authHeader = request.headers?.["authorization"];
    if (!authHeader?.startsWith("Basic ")) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "NO_CREDENTIALS", message: "Basic auth credentials not provided" }
      };
    }
    const encoded = authHeader.slice(6);
    let decoded;
    try {
      decoded = Buffer.from(encoded, "base64").toString("utf8");
    } catch {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "INVALID_ENCODING", message: "Invalid base64 encoding" }
      };
    }
    const colonIndex = decoded.indexOf(":");
    if (colonIndex === -1) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "INVALID_FORMAT", message: "Invalid credentials format" }
      };
    }
    const username = decoded.slice(0, colonIndex);
    const password = decoded.slice(colonIndex + 1);
    const credentials = await this.storage.getCredentials(username);
    if (!credentials) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" }
      };
    }
    if (!credentials.enabled) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "ACCOUNT_DISABLED", message: "Account is disabled" }
      };
    }
    const passwordHash = this.config.hashAlgorithm === "none" ? password : createHash("sha256").update(password).digest("hex");
    const expected = Buffer.from(credentials.passwordHash);
    const actual = Buffer.from(passwordHash);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" }
      };
    }
    credentials.lastLoginAt = Date.now();
    await this.storage.saveCredentials(credentials);
    return {
      authenticated: true,
      method: this.method,
      principal: {
        id: credentials.id,
        type: "user",
        name: credentials.username,
        scopes: credentials.scopes,
        roles: []
      }
    };
  }
};
var BearerTokenProvider = class {
  constructor(_config, storage) {
    this._config = _config;
    this.storage = storage;
  }
  method = "bearer";
  async authenticate(request) {
    const authHeader = request.headers?.["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "NO_TOKEN", message: "Bearer token not provided" }
      };
    }
    const token = authHeader.slice(7);
    return this.validate(token);
  }
  async validate(token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const storedToken = await this.findToken(tokenHash);
    if (!storedToken) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "INVALID_TOKEN", message: "Invalid token" }
      };
    }
    if (storedToken.revokedAt) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "TOKEN_REVOKED", message: "Token has been revoked" }
      };
    }
    if (storedToken.expiresAt && storedToken.expiresAt < Date.now()) {
      return {
        authenticated: false,
        method: this.method,
        error: { code: "TOKEN_EXPIRED", message: "Token has expired" }
      };
    }
    return {
      authenticated: true,
      method: this.method,
      principal: {
        id: storedToken.principalId,
        type: "service",
        scopes: storedToken.scopes,
        roles: [],
        metadata: storedToken.metadata
      },
      token: {
        raw: token,
        type: storedToken.tokenType,
        expiresAt: storedToken.expiresAt
      }
    };
  }
  async findToken(hash) {
    const token = await this.storage.getToken(hash);
    return token;
  }
};
var ApiAuthManager = class extends EventEmitter15 {
  config;
  storage;
  providers = /* @__PURE__ */ new Map();
  auditLog = [];
  constructor(config, storage) {
    super();
    this.config = ApiAuthManagerConfigSchema.parse(config);
    this.storage = storage ?? new MemoryAuthStorage();
    this.initializeProviders();
  }
  initializeProviders() {
    for (const methodConfig of this.config.methods) {
      switch (methodConfig.method) {
        case "api_key":
          this.providers.set("api_key", new ApiKeyProvider(methodConfig, this.storage));
          break;
        case "basic":
          this.providers.set("basic", new BasicAuthProvider(methodConfig, this.storage));
          break;
        case "bearer":
          this.providers.set("bearer", new BearerTokenProvider(methodConfig, this.storage));
          break;
        // JWT and OAuth2 would need additional dependencies
        // Adding stubs here for completeness
        case "jwt":
        case "oauth2":
        case "custom":
          break;
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------
  async authenticate(request) {
    for (const methodConfig of this.config.methods) {
      const provider = this.providers.get(methodConfig.method);
      if (!provider) continue;
      const result2 = await provider.authenticate(request);
      if (result2.authenticated) {
        await this.logAudit(methodConfig.method, true, result2, request);
        this.emit("authenticated", result2);
        return result2;
      }
      if (result2.error && !result2.error.code.includes("NO_")) {
        await this.logAudit(methodConfig.method, false, result2, request);
        this.emit("authFailed", result2, request);
        return result2;
      }
    }
    if (this.config.fallbackToAnonymous) {
      const result2 = {
        authenticated: true,
        principal: {
          id: "anonymous",
          type: "anonymous",
          scopes: [],
          roles: []
        }
      };
      return result2;
    }
    const result = {
      authenticated: false,
      error: { code: "NO_AUTH", message: "No valid authentication provided" }
    };
    await this.logAudit("custom", false, result, request);
    this.emit("authFailed", result, request);
    return result;
  }
  // ---------------------------------------------------------------------------
  // API Key Management
  // ---------------------------------------------------------------------------
  async createApiKey(options) {
    const rawKey = randomBytes2(32).toString("hex");
    const apiKeyConfig = this.config.methods.find((m) => m.method === "api_key");
    const hashAlgorithm = apiKeyConfig?.hashAlgorithm ?? "sha256";
    const keyHash = hashAlgorithm === "none" ? rawKey : createHash(hashAlgorithm).update(rawKey).digest("hex");
    const apiKey = {
      id: randomBytes2(16).toString("hex"),
      key: keyHash,
      name: options.name,
      description: options.description,
      clientId: options.clientId,
      scopes: options.scopes ?? [],
      rateLimit: options.rateLimit,
      expiresAt: options.expiresAt,
      createdAt: Date.now(),
      enabled: true,
      metadata: options.metadata
    };
    await this.storage.saveApiKey(apiKey);
    this.emit("apiKeyCreated", apiKey);
    return { apiKey, rawKey };
  }
  async revokeApiKey(id) {
    const apiKey = await this.storage.getApiKey(id);
    if (!apiKey) return false;
    apiKey.enabled = false;
    await this.storage.saveApiKey(apiKey);
    this.emit("apiKeyRevoked", id);
    return true;
  }
  async deleteApiKey(id) {
    const apiKey = await this.storage.getApiKey(id);
    if (!apiKey) return false;
    await this.storage.deleteApiKey(id);
    return true;
  }
  async listApiKeys(clientId) {
    return this.storage.listApiKeys(clientId);
  }
  // ---------------------------------------------------------------------------
  // Token Management
  // ---------------------------------------------------------------------------
  async issueToken(options) {
    const rawToken = randomBytes2(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const token = {
      id: tokenHash,
      // Use hash as ID for lookup
      token: tokenHash,
      tokenType: options.tokenType ?? "access",
      principalId: options.principalId,
      clientId: options.clientId,
      scopes: options.scopes ?? [],
      issuedAt: Date.now(),
      expiresAt: options.expiresIn ? Date.now() + options.expiresIn * 1e3 : void 0,
      metadata: options.metadata
    };
    await this.storage.saveToken(token);
    this.emit("tokenIssued", token);
    return { token, rawToken };
  }
  async revokeToken(tokenId, reason) {
    const token = await this.storage.getToken(tokenId);
    if (!token) return false;
    token.revokedAt = Date.now();
    await this.storage.saveToken(token);
    this.emit("tokenRevoked", tokenId, reason);
    return true;
  }
  async refreshToken(refreshToken) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    const storedToken = await this.storage.getToken(tokenHash);
    if (!storedToken || storedToken.tokenType !== "refresh") {
      return null;
    }
    if (storedToken.revokedAt || storedToken.expiresAt && storedToken.expiresAt < Date.now()) {
      return null;
    }
    const { rawToken } = await this.issueToken({
      principalId: storedToken.principalId,
      clientId: storedToken.clientId,
      scopes: storedToken.scopes,
      tokenType: "access",
      expiresIn: 3600,
      // 1 hour
      metadata: storedToken.metadata
    });
    const oldToken = refreshToken;
    const newStoredToken = await this.storage.getToken(
      createHash("sha256").update(rawToken).digest("hex")
    );
    if (newStoredToken) {
      this.emit("tokenRefreshed", oldToken, newStoredToken);
    }
    return {
      accessToken: rawToken,
      tokenType: "Bearer",
      expiresIn: 3600,
      refreshToken
    };
  }
  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------
  async createSession(options) {
    const session = {
      id: randomBytes2(32).toString("hex"),
      principalId: options.principalId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (this.config.sessionConfig?.ttlSeconds ?? 3600) * 1e3,
      lastActivityAt: Date.now(),
      ip: options.ip,
      userAgent: options.userAgent,
      data: options.data ?? {}
    };
    await this.storage.saveSession(session);
    this.emit("sessionCreated", session);
    return session;
  }
  async getSession(sessionId) {
    const session = await this.storage.getSession(sessionId);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.emit("sessionExpired", sessionId);
      await this.storage.deleteSession(sessionId);
      return null;
    }
    if (this.config.sessionConfig?.renewOnActivity) {
      session.lastActivityAt = Date.now();
      session.expiresAt = Date.now() + (this.config.sessionConfig.ttlSeconds ?? 3600) * 1e3;
      await this.storage.saveSession(session);
    }
    return session;
  }
  async destroySession(sessionId) {
    const session = await this.storage.getSession(sessionId);
    if (!session) return false;
    await this.storage.deleteSession(sessionId);
    this.emit("sessionDestroyed", sessionId);
    return true;
  }
  async destroyAllSessions(principalId) {
    await this.storage.deleteSessionsByPrincipal(principalId);
  }
  // ---------------------------------------------------------------------------
  // Audit
  // ---------------------------------------------------------------------------
  async logAudit(method, success, result, request) {
    if (!this.config.audit?.enabled) return;
    if (success && !this.config.audit.logSuccessful) return;
    if (!success && !this.config.audit.logFailed) return;
    const entry = {
      id: randomBytes2(16).toString("hex"),
      timestamp: Date.now(),
      method,
      success,
      principalId: result.principal?.id,
      ip: request.ip,
      userAgent: request.userAgent,
      path: request.path,
      errorCode: result.error?.code,
      errorMessage: result.error?.message
    };
    this.auditLog.push(entry);
    this.emit("auditLogged", entry);
    if (this.auditLog.length > 1e4) {
      this.auditLog = this.auditLog.slice(-5e3);
    }
  }
  getAuditLog(options) {
    let entries = [...this.auditLog];
    if (options?.method) {
      entries = entries.filter((e) => e.method === options.method);
    }
    if (options?.success !== void 0) {
      entries = entries.filter((e) => e.success === options.success);
    }
    if (options?.principalId) {
      entries = entries.filter((e) => e.principalId === options.principalId);
    }
    if (options?.since) {
      entries = entries.filter((e) => e.timestamp >= options.since);
    }
    entries.sort((a, b) => b.timestamp - a.timestamp);
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 100;
    return entries.slice(offset, offset + limit);
  }
  // ---------------------------------------------------------------------------
  // Credential Management
  // ---------------------------------------------------------------------------
  async createCredentials(options) {
    const basicConfig = this.config.methods.find((m) => m.method === "basic");
    const hashAlgorithm = basicConfig?.hashAlgorithm ?? "bcrypt";
    const passwordHash = hashAlgorithm === "none" ? options.password : createHash("sha256").update(options.password).digest("hex");
    await this.storage.saveCredentials({
      id: randomBytes2(16).toString("hex"),
      username: options.username,
      passwordHash,
      scopes: options.scopes ?? [],
      enabled: true,
      createdAt: Date.now()
    });
  }
  async deleteCredentials(username) {
    await this.storage.deleteCredentials(username);
  }
};
var defaultManager = null;
function getApiAuthManager() {
  if (!defaultManager) {
    throw new Error("API Auth Manager not initialized. Call createApiAuthManager first.");
  }
  return defaultManager;
}
function createApiAuthManager(config, storage) {
  const manager = new ApiAuthManager(config, storage);
  if (!defaultManager) {
    defaultManager = manager;
  }
  return manager;
}

// src/security/types.ts
import { z as z14 } from "zod";
var CSPDirectiveSchema = z14.enum([
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "media-src",
  "object-src",
  "frame-src",
  "child-src",
  "worker-src",
  "manifest-src",
  "base-uri",
  "form-action",
  "frame-ancestors",
  "navigate-to",
  "report-uri",
  "report-to",
  "upgrade-insecure-requests",
  "block-all-mixed-content"
]);
var CSPSourceSchema = z14.enum([
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "'unsafe-hashes'",
  "'strict-dynamic'",
  "'none'",
  "data:",
  "blob:",
  "https:",
  "http:",
  "wss:",
  "ws:"
]);
var CSPConfigSchema = z14.object({
  directives: z14.record(
    CSPDirectiveSchema,
    z14.array(z14.string())
  ),
  reportOnly: z14.boolean().default(false),
  reportUri: z14.string().optional(),
  reportTo: z14.string().optional(),
  nonce: z14.boolean().default(false).describe("Generate nonces for scripts/styles")
});
var CORSConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  origins: z14.union([
    z14.literal("*"),
    z14.array(z14.string())
  ]).default("*"),
  methods: z14.array(z14.enum([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD"
  ])).default(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  allowedHeaders: z14.array(z14.string()).default([
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ]),
  exposedHeaders: z14.array(z14.string()).default([]),
  credentials: z14.boolean().default(false),
  maxAge: z14.number().default(86400).describe("Preflight cache in seconds"),
  preflightContinue: z14.boolean().default(false),
  optionsSuccessStatus: z14.number().default(204)
});
var HSTSConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  maxAge: z14.number().default(31536e3).describe("Max age in seconds (1 year default)"),
  includeSubDomains: z14.boolean().default(true),
  preload: z14.boolean().default(false).describe("Submit to HSTS preload list")
});
var FrameOptionsSchema = z14.enum(["DENY", "SAMEORIGIN"]);
var FrameOptionsConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  value: FrameOptionsSchema.default("DENY")
});
var ContentTypeOptionsConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  nosniff: z14.boolean().default(true)
});
var ReferrerPolicySchema = z14.enum([
  "no-referrer",
  "no-referrer-when-downgrade",
  "origin",
  "origin-when-cross-origin",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url"
]);
var ReferrerPolicyConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  policy: ReferrerPolicySchema.default("strict-origin-when-cross-origin")
});
var PermissionsPolicyFeatureSchema = z14.enum([
  "accelerometer",
  "ambient-light-sensor",
  "autoplay",
  "battery",
  "camera",
  "display-capture",
  "document-domain",
  "encrypted-media",
  "fullscreen",
  "geolocation",
  "gyroscope",
  "magnetometer",
  "microphone",
  "midi",
  "payment",
  "picture-in-picture",
  "publickey-credentials-get",
  "screen-wake-lock",
  "usb",
  "web-share",
  "xr-spatial-tracking"
]);
var PermissionsPolicyConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  features: z14.record(
    PermissionsPolicyFeatureSchema,
    z14.union([
      z14.literal("*"),
      z14.literal("self"),
      z14.literal("none"),
      z14.array(z14.string())
    ])
  ).default({})
});
var CrossOriginOpenerPolicySchema = z14.enum([
  "unsafe-none",
  "same-origin-allow-popups",
  "same-origin"
]);
var CrossOriginEmbedderPolicySchema = z14.enum([
  "unsafe-none",
  "require-corp",
  "credentialless"
]);
var CrossOriginResourcePolicySchema = z14.enum([
  "same-site",
  "same-origin",
  "cross-origin"
]);
var CrossOriginPoliciesConfigSchema = z14.object({
  opener: z14.object({
    enabled: z14.boolean().default(false),
    policy: CrossOriginOpenerPolicySchema.default("same-origin")
  }).optional(),
  embedder: z14.object({
    enabled: z14.boolean().default(false),
    policy: CrossOriginEmbedderPolicySchema.default("require-corp")
  }).optional(),
  resource: z14.object({
    enabled: z14.boolean().default(false),
    policy: CrossOriginResourcePolicySchema.default("same-origin")
  }).optional()
});
var CacheControlConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  directives: z14.object({
    public: z14.boolean().optional(),
    private: z14.boolean().optional(),
    noCache: z14.boolean().optional(),
    noStore: z14.boolean().optional(),
    noTransform: z14.boolean().optional(),
    mustRevalidate: z14.boolean().optional(),
    proxyRevalidate: z14.boolean().optional(),
    maxAge: z14.number().optional(),
    sMaxAge: z14.number().optional(),
    immutable: z14.boolean().optional(),
    staleWhileRevalidate: z14.number().optional(),
    staleIfError: z14.number().optional()
  }).default({})
});
var CustomHeaderSchema = z14.object({
  name: z14.string(),
  value: z14.string(),
  override: z14.boolean().default(false).describe("Override if exists")
});
var RemoveHeadersConfigSchema = z14.object({
  enabled: z14.boolean().default(true),
  headers: z14.array(z14.string()).default([
    "X-Powered-By",
    "Server",
    "X-AspNet-Version",
    "X-AspNetMvc-Version"
  ])
});
var SecurityHeadersConfigSchema = z14.object({
  csp: CSPConfigSchema.optional(),
  cors: CORSConfigSchema.optional(),
  hsts: HSTSConfigSchema.optional(),
  frameOptions: FrameOptionsConfigSchema.optional(),
  contentTypeOptions: ContentTypeOptionsConfigSchema.optional(),
  referrerPolicy: ReferrerPolicyConfigSchema.optional(),
  permissionsPolicy: PermissionsPolicyConfigSchema.optional(),
  crossOriginPolicies: CrossOriginPoliciesConfigSchema.optional(),
  cacheControl: CacheControlConfigSchema.optional(),
  customHeaders: z14.array(CustomHeaderSchema).default([]),
  removeHeaders: RemoveHeadersConfigSchema.optional()
});
var SecurityRequestSchema = z14.object({
  method: z14.string(),
  path: z14.string(),
  origin: z14.string().optional(),
  headers: z14.record(z14.string())
});
var SecurityResponseSchema = z14.object({
  statusCode: z14.number().optional(),
  headers: z14.record(z14.string())
});
var PathConfigSchema = z14.object({
  pattern: z14.string().describe("Glob pattern or regex"),
  config: SecurityHeadersConfigSchema
});
var SecurityManagerConfigSchema = z14.object({
  global: SecurityHeadersConfigSchema.optional(),
  paths: z14.array(PathConfigSchema).default([]),
  excludePaths: z14.array(z14.string()).default([])
});

// src/security/security-headers.ts
import { EventEmitter as EventEmitter16 } from "eventemitter3";
import { randomBytes as randomBytes3 } from "crypto";
var SecurityHeadersManager = class extends EventEmitter16 {
  config;
  currentNonce = null;
  constructor(config = {}) {
    super();
    this.config = SecurityManagerConfigSchema.parse(config);
  }
  // ---------------------------------------------------------------------------
  // Main Methods
  // ---------------------------------------------------------------------------
  apply(request, response = { headers: {} }) {
    if (this.isExcluded(request.path)) {
      return response;
    }
    const effectiveConfig = this.getEffectiveConfig(request.path);
    if (!effectiveConfig) {
      return response;
    }
    const headers = { ...response.headers };
    this.applyCSP(effectiveConfig, headers);
    this.applyCORS(effectiveConfig, request, headers);
    this.applyHSTS(effectiveConfig, headers);
    this.applyFrameOptions(effectiveConfig, headers);
    this.applyContentTypeOptions(effectiveConfig, headers);
    this.applyReferrerPolicy(effectiveConfig, headers);
    this.applyPermissionsPolicy(effectiveConfig, headers);
    this.applyCrossOriginPolicies(effectiveConfig, headers);
    this.applyCacheControl(effectiveConfig, headers);
    this.applyCustomHeaders(effectiveConfig, headers);
    this.removeHeaders(effectiveConfig, headers);
    this.emit("headersApplied", request, headers);
    return {
      ...response,
      headers
    };
  }
  handlePreflight(request) {
    if (request.method !== "OPTIONS") {
      return null;
    }
    const effectiveConfig = this.getEffectiveConfig(request.path);
    const corsConfig = effectiveConfig?.cors;
    if (!corsConfig?.enabled) {
      return null;
    }
    const headers = {};
    const origin = request.origin ?? request.headers["origin"];
    if (!this.isOriginAllowed(origin, corsConfig)) {
      this.emit("corsBlocked", origin ?? "unknown");
      return { statusCode: 403, headers: {} };
    }
    if (corsConfig.origins === "*") {
      headers["Access-Control-Allow-Origin"] = "*";
    } else if (origin) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
    headers["Access-Control-Allow-Methods"] = corsConfig.methods.join(", ");
    headers["Access-Control-Allow-Headers"] = corsConfig.allowedHeaders.join(", ");
    if (corsConfig.credentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
    if (corsConfig.maxAge) {
      headers["Access-Control-Max-Age"] = String(corsConfig.maxAge);
    }
    this.emit("preflightHandled", origin ?? "unknown");
    return {
      statusCode: corsConfig.optionsSuccessStatus,
      headers
    };
  }
  // ---------------------------------------------------------------------------
  // Nonce Management
  // ---------------------------------------------------------------------------
  generateNonce() {
    this.currentNonce = randomBytes3(16).toString("base64");
    this.emit("nonceGenerated", this.currentNonce);
    return this.currentNonce;
  }
  getNonce() {
    return this.currentNonce;
  }
  // ---------------------------------------------------------------------------
  // CSP Report Handler
  // ---------------------------------------------------------------------------
  handleCSPReport(report) {
    this.emit("cspViolation", report);
  }
  // ---------------------------------------------------------------------------
  // Config Methods
  // ---------------------------------------------------------------------------
  getConfig() {
    return { ...this.config };
  }
  updateConfig(config) {
    this.config = SecurityManagerConfigSchema.parse({
      ...this.config,
      ...config
    });
  }
  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------
  isExcluded(path) {
    return this.config.excludePaths.some((pattern) => {
      const regex = this.patternToRegex(pattern);
      return regex.test(path);
    });
  }
  getEffectiveConfig(path) {
    let effective = { ...this.config.global ?? {} };
    for (const pathConfig of this.config.paths) {
      const regex = this.patternToRegex(pathConfig.pattern);
      if (regex.test(path)) {
        effective = this.mergeConfigs(effective, pathConfig.config);
      }
    }
    return effective;
  }
  mergeConfigs(base, override) {
    return {
      ...base,
      ...override,
      customHeaders: [
        ...base.customHeaders ?? [],
        ...override.customHeaders ?? []
      ]
    };
  }
  patternToRegex(pattern) {
    const regex = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(`^${regex}$`);
  }
  // ---------------------------------------------------------------------------
  // Header Application
  // ---------------------------------------------------------------------------
  applyCSP(config, headers) {
    if (!config.csp) return;
    const csp2 = config.csp;
    const directives = [];
    for (const [directive, sources] of Object.entries(csp2.directives)) {
      let sourceList = [...sources];
      if (csp2.nonce && this.currentNonce) {
        if (directive === "script-src" || directive === "style-src") {
          sourceList.push(`'nonce-${this.currentNonce}'`);
        }
      }
      directives.push(`${directive} ${sourceList.join(" ")}`);
    }
    if (csp2.reportUri) {
      directives.push(`report-uri ${csp2.reportUri}`);
    }
    if (csp2.reportTo) {
      directives.push(`report-to ${csp2.reportTo}`);
    }
    const headerName = csp2.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
    headers[headerName] = directives.join("; ");
  }
  applyCORS(config, request, headers) {
    if (!config.cors?.enabled) return;
    const cors = config.cors;
    const origin = request.origin ?? request.headers["origin"];
    if (!this.isOriginAllowed(origin, cors)) {
      if (origin) {
        this.emit("corsBlocked", origin);
      }
      return;
    }
    if (cors.origins === "*") {
      headers["Access-Control-Allow-Origin"] = "*";
    } else if (origin) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers["Vary"] = "Origin";
    }
    if (cors.exposedHeaders.length > 0) {
      headers["Access-Control-Expose-Headers"] = cors.exposedHeaders.join(", ");
    }
    if (cors.credentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
    if (origin) {
      this.emit("corsAllowed", origin);
    }
  }
  isOriginAllowed(origin, cors) {
    if (!origin) return true;
    if (cors.origins === "*") return true;
    return cors.origins.some((allowed) => {
      if (allowed === origin) return true;
      const regex = new RegExp(`^${allowed.replace(/\*/g, ".*")}$`);
      return regex.test(origin);
    });
  }
  applyHSTS(config, headers) {
    if (!config.hsts?.enabled) return;
    const hsts = config.hsts;
    let value = `max-age=${hsts.maxAge}`;
    if (hsts.includeSubDomains) {
      value += "; includeSubDomains";
    }
    if (hsts.preload) {
      value += "; preload";
    }
    headers["Strict-Transport-Security"] = value;
  }
  applyFrameOptions(config, headers) {
    if (!config.frameOptions?.enabled) return;
    headers["X-Frame-Options"] = config.frameOptions.value;
  }
  applyContentTypeOptions(config, headers) {
    if (!config.contentTypeOptions?.enabled) return;
    if (config.contentTypeOptions.nosniff) {
      headers["X-Content-Type-Options"] = "nosniff";
    }
  }
  applyReferrerPolicy(config, headers) {
    if (!config.referrerPolicy?.enabled) return;
    headers["Referrer-Policy"] = config.referrerPolicy.policy;
  }
  applyPermissionsPolicy(config, headers) {
    if (!config.permissionsPolicy?.enabled) return;
    const features = config.permissionsPolicy.features;
    const policies = [];
    for (const [feature, value] of Object.entries(features)) {
      if (value === "none") {
        policies.push(`${feature}=()`);
      } else if (value === "self") {
        policies.push(`${feature}=(self)`);
      } else if (value === "*") {
        policies.push(`${feature}=*`);
      } else if (Array.isArray(value)) {
        policies.push(`${feature}=(${value.join(" ")})`);
      }
    }
    if (policies.length > 0) {
      headers["Permissions-Policy"] = policies.join(", ");
    }
  }
  applyCrossOriginPolicies(config, headers) {
    const policies = config.crossOriginPolicies;
    if (!policies) return;
    if (policies.opener?.enabled) {
      headers["Cross-Origin-Opener-Policy"] = policies.opener.policy;
    }
    if (policies.embedder?.enabled) {
      headers["Cross-Origin-Embedder-Policy"] = policies.embedder.policy;
    }
    if (policies.resource?.enabled) {
      headers["Cross-Origin-Resource-Policy"] = policies.resource.policy;
    }
  }
  applyCacheControl(config, headers) {
    if (!config.cacheControl?.enabled) return;
    const directives = config.cacheControl.directives;
    const parts = [];
    if (directives.public) parts.push("public");
    if (directives.private) parts.push("private");
    if (directives.noCache) parts.push("no-cache");
    if (directives.noStore) parts.push("no-store");
    if (directives.noTransform) parts.push("no-transform");
    if (directives.mustRevalidate) parts.push("must-revalidate");
    if (directives.proxyRevalidate) parts.push("proxy-revalidate");
    if (directives.maxAge !== void 0) parts.push(`max-age=${directives.maxAge}`);
    if (directives.sMaxAge !== void 0) parts.push(`s-maxage=${directives.sMaxAge}`);
    if (directives.immutable) parts.push("immutable");
    if (directives.staleWhileRevalidate !== void 0) {
      parts.push(`stale-while-revalidate=${directives.staleWhileRevalidate}`);
    }
    if (directives.staleIfError !== void 0) {
      parts.push(`stale-if-error=${directives.staleIfError}`);
    }
    if (parts.length > 0) {
      headers["Cache-Control"] = parts.join(", ");
    }
  }
  applyCustomHeaders(config, headers) {
    for (const custom of config.customHeaders ?? []) {
      if (custom.override || !(custom.name in headers)) {
        headers[custom.name] = custom.value;
      }
    }
  }
  removeHeaders(config, headers) {
    if (!config.removeHeaders?.enabled) return;
    for (const name of config.removeHeaders.headers) {
      if (name in headers) {
        delete headers[name];
        this.emit("headerRemoved", name);
      }
      const lower = name.toLowerCase();
      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === lower) {
          delete headers[key];
          this.emit("headerRemoved", key);
        }
      }
    }
  }
};
var defaultManager2 = null;
function getSecurityHeadersManager() {
  if (!defaultManager2) {
    defaultManager2 = new SecurityHeadersManager();
  }
  return defaultManager2;
}
function createSecurityHeadersManager(config = {}) {
  const manager = new SecurityHeadersManager(config);
  if (!defaultManager2) {
    defaultManager2 = manager;
  }
  return manager;
}
var SECURITY_PRESETS = {
  // Strict preset for APIs
  strict: {
    global: {
      hsts: {
        enabled: true,
        maxAge: 31536e3,
        includeSubDomains: true,
        preload: true
      },
      frameOptions: {
        enabled: true,
        value: "DENY"
      },
      contentTypeOptions: {
        enabled: true,
        nosniff: true
      },
      referrerPolicy: {
        enabled: true,
        policy: "no-referrer"
      },
      cors: {
        enabled: true,
        origins: [],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 204,
        exposedHeaders: []
      },
      removeHeaders: {
        enabled: true,
        headers: ["X-Powered-By", "Server"]
      },
      cacheControl: {
        enabled: true,
        directives: {
          noStore: true,
          noCache: true,
          mustRevalidate: true,
          private: true
        }
      }
    }
  },
  // Relaxed preset for development
  development: {
    global: {
      cors: {
        enabled: true,
        origins: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allowedHeaders: ["*"],
        credentials: true,
        maxAge: 0,
        preflightContinue: false,
        optionsSuccessStatus: 204,
        exposedHeaders: []
      },
      hsts: {
        enabled: false,
        maxAge: 0,
        includeSubDomains: false,
        preload: false
      }
    }
  },
  // Standard preset for production web apps
  standard: {
    global: {
      hsts: {
        enabled: true,
        maxAge: 31536e3,
        includeSubDomains: true,
        preload: false
      },
      frameOptions: {
        enabled: true,
        value: "SAMEORIGIN"
      },
      contentTypeOptions: {
        enabled: true,
        nosniff: true
      },
      referrerPolicy: {
        enabled: true,
        policy: "strict-origin-when-cross-origin"
      },
      permissionsPolicy: {
        enabled: true,
        features: {
          geolocation: "none",
          microphone: "none",
          camera: "none"
        }
      },
      removeHeaders: {
        enabled: true,
        headers: ["X-Powered-By", "Server"]
      }
    }
  }
};
var CSPBuilder = class {
  directives = {};
  reportOnly = false;
  reportUri;
  reportTo;
  useNonce = false;
  defaultSrc(...sources) {
    this.directives["default-src"] = sources;
    return this;
  }
  scriptSrc(...sources) {
    this.directives["script-src"] = sources;
    return this;
  }
  styleSrc(...sources) {
    this.directives["style-src"] = sources;
    return this;
  }
  imgSrc(...sources) {
    this.directives["img-src"] = sources;
    return this;
  }
  fontSrc(...sources) {
    this.directives["font-src"] = sources;
    return this;
  }
  connectSrc(...sources) {
    this.directives["connect-src"] = sources;
    return this;
  }
  frameSrc(...sources) {
    this.directives["frame-src"] = sources;
    return this;
  }
  frameAncestors(...sources) {
    this.directives["frame-ancestors"] = sources;
    return this;
  }
  formAction(...sources) {
    this.directives["form-action"] = sources;
    return this;
  }
  baseUri(...sources) {
    this.directives["base-uri"] = sources;
    return this;
  }
  objectSrc(...sources) {
    this.directives["object-src"] = sources;
    return this;
  }
  workerSrc(...sources) {
    this.directives["worker-src"] = sources;
    return this;
  }
  upgradeInsecureRequests() {
    this.directives["upgrade-insecure-requests"] = [];
    return this;
  }
  blockAllMixedContent() {
    this.directives["block-all-mixed-content"] = [];
    return this;
  }
  withNonce() {
    this.useNonce = true;
    return this;
  }
  withReportUri(uri) {
    this.reportUri = uri;
    return this;
  }
  withReportTo(endpoint) {
    this.reportTo = endpoint;
    return this;
  }
  reportOnlyMode() {
    this.reportOnly = true;
    return this;
  }
  build() {
    return {
      directives: this.directives,
      reportOnly: this.reportOnly,
      reportUri: this.reportUri,
      reportTo: this.reportTo,
      nonce: this.useNonce
    };
  }
};
function csp() {
  return new CSPBuilder();
}

// src/telemetry/types.ts
import { z as z15 } from "zod";
var TraceIdSchema = z15.string().regex(/^[a-f0-9]{32}$/);
var SpanIdSchema = z15.string().regex(/^[a-f0-9]{16}$/);
var TraceFlagsSchema = z15.number().int().min(0).max(255);
var TraceContextSchema2 = z15.object({
  traceId: TraceIdSchema,
  spanId: SpanIdSchema,
  traceFlags: TraceFlagsSchema.default(1),
  // 0 = not sampled, 1 = sampled
  traceState: z15.string().optional()
});
var SpanStatusCodeSchema2 = z15.enum(["UNSET", "OK", "ERROR"]);
var SpanStatusSchema3 = z15.object({
  code: SpanStatusCodeSchema2,
  message: z15.string().optional()
});
var SpanKindSchema2 = z15.enum([
  "INTERNAL",
  "SERVER",
  "CLIENT",
  "PRODUCER",
  "CONSUMER"
]);
var AttributeValueSchema = z15.union([
  z15.string(),
  z15.number(),
  z15.boolean(),
  z15.array(z15.string()),
  z15.array(z15.number()),
  z15.array(z15.boolean())
]);
var AttributesSchema = z15.record(AttributeValueSchema);
var SpanEventSchema2 = z15.object({
  name: z15.string(),
  timestamp: z15.number(),
  attributes: AttributesSchema.optional()
});
var SpanLinkSchema2 = z15.object({
  context: TraceContextSchema2,
  attributes: AttributesSchema.optional()
});
var SpanSchema3 = z15.object({
  traceId: TraceIdSchema,
  spanId: SpanIdSchema,
  parentSpanId: SpanIdSchema.optional(),
  name: z15.string(),
  kind: SpanKindSchema2.default("INTERNAL"),
  startTime: z15.number(),
  endTime: z15.number().optional(),
  status: SpanStatusSchema3.optional(),
  attributes: AttributesSchema.default({}),
  events: z15.array(SpanEventSchema2).default([]),
  links: z15.array(SpanLinkSchema2).default([]),
  droppedAttributesCount: z15.number().default(0),
  droppedEventsCount: z15.number().default(0),
  droppedLinksCount: z15.number().default(0)
});
var ResourceSchema = z15.object({
  attributes: AttributesSchema.default({}),
  schemaUrl: z15.string().optional()
});
var InstrumentationScopeSchema = z15.object({
  name: z15.string(),
  version: z15.string().optional(),
  schemaUrl: z15.string().optional(),
  attributes: AttributesSchema.optional()
});
var SamplerTypeSchema2 = z15.enum([
  "always_on",
  "always_off",
  "trace_id_ratio",
  "parent_based"
]);
var SamplerConfigSchema2 = z15.object({
  type: SamplerTypeSchema2,
  ratio: z15.number().min(0).max(1).optional(),
  root: SamplerTypeSchema2.optional(),
  remoteParentSampled: SamplerTypeSchema2.optional(),
  remoteParentNotSampled: SamplerTypeSchema2.optional(),
  localParentSampled: SamplerTypeSchema2.optional(),
  localParentNotSampled: SamplerTypeSchema2.optional()
});
var ExporterTypeSchema2 = z15.enum([
  "console",
  "otlp_http",
  "otlp_grpc",
  "zipkin",
  "jaeger",
  "memory"
]);
var ExporterConfigSchema2 = z15.object({
  type: ExporterTypeSchema2,
  endpoint: z15.string().optional(),
  headers: z15.record(z15.string()).optional(),
  compression: z15.enum(["none", "gzip"]).optional(),
  timeout: z15.number().optional(),
  concurrencyLimit: z15.number().optional()
});
var ProcessorTypeSchema = z15.enum([
  "simple",
  "batch"
]);
var BatchProcessorConfigSchema = z15.object({
  maxQueueSize: z15.number().default(2048),
  maxExportBatchSize: z15.number().default(512),
  scheduledDelayMs: z15.number().default(5e3),
  exportTimeoutMs: z15.number().default(3e4)
});
var PropagatorTypeSchema = z15.enum([
  "w3c_trace_context",
  "w3c_baggage",
  "b3",
  "b3_multi",
  "jaeger",
  "xray"
]);
var TracerConfigSchema = z15.object({
  serviceName: z15.string(),
  serviceVersion: z15.string().optional(),
  environment: z15.string().optional(),
  resource: ResourceSchema.optional(),
  sampler: SamplerConfigSchema2.optional(),
  exporter: ExporterConfigSchema2.optional(),
  processor: z15.object({
    type: ProcessorTypeSchema.default("batch"),
    batch: BatchProcessorConfigSchema.optional()
  }).optional(),
  propagators: z15.array(PropagatorTypeSchema).default(["w3c_trace_context", "w3c_baggage"]),
  spanLimits: z15.object({
    maxAttributeCount: z15.number().default(128),
    maxEventCount: z15.number().default(128),
    maxLinkCount: z15.number().default(128),
    maxAttributeValueLength: z15.number().default(12e3)
  }).optional(),
  instrumentations: z15.object({
    http: z15.boolean().default(true),
    grpc: z15.boolean().default(true),
    database: z15.boolean().default(true)
  }).optional()
});
var BaggageEntrySchema = z15.object({
  value: z15.string(),
  metadata: z15.string().optional()
});
var BaggageSchema = z15.record(BaggageEntrySchema);
var ContextCarrierSchema = z15.record(z15.string());
var SpanOptionsSchema = z15.object({
  kind: SpanKindSchema2.optional(),
  attributes: AttributesSchema.optional(),
  links: z15.array(SpanLinkSchema2).optional(),
  startTime: z15.number().optional(),
  root: z15.boolean().optional().describe("Force a new trace")
});
var HTTP_ATTRIBUTES = {
  METHOD: "http.method",
  URL: "http.url",
  TARGET: "http.target",
  HOST: "http.host",
  SCHEME: "http.scheme",
  STATUS_CODE: "http.status_code",
  FLAVOR: "http.flavor",
  USER_AGENT: "http.user_agent",
  REQUEST_CONTENT_LENGTH: "http.request_content_length",
  RESPONSE_CONTENT_LENGTH: "http.response_content_length",
  ROUTE: "http.route",
  CLIENT_IP: "http.client_ip"
};
var DB_ATTRIBUTES = {
  SYSTEM: "db.system",
  CONNECTION_STRING: "db.connection_string",
  USER: "db.user",
  NAME: "db.name",
  STATEMENT: "db.statement",
  OPERATION: "db.operation"
};
var RPC_ATTRIBUTES = {
  SYSTEM: "rpc.system",
  SERVICE: "rpc.service",
  METHOD: "rpc.method",
  GRPC_STATUS_CODE: "rpc.grpc.status_code"
};
var MESSAGING_ATTRIBUTES = {
  SYSTEM: "messaging.system",
  DESTINATION: "messaging.destination",
  DESTINATION_KIND: "messaging.destination_kind",
  MESSAGE_ID: "messaging.message_id",
  OPERATION: "messaging.operation"
};
var ERROR_ATTRIBUTES = {
  TYPE: "error.type",
  MESSAGE: "error.message",
  STACK_TRACE: "error.stack_trace"
};
var SERVICE_ATTRIBUTES = {
  NAME: "service.name",
  VERSION: "service.version",
  INSTANCE_ID: "service.instance.id",
  NAMESPACE: "service.namespace"
};

// src/telemetry/tracer.ts
import { EventEmitter as EventEmitter17 } from "eventemitter3";
import { randomBytes as randomBytes4 } from "crypto";
function generateTraceId2() {
  return randomBytes4(16).toString("hex");
}
function generateSpanId2() {
  return randomBytes4(8).toString("hex");
}
var ContextManager = class {
  stack = [{}];
  current() {
    return this.stack[this.stack.length - 1];
  }
  with(context, fn) {
    this.stack.push({ ...this.current(), ...context });
    try {
      return fn();
    } finally {
      this.stack.pop();
    }
  }
  async withAsync(context, fn) {
    this.stack.push({ ...this.current(), ...context });
    try {
      return await fn();
    } finally {
      this.stack.pop();
    }
  }
  setCurrentSpan(span) {
    this.stack[this.stack.length - 1].span = span;
    this.stack[this.stack.length - 1].traceContext = {
      traceId: span.traceId,
      spanId: span.spanId,
      traceFlags: 1
    };
  }
  getCurrentSpan() {
    return this.current().span;
  }
  getTraceContext() {
    return this.current().traceContext;
  }
  getBaggage() {
    return this.current().baggage;
  }
  setBaggage(baggage) {
    this.stack[this.stack.length - 1].baggage = baggage;
  }
};
var ActiveSpan = class {
  traceId;
  spanId;
  parentSpanId;
  name;
  kind;
  startTime;
  endTime;
  status;
  attributes;
  events;
  links;
  droppedAttributesCount;
  droppedEventsCount;
  droppedLinksCount;
  ended = false;
  tracer;
  constructor(tracer, name, options) {
    this.tracer = tracer;
    this.traceId = options.traceId;
    this.spanId = options.spanId;
    this.parentSpanId = options.parentSpanId;
    this.name = name;
    this.kind = options.kind ?? "INTERNAL";
    this.startTime = options.startTime ?? Date.now();
    this.attributes = options.attributes ?? {};
    this.events = [];
    this.links = options.links ?? [];
    this.droppedAttributesCount = 0;
    this.droppedEventsCount = 0;
    this.droppedLinksCount = 0;
  }
  setAttribute(key, value) {
    if (!this.ended) {
      this.attributes[key] = value;
    }
    return this;
  }
  setAttributes(attributes) {
    if (!this.ended) {
      Object.assign(this.attributes, attributes);
    }
    return this;
  }
  addEvent(name, attributes, timestamp) {
    if (!this.ended) {
      this.events.push({
        name,
        timestamp: timestamp ?? Date.now(),
        attributes
      });
    }
    return this;
  }
  setStatus(status) {
    if (!this.ended) {
      this.status = status;
    }
    return this;
  }
  recordException(error, timestamp) {
    if (!this.ended) {
      this.addEvent("exception", {
        "exception.type": error.name,
        "exception.message": error.message,
        "exception.stacktrace": error.stack ?? ""
      }, timestamp);
      this.setStatus({ code: "ERROR", message: error.message });
      this.tracer["emit"]("spanError", this.toSpan(), error);
    }
    return this;
  }
  updateName(name) {
    if (!this.ended) {
      this.name = name;
    }
    return this;
  }
  isRecording() {
    return !this.ended;
  }
  end(endTime) {
    if (this.ended) return;
    this.ended = true;
    this.endTime = endTime ?? Date.now();
    this.tracer["onSpanEnd"](this);
  }
  toSpan() {
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      name: this.name,
      kind: this.kind,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      attributes: { ...this.attributes },
      events: [...this.events],
      links: [...this.links],
      droppedAttributesCount: this.droppedAttributesCount,
      droppedEventsCount: this.droppedEventsCount,
      droppedLinksCount: this.droppedLinksCount
    };
  }
};
var Tracer2 = class extends EventEmitter17 {
  config;
  context;
  resource;
  spans = [];
  exportInterval;
  constructor(config) {
    super();
    this.config = TracerConfigSchema.parse(config);
    this.context = new ContextManager();
    this.resource = {
      attributes: {
        [SERVICE_ATTRIBUTES.NAME]: this.config.serviceName,
        ...this.config.serviceVersion && { [SERVICE_ATTRIBUTES.VERSION]: this.config.serviceVersion },
        ...this.config.environment && { "deployment.environment": this.config.environment },
        ...this.config.resource?.attributes
      },
      schemaUrl: this.config.resource?.schemaUrl
    };
    if (this.config.processor?.type === "batch") {
      const delay = this.config.processor.batch?.scheduledDelayMs ?? 5e3;
      this.exportInterval = setInterval(() => this.flush(), delay);
    }
  }
  // ---------------------------------------------------------------------------
  // Span Creation
  // ---------------------------------------------------------------------------
  startSpan(name, options = {}) {
    let traceId;
    let parentSpanId;
    if (options.root) {
      traceId = generateTraceId2();
    } else {
      const currentContext = this.context.getTraceContext();
      if (currentContext) {
        traceId = currentContext.traceId;
        parentSpanId = currentContext.spanId;
      } else {
        traceId = generateTraceId2();
      }
    }
    const spanId = generateSpanId2();
    const span = new ActiveSpan(this, name, {
      ...options,
      traceId,
      spanId,
      parentSpanId
    });
    this.context.setCurrentSpan(span);
    this.emit("spanStarted", span.toSpan());
    return span;
  }
  startActiveSpan(name, optionsOrFn, maybeFn) {
    const options = typeof optionsOrFn === "function" ? {} : optionsOrFn;
    const fn = typeof optionsOrFn === "function" ? optionsOrFn : maybeFn;
    const span = this.startSpan(name, options);
    const context = {
      span,
      traceContext: {
        traceId: span.traceId,
        spanId: span.spanId,
        traceFlags: 1
      }
    };
    return this.context.with(context, () => {
      try {
        const result = fn(span);
        if (result instanceof Promise) {
          return result.finally(() => span.end());
        }
        span.end();
        return result;
      } catch (error) {
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  }
  async startActiveSpanAsync(name, optionsOrFn, maybeFn) {
    const options = typeof optionsOrFn === "function" ? {} : optionsOrFn;
    const fn = typeof optionsOrFn === "function" ? optionsOrFn : maybeFn;
    const span = this.startSpan(name, options);
    const context = {
      span,
      traceContext: {
        traceId: span.traceId,
        spanId: span.spanId,
        traceFlags: 1
      }
    };
    return this.context.withAsync(context, async () => {
      try {
        const result = await fn(span);
        span.end();
        return result;
      } catch (error) {
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  }
  // ---------------------------------------------------------------------------
  // Context Access
  // ---------------------------------------------------------------------------
  getCurrentSpan() {
    return this.context.getCurrentSpan();
  }
  getTraceContext() {
    return this.context.getTraceContext();
  }
  // ---------------------------------------------------------------------------
  // Context Propagation
  // ---------------------------------------------------------------------------
  inject(carrier = {}) {
    const context = this.context.getTraceContext();
    if (!context) return carrier;
    const traceparent = `00-${context.traceId}-${context.spanId}-${context.traceFlags.toString(16).padStart(2, "0")}`;
    carrier["traceparent"] = traceparent;
    if (context.traceState) {
      carrier["tracestate"] = context.traceState;
    }
    const baggage = this.context.getBaggage();
    if (baggage && Object.keys(baggage).length > 0) {
      const baggageStr = Object.entries(baggage).map(([key, entry]) => `${encodeURIComponent(key)}=${encodeURIComponent(entry.value)}`).join(",");
      carrier["baggage"] = baggageStr;
    }
    this.emit("contextInjected", carrier);
    return carrier;
  }
  extract(carrier) {
    const traceparent = carrier["traceparent"];
    if (!traceparent) {
      this.emit("contextExtracted", null);
      return null;
    }
    const match = traceparent.match(/^00-([a-f0-9]{32})-([a-f0-9]{16})-([a-f0-9]{2})$/);
    if (!match) {
      this.emit("contextExtracted", null);
      return null;
    }
    const context = {
      traceId: match[1],
      spanId: match[2],
      traceFlags: parseInt(match[3], 16),
      traceState: carrier["tracestate"]
    };
    const baggageStr = carrier["baggage"];
    if (baggageStr) {
      const baggage = {};
      for (const entry of baggageStr.split(",")) {
        const [key, value] = entry.split("=").map((s) => decodeURIComponent(s.trim()));
        if (key && value) {
          baggage[key] = { value };
        }
      }
      this.context.setBaggage(baggage);
    }
    this.emit("contextExtracted", context);
    return context;
  }
  withExtractedContext(carrier, fn) {
    const context = this.extract(carrier);
    if (!context) {
      return fn();
    }
    return this.context.with({ traceContext: context }, fn);
  }
  async withExtractedContextAsync(carrier, fn) {
    const context = this.extract(carrier);
    if (!context) {
      return fn();
    }
    return this.context.withAsync({ traceContext: context }, fn);
  }
  // ---------------------------------------------------------------------------
  // Baggage
  // ---------------------------------------------------------------------------
  getBaggage() {
    return this.context.getBaggage();
  }
  setBaggageEntry(key, value, metadata) {
    const current = this.context.getBaggage() ?? {};
    current[key] = { value, metadata };
    this.context.setBaggage(current);
  }
  removeBaggageEntry(key) {
    const current = this.context.getBaggage();
    if (current) {
      delete current[key];
      this.context.setBaggage(current);
    }
  }
  // ---------------------------------------------------------------------------
  // Resource
  // ---------------------------------------------------------------------------
  getResource() {
    return { ...this.resource };
  }
  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  onSpanEnd(span) {
    const spanData = span.toSpan();
    this.emit("spanEnded", spanData);
    this.spans.push(spanData);
    if (this.config.processor?.type === "simple" || !this.config.processor) {
      this.exportSpans([spanData]);
    }
  }
  async flush() {
    if (this.spans.length === 0) return;
    const toExport = [...this.spans];
    this.spans = [];
    await this.exportSpans(toExport);
  }
  async exportSpans(spans) {
    if (spans.length === 0) return;
    this.emit("exportStarted", spans);
    try {
      const exporter = this.config.exporter;
      switch (exporter?.type) {
        case "console":
          for (const span of spans) {
            console.log(JSON.stringify({
              resource: this.resource,
              span
            }, null, 2));
          }
          break;
        case "otlp_http":
          if (exporter.endpoint) {
            console.log(`[OTLP] Exporting ${spans.length} spans to ${exporter.endpoint}`);
          }
          break;
        case "memory":
          break;
        default:
          for (const span of spans) {
            console.log(JSON.stringify(span));
          }
      }
      this.emit("exportCompleted", spans, true);
    } catch (error) {
      this.emit("exportFailed", error);
      this.emit("exportCompleted", spans, false);
    }
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async shutdown() {
    if (this.exportInterval) {
      clearInterval(this.exportInterval);
    }
    await this.flush();
    this.removeAllListeners();
  }
  // ---------------------------------------------------------------------------
  // Stored Spans (for memory exporter)
  // ---------------------------------------------------------------------------
  getStoredSpans() {
    return [...this.spans];
  }
  clearStoredSpans() {
    this.spans = [];
  }
};
var defaultTracer = null;
function getTracer2() {
  if (!defaultTracer) {
    throw new Error("Tracer not initialized. Call createTracer first.");
  }
  return defaultTracer;
}
function createTracer2(config) {
  const tracer = new Tracer2(config);
  if (!defaultTracer) {
    defaultTracer = tracer;
  }
  return tracer;
}
function traced(name, options) {
  return function(_target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const spanName = name ?? propertyKey;
    descriptor.value = function(...args) {
      const tracer = getTracer2();
      return tracer.startActiveSpan(spanName, options ?? {}, (span) => {
        return originalMethod.apply(this, args);
      });
    };
    return descriptor;
  };
}
function withSpan(name, fn, options) {
  const tracer = getTracer2();
  return tracer.startActiveSpan(name, options ?? {}, fn);
}
async function withSpanAsync(name, fn, options) {
  const tracer = getTracer2();
  return tracer.startActiveSpanAsync(name, options ?? {}, fn);
}

// src/logging/types.ts
import { z as z16 } from "zod";
var LogLevelSchema = z16.enum([
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal"
]);
var LOG_LEVEL_VALUES = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
};
var LogEntrySchema = z16.object({
  timestamp: z16.number(),
  level: LogLevelSchema,
  message: z16.string(),
  logger: z16.string().optional(),
  // Context
  traceId: z16.string().optional(),
  spanId: z16.string().optional(),
  requestId: z16.string().optional(),
  // Service info
  service: z16.string().optional(),
  version: z16.string().optional(),
  environment: z16.string().optional(),
  hostname: z16.string().optional(),
  pid: z16.number().optional(),
  // Additional data
  data: z16.record(z16.unknown()).optional(),
  error: z16.object({
    name: z16.string(),
    message: z16.string(),
    stack: z16.string().optional(),
    code: z16.string().optional()
  }).optional(),
  // Tags for filtering
  tags: z16.array(z16.string()).optional()
});
var TransportTypeSchema = z16.enum([
  "console",
  "file",
  "http",
  "stream",
  "memory",
  "elasticsearch",
  "loki",
  "datadog",
  "cloudwatch"
]);
var ConsoleTransportConfigSchema = z16.object({
  type: z16.literal("console"),
  level: LogLevelSchema.default("info"),
  colorize: z16.boolean().default(true),
  timestamp: z16.boolean().default(true),
  prettyPrint: z16.boolean().default(false)
});
var FileTransportConfigSchema = z16.object({
  type: z16.literal("file"),
  level: LogLevelSchema.default("info"),
  path: z16.string(),
  maxSize: z16.number().default(10 * 1024 * 1024),
  // 10MB
  maxFiles: z16.number().default(5),
  compress: z16.boolean().default(true),
  json: z16.boolean().default(true)
});
var HttpTransportConfigSchema = z16.object({
  type: z16.literal("http"),
  level: LogLevelSchema.default("info"),
  url: z16.string().url(),
  method: z16.enum(["POST", "PUT"]).default("POST"),
  headers: z16.record(z16.string()).optional(),
  auth: z16.object({
    type: z16.enum(["basic", "bearer", "api_key"]),
    username: z16.string().optional(),
    password: z16.string().optional(),
    token: z16.string().optional(),
    apiKey: z16.string().optional(),
    apiKeyHeader: z16.string().optional()
  }).optional(),
  batch: z16.object({
    size: z16.number().default(100),
    interval: z16.number().default(5e3)
  }).optional(),
  retry: z16.object({
    attempts: z16.number().default(3),
    delay: z16.number().default(1e3)
  }).optional(),
  timeout: z16.number().default(3e4)
});
var MemoryTransportConfigSchema = z16.object({
  type: z16.literal("memory"),
  level: LogLevelSchema.default("debug"),
  maxEntries: z16.number().default(1e3),
  circular: z16.boolean().default(true)
});
var ElasticsearchTransportConfigSchema = z16.object({
  type: z16.literal("elasticsearch"),
  level: LogLevelSchema.default("info"),
  nodes: z16.array(z16.string().url()),
  index: z16.string().default("logs"),
  indexPattern: z16.string().default("logs-%Y.%m.%d"),
  auth: z16.object({
    username: z16.string(),
    password: z16.string()
  }).optional(),
  ssl: z16.object({
    rejectUnauthorized: z16.boolean().default(true),
    ca: z16.string().optional()
  }).optional(),
  batch: z16.object({
    size: z16.number().default(500),
    interval: z16.number().default(5e3)
  }).optional()
});
var LokiTransportConfigSchema = z16.object({
  type: z16.literal("loki"),
  level: LogLevelSchema.default("info"),
  url: z16.string().url(),
  labels: z16.record(z16.string()).default({}),
  auth: z16.object({
    username: z16.string(),
    password: z16.string()
  }).optional(),
  batch: z16.object({
    size: z16.number().default(100),
    interval: z16.number().default(5e3)
  }).optional()
});
var TransportConfigSchema = z16.discriminatedUnion("type", [
  ConsoleTransportConfigSchema,
  FileTransportConfigSchema,
  HttpTransportConfigSchema,
  MemoryTransportConfigSchema,
  ElasticsearchTransportConfigSchema,
  LokiTransportConfigSchema
]);
var FormatterTypeSchema = z16.enum([
  "json",
  "text",
  "pretty",
  "logfmt",
  "ecs"
  // Elastic Common Schema
]);
var FormatterConfigSchema = z16.object({
  type: FormatterTypeSchema.default("json"),
  timestamp: z16.enum(["iso", "epoch", "unix", "none"]).default("iso"),
  includeLevel: z16.boolean().default(true),
  includeMeta: z16.boolean().default(true),
  fields: z16.object({
    timestamp: z16.string().default("timestamp"),
    level: z16.string().default("level"),
    message: z16.string().default("message"),
    error: z16.string().default("error")
  }).optional()
});
var LogFilterSchema = z16.object({
  levels: z16.array(LogLevelSchema).optional(),
  loggers: z16.array(z16.string()).optional(),
  tags: z16.array(z16.string()).optional(),
  pattern: z16.string().optional().describe("Regex pattern for message"),
  exclude: z16.object({
    levels: z16.array(LogLevelSchema).optional(),
    loggers: z16.array(z16.string()).optional(),
    tags: z16.array(z16.string()).optional(),
    pattern: z16.string().optional()
  }).optional()
});
var SamplingConfigSchema = z16.object({
  enabled: z16.boolean().default(false),
  rate: z16.number().min(0).max(1).default(1),
  rules: z16.array(z16.object({
    match: LogFilterSchema,
    rate: z16.number().min(0).max(1)
  })).optional()
});
var RedactionConfigSchema = z16.object({
  enabled: z16.boolean().default(true),
  fields: z16.array(z16.string()).default([
    "password",
    "secret",
    "token",
    "apiKey",
    "api_key",
    "authorization",
    "cookie",
    "creditCard",
    "credit_card",
    "ssn"
  ]),
  patterns: z16.array(z16.string()).optional().describe("Regex patterns"),
  replacement: z16.string().default("[REDACTED]"),
  hash: z16.boolean().default(false).describe("Hash instead of replace")
});
var LogAggregatorConfigSchema = z16.object({
  service: z16.string(),
  version: z16.string().optional(),
  environment: z16.string().optional(),
  level: LogLevelSchema.default("info"),
  transports: z16.array(TransportConfigSchema).default([
    { type: "console", level: "info", colorize: true, timestamp: true, prettyPrint: false }
  ]),
  formatter: FormatterConfigSchema.optional(),
  filter: LogFilterSchema.optional(),
  sampling: SamplingConfigSchema.optional(),
  redaction: RedactionConfigSchema.optional(),
  context: z16.object({
    includeHostname: z16.boolean().default(true),
    includePid: z16.boolean().default(true),
    includeTraceContext: z16.boolean().default(true)
  }).optional(),
  buffer: z16.object({
    enabled: z16.boolean().default(false),
    size: z16.number().default(1e3),
    flushInterval: z16.number().default(5e3)
  }).optional()
});
var LogQuerySchema2 = z16.object({
  startTime: z16.number().optional(),
  endTime: z16.number().optional(),
  levels: z16.array(LogLevelSchema).optional(),
  loggers: z16.array(z16.string()).optional(),
  traceId: z16.string().optional(),
  spanId: z16.string().optional(),
  requestId: z16.string().optional(),
  tags: z16.array(z16.string()).optional(),
  search: z16.string().optional(),
  limit: z16.number().default(100),
  offset: z16.number().default(0),
  sort: z16.enum(["asc", "desc"]).default("desc")
});
var LogStatsSchema = z16.object({
  total: z16.number(),
  byLevel: z16.record(LogLevelSchema, z16.number()),
  byLogger: z16.record(z16.string(), z16.number()),
  byHour: z16.array(z16.object({
    hour: z16.string(),
    count: z16.number()
  })),
  errorRate: z16.number(),
  avgEntriesPerMinute: z16.number()
});

// src/logging/log-aggregator.ts
import { EventEmitter as EventEmitter18 } from "eventemitter3";
import { hostname } from "os";
import { createHash as createHash2 } from "crypto";
var ConsoleTransport = class {
  type = "console";
  level;
  colorize;
  timestamp;
  prettyPrint;
  colors = {
    trace: "\x1B[90m",
    // gray
    debug: "\x1B[36m",
    // cyan
    info: "\x1B[32m",
    // green
    warn: "\x1B[33m",
    // yellow
    error: "\x1B[31m",
    // red
    fatal: "\x1B[35m"
    // magenta
  };
  reset = "\x1B[0m";
  constructor(config) {
    this.level = config.level;
    this.colorize = config.colorize;
    this.timestamp = config.timestamp;
    this.prettyPrint = config.prettyPrint;
  }
  async log(entry) {
    let output;
    if (this.prettyPrint) {
      output = this.formatPretty(entry);
    } else {
      output = this.formatSimple(entry);
    }
    if (entry.level === "error" || entry.level === "fatal") {
      console.error(output);
    } else if (entry.level === "warn") {
      console.warn(output);
    } else if (entry.level === "debug" || entry.level === "trace") {
      console.debug(output);
    } else {
      console.log(output);
    }
  }
  formatSimple(entry) {
    const parts = [];
    if (this.timestamp) {
      parts.push(new Date(entry.timestamp).toISOString());
    }
    const levelStr = entry.level.toUpperCase().padEnd(5);
    if (this.colorize) {
      parts.push(`${this.colors[entry.level]}${levelStr}${this.reset}`);
    } else {
      parts.push(levelStr);
    }
    if (entry.logger) {
      parts.push(`[${entry.logger}]`);
    }
    parts.push(entry.message);
    if (entry.traceId) {
      parts.push(`trace=${entry.traceId.slice(0, 8)}`);
    }
    if (entry.error) {
      parts.push(`error=${entry.error.name}: ${entry.error.message}`);
    }
    return parts.join(" ");
  }
  formatPretty(entry) {
    const lines = [];
    const ts = new Date(entry.timestamp).toISOString();
    const level = this.colorize ? `${this.colors[entry.level]}${entry.level.toUpperCase()}${this.reset}` : entry.level.toUpperCase();
    lines.push(`${ts} ${level} ${entry.message}`);
    if (entry.logger) {
      lines.push(`  logger: ${entry.logger}`);
    }
    if (entry.traceId) {
      lines.push(`  traceId: ${entry.traceId}`);
    }
    if (entry.spanId) {
      lines.push(`  spanId: ${entry.spanId}`);
    }
    if (entry.data && Object.keys(entry.data).length > 0) {
      lines.push(`  data: ${JSON.stringify(entry.data, null, 2).replace(/\n/g, "\n  ")}`);
    }
    if (entry.error) {
      lines.push(`  error: ${entry.error.name}: ${entry.error.message}`);
      if (entry.error.stack) {
        lines.push(`  ${entry.error.stack.replace(/\n/g, "\n  ")}`);
      }
    }
    return lines.join("\n");
  }
};
var MemoryTransport = class {
  type = "memory";
  level;
  entries = [];
  maxEntries;
  circular;
  constructor(config) {
    this.level = config.level;
    this.maxEntries = config.maxEntries;
    this.circular = config.circular;
  }
  async log(entry) {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      if (this.circular) {
        this.entries.shift();
      } else {
        this.entries = this.entries.slice(-this.maxEntries);
      }
    }
  }
  getEntries() {
    return [...this.entries];
  }
  clear() {
    this.entries = [];
  }
  query(query) {
    let results = [...this.entries];
    if (query.startTime) {
      results = results.filter((e) => e.timestamp >= query.startTime);
    }
    if (query.endTime) {
      results = results.filter((e) => e.timestamp <= query.endTime);
    }
    if (query.levels && query.levels.length > 0) {
      results = results.filter((e) => query.levels.includes(e.level));
    }
    if (query.loggers && query.loggers.length > 0) {
      results = results.filter((e) => e.logger && query.loggers.includes(e.logger));
    }
    if (query.traceId) {
      results = results.filter((e) => e.traceId === query.traceId);
    }
    if (query.spanId) {
      results = results.filter((e) => e.spanId === query.spanId);
    }
    if (query.requestId) {
      results = results.filter((e) => e.requestId === query.requestId);
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter(
        (e) => e.tags && query.tags.some((t) => e.tags.includes(t))
      );
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        (e) => e.message.toLowerCase().includes(searchLower) || JSON.stringify(e.data).toLowerCase().includes(searchLower)
      );
    }
    results.sort(
      (a, b) => query.sort === "asc" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );
    return results.slice(query.offset, query.offset + query.limit);
  }
};
var HttpTransport = class {
  type = "http";
  level;
  url;
  headers;
  batch = [];
  batchSize;
  batchInterval;
  intervalId;
  constructor(config) {
    this.level = config.level;
    this.url = config.url;
    this.headers = config.headers ?? {};
    this.batchSize = config.batch?.size ?? 100;
    this.batchInterval = config.batch?.interval ?? 5e3;
    this.intervalId = setInterval(() => this.flush(), this.batchInterval);
  }
  async log(entry) {
    this.batch.push(entry);
    if (this.batch.length >= this.batchSize) {
      await this.flush();
    }
  }
  async flush() {
    if (this.batch.length === 0) return;
    const toSend = [...this.batch];
    this.batch = [];
    try {
      console.log(`[HTTP Transport] Would send ${toSend.length} logs to ${this.url}`);
    } catch (error) {
      this.batch = [...toSend, ...this.batch];
      throw error;
    }
  }
  async close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    await this.flush();
  }
};
var Logger2 = class _Logger {
  name;
  aggregator;
  context;
  constructor(aggregator, name, context = {}) {
    this.aggregator = aggregator;
    this.name = name;
    this.context = context;
  }
  child(name, context = {}) {
    return new _Logger(
      this.aggregator,
      `${this.name}.${name}`,
      { ...this.context, ...context }
    );
  }
  with(context) {
    return new _Logger(this.aggregator, this.name, { ...this.context, ...context });
  }
  trace(message, data) {
    this.log("trace", message, data);
  }
  debug(message, data) {
    this.log("debug", message, data);
  }
  info(message, data) {
    this.log("info", message, data);
  }
  warn(message, data) {
    this.log("warn", message, data);
  }
  error(message, error, data) {
    if (error instanceof Error) {
      this.log("error", message, data, error);
    } else {
      this.log("error", message, error);
    }
  }
  fatal(message, error, data) {
    if (error instanceof Error) {
      this.log("fatal", message, data, error);
    } else {
      this.log("fatal", message, error);
    }
  }
  log(level, message, data, error) {
    this.aggregator.log({
      level,
      message,
      logger: this.name,
      data: { ...this.context, ...data },
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : void 0
    });
  }
};
var LogAggregator = class extends EventEmitter18 {
  config;
  transports = [];
  memoryTransport;
  buffer = [];
  bufferInterval;
  contextData = {};
  constructor(config) {
    super();
    this.config = LogAggregatorConfigSchema.parse(config);
    this.initializeTransports();
    if (this.config.context?.includeHostname) {
      this.contextData.hostname = hostname();
    }
    if (this.config.context?.includePid) {
      this.contextData.pid = process.pid;
    }
    if (this.config.buffer?.enabled) {
      this.bufferInterval = setInterval(
        () => this.flushBuffer(),
        this.config.buffer.flushInterval
      );
    }
    this.emit("initialized");
  }
  initializeTransports() {
    for (const config of this.config.transports) {
      switch (config.type) {
        case "console":
          this.transports.push(new ConsoleTransport(config));
          break;
        case "memory":
          this.memoryTransport = new MemoryTransport(config);
          this.transports.push(this.memoryTransport);
          break;
        case "http":
          this.transports.push(new HttpTransport(config));
          break;
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------
  log(entry) {
    const fullEntry = {
      timestamp: entry.timestamp ?? Date.now(),
      level: entry.level,
      message: entry.message,
      logger: entry.logger,
      service: this.config.service,
      version: this.config.version,
      environment: this.config.environment,
      hostname: this.contextData.hostname,
      pid: this.contextData.pid,
      traceId: entry.traceId ?? this.contextData.traceId,
      spanId: entry.spanId ?? this.contextData.spanId,
      requestId: entry.requestId ?? this.contextData.requestId,
      data: entry.data,
      error: entry.error,
      tags: entry.tags
    };
    if (LOG_LEVEL_VALUES[fullEntry.level] < LOG_LEVEL_VALUES[this.config.level]) {
      return;
    }
    if (this.config.filter && !this.passesFilter(fullEntry)) {
      this.emit("filtered", fullEntry, "filter");
      return;
    }
    if (this.config.sampling?.enabled) {
      if (!this.passesSampling(fullEntry)) {
        this.emit("sampled", fullEntry, this.config.sampling.rate);
        return;
      }
    }
    if (this.config.redaction?.enabled) {
      this.applyRedaction(fullEntry);
    }
    if (this.config.buffer?.enabled) {
      this.buffer.push(fullEntry);
      if (this.buffer.length >= this.config.buffer.size) {
        this.flushBuffer();
      }
    } else {
      this.sendToTransports(fullEntry);
    }
    this.emit("logged", fullEntry);
  }
  // Convenience methods
  trace(message, data) {
    this.log({ level: "trace", message, data });
  }
  debug(message, data) {
    this.log({ level: "debug", message, data });
  }
  info(message, data) {
    this.log({ level: "info", message, data });
  }
  warn(message, data) {
    this.log({ level: "warn", message, data });
  }
  error(message, error, data) {
    this.log({
      level: "error",
      message,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : void 0
    });
  }
  fatal(message, error, data) {
    this.log({
      level: "fatal",
      message,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : void 0
    });
  }
  // ---------------------------------------------------------------------------
  // Logger Factory
  // ---------------------------------------------------------------------------
  getLogger(name, context = {}) {
    return new Logger2(this, name, context);
  }
  // ---------------------------------------------------------------------------
  // Context
  // ---------------------------------------------------------------------------
  setTraceContext(traceId, spanId) {
    this.contextData.traceId = traceId;
    this.contextData.spanId = spanId;
  }
  setRequestId(requestId) {
    this.contextData.requestId = requestId;
  }
  clearContext() {
    delete this.contextData.traceId;
    delete this.contextData.spanId;
    delete this.contextData.requestId;
  }
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------
  query(query) {
    if (!this.memoryTransport) {
      throw new Error("Memory transport not configured for querying");
    }
    return this.memoryTransport.query(query);
  }
  getStats() {
    if (!this.memoryTransport) {
      throw new Error("Memory transport not configured for stats");
    }
    const entries = this.memoryTransport.getEntries();
    const byLevel = {
      trace: 0,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };
    const byLogger = {};
    const byHour = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      byLevel[entry.level]++;
      if (entry.logger) {
        byLogger[entry.logger] = (byLogger[entry.logger] ?? 0) + 1;
      }
      const hour = new Date(entry.timestamp).toISOString().slice(0, 13);
      byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
    }
    const errorCount = byLevel.error + byLevel.fatal;
    const errorRate = entries.length > 0 ? errorCount / entries.length : 0;
    const timeRange = entries.length > 1 ? (entries[entries.length - 1].timestamp - entries[0].timestamp) / 6e4 : 1;
    const avgEntriesPerMinute = entries.length / Math.max(timeRange, 1);
    return {
      total: entries.length,
      byLevel,
      byLogger,
      byHour: Array.from(byHour.entries()).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour.localeCompare(b.hour)),
      errorRate,
      avgEntriesPerMinute
    };
  }
  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------
  passesFilter(entry) {
    const filter = this.config.filter;
    if (filter.levels && filter.levels.length > 0) {
      if (!filter.levels.includes(entry.level)) return false;
    }
    if (filter.loggers && filter.loggers.length > 0) {
      if (!entry.logger || !filter.loggers.some(
        (l) => entry.logger.startsWith(l) || l === "*"
      )) return false;
    }
    if (filter.tags && filter.tags.length > 0) {
      if (!entry.tags || !filter.tags.some((t) => entry.tags.includes(t))) return false;
    }
    if (filter.pattern) {
      const regex = new RegExp(filter.pattern);
      if (!regex.test(entry.message)) return false;
    }
    if (filter.exclude) {
      if (filter.exclude.levels?.includes(entry.level)) return false;
      if (filter.exclude.loggers && entry.logger) {
        if (filter.exclude.loggers.some(
          (l) => entry.logger.startsWith(l) || l === "*"
        )) return false;
      }
      if (filter.exclude.tags && entry.tags) {
        if (filter.exclude.tags.some((t) => entry.tags.includes(t))) return false;
      }
      if (filter.exclude.pattern) {
        const regex = new RegExp(filter.exclude.pattern);
        if (regex.test(entry.message)) return false;
      }
    }
    return true;
  }
  passesSampling(entry) {
    const sampling = this.config.sampling;
    if (sampling.rules) {
      for (const rule of sampling.rules) {
        if (this.matchesFilter(entry, rule.match)) {
          return Math.random() < rule.rate;
        }
      }
    }
    return Math.random() < sampling.rate;
  }
  matchesFilter(entry, filter) {
    if (!filter) return true;
    if (filter.levels?.length && !filter.levels.includes(entry.level)) return false;
    if (filter.loggers?.length && (!entry.logger || !filter.loggers.includes(entry.logger))) return false;
    if (filter.tags?.length && (!entry.tags || !filter.tags.some((t) => entry.tags.includes(t)))) return false;
    if (filter.pattern && !new RegExp(filter.pattern).test(entry.message)) return false;
    return true;
  }
  applyRedaction(entry) {
    const redaction = this.config.redaction;
    const redactedFields = [];
    const redactValue = (value) => {
      if (redaction.hash) {
        return createHash2("sha256").update(value).digest("hex").slice(0, 8);
      }
      return redaction.replacement;
    };
    const redactObject = (obj, path = "") => {
      for (const key of Object.keys(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();
        if (redaction.fields.some((f) => lowerKey.includes(f.toLowerCase()))) {
          if (typeof obj[key] === "string") {
            obj[key] = redactValue(obj[key]);
            redactedFields.push(fullPath);
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          redactObject(obj[key], fullPath);
        }
      }
    };
    if (entry.data) {
      redactObject(entry.data);
    }
    if (redaction.patterns) {
      for (const pattern of redaction.patterns) {
        const regex = new RegExp(pattern, "g");
        if (regex.test(entry.message)) {
          entry.message = entry.message.replace(regex, redaction.replacement);
          redactedFields.push("message");
        }
      }
    }
    if (redactedFields.length > 0) {
      this.emit("redacted", entry, redactedFields);
    }
  }
  sendToTransports(entry) {
    for (const transport of this.transports) {
      if (LOG_LEVEL_VALUES[entry.level] >= LOG_LEVEL_VALUES[transport.level]) {
        transport.log(entry).catch((error) => {
          this.emit("transportError", transport.type, error);
        });
      }
    }
  }
  flushBuffer() {
    if (this.buffer.length === 0) return;
    const entries = [...this.buffer];
    this.buffer = [];
    for (const entry of entries) {
      this.sendToTransports(entry);
    }
    this.emit("bufferFlushed", entries.length);
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async flush() {
    this.flushBuffer();
    await Promise.all(
      this.transports.filter((t) => t.flush).map((t) => t.flush())
    );
  }
  async shutdown() {
    if (this.bufferInterval) {
      clearInterval(this.bufferInterval);
    }
    await this.flush();
    await Promise.all(
      this.transports.filter((t) => t.close).map((t) => t.close())
    );
    this.emit("shutdown");
    this.removeAllListeners();
  }
};
var defaultAggregator = null;
function getLogAggregator() {
  if (!defaultAggregator) {
    throw new Error("Log Aggregator not initialized. Call createLogAggregator first.");
  }
  return defaultAggregator;
}
function createLogAggregator(config) {
  const aggregator = new LogAggregator(config);
  if (!defaultAggregator) {
    defaultAggregator = aggregator;
  }
  return aggregator;
}

// src/metrics/types.ts
import { z as z17 } from "zod";
var MetricKindSchema = z17.enum([
  "counter",
  "gauge",
  "histogram",
  "summary"
]);
var LabelSchema = z17.record(z17.string());
var MetricValueSchema = z17.object({
  value: z17.number(),
  timestamp: z17.number().optional(),
  labels: LabelSchema.default({})
});
var HistogramValueSchema = z17.object({
  buckets: z17.record(z17.string(), z17.number()).describe("Bucket boundaries to counts"),
  sum: z17.number(),
  count: z17.number(),
  labels: LabelSchema.default({}),
  timestamp: z17.number().optional()
});
var SummaryValueSchema = z17.object({
  quantiles: z17.record(z17.string(), z17.number()).describe("Quantile to value"),
  sum: z17.number(),
  count: z17.number(),
  labels: LabelSchema.default({}),
  timestamp: z17.number().optional()
});
var MetricDefSchema = z17.object({
  name: z17.string().regex(/^[a-zA-Z_:][a-zA-Z0-9_:]*$/),
  kind: MetricKindSchema,
  help: z17.string(),
  unit: z17.string().optional(),
  labelNames: z17.array(z17.string()).default([]),
  buckets: z17.array(z17.number()).optional().describe("For histograms"),
  quantiles: z17.array(z17.number()).optional().describe("For summaries"),
  maxAge: z17.number().optional().describe("For summaries - window in ms")
});
var MetricSampleSchema = z17.object({
  name: z17.string(),
  kind: MetricKindSchema,
  help: z17.string(),
  unit: z17.string().optional(),
  values: z17.array(z17.union([
    MetricValueSchema,
    HistogramValueSchema,
    SummaryValueSchema
  ]))
});
var CollectorConfigSchema = z17.object({
  name: z17.string(),
  collect: z17.function().args().returns(z17.promise(z17.array(MetricSampleSchema)))
});
var ExportFormatSchema = z17.enum([
  "prometheus",
  "openmetrics",
  "json",
  "statsd"
]);
var PushGatewayConfigSchema = z17.object({
  url: z17.string().url(),
  job: z17.string(),
  instance: z17.string().optional(),
  auth: z17.object({
    type: z17.enum(["basic", "bearer"]),
    username: z17.string().optional(),
    password: z17.string().optional(),
    token: z17.string().optional()
  }).optional(),
  pushInterval: z17.number().default(15e3),
  groupings: z17.record(z17.string()).optional()
});
var MetricsRegistryConfigSchema = z17.object({
  prefix: z17.string().optional(),
  defaultLabels: LabelSchema.default({}),
  enableDefaultMetrics: z17.boolean().default(true),
  defaultMetricsInterval: z17.number().default(1e4),
  pushGateway: PushGatewayConfigSchema.optional(),
  buckets: z17.object({
    http: z17.array(z17.number()).default([5e-3, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]),
    default: z17.array(z17.number()).default([5e-3, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10])
  }).optional(),
  quantiles: z17.array(z17.number()).default([0.5, 0.9, 0.95, 0.99])
});
var AggregationTypeSchema = z17.enum([
  "sum",
  "avg",
  "min",
  "max",
  "count",
  "rate",
  "increase"
]);
var AggregationConfigSchema = z17.object({
  type: AggregationTypeSchema,
  interval: z17.number().optional().describe("For rate/increase"),
  labels: z17.array(z17.string()).optional().describe("Group by labels")
});
var MetricsQuerySchema = z17.object({
  name: z17.string(),
  labels: LabelSchema.optional(),
  start: z17.number().optional(),
  end: z17.number().optional(),
  step: z17.number().optional(),
  aggregation: AggregationConfigSchema.optional()
});
var TimeSeriesPointSchema2 = z17.object({
  timestamp: z17.number(),
  value: z17.number()
});
var TimeSeriesSchema2 = z17.object({
  metric: z17.string(),
  labels: LabelSchema,
  points: z17.array(TimeSeriesPointSchema2)
});
var DEFAULT_METRICS = [
  {
    name: "process_cpu_seconds_total",
    kind: "counter",
    help: "Total user and system CPU time spent in seconds"
  },
  {
    name: "process_resident_memory_bytes",
    kind: "gauge",
    help: "Resident memory size in bytes"
  },
  {
    name: "process_heap_bytes",
    kind: "gauge",
    help: "Process heap size in bytes"
  },
  {
    name: "process_open_fds",
    kind: "gauge",
    help: "Number of open file descriptors"
  },
  {
    name: "process_start_time_seconds",
    kind: "gauge",
    help: "Start time of the process since unix epoch in seconds"
  },
  {
    name: "nodejs_eventloop_lag_seconds",
    kind: "gauge",
    help: "Lag of event loop in seconds"
  },
  {
    name: "nodejs_active_handles_total",
    kind: "gauge",
    help: "Number of active handles"
  },
  {
    name: "nodejs_active_requests_total",
    kind: "gauge",
    help: "Number of active requests"
  },
  {
    name: "nodejs_heap_size_total_bytes",
    kind: "gauge",
    help: "Process heap size from Node.js in bytes"
  },
  {
    name: "nodejs_heap_size_used_bytes",
    kind: "gauge",
    help: "Process heap size used from Node.js in bytes"
  },
  {
    name: "nodejs_external_memory_bytes",
    kind: "gauge",
    help: "Node.js external memory size in bytes"
  },
  {
    name: "nodejs_gc_duration_seconds",
    kind: "histogram",
    help: "Garbage collection duration",
    labelNames: ["gc_type"],
    buckets: [1e-3, 0.01, 0.1, 1, 2, 5]
  }
];
var HTTP_METRICS = [
  {
    name: "http_requests_total",
    kind: "counter",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
  },
  {
    name: "http_request_duration_seconds",
    kind: "histogram",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [5e-3, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  },
  {
    name: "http_request_size_bytes",
    kind: "histogram",
    help: "HTTP request size in bytes",
    labelNames: ["method", "route"],
    buckets: [100, 1e3, 1e4, 1e5, 1e6]
  },
  {
    name: "http_response_size_bytes",
    kind: "histogram",
    help: "HTTP response size in bytes",
    labelNames: ["method", "route"],
    buckets: [100, 1e3, 1e4, 1e5, 1e6]
  },
  {
    name: "http_requests_in_flight",
    kind: "gauge",
    help: "Number of HTTP requests currently in flight",
    labelNames: ["method"]
  }
];
var DB_METRICS = [
  {
    name: "db_queries_total",
    kind: "counter",
    help: "Total number of database queries",
    labelNames: ["operation", "table", "status"]
  },
  {
    name: "db_query_duration_seconds",
    kind: "histogram",
    help: "Database query duration in seconds",
    labelNames: ["operation", "table"],
    buckets: [1e-3, 5e-3, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
  },
  {
    name: "db_connections_total",
    kind: "gauge",
    help: "Number of database connections",
    labelNames: ["state"]
  }
];
var CACHE_METRICS = [
  {
    name: "cache_hits_total",
    kind: "counter",
    help: "Total number of cache hits",
    labelNames: ["cache"]
  },
  {
    name: "cache_misses_total",
    kind: "counter",
    help: "Total number of cache misses",
    labelNames: ["cache"]
  },
  {
    name: "cache_size_bytes",
    kind: "gauge",
    help: "Current size of cache in bytes",
    labelNames: ["cache"]
  },
  {
    name: "cache_items_total",
    kind: "gauge",
    help: "Number of items in cache",
    labelNames: ["cache"]
  }
];

// src/metrics/metrics-registry.ts
import { EventEmitter as EventEmitter19 } from "eventemitter3";
function labelHash(labels) {
  return Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}="${v}"`).join(",");
}
var Counter2 = class {
  constructor(registry, def) {
    this.registry = registry;
    this.def = def;
  }
  values = /* @__PURE__ */ new Map();
  inc(labels = {}, value = 1) {
    if (value < 0) {
      throw new Error("Counter value cannot be negative");
    }
    const hash = labelHash(labels);
    const current = this.values.get(hash) ?? 0;
    this.values.set(hash, current + value);
    this.registry["emit"]("metricUpdated", this.def.name, labels, current + value);
  }
  get(labels = {}) {
    return this.values.get(labelHash(labels)) ?? 0;
  }
  reset() {
    this.values.clear();
  }
  collect() {
    const result = [];
    for (const [hash, value] of this.values) {
      const labels = this.parseLabels(hash);
      result.push({ value, labels, timestamp: Date.now() });
    }
    return result;
  }
  parseLabels(hash) {
    if (!hash) return {};
    const labels = {};
    for (const pair of hash.split(",")) {
      const match = pair.match(/^([^=]+)="([^"]*)"$/);
      if (match) {
        labels[match[1]] = match[2];
      }
    }
    return labels;
  }
};
var Gauge2 = class {
  constructor(registry, def) {
    this.registry = registry;
    this.def = def;
  }
  values = /* @__PURE__ */ new Map();
  set(labelsOrValue, maybeValue) {
    const labels = typeof labelsOrValue === "object" ? labelsOrValue : {};
    const value = typeof labelsOrValue === "number" ? labelsOrValue : maybeValue;
    const hash = labelHash(labels);
    this.values.set(hash, value);
    this.registry["emit"]("metricUpdated", this.def.name, labels, value);
  }
  inc(labels = {}, value = 1) {
    const hash = labelHash(labels);
    const current = this.values.get(hash) ?? 0;
    this.values.set(hash, current + value);
  }
  dec(labels = {}, value = 1) {
    const hash = labelHash(labels);
    const current = this.values.get(hash) ?? 0;
    this.values.set(hash, current - value);
  }
  get(labels = {}) {
    return this.values.get(labelHash(labels)) ?? 0;
  }
  setToCurrentTime(labels = {}) {
    this.set(labels, Date.now() / 1e3);
  }
  reset() {
    this.values.clear();
  }
  collect() {
    const result = [];
    for (const [hash, value] of this.values) {
      const labels = this.parseLabels(hash);
      result.push({ value, labels, timestamp: Date.now() });
    }
    return result;
  }
  parseLabels(hash) {
    if (!hash) return {};
    const labels = {};
    for (const pair of hash.split(",")) {
      const match = pair.match(/^([^=]+)="([^"]*)"$/);
      if (match) {
        labels[match[1]] = match[2];
      }
    }
    return labels;
  }
};
var Histogram2 = class {
  constructor(registry, def) {
    this.registry = registry;
    this.def = def;
    this.buckets = def.buckets ?? [5e-3, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
  }
  data = /* @__PURE__ */ new Map();
  buckets;
  observe(labelsOrValue, maybeValue) {
    const labels = typeof labelsOrValue === "object" ? labelsOrValue : {};
    const value = typeof labelsOrValue === "number" ? labelsOrValue : maybeValue;
    const hash = labelHash(labels);
    let data = this.data.get(hash);
    if (!data) {
      data = {
        buckets: new Map(this.buckets.map((b) => [b, 0])),
        sum: 0,
        count: 0
      };
      this.data.set(hash, data);
    }
    for (const bucket of this.buckets) {
      if (value <= bucket) {
        data.buckets.set(bucket, (data.buckets.get(bucket) ?? 0) + 1);
      }
    }
    data.sum += value;
    data.count += 1;
    this.registry["emit"]("metricUpdated", this.def.name, labels, value);
  }
  startTimer(labels = {}) {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e9;
      this.observe(labels, duration);
      return duration;
    };
  }
  reset() {
    this.data.clear();
  }
  collect() {
    const result = [];
    for (const [hash, data] of this.data) {
      const labels = this.parseLabels(hash);
      const buckets = {};
      let total = 0;
      for (const [boundary, count] of data.buckets) {
        total += count;
        buckets[String(boundary)] = total;
      }
      buckets["+Inf"] = data.count;
      result.push({
        buckets,
        sum: data.sum,
        count: data.count,
        labels,
        timestamp: Date.now()
      });
    }
    return result;
  }
  parseLabels(hash) {
    if (!hash) return {};
    const labels = {};
    for (const pair of hash.split(",")) {
      const match = pair.match(/^([^=]+)="([^"]*)"$/);
      if (match) {
        labels[match[1]] = match[2];
      }
    }
    return labels;
  }
};
var Summary = class {
  constructor(registry, def) {
    this.registry = registry;
    this.def = def;
    this.quantiles = def.quantiles ?? [0.5, 0.9, 0.95, 0.99];
    this.maxAge = def.maxAge ?? 6e5;
  }
  data = /* @__PURE__ */ new Map();
  quantiles;
  maxAge;
  observe(labelsOrValue, maybeValue) {
    const labels = typeof labelsOrValue === "object" ? labelsOrValue : {};
    const value = typeof labelsOrValue === "number" ? labelsOrValue : maybeValue;
    const hash = labelHash(labels);
    let data = this.data.get(hash);
    if (!data) {
      data = { values: [], sum: 0, count: 0 };
      this.data.set(hash, data);
    }
    data.values.push(value);
    data.sum += value;
    data.count += 1;
    if (data.values.length > 1e4) {
      data.values = data.values.slice(-5e3);
    }
    this.registry["emit"]("metricUpdated", this.def.name, labels, value);
  }
  startTimer(labels = {}) {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e9;
      this.observe(labels, duration);
      return duration;
    };
  }
  reset() {
    this.data.clear();
  }
  collect() {
    const result = [];
    for (const [hash, data] of this.data) {
      const labels = this.parseLabels(hash);
      const sorted = [...data.values].sort((a, b) => a - b);
      const quantiles = {};
      for (const q of this.quantiles) {
        const index = Math.floor(q * sorted.length);
        quantiles[String(q)] = sorted[index] ?? 0;
      }
      result.push({
        quantiles,
        sum: data.sum,
        count: data.count,
        labels,
        timestamp: Date.now()
      });
    }
    return result;
  }
  parseLabels(hash) {
    if (!hash) return {};
    const labels = {};
    for (const pair of hash.split(",")) {
      const match = pair.match(/^([^=]+)="([^"]*)"$/);
      if (match) {
        labels[match[1]] = match[2];
      }
    }
    return labels;
  }
};
var MetricsRegistry = class extends EventEmitter19 {
  config;
  metrics = /* @__PURE__ */ new Map();
  definitions = /* @__PURE__ */ new Map();
  collectors = [];
  defaultMetricsInterval;
  pushInterval;
  timeSeries = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    super();
    this.config = MetricsRegistryConfigSchema.parse(config);
    if (this.config.enableDefaultMetrics) {
      for (const def of DEFAULT_METRICS) {
        this.registerMetric(def);
      }
      this.startDefaultMetrics();
    }
    if (this.config.pushGateway) {
      this.startPushGateway();
    }
  }
  // ---------------------------------------------------------------------------
  // Metric Registration
  // ---------------------------------------------------------------------------
  registerMetric(def) {
    const name = this.prefixName(def.name);
    const fullDef = { ...def, name };
    if (this.metrics.has(name)) {
      throw new Error(`Metric '${name}' already registered`);
    }
    let metric;
    switch (def.kind) {
      case "counter":
        metric = new Counter2(this, fullDef);
        break;
      case "gauge":
        metric = new Gauge2(this, fullDef);
        break;
      case "histogram":
        metric = new Histogram2(this, fullDef);
        break;
      case "summary":
        metric = new Summary(this, fullDef);
        break;
    }
    this.metrics.set(name, metric);
    this.definitions.set(name, fullDef);
    this.emit("metricRegistered", fullDef);
    return metric;
  }
  counter(name, help, labelNames = []) {
    return this.registerMetric({
      name,
      kind: "counter",
      help,
      labelNames
    });
  }
  gauge(name, help, labelNames = []) {
    return this.registerMetric({
      name,
      kind: "gauge",
      help,
      labelNames
    });
  }
  histogram(name, help, labelNames = [], buckets) {
    return this.registerMetric({
      name,
      kind: "histogram",
      help,
      labelNames,
      buckets: buckets ?? this.config.buckets?.default
    });
  }
  summary(name, help, labelNames = [], quantiles) {
    return this.registerMetric({
      name,
      kind: "summary",
      help,
      labelNames,
      quantiles: quantiles ?? this.config.quantiles
    });
  }
  // ---------------------------------------------------------------------------
  // Metric Access
  // ---------------------------------------------------------------------------
  getMetric(name) {
    return this.metrics.get(this.prefixName(name));
  }
  removeMetric(name) {
    const fullName = this.prefixName(name);
    if (this.metrics.has(fullName)) {
      this.metrics.delete(fullName);
      this.definitions.delete(fullName);
      this.emit("metricRemoved", fullName);
      return true;
    }
    return false;
  }
  resetMetrics() {
    for (const metric of this.metrics.values()) {
      metric.reset();
    }
  }
  // ---------------------------------------------------------------------------
  // Collectors
  // ---------------------------------------------------------------------------
  registerCollector(name, collect) {
    this.collectors.push({ name, collect });
  }
  removeCollector(name) {
    const index = this.collectors.findIndex((c) => c.name === name);
    if (index >= 0) {
      this.collectors.splice(index, 1);
      return true;
    }
    return false;
  }
  // ---------------------------------------------------------------------------
  // Collection
  // ---------------------------------------------------------------------------
  async collect() {
    this.emit("collectionStarted");
    const samples = [];
    for (const [name, metric] of this.metrics) {
      const def = this.definitions.get(name);
      const values = metric.collect();
      for (const value of values) {
        value.labels = { ...this.config.defaultLabels, ...value.labels };
      }
      samples.push({
        name,
        kind: def.kind,
        help: def.help,
        unit: def.unit,
        values
      });
    }
    for (const collector of this.collectors) {
      try {
        const collectorSamples = await collector.collect();
        samples.push(...collectorSamples);
      } catch (error) {
        this.emit("error", error);
      }
    }
    this.emit("collectionCompleted", samples);
    return samples;
  }
  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  async export(format = "prometheus") {
    const samples = await this.collect();
    switch (format) {
      case "prometheus":
      case "openmetrics":
        return this.formatPrometheus(samples, format === "openmetrics");
      case "json":
        return JSON.stringify(samples, null, 2);
      case "statsd":
        return this.formatStatsd(samples);
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }
  formatPrometheus(samples, openMetrics) {
    const lines = [];
    for (const sample of samples) {
      lines.push(`# HELP ${sample.name} ${sample.help}`);
      lines.push(`# TYPE ${sample.name} ${sample.kind}`);
      if (sample.unit && openMetrics) {
        lines.push(`# UNIT ${sample.name} ${sample.unit}`);
      }
      for (const value of sample.values) {
        if ("buckets" in value) {
          const hv = value;
          const labelsStr = this.formatLabels(hv.labels);
          for (const [le, count] of Object.entries(hv.buckets)) {
            const bucketLabels = labelsStr ? `{${labelsStr},le="${le}"}` : `{le="${le}"}`;
            lines.push(`${sample.name}_bucket${bucketLabels} ${count}`);
          }
          const baseLabels = labelsStr ? `{${labelsStr}}` : "";
          lines.push(`${sample.name}_sum${baseLabels} ${hv.sum}`);
          lines.push(`${sample.name}_count${baseLabels} ${hv.count}`);
        } else if ("quantiles" in value) {
          const sv = value;
          const labelsStr = this.formatLabels(sv.labels);
          for (const [q, v] of Object.entries(sv.quantiles)) {
            const quantileLabels = labelsStr ? `{${labelsStr},quantile="${q}"}` : `{quantile="${q}"}`;
            lines.push(`${sample.name}${quantileLabels} ${v}`);
          }
          const baseLabels = labelsStr ? `{${labelsStr}}` : "";
          lines.push(`${sample.name}_sum${baseLabels} ${sv.sum}`);
          lines.push(`${sample.name}_count${baseLabels} ${sv.count}`);
        } else {
          const mv = value;
          const labelsStr = this.formatLabels(mv.labels);
          const labelPart = labelsStr ? `{${labelsStr}}` : "";
          lines.push(`${sample.name}${labelPart} ${mv.value}`);
        }
      }
      lines.push("");
    }
    if (openMetrics) {
      lines.push("# EOF");
    }
    return lines.join("\n");
  }
  formatStatsd(samples) {
    const lines = [];
    for (const sample of samples) {
      for (const value of sample.values) {
        const tags = Object.entries(value.labels).map(([k, v]) => `${k}:${v}`).join(",");
        const tagPart = tags ? `|#${tags}` : "";
        if ("buckets" in value || "quantiles" in value) {
          continue;
        }
        const mv = value;
        const type = sample.kind === "counter" ? "c" : "g";
        lines.push(`${sample.name}:${mv.value}|${type}${tagPart}`);
      }
    }
    return lines.join("\n");
  }
  formatLabels(labels) {
    return Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(",");
  }
  // ---------------------------------------------------------------------------
  // Default Metrics
  // ---------------------------------------------------------------------------
  startDefaultMetrics() {
    const collectDefaultMetrics = () => {
      const memUsage = process.memoryUsage();
      const residentMem = this.getMetric("process_resident_memory_bytes");
      if (residentMem) residentMem.set(memUsage.rss);
      const heapTotal = this.getMetric("nodejs_heap_size_total_bytes");
      if (heapTotal) heapTotal.set(memUsage.heapTotal);
      const heapUsed = this.getMetric("nodejs_heap_size_used_bytes");
      if (heapUsed) heapUsed.set(memUsage.heapUsed);
      const external = this.getMetric("nodejs_external_memory_bytes");
      if (external) external.set(memUsage.external);
      const heapBytes = this.getMetric("process_heap_bytes");
      if (heapBytes) heapBytes.set(memUsage.heapUsed);
      const startTime = this.getMetric("process_start_time_seconds");
      if (startTime) startTime.set(Date.now() / 1e3 - process.uptime());
    };
    collectDefaultMetrics();
    this.defaultMetricsInterval = setInterval(
      collectDefaultMetrics,
      this.config.defaultMetricsInterval
    );
  }
  // ---------------------------------------------------------------------------
  // Push Gateway
  // ---------------------------------------------------------------------------
  startPushGateway() {
    const push = async () => {
      this.emit("pushStarted");
      try {
        const metrics = await this.export("prometheus");
        console.log(`[Push Gateway] Would push metrics to ${this.config.pushGateway.url}`);
        this.emit("pushCompleted", true);
      } catch (error) {
        this.emit("pushError", error);
        this.emit("pushCompleted", false);
      }
    };
    this.pushInterval = setInterval(push, this.config.pushGateway.pushInterval);
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  prefixName(name) {
    if (this.config.prefix && !name.startsWith(this.config.prefix)) {
      return `${this.config.prefix}_${name}`;
    }
    return name;
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async shutdown() {
    if (this.defaultMetricsInterval) {
      clearInterval(this.defaultMetricsInterval);
    }
    if (this.pushInterval) {
      clearInterval(this.pushInterval);
    }
    this.removeAllListeners();
  }
};
var defaultRegistry2 = null;
function getMetricsRegistry() {
  if (!defaultRegistry2) {
    defaultRegistry2 = new MetricsRegistry();
  }
  return defaultRegistry2;
}
function createMetricsRegistry(config = {}) {
  const registry = new MetricsRegistry(config);
  if (!defaultRegistry2) {
    defaultRegistry2 = registry;
  }
  return registry;
}

// src/slo/types.ts
import { z as z18 } from "zod";
var SLITypeSchema = z18.enum([
  "availability",
  // Percentage of successful requests
  "latency",
  // Response time percentiles
  "throughput",
  // Requests per second
  "error_rate",
  // Percentage of errors
  "saturation",
  // Resource utilization
  "freshness",
  // Data freshness/staleness
  "correctness",
  // Data accuracy
  "coverage",
  // Feature/data coverage
  "durability"
  // Data durability
]);
var SLIMetricSourceSchema = z18.enum([
  "prometheus",
  "custom",
  "logs",
  "traces",
  "synthetic"
]);
var SLIConfigSchema = z18.object({
  type: SLITypeSchema,
  name: z18.string(),
  description: z18.string().optional(),
  source: SLIMetricSourceSchema.default("prometheus"),
  // Metric query configuration
  metric: z18.object({
    good: z18.string().describe("Query for good events"),
    total: z18.string().describe("Query for total events"),
    // Alternative: ratio-based
    ratio: z18.string().optional().describe("Direct ratio query")
  }),
  // Latency-specific config
  latencyThreshold: z18.number().optional().describe("Threshold in ms for latency SLIs"),
  latencyPercentile: z18.number().optional().describe("Percentile (e.g., 99 for p99)"),
  // Filters
  filters: z18.record(z18.string()).optional()
});
var SLIMeasurementSchema = z18.object({
  timestamp: z18.number(),
  good: z18.number(),
  total: z18.number(),
  value: z18.number().describe("SLI value (0-1 or percentage)")
});
var SLOWindowTypeSchema = z18.enum([
  "rolling",
  // Rolling window (e.g., last 30 days)
  "calendar"
  // Calendar-aligned (e.g., monthly)
]);
var SLOWindowSchema = z18.object({
  type: SLOWindowTypeSchema,
  duration: z18.number().describe("Window duration in seconds"),
  // Calendar-specific
  calendarUnit: z18.enum(["day", "week", "month", "quarter"]).optional()
});
var SLOTargetSchema = z18.object({
  value: z18.number().min(0).max(100).describe("Target percentage (e.g., 99.9)"),
  // Multi-window targets
  windows: z18.array(z18.object({
    window: SLOWindowSchema,
    target: z18.number().min(0).max(100)
  })).optional()
});
var SLOStatusSchema = z18.enum([
  "healthy",
  // Within budget
  "warning",
  // Budget running low
  "critical",
  // Budget nearly exhausted
  "breached",
  // SLO violated
  "unknown"
  // Insufficient data
]);
var SLODefinitionSchema = z18.object({
  id: z18.string(),
  name: z18.string(),
  description: z18.string().optional(),
  service: z18.string(),
  team: z18.string().optional(),
  // SLI configuration
  sli: SLIConfigSchema,
  // Target
  target: SLOTargetSchema,
  // Window
  window: SLOWindowSchema,
  // Alert thresholds
  alertThresholds: z18.object({
    warning: z18.number().default(50).describe("Warning when budget < X%"),
    critical: z18.number().default(20).describe("Critical when budget < X%")
  }).optional(),
  // Metadata
  tags: z18.array(z18.string()).default([]),
  metadata: z18.record(z18.unknown()).optional(),
  createdAt: z18.number(),
  updatedAt: z18.number(),
  enabled: z18.boolean().default(true)
});
var ErrorBudgetSchema = z18.object({
  sloId: z18.string(),
  windowStart: z18.number(),
  windowEnd: z18.number(),
  // Budget calculations
  total: z18.number().describe("Total error budget (events or percentage)"),
  consumed: z18.number().describe("Consumed error budget"),
  remaining: z18.number().describe("Remaining error budget"),
  remainingPercent: z18.number().describe("Remaining budget as percentage"),
  // Burn rate
  burnRate: z18.number().describe("Current burn rate (1 = normal, 2 = 2x burn)"),
  burnRateTrend: z18.enum(["increasing", "stable", "decreasing"]),
  // Projections
  projectedExhaustion: z18.number().optional().describe("Timestamp when budget exhausts"),
  daysRemaining: z18.number().optional().describe("Days until budget exhausts")
});
var BurnRateAlertSchema = z18.object({
  id: z18.string(),
  sloId: z18.string(),
  name: z18.string(),
  // Multi-window burn rate alerting
  shortWindow: z18.object({
    duration: z18.number().describe("Short window in seconds (e.g., 5m)"),
    burnRateThreshold: z18.number().describe("Burn rate threshold")
  }),
  longWindow: z18.object({
    duration: z18.number().describe("Long window in seconds (e.g., 1h)"),
    burnRateThreshold: z18.number().describe("Burn rate threshold")
  }),
  // Page severity
  severity: z18.enum(["page", "ticket", "log"]),
  enabled: z18.boolean().default(true)
});
var SLOStateSchema = z18.object({
  sloId: z18.string(),
  status: SLOStatusSchema,
  currentValue: z18.number().describe("Current SLI value"),
  targetValue: z18.number().describe("Target SLI value"),
  // Error budget
  errorBudget: ErrorBudgetSchema,
  // Time range
  windowStart: z18.number(),
  windowEnd: z18.number(),
  // Measurements
  totalGood: z18.number(),
  totalEvents: z18.number(),
  // Last update
  lastMeasurement: z18.number(),
  measurementCount: z18.number()
});
var SLOHistoryEntrySchema = z18.object({
  timestamp: z18.number(),
  sloId: z18.string(),
  value: z18.number(),
  target: z18.number(),
  status: SLOStatusSchema,
  errorBudgetRemaining: z18.number(),
  burnRate: z18.number()
});
var SLOReportPeriodSchema = z18.enum([
  "day",
  "week",
  "month",
  "quarter",
  "year",
  "custom"
]);
var SLOReportSchema = z18.object({
  sloId: z18.string(),
  sloName: z18.string(),
  service: z18.string(),
  period: SLOReportPeriodSchema,
  startTime: z18.number(),
  endTime: z18.number(),
  // Performance
  achievedValue: z18.number(),
  targetValue: z18.number(),
  met: z18.boolean(),
  uptime: z18.number().describe("Percentage of time SLO was met"),
  // Error budget
  budgetTotal: z18.number(),
  budgetConsumed: z18.number(),
  budgetRemaining: z18.number(),
  // Incidents
  incidentCount: z18.number(),
  totalDowntime: z18.number().describe("Total downtime in seconds"),
  mttr: z18.number().optional().describe("Mean time to recovery"),
  // Trends
  trend: z18.enum(["improving", "stable", "degrading"]),
  previousPeriodValue: z18.number().optional(),
  changePercent: z18.number().optional()
});
var SLOSummarySchema = z18.object({
  totalSLOs: z18.number(),
  healthy: z18.number(),
  warning: z18.number(),
  critical: z18.number(),
  breached: z18.number(),
  unknown: z18.number(),
  overallHealth: z18.number().describe("Percentage of healthy SLOs"),
  avgErrorBudgetRemaining: z18.number()
});
var SLOAlertTypeSchema = z18.enum([
  "budget_warning",
  // Budget below warning threshold
  "budget_critical",
  // Budget below critical threshold
  "budget_exhausted",
  // Budget fully consumed
  "burn_rate_high",
  // High burn rate detected
  "slo_breached",
  // SLO target missed
  "slo_recovered"
  // SLO recovered from breach
]);
var SLOAlertSchema = z18.object({
  id: z18.string(),
  type: SLOAlertTypeSchema,
  sloId: z18.string(),
  sloName: z18.string(),
  service: z18.string(),
  timestamp: z18.number(),
  severity: z18.enum(["info", "warning", "critical"]),
  // Context
  currentValue: z18.number(),
  targetValue: z18.number(),
  errorBudgetRemaining: z18.number(),
  burnRate: z18.number().optional(),
  // Message
  message: z18.string(),
  details: z18.record(z18.unknown()).optional(),
  // State
  acknowledged: z18.boolean().default(false),
  acknowledgedBy: z18.string().optional(),
  acknowledgedAt: z18.number().optional(),
  resolved: z18.boolean().default(false),
  resolvedAt: z18.number().optional()
});
var SLOManagerConfigSchema = z18.object({
  // Measurement
  measurementInterval: z18.number().default(60).describe("Measurement interval in seconds"),
  retentionDays: z18.number().default(90).describe("History retention in days"),
  // Alerting
  alerting: z18.object({
    enabled: z18.boolean().default(true),
    defaultWarningThreshold: z18.number().default(50),
    defaultCriticalThreshold: z18.number().default(20),
    burnRateAlerts: z18.boolean().default(true)
  }).optional(),
  // Reporting
  reporting: z18.object({
    enabled: z18.boolean().default(true),
    defaultPeriod: SLOReportPeriodSchema.default("week"),
    autoGenerate: z18.boolean().default(false)
  }).optional(),
  // Integrations
  integrations: z18.object({
    prometheus: z18.object({
      url: z18.string(),
      auth: z18.object({
        type: z18.enum(["none", "basic", "bearer"]),
        credentials: z18.string().optional()
      }).optional()
    }).optional(),
    pagerduty: z18.object({
      integrationKey: z18.string()
    }).optional(),
    slack: z18.object({
      webhookUrl: z18.string(),
      channel: z18.string().optional()
    }).optional()
  }).optional()
});
var SLO_PRESETS = {
  // Availability SLOs
  availability_99: {
    sli: {
      type: "availability",
      name: "Availability",
      source: "prometheus",
      metric: {
        good: 'sum(rate(http_requests_total{status!~"5.."}[5m]))',
        total: "sum(rate(http_requests_total[5m]))"
      }
    },
    target: { value: 99 },
    window: { type: "rolling", duration: 30 * 24 * 60 * 60 }
  },
  availability_999: {
    sli: {
      type: "availability",
      name: "High Availability",
      source: "prometheus",
      metric: {
        good: 'sum(rate(http_requests_total{status!~"5.."}[5m]))',
        total: "sum(rate(http_requests_total[5m]))"
      }
    },
    target: { value: 99.9 },
    window: { type: "rolling", duration: 30 * 24 * 60 * 60 }
  },
  // Latency SLOs
  latency_p99_500ms: {
    sli: {
      type: "latency",
      name: "P99 Latency",
      source: "prometheus",
      metric: {
        good: 'sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m]))',
        total: "sum(rate(http_request_duration_seconds_count[5m]))"
      },
      latencyThreshold: 500,
      latencyPercentile: 99
    },
    target: { value: 99 },
    window: { type: "rolling", duration: 7 * 24 * 60 * 60 }
  },
  // Error Rate SLOs
  error_rate_1pct: {
    sli: {
      type: "error_rate",
      name: "Error Rate",
      source: "prometheus",
      metric: {
        good: 'sum(rate(http_requests_total{status!~"5.."}[5m]))',
        total: "sum(rate(http_requests_total[5m]))"
      }
    },
    target: { value: 99 },
    window: { type: "rolling", duration: 7 * 24 * 60 * 60 }
  }
};
var BURN_RATE_PRESETS = {
  // Google SRE book multi-window, multi-burn-rate alerting
  page_1h: {
    name: "1h Page Alert",
    shortWindow: { duration: 5 * 60, burnRateThreshold: 14.4 },
    longWindow: { duration: 60 * 60, burnRateThreshold: 14.4 },
    severity: "page"
  },
  page_6h: {
    name: "6h Page Alert",
    shortWindow: { duration: 30 * 60, burnRateThreshold: 6 },
    longWindow: { duration: 6 * 60 * 60, burnRateThreshold: 6 },
    severity: "page"
  },
  ticket_1d: {
    name: "1d Ticket Alert",
    shortWindow: { duration: 2 * 60 * 60, burnRateThreshold: 3 },
    longWindow: { duration: 24 * 60 * 60, burnRateThreshold: 3 },
    severity: "ticket"
  },
  ticket_3d: {
    name: "3d Ticket Alert",
    shortWindow: { duration: 6 * 60 * 60, burnRateThreshold: 1 },
    longWindow: { duration: 3 * 24 * 60 * 60, burnRateThreshold: 1 },
    severity: "ticket"
  }
};

// src/slo/slo-manager.ts
import { EventEmitter as EventEmitter20 } from "eventemitter3";
import { randomUUID as randomUUID9 } from "crypto";
var InMemorySLOStorage = class {
  slos = /* @__PURE__ */ new Map();
  states = /* @__PURE__ */ new Map();
  history = /* @__PURE__ */ new Map();
  alerts = /* @__PURE__ */ new Map();
  burnRateAlerts = /* @__PURE__ */ new Map();
  async getSLO(id) {
    return this.slos.get(id) ?? null;
  }
  async saveSLO(slo) {
    this.slos.set(slo.id, slo);
  }
  async deleteSLO(id) {
    this.slos.delete(id);
    this.states.delete(id);
    this.history.delete(id);
  }
  async listSLOs(filters) {
    let results = Array.from(this.slos.values());
    if (filters) {
      if (filters.service !== void 0) {
        results = results.filter((s) => s.service === filters.service);
      }
      if (filters.team !== void 0) {
        results = results.filter((s) => s.team === filters.team);
      }
      if (filters.enabled !== void 0) {
        results = results.filter((s) => s.enabled === filters.enabled);
      }
    }
    return results;
  }
  async getState(sloId) {
    return this.states.get(sloId) ?? null;
  }
  async saveState(state) {
    this.states.set(state.sloId, state);
  }
  async addHistoryEntry(entry) {
    const entries = this.history.get(entry.sloId) ?? [];
    entries.push(entry);
    this.history.set(entry.sloId, entries);
  }
  async getHistory(sloId, startTime, endTime) {
    const entries = this.history.get(sloId) ?? [];
    return entries.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);
  }
  async pruneHistory(olderThan) {
    let pruned = 0;
    for (const [sloId, entries] of this.history) {
      const filtered = entries.filter((e) => e.timestamp >= olderThan);
      pruned += entries.length - filtered.length;
      this.history.set(sloId, filtered);
    }
    return pruned;
  }
  async saveAlert(alert) {
    this.alerts.set(alert.id, alert);
  }
  async getAlert(id) {
    return this.alerts.get(id) ?? null;
  }
  async listAlerts(filters) {
    let results = Array.from(this.alerts.values());
    if (filters) {
      if (filters.sloId !== void 0) {
        results = results.filter((a) => a.sloId === filters.sloId);
      }
      if (filters.resolved !== void 0) {
        results = results.filter((a) => a.resolved === filters.resolved);
      }
      if (filters.severity !== void 0) {
        results = results.filter((a) => a.severity === filters.severity);
      }
    }
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }
  async updateAlert(id, updates) {
    const alert = this.alerts.get(id);
    if (alert) {
      this.alerts.set(id, { ...alert, ...updates });
    }
  }
  async saveBurnRateAlert(alert) {
    const alerts = this.burnRateAlerts.get(alert.sloId) ?? [];
    const idx = alerts.findIndex((a) => a.id === alert.id);
    if (idx >= 0) {
      alerts[idx] = alert;
    } else {
      alerts.push(alert);
    }
    this.burnRateAlerts.set(alert.sloId, alerts);
  }
  async getBurnRateAlerts(sloId) {
    return this.burnRateAlerts.get(sloId) ?? [];
  }
  async deleteBurnRateAlert(id) {
    for (const [sloId, alerts] of this.burnRateAlerts) {
      const filtered = alerts.filter((a) => a.id !== id);
      if (filtered.length !== alerts.length) {
        this.burnRateAlerts.set(sloId, filtered);
        break;
      }
    }
  }
};
var CustomMetricProvider = class {
  source = "custom";
  handlers = /* @__PURE__ */ new Map();
  registerQuery(query, handler) {
    this.handlers.set(query, handler);
  }
  async query(query, startTime, endTime) {
    const handler = this.handlers.get(query);
    if (handler) {
      return handler(startTime, endTime);
    }
    return Math.random() * 100;
  }
  async queryRange(query, startTime, endTime, step) {
    const results = [];
    for (let ts = startTime; ts <= endTime; ts += step) {
      results.push({
        timestamp: ts,
        value: await this.query(query, ts - step, ts)
      });
    }
    return results;
  }
};
var SLOManager = class extends EventEmitter20 {
  config;
  storage;
  metricProviders = /* @__PURE__ */ new Map();
  measurementIntervals = /* @__PURE__ */ new Map();
  running = false;
  constructor(config = {}) {
    super();
    this.config = SLOManagerConfigSchema.parse(config);
    this.storage = new InMemorySLOStorage();
    const customProvider = new CustomMetricProvider();
    this.metricProviders.set("custom", customProvider);
  }
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  setStorage(storage) {
    this.storage = storage;
  }
  registerMetricProvider(provider) {
    this.metricProviders.set(provider.source, provider);
  }
  getMetricProvider(source) {
    return this.metricProviders.get(source);
  }
  // ---------------------------------------------------------------------------
  // SLO CRUD
  // ---------------------------------------------------------------------------
  async createSLO(input) {
    const now = Date.now();
    const slo = SLODefinitionSchema.parse({
      ...input,
      id: randomUUID9(),
      createdAt: now,
      updatedAt: now
    });
    await this.storage.saveSLO(slo);
    const initialState = await this.initializeState(slo);
    await this.storage.saveState(initialState);
    if (this.running && slo.enabled) {
      this.startMeasurement(slo);
    }
    this.emit("sloCreated", slo);
    return slo;
  }
  async getSLO(id) {
    return this.storage.getSLO(id);
  }
  async updateSLO(id, updates) {
    const existing = await this.storage.getSLO(id);
    if (!existing) return null;
    const updated = SLODefinitionSchema.parse({
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now()
    });
    await this.storage.saveSLO(updated);
    if (existing.enabled !== updated.enabled) {
      if (updated.enabled && this.running) {
        this.startMeasurement(updated);
      } else {
        this.stopMeasurement(id);
      }
    }
    this.emit("sloUpdated", updated);
    return updated;
  }
  async deleteSLO(id) {
    const existing = await this.storage.getSLO(id);
    if (!existing) return false;
    this.stopMeasurement(id);
    await this.storage.deleteSLO(id);
    this.emit("sloDeleted", id);
    return true;
  }
  async listSLOs(filters) {
    return this.storage.listSLOs(filters);
  }
  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  async getState(sloId) {
    return this.storage.getState(sloId);
  }
  async initializeState(slo) {
    const now = Date.now();
    const windowStart = now - slo.window.duration * 1e3;
    return {
      sloId: slo.id,
      status: "unknown",
      currentValue: 0,
      targetValue: slo.target.value,
      errorBudget: {
        sloId: slo.id,
        windowStart,
        windowEnd: now,
        total: 100 - slo.target.value,
        consumed: 0,
        remaining: 100 - slo.target.value,
        remainingPercent: 100,
        burnRate: 0,
        burnRateTrend: "stable"
      },
      windowStart,
      windowEnd: now,
      totalGood: 0,
      totalEvents: 0,
      lastMeasurement: now,
      measurementCount: 0
    };
  }
  // ---------------------------------------------------------------------------
  // Measurement
  // ---------------------------------------------------------------------------
  async measure(sloId) {
    const slo = await this.storage.getSLO(sloId);
    if (!slo || !slo.enabled) return null;
    const provider = this.metricProviders.get(slo.sli.source);
    if (!provider) {
      this.emit("error", new Error(`No metric provider for source: ${slo.sli.source}`));
      return null;
    }
    const now = Date.now();
    const windowStart = now - slo.window.duration * 1e3;
    try {
      let good;
      let total;
      if (slo.sli.metric.ratio) {
        const ratio = await provider.query(slo.sli.metric.ratio, windowStart, now);
        good = ratio;
        total = 100;
      } else {
        [good, total] = await Promise.all([
          provider.query(slo.sli.metric.good, windowStart, now),
          provider.query(slo.sli.metric.total, windowStart, now)
        ]);
      }
      const value = total > 0 ? good / total * 100 : 0;
      const measurement = {
        timestamp: now,
        good,
        total,
        value
      };
      await this.updateState(slo, measurement);
      this.emit("measured", sloId, measurement);
      return measurement;
    } catch (error) {
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }
  async updateState(slo, measurement) {
    const currentState = await this.storage.getState(slo.id);
    const now = Date.now();
    const windowStart = now - slo.window.duration * 1e3;
    const totalGood = (currentState?.totalGood ?? 0) + measurement.good;
    const totalEvents = (currentState?.totalEvents ?? 0) + measurement.total;
    const currentValue = totalEvents > 0 ? totalGood / totalEvents * 100 : 0;
    const errorBudget = this.calculateErrorBudget(slo, currentValue, windowStart, now);
    const status = this.calculateStatus(slo, errorBudget);
    const previousStatus = currentState?.status ?? "unknown";
    const newState = {
      sloId: slo.id,
      status,
      currentValue,
      targetValue: slo.target.value,
      errorBudget,
      windowStart,
      windowEnd: now,
      totalGood,
      totalEvents,
      lastMeasurement: now,
      measurementCount: (currentState?.measurementCount ?? 0) + 1
    };
    await this.storage.saveState(newState);
    const historyEntry = {
      timestamp: now,
      sloId: slo.id,
      value: currentValue,
      target: slo.target.value,
      status,
      errorBudgetRemaining: errorBudget.remainingPercent,
      burnRate: errorBudget.burnRate
    };
    await this.storage.addHistoryEntry(historyEntry);
    if (status !== previousStatus) {
      this.emit("stateChanged", slo.id, newState, previousStatus);
    }
    await this.checkAlerts(slo, newState, previousStatus);
  }
  calculateErrorBudget(slo, currentValue, windowStart, windowEnd) {
    const totalBudget = 100 - slo.target.value;
    const consumed = Math.max(0, slo.target.value - currentValue);
    const remaining = Math.max(0, totalBudget - consumed);
    const remainingPercent = totalBudget > 0 ? remaining / totalBudget * 100 : 0;
    const windowDuration = windowEnd - windowStart;
    const expectedConsumed = totalBudget * (windowDuration / (slo.window.duration * 1e3));
    const burnRate = expectedConsumed > 0 ? consumed / expectedConsumed : 0;
    let projectedExhaustion;
    let daysRemaining;
    if (burnRate > 1 && remaining > 0) {
      const remainingMs = remaining / consumed * windowDuration;
      projectedExhaustion = windowEnd + remainingMs;
      daysRemaining = remainingMs / (24 * 60 * 60 * 1e3);
    }
    return {
      sloId: slo.id,
      windowStart,
      windowEnd,
      total: totalBudget,
      consumed,
      remaining,
      remainingPercent,
      burnRate,
      burnRateTrend: burnRate > 1.5 ? "increasing" : burnRate < 0.5 ? "decreasing" : "stable",
      projectedExhaustion,
      daysRemaining
    };
  }
  calculateStatus(slo, errorBudget) {
    const thresholds = slo.alertThresholds ?? { warning: 50, critical: 20 };
    if (errorBudget.remainingPercent <= 0) {
      return "breached";
    }
    if (errorBudget.remainingPercent < thresholds.critical) {
      return "critical";
    }
    if (errorBudget.remainingPercent < thresholds.warning) {
      return "warning";
    }
    return "healthy";
  }
  // ---------------------------------------------------------------------------
  // Alerting
  // ---------------------------------------------------------------------------
  async checkAlerts(slo, state, previousStatus) {
    if (!this.config.alerting?.enabled) return;
    const thresholds = slo.alertThresholds ?? {
      warning: this.config.alerting.defaultWarningThreshold,
      critical: this.config.alerting.defaultCriticalThreshold
    };
    if (state.status !== previousStatus) {
      if (state.status === "warning" && previousStatus === "healthy") {
        await this.createAlert(slo, state, "budget_warning", "warning");
        this.emit("budgetWarning", slo.id, state.errorBudget.remainingPercent);
      }
      if (state.status === "critical") {
        await this.createAlert(slo, state, "budget_critical", "critical");
        this.emit("budgetCritical", slo.id, state.errorBudget.remainingPercent);
      }
      if (state.status === "breached") {
        await this.createAlert(slo, state, "budget_exhausted", "critical");
        this.emit("budgetExhausted", slo.id);
      }
      if (state.status === "healthy" && previousStatus !== "unknown") {
        await this.createAlert(slo, state, "slo_recovered", "info");
      }
    }
    if (this.config.alerting.burnRateAlerts) {
      await this.checkBurnRateAlerts(slo, state);
    }
  }
  async checkBurnRateAlerts(slo, state) {
    const burnRateAlerts = await this.storage.getBurnRateAlerts(slo.id);
    for (const alert of burnRateAlerts) {
      if (!alert.enabled) continue;
      const shortWindowMet = state.errorBudget.burnRate >= alert.shortWindow.burnRateThreshold;
      const longWindowMet = state.errorBudget.burnRate >= alert.longWindow.burnRateThreshold;
      if (shortWindowMet && longWindowMet) {
        await this.createAlert(
          slo,
          state,
          "burn_rate_high",
          alert.severity === "page" ? "critical" : "warning"
        );
        this.emit("burnRateHigh", slo.id, state.errorBudget.burnRate, alert.name);
      }
    }
  }
  async createAlert(slo, state, type, severity) {
    const messages = {
      budget_warning: `Error budget for ${slo.name} is running low (${state.errorBudget.remainingPercent.toFixed(1)}% remaining)`,
      budget_critical: `Error budget for ${slo.name} is critically low (${state.errorBudget.remainingPercent.toFixed(1)}% remaining)`,
      budget_exhausted: `Error budget for ${slo.name} has been exhausted`,
      burn_rate_high: `High burn rate detected for ${slo.name} (${state.errorBudget.burnRate.toFixed(2)}x)`,
      slo_breached: `SLO ${slo.name} has been breached (${state.currentValue.toFixed(2)}% vs ${state.targetValue}% target)`,
      slo_recovered: `SLO ${slo.name} has recovered to healthy status`
    };
    const alert = {
      id: randomUUID9(),
      type,
      sloId: slo.id,
      sloName: slo.name,
      service: slo.service,
      timestamp: Date.now(),
      severity,
      currentValue: state.currentValue,
      targetValue: state.targetValue,
      errorBudgetRemaining: state.errorBudget.remainingPercent,
      burnRate: state.errorBudget.burnRate,
      message: messages[type],
      acknowledged: false,
      resolved: type === "slo_recovered",
      resolvedAt: type === "slo_recovered" ? Date.now() : void 0
    };
    await this.storage.saveAlert(alert);
    this.emit("alertTriggered", alert);
    return alert;
  }
  async acknowledgeAlert(alertId, by) {
    const alert = await this.storage.getAlert(alertId);
    if (!alert) return false;
    await this.storage.updateAlert(alertId, {
      acknowledged: true,
      acknowledgedBy: by,
      acknowledgedAt: Date.now()
    });
    this.emit("alertAcknowledged", alertId, by);
    return true;
  }
  async resolveAlert(alertId) {
    const alert = await this.storage.getAlert(alertId);
    if (!alert) return false;
    await this.storage.updateAlert(alertId, {
      resolved: true,
      resolvedAt: Date.now()
    });
    this.emit("alertResolved", alertId);
    return true;
  }
  async listAlerts(filters) {
    return this.storage.listAlerts(filters);
  }
  // ---------------------------------------------------------------------------
  // Burn Rate Alert Configuration
  // ---------------------------------------------------------------------------
  async addBurnRateAlert(sloId, alert) {
    const fullAlert = {
      ...alert,
      id: randomUUID9(),
      sloId
    };
    await this.storage.saveBurnRateAlert(fullAlert);
    return fullAlert;
  }
  async getBurnRateAlerts(sloId) {
    return this.storage.getBurnRateAlerts(sloId);
  }
  async deleteBurnRateAlert(alertId) {
    await this.storage.deleteBurnRateAlert(alertId);
  }
  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------
  async generateReport(sloId, period, customRange) {
    const slo = await this.storage.getSLO(sloId);
    if (!slo) return null;
    const now = Date.now();
    let startTime;
    let endTime = now;
    if (customRange) {
      startTime = customRange.start;
      endTime = customRange.end;
    } else {
      switch (period) {
        case "day":
          startTime = now - 24 * 60 * 60 * 1e3;
          break;
        case "week":
          startTime = now - 7 * 24 * 60 * 60 * 1e3;
          break;
        case "month":
          startTime = now - 30 * 24 * 60 * 60 * 1e3;
          break;
        case "quarter":
          startTime = now - 90 * 24 * 60 * 60 * 1e3;
          break;
        case "year":
          startTime = now - 365 * 24 * 60 * 60 * 1e3;
          break;
        default:
          startTime = now - 7 * 24 * 60 * 60 * 1e3;
      }
    }
    const history = await this.storage.getHistory(sloId, startTime, endTime);
    if (history.length === 0) {
      return null;
    }
    const values = history.map((h) => h.value);
    const achievedValue = values.reduce((a, b) => a + b, 0) / values.length;
    const metEntries = history.filter((h) => h.status === "healthy" || h.status === "warning");
    const uptime = metEntries.length / history.length * 100;
    const errorBudgets = history.map((h) => h.errorBudgetRemaining);
    const avgBudgetRemaining = errorBudgets.reduce((a, b) => a + b, 0) / errorBudgets.length;
    let incidentCount = 0;
    let totalDowntime = 0;
    let inIncident = false;
    let incidentStart = 0;
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      if ((entry.status === "critical" || entry.status === "breached") && !inIncident) {
        inIncident = true;
        incidentStart = entry.timestamp;
        incidentCount++;
      } else if ((entry.status === "healthy" || entry.status === "warning") && inIncident) {
        inIncident = false;
        totalDowntime += entry.timestamp - incidentStart;
      }
    }
    const mttr = incidentCount > 0 ? totalDowntime / incidentCount / 1e3 : void 0;
    const midpoint = Math.floor(history.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg + 0.1 ? "improving" : secondAvg < firstAvg - 0.1 ? "degrading" : "stable";
    const report = {
      sloId,
      sloName: slo.name,
      service: slo.service,
      period,
      startTime,
      endTime,
      achievedValue,
      targetValue: slo.target.value,
      met: achievedValue >= slo.target.value,
      uptime,
      budgetTotal: 100 - slo.target.value,
      budgetConsumed: 100 - slo.target.value - avgBudgetRemaining * (100 - slo.target.value) / 100,
      budgetRemaining: avgBudgetRemaining * (100 - slo.target.value) / 100,
      incidentCount,
      totalDowntime: totalDowntime / 1e3,
      mttr,
      trend,
      previousPeriodValue: firstAvg,
      changePercent: firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg * 100 : 0
    };
    this.emit("reportGenerated", report);
    return report;
  }
  async getSummary() {
    const slos = await this.storage.listSLOs({ enabled: true });
    const states = await Promise.all(slos.map((s) => this.storage.getState(s.id)));
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let breached = 0;
    let unknown = 0;
    let totalBudgetRemaining = 0;
    for (const state of states) {
      if (!state) {
        unknown++;
        continue;
      }
      totalBudgetRemaining += state.errorBudget.remainingPercent;
      switch (state.status) {
        case "healthy":
          healthy++;
          break;
        case "warning":
          warning++;
          break;
        case "critical":
          critical++;
          break;
        case "breached":
          breached++;
          break;
        default:
          unknown++;
      }
    }
    const validStates = states.filter((s) => s !== null).length;
    return {
      totalSLOs: slos.length,
      healthy,
      warning,
      critical,
      breached,
      unknown,
      overallHealth: slos.length > 0 ? healthy / slos.length * 100 : 0,
      avgErrorBudgetRemaining: validStates > 0 ? totalBudgetRemaining / validStates : 0
    };
  }
  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------
  async getHistory(sloId, startTime, endTime) {
    return this.storage.getHistory(sloId, startTime, endTime);
  }
  async pruneHistory(retentionDays) {
    const days = retentionDays ?? this.config.retentionDays;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
    return this.storage.pruneHistory(cutoff);
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async start() {
    if (this.running) return;
    this.running = true;
    const slos = await this.storage.listSLOs({ enabled: true });
    for (const slo of slos) {
      this.startMeasurement(slo);
    }
  }
  async stop() {
    this.running = false;
    for (const [sloId] of this.measurementIntervals) {
      this.stopMeasurement(sloId);
    }
  }
  startMeasurement(slo) {
    if (this.measurementIntervals.has(slo.id)) return;
    this.measure(slo.id).catch((err) => this.emit("error", err));
    const interval = setInterval(() => {
      this.measure(slo.id).catch((err) => this.emit("error", err));
    }, this.config.measurementInterval * 1e3);
    this.measurementIntervals.set(slo.id, interval);
  }
  stopMeasurement(sloId) {
    const interval = this.measurementIntervals.get(sloId);
    if (interval) {
      clearInterval(interval);
      this.measurementIntervals.delete(sloId);
    }
  }
  isRunning() {
    return this.running;
  }
};
var defaultManager3 = null;
function getSLOManager() {
  if (!defaultManager3) {
    defaultManager3 = new SLOManager();
  }
  return defaultManager3;
}
function createSLOManager(config) {
  return new SLOManager(config);
}

// src/flags/types.ts
import { z as z19 } from "zod";
var FlagTypeSchema = z19.enum([
  "boolean",
  // Simple on/off
  "string",
  // String variations
  "number",
  // Numeric variations
  "json"
  // Complex JSON variations
]);
var FlagVariationSchema = z19.object({
  id: z19.string(),
  value: z19.unknown(),
  name: z19.string(),
  description: z19.string().optional()
});
var FlagStatusSchema = z19.enum([
  "active",
  // Flag is active and being evaluated
  "inactive",
  // Flag is turned off
  "archived"
  // Flag is archived (soft deleted)
]);
var OperatorSchema = z19.enum([
  "eq",
  // equals
  "neq",
  // not equals
  "gt",
  // greater than
  "gte",
  // greater than or equal
  "lt",
  // less than
  "lte",
  // less than or equal
  "contains",
  // string contains
  "not_contains",
  // string does not contain
  "starts_with",
  // string starts with
  "ends_with",
  // string ends with
  "matches",
  // regex match
  "in",
  // in list
  "not_in",
  // not in list
  "semver_eq",
  // semantic version equals
  "semver_gt",
  // semantic version greater than
  "semver_lt"
  // semantic version less than
]);
var TargetingConditionSchema = z19.object({
  attribute: z19.string(),
  operator: OperatorSchema,
  value: z19.unknown(),
  negate: z19.boolean().default(false)
});
var TargetingRuleSchema = z19.object({
  id: z19.string(),
  name: z19.string().optional(),
  description: z19.string().optional(),
  conditions: z19.array(TargetingConditionSchema).min(1),
  conditionLogic: z19.enum(["and", "or"]).default("and"),
  variationId: z19.string(),
  priority: z19.number().default(0),
  enabled: z19.boolean().default(true)
});
var SegmentSchema = z19.object({
  id: z19.string(),
  name: z19.string(),
  description: z19.string().optional(),
  conditions: z19.array(TargetingConditionSchema),
  conditionLogic: z19.enum(["and", "or"]).default("and"),
  createdAt: z19.number(),
  updatedAt: z19.number()
});
var SegmentRuleSchema = z19.object({
  id: z19.string(),
  segmentId: z19.string(),
  variationId: z19.string(),
  priority: z19.number().default(0),
  enabled: z19.boolean().default(true)
});
var RolloutWeightSchema = z19.object({
  variationId: z19.string(),
  weight: z19.number().min(0).max(100)
});
var PercentageRolloutSchema = z19.object({
  enabled: z19.boolean().default(false),
  weights: z19.array(RolloutWeightSchema),
  bucketBy: z19.string().default("userId").describe("Attribute to bucket by for consistent assignment"),
  seed: z19.string().optional().describe("Seed for hash function")
});
var ScheduledChangeSchema = z19.object({
  id: z19.string(),
  scheduledAt: z19.number(),
  action: z19.enum(["enable", "disable", "update_rollout", "update_default"]),
  payload: z19.record(z19.unknown()).optional(),
  executed: z19.boolean().default(false),
  executedAt: z19.number().optional()
});
var FlagDefinitionSchema = z19.object({
  id: z19.string(),
  key: z19.string().regex(/^[a-z][a-z0-9_-]*$/, "Key must be lowercase alphanumeric with underscores/hyphens"),
  name: z19.string(),
  description: z19.string().optional(),
  type: FlagTypeSchema,
  status: FlagStatusSchema.default("active"),
  // Variations
  variations: z19.array(FlagVariationSchema).min(2),
  defaultVariationId: z19.string(),
  offVariationId: z19.string().describe("Variation to serve when flag is off"),
  // Targeting
  targetingRules: z19.array(TargetingRuleSchema).default([]),
  segmentRules: z19.array(SegmentRuleSchema).default([]),
  percentageRollout: PercentageRolloutSchema.optional(),
  // Individual targets (allowlist/blocklist)
  individualTargets: z19.array(z19.object({
    userId: z19.string(),
    variationId: z19.string()
  })).default([]),
  // Prerequisites (flags that must be enabled)
  prerequisites: z19.array(z19.object({
    flagKey: z19.string(),
    variationId: z19.string()
  })).default([]),
  // Scheduling
  scheduledChanges: z19.array(ScheduledChangeSchema).default([]),
  // Metadata
  tags: z19.array(z19.string()).default([]),
  owner: z19.string().optional(),
  environment: z19.string().default("production"),
  project: z19.string().optional(),
  // Audit
  createdAt: z19.number(),
  updatedAt: z19.number(),
  createdBy: z19.string().optional(),
  updatedBy: z19.string().optional()
});
var EvaluationContextSchema = z19.object({
  // User attributes
  userId: z19.string().optional(),
  email: z19.string().optional(),
  name: z19.string().optional(),
  // Organization/team
  organizationId: z19.string().optional(),
  teamId: z19.string().optional(),
  // Device/platform
  platform: z19.string().optional(),
  deviceType: z19.string().optional(),
  browser: z19.string().optional(),
  os: z19.string().optional(),
  appVersion: z19.string().optional(),
  // Location
  country: z19.string().optional(),
  region: z19.string().optional(),
  city: z19.string().optional(),
  timezone: z19.string().optional(),
  // Custom attributes
  custom: z19.record(z19.unknown()).default({}),
  // Request metadata
  requestId: z19.string().optional(),
  timestamp: z19.number().optional()
});
var EvaluationReasonSchema = z19.enum([
  "off",
  // Flag is off
  "fallthrough",
  // Default variation
  "target_match",
  // Individual target matched
  "rule_match",
  // Targeting rule matched
  "segment_match",
  // Segment rule matched
  "percentage_rollout",
  // Percentage rollout
  "prerequisite_failed",
  // Prerequisite not met
  "error",
  // Evaluation error
  "stale"
  // Using stale/cached value
]);
var EvaluationResultSchema = z19.object({
  flagKey: z19.string(),
  value: z19.unknown(),
  variationId: z19.string(),
  reason: EvaluationReasonSchema,
  ruleId: z19.string().optional(),
  segmentId: z19.string().optional(),
  isDefaultValue: z19.boolean().default(false),
  evaluationTime: z19.number().describe("Evaluation time in ms"),
  metadata: z19.record(z19.unknown()).optional()
});
var FlagEvaluationEventSchema = z19.object({
  id: z19.string(),
  timestamp: z19.number(),
  flagKey: z19.string(),
  variationId: z19.string(),
  reason: EvaluationReasonSchema,
  context: EvaluationContextSchema.partial(),
  evaluationTime: z19.number()
});
var FlagStatsSchema = z19.object({
  flagKey: z19.string(),
  totalEvaluations: z19.number(),
  uniqueUsers: z19.number(),
  variationCounts: z19.record(z19.number()),
  reasonCounts: z19.record(z19.number()),
  avgEvaluationTime: z19.number(),
  lastEvaluatedAt: z19.number().optional()
});
var FlagManagerConfigSchema = z19.object({
  // Environment
  environment: z19.string().default("production"),
  project: z19.string().optional(),
  // Caching
  cacheEnabled: z19.boolean().default(true),
  cacheTtlSeconds: z19.number().default(60),
  staleTtlSeconds: z19.number().default(300).describe("How long to serve stale data on error"),
  // Streaming/Polling
  streamingEnabled: z19.boolean().default(false),
  pollingIntervalSeconds: z19.number().default(30),
  // Analytics
  analyticsEnabled: z19.boolean().default(true),
  analyticsSampleRate: z19.number().min(0).max(1).default(1),
  analyticsFlushIntervalSeconds: z19.number().default(60),
  // Defaults
  defaultOnError: z19.boolean().default(false),
  // Bootstrap (initial flag values)
  bootstrap: z19.record(z19.unknown()).optional(),
  // Provider integration
  provider: z19.enum(["memory", "launchdarkly", "unleash", "flagsmith", "custom"]).default("memory"),
  providerConfig: z19.record(z19.unknown()).optional()
});
function createBooleanFlag(key, name, defaultValue = false) {
  return {
    key,
    name,
    type: "boolean",
    status: "active",
    variations: [
      { id: "true", value: true, name: "Enabled" },
      { id: "false", value: false, name: "Disabled" }
    ],
    defaultVariationId: defaultValue ? "true" : "false",
    offVariationId: "false",
    targetingRules: [],
    segmentRules: [],
    individualTargets: [],
    prerequisites: [],
    scheduledChanges: [],
    tags: [],
    environment: "production"
  };
}
function createStringFlag(key, name, variations, defaultVariationId) {
  return {
    key,
    name,
    type: "string",
    status: "active",
    variations: variations.map((v) => ({ ...v, value: v.value })),
    defaultVariationId,
    offVariationId: variations[0]?.id ?? defaultVariationId,
    targetingRules: [],
    segmentRules: [],
    individualTargets: [],
    prerequisites: [],
    scheduledChanges: [],
    tags: [],
    environment: "production"
  };
}
function createPercentageRollout(enabledPercent, bucketBy = "userId") {
  return {
    enabled: true,
    weights: [
      { variationId: "true", weight: enabledPercent },
      { variationId: "false", weight: 100 - enabledPercent }
    ],
    bucketBy
  };
}
function createTargetingRule(attribute, operator, value, variationId) {
  return {
    conditions: [{ attribute, operator, value, negate: false }],
    conditionLogic: "and",
    variationId,
    priority: 0,
    enabled: true
  };
}

// src/flags/feature-flags.ts
import { EventEmitter as EventEmitter21 } from "eventemitter3";
import { createHash as createHash3 } from "crypto";
import { randomUUID as randomUUID10 } from "crypto";
var InMemoryFlagStorage = class {
  flags = /* @__PURE__ */ new Map();
  segments = /* @__PURE__ */ new Map();
  events = /* @__PURE__ */ new Map();
  stats = /* @__PURE__ */ new Map();
  async getFlag(key) {
    return this.flags.get(key) ?? null;
  }
  async saveFlag(flag) {
    this.flags.set(flag.key, flag);
  }
  async deleteFlag(key) {
    this.flags.delete(key);
    this.events.delete(key);
    this.stats.delete(key);
  }
  async listFlags(filters) {
    let results = Array.from(this.flags.values());
    if (filters) {
      if (filters.status) {
        results = results.filter((f) => f.status === filters.status);
      }
      if (filters.environment) {
        results = results.filter((f) => f.environment === filters.environment);
      }
      if (filters.project) {
        results = results.filter((f) => f.project === filters.project);
      }
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter((f) => filters.tags.some((t) => f.tags.includes(t)));
      }
    }
    return results;
  }
  async getSegment(id) {
    return this.segments.get(id) ?? null;
  }
  async saveSegment(segment) {
    this.segments.set(segment.id, segment);
  }
  async deleteSegment(id) {
    this.segments.delete(id);
  }
  async listSegments() {
    return Array.from(this.segments.values());
  }
  async saveEvaluationEvent(event) {
    const events = this.events.get(event.flagKey) ?? [];
    events.push(event);
    if (events.length > 1e3) {
      events.shift();
    }
    this.events.set(event.flagKey, events);
    await this.updateStats(event);
  }
  async updateStats(event) {
    const existing = this.stats.get(event.flagKey) ?? {
      flagKey: event.flagKey,
      totalEvaluations: 0,
      uniqueUsers: 0,
      variationCounts: {},
      reasonCounts: {},
      avgEvaluationTime: 0
    };
    existing.totalEvaluations++;
    existing.variationCounts[event.variationId] = (existing.variationCounts[event.variationId] ?? 0) + 1;
    existing.reasonCounts[event.reason] = (existing.reasonCounts[event.reason] ?? 0) + 1;
    existing.avgEvaluationTime = (existing.avgEvaluationTime * (existing.totalEvaluations - 1) + event.evaluationTime) / existing.totalEvaluations;
    existing.lastEvaluatedAt = event.timestamp;
    this.stats.set(event.flagKey, existing);
  }
  async getEvaluationEvents(flagKey, startTime, endTime) {
    const events = this.events.get(flagKey) ?? [];
    return events.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);
  }
  async getStats(flagKey) {
    return this.stats.get(flagKey) ?? null;
  }
};
function evaluateCondition(condition, context) {
  const { attribute, operator, value, negate } = condition;
  let attrValue;
  if (attribute in context) {
    attrValue = context[attribute];
  } else if (context.custom && attribute in context.custom) {
    attrValue = context.custom[attribute];
  } else {
    attrValue = void 0;
  }
  let result;
  switch (operator) {
    case "eq":
      result = attrValue === value;
      break;
    case "neq":
      result = attrValue !== value;
      break;
    case "gt":
      result = typeof attrValue === "number" && typeof value === "number" && attrValue > value;
      break;
    case "gte":
      result = typeof attrValue === "number" && typeof value === "number" && attrValue >= value;
      break;
    case "lt":
      result = typeof attrValue === "number" && typeof value === "number" && attrValue < value;
      break;
    case "lte":
      result = typeof attrValue === "number" && typeof value === "number" && attrValue <= value;
      break;
    case "contains":
      result = typeof attrValue === "string" && typeof value === "string" && attrValue.includes(value);
      break;
    case "not_contains":
      result = typeof attrValue === "string" && typeof value === "string" && !attrValue.includes(value);
      break;
    case "starts_with":
      result = typeof attrValue === "string" && typeof value === "string" && attrValue.startsWith(value);
      break;
    case "ends_with":
      result = typeof attrValue === "string" && typeof value === "string" && attrValue.endsWith(value);
      break;
    case "matches":
      try {
        result = typeof attrValue === "string" && typeof value === "string" && new RegExp(value).test(attrValue);
      } catch {
        result = false;
      }
      break;
    case "in":
      result = Array.isArray(value) && value.includes(attrValue);
      break;
    case "not_in":
      result = Array.isArray(value) && !value.includes(attrValue);
      break;
    case "semver_eq":
    case "semver_gt":
    case "semver_lt":
      result = compareSemver(String(attrValue), String(value), operator);
      break;
    default:
      result = false;
  }
  return negate ? !result : result;
}
function compareSemver(a, b, op) {
  const parseVersion = (v) => {
    return v.split(".").map((n) => parseInt(n, 10) || 0);
  };
  const va = parseVersion(a);
  const vb = parseVersion(b);
  const maxLen = Math.max(va.length, vb.length);
  for (let i = 0; i < maxLen; i++) {
    const ai = va[i] ?? 0;
    const bi = vb[i] ?? 0;
    if (ai !== bi) {
      switch (op) {
        case "semver_eq":
          return false;
        case "semver_gt":
          return ai > bi;
        case "semver_lt":
          return ai < bi;
      }
    }
  }
  return op === "semver_eq";
}
function evaluateConditions(conditions, logic, context) {
  if (logic === "and") {
    return conditions.every((c) => evaluateCondition(c, context));
  } else {
    return conditions.some((c) => evaluateCondition(c, context));
  }
}
function hashString(str, seed) {
  const hash = createHash3("sha256");
  hash.update(seed ? `${seed}:${str}` : str);
  const digest = hash.digest("hex");
  const num = parseInt(digest.slice(0, 8), 16);
  return num % 1e4 / 100;
}
function getBucket(context, bucketBy, seed) {
  let bucketValue;
  if (bucketBy in context) {
    bucketValue = String(context[bucketBy] ?? "");
  } else if (context.custom && bucketBy in context.custom) {
    bucketValue = String(context.custom[bucketBy] ?? "");
  } else {
    bucketValue = context.userId ?? context.requestId ?? randomUUID10();
  }
  return hashString(bucketValue, seed);
}
function selectVariationByWeight(weights, bucket) {
  let cumulative = 0;
  for (const w of weights) {
    cumulative += w.weight;
    if (bucket < cumulative) {
      return w.variationId;
    }
  }
  return weights[weights.length - 1]?.variationId ?? null;
}
var FeatureFlagsManager = class extends EventEmitter21 {
  config;
  storage;
  cache = /* @__PURE__ */ new Map();
  analyticsBuffer = [];
  pollingInterval;
  analyticsFlushInterval;
  schedulerInterval;
  running = false;
  constructor(config = {}) {
    super();
    this.config = FlagManagerConfigSchema.parse(config);
    this.storage = new InMemoryFlagStorage();
  }
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  setStorage(storage) {
    this.storage = storage;
  }
  // ---------------------------------------------------------------------------
  // Flag CRUD
  // ---------------------------------------------------------------------------
  async createFlag(input) {
    const now = Date.now();
    const flag = FlagDefinitionSchema.parse({
      ...input,
      id: randomUUID10(),
      createdAt: now,
      updatedAt: now
    });
    await this.storage.saveFlag(flag);
    this.invalidateCache(flag.key);
    this.emit("flagCreated", flag);
    return flag;
  }
  async getFlag(key) {
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(key);
      const now = Date.now();
      if (cached) {
        const age = now - cached.fetchedAt;
        if (age < this.config.cacheTtlSeconds * 1e3) {
          return cached.flag;
        }
        if (age < this.config.staleTtlSeconds * 1e3) {
          this.refreshCache(key).catch(() => {
          });
          return cached.flag;
        }
      }
    }
    const flag = await this.storage.getFlag(key);
    if (flag && this.config.cacheEnabled) {
      this.cache.set(key, { flag, fetchedAt: Date.now() });
    }
    return flag;
  }
  async updateFlag(key, updates) {
    const existing = await this.storage.getFlag(key);
    if (!existing) return null;
    const changes = [];
    for (const [k, v] of Object.entries(updates)) {
      if (JSON.stringify(existing[k]) !== JSON.stringify(v)) {
        changes.push(k);
      }
    }
    const updated = FlagDefinitionSchema.parse({
      ...existing,
      ...updates,
      id: existing.id,
      key: existing.key,
      createdAt: existing.createdAt,
      updatedAt: Date.now()
    });
    await this.storage.saveFlag(updated);
    this.invalidateCache(key);
    if (updates.status && updates.status !== existing.status) {
      this.emit("flagStatusChanged", key, updates.status);
    }
    this.emit("flagUpdated", updated, changes);
    return updated;
  }
  async deleteFlag(key) {
    const existing = await this.storage.getFlag(key);
    if (!existing) return false;
    await this.storage.deleteFlag(key);
    this.invalidateCache(key);
    this.emit("flagDeleted", key);
    return true;
  }
  async listFlags(filters) {
    return this.storage.listFlags(filters);
  }
  // ---------------------------------------------------------------------------
  // Segments
  // ---------------------------------------------------------------------------
  async createSegment(input) {
    const now = Date.now();
    const segment = SegmentSchema.parse({
      ...input,
      id: randomUUID10(),
      createdAt: now,
      updatedAt: now
    });
    await this.storage.saveSegment(segment);
    return segment;
  }
  async getSegment(id) {
    return this.storage.getSegment(id);
  }
  async listSegments() {
    return this.storage.listSegments();
  }
  async deleteSegment(id) {
    await this.storage.deleteSegment(id);
  }
  // ---------------------------------------------------------------------------
  // Evaluation
  // ---------------------------------------------------------------------------
  async evaluate(flagKey, context = {}) {
    const startTime = performance.now();
    const fullContext = EvaluationContextSchema.parse({
      ...context,
      timestamp: Date.now()
    });
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        return this.createErrorResult(flagKey, "off", startTime, "Flag not found");
      }
      if (flag.status !== "active") {
        const variation2 = this.getVariation(flag, flag.offVariationId);
        return this.createResult(flagKey, variation2, "off", startTime);
      }
      for (const prereq of flag.prerequisites) {
        const prereqResult = await this.evaluate(prereq.flagKey, context);
        if (prereqResult.variationId !== prereq.variationId) {
          const variation2 = this.getVariation(flag, flag.offVariationId);
          return this.createResult(flagKey, variation2, "prerequisite_failed", startTime);
        }
      }
      if (fullContext.userId) {
        const target = flag.individualTargets.find((t) => t.userId === fullContext.userId);
        if (target) {
          const variation2 = this.getVariation(flag, target.variationId);
          return this.createResult(flagKey, variation2, "target_match", startTime);
        }
      }
      const sortedRules = [...flag.targetingRules].filter((r) => r.enabled).sort((a, b) => b.priority - a.priority);
      for (const rule of sortedRules) {
        if (evaluateConditions(rule.conditions, rule.conditionLogic, fullContext)) {
          const variation2 = this.getVariation(flag, rule.variationId);
          return this.createResult(flagKey, variation2, "rule_match", startTime, rule.id);
        }
      }
      for (const segmentRule of flag.segmentRules.filter((r) => r.enabled)) {
        const segment = await this.storage.getSegment(segmentRule.segmentId);
        if (segment && evaluateConditions(segment.conditions, segment.conditionLogic, fullContext)) {
          const variation2 = this.getVariation(flag, segmentRule.variationId);
          return this.createResult(flagKey, variation2, "segment_match", startTime, void 0, segment.id);
        }
      }
      if (flag.percentageRollout?.enabled) {
        const bucket = getBucket(fullContext, flag.percentageRollout.bucketBy, flag.percentageRollout.seed);
        const variationId = selectVariationByWeight(flag.percentageRollout.weights, bucket);
        if (variationId) {
          const variation2 = this.getVariation(flag, variationId);
          return this.createResult(flagKey, variation2, "percentage_rollout", startTime);
        }
      }
      const variation = this.getVariation(flag, flag.defaultVariationId);
      return this.createResult(flagKey, variation, "fallthrough", startTime, void 0, void 0, true);
    } catch (error) {
      this.emit("evaluationError", flagKey, error instanceof Error ? error : new Error(String(error)), fullContext);
      return this.createErrorResult(flagKey, "error", startTime, String(error));
    }
  }
  // Convenience methods for typed evaluation
  async evaluateBoolean(flagKey, context = {}, defaultValue = false) {
    const result = await this.evaluate(flagKey, context);
    return typeof result.value === "boolean" ? result.value : defaultValue;
  }
  async evaluateString(flagKey, context = {}, defaultValue = "") {
    const result = await this.evaluate(flagKey, context);
    return typeof result.value === "string" ? result.value : defaultValue;
  }
  async evaluateNumber(flagKey, context = {}, defaultValue = 0) {
    const result = await this.evaluate(flagKey, context);
    return typeof result.value === "number" ? result.value : defaultValue;
  }
  async evaluateJSON(flagKey, context = {}, defaultValue) {
    const result = await this.evaluate(flagKey, context);
    return result.value ?? defaultValue;
  }
  getVariation(flag, variationId) {
    const variation = flag.variations.find((v) => v.id === variationId);
    if (!variation) {
      return flag.variations[0] ?? { id: "unknown", value: null, name: "Unknown" };
    }
    return variation;
  }
  createResult(flagKey, variation, reason, startTime, ruleId, segmentId, isDefaultValue = false) {
    const evaluationTime = performance.now() - startTime;
    const result = {
      flagKey,
      value: variation.value,
      variationId: variation.id,
      reason,
      ruleId,
      segmentId,
      isDefaultValue,
      evaluationTime
    };
    this.recordEvaluation(result);
    return result;
  }
  createErrorResult(flagKey, reason, startTime, error) {
    const evaluationTime = performance.now() - startTime;
    return {
      flagKey,
      value: this.config.defaultOnError,
      variationId: "error",
      reason,
      isDefaultValue: true,
      evaluationTime,
      metadata: error ? { error } : void 0
    };
  }
  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------
  recordEvaluation(result) {
    if (!this.config.analyticsEnabled) return;
    if (Math.random() > this.config.analyticsSampleRate) return;
    const event = {
      id: randomUUID10(),
      timestamp: Date.now(),
      flagKey: result.flagKey,
      variationId: result.variationId,
      reason: result.reason,
      context: {},
      evaluationTime: result.evaluationTime
    };
    this.analyticsBuffer.push(event);
  }
  async flushAnalytics() {
    if (this.analyticsBuffer.length === 0) return;
    const events = [...this.analyticsBuffer];
    this.analyticsBuffer = [];
    for (const event of events) {
      await this.storage.saveEvaluationEvent(event);
    }
    this.emit("analyticsFlush", events);
  }
  async getStats(flagKey) {
    return this.storage.getStats(flagKey);
  }
  // ---------------------------------------------------------------------------
  // Cache Management
  // ---------------------------------------------------------------------------
  invalidateCache(key) {
    this.cache.delete(key);
  }
  async refreshCache(key) {
    const flag = await this.storage.getFlag(key);
    if (flag) {
      this.cache.set(key, { flag, fetchedAt: Date.now() });
    }
  }
  async refreshAllCaches() {
    const flags = await this.storage.listFlags({ status: "active" });
    const keys = flags.map((f) => f.key);
    for (const flag of flags) {
      this.cache.set(flag.key, { flag, fetchedAt: Date.now() });
    }
    this.emit("cacheUpdated", keys);
  }
  // ---------------------------------------------------------------------------
  // Scheduled Changes
  // ---------------------------------------------------------------------------
  async addScheduledChange(flagKey, change) {
    const flag = await this.storage.getFlag(flagKey);
    if (!flag) {
      throw new Error(`Flag not found: ${flagKey}`);
    }
    const scheduledChange = {
      ...change,
      id: randomUUID10(),
      executed: false
    };
    await this.updateFlag(flagKey, {
      scheduledChanges: [...flag.scheduledChanges, scheduledChange]
    });
    return scheduledChange;
  }
  async processScheduledChanges() {
    const now = Date.now();
    const flags = await this.storage.listFlags({ status: "active" });
    for (const flag of flags) {
      const pendingChanges = flag.scheduledChanges.filter(
        (c) => !c.executed && c.scheduledAt <= now
      );
      for (const change of pendingChanges) {
        try {
          await this.executeScheduledChange(flag, change);
        } catch (error) {
          this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
      }
    }
  }
  async executeScheduledChange(flag, change) {
    let updates = {};
    switch (change.action) {
      case "enable":
        updates = { status: "active" };
        break;
      case "disable":
        updates = { status: "inactive" };
        break;
      case "update_rollout":
        if (change.payload?.rollout) {
          updates = { percentageRollout: change.payload.rollout };
        }
        break;
      case "update_default":
        if (change.payload?.defaultVariationId) {
          updates = { defaultVariationId: change.payload.defaultVariationId };
        }
        break;
    }
    const updatedChanges = flag.scheduledChanges.map(
      (c) => c.id === change.id ? { ...c, executed: true, executedAt: Date.now() } : c
    );
    await this.updateFlag(flag.key, {
      ...updates,
      scheduledChanges: updatedChanges
    });
    this.emit("scheduledChangeExecuted", flag.key, { ...change, executed: true, executedAt: Date.now() });
  }
  // ---------------------------------------------------------------------------
  // Targeting Rules
  // ---------------------------------------------------------------------------
  async addTargetingRule(flagKey, rule) {
    const flag = await this.storage.getFlag(flagKey);
    if (!flag) {
      throw new Error(`Flag not found: ${flagKey}`);
    }
    const fullRule = {
      ...rule,
      id: randomUUID10()
    };
    await this.updateFlag(flagKey, {
      targetingRules: [...flag.targetingRules, fullRule]
    });
    this.emit("targetingRuleAdded", flagKey, fullRule);
    return fullRule;
  }
  async removeTargetingRule(flagKey, ruleId) {
    const flag = await this.storage.getFlag(flagKey);
    if (!flag) return false;
    const filtered = flag.targetingRules.filter((r) => r.id !== ruleId);
    if (filtered.length === flag.targetingRules.length) return false;
    await this.updateFlag(flagKey, { targetingRules: filtered });
    this.emit("targetingRuleRemoved", flagKey, ruleId);
    return true;
  }
  // ---------------------------------------------------------------------------
  // Rollout Management
  // ---------------------------------------------------------------------------
  async updateRollout(flagKey, rollout) {
    await this.updateFlag(flagKey, { percentageRollout: rollout });
    this.emit("rolloutUpdated", flagKey, rollout);
  }
  async setRolloutPercentage(flagKey, enabledPercent) {
    const flag = await this.storage.getFlag(flagKey);
    if (!flag) {
      throw new Error(`Flag not found: ${flagKey}`);
    }
    const rollout = {
      enabled: true,
      weights: [
        { variationId: "true", weight: enabledPercent },
        { variationId: "false", weight: 100 - enabledPercent }
      ],
      bucketBy: flag.percentageRollout?.bucketBy ?? "userId",
      seed: flag.percentageRollout?.seed
    };
    await this.updateRollout(flagKey, rollout);
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async start() {
    if (this.running) return;
    this.running = true;
    if (this.config.pollingIntervalSeconds > 0) {
      this.pollingInterval = setInterval(() => {
        this.refreshAllCaches().catch((err) => this.emit("error", err));
      }, this.config.pollingIntervalSeconds * 1e3);
    }
    if (this.config.analyticsEnabled) {
      this.analyticsFlushInterval = setInterval(() => {
        this.flushAnalytics().catch((err) => this.emit("error", err));
      }, this.config.analyticsFlushIntervalSeconds * 1e3);
    }
    this.schedulerInterval = setInterval(() => {
      this.processScheduledChanges().catch((err) => this.emit("error", err));
    }, 6e4);
    await this.refreshAllCaches();
  }
  async stop() {
    this.running = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = void 0;
    }
    if (this.analyticsFlushInterval) {
      clearInterval(this.analyticsFlushInterval);
      this.analyticsFlushInterval = void 0;
    }
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = void 0;
    }
    await this.flushAnalytics();
  }
  isRunning() {
    return this.running;
  }
};
var defaultManager4 = null;
function getFeatureFlagsManager() {
  if (!defaultManager4) {
    defaultManager4 = new FeatureFlagsManager();
  }
  return defaultManager4;
}
function createFeatureFlagsManager(config) {
  return new FeatureFlagsManager(config);
}

// src/config/types.ts
import { z as z20 } from "zod";
var ConfigValueTypeSchema = z20.enum([
  "string",
  "number",
  "boolean",
  "json",
  "secret",
  // Encrypted/sensitive value
  "array",
  "enum"
]);
var ConfigValueSchema = z20.object({
  type: ConfigValueTypeSchema,
  value: z20.unknown(),
  encrypted: z20.boolean().default(false)
});
var ConfigSourceTypeSchema = z20.enum([
  "env",
  // Environment variables
  "file",
  // Config files (JSON, YAML, etc.)
  "remote",
  // Remote config service
  "vault",
  // Secret vault (HashiCorp Vault, AWS Secrets Manager, etc.)
  "database",
  // Database-stored config
  "memory"
  // In-memory (bootstrap/defaults)
]);
var ConfigSourceSchema = z20.object({
  type: ConfigSourceTypeSchema,
  name: z20.string(),
  priority: z20.number().default(0).describe("Higher priority overrides lower"),
  enabled: z20.boolean().default(true),
  // Source-specific config
  config: z20.record(z20.unknown()).optional()
});
var ConfigValidationSchema = z20.object({
  required: z20.boolean().default(false),
  min: z20.number().optional(),
  max: z20.number().optional(),
  minLength: z20.number().optional(),
  maxLength: z20.number().optional(),
  pattern: z20.string().optional(),
  enum: z20.array(z20.unknown()).optional(),
  custom: z20.string().optional().describe("Custom validation function name")
});
var ConfigDefinitionSchema = z20.object({
  key: z20.string(),
  name: z20.string(),
  description: z20.string().optional(),
  type: ConfigValueTypeSchema,
  defaultValue: z20.unknown().optional(),
  validation: ConfigValidationSchema.optional(),
  // Environment overrides
  environmentOverrides: z20.record(z20.unknown()).optional().describe("Override values per environment"),
  // Metadata
  category: z20.string().default("general"),
  tags: z20.array(z20.string()).default([]),
  sensitive: z20.boolean().default(false),
  deprecated: z20.boolean().default(false),
  deprecationMessage: z20.string().optional(),
  // Documentation
  examples: z20.array(z20.unknown()).optional(),
  links: z20.array(z20.string()).optional()
});
var ConfigEntrySchema = z20.object({
  key: z20.string(),
  value: z20.unknown(),
  type: ConfigValueTypeSchema,
  source: ConfigSourceTypeSchema,
  environment: z20.string(),
  version: z20.number().default(1),
  updatedAt: z20.number(),
  updatedBy: z20.string().optional(),
  encrypted: z20.boolean().default(false),
  metadata: z20.record(z20.unknown()).optional()
});
var ConfigChangeTypeSchema = z20.enum([
  "created",
  "updated",
  "deleted",
  "rolled_back"
]);
var ConfigChangeSchema = z20.object({
  id: z20.string(),
  timestamp: z20.number(),
  key: z20.string(),
  type: ConfigChangeTypeSchema,
  previousValue: z20.unknown().optional(),
  newValue: z20.unknown().optional(),
  source: ConfigSourceTypeSchema,
  environment: z20.string(),
  changedBy: z20.string().optional(),
  reason: z20.string().optional()
});
var ConfigSnapshotSchema = z20.object({
  id: z20.string(),
  name: z20.string().optional(),
  description: z20.string().optional(),
  timestamp: z20.number(),
  environment: z20.string(),
  entries: z20.array(ConfigEntrySchema),
  createdBy: z20.string().optional()
});
var EnvironmentSchema = z20.object({
  id: z20.string(),
  name: z20.string(),
  displayName: z20.string().optional(),
  description: z20.string().optional(),
  isProduction: z20.boolean().default(false),
  parentId: z20.string().optional().describe("Inherit from parent environment"),
  locked: z20.boolean().default(false),
  metadata: z20.record(z20.unknown()).optional()
});
var ConfigNamespaceSchema = z20.object({
  id: z20.string(),
  name: z20.string(),
  description: z20.string().optional(),
  prefix: z20.string().describe("Key prefix for namespaced configs"),
  owner: z20.string().optional(),
  locked: z20.boolean().default(false)
});
var WatchCallbackSchema = z20.function().args(z20.string(), z20.unknown(), z20.unknown().optional()).returns(z20.void());
var WatchOptionsSchema = z20.object({
  keys: z20.array(z20.string()).optional().describe("Specific keys to watch"),
  prefix: z20.string().optional().describe("Watch keys with prefix"),
  namespace: z20.string().optional(),
  debounceMs: z20.number().default(100)
});
var ConfigValidationResultSchema = z20.object({
  valid: z20.boolean(),
  errors: z20.array(z20.object({
    key: z20.string(),
    message: z20.string(),
    value: z20.unknown().optional()
  })),
  warnings: z20.array(z20.object({
    key: z20.string(),
    message: z20.string()
  }))
});
var ConfigManagerConfigSchema = z20.object({
  // Environment
  environment: z20.string().default("development"),
  environments: z20.array(EnvironmentSchema).default([]),
  // Sources
  sources: z20.array(ConfigSourceSchema).default([]),
  // Hot reload
  hotReload: z20.object({
    enabled: z20.boolean().default(false),
    intervalSeconds: z20.number().default(30),
    watchFiles: z20.array(z20.string()).default([])
  }).optional(),
  // Validation
  validation: z20.object({
    strict: z20.boolean().default(false),
    failOnWarning: z20.boolean().default(false)
  }).optional(),
  // Encryption
  encryption: z20.object({
    enabled: z20.boolean().default(false),
    keyId: z20.string().optional(),
    algorithm: z20.enum(["aes-256-gcm", "aes-256-cbc"]).default("aes-256-gcm")
  }).optional(),
  // Caching
  cache: z20.object({
    enabled: z20.boolean().default(true),
    ttlSeconds: z20.number().default(60)
  }).optional(),
  // History
  history: z20.object({
    enabled: z20.boolean().default(true),
    maxEntries: z20.number().default(100),
    retentionDays: z20.number().default(30)
  }).optional(),
  // Defaults
  defaults: z20.record(z20.unknown()).default({})
});
var DEFAULT_ENVIRONMENTS = [
  {
    id: "development",
    name: "development",
    displayName: "Development",
    description: "Local development environment",
    isProduction: false,
    locked: false
  },
  {
    id: "staging",
    name: "staging",
    displayName: "Staging",
    description: "Pre-production testing environment",
    isProduction: false,
    parentId: "development",
    locked: false
  },
  {
    id: "production",
    name: "production",
    displayName: "Production",
    description: "Live production environment",
    isProduction: true,
    parentId: "staging",
    locked: true
  }
];
var CONFIG_CATEGORIES = {
  general: "General",
  database: "Database",
  cache: "Cache",
  security: "Security",
  api: "API",
  features: "Features",
  limits: "Limits & Quotas",
  notifications: "Notifications",
  integrations: "Integrations",
  experimental: "Experimental"
};

// src/config/config-manager.ts
import { EventEmitter as EventEmitter22 } from "eventemitter3";
import { randomUUID as randomUUID11 } from "crypto";
var InMemoryConfigStorage = class {
  entries = /* @__PURE__ */ new Map();
  history = /* @__PURE__ */ new Map();
  snapshots = /* @__PURE__ */ new Map();
  definitions = /* @__PURE__ */ new Map();
  getKey(key, environment) {
    return `${environment}:${key}`;
  }
  async get(key, environment) {
    return this.entries.get(this.getKey(key, environment)) ?? null;
  }
  async set(entry) {
    this.entries.set(this.getKey(entry.key, entry.environment), entry);
  }
  async delete(key, environment) {
    this.entries.delete(this.getKey(key, environment));
  }
  async list(filters) {
    let results = Array.from(this.entries.values());
    if (filters) {
      if (filters.environment) {
        results = results.filter((e) => e.environment === filters.environment);
      }
      if (filters.prefix) {
        results = results.filter((e) => e.key.startsWith(filters.prefix));
      }
      if (filters.namespace) {
        results = results.filter((e) => e.key.startsWith(`${filters.namespace}:`));
      }
    }
    return results;
  }
  async addChange(change) {
    const key = `${change.environment}:${change.key}`;
    const changes = this.history.get(key) ?? [];
    changes.unshift(change);
    if (changes.length > 100) {
      changes.pop();
    }
    this.history.set(key, changes);
  }
  async getHistory(key, environment, limit = 50) {
    const changes = this.history.get(`${environment}:${key}`) ?? [];
    return changes.slice(0, limit);
  }
  async saveSnapshot(snapshot) {
    this.snapshots.set(snapshot.id, snapshot);
  }
  async getSnapshot(id) {
    return this.snapshots.get(id) ?? null;
  }
  async listSnapshots(environment) {
    return Array.from(this.snapshots.values()).filter((s) => s.environment === environment).sort((a, b) => b.timestamp - a.timestamp);
  }
  async deleteSnapshot(id) {
    this.snapshots.delete(id);
  }
  async getDefinition(key) {
    return this.definitions.get(key) ?? null;
  }
  async saveDefinition(definition) {
    this.definitions.set(definition.key, definition);
  }
  async listDefinitions() {
    return Array.from(this.definitions.values());
  }
};
var EnvSourceProvider = class {
  type = "env";
  name;
  prefix;
  constructor(name, prefix = "") {
    this.name = name;
    this.prefix = prefix;
  }
  async load() {
    const result = /* @__PURE__ */ new Map();
    for (const [key, value] of Object.entries(process.env)) {
      if (value === void 0) continue;
      if (this.prefix && !key.startsWith(this.prefix)) continue;
      const configKey = this.prefix ? key.slice(this.prefix.length).toLowerCase().replace(/_/g, ".") : key.toLowerCase().replace(/_/g, ".");
      try {
        result.set(configKey, JSON.parse(value));
      } catch {
        result.set(configKey, value);
      }
    }
    return result;
  }
};
var MemorySourceProvider = class {
  type = "memory";
  name;
  values;
  watchers = [];
  constructor(name, values = {}) {
    this.name = name;
    this.values = new Map(Object.entries(values));
  }
  async load() {
    return new Map(this.values);
  }
  async set(key, value) {
    this.values.set(key, value);
    const changes = /* @__PURE__ */ new Map([[key, value]]);
    for (const watcher of this.watchers) {
      watcher(changes);
    }
  }
  async delete(key) {
    this.values.delete(key);
    const changes = /* @__PURE__ */ new Map([[key, void 0]]);
    for (const watcher of this.watchers) {
      watcher(changes);
    }
  }
  watch(callback) {
    this.watchers.push(callback);
    return () => {
      const idx = this.watchers.indexOf(callback);
      if (idx >= 0) this.watchers.splice(idx, 1);
    };
  }
};
var ConfigManager = class extends EventEmitter22 {
  config;
  storage;
  sources = /* @__PURE__ */ new Map();
  cache = /* @__PURE__ */ new Map();
  watchers = /* @__PURE__ */ new Map();
  environments;
  currentEnvironment;
  hotReloadInterval;
  running = false;
  constructor(config = {}) {
    super();
    this.config = ConfigManagerConfigSchema.parse(config);
    this.storage = new InMemoryConfigStorage();
    this.environments = this.config.environments.length > 0 ? this.config.environments : DEFAULT_ENVIRONMENTS;
    this.currentEnvironment = this.config.environment;
    this.registerSource(new MemorySourceProvider("defaults", this.config.defaults));
    this.registerSource(new EnvSourceProvider("env"));
  }
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  setStorage(storage) {
    this.storage = storage;
  }
  registerSource(provider) {
    this.sources.set(provider.name, provider);
  }
  setEnvironment(environment) {
    if (!this.environments.find((e) => e.name === environment)) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    this.currentEnvironment = environment;
    this.cache.clear();
  }
  getEnvironment() {
    return this.currentEnvironment;
  }
  listEnvironments() {
    return [...this.environments];
  }
  // ---------------------------------------------------------------------------
  // Get Config Values
  // ---------------------------------------------------------------------------
  async get(key, defaultValue) {
    if (this.config.cache?.enabled) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.fetchedAt < (this.config.cache.ttlSeconds ?? 60) * 1e3) {
        return cached.value;
      }
    }
    const entry = await this.storage.get(key, this.currentEnvironment);
    if (entry) {
      this.updateCache(key, entry.value);
      return entry.value;
    }
    const inheritedValue = await this.getInheritedValue(key);
    if (inheritedValue !== void 0) {
      this.updateCache(key, inheritedValue);
      return inheritedValue;
    }
    if (defaultValue !== void 0) {
      return defaultValue;
    }
    const definition = await this.storage.getDefinition(key);
    if (definition?.defaultValue !== void 0) {
      return definition.defaultValue;
    }
    return void 0;
  }
  async getString(key, defaultValue = "") {
    const value = await this.get(key, defaultValue);
    return String(value);
  }
  async getNumber(key, defaultValue = 0) {
    const value = await this.get(key, defaultValue);
    return typeof value === "number" ? value : Number(value) || defaultValue;
  }
  async getBoolean(key, defaultValue = false) {
    const value = await this.get(key, defaultValue);
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
    return Boolean(value);
  }
  async getJSON(key, defaultValue) {
    const value = await this.get(key, defaultValue);
    if (typeof value === "object") return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }
  async getArray(key, defaultValue = []) {
    const value = await this.get(key, defaultValue);
    return Array.isArray(value) ? value : defaultValue;
  }
  async getInheritedValue(key) {
    const currentEnv = this.environments.find((e) => e.name === this.currentEnvironment);
    if (!currentEnv?.parentId) return void 0;
    let parentId = currentEnv.parentId;
    while (parentId) {
      const entry = await this.storage.get(key, parentId);
      if (entry) {
        return entry.value;
      }
      const parentEnv = this.environments.find((e) => e.id === parentId);
      parentId = parentEnv?.parentId;
    }
    return void 0;
  }
  updateCache(key, value) {
    if (this.config.cache?.enabled) {
      this.cache.set(key, { value, fetchedAt: Date.now() });
    }
  }
  // ---------------------------------------------------------------------------
  // Set Config Values
  // ---------------------------------------------------------------------------
  async set(key, value, options = {}) {
    const oldEntry = await this.storage.get(key, this.currentEnvironment);
    const oldValue = oldEntry?.value;
    const isNew = !oldEntry;
    const entry = {
      key,
      value,
      type: options.type ?? this.inferType(value),
      source: "memory",
      environment: this.currentEnvironment,
      version: (oldEntry?.version ?? 0) + 1,
      updatedAt: Date.now(),
      updatedBy: options.changedBy,
      encrypted: false
    };
    await this.validateEntry(entry);
    await this.storage.set(entry);
    this.updateCache(key, value);
    if (this.config.history?.enabled) {
      const change = {
        id: randomUUID11(),
        timestamp: Date.now(),
        key,
        type: isNew ? "created" : "updated",
        previousValue: oldValue,
        newValue: value,
        source: "memory",
        environment: this.currentEnvironment,
        changedBy: options.changedBy,
        reason: options.reason
      };
      await this.storage.addChange(change);
    }
    this.notifyWatchers(key, value, oldValue);
    if (isNew) {
      this.emit("created", key, value);
    } else {
      this.emit("updated", key, value, oldValue);
    }
    this.emit("changed", key, value, oldValue);
  }
  async delete(key, options = {}) {
    const entry = await this.storage.get(key, this.currentEnvironment);
    if (!entry) return false;
    await this.storage.delete(key, this.currentEnvironment);
    this.cache.delete(key);
    if (this.config.history?.enabled) {
      const change = {
        id: randomUUID11(),
        timestamp: Date.now(),
        key,
        type: "deleted",
        previousValue: entry.value,
        source: "memory",
        environment: this.currentEnvironment,
        changedBy: options.changedBy,
        reason: options.reason
      };
      await this.storage.addChange(change);
    }
    this.notifyWatchers(key, void 0, entry.value);
    this.emit("deleted", key, entry.value);
    return true;
  }
  inferType(value) {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") return "string";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "json";
    return "string";
  }
  // ---------------------------------------------------------------------------
  // Bulk Operations
  // ---------------------------------------------------------------------------
  async setMany(values, options = {}) {
    for (const [key, value] of Object.entries(values)) {
      await this.set(key, value, options);
    }
  }
  async getMany(keys) {
    const result = /* @__PURE__ */ new Map();
    await Promise.all(keys.map(async (key) => {
      result.set(key, await this.get(key));
    }));
    return result;
  }
  async list(filters) {
    return this.storage.list({ environment: this.currentEnvironment, ...filters });
  }
  // ---------------------------------------------------------------------------
  // Watching
  // ---------------------------------------------------------------------------
  watch(callback, options = {}) {
    const watchKey = options.keys?.join(",") ?? options.prefix ?? options.namespace ?? "*";
    let watchers = this.watchers.get(watchKey);
    if (!watchers) {
      watchers = /* @__PURE__ */ new Set();
      this.watchers.set(watchKey, watchers);
    }
    watchers.add(callback);
    return () => {
      watchers?.delete(callback);
    };
  }
  notifyWatchers(key, newValue, oldValue) {
    const globalWatchers = this.watchers.get("*");
    if (globalWatchers) {
      for (const callback of globalWatchers) {
        try {
          callback(key, newValue, oldValue);
        } catch (error) {
          this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
      }
    }
    for (const [watchKey, watchers] of this.watchers) {
      if (watchKey === "*") continue;
      if (key.startsWith(watchKey) || watchKey.includes(key)) {
        for (const callback of watchers) {
          try {
            callback(key, newValue, oldValue);
          } catch (error) {
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
          }
        }
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  async validateEntry(entry) {
    const definition = await this.storage.getDefinition(entry.key);
    if (!definition) return;
    const result = await this.validateValue(entry.key, entry.value, definition);
    if (!result.valid) {
      const errorMessages = result.errors.map((e) => e.message).join(", ");
      throw new Error(`Validation failed for ${entry.key}: ${errorMessages}`);
    }
  }
  async validateValue(key, value, definition) {
    const errors = [];
    const warnings = [];
    if (definition.deprecated) {
      warnings.push({
        key,
        message: definition.deprecationMessage ?? `Config ${key} is deprecated`
      });
    }
    const validation = definition.validation;
    if (!validation) {
      return { valid: true, errors, warnings };
    }
    if (validation.required && (value === void 0 || value === null || value === "")) {
      errors.push({ key, message: `${key} is required`, value });
    }
    if (value !== void 0 && value !== null) {
      if (typeof value === "number") {
        if (validation.min !== void 0 && value < validation.min) {
          errors.push({ key, message: `${key} must be >= ${validation.min}`, value });
        }
        if (validation.max !== void 0 && value > validation.max) {
          errors.push({ key, message: `${key} must be <= ${validation.max}`, value });
        }
      }
      if (typeof value === "string") {
        if (validation.minLength !== void 0 && value.length < validation.minLength) {
          errors.push({ key, message: `${key} must be at least ${validation.minLength} characters`, value });
        }
        if (validation.maxLength !== void 0 && value.length > validation.maxLength) {
          errors.push({ key, message: `${key} must be at most ${validation.maxLength} characters`, value });
        }
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          errors.push({ key, message: `${key} must match pattern ${validation.pattern}`, value });
        }
      }
      if (validation.enum && !validation.enum.includes(value)) {
        errors.push({ key, message: `${key} must be one of: ${validation.enum.join(", ")}`, value });
      }
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  async validate() {
    const definitions = await this.storage.listDefinitions();
    const allErrors = [];
    const allWarnings = [];
    for (const def of definitions) {
      const value = await this.get(def.key);
      const result2 = await this.validateValue(def.key, value, def);
      allErrors.push(...result2.errors);
      allWarnings.push(...result2.warnings);
    }
    const result = {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
    if (!result.valid) {
      this.emit("validationFailed", result);
    }
    return result;
  }
  // ---------------------------------------------------------------------------
  // Definitions
  // ---------------------------------------------------------------------------
  async defineConfig(definition) {
    await this.storage.saveDefinition(definition);
  }
  async getDefinition(key) {
    return this.storage.getDefinition(key);
  }
  async listDefinitions() {
    return this.storage.listDefinitions();
  }
  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------
  async getHistory(key, limit) {
    return this.storage.getHistory(key, this.currentEnvironment, limit);
  }
  // ---------------------------------------------------------------------------
  // Snapshots
  // ---------------------------------------------------------------------------
  async createSnapshot(name, description) {
    const entries = await this.storage.list({ environment: this.currentEnvironment });
    const snapshot = {
      id: randomUUID11(),
      name,
      description,
      timestamp: Date.now(),
      environment: this.currentEnvironment,
      entries
    };
    await this.storage.saveSnapshot(snapshot);
    return snapshot;
  }
  async listSnapshots() {
    return this.storage.listSnapshots(this.currentEnvironment);
  }
  async rollback(snapshotId) {
    const snapshot = await this.storage.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }
    const rolledBackKeys = [];
    for (const entry of snapshot.entries) {
      await this.set(entry.key, entry.value, { reason: `Rollback to snapshot ${snapshotId}` });
      rolledBackKeys.push(entry.key);
    }
    this.emit("rolledBack", snapshotId, rolledBackKeys);
    return rolledBackKeys;
  }
  // ---------------------------------------------------------------------------
  // Source Loading
  // ---------------------------------------------------------------------------
  async loadFromSources() {
    const sortedSources = [...this.config.sources].filter((s) => s.enabled).sort((a, b) => a.priority - b.priority);
    for (const sourceConfig of sortedSources) {
      const provider = this.sources.get(sourceConfig.name);
      if (!provider) continue;
      try {
        const values = await provider.load();
        let count = 0;
        for (const [key, value] of values) {
          await this.storage.set({
            key,
            value,
            type: this.inferType(value),
            source: provider.type,
            environment: this.currentEnvironment,
            version: 1,
            updatedAt: Date.now(),
            encrypted: false
          });
          this.updateCache(key, value);
          count++;
        }
        this.emit("sourceLoaded", sourceConfig, count);
      } catch (error) {
        this.emit("sourceError", sourceConfig, error instanceof Error ? error : new Error(String(error)));
      }
    }
    this.emit("reloaded", Array.from(this.cache.keys()));
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async start() {
    if (this.running) return;
    this.running = true;
    await this.loadFromSources();
    if (this.config.hotReload?.enabled) {
      this.hotReloadInterval = setInterval(() => {
        this.loadFromSources().catch((err) => this.emit("error", err));
      }, (this.config.hotReload.intervalSeconds ?? 30) * 1e3);
    }
    this.emit("initialized");
  }
  async stop() {
    this.running = false;
    if (this.hotReloadInterval) {
      clearInterval(this.hotReloadInterval);
      this.hotReloadInterval = void 0;
    }
    this.emit("shutDown");
  }
  isRunning() {
    return this.running;
  }
};
var defaultManager5 = null;
function getConfigManager() {
  if (!defaultManager5) {
    defaultManager5 = new ConfigManager();
  }
  return defaultManager5;
}
function createConfigManager(config) {
  return new ConfigManager(config);
}

// src/multiregion/types.ts
import { z as z21 } from "zod";
var RegionIdSchema = z21.string().regex(/^[a-z]{2,3}-[a-z]+-\d+$/, "Region ID format: us-east-1");
var RegionStatusSchema2 = z21.enum([
  "active",
  // Region is healthy and serving traffic
  "degraded",
  // Region has issues but still serving
  "draining",
  // Region is being drained for maintenance
  "inactive",
  // Region is offline
  "provisioning"
  // Region is being set up
]);
var RegionRoleSchema = z21.enum([
  "primary",
  // Primary region for writes
  "secondary",
  // Secondary region for reads
  "standby",
  // Hot standby for failover
  "disaster_recovery"
  // DR site
]);
var RegionDefinitionSchema = z21.object({
  id: RegionIdSchema,
  name: z21.string(),
  displayName: z21.string().optional(),
  provider: z21.enum(["aws", "gcp", "azure", "custom"]),
  role: RegionRoleSchema.default("secondary"),
  status: RegionStatusSchema2.default("active"),
  // Location
  location: z21.object({
    country: z21.string(),
    city: z21.string().optional(),
    latitude: z21.number().optional(),
    longitude: z21.number().optional()
  }),
  // Capacity
  capacity: z21.object({
    maxConnections: z21.number().default(1e4),
    maxRPS: z21.number().default(1e4),
    currentLoad: z21.number().default(0)
  }).optional(),
  // Endpoints
  endpoints: z21.object({
    api: z21.string().optional(),
    internal: z21.string().optional(),
    database: z21.string().optional(),
    cache: z21.string().optional()
  }).optional(),
  // Metadata
  tags: z21.array(z21.string()).default([]),
  metadata: z21.record(z21.unknown()).optional(),
  createdAt: z21.number(),
  updatedAt: z21.number()
});
var ReplicationModeSchema2 = z21.enum([
  "sync",
  // Synchronous replication (strong consistency)
  "async",
  // Asynchronous replication (eventual consistency)
  "semi_sync"
  // Semi-synchronous (ack from at least one replica)
]);
var ConflictResolutionSchema = z21.enum([
  "last_write_wins",
  // LWW based on timestamp
  "first_write_wins",
  // FWW
  "merge",
  // Automatic merge
  "custom",
  // Custom resolver
  "manual"
  // Queue for manual resolution
]);
var ReplicationConfigSchema2 = z21.object({
  mode: ReplicationModeSchema2.default("async"),
  conflictResolution: ConflictResolutionSchema.default("last_write_wins"),
  // Targets
  sourceRegion: RegionIdSchema,
  targetRegions: z21.array(RegionIdSchema),
  // Filters
  includeCollections: z21.array(z21.string()).optional(),
  excludeCollections: z21.array(z21.string()).optional(),
  filter: z21.string().optional().describe("Custom filter expression"),
  // Timing
  batchSize: z21.number().default(100),
  batchIntervalMs: z21.number().default(100),
  maxLagMs: z21.number().default(5e3).describe("Max acceptable replication lag"),
  // Retry
  retryAttempts: z21.number().default(3),
  retryBackoffMs: z21.number().default(1e3)
});
var ReplicationStatusSchema2 = z21.object({
  sourceRegion: RegionIdSchema,
  targetRegion: RegionIdSchema,
  status: z21.enum(["active", "paused", "error", "catching_up"]),
  lagMs: z21.number(),
  lastSyncedAt: z21.number().optional(),
  pendingOperations: z21.number(),
  bytesReplicated: z21.number(),
  errors: z21.array(z21.object({
    timestamp: z21.number(),
    message: z21.string(),
    retryCount: z21.number()
  })).default([])
});
var ConflictSchema = z21.object({
  id: z21.string(),
  timestamp: z21.number(),
  collection: z21.string(),
  documentId: z21.string(),
  sourceRegion: RegionIdSchema,
  targetRegion: RegionIdSchema,
  sourceVersion: z21.unknown(),
  targetVersion: z21.unknown(),
  resolution: ConflictResolutionSchema.optional(),
  resolvedAt: z21.number().optional(),
  resolvedBy: z21.string().optional(),
  resolvedValue: z21.unknown().optional()
});
var RoutingStrategySchema = z21.enum([
  "latency",
  // Route to lowest latency region
  "geo",
  // Route based on geography
  "round_robin",
  // Round robin across regions
  "weighted",
  // Weighted distribution
  "failover",
  // Primary with failover
  "custom"
  // Custom routing logic
]);
var RoutingRuleSchema = z21.object({
  id: z21.string(),
  name: z21.string(),
  priority: z21.number().default(0),
  enabled: z21.boolean().default(true),
  // Conditions
  conditions: z21.array(z21.object({
    type: z21.enum(["geo", "header", "path", "query", "custom"]),
    field: z21.string(),
    operator: z21.enum(["eq", "neq", "contains", "starts_with", "in"]),
    value: z21.unknown()
  })).default([]),
  // Action
  action: z21.object({
    type: z21.enum(["route", "redirect", "reject"]),
    regions: z21.array(RegionIdSchema).optional(),
    weights: z21.record(z21.number()).optional()
  })
});
var RoutingDecisionSchema = z21.object({
  requestId: z21.string(),
  timestamp: z21.number(),
  sourceRegion: RegionIdSchema.optional(),
  targetRegion: RegionIdSchema,
  strategy: RoutingStrategySchema,
  ruleId: z21.string().optional(),
  latencyMs: z21.number().optional(),
  metadata: z21.record(z21.unknown()).optional()
});
var SyncOperationSchema = z21.object({
  id: z21.string(),
  type: z21.enum(["create", "update", "delete"]),
  collection: z21.string(),
  documentId: z21.string(),
  data: z21.unknown().optional(),
  timestamp: z21.number(),
  sourceRegion: RegionIdSchema,
  vectorClock: z21.record(z21.number()).optional()
});
var SyncBatchSchema = z21.object({
  id: z21.string(),
  sourceRegion: RegionIdSchema,
  targetRegion: RegionIdSchema,
  operations: z21.array(SyncOperationSchema),
  createdAt: z21.number(),
  sentAt: z21.number().optional(),
  ackedAt: z21.number().optional(),
  status: z21.enum(["pending", "sent", "acked", "failed"])
});
var RegionHealthSchema = z21.object({
  regionId: RegionIdSchema,
  timestamp: z21.number(),
  status: RegionStatusSchema2,
  latencyMs: z21.number(),
  errorRate: z21.number(),
  availability: z21.number(),
  cpuUsage: z21.number().optional(),
  memoryUsage: z21.number().optional(),
  activeConnections: z21.number().optional(),
  replicationLagMs: z21.number().optional()
});
var FailoverTriggerSchema = z21.enum([
  "manual",
  // Manual failover
  "health_check",
  // Automated based on health
  "latency",
  // Latency threshold exceeded
  "error_rate",
  // Error rate threshold exceeded
  "scheduled"
  // Scheduled maintenance
]);
var FailoverEventSchema2 = z21.object({
  id: z21.string(),
  timestamp: z21.number(),
  trigger: FailoverTriggerSchema,
  fromRegion: RegionIdSchema,
  toRegion: RegionIdSchema,
  reason: z21.string(),
  duration: z21.number().optional(),
  status: z21.enum(["initiated", "in_progress", "completed", "failed", "rolled_back"]),
  initiatedBy: z21.string().optional()
});
var MultiRegionConfigSchema = z21.object({
  // Current region
  currentRegion: RegionIdSchema,
  // Regions
  regions: z21.array(RegionDefinitionSchema).min(1),
  // Replication
  replication: ReplicationConfigSchema2.optional(),
  // Routing
  routing: z21.object({
    strategy: RoutingStrategySchema.default("latency"),
    rules: z21.array(RoutingRuleSchema).default([]),
    weights: z21.record(z21.number()).optional()
  }).optional(),
  // Failover
  failover: z21.object({
    enabled: z21.boolean().default(true),
    healthCheckIntervalSeconds: z21.number().default(10),
    failoverThreshold: z21.number().default(3).describe("Consecutive failures before failover"),
    autoFailback: z21.boolean().default(false),
    failbackDelaySeconds: z21.number().default(300)
  }).optional(),
  // Sync
  sync: z21.object({
    enabled: z21.boolean().default(true),
    batchSize: z21.number().default(100),
    flushIntervalMs: z21.number().default(100)
  }).optional(),
  // Consistency
  consistency: z21.object({
    readConsistency: z21.enum(["eventual", "session", "strong"]).default("eventual"),
    writeConsistency: z21.enum(["local", "quorum", "all"]).default("local")
  }).optional()
});
var DEFAULT_REGIONS = {
  "us-east-1": { name: "US East (N. Virginia)", provider: "aws", location: { country: "US", city: "Virginia" } },
  "us-west-2": { name: "US West (Oregon)", provider: "aws", location: { country: "US", city: "Oregon" } },
  "eu-west-1": { name: "EU (Ireland)", provider: "aws", location: { country: "IE", city: "Dublin" } },
  "eu-central-1": { name: "EU (Frankfurt)", provider: "aws", location: { country: "DE", city: "Frankfurt" } },
  "ap-southeast-1": { name: "Asia Pacific (Singapore)", provider: "aws", location: { country: "SG", city: "Singapore" } },
  "ap-northeast-1": { name: "Asia Pacific (Tokyo)", provider: "aws", location: { country: "JP", city: "Tokyo" } }
};
var REPLICATION_LAG_THRESHOLDS = {
  healthy: 100,
  // < 100ms
  warning: 1e3,
  // 100ms - 1s
  critical: 5e3
  // > 5s
};

// src/multiregion/region-manager.ts
import { EventEmitter as EventEmitter23 } from "eventemitter3";
import { randomUUID as randomUUID12 } from "crypto";
var InMemoryMultiRegionStorage = class {
  regions = /* @__PURE__ */ new Map();
  replicationStatus = /* @__PURE__ */ new Map();
  conflicts = /* @__PURE__ */ new Map();
  syncQueue = /* @__PURE__ */ new Map();
  failoverHistory = [];
  healthData = /* @__PURE__ */ new Map();
  getReplicationKey(source, target) {
    return `${source}:${target}`;
  }
  async getRegion(id) {
    return this.regions.get(id) ?? null;
  }
  async saveRegion(region) {
    this.regions.set(region.id, region);
  }
  async deleteRegion(id) {
    this.regions.delete(id);
  }
  async listRegions() {
    return Array.from(this.regions.values());
  }
  async getReplicationStatus(sourceRegion, targetRegion) {
    return this.replicationStatus.get(this.getReplicationKey(sourceRegion, targetRegion)) ?? null;
  }
  async saveReplicationStatus(status) {
    this.replicationStatus.set(this.getReplicationKey(status.sourceRegion, status.targetRegion), status);
  }
  async saveConflict(conflict) {
    this.conflicts.set(conflict.id, conflict);
  }
  async getConflict(id) {
    return this.conflicts.get(id) ?? null;
  }
  async listConflicts(filters) {
    let results = Array.from(this.conflicts.values());
    if (filters?.resolved !== void 0) {
      results = results.filter((c) => c.resolvedAt !== void 0 === filters.resolved);
    }
    return results;
  }
  async enqueueSyncOperation(operation) {
    for (const region of this.regions.values()) {
      if (region.id === operation.sourceRegion) continue;
      const queue = this.syncQueue.get(region.id) ?? [];
      queue.push(operation);
      this.syncQueue.set(region.id, queue);
    }
  }
  async dequeueSyncOperations(targetRegion, limit) {
    const queue = this.syncQueue.get(targetRegion) ?? [];
    const ops = queue.splice(0, limit);
    this.syncQueue.set(targetRegion, queue);
    return ops;
  }
  async ackSyncOperations(ids) {
  }
  async saveFailoverEvent(event) {
    this.failoverHistory.unshift(event);
    if (this.failoverHistory.length > 100) {
      this.failoverHistory.pop();
    }
  }
  async getFailoverHistory(limit = 50) {
    return this.failoverHistory.slice(0, limit);
  }
  async saveRegionHealth(health) {
    this.healthData.set(health.regionId, health);
  }
  async getRegionHealth(regionId) {
    return this.healthData.get(regionId) ?? null;
  }
};
var MultiRegionManager = class extends EventEmitter23 {
  config;
  storage;
  healthCheckInterval;
  syncInterval;
  failedHealthChecks = /* @__PURE__ */ new Map();
  running = false;
  constructor(config) {
    super();
    this.config = MultiRegionConfigSchema.parse(config);
    this.storage = new InMemoryMultiRegionStorage();
    for (const region of this.config.regions) {
      this.storage.saveRegion(region);
    }
  }
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  setStorage(storage) {
    this.storage = storage;
  }
  getCurrentRegion() {
    return this.config.currentRegion;
  }
  // ---------------------------------------------------------------------------
  // Region Management
  // ---------------------------------------------------------------------------
  async addRegion(region) {
    const now = Date.now();
    const fullRegion = RegionDefinitionSchema.parse({
      ...region,
      createdAt: now,
      updatedAt: now
    });
    await this.storage.saveRegion(fullRegion);
    this.emit("regionAdded", fullRegion);
    return fullRegion;
  }
  async getRegion(id) {
    return this.storage.getRegion(id);
  }
  async updateRegion(id, updates) {
    const existing = await this.storage.getRegion(id);
    if (!existing) return null;
    const previousStatus = existing.status;
    const previousRole = existing.role;
    const updated = RegionDefinitionSchema.parse({
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now()
    });
    await this.storage.saveRegion(updated);
    if (updates.status && updates.status !== previousStatus) {
      this.emit("regionStatusChanged", id, updates.status, previousStatus);
    }
    if (updates.role && updates.role !== previousRole) {
      this.emit("regionRoleChanged", id, updates.role, previousRole);
    }
    return updated;
  }
  async removeRegion(id) {
    const existing = await this.storage.getRegion(id);
    if (!existing) return false;
    if (id === this.config.currentRegion) {
      throw new Error("Cannot remove current region");
    }
    await this.storage.deleteRegion(id);
    this.emit("regionRemoved", id);
    return true;
  }
  async listRegions() {
    return this.storage.listRegions();
  }
  async getActiveRegions() {
    const regions = await this.storage.listRegions();
    return regions.filter((r) => r.status === "active" || r.status === "degraded");
  }
  async getPrimaryRegion() {
    const regions = await this.storage.listRegions();
    return regions.find((r) => r.role === "primary") ?? null;
  }
  // ---------------------------------------------------------------------------
  // Routing
  // ---------------------------------------------------------------------------
  async routeRequest(context) {
    const requestId = randomUUID12();
    const startTime = Date.now();
    const strategy = this.config.routing?.strategy ?? "latency";
    const rules = this.config.routing?.rules ?? [];
    const activeRegions = await this.getActiveRegions();
    if (activeRegions.length === 0) {
      throw new Error("No active regions available");
    }
    let targetRegion;
    let matchedRuleId;
    for (const rule of rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority)) {
      if (this.matchesRoutingRule(rule, context)) {
        if (rule.action.type === "route" && rule.action.regions?.length) {
          targetRegion = rule.action.regions.find((r) => activeRegions.some((ar) => ar.id === r));
          matchedRuleId = rule.id;
          break;
        }
      }
    }
    if (!targetRegion) {
      targetRegion = await this.selectRegionByStrategy(strategy, activeRegions, context);
    }
    const decision = {
      requestId,
      timestamp: startTime,
      sourceRegion: context.geo?.region,
      targetRegion: targetRegion ?? activeRegions[0].id,
      strategy,
      ruleId: matchedRuleId,
      latencyMs: Date.now() - startTime
    };
    this.emit("routingDecision", decision);
    return decision;
  }
  matchesRoutingRule(rule, context) {
    if (rule.conditions.length === 0) return true;
    return rule.conditions.every((cond) => {
      let value;
      switch (cond.type) {
        case "geo":
          value = context.geo?.[cond.field];
          break;
        case "header":
          value = context.headers?.[cond.field];
          break;
        case "path":
          value = context.path;
          break;
        default:
          return false;
      }
      switch (cond.operator) {
        case "eq":
          return value === cond.value;
        case "neq":
          return value !== cond.value;
        case "contains":
          return typeof value === "string" && typeof cond.value === "string" && value.includes(cond.value);
        case "starts_with":
          return typeof value === "string" && typeof cond.value === "string" && value.startsWith(cond.value);
        case "in":
          return Array.isArray(cond.value) && cond.value.includes(value);
        default:
          return false;
      }
    });
  }
  async selectRegionByStrategy(strategy, regions, context) {
    switch (strategy) {
      case "latency":
        if (context.clientLatencies) {
          const sorted = regions.sort((a, b) => {
            const latA = context.clientLatencies[a.id] ?? Infinity;
            const latB = context.clientLatencies[b.id] ?? Infinity;
            return latA - latB;
          });
          return sorted[0].id;
        }
      // Fall through to geo if no latencies
      case "geo":
        if (context.geo?.country) {
          const sameCountry = regions.find((r) => r.location.country === context.geo.country);
          if (sameCountry) return sameCountry.id;
        }
      // Fall through to failover
      case "failover":
        const primary = regions.find((r) => r.role === "primary" && r.status === "active");
        if (primary) return primary.id;
        const secondary = regions.find((r) => r.status === "active");
        return secondary?.id ?? regions[0].id;
      case "round_robin":
        const idx = Math.floor(Math.random() * regions.length);
        return regions[idx].id;
      case "weighted":
        const weights = this.config.routing?.weights ?? {};
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        if (totalWeight === 0) return regions[0].id;
        let random = Math.random() * totalWeight;
        for (const region of regions) {
          random -= weights[region.id] ?? 0;
          if (random <= 0) return region.id;
        }
        return regions[0].id;
      default:
        return regions[0].id;
    }
  }
  // ---------------------------------------------------------------------------
  // Replication
  // ---------------------------------------------------------------------------
  async enqueueReplication(operation) {
    const fullOp = {
      ...operation,
      id: randomUUID12(),
      timestamp: Date.now(),
      sourceRegion: this.config.currentRegion
    };
    await this.storage.enqueueSyncOperation(fullOp);
  }
  async getReplicationStatus(targetRegion) {
    return this.storage.getReplicationStatus(this.config.currentRegion, targetRegion);
  }
  async getAllReplicationStatus() {
    const regions = await this.storage.listRegions();
    const statuses = [];
    for (const region of regions) {
      if (region.id === this.config.currentRegion) continue;
      const status = await this.storage.getReplicationStatus(this.config.currentRegion, region.id);
      if (status) {
        statuses.push(status);
      }
    }
    return statuses;
  }
  async processSyncQueue() {
    const regions = await this.storage.listRegions();
    for (const region of regions) {
      if (region.id === this.config.currentRegion) continue;
      if (region.status !== "active" && region.status !== "degraded") continue;
      const batchSize = this.config.sync?.batchSize ?? 100;
      const operations = await this.storage.dequeueSyncOperations(region.id, batchSize);
      if (operations.length === 0) continue;
      const batch = {
        id: randomUUID12(),
        sourceRegion: this.config.currentRegion,
        targetRegion: region.id,
        operations,
        createdAt: Date.now(),
        status: "pending"
      };
      batch.status = "sent";
      batch.sentAt = Date.now();
      this.emit("syncBatchSent", batch);
      batch.status = "acked";
      batch.ackedAt = Date.now();
      this.emit("syncBatchAcked", batch.id);
      const status = {
        sourceRegion: this.config.currentRegion,
        targetRegion: region.id,
        status: "active",
        lagMs: Date.now() - operations[operations.length - 1].timestamp,
        lastSyncedAt: Date.now(),
        pendingOperations: 0,
        bytesReplicated: JSON.stringify(operations).length,
        errors: []
      };
      await this.storage.saveReplicationStatus(status);
      if (status.lagMs > REPLICATION_LAG_THRESHOLDS.critical) {
        this.emit("replicationLagWarning", region.id, status.lagMs);
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Conflict Resolution
  // ---------------------------------------------------------------------------
  async detectConflict(collection, documentId, sourceVersion, targetVersion, targetRegion) {
    const conflict = {
      id: randomUUID12(),
      timestamp: Date.now(),
      collection,
      documentId,
      sourceRegion: this.config.currentRegion,
      targetRegion,
      sourceVersion,
      targetVersion
    };
    await this.storage.saveConflict(conflict);
    this.emit("conflictDetected", conflict);
    return conflict;
  }
  async resolveConflict(conflictId, resolution, resolvedValue, resolvedBy) {
    const conflict = await this.storage.getConflict(conflictId);
    if (!conflict) return null;
    const resolved = {
      ...conflict,
      resolution,
      resolvedAt: Date.now(),
      resolvedBy,
      resolvedValue
    };
    await this.storage.saveConflict(resolved);
    this.emit("conflictResolved", resolved);
    return resolved;
  }
  async listConflicts(resolved) {
    return this.storage.listConflicts({ resolved });
  }
  // ---------------------------------------------------------------------------
  // Failover
  // ---------------------------------------------------------------------------
  async initiateFailover(fromRegion, toRegion, trigger, reason, initiatedBy) {
    const event = {
      id: randomUUID12(),
      timestamp: Date.now(),
      trigger,
      fromRegion,
      toRegion,
      reason,
      status: "initiated",
      initiatedBy
    };
    await this.storage.saveFailoverEvent(event);
    this.emit("failoverInitiated", event);
    try {
      await this.updateRegion(fromRegion, { role: "standby", status: "draining" });
      await this.updateRegion(toRegion, { role: "primary", status: "active" });
      event.status = "completed";
      event.duration = Date.now() - event.timestamp;
      await this.storage.saveFailoverEvent(event);
      this.emit("failoverCompleted", event);
    } catch (error) {
      event.status = "failed";
      await this.storage.saveFailoverEvent(event);
      this.emit("failoverFailed", event, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
    return event;
  }
  async getFailoverHistory(limit) {
    return this.storage.getFailoverHistory(limit);
  }
  // ---------------------------------------------------------------------------
  // Health Checks
  // ---------------------------------------------------------------------------
  async checkRegionHealth(regionId) {
    const region = await this.storage.getRegion(regionId);
    if (!region) {
      throw new Error(`Region not found: ${regionId}`);
    }
    const health = {
      regionId,
      timestamp: Date.now(),
      status: region.status,
      latencyMs: Math.random() * 100 + 10,
      // 10-110ms
      errorRate: Math.random() * 0.01,
      // 0-1%
      availability: 99.9 + Math.random() * 0.1,
      // 99.9-100%
      cpuUsage: Math.random() * 50 + 20,
      // 20-70%
      memoryUsage: Math.random() * 40 + 30,
      // 30-70%
      activeConnections: Math.floor(Math.random() * 1e3)
    };
    await this.storage.saveRegionHealth(health);
    this.emit("healthCheck", health);
    return health;
  }
  async getRegionHealth(regionId) {
    return this.storage.getRegionHealth(regionId);
  }
  async runHealthChecks() {
    const regions = await this.storage.listRegions();
    for (const region of regions) {
      try {
        const health = await this.checkRegionHealth(region.id);
        const isUnhealthy = health.errorRate > 0.05 || health.availability < 99;
        if (isUnhealthy) {
          const failCount = (this.failedHealthChecks.get(region.id) ?? 0) + 1;
          this.failedHealthChecks.set(region.id, failCount);
          if (failCount >= (this.config.failover?.failoverThreshold ?? 3)) {
            this.emit("regionUnhealthy", region.id, health);
            if (this.config.failover?.enabled && region.role === "primary") {
              const standby = regions.find((r) => r.role === "standby" && r.status === "active");
              if (standby) {
                await this.initiateFailover(
                  region.id,
                  standby.id,
                  "health_check",
                  `Region ${region.id} failed ${failCount} consecutive health checks`
                );
              }
            }
          }
        } else {
          const prevFailCount = this.failedHealthChecks.get(region.id) ?? 0;
          if (prevFailCount > 0) {
            this.failedHealthChecks.set(region.id, 0);
            this.emit("regionRecovered", region.id);
          }
        }
      } catch (error) {
        this.emit("error", error instanceof Error ? error : new Error(String(error)));
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async start() {
    if (this.running) return;
    this.running = true;
    if (this.config.failover?.enabled) {
      const interval = (this.config.failover.healthCheckIntervalSeconds ?? 10) * 1e3;
      this.healthCheckInterval = setInterval(() => {
        this.runHealthChecks().catch((err) => this.emit("error", err));
      }, interval);
    }
    if (this.config.sync?.enabled) {
      const interval = this.config.sync.flushIntervalMs ?? 100;
      this.syncInterval = setInterval(() => {
        this.processSyncQueue().catch((err) => this.emit("error", err));
      }, interval);
    }
  }
  async stop() {
    this.running = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = void 0;
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = void 0;
    }
  }
  isRunning() {
    return this.running;
  }
};
var defaultManager6 = null;
function getMultiRegionManager() {
  if (!defaultManager6) {
    throw new Error("MultiRegionManager not initialized. Call createMultiRegionManager first.");
  }
  return defaultManager6;
}
function createMultiRegionManager(config) {
  defaultManager6 = new MultiRegionManager(config);
  return defaultManager6;
}

// src/deployment/types.ts
import { z as z22 } from "zod";
var DeploymentStrategySchema = z22.enum([
  "rolling",
  // Rolling update (replace instances gradually)
  "blue_green",
  // Blue/green deployment (switch between two environments)
  "canary",
  // Canary deployment (gradual traffic shift)
  "recreate",
  // Recreate (stop old, start new)
  "shadow",
  // Shadow deployment (duplicate traffic)
  "feature_flag"
  // Feature flag controlled
]);
var DeploymentStatusSchema = z22.enum([
  "pending",
  // Waiting to start
  "running",
  // In progress
  "paused",
  // Manually paused
  "completed",
  // Successfully finished
  "failed",
  // Failed
  "rolled_back",
  // Rolled back
  "cancelled"
  // Cancelled by user
]);
var SemanticVersionSchema = z22.string().regex(
  /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/,
  "Must be valid semver"
);
var ArtifactTypeSchema = z22.enum([
  "docker",
  // Docker image
  "npm",
  // NPM package
  "binary",
  // Binary executable
  "archive",
  // Archive (zip, tar)
  "serverless"
  // Serverless function
]);
var ArtifactSchema = z22.object({
  id: z22.string(),
  type: ArtifactTypeSchema,
  name: z22.string(),
  version: SemanticVersionSchema,
  digest: z22.string().optional().describe("SHA256 digest"),
  size: z22.number().optional().describe("Size in bytes"),
  registry: z22.string().optional(),
  url: z22.string().optional(),
  metadata: z22.record(z22.unknown()).optional(),
  createdAt: z22.number()
});
var DeploymentEnvironmentSchema = z22.enum([
  "development",
  "staging",
  "production",
  "canary",
  "preview"
]);
var DeploymentTargetSchema = z22.object({
  id: z22.string(),
  name: z22.string(),
  type: z22.enum(["kubernetes", "ecs", "lambda", "vm", "container", "static"]),
  environment: DeploymentEnvironmentSchema,
  region: z22.string().optional(),
  cluster: z22.string().optional(),
  namespace: z22.string().optional(),
  replicas: z22.number().optional(),
  config: z22.record(z22.unknown()).optional()
});
var RollingConfigSchema = z22.object({
  maxSurge: z22.number().default(25).describe("Max % of instances above desired"),
  maxUnavailable: z22.number().default(25).describe("Max % unavailable during update"),
  minReadySeconds: z22.number().default(30)
});
var BlueGreenConfigSchema = z22.object({
  blueTarget: z22.string().describe("Blue environment target ID"),
  greenTarget: z22.string().describe("Green environment target ID"),
  switchTrafficPercent: z22.number().default(100).describe("Traffic % to switch"),
  warmupSeconds: z22.number().default(60)
});
var CanaryConfigSchema = z22.object({
  steps: z22.array(z22.object({
    percent: z22.number().min(0).max(100),
    durationSeconds: z22.number(),
    pauseForAnalysis: z22.boolean().default(false)
  })),
  analysisInterval: z22.number().default(60).describe("Analysis interval in seconds"),
  successThreshold: z22.number().default(95).describe("Success rate threshold %"),
  errorThreshold: z22.number().default(5).describe("Error rate threshold %"),
  latencyThreshold: z22.number().default(500).describe("P99 latency threshold in ms")
});
var StrategyConfigSchema = z22.object({
  rolling: RollingConfigSchema.optional(),
  blueGreen: BlueGreenConfigSchema.optional(),
  canary: CanaryConfigSchema.optional()
});
var DeploymentDefinitionSchema = z22.object({
  id: z22.string(),
  name: z22.string(),
  description: z22.string().optional(),
  // What to deploy
  artifact: ArtifactSchema,
  previousArtifact: ArtifactSchema.optional(),
  // Where to deploy
  targets: z22.array(DeploymentTargetSchema),
  environment: DeploymentEnvironmentSchema,
  // How to deploy
  strategy: DeploymentStrategySchema,
  strategyConfig: StrategyConfigSchema.optional(),
  // Gates & Approvals
  requiresApproval: z22.boolean().default(false),
  approvers: z22.array(z22.string()).default([]),
  preDeploymentChecks: z22.array(z22.string()).default([]),
  postDeploymentChecks: z22.array(z22.string()).default([]),
  // Rollback
  autoRollback: z22.boolean().default(true),
  rollbackOnFailedChecks: z22.boolean().default(true),
  // Notifications
  notifyChannels: z22.array(z22.string()).default([]),
  // Metadata
  labels: z22.record(z22.string()).default({}),
  annotations: z22.record(z22.string()).default({}),
  createdAt: z22.number(),
  createdBy: z22.string().optional()
});
var DeploymentPhaseSchema = z22.enum([
  "validation",
  // Validating deployment configuration
  "approval",
  // Waiting for approval
  "preparation",
  // Preparing artifacts
  "pre_checks",
  // Running pre-deployment checks
  "deploying",
  // Actively deploying
  "canary_analysis",
  // Analyzing canary metrics
  "traffic_shift",
  // Shifting traffic
  "post_checks",
  // Running post-deployment checks
  "cleanup",
  // Cleaning up old resources
  "finalization"
  // Finalizing deployment
]);
var DeploymentStateSchema = z22.object({
  deploymentId: z22.string(),
  status: DeploymentStatusSchema,
  phase: DeploymentPhaseSchema,
  startedAt: z22.number(),
  updatedAt: z22.number(),
  completedAt: z22.number().optional(),
  // Progress
  progress: z22.number().min(0).max(100),
  currentStep: z22.number(),
  totalSteps: z22.number(),
  // Traffic (for canary)
  trafficPercent: z22.number().default(0),
  // Instances
  totalInstances: z22.number().default(0),
  updatedInstances: z22.number().default(0),
  healthyInstances: z22.number().default(0),
  unhealthyInstances: z22.number().default(0),
  // Errors
  errors: z22.array(z22.object({
    timestamp: z22.number(),
    phase: DeploymentPhaseSchema,
    message: z22.string(),
    details: z22.record(z22.unknown()).optional()
  })).default([]),
  // Logs
  logs: z22.array(z22.object({
    timestamp: z22.number(),
    level: z22.enum(["debug", "info", "warn", "error"]),
    message: z22.string()
  })).default([])
});
var CheckResultSchema = z22.object({
  id: z22.string(),
  name: z22.string(),
  type: z22.enum(["health", "smoke", "load", "security", "custom"]),
  status: z22.enum(["pending", "running", "passed", "failed", "skipped"]),
  startedAt: z22.number().optional(),
  completedAt: z22.number().optional(),
  duration: z22.number().optional(),
  message: z22.string().optional(),
  details: z22.record(z22.unknown()).optional()
});
var ApprovalStatusSchema = z22.enum([
  "pending",
  "approved",
  "rejected",
  "expired"
]);
var ApprovalSchema = z22.object({
  id: z22.string(),
  deploymentId: z22.string(),
  status: ApprovalStatusSchema,
  requestedAt: z22.number(),
  requestedBy: z22.string().optional(),
  respondedAt: z22.number().optional(),
  respondedBy: z22.string().optional(),
  comment: z22.string().optional(),
  expiresAt: z22.number().optional()
});
var DeploymentMetricsSchema = z22.object({
  deploymentId: z22.string(),
  timestamp: z22.number(),
  requestCount: z22.number(),
  errorCount: z22.number(),
  errorRate: z22.number(),
  latencyP50: z22.number(),
  latencyP95: z22.number(),
  latencyP99: z22.number(),
  cpuUsage: z22.number().optional(),
  memoryUsage: z22.number().optional(),
  custom: z22.record(z22.number()).optional()
});
var AnalysisResultSchema = z22.object({
  deploymentId: z22.string(),
  timestamp: z22.number(),
  verdict: z22.enum(["pass", "fail", "inconclusive"]),
  score: z22.number().min(0).max(100),
  metrics: DeploymentMetricsSchema,
  thresholds: z22.record(z22.number()),
  violations: z22.array(z22.object({
    metric: z22.string(),
    expected: z22.number(),
    actual: z22.number()
  })).default([])
});
var RollbackReasonSchema = z22.enum([
  "manual",
  // Manual rollback
  "failed_checks",
  // Pre/post checks failed
  "error_threshold",
  // Error rate exceeded
  "latency_threshold",
  // Latency exceeded
  "health_check",
  // Health check failure
  "approval_rejected",
  // Approval was rejected
  "timeout"
  // Deployment timed out
]);
var RollbackSchema = z22.object({
  id: z22.string(),
  deploymentId: z22.string(),
  reason: RollbackReasonSchema,
  initiatedAt: z22.number(),
  completedAt: z22.number().optional(),
  status: z22.enum(["in_progress", "completed", "failed"]),
  targetArtifact: ArtifactSchema,
  initiatedBy: z22.string().optional(),
  message: z22.string().optional()
});
var DeploymentManagerConfigSchema = z22.object({
  // Defaults
  defaultStrategy: DeploymentStrategySchema.default("rolling"),
  defaultEnvironment: DeploymentEnvironmentSchema.default("staging"),
  // Timeouts
  deploymentTimeoutSeconds: z22.number().default(1800),
  // 30 min
  approvalTimeoutSeconds: z22.number().default(86400),
  // 24 hours
  checkTimeoutSeconds: z22.number().default(300),
  // 5 min
  // Analysis
  analysisIntervalSeconds: z22.number().default(30),
  metricsRetentionDays: z22.number().default(30),
  // Rollback
  autoRollbackEnabled: z22.boolean().default(true),
  rollbackCooldownSeconds: z22.number().default(300),
  // Notifications
  notifyOnStart: z22.boolean().default(true),
  notifyOnComplete: z22.boolean().default(true),
  notifyOnFailure: z22.boolean().default(true),
  notifyOnRollback: z22.boolean().default(true),
  // Integrations
  metricsProvider: z22.enum(["prometheus", "datadog", "cloudwatch", "custom"]).optional(),
  notificationProvider: z22.enum(["slack", "email", "webhook", "custom"]).optional()
});

// src/deployment/deployment-manager.ts
import { EventEmitter as EventEmitter24 } from "eventemitter3";
import { randomUUID as randomUUID13 } from "crypto";
var InMemoryDeploymentStorage = class {
  deployments = /* @__PURE__ */ new Map();
  states = /* @__PURE__ */ new Map();
  approvals = /* @__PURE__ */ new Map();
  checks = /* @__PURE__ */ new Map();
  metrics = /* @__PURE__ */ new Map();
  rollbacks = /* @__PURE__ */ new Map();
  artifacts = /* @__PURE__ */ new Map();
  async getDeployment(id) {
    return this.deployments.get(id) ?? null;
  }
  async saveDeployment(deployment) {
    this.deployments.set(deployment.id, deployment);
  }
  async listDeployments(filters) {
    let results = Array.from(this.deployments.values());
    if (filters?.environment) {
      results = results.filter((d) => d.environment === filters.environment);
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }
  async getState(deploymentId) {
    return this.states.get(deploymentId) ?? null;
  }
  async saveState(state) {
    this.states.set(state.deploymentId, state);
  }
  async getApproval(deploymentId) {
    return this.approvals.get(deploymentId) ?? null;
  }
  async saveApproval(approval) {
    this.approvals.set(approval.deploymentId, approval);
  }
  async saveCheckResult(deploymentId, result) {
    const checks = this.checks.get(deploymentId) ?? [];
    const idx = checks.findIndex((c) => c.id === result.id);
    if (idx >= 0) {
      checks[idx] = result;
    } else {
      checks.push(result);
    }
    this.checks.set(deploymentId, checks);
  }
  async getCheckResults(deploymentId) {
    return this.checks.get(deploymentId) ?? [];
  }
  async saveMetrics(metrics) {
    const existing = this.metrics.get(metrics.deploymentId) ?? [];
    existing.push(metrics);
    this.metrics.set(metrics.deploymentId, existing);
  }
  async getMetrics(deploymentId, startTime, endTime) {
    const all = this.metrics.get(deploymentId) ?? [];
    return all.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime);
  }
  async saveRollback(rollback) {
    const existing = this.rollbacks.get(rollback.deploymentId) ?? [];
    const idx = existing.findIndex((r) => r.id === rollback.id);
    if (idx >= 0) {
      existing[idx] = rollback;
    } else {
      existing.push(rollback);
    }
    this.rollbacks.set(rollback.deploymentId, existing);
  }
  async getRollback(id) {
    for (const rollbacks of this.rollbacks.values()) {
      const found = rollbacks.find((r) => r.id === id);
      if (found) return found;
    }
    return null;
  }
  async listRollbacks(deploymentId) {
    return this.rollbacks.get(deploymentId) ?? [];
  }
  async getArtifact(id) {
    return this.artifacts.get(id) ?? null;
  }
  async saveArtifact(artifact) {
    this.artifacts.set(artifact.id, artifact);
  }
  async listArtifacts(name) {
    return Array.from(this.artifacts.values()).filter((a) => a.name === name).sort((a, b) => b.createdAt - a.createdAt);
  }
};
var DeploymentManager = class extends EventEmitter24 {
  config;
  storage;
  activeDeployments = /* @__PURE__ */ new Map();
  running = false;
  constructor(config = {}) {
    super();
    this.config = DeploymentManagerConfigSchema.parse(config);
    this.storage = new InMemoryDeploymentStorage();
  }
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  setStorage(storage) {
    this.storage = storage;
  }
  // ---------------------------------------------------------------------------
  // Artifact Management
  // ---------------------------------------------------------------------------
  async registerArtifact(input) {
    const artifact = ArtifactSchema.parse({
      ...input,
      id: randomUUID13(),
      createdAt: Date.now()
    });
    await this.storage.saveArtifact(artifact);
    return artifact;
  }
  async getArtifact(id) {
    return this.storage.getArtifact(id);
  }
  async listArtifacts(name) {
    return this.storage.listArtifacts(name);
  }
  // ---------------------------------------------------------------------------
  // Deployment CRUD
  // ---------------------------------------------------------------------------
  async createDeployment(input) {
    const deployment = DeploymentDefinitionSchema.parse({
      ...input,
      id: randomUUID13(),
      createdAt: Date.now()
    });
    await this.storage.saveDeployment(deployment);
    const state = {
      deploymentId: deployment.id,
      status: "pending",
      phase: "validation",
      startedAt: Date.now(),
      updatedAt: Date.now(),
      progress: 0,
      currentStep: 0,
      totalSteps: this.calculateTotalSteps(deployment),
      trafficPercent: 0,
      totalInstances: 0,
      updatedInstances: 0,
      healthyInstances: 0,
      unhealthyInstances: 0,
      errors: [],
      logs: []
    };
    await this.storage.saveState(state);
    this.emit("deploymentCreated", deployment);
    return deployment;
  }
  async getDeployment(id) {
    return this.storage.getDeployment(id);
  }
  async listDeployments(filters) {
    return this.storage.listDeployments(filters);
  }
  async getState(deploymentId) {
    return this.storage.getState(deploymentId);
  }
  calculateTotalSteps(deployment) {
    let steps = 3;
    if (deployment.requiresApproval) steps++;
    if (deployment.preDeploymentChecks.length > 0) steps++;
    if (deployment.postDeploymentChecks.length > 0) steps++;
    if (deployment.strategy === "canary") {
      steps += deployment.strategyConfig?.canary?.steps.length ?? 0;
    }
    return steps;
  }
  // ---------------------------------------------------------------------------
  // Deployment Execution
  // ---------------------------------------------------------------------------
  async startDeployment(deploymentId) {
    const deployment = await this.storage.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }
    const state = await this.storage.getState(deploymentId);
    if (!state || state.status !== "pending") {
      throw new Error("Deployment is not in pending state");
    }
    await this.updateState(deploymentId, { status: "running" });
    this.emit("deploymentStarted", deploymentId);
    this.runDeployment(deployment).catch((error) => {
      this.emit("deploymentFailed", deploymentId, error);
    });
  }
  async runDeployment(deployment) {
    const deploymentId = deployment.id;
    try {
      await this.runPhase(deploymentId, "validation", async () => {
        await this.validateDeployment(deployment);
      });
      if (deployment.requiresApproval) {
        await this.runPhase(deploymentId, "approval", async () => {
          await this.waitForApproval(deploymentId);
        });
      }
      await this.runPhase(deploymentId, "preparation", async () => {
        await this.prepareDeployment(deployment);
      });
      if (deployment.preDeploymentChecks.length > 0) {
        await this.runPhase(deploymentId, "pre_checks", async () => {
          await this.runChecks(deploymentId, deployment.preDeploymentChecks, "pre");
        });
      }
      await this.runPhase(deploymentId, "deploying", async () => {
        await this.executeDeployment(deployment);
      });
      if (deployment.postDeploymentChecks.length > 0) {
        await this.runPhase(deploymentId, "post_checks", async () => {
          await this.runChecks(deploymentId, deployment.postDeploymentChecks, "post");
        });
      }
      await this.runPhase(deploymentId, "finalization", async () => {
        await this.finalizeDeployment(deployment);
      });
      const state = await this.storage.getState(deploymentId);
      const duration = Date.now() - (state?.startedAt ?? Date.now());
      await this.updateState(deploymentId, {
        status: "completed",
        progress: 100,
        completedAt: Date.now()
      });
      this.emit("deploymentCompleted", deploymentId, duration);
    } catch (error) {
      await this.handleDeploymentFailure(deployment, error instanceof Error ? error : new Error(String(error)));
    }
  }
  async runPhase(deploymentId, phase, execute) {
    const state = await this.storage.getState(deploymentId);
    if (!state || state.status !== "running") return;
    await this.updateState(deploymentId, { phase });
    this.emit("phaseStarted", deploymentId, phase);
    try {
      await execute();
      this.emit("phaseCompleted", deploymentId, phase);
    } catch (error) {
      this.emit("phaseFailed", deploymentId, phase, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
    const currentState = await this.storage.getState(deploymentId);
    if (currentState) {
      await this.updateState(deploymentId, {
        currentStep: currentState.currentStep + 1,
        progress: Math.round((currentState.currentStep + 1) / currentState.totalSteps * 100)
      });
    }
  }
  async validateDeployment(deployment) {
    if (!deployment.artifact) {
      throw new Error("No artifact specified");
    }
    if (!deployment.targets || deployment.targets.length === 0) {
      throw new Error("No deployment targets specified");
    }
    if (deployment.strategy === "canary" && !deployment.strategyConfig?.canary) {
      throw new Error("Canary strategy requires canary configuration");
    }
    if (deployment.strategy === "blue_green" && !deployment.strategyConfig?.blueGreen) {
      throw new Error("Blue/green strategy requires blueGreen configuration");
    }
    await this.addLog(deployment.id, "info", "Deployment validation completed");
  }
  async prepareDeployment(deployment) {
    await this.addLog(deployment.id, "info", `Preparing artifact: ${deployment.artifact.name}:${deployment.artifact.version}`);
    await this.sleep(500);
  }
  async executeDeployment(deployment) {
    switch (deployment.strategy) {
      case "rolling":
        await this.executeRollingDeployment(deployment);
        break;
      case "blue_green":
        await this.executeBlueGreenDeployment(deployment);
        break;
      case "canary":
        await this.executeCanaryDeployment(deployment);
        break;
      case "recreate":
        await this.executeRecreateDeployment(deployment);
        break;
      default:
        await this.executeRollingDeployment(deployment);
    }
  }
  async executeRollingDeployment(deployment) {
    const totalInstances = deployment.targets.reduce((sum, t) => sum + (t.replicas ?? 1), 0);
    await this.updateState(deployment.id, { totalInstances });
    for (let i = 0; i < totalInstances; i++) {
      await this.addLog(deployment.id, "info", `Updating instance ${i + 1}/${totalInstances}`);
      await this.sleep(100);
      await this.updateState(deployment.id, {
        updatedInstances: i + 1,
        healthyInstances: i + 1
      });
      this.emit("instanceUpdated", deployment.id, `instance-${i}`, true);
    }
  }
  async executeBlueGreenDeployment(deployment) {
    const config = deployment.strategyConfig?.blueGreen;
    if (!config) return;
    await this.addLog(deployment.id, "info", "Deploying to green environment");
    await this.sleep(500);
    await this.addLog(deployment.id, "info", "Warming up green environment");
    await this.sleep(config.warmupSeconds * 10);
    await this.addLog(deployment.id, "info", `Switching ${config.switchTrafficPercent}% traffic to green`);
    await this.updateState(deployment.id, { trafficPercent: config.switchTrafficPercent });
    this.emit("trafficShifted", deployment.id, config.switchTrafficPercent);
  }
  async executeCanaryDeployment(deployment) {
    const config = deployment.strategyConfig?.canary;
    if (!config) return;
    for (const step of config.steps) {
      await this.addLog(deployment.id, "info", `Shifting ${step.percent}% traffic to canary`);
      await this.updateState(deployment.id, { trafficPercent: step.percent, phase: "canary_analysis" });
      this.emit("trafficShifted", deployment.id, step.percent);
      await this.sleep(step.durationSeconds * 10);
      const metrics = await this.collectMetrics(deployment.id);
      const analysis = this.analyzeMetrics(deployment.id, metrics, config);
      this.emit("analysisCompleted", analysis);
      if (analysis.verdict === "fail") {
        throw new Error(`Canary analysis failed at ${step.percent}%: ${analysis.violations.map((v) => v.metric).join(", ")}`);
      }
      if (step.pauseForAnalysis) {
        await this.addLog(deployment.id, "info", "Paused for manual analysis review");
      }
    }
    await this.updateState(deployment.id, { trafficPercent: 100 });
  }
  async executeRecreateDeployment(deployment) {
    await this.addLog(deployment.id, "info", "Stopping existing instances");
    await this.updateState(deployment.id, { healthyInstances: 0 });
    await this.sleep(300);
    await this.addLog(deployment.id, "info", "Starting new instances");
    const totalInstances = deployment.targets.reduce((sum, t) => sum + (t.replicas ?? 1), 0);
    await this.updateState(deployment.id, {
      totalInstances,
      updatedInstances: totalInstances,
      healthyInstances: totalInstances
    });
  }
  async runChecks(deploymentId, checkNames, phase) {
    for (const checkName of checkNames) {
      const check = {
        id: randomUUID13(),
        name: checkName,
        type: "custom",
        status: "running",
        startedAt: Date.now()
      };
      await this.storage.saveCheckResult(deploymentId, check);
      this.emit("checkStarted", deploymentId, check.id);
      await this.sleep(200);
      check.status = "passed";
      check.completedAt = Date.now();
      check.duration = check.completedAt - check.startedAt;
      await this.storage.saveCheckResult(deploymentId, check);
      this.emit("checkCompleted", deploymentId, check);
    }
  }
  async finalizeDeployment(deployment) {
    await this.addLog(deployment.id, "info", "Finalizing deployment");
    await this.sleep(200);
  }
  async collectMetrics(deploymentId) {
    const metrics = {
      deploymentId,
      timestamp: Date.now(),
      requestCount: Math.floor(Math.random() * 1e3) + 100,
      errorCount: Math.floor(Math.random() * 10),
      errorRate: Math.random() * 2,
      // 0-2%
      latencyP50: Math.random() * 100 + 20,
      latencyP95: Math.random() * 200 + 50,
      latencyP99: Math.random() * 300 + 100
    };
    await this.storage.saveMetrics(metrics);
    return metrics;
  }
  analyzeMetrics(deploymentId, metrics, config) {
    const violations = [];
    if (metrics.errorRate > config.errorThreshold) {
      violations.push({ metric: "errorRate", expected: config.errorThreshold, actual: metrics.errorRate });
    }
    if (metrics.latencyP99 > config.latencyThreshold) {
      violations.push({ metric: "latencyP99", expected: config.latencyThreshold, actual: metrics.latencyP99 });
    }
    const successRate = 100 - metrics.errorRate;
    if (successRate < config.successThreshold) {
      violations.push({ metric: "successRate", expected: config.successThreshold, actual: successRate });
    }
    return {
      deploymentId,
      timestamp: Date.now(),
      verdict: violations.length === 0 ? "pass" : "fail",
      score: Math.max(0, 100 - violations.length * 25),
      metrics,
      thresholds: {
        errorThreshold: config.errorThreshold,
        latencyThreshold: config.latencyThreshold,
        successThreshold: config.successThreshold
      },
      violations
    };
  }
  // ---------------------------------------------------------------------------
  // Approval
  // ---------------------------------------------------------------------------
  async requestApproval(deploymentId, requestedBy) {
    const approval = {
      id: randomUUID13(),
      deploymentId,
      status: "pending",
      requestedAt: Date.now(),
      requestedBy,
      expiresAt: Date.now() + this.config.approvalTimeoutSeconds * 1e3
    };
    await this.storage.saveApproval(approval);
    this.emit("approvalRequested", approval);
    return approval;
  }
  async approveDeployment(deploymentId, respondedBy, comment) {
    const approval = await this.storage.getApproval(deploymentId);
    if (!approval || approval.status !== "pending") {
      throw new Error("No pending approval found");
    }
    approval.status = "approved";
    approval.respondedAt = Date.now();
    approval.respondedBy = respondedBy;
    approval.comment = comment;
    await this.storage.saveApproval(approval);
    this.emit("approvalReceived", approval);
  }
  async rejectDeployment(deploymentId, respondedBy, comment) {
    const approval = await this.storage.getApproval(deploymentId);
    if (!approval || approval.status !== "pending") {
      throw new Error("No pending approval found");
    }
    approval.status = "rejected";
    approval.respondedAt = Date.now();
    approval.respondedBy = respondedBy;
    approval.comment = comment;
    await this.storage.saveApproval(approval);
    this.emit("approvalReceived", approval);
  }
  async waitForApproval(deploymentId) {
    const approval = await this.requestApproval(deploymentId);
    const startTime = Date.now();
    while (Date.now() - startTime < this.config.approvalTimeoutSeconds * 1e3) {
      const current = await this.storage.getApproval(deploymentId);
      if (current?.status === "approved") {
        return;
      }
      if (current?.status === "rejected") {
        throw new Error(`Deployment rejected: ${current.comment ?? "No reason provided"}`);
      }
      await this.sleep(5e3);
    }
    throw new Error("Approval timeout");
  }
  // ---------------------------------------------------------------------------
  // Rollback
  // ---------------------------------------------------------------------------
  async rollback(deploymentId, reason, initiatedBy) {
    const deployment = await this.storage.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }
    if (!deployment.previousArtifact) {
      throw new Error("No previous artifact to rollback to");
    }
    const rollback = {
      id: randomUUID13(),
      deploymentId,
      reason,
      initiatedAt: Date.now(),
      status: "in_progress",
      targetArtifact: deployment.previousArtifact,
      initiatedBy
    };
    await this.storage.saveRollback(rollback);
    await this.updateState(deploymentId, { status: "rolled_back" });
    this.emit("rollbackStarted", rollback);
    try {
      await this.addLog(deploymentId, "warn", `Initiating rollback: ${reason}`);
      const rollbackDeployment = await this.createDeployment({
        ...deployment,
        name: `${deployment.name} (rollback)`,
        artifact: deployment.previousArtifact,
        previousArtifact: deployment.artifact,
        requiresApproval: false
      });
      await this.startDeployment(rollbackDeployment.id);
      rollback.status = "completed";
      rollback.completedAt = Date.now();
      await this.storage.saveRollback(rollback);
      this.emit("rollbackCompleted", rollback);
    } catch (error) {
      rollback.status = "failed";
      await this.storage.saveRollback(rollback);
      this.emit("rollbackFailed", rollback, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
    return rollback;
  }
  async handleDeploymentFailure(deployment, error) {
    const state = await this.storage.getState(deployment.id);
    await this.updateState(deployment.id, {
      status: "failed",
      errors: [...state?.errors ?? [], {
        timestamp: Date.now(),
        phase: state?.phase ?? "deploying",
        message: error.message
      }]
    });
    this.emit("deploymentFailed", deployment.id, error);
    if (deployment.autoRollback && deployment.previousArtifact) {
      await this.addLog(deployment.id, "warn", "Auto-rollback triggered");
      await this.rollback(deployment.id, "failed_checks");
    }
  }
  // ---------------------------------------------------------------------------
  // Cancel
  // ---------------------------------------------------------------------------
  async cancelDeployment(deploymentId) {
    const state = await this.storage.getState(deploymentId);
    if (!state || state.status !== "running") {
      throw new Error("Deployment is not running");
    }
    await this.updateState(deploymentId, { status: "cancelled" });
    this.emit("deploymentCancelled", deploymentId);
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  async updateState(deploymentId, updates) {
    const state = await this.storage.getState(deploymentId);
    if (!state) return;
    const updated = {
      ...state,
      ...updates,
      updatedAt: Date.now()
    };
    await this.storage.saveState(updated);
    if (updates.progress !== void 0) {
      this.emit("progressUpdated", deploymentId, updates.progress);
    }
  }
  async addLog(deploymentId, level, message) {
    const state = await this.storage.getState(deploymentId);
    if (!state) return;
    state.logs.push({ timestamp: Date.now(), level, message });
    await this.storage.saveState(state);
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async start() {
    this.running = true;
  }
  async stop() {
    this.running = false;
    for (const [id, timeout] of this.activeDeployments) {
      clearTimeout(timeout);
    }
    this.activeDeployments.clear();
  }
  isRunning() {
    return this.running;
  }
};
var defaultManager7 = null;
function getDeploymentManager() {
  if (!defaultManager7) {
    defaultManager7 = new DeploymentManager();
  }
  return defaultManager7;
}
function createDeploymentManager(config) {
  return new DeploymentManager(config);
}

// src/llm/types.ts
import { z as z23 } from "zod";
var LLMProviderSchema = z23.enum([
  "openai",
  "anthropic",
  "google",
  "cohere",
  "mistral",
  "azure",
  "aws_bedrock",
  "groq",
  "together",
  "perplexity",
  "replicate",
  "huggingface",
  "local",
  "custom"
]);
var ModelTierSchema = z23.enum([
  "free",
  "standard",
  "premium",
  "enterprise"
]);
var ModelCapabilitySchema = z23.enum([
  "text",
  "chat",
  "code",
  "vision",
  "audio",
  "embedding",
  "image_generation",
  "function_calling",
  "streaming"
]);
var ModelDefinitionSchema = z23.object({
  id: z23.string(),
  provider: LLMProviderSchema,
  name: z23.string(),
  displayName: z23.string().optional(),
  tier: ModelTierSchema.default("standard"),
  capabilities: z23.array(ModelCapabilitySchema).default(["text"]),
  // Token limits
  contextWindow: z23.number().describe("Max context length in tokens"),
  maxOutputTokens: z23.number().optional(),
  // Pricing (per 1M tokens)
  inputPricePerMillion: z23.number().describe("USD per 1M input tokens"),
  outputPricePerMillion: z23.number().describe("USD per 1M output tokens"),
  cachedInputPricePerMillion: z23.number().optional().describe("USD per 1M cached input tokens"),
  // Image pricing (for vision models)
  imagePricePerUnit: z23.number().optional(),
  // Additional costs
  requestBaseCost: z23.number().default(0).describe("Fixed cost per request"),
  // Metadata
  deprecated: z23.boolean().default(false),
  deprecationDate: z23.string().optional(),
  releaseDate: z23.string().optional(),
  description: z23.string().optional()
});
var TokenUsageSchema = z23.object({
  inputTokens: z23.number().default(0),
  outputTokens: z23.number().default(0),
  cachedTokens: z23.number().default(0),
  totalTokens: z23.number().default(0)
});
var LLMRequestSchema = z23.object({
  id: z23.string(),
  timestamp: z23.number(),
  // Model info
  provider: LLMProviderSchema,
  model: z23.string(),
  // Request details
  requestType: z23.enum(["completion", "chat", "embedding", "image", "audio", "function"]).default("chat"),
  streaming: z23.boolean().default(false),
  // Token usage
  usage: TokenUsageSchema,
  // Cost calculation
  inputCost: z23.number(),
  outputCost: z23.number(),
  cachedCost: z23.number().default(0),
  additionalCosts: z23.number().default(0),
  totalCost: z23.number(),
  // Latency
  latencyMs: z23.number().optional(),
  timeToFirstTokenMs: z23.number().optional(),
  // Context
  projectId: z23.string().optional(),
  userId: z23.string().optional(),
  sessionId: z23.string().optional(),
  tags: z23.array(z23.string()).default([]),
  metadata: z23.record(z23.unknown()).optional(),
  // Status
  success: z23.boolean().default(true),
  errorCode: z23.string().optional(),
  errorMessage: z23.string().optional()
});
var AggregationPeriodSchema = z23.enum([
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year"
]);
var CostAggregationSchema = z23.object({
  period: AggregationPeriodSchema,
  startTime: z23.number(),
  endTime: z23.number(),
  // Totals
  totalRequests: z23.number(),
  totalTokens: z23.number(),
  totalInputTokens: z23.number(),
  totalOutputTokens: z23.number(),
  totalCachedTokens: z23.number(),
  totalCost: z23.number(),
  // By provider
  byProvider: z23.record(z23.object({
    requests: z23.number(),
    tokens: z23.number(),
    cost: z23.number()
  })),
  // By model
  byModel: z23.record(z23.object({
    requests: z23.number(),
    tokens: z23.number(),
    cost: z23.number()
  })),
  // By project
  byProject: z23.record(z23.object({
    requests: z23.number(),
    tokens: z23.number(),
    cost: z23.number()
  })),
  // By user
  byUser: z23.record(z23.object({
    requests: z23.number(),
    tokens: z23.number(),
    cost: z23.number()
  })),
  // Averages
  avgCostPerRequest: z23.number(),
  avgTokensPerRequest: z23.number(),
  avgLatencyMs: z23.number().optional(),
  // Success rate
  successRate: z23.number(),
  errorCount: z23.number()
});
var BudgetPeriodSchema = z23.enum([
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "custom"
]);
var BudgetScopeSchema = z23.enum([
  "global",
  "provider",
  "model",
  "project",
  "user",
  "tag"
]);
var BudgetDefinitionSchema = z23.object({
  id: z23.string(),
  name: z23.string(),
  description: z23.string().optional(),
  // Scope
  scope: BudgetScopeSchema,
  scopeId: z23.string().optional().describe("Provider/model/project/user ID when scope is not global"),
  // Period
  period: BudgetPeriodSchema,
  customPeriodDays: z23.number().optional(),
  startDate: z23.number().optional(),
  // Limits
  budgetAmount: z23.number().describe("Budget limit in USD"),
  softLimitPercent: z23.number().default(80).describe("Percentage for soft warning"),
  hardLimitPercent: z23.number().default(100).describe("Percentage for hard limit"),
  // Actions
  alertOnSoftLimit: z23.boolean().default(true),
  alertOnHardLimit: z23.boolean().default(true),
  blockOnHardLimit: z23.boolean().default(false).describe("Block requests when hard limit reached"),
  // Rollover
  rolloverEnabled: z23.boolean().default(false),
  maxRolloverPercent: z23.number().default(25),
  // Status
  enabled: z23.boolean().default(true),
  createdAt: z23.number(),
  updatedAt: z23.number()
});
var BudgetStatusSchema = z23.enum([
  "under_budget",
  "soft_limit",
  "hard_limit",
  "exceeded"
]);
var BudgetStateSchema = z23.object({
  budgetId: z23.string(),
  periodStart: z23.number(),
  periodEnd: z23.number(),
  // Usage
  currentSpend: z23.number(),
  remainingBudget: z23.number(),
  percentUsed: z23.number(),
  // Status
  status: BudgetStatusSchema,
  estimatedEndSpend: z23.number().optional().describe("Projected spend by end of period"),
  // Rollover
  rolloverAmount: z23.number().default(0),
  effectiveBudget: z23.number().describe("Budget + rollover"),
  // History
  lastUpdated: z23.number(),
  lastAlertSent: z23.number().optional()
});
var CostAlertTypeSchema = z23.enum([
  "soft_limit_reached",
  "hard_limit_reached",
  "budget_exceeded",
  "anomaly_detected",
  "spend_spike",
  "daily_summary",
  "weekly_summary"
]);
var CostAlertSchema = z23.object({
  id: z23.string(),
  type: CostAlertTypeSchema,
  severity: z23.enum(["info", "warning", "critical"]),
  timestamp: z23.number(),
  // Context
  budgetId: z23.string().optional(),
  scope: BudgetScopeSchema.optional(),
  scopeId: z23.string().optional(),
  // Details
  title: z23.string(),
  message: z23.string(),
  currentSpend: z23.number(),
  threshold: z23.number().optional(),
  percentUsed: z23.number().optional(),
  // Recommendations
  recommendations: z23.array(z23.string()).default([]),
  // Status
  acknowledged: z23.boolean().default(false),
  acknowledgedBy: z23.string().optional(),
  acknowledgedAt: z23.number().optional()
});
var CostOptimizationTypeSchema = z23.enum([
  "model_downgrade",
  "caching_opportunity",
  "batch_processing",
  "prompt_optimization",
  "provider_switch",
  "unused_capacity"
]);
var CostOptimizationSchema = z23.object({
  id: z23.string(),
  type: CostOptimizationTypeSchema,
  priority: z23.enum(["low", "medium", "high"]),
  timestamp: z23.number(),
  // Impact
  estimatedSavings: z23.number().describe("USD savings per period"),
  savingsPercent: z23.number(),
  effort: z23.enum(["minimal", "moderate", "significant"]),
  // Details
  title: z23.string(),
  description: z23.string(),
  currentState: z23.string(),
  recommendedAction: z23.string(),
  // Context
  affectedModels: z23.array(z23.string()).default([]),
  affectedProjects: z23.array(z23.string()).default([]),
  // Implementation
  implemented: z23.boolean().default(false),
  implementedAt: z23.number().optional(),
  actualSavings: z23.number().optional()
});
var CostReportTypeSchema = z23.enum([
  "summary",
  "detailed",
  "comparison",
  "forecast",
  "optimization"
]);
var CostReportSchema = z23.object({
  id: z23.string(),
  type: CostReportTypeSchema,
  generatedAt: z23.number(),
  period: AggregationPeriodSchema,
  startTime: z23.number(),
  endTime: z23.number(),
  // Summary
  totalCost: z23.number(),
  totalRequests: z23.number(),
  totalTokens: z23.number(),
  // Breakdown
  aggregation: CostAggregationSchema,
  // Comparison (if applicable)
  previousPeriodCost: z23.number().optional(),
  costChange: z23.number().optional(),
  costChangePercent: z23.number().optional(),
  // Forecast (if applicable)
  forecastedCost: z23.number().optional(),
  forecastConfidence: z23.number().optional(),
  // Top consumers
  topModels: z23.array(z23.object({
    model: z23.string(),
    cost: z23.number(),
    percent: z23.number()
  })).default([]),
  topProjects: z23.array(z23.object({
    projectId: z23.string(),
    cost: z23.number(),
    percent: z23.number()
  })).default([]),
  topUsers: z23.array(z23.object({
    userId: z23.string(),
    cost: z23.number(),
    percent: z23.number()
  })).default([]),
  // Optimizations
  optimizations: z23.array(CostOptimizationSchema).default([]),
  potentialSavings: z23.number().default(0),
  // Alerts in period
  alertCount: z23.number().default(0),
  budgetExceededCount: z23.number().default(0)
});
var LLMCostTrackerConfigSchema = z23.object({
  // Tracking
  enabled: z23.boolean().default(true),
  trackingLevel: z23.enum(["basic", "detailed", "full"]).default("detailed"),
  // Storage
  retentionDays: z23.number().default(90),
  aggregationEnabled: z23.boolean().default(true),
  // Budgets
  budgetsEnabled: z23.boolean().default(true),
  defaultBudgetPeriod: BudgetPeriodSchema.default("monthly"),
  // Alerts
  alertsEnabled: z23.boolean().default(true),
  alertCooldownMinutes: z23.number().default(60),
  dailySummaryEnabled: z23.boolean().default(true),
  dailySummaryHour: z23.number().default(9).describe("Hour to send daily summary (0-23)"),
  // Optimization
  optimizationScanEnabled: z23.boolean().default(true),
  optimizationScanIntervalHours: z23.number().default(24),
  // Anomaly detection
  anomalyDetectionEnabled: z23.boolean().default(true),
  anomalyThresholdPercent: z23.number().default(200).describe("Percent above average to trigger anomaly"),
  // Currency
  currency: z23.string().default("USD"),
  exchangeRateUpdateHours: z23.number().default(24),
  // Custom model pricing
  customModelPricing: z23.record(z23.object({
    inputPricePerMillion: z23.number(),
    outputPricePerMillion: z23.number()
  })).optional()
});
var MODEL_PRICING = {
  // OpenAI
  "gpt-4o": {
    provider: "openai",
    name: "gpt-4o",
    displayName: "GPT-4o",
    tier: "premium",
    capabilities: ["chat", "vision", "function_calling", "streaming"],
    contextWindow: 128e3,
    maxOutputTokens: 16384,
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10,
    cachedInputPricePerMillion: 1.25,
    requestBaseCost: 0
  },
  "gpt-4o-mini": {
    provider: "openai",
    name: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    tier: "standard",
    capabilities: ["chat", "vision", "function_calling", "streaming"],
    contextWindow: 128e3,
    maxOutputTokens: 16384,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    cachedInputPricePerMillion: 0.075,
    requestBaseCost: 0
  },
  "gpt-4-turbo": {
    provider: "openai",
    name: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    tier: "premium",
    capabilities: ["chat", "vision", "function_calling", "streaming"],
    contextWindow: 128e3,
    maxOutputTokens: 4096,
    inputPricePerMillion: 10,
    outputPricePerMillion: 30,
    requestBaseCost: 0
  },
  "o1": {
    provider: "openai",
    name: "o1",
    displayName: "o1",
    tier: "enterprise",
    capabilities: ["chat", "code"],
    contextWindow: 2e5,
    maxOutputTokens: 1e5,
    inputPricePerMillion: 15,
    outputPricePerMillion: 60,
    cachedInputPricePerMillion: 7.5,
    requestBaseCost: 0
  },
  "o1-mini": {
    provider: "openai",
    name: "o1-mini",
    displayName: "o1-mini",
    tier: "premium",
    capabilities: ["chat", "code"],
    contextWindow: 128e3,
    maxOutputTokens: 65536,
    inputPricePerMillion: 3,
    outputPricePerMillion: 12,
    cachedInputPricePerMillion: 1.5,
    requestBaseCost: 0
  },
  // Anthropic
  "claude-3-5-sonnet-20241022": {
    provider: "anthropic",
    name: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    tier: "premium",
    capabilities: ["chat", "vision", "code", "function_calling", "streaming"],
    contextWindow: 2e5,
    maxOutputTokens: 8192,
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    cachedInputPricePerMillion: 0.3,
    requestBaseCost: 0
  },
  "claude-3-5-haiku-20241022": {
    provider: "anthropic",
    name: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    tier: "standard",
    capabilities: ["chat", "vision", "code", "function_calling", "streaming"],
    contextWindow: 2e5,
    maxOutputTokens: 8192,
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 4,
    cachedInputPricePerMillion: 0.08,
    requestBaseCost: 0
  },
  "claude-3-opus-20240229": {
    provider: "anthropic",
    name: "claude-3-opus-20240229",
    displayName: "Claude 3 Opus",
    tier: "enterprise",
    capabilities: ["chat", "vision", "code", "function_calling", "streaming"],
    contextWindow: 2e5,
    maxOutputTokens: 4096,
    inputPricePerMillion: 15,
    outputPricePerMillion: 75,
    cachedInputPricePerMillion: 1.5,
    requestBaseCost: 0
  },
  // Google
  "gemini-2.0-flash": {
    provider: "google",
    name: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    tier: "standard",
    capabilities: ["chat", "vision", "code", "audio", "function_calling", "streaming"],
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
    requestBaseCost: 0
  },
  "gemini-1.5-pro": {
    provider: "google",
    name: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    tier: "premium",
    capabilities: ["chat", "vision", "code", "audio", "function_calling", "streaming"],
    contextWindow: 2097152,
    maxOutputTokens: 8192,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5,
    requestBaseCost: 0
  },
  // Mistral
  "mistral-large-latest": {
    provider: "mistral",
    name: "mistral-large-latest",
    displayName: "Mistral Large",
    tier: "premium",
    capabilities: ["chat", "code", "function_calling", "streaming"],
    contextWindow: 128e3,
    maxOutputTokens: 8192,
    inputPricePerMillion: 2,
    outputPricePerMillion: 6,
    requestBaseCost: 0
  },
  "mistral-small-latest": {
    provider: "mistral",
    name: "mistral-small-latest",
    displayName: "Mistral Small",
    tier: "standard",
    capabilities: ["chat", "code", "function_calling", "streaming"],
    contextWindow: 32e3,
    maxOutputTokens: 8192,
    inputPricePerMillion: 0.2,
    outputPricePerMillion: 0.6,
    requestBaseCost: 0
  },
  // Groq
  "llama-3.3-70b-versatile": {
    provider: "groq",
    name: "llama-3.3-70b-versatile",
    displayName: "Llama 3.3 70B",
    tier: "standard",
    capabilities: ["chat", "code", "streaming"],
    contextWindow: 128e3,
    maxOutputTokens: 32768,
    inputPricePerMillion: 0.59,
    outputPricePerMillion: 0.79,
    requestBaseCost: 0
  },
  "mixtral-8x7b-32768": {
    provider: "groq",
    name: "mixtral-8x7b-32768",
    displayName: "Mixtral 8x7B",
    tier: "standard",
    capabilities: ["chat", "code", "streaming"],
    contextWindow: 32768,
    maxOutputTokens: 8192,
    inputPricePerMillion: 0.24,
    outputPricePerMillion: 0.24,
    requestBaseCost: 0
  },
  // Embeddings
  "text-embedding-3-small": {
    provider: "openai",
    name: "text-embedding-3-small",
    displayName: "Text Embedding 3 Small",
    tier: "standard",
    capabilities: ["embedding"],
    contextWindow: 8191,
    inputPricePerMillion: 0.02,
    outputPricePerMillion: 0,
    requestBaseCost: 0
  },
  "text-embedding-3-large": {
    provider: "openai",
    name: "text-embedding-3-large",
    displayName: "Text Embedding 3 Large",
    tier: "standard",
    capabilities: ["embedding"],
    contextWindow: 8191,
    inputPricePerMillion: 0.13,
    outputPricePerMillion: 0,
    requestBaseCost: 0
  }
};
function calculateRequestCost(model, usage, customPricing) {
  const pricing = customPricing || MODEL_PRICING[model];
  if (!pricing) {
    return { inputCost: 0, outputCost: 0, cachedCost: 0, totalCost: 0 };
  }
  const inputCost = usage.inputTokens / 1e6 * pricing.inputPricePerMillion;
  const outputCost = usage.outputTokens / 1e6 * pricing.outputPricePerMillion;
  const cachedCost = pricing.cachedInputPricePerMillion ? usage.cachedTokens / 1e6 * pricing.cachedInputPricePerMillion : 0;
  const baseCost = "requestBaseCost" in pricing ? pricing.requestBaseCost || 0 : 0;
  return {
    inputCost,
    outputCost,
    cachedCost,
    totalCost: inputCost + outputCost + cachedCost + baseCost
  };
}
function getPeriodBounds(period, referenceDate) {
  const now = referenceDate || /* @__PURE__ */ new Date();
  switch (period) {
    case "daily": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start: start.getTime(), end: end.getTime() };
    }
    case "weekly": {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start: start.getTime(), end: end.getTime() };
    }
    case "monthly": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start: start.getTime(), end: end.getTime() };
    }
    case "quarterly": {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
      return { start: start.getTime(), end: end.getTime() };
    }
    case "yearly": {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      return { start: start.getTime(), end: end.getTime() };
    }
    default:
      return { start: now.getTime(), end: now.getTime() + 30 * 24 * 60 * 60 * 1e3 };
  }
}
function formatCost(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount);
}
function formatTokenCount(tokens) {
  if (tokens >= 1e6) {
    return `${(tokens / 1e6).toFixed(2)}M`;
  }
  if (tokens >= 1e3) {
    return `${(tokens / 1e3).toFixed(1)}K`;
  }
  return tokens.toString();
}

// src/llm/cost-tracker.ts
import { EventEmitter as EventEmitter25 } from "eventemitter3";
import { randomUUID as randomUUID14 } from "crypto";
var InMemoryLLMCostStorage = class {
  requests = /* @__PURE__ */ new Map();
  aggregations = /* @__PURE__ */ new Map();
  budgets = /* @__PURE__ */ new Map();
  budgetStates = /* @__PURE__ */ new Map();
  alerts = /* @__PURE__ */ new Map();
  optimizations = /* @__PURE__ */ new Map();
  reports = /* @__PURE__ */ new Map();
  async saveRequest(request) {
    this.requests.set(request.id, request);
  }
  async getRequests(filters) {
    return Array.from(this.requests.values()).filter((req) => {
      if (filters.startTime && req.timestamp < filters.startTime) return false;
      if (filters.endTime && req.timestamp > filters.endTime) return false;
      if (filters.provider && req.provider !== filters.provider) return false;
      if (filters.model && req.model !== filters.model) return false;
      if (filters.projectId && req.projectId !== filters.projectId) return false;
      if (filters.userId && req.userId !== filters.userId) return false;
      return true;
    });
  }
  async saveAggregation(aggregation) {
    const key = `${aggregation.period}-${aggregation.startTime}`;
    this.aggregations.set(key, aggregation);
  }
  async getAggregation(period, startTime) {
    const key = `${period}-${startTime}`;
    return this.aggregations.get(key) || null;
  }
  async getAggregations(period, startTime, endTime) {
    return Array.from(this.aggregations.values()).filter(
      (agg) => agg.period === period && agg.startTime >= startTime && agg.endTime <= endTime
    );
  }
  async saveBudget(budget) {
    this.budgets.set(budget.id, budget);
  }
  async getBudget(id) {
    return this.budgets.get(id) || null;
  }
  async deleteBudget(id) {
    this.budgets.delete(id);
    this.budgetStates.delete(id);
  }
  async listBudgets() {
    return Array.from(this.budgets.values());
  }
  async saveBudgetState(state) {
    this.budgetStates.set(state.budgetId, state);
  }
  async getBudgetState(budgetId) {
    return this.budgetStates.get(budgetId) || null;
  }
  async saveAlert(alert) {
    this.alerts.set(alert.id, alert);
  }
  async getAlerts(filters) {
    return Array.from(this.alerts.values()).filter((alert) => {
      if (filters?.acknowledged !== void 0 && alert.acknowledged !== filters.acknowledged) return false;
      if (filters?.type && alert.type !== filters.type) return false;
      return true;
    });
  }
  async acknowledgeAlert(alertId, acknowledgedBy) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();
    }
  }
  async saveOptimization(optimization) {
    this.optimizations.set(optimization.id, optimization);
  }
  async getOptimizations(implemented) {
    return Array.from(this.optimizations.values()).filter((opt) => {
      if (implemented !== void 0 && opt.implemented !== implemented) return false;
      return true;
    });
  }
  async saveReport(report) {
    this.reports.set(report.id, report);
  }
  async getReport(id) {
    return this.reports.get(id) || null;
  }
  async getReports(type) {
    return Array.from(this.reports.values()).filter((report) => {
      if (type && report.type !== type) return false;
      return true;
    });
  }
};
var LLMCostTracker = class extends EventEmitter25 {
  config;
  storage;
  alertCooldowns = /* @__PURE__ */ new Map();
  aggregationIntervals = /* @__PURE__ */ new Map();
  started = false;
  constructor(config = {}, storage) {
    super();
    this.config = LLMCostTrackerConfigSchema.parse(config);
    this.storage = storage || new InMemoryLLMCostStorage();
  }
  // ===========================================================================
  // Lifecycle
  // ===========================================================================
  async start() {
    if (this.started) return;
    if (this.config.aggregationEnabled) {
      this.startAggregationTimers();
    }
    if (this.config.optimizationScanEnabled) {
      this.scheduleOptimizationScan();
    }
    this.started = true;
  }
  async stop() {
    for (const interval of this.aggregationIntervals.values()) {
      clearInterval(interval);
    }
    this.aggregationIntervals.clear();
    this.started = false;
  }
  // ===========================================================================
  // Request Tracking
  // ===========================================================================
  async trackRequest(input) {
    if (!this.config.enabled) {
      throw new Error("Cost tracking is disabled");
    }
    const customPricing = this.config.customModelPricing?.[input.model];
    const costs = calculateRequestCost(input.model, input.usage, customPricing);
    const request = {
      id: randomUUID14(),
      timestamp: Date.now(),
      provider: input.provider,
      model: input.model,
      requestType: input.requestType || "chat",
      streaming: input.streaming || false,
      usage: {
        ...input.usage,
        totalTokens: input.usage.inputTokens + input.usage.outputTokens
      },
      ...costs,
      latencyMs: input.latencyMs,
      timeToFirstTokenMs: input.timeToFirstTokenMs,
      projectId: input.projectId,
      userId: input.userId,
      sessionId: input.sessionId,
      tags: input.tags || [],
      metadata: input.metadata,
      success: input.success ?? true,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage
    };
    const budgetCheck = await this.checkBudgets(request);
    if (budgetCheck.blocked) {
      this.emit("requestBlocked", request, budgetCheck.budget);
      throw new Error(`Request blocked: Budget "${budgetCheck.budget.name}" hard limit reached`);
    }
    await this.storage.saveRequest(request);
    await this.updateBudgetStates(request);
    this.emit("requestTracked", request);
    return request;
  }
  // ===========================================================================
  // Budget Management
  // ===========================================================================
  async createBudget(input) {
    const budget = {
      ...input,
      id: randomUUID14(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await this.storage.saveBudget(budget);
    const { start, end } = getPeriodBounds(budget.period);
    const state = {
      budgetId: budget.id,
      periodStart: start,
      periodEnd: end,
      currentSpend: 0,
      remainingBudget: budget.budgetAmount,
      percentUsed: 0,
      status: "under_budget",
      rolloverAmount: 0,
      effectiveBudget: budget.budgetAmount,
      lastUpdated: Date.now()
    };
    await this.storage.saveBudgetState(state);
    this.emit("budgetCreated", budget);
    return budget;
  }
  async updateBudget(id, updates) {
    const budget = await this.storage.getBudget(id);
    if (!budget) return null;
    const updated = {
      ...budget,
      ...updates,
      updatedAt: Date.now()
    };
    await this.storage.saveBudget(updated);
    this.emit("budgetUpdated", updated);
    return updated;
  }
  async deleteBudget(id) {
    const budget = await this.storage.getBudget(id);
    if (!budget) return false;
    await this.storage.deleteBudget(id);
    this.emit("budgetDeleted", id);
    return true;
  }
  async getBudget(id) {
    return this.storage.getBudget(id);
  }
  async listBudgets() {
    return this.storage.listBudgets();
  }
  async getBudgetState(budgetId) {
    return this.storage.getBudgetState(budgetId);
  }
  async checkBudgets(request) {
    const budgets = await this.storage.listBudgets();
    for (const budget of budgets) {
      if (!budget.enabled || !budget.blockOnHardLimit) continue;
      const matches = this.budgetMatchesRequest(budget, request);
      if (!matches) continue;
      const state = await this.storage.getBudgetState(budget.id);
      if (!state) continue;
      if (state.percentUsed >= budget.hardLimitPercent) {
        return { blocked: true, budget, state };
      }
    }
    return { blocked: false };
  }
  budgetMatchesRequest(budget, request) {
    switch (budget.scope) {
      case "global":
        return true;
      case "provider":
        return request.provider === budget.scopeId;
      case "model":
        return request.model === budget.scopeId;
      case "project":
        return request.projectId === budget.scopeId;
      case "user":
        return request.userId === budget.scopeId;
      case "tag":
        return request.tags?.includes(budget.scopeId || "") || false;
      default:
        return false;
    }
  }
  async updateBudgetStates(request) {
    const budgets = await this.storage.listBudgets();
    for (const budget of budgets) {
      if (!budget.enabled) continue;
      const matches = this.budgetMatchesRequest(budget, request);
      if (!matches) continue;
      let state = await this.storage.getBudgetState(budget.id);
      const { start, end } = getPeriodBounds(budget.period);
      if (!state || state.periodEnd <= Date.now()) {
        const rollover = state && budget.rolloverEnabled ? Math.min(
          state.remainingBudget,
          budget.budgetAmount * (budget.maxRolloverPercent / 100)
        ) : 0;
        state = {
          budgetId: budget.id,
          periodStart: start,
          periodEnd: end,
          currentSpend: 0,
          remainingBudget: budget.budgetAmount + rollover,
          percentUsed: 0,
          status: "under_budget",
          rolloverAmount: rollover,
          effectiveBudget: budget.budgetAmount + rollover,
          lastUpdated: Date.now()
        };
      }
      state.currentSpend += request.totalCost;
      state.remainingBudget = state.effectiveBudget - state.currentSpend;
      state.percentUsed = state.currentSpend / state.effectiveBudget * 100;
      state.lastUpdated = Date.now();
      const prevStatus = state.status;
      state.status = this.calculateBudgetStatus(budget, state);
      await this.storage.saveBudgetState(state);
      if (state.status !== prevStatus) {
        await this.handleBudgetStatusChange(budget, state, prevStatus);
      }
    }
  }
  calculateBudgetStatus(budget, state) {
    if (state.percentUsed > 100) return "exceeded";
    if (state.percentUsed >= budget.hardLimitPercent) return "hard_limit";
    if (state.percentUsed >= budget.softLimitPercent) return "soft_limit";
    return "under_budget";
  }
  async handleBudgetStatusChange(budget, state, prevStatus) {
    const cooldownKey = `${budget.id}-${state.status}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey);
    const cooldownMs = this.config.alertCooldownMinutes * 60 * 1e3;
    if (lastAlert && Date.now() - lastAlert < cooldownMs) {
      return;
    }
    let alertType = null;
    let severity = "info";
    switch (state.status) {
      case "soft_limit":
        if (budget.alertOnSoftLimit && prevStatus === "under_budget") {
          alertType = "soft_limit_reached";
          severity = "warning";
          this.emit("softLimitReached", budget, state);
        }
        break;
      case "hard_limit":
        if (budget.alertOnHardLimit) {
          alertType = "hard_limit_reached";
          severity = "critical";
          this.emit("hardLimitReached", budget, state);
        }
        break;
      case "exceeded":
        alertType = "budget_exceeded";
        severity = "critical";
        this.emit("budgetExceeded", budget, state);
        break;
    }
    if (alertType) {
      const alert = await this.createAlert({
        type: alertType,
        severity,
        budgetId: budget.id,
        scope: budget.scope,
        scopeId: budget.scopeId,
        title: `Budget "${budget.name}" - ${state.status.replace("_", " ").toUpperCase()}`,
        message: `Current spend: ${formatCost(state.currentSpend)} (${state.percentUsed.toFixed(1)}% of ${formatCost(state.effectiveBudget)})`,
        currentSpend: state.currentSpend,
        threshold: state.effectiveBudget * (budget.hardLimitPercent / 100),
        percentUsed: state.percentUsed,
        recommendations: this.generateBudgetRecommendations(budget, state)
      });
      this.alertCooldowns.set(cooldownKey, Date.now());
    }
  }
  generateBudgetRecommendations(budget, state) {
    const recommendations = [];
    if (state.percentUsed > 80) {
      recommendations.push("Consider switching to more cost-effective models for non-critical tasks");
      recommendations.push("Review recent usage patterns for optimization opportunities");
    }
    if (state.percentUsed > 95) {
      recommendations.push("Immediate action required to avoid service interruption");
      recommendations.push("Consider increasing budget or implementing request quotas");
    }
    return recommendations;
  }
  // ===========================================================================
  // Alerts
  // ===========================================================================
  async createAlert(input) {
    const alert = {
      ...input,
      id: randomUUID14(),
      timestamp: Date.now(),
      acknowledged: false
    };
    await this.storage.saveAlert(alert);
    this.emit("alertCreated", alert);
    return alert;
  }
  async acknowledgeAlert(alertId, acknowledgedBy) {
    await this.storage.acknowledgeAlert(alertId, acknowledgedBy);
    const alerts = await this.storage.getAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      this.emit("alertAcknowledged", alert);
    }
  }
  async getAlerts(filters) {
    return this.storage.getAlerts(filters);
  }
  // ===========================================================================
  // Aggregation
  // ===========================================================================
  async aggregate(period, startTime, endTime) {
    const bounds = startTime ? { start: startTime, end: endTime || Date.now() } : this.getAggregationBounds(period);
    const requests = await this.storage.getRequests({
      startTime: bounds.start,
      endTime: bounds.end
    });
    const aggregation = {
      period,
      startTime: bounds.start,
      endTime: bounds.end,
      totalRequests: requests.length,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCachedTokens: 0,
      totalCost: 0,
      byProvider: {},
      byModel: {},
      byProject: {},
      byUser: {},
      avgCostPerRequest: 0,
      avgTokensPerRequest: 0,
      avgLatencyMs: 0,
      successRate: 0,
      errorCount: 0
    };
    let totalLatency = 0;
    let latencyCount = 0;
    for (const req of requests) {
      aggregation.totalTokens += req.usage.totalTokens;
      aggregation.totalInputTokens += req.usage.inputTokens;
      aggregation.totalOutputTokens += req.usage.outputTokens;
      aggregation.totalCachedTokens += req.usage.cachedTokens;
      aggregation.totalCost += req.totalCost;
      if (!aggregation.byProvider[req.provider]) {
        aggregation.byProvider[req.provider] = { requests: 0, tokens: 0, cost: 0 };
      }
      aggregation.byProvider[req.provider].requests++;
      aggregation.byProvider[req.provider].tokens += req.usage.totalTokens;
      aggregation.byProvider[req.provider].cost += req.totalCost;
      if (!aggregation.byModel[req.model]) {
        aggregation.byModel[req.model] = { requests: 0, tokens: 0, cost: 0 };
      }
      aggregation.byModel[req.model].requests++;
      aggregation.byModel[req.model].tokens += req.usage.totalTokens;
      aggregation.byModel[req.model].cost += req.totalCost;
      if (req.projectId) {
        if (!aggregation.byProject[req.projectId]) {
          aggregation.byProject[req.projectId] = { requests: 0, tokens: 0, cost: 0 };
        }
        aggregation.byProject[req.projectId].requests++;
        aggregation.byProject[req.projectId].tokens += req.usage.totalTokens;
        aggregation.byProject[req.projectId].cost += req.totalCost;
      }
      if (req.userId) {
        if (!aggregation.byUser[req.userId]) {
          aggregation.byUser[req.userId] = { requests: 0, tokens: 0, cost: 0 };
        }
        aggregation.byUser[req.userId].requests++;
        aggregation.byUser[req.userId].tokens += req.usage.totalTokens;
        aggregation.byUser[req.userId].cost += req.totalCost;
      }
      if (req.latencyMs) {
        totalLatency += req.latencyMs;
        latencyCount++;
      }
      if (!req.success) {
        aggregation.errorCount++;
      }
    }
    if (requests.length > 0) {
      aggregation.avgCostPerRequest = aggregation.totalCost / requests.length;
      aggregation.avgTokensPerRequest = aggregation.totalTokens / requests.length;
      aggregation.successRate = (requests.length - aggregation.errorCount) / requests.length * 100;
    }
    if (latencyCount > 0) {
      aggregation.avgLatencyMs = totalLatency / latencyCount;
    }
    await this.storage.saveAggregation(aggregation);
    return aggregation;
  }
  getAggregationBounds(period) {
    const now = /* @__PURE__ */ new Date();
    let start;
    switch (period) {
      case "hour":
        start = new Date(now);
        start.setMinutes(0, 0, 0);
        return { start: start.getTime(), end: now.getTime() };
      case "day":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { start: start.getTime(), end: now.getTime() };
      case "week":
        start = new Date(now);
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        return { start: start.getTime(), end: now.getTime() };
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: start.getTime(), end: now.getTime() };
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        return { start: start.getTime(), end: now.getTime() };
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        return { start: start.getTime(), end: now.getTime() };
    }
  }
  startAggregationTimers() {
    const hourlyInterval = setInterval(async () => {
      try {
        await this.aggregate("hour");
      } catch (error) {
        this.emit("error", error);
      }
    }, 60 * 60 * 1e3);
    this.aggregationIntervals.set("hourly", hourlyInterval);
    const dailyInterval = setInterval(async () => {
      try {
        await this.aggregate("day");
        if (this.config.dailySummaryEnabled) {
          await this.generateDailySummary();
        }
      } catch (error) {
        this.emit("error", error);
      }
    }, 24 * 60 * 60 * 1e3);
    this.aggregationIntervals.set("daily", dailyInterval);
  }
  async generateDailySummary() {
    const report = await this.generateReport("summary", "day");
    await this.createAlert({
      type: "daily_summary",
      severity: "info",
      title: "Daily Cost Summary",
      message: `Total spend: ${formatCost(report.totalCost)} | Requests: ${report.totalRequests} | Tokens: ${formatTokenCount(report.totalTokens)}`,
      currentSpend: report.totalCost,
      recommendations: []
    });
  }
  // ===========================================================================
  // Reports
  // ===========================================================================
  async generateReport(type, period) {
    const aggregation = await this.aggregate(period);
    const periodMs = aggregation.endTime - aggregation.startTime;
    const prevRequests = await this.storage.getRequests({
      startTime: aggregation.startTime - periodMs,
      endTime: aggregation.startTime
    });
    const previousPeriodCost = prevRequests.reduce((sum, r) => sum + r.totalCost, 0);
    const topModels = Object.entries(aggregation.byModel).map(([model, data]) => ({
      model,
      cost: data.cost,
      percent: aggregation.totalCost > 0 ? data.cost / aggregation.totalCost * 100 : 0
    })).sort((a, b) => b.cost - a.cost).slice(0, 10);
    const topProjects = Object.entries(aggregation.byProject).map(([projectId, data]) => ({
      projectId,
      cost: data.cost,
      percent: aggregation.totalCost > 0 ? data.cost / aggregation.totalCost * 100 : 0
    })).sort((a, b) => b.cost - a.cost).slice(0, 10);
    const topUsers = Object.entries(aggregation.byUser).map(([userId, data]) => ({
      userId,
      cost: data.cost,
      percent: aggregation.totalCost > 0 ? data.cost / aggregation.totalCost * 100 : 0
    })).sort((a, b) => b.cost - a.cost).slice(0, 10);
    const optimizations = await this.storage.getOptimizations(false);
    const potentialSavings = optimizations.reduce((sum, o) => sum + o.estimatedSavings, 0);
    const alerts = await this.storage.getAlerts();
    const periodAlerts = alerts.filter(
      (a) => a.timestamp >= aggregation.startTime && a.timestamp <= aggregation.endTime
    );
    const report = {
      id: randomUUID14(),
      type,
      generatedAt: Date.now(),
      period,
      startTime: aggregation.startTime,
      endTime: aggregation.endTime,
      totalCost: aggregation.totalCost,
      totalRequests: aggregation.totalRequests,
      totalTokens: aggregation.totalTokens,
      aggregation,
      previousPeriodCost,
      costChange: aggregation.totalCost - previousPeriodCost,
      costChangePercent: previousPeriodCost > 0 ? (aggregation.totalCost - previousPeriodCost) / previousPeriodCost * 100 : 0,
      topModels,
      topProjects,
      topUsers,
      optimizations,
      potentialSavings,
      alertCount: periodAlerts.length,
      budgetExceededCount: periodAlerts.filter((a) => a.type === "budget_exceeded").length
    };
    await this.storage.saveReport(report);
    this.emit("reportGenerated", report);
    return report;
  }
  async getReport(id) {
    return this.storage.getReport(id);
  }
  async getReports(type) {
    return this.storage.getReports(type);
  }
  // ===========================================================================
  // Cost Optimization
  // ===========================================================================
  async scanForOptimizations() {
    const optimizations = [];
    const aggregation = await this.aggregate("month");
    const premiumModels = ["gpt-4o", "gpt-4-turbo", "claude-3-opus-20240229", "claude-3-5-sonnet-20241022"];
    const economyAlternatives = {
      "gpt-4o": "gpt-4o-mini",
      "gpt-4-turbo": "gpt-4o-mini",
      "claude-3-opus-20240229": "claude-3-5-haiku-20241022",
      "claude-3-5-sonnet-20241022": "claude-3-5-haiku-20241022"
    };
    for (const [model, data] of Object.entries(aggregation.byModel)) {
      if (premiumModels.includes(model) && data.cost > 10) {
        const alternative = economyAlternatives[model];
        if (alternative) {
          const altPricing = MODEL_PRICING[alternative];
          const currentPricing = MODEL_PRICING[model];
          if (altPricing && currentPricing) {
            const savingsRatio = 1 - altPricing.inputPricePerMillion / currentPricing.inputPricePerMillion;
            const estimatedSavings = data.cost * savingsRatio * 0.5;
            if (estimatedSavings > 1) {
              const optimization = {
                id: randomUUID14(),
                type: "model_downgrade",
                priority: estimatedSavings > 50 ? "high" : estimatedSavings > 10 ? "medium" : "low",
                timestamp: Date.now(),
                estimatedSavings,
                savingsPercent: savingsRatio * 50,
                effort: "minimal",
                title: `Consider using ${alternative} instead of ${model}`,
                description: `${data.requests} requests used ${model}. For simpler tasks, ${alternative} can provide similar quality at lower cost.`,
                currentState: `Using ${model} for all requests (${formatCost(data.cost)}/month)`,
                recommendedAction: `Route simple requests to ${alternative}`,
                affectedModels: [model],
                implemented: false
              };
              optimizations.push(optimization);
              await this.storage.saveOptimization(optimization);
              this.emit("optimizationFound", optimization);
            }
          }
        }
      }
    }
    if (aggregation.totalCachedTokens / aggregation.totalInputTokens < 0.1) {
      const cachingSavings = aggregation.totalCost * 0.2;
      if (cachingSavings > 5) {
        const optimization = {
          id: randomUUID14(),
          type: "caching_opportunity",
          priority: cachingSavings > 50 ? "high" : "medium",
          timestamp: Date.now(),
          estimatedSavings: cachingSavings,
          savingsPercent: 20,
          effort: "moderate",
          title: "Enable prompt caching for repeated context",
          description: `Only ${(aggregation.totalCachedTokens / aggregation.totalInputTokens * 100).toFixed(1)}% of input tokens are cached. Caching can reduce costs significantly.`,
          currentState: `Cache hit rate: ${(aggregation.totalCachedTokens / aggregation.totalInputTokens * 100).toFixed(1)}%`,
          recommendedAction: "Implement prompt caching for system prompts and repeated context",
          affectedModels: Object.keys(aggregation.byModel),
          implemented: false
        };
        optimizations.push(optimization);
        await this.storage.saveOptimization(optimization);
        this.emit("optimizationFound", optimization);
      }
    }
    return optimizations;
  }
  scheduleOptimizationScan() {
    const interval = setInterval(async () => {
      try {
        await this.scanForOptimizations();
      } catch (error) {
        this.emit("error", error);
      }
    }, this.config.optimizationScanIntervalHours * 60 * 60 * 1e3);
    this.aggregationIntervals.set("optimization", interval);
  }
  async getOptimizations(implemented) {
    return this.storage.getOptimizations(implemented);
  }
  async markOptimizationImplemented(id, actualSavings) {
    const optimizations = await this.storage.getOptimizations();
    const optimization = optimizations.find((o) => o.id === id);
    if (optimization) {
      optimization.implemented = true;
      optimization.implementedAt = Date.now();
      optimization.actualSavings = actualSavings;
      await this.storage.saveOptimization(optimization);
    }
  }
  // ===========================================================================
  // Query Methods
  // ===========================================================================
  async getRequests(filters) {
    return this.storage.getRequests(filters);
  }
  async getTotalCost(startTime, endTime) {
    const requests = await this.storage.getRequests({
      startTime: startTime || 0,
      endTime: endTime || Date.now()
    });
    return requests.reduce((sum, r) => sum + r.totalCost, 0);
  }
  async getCostByModel(startTime, endTime) {
    const requests = await this.storage.getRequests({
      startTime: startTime || 0,
      endTime: endTime || Date.now()
    });
    const byModel = {};
    for (const req of requests) {
      byModel[req.model] = (byModel[req.model] || 0) + req.totalCost;
    }
    return byModel;
  }
  async getCostByProvider(startTime, endTime) {
    const requests = await this.storage.getRequests({
      startTime: startTime || 0,
      endTime: endTime || Date.now()
    });
    const byProvider = {};
    for (const req of requests) {
      byProvider[req.provider] = (byProvider[req.provider] || 0) + req.totalCost;
    }
    return byProvider;
  }
  // ===========================================================================
  // Utility
  // ===========================================================================
  getModelPricing(model) {
    return MODEL_PRICING[model];
  }
  estimateCost(model, inputTokens, outputTokens) {
    const pricing = this.config.customModelPricing?.[model] || MODEL_PRICING[model];
    if (!pricing) {
      return { inputCost: 0, outputCost: 0, totalCost: 0 };
    }
    const inputCost = inputTokens / 1e6 * pricing.inputPricePerMillion;
    const outputCost = outputTokens / 1e6 * pricing.outputPricePerMillion;
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost
    };
  }
};
var defaultTracker = null;
function getLLMCostTracker() {
  if (!defaultTracker) {
    defaultTracker = new LLMCostTracker();
  }
  return defaultTracker;
}
function createLLMCostTracker(config, storage) {
  return new LLMCostTracker(config, storage);
}

// src/analytics/types.ts
import { z as z24 } from "zod";
var TokenCategorySchema = z24.enum([
  "system_prompt",
  "user_input",
  "assistant_output",
  "function_call",
  "function_result",
  "context",
  "examples",
  "instructions",
  "cached",
  "padding",
  "special",
  "unknown"
]);
var TokenBreakdownSchema = z24.object({
  total: z24.number(),
  byCategory: z24.record(TokenCategorySchema, z24.number()),
  inputTokens: z24.number(),
  outputTokens: z24.number(),
  cachedTokens: z24.number(),
  wastedTokens: z24.number().describe("Tokens that didn't contribute to output")
});
var EfficiencyMetricSchema = z24.object({
  name: z24.string(),
  value: z24.number(),
  unit: z24.string(),
  benchmark: z24.number().optional(),
  rating: z24.enum(["excellent", "good", "fair", "poor", "critical"]),
  description: z24.string().optional()
});
var TokenEfficiencySchema = z24.object({
  // Input/Output Ratio
  inputOutputRatio: z24.number().describe("Input tokens / Output tokens"),
  // Useful token ratio
  usefulTokenRatio: z24.number().describe("Useful tokens / Total tokens"),
  // Cache hit rate
  cacheHitRate: z24.number().describe("Cached tokens / Total input"),
  // Context utilization
  contextUtilization: z24.number().describe("Used context / Max context window"),
  // Token cost efficiency
  costPerUsefulToken: z24.number().describe("Cost per useful output token"),
  // Compression ratio (if applicable)
  compressionRatio: z24.number().optional().describe("Original length / Token count"),
  // Throughput
  tokensPerSecond: z24.number().optional(),
  // Latency per token
  latencyPerToken: z24.number().optional().describe("ms per output token"),
  // Overall efficiency score (0-100)
  overallScore: z24.number()
});
var UsagePatternTypeSchema = z24.enum([
  "consistent",
  "bursty",
  "growing",
  "declining",
  "cyclical",
  "erratic"
]);
var UsagePatternSchema = z24.object({
  type: UsagePatternTypeSchema,
  confidence: z24.number().min(0).max(1),
  description: z24.string(),
  // Statistics
  mean: z24.number(),
  median: z24.number(),
  stdDev: z24.number(),
  min: z24.number(),
  max: z24.number(),
  // Trend
  trend: z24.enum(["increasing", "stable", "decreasing"]),
  trendStrength: z24.number().min(0).max(1),
  // Seasonality
  hasSeasonality: z24.boolean(),
  seasonalPeriod: z24.string().optional().describe("e.g., 'daily', 'weekly'"),
  peakHours: z24.array(z24.number()).optional(),
  peakDays: z24.array(z24.number()).optional()
});
var TokenAnomalyTypeSchema = z24.enum([
  "spike",
  "drop",
  "unusual_ratio",
  "excessive_input",
  "minimal_output",
  "high_waste",
  "context_overflow",
  "repetition",
  "encoding_issue"
]);
var TokenAnomalySchema = z24.object({
  id: z24.string(),
  type: TokenAnomalyTypeSchema,
  severity: z24.enum(["low", "medium", "high", "critical"]),
  timestamp: z24.number(),
  // Detection
  expected: z24.number(),
  actual: z24.number(),
  deviation: z24.number().describe("Standard deviations from mean"),
  // Context
  model: z24.string().optional(),
  requestId: z24.string().optional(),
  projectId: z24.string().optional(),
  userId: z24.string().optional(),
  // Details
  description: z24.string(),
  possibleCauses: z24.array(z24.string()),
  recommendations: z24.array(z24.string()),
  // Status
  acknowledged: z24.boolean().default(false),
  resolvedAt: z24.number().optional()
});
var ModelComparisonSchema = z24.object({
  model: z24.string(),
  provider: z24.string(),
  // Volume
  totalRequests: z24.number(),
  totalTokens: z24.number(),
  totalCost: z24.number(),
  // Efficiency
  avgInputTokens: z24.number(),
  avgOutputTokens: z24.number(),
  inputOutputRatio: z24.number(),
  cacheHitRate: z24.number(),
  // Performance
  avgLatencyMs: z24.number(),
  tokensPerSecond: z24.number(),
  successRate: z24.number(),
  // Cost efficiency
  costPerRequest: z24.number(),
  costPer1kTokens: z24.number(),
  // Quality indicators
  avgResponseLength: z24.number(),
  consistencyScore: z24.number().describe("How consistent are response lengths")
});
var ProjectAnalyticsSchema = z24.object({
  projectId: z24.string(),
  periodStart: z24.number(),
  periodEnd: z24.number(),
  // Volume
  totalRequests: z24.number(),
  totalTokens: z24.number(),
  totalCost: z24.number(),
  // Breakdown by model
  byModel: z24.record(z24.object({
    requests: z24.number(),
    tokens: z24.number(),
    cost: z24.number(),
    avgLatency: z24.number()
  })),
  // Token categories
  tokenBreakdown: TokenBreakdownSchema,
  // Efficiency
  efficiency: TokenEfficiencySchema,
  // Pattern
  usagePattern: UsagePatternSchema,
  // Top endpoints/features
  topEndpoints: z24.array(z24.object({
    endpoint: z24.string(),
    requests: z24.number(),
    tokens: z24.number(),
    cost: z24.number()
  })),
  // Anomalies
  anomalyCount: z24.number(),
  recentAnomalies: z24.array(TokenAnomalySchema),
  // Recommendations
  recommendations: z24.array(z24.object({
    type: z24.string(),
    priority: z24.enum(["low", "medium", "high"]),
    estimatedSavings: z24.number(),
    description: z24.string()
  }))
});
var TimeGranularitySchema = z24.enum([
  "minute",
  "hour",
  "day",
  "week",
  "month"
]);
var TokenTimeSeriesPointSchema = z24.object({
  timestamp: z24.number(),
  inputTokens: z24.number(),
  outputTokens: z24.number(),
  cachedTokens: z24.number(),
  totalTokens: z24.number(),
  requests: z24.number(),
  cost: z24.number(),
  avgLatency: z24.number().optional()
});
var TokenTimeSeriesSchema = z24.object({
  granularity: TimeGranularitySchema,
  startTime: z24.number(),
  endTime: z24.number(),
  points: z24.array(TokenTimeSeriesPointSchema)
});
var ForecastMethodSchema = z24.enum([
  "linear",
  "exponential",
  "arima",
  "prophet",
  "lstm",
  "ensemble"
]);
var TokenForecastSchema = z24.object({
  method: ForecastMethodSchema,
  periodDays: z24.number(),
  generatedAt: z24.number(),
  // Projections
  projectedTokens: z24.number(),
  projectedCost: z24.number(),
  projectedRequests: z24.number(),
  // Confidence
  confidence: z24.number().min(0).max(1),
  lowerBound: z24.object({
    tokens: z24.number(),
    cost: z24.number()
  }),
  upperBound: z24.object({
    tokens: z24.number(),
    cost: z24.number()
  }),
  // Daily breakdown
  dailyProjections: z24.array(z24.object({
    date: z24.string(),
    tokens: z24.number(),
    cost: z24.number()
  })),
  // Assumptions
  assumptions: z24.array(z24.string()),
  factors: z24.array(z24.object({
    name: z24.string(),
    impact: z24.enum(["positive", "negative", "neutral"]),
    weight: z24.number()
  }))
});
var OptimizationImpactSchema = z24.enum([
  "cost_reduction",
  "latency_improvement",
  "quality_improvement",
  "efficiency_improvement",
  "reliability_improvement"
]);
var TokenOptimizationSchema = z24.object({
  id: z24.string(),
  type: z24.enum([
    "prompt_compression",
    "caching_strategy",
    "model_selection",
    "batching",
    "context_pruning",
    "response_streaming",
    "retry_optimization",
    "request_deduplication"
  ]),
  priority: z24.enum(["low", "medium", "high", "critical"]),
  timestamp: z24.number(),
  // Impact
  impacts: z24.array(OptimizationImpactSchema),
  estimatedSavings: z24.object({
    tokens: z24.number(),
    cost: z24.number(),
    latencyMs: z24.number()
  }),
  // Details
  title: z24.string(),
  description: z24.string(),
  currentState: z24.string(),
  recommendedAction: z24.string(),
  implementation: z24.string().optional().describe("How to implement"),
  // Effort
  effort: z24.enum(["trivial", "easy", "moderate", "complex"]),
  riskLevel: z24.enum(["none", "low", "medium", "high"]),
  // Status
  status: z24.enum(["suggested", "accepted", "implemented", "rejected"]),
  implementedAt: z24.number().optional(),
  actualSavings: z24.object({
    tokens: z24.number(),
    cost: z24.number()
  }).optional()
});
var TokenAnalyticsSummarySchema = z24.object({
  period: z24.object({
    start: z24.number(),
    end: z24.number(),
    granularity: TimeGranularitySchema
  }),
  // Overview
  totalTokens: z24.number(),
  totalCost: z24.number(),
  totalRequests: z24.number(),
  uniqueModels: z24.number(),
  uniqueProjects: z24.number(),
  // Changes from previous period
  tokenChange: z24.number(),
  costChange: z24.number(),
  requestChange: z24.number(),
  // Efficiency
  overallEfficiency: TokenEfficiencySchema,
  efficiencyTrend: z24.enum(["improving", "stable", "declining"]),
  // Top consumers
  topModels: z24.array(ModelComparisonSchema),
  topProjects: z24.array(z24.object({
    projectId: z24.string(),
    tokens: z24.number(),
    cost: z24.number(),
    efficiency: z24.number()
  })),
  // Anomalies
  activeAnomalies: z24.number(),
  anomaliesByType: z24.record(TokenAnomalyTypeSchema, z24.number()),
  // Optimizations
  pendingOptimizations: z24.number(),
  potentialSavings: z24.number(),
  // Forecast
  forecast: TokenForecastSchema.optional()
});
var TokenAnalyticsConfigSchema = z24.object({
  // General
  enabled: z24.boolean().default(true),
  retentionDays: z24.number().default(90),
  // Anomaly detection
  anomalyDetectionEnabled: z24.boolean().default(true),
  anomalyThresholdStdDev: z24.number().default(2.5),
  anomalyMinSamples: z24.number().default(10),
  // Forecasting
  forecastingEnabled: z24.boolean().default(true),
  defaultForecastDays: z24.number().default(30),
  forecastMethod: ForecastMethodSchema.default("linear"),
  // Optimization scanning
  optimizationScanEnabled: z24.boolean().default(true),
  optimizationScanIntervalHours: z24.number().default(24),
  // Pattern analysis
  patternAnalysisEnabled: z24.boolean().default(true),
  patternMinDataPoints: z24.number().default(50),
  // Alerts
  alertOnAnomalies: z24.boolean().default(true),
  alertOnEfficiencyDrop: z24.boolean().default(true),
  efficiencyDropThreshold: z24.number().default(10).describe("Percentage drop"),
  // Time series
  defaultGranularity: TimeGranularitySchema.default("hour"),
  maxTimeSeriesPoints: z24.number().default(1e3)
});
var EFFICIENCY_BENCHMARKS = {
  inputOutputRatio: {
    excellent: 1.5,
    good: 3,
    fair: 5,
    poor: 10
  },
  cacheHitRate: {
    excellent: 0.5,
    good: 0.3,
    fair: 0.15,
    poor: 0.05
  },
  contextUtilization: {
    excellent: 0.7,
    good: 0.5,
    fair: 0.3,
    poor: 0.1
  },
  costPerUsefulToken: {
    excellent: 1e-5,
    good: 5e-5,
    fair: 1e-4,
    poor: 5e-4
  }
};
function calculateEfficiencyRating(value, benchmarks, lowerIsBetter = true) {
  if (lowerIsBetter) {
    if (value <= benchmarks.excellent) return "excellent";
    if (value <= benchmarks.good) return "good";
    if (value <= benchmarks.fair) return "fair";
    if (value <= benchmarks.poor) return "poor";
    return "critical";
  } else {
    if (value >= benchmarks.excellent) return "excellent";
    if (value >= benchmarks.good) return "good";
    if (value >= benchmarks.fair) return "fair";
    if (value >= benchmarks.poor) return "poor";
    return "critical";
  }
}
function formatTokens(tokens) {
  if (tokens >= 1e9) {
    return `${(tokens / 1e9).toFixed(2)}B`;
  }
  if (tokens >= 1e6) {
    return `${(tokens / 1e6).toFixed(2)}M`;
  }
  if (tokens >= 1e3) {
    return `${(tokens / 1e3).toFixed(1)}K`;
  }
  return tokens.toString();
}
function calculateTokenEfficiency(data) {
  const totalTokens = data.inputTokens + data.outputTokens;
  const usefulTokens = data.outputTokens;
  const inputOutputRatio = data.inputTokens / (data.outputTokens || 1);
  const usefulTokenRatio = usefulTokens / (totalTokens || 1);
  const cacheHitRate = data.cachedTokens / (data.inputTokens || 1);
  const contextUtilization = data.usedContext / (data.contextWindow || 1);
  const costPerUsefulToken = data.totalCost / (usefulTokens || 1);
  const scores = [
    calculateEfficiencyRating(inputOutputRatio, EFFICIENCY_BENCHMARKS.inputOutputRatio),
    calculateEfficiencyRating(cacheHitRate, EFFICIENCY_BENCHMARKS.cacheHitRate, false),
    calculateEfficiencyRating(contextUtilization, EFFICIENCY_BENCHMARKS.contextUtilization, false),
    calculateEfficiencyRating(costPerUsefulToken, EFFICIENCY_BENCHMARKS.costPerUsefulToken)
  ];
  const scoreMap = { excellent: 100, good: 75, fair: 50, poor: 25, critical: 0 };
  const overallScore = scores.reduce((sum, s) => sum + scoreMap[s], 0) / scores.length;
  return {
    inputOutputRatio,
    usefulTokenRatio,
    cacheHitRate,
    contextUtilization,
    costPerUsefulToken,
    tokensPerSecond: data.latencyMs ? data.outputTokens / data.latencyMs * 1e3 : void 0,
    latencyPerToken: data.latencyMs ? data.latencyMs / (data.outputTokens || 1) : void 0,
    overallScore
  };
}

// src/analytics/token-analytics.ts
import { EventEmitter as EventEmitter26 } from "eventemitter3";
import { randomUUID as randomUUID15 } from "crypto";
var InMemoryTokenAnalyticsStorage = class {
  timeSeries = /* @__PURE__ */ new Map();
  anomalies = /* @__PURE__ */ new Map();
  optimizations = /* @__PURE__ */ new Map();
  forecasts = /* @__PURE__ */ new Map();
  projectAnalytics = /* @__PURE__ */ new Map();
  getTimeSeriesKey(granularity, projectId, model) {
    return `${granularity}-${projectId || "all"}-${model || "all"}`;
  }
  async saveTimeSeriesPoint(point) {
    const key = this.getTimeSeriesKey("hour", point.projectId, point.model);
    const series = this.timeSeries.get(key) || [];
    series.push(point);
    this.timeSeries.set(key, series);
    const globalKey = this.getTimeSeriesKey("hour");
    const globalSeries = this.timeSeries.get(globalKey) || [];
    globalSeries.push(point);
    this.timeSeries.set(globalKey, globalSeries);
  }
  async getTimeSeries(options) {
    const key = this.getTimeSeriesKey(options.granularity, options.projectId, options.model);
    const allPoints = this.timeSeries.get(key) || [];
    const points = allPoints.filter(
      (p) => p.timestamp >= options.startTime && p.timestamp <= options.endTime
    );
    return {
      granularity: options.granularity,
      startTime: options.startTime,
      endTime: options.endTime,
      points
    };
  }
  async saveAnomaly(anomaly) {
    this.anomalies.set(anomaly.id, anomaly);
  }
  async getAnomalies(options) {
    return Array.from(this.anomalies.values()).filter((a) => {
      if (options?.type && a.type !== options.type) return false;
      if (options?.severity && a.severity !== options.severity) return false;
      if (options?.acknowledged !== void 0 && a.acknowledged !== options.acknowledged) return false;
      if (options?.startTime && a.timestamp < options.startTime) return false;
      if (options?.endTime && a.timestamp > options.endTime) return false;
      return true;
    });
  }
  async acknowledgeAnomaly(anomalyId) {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.acknowledged = true;
    }
  }
  async resolveAnomaly(anomalyId) {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.resolvedAt = Date.now();
    }
  }
  async saveOptimization(optimization) {
    this.optimizations.set(optimization.id, optimization);
  }
  async getOptimizations(status) {
    return Array.from(this.optimizations.values()).filter((o) => {
      if (status && o.status !== status) return false;
      return true;
    });
  }
  async updateOptimizationStatus(id, status, actualSavings) {
    const opt = this.optimizations.get(id);
    if (opt) {
      opt.status = status;
      if (status === "implemented") {
        opt.implementedAt = Date.now();
        opt.actualSavings = actualSavings;
      }
    }
  }
  async saveForecast(forecast) {
    const key = forecast.projectId || "global";
    this.forecasts.set(key, forecast);
  }
  async getForecast(projectId) {
    return this.forecasts.get(projectId || "global") || null;
  }
  async saveProjectAnalytics(analytics) {
    this.projectAnalytics.set(analytics.projectId, analytics);
  }
  async getProjectAnalytics(projectId) {
    return this.projectAnalytics.get(projectId) || null;
  }
};
var TokenAnalyticsManager = class extends EventEmitter26 {
  config;
  storage;
  intervals = /* @__PURE__ */ new Map();
  started = false;
  // Running statistics for anomaly detection
  runningStats = /* @__PURE__ */ new Map();
  constructor(config = {}, storage) {
    super();
    this.config = TokenAnalyticsConfigSchema.parse(config);
    this.storage = storage || new InMemoryTokenAnalyticsStorage();
  }
  // ===========================================================================
  // Lifecycle
  // ===========================================================================
  async start() {
    if (this.started) return;
    if (this.config.optimizationScanEnabled) {
      this.scheduleOptimizationScan();
    }
    this.started = true;
  }
  async stop() {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.started = false;
  }
  // ===========================================================================
  // Data Ingestion
  // ===========================================================================
  async recordUsage(data) {
    const point = {
      timestamp: data.timestamp || Date.now(),
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cachedTokens: data.cachedTokens || 0,
      totalTokens: data.inputTokens + data.outputTokens,
      requests: 1,
      cost: data.cost,
      avgLatency: data.latencyMs,
      projectId: data.projectId,
      model: data.model
    };
    await this.storage.saveTimeSeriesPoint(point);
    if (this.config.anomalyDetectionEnabled) {
      await this.checkForAnomalies(point);
    }
  }
  // ===========================================================================
  // Anomaly Detection
  // ===========================================================================
  async checkForAnomalies(point) {
    const key = `tokens-${point.projectId || "global"}`;
    let stats = this.runningStats.get(key);
    if (!stats) {
      stats = { count: 0, mean: 0, m2: 0 };
    }
    stats.count++;
    const delta = point.totalTokens - stats.mean;
    stats.mean += delta / stats.count;
    const delta2 = point.totalTokens - stats.mean;
    stats.m2 += delta * delta2;
    this.runningStats.set(key, stats);
    if (stats.count < this.config.anomalyMinSamples) return;
    const variance = stats.m2 / (stats.count - 1);
    const stdDev = Math.sqrt(variance);
    const deviation = (point.totalTokens - stats.mean) / (stdDev || 1);
    if (Math.abs(deviation) >= this.config.anomalyThresholdStdDev) {
      const anomaly = await this.createAnomaly({
        type: deviation > 0 ? "spike" : "drop",
        expected: stats.mean,
        actual: point.totalTokens,
        deviation,
        model: point.model,
        projectId: point.projectId
      });
      if (this.config.alertOnAnomalies) {
        this.emit("anomalyDetected", anomaly);
      }
    }
    const ratio = point.inputTokens / (point.outputTokens || 1);
    if (ratio > 20) {
      await this.createAnomaly({
        type: "unusual_ratio",
        expected: 5,
        actual: ratio,
        deviation: (ratio - 5) / 2,
        model: point.model,
        projectId: point.projectId,
        description: `Unusually high input/output ratio: ${ratio.toFixed(1)}:1`
      });
    }
  }
  async createAnomaly(data) {
    const severity = this.calculateAnomalySeverity(data.deviation);
    const anomaly = {
      id: randomUUID15(),
      type: data.type,
      severity,
      timestamp: Date.now(),
      expected: data.expected,
      actual: data.actual,
      deviation: data.deviation,
      model: data.model,
      projectId: data.projectId,
      requestId: data.requestId,
      description: data.description || this.generateAnomalyDescription(data.type, data.expected, data.actual),
      possibleCauses: this.getPossibleCauses(data.type),
      recommendations: this.getAnomalyRecommendations(data.type),
      acknowledged: false
    };
    await this.storage.saveAnomaly(anomaly);
    return anomaly;
  }
  calculateAnomalySeverity(deviation) {
    const absDeviation = Math.abs(deviation);
    if (absDeviation >= 5) return "critical";
    if (absDeviation >= 4) return "high";
    if (absDeviation >= 3) return "medium";
    return "low";
  }
  generateAnomalyDescription(type, expected, actual) {
    const descriptions = {
      spike: `Token usage spiked to ${actual.toFixed(0)} (expected ~${expected.toFixed(0)})`,
      drop: `Token usage dropped to ${actual.toFixed(0)} (expected ~${expected.toFixed(0)})`,
      unusual_ratio: `Unusual input/output ratio detected`,
      excessive_input: `Excessive input tokens: ${actual.toFixed(0)}`,
      minimal_output: `Minimal output tokens: ${actual.toFixed(0)}`,
      high_waste: `High token waste detected`,
      context_overflow: `Context window overflow detected`,
      repetition: `Repetitive content detected in output`,
      encoding_issue: `Potential encoding issue affecting token count`
    };
    return descriptions[type] || "Unknown anomaly";
  }
  getPossibleCauses(type) {
    const causes = {
      spike: [
        "Large batch of requests processed",
        "Complex query requiring detailed response",
        "New feature deployment",
        "Unusual user activity"
      ],
      drop: [
        "Service disruption or downtime",
        "Client-side issues",
        "Rate limiting activated",
        "Reduced user activity"
      ],
      unusual_ratio: [
        "Large context/system prompts",
        "Short responses or errors",
        "Caching issues",
        "Prompt engineering needed"
      ],
      excessive_input: [
        "Redundant context included",
        "Large document processing",
        "Inefficient prompt design",
        "Missing caching"
      ],
      minimal_output: [
        "Model returned error",
        "Query too restrictive",
        "Max tokens set too low",
        "Request timeout"
      ],
      high_waste: [
        "Unused context in prompts",
        "Redundant information",
        "Suboptimal prompt structure"
      ],
      context_overflow: [
        "Input exceeds context window",
        "No truncation strategy",
        "Document too large"
      ],
      repetition: [
        "Model in repetition loop",
        "Prompt encouraging repetition",
        "Temperature too low"
      ],
      encoding_issue: [
        "Special characters in input",
        "Unicode handling issues",
        "Binary data in text"
      ]
    };
    return causes[type] || ["Unknown cause"];
  }
  getAnomalyRecommendations(type) {
    const recommendations = {
      spike: [
        "Review recent changes to prompts or workflows",
        "Check for batch processing jobs",
        "Consider implementing request throttling"
      ],
      drop: [
        "Check service health and connectivity",
        "Review error logs for failures",
        "Verify API credentials are valid"
      ],
      unusual_ratio: [
        "Review and optimize system prompts",
        "Consider using prompt compression",
        "Enable caching for repeated context"
      ],
      excessive_input: [
        "Implement context pruning",
        "Use summarization for long documents",
        "Enable prompt caching"
      ],
      minimal_output: [
        "Check for error responses",
        "Increase max_tokens if appropriate",
        "Review query complexity"
      ],
      high_waste: [
        "Audit prompt templates",
        "Remove redundant context",
        "Use dynamic prompt generation"
      ],
      context_overflow: [
        "Implement chunking strategy",
        "Use summarization",
        "Switch to model with larger context"
      ],
      repetition: [
        "Increase temperature slightly",
        "Add presence_penalty",
        "Review prompt for repetition triggers"
      ],
      encoding_issue: [
        "Sanitize input text",
        "Check character encoding",
        "Handle special characters"
      ]
    };
    return recommendations[type] || ["Contact support for assistance"];
  }
  // ===========================================================================
  // Efficiency Analysis
  // ===========================================================================
  async analyzeEfficiency(options) {
    const timeSeries = await this.storage.getTimeSeries({
      granularity: "hour",
      ...options
    });
    if (timeSeries.points.length === 0) {
      return this.getEmptyEfficiency();
    }
    const totals = timeSeries.points.reduce(
      (acc, p) => ({
        inputTokens: acc.inputTokens + p.inputTokens,
        outputTokens: acc.outputTokens + p.outputTokens,
        cachedTokens: acc.cachedTokens + p.cachedTokens,
        totalCost: acc.totalCost + p.cost,
        latencyMs: acc.latencyMs + (p.avgLatency || 0),
        count: acc.count + 1
      }),
      { inputTokens: 0, outputTokens: 0, cachedTokens: 0, totalCost: 0, latencyMs: 0, count: 0 }
    );
    return calculateTokenEfficiency({
      inputTokens: totals.inputTokens,
      outputTokens: totals.outputTokens,
      cachedTokens: totals.cachedTokens,
      totalCost: totals.totalCost,
      contextWindow: 128e3,
      // Default, should be model-specific
      usedContext: totals.inputTokens / totals.count,
      latencyMs: totals.count > 0 ? totals.latencyMs / totals.count : void 0
    });
  }
  getEmptyEfficiency() {
    return {
      inputOutputRatio: 0,
      usefulTokenRatio: 0,
      cacheHitRate: 0,
      contextUtilization: 0,
      costPerUsefulToken: 0,
      overallScore: 0
    };
  }
  // ===========================================================================
  // Pattern Analysis
  // ===========================================================================
  async analyzeUsagePattern(options) {
    const timeSeries = await this.storage.getTimeSeries({
      granularity: "hour",
      ...options
    });
    const points = timeSeries.points;
    if (points.length < this.config.patternMinDataPoints) {
      return this.getDefaultPattern();
    }
    const values = points.map((p) => p.totalTokens);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const patternType = this.detectPatternType(values, stdDev, mean);
    const trend = this.detectTrend(values);
    const seasonality = this.detectSeasonality(points);
    return {
      type: patternType.type,
      confidence: patternType.confidence,
      description: this.generatePatternDescription(patternType.type, trend.direction),
      mean,
      median,
      stdDev,
      min,
      max,
      trend: trend.direction,
      trendStrength: trend.strength,
      hasSeasonality: seasonality.hasSeasonality,
      seasonalPeriod: seasonality.period,
      peakHours: seasonality.peakHours,
      peakDays: seasonality.peakDays
    };
  }
  detectPatternType(values, stdDev, mean) {
    const cv = stdDev / (mean || 1);
    if (cv < 0.1) {
      return { type: "consistent", confidence: 0.9 };
    }
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (secondAvg > firstAvg * 1.3) {
      return { type: "growing", confidence: 0.7 };
    }
    if (secondAvg < firstAvg * 0.7) {
      return { type: "declining", confidence: 0.7 };
    }
    if (cv > 0.5) {
      return { type: "bursty", confidence: 0.8 };
    }
    if (cv > 0.3) {
      return { type: "erratic", confidence: 0.6 };
    }
    return { type: "cyclical", confidence: 0.5 };
  }
  detectTrend(values) {
    if (values.length < 3) {
      return { direction: "stable", strength: 0 };
    }
    const n = values.length;
    const sumX = n * (n - 1) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    const normalizedSlope = slope / (avgY || 1);
    if (normalizedSlope > 0.05) {
      return { direction: "increasing", strength: Math.min(Math.abs(normalizedSlope) * 5, 1) };
    }
    if (normalizedSlope < -0.05) {
      return { direction: "decreasing", strength: Math.min(Math.abs(normalizedSlope) * 5, 1) };
    }
    return { direction: "stable", strength: 0 };
  }
  detectSeasonality(points) {
    if (points.length < 24) {
      return { hasSeasonality: false };
    }
    const byHour = /* @__PURE__ */ new Map();
    for (const p of points) {
      const hour = new Date(p.timestamp).getHours();
      if (!byHour.has(hour)) byHour.set(hour, []);
      byHour.get(hour).push(p.totalTokens);
    }
    const hourlyAvgs = [];
    for (const [hour, values] of byHour) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      hourlyAvgs.push([hour, avg]);
    }
    hourlyAvgs.sort((a, b) => b[1] - a[1]);
    const globalAvg = hourlyAvgs.reduce((sum, [, avg]) => sum + avg, 0) / hourlyAvgs.length;
    const peakHours = hourlyAvgs.filter(([, avg]) => avg > globalAvg * 1.2).map(([hour]) => hour).slice(0, 5);
    if (peakHours.length > 0) {
      return {
        hasSeasonality: true,
        period: "daily",
        peakHours
      };
    }
    return { hasSeasonality: false };
  }
  generatePatternDescription(type, trend) {
    const descriptions = {
      consistent: "Usage is steady with minimal variation",
      bursty: "Usage shows periodic bursts of high activity",
      growing: "Usage is steadily increasing over time",
      declining: "Usage is declining over time",
      cyclical: "Usage follows a predictable cycle",
      erratic: "Usage shows unpredictable variation"
    };
    return `${descriptions[type]}. Trend: ${trend}`;
  }
  getDefaultPattern() {
    return {
      type: "consistent",
      confidence: 0,
      description: "Insufficient data for pattern analysis",
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      trend: "stable",
      trendStrength: 0,
      hasSeasonality: false
    };
  }
  // ===========================================================================
  // Forecasting
  // ===========================================================================
  async generateForecast(options) {
    const periodDays = options.periodDays || this.config.defaultForecastDays;
    const endTime = Date.now();
    const startTime = endTime - 30 * 24 * 60 * 60 * 1e3;
    const timeSeries = await this.storage.getTimeSeries({
      granularity: "day",
      startTime,
      endTime,
      projectId: options.projectId
    });
    const points = timeSeries.points;
    if (points.length < 7) {
      return this.getDefaultForecast(periodDays);
    }
    const dailyTokens = points.map((p) => p.totalTokens);
    const dailyCosts = points.map((p) => p.cost);
    const dailyRequests = points.map((p) => p.requests);
    const avgTokens = dailyTokens.reduce((a, b) => a + b, 0) / dailyTokens.length;
    const avgCost = dailyCosts.reduce((a, b) => a + b, 0) / dailyCosts.length;
    const avgRequests = dailyRequests.reduce((a, b) => a + b, 0) / dailyRequests.length;
    const trend = this.detectTrend(dailyTokens);
    const trendMultiplier = 1 + (trend.direction === "increasing" ? 0.1 : trend.direction === "decreasing" ? -0.1 : 0) * trend.strength;
    const projectedTokens = avgTokens * periodDays * trendMultiplier;
    const projectedCost = avgCost * periodDays * trendMultiplier;
    const projectedRequests = avgRequests * periodDays * trendMultiplier;
    const stdDev = Math.sqrt(dailyTokens.reduce((sum, v) => sum + Math.pow(v - avgTokens, 2), 0) / dailyTokens.length);
    const cv = stdDev / (avgTokens || 1);
    const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));
    const dailyProjections = [];
    const startDate = /* @__PURE__ */ new Date();
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayMultiplier = 1 + (trendMultiplier - 1) * (i / periodDays);
      dailyProjections.push({
        date: date.toISOString().split("T")[0],
        tokens: Math.round(avgTokens * dayMultiplier),
        cost: avgCost * dayMultiplier
      });
    }
    const forecast = {
      method: this.config.forecastMethod,
      periodDays,
      generatedAt: Date.now(),
      projectedTokens: Math.round(projectedTokens),
      projectedCost,
      projectedRequests: Math.round(projectedRequests),
      confidence,
      lowerBound: {
        tokens: Math.round(projectedTokens * 0.7),
        cost: projectedCost * 0.7
      },
      upperBound: {
        tokens: Math.round(projectedTokens * 1.3),
        cost: projectedCost * 1.3
      },
      dailyProjections,
      assumptions: [
        "Based on last 30 days of usage",
        `Using ${this.config.forecastMethod} projection method`,
        trend.direction !== "stable" ? `Trend adjustment applied: ${trend.direction}` : "No significant trend detected"
      ],
      factors: [
        {
          name: "Historical trend",
          impact: trend.direction === "increasing" ? "positive" : trend.direction === "decreasing" ? "negative" : "neutral",
          weight: trend.strength
        }
      ]
    };
    await this.storage.saveForecast({ ...forecast, projectId: options.projectId });
    this.emit("forecastGenerated", forecast);
    return forecast;
  }
  getDefaultForecast(periodDays) {
    return {
      method: "linear",
      periodDays,
      generatedAt: Date.now(),
      projectedTokens: 0,
      projectedCost: 0,
      projectedRequests: 0,
      confidence: 0,
      lowerBound: { tokens: 0, cost: 0 },
      upperBound: { tokens: 0, cost: 0 },
      dailyProjections: [],
      assumptions: ["Insufficient historical data for forecast"],
      factors: []
    };
  }
  // ===========================================================================
  // Optimization Recommendations
  // ===========================================================================
  async scanForOptimizations(options) {
    const optimizations = [];
    const endTime = Date.now();
    const startTime = endTime - 7 * 24 * 60 * 60 * 1e3;
    const efficiency = await this.analyzeEfficiency({
      startTime,
      endTime,
      projectId: options?.projectId
    });
    if (efficiency.cacheHitRate < 0.2) {
      const optimization = {
        id: randomUUID15(),
        type: "caching_strategy",
        priority: efficiency.cacheHitRate < 0.05 ? "high" : "medium",
        timestamp: Date.now(),
        impacts: ["cost_reduction", "latency_improvement"],
        estimatedSavings: {
          tokens: 0,
          cost: efficiency.costPerUsefulToken * 0.3,
          latencyMs: 100
        },
        title: "Improve prompt caching",
        description: `Cache hit rate is only ${(efficiency.cacheHitRate * 100).toFixed(1)}%. Implementing caching could reduce costs by 20-50%.`,
        currentState: `Cache hit rate: ${(efficiency.cacheHitRate * 100).toFixed(1)}%`,
        recommendedAction: "Enable prompt caching for system prompts and repeated context",
        implementation: "Use cache_control: { type: 'ephemeral' } for system prompts",
        effort: "easy",
        riskLevel: "none",
        status: "suggested"
      };
      optimizations.push(optimization);
      await this.storage.saveOptimization(optimization);
      this.emit("optimizationFound", optimization);
    }
    if (efficiency.inputOutputRatio > 10) {
      const optimization = {
        id: randomUUID15(),
        type: "prompt_compression",
        priority: efficiency.inputOutputRatio > 20 ? "high" : "medium",
        timestamp: Date.now(),
        impacts: ["cost_reduction", "efficiency_improvement"],
        estimatedSavings: {
          tokens: Math.round(efficiency.inputOutputRatio * 1e3),
          cost: efficiency.costPerUsefulToken * 0.25,
          latencyMs: 50
        },
        title: "Reduce input token usage",
        description: `Input/output ratio is ${efficiency.inputOutputRatio.toFixed(1)}:1. Consider compressing prompts or removing redundant context.`,
        currentState: `${efficiency.inputOutputRatio.toFixed(1)} input tokens per output token`,
        recommendedAction: "Review and optimize system prompts, use dynamic context injection",
        effort: "moderate",
        riskLevel: "low",
        status: "suggested"
      };
      optimizations.push(optimization);
      await this.storage.saveOptimization(optimization);
      this.emit("optimizationFound", optimization);
    }
    if (efficiency.contextUtilization < 0.1) {
      const optimization = {
        id: randomUUID15(),
        type: "model_selection",
        priority: "low",
        timestamp: Date.now(),
        impacts: ["cost_reduction"],
        estimatedSavings: {
          tokens: 0,
          cost: efficiency.costPerUsefulToken * 0.1,
          latencyMs: 0
        },
        title: "Consider smaller context model",
        description: `Only ${(efficiency.contextUtilization * 100).toFixed(1)}% of context window is used. A model with smaller context might be more cost-effective.`,
        currentState: `${(efficiency.contextUtilization * 100).toFixed(1)}% context utilization`,
        recommendedAction: "Evaluate if a model with smaller context window (and lower cost) would suffice",
        effort: "easy",
        riskLevel: "low",
        status: "suggested"
      };
      optimizations.push(optimization);
      await this.storage.saveOptimization(optimization);
      this.emit("optimizationFound", optimization);
    }
    return optimizations;
  }
  scheduleOptimizationScan() {
    const interval = setInterval(async () => {
      try {
        await this.scanForOptimizations();
      } catch (error) {
        this.emit("error", error);
      }
    }, this.config.optimizationScanIntervalHours * 60 * 60 * 1e3);
    this.intervals.set("optimization", interval);
  }
  // ===========================================================================
  // Summary & Reporting
  // ===========================================================================
  async generateSummary(options) {
    const granularity = options.granularity || this.config.defaultGranularity;
    const timeSeries = await this.storage.getTimeSeries({
      granularity,
      startTime: options.startTime,
      endTime: options.endTime
    });
    const points = timeSeries.points;
    const totals = points.reduce(
      (acc, p) => ({
        tokens: acc.tokens + p.totalTokens,
        cost: acc.cost + p.cost,
        requests: acc.requests + p.requests
      }),
      { tokens: 0, cost: 0, requests: 0 }
    );
    const periodMs = options.endTime - options.startTime;
    const prevTimeSeries = await this.storage.getTimeSeries({
      granularity,
      startTime: options.startTime - periodMs,
      endTime: options.startTime
    });
    const prevTotals = prevTimeSeries.points.reduce(
      (acc, p) => ({
        tokens: acc.tokens + p.totalTokens,
        cost: acc.cost + p.cost,
        requests: acc.requests + p.requests
      }),
      { tokens: 0, cost: 0, requests: 0 }
    );
    const efficiency = await this.analyzeEfficiency({
      startTime: options.startTime,
      endTime: options.endTime
    });
    const anomalies = await this.storage.getAnomalies({
      startTime: options.startTime,
      endTime: options.endTime,
      acknowledged: false
    });
    const optimizations = await this.storage.getOptimizations("suggested");
    const forecast = await this.storage.getForecast();
    const tokenChange = prevTotals.tokens > 0 ? (totals.tokens - prevTotals.tokens) / prevTotals.tokens * 100 : 0;
    const costChange = prevTotals.cost > 0 ? (totals.cost - prevTotals.cost) / prevTotals.cost * 100 : 0;
    const requestChange = prevTotals.requests > 0 ? (totals.requests - prevTotals.requests) / prevTotals.requests * 100 : 0;
    const anomaliesByType = {};
    for (const a of anomalies) {
      anomaliesByType[a.type] = (anomaliesByType[a.type] || 0) + 1;
    }
    const summary = {
      period: {
        start: options.startTime,
        end: options.endTime,
        granularity
      },
      totalTokens: totals.tokens,
      totalCost: totals.cost,
      totalRequests: totals.requests,
      uniqueModels: 0,
      // Would need model tracking
      uniqueProjects: 0,
      // Would need project tracking
      tokenChange,
      costChange,
      requestChange,
      overallEfficiency: efficiency,
      efficiencyTrend: efficiency.overallScore > 60 ? "improving" : efficiency.overallScore < 40 ? "declining" : "stable",
      topModels: [],
      // Would need model aggregation
      topProjects: [],
      // Would need project aggregation
      activeAnomalies: anomalies.length,
      anomaliesByType,
      pendingOptimizations: optimizations.length,
      potentialSavings: optimizations.reduce((sum, o) => sum + o.estimatedSavings.cost, 0),
      forecast: forecast || void 0
    };
    this.emit("summaryGenerated", summary);
    return summary;
  }
  // ===========================================================================
  // Query Methods
  // ===========================================================================
  async getTimeSeries(options) {
    return this.storage.getTimeSeries(options);
  }
  async getAnomalies(options) {
    return this.storage.getAnomalies(options);
  }
  async acknowledgeAnomaly(anomalyId) {
    await this.storage.acknowledgeAnomaly(anomalyId);
  }
  async resolveAnomaly(anomalyId) {
    await this.storage.resolveAnomaly(anomalyId);
    this.emit("anomalyResolved", anomalyId);
  }
  async getOptimizations(status) {
    return this.storage.getOptimizations(status);
  }
  async implementOptimization(id, actualSavings) {
    await this.storage.updateOptimizationStatus(id, "implemented", actualSavings);
    const optimizations = await this.storage.getOptimizations();
    const opt = optimizations.find((o) => o.id === id);
    if (opt) {
      this.emit("optimizationImplemented", opt);
    }
  }
  async getForecast(projectId) {
    return this.storage.getForecast(projectId);
  }
};
var defaultManager8 = null;
function getTokenAnalyticsManager() {
  if (!defaultManager8) {
    defaultManager8 = new TokenAnalyticsManager();
  }
  return defaultManager8;
}
function createTokenAnalyticsManager(config, storage) {
  return new TokenAnalyticsManager(config, storage);
}

// src/prompts/types.ts
import { z as z25 } from "zod";
var PromptTypeSchema = z25.enum([
  "system",
  "user",
  "assistant",
  "function",
  "tool",
  "completion",
  "chat",
  "few_shot",
  "chain_of_thought"
]);
var PromptStatusSchema = z25.enum([
  "draft",
  "review",
  "active",
  "deprecated",
  "archived"
]);
var VariableTypeSchema = z25.enum([
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "json"
]);
var PromptVariableSchema = z25.object({
  name: z25.string(),
  type: VariableTypeSchema,
  description: z25.string().optional(),
  required: z25.boolean().default(true),
  defaultValue: z25.unknown().optional(),
  validation: z25.object({
    minLength: z25.number().optional(),
    maxLength: z25.number().optional(),
    pattern: z25.string().optional(),
    enum: z25.array(z25.unknown()).optional(),
    min: z25.number().optional(),
    max: z25.number().optional()
  }).optional(),
  examples: z25.array(z25.unknown()).optional()
});
var PromptTemplateSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  slug: z25.string().describe("URL-friendly identifier"),
  description: z25.string().optional(),
  type: PromptTypeSchema,
  status: PromptStatusSchema.default("draft"),
  // Content
  content: z25.string().describe("Template with {{variable}} placeholders"),
  systemPrompt: z25.string().optional(),
  fewShotExamples: z25.array(z25.object({
    input: z25.string(),
    output: z25.string(),
    explanation: z25.string().optional()
  })).optional(),
  // Variables
  variables: z25.array(PromptVariableSchema).default([]),
  // Model constraints
  recommendedModels: z25.array(z25.string()).optional(),
  maxTokens: z25.number().optional(),
  temperature: z25.number().min(0).max(2).optional(),
  topP: z25.number().min(0).max(1).optional(),
  // Metadata
  tags: z25.array(z25.string()).default([]),
  category: z25.string().optional(),
  author: z25.string().optional(),
  // Versioning
  version: z25.string().default("1.0.0"),
  parentId: z25.string().optional().describe("ID of parent template if forked"),
  changelog: z25.string().optional(),
  // Analytics
  usageCount: z25.number().default(0),
  avgTokens: z25.number().optional(),
  avgLatencyMs: z25.number().optional(),
  successRate: z25.number().optional(),
  // Timestamps
  createdAt: z25.number(),
  updatedAt: z25.number(),
  publishedAt: z25.number().optional(),
  deprecatedAt: z25.number().optional()
});
var PromptVersionSchema = z25.object({
  id: z25.string(),
  templateId: z25.string(),
  version: z25.string(),
  content: z25.string(),
  systemPrompt: z25.string().optional(),
  fewShotExamples: z25.array(z25.object({
    input: z25.string(),
    output: z25.string(),
    explanation: z25.string().optional()
  })).optional(),
  variables: z25.array(PromptVariableSchema),
  changelog: z25.string().optional(),
  author: z25.string().optional(),
  createdAt: z25.number(),
  // Performance at this version
  usageCount: z25.number().default(0),
  avgTokens: z25.number().optional(),
  avgLatencyMs: z25.number().optional(),
  successRate: z25.number().optional()
});
var PromptExecutionSchema = z25.object({
  id: z25.string(),
  templateId: z25.string(),
  version: z25.string(),
  timestamp: z25.number(),
  // Input
  variables: z25.record(z25.unknown()),
  renderedPrompt: z25.string(),
  // Model
  model: z25.string(),
  provider: z25.string(),
  // Output
  response: z25.string().optional(),
  functionCalls: z25.array(z25.object({
    name: z25.string(),
    arguments: z25.record(z25.unknown()),
    result: z25.unknown().optional()
  })).optional(),
  // Metrics
  inputTokens: z25.number(),
  outputTokens: z25.number(),
  totalTokens: z25.number(),
  latencyMs: z25.number(),
  cost: z25.number(),
  // Quality
  success: z25.boolean(),
  errorCode: z25.string().optional(),
  errorMessage: z25.string().optional(),
  // Feedback
  rating: z25.number().min(1).max(5).optional(),
  feedback: z25.string().optional(),
  flagged: z25.boolean().default(false),
  flagReason: z25.string().optional(),
  // Context
  userId: z25.string().optional(),
  sessionId: z25.string().optional(),
  experimentId: z25.string().optional(),
  variantId: z25.string().optional()
});
var ExperimentStatusSchema = z25.enum([
  "draft",
  "running",
  "paused",
  "completed",
  "cancelled"
]);
var ExperimentVariantSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  description: z25.string().optional(),
  templateId: z25.string(),
  version: z25.string(),
  weight: z25.number().min(0).max(100).describe("Percentage of traffic"),
  // Metrics
  impressions: z25.number().default(0),
  conversions: z25.number().default(0),
  avgRating: z25.number().optional(),
  avgLatencyMs: z25.number().optional(),
  avgTokens: z25.number().optional(),
  avgCost: z25.number().optional(),
  successRate: z25.number().optional()
});
var ExperimentSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  description: z25.string().optional(),
  hypothesis: z25.string().optional(),
  // Status
  status: ExperimentStatusSchema,
  // Variants
  variants: z25.array(ExperimentVariantSchema).min(2),
  controlVariantId: z25.string().describe("ID of the control/baseline variant"),
  // Configuration
  sampleSize: z25.number().optional().describe("Target sample size per variant"),
  confidenceLevel: z25.number().default(0.95),
  minimumDetectableEffect: z25.number().default(0.05).describe("Minimum effect size to detect"),
  // Targeting
  targetAudience: z25.object({
    userIds: z25.array(z25.string()).optional(),
    userPercentage: z25.number().min(0).max(100).optional(),
    conditions: z25.array(z25.object({
      field: z25.string(),
      operator: z25.enum(["eq", "neq", "gt", "lt", "in", "contains"]),
      value: z25.unknown()
    })).optional()
  }).optional(),
  // Metrics
  primaryMetric: z25.enum(["conversion", "rating", "latency", "cost", "tokens", "success_rate"]),
  secondaryMetrics: z25.array(z25.enum(["conversion", "rating", "latency", "cost", "tokens", "success_rate"])).optional(),
  // Timestamps
  createdAt: z25.number(),
  startedAt: z25.number().optional(),
  endedAt: z25.number().optional(),
  scheduledStart: z25.number().optional(),
  scheduledEnd: z25.number().optional(),
  // Results
  winningVariantId: z25.string().optional(),
  statisticalSignificance: z25.number().optional(),
  conclusionNotes: z25.string().optional()
});
var ExperimentResultSchema = z25.object({
  experimentId: z25.string(),
  calculatedAt: z25.number(),
  // Per variant
  variantResults: z25.array(z25.object({
    variantId: z25.string(),
    impressions: z25.number(),
    conversions: z25.number(),
    conversionRate: z25.number(),
    avgRating: z25.number().optional(),
    avgLatencyMs: z25.number(),
    avgTokens: z25.number(),
    avgCost: z25.number(),
    successRate: z25.number()
  })),
  // Statistical analysis
  isSignificant: z25.boolean(),
  pValue: z25.number(),
  confidenceInterval: z25.object({
    lower: z25.number(),
    upper: z25.number()
  }),
  effectSize: z25.number(),
  // Recommendation
  recommendedVariant: z25.string().optional(),
  recommendation: z25.string()
});
var ChainStepSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  templateId: z25.string(),
  order: z25.number(),
  // Input mapping
  inputMapping: z25.record(z25.string()).describe("Map chain context to template variables"),
  // Output handling
  outputKey: z25.string().describe("Key to store output in chain context"),
  parseOutput: z25.enum(["text", "json", "lines", "regex"]).default("text"),
  parseConfig: z25.object({
    regex: z25.string().optional(),
    jsonPath: z25.string().optional()
  }).optional(),
  // Conditions
  condition: z25.string().optional().describe("JavaScript expression to evaluate"),
  skipOnFailure: z25.boolean().default(false),
  retryOnFailure: z25.number().default(0),
  // Branching
  nextStepOnSuccess: z25.string().optional(),
  nextStepOnFailure: z25.string().optional()
});
var PromptChainSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  description: z25.string().optional(),
  status: PromptStatusSchema,
  // Steps
  steps: z25.array(ChainStepSchema),
  startStepId: z25.string(),
  // Global variables
  inputVariables: z25.array(PromptVariableSchema),
  outputMapping: z25.record(z25.string()).describe("Map final context to chain output"),
  // Configuration
  maxSteps: z25.number().default(10),
  timeoutMs: z25.number().default(6e4),
  parallelExecution: z25.boolean().default(false),
  // Metadata
  tags: z25.array(z25.string()).default([]),
  author: z25.string().optional(),
  createdAt: z25.number(),
  updatedAt: z25.number()
});
var ChainExecutionSchema = z25.object({
  id: z25.string(),
  chainId: z25.string(),
  timestamp: z25.number(),
  // Input/Output
  input: z25.record(z25.unknown()),
  output: z25.record(z25.unknown()).optional(),
  context: z25.record(z25.unknown()),
  // Steps
  stepExecutions: z25.array(z25.object({
    stepId: z25.string(),
    templateId: z25.string(),
    startedAt: z25.number(),
    completedAt: z25.number().optional(),
    status: z25.enum(["pending", "running", "completed", "failed", "skipped"]),
    input: z25.record(z25.unknown()),
    output: z25.unknown().optional(),
    error: z25.string().optional(),
    tokens: z25.number().optional(),
    cost: z25.number().optional()
  })),
  // Metrics
  totalSteps: z25.number(),
  completedSteps: z25.number(),
  totalTokens: z25.number(),
  totalCost: z25.number(),
  totalLatencyMs: z25.number(),
  // Status
  status: z25.enum(["pending", "running", "completed", "failed", "cancelled"]),
  error: z25.string().optional()
});
var OptimizationGoalSchema = z25.enum([
  "reduce_tokens",
  "improve_quality",
  "reduce_latency",
  "reduce_cost",
  "improve_consistency"
]);
var PromptOptimizationSchema = z25.object({
  id: z25.string(),
  templateId: z25.string(),
  timestamp: z25.number(),
  // Goal
  goal: OptimizationGoalSchema,
  // Original
  originalContent: z25.string(),
  originalTokens: z25.number(),
  originalMetrics: z25.object({
    avgLatencyMs: z25.number().optional(),
    avgCost: z25.number().optional(),
    successRate: z25.number().optional(),
    avgRating: z25.number().optional()
  }),
  // Optimized
  optimizedContent: z25.string(),
  optimizedTokens: z25.number(),
  estimatedImprovement: z25.object({
    tokenReduction: z25.number().optional(),
    latencyReduction: z25.number().optional(),
    costReduction: z25.number().optional(),
    qualityImprovement: z25.number().optional()
  }),
  // Techniques applied
  techniques: z25.array(z25.enum([
    "compression",
    "deduplication",
    "simplification",
    "restructuring",
    "few_shot_reduction",
    "instruction_refinement"
  ])),
  // Validation
  validationStatus: z25.enum(["pending", "passed", "failed"]),
  validationNotes: z25.string().optional(),
  // Applied
  applied: z25.boolean().default(false),
  appliedAt: z25.number().optional(),
  actualImprovement: z25.object({
    tokenReduction: z25.number().optional(),
    latencyReduction: z25.number().optional(),
    costReduction: z25.number().optional(),
    qualityChange: z25.number().optional()
  }).optional()
});
var PromptCollectionSchema = z25.object({
  id: z25.string(),
  name: z25.string(),
  description: z25.string().optional(),
  templateIds: z25.array(z25.string()),
  chainIds: z25.array(z25.string()).default([]),
  isPublic: z25.boolean().default(false),
  author: z25.string().optional(),
  tags: z25.array(z25.string()).default([]),
  createdAt: z25.number(),
  updatedAt: z25.number()
});
var PromptManagerConfigSchema = z25.object({
  // General
  enabled: z25.boolean().default(true),
  // Versioning
  autoVersionOnEdit: z25.boolean().default(true),
  maxVersionsToKeep: z25.number().default(50),
  // Validation
  validateVariablesOnRender: z25.boolean().default(true),
  strictVariableValidation: z25.boolean().default(false),
  // Caching
  cacheRenderedPrompts: z25.boolean().default(true),
  cacheTTLSeconds: z25.number().default(300),
  // Experiments
  defaultConfidenceLevel: z25.number().default(0.95),
  minSampleSizePerVariant: z25.number().default(100),
  // Optimization
  autoOptimizationEnabled: z25.boolean().default(false),
  optimizationThreshold: z25.number().default(1e3).describe("Min tokens to suggest optimization"),
  // Analytics
  trackExecutions: z25.boolean().default(true),
  executionRetentionDays: z25.number().default(30),
  // Rate limiting
  maxRendersPerMinute: z25.number().default(1e3)
});
function parseTemplateVariables(content) {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1].trim().split("|")[0].trim();
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  return variables;
}
function renderTemplate(content, variables, options = {}) {
  return content.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
    const parts = expr.trim().split("|");
    const varName = parts[0].trim();
    const defaultValue = parts[1]?.trim();
    if (varName in variables) {
      const value = variables[varName];
      return String(value);
    }
    if (defaultValue !== void 0) {
      return defaultValue;
    }
    if (options.strict) {
      throw new Error(`Missing required variable: ${varName}`);
    }
    return match;
  });
}
function validateVariables(variables, definitions) {
  const errors = [];
  for (const def of definitions) {
    const value = variables[def.name];
    if (def.required && (value === void 0 || value === null)) {
      errors.push(`Missing required variable: ${def.name}`);
      continue;
    }
    if (value === void 0 || value === null) continue;
    switch (def.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`${def.name} must be a string`);
        } else if (def.validation) {
          if (def.validation.minLength && value.length < def.validation.minLength) {
            errors.push(`${def.name} must be at least ${def.validation.minLength} characters`);
          }
          if (def.validation.maxLength && value.length > def.validation.maxLength) {
            errors.push(`${def.name} must be at most ${def.validation.maxLength} characters`);
          }
          if (def.validation.pattern && !new RegExp(def.validation.pattern).test(value)) {
            errors.push(`${def.name} does not match required pattern`);
          }
        }
        break;
      case "number":
        if (typeof value !== "number") {
          errors.push(`${def.name} must be a number`);
        } else if (def.validation) {
          if (def.validation.min !== void 0 && value < def.validation.min) {
            errors.push(`${def.name} must be at least ${def.validation.min}`);
          }
          if (def.validation.max !== void 0 && value > def.validation.max) {
            errors.push(`${def.name} must be at most ${def.validation.max}`);
          }
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`${def.name} must be a boolean`);
        }
        break;
      case "array":
        if (!Array.isArray(value)) {
          errors.push(`${def.name} must be an array`);
        }
        break;
      case "object":
      case "json":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          errors.push(`${def.name} must be an object`);
        }
        break;
    }
    if (def.validation?.enum && !def.validation.enum.includes(value)) {
      errors.push(`${def.name} must be one of: ${def.validation.enum.join(", ")}`);
    }
  }
  return { valid: errors.length === 0, errors };
}
function incrementVersion(version, type = "patch") {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return "1.0.0";
  }
  switch (type) {
    case "major":
      return `${parts[0] + 1}.0.0`;
    case "minor":
      return `${parts[0]}.${parts[1] + 1}.0`;
    case "patch":
    default:
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
}

// src/prompts/prompt-manager.ts
import { EventEmitter as EventEmitter27 } from "eventemitter3";
import { randomUUID as randomUUID16 } from "crypto";
var InMemoryPromptStorage = class {
  templates = /* @__PURE__ */ new Map();
  versions = /* @__PURE__ */ new Map();
  executions = /* @__PURE__ */ new Map();
  experiments = /* @__PURE__ */ new Map();
  chains = /* @__PURE__ */ new Map();
  chainExecutions = /* @__PURE__ */ new Map();
  collections = /* @__PURE__ */ new Map();
  optimizations = /* @__PURE__ */ new Map();
  async saveTemplate(template) {
    this.templates.set(template.id, template);
  }
  async getTemplate(id) {
    return this.templates.get(id) || null;
  }
  async getTemplateBySlug(slug) {
    for (const template of this.templates.values()) {
      if (template.slug === slug) return template;
    }
    return null;
  }
  async listTemplates(options) {
    return Array.from(this.templates.values()).filter((t) => {
      if (options?.status && t.status !== options.status) return false;
      if (options?.type && t.type !== options.type) return false;
      if (options?.category && t.category !== options.category) return false;
      if (options?.tags && !options.tags.some((tag) => t.tags.includes(tag))) return false;
      return true;
    });
  }
  async deleteTemplate(id) {
    this.templates.delete(id);
  }
  async saveVersion(version) {
    this.versions.set(version.id, version);
  }
  async getVersion(id) {
    return this.versions.get(id) || null;
  }
  async listVersions(templateId) {
    return Array.from(this.versions.values()).filter((v) => v.templateId === templateId).sort((a, b) => b.createdAt - a.createdAt);
  }
  async saveExecution(execution) {
    this.executions.set(execution.id, execution);
  }
  async getExecution(id) {
    return this.executions.get(id) || null;
  }
  async listExecutions(templateId, options) {
    let results = Array.from(this.executions.values()).filter((e) => e.templateId === templateId).filter((e) => !options?.startTime || e.timestamp >= options.startTime).filter((e) => !options?.endTime || e.timestamp <= options.endTime).sort((a, b) => b.timestamp - a.timestamp);
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    return results;
  }
  async saveExperiment(experiment) {
    this.experiments.set(experiment.id, experiment);
  }
  async getExperiment(id) {
    return this.experiments.get(id) || null;
  }
  async listExperiments(status) {
    return Array.from(this.experiments.values()).filter((e) => {
      if (status && e.status !== status) return false;
      return true;
    });
  }
  async saveChain(chain) {
    this.chains.set(chain.id, chain);
  }
  async getChain(id) {
    return this.chains.get(id) || null;
  }
  async listChains() {
    return Array.from(this.chains.values());
  }
  async saveChainExecution(execution) {
    this.chainExecutions.set(execution.id, execution);
  }
  async getChainExecution(id) {
    return this.chainExecutions.get(id) || null;
  }
  async saveCollection(collection) {
    this.collections.set(collection.id, collection);
  }
  async getCollection(id) {
    return this.collections.get(id) || null;
  }
  async listCollections() {
    return Array.from(this.collections.values());
  }
  async saveOptimization(optimization) {
    this.optimizations.set(optimization.id, optimization);
  }
  async getOptimizations(templateId) {
    return Array.from(this.optimizations.values()).filter((o) => o.templateId === templateId);
  }
};
var PromptManager = class extends EventEmitter27 {
  config;
  storage;
  promptCache = /* @__PURE__ */ new Map();
  constructor(config = {}, storage) {
    super();
    this.config = PromptManagerConfigSchema.parse(config);
    this.storage = storage || new InMemoryPromptStorage();
  }
  // ===========================================================================
  // Template Management
  // ===========================================================================
  async createTemplate(input) {
    const slug = input.slug || this.generateSlug(input.name);
    const existing = await this.storage.getTemplateBySlug(slug);
    if (existing) {
      throw new Error(`Template with slug "${slug}" already exists`);
    }
    const extractedVars = parseTemplateVariables(input.content);
    const variables = input.variables || extractedVars.map((name) => ({
      name,
      type: "string",
      required: true
    }));
    const template = {
      id: randomUUID16(),
      name: input.name,
      slug,
      description: input.description,
      type: input.type,
      status: "draft",
      content: input.content,
      systemPrompt: input.systemPrompt,
      fewShotExamples: input.fewShotExamples,
      variables,
      recommendedModels: input.recommendedModels,
      maxTokens: input.maxTokens,
      temperature: input.temperature,
      topP: input.topP,
      tags: input.tags || [],
      category: input.category,
      author: input.author,
      version: "1.0.0",
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await this.storage.saveTemplate(template);
    await this.createVersion(template, "Initial version");
    this.emit("templateCreated", template);
    return template;
  }
  async updateTemplate(id, updates, changelog) {
    const template = await this.storage.getTemplate(id);
    if (!template) return null;
    const contentChanged = updates.content && updates.content !== template.content;
    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };
    if (contentChanged && this.config.autoVersionOnEdit) {
      updated.version = incrementVersion(template.version);
      await this.createVersion(updated, changelog || "Content updated");
    }
    await this.storage.saveTemplate(updated);
    this.emit("templateUpdated", updated);
    return updated;
  }
  async publishTemplate(id) {
    const template = await this.storage.getTemplate(id);
    if (!template) return null;
    template.status = "active";
    template.publishedAt = Date.now();
    template.updatedAt = Date.now();
    await this.storage.saveTemplate(template);
    this.emit("templatePublished", template);
    return template;
  }
  async deprecateTemplate(id) {
    const template = await this.storage.getTemplate(id);
    if (!template) return null;
    template.status = "deprecated";
    template.deprecatedAt = Date.now();
    template.updatedAt = Date.now();
    await this.storage.saveTemplate(template);
    this.emit("templateDeprecated", template);
    return template;
  }
  async deleteTemplate(id) {
    const template = await this.storage.getTemplate(id);
    if (!template) return false;
    await this.storage.deleteTemplate(id);
    this.emit("templateDeleted", id);
    return true;
  }
  async getTemplate(id) {
    return this.storage.getTemplate(id);
  }
  async getTemplateBySlug(slug) {
    return this.storage.getTemplateBySlug(slug);
  }
  async listTemplates(options) {
    return this.storage.listTemplates(options);
  }
  // ===========================================================================
  // Version Management
  // ===========================================================================
  async createVersion(template, changelog) {
    const version = {
      id: randomUUID16(),
      templateId: template.id,
      version: template.version,
      content: template.content,
      systemPrompt: template.systemPrompt,
      fewShotExamples: template.fewShotExamples,
      variables: template.variables,
      changelog,
      author: template.author,
      createdAt: Date.now(),
      usageCount: 0
    };
    await this.storage.saveVersion(version);
    this.emit("versionCreated", version);
    await this.cleanupOldVersions(template.id);
    return version;
  }
  async cleanupOldVersions(templateId) {
    const versions = await this.storage.listVersions(templateId);
    if (versions.length <= this.config.maxVersionsToKeep) return;
    const toDelete = versions.slice(this.config.maxVersionsToKeep);
  }
  async listVersions(templateId) {
    return this.storage.listVersions(templateId);
  }
  async getVersion(id) {
    return this.storage.getVersion(id);
  }
  async rollbackToVersion(templateId, versionId) {
    const version = await this.storage.getVersion(versionId);
    if (!version || version.templateId !== templateId) return null;
    return this.updateTemplate(templateId, {
      content: version.content,
      systemPrompt: version.systemPrompt,
      fewShotExamples: version.fewShotExamples,
      variables: version.variables
    }, `Rollback to version ${version.version}`);
  }
  // ===========================================================================
  // Prompt Rendering
  // ===========================================================================
  async render(templateIdOrSlug, variables, options = {}) {
    let template = await this.storage.getTemplate(templateIdOrSlug);
    if (!template) {
      template = await this.storage.getTemplateBySlug(templateIdOrSlug);
    }
    if (!template) {
      throw new Error(`Template not found: ${templateIdOrSlug}`);
    }
    if (this.config.validateVariablesOnRender) {
      const validation = validateVariables(variables, template.variables);
      if (!validation.valid) {
        if (this.config.strictVariableValidation || options.strict) {
          throw new Error(`Variable validation failed: ${validation.errors.join(", ")}`);
        }
      }
    }
    const cacheKey = `${template.id}:${JSON.stringify(variables)}`;
    if (this.config.cacheRenderedPrompts) {
      const cached = this.promptCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTLSeconds * 1e3) {
        return { rendered: cached.rendered, template };
      }
    }
    const rendered = renderTemplate(template.content, variables, { strict: options.strict });
    if (this.config.cacheRenderedPrompts) {
      this.promptCache.set(cacheKey, { rendered, timestamp: Date.now() });
    }
    template.usageCount = (template.usageCount || 0) + 1;
    template.updatedAt = Date.now();
    await this.storage.saveTemplate(template);
    this.emit("promptRendered", template.id, variables);
    return { rendered, template };
  }
  async renderWithSystem(templateIdOrSlug, variables, options = {}) {
    const { rendered, template } = await this.render(templateIdOrSlug, variables, options);
    let systemPrompt = template.systemPrompt;
    if (systemPrompt) {
      systemPrompt = renderTemplate(systemPrompt, variables, { strict: options.strict });
    }
    return {
      systemPrompt,
      userPrompt: rendered,
      template
    };
  }
  // ===========================================================================
  // Execution Tracking
  // ===========================================================================
  async trackExecution(input) {
    const execution = {
      id: randomUUID16(),
      templateId: input.templateId,
      version: input.version,
      timestamp: Date.now(),
      variables: input.variables,
      renderedPrompt: input.renderedPrompt,
      model: input.model,
      provider: input.provider,
      response: input.response,
      functionCalls: input.functionCalls,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      totalTokens: input.inputTokens + input.outputTokens,
      latencyMs: input.latencyMs,
      cost: input.cost,
      success: input.success,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
      userId: input.userId,
      sessionId: input.sessionId,
      experimentId: input.experimentId,
      variantId: input.variantId,
      flagged: false
    };
    await this.storage.saveExecution(execution);
    const template = await this.storage.getTemplate(input.templateId);
    if (template) {
      const executions = await this.storage.listExecutions(input.templateId, { limit: 100 });
      template.avgTokens = executions.reduce((sum, e) => sum + e.totalTokens, 0) / executions.length;
      template.avgLatencyMs = executions.reduce((sum, e) => sum + e.latencyMs, 0) / executions.length;
      template.successRate = executions.filter((e) => e.success).length / executions.length;
      await this.storage.saveTemplate(template);
    }
    if (input.experimentId && input.variantId) {
      await this.updateExperimentMetrics(input.experimentId, input.variantId, execution);
    }
    this.emit("promptExecuted", execution);
    return execution;
  }
  async rateExecution(executionId, rating, feedback) {
    const execution = await this.storage.getExecution(executionId);
    if (!execution) throw new Error("Execution not found");
    execution.rating = rating;
    execution.feedback = feedback;
    await this.storage.saveExecution(execution);
  }
  async flagExecution(executionId, reason) {
    const execution = await this.storage.getExecution(executionId);
    if (!execution) throw new Error("Execution not found");
    execution.flagged = true;
    execution.flagReason = reason;
    await this.storage.saveExecution(execution);
  }
  // ===========================================================================
  // A/B Testing
  // ===========================================================================
  async createExperiment(input) {
    const variants = input.variants.map((v) => ({
      id: randomUUID16(),
      name: v.name,
      description: v.description,
      templateId: v.templateId,
      version: v.version,
      weight: v.weight,
      impressions: 0,
      conversions: 0
    }));
    const experiment = {
      id: randomUUID16(),
      name: input.name,
      description: input.description,
      hypothesis: input.hypothesis,
      status: "draft",
      variants,
      controlVariantId: variants[input.controlVariantIndex || 0].id,
      sampleSize: input.sampleSize,
      confidenceLevel: input.confidenceLevel || this.config.defaultConfidenceLevel,
      minimumDetectableEffect: input.minimumDetectableEffect || 0.05,
      targetAudience: input.targetAudience,
      primaryMetric: input.primaryMetric,
      secondaryMetrics: input.secondaryMetrics,
      createdAt: Date.now(),
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd
    };
    await this.storage.saveExperiment(experiment);
    this.emit("experimentCreated", experiment);
    return experiment;
  }
  async startExperiment(id) {
    const experiment = await this.storage.getExperiment(id);
    if (!experiment) return null;
    experiment.status = "running";
    experiment.startedAt = Date.now();
    await this.storage.saveExperiment(experiment);
    this.emit("experimentStarted", experiment);
    return experiment;
  }
  async pauseExperiment(id) {
    const experiment = await this.storage.getExperiment(id);
    if (!experiment) return null;
    experiment.status = "paused";
    await this.storage.saveExperiment(experiment);
    return experiment;
  }
  async completeExperiment(id, winningVariantId, conclusionNotes) {
    const experiment = await this.storage.getExperiment(id);
    if (!experiment) return null;
    experiment.status = "completed";
    experiment.endedAt = Date.now();
    experiment.winningVariantId = winningVariantId;
    experiment.conclusionNotes = conclusionNotes;
    const result = await this.calculateExperimentResults(experiment);
    experiment.statisticalSignificance = result.pValue;
    await this.storage.saveExperiment(experiment);
    this.emit("experimentCompleted", experiment, result);
    return experiment;
  }
  async selectVariant(experimentId, userId) {
    const experiment = await this.storage.getExperiment(experimentId);
    if (!experiment || experiment.status !== "running") return null;
    if (experiment.targetAudience) {
      if (experiment.targetAudience.userIds && userId) {
        if (!experiment.targetAudience.userIds.includes(userId)) {
          return null;
        }
      }
      if (experiment.targetAudience.userPercentage) {
        const bucket = userId ? this.hashToBucket(userId) : Math.random() * 100;
        if (bucket > experiment.targetAudience.userPercentage) {
          return null;
        }
      }
    }
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;
    for (const variant of experiment.variants) {
      random -= variant.weight;
      if (random <= 0) {
        variant.impressions++;
        await this.storage.saveExperiment(experiment);
        this.emit("variantSelected", experimentId, variant.id, userId);
        return variant;
      }
    }
    return experiment.variants[0];
  }
  hashToBucket(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
  async updateExperimentMetrics(experimentId, variantId, execution) {
    const experiment = await this.storage.getExperiment(experimentId);
    if (!experiment) return;
    const variant = experiment.variants.find((v) => v.id === variantId);
    if (!variant) return;
    const executions = await this.storage.listExecutions(variant.templateId);
    const variantExecs = executions.filter((e) => e.variantId === variantId);
    if (variantExecs.length > 0) {
      variant.avgLatencyMs = variantExecs.reduce((sum, e) => sum + e.latencyMs, 0) / variantExecs.length;
      variant.avgTokens = variantExecs.reduce((sum, e) => sum + e.totalTokens, 0) / variantExecs.length;
      variant.avgCost = variantExecs.reduce((sum, e) => sum + e.cost, 0) / variantExecs.length;
      variant.successRate = variantExecs.filter((e) => e.success).length / variantExecs.length;
      variant.avgRating = variantExecs.filter((e) => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / (variantExecs.filter((e) => e.rating).length || 1);
    }
    await this.storage.saveExperiment(experiment);
  }
  async calculateExperimentResults(experiment) {
    const variantResults = await Promise.all(
      experiment.variants.map(async (variant) => {
        const executions = await this.storage.listExecutions(variant.templateId);
        const variantExecs = executions.filter((e) => e.variantId === variant.id);
        return {
          variantId: variant.id,
          impressions: variant.impressions,
          conversions: variant.conversions,
          conversionRate: variant.impressions > 0 ? variant.conversions / variant.impressions : 0,
          avgRating: variant.avgRating,
          avgLatencyMs: variant.avgLatencyMs || 0,
          avgTokens: variant.avgTokens || 0,
          avgCost: variant.avgCost || 0,
          successRate: variant.successRate || 0
        };
      })
    );
    const control = variantResults.find((v) => experiment.variants.find((ev) => ev.id === v.variantId)?.id === experiment.controlVariantId);
    const treatment = variantResults.find((v) => v.variantId !== experiment.controlVariantId);
    let pValue = 1;
    let effectSize = 0;
    let isSignificant = false;
    if (control && treatment && control.impressions > 0 && treatment.impressions > 0) {
      const getMetricValue = (r) => {
        switch (experiment.primaryMetric) {
          case "conversion":
            return r.conversionRate;
          case "rating":
            return r.avgRating || 0;
          case "latency":
            return -r.avgLatencyMs;
          // Lower is better
          case "cost":
            return -r.avgCost;
          // Lower is better
          case "tokens":
            return -r.avgTokens;
          // Lower is better
          case "success_rate":
            return r.successRate;
          default:
            return 0;
        }
      };
      const controlValue = getMetricValue(control);
      const treatmentValue = getMetricValue(treatment);
      effectSize = controlValue !== 0 ? (treatmentValue - controlValue) / Math.abs(controlValue) : 0;
      const totalSamples = control.impressions + treatment.impressions;
      pValue = Math.max(1e-3, Math.exp(-Math.abs(effectSize) * Math.sqrt(totalSamples) / 2));
      isSignificant = pValue < 1 - experiment.confidenceLevel;
    }
    const recommendedVariant = isSignificant && treatment && effectSize > 0 ? treatment.variantId : control?.variantId;
    return {
      experimentId: experiment.id,
      calculatedAt: Date.now(),
      variantResults,
      isSignificant,
      pValue,
      confidenceInterval: {
        lower: effectSize - 1.96 * Math.abs(effectSize) / 2,
        upper: effectSize + 1.96 * Math.abs(effectSize) / 2
      },
      effectSize,
      recommendedVariant,
      recommendation: isSignificant ? `Variant "${experiment.variants.find((v) => v.id === recommendedVariant)?.name}" shows statistically significant improvement.` : `No statistically significant difference detected. Consider running longer or increasing sample size.`
    };
  }
  // ===========================================================================
  // Prompt Chains
  // ===========================================================================
  async createChain(input) {
    const steps = input.steps.map((s, i) => ({
      id: randomUUID16(),
      name: s.name,
      templateId: s.templateId,
      order: i,
      inputMapping: s.inputMapping,
      outputKey: s.outputKey,
      parseOutput: s.parseOutput || "text",
      parseConfig: s.parseConfig,
      condition: s.condition,
      skipOnFailure: s.skipOnFailure || false,
      retryOnFailure: s.retryOnFailure || 0
    }));
    const chain = {
      id: randomUUID16(),
      name: input.name,
      description: input.description,
      status: "draft",
      steps,
      startStepId: steps[0]?.id || "",
      inputVariables: input.inputVariables,
      outputMapping: input.outputMapping || {},
      maxSteps: input.maxSteps || 10,
      timeoutMs: input.timeoutMs || 6e4,
      parallelExecution: false,
      tags: input.tags || [],
      author: input.author,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await this.storage.saveChain(chain);
    return chain;
  }
  async executeChain(chainId, input, executePrompt) {
    const chain = await this.storage.getChain(chainId);
    if (!chain) throw new Error("Chain not found");
    const execution = {
      id: randomUUID16(),
      chainId,
      timestamp: Date.now(),
      input,
      context: { ...input },
      stepExecutions: [],
      totalSteps: chain.steps.length,
      completedSteps: 0,
      totalTokens: 0,
      totalCost: 0,
      totalLatencyMs: 0,
      status: "running"
    };
    this.emit("chainExecutionStarted", execution);
    try {
      const sortedSteps = [...chain.steps].sort((a, b) => a.order - b.order);
      for (const step of sortedSteps) {
        if (execution.completedSteps >= chain.maxSteps) break;
        if (step.condition) {
          try {
            const conditionResult = this.evaluateCondition(step.condition, execution.context);
            if (!conditionResult) {
              execution.stepExecutions.push({
                stepId: step.id,
                templateId: step.templateId,
                startedAt: Date.now(),
                completedAt: Date.now(),
                status: "skipped",
                input: {}
              });
              continue;
            }
          } catch {
          }
        }
        const stepInput = {};
        for (const [varName, contextKey] of Object.entries(step.inputMapping)) {
          stepInput[varName] = execution.context[contextKey];
        }
        const stepExecution = {
          stepId: step.id,
          templateId: step.templateId,
          startedAt: Date.now(),
          status: "running",
          input: stepInput
        };
        execution.stepExecutions.push(stepExecution);
        try {
          const result = await executePrompt(step.templateId, stepInput);
          stepExecution.completedAt = Date.now();
          stepExecution.status = "completed";
          stepExecution.output = result.response;
          stepExecution.tokens = result.tokens;
          stepExecution.cost = result.cost;
          let parsedOutput = result.response;
          if (step.parseOutput === "json") {
            try {
              parsedOutput = JSON.parse(result.response);
            } catch {
            }
          } else if (step.parseOutput === "lines") {
            parsedOutput = result.response.split("\n").filter((l) => l.trim());
          } else if (step.parseOutput === "regex" && step.parseConfig?.regex) {
            const match = result.response.match(new RegExp(step.parseConfig.regex));
            parsedOutput = match ? match[1] || match[0] : result.response;
          }
          execution.context[step.outputKey] = parsedOutput;
          execution.completedSteps++;
          execution.totalTokens += result.tokens;
          execution.totalCost += result.cost;
          execution.totalLatencyMs += stepExecution.completedAt - stepExecution.startedAt;
          this.emit("chainStepCompleted", chainId, step.id);
        } catch (error) {
          stepExecution.completedAt = Date.now();
          stepExecution.status = "failed";
          stepExecution.error = error.message;
          if (!step.skipOnFailure) {
            execution.status = "failed";
            execution.error = `Step "${step.name}" failed: ${error.message}`;
            break;
          }
        }
      }
      if (execution.status !== "failed") {
        execution.status = "completed";
        execution.output = {};
        for (const [outputKey, contextKey] of Object.entries(chain.outputMapping)) {
          execution.output[outputKey] = execution.context[contextKey];
        }
      }
    } catch (error) {
      execution.status = "failed";
      execution.error = error.message;
      this.emit("chainExecutionFailed", execution, error);
    }
    await this.storage.saveChainExecution(execution);
    if (execution.status === "completed") {
      this.emit("chainExecutionCompleted", execution);
    }
    return execution;
  }
  evaluateCondition(condition, context) {
    try {
      const fn = new Function(...Object.keys(context), `return ${condition}`);
      return Boolean(fn(...Object.values(context)));
    } catch {
      return true;
    }
  }
  // ===========================================================================
  // Optimization
  // ===========================================================================
  async suggestOptimization(templateId, goal) {
    const template = await this.storage.getTemplate(templateId);
    if (!template) return null;
    const executions = await this.storage.listExecutions(templateId, { limit: 100 });
    if (executions.length < 10) return null;
    const avgTokens = executions.reduce((sum, e) => sum + e.totalTokens, 0) / executions.length;
    const avgLatency = executions.reduce((sum, e) => sum + e.latencyMs, 0) / executions.length;
    const avgCost = executions.reduce((sum, e) => sum + e.cost, 0) / executions.length;
    const successRate = executions.filter((e) => e.success).length / executions.length;
    const avgRating = executions.filter((e) => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / (executions.filter((e) => e.rating).length || 1);
    let optimizedContent = template.content;
    const techniques = [];
    if (goal === "reduce_tokens" || goal === "reduce_cost") {
      optimizedContent = optimizedContent.replace(/\s+/g, " ").trim();
      techniques.push("compression");
      const lines = optimizedContent.split("\n");
      const uniqueLines = [...new Set(lines)];
      if (uniqueLines.length < lines.length) {
        optimizedContent = uniqueLines.join("\n");
        techniques.push("deduplication");
      }
    }
    const optimization = {
      id: randomUUID16(),
      templateId,
      timestamp: Date.now(),
      goal,
      originalContent: template.content,
      originalTokens: avgTokens,
      originalMetrics: {
        avgLatencyMs: avgLatency,
        avgCost,
        successRate,
        avgRating
      },
      optimizedContent,
      optimizedTokens: Math.round(avgTokens * 0.9),
      // Estimate
      estimatedImprovement: {
        tokenReduction: Math.round(avgTokens * 0.1),
        costReduction: avgCost * 0.1
      },
      techniques,
      validationStatus: "pending",
      applied: false
    };
    await this.storage.saveOptimization(optimization);
    this.emit("optimizationSuggested", optimization);
    return optimization;
  }
  async applyOptimization(optimizationId) {
    const optimizations = await this.storage.getOptimizations("");
    const optimization = optimizations.find((o) => o.id === optimizationId);
    if (!optimization) return false;
    await this.updateTemplate(optimization.templateId, {
      content: optimization.optimizedContent
    }, "Applied optimization");
    optimization.applied = true;
    optimization.appliedAt = Date.now();
    await this.storage.saveOptimization(optimization);
    this.emit("optimizationApplied", optimization);
    return true;
  }
  // ===========================================================================
  // Utilities
  // ===========================================================================
  generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
};
var defaultManager9 = null;
function getPromptManager() {
  if (!defaultManager9) {
    defaultManager9 = new PromptManager();
  }
  return defaultManager9;
}
function createPromptManager(config, storage) {
  return new PromptManager(config, storage);
}

// src/evaluation/types.ts
import { z as z26 } from "zod";
var ModelProviderSchema = z26.enum([
  "openai",
  "anthropic",
  "google",
  "cohere",
  "mistral",
  "azure",
  "aws_bedrock",
  "groq",
  "together",
  "perplexity",
  "replicate",
  "huggingface",
  "local",
  "custom"
]);
var ModelCapabilitySchema2 = z26.enum([
  "text_generation",
  "chat",
  "code_generation",
  "code_completion",
  "vision",
  "audio",
  "embedding",
  "function_calling",
  "structured_output",
  "reasoning",
  "multilingual"
]);
var ModelInfoSchema = z26.object({
  id: z26.string(),
  provider: ModelProviderSchema,
  name: z26.string(),
  displayName: z26.string().optional(),
  version: z26.string().optional(),
  // Capabilities
  capabilities: z26.array(ModelCapabilitySchema2),
  // Specifications
  contextWindow: z26.number(),
  maxOutputTokens: z26.number().optional(),
  trainingCutoff: z26.string().optional(),
  // Pricing
  inputPricePerMillion: z26.number(),
  outputPricePerMillion: z26.number(),
  // Performance characteristics
  avgLatencyMs: z26.number().optional(),
  tokensPerSecond: z26.number().optional(),
  // Status
  isAvailable: z26.boolean().default(true),
  deprecatedAt: z26.number().optional(),
  // Metadata
  tags: z26.array(z26.string()).default([]),
  notes: z26.string().optional()
});
var EvalTaskTypeSchema = z26.enum([
  "text_completion",
  "question_answering",
  "summarization",
  "translation",
  "code_generation",
  "code_review",
  "sentiment_analysis",
  "classification",
  "extraction",
  "reasoning",
  "math",
  "creative_writing",
  "instruction_following",
  "conversation",
  "custom"
]);
var EvalDifficultySchema = z26.enum([
  "easy",
  "medium",
  "hard",
  "expert"
]);
var EvalTaskSchema = z26.object({
  id: z26.string(),
  type: EvalTaskTypeSchema,
  name: z26.string(),
  description: z26.string().optional(),
  difficulty: EvalDifficultySchema.default("medium"),
  // Input
  prompt: z26.string(),
  systemPrompt: z26.string().optional(),
  context: z26.string().optional(),
  // Expected output
  expectedOutput: z26.string().optional(),
  acceptableOutputs: z26.array(z26.string()).optional(),
  evaluationCriteria: z26.array(z26.string()).optional(),
  // Evaluation config
  metrics: z26.array(z26.string()).default(["accuracy", "relevance"]),
  passingScore: z26.number().default(0.7),
  // Constraints
  maxTokens: z26.number().optional(),
  timeoutMs: z26.number().optional(),
  // Metadata
  tags: z26.array(z26.string()).default([]),
  category: z26.string().optional(),
  weight: z26.number().default(1).describe("Weight in benchmark scoring"),
  createdAt: z26.number()
});
var MetricTypeSchema3 = z26.enum([
  // Quality metrics
  "accuracy",
  "relevance",
  "coherence",
  "fluency",
  "completeness",
  "correctness",
  "creativity",
  // Code metrics
  "code_correctness",
  "code_quality",
  "test_pass_rate",
  // Similarity metrics
  "exact_match",
  "fuzzy_match",
  "semantic_similarity",
  "bleu",
  "rouge",
  // Performance metrics
  "latency",
  "throughput",
  "tokens_per_second",
  // Cost metrics
  "cost_per_request",
  "cost_per_token",
  // Safety metrics
  "toxicity",
  "bias",
  "hallucination_rate",
  // Custom
  "custom"
]);
var MetricResultSchema = z26.object({
  metric: MetricTypeSchema3,
  score: z26.number().min(0).max(1),
  rawValue: z26.unknown().optional(),
  details: z26.string().optional(),
  confidence: z26.number().min(0).max(1).optional()
});
var EvalResultSchema = z26.object({
  id: z26.string(),
  taskId: z26.string(),
  modelId: z26.string(),
  timestamp: z26.number(),
  // Input/Output
  prompt: z26.string(),
  response: z26.string(),
  expectedOutput: z26.string().optional(),
  // Metrics
  metrics: z26.array(MetricResultSchema),
  overallScore: z26.number().min(0).max(1),
  passed: z26.boolean(),
  // Performance
  inputTokens: z26.number(),
  outputTokens: z26.number(),
  latencyMs: z26.number(),
  cost: z26.number(),
  // Evaluation metadata
  evaluatorModel: z26.string().optional(),
  humanEvaluated: z26.boolean().default(false),
  humanScore: z26.number().optional(),
  humanNotes: z26.string().optional(),
  // Error handling
  error: z26.string().optional(),
  timedOut: z26.boolean().default(false)
});
var BenchmarkStatusSchema = z26.enum([
  "draft",
  "ready",
  "running",
  "completed",
  "failed"
]);
var BenchmarkConfigSchema = z26.object({
  // Evaluation settings
  runsPerTask: z26.number().default(1),
  temperature: z26.number().default(0),
  maxConcurrent: z26.number().default(5),
  timeoutMs: z26.number().default(6e4),
  // Model selection
  useEvaluatorModel: z26.boolean().default(true),
  evaluatorModelId: z26.string().optional(),
  // Metrics
  primaryMetric: MetricTypeSchema3.default("accuracy"),
  includePerformanceMetrics: z26.boolean().default(true),
  includeCostMetrics: z26.boolean().default(true),
  // Sampling
  sampleSize: z26.number().optional().describe("Subset of tasks to run"),
  randomSeed: z26.number().optional()
});
var BenchmarkSchema = z26.object({
  id: z26.string(),
  name: z26.string(),
  description: z26.string().optional(),
  status: BenchmarkStatusSchema,
  // Tasks
  taskIds: z26.array(z26.string()),
  taskCount: z26.number(),
  // Models to evaluate
  modelIds: z26.array(z26.string()),
  // Configuration
  config: BenchmarkConfigSchema,
  // Progress
  completedTasks: z26.number().default(0),
  totalTasks: z26.number().default(0),
  startedAt: z26.number().optional(),
  completedAt: z26.number().optional(),
  // Metadata
  tags: z26.array(z26.string()).default([]),
  createdAt: z26.number(),
  createdBy: z26.string().optional()
});
var BenchmarkResultSchema = z26.object({
  benchmarkId: z26.string(),
  modelId: z26.string(),
  calculatedAt: z26.number(),
  // Aggregate scores
  overallScore: z26.number(),
  passRate: z26.number(),
  // Per-metric scores
  metricScores: z26.record(MetricTypeSchema3, z26.number()),
  // Per-task-type scores
  taskTypeScores: z26.record(EvalTaskTypeSchema, z26.number()),
  // Per-difficulty scores
  difficultyScores: z26.record(EvalDifficultySchema, z26.number()),
  // Performance
  avgLatencyMs: z26.number(),
  avgTokensPerSecond: z26.number(),
  totalTokens: z26.number(),
  totalCost: z26.number(),
  // Individual results
  resultIds: z26.array(z26.string()),
  passedCount: z26.number(),
  failedCount: z26.number(),
  errorCount: z26.number()
});
var ModelRankingSchema = z26.object({
  modelId: z26.string(),
  rank: z26.number(),
  score: z26.number(),
  change: z26.number().optional().describe("Change in rank from previous benchmark")
});
var ComparisonResultSchema = z26.object({
  id: z26.string(),
  benchmarkId: z26.string(),
  timestamp: z26.number(),
  // Rankings
  overallRankings: z26.array(ModelRankingSchema),
  rankingsByMetric: z26.record(MetricTypeSchema3, z26.array(ModelRankingSchema)),
  rankingsByTaskType: z26.record(EvalTaskTypeSchema, z26.array(ModelRankingSchema)),
  // Best models
  bestOverall: z26.string(),
  bestByCategory: z26.record(z26.string(), z26.string()),
  // Trade-offs
  bestQualityPrice: z26.string().optional().describe("Best quality/price ratio"),
  bestLatency: z26.string().optional(),
  bestForProduction: z26.string().optional(),
  // Statistical analysis
  significantDifferences: z26.array(z26.object({
    model1: z26.string(),
    model2: z26.string(),
    metric: MetricTypeSchema3,
    pValue: z26.number(),
    difference: z26.number()
  }))
});
var SelectionCriteriaSchema = z26.object({
  // Required capabilities
  requiredCapabilities: z26.array(ModelCapabilitySchema2).optional(),
  // Task type
  taskType: EvalTaskTypeSchema.optional(),
  // Quality thresholds
  minOverallScore: z26.number().min(0).max(1).optional(),
  minMetricScores: z26.record(MetricTypeSchema3, z26.number()).optional(),
  // Performance constraints
  maxLatencyMs: z26.number().optional(),
  minTokensPerSecond: z26.number().optional(),
  // Cost constraints
  maxCostPerRequest: z26.number().optional(),
  maxCostPer1kTokens: z26.number().optional(),
  // Preferences
  preferredProviders: z26.array(ModelProviderSchema).optional(),
  excludedProviders: z26.array(ModelProviderSchema).optional(),
  excludedModels: z26.array(z26.string()).optional(),
  // Optimization target
  optimizeFor: z26.enum(["quality", "cost", "latency", "balanced"]).default("balanced")
});
var ModelRecommendationSchema = z26.object({
  modelId: z26.string(),
  score: z26.number(),
  rank: z26.number(),
  matchScore: z26.number().describe("How well it matches criteria"),
  // Why recommended
  strengths: z26.array(z26.string()),
  weaknesses: z26.array(z26.string()),
  // Trade-offs
  qualityScore: z26.number(),
  costScore: z26.number(),
  latencyScore: z26.number(),
  // Estimated metrics
  estimatedLatencyMs: z26.number().optional(),
  estimatedCostPerRequest: z26.number().optional(),
  estimatedAccuracy: z26.number().optional(),
  // Confidence
  confidence: z26.number().min(0).max(1),
  dataPoints: z26.number()
});
var DatasetSchema = z26.object({
  id: z26.string(),
  name: z26.string(),
  description: z26.string().optional(),
  // Content
  taskType: EvalTaskTypeSchema,
  tasks: z26.array(EvalTaskSchema),
  taskCount: z26.number(),
  // Metadata
  source: z26.string().optional(),
  version: z26.string().optional(),
  tags: z26.array(z26.string()).default([]),
  language: z26.string().default("en"),
  // Quality
  validated: z26.boolean().default(false),
  validatedBy: z26.string().optional(),
  validatedAt: z26.number().optional(),
  // Stats
  avgDifficulty: z26.number().optional(),
  difficultyDistribution: z26.record(EvalDifficultySchema, z26.number()).optional(),
  createdAt: z26.number(),
  updatedAt: z26.number()
});
var ModelEvaluatorConfigSchema = z26.object({
  // General
  enabled: z26.boolean().default(true),
  // Default evaluator model
  defaultEvaluatorModel: z26.string().default("gpt-4o"),
  // Concurrency
  maxConcurrentEvals: z26.number().default(10),
  maxConcurrentBenchmarks: z26.number().default(3),
  // Timeouts
  defaultTimeoutMs: z26.number().default(6e4),
  defaultTaskTimeoutMs: z26.number().default(3e4),
  // Caching
  cacheResults: z26.boolean().default(true),
  cacheExpirationHours: z26.number().default(24),
  // Auto-evaluation
  autoEvaluateNewModels: z26.boolean().default(false),
  autoEvaluationDatasetId: z26.string().optional(),
  // Thresholds
  defaultPassingScore: z26.number().default(0.7),
  significanceLevel: z26.number().default(0.05),
  // Cost limits
  maxCostPerBenchmark: z26.number().optional(),
  maxCostPerDay: z26.number().optional(),
  // Retention
  resultRetentionDays: z26.number().default(90)
});
var EVALUATION_PROMPTS = {
  accuracy: `Evaluate the accuracy of the following response compared to the expected output.

Expected: {{expected}}
Actual: {{actual}}

Rate the accuracy on a scale of 0 to 1, where:
- 0: Completely incorrect or irrelevant
- 0.5: Partially correct with significant errors
- 1: Fully correct and complete

Respond with just a number between 0 and 1.`,
  relevance: `Evaluate how relevant the response is to the given prompt.

Prompt: {{prompt}}
Response: {{response}}

Rate the relevance on a scale of 0 to 1, where:
- 0: Completely irrelevant
- 0.5: Somewhat relevant but off-topic in parts
- 1: Highly relevant and on-topic

Respond with just a number between 0 and 1.`,
  coherence: `Evaluate the coherence and logical flow of the following text.

Text: {{text}}

Rate the coherence on a scale of 0 to 1, where:
- 0: Incoherent, illogical, or contradictory
- 0.5: Somewhat coherent but with logical gaps
- 1: Highly coherent with clear logical flow

Respond with just a number between 0 and 1.`,
  fluency: `Evaluate the fluency and readability of the following text.

Text: {{text}}

Rate the fluency on a scale of 0 to 1, where:
- 0: Difficult to read, poor grammar/syntax
- 0.5: Readable but with some awkward phrasing
- 1: Excellent fluency, natural and easy to read

Respond with just a number between 0 and 1.`,
  code_correctness: `Evaluate the correctness of the following code solution.

Problem: {{problem}}
Code: {{code}}
Expected behavior: {{expected}}

Rate the correctness on a scale of 0 to 1, where:
- 0: Does not compile/run or produces wrong output
- 0.5: Partially works but has bugs
- 1: Fully correct and handles edge cases

Respond with just a number between 0 and 1.`
};
function calculateOverallScore(metrics, weights) {
  if (metrics.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const metric of metrics) {
    const weight = weights?.[metric.metric] || 1;
    weightedSum += metric.score * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
function calculatePassRate(results) {
  if (results.length === 0) return 0;
  return results.filter((r) => r.passed).length / results.length;
}
function compareModels(results, metric) {
  const scores = results.map((r) => ({
    modelId: r.modelId,
    score: r.metricScores[metric] || r.overallScore
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores.map((s, i) => ({
    modelId: s.modelId,
    rank: i + 1,
    score: s.score
  }));
}
function calculateStatisticalSignificance(scores1, scores2) {
  if (scores1.length < 2 || scores2.length < 2) {
    return { significant: false, pValue: 1 };
  }
  const mean1 = scores1.reduce((a, b) => a + b, 0) / scores1.length;
  const mean2 = scores2.reduce((a, b) => a + b, 0) / scores2.length;
  const variance1 = scores1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (scores1.length - 1);
  const variance2 = scores2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (scores2.length - 1);
  const pooledStdErr = Math.sqrt(variance1 / scores1.length + variance2 / scores2.length);
  if (pooledStdErr === 0) {
    return { significant: false, pValue: 1 };
  }
  const t = (mean1 - mean2) / pooledStdErr;
  const df = scores1.length + scores2.length - 2;
  const pValue = Math.exp(-Math.abs(t) * Math.sqrt(df) / 2);
  return {
    significant: pValue < 0.05,
    pValue
  };
}

// src/evaluation/model-evaluator.ts
import { EventEmitter as EventEmitter28 } from "eventemitter3";
import { randomUUID as randomUUID17 } from "crypto";
var InMemoryModelEvaluatorStorage = class {
  models = /* @__PURE__ */ new Map();
  tasks = /* @__PURE__ */ new Map();
  results = /* @__PURE__ */ new Map();
  benchmarks = /* @__PURE__ */ new Map();
  benchmarkResults = /* @__PURE__ */ new Map();
  comparisons = /* @__PURE__ */ new Map();
  datasets = /* @__PURE__ */ new Map();
  async saveModel(model) {
    this.models.set(model.id, model);
  }
  async getModel(id) {
    return this.models.get(id) || null;
  }
  async listModels(filters) {
    return Array.from(this.models.values()).filter((m) => {
      if (filters?.provider && m.provider !== filters.provider) return false;
      if (filters?.capabilities && !filters.capabilities.every((c) => m.capabilities.includes(c))) return false;
      if (filters?.available !== void 0 && m.isAvailable !== filters.available) return false;
      return true;
    });
  }
  async saveTask(task) {
    this.tasks.set(task.id, task);
  }
  async getTask(id) {
    return this.tasks.get(id) || null;
  }
  async listTasks(filters) {
    return Array.from(this.tasks.values()).filter((t) => {
      if (filters?.type && t.type !== filters.type) return false;
      if (filters?.difficulty && t.difficulty !== filters.difficulty) return false;
      if (filters?.category && t.category !== filters.category) return false;
      return true;
    });
  }
  async saveResult(result) {
    this.results.set(result.id, result);
  }
  async getResult(id) {
    return this.results.get(id) || null;
  }
  async listResults(filters) {
    return Array.from(this.results.values()).filter((r) => {
      if (filters.taskId && r.taskId !== filters.taskId) return false;
      if (filters.modelId && r.modelId !== filters.modelId) return false;
      if (filters.startTime && r.timestamp < filters.startTime) return false;
      if (filters.endTime && r.timestamp > filters.endTime) return false;
      return true;
    });
  }
  async saveBenchmark(benchmark) {
    this.benchmarks.set(benchmark.id, benchmark);
  }
  async getBenchmark(id) {
    return this.benchmarks.get(id) || null;
  }
  async listBenchmarks(status) {
    return Array.from(this.benchmarks.values()).filter((b) => {
      if (status && b.status !== status) return false;
      return true;
    });
  }
  async saveBenchmarkResult(result) {
    const existing = this.benchmarkResults.get(result.benchmarkId) || [];
    const index = existing.findIndex((r) => r.modelId === result.modelId);
    if (index >= 0) {
      existing[index] = result;
    } else {
      existing.push(result);
    }
    this.benchmarkResults.set(result.benchmarkId, existing);
  }
  async getBenchmarkResults(benchmarkId) {
    return this.benchmarkResults.get(benchmarkId) || [];
  }
  async saveComparison(comparison) {
    this.comparisons.set(comparison.id, comparison);
  }
  async getComparison(id) {
    return this.comparisons.get(id) || null;
  }
  async saveDataset(dataset) {
    this.datasets.set(dataset.id, dataset);
  }
  async getDataset(id) {
    return this.datasets.get(id) || null;
  }
  async listDatasets() {
    return Array.from(this.datasets.values());
  }
};
var ModelEvaluator = class extends EventEmitter28 {
  config;
  storage;
  runningBenchmarks = /* @__PURE__ */ new Set();
  constructor(config = {}, storage) {
    super();
    this.config = ModelEvaluatorConfigSchema.parse(config);
    this.storage = storage || new InMemoryModelEvaluatorStorage();
  }
  // ===========================================================================
  // Model Management
  // ===========================================================================
  async registerModel(input) {
    const model = {
      ...input,
      id: randomUUID17()
    };
    await this.storage.saveModel(model);
    this.emit("modelRegistered", model);
    return model;
  }
  async updateModel(id, updates) {
    const model = await this.storage.getModel(id);
    if (!model) return null;
    const updated = { ...model, ...updates };
    await this.storage.saveModel(updated);
    this.emit("modelUpdated", updated);
    return updated;
  }
  async deprecateModel(id) {
    const model = await this.storage.getModel(id);
    if (!model) return;
    model.isAvailable = false;
    model.deprecatedAt = Date.now();
    await this.storage.saveModel(model);
    this.emit("modelDeprecated", id);
  }
  async getModel(id) {
    return this.storage.getModel(id);
  }
  async listModels(filters) {
    return this.storage.listModels(filters);
  }
  // ===========================================================================
  // Task Management
  // ===========================================================================
  async createTask(input) {
    const task = {
      ...input,
      id: randomUUID17(),
      createdAt: Date.now()
    };
    await this.storage.saveTask(task);
    this.emit("taskCreated", task);
    return task;
  }
  async updateTask(id, updates) {
    const task = await this.storage.getTask(id);
    if (!task) return null;
    const updated = { ...task, ...updates };
    await this.storage.saveTask(updated);
    this.emit("taskUpdated", updated);
    return updated;
  }
  async getTask(id) {
    return this.storage.getTask(id);
  }
  async listTasks(filters) {
    return this.storage.listTasks(filters);
  }
  // ===========================================================================
  // Single Evaluation
  // ===========================================================================
  async evaluate(taskId, modelId, executeModel, options) {
    const task = await this.storage.getTask(taskId);
    if (!task) throw new Error("Task not found");
    const model = await this.storage.getModel(modelId);
    if (!model) throw new Error("Model not found");
    this.emit("evaluationStarted", taskId, modelId);
    let response = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let latencyMs = 0;
    let cost = 0;
    let error;
    let timedOut = false;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), task.timeoutMs || this.config.defaultTaskTimeoutMs);
      });
      const result2 = await Promise.race([
        executeModel(task.prompt, task.systemPrompt),
        timeoutPromise
      ]);
      response = result2.response;
      inputTokens = result2.inputTokens;
      outputTokens = result2.outputTokens;
      latencyMs = result2.latencyMs;
      cost = result2.cost;
    } catch (e) {
      error = e.message;
      if (error === "Timeout") {
        timedOut = true;
      }
    }
    const metrics = [];
    if (!error && response) {
      for (const metricName of task.metrics) {
        const metric = metricName;
        const score = await this.calculateMetric(
          metric,
          task,
          response,
          options?.evaluatorExecute
        );
        metrics.push(score);
      }
    }
    const overallScore = calculateOverallScore(metrics);
    const passed = overallScore >= task.passingScore;
    const result = {
      id: randomUUID17(),
      taskId,
      modelId,
      timestamp: Date.now(),
      prompt: task.prompt,
      response,
      expectedOutput: task.expectedOutput,
      metrics,
      overallScore,
      passed,
      inputTokens,
      outputTokens,
      latencyMs,
      cost,
      evaluatorModel: this.config.defaultEvaluatorModel,
      humanEvaluated: false,
      error,
      timedOut
    };
    await this.storage.saveResult(result);
    this.emit("evaluationCompleted", result);
    return result;
  }
  async calculateMetric(metric, task, response, evaluatorExecute) {
    switch (metric) {
      case "exact_match":
        return {
          metric,
          score: task.expectedOutput === response ? 1 : 0
        };
      case "fuzzy_match":
        return {
          metric,
          score: this.fuzzyMatch(task.expectedOutput || "", response)
        };
      case "latency":
        return {
          metric,
          score: 1
          // Will be calculated based on actual latency
        };
      case "accuracy":
      case "relevance":
      case "coherence":
      case "fluency":
        if (evaluatorExecute) {
          return this.llmEvaluate(metric, task, response, evaluatorExecute);
        }
        return { metric, score: 0.5, details: "No evaluator available" };
      default:
        return { metric, score: 0.5, details: "Metric not implemented" };
    }
  }
  fuzzyMatch(expected, actual) {
    const expectedLower = expected.toLowerCase().trim();
    const actualLower = actual.toLowerCase().trim();
    if (expectedLower === actualLower) return 1;
    if (actualLower.includes(expectedLower) || expectedLower.includes(actualLower)) return 0.8;
    const expectedWords = new Set(expectedLower.split(/\s+/));
    const actualWords = new Set(actualLower.split(/\s+/));
    const intersection = new Set([...expectedWords].filter((w) => actualWords.has(w)));
    return intersection.size / Math.max(expectedWords.size, actualWords.size);
  }
  async llmEvaluate(metric, task, response, evaluatorExecute) {
    const promptTemplate = EVALUATION_PROMPTS[metric];
    if (!promptTemplate) {
      return { metric, score: 0.5, details: "No evaluation prompt for metric" };
    }
    const evalPrompt = promptTemplate.replace("{{expected}}", task.expectedOutput || "").replace("{{actual}}", response).replace("{{prompt}}", task.prompt).replace("{{response}}", response).replace("{{text}}", response);
    try {
      const result = await evaluatorExecute(evalPrompt);
      const score = parseFloat(result.trim());
      if (isNaN(score) || score < 0 || score > 1) {
        return { metric, score: 0.5, details: "Invalid score from evaluator" };
      }
      return { metric, score };
    } catch (e) {
      return { metric, score: 0.5, details: `Evaluation failed: ${e.message}` };
    }
  }
  // ===========================================================================
  // Benchmarks
  // ===========================================================================
  async createBenchmark(input) {
    const benchmark = {
      id: randomUUID17(),
      name: input.name,
      description: input.description,
      status: "draft",
      taskIds: input.taskIds,
      taskCount: input.taskIds.length,
      modelIds: input.modelIds,
      config: {
        runsPerTask: 1,
        temperature: 0,
        maxConcurrent: 5,
        timeoutMs: 6e4,
        useEvaluatorModel: true,
        primaryMetric: "accuracy",
        includePerformanceMetrics: true,
        includeCostMetrics: true,
        ...input.config
      },
      completedTasks: 0,
      totalTasks: input.taskIds.length * input.modelIds.length * (input.config?.runsPerTask || 1),
      tags: input.tags || [],
      createdAt: Date.now(),
      createdBy: input.createdBy
    };
    await this.storage.saveBenchmark(benchmark);
    this.emit("benchmarkCreated", benchmark);
    return benchmark;
  }
  async runBenchmark(benchmarkId, executeModel, options) {
    const benchmark = await this.storage.getBenchmark(benchmarkId);
    if (!benchmark) throw new Error("Benchmark not found");
    if (this.runningBenchmarks.has(benchmarkId)) {
      throw new Error("Benchmark is already running");
    }
    this.runningBenchmarks.add(benchmarkId);
    benchmark.status = "running";
    benchmark.startedAt = Date.now();
    await this.storage.saveBenchmark(benchmark);
    this.emit("benchmarkStarted", benchmark);
    const results = /* @__PURE__ */ new Map();
    try {
      for (const modelId of benchmark.modelIds) {
        results.set(modelId, []);
      }
      let completed = 0;
      const tasks = await Promise.all(benchmark.taskIds.map((id) => this.storage.getTask(id)));
      const validTasks = tasks.filter((t) => t !== null);
      for (const task of validTasks) {
        for (const modelId of benchmark.modelIds) {
          for (let run = 0; run < benchmark.config.runsPerTask; run++) {
            try {
              const result = await this.evaluate(
                task.id,
                modelId,
                (prompt, systemPrompt) => executeModel(modelId, prompt, systemPrompt),
                { evaluatorExecute: options?.evaluatorExecute }
              );
              results.get(modelId).push(result);
            } catch (e) {
              const failedResult = {
                id: randomUUID17(),
                taskId: task.id,
                modelId,
                timestamp: Date.now(),
                prompt: task.prompt,
                response: "",
                metrics: [],
                overallScore: 0,
                passed: false,
                inputTokens: 0,
                outputTokens: 0,
                latencyMs: 0,
                cost: 0,
                error: e.message,
                timedOut: false,
                humanEvaluated: false
              };
              results.get(modelId).push(failedResult);
            }
            completed++;
            benchmark.completedTasks = completed;
            await this.storage.saveBenchmark(benchmark);
            this.emit("benchmarkProgress", benchmarkId, completed, benchmark.totalTasks);
            options?.onProgress?.(completed, benchmark.totalTasks);
          }
        }
      }
      const benchmarkResults = [];
      for (const [modelId, modelResults] of results) {
        const benchmarkResult = this.calculateBenchmarkResult(benchmarkId, modelId, modelResults);
        await this.storage.saveBenchmarkResult(benchmarkResult);
        benchmarkResults.push(benchmarkResult);
      }
      benchmark.status = "completed";
      benchmark.completedAt = Date.now();
      await this.storage.saveBenchmark(benchmark);
      this.emit("benchmarkCompleted", benchmark, benchmarkResults);
      return benchmarkResults;
    } catch (e) {
      benchmark.status = "failed";
      await this.storage.saveBenchmark(benchmark);
      this.emit("benchmarkFailed", benchmark, e);
      throw e;
    } finally {
      this.runningBenchmarks.delete(benchmarkId);
    }
  }
  calculateBenchmarkResult(benchmarkId, modelId, results) {
    const passedResults = results.filter((r) => r.passed);
    const errorResults = results.filter((r) => r.error);
    const metricScores = {};
    const metricCounts = {};
    for (const result of results) {
      for (const metric of result.metrics) {
        metricScores[metric.metric] = (metricScores[metric.metric] || 0) + metric.score;
        metricCounts[metric.metric] = (metricCounts[metric.metric] || 0) + 1;
      }
    }
    for (const metric of Object.keys(metricScores)) {
      metricScores[metric] = metricScores[metric] / (metricCounts[metric] || 1);
    }
    const taskTypeScores = {};
    const difficultyScores = {};
    const validResults = results.filter((r) => !r.error);
    const avgLatencyMs = validResults.length > 0 ? validResults.reduce((sum, r) => sum + r.latencyMs, 0) / validResults.length : 0;
    const totalTokens = results.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    const totalLatency = validResults.reduce((sum, r) => sum + r.latencyMs, 0);
    const avgTokensPerSecond = totalLatency > 0 ? totalTokens / totalLatency * 1e3 : 0;
    return {
      benchmarkId,
      modelId,
      calculatedAt: Date.now(),
      overallScore: results.length > 0 ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length : 0,
      passRate: calculatePassRate(results),
      metricScores,
      taskTypeScores,
      difficultyScores,
      avgLatencyMs,
      avgTokensPerSecond,
      totalTokens,
      totalCost,
      resultIds: results.map((r) => r.id),
      passedCount: passedResults.length,
      failedCount: results.length - passedResults.length - errorResults.length,
      errorCount: errorResults.length
    };
  }
  async getBenchmark(id) {
    return this.storage.getBenchmark(id);
  }
  async listBenchmarks(status) {
    return this.storage.listBenchmarks(status);
  }
  async getBenchmarkResults(benchmarkId) {
    return this.storage.getBenchmarkResults(benchmarkId);
  }
  // ===========================================================================
  // Model Comparison
  // ===========================================================================
  async compareModels(benchmarkId) {
    const benchmark = await this.storage.getBenchmark(benchmarkId);
    if (!benchmark) throw new Error("Benchmark not found");
    const results = await this.storage.getBenchmarkResults(benchmarkId);
    if (results.length === 0) throw new Error("No benchmark results found");
    const overallRankings = compareModels(results, benchmark.config.primaryMetric);
    const rankingsByMetric = {};
    const metrics = Object.keys(results[0]?.metricScores || {});
    for (const metric of metrics) {
      rankingsByMetric[metric] = compareModels(results, metric);
    }
    const rankingsByTaskType = {};
    const bestOverall = overallRankings[0]?.modelId || "";
    const qualityPriceScores = results.map((r) => ({
      modelId: r.modelId,
      score: r.overallScore / (r.totalCost + 1e-3)
      // Avoid division by zero
    }));
    qualityPriceScores.sort((a, b) => b.score - a.score);
    const bestQualityPrice = qualityPriceScores[0]?.modelId;
    const latencyScores = [...results].sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
    const bestLatency = latencyScores[0]?.modelId;
    const significantDifferences = [];
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const allResults = await this.storage.listResults({});
        const scores1 = allResults.filter((r) => r.modelId === results[i].modelId).map((r) => r.overallScore);
        const scores2 = allResults.filter((r) => r.modelId === results[j].modelId).map((r) => r.overallScore);
        const { significant, pValue } = calculateStatisticalSignificance(scores1, scores2);
        if (significant) {
          significantDifferences.push({
            model1: results[i].modelId,
            model2: results[j].modelId,
            metric: benchmark.config.primaryMetric,
            pValue,
            difference: results[i].overallScore - results[j].overallScore
          });
        }
      }
    }
    const comparison = {
      id: randomUUID17(),
      benchmarkId,
      timestamp: Date.now(),
      overallRankings,
      rankingsByMetric,
      rankingsByTaskType,
      bestOverall,
      bestByCategory: {},
      bestQualityPrice,
      bestLatency,
      bestForProduction: bestQualityPrice,
      // Simple heuristic
      significantDifferences
    };
    await this.storage.saveComparison(comparison);
    this.emit("comparisonGenerated", comparison);
    return comparison;
  }
  // ===========================================================================
  // Model Selection
  // ===========================================================================
  async recommendModels(criteria) {
    const allModels = await this.storage.listModels({ available: true });
    let candidates = allModels.filter((model) => {
      if (criteria.requiredCapabilities) {
        if (!criteria.requiredCapabilities.every((c) => model.capabilities.includes(c))) {
          return false;
        }
      }
      if (criteria.preferredProviders && !criteria.preferredProviders.includes(model.provider)) {
        return false;
      }
      if (criteria.excludedProviders && criteria.excludedProviders.includes(model.provider)) {
        return false;
      }
      if (criteria.excludedModels && criteria.excludedModels.includes(model.id)) {
        return false;
      }
      if (criteria.maxLatencyMs && model.avgLatencyMs && model.avgLatencyMs > criteria.maxLatencyMs) {
        return false;
      }
      if (criteria.minTokensPerSecond && model.tokensPerSecond && model.tokensPerSecond < criteria.minTokensPerSecond) {
        return false;
      }
      return true;
    });
    const benchmarks = await this.storage.listBenchmarks("completed");
    const modelResults = /* @__PURE__ */ new Map();
    for (const benchmark of benchmarks) {
      const results = await this.storage.getBenchmarkResults(benchmark.id);
      for (const result of results) {
        if (candidates.some((c) => c.id === result.modelId)) {
          const existing = modelResults.get(result.modelId) || [];
          existing.push(result);
          modelResults.set(result.modelId, existing);
        }
      }
    }
    const recommendations = candidates.map((model) => {
      const results = modelResults.get(model.id) || [];
      const avgOverallScore = results.length > 0 ? results.reduce((sum, r) => sum + r.overallScore, 0) / results.length : 0.5;
      const avgLatency = results.length > 0 ? results.reduce((sum, r) => sum + r.avgLatencyMs, 0) / results.length : model.avgLatencyMs || 1e3;
      const avgCost = results.length > 0 ? results.reduce((sum, r) => sum + r.totalCost / r.resultIds.length, 0) / results.length : (model.inputPricePerMillion + model.outputPricePerMillion) / 2e3;
      let matchScore = 1;
      if (criteria.minOverallScore && avgOverallScore < criteria.minOverallScore) {
        matchScore *= 0.5;
      }
      if (criteria.maxCostPerRequest && avgCost > criteria.maxCostPerRequest) {
        matchScore *= 0.5;
      }
      const qualityScore = avgOverallScore;
      const costScore = 1 / (1 + avgCost * 10);
      const latencyScore = 1 / (1 + avgLatency / 1e3);
      let score;
      switch (criteria.optimizeFor) {
        case "quality":
          score = qualityScore * 0.7 + costScore * 0.15 + latencyScore * 0.15;
          break;
        case "cost":
          score = qualityScore * 0.3 + costScore * 0.5 + latencyScore * 0.2;
          break;
        case "latency":
          score = qualityScore * 0.3 + costScore * 0.2 + latencyScore * 0.5;
          break;
        default:
          score = qualityScore * 0.4 + costScore * 0.3 + latencyScore * 0.3;
      }
      score *= matchScore;
      const strengths = [];
      const weaknesses = [];
      if (qualityScore > 0.8) strengths.push("High quality outputs");
      else if (qualityScore < 0.5) weaknesses.push("Lower quality outputs");
      if (costScore > 0.8) strengths.push("Cost-effective");
      else if (costScore < 0.3) weaknesses.push("Higher cost");
      if (latencyScore > 0.8) strengths.push("Fast response times");
      else if (latencyScore < 0.3) weaknesses.push("Slower response times");
      if (model.contextWindow > 1e5) strengths.push("Large context window");
      if (model.capabilities.includes("function_calling")) strengths.push("Supports function calling");
      if (model.capabilities.includes("vision")) strengths.push("Multimodal (vision)");
      return {
        modelId: model.id,
        score,
        rank: 0,
        // Will be set after sorting
        matchScore,
        strengths,
        weaknesses,
        qualityScore,
        costScore,
        latencyScore,
        estimatedLatencyMs: avgLatency,
        estimatedCostPerRequest: avgCost,
        estimatedAccuracy: avgOverallScore,
        confidence: Math.min(results.length / 10, 1),
        // Higher confidence with more data
        dataPoints: results.length
      };
    });
    recommendations.sort((a, b) => b.score - a.score);
    recommendations.forEach((r, i) => {
      r.rank = i + 1;
    });
    this.emit("recommendationGenerated", recommendations);
    return recommendations;
  }
  // ===========================================================================
  // Datasets
  // ===========================================================================
  async createDataset(input) {
    const dataset = {
      ...input,
      id: randomUUID17(),
      taskCount: input.tasks.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    for (const task of dataset.tasks) {
      await this.storage.saveTask(task);
    }
    await this.storage.saveDataset(dataset);
    return dataset;
  }
  async getDataset(id) {
    return this.storage.getDataset(id);
  }
  async listDatasets() {
    return this.storage.listDatasets();
  }
  // ===========================================================================
  // Human Evaluation
  // ===========================================================================
  async addHumanEvaluation(resultId, score, notes) {
    const result = await this.storage.getResult(resultId);
    if (!result) return null;
    result.humanEvaluated = true;
    result.humanScore = score;
    result.humanNotes = notes;
    await this.storage.saveResult(result);
    return result;
  }
  // ===========================================================================
  // Utility Methods
  // ===========================================================================
  async getResults(filters) {
    return this.storage.listResults(filters);
  }
  async getModelStats(modelId) {
    const results = await this.storage.listResults({ modelId });
    if (results.length === 0) {
      return {
        totalEvaluations: 0,
        avgScore: 0,
        passRate: 0,
        avgLatencyMs: 0,
        avgCost: 0,
        byTaskType: {}
      };
    }
    const validResults = results.filter((r) => !r.error);
    return {
      totalEvaluations: results.length,
      avgScore: validResults.reduce((sum, r) => sum + r.overallScore, 0) / validResults.length,
      passRate: calculatePassRate(results),
      avgLatencyMs: validResults.reduce((sum, r) => sum + r.latencyMs, 0) / validResults.length,
      avgCost: results.reduce((sum, r) => sum + r.cost, 0) / results.length,
      byTaskType: {}
      // Would need task data
    };
  }
};
var defaultEvaluator = null;
function getModelEvaluator() {
  if (!defaultEvaluator) {
    defaultEvaluator = new ModelEvaluator();
  }
  return defaultEvaluator;
}
function createModelEvaluator(config, storage) {
  return new ModelEvaluator(config, storage);
}
export {
  AWSProviderConfigSchema,
  ActionTypeSchema,
  AddMemberSchema,
  AgentExecutor,
  AggregatedHealthSchema,
  AggregationPeriodSchema,
  AlertRuleSchema,
  AlertSchema,
  AlertSeveritySchema,
  AlertStatusSchema,
  AlgorithmConfigSchema,
  AnalysisResultSchema,
  AnalyticsManager,
  AnalyticsSummarySchema,
  AnomalyDetector,
  AnomalyDetectorConfigSchema,
  AnomalySchema,
  AnomalySeveritySchema,
  AnomalyStatusSchema,
  AnomalyTypeSchema,
  ApiAuthAuditEntrySchema,
  ApiAuthConfigSchema,
  ApiAuthManager,
  ApiAuthManagerConfigSchema,
  ApiAuthRequestSchema,
  ApiAuthResultSchema,
  ApiKeyConfigSchema,
  ApiKeyLocationSchema,
  ApiKeySchema,
  ApiServer,
  ApiSessionSchema,
  ApplyResultSchema,
  ApprovalSchema,
  ApprovalStatusSchema,
  ArtifactSchema,
  ArtifactTypeSchema,
  AttributeValueSchema,
  AttributesSchema,
  AuditActionSchema,
  AuditCategorySchema,
  AuditChangeSchema,
  AuditContextSchema,
  AuditEventSchema,
  AuditExportOptionsSchema,
  AuditLogger,
  AuditQueryResultSchema,
  AuditQuerySchema,
  AuditResourceSchema,
  AuditResultSchema,
  AuditRetentionPolicySchema,
  AuditSeveritySchema,
  AuditStatsSchema,
  AuthContextSchema,
  AuthMethodSchema,
  AuthenticationError,
  AutoFixSchema,
  AzureProviderConfigSchema,
  BACKUP_RESOURCES,
  BUILTIN_METRICS,
  BURN_RATE_PRESETS,
  BackupItemSchema,
  BackupManager,
  BackupManifestSchema,
  BackupScheduleSchema,
  BackupStatusSchema,
  BackupStorageSchema,
  BackupTypeSchema,
  BaggageEntrySchema,
  BaggageSchema,
  BasicAuthConfigSchema,
  BasicCredentialsSchema,
  BatchProcessorConfigSchema,
  BearerConfigSchema,
  BenchmarkResultSchema,
  BenchmarkSchema,
  BlueGreenConfigSchema,
  BotConfigSchema,
  BudgetDefinitionSchema,
  BudgetPeriodSchema,
  BudgetResourceSchema,
  BudgetSchema,
  BudgetScopeSchema,
  BudgetStateSchema,
  BuilderSessionSchema,
  BullPipelineQueue,
  BurnRateAlertSchema,
  ButtonInteractionSchema,
  CACHE_METRICS,
  COMMON_ERROR_PATTERNS,
  CONFIG_CATEGORIES,
  CORSConfigSchema,
  CRON_PRESETS,
  CSPBuilder,
  CSPConfigSchema,
  CSPDirectiveSchema,
  CSPSourceSchema,
  CacheControlConfigSchema,
  CacheEntrySchema,
  CacheKeys,
  CacheManager,
  CacheManagerConfigSchema,
  CacheOptionsSchema,
  CacheResultSchema,
  CacheStatsSchema,
  CacheStrategySchema,
  CacheTags,
  CanaryConfigSchema,
  CapacityPlanSchema,
  ChainExecutionSchema,
  ChainStepSchema,
  ChatChannelSchema,
  ChatCredentialsSchema,
  ChatManager,
  ChatManagerConfigSchema,
  ChatMessageSchema,
  ChatPlatformSchema,
  ChatUserSchema,
  CheckResultSchema,
  CircuitBreaker,
  CircuitBreakerConfigSchema,
  CircuitBreakerRegistry,
  CircuitBreakerStateSchema,
  CircuitOpenError,
  CircuitStateSchema,
  CircuitStatsSchema,
  CodeActionKindSchema,
  CodeActionSchema,
  CollectorConfigSchema,
  CommandInvocationSchema,
  CommandSchema,
  ComparisonResultSchema,
  CompletionItemKindSchema,
  CompletionItemSchema,
  ConfigChangeSchema,
  ConfigChangeTypeSchema,
  ConfigDefinitionSchema,
  ConfigEntrySchema,
  EnvironmentSchema as ConfigEnvironmentSchema,
  ConfigManager,
  ConfigManagerConfigSchema,
  ConfigNamespaceSchema,
  ConfigSnapshotSchema,
  ConfigSourceSchema,
  ConfigSourceTypeSchema,
  ConfigValidationResultSchema,
  ConfigValidationSchema,
  ConfigValueSchema,
  ConfigValueTypeSchema,
  ConflictResolutionSchema,
  ConnectionStatusSchema,
  ConsoleTransportConfigSchema,
  ContentRecycler,
  ContentTypeOptionsConfigSchema,
  ContextCarrierSchema,
  ConversationMessageSchema,
  CostAggregationSchema,
  CostAlertSchema,
  CostAlertTypeSchema,
  CostOptimizationSchema,
  CostOptimizationTypeSchema,
  CostReportSchema,
  CostReportTypeSchema,
  Counter,
  CreateAuditEventSchema,
  CreateBudgetInputSchema,
  CreateInviteSchema,
  CreateOrgSchema,
  CreatePipelineInputSchema,
  CreateQueueJobInputSchema,
  CreateRepoConfigSchema,
  CreateScheduleInputSchema,
  CreateWebhookInputSchema,
  CronExpressionSchema,
  CrossOriginEmbedderPolicySchema,
  CrossOriginOpenerPolicySchema,
  CrossOriginPoliciesConfigSchema,
  CrossOriginResourcePolicySchema,
  CustomAuthConfigSchema,
  CustomHeaderSchema,
  DB_ATTRIBUTES,
  DB_METRICS,
  DEFAULT_ALERT_RULES,
  DEFAULT_BACKUP_SCHEDULE,
  DEFAULT_COMMANDS,
  DEFAULT_ENVIRONMENTS,
  DEFAULT_FAILOVER_CONFIG,
  DEFAULT_HA_CONFIG,
  DEFAULT_HEALTH_CHECK_CONFIG,
  DEFAULT_METRICS,
  DEFAULT_NOTIFICATION_TEMPLATES,
  DEFAULT_REGIONS,
  DEFAULT_RETENTION_DAYS,
  DEFAULT_RETRY_STRATEGIES,
  DRManagerConfigSchema,
  DRStateSchema,
  DependencySchema,
  DeploymentDefinitionSchema,
  DeploymentEnvironmentSchema,
  DeploymentManager,
  DeploymentManagerConfigSchema,
  DeploymentMetricsSchema,
  DeploymentPhaseSchema,
  DeploymentStateSchema,
  DeploymentStatusSchema,
  DeploymentStrategySchema,
  DeploymentTargetSchema,
  DiagnosticSchema,
  DiagnosticSeveritySchema,
  DiscordCredentialsSchema,
  DistributedSyncSchema,
  DistributionService,
  EFFICIENCY_BENCHMARKS,
  ERROR_ATTRIBUTES,
  EVALUATION_PROMPTS,
  EXAMPLE_PIPELINES,
  EXAMPLE_TERRAFORM_CONFIG,
  EditorStateSchema,
  EditorTypeSchema,
  EfficiencyMetricSchema,
  ElasticsearchTransportConfigSchema,
  EndpointStatsSchema,
  EngineManager,
  EnvProviderConfigSchema,
  ErrorBudgetSchema,
  ErrorPatternSchema,
  ModelCapabilitySchema2 as EvalModelCapabilitySchema,
  ModelInfoSchema as EvalModelInfoSchema,
  ModelProviderSchema as EvalModelProviderSchema,
  EvalResultSchema,
  EvalTaskSchema,
  EvaluationContextSchema,
  EvaluationReasonSchema,
  EvaluationResultSchema,
  EventBus,
  EvictionPolicySchema,
  ExecutePipelineInputSchema,
  ExecutionSchema,
  ExperimentResultSchema,
  ExperimentSchema,
  ExperimentStatusSchema,
  ExperimentVariantSchema,
  ExportFormatSchema,
  ExporterConfigSchema2 as ExporterConfigSchema,
  ExporterTypeSchema2 as ExporterTypeSchema,
  ExtensionConfigSchema,
  ExtensionStateSchema,
  FailoverConfigSchema,
  FailoverEventSchema,
  FailoverManager,
  FailoverModeSchema,
  FailoverTriggerSchema,
  FeatureFlagsManager,
  FileChangeSchema,
  FileTransportConfigSchema,
  FixedWindowConfigSchema,
  FixedWindowStateSchema,
  FlagDefinitionSchema,
  FlagEvaluationEventSchema,
  FlagManagerConfigSchema,
  SegmentSchema as FlagSegmentSchema,
  FlagStatsSchema,
  FlagStatusSchema,
  FlagTypeSchema,
  FlagVariationSchema,
  ForecastMethodSchema,
  ForecastSchema,
  FormatterConfigSchema,
  FormatterTypeSchema,
  FrameOptionsConfigSchema,
  FrameOptionsSchema,
  GCPProviderConfigSchema,
  Gauge,
  GeneratedPipelineSchema,
  GeneratedStepSchema,
  GitManager,
  GitManagerConfigSchema,
  GitProviderSchema,
  GitWebhookEventSchema,
  HAManager,
  HAManagerConfigSchema,
  HAStateSchema,
  HCLBlockSchema,
  HCLConfigSchema,
  HSTSConfigSchema,
  HTTP_ATTRIBUTES,
  HTTP_METRICS,
  HealthAggregator,
  HealthAggregatorConfigSchema,
  HealthCheckConfigSchema,
  HealthCheckError,
  HealthCheckResultSchema,
  HealthCheckTypeSchema,
  HealthChecker,
  HealthHistoryEntrySchema,
  HealthStatusSchema,
  Histogram,
  HistogramBucketsSchema,
  HoverContentSchema,
  HttpTransportConfigSchema,
  IncidentSchema,
  InstalledPluginSchema,
  InstrumentationScopeSchema,
  IntegrationHub,
  IntegrationHubSDK,
  IntelligenceConfigSchema,
  InvalidCredentialsError,
  InviteMemberInputSchema,
  InviteStatusSchema,
  JwtAlgorithmSchema,
  JwtConfigSchema,
  JwtPayloadSchema,
  BudgetStatusSchema as LLMBudgetStatusSchema,
  LLMCostTracker,
  LLMCostTrackerConfigSchema,
  LLMProviderSchema,
  LLMRequestSchema,
  TokenUsageSchema as LLMTokenUsageSchema,
  LOG_LEVEL_VALUES,
  LatencyPercentilesSchema,
  LeakyBucketConfigSchema,
  LeakyBucketStateSchema,
  LimiterStateSchema,
  LoadBalanceStrategySchema,
  LoadBalancer,
  LogAggregator,
  LogAggregatorConfigSchema,
  Logger2 as LogAggregatorLogger,
  LogQuerySchema2 as LogAggregatorQuerySchema,
  LogEntrySchema,
  LogFilterSchema,
  LogLevelSchema,
  LogQuerySchema,
  LogRecordSchema,
  SamplingConfigSchema as LogSamplingConfigSchema,
  LogSeveritySchema,
  LogStatsSchema,
  LokiTransportConfigSchema,
  MESSAGING_ATTRIBUTES,
  MODEL_PRICING,
  MemberSchema,
  MemberStatusSchema,
  MemoryTransportConfigSchema,
  MessageAttachmentSchema,
  MessageBlockSchema,
  MetricDataSchema,
  MetricDefSchema,
  MetricDefinitionSchema,
  MetricKindSchema,
  MetricPointSchema,
  MetricSampleSchema,
  MetricSchema,
  MetricTypeSchema2 as MetricTypeSchema,
  MetricUnitSchema2 as MetricUnitSchema,
  MetricsCollector,
  Counter2 as MetricsCounter,
  Gauge2 as MetricsGauge,
  Histogram2 as MetricsHistogram,
  MetricsRegistry,
  MetricsRegistryConfigSchema,
  Summary as MetricsSummaryCollector,
  MetricsSummarySchema,
  ModelCapabilitySchema,
  ModelComparisonSchema,
  ModelDefinitionSchema,
  ModelEvaluator,
  ModelEvaluatorConfigSchema,
  ModelRankingSchema,
  ModelRecommendationSchema,
  ModelTierSchema,
  MultiRegionConfigSchema,
  ConflictSchema as MultiRegionConflictSchema,
  FailoverEventSchema2 as MultiRegionFailoverEventSchema,
  MultiRegionManager,
  ReplicationConfigSchema2 as MultiRegionReplicationConfigSchema,
  ReplicationModeSchema2 as MultiRegionReplicationModeSchema,
  ReplicationStatusSchema2 as MultiRegionReplicationStatusSchema,
  RegionStatusSchema2 as MultiRegionStatusSchema,
  NLBuilder,
  NLBuilderConfigSchema,
  NLRequestSchema,
  NotificationActionSchema,
  NotificationConfigSchema,
  NotificationResourceSchema,
  NotificationTemplateSchema,
  NotificationTypeSchema,
  OAuth2ConfigSchema,
  OAuth2GrantTypeSchema,
  OAuth2TokenSchema,
  OPTIMIZATION_TEMPLATES,
  ExporterConfigSchema as OTelExporterConfigSchema,
  ExporterTypeSchema as OTelExporterTypeSchema,
  MetricQuerySchema as OTelMetricQuerySchema,
  MetricTypeSchema as OTelMetricTypeSchema,
  MetricUnitSchema as OTelMetricUnitSchema,
  SamplerConfigSchema as OTelSamplerConfigSchema,
  SamplerTypeSchema as OTelSamplerTypeSchema,
  SpanEventSchema as OTelSpanEventSchema,
  SpanKindSchema as OTelSpanKindSchema,
  SpanLinkSchema as OTelSpanLinkSchema,
  SpanSchema as OTelSpanSchema,
  SpanStatusSchema as OTelSpanStatusSchema,
  TraceContextSchema as OTelTraceContextSchema,
  TraceQuerySchema as OTelTraceQuerySchema,
  TraceSchema as OTelTraceSchema,
  Tracer as OTelTracer,
  ObservabilityConfigSchema,
  ObservabilityManager,
  ObservabilitySummarySchema,
  OperatorSchema,
  OptimizationCategorySchema,
  OptimizationGoalSchema,
  OptimizationImpactSchema,
  OptimizationSchema,
  OrgInviteSchema,
  OrgMemberSchema,
  OrgPlanSchema,
  OrgSettingsSchema,
  OrganizationSchema,
  PERMISSIONS,
  PERMISSION_GROUPS,
  PIPELINE_SNIPPETS,
  PLAN_LIMITS,
  PathConfigSchema,
  PercentageRolloutSchema,
  PerformanceConfigSchema,
  PerformanceManager,
  PerformanceSummarySchema,
  PermissionCheckSchema,
  PermissionResultSchema,
  PermissionSchema,
  PermissionsPolicyConfigSchema,
  PermissionsPolicyFeatureSchema,
  PipelineAnalysisSchema,
  PipelineChangeSchema,
  PipelinePRSchema,
  PipelineQueue,
  PipelineResourceSchema,
  PipelineSchema,
  PipelineStatsSchema,
  PipelineStepResourceSchema,
  PipelineWorker,
  PipelineYAMLSchema,
  PipelineYAMLStepSchema,
  PluginCapabilitySchema,
  PluginDefinitionSchema,
  PluginHookTypeSchema,
  PluginManager,
  PluginManagerConfigSchema,
  PluginMetadataSchema,
  PluginResourceSchema,
  PluginRouteSchema,
  PluginStatusSchema,
  PluginToolSchema,
  PredictionConfidenceSchema,
  PredictionSchema,
  PredictionTypeSchema,
  PredictiveAnalytics,
  PredictiveAnalyticsConfigSchema,
  ProcessorTypeSchema,
  ProjectAnalyticsSchema,
  PromptChainSchema,
  PromptCollectionSchema,
  PromptExecutionSchema,
  PromptManager,
  PromptManagerConfigSchema,
  PromptOptimizationSchema,
  PromptStatusSchema,
  PromptTemplateSchema,
  PromptTypeSchema,
  PromptVariableSchema,
  PromptVersionSchema,
  PropagatorTypeSchema,
  ProviderConfigSchema,
  PushGatewayConfigSchema,
  QueueJobSchema,
  QuickPickItemSchema,
  RATE_LIMIT_PRESETS,
  RBACManager,
  REGION_DISPLAY_NAMES,
  REPLICATION_LAG_THRESHOLDS,
  ROLE_DESCRIPTIONS,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  RPC_ATTRIBUTES,
  RateLimitAlgorithmSchema,
  RateLimitExceededError,
  RateLimitRequestSchema,
  RateLimitResultSchema,
  RateLimitRuleSchema,
  RateLimitStatsSchema,
  RateLimiter,
  RateLimiterConfigSchema,
  RateLimiterRegistry,
  RecoveryPointSchema,
  RedactionConfigSchema,
  ReferrerPolicyConfigSchema,
  ReferrerPolicySchema,
  RefinementSchema,
  RegionConfigSchema,
  RegionDefinitionSchema,
  RegionHealthSchema,
  RegionIdSchema,
  RegionRoleSchema,
  RegionSchema,
  RegionStatusSchema,
  HealthCheckTypeSchema2 as ReliabilityHealthCheckTypeSchema,
  ReliabilityManagerConfigSchema,
  RemoveHeadersConfigSchema,
  ReplicationConfigSchema,
  ReplicationModeSchema,
  ReplicationStatusSchema,
  RepoConfigSchema,
  ResourceChangeSchema,
  ResourceChangeTypeSchema,
  ResourceSchema,
  ResourceStateSchema,
  ResourceTypeSchema,
  RestoreManager,
  RestoreModeSchema,
  RestoreOptionsSchema,
  RestoreProgressSchema,
  RestoreStatusSchema,
  RetryAttemptSchema,
  RetryConfigSchema,
  RetryExhaustedError,
  RetryResultSchema,
  RetryStrategy,
  RetryStrategyTypeSchema,
  RoleSchema,
  RollbackReasonSchema,
  RollbackSchema,
  RollingConfigSchema,
  RolloutWeightSchema,
  RotationConfigSchema,
  RouteDecisionSchema,
  RoutingDecisionSchema,
  RoutingRuleSchema,
  RoutingStrategySchema,
  AuditEventSchema2 as SDKAuditEventSchema,
  SDKConfigSchema,
  SDKError,
  OrganizationSchema2 as SDKOrganizationSchema,
  ScheduleSchema2 as SDKScheduleSchema,
  SECRET_REFERENCE_PATTERN,
  SECURITY_PRESETS,
  SERVICE_ATTRIBUTES,
  SEVERITY_LEVELS,
  SLIConfigSchema,
  SLIMeasurementSchema,
  SLIMetricSourceSchema,
  SLITypeSchema,
  SLOAlertSchema,
  SLOAlertTypeSchema,
  SLODefinitionSchema,
  SLOHistoryEntrySchema,
  SLOManager,
  SLOManagerConfigSchema,
  SLOReportPeriodSchema,
  SLOReportSchema,
  SLOStateSchema,
  SLOStatusSchema,
  SLOSummarySchema,
  SLOTargetSchema,
  SLOWindowSchema,
  SLOWindowTypeSchema,
  SLO_PRESETS,
  SPAN_ATTRIBUTES,
  SamplerConfigSchema2 as SamplerConfigSchema,
  SamplerTypeSchema2 as SamplerTypeSchema,
  ScheduleConfigSchema,
  ScheduleExecutionSchema,
  ScheduleManager,
  ScheduleResourceSchema,
  ScheduleSchema,
  ScheduleStatsSchema,
  ScheduleStatusSchema,
  ScheduledChangeSchema,
  ScheduledRunSchema,
  SecretLeaseSchema,
  SecretMetadataSchema,
  SecretPolicySchema,
  SecretProviderSchema,
  SecretsManager,
  SecretsManagerConfigSchema,
  SecurityHeadersConfigSchema,
  SecurityHeadersManager,
  SecurityManagerConfigSchema,
  SecurityRequestSchema,
  SecurityResponseSchema,
  SegmentRuleSchema,
  SemanticVersionSchema,
  SendMessageOptionsSchema,
  ServiceHealthSchema,
  ServiceStatsSchema,
  SessionAffinitySchema,
  SimilarPipelineSchema,
  SlackCredentialsSchema,
  SlashCommandSchema,
  SlidingWindowConfigSchema,
  SlidingWindowStateSchema,
  SpanBuilder,
  SpanEventSchema2 as SpanEventSchema,
  SpanIdSchema,
  SpanKindSchema2 as SpanKindSchema,
  SpanLinkSchema2 as SpanLinkSchema,
  SpanSchema2 as SpanSchema,
  SpanStatusCodeSchema,
  SpanStatusSchema2 as SpanStatusSchema,
  StatusBarItemSchema,
  StorageConfigSchema,
  StoredTokenSchema,
  StrategyConfigSchema,
  Logger as StructuredLogger,
  SuggestionEngine,
  SuggestionPrioritySchema,
  SuggestionSchema,
  SuggestionStatusSchema,
  SuggestionTypeSchema,
  SupabaseStorage,
  SyncBatchSchema,
  SyncOperationSchema,
  SyncRecordSchema,
  SyncStatusSchema,
  SystemHealthSchema,
  TIMEOUT_PRESETS,
  TTL,
  TargetingConditionSchema,
  TargetingRuleSchema,
  TeamsCredentialsSchema,
  TelegramCredentialsSchema,
  SpanOptionsSchema as TelemetrySpanOptionsSchema,
  SpanSchema3 as TelemetrySpanSchema,
  SpanStatusCodeSchema2 as TelemetrySpanStatusCodeSchema,
  SpanStatusSchema3 as TelemetrySpanStatusSchema,
  Tracer2 as TelemetryTracer,
  TerraformApplyResultSchema,
  TerraformManager,
  TerraformManagerConfigSchema,
  TerraformPlanSchema,
  TerraformResourceTypeSchema,
  TerraformStateSchema,
  TimeGranularitySchema,
  TimeSeriesPointSchema,
  TimeSeriesSchema,
  TimeoutConfigSchema,
  TimeoutContextSchema,
  TimeoutError,
  TimeoutManager,
  TimeoutResultSchema,
  TimezoneSchema,
  TokenAnalyticsConfigSchema,
  TokenAnalyticsManager,
  TokenAnalyticsSummarySchema,
  TokenAnomalySchema,
  TokenAnomalyTypeSchema,
  TokenBreakdownSchema,
  TokenBucketConfigSchema,
  TokenBucketStateSchema,
  TokenCategorySchema,
  TokenEfficiencySchema,
  TokenExpiredError,
  TokenForecastSchema,
  TokenOptimizationSchema,
  TokenRevokedError,
  TokenTimeSeriesPointSchema,
  TokenTimeSeriesSchema,
  TraceContextSchema2 as TraceContextSchema,
  TraceFlagsSchema,
  TraceIdSchema,
  TraceSchema2 as TraceSchema,
  TraceSummarySchema,
  TracerConfigSchema,
  TransportConfigSchema,
  TransportTypeSchema,
  TreeItemSchema,
  TreeItemStateSchema,
  TreeItemTypeSchema,
  UpdateMemberSchema,
  UpdateOrgSchema,
  UsagePatternSchema,
  UsagePatternTypeSchema,
  UsageTrendSchema,
  VSCodeManager,
  VSCodeManagerConfigSchema,
  VSCodeNotificationSchema,
  NotificationTypeSchema2 as VSCodeNotificationTypeSchema,
  VariableTypeSchema,
  VaultProviderConfigSchema,
  VerificationResultSchema,
  VerificationStatusSchema,
  WALEntrySchema,
  WatchOptionsSchema,
  WebhookManager,
  WebhookResourceSchema,
  WebhookSchema,
  WebviewMessageSchema,
  WebviewStateSchema,
  WebviewTypeSchema,
  buildPermission,
  cacheMiddleware,
  calculateEfficiencyRating,
  calculateRequestCost,
  calculateTokenEfficiency,
  createAgentExecutor,
  createAgentToolExecutor,
  createAgentWorker,
  createAnomalyDetector,
  createApiAuthManager,
  createAuditLogger,
  createBackupManager,
  createBooleanFlag,
  createCacheManager,
  createCacheMiddleware,
  createChatManager,
  createCircuitBreaker,
  createCircuitBreakerRegistry,
  createConfigManager,
  createContentRecycler,
  createDeploymentManager,
  createFailoverManager,
  createFeatureFlagsManager,
  createGitManager,
  createHAManager,
  createHealthAggregator,
  createHealthChecker,
  createLLMCostTracker,
  createLoadBalancer,
  createLogAggregator,
  createMetricsCollector,
  createMetricsRegistry,
  createModelEvaluator,
  createMultiRegionManager,
  createNLBuilder,
  createTracer as createOTelTracer,
  createObservabilityManager,
  createPercentageRollout,
  createPerformanceManager,
  createPersistentAnalytics,
  createPipelineQueue,
  createPipelineWorker,
  createPluginManager,
  createPredictiveAnalytics,
  createPromptManager,
  createRBACManager,
  createRateLimiter,
  createRateLimiterRegistry,
  createRestoreManager,
  createRetryStrategy,
  createSDK,
  createSLOManager,
  createScheduleManager,
  createSecretsManager,
  createSecurityHeadersManager,
  createStringFlag,
  createLogger as createStructuredLogger,
  createSuggestionEngine,
  createTargetingRule,
  createTerraformManager,
  createTimeoutManager,
  createTokenAnalyticsManager,
  createTracer2 as createTracer,
  createVSCodeManager,
  createWebhookManager,
  cronToHuman,
  csp,
  eventBus,
  formatCost,
  formatTokenCount,
  formatTokens,
  generateContentBriefsDaily,
  generatePipelineDiff,
  generateSpanId,
  generateTraceId,
  getAgentExecutor,
  getAnalyticsManager,
  getAnomalyDetector,
  getApiAuthManager,
  getAuditLogger,
  getBackupManager,
  getCacheManager,
  getChatManager,
  getCircuitBreakerRegistry,
  getConfigManager,
  getContentRecycler,
  getDeploymentManager,
  getDistributionService,
  getFailoverManager,
  getFeatureFlagsManager,
  getGitManager,
  getHAManager,
  getHealthAggregator,
  getHealthChecker,
  getHub,
  getLLMCostTracker,
  getLoadBalancer,
  getLogAggregator,
  getMetricsCollector,
  getMetricsRegistry,
  getModelEvaluator,
  getMultiRegionManager,
  getNLBuilder,
  getTracer as getOTelTracer,
  getObservabilityManager,
  getPerformanceManager,
  getPeriodBounds,
  getPermissionsForRole,
  getPipelineQueue,
  getPluginManager,
  getPredictiveAnalytics,
  getPromptManager,
  getRBACManager,
  getRateLimiterRegistry,
  getRestoreManager,
  getSLOManager,
  getScheduleManager,
  getSecretsManager,
  getSecurityHeadersManager,
  getLogger as getStructuredLogger,
  getSuggestionEngine,
  getSupabaseStorage,
  getTerraformManager,
  getTimeoutManager,
  getTokenAnalyticsManager,
  getToolRegistry,
  getTracer2 as getTracer,
  getVSCodeManager,
  getWebhookManager,
  getWorkflows,
  incrementVersion,
  initializeStorage,
  internalToYAML,
  isAtLeastRole,
  isHigherRole,
  materializeContentFromBriefs,
  mergePermissions,
  parsePermission,
  parsePipelineYAML,
  parseTemplateVariables,
  raceWithTimeout,
  registerWorkflows,
  renderTemplate,
  retryWithBackoff,
  roleHasPermission,
  setHubInstance,
  stringifyPipelineYAML,
  toolRegistry,
  traced,
  validatePipelineYAML,
  validateVariables,
  withRateLimit,
  withRetry,
  withSpan,
  withSpanAsync,
  withTimeout,
  workflows,
  yamlToInternal
};
//# sourceMappingURL=index.js.map