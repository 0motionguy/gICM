/**
 * HYPER BRAIN API Client
 *
 * DEPRECATED: Brain API is now integrated into the Hub API.
 * This file re-exports from hub.ts for backwards compatibility.
 *
 * Use hubApi.getBrainStats(), hubApi.getBrainRecent(), etc. instead.
 */

import {
  hubApi,
  HUB_URL,
  WS_URL,
  type BrainStats,
  type KnowledgeItem,
  type Pattern,
  type Prediction,
} from "./hub";

// Re-export types for backwards compatibility
export type { BrainStats, KnowledgeItem, Pattern, Prediction };

// Use Hub URL since brain is now integrated
export const BRAIN_URL = HUB_URL;
export const BRAIN_WS_URL = WS_URL;

export interface SearchResult {
  item: KnowledgeItem;
  score: number;
  highlights?: string[];
}

export interface IngestStats {
  lastRun: number;
  itemsIngested: number;
  errors: number;
  bySource: Record<string, { count: number; lastRun: number; errors: number }>;
}

/**
 * Brain API - Now redirects to Hub API
 */
export const brainApi = {
  // Health & Stats
  health: async () => {
    const result = await hubApi.getBrain();
    return result
      ? { status: "ok", online: result.ok, uptime: Date.now() }
      : null;
  },

  stats: async () => {
    const result = await hubApi.getBrainStats();
    if (!result) return null;
    return {
      knowledge: result.knowledge,
      patterns: result.patterns,
      predictions: result.predictions,
      uptime: result.uptime,
      lastIngestion: result.lastIngestion,
    } as BrainStats;
  },

  // Knowledge Retrieval
  recent: async (limit = 20) => {
    const result = await hubApi.getBrainRecent(limit);
    return result?.items || null;
  },

  byTopic: async (
    topic: string,
    limit = 20
  ): Promise<KnowledgeItem[] | null> => {
    const result = await hubApi.getBrainKnowledgeByTopic(topic, limit);
    return result?.items || null;
  },

  byId: async (id: string): Promise<KnowledgeItem | null> => {
    const result = await hubApi.getBrainKnowledgeById(id);
    return result?.item || null;
  },

  similar: async (id: string, limit = 10): Promise<SearchResult[] | null> => {
    const result = await hubApi.getBrainKnowledgeSimilar(id, limit);
    if (!result) return null;
    return result.results.map((r) => ({
      item: r.item,
      score: r.score,
      highlights: [],
    }));
  },

  // Search
  search: async (query: string, limit = 20) => {
    const result = await hubApi.searchBrain(query);
    if (!result) return null;
    return {
      results: result.results.map((item) => ({
        item,
        score: 1,
        highlights: [],
      })),
      total: result.count,
    };
  },

  advancedSearch: async (_params: {
    query: string;
    sources?: string[];
    topics?: string[];
    minImportance?: number;
    limit?: number;
  }) => {
    // TODO: Implement advanced search in Hub API
    const result = await hubApi.searchBrain(_params.query);
    if (!result) return null;
    return {
      results: result.results.map((item) => ({
        item,
        score: 1,
        highlights: [],
      })),
      total: result.count,
    };
  },

  // Patterns
  patterns: async () => {
    const result = await hubApi.getBrainPatterns();
    return result?.patterns || null;
  },

  patternById: async (id: string): Promise<Pattern | null> => {
    const result = await hubApi.getBrainPatternById(id);
    return result?.pattern || null;
  },

  // Predictions
  predictions: async () => {
    const result = await hubApi.getBrainPredictions();
    return result?.predictions || null;
  },

  predictionById: async (id: string): Promise<Prediction | null> => {
    const result = await hubApi.getBrainPredictionById(id);
    return result?.prediction || null;
  },

  generatePredictions: async (
    type: "market" | "technology" | "opportunity" | "risk",
    count = 5
  ) => {
    const result = await hubApi.generateBrainPredictions(type, count);
    return result?.predictions || [];
  },

  // Ingestion
  ingestStats: async (): Promise<IngestStats | null> => {
    const result = await hubApi.getBrainIngestStats();
    if (!result) return null;
    return {
      lastRun: result.lastRun,
      itemsIngested: result.itemsIngested,
      errors: result.errors,
      bySource: result.bySource,
    };
  },

  triggerIngest: async (source?: string) => {
    return hubApi.triggerIngest(source);
  },
};

/**
 * WebSocket Connection - Now uses Hub WebSocket
 *
 * The Hub WebSocket at /ws broadcasts all events including brain events.
 */
export class BrainWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers: Map<string, Set<(data: unknown) => void>> = new Map();

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(BRAIN_WS_URL);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Hub events have category/type structure
          const eventType =
            message.type || `${message.category}.${message.type}`;

          // Filter for brain-related events
          if (
            eventType.includes("brain") ||
            eventType.includes("knowledge") ||
            eventType.includes("pattern") ||
            eventType.includes("prediction")
          ) {
            const handlers = this.handlers.get(eventType);
            if (handlers) {
              handlers.forEach((handler) =>
                handler(message.payload || message)
              );
            }
          }

          // Also emit to "all" handlers
          const allHandlers = this.handlers.get("*");
          if (allHandlers) {
            allHandlers.forEach((handler) => handler(message));
          }
        } catch (e) {
          console.error("[BrainWS] Parse error:", e);
        }
      };

      this.ws.onclose = () => {
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[BrainWS] Error:", error);
      };
    } catch (error) {
      console.error("[BrainWS] Connection error:", error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    setTimeout(() => this.connect(), delay);
  }

  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0;
    this.ws?.close();
    this.ws = null;
  }
}

// Singleton instance
let brainWsInstance: BrainWebSocket | null = null;

export function getBrainWebSocket(): BrainWebSocket {
  if (!brainWsInstance) {
    brainWsInstance = new BrainWebSocket();
  }
  return brainWsInstance;
}
