---
name: tavily-research
description: "Web research patterns using Tavily MCP tools. Search, research, extract, crawl."
version: 1.0.0
triggers:
  keywords:
    - deep research
    - search the web
    - tavily
    - web research
    - find online sources
---

# Tavily Research — Web Search and Deep Research

Tavily provides 5 tools for web research, each optimized for different use cases.

## Tool Selection Guide

| Tool | Use When | Speed | Depth |
|------|----------|-------|-------|
| `tavily_search` | Quick factual lookup, definitions, current events | Fast | Shallow |
| `tavily_research` | Multi-source analysis, comparisons, comprehensive answers | Slow | Deep |
| `tavily_extract` | Pull specific content from a known URL | Fast | Targeted |
| `tavily_crawl` | Map and extract from an entire website | Slow | Complete |
| `tavily_map` | Discover page structure of a website | Fast | Structure |

## Usage Patterns

### Quick Lookup
```
Tool: tavily_search
Input: { "query": "solana transaction fees 2026", "max_results": 5 }
```

### Deep Research
```
Tool: tavily_research
Input: { "query": "comparison of Next.js vs Remix for production apps 2026" }
```
Returns a comprehensive multi-source summary.

### Extract from URL
```
Tool: tavily_extract
Input: { "urls": ["https://docs.solana.com/developing/programming-model/transactions"] }
```

### Crawl a Documentation Site
```
Tool: tavily_crawl
Input: { "url": "https://docs.supabase.com/guides/auth", "max_depth": 2 }
```

## Combining with Context7

**Best practice for comprehensive research:**

1. **Context7 first** — for official API docs and code examples
2. **Tavily research** — for community patterns, blog posts, real-world usage
3. **Tavily extract** — for specific pages Context7 doesn't cover

Example workflow:
```
1. Context7: get-library-docs("/supabase/supabase", "row level security")
   → Official RLS docs
2. Tavily: tavily_research("supabase RLS best practices production multi-tenant")
   → Community patterns, gotchas, real-world examples
3. Combine both into implementation plan
```

## Query Optimization

- Include the year for time-sensitive queries: "best React state management 2026"
- Be specific about the tech: "Next.js 14 app router caching" not just "Next.js caching"
- For comparisons, name both options: "Redis vs Valkey for caching 2026"
- For debugging, include the error message: "supabase PGRST204 no rows returned"
