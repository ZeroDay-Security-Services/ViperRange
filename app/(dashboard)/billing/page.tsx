// ViperRange — Billing Page
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { CreditCard, Zap, CheckCircle2, Shield, Cpu, Clock, Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  await requireAuth();

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground">
          Manage your plan, lab concurrency limits, and enterprise resource quotas.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current plan - Free Tier */}
        <div className="glass-card p-6 sm:p-8 border-secondary/30 relative flex flex-col justify-between hover:border-secondary/50 transition-all duration-300">
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-secondary/15 border border-secondary/30 text-secondary uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  Active Plan
                </div>
                <h3 className="font-display text-2xl font-bold text-white tracking-wide">FREE TIER</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ideal for students, researchers, and hands-on skill development.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center shadow-lg shadow-secondary/5">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
            </div>

            <div className="my-6 pt-4 border-t border-white/5">
              <div className="text-3xl font-bold text-white font-display">
                $0 <span className="text-xs text-muted-foreground font-sans font-normal">/ forever</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "Up to 3 concurrent live container deployments",
                "Access to all 39 standard & featured labs",
                "1-hour active session limit per deployable lab",
                "Step-by-step walkthroughs & automated hints",
                "Community Discord & platform documentation",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-lg bg-surface border border-white/10 text-xs font-mono text-muted-foreground text-center cursor-default"
            >
              CURRENT ACTIVE TIER
            </button>
          </div>
        </div>

        {/* Pro plan teaser */}
        <div className="glass-card p-6 sm:p-8 border-primary/20 relative flex flex-col justify-between bg-gradient-to-b from-surface/80 via-surface/40 to-surface/80 hover:border-primary/40 transition-all duration-300">
          <div className="absolute top-4 right-4 text-[10px] font-mono bg-primary/20 border border-primary/30 text-primary px-2.5 py-1 rounded-full font-semibold">
            COMING SOON
          </div>

          <div>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-lg shadow-primary/5">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-primary uppercase tracking-wider mb-0.5 font-semibold">
                  Enterprise & Team
                </div>
                <h3 className="font-display text-2xl font-bold text-white tracking-wide">PRO PLAN</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For SOC teams, red team operators, and security organizations.
                </p>
              </div>
            </div>

            <div className="my-6 pt-4 border-t border-white/5">
              <div className="text-3xl font-bold text-white font-display">
                Custom <span className="text-xs text-muted-foreground font-sans font-normal">/ team pricing</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "Unlimited concurrent container deployments",
                "8-hour extended session limits & pause/resume",
                "Custom CTF arena & private lab authoring",
                "Dedicated container clusters with zero cold starts",
                "Team scoring leaderboards & exportable audit reports",
                "Priority 24/7 support directly from ZeroDay engineers",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono text-primary text-center opacity-80 cursor-not-allowed"
            >
              PRE-REGISTER INTEREST
            </button>
          </div>
        </div>
      </div>

      {/* Quota & Resource Overview */}
      <div className="glass-card p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-cyan" />
          Resource Quotas & Execution Engine
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-background/50 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2">
              <Cpu className="w-4 h-4 text-accent-cyan" />
              <div className="text-xs font-medium text-foreground">Container Allocation</div>
            </div>
            <div className="text-lg font-bold text-white font-mono">3 / 3 Active</div>
            <div className="text-[10px] text-muted-foreground mt-1">Simultaneous isolated Docker instances</div>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2">
              <Clock className="w-4 h-4 text-secondary" />
              <div className="text-xs font-medium text-foreground">Execution Window</div>
            </div>
            <div className="text-lg font-bold text-white font-mono">60 mins / lab</div>
            <div className="text-[10px] text-muted-foreground mt-1">Automatic graceful teardown after expiry</div>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-white/5">
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <div className="text-xs font-medium text-foreground">Platform Security</div>
            </div>
            <div className="text-lg font-bold text-white font-mono">ZeroDay Range</div>
            <div className="text-[10px] text-muted-foreground mt-1">Strict network isolation per operator session</div>
          </div>
        </div>
      </div>
    </div>
  );
}
