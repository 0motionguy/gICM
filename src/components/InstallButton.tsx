"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

interface InstallButtonProps {
  installCommand: string;
  slug: string;
  kind: string;
}

export function InstallButton({ installCommand, slug, kind }: InstallButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/items/${slug}/files`);
      const files = await response.json();

      // Create a zip-like structure (for now, download first file)
      if (files.length > 0) {
        const blob = new Blob([files[0].content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = files[0].path.split('/').pop() || `${slug}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Download failed silently - user can retry
    }
  };

  return (
    <div className="space-y-3 py-6 border-y border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Install Command
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          title="Download files"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
        <code className="text-green-400">{installCommand}</code>
      </div>

      <p className="text-sm text-white/60">
        Run this command in your terminal to install this {kind}
      </p>
    </div>
  );
}
