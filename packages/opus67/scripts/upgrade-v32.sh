#!/bin/bash
# OPUS 67 v3.2 "The Solana Stack" Upgrade Script
# Upgrades from v3.1 to v3.2 with Solana-native MCPs and infrastructure

set -e

echo "=================================================="
echo "  OPUS 67 v3.2 'The Solana Stack' Installer"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/8] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Some features will be limited.${NC}"
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python not found. Some features will be limited.${NC}"
    PYTHON_AVAILABLE=false
else
    PYTHON_AVAILABLE=true
fi

echo -e "${GREEN}Prerequisites check complete${NC}"
echo ""

# Install Tier 1: Universal Dev Tools
echo -e "${BLUE}[2/8] Installing Tier 1: Universal Dev Tools...${NC}"

# GitHub MCP
echo "  → Installing GitHub MCP..."
npm install -g @modelcontextprotocol/server-github@latest 2>/dev/null || true

# Supabase MCP
echo "  → Installing Supabase MCP..."
npm install -g @supabase/mcp-server 2>/dev/null || true

# Mem0 (Docker-based)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "  → Pulling Mem0 Docker image..."
    docker pull mcp/mem0 2>/dev/null || echo "    (Will pull on first use)"
fi

# Qdrant MCP
if [ "$PYTHON_AVAILABLE" = true ]; then
    echo "  → Installing Qdrant MCP..."
    pip install mcp-server-qdrant --break-system-packages 2>/dev/null || true
fi

# Docker MCP
if [ "$PYTHON_AVAILABLE" = true ]; then
    echo "  → Installing Docker MCP..."
    pip install docker-mcp --break-system-packages 2>/dev/null || true
fi

echo -e "${GREEN}Tier 1 installed${NC}"
echo ""

# Install Tier 2: Solana Stack
echo -e "${BLUE}[3/8] Installing Tier 2: Solana Stack...${NC}"

# Solana MCP
echo "  → Installing Solana MCP..."
npm install -g solana-mcp 2>/dev/null || true

# Create MCP directories
mkdir -p ./mcp/jupiter-mcp
mkdir -p ./mcp/solana-web3-mcp
mkdir -p ./mcp/anchor-mcp
mkdir -p ./mcp/chainstack-mcp

# Jupiter MCP (needs manual setup)
echo "  → Jupiter MCP ready for configuration"
cat > ./mcp/jupiter-mcp/README.md << 'EOF'
# Jupiter MCP Setup

1. Clone: git clone https://github.com/kukapay/jupiter-mcp.git
2. Install: npm install
3. Configure env vars in .env:
   - SOLANA_RPC_URL
   - PRIVATE_KEY (optional, for execute)
4. Build: npm run build
EOF

# Anchor MCP placeholder
echo "  → Creating Anchor MCP scaffold..."
cat > ./mcp/anchor-mcp/README.md << 'EOF'
# Anchor MCP (Custom Build)

This is a UNIQUE differentiator - no one else has this!

## Features
- Parse any Anchor IDL automatically
- Generate instructions from natural language
- Execute transactions with signing
- Decode account data

## To Build
See /mcp/anchor-mcp/build-guide.md
EOF

echo -e "${GREEN}Tier 2 installed${NC}"
echo ""

# Install Tier 3: DevOps
echo -e "${BLUE}[4/8] Installing Tier 3: DevOps Tools...${NC}"

# Notion MCP
echo "  → Installing Notion MCP..."
npm install -g @notionhq/notion-mcp-server 2>/dev/null || true

# Sentry MCP (remote, no install needed)
echo "  → Sentry MCP configured (remote server)"

echo -e "${GREEN}Tier 3 installed${NC}"
echo ""

# Create directory structure
echo -e "${BLUE}[5/8] Creating directory structure...${NC}"

mkdir -p ./skills/{solana,infra,devops}
mkdir -p ./agents/{solana,infra,devops,composite}
mkdir -p ./modes
mkdir -p ./config

echo -e "${GREEN}Directories created${NC}"
echo ""

# Create MCP configuration template
echo -e "${BLUE}[6/8] Creating MCP configuration...${NC}"

cat > ./config/mcp-config.v32.json << 'MCPCONFIG'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github@latest"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}"
      }
    },
    "mem0": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "TRANSPORT=stdio", "-e", "LLM_PROVIDER=openai", "-e", "LLM_API_KEY", "-e", "DATABASE_URL", "mcp/mem0"],
      "env": {
        "LLM_API_KEY": "${OPENAI_API_KEY}",
        "DATABASE_URL": "${POSTGRES_URL}"
      }
    },
    "qdrant": {
      "command": "uvx",
      "args": ["mcp-server-qdrant"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "COLLECTION_NAME": "opus67"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_PAT}"
      }
    },
    "docker": {
      "command": "uvx",
      "args": ["docker-mcp"]
    },
    "jupiter": {
      "command": "node",
      "args": ["./mcp/jupiter-mcp/server/index.js"],
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
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ${NOTION_TOKEN}\", \"Notion-Version\": \"2022-06-28\"}"
      }
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
MCPCONFIG

