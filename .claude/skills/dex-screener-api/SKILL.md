---
name: dex-screener-api
description: "Progressive disclosure skill: Quick reference in 32 tokens, expands to 4200 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [32, 4200]
---

# DEX Screener API

> Progressive disclosure skill: Quick reference in 32 tokens, expands to 4200 tokens

## Quick Reference (Load: 32 tokens)

DEX Screener provides real-time token prices, charts, and analytics across all Solana DEXs without requiring on-chain calls.

**Core features:**
- `Token Search` - Find tokens by address, symbol, name
- `Price Data` - Real-time OHLCV data and charts
- `Pair Info` - Liquidity, volume, price changes
- `Latest Pairs` - New token launches

**Quick start:**
```typescript
const response = await fetch("https://api.dexscreener.com/latest/dex/tokens/SOL_ADDRESS");
const data = await response.json();
```

## Core Concepts (Expand: +500 tokens)

### API Structure

DEX Screener provides REST endpoints:
- **Search endpoints** - Find tokens/pairs
- **Pair endpoints** - Detailed pair information
- **Token endpoints** - Token-specific data
- **Profile endpoints** - Token metadata and socials
- **No authentication** - Free public API

### Data Freshness

Real-time data updates:
- Price updates every 5-10 seconds
- Volume calculated over 24h/6h/1h
- Liquidity from all DEX pools
- Transaction count tracking
- Market cap calculations

### Multi-DEX Coverage

Aggregates data from all Solana DEXs:
- Raydium (AMM & CLMM)
- Orca (Standard & Whirlpools)
- Meteora
- Phoenix
- Lifinity
- Aldrin
- And more

### Rate Limiting

API limits to be aware of:
- 300 requests per minute
- Burst limit of 30 requests per 5 seconds
- No API key required
- Consider caching responses
- Use batch endpoints when possible

## Common Patterns (Expand: +900 tokens)

### Pattern 1: Token Price Lookup

Get current price and market data:

```typescript
interface TokenData {
  priceUsd: string;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
}

async function getTokenPrice(tokenAddress: string): Promise<TokenData> {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
  );

  const data = await response.json();

  if (!data.pairs || data.pairs.length === 0) {
    throw new Error("Token not found");
  }

  // Get the pair with highest liquidity
  const mainPair = data.pairs.reduce((prev, current) =>
    (prev.liquidity.usd > current.liquidity.usd) ? prev : current
  );

  return {
    priceUsd: mainPair.priceUsd,
    priceChange24h: mainPair.priceChange.h24,
    volume24h: mainPair.volume.h24,
    liquidity: mainPair.liquidity.usd,
    marketCap: mainPair.marketCap || 0,
  };
}

// Usage
const solPrice = await getTokenPrice("So11111111111111111111111111111111111111112");
console.log(`SOL Price: $${solPrice.priceUsd}`);
console.log(`24h Change: ${solPrice.priceChange24h.toFixed(2)}%`);
console.log(`24h Volume: $${solPrice.volume24h.toLocaleString()}`);
```

**Key fields:**
- `priceUsd` - Current USD price
- `priceChange` - Price changes (5m, 1h, 6h, 24h)
- `volume` - Trading volume
- `liquidity` - Total liquidity
- `txns` - Transaction counts

### Pattern 2: Monitor New Launches

Track newly created token pairs:

```typescript
interface NewPair {
  address: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  liquidity: number;
  pairCreatedAt: number;
}

async function getLatestPairs(chainId: string = "solana"): Promise<NewPair[]> {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/${chainId}`
  );

  const data = await response.json();

  return data.pairs
    .filter(pair => {
      // Filter for quality launches
      const age = Date.now() - pair.pairCreatedAt;
      const hasLiquidity = pair.liquidity.usd > 5000;
      const hasVolume = pair.volume.h24 > 1000;
      const notOld = age < 3600000; // Less than 1 hour old

      return hasLiquidity && hasVolume && notOld;
    })
    .map(pair => ({
      address: pair.pairAddress,
      baseToken: {
        address: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
      },
      priceUsd: pair.priceUsd,
      liquidity: pair.liquidity.usd,
      pairCreatedAt: pair.pairCreatedAt,
    }));
}

