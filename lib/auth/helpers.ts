// ViperRange — Auth Helpers
// ZeroDay Security Services

import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import type { UserRole, SessionUser } from "@/types";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    STUDENT: 0,
    INSTRUCTOR: 1,
    ADMIN: 2,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
