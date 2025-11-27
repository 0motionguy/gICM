# Command: /benchmark

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


> Performance benchmarking with statistical analysis and comparison

## Description

The `/benchmark` command runs performance benchmarks on your code, generates statistical reports, compares against baselines, and identifies performance regressions. Supports Node.js, browser, and smart contract benchmarking.

## Usage

```bash
/benchmark [target] [--compare=<baseline>] [--iterations=<n>]
```

## Arguments

- `target` (optional) - Specific function or module to benchmark
- `--compare` - Compare against baseline or previous commit
- `--iterations` - Number of iterations (default: 1000)

## Examples

### Example 1: Benchmark critical functions
```bash
/benchmark src/utils/calculations.ts --iterations=10000
```
Runs 10,000 iterations and reports statistical analysis.

### Example 2: Compare against baseline
```bash
/benchmark --compare=main
```
Benchmarks current branch vs main branch.

### Example 3: Smart contract gas benchmarking
```bash
/benchmark contracts/ --iterations=100
```
Benchmarks gas usage for smart contract functions.

## Metrics Reported

- **Execution time**: Mean, median, p95, p99
- **Memory usage**: Heap size, allocations
- **Throughput**: Operations per second
- **Variance**: Standard deviation, coefficient of variation

## Related Commands

- `/optimize` - Optimize based on benchmark results
- `/gas-report` - Smart contract gas benchmarking
- `/performance-audit` - Comprehensive performance analysis
