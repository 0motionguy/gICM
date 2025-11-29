import { z } from "zod";
import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
  type LLMClient,
  createLLMClient,
} from "@gicm/agent-core";
import type {
  BridgeAgentConfig,
  BridgeQuote,
  BridgeRoute,
  BridgeTransaction,
  Chain,
  QuoteParams,
} from "./types.js";
import { BridgeAgentConfigSchema } from "./types.js";
import { WormholeProvider } from "./bridges/wormhole.js";
import { LayerZeroProvider } from "./bridges/layerzero.js";
import { DeBridgeProvider } from "./bridges/debridge.js";
import { Pathfinder } from "./router/pathfinder.js";
import { Estimator, type FeeEstimate, type TimeEstimate } from "./router/estimator.js";

export interface BridgeAgentAnalysis {
  route?: BridgeRoute;
  transaction?: BridgeTransaction;
  fees?: FeeEstimate;
  timeEstimate?: TimeEstimate;
  aiSummary?: string;
}

export class BridgeAgent extends BaseAgent {
  private pathfinder: Pathfinder;
  private estimator: Estimator;
  private bridgeConfig: BridgeAgentConfig;
  private llmClient?: LLMClient;

  constructor(config: BridgeAgentConfig & AgentConfig) {
    const validatedConfig = BridgeAgentConfigSchema.parse(config);
    super("bridge-agent", config);

    this.bridgeConfig = validatedConfig;
    this.estimator = new Estimator();

    // Initialize LLM client if API key provided
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096,
      });
    }

    // Initialize providers
    const providers = [
      new WormholeProvider(validatedConfig.wormholeRpc),
      new LayerZeroProvider(validatedConfig.layerZeroEndpoint),
      new DeBridgeProvider({ apiKey: validatedConfig.debridgeApiKey }),
    ];

    this.pathfinder = new Pathfinder(providers);
    this.initializeTools();
  }

  private initializeTools(): void {
    this.registerTool({
      name: "get_bridge_quote",
      description: "Get quote for bridging tokens between chains",
      parameters: z.object({
        sourceChain: z.string().describe("Source chain (ethereum, arbitrum, etc)"),
        destChain: z.string().describe("Destination chain"),
        sourceToken: z.string().describe("Source token address"),
        destToken: z.string().describe("Destination token address"),
        amount: z.string().describe("Amount to bridge"),
        slippage: z.number().default(0.5).describe("Max slippage percentage"),
      }),
      execute: async (params) => {
        const { sourceChain, destChain, sourceToken, destToken, amount, slippage } = params as {
          sourceChain: string;
          destChain: string;
          sourceToken: string;
          destToken: string;
          amount: string;
          slippage: number;
        };
        return this.getQuote({
          sourceChain: sourceChain as Chain,
          destChain: destChain as Chain,
          sourceToken,
          destToken,
          amount,
          slippage,
        });
      },
    });

    this.registerTool({
      name: "find_best_route",
      description: "Find best bridge route comparing all providers",
      parameters: z.object({
        sourceChain: z.string().describe("Source chain"),
        destChain: z.string().describe("Destination chain"),
        sourceToken: z.string().describe("Source token address"),
        destToken: z.string().describe("Destination token address"),
        amount: z.string().describe("Amount to bridge"),
      }),
      execute: async (params) => {
        const { sourceChain, destChain, sourceToken, destToken, amount } = params as {
          sourceChain: string;
          destChain: string;
          sourceToken: string;
          destToken: string;
          amount: string;
        };
        return this.findBestRoute({
          sourceChain: sourceChain as Chain,
          destChain: destChain as Chain,
          sourceToken,
          destToken,
          amount,
        });
      },
    });

    this.registerTool({
      name: "estimate_fees",
      description: "Estimate total fees for a bridge quote",
      parameters: z.object({
        bridgeId: z.string().describe("Bridge ID from quote"),
        sourceChain: z.string().describe("Source chain"),
        destChain: z.string().describe("Destination chain"),
        amount: z.string().describe("Amount"),
      }),
      execute: async (params) => {
        const { bridgeId, sourceChain, destChain, amount } = params as {
          bridgeId: string;
          sourceChain: string;
          destChain: string;
          amount: string;
        };
        const quote: BridgeQuote = {
          bridgeId,
          bridgeName: bridgeId,
          sourceChain: sourceChain as Chain,
          destChain: destChain as Chain,
          sourceToken: "",
          destToken: "",
          inputAmount: amount,
          outputAmount: amount,
          fee: "0",
          feeUsd: 0,
          estimatedTime: 0,
          priceImpact: 0,
          slippage: 0.5,
        };
        return this.estimator.estimateFees(quote);
      },
    });

    this.registerTool({
      name: "track_transaction",
      description: "Track bridge transaction status",
      parameters: z.object({
        bridgeId: z.string().describe("Bridge provider ID"),
        txId: z.string().describe("Transaction or order ID"),
      }),
      execute: async (params) => {
        const { bridgeId, txId } = params as { bridgeId: string; txId: string };
        return this.trackTransaction(bridgeId, txId);
      },
    });

    this.registerTool({
      name: "compare_bridges",
      description: "Compare all bridge options for a route",
      parameters: z.object({
        sourceChain: z.string().describe("Source chain"),
        destChain: z.string().describe("Destination chain"),
        sourceToken: z.string().describe("Source token"),
        destToken: z.string().describe("Destination token"),
        amount: z.string().describe("Amount"),
      }),
      execute: async (params) => {
        const { sourceChain, destChain, sourceToken, destToken, amount } = params as {
          sourceChain: string;
          destChain: string;
          sourceToken: string;
          destToken: string;
          amount: string;
        };
        return this.compareBridges({
          sourceChain: sourceChain as Chain,
          destChain: destChain as Chain,
          sourceToken,
          destToken,
          amount,
        });
      },
    });
  }

  getSystemPrompt(): string {
    return `You are a cross-chain bridge expert. You can:
- Find optimal bridge routes between chains
- Compare fees and speeds across bridge providers
- Track bridge transaction status
- Estimate gas fees and total costs
- Recommend the best bridge for specific needs

Supported bridges: Wormhole, LayerZero, deBridge
Supported chains: Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche, Solana

When recommending bridges, consider:
1. Total fees (bridge fee + gas on both chains)
2. Transaction speed
3. Security and reliability
4. Token support
5. Slippage and price impact`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const query = context.userQuery ?? "";

    if (!this.llmClient) {
      return this.createResult(
        false,
        null,
        "LLM client not configured. Provide apiKey in config.",
        0,
        "No LLM available for AI analysis"
      );
    }

    try {
      const response = await this.llmClient.chat([
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: query },
      ]);

      return this.createResult(
        true,
        { aiSummary: response.content },
        undefined,
        0.8,
        "AI analysis completed"
      );
    } catch (error) {
      return this.createResult(
        false,
        null,
        error instanceof Error ? error.message : "Unknown error",
        0,
        "Failed to complete AI analysis"
      );
    }
  }

  async getQuote(params: QuoteParams): Promise<BridgeQuote[]> {
    return this.pathfinder.getAllQuotes(params);
  }

  async findBestRoute(params: QuoteParams): Promise<BridgeRoute | null> {
    return this.pathfinder.findBestRoute(params);
  }

  async compareBridges(params: QuoteParams): Promise<{
    ranked: Array<{
      quote: BridgeQuote;
      score: number;
      fees: FeeEstimate;
      time: TimeEstimate;
    }>;
  }> {
    const quotes = await this.pathfinder.getAllQuotes(params);
    return this.estimator.compareQuotes(quotes);
  }

  async trackTransaction(
    bridgeId: string,
    txId: string
  ): Promise<BridgeTransaction | null> {
    // Route to appropriate provider
    const providers: Record<string, () => Promise<BridgeTransaction | null>> = {
      wormhole: () => new WormholeProvider().getTransaction(txId),
      layerzero: () => Promise.resolve(null), // Would need LayerZero scan
      debridge: () => new DeBridgeProvider().getTransaction(txId),
    };

    const getTransaction = providers[bridgeId];
    if (!getTransaction) return null;

    return getTransaction();
  }

  estimateFees(quote: BridgeQuote): FeeEstimate {
    return this.estimator.estimateFees(quote);
  }

  estimateTime(bridgeId: string): TimeEstimate {
    return this.estimator.estimateTime(bridgeId);
  }

  getSupportedChains(): Chain[] {
    return [
      "ethereum",
      "bsc",
      "polygon",
      "arbitrum",
      "optimism",
      "base",
      "avalanche",
      "solana",
    ];
  }
}
