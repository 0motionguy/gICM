// src/index.ts
import { EventEmitter as EventEmitter6 } from "eventemitter3";

// src/core/config.ts
var DEFAULT_BOUNDARIES = {
  financial: {
    maxAutoExpense: 50,
    maxQueuedExpense: 200,
    maxDailySpend: 100,
    maxTradeSize: 500,
    maxDailyTradingLoss: 5,
    minTreasuryBalance: 1e3
  },
  content: {
    maxAutoPostsPerDay: 10,
    maxAutoBlogsPerWeek: 3,
    requireReviewForTopics: ["controversial", "financial_advice", "competitor_criticism"]
  },
  development: {
    maxAutoCommitLines: 100,
    maxAutoFilesChanged: 5,
    requireReviewForPaths: ["src/core/", "src/config/", ".env"],
    autoDeployToStaging: true,
    autoDeployToProduction: false
  },
  trading: {
    allowedBots: ["dca"],
    allowedTokens: ["SOL", "USDC"],
    maxPositionPercent: 20,
    requireApprovalForNewTokens: true
  },
  time: {
    activeHours: { start: 6, end: 22 },
    quietHours: { start: 23, end: 6 },
    maintenanceWindow: { day: 0, hour: 4 }
  }
};
function getDefaultBoundaries() {
  return JSON.parse(JSON.stringify(DEFAULT_BOUNDARIES));
}
function mergeBoundaries(base, overrides) {
  return {
    financial: { ...base.financial, ...overrides.financial },
    content: { ...base.content, ...overrides.content },
    development: { ...base.development, ...overrides.development },
    trading: { ...base.trading, ...overrides.trading },
    time: { ...base.time, ...overrides.time }
  };
}

// src/router/index.ts
import { EventEmitter as EventEmitter2 } from "eventemitter3";

// src/router/classifier.ts
var RiskClassifier = class {
  /**
   * Assess risk of an action
   */
  async assess(action) {
    const factors = this.identifyRiskFactors(action);
    const score = this.calculateScore(factors);
    const level = this.determineLevel(score);
    return {
      level,
      score,
      factors,
      estimatedCost: this.estimateCost(action),
      maxPotentialLoss: this.estimateMaxLoss(action),
      reversible: this.isReversible(action),
      rollbackPlan: this.generateRollbackPlan(action)
    };
  }
  /**
   * Identify risk factors for an action
   */
  identifyRiskFactors(action) {
    const factors = [];
    const params = action.params;
    const amount = params.amount || params.cost || 0;
    if (amount > 0) {
      factors.push({
        name: "financial_exposure",
        weight: 0.3,
        value: amount,
        threshold: 100,
        exceeded: amount > 100
      });
    }
    const irreversibleActions = ["deploy_production", "delete", "publish", "trade_execute"];
    if (irreversibleActions.some((a) => action.type.includes(a))) {
      factors.push({
        name: "irreversibility",
        weight: 0.25,
        value: 1,
        threshold: 0,
        exceeded: true
      });
    }
    const filesChanged = params.filesChanged || 0;
    const linesChanged = params.linesChanged || 0;
    factors.push({
      name: "change_scope",
      weight: 0.2,
      value: filesChanged * 10 + linesChanged / 10,
      threshold: 100,
      exceeded: filesChanged > 5 || linesChanged > 100
    });
    const externalActions = ["tweet", "blog_publish", "email", "api_call"];
    if (externalActions.some((a) => action.type.includes(a))) {
      factors.push({
        name: "external_visibility",
        weight: 0.15,
        value: 1,
        threshold: 0,
        exceeded: true
      });
    }
    const isQuietHours = this.isQuietHours();
    if (isQuietHours) {
      factors.push({
        name: "quiet_hours",
        weight: 0.1,
        value: 1,
        threshold: 0,
        exceeded: true
      });
    }
    return factors;
  }
  /**
   * Calculate overall risk score
   */
  calculateScore(factors) {
    let totalWeight = 0;
    let weightedScore = 0;
    for (const factor of factors) {
      totalWeight += factor.weight;
      const factorScore = factor.exceeded ? 100 : factor.value / factor.threshold * 50;
      weightedScore += factor.weight * factorScore;
    }
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }
  /**
   * Determine risk level from score
   */
  determineLevel(score) {
    if (score < 25) return "safe";
    if (score < 50) return "moderate";
    if (score < 75) return "high";
    return "critical";
  }
  estimateCost(action) {
    const params = action.params;
    return params.cost || params.amount || 0;
  }
  estimateMaxLoss(action) {
    const params = action.params;
    if (action.type.includes("trade")) {
      return params.amount || 0;
    }
    return 0;
  }
  isReversible(action) {
    const irreversible = ["trade", "publish", "deploy_prod", "send", "delete"];
    return !irreversible.some((i) => action.type.includes(i));
  }
  generateRollbackPlan(action) {
    if (action.type.includes("deploy")) {
      return "Revert to previous deployment version";
    }
    if (action.type.includes("commit")) {
      return "Git revert commit";
    }
    return void 0;
  }
  isQuietHours() {
    const hour = (/* @__PURE__ */ new Date()).getUTCHours();
    return hour < 6 || hour > 22;
  }
};

