/**
 * OPUS 67 SDK V2 Adapter
 * Integrates with Claude Agent SDK V2 send()/receive()/done() pattern
 * Provides clean multi-turn agent communication
 *
 * v2.1.0 Features:
 * - Tool Search: Search thousands of tools without consuming context
 * - Programmatic Tool Calling: Invoke tools in sandboxed execution
 * - Tool Use Examples: Standard format for demonstrating tool usage
 */

import { EventEmitter } from "eventemitter3";
import type {
  AgentConfig,
  AgentMessage,
  AgentJob,
} from "../agents/async-runner.js";
import { asyncAgentRunner } from "../agents/async-runner.js";
import {
  subagentOrchestrator,
  type AgentPlan,
  type AgentDefinition,
} from "../agents/subagent-orchestrator.js";

// =============================================================================
// TYPES - Claude Agent SDK V2 Compatible
// =============================================================================

export interface SDKAgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools?: string[];
  model?: "sonnet" | "opus" | "haiku";
  maxTokens?: number;
}

// =============================================================================
// TYPES - SDK V2 FEATURES (Tool Search, Programmatic Calling, Examples)
// =============================================================================

/**
 * Result from tool search operations
 */
export interface ToolResult {
  /** Unique tool identifier (e.g., "mcp.jupiter.swap") */
  id: string;
  /** Human-readable tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Capability category (e.g., "blockchain", "data", "filesystem") */
  capability: string;
  /** Relevance score from search (0-1) */
  relevance: number;
  /** Parameter schema (JSON Schema format) */
  parameters: ToolParameterSchema;
  /** Return type schema */
  returnType: ToolReturnSchema;
  /** Source MCP or provider */
  source: string;
  /** Tags for filtering */
  tags: string[];
}

/**
 * JSON Schema-compatible parameter definition
 */
export interface ToolParameterSchema {
  type: "object";
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Individual parameter property
 */
export interface ToolParameterProperty {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  enum?: string[];
  items?: ToolParameterProperty;
  default?: unknown;
  format?: string;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

/**
 * Return type schema
 */
export interface ToolReturnSchema {
  type: "string" | "number" | "boolean" | "array" | "object" | "void";
  description?: string;
  properties?: Record<string, ToolParameterProperty>;
}

/**
 * Tool call definition for batch operations
 */
export interface ToolCall {
  /** Tool identifier */
  toolId: string;
  /** Parameters to pass to the tool */
  params: Record<string, unknown>;
  /** Optional call ID for tracking */
  callId?: string;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Result from programmatic tool invocation
 */
export interface ToolInvocationResult<T = unknown> {
  /** Whether the call succeeded */
  success: boolean;
  /** Result data if successful */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: ToolErrorCode;
  /** Execution duration in milliseconds */
  duration: number;
  /** Token cost if applicable */
  tokenCost?: number;
  /** Call ID for tracking */
  callId?: string;
}

/**
 * Standard error codes for tool invocation
 */
export type ToolErrorCode =
  | "TOOL_NOT_FOUND"
  | "INVALID_PARAMS"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "PERMISSION_DENIED"
  | "EXECUTION_ERROR"
  | "SANDBOX_VIOLATION"
  | "NETWORK_ERROR";

/**
 * Example of tool usage with input/output
 */
export interface ToolExample {
  /** Example name/title */
  name: string;
  /** Description of what this example demonstrates */
  description: string;
  /** Example input parameters */
  input: Record<string, unknown>;
  /** Expected output (for documentation) */
  output: unknown;
  /** Tags for categorization */
  tags?: string[];
  /** Whether this is a "happy path" example */
  isHappyPath?: boolean;
  /** Related examples */
  relatedExamples?: string[];
}

/**
 * Tool search options
 */
export interface ToolSearchOptions {
  /** Maximum number of results */
  limit?: number;
  /** Minimum relevance score (0-1) */
  minRelevance?: number;
  /** Filter by capabilities */
  capabilities?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Filter by source/provider */
  sources?: string[];
  /** Include deprecated tools */
  includeDeprecated?: boolean;
}

/**
 * Sandbox configuration for programmatic tool calling
 */
export interface SandboxConfig {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Memory limit in MB */
  memoryLimit?: number;
  /** Network access allowed */
  networkAccess?: boolean;
  /** Filesystem access allowed */
  filesystemAccess?: boolean;
  /** Environment variables to inject */
  env?: Record<string, string>;
  /** Allowed domains for network requests */
  allowedDomains?: string[];
}

/**
 * SDK V2 Features interface - new capabilities for latest Claude Agent SDK
 */
export interface SDKv2Features {
  /**
   * Tool Search - Find tools without consuming context window
   */
  toolSearch: {
    /** Search tools by natural language query */
    searchTools(
      query: string,
      options?: ToolSearchOptions
    ): Promise<ToolResult[]>;
    /** Filter tools by specific capability */
    filterByCapability(
      capability: string,
      options?: ToolSearchOptions
    ): Promise<ToolResult[]>;
    /** Get tool by exact ID */
    getToolById(toolId: string): Promise<ToolResult | null>;
    /** List all available capabilities */
    listCapabilities(): Promise<string[]>;
    /** Get tool count without loading details */
    getToolCount(): Promise<number>;
  };

