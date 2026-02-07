"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import type { RegistryItem } from "@/types/registry";
import { toast } from "sonner";

// Seeded random for stable positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface DesignCardProps {
  item: RegistryItem;
  onClick: () => void;
}

// Category-based animated preview components
const BackgroundPreview = ({ name }: { name: string }) => {
  const isAurora = name.toLowerCase().includes("aurora");
  const isBeams = name.toLowerCase().includes("beam");
  const isSpotlight = name.toLowerCase().includes("spotlight");
  const isMeteors = name.toLowerCase().includes("meteor");
  const isSparkles = name.toLowerCase().includes("sparkle");
  const isGrid = name.toLowerCase().includes("grid");
  const isParticles = name.toLowerCase().includes("particle");
  const isGradient = name.toLowerCase().includes("gradient");

  if (isAurora) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-zinc-950">
        <div className="absolute left-[-20%] top-[-50%] h-[150%] w-[150%] animate-pulse rounded-full bg-[#00F0FF]/20 blur-[40px]" />
        <div
          className="absolute bottom-[-50%] right-[-20%] h-[150%] w-[150%] animate-pulse rounded-full bg-[#7000FF]/20 blur-[40px]"
          style={{ animationDelay: "1s" }}
        />
      </div>
    );
  }
  if (isBeams) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[1px] animate-beam bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                left: "-100%",
                width: "200%",
                animationDelay: `${i * 0.3}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  if (isSpotlight) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
        <div className="absolute h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl" />
        <span className="relative text-xs text-white/50">Hover Effect</span>
      </div>
    );
  }
  if (isMeteors) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-zinc-950">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-8 w-[2px] rotate-[215deg] animate-meteor bg-gradient-to-b from-[#00F0FF] to-transparent"
            style={{
              top: `${seededRandom(i + 1) * 50}%`,
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    );
  }
  if (isSparkles) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-zinc-950">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-sparkle rounded-full bg-white"
            style={{
              top: `${seededRandom(i * 3 + 10) * 100}%`,
              left: `${seededRandom(i * 3 + 11) * 100}%`,
              animationDelay: `${seededRandom(i * 3 + 12) * 2}s`,
            }}
          />
        ))}
      </div>
    );
  }
  if (isGrid) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#050505]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,240,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(0,240,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    );
  }
  if (isParticles) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-zinc-950">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-0.5 animate-float rounded-full bg-[#00F0FF]/50"
            style={{
              top: `${seededRandom(i * 4 + 50) * 100}%`,
              left: `${seededRandom(i * 4 + 51) * 100}%`,
              animationDelay: `${seededRandom(i * 4 + 52) * 3}s`,
              animationDuration: `${3 + seededRandom(i * 4 + 53) * 2}s`,
            }}
          />
        ))}
      </div>
    );
  }
  if (isGradient) {
    return (
      <div className="h-full w-full animate-gradient-shift bg-gradient-to-br from-[#7000FF]/30 via-[#00F0FF]/20 to-[#FF0080]/30" />
    );
  }
  // Default background
  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-900 to-zinc-950">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #00F0FF 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
};

const ButtonPreview = ({ name }: { name: string }) => {
  const isNeon = name.toLowerCase().includes("neon");
  const isGlass = name.toLowerCase().includes("glass");
  const isShimmer = name.toLowerCase().includes("shimmer");
  const isGradient = name.toLowerCase().includes("gradient");
  const isBorder = name.toLowerCase().includes("border");
  const isLoading = name.toLowerCase().includes("loading");

  return (
    <div className="flex h-full w-full items-center justify-center gap-3 bg-zinc-950">
      {isNeon && (
        <button className="rounded-lg bg-[#00F0FF] px-4 py-2 text-xs font-bold text-black shadow-[0_0_20px_-5px_#00F0FF]">
          Neon
        </button>
      )}
      {isGlass && (
        <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md">
          Glass
        </button>
      )}
      {isShimmer && (
        <button className="relative overflow-hidden rounded-lg bg-zinc-800 px-4 py-2 text-xs text-white">
          <span className="relative z-10">Shimmer</span>
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
      )}
      {isGradient && (
        <button className="rounded-lg bg-gradient-to-r from-[#7000FF] to-[#00F0FF] px-4 py-2 text-xs font-bold text-white">
          Gradient
        </button>
      )}
      {isBorder && (
        <button className="relative overflow-hidden rounded-lg border-2 border-[#00F0FF] px-4 py-2 text-xs text-[#00F0FF]">
          Border
        </button>
      )}
      {isLoading && (
        <button className="flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-xs text-white">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Loading
        </button>
      )}
      {!isNeon &&
        !isGlass &&
        !isShimmer &&
        !isGradient &&
        !isBorder &&
        !isLoading && (
          <button className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black">
            Button
          </button>
        )}
    </div>
  );
};

const CardPreview = ({ name }: { name: string }) => {
  const is3D = name.toLowerCase().includes("3d");
  const isGlass = name.toLowerCase().includes("glass");
  const isShine = name.toLowerCase().includes("shine");
  const isFocus = name.toLowerCase().includes("focus");
  const isLens = name.toLowerCase().includes("lens");

  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-4">
      <div
        className={`flex h-20 w-32 flex-col rounded-xl p-3 transition-transform ${
          is3D ? "transform hover:rotate-3 hover:scale-105" : ""
        } ${isGlass ? "border border-white/10 bg-white/5 backdrop-blur-md" : "border border-zinc-700 bg-zinc-800"} ${
          isShine ? "shadow-[0_0_15px_-5px_#00F0FF]" : ""
        }`}
      >
        <div className="mb-2 h-6 w-6 rounded-full bg-white/20" />
        <div className="mb-1 h-1.5 w-16 rounded bg-white/20" />
        <div className="h-1.5 w-10 rounded bg-white/20" />
      </div>
    </div>
  );
};

const HeroPreview = ({ name }: { name: string }) => {
  const isLamp = name.toLowerCase().includes("lamp");
  const isGlobe = name.toLowerCase().includes("globe");
  const isMap = name.toLowerCase().includes("map");
  const isVideo = name.toLowerCase().includes("video");

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
      {isLamp && (
        <>
          <div className="absolute left-1/2 top-0 h-8 w-1 -translate-x-1/2 bg-gradient-to-b from-[#00F0FF] to-transparent" />
          <div className="absolute left-1/2 top-8 h-12 w-24 -translate-x-1/2 rounded-full bg-[#00F0FF]/20 blur-2xl" />
          <span className="mt-8 text-xs text-white/50">Lamp Hero</span>
        </>
      )}
      {isGlobe && (
        <div className="relative h-16 w-16 rounded-full border border-[#00F0FF]/30">
          <div className="absolute inset-2 rounded-full border border-[#00F0FF]/20" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#00F0FF]/20" />
        </div>
      )}
      {isMap && (
        <div className="relative">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F0FF]"
              style={{
                top: `${seededRandom(i * 2 + 100) * 40 - 20}px`,
                left: `${seededRandom(i * 2 + 101) * 60 - 30}px`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <span className="text-xs text-white/30">World Map</span>
        </div>
      )}
      {isVideo && (
        <div className="flex h-12 w-20 items-center justify-center rounded bg-zinc-800">
          <div className="ml-1 h-0 w-0 border-y-4 border-l-8 border-y-transparent border-l-white" />
        </div>
      )}
      {!isLamp && !isGlobe && !isMap && !isVideo && (
        <div className="text-center">
          <div className="text-2xl font-bold text-white/20">HERO</div>
          <div className="text-[10px] text-white/30">Section</div>
        </div>
      )}
    </div>
  );
};

const TextPreview = ({ name }: { name: string }) => {
  const isTypewriter = name.toLowerCase().includes("typewriter");
  const isFlip = name.toLowerCase().includes("flip");
  const isNumber = name.toLowerCase().includes("number");
  const isGradient = name.toLowerCase().includes("gradient");
  const isBlur = name.toLowerCase().includes("blur");

  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      {isTypewriter && (
        <div className="font-mono text-sm text-white">
          Hello<span className="animate-blink">|</span>
        </div>
      )}
      {isFlip && (
        <div className="text-sm text-white">
          Build <span className="text-[#00F0FF]">faster</span>
        </div>
      )}
      {isNumber && (
        <div className="font-mono text-3xl font-bold text-[#00F0FF]">1,234</div>
      )}
      {isGradient && (
        <div className="bg-gradient-to-r from-[#7000FF] via-[#00F0FF] to-[#FF0080] bg-clip-text text-xl font-bold text-transparent">
          Gradient
        </div>
      )}
      {isBlur && (
        <div className="animate-pulse text-sm text-white/50 blur-[2px]">
          Revealing...
        </div>
      )}
      {!isTypewriter && !isFlip && !isNumber && !isGradient && !isBlur && (
        <div className="text-sm text-white">Text Effect</div>
      )}
    </div>
  );
};

const LoaderPreview = ({ name }: { name: string }) => {
  const isSpinner = name.toLowerCase().includes("spinner");
  const isDots = name.toLowerCase().includes("dots");
  const isSkeleton = name.toLowerCase().includes("skeleton");
  const isProgress = name.toLowerCase().includes("progress");

  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      {isSpinner && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00F0FF]/30 border-t-[#00F0FF]" />
      )}
      {isDots && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-[#00F0FF]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
      {isSkeleton && (
        <div className="space-y-2">
          <div className="h-2 w-20 animate-pulse rounded bg-zinc-700" />
          <div className="h-2 w-16 animate-pulse rounded bg-zinc-700" />
          <div className="h-2 w-12 animate-pulse rounded bg-zinc-700" />
        </div>
      )}
      {isProgress && (
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-700">
          <div className="h-full w-3/4 rounded-full bg-[#00F0FF]" />
        </div>
      )}
      {!isSpinner && !isDots && !isSkeleton && !isProgress && (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
    </div>
  );
};

const NavigationPreview = () => (
  <div className="flex h-full w-full items-center justify-center bg-zinc-950">
    <div className="flex gap-2 rounded-full border border-white/10 bg-zinc-800/80 p-2 backdrop-blur">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-8 w-8 rounded-full bg-white/10 transition-colors hover:bg-white/20"
        />
      ))}
    </div>
  </div>
);

const FormPreview = () => (
  <div className="flex h-full w-full items-center justify-center bg-zinc-950 p-4">
    <div className="w-full max-w-[120px]">
      <div className="flex h-7 w-full items-center rounded border border-zinc-700 bg-zinc-800 px-2">
        <span className="text-[10px] text-zinc-500">Input...</span>
      </div>
    </div>
  </div>
);

const ModalPreview = () => (
  <div className="flex h-full w-full items-center justify-center bg-zinc-950">
    <div className="flex h-16 w-24 flex-col rounded-lg border border-zinc-700 bg-zinc-800 p-2 shadow-2xl">
      <div className="mb-1 h-1 w-full rounded bg-zinc-600" />
      <div className="flex flex-1 items-center justify-center">
        <div className="h-4 w-8 rounded bg-[#00F0FF]/50 text-center text-[6px] text-white">
          OK
        </div>
      </div>
    </div>
  </div>
);

const AnimationPreview = ({ name }: { name: string }) => {
  const isMarquee = name.toLowerCase().includes("marquee");
  const isConfetti = name.toLowerCase().includes("confetti");
  const isCool = name.toLowerCase().includes("cool");
  const isScroll =
    name.toLowerCase().includes("scroll") ||
    name.toLowerCase().includes("view");
  const isStack = name.toLowerCase().includes("stack");

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-zinc-950">
      {isMarquee && (
        <div className="flex animate-marquee gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-10 flex-shrink-0 rounded bg-zinc-700"
            />
          ))}
        </div>
      )}
      {isConfetti && (
        <div className="relative">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1.5 w-1.5 animate-confetti"
              style={{
                backgroundColor: ["#00F0FF", "#7000FF", "#FF0080", "#FFFF00"][
                  i % 4
                ],
                top: `${seededRandom(i * 2 + 150) * 20 - 10}px`,
                left: `${seededRandom(i * 2 + 151) * 40 - 20}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <span className="text-xs text-white/50">🎉</span>
        </div>
      )}
      {isCool && <div className="text-xs text-white/50">Click Effect ✨</div>}
      {isScroll && (
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-16 animate-fade-in rounded bg-zinc-700"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
      {isStack && (
        <div className="relative">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute h-8 w-12 rounded border border-zinc-600 bg-zinc-700"
              style={{
                top: `${i * 4}px`,
                left: `${i * 4}px`,
                zIndex: 3 - i,
              }}
            />
          ))}
        </div>
      )}
      {!isMarquee && !isConfetti && !isCool && !isScroll && !isStack && (
        <div className="h-8 w-8 animate-pulse rounded bg-[#00F0FF]/20" />
      )}
    </div>
  );
};

