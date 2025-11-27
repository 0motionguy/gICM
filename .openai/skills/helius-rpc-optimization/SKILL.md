# Helius RPC Optimization

> **Universal Skill**: Works across Claude, Gemini, and OpenAI platforms.
> Optimized for: GPT-4o / GPT-4o-mini | Also compatible with: Claude Opus, Gemini 3.0 Pro


> Progressive disclosure skill: Quick reference in 38 tokens, expands to 4800 tokens

## Quick Reference (Load: 38 tokens)

Helius provides enhanced Solana RPC endpoints with webhooks, transaction parsing, and geyser plugins for real-time blockchain data.

**Core features:**
- `Enhanced RPC` - Transaction parsing, priority fees, address lookup
- `Webhooks` - Real-time notifications for accounts, transactions, NFTs
- `DAS API` - Digital Asset Standard for NFT metadata
- `Geyser Plugin` - Low-latency account/transaction streaming

**Quick start:**
```typescript
import { Helius } from "helius-sdk";
const helius = new Helius(process.env.HELIUS_API_KEY);
```

## Core Concepts (Expand: +600 tokens)

### Enhanced RPC Endpoints

Helius enhances standard Solana RPC with:
- **Parsed transactions** - Human-readable transaction details
- **Priority fee estimates** - Dynamic fee recommendations
- **Address lookup** - Resolve address types and owners
- **Token metadata** - Enriched token information
- **NFT data** - Complete NFT metadata and ownership

### Webhook System

Real-time notifications for on-chain events:
- **Account webhooks** - Monitor balance/state changes
- **Transaction webhooks** - Track transaction events
- **NFT webhooks** - Detect mints, sales, listings
- **Token transfer webhooks** - Track SPL token movements
- **Program webhooks** - Monitor specific program calls

### Digital Asset Standard (DAS)

Unified API for digital assets:
- Query NFTs by owner, collection, creator
- Fetch complete metadata including attributes
- Track ownership history
- Search assets with filters
- Batch operations for efficiency

### Geyser Plugin Streaming

Low-latency real-time data:
- Account update streams
- Transaction notification streams
- Slot update streams
- Block metadata streams
- Custom filtering by program/account

## Common Patterns (Expand: +1000 tokens)

### Pattern 1: Enhanced Transaction Parsing

Get human-readable transaction data:

```typescript
import { Helius } from "helius-sdk";

const helius = new Helius(process.env.HELIUS_API_KEY);

async function parseTransaction(signature: string) {
  const parsed = await helius.connection.getParsedTransaction(
    signature,
    {
      maxSupportedTransactionVersion: 0,
    }
  );

  // Enhanced parsing with Helius
  const enhanced = await helius.rpc.parseTransactions([signature]);

  return {
    standard: parsed,
    enhanced: enhanced[0],
    // Enhanced includes:
    // - Native transfers
    // - Token transfers
    // - NFT events
    // - Program interactions
    // - Fee information
  };
}

// Get transaction history for address
async function getTransactionHistory(address: string, limit = 100) {
  const signatures = await helius.rpc.getSignaturesForAddress(
    address,
    { limit }
  );

  const parsed = await helius.rpc.parseTransactions(
    signatures.map(s => s.signature)
  );

  return parsed.map(tx => ({
    signature: tx.signature,
    timestamp: tx.timestamp,
    type: tx.type,
    source: tx.source,
    fee: tx.fee,
    nativeTransfers: tx.nativeTransfers,
    tokenTransfers: tx.tokenTransfers,
    events: tx.events,
  }));
}
```

**Key benefits:**
- No manual instruction parsing
- Standardized event format
- Token metadata included
- Human-readable descriptions

### Pattern 2: Webhook Setup

Real-time transaction monitoring:

