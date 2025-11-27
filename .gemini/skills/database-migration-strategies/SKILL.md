# Database Migration Strategies

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master zero-downtime database migrations, rollback procedures, and production-safe schema changes for modern applications.

## Quick Reference

```sql
-- Additive changes (safe)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
ALTER TABLE posts ADD COLUMN status VARCHAR(20) DEFAULT 'draft';

-- Destructive changes (requires multi-step)
-- Step 1: Make column nullable
ALTER TABLE users ALTER COLUMN deprecated_field DROP NOT NULL;
-- Step 2: Deploy code that doesn't use field
-- Step 3: Drop column
ALTER TABLE users DROP COLUMN deprecated_field;

-- Rename (requires multi-step)
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
-- Step 2: Backfill data
UPDATE users SET full_name = name WHERE full_name IS NULL;
-- Step 3: Deploy code using both columns
-- Step 4: Deploy code using only new column
-- Step 5: Drop old column
ALTER TABLE users DROP COLUMN name;

-- Zero-downtime index creation (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Migration tools
-- Prisma
npx prisma migrate dev --name add_user_phone
npx prisma migrate deploy

-- TypeORM
npm run typeorm migration:generate -- -n AddUserPhone
npm run typeorm migration:run

-- Raw SQL with rollback
BEGIN;
-- migration up
ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false;
COMMIT;

-- rollback
BEGIN;
ALTER TABLE users DROP COLUMN verified;
COMMIT;
```

## Core Concepts

### Migration Safety Levels

**Level 1: Safe (Zero Downtime)**
- Adding nullable columns
- Adding tables
- Adding indexes (CONCURRENTLY)
- Increasing column size
- Adding CHECK constraints (NOT VALID)

**Level 2: Requires Care**
- Adding NOT NULL columns (with DEFAULT)
- Renaming columns (multi-step process)
- Changing column types (if compatible)
- Adding foreign keys (with validation)

**Level 3: Dangerous**
- Dropping columns
- Dropping tables
- Making columns NOT NULL
- Decreasing column size
- Changing column types (incompatible)

### The Golden Rules

1. **Always Backwards Compatible**: Old code must work with new schema
2. **Expand, Migrate, Contract**: Add new → Migrate data → Remove old
3. **Test Rollback**: Every migration needs a rollback plan
4. **No Data Loss**: Never delete data without backup
5. **Lock Awareness**: Know what operations lock tables

### Common Lock Behaviors (PostgreSQL)

```sql
-- Access Exclusive Lock (blocks all access)
DROP TABLE users;
ALTER TABLE users DROP COLUMN name;
TRUNCATE users;

-- Share Update Exclusive Lock (blocks writes)
CREATE INDEX idx_users_email ON users(email);  -- without CONCURRENTLY
VACUUM users;

-- Minimal/No Lock
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);  -- if nullable
SELECT * FROM users;
INSERT INTO users VALUES (...);
```

## Common Patterns

### Pattern 1: Adding Columns Safely

```typescript
// Migration 1: Add nullable column
// prisma/migrations/001_add_user_phone/migration.sql

-- Safe: No default, nullable
ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(20);

-- Also safe: With default value
ALTER TABLE "users" ADD COLUMN "verified" BOOLEAN DEFAULT false NOT NULL;

-- Prisma schema update
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  name     String
  phone    String?  // New optional field
  verified Boolean  @default(false)
}

// Application code (supports both old and new schema)
interface User {
  id: string
  email: string
  name: string
  phone?: string  // Optional for backwards compatibility
  verified: boolean
}

// Safe query patterns
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    // phone omitted - will be NULL
    // verified omitted - will use default
  }
})

// Later: Make field required (after all instances updated)
// Migration 2: Backfill data
UPDATE "users" SET "phone" = '' WHERE "phone" IS NULL;

// Migration 3: Make NOT NULL
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;
```

### Pattern 2: Removing Columns (Expand-Contract)

