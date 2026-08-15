// ViperRange — 404 Not Found
// ZeroDay Security Services

import Link from "next/link";
import Image from "next/image";
import { Home, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />

      <div className="text-center relative z-10">
        {/* Glitchy 404 */}
        <div className="font-display text-[120px] sm:text-[180px] font-black leading-none mb-0 select-none">
          <span className="text-white/10">4</span>
          <span className="text-primary animate-flicker">0</span>
          <span className="text-white/10">4</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
          <div className="w-10 h-10 rounded-xl bg-black/60 border border-primary/40 flex items-center justify-center p-1 shadow-md shadow-primary/10">
            <Image
              src="/images/viperrange-logo.png"
              alt="ViperRange Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
        </div>

        <h1 className="font-display text-xl font-bold text-white mb-3 tracking-widest">
          SIGNAL NOT FOUND
        </h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
          The resource you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-glow-primary"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 glass-card px-6 py-3 rounded-lg text-sm font-medium text-foreground hover:border-white/20 transition-all duration-200"
          >
            <Terminal className="w-4 h-4 text-accent-cyan" />
            Go to Home
          </Link>
        </div>

        <p className="mt-10 text-[10px] text-muted-foreground font-mono tracking-widest">
          VIPERRANGE · ZERODAY SECURITY SERVICES
        </p>
      </div>
    </div>
  );
}
