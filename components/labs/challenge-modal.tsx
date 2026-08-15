"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Lightbulb, ChevronDown, FileText, Eye } from "lucide-react";
import { FlagSubmit } from "@/components/labs/flag-submit";
import { getCategoryLabel, getDifficultyColor, cn } from "@/lib/utils";

interface LabHint {
  order: number;
  text: string;
  pointsPenalty?: number;
}

interface LabResource {
  name: string;
  description: string;
  url: string;
}

interface ChallengeModalProps {
  slug: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  isCompleted: boolean;
  hints: LabHint[];
  resources: LabResource[];
  onClose: () => void;
  onCompleted?: () => void;
}

const CATEGORY_ACTION_LABEL: Record<string, string> = {
  OSINT: "Investigate",
  PWN: "Analyze Binary",
  REVERSING: "Analyze Binary",
};

export function ChallengeModal({
  slug,
  name,
  description,
  category,
  difficulty,
  points,
  isCompleted,
  hints,
  resources,
  onClose,
  onCompleted,
}: ChallengeModalProps) {
  const [revealedHints, setRevealedHints] = useState<LabHint[]>([]);
  const [hintsOpen, setHintsOpen] = useState(false);

  const closeOnEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [closeOnEscape]);

  async function revealNextHint() {
    const nextOrder = revealedHints.length + 1;
    if (nextOrder > hints.length) return;

    try {
      const res = await fetch(`/api/labs/${slug}/hints?upTo=${nextOrder}`);
      const data = (await res.json()) as { success: boolean; data?: { hints: LabHint[] } };
      if (data.success && data.data) {
        setRevealedHints(data.data.hints);
      }
    } catch {
      // Fall back to client-side reveal if the API call fails
      setRevealedHints(hints.filter((h) => h.order <= nextOrder));
    }
  }

  const actionLabel = CATEGORY_ACTION_LABEL[category] ?? "Open Challenge";
  const CategoryIcon = category === "OSINT" ? Eye : FileText;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div className="glass-card w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl animate-slide-in-up">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10 shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <CategoryIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-white truncate">{name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    {getCategoryLabel(category)}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className={cn("text-xs font-mono font-medium", getDifficultyColor(difficulty))}>
                    {difficulty}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-secondary font-mono">{points} pts</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close challenge"
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto thin-scrollbar p-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

            {/* Resources */}
            {resources.length > 0 && (
              <div>
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2.5">
                  Resources
                </h3>
                <div className="space-y-2">
                  {resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      download
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-white/5 hover:border-white/15 transition-colors group"
                    >
                      <Download className="w-4 h-4 text-accent-cyan shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-foreground truncate group-hover:text-white transition-colors">
                          {r.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{r.description}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <div>
                <button
                  onClick={() => setHintsOpen(!hintsOpen)}
                  className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2.5 hover:text-foreground transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hints ({revealedHints.length}/{hints.length} revealed)
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", hintsOpen && "rotate-180")} />
                </button>

                {hintsOpen && (
                  <div className="space-y-2">
                    {revealedHints.map((h) => (
                      <div
                        key={h.order}
                        className="p-3 rounded-lg bg-secondary/5 border border-secondary/20 text-sm text-foreground/90"
                      >
                        <span className="text-secondary font-mono text-xs mr-2">#{h.order}</span>
                        {h.text}
                        {h.pointsPenalty ? (
                          <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                            (-{h.pointsPenalty} pts if used)
                          </span>
                        ) : null}
                      </div>
                    ))}
                    {revealedHints.length < hints.length && (
                      <button
                        onClick={revealNextHint}
                        className="w-full text-center py-2.5 text-xs text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-colors font-medium"
                      >
                        Reveal Hint #{revealedHints.length + 1}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer — flag submission */}
          <div className="p-5 border-t border-white/10 shrink-0">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2.5">
              {actionLabel} — Submit Flag
            </div>
            <FlagSubmit
              slug={slug}
              isCompleted={isCompleted}
              pointsAvailable={points}
              onCompleted={onCompleted}
            />
          </div>
        </div>
      </div>
    </>
  );
}
