# Skill Cache TTL

Time to live for cached skill content in seconds. Recommended: 3600 (1 hour) for production.

## Overview

Controls how long skill content is cached before being reloaded. Helps reduce token usage by caching progressive disclosure content. Set to 0 to disable caching.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 3600 (1 hour)
**Range:** 0-86400 (0-24 hours)

## Usage

```bash
# Install with default value (1 hour)
npx @gicm/cli settings add performance/skill-cache-ttl

# Install with custom value (2 hours)
npx @gicm/cli settings add performance/skill-cache-ttl --value 7200
```

## Recommendations

| Environment | Recommended Value | Rationale |
|-------------|-------------------|-----------|
| Production | 3600 (1 hour) | Balance between performance and freshness |
| Development | 0 (disabled) | Always get latest skill content |
| CI/CD | 1800 (30 minutes) | Moderate caching for builds |
| Local Development | 0 or 300 (5 min) | Quick iteration |

## Performance Impact

- **Token Savings:** Up to 88-92% reduction when using progressive disclosure
- **Response Time:** 2-3x faster skill invocations with cache hits
- **Memory Usage:** ~50KB per cached skill (minimal)

## Cache Invalidation

Cache is automatically cleared when:
1. TTL expires
2. Skill files are modified
3. gICM stack is restarted
4. Manual cache clear command is run

## Related Settings

- `lazy-skill-loading` - Enable progressive disclosure for skills
- `compression-enabled` - Compress cached skill content

## Examples

### Production Configuration
```json
{
  "skill-cache-ttl": 3600,
  "lazy-skill-loading": true,
  "compression-enabled": true
}
```

### Development Configuration
```json
{
  "skill-cache-ttl": 0,
  "lazy-skill-loading": true
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