```typescript
// Phase 1: Stop writing to column (deploy code first)
// Remove all code that writes to 'deprecated_column'

// Phase 2: Make column nullable (migration)
-- migrations/001_deprecate_field.sql
ALTER TABLE "users" ALTER COLUMN "deprecated_column" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "deprecated_column" DROP DEFAULT;

// Phase 3: Deploy code that doesn't read column
// Remove from Prisma schema and all queries

// Phase 4: Wait for monitoring (ensure no errors)
// Check logs, metrics, etc. for 24-48 hours

// Phase 5: Drop column
-- migrations/002_drop_field.sql
ALTER TABLE "users" DROP COLUMN "deprecated_column";

// Complete example with rollback plan
// Migration: Remove user.age column

// migrations/20240101_deprecate_age_up.sql
-- Step 1: Make nullable (safe)
ALTER TABLE "users" ALTER COLUMN "age" DROP NOT NULL;
COMMENT ON COLUMN "users"."age" IS 'DEPRECATED: Remove after 2024-02-01';

// Rollback
-- migrations/20240101_deprecate_age_down.sql
ALTER TABLE "users" ALTER COLUMN "age" SET NOT NULL;

// After code deployed and monitored...

// migrations/20240201_remove_age_up.sql
ALTER TABLE "users" DROP COLUMN "age";

// Rollback (requires backup)
-- migrations/20240201_remove_age_down.sql
-- This is why we wait! Can't easily rollback a DROP
ALTER TABLE "users" ADD COLUMN "age" INTEGER;
-- Restore from backup if needed
```

### Pattern 3: Renaming Columns

```typescript
// BAD: Direct rename causes downtime
ALTER TABLE users RENAME COLUMN name TO full_name;
// Old code breaks immediately!

// GOOD: Multi-phase approach

// Phase 1: Add new column
-- migrations/001_add_full_name.sql
ALTER TABLE "users" ADD COLUMN "full_name" VARCHAR(255);

// Prisma schema (both columns exist)
model User {
  id        String  @id
  name      String  // Old column
  full_name String? // New column
}

// Phase 2: Backfill data
-- migrations/002_backfill_full_name.sql
UPDATE "users" SET "full_name" = "name" WHERE "full_name" IS NULL;

-- Or in batches for large tables
DO $$
DECLARE
  batch_size INTEGER := 10000;
  affected_rows INTEGER;
BEGIN
  LOOP
    UPDATE "users"
    SET "full_name" = "name"
    WHERE "id" IN (
      SELECT "id" FROM "users"
      WHERE "full_name" IS NULL
      LIMIT batch_size
    );

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    EXIT WHEN affected_rows = 0;

    RAISE NOTICE 'Updated % rows', affected_rows;
    PERFORM pg_sleep(0.1); -- Avoid lock contention
  END LOOP;
END $$;

// Phase 3: Application code reads/writes both
class UserService {
  async createUser(data: { full_name: string }) {
    return await prisma.user.create({
      data: {
        name: data.full_name,      // Write to old
        full_name: data.full_name  // Write to new
      }
    })
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    return {
      ...user,
      full_name: user.full_name || user.name // Prefer new, fallback to old
    }
  }
}

// Phase 4: Make new column NOT NULL
-- migrations/003_full_name_not_null.sql
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;

// Phase 5: Application code uses only new column
model User {
  id        String  @id
  name      String  // Still exists but unused
  full_name String
}

// Phase 6: Drop old column
-- migrations/004_drop_name.sql
ALTER TABLE "users" DROP COLUMN "name";

model User {
  id        String  @id
  full_name String
}
```

## Advanced Techniques

### Zero-Downtime Index Creation

```sql
-- PostgreSQL: CREATE INDEX CONCURRENTLY
-- Does not block writes, but takes longer
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Check for invalid indexes after interrupted creation
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE indexdef LIKE '%INVALID%';

-- Drop and recreate if invalid
DROP INDEX CONCURRENTLY IF EXISTS idx_users_email;
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- For very large tables, consider partial indexes
CREATE INDEX CONCURRENTLY idx_active_users_email
ON users(email)
WHERE deleted_at IS NULL;

-- Prisma migration with concurrent index
-- migrations/xxx_add_email_index/migration.sql
-- CreateIndex (concurrent)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_email" ON "users"("email");
```