// src/router/boundaries.ts
var BoundaryChecker = class {
  boundaries;
  dailySpend = 0;
  dailyPosts = 0;
  weeklyBlogs = 0;
  lastResetDay = (/* @__PURE__ */ new Date()).getDate();
  constructor(boundaries) {
    this.boundaries = boundaries;
  }
  /**
   * Check if action is within boundaries
   */
  check(action) {
    this.resetDailyCountersIfNeeded();
    const violations = [];
    const warnings = [];
    this.checkFinancialBoundaries(action, violations, warnings);
    this.checkContentBoundaries(action, violations, warnings);
    this.checkDevelopmentBoundaries(action, violations, warnings);
    this.checkTradingBoundaries(action, violations, warnings);
    this.checkTimeBoundaries(action, warnings);
    return {
      withinLimits: violations.length === 0 && warnings.length === 0,
      needsReview: warnings.length > 0,
      violated: violations.length > 0,
      violations,
      warnings
    };
  }
  checkFinancialBoundaries(action, violations, warnings) {
    const params = action.params;
    const amount = params.amount || params.cost || 0;
    if (amount > 0) {
      if (amount > this.boundaries.financial.maxQueuedExpense) {
        violations.push(
          "Expense " + amount + " exceeds max queued limit (" + this.boundaries.financial.maxQueuedExpense + ")"
        );
      } else if (amount > this.boundaries.financial.maxAutoExpense) {
        warnings.push(
          "Expense " + amount + " exceeds auto-approve limit (" + this.boundaries.financial.maxAutoExpense + ")"
        );
      }
      if (this.dailySpend + amount > this.boundaries.financial.maxDailySpend) {
        violations.push(
          "Would exceed daily spend limit (" + this.boundaries.financial.maxDailySpend + ")"
        );
      }
    }
    if (action.type.includes("trade")) {
      if (amount > this.boundaries.financial.maxTradeSize) {
        violations.push(
          "Trade size " + amount + " exceeds limit (" + this.boundaries.financial.maxTradeSize + ")"
        );
      }
    }
  }
  checkContentBoundaries(action, violations, warnings) {
    const params = action.params;
    if (action.type.includes("tweet") || action.type.includes("post")) {
      if (this.dailyPosts >= this.boundaries.content.maxAutoPostsPerDay) {
        warnings.push(
          "Daily post limit reached (" + this.boundaries.content.maxAutoPostsPerDay + ")"
        );
      }
    }
    if (action.type.includes("blog")) {
      if (this.weeklyBlogs >= this.boundaries.content.maxAutoBlogsPerWeek) {
        warnings.push(
          "Weekly blog limit reached (" + this.boundaries.content.maxAutoBlogsPerWeek + ")"
        );
      }
    }
    const topic = params.topic || params.category || "";
    if (this.boundaries.content.requireReviewForTopics.some(
      (t) => topic.toLowerCase().includes(t.toLowerCase())
    )) {
      warnings.push("Topic '" + topic + "' requires human review");
    }
  }
  checkDevelopmentBoundaries(action, violations, warnings) {
    const params = action.params;
    if (action.type.includes("commit")) {
      const lines = params.linesChanged || 0;
      const files = params.filesChanged || 0;
      if (lines > this.boundaries.development.maxAutoCommitLines) {
        warnings.push(
          "Commit has " + lines + " lines (limit: " + this.boundaries.development.maxAutoCommitLines + ")"
        );
      }
      if (files > this.boundaries.development.maxAutoFilesChanged) {
        warnings.push(
          "Commit changes " + files + " files (limit: " + this.boundaries.development.maxAutoFilesChanged + ")"
        );
      }
    }
    const paths = params.paths || [];
    for (const path of paths) {
      if (this.boundaries.development.requireReviewForPaths.some(
        (p) => path.includes(p)
      )) {
        warnings.push("Path '" + path + "' requires human review");
      }
    }
    if (action.type.includes("deploy_prod")) {
      if (!this.boundaries.development.autoDeployToProduction) {
        violations.push("Production deployments require approval");
      }
    }
  }
  checkTradingBoundaries(action, violations, warnings) {
    const params = action.params;
    if (action.type.includes("trade")) {
      const bot = params.bot || "";
      if (bot && !this.boundaries.trading.allowedBots.includes(bot)) {
        violations.push("Bot '" + bot + "' not in allowed list");
      }
      const token = params.token || "";
      if (token && !this.boundaries.trading.allowedTokens.includes(token)) {
        if (this.boundaries.trading.requireApprovalForNewTokens) {
          warnings.push("Token '" + token + "' requires approval");
        }
      }
    }
  }
  checkTimeBoundaries(action, warnings) {
    const hour = (/* @__PURE__ */ new Date()).getUTCHours();
    const { activeHours, quietHours } = this.boundaries.time;
    if (hour < activeHours.start || hour > activeHours.end) {
      warnings.push("Outside active hours (" + activeHours.start + "-" + activeHours.end + " UTC)");
    }
    if (hour >= quietHours.start || hour < quietHours.end) {
    }
  }
  /**
   * Record that an action was executed (for daily limits)
   */
  recordExecution(action) {
    const params = action.params;
    const amount = params.amount || params.cost || 0;
    this.dailySpend += amount;
    if (action.type.includes("tweet") || action.type.includes("post")) {
      this.dailyPosts++;
    }
    if (action.type.includes("blog")) {
      this.weeklyBlogs++;
    }
  }
  resetDailyCountersIfNeeded() {
    const today = (/* @__PURE__ */ new Date()).getDate();
    if (today !== this.lastResetDay) {
      this.dailySpend = 0;
      this.dailyPosts = 0;
      this.lastResetDay = today;
      if ((/* @__PURE__ */ new Date()).getDay() === 0) {
        this.weeklyBlogs = 0;
      }
    }
  }
  /**
   * Update boundaries
   */
  updateBoundaries(newBoundaries) {
    this.boundaries = newBoundaries;
  }
  /**
   * Get current boundaries
   */
  getBoundaries() {
    return this.boundaries;
  }
};

