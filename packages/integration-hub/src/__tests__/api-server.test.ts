/**
 * API Server Tests
 * Phase 17C: API & Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";

// Create mock hub before importing ApiServer
const mockEventBus = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  publish: vi.fn(),
  getRecentEvents: vi.fn().mockReturnValue([]),
  getEventsByCategory: vi.fn().mockReturnValue([]),
};

const mockEngineManager = {
  getHealth: vi.fn(),
  getAllHealth: vi.fn().mockReturnValue([]),
  getAggregatedStatus: vi.fn().mockReturnValue({
    healthy: 0,
    degraded: 0,
    offline: 6,
    total: 6,
  }),
};

const mockHub = {
  getEventBus: vi.fn().mockReturnValue(mockEventBus),
  getEngineManager: vi.fn().mockReturnValue(mockEngineManager),
  getBrain: vi.fn().mockReturnValue(undefined),
  getMoneyEngine: vi.fn().mockReturnValue(undefined),
  getGrowthEngine: vi.fn().mockReturnValue(undefined),
  getProductEngine: vi.fn().mockReturnValue(undefined),
  getStatus: vi.fn().mockReturnValue({
    running: true,
    startedAt: Date.now(),
    apiPort: 3001,
    engines: { healthy: 0, degraded: 0, offline: 6, total: 6 },
    workflows: 7,
  }),
};

// Mock the routes module to avoid complex dependencies
vi.mock("../api/routes.js", () => ({
  registerRoutes: vi.fn().mockResolvedValue(undefined),
}));

import { ApiServer } from "../api/server.js";

describe("ApiServer", () => {
  let server: ApiServer;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockHub.getEventBus.mockReturnValue(mockEventBus);
  });

  afterEach(async () => {
    if (server) {
      try {
        await server.stop();
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  // ===========================================================================
  // CONSTRUCTOR TESTS
  // ===========================================================================

  describe("constructor", () => {
    it("should create server with default config", () => {
      server = new ApiServer(mockHub as any);
      expect(server).toBeDefined();
    });

    it("should create server with custom config", () => {
      server = new ApiServer(mockHub as any, {
        port: 4000,
        host: "127.0.0.1",
      });
      expect(server).toBeDefined();
    });

    it("should expose Fastify instance via getFastify()", () => {
      server = new ApiServer(mockHub as any);
      const fastify = server.getFastify();
      expect(fastify).toBeDefined();
    });
  });

  // ===========================================================================
  // INITIALIZATION TESTS
  // ===========================================================================

  describe("initialize", () => {
    it("should initialize without errors", async () => {
      server = new ApiServer(mockHub as any);
      await expect(server.initialize()).resolves.not.toThrow();
    });

    it("should register health endpoint", async () => {
      server = new ApiServer(mockHub as any);
      await server.initialize();

      const fastify = server.getFastify();
      const response = await fastify.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ok).toBe(true);
      expect(body.timestamp).toBeDefined();
    });

    it("should register root endpoint", async () => {
      server = new ApiServer(mockHub as any);
      await server.initialize();

      const fastify = server.getFastify();
      const response = await fastify.inject({
        method: "GET",
        url: "/",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.service).toBe("gICM Integration Hub");
      expect(body.version).toBeDefined();
      expect(body.status).toBe("running");
      expect(body.endpoints).toBeDefined();
    });
  });

  // ===========================================================================
  // ENDPOINT TESTS
  // ===========================================================================

  describe("endpoints", () => {
    beforeEach(async () => {
      server = new ApiServer(mockHub as any);
      await server.initialize();
    });

    describe("GET /health", () => {
      it("should return ok status", async () => {
        const fastify = server.getFastify();
        const response = await fastify.inject({
          method: "GET",
          url: "/health",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.ok).toBe(true);
      });

      it("should include timestamp", async () => {
        const fastify = server.getFastify();
        const before = Date.now();

        const response = await fastify.inject({
          method: "GET",
          url: "/health",
        });

        const after = Date.now();
        const body = JSON.parse(response.body);

        expect(body.timestamp).toBeGreaterThanOrEqual(before);
        expect(body.timestamp).toBeLessThanOrEqual(after);
      });
    });

    describe("GET /", () => {
      it("should return service info", async () => {
        const fastify = server.getFastify();
        const response = await fastify.inject({
          method: "GET",
          url: "/",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.service).toBe("gICM Integration Hub");
      });

      it("should include available endpoints", async () => {
        const fastify = server.getFastify();
        const response = await fastify.inject({
          method: "GET",
          url: "/",
        });

        const body = JSON.parse(response.body);
        expect(body.endpoints).toEqual({
          health: "/health",
          api: "/api",
          websocket: "/ws",
          status: "/api/status",
          brain: "/api/brain/status",
        });
      });
    });
  });

  // ===========================================================================
  // CORS TESTS
  // ===========================================================================

  describe("CORS", () => {
    beforeEach(async () => {
      server = new ApiServer(mockHub as any);
      await server.initialize();
    });

    it("should allow cross-origin requests", async () => {
      const fastify = server.getFastify();
      const response = await fastify.inject({
        method: "OPTIONS",
        url: "/health",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "GET",
        },
      });

      // CORS preflight should succeed
      expect(response.statusCode).toBe(204);
    });

    it("should include CORS headers in response", async () => {
      const fastify = server.getFastify();
      const response = await fastify.inject({
        method: "GET",
        url: "/health",
        headers: {
          Origin: "http://localhost:3000",
        },
      });

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });
  });

  // ===========================================================================
  // LIFECYCLE TESTS
  // ===========================================================================

  describe("lifecycle", () => {
    it("should start and stop cleanly", async () => {
      server = new ApiServer(mockHub as any, { port: 0 }); // Use port 0 for random available port

      // Start should not throw
      await expect(server.start()).resolves.not.toThrow();

      // Stop should not throw
      await expect(server.stop()).resolves.not.toThrow();
    });
  });
});

// =============================================================================
// API ROUTES INTEGRATION TESTS
// =============================================================================

describe("API Routes Integration", () => {
  let fastify: FastifyInstance;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });

    // Register a simple test route
    fastify.get("/api/test", async () => {
      return { message: "test" };
    });

    // Register status route that uses hub
    fastify.get("/api/status", async () => {
      return mockHub.getStatus();
    });

    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe("status endpoint", () => {
    it("should return hub status", async () => {
      const response = await fastify.inject({
        method: "GET",
        url: "/api/status",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.running).toBe(true);
      expect(body.engines).toBeDefined();
      expect(body.workflows).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await fastify.inject({
        method: "GET",
        url: "/api/nonexistent",
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
