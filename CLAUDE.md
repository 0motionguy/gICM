# gICM Marketplace

Multi-tenant SaaS for AI agents. Next.js 14 + TypeScript + Tailwind + Shadcn/ui + Supabase + FastAPI.

## Structure

```
apps/web/          # Main marketplace (Next.js)
packages/ui/       # Shared components
packages/opus67/   # Skill orchestration engine
services/api/      # FastAPI backend
```

## Deploy

```bash
npm run build && npm test && git push origin main  # Auto-deploys via Vercel
```

## Key Rules

- TypeScript strict mode, Zod on API boundaries
- Every table has `tenant_id`, RLS enabled
- Prefer Server Components
- Load `gicm-conventions` skill for naming/style patterns
- Load `awcn-patterns` skill for multi-tenancy/RBAC patterns

## Related: AWCN (orchestration), Polyclaw (trading bot)
