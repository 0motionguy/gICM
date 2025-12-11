---
name: redis-caching-patterns
description: "Math.min(times * 50, 2000)"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Redis Caching Patterns

Master Redis caching strategies including cache-aside, write-through, write-behind, pub/sub, and distributed locking for high-performance applications.

## Quick Reference

```typescript
import Redis from 'ioredis'

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000)
})

// Basic operations
await redis.set('key', 'value')
await redis.get('key')
await redis.setex('key', 3600, 'value') // With TTL
await redis.del('key')

// JSON storage
await redis.set('user:123', JSON.stringify(user))
const data = await redis.get('user:123')
const user = JSON.parse(data)

// Hash operations
await redis.hset('user:123', 'name', 'John', 'email', 'john@example.com')
await redis.hget('user:123', 'name')
await redis.hgetall('user:123')

// Lists (queues)
await redis.lpush('queue:jobs', JSON.stringify(job))
await redis.rpop('queue:jobs')

// Sets (unique collections)
await redis.sadd('tags:post:123', 'javascript', 'redis', 'caching')
await redis.smembers('tags:post:123')

// Sorted Sets (leaderboards)
await redis.zadd('leaderboard', 100, 'player1', 200, 'player2')
await redis.zrevrange('leaderboard', 0, 9) // Top 10

// Pub/Sub
await redis.publish('channel', JSON.stringify({ event: 'update' }))
redis.subscribe('channel', (err, count) => {
  console.log(`Subscribed to ${count} channels`)
})
redis.on('message', (channel, message) => {
  console.log(`Received: ${message}`)
})

// Atomic operations
await redis.incr('counter')
await redis.incrby('counter', 5)

// Transactions
const pipeline = redis.pipeline()
pipeline.set('key1', 'value1')
pipeline.set('key2', 'value2')
pipeline.incr('counter')
await pipeline.exec()
```

## Core Concepts

### Redis Data Structures

**Strings**: Basic key-value storage
```typescript
// Simple values
await redis.set('session:abc123', 'user-data')

// With expiration
await redis.setex('otp:user123', 300, '123456') // 5 minutes

// Atomic counters
await redis.incr('page:views')
await redis.incrby('user:points', 10)

// Bit operations
await redis.setbit('login:2024-01-01', userId, 1)
const loggedIn = await redis.getbit('login:2024-01-01', userId)
```

**Hashes**: Object storage
```typescript
// Store user object
await redis.hset('user:123',
  'id', '123',
  'name', 'John',
  'email', 'john@example.com',
  'points', '100'
)

// Get single field
const name = await redis.hget('user:123', 'name')

// Get all fields
const user = await redis.hgetall('user:123')

// Increment field
await redis.hincrby('user:123', 'points', 10)
```

**Lists**: Ordered collections
```typescript
// Queue (FIFO)
await redis.lpush('queue', 'job1', 'job2')
const job = await redis.rpop('queue')

// Stack (LIFO)
await redis.lpush('stack', 'item1')
const item = await redis.lpop('stack')

// Recent items
await redis.lpush('recent:views', 'item1')
await redis.ltrim('recent:views', 0, 99) // Keep only 100
const recent = await redis.lrange('recent:views', 0, 9)
```

**Sets**: Unique collections
```typescript
// Tags
await redis.sadd('post:123:tags', 'js', 'redis', 'node')
const tags = await redis.smembers('post:123:tags')

// Set operations
await redis.sinter('tags:js', 'tags:redis') // Intersection
await redis.sunion('tags:js', 'tags:python') // Union
await redis.sdiff('tags:js', 'tags:old') // Difference

// Check membership
const isMember = await redis.sismember('post:123:tags', 'js')
```

**Sorted Sets**: Scored collections
```typescript
// Leaderboard
await redis.zadd('leaderboard',
  100, 'player1',
  200, 'player2',
  150, 'player3'
)

// Get top players
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES')

// Get rank
const rank = await redis.zrevrank('leaderboard', 'player1')

// Get score
const score = await redis.zscore('leaderboard', 'player1')

// Range by score
const winners = await redis.zrangebyscore('leaderboard', 150, 200)
```

### TTL (Time To Live)

