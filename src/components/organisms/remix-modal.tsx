"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Copy,
  Github,
  Link as LinkIcon,
  Twitter,
  Download,
  GitFork,
  Check,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { RegistryItem } from "@/types/registry";
import type { StackConfig } from "@/lib/remix";
import {
  generateShareURL,
  encodeStackToURL,
  exportToGist,
  copyToClipboard,
  trackShare,
} from "@/lib/remix";

interface RemixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stack: StackConfig;
  items: RegistryItem[];
}

export function RemixModal({ open, onOpenChange, stack, items }: RemixModalProps) {
  const [activeTab, setActiveTab] = useState<"share" | "gist" | "social">("share");
  const [copied, setCopied] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [gistLoading, setGistLoading] = useState(false);
  const [gistUrl, setGistUrl] = useState<string | null>(null);

  // Generate share URL
  const shareUrl = generateShareURL(stack);
  const encoded = encodeStackToURL(stack);

  // Handle copy to clipboard
  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(`${label} copied to clipboard!`);
      await trackShare(stack.id, "url");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handle GitHub Gist export
  const handleGistExport = async () => {
    if (!githubToken.trim()) {
      toast.error("Please enter your GitHub token");
      return;
    }

    setGistLoading(true);

    try {
      const result = await exportToGist(stack, items, githubToken);
      setGistUrl(result.url);
      toast.success("Stack exported to GitHub Gist!", {
        description: "Your stack is now publicly accessible",
      });
      await trackShare(stack.id, "gist");
    } catch (error) {
      toast.error("Failed to export to Gist", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setGistLoading(false);
    }
  };

  // Social share handlers
  const handleTwitterShare = async () => {
    const text = `Check out my AI dev stack: ${stack.name}\n\n${stack.description || "Built with ClawdBot"}\n\n${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank");
    await trackShare(stack.id, "social");
  };

  const handleLinkedInShare = async () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank");
    await trackShare(stack.id, "social");
  };

  // Native share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: stack.name,
          text: stack.description || "Check out my AI dev stack",
          url: shareUrl,
        });
        await trackShare(stack.id, "social");
      } catch (error) {
        // User cancelled or error
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopy(shareUrl, "Share URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-lime-300" />
            Share Stack: {stack.name}
          </DialogTitle>
          <DialogDescription>
            Export, share, or publish your stack configuration
          </DialogDescription>
        </DialogHeader>

        {/* Stack Info */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-black">{stack.name}</h4>
              <Badge variant="outline" className="text-xs">
                {items.length} items
              </Badge>
            </div>
            {stack.description && (
              <p className="text-sm text-zinc-600 mb-2">{stack.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {stack.author && (
                <span>
                  by <span className="font-medium">{stack.author}</span>
                </span>
              )}
              {stack.remixedFrom && (
                <div className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  <span>Remixed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">
              <LinkIcon className="w-4 h-4 mr-2" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="gist">
              <Github className="w-4 h-4 mr-2" />
              GitHub Gist
            </TabsTrigger>
            <TabsTrigger value="social">
              <Twitter className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Share Link Tab */}
          <TabsContent value="share" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-black">Shareable URL</Label>
                <p className="text-xs text-zinc-500 mb-2">
                  Anyone with this link can import your stack
                </p>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={() => handleCopy(shareUrl, "Share URL")}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-black">Encoded Stack Data</Label>
                <p className="text-xs text-zinc-500 mb-2">
                  Base64-encoded stack configuration
                </p>
                <div className="flex gap-2">
                  <Input
                    value={encoded}
                    readOnly
                    className="font-mono text-xs"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={() => handleCopy(encoded, "Encoded data")}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleNativeShare} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via...
                </Button>
                <Button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = `data:application/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(stack, null, 2)
                    )}`;
                    a.download = `${stack.id}.json`;
                    a.click();
                    toast.success("Stack JSON downloaded");
                  }}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* GitHub Gist Tab */}
          <TabsContent value="gist" className="space-y-4">
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <p className="font-medium mb-1">GitHub Token Required</p>
                    <p>
                      Create a personal access token with <code className="bg-blue-100 px-1 rounded">gist</code> scope at{" "}
                      <a
                        href="https://github.com/settings/tokens/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-700"
                      >
                        github.com/settings/tokens
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {!gistUrl ? (
                <>
                  <div>
                    <Label htmlFor="github-token" className="text-sm font-medium text-black">
                      GitHub Personal Access Token
                    </Label>
                    <Input
                      id="github-token"
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="font-mono text-sm mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleGistExport}
                    disabled={gistLoading || !githubToken.trim()}
                    className="w-full"
                  >
                    {gistLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Gist...
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 mr-2" />
                        Export to GitHub Gist
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-zinc-500 space-y-1">
                    <p className="font-medium">This will create a public Gist containing:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>stack.json - Full configuration</li>
                      <li>README.md - Stack documentation</li>
                      <li>install.sh - Installation script</li>
                      <li>.env.example - Environment variables</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900 mb-1">Gist Created Successfully!</p>
                    <p className="text-sm text-green-700">Your stack is now publicly accessible</p>
                  </div>

                  <div className="flex gap-2">
                    <Input value={gistUrl} readOnly className="font-mono text-sm" />
                    <Button onClick={() => handleCopy(gistUrl, "Gist URL")} variant="outline">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(gistUrl, "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on GitHub
                    </Button>
                    <Button
                      onClick={() => {
                        setGistUrl(null);
                        setGithubToken("");
                      }}
                      variant="outline"
                    >
                      Create Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                Share your stack on social media to help others discover your workflow
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleTwitterShare} variant="outline" className="h-auto py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-sky-600" />
                    </div>
                    <span className="font-semibold">Share on Twitter</span>
                  </div>
                </Button>

                <Button onClick={handleLinkedInShare} variant="outline" className="h-auto py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <span className="font-semibold">Share on LinkedIn</span>
                  </div>
                </Button>
              </div>

              <div className="border-t pt-3">
                <Label className="text-sm font-medium text-black mb-2 block">
                  Preview Message
                </Label>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm">
                  <p className="text-black mb-2">
                    Check out my AI dev stack: <span className="font-semibold">{stack.name}</span>
                  </p>
                  {stack.description && (
                    <p className="text-zinc-600 mb-2">{stack.description}</p>
                  )}
                  <p className="text-lime-600 font-medium">
                    {items.length} items • Built with ClawdBot
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
