/**
 * Fleet API Client
 * Fetches data from AWCN Fleet API with proper error handling
 */

import type { FleetStatus, FleetApiResponse } from "@/types/fleet";

const FLEET_API_BASE = "http://localhost:3100/api/fleet";

export async function fetchFleetStatus(): Promise<FleetApiResponse> {
  try {
    const response = await fetch(`${FLEET_API_BASE}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 5 }, // Revalidate every 5 seconds
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as FleetStatus;
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch fleet status",
    };
  }
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Mock data for development when API is unavailable
export function getMockFleetStatus(): FleetStatus {
  return {
    nodes: [
      {
        id: "node-1",
        name: "gICM-Primary",
        status: "online",
        lastSeen: new Date().toISOString(),
        cpuUsage: 45,
        memoryUsage: 62,
        mcpServers: ["github", "filesystem", "supabase"],
      },
      {
        id: "node-2",
        name: "gICM-Worker-01",
        status: "online",
        lastSeen: new Date().toISOString(),
        cpuUsage: 23,
        memoryUsage: 41,
        mcpServers: ["memory", "postgres"],
      },
      {
        id: "node-3",
        name: "gICM-Analytics",
        status: "degraded",
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        cpuUsage: 89,
        memoryUsage: 78,
        mcpServers: ["clickhouse"],
      },
    ],
    mcpServers: [
      {
        id: "mcp-1",
        name: "github",
        status: "running",
        nodeId: "node-1",
        connections: 12,
      },
      {
        id: "mcp-2",
        name: "filesystem",
        status: "running",
        nodeId: "node-1",
        connections: 45,
      },
      {
        id: "mcp-3",
        name: "supabase",
        status: "running",
        nodeId: "node-1",
        connections: 8,
      },
      {
        id: "mcp-4",
        name: "memory",
        status: "running",
        nodeId: "node-2",
        connections: 3,
      },
      {
        id: "mcp-5",
        name: "postgres",
        status: "running",
        nodeId: "node-2",
        connections: 15,
      },
      {
        id: "mcp-6",
        name: "clickhouse",
        status: "error",
        nodeId: "node-3",
        connections: 0,
      },
    ],
    uptime: 432000, // 5 days
    lastUpdated: new Date().toISOString(),
  };
}
