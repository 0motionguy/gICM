import { Suspense } from "react";
import { fetchFleetStatus, getMockFleetStatus } from "@/lib/api/fleet";
import {
  FleetOverview,
  NodeCard,
  MCPServersCard,
  UptimeCard,
} from "@/components/fleet";

async function FleetDashboard() {
  const response = await fetchFleetStatus();

  // Use mock data if API is unavailable (dev mode)
  const status =
    response.success && response.data ? response.data : getMockFleetStatus();
  const isLive = response.success;

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {!isLive && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-sm text-yellow-500">
            Fleet API unreachable - showing cached data
          </span>
        </div>
      )}

      {/* Overview Stats */}
      <FleetOverview status={status} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Nodes Section - 2 columns */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Active Nodes</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {status.nodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>

        {/* Sidebar - Uptime & Quick Stats */}
        <div className="space-y-4">
          <UptimeCard uptime={status.uptime} lastUpdated={status.lastUpdated} />
          <MCPServersCard servers={status.mcpServers} />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-gicm-border bg-gicm-card"
          />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-6 w-32 rounded bg-gicm-card" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-lg border border-gicm-border bg-gicm-card"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-32 rounded-lg border border-gicm-border bg-gicm-card" />
          <div className="h-64 rounded-lg border border-gicm-border bg-gicm-card" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">AWCN Fleet Dashboard</h1>
        <p className="mt-1 text-gray-400">
          Real-time monitoring of your AI Worker Compute Network
        </p>
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<LoadingSkeleton />}>
        <FleetDashboard />
      </Suspense>
    </main>
  );
}
