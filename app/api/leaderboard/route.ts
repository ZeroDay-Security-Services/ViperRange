// ViperRange — Leaderboard API
// ZeroDay Security Services

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const topUsers = await prisma.user.findMany({
    where: { totalPoints: { gt: 0 } },
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      _count: { select: { completions: true } },
    },
    orderBy: { totalPoints: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: {
      leaderboard: topUsers.map((u: { id: string; name: string | null; email: string; totalPoints: number; _count: { completions: number } }, i: number) => ({
        rank: i + 1,
        id: u.id,
        name: u.name,
        totalPoints: u.totalPoints,
        labsCompleted: u._count.completions,
      })),
    },
  });
}
