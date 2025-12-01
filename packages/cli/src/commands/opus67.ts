/**
 * OPUS67 CLI Commands
 * Self-Evolving AI Runtime integration
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";

export function registerOpus67Commands(program: Command): void {
  const opus67 = program
    .command("opus67")
    .description("OPUS67 Self-Evolving AI Runtime (48 Skills, 21 MCPs, 10 Modes)");

  // gicm opus67 boot - Show boot screen
  opus67
    .command("boot")
    .description("Display OPUS67 boot screen with system status")
    .action(async () => {
      try {
        const { opus67: runtime } = await import("@gicm/opus67");
        console.log(runtime.boot());
      } catch (error) {
        console.error(chalk.red(`Failed to load OPUS67: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // gicm opus67 mode [name] - Get/set mode
  opus67
    .command("mode [name]")
    .description("Get current mode or set a new mode")
    .action(async (name?: string) => {
      try {
        const { opus67: runtime, getAllModes } = await import("@gicm/opus67");

        if (name) {
          const validModes = ["ultra", "think", "build", "vibe", "light", "creative", "data", "audit", "swarm", "auto"];
          if (!validModes.includes(name.toLowerCase())) {
            console.error(chalk.red(`Invalid mode: ${name}`));
            console.log(chalk.gray(`Valid modes: ${validModes.join(", ")}`));
            process.exit(1);
          }
          runtime.setMode(name.toLowerCase() as any);
          console.log(chalk.green(`Mode set to: ${name.toUpperCase()}`));
        } else {
          const currentMode = runtime.getMode();
          console.log(chalk.bold(`Current mode: ${currentMode.toUpperCase()}`));
          console.log();
          console.log(chalk.bold("Available modes:"));

          const modes = getAllModes();
          modes.forEach(({ id, mode }) => {
            const isCurrent = id === currentMode;
            const indicator = isCurrent ? chalk.green("→ ") : "  ";
            console.log(`${indicator}${mode.icon} ${chalk.bold(mode.name.toUpperCase())} - ${mode.description}`);
          });
        }
      } catch (error) {
        console.error(chalk.red(`Failed to load OPUS67: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // gicm opus67 skills [query] - List/search skills
  opus67
    .command("skills [query]")
    .description("List all skills or search by keyword")
    .option("-t, --tier <tier>", "Filter by tier (1, 2, or 3)")
    .action(async (query?: string, options?: { tier?: string }) => {
      const spinner = ora("Loading skills...").start();

      try {
        const { loadSkills } = await import("@gicm/opus67");

        const result = loadSkills({ query: query || "" });
        spinner.stop();

        if (query) {
          console.log(chalk.bold(`Skills matching "${query}":`));
        } else {
          console.log(chalk.bold("All OPUS67 Skills (48):"));
        }
        console.log();

        const table = new Table({
          head: [chalk.cyan("ID"), chalk.cyan("Name"), chalk.cyan("Tier"), chalk.cyan("Tokens")],
          colWidths: [30, 35, 8, 10],
        });

        let skills = result.skills;
        if (options?.tier) {
          skills = skills.filter((s) => s.tier === parseInt(options.tier!, 10));
        }

        skills.forEach((skill) => {
          table.push([
            skill.id,
            skill.name,
            `T${skill.tier}`,
            skill.token_cost.toString(),
          ]);
        });

        console.log(table.toString());
        console.log();
        console.log(chalk.gray(`Total: ${skills.length} skills, ${result.totalTokenCost} tokens`));
      } catch (error) {
        spinner.fail(chalk.red("Failed to load skills"));
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // gicm opus67 mcps - List MCP connections
  opus67
    .command("mcps")
    .description("List all MCP connections (21)")
    .option("-c, --category <category>", "Filter by category (blockchain, social, data, productivity)")
    .action(async (options?: { category?: string }) => {
      const spinner = ora("Loading MCP connections...").start();

      try {
        const { getAllConnections } = await import("@gicm/opus67");

        let connections = getAllConnections();
        spinner.stop();

        if (options?.category) {
          connections = connections.filter(
            (c) => c.connection.category.toLowerCase() === options.category!.toLowerCase()
          );
        }

        console.log(chalk.bold("OPUS67 MCP Connections (21):"));
        console.log();

        const table = new Table({
          head: [chalk.cyan("ID"), chalk.cyan("Name"), chalk.cyan("Type"), chalk.cyan("Category")],
          colWidths: [20, 30, 15, 15],
        });

        connections.forEach(({ id, connection }) => {
          table.push([
            id,
            connection.name,
            connection.type,
            connection.category,
          ]);
        });

        console.log(table.toString());
        console.log();
        console.log(chalk.gray(`Total: ${connections.length} connections`));
      } catch (error) {
        spinner.fail(chalk.red("Failed to load MCPs"));
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // gicm opus67 process <query> - Process a query
  opus67
    .command("process <query>")
    .description("Process a query with automatic mode detection")
    .option("-m, --mode <mode>", "Force specific mode")
    .option("-v, --verbose", "Show detailed output")
    .action(async (query: string, options?: { mode?: string; verbose?: boolean }) => {
      const spinner = ora("Processing query...").start();

      try {
        const { opus67: runtime } = await import("@gicm/opus67");

        if (options?.mode) {
          runtime.setMode(options.mode as any);
        }

        const session = runtime.process(query);
        spinner.stop();

        console.log(chalk.bold("OPUS67 Session:"));
        console.log();
        console.log(`${chalk.cyan("Mode:")} ${session.modeConfig.icon} ${session.mode.toUpperCase()}`);
        console.log(`${chalk.cyan("Skills:")} ${session.skills.skills.map((s) => s.id).join(", ")}`);
        console.log(`${chalk.cyan("MCPs:")} ${session.mcpConnections.map((m) => m.id).join(", ") || "none"}`);
        console.log(`${chalk.cyan("Token Budget:")} ${session.modeConfig.token_budget}`);

        if (options?.verbose) {
          console.log();
          console.log(chalk.bold("Full Prompt:"));
          console.log(chalk.gray(session.prompt));
        }
      } catch (error) {
        spinner.fail(chalk.red("Failed to process query"));
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // gicm opus67 status - Show system status
  opus67
    .command("status")
    .description("Show OPUS67 system status")
    .action(async () => {
      try {
        const { opus67: runtime, getAllModes } = await import("@gicm/opus67");
        const { getAllConnections } = await import("@gicm/opus67");
        const { loadSkills } = await import("@gicm/opus67");

        const modes = getAllModes();
        const connections = getAllConnections();
        const skills = loadSkills({ query: "" });

        console.log(chalk.bold("OPUS67 System Status"));
        console.log();
        console.log(`${chalk.cyan("Version:")} 2.0.0`);
        console.log(`${chalk.cyan("Current Mode:")} ${runtime.getMode().toUpperCase()}`);
        console.log();
        console.log(`${chalk.cyan("Skills:")} ${skills.skills.length} loaded`);
        console.log(`${chalk.cyan("MCPs:")} ${connections.length} available`);
        console.log(`${chalk.cyan("Modes:")} ${modes.length} configured`);
        console.log();
        console.log(chalk.green("Status: ONLINE"));
      } catch (error) {
        console.error(chalk.red(`Failed to get status: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  // gicm opus67 agents - List sub-agents
  opus67
    .command("agents")
    .description("List all 44 sub-agents")
    .action(async () => {
      const spinner = ora("Loading agents...").start();

      try {
        const { loadModeRegistry } = await import("@gicm/opus67");

        const registry = loadModeRegistry();
        spinner.stop();

        console.log(chalk.bold("OPUS67 Sub-Agents (44):"));
        console.log();

        const table = new Table({
          head: [chalk.cyan("ID"), chalk.cyan("Role"), chalk.cyan("Skills")],
          colWidths: [25, 25, 40],
        });

        const agents = registry.sub_agents || {};
        Object.entries(agents).forEach(([id, agent]: [string, any]) => {
          table.push([
            id,
            agent.role || "N/A",
            (agent.skills || []).slice(0, 3).join(", ") + (agent.skills?.length > 3 ? "..." : ""),
          ]);
        });

        console.log(table.toString());
        console.log();
        console.log(chalk.gray(`Total: ${Object.keys(agents).length} agents`));
      } catch (error) {
        spinner.fail(chalk.red("Failed to load agents"));
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });
}
