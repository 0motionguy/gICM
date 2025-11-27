# /pagination-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Generate pagination logic with cursor-based and offset-based strategies, including client and server implementations for optimal performance.

## Usage

```bash
/pagination-gen
/pagination-gen --strategy=cursor
/pagination-gen --database=postgresql
```

## Features

- **Cursor-based Pagination**: Scalable, efficient for large datasets
- **Offset-based Pagination**: Traditional limit/offset approach
- **Keyset Pagination**: Efficient for large result sets
- **Server Implementation**: Express, Fastify, NestJS endpoints
- **Client Implementation**: React hooks, Vue composables
- **Database Integration**: PostgreSQL, MySQL, MongoDB
- **ORM Support**: Prisma, TypeORM, Sequelize
- **Type Safety**: Full TypeScript support
- **Edge Cases**: Handle empty results, sorting, filtering

## Configuration

```yaml
pagination:
  strategy: "cursor" # cursor, offset, keyset
  pageSize: 20
  defaultSort: "-createdAt"
  database: "postgresql"
  orm: "prisma" # prisma, typeorm, sequelize
  includeClientCode: true
  includeServerCode: true
```

## Example Output

```typescript
// Server: Cursor-based pagination (Prisma)
import { Router } from 'express';
import { prisma } from '@/lib/prisma';

const router = Router();

interface PaginationParams {
  cursor?: string;
  limit?: number;
  sort?: string;
}

export async function getPaginatedUsers(
  params: PaginationParams
) {
  const { cursor, limit = 20, sort = '-createdAt' } = params;

  const isDesc = sort.startsWith('-');
  const sortBy = sort.replace(/^-/, '');

  const results = await prisma.user.findMany({
    take: limit + 1, // Fetch one extra to detect if there's next
    ...(cursor && {
      skip: 1, // Skip the cursor
      cursor: { id: cursor },
    }),
    orderBy: {
      [sortBy]: isDesc ? 'desc' : 'asc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  const hasMore = results.length > limit;
  const items = results.slice(0, limit);
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    items,
    pageInfo: {
      hasMore,
      cursor: nextCursor,
    },
  };
}

router.get('/users', async (req, res) => {
  const { cursor, limit, sort } = req.query;

  const result = await getPaginatedUsers({
    cursor: cursor as string,
    limit: Math.min(parseInt(limit as string) || 20, 100),
    sort: (sort as string) || '-createdAt',
  });

  res.json(result);
});

export default router;
```

```typescript
// Client: React hook for cursor pagination
import { useState, useCallback } from 'react';

export function usePaginatedUsers(pageSize = 20) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(
    async (nextCursor?: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: pageSize.toString(),
          ...(nextCursor && { cursor: nextCursor }),
        });

        const response = await fetch(`/api/users?${params}`);
        const { items: newItems, pageInfo } = await response.json();

        setItems(prev =>
          nextCursor ? [...prev, ...newItems] : newItems
        );
        setCursor(pageInfo.cursor);
        setHasMore(pageInfo.hasMore);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(() => {
    if (cursor && hasMore) {
      fetchPage(cursor);
    }
  }, [cursor, hasMore, fetchPage]);

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
  };
}
```

## Pagination Strategies

| Type | Use Case | Performance | Scalability |
|------|----------|-------------|------------|
| Cursor | Large datasets, infinite scroll | Excellent | Excellent |
| Offset | Small to medium datasets | Good | Limited |
| Keyset | Very large datasets | Excellent | Excellent |

## Options

- `--strategy`: Pagination type (cursor, offset, keyset)
- `--page-size`: Default page size
- `--database`: Database type (postgresql, mysql, mongodb)
- `--orm`: ORM to use (prisma, typeorm, sequelize)
- `--client`: Include client code
- `--server`: Include server code

## See Also

- `/filtering-gen` - Filtering implementation
- `/sorting-gen` - Sorting setup
- `/search-optimize` - Search optimization