```typescript
// Set TTL when creating
await redis.setex('key', 3600, 'value') // 1 hour

// Set TTL on existing key
await redis.expire('key', 3600)

// Get remaining TTL
const ttl = await redis.ttl('key') // Returns seconds (-1 = no expiry, -2 = doesn't exist)

// Persist (remove expiry)
await redis.persist('key')

// Set expiry at specific time
const expiryTime = Math.floor(Date.now() / 1000) + 3600
await redis.expireat('key', expiryTime)
```

## Common Patterns

### Pattern 1: Cache-Aside (Lazy Loading)

```typescript
// Most common pattern: Read from cache, fallback to database

class UserService {
  constructor(
    private redis: Redis,
    private db: PrismaClient
  ) {}

  async getUser(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`

    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Cache miss - fetch from database
    const user = await this.db.user.findUnique({
      where: { id: userId }
    })

    if (!user) return null

    // Store in cache with 1 hour TTL
    await this.redis.setex(
      cacheKey,
      3600,
      JSON.stringify(user)
    )

    return user
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    // Update database
    const user = await this.db.user.update({
      where: { id: userId },
      data
    })

    // Invalidate cache
    await this.redis.del(`user:${userId}`)

    return user
  }
}

// With helper function
async function cacheAside<T>(
  redis: Redis,
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check cache
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from source
  const data = await fetcher()

  // Store in cache
  if (data !== null) {
    await redis.setex(key, ttl, JSON.stringify(data))
  }

  return data
}

// Usage
const user = await cacheAside(
  redis,
  `user:${userId}`,
  3600,
  () => db.user.findUnique({ where: { id: userId } })
)
```

### Pattern 2: Write-Through Cache

```typescript
// Write to cache and database simultaneously

class ProductService {
  constructor(
    private redis: Redis,
    private db: PrismaClient
  ) {}

  async getProduct(productId: string): Promise<Product | null> {
    const cacheKey = `product:${productId}`

    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // If not in cache, load from DB and cache
    const product = await this.db.product.findUnique({
      where: { id: productId }
    })

    if (product) {
      await this.redis.setex(cacheKey, 3600, JSON.stringify(product))
    }

    return product
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    // Write to database
    const product = await this.db.product.update({
      where: { id: productId },
      data
    })

    // Write to cache immediately (write-through)
    const cacheKey = `product:${productId}`
    await this.redis.setex(cacheKey, 3600, JSON.stringify(product))

    return product
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    // Create in database
    const product = await this.db.product.create({ data })

    // Write to cache
    const cacheKey = `product:${product.id}`
    await this.redis.setex(cacheKey, 3600, JSON.stringify(product))

    return product
  }
}
```

### Pattern 3: Cache Stamping Prevention

```typescript
// Prevent multiple requests from hitting database on cache miss

class CacheService {
  private inflightRequests = new Map<string, Promise<any>>()

  async getWithStampedeProtection<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Check cache
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    // Check if request is already in-flight
    if (this.inflightRequests.has(key)) {
      return await this.inflightRequests.get(key)
    }

    // Create new in-flight request
    const promise = (async () => {
      try {
        // Try to acquire lock
        const lockKey = `lock:${key}`
        const lockAcquired = await redis.set(
          lockKey,
          'locked',
          'EX', 10, // 10 second lock
          'NX'     // Only set if not exists
        )

        if (!lockAcquired) {
          // Another process is fetching, wait and retry
          await new Promise(resolve => setTimeout(resolve, 100))
          const cached = await redis.get(key)
          if (cached) {
            return JSON.parse(cached)
          }
          // If still not cached, proceed anyway
        }

        // Fetch data
        const data = await fetcher()

        // Store in cache
        await redis.setex(key, ttl, JSON.stringify(data))

        // Release lock
        await redis.del(lockKey)

        return data
      } finally {
        this.inflightRequests.delete(key)
      }
    })()

    this.inflightRequests.set(key, promise)
    return promise
  }
}

// Usage
const cache = new CacheService()

// Even if 100 requests come simultaneously, only one will fetch from DB
const user = await cache.getWithStampedeProtection(
  `user:${userId}`,
  3600,
  () => db.user.findUnique({ where: { id: userId } })
)
```

## Advanced Techniques

### Multi-Level Caching

```typescript
// L1: In-memory (Node.js Map)
// L2: Redis
// L3: Database

