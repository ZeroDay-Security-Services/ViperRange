"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  Activity,
  Terminal,
  BookOpen,
  Settings,
  User,
  CreditCard,
  ShieldAlert,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview",     icon: LayoutDashboard },
  { href: "/labs",       label: "Cyber Arena",  icon: FlaskConical },
  { href: "/deployments",label: "Deployments",  icon: Activity },
  { href: "/logs",       label: "Logs",         icon: Terminal },
  { href: "/walkthroughs",label:"Walkthroughs", icon: BookOpen },
];

const BOTTOM_NAV = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile",  label: "Profile",  icon: User },
  { href: "/billing",  label: "Billing",  icon: CreditCard },
];

interface DashboardSidebarProps {
  user: SessionUser;
  /** controlled by DashboardHeader on mobile/tablet */
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({
  user,
  mobileOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  // Close drawer on route change
  useEffect(() => {
    onClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close drawer on scroll (mobile UX)
  useEffect(() => {
    if (!mobileOpen) return;
    const handleScroll = () => onClose?.();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <aside
      className={cn(
        "flex flex-col h-full w-64 bg-surface/95 backdrop-blur-md border-r border-white/10",
      )}
    >
      {/* Logo */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-black/50 border border-primary/30 flex items-center justify-center group-hover:border-primary/60 transition-all duration-200 shrink-0 p-1 shadow-md shadow-primary/10">
            <Image
              src="/images/viperrange-logo.png"
              alt="ViperRange Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain drop-shadow"
              priority
            />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm tracking-widest">
              VIPER<span className="text-primary">RANGE</span>
            </div>
            <div className="text-[9px] text-muted-foreground tracking-widest font-mono uppercase leading-tight">
              ZeroDay Security
            </div>
          </div>
        </Link>

        {/* Close button — only visible when drawer is open (mobile/tablet) */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto thin-scrollbar">
        <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest px-3 mb-3">
          Navigation
        </div>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-item", isActive(item.href) && "active")}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
            {item.href === "/labs" && (
              <span className="ml-auto text-[10px] bg-primary/20 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-mono">
                4
              </span>
            )}
          </Link>
        ))}

        {user.role === "ADMIN" && (
          <>
            <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest px-3 mt-5 mb-3">
              Admin
            </div>
            <Link
              href="/admin"
              className={cn("nav-item", isActive("/admin") && "active")}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Admin Panel
            </Link>
          </>
        )}

        <div className="mt-6 px-1">
          <Link
            href="/labs"
            className="flex items-center gap-2 w-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
            Launch a Lab
          </Link>
        </div>
      </nav>

      {/* Bottom links */}
      <div className="p-4 border-t border-white/10 space-y-1">
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-item", isActive(item.href) && "active")}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">
            {(user.name ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-foreground truncate">
              {user.name ?? "Operator"}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate">
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: permanent fixed sidebar ─────────────────────── */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40">
        {sidebarContent}
      </div>

      {/* ── Mobile / Tablet: slide-out drawer ────────────────────── */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      {/* Drawer panel */}
      <div
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        {sidebarContent}
      </div>
    </>
  );
}
