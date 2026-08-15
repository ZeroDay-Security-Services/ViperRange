"use client";

import { useState } from "react";
import { Flag, Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlagSubmitProps {
  slug: string;
  isCompleted: boolean;
  pointsAvailable: number;
  onCompleted?: (pointsEarned?: number) => void;
}

type SubmitState = "idle" | "submitting" | "correct" | "incorrect";

export function FlagSubmit({ slug, isCompleted, pointsAvailable, onCompleted }: FlagSubmitProps) {
  const [flag, setFlag] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(isCompleted);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!flag.trim() || state === "submitting") return;

    setState("submitting");
    setMessage(null);

    try {
      const res = await fetch(`/api/labs/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: flag.trim() }),
      });

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: {
          correct: boolean;
          alreadyCompleted: boolean;
          message: string;
          pointsEarned?: number;
        };
      };

      if (!res.ok || !data.success) {
        setState("incorrect");
        setMessage(data.error ?? "Submission failed. Try again.");
        return;
      }

      if (data.data?.correct) {
        setState("correct");
        setMessage(data.data.message);
        setAlreadyDone(true);
        if (data.data.pointsEarned !== undefined) {
          onCompleted?.(data.data.pointsEarned);
        }
      } else {
        setState("incorrect");
        setMessage(data.data?.message ?? "Incorrect flag.");
      }
    } catch {
      setState("incorrect");
      setMessage("Network error. Please try again.");
    }
  }

  if (alreadyDone) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-status-ready/10 border border-status-ready/25 text-sm text-status-ready">
        <Trophy className="w-4 h-4 shrink-0" />
        <span>Lab completed — {pointsAvailable} points earned.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={flag}
            onChange={(e) => {
              setFlag(e.target.value);
              if (state !== "idle") setState("idle");
            }}
            placeholder="VR{...}"
            className={cn(
              "w-full pl-9 pr-3 py-2.5 bg-surface border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:ring-1",
              state === "correct" && "border-status-ready/50 focus:ring-status-ready/30",
              state === "incorrect" && "border-primary/50 focus:ring-primary/30",
              state === "idle" && "border-white/10 focus:border-primary/40 focus:ring-primary/20"
            )}
            disabled={state === "submitting"}
          />
        </div>
        <button
          type="submit"
          disabled={state === "submitting" || !flag.trim()}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shrink-0"
        >
          {state === "submitting" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {message && (
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
            state === "correct" && "bg-status-ready/10 border border-status-ready/20 text-status-ready",
            state === "incorrect" && "bg-primary/10 border border-primary/20 text-primary"
          )}
        >
          {state === "correct" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          {message}
        </div>
      )}
    </form>
  );
}
