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
  dts: false,  // Disable DTS for now - ESM build works
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
