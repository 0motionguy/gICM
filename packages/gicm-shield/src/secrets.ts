/**
 * Secrets Manager for @gicm/shield
 * Env, memory, and composite backends with AES-256 encryption
 */

import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";
import type { SecretMetadata, SecretBackend } from "./types.js";

// ============================================================================
// Environment Backend
// ============================================================================

export class EnvSecretBackend implements SecretBackend {
  name = "env";
  private prefix: string;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  private getEnvKey(key: string): string {
    const normalized = key.toUpperCase().replace(/[.-]/g, "_");
    return this.prefix ? `${this.prefix}_${normalized}` : normalized;
  }

  async get(key: string): Promise<string | null> {
    return process.env[this.getEnvKey(key)] ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    process.env[this.getEnvKey(key)] = value;
  }

  async delete(key: string): Promise<boolean> {
    const envKey = this.getEnvKey(key);
    if (process.env[envKey]) {
      delete process.env[envKey];
      return true;
    }
    return false;
  }

  async list(): Promise<string[]> {
    const keys: string[] = [];
    const prefixLen = this.prefix ? this.prefix.length + 1 : 0;

    for (const key of Object.keys(process.env)) {
      if (!this.prefix || key.startsWith(`${this.prefix}_`)) {
        keys.push(key.slice(prefixLen).toLowerCase().replace(/_/g, "-"));
      }
    }
    return keys;
  }

  async exists(key: string): Promise<boolean> {
    return this.getEnvKey(key) in process.env;
  }
}

// ============================================================================
// Memory Backend (with AES-256 encryption)
// ============================================================================

export class MemorySecretBackend implements SecretBackend {
  name = "memory";
  private secrets: Map<
    string,
    { encrypted: Buffer; iv: Buffer; metadata: SecretMetadata }
  > = new Map();
  private key: Buffer;

  constructor(encryptionKey?: string) {
    // Use provided key or generate one
    this.key = encryptionKey
      ? Buffer.from(encryptionKey, "hex")
      : randomBytes(32);

    if (this.key.length !== 32) {
      throw new Error("Encryption key must be 32 bytes (64 hex characters)");
    }
  }

  private encrypt(value: string): { encrypted: Buffer; iv: Buffer } {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);
    return { encrypted, iv };
  }

  private decrypt(encrypted: Buffer, iv: Buffer): string {
    const decipher = createDecipheriv("aes-256-cbc", this.key, iv);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  }

  async get(key: string): Promise<string | null> {
    const secret = this.secrets.get(key);
    if (!secret) return null;

    // Check expiration
    if (secret.metadata.expiresAt && Date.now() > secret.metadata.expiresAt) {
      this.secrets.delete(key);
      return null;
    }

    return this.decrypt(secret.encrypted, secret.iv);
  }

  async set(
    key: string,
    value: string,
    metadata?: Partial<SecretMetadata>
  ): Promise<void> {
    const existing = this.secrets.get(key);
    const { encrypted, iv } = this.encrypt(value);

    const now = Date.now();
    const fullMetadata: SecretMetadata = {
      name: key,
      createdAt: existing?.metadata.createdAt ?? now,
      updatedAt: now,
      version: (existing?.metadata.version ?? 0) + 1,
      ...metadata,
    };

    this.secrets.set(key, { encrypted, iv, metadata: fullMetadata });
  }

  async delete(key: string): Promise<boolean> {
    return this.secrets.delete(key);
  }

  async list(): Promise<string[]> {
    return Array.from(this.secrets.keys());
  }

  async exists(key: string): Promise<boolean> {
    return this.secrets.has(key);
  }

  getMetadata(key: string): SecretMetadata | null {
    return this.secrets.get(key)?.metadata ?? null;
  }
}

// ============================================================================
// Composite Backend (fallback chain)
// ============================================================================

export class CompositeSecretBackend implements SecretBackend {
  name = "composite";
  private backends: SecretBackend[];

  constructor(backends: SecretBackend[]) {
    this.backends = backends;
  }

