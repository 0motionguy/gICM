#!/bin/bash
# OPUS 67 v3.1 "The Eyes Update" - Upgrade Script
# Run from your OPUS 67 project root

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           OPUS 67 v3.1 'The Eyes Update' Installer            ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  +30 Skills  |  +16 Agents  |  +4 Modes  |  +22 MCPs          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in a valid directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run from project root."
    exit 1
fi

echo "📦 Installing new npm dependencies..."
npm install --save \
    @mendable/firecrawl-js \
    @browserbasehq/stagehand \
    puppeteer \
    sharp \
    @react-pdf/renderer \
    @react-email/components \
    gifuct-js \
    2>/dev/null || echo "⚠️  Some packages may require manual installation"

echo ""
echo "🐍 Installing Python dependencies..."
pip install --break-system-packages --quiet \
    crawl4ai \
    2>/dev/null || echo "⚠️  Python packages may require manual installation"

echo ""
echo "📁 Creating directory structure..."
mkdir -p skills/{grab,search,browser,context}
mkdir -p agents/{vision,data,browser}
mkdir -p mcp/{firecrawl,tavily,exa,playwright,stagehand,context7,screenpipe,jina}
mkdir -p modes

echo ""
echo "📝 Creating MCP configuration template..."
cat > mcp-config.template.json << 'EOF'
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "YOUR_FIRECRAWL_KEY" }
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_TAVILY_KEY"]
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server", "tools=web_search_exa,get_code_context_exa,deep_search_exa,company_research_exa"],
      "env": { "EXA_API_KEY": "YOUR_EXA_KEY" }
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
EOF

echo ""
echo "🔧 Updating version..."
cat > .opus67-version << EOF
{
  "version": "3.1.0",
  "codename": "The Eyes Update",
  "upgraded": "$(date -Iseconds)",
  "from": "3.0.0"
}
EOF

echo ""
echo "🔑 Environment variables needed (add to .env):"
echo ""
echo "# Required for full functionality"
echo "FIRECRAWL_API_KEY=fc-xxx          # Get from firecrawl.dev"
echo "TAVILY_API_KEY=tvly-xxx           # Get from tavily.com (1000 free/mo)"
echo "EXA_API_KEY=xxx                   # Get from exa.ai"
echo ""
echo "# Optional"
echo "BROWSERBASE_API_KEY=xxx           # For cloud browser sessions"
echo "FIGMA_ACCESS_TOKEN=xxx            # For Figma imports"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Upgrade Complete!                        ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  New Capabilities:                                             ║"
echo "║  • 15 GRAB skills (screenshot → code)                         ║"
echo "║  • Firecrawl, Tavily, Exa search MCPs                         ║"
echo "║  • Playwright + Stagehand browser automation                  ║"
echo "║  • Context7 fresh library documentation                       ║"
echo "║  • ScreenPipe desktop context                                 ║"
echo "║  • GRAB, CLONE, RESEARCH, CONTEXT modes                       ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  FREE Tools Available:                                         ║"
echo "║  • Jina Reader: curl https://r.jina.ai/URL                    ║"
echo "║  • Context7: 'use context7' in any prompt                     ║"
echo "║  • Playwright MCP: unlimited browser automation               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 Next Steps:"
echo "   1. Add API keys to .env file"
echo "   2. Copy mcp-config.template.json to your MCP client config"
echo "   3. Restart your IDE/Claude Desktop"
echo "   4. Try: 'grab this' with any screenshot"
echo ""
echo "📖 Documentation: OPUS67-v31-COMPREHENSIVE.md"
echo "⚙️  Configuration: OPUS67-v31-CONFIG.json"
