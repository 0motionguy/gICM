/**
 * OPUS 67 Model Client
 * Unified interface for calling AI models
 *
 * Refactored from 396 lines to ~120 lines by extracting:
 * - models/types.ts: Type definitions
 * - models/pricing.ts: Cost calculation functions
 * - models/providers.ts: Provider API calls
 */

import Anthropic from "@anthropic-ai/sdk";
import type { RouteResult } from "./router.js";
import type {
  ModelClientConfig,
  ModelCallResult,
  RequiredModelClientConfig,
  HealthCheckResult,
} from "./types.js";
import { callClaude, callGemini, callDeepSeek } from "./providers.js";

// Re-export types for backwards compatibility
export type { ModelClientConfig, ModelCallResult } from "./types.js";

/**
 * ModelClient - Unified interface for calling AI models
 */
export class ModelClient {
  private anthropic: Anthropic | null = null;
  private config: RequiredModelClientConfig;

  constructor(config?: ModelClientConfig) {
    this.config = {
      anthropicApiKey:
        config?.anthropicApiKey || process.env.ANTHROPIC_API_KEY || "",
      geminiApiKey: config?.geminiApiKey || process.env.GEMINI_API_KEY || "",
      deepseekApiKey:
        config?.deepseekApiKey || process.env.DEEPSEEK_API_KEY || "",
      defaultModel: config?.defaultModel || "claude-3-5-sonnet-20241022",
      maxTokens: config?.maxTokens || 4096,
      temperature: config?.temperature ?? 0.7,
    };

    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic({ apiKey: this.config.anthropicApiKey });
    }
  }

  /**
   * Call model based on route decision
   */
  async call(
    route: RouteResult,
    prompt: string,
    systemPrompt?: string
  ): Promise<ModelCallResult> {
    const startTime = performance.now();

    try {
      let result: ModelCallResult;

      const modelStr = String(route.model);
      if (
        modelStr.includes("claude") ||
        modelStr.includes("sonnet") ||
        modelStr.includes("opus") ||
        modelStr.includes("haiku")
      ) {
        result = await this.callClaudeProvider(prompt, systemPrompt, route);
      } else if (modelStr.includes("gemini")) {
        result = await callGemini(prompt, this.config, systemPrompt, route);
      } else if (modelStr.includes("deepseek")) {
        result = await callDeepSeek(prompt, this.config, systemPrompt);
      } else {
        result = await this.callClaudeProvider(prompt, systemPrompt, route);
      }

      result.latencyMs = performance.now() - startTime;
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `[OPUS67] Model ${route.model} failed: ${errorMessage}, trying fallback...`
      );
      return this.callWithFallback(route, prompt, systemPrompt, startTime);
    }
  }

  private async callClaudeProvider(
    prompt: string,
    systemPrompt?: string,
    route?: RouteResult
  ): Promise<ModelCallResult> {
    if (!this.anthropic) {
      throw new Error("Anthropic API key not configured");
    }
    return callClaude(this.anthropic, prompt, this.config, systemPrompt, route);
  }

  /**
   * Fallback chain: Claude → Gemini → DeepSeek
   */
  private async callWithFallback(
    route: RouteResult,
    prompt: string,
    systemPrompt?: string,
    startTime?: number
  ): Promise<ModelCallResult> {
    const fallbackOrder = ["claude", "gemini", "deepseek"];
    const triedModel = route.model.split("-")[0].toLowerCase();
    const modelsToTry = fallbackOrder.filter((m) => m !== triedModel);

    for (const model of modelsToTry) {
      try {
        let result: ModelCallResult;

        if (model === "claude" && this.anthropic) {
          result = await this.callClaudeProvider(prompt, systemPrompt);
        } else if (model === "gemini" && this.config.geminiApiKey) {
          result = await callGemini(prompt, this.config, systemPrompt);
        } else if (model === "deepseek" && this.config.deepseekApiKey) {
          result = await callDeepSeek(prompt, this.config, systemPrompt);
        } else {
          continue;
        }

        result.latencyMs = startTime ? performance.now() - startTime : 0;
        return result;
      } catch (e) {
        console.warn(`[OPUS67] Fallback to ${model} failed:`, e);
      }
    }

    throw new Error("All model providers failed. Check your API keys.");
  }

  /**
   * Check which providers are configured
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (this.anthropic) providers.push("claude");
    if (this.config.geminiApiKey) providers.push("gemini");
    if (this.config.deepseekApiKey) providers.push("deepseek");
    return providers;
  }

  /**
   * Quick health check
   */
  async healthCheck(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    if (this.anthropic) {
      try {
        await this.anthropic.messages.create({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        });
        results.push({ provider: "claude", status: "ok" });
      } catch (e) {
        results.push({
          provider: "claude",
          status: "error",
          message: String(e),
        });
      }
    }

    if (this.config.geminiApiKey) {
      results.push({
        provider: "gemini",
        status: "ok",
        message: "API key configured",
      });
    }
    if (this.config.deepseekApiKey) {
      results.push({
        provider: "deepseek",
        status: "ok",
        message: "API key configured",
      });
    }

    return results;
  }
}

// Singleton instance
export const modelClient = new ModelClient();

// Factory
export function createModelClient(config?: ModelClientConfig): ModelClient {
  return new ModelClient(config);
}
