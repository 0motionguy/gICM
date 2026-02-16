/**
 * API Routes - REST endpoints for the Integration Hub
 */

import type { FastifyInstance } from "fastify";
import type { IntegrationHub } from "../hub.js";
import { registerContentRoutes } from "./content-routes.js";
import { registerOrgRoutes } from "./org-routes.js";
import { registerAuditRoutes } from "./audit-routes.js";
import { gitRoutes } from "./git-routes.js";
import { botRoutes } from "./bot-routes.js";
import { terraformRoutes } from "./terraform-routes.js";
import { vscodeRoutes } from "./vscode-routes.js";
import { haRoutes } from "./ha-routes.js";
import { drRoutes } from "./dr-routes.js";
import { observabilityRoutes } from "./observability-routes.js";
import { mcpRoutes } from "../mcp/routes.js";
import { getAutonomy } from "@gicm/autonomy";

// ============================================================================
// PREDICTION MARKET TYPES & FETCHERS
// ============================================================================

interface PredictionMarket {
  id: string;
  source: "polymarket" | "kalshi";
  question: string;
  category: "politics" | "crypto" | "macro" | "other";
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  totalVolume: number;
  liquidity: number;
  openInterest?: number;
  priceChange24h: number;
  expiresAt?: string;
  url: string;
}

interface PredictionsStatus {
  lastUpdated: string;
  sources: {
    polymarket: { active: boolean; marketCount: number; totalVolume: number };
    kalshi: { active: boolean; marketCount: number; totalVolume: number };
  };
  markets: {
    politics: PredictionMarket[];
    crypto: PredictionMarket[];
    trending: PredictionMarket[];
  };
  stats: {
    totalMarkets: number;
    totalVolume24h: number;
    topMoverPercent: number;
  };
}

// Keywords for categorization
const POLITICS_KEYWORDS = [
  "election",
  "president",
  "congress",
  "senate",
  "house",
  "governor",
  "vote",
  "ballot",
  "democrat",
  "republican",
  "trump",
  "biden",
  "political",
  "impeach",
  "cabinet",
];
const CRYPTO_KEYWORDS = [
  "bitcoin",
  "btc",
  "ethereum",
  "eth",
  "solana",
  "sol",
  "crypto",
  "etf",
  "sec",
  "coinbase",
  "binance",
  "defi",
  "nft",
  "blockchain",
  "doge",
  "xrp",
];
const MACRO_KEYWORDS = [
  "fed",
  "fomc",
  "interest rate",
  "inflation",
  "cpi",
  "gdp",
  "unemployment",
  "recession",
  "treasury",
  "yield",
];

function categorizeMarket(
  question: string
): "politics" | "crypto" | "macro" | "other" {
  const q = question.toLowerCase();
  if (POLITICS_KEYWORDS.some((kw) => q.includes(kw))) return "politics";
  if (CRYPTO_KEYWORDS.some((kw) => q.includes(kw))) return "crypto";
  if (MACRO_KEYWORDS.some((kw) => q.includes(kw))) return "macro";
  return "other";
}

