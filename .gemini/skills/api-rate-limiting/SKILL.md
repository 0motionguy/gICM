# API Rate Limiting

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


## Quick Reference

```typescript
// Token bucket algorithm
class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  async consume(tokens = 1): Promise<boolean> {
    this.refill()

    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }

    return false
  }

  private refill() {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    const tokensToAdd = elapsed * this.refillRate

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}

// Express middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)
```

### Common Algorithms
- **Token Bucket** - Tokens refill at constant rate, allows bursts
- **Leaky Bucket** - Requests leak out at constant rate, smooths traffic
- **Fixed Window** - Count resets at fixed intervals
- **Sliding Window** - Rolling time window for accurate limits

### Rate Limit Headers (RFC 6585)
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200
Retry-After: 3600
```

## Core Concepts

### 1. Rate Limiting Algorithms

**Token Bucket**
```typescript
class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(
    private readonly capacity: number,      // max tokens
    private readonly refillRate: number,    // tokens per second
    private readonly tokensPerRequest = 1
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  tryConsume(tokens = this.tokensPerRequest): boolean {
    this.refill()

    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }

    return false
  }

  private refill() {
    const now = Date.now()
    const elapsedSeconds = (now - this.lastRefill) / 1000
    const tokensToAdd = elapsedSeconds * this.refillRate

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  getAvailableTokens(): number {
    this.refill()
    return Math.floor(this.tokens)
  }

  getTimeUntilRefill(): number {
    const tokensNeeded = this.tokensPerRequest - this.tokens
    if (tokensNeeded <= 0) return 0

    return Math.ceil((tokensNeeded / this.refillRate) * 1000)
  }
}
```

**Fixed Window Counter**
```typescript
class FixedWindowCounter {
  private counts = new Map<string, { count: number; resetTime: number }>()

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  tryAcquire(key: string): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const record = this.counts.get(key)

    // Window expired or doesn't exist
    if (!record || now >= record.resetTime) {
      this.counts.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      }
    }

    // Within window
    if (record.count < this.maxRequests) {
      record.count++
      return {
        allowed: true,
        remaining: this.maxRequests - record.count,
        resetTime: record.resetTime,
      }
    }

    // Limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.counts.entries()) {
      if (now >= record.resetTime) {
        this.counts.delete(key)
      }
    }
  }
}
```

**Sliding Window Log**
```typescript
class SlidingWindowLog {
  private logs = new Map<string, number[]>()

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  tryAcquire(key: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get or create log
    let log = this.logs.get(key) || []

    // Remove old entries
    log = log.filter(timestamp => timestamp > windowStart)

    // Check if we can accept request
    if (log.length < this.maxRequests) {
      log.push(now)
      this.logs.set(key, log)
      return true
    }

    return false
  }

  getOldestTimestamp(key: string): number | null {
    const log = this.logs.get(key)
    return log && log.length > 0 ? log[0] : null
  }
}
```

**Sliding Window Counter**
```typescript
class SlidingWindowCounter {
  private windows = new Map<string, {
    currentCount: number
    previousCount: number
    currentWindowStart: number
  }>()

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  tryAcquire(key: string): boolean {
    const now = Date.now()
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs

    let record = this.windows.get(key)

    // New window or no record
    if (!record || windowStart > record.currentWindowStart + this.windowMs) {
      this.windows.set(key, {
        currentCount: 1,
        previousCount: record?.currentCount || 0,
        currentWindowStart: windowStart,
      })
      return true
    }

    // Same window
    if (windowStart === record.currentWindowStart) {
      // Calculate weighted count
      const previousWindowWeight = 1 - ((now - windowStart) / this.windowMs)
      const estimatedCount =
        record.currentCount +
        record.previousCount * previousWindowWeight

      if (estimatedCount < this.maxRequests) {
        record.currentCount++
        return true
      }

      return false
    }

    // New window, slide forward
    this.windows.set(key, {
      currentCount: 1,
      previousCount: record.currentCount,
      currentWindowStart: windowStart,
    })

    return true
  }
}
```

### 2. Redis-Based Rate Limiting

```typescript
import { Redis } from 'ioredis'

