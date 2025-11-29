#!/usr/bin/env node
/**
 * gICM Growth Engine CLI
 *
 * Command-line interface for the Growth Engine.
 */

import { GrowthEngine } from "./index.js";
import { Logger } from "./utils/logger.js";

const logger = new Logger("CLI");

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  const engine = new GrowthEngine();

  switch (command) {
    case "start":
      await engine.start();
      logger.info("Growth Engine is running. Press Ctrl+C to stop.");

      // Keep running
      process.on("SIGINT", () => {
        engine.stop();
        process.exit(0);
      });
      break;

    case "generate":
      const type = args[1] as "blog" | "tweet" | "thread";
      if (!["blog", "tweet", "thread"].includes(type)) {
        logger.error('Usage: growth generate <blog|tweet|thread>');
        process.exit(1);
      }
      await engine.generateNow(type);
      break;

    case "keywords":
      const topic = args.slice(1).join(" ") || "AI development tools";
      await engine.researchKeywords(topic);
      break;

    case "status":
      const status = engine.getStatus();
      console.log("\n=== Growth Engine Status ===\n");
      console.log(`Running: ${status.running}`);
      console.log(`Started: ${status.startedAt ? new Date(status.startedAt).toISOString() : "N/A"}`);
      console.log("\nMetrics:");
      console.log(`  Posts published: ${status.metrics.content.postsPublished}`);
      console.log(`  Total views: ${status.metrics.content.totalViews}`);
      console.log(`  Avg engagement: ${status.metrics.content.avgEngagement}%`);
      const upcomingCount = (status.upcomingContent as { upcoming?: unknown[] }).upcoming?.length || 0;
      console.log(`\nUpcoming content: ${upcomingCount} items`);
      break;

    case "help":
    default:
      console.log(`
gICM Growth Engine CLI

Usage:
  growth start              Start the engine (runs continuously)
  growth generate <type>    Generate content (blog, tweet, thread)
  growth keywords <topic>   Research keywords for a topic
  growth status             Show engine status
  growth help               Show this help

Examples:
  growth start
  growth generate blog
  growth keywords "claude code"
      `);
      break;
  }
}

main().catch((error) => {
  logger.error(`CLI error: ${error}`);
  process.exit(1);
});
