"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (replace with error tracking service like Sentry in production)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full">
        <GlassCard className="p-12 text-center bg-black/40 border-white/10">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-black text-white mb-4">
            Something Went Wrong
          </h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Don&apos;t worry, our team has
            been notified and we&apos;re working on a fix.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
              <p className="text-sm font-mono text-red-400 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-500/70 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={reset}
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-blue-500/25"
            >
              <RefreshCw size={18} />
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="gap-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white"
              >
                <Home size={18} />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-zinc-500 mb-4">Still having issues?</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a
                href="https://github.com/Kermit457/gICM/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white font-medium transition-colors"
              >
                Report Issue
              </a>
              <span className="text-zinc-600">•</span>
              <a
                href="https://docs.claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white font-medium transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </GlassCard>

        {/* OPUS 67 Branding */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Zap className="w-4 h-4 text-blue-400" />
          <span>
            Powered by{" "}
            <span className="text-blue-400 font-semibold">OPUS 67</span>
          </span>
        </div>
      </div>
    </div>
  );
}