class RedisRateLimiter {
  constructor(private redis: Redis) {}

  // Token bucket with Redis
  async tokenBucket(
    key: string,
    capacity: number,
    refillRate: number,
    tokens = 1
  ): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
    const now = Date.now()
    const bucketKey = `rate_limit:token_bucket:${key}`

    const script = `
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local tokens_requested = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])

      local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now

      -- Refill tokens
      local elapsed = (now - last_refill) / 1000
      local tokens_to_add = elapsed * refill_rate
      tokens = math.min(capacity, tokens + tokens_to_add)

      -- Try to consume
      if tokens >= tokens_requested then
        tokens = tokens - tokens_requested
        redis.call('HMSET', KEYS[1], 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', KEYS[1], 3600)
        return {1, math.floor(tokens), 0}
      else
        local tokens_needed = tokens_requested - tokens
        local retry_after = math.ceil((tokens_needed / refill_rate) * 1000)
        return {0, math.floor(tokens), retry_after}
      end
    `

    const result = await this.redis.eval(
      script,
      1,
      bucketKey,
      capacity,
      refillRate,
      tokens,
      now
    ) as [number, number, number]

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      retryAfter: result[2],
    }
  }

  // Fixed window with Redis
  async fixedWindow(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const windowKey = `rate_limit:fixed:${key}:${Math.floor(Date.now() / windowMs)}`

    const script = `
      local max = tonumber(ARGV[1])
      local ttl = tonumber(ARGV[2])

      local current = redis.call('INCR', KEYS[1])

      if current == 1 then
        redis.call('PEXPIRE', KEYS[1], ttl)
      end

      if current <= max then
        return {1, max - current}
      else
        return {0, 0}
      end
    `

    const result = await this.redis.eval(
      script,
      1,
      windowKey,
      maxRequests,
      windowMs
    ) as [number, number]

    const ttl = await this.redis.pttl(windowKey)
    const resetTime = Date.now() + ttl

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime,
    }
  }

  // Sliding window with Redis
  async slidingWindow(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now()
    const windowStart = now - windowMs
    const windowKey = `rate_limit:sliding:${key}`

    const script = `
      local max = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])

      -- Remove old entries
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', window_start)

      -- Count current requests
      local current = redis.call('ZCARD', KEYS[1])

      if current < max then
        redis.call('ZADD', KEYS[1], now, now)
        redis.call('PEXPIRE', KEYS[1], ARGV[4])
        return {1, max - current - 1}
      else
        return {0, 0}
      end
    `

    const result = await this.redis.eval(
      script,
      1,
      windowKey,
      maxRequests,
      windowStart,
      now,
      windowMs
    ) as [number, number]

    return {
      allowed: result[0] === 1,
      remaining: result[1],
    }
  }
}
```

### 3. Tiered Rate Limiting

```typescript
type Tier = 'free' | 'basic' | 'pro' | 'enterprise'

interface RateLimit {
  requests: number
  window: number // milliseconds
}

const RATE_LIMITS: Record<Tier, RateLimit> = {
  free: { requests: 100, window: 60 * 60 * 1000 }, // 100/hour
  basic: { requests: 1000, window: 60 * 60 * 1000 }, // 1000/hour
  pro: { requests: 10000, window: 60 * 60 * 1000 }, // 10k/hour
  enterprise: { requests: 100000, window: 60 * 60 * 1000 }, // 100k/hour
}

class TieredRateLimiter {
  constructor(private redis: Redis) {}

