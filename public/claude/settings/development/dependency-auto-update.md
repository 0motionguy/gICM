# Dependency Auto-Update

Automatically update dependencies during operations. Options: none, patch, minor, major.

## Overview

Controls automatic dependency updates. 'none' disables auto-updates, 'patch' updates patch versions (1.0.x), 'minor' updates minor versions (1.x.0), 'major' updates all versions.

## Configuration

**Category:** Development
**Type:** String (enum)
**Default:** none
**Options:** none, patch, minor, major

## Usage

```bash
# No automatic updates (default)
npx @gicm/cli settings add development/dependency-auto-update --value none

# Patch updates only (1.0.x)
npx @gicm/cli settings add development/dependency-auto-update --value patch

# Minor updates (1.x.0)
npx @gicm/cli settings add development/dependency-auto-update --value minor

# All updates including major (x.0.0)
npx @gicm/cli settings add development/dependency-auto-update --value major
```

## Update Levels

### None (Default)
- **No automatic updates**
- Manual dependency management
- Maximum stability
- Recommended for production

### Patch
- **Updates:** 1.0.0 → 1.0.1 ✓
- **Blocks:** 1.0.0 → 1.1.0 ✗
- Bug fixes and security patches only
- Very safe, minimal breaking changes
- Recommended for most projects

### Minor
- **Updates:** 1.0.0 → 1.5.0 ✓
- **Blocks:** 1.0.0 → 2.0.0 ✗
- New features, backwards compatible
- Generally safe
- Recommended for active development

### Major
- **Updates:** 1.0.0 → 2.0.0 ✓
- All updates including breaking changes
- Requires testing
- Not recommended for production

## How It Works

**When updates occur:**
```
Claude adds new dependency
  ↓
🔍 Checking for available updates...
  ↓
  Found: react@18.2.0 → 18.3.1 (patch)
  Found: next@15.0.0 → 15.5.6 (minor)
  ↓
📦 Updating dependencies...
  ↓
  ✓ Updated react to 18.3.1
  ✓ Updated next to 15.5.6
  ↓
✓ npm install completed
```

## Update Notifications

**Before updating:**
```
📢 Dependency updates available:

Patch updates (safe):
  - react: 18.2.0 → 18.3.1 (bug fixes)
  - zod: 3.22.0 → 3.22.4 (security patch)

Minor updates (new features):
  - next: 15.0.0 → 15.5.6 (App Router improvements)
  - typescript: 5.4.0 → 5.6.0 (new features)

Apply updates? [Y/n]
```

## Security Updates

**Always applied regardless of setting:**
```
🚨 Security vulnerabilities found:

lodash: 4.17.20 → 4.17.21 (CVE-2021-23337)
  Severity: High
  Fix: Patch available

Applying security patch...
```

## Package Lock Behavior

**Updates package.json and lock file:**
- `package.json` - Semver ranges updated
- `package-lock.json` or `yarn.lock` - Exact versions

**Commits changes if `auto-git-commit` enabled.**

## Affected Components

- `package-manager-expert` - Dependency management
- All agents that install packages

## Exclusions

**Exclude specific packages:**
```json
{
  "dependency-auto-update": "minor",
  "update-exclusions": [
    "react",
    "next",
    "@types/*"
  ]
}
```

## Update Schedule

**Configure update frequency:**
```json
{
  "dependency-auto-update": "patch",
  "update-schedule": {
    "frequency": "weekly",
    "day": "monday",
    "check-on-install": true
  }
}
```

## Related Settings

- `pre-commit-hooks` - Test updates before committing
- `test-before-deploy` - Validate updates work
- `linting-enabled` - Check updated code

## Examples

### Maximum Security (Production)
```json
{
  "dependency-auto-update": "patch",
  "security-updates": "always",
  "test-before-deploy": true
}
```

### Active Development
```json
{
  "dependency-auto-update": "minor",
  "update-exclusions": ["react", "next"],
  "pre-commit-hooks": true
}
```

### Manual Control
```json
{
  "dependency-auto-update": "none"
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