  /**
   * Programmatic Tool Calling - Invoke tools in sandboxed environment
   */
  programmaticCalling: {
    /** Invoke a single tool in sandbox */
    invokeInSandbox<T = unknown>(
      toolName: string,
      params: Record<string, unknown>,
      config?: SandboxConfig
    ): Promise<ToolInvocationResult<T>>;
    /** Batch invoke multiple tools */
    batchInvoke<T = unknown>(
      calls: ToolCall[],
      config?: SandboxConfig
    ): Promise<ToolInvocationResult<T>[]>;
    /** Check if a tool can be invoked */
    canInvoke(toolName: string): Promise<boolean>;
    /** Get sandbox status */
    getSandboxStatus(): SandboxStatus;
  };

  /**
   * Tool Examples - Standard format for demonstrating tool usage
   */
  toolExamples: {
    /** Get examples for a specific tool */
    getExamples(toolName: string): ToolExample[];
    /** Add a new example for a tool */
    addExample(toolName: string, example: ToolExample): void;
    /** Remove an example */
    removeExample(toolName: string, exampleName: string): boolean;
    /** Get all examples matching tags */
    getExamplesByTag(tag: string): Map<string, ToolExample[]>;
    /** Validate an example against tool schema */
    validateExample(toolName: string, example: ToolExample): ValidationResult;
  };
}

/**
 * Sandbox execution status
 */
export interface SandboxStatus {
  /** Whether sandbox is available */
  available: boolean;
  /** Current active executions */
  activeExecutions: number;
  /** Maximum concurrent executions */
  maxConcurrent: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Uptime in milliseconds */
  uptime: number;
}

/**
 * Validation result for examples
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

export interface AgentSession {
  id: string;
  agentId: string;
  status: "active" | "completed" | "failed";
  messages: AgentMessage[];
  startTime: number;
  endTime?: number;
}

export interface FinalResult {
  sessionId: string;
  success: boolean;
  output: string;
  tokensUsed: number;
  duration: number;
  messages: AgentMessage[];
}

interface SDKEvents {
  "session:started": (session: AgentSession) => void;
  "message:received": (sessionId: string, message: AgentMessage) => void;
  "session:completed": (result: FinalResult) => void;
  error: (error: Error) => void;
}

// =============================================================================
// OPUS67 AGENT SDK - V2 INTERFACE
// =============================================================================

export class OPUS67AgentSDK
  extends EventEmitter<SDKEvents>
  implements SDKv2Features
{
  private sessions: Map<string, AgentSession> = new Map();
  private messageQueues: Map<string, AgentMessage[]> = new Map();
  private activeSession: string | null = null;
  private sessionCounter = 0;

  // SDK V2 Features - internal storage
  private toolRegistry: Map<string, ToolResult> = new Map();
  private toolExamplesMap: Map<string, ToolExample[]> = new Map();
  private capabilityIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private sandboxStartTime: number = Date.now();
  private activeSandboxExecutions: number = 0;
  private readonly maxConcurrentSandbox: number = 10;

  constructor() {
    super();
    this.initializeDefaultTools();
  }

  /**
   * Initialize default tool registry with common OPUS 67 tools
   */
  private initializeDefaultTools(): void {
    // Register built-in OPUS 67 tools
    const defaultTools: ToolResult[] = [
      {
        id: "opus67.detect_skills",
        name: "Detect Skills",
        description: "Detect relevant OPUS 67 skills for a given query",
        capability: "skill-management",
        relevance: 1.0,
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The query to analyze for skill detection",
            },
          },
          required: ["query"],
        },
        returnType: {
          type: "array",
          description: "Array of matched skill IDs with relevance scores",
        },
        source: "opus67-core",
        tags: ["skill", "detection", "core"],
      },
      {
        id: "opus67.get_skill",
        name: "Get Skill",
        description: "Load a specific OPUS 67 skill by ID",
        capability: "skill-management",
        relevance: 1.0,
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The skill ID to load",
            },
          },
          required: ["id"],
        },
        returnType: {
          type: "object",
          description: "Full skill definition with capabilities and prompts",
        },
        source: "opus67-core",
        tags: ["skill", "loading", "core"],
      },
      {
        id: "opus67.spawn_agent",
        name: "Spawn Agent",
        description: "Spawn a background agent for parallel task execution",
        capability: "agent-orchestration",
        relevance: 1.0,
        parameters: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description: "Agent identifier",
            },
            task: {
              type: "string",
              description: "Task description for the agent",
            },
            model: {
              type: "string",
              description: "Model to use (sonnet, opus, haiku)",
              enum: ["sonnet", "opus", "haiku"],
              default: "sonnet",
            },
          },
          required: ["agentId", "task"],
        },
        returnType: {
          type: "object",
          description: "Agent session with ID and status",
        },
        source: "opus67-sdk",
        tags: ["agent", "orchestration", "async"],
      },
    ];

    for (const tool of defaultTools) {
      this.registerTool(tool);
    }
  }

  /**
   * Register a tool in the registry
   */
  registerTool(tool: ToolResult): void {
    this.toolRegistry.set(tool.id, tool);

    // Update capability index
    if (!this.capabilityIndex.has(tool.capability)) {
      this.capabilityIndex.set(tool.capability, new Set());
    }
    this.capabilityIndex.get(tool.capability)!.add(tool.id);

    // Update tag index
    for (const tag of tool.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(tool.id);
    }
  }

  // ===========================================================================
  // SDK V2 FEATURE: Tool Search
  // ===========================================================================

  /**
   * Tool Search interface implementation
   */
  readonly toolSearch: SDKv2Features["toolSearch"] = {
    searchTools: async (
      query: string,
      options?: ToolSearchOptions
    ): Promise<ToolResult[]> => {
      const limit = options?.limit ?? 10;
      const minRelevance = options?.minRelevance ?? 0.1;
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

      const results: Array<{ tool: ToolResult; score: number }> = [];

      for (const tool of this.toolRegistry.values()) {
        // Skip if filtered by capability
        if (
          options?.capabilities?.length &&
          !options.capabilities.includes(tool.capability)
        ) {
          continue;
        }

        // Skip if filtered by tags
        if (
          options?.tags?.length &&
          !options.tags.some((t) => tool.tags.includes(t))
        ) {
          continue;
        }

        // Skip if filtered by source
        if (
          options?.sources?.length &&
          !options.sources.includes(tool.source)
        ) {
          continue;
        }

        // Calculate relevance score
        let score = 0;

        // Name match (weight: 0.4)
        if (tool.name.toLowerCase().includes(queryLower)) {
          score += 0.4;
        } else {
          const nameWords = tool.name.toLowerCase().split(/\s+/);
          const nameOverlap = queryWords.filter((w) =>
            nameWords.some((nw) => nw.includes(w) || w.includes(nw))
          );
          score += (nameOverlap.length / queryWords.length) * 0.3;
        }

        // Description match (weight: 0.3)
        const descLower = tool.description.toLowerCase();
        const descOverlap = queryWords.filter((w) => descLower.includes(w));
        score += (descOverlap.length / queryWords.length) * 0.3;

        // ID match (weight: 0.2)
        if (tool.id.toLowerCase().includes(queryLower.replace(/\s+/g, ""))) {
          score += 0.2;
        }

        // Tag match (weight: 0.1)
        const tagOverlap = tool.tags.filter((t) =>
          queryWords.some((w) => t.toLowerCase().includes(w))
        );
        score += Math.min(tagOverlap.length * 0.05, 0.1);

        if (score >= minRelevance) {
          results.push({ tool: { ...tool, relevance: score }, score });
        }
      }

      // Sort by score descending and limit
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((r) => r.tool);
    },

    filterByCapability: async (
      capability: string,
      options?: ToolSearchOptions
    ): Promise<ToolResult[]> => {
      const toolIds = this.capabilityIndex.get(capability);
      if (!toolIds) return [];

      const limit = options?.limit ?? 50;
      const results: ToolResult[] = [];

      for (const toolId of toolIds) {
        const tool = this.toolRegistry.get(toolId);
        if (tool) {
          // Apply additional filters
          if (
            options?.tags?.length &&
            !options.tags.some((t) => tool.tags.includes(t))
          ) {
            continue;
          }
          if (
            options?.sources?.length &&
            !options.sources.includes(tool.source)
          ) {
            continue;
          }
          results.push({ ...tool, relevance: 1.0 });
        }
        if (results.length >= limit) break;
      }

      return results;
    },

    getToolById: async (toolId: string): Promise<ToolResult | null> => {
      return this.toolRegistry.get(toolId) ?? null;
    },

    listCapabilities: async (): Promise<string[]> => {
      return Array.from(this.capabilityIndex.keys()).sort();
    },

    getToolCount: async (): Promise<number> => {
      return this.toolRegistry.size;
    },
  };

  // ===========================================================================
  // SDK V2 FEATURE: Programmatic Tool Calling
  // ===========================================================================

  /**
   * Programmatic Calling interface implementation
   */
  readonly programmaticCalling: SDKv2Features["programmaticCalling"] = {
    invokeInSandbox: async <T = unknown>(
      toolName: string,
      params: Record<string, unknown>,
      config?: SandboxConfig
    ): Promise<ToolInvocationResult<T>> => {
      const startTime = Date.now();
      const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Check tool exists
      const tool = this.toolRegistry.get(toolName);
      if (!tool) {
        return {
          success: false,
          error: `Tool not found: ${toolName}`,
          errorCode: "TOOL_NOT_FOUND",
          duration: Date.now() - startTime,
          callId,
        };
      }

      // Validate parameters against schema
      const validationErrors = this.validateParams(tool.parameters, params);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Invalid parameters: ${validationErrors.join(", ")}`,
          errorCode: "INVALID_PARAMS",
          duration: Date.now() - startTime,
          callId,
        };
      }

      // Check concurrent execution limit
      if (this.activeSandboxExecutions >= this.maxConcurrentSandbox) {
        return {
          success: false,
          error: "Too many concurrent sandbox executions",
          errorCode: "RATE_LIMITED",
          duration: Date.now() - startTime,
          callId,
        };
      }

      this.activeSandboxExecutions++;

      try {
        const timeout = config?.timeout ?? 30000;

        // Execute with timeout
        const result = await Promise.race([
          this.executeToolInSandbox<T>(tool, params, config),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Execution timeout")), timeout)
          ),
        ]);

        return {
          success: true,
          data: result,
          duration: Date.now() - startTime,
          callId,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorCode: ToolErrorCode =
          errorMessage === "Execution timeout" ? "TIMEOUT" : "EXECUTION_ERROR";

        return {
          success: false,
          error: errorMessage,
          errorCode,
          duration: Date.now() - startTime,
          callId,
        };
      } finally {
        this.activeSandboxExecutions--;
      }
    },

    batchInvoke: async <T = unknown>(
      calls: ToolCall[],
      config?: SandboxConfig
    ): Promise<ToolInvocationResult<T>[]> => {
      // Execute all calls in parallel with individual timeout handling
      const results = await Promise.all(
        calls.map((call) =>
          this.programmaticCalling
            .invokeInSandbox<T>(call.toolId, call.params, {
              ...config,
              timeout: call.timeout ?? config?.timeout,
            })
            .then((result) => ({
              ...result,
              callId: call.callId ?? result.callId,
            }))
        )
      );

      return results;
    },

    canInvoke: async (toolName: string): Promise<boolean> => {
      const tool = this.toolRegistry.get(toolName);
      if (!tool) return false;

      // Check if sandbox has capacity
      if (this.activeSandboxExecutions >= this.maxConcurrentSandbox) {
        return false;
      }

      return true;
    },

    getSandboxStatus: (): SandboxStatus => {
      return {
        available: this.activeSandboxExecutions < this.maxConcurrentSandbox,
        activeExecutions: this.activeSandboxExecutions,
        maxConcurrent: this.maxConcurrentSandbox,
        memoryUsage: (process.memoryUsage?.()?.heapUsed ?? 0) / (1024 * 1024),
        uptime: Date.now() - this.sandboxStartTime,
      };
    },
  };

  /**
   * Validate parameters against schema
   */
  private validateParams(
    schema: ToolParameterSchema,
    params: Record<string, unknown>
  ): string[] {
    const errors: string[] = [];

    // Check required parameters
    for (const required of schema.required ?? []) {
      if (!(required in params) || params[required] === undefined) {
        errors.push(`Missing required parameter: ${required}`);
      }
    }

    // Check parameter types
    for (const [key, value] of Object.entries(params)) {
      const propSchema = schema.properties[key];
      if (!propSchema) {
        if (schema.additionalProperties === false) {
          errors.push(`Unknown parameter: ${key}`);
        }
        continue;
      }

      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (propSchema.type !== actualType && value !== null) {
        errors.push(
          `Parameter ${key}: expected ${propSchema.type}, got ${actualType}`
        );
      }

      // Check enum values
      if (propSchema.enum && !propSchema.enum.includes(value as string)) {
        errors.push(
          `Parameter ${key}: must be one of [${propSchema.enum.join(", ")}]`
        );
      }

      // Check numeric constraints
      if (propSchema.type === "number" && typeof value === "number") {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push(`Parameter ${key}: must be >= ${propSchema.minimum}`);
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push(`Parameter ${key}: must be <= ${propSchema.maximum}`);
        }
      }

      // Check string pattern
      if (
        propSchema.type === "string" &&
        typeof value === "string" &&
        propSchema.pattern
      ) {
        if (!new RegExp(propSchema.pattern).test(value)) {
          errors.push(
            `Parameter ${key}: does not match pattern ${propSchema.pattern}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Execute tool in sandboxed environment
   */
  private async executeToolInSandbox<T>(
    tool: ToolResult,
    params: Record<string, unknown>,
    _config?: SandboxConfig
  ): Promise<T> {
    // Simulate tool execution - in production this would:
    // 1. Create isolated execution context
    // 2. Apply resource limits from config
    // 3. Execute the actual tool
    // 4. Return results

    // For now, return a simulated result based on tool type
    await this.sleep(50); // Simulate execution time

    const result = {
      toolId: tool.id,
      params,
      executedAt: new Date().toISOString(),
      message: `Executed ${tool.name} successfully`,
    } as T;

    return result;
  }

  // ===========================================================================
  // SDK V2 FEATURE: Tool Examples
  // ===========================================================================

  /**
   * Tool Examples interface implementation
   */
  readonly toolExamples: SDKv2Features["toolExamples"] = {
    getExamples: (toolName: string): ToolExample[] => {
      return this.toolExamplesMap.get(toolName) ?? [];
    },

    addExample: (toolName: string, example: ToolExample): void => {
      if (!this.toolExamplesMap.has(toolName)) {
        this.toolExamplesMap.set(toolName, []);
      }

      const examples = this.toolExamplesMap.get(toolName)!;

      // Check for duplicate names
      const existingIndex = examples.findIndex((e) => e.name === example.name);
      if (existingIndex >= 0) {
        // Replace existing
        examples[existingIndex] = example;
      } else {
        examples.push(example);
      }
    },

    removeExample: (toolName: string, exampleName: string): boolean => {
      const examples = this.toolExamplesMap.get(toolName);
      if (!examples) return false;

      const index = examples.findIndex((e) => e.name === exampleName);
      if (index < 0) return false;

      examples.splice(index, 1);
      return true;
    },

    getExamplesByTag: (tag: string): Map<string, ToolExample[]> => {
      const result = new Map<string, ToolExample[]>();

      for (const [toolName, examples] of this.toolExamplesMap) {
        const matchingExamples = examples.filter((e) => e.tags?.includes(tag));
        if (matchingExamples.length > 0) {
          result.set(toolName, matchingExamples);
        }
      }

      return result;
    },

    validateExample: (
      toolName: string,
      example: ToolExample
    ): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const tool = this.toolRegistry.get(toolName);
      if (!tool) {
        errors.push({
          path: "toolName",
          message: `Tool not found: ${toolName}`,
          code: "TOOL_NOT_FOUND",
        });
        return { valid: false, errors, warnings };
      }

      // Validate input against tool parameter schema
      const paramErrors = this.validateParams(tool.parameters, example.input);
      for (const paramError of paramErrors) {
        errors.push({
          path: "input",
          message: paramError,
          code: "INVALID_INPUT",
        });
      }

      // Check for missing example metadata
      if (!example.description) {
        warnings.push({
          path: "description",
          message: "Example has no description",
          suggestion:
            "Add a description explaining what this example demonstrates",
        });
      }

      if (!example.tags || example.tags.length === 0) {
        warnings.push({
          path: "tags",
          message: "Example has no tags",
          suggestion: "Add tags to help with discovery and categorization",
        });
      }

      if (example.isHappyPath === undefined) {
        warnings.push({
          path: "isHappyPath",
          message: "Example does not specify if it is a happy path",
          suggestion:
            "Set isHappyPath to true for success cases, false for error cases",
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    },
  };

  /**
   * Convert OPUS 67 agent config to SDK format
   */
  toSDKDefinition(opus67Agent: AgentConfig): SDKAgentDefinition {
    return {
      id: opus67Agent.agentId,
      name: opus67Agent.agentId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `OPUS 67 Agent: ${opus67Agent.agentId}`,
      systemPrompt:
        opus67Agent.systemPrompt || this.generateDefaultPrompt(opus67Agent),
      tools: opus67Agent.tools,
      model: opus67Agent.model || "sonnet",
      maxTokens: 8192,
    };
  }

  /**
   * Generate default system prompt for agent
   */
  private generateDefaultPrompt(config: AgentConfig): string {
    return `You are an OPUS 67 ${config.agentId} specialist agent.

Your task: ${config.task}

Guidelines:
- Focus on your domain expertise
- Provide concrete, actionable output
- Be concise but thorough
- Return structured results when possible`;
  }

  /**
   * Generate agent definitions for multiple agents
   */
  toSDKDefinitions(agents: AgentConfig[]): Record<string, SDKAgentDefinition> {
    const definitions: Record<string, SDKAgentDefinition> = {};
    for (const agent of agents) {
      definitions[agent.agentId] = this.toSDKDefinition(agent);
    }
    return definitions;
  }

  /**
   * Spawn agent using V2 interface - returns session for multi-turn
   */
  async spawn(
    agentId: string,
    prompt: string,
    options?: {
      model?: "sonnet" | "opus" | "haiku";
      tools?: string[];
    }
  ): Promise<AgentSession> {
    const sessionId = this.generateSessionId();

    const session: AgentSession = {
      id: sessionId,
      agentId,
      status: "active",
      messages: [],
      startTime: Date.now(),
    };

    this.sessions.set(sessionId, session);
    this.messageQueues.set(sessionId, []);
    this.activeSession = sessionId;

    // Start background execution
    const jobId = asyncAgentRunner.spawnBackground({
      agentId,
      task: prompt,
      model: options?.model || "sonnet",
      tools: options?.tools,
    });

    // Stream messages to queue
    this.streamToQueue(sessionId, jobId);

    this.emit("session:started", session);
    return session;
  }

  /**
   * Stream job results to session queue
   */
  private async streamToQueue(sessionId: string, jobId: string): Promise<void> {
    try {
      for await (const message of asyncAgentRunner.streamResults(jobId)) {
        const queue = this.messageQueues.get(sessionId) || [];
        queue.push(message);
        this.messageQueues.set(sessionId, queue);

        const session = this.sessions.get(sessionId);
        if (session) {
          session.messages.push(message);
        }

        this.emit("message:received", sessionId, message);

        if (message.type === "done") {
          this.completeSession(sessionId, message);
          break;
        }
      }
    } catch (error) {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = "failed";
      }
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Complete a session
   */
  private completeSession(sessionId: string, finalMessage: AgentMessage): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = "completed";
    session.endTime = Date.now();

    const result: FinalResult = {
      sessionId,
      success: true,
      output: finalMessage.content,
      tokensUsed: (finalMessage.metadata?.tokensUsed as number) || 0,
      duration: session.endTime - session.startTime,
      messages: session.messages,
    };

    this.emit("session:completed", result);
  }

  /**
   * Send a message to the active session (V2 pattern)
   */
  async send(message: string, sessionId?: string): Promise<void> {
    const sid = sessionId || this.activeSession;
    if (!sid) {
      throw new Error("No active session. Call spawn() first.");
    }

    const session = this.sessions.get(sid);
    if (!session || session.status !== "active") {
      throw new Error(`Session ${sid} is not active`);
    }

    // Add user message to queue
    const userMessage: AgentMessage = {
      type: "text",
      content: message,
      timestamp: Date.now(),
      metadata: { role: "user" },
    };

    const queue = this.messageQueues.get(sid) || [];
    queue.push(userMessage);
    this.messageQueues.set(sid, queue);
    session.messages.push(userMessage);
  }

  /**
   * Receive messages from the session (V2 pattern)
   * Async generator that yields messages as they arrive
   */
  async *receive(sessionId?: string): AsyncGenerator<AgentMessage> {
    const sid = sessionId || this.activeSession;
    if (!sid) {
      throw new Error("No active session. Call spawn() first.");
    }

    let lastIndex = 0;
    const checkInterval = 50;

    while (true) {
      const queue = this.messageQueues.get(sid) || [];
      const session = this.sessions.get(sid);

      // Yield new messages
      while (lastIndex < queue.length) {
        const message = queue[lastIndex];
        lastIndex++;
        yield message;

        // Exit on completion
        if (message.type === "done") {
          return;
        }
      }

      // Check if session ended
      if (!session || session.status !== "active") {
        return;
      }

      await this.sleep(checkInterval);
    }
  }

  /**
   * Signal completion and get final result (V2 pattern)
   */
  async done(sessionId?: string): Promise<FinalResult> {
    const sid = sessionId || this.activeSession;
    if (!sid) {
      throw new Error("No active session. Call spawn() first.");
    }

    // Wait for session to complete
    const maxWait = 60000;
    const startWait = Date.now();

    while (Date.now() - startWait < maxWait) {
      const session = this.sessions.get(sid);
      if (!session) {
        throw new Error(`Session ${sid} not found`);
      }

      if (session.status !== "active") {
        const queue = this.messageQueues.get(sid) || [];
        const lastMessage = queue[queue.length - 1];

        return {
          sessionId: sid,
          success: session.status === "completed",
          output: lastMessage?.content || "",
          tokensUsed: (lastMessage?.metadata?.tokensUsed as number) || 0,
          duration: (session.endTime || Date.now()) - session.startTime,
          messages: session.messages,
        };
      }

      await this.sleep(100);
    }

    throw new Error(`Session ${sid} timed out`);
  }

  /**
   * Query pattern - single request/response (SDK v1 compatibility)
   */
  async query(
    agentId: string,
    prompt: string,
    options?: {
      model?: "sonnet" | "opus" | "haiku";
    }
  ): Promise<string> {
    const session = await this.spawn(agentId, prompt, options);
    const result = await this.done(session.id);
    return result.output;
  }

  /**
   * Spawn multiple agents and coordinate results
   */
  async spawnMultiple(
    agents: Array<{ agentId: string; task: string }>,
    options?: { parallel?: boolean }
  ): Promise<FinalResult[]> {
    const parallel = options?.parallel ?? true;

    if (parallel) {
      // Spawn all in parallel
      const sessions = await Promise.all(
        agents.map((a) => this.spawn(a.agentId, a.task))
      );

      // Wait for all to complete
      const results = await Promise.all(sessions.map((s) => this.done(s.id)));

      return results;
    } else {
      // Sequential execution
      const results: FinalResult[] = [];
      for (const agent of agents) {
        const session = await this.spawn(agent.agentId, agent.task);
        const result = await this.done(session.id);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): AgentSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): AgentSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === "active"
    );
  }

  /**
   * Cancel a session
   */
  async cancel(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") {
      return false;
    }

    session.status = "failed";
    session.endTime = Date.now();

    // Clear from active
    if (this.activeSession === sessionId) {
      this.activeSession = null;
    }

    return true;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    this.sessionCounter++;
    return `sdk_${Date.now()}_${this.sessionCounter.toString().padStart(4, "0")}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Format SDK status
   */
  formatStatus(): string {
    const active = this.getActiveSessions().length;
    const total = this.sessions.size;
    const sandboxStatus = this.programmaticCalling.getSandboxStatus();
    const toolCount = this.toolRegistry.size;
    const capabilityCount = this.capabilityIndex.size;

    return `
┌─ OPUS 67 SDK V2.1 ──────────────────────────────────────────────┐
│                                                                  │
│  SESSIONS                                                        │
│  ────────────────────────────────────────────────────────────    │
│  Active: ${String(active).padEnd(3)} / Total: ${String(total).padEnd(3)}                                   │
│  Interface: send() / receive() / done()                          │
│                                                                  │
│  SDK V2 FEATURES                                                 │
│  ────────────────────────────────────────────────────────────    │
│  Tool Search:       ${String(toolCount).padEnd(4)} tools / ${String(capabilityCount).padEnd(2)} capabilities          │
│  Programmatic Call: ${sandboxStatus.available ? "Available" : "At Capacity"}                                │
│  Sandbox Active:    ${String(sandboxStatus.activeExecutions).padEnd(2)} / ${String(sandboxStatus.maxConcurrent).padEnd(2)} max                        │
│  Tool Examples:     ${String(this.toolExamplesMap.size).padEnd(4)} tools with examples                │
│                                                                  │
│  Compatibility: Claude Agent SDK V2                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }

  /**
   * Format SDK V2 features summary
   */
  formatV2Features(): string {
    const capabilities = Array.from(this.capabilityIndex.keys());
    const sandboxStatus = this.programmaticCalling.getSandboxStatus();

    return `
┌─ SDK V2 FEATURES ───────────────────────────────────────────────┐
│                                                                  │
│  TOOL SEARCH                                                     │
│  ────────────────────────────────────────────────────────────    │
│  - searchTools(query, options)                                   │
│  - filterByCapability(capability)                                │
│  - getToolById(id)                                               │
│  - listCapabilities()                                            │
│  - getToolCount()                                                │
│                                                                  │
│  Registered Tools: ${String(this.toolRegistry.size).padEnd(4)}                                     │
│  Capabilities: ${capabilities.slice(0, 3).join(", ").padEnd(40)}│
│                                                                  │
│  PROGRAMMATIC CALLING                                            │
│  ────────────────────────────────────────────────────────────    │
│  - invokeInSandbox(tool, params, config)                         │
│  - batchInvoke(calls, config)                                    │
│  - canInvoke(tool)                                               │
│  - getSandboxStatus()                                            │
│                                                                  │
│  Status: ${sandboxStatus.available ? "Ready" : "Busy"} | Memory: ${sandboxStatus.memoryUsage.toFixed(1)}MB                       │
│                                                                  │
│  TOOL EXAMPLES                                                   │
│  ────────────────────────────────────────────────────────────    │
│  - getExamples(tool)                                             │
│  - addExample(tool, example)                                     │
│  - removeExample(tool, name)                                     │
│  - getExamplesByTag(tag)                                         │
│  - validateExample(tool, example)                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const opus67SDK = new OPUS67AgentSDK();

export function createSDK(): OPUS67AgentSDK {
  return new OPUS67AgentSDK();
}
