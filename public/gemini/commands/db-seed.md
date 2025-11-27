# Command: /db-seed

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Database seeding with realistic test data and relation handling

## Description

The `/db-seed` command generates and executes database seed scripts with realistic test data, proper foreign key relationships, and idempotent operations. Supports PostgreSQL, MySQL, MongoDB, and SQLite.

## Usage

```bash
/db-seed [--env=<environment>] [--reset] [--count=<number>]
```

## Arguments

- `--env` - Target environment: `dev`, `test`, `staging` (default: `dev`)
- `--reset` - Drop and recreate database before seeding
- `--count` - Number of records per table (default: 100)

## Examples

### Example 1: Seed development database
```bash
/db-seed --env=dev --count=1000
```
Seeds development database with 1000 records per table.

### Example 2: Reset and seed test database
```bash
/db-seed --env=test --reset
```
Drops test database, recreates, and seeds with test data.

### Example 3: Minimal seed
```bash
/db-seed --count=10
```
Seeds database with minimal data for quick testing.

## Seed Strategies

- **Realistic data**: Uses Faker.js for realistic values
- **Relations**: Maintains referential integrity
- **Idempotent**: Can be run multiple times safely
- **Performance**: Batch inserts for large datasets

## Related Commands

- `/mock-gen` - Generate mock data
- `/migration-gen` - Database migrations
- `/schema-gen` - Database schema generation
