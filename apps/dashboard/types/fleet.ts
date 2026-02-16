/**
 * Fleet API Types - TypeScript strict mode
 * Types for AWCN Fleet status and node management
 */

export interface FleetNode {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded";
  lastSeen: string;
  cpuUsage: number;
  memoryUsage: number;
  mcpServers: string[];
}

export interface MCPServer {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
  nodeId: string;
  connections: number;
}

export interface FleetStatus {
  nodes: FleetNode[];
  mcpServers: MCPServer[];
  uptime: number;
  lastUpdated: string;
}

export interface FleetApiResponse {
  success: boolean;
  data?: FleetStatus;
  error?: string;
}

export type NodeStatusColor = {
  [K in FleetNode["status"]]: string;
};

export const NODE_STATUS_COLORS: NodeStatusColor = {
  online: "bg-green-500",
  offline: "bg-red-500",
  degraded: "bg-yellow-500",
} as const;

export const MCP_STATUS_COLORS = {
  running: "bg-green-500",
  stopped: "bg-gray-500",
  error: "bg-red-500",
} as const;
