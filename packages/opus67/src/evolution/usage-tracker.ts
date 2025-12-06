/**
 * OPUS 67 Usage Tracker
 * Non-intrusive tracking of skill/mode/agent/mcp usage
 */

import { EventEmitter } from 'eventemitter3';
import { existsSync, mkdirSync, appendFileSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import {
  UsageEvent,
  UsageSession,
  EntityType,
  InvocationTrigger,
  UsageTrackerConfig,
  generateId,
  hashTask,
  truncate,
  DEFAULT_EVOLUTION_CONFIG,
} from './types.js';

// =============================================================================
// TYPES
// =============================================================================

interface TrackerEvents {
  'event:tracked': (event: UsageEvent) => void;
  'session:started': (session: UsageSession) => void;
  'session:ended': (session: UsageSession) => void;
  'flush:complete': (count: number) => void;
  'error': (error: Error) => void;
}

interface TrackOptions {
  trigger?: InvocationTrigger;
  taskContext?: string;
  metadata?: Record<string, unknown>;
  durationMs?: number;
}

// =============================================================================
// USAGE TRACKER
// =============================================================================

export class UsageTracker extends EventEmitter<TrackerEvents> {
  private config: UsageTrackerConfig;
  private buffer: UsageEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private currentSession: UsageSession | null = null;
  private eventsToday = 0;
  private lastEventDate: string | null = null;

  constructor(config?: Partial<UsageTrackerConfig>) {
    super();
    this.config = { ...DEFAULT_EVOLUTION_CONFIG.usageTracker, ...config };
    this.ensureStorageDir();
    this.startFlushInterval();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir(): void {
    const dir = this.config.storageLocation;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Start the flush interval
   */
  private startFlushInterval(): void {
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      this.flush().catch(e => this.emit('error', e));
    }, this.config.flushIntervalMs);
  }

  /**
   * Stop the flush interval
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Final flush
    this.flush().catch(console.error);
  }

  /**
   * Start a new tracking session
   */
  startSession(taskSummary?: string): UsageSession {
    // End previous session if exists
    if (this.currentSession) {
      this.endSession();
    }

    const session: UsageSession = {
      id: generateId('session'),
      startedAt: new Date().toISOString(),
      usageEventIds: [],
      outcomeSignals: [],
      taskSummary: taskSummary ? truncate(taskSummary, 500) : undefined,
    };

    this.currentSession = session;
    this.emit('session:started', session);

    return session;
  }

  /**
   * End the current session
   */
  endSession(outcome?: UsageSession['outcome']): UsageSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endedAt = new Date().toISOString();
    if (outcome) {
      this.currentSession.outcome = outcome;
    }

    const session = this.currentSession;
    this.currentSession = null;
    this.emit('session:ended', session);

    // Store session
    this.storeSession(session);

    return session;
  }

  /**
   * Get current session
   */
  getCurrentSession(): UsageSession | null {
    return this.currentSession;
  }

  /**
   * Track a skill usage
   */
  trackSkill(skillId: string, skillName: string, options?: TrackOptions): UsageEvent {
    return this.track('skill', skillId, skillName, options);
  }

  /**
   * Track a mode switch
   */
  trackMode(modeId: string, modeName: string, options?: TrackOptions): UsageEvent {
    return this.track('mode', modeId, modeName, options);
  }

  /**
   * Track an agent invocation
   */
  trackAgent(agentId: string, agentName: string, options?: TrackOptions): UsageEvent {
    return this.track('agent', agentId, agentName, options);
  }

  /**
   * Track an MCP connection
   */
  trackMCP(mcpId: string, mcpName: string, options?: TrackOptions): UsageEvent {
    return this.track('mcp', mcpId, mcpName, options);
  }

  /**
   * Generic track method
   */
  track(
    type: EntityType,
    entityId: string,
    entityName: string,
    options: TrackOptions = {}
  ): UsageEvent {
    if (!this.config.enabled) {
      // Return dummy event when disabled
      return {
        id: 'disabled',
        timestamp: new Date().toISOString(),
        type,
        entityId,
        entityName,
        trigger: 'auto',
        taskContext: '',
        taskHash: '',
        sessionId: '',
        metadata: {},
      };
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    if (this.lastEventDate !== today) {
      this.eventsToday = 0;
      this.lastEventDate = today;
    }

    if (this.eventsToday >= this.config.maxEventsPerDay) {
      console.warn('[UsageTracker] Daily event limit reached');
      return {
        id: 'limit_reached',
        timestamp: new Date().toISOString(),
        type,
        entityId,
        entityName,
        trigger: options.trigger ?? 'auto',
        taskContext: '',
        taskHash: '',
        sessionId: this.currentSession?.id ?? '',
        metadata: {},
      };
    }

    const taskContext = this.config.trackContext && options.taskContext
      ? truncate(options.taskContext, this.config.contextMaxLength)
      : '';

    const event: UsageEvent = {
      id: generateId('usage'),
      timestamp: new Date().toISOString(),
      type,
      entityId,
      entityName,
      trigger: options.trigger ?? 'auto',
      taskContext,
      taskHash: hashTask(taskContext || entityId),
      sessionId: this.currentSession?.id ?? '',
      durationMs: options.durationMs,
      metadata: options.metadata ?? {},
    };

    // Add to buffer
    this.buffer.push(event);
    this.eventsToday++;

    // Add to current session
    if (this.currentSession) {
      this.currentSession.usageEventIds.push(event.id);
    }

    this.emit('event:tracked', event);

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush().catch(e => this.emit('error', e));
    }

    return event;
  }

  /**
   * Flush buffered events to storage
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const toWrite = [...this.buffer];
    this.buffer = [];

    const today = new Date().toISOString().split('T')[0];
    const logFile = join(this.config.storageLocation, `${today}.jsonl`);

    try {
      const lines = toWrite.map(e => JSON.stringify(e)).join('\n') + '\n';
      appendFileSync(logFile, lines, 'utf-8');
      this.emit('flush:complete', toWrite.length);
    } catch (error) {
      // Put events back in buffer on failure
      this.buffer.unshift(...toWrite);
      throw error;
    }
  }

  /**
   * Store a session
   */
  private storeSession(session: UsageSession): void {
    const sessionsDir = join(dirname(this.config.storageLocation), 'sessions');
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }

    const month = new Date().toISOString().slice(0, 7);
    const logFile = join(sessionsDir, `${month}.jsonl`);

    try {
      appendFileSync(logFile, JSON.stringify(session) + '\n', 'utf-8');
    } catch (error) {
      console.error('[UsageTracker] Failed to store session:', error);
    }
  }

  /**
   * Read events for a date
   */
  readEvents(date: string): UsageEvent[] {
    const logFile = join(this.config.storageLocation, `${date}.jsonl`);

    if (!existsSync(logFile)) {
      return [];
    }

    const content = readFileSync(logFile, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line) as UsageEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is UsageEvent => e !== null);
  }

  /**
   * Read events for date range
   */
  readEventsRange(startDate: string, endDate: string): UsageEvent[] {
    const events: UsageEvent[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0];
      events.push(...this.readEvents(date));
    }

    return events;
  }

  /**
   * Get recent events (last N days)
   */
  getRecentEvents(days: number = 7): UsageEvent[] {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return this.readEventsRange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
  }

  /**
   * Read sessions for a month
   */
  readSessions(month: string): UsageSession[] {
    const sessionsDir = join(dirname(this.config.storageLocation), 'sessions');
    const logFile = join(sessionsDir, `${month}.jsonl`);

    if (!existsSync(logFile)) {
      return [];
    }

    const content = readFileSync(logFile, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line) as UsageSession;
        } catch {
          return null;
        }
      })
      .filter((s): s is UsageSession => s !== null);
  }

  /**
   * Get available log dates
   */
  getAvailableDates(): string[] {
    if (!existsSync(this.config.storageLocation)) {
      return [];
    }

    return readdirSync(this.config.storageLocation)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => f.replace('.jsonl', ''))
      .sort();
  }

  /**
   * Get stats for an entity
   */
  getEntityStats(entityId: string, days: number = 30): {
    totalUsage: number;
    byTrigger: Record<InvocationTrigger, number>;
    recentTrend: 'up' | 'down' | 'stable';
  } {
    const events = this.getRecentEvents(days).filter(e => e.entityId === entityId);

    const byTrigger: Record<InvocationTrigger, number> = {
      auto: 0,
      manual: 0,
      bundle: 0,
      council: 0,
    };

    for (const event of events) {
      byTrigger[event.trigger]++;
    }

    // Calculate trend (last 7 days vs previous 7)
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const recentCount = events.filter(e => new Date(e.timestamp).getTime() > weekAgo).length;
    const previousCount = events.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t > twoWeeksAgo && t <= weekAgo;
    }).length;

    let recentTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentCount > previousCount * 1.2) recentTrend = 'up';
    else if (recentCount < previousCount * 0.8) recentTrend = 'down';

    return {
      totalUsage: events.length,
      byTrigger,
      recentTrend,
    };
  }

  /**
   * Get co-occurrence stats (entities used together)
   */
  getCoOccurrence(days: number = 30): Map<string, Map<string, number>> {
    const sessions = this.readSessions(new Date().toISOString().slice(0, 7));
    const events = this.getRecentEvents(days);

    // Group events by session
    const eventsBySession = new Map<string, UsageEvent[]>();
    for (const event of events) {
      if (!event.sessionId) continue;
      if (!eventsBySession.has(event.sessionId)) {
        eventsBySession.set(event.sessionId, []);
      }
      eventsBySession.get(event.sessionId)!.push(event);
    }

    // Count co-occurrences
    const coOccurrence = new Map<string, Map<string, number>>();

    for (const [_, sessionEvents] of eventsBySession) {
      const entityIds = [...new Set(sessionEvents.map(e => e.entityId))];

      for (let i = 0; i < entityIds.length; i++) {
        for (let j = i + 1; j < entityIds.length; j++) {
          const a = entityIds[i];
          const b = entityIds[j];

          if (!coOccurrence.has(a)) coOccurrence.set(a, new Map());
          if (!coOccurrence.has(b)) coOccurrence.set(b, new Map());

          coOccurrence.get(a)!.set(b, (coOccurrence.get(a)!.get(b) ?? 0) + 1);
          coOccurrence.get(b)!.set(a, (coOccurrence.get(b)!.get(a) ?? 0) + 1);
        }
      }
    }

    return coOccurrence;
  }
}

// =============================================================================
// FACTORY & SINGLETON
// =============================================================================

export function createUsageTracker(config?: Partial<UsageTrackerConfig>): UsageTracker {
  return new UsageTracker(config);
}

export const usageTracker = new UsageTracker();
