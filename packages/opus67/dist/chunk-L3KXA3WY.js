import { fileURLToPath } from 'url';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { parse } from 'yaml';
import { dirname, join } from 'path';

// src/skill-loader.ts
var __dirname$1 = dirname(fileURLToPath(import.meta.url));
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
function loadSkillMetadata(skillId) {
  const metadataBase = join(getPackageRoot(), "skills", "metadata");
  const directPath = join(metadataBase, `${skillId}.yaml`);
  if (existsSync(directPath)) {
    try {
      const content = readFileSync(directPath, "utf-8");
      return parse(content);
    } catch (error) {
      console.error(`Error loading skill metadata ${skillId}:`, error);
    }
  }
  if (existsSync(metadataBase)) {
    const entries = readdirSync(metadataBase);
    for (const entry of entries) {
      const categoryPath = join(metadataBase, entry);
      if (statSync(categoryPath).isDirectory()) {
        const skillPath = join(categoryPath, `${skillId}.yaml`);
        if (existsSync(skillPath)) {
          try {
            const content = readFileSync(skillPath, "utf-8");
            return parse(content);
          } catch (error) {
            console.error(`Error loading skill metadata ${skillId} from ${entry}:`, error);
          }
        }
      }
    }
  }
  return null;
}
function loadRegistry() {
  const registryPath = join(getPackageRoot(), "skills", "registry.yaml");
  const content = readFileSync(registryPath, "utf-8");
  const raw = parse(content);
  const allSkills = [
    ...raw.skills || [],
    ...raw.skills_v31 || [],
    ...raw.skills_v41 || []
  ];
  const allCombinations = {
    ...raw.combinations,
    ...raw.v4_combinations
  };
  return {
    meta: raw.meta,
    skills: allSkills,
    combinations: allCombinations
  };
}

// src/skills/matcher.ts
function extractKeywords(query) {
  return query.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 2);
}
function skillMatchesContext(skill, context) {
  const queryKeywords = extractKeywords(context.query);
  const autoLoad = skill.auto_load_when;
  if (autoLoad.keywords) {
    for (const keyword of autoLoad.keywords) {
      const keywordParts = keyword.toLowerCase().split(" ");
      if (keywordParts.every((part) => queryKeywords.includes(part) || context.query.toLowerCase().includes(part))) {
        return { matches: true, reason: `keyword: "${keyword}"` };
      }
    }
  }
  if (autoLoad.file_types && context.activeFiles) {
    for (const file of context.activeFiles) {
      for (const fileType of autoLoad.file_types) {
        if (file.endsWith(fileType)) {
          return { matches: true, reason: `file_type: "${fileType}"` };
        }
      }
    }
  }
  if (autoLoad.directories && context.currentDirectory) {
    for (const dir of autoLoad.directories) {
      if (context.currentDirectory.includes(dir.replace("/", ""))) {
        return { matches: true, reason: `directory: "${dir}"` };
      }
    }
  }
  if (autoLoad.task_patterns) {
    for (const pattern of autoLoad.task_patterns) {
      const regex = new RegExp(pattern.replace(/\.\*/, ".*"), "i");
      if (regex.test(context.query)) {
        return { matches: true, reason: `pattern: "${pattern}"` };
      }
    }
  }
  return { matches: false, reason: "" };
}

// src/skill-loader.ts
function loadSkills(context) {
  const registry = loadRegistry();
  const matchedSkills = [];
  for (const skill of registry.skills) {
    const { matches, reason } = skillMatchesContext(skill, context);
    if (matches) {
      matchedSkills.push({ skill, reason });
    }
  }
  matchedSkills.sort((a, b) => {
    if (a.skill.tier !== b.skill.tier) return a.skill.tier - b.skill.tier;
    return a.skill.token_cost - b.skill.token_cost;
  });
  const selectedSkills = [];
  const reasons = [];
  let totalCost = 0;
  const seenMcps = /* @__PURE__ */ new Set();
  for (const { skill, reason } of matchedSkills) {
    if (selectedSkills.length >= registry.meta.max_skills_per_session) break;
    if (totalCost + skill.token_cost > registry.meta.token_budget) continue;
    selectedSkills.push(skill);
    reasons.push(`${skill.id} (${reason})`);
    totalCost += skill.token_cost;
    for (const mcp of skill.mcp_connections) {
      seenMcps.add(mcp);
    }
  }
  return {
    skills: selectedSkills,
    totalTokenCost: totalCost,
    mcpConnections: Array.from(seenMcps),
    reason: reasons
  };
}
function loadCombination(combinationId) {
  const registry = loadRegistry();
  const combination = registry.combinations[combinationId];
  if (!combination) {
    return {
      skills: [],
      totalTokenCost: 0,
      mcpConnections: [],
      reason: [`Combination "${combinationId}" not found`]
    };
  }
  const skills = registry.skills.filter((s) => combination.skills.includes(s.id));
  const mcps = /* @__PURE__ */ new Set();
  for (const skill of skills) {
    for (const mcp of skill.mcp_connections) {
      mcps.add(mcp);
    }
  }
  return {
    skills,
    totalTokenCost: combination.token_cost,
    mcpConnections: Array.from(mcps),
    reason: [`combination: ${combinationId}`]
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { formatSkillsForPrompt: formatSkillsForPrompt2 } = await import('./formatter-VLGPJZBI.js');
  const testContext = {
    query: process.argv[2] || "build anchor program for bonding curve",
    activeFiles: [".rs", ".tsx"],
    currentDirectory: "programs/curve"
  };
  console.log("Testing skill loader with context:", testContext);
  console.log("---");
  const result = loadSkills(testContext);
  console.log("Loaded skills:", result.skills.map((s) => s.id));
  console.log("Token cost:", result.totalTokenCost);
  console.log("MCP connections:", result.mcpConnections);
  console.log("Reasons:", result.reason);
  console.log("---");
  console.log(formatSkillsForPrompt2(result));
}

export { extractKeywords, loadCombination, loadRegistry, loadSkillMetadata, loadSkills, skillMatchesContext };
