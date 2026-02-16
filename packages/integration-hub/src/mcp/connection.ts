/**
 * MCP Connection
 *
 * Manages a single MCP server child process.
 * Communicates via JSON-RPC 2.0 over stdio.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { EventEmitter } from "eventemitter3";
import type {
  MCPServerConfig,
  MCPToolDefinition,
  MCPToolResult,
  MCPServerStatus,
  JsonRpcRequest,
  JsonRpcResponse,
} from "./types.js";

interface MCPConnectionEvents {
  ready: () => void;
  error: (error: Error) => void;
  closed: () => void;
  toolsChanged: (tools: MCPToolDefinition[]) => void;
}

export class MCPConnection extends EventEmitter<MCPConnectionEvents> {
  readonly name: string;
  private config: MCPServerConfig;
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();
  private buffer = "";
  private _status: MCPServerStatus = "stopped";
  private _tools: MCPToolDefinition[] = [];
  private _startedAt?: number;
  private _lastUsed?: number;
  private _restartCount = 0;
  private _error?: string;

  constructor(name: string, config: MCPServerConfig) {
    super();
    this.name = name;
    this.config = config;
  }

  get status(): MCPServerStatus {
    return this._status;
  }
  get tools(): MCPToolDefinition[] {
    return this._tools;
  }
  get startedAt(): number | undefined {
    return this._startedAt;
  }
  get lastUsed(): number | undefined {
    return this._lastUsed;
  }
  get restartCount(): number {
    return this._restartCount;
  }
  get error(): string | undefined {
    return this._error;
  }
  get pid(): number | undefined {
    return this.process?.pid;
  }

  async start(): Promise<void> {
    if (this._status === "running") return;

    this._status = "starting";
    this._error = undefined;

    try {
      this.process = spawn(this.config.command, this.config.args, {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, ...this.config.env },
      });

      this.process.stdout!.on("data", (chunk: Buffer) =>
        this.handleStdout(chunk)
      );
      this.process.stderr!.on("data", (chunk: Buffer) => {
        const msg = chunk.toString().trim();
        if (msg) console.error(`[MCP:${this.name}] stderr: ${msg}`);
      });

      this.process.on("close", (code) => {
        this._status = "stopped";
        this.rejectAllPending(new Error(`Process exited with code ${code}`));
        this.emit("closed");
      });

      this.process.on("error", (err) => {
        this._status = "error";
        this._error = err.message;
        this.rejectAllPending(err);
        this.emit("error", err);
      });

      // Initialize MCP protocol
      await this.initialize();
      await this.discoverTools();

      this._status = "running";
      this._startedAt = Date.now();
      this.emit("ready");
    } catch (err) {
      this._status = "error";
      this._error = err instanceof Error ? err.message : String(err);
      this.kill();
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.kill();
    this._status = "stopped";
  }

  async restart(): Promise<void> {
    this._status = "restarting";
    this._restartCount++;
    this.kill();
    await this.start();
  }

  async callTool(
    toolName: string,
    args: Record<string, unknown> = {}
  ): Promise<MCPToolResult> {
    if (this._status !== "running") {
      await this.start();
    }

    this._lastUsed = Date.now();

    const result = (await this.sendRequest("tools/call", {
      name: toolName,
      arguments: args,
    })) as MCPToolResult;

    return result;
  }

  async listTools(): Promise<MCPToolDefinition[]> {
    if (this._status !== "running") {
      await this.start();
    }

    const result = (await this.sendRequest("tools/list")) as {
      tools: MCPToolDefinition[];
    };
    this._tools = result.tools || [];
    return this._tools;
  }

  // ===========================================================================
  // Private
  // ===========================================================================

  private async initialize(): Promise<void> {
    await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "gicm-fleet-api", version: "1.0.0" },
    });

    // Send initialized notification (no response expected)
    this.sendNotification("notifications/initialized");
  }

  private async discoverTools(): Promise<void> {
    const result = (await this.sendRequest("tools/list")) as {
      tools: MCPToolDefinition[];
    };
    this._tools = result.tools || [];
    this.emit("toolsChanged", this._tools);
  }

  private sendRequest(
    method: string,
    params?: Record<string, unknown>
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const timeoutMs = 30_000;

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      const request: JsonRpcRequest = {
        jsonrpc: "2.0",
        method,
        id,
        ...(params && { params }),
      };

      this.writeMessage(request);
    });
  }

  private sendNotification(
    method: string,
    params?: Record<string, unknown>
  ): void {
    const message: Record<string, unknown> = {
      jsonrpc: "2.0",
      method,
    };
    if (params) message.params = params;
    this.writeMessage(message);
  }

  private writeMessage(message: Record<string, unknown>): void {
    if (!this.process?.stdin?.writable) {
      throw new Error(`Cannot write to ${this.name}: process not running`);
    }
    const json = JSON.stringify(message);
    this.process.stdin.write(json + "\n");
  }

  private handleStdout(chunk: Buffer): void {
    this.buffer += chunk.toString();

    // Process newline-delimited JSON messages
    let newlineIndex: number;
    while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);

      if (!line) continue;

      try {
        const message = JSON.parse(line) as JsonRpcResponse;
        this.handleResponse(message);
      } catch {
        // Not valid JSON — could be server logging
        console.warn(
          `[MCP:${this.name}] Non-JSON stdout: ${line.slice(0, 200)}`
        );
      }
    }
  }

  private handleResponse(response: JsonRpcResponse): void {
    if (!response.id) return; // Notification — ignore

    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    this.pendingRequests.delete(response.id);
    clearTimeout(pending.timeout);

    if (response.error) {
      pending.reject(
        new Error(`MCP error ${response.error.code}: ${response.error.message}`)
      );
    } else {
      pending.resolve(response.result);
    }
  }

  private rejectAllPending(error: Error): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(error);
      this.pendingRequests.delete(id);
    }
  }

  private kill(): void {
    if (this.process) {
      this.rejectAllPending(new Error("Connection closed"));
      try {
        this.process.kill("SIGTERM");
      } catch {
        // Already dead
      }
      this.process = null;
    }
    this._tools = [];
  }
}
