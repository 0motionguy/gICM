# Agent Cache Strategy

Agent prompt caching strategy. Options: none, session, persistent. Recommended: session for most use cases.

## Overview

Controls how agent prompts are cached. 'none' disables caching, 'session' caches for the duration of the session, 'persistent' caches across sessions. Session caching provides best balance of performance and flexibility.

## Configuration

**Category:** Performance
**Type:** String (enum)
**Default:** session
**Options:** none, session, persistent

## Usage

```bash
# Session caching (default)
npx @gicm/cli settings add performance/agent-cache-strategy --value session

# No caching
npx @gicm/cli settings add performance/agent-cache-strategy --value none

# Persistent caching
npx @gicm/cli settings add performance/agent-cache-strategy --value persistent
```

## Caching Strategies

### None
- **No caching:** Agent prompts loaded every request
- **Use case:** Development, testing prompt changes
- **Token cost:** Highest
- **Speed:** Slowest

### Session (Recommended)
- **Session-scoped:** Cache lives for current session
- **Use case:** Most development and production scenarios
- **Token cost:** Reduced by 60-80%
- **Speed:** 2-3x faster

### Persistent
- **Cross-session:** Cache survives restarts
- **Use case:** Production, stable agent configurations
- **Token cost:** Reduced by 80-90%
- **Speed:** 3-5x faster

## Performance Impact

**Token Savings Per Agent Invocation:**
- None: 0% savings (baseline)
- Session: 60-80% savings (first invocation full cost)
- Persistent: 80-90% savings

**Speed Improvement:**
- None: Baseline
- Session: 2-3x faster after first load
- Persistent: 3-5x faster from first request

## Cache Invalidation

**Automatic invalidation:**
- Agent file modified (all strategies)
- Session ends (session strategy)
- Manual cache clear
- gICM stack restart (session strategy only)

## Related Settings

- `skill-cache-ttl` - Cache TTL for skills
- `lazy-skill-loading` - Progressive disclosure for skills

## Examples

### Production Configuration
```json
{
  "agent-cache-strategy": "persistent",
  "skill-cache-ttl": 3600
}
```

### Development Configuration
```json
{
  "agent-cache-strategy": "session",
  "skill-cache-ttl": 0
}
```

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Compatibility:** gICM Stack v1.0+
