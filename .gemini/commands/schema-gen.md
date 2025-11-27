# Command: /schema-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Database schema generation with ORMs, validation, and migrations

## Description

The `/schema-gen` command generates database schemas from models or vice versa. Supports Prisma, TypeORM, Drizzle, and includes automatic migration generation, type generation, and validation schemas.

## Usage

```bash
/schema-gen <model> [--orm=<orm>] [--relations] [--validate]
```

## Arguments

- `model` (required) - Model name (e.g., "User", "Post", "Order")
- `--orm` - ORM: `prisma`, `typeorm`, `drizzle`, `sequelize` (default: `prisma`)
- `--relations` - Generate relationships and foreign keys
- `--validate` - Generate Zod validation schemas

## Examples

### Example 1: User model with Prisma
```bash
/schema-gen User --orm=prisma --relations --validate
```
Generates User model with relations and Zod schemas.

### Example 2: E-commerce schema
```bash
/schema-gen Order --relations
```
Creates Order model with Product and Customer relations.

### Example 3: Generate from existing database
```bash
/schema-gen --from-db --orm=typeorm
```
Introspects database and generates TypeORM entities.

## Generated Components

- ORM schema/model definitions
- Zod validation schemas
- TypeScript types
- Database migrations
- Seed data templates

## Related Commands

- `/migration-gen` - Generate migrations
- `/api-gen` - Generate API for models
- `/test-gen` - Generate model tests
