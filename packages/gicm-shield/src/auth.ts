/**
 * Authentication for @gicm/shield
 * JWT, API keys, sessions, password hashing
 */

import {
  createHash,
  randomBytes,
  createHmac,
  timingSafeEqual,
  pbkdf2,
} from "crypto";
import type {
  AuthConfig,
  TokenPayload,
  AuthResult,
  Session,
  ApiKeyInfo,
} from "./types.js";

// ============================================================================
// Base64url encoding/decoding
// ============================================================================

export function base64urlEncode(data: string | Buffer): string {
  const base64 = Buffer.from(data).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

// ============================================================================
// JWT Manager
// ============================================================================

export class JwtManager {
  private readonly secret: string;
  private readonly algorithm = "HS256";

  constructor(secret: string) {
    if (secret.length < 32) {
      throw new Error("JWT secret must be at least 32 characters");
    }
    this.secret = secret;
  }

  sign(payload: TokenPayload): string {
    const header = { alg: this.algorithm, typ: "JWT" };
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));

    const signature = this.createSignature(
      `${encodedHeader}.${encodedPayload}`
    );

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token: string): TokenPayload | null {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = this.createSignature(
      `${encodedHeader}.${encodedPayload}`
    );

    // Use timing-safe comparison
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    try {
      const payload = JSON.parse(
        base64urlDecode(encodedPayload)
      ) as TokenPayload;

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  decode(token: string): TokenPayload | null {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    try {
      return JSON.parse(base64urlDecode(parts[1])) as TokenPayload;
    } catch {
      return null;
    }
  }

  private createSignature(data: string): string {
    const hmac = createHmac("sha256", this.secret);
    hmac.update(data);
    return base64urlEncode(hmac.digest());
  }
}

// ============================================================================
// API Key Manager
// ============================================================================

export class ApiKeyManager {
  private keys: Map<string, ApiKeyInfo> = new Map();
  private readonly prefix: string;

  constructor(prefix = "gicm") {
    this.prefix = prefix;
  }

  generate(options: {
    userId: string;
    name: string;
    scope?: string[];
    expiresIn?: number;
    metadata?: Record<string, unknown>;
  }): ApiKeyInfo {
    const id = randomBytes(8).toString("hex");
    const keyBytes = randomBytes(24);
    const key = `${this.prefix}_${keyBytes.toString("hex")}`;
    const hashedKey = this.hashKey(key);

    const now = Date.now();
    const info: ApiKeyInfo = {
      id,
      key, // Only returned on creation
      hashedKey,
      userId: options.userId,
      name: options.name,
      scope: options.scope ?? ["read"],
      createdAt: now,
      expiresAt: options.expiresIn ? now + options.expiresIn * 1000 : undefined,
      metadata: options.metadata,
    };

    this.keys.set(hashedKey, info);
    return info;
  }

  validate(key: string): ApiKeyInfo | null {
    if (!key.startsWith(`${this.prefix}_`)) {
      return null;
    }

    const hashedKey = this.hashKey(key);
    const info = this.keys.get(hashedKey);

    if (!info) {
      return null;
    }

    // Check expiration
    if (info.expiresAt && info.expiresAt < Date.now()) {
      return null;
    }

    // Update last used
    info.lastUsed = Date.now();

    // Return without the actual key
    return { ...info, key: "" };
  }

  revoke(id: string): boolean {
    for (const [hash, info] of this.keys) {
      if (info.id === id) {
        this.keys.delete(hash);
        return true;
      }
    }
    return false;
  }

  listForUser(userId: string): Omit<ApiKeyInfo, "key" | "hashedKey">[] {
    const result: Omit<ApiKeyInfo, "key" | "hashedKey">[] = [];
    for (const info of this.keys.values()) {
      if (info.userId === userId) {
        const { key: _, hashedKey: __, ...rest } = info;
        result.push(rest);
      }
    }
    return result;
  }

  register(info: Omit<ApiKeyInfo, "key">): void {
    this.keys.set(info.hashedKey, { ...info, key: "" });
  }

  export(): Omit<ApiKeyInfo, "key">[] {
    return Array.from(this.keys.values()).map(({ key: _, ...rest }) => rest);
  }

  private hashKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
  }
}

// ============================================================================
// Session Manager
// ============================================================================

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly defaultTtl: number;

  constructor(defaultTtlSeconds = 3600) {
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  create(
    userId: string,
    ttl?: number,
    metadata?: Record<string, unknown>
  ): Session {
    const id = randomBytes(32).toString("hex");
    const now = Date.now();
    const expiresAt = now + (ttl ?? this.defaultTtl);

    const session: Session = {
      id,
      userId,
      createdAt: now,
      expiresAt,
      lastActive: now,
      metadata,
    };

    this.sessions.set(id, session);
    return session;
  }

  get(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check expiration
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last active
    session.lastActive = Date.now();
    return session;
  }

  refresh(sessionId: string, additionalMs?: number): Session | null {
    const session = this.get(sessionId);
    if (!session) {
      return null;
    }

    session.expiresAt = Date.now() + (additionalMs ?? this.defaultTtl);
    return session;
  }

  destroy(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  destroyAllForUser(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  listForUser(userId: string): Session[] {
    const now = Date.now();
    const result: Session[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.expiresAt > now) {
        result.push(session);
      }
    }
    return result;
  }

  cleanup(): number {
    const now = Date.now();
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  get activeCount(): number {
    const now = Date.now();
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.expiresAt > now) {
        count++;
      }
    }
    return count;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function hasScope(
  userScope: string[],
  required: string | string[]
): boolean {
  const requiredScopes = Array.isArray(required) ? required : [required];

  // Wildcard check
  if (userScope.includes("*") || userScope.includes("admin")) {
    return true;
  }

  return requiredScopes.every((scope) => {
    // Direct match
    if (userScope.includes(scope)) {
      return true;
    }

    // Hierarchical check (e.g., "read:users" matches "read:*")
    const [action, resource] = scope.split(":");
    if (resource && userScope.includes(`${action}:*`)) {
      return true;
    }

    return false;
  });
}

export function parseAuthHeader(
  header: string
): { type: "bearer" | "apikey" | "basic" | "unknown"; value: string } | null {
  if (!header) {
    return null;
  }

  const lower = header.toLowerCase();

  if (lower.startsWith("bearer ")) {
    return { type: "bearer", value: header.slice(7) };
  }

  if (lower.startsWith("apikey ")) {
    return { type: "apikey", value: header.slice(7) };
  }

  if (lower.startsWith("basic ")) {
    return { type: "basic", value: header.slice(6) };
  }

  // Might be a raw API key
  if (header.includes("_")) {
    return { type: "apikey", value: header };
  }

  return { type: "unknown", value: header };
}

export async function hashPassword(
  password: string,
  salt?: string
): Promise<{ hash: string; salt: string }> {
  const useSalt = salt ?? randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    pbkdf2(password, useSalt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      else
        resolve({
          hash: derivedKey.toString("hex"),
          salt: useSalt,
        });
    });
  });
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  const result = await hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(result.hash), Buffer.from(hash));
}
