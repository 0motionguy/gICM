# tRPC Type-Safe APIs

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master end-to-end type safety with tRPC for building robust, type-safe APIs without code generation or manual type definitions.

## Quick Reference

```typescript
// Server: Define router
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.user.findUnique({ where: { id: input.id } })
    }),

  createUser: t.procedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email()
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.user.create({ data: input })
    }),

  onUserJoin: t.procedure
    .subscription(() => {
      return observable<User>((emit) => {
        const handler = (user: User) => emit.next(user)
        eventBus.on('userJoin', handler)
        return () => eventBus.off('userJoin', handler)
      })
    })
})

export type AppRouter = typeof appRouter

// Client: Call with full type safety
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from './server'

const client = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:3000/trpc' })]
})

// Full autocomplete and type checking!
const user = await client.getUser.query({ id: '123' })
const newUser = await client.createUser.mutate({
  name: 'Alice',
  email: 'alice@example.com'
})
```

## Core Concepts

### The tRPC Architecture

tRPC eliminates the gap between client and server by sharing types directly:

```
┌─────────────┐         ┌─────────────┐
│   Client    │ ◄─────► │   Server    │
│             │  Types  │             │
│ No codegen  │ ◄─────► │ No swagger  │
│ No manual   │  HTTP   │ No GraphQL  │
│   types     │         │   schema    │
└─────────────┘         └─────────────┘
```

**Key Benefits:**
- Zero runtime overhead for types
- Autocomplete everywhere
- Refactor with confidence
- Impossible to have type mismatches

### Procedures

Three types of procedures:

```typescript
// Query: For fetching data (GET-like)
t.procedure
  .input(z.string())
  .query(async ({ input }) => {
    return fetchData(input)
  })

// Mutation: For changing data (POST/PUT/DELETE-like)
t.procedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    return deleteData(input.id)
  })

// Subscription: For real-time streams (WebSocket)
t.procedure
  .subscription(() => {
    return observable((emit) => {
      // Stream data
    })
  })
```

### Context

Context holds request-specific data (user, database, etc.):

```typescript
import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getSession({ req })

  return {
    session,
    db: prisma,
    redis: redisClient
  }
}

export type Context = inferAsyncReturnType<typeof createContext>

// Use in procedures
const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  protected: t.procedure
    .query(({ ctx }) => {
      // ctx is fully typed!
      if (!ctx.session) throw new Error('Unauthorized')
      return ctx.db.user.findMany()
    })
})
```

### Middleware

Middleware chains let you reuse logic:

```typescript
// Auth middleware
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user // Add user to context
    }
  })
})

// Rate limit middleware
const rateLimit = t.middleware(async ({ ctx, next }) => {
  const identifier = ctx.session?.user?.id || ctx.req.ip

  const isAllowed = await checkRateLimit(identifier)
  if (!isAllowed) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
  }

  return next()
})

// Create protected procedure
const protectedProcedure = t.procedure.use(isAuthed)

// Use in router
export const appRouter = t.router({
  secretData: protectedProcedure
    .query(({ ctx }) => {
      // ctx.user is guaranteed to exist!
      return ctx.db.secrets.findMany({ where: { userId: ctx.user.id } })
    })
})
```

## Common Patterns

### Pattern 1: Complete tRPC Setup with Next.js

```typescript
// server/trpc.ts - Base setup
import { initTRPC, TRPCError } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import superjson from 'superjson'
import { ZodError } from 'zod'

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getServerSession(req, res, authOptions)

  return {
    session,
    db: prisma,
    redis,
    req,
    res
  }
}

export type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create({
  transformer: superjson, // Preserves Date, Map, Set, etc.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    }
  }
})

export const router = t.router
export const publicProcedure = t.procedure

// Auth middleware
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } })
})

export const protectedProcedure = t.procedure.use(enforceAuth)

// server/routers/_app.ts - Root router
import { router } from '../trpc'
import { userRouter } from './user'
import { postRouter } from './post'
import { commentRouter } from './comment'

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter
})

export type AppRouter = typeof appRouter

// server/routers/user.ts - Feature router
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.user.findUnique({
        where: { id: input.id },
        select: { id: true, name: true, email: true }
      })
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      bio: z.string().max(500).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: input
      })
    }),

  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      const users = await ctx.db.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' }
      })

      let nextCursor: string | undefined = undefined
      if (users.length > input.limit) {
        const nextItem = users.pop()!
        nextCursor = nextItem.id
      }

      return { users, nextCursor }
    })
})

// pages/api/trpc/[trpc].ts - API handler
import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error, type, path, input, ctx, req }) {
    console.error('tRPC Error:', { error, type, path, input })

    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // Log to error tracking service
      Sentry.captureException(error)
    }
  }
})

// lib/trpc.ts - Client setup
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'
import type { AppRouter } from '@/server/routers/_app'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error)
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              'x-trpc-source': 'nextjs-react'
            }
          }
        })
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1
          }
        }
      }
    }
  },
  ssr: false
})

// pages/_app.tsx - Wrap app
import { trpc } from '@/lib/trpc'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default trpc.withTRPC(MyApp)

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = trpc.user.getById.useQuery({ id: userId })
  const updateProfile = trpc.user.updateProfile.useMutation()

  const handleUpdate = async (name: string) => {
    await updateProfile.mutateAsync({ name })
  }

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return <div>{user.name}</div>
}
```

