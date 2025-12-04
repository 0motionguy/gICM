import { existsSync, readFileSync } from 'fs';
import { parse } from 'yaml';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// src/skills/fragment.ts
var __dirname$1 = dirname(fileURLToPath(import.meta.url));
var fragmentCache = /* @__PURE__ */ new Map();
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
function loadFragment(fragmentId) {
  if (fragmentCache.has(fragmentId)) {
    return fragmentCache.get(fragmentId);
  }
  const fragmentPath = join(getPackageRoot(), "skills", "fragments", `${fragmentId}.yaml`);
  if (!existsSync(fragmentPath)) {
    console.warn(`Fragment not found: ${fragmentId}`);
    return null;
  }
  try {
    const content = readFileSync(fragmentPath, "utf-8");
    const fragment = parse(content);
    fragmentCache.set(fragmentId, fragment);
    return fragment;
  } catch (error) {
    console.error(`Error loading fragment ${fragmentId}:`, error);
    return null;
  }
}
function resolveInheritance(skill) {
  const inherited_capabilities = [];
  const inherited_anti_hallucination = [];
  if (skill.extends && skill.extends.length > 0) {
    for (const fragmentId of skill.extends) {
      const fragment = loadFragment(fragmentId);
      if (fragment) {
        for (const cap of fragment.capabilities) {
          if (!inherited_capabilities.includes(cap) && !skill.capabilities.includes(cap)) {
            inherited_capabilities.push(cap);
          }
        }
        if (fragment.anti_hallucination) {
          inherited_anti_hallucination.push(...fragment.anti_hallucination);
        }
      }
    }
  }
  return {
    ...skill,
    inherited_capabilities,
    inherited_anti_hallucination
  };
}
function clearFragmentCache() {
  fragmentCache.clear();
}

// src/skills/formatter.ts
function formatSkillsForPrompt(result, resolveFragments = true) {
  if (result.skills.length === 0) {
    return "<!-- No specific skills loaded -->";
  }
  let output = `<!-- OPUS 67 v4.0: ${result.skills.length} skills loaded (${result.totalTokenCost} tokens) -->
`;
  output += "<loaded_skills>\n";
  for (const skill of result.skills) {
    const resolved = resolveFragments ? resolveInheritance(skill) : null;
    output += `
## ${skill.name}
`;
    output += `Capabilities:
`;
    for (const cap of skill.capabilities) {
      output += `- ${cap}
`;
    }
    if (resolved && resolved.inherited_capabilities.length > 0) {
      output += `
Inherited (from ${skill.extends?.join(", ")}):
`;
      for (const cap of resolved.inherited_capabilities) {
        output += `- ${cap}
`;
      }
    }
    const allAntiHallucination = [
      ...skill.anti_hallucination || [],
      ...resolved?.inherited_anti_hallucination || []
    ];
    if (allAntiHallucination.length > 0) {
      output += `
Safety Rules:
`;
      for (const rule of allAntiHallucination.slice(0, 5)) {
        output += `- When asked about "${rule.trigger}": ${rule.response}
`;
      }
    }
  }
  output += "\n</loaded_skills>\n";
  output += `<!-- MCPs available: ${result.mcpConnections.join(", ")} -->`;
  return output;
}

export { clearFragmentCache, formatSkillsForPrompt, loadFragment, resolveInheritance };
