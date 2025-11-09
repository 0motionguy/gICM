# Auto Git Commit

Automatically commit changes after successful operations with detailed commit messages.

## Configuration

**Category:** Development
**Type:** Boolean
**Default:** false
**Recommended:** false (explicit commits preferred)

## Usage

```bash
npx @gicm/cli settings add development/auto-git-commit --value true
```

## Description

When enabled, Claude Code automatically creates git commits after completing tasks. Commit messages follow conventional commit format with detailed descriptions of changes.

## Affected Components
- `git-workflow-specialist`
- `code-review-orchestrator`

## Benefits
- Never forget to commit
- Consistent commit messages
- Detailed change descriptions
- Automatic staging

## Considerations
- May create too many commits
- Less control over commit timing
- Requires review before pushing

## Related Settings
- `conventional-commits` - Enforce commit format
- `pre-commit-hooks` - Run validation before commits

---

**Last Updated:** 2025-11-06
