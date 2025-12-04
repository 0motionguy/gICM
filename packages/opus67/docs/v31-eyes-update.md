# OPUS 67 v3.1 "The Eyes Update" - Comprehensive Upgrade Package

## Executive Summary

v3.1 transforms OPUS 67 from text-only to **visual-first + data-first** development. This upgrade adds 35+ new integrations including vision AI, web scraping, browser automation, semantic search, and desktop recording capabilities.

**Key Stats:**
| Metric | v3.0 | v3.1 | Change |
|--------|------|------|--------|
| Skills | 48 | 78 | +30 |
| Agents | 50 | 66 | +16 |
| Modes | 22 | 26 | +4 |
| MCPs | 40 | 62 | +22 |
| Monthly Cost | ~$7 | ~$10-15 | Variable |

---

## 🔥 NEW TOOLS & INTEGRATIONS

### 1. WEB SCRAPING & DATA EXTRACTION

#### Firecrawl MCP
**Purpose:** Production-grade web scraping, URL to markdown, site crawling
**Cost:** ~$16/month starter, or self-host free
**Why:** Best-in-class for AI-ready data extraction

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-xxx"
      }
    }
  }
}
```

**Tools:**
- `scrape` - Single page to markdown/JSON
- `crawl` - Entire site traversal
- `map` - Discover all pages on a domain
- `extract` - AI-powered structured extraction

**Example Usage:**
```
"Scrape https://docs.solana.com and extract all code examples"
"Crawl competitor's pricing page and summarize"
```

---

#### Jina Reader (FREE!)
**Purpose:** URL to LLM-friendly markdown - completely FREE
**Cost:** FREE (with rate limits), or $10/mo for higher limits
**Why:** Zero cost, instant markdown conversion

```bash
# No MCP needed - just use the URL prefix!
curl https://r.jina.ai/https://example.com

# Search endpoint
curl https://s.jina.ai/your+search+query

# PDF support
curl https://r.jina.ai/https://arxiv.org/pdf/paper.pdf
```

**Integration in OPUS 67:**
```yaml
skill: jina-grab
triggers: ["grab url", "read page", "fetch content"]
workflow:
  - fetch: "https://r.jina.ai/${url}"
  - return: markdown content
cost: FREE
```

---

#### Crawl4AI (Open Source)
**Purpose:** Self-hosted, privacy-first crawling with local LLM support
**Cost:** FREE (open source)
**Why:** Complete data sovereignty, runs offline

```bash
pip install crawl4ai
```

```python
from crawl4ai import AsyncWebCrawler

async def extract():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://example.com",
            extraction_strategy=JsonCssExtractionStrategy(schema)
        )
```

---

### 2. AI SEARCH APIS

#### Tavily MCP
**Purpose:** AI-optimized web search for agents
**Cost:** FREE 1,000 calls/month, then $0.01/search
**Why:** Designed specifically for LLM grounding, reduces hallucinations

```json
{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_KEY"]
    }
  }
}
```

**Tools:**
- `tavily-search` - Web search with AI summaries
- `tavily-extract` - Content extraction from URLs
- `tavily-news` - Recent news search

---

#### Exa MCP
**Purpose:** Semantic/neural search + code context + company research
**Cost:** FREE tier available, then usage-based
**Why:** 60% better semantic understanding than Bing, code-specific search

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server", "tools=web_search_exa,get_code_context_exa,deep_search_exa,company_research_exa,linkedin_search_exa"],
      "env": {
        "EXA_API_KEY": "your-key"
      }
    }
  }
}
```

**Tools:**
- `web_search_exa` - Fast semantic web search
- `get_code_context_exa` - Fresh library/API documentation
- `deep_search_exa` - Comprehensive research with summaries
- `company_research_exa` - Company intel crawling
- `linkedin_search_exa` - Professional network search

**Example:**
```
"Find React useState examples using exa-code"
"Research competitors to Pump.fun using company_research"
```

---

### 3. BROWSER AUTOMATION

