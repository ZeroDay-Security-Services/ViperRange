// ViperRange — Lab Hints API
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

interface StoredHint {
  order: number;
  text: string;
  pointsPenalty?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const upTo = Math.max(1, parseInt(searchParams.get("upTo") ?? "1", 10));

  const lab = await prisma.lab.findUnique({
    where: { slug: params.slug, isActive: true },
    select: { hints: true },
  });

  if (!lab) {
    return NextResponse.json({ success: false, error: "Lab not found." }, { status: 404 });
  }

  const allHints = (lab.hints as unknown as StoredHint[] | null) ?? [];
  const revealed = allHints
    .filter((h) => h.order <= upTo)
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({
    success: true,
    data: {
      hints: revealed,
      totalHints: allHints.length,
    },
  });
}
