/**
 * Runner script for memory benchmark
 */
import { runMemoryBenchmark, MemoryBenchmarkRunner } from "./memory-suite.js";

async function main() {
  console.log("Starting memory benchmark...");

  try {
    const suite = await runMemoryBenchmark();
    const runner = new MemoryBenchmarkRunner();
    console.log("\n" + runner.formatResults(suite));
  } catch (error) {
    console.error("Benchmark failed:", error);
    process.exit(1);
  }
}

main();
