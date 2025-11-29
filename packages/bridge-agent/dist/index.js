// src/bridge-agent.ts
import { z as z2 } from "zod";
import {
  BaseAgent,
  createLLMClient
} from "@gicm/agent-core";

// src/types.ts
import { z } from "zod";
var BridgeAgentConfigSchema = z.object({
  wormholeRpc: z.string().default("https://wormhole-v2-mainnet-api.certus.one"),
  layerZeroEndpoint: z.string().optional(),
  debridgeApiKey: z.string().optional()
});

// src/bridges/wormhole.ts
var WORMHOLE_CHAINS = {
  ethereum: { chainId: 2, name: "Ethereum" },
  bsc: { chainId: 4, name: "BSC" },
  polygon: { chainId: 5, name: "Polygon" },
  arbitrum: { chainId: 23, name: "Arbitrum" },
  optimism: { chainId: 24, name: "Optimism" },
  base: { chainId: 30, name: "Base" },
  avalanche: { chainId: 6, name: "Avalanche" },
  solana: { chainId: 1, name: "Solana" },
  sui: { chainId: 21, name: "Sui" },
  aptos: { chainId: 22, name: "Aptos" }
};
var WormholeProvider = class {
  name = "Wormhole";
  id = "wormhole";
  supportedChains = Object.keys(WORMHOLE_CHAINS);
  apiUrl;
  constructor(apiUrl = "https://wormhole-v2-mainnet-api.certus.one") {
    this.apiUrl = apiUrl;
  }
  async fetch(endpoint) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
  async getQuote(params) {
    const sourceChainId = WORMHOLE_CHAINS[params.sourceChain]?.chainId;
    const destChainId = WORMHOLE_CHAINS[params.destChain]?.chainId;
    if (!sourceChainId || !destChainId) {
      console.error("Unsupported chain for Wormhole");
      return null;
    }
    try {
      const quote = await this.fetch(
        `/v1/quote?srcChain=${sourceChainId}&dstChain=${destChainId}&srcToken=${params.sourceToken}&dstToken=${params.destToken}&amount=${params.amount}`
      );
      if (!quote) {
        return this.simulateQuote(params);
      }
      return {
        bridgeId: "wormhole",
        bridgeName: "Wormhole",
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        sourceToken: params.sourceToken,
        destToken: params.destToken,
        inputAmount: params.amount,
        outputAmount: quote.dstAmount,
        fee: quote.fee,
        feeUsd: quote.feeUsd,
        estimatedTime: quote.estimatedTime,
        priceImpact: 0,
        slippage: params.slippage ?? 0.5
      };
    } catch {
      return this.simulateQuote(params);
    }
  }
  simulateQuote(params) {
    const fee = "0.001";
    const feeUsd = 2.5;
    const outputAmount = (parseFloat(params.amount) * 0.997).toString();
    return {
      bridgeId: "wormhole",
      bridgeName: "Wormhole",
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      sourceToken: params.sourceToken,
      destToken: params.destToken,
      inputAmount: params.amount,
      outputAmount,
      fee,
      feeUsd,
      estimatedTime: 900,
      // 15 minutes average
      priceImpact: 0.1,
      slippage: params.slippage ?? 0.5
    };
  }
  async getTransaction(txId) {
    try {
      const tx = await this.fetch(`/v1/transaction/${txId}`);
      if (!tx) return null;
      const sourceChain = Object.entries(WORMHOLE_CHAINS).find(
        ([, config]) => config.chainId === tx.srcChainId
      )?.[0];
      const destChain = Object.entries(WORMHOLE_CHAINS).find(
        ([, config]) => config.chainId === tx.dstChainId
      )?.[0];
      return {
        id: tx.id,
        bridgeId: "wormhole",
        bridgeName: "Wormhole",
        sourceChain,
        destChain,
        sourceToken: "",
        destToken: "",
        inputAmount: "",
        status: this.mapStatus(tx.status),
        sourceTxHash: tx.srcTx,
        destTxHash: tx.dstTx,
        createdAt: new Date(tx.timestamp * 1e3),
        completedAt: tx.completedAt ? new Date(tx.completedAt * 1e3) : void 0
      };
    } catch {
      return null;
    }
  }
  mapStatus(status) {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "processing":
      case "attested":
        return "processing";
      case "completed":
      case "redeemed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "pending";
    }
  }
  async getSupportedTokens(chain) {
    const chainConfig = WORMHOLE_CHAINS[chain];
    if (!chainConfig) return [];
    try {
      const tokens = await this.fetch(
        `/v1/tokens?chainId=${chainConfig.chainId}`
      );
      if (!tokens) return [];
      return tokens.map((t) => ({
        symbol: t.symbol,
        address: t.address,
        chain,
        decimals: t.decimals,
        name: t.name,
        logoUri: t.logoURI
      }));
    } catch {
      return [];
    }
  }
};

