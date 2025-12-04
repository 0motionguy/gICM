import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "chains/index": "src/chains/index.ts",
    "llm/index": "src/llm/index.ts",
    "resilience/index": "src/resilience/index.ts",
    "security/index": "src/security/index.ts",
    "observability/index": "src/observability/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
