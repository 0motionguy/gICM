/**
 * OPUS 67 LLM Benchmark - Model Adapters
 * Unified interface for Gemini and DeepSeek APIs
 */

import { MODELS, type ModelName, type LLMModel } from "./types.js";

export interface GenerationResponse {
  code: string;
  tokens_used: number;
  latency_ms: number;
  error?: string;
}

const CODE_GENERATION_PROMPT = `You are a Python expert. Complete the following function.
Return ONLY the function implementation code, no explanations.
Do not include the function signature or docstring - only the implementation body.

`;

export async function generateCode(
  modelName: ModelName,
  prompt: string
): Promise<GenerationResponse> {
  const model = MODELS[modelName];
  const startTime = Date.now();

  if (!model.apiKey) {
    return {
      code: "",
      tokens_used: 0,
      latency_ms: 0,
      error: `No API key for ${modelName}. Set ${modelName === "gemini" ? "GOOGLE_API_KEY" : "DEEPSEEK_API_KEY"}`,
    };
  }

  try {
    if (modelName === "gemini") {
      return await callGemini(model, prompt, startTime);
    } else {
      return await callDeepSeek(model, prompt, startTime);
    }
  } catch (error) {
    return {
      code: "",
      tokens_used: 0,
      latency_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function callGemini(
  model: LLMModel,
  prompt: string,
  startTime: number
): Promise<GenerationResponse> {
  const url = `${model.endpoint}?key=${model.apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: CODE_GENERATION_PROMPT + prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
    usageMetadata?: {
      totalTokenCount?: number;
    };
  };
  const latency = Date.now() - startTime;

  // Extract code from response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const code = extractCode(text);

  // Estimate tokens (Gemini doesn't always return token counts)
  const tokensUsed =
    data.usageMetadata?.totalTokenCount ||
    Math.ceil((prompt.length + code.length) / 4);

  return {
    code,
    tokens_used: tokensUsed,
    latency_ms: latency,
  };
}

async function callDeepSeek(
  model: LLMModel,
  prompt: string,
  startTime: number
): Promise<GenerationResponse> {
  const response = await fetch(model.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a Python expert. Return only code, no explanations.",
        },
        {
          role: "user",
          content: CODE_GENERATION_PROMPT + prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const latency = Date.now() - startTime;

  const text = data.choices?.[0]?.message?.content || "";
  const code = extractCode(text);

  const tokensUsed =
    (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

  return {
    code,
    tokens_used: tokensUsed || Math.ceil((prompt.length + code.length) / 4),
    latency_ms: latency,
  };
}

function extractCode(text: string): string {
  // Remove markdown code blocks
  let code = text.trim();

  // Remove ```python or ``` blocks
  const codeBlockMatch = code.match(/```(?:python)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    code = codeBlockMatch[1].trim();
  }

  // Remove leading/trailing quotes if present
  code = code.replace(/^["']|["']$/g, "");

  return code;
}

export function calculateCost(
  modelName: ModelName,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODELS[modelName];
  const inputCost = (inputTokens / 1_000_000) * model.cost.input;
  const outputCost = (outputTokens / 1_000_000) * model.cost.output;
  return inputCost + outputCost;
}
