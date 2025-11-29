#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { GICMOrchestrator } from "./orchestrator.js";
import type { AutonomyLevel, OrchestratorConfig } from "./types.js";

const program = new Command();

program
  .name("gicm")
  .description("gICM Orchestrator - The Brain")
  .version("0.1.0");

// Global orchestrator instance
let orchestrator: GICMOrchestrator | null = null;

function loadConfig(): OrchestratorConfig {
  return {
    autonomyLevel: (process.env.GICM_AUTONOMY_LEVEL as AutonomyLevel) ?? "supervised",
    hunter: {
      enabled: true,
      sources: ["github", "hackernews", "twitter"],
      githubToken: process.env.GITHUB_TOKEN,
      apifyToken: process.env.APIFY_TOKEN,
    },
    decision: {
      llmProvider: (process.env.LLM_PROVIDER as "openai" | "anthropic" | "gemini") ?? "anthropic",
      apiKey: process.env.LLM_API_KEY ?? "",
      model: process.env.LLM_MODEL,
      autoApproveThreshold: 85,
    },
    activityLogger: {
      solanaRpcUrl: process.env.SOLANA_RPC_URL,
      solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY,
      enableArweave: !!process.env.SOLANA_PRIVATE_KEY,
    },
  };
}

// Start command
program
  .command("start")
  .description("Start the gICM orchestrator")
  .option("--auto", "Run in fully autonomous mode", false)
  .option("--supervised", "Run in supervised mode (default)", true)
  .option("--sources <sources>", "Hunt sources (comma-separated)", "github,hackernews,twitter")
  .action(async (options) => {
    const config = loadConfig();

    if (options.auto) {
      config.autonomyLevel = "autonomous";
    } else if (options.supervised) {
      config.autonomyLevel = "supervised";
    }

    config.hunter.sources = options.sources.split(",") as typeof config.hunter.sources;

    console.log(chalk.cyan("\n🧠 gICM Orchestrator - The Brain\n"));
    console.log(chalk.gray(`Autonomy Level: ${chalk.yellow(config.autonomyLevel)}`));
    console.log(chalk.gray(`Hunt Sources: ${chalk.yellow(config.hunter.sources.join(", "))}`));
    console.log(chalk.gray(`LLM Provider: ${chalk.yellow(config.decision.llmProvider)}`));
    console.log();

    if (!config.decision.apiKey) {
      console.error(chalk.red("Error: LLM_API_KEY environment variable is required"));
      process.exit(1);
    }

    orchestrator = new GICMOrchestrator(config);

    // Event handlers
    orchestrator.on("started", () => {
      console.log(chalk.green("✓ Orchestrator started"));
    });

    orchestrator.on("hunt:started", () => {
      console.log(chalk.blue("🔍 Hunt started..."));
    });

    orchestrator.on("hunt:completed", (discoveries: unknown[]) => {
      console.log(chalk.green(`✓ Hunt completed: ${discoveries.length} discoveries`));
    });

    orchestrator.on("discovery:found", (discovery: { title: string; source: string }) => {
      console.log(chalk.cyan(`  → Found: ${discovery.title} (${discovery.source})`));
    });

    orchestrator.on("decision:made", ({ discovery, result, status }: {
      discovery: { title: string };
      result: { totalScore: number };
      status: string;
    }) => {
      const statusColor =
        status === "auto_approve"
          ? chalk.green
          : status === "human_review"
            ? chalk.yellow
            : chalk.red;
      console.log(
        `  → Decision: ${discovery.title} - ${result.totalScore}/100 [${statusColor(status)}]`
      );
    });

    orchestrator.on("approval:required", (approval: { id: string; title: string; score: number }) => {
      console.log(
        chalk.yellow(`\n⏳ Approval required: ${approval.title} (${approval.score}/100)`)
      );
      console.log(chalk.gray(`   Run: gicm approve ${approval.id}`));
    });

    try {
      await orchestrator.start();
      console.log(chalk.green("\n✓ Orchestrator is running. Press Ctrl+C to stop.\n"));

      // Handle shutdown
      process.on("SIGINT", async () => {
        console.log(chalk.yellow("\n\nShutting down..."));
        await orchestrator?.stop();
        process.exit(0);
      });

      // Keep process alive
      await new Promise(() => {});
    } catch (error) {
      console.error(chalk.red("Failed to start orchestrator:"), error);
      process.exit(1);
    }
  });

