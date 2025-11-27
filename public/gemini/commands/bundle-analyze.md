# /bundle-analyze

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Analyze bundle size, identify bloated dependencies, and generate actionable optimization recommendations. Supports webpack, esbuild, Vite, and Parcel.

## Usage

```bash
/bundle-analyze
/bundle-analyze --entry=src/index.ts
/bundle-analyze --format=treemap
```

## Features

- **Bundle Size Visualization**: Treemap, sunburst, and flame graph views
- **Dependency Analysis**: Identify duplicate and unused dependencies
- **Code Splitting Suggestions**: Recommend optimal code split points
- **Import Chain Analysis**: Track where large dependencies originate
- **Compression Analysis**: Show gzip and brotli sizes
- **Bundle Timeline**: Track size changes over time
- **Performance Impact**: Estimate load time impact

## Configuration

```yaml
bundleAnalysis:
  format: "treemap" # treemap, sunburst, flame, table
  gzip: true
  brotli: true
  minSize: "50kb" # Report sizes above threshold
  trackHistory: true
  baseline: "main"
```

## Example Output

```
Total Bundle Size: 2.45 MB
  Gzip: 842 KB
  Brotli: 734 KB

Top 10 Largest Modules:
1. @mui/material (512 KB) - Could tree-shake
2. lodash (234 KB) - Replace with lodash-es
3. moment.js (89 KB) - Consider date-fns
4. axios (64 KB) - Use fetch alternative
```

## Options

- `--format`: Visualization format (treemap, sunburst, flame)
- `--gzip`: Include gzip compression analysis
- `--brotli`: Include brotli compression analysis
- `--output`: Custom output directory
- `--baseline`: Compare against baseline

## See Also

- `/perf-trace` - Performance profiling
- `/deps-upgrade` - Dependency management
- `/lighthouse-check` - Web performance
