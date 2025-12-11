/**
 * OPUS 67 v6.3.0 - Session Module
 *
 * Cross-session context continuity:
 * - Conversation history tracking
 * - Session checkpointing
 * - Decision and goal tracking
 * - Context injection for prompts
 */

export {
  SessionManager,
  createSessionManager,
  DEFAULT_SESSION_CONFIG,
  type Role,
  type ConversationTurn,
  type Decision,
  type SessionGoal,
  type SessionCheckpoint,
  type SessionConfig,
  type SessionSummary,
  type SessionEvents,
} from "./manager.js";