class MultiLevelCache {
  private l1Cache = new Map<string, { data: any; expires: number }>()

  constructor(
    private redis: Redis,
    private db: PrismaClient
  ) {
    // Clean L1 cache every minute
    setInterval(() => this.cleanL1(), 60000)
  }

  private cleanL1() {
    const now = Date.now()
    for (const [key, value] of this.l1Cache.entries()) {
      if (value.expires < now) {
        this.l1Cache.delete(key)
      }
    }
  }

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check L1 (in-memory)
    const l1 = this.l1Cache.get(key)
    if (l1 && l1.expires > Date.now()) {
      return l1.data
    }

    // Check L2 (Redis)
    const l2 = await this.redis.get(key)
    if (l2) {
      const data = JSON.parse(l2)

      // Populate L1
      this.l1Cache.set(key, {
        data,
        expires: Date.now() + 60000 // 1 minute
      })

      return data
    }

    // Check L3 (Database)
    const data = await fetcher()

    // Populate L2 (Redis) - 1 hour
    await this.redis.setex(key, 3600, JSON.stringify(data))

    // Populate L1 - 1 minute
    this.l1Cache.set(key, {
      data,
      expires: Date.now() + 60000
    })

    return data
  }

  async invalidate(key: string) {
    this.l1Cache.delete(key)
    await this.redis.del(key)
  }
}

// Usage
const cache = new MultiLevelCache(redis, db)

const user = await cache.get(
  `user:${userId}`,
  () => db.user.findUnique({ where: { id: userId } })
)
```

### Pub/Sub for Cache Invalidation

```typescript
// Distributed cache invalidation across multiple instances

class DistributedCache {
  private subscriber: Redis
  private publisher: Redis
  private localCache = new Map<string, any>()

  constructor(redisUrl: string) {
    this.subscriber = new Redis(redisUrl)
    this.publisher = new Redis(redisUrl)

    // Subscribe to invalidation channel
    this.subscriber.subscribe('cache:invalidate')

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'cache:invalidate') {
        const { key, pattern } = JSON.parse(message)

        if (key) {
          this.localCache.delete(key)
        } else if (pattern) {
          // Invalidate by pattern
          for (const k of this.localCache.keys()) {
            if (k.startsWith(pattern)) {
              this.localCache.delete(k)
            }
          }
        }
      }
    })
  }

  async get(key: string): Promise<any> {
    // Check local cache
    if (this.localCache.has(key)) {
      return this.localCache.get(key)
    }

    // Check Redis
    const cached = await this.publisher.get(key)
    if (cached) {
      const data = JSON.parse(cached)
      this.localCache.set(key, data)
      return data
    }

    return null
  }

  async set(key: string, value: any, ttl: number) {
    // Store in Redis
    await this.publisher.setex(key, ttl, JSON.stringify(value))

    // Store in local cache
    this.localCache.set(key, value)
  }

  async invalidate(key: string) {
    // Delete from Redis
    await this.publisher.del(key)

    // Notify all instances (including self)
    await this.publisher.publish(
      'cache:invalidate',
      JSON.stringify({ key })
    )
  }

  async invalidatePattern(pattern: string) {
    // Delete from Redis
    const keys = await this.publisher.keys(`${pattern}*`)
    if (keys.length > 0) {
      await this.publisher.del(...keys)
    }

    // Notify all instances
    await this.publisher.publish(
      'cache:invalidate',
      JSON.stringify({ pattern })
    )
  }
}

// Usage
const cache = new DistributedCache(process.env.REDIS_URL!)

// Instance 1 updates
await cache.set('user:123', user, 3600)

// Instance 2 invalidates
await cache.invalidate('user:123')
// All instances clear local cache

// Invalidate all user caches
await cache.invalidatePattern('user:')
```

### Distributed Locking

```typescript
// Implement distributed locks with Redis

class RedisLock {
  constructor(private redis: Redis) {}