// src/bridges/layerzero.ts
var LAYERZERO_CHAINS = {
  ethereum: { chainId: 1, endpointId: 101, name: "Ethereum" },
  bsc: { chainId: 56, endpointId: 102, name: "BSC" },
  polygon: { chainId: 137, endpointId: 109, name: "Polygon" },
  arbitrum: { chainId: 42161, endpointId: 110, name: "Arbitrum" },
  optimism: { chainId: 10, endpointId: 111, name: "Optimism" },
  base: { chainId: 8453, endpointId: 184, name: "Base" },
  avalanche: { chainId: 43114, endpointId: 106, name: "Avalanche" },
  solana: { chainId: 0, endpointId: 168, name: "Solana" },
  sui: { chainId: 0, endpointId: 0, name: "Sui" },
  // Not supported
  aptos: { chainId: 0, endpointId: 108, name: "Aptos" }
};
var LayerZeroProvider = class {
  name = "LayerZero";
  id = "layerzero";
  supportedChains = ["ethereum", "bsc", "polygon", "arbitrum", "optimism", "base", "avalanche", "aptos"];
  endpointUrl;
  constructor(endpointUrl) {
    this.endpointUrl = endpointUrl;
  }
  async getQuote(params) {
    const sourceConfig = LAYERZERO_CHAINS[params.sourceChain];
    const destConfig = LAYERZERO_CHAINS[params.destChain];
    if (!sourceConfig?.endpointId || !destConfig?.endpointId) {
      return null;
    }
    const fee = this.estimateFee(params.sourceChain, params.destChain);
    const outputAmount = (parseFloat(params.amount) * (1 - fee.percentage / 100)).toString();
    return {
      bridgeId: "layerzero",
      bridgeName: "LayerZero",
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      sourceToken: params.sourceToken,
      destToken: params.destToken,
      inputAmount: params.amount,
      outputAmount,
      fee: fee.native.toString(),
      feeUsd: fee.usd,
      estimatedTime: 120,
      // ~2 minutes (much faster than traditional bridges)
      priceImpact: 0,
      slippage: params.slippage ?? 0.5
    };
  }
  estimateFee(source, dest) {
    const baseFees = {
      "ethereum-arbitrum": 1e-3,
      "ethereum-optimism": 1e-3,
      "ethereum-base": 1e-3,
      "ethereum-polygon": 2e-3,
      "ethereum-bsc": 3e-3,
      "arbitrum-optimism": 5e-4,
      default: 2e-3
    };
    const key = `${source}-${dest}`;
    const reverseKey = `${dest}-${source}`;
    const nativeFee = baseFees[key] ?? baseFees[reverseKey] ?? baseFees.default;
    const ethPrice = 2500;
    const usdFee = nativeFee * ethPrice;
    return {
      native: nativeFee,
      usd: usdFee,
      percentage: 0.1
      // LayerZero has very low fees
    };
  }
  async getTransaction(_txId) {
    return null;
  }
  async getSupportedTokens(_chain) {
    return [];
  }
  getEndpointId(chain) {
    return LAYERZERO_CHAINS[chain]?.endpointId ?? null;
  }
};

