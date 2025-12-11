# OPUS 67 Benchmark Protocol

> **MANDATORY**: Run benchmarks on EVERY version upgrade before publishing

## Pre-Release Checklist

Before publishing any new version of OPUS 67 to npm, you MUST complete:

- [ ] Update version in `package.json`
- [ ] Run: `pnpm test:benchmark` - Core performance benchmarks
- [ ] Run: `pnpm benchmark:memory` - Memory system benchmarks
- [ ] Run: `pnpm test:llm` - LLM/AI benchmarks
- [ ] Update `packages/benchmark-results/benchmark-results.json`
- [ ] Update `packages/benchmark-results/benchmark-results.md`
- [ ] Add entry to Historical Results table below
- [ ] Commit benchmark results with version tag
- [ ] Publish to npm

## Benchmark Commands

```bash
# Core benchmarks (boot, skills, caching, memory usage)
cd packages/opus67 && pnpm test:benchmark

# Memory system benchmarks (unified memory, multi-hop, adapters)
cd packages/opus67 && pnpm benchmark:memory

# LLM benchmarks (cache hit rate, cost savings, query latency)
cd packages/opus67 && pnpm test:llm

# Full suite (comprehensive test)
cd packages/opus67 && pnpm test --run
```

## Target Metrics (v6.2.0+)

| Metric          | Target | Acceptable | Critical |
| --------------- | ------ | ---------- | -------- |
| Boot Time       | <100ms | <150ms     | <200ms   |
| Skill Load      | <50ms  | <100ms     | <200ms   |
| Cache Hit Rate  | >85%   | >75%       | >50%     |
| Memory Base     | <100MB | <150MB     | <200MB   |
| Memory Query    | <50ms  | <100ms     | <200ms   |
| Multi-hop Query | <200ms | <500ms     | <1000ms  |
| Cost Savings    | >80%   | >60%       | >40%     |

## Historical Results

| Version   | Date       | Boot  | Skills | Cache | Memory | Cost Savings |
| --------- | ---------- | ----- | ------ | ----- | ------ | ------------ |
| **6.2.0** | 2025-12-11 | 89ms  | 39ms   | 96%   | 160MB  | 86.4%        |
| 6.1.0     | 2025-12-09 | 89ms  | 39ms   | 96%   | 160MB  | 86.4%        |
| 6.0.0     | 2025-12-08 | 70ms  | 30ms   | 85%   | 160MB  | -            |
| 5.1.14    | 2025-12-07 | 102ms | 36ms   | 85%   | 160MB  | -            |

## What Each Benchmark Tests

### Core Benchmarks (`pnpm test:benchmark`)

- Boot screen generation time
- Full boot sequence
- Registry loading (skills, modes, MCPs)
- Skill matching and loading
- Mode detection
- MCP connection lookup
- End-to-end query processing
- Token savings calculations
- Cache warm-up and hit rates
- Memory usage (baseline, peak, leaks)

### Memory Benchmarks (`pnpm benchmark:memory`)

- Semantic query latency
- Keyword search performance
- Multi-hop reasoning (1-5 hops)
- Memory write throughput
- Adapter initialization
- Cross-adapter aggregation

### LLM Benchmarks (`pnpm test:llm`)

- Environment checks (Python, Docker)
- Cache hit rate under load
- Cost savings vs raw prompts
- Memory query response times
- Model routing accuracy

## Interpreting Results

### Pass Criteria

- Core: >50% tests passing
- Memory: Latency <100ms for all query types
- LLM: Cache hit >75%, Cost savings >60%

### Warning Signs

- Boot time >150ms (performance regression)
- Cache hit <75% (caching broken)
- Memory leak detected (memory not reclaimed)
- Peak memory >200MB (memory bloat)

### Action Required If Failing

1. Do NOT publish if critical metrics fail
2. Investigate root cause
3. Fix and re-run benchmarks
4. Only publish when targets met

---

_Last updated: 2025-12-09 (v6.1.0)_
