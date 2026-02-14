/**
 * Shared types and Zod schemas for @gicm/shield
 */

import { z } from "zod";

// ============================================================================
// Auth Types
// ============================================================================

export const AuthConfigSchema = z.object({
  /** JWT secret for signing tokens */
  jwtSecret: z.string().min(32).optional(),
  /** Token expiration in seconds */
  tokenExpiration: z.number().default(3600), // 1 hour
  /** Refresh token expiration in seconds */
  refreshExpiration: z.number().default(604800), // 7 days
  /** API key prefix for validation */
  apiKeyPrefix: z.string().default("gicm"),
  /** Enable API key authentication */
  enableApiKey: z.boolean().default(true),
  /** Enable JWT authentication */
  enableJwt: z.boolean().default(true),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export interface TokenPayload {
  sub: string; // Subject (user ID)
  iat: number; // Issued at
  exp: number; // Expiration
  scope?: string[]; // Permissions
  metadata?: Record<string, unknown>;
}

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  scope?: string[];
  expiresAt?: number;
  error?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  lastActive: number;
  metadata?: Record<string, unknown>;
}

export interface ApiKeyInfo {
  id: string;
  key: string;
  hashedKey: string;
  userId: string;
  name: string;
  scope: string[];
  createdAt: number;
  expiresAt?: number;
  lastUsed?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Rate Limit Types
// ============================================================================

export const RateLimitConfigSchema = z.object({
  /** Maximum requests per window */
  maxRequests: z.number().min(1),
  /** Window duration in milliseconds */
  windowMs: z.number().min(1),
  /** Algorithm to use */
  algorithm: z
    .enum(["token-bucket", "sliding-window", "fixed-window"])
    .default("sliding-window"),
  /** Burst allowance (for token bucket) */
  burstSize: z.number().optional(),
  /** Key prefix for storage */
  keyPrefix: z.string().default("ratelimit"),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export interface RateLimitStats {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  uniqueKeys: number;
}

// ============================================================================
// Secrets Types
// ============================================================================

export const SecretMetadataSchema = z.object({
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  expiresAt: z.number().optional(),
  rotationDue: z.number().optional(),
  tags: z.array(z.string()).optional(),
  version: z.number().default(1),
});

export type SecretMetadata = z.infer<typeof SecretMetadataSchema>;

export interface SecretValue {
  value: string;
  metadata: SecretMetadata;
}

export interface SecretBackend {
  name: string;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    metadata?: Partial<SecretMetadata>
  ): Promise<void>;
  delete(key: string): Promise<boolean>;
  list(): Promise<string[]>;
  exists(key: string): Promise<boolean>;
}

// ============================================================================
// Headers Types
// ============================================================================

export const CspDirectiveSchema = z.object({
  "default-src": z.array(z.string()).optional(),
  "script-src": z.array(z.string()).optional(),
  "style-src": z.array(z.string()).optional(),
  "img-src": z.array(z.string()).optional(),
  "font-src": z.array(z.string()).optional(),
  "connect-src": z.array(z.string()).optional(),
  "media-src": z.array(z.string()).optional(),
  "object-src": z.array(z.string()).optional(),
  "frame-src": z.array(z.string()).optional(),
  "frame-ancestors": z.array(z.string()).optional(),
  "form-action": z.array(z.string()).optional(),
  "base-uri": z.array(z.string()).optional(),
  "worker-src": z.array(z.string()).optional(),
  "manifest-src": z.array(z.string()).optional(),
  "upgrade-insecure-requests": z.boolean().optional(),
  "block-all-mixed-content": z.boolean().optional(),
  "report-uri": z.string().optional(),
  "report-to": z.string().optional(),
});

export type CspDirectives = z.infer<typeof CspDirectiveSchema>;

export const CorsConfigSchema = z.object({
  /** Allowed origins (use '*' for any, or array of specific origins) */
  allowedOrigins: z.union([z.literal("*"), z.array(z.string())]).default("*"),
  /** Allowed HTTP methods */
  allowedMethods: z
    .array(z.string())
    .default(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]),
  /** Allowed headers */
  allowedHeaders: z
    .array(z.string())
    .default(["Content-Type", "Authorization", "X-Requested-With"]),
  /** Exposed headers */
  exposedHeaders: z.array(z.string()).optional(),
  /** Allow credentials */
  credentials: z.boolean().default(false),
  /** Max age for preflight cache (seconds) */
  maxAge: z.number().default(86400),
});

export type CorsConfig = z.infer<typeof CorsConfigSchema>;

export const SecurityHeadersConfigSchema = z.object({
  /** Content Security Policy */
  csp: CspDirectiveSchema.optional(),
  /** Report-only CSP (for testing) */
  cspReportOnly: z.boolean().default(false),
  /** CORS configuration */
  cors: CorsConfigSchema.optional(),
  /** HTTP Strict Transport Security */
  hsts: z
    .object({
      maxAge: z.number().default(31536000), // 1 year
      includeSubDomains: z.boolean().default(true),
      preload: z.boolean().default(false),
    })
    .optional(),
  /** X-Content-Type-Options */
  noSniff: z.boolean().default(true),
  /** X-Frame-Options */
  frameOptions: z.enum(["DENY", "SAMEORIGIN"]).default("DENY"),
  /** X-XSS-Protection (legacy but still useful) */
  xssProtection: z.boolean().default(true),
  /** Referrer-Policy */
  referrerPolicy: z
    .enum([
      "no-referrer",
      "no-referrer-when-downgrade",
      "origin",
      "origin-when-cross-origin",
      "same-origin",
      "strict-origin",
      "strict-origin-when-cross-origin",
      "unsafe-url",
    ])
    .default("strict-origin-when-cross-origin"),
  /** Permissions-Policy */
  permissionsPolicy: z.record(z.array(z.string())).optional(),
  /** Cross-Origin-Embedder-Policy */
  coep: z.enum(["require-corp", "credentialless", "unsafe-none"]).optional(),
  /** Cross-Origin-Opener-Policy */
  coop: z
    .enum(["same-origin", "same-origin-allow-popups", "unsafe-none"])
    .optional(),
  /** Cross-Origin-Resource-Policy */
  corp: z.enum(["same-site", "same-origin", "cross-origin"]).optional(),
});

export type SecurityHeadersConfig = z.infer<typeof SecurityHeadersConfigSchema>;

// ============================================================================
// Input Guard Types
// ============================================================================

export const InputGuardConfigSchema = z.object({
  /** Maximum input length */
  maxLength: z.number().default(10000),
  /** Block patterns for injection detection */
  blockPatterns: z.array(z.instanceof(RegExp)).default([]),
  /** Sanitize dangerous content */
  sanitize: z.boolean().default(false),
});

export type InputGuardConfig = z.infer<typeof InputGuardConfigSchema>;

export interface InputGuardResult {
  safe: boolean;
  threats: string[];
  sanitized?: string;
  score: number; // Risk score 0-1
}

// ============================================================================
// Audit Types
// ============================================================================

export const AuditEventSchema = z.object({
  timestamp: z.date(),
  action: z.string(),
  actor: z.string().optional(),
  resource: z.string().optional(),
  result: z.enum(["success", "failure", "blocked"]),
  metadata: z.record(z.unknown()).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const AuditConfigSchema = z.object({
  /** Maximum number of events to keep in memory */
  maxEvents: z.number().default(10000),
  /** Enable console logging */
  enableConsole: z.boolean().default(false),
});

export type AuditConfig = z.infer<typeof AuditConfigSchema>;

// ============================================================================
// Shield Config
// ============================================================================

export const ShieldConfigSchema = z.object({
  auth: AuthConfigSchema.partial().optional(),
  rateLimit: RateLimitConfigSchema.partial().optional(),
  secrets: z
    .object({
      envPrefix: z.string().optional(),
      cacheTtl: z.number().optional(),
    })
    .optional(),
  headers: SecurityHeadersConfigSchema.partial().optional(),
  inputGuard: InputGuardConfigSchema.partial().optional(),
  audit: AuditConfigSchema.partial().optional(),
});

export type ShieldConfig = z.infer<typeof ShieldConfigSchema>;

// ============================================================================
// Shield Stats
// ============================================================================

export interface ShieldStats {
  auth: {
    totalAttempts: number;
    successful: number;
    failed: number;
  };
  rateLimit: RateLimitStats;
  secrets: {
    totalAccesses: number;
    cacheHits: number;
    cacheMisses: number;
  };
  inputGuard: {
    totalChecks: number;
    blocked: number;
    sanitized: number;
  };
  audit: {
    totalEvents: number;
  };
}