  async checkLimit(
    userId: string,
    tier: Tier
  ): Promise<{
    allowed: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const { requests, window } = RATE_LIMITS[tier]
    const key = `rate_limit:${tier}:${userId}`

    const now = Date.now()
    const windowStart = now - window

    const script = `
      local max = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local ttl = tonumber(ARGV[4])

      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', window_start)
      local current = redis.call('ZCARD', KEYS[1])

      local allowed = 0
      if current < max then
        redis.call('ZADD', KEYS[1], now, now)
        redis.call('PEXPIRE', KEYS[1], ttl)
        allowed = 1
      end

      local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
      local reset = now + ttl
      if #oldest > 0 then
        reset = tonumber(oldest[2]) + ttl
      end

      return {allowed, max - current - allowed, reset}
    `

    const result = await this.redis.eval(
      script,
      1,
      key,
      requests,
      windowStart,
      now,
      window
    ) as [number, number, number]

    return {
      allowed: result[0] === 1,
      limit: requests,
      remaining: Math.max(0, result[1]),
      reset: result[2],
    }
  }
}
```

### 4. Distributed Rate Limiting

```typescript
// Using Redis for distributed systems
class DistributedRateLimiter {
  constructor(private redis: Redis) {}

  async acquire(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{
    success: boolean
    totalHits: number
    resetTime: number
  }> {
    const identifier = `${key}:${Math.floor(Date.now() / windowMs)}`

    // Use Redis INCR for atomic counter
    const multi = this.redis.multi()
    multi.incr(identifier)
    multi.pexpire(identifier, windowMs)

    const results = await multi.exec()
    const totalHits = results![0][1] as number

    return {
      success: totalHits <= maxRequests,
      totalHits,
      resetTime: Date.now() + windowMs,
    }
  }

  // With Redis Cluster support
  async acquireWithHashTag(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ success: boolean; remaining: number }> {
    // Use hash tags to ensure same slot in cluster
    const hashKey = `{rate_limit}:${key}:${Math.floor(Date.now() / windowMs)}`

    const script = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('PEXPIRE', KEYS[1], ARGV[2])
      end
      return {current, current <= tonumber(ARGV[1]) and 1 or 0}
    `

    const result = await this.redis.eval(
      script,
      1,
      hashKey,
      maxRequests,
      windowMs
    ) as [number, number]

    return {
      success: result[1] === 1,
      remaining: Math.max(0, maxRequests - result[0]),
    }
  }
}
```

## Common Patterns

### Pattern 1: Express Middleware with Redis

```typescript
import { Request, Response, NextFunction } from 'express'
import { Redis } from 'ioredis'

interface RateLimitOptions {
  windowMs: number
  max: number
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
  handler?: (req: Request, res: Response) => void
  onLimitReached?: (req: Request) => void
}

function createRateLimiter(
  redis: Redis,
  options: RateLimitOptions
) {
  const {
    windowMs,
    max,
    keyGenerator = (req) => req.ip,
    skip = () => false,
    handler = (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000),
      })
    },
    onLimitReached,
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    if (skip(req)) {
      return next()
    }

    const key = keyGenerator(req)
    const identifier = `rate_limit:${key}:${Math.floor(Date.now() / windowMs)}`

    try {
      const script = `
        local current = redis.call('INCR', KEYS[1])
        if current == 1 then
          redis.call('PEXPIRE', KEYS[1], ARGV[2])
        end
        local ttl = redis.call('PTTL', KEYS[1])
        return {current, ttl}
      `

      const result = await redis.eval(
        script,
        1,
        identifier,
        max,
        windowMs
      ) as [number, number]

      const [count, ttl] = result
      const remaining = Math.max(0, max - count)
      const resetTime = Date.now() + ttl

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', remaining)
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000))

      if (count > max) {
        res.setHeader('Retry-After', Math.ceil(ttl / 1000))

        onLimitReached?.(req)

        return handler(req, res)
      }

      next()
    } catch (error) {
      // Fail open - allow request if Redis is down
      console.error('Rate limiter error:', error)
      next()
    }
  }
}

// Usage
const redis = new Redis(process.env.REDIS_URL)

const apiLimiter = createRateLimiter(redis, {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip
  },
  skip: (req) => {
    // Skip rate limiting for admins
    return req.user?.role === 'admin'
  },
  onLimitReached: (req) => {
    logger.warn('Rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      path: req.path,
    })
  },
})

app.use('/api/', apiLimiter)
```

### Pattern 2: Multi-Tier Rate Limiting

```typescript
// Multiple limits for same endpoint
async function multiTierRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const limits = [
    { name: 'per-second', max: 10, windowMs: 1000 },
    { name: 'per-minute', max: 100, windowMs: 60 * 1000 },
    { name: 'per-hour', max: 1000, windowMs: 60 * 60 * 1000 },
  ]

  const key = req.user?.id || req.ip

  for (const limit of limits) {
    const result = await rateLimiter.check(
      `${key}:${limit.name}`,
      limit.max,
      limit.windowMs
    )

    res.setHeader(
      `X-RateLimit-${limit.name}-Limit`,
      limit.max
    )
    res.setHeader(
      `X-RateLimit-${limit.name}-Remaining`,
      result.remaining
    )

    if (!result.allowed) {
      return res.status(429).json({
        error: `Rate limit exceeded: ${limit.name}`,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      })
    }
  }

  next()
}
```

### Pattern 3: Cost-Based Rate Limiting

```typescript
// Different endpoints have different costs
interface EndpointCost {
  [key: string]: number
}

const ENDPOINT_COSTS: EndpointCost = {
  'GET /users': 1,
  'GET /users/:id': 1,
  'POST /users': 5,
  'POST /users/:id/avatar': 10,
  'POST /reports/generate': 50,
}

function getCost(req: Request): number {
  const route = `${req.method} ${req.route?.path || req.path}`
  return ENDPOINT_COSTS[route] || 1
}

async function costBasedRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id
  if (!userId) return next()

  const cost = getCost(req)
  const capacity = 1000 // points per hour
  const refillRate = capacity / 3600 // points per second

  const result = await rateLimiter.tokenBucket(
    `cost:${userId}`,
    capacity,
    refillRate,
    cost
  )

  res.setHeader('X-RateLimit-Limit', capacity)
  res.setHeader('X-RateLimit-Remaining', result.remaining)
  res.setHeader('X-RateLimit-Cost', cost)

  if (!result.allowed) {
    res.setHeader('Retry-After', Math.ceil(result.retryAfter / 1000))
    return res.status(429).json({
      error: 'Insufficient rate limit quota',
      cost,
      remaining: result.remaining,
      retryAfter: result.retryAfter,
    })
  }

  next()
}
```

### Pattern 4: API Key Rate Limiting

```typescript
interface APIKeyLimits {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  concurrentRequests: number
}

class APIKeyRateLimiter {
  private activeRequests = new Map<string, number>()

  constructor(
    private redis: Redis,
    private limits: APIKeyLimits
  ) {}

  async checkLimits(apiKey: string): Promise<{
    allowed: boolean
    limitName?: string
    retryAfter?: number
  }> {
    // Check concurrent requests (in-memory)
    const concurrent = this.activeRequests.get(apiKey) || 0
    if (concurrent >= this.limits.concurrentRequests) {
      return {
        allowed: false,
        limitName: 'concurrent',
      }
    }

    // Check time-based limits (Redis)
    const checks = [
      { name: 'minute', max: this.limits.requestsPerMinute, window: 60 * 1000 },
      { name: 'hour', max: this.limits.requestsPerHour, window: 60 * 60 * 1000 },
      { name: 'day', max: this.limits.requestsPerDay, window: 24 * 60 * 60 * 1000 },
    ]

    for (const check of checks) {
      const key = `api_key:${apiKey}:${check.name}`
      const result = await this.checkWindow(key, check.max, check.window)

      if (!result.allowed) {
        return {
          allowed: false,
          limitName: check.name,
          retryAfter: result.retryAfter,
        }
      }
    }

    return { allowed: true }
  }

  async acquire(apiKey: string): Promise<void> {
    const current = this.activeRequests.get(apiKey) || 0
    this.activeRequests.set(apiKey, current + 1)
  }

  async release(apiKey: string): Promise<void> {
    const current = this.activeRequests.get(apiKey) || 0
    if (current > 0) {
      this.activeRequests.set(apiKey, current - 1)
    }
  }

  private async checkWindow(
    key: string,
    max: number,
    windowMs: number
  ): Promise<{ allowed: boolean; retryAfter: number }> {
    const script = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('PEXPIRE', KEYS[1], ARGV[2])
      end
      local ttl = redis.call('PTTL', KEYS[1])
      return {current <= tonumber(ARGV[1]) and 1 or 0, ttl}
    `

    const result = await this.redis.eval(
      script,
      1,
      key,
      max,
      windowMs
    ) as [number, number]

    return {
      allowed: result[0] === 1,
      retryAfter: result[1],
    }
  }
}

// Middleware
async function apiKeyRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' })
  }

  const result = await apiKeyLimiter.checkLimits(apiKey)

  if (!result.allowed) {
    const response: any = {
      error: `Rate limit exceeded: ${result.limitName}`,
    }

    if (result.retryAfter) {
      res.setHeader('Retry-After', Math.ceil(result.retryAfter / 1000))
      response.retryAfter = result.retryAfter
    }

    return res.status(429).json(response)
  }

  await apiKeyLimiter.acquire(apiKey)

  res.on('finish', () => {
    apiKeyLimiter.release(apiKey)
  })

  next()
}
```

## Advanced Techniques

### 1. Adaptive Rate Limiting

```typescript
// Adjust limits based on system load
class AdaptiveRateLimiter {
  private baseLimit = 100
  private currentLimit = this.baseLimit

