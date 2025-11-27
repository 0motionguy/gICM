# /search-optimize

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Search optimization with indexing strategies, full-text search, fuzzy matching, and result ranking. Improve search performance and relevance.

## Usage

```bash
/search-optimize
/search-optimize --type=fulltext
/search-optimize --database=postgresql
```

## Features

- **Full-Text Search**: PostgreSQL, MySQL, Elasticsearch support
- **Fuzzy Matching**: Handle typos and approximate matches
- **Ranking Algorithm**: TF-IDF, BM25, custom scoring
- **Autocomplete**: Type-ahead search suggestions
- **Filter Integration**: Combine search with filters
- **Faceted Search**: Aggregate results by categories
- **Performance Analysis**: Query performance metrics
- **Index Suggestions**: Automatic index recommendations
- **Search Analytics**: Track popular searches

## Configuration

```yaml
search:
  type: "fulltext" # fulltext, fuzzy, hybrid
  database: "postgresql" # postgresql, mysql, elasticsearch
  algorithm: "bm25" # bm25, tfidf, custom
  rankingFields:
    - title: 3 # weight 3
    - description: 1
    - tags: 2
  fuzzyThreshold: 0.8
  autocomplete: true
  analytics: true
```

## Example Output

```typescript
// PostgreSQL Full-Text Search
import { prisma } from '@/lib/prisma';

// Search with ranking
export async function searchUsers(
  query: string,
  filters?: { status?: string }
) {
  return prisma.$queryRaw`
    SELECT
      id,
      name,
      email,
      ts_rank(
        to_tsvector('english', name || ' ' || email),
        plainto_tsquery('english', ${query})
      ) as relevance
    FROM users
    WHERE
      to_tsvector('english', name || ' ' || email) @@
      plainto_tsquery('english', ${query})
      ${filters?.status ? `AND status = ${filters.status}` : ''}
    ORDER BY relevance DESC, createdAt DESC
    LIMIT 20
  `;
}

// Fuzzy matching (using pg_trgm extension)
export async function searchUsersFuzzy(query: string) {
  return prisma.$queryRaw`
    SELECT
      id,
      name,
      email,
      similarity(name, ${query}) as match_score
    FROM users
    WHERE name % ${query}
    ORDER BY match_score DESC
    LIMIT 20
  `;
}

// Autocomplete suggestions
export async function getUserSuggestions(prefix: string) {
  return prisma.$queryRaw`
    SELECT DISTINCT
      LEFT(name, ${prefix.length}) as suggestion,
      COUNT(*) as count
    FROM users
    WHERE name ILIKE ${prefix + '%'}
    GROUP BY suggestion
    ORDER BY count DESC
    LIMIT 10
  `;
}
```

```typescript
// Elasticsearch Integration
import { Client } from '@elastic/elasticsearch';

const es = new Client({ node: 'http://localhost:9200' });

export async function indexUser(user: any) {
  await es.index({
    index: 'users',
    id: user.id,
    body: {
      name: user.name,
      email: user.email,
      bio: user.bio,
      tags: user.tags,
      createdAt: user.createdAt,
    },
  });
}

export async function searchUsersES(
  query: string,
  filters?: any
) {
  const results = await es.search({
    index: 'users',
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^3', 'email^2', 'bio'],
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: buildFilters(filters),
        },
      },
      sort: ['_score', { createdAt: 'desc' }],
      size: 20,
    },
  });

  return results.hits.hits.map(hit => ({
    ...hit._source,
    score: hit._score,
  }));
}
```

## Index Creation Examples

```sql
-- PostgreSQL Full-Text Search Index
CREATE INDEX idx_users_fulltext ON users
USING GIN (to_tsvector('english', name || ' ' || email));

-- PostgreSQL Fuzzy Matching (requires pg_trgm)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_users_trgm ON users USING GIN (name gin_trgm_ops);

-- Regular B-tree indexes
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
```

## Search Quality Metrics

```
Query: "john smith"

Result Rankings:
1. John Smith (exact match) - score: 1.0
2. John Smythe (fuzzy match) - score: 0.95
3. Jon Smith (partial) - score: 0.85
4. Smith, John (reordered) - score: 0.75

Autocomplete Suggestions:
- "john" (453 matches)
- "johnson" (234 matches)
- "jonathan" (187 matches)
```

## Options

- `--type`: Search type (fulltext, fuzzy, hybrid)
- `--database`: Backend (postgresql, mysql, elasticsearch)
- `--algorithm`: Ranking algorithm (bm25, tfidf)
- `--fuzzy`: Enable fuzzy matching
- `--autocomplete`: Enable autocomplete
- `--analytics`: Enable search analytics

## See Also

- `/filtering-gen` - Filtering implementation
- `/pagination-gen` - Pagination
- `/sorting-gen` - Sorting