### Pattern 2: Input Validation & Transformation

```typescript
// lib/validations.ts - Reusable schemas
import { z } from 'zod'

export const PaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional()
})

export const IdSchema = z.object({
  id: z.string().uuid()
})

export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.object({
    category: z.enum(['tech', 'design', 'business']).optional(),
    tags: z.array(z.string()).max(5).optional()
  }).optional()
})

// Transform input
export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).max(10000),
  publishedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).max(10)
}).transform(data => ({
  ...data,
  slug: slugify(data.title),
  publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined
}))

// server/routers/post.ts
import { router, protectedProcedure } from '../trpc'
import { CreatePostSchema, PaginationSchema, IdSchema } from '@/lib/validations'

export const postRouter = router({
  create: protectedProcedure
    .input(CreatePostSchema)
    .mutation(async ({ input, ctx }) => {
      // input.slug is available from transformation!
      return await ctx.db.post.create({
        data: {
          ...input,
          authorId: ctx.user.id
        }
      })
    }),

  list: protectedProcedure
    .input(PaginationSchema)
    .query(async ({ input, ctx }) => {
      const posts = await ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: { authorId: ctx.user.id },
        orderBy: { createdAt: 'desc' }
      })

      let nextCursor: string | undefined
      if (posts.length > input.limit) {
        const nextItem = posts.pop()!
        nextCursor = nextItem.id
      }

      return { posts, nextCursor }
    }),

  delete: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      // Check ownership
      const post = await ctx.db.post.findUnique({ where: { id: input.id } })

      if (!post || post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return await ctx.db.post.delete({ where: { id: input.id } })
    })
})
```

### Pattern 3: Optimistic Updates & Cache Management

```typescript
// hooks/useOptimisticPosts.ts
import { trpc } from '@/lib/trpc'

export function useOptimisticPosts() {
  const utils = trpc.useUtils()

  const { data: posts } = trpc.post.list.useQuery({ limit: 20 })

  const createPost = trpc.post.create.useMutation({
    // Optimistic update
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await utils.post.list.cancel()

      // Snapshot previous value
      const previous = utils.post.list.getData({ limit: 20 })

      // Optimistically update
      utils.post.list.setData({ limit: 20 }, (old) => {
        if (!old) return old

        return {
          ...old,
          posts: [
            {
              id: 'temp-' + Date.now(),
              ...newPost,
              authorId: 'current-user',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            ...old.posts
          ]
        }
      })

      return { previous }
    },

    // On error, rollback
    onError: (err, newPost, context) => {
      if (context?.previous) {
        utils.post.list.setData({ limit: 20 }, context.previous)
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      utils.post.list.invalidate()
    }
  })

  const deletePost = trpc.post.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.post.list.cancel()
      const previous = utils.post.list.getData({ limit: 20 })

      utils.post.list.setData({ limit: 20 }, (old) => {
        if (!old) return old
        return {
          ...old,
          posts: old.posts.filter(post => post.id !== id)
        }
      })

      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.post.list.setData({ limit: 20 }, context.previous)
      }
    },
    onSettled: () => {
      utils.post.list.invalidate()
    }
  })

  const updatePost = trpc.post.update.useMutation({
    onMutate: async (updatedPost) => {
      await utils.post.list.cancel()
      const previous = utils.post.list.getData({ limit: 20 })

      utils.post.list.setData({ limit: 20 }, (old) => {
        if (!old) return old
        return {
          ...old,
          posts: old.posts.map(post =>
            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
          )
        }
      })

      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.post.list.setData({ limit: 20 }, context.previous)
      }
    },
    onSettled: () => {
      utils.post.list.invalidate()
    }
  })

  return { posts, createPost, deletePost, updatePost }
}
```

## Advanced Techniques

### Meta Data & Permissions

