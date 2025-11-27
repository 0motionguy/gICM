# Command: /env-setup

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


> Environment configuration setup with validation and secret management

## Description

The `/env-setup` command generates `.env` templates, validates environment variables, sets up secret management, and creates environment-specific configurations for development, staging, and production.

## Usage

```bash
/env-setup [environment] [--validate] [--secrets]
```

## Arguments

- `environment` (optional) - Target environment: `dev`, `staging`, `prod` (default: `dev`)
- `--validate` - Validate existing environment variables
- `--secrets` - Set up secret management (Vault, AWS Secrets Manager)

## Examples

### Example 1: Development environment setup
```bash
/env-setup dev
```
Generates .env.development template with required variables.

### Example 2: Production environment with secrets
```bash
/env-setup prod --secrets
```
Sets up production environment with secret manager integration.

### Example 3: Validate current environment
```bash
/env-setup --validate
```
Validates all required environment variables are set.

## Generated Files

- `.env.example` - Template with all required variables
- `.env.development` - Development configuration
- `.env.staging` - Staging configuration
- `.env.production` - Production configuration
- `env-validator.ts` - Zod validation schema

## Related Commands

- `/security-audit` - Audit for exposed secrets
- `/deploy-prepare-release` - Environment setup for deployment
- `/doc-generate` - Document environment variables
