/**
 * OPUS 67 - Skills Module
 * Barrel export for skill loader components
 */

// Types
export type {
  Fragment,
  Skill,
  ResolvedSkill,
  SkillRegistry,
  LoadContext,
  LoadResult,
  MatchResult
} from './types.js';

// Fragment loading
export { loadFragment, resolveInheritance, clearFragmentCache } from './fragment.js';

// Registry loading
export { loadRegistry, loadSkillMetadata } from './registry.js';

// Context matching
export { extractKeywords, skillMatchesContext } from './matcher.js';

// Output formatting
export { formatSkillsForPrompt } from './formatter.js';

// Legacy SkillLoader class
export { SkillLoader, default as SkillLoaderDefault } from './loader.js';
export type { SkillDefinition, LoadedSkill } from './loader.js';