// Get preview based on component slug/category
function getPreview(item: RegistryItem) {
  const slug = item.slug.toLowerCase();
  const name = item.name.toLowerCase();

  if (slug.includes("background") || slug.startsWith("backgrounds-")) {
    return <BackgroundPreview name={name} />;
  }
  if (slug.includes("button") || slug.startsWith("buttons-")) {
    return <ButtonPreview name={name} />;
  }
  if (slug.includes("card") || slug.startsWith("cards-")) {
    return <CardPreview name={name} />;
  }
  if (slug.includes("hero") || slug.startsWith("heroes-")) {
    return <HeroPreview name={name} />;
  }
  if (slug.includes("text") || slug.startsWith("text-")) {
    return <TextPreview name={name} />;
  }
  if (
    slug.includes("loader") ||
    slug.startsWith("loaders-") ||
    slug.includes("skeleton") ||
    slug.includes("progress")
  ) {
    return <LoaderPreview name={name} />;
  }
  if (
    slug.includes("navigation") ||
    slug.startsWith("navigation-") ||
    slug.includes("dock") ||
    slug.includes("navbar") ||
    slug.includes("tabs")
  ) {
    return <NavigationPreview />;
  }
  if (
    slug.includes("form") ||
    slug.startsWith("forms-") ||
    slug.includes("input") ||
    slug.includes("select")
  ) {
    return <FormPreview />;
  }
  if (
    slug.includes("modal") ||
    slug.startsWith("modals-") ||
    slug.includes("dialog")
  ) {
    return <ModalPreview />;
  }
  if (
    slug.includes("animation") ||
    slug.startsWith("animations-") ||
    slug.includes("marquee") ||
    slug.includes("confetti")
  ) {
    return <AnimationPreview name={name} />;
  }

  // Fallback for original items
  if (slug === "glass-card") return <CardPreview name="glass" />;
  if (slug === "aurora-background") return <BackgroundPreview name="aurora" />;
  if (slug === "neon-button") return <ButtonPreview name="neon" />;
  if (slug === "animated-grid") return <BackgroundPreview name="grid" />;

  // Default
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950">
      <div className="text-xs text-zinc-600">Preview</div>
    </div>
  );
}

