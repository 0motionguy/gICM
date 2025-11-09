# Batch Operation Size

Maximum items to process in a single batch operation. Recommended: 10 for file operations, 50 for data processing.

## Overview

Controls the batch size for bulk operations like file processing, data transformations, or API calls. Larger batches are more efficient but may hit rate limits or memory constraints.

## Configuration

**Category:** Performance
**Type:** Number
**Default:** 10
**Range:** 1-100

## Usage

```bash
# Install with default value (10)
npx @gicm/cli settings add performance/batch-operation-size

# Install with custom value (50)
npx @gicm/cli settings add performance/batch-operation-size --value 50
```

## Recommendations

| Operation Type | Recommended Size | Rationale |
|----------------|------------------|-----------|
| File Reads | 10-20 | Balance speed and memory |
| File Writes | 5-10 | Ensure data integrity |
| API Calls | 5-10 | Respect rate limits |
| Data Processing | 50-100 | Maximize throughput |
| Database Queries | 20-50 | Optimize query performance |

## Performance Trade-offs

**Larger Batches (50-100):**
- **Pro:** Faster total completion time
- **Pro:** Better CPU utilization
- **Con:** Higher memory usage
- **Con:** May hit rate limits
- **Con:** Harder to recover from errors

**Smaller Batches (5-10):**
- **Pro:** Lower memory usage
- **Pro:** Easier error recovery
- **Pro:** Respects rate limits
- **Con:** Slower overall execution
- **Con:** More overhead

## Use Cases

### Bulk File Processing
```bash
# Process 100 files in batches of 10
npx @gicm/cli settings add performance/batch-operation-size --value 10
```

### Data Transformation
```bash
# Transform large datasets in batches of 50
npx @gicm/cli settings add performance/batch-operation-size --value 50
```

### API Integration
```bash
# API calls with rate limit of 10/second
npx @gicm/cli settings add performance/batch-operation-size --value 5
```

## Related Settings

- `parallel-tool-execution` - Run batches in parallel
- `rate-limit-per-hour` - Control API rate limits
- `network-timeout` - Timeout for batch operations

## Examples

### File-Heavy Operations
```json
{
  "batch-operation-size": 15,
  "parallel-tool-execution": true
}
```

### API-Heavy Operations
```json
{
  "batch-operation-size": 5,
  "rate-limit-per-hour": 1000,
  "network-timeout": 30000
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
