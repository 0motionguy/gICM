# OPUS 67 Version History

## Current Version: v4.1.1 "Learning Layer"

Code quality refactoring release with improved maintainability and comprehensive testing.

---

## Statistics by Version

| Metric | v3.0 | v3.3 | v4.0 | v4.1 |
|--------|------|------|------|------|
| **Skills** | 48 | 95 | 95 | **95** |
| **Agents** | 50 | 82 | 82 | **82** |
| **Modes** | 22 | 30 | 30 | **30** |
| **MCPs** | 40 | 84 | 84 | **84** |
| **Avg Complexity** | - | - | 32 | **28.17** |
| **Tests** | - | - | 174 | **190** |

---

## v4.1.0 "Code Quality" (December 2025)

**Major refactoring to reduce cyclomatic complexity and improve testability.**

### Refactored Modules

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| `skill-loader.ts` | 449 lines, 80 complexity | 137 lines | **-70%** |
| `graphiti.ts` | 63 complexity | 5 modules, avg 12 | **-81%** |
| `mcp-server.ts` | 77 complexity | 4 modules, avg 15 | **-80%** |
| `mode-selector.ts` | 56 complexity | 3 modules, avg 18 | **-68%** |
| `model-client.ts` | 50 complexity | 4 modules, avg 12 | **-76%** |

### New Module Structure

**Skills Module (`src/skills/`):**
- `types.ts` - Type definitions
- `fragment.ts` - Fragment loading and caching
- `registry.ts` - Registry loading
- `matcher.ts` - Context matching
- `formatter.ts` - Output formatting

**Memory Module (`src/memory/`):**
- `types.ts` - Type definitions
- `embeddings.ts` - Vector embeddings
- `cache.ts` - Local memory cache
- `context.ts` - Context management

**Models Module (`src/models/`):**
- `pricing.ts` - Cost calculations
- `providers.ts` - Model provider configs
- `router.ts` - Multi-model routing

**Modes Module (`src/modes/`):**
- `registry.ts` - Mode loading
- `detection.ts` - Auto-detection
- `display.ts` - Format output
- `selector.ts` - Mode selection

### Testing

- Added 16 new module unit tests
- Total: **190 tests passing**
- Covers all extracted modules

### Quality Metrics

```
Average Complexity: 28.17 (down from 32)
Max Complexity: models/router.ts (74)
All tests: 190/190 passing
Self-test: 10/10 passing
```

---

## v4.0.0 "Learning Layer" (December 2025)

**Self-evolving AI runtime with AContext integration.**

### Key Features
- Vector skill search
- Auto-SOP generation
- Learning loop improvements
- BRAIN server HTTP API

---

## v3.3.0 "Unified" (December 2025)

**Full integration of v3.1 + v3.2 features into a single documented release.**

### Key Changes
- Unified documentation for all features
- Added "What is OPUS 67?" clarity section everywhere
- Boot screen shows clarity message
- All 95 skills, 84 MCPs, 30 modes documented

---

## v3.2.0 "The Solana Stack" (December 2025)

**Solana-native AI development system with universal infrastructure.**

### New MCPs (22)
**Tier 1 - Universal Dev Tools:**
- GitHub MCP (official) - Repo automation
- Mem0 MCP - Persistent semantic memory
- Qdrant MCP - Vector DB for RAG
- Supabase MCP - Database operations
- Docker MCP - Container management

**Tier 2 - Solana Stack (UNIQUE MOAT):**
- Jupiter MCP - Token swaps
- Solana RPC MCP - Blockchain queries
- Solana Web3.js MCP - Program deployment
- **Anchor MCP** - Natural language → Anchor instructions (NO COMPETITOR HAS THIS)
- Chainstack Solana MCP - Analytics

**Tier 3 - DevOps:**
- Notion MCP - Documentation
- Sentry MCP - Error tracking

### New Modes (4)
- SOLANA 🪙 - Blockchain-native development
- INFRA 🏗️ - Infrastructure as conversation
- MEMORY 🧠 - Persistent context management
- DEBUG 🐛 - Error → Root cause → PR

