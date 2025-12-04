# OPUS 67 v4.1 "Learning Layer"

> Self-evolving AI runtime that learns from every interaction

## What's New in v4.1

### 1. AContext Integration
Self-learning platform that records successful task completions and auto-generates SOPs (Standard Operating Procedures).

```yaml
# mcp/connections.yaml
learning:
  acontext:
    name: AContext
    type: rest_api
    base_url: http://localhost:8029/api/v1
    capabilities:
      - record_task
      - extract_sop
      - get_success_rate
      - list_learned_skills
```

### 2. Vector Skill Search
Semantic search across all 130+ skills using embeddings.

```typescript
import { getSkillSearch } from '@gicm/opus67';

const search = getSkillSearch();
const results = await search.searchSkills('build a DeFi trading bot', 5);

// Returns ranked skills by relevance:
// - defi-data-analyst (0.92)
// - bonding-curve-master (0.87)
// - solana-anchor-expert (0.85)
```

**Features:**
- Qdrant vector database (when available)
- TF-IDF fallback with n-gram enhancement
- Cosine similarity scoring
- Automatic skill indexing

### 3. Learning Observer Agent
Tracks successful workflows and extracts reusable patterns.

```typescript
import { getLearningObserver } from '@gicm/opus67';

const observer = getLearningObserver();

// Record task completion
await observer.observeCompletion({
  task: 'Deploy Anchor program to devnet',
  toolCalls: [...],
  mode: 'build',
  confidence: 0.95
});

// Extract SOP from successful workflow
const sop = await observer.extractSOP(context);
// Returns: { name, description, steps[], skills[], confidence }
```

**Auto-SOP Generation:**
- Watches for 3+ tool call chains
- Extracts successful patterns
- Generates step-by-step procedures
- Syncs to AContext cloud

### 4. Skills Navigator Agent
Auto-finds and activates relevant skills for tasks.

```typescript
import { getSkillsNavigator } from '@gicm/opus67';

const navigator = getSkillsNavigator();

// Auto-activate matching skills
const activations = await navigator.autoActivate('Build a Solana token launchpad');
// Activates: solana-anchor-expert, bonding-curve-master, wallet-integration

// Get skill combination suggestions
const combos = await navigator.suggestCombinations(['solana-anchor-expert', 'nextjs-14-expert']);
// Suggests: "Solana DApp Stack" (solana-anchor-expert + nextjs-14-expert + wallet-integration)
```

**Predefined Combinations:**
- `solana-dapp` - Full Solana dApp development
- `ai-chatbot` - AI-powered chatbot with streaming
- `saas-starter` - SaaS with payments (Stripe)
- `defi-trading` - DeFi trading and analytics
- `nft-marketplace` - NFT minting and marketplace

## Configuration

### Environment Variables
```bash
# AContext (self-learning platform)
ACONTEXT_API_URL=http://localhost:8029/api/v1
ACONTEXT_API_KEY=sk-ac-your-api-key
ACONTEXT_DASHBOARD_URL=http://localhost:3001

# Vector Search (optional - uses Qdrant if available)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-key
```

### Registry Configuration
```yaml
# skills/registry.yaml
learning_layer:
  acontext:
    enabled: true
    auto_learn: true
    min_complexity: medium
    sync_interval_minutes: 5

  skills_search:
    enabled: true
    embedding_model: all-MiniLM-L6-v2
    vector_store: qdrant
    top_k: 5
    min_score: 0.3

  agents:
    learning_observer:
      enabled: true
      auto_activate: true
      min_tool_chain_length: 3
      auto_sop_threshold: 0.8
    skills_navigator:
      enabled: true
      auto_activate_threshold: 0.7
      max_auto_skills: 3
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OPUS 67 v4.1                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Learning   │    │   Skills    │    │  Learning   │     │
│  │  Observer   │───▶│  Navigator  │───▶│    Loop     │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Skill Search (Vector)                   │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐    │   │
│  │  │  Qdrant   │  │  TF-IDF   │  │ Local Embed   │    │   │
│  │  │  (cloud)  │  │ (fallback)│  │   (n-grams)   │    │   │
│  │  └───────────┘  └───────────┘  └───────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 AContext Cloud                       │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐    │   │
│  │  │ Task Logs │  │   SOPs    │  │   Patterns    │    │   │
│  │  └───────────┘  └───────────┘  └───────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Boot Screen

The v4.1 boot screen now shows a LEARNING column:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║   ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐ ║
║   │  SKILLS     │  MCPs       │  MODES      │  AGENTS     │  LEARNING   │ ║
║   │    130      │     48      │     30      │     84      │     ON      │ ║
║   └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## Migration from v4.0

No breaking changes. v4.1 is fully backward compatible.

To enable new features:

1. Set environment variables for AContext (optional)
2. The learning agents auto-activate when `auto_activate: true` in registry
3. Vector search falls back to TF-IDF if Qdrant unavailable

## API Reference

### Learning Observer
- `observeCompletion(context: TaskContext)` - Record task completion
- `extractSOP(context: TaskContext)` - Generate SOP from workflow
- `recordSuccess(skillId: string)` - Track skill success
- `getSuccessRate(skillId: string)` - Get skill success rate
- `syncToAContext()` - Manual sync to cloud

### Skills Navigator
- `findSkillsForTask(query, topK?)` - Semantic skill search
- `autoActivate(task)` - Auto-activate matching skills
- `suggestCombinations(skillIds)` - Get combo suggestions
- `markUsageResult(skillId, success)` - Track usage outcome
- `getUsageStats()` - Get usage statistics

### Learning Loop
- `syncToAContext()` - Sync learnings to cloud
- `importFromAContext()` - Import learnings from cloud
- `getAContextStatus()` - Check connection status

---

*OPUS 67 v4.1 "Learning Layer" - Claude + Skills + MCPs + Modes + Memory + Learning*
