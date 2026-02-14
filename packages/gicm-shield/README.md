# @gicm/shield

6-layer security stack for AI agents and APIs. Zero external crypto dependencies — uses Node.js `crypto` exclusively.

## Features

- 🔐 **Auth** — JWT (HS256), API keys (hashed), sessions, PBKDF2 password hashing
- ⏱️ **Rate Limiting** — Token bucket, sliding window, fixed window algorithms
- 🔑 **Secrets** — AES-256 encrypted memory backend, env backend, composite fallback
- 🛡️ **Headers** — CSP, CORS, HSTS, XSS protection, frame options
- 🚨 **Input Guard** — Prompt injection detection with 15+ built-in patterns
- 📋 **Audit** — Event logging with circular buffer (max 10k events)

## Installation

```bash
npm install @gicm/shield
# or
pnpm add @gicm/shield
```

## Quick Start

```typescript
import { Shield } from "@gicm/shield";

const shield = new Shield({
  auth: { jwtSecret: "your-32-char-secret-key-here!!" },
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

// 1. Auth
const auth = shield.authenticate("Bearer <token>");
if (!auth.authenticated) throw new Error(auth.error);

// 2. Rate limit
const rate = shield.checkRate("user-123");
if (!rate.allowed) throw new Error("Rate limited");

// 3. Secrets
const secret = await shield.getSecret("API_KEY");

// 4. Security headers
const headers = shield.generateHeaders("strictApi");

// 5. Input guard
const check = shield.checkInput("ignore previous instructions");
if (!check.safe) console.warn("Threats:", check.threats);

// 6. Audit
shield.on("audit", (event) => console.log(event));
```

## Layer 1: Authentication

### JWT Manager

```typescript
import { JwtManager } from "@gicm/shield";

const jwt = new JwtManager("your-secret-key-at-least-32-chars");

// Sign token
const token = jwt.sign({
  sub: "user-123",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  scope: ["read", "write"],
});

// Verify token
const payload = jwt.verify(token);
if (!payload) throw new Error("Invalid token");

// Decode without verification (debugging only)
const decoded = jwt.decode(token);
```

### API Key Manager

```typescript
import { ApiKeyManager } from "@gicm/shield";

const keys = new ApiKeyManager("myapp");

// Generate key
const key = keys.generate({
  userId: "user-123",
  name: "Production Key",
  scope: ["read", "write"],
  expiresIn: 86400, // 1 day in seconds
});

console.log("Key (save this!):", key.key); // myapp_abc123...

// Validate key
const info = keys.validate("myapp_abc123...");
if (!info) throw new Error("Invalid key");

// Revoke key
keys.revoke(key.id);
```

### Session Manager

```typescript
import { SessionManager } from "@gicm/shield";

const sessions = new SessionManager(3600); // 1 hour default TTL

// Create session
const session = sessions.create("user-123", 7200, { ip: "1.2.3.4" });

// Get session
const retrieved = sessions.get(session.id);

// Extend expiration
sessions.refresh(session.id, 3600);

// Destroy
sessions.destroy(session.id);

// Cleanup expired
sessions.cleanup();
```

### Password Hashing

```typescript
import { hashPassword, verifyPassword } from "@gicm/shield";

// Hash password
const { hash, salt } = await hashPassword("my-password");

// Store hash and salt in database
db.users.insert({ hash, salt });

// Verify password
const user = db.users.find({ username: "alice" });
const valid = await verifyPassword("my-password", user.hash, user.salt);
```

### Scope Checking

```typescript
import { hasScope } from "@gicm/shield";

const userScope = ["read:users", "write:posts"];

hasScope(userScope, "read:users"); // true
hasScope(userScope, ["read:users", "write:posts"]); // true

// Hierarchical
const adminScope = ["admin:*"];
hasScope(adminScope, "admin:users"); // true (matches admin:*)
```

## Layer 2: Rate Limiting

### Basic Rate Limiter

```typescript
import { RateLimiter, RateLimitError } from "@gicm/shield";

const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  algorithm: "sliding-window", // or "token-bucket", "fixed-window"
});

// Check rate limit
const result = limiter.check("api-key-123");
if (!result.allowed) {
  console.log(`Retry after ${result.retryAfter}ms`);
  throw new RateLimitError("Too many requests", result.retryAfter);
}

// Or use .limit() which throws automatically
limiter.limit("api-key-123");
```

