---
name: jupiter-aggregator-integration
description: "Progressive disclosure skill: Quick reference in 36 tokens, expands to 4600 tokens"
version: 1.0.0
author: gICM Community
license: Apache-2.0
gicm:
  progressiveDisclosure: true
  tokenBudgets: [36, 4600]
---

# Jupiter Aggregator Integration

> Progressive disclosure skill: Quick reference in 36 tokens, expands to 4600 tokens

## Quick Reference (Load: 36 tokens)

Jupiter is Solana's leading swap aggregator providing best price routing across all DEXs with slippage protection and MEV resistance.

**Core features:**
- `Price API` - Best route across 20+ DEXs
- `Swap API` - Execute optimized swaps
- `Limit Orders` - DCA and limit order strategies
- `Perpetuals` - Leverage trading integration

**Quick start:**
```typescript
import { Jupiter } from "@jup-ag/core";
const jupiter = await Jupiter.load({ connection, cluster: "mainnet-beta" });
```

## Core Concepts (Expand: +550 tokens)

### Liquidity Aggregation

Jupiter routes through multiple DEXs simultaneously:
- **Raydium** - AMM and concentrated liquidity
- **Orca** - Whirlpools and standard pools
- **Meteora** - Dynamic pools
- **Phoenix** - Order book DEX
- **GooseFX** - SSL pools
- **Lifinity** - Proactive market maker
- **And 15+ more DEXs**

### Smart Order Routing

Jupiter optimizes for best execution:
- Split trades across multiple pools
- Route through intermediate tokens
- Minimize price impact
- Account for fees at each hop
- Dynamic route recalculation

### Price Impact Protection

Built-in safeguards:
- Slippage tolerance settings
- Price impact warnings
- Maximum slippage caps
- Real-time price updates
- Failed transaction rollback

### Transaction Modes

Different execution strategies:
- **Direct swap** - Single route execution
- **Versioned transactions** - Address lookup tables
- **Shared accounts** - Optimized for high volume
- **ExactIn/ExactOut** - Specify input or output amount

## Common Patterns (Expand: +950 tokens)

### Pattern 1: Basic Token Swap

Simple swap with best price routing:

```typescript
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Jupiter, RouteInfo } from "@jup-ag/core";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const wallet = Keypair.fromSecretKey(/* your key */);

async function performSwap(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  // Initialize Jupiter
  const jupiter = await Jupiter.load({
    connection,
    cluster: "mainnet-beta",
    user: wallet.publicKey,
  });

  // Get routes
  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    amount, // In smallest unit (lamports/tokens)
    slippageBps: 50, // 0.5% slippage
    forceFetch: true, // Force fresh route calculation
  });

  if (!routes.routesInfos.length) {
    throw new Error("No routes found");
  }

  // Get best route
  const bestRoute = routes.routesInfos[0];

  console.log("Best route found:");
  console.log(`Input: ${bestRoute.inAmount / 1e9}`);
  console.log(`Output: ${bestRoute.outAmount / 1e6}`);
  console.log(`Price impact: ${bestRoute.priceImpactPct}%`);
  console.log(`Market infos:`, bestRoute.marketInfos.map(m => m.label));

  // Execute swap
  const { execute } = await jupiter.exchange({
    routeInfo: bestRoute,
  });

  const swapResult = await execute();

  console.log("Swap successful!");
  console.log(`Signature: ${swapResult.txid}`);

  return swapResult;
}

// Example: Swap 1 SOL for USDC
await performSwap(
  "So11111111111111111111111111111111111111112", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  1_000_000_000 // 1 SOL
);
```

**Key parameters:**
- `slippageBps` - Basis points (50 = 0.5%)
- `forceFetch` - Bypass cache for latest prices
- `onlyDirectRoutes` - Skip intermediate tokens
- `asLegacyTransaction` - Use legacy format

### Pattern 2: Quote Comparison

Compare routes and select optimal one:

