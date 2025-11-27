# /deps-upgrade

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: GPT-4o | Also compatible with: Claude, Gemini


## Overview
Smart dependency upgrade strategy with breaking change detection, compatibility analysis, and migration guides. Helps safely update packages while minimizing risk.

## Usage

```bash
/deps-upgrade
/deps-upgrade --interactive
/deps-upgrade --dry-run
```

## Features

- **Breaking Change Detection**: Analyze changelog and semver violations
- **Compatibility Matrix**: Check compatibility across package versions
- **Migration Guides**: Auto-generate upgrade paths with code examples
- **Risk Assessment**: Score upgrade risk (low/medium/high)
- **Dependency Updates**: Group related updates for batch processing
- **Changelog Analysis**: Parse and summarize package changes
- **Automated Testing**: Run tests after upgrade to verify compatibility
- **Rollback Support**: Easy rollback to previous versions

## Configuration

```yaml
depUpgrade:
  strategy: "minor" # major, minor, patch, latest
  autoTest: true
  skipBreaking: false
  groupRelated: true
  checkCompatibility: true
  generateMigrationGuide: true
```

## Example Output

```
=== Dependency Upgrade Analysis ===

React 18.2.0 -> 19.0.0 (MAJOR)
  Risk: HIGH
  Breaking Changes:
    - Event system changed
    - Suspense behavior modified
  Migration Guide: Generated at ./MIGRATION_REACT_19.md
  Estimated Time: 4-6 hours

TypeScript 5.2.0 -> 5.5.0 (MINOR)
  Risk: LOW
  Changes: New type features, improvements
  Action: Safe to upgrade
```

## Options

- `--strategy`: Update strategy (major, minor, patch, latest)
- `--interactive`: Interactive selection mode
- `--dry-run`: Preview changes without applying
- `--skip-breaking`: Skip major version upgrades
- `--auto-test`: Run tests after upgrade

## See Also

- `/bundle-analyze` - Check bundle impact
- `/test-coverage-report` - Verify compatibility
- `/lint-fix` - Auto-fix code issues
