# API Gateway Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Routing, authentication, rate limiting, service aggregation, and API composition.

## Core Concepts

### Request Routing
Route requests to backend services.

```typescript
class APIGateway {
  private routes = [
    { path: '/api/users/:id', service: 'user-service' },
    { path: '/api/orders/:id', service: 'order-service' },
    { path: '/api/products', service: 'product-service' }
  ];

  async handleRequest(req: Request): Promise<Response> {
    const route = this.findRoute(req.path);
    const backendUrl = this.getServiceUrl(route.service);
    return fetch(`${backendUrl}${req.path}`);
  }

  private findRoute(path: string) {
    return this.routes.find(r => this.pathMatches(r.path, path));
  }
}
```

### Protocol Translation
Convert between HTTP, gRPC, WebSocket.

```typescript
class ProtocolAdapter {
  async translateToBackend(
    frontendRequest: Request
  ): Promise<BackendRequest> {
    if (frontendRequest.headers['accept'] === 'application/grpc') {
      return this.httpToGrpc(frontendRequest);
    }
    return frontendRequest;
  }

  private httpToGrpc(req: Request): BackendRequest {
    // Convert HTTP request to gRPC call
    const service = req.headers['grpc-service'];
    const method = req.headers['grpc-method'];
    return grpc.client(service).method(method).call(req.body);
  }
}
```

### Authentication & Authorization
Centralized auth enforcement.

```typescript
class AuthMiddleware {
  async authenticate(req: Request): Promise<void> {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedError();

    const user = await this.verifyToken(token);
    req.user = user;
  }

  async authorize(req: Request, requiredScopes: string[]): Promise<void> {
    if (!requiredScopes.every(scope => req.user.scopes.includes(scope))) {
      throw new ForbiddenError();
    }
  }
}
```

### Service Aggregation
Combine multiple backend responses.

```typescript
class ServiceAggregator {
  async getOrderDetails(orderId: string) {
    const [order, user, items] = await Promise.all([
      this.callService('order-service', `/orders/${orderId}`),
      this.callService('user-service', `/users/${orderId}`),
      this.callService('inventory-service', `/order-items/${orderId}`)
    ]);

    return { order, user, items };
  }
}
```

## Best Practices

1. **Caching**: Cache routing decisions
2. **Circuit Breaker**: Handle backend failures
3. **Timeout**: Set per-service timeouts
4. **Logging**: Log all requests and responses
5. **Rate Limiting**: Protect backend services

## Related Skills

- Load Balancing Strategies
- Circuit Breaker Patterns
- Distributed Tracing

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1178 | **Remixes**: 378
