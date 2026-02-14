import { z } from "zod";

export type MemoryLayer = "hot" | "warm" | "cold" | "archive";
export type MemoryType =
  | "episode"
  | "fact"
  | "improvement"
  | "goal"
  | "context";

export interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  layer: MemoryLayer;
  type: MemoryType;
  namespace: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  compressed: boolean;
}

export const MemoryConfigSchema = z.object({
  hot: z
    .object({
      maxEntries: z.number().int().positive().default(50),
      maxTokens: z.number().int().positive().default(8000),
    })
    .default({ maxEntries: 50, maxTokens: 8000 }),
  warm: z
    .object({
      maxAgeDays: z.number().int().positive().default(7),
      maxEntries: z.number().int().positive().default(500),
    })
    .default({ maxAgeDays: 7, maxEntries: 500 }),
  cold: z
    .object({
      maxAgeDays: z.number().int().positive().default(90),
      maxEntries: z.number().int().positive().default(2000),
    })
    .default({ maxAgeDays: 90, maxEntries: 2000 }),
  archive: z
    .object({
      maxEntries: z.number().int().positive().default(10000),
    })
    .default({ maxEntries: 10000 }),
  embeddingDims: z.number().int().positive().default(64),
  namespace: z.string().default("default"),
  dbPath: z.string().optional(),
});

export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;

export interface SearchResult {
  entry: MemoryEntry;
  score: number;
  matchType: "semantic" | "keyword" | "exact";
}

export interface FlushDecision {
  entriesToFlush: MemoryEntry[];
  targetLayer: MemoryLayer;
  reason: string;
}

export interface MemoryStats {
  byLayer: Record<MemoryLayer, number>;
  totalEntries: number;
  totalTokens: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

export type MemoryEvents = {
  "memory:added": [MemoryEntry];
  "memory:flushed": [FlushDecision];
  "memory:searched": [string, SearchResult[]];
  "memory:compacted": [MemoryLayer, number];
};
