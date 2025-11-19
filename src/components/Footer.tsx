import Link from "next/link";
import { Github, Twitter, Lock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-2xl font-black text-black dark:text-white">
              gICM
            </div>
            <p className="text-sm text-black/60 dark:text-white/60">
              Prompt to product for Web3. Build your AI dev stack. Ship faster.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-sm text-black dark:text-white mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/workflow" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  AI Stack Builder
                </Link>
              </li>
              <li>
                <Link href="/savings" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  Token Savings
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1">
                  <Lock size={12} />
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-sm text-black dark:text-white mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://docs.claude.ai" target="_blank" rel="noopener noreferrer" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com/Kermit457/gICM" target="_blank" rel="noopener noreferrer" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://aws.amazon.com/activate" target="_blank" rel="noopener noreferrer" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  AWS Activate
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm text-black dark:text-white mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-black/60 dark:text-white/60">
            © {currentYear} gICM. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Kermit457/gICM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/gicm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
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
