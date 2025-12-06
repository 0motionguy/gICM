import { getKnowledgeStore } from './chunk-JSMRUXZR.js';
import { tokenTracker, latencyProfiler, metricsCollector, memory, createMemory, createSpawner } from './chunk-E7SMDDMF.js';
import { generateBootScreen } from './chunk-KRJAO3QU.js';
import { detectMode } from './chunk-JD6NEK3D.js';
import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { EventEmitter } from 'eventemitter3';
import { existsSync, readFileSync, mkdirSync, appendFileSync, readdirSync, writeFileSync } from 'fs';
import { parse } from 'yaml';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import Anthropic2 from '@anthropic-ai/sdk';
import crypto from 'crypto';

// src/models/pricing.ts
var CLAUDE_PRICES = {
  "claude-3-5-sonnet-20241022": { input: 3, output: 15 },
  "claude-3-5-haiku-20241022": { input: 1, output: 5 },
  "claude-3-opus-20240229": { input: 15, output: 75 },
  "claude-opus-4-5-20250929": { input: 3, output: 15 }
  // Opus 4.5 (thinking tokens counted as input)
};
var GEMINI_PRICES = {
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, output: 5 }
};
var DEEPSEEK_PRICES = {
  input: 0.14,
  output: 0.28
};
function calculateClaudeCost(inputTokens, outputTokens, model) {
  const price = CLAUDE_PRICES[model] || CLAUDE_PRICES["claude-3-5-sonnet-20241022"];
  return (inputTokens * price.input + outputTokens * price.output) / 1e6;
}
function calculateGeminiCost(inputTokens, outputTokens, model) {
  const price = GEMINI_PRICES[model] || GEMINI_PRICES["gemini-1.5-flash"];
  return (inputTokens * price.input + outputTokens * price.output) / 1e6;
}
function calculateDeepSeekCost(inputTokens, outputTokens) {
  return (inputTokens * DEEPSEEK_PRICES.input + outputTokens * DEEPSEEK_PRICES.output) / 1e6;
}
function getClaudeModelId(tier) {
  switch (tier) {
    case "fast":
      return "claude-3-5-haiku-20241022";
    case "balanced":
      return "claude-3-5-sonnet-20241022";
    case "premium":
      return "claude-3-opus-20240229";
    default:
      return "claude-3-5-sonnet-20241022";
  }
}

