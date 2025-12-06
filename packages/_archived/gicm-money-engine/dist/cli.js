#!/usr/bin/env node
import {
  MoneyEngine
} from "./chunk-QBPOC57N.js";

// src/cli.ts
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { Keypair } from "@solana/web3.js";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
var program = new Command();
program.name("gicm-money").description("gICM Money Engine - Self-funding system").version("1.0.0");
program.command("start").description("Start the money engine").option("-m, --mode <mode>", "Trading mode: paper, micro, live", "paper").option("--no-trading", "Disable trading bots").option("--no-autopay", "Disable auto-pay expenses").action(async (options) => {
  console.log(chalk.cyan.bold("\n\u{1F4B0} gICM Money Engine\n"));
  const keypair = loadKeypair();
  if (!keypair) {
    console.log(chalk.red("Error: GICM_PRIVATE_KEY not set"));
    console.log(chalk.gray("Set it in .env or environment"));
    process.exit(1);
  }
  const engine = new MoneyEngine(
    {
      rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      tradingMode: options.mode,
      enableTrading: options.trading,
      dcaAmountPerBuy: parseInt(process.env.DCA_AMOUNT_PER_BUY || "10"),
      dcaSchedule: process.env.DCA_SCHEDULE || "0 */4 * * *",
      autoPayExpenses: options.autopay
    },
    keypair
  );
  const spinner = ora("Starting money engine...").start();
  try {
    await engine.start();
    spinner.succeed("Money engine started!");
    console.log(chalk.gray("\nPress Ctrl+C to stop\n"));
    process.on("SIGINT", async () => {
      console.log(chalk.yellow("\n\nShutting down..."));
      await engine.stop();
      process.exit(0);
    });
    await new Promise(() => {
    });
  } catch (error) {
    spinner.fail(`Failed to start: ${error}`);
    process.exit(1);
  }
});
program.command("status").description("Show financial status").action(async () => {
  console.log(chalk.cyan.bold("\n\u{1F4B0} gICM Financial Status\n"));
  const keypair = loadKeypair();
  if (!keypair) {
    console.log(chalk.red("Error: GICM_PRIVATE_KEY not set"));
    process.exit(1);
  }
  const engine = new MoneyEngine(
    {
      rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      tradingMode: "paper",
      enableTrading: false,
      dcaAmountPerBuy: 0,
      dcaSchedule: "",
      autoPayExpenses: false
    },
    keypair
  );
  await engine.printStatus();
});
program.command("expenses").description("Show expense breakdown").action(async () => {
  console.log(chalk.cyan.bold("\n\u{1F4E4} gICM Expenses\n"));
  const keypair = loadKeypair();
  if (!keypair) {
    console.log(chalk.white("Monthly Expenses (estimated):"));
    console.log(chalk.gray("\u2500".repeat(40)));
    console.log(`  Claude API:    ${chalk.yellow("$200")}/month`);
    console.log(`  Helius RPC:    ${chalk.yellow("$50")}/month`);
    console.log(`  Vercel Pro:    ${chalk.yellow("$20")}/month`);
    console.log(`  Domain:        ${chalk.yellow("$1.25")}/month`);
    console.log(chalk.gray("\u2500".repeat(40)));
    console.log(`  ${chalk.bold("Total:")}         ${chalk.green("$271.25")}/month`);
    console.log();
    return;
  }
  const engine = new MoneyEngine(
    {
      rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      tradingMode: "paper",
      enableTrading: false,
      dcaAmountPerBuy: 0,
      dcaSchedule: "",
      autoPayExpenses: true
    },
    keypair
  );
  engine.getExpenseManager().addDefaultExpenses();
  const expenses = engine.getExpenseManager().getExpenses();
  console.log(chalk.white("Configured Expenses:"));
  console.log(chalk.gray("\u2500".repeat(50)));
  for (const expense of expenses) {
    const freq = expense.frequency || "one-time";
    console.log(
      `  ${expense.name.padEnd(20)} ${chalk.yellow(`$${expense.amount}`.padStart(8))} /${freq}`
    );
  }
  console.log(chalk.gray("\u2500".repeat(50)));
  console.log(
    `  ${chalk.bold("Monthly Total:".padEnd(20))} ${chalk.green(
      `$${engine.getExpenseManager().getMonthlyTotal().toFixed(2)}`.padStart(8)
    )}`
  );
  console.log();
});
program.command("trade").description("Trigger manual trade (DCA)").action(async () => {
  console.log(chalk.cyan.bold("\n\u{1F4C8} Manual Trade\n"));
  const keypair = loadKeypair();
  if (!keypair) {
    console.log(chalk.red("Error: GICM_PRIVATE_KEY not set"));
    process.exit(1);
  }
  const engine = new MoneyEngine(
    {
      rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      tradingMode: "paper",
      enableTrading: true,
      dcaAmountPerBuy: parseInt(process.env.DCA_AMOUNT_PER_BUY || "10"),
      dcaSchedule: "0 0 1 1 *",
      // Never (manual only)
      autoPayExpenses: false
    },
    keypair
  );
  const spinner = ora("Starting engine...").start();
  try {
    await engine.start();
    spinner.text = "Triggering DCA...";
    await engine.triggerDCA();
    spinner.succeed("Trade executed!");
    await engine.stop();
  } catch (error) {
    spinner.fail(`Trade failed: ${error}`);
  }
});
function loadKeypair() {
  const privateKey = process.env.GICM_PRIVATE_KEY;
  if (!privateKey) return null;
  try {
    const bytes = Buffer.from(privateKey, "base64");
    if (bytes.length === 64) {
      return Keypair.fromSecretKey(bytes);
    }
    const array = JSON.parse(privateKey);
    return Keypair.fromSecretKey(Uint8Array.from(array));
  } catch {
    return null;
  }
}
program.parse();
