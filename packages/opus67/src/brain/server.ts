/**
 * OPUS 67 BRAIN HTTP Server
 * Fastify-based REST + WebSocket server for BRAIN API
 */

import Fastify, { FastifyInstance } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import {
  BrainAPI,
  createBrainAPI,
  type WebSocketMessage,
} from "./brain-api.js";
import type { ModeName } from "../mode-selector.js";

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string | string[];
}

const DEFAULT_CONFIG: ServerConfig = {
  port: parseInt(process.env.PORT ?? "3100"),
  host: process.env.HOST ?? "0.0.0.0",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};

/**
 * Create and configure the BRAIN server
 */
export async function createBrainServer(
  config?: Partial<ServerConfig>
): Promise<FastifyInstance> {
  const serverConfig = { ...DEFAULT_CONFIG, ...config };
  const api = createBrainAPI();

  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
              options: { colorize: true },
            }
          : undefined,
    },
  });

  // Register plugins
  await fastify.register(fastifyCors, {
    origin: serverConfig.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  await fastify.register(fastifyWebsocket);

  // Health check endpoint
  fastify.get("/health", async () => {
    const status = await api.handleRequest({ method: "status" });
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      brain: status.data,
    };
  });

  // ===== Hub API compatibility endpoints =====

  // Hub status (for dashboard compatibility)
  fastify.get("/api/status", async () => {
    const status = await api.handleRequest({ method: "status" });
    return {
      ok: true,
      timestamp: Date.now(),
      running: true,
      apiPort: serverConfig.port,
      workflows: 0,
      engines: {
        status: { healthy: 1, degraded: 0, offline: 0, total: 1 },
        details: [
          {
            id: "brain",
            connected: true,
            lastHeartbeat: Date.now(),
            status: "healthy",
          },
        ],
      },
      brain: status.data,
    };
  });

  // Autonomy status (stub)
  fastify.get("/api/autonomy/status", async () => {
    return {
      ok: true,
      level: 2,
      queue: { pending: 0, approved: 0, rejected: 0 },
      audit: { total: 0, auto: 0, queued: 0, escalated: 0, successRate: 100 },
      today: { autoExecuted: 0, queued: 0, escalated: 0, cost: 0, revenue: 0 },
      stats: { autoExecuted: 0, queued: 0, pending: 0 },
    };
  });

  // Events endpoints (stubs)
  fastify.get<{
    Querystring: { limit?: string; category?: string; severity?: string };
  }>("/api/events/enriched", async (request) => {
    const limit = request.query.limit ? parseInt(request.query.limit) : 30;
    return { ok: true, events: [], count: 0 };
  });

  fastify.get("/api/events/categories", async () => {
    return {
      ok: true,
      categories: [
        { id: "brain", name: "Brain", icon: "brain" },
        { id: "system", name: "System", icon: "cog" },
        { id: "trading", name: "Trading", icon: "chart" },
      ],
    };
  });

  // Brain stats endpoint
  fastify.get("/api/brain/stats", async () => {
    const metrics = await api.handleRequest({ method: "metrics" });
    const metricsData =
      typeof metrics.data === "object" && metrics.data !== null
        ? metrics.data
        : {};
    return {
      ok: true,
      knowledge: { total: 0, bySource: {}, byTopic: {}, recent24h: 0 },
      patterns: { total: 0, byType: {}, avgConfidence: 0 },
      predictions: { total: 0, pending: 0, accuracy: 0 },
      uptime: Date.now(),
      lastIngestion: Date.now(),
      ...metricsData,
    };
  });

  // Brain recent knowledge
  fastify.get<{ Querystring: { limit?: string } }>(
    "/api/brain/recent",
    async (request) => {
      const limit = request.query.limit ? parseInt(request.query.limit) : 20;
      return { ok: true, items: [], count: 0 };
    }
  );

  // Brain patterns
  fastify.get("/api/brain/patterns", async () => {
    return { ok: true, patterns: [], count: 0 };
  });

  // Brain predictions
  fastify.get("/api/brain/predictions", async () => {
    return { ok: true, predictions: [], count: 0 };
  });

  // Root WebSocket endpoint (for dashboard compatibility)
  fastify.get("/ws", { websocket: true }, (socket) => {
    fastify.log.info("Dashboard WebSocket client connected");

    const unsubscribe = api.subscribe((msg: WebSocketMessage) => {
      try {
        socket.send(JSON.stringify(msg));
      } catch (error) {
        fastify.log.error(`WebSocket send error: ${String(error)}`);
      }
    });

    socket.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong", timestamp: new Date() }));
          return;
        }
        if (message.method) {
          const response = await api.handleRequest(message);
          socket.send(
            JSON.stringify({
              type: "response",
              payload: response,
              timestamp: new Date(),
            })
          );
        }
      } catch (error) {
        fastify.log.error(`WebSocket message error: ${String(error)}`);
      }
    });

    socket.on("close", () => {
      fastify.log.info("Dashboard WebSocket client disconnected");
      unsubscribe();
    });

    socket.on("error", (error) => {
      fastify.log.error(`WebSocket error: ${String(error)}`);
      unsubscribe();
    });
  });

  // OpenAPI spec
  fastify.get("/api/brain/openapi", async () => {
    return api.getOpenAPISpec();
  });

  // Boot screen (for debugging)
  fastify.get("/api/brain/boot", async () => {
    return { screen: api.boot() };
  });

  // Query endpoint
  fastify.post<{
    Body: {
      query: string;
      forceMode?: ModeName;
      forceCouncil?: boolean;
      skipMemory?: boolean;
    };
  }>("/api/brain/query", async (request) => {
    return api.handleRequest({ method: "query", payload: request.body });
  });

  // Status endpoint
  fastify.get("/api/brain/status", async () => {
    return api.handleRequest({ method: "status" });
  });

  // Metrics endpoint
  fastify.get("/api/brain/metrics", async () => {
    return api.handleRequest({ method: "metrics" });
  });

  // History endpoint
  fastify.get<{
    Querystring: { limit?: string };
  }>("/api/brain/history", async (request) => {
    const limit = request.query.limit ? parseInt(request.query.limit) : 10;
    return api.handleRequest({ method: "history", payload: { limit } });
  });

  // Mode GET endpoint
  fastify.get("/api/brain/mode", async () => {
    return api.handleRequest({ method: "mode", payload: { action: "get" } });
  });

  // Mode SET endpoint
  fastify.post<{
    Body: { mode: ModeName };
  }>("/api/brain/mode", async (request) => {
    return api.handleRequest({
      method: "mode",
      payload: { mode: request.body.mode, action: "set" },
    });
  });

  // Evolution endpoint
  fastify.post<{
    Body: { action: "start" | "stop" | "cycle" | "pending" };
  }>("/api/brain/evolution", async (request) => {
    return api.handleRequest({ method: "evolution", payload: request.body });
  });

  // Deliberate endpoint
  fastify.post<{
    Body: { question: string };
  }>("/api/brain/deliberate", async (request) => {
    return api.handleRequest({ method: "deliberate", payload: request.body });
  });

  // WebSocket endpoint
  fastify.get("/api/brain/ws", { websocket: true }, (socket) => {
    fastify.log.info("WebSocket client connected");

    // Subscribe to BRAIN events
    const unsubscribe = api.subscribe((msg: WebSocketMessage) => {
      try {
        socket.send(JSON.stringify(msg));
      } catch (error) {
        fastify.log.error(`WebSocket send error: ${String(error)}`);
      }
    });

    // Handle incoming messages
    socket.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle ping/pong
        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong", timestamp: new Date() }));
          return;
        }

        // Handle API requests via WebSocket
        if (message.method) {
          const response = await api.handleRequest(message);
          socket.send(
            JSON.stringify({
              type: "response",
              payload: response,
              timestamp: new Date(),
            })
          );
        }
      } catch (error) {
        fastify.log.error(`WebSocket message error: ${String(error)}`);
        socket.send(
          JSON.stringify({
            type: "error",
            payload: { message: String(error) },
            timestamp: new Date(),
          })
        );
      }
    });

    socket.on("close", () => {
      fastify.log.info("WebSocket client disconnected");
      unsubscribe();
    });

    socket.on("error", (error) => {
      fastify.log.error(`WebSocket error: ${String(error)}`);
      unsubscribe();
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    fastify.log.info("Shutting down BRAIN server...");
    api.shutdown();
    await fastify.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return fastify;
}

/**
 * Start the BRAIN server
 */
export async function startBrainServer(
  config?: Partial<ServerConfig>
): Promise<void> {
  const serverConfig = { ...DEFAULT_CONFIG, ...config };
  const fastify = await createBrainServer(config);

  try {
    await fastify.listen({ port: serverConfig.port, host: serverConfig.host });
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    OPUS 67 BRAIN SERVER                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🧠 BRAIN API running at http://${serverConfig.host}:${serverConfig.port}                   ║
║                                                                  ║
║  ENDPOINTS:                                                      ║
║  ────────────────────────────────────────────────────────────    ║
║  GET  /health              Health check                          ║
║  GET  /api/brain/boot      Boot screen                          ║
║  GET  /api/brain/status    Runtime status                       ║
║  GET  /api/brain/metrics   Comprehensive metrics                ║
║  GET  /api/brain/history   Query history                        ║
║  GET  /api/brain/mode      Get current mode                     ║
║  POST /api/brain/mode      Set mode                             ║
║  POST /api/brain/query     Process query                        ║
║  POST /api/brain/evolution Control evolution                    ║
║  POST /api/brain/deliberate Invoke council                      ║
║  WS   /api/brain/ws        Real-time updates                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// CLI entry point
if (
  process.argv[1]?.endsWith("server.js") ||
  process.argv[1]?.endsWith("server.ts")
) {
  startBrainServer();
}