// src/bridges/debridge.ts
var DEBRIDGE_CHAINS = {
  ethereum: { chainId: 1, name: "Ethereum" },
  bsc: { chainId: 56, name: "BSC" },
  polygon: { chainId: 137, name: "Polygon" },
  arbitrum: { chainId: 42161, name: "Arbitrum" },
  optimism: { chainId: 10, name: "Optimism" },
  base: { chainId: 8453, name: "Base" },
  avalanche: { chainId: 43114, name: "Avalanche" },
  solana: { chainId: 7565164, name: "Solana" },
  sui: { chainId: 0, name: "Sui" },
  // Not supported
  aptos: { chainId: 0, name: "Aptos" }
  // Not supported
};
var DeBridgeProvider = class {
  name = "deBridge";
  id = "debridge";
  supportedChains = ["ethereum", "bsc", "polygon", "arbitrum", "optimism", "base", "avalanche", "solana"];
  apiKey;
  baseUrl = "https://api.dln.trade/v1.0";
  constructor(config = {}) {
    this.apiKey = config.apiKey;
  }
  async fetch(endpoint, params) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
      const headers = {
        Accept: "application/json"
      };
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
  async getQuote(params) {
    const sourceChainId = DEBRIDGE_CHAINS[params.sourceChain]?.chainId;
    const destChainId = DEBRIDGE_CHAINS[params.destChain]?.chainId;
    if (!sourceChainId || !destChainId) {
      return null;
    }
    try {
      const quote = await this.fetch("/dln/order/quote", {
        srcChainId: sourceChainId.toString(),
        srcChainTokenIn: params.sourceToken,
        srcChainTokenInAmount: params.amount,
        dstChainId: destChainId.toString(),
        dstChainTokenOut: params.destToken,
        prependOperatingExpenses: "true"
      });
      if (!quote?.estimation) {
        return this.simulateQuote(params);
      }
      const feeAmount = quote.executionFee?.amount ?? "0";
      const feeUsd = parseFloat(feeAmount) * 1e-3;
      return {
        bridgeId: "debridge",
        bridgeName: "deBridge",
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        sourceToken: params.sourceToken,
        destToken: params.destToken,
        inputAmount: params.amount,
        outputAmount: quote.estimation.dstChainTokenOut.amount,
        fee: feeAmount,
        feeUsd,
        estimatedTime: quote.estimatedTime ?? 60,
        // ~1 minute
        priceImpact: quote.priceImpact ?? 0,
        slippage: quote.estimation.recommendedSlippage
      };
    } catch {
      return this.simulateQuote(params);
    }
  }
  simulateQuote(params) {
    const outputAmount = (parseFloat(params.amount) * 0.998).toString();
    return {
      bridgeId: "debridge",
      bridgeName: "deBridge",
      sourceChain: params.sourceChain,
      destChain: params.destChain,
      sourceToken: params.sourceToken,
      destToken: params.destToken,
      inputAmount: params.amount,
      outputAmount,
      fee: "0.0005",
      feeUsd: 1.25,
      estimatedTime: 60,
      priceImpact: 0.05,
      slippage: params.slippage ?? 0.5
    };
  }
  async getTransaction(orderId) {
    try {
      const tx = await this.fetch(`/dln/order/${orderId}`);
      if (!tx) return null;
      const sourceChain = Object.entries(DEBRIDGE_CHAINS).find(
        ([, config]) => config.chainId === tx.srcChainId
      )?.[0];
      const destChain = Object.entries(DEBRIDGE_CHAINS).find(
        ([, config]) => config.chainId === tx.dstChainId
      )?.[0];
      return {
        id: tx.orderId,
        bridgeId: "debridge",
        bridgeName: "deBridge",
        sourceChain,
        destChain,
        sourceToken: "",
        destToken: "",
        inputAmount: tx.giveAmount,
        outputAmount: tx.takeAmount,
        status: this.mapStatus(tx.state),
        sourceTxHash: tx.createTxHash,
        destTxHash: tx.fulfillTxHash,
        createdAt: new Date(tx.createdAt),
        completedAt: tx.fulfilledAt ? new Date(tx.fulfilledAt) : void 0,
        error: tx.errorMessage
      };
    } catch {
      return null;
    }
  }
  mapStatus(state) {
    switch (state.toLowerCase()) {
      case "created":
      case "ordercreated":
        return "pending";
      case "claiminprogress":
      case "fulfillsent":
        return "processing";
      case "fulfilled":
      case "claimunlocked":
        return "completed";
      case "cancelled":
      case "ordercancelled":
        return "failed";
      default:
        return "pending";
    }
  }
  async getSupportedTokens(chain) {
    const chainConfig = DEBRIDGE_CHAINS[chain];
    if (!chainConfig?.chainId) return [];
    try {
      const tokens = await this.fetch(
        `/token-list?chainId=${chainConfig.chainId}`
      );
      if (!tokens) return [];
      return tokens.map((t) => ({
        symbol: t.symbol,
        address: t.address,
        chain,
        decimals: t.decimals,
        name: t.name,
        logoUri: t.logoURI
      }));
    } catch {
      return [];
    }
  }
};

