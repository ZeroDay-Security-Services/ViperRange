// ViperRange — Audit Logger
// ZeroDay Security Services

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

export interface AuditEvent {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Prisma.InputJsonValue;
  request?: NextRequest;
}

export async function auditLog(event: AuditEvent): Promise<void> {
  try {
    const ipAddress = event.request
      ? getClientIp(event.request)
      : null;
    const userAgent = event.request
      ? event.request.headers.get("user-agent")
      : null;

    await prisma.auditLog.create({
      data: {
        userId: event.userId ?? null,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId ?? null,
        ipAddress,
        userAgent,
        metadata: event.metadata ?? {},
      },
    });
  } catch (err) {
    // Audit logging failure should never block the main flow
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Pre-defined action constants
export const AUDIT_ACTIONS = {
  // Auth
  USER_REGISTERED: "user.registered",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_LOGIN_FAILED: "user.login_failed",

  // Deployments
  DEPLOYMENT_CREATED: "deployment.created",
  DEPLOYMENT_STOPPED: "deployment.stopped",
  DEPLOYMENT_DELETED: "deployment.deleted",

  // Labs
  LAB_VIEWED: "lab.viewed",
  LAB_CREATED: "lab.created",
  LAB_UPDATED: "lab.updated",

  // Admin
  ADMIN_USER_UPDATED: "admin.user_updated",
  ADMIN_LAB_CREATED: "admin.lab_created",

  // API Keys
  API_KEY_CREATED: "api_key.created",
  API_KEY_REVOKED: "api_key.revoked",
} as const;
