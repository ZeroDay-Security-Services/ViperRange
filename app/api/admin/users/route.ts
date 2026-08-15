// ViperRange — Admin API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { auditLog, AUDIT_ACTIONS } from "@/lib/utils/audit";
import type { Session } from "next-auth";

function requireAdminSession(session: Session | null): "unauthenticated" | "forbidden" | null {
  if (!session?.user?.id) return "unauthenticated";
  if ((session.user as { role?: string }).role !== "ADMIN") return "forbidden";
  return null;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const authError = requireAdminSession(session);
  if (authError === "unauthenticated")
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  if (authError === "forbidden")
    return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20", 10));
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { deployments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: { items: users, total, page, pageSize, hasMore: skip + users.length < total },
  });
}

const patchSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const authError = requireAdminSession(session);
  if (authError === "unauthenticated")
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  if (authError === "forbidden")
    return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message }, { status: 422 });

  const { userId, role } = parsed.data;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  await auditLog({
    userId: session!.user!.id!,
    action: AUDIT_ACTIONS.ADMIN_USER_UPDATED,
    resource: "user",
    resourceId: userId,
    request,
    metadata: { newRole: role },
  });

  return NextResponse.json({ success: true, data: updated });
}
