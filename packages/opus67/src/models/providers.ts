/**
 * OPUS 67 Model Providers
 * API call implementations for different AI providers
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ModelCallResult, RequiredModelClientConfig } from "./types.js";
import type { RouteResult } from "./router.js";
import {
  calculateClaudeCost,
  calculateGeminiCost,
  calculateDeepSeekCost,
  getClaudeModelId,
} from "./pricing.js";

/**
 * Call Claude (Anthropic) API
 */
export async function callClaude(
  anthropic: Anthropic,
  prompt: string,
  config: RequiredModelClientConfig,
  systemPrompt?: string,
  route?: RouteResult
): Promise<ModelCallResult> {
  const modelId = getClaudeModelId(route?.tier);

  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system:
      systemPrompt ||
      "You are OPUS 67, an advanced AI assistant powered by Claude. Be helpful, accurate, and concise.",
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    content,
    model: modelId,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cost: calculateClaudeCost(
      response.usage.input_tokens,
      response.usage.output_tokens,
      modelId
    ),
    latencyMs: 0,
  };
}

/**
 * Call Gemini API
 */
export async function callGemini(
  prompt: string,
  config: RequiredModelClientConfig,
  systemPrompt?: string,
  route?: RouteResult
): Promise<ModelCallResult> {
  if (!config.geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  const modelId =
    route?.tier === "free" ? "gemini-1.5-flash" : "gemini-1.5-pro";
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  interface GeminiResponse {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  }
  const data = (await response.json()) as GeminiResponse;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const inputTokens = Math.ceil(fullPrompt.length / 4);
  const outputTokens = Math.ceil(content.length / 4);

  return {
    content,
    model: modelId,
    inputTokens,
    outputTokens,
    cost: calculateGeminiCost(inputTokens, outputTokens, modelId),
    latencyMs: 0,
  };
}

/**
 * Call DeepSeek API (OpenAI-compatible)
 */
export async function callDeepSeek(
  prompt: string,
  config: RequiredModelClientConfig,
  systemPrompt?: string
): Promise<ModelCallResult> {
  if (!config.deepseekApiKey) {
    throw new Error("DeepSeek API key not configured");
  }

  const modelId = "deepseek-chat";

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.deepseekApiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are OPUS 67, an advanced AI assistant. Be helpful, accurate, and concise.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  interface DeepSeekResponse {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }
  const data = (await response.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content || "";
  const inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
  const outputTokens =
    data.usage?.completion_tokens || Math.ceil(content.length / 4);

  return {
    content,
    model: modelId,
    inputTokens,
    outputTokens,
    cost: calculateDeepSeekCost(inputTokens, outputTokens),
    latencyMs: 0,
  };
}