// Monitor for new launches
async function monitorNewLaunches() {
  const seenPairs = new Set<string>();

  setInterval(async () => {
    const latest = await getLatestPairs();

    for (const pair of latest) {
      if (!seenPairs.has(pair.address)) {
        seenPairs.add(pair.address);

        console.log("🚀 New Launch Detected!");
        console.log(`Token: ${pair.baseToken.name} (${pair.baseToken.symbol})`);
        console.log(`Address: ${pair.baseToken.address}`);
        console.log(`Price: $${pair.priceUsd}`);
        console.log(`Liquidity: $${pair.liquidity.toLocaleString()}`);
        console.log(`Age: ${Math.floor((Date.now() - pair.pairCreatedAt) / 60000)} minutes`);
        console.log("---");
      }
    }
  }, 30000); // Check every 30 seconds
}
```

### Pattern 3: Search Tokens

Search by name, symbol, or address:

```typescript
async function searchTokens(query: string) {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`
  );

  const data = await response.json();

  return data.pairs.map(pair => ({
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    address: pair.baseToken.address,
    priceUsd: pair.priceUsd,
    liquidity: pair.liquidity.usd,
    volume24h: pair.volume.h24,
    priceChange24h: pair.priceChange.h24,
    dex: pair.dexId,
    url: pair.url,
  }));
}

// Search examples
const bonkResults = await searchTokens("BONK");
const solResults = await searchTokens("SOL");
const addressResults = await searchTokens("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"); // BONK
```

### Pattern 4: Get Pair Analytics

Detailed pair information and analytics:

```typescript
interface PairAnalytics {
  address: string;
  baseToken: string;
  quoteToken: string;
  price: {
    current: string;
    native: string;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  txns: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  fdv: number;
  pairCreatedAt: number;
}

async function getPairAnalytics(pairAddress: string): Promise<PairAnalytics> {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`
  );

  const data = await response.json();
  const pair = data.pair;

  return {
    address: pair.pairAddress,
    baseToken: pair.baseToken.symbol,
    quoteToken: pair.quoteToken.symbol,
    price: {
      current: pair.priceUsd,
      native: pair.priceNative,
    },
    liquidity: {
      usd: pair.liquidity.usd,
      base: pair.liquidity.base,
      quote: pair.liquidity.quote,
    },
    volume: {
      h24: pair.volume.h24,
      h6: pair.volume.h6,
      h1: pair.volume.h1,
      m5: pair.volume.m5,
    },
    priceChange: {
      m5: pair.priceChange.m5,
      h1: pair.priceChange.h1,
      h6: pair.priceChange.h6,
      h24: pair.priceChange.h24,
    },
    txns: pair.txns,
    fdv: pair.fdv || 0,
    pairCreatedAt: pair.pairCreatedAt,
  };
}
```

## Advanced Techniques (Expand: +1200 tokens)

### Technique 1: Multi-Token Price Tracker

Efficiently track multiple tokens:

```typescript
class PriceTracker {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: number = 10000; // 10 seconds

  async getMultiplePrices(addresses: string[]) {
    const prices: Record<string, any> = {};
    const toFetch: string[] = [];

    // Check cache first
    for (const address of addresses) {
      const cached = this.cache.get(address);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        prices[address] = cached.data;
      } else {
        toFetch.push(address);
      }
    }

    // Fetch uncached tokens in batches
    if (toFetch.length > 0) {
      const batchSize = 10;
      for (let i = 0; i < toFetch.length; i += batchSize) {
        const batch = toFetch.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (address) => {
            try {
              const data = await this.fetchPrice(address);
              prices[address] = data;
              this.cache.set(address, {
                data,
                timestamp: Date.now(),
              });
            } catch (error) {
              console.error(`Failed to fetch ${address}:`, error);
              prices[address] = null;
            }
          })
        );

