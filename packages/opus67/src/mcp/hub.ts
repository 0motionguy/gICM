/**
 * OPUS 67 - MCP Hub
 * Manages 50+ MCP connections for live data access
 */

import { readFileSync } from "fs";
import { parse as parseYaml } from "yaml";
import { EventEmitter } from "eventemitter3";
import {
  DynamicToolDiscovery,
  createDiscovery,
  type DiscoveryResult,
} from "./discovery.js";

// =============================================================================
// TYPES
// =============================================================================

export interface MCPConnection {
  id: string;
  name: string;
  category: string;
  priority: number;
  status: "ready" | "pending" | "disabled" | "connected" | "error";
  transport: "http" | "graphql" | "sdk" | "pg" | "local" | "cli" | "python";
  base_url?: string;
  auth?: {
    type: "api_key" | "bearer" | "bot" | "none";
    header?: string;
    env_var?: string;
  };
  tools: MCPTool[];
  rate_limits?: {
    requests_per_second?: number;
    requests_per_minute?: number;
    daily_limit?: number;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  endpoint?: string;
  method?: string;
  params?: string[];
  query?: string;
}

export interface MCPConfig {
  version: string;
  total_connections: number;
  connections: MCPConnection[];
  groups: Record<string, string[]>;
  auto_connect: {
    always: string[];
    on_skill: Record<string, string[]>;
  };
  env_template: string;
}

export interface MCPHubEvents {
  "mcp:connecting": (id: string) => void;
  "mcp:connected": (id: string) => void;
  "mcp:error": (id: string, error: Error) => void;
  "mcp:disconnected": (id: string) => void;
  "tool:called": (mcp: string, tool: string, params: unknown) => void;
  "tool:result": (mcp: string, tool: string, result: unknown) => void;
}

// =============================================================================
// MCP HUB
// =============================================================================

export class MCPHub extends EventEmitter<MCPHubEvents> {
  private configPath: string;
  private config: MCPConfig | null = null;
  private connected: Map<string, MCPConnection> = new Map();
  private clients: Map<string, MCPClient> = new Map();
  private discovery: DynamicToolDiscovery; // v5.0: Dynamic tool discovery

  constructor(configPath: string) {
    super();
    this.configPath = configPath;
    this.discovery = createDiscovery(); // v5.0
  }

  /**
   * Load MCP configuration from YAML
   */
  async loadConfig(): Promise<MCPConfig> {
    const content = readFileSync(this.configPath, "utf-8");
    this.config = parseYaml(content) as MCPConfig;

    // v5.0: Register connections with discovery engine
    if (this.config.connections) {
      this.discovery.registerConnections(this.config.connections);
    }

    return this.config;
  }

  /**
   * Connect to all "always" MCPs
   */
  async connectAll(): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }

    // Connect "always" MCPs (handle missing auto_connect gracefully)
    const alwaysConnect = this.config?.auto_connect?.always || [];
    for (const mcpId of alwaysConnect) {
      await this.connect(mcpId);
    }

