# SQL Query Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master database query optimization, indexing strategies, and performance tuning.

## Quick Reference

### Index Creation
```sql
-- B-tree index (default)
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Full-text search
CREATE INDEX idx_posts_content ON posts USING gin(to_tsvector('english', content));
```

### Query Analysis
```sql
-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'test@example.com';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

### Common Optimizations
```sql
-- Use LIMIT for pagination
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 20;

-- Avoid SELECT *
SELECT id, name, email FROM users;

-- Use EXISTS instead of COUNT
SELECT EXISTS(SELECT 1 FROM users WHERE email = 'test@example.com');

-- Join optimization
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON p.user_id = u.id
WHERE u.active = true;
```

## Best Practices

- Create indexes on frequently queried columns
- Use composite indexes for multi-column WHERE clauses
- Avoid functions in WHERE clause (prevents index usage)
- Use connection pooling
- Analyze slow query logs
- Denormalize for read-heavy workloads
- Partition large tables
