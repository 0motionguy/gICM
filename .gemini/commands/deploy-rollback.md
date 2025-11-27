# /deploy-rollback

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


Reverts to previous deployment versions.

## Usage

```bash
/deploy-rollback [--to-version=1.1.0]
```

## Features

- Identifies previous version
- Executes rollback procedures
- Runs health checks
- Updates DNS/load balancer

## Example

```bash
/deploy-rollback --to-version=1.1.0
```

---

**Version:** 1.0.0
