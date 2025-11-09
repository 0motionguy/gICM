# Pre-Commit Hooks

Enable pre-commit validation hooks. Runs linting, formatting, and tests before commits.

## Overview

Enables pre-commit hooks that run validation checks before creating commits. Includes linting, formatting, type checking, and optionally tests. Prevents committing broken code.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** true
**Recommended:** true for all projects

## Usage

```bash
# Enable pre-commit hooks (default)
npx @gicm/cli settings add development/pre-commit-hooks --value true

# Disable pre-commit hooks
npx @gicm/cli settings add development/pre-commit-hooks --value false
```

## Hook Checks

**Default checks (in order):**
1. **Linting:** ESLint, Prettier
2. **Type Checking:** TypeScript, Flow
3. **Formatting:** Auto-format files
4. **Tests:** Run affected tests (optional)
5. **Security:** Check for secrets in code

## Hook Execution Flow

```
git commit -m "feat: add new feature"
  ↓
🔍 Running pre-commit hooks...
  ✓ Linting (2.3s)
  ✓ Type checking (1.7s)
  ✓ Formatting (0.8s)
  ✓ Tests (4.2s)
  ✓ Security scan (1.1s)
  ↓
✓ All checks passed
✓ Commit created successfully
```

## Failed Hook Behavior

**When checks fail:**
```
❌ Pre-commit hooks failed

Linting errors:
  src/app/page.tsx:15:3 - Unused variable 'data'
  src/lib/utils.ts:42:10 - Missing return type

Type errors:
  src/types/index.ts:8:12 - Type 'string' not assignable to 'number'

Fix these issues and try again.
Commit was NOT created.
```

## Auto-Fix Capability

**Hooks can auto-fix:**
- Formatting issues (Prettier)
- Import sorting
- Trailing whitespace
- Missing semicolons
- Simple linting errors

**Auto-fix example:**
```
🔧 Auto-fixing issues...
  ✓ Formatted 3 files
  ✓ Sorted imports in 2 files
  ✓ Fixed 5 linting errors

📝 Files modified:
  src/app/page.tsx
  src/lib/utils.ts
  src/components/Button.tsx

Changes auto-staged. Retry commit? [Y/n]
```

## Skip Hooks (Emergency)

**Skip for single commit:**
```bash
git commit --no-verify -m "WIP: debugging"
```

**Disable temporarily:**
```bash
npx @gicm/cli settings override pre-commit-hooks --value false
# Make commits
npx @gicm/cli settings add development/pre-commit-hooks --value true
```

## Performance Impact

**Typical hook execution time:**
- Small projects (<100 files): 2-5 seconds
- Medium projects (100-500 files): 5-15 seconds
- Large projects (>500 files): 15-30 seconds

**Optimization:**
- Only check staged files
- Run tests in parallel
- Cache type checking results
- Skip slow checks in watch mode

## Custom Hook Configuration

**Edit `.claude/hooks/pre-commit.json`:**
```json
{
  "hooks": [
    {
      "name": "lint",
      "command": "npm run lint",
      "parallel": true
    },
    {
      "name": "typecheck",
      "command": "tsc --noEmit",
      "parallel": true
    },
    {
      "name": "test",
      "command": "npm test -- --onlyChanged",
      "parallel": false,
      "optional": true
    }
  ],
  "auto-fix": true,
  "allow-skip": false
}
```

## Related Settings

- `linting-enabled` - Enable linting
- `format-on-save` - Auto-format on save
- `test-before-deploy` - Run tests before deployment
- `conventional-commits` - Validate commit messages

## Examples

### Maximum Quality (Production)
```json
{
  "pre-commit-hooks": true,
  "linting-enabled": true,
  "format-on-save": true,
  "test-before-deploy": true,
  "hooks": {
    "include-tests": true,
    "auto-fix": true
  }
}
```

### Fast Development
```json
{
  "pre-commit-hooks": true,
  "linting-enabled": true,
  "hooks": {
    "include-tests": false,
    "auto-fix": true,
    "parallel": true
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
