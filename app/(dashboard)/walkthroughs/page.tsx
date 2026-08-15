// ViperRange — Walkthroughs Page
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { WalkthroughViewer } from "@/components/dashboard/walkthrough-viewer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Walkthroughs" };

async function getWalkthroughs() {
  return prisma.walkthrough.findMany({
    include: { lab: { select: { name: true, slug: true } } },
    orderBy: [{ lab: { name: "asc" } }, { order: "asc" }],
  });
}

export default async function WalkthroughsPage() {
  await requireAuth();
  const walkthroughs = await getWalkthroughs();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Walkthroughs</h2>
        <p className="text-sm text-muted-foreground">
          Step-by-step guides for testing your own lab environments using industry-standard security tools.
        </p>
      </div>
      <WalkthroughViewer walkthroughs={walkthroughs} />
    </div>
  );
}