```typescript
// server/trpc.ts - Add meta to procedures
import { initTRPC } from '@trpc/server'

interface Meta {
  authRequired?: boolean
  permissions?: string[]
  rateLimit?: {
    max: number
    windowMs: number
  }
}

const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create()

// Permission middleware
const checkPermissions = t.middleware(async ({ ctx, meta, next }) => {
  if (meta?.permissions) {
    const userPermissions = await getUserPermissions(ctx.user.id)

    const hasPermission = meta.permissions.every(p =>
      userPermissions.includes(p)
    )

    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }
  }

  return next()
})

// Use meta in procedures
export const adminRouter = router({
  deleteUser: t.procedure
    .meta({ authRequired: true, permissions: ['admin.users.delete'] })
    .use(checkPermissions)
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.user.delete({ where: { id: input.userId } })
    })
})
```

### Server-Side Calls

```typescript
// Call tRPC procedures directly on server
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ctx = await createContext(context)

  // Create caller
  const caller = appRouter.createCaller(ctx)

  // Call procedures directly
  const user = await caller.user.getById({ id: 'user-123' })
  const posts = await caller.post.list({ limit: 10 })

  return {
    props: {
      user,
      posts
    }
  }
}

// API route calling another tRPC procedure
import { NextApiRequest, NextApiResponse } from 'next'
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await createContext({ req, res })
  const caller = appRouter.createCaller(ctx)

  // Internal procedure call
  const result = await caller.user.getById({ id: req.query.id as string })

  res.json(result)
}
```

### Subscriptions with WebSockets

```typescript
// server/trpc.ts - Add observable support
import { observable } from '@trpc/server/observable'
import { EventEmitter } from 'events'

const ee = new EventEmitter()

export const subscriptionRouter = router({
  onPostAdd: t.procedure
    .subscription(() => {
      return observable<Post>((emit) => {
        const onAdd = (post: Post) => {
          emit.next(post)
        }

        ee.on('add', onAdd)

        return () => {
          ee.off('add', onAdd)
        }
      })
    }),

  onPostUpdate: t.procedure
    .input(z.object({ postId: z.string() }))
    .subscription(({ input }) => {
      return observable<Post>((emit) => {
        const onUpdate = (post: Post) => {
          if (post.id === input.postId) {
            emit.next(post)
          }
        }

        ee.on('update', onUpdate)
        return () => ee.off('update', onUpdate)
      })
    })
})

// Emit from mutations
export const postRouter = router({
  create: protectedProcedure
    .input(CreatePostSchema)
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.db.post.create({ data: input })
      ee.emit('add', post) // Trigger subscription
      return post
    })
})

// pages/api/trpc/[trpc].ts - Add WebSocket support
import { createNextApiHandler } from '@trpc/server/adapters/next'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { WebSocketServer } from 'ws'

const handler = createNextApiHandler({
  router: appRouter,
  createContext
})

export default handler

// Create WebSocket server
if (process.env.NODE_ENV === 'production') {
  const wss = new WebSocketServer({ port: 3001 })

  applyWSSHandler({
    wss,
    router: appRouter,
    createContext
  })
}

// Client setup
import { createWSClient, wsLink, splitLink } from '@trpc/client'
import { httpBatchLink } from '@trpc/client'

const wsClient = createWSClient({
  url: 'ws://localhost:3001'
})

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        splitLink({
          condition(op) {
            return op.type === 'subscription'
          },
          true: wsLink({ client: wsClient }),
          false: httpBatchLink({ url: '/api/trpc' })
        })
      ]
    }
  }
})

// Use in component
function LivePosts() {
  trpc.post.onPostAdd.useSubscription(undefined, {
    onData(post) {
      console.log('New post:', post)
      // Update local state
    },
    onError(err) {
      console.error('Subscription error:', err)
    }
  })

  return <div>Live posts feed</div>
}
```

### Request Batching

```typescript
// Automatic request batching with httpBatchLink
import { httpBatchLink } from '@trpc/client'

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: '/api/trpc',
          maxURLLength: 2083, // Batch in query params if under this
          // Custom batching options
          maxBatchSize: 10, // Max procedures per batch
        })
      ]
    }
  }
})

// Multiple queries in same render = single HTTP request
function Dashboard() {
  const user = trpc.user.getById.useQuery({ id: 'user-1' })
  const posts = trpc.post.list.useQuery({ limit: 10 })
  const comments = trpc.comment.recent.useQuery({ limit: 5 })

  // All three queries batched into one HTTP request!

  return <div>...</div>
}
```

## Production Examples

### Example 1: Complete E-Commerce API

