# GraphQL Expert
> **ID:** `graphql-expert` | **Tier:** 2 | **Token Cost:** 6000

## What This Skill Does

Provides deep expertise in building production-grade GraphQL APIs with schema design, resolver optimization, type safety, authentication, real-time subscriptions, and federation patterns. Covers Apollo Server 4, GraphQL Yoga, code generation, DataLoader patterns, and integration with databases like Prisma.

**Key Focus Areas:**
- Type-safe schema design with SDL and code-first approaches
- High-performance resolver patterns with DataLoader for N+1 prevention
- Automatic TypeScript code generation from schemas
- Field-level authentication and authorization strategies
- Real-time subscriptions with WebSockets and Server-Sent Events
- Apollo Federation for distributed microservice architectures
- Error handling, validation, and production monitoring

## When to Use

Invoke this skill when:
- Designing GraphQL schemas from scratch or refactoring existing ones
- Implementing resolvers with optimal data fetching patterns
- Setting up GraphQL Code Generator for type safety
- Adding authentication, authorization, or field-level permissions
- Building real-time features with GraphQL subscriptions
- Architecting federated GraphQL microservices
- Debugging N+1 query problems or performance bottlenecks
- Integrating GraphQL with Prisma, TypeORM, or other ORMs
- Implementing file uploads, batching, or caching strategies
- Setting up GraphQL playgrounds, introspection, and documentation

**Do not use this skill for:**
- REST API design
- Basic CRUD operations without type safety requirements
- Simple database queries

## Core Capabilities

### 1. Schema Design

GraphQL schemas define the contract between clients and servers using SDL or code-first approaches.

**Production Schema Pattern:**
- Use non-null (!) for fields that always exist
- Return empty arrays [] instead of null for lists  
- Use Input types for complex mutations
- Implement Relay cursor pagination for infinite scroll
- Use offset pagination for simpler page-numbered lists

**Code-First with TypeGraphQL provides:**
- Full TypeScript type safety
- Automatic schema generation from classes
- Built-in validation with class-validator
- Field resolvers for computed properties
- Decorator-based authorization

### 2. Resolvers & DataLoaders

Resolvers fetch data for fields. DataLoaders batch and cache queries to prevent N+1 problems.

**DataLoader solves the N+1 problem:**
- Without DataLoader: 1 + N queries (1 for users, N for each user's posts)
- With DataLoader: 2 queries (1 for users, 1 batched for all posts)

**DataLoader features:**
- Automatic batching within a single request
- Per-request caching
- Custom cache keys and batch sizes
- One-to-many relationship mapping

**Best practices:**
- Always use DataLoaders in field resolvers
- Create loaders per request in context
- Map results back in requested order
- Initialize empty arrays for missing keys

### 3. Code Generation

GraphQL Code Generator creates TypeScript types from schemas.

**Backend code generation:**
- Resolver types with proper context
- Mapper types to Prisma/TypeORM models
- Custom scalar mappings
- Input/output type safety

**Frontend code generation:**
- Typed React hooks (useQuery, useMutation, useSubscription)
- Operation-specific types
- Fragment types for reuse
- TypedDocumentNode for full inference

**Setup:**
```yaml
schema: 'src/schema/**/*.graphql'
documents: 'src/**/*.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-resolvers
    config:
      contextType: '../types/Context#Context'
      mappers:
        User: '@prisma/client#User'
```

### 4. Authentication & Authorization

**Authentication flow:**
1. Extract JWT from Authorization header
2. Verify token and decode payload
3. Load user from database
4. Add user to context
5. Check permissions in resolvers

**Authorization levels:**
- Resolver-level: @Authorized() or manual checks
- Field-level: Field resolvers with conditional logic
- Directive-level: Custom @auth directive
- Role-based: Hierarchical permission checks

**Best practices:**
- Use stateless JWT tokens
- Store minimal data in token payload
- Implement token refresh mechanism
- Hash passwords with bcrypt (10+ rounds)
- Return same error for invalid email/password

### 5. Subscriptions

GraphQL subscriptions enable real-time updates via WebSockets.

**Server-side pattern:**
1. Create PubSub instance
2. Publish events in mutations
3. Subscribe with topic filters
4. Filter by arguments if needed

**Client-side usage:**
- useSubscription hook auto-manages connection
- Combine with useQuery for initial data
- Handle connection status
- Automatic reconnection on disconnect

**Production considerations:**
- Use Redis PubSub for multi-instance scaling
- Implement subscription authentication
- Rate-limit subscription events
- Clean up subscriptions on disconnect

### 6. Federation

Apollo Federation enables distributed GraphQL architecture.

**Architecture:**
- Gateway: Unified GraphQL endpoint
- Subgraphs: Independent services
- Entities: Types shared across services
- References: Cross-service type resolution

**Federation features:**
- @key directive for entity identification
- @external for fields from other services
- __resolveReference for entity resolution
- Automatic query planning

**When to use Federation:**
- Microservices architecture
- Team boundaries in codebase
- Independent deployment needs
- Service-specific data sources

## Real-World Examples

### Example 1: E-commerce API

**Features:**
- Product catalog with categories
- Shopping cart management
- Order processing
- Inventory tracking
- Review system with ratings

**Key patterns:**
- Money type for currency handling
- Optimistic inventory checks
- Atomic cart operations with upsert
- Order status state machine
- Aggregated rating calculations

### Example 2: Real-time Chat

**Features:**
- Multi-user conversations
- Real-time message delivery
- Read receipts tracking
- Online/offline status
- Typing indicators

**Key patterns:**
- Subscription filtering by conversation
- PubSub for message broadcasting
- User presence management
- Optimistic UI updates
- Message pagination

## Related Skills

- **api-design-expert** - REST API design and best practices
- **typescript-advanced-types** - Advanced TypeScript patterns for type-safe resolvers
- **nodejs-backend-patterns** - Node.js server architecture and middleware
- **database-optimization** - Query optimization and indexing strategies

## Further Reading

- [GraphQL Official Documentation](https://graphql.org/learn/)
- [Apollo Server 4 Documentation](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Yoga Documentation](https://the-guild.dev/graphql/yoga-server)
- [TypeGraphQL Documentation](https://typegraphql.com/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [DataLoader Pattern](https://github.com/graphql/dataloader)
- [Apollo Federation](https://www.apollographql.com/docs/federation/)
- [Production Ready GraphQL](https://book.productionreadygraphql.com/)
