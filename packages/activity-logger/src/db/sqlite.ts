import Database from "better-sqlite3";
import { createHash, randomUUID } from "crypto";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import type {
  Activity,
  ActivityStatus,
  ActivityType,
  CreateActivityInput,
  CreateDecisionInput,
  CreateDiscoveryInput,
  Decision,
  DecisionStatus,
  Discovery,
  SyncQueueItem,
  SyncStatus,
  SyncTarget,
} from "../types.js";

const MIGRATIONS = [
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
  `,
];

export class SQLiteDB {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath ?? this.getDefaultDbPath();
    this.ensureDirectory();
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.runMigrations();
  }

  private getDefaultDbPath(): string {
    const homeDir = os.homedir();
    const gicmDir = path.join(homeDir, ".gicm");
    return path.join(gicmDir, "orchestrator.db");
  }

  private ensureDirectory(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private runMigrations(): void {
    const currentVersion = this.getCurrentMigrationVersion();

    for (let i = currentVersion; i < MIGRATIONS.length; i++) {
      this.db.exec(MIGRATIONS[i]);
    }
  }

  private getCurrentMigrationVersion(): number {
    try {
      const result = this.db
        .prepare("SELECT MAX(id) as version FROM migrations")
        .get() as { version: number | null };
      return result?.version ?? 0;
    } catch {
      return 0;
    }
  }

  // Activity methods
  createActivity(input: CreateActivityInput): Activity {
    const id = randomUUID();
    const createdAt = new Date();
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
      contentHash,
    };
  }

  getActivity(id: string): Activity | null {
    const row = this.db
      .prepare("SELECT * FROM activities WHERE id = ?")
      .get(id) as ActivityRow | undefined;

    return row ? this.rowToActivity(row) : null;
  }

  updateActivity(
    id: string,
    updates: Partial<
      Pick<
        Activity,
        | "status"
        | "outputData"
        | "reasoning"
        | "solanaTxHash"
        | "arweaveTxId"
        | "completedAt"
      >
    >
  ): void {
    const setClauses: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: unknown[] = [];

    if (updates.status !== undefined) {
      setClauses.push("status = ?");
      params.push(updates.status);
    }
    if (updates.outputData !== undefined) {
      setClauses.push("output_data = ?");
      params.push(JSON.stringify(updates.outputData));
    }
    if (updates.reasoning !== undefined) {
      setClauses.push("reasoning = ?");
      params.push(updates.reasoning);
    }
    if (updates.solanaTxHash !== undefined) {
      setClauses.push("solana_tx_hash = ?");
      params.push(updates.solanaTxHash);
    }
    if (updates.arweaveTxId !== undefined) {
      setClauses.push("arweave_tx_id = ?");
      params.push(updates.arweaveTxId);
    }
    if (updates.completedAt !== undefined) {
      setClauses.push("completed_at = ?");
      params.push(updates.completedAt.toISOString());
    }

    params.push(id);

    this.db
      .prepare(`UPDATE activities SET ${setClauses.join(", ")} WHERE id = ?`)
      .run(...params);
  }

  listActivities(options: {
    type?: ActivityType;
    status?: ActivityStatus;
    limit?: number;
    offset?: number;
    since?: Date;
  }): Activity[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    const rows = this.db
      .prepare(
        `SELECT * FROM activities ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as ActivityRow[];

    return rows.map((row) => this.rowToActivity(row));
  }

  // Discovery methods
  createDiscovery(activityId: string, input: CreateDiscoveryInput): Discovery {
    const id = randomUUID();
    const createdAt = new Date();

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
      createdAt,
    };
  }

  getDiscovery(id: string): Discovery | null {
    const row = this.db
      .prepare("SELECT * FROM discoveries WHERE id = ?")
      .get(id) as DiscoveryRow | undefined;

    return row ? this.rowToDiscovery(row) : null;
  }

  listDiscoveries(options: {
    source?: string;
    analyzed?: boolean;
    limit?: number;
    minRelevance?: number;
  }): Discovery[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.source) {
      conditions.push("source = ?");
      params.push(options.source);
    }
    if (options.analyzed !== undefined) {
      conditions.push("analyzed = ?");
      params.push(options.analyzed ? 1 : 0);
    }
    if (options.minRelevance !== undefined) {
      conditions.push("relevance_score >= ?");
      params.push(options.minRelevance);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = options.limit ?? 50;

    const rows = this.db
      .prepare(
        `SELECT * FROM discoveries ${whereClause} ORDER BY created_at DESC LIMIT ?`
      )
      .all(...params, limit) as DiscoveryRow[];

    return rows.map((row) => this.rowToDiscovery(row));
  }

  markDiscoveryAnalyzed(id: string, decisionId: string): void {
    this.db
      .prepare(
        "UPDATE discoveries SET analyzed = TRUE, decision_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .run(decisionId, id);
  }

  // Decision methods
  createDecision(activityId: string, input: CreateDecisionInput): Decision {
    const id = randomUUID();
    const createdAt = new Date();

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
      createdAt,
    };
  }

  getDecision(id: string): Decision | null {
    const row = this.db
      .prepare("SELECT * FROM decisions WHERE id = ?")
      .get(id) as DecisionRow | undefined;

    return row ? this.rowToDecision(row) : null;
  }

  listPendingDecisions(): Decision[] {
    const rows = this.db
      .prepare(
        "SELECT * FROM decisions WHERE approval_status = 'pending' ORDER BY total_score DESC"
      )
      .all() as DecisionRow[];

    return rows.map((row) => this.rowToDecision(row));
  }

  approveDecision(id: string, approvedBy: string, reason?: string): void {
    this.db
      .prepare(
        `UPDATE decisions SET
          approval_status = 'approved',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          approval_reason = ?
        WHERE id = ?`
      )
      .run(approvedBy, reason ?? null, id);
  }

  rejectDecision(id: string, approvedBy: string, reason: string): void {
    this.db
      .prepare(
        `UPDATE decisions SET
          approval_status = 'rejected',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          approval_reason = ?
        WHERE id = ?`
      )
      .run(approvedBy, reason, id);
  }

  // Sync queue methods
  enqueueSyncItem(
    activityId: string,
    target: SyncTarget,
    content: unknown,
    priority: number = 0
  ): SyncQueueItem {
    const id = randomUUID();
    const contentStr = JSON.stringify(content);
    const contentHash = this.computeHash(content);
    const createdAt = new Date();

    this.db
      .prepare(
        `INSERT INTO sync_queue (id, activity_id, target, priority, content, content_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, activityId, target, priority, contentStr, contentHash, createdAt.toISOString());

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
      createdAt,
    };
  }

  getNextSyncItems(target: SyncTarget, limit: number = 10): SyncQueueItem[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM sync_queue
         WHERE target = ? AND status = 'queued' AND retry_count < max_retries
         ORDER BY priority DESC, created_at ASC LIMIT ?`
      )
      .all(target, limit) as SyncQueueRow[];

    return rows.map((row) => this.rowToSyncQueueItem(row));
  }

  updateSyncItemStatus(
    id: string,
    status: SyncStatus,
    errorMessage?: string
  ): void {
    if (status === "failed") {
      this.db
        .prepare(
          `UPDATE sync_queue SET
            status = ?,
            retry_count = retry_count + 1,
            error_message = ?
          WHERE id = ?`
        )
        .run(status, errorMessage ?? null, id);
    } else {
      this.db
        .prepare(
          `UPDATE sync_queue SET
            status = ?,
            processed_at = CURRENT_TIMESTAMP
          WHERE id = ?`
        )
        .run(status, id);
    }
  }

  // Stats
  getStats(): {
    activities: number;
    discoveries: number;
    pendingDecisions: number;
    syncQueue: { solana: number; arweave: number };
  } {
    const activityCount = this.db
      .prepare("SELECT COUNT(*) as count FROM activities")
      .get() as { count: number };

    const discoveryCount = this.db
      .prepare("SELECT COUNT(*) as count FROM discoveries")
      .get() as { count: number };

    const pendingCount = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM decisions WHERE approval_status = 'pending'"
      )
      .get() as { count: number };

    const solanaSyncCount = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM sync_queue WHERE target = 'solana' AND status = 'queued'"
      )
      .get() as { count: number };

    const arweaveSyncCount = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM sync_queue WHERE target = 'arweave' AND status = 'queued'"
      )
      .get() as { count: number };

    return {
      activities: activityCount.count,
      discoveries: discoveryCount.count,
      pendingDecisions: pendingCount.count,
      syncQueue: {
        solana: solanaSyncCount.count,
        arweave: arweaveSyncCount.count,
      },
    };
  }

  // Helpers
  private computeHash(data: unknown): string {
    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  private rowToActivity(row: ActivityRow): Activity {
    return {
      id: row.id,
      type: row.type as ActivityType,
      status: row.status as ActivityStatus,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      inputData: row.input_data ? JSON.parse(row.input_data) : undefined,
      outputData: row.output_data ? JSON.parse(row.output_data) : undefined,
      reasoning: row.reasoning ?? undefined,
      confidence: row.confidence ?? undefined,
      parentId: row.parent_id ?? undefined,
      workflowId: row.workflow_id ?? undefined,
      agentId: row.agent_id ?? undefined,
      solanaTxHash: row.solana_tx_hash ?? undefined,
      arweaveTxId: row.arweave_tx_id ?? undefined,
      contentHash: row.content_hash ?? undefined,
    };
  }

  private rowToDiscovery(row: DiscoveryRow): Discovery {
    return {
      id: row.id,
      activityId: row.activity_id,
      source: row.source as Discovery["source"],
      sourceId: row.source_id ?? undefined,
      sourceUrl: row.source_url,
      title: row.title,
      description: row.description ?? undefined,
      author: row.author ?? undefined,
      authorUrl: row.author_url ?? undefined,
      relevanceScore: row.relevance_score ?? undefined,
      trendScore: row.trend_score ?? undefined,
      qualityScore: row.quality_score ?? undefined,
      category: row.category ?? undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      language: row.language ?? undefined,
      stars: row.stars ?? undefined,
      forks: row.forks ?? undefined,
      openIssues: row.open_issues ?? undefined,
      lastCommit: row.last_commit ? new Date(row.last_commit) : undefined,
      license: row.license ?? undefined,
      hnPoints: row.hn_points ?? undefined,
      hnComments: row.hn_comments ?? undefined,
      likes: row.likes ?? undefined,
      reposts: row.reposts ?? undefined,
      analyzed: !!row.analyzed,
      decisionId: row.decision_id ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  private rowToDecision(row: DecisionRow): Decision {
    return {
      id: row.id,
      activityId: row.activity_id,
      discoveryId: row.discovery_id ?? undefined,
      scores: JSON.parse(row.scores),
      totalScore: row.total_score,
      reasoning: row.reasoning,
      summary: row.summary ?? undefined,
      riskLevel: row.risk_level as Decision["riskLevel"],
      riskFactors: row.risk_factors ? JSON.parse(row.risk_factors) : [],
      recommendation: row.recommendation as Decision["recommendation"],
      recommendedPriority: row.recommended_priority ?? undefined,
      estimatedEffort: row.estimated_effort ?? undefined,
      requiresApproval: !!row.requires_approval,
      approvalStatus: row.approval_status as DecisionStatus,
      approvedBy: row.approved_by ?? undefined,
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      approvalReason: row.approval_reason ?? undefined,
      createdAt: new Date(row.created_at),
    };
  }

  private rowToSyncQueueItem(row: SyncQueueRow): SyncQueueItem {
    return {
      id: row.id,
      activityId: row.activity_id,
      target: row.target as SyncTarget,
      priority: row.priority,
      content: row.content,
      contentHash: row.content_hash,
      status: row.status as SyncStatus,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      errorMessage: row.error_message ?? undefined,
      createdAt: new Date(row.created_at),
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined,
    };
  }

  close(): void {
    this.db.close();
  }
}

// Row type definitions
interface ActivityRow {
  id: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  input_data: string | null;
  output_data: string | null;
  reasoning: string | null;
  confidence: number | null;
  parent_id: string | null;
  workflow_id: string | null;
  agent_id: string | null;
  solana_tx_hash: string | null;
  arweave_tx_id: string | null;
  content_hash: string | null;
}

interface DiscoveryRow {
  id: string;
  activity_id: string;
  source: string;
  source_id: string | null;
  source_url: string;
  title: string;
  description: string | null;
  author: string | null;
  author_url: string | null;
  relevance_score: number | null;
  trend_score: number | null;
  quality_score: number | null;
  category: string | null;
  tags: string | null;
  language: string | null;
  stars: number | null;
  forks: number | null;
  open_issues: number | null;
  last_commit: string | null;
  license: string | null;
  hn_points: number | null;
  hn_comments: number | null;
  likes: number | null;
  reposts: number | null;
  analyzed: number;
  decision_id: string | null;
  created_at: string;
  updated_at: string | null;
}

interface DecisionRow {
  id: string;
  activity_id: string;
  discovery_id: string | null;
  scores: string;
  total_score: number;
  reasoning: string;
  summary: string | null;
  risk_level: string | null;
  risk_factors: string | null;
  recommendation: string;
  recommended_priority: number | null;
  estimated_effort: string | null;
  requires_approval: number;
  approval_status: string;
  approved_by: string | null;
  approved_at: string | null;
  approval_reason: string | null;
  created_at: string;
}

interface SyncQueueRow {
  id: string;
  activity_id: string;
  target: string;
  priority: number;
  content: string;
  content_hash: string;
  status: string;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  created_at: string;
  scheduled_at: string | null;
  processed_at: string | null;
}
