# Full-Text Search Engine

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


> Elasticsearch/OpenSearch deployment, text analysis, faceted search, and relevance ranking.

## Core Concepts

### Text Analysis Pipeline
Tokenization, stemming, filtering.

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "tokenizer": "standard",
          "filter": ["lowercase", "stop", "snowball"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "default",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      }
    }
  }
}
```

### Relevance Tuning with BM25
Boost important fields.

```typescript
const query = {
  bool: {
    must: [
      {
        multi_match: {
          query: 'elasticsearch',
          fields: ['title^3', 'content^2', 'tags'],
          type: 'best_fields'
        }
      }
    ],
    should: [
      { term: { featured: { value: true, boost: 2 } } }
    ]
  }
};
```

### Faceted Search
Categorical navigation.

```typescript
const aggs = {
  categories: {
    terms: { field: 'category.keyword', size: 20 }
  },
  price_ranges: {
    range: {
      field: 'price',
      ranges: [
        { to: 100 },
        { from: 100, to: 500 },
        { from: 500 }
      ]
    }
  }
};
```

### Autocomplete
Prefix search for suggestions.

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "completion": {
            "type": "completion"
          }
        }
      }
    }
  }
}
```

## Best Practices

1. **Analyzers**: Match search and index analyzers
2. **Mapping**: Define field types correctly
3. **Sharding**: Balance shard count for search speed
4. **Indexing**: Use bulk API for mass indexing
5. **Monitoring**: Track search latency

## Related Skills

- Elasticsearch Query Optimization
- Caching Strategies & Hierarchies
- Database Migration Strategies

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 934 | **Remixes**: 289