```typescript
import { Jupiter } from "@jup-ag/core";

async function getDetailedQuotes(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: "mainnet-beta",
  });

  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    amount,
    slippageBps: 50,
  });

  // Analyze all routes
  const quotes = routes.routesInfos.map((route, index) => ({
    rank: index + 1,
    inputAmount: route.inAmount,
    outputAmount: route.outAmount,
    priceImpact: route.priceImpactPct,
    marketInfos: route.marketInfos.map(m => ({
      label: m.label,
      inputMint: m.inputMint.toString(),
      outputMint: m.outputMint.toString(),
      fee: m.lpFee.pct,
    })),
    otherAmountThreshold: route.otherAmountThreshold,
    swapMode: route.swapMode,
  }));

  return {
    quotes,
    bestQuote: quotes[0],
    comparison: {
      bestOutput: quotes[0].outputAmount,
      worstOutput: quotes[quotes.length - 1].outputAmount,
      savingsVsWorst: quotes[0].outputAmount - quotes[quotes.length - 1].outputAmount,
    },
  };
}

// Get and compare quotes
const analysis = await getDetailedQuotes(
  SOL_MINT,
  USDC_MINT,
  1_000_000_000
);

console.log("Top 3 routes:");
analysis.quotes.slice(0, 3).forEach(q => {
  console.log(`${q.rank}. ${q.outputAmount} via ${q.marketInfos.map(m => m.label).join(" → ")}`);
  console.log(`   Price impact: ${q.priceImpact}%`);
});
```

### Pattern 3: Versioned Transactions with ALTs

Optimize for transaction size using address lookup tables:

```typescript
import { Jupiter } from "@jup-ag/core";
import { VersionedTransaction } from "@solana/web3.js";

async function swapWithVersionedTransaction(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: "mainnet-beta",
    user: wallet.publicKey,
  });

  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    amount,
    slippageBps: 50,
  });

  const bestRoute = routes.routesInfos[0];

  // Get versioned transaction
  const { execute, transactions } = await jupiter.exchange({
    routeInfo: bestRoute,
    userPublicKey: wallet.publicKey,
  });

  // transactions.setupTransaction - Optional setup
  // transactions.swapTransaction - Main swap
  // transactions.cleanupTransaction - Optional cleanup

  const swapTransaction = transactions.swapTransaction;

  // Sign transaction
  if (swapTransaction instanceof VersionedTransaction) {
    swapTransaction.sign([wallet]);
  } else {
    swapTransaction.partialSign(wallet);
  }

  // Send and confirm
  const signature = await connection.sendRawTransaction(
    swapTransaction.serialize(),
    {
      skipPreflight: false,
      maxRetries: 3,
    }
  );

  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}
```

**Versioned transaction benefits:**
- Smaller transaction size
- Lower fees
- More complex routes possible
- Better for multi-hop swaps

### Pattern 4: Jupiter API v6 (Latest)

Using the newest Jupiter Swap API:

```typescript
import fetch from "cross-fetch";

async function swapWithJupiterAPI(
  inputMint: string,
  outputMint: string,
  amount: number,
  userPublicKey: string
) {
  // 1. Get quote
  const quoteResponse = await fetch(
    `https://quote-api.jup.ag/v6/quote?` +
    `inputMint=${inputMint}&` +
    `outputMint=${outputMint}&` +
    `amount=${amount}&` +
    `slippageBps=50`
  );

  const quoteData = await quoteResponse.json();

  console.log("Quote:", {
    inAmount: quoteData.inAmount,
    outAmount: quoteData.outAmount,
    priceImpactPct: quoteData.priceImpactPct,
    routePlan: quoteData.routePlan,
  });

  // 2. Get swap transaction
  const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quoteData,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });

  const swapData = await swapResponse.json();

  // 3. Deserialize and send transaction
  const swapTransactionBuf = Buffer.from(swapData.swapTransaction, "base64");
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  // Sign with wallet
  transaction.sign([wallet]);

  // Send transaction
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: false }
  );

  await connection.confirmTransaction(signature, "confirmed");

  return { signature, quoteData };
}
```

## Advanced Techniques (Expand: +1300 tokens)

### Technique 1: Limit Orders with Jupiter

Set up automated limit orders:

```typescript
import { LimitOrderProvider } from "@jup-ag/limit-order-sdk";

class JupiterLimitOrders {
  private limitOrder: LimitOrderProvider;

  async initialize() {
    this.limitOrder = new LimitOrderProvider(
      connection,
      wallet.publicKey
    );
  }