// src/router/escalation.ts
import { EventEmitter } from "eventemitter3";

// src/utils/logger.ts
var Logger = class {
  prefix;
  constructor(name) {
    this.prefix = "[" + name + "]";
  }
  info(message) {
    console.log(this.prefix, message);
  }
  warn(message) {
    console.warn(this.prefix, "WARN:", message);
  }
  error(message) {
    console.error(this.prefix, "ERROR:", message);
  }
  debug(message) {
    if (process.env.DEBUG) {
      console.log(this.prefix, "DEBUG:", message);
    }
  }
};

// src/router/escalation.ts
var EscalationManager = class extends EventEmitter {
  logger;
  pendingEscalations = /* @__PURE__ */ new Map();
  constructor() {
    super();
    this.logger = new Logger("Escalation");
  }
  /**
   * Escalate an action for immediate human review
   */
  async notify(action) {
    this.pendingEscalations.set(action.id, action);
    this.logger.warn(
      "ESCALATION: " + action.type + " from " + action.engine + " (Risk: " + action.risk.level + ", Score: " + action.risk.score + ")"
    );
    const details = this.formatEscalationDetails(action);
    this.logger.warn(details);
    this.emit("escalated", action);
  }
  /**
   * Resolve an escalation
   */
  resolve(actionId, approved, feedback) {
    const action = this.pendingEscalations.get(actionId);
    if (!action) {
      this.logger.warn("No pending escalation found for: " + actionId);
      return;
    }
    this.pendingEscalations.delete(actionId);
    action.status = approved ? "approved" : "rejected";
    action.approvedBy = "human";
    action.approvedAt = Date.now();
    if (feedback) {
      action.feedback = feedback;
    }
    this.logger.info(
      "Escalation " + (approved ? "APPROVED" : "REJECTED") + ": " + action.type
    );
    this.emit("resolved", actionId, approved);
  }
  /**
   * Get pending escalations
   */
  getPending() {
    return Array.from(this.pendingEscalations.values());
  }
  /**
   * Get pending count
   */
  getPendingCount() {
    return this.pendingEscalations.size;
  }
  /**
   * Format escalation details for logging/notification
   */
  formatEscalationDetails(action) {
    const lines = [
      "----------------------------------------",
      "ACTION REQUIRES IMMEDIATE REVIEW",
      "----------------------------------------",
      "Type: " + action.type,
      "Engine: " + action.engine,
      "Description: " + action.description,
      "",
      "Risk Assessment:",
      "  Level: " + action.risk.level.toUpperCase(),
      "  Score: " + action.risk.score + "/100",
      "  Est. Cost: $" + action.risk.estimatedCost,
      "  Max Loss: $" + action.risk.maxPotentialLoss,
      "  Reversible: " + (action.risk.reversible ? "Yes" : "NO"),
      "",
      "Risk Factors:"
    ];
    for (const factor of action.risk.factors) {
      lines.push(
        "  - " + factor.name + ": " + (factor.exceeded ? "EXCEEDED" : "OK") + " (" + factor.value + "/" + factor.threshold + ")"
      );
    }
    if (action.risk.rollbackPlan) {
      lines.push("");
      lines.push("Rollback Plan: " + action.risk.rollbackPlan);
    }
    lines.push("----------------------------------------");
    return lines.join("\n");
  }
};

// src/router/index.ts
var DecisionRouter = class extends EventEmitter2 {
  classifier;
  boundaryChecker;
  escalation;
  logger;
  boundaries;
  constructor(boundaries) {
    super();
    this.boundaries = boundaries;
    this.classifier = new RiskClassifier();
    this.boundaryChecker = new BoundaryChecker(boundaries);
    this.escalation = new EscalationManager();
    this.logger = new Logger("DecisionRouter");
    this.escalation.on("escalated", (action) => {
      this.emit("action:escalated", action);
    });
  }
  /**
   * Route an action to the appropriate handler
   */
  async route(action) {
    this.logger.info("Routing action: " + action.type + " from " + action.engine);
    const risk = await this.classifier.assess(action);
    action.risk = risk;
    const boundaryResult = this.boundaryChecker.check(action);
    let route;
    let reason = "";
    if (risk.level === "critical" || boundaryResult.violated) {
      route = "escalate";
      reason = boundaryResult.violations.join("; ") || "Critical risk level";
    } else if (risk.level === "high" || boundaryResult.needsReview) {
      route = "queue";
      reason = boundaryResult.warnings.join("; ") || "High risk requires review";
    } else if (risk.level === "safe" && boundaryResult.withinLimits) {
      route = "auto";
      reason = "Within safe boundaries";
    } else {
      route = "queue";
      reason = "Moderate risk - queued for review";
    }
    action.route = route;
    this.logger.info(
      "Action routed: " + route + " (risk: " + risk.level + ", score: " + risk.score + ")"
    );
    await this.handleRoute(action, route, reason);
    this.emit("action:routed", action, route);
    return route;
  }
  /**
   * Handle action based on route
   */
  async handleRoute(action, route, reason) {
    switch (route) {
      case "auto":
        this.logger.info("Auto-approved: " + action.type);
        action.status = "approved";
        action.approvedBy = "auto";
        action.approvedAt = Date.now();
        this.emit("action:auto_approved", action);
        break;
      case "queue":
        this.logger.info("Queued for review: " + action.type + " - " + reason);
        action.status = "pending";
        this.emit("action:queued", action, reason);
        break;
      case "escalate":
        this.logger.warn("Escalating: " + action.type + " - " + reason);
        action.status = "pending";
        await this.escalation.notify(action);
        break;
    }
  }
  /**
   * Record that an action was executed (updates daily limits)
   */
  recordExecution(action) {
    this.boundaryChecker.recordExecution(action);
  }
  /**
   * Update boundaries
   */
  updateBoundaries(newBoundaries) {
    this.boundaries = newBoundaries;
    this.boundaryChecker.updateBoundaries(newBoundaries);
    this.logger.info("Boundaries updated");
  }
  /**
   * Get current boundaries
   */
  getBoundaries() {
    return this.boundaries;
  }
  /**
   * Get escalation manager (for handling escalations)
   */
  getEscalationManager() {
    return this.escalation;
  }
  /**
   * Get boundary checker (for manual checks)
   */
  getBoundaryChecker() {
    return this.boundaryChecker;
  }
};

