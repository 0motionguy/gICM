# /secrets-scan

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


## Overview
Scan codebase for exposed secrets, API keys, credentials, and sensitive information. Provide remediation guidance and prevention strategies.

## Usage

```bash
/secrets-scan
/secrets-scan --git-history
/secrets-scan --remediate
```

## Features

- **Secret Detection**: Find API keys, tokens, credentials, private keys
- **Git History Scan**: Check commit history for leaked secrets
- **Multiple Providers**: AWS, GCP, Azure, Stripe, GitHub, etc
- **Custom Patterns**: Define custom secret patterns
- **Remediation Guide**: Steps to revoke and replace secrets
- **Prevention Setup**: Pre-commit hooks, .gitignore updates
- **Real-time Monitoring**: Continuous scanning setup
- **False Positive Filtering**: Reduce noise with smart detection
- **Reporting**: Detailed HTML and JSON reports

## Configuration

```yaml
secretsScanning:
  providers:
    - aws
    - github
    - stripe
    - sendgrid
    - custom
  scanGitHistory: true
  maxDepth: 100 # commits to scan
  ignorePatterns: []
  autoRemediate: false
  enableHooks: true
```

## Example Output

```
Secrets Scan Report
===================

CRITICAL (Immediate Action Required)
====================================

1. AWS Access Key Exposed
   Location: src/config.ts:45
   Value: AKIA****YQGE (AWS Secret Access Key)
   Action:
     [ ] Revoke key in AWS Console
     [ ] Generate new key
     [ ] Update environment variables
     [ ] Commit without the key

2. GitHub Token Found
   Location: .github/workflows/deploy.yml:12
   Value: ghp_****7f9d (Personal Access Token)
   Action:
     [ ] Revoke token at github.com/settings/tokens
     [ ] Generate new token with limited scope
     [ ] Use GitHub Secrets for storage

WARNING (Review)
=================

3. API Key Pattern Detected
   Location: config/api-keys.json:23
   Pattern: Potential API key format
   Review: Confirm if actual secret

Prevention Setup
=================

Enabling pre-commit hooks...
Creating .gitignore rules...
Setup summary:
  ✓ Pre-commit hook installed
  ✓ .gitignore updated
  ✓ Secrets monitoring enabled
```

## Options

- `--git-history`: Scan commit history
- `--remediate`: Show remediation steps
- `--providers`: Specific providers to scan
- `--output`: Custom report path
- `--enable-hooks`: Install pre-commit hooks

## See Also

- `/env-validator` - Environment validation
- `/security-audit` - Security testing
- `/security-dependency-audit` - Dependency security
