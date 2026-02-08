"use client";

import { useState } from "react";
import { Copy, Check, Terminal, Key, Box, Sparkles, Info } from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenAIIcon } from "@/components/ui/icons";
import type { RegistryItem } from "@/types/registry";
import { ProviderList, type Provider } from "./provider-badge";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

interface InstallCardProps {
  item: RegistryItem;
}

type Platform = "claude" | "gemini" | "openai" | "openclaw";

function getProviders(item: RegistryItem): Provider[] {
  const providers: Provider[] = [];
  if (
    item.tags.some((tag) =>
      ["Solana", "Blockchain", "Docker", "Container"].includes(tag)
    )
  ) {
    providers.push("docker");
  }
  if (
    item.tags.some((tag) =>
      ["Testing", "Execution", "Sandbox"].includes(tag)
    ) ||
    item.kind === "skill"
  ) {
    providers.push("e2b");
  }
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
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(() => {
    if (item.platforms?.includes("claude")) return "claude";
    if (item.platforms?.includes("gemini")) return "gemini";
    return "claude";
  });

  const providers = getProviders(item);

  const hasOpenClaw = !!item.openClaw?.clawHubInstall;

  const cliCommand = (() => {
    // OpenClaw / ClawHub install
    if (selectedPlatform === "openclaw" && item.openClaw?.clawHubInstall) {
      return item.openClaw.clawHubInstall;
    }
    // Check for platform-specific implementation
    if (
      selectedPlatform === "gemini" &&
      item.implementations?.gemini?.install
    ) {
      return item.implementations.gemini.install;
    }
    if (
      selectedPlatform === "openai" &&
      item.implementations?.openai?.install
    ) {
      return item.implementations.openai.install;
    }
    // Use default command, but add --platform flag if not Claude
    const baseCommand = item.install;
    if (selectedPlatform !== "claude") {
      return `${baseCommand} --platform ${selectedPlatform}`;
    }
    return baseCommand;
  })();

  function copyCommand() {
    navigator.clipboard?.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GlassCard className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#00F0FF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Installation
          </span>
        </div>

        {/* Platform Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-black/40 p-1">
          <button
            onClick={() => setSelectedPlatform("claude")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              selectedPlatform === "claude"
                ? "bg-[#D97757]/20 text-[#D97757] shadow-[0_0_10px_-5px_#D97757]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
            title="Optimized for Claude"
          >
            <ClaudeIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setSelectedPlatform("gemini")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              selectedPlatform === "gemini"
                ? "bg-[#4E82EE]/20 text-[#4E82EE] shadow-[0_0_10px_-5px_#4E82EE]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
            title="Optimized for Gemini"
          >
            <GeminiIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setSelectedPlatform("openai")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              selectedPlatform === "openai"
                ? "bg-[#10A37F]/20 text-[#10A37F] shadow-[0_0_10px_-5px_#10A37F]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
            title="Optimized for OpenAI"
          >
            <OpenAIIcon className="h-3.5 w-3.5" />
          </button>
          {hasOpenClaw && (
            <button
              onClick={() => setSelectedPlatform("openclaw")}
              className={cn(
                "rounded-md px-1.5 py-1 font-mono text-[10px] font-bold transition-all",
                selectedPlatform === "openclaw"
                  ? "bg-[#FF4500]/20 text-[#FF4500] shadow-[0_0_10px_-5px_#FF4500]"
                  : "text-zinc-600 hover:text-zinc-400"
              )}
              title="Install via ClawHub (OpenClaw)"
            >
              OC
            </button>
          )}
        </div>
      </div>

      {/* Command Area */}
      <div className="bg-[#050505] p-4">
        <div className="group relative">
          <div className="break-all pr-10 font-mono text-xs leading-relaxed text-zinc-300 md:text-sm">
            {cliCommand.startsWith("npx") ? (
              <>
                <span className="text-[#00F0FF]">npx</span>{" "}
                {cliCommand.replace(/^npx\s+/, "")}
              </>
            ) : (
              cliCommand
            )}
          </div>
          <button
            onClick={copyCommand}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check size={16} className="text-[#00F0FF]" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        {/* Context Help */}
        <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3 text-[10px] text-zinc-500">
          <Info size={12} />
          <span>
            {selectedPlatform === "claude"
              ? "Installs the standard version for Claude."
              : selectedPlatform === "gemini"
                ? "Installs the Gemini-optimized version."
                : selectedPlatform === "openclaw"
                  ? "Installs via ClawHub (OpenClaw ecosystem)."
                  : "Installs the OpenAI-optimized version."}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/5 bg-white/[0.02] p-4">
        <div className="mb-3 text-xs text-zinc-500">
          This will install to your{" "}
          <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-zinc-300">
            {selectedPlatform === "openclaw"
              ? `~/.openclaw/skills/${item.openClaw?.clawHubSlug || item.slug}/`
              : `.${selectedPlatform}/${item.kind}s/`}
          </code>{" "}
          directory
        </div>

        {/* Provider Requirements */}
        {providers.length > 0 && <ProviderList providers={providers} />}

        {/* Environment Variables */}
        {item.envKeys && item.envKeys.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Key size={14} className="text-[#7000FF]" />
              Environment Variables
            </div>
            <div className="space-y-1 rounded-lg border border-white/5 bg-black/40 p-3">
              {item.envKeys.map((key) => (
                <div key={key} className="font-mono text-xs text-[#00F0FF]/80">
                  {key}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
