# Bundle Analyzer Enabled

Enable bundle analysis for frontend builds. Identifies optimization opportunities.

## Overview

Automatically runs bundle analyzer after builds to identify large dependencies, duplicate code, and optimization opportunities. Essential for keeping bundle sizes small.

## Configuration

**Category:** Optimization
**Type:** Boolean
**Default:** false
**Recommended:** true for development

## Usage

```bash
# Enable bundle analysis
npx @gicm/cli settings add optimization/bundle-analyzer-enabled --value true

# Disable bundle analysis (default)
npx @gicm/cli settings add optimization/bundle-analyzer-enabled --value false
```

## Analysis Output

**After build completes:**
```
📦 Bundle Analysis

Total bundle size: 487 KB (gzipped: 142 KB)

Breakdown by chunk:
  ├─ main.js: 245 KB (35% of total)
  ├─ vendor.js: 189 KB (28% of total)
  ├─ polyfills.js: 53 KB (8% of total)
  └─ Other: 200 KB (29% of total)

Largest dependencies:
  1. next: 127 KB
  2. react-dom: 89 KB
  3. @solana/web3.js: 56 KB
  4. recharts: 45 KB
  5. lucide-react: 23 KB

💡 Optimization opportunities:
  - Remove unused lucide icons (save ~15 KB)
  - Use dynamic import for recharts (save ~45 KB)
  - Tree-shake @solana/web3.js (save ~20 KB)

Potential savings: 80 KB (16% reduction)
```

## Interactive Visualization

**Open browser visualization:**
```bash
# After build with analyzer enabled
# Opens http://localhost:8888 with interactive treemap
```

**Treemap shows:**
- File sizes as boxes (larger = bigger file)
- Colors by module type
- Click to drill down into dependencies
- Hover for detailed stats

## Affected Components

- `bundler-optimizer` - Bundle optimization
- `performance-profiler` - Performance analysis

## Analysis Configuration

**Configure analysis:**
```json
{
  "bundle-analyzer-enabled": true,
  "analyzer": {
    "mode": "static",
    "report-filename": "bundle-report.html",
    "open-browser": false,
    "generate-stats-file": true,
    "exclude-patterns": [
      "**/node_modules/**",
      "**/*.map"
    ]
  }
}
```

## Budget Enforcement

**Set bundle size budgets:**
```json
{
  "bundle-analyzer-enabled": true,
  "budgets": {
    "main": {
      "max-size-kb": 250,
      "fail-on-exceed": true
    },
    "vendor": {
      "max-size-kb": 200,
      "fail-on-exceed": true
    },
    "total": {
      "max-size-kb": 500,
      "warn-threshold-kb": 450
    }
  }
}
```

**Budget exceeded:**
```
❌ Bundle size budget exceeded

main.js: 287 KB / 250 KB budget (115%)
  Exceeded by: 37 KB

Build failed due to bundle size budget violation.
Review and optimize before deploying.
```

## Optimization Suggestions

**Automatic suggestions:**
```
💡 Bundle Optimization Suggestions

1. Code Splitting
   Split /dashboard route into separate chunk
   Potential savings: 45 KB

2. Tree Shaking
   @solana/web3.js has unused exports
   Potential savings: 20 KB

3. Dynamic Imports
   recharts only used on /analytics page
   Potential savings: 45 KB

4. Image Optimization
   5 images not optimized
   Potential savings: 120 KB

Total potential savings: 230 KB (47% reduction)

Apply suggestions? [Y/n]
```

## CI/CD Integration

**Fail builds on regressions:**
```json
{
  "bundle-analyzer-enabled": true,
  "ci-mode": {
    "enabled": true,
    "fail-on-regression": true,
    "regression-threshold-kb": 10
  }
}
```

## Related Settings

- `tree-shaking` - Enable tree shaking
- `code-splitting-strategy` - Code splitting config
- `image-optimization` - Optimize images

## Examples

### Development Configuration
```json
{
  "bundle-analyzer-enabled": true,
  "analyzer": {
    "mode": "static",
    "open-browser": true
  },
  "budgets": {
    "total": {
      "max-size-kb": 500,
      "warn-threshold-kb": 450
    }
  }
}
```

### Production CI/CD
```json
{
  "bundle-analyzer-enabled": true,
  "ci-mode": {
    "enabled": true,
    "fail-on-regression": true,
    "regression-threshold-kb": 5
  },
  "budgets": {
    "main": {
      "max-size-kb": 200,
      "fail-on-exceed": true
    }
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
