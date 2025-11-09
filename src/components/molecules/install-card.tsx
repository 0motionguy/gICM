"use client";

import { useState } from "react";
import { Copy, Check, Terminal, Key } from "lucide-react";
import type { RegistryItem } from "@/types/registry";
import { ProviderList, type Provider } from "./provider-badge";

interface InstallCardProps {
  item: RegistryItem;
}

/**
 * Determine provider requirements based on item metadata
 * This is a heuristic - you can extend with explicit provider fields in registry
 */
function getProviders(item: RegistryItem): Provider[] {
  const providers: Provider[] = [];

  // Check for Docker requirement (Solana, blockchain, containers)
  if (
    item.tags.some((tag) =>
      ["Solana", "Blockchain", "Docker", "Container"].includes(tag)
    )
  ) {
    providers.push("docker");
  }

  // Check for E2B requirement (code execution, testing)
  if (
    item.tags.some((tag) => ["Testing", "Execution", "Sandbox"].includes(tag)) ||
    item.kind === "skill"
  ) {
    providers.push("e2b");
  }

  // Check for Claudefare requirement (Claude-specific features)
  if (
    item.tags.some((tag) => ["Claude", "AI", "Agent"].includes(tag)) ||
    item.kind === "agent"
  ) {
    providers.push("claudefare");
  }

  return providers;
}

export function InstallCard({ item }: InstallCardProps) {
  const [copied, setCopied] = useState(false);
  const providers = getProviders(item);

  // Use install command from registry (ensures consistency across all pages)
  const cliCommand = item.install;

  function copyCommand() {
    navigator.clipboard?.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={20} className="text-black" />
          <h3 className="text-sm font-semibold text-black">Installation</h3>
        </div>
        <button
          onClick={copyCommand}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-black/90 text-xs transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* CLI Command */}
      <div className="rounded-lg bg-black p-3">
        <code className="text-sm text-lime-300 font-mono break-all">
          {cliCommand}
        </code>
      </div>

      <div className="text-xs text-zinc-600">
        This will install to your <code className="font-mono bg-black/5 px-1 py-0.5 rounded">.claude/{item.kind}s/</code> directory
      </div>

      {/* Provider Requirements */}
      {providers.length > 0 && <ProviderList providers={providers} />}

      {/* Environment Variables */}
      {item.envKeys && item.envKeys.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-black">
            <Key size={14} />
            Environment Variables
          </div>
          <div className="rounded-lg bg-black/5 border border-black/10 p-3 space-y-1">
            {item.envKeys.map((key) => (
              <div key={key} className="font-mono text-xs text-zinc-600">
                {key}
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600">
            Add these variables to your <code className="font-mono bg-black/5 px-1 py-0.5 rounded">.env</code> file before using.
          </p>
        </div>
      )}

      {/* Setup Instructions */}
      {item.setup && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-black">Setup Instructions</div>
          <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
            {item.setup}
          </div>
        </div>
      )}
    </div>
  );
}
