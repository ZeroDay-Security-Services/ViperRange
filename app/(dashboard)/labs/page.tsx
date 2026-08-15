// ViperRange — Lab Marketplace
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { LabsMarketplace } from "@/components/labs/labs-marketplace";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lab Marketplace" };

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
  const [labs, activeDeployments, completions] = await Promise.all([
    prisma.lab.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
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

  const deploymentByLabId = new Map(activeDeployments.map((d: { id: string; labId: string; status: string; publicUrl: string | null; startedAt: Date; readyAt: Date | null }) => [d.labId, d] as const));
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
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Lab Marketplace</h2>
        <p className="text-sm text-muted-foreground">
          39 hands-on challenges across 8 categories. Deploy live environments or work offline artifacts — every lab ends with a flag to submit.
        </p>
      </div>

      <LabsMarketplace labs={labs} />
    </div>
  );
}
