"use client";

import { useState } from "react";
import { Sparkles, Eye, Share2 } from "lucide-react";
import { ScrambleText } from "@/components/ui/scramble-text";
import { InfiniteScramble } from "@/components/ui/infinite-scramble";
import { WaitlistModal } from "@/components/WaitlistModal";

/**
 * PreSignupCTA Component
 * Hero banner with metrics
 */
export function PreSignupCTA() {
  const [hoverPrimary, setHoverPrimary] = useState(false);
  const [hoverSecondary, setHoverSecondary] = useState(false);
  const [hoverShare, setHoverShare] = useState(false);
  const [hoverCA, setHoverCA] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // Alpha key tracking
  const alphaKeysIssued = 247;
  const alphaKeysCap = 500;
  const progressPercentage = (alphaKeysIssued / alphaKeysCap) * 100;

  const handleShare = async () => {
    const shareData = {
      title: "ClawdBot - AI Dev Stack for Web3",
      text: "Join the ClawdBot waitlist and get early access to the AI-powered dev stack for Web3",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Could show a toast notification here
      }
    } catch (err) {
      // Share failed - user can manually copy URL
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-3 md:px-10">
      <div className="relative overflow-hidden rounded-xl border border-lime-300/40 bg-gradient-to-r from-[#0f0f0f] via-[#0a0a0a] to-[#070707] p-5 shadow-xl md:p-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-300/50 bg-lime-300/20 px-3 py-1.5">
            <Sparkles size={14} className="text-lime-300" />
            <span className="text-sm font-bold tracking-wide text-lime-300">
              Describe it. Ship it.
            </span>
          </div>

          {/* Headline */}
          <h2 className="mb-2 text-2xl font-black leading-tight text-white md:text-4xl">
            From prompt <span className="text-lime-300">to production.</span>
          </h2>

          {/* Subline */}
          <p className="mb-2 text-base font-medium leading-relaxed text-white md:text-lg">
            Describe it. <span className="text-lime-300">Agents build it.</span>{" "}
            You ship it.
          </p>

          {/* CTA Section */}
          <div className="mb-4 flex flex-col items-center gap-3">
            {/* Main CTA Row - Single horizontal row */}
            <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row">
              {/* Left: Join Waitlist Button */}
              <button
                onClick={() => setWaitlistOpen(true)}
                onMouseEnter={() => setHoverPrimary(true)}
                onMouseLeave={() => setHoverPrimary(false)}
                className="rounded-lg bg-lime-300 px-8 py-3 text-base font-bold text-black shadow-lg transition-colors hover:bg-lime-400"
              >
                {hoverPrimary ? (
                  <ScrambleText
                    text="Join waitlist"
                    trigger="hover"
                    duration={400}
                  />
                ) : (
                  "Join waitlist"
                )}
              </button>

              {/* Right: Alpha Keys Panel - Compact horizontal layout */}
              <div className="rounded-lg border border-white/20 bg-white/5 px-5 py-3 backdrop-blur">
                <div className="flex items-center gap-6">
                  {/* Alpha keys with progress */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">
                        Alpha keys
                      </span>
                      <span className="text-sm font-medium text-white/60">
                        {alphaKeysIssued >= alphaKeysCap
                          ? "Sold out"
                          : `${alphaKeysIssued}/${alphaKeysCap}`}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-[180px] overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-300 to-yellow-400 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Share to boost button */}
                  <button
                    onClick={handleShare}
                    onMouseEnter={() => setHoverShare(true)}
                    onMouseLeave={() => setHoverShare(false)}
                    className="flex items-center gap-2 border-l border-white/10 px-4 py-2 pl-6 text-sm font-semibold text-white/60 transition-colors hover:text-lime-300"
                  >
                    <Share2 size={14} />
                    <span>
                      {hoverShare ? (
                        <ScrambleText
                          text="Share to boost"
                          trigger="hover"
                          duration={300}
                        />
                      ) : (
                        "Share to boost"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Micro-copy */}
            <p className="text-center text-xs text-zinc-400">
              Early access limited. Invites roll out weekly.
            </p>

            {/* AWS Support */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="rounded border border-zinc-600 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                AWS Activate Partner
              </span>
              <span className="text-[11px] text-zinc-300">
                Up to $100k credits for graduated startups
              </span>
            </div>
          </div>

          {/* Contract Address Teaser */}
          <div
            className="group mb-5 flex cursor-pointer items-center justify-center gap-2 text-xs"
            onMouseEnter={() => setHoverCA(true)}
            onMouseLeave={() => setHoverCA(false)}
          >
            <Eye
              size={14}
              className="text-zinc-400 transition-colors group-hover:text-lime-400"
            />
            <span className="font-medium text-zinc-400">CA:</span>
            <InfiniteScramble
              length={44}
              active={hoverCA}
              className={`font-mono tracking-wider text-lime-300/70 transition-all ${hoverCA ? "" : "blur-sm"}`}
            />
          </div>

          {/* Stats - Updated with accurate counts */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 text-center md:grid-cols-5">
            <div>
              <div className="text-xl font-black text-lime-300 md:text-2xl">
                92%
              </div>
              <div className="mt-1 text-xs text-zinc-400">Token Savings</div>
            </div>
            <div>
              <div className="text-xl font-black text-lime-300 md:text-2xl">
                4.7x
              </div>
              <div className="mt-1 text-xs text-zinc-400">Faster Builds</div>
            </div>
            <div>
              <div className="text-xl font-black text-lime-300 md:text-2xl">
                368
              </div>
              <div className="mt-1 text-xs text-zinc-400">Total Items</div>
            </div>
            <div>
              <div className="text-xl font-black text-lime-300 md:text-2xl">
                68
              </div>
              <div className="mt-1 text-xs text-zinc-400">Agents</div>
            </div>
            <div>
              <div className="text-xl font-black text-lime-300 md:text-2xl">
                92
              </div>
              <div className="mt-1 text-xs text-zinc-400">Skills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