  async get(key: string): Promise<string | null> {
    for (const backend of this.backends) {
      const value = await backend.get(key);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }

  async set(
    key: string,
    value: string,
    metadata?: Partial<SecretMetadata>
  ): Promise<void> {
    // Set in the first backend
    if (this.backends.length > 0) {
      await this.backends[0].set(key, value, metadata);
    }
  }

  async delete(key: string): Promise<boolean> {
    let deleted = false;
    for (const backend of this.backends) {
      if (await backend.delete(key)) {
        deleted = true;
      }
    }
    return deleted;
  }

  async list(): Promise<string[]> {
    const keys = new Set<string>();
    for (const backend of this.backends) {
      for (const key of await backend.list()) {
        keys.add(key);
      }
    }
    return Array.from(keys);
  }

  async exists(key: string): Promise<boolean> {
    for (const backend of this.backends) {
      if (await backend.exists(key)) {
        return true;
      }
    }
    return false;
  }
}

// ============================================================================
// SecretsManager
// ============================================================================

export interface SecretsManagerConfig {
  backend?: SecretBackend;
  encryptionKey?: string;
  cacheTtl?: number;
  envPrefix?: string;
  onAccess?: (key: string) => void;
  onMissing?: (key: string) => void;
}

export class SecretsManager {
  private backend: SecretBackend;
  private envBackend: EnvSecretBackend;
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private readonly config: Required<
    Omit<SecretsManagerConfig, "backend" | "onAccess" | "onMissing">
  > & {
    onAccess?: (key: string) => void;
    onMissing?: (key: string) => void;
  };

  constructor(config?: SecretsManagerConfig) {
    this.config = {
      encryptionKey: config?.encryptionKey ?? randomBytes(32).toString("hex"),
      cacheTtl: config?.cacheTtl ?? 5 * 60 * 1000, // 5 minutes
      envPrefix: config?.envPrefix ?? "",
      onAccess: config?.onAccess,
      onMissing: config?.onMissing,
    };

    this.envBackend = new EnvSecretBackend(this.config.envPrefix);
    this.backend =
      config?.backend ?? new MemorySecretBackend(this.config.encryptionKey);
  }

  async get(key: string): Promise<string | null> {
    this.config.onAccess?.(key);

    // Check cache
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    // Try environment first
    const envValue = await this.envBackend.get(key);
    if (envValue !== null) {
      this.cacheValue(key, envValue);
      return envValue;
    }

    // Try backend
    const backendValue = await this.backend.get(key);
    if (backendValue !== null) {
      this.cacheValue(key, backendValue);
      return backendValue;
    }

    this.config.onMissing?.(key);
    return null;
  }

  async require(key: string): Promise<string> {
    const value = await this.get(key);
    if (value === null) {
      throw new Error(`Required secret not found: ${key}`);
    }
    return value;
  }

  async getOrDefault(key: string, defaultValue: string): Promise<string> {
    const value = await this.get(key);
    return value ?? defaultValue;
  }

  async getMany(keys: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    await Promise.all(
      keys.map(async (key) => {
        results.set(key, await this.get(key));
      })
    );
    return results;
  }

  async set(
    key: string,
    value: string,
    metadata?: Partial<SecretMetadata>
  ): Promise<void> {
    await this.backend.set(key, value, metadata);
    this.cacheValue(key, value);
  }

  async delete(key: string): Promise<boolean> {
    this.cache.delete(key);
    return this.backend.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return (
      (await this.envBackend.exists(key)) || (await this.backend.exists(key))
    );
  }

  async list(): Promise<string[]> {
    const envKeys = await this.envBackend.list();
    const backendKeys = await this.backend.list();
    return [...new Set([...envKeys, ...backendKeys])];
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  private cacheValue(key: string, value: string): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.config.cacheTtl,
    });
  }
}

// ============================================================================
// Utility functions
// ============================================================================

export function generateSecretKey(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function generateApiKey(prefix = "gicm"): string {
  const random = randomBytes(24).toString("base64url");
  return `${prefix}_${random}`;
}

export function isValidApiKey(key: string, prefix = "gicm"): boolean {
  const pattern = new RegExp(`^${prefix}_[A-Za-z0-9_-]{32}$`);
  return pattern.test(key);
}

export function redactSecrets<T extends Record<string, unknown>>(
  obj: T,
  sensitiveKeys: string[] = [
    "password",
    "secret",
    "key",
    "token",
    "api_key",
    "apiKey",
    "private",
    "credential",
  ]
): T {
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    const lowerKey = key.toLowerCase();
    if (
      sensitiveKeys.some((sensitive) =>
        lowerKey.includes(sensitive.toLowerCase())
      )
    ) {
      (result as Record<string, unknown>)[key] = "[REDACTED]";
    } else if (typeof result[key] === "object" && result[key] !== null) {
      (result as Record<string, unknown>)[key] = redactSecrets(
        result[key] as Record<string, unknown>,
        sensitiveKeys
      );
    }
  }

  return result;
}
