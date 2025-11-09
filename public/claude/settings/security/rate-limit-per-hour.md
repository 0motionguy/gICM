# Rate Limit Per Hour

Maximum API requests per hour. Recommended: 1000 for development, 5000 for production.

## Overview

Sets rate limit for API requests to prevent runaway costs and detect potential issues. When limit is reached, Claude will pause and warn before continuing.

## Configuration

**Category:** Security
**Type:** Number
**Default:** 1000
**Range:** 10-100000

## Usage

```bash
# Install with default value (1000)
npx @gicm/cli settings add security/rate-limit-per-hour

# Install with custom value (5000)
npx @gicm/cli settings add security/rate-limit-per-hour --value 5000
```

## Recommendations

| Environment | Recommended Value | Rationale |
|-------------|-------------------|-----------|
| Development | 1000 | Prevent accidental overuse |
| Production | 5000 | Allow high throughput |
| CI/CD | 2000 | Moderate usage for automation |
| Testing | 500 | Limit test suite costs |

## Cost Protection

**Claude Sonnet 4.5 Pricing (example):**
- 1000 requests/hour → Max ~$150/hour (at 100k tokens/request)
- 5000 requests/hour → Max ~$750/hour
- 500 requests/hour → Max ~$75/hour

## How It Works

1. **Tracks requests** in rolling 60-minute window
2. **Warns at 80%** of limit
3. **Pauses at 100%** with confirmation prompt
4. **Resets automatically** after 60 minutes

## Warning Levels

**Green (0-70%):**
- No warnings
- Normal operation

**Yellow (70-90%):**
```
⚠️  Approaching rate limit: 850/1000 requests this hour
Current rate: ~14 requests/minute
```

**Red (90-100%):**
```
❌ Rate limit nearly reached: 950/1000 requests this hour
⏸️  Consider pausing operations or increasing limit
```

**Blocked (100%+):**
```
🛑 Rate limit exceeded: 1000/1000 requests this hour
Operations paused. Continue anyway? [y/N]
Rate limit resets in: 23 minutes
```

## Bypass for Emergencies

**Temporary bypass:**
```bash
# Disable for current session
npx @gicm/cli settings override rate-limit-per-hour --value 999999
```

**Permanent increase:**
```bash
# Update settings permanently
npx @gicm/cli settings add security/rate-limit-per-hour --value 10000
```

## Monitoring

**View current usage:**
```bash
npx @gicm/cli status rate-limit
# Output: 342/1000 requests this hour (34%)
```

**View usage history:**
```bash
npx @gicm/cli logs rate-limit --days 7
```

## Related Settings

- `batch-operation-size` - Control batch sizes
- `parallel-tool-execution` - May increase request rate
- `audit-log-enabled` - Log all API requests

## Examples

### Cost-Conscious Development
```json
{
  "rate-limit-per-hour": 500,
  "token-budget-limit": 50000
}
```

### Production
```json
{
  "rate-limit-per-hour": 5000,
  "token-budget-limit": 200000
}
```

### CI/CD
```json
{
  "rate-limit-per-hour": 2000,
  "batch-operation-size": 10
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
