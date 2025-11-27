# API Versioning Strategies

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: Gemini 2.0 Flash / Gemini 3.0 Pro | Also compatible with: Claude Opus, GPT-4o


Master API versioning techniques for backward compatibility and smooth migrations.

## Quick Reference

### URL Versioning
```
GET /v1/users
GET /v2/users
```

### Header Versioning
```
GET /users
Accept: application/vnd.myapi.v2+json
```

### Query Parameter
```
GET /users?version=2
```

### Content Negotiation
```
Accept: application/json; version=2
```

## Best Practices

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Deprecate old versions with sunset warnings
- Maintain at least 2 versions simultaneously
- Document breaking changes clearly
- Provide migration guides
- Use feature flags for gradual rollout
