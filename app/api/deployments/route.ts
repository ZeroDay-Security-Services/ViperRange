// ViperRange — Deployments API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { type Prisma, type DeploymentStatus } from "@prisma/client";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const status = searchParams.get("status");
  const skip = (page - 1) * pageSize;

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  const where: Prisma.DeploymentWhereInput = {
    ...(isAdmin ? {} : { userId: session.user.id }),
    ...(status ? { status: status as DeploymentStatus } : {}),
  };

  const [deployments, total] = await Promise.all([
    prisma.deployment.findMany({
      where,
      include: {
        lab: { select: { name: true, slug: true, category: true, difficulty: true } },
        user: isAdmin ? { select: { name: true, email: true } } : false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.deployment.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items: deployments,
      total,
      page,
      pageSize,
      hasMore: skip + deployments.length < total,
    },
  });
}
