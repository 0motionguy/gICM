"use client";

import type { MCPServer } from "@/types/fleet";
import { MCP_STATUS_COLORS } from "@/types/fleet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MCPServersCardProps {
  servers: MCPServer[];
}

export function MCPServersCard({ servers }: MCPServersCardProps) {
  const runningCount = servers.filter((s) => s.status === "running").length;
  const totalConnections = servers.reduce((sum, s) => sum + s.connections, 0);

  return (
    <Card className="border-gicm-border bg-gicm-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">MCP Servers</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              <span className="font-semibold text-green-400">
                {runningCount}
              </span>
              /{servers.length} running
            </span>
            <span className="text-gray-400">
              <span className="font-semibold text-gicm-primary">
                {totalConnections}
              </span>{" "}
              connections
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between rounded-lg border border-gicm-border bg-gicm-dark/50 p-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${MCP_STATUS_COLORS[server.status]}`}
                />
                <span className="font-medium text-white">{server.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">{server.nodeId}</span>
                <span className="text-gicm-primary">
                  {server.connections} conn
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
