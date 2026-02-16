import { Suspense } from "react";
import { StatCard, NodeList, ServerList } from "@/components";

interface FleetNode {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded";
}

interface MCPServer {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
}

interface FleetStatus {
  nodes: FleetNode[];
  mcpServers: MCPServer[];
  uptime: number;
  lastUpdated: string;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-lg bg-gray-800" />
        <div className="h-64 rounded-lg bg-gray-800" />
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <section className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-red-400">
        Error
      </h2>
      <p className="mt-2 text-red-300">{message}</p>
    </section>
  );
}

async function FleetDashboard() {
  try {
    const response = await fetch("http://localhost:3100/api/fleet/status", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: FleetStatus = await response.json();
    const activeNodes = data.nodes.filter((n) => n.status === "online");
    const runningServers = data.mcpServers.filter(
      (s) => s.status === "running"
    );

    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Nodes"
            value={data.nodes.length}
            subtitle={`${activeNodes.length} online`}
          />
          <StatCard
            title="MCP Servers"
            value={data.mcpServers.length}
            subtitle={`${runningServers.length} running`}
          />
          <StatCard title="System Uptime" value={formatUptime(data.uptime)} />
          <StatCard
            title="Last Updated"
            value={new Date(data.lastUpdated).toLocaleTimeString()}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NodeList nodes={data.nodes} />
          <ServerList servers={data.mcpServers} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <ErrorCard
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Fleet Dashboard</h1>
          <p className="mt-1 text-gray-400">
            Real-time monitoring of your AI Worker Compute Network
          </p>
        </header>

        <Suspense fallback={<LoadingSkeleton />}>
          <FleetDashboard />
        </Suspense>
      </div>
    </main>
  );
}
