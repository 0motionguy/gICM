#!/usr/bin/env node
/**
 * QuantAgent CLI - Run trading analysis from the command line
 *
 * Usage:
 *   quantagent analyze SOL
 *   quantagent analyze BONK --timeframe 1h
 *   quantagent quick BONK
 */

import { analyzeToken, quickSignal } from "./index.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case "analyze":
      await runAnalyze(args.slice(1));
      break;
    case "quick":
      await runQuick(args.slice(1));
      break;
    default:
      // Assume it's a token symbol
      await runAnalyze(args);
  }
}

function printHelp() {
  console.log(`
QuantAgent CLI - Multi-agent LLM trading signals

Usage:
  quantagent <symbol>                 Full analysis of a token
  quantagent analyze <symbol>         Full analysis of a token
  quantagent quick <symbol>           Quick bullish/bearish signal

Options:
  --timeframe, -t <1h|4h|1d>         Analysis timeframe (default: 4h)
  --address, -a <address>            Token address (for Solana SPL tokens)
  --chain, -c <solana|ethereum|base> Blockchain (default: solana)
  --provider, -p <anthropic|openai>  LLM provider (default: anthropic)

Examples:
  quantagent SOL
  quantagent analyze BONK --timeframe 1h
  quantagent quick WIF

Environment Variables:
  ANTHROPIC_API_KEY   Claude API key
  OPENAI_API_KEY      OpenAI API key (if using --provider openai)
`);
}

async function runAnalyze(args: string[]) {
  if (args.length === 0) {
    console.error("Error: Please provide a token symbol");
    process.exit(1);
  }

  const symbol = args[0];
  const options = parseOptions(args.slice(1));

  console.log(`\n🚀 QuantAgent - Full Analysis`);
  console.log(`Token: ${symbol}`);
  console.log(`Timeframe: ${options.timeframe || "4h"}`);
  console.log(`Chain: ${options.chain || "solana"}`);
  console.log("─".repeat(50));

  try {
    const decision = await analyzeToken(symbol, {
      address: options.address,
      chain: options.chain as "solana" | "ethereum" | "base" | undefined,
      timeframe: options.timeframe as "1h" | "4h" | "1d" | undefined,
      provider: options.provider as "anthropic" | "openai" | undefined,
    });

    console.log("\n" + "═".repeat(50));
    console.log("📊 TRADE DECISION");
    console.log("═".repeat(50));

    const actionEmoji = {
      LONG: "🟢",
      SHORT: "🔴",
      HOLD: "🟡",
      EXIT: "⚪",
    };

    console.log(
      `\n${actionEmoji[decision.action]} Action: ${decision.action}`
    );
    console.log(`📈 Confidence: ${decision.confidence}%`);
    console.log(`\n💰 Entry: $${decision.entryPrice.toFixed(6)}`);
    console.log(`🛑 Stop Loss: $${decision.stopLoss.toFixed(6)}`);
    console.log(`🎯 Take Profit: $${decision.takeProfit.toFixed(6)}`);
    console.log(`⚖️ Risk/Reward: ${decision.risk.rewardRatio.toFixed(2)}`);
    console.log(`\n📝 Rationale: ${decision.rationale}`);

    if (decision.risk.warnings.length > 0) {
      console.log(`\n⚠️ Warnings:`);
      decision.risk.warnings.forEach((w) => console.log(`   - ${w}`));
    }

    console.log("\n" + "─".repeat(50));
    console.log("Indicators:");
    decision.indicators.forEach((ind) => {
      const signalEmoji =
        ind.signal === "bullish" ? "🟢" : ind.signal === "bearish" ? "🔴" : "🟡";
      console.log(
        `  ${signalEmoji} ${ind.name}: ${ind.signal} (${ind.strength.toFixed(0)}%)`
      );
    });

    if (decision.pattern) {
      console.log("\n" + "─".repeat(50));
      console.log(`Pattern: ${decision.pattern.pattern}`);
      console.log(`  Direction: ${decision.pattern.direction}`);
      console.log(`  Confidence: ${decision.pattern.confidence}%`);
    }

    console.log("\n" + "─".repeat(50));
    console.log(`Trend: ${decision.trend.direction}`);
    console.log(`  Strength: ${decision.trend.strength.toFixed(0)}%`);
    console.log(`  Support: $${decision.trend.support.toFixed(6)}`);
    console.log(`  Resistance: $${decision.trend.resistance.toFixed(6)}`);
  } catch (error) {
    console.error("\n❌ Analysis failed:", error);
    process.exit(1);
  }
}

async function runQuick(args: string[]) {
  if (args.length === 0) {
    console.error("Error: Please provide a token symbol");
    process.exit(1);
  }

  const symbol = args[0];
  const options = parseOptions(args.slice(1));

  console.log(`\n⚡ QuantAgent - Quick Signal`);
  console.log(`Token: ${symbol}`);
  console.log("─".repeat(40));

  try {
    const result = await quickSignal(symbol, {
      address: options.address,
      chain: options.chain as "solana" | "ethereum" | "base" | undefined,
      timeframe: options.timeframe as "1h" | "4h" | "1d" | undefined,
      provider: options.provider as "anthropic" | "openai" | undefined,
    });

    const signalEmoji =
      result.signal === "bullish"
        ? "🟢"
        : result.signal === "bearish"
          ? "🔴"
          : "🟡";

    console.log(`\n${signalEmoji} Signal: ${result.signal.toUpperCase()}`);
    console.log(`📈 Confidence: ${result.confidence}%`);
    console.log(`\n📝 ${result.summary}`);
  } catch (error) {
    console.error("\n❌ Quick signal failed:", error);
    process.exit(1);
  }
}

function parseOptions(args: string[]): Record<string, string | undefined> {
  const options: Record<string, string | undefined> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--timeframe" || arg === "-t") {
      options.timeframe = args[++i];
    } else if (arg === "--address" || arg === "-a") {
      options.address = args[++i];
    } else if (arg === "--chain" || arg === "-c") {
      options.chain = args[++i];
    } else if (arg === "--provider" || arg === "-p") {
      options.provider = args[++i];
    }
  }

  return options;
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
