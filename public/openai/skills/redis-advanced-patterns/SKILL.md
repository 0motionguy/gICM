# Redis Advanced Patterns

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Redis Streams, Bloom filters, HyperLogLog, Geospatial indexing, and advanced data structures.

## Core Concepts

### Streams (Message Queues)
Time-series data structure for message passing.

```typescript
// Add to stream
await redis.xadd('events', '*', 'type', 'user.created', 'data', JSON.stringify({...}));

// Read stream
const messages = await redis.xrange('events', '-', '+');

// Consumer groups
await redis.xgroup('CREATE', 'events', 'mygroup', '$', 'MKSTREAM');
const pending = await redis.xreadgroup('GROUP', 'mygroup', 'consumer1', 'STREAMS', 'events', '>');
```

### Bloom Filters
Probabilistic data structure for membership testing.

```typescript
// Add items
await redis.bf.add('user-emails', 'user@example.com');

// Check membership (with false positives)
const exists = await redis.bf.exists('user-emails', 'user@example.com');
```

### HyperLogLog
Estimate cardinality without storing all elements.

```typescript
// Add unique values
await redis.pfadd('daily-users', 'user1', 'user2', 'user3');

// Get cardinality estimate
const count = await redis.pfcount('daily-users'); // ~3
```

### Geospatial Indexing
Location-based queries.

```typescript
// Add locations
await redis.geoadd('stores', 13.361389, 38.115556, 'Palermo', 14.556667, 37.316667, 'Catania');

// Find nearby
const nearby = await redis.georadius('stores', 15, 37, 200, 'km');
```

## Best Practices

1. **Stream Retention**: Set MAXLEN for memory efficiency
2. **Consumer Group**: Use for reliable message processing
3. **Bloom Filter Tuning**: Consider false positive rate
4. **Geospatial Accuracy**: Remember Redis uses Mercator projection
5. **Lua Scripting**: Use for atomic operations

## Related Skills

- Caching Strategies & Hierarchies
- Rate Limiting (Advanced)
- Message Queue Patterns

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1234 | **Remixes**: 412
