# Performance Profiling

Enable performance profiling for operations. Tracks execution time and resource usage.

## Overview

Enables detailed performance profiling for all operations. Tracks execution time, memory usage, and token consumption. Useful for identifying bottlenecks and optimizing workflows.

## Configuration

**Category:** Monitoring
**Type:** Boolean
**Default:** false
**Recommended:** true for development, false for production

## Usage

```bash
# Enable profiling
npx @gicm/cli settings add monitoring/performance-profiling --value true

# Disable profiling (default)
npx @gicm/cli settings add monitoring/performance-profiling --value false
```

## Metrics Collected

**Execution Metrics:**
- Total execution time
- Time per operation
- Parallel vs sequential execution
- Idle time

**Resource Usage:**
- Peak memory usage
- Average memory usage
- CPU time
- Disk I/O

**Token Metrics:**
- Input tokens
- Output tokens
- Cached tokens
- Total cost estimate

## Profiling Output

**Console output:**
```
🔍 Performance Profile

Operation: Generate component
  ├─ Total time: 12.3s
  ├─ API calls: 3 (8.7s)
  ├─ File operations: 15 (0.8s)
  ├─ Type checking: 1 (2.5s)
  └─ Formatting: 5 (0.3s)

Tokens:
  ├─ Input: 45,231
  ├─ Output: 12,847
  └─ Cost: ~$0.42

Memory:
  ├─ Peak: 287 MB
  └─ Average: 156 MB
```

**JSON report:**
```json
{
  "operation": "generate-component",
  "duration_ms": 12300,
  "breakdown": {
    "api_calls": { "count": 3, "duration_ms": 8700 },
    "file_operations": { "count": 15, "duration_ms": 800 },
    "type_checking": { "count": 1, "duration_ms": 2500 },
    "formatting": { "count": 5, "duration_ms": 300 }
  },
  "tokens": {
    "input": 45231,
    "output": 12847,
    "cost_usd": 0.42
  },
  "memory": {
    "peak_mb": 287,
    "average_mb": 156
  }
}
```

## Affected Components

- `performance-profiler` - Profiling orchestration
- `context-sculptor` - Context optimization

## Report Storage

**Save reports:**
```json
{
  "performance-profiling": true,
  "profiling-reports": {
    "enabled": true,
    "directory": ".claude/profiling",
    "format": "json",
    "retention-days": 30
  }
}
```

## Flamegraph Generation

**Generate flamegraphs:**
```bash
# Enable flamegraph generation
npx @gicm/cli settings add monitoring/performance-profiling --value true

# After operation completes
npx @gicm/cli profiling flamegraph --last
```

## Performance Impact

**Profiling overhead:**
- CPU: +2-5%
- Memory: +10-20 MB
- Execution time: +1-3%

**Negligible for development, disable in production.**

## Related Settings

- `monitoring-dashboard` - Send metrics to dashboard
- `slow-query-threshold-ms` - Alert on slow operations
- `cost-tracking` - Track costs

## Examples

### Development Configuration
```json
{
  "performance-profiling": true,
  "profiling-reports": {
    "enabled": true,
    "format": "json"
  }
}
```

### Production (Disabled)
```json
{
  "performance-profiling": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
