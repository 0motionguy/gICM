"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RegistryItem } from "@/types/registry";
import {
  Zap,
  Users,
  GitBranch,
  Plus,
  Check,
  Copy,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { useBundleStore } from "@/lib/store/bundle";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";
import { formatProductName } from "@/lib/utils";

interface AgentCardProps {
  item: RegistryItem;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

/**
 * Get security badge based on audit status and security scan results
 */
function getSecurityBadge(
  audit?: RegistryItem["audit"],
  security?: RegistryItem["security"]
) {
  // Show VERIFIED badge if item passed audit and has no security threats
  if (!security && audit?.status === "VERIFIED") {
    return (
      <Badge className="border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
        <ShieldCheck className="mr-1 h-3 w-3" />
        VERIFIED
      </Badge>
    );
  }

  // Show FLAGGED badge for critical/high threats
  if (
    security?.threatLevel === "critical" ||
    security?.threatLevel === "high"
  ) {
    return (
      <Badge className="border border-red-500/50 bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
        <ShieldX className="mr-1 h-3 w-3" />
        FLAGGED
      </Badge>
    );
  }

  // Show WARNING badge for medium threats
  if (security?.threatLevel === "medium") {
    return (
      <Badge className="border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
        <ShieldAlert className="mr-1 h-3 w-3" />
        WARNING
      </Badge>
    );
  }

  return null;
}

export function AgentCard({
  item,
  onSelect,
  selected = false,
}: AgentCardProps) {
  const { addItem, removeItem, hasItem } = useBundleStore();
  const inBundle = hasItem(item.id);
  const [copied, setCopied] = useState(false);

  // Track item view on mount
  useEffect(() => {
    analytics.trackItemView(item.id, item.kind, item.slug);
  }, [item.id, item.kind, item.slug]);

  const handleToggle = () => {
    if (inBundle) {
      removeItem(item.id);
      analytics.trackItemRemoveFromStack(item.id, item.kind, item.slug);
    } else {
      addItem(item);
      analytics.trackItemAddToStack(item.id, item.kind, item.slug);
    }
    // Still call onSelect if provided for backwards compatibility
    onSelect?.(item.id);
  };

  const handleCopyInstall = async () => {
    const installCmd = `npx @clawdbot/cli add ${item.kind}/${item.slug}`;
    await navigator.clipboard.writeText(installCmd);
    setCopied(true);
    toast.success("Install command copied!", {
      description: installCmd,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={`transition-all hover:border-lime-500/50 ${inBundle || selected ? "border-lime-500 ring-1 ring-lime-500/20" : ""}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {formatProductName(item.name)}
              </CardTitle>
              {(item.installs || 0) < 50 && (
                <Badge className="bg-lime-500 px-2 py-0.5 text-xs text-black">
                  NEW
                </Badge>
              )}
              {getSecurityBadge(item.audit, item.security)}
            </div>
            <CardDescription className="mt-1">{item.category}</CardDescription>
          </div>
          {item.modelRecommendation && (
            <Badge variant="outline" className="text-xs">
              {item.modelRecommendation}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-zinc-400">{item.description}</p>

        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{(item.installs || 0).toLocaleString("en-US")}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>{(item.remixes || 0).toLocaleString("en-US")}</span>
          </div>
          {item.tokenSavings && (
            <div className="flex items-center gap-1 text-lime-500">
              <Zap className="h-3 w-3" />
              <span>{item.tokenSavings}%</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          onClick={handleToggle}
          variant={inBundle || selected ? "default" : "outline"}
          className="flex-1"
          size="sm"
        >
          {inBundle || selected ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              In Stack
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Add to Stack
            </>
          )}
        </Button>
        <Button
          onClick={handleCopyInstall}
          variant="outline"
          size="sm"
          className={`px-3 transition-all duration-200 active:scale-95 ${
            copied
              ? "border-black bg-black text-white hover:bg-black"
              : "hover:bg-lime-500/10"
          }`}
          title="Copy install command"
          aria-label="Copy install command"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
