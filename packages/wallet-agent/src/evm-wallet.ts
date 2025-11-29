import type { AgentContext, AgentResult } from "@gicm/agent-core";
import type { WalletCommand, WalletAgentConfig } from "./types.js";
import { parseAmount } from "./parser.js";

export class EvmWalletProvider {
  private config: WalletAgentConfig;
  private address: string | null = null;

  constructor(config: WalletAgentConfig) {
    this.config = config;
  }

  async initialize(): Promise<string> {
    if (this.config.cdpApiKeyName && this.config.cdpApiKeyPrivate) {
      console.log("[EvmWallet] Coinbase AgentKit mode - use CDP SDK for wallet ops");
    }
    this.address = "0x..."; // Placeholder - actual init via CDP SDK
    return this.address;
  }

  async executeCommand(
    command: WalletCommand,
    context: AgentContext
  ): Promise<AgentResult> {
    switch (command.action) {
      case "balance":
        return this.getBalance(command.address);
      case "transfer":
        return this.transfer(command.to, command.amount, command.token);
      case "swap":
        return this.swap(
          command.inputToken,
          command.outputToken,
          command.amount,
          command.slippage
        );
      case "deploy_token":
        return this.deployToken(
          command.name,
          command.symbol,
          command.decimals,
          command.initialSupply
        );
      default:
        return {
          agent: "wallet-agent",
          success: false,
          error: `Unsupported action: ${(command as WalletCommand).action}`,
          timestamp: Date.now(),
        };
    }
  }

  private async getBalance(address?: string): Promise<AgentResult> {
    const targetAddress = address || this.address;
    if (!targetAddress) {
      return {
        agent: "wallet-agent",
        success: false,
        error: "No wallet address available",
        timestamp: Date.now(),
      };
    }

    const rpcUrl = this.getRpcUrl();
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [targetAddress, "latest"],
        id: 1,
      }),
    });

    const data = (await response.json()) as { result: string };
    const balance = parseAmount(BigInt(data.result), 18);

    return {
      agent: "wallet-agent",
      success: true,
      data: {
        address: targetAddress,
        balance,
        symbol: "ETH",
        network: this.config.network,
      },
      timestamp: Date.now(),
    };
  }

  private async transfer(
    to: string,
    amount: string,
    token?: string
  ): Promise<AgentResult> {
    return {
      agent: "wallet-agent",
      success: false,
      error:
        "Transfer requires Coinbase AgentKit CDP wallet. Set cdpApiKeyName and cdpApiKeyPrivate.",
      reasoning:
        "For security, direct transfers require wallet SDK integration",
      data: { to, amount, token },
      timestamp: Date.now(),
    };
  }

  private async swap(
    inputToken: string,
    outputToken: string,
    amount: string,
    slippage: number
  ): Promise<AgentResult> {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Swap requires DEX integration via Coinbase AgentKit",
      data: { inputToken, outputToken, amount, slippage },
      timestamp: Date.now(),
    };
  }

  private async deployToken(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply?: string
  ): Promise<AgentResult> {
    return {
      agent: "wallet-agent",
      success: false,
      error: "Token deployment requires Coinbase AgentKit",
      data: { name, symbol, decimals, initialSupply },
      timestamp: Date.now(),
    };
  }

  private getRpcUrl(): string {
    const rpcUrls: Record<string, string> = {
      mainnet: "https://eth.llamarpc.com",
      base: "https://mainnet.base.org",
      arbitrum: "https://arb1.arbitrum.io/rpc",
      optimism: "https://mainnet.optimism.io",
      polygon: "https://polygon-rpc.com",
    };
    return rpcUrls[this.config.network] || rpcUrls.mainnet;
  }
}
