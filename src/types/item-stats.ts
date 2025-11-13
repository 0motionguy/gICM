import { z } from 'zod';

/**
 * Individual item statistics
 */
export const ItemStatSchema = z.object({
  installs: z.number().default(0),
  remixes: z.number().default(0),
  lastUpdated: z.string(),
  installHistory: z.array(z.object({
    timestamp: z.string(),
    sessionId: z.string(),
  })).optional(),
});

export type ItemStat = z.infer<typeof ItemStatSchema>;

/**
 * Complete stats database structure
 */
export const ItemStatsDBSchema = z.object({
  items: z.record(z.string(), ItemStatSchema),
  meta: z.object({
    totalInstalls: z.number().default(0),
    totalRemixes: z.number().default(0),
    lastComputed: z.string(),
  }),
});

export type ItemStatsDB = z.infer<typeof ItemStatsDBSchema>;

/**
 * API request/response types
 */
export interface IncrementStatsRequest {
  itemId: string;
  type: 'install' | 'remix';
  sessionId?: string;
}

export interface GetStatsResponse {
  itemId: string;
  installs: number;
  remixes: number;
  lastUpdated: string;
}
