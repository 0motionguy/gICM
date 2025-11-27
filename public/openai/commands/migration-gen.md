# Command: /migration-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Database migration generation with rollback support and validation

## Description

The `/migration-gen` command generates type-safe database migrations based on schema changes. Supports PostgreSQL, MySQL, MongoDB, and includes automatic rollback generation and data migration scripts.

## Usage

```bash
/migration-gen <description> [--type=<type>] [--validate]
```

## Arguments

- `description` (required) - Migration description (e.g., "add-user-roles")
- `--type` - Migration type: `schema`, `data`, `both` (default: `schema`)
- `--validate` - Validate migration before applying

## Examples

### Example 1: Schema migration
```bash
/migration-gen add-user-roles --validate
```
Generates migration to add user roles table with validation.

### Example 2: Data migration
```bash
/migration-gen migrate-old-users --type=data
```
Creates data migration to transform existing user records.

### Example 3: Combined migration
```bash
/migration-gen restructure-orders --type=both
```
Generates both schema and data migration for order restructuring.

## Best Practices

- **Descriptive names**: Use clear migration descriptions
- **Test rollbacks**: Always test down migrations
- **Backup data**: Create backups before running migrations
- **Version control**: Commit migrations to version control

## Related Commands

- `/db-schema` - View current database schema
- `/db-seed` - Generate seed data
- `/deploy-prepare-release` - Include migrations in deployment
