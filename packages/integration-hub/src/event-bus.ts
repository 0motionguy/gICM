/**
 * Event Bus - Cross-engine pub/sub system
 *
 * Central message bus for all gICM events.
 */

import EventEmitter from "eventemitter3";

// ============================================================================
// EVENT TYPES
// ============================================================================

export type EventCategory =
  | "engine"
  | "brain"
  | "discovery"
  | "build"
  | "content"
  | "trade"
  | "treasury"
  | "pipeline"
  | "opus67"
  | "error";

export interface HubEvent {
  id: string;
  timestamp: number;
  source: string;
  category: EventCategory;
  type: string;
  payload: Record<string, unknown>;
}

export interface EventBusEvents {
  // Engine lifecycle
  "engine.started": (event: HubEvent) => void;
  "engine.stopped": (event: HubEvent) => void;
  "engine.error": (event: HubEvent) => void;
  "engine.heartbeat": (event: HubEvent) => void;

  // Brain events
  "brain.phase_started": (event: HubEvent) => void;
  "brain.phase_completed": (event: HubEvent) => void;
  "brain.decision_made": (event: HubEvent) => void;
  "brain.goal_achieved": (event: HubEvent) => void;

  // Discovery events
  "discovery.found": (event: HubEvent) => void;
  "discovery.approved": (event: HubEvent) => void;
  "discovery.rejected": (event: HubEvent) => void;

  // Build events
  "build.started": (event: HubEvent) => void;
  "build.completed": (event: HubEvent) => void;
  "build.failed": (event: HubEvent) => void;

  // Content events
  "content.published": (event: HubEvent) => void;
  "content.scheduled": (event: HubEvent) => void;

  // Trade events
  "trade.executed": (event: HubEvent) => void;
  "trade.profit": (event: HubEvent) => void;
  "trade.loss": (event: HubEvent) => void;

  // Treasury events
  "treasury.low": (event: HubEvent) => void;
  "treasury.critical": (event: HubEvent) => void;
  "treasury.healthy": (event: HubEvent) => void;

  // Pipeline events (PTC)
  "pipeline.started": (event: HubEvent) => void;
  "pipeline.step_started": (event: HubEvent) => void;
  "pipeline.step_completed": (event: HubEvent) => void;
  "pipeline.step_failed": (event: HubEvent) => void;
  "pipeline.step_skipped": (event: HubEvent) => void;
  "pipeline.completed": (event: HubEvent) => void;
  "pipeline.failed": (event: HubEvent) => void;
  "pipeline.paused": (event: HubEvent) => void;
  "pipeline.resumed": (event: HubEvent) => void;
  "pipeline.cancelled": (event: HubEvent) => void;

  // OPUS67 events
  "opus67.mode_changed": (event: HubEvent) => void;
  "opus67.skills_loaded": (event: HubEvent) => void;
  "opus67.query_processed": (event: HubEvent) => void;
  "opus67.agent_spawned": (event: HubEvent) => void;
  "opus67.boot": (event: HubEvent) => void;

  // Generic catch-all
  "*": (event: HubEvent) => void;
}

// ============================================================================
// EVENT BUS
// ============================================================================

export class EventBus extends EventEmitter<EventBusEvents> {
  private eventLog: HubEvent[] = [];
  private maxLogSize = 1000;

  /**
   * Emit a typed event
   */
  emit<K extends keyof EventBusEvents>(
    event: K,
    ...args: Parameters<EventBusEvents[K]>
  ): boolean {
    const hubEvent = args[0] as HubEvent;

    // Log event
    this.eventLog.push(hubEvent);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    // Emit to specific listeners
    const result = super.emit(event, ...args);

    // Also emit to wildcard listeners
    super.emit("*", hubEvent);

    return result;
  }

  /**
   * Create and emit an event
   */
  publish(
    source: string,
    type: keyof EventBusEvents,
    payload: Record<string, unknown> = {}
  ): void {
    const category = type.split(".")[0] as EventCategory;

    const event: HubEvent = {
      id: generateEventId(),
      timestamp: Date.now(),
      source,
      category,
      type,
      payload,
    };

    this.emit(type, event);
  }

  /**
   * Subscribe to an event (alias for on, but with source filtering support if needed)
   * Currently ignores source for compatibility with simple event names
   */
  subscribe(
    source: string,
    type: keyof EventBusEvents,
    handler: (event: HubEvent) => void
  ): void {
    this.on(type, (event) => {
      // Optional: Filter by source if needed
      // if (event.source === source) { ... }
      handler(event);
    });
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit = 50): HubEvent[] {
    return this.eventLog.slice(-limit);
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: EventCategory, limit = 50): HubEvent[] {
    return this.eventLog
      .filter((e) => e.category === category)
      .slice(-limit);
  }

  /**
   * Clear event log
   */
  clearLog(): void {
    this.eventLog = [];
  }
}

function generateEventId(): string {
  return Date.now().toString() + "-" + Math.random().toString(36).slice(2, 9);
}

// Singleton instance
export const eventBus = new EventBus();
