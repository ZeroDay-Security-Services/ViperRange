// ViperRange — Dashboard Layout (Server Component)
// ZeroDay Security Services

import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/helpers";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAuth redirects to /login if unauthenticated
  const user = await requireAuth();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
