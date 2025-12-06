import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { parse } from 'yaml';
import { fileURLToPath } from 'url';

// src/registry/loader.ts
var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = dirname(__filename$1);
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
async function loadMasterRegistry() {
  const registryPath = join(getPackageRoot(), "registry", "MASTER.yaml");
  if (!existsSync(registryPath)) {
    throw new Error(`MASTER.yaml not found at: ${registryPath}`);
  }
  const content = readFileSync(registryPath, "utf-8");
  const registry = parse(content);
  if (!registry.version || !registry.meta) {
    throw new Error("Invalid MASTER.yaml: missing required fields");
  }
  return registry;
}
function getRegistryPath() {
  return join(getPackageRoot(), "registry", "MASTER.yaml");
}
function registryExists() {
  return existsSync(getRegistryPath());
}
function getRegistryVersion() {
  try {
    const registry = parse(readFileSync(getRegistryPath(), "utf-8"));
    return registry.version || null;
  } catch {
    return null;
  }
}

export { getRegistryPath, getRegistryVersion, loadMasterRegistry, registryExists };