  constructor(private redis: Redis) {
    this.monitorSystemLoad()
  }

  private async monitorSystemLoad() {
    setInterval(async () => {
      const load = await this.getSystemLoad()

      // Reduce limit if system is under stress
      if (load > 0.8) {
        this.currentLimit = Math.max(
          this.baseLimit * 0.5,
          this.currentLimit * 0.9
        )
      } else if (load < 0.5) {
        // Gradually increase back to base
        this.currentLimit = Math.min(
          this.baseLimit,
          this.currentLimit * 1.1
        )
      }

      logger.info('Adaptive rate limit adjusted', {
        load,
        currentLimit: this.currentLimit,
      })
    }, 10000) // Check every 10 seconds
  }

  private async getSystemLoad(): Promise<number> {
    // Check various metrics
    const cpuUsage = process.cpuUsage()
    const memUsage = process.memoryUsage()
    const activeConnections = await this.getActiveConnections()

    // Calculate load score (0-1)
    const load =
      (memUsage.heapUsed / memUsage.heapTotal) * 0.5 +
      (activeConnections / 1000) * 0.5

    return Math.min(1, load)
  }

  async check(key: string): Promise<boolean> {
    const limit = Math.floor(this.currentLimit)
    // Use regular rate limiting with adjusted limit
    return this.rateLimiter.check(key, limit, 60000)
  }
}
```

### 2. Quota Management

```typescript
// Long-term quotas (monthly limits)
class QuotaManager {
  constructor(private redis: Redis) {}

