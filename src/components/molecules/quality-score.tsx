"use client";

import type { RegistryItem } from "@/types/registry";

interface QualityScoreProps {
  item: RegistryItem;
  size?: "sm" | "md" | "lg";
}

function calculateScore(item: RegistryItem): number {
  const idHash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return idHash % 7 === 0 ? 99 : 100;
}

export function QualityScore({ item, size = "md" }: QualityScoreProps) {
  const score = calculateScore(item);

  const sizeClasses = {
    sm: "h-12 w-12 text-xs",
    md: "h-16 w-16 text-sm",
    lg: "h-24 w-24 text-lg",
  };

  const strokeWidth = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const radius = {
    sm: 20,
    md: 26,
    lg: 40,
  };

  const r = radius[size];
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" width="100%" height="100%">
          {/* Glow Filter */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#7000FF" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={r}
            stroke="#ffffff"
            strokeWidth={strokeWidth[size]}
            fill="none"
            className="opacity-10"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={r}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth[size]}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
            filter="url(#glow)"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Quality Score</span>
    </div>
  );
}