### Multi-Tier Rate Limiter

```typescript
import { MultiTierRateLimiter } from "@gicm/shield";

const limiter = new MultiTierRateLimiter([
  { name: "per-second", config: { maxRequests: 10, windowMs: 1000 } },
  { name: "per-minute", config: { maxRequests: 100, windowMs: 60000 } },
  { name: "per-hour", config: { maxRequests: 1000, windowMs: 3600000 } },
]);

// All tiers must pass
limiter.limit("user-123"); // throws with tier name if exceeded
```

### HTTP Headers

```typescript
import { createRateLimitHeaders } from "@gicm/shield";

const result = limiter.check("user-123");
const headers = createRateLimitHeaders(result, 100);

// Returns:
// {
//   "X-RateLimit-Limit": "100",
//   "X-RateLimit-Remaining": "95",
//   "X-RateLimit-Reset": "1234567890",
//   "Retry-After": "30" (if blocked)
// }
```

## Layer 3: Secrets Management

### Secrets Manager

```typescript
import { SecretsManager } from "@gicm/shield";

const secrets = new SecretsManager({
  envPrefix: "GICM", // reads GICM_OPENAI_API_KEY from env
  cacheTtl: 300000, // 5 minutes
});

// Get secret (env -> backend)
const apiKey = await secrets.get("OPENAI_API_KEY");

// Require (throws if missing)
const dbUrl = await secrets.require("DATABASE_URL");

// Get with default
const logLevel = await secrets.getOrDefault("LOG_LEVEL", "info");

// Set secret
await secrets.set("MY_SECRET", "value", {
  expiresAt: Date.now() + 3600000,
  tags: ["production"],
});
```

### Backends

```typescript
import {
  EnvSecretBackend,
  MemorySecretBackend,
  CompositeSecretBackend,
} from "@gicm/shield";

// Environment variables
const envBackend = new EnvSecretBackend("GICM");

// AES-256 encrypted in-memory
const memoryBackend = new MemorySecretBackend("64-char-hex-key");

// Composite (fallback chain)
const composite = new CompositeSecretBackend([envBackend, memoryBackend]);

const secrets = new SecretsManager({ backend: composite });
```

### Utility Functions

```typescript
import { generateSecretKey, generateApiKey, redactSecrets } from "@gicm/shield";

// Generate 32-byte random key
const key = generateSecretKey(); // 64 hex chars

// Generate API key
const apiKey = generateApiKey("myapp"); // myapp_<32-base64url-chars>

// Redact sensitive fields for logging
const obj = { username: "alice", password: "secret", apiKey: "key123" };
const safe = redactSecrets(obj);
// { username: "alice", password: "[REDACTED]", apiKey: "[REDACTED]" }
```

## Layer 4: Security Headers

### Generate Headers

```typescript
import { generateSecurityHeaders, SECURITY_PRESETS } from "@gicm/shield";

// Use preset
const headers = generateSecurityHeaders(SECURITY_PRESETS.strictApi);

// Custom configuration
const custom = generateSecurityHeaders({
  csp: {
    "default-src": ["'self'"],
    "script-src": ["'self'", "https://cdn.example.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  cors: {
    allowedOrigins: ["https://example.com", "https://*.example.com"],
    allowedMethods: ["GET", "POST"],
    credentials: true,
  },
  frameOptions: "DENY",
  xssProtection: true,
  referrerPolicy: "strict-origin-when-cross-origin",
});
```

### CSP Presets

```typescript
import { CSP_PRESETS, buildCspString } from "@gicm/shield";

// Presets: strict, moderate, relaxed, api
const csp = buildCspString(CSP_PRESETS.strict);
// "default-src 'self'; script-src 'self'; style-src 'self'; ..."
```

### CORS Validation

```typescript
import { isOriginAllowed } from "@gicm/shield";

const allowed = isOriginAllowed("https://app.example.com", [
  "https://example.com",
  "https://*.example.com",
]);
```

