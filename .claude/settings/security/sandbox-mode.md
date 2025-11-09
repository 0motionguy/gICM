# Sandbox Mode

Restrict file system access to project directory. Prevents accidental modification of system files.

## Overview

Sandbox Mode creates an isolated environment that restricts Claude Code's file system access to the current project directory and its subdirectories. This provides an additional security layer by preventing accidental or malicious access to system files, user directories, and sensitive data outside the project scope.

## Configuration

**Category:** Security
**Type:** Boolean
**Default:** false
**Recommended:** true for production, false for development

## Usage

```bash
# Enable sandbox mode
npx @gicm/cli settings add security/sandbox-mode --value true

# Disable sandbox mode (default)
npx @gicm/cli settings add security/sandbox-mode --value false
```

## How It Works

When enabled, Sandbox Mode:
1. **Restricts file reads** to project directory only
2. **Restricts file writes** to project directory only
3. **Blocks bash commands** that attempt to access parent directories
4. **Prevents environment variable** access outside allowed list
5. **Logs all attempts** to access restricted resources

## Allowed Paths

With Sandbox Mode enabled, Claude Code can access:

### Always Allowed
- Current project directory (`./`)
- All subdirectories within project
- `.claude/` configuration directory
- `node_modules/` (read-only)
- `.git/` (read-only)

### Blocked
- Parent directories (`../`)
- System directories (`/etc`, `/usr`, `/bin`, etc.)
- User home directory (`~`)
- Other projects
- Temporary directories outside project

## Security Benefits

1. **Prevents Data Leakage:** Cannot accidentally read sensitive files
2. **Prevents Data Loss:** Cannot delete or modify system files
3. **Audit Trail:** All blocked attempts are logged
4. **Compliance:** Meets security requirements for restricted environments
5. **Peace of Mind:** Safe to run untrusted agents or commands

## Use Cases

### When to Enable
- Production environments
- CI/CD pipelines
- Shared development environments
- When running untrusted code
- Compliance requirements (SOC2, ISO27001)
- Teaching/educational contexts

### When to Disable
- Local development with full trust
- Need to access multiple projects simultaneously
- System-wide operations (e.g., updating global npm packages)
- Debugging system-level issues

## Performance Impact

- **Minimal:** ~5-10ms overhead per file operation for path validation
- **No network impact:** Only affects file system operations
- **Caching:** Validated paths are cached for performance

## Configuration Examples

### Maximum Security (Production)
```json
{
  "sandbox-mode": true,
  "audit-log-enabled": true,
  "require-env-validation": true,
  "mcp-permission-model": "strict"
}
```

### Balanced Security (Staging)
```json
{
  "sandbox-mode": true,
  "audit-log-enabled": true,
  "require-env-validation": true,
  "mcp-permission-model": "permissive"
}
```

### Development (Local)
```json
{
  "sandbox-mode": false,
  "audit-log-enabled": false,
  "require-env-validation": false,
  "mcp-permission-model": "permissive"
}
```

## Troubleshooting

### "Access Denied" Errors

If you encounter access denied errors:

1. **Verify you're in the correct directory:**
   ```bash
   pwd  # Should be your project directory
   ```

2. **Check if the file is outside project:**
   ```bash
   realpath ./your-file  # Should start with project path
   ```

3. **Temporarily disable for diagnosis:**
   ```bash
   npx @gicm/cli settings remove security/sandbox-mode
   ```

4. **Review audit logs:**
   ```bash
   cat .claude/logs/sandbox-violations.log
   ```

### Legitimate Need for System Access

If you need to access files outside the project:

1. **Disable temporarily:** `npx @gicm/cli settings remove security/sandbox-mode`
2. **Complete operation**
3. **Re-enable:** `npx @gicm/cli settings add security/sandbox-mode --value true`

Or configure allowed paths in `.claude/settings.json`:
```json
{
  "sandbox-mode": true,
  "sandbox-allowed-paths": [
    "/path/to/shared/library",
    "~/Documents/project-assets"
  ]
}
```

## Related Settings

- `audit-log-enabled` - Log all blocked access attempts
- `mcp-permission-model` - Controls MCP server permissions
- `disallowed-commands` - Blocks dangerous bash commands
- `require-env-validation` - Validates environment variables

## Advanced Configuration

### Custom Allowed Paths

Edit `.claude/settings.json`:
```json
{
  "sandbox-mode": true,
  "sandbox-config": {
    "allowed-paths": [
      "./",
      "/opt/custom-tools",
      "~/shared-assets"
    ],
    "allowed-env-vars": [
      "NODE_ENV",
      "DATABASE_URL",
      "API_KEY"
    ],
    "blocked-patterns": [
      "**/secrets/**",
      "**/.env.production"
    ]
  }
}
```

### Audit Log Configuration

```json
{
  "sandbox-mode": true,
  "sandbox-audit": {
    "log-file": ".claude/logs/sandbox-violations.log",
    "log-level": "warning",
    "alert-webhook": "https://hooks.slack.com/..."
  }
}
```

## ICM Motion Specific

For ICM Motion launch platform:

```json
{
  "sandbox-mode": true,
  "sandbox-config": {
    "allowed-paths": [
      "./",
      "./.claude",
      "./src",
      "./packages"
    ],
    "blocked-patterns": [
      "**/.env.production",
      "**/wallet-private-keys/**",
      "**/treasury/**"
    ]
  }
}
```

Particularly important for:
- Protecting private keys and mnemonics
- Preventing accidental exposure of treasury controls
- Isolating bonding curve calculations
- Securing admin API keys

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
