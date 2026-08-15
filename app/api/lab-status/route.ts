// ViperRange — Lab Status API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getServiceStatus } from "@/lib/api/render";
import type { DeploymentStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId?: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const deploymentId = params.deploymentId ?? request.nextUrl.searchParams.get("deploymentId");
  if (!deploymentId) {
    return NextResponse.json({ success: false, error: "deploymentId is required." }, { status: 400 });
  }

  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { lab: { select: { name: true, slug: true } } },
  });

  if (!deployment) {
    return NextResponse.json({ success: false, error: "Deployment not found." }, { status: 404 });
  }

  // Authorization
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (deployment.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  // If already in terminal state, return as-is
  if (["READY", "STOPPED", "FAILED", "SLEEPING"].includes(deployment.status)) {
    return NextResponse.json({
      success: true,
      data: {
        deploymentId: deployment.id,
        status: deployment.status,
        publicUrl: deployment.publicUrl,
        labName: deployment.lab?.name,
        startedAt: deployment.startedAt,
        readyAt: deployment.readyAt,
        errorMessage: deployment.errorMessage,
      },
    });
  }

  // Poll Render for live status if we have a service ID
  let currentStatus = deployment.status as DeploymentStatus;
  let publicUrl = deployment.publicUrl;

  if (deployment.renderServiceId && deployment.status === "WARMING") {
    try {
      const renderStatus = await getServiceStatus(deployment.renderServiceId);

      if (renderStatus.status === "live") {
        currentStatus = "READY";
        publicUrl = renderStatus.url;

        await prisma.deployment.update({
          where: { id: deploymentId },
          data: {
            status: "READY",
            publicUrl: renderStatus.url,
            readyAt: new Date(),
          },
        });

        await prisma.deploymentLog.create({
          data: {
            deploymentId,
            level: "INFO",
            source: "render",
            message: `Lab is ready at ${renderStatus.url}`,
          },
        });
      } else if (renderStatus.status === "build_failed" || renderStatus.status === "deactivated") {
        currentStatus = "FAILED";
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: { status: "FAILED", errorMessage: `Render status: ${renderStatus.status}` },
        });
      }
    } catch (err) {
      console.error("[LabStatus] Render poll error:", err);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      deploymentId: deployment.id,
      status: currentStatus,
      publicUrl,
      labName: deployment.lab?.name,
      startedAt: deployment.startedAt,
      readyAt: deployment.readyAt,
      errorMessage: deployment.errorMessage,
    },
  });
}
