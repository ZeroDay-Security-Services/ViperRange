"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { LabCard } from "@/components/labs/lab-card";
import { getCategoryLabel, cn } from "@/lib/utils";

interface ActiveDeployment {
  id: string;
  labId: string;
  status: string;
  publicUrl: string | null;
  startedAt: Date;
  readyAt: Date | null;
}

interface LabWithState {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  labType: string;
  tags: string[];
  estimatedDeployTime: number;
  isFeatured: boolean;
  points: number;
  hints: unknown;
  resources: unknown;
  activeDeployment: ActiveDeployment | null;
  isCompleted: boolean;
}

const CATEGORIES = [
  "ALL", "WEB_APP", "CRYPTO", "FORENSICS", "LINUX", "PWN", "REVERSING", "OSINT", "MISC",
];

export function LabsMarketplace({ labs }: { labs: LabWithState[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "ALL";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");

  function selectCategory(cat: string) {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "ALL") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.replace(`/labs${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    return labs.filter((lab) => {
      const matchesCategory = activeCategory === "ALL" || lab.category === activeCategory;
      const matchesSearch =
        !search ||
        lab.name.toLowerCase().includes(search.toLowerCase()) ||
        lab.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [labs, activeCategory, search]);

  const featured = filtered.filter((l) => l.isFeatured);
  const others = filtered.filter((l) => !l.isFeatured);

  const completedCount = labs.filter((l) => l.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-display font-bold text-primary">{completedCount}</div>
          <div className="text-xs text-muted-foreground">
            of <span className="text-foreground font-medium">{labs.length}</span> labs completed
          </div>
        </div>
        <div className="w-32 sm:w-48 progress-bar">
          <div
            className="progress-fill deploy-progress"
            style={{ width: `${labs.length > 0 ? (completedCount / labs.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Search + category filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search labs by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 border whitespace-nowrap",
                activeCategory === cat
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-surface/50 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              )}
            >
              {cat === "ALL" ? "All Labs" : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-[10px] font-mono text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              Featured
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab as never}
                activeDeployment={lab.activeDeployment}
                isCompleted={lab.isCompleted}
              />
            ))}
          </div>
        </section>
      )}

      {/* All / filtered labs */}
      {others.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-4">
            {activeCategory === "ALL" ? "All Labs" : getCategoryLabel(activeCategory)}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {others.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab as never}
                activeDeployment={lab.activeDeployment}
                isCompleted={lab.isCompleted}
              />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <p className="text-muted-foreground">No labs match your search.</p>
        </div>
      )}
    </div>
  );
}
