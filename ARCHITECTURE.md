# gICM Architecture

## Repository Structure

gICM consists of **2 separate repositories**:

### 1. **gICM** (This Repo - Web Application)
**Purpose:** Marketplace website and web app
**URL:** https://github.com/gicm/gICM

**Contains:**
- Next.js 15.5 web application
- React components and UI
- Registry system (embedded for performance)
- Stack builder and ZIP generator
- Analytics dashboard
- Gamification system

**Tech Stack:**
- Next.js 15.5 with App Router
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- Framer Motion (animations)

---

### 2. **gICM-library** (Content Repository)
**Purpose:** Standalone library of all agents, skills, commands, MCPs, and settings
**URL:** https://github.com/gicm/gICM-library

**Contains:**
- 74 Agents (`.md` files)
- 92 Skills (folders with `SKILL.md`)
- 93 Commands (`.md` files)
- 82 MCP Servers (`.json` + README files)
- 48 Settings (`.md` files)

**Why Separate?**
- Users can clone library directly without web app code
- Smaller, focused repository
- Easy to contribute new items via PR
- CLI can install directly from GitHub
- Library is versioned independently

---

## How They Work Together

### Data Flow

```
gICM-library (GitHub)
    ↓
gICM Web App
    ├── Registry (embedded for performance)
    ├── Marketplace pages (browse items)
    └── "Add to Stack" → generates install command
         ↓
User runs: npx @gicm/cli add agent/icm-anchor-architect
         ↓
Downloads from gICM-library (GitHub)
```

### Installation Methods

**Method 1: Via CLI**
```bash
npx @gicm/cli add agent/icm-anchor-architect
```
- CLI fetches from `gICM-library` repo
- Downloads markdown/JSON files
- Places in `.claude/` directory

**Method 2: Direct Clone**
```bash
git clone https://github.com/gicm/gICM-library.git
cd gICM-library
```

**Method 3: Via Web App**
- Browse on https://gicm.ai
- Click "Add to Stack"
- Download ZIP with selected items

---

## Registry System

The web app has an **embedded registry** in `src/lib/registry.ts`:

```typescript
export const REGISTRY: RegistryItem[] = [
  ...AGENTS,   // 74 items
  ...SKILLS,   // 92 items
  ...COMMANDS, // 93 items
  ...MCPS,     // 82 items
  ...SETTINGS, // 48 items
];
```

**Why embedded?**
- Fast page loads (no API calls)
- Static site generation (409 pages)
- No external dependencies
- Works offline after initial load

**Syncing with library:**
- Registry is manually synced with library
- Future: GitHub Actions auto-sync on library updates

---

## Build Process

### gICM Web App

```bash
npm run build
```

Generates:
- 409 static HTML pages
- 388 item detail pages (`/items/[slug]`)
- Pre-rendered at build time (SSG)
- Deployed to Vercel/Netlify

### gICM-library

No build process - pure content repository.

---

## Deployment

### Web App (gICM)
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any static host

### Library (gICM-library)
- GitHub repository
- No hosting needed
- Users clone or install via CLI

---

## Contributing

### To add a new item:

1. **Fork gICM-library**
2. **Add your content:**
   - Agents: `agents/your-agent.md`
   - Skills: `skills/your-skill/SKILL.md`
   - Commands: `commands/your-command.md`
   - MCPs: `mcp/your-mcp.json`
3. **Submit PR to gICM-library**
4. **After merge, update web app registry** (manual sync)

---

## Future Enhancements

- **Auto-sync**: GitHub Actions to sync library → registry
- **API endpoint**: `/api/library` to fetch latest from GitHub
- **Version tags**: Library releases (v1.0.0, v1.1.0, etc.)
- **npm package**: `@gicm/library` for programmatic access
- **CDN hosting**: jsDelivr for fast library access
