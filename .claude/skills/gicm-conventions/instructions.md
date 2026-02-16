# gICM Conventions

Apply gICM marketplace codebase conventions for Next.js 14 App Router, TypeScript, Tailwind CSS, and Shadcn/ui. Use when writing code for gICM project, implementing features, or reviewing code structure.

## File Naming Conventions

| Type             | Convention                  | Example                              |
| ---------------- | --------------------------- | ------------------------------------ |
| Components       | PascalCase                  | `AgentCard.tsx`, `PricingTable.tsx`  |
| Utilities        | camelCase                   | `formatPrice.ts`, `validateInput.ts` |
| API routes       | kebab-case                  | `agent-search/route.ts`              |
| Database schemas | snake_case                  | `agent_listings`, `user_purchases`   |
| Hooks            | camelCase with `use` prefix | `useAgent.ts`, `useSubscription.ts`  |
| Types            | PascalCase with `.types.ts` | `Agent.types.ts`                     |
| Constants        | SCREAMING_SNAKE_CASE        | `API_ENDPOINTS.ts`                   |

## Import Patterns

```typescript
// 1. External packages first
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Internal aliases (sorted alphabetically)
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agents/AgentCard";
import { formatPrice } from "@/lib/utils";

// 3. Relative imports last
import { localHelper } from "./helpers";
```

### Import Aliases

```typescript
// Main app imports
import { Component } from "@/components/...";
import { util } from "@/lib/...";
import { type } from "@/types/...";

// Monorepo package imports
import { SharedComponent } from "@gicm/ui";
import { sharedUtil } from "@gicm/utils";
import { config } from "@gicm/config";
```

## Component Templates

### Server Component (Default)

```tsx
// src/components/agents/AgentCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types/Agent.types";

interface AgentCardProps {
  agent: Agent;
  featured?: boolean;
}

export function AgentCard({ agent, featured = false }: AgentCardProps) {
  return (
    <Card className={featured ? "border-primary" : ""}>
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
        {featured && <Badge>Featured</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{agent.description}</p>
      </CardContent>
    </Card>
  );
}
```

### Client Component

```tsx
// src/components/agents/AgentSearch.tsx
"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface AgentSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function AgentSearch({
  onSearch,
  placeholder = "Search agents...",
}: AgentSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  return (
    <Input
      type="search"
      value={query}
      onChange={handleChange}
      placeholder={placeholder}
      className="max-w-md"
    />
  );
}
```

## API Route Structure

### Standard API Route

```typescript
// src/app/api/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const supabase = createClient();

    let query = supabase
      .from("agents")
      .select("*", { count: "exact" })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.search) {
      query = query.ilike("name", `%${params.search}%`);
    }

    if (params.category) {
      query = query.eq("category", params.category);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      meta: {
        total: count,
        limit: params.limit,
        offset: params.offset,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.string(),
  price: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const supabase = createClient();

    const { data: agent, error } = await supabase
      .from("agents")
      .insert(data)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Dynamic Route

```typescript
// src/app/api/agents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
```

## Database Patterns (Supabase)

### Schema Conventions

```sql
-- Always use UUIDs for primary keys
-- Always include created_at and updated_at
-- Use snake_case for all names

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for common queries
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public agents are viewable by everyone"
  ON agents FOR SELECT
  USING (is_active = true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own agents
CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

## Turborepo Workspace Structure

### Package.json (Root)

```json
{
  "name": "gicm",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

### Creating New Package

```bash
# Create package structure
mkdir -p packages/new-package/src
cd packages/new-package

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "@gicm/new-package",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  }
}
EOF
```

## Page Structure

### Page with Metadata

```tsx
// src/app/agents/page.tsx
import { Metadata } from "next";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { getAgents } from "@/lib/api/agents";

export const metadata: Metadata = {
  title: "AI Agents | gICM Marketplace",
  description: "Browse and purchase AI agents for your workflows",
};

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">AI Agents</h1>
      <AgentGrid agents={agents} />
    </main>
  );
}
```

### Layout

```tsx
// src/app/agents/layout.tsx
import { Sidebar } from "@/components/agents/Sidebar";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

## Error Handling

### Error Boundary

```tsx
// src/app/agents/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

## Testing Conventions

```typescript
// __tests__/components/AgentCard.test.tsx
import { render, screen } from "@testing-library/react";
import { AgentCard } from "@/components/agents/AgentCard";

const mockAgent = {
  id: "1",
  name: "Test Agent",
  description: "A test agent",
  category: "automation",
  price: 99,
};

describe("AgentCard", () => {
  it("renders agent name", () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText("Test Agent")).toBeInTheDocument();
  });

  it("shows featured badge when featured", () => {
    render(<AgentCard agent={mockAgent} featured />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });
});
```
