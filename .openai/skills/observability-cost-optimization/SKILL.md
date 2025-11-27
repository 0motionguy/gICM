# Observability Cost Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Sampling strategies, log aggregation, metric cardinality control to reduce observability costs.

## Core Concepts

### Intelligent Sampling
Reduce data volume while maintaining visibility.

```typescript
class HeadBasedSampler {
  sampleTrace(span: Span): boolean {
    // Sample 1% of traces
    return Math.random() < 0.01;
  }
}

class ErrorBasedSampler {
  sampleSpan(span: Span): boolean {
    // Always sample errors, sample 10% of successes
    if (span.status === 'error') return true;
    return Math.random() < 0.1;
  }
}

class DynamicSampler {
  private rates = new Map<string, number>();

  sampleSpan(span: Span): boolean {
    const rate = this.rates.get(span.name) || 0.01;
    return Math.random() < rate;
  }

  adjust(metrics: Metrics): void {
    // Adjust sampling rates based on cost
    for (const [name, rate] of this.rates) {
      if (this.calculateCost(name) > BUDGET) {
        this.rates.set(name, rate * 0.5);  // Reduce sampling
      }
    }
  }
}
```

### Cardinality Management
Control metric explosion.

```typescript
class CardinalityLimiter {
  private cardinality = new Map<string, Set<string>>();

  recordMetric(metric: string, labels: Record<string, string>): void {
    const key = this.createLabelKey(labels);
    if (!this.cardinality.has(metric)) {
      this.cardinality.set(metric, new Set());
    }

    const currentCardinality = this.cardinality.get(metric)!.size;
    if (currentCardinality > MAX_CARDINALITY) {
      console.warn(`High cardinality metric: ${metric}`);
      return;  // Drop metric
    }

    this.cardinality.get(metric)!.add(key);
  }
}
```

### Retention Policies
Graduated data retention.

```yaml
# Datadog agent config
# Keep detailed metrics for 24 hours
- storage_resolution: 1m
  retention_days: 1

# Keep hourly aggregates for 30 days
- storage_resolution: 1h
  retention_days: 30

# Keep daily aggregates for 1 year
- storage_resolution: 1d
  retention_days: 365
```

### Cost Monitoring
Track and optimize spending.

```typescript
class CostMonitor {
  async calculateCost(
    logVolume: number,     // GB/day
    traceCount: number,    // per day
    metricCount: number    // per day
  ): Promise<number> {
    const logCost = logVolume * 0.50;           // $0.50/GB
    const traceCost = traceCount * 0.000001;   // $0.000001/span
    const metricCost = metricCount * 0.00000005; // $0.00000005/metric

    return logCost + traceCost + metricCost;
  }
}
```

## Best Practices

1. **Sampling Strategy**: Use error-based sampling
2. **Label Control**: Limit high-cardinality labels
3. **Aggregation**: Pre-aggregate at source
4. **Retention**: Graduated retention policies
5. **Alerts**: Monitor on sampled data

## Related Skills

- Distributed Tracing
- Monitoring & Observability
- Performance Profiling & Analysis

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 756 | **Remixes**: 212