```typescript
import { Helius, WebhookType } from "helius-sdk";

const helius = new Helius(process.env.HELIUS_API_KEY);

// Create webhook for account monitoring
async function createAccountWebhook(
  walletAddress: string,
  webhookUrl: string
) {
  const webhook = await helius.createWebhook({
    webhookURL: webhookUrl,
    transactionTypes: [WebhookType.ANY],
    accountAddresses: [walletAddress],
    webhookType: "enhanced",
  });

  console.log(`Webhook created: ${webhook.webhookID}`);
  return webhook;
}

// Create webhook for NFT events
async function createNFTWebhook(
  collectionAddress: string,
  webhookUrl: string
) {
  const webhook = await helius.createWebhook({
    webhookURL: webhookUrl,
    transactionTypes: [
      WebhookType.NFT_MINT,
      WebhookType.NFT_SALE,
      WebhookType.NFT_LISTING,
    ],
    accountAddresses: [collectionAddress],
    webhookType: "enhanced",
  });

  return webhook;
}

// Webhook handler (Express example)
import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook/helius", async (req, res) => {
  const events = req.body;

  for (const event of events) {
    console.log("Transaction:", event.signature);
    console.log("Type:", event.type);
    console.log("Source:", event.source);

    // Handle specific event types
    if (event.nativeTransfers?.length > 0) {
      handleNativeTransfers(event.nativeTransfers);
    }

    if (event.tokenTransfers?.length > 0) {
      handleTokenTransfers(event.tokenTransfers);
    }

    if (event.events?.nft) {
      handleNFTEvents(event.events.nft);
    }
  }

  res.sendStatus(200);
});
```

**Webhook types:**
- `enhanced` - Full transaction details
- `raw` - Raw transaction data
- `discord` - Discord-formatted messages

### Pattern 3: DAS API for NFT Queries

Efficient NFT data fetching:

```typescript
import { Helius } from "helius-sdk";

const helius = new Helius(process.env.HELIUS_API_KEY);

// Get all NFTs owned by wallet
async function getNFTsByOwner(ownerAddress: string) {
  const response = await helius.rpc.getAssetsByOwner({
    ownerAddress,
    page: 1,
    limit: 1000,
  });

  return response.items.map(asset => ({
    id: asset.id,
    name: asset.content?.metadata?.name,
    image: asset.content?.links?.image,
    collection: asset.grouping?.find(g => g.group_key === "collection")?.group_value,
    attributes: asset.content?.metadata?.attributes,
  }));
}

// Get NFTs by collection
async function getNFTsByCollection(collectionAddress: string) {
  const response = await helius.rpc.getAssetsByGroup({
    groupKey: "collection",
    groupValue: collectionAddress,
    page: 1,
    limit: 1000,
  });

  return response.items;
}

// Search assets with filters
async function searchAssets(params: {
  creator?: string;
  ownerAddress?: string;
  burnt?: boolean;
  compressedAssets?: boolean;
}) {
  const response = await helius.rpc.searchAssets({
    ...params,
    page: 1,
    limit: 1000,
  });

  return response.items;
}

// Get single asset details
async function getAssetDetails(assetId: string) {
  const asset = await helius.rpc.getAsset({
    id: assetId,
  });

  return {
    id: asset.id,
    owner: asset.ownership.owner,
    delegate: asset.ownership.delegate,
    frozen: asset.ownership.frozen,
    metadata: asset.content?.metadata,
    compression: asset.compression,
    grouping: asset.grouping,
    royalty: asset.royalty,
  };
}
```

**DAS advantages:**
- Single API for all NFT types
- Compressed NFT support
- Batch operations
- Pagination built-in
- No on-chain calls needed

### Pattern 4: Priority Fee Estimation

Dynamic fee optimization:

```typescript
import { Helius } from "helius-sdk";
import { Connection, Transaction } from "@solana/web3.js";

const helius = new Helius(process.env.HELIUS_API_KEY);

// Get recommended priority fees
async function getPriorityFeeEstimate() {
  const estimate = await helius.rpc.getPriorityFeeEstimate({
    accountKeys: ["11111111111111111111111111111111"], // System program
    options: {
      includeAllPriorityFeeLevels: true,
    },
  });

  return {
    min: estimate.priorityFeeLevels.min,
    low: estimate.priorityFeeLevels.low,
    medium: estimate.priorityFeeLevels.medium,
    high: estimate.priorityFeeLevels.high,
    veryHigh: estimate.priorityFeeLevels.veryHigh,
    recommended: estimate.priorityFeeEstimate,
  };
}

// Add priority fee to transaction
async function addPriorityFee(
  transaction: Transaction,
  level: "medium" | "high" | "veryHigh" = "medium"
) {
  const fees = await getPriorityFeeEstimate();
  const priorityFee = fees[level];

  // Add compute budget instructions
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    })
  );

  return transaction;
}
```

