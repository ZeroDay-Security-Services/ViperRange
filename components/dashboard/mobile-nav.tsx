"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Activity,
  Terminal,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/dashboard",    label: "Overview", icon: LayoutDashboard },
  { href: "/labs",         label: "Labs",     icon: FlaskConical },
  { href: "/deployments",  label: "Deploys",  icon: Activity },
  { href: "/logs",         label: "Logs",     icon: Terminal },
  { href: "/walkthroughs", label: "Guides",   icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    // Only visible below lg (1024px) — same breakpoint where permanent sidebar hides
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-md safe-area-pb"
    >
      <div className="flex items-stretch justify-around h-16 px-1">
        {MOBILE_NAV.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // relative so the active bar positions correctly inside this item
                "relative flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator bar at top of tab */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                />
              )}

              <item.icon
                className={cn(
                  "w-5 h-5 transition-all duration-200 shrink-0",
                  isActive && "drop-shadow-[0_0_6px_rgba(255,51,68,0.85)]"
                )}
              />
              <span className="text-[9px] font-mono uppercase tracking-wider leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
