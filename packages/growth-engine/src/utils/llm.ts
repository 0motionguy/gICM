/**
 * LLM utility wrapper for Anthropic SDK
 */

import Anthropic from "@anthropic-ai/sdk";

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic();
  }
  return anthropicClient;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateText(options: GenerateOptions): Promise<string> {
  const client = getAnthropicClient();

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: options.prompt },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 4000,
    system: options.systemPrompt,
    messages,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return content.text;
}

export async function generateJSON<T>(options: GenerateOptions): Promise<T> {
  const text = await generateText({
    ...options,
    prompt: `${options.prompt}\n\nRespond with valid JSON only, no other text.`,
  });

  // Extract JSON from response
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) {
    throw new Error("No JSON found in response");
  }

  return JSON.parse(match[0]) as T;
}
