# AWCN Dashboard

Real-time monitoring and management interface for your AI Worker Compute Network fleet.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **UI Components**: Shadcn/ui

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Pages

### Home (`/`)

Fleet status overview with real-time metrics:

- Active/idle/offline agent counts
- Total compute capacity
- Network health indicators

### Agents (`/agents`)

Individual agent management and budget tracking:

- Per-agent resource allocation
- Budget utilization charts
- Performance metrics
- Start/stop controls

## Project Structure

```
apps/dashboard/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Utilities and API clients
└── types/         # TypeScript definitions
```

## Related

- [AWCN Core](../../packages/core) - Orchestration engine
- [gICM Marketplace](../) - Agent marketplace
