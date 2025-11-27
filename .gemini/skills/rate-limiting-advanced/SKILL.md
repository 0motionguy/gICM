# Advanced Rate Limiting

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Token bucket, leaky bucket, sliding window, and distributed rate limiting patterns.

## Core Concepts

### Token Bucket
Tokens accumulate; requests consume tokens.

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefillTime: number;

  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefillTime = Date.now();
  }

  canConsume(count = 1): boolean {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefillTime) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + timePassed * this.refillRate
    );
    this.lastRefillTime = now;
  }
}
```

### Leaky Bucket
Requests leak out at fixed rate.

```typescript
class LeakyBucket {
  private queue: number[] = [];
  private lastLeakTime: number = Date.now();

  constructor(
    private capacity: number,
    private leakRate: number // requests per second
  ) {}

  canAdd(count = 1): boolean {
    this.leak();
    if (this.queue.length + count <= this.capacity) {
      this.queue.push(...Array(count).fill(Date.now()));
      return true;
    }
    return false;
  }

  private leak(): void {
    const now = Date.now();
    const timePassed = (now - this.lastLeakTime) / 1000;
    const leakCount = Math.floor(timePassed * this.leakRate);
    this.queue.splice(0, leakCount);
    this.lastLeakTime = now;
  }
}
```

### Distributed Rate Limiting
Redis-based for multiple servers.

```typescript
async function rateLimit(
  userId: string,
  limit: number = 100,
  window: number = 60000 // 1 minute
): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, Math.ceil(window / 1000));
  }

  return current <= limit;
}
```

## Best Practices

1. **Multiple Limits**: Implement per-user, per-IP limits
2. **Graceful Degradation**: Queue vs reject
3. **Jitter**: Add randomness to prevent thundering herd
4. **Monitoring**: Track rejection rates
5. **Whitelist**: Important clients get higher limits

## Related Skills

- Caching Strategies & Hierarchies
- Redis Advanced Patterns
- API Gateway Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1012 | **Remixes**: 321
