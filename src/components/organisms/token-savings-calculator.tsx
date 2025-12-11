"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingDown,
  Zap,
  Clock,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Gauge,
  Activity,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface SkillExample {
  id: string;
  name: string;
  category: string;
  traditionalTokens: number;
  progressiveTokens: number;
  savingsPercent: number;
  description: string;
  useCase: string;
}

const SKILL_EXAMPLES: SkillExample[] = [
  {
    id: "rust-optimization",
    name: "Rust Performance Optimization",
    category: "Development",
    traditionalTokens: 12500,
    progressiveTokens: 980,
    savingsPercent: 92.2,
    description: "Optimize Rust code for zero-copy architectures",
    useCase: "Analyzing and optimizing a 500-line Rust module",
  },
  {
    id: "solana-audit",
    name: "Solana Smart Contract Audit",
    category: "Web3",
    traditionalTokens: 18700,
    progressiveTokens: 1650,
    savingsPercent: 91.2,
    description: "Comprehensive Solana program security audit",
    useCase: "Auditing a DeFi protocol with 3 programs",
  },
  {
    id: "react-perf",
    name: "React Performance Analysis",
    category: "Frontend",
    traditionalTokens: 9800,
    progressiveTokens: 890,
    savingsPercent: 90.9,
    description: "Identify and fix React performance bottlenecks",
    useCase: "Analyzing Core Web Vitals for a dashboard app",
  },
  {
    id: "api-design",
    name: "REST API Design Review",
    category: "Backend",
    traditionalTokens: 14200,
    progressiveTokens: 1280,
    savingsPercent: 91.0,
    description: "OpenAPI-compliant API architecture review",
    useCase: "Designing scalable API for SaaS platform",
  },
  {
    id: "security-scan",
    name: "Security Vulnerability Scan",
    category: "Security",
    traditionalTokens: 16400,
    progressiveTokens: 1420,
    savingsPercent: 91.3,
    description: "Comprehensive security audit with remediation",
    useCase: "Scanning a full-stack application",
  },
];

export function TokenSavingsCalculator() {
  const [selectedSkill, setSelectedSkill] = useState<SkillExample>(
    SKILL_EXAMPLES[0],
  );
  const [usagePerDay, setUsagePerDay] = useState([5]);

  const usage = usagePerDay[0];

  // Calculate performance metrics
  const contextReduction = selectedSkill.savingsPercent;
  const tokensSavedPerUse =
    selectedSkill.traditionalTokens - selectedSkill.progressiveTokens;
  const dailyTokensSaved = tokensSavedPerUse * usage;
  const monthlyTokensSaved = dailyTokensSaved * 22;
  const responseBoost = (
    selectedSkill.traditionalTokens / selectedSkill.progressiveTokens
  ).toFixed(1);

  // Time savings (assuming 2 seconds per 100 tokens)
  const timeSavedPerUseSeconds = (tokensSavedPerUse / 100) * 2;
  const dailyTimeSavedMinutes = (timeSavedPerUseSeconds * usage) / 60;
  const monthlyTimeSavedHours = (dailyTimeSavedMinutes * 22) / 60;

  // Estimated response time improvement
  const responseTimeReduction = Math.round(contextReduction);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/50 mb-3">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-blue-400 text-sm font-bold">
            Progressive Disclosure Technology
          </span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2">
          Calculate Your Performance Boost
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          See how much context reduction and speed improvement you get with
          Progressive Disclosure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Configure Your Usage
            </h3>

            {/* Skill Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-white block mb-2">
                Select Skill
              </label>
              <Select
                value={selectedSkill.id}
                onValueChange={(id) => {
                  const skill = SKILL_EXAMPLES.find((s) => s.id === id);
                  if (skill) setSelectedSkill(skill);
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {SKILL_EXAMPLES.map((skill) => (
                    <SelectItem
                      key={skill.id}
                      value={skill.id}
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span>{skill.name}</span>
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-500/50 text-blue-400"
                        >
                          {skill.savingsPercent}% reduction
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-1">
                {selectedSkill.description}
              </p>
            </div>

            {/* Usage Frequency */}
            <div className="mb-4">
              <label className="text-sm font-medium text-white block mb-2">
                Uses Per Day: <span className="text-blue-400">{usage}</span>
              </label>
              <Slider
                value={usagePerDay}
                onValueChange={setUsagePerDay}
                min={1}
                max={50}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>1/day</span>
                <span>50/day</span>
              </div>
            </div>

            {/* Use Case */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300">
                  <p className="font-medium mb-1 text-blue-400">
                    Example Use Case
                  </p>
                  <p>{selectedSkill.useCase}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Token Comparison */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4">
              Token Usage Comparison
            </h3>

            <div className="space-y-3">
              {/* Traditional */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">
                    Traditional Prompt
                  </span>
                  <span className="font-bold text-zinc-400">
                    {selectedSkill.traditionalTokens.toLocaleString()} tokens
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-500 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Progressive */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">
                    Progressive Disclosure
                  </span>
                  <span className="font-bold text-blue-400">
                    {selectedSkill.progressiveTokens.toLocaleString()} tokens
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        (selectedSkill.progressiveTokens /
                          selectedSkill.traditionalTokens) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {selectedSkill.savingsPercent}% Context Reduction
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Performance Metrics */}
        <div className="space-y-4">
          {/* Performance Boost */}
          <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-400" />
              Performance Boost
            </h3>

            <div className="space-y-4">
              {/* Context Reduction */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-400">
                    Context Reduction
                  </span>
                  <span className="text-2xl font-black text-blue-400">
                    {contextReduction}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {selectedSkill.traditionalTokens.toLocaleString()} →{" "}
                  {selectedSkill.progressiveTokens.toLocaleString()} tokens
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-400">Response Speed</span>
                  <span className="text-2xl font-black text-blue-400">
                    {responseBoost}x faster
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {responseTimeReduction}% faster response time
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-400">
                    Tokens Saved Per Use
                  </span>
                  <span className="text-2xl font-black text-blue-400">
                    {tokensSavedPerUse.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">Every single request</p>
              </div>
            </div>
          </GlassCard>

          {/* Token Efficiency */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Token Efficiency
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-2xl font-black text-cyan-400">
                  {(dailyTokensSaved / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-400 mt-1">Saved Daily</p>
              </div>
              <div className="text-center p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-2xl font-black text-cyan-400">
                  {(monthlyTokensSaved / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-400 mt-1">Saved Monthly</p>
              </div>
            </div>
          </GlassCard>

          {/* Time Savings */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Time Savings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-2xl font-black text-blue-400">
                  {dailyTimeSavedMinutes.toFixed(1)}m
                </p>
                <p className="text-xs text-zinc-400 mt-1">Per Day</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-2xl font-black text-blue-400">
                  {monthlyTimeSavedHours.toFixed(1)}h
                </p>
                <p className="text-xs text-zinc-400 mt-1">Per Month</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 text-center mt-3">
              Faster responses mean more productive work
            </p>
          </GlassCard>

          {/* CTA */}
          <GlassCard className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <h3 className="font-bold text-white mb-2">
              Boost Your AI Performance
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Join developers getting {responseBoost}x faster responses
            </p>
            <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Info */}
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-400">
            <p className="font-medium text-white mb-1">
              How Progressive Disclosure Works
            </p>
            <p>
              Instead of sending entire codebases or documentation in every
              prompt, Progressive Disclosure skills intelligently load only the
              relevant context needed for each step. This results in 88-92%
              smaller context while maintaining the same quality output.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
