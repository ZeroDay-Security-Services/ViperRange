"use client";

import { useState, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import type { SessionUser } from "@/types";

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Background grid — decorative */}
      <div className="fixed inset-0 cyber-grid opacity-15 pointer-events-none" aria-hidden="true" />

      {/* Sidebar (permanent on lg, drawer on md/sm) */}
      <DashboardSidebar
        user={user}
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main content area — ml-64 only on lg where permanent sidebar lives */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardHeader user={user} onMenuToggle={openSidebar} />
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom tab bar — shown below lg breakpoint */}
      <MobileNav />
    </div>
  );
}
