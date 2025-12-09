"use client";

import { useState } from "react";

interface ArchitectureCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  asciiContent: string;
  description: string;
}

export function ArchitectureCard({
  title,
  icon,
  iconColor,
  asciiContent,
  description,
}: ArchitectureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 cursor-pointer transition-all duration-200 hover:border-[#00F0FF]/50 hover:bg-zinc-900/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Face */}
      <div className="flex items-center gap-3">
        <div className={iconColor}>{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
      <p className="mt-3 text-xs text-zinc-500">
        Hover to see architecture <span className="text-[#00F0FF]">→</span>
      </p>

      {/* Hover Popup */}
      {isHovered && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-xl border border-[#00F0FF]/30 bg-zinc-950 p-4 shadow-2xl shadow-[#00F0FF]/10">
          <pre className="font-mono text-[11px] leading-tight text-[#00F0FF] whitespace-pre overflow-x-auto">
            {asciiContent}
          </pre>
        </div>
      )}
    </div>
  );
}
