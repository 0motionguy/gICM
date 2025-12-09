"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingDown,
  DollarSign,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { SKILLS } from "@/lib/registry";

interface TokenCalculatorProps {
  className?: string;
}

// Average tokens per skill (full prompt vs progressive)
const AVG_FULL_TOKENS = 3500;
const AVG_PROGRESSIVE_TOKENS = 350;

// Cost per 1M tokens (approximate Claude pricing)
const COST_PER_MILLION_INPUT = 3.0; // $3 per 1M input tokens
const COST_PER_MILLION_OUTPUT = 15.0; // $15 per 1M output tokens

// Consistent number formatter to avoid hydration mismatches
const formatNumber = (n: number) => {
  return new Intl.NumberFormat("en-US").format(n);
};

export function TokenCalculator({ className = "" }: TokenCalculatorProps) {
  const [skillCount, setSkillCount] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate savings
  const calculations = useMemo(() => {
    const fullTokens = skillCount * AVG_FULL_TOKENS;
    const progressiveTokens = skillCount * AVG_PROGRESSIVE_TOKENS;
    const tokensSaved = fullTokens - progressiveTokens;
    const savingsPercent = Math.round((tokensSaved / fullTokens) * 100);

    // Monthly estimates (assuming 100 requests/day)
    const requestsPerMonth = 100 * 30;
    const monthlyFullTokens = fullTokens * requestsPerMonth;
    const monthlyProgressiveTokens = progressiveTokens * requestsPerMonth;

    const monthlyFullCost =
      (monthlyFullTokens / 1_000_000) * COST_PER_MILLION_INPUT;
    const monthlyProgressiveCost =
      (monthlyProgressiveTokens / 1_000_000) * COST_PER_MILLION_INPUT;
    const monthlySavings = monthlyFullCost - monthlyProgressiveCost;

    return {
      fullTokens,
      progressiveTokens,
      tokensSaved,
      savingsPercent,
      monthlyFullCost,
      monthlyProgressiveCost,
      monthlySavings,
    };
  }, [skillCount]);

  // Get sample skills for display
  const sampleSkills = useMemo(() => {
    return SKILLS.filter((s) => s.tokenSavings && s.tokenSavings > 0)
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        savings: s.tokenSavings || 88,
      }));
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnimating(true);
    setSkillCount(parseInt(e.target.value));
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 ${className}`}
    >
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-lime-500/10 border border-lime-500/20">
            <Sparkles className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Token Savings Calculator
            </h3>
            <p className="text-sm text-zinc-400">
              See how Progressive Skills reduce your context usage
            </p>
          </div>
        </div>

        {/* Skill Count Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-300">
              Skills in your stack
            </label>
            <span className="text-2xl font-bold text-lime-400">
              {skillCount}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={skillCount}
            onChange={handleSliderChange}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-lime-400
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-lime-500/30
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <div className="flex justify-between mt-1 text-xs text-zinc-500">
            <span>1 skill</span>
            <span>50 skills</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Without Progressive */}
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-400">
                Without Progressive Skills
              </span>
            </div>
            <motion.div
              key={`full-${skillCount}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-bold text-white mb-1"
            >
              {mounted ? formatNumber(calculations.fullTokens) : "—"}
            </motion.div>
            <p className="text-sm text-zinc-500">tokens per request</p>
            <div className="mt-3 pt-3 border-t border-red-900/30">
              <p className="text-xs text-zinc-500">Monthly cost estimate</p>
              <p className="text-lg font-semibold text-red-400">
                ${calculations.monthlyFullCost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* With Progressive */}
          <div className="p-4 rounded-xl bg-lime-950/30 border border-lime-900/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-lime-500" />
              <span className="text-sm font-medium text-lime-400">
                With Progressive Skills
              </span>
            </div>
            <motion.div
              key={`prog-${skillCount}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-bold text-white mb-1"
            >
              {mounted ? formatNumber(calculations.progressiveTokens) : "—"}
            </motion.div>
            <p className="text-sm text-zinc-500">tokens per request</p>
            <div className="mt-3 pt-3 border-t border-lime-900/30">
              <p className="text-xs text-zinc-500">Monthly cost estimate</p>
              <p className="text-lg font-semibold text-lime-400">
                ${calculations.monthlyProgressiveCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        <motion.div
          key={`savings-${skillCount}`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="p-5 rounded-xl bg-gradient-to-r from-lime-500/10 via-emerald-500/10 to-cyan-500/10 border border-lime-500/20"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-4 h-4 text-lime-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Reduction
                </span>
              </div>
              <p className="text-2xl font-bold text-lime-400">
                {calculations.savingsPercent}%
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Tokens Saved
                </span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                {mounted ? formatNumber(calculations.tokensSaved) : "—"}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Monthly Savings
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                ${calculations.monthlySavings.toFixed(0)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual Bar */}
        <div className="mt-6">
          <p className="text-xs text-zinc-500 mb-2">Token usage comparison</p>
          <div className="relative h-8 rounded-lg overflow-hidden bg-zinc-800">
            {/* Full bar (background) */}
            <div className="absolute inset-0 bg-red-900/30" />
            {/* Progressive bar (foreground) */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-lime-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{
                width: `${100 - calculations.savingsPercent}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {calculations.savingsPercent}% smaller context
              </span>
            </div>
          </div>
        </div>

        {/* Sample Skills */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-3">Example skill savings:</p>
          <div className="flex flex-wrap gap-2">
            {sampleSkills.map((skill) => (
              <div
                key={skill.name}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs"
              >
                <span className="text-zinc-300">{skill.name}</span>
                <span className="ml-2 text-lime-400 font-medium">
                  -{skill.savings}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