// src/router/pathfinder.ts
var Pathfinder = class {
  providers = /* @__PURE__ */ new Map();
  config;
  constructor(providers, config = {}) {
    for (const provider of providers) {
      this.providers.set(provider.id, provider);
    }
    this.config = {
      maxHops: config.maxHops ?? 2,
      preferredBridges: config.preferredBridges ?? [],
      excludeBridges: config.excludeBridges ?? []
    };
  }
  async findBestRoute(params) {
    const quotes = await this.getAllQuotes(params);
    if (quotes.length === 0) {
      const multiHopQuotes = await this.findMultiHopRoutes(params);
      if (multiHopQuotes.length === 0) return null;
      return this.selectBestRoute(multiHopQuotes);
    }
    return this.selectBestRoute(quotes);
  }
  async getAllQuotes(params) {
    const quotes = [];
    const providers = this.getActiveProviders();
    const quotePromises = providers.map(async (provider) => {
      if (!provider.supportedChains.includes(params.sourceChain) || !provider.supportedChains.includes(params.destChain)) {
        return null;
      }
      try {
        return await provider.getQuote(params);
      } catch {
        return null;
      }
    });
    const results = await Promise.all(quotePromises);
    for (const quote of results) {
      if (quote) quotes.push(quote);
    }
    return quotes;
  }
  getActiveProviders() {
    const excluded = new Set(this.config.excludeBridges ?? []);
    return Array.from(this.providers.values()).filter(
      (p) => !excluded.has(p.id)
    );
  }
  async findMultiHopRoutes(params) {
    if ((this.config.maxHops ?? 2) < 2) return [];
    const intermediateChains = ["ethereum", "arbitrum", "polygon"];
    const multiHopQuotes = [];
    for (const intermediate of intermediateChains) {
      if (intermediate === params.sourceChain || intermediate === params.destChain) {
        continue;
      }
      const firstHopParams = {
        ...params,
        destChain: intermediate,
        destToken: params.sourceToken
        // Assume same token for simplicity
      };
      const firstHopQuotes = await this.getAllQuotes(firstHopParams);
      if (firstHopQuotes.length === 0) continue;
      const bestFirstHop = this.selectCheapest(firstHopQuotes);
      if (!bestFirstHop) continue;
      const secondHopParams = {
        sourceChain: intermediate,
        destChain: params.destChain,
        sourceToken: bestFirstHop.destToken,
        destToken: params.destToken,
        amount: bestFirstHop.outputAmount,
        slippage: params.slippage
      };
      const secondHopQuotes = await this.getAllQuotes(secondHopParams);
      if (secondHopQuotes.length === 0) continue;
      const bestSecondHop = this.selectCheapest(secondHopQuotes);
      if (!bestSecondHop) continue;
      const combinedQuote = {
        bridgeId: `${bestFirstHop.bridgeId}+${bestSecondHop.bridgeId}`,
        bridgeName: `${bestFirstHop.bridgeName} \u2192 ${bestSecondHop.bridgeName}`,
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        sourceToken: params.sourceToken,
        destToken: params.destToken,
        inputAmount: params.amount,
        outputAmount: bestSecondHop.outputAmount,
        fee: (parseFloat(bestFirstHop.fee) + parseFloat(bestSecondHop.fee)).toString(),
        feeUsd: bestFirstHop.feeUsd + bestSecondHop.feeUsd,
        estimatedTime: bestFirstHop.estimatedTime + bestSecondHop.estimatedTime,
        priceImpact: bestFirstHop.priceImpact + bestSecondHop.priceImpact,
        slippage: Math.max(bestFirstHop.slippage, bestSecondHop.slippage)
      };
      multiHopQuotes.push(combinedQuote);
    }
    return multiHopQuotes;
  }
  selectBestRoute(quotes) {
    const cheapest = this.selectCheapest(quotes);
    const fastest = this.selectFastest(quotes);
    const bestValue = this.selectBestValue(quotes);
    const bestQuote = bestValue;
    return {
      quotes,
      bestQuote,
      comparison: {
        cheapest,
        fastest,
        bestValue
      }
    };
  }
  selectCheapest(quotes) {
    if (quotes.length === 0) return null;
    return quotes.reduce(
      (best, quote) => quote.feeUsd < best.feeUsd ? quote : best
    );
  }
  selectFastest(quotes) {
    if (quotes.length === 0) return null;
    return quotes.reduce(
      (best, quote) => quote.estimatedTime < best.estimatedTime ? quote : best
    );
  }
  selectBestValue(quotes) {
    if (quotes.length === 0) return null;
    return quotes.reduce((best, quote) => {
      const outputValue = parseFloat(quote.outputAmount);
      const feePenalty = quote.feeUsd * 0.5;
      const timePenalty = quote.estimatedTime / 3600;
      const score = outputValue - feePenalty - timePenalty;
      const bestOutput = parseFloat(best.outputAmount);
      const bestFeePenalty = best.feeUsd * 0.5;
      const bestTimePenalty = best.estimatedTime / 3600;
      const bestScore = bestOutput - bestFeePenalty - bestTimePenalty;
      return score > bestScore ? quote : best;
    });
  }
  addProvider(provider) {
    this.providers.set(provider.id, provider);
  }
  removeProvider(providerId) {
    this.providers.delete(providerId);
  }
};