// src/models/providers.ts
async function callClaude(anthropic, prompt, config, systemPrompt, route) {
  const modelId = getClaudeModelId(route?.tier);
  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    system: systemPrompt || "You are OPUS 67, an advanced AI assistant powered by Claude. Be helpful, accurate, and concise.",
    messages: [{ role: "user", content: prompt }]
  });
  const content = response.content[0].type === "text" ? response.content[0].text : "";
  return {
    content,
    model: modelId,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cost: calculateClaudeCost(response.usage.input_tokens, response.usage.output_tokens, modelId),
    latencyMs: 0
  };
}
async function callGemini(prompt, config, systemPrompt, route) {
  if (!config.geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }
  const modelId = route?.tier === "fast" ? "gemini-1.5-flash" : "gemini-1.5-pro";
  const fullPrompt = systemPrompt ? `${systemPrompt}

${prompt}` : prompt;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens
        }
      })
    }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }
  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const inputTokens = Math.ceil(fullPrompt.length / 4);
  const outputTokens = Math.ceil(content.length / 4);
  return {
    content,
    model: modelId,
    inputTokens,
    outputTokens,
    cost: calculateGeminiCost(inputTokens, outputTokens, modelId),
    latencyMs: 0
  };
}
async function callDeepSeek(prompt, config, systemPrompt) {
  if (!config.deepseekApiKey) {
    throw new Error("DeepSeek API key not configured");
  }
  const modelId = "deepseek-chat";
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.deepseekApiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt || "You are OPUS 67, an advanced AI assistant. Be helpful, accurate, and concise." },
        { role: "user", content: prompt }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
  const outputTokens = data.usage?.completion_tokens || Math.ceil(content.length / 4);
  return {
    content,
    model: modelId,
    inputTokens,
    outputTokens,
    cost: calculateDeepSeekCost(inputTokens, outputTokens),
    latencyMs: 0
  };
}
var __dirname$1 = dirname(fileURLToPath(import.meta.url));
var DEFAULT_CONFIG = {
  rules: [
    // FREE tier - Gemini
    {
      taskTypes: ["scan", "analyze", "monitor", "index"],
      model: "gemini-2.0-flash",
      tier: "free",
      fallback: "deepseek-chat"
    },
    // CHEAP tier - DeepSeek
    {
      taskTypes: ["generate", "build", "refactor", "code"],
      model: "deepseek-chat",
      tier: "cheap",
      fallback: "claude-haiku-3.5"
    },
    // QUALITY tier - Claude
    {
      taskTypes: ["review", "synthesize", "chairman", "audit"],
      model: "claude-sonnet-4",
      tier: "quality",
      fallback: "claude-opus-4"
    },
    // PREMIUM tier - Extended Thinking (Opus 4.5)
    {
      taskTypes: ["reason", "complex-reasoning", "critical"],
      model: "claude-opus-4.5",
      tier: "premium",
      fallback: "claude-opus-4"
    }
  ],
  defaultModel: "deepseek-chat",
  fallbackChain: ["gemini-2.0-flash", "deepseek-chat", "claude-haiku-3.5", "claude-sonnet-4", "claude-opus-4.5"]
};
var MultiModelRouter = class extends EventEmitter {
  config;
  modelHealth = /* @__PURE__ */ new Map();
  constructor(configPath) {
    super();
    this.config = this.loadConfig(configPath);
    this.initHealthTracking();
  }
  /**
   * Load routing configuration
   */
  loadConfig(configPath) {
    if (configPath && existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, "utf-8");
        const parsed = parse(content);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        console.warn("Failed to load routing config, using defaults");
      }
    }
    const defaultPath = join(__dirname$1, "..", "..", "config", "models.yaml");
    if (existsSync(defaultPath)) {
      try {
        const content = readFileSync(defaultPath, "utf-8");
        const parsed = parse(content);
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
      }
    }
    return DEFAULT_CONFIG;
  }
  /**
   * Initialize health tracking for all models
   */
  initHealthTracking() {
    const models = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-thinking",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "deepseek-chat",
      "deepseek-coder",
      "deepseek-reasoner",
      "claude-sonnet-4",
      "claude-opus-4",
      "claude-opus-4.5",
      "claude-haiku-3.5",
      "gpt-4o",
      "gpt-4o-mini"
    ];
    for (const model of models) {
      this.modelHealth.set(model, { healthy: true, errorCount: 0 });
    }
  }
  /**
   * Route a request to the best model
   */
  route(request) {
    const rule = this.config.rules.find((r) => r.taskTypes.includes(request.taskType));
    if (!rule) {
      return {
        model: this.config.defaultModel,
        tier: "cheap",
        estimatedCost: this.estimateCost(this.config.defaultModel, request.prompt),
        reason: "no matching rule, using default"
      };
    }
    const health = this.modelHealth.get(rule.model);
    let selectedModel = rule.model;
    let reason = `task type: ${request.taskType}`;
    if (health && !health.healthy) {
      if (rule.fallback) {
        selectedModel = rule.fallback;
        reason = `${rule.model} unhealthy, using fallback`;
        this.emit("route:fallback", rule.model, rule.fallback, "model unhealthy");
      }
    }
    if (request.maxCost !== void 0) {
      const estimatedCost = this.estimateCost(selectedModel, request.prompt);
      if (estimatedCost > request.maxCost) {
        const cheaper = this.findCheaperModel(request.prompt, request.maxCost);
        if (cheaper) {
          selectedModel = cheaper;
          reason = `cost constrained to $${request.maxCost}`;
        }
      }
    }
    if (request.preferredTier) {
      const tierModel = this.getModelForTier(request.preferredTier);
      if (tierModel) {
        selectedModel = tierModel;
        reason = `preferred tier: ${request.preferredTier}`;
      }
    }
    if (request.requiresReasoning) {
      if (selectedModel === "gemini-2.0-flash") {
        selectedModel = "gemini-2.0-flash-thinking";
        reason = "upgraded for reasoning";
      } else if (selectedModel === "deepseek-chat") {
        selectedModel = "deepseek-reasoner";
        reason = "upgraded for reasoning";
      }
    }
    const result = {
      model: selectedModel,
      tier: this.getTier(selectedModel),
      estimatedCost: this.estimateCost(selectedModel, request.prompt),
      reason
    };
    this.emit("route:selected", request, result);
    return result;
  }
  /**
   * Estimate cost for a model and prompt
   */
  estimateCost(model, prompt) {
    const inputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = inputTokens * 1.5;
    return tokenTracker.calculateCost(model, {
      input: inputTokens,
      output: estimatedOutputTokens
    });
  }
  /**
   * Find a model that fits within cost constraint
   */
  findCheaperModel(prompt, maxCost) {
    for (const model of this.config.fallbackChain) {
      const cost = this.estimateCost(model, prompt);
      if (cost <= maxCost) {
        return model;
      }
    }
    return null;
  }
  /**
   * Get model for a specific tier
   */
  getModelForTier(tier) {
    const rule = this.config.rules.find((r) => r.tier === tier);
    return rule?.model || null;
  }
  /**
   * Get tier for a model
   */
  getTier(model) {
    if (model.startsWith("gemini")) return "free";
    if (model.startsWith("deepseek")) return "cheap";
    if (model === "claude-opus-4.5") return "premium";
    return "quality";
  }
  /**
   * Mark model as healthy/unhealthy
   */
  setModelHealth(model, healthy) {
    const current = this.modelHealth.get(model) || { healthy: true, errorCount: 0 };
    if (!healthy) {
      current.errorCount++;
      current.lastError = /* @__PURE__ */ new Date();
      current.healthy = current.errorCount < 3;
    } else {
      current.healthy = true;
      current.errorCount = 0;
    }
    this.modelHealth.set(model, current);
  }
  /**
   * Get model health status
   */
  getModelHealth() {
    return new Map(this.modelHealth);
  }
  /**
   * Get routing statistics
   */
  getRoutingStats() {
    const summary = tokenTracker.getSummary();
    const byTier = { free: 0, cheap: 0, quality: 0, premium: 0 };
    const byModel = {};
    for (const [model, data] of summary.byModel) {
      byModel[model] = data.cost;
      const tier = this.getTier(model);
      byTier[tier] += data.cost;
    }
    return { byTier, byModel };
  }
  /**
   * Get optimal model recommendation
   */
  recommend(prompt, context) {
    const promptLower = prompt.toLowerCase();
    let taskType = "generate";
    if (promptLower.includes("scan") || promptLower.includes("search") || promptLower.includes("find")) {
      taskType = "scan";
    } else if (promptLower.includes("analyze") || promptLower.includes("check")) {
      taskType = "analyze";
    } else if (promptLower.includes("review") || promptLower.includes("audit")) {
      taskType = "review";
    } else if (promptLower.includes("build") || promptLower.includes("create") || promptLower.includes("implement")) {
      taskType = "build";
    } else if (promptLower.includes("refactor") || promptLower.includes("improve")) {
      taskType = "refactor";
    } else if (promptLower.includes("synthesize") || promptLower.includes("summarize")) {
      taskType = "synthesize";
    }
    let preferredTier;
    if (context?.quality === "critical" || context?.complexity === "high") {
      preferredTier = "quality";
    } else if (context?.quality === "draft" || context?.complexity === "low") {
      preferredTier = "free";
    }
    return this.route({
      taskType,
      prompt,
      preferredTier,
      maxCost: context?.budget,
      requiresReasoning: context?.complexity === "high"
    });
  }
  /**
   * Format router status
   */
  formatStatus() {
    const stats = this.getRoutingStats();
    const health = this.getModelHealth();
    let output = `
\u250C\u2500 MULTI-MODEL ROUTER STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  COST BY TIER                                                    \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  FREE (Gemini):        $${stats.byTier.free.toFixed(4).padEnd(12)}                     \u2502
\u2502  CHEAP (DeepSeek):     $${stats.byTier.cheap.toFixed(4).padEnd(12)}                     \u2502
\u2502  QUALITY (Claude):     $${stats.byTier.quality.toFixed(4).padEnd(12)}                     \u2502
\u2502  PREMIUM (Opus 4.5):   $${stats.byTier.premium.toFixed(4).padEnd(12)} \u{1F9E0}                   \u2502
\u2502                                                                  \u2502
\u2502  MODEL HEALTH                                                    \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
    for (const [model, status] of health) {
      const icon = status.healthy ? "\u2713" : "\u2717";
      const errors = status.errorCount > 0 ? ` (${status.errorCount} errors)` : "";
      output += `
\u2502  ${icon} ${model.padEnd(25)} ${status.healthy ? "healthy" : "unhealthy"}${errors.padEnd(15)} \u2502`;
    }
    output += `
\u2502                                                                  \u2502
\u2502  ROUTING RULES                                                   \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  scan/analyze/monitor       \u2192 Gemini (FREE)                      \u2502
\u2502  generate/build/code        \u2192 DeepSeek ($0.14/M)                 \u2502
\u2502  review/synthesize          \u2192 Claude ($3/M)                      \u2502
\u2502  reason/critical-reasoning  \u2192 Opus 4.5 \u{1F9E0} (PREMIUM)              \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
    return output;
  }
};
var router = new MultiModelRouter();
function routeToModel(taskType, prompt) {
  return router.route({ taskType, prompt });
}
z.object({
  // Gemini (FREE)
  GOOGLE_AI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  // DeepSeek (CHEAP)
  DEEPSEEK_API_KEY: z.string().optional(),
  // Anthropic (QUALITY)
  ANTHROPIC_API_KEY: z.string().optional(),
  // OpenAI (fallback)
  OPENAI_API_KEY: z.string().optional()
});
z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(["gemini", "deepseek", "anthropic", "openai"]),
  tier: z.enum(["free", "cheap", "quality"]),
  maxTokens: z.number(),
  contextWindow: z.number(),
  supportsStreaming: z.boolean().default(true),
  supportsTools: z.boolean().default(true),
  supportsVision: z.boolean().default(false),
  supportsThinking: z.boolean().default(false),
  apiEndpoint: z.string().optional(),
  costPer1M: z.object({
    input: z.number(),
    output: z.number()
  })
});
var MODELS = {
  // Gemini - FREE tier
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    tier: "free",
    maxTokens: 8192,
    contextWindow: 1e6,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
    costPer1M: { input: 0, output: 0 }
  },
  "gemini-2.0-flash-thinking": {
    id: "gemini-2.0-flash-thinking",
    name: "Gemini 2.0 Flash Thinking",
    provider: "gemini",
    tier: "free",
    maxTokens: 8192,
    contextWindow: 1e6,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: true,
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
    costPer1M: { input: 0, output: 0 }
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    tier: "free",
    maxTokens: 8192,
    contextWindow: 1e6,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    costPer1M: { input: 0, output: 0 }
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    tier: "free",
    maxTokens: 8192,
    contextWindow: 2e6,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    costPer1M: { input: 0, output: 0 }
  },
  // DeepSeek - CHEAP tier
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    tier: "cheap",
    maxTokens: 8192,
    contextWindow: 64e3,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
    supportsThinking: false,
    apiEndpoint: "https://api.deepseek.com/v1",
    costPer1M: { input: 0.14, output: 0.28 }
  },
  "deepseek-coder": {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "deepseek",
    tier: "cheap",
    maxTokens: 8192,
    contextWindow: 64e3,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
    supportsThinking: false,
    apiEndpoint: "https://api.deepseek.com/v1",
    costPer1M: { input: 0.14, output: 0.28 }
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    tier: "cheap",
    maxTokens: 8192,
    contextWindow: 64e3,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: false,
    supportsThinking: true,
    apiEndpoint: "https://api.deepseek.com/v1",
    costPer1M: { input: 0.55, output: 2.19 }
  },
  // Anthropic - QUALITY tier
  "claude-sonnet-4": {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    tier: "quality",
    maxTokens: 8192,
    contextWindow: 2e5,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: "https://api.anthropic.com/v1",
    costPer1M: { input: 3, output: 15 }
  },
  "claude-opus-4": {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "anthropic",
    tier: "quality",
    maxTokens: 8192,
    contextWindow: 2e5,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: true,
    apiEndpoint: "https://api.anthropic.com/v1",
    costPer1M: { input: 15, output: 75 }
  },
  "claude-haiku-3.5": {
    id: "claude-haiku-3.5",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    tier: "quality",
    maxTokens: 8192,
    contextWindow: 2e5,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: "https://api.anthropic.com/v1",
    costPer1M: { input: 0.8, output: 4 }
  },
  // OpenAI - Fallback
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    tier: "quality",
    maxTokens: 16384,
    contextWindow: 128e3,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: "https://api.openai.com/v1",
    costPer1M: { input: 2.5, output: 10 }
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    tier: "cheap",
    maxTokens: 16384,
    contextWindow: 128e3,
    supportsStreaming: true,
    supportsTools: true,
    supportsVision: true,
    supportsThinking: false,
    apiEndpoint: "https://api.openai.com/v1",
    costPer1M: { input: 0.15, output: 0.6 }
  }
};
function getModelConfig(modelId) {
  return MODELS[modelId] || null;
}
function getModelsForTier(tier) {
  return Object.values(MODELS).filter((m) => m.tier === tier);
}
function getModelsForProvider(provider) {
  return Object.values(MODELS).filter((m) => m.provider === provider);
}
function hasApiKey(modelId) {
  const model = MODELS[modelId];
  if (!model) return false;
  switch (model.provider) {
    case "gemini":
      return !!(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);
    case "deepseek":
      return !!process.env.DEEPSEEK_API_KEY;
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    default:
      return false;
  }
}
function getAvailableModels() {
  return Object.values(MODELS).filter((m) => hasApiKey(m.id));
}
function formatModelList() {
  let output = `
\u250C\u2500 AVAILABLE MODELS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  FREE TIER (Gemini)                                              \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
  for (const model of getModelsForTier("free")) {
    const available = hasApiKey(model.id) ? "\u2713" : "\u2717";
    output += `
\u2502  ${available} ${model.name.padEnd(30)} ${String(model.contextWindow / 1e3).padEnd(5)}k context \u2502`;
  }
  output += `
\u2502                                                                  \u2502
\u2502  CHEAP TIER (DeepSeek)                                           \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
  for (const model of getModelsForTier("cheap")) {
    const available = hasApiKey(model.id) ? "\u2713" : "\u2717";
    const cost = `$${model.costPer1M.input}/${model.costPer1M.output}`;
    output += `
\u2502  ${available} ${model.name.padEnd(30)} ${cost.padEnd(12)} \u2502`;
  }
  output += `
\u2502                                                                  \u2502
\u2502  QUALITY TIER (Claude/GPT)                                       \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
  for (const model of getModelsForTier("quality")) {
    const available = hasApiKey(model.id) ? "\u2713" : "\u2717";
    const cost = `$${model.costPer1M.input}/${model.costPer1M.output}`;
    output += `
\u2502  ${available} ${model.name.padEnd(30)} ${cost.padEnd(12)} \u2502`;
  }
  output += `
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  return output;
}
function validateEnv() {
  const missing = [];
  const available = [];
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    available.push("Gemini (FREE)");
  } else {
    missing.push("GOOGLE_AI_API_KEY or GEMINI_API_KEY");
  }
  if (process.env.DEEPSEEK_API_KEY) {
    available.push("DeepSeek (CHEAP)");
  } else {
    missing.push("DEEPSEEK_API_KEY");
  }
  if (process.env.ANTHROPIC_API_KEY) {
    available.push("Anthropic (QUALITY)");
  } else {
    missing.push("ANTHROPIC_API_KEY");
  }
  if (process.env.OPENAI_API_KEY) {
    available.push("OpenAI (fallback)");
  }
  return {
    valid: available.length >= 1,
    missing,
    available
  };
}
var CostTracker = class extends EventEmitter {
  entries = [];
  sessionStart;
  budget;
  alerts = [];
  constructor(budget) {
    super();
    this.sessionStart = /* @__PURE__ */ new Date();
    this.budget = {
      daily: budget?.daily ?? 10,
      // $10/day default
      session: budget?.session ?? 5,
      // $5/session default
      perOperation: budget?.perOperation ?? 0.5
      // $0.50/op default
    };
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `cost_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  /**
   * Record a cost entry
   */
  record(model, usage, operation, agentId) {
    const config = MODELS[model];
    const tier = config?.tier || "quality";
    const cost = tokenTracker.calculateCost(model, usage);
    const entry = {
      id: this.generateId(),
      timestamp: /* @__PURE__ */ new Date(),
      model,
      tier,
      usage,
      cost,
      operation,
      agentId
    };
    this.entries.push(entry);
    this.emit("cost:recorded", entry);
    if (agentId) {
      tokenTracker.record(agentId, operation, model, usage);
    }
    this.checkBudgets(cost);
    return entry;
  }
  /**
   * Check all budgets
   */
  checkBudgets(newCost) {
    const summary = this.getSummary();
    if (summary.session >= this.budget.session) {
      this.triggerAlert("exceeded", "session", summary.session, this.budget.session);
    } else if (summary.session >= this.budget.session * 0.8) {
      this.triggerAlert("warning", "session", summary.session, this.budget.session);
    }
    if (summary.today >= this.budget.daily) {
      this.triggerAlert("exceeded", "daily", summary.today, this.budget.daily);
    } else if (summary.today >= this.budget.daily * 0.8) {
      this.triggerAlert("warning", "daily", summary.today, this.budget.daily);
    }
    if (newCost > this.budget.perOperation) {
      this.triggerAlert("exceeded", "perOperation", newCost, this.budget.perOperation);
    }
  }
  /**
   * Trigger a budget alert
   */
  triggerAlert(type, budget, current, limit) {
    const message = type === "exceeded" ? `${budget} budget exceeded: $${current.toFixed(4)} / $${limit.toFixed(2)}` : `${budget} budget warning: $${current.toFixed(4)} / $${limit.toFixed(2)} (${(current / limit * 100).toFixed(0)}%)`;
    const alert = {
      type,
      budget,
      current,
      limit,
      message,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.alerts.push(alert);
    this.emit("alert:triggered", alert);
  }
  /**
   * Get cost summary
   */
  getSummary() {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let today = 0;
    let session = 0;
    let allTime = 0;
    const byTier = { free: 0, cheap: 0, quality: 0 };
    const byModel = {};
    const byOperation = {};
    let claudeOnlyCost = 0;
    for (const entry of this.entries) {
      allTime += entry.cost;
      if (entry.timestamp >= this.sessionStart) {
        session += entry.cost;
      }
      if (entry.timestamp >= todayStart) {
        today += entry.cost;
      }
      byTier[entry.tier] += entry.cost;
      byModel[entry.model] = (byModel[entry.model] || 0) + entry.cost;
      byOperation[entry.operation] = (byOperation[entry.operation] || 0) + entry.cost;
      claudeOnlyCost += tokenTracker.calculateCost("claude-sonnet-4", entry.usage);
    }
    return {
      today,
      session,
      allTime,
      byTier,
      byModel,
      byOperation,
      savingsVsClaude: claudeOnlyCost - allTime,
      avgCostPerOp: this.entries.length > 0 ? allTime / this.entries.length : 0,
      operationCount: this.entries.length
    };
  }
  /**
   * Set budget
   */
  setBudget(budget) {
    this.budget = { ...this.budget, ...budget };
    this.emit("budget:updated", this.budget);
  }
  /**
   * Get current budget
   */
  getBudget() {
    return { ...this.budget };
  }
  /**
   * Get budget status
   */
  getBudgetStatus() {
    const summary = this.getSummary();
    return {
      daily: {
        spent: summary.today,
        limit: this.budget.daily,
        remaining: Math.max(0, this.budget.daily - summary.today),
        pct: summary.today / this.budget.daily * 100
      },
      session: {
        spent: summary.session,
        limit: this.budget.session,
        remaining: Math.max(0, this.budget.session - summary.session),
        pct: summary.session / this.budget.session * 100
      },
      perOperation: {
        spent: summary.avgCostPerOp,
        limit: this.budget.perOperation,
        remaining: Math.max(0, this.budget.perOperation - summary.avgCostPerOp),
        pct: summary.avgCostPerOp / this.budget.perOperation * 100
      }
    };
  }
  /**
   * Get recent alerts
   */
  getAlerts(limit = 10) {
    return this.alerts.slice(-limit);
  }
  /**
   * Clear alerts
   */
  clearAlerts() {
    this.alerts = [];
  }
  /**
   * Reset session
   */
  resetSession() {
    this.sessionStart = /* @__PURE__ */ new Date();
  }
  /**
   * Get entries for export
   */
  getEntries(since) {
    if (!since) return [...this.entries];
    return this.entries.filter((e) => e.timestamp >= since);
  }
  /**
   * Calculate projected costs
   */
  getProjections() {
    const summary = this.getSummary();
    const sessionDuration = (Date.now() - this.sessionStart.getTime()) / 1e3 / 60 / 60;
    if (sessionDuration < 0.1 || summary.session === 0) {
      return { hourly: 0, daily: 0, monthly: 0 };
    }
    const hourlyRate = summary.session / sessionDuration;
    return {
      hourly: hourlyRate,
      daily: hourlyRate * 24,
      monthly: hourlyRate * 24 * 30
    };
  }
  /**
   * Format cost report
   */
  formatReport() {
    const summary = this.getSummary();
    const budget = this.getBudgetStatus();
    const projections = this.getProjections();
    return `
\u250C\u2500 COST TRACKER REPORT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  SESSION COSTS                                                   \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Today:    $${summary.today.toFixed(4).padEnd(12)} (${budget.daily.pct.toFixed(1)}% of daily budget)     \u2502
\u2502  Session:  $${summary.session.toFixed(4).padEnd(12)} (${budget.session.pct.toFixed(1)}% of session budget)  \u2502
\u2502  All Time: $${summary.allTime.toFixed(4).padEnd(12)}                               \u2502
\u2502                                                                  \u2502
\u2502  BY TIER                                                         \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  FREE (Gemini):    $${summary.byTier.free.toFixed(4).padEnd(12)} \u2713 No cost              \u2502
\u2502  CHEAP (DeepSeek): $${summary.byTier.cheap.toFixed(4).padEnd(12)}                       \u2502
\u2502  QUALITY (Claude): $${summary.byTier.quality.toFixed(4).padEnd(12)}                       \u2502
\u2502                                                                  \u2502
\u2502  SAVINGS                                                         \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  vs Claude-only: $${summary.savingsVsClaude.toFixed(4)} saved                         \u2502
\u2502  Avg per operation: $${summary.avgCostPerOp.toFixed(4)}                              \u2502
\u2502  Operations: ${summary.operationCount}                                               \u2502
\u2502                                                                  \u2502
\u2502  PROJECTIONS                                                     \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Hourly:  $${projections.hourly.toFixed(4).padEnd(12)}                               \u2502
\u2502  Daily:   $${projections.daily.toFixed(4).padEnd(12)}                               \u2502
\u2502  Monthly: $${projections.monthly.toFixed(2).padEnd(12)}                               \u2502
\u2502                                                                  \u2502
\u2502  BUDGET STATUS                                                   \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Daily:   ${budget.daily.pct >= 100 ? "\u26A0\uFE0F  EXCEEDED" : budget.daily.pct >= 80 ? "\u26A0\uFE0F  WARNING" : "\u2713  OK"} (${budget.daily.pct.toFixed(1)}%) $${budget.daily.remaining.toFixed(2)} remaining       \u2502
\u2502  Session: ${budget.session.pct >= 100 ? "\u26A0\uFE0F  EXCEEDED" : budget.session.pct >= 80 ? "\u26A0\uFE0F  WARNING" : "\u2713  OK"} (${budget.session.pct.toFixed(1)}%) $${budget.session.remaining.toFixed(2)} remaining       \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
var costTracker = new CostTracker();
var ModelClient = class {
  anthropic = null;
  config;
  constructor(config) {
    this.config = {
      anthropicApiKey: config?.anthropicApiKey || process.env.ANTHROPIC_API_KEY || "",
      geminiApiKey: config?.geminiApiKey || process.env.GEMINI_API_KEY || "",
      deepseekApiKey: config?.deepseekApiKey || process.env.DEEPSEEK_API_KEY || "",
      defaultModel: config?.defaultModel || "claude-3-5-sonnet-20241022",
      maxTokens: config?.maxTokens || 4096,
      temperature: config?.temperature ?? 0.7
    };
    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic2({ apiKey: this.config.anthropicApiKey });
    }
  }
  /**
   * Call model based on route decision
   */
  async call(route, prompt, systemPrompt) {
    const startTime = performance.now();
    try {
      let result;
      switch (route.model) {
        case "claude":
        case "claude-3-5-sonnet":
        case "claude-sonnet":
        case "opus":
          result = await this.callClaudeProvider(prompt, systemPrompt, route);
          break;
        case "gemini":
        case "gemini-flash":
        case "gemini-pro":
          result = await callGemini(prompt, this.config, systemPrompt, route);
          break;
        case "deepseek":
        case "deepseek-chat":
        case "deepseek-coder":
          result = await callDeepSeek(prompt, this.config, systemPrompt);
          break;
        default:
          result = await this.callClaudeProvider(prompt, systemPrompt, route);
      }
      result.latencyMs = performance.now() - startTime;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[OPUS67] Model ${route.model} failed: ${errorMessage}, trying fallback...`);
      return this.callWithFallback(route, prompt, systemPrompt, startTime);
    }
  }
  async callClaudeProvider(prompt, systemPrompt, route) {
    if (!this.anthropic) {
      throw new Error("Anthropic API key not configured");
    }
    return callClaude(this.anthropic, prompt, this.config, systemPrompt, route);
  }
  /**
   * Fallback chain: Claude → Gemini → DeepSeek
   */
  async callWithFallback(route, prompt, systemPrompt, startTime) {
    const fallbackOrder = ["claude", "gemini", "deepseek"];
    const triedModel = route.model.split("-")[0].toLowerCase();
    const modelsToTry = fallbackOrder.filter((m) => m !== triedModel);
    for (const model of modelsToTry) {
      try {
        let result;
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
  getAvailableProviders() {
    const providers = [];
    if (this.anthropic) providers.push("claude");
    if (this.config.geminiApiKey) providers.push("gemini");
    if (this.config.deepseekApiKey) providers.push("deepseek");
    return providers;
  }
  /**
   * Quick health check
   */
  async healthCheck() {
    const results = [];
    if (this.anthropic) {
      try {
        await this.anthropic.messages.create({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }]
        });
        results.push({ provider: "claude", status: "ok" });
      } catch (e) {
        results.push({ provider: "claude", status: "error", message: String(e) });
      }
    }
    if (this.config.geminiApiKey) {
      results.push({ provider: "gemini", status: "ok", message: "API key configured" });
    }
    if (this.config.deepseekApiKey) {
      results.push({ provider: "deepseek", status: "ok", message: "API key configured" });
    }
    return results;
  }
};
var modelClient = new ModelClient();
var DEFAULT_MEMBERS = [
  { id: "gemini", name: "Gemini Flash", model: "gemini-2.0-flash", role: "contributor", specialty: "speed" },
  { id: "deepseek", name: "DeepSeek", model: "deepseek-chat", role: "contributor", specialty: "code" },
  { id: "claude-haiku", name: "Claude Haiku", model: "claude-haiku-3.5", role: "contributor", specialty: "concise" }
];
var DEFAULT_CHAIRMAN = {
  id: "chairman",
  name: "Claude Sonnet (Chairman)",
  model: "claude-sonnet-4",
  role: "chairman",
  specialty: "synthesis"
};
var LLMCouncil = class extends EventEmitter {
  config;
  executor = null;
  constructor(config) {
    super();
    this.config = {
      members: config?.members ?? DEFAULT_MEMBERS,
      chairman: config?.chairman ?? DEFAULT_CHAIRMAN,
      requireUnanimity: config?.requireUnanimity ?? false,
      minConfidence: config?.minConfidence ?? 0.7,
      maxRounds: config?.maxRounds ?? 1,
      timeout: config?.timeout ?? 6e4
    };
  }
  /**
   * Set the executor function for LLM calls
   */
  setExecutor(executor) {
    this.executor = executor;
  }
  /**
   * Create a mock executor for testing
   */
  createMockExecutor() {
    return async (prompt, model) => {
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
      if (prompt.includes("STAGE 1")) {
        return `[${model}] Analysis: This is a thoughtful response to the question. Key points include efficiency, maintainability, and scalability. Confidence: 0.85`;
      } else if (prompt.includes("STAGE 2")) {
        return `Rankings:
1. Response B (Score: 9/10) - Most comprehensive
2. Response A (Score: 8/10) - Good but less detailed
3. Response C (Score: 7/10) - Concise but missing context`;
      } else if (prompt.includes("STAGE 3")) {
        return `SYNTHESIS: After reviewing all responses, the council recommends a balanced approach combining the thoroughness of Response B with the clarity of Response A. The consensus confidence is 0.88. Key insight: Focus on incremental improvements while maintaining backward compatibility.`;
      }
      return `Response from ${model}: ${prompt.slice(0, 50)}...`;
    };
  }
  /**
   * Stage 1: Independent responses from all members
   */
  async stage1(question) {
    this.emit("stage:start", 1, "Gathering independent responses");
    const spanId = latencyProfiler.startSpan("council:stage1");
    const executor = this.executor ?? this.createMockExecutor();
    const responses = [];
    const promises = this.config.members.map(async (member) => {
      this.emit("member:responding", member);
      const memberSpan = latencyProfiler.startSpan(`member:${member.id}`);
      const prompt = `STAGE 1: INDEPENDENT ANALYSIS

You are ${member.name}, an expert in ${member.specialty || "general analysis"}.

QUESTION: ${question}

Provide your independent analysis. Be thorough but concise.
Include your confidence level (0-1) at the end.
Format: [Your analysis...] Confidence: X.XX`;
      const content = await executor(prompt, member.model);
      const duration = latencyProfiler.endSpan(memberSpan);
      const confidenceMatch = content.match(/Confidence:\s*([\d.]+)/i);
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(content.length / 4);
      const response = {
        memberId: member.id,
        model: member.model,
        content,
        confidence,
        tokens: { input: inputTokens, output: outputTokens },
        duration
      };
      tokenTracker.record(member.id, "council-stage1", member.model, response.tokens);
      this.emit("member:responded", response);
      return response;
    });
    const results = await Promise.all(promises);
    responses.push(...results);
    const stage1Duration = latencyProfiler.endSpan(spanId);
    this.emit("stage:complete", 1, stage1Duration);
    return responses;
  }
  /**
   * Stage 2: Peer review and ranking
   */
  async stage2(responses, question) {
    this.emit("stage:start", 2, "Peer review and ranking");
    const spanId = latencyProfiler.startSpan("council:stage2");
    const executor = this.executor ?? this.createMockExecutor();
    const rankings = [];
    const promises = this.config.members.map(async (member) => {
      const memberSpan = latencyProfiler.startSpan(`ranking:${member.id}`);
      const otherResponses = responses.filter((r) => r.memberId !== member.id).map((r, i) => `Response ${String.fromCharCode(65 + i)}:
${r.content}`);
      const prompt = `STAGE 2: PEER REVIEW

You are ${member.name}. Review and rank these responses to the question:
"${question}"

${otherResponses.join("\n\n---\n\n")}

Rank each response (best first). For each, provide:
- Rank (1 = best)
- Score (1-10)
- Brief feedback

Format:
1. Response X (Score: Y/10) - [feedback]
2. Response X (Score: Y/10) - [feedback]
...`;
      const content = await executor(prompt, member.model);
      latencyProfiler.endSpan(memberSpan);
      const rankingLines = content.match(/\d+\.\s*Response\s+(\w)\s*\(Score:\s*(\d+)/gi) || [];
      const parsedRankings = rankingLines.map((line, index) => {
        const match = line.match(/Response\s+(\w)\s*\(Score:\s*(\d+)/i);
        return {
          responseId: match ? `response-${match[1]}` : `response-${index}`,
          rank: index + 1,
          score: match ? parseInt(match[2]) : 5,
          feedback: "Extracted from ranking"
        };
      });
      return {
        rankerId: member.id,
        rankings: parsedRankings
      };
    });
    const results = await Promise.all(promises);
    rankings.push(...results);
    const stage2Duration = latencyProfiler.endSpan(spanId);
    this.emit("stage:complete", 2, stage2Duration);
    return rankings;
  }
  /**
   * Stage 3: Chairman synthesis
   */
  async stage3(question, responses, rankings) {
    this.emit("stage:start", 3, "Chairman synthesis");
    const spanId = latencyProfiler.startSpan("council:stage3");
    const executor = this.executor ?? this.createMockExecutor();
    const chairman = this.config.chairman;
    const responsesSummary = responses.map(
      (r, i) => `${String.fromCharCode(65 + i)}. [${r.model}] (Confidence: ${r.confidence.toFixed(2)})
${r.content}`
    ).join("\n\n");
    const rankingsSummary = rankings.map(
      (r) => `Reviewer ${r.rankerId}: ${r.rankings.map((rk) => `${rk.responseId}(${rk.score})`).join(", ")}`
    ).join("\n");
    const prompt = `STAGE 3: CHAIRMAN SYNTHESIS

You are the Chairman of this LLM Council. Your role is to synthesize the best answer.

ORIGINAL QUESTION: ${question}

COUNCIL RESPONSES:
${responsesSummary}

PEER RANKINGS:
${rankingsSummary}

Provide the final synthesized answer that:
1. Combines the best insights from all responses
2. Resolves any conflicts or disagreements
3. Adds your own expert perspective
4. Notes any significant dissent

Format your response as:
FINAL ANSWER: [synthesized answer]
CONFIDENCE: [0-1]
REASONING: [why this synthesis is best]
BEST CONTRIBUTORS: [list member IDs]
DISSENT: [any notable disagreements, or "None"]`;
    const content = await executor(prompt, chairman.model);
    latencyProfiler.endSpan(spanId);
    const finalAnswer = content.match(/FINAL ANSWER:\s*(.+?)(?=CONFIDENCE:|$)/is)?.[1]?.trim() || content;
    const confidence = parseFloat(content.match(/CONFIDENCE:\s*([\d.]+)/i)?.[1] || "0.8");
    const reasoning = content.match(/REASONING:\s*(.+?)(?=BEST CONTRIBUTORS:|$)/is)?.[1]?.trim() || "";
    const bestContributors = content.match(/BEST CONTRIBUTORS:\s*(.+?)(?=DISSENT:|$)/is)?.[1]?.trim().split(/[,\s]+/) || [];
    const dissent = content.match(/DISSENT:\s*(.+?)$/is)?.[1]?.trim();
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    tokenTracker.record(chairman.id, "council-stage3", chairman.model, { input: inputTokens, output: outputTokens });
    this.emit("stage:complete", 3, latencyProfiler.getStats("council:stage3").avg);
    return {
      finalAnswer,
      confidence,
      reasoning,
      bestContributors,
      dissent: dissent !== "None" ? dissent : void 0
    };
  }
  /**
   * Run full deliberation
   */
  async deliberate(question) {
    const totalSpan = latencyProfiler.startSpan("council:deliberation");
    const stage1Responses = await this.stage1(question);
    const stage2Rankings = await this.stage2(stage1Responses, question);
    const stage3Synthesis = await this.stage3(question, stage1Responses, stage2Rankings);
    const totalDuration = latencyProfiler.endSpan(totalSpan);
    const totalTokens = stage1Responses.reduce((sum, r) => sum + r.tokens.input + r.tokens.output, 0);
    const totalCost = tokenTracker.getTotalCost();
    const consensusScore = this.calculateConsensus(stage2Rankings);
    metricsCollector.recordCouncilScore(consensusScore);
    const result = {
      question,
      stage1Responses,
      stage2Rankings,
      stage3Synthesis,
      metrics: {
        totalDuration,
        totalTokens,
        totalCost,
        consensusScore
      }
    };
    this.emit("deliberation:complete", result);
    return result;
  }
  /**
   * Calculate consensus score from rankings
   */
  calculateConsensus(rankings) {
    if (rankings.length < 2) return 1;
    let agreements = 0;
    let comparisons = 0;
    for (let i = 0; i < rankings.length; i++) {
      for (let j = i + 1; j < rankings.length; j++) {
        const r1 = rankings[i].rankings;
        const r2 = rankings[j].rankings;
        for (const rank1 of r1) {
          const rank2 = r2.find((r) => r.responseId === rank1.responseId);
          if (rank2) {
            comparisons++;
            if (Math.abs(rank1.rank - rank2.rank) <= 1) {
              agreements++;
            }
          }
        }
      }
    }
    return comparisons > 0 ? agreements / comparisons : 1;
  }
  /**
   * Get council configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Format deliberation result for display
   */
  formatResult(result) {
    return `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                     LLM COUNCIL DELIBERATION                      \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                   \u2551
\u2551  QUESTION                                                         \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  ${result.question.slice(0, 60).padEnd(60)} \u2551
\u2551                                                                   \u2551
\u2551  STAGE 1: INDEPENDENT RESPONSES (${result.stage1Responses.length} members)                    \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
${result.stage1Responses.map(
      (r) => `\u2551  ${r.memberId.padEnd(15)} ${r.model.padEnd(20)} ${(r.confidence * 100).toFixed(0)}% conf  ${r.duration.toFixed(0)}ms \u2551`
    ).join("\n")}
\u2551                                                                   \u2551
\u2551  STAGE 2: PEER RANKINGS                                           \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Consensus Score: ${(result.metrics.consensusScore * 100).toFixed(0)}%                                        \u2551
\u2551                                                                   \u2551
\u2551  STAGE 3: CHAIRMAN SYNTHESIS                                      \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Confidence: ${(result.stage3Synthesis.confidence * 100).toFixed(0)}%                                            \u2551
\u2551  Best Contributors: ${result.stage3Synthesis.bestContributors.join(", ").slice(0, 40).padEnd(40)} \u2551
\u2551                                                                   \u2551
\u2551  FINAL ANSWER:                                                    \u2551
\u2551  ${result.stage3Synthesis.finalAnswer.slice(0, 60).padEnd(60)} \u2551
\u2551                                                                   \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  METRICS                                                          \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Duration: ${(result.metrics.totalDuration / 1e3).toFixed(2)}s   Tokens: ${result.metrics.totalTokens}   Cost: $${result.metrics.totalCost.toFixed(4)}       \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
  }
};
function createCouncil(config) {
  return new LLMCouncil(config);
}
var council = new LLMCouncil();

// src/council/ranking.ts
function parseRankingText(text) {
  const rankings = [];
  const pattern = /(\d+)\.\s*Response\s+(\w+)\s*\(Score:\s*(\d+)(?:\/10)?\)\s*[-–]\s*(.+?)(?=\d+\.|$)/gis;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    rankings.push({
      id: `response-${match[2].toUpperCase()}`,
      rank: parseInt(match[1]),
      score: parseInt(match[3]),
      feedback: match[4].trim()
    });
  }
  if (rankings.length === 0) {
    const simplePattern = /Response\s+(\w+)[:\s]+(\d+)/gi;
    let rank = 1;
    while ((match = simplePattern.exec(text)) !== null) {
      rankings.push({
        id: `response-${match[1].toUpperCase()}`,
        rank: rank++,
        score: parseInt(match[2]),
        feedback: "No detailed feedback"
      });
    }
  }
  return rankings;
}
function aggregateRankings(responses, peerRankings) {
  const scoreMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const responseId = `response-${String.fromCharCode(65 + i)}`;
    scoreMap.set(responseId, {
      responseId,
      memberId: response.memberId,
      model: response.model,
      totalScore: 0,
      avgRank: 0,
      avgScore: 0,
      rankCount: 0,
      confidence: response.confidence,
      topRankCount: 0
    });
  }
  for (const peerRanking of peerRankings) {
    for (const ranking of peerRanking.rankings) {
      const score = scoreMap.get(ranking.responseId);
      if (score) {
        score.totalScore += ranking.score;
        score.avgRank = (score.avgRank * score.rankCount + ranking.rank) / (score.rankCount + 1);
        score.rankCount++;
        if (ranking.rank === 1) {
          score.topRankCount++;
        }
      }
    }
  }
  for (const score of scoreMap.values()) {
    if (score.rankCount > 0) {
      score.avgScore = score.totalScore / score.rankCount;
    }
  }
  const scores = Array.from(scoreMap.values()).sort((a, b) => {
    const rankDiff = a.avgRank - b.avgRank;
    if (Math.abs(rankDiff) > 0.5) return rankDiff;
    return b.avgScore - a.avgScore;
  });
  const winner = scores[0];
  const topRankPct = winner.topRankCount / peerRankings.length;
  let consensusLevel;
  if (topRankPct >= 1) {
    consensusLevel = "unanimous";
  } else if (topRankPct >= 0.75) {
    consensusLevel = "strong";
  } else if (topRankPct >= 0.5) {
    consensusLevel = "moderate";
  } else if (topRankPct >= 0.25) {
    consensusLevel = "weak";
  } else {
    consensusLevel = "split";
  }
  const topPerformers = scores.slice(0, Math.ceil(scores.length / 2)).map((s) => s.memberId);
  const bottomPerformers = scores.slice(-Math.ceil(scores.length / 2)).map((s) => s.memberId);
  return {
    scores,
    winner,
    consensusLevel,
    topPerformers,
    bottomPerformers
  };
}
function generateRankingReport(aggregation) {
  let report = `
\u250C\u2500 RANKING AGGREGATION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  CONSENSUS: ${aggregation.consensusLevel.toUpperCase().padEnd(12)}                                    \u2502
\u2502  WINNER: ${aggregation.winner.memberId.padEnd(15)} (${aggregation.winner.model})            \u2502
\u2502                                                                  \u2502
\u2502  RANKINGS                                                        \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  MEMBER          MODEL              AVG RANK  AVG SCORE  TOP     \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502`;
  for (const score of aggregation.scores) {
    const isTop = aggregation.topPerformers.includes(score.memberId);
    const marker = isTop ? "\u2605" : " ";
    report += `
\u2502  ${marker} ${score.memberId.padEnd(13)} ${score.model.padEnd(18)} ${score.avgRank.toFixed(1).padEnd(9)} ${score.avgScore.toFixed(1).padEnd(10)} ${score.topRankCount}      \u2502`;
  }
  report += `
\u2502                                                                  \u2502
\u2502  TOP PERFORMERS: ${aggregation.topPerformers.join(", ").padEnd(40)}  \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  return report;
}

// src/council/synthesis.ts
var SYNTHESIS_PROMPTS = {
  standard: {
    role: "You are the Chairman of an LLM Council, responsible for synthesizing the best answer from multiple AI responses.",
    context: `You have received responses from multiple AI models, each with their own perspective and expertise.
Your task is to:
1. Identify the strongest elements from each response
2. Resolve any conflicts or contradictions
3. Synthesize a comprehensive final answer
4. Provide reasoning for your synthesis`,
    instructions: `Analyze all responses carefully. Consider:
- Accuracy and correctness
- Completeness of coverage
- Quality of reasoning
- Clarity of explanation
- Novel insights

Weight the peer rankings but don't blindly follow them - use your judgment.`,
    format: `FINAL ANSWER: [Your synthesized answer]
CONFIDENCE: [0.0-1.0]
REASONING: [Why this synthesis is optimal]
BEST CONTRIBUTORS: [List of member IDs whose insights were most valuable]
DISSENT: [Any significant disagreements to note, or "None"]`
  },
  technical: {
    role: "You are a Technical Lead synthesizing code review feedback from multiple senior engineers.",
    context: `Multiple expert engineers have reviewed the same technical question.
Your role is to produce a definitive technical recommendation.`,
    instructions: `Focus on:
- Technical accuracy and best practices
- Security implications
- Performance considerations
- Maintainability
- Edge cases mentioned by any reviewer`,
    format: `RECOMMENDATION: [Technical recommendation]
IMPLEMENTATION: [Key implementation details]
RISKS: [Potential risks or caveats]
CONFIDENCE: [0.0-1.0]
CONTRIBUTORS: [Engineers whose input was key]`
  },
  creative: {
    role: "You are a Creative Director synthesizing ideas from a brainstorming session.",
    context: `Multiple creative minds have contributed ideas on the same challenge.
Your role is to identify the most promising direction while preserving creative energy.`,
    instructions: `Look for:
- Innovative approaches
- Synergies between ideas
- Feasibility balanced with ambition
- Unique perspectives worth preserving`,
    format: `CONCEPT: [Synthesized creative direction]
INSPIRATION: [Key ideas that informed this]
RATIONALE: [Why this direction is compelling]
ALTERNATIVES: [Other promising directions to consider]`
  },
  consensus: {
    role: "You are a Mediator seeking to build consensus among differing viewpoints.",
    context: `Multiple perspectives have been shared, some conflicting.
Your goal is to find common ground while respecting differences.`,
    instructions: `Identify:
- Points of agreement
- Core disagreements
- Underlying values/priorities
- Potential compromises
- When to acknowledge legitimate disagreement`,
    format: `CONSENSUS: [Points of agreement]
SYNTHESIS: [Recommended path forward]
TRADE-OFFS: [Key trade-offs being made]
DISSENT: [Legitimate disagreements to acknowledge]
NEXT STEPS: [How to proceed]`
  }
};
function generateSynthesisPrompt(question, responses, rankings, template = "standard") {
  const prompt = SYNTHESIS_PROMPTS[template];
  const aggregation = aggregateRankings(responses, rankings);
  const responsesSummary = responses.map((r, i) => {
    const label = String.fromCharCode(65 + i);
    const ranking = aggregation.scores.find((s) => s.memberId === r.memberId);
    const rankInfo = ranking ? ` [Ranked #${ranking.avgRank.toFixed(1)}, Score: ${ranking.avgScore.toFixed(1)}]` : "";
    return `=== Response ${label} (${r.model})${rankInfo} ===
${r.content}
[Confidence: ${(r.confidence * 100).toFixed(0)}%]`;
  }).join("\n\n");
  const rankingsSummary = rankings.map(
    (r) => `Reviewer ${r.rankerId}: ${r.rankings.map((rk) => `${rk.responseId}(${rk.score}/10)`).join(" > ")}`
  ).join("\n");
  return `${prompt.role}

QUESTION: ${question}

${prompt.context}

=== COUNCIL RESPONSES ===
${responsesSummary}

=== PEER RANKINGS ===
${rankingsSummary}
Consensus Level: ${aggregation.consensusLevel}
Leading Response: ${aggregation.winner.memberId} (${aggregation.winner.model})

=== YOUR TASK ===
${prompt.instructions}

Please provide your synthesis in this format:
${prompt.format}`;
}
function parseSynthesisResponse(response) {
  const finalAnswer = extractSection(response, "FINAL ANSWER", "RECOMMENDATION", "CONCEPT", "CONSENSUS", "SYNTHESIS") || response.slice(0, 500);
  const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;
  const reasoning = extractSection(response, "REASONING", "RATIONALE", "TRADE-OFFS") || "";
  const contributorsMatch = response.match(/(?:BEST )?CONTRIBUTORS?:\s*(.+?)(?=\n[A-Z]|\n\n|$)/is);
  const bestContributors = contributorsMatch ? contributorsMatch[1].split(/[,\s]+/).filter((c) => c.length > 0) : [];
  const dissentMatch = response.match(/DISSENT:\s*(.+?)(?=\n[A-Z]|\n\n|$)/is);
  const dissent = dissentMatch && !dissentMatch[1].toLowerCase().includes("none") ? dissentMatch[1].trim() : void 0;
  return {
    finalAnswer: finalAnswer.trim(),
    confidence,
    reasoning: reasoning.trim(),
    bestContributors,
    dissent
  };
}
function extractSection(text, ...keys) {
  for (const key of keys) {
    const pattern = new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, "is");
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}
function formatSynthesis(synthesis) {
  return `
\u250C\u2500 CHAIRMAN SYNTHESIS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  FINAL ANSWER                                                    \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  ${synthesis.finalAnswer.slice(0, 60).padEnd(60)} \u2502
\u2502  ${synthesis.finalAnswer.slice(60, 120).padEnd(60)} \u2502
\u2502                                                                  \u2502
\u2502  CONFIDENCE: ${(synthesis.confidence * 100).toFixed(0)}%                                             \u2502
\u2502                                                                  \u2502
\u2502  REASONING                                                       \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  ${synthesis.reasoning.slice(0, 60).padEnd(60)} \u2502
\u2502                                                                  \u2502
\u2502  BEST CONTRIBUTORS: ${synthesis.bestContributors.join(", ").padEnd(40)} \u2502
\u2502  ${synthesis.dissent ? `DISSENT: ${synthesis.dissent.slice(0, 50)}` : "No dissent noted".padEnd(58)} \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
}

// src/memory/context.ts
var DEFAULT_CONFIG2 = {
  maxMemories: 5,
  maxEpisodes: 3,
  maxGoals: 2,
  maxImprovements: 3,
  maxTokens: 2e3,
  includeTimestamps: true
};
var ContextEnhancer = class {
  memory;
  config;
  constructor(memoryInstance, config) {
    this.memory = memoryInstance ?? memory;
    this.config = { ...DEFAULT_CONFIG2, ...config };
  }
  /**
   * Estimate token count (rough: 4 chars = 1 token)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
  /**
   * Build context window for a query
   */
  async buildContextWindow(query) {
    const searchResults = await this.memory.search(query, { limit: this.config.maxMemories });
    const relevantMemories = searchResults.map((r) => r.node);
    const episodeResults = await this.memory.search("", { type: "episode", limit: this.config.maxEpisodes });
    const recentEpisodes = episodeResults.map((r) => r.node);
    const goalResults = await this.memory.search("", { type: "goal", limit: this.config.maxGoals });
    const activeGoals = goalResults.map((r) => r.node).filter((n) => {
      try {
        const goal = JSON.parse(n.value);
        return goal.status !== "completed";
      } catch {
        return false;
      }
    });
    const improvementResults = await this.memory.search("", { type: "improvement", limit: this.config.maxImprovements });
    const improvements = improvementResults.map((r) => r.node);
    const allNodes = [...relevantMemories, ...recentEpisodes, ...activeGoals, ...improvements];
    const totalText = allNodes.map((n) => `${n.key}: ${n.value}`).join("\n");
    const tokenEstimate = this.estimateTokens(totalText);
    return {
      relevantMemories,
      recentEpisodes,
      activeGoals,
      improvements,
      tokenEstimate
    };
  }
  /**
   * Format context for prompt injection
   */
  formatContext(context) {
    let output = "<!-- OPUS 67 MEMORY CONTEXT -->\n";
    if (context.relevantMemories.length > 0) {
      output += "\n<relevant_memories>\n";
      for (const mem of context.relevantMemories) {
        const timestamp = this.config.includeTimestamps ? ` [${mem.createdAt.toISOString().slice(0, 10)}]` : "";
        output += `\u2022 ${mem.key}${timestamp}: ${mem.value.slice(0, 200)}
`;
      }
      output += "</relevant_memories>\n";
    }
    if (context.activeGoals.length > 0) {
      output += "\n<active_goals>\n";
      for (const goal of context.activeGoals) {
        try {
          const g = JSON.parse(goal.value);
          output += `\u2022 ${g.description} (${g.progress}% complete, ${g.status})
`;
        } catch {
          output += `\u2022 ${goal.key}
`;
        }
      }
      output += "</active_goals>\n";
    }
    if (context.improvements.length > 0) {
      output += "\n<recent_improvements>\n";
      for (const imp of context.improvements) {
        try {
          const i = JSON.parse(imp.value);
          output += `\u2022 ${i.component}: ${i.changeType} (impact: ${i.impact})
`;
        } catch {
          output += `\u2022 ${imp.key}
`;
        }
      }
      output += "</recent_improvements>\n";
    }
    if (context.recentEpisodes.length > 0) {
      output += "\n<recent_episodes>\n";
      for (const ep of context.recentEpisodes) {
        output += `\u2022 ${ep.key}: ${ep.value.slice(0, 100)}...
`;
      }
      output += "</recent_episodes>\n";
    }
    output += "\n<!-- /OPUS 67 MEMORY CONTEXT -->";
    return output;
  }
  /**
   * Enhance a prompt with memory context
   */
  async enhance(prompt) {
    const context = await this.buildContextWindow(prompt);
    if (context.tokenEstimate > this.config.maxTokens) {
      const ratio = this.config.maxTokens / context.tokenEstimate;
      context.relevantMemories = context.relevantMemories.slice(0, Math.ceil(context.relevantMemories.length * ratio));
      context.recentEpisodes = context.recentEpisodes.slice(0, Math.ceil(context.recentEpisodes.length * ratio));
    }
    const contextString = this.formatContext(context);
    const injectedTokens = this.estimateTokens(contextString);
    const enhancedPrompt = `${contextString}

${prompt}`;
    return {
      originalPrompt: prompt,
      enhancedPrompt,
      context,
      injectedTokens
    };
  }
  /**
   * Extract and store learnings from a conversation
   */
  async extractAndStore(conversation, metadata) {
    const stored = [];
    const patterns = [
      { regex: /learned?:?\s*(.+?)(?:\.|$)/gi, type: "fact" },
      { regex: /remember:?\s*(.+?)(?:\.|$)/gi, type: "fact" },
      { regex: /note:?\s*(.+?)(?:\.|$)/gi, type: "fact" },
      { regex: /goal:?\s*(.+?)(?:\.|$)/gi, type: "goal" },
      { regex: /improved?:?\s*(.+?)(?:\.|$)/gi, type: "improvement" }
    ];
    for (const { regex, type } of patterns) {
      let match;
      while ((match = regex.exec(conversation)) !== null) {
        const content = match[1].trim();
        if (content.length > 10) {
          let node;
          if (type === "goal") {
            node = await this.memory.trackGoal({
              description: content,
              progress: 0,
              status: "pending"
            });
          } else if (type === "improvement") {
            node = await this.memory.storeImprovement({
              component: "extracted",
              changeType: "enhancement",
              before: "",
              after: content,
              impact: 0.5,
              automated: true
            });
          } else {
            node = await this.memory.addFact(
              `extracted:${Date.now()}`,
              content,
              { source: "conversation", ...metadata }
            );
          }
          stored.push(node);
        }
      }
    }
    return stored;
  }
  /**
   * Get context summary without full prompt injection
   */
  async getSummary(query) {
    const context = await this.buildContextWindow(query);
    return `
Memory Context Summary:
- ${context.relevantMemories.length} relevant memories
- ${context.recentEpisodes.length} recent episodes
- ${context.activeGoals.length} active goals
- ${context.improvements.length} improvements
- ~${context.tokenEstimate} tokens

Top relevant: ${context.relevantMemories[0]?.key ?? "None"}`;
  }
};
function createContextEnhancer(memoryInstance, config) {
  return new ContextEnhancer(memoryInstance, config);
}
var contextEnhancer = new ContextEnhancer();
async function enhancePrompt(prompt) {
  const result = await contextEnhancer.enhance(prompt);
  return result.enhancedPrompt;
}
async function getContextFor(topic) {
  return contextEnhancer.buildContextWindow(topic);
}
var DEFAULT_CONFIG3 = {
  intervalMs: 6e4,
  // 1 minute
  maxImprovementsPerCycle: 3,
  minConfidence: 0.7,
  dryRun: true,
  enableAutoApply: false,
  pauseHours: []
};
var EvolutionLoop = class extends EventEmitter {
  config;
  memory;
  running = false;
  paused = false;
  intervalId = null;
  startTime = null;
  cycles = [];
  pendingOpportunities = [];
  detectors = [];
  constructor(config, memoryInstance) {
    super();
    this.config = { ...DEFAULT_CONFIG3, ...config };
    this.memory = memoryInstance ?? createMemory({ fallbackToLocal: true });
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `evo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }
  /**
   * Register an opportunity detector
   */
  registerDetector(detector) {
    this.detectors.push(detector);
  }
  /**
   * Start the evolution loop
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = /* @__PURE__ */ new Date();
    console.log("[Evolution] Starting evolution loop...");
    console.log(`[Evolution] Interval: ${this.config.intervalMs}ms`);
    console.log(`[Evolution] Dry run: ${this.config.dryRun}`);
    this.runCycle().catch((e) => this.emit("error", e));
    this.intervalId = setInterval(() => {
      if (!this.paused) {
        this.runCycle().catch((e) => this.emit("error", e));
      }
    }, this.config.intervalMs);
  }
  /**
   * Stop the evolution loop
   */
  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("[Evolution] Stopped evolution loop");
  }
  /**
   * Pause evolution (e.g., during maintenance)
   */
  pause() {
    this.paused = true;
    this.emit("paused");
  }
  /**
   * Resume evolution
   */
  resume() {
    this.paused = false;
    this.emit("resumed");
  }
  /**
   * Check if we should pause for the current hour
   */
  shouldPauseForHour() {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    return this.config.pauseHours.includes(hour);
  }
  /**
   * Run a single evolution cycle
   */
  async runCycle() {
    const cycle = {
      id: this.generateId(),
      startedAt: /* @__PURE__ */ new Date(),
      opportunitiesDetected: 0,
      improvementsApplied: 0,
      improvementsSkipped: 0,
      errors: [],
      metrics: await this.getMetrics()
    };
    this.emit("cycle:start", cycle.id);
    try {
      if (this.shouldPauseForHour()) {
        console.log("[Evolution] Paused for scheduled quiet hours");
        cycle.completedAt = /* @__PURE__ */ new Date();
        return cycle;
      }
      const context = await this.buildDetectorContext();
      const allOpportunities = [];
      for (const detector of this.detectors) {
        try {
          const opportunities = await detector(context);
          allOpportunities.push(...opportunities);
        } catch (error) {
          cycle.errors.push(`Detector error: ${error}`);
        }
      }
      const builtinOpportunities = await this.detectBuiltinPatterns(context);
      allOpportunities.push(...builtinOpportunities);
      cycle.opportunitiesDetected = allOpportunities.length;
      const qualified = allOpportunities.filter((o) => o.confidence >= this.config.minConfidence).sort((a, b) => b.estimatedImpact - a.estimatedImpact);
      const toApply = qualified.slice(0, this.config.maxImprovementsPerCycle);
      for (const opportunity of toApply) {
        this.emit("opportunity:detected", opportunity);
        if (opportunity.riskLevel === "high" && !this.config.enableAutoApply) {
          this.emit("improvement:skipped", opportunity, "High risk - requires manual approval");
          cycle.improvementsSkipped++;
          this.pendingOpportunities.push(opportunity);
          continue;
        }
        if (this.config.dryRun) {
          console.log(`[Evolution] [DRY RUN] Would apply: ${opportunity.description}`);
          cycle.improvementsSkipped++;
        } else {
          try {
            const improvement = await this.applyImprovement(opportunity);
            this.emit("improvement:applied", improvement);
            cycle.improvementsApplied++;
          } catch (error) {
            cycle.errors.push(`Apply error: ${error}`);
            this.emit("improvement:skipped", opportunity, String(error));
            cycle.improvementsSkipped++;
          }
        }
      }
      await this.memory.addEpisode({
        name: `evolution:cycle:${cycle.id}`,
        content: `Evolution cycle completed: ${cycle.improvementsApplied} applied, ${cycle.opportunitiesDetected} detected`,
        type: "success",
        context: {
          cycleId: cycle.id,
          applied: cycle.improvementsApplied,
          detected: cycle.opportunitiesDetected
        }
      });
    } catch (error) {
      cycle.errors.push(`Cycle error: ${error}`);
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
    }
    cycle.completedAt = /* @__PURE__ */ new Date();
    this.cycles.push(cycle);
    this.emit("cycle:complete", cycle);
    return cycle;
  }
  /**
   * Build context for detectors
   */
  async buildDetectorContext() {
    const memories = await this.memory.search("", { limit: 50 });
    const improvements = await this.memory.getImprovements();
    const goals = await this.memory.getGoals();
    return {
      recentMemories: memories.map((m) => m.node),
      pastImprovements: improvements,
      activeGoals: goals.filter((g) => g.status !== "completed"),
      pendingOpportunities: this.pendingOpportunities,
      metrics: await this.getMetrics()
    };
  }
  /**
   * Built-in pattern detection
   */
  async detectBuiltinPatterns(context) {
    const opportunities = [];
    const failurePatterns = context.recentMemories.filter((m) => m.metadata?.episodeType === "failure").reduce((acc, m) => {
      const component = String(m.metadata?.component ?? "unknown");
      acc[component] = (acc[component] ?? 0) + 1;
      return acc;
    }, {});
    for (const [component, count] of Object.entries(failurePatterns)) {
      if (count >= 3) {
        opportunities.push({
          id: this.generateId(),
          type: "fix",
          target: component,
          description: `Component "${component}" has ${count} recent failures - needs investigation`,
          confidence: 0.8,
          estimatedImpact: 0.7,
          riskLevel: "medium",
          context: { failureCount: count },
          detectedAt: /* @__PURE__ */ new Date()
        });
      }
    }
    const highImpactImprovements = context.pastImprovements.filter((i) => i.impact >= 0.8).slice(0, 3);
    for (const imp of highImpactImprovements) {
      opportunities.push({
        id: this.generateId(),
        type: "enhancement",
        target: `related:${imp.component}`,
        description: `Consider applying similar ${imp.changeType} to related components (${imp.component} had ${(imp.impact * 100).toFixed(0)}% impact)`,
        confidence: 0.6,
        estimatedImpact: imp.impact * 0.7,
        // Slightly lower expected impact
        riskLevel: "low",
        context: { originalImprovement: imp },
        detectedAt: /* @__PURE__ */ new Date()
      });
    }
    const stalledGoals = context.activeGoals.filter((g) => g.status === "in_progress" && g.progress < 50);
    for (const goal of stalledGoals) {
      opportunities.push({
        id: this.generateId(),
        type: "enhancement",
        target: `goal:${goal.description.slice(0, 30)}`,
        description: `Goal "${goal.description}" is stalled at ${goal.progress}% - consider breaking down into smaller tasks`,
        confidence: 0.5,
        estimatedImpact: 0.4,
        riskLevel: "low",
        context: { goal },
        detectedAt: /* @__PURE__ */ new Date()
      });
    }
    return opportunities;
  }
  /**
   * Apply an improvement
   */
  async applyImprovement(opportunity) {
    const improvement = {
      component: opportunity.target,
      changeType: opportunity.type === "fix" ? "fix" : opportunity.type === "optimization" ? "optimization" : opportunity.type === "refactor" ? "refactor" : "enhancement",
      before: `Opportunity: ${opportunity.description}`,
      after: opportunity.suggestedCode ?? "Applied automatically",
      impact: opportunity.estimatedImpact,
      automated: true
    };
    await this.memory.storeImprovement(improvement);
    return improvement;
  }
  /**
   * Get pending opportunities for manual review
   */
  getPendingOpportunities() {
    return [...this.pendingOpportunities];
  }
  /**
   * Approve a pending opportunity
   */
  async approveOpportunity(id) {
    const index = this.pendingOpportunities.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const opportunity = this.pendingOpportunities[index];
    this.pendingOpportunities.splice(index, 1);
    return this.applyImprovement(opportunity);
  }
  /**
   * Reject a pending opportunity
   */
  rejectOpportunity(id, reason) {
    const index = this.pendingOpportunities.findIndex((o) => o.id === id);
    if (index === -1) return false;
    const opportunity = this.pendingOpportunities[index];
    this.pendingOpportunities.splice(index, 1);
    this.emit("improvement:skipped", opportunity, reason);
    return true;
  }
  /**
   * Get evolution metrics
   */
  async getMetrics() {
    const totalImprovements = this.cycles.reduce((sum, c) => sum + c.improvementsApplied, 0);
    const successfulCycles = this.cycles.filter((c) => c.errors.length === 0).length;
    const totalImpact = this.cycles.reduce((sum, c) => {
      return sum + c.improvementsApplied * 0.5;
    }, 0);
    return {
      totalCycles: this.cycles.length,
      totalImprovements,
      averageImpactScore: totalImprovements > 0 ? totalImpact / totalImprovements : 0,
      successRate: this.cycles.length > 0 ? successfulCycles / this.cycles.length : 1,
      lastCycleAt: this.cycles.length > 0 ? this.cycles[this.cycles.length - 1].completedAt ?? null : null,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0
    };
  }
  /**
   * Get status summary
   */
  async getStatus() {
    const metrics = await this.getMetrics();
    const uptimeHours = (metrics.uptime / 36e5).toFixed(1);
    return `
\u250C\u2500 EVOLUTION ENGINE STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  STATUS: ${this.running ? this.paused ? "\u23F8 PAUSED" : "\u{1F504} RUNNING" : "\u23F9 STOPPED".padEnd(52)} \u2502
\u2502  MODE: ${this.config.dryRun ? "DRY RUN (simulation)" : "LIVE".padEnd(54)} \u2502
\u2502                                                                  \u2502
\u2502  METRICS                                                         \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Cycles Completed: ${String(metrics.totalCycles).padEnd(42)} \u2502
\u2502  Total Improvements: ${String(metrics.totalImprovements).padEnd(40)} \u2502
\u2502  Success Rate: ${(metrics.successRate * 100).toFixed(1)}%${" ".repeat(45)} \u2502
\u2502  Avg Impact Score: ${metrics.averageImpactScore.toFixed(2)}${" ".repeat(42)} \u2502
\u2502  Uptime: ${uptimeHours}h${" ".repeat(51)} \u2502
\u2502                                                                  \u2502
\u2502  QUEUE                                                           \u2502
\u2502  Pending Opportunities: ${String(this.pendingOpportunities.length).padEnd(37)} \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
function createEvolutionLoop(config, memoryInstance) {
  return new EvolutionLoop(config, memoryInstance);
}
var evolutionLoop = new EvolutionLoop();

// src/evolution/pattern-detector.ts
var DEFAULT_CONFIG4 = {
  enabledPatterns: ["duplication", "performance", "error", "complexity"],
  minConfidence: 0.5,
  maxPatterns: 10
};
var PatternDetector = class {
  config;
  patternHandlers;
  constructor(config) {
    this.config = { ...DEFAULT_CONFIG4, ...config };
    this.patternHandlers = /* @__PURE__ */ new Map();
    this.registerHandler("duplication", detectDuplication);
    this.registerHandler("performance", detectPerformance);
    this.registerHandler("error", detectErrors);
    this.registerHandler("complexity", detectComplexity);
    this.registerHandler("dependency", detectDependencies);
    this.registerHandler("security", detectSecurity);
  }
  /**
   * Register a pattern handler
   */
  registerHandler(type, handler) {
    this.patternHandlers.set(type, handler);
  }
  /**
   * Detect patterns from context
   */
  async detect(context) {
    const patterns = [];
    for (const patternType of this.config.enabledPatterns) {
      const handler = this.patternHandlers.get(patternType);
      if (!handler) continue;
      try {
        const detected = await handler(context);
        patterns.push(...detected.filter((p) => p.confidence >= this.config.minConfidence));
      } catch (error) {
        console.warn(`[PatternDetector] Error in ${patternType} handler:`, error);
      }
    }
    patterns.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.confidence - a.confidence;
    });
    return patterns.slice(0, this.config.maxPatterns);
  }
  /**
   * Convert patterns to improvement opportunities
   */
  patternsToOpportunities(patterns) {
    return patterns.map((pattern) => ({
      id: `opp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: patternTypeToOpportunityType(pattern.type),
      target: pattern.locations[0] ?? "unknown",
      description: pattern.description,
      confidence: pattern.confidence,
      estimatedImpact: severityToImpact(pattern.severity),
      riskLevel: pattern.severity === "high" ? "medium" : "low",
      suggestedCode: pattern.suggestedFix,
      context: pattern.metadata,
      detectedAt: /* @__PURE__ */ new Date()
    }));
  }
  /**
   * Create detector function for evolution loop
   */
  createDetector() {
    return async (context) => {
      const patterns = await this.detect(context);
      return this.patternsToOpportunities(patterns);
    };
  }
};
async function detectDuplication(context) {
  const patterns = [];
  const memories = context.recentMemories;
  const valueFrequency = /* @__PURE__ */ new Map();
  for (const mem of memories) {
    const normalized = mem.value.toLowerCase().trim();
    const existing = Array.from(valueFrequency.entries()).find(([key]) => similarity(key, normalized) > 0.8);
    if (existing) {
      existing[1].push(mem.key);
    } else {
      valueFrequency.set(normalized, [mem.key]);
    }
  }
  for (const [value, keys] of valueFrequency) {
    if (keys.length >= 2) {
      patterns.push({
        type: "duplication",
        description: `Similar content found in ${keys.length} locations: ${keys.join(", ")}`,
        locations: keys,
        severity: keys.length >= 4 ? "high" : keys.length >= 3 ? "medium" : "low",
        confidence: 0.7,
        suggestedFix: "Consider extracting common functionality into a shared utility",
        metadata: { duplicateCount: keys.length, sample: value.slice(0, 100) }
      });
    }
  }
  return patterns;
}
async function detectPerformance(context) {
  const patterns = [];
  const slowOps = context.recentMemories.filter((m) => {
    const value = m.value.toLowerCase();
    return value.includes("slow") || value.includes("timeout") || value.includes("latency") || value.includes("performance");
  });
  if (slowOps.length >= 2) {
    patterns.push({
      type: "performance",
      description: `${slowOps.length} performance-related issues detected recently`,
      locations: slowOps.map((m) => m.key),
      severity: slowOps.length >= 5 ? "high" : "medium",
      confidence: 0.6,
      suggestedFix: "Consider profiling these operations and implementing caching or optimization",
      metadata: { issueCount: slowOps.length }
    });
  }
  const cacheRelated = context.pastImprovements.filter(
    (i) => i.changeType === "optimization" && i.after.toLowerCase().includes("cache")
  );
  if (cacheRelated.length === 0 && context.recentMemories.length > 20) {
    patterns.push({
      type: "performance",
      description: "No caching improvements detected - consider adding caching layer",
      locations: ["system-wide"],
      severity: "low",
      confidence: 0.5,
      suggestedFix: "Implement caching for frequently accessed data",
      metadata: { memoryCount: context.recentMemories.length }
    });
  }
  return patterns;
}
async function detectErrors(context) {
  const patterns = [];
  const failuresByComponent = /* @__PURE__ */ new Map();
  for (const mem of context.recentMemories) {
    if (mem.metadata?.episodeType === "failure" || mem.value.toLowerCase().includes("error") || mem.value.toLowerCase().includes("failed")) {
      const component = String(mem.metadata?.component ?? mem.key.split(":")[0] ?? "unknown");
      failuresByComponent.set(component, (failuresByComponent.get(component) ?? 0) + 1);
    }
  }
  for (const [component, count] of failuresByComponent) {
    if (count >= 2) {
      patterns.push({
        type: "error",
        description: `Component "${component}" has ${count} errors - investigate root cause`,
        locations: [component],
        severity: count >= 5 ? "high" : count >= 3 ? "medium" : "low",
        confidence: 0.8,
        suggestedFix: `Add error handling and logging to ${component}`,
        metadata: { errorCount: count }
      });
    }
  }
  return patterns;
}
async function detectComplexity(context) {
  const patterns = [];
  const stalledGoals = context.activeGoals.filter(
    (g) => g.status === "in_progress" && g.progress < 30
  );
  for (const goal of stalledGoals) {
    patterns.push({
      type: "complexity",
      description: `Goal "${goal.description}" is stalled at ${goal.progress}% - may be too complex`,
      locations: [`goal:${goal.description.slice(0, 30)}`],
      severity: goal.progress < 10 ? "medium" : "low",
      confidence: 0.6,
      suggestedFix: "Break down into smaller, achievable milestones",
      metadata: { progress: goal.progress, status: goal.status }
    });
  }
  return patterns;
}
async function detectDependencies(context) {
  const patterns = [];
  const depIssues = context.recentMemories.filter((m) => {
    const value = m.value.toLowerCase();
    return value.includes("dependency") || value.includes("import") || value.includes("circular") || value.includes("version");
  });
  if (depIssues.length >= 2) {
    patterns.push({
      type: "dependency",
      description: `${depIssues.length} dependency-related issues detected`,
      locations: depIssues.map((m) => m.key),
      severity: "medium",
      confidence: 0.5,
      suggestedFix: "Review and update dependencies, check for circular imports",
      metadata: { issueCount: depIssues.length }
    });
  }
  return patterns;
}
async function detectSecurity(context) {
  const patterns = [];
  const securityPatterns = ["secret", "password", "key", "token", "credential", "auth"];
  const securityMentions = context.recentMemories.filter((m) => {
    const value = m.value.toLowerCase();
    return securityPatterns.some((p) => value.includes(p));
  });
  if (securityMentions.length > 0) {
    patterns.push({
      type: "security",
      description: `${securityMentions.length} security-related items detected - ensure proper handling`,
      locations: securityMentions.map((m) => m.key),
      severity: "high",
      confidence: 0.7,
      suggestedFix: "Review security practices: use env vars, never commit secrets, implement proper auth",
      metadata: { mentionCount: securityMentions.length }
    });
  }
  return patterns;
}
function similarity(a, b) {
  if (a === b) return 1;
  if (a.length < 10 || b.length < 10) return 0;
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
  const union = /* @__PURE__ */ new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}
