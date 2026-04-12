---
name: context7-deep-search
description: "Deep documentation search via Context7 MCP. Library ID mappings for the gICM stack."
version: 1.0.0
triggers:
  keywords:
    - official docs for
    - API reference for
    - library documentation
    - context7
    - latest API for
---

# Context7 Deep Search — Official Documentation Lookup

Context7 provides **real-time, version-specific documentation** from official sources. Use it when local OPUS 67 skills don't have the answer or you need the latest API reference.

## How to Use

### Step 1: Resolve the library ID
```
Call: mcp__Context7__resolve-library-id
Input: { "libraryName": "next.js" }
Returns: library ID like "/vercel/next.js"
```

### Step 2: Fetch the docs
```
Call: mcp__Context7__get-library-docs
Input: { "context7CompatibleLibraryID": "/vercel/next.js", "topic": "server actions" }
Returns: official documentation content
```

## Pre-Resolved Library IDs for gICM Stack

| Library | Context7 ID | Use When |
|---------|------------|----------|
| Next.js 14 | `/vercel/next.js` | App Router, Server Components, ISR, Middleware |
| React | `/facebook/react` | Hooks, Context, Suspense, Transitions |
| Tailwind CSS | `/tailwindlabs/tailwindcss` | Utility classes, config, plugins |
| Shadcn/ui | `/shadcn-ui/ui` | Component patterns, theming |
| Supabase | `/supabase/supabase` | Auth, RLS, Edge Functions, Realtime |
| Prisma | `/prisma/prisma` | Schema, migrations, client API |
| Zod | `/colinhacks/zod` | Schema validation, transforms |
| tRPC | `/trpc/trpc` | Type-safe APIs, middleware |
| Solana Web3.js | `/solana-labs/solana-web3.js` | Transactions, accounts, programs |
| Anchor | `/coral-xyz/anchor` | PDA, CPI, IDL, testing |
| Ethers.js | `/ethers-io/ethers.js` | Contract interaction, providers |
| Vitest | `/vitest-dev/vitest` | Test runner, mocking, coverage |
| Playwright | `/microsoft/playwright` | E2E testing, selectors, fixtures |

## When to Use Context7 vs OPUS 67 Skills

| Scenario | Use |
|----------|-----|
| Need latest API signature for a function | **Context7** |
| Need architectural patterns and best practices | **OPUS 67 skill** |
| Checking if a feature exists in latest version | **Context7** |
| Need code examples for common patterns | **OPUS 67 skill** |
| Debugging a specific API behavior | **Context7** first, then skill |
| Learning a new framework concept | **OPUS 67 skill** first, then Context7 for specifics |

## Query Tips

- Be specific: "next.js server actions form handling" beats "next.js forms"
- Include version if relevant: "supabase edge functions v2"
- For Solana/Anchor: search by program concept, not function name
