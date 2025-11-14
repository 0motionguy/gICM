"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, Copy, Check, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { REGISTRY } from "@/lib/registry";
import { formatProductName } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { toast } from "sonner";
import type { RegistryItem } from "@/types/registry";

const CATEGORIES = [
  { id: "all", label: "All Components", count: 444 },
  { id: "web3", label: "Web3 & Blockchain", tags: ["Web3", "Solana", "Blockchain", "DeFi", "NFT", "Crypto"] },
  { id: "ai", label: "AI & ML", tags: ["AI", "ML", "LLM", "OpenAI", "Claude"] },
  { id: "testing", label: "Testing & QA", tags: ["Testing", "QA", "E2E", "Unit Test", "Integration"] },
  { id: "devops", label: "DevOps & CI/CD", tags: ["DevOps", "CI/CD", "Docker", "Kubernetes", "Deployment"] },
  { id: "security", label: "Security", tags: ["Security", "Audit", "Vulnerability", "Authentication"] },
  { id: "frontend", label: "Frontend", tags: ["React", "Next.js", "TypeScript", "Frontend", "UI"] },
  { id: "backend", label: "Backend", tags: ["Backend", "API", "Database", "Server"] },
];

interface ComponentCardProps {
  item: RegistryItem;
}

function ComponentCard({ item }: ComponentCardProps) {
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleCopy = async () => {
    const installCmd = `npx @gicm/cli add ${item.kind}/${item.slug}`;
    await navigator.clipboard.writeText(installCmd);
    setCopied(true);
    toast.success("Install command copied!", {
      description: installCmd
    });
    analytics.trackComponentCopied(item.id, item.kind, item.slug);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    setPreviewOpen(!previewOpen);
    if (!previewOpen) {
      analytics.trackComponentPreviewed(item.id, item.kind, item.slug);
    }
  };

  return (
    <div className="group relative rounded-xl border border-black/10 bg-white p-6 transition-all hover:border-lime-500/50 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link href={`/items/${item.slug}`}>
            <h3 className="text-lg font-bold text-black hover:text-lime-600 transition-colors">
              {formatProductName(item.name)}
            </h3>
          </Link>
          <p className="text-xs text-black/60 mt-1">{item.category}</p>
        </div>
        <Badge variant="outline" className="uppercase text-xs">
          {item.kind}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-black/70 line-clamp-2 mb-4">
        {item.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {item.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {item.tags.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{item.tags.length - 3}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-black/50 mb-4">
        <span>👥 {(item.installs || 0).toLocaleString()} installs</span>
        <span>🔀 {(item.remixes || 0).toLocaleString()} remixes</span>
        {item.tokenSavings && (
          <span className="text-lime-600 font-medium">⚡ {item.tokenSavings}% savings</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className={`flex-1 gap-2 transition-all ${
            copied ? "bg-black text-lime-300 border-black" : ""
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Install
            </>
          )}
        </Button>
        <Link href={`/items/${item.slug}`}>
          <Button size="sm" variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            View
          </Button>
        </Link>
      </div>

      {/* Preview Section */}
      {previewOpen && (
        <div className="mt-4 p-4 rounded-lg bg-black/5 border border-black/10">
          <div className="text-xs text-black/60 font-mono">
            <div className="mb-2 font-bold">Install Command:</div>
            <div className="bg-black text-lime-300 p-3 rounded overflow-x-auto">
              npx @gicm/cli add {item.kind}/{item.slug}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComponentsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = REGISTRY;

  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by category
    if (activeCategory !== "all") {
      const category = CATEGORIES.find(c => c.id === activeCategory);
      if (category && category.tags) {
        items = items.filter(item =>
          item.tags.some(tag =>
            category.tags!.some(catTag =>
              tag.toLowerCase().includes(catTag.toLowerCase())
            )
          )
        );
      }
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [allItems, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300">
      {/* Header */}
      <div className="border-b border-black/20 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="mb-3">
            <Breadcrumb items={[{ label: "Component Library" }]} />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/80 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-black mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-lime-500" />
                Component Library
              </h1>
              <p className="text-black/60 text-lg">
                444+ production-ready components for AI-powered Web3 development
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-lime-600">{filteredItems.length}</div>
              <div className="text-sm text-black/60">Components</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
            <Input
              type="text"
              placeholder="Search components... (e.g., 'solana', 'testing', 'AI')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-black/20"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              className={
                activeCategory === category.id
                  ? "bg-black text-lime-300 hover:bg-black/90"
                  : "border-black/20 hover:border-lime-500"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-black">
                {allItems.filter(i => i.kind === 'agent').length}
              </div>
              <div className="text-xs text-black/60">Agents</div>
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {allItems.filter(i => i.kind === 'skill').length}
              </div>
              <div className="text-xs text-black/60">Skills</div>
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {allItems.filter(i => i.kind === 'command').length}
              </div>
              <div className="text-xs text-black/60">Commands</div>
            </div>
            <div>
              <div className="text-2xl font-black text-black">
                {allItems.filter(i => i.kind === 'mcp').length}
              </div>
              <div className="text-xs text-black/60">MCPs</div>
            </div>
          </div>
        </div>

        {/* Component Grid */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-black mb-2">No components found</h2>
            <p className="text-black/60">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ComponentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 rounded-xl border border-black/20 bg-gradient-to-br from-lime-500 to-emerald-500 p-8 text-center">
          <h2 className="text-2xl font-black text-black mb-2">Ready to Build?</h2>
          <p className="text-black/80 mb-6">
            Copy install commands and start building your AI-powered Web3 stack today
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/stack">
              <Button size="lg" className="bg-black hover:bg-black/90 text-lime-300 font-bold">
                View Your Stack
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-black/20 hover:bg-black/10 font-bold"
              >
                Browse All Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