## Advanced Techniques (Expand: +1400 tokens)

### Technique 1: Geyser Plugin WebSocket Streaming

Real-time account monitoring with minimal latency:

```typescript
import WebSocket from "ws";

interface GeyserConfig {
  apiKey: string;
  accountKeys?: string[];
  programIds?: string[];
}

class GeyserStream {
  private ws: WebSocket;
  private config: GeyserConfig;

  constructor(config: GeyserConfig) {
    this.config = config;
  }

  connect() {
    const url = `wss://atlas-mainnet.helius-rpc.com?api-key=${this.config.apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("Connected to Geyser");
      this.subscribe();
    });

    this.ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(message);
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    this.ws.on("close", () => {
      console.log("Disconnected from Geyser");
      // Implement reconnection logic
      setTimeout(() => this.connect(), 5000);
    });
  }

  private subscribe() {
    // Subscribe to account updates
    if (this.config.accountKeys) {
      this.ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "accountSubscribe",
        params: [
          this.config.accountKeys,
          {
            encoding: "jsonParsed",
            commitment: "confirmed",
          },
        ],
      }));
    }

    // Subscribe to program accounts
    if (this.config.programIds) {
      this.ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "programSubscribe",
        params: [
          this.config.programIds[0],
          {
            encoding: "jsonParsed",
            commitment: "confirmed",
          },
        ],
      }));
    }
  }

  private handleMessage(message: any) {
    if (message.method === "accountNotification") {
      const { result } = message.params;
      console.log("Account updated:", result.value.pubkey);
      console.log("Data:", result.value.account);
      // Handle account update
    } else if (message.method === "programNotification") {
      const { result } = message.params;
      console.log("Program account updated:", result.value.pubkey);
      // Handle program account update
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
const stream = new GeyserStream({
  apiKey: process.env.HELIUS_API_KEY!,
  accountKeys: ["YOUR_WALLET_ADDRESS"],
  programIds: ["YOUR_PROGRAM_ID"],
});

stream.connect();
```

**Geyser advantages:**
- Sub-second latency
- Direct from validator
- Custom filters
- Slot-accurate data
- Lower costs than polling

### Technique 2: Webhook Retry and Error Handling

Production-ready webhook management:

```typescript
import { Helius } from "helius-sdk";

class WebhookManager {
  private helius: Helius;
  private webhooks: Map<string, any>;

  constructor(apiKey: string) {
    this.helius = new Helius(apiKey);
    this.webhooks = new Map();
  }

  async createWebhookWithRetry(
    config: any,
    maxRetries = 3
  ): Promise<any> {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const webhook = await this.helius.createWebhook(config);
        this.webhooks.set(webhook.webhookID, webhook);
        return webhook;
      } catch (error) {
        lastError = error;
        console.error(`Webhook creation failed (attempt ${i + 1}):`, error);
        await this.sleep(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }

    throw new Error(`Failed to create webhook after ${maxRetries} attempts: ${lastError}`);
  }

  async getAllWebhooks() {
    const webhooks = await this.helius.getAllWebhooks();
    webhooks.forEach(wh => this.webhooks.set(wh.webhookID, wh));
    return webhooks;
  }

  async deleteWebhook(webhookId: string) {
    await this.helius.deleteWebhook(webhookId);
    this.webhooks.delete(webhookId);
  }

  async editWebhook(webhookId: string, updates: any) {
    const webhook = await this.helius.editWebhook(webhookId, updates);
    this.webhooks.set(webhookId, webhook);
    return webhook;
  }

  // Health check
  async verifyWebhookHealth(webhookId: string): Promise<boolean> {
    try {
      const webhook = this.webhooks.get(webhookId);
      if (!webhook) return false;

      // Check if webhook is active
      const current = await this.helius.getWebhook(webhookId);
      return current.wallet === webhook.wallet;
    } catch {
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Webhook handler with validation
import crypto from "crypto";

function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return digest === signature;
}

app.post("/webhook/helius", async (req, res) => {
  const signature = req.headers["x-helius-signature"];
  const payload = JSON.stringify(req.body);

  // Validate webhook signature (if configured)
  if (process.env.WEBHOOK_SECRET) {
    if (!validateWebhookSignature(payload, signature as string, process.env.WEBHOOK_SECRET)) {
      return res.status(401).send("Invalid signature");
    }
  }

  try {
    await processWebhookEvents(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Processing failed");
  }
});
```

### Technique 3: Address Lookup and Classification

Identify account types and owners:

```typescript
import { Helius } from "helius-sdk";

const helius = new Helius(process.env.HELIUS_API_KEY);

async function classifyAddress(address: string) {
  const info = await helius.rpc.getAddressInfo(address);

  return {
    address,
    type: info.type, // "wallet", "token", "nft", "program"
    owner: info.owner,
    data: info.data,
    lamports: info.lamports,
  };
}

// Batch address lookup
async function batchAddressLookup(addresses: string[]) {
  const results = await Promise.all(
    addresses.map(addr => classifyAddress(addr))
  );

  return results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, any[]>);
}

// Get token holders
async function getTokenHolders(mintAddress: string) {
  const holders = await helius.rpc.getTokenHolders(mintAddress);

  return holders
    .filter(h => h.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(h => ({
      address: h.owner,
      amount: h.amount,
      decimals: h.decimals,
      uiAmount: h.uiAmount,
    }));
}
```

### Technique 4: Transaction Simulation and Optimization

Test and optimize before sending:

```typescript
import { Helius } from "helius-sdk";
import { Transaction, Connection } from "@solana/web3.js";

const helius = new Helius(process.env.HELIUS_API_KEY);

async function simulateAndOptimize(
  transaction: Transaction,
  signers: any[]
) {
  // Simulate transaction
  const simulation = await helius.connection.simulateTransaction(transaction);

  if (simulation.value.err) {
    console.error("Simulation failed:", simulation.value.err);
    throw new Error("Transaction would fail");
  }

  const computeUnits = simulation.value.unitsConsumed || 200_000;

  // Add optimal compute budget
  transaction.instructions.unshift(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.ceil(computeUnits * 1.1), // 10% buffer
    })
  );

  // Get priority fee
  const feeEstimate = await helius.rpc.getPriorityFeeEstimate({
    accountKeys: transaction.instructions
      .flatMap(ix => ix.keys.map(k => k.pubkey.toString())),
  });

  transaction.instructions.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: feeEstimate.priorityFeeEstimate,
    })
  );

  return transaction;
}

