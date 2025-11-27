# Vercel Deployment Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


## Quick Reference

```javascript
// next.config.js - Optimized configuration
module.exports = {
  // Enable SWC minification
  swcMinify: true,

  // Image optimization
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Enable ISR
  async rewrites() {
    return {
      beforeFiles: [{ source: '/api/:path*', destination: '/api/:path*' }],
    }
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        ],
      },
    ]
  },
}
```

### Essential Vercel CLI Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Environment variables
vercel env add API_KEY production
vercel env pull .env.local

# Logs
vercel logs <deployment-url>

# Inspect deployment
vercel inspect <deployment-url>
```

### Rendering Strategies Quick Guide
- **SSG** (Static) - Build time generation → Best performance
- **ISR** (Incremental Static) - Background regeneration → Fresh + Fast
- **SSR** (Server-side) - Request time → Always fresh
- **Edge** (Edge Runtime) - Distributed compute → Ultra-low latency

## Core Concepts

### 1. Rendering Strategies

**Static Site Generation (SSG)**
```typescript
// pages/blog/[slug].tsx
export async function getStaticPaths() {
  const posts = await getAllPosts()
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: false, // or 'blocking' or true
  }
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)
  return {
    props: { post },
    revalidate: 60, // ISR - revalidate every 60 seconds
  }
}
```

**Server-Side Rendering (SSR)**
```typescript
// pages/dashboard.tsx
export async function getServerSideProps(context) {
  const session = await getSession(context)

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const data = await fetchUserData(session.userId)

  return {
    props: { data },
  }
}
```

**Incremental Static Regeneration (ISR)**
```typescript
// pages/products/[id].tsx
export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id)

  return {
    props: { product },
    revalidate: 10, // Regenerate at most once every 10 seconds
  }
}

export async function getStaticPaths() {
  return {
    paths: [], // No pages pre-rendered at build time
    fallback: 'blocking', // Generate on first request
  }
}
```

### 2. Edge Functions

**Edge API Route**
```typescript
// pages/api/edge.ts
import type { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')

  // Fast KV lookup
  const data = await fetch(`https://api.weather.com/${city}`)

  return new Response(JSON.stringify(await data.json()), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  })
}
```

**Edge Middleware**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US'
  const response = NextResponse.next()

  // Add custom header
  response.headers.set('x-country', country)

  // A/B testing
  const bucket = Math.random() < 0.5 ? 'a' : 'b'
  response.cookies.set('bucket', bucket)

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 3. Image Optimization

```typescript
import Image from 'next/image'

// Optimized image with priority
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Remote images
<Image
  src="https://cdn.example.com/image.jpg"
  alt="Remote"
  width={800}
  height={600}
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**next.config.js:**
```javascript
module.exports = {
  images: {
    domains: ['cdn.example.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### 4. Caching Strategies

```typescript
// pages/api/data.ts
export default async function handler(req, res) {
  const data = await fetchData()

  // Cache for 1 hour, stale-while-revalidate for 24 hours
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  )

  return res.json(data)
}
```

**Cache-Control Patterns:**
```typescript
// Static assets - 1 year
'public, max-age=31536000, immutable'

// API responses - 5 minutes, revalidate in background
'public, s-maxage=300, stale-while-revalidate=600'

// User-specific content - no cache
'private, no-cache, no-store, must-revalidate'

// ISR pages
'public, s-maxage=1, stale-while-revalidate=59'
```

## Common Patterns

### Pattern 1: ISR with On-Demand Revalidation

```typescript
// pages/api/revalidate.ts
export default async function handler(req, res) {
  // Verify secret token
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    // Revalidate specific paths
    await res.revalidate(`/blog/${req.query.slug}`)
    await res.revalidate('/blog')

    return res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).send('Error revalidating')
  }
}

// pages/blog/[slug].tsx
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)

  return {
    props: { post },
    revalidate: 3600, // Fallback: revalidate every hour
  }
}

// Webhook from CMS
// POST /api/revalidate?secret=TOKEN&slug=hello-world
```

### Pattern 2: Edge-Optimized API with KV Store

```typescript
// pages/api/edge/user-prefs.ts
import { kv } from '@vercel/kv'
import type { NextRequest } from 'next/server'

export const config = { runtime: 'edge' }

export default async function handler(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (req.method === 'GET') {
    // Fast KV read
    const prefs = await kv.get(`user:${userId}:prefs`)

    return new Response(JSON.stringify(prefs || {}), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'private, max-age=60',
      },
    })
  }

  if (req.method === 'PUT') {
    const prefs = await req.json()

    // Write to KV
    await kv.set(`user:${userId}:prefs`, prefs, { ex: 86400 })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response('Method not allowed', { status: 405 })
}
```

### Pattern 3: A/B Testing with Edge Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const VARIANTS = ['control', 'variant-a', 'variant-b'] as const
type Variant = typeof VARIANTS[number]

export function middleware(request: NextRequest) {
  // Check existing variant
  const currentVariant = request.cookies.get('ab-test')?.value as Variant

  if (currentVariant && VARIANTS.includes(currentVariant)) {
    // Use existing variant
    const response = NextResponse.next()
    response.headers.set('x-ab-variant', currentVariant)
    return response
  }

  // Assign new variant
  const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
  const response = NextResponse.next()

  response.cookies.set('ab-test', variant, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  response.headers.set('x-ab-variant', variant)

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}

// pages/index.tsx
export async function getServerSideProps(context) {
  const variant = context.req.headers['x-ab-variant']

  return {
    props: {
      variant,
      content: await getContentForVariant(variant),
    },
  }
}
```

