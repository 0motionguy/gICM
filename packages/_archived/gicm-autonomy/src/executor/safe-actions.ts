/**
 * Safe Actions Registry
 *
 * Defines and executes pre-approved action types.
 */

import type { Action } from "../core/types.js";
import { Logger } from "../utils/logger.js";

export type ActionHandler = (action: Action) => Promise<unknown>;

export class SafeActions {
  private handlers: Map<string, ActionHandler> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger("SafeActions");
    this.registerDefaultHandlers();
  }

  /**
   * Register a handler for an action type
   */
  register(actionType: string, handler: ActionHandler): void {
    this.handlers.set(actionType, handler);
    this.logger.debug("Registered handler for: " + actionType);
  }

  /**
   * Execute an action using registered handler
   */
  async execute(action: Action): Promise<unknown> {
    const handler = this.findHandler(action.type);

    if (!handler) {
      throw new Error("No handler registered for action type: " + action.type);
    }

    this.logger.info("Executing: " + action.type);
    const result = await handler(action);
    this.logger.info("Completed: " + action.type);

    return result;
  }

  /**
   * Check if action type has a handler
   */
  hasHandler(actionType: string): boolean {
    return this.findHandler(actionType) !== undefined;
  }

  /**
   * Find handler for action type (supports wildcards)
   */
  private findHandler(actionType: string): ActionHandler | undefined {
    // Exact match first
    if (this.handlers.has(actionType)) {
      return this.handlers.get(actionType);
    }

    // Check wildcard patterns
    for (const [pattern, handler] of this.handlers) {
      if (pattern.endsWith("*")) {
        const prefix = pattern.slice(0, -1);
        if (actionType.startsWith(prefix)) {
          return handler;
        }
      }
    }

    return undefined;
  }

  /**
   * Register default safe action handlers
   */
  private registerDefaultHandlers(): void {
    // Content generation (safe - just creates content)
    this.register("content:generate:*", async (action) => {
      this.logger.info("Content generation: " + JSON.stringify(action.params));
      return { generated: true, type: action.params.type };
    });

    // Tweet posting (safe within limits)
    this.register("twitter:post", async (action) => {
      this.logger.info("Twitter post: " + action.description);
      return { posted: true };
    });

    // Blog publishing (safe within limits)
    this.register("blog:publish", async (action) => {
      this.logger.info("Blog publish: " + action.description);
      return { published: true };
    });

    // DCA buy (safe - scheduled recurring)
    this.register("trading:dca:buy", async (action) => {
      const params = action.params as { amount?: number; token?: string };
      this.logger.info("DCA buy: " + params.amount + " " + params.token);
      return { executed: true, amount: params.amount };
    });

    // Code commit (safe within line limits)
    this.register("code:commit", async (action) => {
      this.logger.info("Code commit: " + action.description);
      return { committed: true };
    });

    // Discovery scan (safe - just reads)
    this.register("discovery:scan", async (action) => {
      this.logger.info("Discovery scan: " + action.params.source);
      return { scanned: true };
    });

    // Metric collection (safe - just reads)
    this.register("metrics:collect", async (action) => {
      this.logger.info("Metrics collection");
      return { collected: true };
    });

    // Status check (safe - just reads)
    this.register("status:check", async (action) => {
      this.logger.info("Status check: " + action.params.engine);
      return { checked: true };
    });
  }
}
