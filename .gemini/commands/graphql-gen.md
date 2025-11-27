# Command: /graphql-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> GraphQL schema, resolver, and type generation with best practices

## Description

The `/graphql-gen` command generates complete GraphQL implementations including schema definitions, resolvers, TypeScript types, DataLoader integration, and subscription support. Supports Apollo, Nexus, and Type-GraphQL.

## Usage

```bash
/graphql-gen <type> [--framework=<framework>] [--subscriptions]
```

## Arguments

- `type` (required) - Type name (e.g., "User", "Post", "Comment")
- `--framework` - Framework: `apollo`, `nexus`, `type-graphql` (default: `apollo`)
- `--subscriptions` - Include WebSocket subscription support

## Examples

### Example 1: Basic type with resolvers
```bash
/graphql-gen User --framework=apollo
```
Generates User type, queries, mutations, and resolvers.

### Example 2: Type with subscriptions
```bash
/graphql-gen Message --subscriptions
```
Creates Message type with real-time subscription support.

### Example 3: Full schema
```bash
/graphql-gen --full-schema
```
Generates complete GraphQL schema for existing models.

## Generated Components

- **Schema**: GraphQL type definitions
- **Resolvers**: Query, mutation, and subscription resolvers
- **Types**: TypeScript type definitions
- **DataLoaders**: N+1 query prevention
- **Tests**: Resolver unit tests

## Related Commands

- `/api-gen` - Generate REST APIs
- `/type-gen` - Generate TypeScript types
- `/test-gen` - Generate resolver tests
