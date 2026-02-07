"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Terminal } from "lucide-react";
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
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] rounded-full bg-[#00F0FF]/20 blur-[40px] animate-pulse" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[150%] h-[150%] rounded-full bg-[#7000FF]/20 blur-[40px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    );
  }
  if (isBeams) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent animate-beam"
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
      <div className="w-full h-full relative overflow-hidden bg-zinc-950 flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <span className="relative text-xs text-white/50">Hover Effect</span>
      </div>
    );
  }
  if (isMeteors) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-8 bg-gradient-to-b from-[#00F0FF] to-transparent rotate-[215deg] animate-meteor"
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
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-sparkle"
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
      <div className="w-full h-full bg-[#050505] relative overflow-hidden">
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
      <div className="w-full h-full relative overflow-hidden bg-zinc-950">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-[#00F0FF]/50 rounded-full animate-float"
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
      <div className="w-full h-full bg-gradient-to-br from-[#7000FF]/30 via-[#00F0FF]/20 to-[#FF0080]/30 animate-gradient-shift" />
    );
  }
  // Default background
  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, #00F0FF 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />
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
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 gap-3">
      {isNeon && (
        <button className="px-4 py-2 rounded-lg bg-[#00F0FF] text-black font-bold text-xs shadow-[0_0_20px_-5px_#00F0FF]">
          Neon
        </button>
      )}
      {isGlass && (
        <button className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs">
          Glass
        </button>
      )}
      {isShimmer && (
        <button className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs relative overflow-hidden">
          <span className="relative z-10">Shimmer</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </button>
      )}
      {isGradient && (
        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white font-bold text-xs">
          Gradient
        </button>
      )}
      {isBorder && (
        <button className="px-4 py-2 rounded-lg border-2 border-[#00F0FF] text-[#00F0FF] text-xs relative overflow-hidden">
          Border
        </button>
      )}
      {isLoading && (
        <button className="px-4 py-2 rounded-lg bg-zinc-700 text-white text-xs flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading
        </button>
      )}
      {!isNeon && !isGlass && !isShimmer && !isGradient && !isBorder && !isLoading && (
        <button className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs">
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
    <div className="w-full h-full flex items-center justify-center p-4 bg-zinc-950">
      <div
        className={`w-32 h-20 rounded-xl flex flex-col p-3 transition-transform ${
          is3D ? "transform hover:rotate-3 hover:scale-105" : ""
        } ${isGlass ? "bg-white/5 backdrop-blur-md border border-white/10" : "bg-zinc-800 border border-zinc-700"} ${
          isShine ? "shadow-[0_0_15px_-5px_#00F0FF]" : ""
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 mb-2" />
        <div className="w-16 h-1.5 bg-white/20 rounded mb-1" />
        <div className="w-10 h-1.5 bg-white/20 rounded" />
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
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {isLamp && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-[#00F0FF] to-transparent" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-12 bg-[#00F0FF]/20 blur-2xl rounded-full" />
          <span className="text-white/50 text-xs mt-8">Lamp Hero</span>
        </>
      )}
      {isGlobe && (
        <div className="w-16 h-16 rounded-full border border-[#00F0FF]/30 relative">
          <div className="absolute inset-2 rounded-full border border-[#00F0FF]/20" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#00F0FF]/20" />
        </div>
      )}
      {isMap && (
        <div className="relative">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse"
              style={{
                top: `${seededRandom(i * 2 + 100) * 40 - 20}px`,
                left: `${seededRandom(i * 2 + 101) * 60 - 30}px`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <span className="text-white/30 text-xs">World Map</span>
        </div>
      )}
      {isVideo && (
        <div className="w-20 h-12 bg-zinc-800 rounded flex items-center justify-center">
          <div className="w-0 h-0 border-l-8 border-l-white border-y-4 border-y-transparent ml-1" />
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
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      {isTypewriter && (
        <div className="text-white text-sm font-mono">
          Hello<span className="animate-blink">|</span>
        </div>
      )}
      {isFlip && (
        <div className="text-white text-sm">
          Build <span className="text-[#00F0FF]">faster</span>
        </div>
      )}
      {isNumber && (
        <div className="text-3xl font-bold text-[#00F0FF] font-mono">1,234</div>
      )}
      {isGradient && (
        <div className="text-xl font-bold bg-gradient-to-r from-[#7000FF] via-[#00F0FF] to-[#FF0080] bg-clip-text text-transparent">
          Gradient
        </div>
      )}
      {isBlur && (
        <div className="text-white/50 text-sm blur-[2px] animate-pulse">Revealing...</div>
      )}
      {!isTypewriter && !isFlip && !isNumber && !isGradient && !isBlur && (
        <div className="text-white text-sm">Text Effect</div>
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
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      {isSpinner && (
        <div className="w-6 h-6 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
      )}
      {isDots && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
      {isSkeleton && (
        <div className="space-y-2">
          <div className="w-20 h-2 bg-zinc-700 rounded animate-pulse" />
          <div className="w-16 h-2 bg-zinc-700 rounded animate-pulse" />
          <div className="w-12 h-2 bg-zinc-700 rounded animate-pulse" />
        </div>
      )}
      {isProgress && (
        <div className="w-24 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-[#00F0FF] rounded-full" />
        </div>
      )}
      {!isSpinner && !isDots && !isSkeleton && !isProgress && (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
    </div>
  );
};

const NavigationPreview = () => (
  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
    <div className="flex gap-2 bg-zinc-800/80 backdrop-blur p-2 rounded-full border border-white/10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors" />
      ))}
    </div>
  </div>
);

const FormPreview = () => (
  <div className="w-full h-full flex items-center justify-center bg-zinc-950 p-4">
    <div className="w-full max-w-[120px]">
      <div className="h-7 w-full bg-zinc-800 rounded border border-zinc-700 px-2 flex items-center">
        <span className="text-[10px] text-zinc-500">Input...</span>
      </div>
    </div>
  </div>
);

const ModalPreview = () => (
  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
    <div className="w-24 h-16 bg-zinc-800 rounded-lg border border-zinc-700 shadow-2xl flex flex-col p-2">
      <div className="w-full h-1 bg-zinc-600 rounded mb-1" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-4 bg-[#00F0FF]/50 rounded text-[6px] text-center text-white">OK</div>
      </div>
    </div>
  </div>
);

const AnimationPreview = ({ name }: { name: string }) => {
  const isMarquee = name.toLowerCase().includes("marquee");
  const isConfetti = name.toLowerCase().includes("confetti");
  const isCool = name.toLowerCase().includes("cool");
  const isScroll = name.toLowerCase().includes("scroll") || name.toLowerCase().includes("view");
  const isStack = name.toLowerCase().includes("stack");

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
      {isMarquee && (
        <div className="flex gap-4 animate-marquee">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-6 bg-zinc-700 rounded flex-shrink-0" />
          ))}
        </div>
      )}
      {isConfetti && (
        <div className="relative">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 animate-confetti"
              style={{
                backgroundColor: ["#00F0FF", "#7000FF", "#FF0080", "#FFFF00"][i % 4],
                top: `${seededRandom(i * 2 + 150) * 20 - 10}px`,
                left: `${seededRandom(i * 2 + 151) * 40 - 20}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <span className="text-xs text-white/50">🎉</span>
        </div>
      )}
      {isCool && (
        <div className="text-xs text-white/50">Click Effect ✨</div>
      )}
      {isScroll && (
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-16 h-3 bg-zinc-700 rounded animate-fade-in"
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
              className="absolute w-12 h-8 bg-zinc-700 rounded border border-zinc-600"
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
        <div className="w-8 h-8 bg-[#00F0FF]/20 rounded animate-pulse" />
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
  if (slug.includes("loader") || slug.startsWith("loaders-") || slug.includes("skeleton") || slug.includes("progress")) {
    return <LoaderPreview name={name} />;
  }
  if (slug.includes("navigation") || slug.startsWith("navigation-") || slug.includes("dock") || slug.includes("navbar") || slug.includes("tabs")) {
    return <NavigationPreview />;
  }
  if (slug.includes("form") || slug.startsWith("forms-") || slug.includes("input") || slug.includes("select")) {
    return <FormPreview />;
  }
  if (slug.includes("modal") || slug.startsWith("modals-") || slug.includes("dialog")) {
    return <ModalPreview />;
  }
  if (slug.includes("animation") || slug.startsWith("animations-") || slug.includes("marquee") || slug.includes("confetti")) {
    return <AnimationPreview name={name} />;
  }

  // Fallback for original items
  if (slug === "glass-card") return <CardPreview name="glass" />;
  if (slug === "aurora-background") return <BackgroundPreview name="aurora" />;
  if (slug === "neon-button") return <ButtonPreview name="neon" />;
  if (slug === "animated-grid") return <BackgroundPreview name="grid" />;

  // Default
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      <div className="text-zinc-600 text-xs">Preview</div>
    </div>
  );
}

// Get source library from install command or docsUrl
function getSourceLibrary(item: RegistryItem): string {
  const docsUrl = item.docsUrl || "";
  const install = item.install || "";

  if (docsUrl.includes("aceternity") || install.includes("aceternity")) return "Aceternity UI";
  if (docsUrl.includes("magicui") || install.includes("magicui")) return "Magic UI";
  if (docsUrl.includes("shadcn") || install.includes("shadcn@latest add") && !install.includes("http")) return "shadcn/ui";
  if (docsUrl.includes("uiverse")) return "UIverse";
  if (docsUrl.includes("reactbits")) return "React Bits";
  if (docsUrl.includes("motion-primitives")) return "Motion Primitives";
  if (install.includes("@clawdbot/cli")) return "ClawdBot";
  return "Component";
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
      className="group relative rounded-xl border border-white/10 bg-[#0A0A0B] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#00F0FF]/50 hover:shadow-[0_0_30px_-10px_rgba(0,240,255,0.3)] h-[320px] flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Source Library Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-zinc-400">
          {sourceLibrary}
        </span>
      </div>

      {/* Preview Area */}
      <div className="h-[45%] w-full relative overflow-hidden bg-black/20">
        {getPreview(item)}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.docsUrl && (
            <button
              className="px-3 py-2 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform"
              onClick={handleViewDocs}
            >
              <ExternalLink size={12} /> View Docs
            </button>
          )}
          <button
            className="px-3 py-2 rounded-lg bg-[#00F0FF] text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform"
            onClick={handleCopyInstall}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Install"}
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex-1 p-4 flex flex-col border-t border-white/5 bg-white/[0.02]">
        <h3 className="text-base font-bold text-white font-display leading-tight">{item.name}</h3>
        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 flex-1">{item.description}</p>

        {/* Install Command */}
        <div className="mt-3 p-2 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-[#00F0FF] flex-shrink-0" />
            <code className="text-[10px] text-zinc-300 font-mono truncate flex-1">
              {hasNpxInstall ? (
                <>
                  <span className="text-[#00F0FF]">npx</span> {item.install.replace("npx ", "").slice(0, 40)}
                  {item.install.length > 44 ? "..." : ""}
                </>
              ) : (
                <span className="text-zinc-400">{item.install.slice(0, 35)}{item.install.length > 35 ? "..." : ""}</span>
              )}
            </code>
            <button
              onClick={handleCopyInstall}
              className="p-1 hover:bg-white/10 rounded transition-colors"
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
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-500"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span className="text-[9px] text-zinc-600">+{item.tags.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}