  async createLimitOrder(
    inputMint: string,
    outputMint: string,
    makingAmount: number,
    takingAmount: number
  ) {
    const order = await this.limitOrder.createOrder({
      maker: wallet.publicKey,
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      inAmount: makingAmount,
      outAmount: takingAmount,
      expiredAt: null, // No expiry
    });

    // Sign and send
    order.transaction.sign([wallet]);
    const signature = await connection.sendRawTransaction(
      order.transaction.serialize()
    );

    console.log("Limit order created:", {
      orderAddress: order.orderPubkey.toString(),
      signature,
    });

    return order;
  }

  async cancelLimitOrder(orderAddress: string) {
    const tx = await this.limitOrder.cancelOrder({
      maker: wallet.publicKey,
      orderPubkey: new PublicKey(orderAddress),
    });

    tx.sign([wallet]);
    const signature = await connection.sendRawTransaction(tx.serialize());

    return signature;
  }

  async getOpenOrders() {
    const orders = await this.limitOrder.getOrders([wallet.publicKey]);

    return orders.map(order => ({
      address: order.account.toString(),
      inputMint: order.inputMint.toString(),
      outputMint: order.outputMint.toString(),
      inAmount: order.oriInAmount,
      outAmount: order.oriOutAmount,
      filledAmount: order.oriInAmount - order.inAmount,
    }));
  }
}
```

### Technique 2: DCA (Dollar Cost Averaging)

Automated DCA strategy:

```typescript
import { DCA } from "@jup-ag/dca-sdk";

class JupiterDCA {
  private dca: DCA;

  async initialize() {
    this.dca = new DCA(connection, "mainnet-beta");
  }

  async createDCAOrder(
    inputMint: string,
    outputMint: string,
    totalAmount: number,
    cycleFrequency: number, // seconds
    numberOfCycles: number
  ) {
    const inAmount = Math.floor(totalAmount / numberOfCycles);

    const tx = await this.dca.createDca({
      user: wallet.publicKey,
      inAmount: BigInt(inAmount),
      cycleFrequency: BigInt(cycleFrequency),
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      minOutAmount: null, // No minimum
      maxOutAmount: null, // No maximum
      startAt: null, // Start immediately
    });

    tx.sign([wallet]);
    const signature = await connection.sendRawTransaction(tx.serialize());

    console.log("DCA order created:", {
      totalAmount,
      amountPerCycle: inAmount,
      frequency: `Every ${cycleFrequency}s`,
      cycles: numberOfCycles,
      signature,
    });

    return signature;
  }

  async getDCAAccounts() {
    const accounts = await this.dca.getCurrentByUser(wallet.publicKey);

    return accounts.map(acc => ({
      address: acc.publicKey.toString(),
      inputMint: acc.account.inputMint.toString(),
      outputMint: acc.account.outputMint.toString(),
      inAmountPerCycle: acc.account.inAmountPerCycle.toString(),
      cycleFrequency: acc.account.cycleFrequency.toString(),
      nextCycleAt: acc.account.nextCycleAt.toString(),
    }));
  }

  async closeDCA(dcaAddress: string) {
    const tx = await this.dca.closeDca({
      user: wallet.publicKey,
      dca: new PublicKey(dcaAddress),
    });

    tx.sign([wallet]);
    return await connection.sendRawTransaction(tx.serialize());
  }
}

// Example: DCA 10 SOL into USDC over 10 days
const dcaManager = new JupiterDCA();
await dcaManager.initialize();

await dcaManager.createDCAOrder(
  SOL_MINT,
  USDC_MINT,
  10_000_000_000, // 10 SOL total
  86400, // Once per day
  10 // 10 cycles
);
```

### Technique 3: Price Monitoring and Auto-Swap

Monitor prices and auto-execute swaps:

```typescript
class PriceMonitor {
  private jupiter: Jupiter;
  private checkInterval: NodeJS.Timeout;

  async initialize() {
    this.jupiter = await Jupiter.load({
      connection,
      cluster: "mainnet-beta",
      user: wallet.publicKey,
    });
  }