### Online Schema Changes (pt-online-schema-change for MySQL)

```bash
# MySQL: Use pt-online-schema-change for large tables
pt-online-schema-change \
  --alter "ADD COLUMN phone VARCHAR(20)" \
  --execute \
  h=localhost,D=mydb,t=users

# How it works:
# 1. Creates new table with changes
# 2. Copies data in chunks
# 3. Uses triggers to keep in sync
# 4. Swaps tables atomically

# Or use gh-ost (GitHub's tool)
gh-ost \
  --user=root \
  --host=localhost \
  --database=mydb \
  --table=users \
  --alter="ADD COLUMN phone VARCHAR(20)" \
  --execute
```

### Transactional Migrations

```typescript
// Prisma: Migrations are transactional by default (PostgreSQL)
// migrations/xxx_complex_change/migration.sql

BEGIN;

-- Multiple related changes in one transaction
ALTER TABLE "posts" ADD COLUMN "author_id" UUID;

UPDATE "posts" p
SET "author_id" = u."id"
FROM "users" u
WHERE p."author_email" = u."email";

ALTER TABLE "posts" ALTER COLUMN "author_id" SET NOT NULL;

ALTER TABLE "posts"
  ADD CONSTRAINT "fk_posts_author"
  FOREIGN KEY ("author_id")
  REFERENCES "users"("id");

ALTER TABLE "posts" DROP COLUMN "author_email";

COMMIT;

-- If any step fails, all changes rollback
```

### Dealing with Large Data Migrations

```typescript
// Bad: Single large UPDATE
UPDATE users SET status = 'active' WHERE status IS NULL;
-- Locks table for extended time!

// Good: Batched updates
// migrations/xxx_backfill_status.ts (Prisma custom migration)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  const batchSize = 1000
  let processed = 0

  while (true) {
    const result = await prisma.$executeRaw`
      UPDATE users
      SET status = 'active'
      WHERE id IN (
        SELECT id FROM users
        WHERE status IS NULL
        LIMIT ${batchSize}
      )
    `

    processed += result
    console.log(`Processed ${processed} rows`)

    if (result === 0) break

    // Small delay to avoid overwhelming database
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`Migration complete: ${processed} total rows`)
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

// Alternative: Use background job
// For very large tables (millions of rows)
// migrations/xxx_schedule_backfill.sql
INSERT INTO migration_jobs (name, status, created_at)
VALUES ('backfill_user_status', 'pending', NOW());

// Process asynchronously
// workers/migration-worker.ts
async function processBackfillJob() {
  const batchSize = 10000

  while (true) {
    const count = await prisma.$executeRaw`
      UPDATE users
      SET status = 'active'
      WHERE id IN (
        SELECT id FROM users
        WHERE status IS NULL
        ORDER BY id
        LIMIT ${batchSize}
      )
    `

    if (count === 0) break

    await redis.set('backfill:progress', processed)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
```

### Blue-Green Schema Migrations

```typescript
// For critical tables, use shadow table approach

// Step 1: Create new table with desired schema
CREATE TABLE users_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,  -- Changed from 'name'
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

// Step 2: Backfill data
INSERT INTO users_new (id, email, full_name, created_at)
SELECT id, email, name, created_at
FROM users;

// Step 3: Setup triggers to keep in sync
CREATE OR REPLACE FUNCTION sync_users_to_new()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO users_new (id, email, full_name, created_at)
    VALUES (NEW.id, NEW.email, NEW.name, NEW.created_at);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE users_new
    SET email = NEW.email,
        full_name = NEW.name
    WHERE id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM users_new WHERE id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION sync_users_to_new();

// Step 4: Verify data consistency
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users_new;

// Step 5: Atomic swap
BEGIN;
ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_new RENAME TO users;
DROP TRIGGER sync_users ON users_old;
COMMIT;

// Step 6: Drop old table after monitoring
DROP TABLE users_old;
```

