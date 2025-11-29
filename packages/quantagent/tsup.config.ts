import { defineConfig } from "tsup";

export default defineConfig([
  // Main library
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: false, // TODO: fix createTradingGraph import
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom"],
  },
  // CLI
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    outDir: "dist",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  // React components (optional)
  {
    entry: ["components/index.ts"],
    format: ["esm"],
    dts: true,
    outDir: "dist/components",
    external: ["react", "react-dom"],
  },
]);
