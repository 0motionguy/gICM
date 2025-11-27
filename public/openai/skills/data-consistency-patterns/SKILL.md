# Data Consistency Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Strong consistency, eventual consistency, CAP theorem, multi-database synchronization strategies.

## Core Concepts

### CAP Theorem
Choose 2 of 3: Consistency, Availability, Partition tolerance.

```
Systems must choose:
- CP: Strong consistency + partition tolerance (e.g., traditional DB)
- AP: Availability + partition tolerance (e.g., eventually consistent)
- CA: Not practical for distributed systems
```

### Strong Consistency
Immediate visibility of updates across all replicas.

```typescript
class StrongConsistencyDB {
  async write(key: string, value: any): Promise<void> {
    // Write to primary
    await primary.write(key, value);
    // Synchronously replicate to replicas
    await Promise.all(replicas.map(r => r.write(key, value)));
  }

  async read(key: string): Promise<any> {
    // Read from primary
    return await primary.read(key);
  }
}
```

### Eventual Consistency
Updates propagate asynchronously to replicas.

```typescript
class EventualConsistencyDB {
  async write(key: string, value: any): Promise<void> {
    // Write locally
    await local.write(key, value);
    // Queue replication asynchronously
    await replicationQueue.add({ op: 'write', key, value });
  }

  async read(key: string): Promise<any> {
    // May return stale data
    return await local.read(key);
  }
}
```

### Read-Your-Writes Consistency
Session-consistent reads for individual users.

```typescript
class ReadYourWritesCache {
  private userWrites = new Map<string, Map<string, any>>();

  async read(userId: string, key: string): Promise<any> {
    // Check user's local writes first
    const userWrites = this.userWrites.get(userId);
    if (userWrites?.has(key)) {
      return userWrites.get(key);
    }
    // Fall back to main store
    return await db.read(key);
  }

  async write(userId: string, key: string, value: any): Promise<void> {
    if (!this.userWrites.has(userId)) {
      this.userWrites.set(userId, new Map());
    }
    this.userWrites.get(userId)!.set(key, value);
    await db.write(key, value);
  }
}
```

## Best Practices

1. **Understand Trade-offs**: Know the consistency guarantee
2. **Conflict Resolution**: Handle concurrent writes
3. **Vector Clocks**: Track causality
4. **Monitoring**: Track inconsistency windows
5. **Testing**: Test failure scenarios

## Related Skills

- Event Sourcing Patterns
- CQRS Implementation
- Distributed Tracing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1178 | **Remixes**: 367
