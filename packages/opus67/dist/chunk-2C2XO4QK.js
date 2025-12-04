import { getLearningLoop } from './chunk-KUOFDOUY.js';
import * as fs from 'fs';
import * as path from 'path';

var CloudSync = class {
  config;
  syncTimer = null;
  syncInProgress = false;
  lastSync = null;
  offlineQueue = [];
  initialized = false;
  constructor(config) {
    this.config = {
      endpoint: config?.endpoint || process.env.OPUS67_SYNC_ENDPOINT || "",
      apiKey: config?.apiKey || process.env.OPUS67_SYNC_API_KEY,
      userId: config?.userId || this.getOrCreateUserId(),
      deviceId: config?.deviceId || this.getOrCreateDeviceId(),
      syncInterval: config?.syncInterval || 5 * 60 * 1e3,
      // 5 minutes
      offlineQueuePath: config?.offlineQueuePath || this.getDefaultQueuePath()
    };
  }
  /**
   * Initialize sync service
   */
  async initialize() {
    if (this.initialized) return;
    await this.loadOfflineQueue();
    this.lastSync = this.loadLastSyncTime();
    this.initialized = true;
    console.log(`[CloudSync] Initialized. Last sync: ${this.lastSync ? new Date(this.lastSync).toISOString() : "never"}`);
  }
  /**
   * Start automatic sync
   */
  startAutoSync() {
    if (this.syncTimer) return;
    if (!this.config.endpoint) {
      console.log("[CloudSync] No endpoint configured, auto-sync disabled");
      return;
    }
    this.syncTimer = setInterval(async () => {
      await this.sync();
    }, this.config.syncInterval);
    console.log(`[CloudSync] Auto-sync started (interval: ${this.config.syncInterval / 1e3}s)`);
  }
  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
  /**
   * Perform sync
   */
  async sync() {
    await this.initialize();
    if (this.syncInProgress) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        error: "Sync already in progress",
        timestamp: Date.now()
      };
    }
    if (!this.config.endpoint) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        error: "No sync endpoint configured",
        timestamp: Date.now()
      };
    }
    this.syncInProgress = true;
    try {
      await this.processOfflineQueue();
      const learningLoop = getLearningLoop();
      const localData = await learningLoop.exportForSync();
      const payload = {
        userId: this.config.userId,
        deviceId: this.config.deviceId,
        timestamp: Date.now(),
        interactions: localData.interactions,
        patterns: localData.patterns,
        version: "1.0.0"
      };
      const response = await this.uploadSync(payload);
      if (!response.success) {
        await this.queueForLater(payload);
        return {
          success: false,
          uploaded: 0,
          downloaded: 0,
          conflicts: 0,
          error: response.error,
          timestamp: Date.now()
        };
      }
      const remoteData = await this.downloadSync();
      if (remoteData) {
        await learningLoop.importFromSync(remoteData);
      }
      this.lastSync = Date.now();
      this.saveLastSyncTime();
      return {
        success: true,
        uploaded: payload.interactions.length,
        downloaded: remoteData?.interactions.length || 0,
        conflicts: 0,
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        error: errorMessage,
        timestamp: Date.now()
      };
    } finally {
      this.syncInProgress = false;
    }
  }
  /**
   * Upload sync payload to server
   */
  async uploadSync(payload) {
    try {
      const response = await fetch(`${this.config.endpoint}/sync/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.apiKey && { "Authorization": `Bearer ${this.config.apiKey}` }
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error"
      };
    }
  }
  /**
   * Download sync data from server
   */
  async downloadSync() {
    try {
      const params = new URLSearchParams({
        userId: this.config.userId,
        since: String(this.lastSync || 0)
      });
      const response = await fetch(`${this.config.endpoint}/sync/download?${params}`, {
        headers: {
          ...this.config.apiKey && { "Authorization": `Bearer ${this.config.apiKey}` }
        }
      });
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  }
  /**
   * Queue payload for later sync
   */
  async queueForLater(payload) {
    this.offlineQueue.push({
      id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      payload,
      createdAt: Date.now(),
      attempts: 0
    });
    await this.saveOfflineQueue();
  }
  /**
   * Process offline queue
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    const maxAttempts = 3;
    const remaining = [];
    for (const item of this.offlineQueue) {
      if (item.attempts >= maxAttempts) {
        console.log(`[CloudSync] Dropping queued sync after ${maxAttempts} attempts`);
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
  getStatus() {
    return {
      lastSync: this.lastSync,
      pendingUploads: this.offlineQueue.length,
      isOnline: !!this.config.endpoint,
      syncInProgress: this.syncInProgress
    };
  }
  /**
   * Force sync now
   */
  async forceSync() {
    return this.sync();
  }
  /**
   * Get or create user ID
   */
  getOrCreateUserId() {
    const configPath = this.getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.userId) return config.userId;
      }
    } catch {
    }
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.saveConfig({ userId });
    return userId;
  }
  /**
   * Get or create device ID
   */
  getOrCreateDeviceId() {
    const configPath = this.getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.deviceId) return config.deviceId;
      }
    } catch {
    }
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.saveConfig({ deviceId });
    return deviceId;
  }
  /**
   * Save config
   */
  saveConfig(updates) {
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
      fs.writeFileSync(configPath, JSON.stringify({ ...config, ...updates }, null, 2));
    } catch (error) {
      console.error("[CloudSync] Failed to save config:", error);
    }
  }
  /**
   * Load offline queue
   */
  async loadOfflineQueue() {
    try {
      if (fs.existsSync(this.config.offlineQueuePath)) {
        const data = JSON.parse(fs.readFileSync(this.config.offlineQueuePath, "utf-8"));
        this.offlineQueue = data.queue || [];
      }
    } catch {
      this.offlineQueue = [];
    }
  }
  /**
   * Save offline queue
   */
  async saveOfflineQueue() {
    try {
      const dir = path.dirname(this.config.offlineQueuePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.config.offlineQueuePath, JSON.stringify({
        queue: this.offlineQueue
      }, null, 2));
    } catch (error) {
      console.error("[CloudSync] Failed to save offline queue:", error);
    }
  }
  /**
   * Load last sync time
   */
  loadLastSyncTime() {
    const configPath = this.getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        return config.lastSync || null;
      }
    } catch {
    }
    return null;
  }
  /**
   * Save last sync time
   */
  saveLastSyncTime() {
    this.saveConfig({ lastSync: String(this.lastSync) });
  }
  /**
   * Get config path
   */
  getConfigPath() {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../data/sync-config.json"
    );
  }
  /**
   * Get default queue path
   */
  getDefaultQueuePath() {
    return path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
      "../../data/offline-queue.json"
    );
  }
};
var instance = null;
function getCloudSync() {
  if (!instance) {
    instance = new CloudSync();
  }
  return instance;
}
function resetCloudSync() {
  if (instance) {
    instance.stopAutoSync();
  }
  instance = null;
}

export { CloudSync, getCloudSync, resetCloudSync };
