"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy, Terminal, X, ExternalLink, Code2, Eye, Layers, Sparkles } from "lucide-react";
import type { RegistryItem } from "@/types/registry";
import { toast } from "sonner";

interface DesignDetailModalProps {
  item: RegistryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// Get source library info
function getSourceInfo(item: RegistryItem): { name: string; color: string; url: string } {
  const docsUrl = item.docsUrl || "";
  const install = item.install || "";

  if (docsUrl.includes("aceternity") || install.includes("aceternity")) {
    return { name: "Aceternity UI", color: "#00F0FF", url: "https://ui.aceternity.com" };
  }
  if (docsUrl.includes("magicui") || install.includes("magicui")) {
    return { name: "Magic UI", color: "#7C3AED", url: "https://magicui.design" };
  }
  if (docsUrl.includes("ui.shadcn") || (install.includes("shadcn@latest") && !install.includes("http"))) {
    return { name: "shadcn/ui", color: "#FFFFFF", url: "https://ui.shadcn.com" };
  }
  if (docsUrl.includes("uiverse")) {
    return { name: "UIverse", color: "#FF6B6B", url: "https://uiverse.io" };
  }
  if (docsUrl.includes("reactbits")) {
    return { name: "React Bits", color: "#61DAFB", url: "https://reactbits.dev" };
  }
  if (docsUrl.includes("motion-primitives")) {
    return { name: "Motion Primitives", color: "#F97316", url: "https://motion-primitives.com" };
  }
  if (install.includes("@clawdbot/cli")) {
    return { name: "ClawdBot Original", color: "#00F0FF", url: "https://clawdbot.com" };
  }
  return { name: "Component Library", color: "#71717A", url: "" };
}

// Live Preview Component - renders actual CSS components
function LivePreview({ item }: { item: RegistryItem }) {
  const slug = item.slug.toLowerCase();
  const name = item.name.toLowerCase();

  // === BUTTONS ===
  if (slug.includes("button") || slug.startsWith("buttons-")) {
    if (name.includes("neon") || name.includes("glow")) {
      return (
        <div className="flex flex-col gap-6 items-center">
          <button className="relative px-8 py-4 bg-[#00F0FF] text-black font-bold rounded-lg text-lg shadow-[0_0_30px_-5px_#00F0FF,0_0_60px_-15px_#00F0FF] hover:shadow-[0_0_40px_-5px_#00F0FF,0_0_80px_-10px_#00F0FF] transition-all duration-300 hover:scale-105">
            Neon Button
          </button>
          <button className="relative px-8 py-4 bg-[#FF0080] text-white font-bold rounded-lg text-lg shadow-[0_0_30px_-5px_#FF0080,0_0_60px_-15px_#FF0080] hover:shadow-[0_0_40px_-5px_#FF0080,0_0_80px_-10px_#FF0080] transition-all duration-300 hover:scale-105">
            Pink Glow
          </button>
          <button className="relative px-8 py-4 bg-[#7000FF] text-white font-bold rounded-lg text-lg shadow-[0_0_30px_-5px_#7000FF,0_0_60px_-15px_#7000FF] hover:shadow-[0_0_40px_-5px_#7000FF,0_0_80px_-10px_#7000FF] transition-all duration-300 hover:scale-105">
            Purple Glow
          </button>
        </div>
      );
    }
    if (name.includes("shimmer")) {
      return (
        <button className="relative px-8 py-4 bg-zinc-800 text-white font-bold rounded-lg text-lg overflow-hidden group">
          <span className="relative z-10">Shimmer Button</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      );
    }
    if (name.includes("border") || name.includes("moving")) {
      return (
        <button className="relative px-8 py-4 rounded-xl bg-zinc-900 text-white font-bold text-lg overflow-hidden">
          <span className="relative z-10">Moving Border</span>
          <div className="absolute inset-0 rounded-xl">
            <div className="absolute inset-[-2px] rounded-xl bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF0080] animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-[2px] rounded-lg bg-zinc-900" />
          </div>
        </button>
      );
    }
    if (name.includes("gradient")) {
      return (
        <div className="flex flex-col gap-4 items-center">
          <button className="px-8 py-4 bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white font-bold rounded-lg text-lg hover:opacity-90 transition-opacity">
            Gradient Button
          </button>
          <button className="px-8 py-4 bg-gradient-to-r from-[#FF0080] via-[#7000FF] to-[#00F0FF] text-white font-bold rounded-full text-lg hover:scale-105 transition-transform">
            Rainbow Button
          </button>
        </div>
      );
    }
    if (name.includes("loading")) {
      return (
        <div className="flex flex-col gap-4 items-center">
          <button className="px-8 py-4 bg-[#00F0FF] text-black font-bold rounded-lg text-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Loading...
          </button>
          <button className="px-8 py-4 bg-zinc-700 text-white font-bold rounded-lg text-lg flex items-center gap-3 opacity-70 cursor-not-allowed">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </button>
        </div>
      );
    }
    // Default button
    return (
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors">
          Primary
        </button>
        <button className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
          Outline
        </button>
        <button className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-lg hover:bg-zinc-700 transition-colors">
          Secondary
        </button>
      </div>
    );
  }

  // === BACKGROUNDS ===
  if (slug.includes("background") || slug.startsWith("backgrounds-")) {
    if (name.includes("aurora")) {
      return (
        <div className="w-full h-64 rounded-xl relative overflow-hidden bg-zinc-950">
          <div className="absolute top-[-50%] left-[-30%] w-[180%] h-[180%] rounded-full bg-[#00F0FF]/30 blur-[80px] animate-pulse" />
          <div className="absolute bottom-[-50%] right-[-30%] w-[180%] h-[180%] rounded-full bg-[#7000FF]/30 blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-[20%] right-[10%] w-[100%] h-[100%] rounded-full bg-[#FF0080]/20 blur-[60px] animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-xl font-bold">Aurora Background</span>
          </div>
        </div>
      );
    }
    if (name.includes("beam")) {
      return (
        <div className="w-full h-64 rounded-xl relative overflow-hidden bg-zinc-950">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/60 to-transparent animate-beam"
              style={{
                top: `${10 + i * 12}%`,
                left: "-100%",
                width: "200%",
                animationDelay: `${i * 0.4}s`,
                animationDuration: "4s",
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-xl font-bold">Background Beams</span>
          </div>
        </div>
      );
    }
    if (name.includes("meteor")) {
      return (
        <div className="w-full h-64 rounded-xl relative overflow-hidden bg-zinc-950">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-16 bg-gradient-to-b from-[#00F0FF] to-transparent rotate-[215deg] animate-meteor"
              style={{
                top: `${(i * 17) % 60}%`,
                left: `${5 + (i * 13) % 90}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "2.5s",
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-xl font-bold">Meteors</span>
          </div>
        </div>
      );
    }
    if (name.includes("grid")) {
      return (
        <div className="w-full h-64 rounded-xl relative overflow-hidden bg-[#050505]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,240,255,0.15) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0,240,255,0.15) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-xl font-bold">Animated Grid</span>
          </div>
        </div>
      );
    }
    if (name.includes("sparkle") || name.includes("particle")) {
      return (
        <div className="w-full h-64 rounded-xl relative overflow-hidden bg-zinc-950">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-sparkle"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 23) % 100}%`,
                animationDelay: `${(i * 0.15) % 2}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-xl font-bold">Sparkles</span>
          </div>
        </div>
      );
    }
    // Default background
    return (
      <div className="w-full h-64 rounded-xl bg-gradient-to-br from-[#7000FF]/30 via-[#00F0FF]/20 to-[#FF0080]/30 flex items-center justify-center">
        <span className="text-white/80 text-xl font-bold">Background Effect</span>
      </div>
    );
  }

  // === CARDS ===
  if (slug.includes("card") || slug.startsWith("cards-")) {
    if (name.includes("3d") || name.includes("tilt")) {
      return (
        <div className="group perspective-1000">
          <div className="w-72 h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 border border-white/10 shadow-2xl transform transition-transform duration-300 group-hover:rotate-y-12 group-hover:rotate-x-12 group-hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#7000FF] mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">3D Card</h3>
            <p className="text-zinc-400 text-sm">Hover to see the tilt effect</p>
          </div>
        </div>
      );
    }
    if (name.includes("glass")) {
      return (
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF0080] blur-2xl opacity-30" />
          <div className="relative w-72 h-48 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 rounded-full bg-white/20 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Glass Card</h3>
            <p className="text-white/60 text-sm">Frosted glass effect with blur</p>
          </div>
        </div>
      );
    }
    if (name.includes("spotlight") || name.includes("focus")) {
      return (
        <div className="group relative w-72 h-48 bg-zinc-900 rounded-2xl p-6 border border-white/10 overflow-hidden cursor-pointer">
          <div className="absolute -inset-32 bg-[#00F0FF]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ transform: "translate(var(--mouse-x, 0), var(--mouse-y, 0))" }} />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-zinc-800 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Spotlight Card</h3>
            <p className="text-zinc-400 text-sm">Hover to see spotlight effect</p>
          </div>
        </div>
      );
    }
    // Default card
    return (
      <div className="w-72 h-48 bg-zinc-800 rounded-2xl p-6 border border-zinc-700 hover:border-[#00F0FF]/50 transition-colors">
        <div className="w-12 h-12 rounded-full bg-zinc-700 mb-4" />
        <h3 className="text-white font-bold text-lg mb-2">Card Component</h3>
        <p className="text-zinc-400 text-sm">A versatile card with hover state</p>
      </div>
    );
  }

  // === TEXT EFFECTS ===
  if (slug.includes("text") || slug.startsWith("text-")) {
    if (name.includes("typewriter")) {
      return (
        <div className="text-center">
          <div className="text-4xl font-bold text-white font-mono">
            Build faster<span className="animate-blink text-[#00F0FF]">|</span>
          </div>
          <p className="text-zinc-500 mt-4">Typewriter effect with blinking cursor</p>
        </div>
      );
    }
    if (name.includes("gradient")) {
      return (
        <div className="text-center space-y-6">
          <div className="text-5xl font-bold bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF0080] bg-clip-text text-transparent">
            Gradient Text
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#7000FF] bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
            Animated Gradient
          </div>
        </div>
      );
    }
    if (name.includes("number") || name.includes("ticker")) {
      return (
        <div className="flex gap-12 text-center">
          <div>
            <div className="text-5xl font-bold text-[#00F0FF] font-mono">1,234</div>
            <p className="text-zinc-500 mt-2">Users</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#7000FF] font-mono">$50K</div>
            <p className="text-zinc-500 mt-2">Revenue</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#FF0080] font-mono">99.9%</div>
            <p className="text-zinc-500 mt-2">Uptime</p>
          </div>
        </div>
      );
    }
    // Default text
    return (
      <div className="text-5xl font-bold text-white">
        Text Effect
      </div>
    );
  }

  // === LOADERS ===
  if (slug.includes("loader") || slug.includes("skeleton") || slug.includes("progress")) {
    if (name.includes("skeleton")) {
      return (
        <div className="w-80 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-700 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-700 rounded animate-pulse" />
              <div className="h-4 bg-zinc-700 rounded w-3/4 animate-pulse" />
            </div>
          </div>
          <div className="h-32 bg-zinc-700 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 bg-zinc-700 rounded flex-1 animate-pulse" />
            <div className="h-8 bg-zinc-700 rounded flex-1 animate-pulse" />
          </div>
        </div>
      );
    }
    if (name.includes("progress")) {
      return (
        <div className="w-80 space-y-6">
          <div>
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] rounded-full" />
            </div>
          </div>
          <div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-[#00F0FF] to-[#7000FF] rounded-full animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
        </div>
      );
    }
    // Default loader
    return (
      <div className="flex gap-8 items-center">
        <div className="w-12 h-12 border-4 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-[#00F0FF] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // === NAVIGATION ===
  if (slug.includes("dock") || slug.includes("navbar") || slug.includes("navigation")) {
    return (
      <div className="flex gap-3 bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
        {["Home", "Search", "Profile", "Settings"].map((label, i) => (
          <div
            key={label}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              i === 0 ? "bg-[#00F0FF] text-black" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            }`}
          >
            <span className="text-xs font-medium">{label[0]}</span>
          </div>
        ))}
      </div>
    );
  }

  // === FORMS ===
  if (slug.includes("input") || slug.includes("form") || slug.includes("otp")) {
    if (name.includes("otp")) {
      return (
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-14 h-16 bg-zinc-800 rounded-xl border-2 border-zinc-700 flex items-center justify-center text-2xl font-bold text-white focus-within:border-[#00F0FF]"
            >
              {i <= 3 ? "•" : ""}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="w-80 space-y-4">
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:border-[#00F0FF] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:border-[#00F0FF] focus:outline-none transition-colors"
          />
        </div>
      </div>
    );
  }

  // === ANIMATIONS ===
  if (slug.includes("marquee")) {
    return (
      <div className="w-full overflow-hidden">
        <div className="flex gap-8 animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 h-20 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center">
              <span className="text-zinc-400">Item {(i % 5) + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug.includes("confetti")) {
    return (
      <div className="relative">
        <button className="px-8 py-4 bg-[#00F0FF] text-black font-bold rounded-xl text-lg">
          Celebrate! 🎉
        </button>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-confetti"
              style={{
                backgroundColor: ["#00F0FF", "#7000FF", "#FF0080", "#FFFF00", "#00FF88"][i % 5],
                left: `${(i * 20) - 60}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // === DEFAULT PREVIEW ===
  return (
    <div className="text-center space-y-4">
      <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 flex items-center justify-center">
        <Eye size={40} className="text-[#00F0FF]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        <p className="text-sm text-zinc-400 mt-1">Interactive preview</p>
      </div>
    </div>
  );
}

// Generate usage example code based on component
function generateUsageCode(item: RegistryItem): string {
  const componentName = item.name.replace(/[^a-zA-Z0-9]/g, "");
  const slug = item.slug;

  // Backgrounds
  if (slug.includes("background") || slug.startsWith("backgrounds-")) {
    if (slug.includes("aurora")) {
      return `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Hero() {
  return (
    <AuroraBackground>
      <div className="relative z-10 flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-white">
          Welcome to the Future
        </h1>
      </div>
    </AuroraBackground>
  );
}`;
    }
    if (slug.includes("beam")) {
      return `import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Section() {
  return (
    <div className="relative h-screen bg-neutral-950">
      <BackgroundBeams />
      <div className="relative z-10 p-8">
        <h2 className="text-2xl text-white">Your Content Here</h2>
      </div>
    </div>
  );
}`;
    }
    return `import { ${componentName} } from "@/components/ui/${slug}";

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <${componentName} className="absolute inset-0" />
      <div className="relative z-10">
        {/* Your content */}
      </div>
    </div>
  );
}`;
  }

  // Buttons
  if (slug.includes("button") || slug.startsWith("buttons-")) {
    if (slug.includes("shimmer")) {
      return `import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function CTA() {
  return (
    <ShimmerButton className="shadow-2xl">
      <span className="whitespace-pre-wrap text-center text-sm font-medium">
        Get Started
      </span>
    </ShimmerButton>
  );
}`;
    }
    if (slug.includes("moving") || slug.includes("border")) {
      return `import { Button } from "@/components/ui/moving-border";

export default function Actions() {
  return (
    <Button
      borderRadius="1.75rem"
      className="bg-white dark:bg-slate-900 text-black dark:text-white"
    >
      Hover Me
    </Button>
  );
}`;
    }
    return `import { Button } from "@/components/ui/button";

export default function Actions() {
  return (
    <div className="flex gap-4">
      <Button variant="default">Primary</Button>
      <Button variant="outline">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}`;
  }

  // Cards
  if (slug.includes("card") || slug.startsWith("cards-")) {
    if (slug.includes("3d")) {
      return `import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

export default function ProductCard() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card dark:bg-black w-auto h-auto rounded-xl p-6">
        <CardItem translateZ="50" className="text-xl font-bold">
          Make things float in air
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img src="/product.png" className="h-60 w-full object-cover rounded-xl" />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}`;
    }
    return `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FeatureCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
        <CardDescription>A brief description of the feature.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your content goes here.</p>
      </CardContent>
    </Card>
  );
}`;
  }

  // Text Effects
  if (slug.includes("text") || slug.startsWith("text-")) {
    if (slug.includes("typewriter")) {
      return `import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default function Hero() {
  const words = [
    { text: "Build" },
    { text: "awesome" },
    { text: "apps" },
    { text: "with", className: "text-blue-500" },
    { text: "React.", className: "text-blue-500" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[40rem]">
      <TypewriterEffect words={words} />
    </div>
  );
}`;
    }
    if (slug.includes("number") || slug.includes("ticker")) {
      return `import NumberTicker from "@/components/ui/number-ticker";

export default function Stats() {
  return (
    <div className="flex gap-8">
      <div className="text-center">
        <NumberTicker value={1000} className="text-4xl font-bold" />
        <p className="text-sm text-muted-foreground">Users</p>
      </div>
      <div className="text-center">
        <NumberTicker value={50000} className="text-4xl font-bold" />
        <p className="text-sm text-muted-foreground">Downloads</p>
      </div>
    </div>
  );
}`;
    }
    return `import { ${componentName} } from "@/components/ui/${slug}";

export default function TextDemo() {
  return (
    <${componentName}>
      Your animated text here
    </${componentName}>
  );
}`;
  }

  // Loaders
  if (slug.includes("loader") || slug.startsWith("loaders-") || slug.includes("skeleton") || slug.includes("progress")) {
    if (slug.includes("skeleton")) {
      return `import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}`;
    }
    if (slug.includes("progress")) {
      return `import { Progress } from "@/components/ui/progress";

export default function ProgressDemo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="w-[60%]" />;
}`;
    }
    return `// Loading component
export default function Loader() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}`;
  }

  // Navigation
  if (slug.includes("navigation") || slug.includes("dock") || slug.includes("navbar") || slug.includes("tabs")) {
    if (slug.includes("dock")) {
      return `import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Search, Settings, User } from "lucide-react";

export default function Navigation() {
  const items = [
    { title: "Home", icon: <Home />, href: "/" },
    { title: "Search", icon: <Search />, href: "/search" },
    { title: "Profile", icon: <User />, href: "/profile" },
    { title: "Settings", icon: <Settings />, href: "/settings" },
  ];

  return <FloatingDock items={items} />;
}`;
    }
    if (slug.includes("tabs")) {
      return `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings here.</TabsContent>
      <TabsContent value="password">Password settings here.</TabsContent>
    </Tabs>
  );
}`;
    }
    return `import { ${componentName} } from "@/components/ui/${slug}";

export default function Nav() {
  return <${componentName} items={navItems} />;
}`;
  }

  // Forms
  if (slug.includes("form") || slug.includes("input") || slug.includes("select") || slug.includes("otp")) {
    if (slug.includes("otp")) {
      return `import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function OTPInput() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}`;
    }
    if (slug.includes("select")) {
      return `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );
}`;
    }
    return `import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FormField() {
  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  );
}`;
  }

  // Modals
  if (slug.includes("modal") || slug.includes("dialog")) {
    return `import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of what the dialog does.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          Your content here
        </div>
      </DialogContent>
    </Dialog>
  );
}`;
  }

  // Animations
  if (slug.includes("animation") || slug.includes("marquee") || slug.includes("confetti")) {
    if (slug.includes("marquee")) {
      return `import Marquee from "@/components/ui/marquee";

