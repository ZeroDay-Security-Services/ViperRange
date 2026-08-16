// ViperRange — Labs API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { type Prisma, type LabCategory, type LabType } from "@prisma/client";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { ensureLabsSeeded } from "@/lib/db/seed-data";

// GET /api/labs — list active labs (authenticated). Never exposes expectedFlagHash.
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  // Auto-seed if database is empty
  const totalCount = await prisma.lab.count();
  if (totalCount === 0) {
    await ensureLabsSeeded();
  }

  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const labType = searchParams.get("labType");
  const featured = searchParams.get("featured");

  const where: Prisma.LabWhereInput = {
    isActive: true,
    ...(category ? { category: category as LabCategory } : {}),
    ...(labType ? { labType: labType as LabType } : {}),
    ...(featured === "true" ? { isFeatured: true } : {}),
  };

  const labs = await prisma.lab.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      difficulty: true,
      labType: true,
      tags: true,
      port: true,
      isActive: true,
      isFeatured: true,
      estimatedDeployTime: true,
      maxDuration: true,
      points: true,
      hints: true,
      resources: true,
      createdAt: true,
      updatedAt: true,
      // dockerImage intentionally omitted from public API
      // expectedFlagHash intentionally omitted from public API
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ success: true, data: { labs } });
}
