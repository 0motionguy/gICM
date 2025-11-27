# Command: /api-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> REST/GraphQL/tRPC API endpoint generation with validation and documentation

## Description

The `/api-gen` command generates complete API endpoints with request validation (Zod), error handling, authentication, rate limiting, and OpenAPI/GraphQL documentation.

## Usage

```bash
/api-gen <endpoint> [--type=<type>] [--auth] [--docs]
```

## Arguments

- `endpoint` (required) - Endpoint name (e.g., "users", "payments")
- `--type` - API type: `rest`, `graphql`, `trpc` (default: `rest`)
- `--auth` - Include authentication middleware
- `--docs` - Generate API documentation

## Examples

### Example 1: REST API endpoint
```bash
/api-gen users --type=rest --auth --docs
```
Generates CRUD endpoints for users with auth and OpenAPI docs.

### Example 2: GraphQL resolver
```bash
/api-gen posts --type=graphql
```
Creates GraphQL queries, mutations, and type definitions.

### Example 3: tRPC procedure
```bash
/api-gen payments --type=trpc --auth
```
Generates type-safe tRPC procedures with authentication.

## Generated Components

- Route handlers/resolvers
- Input validation schemas (Zod)
- Error handling middleware
- Rate limiting configuration
- API documentation
- Integration tests

## Related Commands

- `/test-gen` - Generate API tests
- `/security-audit` - Audit API security
- `/doc-generate` - Generate comprehensive API docs
