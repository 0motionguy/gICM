#!/usr/bin/env node
import {
  GICMOrchestrator
} from "./chunk-6FHMYDJF.js";

// src/cli.ts
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
var program = new Command();
program.name("gicm").description("gICM Orchestrator - The Brain").version("0.1.0");
var orchestrator = null;
function loadConfig() {
  return {
    autonomyLevel: process.env.GICM_AUTONOMY_LEVEL ?? "supervised",
    hunter: {
      enabled: true,
      sources: ["github", "hackernews", "twitter"],
      githubToken: process.env.GITHUB_TOKEN,
      apifyToken: process.env.APIFY_TOKEN
    },
    decision: {
      llmProvider: process.env.LLM_PROVIDER ?? "anthropic",
      apiKey: process.env.LLM_API_KEY ?? "",
      model: process.env.LLM_MODEL,
      autoApproveThreshold: 85
    },
    activityLogger: {
      solanaRpcUrl: process.env.SOLANA_RPC_URL,
      solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY,
      enableArweave: !!process.env.SOLANA_PRIVATE_KEY
    }
  };
}
program.command("start").description("Start the gICM orchestrator").option("--auto", "Run in fully autonomous mode", false).option("--supervised", "Run in supervised mode (default)", true).option("--sources <sources>", "Hunt sources (comma-separated)", "github,hackernews,twitter").action(async (options) => {
  const config = loadConfig();
  if (options.auto) {
    config.autonomyLevel = "autonomous";
  } else if (options.supervised) {
    config.autonomyLevel = "supervised";
  }
  config.hunter.sources = options.sources.split(",");
  console.log(chalk.cyan("\n\u{1F9E0} gICM Orchestrator - The Brain\n"));
  console.log(chalk.gray(`Autonomy Level: ${chalk.yellow(config.autonomyLevel)}`));
  console.log(chalk.gray(`Hunt Sources: ${chalk.yellow(config.hunter.sources.join(", "))}`));
  console.log(chalk.gray(`LLM Provider: ${chalk.yellow(config.decision.llmProvider)}`));
  console.log();
  if (!config.decision.apiKey) {
    console.error(chalk.red("Error: LLM_API_KEY environment variable is required"));
    process.exit(1);
  }
  orchestrator = new GICMOrchestrator(config);
  orchestrator.on("started", () => {
    console.log(chalk.green("\u2713 Orchestrator started"));
  });
  orchestrator.on("hunt:started", () => {
    console.log(chalk.blue("\u{1F50D} Hunt started..."));
  });
  orchestrator.on("hunt:completed", (discoveries) => {
    console.log(chalk.green(`\u2713 Hunt completed: ${discoveries.length} discoveries`));
  });
  orchestrator.on("discovery:found", (discovery) => {
    console.log(chalk.cyan(`  \u2192 Found: ${discovery.title} (${discovery.source})`));
  });
  orchestrator.on("decision:made", ({ discovery, result, status }) => {
    const statusColor = status === "auto_approve" ? chalk.green : status === "human_review" ? chalk.yellow : chalk.red;
    console.log(
      `  \u2192 Decision: ${discovery.title} - ${result.totalScore}/100 [${statusColor(status)}]`
    );
  });
  orchestrator.on("approval:required", (approval) => {
    console.log(
      chalk.yellow(`
\u23F3 Approval required: ${approval.title} (${approval.score}/100)`)
    );
    console.log(chalk.gray(`   Run: gicm approve ${approval.id}`));
  });
  try {
    await orchestrator.start();
    console.log(chalk.green("\n\u2713 Orchestrator is running. Press Ctrl+C to stop.\n"));
    process.on("SIGINT", async () => {
      console.log(chalk.yellow("\n\nShutting down..."));
      await orchestrator?.stop();
      process.exit(0);
    });
    await new Promise(() => {
    });
  } catch (error) {
    console.error(chalk.red("Failed to start orchestrator:"), error);
    process.exit(1);
  }
});
program.command("hunt").description("Trigger an immediate hunt for opportunities").option("--sources <sources>", "Hunt sources (comma-separated)", "github,hackernews,twitter").option("--limit <n>", "Max discoveries per source", "30").action(async (options) => {
  const config = loadConfig();
  config.hunter.sources = options.sources.split(",");
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
    if (discoveries.length > 0) {
      console.log(chalk.cyan("\nTop Discoveries:"));
      for (const d of discoveries.slice(0, 10)) {
        console.log(
          `  ${chalk.yellow(d.source)} | ${d.title.slice(0, 60)}...`
        );
        console.log(chalk.gray(`    ${d.sourceUrl}`));
      }
    }
    const approvals = orchestrator.getPendingApprovals();
    if (approvals.length > 0) {
      console.log(chalk.yellow(`
${approvals.length} items pending approval:`));
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
program.command("status").description("Show orchestrator status").option("--json", "Output as JSON").action(async (options) => {
  const config = loadConfig();
  orchestrator = new GICMOrchestrator(config);
  const status = orchestrator.getStatus();
  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log(chalk.cyan("\n\u{1F9E0} gICM Orchestrator Status\n"));
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
program.command("approve <id>").description("Approve a pending decision").option("-r, --reason <reason>", "Approval reason").option("--all", "Approve all pending decisions").action(async (id, options) => {
  const config = loadConfig();
  orchestrator = new GICMOrchestrator(config);
  console.log(chalk.green(`\u2713 Approved: ${id}`));
  if (options.reason) {
    console.log(chalk.gray(`  Reason: ${options.reason}`));
  }
});
program.command("reject <id>").description("Reject a pending decision").option("-r, --reason <reason>", "Rejection reason", "Not relevant").action(async (id, options) => {
  console.log(chalk.red(`\u2717 Rejected: ${id}`));
  console.log(chalk.gray(`  Reason: ${options.reason}`));
});
program.command("logs").description("View activity logs").option("--type <type>", "Filter by type (discovery, decision, build, deployment)").option("--limit <n>", "Max logs to show", "20").option("--since <date>", "Show logs since date").option("--onchain", "Fetch from on-chain logs").action(async (options) => {
  console.log(chalk.cyan("\n\u{1F4CB} Activity Logs\n"));
  console.log(chalk.gray("No logs available. Start the orchestrator first."));
  if (options.type) {
    console.log(chalk.gray(`Filter: type=${options.type}`));
  }
  if (options.since) {
    console.log(chalk.gray(`Filter: since=${options.since}`));
  }
});
program.parse();
//# sourceMappingURL=cli.js.map