// Get source library from install command or docsUrl
function getSourceLibrary(item: RegistryItem): string {
  const docsUrl = item.docsUrl || "";
  const install = item.install || "";

  if (docsUrl.includes("aceternity") || install.includes("aceternity"))
    return "Aceternity UI";
  if (docsUrl.includes("magicui") || install.includes("magicui"))
    return "Magic UI";
  if (
    docsUrl.includes("shadcn") ||
    (install.includes("shadcn@latest add") && !install.includes("http"))
  )
    return "shadcn/ui";
  if (docsUrl.includes("uiverse")) return "UIverse";
  if (docsUrl.includes("reactbits")) return "React Bits";
  if (docsUrl.includes("motion-primitives")) return "Motion Primitives";
  if (install.includes("@clawdbot/cli")) return "ClawdBot";
  return "Component";
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
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2 py-1 text-[10px] text-emerald-400">
        <ShieldCheck className="h-2.5 w-2.5" />
        VERIFIED
      </span>
    );
  }

  // Show FLAGGED badge for critical/high threats
  if (
    security?.threatLevel === "critical" ||
    security?.threatLevel === "high"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/50 bg-red-500/20 px-2 py-1 text-[10px] text-red-400">
        <ShieldX className="h-2.5 w-2.5" />
        FLAGGED
      </span>
    );
  }

  // Show WARNING badge for medium threats
  if (security?.threatLevel === "medium") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/20 px-2 py-1 text-[10px] text-amber-400">
        <ShieldAlert className="h-2.5 w-2.5" />
        WARNING
      </span>
    );
  }

  return null;
}

