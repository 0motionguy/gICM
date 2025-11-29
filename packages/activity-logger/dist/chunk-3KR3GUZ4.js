// src/db/sqlite.ts
import Database from "better-sqlite3";
import { createHash, randomUUID } from "crypto";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
var MIGRATIONS = [
  // Migration 1: Initial schema
  `
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    input_data TEXT,
    output_data TEXT,
    reasoning TEXT,
    confidence REAL,
    parent_id TEXT,
    workflow_id TEXT,
    agent_id TEXT,
    solana_tx_hash TEXT,
    arweave_tx_id TEXT,
    content_hash TEXT,
    FOREIGN KEY (parent_id) REFERENCES activities(id)
  );

  CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
  CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
  CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_activities_workflow ON activities(workflow_id);

  CREATE TABLE IF NOT EXISTS discoveries (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL,
    source TEXT NOT NULL,
    source_id TEXT,
    source_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    author_url TEXT,
    relevance_score REAL,
    trend_score REAL,
    quality_score REAL,
    category TEXT,
    tags TEXT,
    language TEXT,
    stars INTEGER,
    forks INTEGER,
    open_issues INTEGER,
    last_commit DATETIME,
    license TEXT,
    hn_points INTEGER,
    hn_comments INTEGER,
    likes INTEGER,
    reposts INTEGER,
    analyzed BOOLEAN DEFAULT FALSE,
    decision_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (decision_id) REFERENCES decisions(id)
  );

  CREATE INDEX IF NOT EXISTS idx_discoveries_source ON discoveries(source);
  CREATE INDEX IF NOT EXISTS idx_discoveries_analyzed ON discoveries(analyzed);

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL,
    discovery_id TEXT,
    scores TEXT NOT NULL,
    total_score REAL NOT NULL,
    reasoning TEXT NOT NULL,
    summary TEXT,
    risk_level TEXT,
    risk_factors TEXT,
    recommendation TEXT NOT NULL,
    recommended_priority INTEGER,
    estimated_effort TEXT,
    requires_approval BOOLEAN DEFAULT TRUE,
    approval_status TEXT DEFAULT 'pending',
    approved_by TEXT,
    approved_at DATETIME,
    approval_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (discovery_id) REFERENCES discoveries(id)
  );

  CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(approval_status);
  CREATE INDEX IF NOT EXISTS idx_decisions_score ON decisions(total_score DESC);

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL,
    target TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    status TEXT DEFAULT 'queued',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_at DATETIME,
    processed_at DATETIME,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  );

  CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
  CREATE INDEX IF NOT EXISTS idx_sync_queue_target ON sync_queue(target);

  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO migrations (id) VALUES (1);
  `
];
var SQLiteDB = class {
  db;
  dbPath;
  constructor(dbPath) {
    this.dbPath = dbPath ?? this.getDefaultDbPath();
    this.ensureDirectory();
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.runMigrations();
  }
  getDefaultDbPath() {
    const homeDir = os.homedir();
    const gicmDir = path.join(homeDir, ".gicm");
    return path.join(gicmDir, "orchestrator.db");
  }
  ensureDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  runMigrations() {
    const currentVersion = this.getCurrentMigrationVersion();
    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
      this.db.exec(MIGRATIONS[i]);
    }
  }
  getCurrentMigrationVersion() {
    try {
      const result = this.db.prepare("SELECT MAX(id) as version FROM migrations").get();
      return result?.version ?? 0;
    } catch {
      return 0;
    }
  }
  // Activity methods
  createActivity(input) {
    const id = randomUUID();
    const createdAt = /* @__PURE__ */ new Date();
    const contentHash = this.computeHash(input);
    const stmt = this.db.prepare(`
      INSERT INTO activities (
        id, type, status, created_at, input_data, output_data,
        reasoning, confidence, parent_id, workflow_id, agent_id, content_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      input.type,
      input.status,
      createdAt.toISOString(),
      input.inputData ? JSON.stringify(input.inputData) : null,
      input.outputData ? JSON.stringify(input.outputData) : null,
      input.reasoning ?? null,
      input.confidence ?? null,
      input.parentId ?? null,
      input.workflowId ?? null,
      input.agentId ?? null,
      contentHash
    );
    return {
      ...input,
      id,
      createdAt,
      contentHash
    };
  }
  getActivity(id) {
    const row = this.db.prepare("SELECT * FROM activities WHERE id = ?").get(id);
    return row ? this.rowToActivity(row) : null;
  }
  updateActivity(id, updates) {
    const setClauses = ["updated_at = CURRENT_TIMESTAMP"];
    const params = [];
    if (updates.status !== void 0) {
      setClauses.push("status = ?");
      params.push(updates.status);
    }
    if (updates.outputData !== void 0) {
      setClauses.push("output_data = ?");
      params.push(JSON.stringify(updates.outputData));
    }
    if (updates.reasoning !== void 0) {
      setClauses.push("reasoning = ?");
      params.push(updates.reasoning);
    }
    if (updates.solanaTxHash !== void 0) {
      setClauses.push("solana_tx_hash = ?");
      params.push(updates.solanaTxHash);
    }
    if (updates.arweaveTxId !== void 0) {
      setClauses.push("arweave_tx_id = ?");
      params.push(updates.arweaveTxId);
    }
    if (updates.completedAt !== void 0) {
      setClauses.push("completed_at = ?");
      params.push(updates.completedAt.toISOString());
    }
    params.push(id);
    this.db.prepare(`UPDATE activities SET ${setClauses.join(", ")} WHERE id = ?`).run(...params);
  }
  listActivities(options) {
    const conditions = [];
    const params = [];
    if (options.type) {
      conditions.push("type = ?");
      params.push(options.type);
    }
    if (options.status) {
      conditions.push("status = ?");
      params.push(options.status);
    }
    if (options.since) {
      conditions.push("created_at >= ?");
      params.push(options.since.toISOString());
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    const rows = this.db.prepare(
      `SELECT * FROM activities ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);
    return rows.map((row) => this.rowToActivity(row));
  }
  // Discovery methods
  createDiscovery(activityId, input) {
    const id = randomUUID();
    const createdAt = /* @__PURE__ */ new Date();
    const stmt = this.db.prepare(`
      INSERT INTO discoveries (
        id, activity_id, source, source_id, source_url, title, description,
        author, author_url, relevance_score, trend_score, quality_score,
        category, tags, language, stars, forks, open_issues, last_commit,
        license, hn_points, hn_comments, likes, reposts, analyzed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      activityId,
      input.source,
      input.sourceId ?? null,
      input.sourceUrl,
      input.title,
      input.description ?? null,
      input.author ?? null,
      input.authorUrl ?? null,
      input.relevanceScore ?? null,
      input.trendScore ?? null,
      input.qualityScore ?? null,
      input.category ?? null,
      JSON.stringify(input.tags),
      input.language ?? null,
      input.stars ?? null,
      input.forks ?? null,
      input.openIssues ?? null,
      input.lastCommit?.toISOString() ?? null,
      input.license ?? null,
      input.hnPoints ?? null,
      input.hnComments ?? null,
      input.likes ?? null,
      input.reposts ?? null,
      input.analyzed ? 1 : 0,
      createdAt.toISOString()
    );
    return {
      ...input,
      id,
      activityId,
      createdAt
    };
  }
  getDiscovery(id) {
    const row = this.db.prepare("SELECT * FROM discoveries WHERE id = ?").get(id);
    return row ? this.rowToDiscovery(row) : null;
  }
  listDiscoveries(options) {
    const conditions = [];
    const params = [];
    if (options.source) {
      conditions.push("source = ?");
      params.push(options.source);
    }
    if (options.analyzed !== void 0) {
      conditions.push("analyzed = ?");
      params.push(options.analyzed ? 1 : 0);
    }
    if (options.minRelevance !== void 0) {
      conditions.push("relevance_score >= ?");
      params.push(options.minRelevance);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = options.limit ?? 50;
    const rows = this.db.prepare(
      `SELECT * FROM discoveries ${whereClause} ORDER BY created_at DESC LIMIT ?`
    ).all(...params, limit);
    return rows.map((row) => this.rowToDiscovery(row));
  }
  markDiscoveryAnalyzed(id, decisionId) {
    this.db.prepare(
      "UPDATE discoveries SET analyzed = TRUE, decision_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(decisionId, id);
  }
  // Decision methods
  createDecision(activityId, input) {
    const id = randomUUID();
    const createdAt = /* @__PURE__ */ new Date();
    const stmt = this.db.prepare(`
      INSERT INTO decisions (
        id, activity_id, discovery_id, scores, total_score, reasoning,
        summary, risk_level, risk_factors, recommendation, recommended_priority,
        estimated_effort, requires_approval, approval_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      activityId,
      input.discoveryId ?? null,
      JSON.stringify(input.scores),
      input.totalScore,
      input.reasoning,
      input.summary ?? null,
      input.riskLevel ?? null,
      JSON.stringify(input.riskFactors),
      input.recommendation,
      input.recommendedPriority ?? null,
      input.estimatedEffort ?? null,
      input.requiresApproval ? 1 : 0,
      input.approvalStatus,
      createdAt.toISOString()
    );
    return {
      ...input,
      id,
      activityId,
      createdAt
    };
  }
  getDecision(id) {
    const row = this.db.prepare("SELECT * FROM decisions WHERE id = ?").get(id);
    return row ? this.rowToDecision(row) : null;
  }
  listPendingDecisions() {
    const rows = this.db.prepare(
      "SELECT * FROM decisions WHERE approval_status = 'pending' ORDER BY total_score DESC"
    ).all();
    return rows.map((row) => this.rowToDecision(row));
  }
  approveDecision(id, approvedBy, reason) {
    this.db.prepare(
      `UPDATE decisions SET
          approval_status = 'approved',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          approval_reason = ?
        WHERE id = ?`
    ).run(approvedBy, reason ?? null, id);
  }
  rejectDecision(id, approvedBy, reason) {
    this.db.prepare(
      `UPDATE decisions SET
          approval_status = 'rejected',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          approval_reason = ?
        WHERE id = ?`
    ).run(approvedBy, reason, id);
  }
  // Sync queue methods
  enqueueSyncItem(activityId, target, content, priority = 0) {
    const id = randomUUID();
    const contentStr = JSON.stringify(content);
    const contentHash = this.computeHash(content);
    const createdAt = /* @__PURE__ */ new Date();
    this.db.prepare(
      `INSERT INTO sync_queue (id, activity_id, target, priority, content, content_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, activityId, target, priority, contentStr, contentHash, createdAt.toISOString());
    return {
      id,
      activityId,
      target,
      priority,
      content: contentStr,
      contentHash,
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt
    };
  }
  getNextSyncItems(target, limit = 10) {
    const rows = this.db.prepare(
      `SELECT * FROM sync_queue
         WHERE target = ? AND status = 'queued' AND retry_count < max_retries
         ORDER BY priority DESC, created_at ASC LIMIT ?`
    ).all(target, limit);
    return rows.map((row) => this.rowToSyncQueueItem(row));
  }
  updateSyncItemStatus(id, status, errorMessage) {
    if (status === "failed") {
      this.db.prepare(
        `UPDATE sync_queue SET
            status = ?,
            retry_count = retry_count + 1,
            error_message = ?
          WHERE id = ?`
      ).run(status, errorMessage ?? null, id);
    } else {
      this.db.prepare(
        `UPDATE sync_queue SET
            status = ?,
            processed_at = CURRENT_TIMESTAMP
          WHERE id = ?`
      ).run(status, id);
    }
  }
  // Stats
  getStats() {
    const activityCount = this.db.prepare("SELECT COUNT(*) as count FROM activities").get();
    const discoveryCount = this.db.prepare("SELECT COUNT(*) as count FROM discoveries").get();
    const pendingCount = this.db.prepare(
      "SELECT COUNT(*) as count FROM decisions WHERE approval_status = 'pending'"
    ).get();
    const solanaSyncCount = this.db.prepare(
      "SELECT COUNT(*) as count FROM sync_queue WHERE target = 'solana' AND status = 'queued'"
    ).get();
    const arweaveSyncCount = this.db.prepare(
      "SELECT COUNT(*) as count FROM sync_queue WHERE target = 'arweave' AND status = 'queued'"
    ).get();
    return {
      activities: activityCount.count,
      discoveries: discoveryCount.count,
      pendingDecisions: pendingCount.count,
      syncQueue: {
        solana: solanaSyncCount.count,
        arweave: arweaveSyncCount.count
      }
    };
  }
  // Helpers
  computeHash(data) {
    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }
  rowToActivity(row) {
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : void 0,
      completedAt: row.completed_at ? new Date(row.completed_at) : void 0,
      inputData: row.input_data ? JSON.parse(row.input_data) : void 0,
      outputData: row.output_data ? JSON.parse(row.output_data) : void 0,
      reasoning: row.reasoning ?? void 0,
      confidence: row.confidence ?? void 0,
      parentId: row.parent_id ?? void 0,
      workflowId: row.workflow_id ?? void 0,
      agentId: row.agent_id ?? void 0,
      solanaTxHash: row.solana_tx_hash ?? void 0,
      arweaveTxId: row.arweave_tx_id ?? void 0,
      contentHash: row.content_hash ?? void 0
    };
  }
  rowToDiscovery(row) {
    return {
      id: row.id,
      activityId: row.activity_id,
      source: row.source,
      sourceId: row.source_id ?? void 0,
      sourceUrl: row.source_url,
      title: row.title,
      description: row.description ?? void 0,
      author: row.author ?? void 0,
      authorUrl: row.author_url ?? void 0,
      relevanceScore: row.relevance_score ?? void 0,
      trendScore: row.trend_score ?? void 0,
      qualityScore: row.quality_score ?? void 0,
      category: row.category ?? void 0,
      tags: row.tags ? JSON.parse(row.tags) : [],
      language: row.language ?? void 0,
      stars: row.stars ?? void 0,
      forks: row.forks ?? void 0,
      openIssues: row.open_issues ?? void 0,
      lastCommit: row.last_commit ? new Date(row.last_commit) : void 0,
      license: row.license ?? void 0,
      hnPoints: row.hn_points ?? void 0,
      hnComments: row.hn_comments ?? void 0,
      likes: row.likes ?? void 0,
      reposts: row.reposts ?? void 0,
      analyzed: !!row.analyzed,
      decisionId: row.decision_id ?? void 0,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : void 0
    };
  }
  rowToDecision(row) {
    return {
      id: row.id,
      activityId: row.activity_id,
      discoveryId: row.discovery_id ?? void 0,
      scores: JSON.parse(row.scores),
      totalScore: row.total_score,
      reasoning: row.reasoning,
      summary: row.summary ?? void 0,
      riskLevel: row.risk_level,
      riskFactors: row.risk_factors ? JSON.parse(row.risk_factors) : [],
      recommendation: row.recommendation,
      recommendedPriority: row.recommended_priority ?? void 0,
      estimatedEffort: row.estimated_effort ?? void 0,
      requiresApproval: !!row.requires_approval,
      approvalStatus: row.approval_status,
      approvedBy: row.approved_by ?? void 0,
      approvedAt: row.approved_at ? new Date(row.approved_at) : void 0,
      approvalReason: row.approval_reason ?? void 0,
      createdAt: new Date(row.created_at)
    };
  }
  rowToSyncQueueItem(row) {
    return {
      id: row.id,
      activityId: row.activity_id,
      target: row.target,
      priority: row.priority,
      content: row.content,
      contentHash: row.content_hash,
      status: row.status,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message ?? void 0,
      createdAt: new Date(row.created_at),
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : void 0,
      processedAt: row.processed_at ? new Date(row.processed_at) : void 0
    };
  }
  close() {
    this.db.close();
  }
};

export {
  SQLiteDB
};
//# sourceMappingURL=chunk-3KR3GUZ4.js.map