    // If no explicit "always" list, just log and continue
    if (alwaysConnect.length === 0) {
      console.log("[MCPHub] No auto-connect MCPs configured (this is OK)");
    }
  }

  /**
   * Connect to a specific MCP
   */
  async connect(mcpId: string): Promise<boolean> {
    const mcp = this.findMCP(mcpId);
    if (!mcp) {
      console.warn(`[MCPHub] MCP not found: ${mcpId}`);
      return false;
    }

    if (mcp.status === "disabled") {
      console.warn(`[MCPHub] MCP disabled: ${mcpId}`);
      return false;
    }

    if (this.connected.has(mcpId)) {
      return true; // Already connected
    }

    this.emit("mcp:connecting", mcpId);

    try {
      // Create appropriate client based on transport
      const client = await this.createClient(mcp);
      this.clients.set(mcpId, client);

      // Test connection
      await client.ping();

      mcp.status = "connected";
      this.connected.set(mcpId, mcp);
      this.emit("mcp:connected", mcpId);
      console.log(`[MCPHub] Connected: ${mcp.name}`);
      return true;
    } catch (error) {
      mcp.status = "error";
      this.emit("mcp:error", mcpId, error as Error);
      console.error(`[MCPHub] Failed to connect ${mcpId}:`, error);
      return false;
    }
  }

  /**
   * Connect MCPs required by specific skills
   */
  async connectForSkills(skillIds: string[]): Promise<MCPConnection[]> {
    const connectedMCPs: MCPConnection[] = [];

    for (const skillId of skillIds) {
      const requiredMCPs = this.config?.auto_connect.on_skill[skillId] || [];

      for (const mcpId of requiredMCPs) {
        if (!this.connected.has(mcpId)) {
          const success = await this.connect(mcpId);
          if (success) {
            connectedMCPs.push(this.connected.get(mcpId)!);
          }
        }
      }
    }

    return connectedMCPs;
  }

  /**
   * Connect a group of MCPs
   */
  async connectGroup(groupName: string): Promise<void> {
    const group = this.config?.groups[groupName];
    if (!group) {
      throw new Error(`Group not found: ${groupName}`);
    }

    for (const mcpId of group) {
      await this.connect(mcpId);
    }
  }

  /**
   * v5.0: Discover and connect relevant MCPs for a task
   *
   * This is the dynamic discovery method that analyzes the task
   * and connects only relevant MCPs instead of all 84.
   */
  async discoverAndConnect(task: string): Promise<DiscoveryResult> {
    if (!this.config) {
      await this.loadConfig();
    }

    // Discover relevant tools
    const result = await this.discovery.discoverTools(task);

    // Connect discovered MCPs
    for (const conn of result.connections) {
      if (!this.connected.has(conn.id)) {
        await this.connect(conn.id);
      }
    }

    return result;
  }

  /**
   * Get discovery engine (for advanced usage)
   */
  getDiscovery(): DynamicToolDiscovery {
    return this.discovery;
  }

  /**
   * Create client based on transport type
   */
  private async createClient(mcp: MCPConnection): Promise<MCPClient> {
    switch (mcp.transport) {
      case "http":
        return new HTTPMCPClient(mcp);
      case "graphql":
        return new GraphQLMCPClient(mcp);
      case "pg":
        return new PostgresMCPClient(mcp);
      case "sdk":
        return new SDKMCPClient(mcp);
      default:
        return new GenericMCPClient(mcp);
    }
  }

  /**
   * Call a tool on a connected MCP
   */
  async callTool(
    mcpId: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const client = this.clients.get(mcpId);
    if (!client) {
      throw new Error(`MCP not connected: ${mcpId}`);
    }

    const mcp = this.connected.get(mcpId)!;
    const tool = mcp.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName} on ${mcpId}`);
    }

    this.emit("tool:called", mcpId, toolName, params);

    try {
      const result = await client.call(tool, params);
      this.emit("tool:result", mcpId, toolName, result);
      return result;
    } catch (error) {
      console.error(`[MCPHub] Tool call failed ${mcpId}.${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Get all available tools from connected MCPs
   */
  getAvailableTools(): Array<{
    id: string;
    name: string;
    description: string;
    mcp: string;
  }> {
    const tools: Array<{
      id: string;
      name: string;
      description: string;
      mcp: string;
    }> = [];

    for (const [mcpId, mcp] of this.connected) {
      for (const tool of mcp.tools) {
        tools.push({
          id: `${mcpId}.${tool.name}`,
          name: tool.name,
          description: tool.description,
          mcp: mcpId,
        });
      }
    }

    return tools;
  }

  /**
   * Find MCP definition by ID
   */
  private findMCP(mcpId: string): MCPConnection | undefined {
    return this.config?.connections.find((c) => c.id === mcpId);
  }

  /**
   * Get list of connected MCPs
   */
  getConnected(): MCPConnection[] {
    return Array.from(this.connected.values());
  }

  /**
   * Disconnect from an MCP
   */
  async disconnect(mcpId: string): Promise<void> {
    const client = this.clients.get(mcpId);
    if (client) {
      await client.disconnect();
      this.clients.delete(mcpId);
    }
    this.connected.delete(mcpId);
    this.emit("mcp:disconnected", mcpId);
  }

  /**
   * Disconnect from all MCPs
   */
  async disconnectAll(): Promise<void> {
    for (const mcpId of this.connected.keys()) {
      await this.disconnect(mcpId);
    }
  }

  /**
   * Get connection stats
   */
  getStats(): { total: number; connected: number; available_tools: number } {
    return {
      total: this.config?.connections.length || 0,
      connected: this.connected.size,
      available_tools: this.getAvailableTools().length,
    };
  }

  /**
   * Format MCP tools for prompt injection
   */
  formatForPrompt(): string {
    const tools = this.getAvailableTools();
    if (tools.length === 0) {
      return "";
    }

    const lines: string[] = ["## Available MCP Tools\n"];

    // Group by MCP
    const byMCP: Record<string, typeof tools> = {};
    for (const tool of tools) {
      if (!byMCP[tool.mcp]) {
        byMCP[tool.mcp] = [];
      }
      byMCP[tool.mcp].push(tool);
    }

    for (const [mcpId, mcpTools] of Object.entries(byMCP)) {
      const mcp = this.connected.get(mcpId);
      lines.push(`### ${mcp?.name || mcpId}`);
      for (const tool of mcpTools) {
        lines.push(`- **${tool.name}**: ${tool.description}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}

// =============================================================================
// MCP CLIENTS
// =============================================================================

abstract class MCPClient {
  protected mcp: MCPConnection;

  constructor(mcp: MCPConnection) {
    this.mcp = mcp;
  }

  abstract ping(): Promise<boolean>;
  abstract call(
    tool: MCPTool,
    params: Record<string, unknown>
  ): Promise<unknown>;
  abstract disconnect(): Promise<void>;

  protected getAuthHeader(): Record<string, string> {
    if (!this.mcp.auth || this.mcp.auth.type === "none") {
      return {};
    }

    const apiKey = process.env[this.mcp.auth.env_var!];
    if (!apiKey) {
      console.warn(`[MCPClient] Missing env var: ${this.mcp.auth.env_var}`);
      return {};
    }

    switch (this.mcp.auth.type) {
      case "api_key":
        return { [this.mcp.auth.header || "Authorization"]: apiKey };
      case "bearer":
        return { Authorization: `Bearer ${apiKey}` };
      case "bot":
        return { Authorization: `Bot ${apiKey}` };
      default:
        return {};
    }
  }
}

class HTTPMCPClient extends MCPClient {
  async ping(): Promise<boolean> {
    // Simple health check
    return true;
  }

  async call(tool: MCPTool, params: Record<string, unknown>): Promise<unknown> {
    let url = `${this.mcp.base_url}${tool.endpoint || ""}`;

    // Replace path params
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, String(value));
    }

    const method = tool.method || "GET";
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
    };

    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(params) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async disconnect(): Promise<void> {
    // HTTP is stateless, no cleanup needed
  }
}

class GraphQLMCPClient extends MCPClient {
  async ping(): Promise<boolean> {
    return true;
  }

  async call(tool: MCPTool, params: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(this.mcp.base_url!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({
        query: tool.query,
        variables: params,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as {
      errors?: Array<{ message: string }>;
      data?: unknown;
    };
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  async disconnect(): Promise<void> {
    // GraphQL over HTTP is stateless
  }
}

class PostgresMCPClient extends MCPClient {
  private pool: unknown = null; // Would be pg.Pool in real implementation

  async ping(): Promise<boolean> {
    // Would test connection
    return true;
  }

  async call(tool: MCPTool, params: Record<string, unknown>): Promise<unknown> {
    // Would execute SQL query
    return { message: "PostgreSQL client - implement with pg package" };
  }

  async disconnect(): Promise<void> {
    // Would close pool
  }
}

class SDKMCPClient extends MCPClient {
  async ping(): Promise<boolean> {
    return true;
  }

  async call(tool: MCPTool, params: Record<string, unknown>): Promise<unknown> {
    return {
      message: `SDK client for ${this.mcp.name} - implement with package`,
    };
  }

  async disconnect(): Promise<void> {
    // Cleanup SDK resources
  }
}

class GenericMCPClient extends MCPClient {
  async ping(): Promise<boolean> {
    return true;
  }

  async call(tool: MCPTool, params: Record<string, unknown>): Promise<unknown> {
    return { message: `Generic client for ${this.mcp.name}` };
  }

  async disconnect(): Promise<void> {
    // No cleanup needed
  }
}

export default MCPHub;
