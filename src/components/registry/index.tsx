"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// ACETERNITY UI - Aurora Background Preview
// Original colors: blue, indigo, violet gradients
// ============================================================================
function AuroraPreview() {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-950">
      {/* Aurora layer 1 - base blur */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #3b82f6 100%)",
          backgroundSize: "400% 400%",
          filter: "blur(80px)",
          opacity: 0.5,
        }}
      />
      {/* Aurora layer 2 - secondary glow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["100% 0%", "0% 100%", "100% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.6) 0%, transparent 70%)",
          backgroundSize: "200% 200%",
          filter: "blur(60px)",
          mixBlendMode: "screen",
        }}
      />
      {/* Aurora layer 3 - top highlight */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{
          background:
            "linear-gradient(180deg, rgba(147,197,253,0.4) 0%, transparent 100%)",
          filter: "blur(40px)",
        }}
      />
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white text-center drop-shadow-lg"
        >
          Aurora Background
        </motion.h1>
      </div>
    </div>
  );
}

// ============================================================================
// Animated Grid Preview - Cyberpunk perspective grid
// ============================================================================
function AnimatedGridPreview() {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative bg-black">
      <style>{`
        @keyframes gridScrollAnim {
          0% { transform: rotateX(60deg) translateY(-50%); }
          100% { transform: rotateX(60deg) translateY(0%); }
        }
        .animated-grid-bg {
          animation: gridScrollAnim 4s linear infinite;
        }
      `}</style>
      {/* Perspective grid */}
      <div className="absolute inset-0" style={{ perspective: "500px" }}>
        <div
          className="absolute inset-0 animated-grid-bg"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            transform: "rotateX(60deg) translateY(-50%)",
            transformOrigin: "center top",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Animated Grid</span>
      </div>
    </div>
  );
}

// ============================================================================
// Neon Buttons Preview - Multiple color variants
// ============================================================================
function NeonButtonsPreview() {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-4">
      {/* Cyan */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5),0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7),0_0_60px_rgba(6,182,212,0.4)] transition-shadow"
      >
        Cyan
      </motion.button>
      {/* Purple */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.5),0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7),0_0_60px_rgba(168,85,247,0.4)] transition-shadow"
      >
        Purple
      </motion.button>
      {/* Pink */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-pink-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.5),0_0_40px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.7),0_0_60px_rgba(236,72,153,0.4)] transition-shadow"
      >
        Pink
      </motion.button>
      {/* Green */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-green-400 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(74,222,128,0.5),0_0_40px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.7),0_0_60px_rgba(74,222,128,0.4)] transition-shadow"
      >
        Green
      </motion.button>
    </div>
  );
}

// ============================================================================
// Glass Button Preview - Frosted glass effect
// ============================================================================
function GlassButtonPreview() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center p-8 relative">
      {/* Background gradient for glass effect visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-orange-400/20 rounded-xl" />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-medium hover:bg-white/20 transition-all shadow-lg"
      >
        Glass Button
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white font-medium hover:bg-white/10 transition-all"
      >
        Pill Variant
      </motion.button>
    </div>
  );
}

// ============================================================================
// Glass Card Preview - Frosted glass card with hover spotlight
// ============================================================================
function GlassCardPreview() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl" />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        whileHover={{ y: -4 }}
        className="relative w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden"
      >
        {/* Spotlight effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 flex items-center justify-center">
            <span className="text-white text-xl">✦</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Glass Card</h3>
          <p className="text-zinc-400 text-sm">
            Hover to see the spotlight effect follow your cursor.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// ACETERNITY UI - Typewriter Effect Preview
// ============================================================================
function TypewriterPreview() {
  const words = ["Build", "Ship", "Scale", "Grow"];
  const [currentWord, setCurrentWord] = React.useState(0);
  const [displayText, setDisplayText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const word = words[currentWord];
    const timeout = setTimeout(
      () => {
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
      },
      isDeleting ? 50 : 150,
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWord]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <span className="text-zinc-400 text-xl">The best way to</span>
        <div className="text-4xl font-bold mt-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            {displayText}
          </span>
          <span className="animate-pulse text-purple-400">|</span>
        </div>
        <span className="text-zinc-400 text-xl">your product</span>
      </div>
    </div>
  );
}

// ============================================================================
// Spinner/Loader Preview - Multiple loader styles
// ============================================================================
function SpinnerPreview() {
  return (
    <div className="flex gap-10 items-center justify-center p-8">
      {/* Spinning ring - gradient */}
      <div className="relative w-12 h-12">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: "#8b5cf6",
            borderRightColor: "#ec4899",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Pulsing ring */}
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="absolute inset-2 rounded-full bg-purple-500" />
      </div>
    </div>
  );
}

// ============================================================================
// ACETERNITY UI - Floating Dock Preview
// ============================================================================
function FloatingDockPreview() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const items = [
    { icon: "🏠", label: "Home" },
    { icon: "🔍", label: "Search" },
    { icon: "📁", label: "Files" },
    { icon: "⚙️", label: "Settings" },
    { icon: "👤", label: "Profile" },
  ];

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="flex gap-2 bg-zinc-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {items.map((item, i) => (
          <motion.button
            key={item.label}
            onClick={() => setActiveIndex(i)}
            whileHover={{ scale: 1.2, y: -8 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
              i === activeIndex
                ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {item.icon}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAGIC UI - Marquee Preview
// ============================================================================
function MarqueePreview() {
  const logos = [
    "Vercel",
    "Stripe",
    "GitHub",
    "Notion",
    "Linear",
    "Figma",
    "Slack",
    "Discord",
  ];

  return (
    <div className="w-full overflow-hidden py-8">
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, -800] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...logos, ...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-8 py-4 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 text-zinc-300 font-medium hover:border-zinc-600 transition-colors"
          >
            {logo}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================================================
// Beams Background Preview
// ============================================================================
function BeamsPreview() {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-950">
      {/* Radial glow center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 60%)",
        }}
      />
      {/* Beam lines with blur */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px]"
          style={{
            top: `${15 + i * 14}%`,
            left: 0,
            right: 0,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.8) 20%, rgba(236,72,153,0.8) 50%, rgba(6,182,212,0.8) 80%, transparent 100%)",
            filter: "blur(1px)",
            boxShadow:
              "0 0 10px rgba(139,92,246,0.5), 0 0 20px rgba(139,92,246,0.3)",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.4,
          }}
        />
      ))}
      {/* Secondary glow beams */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute h-8 opacity-30"
          style={{
            top: `${25 + i * 20}%`,
            left: 0,
            right: 0,
            background:
              "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)",
            filter: "blur(15px)",
          }}
          animate={{ x: ["100%", "-100%"] }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.8,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xl font-bold drop-shadow-lg">
          Beams Background
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Spotlight Preview
// ============================================================================
function SpotlightPreview() {
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = React.useState(false);

  // Auto-animate when not hovering
  React.useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      const t = Date.now() / 2000;
      setPos({ x: 50 + Math.sin(t) * 30, y: 50 + Math.cos(t * 0.7) * 20 });
    }, 50);
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div
      className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-950 cursor-none"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Primary spotlight with blur */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: `radial-gradient(500px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.4), transparent 50%)`,
          filter: "blur(40px)",
        }}
      />
      {/* Secondary spotlight layer */}
      <div
        className="absolute inset-0 transition-all duration-150"
        style={{
          background: `radial-gradient(300px circle at ${pos.x}% ${pos.y}%, rgba(6,182,212,0.3), transparent 40%)`,
          filter: "blur(20px)",
        }}
      />
      {/* Core bright spot */}
      <div
        className="absolute inset-0 transition-all duration-100"
        style={{
          background: `radial-gradient(100px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.15), transparent 30%)`,
        }}
      />
      {/* Text with glow on hover */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-white text-xl font-bold"
          style={{ textShadow: "0 0 20px rgba(139,92,246,0.5)" }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Spotlight Effect
        </motion.span>
      </div>
    </div>
  );
}

// ============================================================================
// Meteors Preview
// ============================================================================
function MeteorsPreview() {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-950">
      {/* Star field background */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-[1px] h-[1px] bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.5,
          }}
        />
      ))}
      {/* Meteors with blur trail */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${5 + i * 12}%`,
            top: -100,
            rotate: "215deg",
          }}
          animate={{ y: [0, 500], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.2 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.3 + Math.random() * 0.5,
            ease: "linear",
          }}
        >
          {/* Meteor head - bright glow */}
          <div
            className="w-1 h-1 rounded-full bg-white"
            style={{
              boxShadow:
                "0 0 6px 2px rgba(255,255,255,0.8), 0 0 12px 4px rgba(168,85,247,0.6)",
            }}
          />
          {/* Meteor tail - gradient trail */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-24"
            style={{
              background:
                "linear-gradient(180deg, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.4) 30%, rgba(139,92,246,0.2) 60%, transparent 100%)",
              filter: "blur(1px)",
            }}
          />
          {/* Wider glow trail */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-16 opacity-40"
            style={{
              background:
                "linear-gradient(180deg, rgba(168,85,247,0.5) 0%, transparent 100%)",
              filter: "blur(4px)",
            }}
          />
        </motion.div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xl font-bold drop-shadow-lg">
          Meteors
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Sparkles Preview
// ============================================================================
function SparklesPreview() {
  // Pre-computed sparkle positions for consistent rendering
  const sparkles = React.useMemo(
    () =>
      [...Array(25)].map((_, i) => ({
        x: 10 + (i % 5) * 20 + Math.random() * 10,
        y: 10 + Math.floor(i / 5) * 20 + Math.random() * 10,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 3,
        duration: 1.5 + Math.random() * 1,
      })),
    [],
  );

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-950">
      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(250,204,21,0.08) 0%, transparent 60%)",
        }}
      />
      {/* Sparkles with glow */}
      {sparkles.map((sparkle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            background:
              "radial-gradient(circle, #fef08a 0%, #facc15 50%, #eab308 100%)",
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size}px rgba(250,204,21,0.4), 0 0 ${sparkle.size * 4}px ${sparkle.size * 2}px rgba(250,204,21,0.2)`,
          }}
          animate={{
            scale: [0, 1.2, 1, 1.2, 0],
            opacity: [0, 1, 0.8, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Star shapes (4-pointed) */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${15 + i * 10 + Math.random() * 5}%`,
            top: `${20 + (i % 3) * 25 + Math.random() * 10}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 45, 90],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        >
          <div className="w-3 h-3 relative">
            <div
              className="absolute inset-0 bg-yellow-300 rounded-sm rotate-45"
              style={{ filter: "blur(1px)" }}
            />
            <div className="absolute inset-0.5 bg-yellow-200 rounded-sm rotate-45" />
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xl font-bold drop-shadow-lg">
          ✨ Sparkles
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Dot Pattern Preview
// ============================================================================
function DotPatternPreview() {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden relative bg-zinc-950">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xl font-bold">Dot Pattern</span>
      </div>
    </div>
  );
}

// ============================================================================
// Shimmer Button Preview
// ============================================================================
function ShimmerButtonPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.button
        className="relative px-8 py-3 bg-gradient-to-br from-zinc-800 to-zinc-900 text-white font-bold rounded-xl overflow-hidden border border-zinc-700/50"
        whileHover={{
          scale: 1.05,
          boxShadow:
            "0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(6,182,212,0.2)",
          borderColor: "rgba(139,92,246,0.5)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at center, rgba(139,92,246,0.15), transparent 70%)",
          }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 -skew-x-12"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            filter: "blur(8px)",
          }}
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Sharp shimmer line */}
        <motion.div
          className="absolute inset-0 -skew-x-12"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          }}
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <span className="relative z-10">Shimmer Button</span>
      </motion.button>
    </div>
  );
}

