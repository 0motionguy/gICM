export * from "./types.js";
export * from "./evm.js";
export * from "./solana.js";

import { EvmChainProvider, EVM_NETWORKS } from "./evm.js";
import { SolanaChainProvider, SOLANA_NETWORKS } from "./solana.js";
import type { ChainProvider } from "./types.js";
import type { ChainType } from "../types.js";

export function createChainProvider(
  chain: ChainType,
  network: string
): ChainProvider {
  if (chain === "evm") {
    const config = EVM_NETWORKS[network];
    if (!config) {
      throw new Error(`Unknown EVM network: ${network}`);
    }
    return new EvmChainProvider(config);
  }

  if (chain === "solana") {
    const config = SOLANA_NETWORKS[network];
    if (!config) {
      throw new Error(`Unknown Solana network: ${network}`);
    }
    return new SolanaChainProvider(config);
  }

  throw new Error(`Unknown chain type: ${chain}`);
}
