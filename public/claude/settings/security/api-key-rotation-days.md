# API Key Rotation Days

Days before showing API key rotation warning. Recommended: 90 days for production keys.

## Overview

Sets the number of days after which Claude will warn you to rotate your API keys. Regular key rotation is a security best practice. Set to 0 to disable rotation warnings.

## Configuration

**Category:** Security
**Type:** Number
**Default:** 90
**Range:** 0-365

## Usage

```bash
# Install with default value (90 days)
npx @gicm/cli settings add security/api-key-rotation-days

# Install with custom value (30 days)
npx @gicm/cli settings add security/api-key-rotation-days --value 30
```

## Rotation Recommendations

| Key Type | Recommended Days | Rationale |
|----------|------------------|-----------|
| Production API Keys | 90 | Balance security and operational overhead |
| Development Keys | 180 | Less critical, rotate less frequently |
| CI/CD Keys | 60 | Higher exposure, rotate more often |
| Admin/Root Keys | 30 | Critical access, rotate frequently |

## How It Works

1. **Tracks first use** of each API key
2. **Warns at threshold** (e.g., 80% of rotation period)
3. **Alerts when overdue** (past rotation date)
4. **Logs rotation events** for audit trail

## Warning Levels

**Green (0-70% of period):**
- No warnings
- Key is fresh

**Yellow (70-100% of period):**
```
⚠️  API key ANTHROPIC_API_KEY should be rotated soon
Last rotated: 65 days ago (25 days remaining)
```

**Red (>100% of period):**
```
❌ API key ANTHROPIC_API_KEY is overdue for rotation
Last rotated: 95 days ago (5 days overdue)
```

## Key Rotation Process

**Recommended steps:**
1. Generate new API key in service dashboard
2. Update `.env` or secrets manager
3. Test with new key
4. Revoke old key
5. Document rotation in audit log

## Related Settings

- `credential-encryption` - Encrypt stored keys
- `audit-log-enabled` - Log key usage and rotation
- `require-env-validation` - Validate keys before use

## Examples

### High-Security Configuration
```json
{
  "api-key-rotation-days": 30,
  "credential-encryption": true,
  "audit-log-enabled": true
}
```

### Standard Configuration
```json
{
  "api-key-rotation-days": 90,
  "credential-encryption": true
}
```

### Disable Rotation Warnings
```json
{
  "api-key-rotation-days": 0
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
