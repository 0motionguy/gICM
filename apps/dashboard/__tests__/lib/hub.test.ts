import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hubApi, WS_URL } from "../../lib/api/hub";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("hubApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("WS_URL", () => {
    it("should derive WebSocket URL from hub URL", () => {
      // Default HUB_URL is http://localhost:3100
      expect(WS_URL).toMatch(/^ws/);
      expect(WS_URL).toContain("/ws");
    });
  });

  describe("GET endpoints", () => {
    it("should fetch status", async () => {
      const mockStatus = {
        running: true,
        startedAt: Date.now(),
        apiPort: 3100,
        engines: [],
        workflows: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      });

      const result = await hubApi.getStatus();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/status"),
        expect.any(Object)
      );
      expect(result).toEqual(mockStatus);
    });

    it("should fetch brain status", async () => {
      const mockBrain = {
        version: "1.0.0",
        isRunning: true,
        autonomyLevel: 2,
        currentPhase: "morning",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBrain),
      });

      const result = await hubApi.getBrain();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/brain/status"),
        expect.any(Object)
      );
      expect(result).toEqual(mockBrain);
    });

    it("should return null on fetch error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await hubApi.getStatus();

      expect(result).toBeNull();
    });

    it("should return null on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await hubApi.getStatus();

      expect(result).toBeNull();
    });

    it("should fetch events with limit", async () => {
      const mockEvents = [
        { id: "1", timestamp: Date.now(), source: "brain", type: "started" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      });

      const result = await hubApi.getEvents(10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/events?limit=10"),
        expect.any(Object)
      );
      expect(result).toEqual(mockEvents);
    });
  });

  describe("POST endpoints", () => {
    it("should start brain", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, message: "Brain started" }),
      });

      const result = await hubApi.startBrain();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/brain/start"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      expect(result?.ok).toBe(true);
    });

    it("should stop brain", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, message: "Brain stopped" }),
      });

      const result = await hubApi.stopBrain();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/brain/stop"),
        expect.any(Object)
      );
      expect(result?.ok).toBe(true);
    });

    it("should trigger phase", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

      const result = await hubApi.triggerPhase("morning");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/brain/phase"),
        expect.objectContaining({
          body: JSON.stringify({ phase: "morning" }),
        })
      );
      expect(result?.ok).toBe(true);
    });

    it("should run discovery", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

      const result = await hubApi.runDiscovery();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/discovery/run"),
        expect.any(Object)
      );
      expect(result?.ok).toBe(true);
    });

    it("should generate content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

      const result = await hubApi.generateContent("tweet");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/content/generate"),
        expect.objectContaining({
          body: JSON.stringify({ type: "tweet" }),
        })
      );
      expect(result?.ok).toBe(true);
    });

    it("should return null on POST error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await hubApi.startBrain();

      expect(result).toBeNull();
    });
  });
});
