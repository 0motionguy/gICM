# Network Timeout

Network operation timeout in milliseconds. Recommended: 30000ms for most operations.

## Overview

Sets the timeout for all network operations including API calls, RPC requests, and external service connections. Adjust based on your network conditions and service reliability.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 30000 (30 seconds)
**Range:** 5000-120000 ms

## Usage

```bash
# Install with default value (30s)
npx @gicm/cli settings add performance/network-timeout

# Install with custom value (60s)
npx @gicm/cli settings add performance/network-timeout --value 60000
```

## Recommendations

| Network Type | Recommended Value | Rationale |
|-------------|-------------------|-----------|
| Local Network | 10000ms (10s) | Fast local connections |
| Broadband | 30000ms (30s) | Standard internet |
| Mobile/Satellite | 60000ms (60s) | Higher latency connections |
| Blockchain RPC | 45000ms (45s) | Account for network congestion |

## Affected Operations

- HTTP/HTTPS API calls
- Blockchain RPC requests
- Database connections
- Webhook deliveries
- File downloads
- MCP server calls

## Timeout Strategy

**Exponential Backoff:**
1. First attempt: Full timeout
2. Retry 1: 50% of timeout
3. Retry 2: 75% of timeout
4. Retry 3: Full timeout

## Related Settings

- `mcp-timeout-duration` - Specific timeout for MCP servers
- `mcp-retry-attempts` - Number of retry attempts
- `batch-operation-size` - May affect total timeout

## Examples

### Fast Network Configuration
```json
{
  "network-timeout": 15000,
  "mcp-timeout-duration": 10000
}
```

### Slow/Unreliable Network
```json
{
  "network-timeout": 60000,
  "mcp-timeout-duration": 45000,
  "mcp-retry-attempts": 5
}
```

### Blockchain-Heavy Workload
```json
{
  "network-timeout": 45000,
  "mcp-retry-attempts": 3
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