  async checkQuota(
    userId: string,
    resourceType: string
  ): Promise<{
    allowed: boolean
    used: number
    limit: number
    resetDate: Date
  }> {
    const month = new Date().toISOString().slice(0, 7) // YYYY-MM
    const key = `quota:${userId}:${resourceType}:${month}`

    const user = await this.getUserPlan(userId)
    const limit = this.getQuotaLimit(user.plan, resourceType)

    const script = `
      local limit = tonumber(ARGV[1])
      local used = tonumber(redis.call('GET', KEYS[1]) or 0)

      if used < limit then
        redis.call('INCR', KEYS[1])
        redis.call('EXPIREAT', KEYS[1], ARGV[2])
        return {1, used + 1, limit}
      else
        return {0, used, limit}
      end
    `

    // Calculate end of month timestamp
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
    nextMonth.setHours(0, 0, 0, 0)
    const resetTimestamp = Math.floor(nextMonth.getTime() / 1000)

    const result = await this.redis.eval(
      script,
      1,
      key,
      limit,
      resetTimestamp
    ) as [number, number, number]

    return {
      allowed: result[0] === 1,
      used: result[1],
      limit: result[2],
      resetDate: nextMonth,
    }
  }

  private getQuotaLimit(plan: string, resource: string): number {
    const limits: Record<string, Record<string, number>> = {
      free: { api_calls: 1000, storage_mb: 100 },
      pro: { api_calls: 100000, storage_mb: 10000 },
      enterprise: { api_calls: 1000000, storage_mb: 100000 },
    }

    return limits[plan]?.[resource] || 0
  }
}
```

### 3. Rate Limit Bypass for Premium Users

```typescript
// Hierarchical rate limiting
async function smartRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user

  // No limit for enterprise
  if (user?.plan === 'enterprise') {
    return next()
  }

  // Higher limits for premium
  const limits: Record<string, { max: number; window: number }> = {
    free: { max: 100, window: 60 * 60 * 1000 },
    pro: { max: 1000, window: 60 * 60 * 1000 },
  }

  const config = limits[user?.plan || 'free']
  const key = user?.id || req.ip

  const result = await rateLimiter.check(key, config.max, config.window)

  res.setHeader('X-RateLimit-Limit', config.max)
  res.setHeader('X-RateLimit-Remaining', result.remaining)
  res.setHeader('X-RateLimit-Plan', user?.plan || 'free')

  if (!result.allowed) {
    // Offer upgrade for free users
    const response: any = {
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    }

    if (user?.plan === 'free') {
      response.upgrade = {
        message: 'Upgrade to Pro for 10x higher limits',
        url: '/upgrade',
      }
    }

    return res.status(429).json(response)
  }

  next()
}
```

### 4. Geo-Based Rate Limiting

```typescript
// Different limits per region
class GeoRateLimiter {
  private regionLimits: Record<string, number> = {
    'US': 1000,
    'EU': 1000,
    'AS': 500,
    'default': 100,
  }