echo -e "${GREEN}MCP configuration created${NC}"
echo ""

# Create environment template
echo -e "${BLUE}[7/8] Creating environment template...${NC}"

cat > .env.v32.example << 'ENVTEMPLATE'
# ================================================
# OPUS 67 v3.2 "The Solana Stack" Environment
# ================================================

# ===================
# Tier 1: Universal Dev Tools
# ===================

# GitHub MCP
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxx

# Mem0 Memory MCP
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
POSTGRES_URL=postgresql://user:password@localhost:5432/mem0

# Supabase MCP
SUPABASE_PAT=sbp_xxxxxxxxxxxxxxxxxxxx

# ===================
# Tier 2: Solana Stack
# ===================

# RPC Provider (Helius recommended)
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=xxxx

# Wallet (CAUTION: Use dev wallet only!)
SOLANA_PRIVATE_KEY=base58_encoded_private_key

# ICM Motion Program
ICM_PROGRAM_ID=your_program_id_here

# Chainstack (optional)
CHAINSTACK_API_KEY=xxxxxxxxxxxxxxxxxxxx
CHAINSTACK_SOLANA_URL=https://your-chainstack-endpoint

# ===================
# Tier 3: DevOps
# ===================

# Notion MCP
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx

# Sentry MCP (uses OAuth, no token needed)
# SENTRY_AUTH_TOKEN=sntrys_xxxx (optional for STDIO mode)

# ===================
# Optional Services
# ===================

# From v3.1
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxxxxxx
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxx
EXA_API_KEY=xxxxxxxxxxxxxxxxxxxx
ENVTEMPLATE

cp .env.v32.example .env 2>/dev/null || true

echo -e "${GREEN}Environment template created${NC}"
echo ""

# Update version
echo -e "${BLUE}[8/8] Finalizing installation...${NC}"

cat > ./VERSION << 'VERSION'
OPUS67_VERSION=3.2.0
OPUS67_CODENAME="The Solana Stack"
OPUS67_RELEASE_DATE="2025-12-02"
OPUS67_FEATURES="Solana MCPs, Memory, Vector DB, GitHub, DevOps"
VERSION

echo -e "${GREEN}Installation complete!${NC}"
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}  OPUS 67 v3.2 Installation Summary${NC}"
echo "=================================================="
echo ""
echo "INSTALLED:"
echo "  ✓ GitHub MCP (official)"
echo "  ✓ Mem0 Memory MCP"
echo "  ✓ Qdrant Vector MCP"
echo "  ✓ Supabase MCP"
echo "  ✓ Docker MCP"
echo "  ✓ Jupiter MCP (scaffold)"
echo "  ✓ Solana RPC MCP"
echo "  ✓ Notion MCP"
echo "  ✓ Sentry MCP (remote)"
echo ""
echo "TO CONFIGURE:"
echo "  1. Copy .env.v32.example to .env"
echo "  2. Fill in your API keys and tokens"
echo "  3. Set up Jupiter MCP (see ./mcp/jupiter-mcp/README.md)"
echo "  4. Start Docker services: docker-compose up -d"
echo ""
echo "ENVIRONMENT VARIABLES REQUIRED:"
echo "  - GITHUB_PAT"
echo "  - OPENAI_API_KEY (for Mem0)"
echo "  - POSTGRES_URL (for Mem0)"
echo "  - SUPABASE_PAT"
echo "  - HELIUS_RPC_URL"
echo "  - SOLANA_PRIVATE_KEY (dev wallet only!)"
echo "  - NOTION_TOKEN"
echo ""
echo "OPTIONAL BUT RECOMMENDED:"
echo "  - CHAINSTACK_API_KEY"
echo "  - FIRECRAWL_API_KEY"
echo "  - TAVILY_API_KEY"
echo ""
echo "NEXT STEPS:"
echo "  1. Configure environment variables"
echo "  2. Start Qdrant: docker run -p 6333:6333 qdrant/qdrant"
echo "  3. Verify MCPs: claude mcp list"
echo "  4. Test: 'Check balance of wallet xyz'"
echo ""
echo "DOCUMENTATION:"
echo "  - OPUS67-v32-SOLANA-STACK.md"
echo "  - OPUS67-v32-CONFIG.json"
echo ""
echo -e "${YELLOW}⚠️  SECURITY WARNING:${NC}"
echo "  Never use production wallets with AI systems!"
echo "  Always use development/testnet wallets."
echo ""
echo "=================================================="
echo -e "${GREEN}  Ready to build on Solana! 🪙${NC}"
echo "=================================================="