// src/executor/index.ts
import { EventEmitter as EventEmitter3 } from "eventemitter3";

// src/executor/safe-actions.ts
var SafeActions = class {
  handlers = /* @__PURE__ */ new Map();
  logger;
  constructor() {
    this.logger = new Logger("SafeActions");
    this.registerDefaultHandlers();
  }
  /**
   * Register a handler for an action type
   */
  register(actionType, handler) {
    this.handlers.set(actionType, handler);
    this.logger.debug("Registered handler for: " + actionType);
  }
  /**
   * Execute an action using registered handler
   */
  async execute(action) {
    const handler = this.findHandler(action.type);
    if (!handler) {
      throw new Error("No handler registered for action type: " + action.type);
    }
    this.logger.info("Executing: " + action.type);
    const result = await handler(action);
    this.logger.info("Completed: " + action.type);
    return result;
  }
  /**
   * Check if action type has a handler
   */
  hasHandler(actionType) {
    return this.findHandler(actionType) !== void 0;
  }
  /**
   * Find handler for action type (supports wildcards)
   */
  findHandler(actionType) {
    if (this.handlers.has(actionType)) {
      return this.handlers.get(actionType);
    }
    for (const [pattern, handler] of this.handlers) {
      if (pattern.endsWith("*")) {
        const prefix = pattern.slice(0, -1);
        if (actionType.startsWith(prefix)) {
          return handler;
        }
      }
    }
    return void 0;
  }
  /**
   * Register default safe action handlers
   */
  registerDefaultHandlers() {
    this.register("content:generate:*", async (action) => {
      this.logger.info("Content generation: " + JSON.stringify(action.params));
      return { generated: true, type: action.params.type };
    });
    this.register("twitter:post", async (action) => {
      this.logger.info("Twitter post: " + action.description);
      return { posted: true };
    });
    this.register("blog:publish", async (action) => {
      this.logger.info("Blog publish: " + action.description);
      return { published: true };
    });
    this.register("trading:dca:buy", async (action) => {
      const params = action.params;
      this.logger.info("DCA buy: " + params.amount + " " + params.token);
      return { executed: true, amount: params.amount };
    });
    this.register("code:commit", async (action) => {
      this.logger.info("Code commit: " + action.description);
      return { committed: true };
    });
    this.register("discovery:scan", async (action) => {
      this.logger.info("Discovery scan: " + action.params.source);
      return { scanned: true };
    });
    this.register("metrics:collect", async (action) => {
      this.logger.info("Metrics collection");
      return { collected: true };
    });
    this.register("status:check", async (action) => {
      this.logger.info("Status check: " + action.params.engine);
      return { checked: true };
    });
  }
};

