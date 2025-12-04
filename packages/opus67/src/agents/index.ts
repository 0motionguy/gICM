/**
 * OPUS 67 v4.1 - Agents Index
 *
 * Export all learning layer agents.
 */

export {
  LearningObserverAgent,
  getLearningObserver,
  resetLearningObserver,
  type TaskContext,
  type ToolCall,
  type SOP,
  type SuccessMetric,
  type LearningObserverConfig
} from './learning-observer.js';

export {
  SkillsNavigatorAgent,
  getSkillsNavigator,
  resetSkillsNavigator,
  type SkillCombination,
  type ActivationResult,
  type UsageRecord,
  type SkillsNavigatorConfig
} from './skills-navigator.js';
