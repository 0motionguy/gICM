import type { RegistryItem, UIComponent } from "@/types/registry";

// === UI COMPONENTS WITH ACTUAL SOURCE CODE ===
export const UI_COMPONENTS: UIComponent[] = [
  {
    id: "design-react-backgrounds-aurora",
    name: "/Aurora Background",
    description: "Subtle aurora/northern lights animated background effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Animation", "Gradient"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/aurora-background",
      license: "MIT",
    },
    code: {
      filename: "aurora-background.tsx",
      component: `"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              \`[--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
              [background-image:var(--white-gradient),var(--aurora)]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[10px] invert dark:invert-0
              after:content-[""] after:absolute after:inset-0
              after:[background-image:var(--white-gradient),var(--aurora)]
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]
              after:[background-size:200%,_100%]
              after:animate-aurora after:[background-attachment:fixed]
              after:mix-blend-difference
              pointer-events-none
              absolute -inset-[10px] opacity-50 will-change-transform\`,
              showRadialGradient &&
                \`[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]\`
            )}
          />
        </div>
        {children}
      </div>
    </main>
  );
};

export default AuroraBackground;`,
      css: `@keyframes aurora {
  from { background-position: 50% 50%, 50% 50%; }
  to { background-position: 350% 50%, 350% 50%; }
}
.animate-aurora { animation: aurora 60s linear infinite; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Hero() {
  return (
    <AuroraBackground>
      <h1 className="text-4xl font-bold text-white">Welcome</h1>
    </AuroraBackground>
  );
}`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-backgrounds-grid",
    name: "/Animated Grid",
    description:
      "SVG-based animated grid pattern with configurable colors and cell sizes",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Grid", "SVG", "Animation"],
    credit: {
      library: "Magic UI",
      url: "https://magicui.design/docs/components/animated-grid-pattern",
      license: "MIT",
    },
    code: {
      filename: "animated-grid.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  className?: string;
  cellSize?: number;
  strokeWidth?: number;
  color?: string;
  fade?: boolean;
}

export const AnimatedGridPattern = ({
  className,
  cellSize = 64,
  strokeWidth = 1,
  color = "currentColor",
  fade = true,
}: AnimatedGridPatternProps) => {
  const svgId = React.useId();

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={\`grid-\${svgId}\`}
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={\`M \${cellSize} 0 L 0 0 0 \${cellSize}\`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeOpacity={0.3}
            />
          </pattern>
          {fade && (
            <linearGradient id={\`fade-\${svgId}\`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          )}
          {fade && (
            <mask id={\`mask-\${svgId}\`}>
              <rect width="100%" height="100%" fill={\`url(#fade-\${svgId})\`} />
            </mask>
          )}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={\`url(#grid-\${svgId})\`}
          mask={fade ? \`url(#mask-\${svgId})\` : undefined}
        />
      </svg>
    </div>
  );
};

export default AnimatedGridPattern;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { AnimatedGridPattern } from "@/components/ui/animated-grid";

export default function Hero() {
  return (
    <div className="relative h-screen bg-black">
      <AnimatedGridPattern color="#06b6d4" cellSize={48} />
      <div className="relative z-10">Your content</div>
    </div>
  );
}`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "SVG"],
  },
  {
    id: "design-react-buttons-neon",
    name: "/Neon Button",
    description:
      "Glowing neon button with customizable colors and hover effects",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Neon", "Glow", "Animation"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/neon-button",
      license: "MIT",
    },
    code: {
      filename: "neon-button.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "cyan" | "purple" | "pink" | "green";
}

export const NeonButton = ({
  children,
  className,
  variant = "cyan",
  ...props
}: NeonButtonProps) => {
  const colors = {
    cyan: { bg: "bg-cyan-500", text: "text-black", shadow: "rgba(6,182,212,0.5)" },
    purple: { bg: "bg-purple-500", text: "text-white", shadow: "rgba(168,85,247,0.5)" },
    pink: { bg: "bg-pink-500", text: "text-white", shadow: "rgba(236,72,153,0.5)" },
    green: { bg: "bg-green-400", text: "text-black", shadow: "rgba(74,222,128,0.5)" },
  };

  const c = colors[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-6 py-3 font-bold rounded-lg transition-shadow",
        c.bg,
        c.text,
        className
      )}
      style={{
        boxShadow: \`0 0 20px \${c.shadow}, 0 0 40px \${c.shadow.replace("0.5", "0.3")}\`,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default NeonButton;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { NeonButton } from "@/components/ui/neon-button";

export default function Example() {
  return (
    <div className="flex gap-4">
      <NeonButton variant="cyan">Cyan</NeonButton>
      <NeonButton variant="purple">Purple</NeonButton>
      <NeonButton variant="pink">Pink</NeonButton>
      <NeonButton variant="green">Green</NeonButton>
    </div>
  );
}`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-glass",
    name: "/Glass Button",
    description: "Frosted glass button with blur backdrop and subtle border",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Glass", "Blur", "Glassmorphism"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/glass-button",
      license: "MIT",
    },
    code: {
      filename: "glass-button.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pill";
}

export const GlassButton = ({
  children,
  className,
  variant = "default",
  ...props
}: GlassButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium hover:bg-white/20 transition-all shadow-lg",
        variant === "pill" ? "rounded-full" : "rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GlassButton;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { GlassButton } from "@/components/ui/glass-button";

export default function Example() {
  return (
    <div className="flex gap-4 p-8 bg-gradient-to-br from-purple-600/20 to-pink-500/20">
      <GlassButton>Default</GlassButton>
      <GlassButton variant="pill">Pill</GlassButton>
    </div>
  );
}`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-cards-glass",
    name: "/Glass Card",
    description: "Frosted glass card with cursor spotlight effect on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Glass", "Spotlight", "Interactive"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/card-hover-effect",
      license: "MIT",
    },
    code: {
      filename: "glass-card.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4 }}
      className={cn(
        "relative w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: \`radial-gradient(400px circle at \${mousePos.x}px \${mousePos.y}px, rgba(255,255,255,0.1), transparent 40%)\`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { GlassCard } from "@/components/ui/glass-card";

export default function Example() {
  return (
    <GlassCard>
      <h3 className="text-white font-bold text-lg mb-2">Glass Card</h3>
      <p className="text-zinc-400 text-sm">Hover to see the spotlight effect.</p>
    </GlassCard>
  );
}`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-typewriter",
    name: "/Typewriter Effect",
    description:
      "Animated typewriter text effect with customizable words and timing",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Animation", "Typewriter"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/typewriter-effect",
      license: "MIT",
    },
    code: {
      filename: "typewriter.tsx",
      component: `"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  words: string[];
  className?: string;
  cursorClassName?: string;
}

export const Typewriter = ({
  words,
  className,
  cursorClassName,
}: TypewriterProps) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < word.length) {
          setDisplayText(word.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(word.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWord((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 150);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWord, words]);

  return (
    <span className={cn("inline-flex", className)}>
      <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
        {displayText}
      </span>
      <span className={cn("animate-pulse text-purple-400", cursorClassName)}>|</span>
    </span>
  );
};

export default Typewriter;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Typewriter } from "@/components/ui/typewriter";

export default function Hero() {
  return (
    <div className="text-4xl font-bold">
      The best way to{" "}
      <Typewriter words={["Build", "Ship", "Scale", "Grow"]} />
      {" "}your product
    </div>
  );
}`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-loaders-spinner",
    name: "/Spinner Loaders",
    description: "Collection of animated loading spinners with multiple styles",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Spinner", "Animation"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/spinner",
      license: "MIT",
    },
    code: {
      filename: "spinner.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpinnerProps {
  className?: string;
  variant?: "ring" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({
  className,
  variant = "ring",
  size = "md",
}: SpinnerProps) => {
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };

  if (variant === "ring") {
    return (
      <motion.div
        className={cn(sizes[size], "rounded-full border-4 border-transparent", className)}
        style={{ borderTopColor: "#8b5cf6", borderRightColor: "#ec4899" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full", className)}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", sizes[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full bg-purple-500"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="absolute inset-2 rounded-full bg-purple-500" />
    </div>
  );
};

export default Spinner;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex gap-10">
      <Spinner variant="ring" />
      <Spinner variant="dots" />
      <Spinner variant="pulse" />
    </div>
  );
}`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-navigation-dock",
    name: "/Floating Dock",
    description:
      "macOS-style dock navigation with magnification effect on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Navigation", "Dock", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/floating-dock",
      license: "MIT",
    },
    code: {
      filename: "floating-dock.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface FloatingDockProps {
  items: DockItem[];
  className?: string;
}

export const FloatingDock = ({ items, className }: FloatingDockProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.div
      className={cn(
        "flex gap-2 bg-zinc-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl",
        className
      )}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {items.map((item, i) => (
        <motion.button
          key={item.label}
          onClick={() => {
            setActiveIndex(i);
            item.onClick?.();
          }}
          whileHover={{ scale: 1.2, y: -8 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors",
            i === activeIndex
              ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30"
              : "bg-zinc-800 hover:bg-zinc-700"
          )}
        >
          {item.icon}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default FloatingDock;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { FloatingDock } from "@/components/ui/floating-dock";

export default function Navigation() {
  const items = [
    { icon: "🏠", label: "Home" },
    { icon: "🔍", label: "Search" },
    { icon: "📁", label: "Files" },
    { icon: "⚙️", label: "Settings" },
  ];

  return <FloatingDock items={items} />;
}`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-animations-marquee",
    name: "/Marquee",
    description: "Infinite scrolling marquee animation for logos and content",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Animation", "Marquee", "Scroll"],
    credit: {
      library: "Magic UI",
      url: "https://magicui.design/docs/components/marquee",
      license: "MIT",
    },
    code: {
      filename: "marquee.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  speed?: number;
  gap?: number;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  speed = 20,
  gap = 16,
}) => {
  return (
    <div
      className={cn(
        "group flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={{
        maskImage: vertical
          ? "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)"
          : "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
      }}
    >
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0",
            vertical ? "flex-col animate-marquee-vertical" : "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
          style={{ gap: \`\${gap}px\`, animationDuration: \`\${speed}s\` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
};

export default Marquee;`,
      css: `@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - 16px)); }
}
@keyframes marquee-vertical {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-100% - 16px)); }
}
.animate-marquee { animation: marquee 20s linear infinite; }
.animate-marquee-vertical { animation: marquee-vertical 20s linear infinite; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Marquee } from "@/components/ui/marquee";

export default function Logos() {
  const logos = ["Vercel", "Stripe", "GitHub", "Notion"];

  return (
    <Marquee pauseOnHover speed={30}>
      {logos.map((logo) => (
        <div key={logo} className="px-8 py-4 bg-zinc-800 rounded-lg text-white">
          {logo}
        </div>
      ))}
    </Marquee>
  );
}`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  // === BATCH 2: MORE BACKGROUNDS ===
  {
    id: "design-react-backgrounds-beams",
    name: "/Background Beams",
    description: "Animated light beams radiating from a central point",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Beams", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/background-beams",
      license: "MIT",
    },
    code: {
      filename: "background-beams.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-black" />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-0 h-[500px] w-[2px] -translate-x-1/2 animate-beam"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.5), transparent)",
            transform: \`translateX(-50%) rotate(\${(i - 3) * 15}deg)\`,
            transformOrigin: "top center",
            animationDelay: \`\${i * 0.3}s\`,
          }}
        />
      ))}
      <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-violet-500 blur-xl" />
    </div>
  );
};
export default BackgroundBeams;`,
      css: `@keyframes beam { 0%,100%{opacity:0;} 50%{opacity:1;} }
.animate-beam { animation: beam 4s ease-in-out infinite; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { BackgroundBeams } from "@/components/ui/background-beams";
<div className="relative h-screen"><BackgroundBeams /><div className="relative z-10">Content</div></div>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-backgrounds-spotlight",
    name: "/Spotlight",
    description: "Interactive spotlight effect following cursor movement",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Spotlight", "Interactive"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/spotlight",
      license: "MIT",
    },
    code: {
      filename: "spotlight.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const Spotlight = ({ className, fill = "white" }: { className?: string; fill?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: \`radial-gradient(600px circle at \${position.x}px \${position.y}px, rgba(255,255,255,0.1), transparent 40%)\`,
        }}
      />
    </div>
  );
};
export default Spotlight;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Spotlight } from "@/components/ui/spotlight";
<Spotlight className="h-96 bg-zinc-900 rounded-xl p-8"><h1>Hover me</h1></Spotlight>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-backgrounds-meteors",
    name: "/Meteors",
    description: "Animated falling meteors background effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Meteors", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/meteors",
      license: "MIT",
    },
    code: {
      filename: "meteors.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Meteors = ({ number = 20, className }: { number?: number; className?: string }) => {
  const meteors = [...Array(number)].map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {meteors.map((m) => (
        <span
          key={m.id}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10]"
          style={{
            top: m.top + "%",
            left: m.left + "%",
            animationDelay: m.delay + "s",
            animationDuration: m.duration + "s",
          }}
        >
          <div className="absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-slate-500 to-transparent" />
        </span>
      ))}
    </div>
  );
};
export default Meteors;`,
      css: `@keyframes meteor { 0%{transform:rotate(215deg) translateX(0);opacity:1;} 70%{opacity:1;} 100%{transform:rotate(215deg) translateX(-500px);opacity:0;} }
.animate-meteor { animation: meteor 5s linear infinite; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Meteors } from "@/components/ui/meteors";
<div className="relative h-64 bg-black rounded-xl overflow-hidden"><Meteors number={30} /></div>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-backgrounds-sparkles",
    name: "/Sparkles",
    description: "Random animated sparkle particles effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Sparkles", "Particles"],
    credit: {
      library: "Magic UI",
      url: "https://magicui.design/docs/components/sparkles",
      license: "MIT",
    },
    code: {
      filename: "sparkles.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Sparkles = ({ className, count = 50 }: { className?: string; count?: number }) => {
  const sparkles = [...Array(count)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: s.x + "%", top: s.y + "%", width: s.size, height: s.size }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};
export default Sparkles;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Sparkles } from "@/components/ui/sparkles";
<div className="relative h-64 bg-black"><Sparkles count={100} /></div>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-backgrounds-dots",
    name: "/Dot Pattern",
    description: "Subtle animated dot pattern background",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Dots", "Pattern"],
    credit: {
      library: "Magic UI",
      url: "https://magicui.design/docs/components/dot-pattern",
      license: "MIT",
    },
    code: {
      filename: "dot-pattern.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const DotPattern = ({
  className,
  cx = 1,
  cy = 1,
  cr = 1,
  width = 16,
  height = 16,
}: {
  className?: string;
  cx?: number;
  cy?: number;
  cr?: number;
  width?: number;
  height?: number;
}) => {
  const id = React.useId();
  return (
    <svg className={cn("absolute inset-0 h-full w-full", className)} aria-hidden="true">
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={\`url(#\${id})\`} />
    </svg>
  );
};
export default DotPattern;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { DotPattern } from "@/components/ui/dot-pattern";
<div className="relative h-64 bg-white"><DotPattern className="text-zinc-300" /></div>`,
    },
    preview: { height: "200px", darkMode: false },
    tech_stack: ["React", "Tailwind CSS", "SVG"],
  },
  // === BATCH 3: MORE BUTTONS ===
  {
    id: "design-react-buttons-shimmer",
    name: "/Shimmer Button",
    description: "Button with animated shimmer/shine effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Shimmer", "Animation"],
    credit: {
      library: "Magic UI",
      url: "https://magicui.design/docs/components/shimmer-button",
      license: "MIT",
    },
    code: {
      filename: "shimmer-button.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const ShimmerButton = ({
  children,
  className,
  shimmerColor = "#ffffff",
  shimmerSize = "0.1em",
  borderRadius = "100px",
  background = "rgba(0, 0, 0, 1)",
}: {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  background?: string;
}) => {
  return (
    <button
      className={cn(
        "group relative overflow-hidden px-6 py-3 text-white font-medium transition-all",
        className
      )}
      style={{ borderRadius, background }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-[-100%] animate-shimmer"
          style={{
            background: \`linear-gradient(90deg, transparent, \${shimmerColor}20, transparent)\`,
          }}
        />
      </div>
      <span className="relative z-10">{children}</span>
    </button>
  );
};
export default ShimmerButton;`,
      css: `@keyframes shimmer { 0%{transform:translateX(-100%);} 100%{transform:translateX(100%);} }
.animate-shimmer { animation: shimmer 2s infinite; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { ShimmerButton } from "@/components/ui/shimmer-button";
<ShimmerButton>Click me</ShimmerButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-moving-border",
    name: "/Moving Border",
    description: "Button with animated moving gradient border",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Border", "Animation", "Gradient"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/moving-border",
      license: "MIT",
    },
    code: {
      filename: "moving-border.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MovingBorder = ({
  children,
  className,
  duration = 2,
  borderRadius = "1.75rem",
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  borderRadius?: string;
}) => {
  return (
    <div className={cn("relative p-[1px] overflow-hidden", className)} style={{ borderRadius }}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
          backgroundSize: "300% 100%",
          borderRadius,
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative bg-zinc-950 px-6 py-3 text-white" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
};
export default MovingBorder;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { MovingBorder } from "@/components/ui/moving-border";
<MovingBorder duration={3}>Hover me</MovingBorder>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-magnetic",
    name: "/Magnetic Button",
    description: "Button that follows cursor with magnetic effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Magnetic", "Interactive"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/magnetic-button",
      license: "MIT",
    },
    code: {
      filename: "magnetic-button.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MagneticButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.3;
    const y = (clientY - top - height / 2) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className={cn("px-6 py-3 bg-white text-black font-medium rounded-full", className)}
    >
      {children}
    </motion.button>
  );
};
export default MagneticButton;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { MagneticButton } from "@/components/ui/magnetic-button";
<MagneticButton>Follow me</MagneticButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-ripple",
    name: "/Ripple Button",
    description: "Button with material design ripple effect on click",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Ripple", "Material"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/ripple-button",
      license: "MIT",
    },
    code: {
      filename: "ripple-button.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface Ripple { x: number; y: number; id: number; }

export const RippleButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  return (
    <button
      onClick={addRipple}
      className={cn("relative overflow-hidden px-6 py-3 bg-violet-600 text-white font-medium rounded-lg", className)}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute bg-white/30 rounded-full animate-ripple"
          style={{ left: r.x, top: r.y, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
};
export default RippleButton;`,
      css: `@keyframes ripple { 0%{width:0;height:0;opacity:0.5;} 100%{width:200px;height:200px;opacity:0;} }
.animate-ripple { animation: ripple 0.6s ease-out; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { RippleButton } from "@/components/ui/ripple-button";
<RippleButton>Click me</RippleButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-gradient-border",
    name: "/Gradient Border Button",
    description: "Button with animated gradient border",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Gradient", "Border"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/gradient-border-button",
      license: "MIT",
    },
    code: {
      filename: "gradient-border-button.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const GradientBorderButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      className={cn(
        "relative px-6 py-3 font-medium text-white rounded-xl overflow-hidden group",
        className
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
      <span className="absolute inset-[2px] bg-zinc-950 rounded-[10px] transition-all group-hover:bg-zinc-900" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};
export default GradientBorderButton;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { GradientBorderButton } from "@/components/ui/gradient-border-button";
<GradientBorderButton>Click me</GradientBorderButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  // === BATCH 4: MORE CARDS ===
  {
    id: "design-react-cards-3d",
    name: "/3D Card",
    description: "Card with 3D tilt effect on mouse movement",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "3D", "Tilt", "Interactive"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/3d-card-effect",
      license: "MIT",
    },
    code: {
      filename: "card-3d.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const Card3D = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    setTransform(\`perspective(1000px) rotateX(\${-y}deg) rotateY(\${x}deg)\`);
  };

  const handleMouseLeave = () => setTransform("");

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("transition-transform duration-200 ease-out", className)}
      style={{ transform }}
    >
      {children}
    </div>
  );
};
export default Card3D;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Card3D } from "@/components/ui/card-3d";
<Card3D className="w-64 p-6 bg-zinc-900 rounded-xl"><h3>Hover me</h3></Card3D>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-cards-hover",
    name: "/Hover Card",
    description: "Card that reveals content on hover with smooth animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Hover", "Reveal"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/hover-card",
      license: "MIT",
    },
    code: {
      filename: "hover-card.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const HoverCard = ({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "group relative p-6 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">{description}</p>
      </div>
    </motion.div>
  );
};
export default HoverCard;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { HoverCard } from "@/components/ui/hover-card";
<HoverCard title="Feature" description="Description here" icon={<Icon />} />`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-cards-bento",
    name: "/Bento Grid",
    description: "Bento-style grid layout for showcasing features",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Grid", "Bento", "Layout"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/bento-grid",
      license: "MIT",
    },
    code: {
      filename: "bento-grid.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto", className)}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  title,
  description,
  header,
  icon,
  className,
}: {
  title: string;
  description: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-zinc-900 border border-zinc-800 flex flex-col space-y-4",
        className
      )}
    >
      {header}
      <div className="transition duration-200">
        {icon}
        <div className="font-bold text-white mt-2">{title}</div>
        <div className="text-xs text-zinc-400">{description}</div>
      </div>
    </div>
  );
};
export default BentoGrid;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
<BentoGrid><BentoGridItem title="Feature" description="Description" /></BentoGrid>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-cards-feature",
    name: "/Feature Card",
    description: "Card for highlighting product features with icon",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Feature", "Icon"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/feature-card",
      license: "MIT",
    },
    code: {
      filename: "feature-card.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const FeatureCard = ({
  title,
  description,
  icon,
  gradient = "from-violet-500 to-purple-500",
  className,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  className?: string;
}) => {
  return (
    <div className={cn("p-6 bg-zinc-900 rounded-2xl border border-zinc-800", className)}>
      <div className={\`w-14 h-14 rounded-xl bg-gradient-to-br \${gradient} flex items-center justify-center text-white mb-4\`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
};
export default FeatureCard;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { FeatureCard } from "@/components/ui/feature-card";
<FeatureCard title="Fast" description="Lightning fast performance" icon={<Zap />} />`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-cards-pricing",
    name: "/Pricing Card",
    description: "Pricing tier card with features list and CTA",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Pricing", "SaaS"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/pricing-card",
      license: "MIT",
    },
    code: {
      filename: "pricing-card.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const PricingCard = ({
  name,
  price,
  period = "month",
  description,
  features,
  popular = false,
  className,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative p-6 bg-zinc-900 rounded-2xl border",
        popular ? "border-violet-500 shadow-lg shadow-violet-500/20" : "border-zinc-800",
        className
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">
          Popular
        </span>
      )}
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <p className="text-sm text-zinc-400 mt-1">{description}</p>
      <div className="mt-4">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-zinc-500">/{period}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
            <Check size={16} className="text-violet-400" /> {f}
          </li>
        ))}
      </ul>
      <button className="w-full mt-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors">
        Get Started
      </button>
    </div>
  );
};
export default PricingCard;`,
      dependencies: ["clsx", "tailwind-merge", "lucide-react"],
      usage: `import { PricingCard } from "@/components/ui/pricing-card";