#### Playwright MCP (Official Microsoft)
**Purpose:** AI-powered browser control via accessibility tree
**Cost:** FREE (open source)
**Why:** 44% faster than alternatives, built for LLM agents

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    }
  }
}
```

**Key Features:**
- **Snapshot Mode:** Uses accessibility tree (fast, reliable)
- **Vision Mode:** Fallback for canvas elements
- **Cross-browser:** Chrome, Firefox, WebKit
- **Self-healing:** Adapts to DOM changes

**Tools:**
- `browser_navigate` - Go to URL
- `browser_click` - Click elements
- `browser_type` - Input text
- `browser_screenshot` - Capture page
- `browser_execute_js` - Run JavaScript

---

#### Stagehand (Browserbase)
**Purpose:** AI browser framework with act/extract/observe primitives
**Cost:** FREE local, Browserbase cloud pricing for scale
**Why:** Bridge between brittle Playwright and unpredictable agents

```bash
npm install @browserbasehq/stagehand
```

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({ env: "LOCAL" });
await stagehand.init();

// Natural language actions
await stagehand.act("click the login button");

// Structured extraction
const data = await stagehand.extract("extract all product prices", z.object({
  products: z.array(z.object({
    name: z.string(),
    price: z.number()
  }))
}));

// Full agent mode
const agent = stagehand.agent();
await agent.execute("Book a flight to Tokyo");
```

---

### 4. DOCUMENTATION & CONTEXT

#### Context7 MCP (FREE!)
**Purpose:** Up-to-date library docs injected into prompts
**Cost:** FREE
**Why:** Eliminates hallucinated APIs, always current documentation

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Usage:** Just add `use context7` to any prompt!
```
"How do I use React Query's useMutation? use context7"
"Configure Next.js middleware for auth. use context7"
"Implement Prisma soft deletes. use context7"
```

**Auto-invoke Rule:**
```yaml
rules:
  - match: "code generation, setup, configuration, library/API docs"
    tool: "context7"
    auto: true
```

---

### 5. DESKTOP RECORDING & CONTEXT

#### ScreenPipe MCP
**Purpose:** 24/7 desktop recording with searchable history
**Cost:** FREE (open source, local)
**Why:** Full user context for AI agents, like Rewind.ai

```json
{
  "mcpServers": {
    "screenpipe": {
      "command": "uv",
      "args": ["run", "screenpipe-mcp"]
    }
  }
}
```

**Features:**
- 24/7 screen + audio recording
- OCR text extraction
- Audio transcription
- Semantic search over history
- Plugin ecosystem ("pipes")

**Example Queries:**
```
"What was I working on yesterday around 3pm?"
"Find all mentions of 'bonding curve' on my screen"
"Summarize my meetings from last week"
```

**ScreenPipe Terminator:**
Desktop automation SDK - "Playwright for your desktop"
- 100x faster than vision-based computer use
- OS-level API access

---

### 6. SCREENSHOT TO CODE

#### screenshot-to-code (abi)
**Purpose:** Convert screenshots/mockups to working code
**Cost:** FREE (open source) + API costs
**Why:** Direct visual-to-code conversion

```bash
git clone https://github.com/abi/screenshot-to-code.git
cd screenshot-to-code
# Backend
cd backend && poetry install && poetry run uvicorn main:app --reload --port 7001
# Frontend
cd frontend && yarn install && yarn dev
```

**Supported Outputs:**
- HTML + Tailwind
- React + Tailwind
- Vue + Tailwind
- Bootstrap
- Ionic

**Models:**
- Claude Sonnet 3.7 (Best!)
- GPT-4o
- DALL-E 3 / Flux for images

---

## 🎯 NEW GRAB SKILLS (15 Total)

### UI/Frontend Grabs

| Skill | Trigger | Output | Cost |
|-------|---------|--------|------|
| `react-grab` | "grab this UI" | React + Tailwind component | $0.01 |
| `theme-grab` | "grab theme from URL" | tailwind.config.js | $0.01 |
| `form-grab` | "grab this form" | React Hook Form + Zod | $0.01 |
| `chart-grab` | "grab this chart" | Recharts component | $0.01 |
| `icon-grab` | "grab these icons" | SVG React components | $0.005 |
| `dashboard-grab` | "grab this dashboard" | Full admin layout | $0.05 |
| `landing-grab` | "grab this landing page" | Next.js page + sections | $0.05 |

### Backend/Data Grabs

| Skill | Trigger | Output | Cost |
|-------|---------|--------|------|
| `db-grab` | "grab this ERD" | Prisma schema + migrations | $0.02 |
| `api-grab` | "grab this API" | TypeScript SDK client | $0.02 |

### Design/Motion Grabs

