"use client";

import { useState, useEffect } from "react";
import { Trophy, MessageSquare, Flame, Rocket, Star } from "lucide-react";
import { AnimatedCounter } from "../hero/AnimatedCounter";

interface FOMOSectionProps {
  theme: "dark" | "light";
}

interface Builder {
  name: string;
  stacksBuilt: number;
  trend: "up" | "down" | "same";
}

interface Testimonial {
  text: string;
  author: string;
}

export function FOMOSection({ theme }: FOMOSectionProps) {
  const [topBuilders, setTopBuilders] = useState<Builder[]>([
    { name: "Alex M.", stacksBuilt: 43, trend: "up" },
    { name: "Jordan K.", stacksBuilt: 38, trend: "up" },
    { name: "Casey R.", stacksBuilt: 35, trend: "same" },
    { name: "Morgan L.", stacksBuilt: 32, trend: "down" },
    { name: "Taylor B.", stacksBuilt: 29, trend: "up" },
  ]);

  const [testimonials] = useState<Testimonial[]>([
    { text: "Built a complete DeFi stack in under 10 minutes!", author: "Alex M." },
    { text: "The live activity feed is so motivating to see what others are building", author: "Jordan K." },
    { text: "Best marketplace for finding quality blockchain stacks", author: "Casey R." },
    { text: "Love the real-time collaboration aspect", author: "Morgan L." },
  ]);

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [launchedToday, setLaunchedToday] = useState(12);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Simulate launched projects count
  useEffect(() => {
    const interval = setInterval(() => {
      setLaunchedToday(prev => prev + Math.floor(Math.random() * 2));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Leaderboard */}
      <div className={`
        rounded-2xl border p-6
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <div className="flex items-center gap-2 mb-6">
          <Trophy className={`w-6 h-6 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
          <h3 className={`
            text-lg font-black uppercase tracking-wide
            ${theme === "dark" ? "text-white" : "text-black"}
          `}>
            Top Builders Today
          </h3>
        </div>

        <div className="space-y-3">
          {topBuilders.map((builder, index) => (
            <div
              key={builder.name}
              className={`
                flex items-center gap-3 p-3 rounded-xl border transition-all hover-scale
                ${theme === "dark"
                  ? "bg-white/5 border-white/8 hover:bg-white/10"
                  : "bg-white border-black/20 hover:bg-gray-50"
                }
                ${index === 0 && "animate-pulse-glow border-yellow-500/50"}
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-base font-black
                ${index === 0
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
                  : index === 1
                  ? (theme === "dark" ? "bg-gray-400/20 text-gray-400" : "bg-gray-100 text-gray-600")
                  : index === 2
                  ? (theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600")
                  : (theme === "dark" ? "bg-white/10 text-white/60" : "bg-black/5 text-black/60")
                }
              `}>
                {index === 0 ? "🏆" : index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {builder.name}
                  </span>
                  {builder.trend === "up" && (
                    <span className="text-xs">📈</span>
                  )}
                </div>
                <span className={`text-xs ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                  {builder.stacksBuilt} stacks built
                </span>
              </div>

              {index === 0 && (
                <Star className="w-5 h-5 text-yellow-400 animate-float" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Ticker */}
      <div className={`
        rounded-2xl border p-6
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className={`w-6 h-6 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
          <h3 className={`
            text-lg font-black uppercase tracking-wide
            ${theme === "dark" ? "text-white" : "text-black"}
          `}>
            Builder Feedback
          </h3>
        </div>

        <div className="relative min-h-[200px] flex items-center">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`
                absolute inset-0 transition-opacity duration-500
                ${index === currentTestimonial ? "opacity-100" : "opacity-0"}
              `}
            >
              <div className={`
                p-6 rounded-xl border
                ${theme === "dark"
                  ? "bg-gradient-to-br from-lime-500/10 to-transparent border-lime-500/30"
                  : "bg-gradient-to-br from-lime-50 to-transparent border-lime-200"
                }
              `}>
                <p className={`
                  text-lg italic mb-4
                  ${theme === "dark" ? "text-white" : "text-black"}
                `}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${theme === "dark"
                      ? "bg-lime-500/20 text-lime-400"
                      : "bg-lime-100 text-lime-600"
                    }
                  `}>
                    {testimonial.author[0]}
                  </div>
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-white/70" : "text-black/70"}`}>
                    {testimonial.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`
                w-2 h-2 rounded-full transition-all
                ${index === currentTestimonial
                  ? (theme === "dark" ? "bg-lime-400 w-6" : "bg-lime-600 w-6")
                  : (theme === "dark" ? "bg-white/20" : "bg-black/20")
                }
              `}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Urgency Indicators */}
      <div className={`
        rounded-2xl border p-6
        ${theme === "dark" ? "glass-card" : "glass-card-light bg-white"}
      `}>
        <div className="flex items-center gap-2 mb-6">
          <Flame className={`w-6 h-6 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
          <h3 className={`
            text-lg font-black uppercase tracking-wide
            ${theme === "dark" ? "text-white" : "text-black"}
          `}>
            Live Momentum
          </h3>
        </div>

        <div className="space-y-4">
          {/* Launched Today */}
          <div className={`
            p-4 rounded-xl border animate-pulse-glow
            ${theme === "dark"
              ? "bg-gradient-to-br from-lime-500/10 to-transparent border-lime-500/30"
              : "bg-gradient-to-br from-lime-50 to-transparent border-lime-200"
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className={`w-5 h-5 ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`} />
              <span className={`text-xs font-bold uppercase ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
                Launched Today
              </span>
            </div>
            <div className={`text-4xl font-black ${theme === "dark" ? "text-white" : "text-black"}`}>
              <AnimatedCounter value={launchedToday} />
            </div>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
              +{((launchedToday / 143) * 100).toFixed(1)}% vs yesterday
            </p>
          </div>

          {/* Activity Indicators */}
          <div className="space-y-3">
            <div className={`
              p-3 rounded-lg border
              ${theme === "dark"
                ? "bg-white/5 border-white/8"
                : "bg-white border-black/20"
              }
            `}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  🔥 Hot Stacks
                </span>
                <span className={`text-xs ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
                  67 trending
                </span>
              </div>
            </div>

            <div className={`
              p-3 rounded-lg border
              ${theme === "dark"
                ? "bg-white/5 border-white/8"
                : "bg-white border-black/20"
              }
            `}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  ⚡ Active Builders
                </span>
                <span className={`text-xs ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
                  234 online
                </span>
              </div>
            </div>

            <div className={`
              p-3 rounded-lg border
              ${theme === "dark"
                ? "bg-white/5 border-white/8"
                : "bg-white border-black/20"
              }
            `}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  📈 Growth Rate
                </span>
                <span className={`text-xs ${theme === "dark" ? "text-lime-400" : "text-lime-600"}`}>
                  +43% this hour
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