export function DesignCard({ item, onClick }: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.install);
      setCopied(true);
      toast.success("Install command copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleViewDocs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.docsUrl) {
      window.open(item.docsUrl, "_blank");
    }
  };

  const sourceLibrary = getSourceLibrary(item);
  const hasNpxInstall = item.install.startsWith("npx");

  return (
    <div
      className="group relative flex h-[320px] cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0B] transition-all duration-300 hover:border-[#00F0FF]/50 hover:shadow-[0_0_30px_-10px_rgba(0,240,255,0.3)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Source Library & Security Badges */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur-sm">
          {sourceLibrary}
        </span>
        {getSecurityBadge(item.audit, item.security)}
      </div>

      {/* Preview Area */}
      <div className="relative h-[45%] w-full overflow-hidden bg-black/20">
        {getPreview(item)}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.docsUrl && (
            <button
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
              onClick={handleViewDocs}
            >
              <ExternalLink size={12} /> View Docs
            </button>
          )}
          <button
            className="flex items-center gap-1.5 rounded-lg bg-[#00F0FF] px-3 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
            onClick={handleCopyInstall}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Install"}
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex flex-1 flex-col border-t border-white/5 bg-white/[0.02] p-4">
        <h3 className="font-display text-base font-bold leading-tight text-white">
          {item.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-zinc-400">
          {item.description}
        </p>

        {/* Install Command */}
        <div className="mt-3 rounded-lg border border-white/5 bg-black/40 p-2">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="flex-shrink-0 text-[#00F0FF]" />
            <code className="flex-1 truncate font-mono text-[10px] text-zinc-300">
              {hasNpxInstall ? (
                <>
                  <span className="text-[#00F0FF]">npx</span>{" "}
                  {item.install.replace("npx ", "").slice(0, 40)}
                  {item.install.length > 44 ? "..." : ""}
                </>
              ) : (
                <span className="text-zinc-400">
                  {item.install.slice(0, 35)}
                  {item.install.length > 35 ? "..." : ""}
                </span>
              )}
            </code>
            <button
              onClick={handleCopyInstall}
              className="rounded p-1 transition-colors hover:bg-white/10"
            >
              {copied ? (
                <Check size={12} className="text-[#00F0FF]" />
              ) : (
                <Copy size={12} className="text-zinc-500 hover:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded border border-white/5 bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-500"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span className="text-[9px] text-zinc-600">
              +{item.tags.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
