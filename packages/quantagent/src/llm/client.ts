/**
 * LLM Client - Multi-provider support (Anthropic, OpenAI)
 */

import type { AgentConfig, LLMResponse } from "../agents/types.js";

export class LLMClient {
  private config: AgentConfig;
  private anthropicClient: any = null;
  private openaiClient: any = null;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  private async getAnthropicClient() {
    if (!this.anthropicClient) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      this.anthropicClient = new Anthropic();
    }
    return this.anthropicClient;
  }

  private async getOpenAIClient() {
    if (!this.openaiClient) {
      const { default: OpenAI } = await import("openai");
      this.openaiClient = new OpenAI();
    }
    return this.openaiClient;
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    if (this.config.llmProvider === "anthropic") {
      return this.completeWithAnthropic(systemPrompt, userPrompt);
    }
    return this.completeWithOpenAI(systemPrompt, userPrompt);
  }

  private async completeWithAnthropic(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    try {
      const client = await this.getAnthropicClient();

      const response = await client.messages.create({
        model: this.config.model || "claude-sonnet-4-20250514",
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature ?? 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        return content.text;
      }

      return "";
    } catch (error) {
      console.error("Anthropic API error:", error);
      throw error;
    }
  }

  private async completeWithOpenAI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    try {
      const client = await this.getOpenAIClient();

      const response = await client.chat.completions.create({
        model: this.config.model || "gpt-4o",
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature ?? 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  async completeWithResponse(
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const content = await this.complete(systemPrompt, userPrompt);
    return { content };
  }
}

/**
 * Create a default LLM client using environment variables
 */
export function createDefaultClient(): LLMClient {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  if (!hasAnthropic && !hasOpenAI) {
    console.warn(
      "No API keys found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY."
    );
  }

  return new LLMClient({
    llmProvider: hasAnthropic ? "anthropic" : "openai",
    model: hasAnthropic ? "claude-sonnet-4-20250514" : "gpt-4o",
    temperature: 0.3,
    maxTokens: 1000,
  });
}
