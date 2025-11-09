# Documentation Audit Summary - Install Commands & Package Names

**Date:** November 9, 2025  
**Status:** CRITICAL ISSUES FOUND  
**Action Required:** YES - IMMEDIATE

---

## Executive Summary

The gICM documentation contains **499 outdated references** to the old CLI package name `gicm-stack`. The package has been renamed to `@gicm/cli` but documentation was not fully updated.

**Impact:** Users following README.md will fail to install.

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total References to Fix | 499 |
| Files Affected | 75 |
| Critical Files | 1 (README.md) |
| Settings Files | 72 |
| Already Correct | 1 (packages/cli/README.md) |
| Estimated Fix Time | 45 minutes |
| Risk Level | LOW |

---

## Files That Need Fixing

### CRITICAL (Must Fix First)

**1. README.md** - Line 37
```diff
- Install via CLI: `npx gicm-stack add agent/icm-architect`
+ Install via CLI: `npx @gicm/cli add agent/icm-architect`
```
Impact: PUBLIC-FACING - Users cannot install

**2. ARCHITECTURE.md** - Lines 60, 69
```diff
- npx gicm-stack add agent/icm-architect
+ npx @gicm/cli add agent/icm-architect
```
Impact: Documentation consistency

**3. MARKETPLACE_COMPLETION_REPORT.md** - Multiple lines
```diff
- npx gicm-stack settings add performance/mcp-timeout-duration --value 30000
+ npx @gicm/cli add setting/mcp-timeout-duration
```
Impact: Status accuracy (claims migration complete but shows old commands)

### HIGH (Bulk Updates)

