// ViperRange — Delete API Key Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { auditLog, AUDIT_ACTIONS } from "@/lib/utils/audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const apiKey = await prisma.aPIKey.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true },
  });

  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API key not found." }, { status: 404 });
  }

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (apiKey.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  await prisma.aPIKey.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  await auditLog({
    userId: session.user.id,
    action: AUDIT_ACTIONS.API_KEY_REVOKED,
    resource: "api_key",
    resourceId: params.id,
    request,
  });

  return NextResponse.json({ success: true, message: "API key revoked." });
}
