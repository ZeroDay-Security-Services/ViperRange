// ViperRange — Stop Lab API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { suspendService } from "@/lib/api/render";
import { auditLog, AUDIT_ACTIONS } from "@/lib/utils/audit";

const stopLabSchema = z.object({
  deploymentId: z.string().cuid("Invalid deployment ID"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = stopLabSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message },
      { status: 422 }
    );
  }

  const { deploymentId } = parsed.data;

  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    select: { id: true, userId: true, status: true, renderServiceId: true, labId: true },
  });

  if (!deployment) {
    return NextResponse.json({ success: false, error: "Deployment not found." }, { status: 404 });
  }

  // Authorization: owner or admin
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (deployment.userId !== userId && !isAdmin) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  if (deployment.status === "STOPPED" || deployment.status === "FAILED") {
    return NextResponse.json(
      { success: false, error: "Deployment is already stopped." },
      { status: 400 }
    );
  }

  // Suspend on Render (non-blocking)
  if (deployment.renderServiceId) {
    suspendService(deployment.renderServiceId).catch((err) =>
      console.error("[StopLab] Suspend error:", err)
    );
  }

  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: "STOPPED", stoppedAt: new Date() },
  });

  await prisma.deploymentLog.create({
    data: {
      deploymentId,
      level: "INFO",
      source: "orchestrator",
      message: `Lab stopped by user ${userId}`,
    },
  });

  await auditLog({
    userId,
    action: AUDIT_ACTIONS.DEPLOYMENT_STOPPED,
    resource: "deployment",
    resourceId: deploymentId,
    request,
  });

  return NextResponse.json({
    success: true,
    message: "Lab stopped successfully.",
    data: { deploymentId, status: "STOPPED" },
  });
}