## Production Examples

### Example 1: Adding Foreign Key Constraint

```typescript
// Phase 1: Add column without constraint
-- migrations/001_add_author_id.sql
ALTER TABLE "posts" ADD COLUMN "author_id" UUID;

-- Backfill existing data
UPDATE "posts" p
SET "author_id" = (
  SELECT u."id" FROM "users" u WHERE u."email" = p."author_email"
  LIMIT 1
);

// Phase 2: Validate data (application layer)
// Check for any posts without valid author_id
const orphanedPosts = await prisma.post.findMany({
  where: {
    OR: [
      { author_id: null },
      { author: { id: { equals: null } } }
    ]
  }
})

if (orphanedPosts.length > 0) {
  console.error('Found orphaned posts:', orphanedPosts)
  // Fix data before proceeding
}

// Phase 3: Make NOT NULL
-- migrations/002_author_id_not_null.sql
ALTER TABLE "posts" ALTER COLUMN "author_id" SET NOT NULL;

// Phase 4: Add foreign key (with validation)
-- migrations/003_add_author_fk.sql

-- Option 1: Add constraint without validation first
ALTER TABLE "posts"
  ADD CONSTRAINT "fk_posts_author"
  FOREIGN KEY ("author_id")
  REFERENCES "users"("id")
  NOT VALID;  -- Doesn't lock table for long

-- Then validate (can take time but doesn't block writes)
ALTER TABLE "posts"
  VALIDATE CONSTRAINT "fk_posts_author";

-- Option 2: Add constraint directly (if table is small)
ALTER TABLE "posts"
  ADD CONSTRAINT "fk_posts_author"
  FOREIGN KEY ("author_id")
  REFERENCES "users"("id");

// Rollback plan
-- migrations/003_add_author_fk_rollback.sql
ALTER TABLE "posts" DROP CONSTRAINT "fk_posts_author";
ALTER TABLE "posts" ALTER COLUMN "author_id" DROP NOT NULL;
ALTER TABLE "posts" DROP COLUMN "author_id";
```

### Example 2: Changing Column Type

```typescript
// Scenario: Change user.age from VARCHAR to INTEGER

// Phase 1: Add new column with correct type
-- migrations/001_add_age_int.sql
ALTER TABLE "users" ADD COLUMN "age_int" INTEGER;

// Phase 2: Backfill with data cleaning
-- migrations/002_backfill_age_int.sql
UPDATE "users"
SET "age_int" = CASE
  WHEN "age" ~ '^[0-9]+$' THEN "age"::INTEGER
  ELSE NULL
END
WHERE "age_int" IS NULL;

-- Log invalid values
INSERT INTO migration_logs (table_name, column_name, invalid_value, user_id)
SELECT 'users', 'age', "age", "id"
FROM "users"
WHERE "age" IS NOT NULL
  AND "age" !~ '^[0-9]+$';

// Phase 3: Application code writes to both
model User {
  id      String  @id
  age     String? // Old string column
  age_int Int?    // New integer column
}

async function updateUser(id: string, age: number) {
  return await prisma.user.update({
    where: { id },
    data: {
      age: age.toString(),  // Write to old
      age_int: age          // Write to new
    }
  })
}

// Phase 4: Switch to reading from new column
async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  return {
    ...user,
    age: user.age_int ?? (user.age ? parseInt(user.age) : null)
  }
}

// Phase 5: Stop writing to old column
model User {
  id      String  @id
  age     String? // Still exists but unused
  age_int Int?
}

// Phase 6: Drop old column, rename new
-- migrations/003_finalize_age_int.sql
ALTER TABLE "users" DROP COLUMN "age";
ALTER TABLE "users" RENAME COLUMN "age_int" TO "age";

model User {
  id  String  @id
  age Int?
}
```

### Example 3: Splitting a Table