  async check(
    key: string,
    region: string
  ): Promise<{ allowed: boolean; limit: number }> {
    const limit = this.regionLimits[region] || this.regionLimits.default

    const result = await rateLimiter.check(
      `${region}:${key}`,
      limit,
      60 * 60 * 1000
    )

    return {
      allowed: result.allowed,
      limit,
    }
  }
}

// Middleware with geo detection
async function geoRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip
  const region = await getRegionFromIP(ip) // Use GeoIP service

  const result = await geoLimiter.check(req.user?.id || ip, region)

  res.setHeader('X-RateLimit-Region', region)
  res.setHeader('X-RateLimit-Limit', result.limit)

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded for region',
      region,
    })
  }

  next()
}
```

## Production Examples

### Example 1: Complete Rate Limiting System

```typescript
// rate-limiter.ts
import { Redis } from 'ioredis'
import { Request, Response, NextFunction } from 'express'

interface RateLimitConfig {
  global: { max: number; window: number }
  perUser: { max: number; window: number }
  perEndpoint: Record<string, { max: number; window: number }>
}

const config: RateLimitConfig = {
  global: { max: 10000, window: 60000 }, // 10k/min globally
  perUser: { max: 100, window: 60000 }, // 100/min per user
  perEndpoint: {
    'POST /auth/login': { max: 5, window: 60000 },
    'POST /auth/register': { max: 3, window: 60000 },
    'POST /reports': { max: 10, window: 3600000 },
  },
}

export class RateLimitService {
  constructor(private redis: Redis) {}