  async monitorAndSwap(
    inputMint: string,
    outputMint: string,
    amount: number,
    targetPrice: number
  ) {
    console.log(`Monitoring price for ${inputMint} → ${outputMint}`);
    console.log(`Target price: ${targetPrice}`);

    this.checkInterval = setInterval(async () => {
      try {
        const currentPrice = await this.getPrice(inputMint, outputMint, amount);

        console.log(`Current price: ${currentPrice}`);

        if (currentPrice >= targetPrice) {
          console.log("Target price reached! Executing swap...");
          await this.executeSwap(inputMint, outputMint, amount);
          this.stop();
        }
      } catch (error) {
        console.error("Price check failed:", error);
      }
    }, 10000); // Check every 10 seconds
  }

  private async getPrice(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<number> {
    const routes = await this.jupiter.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount,
      slippageBps: 50,
      forceFetch: true,
    });

    if (!routes.routesInfos.length) {
      throw new Error("No routes found");
    }

    const bestRoute = routes.routesInfos[0];
    return bestRoute.outAmount / bestRoute.inAmount;
  }

  private async executeSwap(
    inputMint: string,
    outputMint: string,
    amount: number
  ) {
    const routes = await this.jupiter.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount,
      slippageBps: 50,
    });

    const { execute } = await this.jupiter.exchange({
      routeInfo: routes.routesInfos[0],
    });

    const result = await execute();
    console.log(`Swap executed: ${result.txid}`);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      console.log("Price monitoring stopped");
    }
  }
}

// Usage
const monitor = new PriceMonitor();
await monitor.initialize();

await monitor.monitorAndSwap(
  SOL_MINT,
  USDC_MINT,
  1_000_000_000, // 1 SOL
  150 // Target: 150 USDC per SOL
);
```

### Technique 4: MEV Protection

Implement strategies to minimize MEV exposure:

```typescript
async function swapWithMEVProtection(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  const jupiter = await Jupiter.load({
    connection,
    cluster: "mainnet-beta",
    user: wallet.publicKey,
  });

  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    amount,
    slippageBps: 30, // Tighter slippage
    onlyDirectRoutes: true, // Avoid multi-hop
    filterTopNResult: 3, // Check only best routes
  });

  const bestRoute = routes.routesInfos[0];

  // Check for high price impact (potential MEV target)
  if (bestRoute.priceImpactPct > 1) {
    console.warn("High price impact detected!");
    console.warn("Consider splitting the trade");

    // Split into smaller trades
    return await splitAndSwap(inputMint, outputMint, amount, 3);
  }

  // Use versioned transaction for faster execution
  const { transactions } = await jupiter.exchange({
    routeInfo: bestRoute,
    userPublicKey: wallet.publicKey,
  });

  const tx = transactions.swapTransaction;

  // Add priority fee to land faster
  tx.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 100000, // Higher priority
    })
  );

  tx.sign([wallet]);

  // Send with skipPreflight for faster submission
  const signature = await connection.sendRawTransaction(
    tx.serialize(),
    { skipPreflight: true }
  );

  return signature;
}

