# SQL Database Expert
> **ID:** `sql-database` | **Tier:** 3 | **Token Cost:** 6000 | **MCP:** postgres, supabase

## What This Skill Does

Master SQL and PostgreSQL database operations including complex queries, schema design, performance optimization, migrations, and PostgreSQL-specific features. Build production-ready database solutions with proper indexing, constraints, and query patterns.

## When to Use

- Writing complex SQL queries with joins, CTEs, and window functions
- Designing normalized database schemas
- Optimizing query performance with indexes and EXPLAIN ANALYZE
- Managing database migrations
- Using PostgreSQL-specific features (JSONB, arrays, full-text search)
- Implementing Row Level Security (RLS)

## Core Capabilities

### 1. Complex SQL Queries

#### Common Table Expressions (CTEs)

```sql
-- Recursive CTE for hierarchical data
WITH RECURSIVE category_tree AS (
  -- Base case: root categories
  SELECT id, name, parent_id, 1 as depth, ARRAY[id] as path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: children
  SELECT c.id, c.name, c.parent_id, ct.depth + 1, ct.path || c.id
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
  WHERE ct.depth < 10  -- Prevent infinite loops
)
SELECT * FROM category_tree ORDER BY path;

-- CTE for complex aggregation
WITH monthly_sales AS (
  SELECT
    DATE_TRUNC('month', created_at) as month,
    SUM(amount) as total,
    COUNT(*) as order_count
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '1 year'
  GROUP BY DATE_TRUNC('month', created_at)
),
running_totals AS (
  SELECT
    month,
    total,
    order_count,
    SUM(total) OVER (ORDER BY month) as cumulative_total,
    AVG(total) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg
  FROM monthly_sales
)
SELECT * FROM running_totals ORDER BY month DESC;
```

#### Window Functions

```sql
-- Ranking within partitions
SELECT
  user_id,
  order_id,
  amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as order_number,
  RANK() OVER (PARTITION BY user_id ORDER BY amount DESC) as amount_rank,
  SUM(amount) OVER (PARTITION BY user_id) as user_total,
  amount::float / SUM(amount) OVER (PARTITION BY user_id) * 100 as pct_of_user_total
FROM orders;

-- Lead/Lag for time series
SELECT
  date,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY date) as prev_day,
  LEAD(revenue, 1) OVER (ORDER BY date) as next_day,
  revenue - LAG(revenue, 1) OVER (ORDER BY date) as day_over_day_change,
  (revenue - LAG(revenue, 1) OVER (ORDER BY date))::float /
    NULLIF(LAG(revenue, 1) OVER (ORDER BY date), 0) * 100 as pct_change
FROM daily_revenue;

-- Running percentiles
SELECT
  date,
  value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value)
    OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_median,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value)
    OVER (ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as p95_30day
FROM metrics;
```

#### Complex Joins

```sql
-- Multi-table join with aggregation
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT o.id) as order_count,
  COALESCE(SUM(o.amount), 0) as total_spent,
  COUNT(DISTINCT p.id) as products_purchased,
  MAX(o.created_at) as last_order_date,
  CASE
    WHEN MAX(o.created_at) > NOW() - INTERVAL '30 days' THEN 'active'
    WHEN MAX(o.created_at) > NOW() - INTERVAL '90 days' THEN 'at_risk'
    ELSE 'churned'
  END as status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE u.created_at >= NOW() - INTERVAL '1 year'
GROUP BY u.id, u.email
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY total_spent DESC;

-- Self-join for comparison
SELECT
  a.product_id,
  a.price as current_price,
  b.price as previous_price,
  a.price - b.price as price_change
FROM product_prices a
JOIN product_prices b ON a.product_id = b.product_id
  AND a.effective_date > b.effective_date
WHERE a.effective_date = (
  SELECT MAX(effective_date)
  FROM product_prices
  WHERE product_id = a.product_id
)
AND b.effective_date = (
  SELECT MAX(effective_date)
  FROM product_prices
  WHERE product_id = a.product_id
  AND effective_date < a.effective_date
);
```

### 2. Schema Design

#### Normalized Schema Example

```sql
-- Users and authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(organization_id, user_id)
);

-- Products and orders
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

#### Triggers for Timestamps

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3. Query Optimization

#### EXPLAIN ANALYZE

```sql
-- Analyze query execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id;