// ============================================================================
// Moving Border Preview
// ============================================================================
function MovingBorderPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative p-[2px] rounded-xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Animated conic gradient border */}
        <motion.div
          className="absolute inset-[-100%] rounded-xl"
          style={{
            background:
              "conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Glow layer */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-50"
          style={{
            background:
              "conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6)",
            filter: "blur(15px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.button
          className="relative px-8 py-3 bg-zinc-900 text-white font-bold rounded-xl"
          whileHover={{ boxShadow: "inset 0 0 20px rgba(139,92,246,0.2)" }}
        >
          Moving Border
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Magnetic Button Preview
// ============================================================================
function MagneticButtonPreview() {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPos({ x, y });
  };

  return (
    <div className="flex items-center justify-center p-8">
      <motion.button
        ref={ref}
        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg"
        animate={{ x: pos.x, y: pos.y }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setPos({ x: 0, y: 0 })}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        Magnetic
      </motion.button>
    </div>
  );
}

// ============================================================================
// Ripple Button Preview
// ============================================================================
function RippleButtonPreview() {
  const [ripples, setRipples] = React.useState<
    { x: number; y: number; id: number }[]
  >([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
    setTimeout(() => setRipples((prev) => prev.slice(1)), 600);
  };

  return (
    <div className="flex items-center justify-center p-8">
      <button
        onClick={handleClick}
        className="relative px-8 py-3 bg-blue-600 text-white font-bold rounded-lg overflow-hidden"
      >
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute w-4 h-4 bg-white/30 rounded-full"
            style={{ left: r.x - 8, top: r.y - 8 }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 10, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        Click Me
      </button>
    </div>
  );
}

// ============================================================================
// Gradient Border Preview
// ============================================================================
function GradientBorderPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative p-[2px] rounded-xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4, #ec4899)",
            backgroundSize: "300% 100%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-50"
          style={{
            background:
              "linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4, #ec4899)",
            backgroundSize: "300% 100%",
            filter: "blur(10px)",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <motion.button
          className="relative px-8 py-3 bg-zinc-900 text-white font-bold rounded-xl"
          whileHover={{ boxShadow: "inset 0 0 20px rgba(139,92,246,0.2)" }}
        >
          Gradient Border
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================================================
// 3D Card Preview
// ============================================================================
function Card3DPreview() {
  const [rotate, setRotate] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = -(e.clientX - rect.left - rect.width / 2) / 10;
    setRotate({ x, y });
  };

  return (
    <div
      className="flex items-center justify-center p-8"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-48 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 shadow-xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setRotate({ x: 0, y: 0 })}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h3 className="text-white font-bold">3D Card</h3>
        <p className="text-white/70 text-sm mt-2">Hover me!</p>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Hover Card Preview
// ============================================================================
function HoverCardPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative w-48 h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 border border-zinc-700/50 cursor-pointer overflow-hidden group"
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(139,92,246,0.3)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Gradient border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))",
            filter: "blur(20px)",
            zIndex: -1,
          }}
        />
        <h3 className="text-white font-bold">Hover Card</h3>
        <p className="text-zinc-400 text-sm mt-2">Lift with glow</p>
        {/* Shimmer effect */}
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </motion.div>
    </div>
  );
}

// ============================================================================
// Bento Grid Preview
// ============================================================================
function BentoGridPreview() {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 w-full max-w-xs">
      <motion.div
        className="col-span-2 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg cursor-pointer"
        whileHover={{
          scale: 1.03,
          boxShadow: "0 10px 30px rgba(168,85,247,0.4)",
        }}
        transition={{ type: "spring", stiffness: 400 }}
      />
      <motion.div
        className="h-16 bg-zinc-800 rounded-lg cursor-pointer border border-zinc-700/50"
        whileHover={{
          scale: 1.05,
          borderColor: "rgba(139,92,246,0.5)",
          boxShadow: "0 0 20px rgba(139,92,246,0.2)",
        }}
        transition={{ type: "spring", stiffness: 400 }}
      />
      <motion.div
        className="h-16 bg-zinc-800 rounded-lg cursor-pointer border border-zinc-700/50"
        whileHover={{
          scale: 1.05,
          borderColor: "rgba(6,182,212,0.5)",
          boxShadow: "0 0 20px rgba(6,182,212,0.2)",
        }}
        transition={{ type: "spring", stiffness: 400 }}
      />
      <motion.div
        className="col-span-2 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg cursor-pointer"
        whileHover={{
          scale: 1.03,
          boxShadow: "0 10px 30px rgba(6,182,212,0.4)",
        }}
        transition={{ type: "spring", stiffness: 400 }}
      />
    </div>
  );
}

// ============================================================================
// Feature Card Preview
// ============================================================================
function FeatureCardPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="w-56 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-4 border border-zinc-800/50 cursor-pointer group"
        whileHover={{
          y: -6,
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(168,85,247,0.15)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-purple-600/30"
          whileHover={{ scale: 1.1, rotate: 5 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(168,85,247,0.3)",
              "0 0 30px rgba(168,85,247,0.5)",
              "0 0 20px rgba(168,85,247,0.3)",
            ],
          }}
          transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
        >
          <span className="text-white text-lg">⚡</span>
        </motion.div>
        <h3 className="text-white font-bold group-hover:text-purple-300 transition-colors">
          Feature
        </h3>
        <p className="text-zinc-400 text-sm mt-1">Hover for elevation</p>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Pricing Card Preview
// ============================================================================
function PricingCardPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="relative w-48 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl p-4 border border-purple-500/30 cursor-pointer overflow-hidden group"
        whileHover={{
          y: -6,
          borderColor: "rgba(168,85,247,0.6)",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(168,85,247,0.2)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative text-purple-400 text-xs font-bold">PRO</span>
        <motion.div
          className="relative text-2xl font-bold text-white mt-2"
          whileHover={{ scale: 1.05 }}
        >
          <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            $29
          </span>
          <span className="text-sm text-zinc-400">/mo</span>
        </motion.div>
        <ul className="relative mt-3 space-y-1 text-xs text-zinc-400">
          <li className="group-hover:text-zinc-300 transition-colors">
            ✓ Feature one
          </li>
          <li className="group-hover:text-zinc-300 transition-colors">
            ✓ Feature two
          </li>
        </ul>
        {/* Shimmer */}
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </motion.div>
    </div>
  );
}

// ============================================================================
// Text Generate Preview
// ============================================================================
function TextGeneratePreview() {
  const text = "Hello World";
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex">
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Flip Words Preview
// ============================================================================
function FlipWordsPreview() {
  const words = ["Amazing", "Beautiful", "Creative"];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      2000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <span className="text-zinc-400 text-xl">This is </span>
      <motion.span
        key={index}
        className="text-xl font-bold text-purple-400 ml-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {words[index]}
      </motion.span>
    </div>
  );
}

// ============================================================================
// Number Ticker Preview
// ============================================================================
function NumberTickerPreview() {
  const [displayNum, setDisplayNum] = React.useState(0);
  const targetNum = 1234;

  React.useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(Math.floor(eased * targetNum));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    // Reset and repeat
    const resetTimer = setInterval(() => {
      setDisplayNum(0);
      const startTime2 = Date.now();
      const animate2 = () => {
        const elapsed = Date.now() - startTime2;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayNum(Math.floor(eased * targetNum));
        if (progress < 1) requestAnimationFrame(animate2);
      };
      animate2();
    }, 4000);

    return () => clearInterval(resetTimer);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <motion.span
          className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent font-mono"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {displayNum.toLocaleString()}
        </motion.span>
        <motion.div
          className="absolute -inset-2 rounded-lg opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Gradient Text Preview
// ============================================================================
function GradientTextPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.span
        className="text-3xl font-bold bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #a78bfa, #ec4899, #f87171, #a78bfa)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        Gradient Text
      </motion.span>
    </div>
  );
}

