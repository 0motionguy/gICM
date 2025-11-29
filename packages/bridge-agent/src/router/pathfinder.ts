import type { BridgeProvider, BridgeQuote, BridgeRoute, Chain, QuoteParams } from "../types.js";

export interface PathfinderConfig {
  maxHops?: number;
  preferredBridges?: string[];
  excludeBridges?: string[];
}

export class Pathfinder {
  private providers: Map<string, BridgeProvider> = new Map();
  private config: PathfinderConfig;

  constructor(providers: BridgeProvider[], config: PathfinderConfig = {}) {
    for (const provider of providers) {
      this.providers.set(provider.id, provider);
    }
    this.config = {
      maxHops: config.maxHops ?? 2,
      preferredBridges: config.preferredBridges ?? [],
      excludeBridges: config.excludeBridges ?? [],
    };
  }

  async findBestRoute(params: QuoteParams): Promise<BridgeRoute | null> {
    const quotes = await this.getAllQuotes(params);

    if (quotes.length === 0) {
      // Try multi-hop route
      const multiHopQuotes = await this.findMultiHopRoutes(params);
      if (multiHopQuotes.length === 0) return null;
      return this.selectBestRoute(multiHopQuotes);
    }

    return this.selectBestRoute(quotes);
  }

  async getAllQuotes(params: QuoteParams): Promise<BridgeQuote[]> {
    const quotes: BridgeQuote[] = [];
    const providers = this.getActiveProviders();

    const quotePromises = providers.map(async (provider) => {
      // Check if bridge supports both chains
      if (
        !provider.supportedChains.includes(params.sourceChain) ||
        !provider.supportedChains.includes(params.destChain)
      ) {
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

  private getActiveProviders(): BridgeProvider[] {
    const excluded = new Set(this.config.excludeBridges ?? []);
    return Array.from(this.providers.values()).filter(
      (p) => !excluded.has(p.id)
    );
  }

  private async findMultiHopRoutes(params: QuoteParams): Promise<BridgeQuote[]> {
    if ((this.config.maxHops ?? 2) < 2) return [];

    // Common intermediate chains for multi-hop
    const intermediateChains: Chain[] = ["ethereum", "arbitrum", "polygon"];
    const multiHopQuotes: BridgeQuote[] = [];

    for (const intermediate of intermediateChains) {
      if (intermediate === params.sourceChain || intermediate === params.destChain) {
        continue;
      }

      // Get quotes for first hop
      const firstHopParams: QuoteParams = {
        ...params,
        destChain: intermediate,
        destToken: params.sourceToken, // Assume same token for simplicity
      };
      const firstHopQuotes = await this.getAllQuotes(firstHopParams);

      if (firstHopQuotes.length === 0) continue;

      // Get quotes for second hop using best first hop output
      const bestFirstHop = this.selectCheapest(firstHopQuotes);
      if (!bestFirstHop) continue;

      const secondHopParams: QuoteParams = {
        sourceChain: intermediate,
        destChain: params.destChain,
        sourceToken: bestFirstHop.destToken,
        destToken: params.destToken,
        amount: bestFirstHop.outputAmount,
        slippage: params.slippage,
      };
      const secondHopQuotes = await this.getAllQuotes(secondHopParams);

      if (secondHopQuotes.length === 0) continue;

      const bestSecondHop = this.selectCheapest(secondHopQuotes);
      if (!bestSecondHop) continue;

      // Create combined quote
      const combinedQuote: BridgeQuote = {
        bridgeId: `${bestFirstHop.bridgeId}+${bestSecondHop.bridgeId}`,
        bridgeName: `${bestFirstHop.bridgeName} → ${bestSecondHop.bridgeName}`,
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
        slippage: Math.max(bestFirstHop.slippage, bestSecondHop.slippage),
      };

      multiHopQuotes.push(combinedQuote);
    }

    return multiHopQuotes;
  }

  private selectBestRoute(quotes: BridgeQuote[]): BridgeRoute {
    const cheapest = this.selectCheapest(quotes)!;
    const fastest = this.selectFastest(quotes)!;
    const bestValue = this.selectBestValue(quotes)!;

    // Default best is best value
    const bestQuote = bestValue;

    return {
      quotes,
      bestQuote,
      comparison: {
        cheapest,
        fastest,
        bestValue,
      },
    };
  }

  private selectCheapest(quotes: BridgeQuote[]): BridgeQuote | null {
    if (quotes.length === 0) return null;
    return quotes.reduce((best, quote) =>
      quote.feeUsd < best.feeUsd ? quote : best
    );
  }

  private selectFastest(quotes: BridgeQuote[]): BridgeQuote | null {
    if (quotes.length === 0) return null;
    return quotes.reduce((best, quote) =>
      quote.estimatedTime < best.estimatedTime ? quote : best
    );
  }

  private selectBestValue(quotes: BridgeQuote[]): BridgeQuote | null {
    if (quotes.length === 0) return null;

    // Score = output amount - weighted fees - time penalty
    return quotes.reduce((best, quote) => {
      const outputValue = parseFloat(quote.outputAmount);
      const feePenalty = quote.feeUsd * 0.5;
      const timePenalty = quote.estimatedTime / 3600; // Hours
      const score = outputValue - feePenalty - timePenalty;

      const bestOutput = parseFloat(best.outputAmount);
      const bestFeePenalty = best.feeUsd * 0.5;
      const bestTimePenalty = best.estimatedTime / 3600;
      const bestScore = bestOutput - bestFeePenalty - bestTimePenalty;

      return score > bestScore ? quote : best;
    });
  }

  addProvider(provider: BridgeProvider): void {
    this.providers.set(provider.id, provider);
  }

  removeProvider(providerId: string): void {
    this.providers.delete(providerId);
  }
}
