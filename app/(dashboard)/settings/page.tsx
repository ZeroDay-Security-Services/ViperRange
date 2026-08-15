// ViperRange — Settings Page
// ZeroDay Security Services

import { requireAuth } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

async function getApiKeys(userId: string) {
  return prisma.aPIKey.findMany({
    where: { userId, isActive: true },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function SettingsPage() {
  const user = await requireAuth();
  const apiKeys = await getApiKeys(user.id);

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-6xl">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Account & Security Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your developer API keys, session tokens, and security preferences.</p>
      </div>
      <SettingsPanel apiKeys={apiKeys} userRole={user.role} userEmail={user.email} />
    </div>
  );
}