// src/router/estimator.ts
var GAS_PRICES = {
  ethereum: { low: 10, avg: 25, high: 50 },
  // gwei
  bsc: { low: 3, avg: 5, high: 10 },
  polygon: { low: 30, avg: 50, high: 100 },
  arbitrum: { low: 0.01, avg: 0.1, high: 0.5 },
  optimism: { low: 1e-3, avg: 0.01, high: 0.1 },
  base: { low: 1e-3, avg: 0.01, high: 0.05 },
  avalanche: { low: 25, avg: 30, high: 50 },
  solana: { low: 5e-6, avg: 1e-5, high: 1e-4 },
  sui: { low: 1e-3, avg: 5e-3, high: 0.01 },
  aptos: { low: 1e-4, avg: 1e-3, high: 0.01 }
};
var NATIVE_PRICES = {
  ethereum: 2500,
  bsc: 300,
  polygon: 0.8,
  arbitrum: 2500,
  // ETH
  optimism: 2500,
  // ETH
  base: 2500,
  // ETH
  avalanche: 35,
  solana: 100,
  sui: 1.5,
  aptos: 10
};
var BRIDGE_TIMES = {
  wormhole: { min: 600, avg: 900, max: 1800 },
  // 10-30 min
  layerzero: { min: 60, avg: 120, max: 300 },
  // 1-5 min
  debridge: { min: 30, avg: 60, max: 120 },
  // 0.5-2 min
  default: { min: 300, avg: 600, max: 1200 }
};
var Estimator = class {
  estimateFees(quote, gasLevel = "avg") {
    const sourceGasPrice = GAS_PRICES[quote.sourceChain]?.[gasLevel] ?? 0;
    const destGasPrice = GAS_PRICES[quote.destChain]?.[gasLevel] ?? 0;
    const sourceNativePrice = NATIVE_PRICES[quote.sourceChain] ?? 0;
    const destNativePrice = NATIVE_PRICES[quote.destChain] ?? 0;
    const sourceGasUnits = this.estimateSourceGas(quote);
    const destGasUnits = this.estimateDestGas(quote);
    const gasFeeSource = sourceGasPrice * sourceGasUnits / 1e9;
    const gasFeeSourceUsd = gasFeeSource * sourceNativePrice;
    const gasFeeDest = destGasPrice * destGasUnits / 1e9;
    const gasFeeDestUsd = gasFeeDest * destNativePrice;
    const bridgeFee = parseFloat(quote.fee);
    const bridgeFeeUsd = quote.feeUsd;
    return {
      bridgeFee,
      bridgeFeeUsd,
      gasFeeSource,
      gasFeeSourceUsd,
      gasFeeDest,
      gasFeeDestUsd,
      totalFee: bridgeFee + gasFeeSource + gasFeeDest,
      totalFeeUsd: bridgeFeeUsd + gasFeeSourceUsd + gasFeeDestUsd
    };
  }
  estimateSourceGas(quote) {
    const baseGas = {
      ethereum: 15e4,
      bsc: 1e5,
      polygon: 1e5,
      arbitrum: 5e5,
      // Higher for L2
      optimism: 5e5,
      base: 5e5,
      avalanche: 1e5,
      solana: 5e3,
      // Compute units
      sui: 1e3,
      aptos: 1e3
    };
    return baseGas[quote.sourceChain] ?? 15e4;
  }
  estimateDestGas(quote) {
    const baseGas = {
      ethereum: 1e5,
      bsc: 8e4,
      polygon: 8e4,
      arbitrum: 3e5,
      optimism: 3e5,
      base: 3e5,
      avalanche: 8e4,
      solana: 5e3,
      sui: 1e3,
      aptos: 1e3
    };
    return baseGas[quote.destChain] ?? 1e5;
  }
  estimateTime(bridgeId) {
    const baseBridge = bridgeId.split("+")[0] ?? bridgeId;
    const times = BRIDGE_TIMES[baseBridge] ?? BRIDGE_TIMES.default;
    const hopCount = bridgeId.split("+").length;
    const multiplier = hopCount;
    return {
      minTime: times.min * multiplier,
      avgTime: times.avg * multiplier,
      maxTime: times.max * multiplier,
      confidence: hopCount === 1 ? 0.9 : 0.7
    };
  }
  calculateSlippageImpact(inputAmount, outputAmount, priceImpact) {
    const input = parseFloat(inputAmount);
    const output = parseFloat(outputAmount);
    const effectiveRate = output / input;
    const idealRate = 1;
    const slippageLoss = (idealRate - effectiveRate) * input;
    const slippageLossUsd = slippageLoss;
    return {
      effectiveRate,
      slippageLoss,
      slippageLossUsd
    };
  }
  compareQuotes(quotes) {
    const analyzed = quotes.map((quote) => {
      const fees = this.estimateFees(quote);
      const time = this.estimateTime(quote.bridgeId);
      const outputScore = parseFloat(quote.outputAmount) * 100;
      const feeScore = -fees.totalFeeUsd * 10;
      const timeScore = -time.avgTime / 60;
      return {
        quote,
        score: outputScore + feeScore + timeScore,
        fees,
        time
      };
    });
    analyzed.sort((a, b) => b.score - a.score);
    return { ranked: analyzed };
  }
};

