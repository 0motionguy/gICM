import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05050A] px-6">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute right-[20%] top-[10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[20%] h-[300px] w-[300px] rounded-full bg-[#00F0FF]/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-[#0F0F11] p-12 text-center shadow-2xl shadow-[#00F0FF]/5">
          {/* 404 Display */}
          <div className="mb-8">
            <h1 className="mb-4 bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-9xl font-black text-transparent">
              404
            </h1>
            <div className="mx-auto mb-6 h-1 w-32 rounded-full bg-[#00F0FF]" />
          </div>

          {/* Message */}
          <h2 className="mb-4 text-3xl font-black text-white">
            Page Not Found
          </h2>
          <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/">
              <Button className="gap-2 bg-[#00F0FF] font-bold text-black hover:bg-[#00F0FF]/90">
                <Home size={18} />
                Back to Home
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="gap-2 border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                <Search size={18} />
                Browse Catalog
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="mb-4 text-sm text-zinc-500">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link
                href="/"
                className="font-medium text-zinc-400 transition-colors hover:text-[#00F0FF]"
              >
                Agents
              </Link>
              <span className="text-zinc-600">•</span>
              <Link
                href="/"
                className="font-medium text-zinc-400 transition-colors hover:text-[#00F0FF]"
              >
                Skills
              </Link>
              <span className="text-zinc-600">•</span>
              <Link
                href="/"
                className="font-medium text-zinc-400 transition-colors hover:text-[#00F0FF]"
              >
                Commands
              </Link>
              <span className="text-zinc-600">•</span>
              <Link
                href="/workflow"
                className="font-medium text-zinc-400 transition-colors hover:text-[#00F0FF]"
              >
                AI Builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
