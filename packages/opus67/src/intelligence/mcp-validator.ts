/**
 * OPUS 67 v4.0 - MCP Endpoint Validator
 *
 * Validates MCP tool calls against known endpoints to prevent hallucinations.
 * Pre-indexed knowledge of all MCP server capabilities.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml } from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

export interface MCPEndpoint {
  name: string;
  description: string;
  parameters: MCPParameter[];
  returns: string;
  examples?: MCPExample[];
  rate_limit?: string;
  requires_auth?: boolean;
}

export interface MCPParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: unknown;
  enum?: string[];
  validation?: string;  // Regex pattern
}

export interface MCPExample {
  description: string;
  input: Record<string, unknown>;
  output: string;
}

export interface MCPServer {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  endpoints: MCPEndpoint[];
  common_errors: MCPError[];
  anti_hallucination: string[];  // Things this MCP CANNOT do
}

export interface MCPError {
  code: string;
  message: string;
  resolution: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  endpoint?: MCPEndpoint;
}

export interface MCPRegistry {
  version: string;
  servers: Map<string, MCPServer>;
}

// =============================================================================
// MCP VALIDATOR
// =============================================================================

export class MCPValidator {
  private registry: MCPRegistry = {
    version: '1.0.0',
    servers: new Map()
  };
  private initialized: boolean = false;

  constructor() {}

  /**
   * Initialize the validator from endpoints.yaml
   */
  async initialize(endpointsPath?: string): Promise<void> {
    if (this.initialized) return;

    const configPath = endpointsPath || path.join(
      path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
      '../../config/endpoints.yaml'
    );

    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        const data = parseYaml(content) as { version: string; servers: MCPServer[] };

        this.registry.version = data.version;
        for (const server of data.servers || []) {
          this.registry.servers.set(server.id, server);
        }
      }
    } catch (error) {
      console.error('[MCPValidator] Could not load endpoints.yaml:', error);
    }

    this.initialized = true;
  }

  /**
   * Validate an MCP tool call
   */
  async validate(
    serverId: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<ValidationResult> {
    await this.initialize();

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if server exists
    const server = this.registry.servers.get(serverId);
    if (!server) {
      // Unknown server - provide helpful message
      const knownServers = Array.from(this.registry.servers.keys());
      errors.push(`Unknown MCP server: ${serverId}`);
      if (knownServers.length > 0) {
        suggestions.push(`Known servers: ${knownServers.join(', ')}`);
      }
      return { valid: false, errors, warnings, suggestions };
    }

    // Check anti-hallucination rules
    for (const rule of server.anti_hallucination || []) {
      const toolLower = toolName.toLowerCase();
      if (toolLower.includes(rule.toLowerCase())) {
        errors.push(`${server.name} cannot: ${rule}`);
      }
    }

    // Find endpoint
    const endpoint = server.endpoints.find(e => e.name === toolName);
    if (!endpoint) {
      const availableTools = server.endpoints.map(e => e.name);
      errors.push(`Unknown tool: ${toolName} on ${server.name}`);
      suggestions.push(`Available tools: ${availableTools.join(', ')}`);
      return { valid: false, errors, warnings, suggestions };
    }

    // Validate parameters
    const paramValidation = this.validateParameters(endpoint, params);
    errors.push(...paramValidation.errors);
    warnings.push(...paramValidation.warnings);

    // Check rate limits
    if (endpoint.rate_limit) {
      warnings.push(`Rate limit: ${endpoint.rate_limit}`);
    }

    // Check auth requirements
    if (endpoint.requires_auth) {
      warnings.push('This endpoint requires authentication');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      endpoint
    };
  }

  /**
   * Validate parameters against endpoint definition
   */
  private validateParameters(
    endpoint: MCPEndpoint,
    params: Record<string, unknown>
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required parameters
    for (const param of endpoint.parameters) {
      if (param.required && !(param.name in params)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }

      const value = params[param.name];
      if (value === undefined) continue;

      // Type validation
      const actualType = typeof value;
      const expectedType = param.type.toLowerCase();

      if (expectedType === 'string' && actualType !== 'string') {
        errors.push(`Parameter ${param.name} should be string, got ${actualType}`);
      } else if (expectedType === 'number' && actualType !== 'number') {
        errors.push(`Parameter ${param.name} should be number, got ${actualType}`);
      } else if (expectedType === 'boolean' && actualType !== 'boolean') {
        errors.push(`Parameter ${param.name} should be boolean, got ${actualType}`);
      } else if (expectedType === 'array' && !Array.isArray(value)) {
        errors.push(`Parameter ${param.name} should be array, got ${actualType}`);
      }

      // Enum validation
      if (param.enum && !param.enum.includes(String(value))) {
        errors.push(`Parameter ${param.name} must be one of: ${param.enum.join(', ')}`);
      }

      // Regex validation
      if (param.validation && typeof value === 'string') {
        try {
          const regex = new RegExp(param.validation);
          if (!regex.test(value)) {
            errors.push(`Parameter ${param.name} failed validation: ${param.validation}`);
          }
        } catch {
          // Invalid regex in config - ignore
        }
      }
    }

    // Check for unknown parameters
    const knownParams = new Set(endpoint.parameters.map(p => p.name));
    for (const paramName of Object.keys(params)) {
      if (!knownParams.has(paramName)) {
        warnings.push(`Unknown parameter: ${paramName}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Get all available tools for a server
   */
  async getServerTools(serverId: string): Promise<string[]> {
    await this.initialize();

    const server = this.registry.servers.get(serverId);
    if (!server) return [];

    return server.endpoints.map(e => e.name);
  }

  /**
   * Get endpoint documentation
   */
  async getEndpointDoc(serverId: string, toolName: string): Promise<MCPEndpoint | null> {
    await this.initialize();

    const server = this.registry.servers.get(serverId);
    if (!server) return null;

    return server.endpoints.find(e => e.name === toolName) || null;
  }

  /**
   * Search for tools by capability
   */
  async searchTools(capability: string): Promise<Array<{
    serverId: string;
    serverName: string;
    tool: MCPEndpoint;
    relevance: number;
  }>> {
    await this.initialize();

    const results: Array<{
      serverId: string;
      serverName: string;
      tool: MCPEndpoint;
      relevance: number;
    }> = [];

    const capLower = capability.toLowerCase();

    for (const [serverId, server] of this.registry.servers) {
      for (const endpoint of server.endpoints) {
        let relevance = 0;

        // Check name match
        if (endpoint.name.toLowerCase().includes(capLower)) {
          relevance += 0.5;
        }

        // Check description match
        if (endpoint.description.toLowerCase().includes(capLower)) {
          relevance += 0.3;
        }

        // Check server description
        if (server.description.toLowerCase().includes(capLower)) {
          relevance += 0.2;
        }

        if (relevance > 0) {
          results.push({
            serverId,
            serverName: server.name,
            tool: endpoint,
            relevance
          });
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return results;
  }

  /**
   * Get common errors for a server
   */
  async getCommonErrors(serverId: string): Promise<MCPError[]> {
    await this.initialize();

    const server = this.registry.servers.get(serverId);
    return server?.common_errors || [];
  }

  /**
   * Check if a tool exists anywhere
   */
  async toolExists(toolName: string): Promise<{
    exists: boolean;
    servers: string[];
  }> {
    await this.initialize();

    const servers: string[] = [];

    for (const [serverId, server] of this.registry.servers) {
      if (server.endpoints.some(e => e.name === toolName)) {
        servers.push(serverId);
      }
    }

    return {
      exists: servers.length > 0,
      servers
    };
  }

  /**
   * Get anti-hallucination warnings for a server
   */
  async getAntiHallucinationRules(serverId: string): Promise<string[]> {
    await this.initialize();

    const server = this.registry.servers.get(serverId);
    return server?.anti_hallucination || [];
  }

  /**
   * Get registry statistics
   */
  async getStats(): Promise<{
    totalServers: number;
    totalEndpoints: number;
    totalParameters: number;
    serversByCategory: Record<string, number>;
  }> {
    await this.initialize();

    let totalEndpoints = 0;
    let totalParameters = 0;
    const serversByCategory: Record<string, number> = {};

    for (const server of this.registry.servers.values()) {
      totalEndpoints += server.endpoints.length;
      serversByCategory[server.category] = (serversByCategory[server.category] || 0) + 1;

      for (const endpoint of server.endpoints) {
        totalParameters += endpoint.parameters.length;
      }
    }

    return {
      totalServers: this.registry.servers.size,
      totalEndpoints,
      totalParameters,
      serversByCategory
    };
  }

  /**
   * Get all server IDs
   */
  async getServerIds(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.registry.servers.keys());
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let instance: MCPValidator | null = null;

export function getMCPValidator(): MCPValidator {
  if (!instance) {
    instance = new MCPValidator();
  }
  return instance;
}

export function resetMCPValidator(): void {
  instance = null;
}
