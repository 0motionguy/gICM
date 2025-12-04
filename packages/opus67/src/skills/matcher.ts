/**
 * OPUS 67 Skill Matcher
 * Context matching logic for skill auto-loading
 */

import type { Skill, LoadContext, MatchResult } from './types.js';

/**
 * Extract keywords from a query
 */
export function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

/**
 * Check if a skill matches the current context
 */
export function skillMatchesContext(skill: Skill, context: LoadContext): MatchResult {
  const queryKeywords = extractKeywords(context.query);
  const autoLoad = skill.auto_load_when;

  // Check keyword matches
  if (autoLoad.keywords) {
    for (const keyword of autoLoad.keywords) {
      const keywordParts = keyword.toLowerCase().split(' ');
      if (keywordParts.every(part => queryKeywords.includes(part) || context.query.toLowerCase().includes(part))) {
        return { matches: true, reason: `keyword: "${keyword}"` };
      }
    }
  }

  // Check file type matches
  if (autoLoad.file_types && context.activeFiles) {
    for (const file of context.activeFiles) {
      for (const fileType of autoLoad.file_types) {
        if (file.endsWith(fileType)) {
          return { matches: true, reason: `file_type: "${fileType}"` };
        }
      }
    }
  }

  // Check directory matches
  if (autoLoad.directories && context.currentDirectory) {
    for (const dir of autoLoad.directories) {
      if (context.currentDirectory.includes(dir.replace('/', ''))) {
        return { matches: true, reason: `directory: "${dir}"` };
      }
    }
  }

  // Check task pattern matches
  if (autoLoad.task_patterns) {
    for (const pattern of autoLoad.task_patterns) {
      const regex = new RegExp(pattern.replace(/\.\*/, '.*'), 'i');
      if (regex.test(context.query)) {
        return { matches: true, reason: `pattern: "${pattern}"` };
      }
    }
  }

  return { matches: false, reason: '' };
}
