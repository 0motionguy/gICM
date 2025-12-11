/**
 * OPUS 67 v4.0 - Cloud Sync Service
 *
 * Syncs learnings across devices via Supabase or custom backend.
 * Supports offline-first with automatic conflict resolution.
 */

import * as fs from "fs";
import * as path from "path";
import {
  getLearningLoop,
  type Interaction,
  type LearnedPattern,
} from "./learning-loop.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SyncConfig {
  endpoint: string;
  apiKey?: string;
  userId: string;
  deviceId: string;
  syncInterval: number; // ms
  offlineQueuePath: string;
}

export interface SyncPayload {
  userId: string;
  deviceId: string;
  timestamp: number;
  interactions: Interaction[];
  patterns: LearnedPattern[];
  version: string;
}

export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  conflicts: number;
  error?: string;
  timestamp: number;
}

export interface SyncStatus {
  lastSync: number | null;
  pendingUploads: number;
  isOnline: boolean;
  syncInProgress: boolean;
}

interface QueuedSync {
  id: string;
  payload: SyncPayload;
  createdAt: number;
  attempts: number;
}

// =============================================================================
// CLOUD SYNC SERVICE
// =============================================================================

export class CloudSync {
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncInProgress: boolean = false;
  private lastSync: number | null = null;
  private offlineQueue: QueuedSync[] = [];
  private initialized: boolean = false;

  constructor(config?: Partial<SyncConfig>) {
    this.config = {
      endpoint: config?.endpoint || process.env.OPUS67_SYNC_ENDPOINT || "",
      apiKey: config?.apiKey || process.env.OPUS67_SYNC_API_KEY,
      userId: config?.userId || this.getOrCreateUserId(),
      deviceId: config?.deviceId || this.getOrCreateDeviceId(),
      syncInterval: config?.syncInterval || 5 * 60 * 1000, // 5 minutes
      offlineQueuePath: config?.offlineQueuePath || this.getDefaultQueuePath(),
    };
  }

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load offline queue
    await this.loadOfflineQueue();

    // Load last sync time
    this.lastSync = this.loadLastSyncTime();

