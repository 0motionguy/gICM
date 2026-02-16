"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUptime } from "@/lib/api/fleet";

interface UptimeCardProps {
  uptime: number;
  lastUpdated: string;
}

export function UptimeCard({ uptime, lastUpdated }: UptimeCardProps) {
  const uptimeFormatted = formatUptime(uptime);
  const lastUpdatedDate = new Date(lastUpdated);

  return (
    <Card className="border-gicm-border bg-gicm-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-400">
          System Uptime
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gicm-primary">
            {uptimeFormatted}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: {lastUpdatedDate.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
