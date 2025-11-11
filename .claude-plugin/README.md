# gICM Claude Code Marketplace

Official Claude Code marketplace integration for [gICM](https://gicm-marketplace.vercel.app) - The complete marketplace for Web3 builders.

## Quick Start

### Installation

Add the gICM marketplace to your Claude Code instance:

```bash
/plugin marketplace add Kermit457/gICM
```

Then browse and install plugins:

```bash
# List all available plugins
/plugin list

# Install a specific plugin
/plugin install icm-anchor-architect

# Install with dependencies
/plugin install icm-anchor-architect --with-deps
```

## What's Included

**409 Production-Ready Plugins:**

- **91 Agents** - Specialized AI assistants (Solana, DeFi, Frontend, Security, etc.)
- **96 Skills** - Progressive disclosure knowledge modules (88-92% token savings)
- **93 Commands** - Slash commands for workflows and automation
- **82 MCPs** - Model Context Protocol servers for external integrations
- **48 Settings** - Claude Code configuration optimizations

## Popular Plugins

### Solana & Web3 Development

```bash
/plugin install icm-anchor-architect       # Solana program specialist
/plugin install frontend-fusion-engine     # Next.js + Web3 wallet integration
/plugin install smart-contract-auditor     # Security auditing
/plugin install defi-integration-architect # DeFi protocol integration
```

### Full-Stack Development

```bash
/plugin install fullstack-orchestrator     # End-to-end feature builder
/plugin install database-schema-oracle     # PostgreSQL + Supabase expert
/plugin install api-design-architect       # RESTful + tRPC specialist
/plugin install typescript-precision-engineer # Strict TypeScript expert
```

### Security & Testing

```bash
/plugin install evm-security-auditor       # EVM smart contract auditor
/plugin install test-automation-engineer   # Jest, Vitest, Playwright
/plugin install security-engineer          # Application security specialist
```

## Features

### Automatic Dependency Resolution

Plugins automatically install their dependencies:

```bash
# Installing icm-anchor-architect also installs:
# - rust-systems-architect (dependency)
# - solana-guardian-auditor (dependency)
/plugin install icm-anchor-architect
```

### Progressive Disclosure Skills

Skills use Claude's Progressive Disclosure feature to reduce token usage by 88-92%:

- **Traditional approach**: 12,500 tokens (full codebase + docs loaded upfront)
- **Progressive Disclosure**: 980 tokens (only relevant context loaded on demand)
- **Savings**: 92% reduction, same quality

### Model Recommendations

Each plugin specifies optimal model for performance:

- **Opus**: Complex tasks (architecture design, security audits)
- **Sonnet**: Balanced tasks (most development work)
- **Haiku**: Fast deterministic tasks (code generation, testing)

### Environment Variable Management

Plugins declare required environment variables:

```json
{
  "envKeys": [
    "SOLANA_RPC_URL",
    "ANCHOR_WALLET"
  ]
}
```

Claude Code will prompt you to configure these on first use.

## Dual Installation Method

gICM supports two installation methods - choose what works best for you:

### Method 1: Claude Code Marketplace (Recommended)

**Pros:**
- Browse plugins within Claude Code UI
- Automatic updates
- Team-wide settings sync
- Lower friction (in-app discovery)

```bash
/plugin marketplace add Kermit457/gICM
/plugin install icm-anchor-architect
```

### Method 2: Standalone CLI

**Pros:**
- Works outside Claude Code (CI/CD, automation scripts)
- Enhanced features (analytics, stack builder, remixes)
- Direct API access
- Faster for bulk installs

```bash
npx @gicm/cli add agent/icm-anchor-architect
```

**Both methods install to the same `.claude/` directory!**

## Categories

Browse plugins by category:

| Category | Description | Plugin Count |
|----------|-------------|--------------|
| **Development Team** | Full-stack, frontend, backend, database specialists | 15+ |
| **Blockchain & Web3** | Solana, EVM, DeFi, NFT, Layer 2 experts | 20+ |
| **Security & Testing** | Auditors, test automation, security engineers | 12+ |
| **AI & ML** | Machine learning, MLOps, data science | 8+ |
| **DevOps & Cloud** | CI/CD, deployment, monitoring, infrastructure | 10+ |
| **Mobile & Gaming** | React Native, Unity, Unreal Engine | 6+ |
| **Specialized** | AR/VR, IoT, embedded systems, game dev | 8+ |

## Token Savings Calculator

Calculate your savings: https://gicm-marketplace.vercel.app/savings

**Example: DeFi Protocol Development**

| Task | Traditional | With gICM | Savings |
|------|------------|-----------|---------|
| Architecture design | 8,500 tokens | 720 tokens | 91% |
| Smart contract implementation | 12,000 tokens | 980 tokens | 92% |
| Security audit | 6,500 tokens | 780 tokens | 88% |
| Frontend integration | 9,200 tokens | 890 tokens | 90% |
| **Total** | **36,200 tokens** | **3,370 tokens** | **91%** |

**Cost savings**: ~$0.22 per project (at $3/1M tokens)
**Time savings**: 60-80% (automated workflows)

## File Structure

Plugins install to your `.claude/` directory:

```
.claude/
├── agents/          # AI agents (*.md files)
│   ├── icm-anchor-architect.md
│   ├── frontend-fusion-engine.md
│   └── smart-contract-auditor.md
├── skills/          # Progressive disclosure skills
│   ├── anchor-macros-deep-dive/
│   │   └── SKILL.md
│   └── typescript-advanced/
│       └── SKILL.md
├── commands/        # Slash commands (*.md files)
│   ├── anchor-init.md
│   ├── deploy-foundry.md
│   └── security-audit.md
├── mcp/            # MCP server configs (*.json files)
│   ├── github.json
│   ├── filesystem.json
│   └── solana-agent-kit.json
└── settings/       # Claude settings by category
    ├── performance/
    │   └── mcp-timeout-duration.md
    └── security/
        └── require-signature-verification.md
```

## Workflow Orchestration

Coming soon: Multi-agent workflows for complex tasks

```bash
# Execute multi-step workflows (COMING SOON)
/workflow run defi-protocol-launch
/workflow run nft-marketplace-deploy
/workflow run security-audit-pipeline
```

## Support & Resources

- **Website**: [gicm-marketplace.vercel.app](https://gicm-marketplace.vercel.app)
- **GitHub**: [Kermit457/gICM](https://github.com/Kermit457/gICM)
- **Issues**: [GitHub Issues](https://github.com/Kermit457/gICM/issues)
- **Documentation**: Browse all plugins online

## License

MIT - See [LICENSE](../LICENSE) for details

---

**Built for the Web3 builder community** 🚀
*The only Claude Code marketplace specialized for Solana, DeFi, and blockchain development*
