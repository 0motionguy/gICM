import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import type { CostEvent, BudgetPeriod } from "./types.js";

let Database: any = null;

try {
  const imported = await import("better-sqlite3");
  Database = imported.default;
} catch (err) {
  console.warn(
    "[goldfish] better-sqlite3 not available, using in-memory fallback"
  );
}

export class CostDatabase {
  private db: any;
  private dbPath: string;

  constructor(dbPath?: string) {
    if (!Database) {
      // In-memory fallback when better-sqlite3 is not available
      this.dbPath = ":memory:";
      this.db = new Map<string, CostEvent>();
      this.initFallback();
      return;
    }

    this.dbPath = dbPath || join(homedir(), ".openclaw", "gicm", "goldfish.db");

    // Ensure directory exists
    if (this.dbPath !== ":memory:") {
      const dir = this.dbPath.substring(
        0,
        this.dbPath.lastIndexOf("/") || this.dbPath.lastIndexOf("\\")
      );
      mkdirSync(dir, { recursive: true });
    }

    try {
      this.db = new Database(this.dbPath);
      this.db.pragma("journal_mode = WAL");
      this.init();
    } catch (err) {
      // Native bindings may not be compiled — fall back to in-memory Map
      console.warn(
        "[goldfish] better-sqlite3 failed to initialize, using in-memory fallback"
      );
      Database = null;
      this.dbPath = ":memory:";
      this.db = new Map<string, CostEvent>();
      this.initFallback();
    }
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        model TEXT NOT NULL,
        provider TEXT NOT NULL,
        inputTokens INTEGER NOT NULL,
        outputTokens INTEGER NOT NULL,
        cacheReadTokens INTEGER NOT NULL,
        cacheWriteTokens INTEGER NOT NULL,
        cost REAL NOT NULL,
        agentId TEXT NOT NULL,
        sessionId TEXT NOT NULL,
        taskType TEXT NOT NULL,
        tier INTEGER NOT NULL
      )
    `);

    // Create indices for common queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON costs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_agentId ON costs(agentId);
      CREATE INDEX IF NOT EXISTS idx_sessionId ON costs(sessionId);
      CREATE INDEX IF NOT EXISTS idx_model ON costs(model);
    `);
  }

  private initFallback(): void {
    // No-op for fallback mode
  }

  record(event: CostEvent): void {
    if (!Database) {
      // Fallback mode — just store in memory
      const key = `${Date.now()}-${Math.random()}`;
      (this.db as Map<string, CostEvent>).set(key, event);
      return;
    }

    const stmt = this.db.prepare(`
      INSERT INTO costs (
        timestamp, model, provider, inputTokens, outputTokens,
        cacheReadTokens, cacheWriteTokens, cost, agentId, sessionId, taskType, tier
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.timestamp,
      event.model,
      event.provider,
      event.inputTokens,
      event.outputTokens,
      event.cacheReadTokens,
      event.cacheWriteTokens,
      event.cost,
      event.agentId,
      event.sessionId,
      event.taskType,
      event.tier
    );
  }

  getSpend(period: BudgetPeriod, since: Date): number {
    if (!Database) {
      // Fallback mode — sum from memory
      let total = 0;
      for (const event of (this.db as Map<string, CostEvent>).values()) {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= since) {
          total += event.cost;
        }
      }
      return total;
    }

    const stmt = this.db.prepare(`
      SELECT SUM(cost) as total FROM costs WHERE timestamp >= ?
    `);

    const result = stmt.get(since.toISOString());
    return result?.total || 0;
  }

  getSpendByModel(since: Date): Record<string, number> {
    if (!Database) {
      // Fallback mode
      const byModel: Record<string, number> = {};
      for (const event of (this.db as Map<string, CostEvent>).values()) {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= since) {
          byModel[event.model] = (byModel[event.model] || 0) + event.cost;
        }
      }
      return byModel;
    }

    const stmt = this.db.prepare(`
      SELECT model, SUM(cost) as total
      FROM costs
      WHERE timestamp >= ?
      GROUP BY model
    `);

    const rows = stmt.all(since.toISOString());
    const result: Record<string, number> = {};

    for (const row of rows) {
      result[row.model] = row.total;
    }

    return result;
  }

  getSpendByAgent(since: Date): Record<string, number> {
    if (!Database) {
      // Fallback mode
      const byAgent: Record<string, number> = {};
      for (const event of (this.db as Map<string, CostEvent>).values()) {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= since) {
          byAgent[event.agentId] = (byAgent[event.agentId] || 0) + event.cost;
        }
      }
      return byAgent;
    }

    const stmt = this.db.prepare(`
      SELECT agentId, SUM(cost) as total
      FROM costs
      WHERE timestamp >= ?
      GROUP BY agentId
    `);

    const rows = stmt.all(since.toISOString());
    const result: Record<string, number> = {};

    for (const row of rows) {
      result[row.agentId] = row.total;
    }

    return result;
  }

  getHistory(days: number): CostEvent[] {
    const since = new Date();
    since.setDate(since.getDate() - days);

    if (!Database) {
      // Fallback mode
      const history: CostEvent[] = [];
      for (const event of (this.db as Map<string, CostEvent>).values()) {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= since) {
          history.push(event);
        }
      }
      return history.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    const stmt = this.db.prepare(`
      SELECT * FROM costs WHERE timestamp >= ? ORDER BY timestamp ASC
    `);

    const rows = stmt.all(since.toISOString());
    return rows.map((row: any) => ({
      timestamp: row.timestamp,
      model: row.model,
      provider: row.provider,
      inputTokens: row.inputTokens,
      outputTokens: row.outputTokens,
      cacheReadTokens: row.cacheReadTokens,
      cacheWriteTokens: row.cacheWriteTokens,
      cost: row.cost,
      agentId: row.agentId,
      sessionId: row.sessionId,
      taskType: row.taskType,
      tier: row.tier,
    }));
  }

  close(): void {
    if (Database && this.db?.close) {
      this.db.close();
    }
  }

  getPath(): string {
    return this.dbPath;
  }
}
