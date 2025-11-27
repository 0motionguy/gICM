# gRPC Communication

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> High-performance RPC with protocol buffers, streaming, and service mesh integration.

## Quick Reference

gRPC framework mastery: protocol buffer definitions, service interfaces, client/server/bidirectional streaming, interceptors, load balancing, and service mesh integration.

## Core Concepts

### Protocol Buffers
Efficient binary serialization format.

```protobuf
syntax = "proto3";

service UserService {
  rpc GetUser(UserId) returns (User) {}
  rpc ListUsers(Empty) returns (stream User) {}
  rpc CreateUser(CreateUserRequest) returns (User) {}
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

### Streaming Patterns
gRPC supports four streaming patterns.

```typescript
// Unary
const user = await client.getUser({ id: 'user-123' });

// Server streaming
const stream = client.listUsers({});
stream.on('data', (user) => console.log(user));

// Client streaming
const uploadStream = client.uploadFiles();
uploadStream.write({ data: buffer1 });
uploadStream.write({ data: buffer2 });
const result = await uploadStream.end();

// Bidirectional
const chat = client.chat();
chat.on('data', (msg) => console.log(msg));
chat.write({ text: 'Hello' });
```

### Interceptors
Cross-cutting concerns like logging, authentication, tracing.

```typescript
function authInterceptor(
  request: any,
  metadata: grpc.Metadata,
  next: Function
): void {
  const token = getAuthToken();
  metadata.add('authorization', `Bearer ${token}`);
  next(null, request, metadata);
}
```

## Best Practices

1. **Proto Versioning**: Version APIs in proto definitions
2. **Streaming**: Use streaming for large datasets
3. **Error Handling**: Define clear error codes
4. **Timeouts**: Set appropriate client timeouts
5. **Load Balancing**: Use gRPC load balancing

## Related Skills

- Service Mesh (Istio)
- Distributed Tracing
- Load Balancing Strategies
- API Gateway Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 876 | **Remixes**: 267
