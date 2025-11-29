import type { LLMClient, LLMConfig, LLMMessage, LLMResponse } from "./types.js";

interface OpenAIResponse {
  choices: Array<{ message: { content: string }; finish_reason?: string }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

interface AnthropicResponse {
  content: Array<{ text: string }>;
  usage?: { input_tokens: number; output_tokens: number };
  stop_reason?: string;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
}

const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  gemini: "gemini-1.5-pro",
};

export class UniversalLLMClient implements LLMClient {
  private config: LLMConfig;
  private model: string;

  constructor(config: LLMConfig) {
    this.config = config;
    this.model = config.model ?? DEFAULT_MODELS[config.provider];
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    switch (this.config.provider) {
      case "openai":
        return this.chatOpenAI(messages);
      case "anthropic":
        return this.chatAnthropic(messages);
      case "gemini":
        return this.chatGemini(messages);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.chat([{ role: "user", content: prompt }]);
    return response.content;
  }

  private async chatOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      finishReason: data.choices[0].finish_reason,
    };
  }

  private async chatAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.config.maxTokens,
        system: systemMessage?.content,
        messages: userMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
        totalTokens:
          (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      },
      finishReason: data.stop_reason,
    };
  }

  private async chatGemini(messages: LLMMessage[]): Promise<LLMResponse> {
    const systemMessage = messages.find((m) => m.role === "system");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessage
          ? { parts: [{ text: systemMessage.content }] }
          : undefined,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = (await response.json()) as GeminiResponse;
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }
}

export function createLLMClient(config: LLMConfig): LLMClient {
  return new UniversalLLMClient(config);
}
