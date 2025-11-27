# Event Sourcing Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Event-driven architecture: event stores, temporal queries, rebuilding state from events.

## Quick Reference

Event sourcing patterns: append-only event stores, event versioning, snapshot strategies, temporal queries, state rebuilding from events, and audit trail capabilities.

## Core Concepts

### Event Store
The foundation of event sourcing is an immutable, append-only log of all domain events that have occurred in the system.

```typescript
interface Event {
  id: string;
  aggregateId: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  version: number;
}

interface EventStore {
  append(event: Event): Promise<void>;
  getEvents(aggregateId: string): Promise<Event[]>;
  getEventsSince(timestamp: Date): Promise<Event[]>;
}
```

### Event Replay
Rebuilding aggregate state by replaying all events in order.

```typescript
class Account {
  private balance = 0;
  private events: Event[] = [];

  applyEvent(event: Event): void {
    switch (event.type) {
      case 'AccountCreated':
        this.balance = event.data.initialBalance;
        break;
      case 'MoneyDeposited':
        this.balance += event.data.amount;
        break;
      case 'MoneyWithdrawn':
        this.balance -= event.data.amount;
        break;
    }
    this.events.push(event);
  }

  hydrate(events: Event[]): void {
    events.forEach(event => this.applyEvent(event));
  }
}
```

### Snapshots
Snapshots reduce replay time by capturing state at regular intervals.

```typescript
interface Snapshot {
  aggregateId: string;
  version: number;
  state: Record<string, any>;
  timestamp: Date;
}

async function getAggregateState(
  aggregateId: string,
  eventStore: EventStore,
  snapshotStore: SnapshotStore
): Promise<any> {
  const snapshot = await snapshotStore.getLatest(aggregateId);
  const fromVersion = snapshot?.version ?? 0;

  const events = await eventStore.getEvents(aggregateId);
  const relevantEvents = events.filter(e => e.version > fromVersion);

  return {
    ...snapshot?.state,
    events: relevantEvents
  };
}
```

## Best Practices

1. **Event Immutability**: Never modify events after storage
2. **Event Versioning**: Version event schemas for evolution
3. **Snapshot Strategy**: Create snapshots every 100-1000 events
4. **Temporal Queries**: Support queries at specific points in time
5. **Audit Trails**: Maintain complete audit capability

## Integration Guide

```typescript
const eventStore = new PostgresEventStore(db);

// Store events
await eventStore.append({
  id: uuid(),
  aggregateId: 'user-123',
  type: 'UserCreated',
  data: { email: 'user@example.com' },
  timestamp: new Date(),
  version: 1
});

// Replay events
const events = await eventStore.getEvents('user-123');
const user = new User();
events.forEach(event => user.applyEvent(event));
```

## Common Pitfalls

- Storing too much data in each event
- Forgetting to version event schemas
- Not creating snapshots for large event streams
- Missing event handlers for new event types
- Insufficient error handling during replay

## Related Skills

- CQRS Implementation
- Distributed Transactions with Saga
- Event-Driven Architecture
- Data Consistency Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1245 | **Remixes**: 378
