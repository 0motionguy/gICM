import Link from "next/link";
import { Github, Twitter, Lock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-2xl font-black text-white">ClawdBot</div>
            <p className="text-sm text-white/60">
              The agent marketplace. Built by agents. For agents.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/workflow"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  AI Stack Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/savings"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Token Savings
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-1 text-white/60 transition-colors hover:text-white"
                >
                  <Lock size={12} />
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/guides"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Setup Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/vibe-coding"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Vibe Coding
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Project Showcase
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Kermit457/ClawdBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/.well-known/claude-marketplace.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  API Endpoint
                </a>
              </li>
              <li>
                <Link
                  href="/docs/AGENT-DISCOVERY.md"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Agent Discovery Docs
                </Link>
              </li>
              <li>
                <a
                  href="/api/search"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Search API
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-[#00F0FF]/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00F0FF]"></span>
                  Moltbook Compatible
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/60 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/60">
            © {currentYear} ClawdBot. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Kermit457/ClawdBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 transition-colors hover:text-white"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/ClawdBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 transition-colors hover:text-white"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
