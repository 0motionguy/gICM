# Marketplace Build Scripts

Automated CI/CD scripts for maintaining quality and consistency across the gICM marketplace.

## Overview

These scripts form a comprehensive marketplace quality pipeline:

1. **Sync** - Fetch latest content from community repos
2. **Validate** - Ensure skills comply with v2 schema
3. **Audit** - Score quality across 5 dimensions
4. **Optimize** - Analyze and reduce token usage

## Scripts

### 1. Repository Sync (`sync-community-repos.ts`)

Fetches latest content from GitHub repositories and tracks changes.

**Usage:**

```bash
npm run marketplace:sync
```

**What it does:**

- Clones/updates repos from anthropics/skills, obra/superpowers, etc.
- Detects new, modified, and deleted files
- Generates sync report with commit hashes
- Updates `.cache/sync-log.json` with metadata

**Configuration:**
Edit `REPOS` array in script to add new sources.

**Output:**

- `.cache/repos/` - Cached repository content
- `.cache/sync-log.json` - Sync history
- `.cache/sync-report-*.json` - Detailed reports

**Example output:**

```
🔄 Starting marketplace repository sync...

Syncing: Anthropic Official Skills
  ✓ Synced Anthropic Official Skills: 12 changes
    - New files: 8
    - Modified files: 4
    - Deleted files: 0

═══════════════════════════════════════════════════════════════
📊 SYNC REPORT
═══════════════════════════════════════════════════════════════
Timestamp:        2025-12-11T10:30:00.000Z
Duration:         4.23s
Total Repos:      3
Successful:       3
Failed:           0
Total Changes:    12
═══════════════════════════════════════════════════════════════
```

---

### 2. Schema Validation (`validate-skills-schema.ts`)

Validates all SKILL.md files against Agent Skills v2 schema.

**Usage:**

```bash
npm run marketplace:validate
```

**What it validates:**

- Skill ID format (lowercase, alphanumeric, hyphens)
- Name length (max 64 chars)
- Description length (max 1024 chars)
- Reserved words (no "anthropic", "claude", "official")
- Version format (semver)
- Token budgets (Level 1: <200, Level 2: <5000)

**Output:**

- `.cache/validation-report.json` - Full validation results
- Console output with actionable fixes

**Example output:**

```
🔍 Starting skill schema validation...

Found 23 skill files to validate

✅ solana-dex-expert.md
❌ trading-bot.md (2 issues)
  ✗ [level1.metadata.name] Name exceeds 64 characters
    💡 Shorten name to 64 chars or less (current: 72)
  ⚠ [level2.estimatedTokens] Level 2 tokens exceed 5000 token limit
    💡 Split large instructions into Level 3 resources

═══════════════════════════════════════════════════════════════
📊 VALIDATION SUMMARY
═══════════════════════════════════════════════════════════════
Total Files:      23
Valid:            20
Invalid:          3
Errors:           5
Warnings:         2
Success Rate:     87.0%
═══════════════════════════════════════════════════════════════
```

---

### 3. Quality Audit (`audit-marketplace.ts`)

Comprehensive quality scoring across 5 dimensions.

**Usage:**

```bash
npm run marketplace:audit
```

**Scoring dimensions:**

- **Documentation** (20%) - Completeness of docs, examples, setup
- **Code Quality** (25%) - Versioning, dependencies, changelog
- **Community** (15%) - Installs, remixes, popularity
- **Maintenance** (15%) - Recent updates, active development
- **Security** (25%) - Environment handling, sandboxing, dependencies

**Quality thresholds:**

- **VERIFIED** (80+) - Production-ready, high quality
- **NEEDS_FIX** (60-79) - Good but needs improvement
- **FLAGGED** (<60) - Quality issues, not recommended

**Output:**

- `.cache/audit-report.json` - Full audit results
- Updates `registry.json` with audit metadata
- Console output with recommendations

**Example output:**