  async checkAll(req: Request): Promise<{
    allowed: boolean
    reason?: string
    retryAfter?: number
  }> {
    // 1. Global limit
    const globalCheck = await this.check(
      'global',
      config.global.max,
      config.global.window
    )

    if (!globalCheck.allowed) {
      return {
        allowed: false,
        reason: 'Global rate limit exceeded',
        retryAfter: globalCheck.retryAfter,
      }
    }

    // 2. Per-user limit
    if (req.user) {
      const userCheck = await this.check(
        `user:${req.user.id}`,
        config.perUser.max,
        config.perUser.window
      )

      if (!userCheck.allowed) {
        return {
          allowed: false,
          reason: 'User rate limit exceeded',
          retryAfter: userCheck.retryAfter,
        }
      }
    }

    // 3. Per-endpoint limit
    const endpoint = `${req.method} ${req.route?.path}`
    const endpointConfig = config.perEndpoint[endpoint]

    if (endpointConfig) {
      const key = req.user
        ? `endpoint:${req.user.id}:${endpoint}`
        : `endpoint:${req.ip}:${endpoint}`

      const endpointCheck = await this.check(
        key,
        endpointConfig.max,
        endpointConfig.window
      )

      if (!endpointCheck.allowed) {
        return {
          allowed: false,
          reason: `Endpoint rate limit exceeded: ${endpoint}`,
          retryAfter: endpointCheck.retryAfter,
        }
      }
    }

    return { allowed: true }
  }

