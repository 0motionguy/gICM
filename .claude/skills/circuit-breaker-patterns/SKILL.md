---
name: circuit-breaker-patterns
description: "Resilience patterns: circuit breaker, bulkhead, timeout, retry with exponential backoff."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Circuit Breaker Patterns

> Resilience patterns: circuit breaker, bulkhead, timeout, retry with exponential backoff.

## Core Concepts

### Circuit Breaker States
Closed -> Open -> Half-Open cycle.

```typescript
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime: Date | null = null;

  async execute(fn: () => Promise<any>): Promise<any> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new CircuitBreakerOpenError();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    if (this.failureCount > 5) {
      this.state = 'open';
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime.getTime() > 60000;
  }
}
```

### Bulkhead Isolation
Isolate resources to prevent cascade failures.

```typescript
const userServicePool = new ResourcePool(10);
const orderServicePool = new ResourcePool(10);

async function getUser(id: string): Promise<User> {
  return userServicePool.execute(() => fetchUser(id));
}

async function getOrder(id: string): Promise<Order> {
  return orderServicePool.execute(() => fetchOrder(id));
}
```

### Retry Logic
Exponential backoff with jitter.

```typescript
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxAttempts = 3,
  baseDelay = 100
): Promise<any> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Best Practices

1. **Fail Fast**: Quick failure detection
2. **Resource Isolation**: Use bulkheads
3. **Exponential Backoff**: With jitter to prevent thundering herd
4. **Monitoring**: Track circuit breaker state changes
5. **Fallbacks**: Provide degraded service when possible

## Related Skills

- Load Balancing Strategies
- Distributed Tracing
- Event-Driven Architecture

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1456 | **Remixes**: 445
