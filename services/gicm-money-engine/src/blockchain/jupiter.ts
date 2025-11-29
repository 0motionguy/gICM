/**
 * Jupiter DEX Client
 *
 * Handles token swaps on Solana via Jupiter aggregator.
 */

import { Keypair } from "@solana/web3.js";
import Decimal from "decimal.js";
import { Logger } from "../utils/logger.js";

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  wallet: Keypair;
}

export interface SwapResult {
  txSignature: string;
  inputAmount: number;
  outputAmount: number;
  price: number;
  fee?: number;
  slippage?: number;
}

export interface QuoteResult {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: unknown[];
}

export class JupiterClient {
  private logger: Logger;
  private baseUrl = "https://quote-api.jup.ag/v6";

  constructor() {
    this.logger = new Logger("Jupiter");
  }

  /**
   * Get price for a token in USDC
   */
  async getPrice(tokenMint: string): Promise<number> {
    try {
      const response = await fetch(
        `https://price.jup.ag/v6/price?ids=${tokenMint}`
      );
      const data = await response.json() as { data: Record<string, { price: number }> };
      return data.data[tokenMint]?.price ?? 0;
    } catch (error) {
      this.logger.error(`Failed to get price: ${error}`);
      return 0;
    }
  }

  /**
   * Get swap quote
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number
  ): Promise<QuoteResult | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
      );
      return await response.json() as QuoteResult;
    } catch (error) {
      this.logger.error(`Failed to get quote: ${error}`);
      return null;
    }
  }

  /**
   * Execute a swap
   */
  async swap(params: SwapParams): Promise<SwapResult> {
    this.logger.info(`Executing swap: ${params.amount} ${params.inputMint} -> ${params.outputMint}`);

    // Get quote first
    const quote = await this.getQuote(
      params.inputMint,
      params.outputMint,
      params.amount,
      params.slippageBps
    );

    if (!quote) {
      throw new Error("Failed to get quote");
    }

    // In real implementation, this would:
    // 1. Get serialized transaction from Jupiter
    // 2. Sign with wallet
    // 3. Submit to Solana
    // For now, return simulated result

    const inputAmount = params.amount;
    const outputAmount = parseInt(quote.outAmount);
    const price = new Decimal(outputAmount).div(inputAmount).toNumber();

    this.logger.info(`Swap executed: ${inputAmount} -> ${outputAmount} @ ${price}`);

    return {
      txSignature: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      inputAmount,
      outputAmount,
      price,
      fee: inputAmount * 0.003, // 0.3% simulated fee
      slippage: quote.priceImpactPct,
    };
  }

  /**
   * Get SOL price in USD
   */
  async getSolPrice(): Promise<number> {
    return this.getPrice("So11111111111111111111111111111111111111112");
  }
}