async function fetchPolymarketMarkets(): Promise<PredictionMarket[]> {
  try {
    // Use closed=false to get only open markets
    const response = await fetch(
      "https://gamma-api.polymarket.com/markets?closed=false&limit=100",
      {
        headers: { "User-Agent": "gICM-Hub/1.0", Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const markets = Array.isArray(data) ? data : (data.markets ?? []);

    return markets
      .filter((m: any) => !m.closed && m.volumeNum > 1000)
      .map((m: any) => {
        const prices = m.outcomePrices?.map(
          (p: string) => parseFloat(p) * 100
        ) ?? [50, 50];
        return {
          id: `poly-${m.id}`,
          source: "polymarket" as const,
          question: m.question,
          category: categorizeMarket(m.question),
          yesPrice: prices[0] ?? 50,
          noPrice: prices[1] ?? 50,
          volume24h: m.volume24hr ?? 0,
          totalVolume: m.volume ?? 0,
          liquidity: m.liquidity ?? 0,
          priceChange24h: 0, // Polymarket doesn't provide this directly
          expiresAt: m.endDate,
          url: `https://polymarket.com/event/${m.slug}`,
        };
      })
      .slice(0, 50);
  } catch (error) {
    console.error("[PREDICTIONS] Polymarket fetch error:", error);
    return [];
  }
}

async function fetchKalshiMarkets(): Promise<PredictionMarket[]> {
  try {
    // Try the elections API first, then fallback
    let response = await fetch(
      "https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=200",
      {
        headers: { "User-Agent": "gICM-Hub/1.0", Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      response = await fetch(
        "https://trading-api.kalshi.com/trade-api/v2/markets?status=open&limit=200",
        {
          headers: { "User-Agent": "gICM-Hub/1.0", Accept: "application/json" },
          signal: AbortSignal.timeout(10000),
        }
      );
    }

    if (!response.ok) return [];
    const data = await response.json();
    const markets = data.markets ?? [];

    return markets
      .filter(
        (m: any) =>
          (m.status === "active" || m.status === "open") && m.volume > 10
      )
      .map((m: any) => {
        const yesPrice = m.yes_bid > 0 ? m.yes_bid : m.last_price;
        const noPrice = m.no_bid > 0 ? m.no_bid : 100 - m.last_price;
        const priceChange = m.last_price - m.previous_price;

        return {
          id: `kalshi-${m.ticker}`,
          source: "kalshi" as const,
          question: m.title,
          category: categorizeMarket(m.title),
          yesPrice,
          noPrice,
          volume24h: m.volume_24h ?? 0,
          totalVolume: m.volume ?? 0,
          liquidity: m.liquidity ?? 0,
          openInterest: m.open_interest,
          priceChange24h: priceChange,
          expiresAt: m.expiration_time,
          url: `https://kalshi.com/markets/${m.ticker}`,
        };
      })
      .slice(0, 50);
  } catch (error) {
    console.error("[PREDICTIONS] Kalshi fetch error:", error);
    return [];
  }
}

async function aggregatePredictions(): Promise<PredictionsStatus> {
  const [polymarkets, kalshiMarkets] = await Promise.all([
    fetchPolymarketMarkets(),
    fetchKalshiMarkets(),
  ]);

  const allMarkets = [...polymarkets, ...kalshiMarkets];

  // Categorize markets
  const politics = allMarkets
    .filter((m) => m.category === "politics")
    .sort((a, b) => b.volume24h - a.volume24h);
  const crypto = allMarkets
    .filter((m) => m.category === "crypto")
    .sort((a, b) => b.volume24h - a.volume24h);

  // Trending = highest activity score: (volume_24h * |priceChange24h|)
  const trending = [...allMarkets]
    .map((m) => ({
      ...m,
      trendScore: m.volume24h * (Math.abs(m.priceChange24h) + 1),
    }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 20);

  // Calculate stats
  const totalVolume24h = allMarkets.reduce((sum, m) => sum + m.volume24h, 0);
  const topMover = allMarkets.reduce(
    (max, m) =>
      Math.abs(m.priceChange24h) > Math.abs(max) ? m.priceChange24h : max,
    0
  );

  return {
    lastUpdated: new Date().toISOString(),
    sources: {
      polymarket: {
        active: polymarkets.length > 0,
        marketCount: polymarkets.length,
        totalVolume: polymarkets.reduce((sum, m) => sum + m.totalVolume, 0),
      },
      kalshi: {
        active: kalshiMarkets.length > 0,
        marketCount: kalshiMarkets.length,
        totalVolume: kalshiMarkets.reduce((sum, m) => sum + m.totalVolume, 0),
      },
    },
    markets: {
      politics: politics.slice(0, 20),
      crypto: crypto.slice(0, 20),
      trending,
    },
    stats: {
      totalMarkets: allMarkets.length,
      totalVolume24h,
      topMoverPercent: topMover,
    },
  };
}

export async function registerRoutes(
  fastify: FastifyInstance,
  hub: IntegrationHub
): Promise<void> {
  // Register Content Engine routes
  await registerContentRoutes(fastify, hub);

  // Register Organization & RBAC routes (Phase 9A)
  await registerOrgRoutes(fastify);

  // Register Audit Logging routes (Phase 9B)
  await registerAuditRoutes(fastify);

  // Register Git Integration routes (Phase 11A)
  await gitRoutes(fastify);

  // Register Bot routes (Phase 11B)
  await botRoutes(fastify);

  // Register Terraform routes (Phase 11C)
  await terraformRoutes(fastify);

  // Register VS Code Extension routes (Phase 11D)
  await vscodeRoutes(fastify);

  // Register High Availability routes (Phase 12A)
  await haRoutes(fastify);

  // Register Disaster Recovery routes (Phase 12B)
  await drRoutes(fastify);

  // Register Observability routes (Phase 12D)
  await observabilityRoutes(fastify);

  // Register MCP Gateway routes
  await mcpRoutes(fastify);

  // =========================================================================
  // ENGINE REGISTRATION ENDPOINTS (for distributed engines)
  // =========================================================================

  /**
   * POST /api/engines/register - Register an engine
   */
  fastify.post<{ Body: { engineId: string } }>(
    "/api/engines/register",
    async (req) => {
      const { engineId } = req.body;
      const validEngines = [
        "brain",
        "money",
        "growth",
        "product",
        "trading",
        "opus67",
      ] as const;
      type ValidEngineId = (typeof validEngines)[number];

      if (!validEngines.includes(engineId as ValidEngineId)) {
        return {
          ok: false,
          error: `Invalid engine ID. Must be one of: ${validEngines.join(", ")}`,
        };
      }

      hub.getEngineManager().markConnected(engineId as ValidEngineId);
      console.log(`[HUB] Engine registered via API: ${engineId}`);

      return { ok: true, message: `Engine ${engineId} registered`, engineId };
    }
  );

  /**
   * POST /api/engines/heartbeat - Send heartbeat from an engine
   */
  fastify.post<{ Body: { engineId: string } }>(
    "/api/engines/heartbeat",
    async (req) => {
      const { engineId } = req.body;
      const validEngines = [
        "brain",
        "money",
        "growth",
        "product",
        "trading",
        "opus67",
      ] as const;
      type ValidEngineId = (typeof validEngines)[number];

      if (!validEngines.includes(engineId as ValidEngineId)) {
        return { ok: false, error: "Invalid engine ID" };
      }

      hub.getEngineManager().recordHeartbeat(engineId as ValidEngineId);

      return { ok: true, timestamp: Date.now() };
    }
  );

  /**
   * POST /api/engines/unregister - Unregister an engine
   */
  fastify.post<{ Body: { engineId: string } }>(
    "/api/engines/unregister",
    async (req) => {
      const { engineId } = req.body;
      const validEngines = [
        "brain",
        "money",
        "growth",
        "product",
        "trading",
        "opus67",
      ] as const;
      type ValidEngineId = (typeof validEngines)[number];

      if (!validEngines.includes(engineId as ValidEngineId)) {
        return { ok: false, error: "Invalid engine ID" };
      }

      hub.getEngineManager().markDisconnected(engineId as ValidEngineId);
      console.log(`[HUB] Engine unregistered: ${engineId}`);

      return { ok: true, message: `Engine ${engineId} unregistered` };
    }
  );

  // =========================================================================
  // STATUS ENDPOINTS
  // =========================================================================

  /**
   * GET /api/status - Overall system status
   */
  fastify.get("/api/status", async () => {
    const engines = hub.getEngineManager().getAllHealth();
    const aggregated = hub.getEngineManager().getAggregatedStatus();

    return {
      ok: aggregated.offline === 0,
      timestamp: Date.now(),
      engines: {
        status: aggregated,
        details: engines,
      },
    };
  });

  /**
   * GET /api/brain/status - Brain status
   */
  fastify.get("/api/brain/status", async () => {
    const brain = hub.getBrain();

    // If Brain instance is directly connected, use it
    if (brain) {
      return {
        ok: true,
        status: brain.getStatus(),
      };
    }

    // Otherwise, check if Brain is registered via API
    const allEngines = hub.getEngineManager().getAllHealth();
    const engineHealth = allEngines.find((e) => e.id === "brain");
    if (engineHealth && engineHealth.connected) {
      // Brain is registered but not directly connected
      // Return a basic status indicating it's running
      return {
        ok: true,
        status: {
          version: "1.0.0",
          isRunning: true,
          connected: true,
          lastHeartbeat: engineHealth.lastHeartbeat,
          message: "Brain orchestrator is running and registered",
        },
      };
    }

    return {
      ok: false,
      error: "Brain not connected",
    };
  });

  // =========================================================================
  // BRAIN CONTROL ENDPOINTS
  // =========================================================================

  /**
   * POST /api/brain/start - Start the brain
   */
  fastify.post("/api/brain/start", async () => {
    const brain = hub.getBrain();

    if (!brain) {
      return { ok: false, error: "Brain not connected" };
    }

    brain.start();
    return { ok: true, message: "Brain started" };
  });

  /**
   * POST /api/brain/stop - Stop the brain
   */
  fastify.post("/api/brain/stop", async () => {
    const brain = hub.getBrain();

    if (!brain) {
      return { ok: false, error: "Brain not connected" };
    }

    brain.stop();
    return { ok: true, message: "Brain stopped" };
  });

  /**
   * POST /api/brain/phase - Trigger a specific phase
   */
  fastify.post<{ Body: { phase: string } }>("/api/brain/phase", async (req) => {
    const brain = hub.getBrain();

    if (!brain) {
      return { ok: false, error: "Brain not connected" };
    }

    const { phase } = req.body;
    await brain.triggerPhase(phase);

    return { ok: true, message: "Phase triggered", phase };
  });

  // =========================================================================
  // TREASURY ENDPOINTS
  // =========================================================================

  /**
   * GET /api/treasury - Treasury status
   */
  fastify.get("/api/treasury", async () => {
    const moneyEngine = hub.getMoneyEngine();

    if (!moneyEngine) {
      return {
        ok: false,
        error: "Money engine not connected",
      };
    }

    try {
      const status = await moneyEngine.getStatus();
      return {
        ok: true,
        treasury: {
          totalUsd: status.treasury.totalValueUsd.toNumber(),
          solBalance: status.treasury.solBalance.toNumber(),
          usdcBalance: status.treasury.usdcBalance.toNumber(),
          runway: status.health.runway,
          allocations: Object.fromEntries(
            Object.entries(status.treasury.allocations).map(([k, v]) => [
              k,
              v.toNumber(),
            ])
          ),
        },
        health: status.health,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Failed to fetch treasury status",
      };
    }
  });

  // =========================================================================
  // ENGINE STATUS ENDPOINTS (for dashboard)
  // =========================================================================

  /**
   * GET /api/money/status - Money engine detailed status (alias for treasury)
   */
  fastify.get("/api/money/status", async () => {
    const moneyEngine = hub.getMoneyEngine();

    if (!moneyEngine) {
      return {
        ok: false,
        error: "Money engine not connected",
      };
    }

    try {
      const status = await moneyEngine.getStatus();
      return {
        ok: true,
        totalValueUsd: status.treasury.totalValueUsd.toNumber(),
        balances: {
          sol: status.treasury.solBalance.toNumber(),
          usdc: status.treasury.usdcBalance.toNumber(),
        },
        allocations: Object.fromEntries(
          Object.entries(status.treasury.allocations).map(([k, v]) => [
            k,
            v.toNumber(),
          ])
        ),
        runway: status.health.runway,
        expenses: {
          monthly: 0, // TODO: Wire to expense tracking
          upcoming: 0,
        },
        trading: {
          activeBots: 1, // DCA bot
          totalPnL: 0,
          dailyPnL: 0,
          weeklyPnL: 0,
        },
      };
    } catch (error) {
      return { ok: false, error: "Failed to fetch money status" };
    }
  });

  /**
   * GET /api/growth/status - Growth engine status
   */
  fastify.get("/api/growth/status", async () => {
    const growthEngine = hub.getGrowthEngine();

    if (!growthEngine) {
      return {
        ok: false,
        error: "Growth engine not connected",
        // Return stub data so dashboard doesn't break
        running: false,
        metrics: {
          traffic: { daily: 0, weekly: 0, monthly: 0 },
          content: { postsPublished: 0, totalViews: 0, avgEngagement: 0 },
          social: { twitterFollowers: 0, discordMembers: 0 },
          seo: { avgPosition: 0, indexedPages: 0, backlinks: 0 },
        },
        upcomingContent: { blogPosts: 0, tweets: 0 },
      };
    }

    try {
      const status = growthEngine.getStatus();
      return {
        ok: true,
        running: status.running,
        metrics: {
          traffic: { daily: 0, weekly: 0, monthly: 0 }, // TODO: Wire to analytics
          content: {
            postsPublished: status.metrics.postsGenerated,
            totalViews: 0,
            avgEngagement: 0,
          },
          social: {
            twitterFollowers: 0,
            discordMembers: 0,
          },
          seo: { avgPosition: 0, indexedPages: 0, backlinks: 0 },
        },
        upcomingContent: {
          blogPosts: status.upcomingContent?.length || 0,
          tweets: 0,
        },
      };
    } catch (error) {
      return { ok: false, error: "Failed to fetch growth status" };
    }
  });

  /**
   * GET /api/product/status - Product engine status
   */
  fastify.get("/api/product/status", async () => {
    const productEngine = hub.getProductEngine();

    if (!productEngine) {
      return {
        ok: false,
        error: "Product engine not connected",
        running: false,
        backlog: { total: 0, approved: 0, building: 0 },
        activeBuild: null,
        metrics: { discovered: 0, built: 0, deployed: 0, successRate: 0 },
      };
    }

    try {
      const backlog = productEngine.getBacklog();
      const approved = backlog.filter((o: any) => o.status === "approved");
      const building = backlog.filter((o: any) => o.status === "building");

      return {
        ok: true,
        running: true,
        backlog: {
          total: backlog.length,
          approved: approved.length,
          building: building.length,
        },
        activeBuild:
          building.length > 0
            ? {
                id: building[0].id,
                name: building[0].name,
                progress: 50, // TODO: Track actual progress
              }
            : null,
        metrics: {
          discovered: backlog.length,
          built: 0, // TODO: Track completed builds
          deployed: 0,
          successRate: 0,
        },
      };
    } catch (error) {
      return { ok: false, error: "Failed to fetch product status" };
    }
  });

  /**
   * GET /api/hunter/status - Hunter agent status
   */
  fastify.get("/api/hunter/status", async () => {
    // Hunter is typically part of the brain or a separate agent
    // For now, return status based on brain's hunter config if available
    const brain = hub.getBrain();

    if (brain) {
      const brainStatus = brain.getStatus();
      return {
        ok: true,
        isRunning: brainStatus.isRunning,
        enabledSources: brainStatus.hunter?.enabledSources || [
          "github",
          "hackernews",
          "twitter",
        ],
        totalDiscoveries: brainStatus.hunter?.totalDiscoveries || 0,
        totalSignals: brainStatus.hunter?.totalSignals || 0,
        actionableSignals: brainStatus.hunter?.actionableSignals || 0,
        recentDiscoveries: [], // TODO: Fetch from hunter agent
      };
    }

    // Default response when brain not connected
    return {
      ok: true,
      isRunning: false,
      enabledSources: ["github", "hackernews", "twitter", "producthunt"],
      totalDiscoveries: 0,
      totalSignals: 0,
      actionableSignals: 0,
      recentDiscoveries: [],
    };
  });

  /**
   * GET /api/autonomy/status - Autonomy engine status (LIVE)
   */
  fastify.get("/api/autonomy/status", async () => {
    try {
      const autonomy = getAutonomy();
      const status = autonomy.getStatus();
      return {
        ok: true,
        level: status.level,
        running: status.running,
        queue: {
          pending: status.queue.pending,
          approved: status.queue.approved,
          rejected: status.queue.rejected,
        },
        audit: status.audit,
        today: {
          autoExecuted: status.usage.actionsExecuted,
          queued: status.usage.actionsQueued,
          escalated: status.usage.escalations,
          cost: status.usage.spending,
          revenue: 0,
        },
        stats: {
          autoExecuted: status.executor.totalExecuted,
          queued: status.queue.pending,
          pending: status.queue.pending,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        level: 2,
        queue: { pending: 0, approved: 0, rejected: 0 },
        audit: { total: 0, auto: 0, queued: 0, escalated: 0, successRate: 100 },
        today: {
          autoExecuted: 0,
          queued: 0,
          escalated: 0,
          cost: 0,
          revenue: 0,
        },
        stats: { autoExecuted: 0, queued: 0, pending: 0 },
      };
    }
  });

  /**
   * GET /api/autonomy/queue - Get pending approval queue
   */
  fastify.get("/api/autonomy/queue", async () => {
    try {
      const autonomy = getAutonomy();
      return { ok: true, queue: autonomy.getQueue() };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        queue: [],
      };
    }
  });

  /**
   * POST /api/autonomy/approve/:id - Approve a pending request
   */
  fastify.post("/api/autonomy/approve/:id", async (request) => {
    try {
      const { id } = request.params;
      const autonomy = getAutonomy();
      const result = await autonomy.approve(id);
      return { ok: !!result, request: result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  /**
   * POST /api/autonomy/reject/:id - Reject a pending request
   */
  fastify.post("/api/autonomy/reject/:id", async (request) => {
    try {
      const { id } = request.params;
      const { reason } = request.body || {};
      const autonomy = getAutonomy();
      const result = await autonomy.reject(id, reason || "Rejected by user");
      return { ok: !!result, request: result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  /**
   * GET /api/autonomy/boundaries - Get current boundaries
   */
  fastify.get("/api/autonomy/boundaries", async () => {
    try {
      const autonomy = getAutonomy();
      return { ok: true, boundaries: autonomy.getBoundaries() };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // =========================================================================
  // HYPER BRAIN KNOWLEDGE ENDPOINTS (integrated into Hub)
  // =========================================================================

  /**
   * GET /api/brain/stats - Brain knowledge stats
   */
  fastify.get("/api/brain/stats", async () => {
    // TODO: Connect to HyperBrain when integrated
    // For now, return stats structure that dashboard expects
    return {
      ok: true,
      knowledge: {
        total: 0,
        bySource: {
          github: 0,
          hackernews: 0,
          twitter: 0,
          arxiv: 0,
          producthunt: 0,
        },
        byTopic: {},
        recent24h: 0,
      },
      patterns: {
        total: 0,
        byType: { correlation: 0, trend: 0, anomaly: 0, recurring: 0 },
        avgConfidence: 0,
      },
      predictions: {
        total: 0,
        pending: 0,
        accuracy: 0,
      },
      uptime: Date.now(),
      lastIngestion: 0,
    };
  });

  /**
   * GET /api/brain/recent - Recent knowledge items
   */
  fastify.get<{ Querystring: { limit?: string } }>(
    "/api/brain/recent",
    async (req) => {
      const limit = parseInt(req.query.limit || "20", 10);

      // TODO: Connect to HyperBrain knowledge store
      // For now, return empty array
      return {
        ok: true,
        items: [],
        count: 0,
        limit,
      };
    }
  );

  /**
   * GET /api/brain/patterns - Discovered patterns
   */
  fastify.get("/api/brain/patterns", async () => {
    // TODO: Connect to HyperBrain pattern discovery
    return {
      ok: true,
      patterns: [],
      count: 0,
    };
  });

  /**
   * GET /api/brain/predictions - Active predictions
   */
  fastify.get("/api/brain/predictions", async () => {
    // TODO: Connect to HyperBrain prediction engine
    return {
      ok: true,
      predictions: [],
      count: 0,
    };
  });

  /**
   * POST /api/brain/search - Search knowledge base
   */
  fastify.post<{ Body: { query: string; limit?: number } }>(
    "/api/brain/search",
    async (req) => {
      const { query, limit = 20 } = req.body;

      // TODO: Connect to HyperBrain semantic search
      return {
        ok: true,
        query,
        results: [],
        count: 0,
      };
    }
  );

  /**
   * POST /api/brain/ingest - Trigger knowledge ingestion
   */
  fastify.post<{ Body: { source?: string } }>(
    "/api/brain/ingest",
    async (req) => {
      const { source } = req.body;

      // TODO: Trigger actual ingestion
      hub.getEventBus().publish("brain", "brain.ingest_triggered", {
        source: source || "all",
      });

      return {
        ok: true,
        message: source
          ? `Ingestion triggered for ${source}`
          : "Full ingestion triggered",
      };
    }
  );

  // =========================================================================
  // EVENT ENDPOINTS
  // =========================================================================

  // Import event enrichment
  const { enrichEvents, getAllCategories, CATEGORY_ICONS } = await import(
    "../events/index.js"
  );

  /**
   * GET /api/events - Recent events (raw)
   */
  fastify.get<{ Querystring: { limit?: string; category?: string } }>(
    "/api/events",
    async (req) => {
      const limit = parseInt(req.query.limit || "50", 10);
      const category = req.query.category;

      let events;
      if (category) {
        events = hub.getEventBus().getEventsByCategory(category as any, limit);
      } else {
        events = hub.getEventBus().getRecentEvents(limit);
      }

      return {
        ok: true,
        count: events.length,
        events,
      };
    }
  );

  /**
   * GET /api/events/enriched - Recent events with enrichment (titles, icons, actions)
   */
  fastify.get<{
    Querystring: { limit?: string; category?: string; severity?: string };
  }>("/api/events/enriched", async (req) => {
    const limit = parseInt(req.query.limit || "50", 10);
    const category = req.query.category;
    const severity = req.query.severity;

    let events;
    if (category) {
      events = hub.getEventBus().getEventsByCategory(category as any, limit);
    } else {
      events = hub.getEventBus().getRecentEvents(limit);
    }

    // Enrich events
    let enriched = enrichEvents(events);

    // Filter by severity if specified
    if (severity) {
      enriched = enriched.filter((e) => e.severity === severity);
    }

    return {
      ok: true,
      count: enriched.length,
      events: enriched,
    };
  });

  /**
   * GET /api/events/categories - List available event categories
   */
  fastify.get("/api/events/categories", async () => {
    const categories = getAllCategories();
    return {
      ok: true,
      categories: categories.map((c) => ({
        id: c,
        name: c.charAt(0).toUpperCase() + c.slice(1),
        icon: CATEGORY_ICONS[c],
      })),
    };
  });

  // =========================================================================
  // DISCOVERY ENDPOINTS
  // =========================================================================

  /**
   * GET /api/backlog - Product backlog
   */
  fastify.get("/api/backlog", async () => {
    const productEngine = hub.getProductEngine();

    if (!productEngine) {
      return { ok: false, error: "Product engine not connected" };
    }

    const backlog = productEngine.getBacklog();
    return {
      ok: true,
      count: backlog.length,
      items: backlog,
    };
  });

  /**
   * POST /api/discovery/run - Run discovery
   */
  fastify.post("/api/discovery/run", async () => {
    const productEngine = hub.getProductEngine();

    if (!productEngine) {
      return { ok: false, error: "Product engine not connected" };
    }

    try {
      const opportunities = await productEngine.runDiscovery();
      return {
        ok: true,
        found: opportunities.length,
        opportunities,
      };
    } catch (error) {
      return { ok: false, error: "Discovery failed" };
    }
  });

  // =========================================================================
  // CONTENT ENDPOINTS
  // =========================================================================

  /**
   * POST /api/content/generate - Generate content
   */
  fastify.post<{ Body: { type: "blog" | "tweet" | "thread" } }>(
    "/api/content/generate",
    async (req) => {
      const growthEngine = hub.getGrowthEngine();

      if (!growthEngine) {
        return { ok: false, error: "Growth engine not connected" };
      }

      const { type } = req.body;

      try {
        await growthEngine.generateNow(type);
        const status = growthEngine.getStatus();

        return {
          ok: true,
          type,
          upcomingContent: status.upcomingContent,
        };
      } catch (error) {
        return { ok: false, error: "Content generation failed" };
      }
    }
  );

  // =========================================================================
  // PREDICTION MARKET ENDPOINTS
  // =========================================================================

  /**
   * GET /api/predictions/status - Prediction markets data
   */
  fastify.get("/api/predictions/status", async () => {
    try {
      const predictions = await aggregatePredictions();
      return predictions;
    } catch (error) {
      console.error("[PREDICTIONS] Error fetching predictions:", error);
      return {
        lastUpdated: new Date().toISOString(),
        sources: {
          polymarket: { active: false, marketCount: 0, totalVolume: 0 },
          kalshi: { active: false, marketCount: 0, totalVolume: 0 },
        },
        markets: { politics: [], crypto: [], trending: [] },
        stats: { totalMarkets: 0, totalVolume24h: 0, topMoverPercent: 0 },
      };
    }
  });

  // Also register at /api/v1/predictions/status for dashboard compatibility
  fastify.get("/api/v1/predictions/status", async () => {
    try {
      const predictions = await aggregatePredictions();
      return predictions;
    } catch (error) {
      console.error("[PREDICTIONS] Error fetching predictions:", error);
      return {
        lastUpdated: new Date().toISOString(),
        sources: {
          polymarket: { active: false, marketCount: 0, totalVolume: 0 },
          kalshi: { active: false, marketCount: 0, totalVolume: 0 },
        },
        markets: { politics: [], crypto: [], trending: [] },
        stats: { totalMarkets: 0, totalVolume24h: 0, topMoverPercent: 0 },
      };
    }
  });

  // =========================================================================
  // PIPELINE EXECUTION ENDPOINTS (PTC)
  // =========================================================================

  // In-memory pipeline execution store (in production, use Redis/DB)
  const pipelineExecutions = new Map<string, PipelineExecution>();

  interface PipelineExecution {
    id: string;
    pipelineId: string;
    pipelineName: string;
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    progress: number; // 0-100
    currentStep: string | null;
    steps: StepProgress[];
    startedAt: number;
    completedAt: number | null;
    result: any | null;
    error: string | null;
  }

  interface StepProgress {
    id: string;
    name: string;
    status: "pending" | "running" | "completed" | "failed" | "skipped";
    startedAt: number | null;
    completedAt: number | null;
    output: any | null;
    error: string | null;
  }

  /**
   * POST /api/pipelines/execute - Execute a pipeline
   */
  fastify.post<{
    Body: {
      pipeline: {
        id: string;
        name: string;
        description?: string;
        steps: Array<{
          id: string;
          tool: string;
          name?: string;
          inputs: Record<string, unknown>;
          dependsOn?: string[];
          condition?: string;
        }>;
      };
      inputs?: Record<string, unknown>;
    };
  }>("/api/pipelines/execute", async (req) => {
    const { pipeline, inputs = {} } = req.body;
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Initialize execution record
    const execution: PipelineExecution = {
      id: executionId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      status: "pending",
      progress: 0,
      currentStep: null,
      steps: pipeline.steps.map((s) => ({
        id: s.id,
        name: s.name || s.tool,
        status: "pending",
        startedAt: null,
        completedAt: null,
        output: null,
        error: null,
      })),
      startedAt: Date.now(),
      completedAt: null,
      result: null,
      error: null,
    };

    pipelineExecutions.set(executionId, execution);

    // Emit pipeline:started event
    hub.getEventBus().publish("pipeline", "pipeline.started", {
      executionId,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      stepCount: pipeline.steps.length,
    });

    // Start async execution
    executePipelineAsync(execution, pipeline, inputs, hub.getEventBus());

    return {
      ok: true,
      executionId,
      message: "Pipeline execution started",
    };
  });

  /**
   * GET /api/pipelines/:executionId/status - Get pipeline execution status
   */
  fastify.get<{ Params: { executionId: string } }>(
    "/api/pipelines/:executionId/status",
    async (req) => {
      const { executionId } = req.params;
      const execution = pipelineExecutions.get(executionId);

      if (!execution) {
        return {
          ok: false,
          error: `Execution not found: ${executionId}`,
        };
      }

      return {
        ok: true,
        execution: {
          id: execution.id,
          pipelineId: execution.pipelineId,
          pipelineName: execution.pipelineName,
          status: execution.status,
          progress: execution.progress,
          currentStep: execution.currentStep,
          steps: execution.steps,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          duration: execution.completedAt
            ? execution.completedAt - execution.startedAt
            : Date.now() - execution.startedAt,
          result: execution.result,
          error: execution.error,
        },
      };
    }
  );

  /**
   * GET /api/pipelines/executions - List all pipeline executions
   */
  fastify.get<{ Querystring: { limit?: string; status?: string } }>(
    "/api/pipelines/executions",
    async (req) => {
      const limit = parseInt(req.query.limit || "20", 10);
      const statusFilter = req.query.status;

      let executions = Array.from(pipelineExecutions.values());

      if (statusFilter) {
        executions = executions.filter((e) => e.status === statusFilter);
      }

      // Sort by most recent first
      executions.sort((a, b) => b.startedAt - a.startedAt);

      return {
        ok: true,
        total: executions.length,
        executions: executions.slice(0, limit).map((e) => ({
          id: e.id,
          pipelineId: e.pipelineId,
          pipelineName: e.pipelineName,
          status: e.status,
          progress: e.progress,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          duration: e.completedAt
            ? e.completedAt - e.startedAt
            : Date.now() - e.startedAt,
        })),
      };
    }
  );

  /**
   * POST /api/pipelines/:executionId/cancel - Cancel a running pipeline
   */
  fastify.post<{ Params: { executionId: string } }>(
    "/api/pipelines/:executionId/cancel",
    async (req) => {
      const { executionId } = req.params;
      const execution = pipelineExecutions.get(executionId);

      if (!execution) {
        return { ok: false, error: `Execution not found: ${executionId}` };
      }

      if (execution.status !== "running" && execution.status !== "pending") {
        return {
          ok: false,
          error: `Cannot cancel execution with status: ${execution.status}`,
        };
      }

      execution.status = "cancelled";
      execution.completedAt = Date.now();

      hub.getEventBus().publish("pipeline", "pipeline.cancelled", {
        executionId,
        pipelineId: execution.pipelineId,
      });

      return { ok: true, message: "Pipeline cancelled" };
    }
  );

  // Helper function to execute pipeline asynchronously
  async function executePipelineAsync(
    execution: PipelineExecution,
    pipeline: any,
    inputs: Record<string, unknown>,
    eventBus: any
  ): Promise<void> {
    try {
      execution.status = "running";

      const results: Record<string, unknown> = {};
      const completedSteps = new Set<string>();
      const totalSteps = pipeline.steps.length;

      for (let i = 0; i < pipeline.steps.length; i++) {
        // Check if cancelled
        if (execution.status === "cancelled") {
          return;
        }

        const step = pipeline.steps[i];
        const stepRecord = execution.steps.find(
          (s: StepProgress) => s.id === step.id
        )!;

        // Check dependencies
        if (step.dependsOn?.length) {
          const depsOk = step.dependsOn.every((dep: string) =>
            completedSteps.has(dep)
          );
          if (!depsOk) {
            stepRecord.status = "skipped";
            stepRecord.error = "Dependencies not met";
            eventBus.publish("pipeline", "pipeline.step_skipped", {
              executionId: execution.id,
              stepId: step.id,
              reason: "Dependencies not met",
            });
            continue;
          }
        }

        // Start step
        execution.currentStep = step.id;
        stepRecord.status = "running";
        stepRecord.startedAt = Date.now();

        eventBus.publish("pipeline", "pipeline.step_started", {
          executionId: execution.id,
          stepId: step.id,
          tool: step.tool,
        });

        try {
          // Simulate step execution (in real impl, call PTC Coordinator)
          await simulateStepExecution(step, inputs, results);

          stepRecord.status = "completed";
          stepRecord.completedAt = Date.now();
          stepRecord.output = { success: true, tool: step.tool };
          completedSteps.add(step.id);
          results[step.id] = stepRecord.output;

          eventBus.publish("pipeline", "pipeline.step_completed", {
            executionId: execution.id,
            stepId: step.id,
            duration: stepRecord.completedAt - (stepRecord.startedAt || 0),
          });
        } catch (error) {
          stepRecord.status = "failed";
          stepRecord.completedAt = Date.now();
          stepRecord.error =
            error instanceof Error ? error.message : String(error);

          eventBus.publish("pipeline", "pipeline.step_failed", {
            executionId: execution.id,
            stepId: step.id,
            error: stepRecord.error,
          });
        }

        // Update progress
        execution.progress = Math.round(((i + 1) / totalSteps) * 100);
      }

      // Complete
      execution.status = execution.steps.some(
        (s: StepProgress) => s.status === "failed"
      )
        ? "failed"
        : "completed";
      execution.completedAt = Date.now();
      execution.currentStep = null;
      execution.result = results;

      eventBus.publish("pipeline", "pipeline.completed", {
        executionId: execution.id,
        pipelineId: execution.pipelineId,
        status: execution.status,
        duration: execution.completedAt - execution.startedAt,
      });
    } catch (error) {
      execution.status = "failed";
      execution.completedAt = Date.now();
      execution.error = error instanceof Error ? error.message : String(error);

      eventBus.publish("pipeline", "pipeline.failed", {
        executionId: execution.id,
        pipelineId: execution.pipelineId,
        error: execution.error,
      });
    }
  }

  // Simulate step execution (placeholder - would call actual PTC Coordinator)
  async function simulateStepExecution(
    step: any,
    inputs: Record<string, unknown>,
    results: Record<string, unknown>
  ): Promise<void> {
    // Simulate 500-2000ms execution time
    const delay = 500 + Math.random() * 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error(`Step ${step.id} failed: simulated error`);
    }
  }

  // =========================================================================
  // ANALYTICS ENDPOINTS
  // =========================================================================

  // Import analytics manager (late import to avoid circular deps)
  const { getAnalyticsManager } = await import("../analytics.js");
  const analytics = getAnalyticsManager();

  // Hook up pipeline executions to analytics
  // When pipeline starts, track in analytics
  hub
    .getEventBus()
    .subscribe("pipeline", "pipeline.started", async (data: any) => {
      const exec = pipelineExecutions.get(data.executionId);
      if (exec) {
        analytics.startExecution(
          exec.pipelineId,
          exec.pipelineName,
          exec.steps.length
        );
      }
    });

  // When step completes, record in analytics
  hub
    .getEventBus()
    .subscribe("pipeline", "pipeline.step_completed", async (data: any) => {
      const exec = pipelineExecutions.get(data.executionId);
      if (exec) {
        const step = exec.steps.find((s: StepProgress) => s.id === data.stepId);
        if (step) {
          // Simulate token usage (in production, get from actual LLM call)
          analytics.recordStep(
            data.executionId,
            data.stepId,
            step.name,
            "completed",
            {
              input: 500 + Math.random() * 500,
              output: 200 + Math.random() * 300,
              total: 0,
            }
          );
        }
      }
    });

  // When pipeline completes, finalize analytics
  hub
    .getEventBus()
    .subscribe("pipeline", "pipeline.completed", async (data: any) => {
      analytics.completeExecution(
        data.executionId,
        data.status === "completed" ? "completed" : "failed"
      );
    });

  /**
   * GET /api/analytics/summary - Get analytics summary
   */
  fastify.get<{ Querystring: { period?: string } }>(
    "/api/analytics/summary",
    async (req) => {
      const period = (req.query.period || "week") as "day" | "week" | "month";
      const summary = analytics.getSummary(period);

      return {
        ok: true,
        summary,
      };
    }
  );

  /**
   * GET /api/analytics/executions - Get recent execution analytics
   */
  fastify.get<{ Querystring: { limit?: string; pipelineId?: string } }>(
    "/api/analytics/executions",
    async (req) => {
      const limit = parseInt(req.query.limit || "50", 10);
      const pipelineId = req.query.pipelineId;

      let executions;
      if (pipelineId) {
        executions = analytics.getExecutionsByPipeline(pipelineId, limit);
      } else {
        executions = analytics.getRecentExecutions(limit);
      }

      return {
        ok: true,
        count: executions.length,
        executions,
      };
    }
  );

  /**
   * GET /api/analytics/daily - Get daily statistics
   */
  fastify.get<{ Querystring: { date?: string } }>(
    "/api/analytics/daily",
    async (req) => {
      const date = req.query.date;
      const stats = analytics.getDailyStats(date);

      if (!stats) {
        return {
          ok: true,
          stats: null,
          message: "No data for this date",
        };
      }

      return {
        ok: true,
        stats,
      };
    }
  );

  /**
   * GET /api/analytics/tokens - Get token usage breakdown
   */
  fastify.get<{ Querystring: { period?: string } }>(
    "/api/analytics/tokens",
    async (req) => {
      const period = (req.query.period || "week") as "day" | "week" | "month";
      const breakdown = analytics.getTokenUsageBreakdown(period);

      return {
        ok: true,
        period,
        ...breakdown,
      };
    }
  );

  /**
   * GET /api/analytics/costs - Get cost breakdown
   */
  fastify.get<{ Querystring: { period?: string } }>(
    "/api/analytics/costs",
    async (req) => {
      const period = (req.query.period || "week") as "day" | "week" | "month";
      const summary = analytics.getSummary(period);

      return {
        ok: true,
        period,
        totalCost: summary.totalCost,
        costTrend: summary.costTrend,
        avgCostPerExecution:
          summary.totalExecutions > 0
            ? summary.totalCost / summary.totalExecutions
            : 0,
        topCostPipelines: summary.topPipelines.map((p) => ({
          id: p.id,
          name: p.name,
          executions: p.count,
        })),
      };
    }
  );

  /**
   * GET /api/analytics/success-rate - Get success rate metrics
   */
  fastify.get<{ Querystring: { period?: string } }>(
    "/api/analytics/success-rate",
    async (req) => {
      const period = (req.query.period || "week") as "day" | "week" | "month";
      const summary = analytics.getSummary(period);

      return {
        ok: true,
        period,
        overall: {
          successRate: summary.successRate,
          totalExecutions: summary.totalExecutions,
        },
        byPipeline: summary.topPipelines.map((p) => ({
          id: p.id,
          name: p.name,
          successRate: p.successRate,
          executions: p.count,
        })),
        trend: summary.executionTrend,
      };
    }
  );

  // =========================================================================
  // WEBHOOK MANAGEMENT ENDPOINTS
  // =========================================================================

  // Import webhook manager (late import to avoid circular deps)
  const { getWebhookManager } = await import("../notifications/webhooks.js");
  const webhookManager = getWebhookManager();
  await webhookManager.initialize();

  /**
   * GET /api/webhooks - List all webhooks
   */
  fastify.get("/api/webhooks", async () => {
    const webhooks = webhookManager.getWebhooks();
    return {
      ok: true,
      count: webhooks.length,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        events: w.events,
        enabled: w.enabled,
        lastTriggeredAt: w.lastTriggeredAt,
        lastStatus: w.lastStatus,
        failureCount: w.failureCount,
        createdAt: w.createdAt,
      })),
    };
  });

  /**
   * GET /api/webhooks/:id - Get webhook by ID
   */
  fastify.get<{ Params: { id: string } }>(
    "/api/webhooks/:id",
    async (req, reply) => {
      const webhook = webhookManager.getWebhook(req.params.id);

      if (!webhook) {
        reply.code(404);
        return { ok: false, error: "Webhook not found" };
      }

      return {
        ok: true,
        webhook: {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          enabled: webhook.enabled,
          retryCount: webhook.retryCount,
          timeoutMs: webhook.timeoutMs,
          lastTriggeredAt: webhook.lastTriggeredAt,
          lastStatus: webhook.lastStatus,
          failureCount: webhook.failureCount,
          metadata: webhook.metadata,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt,
        },
      };
    }
  );

  /**
   * POST /api/webhooks - Create a new webhook
   */
  fastify.post<{
    Body: {
      name: string;
      url: string;
      secret?: string;
      events?: string[];
      enabled?: boolean;
      retryCount?: number;
      timeoutMs?: number;
      metadata?: Record<string, unknown>;
    };
  }>("/api/webhooks", async (req, reply) => {
    const {
      name,
      url,
      secret,
      events,
      enabled,
      retryCount,
      timeoutMs,
      metadata,
    } = req.body;

    if (!name || !url) {
      reply.code(400);
      return { ok: false, error: "name and url are required" };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      reply.code(400);
      return { ok: false, error: "Invalid URL" };
    }

    // Generate secret if not provided
    const webhookSecret =
      secret ||
      `whsec_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

    const webhook = await webhookManager.registerWebhook({
      name,
      url,
      secret: webhookSecret,
      events: (events as any) || ["pipeline.completed"],
      enabled: enabled !== false,
      retryCount: retryCount || 3,
      timeoutMs: timeoutMs || 5000,
      metadata: metadata || {},
    });

    return {
      ok: true,
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        secret: webhook.secret, // Include secret only on creation
        events: webhook.events,
        enabled: webhook.enabled,
        createdAt: webhook.createdAt,
      },
    };
  });

  /**
   * PATCH /api/webhooks/:id - Update a webhook
   */
  fastify.patch<{
    Params: { id: string };
    Body: {
      name?: string;
      url?: string;
      events?: string[];
      enabled?: boolean;
      retryCount?: number;
      timeoutMs?: number;
      metadata?: Record<string, unknown>;
    };
  }>("/api/webhooks/:id", async (req, reply) => {
    const existing = webhookManager.getWebhook(req.params.id);

    if (!existing) {
      reply.code(404);
      return { ok: false, error: "Webhook not found" };
    }

    // Validate URL if provided
    if (req.body.url) {
      try {
        new URL(req.body.url);
      } catch {
        reply.code(400);
        return { ok: false, error: "Invalid URL" };
      }
    }

    const updated = webhookManager.updateWebhook(req.params.id, {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.url && { url: req.body.url }),
      ...(req.body.events && { events: req.body.events as any }),
      ...(req.body.enabled !== undefined && { enabled: req.body.enabled }),
      ...(req.body.retryCount && { retryCount: req.body.retryCount }),
      ...(req.body.timeoutMs && { timeoutMs: req.body.timeoutMs }),
      ...(req.body.metadata && { metadata: req.body.metadata }),
    });

    return {
      ok: true,
      webhook: {
        id: updated!.id,
        name: updated!.name,
        url: updated!.url,
        events: updated!.events,
        enabled: updated!.enabled,
        updatedAt: updated!.updatedAt,
      },
    };
  });

  /**
   * DELETE /api/webhooks/:id - Delete a webhook
   */
  fastify.delete<{ Params: { id: string } }>(
    "/api/webhooks/:id",
    async (req, reply) => {
      const existing = webhookManager.getWebhook(req.params.id);

      if (!existing) {
        reply.code(404);
        return { ok: false, error: "Webhook not found" };
      }

      webhookManager.removeWebhook(req.params.id);

      return {
        ok: true,
        message: "Webhook deleted",
      };
    }
  );

  /**
   * POST /api/webhooks/:id/test - Test a webhook
   */
  fastify.post<{ Params: { id: string } }>(
    "/api/webhooks/:id/test",
    async (req, reply) => {
      const webhook = webhookManager.getWebhook(req.params.id);

      if (!webhook) {
        reply.code(404);
        return { ok: false, error: "Webhook not found" };
      }

      // Send test payload
      await webhookManager.triggerPipelineEvent("pipeline.completed", {
        id: `test_${Date.now()}`,
        pipelineId: "test-pipeline",
        pipelineName: "Test Pipeline",
        status: "completed",
        startTime: Date.now() - 5000,
        endTime: Date.now(),
        duration: 5000,
        steps: [],
        cost: {
          total: 0.01,
          breakdown: { llm: 0.01, api: 0, compute: 0 },
          currency: "USD",
        },
        tokens: { input: 1000, output: 500, total: 1500 },
      });

      return {
        ok: true,
        message: "Test webhook triggered",
      };
    }
  );

  // =========================================================================
  // QUEUE MANAGEMENT ENDPOINTS
  // =========================================================================

  // Import queue (late import to avoid circular deps)
  const { getPipelineQueue, createPipelineWorker } = await import(
    "../queue/index.js"
  );
  const queue = await getPipelineQueue();
  createPipelineWorker(queue, { analytics });

  /**
   * GET /api/queue/stats - Get queue statistics
   */
  fastify.get("/api/queue/stats", async () => {
    const stats = queue.getStats();
    return {
      ok: true,
      stats,
    };
  });

  /**
   * POST /api/queue/jobs - Add a job to the queue
   */
  fastify.post<{
    Body: {
      pipelineId: string;
      pipelineName: string;
      inputs?: Record<string, unknown>;
      steps: Array<{
        id: string;
        tool: string;
        inputs?: Record<string, unknown>;
        dependsOn?: string[];
      }>;
      priority?: string;
      webhookUrl?: string;
    };
  }>("/api/queue/jobs", async (req, reply) => {
    const { pipelineId, pipelineName, inputs, steps, priority, webhookUrl } =
      req.body;

    if (!pipelineId || !pipelineName || !steps || steps.length === 0) {
      reply.code(400);
      return {
        ok: false,
        error: "pipelineId, pipelineName, and steps are required",
      };
    }

    const jobId = await queue.addJob({
      pipelineId,
      pipelineName,
      inputs: inputs || {},
      steps,
      priority: (priority as any) || "normal",
      webhookUrl,
    });

    return {
      ok: true,
      jobId,
      message: "Job added to queue",
    };
  });

  /**
   * GET /api/queue/jobs/:id - Get job status
   */
  fastify.get<{ Params: { id: string } }>(
    "/api/queue/jobs/:id",
    async (req, reply) => {
      const progress = queue.getProgress(req.params.id);

      if (!progress) {
        reply.code(404);
        return { ok: false, error: "Job not found" };
      }

      const job = queue.getJob(req.params.id);

      return {
        ok: true,
        job: job
          ? {
              id: job.id,
              pipelineId: job.pipelineId,
              pipelineName: job.pipelineName,
              priority: job.priority,
            }
          : null,
        progress,
      };
    }
  );

  /**
   * POST /api/queue/pause - Pause the queue
   */
  fastify.post("/api/queue/pause", async () => {
    await queue.pause();
    return { ok: true, message: "Queue paused" };
  });

  /**
   * POST /api/queue/resume - Resume the queue
   */
  fastify.post("/api/queue/resume", async () => {
    await queue.resume();
    return { ok: true, message: "Queue resumed" };
  });
}