async function splitAndSwap(
  inputMint: string,
  outputMint: string,
  totalAmount: number,
  splits: number
) {
  const amountPerSplit = Math.floor(totalAmount / splits);
  const signatures = [];

  for (let i = 0; i < splits; i++) {
    console.log(`Executing split ${i + 1}/${splits}`);

    const sig = await swapWithMEVProtection(
      inputMint,
      outputMint,
      amountPerSplit
    );

    signatures.push(sig);

    // Wait between splits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return signatures;
}
```

## Production Examples (Expand: +1200 tokens)

### Example 1: Trading Bot with Jupiter

Automated trading bot with multiple strategies:

```typescript
import { Jupiter } from "@jup-ag/core";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

class JupiterTradingBot {
  private jupiter: Jupiter;
  private connection: Connection;
  private wallet: Keypair;
  private isRunning: boolean = false;

  constructor(rpcUrl: string, walletKey: Uint8Array) {
    this.connection = new Connection(rpcUrl);
    this.wallet = Keypair.fromSecretKey(walletKey);
  }

  async initialize() {
    this.jupiter = await Jupiter.load({
      connection: this.connection,
      cluster: "mainnet-beta",
      user: this.wallet.publicKey,
    });
  }

  async start() {
    this.isRunning = true;
    console.log("Trading bot started");

    while (this.isRunning) {
      try {
        await this.checkOpportunities();
        await this.sleep(5000); // Check every 5 seconds
      } catch (error) {
        console.error("Bot error:", error);
        await this.sleep(10000);
      }
    }
  }

  private async checkOpportunities() {
    // Example: Arbitrage between SOL/USDC and USDC/SOL
    const solToUsdc = await this.getQuote(SOL_MINT, USDC_MINT, 1_000_000_000);
    const usdcToSol = await this.getQuote(USDC_MINT, SOL_MINT, solToUsdc.outAmount);

    // Check if profitable after fees
    const profit = usdcToSol.outAmount - 1_000_000_000;
    const profitPct = (profit / 1_000_000_000) * 100;

    if (profitPct > 0.5) { // 0.5% profit threshold
      console.log(`Arbitrage opportunity found: ${profitPct.toFixed(2)}%`);
      await this.executeArbitrage(solToUsdc, usdcToSol);
    }
  }

  private async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number
  ) {
    const routes = await this.jupiter.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount,
      slippageBps: 50,
      forceFetch: true,
    });

    return routes.routesInfos[0];
  }

  private async executeArbitrage(route1: any, route2: any) {
    try {
      // Execute first swap
      const { execute: execute1 } = await this.jupiter.exchange({
        routeInfo: route1,
      });
      const result1 = await execute1();
      console.log(`Swap 1 complete: ${result1.txid}`);

      // Execute second swap
      const { execute: execute2 } = await this.jupiter.exchange({
        routeInfo: route2,
      });
      const result2 = await execute2();
      console.log(`Swap 2 complete: ${result2.txid}`);

      console.log("Arbitrage executed successfully!");
    } catch (error) {
      console.error("Arbitrage execution failed:", error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
    console.log("Trading bot stopped");
  }
}
```

### Example 2: Portfolio Rebalancer

Automated portfolio rebalancing:

```typescript
interface PortfolioTarget {
  mint: string;
  symbol: string;
  targetPct: number;
}

class PortfolioRebalancer {
  private jupiter: Jupiter;
  private targets: PortfolioTarget[];

  constructor(targets: PortfolioTarget[]) {
    this.targets = targets;
  }

  async initialize() {
    this.jupiter = await Jupiter.load({
      connection,
      cluster: "mainnet-beta",
      user: wallet.publicKey,
    });
  }

  async rebalance() {
    // Get current portfolio
    const current = await this.getCurrentPortfolio();
    const totalValue = current.reduce((sum, t) => sum + t.value, 0);

    console.log(`Total portfolio value: ${totalValue} USDC`);

    // Calculate required trades
    const trades = this.calculateRebalanceTrades(current, totalValue);

    // Execute trades
    for (const trade of trades) {
      if (trade.action === "sell") {
        await this.swap(trade.mint, USDC_MINT, trade.amount);
      }
    }

    for (const trade of trades) {
      if (trade.action === "buy") {
        await this.swap(USDC_MINT, trade.mint, trade.amount);
      }
    }

    console.log("Rebalancing complete!");
  }

  private async getCurrentPortfolio() {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map(acc => ({
      mint: acc.account.data.parsed.info.mint,
      amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
      value: 0, // Calculate from price
    }));
  }

  private calculateRebalanceTrades(current: any[], totalValue: number) {
    const trades = [];

    for (const target of this.targets) {
      const currentHolding = current.find(c => c.mint === target.mint);
      const currentPct = currentHolding ? (currentHolding.value / totalValue) * 100 : 0;
      const targetPct = target.targetPct;

      if (Math.abs(currentPct - targetPct) > 1) { // 1% threshold
        const diff = ((targetPct - currentPct) / 100) * totalValue;

        trades.push({
          mint: target.mint,
          symbol: target.symbol,
          action: diff > 0 ? "buy" : "sell",
          amount: Math.abs(diff),
        });
      }
    }

    return trades;
  }

  private async swap(inputMint: string, outputMint: string, amount: number) {
    const routes = await this.jupiter.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount,
      slippageBps: 100,
    });

    const { execute } = await this.jupiter.exchange({
      routeInfo: routes.routesInfos[0],
    });

    return await execute();
  }
}

