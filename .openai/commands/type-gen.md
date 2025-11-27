# Command: /type-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> TypeScript type generation from schemas, APIs, and databases

## Description

The `/type-gen` command generates TypeScript types from various sources including JSON schemas, OpenAPI specs, GraphQL schemas, database schemas, and API responses. Ensures type safety across your stack.

## Usage

```bash
/type-gen <source> [--output=<path>] [--strict]
```

## Arguments

- `source` (required) - Source type: `openapi`, `graphql`, `prisma`, `zod`, `json`
- `--output` - Output directory for generated types
- `--strict` - Generate strict types (no any, all optional explicit)

## Examples

### Example 1: Generate types from OpenAPI
```bash
/type-gen openapi --output=src/types/api
```
Generates TypeScript types from OpenAPI specification.

### Example 2: GraphQL schema types
```bash
/type-gen graphql --strict
```
Creates strict types from GraphQL schema.

### Example 3: Prisma database types
```bash
/type-gen prisma --output=src/types/db
```
Generates types from Prisma schema.

## Supported Sources

- **OpenAPI**: REST API specifications
- **GraphQL**: GraphQL schemas and operations
- **Prisma**: Database models and relations
- **Zod**: Runtime validation schemas
- **JSON**: JSON Schema or sample data

## Related Commands

- `/api-gen` - Generate APIs with types
- `/schema-gen` - Generate database schemas
- `/validate-types` - Validate type coverage
