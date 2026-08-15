// ViperRange — Logs API Route (SSE + REST)
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { getServiceLogs, generateSimulatedTrainingLogs } from "@/lib/api/render";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const deploymentId = searchParams.get("deploymentId");
  const stream = searchParams.get("stream") === "true";

  if (!deploymentId) {
    return NextResponse.json({ success: false, error: "deploymentId is required." }, { status: 400 });
  }

  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    select: { userId: true, renderServiceId: true, status: true },
  });

  if (!deployment) {
    return NextResponse.json({ success: false, error: "Deployment not found." }, { status: 404 });
  }

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (deployment.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  // ── SSE streaming mode ─────────────────────────────────────────────────────
  if (stream) {
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        function send(data: object) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }

        // Send existing DB logs first
        const dbLogs = await prisma.deploymentLog.findMany({
          where: { deploymentId },
          orderBy: { timestamp: "asc" },
          take: 200,
        });

        for (const log of dbLogs) {
          send({
            id: log.id,
            level: log.level,
            message: log.message,
            source: log.source,
            timestamp: log.timestamp.toISOString(),
          });
        }

        // Stream simulated training telemetry
        const trainingLogs = generateSimulatedTrainingLogs();
        for (const log of trainingLogs) {
          send(log);
          await new Promise((r) => setTimeout(r, 150));
        }

        // Keep alive ping every 25s
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keepalive\n\n"));
          } catch {
            clearInterval(keepAlive);
          }
        }, 25_000);

        // Close after 5 minutes of streaming
        setTimeout(() => {
          clearInterval(keepAlive);
          controller.close();
        }, 5 * 60 * 1000);
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // ── Regular REST response ──────────────────────────────────────────────────
  const [dbLogs, renderLogs] = await Promise.allSettled([
    prisma.deploymentLog.findMany({
      where: { deploymentId },
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
    deployment.renderServiceId
      ? getServiceLogs(deployment.renderServiceId)
      : Promise.resolve([]),
  ]);

  const logs = [
    ...(dbLogs.status === "fulfilled" ? dbLogs.value : []),
    ...(renderLogs.status === "fulfilled" ? renderLogs.value : []),
  ].sort((a, b) => {
    const aTime = "timestamp" in a ? new Date(a.timestamp).getTime() : 0;
    const bTime = "timestamp" in b ? new Date(b.timestamp).getTime() : 0;
    return bTime - aTime;
  });

  return NextResponse.json({ success: true, data: { logs } });
}
