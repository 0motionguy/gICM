/**
 * Security Headers for @gicm/shield
 * CSP, CORS, HSTS, and other security headers
 */

import type {
  CspDirectives,
  CorsConfig,
  SecurityHeadersConfig,
} from "./types.js";

// ============================================================================
// CSP Builder
// ============================================================================

export function buildCspString(directives: CspDirectives): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(directives)) {
    if (value === undefined) continue;

    if (typeof value === "boolean") {
      if (value) {
        parts.push(key);
      }
    } else if (typeof value === "string") {
      parts.push(`${key} ${value}`);
    } else if (Array.isArray(value) && value.length > 0) {
      parts.push(`${key} ${value.join(" ")}`);
    }
  }

  return parts.join("; ");
}

export const CSP_PRESETS = {
  strict: {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'"],
    "img-src": ["'self'", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "upgrade-insecure-requests": true,
  } as CspDirectives,

  moderate: {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "https:"],
    "connect-src": ["'self'", "https:"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": true,
  } as CspDirectives,

  relaxed: {
    "default-src": ["'self'", "https:"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "img-src": ["*", "data:", "blob:"],
    "font-src": ["*", "data:"],
    "connect-src": ["*"],
    "object-src": ["'none'"],
  } as CspDirectives,

  api: {
    "default-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'none'"],
  } as CspDirectives,
};

// ============================================================================
// CORS Handler
// ============================================================================

export interface CorsHeaders {
  "Access-Control-Allow-Origin": string;
  "Access-Control-Allow-Methods"?: string;
  "Access-Control-Allow-Headers"?: string;
  "Access-Control-Expose-Headers"?: string;
  "Access-Control-Allow-Credentials"?: string;
  "Access-Control-Max-Age"?: string;
}

export function generateCorsHeaders(
  origin: string | undefined,
  config: CorsConfig,
  isPreflight = false
): CorsHeaders | null {
  // Check if origin is allowed
  let allowedOrigin: string | null = null;

  if (config.allowedOrigins === "*") {
    allowedOrigin = config.credentials ? (origin ?? "*") : "*";
  } else if (origin && config.allowedOrigins.includes(origin)) {
    allowedOrigin = origin;
  } else if (origin && config.allowedOrigins.some((o) => o.endsWith("*"))) {
    // Handle wildcard subdomains (e.g., "*.example.com")
    for (const pattern of config.allowedOrigins) {
      if (pattern.endsWith("*")) {
        const prefix = pattern.slice(0, -1);
        if (origin.startsWith(prefix)) {
          allowedOrigin = origin;
          break;
        }
      }
    }
  }

  if (!allowedOrigin) {
    return null;
  }

  const headers: CorsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
  };

  if (config.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  if (isPreflight) {
    headers["Access-Control-Allow-Methods"] = config.allowedMethods.join(", ");
    headers["Access-Control-Allow-Headers"] = config.allowedHeaders.join(", ");
    headers["Access-Control-Max-Age"] = String(config.maxAge);
  }

  if (config.exposedHeaders && config.exposedHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] = config.exposedHeaders.join(", ");
  }

  return headers;
}

// ============================================================================
// Security Headers Generator
// ============================================================================

export function generateSecurityHeaders(
  config: SecurityHeadersConfig,
  options?: { origin?: string; isPreflight?: boolean }
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (config.csp) {
    const cspString = buildCspString(config.csp);
    if (cspString) {
      const headerName = config.cspReportOnly
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy";
      headers[headerName] = cspString;
    }
  }

  // CORS
  if (config.cors) {
    const corsHeaders = generateCorsHeaders(
      options?.origin,
      config.cors,
      options?.isPreflight
    );
    if (corsHeaders) {
      Object.assign(headers, corsHeaders);
    }
  }

  // HSTS
  if (config.hsts) {
    let hsts = `max-age=${config.hsts.maxAge}`;
    if (config.hsts.includeSubDomains) {
      hsts += "; includeSubDomains";
    }
    if (config.hsts.preload) {
      hsts += "; preload";
    }
    headers["Strict-Transport-Security"] = hsts;
  }

  // X-Content-Type-Options
  if (config.noSniff) {
    headers["X-Content-Type-Options"] = "nosniff";
  }

  // X-Frame-Options
  if (config.frameOptions) {
    headers["X-Frame-Options"] = config.frameOptions;
  }

  // X-XSS-Protection
  if (config.xssProtection) {
    headers["X-XSS-Protection"] = "1; mode=block";
  }

  // Referrer-Policy
  if (config.referrerPolicy) {
    headers["Referrer-Policy"] = config.referrerPolicy;
  }

  // Permissions-Policy
  if (config.permissionsPolicy) {
    const policy = Object.entries(config.permissionsPolicy)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) {
          return `${feature}=()`;
        }
        return `${feature}=(${allowlist.join(" ")})`;
      })
      .join(", ");
    headers["Permissions-Policy"] = policy;
  }

  // Cross-Origin headers
  if (config.coep) {
    headers["Cross-Origin-Embedder-Policy"] = config.coep;
  }
  if (config.coop) {
    headers["Cross-Origin-Opener-Policy"] = config.coop;
  }
  if (config.corp) {
    headers["Cross-Origin-Resource-Policy"] = config.corp;
  }

  return headers;
}

// ============================================================================
// Preset Configurations
// ============================================================================

export const SECURITY_PRESETS = {
  strictApi: {
    csp: CSP_PRESETS.api,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    frameOptions: "DENY",
    xssProtection: true,
    referrerPolicy: "no-referrer",
    coep: "require-corp",
    coop: "same-origin",
    corp: "same-origin",
  } as SecurityHeadersConfig,

  webApp: {
    csp: CSP_PRESETS.moderate,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    frameOptions: "SAMEORIGIN",
    xssProtection: true,
    referrerPolicy: "strict-origin-when-cross-origin",
  } as SecurityHeadersConfig,

  development: {
    csp: CSP_PRESETS.relaxed,
    cspReportOnly: true,
    cors: {
      allowedOrigins: "*",
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["*"],
      credentials: true,
    },
    noSniff: true,
    frameOptions: "SAMEORIGIN",
    xssProtection: true,
    referrerPolicy: "no-referrer-when-downgrade",
  } as SecurityHeadersConfig,

  publicApi: {
    csp: CSP_PRESETS.api,
    cors: {
      allowedOrigins: "*",
      allowedMethods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true,
    frameOptions: "DENY",
    xssProtection: true,
    referrerPolicy: "no-referrer",
  } as SecurityHeadersConfig,
};

// ============================================================================
// Utility Functions
// ============================================================================

export function isOriginAllowed(
  origin: string,
  allowedOrigins: string[] | "*"
): boolean {
  if (allowedOrigins === "*") {
    return true;
  }

  for (const allowed of allowedOrigins) {
    if (allowed === origin) {
      return true;
    }

    // Handle wildcards (e.g., "*.example.com")
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2);
      try {
        const originDomain = new URL(origin).hostname;
        if (originDomain === domain || originDomain.endsWith(`.${domain}`)) {
          return true;
        }
      } catch {
        // Invalid URL, continue
      }
    }
  }

  return false;
}
