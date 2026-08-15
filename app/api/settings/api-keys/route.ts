// ViperRange — API Keys Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/utils";
import { auditLog, AUDIT_ACTIONS } from "@/lib/utils/audit";

const createSchema = z.object({
  name: z.string().min(1).max(40).trim(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const keyCount = await prisma.aPIKey.count({
    where: { userId: session.user.id, isActive: true },
  });

  if (keyCount >= 5) {
    return NextResponse.json(
      { success: false, error: "Maximum of 5 active API keys allowed." },
      { status: 400 }
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Invalid body." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message }, { status: 422 });
  }

  const rawKey = generateApiKey();
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.slice(0, 10);

  const apiKey = await prisma.aPIKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
    },
  });

  await auditLog({
    userId: session.user.id,
    action: AUDIT_ACTIONS.API_KEY_CREATED,
    resource: "api_key",
    resourceId: apiKey.id,
    request,
  });

  return NextResponse.json({
    success: true,
    data: {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      keyPrefix,
      createdAt: apiKey.createdAt.toISOString(),
    },
  }, { status: 201 });
}
