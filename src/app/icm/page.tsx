"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Shield,
  Eye,
  Zap,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Github,
  ExternalLink,
  Copy,
  Check,
  Rocket,
  Bot,
  Terminal,
  Plug
} from "lucide-react";
import { REGISTRY } from "@/lib/registry";
import { toast } from "sonner";

export default function ICMPage() {
  const [copiedCommand, setCopiedCommand] = useState(false);

  // Get ICM-related items from registry
  const icmAgents = REGISTRY.filter(item =>
    item.kind === 'agent' && (
      item.tags?.includes('ICM') ||
      item.tags?.includes('Solana') ||
      item.tags?.includes('DeFi') ||
      item.tags?.includes('Trading')
    )
  );

  const icmSkills = REGISTRY.filter(item =>
    item.kind === 'skill' && (
      item.tags?.includes('ICM') ||
      item.tags?.includes('Solana') ||
      item.tags?.includes('DeFi')
    )
  );

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('npx @gicm/cli add stack/icm-trader');
    setCopiedCommand(true);
    toast.success('Install command copied!');
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-white">
              gICM<span className="text-lime-300">.ai</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-lime-300">
                  Marketplace
                </Button>
              </Link>
              <a href="https://github.com/Kermit457/gICM" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:border-lime-300">
                  <Github size={16} className="mr-2" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-lime-300/20 text-lime-300 border-lime-300/50 mb-6 px-4 py-2 text-sm">
            <Zap className="w-4 h-4 mr-2" />
            The ONLY ICM-Native Claude Code Marketplace
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Trade Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-300 to-lime-400">
              Launch Faster.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-8">
            AI agents built for ICM launches, rug detection, whale tracking, and crypto trading.
            No competitor has this.
          </p>

          {/* Quick Install */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-black/60 border border-lime-300/30 rounded-lg px-6 py-4">
              <code className="text-lime-300 font-mono text-sm md:text-base">
                npx @gicm/cli add stack/icm-trader
              </code>
              <button
                onClick={copyInstallCommand}
                className="text-lime-300 hover:text-lime-400 transition-colors"
              >
                {copiedCommand ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <Link href="/workflow">
              <Button className="bg-lime-300 text-black hover:bg-lime-400 font-bold px-8 py-6 text-lg">
                Try Stack Builder
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-black text-white mb-1">{icmAgents.length}+</div>
              <div className="text-sm text-zinc-400">ICM Agents</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-black text-white mb-1">{icmSkills.length}+</div>
              <div className="text-sm text-zinc-400">Crypto Skills</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-black text-white mb-1">6</div>
              <div className="text-sm text-zinc-400">Use Cases</div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-black text-white mb-1">88-92%</div>
              <div className="text-sm text-zinc-400">Token Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* ICM Use Cases */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-lime-300/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-4">
            Built for ICM Trading
          </h2>
          <p className="text-xl text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
            No other Claude Code marketplace specializes in crypto. We do.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Use Case 1: Pre-Launch Research */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group">
              <div className="w-12 h-12 bg-lime-300/20 rounded-lg grid place-items-center mb-4 group-hover:bg-lime-300/30 transition-all">
                <Target className="text-lime-300" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Pre-Launch Research</h3>
              <p className="text-zinc-400 mb-4">
                Analyze new tokens before launch. Check for red flags, whale concentration, bot activity.
              </p>
              <div className="flex items-center text-lime-300 text-sm font-medium">
                <Bot size={16} className="mr-2" />
                icm-analyst + token-researcher
              </div>
            </div>

            {/* Use Case 2: Launch Monitoring */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group">
              <div className="w-12 h-12 bg-lime-300/20 rounded-lg grid place-items-center mb-4 group-hover:bg-lime-300/30 transition-all">
                <TrendingUp className="text-lime-300" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Launch Monitoring</h3>
              <p className="text-zinc-400 mb-4">
                Real-time pump.fun tracking. Get alerts for launches matching your criteria.
              </p>
              <div className="flex items-center text-lime-300 text-sm font-medium">
                <Bot size={16} className="mr-2" />
                launch-coordinator + alpha-hunter
              </div>
            </div>

            {/* Use Case 3: Rug Detection */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group">
              <div className="w-12 h-12 bg-lime-300/20 rounded-lg grid place-items-center mb-4 group-hover:bg-lime-300/30 transition-all">
                <Shield className="text-lime-300" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Rug Detection</h3>
              <p className="text-zinc-400 mb-4">
                Automated rug protection. Monitor liquidity, dev wallets, and execute emergency exits.
              </p>
              <div className="flex items-center text-lime-300 text-sm font-medium">
                <Bot size={16} className="mr-2" />
                rug-detector + emergency-exit
              </div>
            </div>

            {/* Use Case 4: Whale Tracking */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group">
              <div className="w-12 h-12 bg-lime-300/20 rounded-lg grid place-items-center mb-4 group-hover:bg-lime-300/30 transition-all">
                <Eye className="text-lime-300" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Whale Tracking</h3>
              <p className="text-zinc-400 mb-4">
                Follow smart money. Track whale wallets and get alerted on new positions.
              </p>
              <div className="flex items-center text-lime-300 text-sm font-medium">
                <Bot size={16} className="mr-2" />
                whale-tracker + transaction-monitor
              </div>
            </div>

            {/* Use Case 5: Portfolio Management */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group">
              <div className="w-12 h-12 bg-lime-300/20 rounded-lg grid place-items-center mb-4 group-hover:bg-lime-300/30 transition-all">
                <DollarSign className="text-lime-300" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Portfolio Tracking</h3>
              <p className="text-zinc-400 mb-4">
                Multi-wallet P&L tracking. Risk scoring. Automated alerts on 20%+ moves.
              </p>
              <div className="flex items-center text-lime-300 text-sm font-medium">
                <Bot size={16} className="mr-2" />
                portfolio-manager + risk-assessor
              </div>
            </div>

            {/* Use Case 6: Community Growth */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group">
              <div className="w-12 h-12 bg-lime-300/20 rounded-lg grid place-items-center mb-4 group-hover:bg-lime-300/30 transition-all">
                <Users className="text-lime-300" size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Community Growth</h3>
              <p className="text-zinc-400 mb-4">
                Launch your own token. Automated social campaigns, KOL outreach, engagement.
              </p>
              <div className="flex items-center text-lime-300 text-sm font-medium">
                <Bot size={16} className="mr-2" />
                community-manager + kol-tracker
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-4">
            Why gICM Dominates ICM
          </h2>
          <p className="text-xl text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
            Other marketplaces focus on generic software. We own the crypto vertical.
          </p>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 text-white font-bold">Feature</th>
                    <th className="text-center p-6 text-white font-bold">wshobson/agents</th>
                    <th className="text-center p-6 text-white font-bold">anthropics</th>
                    <th className="text-center p-6 text-white font-bold">davila7</th>
                    <th className="text-center p-6 text-lime-300 font-bold">gICM</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-white/5">
                    <td className="p-6">ICM/Crypto Focus</td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-6">Rug Detection</td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-6">Whale Tracking</td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-6">Pump.fun Integration</td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-6">Social Sentiment Analysis</td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-6">Total Agents</td>
                    <td className="p-6 text-center">85</td>
                    <td className="p-6 text-center">9</td>
                    <td className="p-6 text-center">600+</td>
                    <td className="p-6 text-center text-lime-300 font-bold">87</td>
                  </tr>
                  <tr>
                    <td className="p-6">Progressive Disclosure</td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                    <td className="p-6 text-center"><XCircle className="inline text-red-400" size={20} /></td>
                    <td className="p-6 text-center"><CheckCircle2 className="inline text-lime-300" size={20} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/compare">
              <Button variant="outline" className="border-lime-300/50 text-lime-300 hover:bg-lime-300/10">
                View Full Comparison
                <ExternalLink className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-6 bg-gradient-to-b from-lime-300/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-lime-300/10 to-emerald-300/5 backdrop-blur border border-lime-300/30 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-6">
              Start Trading Smarter in 2 Minutes
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-lime-300/20 rounded-full grid place-items-center flex-shrink-0 mt-1">
                  <span className="text-lime-300 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Install ICM Stack</h3>
                  <code className="text-sm text-zinc-400 bg-black/60 px-3 py-1 rounded">
                    npx @gicm/cli add stack/icm-trader
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-lime-300/20 rounded-full grid place-items-center flex-shrink-0 mt-1">
                  <span className="text-lime-300 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Configure APIs</h3>
                  <p className="text-sm text-zinc-400">
                    Add SOLANA_RPC_URL, TWITTER_API_KEY, DEXSCREENER_API_KEY to .env
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-lime-300/20 rounded-full grid place-items-center flex-shrink-0 mt-1">
                  <span className="text-lime-300 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Start Trading</h3>
                  <p className="text-sm text-zinc-400">
                    Ask Claude: &quot;Analyze top 10 pump.fun launches. Filter by liquidity &gt;$100k&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/workflow">
                <Button className="bg-lime-300 text-black hover:bg-lime-400 font-bold px-8 py-6 text-lg w-full sm:w-auto">
                  <Rocket className="mr-2" size={20} />
                  Try Stack Builder
                </Button>
              </Link>
              <Link href="https://github.com/Kermit457/gICM" target="_blank">
                <Button variant="outline" className="border-white/20 text-white hover:border-lime-300 px-8 py-6 text-lg w-full sm:w-auto">
                  <Github className="mr-2" size={20} />
                  View on GitHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-white text-center mb-12">
            ICM Resources
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/" className="block">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group h-full">
                <Bot className="text-lime-300 mb-4" size={32} />
                <h3 className="text-xl font-black text-white mb-2">
                  {icmAgents.length}+ ICM Agents
                </h3>
                <p className="text-zinc-400 mb-4">
                  Browse specialized agents for trading, research, and risk management
                </p>
                <div className="text-lime-300 text-sm font-medium group-hover:underline">
                  View Agents →
                </div>
              </div>
            </Link>

            <a href="https://github.com/Kermit457/gICM/blob/main/CRYPTO.md" target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group h-full">
                <Terminal className="text-lime-300 mb-4" size={32} />
                <h3 className="text-xl font-black text-white mb-2">
                  ICM Documentation
                </h3>
                <p className="text-zinc-400 mb-4">
                  Complete guide with 6 use cases, tutorials, and examples
                </p>
                <div className="text-lime-300 text-sm font-medium group-hover:underline">
                  Read Docs →
                </div>
              </div>
            </a>

            <a href="https://github.com/Kermit457/gICM/blob/main/INSTALLATION.md" target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 hover:border-lime-300/50 transition-all group h-full">
                <Plug className="text-lime-300 mb-4" size={32} />
                <h3 className="text-xl font-black text-white mb-2">
                  Installation Guide
                </h3>
                <p className="text-zinc-400 mb-4">
                  3 installation methods, CLI reference, troubleshooting
                </p>
                <div className="text-lime-300 text-sm font-medium group-hover:underline">
                  Get Started →
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 bg-gradient-to-t from-lime-300/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Dominate ICM?
          </h2>
          <p className="text-xl text-zinc-300 mb-8">
            Join the only marketplace built by degens, for degens.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={copyInstallCommand}
              className="bg-lime-300 text-black hover:bg-lime-400 font-bold px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {copiedCommand ? <Check size={20} /> : <Copy size={20} />}
              {copiedCommand ? 'Copied!' : 'Copy Install Command'}
            </button>
            <Link href="/">
              <Button variant="outline" className="border-white/20 text-white hover:border-lime-300 px-8 py-4 w-full sm:w-auto">
                Browse Marketplace
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500">
            ⚠️ Trading cryptocurrencies is highly risky. gICM agents provide analysis tools but do NOT guarantee profits. DYOR.
          </p>
        </div>
      </section>
    </div>
  );
}
