// ViperRange — Flag Submission API
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { verifyFlag } from "@/lib/utils";
import { rateLimit, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { auditLog } from "@/lib/utils/audit";

const submitSchema = z.object({
  flag: z.string().min(3).max(300),
});

export async function POST(
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

  const userId = session.user.id;

  // Rate limit: 10 submission attempts per minute per user
  const rl = await rateLimit(`flag-submit:${userId}`, "deploy");
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: "Too many submission attempts. Please slow down." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Invalid flag format." },
      { status: 422 }
    );
  }

  const lab = await prisma.lab.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!lab) {
    return NextResponse.json(
      { success: false, error: "Lab not found." },
      { status: 404 }
    );
  }

  const submittedFlag = parsed.data.flag.trim();
  const isCorrect = verifyFlag(submittedFlag, lab.expectedFlagHash);

  // Record every attempt (correct or not)
  await prisma.labSubmission.create({
    data: {
      userId,
      labId: lab.id,
      submittedFlag: isCorrect ? "[correct]" : submittedFlag.slice(0, 100),
      isCorrect,
    },
  });

  if (!isCorrect) {
    return NextResponse.json(
      { success: true, data: { correct: false, message: "Incorrect flag. Keep trying." } },
      { status: 200 }
    );
  }

  // Check if already completed — prevent duplicate point awards
  const existing = await prisma.labCompletion.findUnique({
    where: { userId_labId: { userId, labId: lab.id } },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      data: {
        correct: true,
        alreadyCompleted: true,
        message: "You've already completed this lab.",
        pointsEarned: existing.pointsEarned,
      },
    });
  }

  const attemptCount = await prisma.labSubmission.count({
    where: { userId, labId: lab.id },
  });

  const completion = await prisma.$transaction(async (tx) => {
    const created = await tx.labCompletion.create({
      data: {
        userId,
        labId: lab.id,
        pointsEarned: lab.points,
        attemptCount,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: lab.points } },
    });

    return created;
  });

  await auditLog({
    userId,
    action: "lab.completed",
    resource: "lab",
    resourceId: lab.id,
    request,
    metadata: { slug: lab.slug, points: lab.points, attemptCount },
  });

  return NextResponse.json({
    success: true,
    data: {
      correct: true,
      alreadyCompleted: false,
      message: "Correct! Lab completed.",
      pointsEarned: completion.pointsEarned,
      attemptCount,
    },
  });
}
