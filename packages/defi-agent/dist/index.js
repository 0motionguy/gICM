// src/types.ts
import { z } from "zod";
var TokenDataSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  price: z.number(),
  priceChange24h: z.number(),
  volume24h: z.number(),
  marketCap: z.number().optional(),
  liquidity: z.number(),
  holders: z.number().optional(),
  fdv: z.number().optional()
});
var PoolDataSchema = z.object({
  address: z.string(),
  name: z.string(),
  dex: z.string(),
  token0: TokenDataSchema,
  token1: TokenDataSchema,
  tvl: z.number(),
  volume24h: z.number(),
  apy: z.number().optional(),
  fee: z.number()
});
var TradeSchema = z.object({
  hash: z.string(),
  timestamp: z.number(),
  type: z.enum(["buy", "sell"]),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amountIn: z.string(),
  amountOut: z.string(),
  priceUsd: z.number(),
  trader: z.string(),
  dex: z.string()
});
var WhaleAlertSchema = z.object({
  wallet: z.string(),
  action: z.enum(["buy", "sell", "transfer"]),
  token: z.string(),
  amount: z.string(),
  usdValue: z.number(),
  timestamp: z.number()
});

// src/providers/birdeye.ts
var BIRDEYE_BASE = "https://public-api.birdeye.so";
var BirdeyeProvider = class {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async fetch(endpoint, params) {
    const url = new URL(`${BIRDEYE_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const response = await fetch(url.toString(), {
      headers: {
        "X-API-KEY": this.apiKey,
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }
  async getTokenPrice(address) {
    try {
      const data = await this.fetch("/defi/price", { address });
      const overview = await this.fetch("/defi/token_overview", { address });
      return {
        address,
        symbol: overview.symbol,
        name: overview.name,
        decimals: overview.decimals,
        price: data.value,
        priceChange24h: data.priceChange24h,
        volume24h: overview.v24hUSD,
        marketCap: overview.mc,
        liquidity: overview.liquidity,
        holders: overview.holder
      };
    } catch (error) {
      console.error("[Birdeye] getTokenPrice failed:", error);
      return null;
    }
  }
  async getTokenTrades(address, limit = 50) {
    try {
      const data = await this.fetch("/defi/txs/token", {
        address,
        limit: limit.toString(),
        tx_type: "swap"
      });
      return data.map((tx) => ({
        hash: tx.txHash,
        timestamp: tx.blockUnixTime * 1e3,
        type: tx.side === "buy" ? "buy" : "sell",
        tokenIn: tx.side === "buy" ? tx.vsTokenAddress : tx.tokenAddress,
        tokenOut: tx.side === "buy" ? tx.tokenAddress : tx.vsTokenAddress,
        amountIn: tx.side === "buy" ? tx.vsTokenAmount : tx.tokenAmount,
        amountOut: tx.side === "buy" ? tx.tokenAmount : tx.vsTokenAmount,
        priceUsd: 0,
        trader: tx.owner,
        dex: tx.source
      }));
    } catch (error) {
      console.error("[Birdeye] getTokenTrades failed:", error);
      return [];
    }
  }
  async getTokenPools(address) {
    try {
      const data = await this.fetch("/defi/pool_list", { address });
      return data.map((pool) => ({
        address: pool.address,
        name: pool.name,
        dex: pool.source,
        token0: {},
        token1: {},
        tvl: pool.tvl,
        volume24h: pool.volume24h,
        apy: pool.apy,
        fee: pool.fee
      }));
    } catch (error) {
      console.error("[Birdeye] getTokenPools failed:", error);
      return [];
    }
  }
  async getWalletPortfolio(wallet) {
    try {
      const data = await this.fetch("/v1/wallet/token_list", { wallet });
      return data.items.map((item) => ({
        address: item.address,
        symbol: item.symbol,
        name: item.name,
        decimals: item.decimals,
        price: item.priceUsd,
        priceChange24h: 0,
        volume24h: 0,
        liquidity: 0
      }));
    } catch (error) {
      console.error("[Birdeye] getWalletPortfolio failed:", error);
      return [];
    }
  }
};

// src/providers/dexscreener.ts
var DEXSCREENER_BASE = "https://api.dexscreener.com";
var DexScreenerProvider = class {
  async getTokenPairs(address, chain = "solana") {
    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/latest/dex/tokens/${address}`
      );
      const data = await response.json();
      if (!data.pairs) return [];
      return data.pairs.filter((pair) => pair.chainId === chain).map(
        (pair) => ({
          address: pair.pairAddress,
          name: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
          dex: pair.dexId,
          token0: {
            address: pair.baseToken.address,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            decimals: 9,
            price: parseFloat(pair.priceUsd),
            priceChange24h: pair.priceChange?.h24 || 0,
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            fdv: pair.fdv
          },
          token1: {
            address: pair.quoteToken.address,
            symbol: pair.quoteToken.symbol,
            name: pair.quoteToken.name,
            decimals: 9,
            price: 0,
            priceChange24h: 0,
            volume24h: 0,
            liquidity: 0
          },
          tvl: pair.liquidity?.usd || 0,
          volume24h: pair.volume?.h24 || 0,
          fee: 0.3
        })
      );
    } catch (error) {
      console.error("[DexScreener] getTokenPairs failed:", error);
      return [];
    }
  }
  async searchTokens(query) {
    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (!data.pairs) return [];
      const seen = /* @__PURE__ */ new Set();
      return data.pairs.filter((pair) => {
        if (seen.has(pair.baseToken.address)) return false;
        seen.add(pair.baseToken.address);
        return true;
      }).slice(0, 10).map(
        (pair) => ({
          address: pair.baseToken.address,
          symbol: pair.baseToken.symbol,
          name: pair.baseToken.name,
          decimals: 9,
          price: parseFloat(pair.priceUsd),
          priceChange24h: pair.priceChange?.h24 || 0,
          volume24h: pair.volume?.h24 || 0,
          liquidity: pair.liquidity?.usd || 0,
          fdv: pair.fdv
        })
      );
    } catch (error) {
      console.error("[DexScreener] searchTokens failed:", error);
      return [];
    }
  }
  async getTrendingTokens(chain = "solana") {
    try {
      const response = await fetch(
        `${DEXSCREENER_BASE}/token-boosts/top/v1`
      );
      const data = await response.json();
      return (data || []).filter((token) => token.chainId === chain).slice(0, 20).map(
        (token) => ({
          address: token.tokenAddress,
          symbol: token.description?.slice(0, 10) || "???",
          name: token.description || "Unknown",
          decimals: 9,
          price: 0,
          priceChange24h: 0,
          volume24h: 0,
          liquidity: 0,
          boostAmount: token.amount
        })
      );
    } catch (error) {
      console.error("[DexScreener] getTrendingTokens failed:", error);
      return [];
    }
  }
};

