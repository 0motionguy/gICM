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

type Platform = "claude" | "gemini" | "openai";

function getProviders(item: RegistryItem): Provider[] {
  const providers: Provider[] = [];
  if (item.tags.some((tag) => ["Solana", "Blockchain", "Docker", "Container"].includes(tag))) {
    providers.push("docker");
  }
  if (item.tags.some((tag) => ["Testing", "Execution", "Sandbox"].includes(tag)) || item.kind === "skill") {
    providers.push("e2b");
  }
  if (item.tags.some((tag) => ["Claude", "AI", "Agent"].includes(tag)) || item.kind === "agent") {
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

  const cliCommand = (() => {
    // Check for platform-specific implementation
    if (selectedPlatform === "gemini" && item.implementations?.gemini?.install) {
      return item.implementations.gemini.install;
    }
    if (selectedPlatform === "openai" && item.implementations?.openai?.install) {
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
    <GlassCard className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#00F0FF]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Installation</span>
        </div>

        {/* Platform Toggle */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setSelectedPlatform("claude")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              selectedPlatform === "claude" 
                ? "bg-[#D97757]/20 text-[#D97757] shadow-[0_0_10px_-5px_#D97757]" 
                : "text-zinc-600 hover:text-zinc-400"
            )}
            title="Optimized for Claude"
          >
            <ClaudeIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSelectedPlatform("gemini")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              selectedPlatform === "gemini"
                ? "bg-[#4E82EE]/20 text-[#4E82EE] shadow-[0_0_10px_-5px_#4E82EE]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
            title="Optimized for Gemini"
          >
            <GeminiIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSelectedPlatform("openai")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              selectedPlatform === "openai"
                ? "bg-[#10A37F]/20 text-[#10A37F] shadow-[0_0_10px_-5px_#10A37F]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
            title="Optimized for OpenAI"
          >
            <OpenAIIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Command Area */}
      <div className="p-4 bg-[#050505]">
        <div className="relative group">
          <div className="font-mono text-xs md:text-sm text-zinc-300 break-all pr-10 leading-relaxed">
            {cliCommand.startsWith("npx") ? (
              <>
                <span className="text-[#00F0FF]">npx</span> {cliCommand.replace(/^npx\s+/, "")}
              </>
            ) : (
              cliCommand
            )}
          </div>
          <button
            onClick={copyCommand}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check size={16} className="text-[#00F0FF]" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Context Help */}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500 border-t border-white/5 pt-3">
          <Info size={12} />
          <span>
            {selectedPlatform === "claude"
              ? "Installs the standard version for Claude."
              : selectedPlatform === "gemini"
                ? "Installs the Gemini-optimized version."
                : "Installs the OpenAI-optimized version."}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="text-xs text-zinc-500 mb-3">
          This will install to your <code className="font-mono bg-white/5 px-1 py-0.5 rounded text-zinc-300">.{selectedPlatform}/{item.kind}s/</code> directory
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
            <div className="rounded-lg bg-black/40 border border-white/5 p-3 space-y-1">
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