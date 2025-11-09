# Require Environment Validation

Validate all required environment variables before execution. Prevents runtime errors from missing config.

## Overview

When enabled, Claude will check that all required environment variables are set and valid before executing operations that depend on them. Catches configuration errors early and provides clear error messages.

## Configuration

**Category:** Security
**Type:** Boolean
**Default:** true
**Recommended:** true for all environments

## Usage

```bash
# Enable validation (default)
npx @gicm/cli settings add security/require-env-validation --value true

# Disable validation
npx @gicm/cli settings add security/require-env-validation --value false
```

## What Gets Validated

**Before executing operations, validates:**
1. Required environment variables are set
2. Values are non-empty
3. Format is correct (e.g., URLs, API keys)
4. Values are accessible (not permission denied)

## Validation Rules

**API Keys:**
- Must be non-empty
- Must match expected format (varies by service)
- Optional: Check key is valid with test API call

**URLs:**
- Must be valid URL format
- Must use correct protocol (http/https)
- Optional: Check endpoint is reachable

**File Paths:**
- Must be absolute paths
- Must exist (for read operations)
- Must be writable (for write operations)

## Error Messages

**Missing Variable:**
```
❌ Environment variable ANTHROPIC_API_KEY is required but not set
💡 Add it to your .env file or export it in your shell
```

**Invalid Format:**
```
❌ DATABASE_URL is not a valid PostgreSQL connection string
💡 Expected format: postgresql://user:pass@host:port/db
```

## Related Settings

- `sandbox-mode` - Restricts environment variable access
- `credential-encryption` - Encrypts stored credentials
- `audit-log-enabled` - Logs environment variable access

## Examples

### Production Configuration
```json
{
  "require-env-validation": true,
  "credential-encryption": true,
  "audit-log-enabled": true
}
```

### Development Configuration
```json
{
  "require-env-validation": true,
  "credential-encryption": false
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
