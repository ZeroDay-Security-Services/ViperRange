"use client";

import { Users, Activity, Zap, FileText, Shield } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface AdminStatsProps {
  totalUsers: number;
  totalDeployments: number;
  activeLabs: number;
  users: Array<{ id: string; name: string | null; email: string; role: string; createdAt: Date }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    resource: string;
    ipAddress: string | null;
    createdAt: Date;
    user: { name: string | null; email: string } | null;
  }>;
}

export function AdminStats({ totalUsers, totalDeployments, activeLabs, users, recentAuditLogs }: AdminStatsProps) {
  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-accent-cyan", bg: "bg-accent-cyan/10 border-accent-cyan/20" },
    { label: "Total Deployments", value: totalDeployments, icon: Activity, color: "text-accent-purple", bg: "bg-accent-purple/10 border-accent-purple/20" },
    { label: "Active Labs", value: activeLabs, icon: Zap, color: "text-status-ready", bg: "bg-status-ready/10 border-status-ready/20" },
    { label: "Audit Events", value: recentAuditLogs.length, icon: FileText, color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className={`w-9 h-9 rounded-lg border ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div className="font-display text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-xs text-muted-foreground font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Users table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-cyan" />
              Recent Users
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono">
                    {(u.name ?? u.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-foreground">{u.name ?? "Unnamed"}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.role === "ADMIN" && (
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatRelativeTime(u.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-secondary" />
              Audit Log
            </h3>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto thin-scrollbar">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-mono text-accent-cyan">{log.action}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {log.user?.email ?? "system"} · {log.resource}
                  {log.ipAddress && <span> · {log.ipAddress}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
