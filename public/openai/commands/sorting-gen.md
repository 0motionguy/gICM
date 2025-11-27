# /sorting-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Multi-column sorting setup with sort direction, priority, and database query optimization. Type-safe sorting with performance considerations.

## Usage

```bash
/sorting-gen
/sorting-gen --database=postgresql
/sorting-gen --multi-column
```

## Features

- **Multi-column Sorting**: Sort by multiple fields with priority
- **Sort Direction**: Ascending and descending support
- **Type Safety**: Full TypeScript type inference
- **Query Optimization**: Proper index suggestions
- **ORM Integration**: Prisma, TypeORM, Sequelize support
- **API Contract**: OpenAPI documentation
- **Validation**: Zod schema for sort parameters
- **Client Utilities**: React hooks for sorting state
- **Performance**: Automatic index recommendations

## Configuration

```yaml
sorting:
  database: "postgresql"
  orm: "prisma"
  defaultSort: "-createdAt" # '-' prefix for desc
  maxSortFields: 3 # limit multi-column sorts
  includeIndexing: true
  generateValidation: true
```

## Example Output

```typescript
// Generated sorting utilities
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Valid sort fields for users
const USER_SORT_FIELDS = [
  'id',
  'name',
  'email',
  'status',
  'createdAt',
  'updatedAt',
  'age',
] as const;

// Zod validation schema
const sortParamSchema = z.object({
  sort: z.array(
    z.enum([
      ...USER_SORT_FIELDS,
      ...USER_SORT_FIELDS.map(f => `-${f}`),
    ])
  ).default(['-createdAt']),
});

export type SortParams = z.infer<typeof sortParamSchema>;

// Parse sort parameters
export function parseSortParams(sortStr?: string): SortParams {
  const sorts = sortStr?.split(',') || ['-createdAt'];
  return sortParamSchema.parse({ sort: sorts });
}

// Build Prisma orderBy from sort params
export function buildOrderBy(sorts: string[]) {
  const orderBy: Record<string, 'asc' | 'desc'>[] = [];

  for (const sort of sorts) {
    if (!sort) continue;

    const isDesc = sort.startsWith('-');
    const field = sort.replace(/^-/, '');

    if (!USER_SORT_FIELDS.includes(field as any)) {
      continue; // Skip invalid fields
    }

    orderBy.push({
      [field]: isDesc ? 'desc' : 'asc',
    });
  }

  return orderBy.length > 0
    ? orderBy
    : [{ createdAt: 'desc' }];
}

// Database query with sorting
export async function getUsersWithSorting(
  sortParams: SortParams
) {
  const orderBy = buildOrderBy(sortParams.sort);

  return prisma.user.findMany({
    orderBy,
    take: 100,
  });
}

// Express endpoint
import { Router, Request } from 'express';

const router = Router();

router.get('/users', async (req: Request, res) => {
  const { sort } = await sortParamSchema
    .parseAsync({ sort: req.query.sort })
    .catch(() => ({ sort: ['-createdAt'] }));

  const users = await getUsersWithSorting({ sort });

  res.json({
    data: users,
    sort,
  });
});

export default router;
```

```typescript
// Client: React hook for sorting
import { useState, useCallback } from 'react';

interface SortState {
  fields: string[];
  directions: Record<string, 'asc' | 'desc'>;
}

export function useSorting(defaultSort = '-createdAt') {
  const [sortState, setSortState] = useState<SortState>({
    fields: [defaultSort],
    directions: {},
  });

  const setSortBy = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      setSortState(prev => ({
        fields: [field],
        directions: { [field]: direction },
      }));
    },
    []
  );

  const addSort = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      setSortState(prev => {
        if (prev.fields.includes(field)) {
          return prev; // Already sorting by this
        }
        return {
          fields: [...prev.fields.slice(-2), field], // Keep last 3
          directions: {
            ...prev.directions,
            [field]: direction,
          },
        };
      });
    },
    []
  );

  const getSortParams = useCallback(() => {
    return sortState.fields
      .map(
        f =>
          `${
            sortState.directions[f] === 'desc' ? '-' : ''
          }${f}`
      )
      .join(',');
  }, [sortState]);

  return {
    sortState,
    setSortBy,
    addSort,
    getSortParams,
  };
}
```

## Query Examples

```bash
# Single sort
GET /users?sort=-createdAt

# Multi-column sort
GET /users?sort=-status,name,age

# Ascending/Descending
GET /users?sort=name,-createdAt
```

## Database Indexes

```sql
-- Recommended indexes for sorting
CREATE INDEX idx_users_createdAt DESC;
CREATE INDEX idx_users_status_name (status, name);
CREATE INDEX idx_users_age_name (age, name);
```

## Options

- `--database`: Database type (postgresql, mysql, mongodb)
- `--orm`: ORM (prisma, typeorm, sequelize)
- `--multi-column`: Enable multi-column sorting
- `--with-validation`: Include Zod validation
- `--output`: Custom output directory

## See Also

- `/filtering-gen` - Filtering implementation
- `/pagination-gen` - Pagination setup
- `/search-optimize` - Search optimization
