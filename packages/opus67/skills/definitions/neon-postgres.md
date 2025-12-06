# Neon Postgres Expert
> **ID:** `neon-postgres` | **Tier:** 2 | **Token Cost:** 6000

## What This Skill Does

Master Neon Postgres serverless database platform with comprehensive expertise in connection management, database branching, edge runtime optimization, ORM integrations, and autoscaling configurations. Production-ready patterns for serverless Postgres deployments.

## When to Use

- Building serverless applications with Postgres on Vercel, Cloudflare Workers, or AWS Lambda
- Implementing database branching workflows for preview deployments
- Optimizing Postgres connections for edge runtimes
- Integrating Neon with Prisma, Drizzle, or raw SQL
- Setting up autoscaling Postgres for variable workloads
- Migrating from traditional Postgres to serverless architecture

## Core Capabilities

### 1. Neon Serverless Driver Setup

#### Installation and Configuration

```bash
# Install Neon serverless driver
pnpm add @neondatabase/serverless

# For Prisma integration
pnpm add @prisma/adapter-neon @neondatabase/serverless

# For Drizzle integration
pnpm add drizzle-orm @neondatabase/serverless
```

#### Basic Connection Setup

```typescript
// lib/db.ts
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure for edge runtimes
neonConfig.fetchConnectionCache = true;

// Create SQL tagged template function
const sql = neon(process.env.DATABASE_URL!);

// Execute queries
export async function getUsers() {
  const users = await sql`SELECT * FROM users WHERE active = true`;
  return users;
}

// Parameterized queries (safe from SQL injection)
export async function getUserById(id: string) {
  const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
  return user;
}

// Insert with returning
export async function createUser(email: string, name: string) {
  const [user] = await sql`
    INSERT INTO users (email, name)
    VALUES (${email}, ${name})
    RETURNING *
  `;
  return user;
}
```

#### Pool Connection for Long-Running Processes

```typescript
// lib/db-pool.ts
import { Pool } from '@neondatabase/serverless';

// Use Pool for Node.js backends, serverless functions with reuse
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function queryWithPool() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    return result.rows;
  } finally {
    client.release();
  }
}

// Transaction support
export async function transferFunds(fromId: string, toId: string, amount: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 2. Edge Runtime Optimization

#### Vercel Edge Functions

```typescript
// app/api/users/route.ts
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const users = await sql`
    SELECT id, email, name, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [{ count }] = await sql`SELECT COUNT(*) FROM users`;

  return Response.json({
    users,
    pagination: {
      page,
      limit,
      total: parseInt(count),
      totalPages: Math.ceil(parseInt(count) / limit),
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name } = body;

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const [user] = await sql`
    INSERT INTO users (email, name)
    VALUES (${email}, ${name})
    RETURNING *
  `;

  return Response.json({ user }, { status: 201 });
}
```

#### Cloudflare Workers

```typescript
// src/index.ts (Cloudflare Worker)
import { neon } from '@neondatabase/serverless';

interface Env {
  DATABASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sql = neon(env.DATABASE_URL);

    const url = new URL(request.url);

    if (url.pathname === '/api/posts' && request.method === 'GET') {
      const posts = await sql`
        SELECT p.*, u.name as author_name
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.published = true
        ORDER BY p.created_at DESC
        LIMIT 20
      `;

      return new Response(JSON.stringify({ posts }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

### 3. Database Branching

#### Branch Management Concepts

```typescript
// Neon branching workflow for preview deployments
/*
Main Branch (production)
  └── Preview Branch (feature-xyz)
       └── Contains copy of production data at branch time
       └── Isolated changes for testing
       └── Can be reset or deleted after PR merge
*/
```

#### GitHub Actions Integration

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  create-branch:
    runs-on: ubuntu-latest
    steps:
      - name: Create Neon Branch
        id: create-branch
        uses: neondatabase/create-branch-action@v5
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          api_key: ${{ secrets.NEON_API_KEY }}
          branch_name: preview/pr-${{ github.event.pull_request.number }}
          parent: main

      - name: Run Migrations
        run: |
          DATABASE_URL="${{ steps.create-branch.outputs.db_url }}" npx prisma migrate deploy

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        env:
          DATABASE_URL: ${{ steps.create-branch.outputs.db_url }}

  cleanup-branch:
    runs-on: ubuntu-latest
    if: github.event.action == 'closed'
    steps:
      - name: Delete Neon Branch
        uses: neondatabase/delete-branch-action@v3
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          api_key: ${{ secrets.NEON_API_KEY }}
          branch: preview/pr-${{ github.event.pull_request.number }}
```