| Skill | Trigger | Output | Cost |
|-------|---------|--------|------|
| `wireframe-grab` | "grab this sketch" | Polished UI component | $0.02 |
| `figma-grab` | "grab from Figma" | Component library | $0.05 |
| `animation-grab` | "grab this animation" | Framer Motion code | $0.02 |

### Template Grabs

| Skill | Trigger | Output | Cost |
|-------|---------|--------|------|
| `email-grab` | "grab this email" | React Email template | $0.01 |
| `pdf-grab` | "grab this document" | React-PDF component | $0.02 |
| `mobile-grab` | "grab for mobile" | React Native component | $0.02 |

---

## 🤖 NEW AGENTS (16 Total)

### Vision Agents

| Agent | Role | Skills | Behavior |
|-------|------|--------|----------|
| 👁️ Grabber | Master grab router | All grab skills | Auto-detect type, route appropriately |
| 🔄 Cloner | Full page cloning | landing-grab, dashboard-grab | Parallel section extraction |
| 🎨 Theme Extractor | Design system extraction | theme-grab, icon-grab | Consistent theming |
| 🗄️ Schema Builder | Backend from visuals | db-grab, api-grab | Generate Prisma + SDK |
| 📝 Form Wizard | Complex form generation | form-grab | Multi-step, validation |
| 📊 Chart Master | Data viz specialist | chart-grab | Interactive charts |
| 📧 Email Builder | Email templates | email-grab | Cross-client compatible |
| 🎬 Animator | Motion design | animation-grab | Framer Motion expert |

### Data Agents

| Agent | Role | Skills/MCPs | Behavior |
|-------|------|-------------|----------|
| 🔍 Deep Researcher | Comprehensive research | Tavily, Exa, Firecrawl | Multi-source synthesis |
| 🕷️ Web Spider | Site crawling | Firecrawl, Crawl4AI | Full site extraction |
| 📚 Docs Expert | Library documentation | Context7 | Always current APIs |
| 🖥️ Desktop Oracle | Desktop context | ScreenPipe | Historical awareness |

### Browser Agents

| Agent | Role | Skills/MCPs | Behavior |
|-------|------|-------------|----------|
| 🌐 Browser Controller | Automation | Playwright MCP | Accessibility-first |
| 🎭 Stagehand | Natural browser use | Stagehand | act/extract/observe |
| 🧪 Test Generator | E2E test creation | Playwright MCP | Generate + run tests |
| 🔐 Auth Agent | Login automation | Playwright + Stagehand | Handle auth flows |

---

## 🔌 NEW MCPs (22 Total)

### Web/Search MCPs

```yaml
mcps:
  firecrawl-mcp:
    tools: [scrape, crawl, map, extract]
    cost: $16/mo or self-host
    
  tavily-mcp:
    tools: [tavily-search, tavily-extract, tavily-news]
    cost: 1000 free/mo
    
  exa-mcp:
    tools: [web_search, deep_search, code_context, company_research, linkedin_search, crawling]
    cost: Free tier + usage
    
  jina-mcp:
    tools: [read_url, search_web, read_pdf]
    cost: FREE
    
  brightdata-mcp:
    tools: [serp_search, web_scraper, proxy_rotate]
    cost: Enterprise
```

### Browser MCPs

```yaml
mcps:
  playwright-mcp:
    tools: [navigate, click, type, screenshot, execute_js, pdf]
    cost: FREE
    
  stagehand-mcp:
    tools: [act, extract, observe, agent_execute]
    cost: FREE local
    
  browserbase-mcp:
    tools: [create_session, control_browser, live_view]
    cost: Usage-based
```

### Documentation MCPs

```yaml
mcps:
  context7-mcp:
    tools: [resolve-library-id, get-library-docs]
    cost: FREE
    
  docs-mcp:
    tools: [search_docs, get_examples, get_api_reference]
    cost: FREE
```

### Desktop MCPs

```yaml
mcps:
  screenpipe-mcp:
    tools: [search_screen, search_audio, get_timeline, search_ocr]
    cost: FREE (local)
    
  screenpipe-terminator:
    tools: [click, type, scroll, find_element, get_screen_state]
    cost: FREE
```

### Data MCPs

```yaml
mcps:
  prisma-mcp:
    tools: [generate_schema, run_migration, seed_data]
    cost: FREE
    
  supabase-mcp:
    tools: [query, insert, update, auth, storage]
    cost: Supabase pricing
    
  postgres-mcp:
    tools: [query, schema, migrate]
    cost: FREE
```

---

