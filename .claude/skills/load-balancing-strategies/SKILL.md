---
name: load-balancing-strategies
description: "Round-robin, least connections, consistent hashing and advanced load balancing techniques."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Load Balancing Strategies

> Round-robin, least connections, consistent hashing and advanced load balancing techniques.

## Core Concepts

### Round Robin
Simple sequential distribution.

```typescript
class RoundRobinBalancer {
  private currentIndex = 0;

  select(servers: Server[]): Server {
    const server = servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % servers.length;
    return server;
  }
}
```

### Least Connections
Route to server with fewest active connections.

```typescript
class LeastConnectionsBalancer {
  select(servers: Server[]): Server {
    return servers.reduce((least, current) =>
      current.activeConnections < least.activeConnections
        ? current
        : least
    );
  }
}
```

### Consistent Hashing
Minimize disruption on server changes.

```typescript
class ConsistentHash {
  private ring: Map<number, Server> = new Map();

  add(server: Server): void {
    for (let i = 0; i < 160; i++) {
      const hash = this.hash(`${server.id}-${i}`);
      this.ring.set(hash, server);
    }
  }

  get(key: string): Server {
    const hash = this.hash(key);
    const sorted = Array.from(this.ring.keys()).sort((a, b) => a - b);
    const ring_key = sorted.find(k => k >= hash) || sorted[0];
    return this.ring.get(ring_key)!;
  }

  private hash(str: string): number {
    // MurmurHash implementation
    return /* hash */;
  }
}
```

### Health-Based Routing
Route only to healthy servers.

```typescript
class HealthAwareBalancer {
  async select(servers: Server[]): Promise<Server> {
    const healthy = await Promise.all(
      servers.map(async (s) => ({
        server: s,
        healthy: await this.isHealthy(s)
      }))
    );

    return healthy
      .filter(h => h.healthy)
      .map(h => h.server)[Math.floor(Math.random() * healthy.length)];
  }

  private async isHealthy(server: Server): Promise<boolean> {
    try {
      const response = await fetch(`http://${server.host}:${server.port}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

## Best Practices

1. **Sticky Sessions**: Use for stateful applications
2. **Health Checks**: Regular health verification
3. **Timeout Handling**: Set appropriate connection timeouts
4. **Monitoring**: Track load distribution
5. **Graceful Shutdown**: Handle server removal

## Related Skills

- Service Mesh (Istio)
- Circuit Breaker Patterns
- Distributed Tracing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 765 | **Remixes**: 212
