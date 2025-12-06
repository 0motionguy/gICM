#!/usr/bin/env node
/**
 * gICM Product Engine CLI
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { config as dotenvConfig } from "dotenv";
import { ProductEngine } from "./index.js";
import type { AgentSpec, AgentCategory } from "./core/types.js";

dotenvConfig();

const program = new Command();

program
  .name("gicm-product")
  .description("gICM Product Engine - Automated product development")
  .version("1.0.0");

program
  .command("start")
  .description("Start the product engine")
  .option("--no-discovery", "Disable discovery")
  .option("--no-auto-build", "Disable auto-building")
  .action(async (options: { discovery: boolean; autoBuild: boolean }) => {
    console.log(chalk.cyan.bold("\n🔧 gICM Product Engine\n"));

    const engine = new ProductEngine({
      enableDiscovery: options.discovery,
      discoveryInterval: process.env.DISCOVERY_INTERVAL || "0 */6 * * *", // Every 6 hours
      enableAutoBuilding: options.autoBuild,
      autoApproveThreshold: parseInt(process.env.AUTO_APPROVE_THRESHOLD || "80"),
      enableAutoDeploy: process.env.ENABLE_AUTO_DEPLOY === "true",
      deployToStaging: process.env.DEPLOY_TO_STAGING !== "false",
      deployToProduction: process.env.DEPLOY_TO_PRODUCTION === "true",
    });

    const spinner = ora("Starting engine...").start();

    try {
      await engine.start();
      spinner.succeed("Product engine started!");

      console.log(chalk.gray("\nPress Ctrl+C to stop\n"));

      process.on("SIGINT", async () => {
        console.log(chalk.yellow("\n\nShutting down..."));
        await engine.stop();
        process.exit(0);
      });

      // Keep process running
      await new Promise(() => {});
    } catch (error) {
      spinner.fail(`Failed to start: ${error}`);
      process.exit(1);
    }
  });

program
  .command("discover")
  .description("Run discovery cycle")
  .action(async () => {
    console.log(chalk.cyan.bold("\n🔍 Running Discovery\n"));

    const engine = new ProductEngine({
      enableDiscovery: true,
      discoveryInterval: "",
      enableAutoBuilding: false,
      autoApproveThreshold: 80,
      enableAutoDeploy: false,
      deployToStaging: false,
      deployToProduction: false,
    });

    const spinner = ora("Scanning sources...").start();

    try {
      const opportunities = await engine.runDiscovery();
      spinner.succeed(`Found ${opportunities.length} opportunities`);

      if (opportunities.length > 0) {
        console.log("\nTop opportunities:");
        for (const opp of opportunities.slice(0, 5)) {
          const icon = opp.priority === "high" || opp.priority === "critical" ? "🔴" : "🟡";
          console.log(`  ${icon} ${opp.title} (score: ${opp.scores.overall})`);
        }
      }
      console.log();
    } catch (error) {
      spinner.fail(`Discovery failed: ${error}`);
    }
  });

program
  .command("backlog")
  .description("Show backlog")
  .action(async () => {
    console.log(chalk.cyan.bold("\n📋 Product Backlog\n"));

    const engine = new ProductEngine({
      enableDiscovery: false,
      discoveryInterval: "",
      enableAutoBuilding: false,
      autoApproveThreshold: 80,
      enableAutoDeploy: false,
      deployToStaging: false,
      deployToProduction: false,
    });

    const backlog = engine.getBacklog();

    if (backlog.length === 0) {
      console.log(chalk.gray("Backlog is empty. Run 'gicm-product discover' first.\n"));
      return;
    }

    console.log(`Total: ${backlog.length} items\n`);

    for (const opp of backlog) {
      const priorityIcon: Record<string, string> = {
        critical: "🔴",
        high: "🟠",
        medium: "🟡",
        low: "🟢",
      };

      console.log(`${priorityIcon[opp.priority]} [${opp.status}] ${opp.title}`);
      console.log(`   Score: ${opp.scores.overall} | Source: ${opp.source}`);
      console.log();
    }
  });

program
  .command("build-agent")
  .description("Build a new agent interactively")
  .action(async () => {
    console.log(chalk.cyan.bold("\n🤖 Agent Builder\n"));

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Agent name:",
        validate: (input: string) => input.length > 0 || "Name is required",
      },
      {
        type: "input",
        name: "description",
        message: "Description:",
        validate: (input: string) => input.length > 0 || "Description is required",
      },
      {
        type: "list",
        name: "category",
        message: "Category:",
        choices: [
          "trading",
          "research",
          "content",
          "automation",
          "analytics",
          "social",
          "development",
        ],
      },
      {
        type: "input",
        name: "capabilities",
        message: "Capabilities (comma-separated):",
      },
    ]);

    const spec: AgentSpec = {
      name:
        answers.name.replace(/\s+/g, "") + (answers.name.endsWith("Agent") ? "" : "Agent"),
      slug:
        answers.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/agent$/, "") + "-agent",
      description: answers.description,
      category: answers.category as AgentCategory,
      capabilities: answers.capabilities
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean),
      inputs: [
        {
          name: "input",
          type: "Record<string, any>",
          description: "Agent input",
          required: true,
        },
      ],
      outputs: [{ name: "result", type: "Record<string, any>", description: "Agent output" }],
      dependencies: [],
      apis: [],
      defaultConfig: {},
      version: "1.0.0",
      author: "gICM",
      license: "MIT",
    };

    const engine = new ProductEngine({
      enableDiscovery: false,
      discoveryInterval: "",
      enableAutoBuilding: false,
      autoApproveThreshold: 80,
      enableAutoDeploy: false,
      deployToStaging: false,
      deployToProduction: false,
    });

    const spinner = ora("Building agent...").start();

    try {
      await engine.buildAgent(spec);
      spinner.succeed("Agent built successfully!");
    } catch (error) {
      spinner.fail(`Build failed: ${error}`);
    }
  });

program
  .command("status")
  .description("Show engine status")
  .action(() => {
    console.log(chalk.cyan.bold("\n🔧 gICM Product Engine Status\n"));

    const engine = new ProductEngine({
      enableDiscovery: false,
      discoveryInterval: "",
      enableAutoBuilding: false,
      autoApproveThreshold: 80,
      enableAutoDeploy: false,
      deployToStaging: false,
      deployToProduction: false,
    });

    engine.printStatus();
  });

program.parse();