  private async check(
    key: string,
    max: number,
    windowMs: number
  ): Promise<{ allowed: boolean; retryAfter: number }> {
    const identifier = `rate_limit:${key}:${Math.floor(Date.now() / windowMs)}`

    const script = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('PEXPIRE', KEYS[1], ARGV[2])
      end
      local ttl = redis.call('PTTL', KEYS[1])
      return {current, ttl}
    `

    const result = await this.redis.eval(
      script,
      1,
      identifier,
      max,
      windowMs
    ) as [number, number]

    return {
      allowed: result[0] <= max,
      retryAfter: result[1],
    }
  }
}

// Middleware
export function rateLimitMiddleware(limiter: RateLimitService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await limiter.checkAll(req)

      if (!result.allowed) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', Math.ceil(result.retryAfter / 1000))
        }

        return res.status(429).json({
          error: result.reason || 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        })
      }

      next()
    } catch (error) {
      // Fail open - allow request if rate limiting fails
      logger.error('Rate limiting error', error)
      next()
    }
  }
}
```

### Example 2: GraphQL Rate Limiting

```typescript
// Cost-based for GraphQL queries
import { Plugin } from '@envelop/core'
import { getComplexity, simpleEstimator } from 'graphql-query-complexity'

interface QueryCostConfig {
  maximumCost: number
  variables?: Record<string, any>
  onComplete?: (cost: number) => void
}

export function costBasedRateLimiting(
  limiter: RateLimitService
): Plugin {
  return {
    onExecute({ args }) {
      const { schema, document, variableValues, contextValue } = args

      // Calculate query complexity
      const complexity = getComplexity({
        schema,
        query: document,
        variables: variableValues,
        estimators: [
          simpleEstimator({ defaultComplexity: 1 }),
        ],
      })

      const userId = contextValue.user?.id

      // Check if user has enough quota
      return {
        async onExecuteDone({ result }) {
          if (userId) {
            await limiter.consumePoints(userId, complexity)
          }
        },
      }
    },
  }
}
```

### Example 3: WebSocket Rate Limiting

```typescript
// Rate limit WebSocket messages
import { Server, Socket } from 'socket.io'

class WebSocketRateLimiter {
  private buckets = new Map<string, TokenBucket>()

  constructor(
    private capacity: number,
    private refillRate: number
  ) {}

  check(socketId: string): boolean {
    let bucket = this.buckets.get(socketId)

    if (!bucket) {
      bucket = new TokenBucket(this.capacity, this.refillRate)
      this.buckets.set(socketId, bucket)
    }

    return bucket.tryConsume()
  }

  cleanup(socketId: string) {
    this.buckets.delete(socketId)
  }
}

// Setup
const wsLimiter = new WebSocketRateLimiter(100, 10) // 100 capacity, 10/sec

io.on('connection', (socket: Socket) => {
  socket.on('message', (data) => {
    if (!wsLimiter.check(socket.id)) {
      socket.emit('error', {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many messages',
      })
      return
    }

    // Process message
    handleMessage(data)
  })

  socket.on('disconnect', () => {
    wsLimiter.cleanup(socket.id)
  })
})
```

## Best Practices

### 1. Choose the Right Algorithm
- **Token Bucket**: Best for allowing bursts
- **Fixed Window**: Simple, but has boundary issues
- **Sliding Window**: Most accurate, higher memory
- **Leaky Bucket**: Smooth traffic, no bursts

### 2. Set Appropriate Headers
```typescript
res.setHeader('X-RateLimit-Limit', limit)
res.setHeader('X-RateLimit-Remaining', remaining)
res.setHeader('X-RateLimit-Reset', resetTime)
res.setHeader('Retry-After', retryAfter)
```

### 3. Fail Open on Errors
```typescript
try {
  const allowed = await rateLimiter.check(key)
  if (!allowed) return res.status(429).send()
} catch (error) {
  logger.error('Rate limiter error', error)
  // Allow request to continue
}
```

### 4. Use Distributed Storage
- Use Redis for multi-instance apps
- Consider Redis Cluster for scale
- Use hash tags for same-key routing

### 5. Monitor and Alert
```typescript
if (limitExceeded) {
  metrics.increment('rate_limit.exceeded', {
    endpoint: req.path,
    userId: req.user?.id,
  })
}
```

## Common Pitfalls

### 1. Fixed Window Boundary Issue
```typescript
// BAD - Can get 2x requests at window boundary
// User makes 100 requests at :59
// User makes 100 requests at :01
// Total: 200 in 2 seconds

// GOOD - Use sliding window
```

### 2. Not Handling Redis Failure
```typescript
// BAD - Crashes if Redis is down
const count = await redis.incr(key)

// GOOD - Graceful degradation
try {
  const count = await redis.incr(key)
} catch (error) {
  logger.error('Redis error', error)
  return true // Allow request
}
```

### 3. Memory Leaks with In-Memory Storage
```typescript
// BAD - Never cleans up
private counts = new Map()

// GOOD - Regular cleanup
setInterval(() => this.cleanup(), 60000)
```

### 4. Incorrect Key Generation
```typescript
// BAD - Same limit for all users
const key = 'api'

// GOOD - Per-user limits
const key = `user:${userId}`
```

### 5. Not Considering Costs
```typescript
// BAD - Same cost for all operations
await limiter.check(key, 1)

// GOOD - Cost-based limiting
const cost = getCost(req)
await limiter.check(key, cost)
```

## Resources

### Libraries
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible)
- [bottleneck](https://github.com/SGrondin/bottleneck)
- [ioredis](https://github.com/luin/ioredis)

### Documentation
- [RFC 6585](https://tools.ietf.org/html/rfc6585) - Rate Limiting Headers
- [IETF Draft](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers) - RateLimit Headers
- [Redis Documentation](https://redis.io/commands)

### Algorithms
- [Token Bucket](https://en.wikipedia.org/wiki/Token_bucket)
- [Leaky Bucket](https://en.wikipedia.org/wiki/Leaky_bucket)
- [Generic Cell Rate Algorithm](https://en.wikipedia.org/wiki/Generic_cell_rate_algorithm)

### Tools
- [Upstash](https://upstash.com/) - Serverless Redis
- [Redis Cloud](https://redis.com/cloud/) - Managed Redis
- [Kong](https://konghq.com/) - API Gateway with rate limiting
