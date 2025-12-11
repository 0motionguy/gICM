# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Phase 2: OpenSkills Compatibility

- **16 Anthropic Skills** - Migrated from `.claude/skills/` to registry
  - Advanced TypeScript Patterns
  - Kubernetes Patterns
  - Microservices Architecture
  - MLOps Best Practices
  - React Native Performance
  - And 11 more domain expertise skills
- **8 Obra Superpowers** - Legacy content transformed to Agent Skills v2
  - AI Stack Builder, Codebase Analyzer, Cursor Composer, DeepSeek Engineer
  - Documentation Generator, Git Expert, Next.js Expert, Project Orchestrator
- **Dependency Mapping System** - Automated cross-reference analysis
  - 104 skills analyzed for internal dependencies
  - Automated documentation updates with dependency graphs
  - Validation system for cross-skill references

#### Registry Updates

- **Updated Registry Counts**:
  - 120 Skills (was 96) - +24 from Anthropic and Obra migrations
  - Total marketplace items: 617+ (was 593+)
- **OpenSkills Export Command** - New CLI tool for Anthropic compatibility
  - `npx @gicm/cli openskills-export` - Export skills to OpenSkills format
  - Automated YAML frontmatter generation
  - Bidirectional compatibility with Anthropic's system

### Changed

- **Skill Registry** - Merged Anthropic Skills and Obra Superpowers into unified registry
- **Documentation** - Auto-updated dependency references across all skills
- **Validation** - Extended validator to check cross-skill dependencies

## [2.0.0] - 2025-12-11

### Added

#### Agent Skills v2 Schema

- **Progressive Disclosure Architecture** - 3-level content loading (L1: metadata, L2: instructions, L3: resources)
- **Token Budget System** - Strict limits: L1 < 200, L2 < 5,000, L3 unlimited
- **Trigger Patterns** - Semantic matching for automatic skill detection
- **Validation System** - Zod schemas with reserved word checking
- **Cross-platform Support** - Universal Agent Protocol (UAP) for Claude, Gemini, OpenAI

#### Marketplace Content

- **593+ Total Items** - Complete marketplace with categorized content
  - 108 Agents - Specialized AI workers for development, blockchain, security
  - 96 Skills - Domain expertise with progressive disclosure
  - 93 Commands - Slash commands for common workflows
  - 82 MCPs - Model Context Protocol servers for external services
  - 15 Workflows - Multi-step orchestrated pipelines
  - 7 Settings - Configuration options
  - 192+ Utilities - Prompts, templates, and tools

#### New API Endpoints

- `GET /api/registry` - Complete registry access
- `GET /api/search` - Full-text search with filters
- `GET /api/items/[slug]` - Individual item lookup
- `GET /api/items/[slug]/files` - File content with platform selection
- `GET /api/items/stats` - Aggregate marketplace statistics
- `GET /api/items/stats/[itemId]` - Per-item statistics
- `GET /api/bundles/generate` - Dynamic bundle generation

#### Build & CLI

- `npx @gicm/cli add` - Install agents, skills, commands, MCPs
- `npx @gicm/cli validate` - Validate skill against v2 schema
- `npx @gicm/cli analyze` - Token count analysis
- `npx @gicm/cli convert` - Multi-platform conversion
- Build scripts for platform asset generation

#### Documentation

- `docs/MARKETPLACE-V2.md` - Complete v2 schema documentation
- `docs/CONTRIBUTING-SKILLS.md` - Skill creation guide
- `docs/MCP-INTEGRATION.md` - MCP server documentation
- Updated `docs/MULTI_PLATFORM.md` - Cross-platform architecture
- Updated `docs/AGENT-ARCHITECTURE.md` - System architecture

### Changed

- **Registry Schema** - Extended with v2 fields (skillId, progressiveDisclosure, codeExecution, resources)
- **Token Optimization** - 74-89% reduction through progressive disclosure
- **Search Algorithm** - Semantic matching with trigger patterns
- **Multi-platform** - All items now support Claude, Gemini, OpenAI

### Technical Details

#### Progressive Disclosure Token Savings

| Approach           | System Prompt | Per Request | Savings |
| ------------------ | ------------- | ----------- | ------- |
| Naive (all skills) | 150,000       | 150,000     | -       |
| Level 1 only       | 14,100        | 14,100      | 91%     |
| Level 1 + matched  | 14,100        | 24,100      | 84%     |

#### Platform Support Matrix

| Platform | Agents | Skills | Commands | MCPs |
| -------- | ------ | ------ | -------- | ---- |
| Claude   | 108    | 96     | 93       | 82   |
| Gemini   | 108    | 96     | 93       | -    |
| OpenAI   | 108    | 96     | 93       | -    |

---

## [6.1.0] - 2025-12-11

### Added

- OPUS 67 VS Code extension v1.0.0
- 141 specialized AI skills
- 83 MCP server integrations
- 107 autonomous agents
- 30 operating modes
- 5-tier memory system
- AI Stack Builder with Claude integration

### Changed

- Updated to Aether design system (#00F0FF accent)
- Improved Progressive Disclosure for 90% context reduction
- Enhanced performance with 10-12x faster responses

### Security

- Pre-launch security hardening
- Improved .gitignore coverage
- Removed exposed secrets from repository

## [6.0.0] - 2025-12-01

### Added

- Initial public release
- gICM Marketplace
- OPUS 67 Enhancement Layer
- create-opus67 CLI installer

[Unreleased]: https://github.com/Kermit457/gICM/compare/v6.1.0...HEAD
[6.1.0]: https://github.com/Kermit457/gICM/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/Kermit457/gICM/releases/tag/v6.0.0