        // Rate limit protection
        await this.sleep(200);
      }
    }

    return prices;
  }

  private async fetchPrice(address: string) {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );

    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    const mainPair = data.pairs.reduce((prev, current) =>
      (prev.liquidity.usd > current.liquidity.usd) ? prev : current
    );

    return {
      priceUsd: parseFloat(mainPair.priceUsd),
      priceChange24h: mainPair.priceChange.h24,
      volume24h: mainPair.volume.h24,
      liquidity: mainPair.liquidity.usd,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache() {
    this.cache.clear();
  }
}

// Usage
const tracker = new PriceTracker();
const tokens = [
  "So11111111111111111111111111111111111111112", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
];

const prices = await tracker.getMultiplePrices(tokens);
console.log(prices);
```

### Technique 2: Price Alert System

Monitor tokens and trigger alerts:

```typescript
interface PriceAlert {
  tokenAddress: string;
  condition: "above" | "below";
  targetPrice: number;
  callback: (currentPrice: number) => void;
}

class PriceAlertSystem {
  private alerts: PriceAlert[] = [];
  private monitoring: boolean = false;
  private interval: NodeJS.Timeout | null = null;

  addAlert(alert: PriceAlert) {
    this.alerts.push(alert);
    console.log(`Alert added for ${alert.tokenAddress} ${alert.condition} $${alert.targetPrice}`);
  }

  removeAlert(index: number) {
    this.alerts.splice(index, 1);
  }