```typescript
// Scenario: Split users table into users + user_profiles

// Phase 1: Create new table
-- migrations/001_create_user_profiles.sql
CREATE TABLE "user_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "bio" TEXT,
  "avatar_url" VARCHAR(500),
  "location" VARCHAR(100),
  "website" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles"("user_id");

// Phase 2: Backfill data
-- migrations/002_backfill_profiles.sql
INSERT INTO "user_profiles" (user_id, bio, avatar_url, location, website, created_at, updated_at)
SELECT id, bio, avatar_url, location, website, created_at, updated_at
FROM "users"
WHERE bio IS NOT NULL
   OR avatar_url IS NOT NULL
   OR location IS NOT NULL
   OR website IS NOT NULL;

-- For users without profile data, create empty profiles
INSERT INTO "user_profiles" (user_id, created_at, updated_at)
SELECT id, created_at, updated_at
FROM "users"
WHERE id NOT IN (SELECT user_id FROM "user_profiles");

// Phase 3: Update application to read from both tables
model User {
  id         String       @id @default(uuid())
  email      String       @unique
  name       String
  // Old columns still here
  bio        String?
  avatar_url String?
  location   String?
  website    String?
  // New relation
  profile    UserProfile?
}

model UserProfile {
  id         String   @id @default(uuid())
  user_id    String   @unique
  user       User     @relation(fields: [user_id], references: [id])
  bio        String?
  avatar_url String?
  location   String?
  website    String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}

// Service layer handles dual writes
async function updateUserProfile(
  userId: string,
  data: { bio?: string; avatar_url?: string }
) {
  await prisma.$transaction([
    // Update old columns
    prisma.user.update({
      where: { id: userId },
      data: {
        bio: data.bio,
        avatar_url: data.avatar_url
      }
    }),
    // Update new table
    prisma.userProfile.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        ...data
      },
      update: data
    })
  ])
}

// Phase 4: Switch reads to new table only
async function getUserWithProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  })
}

// Phase 5: Stop writing to old columns
model User {
  id      String       @id
  email   String       @unique
  name    String
  profile UserProfile?
  // Old columns still exist but unused
}

// Phase 6: Drop old columns
-- migrations/003_drop_old_profile_columns.sql
ALTER TABLE "users" DROP COLUMN "bio";
ALTER TABLE "users" DROP COLUMN "avatar_url";
ALTER TABLE "users" DROP COLUMN "location";
ALTER TABLE "users" DROP COLUMN "website";

model User {
  id      String       @id
  email   String       @unique
  name    String
  profile UserProfile?
}
```

## Best Practices

### 1. Version Control for Migrations

```typescript
// migrations/
//   20240101120000_create_users/
//     migration.sql
//   20240102150000_add_email_index/
//     migration.sql
//   20240103090000_add_user_roles/
//     migration.sql

// Always include:
// - Timestamp prefix for ordering
// - Descriptive name
// - Up and down migrations (if possible)
// - Comments explaining complex changes

// Example migration file
-- migrations/20240101_add_user_status/migration.sql

-- Add status column to users
-- Default to 'active' for existing users
-- Part of epic: USER-123

BEGIN;

ALTER TABLE "users" ADD COLUMN "status" VARCHAR(20) DEFAULT 'active' NOT NULL;

CREATE INDEX "idx_users_status" ON "users"("status");

COMMENT ON COLUMN "users"."status" IS 'User account status: active, suspended, deleted';

COMMIT;

-- Rollback (save as separate file or comment)
-- BEGIN;
-- DROP INDEX "idx_users_status";
-- ALTER TABLE "users" DROP COLUMN "status";
-- COMMIT;
```

### 2. Test Migrations

```typescript
// test/migrations/add-user-status.test.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

describe('Add user status migration', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    // Create test database
    execSync('createdb test_db')
    prisma = new PrismaClient({
      datasources: { db: { url: 'postgresql://localhost/test_db' } }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
    execSync('dropdb test_db')
  })

  it('should add status column with default value', async () => {
    // Run migration
    execSync('npx prisma migrate deploy')

    // Create user without specifying status
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test' }
    })

    // Should have default status
    expect(user.status).toBe('active')
  })

  it('should allow all valid status values', async () => {
    const statuses = ['active', 'suspended', 'deleted']

    for (const status of statuses) {
      const user = await prisma.user.create({
        data: {
          email: `${status}@example.com`,
          name: 'Test',
          status
        }
      })

      expect(user.status).toBe(status)
    }
  })
})
```