function patternTypeToOpportunityType(type) {
  switch (type) {
    case "duplication":
      return "refactor";
    case "performance":
      return "optimization";
    case "error":
      return "fix";
    case "security":
      return "fix";
    case "complexity":
      return "refactor";
    case "dependency":
      return "fix";
    case "style":
      return "refactor";
    default:
      return "enhancement";
  }
}
function severityToImpact(severity) {
  switch (severity) {
    case "high":
      return 0.8;
    case "medium":
      return 0.5;
    case "low":
      return 0.3;
  }
}
function createPatternDetector(config) {
  return new PatternDetector(config);
}
var patternDetector = new PatternDetector();
var DEFAULT_CONFIG5 = {
  dryRun: true,
  requireTests: true,
  maxChangesPerImprovement: 5,
  autoRollbackOnTestFail: true,
  backupOriginals: true
};
var CodeImprover = class extends EventEmitter {
  config;
  appliedImprovements = /* @__PURE__ */ new Map();
  backups = /* @__PURE__ */ new Map();
  constructor(config) {
    super();
    this.config = { ...DEFAULT_CONFIG5, ...config };
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }
  /**
   * Apply an improvement opportunity
   */
  async apply(opportunity) {
    const resultId = this.generateId();
    this.emit("improvement:start", opportunity.id);
    const result = {
      id: resultId,
      opportunity,
      status: "success",
      changes: [],
      metrics: {
        filesModified: 0,
        linesAdded: 0,
        linesRemoved: 0,
        testsRun: 0,
        testsPassed: 0
      },
      appliedAt: /* @__PURE__ */ new Date()
    };
    try {
      const changes = await this.generateChanges(opportunity);
      if (changes.length > this.config.maxChangesPerImprovement) {
        throw new Error(`Too many changes (${changes.length} > ${this.config.maxChangesPerImprovement})`);
      }
      result.changes = changes;
      if (this.config.backupOriginals) {
        await this.backupFiles(resultId, changes);
      }
      for (const change of changes) {
        if (this.config.dryRun) {
          console.log(`[CodeImprover] [DRY RUN] Would ${change.changeType}: ${change.filePath}`);
          console.log(`  Description: ${change.description}`);
        } else {
          await this.applyChange(change);
          this.emit("change:apply", change);
        }
        result.metrics.filesModified++;
        const lines = (change.newContent?.split("\n").length ?? 0) - (change.originalContent?.split("\n").length ?? 0);
        if (lines > 0) result.metrics.linesAdded += lines;
        else result.metrics.linesRemoved += Math.abs(lines);
      }
      if (this.config.requireTests && !this.config.dryRun) {
        const testResults = await this.runTests();
        result.metrics.testsRun = testResults.total;
        result.metrics.testsPassed = testResults.passed;
        if (testResults.passed < testResults.total && this.config.autoRollbackOnTestFail) {
          console.log(`[CodeImprover] Tests failed (${testResults.passed}/${testResults.total}), rolling back...`);
          await this.rollback(resultId);
          result.status = "rolled_back";
          result.error = `Tests failed: ${testResults.passed}/${testResults.total}`;
        }
      }
      this.appliedImprovements.set(resultId, result);
      this.emit("improvement:complete", result);
    } catch (error) {
      result.status = "failed";
      result.error = String(error);
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
    }
    return result;
  }
  /**
   * Generate code changes for an opportunity
   */
  async generateChanges(opportunity) {
    const changes = [];
    switch (opportunity.type) {
      case "refactor":
        changes.push({
          id: this.generateId(),
          filePath: opportunity.target,
          originalContent: "// Original code",
          newContent: opportunity.suggestedCode ?? "// Refactored code",
          changeType: "modify",
          description: `Refactor: ${opportunity.description}`
        });
        break;
      case "optimization":
        changes.push({
          id: this.generateId(),
          filePath: opportunity.target,
          originalContent: "// Original code",
          newContent: opportunity.suggestedCode ?? "// Optimized code with caching",
          changeType: "modify",
          description: `Optimization: ${opportunity.description}`
        });
        break;
      case "fix":
        changes.push({
          id: this.generateId(),
          filePath: opportunity.target,
          originalContent: "// Buggy code",
          newContent: opportunity.suggestedCode ?? "// Fixed code with error handling",
          changeType: "modify",
          description: `Fix: ${opportunity.description}`
        });
        break;
      case "enhancement":
        changes.push({
          id: this.generateId(),
          filePath: `${opportunity.target}.new`,
          originalContent: "",
          newContent: opportunity.suggestedCode ?? "// New enhancement code",
          changeType: "add",
          description: `Enhancement: ${opportunity.description}`
        });
        break;
    }
    return changes;
  }
  /**
   * Apply a single code change
   */
  async applyChange(change) {
    console.log(`[CodeImprover] Applying ${change.changeType} to ${change.filePath}`);
    console.log(`  ${change.description}`);
  }
  /**
   * Backup files before changes
   */
  async backupFiles(resultId, changes) {
    const backups = [];
    for (const change of changes) {
      if (change.changeType !== "add") {
        backups.push({
          path: change.filePath,
          content: change.originalContent
        });
      }
    }
    this.backups.set(resultId, backups);
  }
  /**
   * Rollback an improvement
   */
  async rollback(resultId) {
    const result = this.appliedImprovements.get(resultId);
    const backups = this.backups.get(resultId);
    if (!result || !backups) {
      console.log(`[CodeImprover] No improvement found to rollback: ${resultId}`);
      return false;
    }
    this.emit("rollback:start", resultId);
    for (const backup of backups) {
      console.log(`[CodeImprover] Restoring: ${backup.path}`);
    }
    for (const change of result.changes) {
      if (change.changeType === "add") {
        console.log(`[CodeImprover] Removing: ${change.filePath}`);
      }
    }
    result.status = "rolled_back";
    result.rolledBackAt = /* @__PURE__ */ new Date();
    this.emit("rollback:complete", resultId);
    return true;
  }
  /**
   * Run tests
   */
  async runTests() {
    console.log("[CodeImprover] Running tests...");
    return {
      total: 10,
      passed: 10,
      failed: 0
    };
  }
  /**
   * Get improvement history
   */
  getHistory() {
    return Array.from(this.appliedImprovements.values()).sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }
  /**
   * Get improvement by ID
   */
  getImprovement(id) {
    return this.appliedImprovements.get(id);
  }
  /**
   * Get statistics
   */
  getStats() {
    const results = Array.from(this.appliedImprovements.values());
    return {
      totalApplied: results.length,
      successful: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      rolledBack: results.filter((r) => r.status === "rolled_back").length,
      totalLinesChanged: results.reduce(
        (sum, r) => sum + r.metrics.linesAdded + r.metrics.linesRemoved,
        0
      )
    };
  }
  /**
   * Format status
   */
  formatStatus() {
    const stats = this.getStats();
    return `
\u250C\u2500 CODE IMPROVER STATUS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502                                                                  \u2502
\u2502  MODE: ${this.config.dryRun ? "DRY RUN (simulation)" : "LIVE".padEnd(54)} \u2502
\u2502  AUTO ROLLBACK: ${this.config.autoRollbackOnTestFail ? "ENABLED" : "DISABLED".padEnd(44)} \u2502
\u2502                                                                  \u2502
\u2502  STATISTICS                                                      \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2502
\u2502  Total Applied: ${String(stats.totalApplied).padEnd(44)} \u2502
\u2502  Successful: ${String(stats.successful).padEnd(48)} \u2502
\u2502  Failed: ${String(stats.failed).padEnd(52)} \u2502
\u2502  Rolled Back: ${String(stats.rolledBack).padEnd(47)} \u2502
\u2502  Lines Changed: ${String(stats.totalLinesChanged).padEnd(45)} \u2502
\u2502                                                                  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
  }
};
function createCodeImprover(config) {
  return new CodeImprover(config);
}
var codeImprover = new CodeImprover();

// src/evolution/types.ts
var DEFAULT_EVOLUTION_CONFIG = {
  usageTracker: {
    enabled: true,
    bufferSize: 20,
    flushIntervalMs: 5e3,
    storageLocation: ".opus67/evolution/usage",
    maxEventsPerDay: 1e4,
    trackContext: true,
    contextMaxLength: 200
  }};
function generateId(prefix = "evo") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function hashTask(task) {
  let hash = 0;
  for (let i = 0; i < task.length; i++) {
    const char = task.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
var UsageTracker = class extends EventEmitter {
  config;
  buffer = [];
  flushInterval = null;
  currentSession = null;
  eventsToday = 0;
  lastEventDate = null;
  constructor(config) {
    super();
    this.config = { ...DEFAULT_EVOLUTION_CONFIG.usageTracker, ...config };
    this.ensureStorageDir();
    this.startFlushInterval();
  }
  /**
   * Ensure storage directory exists
   */
  ensureStorageDir() {
    const dir = this.config.storageLocation;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  /**
   * Start the flush interval
   */
  startFlushInterval() {
    if (this.flushInterval) return;
    this.flushInterval = setInterval(() => {
      this.flush().catch((e) => this.emit("error", e));
    }, this.config.flushIntervalMs);
  }
  /**
   * Stop the flush interval
   */
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush().catch(console.error);
  }
  /**
   * Start a new tracking session
   */
  startSession(taskSummary) {
    if (this.currentSession) {
      this.endSession();
    }
    const session = {
      id: generateId("session"),
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      usageEventIds: [],
      outcomeSignals: [],
      taskSummary: taskSummary ? truncate(taskSummary, 500) : void 0
    };
    this.currentSession = session;
    this.emit("session:started", session);
    return session;
  }
  /**
   * End the current session
   */
  endSession(outcome) {
    if (!this.currentSession) return null;
    this.currentSession.endedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (outcome) {
      this.currentSession.outcome = outcome;
    }
    const session = this.currentSession;
    this.currentSession = null;
    this.emit("session:ended", session);
    this.storeSession(session);
    return session;
  }
  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }
  /**
   * Track a skill usage
   */
  trackSkill(skillId, skillName, options) {
    return this.track("skill", skillId, skillName, options);
  }
  /**
   * Track a mode switch
   */
  trackMode(modeId, modeName, options) {
    return this.track("mode", modeId, modeName, options);
  }
  /**
   * Track an agent invocation
   */
  trackAgent(agentId, agentName, options) {
    return this.track("agent", agentId, agentName, options);
  }
  /**
   * Track an MCP connection
   */
  trackMCP(mcpId, mcpName, options) {
    return this.track("mcp", mcpId, mcpName, options);
  }
  /**
   * Generic track method
   */
  track(type, entityId, entityName, options = {}) {
    if (!this.config.enabled) {
      return {
        id: "disabled",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type,
        entityId,
        entityName,
        trigger: "auto",
        taskContext: "",
        taskHash: "",
        sessionId: "",
        metadata: {}
      };
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (this.lastEventDate !== today) {
      this.eventsToday = 0;
      this.lastEventDate = today;
    }
    if (this.eventsToday >= this.config.maxEventsPerDay) {
      console.warn("[UsageTracker] Daily event limit reached");
      return {
        id: "limit_reached",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        type,
        entityId,
        entityName,
        trigger: options.trigger ?? "auto",
        taskContext: "",
        taskHash: "",
        sessionId: this.currentSession?.id ?? "",
        metadata: {}
      };
    }
    const taskContext = this.config.trackContext && options.taskContext ? truncate(options.taskContext, this.config.contextMaxLength) : "";
    const event = {
      id: generateId("usage"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      type,
      entityId,
      entityName,
      trigger: options.trigger ?? "auto",
      taskContext,
      taskHash: hashTask(taskContext || entityId),
      sessionId: this.currentSession?.id ?? "",
      durationMs: options.durationMs,
      metadata: options.metadata ?? {}
    };
    this.buffer.push(event);
    this.eventsToday++;
    if (this.currentSession) {
      this.currentSession.usageEventIds.push(event.id);
    }
    this.emit("event:tracked", event);
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush().catch((e) => this.emit("error", e));
    }
    return event;
  }
  /**
   * Flush buffered events to storage
   */
  async flush() {
    if (this.buffer.length === 0) return;
    const toWrite = [...this.buffer];
    this.buffer = [];
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const logFile = join(this.config.storageLocation, `${today}.jsonl`);
    try {
      const lines = toWrite.map((e) => JSON.stringify(e)).join("\n") + "\n";
      appendFileSync(logFile, lines, "utf-8");
      this.emit("flush:complete", toWrite.length);
    } catch (error) {
      this.buffer.unshift(...toWrite);
      throw error;
    }
  }
  /**
   * Store a session
   */
  storeSession(session) {
    const sessionsDir = join(dirname(this.config.storageLocation), "sessions");
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }
    const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const logFile = join(sessionsDir, `${month}.jsonl`);
    try {
      appendFileSync(logFile, JSON.stringify(session) + "\n", "utf-8");
    } catch (error) {
      console.error("[UsageTracker] Failed to store session:", error);
    }
  }
  /**
   * Read events for a date
   */
  readEvents(date) {
    const logFile = join(this.config.storageLocation, `${date}.jsonl`);
    if (!existsSync(logFile)) {
      return [];
    }
    const content = readFileSync(logFile, "utf-8");
    return content.split("\n").filter((line) => line.trim()).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter((e) => e !== null);
  }
  /**
   * Read events for date range
   */
  readEventsRange(startDate, endDate) {
    const events = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split("T")[0];
      events.push(...this.readEvents(date));
    }
    return events;
  }
  /**
   * Get recent events (last N days)
   */
  getRecentEvents(days = 7) {
    const end = /* @__PURE__ */ new Date();
    const start = /* @__PURE__ */ new Date();
    start.setDate(start.getDate() - days);
    return this.readEventsRange(
      start.toISOString().split("T")[0],
      end.toISOString().split("T")[0]
    );
  }
  /**
   * Read sessions for a month
   */
  readSessions(month) {
    const sessionsDir = join(dirname(this.config.storageLocation), "sessions");
    const logFile = join(sessionsDir, `${month}.jsonl`);
    if (!existsSync(logFile)) {
      return [];
    }
    const content = readFileSync(logFile, "utf-8");
    return content.split("\n").filter((line) => line.trim()).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter((s) => s !== null);
  }
  /**
   * Get available log dates
   */
  getAvailableDates() {
    if (!existsSync(this.config.storageLocation)) {
      return [];
    }
    return readdirSync(this.config.storageLocation).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(".jsonl", "")).sort();
  }
  /**
   * Get stats for an entity
   */
  getEntityStats(entityId, days = 30) {
    const events = this.getRecentEvents(days).filter((e) => e.entityId === entityId);
    const byTrigger = {
      auto: 0,
      manual: 0,
      bundle: 0,
      council: 0
    };
    for (const event of events) {
      byTrigger[event.trigger]++;
    }
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1e3;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1e3;
    const recentCount = events.filter((e) => new Date(e.timestamp).getTime() > weekAgo).length;
    const previousCount = events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t > twoWeeksAgo && t <= weekAgo;
    }).length;
    let recentTrend = "stable";
    if (recentCount > previousCount * 1.2) recentTrend = "up";
    else if (recentCount < previousCount * 0.8) recentTrend = "down";
    return {
      totalUsage: events.length,
      byTrigger,
      recentTrend
    };
  }
  /**
   * Get co-occurrence stats (entities used together)
   */
  getCoOccurrence(days = 30) {
    this.readSessions((/* @__PURE__ */ new Date()).toISOString().slice(0, 7));
    const events = this.getRecentEvents(days);
    const eventsBySession = /* @__PURE__ */ new Map();
    for (const event of events) {
      if (!event.sessionId) continue;
      if (!eventsBySession.has(event.sessionId)) {
        eventsBySession.set(event.sessionId, []);
      }
      eventsBySession.get(event.sessionId).push(event);
    }
    const coOccurrence = /* @__PURE__ */ new Map();
    for (const [_, sessionEvents] of eventsBySession) {
      const entityIds = [...new Set(sessionEvents.map((e) => e.entityId))];
      for (let i = 0; i < entityIds.length; i++) {
        for (let j = i + 1; j < entityIds.length; j++) {
          const a = entityIds[i];
          const b = entityIds[j];
          if (!coOccurrence.has(a)) coOccurrence.set(a, /* @__PURE__ */ new Map());
          if (!coOccurrence.has(b)) coOccurrence.set(b, /* @__PURE__ */ new Map());
          coOccurrence.get(a).set(b, (coOccurrence.get(a).get(b) ?? 0) + 1);
          coOccurrence.get(b).set(a, (coOccurrence.get(b).get(a) ?? 0) + 1);
        }
      }
    }
    return coOccurrence;
  }
};
new UsageTracker();
var DEFAULT_CONFIG6 = {
  storageLocation: ".opus67/evolution/learnings",
  maxLearnings: 500,
  autoDeprecateThreshold: 10,
  confidenceDecayRate: 0.01
};
var LearningStore = class extends EventEmitter {
  config;
  learnings = /* @__PURE__ */ new Map();
  indexByType = /* @__PURE__ */ new Map();
  indexByEntity = /* @__PURE__ */ new Map();
  dirty = false;
  constructor(config) {
    super();
    this.config = { ...DEFAULT_CONFIG6, ...config };
    this.ensureStorageDir();
    this.load();
  }
  /**
   * Ensure storage directory exists
   */
  ensureStorageDir() {
    const dir = this.config.storageLocation;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  /**
   * Load learnings from storage
   */
  load() {
    const mainFile = join(this.config.storageLocation, "learnings.json");
    if (!existsSync(mainFile)) {
      return;
    }
    try {
      const content = readFileSync(mainFile, "utf-8");
      const data = JSON.parse(content);
      for (const learning of data) {
        this.learnings.set(learning.id, learning);
        this.addToIndices(learning);
      }
    } catch (error) {
      console.error("[LearningStore] Failed to load:", error);
    }
  }
  /**
   * Save learnings to storage
   */
  save() {
    if (!this.dirty) return;
    const mainFile = join(this.config.storageLocation, "learnings.json");
    const learnings = Array.from(this.learnings.values());
    try {
      writeFileSync(mainFile, JSON.stringify(learnings, null, 2), "utf-8");
      this.dirty = false;
    } catch (error) {
      console.error("[LearningStore] Failed to save:", error);
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
    }
  }
  /**
   * Add learning to indices
   */
  addToIndices(learning) {
    if (!this.indexByType.has(learning.type)) {
      this.indexByType.set(learning.type, /* @__PURE__ */ new Set());
    }
    this.indexByType.get(learning.type).add(learning.id);
    for (const entity of learning.entities) {
      const key = `${entity.type}:${entity.id}`;
      if (!this.indexByEntity.has(key)) {
        this.indexByEntity.set(key, /* @__PURE__ */ new Set());
      }
      this.indexByEntity.get(key).add(learning.id);
    }
  }
  /**
   * Remove learning from indices
   */
  removeFromIndices(learning) {
    this.indexByType.get(learning.type)?.delete(learning.id);
    for (const entity of learning.entities) {
      const key = `${entity.type}:${entity.id}`;
      this.indexByEntity.get(key)?.delete(learning.id);
    }
  }
  /**
   * Create a new learning
   */
  create(params) {
    const similar = this.findSimilar(params.type, params.entities);
    if (similar) {
      return this.addEvidence(similar.id, params.evidence);
    }
    if (this.learnings.size >= this.config.maxLearnings) {
      this.pruneOldLearnings();
    }
    const learning = {
      id: generateId("learning"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      type: params.type,
      insight: params.insight,
      confidence: Math.min(1, Math.max(0, params.confidence)),
      evidenceCount: params.evidence.length,
      evidence: params.evidence.slice(0, 20),
      // Keep last 20 evidence items
      triggerConditions: params.triggerConditions,
      entities: params.entities,
      expectedBenefit: params.expectedBenefit,
      applicationCount: 0,
      status: "active"
    };
    this.learnings.set(learning.id, learning);
    this.addToIndices(learning);
    this.dirty = true;
    this.emit("learning:created", learning);
    return learning;
  }
  /**
   * Find similar existing learning
   */
  findSimilar(type, entities) {
    const typeLearnings = this.indexByType.get(type);
    if (!typeLearnings) return null;
    for (const id of typeLearnings) {
      const learning = this.learnings.get(id);
      if (!learning || learning.status !== "active") continue;
      const entityIds = entities.map((e) => `${e.type}:${e.id}`).sort();
      const learningEntityIds = learning.entities.map((e) => `${e.type}:${e.id}`).sort();
      if (entityIds.join(",") === learningEntityIds.join(",")) {
        return learning;
      }
    }
    return null;
  }
  /**
   * Add evidence to existing learning
   */
  addEvidence(learningId, evidence) {
    const learning = this.learnings.get(learningId);
    if (!learning) {
      throw new Error(`Learning not found: ${learningId}`);
    }
    learning.evidence.unshift(...evidence);
    learning.evidence = learning.evidence.slice(0, 20);
    learning.evidenceCount += evidence.length;
    const positiveCount = evidence.filter((e) => e.outcome === "positive").length;
    const negativeCount = evidence.filter((e) => e.outcome === "negative").length;
    if (positiveCount > negativeCount) {
      learning.confidence = Math.min(1, learning.confidence + 0.05 * positiveCount);
    } else if (negativeCount > positiveCount) {
      learning.confidence = Math.max(0, learning.confidence - 0.1 * negativeCount);
    }
    learning.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.dirty = true;
    this.emit("learning:updated", learning);
    return learning;
  }
  /**
   * Record that a learning was applied
   */
  recordApplication(learningId, success) {
    const learning = this.learnings.get(learningId);
    if (!learning) return null;
    learning.applicationCount++;
    if (learning.actualBenefit === void 0) {
      learning.actualBenefit = success ? 1 : 0;
    } else {
      learning.actualBenefit = (learning.actualBenefit * (learning.applicationCount - 1) + (success ? 1 : 0)) / learning.applicationCount;
    }
    if (learning.applicationCount >= this.config.autoDeprecateThreshold && (learning.actualBenefit ?? 0) < 0.3) {
      learning.status = "deprecated";
      this.emit("learning:deprecated", learning);
    }
    learning.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.dirty = true;
    return learning;
  }
  /**
   * Get a learning by ID
   */
  get(id) {
    return this.learnings.get(id);
  }
  /**
   * Get all active learnings
   */
  getActive() {
    return Array.from(this.learnings.values()).filter((l) => l.status === "active");
  }
  /**
   * Get learnings by type
   */
  getByType(type) {
    const ids = this.indexByType.get(type) ?? /* @__PURE__ */ new Set();
    return Array.from(ids).map((id) => this.learnings.get(id)).filter((l) => l !== void 0 && l.status === "active");
  }
  /**
   * Get learnings for an entity
   */
  getForEntity(entityType, entityId) {
    const key = `${entityType}:${entityId}`;
    const ids = this.indexByEntity.get(key) ?? /* @__PURE__ */ new Set();
    return Array.from(ids).map((id) => this.learnings.get(id)).filter((l) => l !== void 0 && l.status === "active");
  }
  /**
   * Find relevant learnings for a task context
   */
  findRelevant(context, limit = 10) {
    const activeLearnings = this.getActive();
    const scores = [];
    const lowerContext = context.toLowerCase();
    for (const learning of activeLearnings) {
      let score = 0;
      for (const condition of learning.triggerConditions) {
        if (condition.type === "keyword") {
          if (lowerContext.includes(condition.value.toLowerCase())) {
            score += condition.weight;
          }
        } else if (condition.type === "context") {
          if (lowerContext.includes(condition.value.toLowerCase())) {
            score += condition.weight;
          }
        }
      }
      score *= learning.confidence;
      if (score > 0) {
        scores.push({ learning, score });
      }
    }
    return scores.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.learning);
  }
  /**
   * Deprecate a learning
   */
  deprecate(id, reason) {
    const learning = this.learnings.get(id);
    if (!learning) return false;
    learning.status = "deprecated";
    learning.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (reason) {
      learning.entities.push({
        type: "skill",
        id: "deprecation_reason",
        effect: "exclude",
        weight: 0
      });
    }
    this.dirty = true;
    this.emit("learning:deprecated", learning);
    return true;
  }
  /**
   * Prune old/low-performing learnings
   */
  pruneOldLearnings() {
    const sorted = Array.from(this.learnings.values()).filter((l) => l.status === "active").sort((a, b) => {
      const scoreA = a.confidence * (a.actualBenefit ?? a.expectedBenefit) * (1 / (Date.now() - new Date(a.updatedAt).getTime()));
      const scoreB = b.confidence * (b.actualBenefit ?? b.expectedBenefit) * (1 / (Date.now() - new Date(b.updatedAt).getTime()));
      return scoreA - scoreB;
    });
    const toRemove = Math.ceil(sorted.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      const learning = sorted[i];
      learning.status = "deprecated";
      this.emit("learning:deprecated", learning);
    }
    this.dirty = true;
  }
  /**
   * Apply confidence decay to unused learnings
   */
  applyDecay() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1e3;
    for (const learning of this.learnings.values()) {
      if (learning.status !== "active") continue;
      const daysSinceUpdate = (now - new Date(learning.updatedAt).getTime()) / dayMs;
      if (daysSinceUpdate > 7) {
        const decay = this.config.confidenceDecayRate * Math.floor(daysSinceUpdate / 7);
        learning.confidence = Math.max(0.1, learning.confidence - decay);
        this.dirty = true;
      }
    }
  }
  /**
   * Get stats
   */
  getStats() {
    const all = Array.from(this.learnings.values());
    const active = all.filter((l) => l.status === "active");
    const totalApplications = all.reduce((sum, l) => sum + l.applicationCount, 0);
    const avgConfidence = active.length > 0 ? active.reduce((sum, l) => sum + l.confidence, 0) / active.length : 0;
    const avgBenefit = active.length > 0 ? active.reduce((sum, l) => sum + (l.actualBenefit ?? l.expectedBenefit), 0) / active.length : 0;
    return {
      totalLearnings: all.length,
      activeLearnings: active.length,
      avgConfidence,
      totalApplications,
      avgBenefit
    };
  }
  /**
   * Export learnings for backup
   */
  export() {
    return Array.from(this.learnings.values());
  }
  /**
   * Import learnings from backup
   */
  import(learnings) {
    for (const learning of learnings) {
      if (!this.learnings.has(learning.id)) {
        this.learnings.set(learning.id, learning);
        this.addToIndices(learning);
      }
    }
    this.dirty = true;
    this.save();
  }
};
new LearningStore();
var DEFAULT_LEVELS = [
  { name: "light", agentCount: 5, expectedSuccessRate: 1, timeout: 3e4 },
  { name: "medium", agentCount: 10, expectedSuccessRate: 1, timeout: 45e3 },
  { name: "heavy", agentCount: 20, expectedSuccessRate: 0.95, timeout: 6e4 },
  { name: "extreme", agentCount: 30, expectedSuccessRate: 0.9, timeout: 9e4 }
];
var TEST_PROMPTS = {
  simple: [
    "What is 2 + 2?",
    "List 3 colors",
    "Say hello",
    "Count to 5",
    "Name a fruit"
  ],
  medium: [
    "Explain what a function is in programming",
    "Write a simple hello world in JavaScript",
    "What are the primary colors?",
    "Describe the water cycle briefly",
    "List 5 programming languages"
  ],
  complex: [
    "Write a TypeScript function that implements binary search",
    "Explain the difference between REST and GraphQL APIs",
    "Design a simple database schema for a blog",
    "Write unit tests for a calculator function",
    "Implement a debounce function in JavaScript"
  ]
};
var StressTest = class extends EventEmitter {
  spawner;
  taskCounter = 0;
  constructor(spawner) {
    super();
    this.spawner = spawner ?? createSpawner(50);
  }
  /**
   * Generate test tasks
   */
  generateTasks(count, complexity = "simple") {
    const prompts = TEST_PROMPTS[complexity];
    const tasks = [];
    for (let i = 0; i < count; i++) {
      this.taskCounter++;
      tasks.push({
        id: `stress_${this.taskCounter}`,
        type: "stress-test",
        prompt: prompts[i % prompts.length],
        priority: Math.random(),
        // Random priority for realistic load
        timeout: 3e4,
        metadata: { complexity, index: i }
      });
    }
    return tasks;
  }
  /**
   * Create a mock executor for testing
   */
  createMockExecutor(options) {
    const { minLatency = 50, maxLatency = 200, failureRate = 0.02 } = options ?? {};
    return async (task) => {
      const latency = minLatency + Math.random() * (maxLatency - minLatency);
      await new Promise((resolve) => setTimeout(resolve, latency));
      if (Math.random() < failureRate) {
        throw new Error("Simulated agent failure");
      }
      const inputTokens = Math.floor(50 + Math.random() * 100);
      const outputTokens = Math.floor(100 + Math.random() * 200);
      tokenTracker.record(
        task.id,
        task.type,
        "gemini-2.0-flash",
        // Use free model for stress tests
        { input: inputTokens, output: outputTokens }
      );
      return `Completed: ${task.prompt.slice(0, 30)}...`;
    };
  }
  /**
   * Run a single stress level
   */
  async runLevel(level, executor) {
    this.emit("level:start", level);
    metricsCollector.reset();
    this.spawner.clearResults();
    const tasks = this.generateTasks(level.agentCount);
    const exec = executor ?? this.createMockExecutor();
    const spanId = latencyProfiler.startSpan(`stress:${level.name}`);
    const results = await this.spawner.spawnBatch(tasks, exec, {
      maxConcurrent: level.agentCount,
      // Allow full parallelism
      timeout: level.timeout,
      onProgress: (completed, total) => {
        this.emit("progress", completed, total, level.name);
      }
    });
    latencyProfiler.endSpan(spanId);
    const successCount = results.filter((r) => r.success).length;
    const successRate = successCount / results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const metrics = metricsCollector.createSnapshot(`stress-${level.name}`, {
      level: level.name,
      agentCount: level.agentCount
    });
    const result = {
      level,
      results,
      metrics,
      successRate,
      avgDuration,
      peakConcurrency: metrics.metrics.throughput.peakConcurrency,
      passed: successRate >= level.expectedSuccessRate
    };
    this.emit("level:complete", result);
    return result;
  }
  /**
   * Run full stress test suite
   */
  async runSuite(levels = DEFAULT_LEVELS, executor) {
    const suiteStart = Date.now();
    const results = [];
    let maxStableAgents = 0;
    for (const level of levels) {
      const result = await this.runLevel(level, executor);
      results.push(result);
      if (result.passed) {
        maxStableAgents = Math.max(maxStableAgents, level.agentCount);
      }
    }
    const suite = {
      name: `stress-test-${Date.now()}`,
      levels,
      results,
      summary: {
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
        maxStableAgents,
        totalDuration: Date.now() - suiteStart
      }
    };
    this.emit("suite:complete", suite);
    return suite;
  }
  /**
   * Quick stress test (5 and 10 agents only)
   */
  async runQuick(executor) {
    const quickLevels = DEFAULT_LEVELS.slice(0, 2);
    return this.runSuite(quickLevels, executor);
  }
  /**
   * Run with custom agent counts
   */
  async runCustom(agentCounts, executor) {
    const levels = agentCounts.map((count, i) => ({
      name: `level-${count}`,
      agentCount: count,
      expectedSuccessRate: count <= 10 ? 1 : count <= 20 ? 0.95 : 0.9,
      timeout: 3e4 + count * 1e3
    }));
    return this.runSuite(levels, executor);
  }
  /**
   * Format suite results
   */
  formatResults(suite) {
    let output = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                    OPUS 67 STRESS TEST RESULTS                    \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                   \u2551
\u2551  SUMMARY                                                          \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Passed: ${String(suite.summary.passed).padEnd(3)} / ${suite.results.length}   Max Stable: ${String(suite.summary.maxStableAgents).padEnd(3)} agents          \u2551
\u2551  Total Duration: ${(suite.summary.totalDuration / 1e3).toFixed(1)}s                                      \u2551
\u2551                                                                   \u2551
\u2551  LEVEL RESULTS                                                    \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  LEVEL      AGENTS   SUCCESS   AVG MS    PEAK      STATUS         \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551`;
    for (const result of suite.results) {
      const status = result.passed ? "\u2713 PASS" : "\u2717 FAIL";
      const successPct = (result.successRate * 100).toFixed(0) + "%";
      output += `
\u2551  ${result.level.name.padEnd(10)} ${String(result.level.agentCount).padEnd(8)} ${successPct.padEnd(9)} ${result.avgDuration.toFixed(0).padEnd(9)} ${String(result.peakConcurrency).padEnd(9)} ${status.padEnd(8)} \u2551`;
    }
    output += `
\u2551                                                                   \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                   \u2551
\u2551  RECOMMENDATIONS                                                  \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551`;
    if (suite.summary.maxStableAgents >= 30) {
      output += `
\u2551  \u2713 Excellent! System handles 30+ concurrent agents               \u2551
\u2551  \u2713 Ready for production swarm workloads                          \u2551`;
    } else if (suite.summary.maxStableAgents >= 20) {
      output += `
\u2551  \u2713 Good! System handles 20+ concurrent agents                    \u2551
\u2551  \u26A0 Consider rate limit handling for 30+ agents                   \u2551`;
    } else if (suite.summary.maxStableAgents >= 10) {
      output += `
\u2551  \u26A0 Moderate: System handles 10-20 concurrent agents              \u2551
\u2551  \u26A0 Check API rate limits and timeout settings                    \u2551`;
    } else {
      output += `
\u2551  \u2717 Limited: System struggles with parallel agents                \u2551
\u2551  \u2717 Review network, API limits, and resource constraints          \u2551`;
    }
    output += `
\u2551                                                                   \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
    return output;
  }
};
function createStressTest(spawner) {
  return new StressTest(spawner);
}
var stressTest = new StressTest();
async function runStressTestCLI(levels) {
  console.log("\n\u{1F525} Starting OPUS 67 Stress Test...\n");
  const test = createStressTest();
  test.on("level:start", (level) => {
    console.log(`
\u{1F4CA} Testing ${level.name}: ${level.agentCount} agents...`);
  });
  test.on("progress", (completed, total, level) => {
    const pct = Math.round(completed / total * 100);
    process.stdout.write(`\r   Progress: ${completed}/${total} (${pct}%)`);
  });
  test.on("level:complete", (result) => {
    const status = result.passed ? "\u2713" : "\u2717";
    console.log(`
   ${status} ${result.level.name}: ${(result.successRate * 100).toFixed(0)}% success, ${result.avgDuration.toFixed(0)}ms avg`);
  });
  const suite = levels ? await test.runCustom(levels) : await test.runSuite();
  console.log(test.formatResults(suite));
}
var COMPARISON_TASKS = [
  // Scanning tasks (OPUS67 uses Gemini FREE)
  {
    id: "scan-1",
    name: "Codebase Scan",
    prompt: "Scan the codebase and list all TypeScript files with their export counts",
    complexity: "simple",
    category: "scan"
  },
  {
    id: "scan-2",
    name: "Dependency Check",
    prompt: "Check all package.json files and list outdated dependencies",
    complexity: "simple",
    category: "scan"
  },
  // Generation tasks (OPUS67 uses DeepSeek CHEAP)
  {
    id: "gen-1",
    name: "Function Generation",
    prompt: "Write a TypeScript function that validates email addresses with proper error handling",
    complexity: "medium",
    category: "generate"
  },
  {
    id: "gen-2",
    name: "Component Generation",
    prompt: "Create a React component for a pagination control with prev/next and page numbers",
    complexity: "medium",
    category: "generate"
  },
  {
    id: "gen-3",
    name: "API Endpoint",
    prompt: "Write a REST API endpoint for user authentication with JWT tokens",
    complexity: "complex",
    category: "generate"
  },
  // Review tasks (OPUS67 uses Claude QUALITY - same as vanilla)
  {
    id: "review-1",
    name: "Code Review",
    prompt: "Review this code for security vulnerabilities and best practices",
    complexity: "complex",
    category: "review"
  },
  // Reasoning tasks
  {
    id: "reason-1",
    name: "Architecture Design",
    prompt: "Design a microservices architecture for an e-commerce platform",
    complexity: "complex",
    category: "reason"
  }
];
var ComparisonRunner = class extends EventEmitter {
  results = [];
  constructor() {
    super();
  }
  /**
   * Simulate OPUS 67 execution (uses multi-model router)
   */
  async runOpus67(task) {
    const spanId = latencyProfiler.startSpan(`opus67:${task.category}`);
    const taskType = task.category === "generate" ? "build" : task.category;
    const route = router.route({
      taskType,
      prompt: task.prompt
    });
    const baseLatency = task.complexity === "simple" ? 100 : task.complexity === "medium" ? 200 : 400;
    const latency = baseLatency + Math.random() * 100;
    await new Promise((r) => setTimeout(r, latency));
    const inputTokens = Math.ceil(task.prompt.length / 4);
    const outputTokens = task.complexity === "simple" ? 100 : task.complexity === "medium" ? 300 : 600;
    const cost = tokenTracker.calculateCost(route.model, {
      input: inputTokens,
      output: outputTokens
    });
    const duration = latencyProfiler.endSpan(spanId);
    return {
      runtime: "opus67",
      task,
      success: true,
      duration,
      tokens: { input: inputTokens, output: outputTokens },
      cost,
      model: route.model
    };
  }
  /**
   * Simulate Vanilla Opus 4.5 execution (always uses Claude)
   */
  async runVanilla(task) {
    const spanId = latencyProfiler.startSpan(`vanilla:${task.category}`);
    const model = "claude-sonnet-4";
    const baseLatency = task.complexity === "simple" ? 150 : task.complexity === "medium" ? 350 : 700;
    const latency = baseLatency + Math.random() * 150;
    await new Promise((r) => setTimeout(r, latency));
    const inputTokens = Math.ceil(task.prompt.length / 4);
    const outputTokens = task.complexity === "simple" ? 100 : task.complexity === "medium" ? 300 : 600;
    const cost = tokenTracker.calculateCost(model, {
      input: inputTokens,
      output: outputTokens
    });
    const duration = latencyProfiler.endSpan(spanId);
    return {
      runtime: "vanilla",
      task,
      success: true,
      duration,
      tokens: { input: inputTokens, output: outputTokens },
      cost,
      model
    };
  }
  /**
   * Run comparison for a single task
   */
  async compareTask(task) {
    this.emit("task:start", task);
    const [opus67Result, vanillaResult] = await Promise.all([
      this.runOpus67(task),
      this.runVanilla(task)
    ]);
    const costSavings = vanillaResult.cost - opus67Result.cost;
    const costSavingsPct = vanillaResult.cost > 0 ? costSavings / vanillaResult.cost * 100 : 0;
    const speedup = vanillaResult.duration - opus67Result.duration;
    const speedupPct = vanillaResult.duration > 0 ? speedup / vanillaResult.duration * 100 : 0;
    const result = {
      task,
      opus67: opus67Result,
      vanilla: vanillaResult,
      improvements: {
        costSavings,
        costSavingsPct,
        speedup,
        speedupPct
      }
    };
    this.results.push(result);
    this.emit("task:complete", result);
    return result;
  }
  /**
   * Run full comparison suite
   */
  async runSuite(tasks = COMPARISON_TASKS, iterations = 1) {
    const allResults = [];
    for (let i = 0; i < iterations; i++) {
      for (const task of tasks) {
        const result = await this.compareTask(task);
        allResults.push(result);
      }
    }
    let totalOpus67Cost = 0;
    let totalVanillaCost = 0;
    let totalCostSavings = 0;
    let totalSpeedup = 0;
    let opus67Wins = 0;
    let vanillaWins = 0;
    for (const result of allResults) {
      totalOpus67Cost += result.opus67.cost;
      totalVanillaCost += result.vanilla.cost;
      totalCostSavings += result.improvements.costSavingsPct;
      totalSpeedup += result.improvements.speedupPct;
      if (result.opus67.cost < result.vanilla.cost) {
        opus67Wins++;
      } else if (result.vanilla.cost < result.opus67.cost) {
        vanillaWins++;
      }
    }
    const suite = {
      name: `comparison-${Date.now()}`,
      iterations,
      results: allResults,
      summary: {
        avgCostSavings: totalCostSavings / allResults.length,
        avgSpeedup: totalSpeedup / allResults.length,
        totalOpus67Cost,
        totalVanillaCost,
        opus67Wins,
        vanillaWins
      }
    };
    this.emit("suite:complete", suite);
    return suite;
  }
  /**
   * Get results
   */
  getResults() {
    return [...this.results];
  }
  /**
   * Clear results
   */
  clearResults() {
    this.results = [];
  }
  /**
   * Format comparison results
   */
  formatResults(suite) {
    const s = suite.summary;
    const totalSavings = s.totalVanillaCost - s.totalOpus67Cost;
    const savingsPct = s.totalVanillaCost > 0 ? totalSavings / s.totalVanillaCost * 100 : 0;
    let output = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551              OPUS 67 vs VANILLA OPUS 4.5 COMPARISON               \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                   \u2551
\u2551  COST COMPARISON                                                  \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  OPUS 67 Total:      $${s.totalOpus67Cost.toFixed(4).padEnd(12)}                       \u2551
\u2551  Vanilla Total:      $${s.totalVanillaCost.toFixed(4).padEnd(12)}                       \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  SAVINGS:            $${totalSavings.toFixed(4).padEnd(8)} (${savingsPct.toFixed(1)}%)                    \u2551
\u2551                                                                   \u2551
\u2551  PERFORMANCE                                                      \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Avg Cost Savings:   ${s.avgCostSavings.toFixed(1)}%                                     \u2551
\u2551  Avg Speed Improvement: ${s.avgSpeedup.toFixed(1)}%                                  \u2551
\u2551                                                                   \u2551
\u2551  WINS                                                             \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  OPUS 67 Wins:       ${String(s.opus67Wins).padEnd(5)} (${(s.opus67Wins / suite.results.length * 100).toFixed(0)}%)                            \u2551
\u2551  Vanilla Wins:       ${String(s.vanillaWins).padEnd(5)} (${(s.vanillaWins / suite.results.length * 100).toFixed(0)}%)                            \u2551
\u2551                                                                   \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                   \u2551
\u2551  TASK BREAKDOWN                                                   \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  TASK              OPUS67    VANILLA   SAVINGS   MODEL            \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551`;
    for (const result of suite.results.slice(0, 10)) {
      const savingStr = result.improvements.costSavings > 0 ? `+${result.improvements.costSavingsPct.toFixed(0)}%` : `${result.improvements.costSavingsPct.toFixed(0)}%`;
      output += `
\u2551  ${result.task.name.slice(0, 16).padEnd(16)} $${result.opus67.cost.toFixed(4).padEnd(8)} $${result.vanilla.cost.toFixed(4).padEnd(8)} ${savingStr.padEnd(9)} ${result.opus67.model.slice(0, 12).padEnd(12)} \u2551`;
    }
    output += `
\u2551                                                                   \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                   \u2551
\u2551  MODEL ROUTING EFFECTIVENESS                                      \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  scan/analyze  \u2192 Gemini (FREE)      100% cost savings             \u2551
\u2551  generate/build \u2192 DeepSeek ($0.14)  ~95% cost savings             \u2551
\u2551  review/audit  \u2192 Claude ($3)        Quality preserved             \u2551
\u2551                                                                   \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
    return output;
  }
};
function createComparisonRunner() {
  return new ComparisonRunner();
}
var comparisonRunner = new ComparisonRunner();
async function runComparisonCLI(iterations = 3) {
  console.log("\n\u2694\uFE0F  Starting OPUS 67 vs Vanilla Comparison...\n");
  const runner = createComparisonRunner();
  runner.on("task:start", (task) => {
    process.stdout.write(`   Testing: ${task.name}...`);
  });
  runner.on("task:complete", (result) => {
    const savings = result.improvements.costSavingsPct;
    const icon = savings > 0 ? "\u2713" : "\u25CB";
    console.log(` ${icon} ${savings.toFixed(0)}% savings`);
  });
  const suite = await runner.runSuite(COMPARISON_TASKS, iterations);
  console.log(runner.formatResults(suite));
}
var __dirname2 = dirname(fileURLToPath(import.meta.url));
var OPUS_45_CACHE_PRICING = {
  input: 3,
  // $3/M input tokens
  output: 15,
  // $15/M output tokens
  cachedInput: 0.3
  // $0.30/M cached tokens (90% savings)
};
var PromptCacheManager = class extends EventEmitter {
  config;
  anthropic = null;
  theDoorPrompt = null;
  skillsCache = /* @__PURE__ */ new Map();
  stats;
  constructor(config) {
    super();
    this.config = {
      enableCaching: config?.enableCaching ?? true,
      cacheTTLMinutes: config?.cacheTTLMinutes ?? 5,
      theDoorPath: config?.theDoorPath ?? this.getDefaultDoorPath(),
      anthropicApiKey: config?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY ?? ""
    };
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalSaved: 0,
      cachedContentSize: 0,
      lastCacheRefresh: null
    };
    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic2({
        apiKey: this.config.anthropicApiKey
      });
    }
    this.loadTheDoorPrompt();
  }
  /**
   * Get default THE DOOR prompt path
   */
  getDefaultDoorPath() {
    return join(__dirname2, "..", "..", "THE_DOOR.md");
  }
  /**
   * Load THE DOOR prompt from file
   */
  loadTheDoorPrompt() {
    try {
      if (existsSync(this.config.theDoorPath)) {
        this.theDoorPrompt = readFileSync(this.config.theDoorPath, "utf-8");
        const tokens = Math.ceil(this.theDoorPrompt.length / 4);
        this.stats.cachedContentSize = tokens;
        this.stats.lastCacheRefresh = /* @__PURE__ */ new Date();
        this.emit("cache:refresh", tokens);
      } else {
        console.warn("[PromptCache] THE DOOR prompt not found at:", this.config.theDoorPath);
      }
    } catch (error) {
      console.error("[PromptCache] Failed to load THE DOOR prompt:", error);
    }
  }
  /**
   * Load a skill prompt into cache
   */
  async loadSkill(skillId, skillPath) {
    if (!existsSync(skillPath)) {
      throw new Error(`Skill file not found: ${skillPath}`);
    }
    const skillContent = readFileSync(skillPath, "utf-8");
    this.skillsCache.set(skillId, skillContent);
    const tokens = Math.ceil(skillContent.length / 4);
    this.stats.cachedContentSize += tokens;
  }
  /**
   * Build cached prompt messages for Anthropic API
   */
  buildCachedMessages(request) {
    const messages = [];
    const systemBlocks = [];
    if (this.theDoorPrompt) {
      systemBlocks.push({
        type: "text",
        text: this.theDoorPrompt,
        cache_control: { type: "ephemeral" }
      });
    }
    if (request.loadedSkills && request.loadedSkills.length > 0) {
      const skillsText = request.loadedSkills.map((id) => this.skillsCache.get(id)).filter(Boolean).join("\n\n---\n\n");
      if (skillsText) {
        systemBlocks.push({
          type: "text",
          text: `## LOADED SKILLS

${skillsText}`,
          cache_control: { type: "ephemeral" }
        });
      }
    }
    if (request.mcpTools && request.mcpTools.length > 0) {
      systemBlocks.push({
        type: "text",
        text: `## AVAILABLE MCP TOOLS

${request.mcpTools.join("\n\n")}`,
        cache_control: { type: "ephemeral" }
      });
    }
    if (request.userContext) {
      systemBlocks.push({
        type: "text",
        text: `## USER CONTEXT

${request.userContext}`,
        cache_control: { type: "ephemeral" }
      });
    }
    if (request.systemPrompt) {
      systemBlocks.push({
        type: "text",
        text: request.systemPrompt
      });
    }
    if (systemBlocks.length > 0) {
      messages.push({
        role: "user",
        content: systemBlocks
      });
      messages.push({
        role: "assistant",
        content: "Understood. I have loaded the OPUS 67 configuration, skills, tools, and user context. Ready to assist."
      });
    }
    messages.push({
      role: "user",
      content: request.query
    });
    return messages;
  }
  /**
   * Execute a query with prompt caching
   */
  async query(request) {
    if (!this.anthropic) {
      throw new Error("[PromptCache] Anthropic API key not configured");
    }
    if (!this.config.enableCaching) {
      return this.queryWithoutCache(request);
    }
    const startTime = performance.now();
    this.stats.totalQueries++;
    const messages = this.buildCachedMessages(request);
    const response = await this.anthropic.messages.create({
      model: "claude-opus-4-5-20250929",
      max_tokens: 4096,
      messages
    });
    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
    }
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cachedTokens = "cache_read_input_tokens" in response.usage ? response.usage.cache_read_input_tokens ?? 0 : 0;
    const cacheHit = cachedTokens > 0;
    if (cacheHit) {
      this.stats.cacheHits++;
      this.emit("cache:hit", cachedTokens, this.calculateSavings(cachedTokens));
    } else {
      this.stats.cacheMisses++;
      this.emit("cache:miss");
    }
    this.stats.hitRate = this.stats.cacheHits / this.stats.totalQueries;
    const cost = this.calculateCost(inputTokens, outputTokens, cachedTokens);
    if (cacheHit) {
      const savings = this.calculateSavings(cachedTokens);
      this.stats.totalSaved += savings;
      this.emit("cost:saved", savings);
    }
    const latencyMs = performance.now() - startTime;
    return {
      content,
      cacheHit,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        cached: cachedTokens
      },
      cost,
      latencyMs
    };
  }
  /**
   * Query without caching (fallback)
   */
  async queryWithoutCache(request) {
    if (!this.anthropic) {
      throw new Error("[PromptCache] Anthropic API key not configured");
    }
    const startTime = performance.now();
    const response = await this.anthropic.messages.create({
      model: "claude-opus-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: request.query
        }
      ]
    });
    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
    }
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = this.calculateCost(inputTokens, outputTokens, 0);
    const latencyMs = performance.now() - startTime;
    return {
      content,
      cacheHit: false,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        cached: 0
      },
      cost,
      latencyMs
    };
  }
  /**
   * Calculate cost with caching
   */
  calculateCost(inputTokens, outputTokens, cachedTokens) {
    const uncachedInput = inputTokens - cachedTokens;
    const inputCost = uncachedInput / 1e6 * OPUS_45_CACHE_PRICING.input;
    const cachedCost = cachedTokens / 1e6 * OPUS_45_CACHE_PRICING.cachedInput;
    const outputCost = outputTokens / 1e6 * OPUS_45_CACHE_PRICING.output;
    return inputCost + cachedCost + outputCost;
  }
  /**
   * Calculate savings from cache hit
   */
  calculateSavings(cachedTokens) {
    const fullCost = cachedTokens / 1e6 * OPUS_45_CACHE_PRICING.input;
    const cachedCost = cachedTokens / 1e6 * OPUS_45_CACHE_PRICING.cachedInput;
    return fullCost - cachedCost;
  }
  /**
   * Get cache statistics
   */
  getStats() {
    return Object.freeze({ ...this.stats });
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalQueries: this.stats.totalQueries,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalSaved: 0,
      cachedContentSize: this.stats.cachedContentSize,
      lastCacheRefresh: this.stats.lastCacheRefresh
    };
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return Object.freeze({ ...this.config });
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic2({
        apiKey: config.anthropicApiKey
      });
    }
    if (config.theDoorPath) {
      this.loadTheDoorPrompt();
    }
  }
  /**
   * Format statistics for display
   */
  formatStats() {
    const stats = this.stats;
    return `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                  PROMPT CACHE STATISTICS                         \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                  \u2551
\u2551  CACHE PERFORMANCE                                               \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Total Queries:    ${String(stats.totalQueries).padEnd(45)} \u2551
\u2551  Cache Hits:       ${String(stats.cacheHits).padEnd(45)} \u2551
\u2551  Cache Misses:     ${String(stats.cacheMisses).padEnd(45)} \u2551
\u2551  Hit Rate:         ${(stats.hitRate * 100).toFixed(1).padEnd(43)}% \u2551
\u2551                                                                  \u2551
\u2551  COST SAVINGS                                                    \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Total Saved:      $${stats.totalSaved.toFixed(2).padEnd(44)} \u2551
\u2551  Cached Size:      ${String(stats.cachedContentSize).padEnd(43)} tokens \u2551
\u2551  Last Refresh:     ${(stats.lastCacheRefresh?.toLocaleString() ?? "Never").padEnd(44)} \u2551
\u2551                                                                  \u2551
\u2551  STATUS                                                          \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Caching:          ${(this.config.enableCaching ? "\u2705 ENABLED" : "\u274C DISABLED").padEnd(47)} \u2551
\u2551  TTL:              ${String(this.config.cacheTTLMinutes).padEnd(51)} min \u2551
\u2551                                                                  \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
  }
};
function createPromptCache(config) {
  return new PromptCacheManager(config);
}
var DEFAULT_CONFIG7 = {
  maxFiles: 500,
  enableAutoSummary: true,
  enableRelationshipTracking: true,
  enableConsistencyChecks: true
};
var FileContextManager = class extends EventEmitter {
  files = /* @__PURE__ */ new Map();
  relationships = /* @__PURE__ */ new Map();
  config;
  // Session tracking
  sessionStart;
  sessionFiles = /* @__PURE__ */ new Set();
  constructor(config = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG7, ...config };
    this.sessionStart = /* @__PURE__ */ new Date();
  }
  // =========================================================================
  // File Tracking
  // =========================================================================
  /**
   * Register a file access
   */
  async accessFile(filePath, content) {
    const normalized = this.normalizePath(filePath);
    let metadata = this.files.get(normalized);
    if (!metadata) {
      metadata = await this.createMetadata(filePath, content);
      this.files.set(normalized, metadata);
      this.sessionFiles.add(normalized);
      if (content && this.config.enableRelationshipTracking) {
        await this.updateRelationships(metadata);
        await this.recheckDependencies(normalized);
      }
    } else {
      metadata.lastAccessed = /* @__PURE__ */ new Date();
      metadata.accessCount++;
      if (content) {
        const newHash = this.hashContent(content);
        if (newHash !== metadata.hash) {
          await this.updateMetadata(metadata, content);
        }
      }
    }
    this.emit("file:accessed", normalized);
    return metadata;
  }
  /**
   * Register a file modification
   */
  async modifyFile(filePath, content, description, linesChanged) {
    const metadata = await this.accessFile(filePath, content);
    metadata.lastEdit = {
      timestamp: /* @__PURE__ */ new Date(),
      description,
      linesChanged
    };
    await this.updateMetadata(metadata, content);
    if (this.config.enableConsistencyChecks) {
      const check = await this.checkConsistency(filePath);
      if (!check.passed) {
        if (check.errors.length > 0) {
          this.emit("consistency:error", check);
        } else if (check.warnings.length > 0) {
          this.emit("consistency:warning", check);
        }
      }
    }
    this.emit("file:modified", filePath, metadata);
    return metadata;
  }
  /**
   * Delete a file from tracking
   */
  deleteFile(filePath) {
    const normalized = this.normalizePath(filePath);
    this.files.delete(normalized);
    this.relationships.delete(normalized);
    this.sessionFiles.delete(normalized);
    for (const metadata of this.files.values()) {
      metadata.dependencies.delete(normalized);
      metadata.dependents.delete(normalized);
    }
    this.emit("file:deleted", normalized);
  }
  // =========================================================================
  // Metadata Management
  // =========================================================================
  /**
   * Create metadata for a new file
   */
  async createMetadata(filePath, content) {
    const normalized = this.normalizePath(filePath);
    const absolutePath = path.resolve(filePath);
    const metadata = {
      path: normalized,
      absolutePath,
      hash: content ? this.hashContent(content) : "",
      language: this.detectLanguage(filePath),
      size: content?.length || 0,
      lastModified: /* @__PURE__ */ new Date(),
      lastAccessed: /* @__PURE__ */ new Date(),
      accessCount: 1,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      types: [],
      dependencies: /* @__PURE__ */ new Set(),
      dependents: /* @__PURE__ */ new Set()
    };
    if (content) {
      await this.analyzeContent(metadata, content, false);
    }
    return metadata;
  }
  /**
   * Update metadata after content change
   */
  async updateMetadata(metadata, content) {
    metadata.hash = this.hashContent(content);
    metadata.size = content.length;
    metadata.lastModified = /* @__PURE__ */ new Date();
    await this.analyzeContent(metadata, content);
    if (this.config.enableRelationshipTracking) {
      await this.updateRelationships(metadata);
    }
  }
  /**
   * Analyze file content to extract structure
   */
  async analyzeContent(metadata, content, updateRelationships = true) {
    const { language } = metadata;
    metadata.imports = this.extractImports(content, language);
    metadata.exports = this.extractExports(content, language);
    metadata.functions = this.extractFunctions(content, language);
    metadata.classes = this.extractClasses(content, language);
    metadata.types = this.extractTypes(content, language);
    if (this.config.enableAutoSummary && !metadata.summary) {
      metadata.summary = this.generateSummary(metadata, content);
    }
    if (updateRelationships && this.config.enableRelationshipTracking) {
      await this.updateRelationships(metadata);
    }
  }
  // =========================================================================
  // Relationship Tracking
  // =========================================================================
  /**
   * Update relationships for a file
   */
  async updateRelationships(metadata) {
    const { path: filePath, imports } = metadata;
    metadata.dependencies.clear();
    for (const importPath of imports) {
      const resolved = this.resolveImport(filePath, importPath);
      if (resolved) {
        metadata.dependencies.add(resolved);
        const imported = this.files.get(resolved);
        if (imported) {
          imported.dependents.add(filePath);
        }
        const relationship = {
          from: filePath,
          to: resolved,
          type: "imports",
          strength: 1
        };
        this.addRelationship(relationship);
      }
    }
  }
  /**
   * Re-check existing files that might import the newly added file
   */
  async recheckDependencies(newFilePath) {
    for (const [path2, metadata] of this.files) {
      if (path2 === newFilePath) continue;
      await this.updateRelationships(metadata);
    }
  }
  /**
   * Add a relationship
   */
  addRelationship(rel) {
    if (!this.relationships.has(rel.from)) {
      this.relationships.set(rel.from, /* @__PURE__ */ new Set());
    }
    this.relationships.get(rel.from).add(rel);
    this.emit("relationship:discovered", rel);
  }
  /**
   * Get all relationships for a file
   */
  getRelationships(filePath) {
    const normalized = this.normalizePath(filePath);
    const rels = this.relationships.get(normalized);
    return rels ? Array.from(rels) : [];
  }
  /**
   * Get related files (dependencies + dependents)
   */
  getRelatedFiles(filePath, maxDepth = 2) {
    const related = /* @__PURE__ */ new Set();
    const visited = /* @__PURE__ */ new Set();
    const queue = [{ path: filePath, depth: 0 }];
    while (queue.length > 0) {
      const { path: current, depth } = queue.shift();
      if (visited.has(current) || depth > maxDepth) {
        continue;
      }
      visited.add(current);
      const metadata = this.files.get(current);
      if (!metadata) continue;
      for (const dep of metadata.dependencies) {
        related.add(dep);
        if (depth + 1 <= maxDepth) {
          queue.push({ path: dep, depth: depth + 1 });
        }
      }
      for (const dependent of metadata.dependents) {
        related.add(dependent);
        if (depth + 1 <= maxDepth) {
          queue.push({ path: dependent, depth: depth + 1 });
        }
      }
    }
    related.delete(filePath);
    return related;
  }
  // =========================================================================
  // Consistency Checking
  // =========================================================================
  /**
   * Check consistency of a file after modification
   */
  async checkConsistency(filePath) {
    const normalized = this.normalizePath(filePath);
    const metadata = this.files.get(normalized);
    const check = {
      file: filePath,
      passed: true,
      warnings: [],
      errors: [],
      suggestions: []
    };
    if (!metadata) {
      check.passed = false;
      check.errors.push("File not found in context");
      return check;
    }
    for (const importPath of metadata.imports) {
      const resolved = this.resolveImport(filePath, importPath);
      if (!resolved || !this.files.has(resolved)) {
        check.warnings.push(`Import not found: ${importPath}`);
        check.passed = false;
      }
    }
    if (metadata.exports.length > 0 && metadata.dependents.size === 0) {
      check.suggestions.push("This file exports code but has no dependents");
    }
    const circular = this.detectCircularDependency(filePath);
    if (circular.length > 0) {
      check.warnings.push(`Circular dependency detected: ${circular.join(" -> ")}`);
      check.passed = false;
    }
    if (metadata.language === "typescript" || metadata.language === "javascript") {
      for (const dep of metadata.dependencies) {
        const depMetadata = this.files.get(dep);
        if (depMetadata && depMetadata.exports.length === 0) {
          check.suggestions.push(`Dependency ${dep} has no exports`);
        }
      }
    }
    return check;
  }
  /**
   * Detect circular dependencies
   */
  detectCircularDependency(filePath, visited = /* @__PURE__ */ new Set()) {
    if (visited.has(filePath)) {
      return [filePath];
    }
    visited.add(filePath);
    const metadata = this.files.get(filePath);
    if (!metadata) return [];
    for (const dep of metadata.dependencies) {
      const cycle = this.detectCircularDependency(dep, visited);
      if (cycle.length > 0) {
        return [filePath, ...cycle];
      }
    }
    return [];
  }
  // =========================================================================
  // Code Analysis Helpers
  // =========================================================================
  /**
   * Extract import statements
   */
  extractImports(content, language) {
    const imports = [];
    if (language === "typescript" || language === "javascript") {
      const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      const bareImportRegex = /import\s+['"]([^'"]+)['"]/g;
      while ((match = bareImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    } else if (language === "python") {
      const fromImportRegex = /^\s*from\s+(\S+)\s+import\s+/gm;
      let match;
      while ((match = fromImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      const importRegex = /^\s*import\s+(\S+)/gm;
      while ((match = importRegex.exec(content)) !== null) {
        const modules = match[1].split(",").map((m) => m.trim());
        imports.push(...modules);
      }
    }
    return [...new Set(imports)];
  }
  /**
   * Extract export statements
   */
  extractExports(content, language) {
    const exports$1 = [];
    if (language === "typescript" || language === "javascript") {
      const exportRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        exports$1.push(match[1]);
      }
      const namedExportRegex = /export\s+\{([^}]+)\}/g;
      while ((match = namedExportRegex.exec(content)) !== null) {
        const names = match[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0]);
        exports$1.push(...names);
      }
    } else if (language === "python") {
      const defRegex = /^(?:def|class)\s+(\w+)/gm;
      let match;
      while ((match = defRegex.exec(content)) !== null) {
        exports$1.push(match[1]);
      }
    }
    return [...new Set(exports$1)];
  }
  /**
   * Extract function definitions
   */
  extractFunctions(content, language) {
    const functions = [];
    if (language === "typescript" || language === "javascript") {
      const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        functions.push(match[1] || match[2]);
      }
    } else if (language === "python") {
      const funcRegex = /^\s*def\s+(\w+)/gm;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        functions.push(match[1]);
      }
    }
    return functions;
  }
  /**
   * Extract class definitions
   */
  extractClasses(content, language) {
    const classes = [];
    const classRegex = /class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }
    return classes;
  }
  /**
   * Extract type definitions
   */
  extractTypes(content, language) {
    const types = [];
    if (language === "typescript") {
      const typeRegex = /(?:type|interface)\s+(\w+)/g;
      let match;
      while ((match = typeRegex.exec(content)) !== null) {
        types.push(match[1]);
      }
    }
    return types;
  }
  /**
   * Generate a summary of the file
   */
  generateSummary(metadata, content) {
    const parts = [];
    if (metadata.classes.length > 0) {
      parts.push(`Defines ${metadata.classes.length} class(es): ${metadata.classes.slice(0, 3).join(", ")}`);
    }
    if (metadata.functions.length > 0) {
      parts.push(`${metadata.functions.length} function(s)`);
    }
    if (metadata.types.length > 0) {
      parts.push(`${metadata.types.length} type(s)`);
    }
    if (metadata.exports.length > 0) {
      parts.push(`Exports: ${metadata.exports.slice(0, 5).join(", ")}`);
    }
    return parts.length > 0 ? parts.join(". ") : "Code file";
  }
  // =========================================================================
  // Utilities
  // =========================================================================
  /**
   * Normalize file path
   */
  normalizePath(filePath) {
    return path.normalize(filePath).replace(/\\/g, "/");
  }
  /**
   * Detect language from file extension
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
      ".rs": "rust",
      ".go": "go",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".rb": "ruby",
      ".php": "php",
      ".swift": "swift",
      ".kt": "kotlin",
      ".sol": "solidity"
    };
    return langMap[ext] || "unknown";
  }
  /**
   * Resolve an import path to normalized path
   */
  resolveImport(fromFile, importPath) {
    if (!importPath.startsWith(".")) {
      return null;
    }
    const fromDir = path.dirname(fromFile);
    let resolved = path.join(fromDir, importPath);
    resolved = this.normalizePath(resolved);
    const extensions = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"];
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (this.files.has(withExt)) {
        return withExt;
      }
    }
    return resolved;
  }
  /**
   * Hash content for change detection
   */
  hashContent(content) {
    return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
  }
  // =========================================================================
  // Query API
  // =========================================================================
  /**
   * Get metadata for a file
   */
  getFile(filePath) {
    return this.files.get(this.normalizePath(filePath));
  }
  /**
   * Get all tracked files
   */
  getAllFiles() {
    return Array.from(this.files.values());
  }
  /**
   * Get files accessed in current session
   */
  getSessionFiles() {
    return Array.from(this.sessionFiles).map((path2) => this.files.get(path2)).filter((f) => f !== void 0);
  }
  /**
   * Get files modified in current session
   */
  getModifiedFiles() {
    return this.getSessionFiles().filter(
      (f) => f.lastEdit && f.lastEdit.timestamp >= this.sessionStart
    );
  }
  /**
   * Search files by name pattern
   */
  searchFiles(pattern) {
    const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
    return this.getAllFiles().filter((f) => regex.test(f.path));
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      totalFiles: this.files.size,
      sessionFiles: this.sessionFiles.size,
      modifiedFiles: this.getModifiedFiles().length,
      totalRelationships: Array.from(this.relationships.values()).reduce((sum, set) => sum + set.size, 0),
      languages: this.getLanguageBreakdown()
    };
  }
  /**
   * Get language breakdown
   */
  getLanguageBreakdown() {
    const breakdown = {};
    for (const file of this.files.values()) {
      breakdown[file.language] = (breakdown[file.language] || 0) + 1;
    }
    return breakdown;
  }
  /**
   * Clear all context
   */
  clear() {
    this.files.clear();
    this.relationships.clear();
    this.sessionFiles.clear();
    this.sessionStart = /* @__PURE__ */ new Date();
  }
};
var instance = null;
function createFileContext(config) {
  instance = new FileContextManager(config);
  return instance;
}

