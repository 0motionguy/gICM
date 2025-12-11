/**
 * OPUS 67 BRAIN API
 * REST/WebSocket API for dashboard integration
 */

import { EventEmitter } from "eventemitter3";
import {
  BrainRuntime,
  createBrainRuntime,
  type BrainRequest,
  type BrainResponse,
  type BrainStatus,
} from "./brain-runtime.js";
import type { ModeName } from "../mode-selector.js";
import type { ImprovementOpportunity } from "../evolution/index.js";

// API Types
export interface ApiRequest {
  method:
    | "query"
    | "status"
    | "metrics"
    | "history"
    | "mode"
    | "evolution"
    | "deliberate";
  payload?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface WebSocketMessage {
  type: "status" | "response" | "mode_change" | "evolution_cycle" | "error";
  payload: unknown;
  timestamp: Date;
}

interface ApiEvents {
  request: (req: ApiRequest) => void;
  response: (res: ApiResponse) => void;
  "ws:message": (msg: WebSocketMessage) => void;
  error: (error: Error) => void;
}

/**
 * BrainAPI - HTTP/WebSocket API for BRAIN runtime
 */
export class BrainAPI extends EventEmitter<ApiEvents> {
  private brain: BrainRuntime;
  private subscribers: Set<(msg: WebSocketMessage) => void> = new Set();

  constructor(brainInstance?: BrainRuntime) {
    super();
    this.brain = brainInstance ?? createBrainRuntime();

    // Forward BRAIN events to WebSocket subscribers
    this.setupEventForwarding();
  }

