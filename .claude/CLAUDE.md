# OPUS 67 v6.0.0 - Unified System

> Run `opus67` for unified boot. All skills, agents, MCPs, and modes load automatically.

See root `CLAUDE.md` for OPUS 67 master documentation.

---

## gICM Integration

Enhanced AI development with deep autonomy integration.

### Quick Reference
@import docs/quick-ref/build-commands.md
@import docs/quick-ref/package-locations.md

### Current Context
@import memory/context/current-sprint.md

### Available MCP Tools
- `dev.search_code` - Semantic search across the codebase
- `dev.get_context_bundle` - Get relevant context for a task
- `dev.plan_change` - Generate implementation plans
- `dev.run_agent` - Execute specialized gICM agents
- `dev.status` - Check project and indexing status

### Standard Operating Procedures
Run `/sop <name>` for procedures:
- `/sop new-package` - Create new @gicm/* package
- `/sop build-failure` - Fix build failures
- `/sop npm-publish` - Publish to npm
- `/sop rollback` - Emergency rollback

See `sops/README.md` for full index.

### Memory System
Run `/memory <action> <content>` to track:
- `/memory win "description"` - Record achievement
- `/memory decision "description"` - Log decision
- `/memory learn "description"` - Add learning
- `/memory improve "description"` - Add improvement idea

See `memory/README.md` for full documentation.

### Hooks Active
- **SessionStart** - Logs sessions to `.claude/logs/`
- **PostWrite** - Auto-formats TS/TSX with Prettier
- **PreBash** - Lint before push, tests before publish
- **PostBash** - Tracks wins, logs completions

### Autonomy Level
Current autonomy level: **2** (Bounded - auto-executes safe actions)

Safe actions auto-execute:
- Add tests, fix lint, update docs
- Add comments, format code, add types

Risky actions queue for approval:
- Modify core, change API, deploy production
