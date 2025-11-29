// src/llm/types.ts
import { z } from "zod";
var LLMProviderSchema = z.enum(["openai", "anthropic", "gemini"]);
var LLMConfigSchema = z.object({
  provider: LLMProviderSchema,
  model: z.string().optional(),
  apiKey: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(4096)
});

// src/llm/client.ts
var DEFAULT_MODELS = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  gemini: "gemini-1.5-pro"
};
var UniversalLLMClient = class {
  config;
  model;
  constructor(config) {
    this.config = config;
    this.model = config.model ?? DEFAULT_MODELS[config.provider];
  }
  async chat(messages) {
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
  async complete(prompt) {
    const response = await this.chat([{ role: "user", content: prompt }]);
    return response.content;
  }
  async chatOpenAI(messages) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0
      },
      finishReason: data.choices[0].finish_reason
    };
  }
  async chatAnthropic(messages) {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.config.maxTokens,
        system: systemMessage?.content,
        messages: userMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      })
    });
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
        totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)
      },
      finishReason: data.stop_reason
    };
  }
  async chatGemini(messages) {
    const systemMessage = messages.find((m) => m.role === "system");
    const contents = messages.filter((m) => m.role !== "system").map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.config.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : void 0,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      })
    });
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0
      }
    };
  }
};
function createLLMClient(config) {
  return new UniversalLLMClient(config);
}

export {
  LLMProviderSchema,
  LLMConfigSchema,
  UniversalLLMClient,
  createLLMClient
};
//# sourceMappingURL=chunk-RHNOKY72.js.map