```typescript
// server/routers/shop.ts
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const shopRouter = router({
  // Products
  products: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      const products = await ctx.db.product.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          ...(input.category && { category: input.category }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } }
            ]
          })
        },
        orderBy: { createdAt: 'desc' }
      })

      let nextCursor: string | undefined
      if (products.length > input.limit) {
        const nextItem = products.pop()!
        nextCursor = nextItem.id
      }

      return { products, nextCursor }
    }),

  product: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: { reviews: { take: 10, orderBy: { createdAt: 'desc' } } }
      })

      if (!product) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      return product
    }),

  // Cart
  cart: protectedProcedure
    .query(async ({ ctx }) => {
      const cart = await ctx.db.cart.findUnique({
        where: { userId: ctx.user.id },
        include: { items: { include: { product: true } } }
      })

      return cart || { items: [], total: 0 }
    }),

  addToCart: protectedProcedure
    .input(z.object({
      productId: z.string(),
      quantity: z.number().min(1).max(99)
    }))
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId }
      })

      if (!product || product.stock < input.quantity) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Product unavailable' })
      }

      const cart = await ctx.db.cart.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id },
        update: {}
      })

      await ctx.db.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: input.productId
          }
        },
        create: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity
        },
        update: {
          quantity: { increment: input.quantity }
        }
      })

      return { success: true }
    }),

  // Checkout
  checkout: protectedProcedure
    .input(z.object({
      paymentMethodId: z.string(),
      shippingAddress: z.object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      const cart = await ctx.db.cart.findUnique({
        where: { userId: ctx.user.id },
        include: { items: { include: { product: true } } }
      })

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' })
      }

      // Calculate total
      const total = cart.items.reduce((sum, item) =>
        sum + (item.product.price * item.quantity), 0
      )

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        payment_method: input.paymentMethodId,
        confirm: true,
        metadata: {
          userId: ctx.user.id,
          cartId: cart.id
        }
      })

      if (paymentIntent.status !== 'succeeded') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment failed' })
      }

      // Create order
      const order = await ctx.db.order.create({
        data: {
          userId: ctx.user.id,
          total,
          status: 'processing',
          shippingAddress: input.shippingAddress,
          paymentIntentId: paymentIntent.id,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        }
      })

      // Clear cart
      await ctx.db.cartItem.deleteMany({ where: { cartId: cart.id } })

      return { orderId: order.id }
    })
})
```

### Example 2: Real-Time Collaboration

```typescript
// server/routers/collaboration.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { observable } from '@trpc/server/observable'
import { EventEmitter } from 'events'

const documentEvents = new EventEmitter()

export const collaborationRouter = router({
  document: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.document.findUnique({
        where: { id: input.id },
        include: { collaborators: true }
      })
    }),

  updateDocument: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
      version: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      // Optimistic locking
      const doc = await ctx.db.document.findUnique({ where: { id: input.id } })

      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      if (doc.version !== input.version) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Document has been updated by another user'
        })
      }

      const updated = await ctx.db.document.update({
        where: { id: input.id },
        data: {
          content: input.content,
          version: { increment: 1 }
        }
      })

      // Broadcast to subscribers
      documentEvents.emit(`update:${input.id}`, {
        content: updated.content,
        version: updated.version,
        userId: ctx.user.id
      })

      return updated
    }),

  onDocumentUpdate: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .subscription(({ input, ctx }) => {
      return observable<{ content: string; version: number; userId: string }>((emit) => {
        const handler = (data: any) => {
          if (data.userId !== ctx.user.id) {
            emit.next(data)
          }
        }

        documentEvents.on(`update:${input.documentId}`, handler)

        return () => {
          documentEvents.off(`update:${input.documentId}`, handler)
        }
      })
    }),

  presence: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      cursor: z.object({ line: z.number(), column: z.number() }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.redis.setex(
        `presence:${input.documentId}:${ctx.user.id}`,
        30, // Expire after 30s
        JSON.stringify({
          userId: ctx.user.id,
          username: ctx.user.name,
          cursor: input.cursor,
          timestamp: Date.now()
        })
      )

      documentEvents.emit(`presence:${input.documentId}`)

      return { success: true }
    }),

  onPresenceUpdate: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .subscription(({ input, ctx }) => {
      return observable<Array<{ userId: string; username: string; cursor?: any }>>((emit) => {
        const handler = async () => {
          const keys = await ctx.redis.keys(`presence:${input.documentId}:*`)
          const presences = await Promise.all(
            keys.map(key => ctx.redis.get(key))
          )

          const parsed = presences
            .filter(Boolean)
            .map(p => JSON.parse(p!))
            .filter(p => p.userId !== ctx.user.id)

          emit.next(parsed)
        }

        documentEvents.on(`presence:${input.documentId}`, handler)

        // Initial emit
        handler()

        return () => {
          documentEvents.off(`presence:${input.documentId}`, handler)
        }
      })
    })
})
```

