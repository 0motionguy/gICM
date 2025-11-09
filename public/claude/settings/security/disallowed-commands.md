# Disallowed Commands

Blacklist dangerous bash commands. Comma-separated list. Recommended: rm -rf, dd, mkfs.

## Overview

Prevents execution of specified bash commands that could cause data loss or system damage. Commands are matched by prefix, so 'rm -rf' blocks 'rm -rf /' but allows 'rm file.txt'.

## Configuration

**Category:** Security
**Type:** Array (string list)
**Default:** ["rm -rf /", "dd if=", "mkfs", ":(){ :|:& };:"]

## Usage

```bash
# Use default blacklist
npx @gicm/cli settings add security/disallowed-commands

# Custom blacklist
npx @gicm/cli settings add security/disallowed-commands --value "rm -rf,dd,mkfs,sudo rm"
```

## Default Blacklist

**Destructive Commands:**
```json
{
  "disallowed-commands": [
    "rm -rf /",           // Delete root directory
    "dd if=",             // Disk wipe
    "mkfs",               // Format filesystem
    ":(){ :|:& };:",      // Fork bomb
    "sudo rm -rf",        // Sudo delete
    "> /dev/sda",         // Overwrite disk
    "wget | sh",          // Download and execute
    "curl | bash"         // Download and execute
  ]
}
```

## Command Matching

**Exact prefix match:**
```
"rm -rf /" → Blocks "rm -rf /"
             Allows "rm file.txt"
             Allows "rm -rf ./temp"
```

**Wildcard matching:**
```
"rm *" → Blocks all rm commands
```

## Blocked Command Behavior

When disallowed command is attempted:

```
❌ Blocked dangerous command: rm -rf /
💡 This command is on the security blacklist
💡 Remove from disallowed-commands to allow (not recommended)
```

## Recommended Blacklists

### Maximum Security
```json
{
  "disallowed-commands": [
    "rm *",
    "dd *",
    "mkfs *",
    "format *",
    "> /dev/*",
    "sudo *",
    "wget *| sh",
    "curl *| bash"
  ]
}
```

### Balanced Security (Default)
```json
{
  "disallowed-commands": [
    "rm -rf /",
    "dd if=/dev/zero",
    "mkfs",
    ":(){ :|:& };:"
  ]
}
```

### Minimal Security
```json
{
  "disallowed-commands": [
    "rm -rf /",
    ":(){ :|:& };:"
  ]
}
```

## Override for Legitimate Use

**Temporary override:**
```bash
# Disable blacklist for current operation
npx @gicm/cli settings override disallowed-commands --value ""
# Run command
# Re-enable
npx @gicm/cli settings add security/disallowed-commands
```

**Whitelist specific path:**
```json
{
  "disallowed-commands": [
    "rm -rf /"
  ],
  "allowed-command-exceptions": [
    "rm -rf ./temp",
    "rm -rf ./build"
  ]
}
```

## Related Settings

- `sandbox-mode` - Restrict file operations to project
- `audit-log-enabled` - Log all command executions
- `require-env-validation` - Validate before execution

## Examples

### Maximum Security (Production)
```json
{
  "disallowed-commands": [
    "rm -rf /",
    "dd if=",
    "mkfs",
    "sudo rm",
    "wget | sh",
    "curl | bash"
  ],
  "sandbox-mode": true,
  "audit-log-enabled": true
}
```

### Development
```json
{
  "disallowed-commands": [
    "rm -rf /",
    ":(){ :|:& };:"
  ]
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