// src/executor/rollback.ts
var RollbackManager = class {
  checkpoints = /* @__PURE__ */ new Map();
  logger;
  maxCheckpoints = 100;
  constructor() {
    this.logger = new Logger("Rollback");
  }
  /**
   * Create a checkpoint before executing an action
   */
  async createCheckpoint(action, state) {
    const checkpoint = {
      actionId: action.id,
      createdAt: Date.now(),
      state
    };
    checkpoint.rollbackFn = this.generateRollbackFn(action);
    this.checkpoints.set(action.id, checkpoint);
    this.logger.debug("Checkpoint created for: " + action.id);
    this.cleanupOldCheckpoints();
  }
  /**
   * Restore from checkpoint (rollback)
   */
  async restore(action) {
    const checkpoint = this.checkpoints.get(action.id);
    if (!checkpoint) {
      this.logger.warn("No checkpoint found for: " + action.id);
      throw new Error("No checkpoint available for rollback");
    }
    if (checkpoint.rollbackFn) {
      this.logger.info("Executing rollback for: " + action.id);
      await checkpoint.rollbackFn();
      this.logger.info("Rollback completed for: " + action.id);
    } else {
      this.logger.warn("No rollback function for: " + action.id);
    }
    this.checkpoints.delete(action.id);
  }
  /**
   * Check if rollback is available
   */
  hasCheckpoint(actionId) {
    return this.checkpoints.has(actionId);
  }
  /**
   * Get checkpoint state
   */
  getState(actionId) {
    return this.checkpoints.get(actionId)?.state;
  }
  /**
   * Clear checkpoint (after successful verification)
   */
  clearCheckpoint(actionId) {
    this.checkpoints.delete(actionId);
    this.logger.debug("Checkpoint cleared for: " + actionId);
  }
  /**
   * Generate rollback function based on action type
   */
  generateRollbackFn(action) {
    const type = action.type;
    if (type.includes("commit")) {
      return async () => {
        this.logger.info("Would execute: git revert " + action.params.commitHash);
      };
    }
    if (type.includes("deploy:staging")) {
      return async () => {
        this.logger.info("Would rollback staging deployment");
      };
    }
    if (type.includes("config:update")) {
      return async () => {
        this.logger.info("Would restore previous config");
      };
    }
    return void 0;
  }
  /**
   * Cleanup old checkpoints (keep last N)
   */
  cleanupOldCheckpoints() {
    if (this.checkpoints.size <= this.maxCheckpoints) {
      return;
    }
    const entries = Array.from(this.checkpoints.entries()).sort((a, b) => a[1].createdAt - b[1].createdAt);
    const toRemove = entries.slice(0, entries.length - this.maxCheckpoints);
    for (const [id] of toRemove) {
      this.checkpoints.delete(id);
    }
    this.logger.debug("Cleaned up " + toRemove.length + " old checkpoints");
  }
};

// src/executor/index.ts
var AutoExecutor = class extends EventEmitter3 {
  safeActions;
  rollback;
  logger;
  executing = /* @__PURE__ */ new Set();
  constructor() {
    super();
    this.safeActions = new SafeActions();
    this.rollback = new RollbackManager();
    this.logger = new Logger("AutoExecutor");
  }
  /**
   * Execute an auto-approved action
   */
  async execute(action) {
    if (action.route !== "auto" || !action.approvedBy) {
      this.logger.error("Action " + action.id + " not approved for auto-execution");
      return false;
    }
    if (this.executing.has(action.id)) {
      this.logger.warn("Action " + action.id + " already executing");
      return false;
    }
    this.executing.add(action.id);
    this.logger.info("Executing: " + action.type);
    try {
      if (action.risk.reversible) {
        await this.rollback.createCheckpoint(action);
      }
      const result = await this.safeActions.execute(action);
      action.status = "executed";
      action.executedAt = Date.now();
      action.result = result;
      this.logger.info("Executed successfully: " + action.type);
      this.emit("executed", action);
      if (action.risk.reversible) {
        this.rollback.clearCheckpoint(action.id);
      }
      return true;
    } catch (error) {
      action.status = "failed";
      action.error = error.message;
      this.logger.error("Execution failed: " + action.type + " - " + action.error);
      this.emit("failed", action, error);
      if (action.risk.reversible) {
        await this.attemptRollback(action);
      }
      return false;
    } finally {
      this.executing.delete(action.id);
    }
  }
  /**
   * Attempt to rollback a failed action
   */
  async attemptRollback(action) {
    try {
      await this.rollback.restore(action);
      action.status = "rolled_back";
      this.logger.info("Rolled back: " + action.type);
      this.emit("rolled_back", action);
    } catch (error) {
      this.logger.error("Rollback failed: " + action.type);
    }
  }
  /**
   * Execute multiple actions in sequence
   */
  async executeBatch(actions) {
    const success = [];
    const failed = [];
    for (const action of actions) {
      const result = await this.execute(action);
      if (result) {
        success.push(action);
      } else {
        failed.push(action);
      }
    }
    return { success, failed };
  }
  /**
   * Register custom action handler
   */
  registerHandler(actionType, handler) {
    this.safeActions.register(actionType, handler);
  }
  /**
   * Check if action type can be executed
   */
  canExecute(actionType) {
    return this.safeActions.hasHandler(actionType);
  }
  /**
   * Get rollback manager
   */
  getRollbackManager() {
    return this.rollback;
  }
};