### 3. Monitor Migration Performance

```typescript
// scripts/migration-monitor.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function monitorMigration(migrationName: string) {
  const start = Date.now()

  console.log(`Starting migration: ${migrationName}`)

  // Monitor table size before
  const sizeBefore = await prisma.$queryRaw`
    SELECT pg_size_pretty(pg_total_relation_size('users')) as size
  `
  console.log('Table size before:', sizeBefore)

  // Monitor locks
  const locks = await prisma.$queryRaw`
    SELECT
      locktype,
      relation::regclass,
      mode,
      granted
    FROM pg_locks
    WHERE pid = pg_backend_pid()
  `
  console.log('Active locks:', locks)

  try {
    // Run migration
    execSync('npx prisma migrate deploy')

    const duration = Date.now() - start
    console.log(`Migration completed in ${duration}ms`)

    // Check table size after
    const sizeAfter = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_total_relation_size('users')) as size
    `
    console.log('Table size after:', sizeAfter)

    // Record metrics
    await prisma.migrationMetrics.create({
      data: {
        name: migrationName,
        duration,
        success: true
      }
    })
  } catch (error) {
    console.error('Migration failed:', error)

    await prisma.migrationMetrics.create({
      data: {
        name: migrationName,
        duration: Date.now() - start,
        success: false,
        error: error.message
      }
    })

    throw error
  }
}
```

### 4. Document Breaking Changes

```typescript
// migrations/20240101_remove_deprecated_api/README.md

# Remove Deprecated User API Fields

## Summary
Removes `user.username` field that was deprecated in v2.0.0 (released 2023-06-01).

## Breaking Changes
- `username` field no longer available in User model
- Use `email` for user identification

## Migration Path
1. Update all services to use `email` instead of `username`
2. Run this migration
3. Update documentation

## Rollback
If rollback is needed:
```sql
ALTER TABLE users ADD COLUMN username VARCHAR(50);
-- Restore from backup_users_20240101
```

## Testing
- [ ] All API endpoints tested without username
- [ ] Frontend updated to use email
- [ ] Mobile apps updated (v3.0.0+)
- [ ] Third-party integrations notified

## Timeline
- 2023-06-01: Field deprecated
- 2023-12-01: Deprecation warning added
- 2024-01-01: Field removed
```

## Common Pitfalls

1. **Forgetting About Old App Instances**
   - Deploy migrations before new code
   - Ensure old code works with new schema
   - Blue-green deployments help

2. **Not Testing Rollback**
   - Every migration should be reversible
   - Test rollback in staging
   - Have data backup before production

3. **Large Data Migrations in Single Transaction**
   - Can cause timeout or lock table
   - Batch updates instead
   - Use background jobs for large tables

4. **Ignoring Index Performance Impact**
   - Creating indexes locks table (without CONCURRENTLY)
   - Can take hours on large tables
   - Monitor query performance after

5. **Not Checking for Dependent Objects**
   - Views, functions, triggers may break
   - Check dependencies before dropping columns
   - Update or recreate dependent objects

6. **Renaming Without Multi-Phase**
   - Direct rename breaks old code instantly
   - Always use expand-contract pattern
   - Write to both old and new during transition

7. **Forgetting About Replicas**
   - Migration runs on primary, replicates to followers
   - Can cause replication lag
   - Monitor replica lag during migration

## Resources

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Zero Downtime Migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)
- [PostgreSQL Lock Conflicts](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Strong Migrations Guide](https://github.com/ankane/strong_migrations)
- [Database Refactoring](https://databaserefactoring.com/)
- [pt-online-schema-change](https://www.percona.com/doc/percona-toolkit/LATEST/pt-online-schema-change.html)
- [gh-ost](https://github.com/github/gh-ost)
- [Expand-Contract Pattern](https://martinfowler.com/bliki/ParallelChange.html)
