# Documentation Automation

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


Master automated documentation generation, API docs, code comments, and living documentation systems.

## Quick Reference

```typescript
/**
 * Transfers tokens from one account to another
 *
 * @param from - Source account address
 * @param to - Destination account address
 * @param amount - Amount of tokens to transfer (in smallest unit)
 * @returns Transaction hash
 * @throws {InsufficientBalanceError} When sender has insufficient balance
 * @throws {InvalidAddressError} When address is invalid
 *
 * @example
 * ```typescript
 * const tx = await transfer('0x123...', '0x456...', 1000n)
 * console.log(`Transaction: ${tx}`)
 * ```
 */
async function transfer(
  from: string,
  to: string,
  amount: bigint
): Promise<string> {
  // Implementation
}
```

## Core Concepts

### JSDoc/TSDoc Comments

```typescript
/**
 * User service for managing user accounts
 *
 * @public
 */
export class UserService {
  /**
   * Creates a new user
   *
   * @param data - User creation data
   * @returns Newly created user
   *
   * @remarks
   * This method sends a welcome email asynchronously
   *
   * @beta
   */
  async createUser(data: CreateUserDto): Promise<User> {
    // ...
  }
}
```

### OpenAPI/Swagger Generation

```typescript
// TypeScript with decorators (NestJS example)
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'User list retrieved successfully',
    type: [UserDto]
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<UserDto[]> {
    return this.userService.findAll({ page, limit })
  }
}
```

### GraphQL Documentation

```graphql
"""
User account in the system
"""
type User {
  "Unique user identifier"
  id: ID!

  "User's email address"
  email: String!

  "User's display name"
  name: String!

  "User creation timestamp"
  createdAt: DateTime!
}

"""
Creates a new user account
"""
type Mutation {
  """
  @param input - User creation data
  @returns Newly created user
  @throws ValidationError if email is already taken
  """
  createUser(input: CreateUserInput!): User!
}
```

## Automated Documentation Tools

### TypeDoc (TypeScript)

```bash
# Install
npm install --save-dev typedoc

# Generate docs
npx typedoc --out docs src/index.ts

# With config
# typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "excludePrivate": true,
  "excludeProtected": false,
  "plugin": ["typedoc-plugin-markdown"]
}
```

### Swagger/OpenAPI

```typescript
// With express-openapi
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.ts'],
}

const specs = swaggerJsdoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/users', handler)
```

### Docusaurus (Project Documentation)

```markdown
---
sidebar_position: 1
title: Getting Started
---

# Getting Started

## Installation

\`\`\`bash
npm install my-package
\`\`\`

## Quick Start

\`\`\`typescript
import { MyComponent } from 'my-package'

const app = new MyComponent({
  apiKey: process.env.API_KEY
})
\`\`\`
```

## Code Comment Patterns

### Function Documentation

```typescript
/**
 * Calculates compound interest
 *
 * Uses the formula: A = P(1 + r/n)^(nt)
 *
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Time period in years
 * @param frequency - Compounding frequency per year (default: 12)
 * @returns Final amount after interest
 *
 * @example
 * ```typescript
 * // $1000 at 5% for 10 years, compounded monthly
 * const amount = calculateCompoundInterest(1000, 0.05, 10)
 * console.log(amount) // 1647.01
 * ```
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency: number = 12
): number {
  return principal * Math.pow(1 + rate / frequency, frequency * time)
}
```

### Class Documentation

```typescript
/**
 * Database connection pool manager
 *
 * Manages a pool of reusable database connections for improved performance.
 * Implements connection recycling and automatic cleanup.
 *
 * @example
 * ```typescript
 * const pool = new ConnectionPool({
 *   min: 2,
 *   max: 10,
 *   idleTimeoutMillis: 30000
 * })
 *
 * const client = await pool.acquire()
 * try {
 *   const result = await client.query('SELECT * FROM users')
 * } finally {
 *   pool.release(client)
 * }
 * ```
 */
export class ConnectionPool {
  /**
   * Creates a new connection pool
   *
   * @param options - Pool configuration options
   */
  constructor(options: PoolOptions) {
    // ...
  }
}
```

## Living Documentation

### README-Driven Development

```markdown
# My Feature

## Problem
Users can't easily filter results by date range.

## Solution
Add date range picker to filter UI with backend support.

## Usage
\`\`\`typescript
import { DateRangeFilter } from './components'

<DateRangeFilter
  onChange={(start, end) => filterData(start, end)}
/>
\`\`\`

## API
\`\`\`
GET /api/items?startDate=2024-01-01&endDate=2024-12-31
\`\`\`

## Testing
\`\`\`bash
npm test -- date-range-filter
\`\`\`
```

### Architecture Decision Records (ADRs)

```markdown
# ADR 001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
We need to choose a database for our application. Requirements:
- ACID compliance
- Support for complex queries
- Strong ecosystem and tooling

## Decision
Use PostgreSQL as our primary database.

## Consequences
**Positive:**
- Excellent SQL support and performance
- Strong data integrity guarantees
- Rich ecosystem (extensions, tools, hosting)

**Negative:**
- More complex to scale horizontally than NoSQL
- Requires careful schema design upfront
```

## Automation Scripts

### Generate API Documentation

```typescript
// scripts/generate-api-docs.ts
import { generateDocs } from './doc-generator'

async function main() {
  const routes = await import('../src/routes')
  const docs = generateDocs(routes)

  await fs.writeFile(
    'docs/api.md',
    docs,
    'utf-8'
  )

  console.log('✓ API documentation generated')
}

main()
```

### Generate Changelog

```bash
#!/bin/bash
# Generate changelog from git commits

git log --pretty=format:"%h - %s (%an, %ar)" --since="1 week ago" > CHANGELOG.md
```

## Best Practices

1. **Document the Why, Not the What**
   ```typescript
   // Bad
   // Increment counter by 1
   counter++

   // Good
   // Retry count must be limited to prevent infinite loops
   // in case of persistent network failures
   if (retryCount > MAX_RETRIES) {
     throw new MaxRetriesError()
   }
   ```

2. **Keep Docs Close to Code**
   - Use JSDoc/TSDoc for functions and classes
   - Keep README in same directory as code
   - Use Storybook for component documentation

3. **Automate Everything**
   - Generate API docs from code
   - Auto-generate changelogs from commits
   - Use CI to validate documentation

4. **Make Docs Searchable**
   - Use consistent terminology
   - Add keywords and tags
   - Implement full-text search

5. **Include Examples**
   - Show real-world usage
   - Provide copy-paste code snippets
   - Include common error scenarios
