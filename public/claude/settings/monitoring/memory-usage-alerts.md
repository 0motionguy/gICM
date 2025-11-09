# Memory Usage Alerts

Alert on high memory usage. Threshold in MB. Recommended: 1024 for most systems.

## Overview

Monitors memory usage and alerts when threshold is exceeded. Helps prevent out-of-memory errors and identifies memory leaks. Set to 0 to disable alerts.

## Configuration

**Category:** Monitoring
**Type:** Number
**Default:** 0 (disabled)
**Range:** 0-32768 MB

## Usage

```bash
# Enable with 1GB threshold
npx @gicm/cli settings add monitoring/memory-usage-alerts --value 1024

# Enable with 2GB threshold
npx @gicm/cli settings add monitoring/memory-usage-alerts --value 2048

# Disable alerts (default)
npx @gicm/cli settings add monitoring/memory-usage-alerts --value 0
```

## Memory Monitoring

**Checks performed:**
- Current heap usage
- Total allocated memory
- RSS (Resident Set Size)
- External memory (buffers, etc.)

**Alert triggers:**
```
⚠️  High memory usage detected

Current: 1,247 MB
Threshold: 1,024 MB
Trend: Increasing (+45 MB in last minute)

Possible memory leak detected.
Run garbage collection? [Y/n]
```

## Alert Levels

**Green (0-70% of threshold):**
- No alerts
- Normal operation

**Yellow (70-90% of threshold):**
```
⚠️  Approaching memory limit
Current: 870 MB / 1024 MB (85%)
Consider optimizing or increasing threshold
```

**Red (90-100% of threshold):**
```
🔴 Memory usage critical
Current: 980 MB / 1024 MB (96%)
Garbage collection recommended
```

**Critical (>100% of threshold):**
```
❌ Memory threshold exceeded
Current: 1,247 MB / 1024 MB (122%)

Operation may fail due to memory constraints.
Options:
1. Force garbage collection
2. Increase threshold
3. Abort operation
```

## Memory Leak Detection

**Automatic detection:**
```json
{
  "memory-usage-alerts": 1024,
  "leak-detection": {
    "enabled": true,
    "sample-interval-ms": 10000,
    "growth-threshold-mb": 50,
    "window-minutes": 5
  }
}
```

**Leak detected:**
```
🔍 Possible memory leak detected

Memory growth: +250 MB in 5 minutes
Heap snapshots saved:
  - .claude/profiling/heap-1.heapsnapshot
  - .claude/profiling/heap-2.heapsnapshot

Analyze with: node --inspect
```

## Garbage Collection

**Force GC when threshold exceeded:**
```json
{
  "memory-usage-alerts": 1024,
  "auto-gc": {
    "enabled": true,
    "threshold-percent": 90
  }
}
```

## Recommendations by Use Case

| Use Case | Threshold | Rationale |
|----------|-----------|-----------|
| Small projects | 512 MB | Lightweight operations |
| Medium projects | 1024 MB | Standard development |
| Large codebases | 2048 MB | Complex operations |
| CI/CD | 1536 MB | Controlled environment |
| Production | 4096 MB | High availability |

## Related Settings

- `performance-profiling` - Track memory usage
- `monitoring-dashboard` - Send metrics
- `batch-operation-size` - Reduce memory usage

## Examples

### Development Configuration
```json
{
  "memory-usage-alerts": 1024,
  "leak-detection": {
    "enabled": true
  },
  "auto-gc": {
    "enabled": true,
    "threshold-percent": 90
  }
}
```

### Production Configuration
```json
{
  "memory-usage-alerts": 4096,
  "leak-detection": {
    "enabled": true,
    "sample-interval-ms": 60000
  }
}
```

### Disable Alerts
```json
{
  "memory-usage-alerts": 0
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