// src/defi-agent.ts
import {
  BaseAgent
} from "@gicm/agent-core";
var DefiAgent = class extends BaseAgent {
  defiConfig;
  birdeye = null;
  dexscreener;
  constructor(config, defiConfig = {}) {
    super("defi-agent", config);
    this.defiConfig = defiConfig;
    if (defiConfig.birdeyeApiKey) {
      this.birdeye = new BirdeyeProvider(defiConfig.birdeyeApiKey);
    }
    this.dexscreener = new DexScreenerProvider();
  }
  getSystemPrompt() {
    return `You are a DeFi Analytics Agent specializing in on-chain data analysis.

CAPABILITIES:
- Token price and market data analysis
- Liquidity pool monitoring
- Whale activity tracking
- Trading signal generation
- Risk assessment

DATA SOURCES:
- Birdeye (Solana primary)
- DexScreener (multi-chain)

ANALYSIS FRAMEWORK:
1. Price & Volume Analysis
2. Liquidity Health Check
3. Whale Activity Detection
4. Sentiment Indicators
5. Risk Score Calculation

Always provide:
- Clear buy/sell/hold recommendation
- Risk score (1-10)
- Key supporting data points
- Potential red flags`;
  }
  async analyze(context) {
    const tokenAddress = context.metadata?.tokenAddress;
    if (!tokenAddress) {
      return this.createResult(false, null, "No token address provided");
    }
    const chain = this.defiConfig.chain || "solana";
    const analysis = await this.analyzeToken(tokenAddress, chain);
    return this.createResult(
      true,
      analysis,
      void 0,
      analysis.riskScore / 10,
      analysis.recommendation
    );
  }
  async analyzeToken(address, chain = "solana") {
    let tokenData = null;
    if (this.birdeye && chain === "solana") {
      tokenData = await this.birdeye.getTokenPrice(address);
    }
    const pools = await this.dexscreener.getTokenPairs(address, chain);
    if (!tokenData && pools.length > 0) {
      tokenData = pools[0].token0;
    }
    if (!tokenData) {
      throw new Error(`Token not found: ${address}`);
    }
    const trades = this.birdeye ? await this.birdeye.getTokenTrades(address, 100) : [];
    const signals = this.calculateSignals(tokenData, trades);
    const riskScore = this.calculateRiskScore(tokenData, pools, signals);
    const recommendation = this.generateRecommendation(signals, riskScore);
    return {
      token: tokenData,
      pools,
      recentTrades: trades.slice(0, 20),
      whaleActivity: [],
      signals,
      riskScore,
      recommendation
    };
  }
  calculateSignals(token, trades) {
    const buyCount = trades.filter((t) => t.type === "buy").length;
    const sellCount = trades.filter((t) => t.type === "sell").length;
    const buyRatio = trades.length > 0 ? buyCount / trades.length : 0.5;
    let sentiment = "neutral";
    if (buyRatio > 0.6) sentiment = "bullish";
    else if (buyRatio < 0.4) sentiment = "bearish";
    const momentum = (buyRatio - 0.5) * 2;
    let volumeTrend = "stable";
    if (token.priceChange24h > 5) volumeTrend = "increasing";
    else if (token.priceChange24h < -5) volumeTrend = "decreasing";
    let liquidityHealth = "good";
    if (token.liquidity < 1e4) liquidityHealth = "critical";
    else if (token.liquidity < 5e4) liquidityHealth = "warning";
    return { sentiment, momentum, volumeTrend, liquidityHealth };
  }
  calculateRiskScore(token, pools, signals) {
    let score = 5;
    if (token.liquidity < 1e4) score += 3;
    else if (token.liquidity < 5e4) score += 2;
    else if (token.liquidity > 5e5) score -= 1;
    if (Math.abs(token.priceChange24h) > 30) score += 2;
    else if (Math.abs(token.priceChange24h) > 15) score += 1;
    if (signals.liquidityHealth === "critical") score += 2;
    else if (signals.liquidityHealth === "warning") score += 1;
    if (pools.length === 0) score += 2;
    else if (pools.length === 1) score += 1;
    return Math.min(10, Math.max(1, score));
  }
  generateRecommendation(signals, riskScore) {
    if (riskScore >= 8) {
      return "HIGH RISK - Avoid trading. Low liquidity and high volatility detected.";
    }
    if (riskScore >= 6) {
      return `CAUTION - ${signals.sentiment} sentiment with elevated risk. Small position only if trading.`;
    }
    if (signals.sentiment === "bullish" && signals.liquidityHealth === "good") {
      return "FAVORABLE - Bullish signals with healthy liquidity. Consider entry with proper risk management.";
    }
    if (signals.sentiment === "bearish") {
      return "WAIT - Bearish pressure detected. Wait for reversal confirmation.";
    }
    return "NEUTRAL - Mixed signals. Monitor for clearer direction before trading.";
  }
  async searchToken(query) {
    return this.dexscreener.searchTokens(query);
  }
  async getTrending() {
    return this.dexscreener.getTrendingTokens(this.defiConfig.chain || "solana");
  }
};
export {
  BirdeyeProvider,
  DefiAgent,
  DexScreenerProvider,
  PoolDataSchema,
  TokenDataSchema,
  TradeSchema,
  WhaleAlertSchema
};
//# sourceMappingURL=index.js.map