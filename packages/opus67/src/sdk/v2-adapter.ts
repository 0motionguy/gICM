/**
 * OPUS 67 SDK V2 Adapter
 * Integrates with Claude Agent SDK V2 send()/receive()/done() pattern
 * Provides clean multi-turn agent communication
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

export class OPUS67AgentSDK extends EventEmitter<SDKEvents> {
  private sessions: Map<string, AgentSession> = new Map();
  private messageQueues: Map<string, AgentMessage[]> = new Map();
  private activeSession: string | null = null;
  private sessionCounter = 0;

  constructor() {
    super();
  }

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
    },
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
        error instanceof Error ? error : new Error(String(error)),
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
    },
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
    options?: { parallel?: boolean },
  ): Promise<FinalResult[]> {
    const parallel = options?.parallel ?? true;

    if (parallel) {
      // Spawn all in parallel
      const sessions = await Promise.all(
        agents.map((a) => this.spawn(a.agentId, a.task)),
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
      (s) => s.status === "active",
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

    return `
┌─ OPUS 67 SDK V2 ────────────────────────────────────────────────┐
│                                                                  │
│  Sessions: ${String(active).padEnd(3)} active / ${String(total).padEnd(3)} total                          │
│  Interface: send() / receive() / done()                          │
│  Compatibility: Claude Agent SDK V2                              │
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
