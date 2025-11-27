# Next.js App Router Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


**Skill ID:** `nextjs-app-router-patterns`
**Domain:** Frontend / Next.js
**Complexity:** Advanced
**Prerequisites:** React Server Components, async/await, TypeScript

## Quick Reference

```tsx
// Server Component (default in app/)
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data.title}</div>
}

// Client Component
'use client'
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// Route Handler
export async function GET(request: Request) {
  return Response.json({ data: 'hello' })
}

// Parallel Routes
app/
  @analytics/
    page.tsx
  @team/
    page.tsx
  layout.tsx  // receives both as props

// Intercepting Routes
app/
  photos/
    [id]/
      page.tsx
  @modal/
    (.)photos/
      [id]/
        page.tsx

// Loading & Error States
loading.tsx    // Suspense boundary
error.tsx      // Error boundary
not-found.tsx  // 404 handler
```

## Core Concepts

### 1. Server Components by Default

All components in `app/` are Server Components unless marked with `'use client'`.

**Benefits:**
- Zero JavaScript sent to client
- Direct database/API access
- Automatic request deduplication
- Streaming HTML

**Key Rules:**
- Cannot use hooks (useState, useEffect, etc.)
- Cannot use browser APIs
- Cannot pass functions as props to Client Components
- Can be async

### 2. Client Components

Use `'use client'` directive at top of file.

**When to use:**
- Interactivity (onClick, onChange)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect, useContext)
- Third-party libraries with browser dependencies

**Best Practice:** Push `'use client'` as deep as possible in component tree.

### 3. Composition Pattern

Server Components can import Client Components, but not vice versa (directly).

**Solution:** Pass Server Components as children/props to Client Components.

### 4. Data Fetching

**Server Components:**
- Use native `fetch()` with automatic caching
- Direct database queries
- Parallel data fetching with Promise.all()

**Client Components:**
- Use SWR or React Query
- Or Route Handlers + fetch

### 5. Routing Conventions

- `page.tsx` - Route endpoint
- `layout.tsx` - Shared UI wrapper
- `loading.tsx` - Loading state (Suspense)
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page
- `route.ts` - API endpoint (Route Handler)
- `template.tsx` - Re-rendered layout

## Common Patterns

### Pattern 1: Server Component with Client Island

```tsx
// app/dashboard/page.tsx (Server Component)
import { getUser, getStats } from '@/lib/db'
import { InteractiveChart } from './interactive-chart'

export default async function DashboardPage() {
  // Fetch on server
  const [user, stats] = await Promise.all([
    getUser(),
    getStats()
  ])

  return (
    <div>
      <h1>{user.name}'s Dashboard</h1>
      {/* Pass data to Client Component */}
      <InteractiveChart data={stats} />
    </div>
  )
}

// app/dashboard/interactive-chart.tsx (Client Component)
'use client'
import { useState } from 'react'
import { Chart } from '@/components/chart'

export function InteractiveChart({ data }: { data: Stats[] }) {
  const [filter, setFilter] = useState('all')

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="daily">Daily</option>
      </select>
      <Chart data={data.filter(d => filter === 'all' || d.type === filter)} />
    </div>
  )
}
```

### Pattern 2: Parallel Data Fetching with Streaming

```tsx
// app/profile/page.tsx
import { Suspense } from 'react'
import { getUserProfile, getUserPosts, getUserFollowers } from '@/lib/db'

// Fast component
async function Profile() {
  const profile = await getUserProfile() // Fast query
  return <div>{profile.name}</div>
}

// Slow component
async function Posts() {
  const posts = await getUserPosts() // Slow query
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}

// Another slow component
async function Followers() {
  const followers = await getUserFollowers()
  return <div>{followers.length} followers</div>
}

export default function ProfilePage() {
  return (
    <div>
      {/* Renders immediately */}
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>

      {/* Streams in when ready */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>

      {/* Streams in independently */}
      <Suspense fallback={<div>Loading followers...</div>}>
        <Followers />
      </Suspense>
    </div>
  )
}
```

### Pattern 3: Passing Server Components as Children

```tsx
// app/layout.tsx (Server Component)
import { ClientSidebar } from './client-sidebar'
import { ServerNavigation } from './server-navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Client Component with Server Component as children */}
      <ClientSidebar>
        <ServerNavigation />
      </ClientSidebar>
      <main>{children}</main>
    </div>
  )
}

// app/client-sidebar.tsx (Client Component)
'use client'
import { useState } from 'react'

export function ClientSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside className={isOpen ? 'w-64' : 'w-16'}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </aside>
  )
}

// app/server-navigation.tsx (Server Component)
import { getCurrentUser } from '@/lib/auth'

export async function ServerNavigation() {
  const user = await getCurrentUser()
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/profile">{user.name}</a>
    </nav>
  )
}
```