### Pattern 4: Preview Mode with ISR

```typescript
// pages/api/preview.ts
export default async function handler(req, res) {
  // Verify secret
  if (req.query.secret !== process.env.PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // Enable preview mode
  res.setPreviewData(
    { ref: req.query.ref },
    { maxAge: 60 * 60 } // 1 hour
  )

  // Redirect to the path
  res.redirect(req.query.slug ? `/blog/${req.query.slug}` : '/')
}

// pages/api/exit-preview.ts
export default function handler(req, res) {
  res.clearPreviewData()
  res.redirect('/')
}

// pages/blog/[slug].tsx
export async function getStaticProps({ params, preview, previewData }) {
  const post = await getPost(params.slug, {
    preview,
    ref: previewData?.ref,
  })

  return {
    props: { post },
    revalidate: preview ? 1 : 60,
  }
}
```

## Advanced Techniques

### 1. Streaming SSR with React Suspense

```typescript
// app/products/[id]/page.tsx (App Router)
import { Suspense } from 'react'

async function ProductDetails({ id }: { id: string }) {
  const product = await fetchProduct(id)
  return <div>{product.name}</div>
}

async function ProductReviews({ id }: { id: string }) {
  const reviews = await fetchReviews(id)
  return <div>{reviews.length} reviews</div>
}

export default function ProductPage({ params }) {
  return (
    <div>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={params.id} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={params.id} />
      </Suspense>
    </div>
  )
}
```

### 2. Edge Runtime with Geolocation

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const BLOCKED_COUNTRIES = ['XX', 'YY']

export function middleware(request: NextRequest) {
  const country = request.geo?.country
  const city = request.geo?.city
  const latitude = request.geo?.latitude
  const longitude = request.geo?.longitude

  // Block specific countries
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    return new Response('Access denied', { status: 403 })
  }

  // Redirect based on location
  if (country === 'DE' && !request.url.includes('/de')) {
    return NextResponse.redirect(new URL('/de', request.url))
  }

  // Add geo headers
  const response = NextResponse.next()
  response.headers.set('x-geo-country', country || 'unknown')
  response.headers.set('x-geo-city', city || 'unknown')

  return response
}
```

### 3. Build Output Optimization

```javascript
// next.config.js
module.exports = {
  // Analyze bundle
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
        })
      )
    }
    return config
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', 'lodash'],
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Output standalone for Docker
  output: 'standalone',
}
```

### 4. Dynamic OG Images at the Edge

```typescript
// pages/api/og.tsx
import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const config = { runtime: 'edge' }

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Default Title'
  const description = searchParams.get('description')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        <div>{title}</div>
        {description && (
          <div style={{ fontSize: 30, marginTop: 20 }}>{description}</div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Usage in page
export const metadata = {
  openGraph: {
    images: [
      {
        url: '/api/og?title=Hello%20World&description=My%20description',
        width: 1200,
        height: 630,
      },
    ],
  },
}
```

## Production Examples

### Example 1: E-commerce Product Pages with ISR

```typescript
// app/products/[slug]/page.tsx
import { Suspense } from 'react'
import { ProductSchema } from '@/lib/schema'

export const revalidate = 300 // 5 minutes

export async function generateStaticParams() {
  const products = await fetchTopProducts(100)
  return products.map(p => ({ slug: p.slug }))
}

async function Product({ slug }: { slug: string }) {
  const product = await fetchProduct(slug)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ProductSchema(product)),
        }}
      />
      <ProductDisplay product={product} />
    </>
  )
}

async function RelatedProducts({ categoryId }: { categoryId: string }) {
  const related = await fetchRelated(categoryId)
  return <RelatedProductsGrid products={related} />
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.slug)

  return (
    <main>
      <Suspense fallback={<ProductSkeleton />}>
        <Product slug={params.slug} />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <RelatedProducts categoryId={product.categoryId} />
      </Suspense>
    </main>
  )
}

