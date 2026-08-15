// ViperRange — Admin Panel
// ZeroDay Security Services

import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { AdminStats } from "@/components/dashboard/admin-stats";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Panel" };

async function getAdminStats() {
  const [totalUsers, totalDeployments, activeLabs, recentAuditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.deployment.count(),
    prisma.deployment.count({ where: { status: { in: ["READY", "DEPLOYING", "WARMING"] } } }),
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return { totalUsers, totalDeployments, activeLabs, recentAuditLogs, users };
}

export default async function AdminPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">
            ZeroDay Security Services — Platform Administration
          </p>
        </div>
        <div className="ml-auto px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-mono text-primary">
          ADMIN
        </div>
      </div>
      <AdminStats {...stats} />
    </div>
  );
}