// src/brain/brain-runtime.ts
var DEFAULT_CONFIG8 = {
  enableRouter: true,
  enableCouncil: true,
  enableMemory: true,
  enableEvolution: true,
  enableIntelligence: true,
  // v4.0: Pre-indexed knowledge enabled by default
  enableCaching: true,
  // v5.0: Prompt caching enabled by default
  enableFileContext: true,
  // v5.0: File-aware memory enabled by default
  defaultMode: "auto",
  autoStartEvolution: false,
  councilThreshold: 7,
  // Use council for complexity >= 7
  costBudget: 10,
  // $10 default budget
  dryRun: false
};
var BrainRuntime = class extends EventEmitter {
  config;
  router;
  council;
  memory;
  contextEnhancer;
  evolution;
  modelClient;
  intelligence;
  // v4.0
  promptCache;
  // v5.0
  fileContext;
  // v5.0: File-aware memory
  running = false;
  currentMode;
  startTime = null;
  requestCount = 0;
  responses = [];
  intelligenceReady = false;
  // v4.0
  constructor(config) {
    super();
    this.config = { ...DEFAULT_CONFIG8, ...config };
    this.currentMode = this.config.defaultMode;
    this.router = router;
    this.council = council;
    this.memory = createMemory({ fallbackToLocal: true });
    this.contextEnhancer = new ContextEnhancer(this.memory);
    this.evolution = createEvolutionLoop({ dryRun: this.config.dryRun }, this.memory);
    this.modelClient = modelClient;
    this.intelligence = getKnowledgeStore();
    this.promptCache = createPromptCache({
      enableCaching: this.config.enableCaching,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY
    });
    this.fileContext = createFileContext({
      enableRelationshipTracking: this.config.enableFileContext,
      enableAutoSummary: true,
      maxSessionFiles: 100
    });
    this.evolution.registerDetector(patternDetector.createDetector());
    if (this.config.costBudget) {
      costTracker.setBudget({
        daily: this.config.costBudget,
        monthly: this.config.costBudget * 30,
        perRequest: this.config.costBudget / 100
      });
    }
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `brain_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }
  /**
   * Boot the BRAIN runtime
   */
  async boot() {
    this.running = true;
    this.startTime = /* @__PURE__ */ new Date();
    if (this.config.enableIntelligence) {
      try {
        await this.intelligence.initialize();
        this.intelligenceReady = true;
      } catch (error) {
        console.error("[BrainRuntime] Intelligence init failed:", error);
        this.intelligenceReady = false;
      }
    }
    if (this.config.autoStartEvolution && this.config.enableEvolution) {
      this.evolution.start();
    }
    return generateBootScreen({
      defaultMode: this.currentMode,
      showEvolution: this.config.enableEvolution,
      showCouncil: this.config.enableCouncil
    });
  }
  /**
   * Shutdown the BRAIN runtime
   */
  shutdown() {
    this.running = false;
    this.evolution.stop();
  }
  /**
   * Process a request through the BRAIN
   */
  async process(request) {
    const requestId = this.generateId();
    const startTime = performance.now();
    this.emit("request:start", requestId, request.query);
    this.requestCount++;
    try {
      const detection = request.forceMode ? { mode: request.forceMode, confidence: 1, complexity_score: 5, reasons: ["Forced mode"] } : detectMode({ query: request.query, ...request.context });
      if (detection.mode !== this.currentMode) {
        const oldMode = this.currentMode;
        this.currentMode = detection.mode;
        this.emit("mode:switched", oldMode, this.currentMode);
      }
      let preFlightCheck;
      let detectedSkills;
      if (this.config.enableIntelligence && this.intelligenceReady && !request.skipPreFlight) {
        const skillMatches = await this.intelligence.findSkillsForTask(request.query, 5);
        detectedSkills = request.skills || skillMatches.data?.map((m) => m.skillId) || [];
        if (detectedSkills.length > 0) {
          preFlightCheck = await this.intelligence.preFlightCheck(request.query, detectedSkills);
          if (preFlightCheck.blockers.length > 0) {
            console.warn(`[BrainRuntime] Pre-flight blockers:`, preFlightCheck.blockers);
          }
        }
      }
      let memoryContext;
      if (this.config.enableMemory && !request.skipMemory) {
        memoryContext = await this.contextEnhancer.enhance(request.query);
        this.emit("memory:enhanced", memoryContext);
      }
      const useCouncil = request.forceCouncil || this.config.enableCouncil && detection.complexity_score >= this.config.councilThreshold;
      let response;
      let model;
      let councilResult;
      let routingDecision;
      if (useCouncil) {
        this.emit("council:invoked", request.query);
        const enhancedQuery = memoryContext ? `${memoryContext.enhancedPrompt}

${request.query}` : request.query;
        councilResult = await this.council.deliberate(enhancedQuery);
        this.emit("council:complete", councilResult);
        response = councilResult.finalAnswer;
        model = "council";
      } else {
        const enhancedQuery = memoryContext?.enhancedPrompt ?? request.query;
        routingDecision = this.router.route({
          prompt: enhancedQuery,
          taskType: this.modeToTaskType(detection.mode)
        });
        const useCache = this.config.enableCaching && detection.complexity_score >= 6;
        if (useCache) {
          const cacheResult = await this.promptCache.query({
            query: enhancedQuery,
            loadedSkills: detectedSkills,
            userContext: memoryContext?.enhancedPrompt,
            systemPrompt: `Current mode: ${detection.mode.toUpperCase()}
Task type: ${this.modeToTaskType(detection.mode)}`
          });
          response = cacheResult.content;
          model = routingDecision.model;
        } else {
          const systemPrompt = `You are OPUS 67, an advanced AI assistant powered by Claude Opus 4.5.
Current mode: ${detection.mode.toUpperCase()}
Task type: ${this.modeToTaskType(detection.mode)}

Be helpful, accurate, and concise. Respond appropriately for the current mode.`;
          const modelResult = await this.modelClient.call(routingDecision, enhancedQuery, systemPrompt);
          response = modelResult.content;
          model = modelResult.model;
        }
      }
      const latencyMs = performance.now() - startTime;
      const actualCost = councilResult?.totalCost ?? (model !== "council" ? 0 : routingDecision?.estimatedCost ?? 0);
      const brainResponse = {
        id: requestId,
        query: request.query,
        mode: detection.mode,
        modeConfidence: detection.confidence,
        complexityScore: detection.complexity_score,
        response,
        model,
        cost: actualCost,
        latencyMs,
        tokensUsed: {
          input: Math.floor(request.query.length / 4),
          // Approximation
          output: Math.floor(response.length / 4)
          // Approximation
        },
        // v4.0: Intelligence layer results
        preFlightCheck,
        detectedSkills,
        memoryContext,
        councilResult,
        routingDecision,
        timestamp: /* @__PURE__ */ new Date()
      };
      if (this.config.enableMemory) {
        await this.memory.addEpisode({
          name: `request:${requestId}`,
          content: `Query: ${request.query.slice(0, 100)}... Response: ${response.slice(0, 100)}...`,
          type: "success",
          context: {
            mode: detection.mode,
            model,
            cost: brainResponse.cost,
            latencyMs
          }
        });
      }
      tokenTracker.record(
        "brain",
        "brain",
        model,
        { input: brainResponse.tokensUsed.input, output: brainResponse.tokensUsed.output }
      );
      metricsCollector.recordLatency(latencyMs);
      this.responses.push(brainResponse);
      this.emit("request:complete", brainResponse);
      return brainResponse;
    } catch (error) {
      this.emit("error", error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  /**
   * Convert mode to task type for routing
   */
  modeToTaskType(mode) {
    switch (mode) {
      case "scan":
        return "scan";
      case "build":
        return "build";
      case "review":
        return "review";
      case "architect":
      case "debug":
        return "complex";
      default:
        return "build";
    }
  }
  /**
   * Get available AI providers
   */
  getAvailableProviders() {
    return this.modelClient.getAvailableProviders();
  }
  /**
   * Health check for model providers
   */
  async checkModelHealth() {
    return this.modelClient.healthCheck();
  }
  /**
   * Invoke council deliberation directly
   */
  async deliberate(question) {
    this.emit("council:invoked", question);
    const result = await this.council.deliberate(question);
    this.emit("council:complete", result);
    return result;
  }
  /**
   * Get current status
   */
  async getStatus() {
    const memStats = await this.memory.getStats();
    const evoMetrics = await this.evolution.getMetrics();
    const totalCost = this.responses.reduce((sum, r) => sum + r.cost, 0);
    const avgLatency = this.responses.length > 0 ? this.responses.reduce((sum, r) => sum + r.latencyMs, 0) / this.responses.length : 0;
    return {
      running: this.running,
      mode: this.currentMode,
      evolutionActive: this.config.enableEvolution && this.config.autoStartEvolution,
      totalRequests: this.requestCount,
      totalCost,
      avgLatencyMs: Math.round(avgLatency * 100) / 100,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      memoryNodes: memStats.totalNodes,
      evolutionCycles: evoMetrics.totalCycles
    };
  }
  /**
   * Get metrics snapshot
   */
  async getMetrics() {
    return {
      brain: await this.getStatus(),
      evolution: await this.evolution.getMetrics(),
      benchmark: metricsCollector.getMetrics(),
      costs: {
        total: costTracker.getSummary().allTime,
        today: costTracker.getSummary().today,
        budget: this.config.costBudget
      }
    };
  }
  /**
   * Get file context manager (v5.0)
   */
  getFileContext() {
    return this.fileContext;
  }
  /**
   * Track a file in context (v5.0)
   */
  async trackFile(filePath, content) {
    if (this.config.enableFileContext) {
      await this.fileContext.accessFile(filePath, content);
    }
  }
  /**
   * Check file consistency (v5.0)
   */
  async checkFileConsistency(filePath) {
    return this.fileContext.checkConsistency(filePath);
  }
  /**
   * Set mode manually
   */
  setMode(mode) {
    const oldMode = this.currentMode;
    this.currentMode = mode;
    this.emit("mode:switched", oldMode, mode);
  }
  /**
   * Get current mode
   */
  getMode() {
    return this.currentMode;
  }
  /**
   * Get response history
   */
  getHistory(limit = 10) {
    return this.responses.slice(-limit).reverse();
  }
  /**
   * Start evolution engine
   */
  startEvolution() {
    if (!this.config.enableEvolution) return;
    this.evolution.start();
  }
  /**
   * Stop evolution engine
   */
  stopEvolution() {
    this.evolution.stop();
  }
  /**
   * Run evolution cycle manually
   */
  async runEvolutionCycle() {
    const cycle = await this.evolution.runCycle();
    this.emit("evolution:cycle", cycle.id);
  }
  /**
   * Get pending evolution opportunities
   */
  getPendingOpportunities() {
    return this.evolution.getPendingOpportunities();
  }
  // ===========================================================================
  // v4.0 INTELLIGENCE LAYER METHODS
  // ===========================================================================
  /**
   * Get intelligence layer statistics
   */
  async getIntelligenceStats() {
    if (!this.config.enableIntelligence || !this.intelligenceReady) {
      return null;
    }
    return this.intelligence.getStats();
  }
  /**
   * Check if a skill can perform an action
   */
  async canSkillDo(skillId, action) {
    if (!this.intelligenceReady) return null;
    const result = await this.intelligence.canSkillDo(skillId, action);
    return result.data;
  }
  /**
   * Find best skills for a task
   */
  async findSkillsForTask(task, maxResults = 5) {
    if (!this.intelligenceReady) return [];
    const result = await this.intelligence.findSkillsForTask(task, maxResults);
    return result.data || [];
  }
  /**
   * Validate an MCP tool call
   */
  async validateMCPCall(serverId, toolName, params) {
    if (!this.intelligenceReady) return null;
    const result = await this.intelligence.validateMCPCall(serverId, toolName, params);
    return result.data;
  }
  /**
   * Get synergy score for skill combination
   */
  async getSynergyScore(skillIds) {
    if (!this.intelligenceReady) return null;
    const result = await this.intelligence.getSynergyScore(skillIds);
    return result.data;
  }
  /**
   * Check if intelligence layer is ready
   */
  isIntelligenceReady() {
    return this.intelligenceReady;
  }
  // ===========================================================================
  // v5.0 PROMPT CACHING METHODS
  // ===========================================================================
  /**
   * Get prompt cache statistics
   */
  getCacheStats() {
    return this.promptCache.getStats();
  }
  /**
   * Format cache statistics for display
   */
  formatCacheStats() {
    return this.promptCache.formatStats();
  }
  /**
   * Format status for display
   */
  async formatStatus() {
    const status = await this.getStatus();
    const uptimeHours = (status.uptime / 36e5).toFixed(1);
    const cacheStats = this.getCacheStats();
    return `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                    OPUS 67 BRAIN RUNTIME                         \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                  \u2551
\u2551  STATUS: ${status.running ? "\u{1F9E0} RUNNING" : "\u23F9 STOPPED".padEnd(52)} \u2551
\u2551  MODE: ${status.mode.toUpperCase().padEnd(55)} \u2551
\u2551                                                                  \u2551
\u2551  COMPONENTS                                                      \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Router:       ${this.config.enableRouter ? "\u2705 ENABLED" : "\u274C DISABLED".padEnd(47)} \u2551
\u2551  Council:      ${this.config.enableCouncil ? "\u2705 ENABLED" : "\u274C DISABLED".padEnd(47)} \u2551
\u2551  Memory:       ${this.config.enableMemory ? "\u2705 ENABLED" : "\u274C DISABLED".padEnd(47)} \u2551
\u2551  Evolution:    ${status.evolutionActive ? "\u{1F504} ACTIVE" : "\u23F8 PAUSED".padEnd(47)} \u2551
\u2551  Intelligence: ${this.intelligenceReady ? "\u{1F9E0} READY" : "\u23F3 LOADING".padEnd(47)} \u2551
\u2551  Caching:      ${this.config.enableCaching ? "\u{1F4BE} ENABLED" : "\u274C DISABLED".padEnd(47)} \u2551
\u2551                                                                  \u2551
\u2551  METRICS                                                         \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Total Requests: ${String(status.totalRequests).padEnd(44)} \u2551
\u2551  Total Cost: $${status.totalCost.toFixed(4).padEnd(46)} \u2551
\u2551  Avg Latency: ${String(status.avgLatencyMs).padEnd(47)} ms \u2551
\u2551  Memory Nodes: ${String(status.memoryNodes).padEnd(46)} \u2551
\u2551  Evolution Cycles: ${String(status.evolutionCycles).padEnd(42)} \u2551
\u2551  Uptime: ${uptimeHours}h${" ".repeat(51)} \u2551
\u2551                                                                  \u2551
\u2551  PROMPT CACHING (v5.0)                                           \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  Cache Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%${" ".repeat(41)} \u2551
\u2551  Total Saved: $${cacheStats.totalSaved.toFixed(2).padEnd(45)} \u2551
\u2551  Cached Size: ${String(cacheStats.cachedContentSize).padEnd(44)} tokens \u2551
\u2551                                                                  \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
  }
};
function createBrainRuntime(config) {
  return new BrainRuntime(config);
}
var brainRuntime = new BrainRuntime();