// Send with retry
async function sendWithRetry(
  transaction: Transaction,
  signers: any[],
  maxRetries = 3
) {
  const optimized = await simulateAndOptimize(transaction, signers);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const signature = await helius.connection.sendTransaction(
        optimized,
        signers,
        {
          skipPreflight: false,
          maxRetries: 0,
        }
      );

      await helius.connection.confirmTransaction(signature, "confirmed");
      return signature;
    } catch (error) {
      console.error(`Send attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

## Production Examples (Expand: +1500 tokens)

### Example 1: Token Launch Monitor

Real-time token launch detection and analysis:

```typescript
import { Helius, WebhookType } from "helius-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

class TokenLaunchMonitor {
  private helius: Helius;
  private connection: Connection;
  private webhookId: string | null = null;

  constructor(apiKey: string) {
    this.helius = new Helius(apiKey);
    this.connection = this.helius.connection;
  }

  async start(raydiumProgramId: string, webhookUrl: string) {
    // Create webhook for Raydium program
    const webhook = await this.helius.createWebhook({
      webhookURL: webhookUrl,
      transactionTypes: [WebhookType.ANY],
      accountAddresses: [raydiumProgramId],
      webhookType: "enhanced",
    });

    this.webhookId = webhook.webhookID;
    console.log(`Monitoring started: ${this.webhookId}`);
  }

  async handleWebhook(events: any[]) {
    for (const event of events) {
      // Detect pool initialization
      if (this.isPoolInit(event)) {
        const poolData = await this.analyzePool(event);

        if (this.isViablePool(poolData)) {
          await this.notifyNewLaunch(poolData);
        }
      }
    }
  }

  private isPoolInit(event: any): boolean {
    return event.type === "SWAP" && event.events?.swap?.initialize;
  }

  private async analyzePool(event: any) {
    const { tokenA, tokenB, liquidityPool } = event.events.swap;

    // Get token metadata
    const [metadataA, metadataB] = await Promise.all([
      this.getTokenMetadata(tokenA.mint),
      this.getTokenMetadata(tokenB.mint),
    ]);

    // Get liquidity info
    const poolAccount = await this.connection.getAccountInfo(
      new PublicKey(liquidityPool)
    );

    return {
      poolAddress: liquidityPool,
      tokenA: { ...tokenA, metadata: metadataA },
      tokenB: { ...tokenB, metadata: metadataB },
      liquidity: this.calculateLiquidity(poolAccount),
      timestamp: event.timestamp,
      signature: event.signature,
    };
  }

  private async getTokenMetadata(mint: string) {
    try {
      const asset = await this.helius.rpc.getAsset({ id: mint });
      return {
        name: asset.content?.metadata?.name,
        symbol: asset.content?.metadata?.symbol,
        image: asset.content?.links?.image,
      };
    } catch {
      return { name: "Unknown", symbol: "???", image: null };
    }
  }

  private calculateLiquidity(accountInfo: any): number {
    // Parse pool account data to calculate TVL
    // Implementation depends on DEX structure
    return 0;
  }

  private isViablePool(poolData: any): boolean {
    // Filter criteria
    const hasMinLiquidity = poolData.liquidity > 10_000_000_000; // 10 SOL
    const hasMetadata = poolData.tokenA.metadata.name !== "Unknown";

    return hasMinLiquidity && hasMetadata;
  }

  private async notifyNewLaunch(poolData: any) {
    console.log("🚀 New viable launch detected!");
    console.log(`Token: ${poolData.tokenA.metadata.name} (${poolData.tokenA.metadata.symbol})`);
    console.log(`Pool: ${poolData.poolAddress}`);
    console.log(`Liquidity: ${poolData.liquidity / 1e9} SOL`);
    console.log(`Transaction: https://solscan.io/tx/${poolData.signature}`);

    // Send to Discord, Telegram, etc.
  }

  async stop() {
    if (this.webhookId) {
      await this.helius.deleteWebhook(this.webhookId);
      console.log("Monitoring stopped");
    }
  }
}

// Express webhook handler
app.post("/webhook/token-launches", async (req, res) => {
  const monitor = new TokenLaunchMonitor(process.env.HELIUS_API_KEY!);
  await monitor.handleWebhook(req.body);
  res.sendStatus(200);
});
```

### Example 2: NFT Collection Tracker

Monitor NFT sales and floor price:

```typescript
import { Helius, WebhookType } from "helius-sdk";

interface SaleData {
  mint: string;
  buyer: string;
  seller: string;
  price: number;
  marketplace: string;
  timestamp: number;
}

class NFTCollectionTracker {
  private helius: Helius;
  private sales: SaleData[] = [];
  private floorPrice: number = 0;

  constructor(apiKey: string) {
    this.helius = new Helius(apiKey);
  }

  async trackCollection(
    collectionAddress: string,
    webhookUrl: string
  ) {
    // Setup webhook for NFT events
    await this.helius.createWebhook({
      webhookURL: webhookUrl,
      transactionTypes: [
        WebhookType.NFT_SALE,
        WebhookType.NFT_LISTING,
      ],
      accountAddresses: [collectionAddress],
      webhookType: "enhanced",
    });

    // Load existing floor price
    await this.updateFloorPrice(collectionAddress);
  }

  async handleSale(event: any) {
    const sale: SaleData = {
      mint: event.nftSale.nfts[0],
      buyer: event.nftSale.buyer,
      seller: event.nftSale.seller,
      price: event.nftSale.amount / 1e9, // Convert to SOL
      marketplace: event.source,
      timestamp: event.timestamp,
    };

    this.sales.push(sale);

    // Update statistics
    await this.updateStatistics();

    // Alert if significant sale
    if (sale.price > this.floorPrice * 2) {
      this.alertHighValueSale(sale);
    }
  }

  private async updateFloorPrice(collectionAddress: string) {
    // Get all listed NFTs
    const assets = await this.helius.rpc.getAssetsByGroup({
      groupKey: "collection",
      groupValue: collectionAddress,
      page: 1,
      limit: 1000,
    });

    // Filter listed items and find lowest price
    const listedPrices = assets.items
      .filter(asset => asset.listing)
      .map(asset => asset.listing.price);

    this.floorPrice = Math.min(...listedPrices) / 1e9;
  }

  private async updateStatistics() {
    const last24h = this.sales.filter(
      s => Date.now() - s.timestamp * 1000 < 24 * 60 * 60 * 1000
    );

    const volume24h = last24h.reduce((sum, s) => sum + s.price, 0);
    const avgPrice24h = volume24h / last24h.length;

    console.log("📊 Collection Stats (24h):");
    console.log(`Sales: ${last24h.length}`);
    console.log(`Volume: ${volume24h.toFixed(2)} SOL`);
    console.log(`Average: ${avgPrice24h.toFixed(2)} SOL`);
    console.log(`Floor: ${this.floorPrice.toFixed(2)} SOL`);
  }

  private alertHighValueSale(sale: SaleData) {
    console.log("💎 High Value Sale Detected!");
    console.log(`Price: ${sale.price.toFixed(2)} SOL`);
    console.log(`Buyer: ${sale.buyer}`);
    console.log(`Marketplace: ${sale.marketplace}`);
  }
}
```

### Example 3: Wallet Activity Analyzer

Comprehensive wallet tracking and analysis:

```typescript
import { Helius } from "helius-sdk";

class WalletAnalyzer {
  private helius: Helius;

  constructor(apiKey: string) {
    this.helius = new Helius(apiKey);
  }

  async analyzeWallet(address: string) {
    const [balance, tokens, nfts, transactions] = await Promise.all([
      this.getBalance(address),
      this.getTokens(address),
      this.getNFTs(address),
      this.getRecentActivity(address),
    ]);

    return {
      address,
      balance,
      tokens,
      nfts,
      activity: this.categorizeActivity(transactions),
      risk: this.assessRisk(transactions),
    };
  }

  private async getBalance(address: string): Promise<number> {
    const balance = await this.helius.connection.getBalance(
      new PublicKey(address)
    );
    return balance / 1e9;
  }

  private async getTokens(address: string) {
    const assets = await this.helius.rpc.getAssetsByOwner({
      ownerAddress: address,
      page: 1,
      limit: 1000,
    });

    return assets.items
      .filter(asset => asset.interface === "FungibleToken")
      .map(asset => ({
        mint: asset.id,
        name: asset.content?.metadata?.name,
        symbol: asset.content?.metadata?.symbol,
        amount: asset.token_info?.balance,
      }));
  }

  private async getNFTs(address: string) {
    const assets = await this.helius.rpc.getAssetsByOwner({
      ownerAddress: address,
      page: 1,
      limit: 1000,
    });

    return assets.items
      .filter(asset => asset.interface === "V1_NFT")
      .map(asset => ({
        mint: asset.id,
        name: asset.content?.metadata?.name,
        image: asset.content?.links?.image,
        collection: asset.grouping?.find(g => g.group_key === "collection")?.group_value,
      }));
  }

  private async getRecentActivity(address: string, limit = 100) {
    const signatures = await this.helius.rpc.getSignaturesForAddress(
      address,
      { limit }
    );

    return await this.helius.rpc.parseTransactions(
      signatures.map(s => s.signature)
    );
  }

  private categorizeActivity(transactions: any[]) {
    const categories = {
      swaps: 0,
      nftTrades: 0,
      transfers: 0,
      stakes: 0,
      other: 0,
    };

    transactions.forEach(tx => {
      if (tx.type === "SWAP") categories.swaps++;
      else if (tx.type === "NFT_SALE") categories.nftTrades++;
      else if (tx.type === "TRANSFER") categories.transfers++;
      else if (tx.type === "STAKE") categories.stakes++;
      else categories.other++;
    });

    return categories;
  }

  private assessRisk(transactions: any[]): string {
    // Check for suspicious patterns
    const recentTxCount = transactions.filter(
      tx => Date.now() - tx.timestamp * 1000 < 24 * 60 * 60 * 1000
    ).length;

    if (recentTxCount > 100) return "HIGH";
    if (recentTxCount > 50) return "MEDIUM";
    return "LOW";
  }
}
```

## Best Practices

**RPC Optimization**
- Use Helius for parsed transactions (avoid manual parsing)
- Batch API calls when possible
- Cache frequently accessed data
- Use priority fees during congestion
- Implement retry logic with exponential backoff

**Webhook Management**
- Validate webhook signatures
- Implement idempotency for duplicate events
- Use separate webhooks for different event types
- Monitor webhook health regularly
- Have fallback polling mechanism

**DAS API Usage**
- Paginate large collections
- Use specific filters to reduce response size
- Cache NFT metadata when appropriate
- Batch asset lookups when possible
- Handle compressed NFTs separately

**Geyser Streaming**
- Implement reconnection logic
- Filter at the source to reduce bandwidth
- Buffer messages during high load
- Monitor WebSocket connection health
- Use appropriate commitment levels

**Cost Optimization**
- Use webhooks instead of polling
- Cache data with appropriate TTL
- Batch operations when possible
- Use DAS API for NFT data (cheaper than on-chain)
- Monitor API usage and set alerts

## Common Pitfalls

**Issue 1: Webhook Overload**
```typescript
// ❌ Wrong - too broad
await helius.createWebhook({
  transactionTypes: [WebhookType.ANY],
  accountAddresses: [], // All transactions!
});

// ✅ Correct - specific monitoring
await helius.createWebhook({
  transactionTypes: [WebhookType.SWAP, WebhookType.NFT_SALE],
  accountAddresses: [specificAddress],
});
```
**Solution:** Always filter webhooks to specific addresses/types to avoid overwhelming your endpoint.

**Issue 2: Missing Priority Fees**
```typescript
// ❌ Wrong - no priority fee
const signature = await connection.sendTransaction(transaction, signers);

// ✅ Correct - with priority fee
const feeEstimate = await helius.rpc.getPriorityFeeEstimate({
  accountKeys: [/* relevant accounts */],
});
transaction.add(
  ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: feeEstimate.priorityFeeEstimate,
  })
);
const signature = await connection.sendTransaction(transaction, signers);
```
**Solution:** Always use priority fees during network congestion for reliable transaction landing.

**Issue 3: DAS Pagination Ignored**
```typescript
// ❌ Wrong - only gets first page
const assets = await helius.rpc.getAssetsByOwner({
  ownerAddress: wallet,
  limit: 1000,
});

