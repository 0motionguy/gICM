/**
 * OPUS 67 Skill Formatter
 * Format loaded skills for prompt injection
 */

import type { Skill, LoadResult } from './types.js';
import { resolveInheritance } from './fragment.js';

/**
 * Format loaded skills for prompt injection
 * v4.0: Includes inherited capabilities and anti-hallucination rules
 */
export function formatSkillsForPrompt(result: LoadResult, resolveFragments = true): string {
  if (result.skills.length === 0) {
    return '<!-- No specific skills loaded -->';
  }

  let output = `<!-- OPUS 67 v4.0: ${result.skills.length} skills loaded (${result.totalTokenCost} tokens) -->\n`;
  output += '<loaded_skills>\n';

  for (const skill of result.skills) {
    const resolved = resolveFragments ? resolveInheritance(skill) : null;

    output += `\n## ${skill.name}\n`;

    // Skill-specific capabilities
    output += `Capabilities:\n`;
    for (const cap of skill.capabilities) {
      output += `- ${cap}\n`;
    }

    // Inherited capabilities from fragments
    if (resolved && resolved.inherited_capabilities.length > 0) {
      output += `\nInherited (from ${skill.extends?.join(', ')}):\n`;
      for (const cap of resolved.inherited_capabilities) {
        output += `- ${cap}\n`;
      }
    }

    // Anti-hallucination rules (skill + inherited)
    const allAntiHallucination = [
      ...(skill.anti_hallucination || []),
      ...(resolved?.inherited_anti_hallucination || [])
    ];
    if (allAntiHallucination.length > 0) {
      output += `\nSafety Rules:\n`;
      for (const rule of allAntiHallucination.slice(0, 5)) {
        output += `- When asked about "${rule.trigger}": ${rule.response}\n`;
      }
    }
  }

  output += '\n</loaded_skills>\n';
  output += `<!-- MCPs available: ${result.mcpConnections.join(', ')} -->`;

  return output;
}