// ============================================================================
// Wavy Text Preview
// ============================================================================
function WavyTextPreview() {
  const text = "Wavy Text";
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex">
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            className="text-2xl font-bold text-white"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Dots Loader Preview
// ============================================================================
function DotsLoaderPreview() {
  return (
    <div className="flex items-center justify-center p-8 gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-4 h-4 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Skeleton Preview
// ============================================================================
function SkeletonPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-64 space-y-3">
        {[1, 0.75, 0.5].map((width, i) => (
          <div
            key={i}
            className="relative h-4 bg-zinc-800 rounded overflow-hidden"
            style={{ width: `${width * 100}%` }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "linear",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Progress Bar Preview
// ============================================================================
function ProgressBarPreview() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(
      () => setProgress((p) => (p >= 100 ? 0 : p + 2)),
      100,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-64 h-2 bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Search Input Preview
// ============================================================================
function SearchInputPreview() {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative"
        animate={{
          boxShadow: focused
            ? "0 0 20px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.2)"
            : "0 0 0 rgba(139,92,246,0)",
        }}
        style={{ borderRadius: 8 }}
      >
        <input
          type="text"
          placeholder="Search..."
          className="w-64 px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <motion.span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          animate={{
            scale: focused ? 1.1 : 1,
            rotate: focused ? [0, -10, 10, 0] : 0,
            color: focused ? "#a78bfa" : "#71717a",
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          🔍
        </motion.span>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Animated Input Preview
// ============================================================================
function AnimatedInputPreview() {
  const [focused, setFocused] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <input
          type="text"
          className="w-64 px-4 py-2 bg-zinc-800 border-2 border-zinc-700 rounded-lg text-white focus:outline-none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <motion.span
          className="absolute left-4 text-zinc-500 pointer-events-none"
          animate={{
            y: focused ? -24 : 0,
            scale: focused ? 0.8 : 1,
            color: focused ? "#8b5cf6" : "#71717a",
          }}
        >
          Label
        </motion.span>
      </div>
    </div>
  );
}

// ============================================================================
// Toggle Switch Preview
// ============================================================================
function ToggleSwitchPreview() {
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => setOn((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8 gap-4">
      <motion.button
        onClick={() => setOn(!on)}
        className="relative w-14 h-8 rounded-full p-1"
        animate={{
          backgroundColor: on ? "#8b5cf6" : "#3f3f46",
          boxShadow: on
            ? "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.3)"
            : "0 0 0 rgba(139,92,246,0)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="w-6 h-6 bg-white rounded-full"
          animate={{
            x: on ? 24 : 0,
            boxShadow: on
              ? "0 0 10px rgba(255,255,255,0.5)"
              : "0 0 0 rgba(255,255,255,0)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
      <motion.span
        className="text-white font-medium"
        animate={{ color: on ? "#a78bfa" : "#ffffff", scale: on ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {on ? "ON" : "OFF"}
      </motion.span>
    </div>
  );
}

// ============================================================================
// Range Slider Preview
// ============================================================================
function RangeSliderPreview() {
  const [value, setValue] = React.useState(50);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        const next = prev + (Math.random() > 0.5 ? 10 : -10);
        return Math.max(10, Math.min(90, next));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-64 space-y-3">
        <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #8b5cf6, #06b6d4)" }}
            animate={{ width: `${value}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full cursor-pointer"
            style={{ boxShadow: "0 0 10px rgba(139,92,246,0.5)" }}
            animate={{ left: `calc(${value}% - 8px)` }}
            whileHover={{
              scale: 1.2,
              boxShadow: "0 0 20px rgba(139,92,246,0.8)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <motion.div
          className="text-center font-bold text-2xl"
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          key={value}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {value}%
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Custom Select Preview
// ============================================================================
function CustomSelectPreview() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState("Option 1");
  const options = ["Option 1", "Option 2", "Option 3"];

  React.useEffect(() => {
    const interval = setInterval(() => setOpen((prev) => !prev), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-48">
        <motion.button
          onClick={() => setOpen(!open)}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-left flex justify-between items-center"
          whileHover={{
            borderColor: "rgba(139,92,246,0.5)",
            boxShadow: "0 0 15px rgba(139,92,246,0.2)",
          }}
        >
          {selected}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ▼
          </motion.span>
        </motion.button>
        <motion.div
          initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
          animate={{
            opacity: open ? 1 : 0,
            y: open ? 0 : -10,
            scaleY: open ? 1 : 0.8,
          }}
          className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden z-10 origin-top"
          style={{ pointerEvents: open ? "auto" : "none" }}
        >
          {options.map((opt, i) => (
            <motion.button
              key={opt}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: open ? 1 : 0, x: open ? 0 : -10 }}
              transition={{ delay: open ? i * 0.1 : 0 }}
              onClick={() => {
                setSelected(opt);
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-white text-left"
              whileHover={{ backgroundColor: "rgba(139,92,246,0.2)", x: 4 }}
            >
              {opt === selected && (
                <span className="mr-2 text-purple-400">✓</span>
              )}
              {opt}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Dialog Modal Preview
// ============================================================================
function DialogModalPreview() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => setOpen((prev) => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <motion.button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Open Modal
      </motion.button>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setOpen(false)}
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-zinc-900 p-6 rounded-xl border border-zinc-700/50 w-80"
            style={{
              boxShadow:
                "0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h3
              className="text-white font-bold text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Modal Title
            </motion.h3>
            <motion.p
              className="text-zinc-400 mt-2 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              This is modal content with premium animations.
            </motion.p>
            <motion.button
              onClick={() => setOpen(false)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg w-full font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 15px rgba(139,92,246,0.5)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// Drawer Preview
// ============================================================================
function DrawerPreview() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => setOpen((prev) => !prev), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8 relative h-64 overflow-hidden rounded-xl bg-zinc-950">
      <motion.button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Open Drawer
      </motion.button>
      <motion.div
        initial={{ x: "100%" }}
        animate={{
          x: open ? 0 : "100%",
          boxShadow: open
            ? "-10px 0 30px rgba(0,0,0,0.5)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-0 right-0 h-full w-48 bg-zinc-900 border-l border-zinc-700/50 p-4"
      >
        <motion.h3
          className="text-white font-bold"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: open ? 1 : 0, x: open ? 0 : 20 }}
          transition={{ delay: 0.1 }}
        >
          Drawer
        </motion.h3>
        <motion.p
          className="text-zinc-400 text-sm mt-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: open ? 1 : 0, x: open ? 0 : 20 }}
          transition={{ delay: 0.2 }}
        >
          Premium drawer panel
        </motion.p>
        <motion.button
          onClick={() => setOpen(false)}
          className="text-purple-400 text-sm mt-4 font-medium"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: open ? 1 : 0, x: open ? 0 : 20 }}
          transition={{ delay: 0.3 }}
          whileHover={{ x: -2 }}
        >
          ← Close
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Tooltip Preview
// ============================================================================
function TooltipPreview() {
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => setShow((prev) => !prev), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <motion.button
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700"
          whileHover={{
            borderColor: "rgba(139,92,246,0.5)",
            boxShadow: "0 0 15px rgba(139,92,246,0.2)",
          }}
        >
          Hover me
        </motion.button>
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.9 }}
          animate={{
            opacity: show ? 1 : 0,
            y: show ? 0 : 5,
            scale: show ? 1 : 0.9,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gradient-to-br from-zinc-700 to-zinc-800 text-white text-sm rounded-lg"
          style={{
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.3), 0 0 10px rgba(139,92,246,0.2)",
            pointerEvents: "none",
          }}
        >
          <span className="relative z-10">Tooltip!</span>
          {/* Arrow */}
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #3f3f46",
            }}
            animate={{ y: show ? [0, -2, 0] : 0 }}
            transition={{ duration: 0.5, repeat: show ? Infinity : 0 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Avatar Preview
// ============================================================================
function AvatarPreview() {
  return (
    <div className="flex items-center justify-center p-8 gap-4">
      <motion.div
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold cursor-pointer"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        JD
        {/* Online status indicator */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-950"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      <motion.div
        className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 cursor-pointer"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(113, 113, 122, 0.5)" }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <span>👤</span>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Badge Preview
// ============================================================================
function BadgePreview() {
  const badges = [
    { text: "New", color: "bg-purple-600", pulseColor: "bg-purple-400" },
    { text: "Success", color: "bg-green-600", pulseColor: "bg-green-400" },
    { text: "Error", color: "bg-red-600", pulseColor: "bg-red-400" },
  ];

  return (
    <div className="flex items-center justify-center p-8 gap-3">
      {badges.map((badge, i) => (
        <motion.span
          key={i}
          className={`relative px-3 py-1 ${badge.color} text-white text-xs font-bold rounded-full cursor-pointer`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {i === 0 && (
            <motion.span
              className={`absolute inset-0 ${badge.pulseColor} rounded-full`}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <span className="relative">{badge.text}</span>
        </motion.span>
      ))}
    </div>
  );
}

// ============================================================================
// Accordion Preview
// ============================================================================
function AccordionPreview() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => setOpen((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="w-64 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700/50"
        animate={{
          borderColor: open ? "rgba(139,92,246,0.3)" : "rgba(63,63,70,0.5)",
          boxShadow: open
            ? "0 0 15px rgba(139,92,246,0.15)"
            : "0 0 0 rgba(139,92,246,0)",
        }}
      >
        <motion.button
          onClick={() => setOpen(!open)}
          className="w-full px-4 py-3 flex justify-between items-center text-white"
          whileHover={{ backgroundColor: "rgba(139,92,246,0.1)" }}
        >
          <span>Click to expand</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ color: open ? "#a78bfa" : "#71717a" }}
          >
            ▼
          </motion.span>
        </motion.button>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          className="overflow-hidden"
        >
          <motion.p
            className="px-4 pb-3 text-zinc-400 text-sm"
            initial={{ y: -10 }}
            animate={{ y: open ? 0 : -10 }}
          >
            This is premium accordion content with smooth animations.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Tabs Preview
// ============================================================================
function TabsPreview() {
  const [active, setActive] = React.useState(0);
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

  React.useEffect(() => {
    const interval = setInterval(
      () => setActive((prev) => (prev + 1) % tabs.length),
      2000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex bg-zinc-800 rounded-lg p-1">
        {/* Animated background pill */}
        <motion.div
          className="absolute top-1 bottom-1 bg-purple-600 rounded-md"
          animate={{
            left: `calc(${active * 33.33}% + 4px)`,
            width: "calc(33.33% - 8px)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ boxShadow: "0 0 15px rgba(139,92,246,0.4)" }}
        />
        {tabs.map((tab, i) => (
          <motion.button
            key={tab}
            onClick={() => setActive(i)}
            className="relative z-10 px-4 py-2 rounded-md text-sm font-medium"
            animate={{ color: active === i ? "#ffffff" : "#a1a1aa" }}
            whileHover={{ color: "#ffffff" }}
          >
            {tab}
          </motion.button>
        ))}
      </div>
      <motion.div
        className="mt-4 text-white"
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Content for {tabs[active]}
      </motion.div>
    </div>
  );
}

// ============================================================================
// Notification Toast Preview
// ============================================================================
function NotificationToastPreview() {
  const [show, setShow] = React.useState(true);
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    const hideTimer = setTimeout(() => setShow(false), 3000);
    const showTimer = setTimeout(() => {
      setShow(true);
      setProgress(100);
    }, 4000);
    const progressInterval = setInterval(
      () => setProgress((prev) => Math.max(0, prev - 3)),
      100,
    );
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      clearInterval(progressInterval);
    };
  }, [show]);

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: show ? 0 : 100, opacity: show ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative flex items-center gap-3 px-4 py-3 bg-zinc-800 border border-zinc-700/50 rounded-lg overflow-hidden"
        style={{
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.3), 0 0 10px rgba(34,197,94,0.1)",
        }}
      >
        <motion.span
          className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          ✓
        </motion.span>
        <div>
          <div className="text-white font-medium text-sm">Success!</div>
          <div className="text-zinc-400 text-xs">
            Your action was completed.
          </div>
        </div>
        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-green-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
    </div>
  );
}

// ============================================================================
// Timeline Preview
// ============================================================================
function TimelinePreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="flex gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4, duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <motion.div
                className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.4, type: "spring", stiffness: 300 }}
                style={{ boxShadow: "0 0 10px rgba(168,85,247,0.5)" }}
              />
              {i < 3 && (
                <motion.div
                  className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-zinc-700"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.4 + 0.2, duration: 0.3 }}
                  style={{ transformOrigin: "top" }}
                />
              )}
            </div>
            <motion.div
              className="text-white text-sm font-medium pt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.4 + 0.1 }}
            >
              Event {i}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Fade In Preview
// ============================================================================
function FadeInPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeOut",
        }}
        className="text-2xl font-bold text-white"
        style={{
          textShadow: "0 0 20px rgba(139,92,246,0.5)",
        }}
      >
        Fade In
      </motion.div>
    </div>
  );
}

// ============================================================================
// Stagger Children Preview
// ============================================================================
function StaggerChildrenPreview() {
  const colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"];
  return (
    <div className="flex items-center justify-center p-8 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-10 h-10 rounded-lg"
          style={{ backgroundColor: colors[i] }}
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.1, 1],
            boxShadow: [
              `0 0 0 ${colors[i]}00`,
              `0 0 20px ${colors[i]}80`,
              `0 0 0 ${colors[i]}00`,
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Parallax Scroll Preview
// ============================================================================
function ParallaxScrollPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-52 h-36 overflow-hidden rounded-xl bg-zinc-950">
        {/* Far background - moves slow */}
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-purple-600/20 blur-xl" />
          <div className="absolute top-10 right-8 w-12 h-12 rounded-full bg-cyan-600/20 blur-xl" />
        </motion.div>
        {/* Mid layer - moves medium */}
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute bottom-8 left-1/4 w-8 h-8 bg-purple-500/40 rounded blur-sm" />
          <div className="absolute top-8 right-1/4 w-6 h-6 bg-pink-500/40 rounded blur-sm" />
        </motion.div>
        {/* Near layer - moves fast */}
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute bottom-4 right-8 w-4 h-4 bg-cyan-400/60 rounded-full" />
          <div className="absolute top-4 left-10 w-3 h-3 bg-purple-400/60 rounded-full" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow-lg">
            Parallax Layers
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Scroll Reveal Preview
// ============================================================================
function ScrollRevealPreview() {
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setKey((k) => k + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <span className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Scroll Reveal
          </span>
          <motion.div
            className="absolute -inset-4 rounded-lg opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 1 }}
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
            }}
          />
        </motion.div>
        {/* Scroll indicator */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 text-[10px]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↓ scroll
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Divider Preview
// ============================================================================
function DividerPreview() {
  return (
    <div className="flex items-center justify-center p-8 w-full">
      <div className="w-64 flex items-center gap-4">
        <motion.div
          className="flex-1 h-px relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, transparent, #71717a, #a78bfa)",
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        <motion.span
          className="text-zinc-400 text-sm font-medium px-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          OR
        </motion.span>
        <motion.div
          className="flex-1 h-px relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #a78bfa, #71717a, transparent)",
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)",
            }}
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Keyboard Key Preview
// ============================================================================
function KeyboardKeyPreview() {
  const [pressed, setPressed] = React.useState<number | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPressed(0);
      setTimeout(() => {
        setPressed(1);
        setTimeout(() => {
          setPressed(null);
        }, 200);
      }, 150);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center p-8 gap-2">
      <motion.kbd
        className="px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-white text-sm font-mono cursor-pointer"
        animate={{
          y: pressed === 0 ? 2 : 0,
          boxShadow:
            pressed === 0
              ? "0 0 0 0 #3f3f46, 0 0 10px rgba(167,139,250,0.5)"
              : "0 2px 0 0 #3f3f46, 0 0 0 rgba(167,139,250,0)",
          borderColor: pressed === 0 ? "rgba(167,139,250,0.5)" : "#52525b",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ y: 2, boxShadow: "0 0 0 0 #3f3f46" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        ⌘
      </motion.kbd>
      <span className="text-zinc-500">+</span>
      <motion.kbd
        className="px-3 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-white text-sm font-mono cursor-pointer"
        animate={{
          y: pressed === 1 ? 2 : 0,
          boxShadow:
            pressed === 1
              ? "0 0 0 0 #3f3f46, 0 0 10px rgba(6,182,212,0.5)"
              : "0 2px 0 0 #3f3f46, 0 0 0 rgba(6,182,212,0)",
          borderColor: pressed === 1 ? "rgba(6,182,212,0.5)" : "#52525b",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ y: 2, boxShadow: "0 0 0 0 #3f3f46" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        K
      </motion.kbd>
    </div>
  );
}

// ============================================================================
// Chip Preview
// ============================================================================
function ChipPreview() {
  const [chips, setChips] = React.useState([
    { id: 1, text: "React", color: "cyan" },
    { id: 2, text: "TypeScript", color: "purple" },
    { id: 3, text: "Tailwind", color: "pink" },
  ]);

  const removeChip = (id: number) => {
    setChips((prev) => prev.filter((c) => c.id !== id));
    setTimeout(() => {
      setChips([
        { id: 1, text: "React", color: "cyan" },
        { id: 2, text: "TypeScript", color: "purple" },
        { id: 3, text: "Tailwind", color: "pink" },
      ]);
    }, 1500);
  };

  const colorStyles: Record<
    string,
    { bg: string; border: string; text: string; glow: string }
  > = {
    cyan: {
      bg: "rgba(6,182,212,0.15)",
      border: "rgba(6,182,212,0.3)",
      text: "#22d3ee",
      glow: "rgba(6,182,212,0.4)",
    },
    purple: {
      bg: "rgba(147,51,234,0.15)",
      border: "rgba(147,51,234,0.3)",
      text: "#a78bfa",
      glow: "rgba(147,51,234,0.4)",
    },
    pink: {
      bg: "rgba(236,72,153,0.15)",
      border: "rgba(236,72,153,0.3)",
      text: "#f472b6",
      glow: "rgba(236,72,153,0.4)",
    },
  };

  return (
    <div className="flex items-center justify-center p-8 gap-2 flex-wrap">
      {chips.map((chip) => {
        const style = colorStyles[chip.color];
        return (
          <motion.span
            key={chip.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${style.glow}` }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer"
            style={{
              backgroundColor: style.bg,
              border: `1px solid ${style.border}`,
              color: style.text,
            }}
          >
            {chip.text}
            <motion.button
              onClick={() => removeChip(chip.id)}
              className="ml-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: style.border }}
              whileHover={{ scale: 1.2, backgroundColor: style.text }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xs text-zinc-900 font-bold">×</span>
            </motion.button>
          </motion.span>
        );
      })}
    </div>
  );
}

// ============================================================================
// Empty State Preview
// ============================================================================
function EmptyStatePreview() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        className="relative w-20 h-20 mb-4"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-zinc-700/50">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            📭
          </motion.span>
        </div>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{ left: `${30 + i * 20}%`, top: "50%" }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </motion.div>
      <motion.h3
        className="text-white font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        No items
      </motion.h3>
      <motion.p
        className="text-zinc-400 text-sm mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Get started by adding one.
      </motion.p>
      <motion.button
        className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147,51,234,0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Add Item
      </motion.button>
    </div>
  );
}

// ============================================================================
// Stat Card Preview
// ============================================================================
function StatCardPreview() {
  const [count, setCount] = React.useState(0);
  const targetCount = 12345;

  React.useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * targetCount));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
    const resetInterval = setInterval(() => {
      setCount(0);
      const restartTime = Date.now();
      const restart = () => {
        const elapsed = Date.now() - restartTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * targetCount));
        if (progress < 1) requestAnimationFrame(restart);
      };
      restart();
    }, 5000);
    return () => clearInterval(resetInterval);
  }, []);

  return (
    <div className="flex items-center justify-center p-4 gap-4">
      <motion.div
        className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-5 border border-zinc-700/50 overflow-hidden cursor-pointer"
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow:
            "0 15px 30px rgba(0,0,0,0.3), 0 0 20px rgba(34,197,94,0.2)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative">
          <div className="text-zinc-400 text-xs font-medium">Total Users</div>
          <div className="text-3xl font-bold text-white mt-1 tabular-nums">
            {count.toLocaleString()}
          </div>
          <motion.div
            className="flex items-center gap-1 mt-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.span
              className="text-green-400 text-sm font-bold"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ↑
            </motion.span>
            <span className="text-green-400 text-sm font-medium">12%</span>
            <span className="text-zinc-500 text-xs ml-1">vs last month</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// PREVIEW COMPONENTS MAP
// Maps component IDs to their preview renderers
// ============================================================================
export const PREVIEW_COMPONENTS: Record<string, React.FC> = {
  // Backgrounds
  "design-react-backgrounds-aurora": AuroraPreview,
  "design-react-backgrounds-grid": AnimatedGridPreview,
  "design-react-backgrounds-beams": BeamsPreview,
  "design-react-backgrounds-spotlight": SpotlightPreview,
  "design-react-backgrounds-meteors": MeteorsPreview,
  "design-react-backgrounds-sparkles": SparklesPreview,
  "design-react-backgrounds-dots": DotPatternPreview,

  // Buttons
  "design-react-buttons-neon": NeonButtonsPreview,
  "design-react-buttons-glass": GlassButtonPreview,
  "design-react-buttons-shimmer": ShimmerButtonPreview,
  "design-react-buttons-moving-border": MovingBorderPreview,
  "design-react-buttons-magnetic": MagneticButtonPreview,
  "design-react-buttons-ripple": RippleButtonPreview,
  "design-react-buttons-gradient-border": GradientBorderPreview,

  // Cards
  "design-react-cards-glass": GlassCardPreview,
  "design-react-cards-3d": Card3DPreview,
  "design-react-cards-hover": HoverCardPreview,
  "design-react-cards-bento": BentoGridPreview,
  "design-react-cards-feature": FeatureCardPreview,
  "design-react-cards-pricing": PricingCardPreview,

  // Text Effects
  "design-react-text-typewriter": TypewriterPreview,
  "design-react-text-generate": TextGeneratePreview,
  "design-react-text-flip": FlipWordsPreview,
  "design-react-text-number": NumberTickerPreview,
  "design-react-text-gradient": GradientTextPreview,
  "design-react-text-wavy": WavyTextPreview,

  // Loaders
  "design-react-loaders-spinner": SpinnerPreview,
  "design-react-loaders-dots": DotsLoaderPreview,
  "design-react-loaders-skeleton": SkeletonPreview,
  "design-react-loaders-progress": ProgressBarPreview,

  // Inputs
  "design-react-inputs-search": SearchInputPreview,
  "design-react-inputs-animated": AnimatedInputPreview,
  "design-react-inputs-toggle": ToggleSwitchPreview,
  "design-react-inputs-slider": RangeSliderPreview,
  "design-react-inputs-select": CustomSelectPreview,

  // Modals
  "design-react-modals-dialog": DialogModalPreview,
  "design-react-modals-drawer": DrawerPreview,
  "design-react-modals-tooltip": TooltipPreview,

  // Navigation
  "design-react-navigation-dock": FloatingDockPreview,

  // Other
  "design-react-other-avatar": AvatarPreview,
  "design-react-other-badge": BadgePreview,
  "design-react-other-accordion": AccordionPreview,
  "design-react-other-tabs": TabsPreview,
  "design-react-other-notification": NotificationToastPreview,
  "design-react-other-timeline": TimelinePreview,
  "design-react-other-divider": DividerPreview,
  "design-react-other-kbd": KeyboardKeyPreview,
  "design-react-other-chip": ChipPreview,
  "design-react-other-empty-state": EmptyStatePreview,
  "design-react-other-stat-card": StatCardPreview,

  // Animations
  "design-react-animations-marquee": MarqueePreview,
  "design-react-animations-fade": FadeInPreview,
  "design-react-animations-stagger": StaggerChildrenPreview,
  "design-react-animations-parallax": ParallaxScrollPreview,
  "design-react-animations-reveal": ScrollRevealPreview,

  // Hover.dev Components
  "design-react-notifications-slide": SlideNotificationPreview,
  "design-react-notifications-stacked": StackedNotificationsPreview,
  "design-react-buttons-encrypt": EncryptButtonPreview,
  "design-react-buttons-hamburger": HamburgerButtonPreview,
  "design-react-buttons-dotted": DottedButtonPreview,
  "design-react-buttons-spotlight": SpotlightButtonPreview,
  "design-react-buttons-neubrutalism": NeubrutalismButtonPreview,
  "design-react-buttons-draw-outline": DrawOutlineButtonPreview,
  "design-react-buttons-neumorphism": NeumorphismButtonPreview,
  "design-react-cards-swipe": SwipeCardsPreview,
  "design-react-cards-drag": DragCardsPreview,
  "design-react-cards-squishy": SquishyCardPreview,
  "design-react-cards-tilt-hover": TiltHoverCardPreview,
  "design-react-loaders-bar": BarLoaderPreview,
  "design-react-loaders-cutout": CutoutLoaderPreview,
  "design-react-toggles-slider": SliderTogglePreview,
  "design-react-text-bubble": BubbleTextPreview,
  "design-react-text-velocity": VelocityTextPreview,
  "design-react-text-circle": CircleTextPreview,
  "design-react-text-fit": FitTextPreview,

  // Aceternity Components
  "design-react-effects-tracing-beam": TracingBeamPreview,
  "design-react-effects-lamp": LampEffectPreview,
  "design-react-3d-pin": Pin3DPreview,
  "design-react-modals-animated": AnimatedModalPreview,
  "design-react-effects-link-preview": LinkPreviewDemo,
  "design-react-loaders-multi-step": MultiStepLoaderPreview,
  "design-react-inputs-file-upload": FileUploadPreview,
  "design-react-compare-slider": CompareSliderPreview,
  "design-react-scroll-sticky-reveal": StickyScrollPreview,
  "design-react-cards-comet": CometCardPreview,
  "design-react-cards-glare": GlareCardPreview,
  "design-react-navigation-floating-navbar": FloatingNavbarPreview,
  "design-react-backgrounds-shooting-stars": ShootingStarsPreview,
  "design-react-backgrounds-glowing-stars": GlowingStarsPreview,
  "design-react-backgrounds-vortex": VortexPreview,
  "design-react-effects-following-pointer": FollowingPointerPreview,

  // Uiverse.io Components
  "design-react-buttons-glitch": GlitchButtonPreview,
  "design-react-buttons-hologram": HologramButtonPreview,
  "design-react-buttons-neon-pulse": NeonPulseButtonPreview,
  "design-react-buttons-send": SendButtonPreview,
  "design-react-buttons-cyberpunk": CyberpunkButtonPreview,
  "design-react-buttons-3d-push": PushButton3DPreview,
  "design-react-loaders-orbit": OrbitLoaderPreview,
  "design-react-loaders-dna": DNALoaderPreview,
  "design-react-loaders-cube": CubeLoaderPreview,
  "design-react-loaders-infinity": InfinityLoaderPreview,
  "design-react-loaders-ring": RingLoaderPreview,
  "design-react-loaders-typing": TypingLoaderPreview,
  "design-react-toggles-ios": IOSTogglePreview,
  "design-react-toggles-neumorphism": NeumorphismTogglePreview,
  "design-react-toggles-3d": Toggle3DPreview,
  "design-react-checkboxes-animated": AnimatedCheckboxPreview,
  "design-react-checkboxes-bounce": BounceCheckboxPreview,
  "design-react-inputs-glow": GlowInputPreview,
  "design-react-inputs-floating-label": FloatingLabelInputPreview,
  "design-react-progress-circle": ProgressCirclePreview,
  "design-react-tooltips-animated": AnimatedTooltipPreview,
};

// ============================================================================
// NEW HOVER.DEV PREVIEW COMPONENTS
// ============================================================================

function SlideNotificationPreview() {
  const notifications = [
    { text: "Success", color: "from-green-600 to-green-700", delay: 0 },
    { text: "Error", color: "from-red-600 to-red-700", delay: 0.3 },
    { text: "Info", color: "from-blue-600 to-blue-700", delay: 0.6 },
  ];

  return (
    <div className="flex items-center justify-center p-4 gap-2 flex-wrap">
      {notifications.map((notif, i) => (
        <motion.div
          key={i}
          className={`px-3 py-1.5 bg-gradient-to-r ${notif.color} text-white text-xs rounded-lg font-medium shadow-lg`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            delay: notif.delay,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 5px 20px rgba(0,0,0,0.3)" }}
        >
          {notif.text}
        </motion.div>
      ))}
    </div>
  );
}

function StackedNotificationsPreview() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="relative h-28 w-52 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-0 right-0 bg-gradient-to-r from-zinc-800 to-zinc-850 rounded-lg p-3 border border-zinc-700/50 shadow-lg"
          initial={{ y: i * 8, scale: 1 - i * 0.05, opacity: 1 - i * 0.15 }}
          animate={{
            y: hovered ? i * 20 : i * 8,
            scale: hovered ? 1 - i * 0.02 : 1 - i * 0.05,
            opacity: hovered ? 1 - i * 0.1 : 1 - i * 0.15,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ zIndex: 3 - i }}
          whileHover={i === 0 ? { x: 5 } : undefined}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${i === 0 ? "bg-green-500" : i === 1 ? "bg-blue-500" : "bg-purple-500"}`}
            />
            <div className="w-20 h-2 bg-zinc-600 rounded" />
          </div>
          <div className="w-16 h-1.5 bg-zinc-700 rounded mt-2" />
        </motion.div>
      ))}
    </div>
  );
}

function EncryptButtonPreview() {
  const [isHovered, setIsHovered] = React.useState(false);
  const [text, setText] = React.useState("ENCRYPT_DATA");
  const originalText = "ENCRYPT_DATA";
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  React.useEffect(() => {
    if (!isHovered) {
      setText(originalText);
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setText((prev) =>
        originalText
          .split("")
          .map((char, i) =>
            i < iteration
              ? originalText[i]
              : chars[Math.floor(Math.random() * chars.length)],
          )
          .join(""),
      );
      iteration += 0.5;
      if (iteration >= originalText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#00F0FF] text-xs font-mono"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 15px rgba(0, 240, 255, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        {text}
      </motion.button>
    </div>
  );
}

function HamburgerButtonPreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative w-5 h-4">
          <motion.div
            className="absolute left-0 w-5 h-0.5 bg-[#00F0FF]"
            animate={{ top: isOpen ? 7 : 0, rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute left-0 top-[7px] w-5 h-0.5 bg-[#00F0FF]"
            animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="absolute left-0 w-5 h-0.5 bg-[#00F0FF]"
            animate={{ top: isOpen ? 7 : 14, rotate: isOpen ? -45 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.button>
    </div>
  );
}

function DottedButtonPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="px-4 py-2 border-2 border-dashed border-zinc-600 rounded-lg text-white text-xs bg-zinc-900 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors"
        whileHover={{ scale: 1.05, borderColor: "#00F0FF" }}
        whileTap={{ scale: 0.95 }}
      >
        Dotted
      </motion.button>
    </div>
  );
}

function SpotlightButtonPreview() {
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="relative px-5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        whileHover={{ scale: 1.05, borderColor: "#00F0FF50" }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className="absolute w-16 h-16 bg-[#00F0FF]/30 rounded-full blur-xl pointer-events-none"
          style={{ left: mousePos.x - 32, top: mousePos.y - 32 }}
        />
        <span className="relative z-10">Spotlight</span>
      </motion.button>
    </div>
  );
}

function NeubrutalismButtonPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="px-4 py-2 bg-[#00F0FF] text-black text-xs font-bold border-2 border-black rounded"
        initial={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}
        whileHover={{
          boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)",
          x: -2,
          y: -2,
        }}
        whileTap={{ boxShadow: "1px 1px 0px 0px rgba(0,0,0,1)", x: 2, y: 2 }}
        transition={{ duration: 0.1 }}
      >
        BRUTAL
      </motion.button>
    </div>
  );
}

function DrawOutlineButtonPreview() {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="relative px-4 py-2 text-[#00F0FF] text-xs"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.95 }}
      >
        Draw
        <motion.span
          className="absolute left-0 top-0 h-0.5 bg-[#00F0FF]"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.15, delay: 0 }}
        />
        <motion.span
          className="absolute right-0 top-0 w-0.5 bg-[#00F0FF]"
          initial={{ height: 0 }}
          animate={{ height: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.15, delay: 0.15 }}
        />
        <motion.span
          className="absolute right-0 bottom-0 h-0.5 bg-[#00F0FF]"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.15, delay: 0.3 }}
          style={{ originX: 1 }}
        />
        <motion.span
          className="absolute left-0 bottom-0 w-0.5 bg-[#00F0FF]"
          initial={{ height: 0 }}
          animate={{ height: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.15, delay: 0.45 }}
          style={{ originY: 1 }}
        />
      </motion.button>
    </div>
  );
}

function NeumorphismButtonPreview() {
  const [isPressed, setIsPressed] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-4 bg-zinc-800 rounded-xl">
      <motion.button
        className="px-4 py-2 bg-zinc-800 text-white text-xs rounded-lg transition-shadow"
        style={{
          boxShadow: isPressed
            ? "inset 4px 4px 8px #1a1a1a, inset -4px -4px 8px #2a2a2a"
            : "4px 4px 8px #1a1a1a, -4px -4px 8px #2a2a2a",
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        whileHover={{ scale: 1.02 }}
      >
        Soft
      </motion.button>
    </div>
  );
}

function SwipeCardsPreview() {
  const [cards, setCards] = React.useState([0, 1, 2]);
  return (
    <div className="relative h-24 w-40">
      {cards.map((card, i) => (
        <motion.div
          key={card}
          className="absolute inset-0 rounded-xl p-3 cursor-grab active:cursor-grabbing"
          style={{
            background:
              card === 0
                ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
                : card === 1
                  ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                  : "linear-gradient(135deg, #f97316, #ef4444)",
            zIndex: 3 - i,
          }}
          initial={{ y: i * 8, scale: 1 - i * 0.05, rotate: i * 2 }}
          animate={{ y: i * 8, scale: 1 - i * 0.05, rotate: i * 2 }}
          drag={i === 0 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 50) {
              setCards((prev) => [...prev.slice(1), prev[0]]);
            }
          }}
          whileDrag={{ scale: 1.05 }}
        >
          <span className="text-white text-xs font-bold">Swipe →</span>
        </motion.div>
      ))}
    </div>
  );
}

function DragCardsPreview() {
  return (
    <div className="relative h-24 w-48">
      <motion.div
        className="absolute w-16 h-10 bg-purple-600 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
        drag
        dragConstraints={{ top: 0, left: 0, right: 80, bottom: 50 }}
        whileDrag={{ scale: 1.1, zIndex: 10 }}
        initial={{ top: 8, left: 8 }}
      >
        <span className="text-white text-[10px]">Drag</span>
      </motion.div>
      <motion.div
        className="absolute w-16 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
        drag
        dragConstraints={{ top: 0, left: 0, right: 80, bottom: 50 }}
        whileDrag={{ scale: 1.1, zIndex: 10 }}
        initial={{ top: 32, left: 48 }}
      >
        <span className="text-white text-[10px]">Me</span>
      </motion.div>
    </div>
  );
}

function SquishyCardPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="w-32 bg-zinc-900 rounded-xl p-3 border border-zinc-700 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, rotateZ: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <span className="text-purple-400 text-[10px]">PRO</span>
        <div className="text-white font-bold text-sm">$29</div>
        <div className="text-zinc-500 text-[10px]">Click me!</div>
      </motion.div>
    </div>
  );
}

function TiltHoverCardPreview() {
  const [rotate, setRotate] = React.useState({ x: 0, y: 0 });
  return (
    <div
      className="flex items-center justify-center p-4"
      style={{ perspective: "500px" }}
    >
      <motion.div
        className="w-32 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl p-3 cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientY - rect.top - rect.height / 2) / 10;
          const y = -(e.clientX - rect.left - rect.width / 2) / 10;
          setRotate({ x, y });
        }}
        onMouseLeave={() => setRotate({ x: 0, y: 0 })}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-white text-xs font-bold">Tilt me!</span>
      </motion.div>
    </div>
  );
}

function BarLoaderPreview() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-[#00F0FF] to-purple-500 bg-[length:200%_100%]"
          animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

function CutoutLoaderPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.span
        className="text-lg font-black bg-gradient-to-r from-purple-500 via-[#00F0FF] to-purple-500 bg-clip-text text-transparent bg-[length:200%_100%]"
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        LOAD
      </motion.span>
    </div>
  );
}

function SliderTogglePreview() {
  const [isDark, setIsDark] = React.useState(true);
  return (
    <div className="flex items-center justify-center p-4 gap-2">
      <button
        onClick={() => setIsDark(!isDark)}
        className={`relative w-14 h-7 rounded-full p-1 transition-colors ${isDark ? "bg-zinc-800" : "bg-amber-200"}`}
      >
        <motion.div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? "bg-zinc-900" : "bg-amber-400"}`}
          animate={{ x: isDark ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span className="text-[8px]">{isDark ? "🌙" : "☀️"}</span>
        </motion.div>
      </button>
      <span className="text-white text-xs">{isDark ? "Dark" : "Light"}</span>
    </div>
  );
}

function BubbleTextPreview() {
  const colors = [
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#f59e0b",
    "#22c55e",
    "#8b5cf6",
  ];
  return (
    <div className="flex items-center justify-center p-4">
      {"BUBBLE".split("").map((char, i) => (
        <motion.span
          key={i}
          className="text-xl font-black"
          style={{ color: colors[i % colors.length] }}
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1],
            textShadow: [
              `0 0 0 ${colors[i % colors.length]}00`,
              `0 0 15px ${colors[i % colors.length]}`,
              `0 0 0 ${colors[i % colors.length]}00`,
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

function VelocityTextPreview() {
  return (
    <div className="flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -100] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      >
        <span className="text-xl font-black text-white mr-4">SCROLL •</span>
        <span className="text-xl font-black text-white mr-4">SCROLL •</span>
      </motion.div>
    </div>
  );
}

function CircleTextPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center"
        animate={{
          rotate: 360,
          borderColor: ["#8b5cf6", "#06b6d4", "#ec4899", "#8b5cf6"],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="w-8 h-8 bg-[#00F0FF] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 0 rgba(0,240,255,0)",
              "0 0 20px rgba(0,240,255,0.6)",
              "0 0 0 rgba(0,240,255,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

function FitTextPreview() {
  return (
    <div className="flex items-center justify-center p-4 w-full">
      <motion.span
        className="text-3xl font-black text-white"
        animate={{
          scale: [1, 1.15, 1],
          textShadow: [
            "0 0 0 rgba(139,92,246,0)",
            "0 0 30px rgba(139,92,246,0.8), 0 0 60px rgba(139,92,246,0.4)",
            "0 0 0 rgba(139,92,246,0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        FIT
      </motion.span>
    </div>
  );
}

function TracingBeamPreview() {
  return (
    <div className="flex p-4 h-full">
      <div className="relative">
        <div className="w-0.5 h-full bg-zinc-800" />
        <motion.div
          className="absolute top-0 left-0 w-0.5 bg-gradient-to-b from-purple-500 to-[#00F0FF]"
          animate={{ height: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-2 h-2 bg-[#00F0FF] rounded-full -left-[3px]"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="ml-4 space-y-2">
        <div className="w-16 h-2 bg-zinc-700 rounded" />
        <div className="w-12 h-2 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

function LampEffectPreview() {
  return (
    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute top-0 w-32 h-16 bg-gradient-to-b from-[#00F0FF]/30 to-transparent"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute top-12 w-20 h-0.5 bg-[#00F0FF]" />
      <span className="text-white text-sm font-bold mt-8">Lamp</span>
    </div>
  );
}

function Pin3DPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <div className="w-16 h-12 bg-zinc-900 border border-zinc-700 rounded-lg p-2">
          <span className="text-white text-[10px]">3D Pin</span>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-[#00F0FF] to-transparent" />
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#00F0FF]/10"
          animate={{ scale: [0.5, 1, 0.5], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

function AnimatedModalPreview() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => setOpen((prev) => !prev), 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center p-4 relative">
      <motion.button
        className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg"
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        Open Modal
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute inset-2 bg-zinc-900 rounded-lg border border-zinc-700 p-3 flex flex-col items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}
            >
              <span className="text-white text-xs font-bold">Modal</span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkPreviewDemo() {
  const [hovered, setHovered] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => setHovered((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center p-4">
      <span
        className="text-[#00F0FF] text-sm cursor-pointer relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        hover link
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-[#00F0FF]"
          initial={{ width: 0 }}
          animate={{ width: hovered ? "100%" : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ boxShadow: "0 0 8px rgba(0,240,255,0.5)" }}
        />
      </span>
    </div>
  );
}

function MultiStepLoaderPreview() {
  return (
    <div className="flex flex-col items-start gap-2 p-4">
      {["Loading...", "Processing...", "Done!"].map((text, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${i === 0 ? "bg-green-500" : i === 1 ? "bg-[#00F0FF] animate-spin border-2 border-t-transparent" : "border-2 border-zinc-600"}`}
          />
          <span
            className={`text-xs ${i <= 1 ? "text-white" : "text-zinc-500"}`}
          >
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}

function FileUploadPreview() {
  const [isDrag, setIsDrag] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => setIsDrag((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="w-32 border-2 border-dashed rounded-lg p-4 text-center"
        animate={{
          borderColor: isDrag ? "#8b5cf6" : "#3f3f46",
          backgroundColor: isDrag ? "rgba(139,92,246,0.1)" : "transparent",
          boxShadow: isDrag
            ? "0 0 20px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.1)"
            : "0 0 0 rgba(139,92,246,0)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-lg mb-1"
          animate={{
            y: isDrag ? [0, -5, 0] : 0,
            scale: isDrag ? 1.2 : 1,
          }}
          transition={{ duration: 0.5, repeat: isDrag ? Infinity : 0 }}
        >
          📤
        </motion.div>
        <motion.span
          className="text-[10px]"
          animate={{ color: isDrag ? "#a78bfa" : "#a1a1aa" }}
        >
          {isDrag ? "Release!" : "Drop files"}
        </motion.span>
      </motion.div>
    </div>
  );
}

function CompareSliderPreview() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-32 h-20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
          <span className="text-[8px] text-zinc-600">↔</span>
        </div>
      </div>
    </div>
  );
}

function StickyScrollPreview() {
  const [activeSection, setActiveSection] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(
      () => setActiveSection((prev) => (prev + 1) % 3),
      1500,
    );
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center p-4 gap-4">
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded"
            animate={{
              width: activeSection === i ? 64 : 48,
              height: activeSection === i ? 8 : 6,
              backgroundColor: activeSection === i ? "#8b5cf6" : "#52525b",
              boxShadow:
                activeSection === i
                  ? "0 0 10px rgba(139,92,246,0.5)"
                  : "0 0 0 transparent",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        ))}
      </div>
      <motion.div
        className="w-16 h-12 rounded-lg border border-zinc-800 overflow-hidden"
        animate={{
          background: [
            "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))",
            "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.3))",
            "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(245,158,11,0.3))",
          ][activeSection],
        }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

function CometCardPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-[#00F0FF] via-purple-500 to-[#00F0FF] rounded-lg opacity-50 blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative w-24 h-16 bg-zinc-900 rounded-lg p-2 border border-zinc-800">
          <span className="text-white text-xs">Comet</span>
        </div>
      </div>
    </div>
  );
}

function GlareCardPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-24 h-16 bg-zinc-900 rounded-lg p-2 border border-zinc-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-radial from-white/10 to-transparent rounded-full blur-md" />
        <span className="text-white text-xs relative z-10">Glare</span>
      </div>
    </div>
  );
}

function FloatingNavbarPreview() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % 3),
      1500,
    );
    return () => clearInterval(interval);
  }, []);
  const items = ["Home", "About", "Contact"];
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-full"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
      >
        {items.map((item, i) => (
          <motion.span
            key={item}
            className="text-[10px] px-1 cursor-pointer"
            animate={{
              color: activeIndex === i ? "#00F0FF" : "#a1a1aa",
              textShadow:
                activeIndex === i
                  ? "0 0 10px rgba(0,240,255,0.5)"
                  : "0 0 0 transparent",
            }}
            whileHover={{ scale: 1.1 }}
          >
            {item}
          </motion.span>
        ))}
        <motion.span
          className="px-2 py-0.5 bg-[#00F0FF] text-black text-[10px] rounded-full font-bold"
          animate={{
            boxShadow: [
              "0 0 5px rgba(0,240,255,0.3)",
              "0 0 15px rgba(0,240,255,0.6)",
              "0 0 5px rgba(0,240,255,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.05 }}
        >
          Sign In
        </motion.span>
      </motion.div>
    </div>
  );
}

function ShootingStarsPreview() {
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{ left: `${20 + i * 30}%`, top: `${10 + i * 20}%` }}
          animate={{ x: [-0, -50], y: [0, 50], opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.5 }}
        >
          <div className="absolute w-10 h-px bg-gradient-to-l from-white to-transparent -translate-x-full rotate-[225deg] origin-right" />
        </motion.div>
      ))}
    </div>
  );
}

function GlowingStarsPreview() {
  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 4px 2px rgba(255,255,255,0.3)",
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

function VortexPreview() {
  return (
    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#00F0FF] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${20 + i * 10}px center` }}
        />
      ))}
    </div>
  );
}

function FollowingPointerPreview() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <span className="text-zinc-400 text-xs">Hover area</span>
      <motion.div
        className="absolute w-6 h-6 rounded-full border border-[#00F0FF] bg-[#00F0FF]/20"
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

// ============================================================================
// UIVERSE.IO PREVIEW COMPONENTS
// ============================================================================

function GlitchButtonPreview() {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="relative px-6 py-2 bg-zinc-900 border border-[#00F0FF]/50 rounded-lg overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 text-[#00F0FF] font-mono text-sm font-bold">
          GLITCH
        </span>
        {isHovered && (
          <>
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-red-500 font-mono text-sm font-bold"
              animate={{ x: [-2, 2, -2], opacity: [0.8, 0.5, 0.8] }}
              transition={{ duration: 0.1, repeat: Infinity }}
              style={{ clipPath: "inset(0 0 50% 0)" }}
            >
              GLITCH
            </motion.span>
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-blue-400 font-mono text-sm font-bold"
              animate={{ x: [2, -2, 2], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 0.1, repeat: Infinity }}
              style={{ clipPath: "inset(50% 0 0 0)" }}
            >
              GLITCH
            </motion.span>
          </>
        )}
      </motion.button>
    </div>
  );
}

function HologramButtonPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="px-6 py-2 border-2 border-[#00F0FF] rounded-lg"
        animate={{
          boxShadow: [
            "0 0 10px #00F0FF40",
            "0 0 20px #00F0FF60",
            "0 0 10px #00F0FF40",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.span
          className="text-[#00F0FF] font-bold text-sm"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          HOLOGRAM
        </motion.span>
      </motion.div>
    </div>
  );
}

function NeonPulseButtonPreview() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="relative">
        <div className="px-5 py-2 border-2 border-[#00F0FF] rounded-full">
          <span className="text-[#00F0FF] text-sm font-bold">PULSE</span>
        </div>
        <motion.div
          className="absolute inset-0 border-2 border-[#00F0FF] rounded-full"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

function SendButtonPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#00F0FF] to-[#7000FF] rounded-lg">
        <span className="text-white text-sm font-bold">Send</span>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </motion.svg>
      </div>
    </div>
  );
}

function CyberpunkButtonPreview() {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-4">
      <motion.button
        className="relative px-5 py-2 bg-zinc-900 border border-[#00F0FF]/50 overflow-hidden"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative z-10 text-[#00F0FF] font-mono text-xs font-bold uppercase tracking-wider">
          EXECUTE
        </span>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}
        <motion.div
          className="absolute top-0 left-0 w-full h-[1px] bg-[#00F0FF]"
          animate={isHovered ? { scaleX: [0, 1], originX: 0 } : { scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </div>
  );
}

function PushButton3DPreview() {
  const [isPressed, setIsPressed] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <div
          className="absolute inset-0 bg-[#5000AA] rounded-lg"
          style={{ transform: "translateY(4px)" }}
        />
        <motion.button
          className="relative px-5 py-2 bg-[#7000FF] rounded-lg cursor-pointer"
          animate={{ y: isPressed ? 4 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-white text-sm font-bold">PUSH ME</span>
        </motion.button>
      </div>
    </div>
  );
}

function OrbitLoaderPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-14 h-14">
        {/* Pulsing core */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-5 h-5 -mt-2.5 -ml-2.5 bg-[#00F0FF] rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: [
              "0 0 10px rgba(0,240,255,0.3)",
              "0 0 25px rgba(0,240,255,0.6)",
              "0 0 10px rgba(0,240,255,0.3)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orbiting particles with glow trails */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              top: "50%",
              left: 0,
              marginTop: -6,
              transformOrigin: "28px center",
              background: ["#00F0FF", "#8b5cf6", "#ec4899"][i],
              boxShadow: `0 0 10px ${["rgba(0,240,255,0.6)", "rgba(139,92,246,0.6)", "rgba(236,72,153,0.6)"][i]}`,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.25,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DNALoaderPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="relative w-16 h-12 flex items-center justify-center"
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d", perspective: "200px" }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full"
              animate={{
                x: [12, -12, 12],
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 5px rgba(0,240,255,0.3)",
                  "0 0 15px rgba(0,240,255,0.8)",
                  "0 0 5px rgba(0,240,255,0.3)",
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              style={{ top: `${i * 20}%`, backgroundColor: "#00F0FF" }}
            />
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full"
              animate={{
                x: [-12, 12, -12],
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 5px rgba(139,92,246,0.3)",
                  "0 0 15px rgba(139,92,246,0.8)",
                  "0 0 5px rgba(139,92,246,0.3)",
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              style={{ top: `${i * 20}%`, backgroundColor: "#8b5cf6" }}
            />
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

function CubeLoaderPreview() {
  return (
    <div
      className="flex items-center justify-center p-4"
      style={{ perspective: "200px" }}
    >
      <motion.div
        className="w-10 h-10 border-2 border-[#00F0FF]"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: 360,
          rotateY: 360,
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 10px rgba(0,240,255,0.3), inset 0 0 10px rgba(0,240,255,0.1)",
            "0 0 25px rgba(0,240,255,0.6), inset 0 0 15px rgba(0,240,255,0.3)",
            "0 0 10px rgba(0,240,255,0.3), inset 0 0 10px rgba(0,240,255,0.1)",
          ],
          borderColor: ["#00F0FF", "#8b5cf6", "#00F0FF"],
        }}
        transition={{
          rotateX: { duration: 3, repeat: Infinity, ease: "linear" },
          rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          borderColor: { duration: 3, repeat: Infinity, ease: "linear" },
        }}
      />
    </div>
  );
}

function InfinityLoaderPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <svg width="50" height="25" viewBox="0 0 100 50">
        <motion.path
          d="M 25 25 C 25 10, 45 10, 50 25 C 55 40, 75 40, 75 25 C 75 10, 55 10, 50 25 C 45 40, 25 40, 25 25"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, pathOffset: [0, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

function RingLoaderPreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.svg
        width="40"
        height="40"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="url(#ringGradPreview)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="75"
          strokeDashoffset="25"
        />
        <defs>
          <linearGradient
            id="ringGradPreview"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}

function TypingLoaderPreview() {
  const colors = ["#00F0FF", "#8b5cf6", "#ec4899"];
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800/80 rounded-full border border-zinc-700">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colors[i] }}
            animate={{
              y: [0, -6, 0],
              scale: [1, 1.2, 1],
              boxShadow: [
                `0 0 5px ${colors[i]}40`,
                `0 0 15px ${colors[i]}`,
                `0 0 5px ${colors[i]}40`,
              ],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function IOSTogglePreview() {
  const [on, setOn] = React.useState(true);
  return (
    <div className="flex items-center justify-center p-4 gap-3">
      <button
        onClick={() => setOn(!on)}
        className={`relative w-12 h-7 rounded-full p-1 transition-colors duration-200 ${on ? "bg-[#34C759]" : "bg-zinc-600"}`}
      >
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: on ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <span className="text-white text-xs">{on ? "ON" : "OFF"}</span>
    </div>
  );
}

function NeumorphismTogglePreview() {
  const [on, setOn] = React.useState(true);
  return (
    <div className="flex items-center justify-center p-4 gap-3">
      <button
        onClick={() => setOn(!on)}
        className="relative w-14 h-8 bg-zinc-800 rounded-full p-1"
        style={{
          boxShadow: "inset 3px 3px 6px #1a1a1a, inset -3px -3px 6px #2a2a2a",
        }}
      >
        <motion.div
          className={`w-6 h-6 rounded-full ${on ? "bg-[#00F0FF]" : "bg-zinc-600"}`}
          animate={{ x: on ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ boxShadow: on ? "0 0 10px rgba(0, 240, 255, 0.5)" : "none" }}
        />
      </button>
      <span className="text-white text-xs">{on ? "ON" : "OFF"}</span>
    </div>
  );
}

function Toggle3DPreview() {
  const [on, setOn] = React.useState(true);
  return (
    <div className="flex items-center justify-center p-4 gap-3">
      <button
        onClick={() => setOn(!on)}
        className="relative w-14 h-8 rounded-full overflow-hidden transition-all duration-300"
        style={{
          background: on
            ? "linear-gradient(145deg, #00d4e0, #00F0FF)"
            : "linear-gradient(145deg, #3a3a3a, #2a2a2a)",
          boxShadow: "3px 3px 8px #0a0a0a",
        }}
      >
        <motion.div
          className="absolute w-6 h-6 rounded-full top-1"
          animate={{ left: on ? 28 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            background: "linear-gradient(145deg, #fff, #e0e0e0)",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </button>
      <span className="text-white text-xs">{on ? "ON" : "OFF"}</span>
    </div>
  );
}

function AnimatedCheckboxPreview() {
  const [checked, setChecked] = React.useState(true);
  return (
    <div className="flex items-center justify-center p-4 gap-2">
      <button
        onClick={() => setChecked(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? "bg-[#00F0FF] border-[#00F0FF]" : "bg-transparent border-zinc-500"}`}
      >
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        >
          <motion.path
            d="M4 12l5 5L20 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.svg>
      </button>
      <span className="text-white text-xs">
        {checked ? "Checked" : "Click me"}
      </span>
    </div>
  );
}

function BounceCheckboxPreview() {
  const [checked, setChecked] = React.useState(true);
  return (
    <div className="flex items-center justify-center p-4 gap-2">
      <motion.button
        onClick={() => setChecked(!checked)}
        className={`w-5 h-5 rounded-md flex items-center justify-center ${checked ? "bg-[#7000FF]" : "bg-transparent border-2 border-zinc-500"}`}
        whileTap={{ scale: 0.8 }}
        animate={checked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {checked && (
          <motion.span
            className="text-white text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            ✓
          </motion.span>
        )}
      </motion.button>
      <span className="text-white text-xs">
        {checked ? "Bounce!" : "Click me"}
      </span>
    </div>
  );
}

function GlowInputPreview() {
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => setFocused((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative">
        <motion.div
          className="absolute -inset-0.5 rounded-lg blur"
          animate={{
            opacity: focused ? 0.9 : 0.2,
            background: focused
              ? "linear-gradient(90deg, #00F0FF, #8b5cf6, #00F0FF)"
              : "linear-gradient(90deg, #00F0FF, #7000FF)",
            backgroundSize: "200% 100%",
            backgroundPosition: focused ? ["0% 50%", "100% 50%"] : "0% 50%",
          }}
          transition={{
            duration: focused ? 1.5 : 0.3,
            repeat: focused ? Infinity : 0,
          }}
        />
        <motion.input
          type="text"
          placeholder={focused ? "Typing..." : "Click to focus..."}
          className="relative w-36 px-3 py-1.5 bg-zinc-900 border rounded-lg text-white text-xs placeholder:text-zinc-500 focus:outline-none"
          animate={{
            borderColor: focused ? "#00F0FF" : "#3f3f46",
            boxShadow: focused
              ? "0 0 20px rgba(0,240,255,0.3), inset 0 0 10px rgba(0,240,255,0.1)"
              : "0 0 0 transparent",
          }}
          readOnly
        />
      </div>
    </div>
  );
}

function FloatingLabelInputPreview() {
  const [focused, setFocused] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => setFocused((prev) => !prev), 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-36">
        <motion.input
          type="text"
          className="w-full px-3 py-2 pt-5 bg-zinc-900 border rounded-lg text-white text-xs focus:outline-none"
          value={focused ? "hello@" : ""}
          readOnly
          animate={{
            borderColor: focused ? "#8b5cf6" : "#3f3f46",
            boxShadow: focused
              ? "0 0 15px rgba(139,92,246,0.3)"
              : "0 0 0 transparent",
          }}
        />
        <motion.span
          className="absolute left-3 pointer-events-none"
          animate={{
            top: focused ? 4 : 14,
            fontSize: focused ? "10px" : "12px",
            color: focused ? "#8b5cf6" : "#71717a",
            textShadow: focused
              ? "0 0 10px rgba(139,92,246,0.5)"
              : "0 0 0 transparent",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          Email
        </motion.span>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#00F0FF] origin-left"
          animate={{
            scaleX: focused ? 1 : 0,
            boxShadow: focused
              ? "0 0 10px rgba(139,92,246,0.5)"
              : "0 0 0 transparent",
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

function ProgressCirclePreview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" className="-rotate-90">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="url(#progressGradPreview)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="163"
            animate={{ strokeDashoffset: [163, 40] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <defs>
            <linearGradient id="progressGradPreview">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#7000FF" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
          75%
        </span>
      </div>
    </div>
  );
}

function AnimatedTooltipPreview() {
  const [isVisible, setIsVisible] = React.useState(false);
  return (
    <div className="flex items-center justify-center p-6">
      <div
        className="relative"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <motion.button
          className="px-3 py-1.5 bg-zinc-800 text-white text-xs rounded-lg hover:bg-zinc-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Hover me
        </motion.button>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-700 text-white text-[10px] rounded whitespace-nowrap"
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              Hello! I'm a tooltip ✨
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PREVIEW_COMPONENTS;
