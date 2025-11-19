"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
  DollarSign,
  Clock,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

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

// Claude pricing (as of 2024)
const CLAUDE_PRICING = {
  sonnet: {
    input: 3.0, // per million tokens
    output: 15.0,
    name: "Claude Sonnet 3.5",
  },
  opus: {
    input: 15.0,
    output: 75.0,
    name: "Claude Opus 3",
  },
};

export function TokenSavingsCalculator() {
  const [selectedSkill, setSelectedSkill] = useState<SkillExample>(SKILL_EXAMPLES[0]);
  const [usagePerDay, setUsagePerDay] = useState([5]);
  const [model, setModel] = useState<"sonnet" | "opus">("sonnet");

  const usage = usagePerDay[0];
  const pricing = CLAUDE_PRICING[model];

  // Calculate costs
  const traditionalCostPerUse =
    (selectedSkill.traditionalTokens / 1_000_000) * pricing.input +
    (selectedSkill.traditionalTokens * 0.3 / 1_000_000) * pricing.output;

  const progressiveCostPerUse =
    (selectedSkill.progressiveTokens / 1_000_000) * pricing.input +
    (selectedSkill.progressiveTokens * 0.3 / 1_000_000) * pricing.output;

  const dailyCostTraditional = traditionalCostPerUse * usage;
  const dailyCostProgressive = progressiveCostPerUse * usage;
  const dailySavings = dailyCostTraditional - dailyCostProgressive;

  const monthlySavings = dailySavings * 22; // 22 working days
  const yearlySavings = dailySavings * 250; // 250 working days

  const tokensSavedPerUse = selectedSkill.traditionalTokens - selectedSkill.progressiveTokens;
  const dailyTokensSaved = tokensSavedPerUse * usage;
  const monthlyTokensSaved = dailyTokensSaved * 22;

  // Time savings (assuming 2 seconds per 100 tokens)
  const timeSavedPerUseSeconds = (tokensSavedPerUse / 100) * 2;
  const dailyTimeSavedMinutes = (timeSavedPerUseSeconds * usage) / 60;
  const monthlyTimeSavedHours = (dailyTimeSavedMinutes * 22) / 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-300/20 border border-lime-300/50 mb-3">
          <Sparkles size={14} className="text-lime-600" />
          <span className="text-lime-600 text-sm font-bold">
            Progressive Disclosure Technology
          </span>
        </div>
        <h2 className="text-3xl font-black text-black mb-2">
          Calculate Your Savings
        </h2>
        <p className="text-zinc-600 max-w-2xl mx-auto">
          See how much you save in tokens, costs, and time with gICM's Progressive Disclosure skills
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-lime-600" />
              Configure Your Usage
            </h3>

            {/* Skill Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-black block mb-2">
                Select Skill
              </label>
              <Select
                value={selectedSkill.id}
                onValueChange={(id) => {
                  const skill = SKILL_EXAMPLES.find((s) => s.id === id);
                  if (skill) setSelectedSkill(skill);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_EXAMPLES.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.savingsPercent}% savings
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-1">{selectedSkill.description}</p>
            </div>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-black block mb-2">
                Claude Model
              </label>
              <Select value={model} onValueChange={(v: "sonnet" | "opus") => setModel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sonnet">Claude Sonnet 3.5</SelectItem>
                  <SelectItem value="opus">Claude Opus 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-1">
                ${pricing.input}/M input • ${pricing.output}/M output
              </p>
            </div>

            {/* Usage Frequency */}
            <div className="mb-4">
              <label className="text-sm font-medium text-black block mb-2">
                Uses Per Day: <span className="text-lime-600">{usage}</span>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-medium mb-1">Example Use Case</p>
                  <p>{selectedSkill.useCase}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Token Comparison */}
          <Card className="p-6">
            <h3 className="font-semibold text-black mb-4">Token Usage Comparison</h3>

            <div className="space-y-3">
              {/* Traditional */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600">Traditional Prompt</span>
                  <span className="font-bold text-red-600">
                    {selectedSkill.traditionalTokens.toLocaleString()} tokens
                  </span>
                </div>
                <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Progressive */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600">Progressive Disclosure</span>
                  <span className="font-bold text-lime-600">
                    {selectedSkill.progressiveTokens.toLocaleString()} tokens
                  </span>
                </div>
                <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-500 rounded-full"
                    style={{
                      width: `${(selectedSkill.progressiveTokens / selectedSkill.traditionalTokens) * 100
                        }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-white">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {selectedSkill.savingsPercent}% Token Reduction
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Savings Breakdown */}
        <div className="space-y-4">
          {/* Cost Savings */}
          <Card className="p-6 bg-gradient-to-br from-lime-50 to-emerald-50 border-lime-200">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-lime-600" />
              Cost Savings
            </h3>

            <div className="space-y-4">
              {/* Daily */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-600">Daily Savings</span>
                  <span className="text-2xl font-black text-lime-600">
                    ${dailySavings.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  ${dailyCostTraditional.toFixed(2)} → ${dailyCostProgressive.toFixed(2)}
                </p>
              </div>

              <div className="border-t border-lime-200 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-600">Monthly Savings</span>
                  <span className="text-2xl font-black text-lime-600">
                    ${monthlySavings.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">22 working days</p>
              </div>

              <div className="border-t border-lime-200 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-600">Yearly Savings</span>
                  <span className="text-3xl font-black text-lime-600">
                    ${yearlySavings.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">250 working days</p>
              </div>
            </div>
          </Card>

          {/* Token Savings */}
          <Card className="p-6">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Token Savings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-black text-purple-600">
                  {(dailyTokensSaved / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-600 mt-1">Daily</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-black text-purple-600">
                  {(monthlyTokensSaved / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-600 mt-1">Monthly</p>
              </div>
            </div>
          </Card>

          {/* Time Savings */}
          <Card className="p-6">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Time Savings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-black text-blue-600">
                  {dailyTimeSavedMinutes.toFixed(1)}m
                </p>
                <p className="text-xs text-zinc-600 mt-1">Per Day</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-black text-blue-600">
                  {monthlyTimeSavedHours.toFixed(1)}h
                </p>
                <p className="text-xs text-zinc-600 mt-1">Per Month</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 text-center mt-3">
              Faster response times mean more productive work
            </p>
          </Card>

          {/* CTA */}
          <Card className="p-6 bg-gradient-to-r from-black to-zinc-800 text-white">
            <h3 className="font-bold text-white mb-2">Start Saving Today</h3>
            <p className="text-sm text-zinc-300 mb-4">
              Join {247} developers already saving with gICM
            </p>
            <Button className="w-full bg-lime-300 text-black hover:bg-lime-400">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Bottom Info */}
      <Card className="p-4 bg-zinc-50">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-700">
            <p className="font-medium text-black mb-1">How Progressive Disclosure Works</p>
            <p>
              Instead of sending entire codebases or documentation in every prompt, Progressive
              Disclosure skills intelligently load only the relevant context needed for each step.
              This results in 88-92% token savings while maintaining the same quality output.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
