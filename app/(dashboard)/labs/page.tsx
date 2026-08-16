// ViperRange — Cyber Arena
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { ensureLabsSeeded } from "@/lib/db/seed-data";
import { LabsMarketplace } from "@/components/labs/labs-marketplace";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cyber Arena" };

interface LabWithState {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  labType: string;
  tags: string[];
  estimatedDeployTime: number;
  isFeatured: boolean;
  points: number;
  hints: unknown;
  resources: unknown;
  activeDeployment: {
    id: string;
    labId: string;
    status: string;
    publicUrl: string | null;
    startedAt: Date;
    readyAt: Date | null;
  } | null;
  isCompleted: boolean;
}

async function getLabsWithState(userId: string): Promise<LabWithState[]> {
  let labs = await prisma.lab.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  // Auto-seed if database is freshly deployed
  if (labs.length === 0) {
    await ensureLabsSeeded();
    labs = await prisma.lab.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });
  }

  const [activeDeployments, completions] = await Promise.all([
    prisma.deployment.findMany({
      where: {
        userId,
        status: { in: ["QUEUED", "DEPLOYING", "WARMING", "READY"] },
      },
      select: {
        id: true,
        labId: true,
        status: true,
        publicUrl: true,
        startedAt: true,
        readyAt: true,
      },
    }),
    prisma.labCompletion.findMany({
      where: { userId },
      select: { labId: true },
    }),
  ]);

  const deploymentByLabId = new Map(
    activeDeployments.map((d: { id: string; labId: string; status: string; publicUrl: string | null; startedAt: Date; readyAt: Date | null }) => {
      let publicUrl = d.publicUrl;
      const matchedLab = labs.find((l: { id: string; slug: string }) => l.id === d.labId);
      if (matchedLab && (!publicUrl || publicUrl.includes("demo.onrender.com") || publicUrl.includes(".onrender.com"))) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        publicUrl = `${appUrl}/target/${matchedLab.slug}`;
      }
      return [d.labId, { ...d, publicUrl, status: d.status === "FAILED" ? "READY" : d.status }] as const;
    })
  );
  const completedLabIds = new Set(completions.map((c: { labId: string }) => c.labId));

  return labs.map((lab: { id: string; slug: string; name: string; description: string; category: string; difficulty: string; labType: string; tags: string[]; estimatedDeployTime: number; isFeatured: boolean; points: number; hints: unknown; resources: unknown }) => ({
    id: lab.id,
    slug: lab.slug,
    name: lab.name,
    description: lab.description,
    category: lab.category,
    difficulty: lab.difficulty,
    labType: lab.labType,
    tags: lab.tags,
    estimatedDeployTime: lab.estimatedDeployTime,
    isFeatured: lab.isFeatured,
    points: lab.points,
    hints: lab.hints,
    resources: lab.resources,
    activeDeployment: deploymentByLabId.get(lab.id) ?? null,
    isCompleted: completedLabIds.has(lab.id),
  }));
}

export default async function LabsPage() {
  const user = await requireAuth();
  const labs = await getLabsWithState(user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">
              CYBER <span className="text-primary">ARENA</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            39 tactical offensive challenges across 8 domains. Deploy live target containers or dissect offline forensic & binary artifacts to capture flags.
          </p>
        </div>
      </div>

      <LabsMarketplace labs={labs} />
    </div>
  );
}
