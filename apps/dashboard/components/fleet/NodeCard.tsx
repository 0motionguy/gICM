"use client";

import type { FleetNode } from "@/types/fleet";
import { NODE_STATUS_COLORS } from "@/types/fleet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NodeCardProps {
  node: FleetNode;
}

export function NodeCard({ node }: NodeCardProps) {
  const statusColor = NODE_STATUS_COLORS[node.status];
  const lastSeenDate = new Date(node.lastSeen);
  const timeSinceLastSeen = getTimeSinceLastSeen(lastSeenDate);

  return (
    <Card className="border-gicm-border bg-gicm-card transition-colors hover:border-gicm-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            {node.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${statusColor} animate-pulse`}
            />
            <span className="text-sm capitalize text-gray-400">
              {node.status}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resource Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">CPU</span>
            <span className="text-white">{node.cpuUsage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all ${getUsageColor(node.cpuUsage)}`}
              style={{ width: `${node.cpuUsage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Memory</span>
            <span className="text-white">{node.memoryUsage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all ${getUsageColor(node.memoryUsage)}`}
              style={{ width: `${node.memoryUsage}%` }}
            />
          </div>
        </div>

        {/* MCP Servers */}
        <div className="border-t border-gicm-border pt-2">
          <span className="text-xs uppercase tracking-wider text-gray-500">
            MCP Servers
          </span>
          <div className="mt-2 flex flex-wrap gap-1">
            {node.mcpServers.map((server) => (
              <span
                key={server}
                className="rounded-full bg-gicm-primary/20 px-2 py-0.5 text-xs text-gicm-primary"
              >
                {server}
              </span>
            ))}
          </div>
        </div>

        {/* Last Seen */}
        <div className="text-xs text-gray-500">
          Last seen: {timeSinceLastSeen}
        </div>
      </CardContent>
    </Card>
  );
}

function getUsageColor(usage: number): string {
  if (usage >= 80) return "bg-red-500";
  if (usage >= 60) return "bg-yellow-500";
  return "bg-green-500";
}

function getTimeSinceLastSeen(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
