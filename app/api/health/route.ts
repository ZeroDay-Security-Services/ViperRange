// ViperRange — Health Check
// ZeroDay Security Services

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  const status = dbStatus === "ok" ? "healthy" : "degraded";

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      platform: "ViperRange by ZeroDay Security Services",
      services: { database: dbStatus },
    },
    { status: status === "healthy" ? 200 : 503 }
  );
}
