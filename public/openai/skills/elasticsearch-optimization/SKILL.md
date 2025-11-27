# Elasticsearch Query Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Query optimization, aggregations, relevance tuning for production search systems.

## Core Concepts

### Query Types
Different query patterns for different use cases.

```typescript
// Filter (fast, no scoring)
const results = await es.search({
  query: {
    bool: {
      filter: [
        { term: { status: 'published' } },
        { range: { date: { gte: '2024-01-01' } } }
      ]
    }
  }
});

// Full-text search (scored)
const results = await es.search({
  query: {
    multi_match: {
      query: 'elasticsearch optimization',
      fields: ['title^2', 'content']
    }
  }
});
```

### Aggregations
Analytics and faceted search.

```typescript
const results = await es.search({
  aggs: {
    by_status: {
      terms: { field: 'status', size: 10 }
    },
    avg_price: {
      avg: { field: 'price' }
    }
  }
});
```

### Relevance Tuning
BM25 algorithm and boosting.

```typescript
const results = await es.search({
  query: {
    bool: {
      must: [
        { match: { title: { query: 'python', boost: 2 } } }
      ],
      should: [
        { match: { tags: 'web' } }
      ]
    }
  }
});
```

## Best Practices

1. **Mapping Strategy**: Define proper field types
2. **Index Sharding**: Balance between shards
3. **Query Efficiency**: Use filters for exact matches
4. **Caching**: Enable query result caching
5. **Monitoring**: Track slow queries

## Related Skills

- Full-Text Search Engine
- Database Migration Strategies
- Caching Strategies & Hierarchies

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 756 | **Remixes**: 234