  async start(checkInterval: number = 15000) {
    if (this.monitoring) return;

    this.monitoring = true;
    console.log("Price alert system started");

    this.interval = setInterval(async () => {
      await this.checkAlerts();
    }, checkInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.monitoring = false;
    console.log("Price alert system stopped");
  }

  private async checkAlerts() {
    const triggeredIndices: number[] = [];

    for (let i = 0; i < this.alerts.length; i++) {
      const alert = this.alerts[i];

      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${alert.tokenAddress}`
        );
        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) continue;

        const mainPair = data.pairs[0];
        const currentPrice = parseFloat(mainPair.priceUsd);

        const triggered =
          (alert.condition === "above" && currentPrice > alert.targetPrice) ||
          (alert.condition === "below" && currentPrice < alert.targetPrice);

        if (triggered) {
          alert.callback(currentPrice);
          triggeredIndices.push(i);
        }
      } catch (error) {
        console.error(`Alert check failed for ${alert.tokenAddress}:`, error);
      }
    }

    // Remove triggered alerts (in reverse to maintain indices)
    for (let i = triggeredIndices.length - 1; i >= 0; i--) {
      this.alerts.splice(triggeredIndices[i], 1);
    }
  }
}

// Usage
const alertSystem = new PriceAlertSystem();

alertSystem.addAlert({
  tokenAddress: "So11111111111111111111111111111111111111112", // SOL
  condition: "above",
  targetPrice: 150,
  callback: (price) => {
    console.log(`🚨 SOL reached $${price}!`);
    // Send notification, execute trade, etc.
  },
});

alertSystem.addAlert({
  tokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  condition: "below",
  targetPrice: 0.00001,
  callback: (price) => {
    console.log(`🚨 BONK dropped to $${price}!`);
  },
});

await alertSystem.start();
```

### Technique 3: Token Screener

Filter and rank tokens by criteria:

```typescript
interface ScreenerCriteria {
  minLiquidity?: number;
  maxLiquidity?: number;
  minVolume24h?: number;
  minPriceChange24h?: number;
  maxPriceChange24h?: number;
  minMarketCap?: number;
  maxPairAge?: number; // in hours
}

class TokenScreener {
  async screen(criteria: ScreenerCriteria) {
    // Get latest pairs
    const response = await fetch(
      "https://api.dexscreener.com/latest/dex/pairs/solana"
    );
    const data = await response.json();

    // Apply filters
    const filtered = data.pairs.filter(pair => {
      if (criteria.minLiquidity && pair.liquidity.usd < criteria.minLiquidity) return false;
      if (criteria.maxLiquidity && pair.liquidity.usd > criteria.maxLiquidity) return false;
      if (criteria.minVolume24h && pair.volume.h24 < criteria.minVolume24h) return false;
      if (criteria.minPriceChange24h && pair.priceChange.h24 < criteria.minPriceChange24h) return false;
      if (criteria.maxPriceChange24h && pair.priceChange.h24 > criteria.maxPriceChange24h) return false;
      if (criteria.minMarketCap && (!pair.marketCap || pair.marketCap < criteria.minMarketCap)) return false;

      if (criteria.maxPairAge) {
        const ageHours = (Date.now() - pair.pairCreatedAt) / 3600000;
        if (ageHours > criteria.maxPairAge) return false;
      }

      return true;
    });

    // Sort by volume
    const sorted = filtered.sort((a, b) => b.volume.h24 - a.volume.h24);

    return sorted.map(pair => ({
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      address: pair.baseToken.address,
      priceUsd: pair.priceUsd,
      liquidity: pair.liquidity.usd,
      volume24h: pair.volume.h24,
      priceChange24h: pair.priceChange.h24,
      marketCap: pair.marketCap,
      dex: pair.dexId,
      url: pair.url,
      age: Math.floor((Date.now() - pair.pairCreatedAt) / 3600000),
    }));
  }
}

// Find trending tokens
const screener = new TokenScreener();
const trending = await screener.screen({
  minLiquidity: 50000,
  minVolume24h: 100000,
  minPriceChange24h: 10, // At least 10% gain
  maxPairAge: 24, // Less than 24 hours old
});

console.log("Trending Tokens:");
trending.slice(0, 10).forEach((token, i) => {
  console.log(`${i + 1}. ${token.symbol} - $${token.priceUsd}`);
  console.log(`   24h: +${token.priceChange24h.toFixed(2)}% | Vol: $${token.volume24h.toLocaleString()}`);
});
```

### Technique 4: Historical Data Analysis

Analyze price movements and patterns:

```typescript
class HistoricalAnalyzer {
  private priceHistory: Map<string, Array<{ price: number; timestamp: number }>> = new Map();

  async startTracking(tokenAddress: string, interval: number = 60000) {
    setInterval(async () => {
      const price = await this.getCurrentPrice(tokenAddress);

      if (!this.priceHistory.has(tokenAddress)) {
        this.priceHistory.set(tokenAddress, []);
      }

      this.priceHistory.get(tokenAddress)!.push({
        price,
        timestamp: Date.now(),
      });

      // Keep only last 24 hours
      const oneDayAgo = Date.now() - 86400000;
      this.priceHistory.set(
        tokenAddress,
        this.priceHistory.get(tokenAddress)!.filter(p => p.timestamp > oneDayAgo)
      );
    }, interval);
  }

  private async getCurrentPrice(tokenAddress: string): Promise<number> {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );
    const data = await response.json();
    return parseFloat(data.pairs[0]?.priceUsd || "0");
  }

  getStatistics(tokenAddress: string) {
    const history = this.priceHistory.get(tokenAddress);
    if (!history || history.length === 0) return null;

    const prices = history.map(h => h.price);
    const current = prices[prices.length - 1];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const average = prices.reduce((a, b) => a + b) / prices.length;
    const volatility = this.calculateVolatility(prices);

    return {
      current,
      high,
      low,
      average,
      volatility,
      changeFromHigh: ((current - high) / high) * 100,
      changeFromLow: ((current - low) / low) * 100,
      dataPoints: history.length,
    };
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;

    return Math.sqrt(variance) * 100;
  }
}
```

## Production Examples (Expand: +800 tokens)

### Example 1: Token Launch Sniper

Detect and analyze new token launches:

```typescript
class LaunchSniper {
  private seenPairs: Set<string> = new Set();
  private monitoring: boolean = false;

  async start() {
    this.monitoring = true;
    console.log("Launch sniper activated");

    while (this.monitoring) {
      try {
        await this.checkForNewLaunches();
        await this.sleep(10000); // Check every 10 seconds
      } catch (error) {
        console.error("Monitoring error:", error);
        await this.sleep(30000);
      }
    }
  }

  private async checkForNewLaunches() {
    const response = await fetch(
      "https://api.dexscreener.com/latest/dex/pairs/solana"
    );
    const data = await response.json();

    for (const pair of data.pairs) {
      if (this.seenPairs.has(pair.pairAddress)) continue;

      const age = Date.now() - pair.pairCreatedAt;
      if (age > 600000) continue; // Older than 10 minutes

      this.seenPairs.add(pair.pairAddress);

      // Analyze launch
      const analysis = await this.analyzeLaunch(pair);

      if (analysis.score > 70) {
        this.alertHighQualityLaunch(pair, analysis);
      }
    }

    // Clean old pairs from memory
    if (this.seenPairs.size > 10000) {
      this.seenPairs.clear();
    }
  }

  private async analyzeLaunch(pair: any) {
    let score = 0;

    // Liquidity score (0-30 points)
    if (pair.liquidity.usd > 100000) score += 30;
    else if (pair.liquidity.usd > 50000) score += 20;
    else if (pair.liquidity.usd > 10000) score += 10;

    // Volume score (0-30 points)
    if (pair.volume.h1 > 50000) score += 30;
    else if (pair.volume.h1 > 10000) score += 20;
    else if (pair.volume.h1 > 5000) score += 10;

    // Buy/Sell ratio (0-20 points)
    const buyRatio = pair.txns.h1.buys / (pair.txns.h1.buys + pair.txns.h1.sells);
    if (buyRatio > 0.7) score += 20;
    else if (buyRatio > 0.6) score += 10;

    // Price trend (0-20 points)
    if (pair.priceChange.h1 > 50) score += 20;
    else if (pair.priceChange.h1 > 20) score += 10;
    else if (pair.priceChange.h1 < -20) score -= 20;

    return {
      score,
      liquidity: pair.liquidity.usd,
      volume1h: pair.volume.h1,
      buyRatio,
      priceChange1h: pair.priceChange.h1,
    };
  }

  private alertHighQualityLaunch(pair: any, analysis: any) {
    console.log("\n🎯 HIGH QUALITY LAUNCH DETECTED!");
    console.log(`Token: ${pair.baseToken.name} (${pair.baseToken.symbol})`);
    console.log(`Address: ${pair.baseToken.address}`);
    console.log(`Score: ${analysis.score}/100`);
    console.log(`Price: $${pair.priceUsd}`);
    console.log(`Liquidity: $${analysis.liquidity.toLocaleString()}`);
    console.log(`1h Volume: $${analysis.volume1h.toLocaleString()}`);
    console.log(`Buy Ratio: ${(analysis.buyRatio * 100).toFixed(1)}%`);
    console.log(`1h Change: ${analysis.priceChange1h.toFixed(2)}%`);
    console.log(`URL: ${pair.url}`);
    console.log("---");

    // Here you could:
    // - Send Discord/Telegram notification
    // - Execute auto-buy
    // - Save to database
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.monitoring = false;
  }
}

// Usage
const sniper = new LaunchSniper();
await sniper.start();
```

### Example 2: Portfolio Dashboard

Real-time portfolio tracking:

```typescript
interface PortfolioToken {
  address: string;
  symbol: string;
  amount: number;
}

class PortfolioDashboard {
  private tokens: PortfolioToken[];

  constructor(tokens: PortfolioToken[]) {
    this.tokens = tokens;
  }

  async getPortfolioValue() {
    const values = await Promise.all(
      this.tokens.map(async (token) => {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${token.address}`
        );
        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
          return { ...token, priceUsd: 0, value: 0, change24h: 0 };
        }

        const pair = data.pairs[0];
        const priceUsd = parseFloat(pair.priceUsd);
        const value = priceUsd * token.amount;

        return {
          ...token,
          priceUsd,
          value,
          change24h: pair.priceChange.h24,
        };
      })
    );

    const totalValue = values.reduce((sum, t) => sum + t.value, 0);

    return {
      tokens: values,
      totalValue,
      breakdown: values.map(t => ({
        symbol: t.symbol,
        value: t.value,
        percentage: (t.value / totalValue) * 100,
        change24h: t.change24h,
      })),
    };
  }

  async startMonitoring(interval: number = 60000) {
    setInterval(async () => {
      const portfolio = await this.getPortfolioValue();

      console.clear();
      console.log("=== PORTFOLIO DASHBOARD ===");
      console.log(`Total Value: $${portfolio.totalValue.toLocaleString()}\n`);

      portfolio.breakdown
        .sort((a, b) => b.value - a.value)
        .forEach(token => {
          const changeIcon = token.change24h > 0 ? "📈" : "📉";
          console.log(`${token.symbol.padEnd(10)} $${token.value.toFixed(2).padStart(12)} (${token.percentage.toFixed(1)}%) ${changeIcon} ${token.change24h.toFixed(2)}%`);
        });

      console.log("\n" + "=".repeat(50));
    }, interval);
  }
}

