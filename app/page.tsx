// ViperRange — Landing Page
// ZeroDay Security Services

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Zap,
  Terminal,
  Globe,
  Lock,
  ChevronRight,
  Activity,
  Target,
  BookOpen,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features",  label: "Features" },
  { href: "#labs",      label: "Labs" },
  { href: "#about",     label: "About" },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  // Close on scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onScroll = () => closeMenu();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileMenuOpen, closeMenu]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  // Lock body scroll while menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close when clicking outside the menu panel
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [mobileMenuOpen, closeMenu]);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Cyber grid background */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(255,51,68,0.3) 0%, transparent 70%)" }}
      />

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="relative z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-black/50 border border-primary/40 flex items-center justify-center p-1 shadow-md shadow-primary/10">
              <Image
                src="/images/viperrange-logo.png"
                alt="ViperRange Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-display font-bold text-white text-sm tracking-widest">
                VIPER<span className="text-primary">RANGE</span>
              </span>
              <div className="text-[9px] text-muted-foreground tracking-widest font-mono uppercase hidden sm:block">
                by ZeroDay Security Services
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-glow-primary"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: Sign In + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown menu ────────────────────────────────────── */}
        <div
          ref={menuRef}
          aria-hidden={!mobileMenuOpen}
          className={cn(
            "md:hidden absolute top-full left-0 right-0 bg-surface/95 backdrop-blur-md border-b border-white/10 shadow-2xl transition-all duration-300 overflow-hidden",
            mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-white/10">
              <Link
                href="/register"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 mt-2"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20">
        {/* Eyebrow */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            POWERED BY ZERODAY SECURITY SERVICES
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-wide mb-4">
            EPHEMERAL
          </h1>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-wide mb-6">
            <span className="gradient-text">CYBER LABS</span>
          </h1>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
            Spin up isolated, pre-configured vulnerable applications in seconds.
            Attack legally. Learn from real telemetry. Build defences that actually work.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 px-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200 hover:shadow-glow-primary"
          >
            Launch Your First Lab
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 glass-card px-8 py-4 rounded-lg font-medium text-base text-foreground hover:border-white/20 transition-all duration-200"
          >
            <Terminal className="w-4 h-4 text-accent-cyan" />
            Sign In to Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {[
            { value: "39",    label: "Hands-On Labs" },
            { value: "100%",  label: "Cloud Native" },
            { value: "OWASP", label: "Top 10 Coverage" },
            { value: "Free",  label: "To Get Started" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <div className="font-display font-bold text-xl sm:text-2xl text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Platform Features
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white px-4">
            Built for Real Security Training
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Zap,      title: "Instant Deployment",  color: "text-secondary",      bg: "bg-secondary/10 border-secondary/20",     desc: "Labs spin up in under 2 minutes using Docker containers on Render's cloud infrastructure." },
            { icon: Globe,    title: "Public Attack Surface",color: "text-accent-cyan",    bg: "bg-accent-cyan/10 border-accent-cyan/20", desc: "Each lab gets a unique public URL — attack it with Burp Suite, ZAP, curl, or Nikto." },
            { icon: Activity, title: "Live Telemetry",      color: "text-primary",        bg: "bg-primary/10 border-primary/20",         desc: "Watch real-time logs stream into the terminal as your attacks register against the target." },
            { icon: Target,   title: "8 Categories",         color: "text-accent-green",   bg: "bg-accent-green/10 border-accent-green/20",desc: "Web, Crypto, Forensics, Linux, Pwn, Reversing, OSINT, and Misc — every major discipline in one platform." },
            { icon: BookOpen, title: "Step-by-step Guides", color: "text-accent-purple",  bg: "bg-accent-purple/10 border-accent-purple/20",desc: "Curated walkthroughs for Burp Suite, OWASP ZAP, curl, and Nikto against your own lab." },
            { icon: Lock,     title: "Fully Isolated",      color: "text-accent-orange",  bg: "bg-accent-orange/10 border-accent-orange/20",desc: "Every session is ephemeral. Labs are destroyed after use — no cross-contamination, ever." },
          ].map((feature) => (
            <div key={feature.title} className="glass-card-hover p-5 sm:p-6 group">
              <div className={`w-11 h-11 rounded-lg border ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lab Showcase ──────────────────────────────────────────────── */}
      <section id="labs" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Lab Marketplace
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
            Industry-Standard Targets
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { name: "File Oracle",          tags: ["LFI","RCE","Command Injection","PHP"], diff: "Intermediate", diffColor: "text-secondary",    image: "🗂️", desc: "Chain a local file inclusion into a command-injection gate to retrieve the collector's output." },
            { name: "Template Engine",      tags: ["SSTI","Tornado","Cookie Forgery"],     diff: "Advanced",     diffColor: "text-accent-orange", image: "🧩", desc: "Splice raw template code into a live survey preview and forge a signed session cookie." },
            { name: "Narrow Key",           tags: ["RSA","Wiener's Attack"],                diff: "Intermediate", diffColor: "text-secondary",    image: "🔑", desc: "Recover an undersized RSA private exponent using continued-fraction cryptanalysis." },
          ].map((lab) => (
            <div key={lab.name} className="glass-card-hover p-5 sm:p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{lab.image}</div>
                <span className={`text-xs font-mono font-medium ${lab.diffColor}`}>{lab.diff}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{lab.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{lab.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {lab.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/register" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors font-medium">
            View all labs after sign-up
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <section id="about" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-2xl bg-surface/80 border border-primary/20 p-2 flex items-center justify-center shadow-xl shadow-primary/10 backdrop-blur-sm">
              <Image
                src="/images/zeroday-logo.png"
                alt="ZeroDay Security Services Logo"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md rounded-xl"
                priority
              />
            </div>
            <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">Built by</div>
            <h2 className="font-display text-xl sm:text-3xl font-bold text-white mb-4">
              ZeroDay Security Services
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
              A cybersecurity and intelligence technology startup based in Siliguri, West Bengal, India.
              We operate across vulnerability research, threat intelligence, OSINT, AI development,
              and cybersecurity education.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {["Vulnerability Research", "Threat Intelligence", "OSINT", "Cybersecurity Education", "AI Development"].map((tag) => (
                <span key={tag} className="text-xs px-2.5 sm:px-3 py-1.5 rounded-full glass-card text-muted-foreground font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/5 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-black/50 border border-primary/40 flex items-center justify-center p-0.5 shadow-sm">
              <Image
                src="/images/viperrange-logo.png"
                alt="ViperRange Logo"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-xs font-bold tracking-widest text-muted-foreground">
              VIPER<span className="text-primary">RANGE</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono text-center">
            © 2026 ZeroDay Security Services · Siliguri, WB, India · For authorized security training only
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>ZeroDay Security Services</span>
            <span className="text-white/10">|</span>
            <span>Terms</span>
            <span className="text-white/10">|</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
