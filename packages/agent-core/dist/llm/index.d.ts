import { z } from 'zod';

declare const LLMProviderSchema: z.ZodEnum<["openai", "anthropic", "gemini"]>;
type LLMProvider = z.infer<typeof LLMProviderSchema>;
declare const LLMConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["openai", "anthropic", "gemini"]>;
    model: z.ZodOptional<z.ZodString>;
    apiKey: z.ZodString;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    temperature: number;
    maxTokens: number;
    provider: "openai" | "anthropic" | "gemini";
    model?: string | undefined;
}, {
    apiKey: string;
    provider: "openai" | "anthropic" | "gemini";
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    model?: string | undefined;
}>;
type LLMConfig = z.infer<typeof LLMConfigSchema>;
interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: string;
}
interface LLMClient {
    chat(messages: LLMMessage[]): Promise<LLMResponse>;
    complete(prompt: string): Promise<string>;
}

declare class UniversalLLMClient implements LLMClient {
    private config;
    private model;
    constructor(config: LLMConfig);
    chat(messages: LLMMessage[]): Promise<LLMResponse>;
    complete(prompt: string): Promise<string>;
    private chatOpenAI;
    private chatAnthropic;
    private chatGemini;
}
declare function createLLMClient(config: LLMConfig): LLMClient;

export { type LLMClient, type LLMConfig, LLMConfigSchema, type LLMMessage, type LLMProvider, LLMProviderSchema, type LLMResponse, UniversalLLMClient, createLLMClient };
