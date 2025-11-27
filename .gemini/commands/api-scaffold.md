# /api-scaffold

> **Universal Command**: Works across Claude, Gemini, and OpenAI.
> Optimized for: Gemini 2.0 Flash | Also compatible with: Claude, GPT-4o


Generates REST/GraphQL API scaffolding.

## Usage

```bash
/api-scaffold <api_name> [--type=rest|graphql|grpc]
```

## Generates

- Route handlers
- Validation schemas (Zod)
- Error handling
- API documentation
- Test templates
- Blockchain RPC endpoints (Web3)

## Example

```bash
/api-scaffold user-auth --type=rest
```

---

**Version:** 1.0.0