### Pattern 4: Search Params & Dynamic Routes

```tsx
// app/products/page.tsx
interface SearchParams {
  category?: string
  sort?: string
  page?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const products = await getProducts({
    category: searchParams.category,
    sort: searchParams.sort,
    page: parseInt(searchParams.page || '1')
  })

  return <ProductGrid products={products} />
}

// app/products/[slug]/page.tsx
export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return <ProductDetail product={product} />
}

// Generate static params at build time
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map(p => ({ slug: p.slug }))
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)
  return {
    title: product.name,
    description: product.description,
  }
}
```

## Advanced Techniques

### 1. Parallel Routes

Display multiple pages in the same layout simultaneously.

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div>
      <div>{children}</div>
      <aside>
        <section>{analytics}</section>
        <section>{team}</section>
      </aside>
    </div>
  )
}

// app/@analytics/page.tsx
export default async function AnalyticsSlot() {
  const data = await getAnalytics()
  return <AnalyticsChart data={data} />
}

// app/@team/page.tsx
export default async function TeamSlot() {
  const team = await getTeam()
  return <TeamList members={team} />
}
```

### 2. Intercepting Routes (Modal Pattern)

Show a route in a modal while preserving URL.

```tsx
// app/photos/page.tsx
export default async function PhotosPage() {
  const photos = await getPhotos()
  return (
    <div className="grid">
      {photos.map(photo => (
        <Link key={photo.id} href={`/photos/${photo.id}`}>
          <img src={photo.thumbnail} alt={photo.title} />
        </Link>
      ))}
    </div>
  )
}

// app/photos/[id]/page.tsx
export default async function PhotoPage({ params }: { params: { id: string } }) {
  const photo = await getPhoto(params.id)
  return <FullPagePhoto photo={photo} />
}

// app/@modal/(.)photos/[id]/page.tsx
export default async function PhotoModal({ params }: { params: { id: string } }) {
  const photo = await getPhoto(params.id)
  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  )
}

// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

### 3. Route Handlers with Middleware

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')

  const posts = await getPosts({ tag })
  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    const post = await createPost(validatedData)
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('token')

  if (!token && request.nextUrl.pathname.startsWith('/api/posts')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Add custom header
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### 4. Server Actions

```tsx
// app/actions/posts.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const post = await db.post.create({
    data: { title, content }
  })

  revalidatePath('/posts')
  redirect(`/posts/${post.id}`)
}

export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } })
  revalidatePath('/posts')
}

// app/posts/new/page.tsx
import { createPost } from '@/app/actions/posts'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}

// Or with useFormState (Client Component)
'use client'
import { useFormState } from 'react-dom'
import { createPost } from '@/app/actions/posts'

export function NewPostForm() {
  const [state, formAction] = useFormState(createPost, null)

  return (
    <form action={formAction}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  )
}
```

## Production Examples

### Example 1: E-commerce Product Page

```tsx
// app/products/[slug]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AddToCartButton } from './add-to-cart-button'
import { ReviewList } from './review-list'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <img src={product.image} alt={product.name} />
      </div>

      <div>
        <h1>{product.name}</h1>
        <p className="text-2xl">${product.price}</p>
        <p>{product.description}</p>

        {/* Client Component for interactivity */}
        <AddToCartButton productId={product.id} />

        {/* Stream in reviews separately */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewList productId={product.id} />
        </Suspense>
      </div>
    </div>
  )
}

// Generate static pages at build time
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map(p => ({ slug: p.slug }))
}

// ISR: Revalidate every hour
export const revalidate = 3600

// app/products/[slug]/add-to-cart-button.tsx
'use client'
import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'

export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  return (
    <div className="flex gap-4">
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
        min="1"
      />
      <button
        onClick={() => addItem(productId, quantity)}
        className="btn-primary"
      >
        Add to Cart
      </button>
    </div>
  )
}

// app/products/[slug]/review-list.tsx
async function ReviewList({ productId }: { productId: string }) {
  // This can be slow - will stream in
  const reviews = await getReviews(productId)

  return (
    <div className="mt-8">
      <h2>Customer Reviews</h2>
      {reviews.map(review => (
        <div key={review.id} className="border-b py-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">{review.author}</span>
            <span className="text-yellow-500">
              {'★'.repeat(review.rating)}
            </span>
          </div>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  )
}
```

### Example 2: Real-time Dashboard

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { RealtimeUpdates } from './realtime-updates'

export default async function DashboardPage() {
  // Initial data from server
  const initialStats = await getStats()

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>

      {/* Static server-rendered stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Users" value={initialStats.users} />
        <StatCard title="Revenue" value={`$${initialStats.revenue}`} />
        <StatCard title="Orders" value={initialStats.orders} />
        <StatCard title="Conversion" value={`${initialStats.conversion}%`} />
      </div>

      {/* Real-time updates via Client Component */}
      <RealtimeUpdates initialData={initialStats} />

      {/* Stream in heavy components */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

// app/dashboard/realtime-updates.tsx
'use client'
import { useEffect, useState } from 'react'

export function RealtimeUpdates({ initialData }: { initialData: Stats }) {
  const [stats, setStats] = useState(initialData)

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/updates')

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setStats(update)
    }

    return () => ws.close()
  }, [])

  return (
    <div className="bg-blue-50 p-4 rounded">
      <p>Live: {stats.activeUsers} users online</p>
    </div>
  )
}

