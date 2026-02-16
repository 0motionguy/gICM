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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 px-6">
      {/* Background orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-[80px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <GlassCard className="border-white/10 bg-black/40 p-12 text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          {/* Message */}
          <h2 className="mb-4 text-3xl font-black text-white">
            Something Went Wrong
          </h2>
          <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
            We encountered an unexpected error. Don&apos;t worry, our team has
            been notified and we&apos;re working on a fix.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left">
              <p className="break-all font-mono text-sm text-red-400">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-red-500/70">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={reset}
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700"
            >
              <RefreshCw size={18} />
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="gap-2 border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                <Home size={18} />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="mb-4 text-sm text-zinc-500">Still having issues?</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a
                href="https://github.com/0motionguy/gICM/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Report Issue
              </a>
              <span className="text-zinc-600">•</span>
              <a
                href="https://docs.claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Documentation
              </a>
            </div>
          </div>
        </GlassCard>

        {/* gICM Branding */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Zap className="h-4 w-4 text-blue-400" />
          <span>
            Powered by <span className="font-semibold text-blue-400">gICM</span>
          </span>
        </div>
      </div>
    </div>
  );
}
