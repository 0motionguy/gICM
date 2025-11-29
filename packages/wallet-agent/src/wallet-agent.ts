import {
  BaseAgent,
  type AgentConfig,
  type AgentContext,
  type AgentResult,
} from "@gicm/agent-core";
import { EvmWalletProvider } from "./evm-wallet.js";
import { SolanaWalletProvider } from "./solana-wallet.js";
import { parseNaturalLanguage } from "./parser.js";
import type { WalletAgentConfig, WalletCommand } from "./types.js";

export class WalletAgent extends BaseAgent {
  private walletConfig: WalletAgentConfig;
  private evmProvider: EvmWalletProvider | null = null;
  private solanaProvider: SolanaWalletProvider | null = null;

  constructor(config: AgentConfig, walletConfig: WalletAgentConfig) {
    super("wallet-agent", config);
    this.walletConfig = walletConfig;

    if (walletConfig.chain === "evm") {
      this.evmProvider = new EvmWalletProvider(walletConfig);
    } else {
      this.solanaProvider = new SolanaWalletProvider(walletConfig);
    }
  }

  getSystemPrompt(): string {
    return `You are a Web3 Wallet Agent that helps users execute blockchain transactions safely.

CAPABILITIES:
- Check wallet balances (native tokens and ERC20/SPL tokens)
- Transfer tokens to addresses
- Swap tokens via DEX (Uniswap, Jupiter)
- Deploy new tokens
- Mint NFTs

SUPPORTED CHAINS:
- EVM: Ethereum, Base, Arbitrum, Optimism, Polygon
- Solana: mainnet-beta, devnet

SAFETY RULES:
1. Always confirm transaction details before execution
2. Warn about high slippage (>2%)
3. Verify recipient addresses
4. Show gas estimates before transactions
5. Never reveal private keys

RESPONSE FORMAT:
Respond with structured JSON containing:
- action: The action to perform
- params: Action-specific parameters
- confirmation: Human-readable summary for user confirmation`;
  }

  async analyze(context: AgentContext): Promise<AgentResult> {
    const query = context.userQuery;
    if (!query) {
      return this.createResult(false, null, "No query provided");
    }

    const command = parseNaturalLanguage(query);
    if (!command) {
      return this.createResult(
        false,
        null,
        `Could not parse command. Supported actions: transfer, swap, balance, deploy_token`,
        undefined,
        `Input: "${query}" did not match any known patterns`
      );
    }

    return this.executeWalletCommand(command, context);
  }

  async executeWalletCommand(
    command: WalletCommand,
    context: AgentContext
  ): Promise<AgentResult> {
    const provider =
      this.walletConfig.chain === "evm"
        ? this.evmProvider
        : this.solanaProvider;

    if (!provider) {
      return this.createResult(
        false,
        null,
        `No provider configured for chain: ${this.walletConfig.chain}`
      );
    }

    return provider.executeCommand(command, context);
  }

  async getBalance(address?: string): Promise<AgentResult> {
    return this.executeWalletCommand(
      { action: "balance", address },
      { chain: this.walletConfig.chain, network: this.walletConfig.network }
    );
  }

  async transfer(
    to: string,
    amount: string,
    token?: string
  ): Promise<AgentResult> {
    return this.executeWalletCommand(
      { action: "transfer", to, amount, token },
      { chain: this.walletConfig.chain, network: this.walletConfig.network }
    );
  }

  async swap(
    inputToken: string,
    outputToken: string,
    amount: string,
    slippage = 0.5
  ): Promise<AgentResult> {
    return this.executeWalletCommand(
      { action: "swap", inputToken, outputToken, amount, slippage },
      { chain: this.walletConfig.chain, network: this.walletConfig.network }
    );
  }
}
