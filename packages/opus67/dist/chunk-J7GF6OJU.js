import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// src/modes/registry.ts
var __dirname$1 = dirname(fileURLToPath(import.meta.url));
var cachedRegistry = null;
function getPackageRoot() {
  let dir = __dirname$1;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return __dirname$1;
}
function loadModeRegistry() {
  if (cachedRegistry) return cachedRegistry;
  const registryPath = join(getPackageRoot(), "modes", "registry.yaml");
  const content = readFileSync(registryPath, "utf-8");
  cachedRegistry = parse(content);
  return cachedRegistry;
}
function getMode(modeName) {
  const registry = loadModeRegistry();
  return registry.modes[modeName] || null;
}
function getAllModes() {
  const registry = loadModeRegistry();
  const modes = [];
  for (const [id, mode] of Object.entries(registry.modes)) {
    modes.push({ id, mode });
  }
  const advancedFeatures = registry.advanced_features;
  if (advancedFeatures) {
    const advancedModeIds = [
      "background",
      "review",
      "grab",
      "clone",
      "research",
      "context",
      "solana",
      "infra",
      "memory",
      "debug",
      "deep-research",
      "web-search",
      "design",
      "content",
      "business",
      "strategy",
      "marketing",
      "security",
      "teach",
      "ship"
    ];
    for (const key of advancedModeIds) {
      if (advancedFeatures[key]?.icon) {
        modes.push({ id: key, mode: advancedFeatures[key] });
      }
    }
  }
  return modes;
}

export { getAllModes, getMode, loadModeRegistry };