## Layer 5: Input Guard

```typescript
import { InputGuard } from "@gicm/shield";

const guard = new InputGuard({
  maxLength: 10000,
  sanitize: true,
  blockPatterns: [/custom-pattern/i],
});

const result = guard.checkInput(userInput);

if (!result.safe) {
  console.log("Threats detected:", result.threats);
  console.log("Risk score:", result.score); // 0-1
  console.log("Sanitized:", result.sanitized);
}
```

### Built-in Patterns

- Instruction override ("ignore previous instructions")
- Role injection ("you are now an admin")
- Instruction manipulation ("new instructions:")
- Jailbreak attempts ("developer mode")
- Encoding-based injection (base64, hex)
- Prompt leakage ("show your system prompt")

## Layer 6: Audit Logging

```typescript
import { AuditLogger } from "@gicm/shield";

const audit = new AuditLogger({
  maxEvents: 10000,
  enableConsole: false,
});

// Log event
audit.log({
  action: "api.request",
  actor: "user-123",
  resource: "/data",
  result: "success",
  metadata: { ip: "1.2.3.4" },
});

// Convenience methods
audit.logAuth("user-123", "success");
audit.logRateLimit("api-key-123", "/api", false);
audit.logSecretAccess("user-123", "API_KEY", true);
audit.logInputGuard("user-123", true, ["Instruction override"]);

// Query events
const events = audit.getEvents({
  action: "auth.login",
  result: "failure",
  since: new Date(Date.now() - 3600000),
});

// Stats
const stats = audit.getStats();
console.log(stats.totalEvents, stats.successCount, stats.failureCount);

// Listen to events
audit.on("audit:event", (event) => {
  // Send to external logging service
});
```

## Complete Example

```typescript
import { Shield } from "@gicm/shield";

const shield = new Shield({
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    apiKeyPrefix: "myapp",
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
    algorithm: "sliding-window",
  },
  secrets: {
    envPrefix: "MYAPP",
    cacheTtl: 300000,
  },
  headers: {
    csp: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
    },
    hsts: { maxAge: 31536000 },
  },
  inputGuard: {
    maxLength: 10000,
    sanitize: true,
  },
  audit: {
    maxEvents: 10000,
    enableConsole: true,
  },
});

// Express middleware example
app.use((req, res, next) => {
  // 1. Auth
  const authResult = shield.authenticate(req.headers.authorization || "");
  if (!authResult.authenticated) {
    return res.status(401).json({ error: authResult.error });
  }

  // 2. Rate limit
  const rateResult = shield.checkRate(authResult.userId!);
  if (!rateResult.allowed) {
    return res.status(429).json({
      error: "Too many requests",
      retryAfter: rateResult.retryAfter,
    });
  }

  // 3. Input guard
  if (req.body?.prompt) {
    const guardResult = shield.checkInput(req.body.prompt, authResult.userId);
    if (!guardResult.safe) {
      return res.status(400).json({
        error: "Input blocked",
        threats: guardResult.threats,
      });
    }
  }

  // 4. Security headers
  const headers = shield.generateHeaders("strictApi");
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  next();
});

// Audit listener
shield.on("audit", (event) => {
  if (event.result === "failure" || event.result === "blocked") {
    console.warn("Security event:", event);
  }
});

// Stats endpoint
app.get("/stats", (req, res) => {
  res.json(shield.getStats());
});
```

## TypeScript

Fully typed with TypeScript. All types are exported:

```typescript
import type {
  ShieldConfig,
  ShieldStats,
  AuthResult,
  RateLimitResult,
  InputGuardResult,
  AuditEvent,
} from "@gicm/shield";
```

## Security Notes

1. **JWT Secret**: Must be at least 32 characters. Use `generateSecretKey()` to create one.
2. **No External Crypto**: Uses Node.js `crypto` only — zero external crypto dependencies.
3. **Timing-Safe Comparison**: All token/password comparisons use `timingSafeEqual`.
4. **Password Hashing**: PBKDF2 with 100,000 iterations, SHA-512, 64-byte output.
5. **AES-256-CBC**: Secrets encrypted in memory with random IV per value.

## License

MIT