const reviews = [
  { name: "Jack", body: "Amazing product!" },
  { name: "Jill", body: "Love it!" },
  // ... more reviews
];

export default function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>
    </div>
  );
}`;
    }
    if (slug.includes("confetti")) {
      return `import Confetti from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";

export default function ConfettiDemo() {
  const handleClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <Button onClick={handleClick}>
      Celebrate! 🎉
    </Button>
  );
}`;
    }
    return `import { motion } from "framer-motion";

export default function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Your animated content
    </motion.div>
  );
}`;
  }

  // Default
  return `import { ${componentName} } from "@/components/ui/${slug}";

export default function Demo() {
  return <${componentName} />;
}`;
}

export function DesignDetailModal({ item, isOpen, onClose }: DesignDetailModalProps) {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!item) return null;

  const sourceInfo = getSourceInfo(item);
  const usageCode = generateUsageCode(item);
  const isNpxInstall = item.install.startsWith("npx");
  const isCopyPaste = item.install.toLowerCase().includes("copy");

  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText(item.install);
      setCopiedInstall(true);
      toast.success("Install command copied!");
      setTimeout(() => setCopiedInstall(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(usageCode);
      setCopiedCode(true);
      toast.success("Code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleOpenDocs = () => {
    if (item.docsUrl) {
      window.open(item.docsUrl, "_blank");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0A0A0B] border border-white/10 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <VisuallyHidden>
          <DialogTitle>{item.name}</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white font-display">{item.name}</h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: `${sourceInfo.color}40`,
                  color: sourceInfo.color,
                  backgroundColor: `${sourceInfo.color}10`,
                }}
              >
                {sourceInfo.name}
              </span>
            </div>
            <p className="text-sm text-zinc-400">{item.description}</p>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {item.tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <Tabs defaultValue="install" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b border-white/10 bg-black/20">
            <TabsList className="bg-transparent border-0 p-0 h-12 gap-6">
              <TabsTrigger
                value="install"
                className="bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none h-full px-0 flex items-center gap-2"
              >
                <Terminal size={14} /> Install
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none h-full px-0 flex items-center gap-2"
              >
                <Code2 size={14} /> Usage
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="bg-transparent border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00F0FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00F0FF] rounded-none h-full px-0 flex items-center gap-2"
              >
                <Eye size={14} /> Preview
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Install Tab */}
          <TabsContent value="install" className="flex-1 m-0 overflow-auto p-6 space-y-6">
            {/* Install Command */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Terminal size={16} className="text-[#00F0FF]" />
                Installation
              </div>

              {isCopyPaste ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-200">
                    This component requires manual installation. Visit the documentation to copy the code.
                  </p>
                  {item.docsUrl && (
                    <Button
                      onClick={handleOpenDocs}
                      className="mt-3 bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      <ExternalLink size={14} className="mr-2" />
                      Open {sourceInfo.name}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="relative group">
                  <div className="p-4 rounded-xl bg-[#050505] border border-white/5 font-mono text-sm">
                    {isNpxInstall ? (
                      <div className="flex items-start gap-2 text-zinc-300">
                        <span className="text-[#00F0FF] select-none">$</span>
                        <span>
                          <span className="text-[#00F0FF]">npx</span>{" "}
                          {item.install.replace("npx ", "")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-zinc-300">
                        <span className="text-[#00F0FF] select-none">$</span>
                        <span>{item.install}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCopyInstall}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copiedInstall ? (
                      <Check size={16} className="text-[#00F0FF]" />
                    ) : (
                      <Copy size={16} className="text-zinc-400" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Dependencies */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Layers size={16} className="text-[#7000FF]" />
                Tech Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags
                  .filter((tag) =>
                    ["React", "Tailwind", "Framer Motion", "Radix UI", "Three.js", "CSS"].some((t) =>
                      tag.toLowerCase().includes(t.toLowerCase())
                    )
                  )
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#7000FF]/10 border border-[#7000FF]/20 text-[#A78BFA]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>

            {/* Quick Links */}
            {item.docsUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ExternalLink size={16} className="text-[#FF0080]" />
                  Documentation
                </div>
                <a
                  href={item.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00F0FF]/30 hover:bg-[#00F0FF]/5 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${sourceInfo.color}20` }}
                  >
                    <Sparkles size={20} style={{ color: sourceInfo.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-[#00F0FF] transition-colors">
                      View on {sourceInfo.name}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">{item.docsUrl}</div>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-zinc-600 group-hover:text-[#00F0FF] transition-colors"
                  />
                </a>
              </div>
            )}
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="flex-1 m-0 overflow-auto">
            <div className="relative">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copiedCode ? (
                    <Check size={16} className="text-[#00F0FF]" />
                  ) : (
                    <Copy size={16} className="text-zinc-400" />
                  )}
                </button>
              </div>
              <pre className="p-6 bg-[#050505] font-mono text-sm text-zinc-300 overflow-x-auto">
                <code>{usageCode}</code>
              </pre>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
                <span className="text-xs text-zinc-400">Live Preview</span>
                {item.docsUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenDocs}
                    className="h-7 text-xs text-zinc-400 hover:text-white"
                  >
                    <ExternalLink size={12} className="mr-1" />
                    View original
                  </Button>
                )}
              </div>
              <div className="flex-1 relative bg-zinc-950 flex items-center justify-center p-8 overflow-auto">
                <LivePreview item={item} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {isNpxInstall ? "One-click install with npx" : isCopyPaste ? "Manual installation required" : "CLI install"}
          </div>
          <div className="flex gap-3">
            {item.docsUrl && (
              <Button variant="outline" onClick={handleOpenDocs} className="border-white/10 hover:bg-white/5">
                <ExternalLink size={14} className="mr-2" />
                Docs
              </Button>
            )}
            <Button onClick={handleCopyInstall} className="bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 font-bold">
              {copiedInstall ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
              {copiedInstall ? "Copied!" : "Copy Install"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