## 🎮 NEW MODES (4 Total)

### GRAB Mode 👁️
```yaml
mode: GRAB
description: Visual-first development mode
commands:
  - "grab this" → Auto-detect and grab
  - "grab theme from [url]" → theme-grab
  - "grab all" → Batch grab with SWARM
behavior:
  - Any image triggers grab detection
  - Preview before generating
  - Store in memory library
integrations: [SWARM, COUNCIL, MEMORY]
```

### CLONE Mode 🔄
```yaml
mode: CLONE
description: Clone entire websites/apps
commands:
  - "clone [url]" → Full page clone
  - "clone mobile [screenshot]" → Mobile clone
  - "clone with my theme" → Grab + apply theme
workflow:
  1. Capture full page / all screenshots
  2. Extract theme first
  3. Grab all sections in parallel (SWARM)
  4. Apply consistent theme
  5. Generate project structure
output: /clone-output/{components,styles,pages,config}
```

### RESEARCH Mode 🔍
```yaml
mode: RESEARCH
description: Deep web research with synthesis
commands:
  - "research [topic]" → Multi-source investigation
  - "find all about [company]" → Company intel
  - "summarize recent [topic]" → News synthesis
tools:
  - Tavily for search
  - Exa for semantic + code
  - Firecrawl for deep extraction
  - Context7 for docs
output: Markdown report with citations
```

### CONTEXT Mode 🖥️
```yaml
mode: CONTEXT
description: Desktop-aware AI assistance
commands:
  - "what was I doing?" → Recent activity
  - "find when I worked on [x]" → Search history
  - "summarize my day" → Daily report
tools:
  - ScreenPipe for history
  - OCR for text
  - Audio transcription
behavior:
  - Searches local screen recordings
  - Respects privacy (all local)
```

---

## 📦 INSTALLATION

### Prerequisites
```bash
# Node.js 18+
node --version

# Python 3.10+
python --version

# pnpm/npm
pnpm --version
```

### Quick Install Script
```bash
#!/bin/bash
# upgrade-v31.sh

echo "🚀 Upgrading OPUS 67 to v3.1..."

# New npm dependencies
npm install --save \
  @mendable/firecrawl-js \
  @browserbasehq/stagehand \
  puppeteer \
  sharp \
  @react-pdf/renderer \
  @react-email/components \
  gifuct-js \
  crawl4ai

# Python dependencies
pip install --break-system-packages \
  crawl4ai \
  screenpipe-mcp

# Create directories
mkdir -p skills/{grab,search,browser,desktop}
mkdir -p agents/{vision,data,browser}
mkdir -p mcp/{firecrawl,tavily,exa,playwright,stagehand,context7,screenpipe}

# Update version
echo '{"version": "3.1.0", "codename": "The Eyes Update"}' > .opus67-version

echo "✅ Upgrade complete!"
echo ""
echo "New capabilities:"
echo "  • 15 GRAB skills for visual-to-code"
echo "  • 22 new MCPs for web/browser/desktop"
echo "  • 16 new specialized agents"
echo "  • 4 new modes: GRAB, CLONE, RESEARCH, CONTEXT"
echo ""
echo "Run 'opus67 status' to verify"
```

### MCP Configuration Template
```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}" }
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"]
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server", "tools=web_search_exa,get_code_context_exa,deep_search_exa"],
      "env": { "EXA_API_KEY": "${EXA_API_KEY}" }
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "screenpipe": {
      "command": "uv",
      "args": ["run", "screenpipe-mcp"]
    }
  }
}
```

---

## 💰 COST ANALYSIS

### FREE Tools
| Tool | Monthly Limit | Best For |
|------|---------------|----------|
| Jina Reader | Generous rate limits | URL to markdown |
| Context7 | Unlimited | Library docs |
| Playwright MCP | Unlimited | Browser automation |
| ScreenPipe | Unlimited (local) | Desktop context |
| Crawl4AI | Unlimited (local) | Private crawling |

### Paid Tools (Usage-Based)
| Tool | Free Tier | Paid Pricing |
|------|-----------|--------------|
| Tavily | 1,000/month | $0.01/search |
| Exa | Limited | Usage-based |
| Firecrawl | Trial | $16-333/month |
| Browserbase | Trial | Usage-based |

