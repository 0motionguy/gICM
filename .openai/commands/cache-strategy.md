# /cache-strategy

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Optimize caching strategies including Redis configuration, HTTP caching, in-memory caching patterns, and cache invalidation strategies.

## Usage

```bash
/cache-strategy
/cache-strategy --type=redis
/cache-strategy --analyze
```

## Features

- **Cache Layer Design**: Choose optimal cache layer (Redis, Memcached, in-memory)
- **TTL Strategy**: Calculate optimal time-to-live values
- **Invalidation Patterns**: Cache-aside, write-through, write-behind
- **Cache Warming**: Pre-populate cache for better hit rates
- **Compression**: Enable compression for large objects
- **Distributed Caching**: Multi-instance cache synchronization
- **Cache Metrics**: Hit rate, miss rate, performance impact
- **Eviction Policies**: LRU, LFU, random, TTL-based

## Configuration

```yaml
caching:
  layers:
    - type: "memory" # in-process cache
      ttl: 3600
      maxSize: "100mb"
    - type: "redis" # distributed cache
      ttl: 86400
      url: "redis://localhost:6379"
  invalidationStrategy: "cache-aside"
  compressionThreshold: "1kb"
  metrics: true
```

## Example Output

```
Cache Strategy Analysis
=======================

Recommended Configuration:
1. In-Memory Cache (Hot Data)
   - TTL: 5 minutes
   - Items: User sessions, feature flags
   - Hit Rate Target: 85%

2. Redis Cache (Warm Data)
   - TTL: 1 hour
   - Items: API responses, computed results
   - Hit Rate Target: 70%

3. Database (Cold Data)
   - Fallback for cache misses

Invalidation Strategy: Cache-Aside
  On write: Invalidate related cache keys
  On read: Check cache, fetch on miss

Estimated Performance Improvement: 3.2x faster
```

## Options

- `--type`: Cache type (redis, memcached, memory)
- `--analyze`: Analyze current caching patterns
- `--ttl`: Default time-to-live value
- `--strategy`: Invalidation strategy
- `--metrics`: Enable cache metrics

## See Also

- `/perf-trace` - Performance profiling
- `/load-test` - Scalability testing
- `/monitoring-setup` - Cache monitoring