<PricingCard name="Pro" price="$29" description="For teams" features={["Feature 1", "Feature 2"]} popular />`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Lucide"],
  },
  // === BATCH 5: TEXT EFFECTS ===
  {
    id: "design-react-text-generate",
    name: "/Text Generate",
    description: "Text that generates character by character with animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Animation", "Generate"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/text-generate-effect",
      license: "MIT",
    },
    code: {
      filename: "text-generate.tsx",
      component: `"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const TextGenerate = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + words[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words]);

  return (
    <motion.span
      className={cn("text-white", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayedText}
      {currentIndex < words.length && <span className="animate-pulse">|</span>}
    </motion.span>
  );
};
export default TextGenerate;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { TextGenerate } from "@/components/ui/text-generate";
<TextGenerate words="Hello, this is generated text!" className="text-2xl" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-flip",
    name: "/Flip Words",
    description: "Animated text that flips between different words",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Animation", "Flip"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/flip-words",
      license: "MIT",
    },
    code: {
      filename: "flip-words.tsx",
      component: `"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const FlipWords = ({
  words,
  className,
  duration = 3000,
}: {
  words: string[];
  className?: string;
  duration?: number;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn("inline-block text-violet-400", className)}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};
export default FlipWords;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { FlipWords } from "@/components/ui/flip-words";
<h1>Build <FlipWords words={["faster", "better", "smarter"]} /> products</h1>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-number",
    name: "/Number Ticker",
    description: "Animated counting number with easing",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Animation", "Counter"],
    credit: {
      library: "Magic UI",
      url: "https://magicui.design/docs/components/number-ticker",
      license: "MIT",
    },
    code: {
      filename: "number-ticker.tsx",
      component: `"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useSpring, useTransform } from "framer-motion";

export const NumberTicker = ({
  value,
  className,
  duration = 2,
}: {
  value: number;
  className?: string;
  duration?: number;
}) => {
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on("change", (v) => setDisplayValue(v));
  }, [display]);

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {displayValue.toLocaleString()}
    </motion.span>
  );
};
export default NumberTicker;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { NumberTicker } from "@/components/ui/number-ticker";
<NumberTicker value={10000} className="text-4xl font-bold" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-gradient",
    name: "/Gradient Text",
    description: "Text with animated gradient color effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Gradient", "Animation"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/gradient-text",
      license: "MIT",
    },
    code: {
      filename: "gradient-text.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const GradientText = ({
  children,
  className,
  colors = "from-violet-400 via-pink-500 to-orange-500",
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  colors?: string;
  animate?: boolean;
}) => {
  return (
    <span
      className={cn(
        \`bg-gradient-to-r \${colors} bg-clip-text text-transparent\`,
        animate && "animate-gradient bg-[length:200%_auto]",
        className
      )}
    >
      {children}
    </span>
  );
};
export default GradientText;`,
      css: `@keyframes gradient { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
.animate-gradient { animation: gradient 3s ease infinite; }`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { GradientText } from "@/components/ui/gradient-text";
<h1><GradientText>Amazing Headline</GradientText></h1>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-text-wavy",
    name: "/Wavy Text",
    description: "Text with wavy animation effect on each character",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Animation", "Wave"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/wavy-text",
      license: "MIT",
    },
    code: {
      filename: "wavy-text.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const WavyText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <span className={cn("inline-flex", className)}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          {char === " " ? "\\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};
export default WavyText;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { WavyText } from "@/components/ui/wavy-text";
<WavyText text="Hello World" className="text-4xl text-white" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  // === BATCH 6: MORE LOADERS ===
  {
    id: "design-react-loaders-dots",
    name: "/Dots Loader",
    description: "Animated bouncing dots loading indicator",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Dots", "Animation"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/dots-loader",
      license: "MIT",
    },
    code: {
      filename: "dots-loader.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const DotsLoader = ({
  className,
  color = "#8b5cf6",
  size = "md",
}: {
  className?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };
  const gaps = { sm: "gap-1", md: "gap-1.5", lg: "gap-2" };

  return (
    <div className={cn("flex", gaps[size], className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(sizes[size], "rounded-full")}
          style={{ backgroundColor: color }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};
export default DotsLoader;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { DotsLoader } from "@/components/ui/dots-loader";
<DotsLoader size="md" color="#8b5cf6" />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-skeleton",
    name: "/Skeleton",
    description: "Animated skeleton placeholder for loading states",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Skeleton", "Placeholder"],
    credit: {
      library: "shadcn/ui",
      url: "https://ui.shadcn.com/docs/components/skeleton",
      license: "MIT",
    },
    code: {
      filename: "skeleton.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-zinc-800", className)} />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="p-4 bg-zinc-900 rounded-xl space-y-4">
      <Skeleton className="h-32 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};
export default Skeleton;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
<Skeleton className="h-4 w-[250px]" />
<SkeletonCard />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-loaders-progress",
    name: "/Progress Bar",
    description: "Animated progress bar with percentage",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Progress", "Bar"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/progress",
      license: "MIT",
    },
    code: {
      filename: "progress.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Progress = ({
  value,
  className,
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) => {
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-zinc-400 mb-1">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: \`\${value}%\` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
export default Progress;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Progress } from "@/components/ui/progress";
<Progress value={75} showLabel />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  // === BATCH 7: INPUTS ===
  {
    id: "design-react-inputs-search",
    name: "/Search Input",
    description: "Stylized search input with icon and focus effects",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Search", "Form"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/search-input",
      license: "MIT",
    },
    code: {
      filename: "search-input.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export const SearchInput = ({
  placeholder = "Search...",
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        {...props}
      />
    </div>
  );
};
export default SearchInput;`,
      dependencies: ["clsx", "tailwind-merge", "lucide-react"],
      usage: `import { SearchInput } from "@/components/ui/search-input";
<SearchInput placeholder="Search components..." />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Lucide"],
  },
  {
    id: "design-react-inputs-animated",
    name: "/Animated Input",
    description: "Input with animated floating label",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Animated", "Label"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/animated-input",
      license: "MIT",
    },
    code: {
      filename: "animated-input.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const AnimatedInput = ({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        className="w-full px-4 pt-6 pb-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-colors peer"
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); setHasValue(!!e.target.value); }}
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none text-zinc-500",
          focused || hasValue ? "top-2 text-xs text-violet-400" : "top-1/2 -translate-y-1/2 text-sm"
        )}
      >
        {label}
      </label>
    </div>
  );
};
export default AnimatedInput;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { AnimatedInput } from "@/components/ui/animated-input";
<AnimatedInput label="Email address" type="email" />`,
    },
    preview: { height: "120px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-inputs-toggle",
    name: "/Toggle Switch",
    description: "Animated toggle switch component",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Toggle", "Switch"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/toggle",
      license: "MIT",
    },
    code: {
      filename: "toggle.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Toggle = ({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-14 h-8 rounded-full transition-colors",
        checked ? "bg-violet-600" : "bg-zinc-700",
        className
      )}
    >
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
};
export default Toggle;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Toggle } from "@/components/ui/toggle";
const [on, setOn] = useState(false);
<Toggle checked={on} onChange={setOn} />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-inputs-slider",
    name: "/Range Slider",
    description: "Stylized range slider with value tooltip",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Slider", "Range"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/slider",
      license: "MIT",
    },
    code: {
      filename: "slider.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg"
      />
      <div
        className="absolute top-0 left-0 h-2 bg-violet-500 rounded-full pointer-events-none"
        style={{ width: \`\${percentage}%\` }}
      />
    </div>
  );
};
export default Slider;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Slider } from "@/components/ui/slider";
const [val, setVal] = useState(50);
<Slider value={val} onChange={setVal} />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-inputs-select",
    name: "/Custom Select",
    description: "Dropdown select with custom styling",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Select", "Dropdown"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/select",
      license: "MIT",
    },
    code: {
      filename: "select.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left flex items-center justify-between text-white hover:border-zinc-700 transition-colors"
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>{selected?.label || placeholder}</span>
        <ChevronDown className={\`w-4 h-4 text-zinc-500 transition-transform \${isOpen ? "rotate-180" : ""}\`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50"
          >
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={\`w-full px-4 py-2.5 text-left hover:bg-zinc-800 transition-colors \${o.value === value ? "text-violet-400" : "text-white"}\`}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Select;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion", "lucide-react"],
      usage: `import { Select } from "@/components/ui/select";
