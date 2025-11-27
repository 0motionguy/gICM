# GraphQL Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master GraphQL performance optimization, N+1 prevention, and query complexity management.

## Quick Reference

### DataLoader (N+1 Prevention)
```typescript
import DataLoader from 'dataloader'

const userLoader = new DataLoader(async (ids: number[]) => {
  const users = await db.users.findMany({
    where: { id: { in: ids } }
  })
  return ids.map(id => users.find(u => u.id === id))
})

// In resolver
const user = await userLoader.load(userId)
```

### Query Complexity Limits
```typescript
import { createComplexityLimitRule } from 'graphql-validation-complexity'

const complexityLimit = createComplexityLimitRule(1000, {
  onCost: (cost) => console.log('Query cost:', cost)
})
```

### Persisted Queries
```typescript
const persistedQueries = {
  'abc123': 'query GetUser($id: ID!) { user(id: $id) { id name } }'
}

// Client sends hash instead of full query
```

## Best Practices

- Use DataLoader for all database lookups
- Implement query depth limiting
- Add pagination to all list fields
- Cache results with Redis
- Use persisted queries in production
- Monitor query complexity and execution time
