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
      title: 'gICM - AI Dev Stack for Web3',
      text: 'Join the gICM waitlist and get early access to the AI-powered dev stack for Web3',
      url: window.location.href
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
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-3">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0f0f0f] via-[#0a0a0a] to-[#070707] p-5 md:p-6 border border-lime-300/40 shadow-xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-300/10 via-emerald-300/5 to-transparent" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-300/20 border border-lime-300/50 mb-3">
            <Sparkles size={14} className="text-lime-300" />
            <span className="text-lime-300 text-sm font-bold tracking-wide">
              Build Your AI Dev Stack. Ship Faster.
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
            Prompt to product <span className="text-lime-300">for Web3.</span>
          </h2>

          {/* Subline */}
          <p className="text-white text-base md:text-lg font-medium mb-2 leading-relaxed">
            Describe it. <span className="text-lime-300">gICM builds</span> the stack. You ship.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col items-center gap-3 mb-4">
            {/* Main CTA Row - Single horizontal row */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              {/* Left: Join Waitlist Button */}
              <button
                onClick={() => setWaitlistOpen(true)}
                onMouseEnter={() => setHoverPrimary(true)}
                onMouseLeave={() => setHoverPrimary(false)}
                className="px-8 py-3 rounded-lg bg-lime-300 text-black font-bold text-base hover:bg-lime-400 transition-colors shadow-lg"
              >
                {hoverPrimary ? (
                  <ScrambleText text="Join waitlist" trigger="hover" duration={400} />
                ) : (
                  "Join waitlist"
                )}
              </button>

              {/* Right: Alpha Keys Panel - Compact horizontal layout */}
              <div className="px-5 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur">
                <div className="flex items-center gap-6">
                  {/* Alpha keys with progress */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white text-sm font-medium">Alpha keys</span>
                      <span className="text-white/60 text-sm font-medium">
                        {alphaKeysIssued >= alphaKeysCap ? "Sold out" : `${alphaKeysIssued}/${alphaKeysCap}`}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-[180px] bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-300 to-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Share to boost button */}
                  <button
                    onClick={handleShare}
                    onMouseEnter={() => setHoverShare(true)}
                    onMouseLeave={() => setHoverShare(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white/60 hover:text-lime-300 transition-colors border-l border-white/10 pl-6"
                  >
                    <Share2 size={14} />
                    <span>
                      {hoverShare ? (
                        <ScrambleText text="Share to boost" trigger="hover" duration={300} />
                      ) : (
                        "Share to boost"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Micro-copy */}
            <p className="text-zinc-400 text-xs text-center">
              Early access limited. Invites roll out weekly.
            </p>

            {/* AWS Support */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-zinc-800 border border-zinc-600 rounded">
                AWS Activate Partner
              </span>
              <span className="text-zinc-300 text-[11px]">
                Up to $100k credits for graduated startups
              </span>
            </div>
          </div>

          {/* Contract Address Teaser */}
          <div
            className="flex items-center justify-center gap-2 text-xs mb-5 cursor-pointer group"
            onMouseEnter={() => setHoverCA(true)}
            onMouseLeave={() => setHoverCA(false)}
          >
            <Eye size={14} className="text-zinc-400 group-hover:text-lime-400 transition-colors" />
            <span className="text-zinc-400 font-medium">CA:</span>
            <InfiniteScramble
              length={44}
              active={hoverCA}
              className={`font-mono text-lime-300/70 tracking-wider transition-all ${hoverCA ? '' : 'blur-sm'}`}
            />
          </div>

          {/* Stats - Updated with accurate counts */}
          <div className="pt-4 border-t border-white/20 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-black text-lime-300">92%</div>
              <div className="text-xs text-zinc-400 mt-1">Token Savings</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-lime-300">4.7x</div>
              <div className="text-xs text-zinc-400 mt-1">Faster Builds</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-lime-300">368</div>
              <div className="text-xs text-zinc-400 mt-1">Total Items</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-lime-300">68</div>
              <div className="text-xs text-zinc-400 mt-1">Agents</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-lime-300">92</div>
              <div className="text-xs text-zinc-400 mt-1">Skills</div>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
