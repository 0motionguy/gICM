import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/cli.ts",
    "src/boot-sequence.ts",
    "src/mode-selector.ts",
    "src/skill-loader.ts",
    "src/mcp-hub.ts",
    "src/autonomy-logger.ts",
    "src/brain/server.ts",
    "src/mcp-server.ts",
    "src/tests/opus67-self-test.ts"
  ],
  format: ["esm"],
  dts: false,  // Disabled - MCP SDK type compatibility issues to be fixed in v5.1.9
  clean: true,
  target: "es2022",
  external: [
    "eventemitter3",
    "yaml",
    "zod",
    "fastify",
    "@fastify/websocket",
    "@fastify/cors",
    "pino-pretty"
  ],
  treeshake: true,
  splitting: true
});