const [val, setVal] = useState("");
<Select options={[{value:"a",label:"Option A"}]} value={val} onChange={setVal} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion", "Lucide"],
  },
  // === BATCH 8: MODALS & OVERLAYS ===
  {
    id: "design-react-modals-dialog",
    name: "/Dialog Modal",
    description: "Animated modal dialog with overlay",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Modal", "Dialog", "Overlay"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/dialog",
      license: "MIT",
    },
    code: {
      filename: "dialog.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-800 p-6 z-50", className)}
          >
            <div className="flex items-center justify-between mb-4">
              {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
              <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default Dialog;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion", "lucide-react"],
      usage: `import { Dialog } from "@/components/ui/dialog";
const [open, setOpen] = useState(false);
<Dialog isOpen={open} onClose={() => setOpen(false)} title="Hello">Content</Dialog>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion", "Lucide"],
  },
  {
    id: "design-react-modals-drawer",
    name: "/Drawer",
    description: "Slide-in drawer component from edge of screen",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Modal", "Drawer", "Slide"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/drawer",
      license: "MIT",
    },
    code: {
      filename: "drawer.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 p-6 z-50",
              side === "right" ? "right-0" : "left-0 border-l-0 border-r",
              className
            )}
          >
            <div className="flex items-center justify-between mb-4">
              {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
              <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default Drawer;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion", "lucide-react"],
      usage: `import { Drawer } from "@/components/ui/drawer";
const [open, setOpen] = useState(false);
<Drawer isOpen={open} onClose={() => setOpen(false)} title="Menu">Content</Drawer>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion", "Lucide"],
  },
  {
    id: "design-react-modals-tooltip",
    name: "/Tooltip",
    description: "Animated tooltip on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Tooltip", "Hover", "Overlay"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/tooltip",
      license: "MIT",
    },
    code: {
      filename: "tooltip.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const Tooltip = ({
  children,
  content,
  side = "top",
  className,
}: {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn("absolute z-50 px-3 py-1.5 bg-zinc-800 text-white text-sm rounded-lg whitespace-nowrap", positions[side], className)}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Tooltip;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Tooltip } from "@/components/ui/tooltip";
<Tooltip content="Hello!"><button>Hover me</button></Tooltip>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  // === BATCH 9: OTHER COMPONENTS ===
  {
    id: "design-react-other-avatar",
    name: "/Avatar",
    description: "User avatar with fallback initials and status indicator",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Avatar", "Profile", "User"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/avatar",
      license: "MIT",
    },
    code: {
      filename: "avatar.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Avatar = ({
  src,
  alt,
  fallback,
  size = "md",
  status,
  className,
}: {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "away";
  className?: string;
}) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };
  const statusColors = { online: "bg-green-500", offline: "bg-zinc-500", away: "bg-yellow-500" };

  return (
    <div className={cn("relative inline-block", className)}>
      {src ? (
        <img src={src} alt={alt} className={cn("rounded-full object-cover", sizes[size])} />
      ) : (
        <div className={cn("rounded-full bg-violet-600 flex items-center justify-center text-white font-medium", sizes[size])}>
          {fallback?.slice(0, 2).toUpperCase()}
        </div>
      )}
      {status && (
        <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900", statusColors[status])} />
      )}
    </div>
  );
};
export default Avatar;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Avatar } from "@/components/ui/avatar";
<Avatar src="/avatar.jpg" alt="User" status="online" />
<Avatar fallback="JD" size="lg" />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-other-badge",
    name: "/Badge",
    description: "Small status badge with variants",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Badge", "Status", "Tag"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/badge",
      license: "MIT",
    },
    code: {
      filename: "badge.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
};
export default Badge;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Badge } from "@/components/ui/badge";
<Badge variant="success">Active</Badge>`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-other-accordion",
    name: "/Accordion",
    description: "Expandable accordion sections",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Accordion", "Expandable", "FAQ"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/accordion",
      license: "MIT",
    },
    code: {
      filename: "accordion.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const Accordion = ({
  items,
  className,
}: {
  items: { title: string; content: React.ReactNode }[];
  className?: string;
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, i) => (
        <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-white hover:bg-zinc-800/50 transition-colors"
          >
            <span className="font-medium">{item.title}</span>
            <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", openIndex === i && "rotate-180")} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 text-sm text-zinc-400">{item.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
export default Accordion;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion", "lucide-react"],
      usage: `import { Accordion } from "@/components/ui/accordion";
<Accordion items={[{title:"Question",content:"Answer"}]} />`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion", "Lucide"],
  },
  {
    id: "design-react-other-tabs",
    name: "/Tabs",
    description: "Animated tab navigation component",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Tabs", "Navigation", "Panel"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/tabs",
      license: "MIT",
    },
    code: {
      filename: "tabs.tsx",
      component: `"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Tabs = ({
  tabs,
  className,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  className?: string;
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  return (
    <div className={cn("", className)}>
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.id ? "text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-zinc-800 rounded-lg"
                transition={{ type: "spring", duration: 0.3 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
};
export default Tabs;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Tabs } from "@/components/ui/tabs";
<Tabs tabs={[{id:"1",label:"Tab 1",content:<p>Content 1</p>}]} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-other-notification",
    name: "/Notification Toast",
    description: "Animated notification toast component",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Toast", "Notification", "Alert"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/notification",
      license: "MIT",
    },
    code: {
      filename: "notification.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export const Notification = ({
  title,
  message,
  type = "info",
  onClose,
  className,
}: {
  title: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
  className?: string;
}) => {
  const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
  const colors = {
    success: "border-green-500/30 bg-green-500/10",
    error: "border-red-500/30 bg-red-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
    info: "border-blue-500/30 bg-blue-500/10",
  };
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn("flex items-start gap-3 p-4 rounded-xl border", colors[type], className)}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        {message && <p className="text-xs text-zinc-400 mt-1">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      )}
    </motion.div>
  );
};
export default Notification;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion", "lucide-react"],
      usage: `import { Notification } from "@/components/ui/notification";
<Notification title="Success!" message="Operation completed" type="success" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion", "Lucide"],
  },
  {
    id: "design-react-other-timeline",
    name: "/Timeline",
    description: "Vertical timeline for displaying events",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Timeline", "Events", "History"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/timeline",
      license: "MIT",
    },
    code: {
      filename: "timeline.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Timeline = ({
  items,
  className,
}: {
  items: { title: string; description: string; date?: string; icon?: React.ReactNode }[];
  className?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-800" />
      <div className="space-y-8">
        {items.map((item, i) => (
          <div key={i} className="relative pl-10">
            <div className="absolute left-0 w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
              {item.icon || <div className="w-2 h-2 rounded-full bg-violet-500" />}
            </div>
            <div>
              {item.date && <span className="text-xs text-zinc-500">{item.date}</span>}
              <h4 className="text-base font-medium text-white">{item.title}</h4>
              <p className="text-sm text-zinc-400 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Timeline;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Timeline } from "@/components/ui/timeline";
<Timeline items={[{title:"Event",description:"Description",date:"2024"}]} />`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  // === MORE ANIMATIONS ===
  {
    id: "design-react-animations-fade",
    name: "/Fade In",
    description: "Smooth fade-in animation wrapper",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Animation", "Fade", "Entrance"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/fade-in",
      license: "MIT",
    },
    code: {
      filename: "fade-in.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
export default FadeIn;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { FadeIn } from "@/components/ui/fade-in";
<FadeIn delay={0.2} direction="up"><h1>Hello</h1></FadeIn>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-animations-stagger",
    name: "/Stagger Children",
    description: "Staggered animation for list items",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Animation", "Stagger", "List"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/stagger",
      license: "MIT",
    },
    code: {
      filename: "stagger.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const StaggerContainer = ({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: staggerDelay } },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
export default StaggerContainer;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
<StaggerContainer>{items.map(i => <StaggerItem key={i}>{i}</StaggerItem>)}</StaggerContainer>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-animations-parallax",
    name: "/Parallax Scroll",
    description: "Parallax effect on scroll",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Animation", "Parallax", "Scroll"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/parallax",
      license: "MIT",
    },
    code: {
      filename: "parallax.tsx",
      component: `"use client";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

export const Parallax = ({
  children,
  className,
  speed = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};
export default Parallax;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { Parallax } from "@/components/ui/parallax";
<Parallax speed={0.3}><img src="/hero.jpg" /></Parallax>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-animations-reveal",
    name: "/Scroll Reveal",
    description: "Animate elements when they enter viewport",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Animation", "Reveal", "Scroll"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/scroll-reveal",
      license: "MIT",
    },
    code: {
      filename: "scroll-reveal.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const ScrollReveal = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
export default ScrollReveal;`,
      dependencies: ["clsx", "tailwind-merge", "framer-motion"],
      usage: `import { ScrollReveal } from "@/components/ui/scroll-reveal";
<ScrollReveal delay={0.2}><div>Appears on scroll</div></ScrollReveal>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  // === EXTRA COMPONENTS ===
  {
    id: "design-react-other-divider",
    name: "/Divider",
    description: "Decorative section divider with optional text",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Divider", "Separator", "Layout"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/divider",
      license: "MIT",
    },
    code: {
      filename: "divider.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Divider = ({
  children,
  className,
  orientation = "horizontal",
}: {
  children?: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}) => {
  if (orientation === "vertical") {
    return <div className={cn("w-px bg-zinc-800 self-stretch", className)} />;
  }

  if (children) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-sm text-zinc-500">{children}</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
    );
  }

  return <div className={cn("w-full h-px bg-zinc-800", className)} />;
};
export default Divider;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Divider } from "@/components/ui/divider";
<Divider>OR</Divider>`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-other-kbd",
    name: "/Keyboard Key",
    description: "Styled keyboard key indicator",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Keyboard", "Key", "Shortcut"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/kbd",
      license: "MIT",
    },
    code: {
      filename: "kbd.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Kbd = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-mono font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 rounded shadow-[0_2px_0_0_rgba(39,39,42,1)]",
        className
      )}
    >
      {children}
    </kbd>
  );
};
export default Kbd;`,
      dependencies: ["clsx", "tailwind-merge"],
      usage: `import { Kbd } from "@/components/ui/kbd";
<p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search</p>`,
    },
    preview: { height: "80px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-other-chip",
    name: "/Chip",
    description: "Removable tag chip component",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Chip", "Tag", "Removable"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/chip",
      license: "MIT",
    },
    code: {
      filename: "chip.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export const Chip = ({
  children,
  onRemove,
  className,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 bg-violet-500/10 text-violet-400 text-sm rounded-full border border-violet-500/20",
        className
      )}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:bg-violet-500/20 rounded-full p-0.5 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
export default Chip;`,
      dependencies: ["clsx", "tailwind-merge", "lucide-react"],
      usage: `import { Chip } from "@/components/ui/chip";
<Chip onRemove={() => {}}>React</Chip>`,
    },
    preview: { height: "80px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Lucide"],
  },
  {
    id: "design-react-other-empty-state",
    name: "/Empty State",
    description: "Empty state placeholder with icon and CTA",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Empty", "Placeholder", "State"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/empty-state",
      license: "MIT",
    },
    code: {
      filename: "empty-state.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-zinc-500" />}
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
export default EmptyState;`,
      dependencies: ["clsx", "tailwind-merge", "lucide-react"],
      usage: `import { EmptyState } from "@/components/ui/empty-state";