### Example 3: File Upload with Progress

```typescript
// server/routers/upload.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { observable } from '@trpc/server/observable'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: 'us-east-1' })

export const uploadRouter = router({
  getUploadUrl: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
      size: z.number().max(100 * 1024 * 1024) // 100MB max
    }))
    .mutation(async ({ input, ctx }) => {
      const key = `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: input.contentType
      })

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

      // Create upload record
      const upload = await ctx.db.upload.create({
        data: {
          userId: ctx.user.id,
          filename: input.filename,
          key,
          size: input.size,
          status: 'pending'
        }
      })

      return { uploadUrl, uploadId: upload.id }
    }),

  completeUpload: protectedProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.upload.update({
        where: { id: input.uploadId },
        data: { status: 'completed', completedAt: new Date() }
      })
    })
})

// Client usage with progress
function FileUploader() {
  const getUploadUrl = trpc.upload.getUploadUrl.useMutation()
  const completeUpload = trpc.upload.completeUpload.useMutation()
  const [progress, setProgress] = useState(0)

  const handleUpload = async (file: File) => {
    // Get signed URL
    const { uploadUrl, uploadId } = await getUploadUrl.mutateAsync({
      filename: file.name,
      contentType: file.type,
      size: file.size
    })

    // Upload with progress
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setProgress((e.loaded / e.total) * 100)
      }
    })

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        await completeUpload.mutateAsync({ uploadId })
        toast.success('Upload complete!')
      }
    })

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  }

  return <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />
}
```

## Best Practices

### 1. Type Inference

```typescript
// Export types from router
export type RouterOutput = inferRouterOutputs<AppRouter>
export type RouterInput = inferRouterInputs<AppRouter>

// Use in components
type User = RouterOutput['user']['getById']
type CreateUserInput = RouterInput['user']['create']

// Infer procedure return types
import { inferProcedureOutput } from '@trpc/server'

type UserOutput = inferProcedureOutput<AppRouter['user']['getById']>
```

### 2. Error Handling

```typescript
// Consistent error codes
function MyComponent() {
  const mutation = trpc.user.create.useMutation({
    onError(error) {
      if (error.data?.code === 'UNAUTHORIZED') {
        router.push('/login')
      } else if (error.data?.code === 'BAD_REQUEST') {
        toast.error(error.message)
      } else {
        toast.error('Something went wrong')
      }
    }
  })
}

// Global error handler
export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            onError(error: any) {
              if (error.data?.code === 'UNAUTHORIZED') {
                window.location.href = '/login'
              }
            }
          },
          mutations: {
            onError(error: any) {
              console.error('Mutation error:', error)
              Sentry.captureException(error)
            }
          }
        }
      }
    }
  }
})
```

### 3. Testing

```typescript
// Test tRPC procedures directly
import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'

describe('User Router', () => {
  it('should get user by id', async () => {
    const ctx = await createContext({
      session: { user: { id: 'user-1' } }
    } as any)

    const caller = appRouter.createCaller(ctx)
    const user = await caller.user.getById({ id: 'user-1' })

    expect(user).toMatchObject({
      id: 'user-1',
      name: expect.any(String)
    })
  })
})
```

## Common Pitfalls

1. **Forgetting to Export Router Type**
   - Must export `export type AppRouter = typeof appRouter`
   - Without it, client has no type information

2. **Not Using Context Properly**
   - Context is request-specific, don't share state
   - Recreate context for each request

3. **Circular Dependencies**
   - Don't import from client in server code
   - Keep router definitions server-only

4. **Large Bundle Sizes**
   - tRPC client can include server types
   - Use proper imports: `import type` for types only

5. **Missing Transformer**
   - Dates become strings without superjson
   - Remember to configure on both client and server

6. **Not Handling Loading States**
   - Always check `isLoading`, `isError`
   - React Query provides these automatically

7. **Cache Invalidation Issues**
   - Must manually invalidate after mutations
   - Use `utils.query.invalidate()` or optimistic updates

## Resources

- [tRPC Documentation](https://trpc.io/docs)
- [tRPC Examples](https://github.com/trpc/examples-next-prisma-starter)
- [tRPC with Next.js](https://trpc.io/docs/nextjs)
- [React Query Integration](https://trpc.io/docs/react-query)
- [WebSocket Subscriptions](https://trpc.io/docs/subscriptions)
- [Error Handling](https://trpc.io/docs/error-handling)
- [Meta & Authorization](https://trpc.io/docs/authorization)