// Hunt command
program
  .command("hunt")
  .description("Trigger an immediate hunt for opportunities")
  .option("--sources <sources>", "Hunt sources (comma-separated)", "github,hackernews,twitter")
  .option("--limit <n>", "Max discoveries per source", "30")
  .action(async (options) => {
    const config = loadConfig();
    config.hunter.sources = options.sources.split(",") as typeof config.hunter.sources;

    const spinner = ora("Initializing...").start();

    if (!config.decision.apiKey) {
      spinner.fail("LLM_API_KEY environment variable is required");
      process.exit(1);
    }

    orchestrator = new GICMOrchestrator(config);

    try {
      spinner.text = "Starting orchestrator...";
      await orchestrator.start();

      spinner.text = `Hunting on ${config.hunter.sources.join(", ")}...`;
      const discoveries = await orchestrator.huntNow(config.hunter.sources);

      spinner.succeed(`Found ${discoveries.length} discoveries`);

      // Show results
      if (discoveries.length > 0) {
        console.log(chalk.cyan("\nTop Discoveries:"));
        for (const d of discoveries.slice(0, 10)) {
          console.log(
            `  ${chalk.yellow(d.source)} | ${d.title.slice(0, 60)}...`
          );
          console.log(chalk.gray(`    ${d.sourceUrl}`));
        }
      }

      // Show pending approvals
      const approvals = orchestrator.getPendingApprovals();
      if (approvals.length > 0) {
        console.log(chalk.yellow(`\n${approvals.length} items pending approval:`));
        for (const a of approvals) {
          console.log(`  ${chalk.cyan(a.id)} | ${a.title} (${a.score}/100)`);
        }
        console.log(chalk.gray("\nRun: gicm approve <id> to approve"));
      }

      await orchestrator.stop();
    } catch (error) {
      spinner.fail("Hunt failed");
      console.error(error);
      process.exit(1);
    }
  });

// Status command
program
  .command("status")
  .description("Show orchestrator status")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const config = loadConfig();
    orchestrator = new GICMOrchestrator(config);

    const status = orchestrator.getStatus();

    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(chalk.cyan("\n🧠 gICM Orchestrator Status\n"));
      console.log(`State: ${chalk.yellow(status.state)}`);
      console.log(`Autonomy: ${chalk.yellow(status.autonomyLevel)}`);
      console.log(`Pending Approvals: ${chalk.yellow(status.pendingApprovals)}`);
      console.log(`Active Jobs: ${chalk.yellow(status.activeJobs.join(", ") || "none")}`);

      if (status.stats) {
        console.log(chalk.cyan("\nActivity Stats:"));
        console.log(`  Activities: ${status.stats.activities}`);
        console.log(`  Discoveries: ${status.stats.discoveries}`);
        console.log(`  Pending Decisions: ${status.stats.pendingDecisions}`);
        console.log(
          `  Sync Queue: Solana=${status.stats.syncQueue.solana}, Arweave=${status.stats.syncQueue.arweave}`
        );
      }
    }
  });

// Approve command
program
  .command("approve <id>")
  .description("Approve a pending decision")
  .option("-r, --reason <reason>", "Approval reason")
  .option("--all", "Approve all pending decisions")
  .action(async (id, options) => {
    const config = loadConfig();
    orchestrator = new GICMOrchestrator(config);

    // For --all, we'd need to load pending approvals from database
    // For now, this is a placeholder

    console.log(chalk.green(`✓ Approved: ${id}`));
    if (options.reason) {
      console.log(chalk.gray(`  Reason: ${options.reason}`));
    }
  });

// Reject command
program
  .command("reject <id>")
  .description("Reject a pending decision")
  .option("-r, --reason <reason>", "Rejection reason", "Not relevant")
  .action(async (id, options) => {
    console.log(chalk.red(`✗ Rejected: ${id}`));
    console.log(chalk.gray(`  Reason: ${options.reason}`));
  });

// Logs command
program
  .command("logs")
  .description("View activity logs")
  .option("--type <type>", "Filter by type (discovery, decision, build, deployment)")
  .option("--limit <n>", "Max logs to show", "20")
  .option("--since <date>", "Show logs since date")
  .option("--onchain", "Fetch from on-chain logs")
  .action(async (options) => {
    console.log(chalk.cyan("\n📋 Activity Logs\n"));

    // Placeholder - would read from SQLite database
    console.log(chalk.gray("No logs available. Start the orchestrator first."));

    if (options.type) {
      console.log(chalk.gray(`Filter: type=${options.type}`));
    }
    if (options.since) {
      console.log(chalk.gray(`Filter: since=${options.since}`));
    }
  });

program.parse();
