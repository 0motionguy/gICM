/**
 * OPUS 67 - Memory Event Consumer
 *
 * Processes events from .gicm/memory-events.jsonl (written by hooks)
 * and feeds them into UnifiedMemory.
 *
 * Event flow:
 * Hooks (post-bash.js, session-start.js)
 *   → memory-bridge.js writes to memory-events.jsonl
 *   → MemoryEventConsumer reads and processes into UnifiedMemory
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import type { UnifiedMemory } from "./unified-memory.js";
import type { SessionStore } from "./adapters/session-store.js";

// =============================================================================
// TYPES
// =============================================================================

export interface MemoryEvent {
  type: "episode" | "fact" | "learning" | "win";
  action?: string;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  source: string;
  sessionId?: string;
}

export interface EventConsumerConfig {
  projectRoot?: string;
  eventsFile?: string;
  processedFile?: string;
  batchSize?: number;
}

export interface ConsumeResult {
  processed: number;
  errors: number;
  events: MemoryEvent[];
}

// =============================================================================
// MEMORY EVENT CONSUMER
// =============================================================================

export class MemoryEventConsumer {
  private projectRoot: string;
  private eventsFile: string;
  private processedFile: string;
  private batchSize: number;

  constructor(config: EventConsumerConfig = {}) {
    this.projectRoot = config.projectRoot || process.cwd();
    this.eventsFile =
      config.eventsFile ||
      join(this.projectRoot, ".gicm", "memory-events.jsonl");
    this.processedFile =
      config.processedFile ||
      join(this.projectRoot, ".gicm", "processed-events.log");
    this.batchSize = config.batchSize || 100;
  }

  /**
   * Check if there are events to consume
   */
  hasEvents(): boolean {
    if (!existsSync(this.eventsFile)) return false;
    try {
      const content = readFileSync(this.eventsFile, "utf-8").trim();
      return content.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Read all events from the events file
   */
  readEvents(): MemoryEvent[] {
    if (!existsSync(this.eventsFile)) return [];

    try {
      const content = readFileSync(this.eventsFile, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());

      return lines
        .map((line) => {
          try {
            return JSON.parse(line) as MemoryEvent;
          } catch {
            console.warn(
              "[EventConsumer] Failed to parse line:",
              line.slice(0, 50),
            );
            return null;
          }
        })
        .filter((e): e is MemoryEvent => e !== null);
    } catch (error) {
      console.error("[EventConsumer] Failed to read events:", error);
      return [];
    }
  }

  /**
   * Consume events into UnifiedMemory
   */
  async consume(memory: UnifiedMemory): Promise<ConsumeResult> {
    const events = this.readEvents();
    if (events.length === 0) {
      return { processed: 0, errors: 0, events: [] };
    }

    let processed = 0;
    let errors = 0;

    for (const event of events.slice(0, this.batchSize)) {
      try {
        await memory.write({
          type: event.type,
          content: event.content,
          key: event.action || `${event.type}:${event.timestamp}`,
          metadata: {
            ...event.metadata,
            source: event.source,
            sessionId: event.sessionId,
            eventTimestamp: event.timestamp,
          },
        });
        processed++;
      } catch (error) {
        console.error("[EventConsumer] Failed to process event:", error);
        errors++;
      }
    }

    // Clear processed events
    if (processed > 0) {
      this.clearProcessedEvents(processed);
    }

    console.log(
      `[EventConsumer] Processed ${processed} events, ${errors} errors`,
    );

    return { processed, errors, events: events.slice(0, processed) };
  }

  /**
   * Consume events into SessionStore (for session-specific facts)
   */
  consumeToSession(sessionStore: SessionStore): ConsumeResult {
    const events = this.readEvents();
    if (events.length === 0) {
      return { processed: 0, errors: 0, events: [] };
    }

    let processed = 0;
    let errors = 0;

    for (const event of events.slice(0, this.batchSize)) {
      try {
        sessionStore.addFact(event.content, event.type, {
          action: event.action,
          ...event.metadata,
        });
        processed++;
      } catch (error) {
        console.error("[EventConsumer] Failed to add to session:", error);
        errors++;
      }
    }

    // Clear processed events
    if (processed > 0) {
      this.clearProcessedEvents(processed);
    }

    return { processed, errors, events: events.slice(0, processed) };
  }

  /**
   * Clear events that have been processed
   */
  private clearProcessedEvents(count: number): void {
    try {
      const events = this.readEvents();
      const remaining = events.slice(count);

      if (remaining.length === 0) {
        // Delete the file if no events remain
        if (existsSync(this.eventsFile)) {
          unlinkSync(this.eventsFile);
        }
      } else {
        // Write remaining events back
        const content =
          remaining.map((e) => JSON.stringify(e)).join("\n") + "\n";
        writeFileSync(this.eventsFile, content);
      }

      // Log processed count
      const logEntry = `${new Date().toISOString()} - Processed ${count} events\n`;
      writeFileSync(this.processedFile, logEntry, { flag: "a" });
    } catch (error) {
      console.error("[EventConsumer] Failed to clear events:", error);
    }
  }

  /**
   * Get stats about pending events
   */
  getStats(): { pending: number; eventsFile: string } {
    const events = this.readEvents();
    return {
      pending: events.length,
      eventsFile: this.eventsFile,
    };
  }
}

// =============================================================================
// FACTORY
// =============================================================================

let globalConsumer: MemoryEventConsumer | null = null;

export function createEventConsumer(
  config?: EventConsumerConfig,
): MemoryEventConsumer {
  globalConsumer = new MemoryEventConsumer(config);
  return globalConsumer;
}

export function getEventConsumer(): MemoryEventConsumer | null {
  return globalConsumer;
}

export default MemoryEventConsumer;
