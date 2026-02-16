/**
 * MCP Process Manager
 *
 * Manages all MCP server connections. Handles lazy startup,
 * idle timeout, auto-restart, and status aggregation.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EventEmitter } from "eventemitter3";
import { MCPConnection } from "./connection.js";
import { MCPConfigFileSchema } from "./types.js";
import type {
  MCPServerConfig,
  MCPServerInfo,
  MCPGatewayStatus,
  MCPToolDefinition,
  MCPToolResult,
} from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface MCPManagerEvents {
  "server:started": (name: string) => void;
  "server:stopped": (name: string) => void;
  "server:error": (name: string, error: Error) => void;
  "tool:called": (server: string, tool: string, durationMs: number) => void;
}

let instance: MCPProcessManager | null = null;

export function getMCPManager(): MCPProcessManager {
  if (!instance) {
    instance = new MCPProcessManager();
  }
  return instance;
}

export class MCPProcessManager extends EventEmitter<MCPManagerEvents> {
  private connections = new Map<string, MCPConnection>();
  private configs = new Map<string, MCPServerConfig>();
  private idleTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private totalCalls = 0;
  private configPath: string;

  constructor(configPath?: string) {
    super();
    this.configPath =
      configPath ?? join(__dirname, "..", "..", "mcp-servers.json");
  }

  /**
   * Load server configs from mcp-servers.json
   */
  loadConfig(): void {
    if (!existsSync(this.configPath)) {
      console.warn(`[MCP-Manager] Config not found: ${this.configPath}`);
      return;
    }

    try {
      const raw = readFileSync(this.configPath, "utf-8");
      const parsed = MCPConfigFileSchema.parse(JSON.parse(raw));

      for (const [name, config] of Object.entries(parsed.servers)) {
        this.configs.set(name, config);
      }

      console.log(`[MCP-Manager] Loaded ${this.configs.size} server configs`);

      // Eager-start servers marked as eager
      for (const [name, config] of this.configs) {
        if (config.eager) {
          this.getOrCreateConnection(name).catch((err) => {
            console.error(`[MCP-Manager] Failed to eager-start ${name}:`, err);
          });
        }
      }
    } catch (err) {
      console.error(`[MCP-Manager] Failed to load config:`, err);
    }
  }

  /**
   * List all configured servers with status
   */
  listServers(): MCPServerInfo[] {
    const servers: MCPServerInfo[] = [];

    for (const [name] of this.configs) {
      const conn = this.connections.get(name);
      servers.push({
        name,
        status: conn?.status ?? "stopped",
        tools: conn?.tools ?? [],
        pid: conn?.pid,
        startedAt: conn?.startedAt,
        lastUsed: conn?.lastUsed,
        restartCount: conn?.restartCount ?? 0,
        error: conn?.error,
      });
    }

    return servers;
  }

  /**
   * Get tools for a specific server (lazy-starts if needed)
   */
  async getTools(serverName: string): Promise<MCPToolDefinition[]> {
    const conn = await this.getOrCreateConnection(serverName);
    return conn.tools;
  }

  /**
   * Call a tool on a server (lazy-starts if needed)
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown> = {}
  ): Promise<MCPToolResult> {
    const start = Date.now();
    const conn = await this.getOrCreateConnection(serverName);

    try {
      const result = await conn.callTool(toolName, args);
      const duration = Date.now() - start;
      this.totalCalls++;
      this.emit("tool:called", serverName, toolName, duration);
      this.resetIdleTimer(serverName);
      return result;
    } catch (err) {
      // Auto-restart on failure
      if (conn.status === "error" || conn.status === "stopped") {
        console.warn(`[MCP-Manager] Restarting ${serverName} after failure`);
        await conn.restart();
        return conn.callTool(toolName, args);
      }
      throw err;
    }
  }

  /**
   * Restart a specific server
   */
  async restartServer(serverName: string): Promise<void> {
    const conn = this.connections.get(serverName);
    if (conn) {
      await conn.restart();
      this.emit("server:started", serverName);
    }
  }

  /**
   * Get aggregated gateway status
   */
  getStatus(): MCPGatewayStatus {
    const servers = this.listServers();
    const running = servers.filter((s) => s.status === "running").length;
    const errors = servers.filter((s) => s.status === "error").length;
    const totalTools = servers.reduce((sum, s) => sum + s.tools.length, 0);

    return {
      timestamp: Date.now(),
      servers,
      stats: {
        totalServers: servers.length,
        running,
        stopped: servers.length - running - errors,
        errors,
        totalTools,
        totalCalls: this.totalCalls,
      },
    };
  }

  /**
   * Stop all servers and clean up
   */
  async shutdown(): Promise<void> {
    for (const [name, timer] of this.idleTimers) {
      clearTimeout(timer);
      this.idleTimers.delete(name);
    }

    for (const [name, conn] of this.connections) {
      await conn.stop();
      this.connections.delete(name);
    }

    instance = null;
  }

  // ===========================================================================
  // Private
  // ===========================================================================

  private async getOrCreateConnection(
    serverName: string
  ): Promise<MCPConnection> {
    const existing = this.connections.get(serverName);
    if (existing && existing.status === "running") {
      return existing;
    }

    const config = this.configs.get(serverName);
    if (!config) {
      throw new Error(`Unknown MCP server: ${serverName}`);
    }

    const conn = new MCPConnection(serverName, config);

    conn.on("ready", () => {
      this.emit("server:started", serverName);
      this.resetIdleTimer(serverName);
    });

    conn.on("error", (err) => {
      this.emit("server:error", serverName, err);
    });

    conn.on("closed", () => {
      this.emit("server:stopped", serverName);
      this.clearIdleTimer(serverName);
    });

    this.connections.set(serverName, conn);
    await conn.start();
    return conn;
  }

  private resetIdleTimer(serverName: string): void {
    this.clearIdleTimer(serverName);
    const config = this.configs.get(serverName);
    const timeout = config?.idleTimeout ?? 30_000;

    if (timeout > 0) {
      const timer = setTimeout(async () => {
        const conn = this.connections.get(serverName);
        if (conn && conn.status === "running") {
          console.log(`[MCP-Manager] Idle timeout: stopping ${serverName}`);
          await conn.stop();
        }
      }, timeout);

      this.idleTimers.set(serverName, timer);
    }
  }

  private clearIdleTimer(serverName: string): void {
    const timer = this.idleTimers.get(serverName);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(serverName);
    }
  }
}
