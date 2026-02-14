/**
 * MarketScanner — fetches active prediction markets from Polymarket and Kalshi.
 * Pure data layer, no trading logic.
 */

import type { Market, Platform, PricePoint, MarketSnapshot } from "./types.js";

const POLYMARKET_GAMMA = "https://gamma-api.polymarket.com";
const KALSHI_API = "https://trading-api.kalshi.com/trade-api/v2";

export interface ScanResult {
  markets: Market[];
  errors: string[];
  scannedAt: string;
}

export interface ScanOptions {
  platforms?: Platform[];
  minVolume?: number;
  minLiquidity?: number;
  maxMarkets?: number;
  categories?: string[];
  keywords?: string[];
}

/**
 * MarketScanner fetches and normalizes prediction markets across platforms.
 */
export class MarketScanner {
  private cache: Map<string, MarketSnapshot> = new Map();

  /**
   * Scan markets from all configured platforms.
   */
  async scan(options: ScanOptions = {}): Promise<ScanResult> {
    const platforms = options.platforms ?? ["polymarket", "kalshi"];
    const allMarkets: Market[] = [];
    const errors: string[] = [];

    for (const platform of platforms) {
      try {
        const markets =
          platform === "polymarket"
            ? await this.scanPolymarket(options)
            : await this.scanKalshi(options);
        allMarkets.push(...markets);
      } catch (err) {
        errors.push(
          `${platform}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    // Update cache
    const now = new Date().toISOString();
    for (const market of allMarkets) {
      const existing = this.cache.get(market.id);
      const priceHistory = existing?.priceHistory ?? [];
      priceHistory.push({
        timestamp: now,
        price: market.prices[0] ?? 0,
        volume: market.volume24h,
      });
      // Keep last 100 price points
      if (priceHistory.length > 100) priceHistory.shift();
      this.cache.set(market.id, { market, timestamp: now, priceHistory });
    }

    return {
      markets: allMarkets.slice(0, options.maxMarkets ?? 100),
      errors,
      scannedAt: now,
    };
  }

  /**
   * Get cached snapshot for a market.
   */
  getSnapshot(marketId: string): MarketSnapshot | undefined {
    return this.cache.get(marketId);
  }

  /**
   * Get price history for a market.
   */
  getPriceHistory(marketId: string): PricePoint[] {
    return this.cache.get(marketId)?.priceHistory ?? [];
  }

  /**
   * Get all cached markets.
   */
  getCachedMarkets(): Market[] {
    return Array.from(this.cache.values()).map((s) => s.market);
  }

  /**
   * Clear the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  private async scanPolymarket(options: ScanOptions): Promise<Market[]> {
    const minVolume = options.minVolume ?? 10000;
    const minLiquidity = options.minLiquidity ?? 5000;

    const response = await fetch(
      `${POLYMARKET_GAMMA}/markets?active=true&limit=100`,
      {
        headers: {
          "User-Agent": "gICM-PolyclawPro/1.0",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Polymarket API ${response.status}`);
    }

    const data = (await response.json()) as
      | PolymarketRaw[]
      | { markets?: PolymarketRaw[] };
    const raw: PolymarketRaw[] = Array.isArray(data)
      ? data
      : (data.markets ?? []);

    return raw
      .filter((m) => {
        if (!m.active || m.closed) return false;
        if ((m.volume ?? 0) < minVolume) return false;
        if ((m.liquidity ?? 0) < minLiquidity) return false;
        if (options.keywords?.length) {
          const text = m.question.toLowerCase();
          if (!options.keywords.some((k) => text.includes(k.toLowerCase())))
            return false;
        }
        return true;
      })
      .map((m) => this.normalizePolymarket(m))
      .sort((a, b) => b.volume24h - a.volume24h);
  }

  private async scanKalshi(options: ScanOptions): Promise<Market[]> {
    const minVolume = options.minVolume ?? 10000;

    const response = await fetch(
      `${KALSHI_API}/markets?status=open&limit=100`,
      {
        headers: {
          "User-Agent": "gICM-PolyclawPro/1.0",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Kalshi API ${response.status}`);
    }

    const data = (await response.json()) as { markets?: KalshiRaw[] };
    const raw: KalshiRaw[] = data.markets ?? [];

    return raw
      .filter((m) => {
        if (m.status !== "open") return false;
        if ((m.volume ?? 0) < minVolume) return false;
        return true;
      })
      .map((m) => this.normalizeKalshi(m))
      .sort((a, b) => b.volume24h - a.volume24h);
  }

  private normalizePolymarket(raw: PolymarketRaw): Market {
    const prices = (raw.outcomePrices ?? []).map((p) => parseFloat(p));
    return {
      id: `poly:${raw.id}`,
      platform: "polymarket",
      slug: raw.slug ?? raw.id,
      question: raw.question,
      category: raw.category ?? "other",
      outcomes: raw.outcomes ?? ["Yes", "No"],
      prices,
      volume: raw.volume ?? 0,
      volume24h: raw.volume24hr ?? 0,
      liquidity: raw.liquidity ?? 0,
      status: raw.closed ? "closed" : "active",
      endDate: raw.endDate,
      lastUpdated: new Date().toISOString(),
    };
  }

  private normalizeKalshi(raw: KalshiRaw): Market {
    const yesPrice = (raw.yes_bid ?? 0) / 100;
    const noPrice = (raw.no_bid ?? 0) / 100;
    return {
      id: `kalshi:${raw.ticker}`,
      platform: "kalshi",
      slug: raw.ticker,
      question: raw.title,
      category: raw.category ?? "other",
      outcomes: ["Yes", "No"],
      prices: [yesPrice, noPrice],
      volume: raw.volume ?? 0,
      volume24h: raw.volume_24h ?? 0,
      liquidity: raw.liquidity ?? 0,
      openInterest: raw.open_interest,
      status: raw.status === "open" ? "active" : "closed",
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Raw API response types (internal)
interface PolymarketRaw {
  id: string;
  slug?: string;
  question: string;
  category?: string;
  outcomes?: string[];
  outcomePrices?: string[];
  volume?: number;
  volume24hr?: number;
  liquidity?: number;
  active?: boolean;
  closed?: boolean;
  endDate?: string;
}

interface KalshiRaw {
  ticker: string;
  title: string;
  category?: string;
  yes_bid?: number;
  yes_ask?: number;
  no_bid?: number;
  no_ask?: number;
  volume?: number;
  volume_24h?: number;
  liquidity?: number;
  open_interest?: number;
  status?: string;
}
