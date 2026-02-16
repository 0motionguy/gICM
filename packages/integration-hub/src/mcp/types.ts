/**
 * MCP Gateway Types
 *
 * Type definitions for the MCP-to-REST gateway that lets
 * OpenClaw agents call MCP tools via HTTP.
 */

import { z } from "zod";

// ============================================================================
// Server Configuration
// ============================================================================

export const MCPServerConfigSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).default([]),
  env: z.record(z.string()).default({}),
  eager: z.boolean().default(false),
  idleTimeout: z.number().default(30_000),
});

export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;

export const MCPConfigFileSchema = z.object({
  servers: z.record(MCPServerConfigSchema),
});

export type MCPConfigFile = z.infer<typeof MCPConfigFileSchema>;

// ============================================================================
// Tool Definitions (from MCP servers)
// ============================================================================

export interface MCPToolDefinition {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface MCPToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// ============================================================================
// Server Status
// ============================================================================

export type MCPServerStatus =
  | "stopped"
  | "starting"
  | "running"
  | "error"
  | "restarting";

export interface MCPServerInfo {
  name: string;
  status: MCPServerStatus;
  tools: MCPToolDefinition[];
  pid?: number;
  startedAt?: number;
  lastUsed?: number;
  restartCount: number;
  error?: string;
}

// ============================================================================
// Gateway Status
// ============================================================================

export interface MCPGatewayStatus {
  timestamp: number;
  servers: MCPServerInfo[];
  stats: {
    totalServers: number;
    running: number;
    stopped: number;
    errors: number;
    totalTools: number;
    totalCalls: number;
  };
}

// ============================================================================
// JSON-RPC 2.0 Protocol
// ============================================================================

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
  id: number;
}

// ============================================================================
// API Request/Response
// ============================================================================

export const MCPToolCallRequestSchema = z.object({
  arguments: z.record(z.unknown()).default({}),
});

export type MCPToolCallRequest = z.infer<typeof MCPToolCallRequestSchema>;