-- Common optimization patterns:
-- 1. Add missing indexes
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 2. Use partial indexes for common filters
CREATE INDEX idx_orders_pending ON orders(created_at)
  WHERE status = 'pending';

-- 3. Use covering indexes
CREATE INDEX idx_products_listing ON products(organization_id, status)
  INCLUDE (name, price);
```

#### Index Strategies

```sql
-- B-tree (default) - equality and range queries
CREATE INDEX idx_orders_created ON orders(created_at);

-- Hash - equality only, smaller and faster
CREATE INDEX idx_users_email_hash ON users USING hash(email);

-- GIN - arrays and JSONB
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_products_metadata ON products USING gin(metadata jsonb_path_ops);

-- GiST - full-text search, geometric types
CREATE INDEX idx_products_search ON products USING gist(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- BRIN - very large tables with natural ordering
CREATE INDEX idx_events_time ON events USING brin(created_at);

-- Partial index - filter common queries
CREATE INDEX idx_active_users ON users(email)
  WHERE deleted_at IS NULL;

-- Expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

#### Query Optimization Techniques

```sql
-- Use EXISTS instead of IN for subqueries
-- Bad:
SELECT * FROM products
WHERE organization_id IN (SELECT id FROM organizations WHERE plan = 'pro');

-- Good:
SELECT * FROM products p
WHERE EXISTS (
  SELECT 1 FROM organizations o
  WHERE o.id = p.organization_id AND o.plan = 'pro'
);

-- Avoid SELECT *
-- Bad:
SELECT * FROM users WHERE id = '...';

-- Good:
SELECT id, email, created_at FROM users WHERE id = '...';

-- Use LIMIT for pagination
SELECT * FROM products
WHERE organization_id = $1
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Better: Cursor-based pagination
SELECT * FROM products
WHERE organization_id = $1
  AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### 4. Migrations

#### Migration File Structure

```sql
-- migrations/001_initial_schema.sql

-- Up migration
BEGIN;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMIT;

-- Down migration (in separate file or section)
-- migrations/001_initial_schema.down.sql
BEGIN;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
COMMIT;
```

#### Safe Migration Patterns

```sql
-- Add column with default (safe)
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';

-- Add NOT NULL column (requires default)
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Create index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_users_status ON users(status);

-- Drop index concurrently
DROP INDEX CONCURRENTLY IF EXISTS idx_users_old;

-- Rename column safely
ALTER TABLE users RENAME COLUMN old_name TO new_name;

-- Change column type (may require rewrite)
ALTER TABLE users ALTER COLUMN status TYPE VARCHAR(50);

-- Add foreign key with validation
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  NOT VALID;  -- Don't validate existing rows

-- Later, validate in background
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user;
```

### 5. PostgreSQL-Specific Features

#### JSONB Operations

```sql
-- Create table with JSONB
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert JSONB
INSERT INTO events (type, data) VALUES
  ('user.signup', '{"user_id": "123", "source": "web", "metadata": {"referrer": "google"}}'::jsonb);

-- Query JSONB fields
SELECT * FROM events
WHERE data->>'user_id' = '123';

SELECT * FROM events
WHERE data @> '{"source": "web"}'::jsonb;

SELECT * FROM events
WHERE data->'metadata'->>'referrer' = 'google';

-- Update JSONB
UPDATE events
SET data = data || '{"processed": true}'::jsonb
WHERE id = '...';

UPDATE events
SET data = jsonb_set(data, '{metadata,processed_at}', to_jsonb(NOW()))
WHERE id = '...';

-- Remove key from JSONB
UPDATE events
SET data = data - 'temporary_field'
WHERE id = '...';

-- Aggregate JSONB
SELECT
  data->>'source' as source,
  COUNT(*) as count,
  jsonb_agg(data->'metadata') as all_metadata
FROM events
GROUP BY data->>'source';
```

#### Full-Text Search

```sql
-- Add full-text search column
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Create trigger to update search vector
CREATE OR REPLACE FUNCTION products_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.metadata->>'tags', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_trigger();

-- Create GIN index
CREATE INDEX idx_products_search ON products USING gin(search_vector);

-- Search queries
SELECT *, ts_rank(search_vector, query) as rank
FROM products, plainto_tsquery('english', 'wireless bluetooth') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;

-- Phrase search
SELECT * FROM products
WHERE search_vector @@ phraseto_tsquery('english', 'noise cancelling');

-- Highlight results
SELECT
  ts_headline('english', description, plainto_tsquery('wireless'), 'StartSel=<b>, StopSel=</b>') as highlighted
FROM products
WHERE search_vector @@ plainto_tsquery('wireless');
```

#### Arrays

```sql
-- Table with array column
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert with array
INSERT INTO posts (title, tags) VALUES
  ('PostgreSQL Tips', ARRAY['postgres', 'database', 'sql']);

-- Query array contains
SELECT * FROM posts WHERE 'postgres' = ANY(tags);
SELECT * FROM posts WHERE tags @> ARRAY['postgres', 'sql'];
SELECT * FROM posts WHERE tags && ARRAY['python', 'javascript'];

-- Array functions
SELECT
  title,
  array_length(tags, 1) as tag_count,
  array_to_string(tags, ', ') as tags_string
FROM posts;

-- Unnest array
SELECT p.id, p.title, t.tag
FROM posts p, unnest(p.tags) as t(tag);

-- Aggregate into array
SELECT
  category_id,
  array_agg(DISTINCT tag ORDER BY tag) as all_tags
FROM posts, unnest(tags) as tag
GROUP BY category_id;
```

#### Row Level Security (RLS)

```sql
-- Enable RLS on table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their orders
CREATE POLICY user_orders_policy ON orders
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Create policy for admins
CREATE POLICY admin_orders_policy ON orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = orders.organization_id
        AND om.user_id = current_setting('app.current_user_id')::uuid
        AND om.role IN ('admin', 'owner')
    )
  );