### Estimated Monthly Costs
| Usage Level | Components | Searches | Browser | Total |
|-------------|------------|----------|---------|-------|
| Light | 50 grabs | 100 searches | 50 sessions | ~$3 |
| Medium | 200 grabs | 500 searches | 200 sessions | ~$10 |
| Heavy | 500 grabs | 2000 searches | 500 sessions | ~$25 |
| GICM Populate | 1000 grabs | 5000 searches | 1000 sessions | ~$50 |

**Note:** Using FREE alternatives (Jina, Context7, local Playwright) can reduce costs by 60-80%

---

## 🔧 USAGE EXAMPLES

### Basic Grabs
```
# Screenshot to React
[upload screenshot]
"grab this"
→ ProductCard.tsx with Tailwind

# URL to theme
"grab theme from https://linear.app"
→ tailwind.config.js with Linear colors

# ERD to database
[upload ERD diagram]
"grab database"
→ schema.prisma + migrations + seed
```

### Research Workflows
```
# Deep research
"mode: RESEARCH"
"research bonding curve mechanics in DeFi"
→ Comprehensive report with sources

# Company intel
"research competitors to Pump.fun"
→ Company profiles, features, pricing

# Code documentation
"how do I implement soft deletes in Prisma? use context7"
→ Current, accurate Prisma examples
```

### Browser Automation
```
# Test generation
"go to my app and generate login tests"
→ Playwright test file

# Data extraction
"scrape all product prices from this page"
→ Structured JSON data

# Form automation
"fill out this form with test data"
→ Completed form submission
```

### Full Stack Clone
```
# Clone entire site
"mode: CLONE"
"clone https://stripe.com/pricing"
→ /clone-output/
   ├── components/
   │   ├── Hero.tsx
   │   ├── PricingTable.tsx
   │   └── FAQ.tsx
   ├── styles/
   │   └── tailwind.config.js
   └── page.tsx
```

---

## 📊 GICM MARKETPLACE INTEGRATION

### Auto-Publish Workflow
```yaml
workflow: grab-to-marketplace
steps:
  1. User grabs component
  2. COUNCIL reviews quality
  3. If approved (score > 90):
     - Auto-format for marketplace
     - Generate preview + docs
     - Add to GICM registry
  4. Publish with metadata

quality_gates:
  - accessibility: 90+
  - responsive: mobile + desktop
  - typescript: proper types
  - council: approved
```

### Batch Population
```
# Populate from design sites
"mode: SWARM"
"grab top 50 UI components from Dribbble"
"publish all to GICM marketplace"
→ 50 components with previews + docs

# Batch from screenshots folder
"grab all screenshots in /designs/"
"publish to GICM as component library"
```

---

## 🎓 BEST PRACTICES

### For Grabs
1. **Start with theme-grab** - Extract design system first
2. **Use SWARM for batch** - Parallel processing saves time
3. **COUNCIL for quality** - Let AI review before publishing
4. **Cache patterns** - Memory stores reusable patterns

### For Research
1. **Combine sources** - Tavily (news) + Exa (semantic) + Firecrawl (deep)
2. **Use Context7 for code** - Always current library docs
3. **Verify with COUNCIL** - Cross-check findings

### For Browser Automation
1. **Prefer Playwright Snapshot Mode** - Faster, more reliable
2. **Use Stagehand for complex flows** - Better natural language
3. **Cache actions** - Avoid redundant AI calls

### For Cost Optimization
1. **Use FREE tools first** - Jina, Context7, local Playwright
2. **Cache aggressively** - Memory patterns reduce re-grabs
3. **Batch operations** - SWARM parallel processing
4. **DeepSeek for generation** - $0.001 vs Claude's $0.01

---

## 🏁 VERSION SUMMARY

**OPUS 67 v3.1 "The Eyes Update"**

```
Total Skills:    78  (+30)
Total Agents:    66  (+16)
Total Modes:     26  (+4)
Total MCPs:      62  (+22)

New Capabilities:
✅ 15 GRAB skills (visual-to-code)
✅ Web scraping (Firecrawl, Jina, Crawl4AI)
✅ AI Search (Tavily, Exa)
✅ Browser automation (Playwright, Stagehand)
✅ Documentation (Context7)
✅ Desktop context (ScreenPipe)
✅ Screenshot to code
✅ CLONE mode for full sites
✅ RESEARCH mode for deep analysis
✅ CONTEXT mode for desktop awareness
```

**Upgrade from v3.0:**
```bash
./upgrade-v31.sh
```

---

*OPUS 67 v3.1 - See everything. Build anything.*