```
🔍 Starting marketplace quality audit...

✅ Solana DEX Expert (skill)
   Overall Score: 85.2/100
   Status: VERIFIED

⚠️  Basic Trading Bot (skill)
   Overall Score: 62.1/100
   Status: NEEDS_FIX
   Issues: 0 critical, 2 high

═══════════════════════════════════════════════════════════════
📊 AUDIT SUMMARY
═══════════════════════════════════════════════════════════════
Total Items:      45
Average Score:    74.3/100

STATUS BREAKDOWN:
  ✅ Verified:     32 (71.1%)
  ⚠️  Needs Fix:    10 (22.2%)
  ❌ Flagged:      3 (6.7%)
  🔒 Deprecated:   0

⚠️  TOP ITEMS NEEDING IMPROVEMENT:
  Basic Trading Bot (62.1/100)
    💡 Add detailed description, installation guide, and examples
═══════════════════════════════════════════════════════════════
```

---

### 4. Token Analysis (`generate-progressive-disclosure.ts`)

Analyzes token usage and recommends optimizations.

**Usage:**

```bash
npm run marketplace:tokens
```

**What it analyzes:**

- Token breakdown per level (metadata, instructions, resources)
- Compliance with progressive disclosure limits
- Optimization opportunities
- Cost savings estimates

**Token budgets:**

- **Level 1** (Metadata): <200 tokens
- **Level 2** (Instructions): <5000 tokens
- **Level 3** (Resources): Unlimited (loaded on demand)

**Output:**

- `.cache/token-analysis.json` - Full token report
- `.cache/token-optimization-guide.md` - Actionable guide
- Console output with savings estimates

**Example output:**

```
📊 Analyzing token usage across marketplace...

✅ Solana DEX Expert
   Current: 4,200 tokens
   Optimal: 4,200 tokens
   Savings: 0%

⚠️  Advanced DeFi Strategies
   Current: 8,500 tokens
   Optimal: 5,200 tokens
   Savings: 38%
   Top recommendation: Reduce Level 2 instructions by 3300 tokens

═══════════════════════════════════════════════════════════════
📊 TOKEN ANALYSIS SUMMARY
═══════════════════════════════════════════════════════════════
Total Skills:           23
Average Tokens/Skill:   5,200
Total Token Budget:     119,600
Potential Savings:      22%

STATUS BREAKDOWN:
  ✅ Optimal:              15 (65.2%)
  👍 Good:                 5 (21.7%)
  ⚠️  Needs Optimization:  2 (8.7%)
  ❌ Critical:             1 (4.3%)

💰 ESTIMATED COST SAVINGS:
  Tokens saved per load:  26,280
  Monthly savings (est):  $7.88
═══════════════════════════════════════════════════════════════
```

---

## Run All Scripts

Execute the complete marketplace quality pipeline:

```bash
npm run marketplace:all
```

This runs all 4 scripts in sequence:

1. Sync community repos
2. Validate schemas
3. Audit quality
4. Analyze tokens

**Typical execution time:** 30-60 seconds

---

## CI/CD Integration

### GitHub Actions Workflow

Add to `.github/workflows/marketplace-quality.yml`:

```yaml
name: Marketplace Quality

on:
  schedule:
    - cron: "0 0 * * *" # Daily at midnight
  workflow_dispatch:

jobs:
  quality-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run marketplace quality checks
        run: npm run marketplace:all

      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: marketplace-reports
          path: .cache/*.json
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate skills before commit
npm run marketplace:validate
```

---

## Configuration

### Adding New Repositories

Edit `scripts/sync-community-repos.ts`:

```typescript
const REPOS: RepoConfig[] = [
  {
    name: "Your Repo Name",
    owner: "github-username",
    repo: "repo-name",
    branch: "main",
    path: ".cache/repos/your-repo",
    contentPath: "skills/", // Optional subdirectory
  },
  // ... existing repos
];
```

### Adjusting Quality Weights

Edit `scripts/audit-marketplace.ts`:

```typescript
const WEIGHTS = {
  documentation: 0.2, // 20%
  codeQuality: 0.25, // 25%
  community: 0.15, // 15%
  maintenance: 0.15, // 15%
  security: 0.25, // 25%
};
```

### Token Limits

Edit `scripts/generate-progressive-disclosure.ts`:

```typescript
const LEVEL1_MAX_TOKENS = 200; // Metadata
const LEVEL2_MAX_TOKENS = 5000; // Instructions
// Level 3 has no limit (loaded on demand)
```

---

## Troubleshooting

### Script fails with "Registry not found"

Ensure `public/marketplace/registry.json` exists:

```bash
mkdir -p public/marketplace
echo "[]" > public/marketplace/registry.json
```

### Git errors during sync

Check internet connection and GitHub access:

```bash
git ls-remote https://github.com/anthropics/skills.git
```

### TypeScript errors

Ensure TypeScript and ts-node are installed:

```bash
npm install -D typescript ts-node @types/node
```

### "Command not found: ts-node"

Install ts-node globally or use npx:

```bash
npx ts-node scripts/sync-community-repos.ts
```

---

## Performance Optimization

### Parallel Execution

Run validation and audit in parallel:

```bash
npm run marketplace:validate & npm run marketplace:audit & wait
```

### Caching Strategy

Scripts use `.cache/` directory for intermediate results:

- **sync-log.json** - Tracks last sync to avoid redundant fetches
- **repos/** - Cached git repositories (incremental pulls)
- Reports expire after 24 hours (configurable)

### Incremental Validation

Only validate changed files:

```bash
git diff --name-only origin/main | grep SKILL.md | xargs ts-node scripts/validate-skills-schema.ts
```

---

## API Reference

### Sync Script Exports

```typescript
import { syncAllRepos, REPOS } from "./scripts/sync-community-repos";

const report = await syncAllRepos();
console.log(`Synced ${report.successfulSyncs} repos`);
```

### Validation Script Exports

```typescript
import {
  validateAllSkills,
  validateSkillFile,
} from "./scripts/validate-skills-schema";

const report = await validateAllSkills();
const fileValidation = validateSkillFile("./path/to/SKILL.md");
```

### Audit Script Exports

```typescript
import { auditMarketplace, auditItem } from "./scripts/audit-marketplace";

const report = await auditMarketplace();
const itemAudit = auditItem(registryItem);
```

### Token Analysis Exports

```typescript
import {
  generateTokenReport,
  analyzeSkillTokens,
} from "./scripts/generate-progressive-disclosure";

const report = await generateTokenReport();
const analysis = analyzeSkillTokens(registryItem);
```

---

## Best Practices

### Daily Quality Checks

Run `marketplace:all` daily to catch issues early:

```bash
# Add to crontab
0 9 * * * cd /path/to/gicm && npm run marketplace:all
```

### Pre-deployment Validation

Always validate before deploying to production:

```bash
npm run marketplace:validate && npm run marketplace:audit
```

### Token Budget Monitoring

Track token usage trends over time:

```bash
# Save reports with timestamps
npm run marketplace:tokens
cp .cache/token-analysis.json .cache/token-$(date +%Y%m%d).json
```

### Security Audits

Review security issues weekly:

```bash
npm run marketplace:audit | grep -A 5 "Security Issues"
```

---

## Contributing

When adding new scripts:

1. Follow naming convention: `action-target.ts`
2. Add corresponding npm script to `package.json`
3. Include comprehensive JSDoc comments
4. Add TypeScript types for all functions
5. Generate both JSON and human-readable reports
6. Update this README with usage documentation

---

## Support

For issues or questions:

- **GitHub Issues**: https://github.com/0motionguy/gICM/issues
- **Discord**: https://discord.gg/gicm
- **Docs**: https://gicm.app/docs/scripts

---

**Last Updated:** 2025-12-11
**Version:** 1.0.0