#### Neon API for Branch Management

```typescript
// lib/neon-api.ts
const NEON_API_KEY = process.env.NEON_API_KEY!;
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID!;

interface Branch {
  id: string;
  name: string;
  parent_id: string;
  created_at: string;
}

export async function createBranch(name: string, parentBranchId?: string): Promise<Branch> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/branches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch: {
          name,
          parent_id: parentBranchId,
        },
        endpoints: [{ type: 'read_write' }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create branch: ${response.statusText}`);
  }

  const data = await response.json();
  return data.branch;
}

export async function deleteBranch(branchId: string): Promise<void> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/branches/${branchId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete branch: ${response.statusText}`);
  }
}

export async function listBranches(): Promise<Branch[]> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/branches`,
    {
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data.branches;
}

export async function resetBranch(branchId: string, parentBranchId: string): Promise<void> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/branches/${branchId}/reset`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_branch_id: parentBranchId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to reset branch: ${response.statusText}`);
  }
}
```

### 4. Prisma Integration

#### Prisma with Neon Adapter

```typescript
// lib/prisma.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Required for Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### Edge-Compatible Prisma

```typescript
// lib/prisma-edge.ts
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client/edge';

export function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Usage in Edge API route
// app/api/users/route.ts
import { createPrismaClient } from '@/lib/prisma-edge';

export const runtime = 'edge';

export async function GET() {
  const prisma = createPrismaClient();

  try {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return Response.json({ users });
  } finally {
    await prisma.$disconnect();
  }
}
```

### 5. Drizzle Integration

#### Drizzle with Neon HTTP

```typescript
// db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

#### Drizzle with Neon WebSocket (Transactions)

```typescript
// db/index-ws.ts
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Required for Node.js
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Transaction example
export async function createOrderWithItems(
  userId: string,
  items: Array<{ productId: string; quantity: number; price: number }>
) {
  return await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(schema.orders)
      .values({ userId, status: 'pending' })
      .returning();

    const orderItems = items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    await tx.insert(schema.orderItems).values(orderItems);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [updatedOrder] = await tx
      .update(schema.orders)
      .set({ total })
      .where(eq(schema.orders.id, order.id))
      .returning();

    return updatedOrder;
  });
}
```

#### Drizzle Schema for Neon

```typescript
// db/schema.ts
import { pgTable, text, timestamp, boolean, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  activeIdx: index('users_active_idx').on(table.active),
}));

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'),
  total: decimal('total', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('orders_user_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
}));

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
```

### 6. Autoscaling Configuration

#### Understanding Neon Autoscaling

```typescript
/*
Neon Autoscaling Configuration:
- Compute Units (CU): 0.25 to 10 CU
- Autoscaling: Scales between min and max CU based on load
- Autosuspend: Suspends compute after inactivity (0 = never)

Connection String Format:
postgresql://user:pass@host/db?sslmode=require

Performance Tips:
- Use connection pooling for high-traffic apps
- Enable fetchConnectionCache for edge functions
- Use prepared statements for repeated queries
*/
```

#### Connection Optimization

```typescript
// lib/db-optimized.ts
import { neon, neonConfig, Pool } from '@neondatabase/serverless';

// For Edge Functions: Use HTTP driver with caching
neonConfig.fetchConnectionCache = true;
const sqlEdge = neon(process.env.DATABASE_URL!);

// For Node.js: Use WebSocket with pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout after 10s
});

