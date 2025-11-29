import type { AgentContext, AgentResult } from "@gicm/agent-core";
import type { WalletCommand, WalletAgentConfig } from "./types.js";
import { parseAmount } from "./parser.js";

export class SolanaWalletProvider {
  private config: WalletAgentConfig;
  private address: string | null = null;
  private rpcUrl: string;

  constructor(config: WalletAgentConfig) {
    this.config = config;
    this.rpcUrl = this.getRpcUrl();
  }

  async initialize(): Promise<string> {
    if (this.config.privateKey) {
      console.log("[SolanaWallet] Using provided private key");
    }
    this.address = "So1ana..."; // Placeholder - actual init via Solana Agent Kit
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

    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getBalance",
        params: [targetAddress],
        id: 1,
      }),
    });

    const data = (await response.json()) as { result?: { value?: number } };
    const lamports = data.result?.value ?? 0;
    const balance = parseAmount(BigInt(lamports), 9);

    return {
      agent: "wallet-agent",
      success: true,
      data: {
        address: targetAddress,
        balance,
        symbol: "SOL",
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
      error: "Transfer requires Solana Agent Kit. Configure privateKey.",
      reasoning: "For security, direct transfers require wallet SDK integration",
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
      error: "Jupiter swap requires Solana Agent Kit integration",
      data: {
        inputToken,
        outputToken,
        amount,
        slippage,
        dex: "Jupiter",
      },
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
      error: "SPL Token deployment requires Solana Agent Kit",
      data: { name, symbol, decimals, initialSupply },
      timestamp: Date.now(),
    };
  }

  private getRpcUrl(): string {
    const rpcUrls: Record<string, string> = {
      "mainnet-beta": "https://api.mainnet-beta.solana.com",
      devnet: "https://api.devnet.solana.com",
      testnet: "https://api.testnet.solana.com",
    };
    return rpcUrls[this.config.network] || rpcUrls["mainnet-beta"];
  }
}
