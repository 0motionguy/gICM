/**
 * OPUS 67 v4.0 - SQLite Storage with FTS5
 *
 * Production-grade storage for skill metadata with full-text search.
 * Uses better-sqlite3 for synchronous, fast operations.
 */

// Type declaration for optional dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BetterSqlite3 = any;

import * as fs from "fs";
import * as path from "path";
import type { DeepSkillMetadata } from "./skill-metadata.js";

// Types for SQLite storage
export interface SQLiteConfig {
  dbPath: string;
  enableFTS: boolean;
  cacheSize: number; // KB
  walMode: boolean;
}

export interface SearchResult {
  skillId: string;
  name: string;
  rank: number;
  snippet: string;
}

export interface SkillRow {
  id: string;
  name: string;
  tier: number;
  token_cost: number;
  category: string;
  purpose: string;
  capabilities_json: string;
  what_it_does_json: string;
  what_it_cannot_json: string;
  anti_hallucination_json: string;
  synergies_json: string;
  examples_json: string;
  updated_at: string;
}

// SQL Schema
const SCHEMA = `
-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier INTEGER DEFAULT 3,
  token_cost INTEGER DEFAULT 5000,
  category TEXT,
  purpose TEXT,
  capabilities_json TEXT,
  what_it_does_json TEXT,
  what_it_cannot_json TEXT,
  anti_hallucination_json TEXT,
  synergies_json TEXT,
  examples_json TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
  id,
  name,
  purpose,
  capabilities_text,
  what_it_does_text,
  what_it_cannot_text,
  content='skills',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS skills_ai AFTER INSERT ON skills BEGIN
  INSERT INTO skills_fts(rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.name,
    NEW.purpose,
    NEW.capabilities_json,
    NEW.what_it_does_json,
    NEW.what_it_cannot_json
  );
END;

CREATE TRIGGER IF NOT EXISTS skills_ad AFTER DELETE ON skills BEGIN
  INSERT INTO skills_fts(skills_fts, rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    'delete',
    OLD.rowid,
    OLD.id,
    OLD.name,
    OLD.purpose,
    OLD.capabilities_json,
    OLD.what_it_does_json,
    OLD.what_it_cannot_json
  );
END;

CREATE TRIGGER IF NOT EXISTS skills_au AFTER UPDATE ON skills BEGIN
  INSERT INTO skills_fts(skills_fts, rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    'delete',
    OLD.rowid,
    OLD.id,
    OLD.name,
    OLD.purpose,
    OLD.capabilities_json,
    OLD.what_it_does_json,
    OLD.what_it_cannot_json
  );
  INSERT INTO skills_fts(rowid, id, name, purpose, capabilities_text, what_it_does_text, what_it_cannot_text)
  VALUES (
    NEW.rowid,
    NEW.id,
    NEW.name,
    NEW.purpose,
    NEW.capabilities_json,
    NEW.what_it_does_json,
    NEW.what_it_cannot_json
  );
END;

-- Synergies table
CREATE TABLE IF NOT EXISTS synergies (
  from_skill TEXT NOT NULL,
  to_skill TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('amplifying', 'conflicting', 'redundant')),
  weight REAL DEFAULT 0.8,
  reason TEXT,
  PRIMARY KEY (from_skill, to_skill, type)
);

-- MCP Endpoints table
CREATE TABLE IF NOT EXISTS mcp_endpoints (
  server_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  description TEXT,
  parameters_json TEXT,
  returns TEXT,
  rate_limit TEXT,
  requires_auth INTEGER DEFAULT 0,
  PRIMARY KEY (server_id, tool_name)
);

-- MCP Servers table
CREATE TABLE IF NOT EXISTS mcp_servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  category TEXT,
  anti_hallucination_json TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_tier ON skills(tier);
CREATE INDEX IF NOT EXISTS idx_synergies_from ON synergies(from_skill);
CREATE INDEX IF NOT EXISTS idx_synergies_to ON synergies(to_skill);
CREATE INDEX IF NOT EXISTS idx_mcp_endpoints_server ON mcp_endpoints(server_id);
`;

/**
 * SQLite Store for OPUS 67 Intelligence Layer
 *
 * Note: This is a schema-only implementation. The actual database
 * operations require better-sqlite3 which is an optional dependency.
 * Use the KnowledgeStore class for the unified interface.
 */
export class SQLiteStore {
  private config: SQLiteConfig;
  private db: unknown = null;
  private initialized: boolean = false;