// ✅ Correct - fetch all pages
async function getAllAssets(ownerAddress: string) {
  let page = 1;
  let allAssets = [];

  while (true) {
    const response = await helius.rpc.getAssetsByOwner({
      ownerAddress,
      page,
      limit: 1000,
    });

    allAssets.push(...response.items);

    if (response.items.length < 1000) break;
    page++;
  }

  return allAssets;
}
```
**Solution:** Implement pagination to fetch all results for large collections.

**Issue 4: Webhook Signature Not Verified**
```typescript
// ❌ Wrong - no verification
app.post("/webhook", (req, res) => {
  processEvents(req.body);
  res.sendStatus(200);
});

// ✅ Correct - verify signature
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-helius-signature"];
  if (!validateSignature(req.body, signature)) {
    return res.status(401).send("Invalid");
  }
  processEvents(req.body);
  res.sendStatus(200);
});
```
**Solution:** Always verify webhook signatures to prevent unauthorized requests.

## Resources

**Official Documentation**
- [Helius Docs](https://docs.helius.dev/) - Complete API reference
- [Helius SDK](https://github.com/helius-labs/helius-sdk) - TypeScript SDK
- [Webhook Guide](https://docs.helius.dev/webhooks) - Webhook setup

**API References**
- [Enhanced RPC Methods](https://docs.helius.dev/api-reference/enhanced-rpc-methods) - RPC endpoints
- [DAS API](https://docs.helius.dev/api-reference/das-api) - Digital Asset Standard
- [Geyser Plugin](https://docs.helius.dev/api-reference/geyser-plugin) - Real-time streaming

**Related Skills**
- `solana-anchor-mastery` - Smart contract development
- `jupiter-aggregator-integration` - Token swaps
- `dex-screener-api` - Price data
- `solana-program-optimization` - Performance tuning

**External Resources**
- [Helius Blog](https://www.helius.dev/blog) - Tutorials and guides
- [Helius Discord](https://discord.gg/helius) - Community support
- [Example Projects](https://github.com/helius-labs/examples) - Code samples
