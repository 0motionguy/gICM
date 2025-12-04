# OPUS 67 v3.2 "The Solana Stack" 🪙

> Building on v3.1 "The Eyes Update" with critical infrastructure, universal dev tools, and **Solana-native differentiators**

---

## 📊 Executive Summary

v3.2 transforms OPUS 67 from a general-purpose AI development system into a **Solana-native powerhouse** while adding universal infrastructure that every serious developer needs.

### Version Progression

| Version | Codename | Focus | Key Addition |
|---------|----------|-------|--------------|
| v2.1 | Base | Foundation | 48 skills, 21 MCPs |
| v3.0 | Vision | Multi-Model | Gemini/DeepSeek routing, $7/mo |
| v3.1 | Eyes Update | Visual-First | 15 GRAB skills, screenshot→code |
| **v3.2** | **Solana Stack** | **Blockchain-Native** | **Jupiter, Solana RPC, Memory** |

### v3.2 Stats

| Metric | v3.1 | v3.2 | Delta |
|--------|------|------|-------|
| Skills | 78 | 95 | +17 |
| Agents | 66 | 82 | +16 |
| Modes | 26 | 30 | +4 |
| MCPs | 62 | 84 | +22 |
| **Solana MCPs** | 0 | **7** | **NEW** |

---

## 🏗️ Architecture Tiers

### Tier 1: Universal Dev Tools (CRITICAL)

Every developer needs these. Maximum ROI, minimum effort.

#### 1. GitHub MCP (Official) 🐙
**Source**: [github.com/github/github-mcp-server](https://github.com/github/github-mcp-server)

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github@latest"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}"
    }
  }
}
```

**Tools**:
- `search_repositories` - Search GitHub repos
- `get_file_contents` - Read files from repos
- `create_issue` / `update_issue` - Issue management
- `create_pull_request` - PR automation
- `list_commits` - Commit history
- `search_code` - Code search across repos

**Cost**: FREE (with PAT)
**Effort**: Low (5 min setup)

#### 2. Mem0 Memory MCP 🧠
**Source**: [github.com/coleam00/mcp-mem0](https://github.com/coleam00/mcp-mem0)

```json
{
  "mem0": {
    "command": "docker",
    "args": ["run", "--rm", "-i", "-e", "TRANSPORT", "-e", "LLM_PROVIDER", "-e", "LLM_API_KEY", "-e", "DATABASE_URL", "mcp/mem0"],
    "env": {
      "TRANSPORT": "stdio",
      "LLM_PROVIDER": "openai",
      "LLM_API_KEY": "${OPENAI_API_KEY}",
      "DATABASE_URL": "${POSTGRES_URL}"
    }
  }
}
```

**Tools**:
- `save_memory` - Store information with semantic indexing
- `get_all_memories` - Retrieve stored memories
- `search_memories` - Semantic search across memories
- `delete_memory` - Remove specific memories

**Why Critical**: 
- Persistence = Stickiness (users return)
- Remember wallet addresses, program IDs, preferences
- Cross-session context without repetition

**Cost**: FREE (self-hosted) or $20/mo (cloud)
**Effort**: Medium (Docker + Postgres)

#### 3. Qdrant Vector DB MCP 🔍
**Source**: [github.com/qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant)

```json
{
  "qdrant": {
    "command": "uvx",
    "args": ["mcp-server-qdrant"],
    "env": {
      "QDRANT_URL": "http://localhost:6333",
      "COLLECTION_NAME": "opus67",
      "EMBEDDING_MODEL": "sentence-transformers/all-MiniLM-L6-v2"
    }
  }
}
```

**Tools**:
- `qdrant-store` - Store with semantic embeddings
- `qdrant-find` - Semantic similarity search

**Use Cases**:
- Code snippet retrieval
- Documentation search
- Pattern matching for GRAB skills
- RAG for Solana docs

**Cost**: FREE (self-hosted)
**Effort**: Medium (Docker)

#### 4. Supabase MCP 🗄️
**Source**: [github.com/supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp)

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server"],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "${SUPABASE_PAT}"
    }
  }
}
```

**Tools**:
- `list_projects` - List all Supabase projects
- `execute_sql` - Run SQL queries
- `apply_migration` - Apply schema migrations
- `list_tables` - Schema introspection
- `get_logs` - Retrieve logs
- `generate_typescript_types` - Auto-generate types