  constructor(config?: Partial<SQLiteConfig>) {
    this.config = {
      dbPath: config?.dbPath || this.getDefaultDbPath(),
      enableFTS: config?.enableFTS ?? true,
      cacheSize: config?.cacheSize || 8192, // 8MB cache
      walMode: config?.walMode ?? true,
    };
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import of better-sqlite3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BetterSqlite3 = (await import("better-sqlite3")) as any;
      const Database = BetterSqlite3.default || BetterSqlite3;

      // Ensure directory exists
      const dbDir = path.dirname(this.config.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database
      this.db = new Database(this.config.dbPath);

      // Configure for performance
      const db = this.db as any;
      if (this.config.walMode) {
        db.pragma("journal_mode = WAL");
      }
      db.pragma(`cache_size = -${this.config.cacheSize}`);
      db.pragma("synchronous = NORMAL");
      db.pragma("temp_store = MEMORY");

      // Create schema
      db.exec(SCHEMA);

      this.initialized = true;
      console.log(`[SQLiteStore] Initialized at ${this.config.dbPath}`);
    } catch (error) {
      console.error("[SQLiteStore] Failed to initialize:", error);
      console.error(
        "[SQLiteStore] Install better-sqlite3: pnpm add better-sqlite3"
      );
      throw error;
    }
  }

