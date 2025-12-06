# Prisma & Drizzle ORM Expert
> **ID:** `prisma-drizzle-orm` | **Tier:** 2 | **Token Cost:** 6000

## What This Skill Does

This skill provides comprehensive expertise in both Prisma and Drizzle ORMs for TypeScript/Node.js applications. You'll master schema design, query patterns, migrations, and performance optimization for PostgreSQL databases. This skill enables you to:

- Design type-safe database schemas with full TypeScript inference
- Execute complex queries with both ORMs efficiently
- Implement transactions, batch operations, and raw SQL when needed
- Optimize query performance and connection pooling
- Manage migrations and schema evolution
- Choose the right ORM for your use case

**Key Distinction:**
- **Prisma:** Schema-first, auto-generated client, excellent for rapid development
- **Drizzle:** TypeScript-first, SQL-like queries, zero overhead, maximum performance

## When to Use

### Use Prisma When:
- Building MVPs or prototypes rapidly
- Need excellent VS Code IntelliSense and type safety
- Want automatic migrations from schema changes
- Prefer declarative schema definitions
- Need built-in connection pooling and caching
- Working with teams new to SQL

### Use Drizzle When:
- Performance is critical (10-100x faster than Prisma)
- Need full control over SQL queries
- Want zero runtime overhead
- Prefer SQL-like query syntax
- Building high-throughput APIs
- Need edge runtime compatibility (Cloudflare Workers)

### Use Both When:
- Migrating from Prisma to Drizzle gradually
- Need Prisma Studio for admin but Drizzle for production
- Want Prisma for rapid prototyping, Drizzle for optimization

## Core Capabilities

### 1. Prisma Schema Design

#### Basic Schema Structure

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  profile   Profile?
  comments  Comment[]

  // Indexes
  @@index([email])
  @@map("users")
}

model Profile {
  id     String  @id @default(cuid())
  bio    String?
  avatar String?
  userId String  @unique
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id          String    @id @default(cuid())
  title       String
  content     String?
  published   Boolean   @default(false)
  authorId    String
  categoryId  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category    Category? @relation(fields: [categoryId], references: [id])
  comments    Comment[]
  tags        Tag[]

  // Full-text search
  @@index([title, content], type: Gist)
  @@index([authorId])
  @@index([categoryId])
  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
  @@map("comments")
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts Post[]

  @@map("categories")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]

  @@map("tags")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

#### Advanced Schema Features

```prisma
// Multi-tenant SaaS schema
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   Member[]
  projects  Project[]

  @@map("organizations")
}

model Member {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  role           MemberRole   @default(MEMBER)
  joinedAt       DateTime     @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([organizationId])
  @@map("members")
}

model Project {
  id             String       @id @default(cuid())
  name           String
  organizationId String
  status         Status       @default(ACTIVE)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  tasks          Task[]

  @@index([organizationId])
  @@map("projects")
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  projectId   String
  assigneeId  String?
  priority    Priority @default(MEDIUM)
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@map("tasks")
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum Status {
  ACTIVE
  ARCHIVED
  DELETED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}
```

### 2. Prisma Client Operations

#### Basic CRUD Operations

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CREATE
async function createUser() {
  const user = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'USER',
      profile: {
        create: {
          bio: 'Software developer',
          avatar: 'https://example.com/avatar.jpg',
        },
      },
    },
    include: {
      profile: true,
    },
  });
  return user;
}

// READ
async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  return user;
}

