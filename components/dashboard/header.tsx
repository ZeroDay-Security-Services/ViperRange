"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, ChevronDown, Shield, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { SessionUser } from "@/types";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Overview",
  "/labs":         "Lab Marketplace",
  "/deployments":  "Deployments",
  "/logs":         "Security Logs",
  "/walkthroughs": "Walkthroughs",
  "/settings":     "Settings",
  "/profile":      "Profile",
  "/admin":        "Admin Panel",
  "/billing":      "Billing",
};

interface DashboardHeaderProps {
  user: SessionUser;
  onMenuToggle: () => void;
}

export function DashboardHeader({ user, onMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path)
    )?.[1] ?? "Dashboard";

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close user dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close user dropdown on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">

        {/* Left: hamburger (mobile/tablet) + page title */}
        <div className="flex items-center gap-3">
          {/* Hamburger — hidden on lg where permanent sidebar shows */}
          <button
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-display text-sm font-bold text-white tracking-widest uppercase leading-tight">
              {title}
            </h1>
            <div className="text-[10px] text-muted-foreground font-mono hidden sm:block">
              VIPERRANGE · ZERODAY SECURITY SERVICES
            </div>
          </div>
        </div>

        {/* Right: status chip + bell + user menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status indicator — hidden on xs to save space */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-ready/10 border border-status-ready/20 text-xs font-mono text-status-ready">
            <span className="w-1.5 h-1.5 rounded-full bg-status-ready animate-pulse" />
            <span className="hidden md:inline">SYSTEM OK</span>
            <span className="md:hidden">OK</span>
          </div>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-[18px] h-[18px]" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="User menu"
              className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">
                {(user.name ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-foreground font-medium max-w-[100px] truncate">
                {user.name ?? "Operator"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-52 glass-card py-1 z-50 animate-slide-in-up shadow-card-hover"
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-medium text-foreground truncate">
                    {user.name ?? "Operator"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-primary font-mono uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
