import type { MemoryEntry, MemoryLayer, MemoryStats } from "./types.js";
import { cosineSimilarity } from "./embeddings.js";

/**
 * SQLite database for persistent memory storage with fallback to in-memory Map.
 * Uses better-sqlite3 with two-layer fallback: import failure and constructor failure.
 */
export class MemoryDatabase {
  private db: any = null;
  private fallbackStore: Map<string, MemoryEntry> = new Map();
  private useFallback = false;

  constructor(dbPath?: string) {
    // Layer 1: Try to import better-sqlite3
    let Database: any;
    try {
      Database = require("better-sqlite3");
    } catch (importError) {
      console.warn(
        "[MemoryDatabase] better-sqlite3 not available, using in-memory fallback"
      );
      this.useFallback = true;
      return;
    }

    // Layer 2: Try to construct database
    try {
      this.db = new Database(dbPath || ":memory:");
      this.initialize();
    } catch (constructError) {
      console.warn(
        "[MemoryDatabase] Failed to create SQLite database, using in-memory fallback:",
        constructError
      );
      this.useFallback = true;
      this.db = null;
    }
  }

  private initialize(): void {
    if (!this.db) return;

    // Enable WAL mode for better concurrency
    this.db.pragma("journal_mode = WAL");

    // Create memories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        layer TEXT NOT NULL,
        type TEXT NOT NULL,
        namespace TEXT NOT NULL,
        embedding BLOB,
        metadata TEXT NOT NULL,
        tokens INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        expires_at INTEGER,
        compressed INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_layer ON memories(layer);
      CREATE INDEX IF NOT EXISTS idx_type ON memories(type);
      CREATE INDEX IF NOT EXISTS idx_namespace ON memories(namespace);
      CREATE INDEX IF NOT EXISTS idx_created_at ON memories(created_at);
      CREATE INDEX IF NOT EXISTS idx_expires_at ON memories(expires_at);
    `);
  }

  insert(entry: MemoryEntry): void {
    if (this.useFallback) {
      this.fallbackStore.set(entry.id, entry);
      return;
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memories (
        id, key, value, layer, type, namespace, embedding, metadata,
        tokens, created_at, updated_at, expires_at, compressed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const embeddingBuffer = entry.embedding
      ? Buffer.from(new Float64Array(entry.embedding).buffer)
      : null;

    stmt.run(
      entry.id,
      entry.key,
      entry.value,
      entry.layer,
      entry.type,
      entry.namespace,
      embeddingBuffer,
      JSON.stringify(entry.metadata),
      entry.tokens,
      entry.createdAt.getTime(),
      entry.updatedAt.getTime(),
      entry.expiresAt?.getTime() || null,
      entry.compressed ? 1 : 0
    );
  }

  getByLayer(layer: MemoryLayer, namespace: string): MemoryEntry[] {
    if (this.useFallback) {
      return Array.from(this.fallbackStore.values()).filter(
        (e) => e.layer === layer && e.namespace === namespace
      );
    }

    const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE layer = ? AND namespace = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(layer, namespace);
    return rows.map((row: any) => this.rowToEntry(row));
  }

  search(
    query: string,
    namespace: string,
    layers?: MemoryLayer[],
    queryEmbedding?: number[]
  ): MemoryEntry[] {
    if (this.useFallback) {
      const filtered = Array.from(this.fallbackStore.values()).filter((e) => {
        const layerMatch = !layers || layers.includes(e.layer);
        const namespaceMatch = e.namespace === namespace;
        const keywordMatch =
          e.key.toLowerCase().includes(query.toLowerCase()) ||
          e.value.toLowerCase().includes(query.toLowerCase());
        return layerMatch && namespaceMatch && keywordMatch;
      });
      return filtered;
    }

    const layerCondition = layers
      ? `AND layer IN (${layers.map(() => "?").join(",")})`
      : "";
    const stmt = this.db.prepare(`
      SELECT * FROM memories
      WHERE namespace = ?
        AND (key LIKE ? OR value LIKE ?)
        ${layerCondition}
      ORDER BY created_at DESC
    `);

    const likePattern = `%${query}%`;
    const params = [namespace, likePattern, likePattern];
    if (layers) {
      params.push(...layers);
    }

    const rows = stmt.all(...params);
    let entries = rows.map((row: any) => this.rowToEntry(row));

    // If we have a query embedding, filter by semantic similarity
    if (queryEmbedding) {
      entries = entries.filter((entry: MemoryEntry) => {
        if (!entry.embedding) return false;
        const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
        return similarity >= 0.3; // Threshold from opus67
      });
    }

    return entries;
  }

  delete(id: string): void {
    if (this.useFallback) {
      this.fallbackStore.delete(id);
      return;
    }

    const stmt = this.db.prepare("DELETE FROM memories WHERE id = ?");
    stmt.run(id);
  }

  deleteByLayer(layer: MemoryLayer, namespace: string): number {
    if (this.useFallback) {
      const toDelete = Array.from(this.fallbackStore.values()).filter(
        (e) => e.layer === layer && e.namespace === namespace
      );
      toDelete.forEach((e) => this.fallbackStore.delete(e.id));
      return toDelete.length;
    }

    const stmt = this.db.prepare(
      "DELETE FROM memories WHERE layer = ? AND namespace = ?"
    );
    const result = stmt.run(layer, namespace);
    return result.changes;
  }

  getStats(namespace: string): MemoryStats {
    const stats: MemoryStats = {
      byLayer: { hot: 0, warm: 0, cold: 0, archive: 0 },
      totalEntries: 0,
      totalTokens: 0,
    };

    if (this.useFallback) {
      const entries = Array.from(this.fallbackStore.values()).filter(
        (e) => e.namespace === namespace
      );
      entries.forEach((e) => {
        stats.byLayer[e.layer]++;
        stats.totalTokens += e.tokens;
      });
      stats.totalEntries = entries.length;

      if (entries.length > 0) {
        const sorted = entries.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        stats.oldestEntry = sorted[0].createdAt;
        stats.newestEntry = sorted[sorted.length - 1].createdAt;
      }

      return stats;
    }

    // Get counts by layer
    const layerStmt = this.db.prepare(`
      SELECT layer, COUNT(*) as count, SUM(tokens) as total_tokens
      FROM memories WHERE namespace = ?
      GROUP BY layer
    `);

    const layerRows = layerStmt.all(namespace);
    layerRows.forEach((row: any) => {
      stats.byLayer[row.layer as MemoryLayer] = row.count;
      stats.totalTokens += row.total_tokens || 0;
      stats.totalEntries += row.count;
    });

    // Get oldest and newest
    const dateStmt = this.db.prepare(`
      SELECT MIN(created_at) as oldest, MAX(created_at) as newest
      FROM memories WHERE namespace = ?
    `);

    const dateRow = dateStmt.get(namespace) as any;
    if (dateRow.oldest) {
      stats.oldestEntry = new Date(dateRow.oldest);
    }
    if (dateRow.newest) {
      stats.newestEntry = new Date(dateRow.newest);
    }

    return stats;
  }

  compact(layer: MemoryLayer, namespace: string, maxEntries: number): number {
    if (this.useFallback) {
      const entries = Array.from(this.fallbackStore.values())
        .filter((e) => e.layer === layer && e.namespace === namespace)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const toDelete = entries.slice(
        0,
        Math.max(0, entries.length - maxEntries)
      );
      toDelete.forEach((e) => this.fallbackStore.delete(e.id));
      return toDelete.length;
    }

    // Keep only the most recent maxEntries
    const stmt = this.db.prepare(`
      DELETE FROM memories
      WHERE layer = ? AND namespace = ? AND id IN (
        SELECT id FROM memories
        WHERE layer = ? AND namespace = ?
        ORDER BY created_at ASC
        LIMIT (
          SELECT MAX(0, COUNT(*) - ?)
          FROM memories
          WHERE layer = ? AND namespace = ?
        )
      )
    `);

    const result = stmt.run(
      layer,
      namespace,
      layer,
      namespace,
      maxEntries,
      layer,
      namespace
    );
    return result.changes;
  }

  private rowToEntry(row: any): MemoryEntry {
    const embedding = row.embedding
      ? Array.from(new Float64Array(row.embedding.buffer))
      : undefined;

    return {
      id: row.id,
      key: row.key,
      value: row.value,
      layer: row.layer as MemoryLayer,
      type: row.type,
      namespace: row.namespace,
      embedding,
      metadata: JSON.parse(row.metadata),
      tokens: row.tokens,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      compressed: row.compressed === 1,
    };
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