    this.initialized = true;
    console.log(
      `[CloudSync] Initialized. Last sync: ${this.lastSync ? new Date(this.lastSync).toISOString() : "never"}`
    );
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncTimer) return;
    if (!this.config.endpoint) {
      console.log("[CloudSync] No endpoint configured, auto-sync disabled");
      return;
    }

    this.syncTimer = setInterval(async () => {
      await this.sync();
    }, this.config.syncInterval);

    console.log(
      `[CloudSync] Auto-sync started (interval: ${this.config.syncInterval / 1000}s)`
    );
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Perform sync
   */
  async sync(): Promise<SyncResult> {
    await this.initialize();

    if (this.syncInProgress) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        error: "Sync already in progress",
        timestamp: Date.now(),
      };
    }

    if (!this.config.endpoint) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        error: "No sync endpoint configured",
        timestamp: Date.now(),
      };
    }

    this.syncInProgress = true;

    try {
      // 1. Process offline queue first
      await this.processOfflineQueue();

      // 2. Get local learnings
      const learningLoop = getLearningLoop();
      const localData = await learningLoop.exportForSync();

      // 3. Build payload
      const payload: SyncPayload = {
        userId: this.config.userId,
        deviceId: this.config.deviceId,
        timestamp: Date.now(),
        interactions: localData.interactions,
        patterns: localData.patterns,
        version: "1.0.0",
      };

      // 4. Upload to server
      const response = await this.uploadSync(payload);

      if (!response.success) {
        // Queue for later
        await this.queueForLater(payload);
        return {
          success: false,
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          error: response.error,
          timestamp: Date.now(),
        };
      }

      // 5. Download and merge remote data
      const remoteData = await this.downloadSync();
      if (remoteData) {
        await learningLoop.importFromSync(remoteData);
      }

      // 6. Update last sync time
      this.lastSync = Date.now();
      this.saveLastSyncTime();

      return {
        success: true,
        uploaded: payload.interactions.length,
        downloaded: remoteData?.interactions.length || 0,
        conflicts: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        error: errorMessage,
        timestamp: Date.now(),
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Upload sync payload to server
   */
  private async uploadSync(
    payload: SyncPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.config.endpoint}/sync/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  /**
   * Download sync data from server
   */
  private async downloadSync(): Promise<{
    interactions: Interaction[];
    patterns: LearnedPattern[];
  } | null> {
    try {
      const params = new URLSearchParams({
        userId: this.config.userId,
        since: String(this.lastSync || 0),
      });

      const response = await fetch(
        `${this.config.endpoint}/sync/download?${params}`,
        {
          headers: {
            ...(this.config.apiKey && {
              Authorization: `Bearer ${this.config.apiKey}`,
            }),
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as {
        interactions: Interaction[];
        patterns: LearnedPattern[];
      };
    } catch {
      return null;
    }
  }

  /**
   * Queue payload for later sync
   */
  private async queueForLater(payload: SyncPayload): Promise<void> {
    this.offlineQueue.push({
      id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      payload,
      createdAt: Date.now(),
      attempts: 0,
    });

    await this.saveOfflineQueue();
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const maxAttempts = 3;
    const remaining: QueuedSync[] = [];

    for (const item of this.offlineQueue) {
      if (item.attempts >= maxAttempts) {
        console.log(
          `[CloudSync] Dropping queued sync after ${maxAttempts} attempts`
        );
        continue;
      }

      const result = await this.uploadSync(item.payload);
      if (!result.success) {
        item.attempts++;
        remaining.push(item);
      }
    }

    this.offlineQueue = remaining;
    await this.saveOfflineQueue();
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return {
      lastSync: this.lastSync,
      pendingUploads: this.offlineQueue.length,
      isOnline: !!this.config.endpoint,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Force sync now
   */
  async forceSync(): Promise<SyncResult> {
    return this.sync();
  }

  /**
   * Get or create user ID
   */
  private getOrCreateUserId(): string {
    const configPath = this.getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.userId) return config.userId;
      }
    } catch {}

    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.saveConfig({ userId });
    return userId;
  }

  /**
   * Get or create device ID
   */
  private getOrCreateDeviceId(): string {
    const configPath = this.getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.deviceId) return config.deviceId;
      }
    } catch {}

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.saveConfig({ deviceId });
    return deviceId;
  }

  /**
   * Save config
   */
  private saveConfig(updates: Record<string, string>): void {
    const configPath = this.getConfigPath();
    try {
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }

      fs.writeFileSync(
        configPath,
        JSON.stringify({ ...config, ...updates }, null, 2)
      );
    } catch (error) {
      console.error("[CloudSync] Failed to save config:", error);
    }
  }

  /**
   * Load offline queue
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      if (fs.existsSync(this.config.offlineQueuePath)) {
        const data = JSON.parse(
          fs.readFileSync(this.config.offlineQueuePath, "utf-8")
        );
        this.offlineQueue = data.queue || [];
      }
    } catch {
      this.offlineQueue = [];
    }
  }

  /**
   * Save offline queue
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      const dir = path.dirname(this.config.offlineQueuePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.config.offlineQueuePath,
        JSON.stringify(
          {
            queue: this.offlineQueue,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error("[CloudSync] Failed to save offline queue:", error);
    }
  }

  /**
   * Load last sync time
   */
  private loadLastSyncTime(): number | null {
    const configPath = this.getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        return config.lastSync || null;
      }
    } catch {}
    return null;
  }

  /**
   * Save last sync time
   */
  private saveLastSyncTime(): void {
    this.saveConfig({ lastSync: String(this.lastSync) });
  }

  /**
   * Get config path
   */
  private getConfigPath(): string {
    return path.join(
      path.dirname(
        new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")
      ),
      "../../data/sync-config.json"
    );
  }

  /**
   * Get default queue path
   */
  private getDefaultQueuePath(): string {
    return path.join(
      path.dirname(
        new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")
      ),
      "../../data/offline-queue.json"
    );
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: CloudSync | null = null;

export function getCloudSync(): CloudSync {
  if (!instance) {
    instance = new CloudSync();
  }
  return instance;
}

export function resetCloudSync(): void {
  if (instance) {
    instance.stopAutoSync();
  }
  instance = null;
}
