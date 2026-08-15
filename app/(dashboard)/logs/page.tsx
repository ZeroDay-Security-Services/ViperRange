// ViperRange — Logs Page
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { LiveTerminal } from "@/components/logs/live-terminal";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Security Logs" };

interface ActiveDeployment {
  id: string;
  labName: string;
  status: string;
}

interface LogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  timestamp: string;
}

async function getPageData(userId: string, isAdmin: boolean) {
  const activeDeployments = await prisma.deployment.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: { in: ["READY", "DEPLOYING", "WARMING", "QUEUED"] },
    },
    include: { lab: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const recentDeployments = await prisma.deployment.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true },
  });

  const rawLogs = await prisma.deploymentLog.findMany({
    where: { deploymentId: { in: recentDeployments.map((d: { id: string }) => d.id) } },
    orderBy: { timestamp: "desc" },
    take: 200,
  });

  const terminalDeployments: ActiveDeployment[] = activeDeployments.map((d: { id: string; status: string; lab: { name: string } | null }) => ({
    id: d.id,
    labName: d.lab?.name ?? "Unknown Lab",
    status: d.status,
  }));

  const logs: LogEntry[] = rawLogs.map((l: { id: string; level: string; message: string; source: string; timestamp: Date }) => ({
    id: l.id,
    level: l.level,
    message: l.message,
    source: l.source,
    timestamp: l.timestamp.toISOString(),
  }));

  return { terminalDeployments, logs };
}

export default async function LogsPage() {
  const user = await requireAuth();
  const isAdmin = user.role === "ADMIN";
  const { terminalDeployments, logs } = await getPageData(user.id, isAdmin);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Security Logs</h2>
        <p className="text-sm text-muted-foreground">
          Live telemetry from your lab environments. All logs are simulated training data clearly labeled as such.
        </p>
      </div>
      <LiveTerminal initialLogs={logs} deployments={terminalDeployments} />
    </div>
  );
}
