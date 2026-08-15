// ViperRange — Profile Page
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { Activity, CheckCircle2, Shield, Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

async function getProfile(userId: string) {
  const [user, stats, completionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, role: true, bio: true, totalPoints: true, createdAt: true },
    }),
    prisma.deployment.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.labCompletion.count({
      where: { userId },
    }),
  ]);

  const totalDeployments = stats.reduce((sum: number, s: { _count: number }) => sum + s._count, 0);

  return { user, totalDeployments, completedDeployments: completionCount };
}

export default async function ProfilePage() {
  const currentUser = await requireAuth();
  const { user, totalDeployments, completedDeployments } = await getProfile(currentUser.id);

  if (!user) return null;

  const statCards = [
    {
      label: "Total Deployments",
      value: totalDeployments,
      icon: Activity,
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10 border-accent-cyan/20",
    },
    {
      label: "Completed Labs",
      value: completedDeployments,
      icon: CheckCircle2,
      color: "text-status-ready",
      bg: "bg-status-ready/10 border-status-ready/20",
    },
    {
      label: "Earned Points",
      value: user.totalPoints ?? 0,
      icon: Trophy,
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20",
    },
    {
      label: "Access Level",
      value: user.role,
      icon: Shield,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Operator Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your operator identity, bio, and platform training credentials.
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl border ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profile Form */}
      <ProfileEditor user={user} />
    </div>
  );
}