**4. .claude/settings/** - 48 files (6 categories)
- All 48 setting files contain old `npx gicm-stack` references
- Pattern: Replace `npx gicm-stack` → `npx @gicm/cli`
- Use bulk find/replace

**5. public/claude/settings/** - 48 files (duplicates)
- Exact duplicates of .claude/settings/
- Must be kept in sync
- Use same bulk find/replace

### VERIFIED CORRECT (No Changes)

**✓ packages/cli/README.md**
- Uses correct `npx @gicm/cli add` syntax throughout
- Serves as reference for correct format

---

## The Problem

### Old (Broken)
```bash
npm install -g gicm-stack
npx gicm-stack add agent/code-reviewer
npx gicm-stack settings add performance/mcp-timeout-duration --value 30000
```

### New (Correct)
```bash
npm install -g @gicm/cli
npx @gicm/cli add agent/code-reviewer
npx @gicm/cli add setting/mcp-timeout-duration
```

---

## Files to Update - Complete List

### Category: Main Documentation (3 files)
- [ ] README.md (line 37)
- [ ] ARCHITECTURE.md (lines 60, 69)
- [ ] MARKETPLACE_COMPLETION_REPORT.md (multiple lines)

### Category: Settings Documentation (96 files)

**Performance (12 files)**
- mcp-timeout-duration.md
- lazy-skill-loading.md
- mcp-retry-attempts.md
- network-timeout.md
- agent-cache-strategy.md
- batch-operation-size.md
- compression-enabled.md
- context-window-size.md
- parallel-tool-execution.md
- response-streaming.md
- skill-cache-ttl.md
- token-budget-limit.md

**Security (10 files)**
- rate-limit-per-hour.md
- sandbox-mode.md
- require-signature-verification.md
- require-env-validation.md
- api-key-rotation-days.md
- audit-log-enabled.md
- credential-encryption.md
- allowed-domains.md
- disallowed-commands.md
- mcp-permission-model.md

**Development (8 files)**
- auto-git-commit.md
- conventional-commits.md
- dependency-auto-update.md
- format-on-save.md
- linting-enabled.md
- pre-commit-hooks.md
- test-before-deploy.md
- typescript-strict-mode.md

**Integration (7 files)**
- monitoring-dashboard.md
- subgraph-endpoint.md
- wallet-adapter-priority.md
- analytics-enabled.md
- default-rpc-provider.md
- error-reporting-service.md
- ipfs-gateway-url.md

**Monitoring (6 files)**
- uptime-monitoring.md
- slow-query-threshold-ms.md
- memory-usage-alerts.md
- performance-profiling.md
- error-notification-webhook.md
- cost-tracking.md

**Optimization (5 files)**
- bundle-analyzer-enabled.md
- cdn-caching-strategy.md
- code-splitting-strategy.md
- image-optimization.md
- tree-shaking.md

---

## Implementation Plan

### Phase 1: Critical Fixes (15 min)
1. Fix README.md line 37
2. Fix ARCHITECTURE.md lines 60, 69
3. Fix MARKETPLACE_COMPLETION_REPORT.md examples

### Phase 2: Bulk Updates (5 min)
```bash
# Fix .claude/settings/ folder
find .claude/settings -name "*.md" -exec sed -i 's/npx gicm-stack/npx @gicm\/cli/g' {} \;

# Fix public/claude/settings/ folder
find public/claude/settings -name "*.md" -exec sed -i 's/npx gicm-stack/npx @gicm\/cli/g' {} \;
```

### Phase 3: Verification (15 min)
```bash
# Should return 0 (no old references)
grep -r "gicm-stack" . --include="*.md" --exclude-dir=node_modules | wc -l

# Should return ~99+ (all new references)
grep -r "@gicm/cli" . --include="*.md" --exclude-dir=node_modules | wc -l

# Spot-check critical files
grep "@gicm/cli" README.md
grep "@gicm/cli" ARCHITECTURE.md
grep "@gicm/cli" .claude/settings/performance/mcp-timeout-duration.md
```

### Phase 4: Git Commit (5 min)
```bash
git add -A
git commit -m "docs: update CLI package name from gicm-stack to @gicm/cli"
git log -1
```

---

## Total Effort Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Fix README.md | 1 min |
| 1 | Fix ARCHITECTURE.md | 2 min |
| 1 | Fix MARKETPLACE_COMPLETION_REPORT.md | 5 min |
| 2 | Bulk replace .claude/settings/ | 1 min |
| 2 | Bulk replace public/claude/settings/ | 1 min |
| 2 | Spot-check files | 3 min |
| 3 | Grep verification | 5 min |
| 3 | Review changes | 5 min |
| 4 | Commit | 5 min |
| **TOTAL** | | **28 min** |

---

## Additional Notes

### Issue #1: MARKETPLACE_COMPLETION_REPORT Status
- Report claims "Task 1: Settings Install Command Migration ✅ COMPLETE"
- But settings files still show old commands
- Either update files OR revise the status claim
- **Action:** Verify after fixes and update report accordingly

### Issue #2: CLI Sub-commands
Some settings reference commands that may not exist:
- `npx gicm-stack signatures download-all`
- `npx gicm-stack keys list/add/revoke`
- `npx gicm-stack profiling flamegraph`
- `npx gicm-stack uptime status/report`
- `npx gicm-stack logs <category>`

**Action:** Manual review of these files after bulk replace

### Issue #3: packages/cli/README.md
✓ Already correct - use as reference for correct syntax

---

## Verification Checklist

After making all fixes:

- [ ] grep shows 0 "gicm-stack" references (except node_modules)
- [ ] grep shows ~99+ "@gicm/cli" references
- [ ] README.md line 37 shows correct syntax
- [ ] ARCHITECTURE.md shows correct syntax
- [ ] All 72 settings files updated
- [ ] public/claude/settings/ files updated
- [ ] Spot-check passes (5+ random files)
- [ ] `npx @gicm/cli --help` works
- [ ] git diff shows only .md files changed
- [ ] Commit created successfully

---

## Key Takeaways

1. **OLD:** `gicm-stack` (499 references to update)
2. **NEW:** `@gicm/cli` (correct package name)
3. **IMPACT:** HIGH - breaks user onboarding
4. **RISK:** LOW - simple find/replace
5. **EFFORT:** ~45 minutes total
6. **PRIORITY:** CRITICAL - main README affected

---

## Next Steps

1. ✓ Review this audit report
2. ✓ Approve implementation plan
3. Execute Phase 1-4 in order
4. Run verification checklist
5. Commit with clear message
6. Deploy updated documentation

**Status:** Ready for implementation  
**Confidence:** 95% (well-defined, low-risk)
**Approver:** _______________________
**Date:** _______________________

