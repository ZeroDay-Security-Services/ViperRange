// ViperRange — Dashboard Overview
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { Activity, FlaskConical, CheckCircle2, Clock, Zap } from "lucide-react";
import { formatRelativeTime, getStatusColor, getStatusDot } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Overview" };

async function getDashboardData(userId: string, isAdmin: boolean) {
  const [totalDeployments, activeDeployments, totalLabs, recentDeployments] =
    await Promise.all([
      prisma.deployment.count({ where: isAdmin ? {} : { userId } }),
      prisma.deployment.count({
        where: {
          ...(isAdmin ? {} : { userId }),
          status: { in: ["READY", "DEPLOYING", "WARMING"] },
        },
      }),
      prisma.lab.count({ where: { isActive: true } }),
      prisma.deployment.findMany({
        where: isAdmin ? {} : { userId },
        include: { lab: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return { totalDeployments, activeDeployments, totalLabs, recentDeployments };
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const isAdmin = user.role === "ADMIN";
  const data = await getDashboardData(user.id, isAdmin);

  const stats = [
    {
      label: "Total Deployments",
      value: data.totalDeployments,
      icon: Activity,
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10 border-accent-cyan/20",
      change: "All time",
    },
    {
      label: "Active Labs",
      value: data.activeDeployments,
      icon: Zap,
      color: "text-status-ready",
      bg: "bg-status-ready/10 border-status-ready/20",
      change: "Running now",
    },
    {
      label: "Available Labs",
      value: data.totalLabs,
      icon: FlaskConical,
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20",
      change: "In Arena",
    },
    {
      label: "Completed",
      value: data.totalDeployments - data.activeDeployments,
      icon: CheckCircle2,
      color: "text-accent-purple",
      bg: "bg-accent-purple/10 border-accent-purple/20",
      change: "Sessions done",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Welcome back,{" "}
          <span className="text-primary">{user.name?.split(" ")[0] ?? "Operator"}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data.activeDeployments > 0
            ? `You have ${data.activeDeployments} active lab${data.activeDeployments > 1 ? "s" : ""} running.`
            : "No active labs. Ready to launch one?"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg border ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-white mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs text-foreground font-medium mb-0.5">{stat.label}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Deployments
          </h3>
          {data.recentDeployments.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No deployments yet.</p>
              <Link
                href="/labs"
                className="text-xs text-primary hover:text-primary-light transition-colors mt-2 inline-block"
              >
                Browse labs →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentDeployments.map((dep: { id: string; status: string; createdAt: Date; lab: { name: string; slug: string } | null }) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(dep.status)} shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-sm text-foreground font-medium truncate">
                        {dep.lab?.name ?? "Unknown Lab"}
                      </div>
                      <div className={`text-[10px] font-mono ${getStatusColor(dep.status)}`}>
                        {dep.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono shrink-0 ml-2">
                    {formatRelativeTime(dep.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick launch */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            Quick Launch
          </h3>
          <div className="space-y-2.5">
            {[
              { name: "Crawler Protocol", slug: "crawler-protocol", diff: "Beginner", color: "text-status-ready" },
              { name: "Session Architect", slug: "session-architect", diff: "Beginner", color: "text-status-ready" },
              { name: "File Oracle", slug: "file-oracle", diff: "Intermediate", color: "text-secondary" },
            ].map((lab) => (
              <Link
                key={lab.slug}
                href="/labs"
                className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 transition-all duration-200 group"
              >
                <span className="text-sm text-foreground group-hover:text-white transition-colors">
                  {lab.name}
                </span>
                <span className={`text-[10px] font-mono ${lab.color}`}>{lab.diff}</span>
              </Link>
            ))}
            <Link
              href="/labs"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors font-medium mt-1"
            >
              View all labs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