// src/bridge-agent.ts
var BridgeAgent = class extends BaseAgent {
  pathfinder;
  estimator;
  bridgeConfig;
  llmClient;
  constructor(config) {
    const validatedConfig = BridgeAgentConfigSchema.parse(config);
    super("bridge-agent", config);
    this.bridgeConfig = validatedConfig;
    this.estimator = new Estimator();
    if (config.apiKey) {
      this.llmClient = createLLMClient({
        provider: config.llmProvider ?? "openai",
        model: config.llmModel,
        apiKey: config.apiKey,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4096
      });
    }
    const providers = [
      new WormholeProvider(validatedConfig.wormholeRpc),
      new LayerZeroProvider(validatedConfig.layerZeroEndpoint),
      new DeBridgeProvider({ apiKey: validatedConfig.debridgeApiKey })
    ];
    this.pathfinder = new Pathfinder(providers);
    this.initializeTools();
  }
  initializeTools() {
    this.registerTool({
      name: "get_bridge_quote",
      description: "Get quote for bridging tokens between chains",
      parameters: z2.object({
        sourceChain: z2.string().describe("Source chain (ethereum, arbitrum, etc)"),
        destChain: z2.string().describe("Destination chain"),
        sourceToken: z2.string().describe("Source token address"),
        destToken: z2.string().describe("Destination token address"),
        amount: z2.string().describe("Amount to bridge"),
        slippage: z2.number().default(0.5).describe("Max slippage percentage")
      }),
      execute: async (params) => {
        const { sourceChain, destChain, sourceToken, destToken, amount, slippage } = params;
        return this.getQuote({
          sourceChain,
          destChain,
          sourceToken,
          destToken,
          amount,
          slippage
        });
      }
    });
    this.registerTool({
      name: "find_best_route",
      description: "Find best bridge route comparing all providers",
      parameters: z2.object({
        sourceChain: z2.string().describe("Source chain"),
        destChain: z2.string().describe("Destination chain"),
        sourceToken: z2.string().describe("Source token address"),
        destToken: z2.string().describe("Destination token address"),
        amount: z2.string().describe("Amount to bridge")
      }),
      execute: async (params) => {
        const { sourceChain, destChain, sourceToken, destToken, amount } = params;
        return this.findBestRoute({
          sourceChain,
          destChain,
          sourceToken,
          destToken,
          amount
        });
      }
    });
    this.registerTool({
      name: "estimate_fees",
      description: "Estimate total fees for a bridge quote",
      parameters: z2.object({
        bridgeId: z2.string().describe("Bridge ID from quote"),
        sourceChain: z2.string().describe("Source chain"),
        destChain: z2.string().describe("Destination chain"),
        amount: z2.string().describe("Amount")
      }),
      execute: async (params) => {
        const { bridgeId, sourceChain, destChain, amount } = params;
        const quote = {
          bridgeId,
          bridgeName: bridgeId,
          sourceChain,
          destChain,
          sourceToken: "",
          destToken: "",
          inputAmount: amount,
          outputAmount: amount,
          fee: "0",
          feeUsd: 0,
          estimatedTime: 0,
          priceImpact: 0,
          slippage: 0.5
        };
        return this.estimator.estimateFees(quote);
      }
    });
    this.registerTool({
      name: "track_transaction",
      description: "Track bridge transaction status",
      parameters: z2.object({
        bridgeId: z2.string().describe("Bridge provider ID"),
        txId: z2.string().describe("Transaction or order ID")
      }),
      execute: async (params) => {
        const { bridgeId, txId } = params;
        return this.trackTransaction(bridgeId, txId);
      }
    });
    this.registerTool({
      name: "compare_bridges",
      description: "Compare all bridge options for a route",
      parameters: z2.object({
        sourceChain: z2.string().describe("Source chain"),
        destChain: z2.string().describe("Destination chain"),
        sourceToken: z2.string().describe("Source token"),
        destToken: z2.string().describe("Destination token"),
        amount: z2.string().describe("Amount")
      }),
      execute: async (params) => {
        const { sourceChain, destChain, sourceToken, destToken, amount } = params;
        return this.compareBridges({
          sourceChain,
          destChain,
          sourceToken,
          destToken,
          amount
        });
      }
    });
  }
  getSystemPrompt() {
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
  async analyze(context) {
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
        { role: "user", content: query }
      ]);
      return this.createResult(
        true,
        { aiSummary: response.content },
        void 0,
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
  async getQuote(params) {
    return this.pathfinder.getAllQuotes(params);
  }
  async findBestRoute(params) {
    return this.pathfinder.findBestRoute(params);
  }
  async compareBridges(params) {
    const quotes = await this.pathfinder.getAllQuotes(params);
    return this.estimator.compareQuotes(quotes);
  }
  async trackTransaction(bridgeId, txId) {
    const providers = {
      wormhole: () => new WormholeProvider().getTransaction(txId),
      layerzero: () => Promise.resolve(null),
      // Would need LayerZero scan
      debridge: () => new DeBridgeProvider().getTransaction(txId)
    };
    const getTransaction = providers[bridgeId];
    if (!getTransaction) return null;
    return getTransaction();
  }
  estimateFees(quote) {
    return this.estimator.estimateFees(quote);
  }
  estimateTime(bridgeId) {
    return this.estimator.estimateTime(bridgeId);
  }
  getSupportedChains() {
    return [
      "ethereum",
      "bsc",
      "polygon",
      "arbitrum",
      "optimism",
      "base",
      "avalanche",
      "solana"
    ];
  }
};
export {
  BridgeAgent,
  BridgeAgentConfigSchema,
  DeBridgeProvider,
  Estimator,
  LayerZeroProvider,
  Pathfinder,
  WormholeProvider
};
//# sourceMappingURL=index.js.map