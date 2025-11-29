import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
} from "@gicm/agent-core";
import { BirdeyeProvider } from "./providers/birdeye.js";
import { DexScreenerProvider } from "./providers/dexscreener.js";
import type { DefiAgentConfig, DeFiAnalysis, TokenData } from "./types.js";

export class DefiAgent extends BaseAgent {
  private defiConfig: DefiAgentConfig;
  private birdeye: BirdeyeProvider | null = null;
  private dexscreener: DexScreenerProvider;

  constructor(config: AgentConfig, defiConfig: DefiAgentConfig = {}) {
    super("defi-agent", config);
    this.defiConfig = defiConfig;

    if (defiConfig.birdeyeApiKey) {
      this.birdeye = new BirdeyeProvider(defiConfig.birdeyeApiKey);
    }
    this.dexscreener = new DexScreenerProvider();
  }

  getSystemPrompt(): string {
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

  async analyze(context: AgentContext): Promise<AgentResult> {
    const tokenAddress = context.metadata?.tokenAddress as string;
    if (!tokenAddress) {
      return this.createResult(false, null, "No token address provided");
    }

    const chain = this.defiConfig.chain || "solana";
    const analysis = await this.analyzeToken(tokenAddress, chain);

    return this.createResult(
      true,
      analysis,
      undefined,
      analysis.riskScore / 10,
      analysis.recommendation
    );
  }

  async analyzeToken(
    address: string,
    chain: "solana" | "evm" = "solana"
  ): Promise<DeFiAnalysis> {
    let tokenData: TokenData | null = null;

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

    const trades = this.birdeye
      ? await this.birdeye.getTokenTrades(address, 100)
      : [];

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
      recommendation,
    };
  }

  private calculateSignals(
    token: TokenData,
    trades: Array<{ type: string }>
  ): DeFiAnalysis["signals"] {
    const buyCount = trades.filter((t) => t.type === "buy").length;
    const sellCount = trades.filter((t) => t.type === "sell").length;
    const buyRatio = trades.length > 0 ? buyCount / trades.length : 0.5;

    let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
    if (buyRatio > 0.6) sentiment = "bullish";
    else if (buyRatio < 0.4) sentiment = "bearish";

    const momentum = (buyRatio - 0.5) * 2;

    let volumeTrend: "increasing" | "decreasing" | "stable" = "stable";
    if (token.priceChange24h > 5) volumeTrend = "increasing";
    else if (token.priceChange24h < -5) volumeTrend = "decreasing";

    let liquidityHealth: "good" | "warning" | "critical" = "good";
    if (token.liquidity < 10000) liquidityHealth = "critical";
    else if (token.liquidity < 50000) liquidityHealth = "warning";

    return { sentiment, momentum, volumeTrend, liquidityHealth };
  }

  private calculateRiskScore(
    token: TokenData,
    pools: Array<{ tvl: number }>,
    signals: DeFiAnalysis["signals"]
  ): number {
    let score = 5;

    if (token.liquidity < 10000) score += 3;
    else if (token.liquidity < 50000) score += 2;
    else if (token.liquidity > 500000) score -= 1;

    if (Math.abs(token.priceChange24h) > 30) score += 2;
    else if (Math.abs(token.priceChange24h) > 15) score += 1;

    if (signals.liquidityHealth === "critical") score += 2;
    else if (signals.liquidityHealth === "warning") score += 1;

    if (pools.length === 0) score += 2;
    else if (pools.length === 1) score += 1;

    return Math.min(10, Math.max(1, score));
  }

  private generateRecommendation(
    signals: DeFiAnalysis["signals"],
    riskScore: number
  ): string {
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

  async searchToken(query: string): Promise<TokenData[]> {
    return this.dexscreener.searchTokens(query);
  }

  async getTrending(): Promise<TokenData[]> {
    return this.dexscreener.getTrendingTokens(this.defiConfig.chain || "solana");
  }
}