  /**
   * Setup event forwarding to WebSocket
   */
  private setupEventForwarding(): void {
    this.brain.on("request:complete", (response) => {
      this.broadcast({
        type: "response",
        payload: response,
        timestamp: new Date(),
      });
    });

    this.brain.on("mode:switched", (from, to) => {
      this.broadcast({
        type: "mode_change",
        payload: { from, to },
        timestamp: new Date(),
      });
    });

    this.brain.on("evolution:cycle", (cycleId) => {
      this.broadcast({
        type: "evolution_cycle",
        payload: { cycleId },
        timestamp: new Date(),
      });
    });

    this.brain.on("error", (error) => {
      this.broadcast({
        type: "error",
        payload: { message: error.message },
        timestamp: new Date(),
      });
    });
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `api_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /**
   * Subscribe to WebSocket messages
   */
  subscribe(callback: (msg: WebSocketMessage) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Broadcast message to all subscribers
   */
  private broadcast(msg: WebSocketMessage): void {
    this.emit("ws:message", msg);
    for (const callback of this.subscribers) {
      callback(msg);
    }
  }

  /**
   * Handle API request
   */
  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    const requestId = this.generateRequestId();
    this.emit("request", request);

    try {
      let data: unknown;

      switch (request.method) {
        case "query":
          data = await this.handleQuery(
            request.payload as unknown as BrainRequest
          );
          break;

        case "status":
          data = await this.handleStatus();
          break;

        case "metrics":
          data = await this.handleMetrics();
          break;

        case "history":
          data = this.handleHistory(request.payload as { limit?: number });
          break;

        case "mode":
          data = await this.handleMode(
            request.payload as { mode?: ModeName; action?: "get" | "set" }
          );
          break;

        case "evolution":
          data = await this.handleEvolution(
            request.payload as { action: string }
          );
          break;

        case "deliberate":
          data = await this.handleDeliberate(
            request.payload as { question: string }
          );
          break;

        default:
          throw new Error(`Unknown method: ${request.method}`);
      }

      const response: ApiResponse = {
        success: true,
        data,
        timestamp: new Date(),
        requestId,
      };

      this.emit("response", response);
      return response;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: String(error),
        timestamp: new Date(),
        requestId,
      };

      this.emit("response", response);
      return response;
    }
  }

  /**
   * Handle query request
   */
  private async handleQuery(payload: BrainRequest): Promise<BrainResponse> {
    if (!payload?.query) {
      throw new Error("Query is required");
    }
    return this.brain.process(payload);
  }

  /**
   * Handle status request
   */
  private async handleStatus(): Promise<BrainStatus> {
    return this.brain.getStatus();
  }

  /**
   * Handle metrics request
   */
  private async handleMetrics() {
    return this.brain.getMetrics();
  }

  /**
   * Handle history request
   */
  private handleHistory(payload?: { limit?: number }): BrainResponse[] {
    return this.brain.getHistory(payload?.limit);
  }

  /**
   * Handle mode request
   */
  private async handleMode(payload?: {
    mode?: ModeName;
    action?: "get" | "set";
  }): Promise<{ mode: ModeName }> {
    if (payload?.action === "set" && payload?.mode) {
      this.brain.setMode(payload.mode);
    }
    return { mode: this.brain.getMode() };
  }

  /**
   * Handle evolution request
   */
  private async handleEvolution(payload: { action: string }): Promise<unknown> {
    switch (payload.action) {
      case "start":
        this.brain.startEvolution();
        return { status: "started" };

      case "stop":
        this.brain.stopEvolution();
        return { status: "stopped" };

      case "cycle":
        await this.brain.runEvolutionCycle();
        return { status: "cycle_complete" };

      case "pending":
        return { opportunities: this.brain.getPendingOpportunities() };

      default:
        throw new Error(`Unknown evolution action: ${payload.action}`);
    }
  }

  /**
   * Handle deliberate request
   */
  private async handleDeliberate(payload: { question: string }) {
    if (!payload?.question) {
      throw new Error("Question is required");
    }
    return this.brain.deliberate(payload.question);
  }

  /**
   * Boot the BRAIN and return boot screen
   */
  async boot(): Promise<string> {
    return this.brain.boot();
  }

  /**
   * Shutdown the BRAIN
   */
  shutdown(): void {
    this.brain.shutdown();
  }

  /**
   * Get route handlers for integration with frameworks (Express, Fastify, etc.)
   */
  getRouteHandlers(): {
    query: (body: BrainRequest) => Promise<ApiResponse<BrainResponse>>;
    status: () => Promise<ApiResponse<BrainStatus>>;
    metrics: () => Promise<ApiResponse>;
    history: (query: {
      limit?: string;
    }) => Promise<ApiResponse<BrainResponse[]>>;
    mode: (body: {
      mode?: ModeName;
    }) => Promise<ApiResponse<{ mode: ModeName }>>;
    evolution: (body: { action: string }) => Promise<ApiResponse>;
    deliberate: (body: { question: string }) => Promise<ApiResponse>;
  } {
    return {
      query: async (body) =>
        this.handleRequest({
          method: "query",
          payload: body as unknown as Record<string, unknown>,
        }) as Promise<ApiResponse<BrainResponse>>,
      status: async () =>
        this.handleRequest({ method: "status" }) as Promise<
          ApiResponse<BrainStatus>
        >,
      metrics: async () => this.handleRequest({ method: "metrics" }),
      history: async (query) =>
        this.handleRequest({
          method: "history",
          payload: { limit: parseInt(query.limit ?? "10") },
        }) as Promise<ApiResponse<BrainResponse[]>>,
      mode: async (body) =>
        this.handleRequest({
          method: "mode",
          payload: { ...body, action: body.mode ? "set" : "get" },
        }) as Promise<ApiResponse<{ mode: ModeName }>>,
      evolution: async (body) =>
        this.handleRequest({ method: "evolution", payload: body }),
      deliberate: async (body) =>
        this.handleRequest({ method: "deliberate", payload: body }),
    };
  }

  /**
   * Generate OpenAPI specification
   */
  getOpenAPISpec(): object {
    return {
      openapi: "3.0.0",
      info: {
        title: "OPUS 67 BRAIN API",
        version: "3.0.0",
        description:
          "Self-evolving AI runtime with multi-model routing and council deliberation",
      },
      servers: [
        { url: "http://localhost:3100", description: "Local development" },
      ],
      paths: {
        "/api/brain/query": {
          post: {
            summary: "Process a query through BRAIN",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["query"],
                    properties: {
                      query: { type: "string" },
                      forceMode: {
                        type: "string",
                        enum: [
                          "auto",
                          "scan",
                          "build",
                          "review",
                          "architect",
                          "debug",
                        ],
                      },
                      forceCouncil: { type: "boolean" },
                      skipMemory: { type: "boolean" },
                    },
                  },
                },
              },
            },
            responses: {
              "200": { description: "Query processed successfully" },
            },
          },
        },
        "/api/brain/status": {
          get: {
            summary: "Get BRAIN runtime status",
            responses: {
              "200": { description: "Status returned successfully" },
            },
          },
        },
        "/api/brain/metrics": {
          get: {
            summary: "Get comprehensive metrics",
            responses: {
              "200": { description: "Metrics returned successfully" },
            },
          },
        },
        "/api/brain/history": {
          get: {
            summary: "Get query history",
            parameters: [
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10 },
              },
            ],
            responses: {
              "200": { description: "History returned successfully" },
            },
          },
        },
        "/api/brain/mode": {
          get: {
            summary: "Get current mode",
            responses: {
              "200": { description: "Mode returned" },
            },
          },
          post: {
            summary: "Set mode",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mode: {
                        type: "string",
                        enum: [
                          "auto",
                          "scan",
                          "build",
                          "review",
                          "architect",
                          "debug",
                        ],
                      },
                    },
                  },
                },
              },
            },
            responses: {
              "200": { description: "Mode set successfully" },
            },
          },
        },
        "/api/brain/evolution": {
          post: {
            summary: "Control evolution engine",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["action"],
                    properties: {
                      action: {
                        type: "string",
                        enum: ["start", "stop", "cycle", "pending"],
                      },
                    },
                  },
                },
              },
            },
            responses: {
              "200": { description: "Evolution action executed" },
            },
          },
        },
        "/api/brain/deliberate": {
          post: {
            summary: "Invoke council deliberation",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["question"],
                    properties: {
                      question: { type: "string" },
                    },
                  },
                },
              },
            },
            responses: {
              "200": { description: "Deliberation result" },
            },
          },
        },
      },
      components: {
        schemas: {
          BrainResponse: {
            type: "object",
            properties: {
              id: { type: "string" },
              query: { type: "string" },
              mode: { type: "string" },
              response: { type: "string" },
              model: { type: "string" },
              cost: { type: "number" },
              latencyMs: { type: "number" },
            },
          },
        },
      },
    };
  }
}

// Factory
export function createBrainAPI(brainInstance?: BrainRuntime): BrainAPI {
  return new BrainAPI(brainInstance);
}

// Default singleton
export const brainAPI = new BrainAPI();
