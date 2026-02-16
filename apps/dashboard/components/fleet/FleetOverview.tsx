"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FleetStatus } from "@/types/fleet";

interface FleetOverviewProps {
  status: FleetStatus;
}

export function FleetOverview({ status }: FleetOverviewProps) {
  const onlineNodes = status.nodes.filter((n) => n.status === "online").length;
  const degradedNodes = status.nodes.filter(
    (n) => n.status === "degraded"
  ).length;
  const offlineNodes = status.nodes.filter(
    (n) => n.status === "offline"
  ).length;
  const runningMCPs = status.mcpServers.filter(
    (s) => s.status === "running"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Active Nodes"
        value={onlineNodes}
        subtitle={`of ${status.nodes.length} total`}
        color="text-green-400"
      />
      <StatCard
        title="Degraded"
        value={degradedNodes}
        subtitle="nodes need attention"
        color="text-yellow-400"
      />
      <StatCard
        title="Offline"
        value={offlineNodes}
        subtitle="nodes unreachable"
        color="text-red-400"
      />
      <StatCard
        title="MCP Servers"
        value={runningMCPs}
        subtitle={`of ${status.mcpServers.length} available`}
        color="text-gicm-primary"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: string;
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  return (
    <Card className="border-gicm-border bg-gicm-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
