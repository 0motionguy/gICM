# gICM Marketplace - Project Memory

## Project Overview

**gICM** (Global Intelligent Compute Marketplace) is a multi-tenant SaaS platform for discovering, deploying, and managing AI agents.

- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth), FastAPI microservices
- **Monorepo**: Turborepo with shared packages
- **Deployment**: Vercel (frontend), Railway (backend)

## Related Projects

- **AWCN** (AI Worker Compute Network): Multi-tenant orchestration layer
- **Polyclaw**: Polymarket trading bot suite

## Active Skills

This project has Claude Code skills that encode team conventions:

1. **gicm-conventions** - File naming, code style, project structure
2. **awcn-patterns** - Multi-tenant SaaS, RBAC, subscription management
3. **polyclaw-strategies** - Trading strategies, risk management

## Custom Subagents

- **security-scanner**: Audits code for vulnerabilities (auth, injection, data exposure)

## MCP Servers

- **GitHub MCP**: Repository management, issues, PRs
- **Filesystem MCP**: Enhanced file operations
- **Supabase MCP**: Direct database access

## Key Patterns

### File Structure
```
gICM/
├── apps/web/          # Main marketplace (Next.js)
├── packages/ui/       # Shared React components
├── packages/database/ # Prisma schema
└── services/api/      # FastAPI backend
```

### Naming Conventions
- Components: PascalCase (`AgentCard.tsx`)
- Utils: camelCase (`formatPrice.ts`)
- API routes: kebab-case (`/api/agents/[id]/route.ts`)

### Multi-Tenancy
- Every table has `tenant_id UUID NOT NULL`
- Row-level security (RLS) enabled
- All queries filter by `tenant_id`
- RBAC: Owner, Admin, Member, Viewer

### Subscription Tiers
- **Free**: 1 agent, 1K API calls
- **Starter**: 5 agents, 10K calls ($29/mo)
- **Professional**: 20 agents, 100K calls ($99/mo)
- **Enterprise**: Unlimited ($499/mo)

## Security Checklist

- [ ] Validate `tenant_id` on all API routes
- [ ] Use Zod for input validation
- [ ] No raw SQL (use Prisma)
- [ ] Rate limit public endpoints
- [ ] Run `npm audit` before deploys

## Common Tasks

### Add New Feature
1. Check gICM conventions skill for file structure
2. Create API route in `apps/web/app/api/`
3. Add UI components in `packages/ui/`
4. Update Prisma schema if needed
5. Run security-scanner subagent
6. Test with all subscription tiers

### Deploy to Production
```bash
npm run build
npm test
git push origin main  # Auto-deploys via Vercel
```

## Current Focus (Week 1, Feb 2026)

- Foundation layer complete:
  - 3 MCPs installed
  - 3 skills created
  - Security-scanner subagent built
  - Compound workflow validated

## Notes

- Use TypeScript strict mode
- Prefer Server Components (Next.js 14)
- Test multi-tenancy with multiple test tenants
- Document breaking changes in CHANGELOG.md

---

*Last updated: 2026-02-16 via Claude Code Week 1 Foundation*
