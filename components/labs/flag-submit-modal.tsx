"use client";

import { useEffect, useCallback } from "react";
import { X, Flag, Trophy, Shield } from "lucide-react";
import { FlagSubmit } from "@/components/labs/flag-submit";
import { getCategoryLabel, getDifficultyColor, cn } from "@/lib/utils";

interface FlagSubmitModalProps {
  slug: string;
  name: string;
  category: string;
  difficulty: string;
  points: number;
  isCompleted: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export function FlagSubmitModal({
  slug,
  name,
  category,
  difficulty,
  points,
  isCompleted,
  onClose,
  onCompleted,
}: FlagSubmitModalProps) {
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

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Submit flag for ${name}`}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <div className="glass-card w-full max-w-lg overflow-hidden rounded-2xl border border-primary/30 shadow-2xl shadow-primary/10 animate-slide-in-up">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/10">
                <Flag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-base sm:text-lg font-bold text-white truncate">
                  {name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground font-mono">
                    {getCategoryLabel(category)}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className={cn("text-xs font-mono font-medium", getDifficultyColor(difficulty))}>
                    {difficulty}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-secondary font-mono flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {points} pts
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste the captured flag token from this challenge below. Correct submissions award{" "}
              <strong className="text-white font-mono">+{points} points</strong> to your operator rank.
            </p>

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