### New Agents (16)
**Infrastructure:** Repo Master, Memory Keeper, Vector Wizard, DB Commander, Container Chief
**Solana:** Jupiter Trader, Chain Reader, Program Builder, Anchor Architect, DeFi Analyst
**DevOps:** Notion Navigator, Error Hunter, CI/CD Automator
**Composite:** Full Stack Builder, Solana Stack, Research Synth

### Killer Use Case
```
User: "Build me a Pump.fun clone"

OPUS 67 v3.2:
1. [GitHub MCP] Pull Anchor examples
2. [Anchor MCP] Parse IDLs, generate client
3. [Supabase MCP] Setup database
4. [GRAB Skills] Clone UI
5. [Jupiter MCP] Integrate swaps
6. [Mem0 MCP] Remember project state
7. [Docker MCP] Deploy environment

Result: Hours, not weeks
```

---

## v3.1.0 "The Eyes Update" (December 2025)

**Visual-first + Data-first development with 35+ new integrations.**

### New MCPs (22)
**Web Scraping:**
- Firecrawl MCP - Production-grade crawling ($16/mo or self-host)
- Jina Reader - FREE URL→markdown
- Crawl4AI - Self-hosted, privacy-first
- Tavily MCP - AI-optimized search (1000 free/mo)
- Exa MCP - Semantic + code search

**Browser Automation:**
- Playwright MCP (Microsoft official) - 44% faster
- Stagehand MCP - act/extract/observe primitives
- Browserbase MCP - Cloud browser infrastructure

**Documentation:**
- Context7 MCP - Always-current library docs (FREE)

**Desktop:**
- ScreenPipe MCP - 24/7 desktop recording (FREE, local)

### New Skills (30) - GRAB Skills
**UI/Frontend:**
- react-grab, theme-grab, form-grab, chart-grab
- icon-grab, dashboard-grab, landing-grab

**Backend/Data:**
- db-grab, api-grab

**Design/Motion:**
- wireframe-grab, figma-grab, animation-grab

**Templates:**
- email-grab, pdf-grab, mobile-grab

### New Modes (4)
- GRAB 👁️ - Visual-first development
- CLONE 🔄 - Full site cloning
- RESEARCH 🔍 - Multi-source synthesis
- CONTEXT 🖥️ - Desktop awareness

### New Agents (16)
**Vision:** Grabber, Cloner, Theme Extractor, Schema Builder, Form Wizard, Chart Master, Email Builder, Animator
**Data:** Deep Researcher, Web Spider, Docs Expert, Desktop Oracle
**Browser:** Browser Controller, Stagehand, Test Generator, Auth Agent

---

## v3.0.0 "Vision" (November 2025)

**Multi-model routing and cost optimization.**

### Key Features
- Multi-model router (Claude/Gemini/DeepSeek)
- LLM Council for complex decisions
- Graphiti memory persistence
- Evolution loop for self-improvement
- $7/month base cost optimization

### Base Stats
- 48 Skills
- 50 Agents
- 22 Modes
- 40 MCPs

---

## Roadmap: v3.4+

### Planned MCPs
- Helius Webhooks MCP (real-time alerts)
- Birdeye API MCP (token analytics)
- Metaplex MCP (NFT operations)
- Tensor MCP (NFT trading)
- Magic Eden MCP (marketplace)
- Phantom Deeplink MCP (wallet signing)

### Custom Builds
- ICM Motion MCP (full curve control)
- Pump.fun Monitor MCP (competitor tracking)
- DEX Analytics MCP (cross-DEX data)
- Whale Alerts MCP (large transactions)

---

## Upgrade Paths

### v3.0 → v3.3
```bash
./scripts/upgrade-v31.sh
./scripts/upgrade-v32.sh
```

### Fresh Install
```bash
npm install -g @gicm/opus67
opus67 init
```

---

*OPUS 67 - Claude with superpowers.*
