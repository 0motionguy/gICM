/**
 * OPUS 67 BRAIN API Client
 * Connects to the self-evolving AI runtime
 */

// OPUS 67 BRAIN URL (separate from Hub - runs on port 3102 locally)
export const OPUS67_URL =
  process.env.NEXT_PUBLIC_OPUS67_URL || "http://localhost:3102";
export const OPUS67_WS_URL =
  OPUS67_URL.replace(/^http/, "ws") + "/api/brain/ws";

// Types matching packages/opus67/src/brain/brain-runtime.ts
export type ModeName =
  | "auto"
  | "scan"
  | "build"
  | "review"
  | "architect"
  | "debug";
export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface BrainStatus {
  running: boolean;
  mode: ModeName;
  evolutionActive: boolean;
  totalRequests: number;
  totalCost: number;
  avgLatencyMs: number;
  uptime: number;
  memoryNodes: number;
  evolutionCycles: number;
}

export interface BrainResponse {
  id: string;
  query: string;
  mode: ModeName;
  modeConfidence: number;
  complexityScore: number;
  response: string;
  model: string;
  cost: number;
  latencyMs: number;
  tokensUsed: { input: number; output: number };
  timestamp: string;
}

export interface BrainMetrics {
  brain: BrainStatus;
  evolution: {
    totalCycles: number;
    successfulCycles: number;
    failedCycles: number;
    improvements: number;
    lastCycleAt: string | null;
  };
  benchmark: {
    totalRequests: number;
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
  };
  costs: {
    total: number;
    today: number;
    budget: number | undefined;
  };
}

export interface DeliberationResult {
  question: string;
  finalAnswer: string;
  votes: Array<{
    modelId: string;
    answer: string;
    ranking: number;
  }>;
  totalCost: number;
  latencyMs: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

// Generic fetch helper
async function fetchOpus67<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(`${OPUS67_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`[OPUS67] Fetch error for ${endpoint}:`, error);
    return null;
  }
}

/**
 * OPUS 67 BRAIN API
 */
export const opus67Api = {
  // Health check
  health: async () => {
    return fetchOpus67<{
      status: string;
      timestamp: string;
      brain: BrainStatus;
    }>("/health");
  },

  // Boot screen (for debugging)
  boot: async () => {
    const result = await fetchOpus67<{ screen: string }>("/api/brain/boot");
    return result?.screen || null;
  },

  // Status
  getStatus: async () => {
    const result =
      await fetchOpus67<ApiResponse<BrainStatus>>("/api/brain/status");
    return result?.data || null;
  },

  // Metrics
  getMetrics: async () => {
    const result =
      await fetchOpus67<ApiResponse<BrainMetrics>>("/api/brain/metrics");
    return result?.data || null;
  },

  // History
  getHistory: async (limit = 10) => {
    const result = await fetchOpus67<ApiResponse<BrainResponse[]>>(
      `/api/brain/history?limit=${limit}`
    );
    return result?.data || [];
  },

  // Mode
  getMode: async () => {
    const result =
      await fetchOpus67<ApiResponse<{ mode: ModeName }>>("/api/brain/mode");
    return result?.data?.mode || "auto";
  },

  setMode: async (mode: ModeName) => {
    const result = await fetchOpus67<ApiResponse<{ mode: ModeName }>>(
      "/api/brain/mode",
      {
        method: "POST",
        body: JSON.stringify({ mode }),
      }
    );
    return result?.data?.mode || null;
  },

  // Query
  query: async (
    query: string,
    options?: {
      forceMode?: ModeName;
      forceCouncil?: boolean;
      skipMemory?: boolean;
    }
  ) => {
    const result = await fetchOpus67<ApiResponse<BrainResponse>>(
      "/api/brain/query",
      {
        method: "POST",
        body: JSON.stringify({ query, ...options }),
      }
    );
    return result?.data || null;
  },

  // Evolution
  startEvolution: async () => {
    const result = await fetchOpus67<ApiResponse<{ status: string }>>(
      "/api/brain/evolution",
      {
        method: "POST",
        body: JSON.stringify({ action: "start" }),
      }
    );
    return result?.success || false;
  },

  stopEvolution: async () => {
    const result = await fetchOpus67<ApiResponse<{ status: string }>>(
      "/api/brain/evolution",
      {
        method: "POST",
        body: JSON.stringify({ action: "stop" }),
      }
    );
    return result?.success || false;
  },

  runEvolutionCycle: async () => {
    const result = await fetchOpus67<ApiResponse<{ status: string }>>(
      "/api/brain/evolution",
      {
        method: "POST",
        body: JSON.stringify({ action: "cycle" }),
      }
    );
    return result?.success || false;
  },

  getPendingOpportunities: async () => {
    const result = await fetchOpus67<ApiResponse<{ opportunities: unknown[] }>>(
      "/api/brain/evolution",
      {
        method: "POST",
        body: JSON.stringify({ action: "pending" }),
      }
    );
    return result?.data?.opportunities || [];
  },

  // Deliberation (Council)
  deliberate: async (question: string) => {
    const result = await fetchOpus67<ApiResponse<DeliberationResult>>(
      "/api/brain/deliberate",
      {
        method: "POST",
        body: JSON.stringify({ question }),
      }
    );
    return result?.data || null;
  },
};

/**
 * OPUS 67 WebSocket for real-time updates
 */
export interface Opus67WebSocketMessage {
  type:
    | "status"
    | "response"
    | "mode_change"
    | "evolution_cycle"
    | "error"
    | "pong";
  payload: unknown;
  timestamp: string;
}

export class Opus67WebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced - don't spam if OPUS67 not running
  private handlers: Map<string, Set<(data: unknown) => void>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private silentMode = false; // Stop logging after max attempts

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(OPUS67_WS_URL);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startPing();
        this.emit("connected", {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message: Opus67WebSocketMessage = JSON.parse(event.data);
          this.emit(message.type, message.payload);
          this.emit("*", message);
        } catch (e) {
          console.error("[OPUS67-WS] Parse error:", e);
        }
      };

      this.ws.onclose = () => {
        this.stopPing();
        this.emit("disconnected", {});
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        // Only log on first attempt to avoid console spam
        if (!this.silentMode && this.reconnectAttempts === 0) {
          console.warn(
            "[OPUS67-WS] OPUS67 Brain not available (this is OK if not running locally)"
          );
        }
        this.emit("error", {});
      };
    } catch (error) {
      console.error("[OPUS67-WS] Connection error:", error);
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.silentMode = true;
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    setTimeout(() => this.connect(), delay);
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
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

  send(message: unknown): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  disconnect(): void {
    this.stopPing();
    this.maxReconnectAttempts = 0;
    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let opus67WsInstance: Opus67WebSocket | null = null;

export function getOpus67WebSocket(): Opus67WebSocket {
  if (!opus67WsInstance) {
    opus67WsInstance = new Opus67WebSocket();
  }
  return opus67WsInstance;
}