// src/approval/queue.ts
import { EventEmitter as EventEmitter4 } from "eventemitter3";
var ApprovalQueue = class extends EventEmitter4 {
  queue = /* @__PURE__ */ new Map();
  logger;
  batchInterval = 4 * 60 * 60 * 1e3;
  // 4 hours
  batchTimer;
  constructor() {
    super();
    this.logger = new Logger("ApprovalQueue");
  }
  /**
   * Start batch timer
   */
  startBatchTimer() {
    this.batchTimer = setInterval(() => {
      const stats = this.getStats();
      if (stats.pending > 0) {
        const batch = this.getBatch();
        this.emit("batch_ready", batch);
      }
    }, this.batchInterval);
  }
  /**
   * Stop batch timer
   */
  stopBatchTimer() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = void 0;
    }
  }
  /**
   * Add action to approval queue
   */
  add(action, reason) {
    const item = {
      action,
      reason,
      recommendation: this.generateRecommendation(action),
      confidence: this.calculateConfidence(action),
      relatedActions: [],
      urgency: this.determineUrgency(action),
      status: "pending"
    };
    if (item.urgency === "critical") {
      item.expiresAt = Date.now() + 1 * 60 * 60 * 1e3;
    } else if (item.urgency === "high") {
      item.expiresAt = Date.now() + 4 * 60 * 60 * 1e3;
    }
    this.queue.set(action.id, item);
    this.logger.info("Added to queue: " + action.type + " (" + item.urgency + ")");
    this.emit("item_added", item);
    return item;
  }
  /**
   * Approve an item
   */
  approve(actionId, feedback) {
    const item = this.queue.get(actionId);
    if (!item) return false;
    item.status = "approved";
    item.reviewedAt = Date.now();
    item.reviewedBy = "human";
    item.feedback = feedback;
    item.action.status = "approved";
    item.action.approvedBy = "human";
    item.action.approvedAt = Date.now();
    this.logger.info("Approved: " + item.action.type);
    this.emit("item_approved", item);
    return true;
  }
  /**
   * Reject an item
   */
  reject(actionId, feedback) {
    const item = this.queue.get(actionId);
    if (!item) return false;
    item.status = "rejected";
    item.reviewedAt = Date.now();
    item.reviewedBy = "human";
    item.feedback = feedback;
    item.action.status = "rejected";
    this.logger.info("Rejected: " + item.action.type);
    this.emit("item_rejected", item);
    return true;
  }
  /**
   * Get a specific item
   */
  get(actionId) {
    return this.queue.get(actionId);
  }
  /**
   * Get all pending items
   */
  getPending() {
    return Array.from(this.queue.values()).filter((i) => i.status === "pending");
  }
  /**
   * Get pending items for batch review
   */
  getBatch() {
    const items = this.getPending();
    const byEngine = {};
    const byRisk = { safe: 0, moderate: 0, high: 0, critical: 0 };
    let totalCost = 0;
    for (const item of items) {
      byEngine[item.action.engine] = (byEngine[item.action.engine] || 0) + 1;
      byRisk[item.action.risk.level]++;
      totalCost += item.action.risk.estimatedCost;
    }
    const self = this;
    return {
      id: "batch-" + Date.now(),
      items,
      totalActions: items.length,
      byEngine,
      byRisk,
      estimatedTotalCost: totalCost,
      approveAll: async () => {
        for (const item of items) {
          self.approve(item.action.id);
        }
      },
      rejectAll: async () => {
        for (const item of items) {
          self.reject(item.action.id);
        }
      },
      approveSelected: async (ids) => {
        for (const id of ids) {
          self.approve(id);
        }
      }
    };
  }
  /**
   * Get queue stats
   */
  getStats() {
    const items = Array.from(this.queue.values());
    const byUrgency = {};
    for (const item of items) {
      if (item.status === "pending") {
        byUrgency[item.urgency] = (byUrgency[item.urgency] || 0) + 1;
      }
    }
    return {
      pending: items.filter((i) => i.status === "pending").length,
      approved: items.filter((i) => i.status === "approved").length,
      rejected: items.filter((i) => i.status === "rejected").length,
      byUrgency
    };
  }
  /**
   * Clear processed items
   */
  clearProcessed() {
    for (const [id, item] of this.queue) {
      if (item.status !== "pending") {
        this.queue.delete(id);
      }
    }
  }
  generateRecommendation(action) {
    if (action.risk.score < 30) return "approve";
    if (action.risk.score > 70) return "reject";
    return "modify";
  }
  calculateConfidence(action) {
    const wellKnown = ["dca_buy", "blog_generate", "tweet_post"];
    if (wellKnown.some((w) => action.type.includes(w))) {
      return 85;
    }
    return 60;
  }
  determineUrgency(action) {
    if (action.risk.level === "critical") return "critical";
    if (action.type.includes("trade") || action.type.includes("alert")) return "high";
    if (action.type.includes("deploy")) return "medium";
    return "low";
  }
};

