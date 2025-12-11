---
name: api-versioning-strategies
description: "Master API versioning techniques for backward compatibility and smooth migrations."
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# API Versioning Strategies

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
