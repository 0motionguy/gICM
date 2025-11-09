# MCP Retry Attempts

Maximum number of retry attempts for failed MCP calls. Recommended: 3 for production, 1 for development.

## Overview

Determines how many times Claude Code will retry a failed MCP server call before giving up. Higher values increase reliability but may cause delays. Set to 0 to disable retries.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 3
**Range:** 0-10

## Usage

```bash
# Install with default value
npx @gicm/cli settings add performance/mcp-retry-attempts

# Install with custom value
npx @gicm/cli settings add performance/mcp-retry-attempts --value 3
```

## Recommendations

| Environment | Recommended Value | Rationale |
|-------------|-------------------|-----------|
| Production | 3 | Balance between reliability and speed |
| Development | 1 | Faster failure for debugging |
| CI/CD | 5 | Account for unstable CI environments |
| Local Development | 1 | Quick feedback |

## Affected Components

This setting affects the following MCPs:
- `supabase-mcp` - Database operations
- `github-mcp` - GitHub API calls
- `alchemy-mcp` - Blockchain RPC requests
- `infura-mcp` - Ethereum node access
- `thegraph-mcp` - Subgraph queries
- `quicknode-mcp` - Multi-chain RPC
- `tenderly-mcp` - Smart contract monitoring
- `context7-mcp` - Context management
- `e2b-mcp` - Code execution environments
- `filesystem-mcp` - File system operations

## Retry Strategy

Retries use exponential backoff:
- 1st retry: Wait 1 second
- 2nd retry: Wait 2 seconds
- 3rd retry: Wait 4 seconds
- 4th retry: Wait 8 seconds

## Related Settings

- `mcp-timeout-duration` - Timeout before triggering retry
- `network-timeout` - General network operation timeout

## Examples

### Production Configuration
```json
{
  "mcp-timeout-duration": 30000,
  "mcp-retry-attempts": 3
}
```

### Development Configuration
```json
{
  "mcp-timeout-duration": 60000,
  "mcp-retry-attempts": 1
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
