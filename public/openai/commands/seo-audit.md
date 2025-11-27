# /seo-audit

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Comprehensive SEO and accessibility audit with recommendations for meta tags, structured data, WCAG compliance, and search engine optimization.

## Usage

```bash
/seo-audit
/seo-audit --include-wcag
/seo-audit --format=report
```

## Features

- **Meta Tags Audit**: Check title, description, canonical, OG tags
- **Structured Data**: Validate Schema.org markup (JSON-LD)
- **WCAG Compliance**: Check accessibility against WCAG 2.1 AA
- **Mobile Friendliness**: Test responsive design and mobile usability
- **Performance SEO**: Core Web Vitals, page speed metrics
- **Content Analysis**: Readability, keyword density, heading structure
- **Link Analysis**: Internal/external links, broken links
- **Sitemap Validation**: Check robots.txt and sitemap.xml
- **Security Audit**: HTTPS, security headers, CSP policy

## Configuration

```yaml
seoAudit:
  includeWCAG: true
  checkStructuredData: true
  analyzeContent: true
  checkMobileOptimization: true
  validateSitemap: true
  checkSecurityHeaders: true
```

## Example Output

```
SEO & Accessibility Audit Report
=================================

Overall Score: 87/100

Critical Issues (4):
  ✗ Missing meta description on 12 pages
  ✗ Invalid JSON-LD schema format
  ✗ 3 broken internal links detected
  ✗ Missing ARIA labels on form inputs

Warnings (8):
  ⚠ Very long meta title on homepage (67 chars)
  ⚠ Images missing alt text (23 instances)
  ⚠ Poor mobile viewport on 2 pages

Recommendations:
  1. Add meta descriptions for better CTR
  2. Fix JSON-LD validation errors
  3. Add ARIA labels for accessibility (WCAG 2.1 AA)
  4. Optimize images for mobile
  5. Enable gzip compression

Mobile Friendliness: PASS
WCAG Compliance: AA (78% passing)
Page Speed: 65/100
```

## Options

- `--include-wcag`: Include WCAG accessibility checks
- `--check-structured`: Validate structured data
- `--mobile`: Test mobile optimization
- `--security`: Check security headers
- `--format`: Output format (report, json, html)

## See Also

- `/lighthouse-check` - Performance audit
- `/bundle-analyze` - Size analysis
- `/monitoring-setup` - Performance monitoring
