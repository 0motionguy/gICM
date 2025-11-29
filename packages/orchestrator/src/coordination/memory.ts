import type { MemoryEntry } from "../types.js";

export class SharedMemory {
  private store: Map<string, MemoryEntry> = new Map();
  private maxEntries: number;
  private defaultTTL: number;

  constructor(config: { maxEntries?: number; defaultTTL?: number } = {}) {
    this.maxEntries = config.maxEntries ?? 1000;
    this.defaultTTL = config.defaultTTL ?? 3600000; // 1 hour default
  }

  set(
    key: string,
    value: unknown,
    options: { ttl?: number; tags?: string[] } = {}
  ): void {
    // Evict if at capacity
    if (this.store.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.store.set(key, {
      key,
      value,
      timestamp: new Date(),
      ttl: options.ttl ?? this.defaultTTL,
      tags: options.tags ?? [],
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check TTL
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  getByTag(tag: string): MemoryEntry[] {
    const results: MemoryEntry[] = [];

    for (const entry of this.store.values()) {
      if (this.isExpired(entry)) {
        this.store.delete(entry.key);
        continue;
      }

      if (entry.tags.includes(tag)) {
        results.push(entry);
      }
    }

    return results;
  }

  deleteByTag(tag: string): number {
    let deleted = 0;

    for (const entry of this.store.values()) {
      if (entry.tags.includes(tag)) {
        this.store.delete(entry.key);
        deleted++;
      }
    }

    return deleted;
  }

  private isExpired(entry: MemoryEntry): boolean {
    if (!entry.ttl) return false;
    const age = Date.now() - entry.timestamp.getTime();
    return age > entry.ttl;
  }

  private evictOldest(): void {
    let oldest: MemoryEntry | null = null;

    for (const entry of this.store.values()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = entry;
      }
    }

    if (oldest) {
      this.store.delete(oldest.key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    // Clean up expired entries first
    for (const entry of this.store.values()) {
      if (this.isExpired(entry)) {
        this.store.delete(entry.key);
      }
    }
    return this.store.size;
  }

  // Get all keys matching a pattern
  keys(pattern?: string): string[] {
    const allKeys = Array.from(this.store.keys());

    if (!pattern) return allKeys;

    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return allKeys.filter((key) => regex.test(key));
  }

  // Context helpers for workflows
  setWorkflowContext(
    workflowId: string,
    stepId: string,
    data: unknown
  ): void {
    this.set(`workflow:${workflowId}:${stepId}`, data, {
      tags: ["workflow", workflowId],
      ttl: 3600000, // 1 hour
    });
  }

  getWorkflowContext<T>(workflowId: string, stepId: string): T | null {
    return this.get<T>(`workflow:${workflowId}:${stepId}`);
  }

  clearWorkflowContext(workflowId: string): number {
    return this.deleteByTag(workflowId);
  }

  // Agent state helpers
  setAgentState(agentId: string, state: unknown): void {
    this.set(`agent:${agentId}:state`, state, {
      tags: ["agent", agentId],
    });
  }

  getAgentState<T>(agentId: string): T | null {
    return this.get<T>(`agent:${agentId}:state`);
  }

  // Conversation/session context
  setSessionContext(sessionId: string, key: string, value: unknown): void {
    this.set(`session:${sessionId}:${key}`, value, {
      tags: ["session", sessionId],
      ttl: 7200000, // 2 hours
    });
  }

  getSessionContext<T>(sessionId: string, key: string): T | null {
    return this.get<T>(`session:${sessionId}:${key}`);
  }

  // Cache helpers
  cached<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const existing = this.get<T>(key);
    if (existing !== null) {
      return Promise.resolve(existing);
    }

    return factory().then((value) => {
      this.set(key, value, { ttl });
      return value;
    });
  }
}