// Usage
const rebalancer = new PortfolioRebalancer([
  { mint: SOL_MINT, symbol: "SOL", targetPct: 40 },
  { mint: USDC_MINT, symbol: "USDC", targetPct: 30 },
  { mint: BONK_MINT, symbol: "BONK", targetPct: 20 },
  { mint: JUP_MINT, symbol: "JUP", targetPct: 10 },
]);

await rebalancer.initialize();
await rebalancer.rebalance();
```

## Best Practices

**Route Selection**
- Always check multiple routes
- Compare price impact across routes
- Consider gas costs for multi-hop swaps
- Use `forceFetch` for latest prices
- Check liquidity depth before large trades

**Slippage Management**
- Start with conservative slippage (0.5%)
- Increase for volatile tokens
- Monitor price impact percentage
- Split large trades to reduce impact
- Use limit orders for better prices

**Transaction Optimization**
- Use versioned transactions when possible
- Add appropriate priority fees
- Enable `dynamicComputeUnitLimit`
- Set `wrapAndUnwrapSol: true` for convenience
- Handle transaction failures gracefully

**Security**
- Validate all quotes before execution
- Set maximum slippage limits
- Implement timeout mechanisms
- Monitor for unusual price movements
- Use separate hot wallet for trading

**Performance**
- Cache Jupiter instance
- Batch quote requests
- Use WebSocket for real-time prices
- Implement exponential backoff
- Monitor RPC rate limits

## Common Pitfalls

**Issue 1: Excessive Slippage**
```typescript
// ❌ Wrong - too much slippage
slippageBps: 1000 // 10% slippage!

// ✅ Correct - reasonable slippage
slippageBps: 50 // 0.5% slippage
```
**Solution:** Start conservative and only increase if trades fail consistently.

**Issue 2: Ignoring Price Impact**
```typescript
// ❌ Wrong - no price impact check
const route = routes.routesInfos[0];
await executeSwap(route);

// ✅ Correct - check price impact
const route = routes.routesInfos[0];
if (route.priceImpactPct > 1) {
  console.warn("High price impact!");
  // Split trade or warn user
}
```
**Solution:** Always check and handle high price impact scenarios.

**Issue 3: Not Handling Failed Swaps**
```typescript
// ❌ Wrong - no error handling
const { execute } = await jupiter.exchange({ routeInfo });
await execute();

// ✅ Correct - proper error handling
try {
  const { execute } = await jupiter.exchange({ routeInfo });
  const result = await execute();
  console.log("Success:", result.txid);
} catch (error) {
  if (error.message.includes("slippage")) {
    // Retry with higher slippage
  } else {
    // Handle other errors
  }
}
```
**Solution:** Implement comprehensive error handling with retry logic.

**Issue 4: Stale Quotes**
```typescript
// ❌ Wrong - using cached quotes
forceFetch: false

// ✅ Correct - force fresh quotes for execution
forceFetch: true
```
**Solution:** Always use `forceFetch: true` when executing swaps.

## Resources

**Official Documentation**
- [Jupiter Docs](https://docs.jup.ag/) - Complete integration guide
- [Jupiter API](https://station.jup.ag/docs/apis/swap-api) - API reference
- [Jupiter SDK](https://github.com/jup-ag/jupiter-core) - Core SDK

**API Versions**
- [Quote API v6](https://quote-api.jup.ag/v6/docs/static/index.html) - Latest API
- [Limit Order SDK](https://github.com/jup-ag/limit-order-sdk) - Limit orders
- [DCA SDK](https://github.com/jup-ag/dca-sdk) - Dollar cost averaging

**Related Skills**
- `solana-anchor-mastery` - Smart contracts
- `helius-rpc-optimization` - RPC and webhooks
- `dex-screener-api` - Price data
- `solana-program-optimization` - Performance

**External Resources**
- [Jupiter Discord](https://discord.gg/jup) - Community support
- [Jupiter Stats](https://stats.jup.ag/) - Volume and metrics
- [Example Projects](https://github.com/jup-ag/jupiter-core/tree/main/examples) - Code samples
