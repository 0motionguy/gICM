import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { ItemStatsDB, ItemStat } from '@/types/item-stats';

const METRICS_DIR = join(process.cwd(), '.metrics');
const ITEM_STATS_FILE = join(METRICS_DIR, 'item-stats.json');

// In-memory cache for performance
let statsCache: ItemStatsDB | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Ensure metrics directory exists
 */
function ensureMetricsDir() {
  if (!existsSync(METRICS_DIR)) {
    mkdirSync(METRICS_DIR, { recursive: true });
  }
}

/**
 * Initialize empty stats database
 */
function initializeStatsDB(): ItemStatsDB {
  return {
    items: {},
    meta: {
      totalInstalls: 0,
      totalRemixes: 0,
      lastComputed: new Date().toISOString(),
    },
  };
}

/**
 * Read item stats from file with caching
 */
export function readItemStats(): ItemStatsDB {
  const now = Date.now();

  // Return cached data if still valid
  if (statsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return statsCache;
  }

  try {
    ensureMetricsDir();

    if (!existsSync(ITEM_STATS_FILE)) {
      const emptyDB = initializeStatsDB();
      writeFileSync(ITEM_STATS_FILE, JSON.stringify(emptyDB, null, 2));
      statsCache = emptyDB;
      cacheTimestamp = now;
      return emptyDB;
    }

    const data = readFileSync(ITEM_STATS_FILE, 'utf-8');
    const stats = JSON.parse(data) as ItemStatsDB;

    // Update cache
    statsCache = stats;
    cacheTimestamp = now;

    return stats;
  } catch (error) {
    console.error('Failed to read item stats:', error);
    return initializeStatsDB();
  }
}

/**
 * Write item stats to file and invalidate cache
 */
export function writeItemStats(stats: ItemStatsDB): void {
  try {
    ensureMetricsDir();

    // Update meta timestamp
    stats.meta.lastComputed = new Date().toISOString();

    writeFileSync(ITEM_STATS_FILE, JSON.stringify(stats, null, 2));

    // Invalidate cache
    statsCache = stats;
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('Failed to write item stats:', error);
    throw error;
  }
}

/**
 * Get stats for a specific item
 */
export function getItemStat(itemId: string): ItemStat | null {
  const stats = readItemStats();
  return stats.items[itemId] || null;
}

/**
 * Get stats for multiple items
 */
export function getItemStats(itemIds: string[]): Record<string, ItemStat> {
  const stats = readItemStats();
  const result: Record<string, ItemStat> = {};

  itemIds.forEach(id => {
    if (stats.items[id]) {
      result[id] = stats.items[id];
    }
  });

  return result;
}

/**
 * Increment install count for an item
 */
export function incrementItemInstalls(itemId: string, sessionId?: string): void {
  try {
    const stats = readItemStats();

    if (!stats.items[itemId]) {
      stats.items[itemId] = {
        installs: 0,
        remixes: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    stats.items[itemId].installs += 1;
    stats.items[itemId].lastUpdated = new Date().toISOString();

    // Optionally track install history
    if (sessionId) {
      if (!stats.items[itemId].installHistory) {
        stats.items[itemId].installHistory = [];
      }
      stats.items[itemId].installHistory!.push({
        timestamp: new Date().toISOString(),
        sessionId,
      });

      // Keep only last 100 install events per item
      if (stats.items[itemId].installHistory!.length > 100) {
        stats.items[itemId].installHistory = stats.items[itemId].installHistory!.slice(-100);
      }
    }

    // Update meta totals
    stats.meta.totalInstalls += 1;

    writeItemStats(stats);
  } catch (error) {
    console.error('Failed to increment installs:', error);
  }
}

/**
 * Increment remix count for an item
 */
export function incrementItemRemixes(itemId: string): void {
  try {
    const stats = readItemStats();

    if (!stats.items[itemId]) {
      stats.items[itemId] = {
        installs: 0,
        remixes: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    stats.items[itemId].remixes += 1;
    stats.items[itemId].lastUpdated = new Date().toISOString();

    // Update meta totals
    stats.meta.totalRemixes += 1;

    writeItemStats(stats);
  } catch (error) {
    console.error('Failed to increment remixes:', error);
  }
}

/**
 * Batch increment remixes for multiple items (for stack forks)
 */
export function incrementBatchRemixes(itemIds: string[]): void {
  try {
    const stats = readItemStats();
    const timestamp = new Date().toISOString();

    itemIds.forEach(itemId => {
      if (!stats.items[itemId]) {
        stats.items[itemId] = {
          installs: 0,
          remixes: 0,
          lastUpdated: timestamp,
        };
      }

      stats.items[itemId].remixes += 1;
      stats.items[itemId].lastUpdated = timestamp;
      stats.meta.totalRemixes += 1;
    });

    writeItemStats(stats);
  } catch (error) {
    console.error('Failed to batch increment remixes:', error);
  }
}

/**
 * Set stats for an item (used during initialization)
 */
export function setItemStats(itemId: string, installs: number, remixes: number): void {
  try {
    const stats = readItemStats();

    stats.items[itemId] = {
      installs,
      remixes,
      lastUpdated: new Date().toISOString(),
    };

    writeItemStats(stats);
  } catch (error) {
    console.error('Failed to set item stats:', error);
  }
}

/**
 * Batch set stats for multiple items (used during initialization)
 */
export function batchSetItemStats(items: Record<string, { installs: number; remixes: number }>): void {
  try {
    const stats = readItemStats();
    const timestamp = new Date().toISOString();

    let totalInstalls = 0;
    let totalRemixes = 0;

    Object.entries(items).forEach(([itemId, { installs, remixes }]) => {
      stats.items[itemId] = {
        installs,
        remixes,
        lastUpdated: timestamp,
      };
      totalInstalls += installs;
      totalRemixes += remixes;
    });

    stats.meta.totalInstalls = totalInstalls;
    stats.meta.totalRemixes = totalRemixes;

    writeItemStats(stats);
  } catch (error) {
    console.error('Failed to batch set item stats:', error);
  }
}

/**
 * Clear cache (for testing)
 */
export function clearStatsCache(): void {
  statsCache = null;
  cacheTimestamp = 0;
}