// READ with pagination
async function getPosts(page: number = 1, pageSize: number = 20) {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  return {
    posts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// UPDATE
async function updatePost(id: string, data: { title?: string; content?: string; published?: boolean }) {
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
  return post;
}

// DELETE
async function deletePost(id: string) {
  await prisma.post.delete({
    where: { id },
  });
}

// UPSERT
async function upsertCategory(slug: string, name: string) {
  const category = await prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  });
  return category;
}
```

#### Complex Queries

```typescript
// Nested filtering
async function getPostsWithComments() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      author: {
        role: 'ADMIN',
      },
      comments: {
        some: {
          author: {
            email: {
              contains: '@example.com',
            },
          },
        },
      },
    },
    include: {
      author: true,
      comments: {
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
  return posts;
}

// Aggregations
async function getPostStats() {
  const stats = await prisma.post.aggregate({
    where: { published: true },
    _count: true,
  });

  const byAuthor = await prisma.post.groupBy({
    by: ['authorId'],
    where: { published: true },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  return { stats, byAuthor };
}

// Full-text search
async function searchPosts(query: string) {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
      published: true,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return posts;
}
```

#### Transactions

```typescript
// Interactive transactions
async function transferOwnership(postId: string, newAuthorId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const newAuthor = await tx.user.findUnique({
      where: { id: newAuthorId },
    });

    if (!newAuthor) {
      throw new Error('Author not found');
    }

    const updatedPost = await tx.post.update({
      where: { id: postId },
      data: { authorId: newAuthorId },
    });

    return updatedPost;
  });

  return result;
}

// Sequential operations transaction
async function createPostWithTags(data: {
  title: string;
  content: string;
  authorId: string;
  tagNames: string[];
}) {
  const post = await prisma.$transaction(async (tx) => {
    const tags = await Promise.all(
      data.tagNames.map((name) =>
        tx.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    const newPost = await tx.post.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        tags: {
          connect: tags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });

    return newPost;
  });

  return post;
}
```

#### Raw Queries

```typescript
// Raw SQL queries
async function getTopAuthors() {
  const result = await prisma.$queryRaw<Array<{ id: string; name: string; post_count: number }>>`
    SELECT
      u.id,
      u.name,
      COUNT(p.id)::int as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p."authorId"
    WHERE p.published = true
    GROUP BY u.id, u.name
    ORDER BY post_count DESC
    LIMIT 10
  `;
  return result;
}

// Parameterized raw queries
async function searchPostsRaw(searchTerm: string) {
  const posts = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    content: string;
    rank: number;
  }>>`
    SELECT
      id,
      title,
      content,
      ts_rank(
        to_tsvector('english', title || ' ' || COALESCE(content, '')),
        plainto_tsquery('english', ${searchTerm})
      ) as rank
    FROM posts
    WHERE
      published = true
      AND to_tsvector('english', title || ' ' || COALESCE(content, ''))
      @@ plainto_tsquery('english', ${searchTerm})
    ORDER BY rank DESC
    LIMIT 20
  `;
  return posts;
}
```

### 3. Drizzle Schema Design

#### Basic Schema Structure

```typescript
// db/schema.ts
import { pgTable, text, timestamp, boolean, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'MODERATOR']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bio: text('bio'),
  avatar: text('avatar'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  authorIdx: index('author_idx').on(table.authorId),
  categoryIdx: index('category_idx').on(table.categoryId),
  publishedIdx: index('published_idx').on(table.published),
}));

export const comments = pgTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text('content').notNull(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  postIdx: index('post_idx').on(table.postId),
  authorIdx: index('comment_author_idx').on(table.authorId),
}));

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
});

export const tags = pgTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
}));

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

#### Advanced Schema Features

```typescript
// Multi-tenant SaaS schema with Drizzle
import { pgTable, text, timestamp, pgEnum, index, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const planEnum = pgEnum('plan', ['FREE', 'PRO', 'ENTERPRISE']);
export const memberRoleEnum = pgEnum('member_role', ['OWNER', 'ADMIN', 'MEMBER']);
export const statusEnum = pgEnum('status', ['ACTIVE', 'ARCHIVED', 'DELETED']);
export const priorityEnum = pgEnum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = pgEnum('task_status', ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: planEnum('plan').default('FREE').notNull(),
  settings: jsonb('settings').$type<{
    features: string[];
    limits: { projects: number; members: number };
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('org_slug_idx').on(table.slug),
}));

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  status: statusEnum('status').default('ACTIVE').notNull(),
  metadata: jsonb('metadata').$type<{
    description?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('project_org_idx').on(table.organizationId),
  statusIdx: index('project_status_idx').on(table.status),
}));

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  assigneeId: text('assignee_id'),
  priority: priorityEnum('priority').default('MEDIUM').notNull(),
  status: taskStatusEnum('status').default('TODO').notNull(),
  dueDate: timestamp('due_date'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdx: index('task_project_idx').on(table.projectId),
  assigneeIdx: index('task_assignee_idx').on(table.assigneeId),
  statusIdx: index('task_status_idx').on(table.status),
  dueDateIdx: index('task_due_date_idx').on(table.dueDate),
}));
```

### 4. Drizzle Query Builder

#### Database Setup

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
```

#### Basic CRUD Operations

```typescript
import { db } from './db';
import { users, profiles, posts, categories } from './db/schema';
import { eq, and, or, desc, sql, count } from 'drizzle-orm';

// CREATE
async function createUser() {
  const [user] = await db.insert(users).values({
    email: 'john@example.com',
    name: 'John Doe',
    role: 'USER',
  }).returning();

  const [profile] = await db.insert(profiles).values({
    userId: user.id,
    bio: 'Software developer',
    avatar: 'https://example.com/avatar.jpg',
  }).returning();

  return { ...user, profile };
}

// READ
async function getUser(email: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      profile: true,
      posts: {
        where: eq(posts.published, true),
        orderBy: desc(posts.createdAt),
        limit: 10,
        with: {
          category: true,
        },
      },
    },
  });

  return result;
}

// UPDATE
async function updatePost(id: string, data: { title?: string; content?: string; published?: boolean }) {
  const [post] = await db.update(posts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return post;
}

// DELETE
async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
}

