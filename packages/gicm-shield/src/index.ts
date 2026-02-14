/**
 * @gicm/shield - 6-layer security stack for AI agents
 *
 * Layers:
 * 1. Auth (JWT + API keys + sessions + password hashing)
 * 2. Rate limiting (3 algorithms: token bucket, sliding window, fixed window)
 * 3. Secrets (encrypted env/memory/composite backends)
 * 4. Headers (CSP, CORS, HSTS, etc.)
 * 5. Input guard (prompt injection detection)
 * 6. Audit (event logging)
 */

// Main Shield class
export { Shield } from "./shield.js";

// Auth layer
export {
  JwtManager,
  ApiKeyManager,
  SessionManager,
  hasScope,
  parseAuthHeader,
  hashPassword,
  verifyPassword,
  base64urlEncode,
  base64urlDecode,
} from "./auth.js";

// Rate limiting layer
export {
  TokenBucketLimiter,
  SlidingWindowLimiter,
  FixedWindowLimiter,
  RateLimiter,
  MultiTierRateLimiter,
  RateLimitError,
  createRateLimitHeaders,
} from "./rate-limiter.js";
export type { TierConfig } from "./rate-limiter.js";

// Secrets layer
export {
  EnvSecretBackend,
  MemorySecretBackend,
  CompositeSecretBackend,
  SecretsManager,
  generateSecretKey,
  generateApiKey,
  isValidApiKey,
  redactSecrets,
} from "./secrets.js";
export type { SecretsManagerConfig } from "./secrets.js";

// Headers layer
export {
  buildCspString,
  generateCorsHeaders,
  generateSecurityHeaders,
  isOriginAllowed,
  CSP_PRESETS,
  SECURITY_PRESETS,
} from "./headers.js";
export type { CorsHeaders } from "./headers.js";

// Input guard layer
export { InputGuard } from "./input-guard.js";

// Audit layer
export { AuditLogger } from "./audit.js";

// Types
export type {
  AuthConfig,
  TokenPayload,
  AuthResult,
  Session,
  ApiKeyInfo,
  RateLimitConfig,
  RateLimitResult,
  RateLimitStats,
  SecretMetadata,
  SecretValue,
  SecretBackend,
  CspDirectives,
  CorsConfig,
  SecurityHeadersConfig,
  InputGuardConfig,
  InputGuardResult,
  AuditEvent,
  AuditConfig,
  ShieldConfig,
  ShieldStats,
} from "./types.js";
