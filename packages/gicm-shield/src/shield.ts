/**
 * Main Shield class composing all 6 security layers
 */

import { EventEmitter } from "events";
import { JwtManager, ApiKeyManager, SessionManager } from "./auth.js";
import { RateLimiter } from "./rate-limiter.js";
import { SecretsManager } from "./secrets.js";
import { generateSecurityHeaders, SECURITY_PRESETS } from "./headers.js";
import { InputGuard } from "./input-guard.js";
import { AuditLogger } from "./audit.js";
import type {
  ShieldConfig,
  ShieldStats,
  AuthResult,
  RateLimitResult,
  InputGuardResult,
  AuditEvent,
} from "./types.js";

// ============================================================================
// Shield Class
// ============================================================================

export class Shield extends EventEmitter {
  public readonly jwt?: JwtManager;
  public readonly apiKeys: ApiKeyManager;
  public readonly sessions: SessionManager;
  public readonly rateLimit: RateLimiter;
  public readonly secrets: SecretsManager;
  public readonly guard: InputGuard;
  public readonly audit: AuditLogger;

  private authStats = {
    totalAttempts: 0,
    successful: 0,
    failed: 0,
  };

  constructor(config?: Partial<ShieldConfig>) {
    super();

    // 1. Auth layer
    const authConfig = config?.auth ?? {};
    if (authConfig.jwtSecret && authConfig.jwtSecret.length >= 32) {
      this.jwt = new JwtManager(authConfig.jwtSecret);
    }
    this.apiKeys = new ApiKeyManager(authConfig.apiKeyPrefix ?? "gicm");
    this.sessions = new SessionManager(authConfig.tokenExpiration ?? 3600);

    // 2. Rate limit layer
    const rateLimitConfig = config?.rateLimit ?? {};
    this.rateLimit = new RateLimiter({
      maxRequests: rateLimitConfig.maxRequests ?? 100,
      windowMs: rateLimitConfig.windowMs ?? 60000, // 1 minute
      algorithm: rateLimitConfig.algorithm ?? "sliding-window",
      keyPrefix: rateLimitConfig.keyPrefix ?? "shield",
    });

    // 3. Secrets layer
    this.secrets = new SecretsManager({
      envPrefix: config?.secrets?.envPrefix,
      cacheTtl: config?.secrets?.cacheTtl,
    });

    // 4. Input guard layer
    this.guard = new InputGuard(config?.inputGuard);

    // 5. Audit layer
    this.audit = new AuditLogger(config?.audit);

    // Wire up audit events
    this.wireAuditEvents();
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  /**
   * Authenticate a request using Bearer token or API key
   */
  authenticate(authHeader: string): AuthResult {
    this.authStats.totalAttempts++;

    if (!authHeader) {
      this.authStats.failed++;
      this.audit.logAuth("unknown", "failure", { reason: "No auth header" });
      return { authenticated: false, error: "No authorization header" };
    }

    // Try JWT Bearer token
    if (authHeader.startsWith("Bearer ") && this.jwt) {
      const token = authHeader.slice(7);
      const payload = this.jwt.verify(token);

      if (payload) {
        this.authStats.successful++;
        this.audit.logAuth(payload.sub, "success", { method: "jwt" });
        return {
          authenticated: true,
          userId: payload.sub,
          scope: payload.scope,
          expiresAt: payload.exp * 1000,
        };
      }

      this.authStats.failed++;
      this.audit.logAuth("unknown", "failure", { reason: "Invalid JWT" });
      return { authenticated: false, error: "Invalid or expired token" };
    }

    // Try API key
    const apiKey = authHeader.startsWith("ApiKey ")
      ? authHeader.slice(7)
      : authHeader;

    const keyInfo = this.apiKeys.validate(apiKey);
    if (keyInfo) {
      this.authStats.successful++;
      this.audit.logAuth(keyInfo.userId, "success", { method: "apikey" });
      return {
        authenticated: true,
        userId: keyInfo.userId,
        scope: keyInfo.scope,
        expiresAt: keyInfo.expiresAt,
      };
    }

    this.authStats.failed++;
    this.audit.logAuth("unknown", "failure", { reason: "Invalid API key" });
    return { authenticated: false, error: "Invalid credentials" };
  }

  /**
   * Check rate limit for a key
   */
  checkRate(key: string, weight = 1): RateLimitResult {
    const result = this.rateLimit.check(key, weight);
    this.audit.logRateLimit(key, "request", !result.allowed);
    return result;
  }

  /**
   * Get a secret
   */
  async getSecret(key: string): Promise<string | null> {
    const value = await this.secrets.get(key);
    this.audit.logSecretAccess("system", key, value !== null);
    return value;
  }

  /**
   * Generate security headers (layer 4)
   */
  generateHeaders(
    preset?: keyof typeof SECURITY_PRESETS
  ): Record<string, string> {
    if (preset && preset in SECURITY_PRESETS) {
      return generateSecurityHeaders(SECURITY_PRESETS[preset]);
    }
    return generateSecurityHeaders(SECURITY_PRESETS.strictApi);
  }

  /**
   * Check input for prompt injection
   */
  checkInput(input: string, actor = "unknown"): InputGuardResult {
    const result = this.guard.checkInput(input);
    this.audit.logInputGuard(actor, !result.safe, result.threats);
    return result;
  }

  /**
   * Get audit log with optional filter
   */
  getAuditLog(filter?: {
    action?: string;
    actor?: string;
    result?: "success" | "failure" | "blocked";
    since?: Date;
  }): AuditEvent[] {
    return this.audit.getEvents(filter);
  }

  /**
   * Get aggregate stats from all layers
   */
  getStats(): ShieldStats {
    return {
      auth: { ...this.authStats },
      rateLimit: this.rateLimit.getStats(),
      secrets: {
        totalAccesses: 0, // Simplified - would need instrumentation
        cacheHits: 0,
        cacheMisses: 0,
      },
      inputGuard: this.guard.getStats(),
      audit: {
        totalEvents: this.audit.getStats().totalEvents,
      },
    };
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private wireAuditEvents(): void {
    // Forward audit events to Shield EventEmitter
    this.audit.on("audit:event", (event: AuditEvent) => {
      this.emit("audit", event);
    });
  }
}