// API route for webhook revalidation
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { slug } = await request.json()

  revalidatePath(`/products/${slug}`)
  revalidatePath('/products')

  return Response.json({ revalidated: true, now: Date.now() })
}
```

### Example 2: Global CDN with Edge Functions

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { geolocation } from '@vercel/edge'

export const config = {
  matcher: [
    '/api/localized/:path*',
    '/((?!_next|api|favicon.ico).*)',
  ],
}

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  JP: 'JPY',
}

const LANGUAGE_BY_COUNTRY: Record<string, string> = {
  US: 'en-US',
  GB: 'en-GB',
  DE: 'de-DE',
  JP: 'ja-JP',
}

export function middleware(request: NextRequest) {
  const geo = geolocation(request)
  const country = geo.country || 'US'

  const response = NextResponse.next()

  // Set localization cookies
  if (!request.cookies.get('currency')) {
    response.cookies.set('currency', CURRENCY_BY_COUNTRY[country] || 'USD')
  }

  if (!request.cookies.get('language')) {
    response.cookies.set('language', LANGUAGE_BY_COUNTRY[country] || 'en-US')
  }

  // Add custom headers for SSR
  response.headers.set('x-user-country', country)
  response.headers.set('x-user-currency', CURRENCY_BY_COUNTRY[country] || 'USD')

  return response
}

// app/api/localized/prices/route.ts
import { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const currency = request.cookies.get('currency')?.value || 'USD'
  const productId = request.nextUrl.searchParams.get('productId')

  // Check cache
  const cacheKey = `price:${productId}:${currency}`
  const cached = await kv.get(cacheKey)

  if (cached) {
    return Response.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'HIT',
      },
    })
  }

  // Fetch and cache
  const price = await fetchPrice(productId, currency)
  await kv.setex(cacheKey, 3600, price)

  return Response.json(price, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      'X-Cache': 'MISS',
    },
  })
}
```

### Example 3: Optimized Blog with Search

```typescript
// app/blog/page.tsx
import { Suspense } from 'react'

export const revalidate = 3600 // 1 hour

async function BlogList({ query }: { query?: string }) {
  const posts = query
    ? await searchPosts(query)
    : await getAllPosts()

  return (
    <div className="grid gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default function BlogPage({ searchParams }) {
  return (
    <main>
      <SearchBar />
      <Suspense fallback={<BlogSkeleton />} key={searchParams.q}>
        <BlogList query={searchParams.q} />
      </Suspense>
    </main>
  )
}

// Edge search API
// app/api/search/route.ts
import { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.length < 2) {
    return Response.json({ results: [] })
  }

  // Check cache
  const cacheKey = `search:${query.toLowerCase()}`
  const cached = await kv.get(cacheKey)

  if (cached) {
    return Response.json(cached)
  }

  // Perform search (e.g., Algolia, Typesense)
  const results = await performSearch(query)

  // Cache for 5 minutes
  await kv.setex(cacheKey, 300, results)

  return Response.json(results)
}
```

## Best Practices

### 1. Choose the Right Rendering Method

```typescript
// SSG - Blog posts, marketing pages
export async function getStaticProps() { }

// ISR - Product pages, news articles
export async function getStaticProps() {
  return { props: {}, revalidate: 60 }
}

// SSR - User dashboards, personalized content
export async function getServerSideProps() { }

// Edge - API routes, middleware
export const config = { runtime: 'edge' }
```

### 2. Optimize Images

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // Above the fold
  placeholder="blur"
  quality={85} // Balance quality/size
/>
```

### 3. Implement Proper Caching

```typescript
// Static assets
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

// Dynamic API
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

// Private data
res.setHeader('Cache-Control', 'private, no-cache')
```

### 4. Use Edge for Global Performance

```typescript
// Use Edge Runtime for:
- Middleware (auth, redirects, A/B testing)
- Simple API routes (lookups, transformations)
- Dynamic OG image generation
- Geolocation-based logic
```

### 5. Monitor Performance

```javascript
// vercel.json
{
  "github": {
    "silent": true
  },
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "analytics": true
}
```

## Common Pitfalls

### 1. Over-using SSR

```typescript
// BAD - SSR for static content
export async function getServerSideProps() {
  const posts = await getAllPosts()
  return { props: { posts } }
}

// GOOD - ISR for semi-static content
export async function getStaticProps() {
  const posts = await getAllPosts()
  return { props: { posts }, revalidate: 3600 }
}
```

### 2. Missing Cache Headers

```typescript
// BAD - No caching
export default function handler(req, res) {
  res.json(data)
}

// GOOD - Proper caching
export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
  res.json(data)
}
```

### 3. Large Client Bundles

```javascript
// BAD - Importing entire library
import _ from 'lodash'

// GOOD - Tree-shaking
import debounce from 'lodash/debounce'

// BETTER - Dynamic imports
const Chart = dynamic(() => import('chart.js'), { ssr: false })
```

### 4. Blocking Edge Runtime

```typescript
// BAD - CPU-intensive work on Edge
export const config = { runtime: 'edge' }
export default function handler() {
  const result = heavyComputation() // Blocks!
}

// GOOD - Use serverless for heavy work
export default function handler() {
  const result = heavyComputation()
}
```

### 5. Not Using Preview Deployments

```bash
# Always test with preview deployments
git push origin feature-branch

# Review: https://feature-branch-hash.vercel.app
# Only merge after preview validation
```

## Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)

### Tools
- [Vercel CLI](https://vercel.com/cli)
- [@vercel/og](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- [Vercel Analytics](https://vercel.com/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

### Optimization
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Community
- [Vercel Discord](https://vercel.com/discord)
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Vercel Examples](https://github.com/vercel/examples)
