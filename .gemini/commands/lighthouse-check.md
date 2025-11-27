# /lighthouse-check

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Run Google Lighthouse performance audit with detailed scoring, Core Web Vitals metrics, and actionable optimization suggestions.

## Usage

```bash
/lighthouse-check
/lighthouse-check --url=https://example.com
/lighthouse-check --categories=performance,pwa
```

## Features

- **Performance Score**: Load time, rendering, interaction metrics
- **Core Web Vitals**: LCP, FID/INP, CLS measurements
- **Accessibility Score**: WCAG compliance and screen reader support
- **Best Practices**: Security, browser compatibility, code quality
- **PWA Score**: Progressive Web App capabilities
- **SEO Score**: Search engine optimization factors
- **Opportunities**: Specific recommendations for improvement
- **Diagnostics**: Detailed technical information
- **Trend Analysis**: Track score changes over time

## Configuration

```yaml
lighthouse:
  categories:
    - performance
    - accessibility
    - best-practices
    - seo
    - pwa
  format: "html" # html, json, csv
  throttling: "4g" # 4g, slow-4g, offline
  emulation: "mobile" # mobile, desktop, none
  uploadResults: true
  threshold: 80 # minimum acceptable score
```

## Example Output

```
Lighthouse Report
=================
URL: https://example.com
Run Date: November 8, 2024

Performance: 92/100 (Excellent)
  Largest Contentful Paint (LCP): 1.2s
  First Input Delay (FID): 45ms
  Cumulative Layout Shift (CLS): 0.05

Accessibility: 88/100 (Good)
  Issues Found: 3

Best Practices: 95/100 (Excellent)

SEO: 100/100 (Perfect)

PWA: 82/100 (Good)

Top Opportunities:
  1. Eliminate render-blocking resources (0.8s savings)
  2. Enable text compression (32KB savings)
  3. Defer offscreen images (0.5s savings)
```

## Options

- `--url`: URL to audit
- `--categories`: Audit categories (performance, accessibility, etc)
- `--throttling`: Network throttling (4g, slow-4g)
- `--emulation`: Device emulation (mobile, desktop)
- `--output`: Custom report path
- `--threshold`: Minimum acceptable score

## See Also

- `/perf-trace` - Performance profiling
- `/seo-audit` - SEO audit
- `/bundle-analyze` - Bundle analysis
