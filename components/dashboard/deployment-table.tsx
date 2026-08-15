"use client";

import { useState } from "react";
import { ExternalLink, Search, Filter, ChevronDown } from "lucide-react";
import {
  formatRelativeTime,
  getStatusColor,
  getStatusDot,
  getCategoryLabel,
  cn,
} from "@/lib/utils";


interface DeploymentRow {
  id: string;
  status: string;
  publicUrl: string | null;
  startedAt: Date;
  readyAt: Date | null;
  stoppedAt: Date | null;
  errorMessage: string | null;
  lab: { name: string; slug: string; category: string } | null;
}

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All Statuses" },
  { value: "READY", label: "Ready" },
  { value: "DEPLOYING", label: "Deploying" },
  { value: "WARMING", label: "Warming" },
  { value: "QUEUED", label: "Queued" },
  { value: "STOPPED", label: "Stopped" },
  { value: "FAILED", label: "Failed" },
];

export function DeploymentTable({ deployments }: { deployments: DeploymentRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = deployments.filter((d) => {
    const matchesSearch =
      !search ||
      d.lab?.name.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by lab name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground hover:border-white/20 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 glass-card py-1 z-20">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => { setStatusFilter(f.value); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors",
                      statusFilter === f.value ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Lab", "Status", "Started", "Duration", "URL"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No deployments found.
                </td>
              </tr>
            ) : (
              filtered.map((dep) => {
                const duration =
                  dep.readyAt && dep.stoppedAt
                    ? Math.floor(
                        (new Date(dep.stoppedAt).getTime() - new Date(dep.readyAt).getTime()) / 1000
                      )
                    : null;

                return (
                  <tr key={dep.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {dep.lab?.name ?? "Unknown"}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {dep.lab ? getCategoryLabel(dep.lab.category) : "—"} ·{" "}
                        {dep.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            getStatusDot(dep.status)
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-mono",
                            getStatusColor(dep.status)
                          )}
                        >
                          {dep.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {formatRelativeTime(dep.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {duration !== null
                        ? `${Math.floor(duration / 60)}m ${duration % 60}s`
                        : dep.status === "READY"
                        ? "Running"
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {dep.publicUrl ? (
                        <a
                          href={dep.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors font-mono"
                        >
                          Open
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-4 py-3 border-t border-white/10">
        <span className="text-[10px] text-muted-foreground font-mono">
          {filtered.length} of {deployments.length} deployments
        </span>
      </div>
    </div>
  );
}
