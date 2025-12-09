/**
 * OPUS 67 - Session Store
 *
 * Provides session persistence across Claude Code sessions.
 * Uses JSON files for simplicity (no additional dependencies).
 *
 * Storage structure:
 * .gicm/
 *   sessions/
 *     current.json        - Current session state
 *     {session_id}.json   - Historical session snapshots
 *   memory-events.jsonl   - Event log (consumed by UnifiedBus)
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
} from "fs";
import { join } from "path";
import type { UnifiedResult, MemorySource } from "../types.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SessionFact {
  id: string;
  content: string;
  type: "fact" | "episode" | "learning" | "win";
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SessionState {
  sessionId: string;
  startedAt: string;
  lastActivity: string;
  context: string;
  facts: SessionFact[];
  summary?: string;
}

export interface SessionStoreConfig {
  projectRoot?: string;
  maxFacts?: number;
  maxSessions?: number;
}

// =============================================================================
// SESSION STORE
// =============================================================================

export class SessionStore {
  private projectRoot: string;
  private sessionsDir: string;
  private maxFacts: number;
  private maxSessions: number;
  private currentSession: SessionState | null = null;

  constructor(config: SessionStoreConfig = {}) {
    this.projectRoot = config.projectRoot || process.cwd();
    this.sessionsDir = join(this.projectRoot, ".gicm", "sessions");
    this.maxFacts = config.maxFacts || 1000;
    this.maxSessions = config.maxSessions || 50;

    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    if (!existsSync(this.sessionsDir)) {
      mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  /**
   * Start a new session or resume existing
   */
  startSession(context: string = ""): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Try to load existing current session
    const existingSession = this.loadCurrentSession();
    if (existingSession) {
      // Archive the old session
      this.archiveSession(existingSession);
    }

    // Create new session
    this.currentSession = {
      sessionId,
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      context,
      facts: [],
    };

    this.saveCurrentSession();
    return sessionId;
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionState | null {
    if (!this.currentSession) {
      this.currentSession = this.loadCurrentSession();
    }
    return this.currentSession;
  }

  /**
   * Add a fact to current session
   */
  addFact(
    content: string,
    type: SessionFact["type"],
    metadata?: Record<string, unknown>,
  ): string {
    if (!this.currentSession) {
      this.startSession();
    }

    const fact: SessionFact = {
      id: `fact_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      content,
      type,
      createdAt: new Date().toISOString(),
      metadata,
    };

    this.currentSession!.facts.push(fact);
    this.currentSession!.lastActivity = new Date().toISOString();

    // Trim if over limit
    if (this.currentSession!.facts.length > this.maxFacts) {
      this.currentSession!.facts = this.currentSession!.facts.slice(
        -this.maxFacts,
      );
    }

    this.saveCurrentSession();
    return fact.id;
  }

  /**
   * Search facts in current session
   */
  search(query: string, limit: number = 10): SessionFact[] {
    const session = this.getCurrentSession();
    if (!session) return [];

    const lowerQuery = query.toLowerCase();
    return session.facts
      .filter((fact) => fact.content.toLowerCase().includes(lowerQuery))
      .slice(-limit);
  }

  /**
   * Search facts across all sessions
   */
  searchAll(query: string, limit: number = 20): SessionFact[] {
    const results: SessionFact[] = [];

    // Search current session first
    const current = this.getCurrentSession();
    if (current) {
      results.push(...this.searchInSession(current, query));
    }

    // Search archived sessions
    const archived = this.listArchivedSessions();
    for (const sessionFile of archived.slice(0, 10)) {
      // Last 10 sessions
      const session = this.loadArchivedSession(sessionFile);
      if (session) {
        results.push(...this.searchInSession(session, query));
      }
    }

    // Sort by recency and limit
    return results
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Get facts as UnifiedResults
   */
  query(query: string, limit: number = 10): UnifiedResult[] {
    const facts = this.searchAll(query, limit);
    return facts.map((fact) => ({
      id: fact.id,
      content: fact.content,
      source: "session" as MemorySource,
      score: this.calculateScore(query, fact.content),
      metadata: {
        type: fact.type,
        createdAt: fact.createdAt,
        ...fact.metadata,
      },
    }));
  }

  /**
   * Calculate simple relevance score
   */
  private calculateScore(query: string, content: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerContent = content.toLowerCase();
    const words = lowerQuery.split(/\s+/);
    const matches = words.filter((word) => lowerContent.includes(word)).length;
    return matches / Math.max(words.length, 1);
  }

  /**
   * Search within a session
   */
  private searchInSession(session: SessionState, query: string): SessionFact[] {
    const lowerQuery = query.toLowerCase();
    return session.facts.filter((fact) =>
      fact.content.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Get session statistics
   */
  getStats(): {
    currentFacts: number;
    totalSessions: number;
    available: boolean;
  } {
    const current = this.getCurrentSession();
    const archived = this.listArchivedSessions();
    return {
      currentFacts: current?.facts.length || 0,
      totalSessions: archived.length + (current ? 1 : 0),
      available: true,
    };
  }

  /**
   * Save current session to disk
   */
  private saveCurrentSession(): void {
    if (!this.currentSession) return;
    const filePath = join(this.sessionsDir, "current.json");
    writeFileSync(filePath, JSON.stringify(this.currentSession, null, 2));
  }

  /**
   * Load current session from disk
   */
  private loadCurrentSession(): SessionState | null {
    const filePath = join(this.sessionsDir, "current.json");
    if (!existsSync(filePath)) return null;

    try {
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content) as SessionState;
    } catch {
      return null;
    }
  }

  /**
   * Archive a session
   */
  private archiveSession(session: SessionState): void {
    const fileName = `${session.sessionId}.json`;
    const filePath = join(this.sessionsDir, fileName);
    writeFileSync(filePath, JSON.stringify(session, null, 2));

    // Cleanup old sessions
    this.cleanupOldSessions();
  }

  /**
   * Load an archived session
   */
  private loadArchivedSession(fileName: string): SessionState | null {
    const filePath = join(this.sessionsDir, fileName);
    if (!existsSync(filePath)) return null;

    try {
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content) as SessionState;
    } catch {
      return null;
    }
  }

  /**
   * List archived sessions (sorted by newest first)
   */
  private listArchivedSessions(): string[] {
    if (!existsSync(this.sessionsDir)) return [];

    return readdirSync(this.sessionsDir)
      .filter((f) => f.startsWith("session_") && f.endsWith(".json"))
      .sort()
      .reverse();
  }

  /**
   * Cleanup old sessions beyond maxSessions
   */
  private cleanupOldSessions(): void {
    const sessions = this.listArchivedSessions();
    if (sessions.length <= this.maxSessions) return;

    const toDelete = sessions.slice(this.maxSessions);
    for (const fileName of toDelete) {
      try {
        unlinkSync(join(this.sessionsDir, fileName));
      } catch {
        // Silent fail
      }
    }
  }

  /**
   * Update session summary
   */
  setSummary(summary: string): void {
    if (!this.currentSession) return;
    this.currentSession.summary = summary;
    this.saveCurrentSession();
  }
}

// =============================================================================
// FACTORY
// =============================================================================

let globalSessionStore: SessionStore | null = null;

export function createSessionStore(config?: SessionStoreConfig): SessionStore {
  globalSessionStore = new SessionStore(config);
  return globalSessionStore;
}

export function getSessionStore(): SessionStore | null {
  return globalSessionStore;
}

export default SessionStore;
