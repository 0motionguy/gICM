# /perf-trace

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Comprehensive performance profiling and tracing for Node.js and browser applications. Identifies bottlenecks, generates flame graphs, and provides optimization recommendations.

## Usage

```bash
/perf-trace
/perf-trace --target=node
/perf-trace --target=browser
```

## Features

- **Flame Graphs**: Visualize CPU usage over time
- **Node.js Profiling**: V8 profiler integration for CPU and memory
- **Browser Performance**: Navigation, resource, and user timing APIs
- **Memory Profiling**: Heap snapshots and allocation tracking
- **CPU Sampling**: Identify hot spots and bottlenecks
- **Timeline Analysis**: Detailed execution traces with call stacks
- **Recommendations**: Automated optimization suggestions

## Configuration

```yaml
profiling:
  target: "node" # node, browser, both
  duration: 30 # seconds
  sampleRate: 100 # samples per second
  memory: true
  flamegraph: true
  outputFormat: "html" # html, json, svg
```

## Example Output

```
Top 10 Hot Spots:
1. computeHash (45.2%) - crypto.ts:128
2. parseJSON (28.3%) - parser.ts:45
3. queryDatabase (15.1%) - db.ts:234
4. renderComponent (8.2%) - react.ts:89
5. serialization (3.2%) - utils.ts:12
```

## Options

- `--duration`: Profile duration in seconds
- `--target`: Profile target (node, browser, both)
- `--memory`: Include memory profiling
- `--format`: Output format (html, json, svg)
- `--output`: Custom output file path

## See Also

- `/bundle-analyze` - Bundle size analysis
- `/cache-strategy` - Caching optimization
- `/lighthouse-check` - Web performance audit
