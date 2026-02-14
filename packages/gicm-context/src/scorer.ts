import type { SkillEntry, ScoredSkill, ContextConfig } from "./types.js";

export function scoreSkill(
  skill: SkillEntry,
  query: string,
  config: ContextConfig
): ScoredSkill {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  let score = 0;
  const matchReasons: string[] = [];

  for (const word of queryWords) {
    // Name matching (highest boost)
    if (skill.name.toLowerCase().includes(word)) {
      score += config.boostFactors.nameMatch;
      matchReasons.push(`name:${word}`);
    }

    // Tag matching
    for (const tag of skill.tags) {
      if (tag.toLowerCase().includes(word)) {
        score += config.boostFactors.tagMatch;
        matchReasons.push(`tag:${tag}`);
        break; // Only count once per word per tag list
      }
    }

    // Description matching
    if (skill.description.toLowerCase().includes(word)) {
      score += config.boostFactors.descriptionMatch;
      matchReasons.push(`desc:${word}`);
    }

    // Content matching (capped to avoid huge scores)
    const contentLower = skill.content.toLowerCase();
    const contentMatches = (
      contentLower.match(new RegExp(`\\b${escapeRegex(word)}\\b`, "g")) || []
    ).length;
    if (contentMatches > 0) {
      score += Math.min(contentMatches, 3) * config.boostFactors.contentMatch;
      matchReasons.push(`content:${word}(${contentMatches})`);
    }
  }

  return { skill, score, matchReasons };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function rankSkills(
  skills: SkillEntry[],
  query: string,
  config: ContextConfig
): ScoredSkill[] {
  return skills
    .map((skill) => scoreSkill(skill, query, config))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
}
