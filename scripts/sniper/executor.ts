/**
 * Jupiter Swap Executor
 * Executes buys via Jupiter aggregator
 */

import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { CONFIG } from "./config.js";
import bs58 from "bs58";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const LAMPORTS_PER_SOL = 1_000_000_000;

export interface SwapResult {
  success: boolean;
  signature?: string;
  inputAmount: number;
  outputAmount?: number;
  error?: string;
}

export class JupiterExecutor {
  private connection: Connection;
  private wallet: Keypair | null = null;

  constructor() {
    this.connection = new Connection(CONFIG.RPC_URL, "confirmed");
    this.loadWallet();
  }

  private loadWallet(): void {
    const privateKey = process.env.GICM_PRIVATE_KEY;
    if (!privateKey) {
      console.warn("[EXECUTOR] No wallet configured (GICM_PRIVATE_KEY)");
      return;
    }

    try {
      // Support both base58 and JSON array formats
      if (privateKey.startsWith("[")) {
        const secretKey = new Uint8Array(JSON.parse(privateKey));
        this.wallet = Keypair.fromSecretKey(secretKey);
      } else {
        const secretKey = bs58.decode(privateKey);
        this.wallet = Keypair.fromSecretKey(secretKey);
      }
      console.log(`[EXECUTOR] Wallet loaded: ${this.wallet.publicKey.toString().slice(0, 8)}...`);
    } catch (e) {
      console.error("[EXECUTOR] Failed to load wallet:", e);
    }
  }

  async getQuote(outputMint: string, inputAmountSol: number): Promise<any> {
    const inputAmount = Math.floor(inputAmountSol * LAMPORTS_PER_SOL);

    const params = new URLSearchParams({
      inputMint: SOL_MINT,
      outputMint,
      amount: inputAmount.toString(),
      slippageBps: CONFIG.SLIPPAGE_BPS.toString(),
      onlyDirectRoutes: "true",
    });

    const response = await fetch(`${CONFIG.JUPITER_API}/quote?${params}`);

    if (!response.ok) {
      throw new Error(`Quote failed: ${response.status}`);
    }

    return response.json();
  }

  async executeSwap(outputMint: string, inputAmountSol: number): Promise<SwapResult> {
    if (!this.wallet) {
      return {
        success: false,
        inputAmount: inputAmountSol,
        error: "No wallet configured",
      };
    }

    if (CONFIG.DRY_RUN) {
      console.log(`[EXECUTOR] DRY RUN: Would buy ${inputAmountSol} SOL of ${outputMint}`);
      return {
        success: true,
        inputAmount: inputAmountSol,
        signature: "DRY_RUN_" + Date.now(),
      };
    }

    try {
      // Get quote
      console.log(`[EXECUTOR] Getting quote for ${inputAmountSol} SOL -> ${outputMint.slice(0, 8)}...`);
      const quote = await this.getQuote(outputMint, inputAmountSol);

      if (!quote || quote.error) {
        return {
          success: false,
          inputAmount: inputAmountSol,
          error: quote?.error || "No quote available",
        };
      }

      // Get swap transaction
      const swapResponse = await fetch(`${CONFIG.JUPITER_API}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: this.wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          prioritizationFeeLamports: Math.floor(CONFIG.PRIORITY_FEE * LAMPORTS_PER_SOL),
        }),
      });

      const swapData = await swapResponse.json();

      if (!swapData.swapTransaction) {
        return {
          success: false,
          inputAmount: inputAmountSol,
          error: "Failed to get swap transaction",
        };
      }

      // Deserialize and sign
      const swapTxBuf = Buffer.from(swapData.swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTxBuf);
      transaction.sign([this.wallet]);

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, {
        skipPreflight: true,
        maxRetries: 3,
      });

      console.log(`[EXECUTOR] Swap sent: ${signature}`);

      // Confirm
      const confirmation = await this.connection.confirmTransaction(signature, "confirmed");

      if (confirmation.value.err) {
        return {
          success: false,
          inputAmount: inputAmountSol,
          signature,
          error: "Transaction failed on-chain",
        };
      }

      const outputAmount = Number(quote.outAmount) / Math.pow(10, quote.outputDecimals || 9);

      return {
        success: true,
        signature,
        inputAmount: inputAmountSol,
        outputAmount,
      };
    } catch (e) {
      return {
        success: false,
        inputAmount: inputAmountSol,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  }

  async getBalance(): Promise<number> {
    if (!this.wallet) return 0;
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  getWalletAddress(): string | null {
    return this.wallet?.publicKey.toString() || null;
  }
}
