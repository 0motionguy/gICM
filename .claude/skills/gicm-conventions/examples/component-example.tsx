/**
 * gICM Component Example
 * Demonstrates proper component structure for the marketplace
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Agent } from "@/types/Agent.types";

// Props interface - always define explicitly
interface AgentCardProps {
  agent: Agent;
  featured?: boolean;
  onPurchase?: (agentId: string) => void;
}

// Named export (preferred over default export)
export function AgentCard({
  agent,
  featured = false,
  onPurchase,
}: AgentCardProps) {
  return (
    <Card className={featured ? "border-primary shadow-lg" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{agent.category}</p>
        </div>
        {featured && <Badge variant="default">Featured</Badge>}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {agent.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">{formatPrice(agent.price)}</span>

          {onPurchase && (
            <Button size="sm" onClick={() => onPurchase(agent.id)}>
              Purchase
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Client component example (when interactivity is needed)
// "use client";
//
// import { useState } from "react";
//
// export function InteractiveAgentCard({ agent }: { agent: Agent }) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   // ... interactive logic
// }