// src/approval/notifications.ts
import { EventEmitter as EventEmitter5 } from "eventemitter3";
var NotificationManager = class extends EventEmitter5 {
  config;
  logger;
  constructor(config = {}) {
    super();
    this.config = config;
    this.logger = new Logger("Notifications");
  }
  /**
   * Update configuration
   */
  setConfig(config) {
    this.config = config;
  }
  /**
   * Send escalation alert (immediate)
   */
  async escalate(action) {
    const message = this.formatEscalation(action);
    await this.sendAll(message, "ESCALATION");
    this.logger.warn("Escalation sent: " + action.type);
  }
  /**
   * Send batch review notification
   */
  async notifyBatchReady(batch) {
    const message = this.formatBatch(batch);
    await this.sendAll(message, "BATCH REVIEW");
    this.logger.info("Batch notification sent: " + batch.totalActions + " items");
  }
  /**
   * Send daily summary
   */
  async sendDailySummary(summary) {
    const message = [
      "Daily Autonomy Summary",
      "",
      "Auto-executed: " + summary.autoExecuted + " actions",
      "Queued for review: " + summary.queued,
      "Escalated: " + summary.escalated,
      "",
      "Cost: $" + summary.costIncurred.toFixed(2),
      "Revenue: $" + summary.revenueGenerated.toFixed(2)
    ].join("\n");
    await this.sendAll(message, "DAILY SUMMARY");
  }
  /**
   * Format escalation message
   */
  formatEscalation(action) {
    const lines = [
      "Action Requires Immediate Review",
      "",
      "Type: " + action.type,
      "Engine: " + action.engine,
      "Risk Level: " + action.risk.level.toUpperCase(),
      "Risk Score: " + action.risk.score + "/100",
      "",
      "Est. Cost: $" + action.risk.estimatedCost,
      "Reversible: " + (action.risk.reversible ? "Yes" : "NO"),
      "",
      "Description:",
      action.description,
      "",
      "Risk Factors:"
    ];
    for (const factor of action.risk.factors) {
      lines.push("  - " + factor.name + ": " + (factor.exceeded ? "EXCEEDED" : "OK"));
    }
    lines.push("");
    lines.push("Reply with APPROVE or REJECT");
    return lines.join("\n");
  }
  /**
   * Format batch message
   */
  formatBatch(batch) {
    const lines = [
      batch.totalActions + " Actions Pending Review",
      "",
      "By Engine:"
    ];
    for (const [engine, count] of Object.entries(batch.byEngine)) {
      lines.push("  " + engine + ": " + count);
    }
    lines.push("");
    lines.push("By Risk:");
    for (const [risk, count] of Object.entries(batch.byRisk)) {
      if (count > 0) {
        lines.push("  " + risk + ": " + count);
      }
    }
    lines.push("");
    lines.push("Total Est. Cost: $" + batch.estimatedTotalCost.toFixed(2));
    lines.push("");
    lines.push("Review at: [Dashboard]");
    return lines.join("\n");
  }
  /**
   * Send to all configured channels
   */
  async sendAll(message, title) {
    const promises = [];
    if (this.config.telegram) {
      promises.push(this.sendTelegram(message, title));
    }
    if (this.config.discord) {
      promises.push(this.sendDiscord(message, title));
    }
    if (promises.length === 0) {
      this.logger.info("[" + title + "] " + message.split("\n")[0]);
    }
    await Promise.allSettled(promises);
  }
  /**
   * Send via Telegram
   */
  async sendTelegram(message, title) {
    if (!this.config.telegram) return;
    const { botToken, chatId } = this.config.telegram;
    const url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: title + "\n\n" + message,
          parse_mode: "Markdown"
        })
      });
      if (!response.ok) {
        throw new Error("Telegram API error: " + response.status);
      }
      this.emit("sent", "telegram", title);
    } catch (error) {
      this.logger.error("Telegram send failed: " + error.message);
      this.emit("failed", "telegram", error);
    }
  }
  /**
   * Send via Discord webhook
   */
  async sendDiscord(message, title) {
    if (!this.config.discord) return;
    try {
      const response = await fetch(this.config.discord.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title,
              description: message,
              color: title.includes("ESCALATION") ? 16711680 : 65280
            }
          ]
        })
      });
      if (!response.ok) {
        throw new Error("Discord webhook error: " + response.status);
      }
      this.emit("sent", "discord", title);
    } catch (error) {
      this.logger.error("Discord send failed: " + error.message);
      this.emit("failed", "discord", error);
    }
  }
};

// src/audit/index.ts
var AuditLogger = class {
  entries = [];
  logger;
  maxEntries = 1e4;
  constructor() {
    this.logger = new Logger("Audit");
  }
  /**
   * Log an action
   */
  log(action, outcome, costIncurred = 0, revenueGenerated = 0) {
    const entry = {
      id: "audit-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      timestamp: Date.now(),
      actionId: action.id,
      actionType: action.type,
      engine: action.engine,
      route: action.route,
      approvedBy: action.approvedBy || "auto",
      status: outcome,
      result: action.result,
      error: action.error,
      costIncurred,
      revenueGenerated
    };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
    this.logger.debug("Logged: " + action.type + " -> " + outcome);
    return entry;
  }
  /**
   * Add human feedback to an entry
   */
  addFeedback(entryId, wasGoodDecision, notes) {
    const entry = this.entries.find((e) => e.id === entryId);
    if (entry) {
      entry.wasGoodDecision = wasGoodDecision;
      entry.notes = notes;
    }
  }
  /**
   * Get entries for time range
   */
  getEntries(options = {}) {
    let filtered = this.entries;
    if (options.since) {
      filtered = filtered.filter((e) => e.timestamp >= options.since);
    }
    if (options.until) {
      filtered = filtered.filter((e) => e.timestamp <= options.until);
    }
    if (options.engine) {
      filtered = filtered.filter((e) => e.engine === options.engine);
    }
    if (options.route) {
      filtered = filtered.filter((e) => e.route === options.route);
    }
    if (options.status) {
      filtered = filtered.filter((e) => e.status === options.status);
    }
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    return filtered;
  }
  /**
   * Get summary statistics
   */
  getSummary(since) {
    let entries = this.entries;
    if (since) {
      entries = entries.filter((e) => e.timestamp >= since);
    }
    const byRoute = { auto: 0, queue: 0, escalate: 0 };
    const byStatus = {};
    const byEngine = {};
    let totalCost = 0;
    let totalRevenue = 0;
    let successes = 0;
    for (const entry of entries) {
      byRoute[entry.route]++;
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      byEngine[entry.engine] = (byEngine[entry.engine] || 0) + 1;
      totalCost += entry.costIncurred;
      totalRevenue += entry.revenueGenerated;
      if (entry.status === "success") {
        successes++;
      }
    }
    return {
      total: entries.length,
      byRoute,
      byStatus,
      byEngine,
      totalCost,
      totalRevenue,
      successRate: entries.length > 0 ? successes / entries.length * 100 : 0
    };
  }
  /**
   * Get daily summary
   */
  getDailySummary() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const since = today.getTime();
    const summary = this.getSummary(since);
    return {
      autoExecuted: summary.byRoute.auto,
      queued: summary.byRoute.queue,
      escalated: summary.byRoute.escalate,
      costIncurred: summary.totalCost,
      revenueGenerated: summary.totalRevenue
    };
  }
  /**
   * Export entries to JSON
   */
  export() {
    return JSON.stringify(this.entries, null, 2);
  }
  /**
   * Import entries from JSON
   */
  import(json) {
    const imported = JSON.parse(json);
    this.entries = [...this.entries, ...imported];
    const seen = /* @__PURE__ */ new Set();
    this.entries = this.entries.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }
};

