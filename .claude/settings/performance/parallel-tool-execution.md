# Parallel Tool Execution

Enable parallel execution of independent tool calls. Significantly improves performance for multi-step operations.

## Overview

When enabled, Claude can execute multiple independent tool calls simultaneously instead of sequentially. Dramatically improves performance for operations like reading multiple files, running parallel searches, or making concurrent API calls.

## Configuration

**Category:** Performance
**Type:** Boolean
**Default:** true
**Recommended:** true for all environments

## Usage

```bash
# Enable parallel execution (default)
npx @gicm/cli settings add performance/parallel-tool-execution --value true

# Disable parallel execution
npx @gicm/cli settings add performance/parallel-tool-execution --value false
```

## Performance Impact

**Speed Improvements:**
- Reading 10 files: 10x faster (parallel vs sequential)
- Multiple grep searches: 5-8x faster
- Concurrent API calls: 3-5x faster
- Mixed operations: 2-4x faster on average

## When It Helps Most

1. **File Operations:** Reading multiple files simultaneously
2. **Search Operations:** Running multiple grep/glob patterns
3. **API Calls:** Concurrent requests to different endpoints
4. **Mixed Workflows:** Combining reads, searches, and API calls

## Affected Components

- `project-coordinator` - Orchestrates parallel file operations
- `fullstack-orchestrator` - Manages concurrent frontend/backend tasks
- `context-sculptor` - Parallel context gathering

## Considerations

**When to Disable:**
- Debugging sequential execution issues
- Rate-limited APIs (use `rate-limit-per-hour` instead)
- Memory-constrained environments

**Trade-offs:**
- **Pro:** Much faster execution
- **Pro:** Better resource utilization
- **Con:** Slightly higher memory usage
- **Con:** More complex error handling

## Examples

### Maximum Performance
```json
{
  "parallel-tool-execution": true,
  "batch-operation-size": 50,
  "network-timeout": 30000
}
```

### Conservative (Rate-Limited APIs)
```json
{
  "parallel-tool-execution": false,
  "rate-limit-per-hour": 1000
}
```

## Related Settings

- `batch-operation-size` - Control batch size for bulk operations
- `network-timeout` - Timeout for network operations
- `rate-limit-per-hour` - Prevent exceeding API rate limits

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