**Cost**: FREE (Supabase free tier)
**Effort**: Low (just needs PAT)

#### 5. Docker MCP 🐳
**Source**: [github.com/QuantGeekDev/docker-mcp](https://github.com/QuantGeekDev/docker-mcp)

```json
{
  "docker": {
    "command": "uvx",
    "args": ["docker-mcp"]
  }
}
```

**Tools**:
- `create_container` - Spawn containers
- `list_containers` - List running containers
- `get_logs` - Container logs
- `deploy_compose` - Docker Compose deployment
- `stop_container` - Stop containers

**Cost**: FREE
**Effort**: Low (just Docker Desktop)

---

### Tier 2: Solana-Specific MCPs (UNIQUE MOAT) 🪙

**This is where OPUS 67 becomes differentiated.** No other system has this native Solana integration.

#### 6. Jupiter MCP ⚡
**Source**: [github.com/kukapay/jupiter-mcp](https://github.com/kukapay/jupiter-mcp)

```json
{
  "jupiter": {
    "command": "node",
    "args": ["path/to/jupiter-mcp/server/index.js"],
    "env": {
      "SOLANA_RPC_URL": "${HELIUS_RPC_URL}",
      "PRIVATE_KEY": "${SOLANA_PRIVATE_KEY}"
    }
  }
}
```

**Tools**:
- `get_swap_quote` - Get optimal swap route
- `execute_swap` - Execute token swap
- `get_token_info` - Token metadata

**Natural Language Examples**:
```
"Swap 1 SOL for USDC"
"Get quote for 100 BONK to SOL"
"What's the best rate for swapping my tokens?"
```

**Cost**: FREE (network fees only)
**Effort**: Medium

#### 7. Solana RPC MCP 🔗
**Source**: [github.com/sendaifun/solana-mcp](https://github.com/sendaifun/solana-mcp)

```json
{
  "solana": {
    "command": "npx",
    "args": ["solana-mcp"],
    "env": {
      "RPC_URL": "${HELIUS_RPC_URL}",
      "SOLANA_PRIVATE_KEY": "${SOLANA_PRIVATE_KEY}"
    }
  }
}
```

**Tools**:
- `get_balance` - Check SOL balance
- `get_token_accounts` - List token holdings
- `get_transaction` - Transaction details
- `get_account_info` - Account data
- `get_recent_blockhash` - Network state
- `send_transaction` - Submit transactions

**Natural Language Examples**:
```
"What's the balance of wallet CebN5..."
"Show me all tokens in this wallet"
"Get the last 10 transactions"
```

**Cost**: RPC costs (Helius free tier: 100k/day)
**Effort**: Low

#### 8. Solana Web3.js MCP 🛠️
**Source**: [github.com/FrankGenGo/solana-web3js-mcp-server](https://github.com/FrankGenGo/solana-web3js-mcp-server)

```json
{
  "solana-web3": {
    "command": "node",
    "args": ["/path/to/solana-web3js-mcp-server/dist/index.js"]
  }
}
```

**Tools**:
- `generate_keypair` - Create new wallets
- `deploy_program` - Deploy Solana programs
- `create_token` - SPL token creation
- `mint_tokens` - Mint to accounts
- `transfer` - SOL/SPL transfers

**This is the missing link for ICM Motion development!**

**Cost**: FREE + network fees
**Effort**: Medium

#### 9. Anchor Program MCP 🔧 (CUSTOM BUILD)

**⚠️ THIS IS THE KILLER FEATURE - NO ONE ELSE HAS THIS**

This MCP parses Anchor IDLs and generates instructions automatically.

```json
{
  "anchor": {
    "command": "node",
    "args": ["./mcp/anchor-mcp/index.js"],
    "env": {
      "IDL_PATH": "./target/idl/",
      "PROGRAM_ID": "${ICM_PROGRAM_ID}",
      "RPC_URL": "${HELIUS_RPC_URL}"
    }
  }
}
```

**Tools** (auto-generated from IDL):
- `parse_idl` - Parse any Anchor IDL
- `generate_instruction` - Build instruction from natural language
- `execute_instruction` - Execute with signing
- `get_account_data` - Decode account data
- `simulate_transaction` - Dry run

**Natural Language Examples**:
```
"Initialize a new bonding curve with 10% reserve"
"Buy 1000 tokens from curve at address xyz"
"What's the current reserve in this curve?"
```

**Why This Is Unique**:
- No other MCP system has natural language → Anchor instruction generation
- ICM Motion can be controlled entirely through conversation
- Competitors would need months to replicate

**Cost**: FREE (we build it)
**Effort**: High (but worth it)

#### 10. Chainstack Solana MCP 📊
**Source**: [Chainstack MCP](https://chainstack.com/mcp-for-web3-builders-solana-evm-and-documentation-server-by-chainstack/)

```json
{
  "chainstack-solana": {
    "command": "npx",
    "args": ["-y", "@chainstacklabs/solana-mcp"],
    "env": {
      "CHAINSTACK_API_KEY": "${CHAINSTACK_KEY}",
      "SOLANA_ENDPOINT": "${CHAINSTACK_SOLANA_URL}"
    }
  }
}
```

**Tools**:
- `get_signatures` - Transaction signatures
- `get_token_largest_accounts` - Top holders
- `get_program_accounts` - Program state
- `subscribe_logs` - Real-time logs

**Cost**: Chainstack pricing (~$29/mo for Growth)
**Effort**: Low

---

### Tier 3: DevOps & Productivity (Easy Wins)

#### 11. Notion MCP 📝
**Source**: [github.com/makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server)

```json
{
  "notion": {
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": {
      "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ${NOTION_TOKEN}\", \"Notion-Version\": \"2022-06-28\"}"
    }
  }
}
```

**Tools**:
- `search` - Search Notion workspace
- `create_page` - Create new pages
- `update_page` - Update pages
- `query_database` - Query databases
- `create_database` - Create databases

**Cost**: FREE
**Effort**: Low

#### 12. Sentry MCP 🐛
**Source**: [docs.sentry.io/product/sentry-mcp](https://docs.sentry.io/product/sentry-mcp/)

```json
{
  "sentry": {
    "type": "http",
    "url": "https://mcp.sentry.dev/mcp"
  }
}
```

**Tools**:
- `list_projects` - List Sentry projects
- `list_issues` - Get error issues
- `get_issue` - Issue details
- `list_events` - Error events
- `trigger_seer` - AI root cause analysis

**Natural Language Examples**:
```
"What errors happened in the last 24 hours?"
"Show me the stack trace for issue ABC123"
"Which deployment introduced these bugs?"
```

**Cost**: FREE (Sentry free tier)
**Effort**: Very Low (just OAuth)

---

## 🤖 New Agents (16)

### Infrastructure Agents

| Agent | Icon | Role | MCPs Used |
|-------|------|------|-----------|
| **Repo Master** | 🐙 | GitHub automation | github-mcp |
| **Memory Keeper** | 🧠 | Persistent context | mem0-mcp |
| **Vector Wizard** | 🔍 | Semantic search | qdrant-mcp |
| **DB Commander** | 🗄️ | Database operations | supabase-mcp, postgres-mcp |
| **Container Chief** | 🐳 | Docker management | docker-mcp |

### Solana Agents

| Agent | Icon | Role | MCPs Used |
|-------|------|------|-----------|
| **Jupiter Trader** | ⚡ | Token swaps | jupiter-mcp |
| **Chain Reader** | 🔗 | Blockchain queries | solana-mcp |
| **Program Builder** | 🛠️ | Solana development | solana-web3-mcp |
| **Anchor Architect** | 🔧 | Anchor programs | anchor-mcp |
| **DeFi Analyst** | 📊 | On-chain analytics | chainstack-mcp |

### DevOps Agents

| Agent | Icon | Role | MCPs Used |
|-------|------|------|-----------|
| **Notion Navigator** | 📝 | Documentation | notion-mcp |
| **Error Hunter** | 🐛 | Bug tracking | sentry-mcp |
| **CI/CD Automator** | 🔄 | Deployment | github-mcp, docker-mcp |

### Composite Agents

| Agent | Icon | Role | MCPs Combined |
|-------|------|------|---------------|
| **Full Stack Builder** | 🏗️ | End-to-end dev | github + supabase + docker |
| **Solana Stack** | 🪙 | Complete Solana | jupiter + solana + anchor |
| **Research Synth** | 🔬 | Deep research | mem0 + qdrant + tavily + exa |

---

## 🎮 New Modes (4)

### SOLANA Mode 🪙
```
Activates: jupiter-mcp, solana-mcp, anchor-mcp, chainstack-mcp
Commands: /swap, /balance, /deploy, /curve
Workflow: Natural language → Solana transactions
```

### INFRA Mode 🏗️
```
Activates: github-mcp, docker-mcp, supabase-mcp
Commands: /repo, /deploy, /db
Workflow: Infrastructure as conversation
```

### MEMORY Mode 🧠
```
Activates: mem0-mcp, qdrant-mcp
Commands: /remember, /recall, /forget
Workflow: Persistent context management
```

### DEBUG Mode 🐛
```
Activates: sentry-mcp, github-mcp
Commands: /errors, /trace, /fix
Workflow: Error → Root cause → PR
```

---

## 💰 Cost Analysis

### Monthly Estimates by Usage

| Profile | Description | Est. Cost |
|---------|-------------|-----------|
| **Solo Dev** | Light usage, free tiers | ~$10/mo |
| **Active Builder** | Regular swaps, DB ops | ~$25/mo |
| **Power User** | Heavy automation | ~$50/mo |
| **Team (5 devs)** | Shared infrastructure | ~$100/mo |

### Cost Breakdown by Service

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| GitHub | Unlimited | - |
| Mem0 | Self-hosted | $20/mo cloud |
| Qdrant | Self-hosted | $25/mo cloud |
| Supabase | 500MB DB | $25/mo Pro |
| Helius RPC | 100k/day | $49/mo |
| Chainstack | - | $29/mo |
| Sentry | 5k events | $26/mo |
| Notion | Personal | $10/mo |

### FREE Stack Option

For maximum cost efficiency:
```
GitHub MCP (FREE)
Mem0 MCP (self-hosted, FREE)
Qdrant MCP (self-hosted, FREE)
Supabase MCP (free tier, FREE)
Docker MCP (FREE)
Solana RPC MCP (Helius free, FREE)
Jupiter MCP (FREE, just gas)
Notion MCP (FREE)
Sentry MCP (free tier, FREE)

Total: ~$0/mo + network fees
```

---

## 🚀 The Killer Use Case

**"Build me a Pump.fun clone"**

With v3.2, this becomes a conversation:

```
User: "Build me a Pump.fun clone"

OPUS 67 v3.2:
1. [GitHub MCP] Pull Anchor bonding curve examples
2. [Anchor MCP] Parse IDLs, generate instruction handlers
3. [Supabase MCP] Set up database schema
4. [GRAB Skills] Clone UI from reference sites
5. [Jupiter MCP] Integrate token swaps
6. [Mem0 MCP] Remember project state, wallet addresses
7. [Docker MCP] Deploy development environment
8. [Sentry MCP] Set up error tracking

Result: Working clone in hours, not weeks
```

---

## 📦 Installation

### Quick Start

```bash
# Clone OPUS 67
git clone https://github.com/your-org/opus67.git
cd opus67

# Run v3.2 installer
chmod +x upgrade-opus67-v32.sh
./upgrade-opus67-v32.sh

# Configure environment
cp .env.example .env
# Edit .env with your tokens

# Start infrastructure
docker-compose up -d

# Verify MCPs
claude mcp list
```

### Required Environment Variables

```bash
# Tier 1: Universal Dev Tools
GITHUB_PAT=ghp_...
OPENAI_API_KEY=sk-...
POSTGRES_URL=postgresql://...
SUPABASE_ACCESS_TOKEN=sbp_...

# Tier 2: Solana Stack
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=...
SOLANA_PRIVATE_KEY=base58_encoded_key
CHAINSTACK_API_KEY=...

# Tier 3: DevOps
NOTION_TOKEN=secret_...
SENTRY_AUTH_TOKEN=sntrys_...

# Optional
FIRECRAWL_API_KEY=...
TAVILY_API_KEY=tvly-...
EXA_API_KEY=...
```

---

## 🔧 Configuration Files

### Claude Desktop / Code

Add to `~/.claude.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}" }
    },
    "mem0": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/mem0"],
      "env": { "DATABASE_URL": "${POSTGRES_URL}" }
    },
    "qdrant": {
      "command": "uvx",
      "args": ["mcp-server-qdrant"],
      "env": { "QDRANT_URL": "http://localhost:6333" }
    },
    "supabase": {
      "command": "npx", 
      "args": ["-y", "@supabase/mcp-server"],
      "env": { "SUPABASE_ACCESS_TOKEN": "${SUPABASE_PAT}" }
    },
    "docker": {
      "command": "uvx",
      "args": ["docker-mcp"]
    },
    "jupiter": {
      "command": "node",
      "args": ["./mcp/jupiter-mcp/index.js"],
      "env": {
        "SOLANA_RPC_URL": "${HELIUS_RPC_URL}",
        "PRIVATE_KEY": "${SOLANA_PRIVATE_KEY}"
      }
    },
    "solana": {
      "command": "npx",
      "args": ["solana-mcp"],
      "env": {
        "RPC_URL": "${HELIUS_RPC_URL}",
        "SOLANA_PRIVATE_KEY": "${SOLANA_PRIVATE_KEY}"
      }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ${NOTION_TOKEN}\"}"
      }
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

---

## 📋 Complete MCP Registry (v3.2)

### From v3.1 (Retained)
- firecrawl-mcp, tavily-mcp, exa-mcp, jina-mcp
- playwright-mcp, stagehand-mcp
- context7-mcp, screenpipe-mcp

### New in v3.2 (22 additions)

| Category | MCPs |
|----------|------|
| **Dev Tools** | github-mcp (official), mem0-mcp, qdrant-mcp |
| **Database** | supabase-mcp, postgres-mcp-pro |
| **DevOps** | docker-mcp, docker-hub-mcp, sentry-mcp |
| **Solana** | jupiter-mcp, solana-mcp, solana-web3-mcp, chainstack-solana-mcp |
| **Productivity** | notion-mcp (official), slack-mcp, linear-mcp |
| **Custom** | anchor-mcp (BUILD), icm-motion-mcp (BUILD) |

---

## 🎯 Strategic Value

### Immediate Benefits
1. **10x Development Speed**: Natural language → Solana transactions
2. **Persistent Context**: Never repeat wallet addresses, PDAs, program IDs
3. **Error Resolution**: Sentry → Claude → PR in minutes
4. **Documentation Sync**: Code changes auto-update Notion docs

### Competitive Moat
1. **Anchor MCP**: No competitor has natural language → Anchor instructions
2. **Jupiter Integration**: Trade tokens through conversation
3. **Memory Persistence**: Users return because context is preserved
4. **Full Stack Automation**: GitHub → Supabase → Docker → Deploy

### ICM Motion Integration
```
Anchor MCP + Jupiter MCP + Solana RPC MCP
= Complete bonding curve management through natural language

"Create a curve with 5% reserve and 1B supply"
"Buy 10000 tokens from curve xyz"
"What's the current price and liquidity?"
"Launch to Raydium when market cap hits $100k"
```

---

## 📈 Roadmap to v3.3

### Planned Additions
- [ ] Helius Webhooks MCP (real-time alerts)
- [ ] Birdeye API MCP (token analytics)
- [ ] Metaplex MCP (NFT operations)
- [ ] Tensor MCP (NFT trading)
- [ ] Magic Eden MCP (marketplace)
- [ ] Phantom Deeplink MCP (wallet signing)

### Custom MCPs to Build
- [ ] ICM Motion MCP (full curve control)
- [ ] Pump.fun Monitor MCP (competitor tracking)
- [ ] DEX Analytics MCP (cross-DEX data)
- [ ] Whale Alerts MCP (large transactions)

---

## 📝 Changelog

### v3.2.0 (December 2025)
- Added 22 new MCPs
- Added 16 new agents
- Added 4 new modes
- Added 17 new skills
- Solana-native integration complete
- Memory persistence layer added
- DevOps automation suite added

### Breaking Changes
- None from v3.1

### Migration Notes
- Run `upgrade-opus67-v32.sh`
- Set new environment variables
- Docker required for mem0 and qdrant

---

*OPUS 67 v3.2 "The Solana Stack" - Where AI meets Web3*