  async acquire(
    lockKey: string,
    ttl: number = 10000, // 10 seconds
    retries: number = 3,
    retryDelay: number = 100
  ): Promise<string | null> {
    const lockValue = crypto.randomUUID()

    for (let i = 0; i < retries; i++) {
      const result = await this.redis.set(
        lockKey,
        lockValue,
        'PX', ttl,   // Expire in milliseconds
        'NX'         // Only set if not exists
      )

      if (result === 'OK') {
        return lockValue // Lock acquired
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }

    return null // Failed to acquire lock
  }

  async release(lockKey: string, lockValue: string): Promise<boolean> {
    // Use Lua script to ensure atomic check-and-delete
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `

    const result = await this.redis.eval(script, 1, lockKey, lockValue)
    return result === 1
  }

  async executeWithLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    options?: {
      ttl?: number
      retries?: number
      retryDelay?: number
    }
  ): Promise<T> {
    const lockValue = await this.acquire(
      lockKey,
      options?.ttl,
      options?.retries,
      options?.retryDelay
    )

    if (!lockValue) {
      throw new Error(`Failed to acquire lock: ${lockKey}`)
    }

    try {
      return await fn()
    } finally {
      await this.release(lockKey, lockValue)
    }
  }
}

// Usage
const lock = new RedisLock(redis)

// Prevent double-processing of payment
await lock.executeWithLock(
  `payment:process:${paymentId}`,
  async () => {
    const payment = await db.payment.findUnique({ where: { id: paymentId } })

    if (payment.status === 'pending') {
      // Process payment
      await processPayment(payment)

      await db.payment.update({
        where: { id: paymentId },
        data: { status: 'completed' }
      })
    }
  },
  { ttl: 30000, retries: 5 }
)
```

### Rate Limiting

```typescript
// Token bucket algorithm with Redis

class RateLimiter {
  constructor(private redis: Redis) {}

  async checkRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - windowMs

    // Use sorted set to track requests
    const pipeline = this.redis.pipeline()

    // Remove old requests outside window
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    pipeline.zcard(key)

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`)

    // Set expiry
    pipeline.expire(key, Math.ceil(windowMs / 1000))

    const results = await pipeline.exec()
    const count = results[1][1] as number

    const allowed = count < limit
    const remaining = Math.max(0, limit - count - 1)
    const resetAt = now + windowMs

    if (!allowed) {
      // Remove the request we just added
      await this.redis.zremrangebyscore(key, now, now)
    }

    return { allowed, remaining, resetAt }
  }

  // Simpler fixed window rate limiting
  async simpleRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean> {
    const key = `ratelimit:simple:${identifier}`

    const current = await this.redis.incr(key)

    if (current === 1) {
      await this.redis.expire(key, windowSeconds)
    }

    return current <= limit
  }
}

// Middleware usage
const limiter = new RateLimiter(redis)

async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const identifier = req.ip || req.headers['x-forwarded-for'] as string

  const result = await limiter.checkRateLimit(
    identifier,
    100,      // 100 requests
    60000     // per minute
  )

  res.setHeader('X-RateLimit-Limit', '100')
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
  res.setHeader('X-RateLimit-Reset', result.resetAt.toString())

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
    })
  }

  next()
}
```

## Production Examples

### Example 1: Session Store

```typescript
// Redis-backed session management

class SessionStore {
  constructor(private redis: Redis) {}

  async createSession(userId: string, data: any): Promise<string> {
    const sessionId = crypto.randomUUID()
    const key = `session:${sessionId}`

    const session = {
      id: sessionId,
      userId,
      ...data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    // Store session with 24 hour expiry
    await this.redis.setex(
      key,
      24 * 60 * 60,
      JSON.stringify(session)
    )

    // Add to user's sessions set
    await this.redis.sadd(`user:${userId}:sessions`, sessionId)

    return sessionId
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`
    const data = await this.redis.get(key)

    if (!data) return null

    const session = JSON.parse(data)

    // Refresh expiry on access (sliding expiration)
    await this.redis.expire(key, 24 * 60 * 60)

    return session
  }

  async updateSession(sessionId: string, data: Partial<any>): Promise<void> {
    const session = await this.getSession(sessionId)

    if (!session) {
      throw new Error('Session not found')
    }

    const updated = { ...session, ...data }
    const key = `session:${sessionId}`

    await this.redis.setex(
      key,
      24 * 60 * 60,
      JSON.stringify(updated)
    )
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)

    if (session) {
      // Remove from user's sessions
      await this.redis.srem(`user:${session.userId}:sessions`, sessionId)
    }

    // Delete session
    await this.redis.del(`session:${sessionId}`)
  }

  async destroyAllUserSessions(userId: string): Promise<void> {
    // Get all user sessions
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`)

    if (sessionIds.length > 0) {
      // Delete all sessions
      const keys = sessionIds.map(id => `session:${id}`)
      await this.redis.del(...keys)

      // Clear sessions set
      await this.redis.del(`user:${userId}:sessions`)
    }
  }
}

