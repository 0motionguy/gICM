# Conventional Commits

Enforce conventional commit message format (feat:, fix:, docs:, etc.). Improves changelog generation.

## Overview

Enforces conventional commit message format for all commits created by Claude. Format: <type>(<scope>): <description>. Types: feat, fix, docs, style, refactor, test, chore.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** true
**Recommended:** true for all projects

## Usage

```bash
# Enable conventional commits (default)
npx @gicm/cli settings add development/conventional-commits --value true

# Disable conventional commits
npx @gicm/cli settings add development/conventional-commits --value false
```

## Commit Format

**Structure:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**
```
feat(auth): add OAuth2 login support

Implemented OAuth2 authentication with Google and GitHub providers.
Added token refresh mechanism and session management.

Closes #123

🤖 Generated with Claude Code
```

```
fix(api): handle null responses from RPC endpoint

Added null checks and default values for RPC responses.
Prevents crashes when endpoint returns unexpected data.

🤖 Generated with Claude Code
```

## Benefits

1. **Automated Changelogs:** Generate from commit history
2. **Semantic Versioning:** Derive version bumps from commits
3. **Better Navigation:** Search commits by type
4. **Clear Intent:** Understand purpose at a glance

## Affected Components

- `git-workflow-specialist` - Creates all git commits
- `auto-git-commit` setting - When enabled, uses conventional format

## Validation

**Valid commits:**
```
✓ feat(wallet): add Phantom wallet integration
✓ fix: resolve race condition in token launch
✓ docs(readme): update installation instructions
```

**Invalid commits:**
```
✗ Added new feature (no type)
✗ feat add wallet (missing colon)
✗ FEAT(wallet): support (wrong case)
```

## Changelog Generation

**Generate changelog:**
```bash
npx @gicm/cli changelog generate

# Output:
## v1.2.0 (2025-11-08)

### Features
- **wallet**: add Phantom wallet integration (#123)
- **launch**: implement bonding curve (#124)

### Bug Fixes
- **api**: handle null responses from RPC endpoint (#125)
```

## Related Settings

- `auto-git-commit` - Auto-create commits
- `pre-commit-hooks` - Validate commit messages
- `linting-enabled` - Enforce code quality

## Examples

### Production Configuration
```json
{
  "conventional-commits": true,
  "auto-git-commit": true,
  "pre-commit-hooks": true
}
```

### Development Configuration
```json
{
  "conventional-commits": true,
  "auto-git-commit": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
