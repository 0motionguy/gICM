---
name: performance-profiling
description: "CPU profiling, memory profiling, flame graphs, bottleneck identification, and optimization."
version: 1.0.0
author: gICM Community
license: Apache-2.0
---

# Performance Profiling & Analysis

> CPU profiling, memory profiling, flame graphs, bottleneck identification, and optimization.

## Core Concepts

### CPU Profiling
Identify hot code paths.

```bash
# Using py-spy (Python)
py-spy record -o profile.svg python app.py

# Using pprof (Go)
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30

# Using V8 (Node.js)
node --prof app.js
node --prof-process isolate-*.log > processed.txt
```

### Memory Profiling
Identify memory leaks.

```typescript
// Node.js heap snapshot
const heapdump = require('heapdump');
heapdump.writeSnapshot(`./heap-${Date.now()}.heapsnapshot`);

// Chrome DevTools Analysis
// Load .heapsnapshot file to analyze object retention
```

### Flame Graphs
Visualize CPU usage.

```bash
# Generate flame graph from profiling data
./flamegraph.pl input.txt > flamegraph.svg

# Key patterns:
# - Wide frames = CPU time
# - Tall stacks = deep call chains
# - Flat top = CPU work
# - Sawtooth = allocation/deallocation
```

### Systematic Analysis
Methodical bottleneck identification.

```typescript
class Profiler {
  private metrics = new Map<string, number[]>();

  mark(label: string): number {
    return performance.now();
  }

  measure(label: string, startTime: number): void {
    const duration = performance.now() - startTime;
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
  }

  report(): void {
    for (const [label, times] of this.metrics) {
      const avg = times.reduce((a, b) => a + b) / times.length;
      const max = Math.max(...times);
      console.log(`${label}: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
    }
  }
}
```

## Best Practices

1. **Baseline**: Measure before optimization
2. **Real Workload**: Profile with production-like data
3. **Repeated Runs**: Average over multiple runs
4. **Focus on Hot Paths**: 80/20 principle
5. **Monitor Regression**: Track metrics over time

## Related Skills

- Caching Strategies & Hierarchies
- Load Balancing Strategies
- Observability Cost Optimization

---

**Token Savings**: ~850 tokens | **Last Updated**: 2025-11-08 | **Installs**: 1089 | **Remixes**: 334