// Express middleware
const sessionStore = new SessionStore(redis)

async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies.sessionId

  if (sessionId) {
    const session = await sessionStore.getSession(sessionId)

    if (session) {
      req.session = session
    } else {
      // Invalid session, clear cookie
      res.clearCookie('sessionId')
    }
  }

  next()
}
```

### Example 2: Real-Time Leaderboard

```typescript
// Leaderboard with Redis sorted sets

class Leaderboard {
  constructor(private redis: Redis) {}

  async addScore(
    leaderboardId: string,
    playerId: string,
    score: number
  ): Promise<void> {
    const key = `leaderboard:${leaderboardId}`

    // Add or update score
    await this.redis.zadd(key, score, playerId)

    // Also track in reverse index for player lookup
    await this.redis.hset(
      `player:${playerId}:scores`,
      leaderboardId,
      score.toString()
    )
  }

  async incrementScore(
    leaderboardId: string,
    playerId: string,
    increment: number
  ): Promise<number> {
    const key = `leaderboard:${leaderboardId}`

    // Atomic increment
    const newScore = await this.redis.zincrby(key, increment, playerId)

    await this.redis.hset(
      `player:${playerId}:scores`,
      leaderboardId,
      newScore.toString()
    )

    return parseFloat(newScore)
  }

  async getTopPlayers(
    leaderboardId: string,
    count: number = 10
  ): Promise<Array<{ playerId: string; score: number; rank: number }>> {
    const key = `leaderboard:${leaderboardId}`

    // Get top N with scores
    const results = await this.redis.zrevrange(
      key,
      0,
      count - 1,
      'WITHSCORES'
    )

    // Parse results
    const players = []
    for (let i = 0; i < results.length; i += 2) {
      players.push({
        playerId: results[i],
        score: parseFloat(results[i + 1]),
        rank: i / 2 + 1
      })
    }

    return players
  }

  async getPlayerRank(
    leaderboardId: string,
    playerId: string
  ): Promise<{ rank: number; score: number } | null> {
    const key = `leaderboard:${leaderboardId}`

    // Get rank (0-indexed, so add 1)
    const rank = await this.redis.zrevrank(key, playerId)

    if (rank === null) return null

    // Get score
    const score = await this.redis.zscore(key, playerId)

    return {
      rank: rank + 1,
      score: parseFloat(score!)
    }
  }

  async getPlayersAround(
    leaderboardId: string,
    playerId: string,
    range: number = 5
  ): Promise<Array<{ playerId: string; score: number; rank: number }>> {
    const key = `leaderboard:${leaderboardId}`

    // Get player's rank
    const rank = await this.redis.zrevrank(key, playerId)

    if (rank === null) return []

    // Get players around this rank
    const start = Math.max(0, rank - range)
    const end = rank + range

    const results = await this.redis.zrevrange(
      key,
      start,
      end,
      'WITHSCORES'
    )

    const players = []
    for (let i = 0; i < results.length; i += 2) {
      players.push({
        playerId: results[i],
        score: parseFloat(results[i + 1]),
        rank: start + i / 2 + 1
      })
    }

    return players
  }

  async removePlayer(
    leaderboardId: string,
    playerId: string
  ): Promise<void> {
    const key = `leaderboard:${leaderboardId}`

    await this.redis.zrem(key, playerId)
    await this.redis.hdel(`player:${playerId}:scores`, leaderboardId)
  }
}

// Usage
const leaderboard = new Leaderboard(redis)

// Add score
await leaderboard.addScore('weekly', 'player123', 1000)

