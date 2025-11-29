import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/content/index.ts",
    "src/social/index.ts",
  ],
  format: ["esm"],
  dts: false, // TODO: Fix type mismatches between types.ts and index.ts
  clean: true,
  splitting: true,
  sourcemap: true,
});
