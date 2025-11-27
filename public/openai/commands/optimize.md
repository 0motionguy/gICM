# Command: /optimize

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Performance optimization with profiling, bottleneck detection, and benchmarking

## Description

The `/optimize` command profiles your application, identifies performance bottlenecks, and implements optimization strategies. It covers runtime performance, memory usage, network efficiency, and database query optimization.

## Usage

```bash
/optimize [target] [--focus=<area>] [--benchmark]
```

## Arguments

- `target` (optional) - Specific component, route, or query to optimize
- `--focus` - Focus area: `runtime`, `memory`, `network`, `database`, `bundle` (default: `all`)
- `--benchmark` - Run before/after benchmarks to measure improvements

## Examples

### Example 1: Full application optimization
```bash
/optimize --benchmark
```
Profiles entire application and implements optimizations with benchmarks.

### Example 2: Database query optimization
```bash
/optimize --focus=database
```
Analyzes and optimizes database queries, indexes, and connection pooling.

### Example 3: Bundle size optimization
```bash
/optimize --focus=bundle
```
Reduces bundle size through code splitting, tree shaking, and lazy loading.

## Optimization Strategies

- **Runtime**: Memoization, algorithmic improvements, caching
- **Memory**: Garbage collection tuning, memory leak detection
- **Network**: Request batching, compression, CDN usage
- **Database**: Query optimization, indexing, connection pooling
- **Bundle**: Code splitting, tree shaking, dynamic imports

## Related Commands

- `/performance-audit` - Comprehensive performance analysis
- `/gas-report` - Smart contract gas optimization (blockchain)
- `/test-coverage` - Ensure optimizations don't break functionality