// Increment
await leaderboard.incrementScore('weekly', 'player123', 50)

// Get top 10
const topPlayers = await leaderboard.getTopPlayers('weekly', 10)

// Get player's rank
const playerRank = await leaderboard.getPlayerRank('weekly', 'player123')

// Get context around player
const nearbyPlayers = await leaderboard.getPlayersAround('weekly', 'player123', 3)
```

### Example 3: Job Queue

```typescript
// Simple job queue with Redis lists

interface Job<T = any> {
  id: string
  type: string
  data: T
  priority: number
  retries: number
  maxRetries: number
  createdAt: string
}

class JobQueue {
  constructor(private redis: Redis) {}

  async enqueue<T>(
    type: string,
    data: T,
    options?: {
      priority?: number
      maxRetries?: number
    }
  ): Promise<string> {
    const job: Job<T> = {
      id: crypto.randomUUID(),
      type,
      data,
      priority: options?.priority || 0,
      retries: 0,
      maxRetries: options?.maxRetries || 3,
      createdAt: new Date().toISOString()
    }

    // Use sorted set for priority queue
    await this.redis.zadd(
      'queue:jobs',
      job.priority,
      JSON.stringify(job)
    )

    // Track job status
    await this.redis.hset(
      `job:${job.id}`,
      'status', 'pending',
      'data', JSON.stringify(job)
    )

    return job.id
  }

  async dequeue(): Promise<Job | null> {
    // Get highest priority job (atomic)
    const result = await this.redis.zpopmax('queue:jobs')

    if (result.length === 0) return null

    const [jobData] = result
    const job = JSON.parse(jobData) as Job

    // Mark as processing
    await this.redis.hset(
      `job:${job.id}`,
      'status', 'processing',
      'startedAt', new Date().toISOString()
    )

    return job
  }

  async complete(jobId: string): Promise<void> {
    await this.redis.hset(
      `job:${jobId}`,
      'status', 'completed',
      'completedAt', new Date().toISOString()
    )

    // Optionally delete after completion
    setTimeout(() => {
      this.redis.del(`job:${jobId}`)
    }, 60000) // Keep for 1 minute
  }

  async fail(jobId: string, error: string): Promise<void> {
    const jobData = await this.redis.hget(`job:${jobId}`, 'data')

    if (!jobData) return

    const job = JSON.parse(jobData) as Job
    job.retries++

    if (job.retries < job.maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, job.retries) * 1000
      const retryAt = Date.now() + delay

      await this.redis.zadd('queue:delayed', retryAt, JSON.stringify(job))

      await this.redis.hset(
        `job:${jobId}`,
        'status', 'retrying',
        'retries', job.retries.toString(),
        'nextRetryAt', new Date(retryAt).toISOString()
      )
    } else {
      // Max retries exceeded
      await this.redis.hset(
        `job:${jobId}`,
        'status', 'failed',
        'error', error,
        'failedAt', new Date().toISOString()
      )
    }
  }

  async processDelayed(): Promise<void> {
    const now = Date.now()

    // Get jobs ready to retry
    const jobs = await this.redis.zrangebyscore(
      'queue:delayed',
      0,
      now
    )

    for (const jobData of jobs) {
      const job = JSON.parse(jobData) as Job

      // Move back to main queue
      await this.redis.zadd('queue:jobs', job.priority, jobData)

      // Remove from delayed queue
      await this.redis.zrem('queue:delayed', jobData)
    }
  }

  async getStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    const pending = await this.redis.zcard('queue:jobs')
    const delayed = await this.redis.zcard('queue:delayed')

    // Scan for job statuses
    const statuses = { processing: 0, completed: 0, failed: 0 }
    let cursor = '0'

    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH', 'job:*',
        'COUNT', 100
      )

      cursor = newCursor

      for (const key of keys) {
        const status = await this.redis.hget(key, 'status')
        if (status && status in statuses) {
          statuses[status as keyof typeof statuses]++
        }
      }
    } while (cursor !== '0')

    return {
      pending: pending + delayed,
      ...statuses
    }
  }
}

// Worker process
const queue = new JobQueue(redis)

