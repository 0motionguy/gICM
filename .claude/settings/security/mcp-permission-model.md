# MCP Permission Model

MCP server permission model. Options: strict, permissive, custom. Recommended: strict for production.

## Overview

Controls permission model for MCP servers. 'strict' requires explicit approval for each operation, 'permissive' auto-approves known safe operations, 'custom' uses custom permission rules.

## Configuration

**Category:** Security
**Type:** String (enum)
**Default:** permissive
**Options:** strict, permissive, custom

## Usage

```bash
# Strict mode (production)
npx @gicm/cli settings add security/mcp-permission-model --value strict

# Permissive mode (default)
npx @gicm/cli settings add security/mcp-permission-model --value permissive

# Custom permission rules
npx @gicm/cli settings add security/mcp-permission-model --value custom
```

## Permission Models

### Strict
**Behavior:**
- Requires approval for every MCP operation
- User confirms each database query, API call, file operation
- Maximum security, slowest workflow

**Use cases:**
- Production environments with sensitive data
- Compliance requirements
- Untrusted MCP servers
- Learning/audit mode

### Permissive (Default)
**Behavior:**
- Auto-approves safe read operations
- Requires approval for writes, deletes, API calls
- Balance of security and usability

**Use cases:**
- Development environments
- Trusted MCP servers
- Standard operations
- Most use cases

### Custom
**Behavior:**
- Define custom permission rules
- Granular control per MCP server
- Rule-based auto-approval

**Use cases:**
- Complex security requirements
- Mixed trust environments
- Custom workflows

## Affected MCP Servers

- `supabase-mcp` - Database operations
- `github-mcp` - Repository access
- `alchemy-mcp` - Blockchain RPC
- `filesystem-mcp` - File operations
- `e2b-mcp` - Code execution
- All custom MCP servers

## Permission Prompts

**Strict mode example:**
```
🔒 MCP Permission Request
Server: supabase-mcp
Operation: SELECT users WHERE id = 123
Risk: Read access to user data

[Approve] [Deny] [Approve All for Session]
```

**Permissive mode example:**
```
🔒 MCP Permission Request (Write Operation)
Server: supabase-mcp
Operation: DELETE FROM users WHERE id = 123
Risk: Data deletion

[Approve] [Deny]
```

## Custom Rules

Edit `.claude/settings.json`:
```json
{
  "mcp-permission-model": "custom",
  "mcp-permissions": {
    "supabase-mcp": {
      "read": "auto-approve",
      "write": "prompt",
      "delete": "deny"
    },
    "github-mcp": {
      "read": "auto-approve",
      "write": "prompt"
    },
    "filesystem-mcp": {
      "read": "auto-approve",
      "write": "sandbox-only",
      "delete": "prompt"
    }
  }
}
```

## Related Settings

- `sandbox-mode` - Restricts file operations
- `audit-log-enabled` - Log all MCP operations
- `allowed-domains` - Whitelist API endpoints

## Examples

### Maximum Security (Production)
```json
{
  "mcp-permission-model": "strict",
  "sandbox-mode": true,
  "audit-log-enabled": true
}
```

### Development
```json
{
  "mcp-permission-model": "permissive",
  "sandbox-mode": false
}
```

### Custom Rules
```json
{
  "mcp-permission-model": "custom",
  "mcp-permissions": {
    "*": {
      "read": "auto-approve",
      "write": "prompt",
      "delete": "deny"
    }
  }
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
