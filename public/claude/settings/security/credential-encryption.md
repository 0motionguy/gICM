# Credential Encryption

Encrypt stored credentials at rest. Highly recommended for production environments.

## Overview

Enables encryption for all stored credentials including API keys, database passwords, and authentication tokens. Uses AES-256 encryption with system keychain integration.

## Configuration

**Category:** Security
**Type:** Boolean
**Default:** false
**Recommended:** true for production

## Usage

```bash
# Enable encryption
npx @gicm/cli settings add security/credential-encryption --value true

# Disable encryption (default)
npx @gicm/cli settings add security/credential-encryption --value false
```

## How It Works

1. **Encryption:** AES-256-GCM encryption
2. **Key Storage:** System keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
3. **Key Derivation:** PBKDF2 with 100,000 iterations
4. **Salt:** Unique per installation

## What Gets Encrypted

**Credentials:**
- API keys (Anthropic, GitHub, Alchemy, etc.)
- Database passwords
- Private keys and mnemonics
- OAuth tokens
- Webhook secrets

**Configuration:**
- Stored in `.claude/credentials.encrypted`
- Decrypted on demand
- Never written to disk in plaintext

## Security Benefits

1. **At-Rest Protection:** Credentials safe if disk is compromised
2. **Access Control:** Requires system-level authentication
3. **Audit Trail:** Track credential access
4. **Compliance:** Meets encryption requirements (PCI, HIPAA)

## Performance Impact

- **Encryption overhead:** ~2-5ms per operation
- **Decryption overhead:** ~1-3ms per operation
- **Memory:** Credentials cached in memory during session
- **Disk:** Encrypted file ~10-50KB

## Setup Process

**First-time setup:**
```bash
# Enable encryption
npx @gicm/cli settings add security/credential-encryption --value true

# Migrate existing credentials
npx @gicm/cli credentials migrate-to-encrypted
```

**System will prompt:**
```
🔐 Initializing credential encryption
→ Generating encryption key
→ Storing key in system keychain
→ Encrypting existing credentials
✓ Migration complete

All credentials are now encrypted at rest.
```

## Troubleshooting

**Cannot decrypt credentials:**
1. Check system keychain access
2. Verify user has permission
3. Re-initialize encryption if needed

**Lost encryption key:**
```bash
# Reset (will lose existing credentials)
npx @gicm/cli credentials reset-encryption

# Then re-enter credentials
npx @gicm/cli credentials set ANTHROPIC_API_KEY
```

## Related Settings

- `require-env-validation` - Validate credentials before use
- `api-key-rotation-days` - Rotate credentials regularly
- `audit-log-enabled` - Log credential access

## Examples

### Maximum Security (Production)
```json
{
  "credential-encryption": true,
  "audit-log-enabled": true,
  "api-key-rotation-days": 30,
  "require-env-validation": true
}
```

### Development
```json
{
  "credential-encryption": false
}
```

### CI/CD
```json
{
  "credential-encryption": true,
  "require-env-validation": true
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