// Prepared statements for performance
export async function getPostsOptimized(limit: number, offset: number) {
  // Using $1, $2 syntax for prepared statements
  const result = await pool.query(
    `SELECT p.*, u.name as author_name
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.published = true
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

// Batch operations
export async function batchInsertUsers(users: Array<{ email: string; name: string }>) {
  const values = users.map((u, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
  const params = users.flatMap((u) => [u.email, u.name]);

  const result = await pool.query(
    `INSERT INTO users (email, name) VALUES ${values} RETURNING *`,
    params
  );
  return result.rows;
}
```

### 7. Migrations with Neon

#### Using Drizzle Kit

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

```bash
# Generate migration
npx drizzle-kit generate

# Push schema (development)
npx drizzle-kit push

# Apply migrations (production)
npx drizzle-kit migrate
```

#### Migration Script

```typescript
// scripts/migrate.ts
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from '../db';

async function runMigrations() {
  console.log('Running migrations...');

  await migrate(db, {
    migrationsFolder: './drizzle/migrations',
  });

  console.log('Migrations complete!');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

## Real-World Examples

### Example 1: Multi-Tenant SaaS with Branching

```typescript
// lib/tenant-db.ts
import { neon } from '@neondatabase/serverless';

interface TenantConfig {
  tenantId: string;
  branchUrl: string;
}

const tenantConnections = new Map<string, ReturnType<typeof neon>>();

export function getTenantDb(config: TenantConfig) {
  if (!tenantConnections.has(config.tenantId)) {
    tenantConnections.set(config.tenantId, neon(config.branchUrl));
  }
  return tenantConnections.get(config.tenantId)!;
}

// Middleware to inject tenant connection
export async function withTenantDb<T>(
  tenantId: string,
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  const branchUrl = await getTenantBranchUrl(tenantId);
  const sql = getTenantDb({ tenantId, branchUrl });
  return callback(sql);
}

async function getTenantBranchUrl(tenantId: string): Promise<string> {
  // Lookup tenant's database branch URL from config
  const mainSql = neon(process.env.DATABASE_URL!);
  const [tenant] = await mainSql`
    SELECT branch_url FROM tenants WHERE id = ${tenantId}
  `;
  return tenant.branch_url;
}
```

### Example 2: Analytics with Read Replicas

```typescript
// lib/db-replicas.ts
import { neon } from '@neondatabase/serverless';

// Primary for writes
const primarySql = neon(process.env.DATABASE_URL!);

// Read replica for analytics (same branch, different endpoint)
const replicaSql = neon(process.env.DATABASE_URL_REPLICA!);

export async function recordEvent(event: { type: string; data: any }) {
  await primarySql`
    INSERT INTO events (type, data, created_at)
    VALUES (${event.type}, ${JSON.stringify(event.data)}, NOW())
  `;
}

export async function getAnalytics(startDate: Date, endDate: Date) {
  // Use replica for heavy reads
  const stats = await replicaSql`
    SELECT
      type,
      DATE_TRUNC('day', created_at) as day,
      COUNT(*) as count
    FROM events
    WHERE created_at BETWEEN ${startDate} AND ${endDate}
    GROUP BY type, DATE_TRUNC('day', created_at)
    ORDER BY day DESC
  `;
  return stats;
}
```

### Example 3: Full Next.js App with Neon

```typescript
// app/api/posts/route.ts
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

export const runtime = 'edge';

const sql = neon(process.env.DATABASE_URL!);

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  authorId: z.string().uuid(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '10'));
  const offset = (page - 1) * limit;

  const [posts, [{ total }]] = await Promise.all([
    sql`
      SELECT
        p.id, p.title, p.content, p.published, p.created_at,
        json_build_object('id', u.id, 'name', u.name) as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.published = true
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`SELECT COUNT(*)::int as total FROM posts WHERE published = true`,
  ]);

  return Response.json({
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createPostSchema.parse(body);

    const [post] = await sql`
      INSERT INTO posts (title, content, author_id)
      VALUES (${validated.title}, ${validated.content}, ${validated.authorId})
      RETURNING *
    `;

    return Response.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
DATABASE_URL_REPLICA="postgresql://user:password@ep-xxx-replica.region.aws.neon.tech/dbname?sslmode=require"
NEON_API_KEY="neon_api_key_xxx"
NEON_PROJECT_ID="project_xxx"
```

## Related Skills

- **prisma-drizzle-orm** - ORM patterns and best practices
- **edge-runtime** - Edge function optimization
- **vercel-deployment** - Vercel integration patterns
- **postgres-advanced** - Advanced PostgreSQL features

## Further Reading

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Database Branching Guide](https://neon.tech/docs/guides/branching)
- [Prisma + Neon](https://neon.tech/docs/guides/prisma)
- [Drizzle + Neon](https://neon.tech/docs/guides/drizzle)
- [Autoscaling Configuration](https://neon.tech/docs/introduction/autoscaling)
- [Neon GitHub Actions](https://github.com/neondatabase)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