  /**
   * Insert or update a skill
   */
  upsertSkill(skill: DeepSkillMetadata): void {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO skills (
        id, name, tier, token_cost, category, purpose,
        capabilities_json, what_it_does_json, what_it_cannot_json,
        anti_hallucination_json, synergies_json, examples_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const category = this.extractCategory(skill.id);

    stmt.run(
      skill.id,
      skill.name || skill.id,
      skill.tier || 3,
      skill.token_cost || 5000,
      category,
      skill.semantic.purpose,
      JSON.stringify(skill.capabilities || []),
      JSON.stringify(skill.semantic.what_it_does || []),
      JSON.stringify(skill.semantic.what_it_cannot || []),
      JSON.stringify(skill.anti_hallucination || []),
      JSON.stringify(skill.synergies || {}),
      JSON.stringify(skill.examples || [])
    );
  }

  /**
   * Get skill by ID
   */
  getSkill(skillId: string): DeepSkillMetadata | null {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    const row = db.prepare("SELECT * FROM skills WHERE id = ?").get(skillId) as
      | SkillRow
      | undefined;

    if (!row) return null;

    return this.rowToMetadata(row);
  }

  /**
   * Full-text search skills
   */
  searchSkills(query: string, limit: number = 10): SearchResult[] {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;

    // Use FTS5 match with BM25 ranking
    const results = db
      .prepare(
        `
      SELECT
        skills.id as skillId,
        skills.name,
        bm25(skills_fts) as rank,
        snippet(skills_fts, 2, '<mark>', '</mark>', '...', 32) as snippet
      FROM skills_fts
      JOIN skills ON skills.id = skills_fts.id
      WHERE skills_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `
      )
      .all(query, limit);

    return results as SearchResult[];
  }

  /**
   * Get all skills
   */
  getAllSkills(): DeepSkillMetadata[] {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    const rows = db.prepare("SELECT * FROM skills").all() as SkillRow[];

    return rows.map((row) => this.rowToMetadata(row));
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): DeepSkillMetadata[] {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    const rows = db
      .prepare("SELECT * FROM skills WHERE category = ?")
      .all(category) as SkillRow[];

    return rows.map((row) => this.rowToMetadata(row));
  }

  /**
   * Insert synergy
   */
  insertSynergy(
    fromSkill: string,
    toSkill: string,
    type: "amplifying" | "conflicting" | "redundant",
    weight: number = 0.8,
    reason?: string
  ): void {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    db.prepare(
      `
      INSERT OR REPLACE INTO synergies (from_skill, to_skill, type, weight, reason)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(fromSkill, toSkill, type, weight, reason || null);
  }

  /**
   * Get synergies for a skill
   */
  getSynergies(skillId: string): Array<{
    toSkill: string;
    type: string;
    weight: number;
    reason: string | null;
  }> {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    return db
      .prepare(
        `
      SELECT to_skill as toSkill, type, weight, reason
      FROM synergies
      WHERE from_skill = ?
    `
      )
      .all(skillId);
  }

  /**
   * Insert MCP server
   */
  insertMCPServer(server: {
    id: string;
    name: string;
    version?: string;
    description: string;
    category: string;
    antiHallucination?: string[];
  }): void {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    db.prepare(
      `
      INSERT OR REPLACE INTO mcp_servers (id, name, version, description, category, anti_hallucination_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(
      server.id,
      server.name,
      server.version || null,
      server.description,
      server.category,
      JSON.stringify(server.antiHallucination || [])
    );
  }

  /**
   * Insert MCP endpoint
   */
  insertMCPEndpoint(
    serverId: string,
    endpoint: {
      name: string;
      description: string;
      parameters: unknown[];
      returns: string;
      rateLimit?: string;
      requiresAuth?: boolean;
    }
  ): void {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    db.prepare(
      `
      INSERT OR REPLACE INTO mcp_endpoints (
        server_id, tool_name, description, parameters_json, returns, rate_limit, requires_auth
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      serverId,
      endpoint.name,
      endpoint.description,
      JSON.stringify(endpoint.parameters),
      endpoint.returns,
      endpoint.rateLimit || null,
      endpoint.requiresAuth ? 1 : 0
    );
  }

  /**
   * Search MCP tools
   */
  searchMCPTools(query: string): Array<{
    serverId: string;
    toolName: string;
    description: string;
  }> {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;
    return db
      .prepare(
        `
      SELECT server_id as serverId, tool_name as toolName, description
      FROM mcp_endpoints
      WHERE tool_name LIKE ? OR description LIKE ?
      LIMIT 20
    `
      )
      .all(`%${query}%`, `%${query}%`);
  }

  /**
   * Get database statistics
   */
  getStats(): {
    skillCount: number;
    synergyCount: number;
    mcpServerCount: number;
    mcpEndpointCount: number;
    dbSizeKB: number;
  } {
    if (!this.db) throw new Error("Database not initialized");

    const db = this.db as any;

    const skillCount = db
      .prepare("SELECT COUNT(*) as count FROM skills")
      .get().count;
    const synergyCount = db
      .prepare("SELECT COUNT(*) as count FROM synergies")
      .get().count;
    const mcpServerCount = db
      .prepare("SELECT COUNT(*) as count FROM mcp_servers")
      .get().count;
    const mcpEndpointCount = db
      .prepare("SELECT COUNT(*) as count FROM mcp_endpoints")
      .get().count;

    // Get file size
    let dbSizeKB = 0;
    try {
      const stats = fs.statSync(this.config.dbPath);
      dbSizeKB = Math.round(stats.size / 1024);
    } catch {
      // File might not exist yet
    }

    return {
      skillCount,
      synergyCount,
      mcpServerCount,
      mcpEndpointCount,
      dbSizeKB,
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      (this.db as any).close();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * Convert database row to metadata object
   */
  private rowToMetadata(row: SkillRow): DeepSkillMetadata {
    return {
      id: row.id,
      name: row.name,
      tier: row.tier,
      token_cost: row.token_cost,
      semantic: {
        purpose: row.purpose,
        what_it_does: JSON.parse(row.what_it_does_json || "[]"),
        what_it_cannot: JSON.parse(row.what_it_cannot_json || "[]"),
      },
      capabilities: JSON.parse(row.capabilities_json || "[]"),
      anti_hallucination: JSON.parse(row.anti_hallucination_json || "[]"),
      synergies: JSON.parse(row.synergies_json || "{}"),
      examples: JSON.parse(row.examples_json || "[]"),
    };
  }

  /**
   * Extract category from skill ID
   */
  private extractCategory(skillId: string): string {
    const categoryMap: Record<string, string> = {
      solana: "blockchain",
      anchor: "blockchain",
      bonding: "blockchain",
      jupiter: "blockchain",
      evm: "blockchain",
      smart: "blockchain",
      token: "blockchain",
      defi: "blockchain",
      wallet: "blockchain",
      helius: "blockchain",
      nextjs: "frontend",
      react: "frontend",
      tailwind: "frontend",
      shadcn: "frontend",
      framer: "frontend",
      vibe: "frontend",
      zustand: "frontend",
      tanstack: "frontend",
      responsive: "frontend",
      nodejs: "backend",
      api: "backend",
      database: "backend",
      redis: "backend",
      graphql: "backend",
      websocket: "backend",
      fastify: "backend",
      docker: "devops",
      kubernetes: "devops",
      ci: "devops",
      aws: "devops",
      test: "devops",
      typescript: "core",
      javascript: "core",
    };

    const firstWord = skillId.split("-")[0].toLowerCase();
    return categoryMap[firstWord] || "other";
  }

  /**
   * Get default database path
   */
  private getDefaultDbPath(): string {
    return path.join(
      path.dirname(
        new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")
      ),
      "../../data/opus67.db"
    );
  }
}

// Singleton
let instance: SQLiteStore | null = null;

export function getSQLiteStore(): SQLiteStore {
  if (!instance) {
    instance = new SQLiteStore();
  }
  return instance;
}

export function resetSQLiteStore(): void {
  if (instance) {
    instance.close();
  }
  instance = null;
}
