# /filtering-gen

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Advanced filtering implementation with multi-field, nested, and range queries. Type-safe filtering with database optimization.

## Usage

```bash
/filtering-gen
/filtering-gen --database=postgresql
/filtering-gen --with-complex-queries
```

## Features

- **Multi-field Filtering**: Filter by multiple columns simultaneously
- **Range Queries**: Support for numeric and date ranges
- **Nested Filtering**: Filter related/joined entities
- **Full-text Search**: Text search across fields
- **Type-safe Filters**: TypeScript inference for filter types
- **Dynamic Filter Building**: Build filters programmatically
- **Optimization**: Automatic index suggestions
- **Validation**: Zod schema for filter validation
- **API Contract**: OpenAPI documentation generation

## Configuration

```yaml
filtering:
  database: "postgresql"
  orm: "prisma"
  includeValidation: true
  generateOpenAPI: true
  optimization: true
  supportedOperators:
    - eq
    - ne
    - gt
    - lt
    - gte
    - lte
    - in
    - contains
    - startsWith
```

## Example Output

```typescript
// Generated filter types and utilities
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Zod validation schema for filters
const userFilterSchema = z.object({
  // Simple equality
  id: z.string().optional(),
  email: z.string().optional(),

  // Ranges
  age: z.object({
    gte: z.number().optional(),
    lte: z.number().optional(),
  }).optional(),

  createdAt: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }).optional(),

  // Arrays/Multiple values
  status: z.array(z.enum(['active', 'inactive', 'pending'])).optional(),

  // Text search
  search: z.string().optional(),

  // Nested filtering
  organization: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
}).strict();

export type UserFilters = z.infer<typeof userFilterSchema>;

// Build Prisma filters from input
export function buildUserFilters(
  input: Partial<UserFilters>
): Parameters<typeof prisma.user.findMany>[0]['where'] {
  const validated = userFilterSchema.parse(input);
  const where: any = {};

  if (validated.id) {
    where.id = validated.id;
  }

  if (validated.email) {
    where.email = {
      contains: validated.email,
      mode: 'insensitive',
    };
  }

  if (validated.age) {
    where.age = {
      ...(validated.age.gte !== undefined && { gte: validated.age.gte }),
      ...(validated.age.lte !== undefined && { lte: validated.age.lte }),
    };
  }

  if (validated.createdAt) {
    where.createdAt = {
      ...(validated.createdAt.gte && { gte: validated.createdAt.gte }),
      ...(validated.createdAt.lte && { lte: validated.createdAt.lte }),
    };
  }

  if (validated.status && validated.status.length > 0) {
    where.status = { in: validated.status };
  }

  if (validated.search) {
    where.OR = [
      { name: { contains: validated.search, mode: 'insensitive' } },
      { email: { contains: validated.search, mode: 'insensitive' } },
    ];
  }

  if (validated.organization) {
    where.organization = buildOrganizationFilters(
      validated.organization
    );
  }

  return where;
}

// Express endpoint
import { Router, Request } from 'express';

const router = Router();

router.get('/users', async (req: Request, res) => {
  const filters = await userFilterSchema
    .parseAsync(req.query)
    .catch(() => ({}));

  const users = await prisma.user.findMany({
    where: buildUserFilters(filters),
    include: {
      organization: true,
      posts: { take: 5 },
    },
  });

  res.json({
    data: users,
    count: users.length,
  });
});

export default router;
```

## Query Examples

```bash
# Simple filtering
GET /users?email=john@example.com&status=active

# Range filtering
GET /users?age[gte]=18&age[lte]=65

# Array filtering
GET /users?status=active&status=pending

# Text search
GET /users?search=john

# Nested filtering
GET /users?organization[id]=org_123

# Complex combination
GET /users?status=active&age[gte]=18&search=john&organization[id]=org_123
```

## Options

- `--database`: Database type (postgresql, mysql, mongodb)
- `--orm`: ORM (prisma, typeorm, sequelize)
- `--with-validation`: Include Zod validation
- `--with-complex-queries`: Advanced filter combinations
- `--output`: Custom output directory

## See Also

- `/pagination-gen` - Pagination implementation
- `/sorting-gen` - Sorting setup
- `/search-optimize` - Search optimization
