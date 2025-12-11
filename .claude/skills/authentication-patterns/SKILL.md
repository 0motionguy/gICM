---
name: authentication-patterns
description: "{"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
---

# Authentication Patterns

Master authentication strategies including JWT, OAuth 2.0, and session management.

## Quick Reference

### JWT Authentication
```typescript
import jwt from 'jsonwebtoken'

// Generate token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET)

// Middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}
```

### Refresh Tokens
```typescript
const accessToken = jwt.sign(payload, SECRET, { expiresIn: '15m' })
const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })

// Store refresh token in database
await db.refreshTokens.create({
  token: refreshToken,
  userId: user.id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
})
```

### OAuth 2.0 Flow
```typescript
// Authorization URL
const authUrl = `https://oauth-provider.com/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=read write`

// Exchange code for token
const response = await fetch('https://oauth-provider.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: authCode,
    grant_type: 'authorization_code'
  })
})

const { access_token } = await response.json()
```

## Best Practices

- Use HTTPS only for auth endpoints
- Store passwords with bcrypt (cost factor 10-12)
- Implement rate limiting on auth endpoints
- Use short-lived access tokens (15 min)
- Rotate refresh tokens on use
- Implement 2FA for sensitive operations
- Never store tokens in localStorage (use httpOnly cookies)
