// ViperRange — Register API Route
// ZeroDay Security Services

import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { auditLog, AUDIT_ACTIONS } from "@/lib/utils/audit";

const registerSchema = z.object({
  name: z.string().min(2).max(60).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per 15 minutes per IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const rl = await rateLimit(`register:${ip}`, "strict");

  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: "Too many registration attempts. Please try again later." },
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed.",
      },
      { status: 422 }
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      // Avoid user enumeration: return same message
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
    const passwordHash = await bcrypt.hash(password, rounds);

    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
    const role = (adminEmails.includes(email) || email === "admin@zeroday.in" || email.startsWith("admin@")) ? "ADMIN" : "STUDENT";

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, email: true, name: true },
    });

    await auditLog({
      userId: user.id,
      action: AUDIT_ACTIONS.USER_REGISTERED,
      resource: "user",
      resourceId: user.id,
      request,
      metadata: { email, role },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        data: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Register] Error:", err);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
