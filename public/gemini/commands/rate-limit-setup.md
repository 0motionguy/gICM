# /rate-limit-setup

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Implement rate limiting with multiple strategies: sliding window, token bucket, leaky bucket, and distributed rate limiting for scalability.

## Usage

```bash
/rate-limit-setup
/rate-limit-setup --strategy=token-bucket
/rate-limit-setup --framework=express
```

## Features

- **Multiple Strategies**: Sliding window, token bucket, leaky bucket
- **Per-User Rate Limits**: Different limits for authenticated users
- **IP-based Limiting**: Prevent abuse from single sources
- **Endpoint-specific Limits**: Different limits per endpoint
- **Distributed Rate Limiting**: Redis backend for multi-instance
- **Grace Periods**: Burst capacity with cooldown
- **Custom Headers**: X-RateLimit-* headers for clients
- **Webhook Triggering**: Actions on limit exceeded
- **Framework Integration**: Express, Fastify, NestJS, etc

## Configuration

```yaml
rateLimit:
  strategy: "token-bucket" # sliding-window, token-bucket, leaky-bucket
  backend: "redis" # memory, redis
  windowSize: 3600 # seconds (1 hour)
  maxRequests: 1000 # per window
  perUser: 5000
  perIP: 1000
  burstCapacity: 100
  refillRate: 10 # tokens per second
```

## Example Output

```typescript
// Generated rate limiter (Express)
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const redisClient = redis.createClient();

// Global rate limiter
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Per-user rate limiter
export const userLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:',
  }),
  keyGenerator: (req, res) => req.user?.id || req.ip,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5000, // authenticated users
  skip: (req) => !req.user, // Skip for non-authenticated
});

// API endpoint specific
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
});

// Usage
app.use('/api/', globalLimiter);
app.use('/api/', userLimiter);
app.get('/api/data', apiLimiter, (req, res) => {
  res.json({ data: [] });
});
```

## Rate Limit Headers

```
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1636382400
```

## Strategies Comparison

| Strategy | Use Case | Memory | Accuracy |
|----------|----------|--------|----------|
| Sliding Window | High accuracy needed | High | Excellent |
| Token Bucket | Burst allowed | Medium | Good |
| Leaky Bucket | Smooth traffic | Medium | Good |

## Options

- `--strategy`: Limiting strategy
- `--backend`: Storage backend (memory, redis)
- `--window-size`: Time window in seconds
- `--max-requests`: Max requests per window
- `--framework`: Target framework
- `--output`: Custom output path

## See Also

- `/cors-config` - CORS configuration
- `/cache-strategy` - Caching optimization
- `/monitoring-setup` - Performance monitoring
