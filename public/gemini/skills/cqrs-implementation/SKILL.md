# CQRS Implementation

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Command Query Responsibility Segregation: separate read and write models for scalability.

## Core Concepts

### Command Side (Write Model)
Handles all mutations to system state through explicit commands.

```typescript
interface Command {
  id: string;
  type: string;
  aggregateId: string;
  data: Record<string, any>;
}

class CommandBus {
  async execute(command: Command): Promise<void> {
    const handler = this.handlers.get(command.type);
    await handler(command);
    // Emit domain events
  }
}
```

### Query Side (Read Model)
Maintains denormalized data structures optimized for queries.

```typescript
interface ReadModel {
  getUserProfile(userId: string): Promise<UserProfile>;
  getRecentOrders(userId: string): Promise<Order[]>;
  searchProducts(query: string): Promise<Product[]>;
}
```

### Eventual Consistency
Read models eventually sync with write model through event handlers.

```typescript
class UserReadModelSynchronizer {
  async onUserCreated(event: UserCreated): Promise<void> {
    await readModelDb.users.insert({
      id: event.userId,
      name: event.name,
      email: event.email,
      createdAt: event.timestamp
    });
  }
}
```

## Best Practices

1. **Separate Databases**: Use different databases for read and write models
2. **Event Synchronization**: Use events to sync read models
3. **Idempotent Handlers**: Ensure read model handlers are idempotent
4. **Consistency Windows**: Document acceptable staleness
5. **Monitoring**: Track synchronization lag

## Related Skills

- Event Sourcing Patterns
- Saga Pattern Implementation
- Event-Driven Architecture
- Data Consistency Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 987 | **Remixes**: 301
