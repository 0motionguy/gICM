#!/usr/bin/env node
#!/usr/bin/env node

// src/index.ts
async function analyzeToken(symbol, options) {
  const graph = createTradingGraph({
    provider: options?.provider || "anthropic",
    model: options?.model,
    showLogs: true
  });
  return graph.analyze({
    token: {
      symbol: symbol.toUpperCase(),
      name: symbol,
      address: options?.address,
      chain: options?.chain || "solana"
    },
    timeframe: options?.timeframe || "4h"
  });
}
async function quickSignal(symbol, options) {
  const graph = createTradingGraph({
    provider: options?.provider || "anthropic",
    showLogs: false
  });
  return graph.quickAnalysis({
    token: {
      symbol: symbol.toUpperCase(),
      name: symbol,
      address: options?.address,
      chain: options?.chain || "solana"
    },
    timeframe: options?.timeframe || "4h"
  });
}

// src/cli.ts
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
async function runAnalyze(args) {
  if (args.length === 0) {
    console.error("Error: Please provide a token symbol");
    process.exit(1);
  }
  const symbol = args[0];
  const options = parseOptions(args.slice(1));
  console.log(`
\u{1F680} QuantAgent - Full Analysis`);
  console.log(`Token: ${symbol}`);
  console.log(`Timeframe: ${options.timeframe || "4h"}`);
  console.log(`Chain: ${options.chain || "solana"}`);
  console.log("\u2500".repeat(50));
  try {
    const decision = await analyzeToken(symbol, {
      address: options.address,
      chain: options.chain,
      timeframe: options.timeframe,
      provider: options.provider
    });
    console.log("\n" + "\u2550".repeat(50));
    console.log("\u{1F4CA} TRADE DECISION");
    console.log("\u2550".repeat(50));
    const actionEmoji = {
      LONG: "\u{1F7E2}",
      SHORT: "\u{1F534}",
      HOLD: "\u{1F7E1}",
      EXIT: "\u26AA"
    };
    console.log(
      `
${actionEmoji[decision.action]} Action: ${decision.action}`
    );
    console.log(`\u{1F4C8} Confidence: ${decision.confidence}%`);
    console.log(`
\u{1F4B0} Entry: $${decision.entryPrice.toFixed(6)}`);
    console.log(`\u{1F6D1} Stop Loss: $${decision.stopLoss.toFixed(6)}`);
    console.log(`\u{1F3AF} Take Profit: $${decision.takeProfit.toFixed(6)}`);
    console.log(`\u2696\uFE0F Risk/Reward: ${decision.risk.rewardRatio.toFixed(2)}`);
    console.log(`
\u{1F4DD} Rationale: ${decision.rationale}`);
    if (decision.risk.warnings.length > 0) {
      console.log(`
\u26A0\uFE0F Warnings:`);
      decision.risk.warnings.forEach((w) => console.log(`   - ${w}`));
    }
    console.log("\n" + "\u2500".repeat(50));
    console.log("Indicators:");
    decision.indicators.forEach((ind) => {
      const signalEmoji = ind.signal === "bullish" ? "\u{1F7E2}" : ind.signal === "bearish" ? "\u{1F534}" : "\u{1F7E1}";
      console.log(
        `  ${signalEmoji} ${ind.name}: ${ind.signal} (${ind.strength.toFixed(0)}%)`
      );
    });
    if (decision.pattern) {
      console.log("\n" + "\u2500".repeat(50));
      console.log(`Pattern: ${decision.pattern.pattern}`);
      console.log(`  Direction: ${decision.pattern.direction}`);
      console.log(`  Confidence: ${decision.pattern.confidence}%`);
    }
    console.log("\n" + "\u2500".repeat(50));
    console.log(`Trend: ${decision.trend.direction}`);
    console.log(`  Strength: ${decision.trend.strength.toFixed(0)}%`);
    console.log(`  Support: $${decision.trend.support.toFixed(6)}`);
    console.log(`  Resistance: $${decision.trend.resistance.toFixed(6)}`);
  } catch (error) {
    console.error("\n\u274C Analysis failed:", error);
    process.exit(1);
  }
}
async function runQuick(args) {
  if (args.length === 0) {
    console.error("Error: Please provide a token symbol");
    process.exit(1);
  }
  const symbol = args[0];
  const options = parseOptions(args.slice(1));
  console.log(`
\u26A1 QuantAgent - Quick Signal`);
  console.log(`Token: ${symbol}`);
  console.log("\u2500".repeat(40));
  try {
    const result = await quickSignal(symbol, {
      address: options.address,
      chain: options.chain,
      timeframe: options.timeframe,
      provider: options.provider
    });
    const signalEmoji = result.signal === "bullish" ? "\u{1F7E2}" : result.signal === "bearish" ? "\u{1F534}" : "\u{1F7E1}";
    console.log(`
${signalEmoji} Signal: ${result.signal.toUpperCase()}`);
    console.log(`\u{1F4C8} Confidence: ${result.confidence}%`);
    console.log(`
\u{1F4DD} ${result.summary}`);
  } catch (error) {
    console.error("\n\u274C Quick signal failed:", error);
    process.exit(1);
  }
}
function parseOptions(args) {
  const options = {};
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
