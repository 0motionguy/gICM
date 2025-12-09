"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { toast } from "sonner";

interface TerminalDisplayProps {
  content: string;
  title?: string;
  className?: string;
  maxHeight?: string;
  showCopy?: boolean;
}

export function TerminalDisplay({
  content,
  title,
  className = "",
  maxHeight,
  showCopy = true,
}: TerminalDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-[#0D0D0D] border border-white/10 ${className}`}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Terminal size={14} className="text-[#00F0FF]" />
            <span className="font-mono font-medium">{title}</span>
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {/* Terminal window dots */}
      {!title && (
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/80 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-zinc-500 font-mono ml-2">
            OPUS 67 Benchmark
          </span>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      <div
        className="overflow-auto"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <pre className="p-4 text-[11px] sm:text-xs md:text-sm font-mono leading-tight text-zinc-300 whitespace-pre overflow-x-auto">
          {content}
        </pre>
      </div>
    </div>
  );
}

export default TerminalDisplay;
