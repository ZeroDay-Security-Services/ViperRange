// ViperRange — Auth Layout
// ZeroDay Security Services

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Shield, Zap, Flag, Trophy, Terminal } from "lucide-react";

export const metadata: Metadata = { title: "Auth" };

const FEATURES = [
  { icon: Zap, text: "Deploy isolated vulnerable environments in under 2 minutes" },
  { icon: Flag, text: "39 hands-on labs across Web, Crypto, Pwn, Forensics, and more" },
  { icon: Trophy, text: "Earn points for every flag — track progress on the leaderboard" },
  { icon: Terminal, text: "Real-time attack telemetry streamed straight to your terminal" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Cyber grid — full bleed */}
      <div className="fixed inset-0 cyber-grid opacity-15 pointer-events-none" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, rgba(255,51,68,0.4) 0%, transparent 70%)" }}
      />

      {/* ── Left branding panel — desktop only ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between p-12 xl:p-16 border-r border-white/10 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,51,68,0.3) 0%, transparent 60%)" }}
        />

        <Link href="/" className="relative flex items-center gap-3.5 group w-fit">
          <div className="w-12 h-12 rounded-2xl bg-black/60 border border-primary/40 flex items-center justify-center group-hover:border-primary/70 transition-all duration-200 shrink-0 p-1.5 shadow-xl shadow-primary/10">
            <Image
              src="/images/viperrange-logo.png"
              alt="ViperRange Logo"
              width={44}
              height={44}
              className="w-full h-full object-contain drop-shadow"
              priority
            />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg tracking-widest">
              VIPER<span className="text-primary">RANGE</span>
            </div>
            <div className="text-[10px] text-muted-foreground tracking-widest font-mono uppercase">
              ZeroDay Security Services
            </div>
          </div>
        </Link>

        <div className="relative max-w-lg">
          <h1 className="font-display text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
            EPHEMERAL<br /><span className="gradient-text">CYBER LABS</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            Spin up isolated vulnerable environments, exploit them legally, and prove
            it with a flag. A hands-on training ground built for people who learn by breaking things.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pt-1">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground font-mono">
          © 2026 ZeroDay Security Services · For authorized security training only
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Mobile-only compact header */}
        <header className="lg:hidden p-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-primary/40 flex items-center justify-center group-hover:border-primary/60 transition-colors p-1 shadow-md shadow-primary/10">
              <Image
                src="/images/viperrange-logo.png"
                alt="ViperRange Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm tracking-widest">
                VIPER<span className="text-primary">RANGE</span>
              </div>
              <div className="text-[9px] text-muted-foreground tracking-widest font-mono uppercase">
                ZeroDay Security Services
              </div>
            </div>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="lg:hidden p-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            © 2026 ZeroDay Security Services
          </p>
        </footer>
      </div>
    </div>
  );
}