// app/dashboard/revenue-chart.tsx
async function RevenueChart() {
  // Heavy data aggregation
  const chartData = await getRevenueChartData()

  return (
    <div>
      <h2>Revenue Chart</h2>
      <Chart data={chartData} />
    </div>
  )
}

// Dynamic route - no caching
export const dynamic = 'force-dynamic'
```

### Example 3: Blog with ISR and Draft Mode

```tsx
// app/blog/[slug]/page.tsx
import { draftMode } from 'next/headers'

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const { isEnabled } = draftMode()

  const post = await getPost(params.slug, {
    preview: isEnabled,
  })

  if (!post) notFound()

  return (
    <article>
      {isEnabled && (
        <div className="bg-yellow-100 p-4">
          Preview Mode - <a href="/api/disable-draft">Exit</a>
        </div>
      )}

      <h1>{post.title}</h1>
      <p className="text-gray-600">{post.publishedAt}</p>

      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

// app/api/draft/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  if (secret !== process.env.DRAFT_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  draftMode().enable()
  redirect(`/blog/${slug}`)
}

// app/api/disable-draft/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  draftMode().disable()
  redirect('/')
}
```

## Best Practices

### 1. Component Boundaries

- **Server by default:** Keep components as Server Components unless they need interactivity
- **Client islands:** Push `'use client'` as deep as possible
- **Composition:** Pass Server Components as children to Client Components

### 2. Data Fetching

- **Fetch in Server Components:** Direct database access, no extra API layer needed
- **Collocate queries:** Fetch data in the component that needs it
- **Parallel fetching:** Use Promise.all() or separate Suspense boundaries
- **Dedupe automatically:** Next.js deduplicates identical fetch requests

### 3. Caching Strategy

```tsx
// No caching (dynamic)
export const dynamic = 'force-dynamic'

// Static (default)
export const dynamic = 'force-static'

// ISR - Revalidate every 60s
export const revalidate = 60

// Per-fetch caching
fetch('https://api.example.com/data', {
  cache: 'no-store' // or 'force-cache'
})

fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Revalidate every hour
})
```

### 4. Loading & Error States

Always provide loading and error states:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/error.tsx
'use client'
export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### 5. Metadata

```tsx
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'Description',
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  }
}
```

## Common Pitfalls

### 1. Passing Functions to Client Components

**❌ Don't:**
```tsx
// Server Component
export default function Page() {
  async function handleSubmit() {
    'use server'
    // ...
  }

  return <ClientForm onSubmit={handleSubmit} />
}
```

**✅ Do:**
```tsx
// actions/forms.ts
'use server'
export async function handleSubmit(formData: FormData) {
  // ...
}

// Server Component
import { handleSubmit } from '@/actions/forms'
export default function Page() {
  return <ClientForm action={handleSubmit} />
}
```

### 2. Using Hooks in Server Components

**❌ Don't:**
```tsx
export default async function Page() {
  const [state, setState] = useState() // Error!
  return <div>...</div>
}
```

**✅ Do:**
```tsx
// Server Component
export default async function Page() {
  const data = await getData()
  return <ClientComponent initialData={data} />
}

// Client Component
'use client'
export function ClientComponent({ initialData }) {
  const [state, setState] = useState(initialData)
  return <div>...</div>
}
```

### 3. Importing Server-only Code in Client Components

**❌ Don't:**
```tsx
'use client'
import { db } from '@/lib/db' // Error if db uses Node.js APIs

export function Component() {
  // ...
}
```

**✅ Do:**
```tsx
// Use Route Handler or Server Action
'use client'
export function Component() {
  async function handleClick() {
    const res = await fetch('/api/data')
    const data = await res.json()
  }
}
```

### 4. Not Handling Loading States

**❌ Don't:**
```tsx
export default async function Page() {
  const data = await slowFetch()
  const moreData = await anotherSlowFetch()
  return <div>...</div> // User sees nothing until both complete
}
```

**✅ Do:**
```tsx
export default function Page() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <DataComponent />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <MoreDataComponent />
      </Suspense>
    </>
  )
}
```

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Caching in Next.js](https://nextjs.org/docs/app/building-your-application/caching)
