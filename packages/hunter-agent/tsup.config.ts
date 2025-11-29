import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/sources/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});