// UPSERT
async function upsertCategory(slug: string, name: string) {
  const [category] = await db.insert(categories)
    .values({ slug, name })
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name },
    })
    .returning();

  return category;
}
```

#### Complex Queries

```typescript
// Join queries
async function getPostsWithAuthorAndCategory() {
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      category: categories,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return result;
}

// Aggregations
async function getPostStats() {
  const [stats] = await db
    .select({
      totalPosts: count(),
    })
    .from(posts)
    .where(eq(posts.published, true));

  return { stats };
}

// Full-text search
async function searchPosts(query: string) {
  const result = await db.query.posts.findMany({
    where: and(
      eq(posts.published, true),
      or(
        sql`${posts.title} ILIKE ${`%${query}%`}`,
        sql`${posts.content} ILIKE ${`%${query}%`}`,
      ),
    ),
    with: {
      author: {
        columns: { name: true },
      },
    },
  });

  return result;
}
```

#### Transactions

```typescript
// Simple transaction
async function transferOwnership(postId: string, newAuthorId: string) {
  const result = await db.transaction(async (tx) => {
    const post = await tx.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const [updatedPost] = await tx.update(posts)
      .set({ authorId: newAuthorId })
      .where(eq(posts.id, postId))
      .returning();

    return updatedPost;
  });

  return result;
}
```

### 5. Migrations

#### Prisma Migrations

```bash
# Create a migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Technology', slug: 'technology' } }),
    prisma.category.create({ data: { name: 'Design', slug: 'design' } }),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'System administrator',
        },
      },
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### Drizzle Migrations

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

```bash
# Generate migrations
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit push:pg

# Open Drizzle Studio
npx drizzle-kit studio
```

```typescript
// db/seed.ts
import { db } from './index';
import { users, profiles, categories } from './schema';

async function seed() {
  const [techCategory] = await db.insert(categories).values([
    { name: 'Technology', slug: 'technology' },
  ]).returning();

  const [admin] = await db.insert(users).values({
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  }).returning();

  await db.insert(profiles).values({
    userId: admin.id,
    bio: 'System administrator',
  });

  console.log('Database seeded successfully');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
```

### 6. Performance Optimization

#### Connection Pooling

```typescript
// Prisma with connection pooling
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection pool in DATABASE_URL: postgresql://user:pass@host:5432/db?connection_limit=20
```

```typescript
// Drizzle with connection pooling
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
```

#### Query Optimization

```typescript
// Select specific fields only
async function getPostsOptimized() {
  // Prisma
  const prismaPosts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: { published: true },
    take: 20,
  });

  // Drizzle
  const drizzlePosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      authorId: users.id,
      authorName: users.name,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.published, true))
    .limit(20);

  return { prismaPosts, drizzlePosts };
}
```

#### Prepared Statements

```typescript
// Drizzle prepared statements
const preparedGetPost = db.query.posts
  .findFirst({
    where: eq(posts.id, sql.placeholder('id')),
    with: {
      author: true,
      comments: true,
    },
  })
  .prepare('get_post_by_id');

async function getPostById(id: string) {
  return await preparedGetPost.execute({ id });
}
```

## Real-World Examples

### Example 1: Multi-tenant SaaS (Prisma)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tenant isolation middleware
prisma.$use(async (params, next) => {
  const tenantId = (globalThis as any).currentTenantId;

  if (!tenantId) {
    throw new Error('Tenant ID not found');
  }

  if (params.model === 'Project' || params.model === 'Task') {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        organizationId: tenantId,
      };
    }
  }

  return next(params);
});

export default prisma;
```

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  organizationId: z.string().cuid(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: validated.name,
        organizationId: validated.organizationId,
      },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
```

### Example 2: High-performance API (Drizzle)

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: 50,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
```

```typescript
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        comments: {
          limit: 10,
          with: {
            author: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const [updatedPost] = await db
      .update(posts)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
```

## Related Skills

- **TypeScript Advanced Types** - Type-safe database operations
- **Next.js App Router** - Server components and API routes
- **PostgreSQL Advanced** - Database optimization
- **API Design REST** - RESTful API patterns
- **Zod Validation** - Input validation

## Further Reading

### Prisma Documentation
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

### Drizzle Documentation
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Query](https://orm.drizzle.team/docs/rqb)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle vs Prisma](https://orm.drizzle.team/docs/prisma-vs-drizzle)

### Performance Resources
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Connection Pooling Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Database Indexing Strategies](https://use-the-index-luke.com/)

### Community Resources
- [Prisma Examples](https://github.com/prisma/prisma-examples)
- [Drizzle Examples](https://github.com/drizzle-team/drizzle-orm/tree/main/examples)
- [T3 Stack](https://create.t3.gg/) - TypeScript, tRPC, Prisma/Drizzle

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
