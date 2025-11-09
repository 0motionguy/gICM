# Audit Log Enabled

Enable security audit logging for all sensitive operations. Recommended for production environments.

## Overview

When enabled, logs all sensitive operations including file modifications, environment variable access, API calls, and command executions. Essential for security compliance and debugging.

## Configuration

**Category:** Security
**Type:** Boolean
**Default:** false
**Recommended:** true for production

## Usage

```bash
# Enable audit logging
npx @gicm/cli settings add security/audit-log-enabled --value true

# Disable audit logging (default)
npx @gicm/cli settings add security/audit-log-enabled --value false
```

## What Gets Logged

**File Operations:**
- File reads (path, size, timestamp)
- File writes (path, changes, timestamp)
- File deletions (path, timestamp)
- Directory operations

**Environment Access:**
- Environment variable reads
- Configuration changes
- Credential access

**API Calls:**
- Endpoint URLs
- Request methods
- Response codes
- Timestamps

**Command Executions:**
- Bash commands
- Exit codes
- Output summaries

## Log Format

```json
{
  "timestamp": "2025-11-08T10:30:45.123Z",
  "operation": "file_write",
  "details": {
    "path": "src/app/page.tsx",
    "size": 1247,
    "changes": "+15 -3 lines"
  },
  "user": "claude",
  "session_id": "abc123"
}
```

## Log Storage

**Default location:** `.claude/logs/audit.log`

**Rotation:**
- Daily rotation
- Keep last 30 days
- Compress old logs
- Max file size: 10MB

## Compliance

**Audit logs support:**
- SOC 2 compliance
- ISO 27001 requirements
- GDPR audit trails
- Internal security policies

## Performance Impact

- **Disk I/O:** Minimal (<1% overhead)
- **File size:** ~1-5MB per day typical usage
- **CPU impact:** Negligible

## Log Analysis

**Search for file modifications:**
```bash
grep "file_write" .claude/logs/audit.log
```

**Find API calls to specific domain:**
```bash
grep "api.anthropic.com" .claude/logs/audit.log
```

**Track environment variable access:**
```bash
grep "env_read" .claude/logs/audit.log
```

## Related Settings

- `sandbox-mode` - Restricts operations that can be logged
- `require-env-validation` - Validates before logging
- `error-notification-webhook` - Alert on suspicious activity

## Examples

### Maximum Security (Production)
```json
{
  "audit-log-enabled": true,
  "sandbox-mode": true,
  "credential-encryption": true,
  "require-env-validation": true
}
```

### Development
```json
{
  "audit-log-enabled": false
}
```

### CI/CD
```json
{
  "audit-log-enabled": true,
  "audit-log-retention-days": 90
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
