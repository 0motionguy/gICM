# Slow Query Threshold

Log queries exceeding threshold in milliseconds. Recommended: 1000ms for database queries.

## Overview

Logs database queries, API calls, and operations that exceed the specified threshold. Helps identify performance issues and optimization opportunities.

## Configuration

**Category:** Monitoring
**Type:** Number
**Default:** 1000 (1 second)
**Range:** 0-60000 ms

## Usage

```bash
# Default threshold (1 second)
npx @gicm/cli settings add monitoring/slow-query-threshold-ms

# Custom threshold (500ms)
npx @gicm/cli settings add monitoring/slow-query-threshold-ms --value 500

# Disable slow query logging (0)
npx @gicm/cli settings add monitoring/slow-query-threshold-ms --value 0
```

## What Gets Logged

**Database Queries:**
- SQL queries (Postgres, MySQL, SQLite)
- NoSQL operations (MongoDB, Redis)
- ORM queries (Prisma, TypeORM)

**API Calls:**
- External API requests
- RPC calls (Solana, Ethereum)
- MCP server calls

**File Operations:**
- Large file reads
- Bulk file writes
- Search operations

## Slow Query Log

**Log format:**
```
🐌 Slow query detected (1,247ms)

Type: Database Query
Query: SELECT * FROM users WHERE created_at > NOW() - INTERVAL '30 days'
Duration: 1,247ms
Threshold: 1,000ms

Suggestions:
- Add index on users.created_at
- Use LIMIT to reduce result set
- Consider caching results
```

**JSON log:**
```json
{
  "timestamp": "2025-11-08T10:30:45.123Z",
  "type": "database_query",
  "query": "SELECT * FROM users ...",
  "duration_ms": 1247,
  "threshold_ms": 1000,
  "suggestions": [
    "Add index on users.created_at",
    "Use LIMIT to reduce result set"
  ]
}
```

## Affected Components

- `database-schema-oracle` - Database optimization

## Automatic Optimization

**Auto-suggest optimizations:**
```json
{
  "slow-query-threshold-ms": 1000,
  "auto-optimize": {
    "enabled": true,
    "suggest-indexes": true,
    "suggest-caching": true,
    "apply-suggestions": false
  }
}
```

**Suggestions:**
```
🔧 Optimization suggestions for slow query:

1. Add index:
   CREATE INDEX idx_users_created_at ON users(created_at);

2. Add caching:
   Cache key: users:last_30_days
   TTL: 3600 seconds

Apply suggestions? [y/N]
```

## Thresholds by Operation Type

**Configure per operation:**
```json
{
  "slow-query-threshold-ms": 1000,
  "thresholds": {
    "database": 1000,
    "api": 3000,
    "rpc": 5000,
    "file": 500
  }
}
```

## Alert Integration

**Send alerts for slow queries:**
```json
{
  "slow-query-threshold-ms": 1000,
  "alerts": {
    "enabled": true,
    "webhook": "${SLACK_WEBHOOK_URL}",
    "threshold-multiplier": 3
  }
}
```

**Alert example:**
```
🚨 Critical slow query

Query exceeded threshold by 3x (3,124ms vs 1,000ms threshold)
Query: UPDATE tokens SET price = ...
Impact: High (production database)
```

## Recommendations

| Operation Type | Threshold | Rationale |
|----------------|-----------|-----------|
| Database reads | 1000ms | Standard queries |
| Database writes | 2000ms | Writes are slower |
| RPC calls | 5000ms | Network latency |
| API calls | 3000ms | External dependencies |
| File operations | 500ms | Local I/O |

## Related Settings

- `monitoring-dashboard` - Visualize slow queries
- `performance-profiling` - Detailed profiling
- `database-schema-oracle` - Query optimization

## Examples

### Production Configuration
```json
{
  "slow-query-threshold-ms": 1000,
  "thresholds": {
    "database": 1000,
    "rpc": 5000
  },
  "alerts": {
    "enabled": true,
    "webhook": "${SLACK_WEBHOOK_URL}"
  },
  "auto-optimize": {
    "suggest-indexes": true
  }
}
```

### Development Configuration
```json
{
  "slow-query-threshold-ms": 500,
  "auto-optimize": {
    "enabled": true,
    "suggest-indexes": true,
    "suggest-caching": true
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