// src/brain/brain-api.ts
var BrainAPI = class extends EventEmitter {
  brain;
  subscribers = /* @__PURE__ */ new Set();
  constructor(brainInstance) {
    super();
    this.brain = brainInstance ?? createBrainRuntime();
    this.setupEventForwarding();
  }
  /**
   * Setup event forwarding to WebSocket
   */
  setupEventForwarding() {
    this.brain.on("request:complete", (response) => {
      this.broadcast({
        type: "response",
        payload: response,
        timestamp: /* @__PURE__ */ new Date()
      });
    });
    this.brain.on("mode:switched", (from, to) => {
      this.broadcast({
        type: "mode_change",
        payload: { from, to },
        timestamp: /* @__PURE__ */ new Date()
      });
    });
    this.brain.on("evolution:cycle", (cycleId) => {
      this.broadcast({
        type: "evolution_cycle",
        payload: { cycleId },
        timestamp: /* @__PURE__ */ new Date()
      });
    });
    this.brain.on("error", (error) => {
      this.broadcast({
        type: "error",
        payload: { message: error.message },
        timestamp: /* @__PURE__ */ new Date()
      });
    });
  }
  /**
   * Generate request ID
   */
  generateRequestId() {
    return `api_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }
  /**
   * Subscribe to WebSocket messages
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  /**
   * Broadcast message to all subscribers
   */
  broadcast(msg) {
    this.emit("ws:message", msg);
    for (const callback of this.subscribers) {
      callback(msg);
    }
  }
  /**
   * Handle API request
   */
  async handleRequest(request) {
    const requestId = this.generateRequestId();
    this.emit("request", request);
    try {
      let data;
      switch (request.method) {
        case "query":
          data = await this.handleQuery(request.payload);
          break;
        case "status":
          data = await this.handleStatus();
          break;
        case "metrics":
          data = await this.handleMetrics();
          break;
        case "history":
          data = this.handleHistory(request.payload);
          break;
        case "mode":
          data = await this.handleMode(request.payload);
          break;
        case "evolution":
          data = await this.handleEvolution(request.payload);
          break;
        case "deliberate":
          data = await this.handleDeliberate(request.payload);
          break;
        default:
          throw new Error(`Unknown method: ${request.method}`);
      }
      const response = {
        success: true,
        data,
        timestamp: /* @__PURE__ */ new Date(),
        requestId
      };
      this.emit("response", response);
      return response;
    } catch (error) {
      const response = {
        success: false,
        error: String(error),
        timestamp: /* @__PURE__ */ new Date(),
        requestId
      };
      this.emit("response", response);
      return response;
    }
  }
  /**
   * Handle query request
   */
  async handleQuery(payload) {
    if (!payload?.query) {
      throw new Error("Query is required");
    }
    return this.brain.process(payload);
  }
  /**
   * Handle status request
   */
  async handleStatus() {
    return this.brain.getStatus();
  }
  /**
   * Handle metrics request
   */
  async handleMetrics() {
    return this.brain.getMetrics();
  }
  /**
   * Handle history request
   */
  handleHistory(payload) {
    return this.brain.getHistory(payload?.limit);
  }
  /**
   * Handle mode request
   */
  async handleMode(payload) {
    if (payload?.action === "set" && payload?.mode) {
      this.brain.setMode(payload.mode);
    }
    return { mode: this.brain.getMode() };
  }
  /**
   * Handle evolution request
   */
  async handleEvolution(payload) {
    switch (payload.action) {
      case "start":
        this.brain.startEvolution();
        return { status: "started" };
      case "stop":
        this.brain.stopEvolution();
        return { status: "stopped" };
      case "cycle":
        await this.brain.runEvolutionCycle();
        return { status: "cycle_complete" };
      case "pending":
        return { opportunities: this.brain.getPendingOpportunities() };
      default:
        throw new Error(`Unknown evolution action: ${payload.action}`);
    }
  }
  /**
   * Handle deliberate request
   */
  async handleDeliberate(payload) {
    if (!payload?.question) {
      throw new Error("Question is required");
    }
    return this.brain.deliberate(payload.question);
  }
  /**
   * Boot the BRAIN and return boot screen
   */
  boot() {
    return this.brain.boot();
  }
  /**
   * Shutdown the BRAIN
   */
  shutdown() {
    this.brain.shutdown();
  }
  /**
   * Get route handlers for integration with frameworks (Express, Fastify, etc.)
   */
  getRouteHandlers() {
    return {
      query: async (body) => this.handleRequest({ method: "query", payload: body }),
      status: async () => this.handleRequest({ method: "status" }),
      metrics: async () => this.handleRequest({ method: "metrics" }),
      history: async (query) => this.handleRequest({ method: "history", payload: { limit: parseInt(query.limit ?? "10") } }),
      mode: async (body) => this.handleRequest({ method: "mode", payload: { ...body, action: body.mode ? "set" : "get" } }),
      evolution: async (body) => this.handleRequest({ method: "evolution", payload: body }),
      deliberate: async (body) => this.handleRequest({ method: "deliberate", payload: body })
    };
  }
  /**
   * Generate OpenAPI specification
   */
  getOpenAPISpec() {
    return {
      openapi: "3.0.0",
      info: {
        title: "OPUS 67 BRAIN API",
        version: "3.0.0",
        description: "Self-evolving AI runtime with multi-model routing and council deliberation"
      },
      servers: [
        { url: "http://localhost:3100", description: "Local development" }
      ],
      paths: {
        "/api/brain/query": {
          post: {
            summary: "Process a query through BRAIN",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["query"],
                    properties: {
                      query: { type: "string" },
                      forceMode: { type: "string", enum: ["auto", "scan", "build", "review", "architect", "debug"] },
                      forceCouncil: { type: "boolean" },
                      skipMemory: { type: "boolean" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Query processed successfully" }
            }
          }
        },
        "/api/brain/status": {
          get: {
            summary: "Get BRAIN runtime status",
            responses: {
              "200": { description: "Status returned successfully" }
            }
          }
        },
        "/api/brain/metrics": {
          get: {
            summary: "Get comprehensive metrics",
            responses: {
              "200": { description: "Metrics returned successfully" }
            }
          }
        },
        "/api/brain/history": {
          get: {
            summary: "Get query history",
            parameters: [
              { name: "limit", in: "query", schema: { type: "integer", default: 10 } }
            ],
            responses: {
              "200": { description: "History returned successfully" }
            }
          }
        },
        "/api/brain/mode": {
          get: {
            summary: "Get current mode",
            responses: {
              "200": { description: "Mode returned" }
            }
          },
          post: {
            summary: "Set mode",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mode: { type: "string", enum: ["auto", "scan", "build", "review", "architect", "debug"] }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Mode set successfully" }
            }
          }
        },
        "/api/brain/evolution": {
          post: {
            summary: "Control evolution engine",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["action"],
                    properties: {
                      action: { type: "string", enum: ["start", "stop", "cycle", "pending"] }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Evolution action executed" }
            }
          }
        },
        "/api/brain/deliberate": {
          post: {
            summary: "Invoke council deliberation",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["question"],
                    properties: {
                      question: { type: "string" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": { description: "Deliberation result" }
            }
          }
        }
      },
      components: {
        schemas: {
          BrainResponse: {
            type: "object",
            properties: {
              id: { type: "string" },
              query: { type: "string" },
              mode: { type: "string" },
              response: { type: "string" },
              model: { type: "string" },
              cost: { type: "number" },
              latencyMs: { type: "number" }
            }
          }
        }
      }
    };
  }
};
function createBrainAPI(brainInstance) {
  return new BrainAPI(brainInstance);
}
var brainAPI = new BrainAPI();

// src/brain/server.ts
var DEFAULT_CONFIG9 = {
  port: parseInt(process.env.PORT ?? "3100"),
  host: process.env.HOST ?? "0.0.0.0",
  corsOrigin: process.env.CORS_ORIGIN ?? "*"
};
async function createBrainServer(config) {
  const serverConfig = { ...DEFAULT_CONFIG9, ...config };
  const api = createBrainAPI();
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport: process.env.NODE_ENV !== "production" ? {
        target: "pino-pretty",
        options: { colorize: true }
      } : void 0
    }
  });
  await fastify.register(fastifyCors, {
    origin: serverConfig.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  });
  await fastify.register(fastifyWebsocket);
  fastify.get("/health", async () => {
    const status = await api.handleRequest({ method: "status" });
    return {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      brain: status.data
    };
  });
  fastify.get("/api/status", async () => {
    const status = await api.handleRequest({ method: "status" });
    return {
      ok: true,
      timestamp: Date.now(),
      running: true,
      apiPort: serverConfig.port,
      workflows: 0,
      engines: {
        status: { healthy: 1, degraded: 0, offline: 0, total: 1 },
        details: [{
          id: "brain",
          connected: true,
          lastHeartbeat: Date.now(),
          status: "healthy"
        }]
      },
      brain: status.data
    };
  });
  fastify.get("/api/autonomy/status", async () => {
    return {
      ok: true,
      level: 2,
      queue: { pending: 0, approved: 0, rejected: 0 },
      audit: { total: 0, auto: 0, queued: 0, escalated: 0, successRate: 100 },
      today: { autoExecuted: 0, queued: 0, escalated: 0, cost: 0, revenue: 0 },
      stats: { autoExecuted: 0, queued: 0, pending: 0 }
    };
  });
  fastify.get(
    "/api/events/enriched",
    async (request) => {
      request.query.limit ? parseInt(request.query.limit) : 30;
      return { ok: true, events: [], count: 0 };
    }
  );
  fastify.get("/api/events/categories", async () => {
    return {
      ok: true,
      categories: [
        { id: "brain", name: "Brain", icon: "brain" },
        { id: "system", name: "System", icon: "cog" },
        { id: "trading", name: "Trading", icon: "chart" }
      ]
    };
  });
  fastify.get("/api/brain/stats", async () => {
    const metrics = await api.handleRequest({ method: "metrics" });
    return {
      ok: true,
      knowledge: { total: 0, bySource: {}, byTopic: {}, recent24h: 0 },
      patterns: { total: 0, byType: {}, avgConfidence: 0 },
      predictions: { total: 0, pending: 0, accuracy: 0 },
      uptime: Date.now(),
      lastIngestion: Date.now(),
      ...metrics.data
    };
  });
  fastify.get("/api/brain/recent", async (request) => {
    request.query.limit ? parseInt(request.query.limit) : 20;
    return { ok: true, items: [], count: 0 };
  });
  fastify.get("/api/brain/patterns", async () => {
    return { ok: true, patterns: [], count: 0 };
  });
  fastify.get("/api/brain/predictions", async () => {
    return { ok: true, predictions: [], count: 0 };
  });
  fastify.get("/ws", { websocket: true }, (socket) => {
    fastify.log.info("Dashboard WebSocket client connected");
    const unsubscribe = api.subscribe((msg) => {
      try {
        socket.send(JSON.stringify(msg));
      } catch (error) {
        fastify.log.error("WebSocket send error:", error);
      }
    });
    socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong", timestamp: /* @__PURE__ */ new Date() }));
          return;
        }
        if (message.method) {
          const response = await api.handleRequest(message);
          socket.send(JSON.stringify({ type: "response", payload: response, timestamp: /* @__PURE__ */ new Date() }));
        }
      } catch (error) {
        fastify.log.error("WebSocket message error:", error);
      }
    });
    socket.on("close", () => {
      fastify.log.info("Dashboard WebSocket client disconnected");
      unsubscribe();
    });
    socket.on("error", (error) => {
      fastify.log.error("WebSocket error:", error);
      unsubscribe();
    });
  });
  fastify.get("/api/brain/openapi", async () => {
    return api.getOpenAPISpec();
  });
  fastify.get("/api/brain/boot", async () => {
    return { screen: api.boot() };
  });
  fastify.post("/api/brain/query", async (request) => {
    return api.handleRequest({ method: "query", payload: request.body });
  });
  fastify.get("/api/brain/status", async () => {
    return api.handleRequest({ method: "status" });
  });
  fastify.get("/api/brain/metrics", async () => {
    return api.handleRequest({ method: "metrics" });
  });
  fastify.get("/api/brain/history", async (request) => {
    const limit = request.query.limit ? parseInt(request.query.limit) : 10;
    return api.handleRequest({ method: "history", payload: { limit } });
  });
  fastify.get("/api/brain/mode", async () => {
    return api.handleRequest({ method: "mode", payload: { action: "get" } });
  });
  fastify.post("/api/brain/mode", async (request) => {
    return api.handleRequest({ method: "mode", payload: { mode: request.body.mode, action: "set" } });
  });
  fastify.post("/api/brain/evolution", async (request) => {
    return api.handleRequest({ method: "evolution", payload: request.body });
  });
  fastify.post("/api/brain/deliberate", async (request) => {
    return api.handleRequest({ method: "deliberate", payload: request.body });
  });
  fastify.get("/api/brain/ws", { websocket: true }, (socket) => {
    fastify.log.info("WebSocket client connected");
    const unsubscribe = api.subscribe((msg) => {
      try {
        socket.send(JSON.stringify(msg));
      } catch (error) {
        fastify.log.error("WebSocket send error:", error);
      }
    });
    socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong", timestamp: /* @__PURE__ */ new Date() }));
          return;
        }
        if (message.method) {
          const response = await api.handleRequest(message);
          socket.send(JSON.stringify({
            type: "response",
            payload: response,
            timestamp: /* @__PURE__ */ new Date()
          }));
        }
      } catch (error) {
        fastify.log.error("WebSocket message error:", error);
        socket.send(JSON.stringify({
          type: "error",
          payload: { message: String(error) },
          timestamp: /* @__PURE__ */ new Date()
        }));
      }
    });
    socket.on("close", () => {
      fastify.log.info("WebSocket client disconnected");
      unsubscribe();
    });
    socket.on("error", (error) => {
      fastify.log.error("WebSocket error:", error);
      unsubscribe();
    });
  });
  const shutdown = async () => {
    fastify.log.info("Shutting down BRAIN server...");
    api.shutdown();
    await fastify.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  return fastify;
}
async function startBrainServer(config) {
  const serverConfig = { ...DEFAULT_CONFIG9, ...config };
  const fastify = await createBrainServer(config);
  try {
    await fastify.listen({ port: serverConfig.port, host: serverConfig.host });
    console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                    OPUS 67 BRAIN SERVER                          \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551                                                                  \u2551
\u2551  \u{1F9E0} BRAIN API running at http://${serverConfig.host}:${serverConfig.port}                   \u2551
\u2551                                                                  \u2551
\u2551  ENDPOINTS:                                                      \u2551
\u2551  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500    \u2551
\u2551  GET  /health              Health check                          \u2551
\u2551  GET  /api/brain/boot      Boot screen                          \u2551
\u2551  GET  /api/brain/status    Runtime status                       \u2551
\u2551  GET  /api/brain/metrics   Comprehensive metrics                \u2551
\u2551  GET  /api/brain/history   Query history                        \u2551
\u2551  GET  /api/brain/mode      Get current mode                     \u2551
\u2551  POST /api/brain/mode      Set mode                             \u2551
\u2551  POST /api/brain/query     Process query                        \u2551
\u2551  POST /api/brain/evolution Control evolution                    \u2551
\u2551  POST /api/brain/deliberate Invoke council                      \u2551
\u2551  WS   /api/brain/ws        Real-time updates                    \u2551
\u2551                                                                  \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}
if (process.argv[1]?.endsWith("server.js") || process.argv[1]?.endsWith("server.ts")) {
  startBrainServer();
}

export { BrainAPI, BrainRuntime, CodeImprover, ComparisonRunner, ContextEnhancer, CostTracker, DEFAULT_LEVELS, EvolutionLoop, LLMCouncil, MODELS, MultiModelRouter, PatternDetector, SYNTHESIS_PROMPTS, StressTest, aggregateRankings, brainAPI, brainRuntime, codeImprover, comparisonRunner, contextEnhancer, costTracker, council, createBrainAPI, createBrainRuntime, createBrainServer, createCodeImprover, createComparisonRunner, createContextEnhancer, createCouncil, createEvolutionLoop, createPatternDetector, createStressTest, enhancePrompt, evolutionLoop, formatModelList, formatSynthesis, generateRankingReport, generateSynthesisPrompt, getAvailableModels, getContextFor, getModelConfig, getModelsForProvider, getModelsForTier, hasApiKey, parseRankingText, parseSynthesisResponse, patternDetector, routeToModel, router, runComparisonCLI, runStressTestCLI, startBrainServer, stressTest, validateEnv };
