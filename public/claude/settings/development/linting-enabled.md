# Linting Enabled

Enable automatic linting for generated code. Ensures code quality and consistency.

## Overview

Automatically runs linters (ESLint, Prettier, Rustfmt, etc.) on all generated code. Ensures consistent code style and catches common issues early.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** true
**Recommended:** true for all projects

## Usage

```bash
# Enable linting (default)
npx @gicm/cli settings add development/linting-enabled --value true

# Disable linting
npx @gicm/cli settings add development/linting-enabled --value false
```

## Supported Linters

**JavaScript/TypeScript:**
- ESLint (with recommended rules)
- Prettier (code formatting)
- TypeScript compiler checks

**Rust:**
- Clippy (lints)
- Rustfmt (formatting)

**Python:**
- Pylint
- Black (formatting)
- mypy (type checking)

**Other:**
- Markdownlint (markdown files)
- Stylelint (CSS/SCSS)

## Auto-Fix Behavior

**Automatic fixes:**
- Formatting issues
- Import sorting
- Trailing whitespace
- Semicolon insertion
- Quote style consistency

**Example:**
```
🔧 Linting generated code...
  ✓ Formatted src/app/page.tsx
  ✓ Fixed 3 ESLint issues
  ✓ Sorted imports

Files modified and auto-staged.
```

## Lint Failure Behavior

**Cannot auto-fix:**
```
⚠️  Lint warnings found:

src/lib/utils.ts:42:10
  Unused variable 'data'
  Remove or prefix with underscore: '_data'

src/components/Button.tsx:15:3
  Missing prop validation
  Add PropTypes or TypeScript interface
```

## Configuration Files

**Respects project linting config:**
- `.eslintrc.json`
- `.prettierrc`
- `clippy.toml`
- `pyproject.toml`

**Falls back to defaults if not configured.**

## Performance Impact

**Linting overhead:**
- Small files (<100 lines): 100-300ms
- Medium files (100-500 lines): 300-800ms
- Large files (>500 lines): 1-2 seconds

**Optimization:**
- Lint only changed files
- Cache lint results
- Run in parallel

## Affected Components

All agents that generate code benefit from linting:
- `frontend-fusion-engine` - React/Next.js code
- `typescript-precision-engineer` - TypeScript code
- `rust-systems-architect` - Rust code
- `database-schema-oracle` - SQL queries

## Related Settings

- `format-on-save` - Auto-format files
- `pre-commit-hooks` - Lint before commits
- `typescript-strict-mode` - Strict TypeScript checking

## Examples

### Production Configuration
```json
{
  "linting-enabled": true,
  "format-on-save": true,
  "auto-fix": true,
  "fail-on-error": true
}
```

### Development Configuration
```json
{
  "linting-enabled": true,
  "auto-fix": true,
  "fail-on-error": false
}
```

### Minimal Configuration
```json
{
  "linting-enabled": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
