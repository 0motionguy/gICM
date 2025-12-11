# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 6.x.x   | :white_check_mark: |
| < 6.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT open public issues for security vulnerabilities.**

Instead, please report security issues by emailing the maintainers directly.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **24 hours:** Initial acknowledgment
- **72 hours:** Preliminary assessment
- **7 days:** Detailed response with remediation plan

## Security Best Practices

When using gICM:

1. **Never commit secrets** - Use environment variables
2. **Rotate API keys** regularly
3. **Use Vercel environment variables** for production
4. **Keep dependencies updated** - Run `pnpm audit` regularly

## Disclosure Policy

We follow responsible disclosure. Once a fix is deployed, we will:

1. Credit the reporter (if desired)
2. Publish a security advisory
3. Release a patched version
