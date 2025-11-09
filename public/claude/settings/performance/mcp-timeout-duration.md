# MCP Timeout Duration

Maximum time to wait for MCP server responses before timeout (milliseconds).

## Overview

Controls how long Claude Code will wait for responses from Model Context Protocol (MCP) servers before timing out the request. This setting affects all MCP integrations including database connections, API servers, and custom MCP implementations.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 30000 (30 seconds)
**Range:** 5000-300000 ms

## Usage

```bash
# Install with default value
npx @gicm/cli settings add performance/mcp-timeout-duration

# Install with custom value (60 seconds)
npx @gicm/cli settings add performance/mcp-timeout-duration --value 60000
```

## Recommendations

| Environment | Recommended Value | Rationale |
|-------------|-------------------|-----------|
| Production | 30000ms (30s) | Balance between reliability and responsiveness |
| Development | 60000ms (60s) | More time for debugging and slower connections |
| CI/CD | 45000ms (45s) | Account for variable CI runner performance |
| Local Development | 15000ms (15s) | Fast feedback for local operations |

## Affected Components

This setting affects the following components:

### MCPs
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

### Agents
- Any agent that uses MCP servers indirectly

## Performance Impact

- **Lower values (5-15s):** Faster failure detection, better responsiveness, but may cause false timeouts on slow networks
- **Higher values (60-120s):** More reliable on unstable connections, but slower error feedback

## Considerations

1. **Network Conditions:** Adjust based on your network reliability
2. **MCP Server Location:** Increase timeout for remote/cloud MCP servers
3. **Operation Complexity:** Complex operations (e.g., large database queries) may need higher timeouts
4. **User Experience:** Balance between patience and perceived performance

## Troubleshooting

### Frequent Timeouts
If experiencing frequent MCP timeouts:
1. Increase timeout duration
2. Check network connectivity
3. Verify MCP server is running
4. Review MCP server logs for performance issues

### Slow Operations
If operations feel too slow:
1. Decrease timeout for faster failure detection
2. Optimize MCP server performance
3. Use `mcp-retry-attempts` for automatic retries
4. Consider caching frequently accessed data

## Related Settings

- `mcp-retry-attempts` - Number of retry attempts after timeout
- `network-timeout` - General network operation timeout
- `parallel-tool-execution` - May help reduce perceived timeout impact

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

## ICM Motion Optimization

For the ICM Motion launch platform specifically:
- **Bonding Curve Calculations:** 15000ms (local operations should be fast)
- **Token Launch Operations:** 45000ms (blockchain operations may take longer)
- **Real-time Feed Updates:** 10000ms (real-time data needs fast failure detection)
- **Database Queries:** 30000ms (standard operations)

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
