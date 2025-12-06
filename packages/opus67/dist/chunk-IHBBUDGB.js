import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, extname } from 'path';

// src/hooks/activator.ts
function getHookType(filename) {
  if (filename.includes("session")) return "session";
  if (filename.startsWith("pre-")) return "pre";
  if (filename.startsWith("post-")) return "post";
  return "unknown";
}
async function activateHooks(projectRoot = process.cwd()) {
  const hooksDir = join(projectRoot, ".claude", "hooks");
  const expectedHooks = [
    "session-start.js",
    "opus67-auto-detect.js",
    "pre-bash.js",
    "post-write.js",
    "post-bash.js"
  ];
  const active = [];
  const missing = [];
  if (!existsSync(hooksDir)) {
    return {
      count: 0,
      active: [],
      missing: expectedHooks
    };
  }
  for (const hookFile of expectedHooks) {
    const hookPath = join(hooksDir, hookFile);
    if (existsSync(hookPath)) {
      active.push({
        name: hookFile.replace(".js", ""),
        filename: hookFile,
        path: hookPath,
        exists: true,
        type: getHookType(hookFile)
      });
    } else {
      missing.push(hookFile);
    }
  }
  const allFiles = readdirSync(hooksDir);
  for (const file of allFiles) {
    if (extname(file) !== ".js") continue;
    if (expectedHooks.includes(file)) continue;
    const hookPath = join(hooksDir, file);
    active.push({
      name: file.replace(".js", ""),
      filename: file,
      path: hookPath,
      exists: true,
      type: getHookType(file)
    });
  }
  return {
    count: active.length,
    active,
    missing
  };
}
function getHookContent(hookName, projectRoot = process.cwd()) {
  const hooksDir = join(projectRoot, ".claude", "hooks");
  const hookPath = join(hooksDir, `${hookName}.js`);
  if (!existsSync(hookPath)) {
    return null;
  }
  return readFileSync(hookPath, "utf-8");
}
function hookExists(hookName, projectRoot = process.cwd()) {
  const hooksDir = join(projectRoot, ".claude", "hooks");
  const hookPath = join(hooksDir, `${hookName}.js`);
  return existsSync(hookPath);
}

export { activateHooks, getHookContent, hookExists };