-- Set user context before queries
SET app.current_user_id = 'user-uuid-here';

-- Force RLS for table owner (important!)
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
```

## Real-World Examples

### Example 1: Analytics Dashboard Query

```sql
WITH date_series AS (
  SELECT generate_series(
    DATE_TRUNC('day', NOW() - INTERVAL '30 days'),
    DATE_TRUNC('day', NOW()),
    '1 day'::interval
  )::date as date
),
daily_metrics AS (
  SELECT
    DATE_TRUNC('day', created_at)::date as date,
    COUNT(*) as orders,
    SUM(total) as revenue,
    COUNT(DISTINCT user_id) as unique_customers
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND status = 'completed'
  GROUP BY DATE_TRUNC('day', created_at)
)
SELECT
  ds.date,
  COALESCE(dm.orders, 0) as orders,
  COALESCE(dm.revenue, 0) as revenue,
  COALESCE(dm.unique_customers, 0) as unique_customers,
  SUM(COALESCE(dm.revenue, 0)) OVER (ORDER BY ds.date) as cumulative_revenue
FROM date_series ds
LEFT JOIN daily_metrics dm ON ds.date = dm.date
ORDER BY ds.date;
```

### Example 2: Customer Cohort Analysis

```sql
WITH user_cohorts AS (
  SELECT
    id as user_id,
    DATE_TRUNC('month', created_at)::date as cohort_month
  FROM users
),
user_activity AS (
  SELECT
    o.user_id,
    DATE_TRUNC('month', o.created_at)::date as activity_month
  FROM orders o
  WHERE o.status = 'completed'
),
cohort_data AS (
  SELECT
    uc.cohort_month,
    ua.activity_month,
    COUNT(DISTINCT ua.user_id) as active_users,
    (ua.activity_month - uc.cohort_month) / 30 as months_since_signup
  FROM user_cohorts uc
  JOIN user_activity ua ON uc.user_id = ua.user_id
  GROUP BY uc.cohort_month, ua.activity_month
)
SELECT
  cohort_month,
  months_since_signup,
  active_users,
  ROUND(100.0 * active_users / FIRST_VALUE(active_users) OVER (
    PARTITION BY cohort_month ORDER BY months_since_signup
  ), 1) as retention_pct
FROM cohort_data
ORDER BY cohort_month, months_since_signup;
```

## Related Skills

- **neon-postgres** - Serverless PostgreSQL
- **prisma-drizzle-orm** - TypeScript ORMs
- **db-commander** - Supabase operations
- **supabase-expert** - Supabase platform

## Further Reading

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Modern SQL](https://modern-sql.com/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