// Usage
const portfolio = new PortfolioDashboard([
  { address: "So11111111111111111111111111111111111111112", symbol: "SOL", amount: 10 },
  { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", amount: 5000 },
  { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", amount: 1000000 },
]);

await portfolio.startMonitoring();
```

## Best Practices

**API Usage**
- Respect rate limits (300 req/min)
- Implement request caching
- Use batch requests when possible
- Add exponential backoff for failures
- Monitor API response times

**Data Handling**
- Validate all API responses
- Handle missing/null data gracefully
- Cache frequently accessed data
- Use the most liquid pair for price
- Check for stale data

**Performance**
- Cache responses with short TTL (5-10s)
- Batch multiple token lookups
- Use Promise.all for parallel requests
- Implement request queuing
- Monitor memory usage for long-running processes

**Reliability**
- Implement error handling
- Add retry logic
- Have fallback data sources
- Log API errors
- Set up monitoring/alerts

## Common Pitfalls

**Issue 1: Using First Pair Without Validation**
```typescript
// ❌ Wrong - first pair may not be best
const price = data.pairs[0].priceUsd;

// ✅ Correct - use highest liquidity pair
const mainPair = data.pairs.reduce((prev, curr) =>
  (prev.liquidity.usd > curr.liquidity.usd) ? prev : curr
);
const price = mainPair.priceUsd;
```

**Issue 2: Ignoring Rate Limits**
```typescript
// ❌ Wrong - will hit rate limit
for (const token of tokens) {
  await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`);
}

// ✅ Correct - batch with delays
for (let i = 0; i < tokens.length; i += 10) {
  const batch = tokens.slice(i, i + 10);
  await Promise.all(batch.map(t => fetch(`.../${t}`)));
  await sleep(200);
}
```

**Issue 3: No Error Handling**
```typescript
// ❌ Wrong - will crash on error
const data = await response.json();
const price = data.pairs[0].priceUsd;

// ✅ Correct - handle errors
try {
  const data = await response.json();
  if (!data.pairs || data.pairs.length === 0) {
    return null;
  }
  const price = data.pairs[0].priceUsd;
} catch (error) {
  console.error("Failed to fetch price:", error);
  return null;
}
```

## Resources

**Official Documentation**
- [DEX Screener API Docs](https://docs.dexscreener.com/) - Complete API reference
- [DEX Screener Website](https://dexscreener.com/) - Web interface

**API Endpoints**
- Token Search: `/latest/dex/tokens/:tokenAddresses`
- Pair Search: `/latest/dex/pairs/:chainId/:pairAddresses`
- Latest Pairs: `/latest/dex/pairs/:chainId`
- Search: `/latest/dex/search?q=:query`

**Related Skills**
- `jupiter-aggregator-integration` - Token swaps
- `helius-rpc-optimization` - RPC and webhooks
- `solana-anchor-mastery` - Smart contracts
- `solana-program-optimization` - Performance

**External Resources**
- [DEX Screener Blog](https://dexscreener.com/blog) - Updates and guides
- [DEX Screener Twitter](https://twitter.com/dexscreener) - Announcements
- [Solana Token List](https://token-list.solana.com/) - Token metadata
