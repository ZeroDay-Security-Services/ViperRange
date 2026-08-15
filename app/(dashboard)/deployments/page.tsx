// ViperRange — Deployments Page
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { DeploymentTable } from "@/components/dashboard/deployment-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Deployments" };

async function getDeployments(userId: string, isAdmin: boolean) {
  return prisma.deployment.findMany({
    where: isAdmin ? {} : { userId },
    include: {
      lab: { select: { name: true, slug: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export default async function DeploymentsPage() {
  const user = await requireAuth();
  const isAdmin = user.role === "ADMIN";
  const deployments = await getDeployments(user.id, isAdmin);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Deployments</h2>
        <p className="text-sm text-muted-foreground">
          All your lab sessions — active and historical.
        </p>
      </div>
      <DeploymentTable deployments={deployments} />
    </div>
  );
}
