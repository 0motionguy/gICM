import { z } from "zod";

export const LLMProviderSchema = z.enum(["openai", "anthropic", "gemini"]);
export type LLMProvider = z.infer<typeof LLMProviderSchema>;

export const LLMConfigSchema = z.object({
  provider: LLMProviderSchema,
  model: z.string().optional(),
  apiKey: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(4096),
});
export type LLMConfig = z.infer<typeof LLMConfigSchema>;

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface LLMClient {
  chat(messages: LLMMessage[]): Promise<LLMResponse>;
  complete(prompt: string): Promise<string>;
}
