# Caching Strategies & Hierarchies

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Multi-level caching, cache invalidation, L1/L2/L3 cache hierarchies, and cache coherence.

## Core Concepts

### Cache-Aside Pattern
Application loads data from main store and updates cache.

```typescript
async function getUser(id: string): Promise<User> {
  const cached = await cache.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(id);
  await cache.set(`user:${id}`, JSON.stringify(user), 3600);
  return user;
}
```

### Write-Through Pattern
Application writes to both cache and store.

```typescript
async function updateUser(id: string, data: any): Promise<void> {
  await db.users.update(id, data);
  await cache.set(`user:${id}`, JSON.stringify(data));
}
```

### Write-Behind Pattern
Cache updates asynchronously flush to store.

```typescript
class WriteBehindCache {
  private writeQueue: Promise<void> = Promise.resolve();

  async set(key: string, value: any): Promise<void> {
    await cache.set(key, value);
    this.writeQueue = this.writeQueue.then(() =>
      db.set(key, value).catch(console.error)
    );
  }
}
```

### Multi-Tier Caching
L1 (in-process) -> L2 (Redis) -> L3 (DB).

```typescript
class MultiTierCache {
  async get(key: string): Promise<any> {
    // L1: In-process cache
    let value = this.l1Cache.get(key);
    if (value) return value;

    // L2: Redis
    value = await redis.get(key);
    if (value) {
      this.l1Cache.set(key, value);
      return value;
    }

    // L3: Database
    value = await db.get(key);
    if (value) {
      await redis.set(key, value, 300);
      this.l1Cache.set(key, value);
    }
    return value;
  }
}
```

## Best Practices

1. **TTL Strategy**: Different TTLs for different data
2. **Cache Invalidation**: Proper cleanup on updates
3. **Thundering Herd**: Use locks during cold cache
4. **Monitoring**: Track hit rates
5. **Size Limits**: Implement LRU eviction

## Related Skills

- Redis Advanced Patterns
- Data Consistency Patterns
- Performance Optimization

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1345 | **Remixes**: 401
