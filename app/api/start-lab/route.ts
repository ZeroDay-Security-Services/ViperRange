// ViperRange — Start Lab API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { createOrDeployLabService } from "@/lib/api/render";
import { rateLimit, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { auditLog, AUDIT_ACTIONS } from "@/lib/utils/audit";

const startLabSchema = z.object({
  labId: z.string().cuid("Invalid lab ID"),
});

export async function POST(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // ── Rate limit: 5 lab starts per minute per user ──────────────────────────
  const rl = await rateLimit(`start-lab:${userId}`, "deploy");
  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many deployment requests. Please wait before starting another lab.",
      },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = startLabSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed." },
      { status: 422 }
    );
  }

  const { labId } = parsed.data;

  // ── Validate lab exists ───────────────────────────────────────────────────
  const lab = await prisma.lab.findUnique({
    where: { id: labId, isActive: true },
  });

  if (!lab) {
    return NextResponse.json(
      { success: false, error: "Lab not found or not available." },
      { status: 404 }
    );
  }

  if (lab.labType !== "DEPLOYABLE" || !lab.dockerImage) {
    return NextResponse.json(
      { success: false, error: "This lab is an offline challenge and cannot be deployed." },
      { status: 400 }
    );
  }

  // ── Check for active deployment of this lab by this user ─────────────────
  const existingDeployment = await prisma.deployment.findFirst({
    where: {
      userId,
      labId,
      status: { in: ["QUEUED", "DEPLOYING", "WARMING", "READY"] },
    },
  });

  if (existingDeployment) {
    return NextResponse.json(
      {
        success: true,
        message: "Lab is already running.",
        data: {
          deploymentId: existingDeployment.id,
          status: existingDeployment.status,
          publicUrl: existingDeployment.publicUrl,
        },
      },
      { status: 200 }
    );
  }

  // ── In Local Dev mode, immediately activate deployment ──────────────────
  const isLocalOrDev =
    process.env.LOCAL_LABS_ENABLED === "true" ||
    process.env.RENDER_API_KEY === "development_bypass" ||
    !process.env.RENDER_API_KEY;

  if (isLocalOrDev) {
    const result = await createOrDeployLabService({
      labSlug: lab.slug,
      labName: lab.name,
      dockerImage: lab.dockerImage,
      port: lab.port ?? 3000,
    });

    const deployment = await prisma.deployment.create({
      data: {
        userId,
        labId,
        status: "READY",
        renderServiceId: result.serviceId,
        renderDeployId: result.deployId,
        publicUrl: result.url,
        readyAt: new Date(),
        expiresAt: new Date(Date.now() + lab.maxDuration * 1000),
      },
    });

    await prisma.deploymentLog.create({
      data: {
        deploymentId: deployment.id,
        level: "INFO",
        source: "system",
        message: `Lab is ready at ${result.url}`,
      },
    });

    await auditLog({
      userId,
      action: AUDIT_ACTIONS.DEPLOYMENT_CREATED,
      resource: "deployment",
      resourceId: deployment.id,
      request,
      metadata: { labId, labSlug: lab.slug },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lab started successfully.",
        data: {
          deploymentId: deployment.id,
          status: "READY",
          publicUrl: result.url,
        },
      },
      { status: 200 }
    );
  }

  // ── Cloud Production Deployment on Render ─────────────────────────────────
  const deployment = await prisma.deployment.create({
    data: {
      userId,
      labId,
      status: "QUEUED",
      expiresAt: new Date(Date.now() + lab.maxDuration * 1000),
    },
  });

  // ── Trigger async deployment (non-blocking) ───────────────────────────────
  triggerDeployment(deployment.id, lab.slug, lab.name, lab.dockerImage, lab.port ?? 3000, request).catch(
    (err) => console.error("[StartLab] Background deploy error:", err)
  );

  await auditLog({
    userId,
    action: AUDIT_ACTIONS.DEPLOYMENT_CREATED,
    resource: "deployment",
    resourceId: deployment.id,
    request,
    metadata: { labId, labSlug: lab.slug },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Lab deployment queued.",
      data: {
        deploymentId: deployment.id,
        status: "QUEUED",
        publicUrl: null,
      },
    },
    { status: 202 }
  );
}

async function triggerDeployment(
  deploymentId: string,
  labSlug: string,
  labName: string,
  dockerImage: string,
  port: number,
  _request: NextRequest
) {
  try {
    // Mark as deploying
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "DEPLOYING" },
    });

    await prisma.deploymentLog.create({
      data: {
        deploymentId,
        level: "INFO",
        source: "orchestrator",
        message: `Starting deployment of ${labName} (${dockerImage})`,
      },
    });

    const result = await createOrDeployLabService({
      labSlug,
      labName,
      dockerImage,
      port,
    });

    await prisma.deploymentLog.create({
      data: {
        deploymentId,
        level: "INFO",
        source: "render",
        message: `Service created: ${result.serviceId} | Deploy: ${result.deployId}${result.isDev ? " [DEV MODE]" : ""}`,
      },
    });

    // Update with Render IDs and warming status
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: "WARMING",
        renderServiceId: result.serviceId,
        renderDeployId: result.deployId,
        publicUrl: result.url,
      },
    });

    // In dev mode, immediately set to READY
    if (result.isDev) {
      await new Promise((r) => setTimeout(r, 1500));
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: "READY", readyAt: new Date() },
      });
      await prisma.deploymentLog.create({
        data: {
          deploymentId,
          level: "INFO",
          source: "system",
          message: `[DEV] Lab is ready at ${result.url}`,
        },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown deployment error";
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "FAILED", errorMessage: message },
    }).catch(() => null);

    await prisma.deploymentLog.create({
      data: {
        deploymentId,
        level: "ERROR",
        source: "orchestrator",
        message: `Deployment failed: ${message}`,
      },
    }).catch(() => null);
  }
}