async function processJobs() {
  console.log('Worker started')

  // Process delayed jobs every 10 seconds
  setInterval(() => queue.processDelayed(), 10000)

  while (true) {
    try {
      const job = await queue.dequeue()

      if (!job) {
        // No jobs, wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }

      console.log(`Processing job ${job.id} of type ${job.type}`)

      try {
        // Process job based on type
        switch (job.type) {
          case 'send-email':
            await sendEmail(job.data)
            break
          case 'process-image':
            await processImage(job.data)
            break
          default:
            throw new Error(`Unknown job type: ${job.type}`)
        }

        await queue.complete(job.id)
        console.log(`Job ${job.id} completed`)
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error)
        await queue.fail(job.id, error.message)
      }
    } catch (error) {
      console.error('Worker error:', error)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

// Start worker
processJobs()

// Enqueue jobs from API
app.post('/api/send-email', async (req, res) => {
  const jobId = await queue.enqueue('send-email', req.body, {
    priority: 10,
    maxRetries: 3
  })

  res.json({ jobId })
})
```

## Best Practices

### 1. Key Naming Convention

```typescript
// Use consistent, hierarchical naming
// pattern: resource:identifier:attribute

'user:123'                    // User object
'user:123:sessions'           // User's sessions
'user:123:posts'              // User's posts
'post:456'                    // Post object
'post:456:views'              // Post view count
'cache:user:123'              // Cached user
'lock:payment:789'            // Payment processing lock
'queue:emails'                // Email queue
'leaderboard:weekly'          // Weekly leaderboard
'ratelimit:api:user:123'      // User API rate limit

// Use prefixes for environments
const env = process.env.NODE_ENV
const key = `${env}:user:${userId}`
```

### 2. Connection Pooling

```typescript
// Use connection pooling for better performance
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  // Connection pool settings
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      // Reconnect on specific errors
      return true
    }
    return false
  }
})

redis.on('error', (err) => {
  console.error('Redis error:', err)
})

redis.on('connect', () => {
  console.log('Connected to Redis')
})
```

### 3. Use Pipeline for Batch Operations

```typescript
// Bad: Multiple round trips
await redis.set('key1', 'value1')
await redis.set('key2', 'value2')
await redis.set('key3', 'value3')

// Good: Single round trip
const pipeline = redis.pipeline()
pipeline.set('key1', 'value1')
pipeline.set('key2', 'value2')
pipeline.set('key3', 'value3')
await pipeline.exec()

// With error handling
const results = await pipeline.exec()
for (const [error, result] of results) {
  if (error) {
    console.error('Pipeline error:', error)
  }
}
```

### 4. Handle Serialization Properly

```typescript
// Create wrapper for type-safe caching
class TypedCache {
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const serialized = JSON.stringify(value)
    await redis.setex(key, ttl, serialized)
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
}

// Handle special types
const cache = {
  async setDate(key: string, date: Date, ttl: number) {
    await redis.setex(key, ttl, date.toISOString())
  },

  async getDate(key: string): Promise<Date | null> {
    const value = await redis.get(key)
    return value ? new Date(value) : null
  }
}
```

## Common Pitfalls

1. **Not Setting TTL**
   - Always set expiration to prevent memory leaks
   - Redis will fill up and evict data unpredictably

2. **Storing Large Values**
   - Redis stores data in memory
   - Keep values under 1MB
   - Use compression for large data

3. **Using KEYS in Production**
   - `KEYS *` blocks the server
   - Use `SCAN` instead for iterating

4. **Not Handling Connection Failures**
   - Implement retry logic
   - Have fallback to direct database access

5. **Thundering Herd on Cache Miss**
   - Implement cache stampede protection
   - Use locks or request coalescing

6. **Forgetting to Clean Up**
   - Always set TTL
   - Implement garbage collection for orphaned keys

7. **Not Monitoring Memory**
   - Redis can run out of memory
   - Monitor memory usage and eviction policy
   - Set maxmemory and eviction policy

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [Redis Commands Reference](https://redis.io/commands/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/best-practices/)
- [Redis Persistence](https://redis.io/docs/manual/persistence/)
- [Redis Cluster](https://redis.io/docs/manual/scaling/)
- [Cache Patterns](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/Strategies.html)