// src/index.ts
var AutonomySystem = class extends EventEmitter6 {
  router;
  executor;
  approvalQueue;
  notifications;
  auditLogger;
  logger;
  boundaries;
  constructor(config = {}) {
    super();
    this.logger = new Logger("Autonomy");
    this.boundaries = mergeBoundaries(getDefaultBoundaries(), config.boundaries || {});
    this.router = new DecisionRouter(this.boundaries);
    this.executor = new AutoExecutor();
    this.approvalQueue = new ApprovalQueue();
    this.notifications = new NotificationManager(config.notifications);
    this.auditLogger = new AuditLogger();
    this.setupEventHandlers();
    if (config.enableBatching !== false) {
      this.approvalQueue.startBatchTimer();
    }
    this.logger.info("Autonomy System initialized (Level 2)");
  }
  async processAction(action) {
    const fullAction = {
      id: action.id || this.generateId(),
      engine: action.engine,
      type: action.type,
      description: action.description || action.type,
      params: action.params || {},
      risk: action.risk || {
        level: "safe",
        score: 0,
        factors: [],
        estimatedCost: 0,
        maxPotentialLoss: 0,
        reversible: true
      },
      route: "queue",
      status: "pending",
      createdAt: Date.now()
    };
    const route = await this.router.route(fullAction);
    if (route === "auto") {
      const success = await this.executor.execute(fullAction);
      this.auditLogger.log(fullAction, success ? "success" : "failed", fullAction.risk.estimatedCost);
      if (success) this.router.recordExecution(fullAction);
    } else if (route === "queue") {
      this.approvalQueue.add(fullAction, "Requires review");
    }
    return { route, action: fullAction };
  }
  async approveAction(actionId, feedback) {
    const item = this.approvalQueue.get(actionId);
    if (!item) return false;
    this.approvalQueue.approve(actionId, feedback);
    const success = await this.executor.execute(item.action);
    this.auditLogger.log(item.action, success ? "success" : "failed", item.action.risk.estimatedCost);
    return success;
  }
  rejectAction(actionId, feedback) {
    const item = this.approvalQueue.get(actionId);
    if (!item) return false;
    this.approvalQueue.reject(actionId, feedback);
    this.auditLogger.log(item.action, "failed", 0, 0);
    return true;
  }
  getPendingApprovals() {
    return this.approvalQueue.getPending();
  }
  getBatch() {
    return this.approvalQueue.getBatch();
  }
  getBoundaries() {
    return this.boundaries;
  }
  updateBoundaries(newBoundaries) {
    this.boundaries = mergeBoundaries(this.boundaries, newBoundaries);
    this.router.updateBoundaries(this.boundaries);
  }
  getAuditSummary(since) {
    return this.auditLogger.getSummary(since);
  }
  getDailySummary() {
    return this.auditLogger.getDailySummary();
  }
  getQueueStats() {
    return this.approvalQueue.getStats();
  }
  registerActionHandler(actionType, handler) {
    this.executor.registerHandler(actionType, handler);
  }
  setNotificationConfig(config) {
    this.notifications.setConfig(config);
  }
  async sendDailySummary() {
    const summary = this.getDailySummary();
    await this.notifications.sendDailySummary(summary);
  }
  shutdown() {
    this.approvalQueue.stopBatchTimer();
    this.logger.info("Autonomy System shutdown");
  }
  setupEventHandlers() {
    this.router.on("action:auto_approved", (action) => this.emit("action:auto_executed", action));
    this.router.on("action:queued", (action) => this.emit("action:queued", action));
    this.router.on("action:escalated", (action) => {
      this.emit("action:escalated", action);
      this.notifications.escalate(action).catch(() => {
      });
    });
    this.executor.on("executed", (action) => this.emit("action:executed", action));
    this.executor.on("failed", (action, error) => this.emit("action:failed", action, error));
    this.approvalQueue.on("item_approved", (item) => this.emit("action:approved", item.action));
    this.approvalQueue.on("item_rejected", (item) => this.emit("action:rejected", item.action));
    this.approvalQueue.on("batch_ready", (batch) => this.notifications.notifyBatchReady(batch).catch(() => {
    }));
  }
  generateId() {
    return "action-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }
};

export {
  getDefaultBoundaries,
  mergeBoundaries,
  RiskClassifier,
  BoundaryChecker,
  EscalationManager,
  DecisionRouter,
  SafeActions,
  RollbackManager,
  AutoExecutor,
  ApprovalQueue,
  NotificationManager,
  AuditLogger,
  AutonomySystem
};
//# sourceMappingURL=chunk-J6GEFAYH.js.map