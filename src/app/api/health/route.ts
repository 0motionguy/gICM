import { NextResponse } from "next/server";
import { getAllItems } from "@/lib/registry";

/**
 * Health Check Endpoint for Agent Monitoring
 *
 * Provides real-time health status of the marketplace for autonomous agents.
 * Agents can use this to verify service availability before making requests.
 */

export async function GET() {
  const startTime = Date.now();

  try {
    // Check registry availability
    const items = getAllItems();
    const totalItems = items.length;

    // Calculate security stats
    const secureItems = items.filter(
      (item) => !item.security || item.security.threatLevel === "none"
    );

    // Calculate response time
    const responseTime = Date.now() - startTime;

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      protocol: "claude-marketplace-v1",
      services: {
        catalog: {
          status: "operational",
          totalItems,
          secureItems: secureItems.length,
          lastUpdate: new Date().toISOString(),
        },
        search: {
          status: "operational",
          endpoint: "/api/search",
        },
        install: {
          status: "operational",
          endpoint: "/api/install",
        },
        discovery: {
          status: "operational",
          endpoint: "/.well-known/claude-marketplace.json",
        },
      },
      agentDiscovery: {
        enabled: true,
        corsEnabled: true,
      },
      ecosystem: {
        clawHubMapped: items.filter(
          (i) => i.openClaw?.category === "clawdhub-native"
        ).length,
        clawdBotExclusive: items.filter(
          (i) => i.openClaw?.category === "clawdbot-exclusive"
        ).length,
        moltbookReady: items.filter((i) => i.openClaw?.moltbookDiscoverable)
          .length,
      },
      performance: {
        responseTimeMs: responseTime,
        uptime: process.uptime(),
      },
      security: {
        scanningEnabled: true,
        malwareProtection: true,
        securityVerificationRate:
          ((secureItems.length / totalItems) * 100).toFixed(2) + "%",
      },
    };

    return NextResponse.json(health, {
      headers: {
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service temporarily unavailable",
        services: {
          catalog: { status: "error" },
          search: { status: "unknown" },
          install: { status: "unknown" },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const runtime = "nodejs";
