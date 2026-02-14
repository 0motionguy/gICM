import { z } from "zod";

export type CacheLayer = "L1" | "L2" | "L3";

export const CacheConfigSchema = z.object({
  l1: z
    .object({
      enabled: z.boolean().default(true),
      ttlMinutes: z.number().min(1).max(60).default(5),
      maxTokens: z.number().min(0).default(100_000),
    })
    .default({}),
  l2: z
    .object({
      enabled: z.boolean().default(true),
      ttlMinutes: z.number().min(1).max(1440).default(60),
      maxEntries: z.number().min(0).default(1000),
      similarityThreshold: z.number().min(0).max(1).default(0.85),
    })
    .default({}),
  l3: z
    .object({
      enabled: z.boolean().default(true),
      defaultTtlMinutes: z.number().min(1).max(10080).default(30),
      maxEntries: z.number().min(0).default(5000),
    })
    .default({}),
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;

export interface CacheEntry {
  key: string;
  value: string;
  layer: CacheLayer;
  hash: string;
  tokens: number;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
  metadata: Record<string, unknown>;
}

export interface L1PrefixBlock {
  id: string;
  content: string;
  tokens: number;
  type: "system" | "skill" | "tool" | "context";
  cacheControl: { type: "ephemeral" };
}

export interface L2ResponseEntry {
  queryHash: string;
  queryEmbedding: number[];
  queryText: string;
  response: string;
  model: string;
  tokens: number;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
}

export interface L3ToolEntry {
  toolName: string;
  inputHash: string;
  result: string;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
  ttlMinutes: number;
}

export interface CacheStats {
  l1: { entries: number; tokens: number; hitRate: number };
  l2: { entries: number; hits: number; misses: number; hitRate: number };
  l3: { entries: number; hits: number; misses: number; hitRate: number };
  totalSaved: number;
}

export interface CacheEvents {
  "cache:hit": (layer: CacheLayer, key: string) => void;
  "cache:miss": (layer: CacheLayer, key: string) => void;
  "cache:evict": (layer: CacheLayer, key: string) => void;
  "cache:save": (dollars: number) => void;
}