<EmptyState title="No results" description="Try adjusting your search" />`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Lucide"],
  },
  {
    id: "design-react-other-stat-card",
    name: "/Stat Card",
    description: "Statistics display card with trend indicator",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Stats", "Card", "Dashboard"],
    credit: {
      library: "ClawdBot",
      url: "https://clawdbot.com/components/stat-card",
      license: "MIT",
    },
    code: {
      filename: "stat-card.tsx",
      component: `"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({
  title,
  value,
  change,
  changeType = "increase",
  icon,
  className,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease";
  icon?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("p-6 bg-zinc-900 rounded-2xl border border-zinc-800", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{title}</span>
        {icon && <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">{icon}</div>}
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold text-white">{value}</span>
        {change && (
          <div className={cn("flex items-center gap-1 mt-2 text-sm", changeType === "increase" ? "text-green-400" : "text-red-400")}>
            {changeType === "increase" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
};
export default StatCard;`,
      dependencies: ["clsx", "tailwind-merge", "lucide-react"],
      usage: `import { StatCard } from "@/components/ui/stat-card";
<StatCard title="Revenue" value="$12,345" change="+12%" changeType="increase" />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Lucide"],
  },
  // ============================================================================
  // HOVER.DEV COMPONENTS
  // ============================================================================
  {
    id: "design-react-notifications-slide",
    name: "/Slide-in Notification",
    description:
      "Animated notifications that slide in from the side with stacking support",
    category: "Design",
    subcategory: "React UI",
    tags: [
      "React",
      "Tailwind",
      "Notification",
      "Toast",
      "Animation",
      "Framer Motion",
    ],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/notifications",
      license: "MIT",
    },
    code: {
      filename: "slide-notification.tsx",
      component: `"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-yellow-500",
};

export function SlideNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeNotification(id), 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => addNotification("success", "Success!", "Your action was completed.")} className="px-4 py-2 bg-green-600 text-white rounded-lg">Success</button>
        <button onClick={() => addNotification("error", "Error!", "Something went wrong.")} className="px-4 py-2 bg-red-600 text-white rounded-lg">Error</button>
        <button onClick={() => addNotification("info", "Info", "Here's some information.")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Info</button>
        <button onClick={() => addNotification("warning", "Warning!", "Please be careful.")} className="px-4 py-2 bg-yellow-600 text-white rounded-lg">Warning</button>
      </div>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        <AnimatePresence>
          {notifications.map((notification) => {
            const Icon = icons[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl flex gap-3"
              >
                <div className={\`w-10 h-10 rounded-full \${colors[notification.type]} flex items-center justify-center flex-shrink-0\`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                  <p className="text-zinc-400 text-xs mt-1">{notification.message}</p>
                </div>
                <button onClick={() => removeNotification(notification.id)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default SlideNotification;`,
      dependencies: ["framer-motion", "lucide-react"],
      usage: `import { SlideNotification } from "@/components/ui/slide-notification";
<SlideNotification />`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-notifications-stacked",
    name: "/Stacked Notifications",
    description: "Stacked notification system with collapse animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Notification", "Toast", "Stack", "Animation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/notifications",
      license: "MIT",
    },
    code: {
      filename: "stacked-notification.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";

interface StackedNotification {
  id: string;
  title: string;
  message: string;
  time: string;
}

export function StackedNotifications() {
  const [notifications, setNotifications] = useState<StackedNotification[]>([
    { id: "1", title: "New message", message: "You have a new message from John", time: "2m ago" },
    { id: "2", title: "Update available", message: "A new version is ready to install", time: "5m ago" },
    { id: "3", title: "Task completed", message: "Your export has finished", time: "10m ago" },
  ]);
  const [expanded, setExpanded] = useState(false);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = () => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [{ id, title: "New notification", message: "This is a new notification", time: "Just now" }, ...prev]);
  };

  return (
    <div className="relative">
      <button onClick={addNotification} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4" /> Add Notification
      </button>
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ height: expanded ? \`\${notifications.length * 80}px\` : "100px" }}
      >
        <AnimatePresence>
          {notifications.slice(0, expanded ? undefined : 3).map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: expanded ? 1 : 1 - index * 0.2,
                y: expanded ? index * 80 : index * 8,
                scale: expanded ? 1 : 1 - index * 0.05,
                zIndex: notifications.length - index,
              }}
              exit={{ opacity: 0, x: 200 }}
              className="absolute top-0 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                  <p className="text-zinc-400 text-xs mt-1">{notification.message}</p>
                  <span className="text-zinc-500 text-xs mt-2 block">{notification.time}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default StackedNotifications;`,
      dependencies: ["framer-motion", "lucide-react"],
      usage: `import { StackedNotifications } from "@/components/ui/stacked-notifications";
<StackedNotifications />`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-encrypt",
    name: "/Encrypt Button",
    description: "Button with scrambling text encryption effect on hover",
    category: "Design",
    subcategory: "React UI",
    tags: [
      "React",
      "Tailwind",
      "Button",
      "Text Effect",
      "Encryption",
      "Animation",
    ],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "encrypt-button.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";

const CHARS = "!@#$%^&*():{};|,.<>/?";

export function EncryptButton({ text = "Encrypt Data" }: { text?: string }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [displayText, setDisplayText] = useState(text);

  const scramble = () => {
    let iteration = 0;
    clearInterval(intervalRef.current as NodeJS.Timeout);
    intervalRef.current = setInterval(() => {
      setDisplayText(
        text.split("").map((char, index) => {
          if (index < iteration) return text[index];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      if (iteration >= text.length) clearInterval(intervalRef.current as NodeJS.Timeout);
      iteration += 1 / 3;
    }, 30);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setDisplayText(text);
  };

  return (
    <button
      onMouseEnter={scramble}
      onMouseLeave={stopScramble}
      className="group relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 font-mono font-medium text-zinc-200 transition-colors hover:text-[#00F0FF]"
    >
      <div className="relative z-10 flex items-center gap-2">
        <span>{displayText}</span>
      </div>
      <div className="absolute inset-0 z-0 scale-x-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 transition-transform duration-300 group-hover:scale-x-100" />
    </button>
  );
}
export default EncryptButton;`,
      dependencies: [],
      usage: `import { EncryptButton } from "@/components/ui/encrypt-button";
<EncryptButton text="Launch" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-hamburger",
    name: "/Hamburger Menu",
    description:
      "Animated hamburger menu button with smooth morphing animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Menu", "Navigation", "Animation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "hamburger-button.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function HamburgerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="relative w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center hover:border-zinc-600 transition-colors"
    >
      <div className="w-6 h-4 flex flex-col justify-between">
        <motion.span
          animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-6 bg-white origin-center"
        />
        <motion.span
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          className="block h-0.5 w-6 bg-white"
        />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-6 bg-white origin-center"
        />
      </div>
    </button>
  );
}
export default HamburgerButton;`,
      dependencies: ["framer-motion"],
      usage: `import { HamburgerButton } from "@/components/ui/hamburger-button";
<HamburgerButton />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-dotted",
    name: "/Dotted Button",
    description: "Button with animated dotted border effect on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Border", "Dotted", "Animation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "dotted-button.tsx",
      component: `"use client";
import React from "react";

export function DottedButton({ children = "Hover Me" }: { children?: React.ReactNode }) {
  return (
    <button className="group relative px-6 py-3 font-medium text-white">
      <span className="absolute inset-0 h-full w-full rounded-lg border-2 border-dashed border-zinc-600 transition-all duration-300 group-hover:border-[#00F0FF] group-hover:scale-105" />
      <span className="absolute inset-0 h-full w-full rounded-lg bg-zinc-900 transition-all duration-300 group-hover:bg-zinc-800" />
      <span className="relative">{children}</span>
    </button>
  );
}
export default DottedButton;`,
      dependencies: [],
      usage: `import { DottedButton } from "@/components/ui/dotted-button";
<DottedButton>Click Me</DottedButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-spotlight",
    name: "/Spotlight Button",
    description: "Button with mouse-following spotlight gradient effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Spotlight", "Gradient", "Mouse"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "spotlight-button.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";

export function SpotlightButton({ children = "Hover Me" }: { children?: React.ReactNode }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white border border-zinc-700 transition-colors hover:border-[#00F0FF]/50"
    >
      <span
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: \`radial-gradient(200px circle at \${position.x}px \${position.y}px, rgba(0,240,255,0.15), transparent 40%)\`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
export default SpotlightButton;`,
      dependencies: [],
      usage: `import { SpotlightButton } from "@/components/ui/spotlight-button";
<SpotlightButton>Explore</SpotlightButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-neubrutalism",
    name: "/Neubrutalism Button",
    description: "Bold neubrutalism style button with offset shadow",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Neubrutalism", "Bold", "Shadow"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "neubrutalism-button.tsx",
      component: `"use client";
import React from "react";

export function NeubrutalismButton({ children = "Click Me" }: { children?: React.ReactNode }) {
  return (
    <button className="relative px-6 py-3 font-bold text-black bg-[#00F0FF] border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
      {children}
    </button>
  );
}
export default NeubrutalismButton;`,
      dependencies: [],
      usage: `import { NeubrutalismButton } from "@/components/ui/neubrutalism-button";
<NeubrutalismButton>Bold Action</NeubrutalismButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-draw-outline",
    name: "/Draw Outline Button",
    description: "Button with animated border drawing effect on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Border", "Draw", "Animation", "SVG"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "draw-outline-button.tsx",
      component: `"use client";
import React from "react";

export function DrawOutlineButton({ children = "Hover Me" }: { children?: React.ReactNode }) {
  return (
    <button className="group relative px-6 py-3 font-medium text-[#00F0FF] transition-colors duration-300 hover:text-white">
      <span>{children}</span>
      <span className="absolute left-0 top-0 h-[2px] w-0 bg-[#00F0FF] transition-all duration-300 group-hover:w-full" />
      <span className="absolute right-0 top-0 h-0 w-[2px] bg-[#00F0FF] transition-all duration-300 delay-100 group-hover:h-full" />
      <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-[#00F0FF] transition-all duration-300 delay-200 group-hover:w-full" />
      <span className="absolute bottom-0 left-0 h-0 w-[2px] bg-[#00F0FF] transition-all duration-300 delay-300 group-hover:h-full" />
    </button>
  );
}
export default DrawOutlineButton;`,
      dependencies: [],
      usage: `import { DrawOutlineButton } from "@/components/ui/draw-outline-button";
<DrawOutlineButton>Draw Me</DrawOutlineButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-buttons-neumorphism",
    name: "/Neumorphism Button",
    description: "Soft UI neumorphism button with inner shadow effects",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Neumorphism", "Soft UI", "Shadow"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/buttons",
      license: "MIT",
    },
    code: {
      filename: "neumorphism-button.tsx",
      component: `"use client";
import React from "react";

export function NeumorphismButton({ children = "Soft Button" }: { children?: React.ReactNode }) {
  return (
    <button className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-medium shadow-[6px_6px_12px_#0a0a0a,-6px_-6px_12px_#1a1a1a] transition-all duration-200 active:shadow-[inset_6px_6px_12px_#0a0a0a,inset_-6px_-6px_12px_#1a1a1a] hover:shadow-[8px_8px_16px_#0a0a0a,-8px_-8px_16px_#1a1a1a]">
      {children}
    </button>
  );
}
export default NeumorphismButton;`,
      dependencies: [],
      usage: `import { NeumorphismButton } from "@/components/ui/neumorphism-button";
<NeumorphismButton>Soft Press</NeumorphismButton>`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-cards-swipe",
    name: "/Swipe Cards",
    description: "Tinder-like swipeable card stack with drag gestures",
    category: "Design",
    subcategory: "React UI",
    tags: [
      "React",
      "Tailwind",
      "Card",
      "Swipe",
      "Drag",
      "Gesture",
      "Framer Motion",
    ],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/cards",
      license: "MIT",
    },
    code: {
      filename: "swipe-cards.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

const CARDS = [
  { id: 1, title: "Card 1", color: "from-purple-600 to-pink-600" },
  { id: 2, title: "Card 2", color: "from-blue-600 to-cyan-600" },
  { id: 3, title: "Card 3", color: "from-orange-600 to-red-600" },
  { id: 4, title: "Card 4", color: "from-green-600 to-emerald-600" },
];

export function SwipeCards() {
  const [cards, setCards] = useState(CARDS);

  return (
    <div className="relative h-80 w-64">
      <AnimatePresence>
        {cards.map((card, index) => (
          <SwipeCard
            key={card.id}
            card={card}
            index={index}
            total={cards.length}
            removeCard={() => setCards((prev) => prev.filter((c) => c.id !== card.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SwipeCard({ card, index, total, removeCard }: { card: typeof CARDS[0]; index: number; total: number; removeCard: () => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > 100) removeCard();
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: total - index }}
      initial={{ scale: 1 - index * 0.05, y: index * 10 }}
      animate={{ scale: 1 - index * 0.05, y: index * 10 }}
      exit={{ x: x.get() > 0 ? 300 : -300, opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={\`absolute inset-0 rounded-2xl bg-gradient-to-br \${card.color} cursor-grab active:cursor-grabbing shadow-xl p-6 flex items-end\`}
    >
      <h3 className="text-2xl font-bold text-white">{card.title}</h3>
    </motion.div>
  );
}
export default SwipeCards;`,
      dependencies: ["framer-motion"],
      usage: `import { SwipeCards } from "@/components/ui/swipe-cards";
<SwipeCards />`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-cards-drag",
    name: "/Drag Cards",
    description: "Freely draggable cards that can be repositioned anywhere",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Drag", "Position", "Framer Motion"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/cards",
      license: "MIT",
    },
    code: {
      filename: "drag-cards.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

const CARDS = [
  { id: 1, title: "Drag Me", x: 0, y: 0, rotate: -6, color: "bg-purple-600" },
  { id: 2, title: "Move Around", x: 50, y: 50, rotate: 3, color: "bg-blue-600" },
  { id: 3, title: "Anywhere", x: -30, y: 100, rotate: -3, color: "bg-pink-600" },
];

export function DragCards() {
  return (
    <div className="relative h-80 w-full">
      {CARDS.map((card) => (
        <motion.div
          key={card.id}
          drag
          dragMomentum={false}
          initial={{ x: card.x, y: card.y, rotate: card.rotate }}
          whileDrag={{ scale: 1.1, cursor: "grabbing" }}
          className={\`absolute w-40 h-24 \${card.color} rounded-xl shadow-xl cursor-grab p-4 flex items-center justify-center\`}
        >
          <span className="text-white font-bold">{card.title}</span>
        </motion.div>
      ))}
    </div>
  );
}
export default DragCards;`,
      dependencies: ["framer-motion"],
      usage: `import { DragCards } from "@/components/ui/drag-cards";
<DragCards />`,
    },
    preview: { height: "350px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-cards-squishy",
    name: "/Squishy Card",
    description: "Card with satisfying squish animation on click",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Squish", "Animation", "Spring"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/cards",
      license: "MIT",
    },
    code: {
      filename: "squishy-card.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function SquishyCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="w-64 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 cursor-pointer select-none"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded">PRO</span>
        <span className="text-zinc-500 text-sm">Popular</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">$29<span className="text-sm font-normal text-zinc-400">/mo</span></h3>
      <p className="text-zinc-400 text-sm mb-4">Everything you need</p>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited projects</li>
        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority support</li>
        <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom domains</li>
      </ul>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-full mt-6 py-2 bg-purple-600 text-white font-semibold rounded-lg"
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}
export default SquishyCard;`,
      dependencies: ["framer-motion"],
      usage: `import { SquishyCard } from "@/components/ui/squishy-card";
<SquishyCard />`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-cards-tilt-hover",
    name: "/Tilt Hover Card",
    description: "Card that tilts based on mouse position with 3D perspective",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Tilt", "3D", "Mouse", "Perspective"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/cards",
      license: "MIT",
    },
    code: {
      filename: "tilt-hover-card.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export function TiltHoverCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = -(e.clientX - rect.left - rect.width / 2) / 10;
    setRotate({ x, y });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-64 h-40 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 shadow-xl cursor-pointer"
      >
        <h3 className="text-xl font-bold text-white">Hover Me</h3>
        <p className="text-white/70 text-sm mt-2">Move your mouse around</p>
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 rounded-full" />
      </motion.div>
    </div>
  );
}
export default TiltHoverCard;`,
      dependencies: ["framer-motion"],
      usage: `import { TiltHoverCard } from "@/components/ui/tilt-hover-card";
<TiltHoverCard />`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-bar",
    name: "/Bar Loader",
    description: "Animated progress bar loader with gradient effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Progress", "Bar", "Animation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/loaders",
      license: "MIT",
    },
    code: {
      filename: "bar-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function BarLoader({ className = "" }: { className?: string }) {
  return (
    <div className={\`w-64 h-2 bg-zinc-800 rounded-full overflow-hidden \${className}\`}>
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 via-[#00F0FF] to-purple-500 bg-[length:200%_100%]"
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
export default BarLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { BarLoader } from "@/components/ui/bar-loader";
<BarLoader />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-cutout",
    name: "/Cutout Text Loader",
    description: "Loading text with animated gradient cutout effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Text", "Gradient", "Cutout"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/loaders",
      license: "MIT",
    },
    code: {
      filename: "cutout-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function CutoutLoader({ text = "LOADING" }: { text?: string }) {
  return (
    <div className="relative">
      <span className="text-4xl font-black text-zinc-800 tracking-widest">{text}</span>
      <motion.span
        className="absolute inset-0 text-4xl font-black tracking-widest bg-gradient-to-r from-purple-500 via-[#00F0FF] to-purple-500 bg-clip-text text-transparent bg-[length:200%_100%]"
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {text}
      </motion.span>
    </div>
  );
}
export default CutoutLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { CutoutLoader } from "@/components/ui/cutout-loader";
<CutoutLoader text="LOADING" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-toggles-slider",
    name: "/Slider Toggle",
    description: "Smooth animated toggle switch with light/dark mode icons",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Toggle", "Switch", "Dark Mode", "Animation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/toggles",
      license: "MIT",
    },
    code: {
      filename: "slider-toggle.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function SliderToggle({ onChange }: { onChange?: (isDark: boolean) => void }) {
  const [isDark, setIsDark] = useState(true);

  const toggle = () => {
    setIsDark(!isDark);
    onChange?.(!isDark);
  };

  return (
    <button
      onClick={toggle}
      className={\`relative w-20 h-10 rounded-full p-1 transition-colors \${isDark ? "bg-zinc-800" : "bg-zinc-300"}\`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={\`w-8 h-8 rounded-full flex items-center justify-center \${isDark ? "bg-zinc-900 ml-auto" : "bg-white"}\`}
      >
        {isDark ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
      </motion.div>
    </button>
  );
}
export default SliderToggle;`,
      dependencies: ["framer-motion", "lucide-react"],
      usage: `import { SliderToggle } from "@/components/ui/slider-toggle";
<SliderToggle onChange={(isDark) => console.log(isDark)} />`,
    },
    preview: { height: "100px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-bubble",
    name: "/Bubble Text",
    description: "Text with floating bubble animation effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Bubble", "Animation", "Fun"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/text",
      license: "MIT",
    },
    code: {
      filename: "bubble-text.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function BubbleText({ text = "Bubble" }: { text?: string }) {
  return (
    <div className="flex">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="text-4xl font-black text-white inline-block"
          whileHover={{
            scale: 1.3,
            color: "#00F0FF",
            transition: { type: "spring", stiffness: 500 },
          }}
          animate={{
            y: [0, -5, 0],
            transition: { duration: 2, repeat: Infinity, delay: i * 0.1 },
          }}
        >
          {char === " " ? "\\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
}
export default BubbleText;`,
      dependencies: ["framer-motion"],
      usage: `import { BubbleText } from "@/components/ui/bubble-text";
<BubbleText text="Hello World" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-velocity",
    name: "/Velocity Scroll Text",
    description: "Text that changes speed based on scroll velocity",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Scroll", "Velocity", "Animation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/text",
      license: "MIT",
    },
    code: {
      filename: "velocity-text.tsx",
      component: `"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useVelocity } from "framer-motion";

export function VelocityText({ text = "SCROLL FASTER" }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const skewXRaw = useTransform(scrollVelocity, [-0.5, 0.5], [-25, 25]);
  const skewX = useSpring(skewXRaw, { mass: 1, stiffness: 200, damping: 50 });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <div ref={ref} className="overflow-hidden py-12">
      <motion.div style={{ x }} className="flex whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <motion.span
            key={i}
            style={{ skewX }}
            className="text-6xl font-black text-white mr-8"
          >
            {text} •
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
export default VelocityText;`,
      dependencies: ["framer-motion"],
      usage: `import { VelocityText } from "@/components/ui/velocity-text";
<VelocityText text="FAST SCROLL" />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-circle",
    name: "/Circle Text",
    description: "Text arranged in a rotating circle pattern using SVG",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Circle", "SVG", "Rotation"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/text",
      license: "MIT",
    },
    code: {
      filename: "circle-text.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function CircleText({ text = "ROTATING TEXT • AROUND CIRCLE • " }: { text?: string }) {
  return (
    <div className="relative w-48 h-48">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id="circlePath" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" fill="none" />
        </defs>
        <text className="text-xs font-bold fill-white uppercase tracking-[0.3em]">
          <textPath href="#circlePath">{text}</textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-[#00F0FF] rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-xl">→</span>
        </div>
      </div>
    </div>
  );
}
export default CircleText;`,
      dependencies: ["framer-motion"],
      usage: `import { CircleText } from "@/components/ui/circle-text";
<CircleText text="YOUR TEXT HERE • " />`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-text-fit",
    name: "/Fit Text",
    description: "Text that automatically scales to fit container width",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Text", "Responsive", "Scale", "Fit"],
    credit: {
      library: "Hover.dev",
      url: "https://www.hover.dev/components/text",
      license: "MIT",
    },
    code: {
      filename: "fit-text.tsx",
      component: `"use client";
import React, { useRef, useEffect, useState } from "react";

export function FitText({ text = "FIT TEXT" }: { text?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !textRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.offsetWidth;
      const newFontSize = (containerWidth / textWidth) * fontSize * 0.95;
      setFontSize(Math.min(newFontSize, 200));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [text, fontSize]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <span
        ref={textRef}
        style={{ fontSize: \`\${fontSize}px\` }}
        className="font-black text-white whitespace-nowrap"
      >
        {text}
      </span>
    </div>
  );
}
export default FitText;`,
      dependencies: [],
      usage: `import { FitText } from "@/components/ui/fit-text";
<FitText text="RESPONSIVE" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  // ============================================================================
  // ACETERNITY UI COMPONENTS
  // ============================================================================
  {
    id: "design-react-effects-tracing-beam",
    name: "/Tracing Beam",
    description: "Animated beam that traces along content as you scroll",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Beam", "Scroll", "Animation", "Line"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/tracing-beam",
      license: "MIT",
    },
    code: {
      filename: "tracing-beam.tsx",
      component: `"use client";
import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export function TracingBeam({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 500, damping: 90 });

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-px">
        <div className="absolute inset-0 bg-zinc-800" />
        <motion.div
          style={{ scaleY, transformOrigin: "top" }}
          className="absolute inset-0 bg-gradient-to-b from-purple-500 via-[#00F0FF] to-transparent"
        />
        <motion.div
          style={{ top: useTransform(scaleY, [0, 1], ["0%", "100%"]) }}
          className="absolute w-3 h-3 -left-1 bg-[#00F0FF] rounded-full shadow-[0_0_20px_5px_rgba(0,240,255,0.5)]"
        />
      </div>
      <div className="pl-16">{children}</div>
    </div>
  );
}
export default TracingBeam;`,
      dependencies: ["framer-motion"],
      usage: `import { TracingBeam } from "@/components/ui/tracing-beam";
<TracingBeam><YourContent /></TracingBeam>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-effects-lamp",
    name: "/Lamp Effect",
    description: "Dramatic lamp illumination effect with expanding glow",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Lamp", "Light", "Glow", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/lamp-effect",
      license: "MIT",
    },
    code: {
      filename: "lamp-effect.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function LampEffect({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-zinc-950 w-full h-[500px] rounded-xl">
      <div className="relative flex w-full flex-1 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{ backgroundImage: "conic-gradient(var(--conic-position), var(--tw-gradient-stops))" }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-[#00F0FF] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-full left-0 bg-zinc-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-full left-0 bg-zinc-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          style={{ backgroundImage: "conic-gradient(var(--conic-position), var(--tw-gradient-stops))" }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-[#00F0FF] text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-40 h-full right-0 bg-zinc-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-full right-0 bg-zinc-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-zinc-950 blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-50 h-0.5 w-[16rem] -translate-y-[7rem] bg-[#00F0FF]"
        />
      </div>
      <div className="relative z-50 flex flex-col items-center px-5 -mt-32">
        {children || (
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl font-bold text-white text-center"
          >
            Build with Light
          </motion.h1>
        )}
      </div>
    </div>
  );
}
export default LampEffect;`,
      dependencies: ["framer-motion"],
      usage: `import { LampEffect } from "@/components/ui/lamp-effect";
<LampEffect><h1>Your Title</h1></LampEffect>`,
    },
    preview: { height: "500px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-3d-pin",
    name: "/3D Pin",
    description: "3D animated pin marker with perspective hover effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "3D", "Pin", "Map", "Hover", "Perspective"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/3d-pin",
      license: "MIT",
    },
    code: {
      filename: "3d-pin.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function PinContainer({ children, title, href }: { children: React.ReactNode; title?: string; href?: string }) {
  const [transform, setTransform] = useState("translate(-50%,-50%) rotateX(0deg)");

  const onMouseEnter = () => setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
  const onMouseLeave = () => setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");

  return (
    <div
      className="relative group/pin z-50 cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{ perspective: "1000px", transform: "rotateX(70deg) translateZ(0deg)" }}
        className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          style={{ transform }}
          className="absolute left-1/2 p-4 top-1/2 flex justify-start items-start rounded-2xl shadow-[0_8px_16px_rgb(0_0_0/0.4)] bg-zinc-900 border border-zinc-800 group-hover/pin:border-[#00F0FF]/50 transition duration-700 overflow-hidden"
        >
          <div className="relative z-50">{children}</div>
        </div>
      </div>
      <PinPerspective title={title} href={href} />
    </div>
  );
}

function PinPerspective({ title, href }: { title?: string; href?: string }) {
  return (
    <motion.div className="pointer-events-none w-96 h-80 flex items-center justify-center opacity-0 group-hover/pin:opacity-100 z-[60] transition duration-500">
      <div className="w-full h-full -mt-7 flex-none inset-0">
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <a href={href} target="_blank" className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-zinc-700">
            <span className="relative z-20 text-white text-xs font-bold inline-block py-0.5">{title}</span>
          </a>
        </div>
        <div style={{ perspective: "1000px", transform: "rotateX(70deg) translateZ(0)" }} className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: 0 }}
            className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] bg-[#00F0FF]/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
            className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] bg-[#00F0FF]/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: [0, 1, 0.5, 0], scale: 1, z: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: 4 }}
            className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] rounded-[50%] bg-[#00F0FF]/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
          />
        </div>
        <motion.div className="absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-[#00F0FF] translate-y-[14px] w-px h-20 group-hover/pin:h-40 blur-[2px]" />
        <motion.div className="absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-[#00F0FF] translate-y-[14px] w-px h-20 group-hover/pin:h-40" />
        <motion.div className="absolute right-1/2 translate-x-[1.5px] bottom-1/2 bg-[#00F0FF] translate-y-[14px] w-[4px] h-[4px] rounded-full z-40 blur-[3px]" />
        <motion.div className="absolute right-1/2 translate-x-[0.5px] bottom-1/2 bg-[#00F0FF] translate-y-[14px] w-[2px] h-[2px] rounded-full z-40" />
      </div>
    </motion.div>
  );
}
export default PinContainer;`,
      dependencies: ["framer-motion"],
      usage: `import { PinContainer } from "@/components/ui/3d-pin";
<PinContainer title="Visit" href="https://example.com"><div>Content</div></PinContainer>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-modals-animated",
    name: "/Animated Modal",
    description: "Modal with smooth spring animations and backdrop blur",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Modal", "Dialog", "Animation", "Spring"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/animated-modal",
      license: "MIT",
    },
    code: {
      filename: "animated-modal.tsx",
      component: `"use client";
import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ModalContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>;
}

export function ModalTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpen } = useContext(ModalContext)!;
  return <button onClick={() => setOpen(true)} className={className}>{children}</button>;
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = useContext(ModalContext)!;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={\`relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl \${className}\`}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModalContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={\`flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800 \${className}\`}>{children}</div>;
}
export default Modal;`,
      dependencies: ["framer-motion", "lucide-react"],
      usage: `import { Modal, ModalTrigger, ModalBody, ModalContent, ModalFooter } from "@/components/ui/animated-modal";
<Modal>
  <ModalTrigger className="px-4 py-2 bg-purple-600 text-white rounded-lg">Open</ModalTrigger>
  <ModalBody>
    <ModalContent>
      <h2 className="text-xl font-bold text-white">Modal Title</h2>
      <p className="text-zinc-400 mt-2">Modal content here</p>
    </ModalContent>
    <ModalFooter>
      <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg">Cancel</button>
      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Confirm</button>
    </ModalFooter>
  </ModalBody>
</Modal>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-effects-link-preview",
    name: "/Link Preview",
    description: "Animated link preview card that appears on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Link", "Preview", "Hover", "Card", "Tooltip"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/link-preview",
      license: "MIT",
    },
    code: {
      filename: "link-preview.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LinkPreviewProps {
  children: React.ReactNode;
  url: string;
  imageSrc?: string;
  title?: string;
  description?: string;
}

export function LinkPreview({ children, url, imageSrc, title, description }: LinkPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#00F0FF] hover:underline">
        {children}
      </a>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: position.x + 20, top: position.y + 20 }}
          >
            <div className="w-64 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl">
              {imageSrc && <img src={imageSrc} alt={title} className="w-full h-32 object-cover" />}
              <div className="p-3">
                <h4 className="text-white font-semibold text-sm truncate">{title || url}</h4>
                {description && <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{description}</p>}
                <span className="text-zinc-500 text-xs mt-2 block truncate">{url}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
export default LinkPreview;`,
      dependencies: ["framer-motion"],
      usage: `import { LinkPreview } from "@/components/ui/link-preview";
<LinkPreview url="https://example.com" title="Example Site" description="A great website" imageSrc="/preview.jpg">
  hover me
</LinkPreview>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-multi-step",
    name: "/Multi Step Loader",
    description: "Animated multi-step loading indicator with progress states",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Steps", "Progress", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/multi-step-loader",
      license: "MIT",
    },
    code: {
      filename: "multi-step-loader.tsx",
      component: `"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

interface LoadingState {
  text: string;
}

interface MultiStepLoaderProps {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}

export function MultiStepLoader({ loadingStates, loading = true, duration = 2000, loop = true }: MultiStepLoaderProps) {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentState((prev) => {
        if (prev === loadingStates.length - 1) return loop ? 0 : prev;
        return prev + 1;
      });
    }, duration);
    return () => clearInterval(interval);
  }, [loading, duration, loop, loadingStates.length]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        <div className="space-y-4">
          {loadingStates.map((state, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: index <= currentState ? 1 : 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {index < currentState ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : index === currentState ? (
                  <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-600" />
                )}
              </div>
              <span className={\`text-sm font-medium \${index <= currentState ? "text-white" : "text-zinc-500"}\`}>
                {state.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default MultiStepLoader;`,
      dependencies: ["framer-motion", "lucide-react"],
      usage: `import { MultiStepLoader } from "@/components/ui/multi-step-loader";
<MultiStepLoader
  loadingStates={[
    { text: "Connecting to server..." },
    { text: "Authenticating..." },
    { text: "Loading data..." },
    { text: "Almost done..." },
  ]}
  loading={true}
  duration={2000}
/>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-inputs-file-upload",
    name: "/File Upload",
    description: "Drag and drop file upload with progress animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "File", "Upload", "Drag Drop"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/file-upload",
      license: "MIT",
    },
    code: {
      filename: "file-upload.tsx",
      component: `"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, File, X } from "lucide-react";

export function FileUpload({ onChange }: { onChange?: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...fileArray]);
    onChange?.(fileArray);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragActive(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={\`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors \${
          isDragActive ? "border-[#00F0FF] bg-[#00F0FF]/5" : "border-zinc-700 hover:border-zinc-600"
        }\`}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Upload className={\`w-10 h-10 mx-auto mb-4 \${isDragActive ? "text-[#00F0FF]" : "text-zinc-500"}\`} />
        <p className="text-zinc-400 text-sm">
          <span className="text-[#00F0FF] font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-zinc-500 text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
      </motion.div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-white text-sm truncate max-w-[200px]">{file.name}</span>
                <span className="text-zinc-500 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button onClick={() => removeFile(index)} className="text-zinc-500 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
export default FileUpload;`,
      dependencies: ["framer-motion", "lucide-react"],
      usage: `import { FileUpload } from "@/components/ui/file-upload";
<FileUpload onChange={(files) => console.log(files)} />`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-compare-slider",
    name: "/Compare Slider",
    description: "Before/after image comparison slider with draggable divider",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Compare", "Slider", "Image", "Before After"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/compare",
      license: "MIT",
    },
    code: {
      filename: "compare-slider.tsx",
      component: `"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function CompareSlider({ beforeImage, afterImage, beforeLabel = "Before", afterLabel = "After" }: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div className="absolute inset-0">
        <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />
        <span className="absolute top-4 right-4 px-2 py-1 bg-black/50 text-white text-xs rounded">{afterLabel}</span>
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: \`inset(0 \${100 - sliderPosition}% 0 0)\` }}>
        <img src={beforeImage} alt={beforeLabel} className="w-full h-full object-cover" />
        <span className="absolute top-4 left-4 px-2 py-1 bg-black/50 text-white text-xs rounded">{beforeLabel}</span>
      </div>
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: \`\${sliderPosition}%\`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <span className="text-zinc-600">◀</span>
            <span className="text-zinc-600">▶</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
export default CompareSlider;`,
      dependencies: ["framer-motion"],
      usage: `import { CompareSlider } from "@/components/ui/compare-slider";
<CompareSlider beforeImage="/before.jpg" afterImage="/after.jpg" />`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-scroll-sticky-reveal",
    name: "/Sticky Scroll Reveal",
    description:
      "Content sections that reveal as you scroll with sticky positioning",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Scroll", "Sticky", "Reveal", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/sticky-scroll-reveal",
      license: "MIT",
    },
    code: {
      filename: "sticky-scroll-reveal.tsx",
      component: `"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ContentItem {
  title: string;
  description: string;
  content?: React.ReactNode;
}

export function StickyScrollReveal({ content }: { content: ContentItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="relative">
      {content.map((item, index) => {
        const targetScale = 1 - (content.length - 1 - index) * 0.05;
        const start = index / content.length;
        const end = (index + 1) / content.length;
        const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
        const scale = useTransform(scrollYProgress, [start, end], [0.95, targetScale]);

        return (
          <div key={index} className="h-screen flex items-center justify-center sticky top-0">
            <motion.div
              style={{ opacity, scale }}
              className="w-full max-w-4xl mx-auto p-8 grid grid-cols-2 gap-8 items-center"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">{item.title}</h2>
                <p className="text-zinc-400">{item.description}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-zinc-800">
                {item.content || <div className="h-48 flex items-center justify-center text-zinc-500">Content</div>}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
export default StickyScrollReveal;`,
      dependencies: ["framer-motion"],
      usage: `import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
<StickyScrollReveal
  content={[
    { title: "Step 1", description: "First step description", content: <div>Visual</div> },
    { title: "Step 2", description: "Second step description", content: <div>Visual</div> },
  ]}
/>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-cards-comet",
    name: "/Comet Card",
    description: "Card with animated comet trail effect on border",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Comet", "Border", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/comet-card",
      license: "MIT",
    },
    code: {
      filename: "comet-card.tsx",
      component: `"use client";
import React from "react";

export function CometCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={\`relative group \${className}\`}>
      <div className="absolute -inset-px bg-gradient-to-r from-[#00F0FF] via-purple-500 to-[#00F0FF] rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:duration-200 animate-tilt" />
      <div className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-800 group-hover:border-transparent transition-colors">
        {children}
      </div>
      <style jsx>{\`
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }
        .animate-tilt { animation: tilt 10s infinite linear; }
      \`}</style>
    </div>
  );
}
export default CometCard;`,
      dependencies: [],
      usage: `import { CometCard } from "@/components/ui/comet-card";
<CometCard><h3>Card Title</h3><p>Card content</p></CometCard>`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS"],
  },
  {
    id: "design-react-cards-glare",
    name: "/Glare Card",
    description: "Card with mouse-tracking glare and reflection effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Card", "Glare", "Reflection", "Mouse"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/glare-card",
      license: "MIT",
    },
    code: {
      filename: "glare-card.tsx",
      component: `"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export function GlareCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y });
    setRotate({
      x: (y - 50) / 10,
      y: -(x - 50) / 10,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ perspective: "1000px" }}
      className={\`relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 \${className}\`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
        style={{
          background: \`radial-gradient(circle at \${glarePos.x}% \${glarePos.y}%, rgba(255,255,255,0.3), transparent 50%)\`,
        }}
      />
      {children}
    </motion.div>
  );
}
export default GlareCard;`,
      dependencies: ["framer-motion"],
      usage: `import { GlareCard } from "@/components/ui/glare-card";
<GlareCard className="p-6"><h3>Glare Card</h3></GlareCard>`,
    },
    preview: { height: "250px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-navigation-floating-navbar",
    name: "/Floating Navbar",
    description: "Animated floating navigation bar with blur effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Navigation", "Navbar", "Floating", "Blur"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/floating-navbar",
      license: "MIT",
    },
    code: {
      filename: "floating-navbar.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

export function FloatingNavbar({ navItems, className = "" }: { navItems: NavItem[]; className?: string }) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const previous = scrollYProgress.getPrevious();
      const direction = current - (previous || 0);
      if (current < 0.05) setVisible(true);
      else setVisible(direction < 0);
    }
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.2 }}
          className={\`fixed top-4 inset-x-0 max-w-fit mx-auto z-50 \${className}\`}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
            <button className="px-4 py-2 bg-[#00F0FF] text-black text-sm font-medium rounded-full hover:bg-[#00F0FF]/90 transition-colors">
              Sign In
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
export default FloatingNavbar;`,
      dependencies: ["framer-motion"],
      usage: `import { FloatingNavbar } from "@/components/ui/floating-navbar";
<FloatingNavbar navItems={[{ name: "Home", link: "/" }, { name: "About", link: "/about" }]} />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-backgrounds-shooting-stars",
    name: "/Shooting Stars",
    description: "Animated shooting stars background effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Stars", "Shooting", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/shooting-stars",
      license: "MIT",
    },
    code: {
      filename: "shooting-stars.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function ShootingStars({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{
            left: \`\${Math.random() * 100}%\`,
            top: \`\${Math.random() * 50}%\`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, -100 - Math.random() * 100],
            y: [0, 100 + Math.random() * 100],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        >
          <div className="absolute w-20 h-px bg-gradient-to-r from-white to-transparent -translate-x-full rotate-[225deg] origin-right" />
        </motion.div>
      ))}
    </div>
  );
}

export function ShootingStarsBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      <ShootingStars />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
export default ShootingStarsBackground;`,
      dependencies: ["framer-motion"],
      usage: `import { ShootingStarsBackground } from "@/components/ui/shooting-stars";
<ShootingStarsBackground><YourContent /></ShootingStarsBackground>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-backgrounds-glowing-stars",
    name: "/Glowing Stars",
    description: "Twinkling star field background with glow effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Background", "Stars", "Glow", "Twinkle"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/glowing-stars",
      license: "MIT",
    },
    code: {
      filename: "glowing-stars.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function GlowingStars({ count = 50 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        const delay = Math.random() * 4;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: size,
              height: size,
              left: \`\${Math.random() * 100}%\`,
              top: \`\${Math.random() * 100}%\`,
              boxShadow: \`0 0 \${size * 2}px \${size}px rgba(255, 255, 255, 0.5)\`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay,
            }}
          />
        );
      })}
    </div>
  );
}

export function GlowingStarsBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      <GlowingStars />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
export default GlowingStarsBackground;`,
      dependencies: ["framer-motion"],
      usage: `import { GlowingStarsBackground } from "@/components/ui/glowing-stars";
<GlowingStarsBackground><YourContent /></GlowingStarsBackground>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-backgrounds-vortex",
    name: "/Vortex Background",
    description: "Swirling vortex animation with particle effects",
    category: "Design",
    subcategory: "React UI",
    tags: [
      "React",
      "Tailwind",
      "Background",
      "Vortex",
      "Particles",
      "Animation",
    ],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/vortex",
      license: "MIT",
    },
    code: {
      filename: "vortex-background.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function VortexBackground({ children }: { children?: React.ReactNode }) {
  const particles = [...Array(30)].map((_, i) => ({
    id: i,
    angle: (i / 30) * 360,
    radius: 100 + Math.random() * 150,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#00F0FF]"
            style={{ width: p.size, height: p.size }}
            animate={{
              rotate: 360,
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              rotate: { duration: p.duration, repeat: Infinity, ease: "linear" },
              scale: { duration: p.duration / 2, repeat: Infinity },
              opacity: { duration: p.duration / 2, repeat: Infinity },
              delay: p.delay,
            }}
          >
            <motion.div
              animate={{
                x: [0, Math.cos(p.angle * Math.PI / 180) * p.radius],
                y: [0, Math.sin(p.angle * Math.PI / 180) * p.radius],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="w-full h-full rounded-full bg-[#00F0FF] shadow-[0_0_10px_2px_rgba(0,240,255,0.5)]"
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-zinc-950/50 to-zinc-950" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
export default VortexBackground;`,
      dependencies: ["framer-motion"],
      usage: `import { VortexBackground } from "@/components/ui/vortex-background";
<VortexBackground><YourContent /></VortexBackground>`,
    },
    preview: { height: "400px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-effects-following-pointer",
    name: "/Following Pointer",
    description: "Cursor that follows mouse with smooth spring animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Cursor", "Mouse", "Pointer", "Animation"],
    credit: {
      library: "Aceternity UI",
      url: "https://ui.aceternity.com/components/following-pointer",
      license: "MIT",
    },
    code: {
      filename: "following-pointer.tsx",
      component: `"use client";
import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function FollowingPointer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className={\`relative \${className}\`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      {isHovering && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{ left: cursorX, top: cursorY, translateX: "-50%", translateY: "-50%" }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-8 h-8 rounded-full bg-[#00F0FF]/30 border border-[#00F0FF] backdrop-blur-sm"
          />
        </motion.div>
      )}
    </div>
  );
}
export default FollowingPointer;`,
      dependencies: ["framer-motion"],
      usage: `import { FollowingPointer } from "@/components/ui/following-pointer";
<FollowingPointer><YourContent /></FollowingPointer>`,
    },
    preview: { height: "300px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  // ============================================================================
  // UIVERSE.IO COMPONENTS
  // ============================================================================
  {
    id: "design-react-buttons-glitch",
    name: "/Glitch Button",
    description: "Button with cyberpunk glitch text effect on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Glitch", "Cyberpunk", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/buttons",
      license: "MIT",
    },
    code: {
      filename: "glitch-button.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function GlitchButton({ children = "GLITCH", onClick }: { children?: React.ReactNode; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-8 py-3 bg-zinc-900 text-[#00F0FF] font-mono font-bold text-lg border border-[#00F0FF]/50 rounded-lg overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      {isHovered && (
        <>
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-red-500 font-mono font-bold text-lg"
            animate={{ x: [-2, 2, -2], opacity: [0.8, 0.5, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            style={{ clipPath: "inset(0 0 50% 0)" }}
          >
            {children}
          </motion.span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-blue-500 font-mono font-bold text-lg"
            animate={{ x: [2, -2, 2], opacity: [0.8, 0.5, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            style={{ clipPath: "inset(50% 0 0 0)" }}
          >
            {children}
          </motion.span>
        </>
      )}
      <motion.div
        className="absolute inset-0 bg-[#00F0FF]/10"
        animate={isHovered ? { opacity: [0.1, 0.2, 0.1] } : { opacity: 0 }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />
    </motion.button>
  );
}
export default GlitchButton;`,
      dependencies: ["framer-motion"],
      usage: `import { GlitchButton } from "@/components/ui/glitch-button";
<GlitchButton onClick={() => {}}>HACK</GlitchButton>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-hologram",
    name: "/Hologram Button",
    description: "Futuristic button with holographic glow and flicker effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Hologram", "Futuristic", "Glow"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/buttons",
      license: "MIT",
    },
    code: {
      filename: "hologram-button.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function HologramButton({ children = "HOLOGRAM", onClick }: { children?: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-8 py-3 bg-transparent font-bold text-lg rounded-lg overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{ boxShadow: "0 0 20px 2px rgba(0, 240, 255, 0.5), inset 0 0 20px 2px rgba(0, 240, 255, 0.1)" }}
        animate={{ boxShadow: ["0 0 20px 2px rgba(0, 240, 255, 0.5)", "0 0 30px 4px rgba(0, 240, 255, 0.8)", "0 0 20px 2px rgba(0, 240, 255, 0.5)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-[#00F0FF] rounded-lg"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      <motion.span
        className="relative z-10 text-[#00F0FF]"
        animate={{ textShadow: ["0 0 10px #00F0FF", "0 0 20px #00F0FF, 0 0 40px #00F0FF", "0 0 10px #00F0FF"] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {children}
      </motion.span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent -skew-x-12"
        animate={{ x: ["-200%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.button>
  );
}
export default HologramButton;`,
      dependencies: ["framer-motion"],
      usage: `import { HologramButton } from "@/components/ui/hologram-button";
<HologramButton>ACTIVATE</HologramButton>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-neon-pulse",
    name: "/Neon Pulse Button",
    description: "Button with expanding neon pulse rings on hover",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Neon", "Pulse", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/buttons",
      license: "MIT",
    },
    code: {
      filename: "neon-pulse-button.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function NeonPulseButton({ children = "PULSE", onClick, color = "#00F0FF" }: { children?: React.ReactNode; onClick?: () => void; color?: string }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-8 py-3 font-bold text-lg rounded-full overflow-visible group"
      style={{ backgroundColor: "transparent", border: \`2px solid \${color}\`, color }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: \`2px solid \${color}\` }}
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.75, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: \`0 0 20px \${color}40, inset 0 0 20px \${color}20\` }}
        animate={{ boxShadow: [\`0 0 20px \${color}40\`, \`0 0 40px \${color}60\`, \`0 0 20px \${color}40\`] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}
export default NeonPulseButton;`,
      dependencies: ["framer-motion"],
      usage: `import { NeonPulseButton } from "@/components/ui/neon-pulse-button";
<NeonPulseButton color="#ff00ff">SEND</NeonPulseButton>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-send",
    name: "/Send Button",
    description: "Button with animated paper plane that flies on click",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Send", "Animation", "Icon"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/buttons",
      license: "MIT",
    },
    code: {
      filename: "send-button.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SendButton({ onSend }: { onSend?: () => void }) {
  const [isSending, setIsSending] = useState(false);

  const handleClick = () => {
    if (isSending) return;
    setIsSending(true);
    onSend?.();
    setTimeout(() => setIsSending(false), 1500);
  };

  return (
    <motion.button
      onClick={handleClick}
      className="relative px-6 py-3 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-white font-bold rounded-lg overflow-hidden flex items-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {!isSending ? (
          <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Send
          </motion.span>
        ) : (
          <motion.span key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Sent!
          </motion.span>
        )}
      </AnimatePresence>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        animate={isSending ? { x: [0, 100], y: [0, -50], rotate: [0, 45], opacity: [1, 0] } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </motion.svg>
    </motion.button>
  );
}
export default SendButton;`,
      dependencies: ["framer-motion"],
      usage: `import { SendButton } from "@/components/ui/send-button";
<SendButton onSend={() => console.log("Message sent!")} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-cyberpunk",
    name: "/Cyberpunk Button",
    description:
      "Futuristic cyberpunk-style button with cut corners and scan line",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "Cyberpunk", "Futuristic", "Sci-Fi"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/buttons",
      license: "MIT",
    },
    code: {
      filename: "cyberpunk-button.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function CyberpunkButton({ children = "EXECUTE", onClick }: { children?: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-8 py-3 bg-zinc-900 text-[#00F0FF] font-mono font-bold uppercase tracking-wider overflow-hidden group"
      style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 border border-[#00F0FF]/50" style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-[#00F0FF]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-[#00F0FF]" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/20 via-transparent to-transparent h-1"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-[#00F0FF]/10 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}
export default CyberpunkButton;`,
      dependencies: ["framer-motion"],
      usage: `import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
<CyberpunkButton>INITIALIZE</CyberpunkButton>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-buttons-3d-push",
    name: "/3D Push Button",
    description: "Button with 3D depth effect that pushes down on click",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Button", "3D", "Push", "Depth"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/buttons",
      license: "MIT",
    },
    code: {
      filename: "3d-push-button.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function PushButton3D({ children = "PUSH ME", onClick, color = "#7000FF" }: { children?: React.ReactNode; onClick?: () => void; color?: string }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-8 py-3 font-bold text-white rounded-lg"
      style={{ backgroundColor: color }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 4 }}
    >
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{ backgroundColor: color, filter: "brightness(0.6)", transform: "translateY(6px)", zIndex: -1 }}
      />
      <motion.div
        className="absolute inset-0 rounded-lg opacity-30"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
export default PushButton3D;`,
      dependencies: ["framer-motion"],
      usage: `import { PushButton3D } from "@/components/ui/3d-push-button";
<PushButton3D color="#00F0FF">CLICK</PushButton3D>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-orbit",
    name: "/Orbit Loader",
    description: "Loading spinner with dots orbiting around a center point",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Spinner", "Orbit", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "orbit-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function OrbitLoader({ size = 60, color = "#00F0FF" }: { size?: number; color?: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * 0.2,
            height: size * 0.2,
            backgroundColor: color,
            top: "50%",
            left: "50%",
            marginTop: -size * 0.1,
            marginLeft: -size * 0.1,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.15,
          }}
          style={{
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: color,
            transformOrigin: \`\${size * 0.5}px center\`,
            position: "absolute",
            top: "50%",
            left: 0,
            marginTop: -size * 0.075,
            opacity: 1 - i * 0.25,
          }}
        />
      ))}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          backgroundColor: \`\${color}30\`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
export default OrbitLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { OrbitLoader } from "@/components/ui/orbit-loader";
<OrbitLoader size={80} color="#ff00ff" />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-dna",
    name: "/DNA Helix Loader",
    description: "Double helix DNA strand loading animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "DNA", "Helix", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "dna-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function DNALoader({ size = 60 }: { size?: number }) {
  const dots = 8;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {[...Array(dots)].map((_, i) => (
        <React.Fragment key={i}>
          <motion.div
            className="absolute rounded-full bg-[#00F0FF]"
            style={{ width: size * 0.12, height: size * 0.12 }}
            animate={{
              x: [size * 0.3, -size * 0.3, size * 0.3],
              y: Math.sin((i / dots) * Math.PI * 2) * size * 0.3,
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: (i / dots) * 1.5, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full bg-[#7000FF]"
            style={{ width: size * 0.12, height: size * 0.12 }}
            animate={{
              x: [-size * 0.3, size * 0.3, -size * 0.3],
              y: Math.sin((i / dots) * Math.PI * 2) * size * 0.3,
              scale: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: (i / dots) * 1.5, ease: "easeInOut" }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
export default DNALoader;`,
      dependencies: ["framer-motion"],
      usage: `import { DNALoader } from "@/components/ui/dna-loader";
<DNALoader size={80} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-cube",
    name: "/3D Cube Loader",
    description: "Rotating 3D cube loading animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "3D", "Cube", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "cube-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function CubeLoader({ size = 50 }: { size?: number }) {
  return (
    <div style={{ perspective: size * 4 }}>
      <motion.div
        className="relative"
        style={{ width: size, height: size, transformStyle: "preserve-3d" }}
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {["front", "back", "right", "left", "top", "bottom"].map((face, i) => {
          const transforms: Record<string, string> = {
            front: \`translateZ(\${size / 2}px)\`,
            back: \`translateZ(\${-size / 2}px) rotateY(180deg)\`,
            right: \`translateX(\${size / 2}px) rotateY(90deg)\`,
            left: \`translateX(\${-size / 2}px) rotateY(-90deg)\`,
            top: \`translateY(\${-size / 2}px) rotateX(90deg)\`,
            bottom: \`translateY(\${size / 2}px) rotateX(-90deg)\`,
          };
          return (
            <div
              key={face}
              className="absolute border-2 border-[#00F0FF]"
              style={{
                width: size,
                height: size,
                transform: transforms[face],
                backgroundColor: \`rgba(0, 240, 255, \${0.1 + i * 0.05})\`,
                backfaceVisibility: "visible",
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
export default CubeLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { CubeLoader } from "@/components/ui/cube-loader";
<CubeLoader size={60} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-infinity",
    name: "/Infinity Loader",
    description: "Figure-8 infinity symbol loading animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Infinity", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "infinity-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function InfinityLoader({ size = 80, color = "#00F0FF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 100 50">
      <motion.path
        d="M 25 25 C 25 10, 45 10, 50 25 C 55 40, 75 40, 75 25 C 75 10, 55 10, 50 25 C 45 40, 25 40, 25 25"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: 1, pathOffset: [0, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle
        r="5"
        fill={color}
        animate={{
          cx: [25, 50, 75, 50, 25],
          cy: [25, 25, 25, 25, 25],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
export default InfinityLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { InfinityLoader } from "@/components/ui/infinity-loader";
<InfinityLoader size={100} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-ring",
    name: "/Ring Loader",
    description: "Animated ring with gradient rotation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Ring", "Spinner", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "ring-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function RingLoader({ size = 50, strokeWidth = 4 }: { size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <motion.svg
      width={size}
      height={size}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#7000FF" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: [circumference, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.svg>
  );
}
export default RingLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { RingLoader } from "@/components/ui/ring-loader";
<RingLoader size={60} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-loaders-typing",
    name: "/Typing Loader",
    description: "Three dots typing indicator animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Loader", "Typing", "Dots", "Chat"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "typing-loader.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function TypingLoader({ color = "#00F0FF", size = 12 }: { color?: string; size?: number }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-zinc-800 rounded-full">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
          animate={{ y: [0, -size * 0.8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
export default TypingLoader;`,
      dependencies: ["framer-motion"],
      usage: `import { TypingLoader } from "@/components/ui/typing-loader";
<TypingLoader color="#ff00ff" size={10} />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-toggles-ios",
    name: "/iOS Toggle",
    description: "Apple iOS-style toggle switch with smooth animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Toggle", "Switch", "iOS", "Apple"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/switches",
      license: "MIT",
    },
    code: {
      filename: "ios-toggle.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function IOSToggle({ defaultChecked = false, onChange }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void }) {
  const [isOn, setIsOn] = useState(defaultChecked);

  const toggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  return (
    <motion.button
      onClick={toggle}
      className="relative w-14 h-8 rounded-full p-1 transition-colors duration-300"
      animate={{ backgroundColor: isOn ? "#34C759" : "#3a3a3c" }}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-lg"
        animate={{ x: isOn ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
export default IOSToggle;`,
      dependencies: ["framer-motion"],
      usage: `import { IOSToggle } from "@/components/ui/ios-toggle";
<IOSToggle onChange={(checked) => console.log(checked)} />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-toggles-neumorphism",
    name: "/Neumorphism Toggle",
    description: "Soft UI neumorphic toggle switch with subtle shadows",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Toggle", "Switch", "Neumorphism", "Soft"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/switches",
      license: "MIT",
    },
    code: {
      filename: "neumorphism-toggle.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function NeumorphismToggle({ defaultChecked = false, onChange }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void }) {
  const [isOn, setIsOn] = useState(defaultChecked);

  const toggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-16 h-9 rounded-full bg-zinc-800 p-1"
      style={{
        boxShadow: "inset 4px 4px 8px #1a1a1a, inset -4px -4px 8px #2a2a2a",
      }}
    >
      <motion.div
        className="w-7 h-7 rounded-full"
        animate={{
          x: isOn ? 28 : 0,
          backgroundColor: isOn ? "#00F0FF" : "#4a4a4a",
          boxShadow: isOn
            ? "4px 4px 8px #1a1a1a, -4px -4px 8px #2a2a2a, 0 0 20px rgba(0, 240, 255, 0.5)"
            : "4px 4px 8px #1a1a1a, -4px -4px 8px #2a2a2a",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </button>
  );
}
export default NeumorphismToggle;`,
      dependencies: ["framer-motion"],
      usage: `import { NeumorphismToggle } from "@/components/ui/neumorphism-toggle";
<NeumorphismToggle onChange={(on) => console.log(on)} />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-toggles-3d",
    name: "/3D Toggle Switch",
    description: "Toggle switch with 3D depth and lighting effect",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Toggle", "Switch", "3D", "Depth"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/switches",
      license: "MIT",
    },
    code: {
      filename: "3d-toggle.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function Toggle3D({ defaultChecked = false, onChange }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void }) {
  const [isOn, setIsOn] = useState(defaultChecked);

  const toggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-16 h-9 rounded-full overflow-hidden"
      style={{
        background: isOn
          ? "linear-gradient(145deg, #00d4e0, #00F0FF)"
          : "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
        boxShadow: "4px 4px 12px #0a0a0a, -2px -2px 8px #2a2a2a",
      }}
    >
      <motion.div
        className="absolute w-7 h-7 rounded-full top-1"
        animate={{ x: isOn ? 32 : 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          background: "linear-gradient(145deg, #ffffff, #e0e0e0)",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(0,0,0,0.1), inset 1px 1px 3px rgba(255,255,255,0.8)",
        }}
      />
    </button>
  );
}
export default Toggle3D;`,
      dependencies: ["framer-motion"],
      usage: `import { Toggle3D } from "@/components/ui/3d-toggle";
<Toggle3D onChange={(on) => console.log(on)} />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-checkboxes-animated",
    name: "/Animated Checkbox",
    description: "Checkbox with SVG checkmark draw animation",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Checkbox", "Animation", "SVG", "Draw"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/checkboxes",
      license: "MIT",
    },
    code: {
      filename: "animated-checkbox.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function AnimatedCheckbox({ defaultChecked = false, onChange, label }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void; label?: string }) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const toggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        onClick={toggle}
        className="relative w-6 h-6 rounded-md border-2 transition-colors"
        style={{
          borderColor: isChecked ? "#00F0FF" : "#4a4a4a",
          backgroundColor: isChecked ? "#00F0FF" : "transparent",
        }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full p-1"
          initial={false}
        >
          <motion.path
            d="M4 12l5 5L20 6"
            fill="none"
            stroke={isChecked ? "#000" : "transparent"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isChecked ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.svg>
      </button>
      {label && <span className="text-white group-hover:text-[#00F0FF] transition-colors">{label}</span>}
    </label>
  );
}
export default AnimatedCheckbox;`,
      dependencies: ["framer-motion"],
      usage: `import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";
<AnimatedCheckbox label="Accept terms" onChange={(c) => console.log(c)} />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-checkboxes-bounce",
    name: "/Bounce Checkbox",
    description: "Checkbox with bouncy spring animation on check",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Checkbox", "Animation", "Bounce", "Spring"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/checkboxes",
      license: "MIT",
    },
    code: {
      filename: "bounce-checkbox.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BounceCheckbox({ defaultChecked = false, onChange, label }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void; label?: string }) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const toggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <motion.button
        onClick={toggle}
        className="relative w-6 h-6 rounded-lg border-2 border-[#7000FF] bg-transparent overflow-hidden"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence>
          {isChecked && (
            <motion.div
              className="absolute inset-0 bg-[#7000FF] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <motion.span
                className="text-white text-sm font-bold"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.1 }}
              >
                ✓
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      {label && <span className="text-white">{label}</span>}
    </label>
  );
}
export default BounceCheckbox;`,
      dependencies: ["framer-motion"],
      usage: `import { BounceCheckbox } from "@/components/ui/bounce-checkbox";
<BounceCheckbox label="Remember me" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-inputs-glow",
    name: "/Glow Input",
    description: "Text input with animated glow border on focus",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Glow", "Focus", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/inputs",
      license: "MIT",
    },
    code: {
      filename: "glow-input.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function GlowInput({ placeholder = "Enter text...", type = "text", value, onChange }: { placeholder?: string; type?: string; value?: string; onChange?: (value: string) => void }) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#00F0FF] opacity-0 blur"
        animate={{ opacity: isFocused ? 0.7 : 0 }}
        transition={{ duration: 0.3 }}
      />
      <input
        type={type}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange?.(e.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="relative w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00F0FF] transition-colors"
      />
    </div>
  );
}
export default GlowInput;`,
      dependencies: ["framer-motion"],
      usage: `import { GlowInput } from "@/components/ui/glow-input";
<GlowInput placeholder="Email address" type="email" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-inputs-floating-label",
    name: "/Floating Label Input",
    description: "Input with label that floats up on focus",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Input", "Label", "Float", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/inputs",
      license: "MIT",
    },
    code: {
      filename: "floating-label-input.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export function FloatingLabelInput({ label = "Email", type = "text", value, onChange }: { label?: string; type?: string; value?: string; onChange?: (value: string) => void }) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const isFloating = isFocused || inputValue.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange?.(e.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-4 py-3 pt-6 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#00F0FF] transition-colors peer"
      />
      <motion.label
        className="absolute left-4 pointer-events-none origin-left"
        animate={{
          top: isFloating ? 6 : 14,
          scale: isFloating ? 0.75 : 1,
          color: isFocused ? "#00F0FF" : "#71717a",
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00F0FF] to-[#7000FF]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
export default FloatingLabelInput;`,
      dependencies: ["framer-motion"],
      usage: `import { FloatingLabelInput } from "@/components/ui/floating-label-input";
<FloatingLabelInput label="Password" type="password" />`,
    },
    preview: { height: "150px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-progress-circle",
    name: "/Progress Circle",
    description: "Circular progress indicator with percentage",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Progress", "Circle", "SVG", "Animation"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/loaders",
      license: "MIT",
    },
    code: {
      filename: "progress-circle.tsx",
      component: `"use client";
import React from "react";
import { motion } from "framer-motion";

export function ProgressCircle({ progress = 75, size = 100, strokeWidth = 8, showText = true }: { progress?: number; size?: number; strokeWidth?: number; showText?: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <motion.span
          className="absolute text-white font-bold"
          style={{ fontSize: size * 0.25 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress}%
        </motion.span>
      )}
    </div>
  );
}
export default ProgressCircle;`,
      dependencies: ["framer-motion"],
      usage: `import { ProgressCircle } from "@/components/ui/progress-circle";
<ProgressCircle progress={85} size={120} />`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
  {
    id: "design-react-tooltips-animated",
    name: "/Animated Tooltip",
    description: "Tooltip with spring animation and arrow pointer",
    category: "Design",
    subcategory: "React UI",
    tags: ["React", "Tailwind", "Tooltip", "Animation", "Popover"],
    credit: {
      library: "Uiverse.io",
      url: "https://uiverse.io/tooltips",
      license: "MIT",
    },
    code: {
      filename: "animated-tooltip.tsx",
      component: `"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AnimatedTooltip({ children, content, position = "top" }: { children: React.ReactNode; content: string; position?: "top" | "bottom" | "left" | "right" }) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "bottom-full left-1/2 -translate-x-1/2 mb-2" },
    bottom: { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "top-full left-1/2 -translate-x-1/2 mt-2" },
    left: { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, className: "right-full top-1/2 -translate-y-1/2 mr-2" },
    right: { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, className: "left-full top-1/2 -translate-y-1/2 ml-2" },
  };

  const config = positions[position];

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={\`absolute \${config.className} px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm whitespace-nowrap z-50\`}
            initial={config.initial}
            animate={config.animate}
            exit={config.initial}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {content}
            <div
              className="absolute w-2 h-2 bg-zinc-800 border-zinc-700 transform rotate-45"
              style={{
                ...(position === "top" && { bottom: -5, left: "50%", marginLeft: -4, borderBottom: "1px solid", borderRight: "1px solid" }),
                ...(position === "bottom" && { top: -5, left: "50%", marginLeft: -4, borderTop: "1px solid", borderLeft: "1px solid" }),
                ...(position === "left" && { right: -5, top: "50%", marginTop: -4, borderTop: "1px solid", borderRight: "1px solid" }),
                ...(position === "right" && { left: -5, top: "50%", marginTop: -4, borderBottom: "1px solid", borderLeft: "1px solid" }),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AnimatedTooltip;`,
      dependencies: ["framer-motion"],
      usage: `import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
<AnimatedTooltip content="Hello!" position="top">
  <button>Hover me</button>
</AnimatedTooltip>`,
    },
    preview: { height: "200px", darkMode: true },
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
  },
];

export const DESIGN_ASSETS: RegistryItem[] = [
  {
    id: "design-glass-card",
    kind: "component",
    name: "Glass Card",
    slug: "glass-card",
    description:
      "Premium frosted glass effect card with inner glow and hover state.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Card", "Glassmorphism"],
    install: "npx @clawdbot/cli add component/glass-card",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 80,
      status: "VERIFIED",
    },
  },
  {
    id: "design-aurora-bg",
    kind: "component",
    name: "Aurora Background",
    slug: "aurora-background",
    description: "Animated ambient background with flowing gradient mesh.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Background", "Animation"],
    install: "npx @clawdbot/cli add component/aurora-background",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 80,
      status: "VERIFIED",
    },
  },
  {
    id: "design-neon-button",
    kind: "component",
    name: "Neon Button",
    slug: "neon-button",
    description:
      "High-visibility action button with neon glow and pulse effect.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Button", "Neon"],
    install: "npx @clawdbot/cli add component/neon-button",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 80,
      status: "VERIFIED",
    },
  },
  {
    id: "design-animated-grid",
    kind: "component",
    name: "Animated Grid",
    slug: "animated-grid",
    description:
      "Cyberpunk-style perspective grid background with infinite scrolling animation.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Background", "Animation", "3D"],
    install: "npx @clawdbot/cli add component/animated-grid",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gemini-3.0-pro",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: {
      lastAudited: "2025-11-27",
      qualityScore: 80,
      status: "VERIFIED",
    },
  },

  // ============================================================================
  // KOKONUT UI - 100+ Beautiful Modern Components
  // ============================================================================
  {
    id: "kokonut-liquid-glass-card",
    kind: "component",
    name: "Liquid Glass Card",
    slug: "liquid-glass-card",
    description:
      "Glassmorphism card with liquid animation effects and frosted backdrop blur.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Card", "Glass", "Kokonut UI"],
    install:
      "npx shadcn@latest add https://kokonutui.com/r/liquid-glass-card.json",
    docsUrl: "https://kokonutui.com/docs/components/liquid-glass-card",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "kokonut-gradient-button",
    kind: "component",
    name: "Gradient Button",
    slug: "gradient-button-kokonut",
    description:
      "Animated gradient button with hover effects and smooth color transitions.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Button", "Gradient", "Kokonut UI"],
    install:
      "npx shadcn@latest add https://kokonutui.com/r/gradient-button.json",
    docsUrl: "https://kokonutui.com/docs/components/gradient-button",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "kokonut-morphing-card",
    kind: "component",
    name: "Morphing Card",
    slug: "morphing-card",
    description:
      "Card component that morphs and transforms on hover with smooth animations.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Card", "Animation", "Kokonut UI"],
    install: "npx shadcn@latest add https://kokonutui.com/r/morphing-card.json",
    docsUrl: "https://kokonutui.com/docs/components/morphing-card",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "kokonut-aurora-text",
    kind: "component",
    name: "Aurora Text",
    slug: "aurora-text",
    description: "Text with animated aurora/northern lights gradient effect.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Text",
      "Animation",
      "Gradient",
      "Kokonut UI",
    ],
    install: "npx shadcn@latest add https://kokonutui.com/r/aurora-text.json",
    docsUrl: "https://kokonutui.com/docs/components/aurora-text",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "kokonut-spotlight-card",
    kind: "component",
    name: "Spotlight Card",
    slug: "spotlight-card-kokonut",
    description:
      "Card with dynamic spotlight effect that follows mouse cursor.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Card",
      "Spotlight",
      "Interactive",
      "Kokonut UI",
    ],
    install:
      "npx shadcn@latest add https://kokonutui.com/r/spotlight-card.json",
    docsUrl: "https://kokonutui.com/docs/components/spotlight-card",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },

  // ============================================================================
  // CULT UI - AI Integration Blocks & Components
  // ============================================================================
  {
    id: "cult-toolbar-expandable",
    kind: "component",
    name: "Expandable Toolbar",
    slug: "expandable-toolbar",
    description:
      "Step-based expandable toolbar with smooth animations for multi-action interfaces.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Toolbar", "Animation", "Cult UI"],
    install:
      "npx shadcn@latest add https://cult-ui.com/r/toolbar-expandable.json",
    docsUrl: "https://cult-ui.com/docs/components/toolbar-expandable",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },
  {
    id: "cult-ai-chat-block",
    kind: "component",
    name: "AI Chat Block",
    slug: "ai-chat-block",
    description:
      "Production-ready AI chat interface with streaming, typing indicators, and message history.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "AI", "Chat", "Streaming", "Cult UI"],
    install: "npx shadcn@latest add https://cult-ui.com/r/ai-chat-block.json",
    docsUrl: "https://cult-ui.com/docs/blocks/ai-chat",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 92, status: "VERIFIED" },
  },
  {
    id: "cult-ai-image-gen",
    kind: "component",
    name: "AI Image Generator Block",
    slug: "ai-image-generator",
    description:
      "Complete AI image generation UI with prompt input, gallery, and generation controls.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "AI",
      "Image",
      "Generator",
      "DALL-E",
      "Cult UI",
    ],
    install: "npx shadcn@latest add https://cult-ui.com/r/ai-image-gen.json",
    docsUrl: "https://cult-ui.com/docs/blocks/ai-image-gen",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "cult-multi-step-loader",
    kind: "component",
    name: "Multi-Step Loader",
    slug: "multi-step-loader-cult",
    description:
      "Visual progress indicator for multi-step AI operations with status updates.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Loader", "Progress", "Steps", "Cult UI"],
    install:
      "npx shadcn@latest add https://cult-ui.com/r/multi-step-loader.json",
    docsUrl: "https://cult-ui.com/docs/components/multi-step-loader",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },

  // ============================================================================
  // MOTION PRIMITIVES - Text & Micro Animations
  // ============================================================================
  {
    id: "motion-text-scramble",
    kind: "component",
    name: "Text Scramble",
    slug: "text-scramble",
    description:
      "Hacker-style text scramble animation that reveals text character by character.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Text",
      "Animation",
      "Scramble",
      "Motion Primitives",
    ],
    install:
      "npx shadcn@latest add https://motion-primitives.com/r/text-scramble.json",
    docsUrl: "https://motion-primitives.com/docs/text-scramble",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 92, status: "VERIFIED" },
  },
  {
    id: "motion-text-loop",
    kind: "component",
    name: "Text Loop",
    slug: "text-loop",
    description:
      "Infinite text rotation animation, perfect for hero sections with changing words.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Text",
      "Animation",
      "Loop",
      "Motion Primitives",
    ],
    install:
      "npx shadcn@latest add https://motion-primitives.com/r/text-loop.json",
    docsUrl: "https://motion-primitives.com/docs/text-loop",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 92, status: "VERIFIED" },
  },
  {
    id: "motion-text-shimmer",
    kind: "component",
    name: "Text Shimmer",
    slug: "text-shimmer-motion",
    description:
      "Shimmering gradient effect that animates across text like a light reflection.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Text",
      "Animation",
      "Shimmer",
      "Motion Primitives",
    ],
    install:
      "npx shadcn@latest add https://motion-primitives.com/r/text-shimmer.json",
    docsUrl: "https://motion-primitives.com/docs/text-shimmer",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 92, status: "VERIFIED" },
  },
  {
    id: "motion-morphing-dialog",
    kind: "component",
    name: "Morphing Dialog",
    slug: "morphing-dialog",
    description:
      "Dialog that morphs from trigger element with smooth shared element transitions.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Dialog",
      "Modal",
      "Animation",
      "Morph",
      "Motion Primitives",
    ],
    install:
      "npx shadcn@latest add https://motion-primitives.com/r/morphing-dialog.json",
    docsUrl: "https://motion-primitives.com/docs/morphing-dialog",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 94, status: "VERIFIED" },
  },
  {
    id: "motion-border-trail",
    kind: "component",
    name: "Border Trail",
    slug: "border-trail",
    description:
      "Animated border with glowing trail effect that moves around the element.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Border",
      "Animation",
      "Glow",
      "Motion Primitives",
    ],
    install:
      "npx shadcn@latest add https://motion-primitives.com/r/border-trail.json",
    docsUrl: "https://motion-primitives.com/docs/border-trail",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 92, status: "VERIFIED" },
  },
  {
    id: "motion-infinite-slider",
    kind: "component",
    name: "Infinite Slider",
    slug: "infinite-slider-motion",
    description:
      "Seamless infinite horizontal slider for logos, testimonials, or any content.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Slider",
      "Carousel",
      "Infinite",
      "Motion Primitives",
    ],
    install:
      "npx shadcn@latest add https://motion-primitives.com/r/infinite-slider.json",
    docsUrl: "https://motion-primitives.com/docs/infinite-slider",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },

  // ============================================================================
  // SMOOTHUI - Animated Interactive Components
  // ============================================================================
  {
    id: "smooth-dynamic-island",
    kind: "component",
    name: "Dynamic Island",
    slug: "dynamic-island",
    description:
      "Apple-inspired Dynamic Island component with expandable content and smooth animations.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Dynamic Island",
      "Apple",
      "Animation",
      "SmoothUI",
    ],
    install: "npx shadcn@latest add https://smoothui.dev/r/dynamic-island.json",
    docsUrl: "https://smoothui.dev/docs/components/dynamic-island",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 94, status: "VERIFIED" },
  },
  {
    id: "smooth-number-flow",
    kind: "component",
    name: "Number Flow",
    slug: "number-flow",
    description:
      "Animated number transitions with smooth counting effects for stats and metrics.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Number",
      "Counter",
      "Animation",
      "SmoothUI",
    ],
    install: "npx shadcn@latest add https://smoothui.dev/r/number-flow.json",
    docsUrl: "https://smoothui.dev/docs/components/number-flow",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 92, status: "VERIFIED" },
  },
  {
    id: "smooth-power-off-slide",
    kind: "component",
    name: "Power Off Slide",
    slug: "power-off-slide",
    description:
      "iOS-style slide-to-power-off interaction with haptic-like feedback animations.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Slider",
      "iOS",
      "Interactive",
      "SmoothUI",
    ],
    install:
      "npx shadcn@latest add https://smoothui.dev/r/power-off-slide.json",
    docsUrl: "https://smoothui.dev/docs/components/power-off-slide",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "smooth-card-stack",
    kind: "component",
    name: "Scrollable Card Stack",
    slug: "scrollable-card-stack",
    description:
      "Stacked card carousel with scroll-triggered animations and depth effects.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Card",
      "Stack",
      "Carousel",
      "Scroll",
      "SmoothUI",
    ],
    install: "npx shadcn@latest add https://smoothui.dev/r/card-stack.json",
    docsUrl: "https://smoothui.dev/docs/components/card-stack",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "smooth-photo-tab",
    kind: "component",
    name: "Photo Tab",
    slug: "photo-tab",
    description:
      "Image tabbed interface with smooth crossfade transitions between photos.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Tabs",
      "Image",
      "Gallery",
      "Animation",
      "SmoothUI",
    ],
    install: "npx shadcn@latest add https://smoothui.dev/r/photo-tab.json",
    docsUrl: "https://smoothui.dev/docs/components/photo-tab",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },

  // ============================================================================
  // TAILARK - Marketing Blocks & Templates
  // ============================================================================
  {
    id: "tailark-hero-gradient",
    kind: "component",
    name: "Hero Gradient Section",
    slug: "hero-gradient-tailark",
    description:
      "Full-width hero section with gradient background, CTA buttons, and responsive layout.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Hero",
      "Marketing",
      "Landing",
      "Tailark",
    ],
    install: "npx shadcn@latest add https://tailark.com/r/hero-gradient.json",
    docsUrl: "https://tailark.com/docs/blocks/hero-gradient",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },
  {
    id: "tailark-pricing-cards",
    kind: "component",
    name: "Pricing Cards",
    slug: "pricing-cards-tailark",
    description:
      "SaaS-style pricing comparison cards with feature lists and highlighted tier.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Pricing",
      "Cards",
      "SaaS",
      "Marketing",
      "Tailark",
    ],
    install: "npx shadcn@latest add https://tailark.com/r/pricing-cards.json",
    docsUrl: "https://tailark.com/docs/blocks/pricing",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 90, status: "VERIFIED" },
  },
  {
    id: "tailark-testimonials",
    kind: "component",
    name: "Testimonials Grid",
    slug: "testimonials-grid-tailark",
    description:
      "Social proof testimonials section with avatar, quotes, and responsive grid.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Testimonials",
      "Social Proof",
      "Marketing",
      "Tailark",
    ],
    install: "npx shadcn@latest add https://tailark.com/r/testimonials.json",
    docsUrl: "https://tailark.com/docs/blocks/testimonials",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },
  {
    id: "tailark-features-grid",
    kind: "component",
    name: "Features Grid",
    slug: "features-grid-tailark",
    description:
      "Icon-based features showcase section with bento-style grid layout.",
    category: "Design Assets",
    tags: [
      "React",
      "Tailwind",
      "UI",
      "Features",
      "Grid",
      "Bento",
      "Marketing",
      "Tailark",
    ],
    install: "npx shadcn@latest add https://tailark.com/r/features-grid.json",
    docsUrl: "https://tailark.com/docs/blocks/features",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },
  {
    id: "tailark-logo-cloud",
    kind: "component",
    name: "Logo Cloud",
    slug: "logo-cloud-tailark",
    description:
      "Trusted-by logo showcase section with grayscale hover effects.",
    category: "Design Assets",
    tags: ["React", "Tailwind", "UI", "Logos", "Trust", "Marketing", "Tailark"],
    install: "npx shadcn@latest add https://tailark.com/r/logo-cloud.json",
    docsUrl: "https://tailark.com/docs/blocks/logo-cloud",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 86, status: "VERIFIED" },
  },

  // ============================================================================
  // PATTERNCRAFT - Background Patterns & Gradients
  // ============================================================================
  {
    id: "pattern-radial-glow",
    kind: "component",
    name: "Radial Glow Background",
    slug: "radial-glow-bg",
    description:
      "CSS radial gradient glow effect for hero sections and feature highlights.",
    category: "Design Assets",
    tags: ["CSS", "Tailwind", "Background", "Gradient", "Glow", "PatternCraft"],
    install: "Copy CSS from https://patterncraft.fun/patterns/radial-glow",
    docsUrl: "https://patterncraft.fun/patterns/radial-glow",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 85, status: "VERIFIED" },
  },
  {
    id: "pattern-grid-dots",
    kind: "component",
    name: "Grid Dots Pattern",
    slug: "grid-dots-pattern",
    description:
      "Repeating dot grid pattern background with customizable spacing and opacity.",
    category: "Design Assets",
    tags: [
      "CSS",
      "Tailwind",
      "Background",
      "Pattern",
      "Dots",
      "Grid",
      "PatternCraft",
    ],
    install: "Copy CSS from https://patterncraft.fun/patterns/grid-dots",
    docsUrl: "https://patterncraft.fun/patterns/grid-dots",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 85, status: "VERIFIED" },
  },
  {
    id: "pattern-aurora-mesh",
    kind: "component",
    name: "Aurora Mesh Gradient",
    slug: "aurora-mesh-gradient",
    description:
      "Animated aurora-style mesh gradient background with smooth color transitions.",
    category: "Design Assets",
    tags: [
      "CSS",
      "Tailwind",
      "Background",
      "Gradient",
      "Aurora",
      "Mesh",
      "PatternCraft",
    ],
    install: "Copy CSS from https://patterncraft.fun/patterns/aurora-mesh",
    docsUrl: "https://patterncraft.fun/patterns/aurora-mesh",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 88, status: "VERIFIED" },
  },
  {
    id: "pattern-circuit-board",
    kind: "component",
    name: "Circuit Board Pattern",
    slug: "circuit-board-pattern",
    description:
      "Tech-style circuit board pattern background for developer/tech products.",
    category: "Design Assets",
    tags: [
      "CSS",
      "Tailwind",
      "Background",
      "Pattern",
      "Circuit",
      "Tech",
      "PatternCraft",
    ],
    install: "Copy CSS from https://patterncraft.fun/patterns/circuit-board",
    docsUrl: "https://patterncraft.fun/patterns/circuit-board",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 86, status: "VERIFIED" },
  },
  {
    id: "pattern-spotlight-fade",
    kind: "component",
    name: "Spotlight Fade",
    slug: "spotlight-fade-pattern",
    description:
      "Spotlight effect with gradient fade for highlighting hero content.",
    category: "Design Assets",
    tags: [
      "CSS",
      "Tailwind",
      "Background",
      "Gradient",
      "Spotlight",
      "Fade",
      "PatternCraft",
    ],
    install: "Copy CSS from https://patterncraft.fun/patterns/spotlight-fade",
    docsUrl: "https://patterncraft.fun/patterns/spotlight-fade",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 86, status: "VERIFIED" },
  },
  {
    id: "pattern-hexagon-grid",
    kind: "component",
    name: "Hexagon Grid",
    slug: "hexagon-grid-pattern",
    description:
      "Geometric hexagon/honeycomb pattern background with subtle depth.",
    category: "Design Assets",
    tags: [
      "CSS",
      "Tailwind",
      "Background",
      "Pattern",
      "Hexagon",
      "Geometric",
      "PatternCraft",
    ],
    install: "Copy CSS from https://patterncraft.fun/patterns/hexagon-grid",
    docsUrl: "https://patterncraft.fun/patterns/hexagon-grid",
    platforms: ["claude", "gemini", "openai"],
    compatibility: {
      models: [
        "opus-4.5",
        "sonnet-4.5",
        "sonnet",
        "gemini-2.0-flash",
        "gpt-4o",
      ],
      software: ["vscode", "cursor", "terminal", "windsurf"],
    },
    audit: { lastAudited: "2025-11-29", qualityScore: 86, status: "VERIFIED" },
  },
];
