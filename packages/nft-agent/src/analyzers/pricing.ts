import type { NFTCollection, NFTListing, RarityScore } from "../types.js";

export interface PriceEstimate {
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  confidence: number;
  factors: PriceFactor[];
}

export interface PriceFactor {
  name: string;
  impact: number; // Multiplier (1.0 = no impact)
  description: string;
}

export interface MarketAnalysis {
  floorPrice: number;
  avgListingPrice: number;
  medianListingPrice: number;
  priceRange: { min: number; max: number };
  volumeTrend: "increasing" | "decreasing" | "stable";
  listingCount: number;
}

export class PricingAnalyzer {
  analyzeMarket(
    collection: NFTCollection,
    listings: NFTListing[]
  ): MarketAnalysis {
    const prices = listings.map((l) => l.price).sort((a, b) => a - b);

    if (prices.length === 0) {
      return {
        floorPrice: collection.floorPrice ?? 0,
        avgListingPrice: 0,
        medianListingPrice: 0,
        priceRange: { min: 0, max: 0 },
        volumeTrend: "stable",
        listingCount: 0,
      };
    }

    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;
    const median = prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1]! + prices[prices.length / 2]!) / 2
      : prices[Math.floor(prices.length / 2)]!;

    return {
      floorPrice: collection.floorPrice ?? prices[0] ?? 0,
      avgListingPrice: avg,
      medianListingPrice: median,
      priceRange: { min: prices[0] ?? 0, max: prices[prices.length - 1] ?? 0 },
      volumeTrend: this.determineVolumeTrend(collection),
      listingCount: listings.length,
    };
  }

  private determineVolumeTrend(
    collection: NFTCollection
  ): "increasing" | "decreasing" | "stable" {
    // Would need historical data for real trend analysis
    // For now, return stable as default
    return "stable";
  }

  estimatePrice(
    rarity: RarityScore | null,
    market: MarketAnalysis,
    collection: NFTCollection
  ): PriceEstimate {
    const factors: PriceFactor[] = [];
    let basePrice = market.floorPrice || 0;
    let multiplier = 1.0;

    // Rarity factor
    if (rarity && collection.totalSupply > 0) {
      const rarityPercentile = (rarity.rank / collection.totalSupply) * 100;
      let rarityMultiplier = 1.0;

      if (rarityPercentile <= 1) {
        rarityMultiplier = 5.0; // Top 1%
      } else if (rarityPercentile <= 5) {
        rarityMultiplier = 3.0; // Top 5%
      } else if (rarityPercentile <= 15) {
        rarityMultiplier = 1.8; // Top 15%
      } else if (rarityPercentile <= 35) {
        rarityMultiplier = 1.3; // Top 35%
      }

      factors.push({
        name: "Rarity",
        impact: rarityMultiplier,
        description: `Rank ${rarity.rank}/${collection.totalSupply} (top ${rarityPercentile.toFixed(1)}%)`,
      });
      multiplier *= rarityMultiplier;
    }

    // Market depth factor
    if (market.listingCount > 0) {
      const listingRatio = market.listingCount / Math.max(collection.totalSupply, 1);
      let liquidityMultiplier = 1.0;

      if (listingRatio < 0.05) {
        liquidityMultiplier = 1.2; // Low supply premium
        factors.push({
          name: "Low Supply",
          impact: liquidityMultiplier,
          description: `Only ${(listingRatio * 100).toFixed(1)}% listed`,
        });
      } else if (listingRatio > 0.3) {
        liquidityMultiplier = 0.9; // High supply discount
        factors.push({
          name: "High Supply",
          impact: liquidityMultiplier,
          description: `${(listingRatio * 100).toFixed(1)}% of collection listed`,
        });
      }
      multiplier *= liquidityMultiplier;
    }

    // Volume trend factor
    if (market.volumeTrend === "increasing") {
      factors.push({
        name: "Rising Demand",
        impact: 1.1,
        description: "Volume trending upward",
      });
      multiplier *= 1.1;
    } else if (market.volumeTrend === "decreasing") {
      factors.push({
        name: "Falling Demand",
        impact: 0.9,
        description: "Volume trending downward",
      });
      multiplier *= 0.9;
    }

    const estimatedPrice = basePrice * multiplier;

    // Calculate confidence based on data availability
    let confidence = 0.5;
    if (market.listingCount >= 10) confidence += 0.2;
    if (rarity) confidence += 0.2;
    if (market.floorPrice > 0) confidence += 0.1;

    return {
      lowEstimate: estimatedPrice * 0.8,
      midEstimate: estimatedPrice,
      highEstimate: estimatedPrice * 1.5,
      confidence: Math.min(confidence, 1.0),
      factors,
    };
  }

  suggestListingPrice(
    estimate: PriceEstimate,
    strategy: "aggressive" | "moderate" | "conservative" = "moderate"
  ): number {
    switch (strategy) {
      case "aggressive":
        return estimate.highEstimate;
      case "conservative":
        return estimate.lowEstimate;
      case "moderate":
      default:
        return estimate.midEstimate;
    }
  }
}
