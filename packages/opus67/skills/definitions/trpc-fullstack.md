# tRPC Fullstack Expert
> **ID:** `trpc-fullstack` | **Tier:** 2 | **Token Cost:** 5500

## What This Skill Does

Master end-to-end type-safe API development with tRPC v11, enabling seamless communication between Next.js 14 App Router server and client with full TypeScript inference, no code generation, and zero runtime overhead. Build production-grade APIs with authentication, real-time subscriptions, optimistic updates, and comprehensive error handling.

## When to Use

- Building type-safe APIs for Next.js applications
- Implementing real-time features with WebSocket subscriptions
- Creating authenticated API routes with role-based access
- Setting up server-side rendering with tRPC in App Router
- Migrating from REST/GraphQL to type-safe APIs
- Building internal tools requiring rapid development
- Implementing complex data mutations with optimistic updates
- Creating admin dashboards with real-time data

## Core Capabilities

### 1. Router & Procedures

**Basic Router Setup**

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';

/**
 * Context creation for each request
 * Includes session, db, and request metadata
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });

  return {
    session,
    db,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC instance initialization with superjson for Date/Map/Set support
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Reusable router and procedure builders
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware for authenticated requests
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // Infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected procedure requiring authentication
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

/**
 * Admin-only procedure with role check
 */
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
```

**Advanced Middleware Patterns**

```typescript
// src/server/api/middleware/rate-limit.ts
import { TRPCError } from '@trpc/server';
import { Redis } from 'ioredis';
import { t } from '../trpc';

const redis = new Redis(process.env.REDIS_URL);

/**
 * Rate limiting middleware using sliding window
 */
export const rateLimit = (
  max: number,
  windowMs: number
) => {
  return t.middleware(async ({ ctx, next, path }) => {
    const identifier = ctx.session?.user?.id || ctx.req.ip || 'anonymous';
    const key = `rate-limit:${path}:${identifier}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.pexpire(key, windowMs);
    }

    if (current > max) {
      const ttl = await redis.pttl(key);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil(ttl / 1000)}s`,
      });
    }

    return next();
  });
};

/**
 * Logging middleware with performance tracking
 */
export const logger = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  const meta = {
    path,
    type,
    durationMs,
    userId: ctx.session?.user?.id,
  };

  if (result.ok) {
    console.log('OK request', meta);
  } else {
    console.error('Non-OK request', meta, result.error);
  }

  return result;
});

/**
 * Input validation caching middleware
 */
export const cached = (ttlSeconds: number) => {
  return t.middleware(async ({ next, rawInput }) => {
    const key = `cache:${JSON.stringify(rawInput)}`;
    const cached = await redis.get(key);

    if (cached) {
      return { ok: true as const, data: JSON.parse(cached) };
    }

    const result = await next();

    if (result.ok) {
      await redis.setex(key, ttlSeconds, JSON.stringify(result.data));
    }

    return result;
  });
};
```

**Composing Complex Routers**

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';
import { commentRouter } from './routers/comment';
import { adminRouter } from './routers/admin';

/**
 * Main API router - merges all sub-routers
 * Type inference flows through entire tree
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

### 2. Queries & Mutations

**Query Procedures with Validation**

```typescript
// src/server/api/routers/post.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const postRouter = createTRPCRouter({
  /**
   * Public query: Get all published posts with pagination
   */
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        tag: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, tag } = input;

      const posts = await ctx.db.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          published: true,
          ...(tag && {
            tags: {
              some: {
                name: tag,
              },
            },
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  /**
   * Protected query: Get user's draft posts
   */
  getMyDrafts: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.post.findMany({
        where: {
          authorId: ctx.session.user.id,
          published: false,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }),

  /**
   * Public query: Get single post by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              bio: true,
            },
          },
          tags: true,
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found',
        });
      }

      return post;
    }),

  /**
   * Protected query: Get post analytics
   */
  getAnalytics: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        select: { authorId: true },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const [views, likes, comments] = await Promise.all([
        ctx.db.view.count({ where: { postId: input.postId } }),
        ctx.db.like.count({ where: { postId: input.postId } }),
        ctx.db.comment.count({ where: { postId: input.postId } }),
      ]);

      return { views, likes, comments };
    }),

  /**
   * Protected mutation: Create new post
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        excerpt: z.string().max(500).optional(),
        published: z.boolean().default(false),
        tags: z.array(z.string()).max(5).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.post.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Slug already exists',
        });
      }

      const post = await ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          slug: input.slug,
          excerpt: input.excerpt,
          published: input.published,
          authorId: ctx.session.user.id,
          tags: {
            connectOrCreate: input.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tags: true,
        },
      });

      return post;
    }),

  /**
   * Protected mutation: Update post
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().max(500).optional(),
        published: z.boolean().optional(),
        tags: z.array(z.string()).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const { id, tags, ...data } = input;

      return ctx.db.post.update({
        where: { id },
        data: {
          ...data,
          ...(tags && {
            tags: {
              set: [],
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
          }),
        },
        include: {
          tags: true,
        },
      });
    }),

  /**
   * Protected mutation: Delete post
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await ctx.db.post.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Protected mutation: Toggle like
   */
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.like.findUnique({
        where: {
          userId_postId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
      });

      if (existing) {
        await ctx.db.like.delete({
          where: {
            userId_postId: {
              userId: ctx.session.user.id,
              postId: input.postId,
            },
          },
        });
        return { liked: false };
      } else {
        await ctx.db.like.create({
          data: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        });
        return { liked: true };
      }
    }),
});
```

## Real-World Examples

### Example 1: Full-Stack Todo App with Authentication

Complete CRUD operations with optimistic updates, error handling, and authentication.

### Example 2: Real-Time Dashboard with Subscriptions

Live metrics dashboard with WebSocket subscriptions and automatic updates.

## Related Skills

- `nextjs-app-router` - Next.js 14 App Router patterns and RSC
- `prisma-orm` - Database modeling and queries with Prisma
- `zod-validation` - Schema validation and type inference
- `react-query` - Data fetching and caching patterns
- `websocket-realtime` - WebSocket implementation patterns
- `typescript-advanced-types` - Advanced TypeScript type patterns

## Further Reading

- [tRPC Documentation](https://trpc.io/docs)
- [tRPC with Next.js App Router](https://trpc.io/docs/nextjs/app-dir)
- [React Query Integration](https://trpc.io/docs/react-query)
- [Error Handling Guide](https://trpc.io/docs/error-handling)
- [Authorization Patterns](https://trpc.io/docs/authorization)
- [WebSocket Subscriptions](https://trpc.io/docs/subscriptions)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [create-t3-app](https://create.t3.gg/) - Best way to start a fullstack, typesafe Next.js app
