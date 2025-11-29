import type { BridgeQuote, Chain } from "../types.js";

export interface FeeEstimate {
  bridgeFee: number;
  bridgeFeeUsd: number;
  gasFeeSource: number;
  gasFeeSourceUsd: number;
  gasFeeDest: number;
  gasFeeDestUsd: number;
  totalFee: number;
  totalFeeUsd: number;
}

export interface TimeEstimate {
  minTime: number; // seconds
  avgTime: number;
  maxTime: number;
  confidence: number; // 0-1
}

// Approximate gas prices by chain (in native token)
const GAS_PRICES: Record<Chain, { low: number; avg: number; high: number }> = {
  ethereum: { low: 10, avg: 25, high: 50 }, // gwei
  bsc: { low: 3, avg: 5, high: 10 },
  polygon: { low: 30, avg: 50, high: 100 },
  arbitrum: { low: 0.01, avg: 0.1, high: 0.5 },
  optimism: { low: 0.001, avg: 0.01, high: 0.1 },
  base: { low: 0.001, avg: 0.01, high: 0.05 },
  avalanche: { low: 25, avg: 30, high: 50 },
  solana: { low: 0.000005, avg: 0.00001, high: 0.0001 },
  sui: { low: 0.001, avg: 0.005, high: 0.01 },
  aptos: { low: 0.0001, avg: 0.001, high: 0.01 },
};

// Approximate native token prices (USD)
const NATIVE_PRICES: Record<Chain, number> = {
  ethereum: 2500,
  bsc: 300,
  polygon: 0.8,
  arbitrum: 2500, // ETH
  optimism: 2500, // ETH
  base: 2500, // ETH
  avalanche: 35,
  solana: 100,
  sui: 1.5,
  aptos: 10,
};

// Average bridge times by type
const BRIDGE_TIMES: Record<string, { min: number; avg: number; max: number }> = {
  wormhole: { min: 600, avg: 900, max: 1800 }, // 10-30 min
  layerzero: { min: 60, avg: 120, max: 300 }, // 1-5 min
  debridge: { min: 30, avg: 60, max: 120 }, // 0.5-2 min
  default: { min: 300, avg: 600, max: 1200 },
};

export class Estimator {
  estimateFees(
    quote: BridgeQuote,
    gasLevel: "low" | "avg" | "high" = "avg"
  ): FeeEstimate {
    const sourceGasPrice = GAS_PRICES[quote.sourceChain]?.[gasLevel] ?? 0;
    const destGasPrice = GAS_PRICES[quote.destChain]?.[gasLevel] ?? 0;
    const sourceNativePrice = NATIVE_PRICES[quote.sourceChain] ?? 0;
    const destNativePrice = NATIVE_PRICES[quote.destChain] ?? 0;

    // Estimate gas units (simplified)
    const sourceGasUnits = this.estimateSourceGas(quote);
    const destGasUnits = this.estimateDestGas(quote);

    const gasFeeSource = (sourceGasPrice * sourceGasUnits) / 1e9; // Convert from gwei
    const gasFeeSourceUsd = gasFeeSource * sourceNativePrice;

    const gasFeeDest = (destGasPrice * destGasUnits) / 1e9;
    const gasFeeDestUsd = gasFeeDest * destNativePrice;

    const bridgeFee = parseFloat(quote.fee);
    const bridgeFeeUsd = quote.feeUsd;

    return {
      bridgeFee,
      bridgeFeeUsd,
      gasFeeSource,
      gasFeeSourceUsd,
      gasFeeDest,
      gasFeeDestUsd,
      totalFee: bridgeFee + gasFeeSource + gasFeeDest,
      totalFeeUsd: bridgeFeeUsd + gasFeeSourceUsd + gasFeeDestUsd,
    };
  }

  private estimateSourceGas(quote: BridgeQuote): number {
    // Gas units vary by chain and bridge
    const baseGas: Record<string, number> = {
      ethereum: 150000,
      bsc: 100000,
      polygon: 100000,
      arbitrum: 500000, // Higher for L2
      optimism: 500000,
      base: 500000,
      avalanche: 100000,
      solana: 5000, // Compute units
      sui: 1000,
      aptos: 1000,
    };

    return baseGas[quote.sourceChain] ?? 150000;
  }

  private estimateDestGas(quote: BridgeQuote): number {
    // Destination gas is usually for claiming/receiving
    const baseGas: Record<string, number> = {
      ethereum: 100000,
      bsc: 80000,
      polygon: 80000,
      arbitrum: 300000,
      optimism: 300000,
      base: 300000,
      avalanche: 80000,
      solana: 5000,
      sui: 1000,
      aptos: 1000,
    };

    return baseGas[quote.destChain] ?? 100000;
  }

  estimateTime(bridgeId: string): TimeEstimate {
    const baseBridge = bridgeId.split("+")[0] ?? bridgeId;
    const times = BRIDGE_TIMES[baseBridge] ?? BRIDGE_TIMES.default;

    // Multi-hop routes take longer
    const hopCount = bridgeId.split("+").length;
    const multiplier = hopCount;

    return {
      minTime: times.min * multiplier,
      avgTime: times.avg * multiplier,
      maxTime: times.max * multiplier,
      confidence: hopCount === 1 ? 0.9 : 0.7,
    };
  }

  calculateSlippageImpact(
    inputAmount: string,
    outputAmount: string,
    priceImpact: number
  ): {
    effectiveRate: number;
    slippageLoss: number;
    slippageLossUsd: number;
  } {
    const input = parseFloat(inputAmount);
    const output = parseFloat(outputAmount);

    const effectiveRate = output / input;
    const idealRate = 1; // Assuming 1:1 for same token bridges
    const slippageLoss = (idealRate - effectiveRate) * input;
    const slippageLossUsd = slippageLoss; // Would need price for accurate USD

    return {
      effectiveRate,
      slippageLoss,
      slippageLossUsd,
    };
  }

  compareQuotes(quotes: BridgeQuote[]): {
    ranked: Array<{
      quote: BridgeQuote;
      score: number;
      fees: FeeEstimate;
      time: TimeEstimate;
    }>;
  } {
    const analyzed = quotes.map((quote) => {
      const fees = this.estimateFees(quote);
      const time = this.estimateTime(quote.bridgeId);

      // Scoring: prioritize output amount, then fees, then speed
      const outputScore = parseFloat(quote.outputAmount) * 100;
      const feeScore = -fees.totalFeeUsd * 10;
      const timeScore = -time.avgTime / 60; // Minutes penalty

      return {
        quote,
        score: outputScore + feeScore + timeScore,
        fees,
        time,
      };
    });

    analyzed.sort((a, b) => b.score - a.score);

    return { ranked: analyzed };
  }
}
