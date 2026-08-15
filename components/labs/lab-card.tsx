"use client";

import { useState, useCallback } from "react";
import {
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Clock,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Eye,
  Trophy,
} from "lucide-react";
import { ChallengeModal } from "@/components/labs/challenge-modal";
import {
  getDifficultyColor,
  getStatusColor,
  getStatusDot,
  getCategoryLabel,
  formatRelativeTime,
  cn,
} from "@/lib/utils";

interface ActiveDeployment {
  id: string;
  labId: string;
  status: string;
  publicUrl: string | null;
  startedAt: Date;
  readyAt: Date | null;
}

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

interface Lab {
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
  hints?: LabHint[] | null;
  resources?: LabResource[] | null;
}

interface LabCardProps {
  lab: Lab;
  activeDeployment: ActiveDeployment | null;
  isCompleted?: boolean;
}

const CATEGORY_ICON: Record<string, string> = {
  OSINT: "🔍",
  PWN: "💣",
  REVERSING: "🧬",
  CRYPTO: "🔐",
  FORENSICS: "🧪",
  LINUX: "🐧",
  MISC: "🧩",
  WEB_APP: "🌐",
};

const OFFLINE_ACTION_LABEL: Record<string, string> = {
  OSINT: "Investigate",
  PWN: "Analyze Binary",
  REVERSING: "Analyze Binary",
};

type ActionState = "idle" | "starting" | "stopping" | "error" | "success";

export function LabCard({ lab, activeDeployment: initialDeployment, isCompleted = false }: LabCardProps) {
  const [deployment, setDeployment] = useState(initialDeployment);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  const startPolling = useCallback((deploymentId: string) => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/lab-status?deploymentId=${deploymentId}`);
        const data = (await res.json()) as {
          success: boolean;
          data?: { status: string; publicUrl: string | null; readyAt: string | null };
        };
        if (data.success && data.data) {
          setDeployment((prev) =>
            prev
              ? {
                  ...prev,
                  status: data.data!.status,
                  publicUrl: data.data!.publicUrl,
                  readyAt: data.data!.readyAt ? new Date(data.data!.readyAt) : null,
                }
              : null
          );
          if (["READY", "FAILED", "STOPPED"].includes(data.data.status)) {
            clearInterval(id);
            setPollingId(null);
            setActionState(data.data.status === "READY" ? "success" : "idle");
          }
        }
      } catch {
        clearInterval(id);
        setPollingId(null);
      }
    }, 3000);

    setPollingId(id);
    return id;
  }, []);

  async function handleStart() {
    setActionState("starting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/start-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId: lab.id }),
      });

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { deploymentId: string; status: string; publicUrl: string | null };
      };

      if (!res.ok || !data.success) {
        setActionState("error");
        setErrorMessage(data.error ?? "Failed to start lab.");
        return;
      }

      setDeployment({
        id: data.data!.deploymentId,
        labId: lab.id,
        status: data.data!.status,
        publicUrl: data.data!.publicUrl,
        startedAt: new Date(),
        readyAt: null,
      });

      if (!["READY", "FAILED"].includes(data.data!.status)) {
        startPolling(data.data!.deploymentId);
      } else {
        setActionState("success");
      }
    } catch {
      setActionState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  async function handleStop() {
    if (!deployment) return;
    setActionState("stopping");

    try {
      const res = await fetch("/api/stop-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentId: deployment.id }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (res.ok && data.success) {
        if (pollingId) clearInterval(pollingId);
        setDeployment(null);
        setActionState("idle");
      } else {
        setActionState("error");
        setErrorMessage(data.error ?? "Failed to stop lab.");
      }
    } catch {
      setActionState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  async function handleRestart() {
    await handleStop();
    setTimeout(handleStart, 500);
  }

  const isRunning = deployment?.status === "READY";
  const isDeploying = ["QUEUED", "DEPLOYING", "WARMING"].includes(deployment?.status ?? "");
  const isBusy = actionState === "starting" || actionState === "stopping" || isDeploying;
  const estMins = Math.ceil(lab.estimatedDeployTime / 60);
  const isDeployable = lab.labType === "DEPLOYABLE";

  return (
    <>
      <div
        className={cn(
          "glass-card-hover flex flex-col",
          lab.isFeatured && "border-secondary/20",
          isRunning && "border-status-ready/25",
          completed && "border-status-ready/30"
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="text-2xl leading-none shrink-0">
              {CATEGORY_ICON[lab.category] ?? "🔬"}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight mb-1 truncate">
                {lab.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-mono font-medium", getDifficultyColor(lab.difficulty))}>
                  {lab.difficulty}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {getCategoryLabel(lab.category)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {completed && (
              <div className="flex items-center gap-1 text-status-ready" title="Completed">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            )}
            {isDeployable && deployment && (
              <>
                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusDot(deployment.status))} />
                <span className={cn("text-[10px] font-mono", getStatusColor(deployment.status))}>
                  {deployment.status}
                </span>
              </>
            )}
            {!isDeployable && (
              <span className="text-[10px] font-mono text-accent-purple bg-accent-purple/10 border border-accent-purple/20 px-1.5 py-0.5 rounded-full">
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {lab.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {lab.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/15 text-primary font-mono"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Points */}
          <div className="flex items-center gap-1.5 text-[10px] text-secondary font-mono">
            <Trophy className="w-3 h-3" />
            {lab.points} points
          </div>

          {isDeployable && (
            <>
              {isDeploying && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">Deploying...</span>
                    <span className="text-secondary font-mono">~{estMins}m</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill deploy-progress w-full" />
                  </div>
                </div>
              )}

              {isRunning && deployment?.publicUrl && (
                <a
                  href={deployment.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-status-ready/5 border border-status-ready/20 text-xs text-status-ready hover:bg-status-ready/10 transition-colors group"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-mono flex-1">{deployment.publicUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              )}

              {actionState === "error" && errorMessage && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!deployment && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                  <Clock className="w-3 h-3" />
                  Ready in ~{estMins} minute{estMins !== 1 ? "s" : ""}
                </div>
              )}

              {deployment?.readyAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                  <Clock className="w-3 h-3" />
                  Running for {formatRelativeTime(deployment.readyAt)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          {isDeployable ? (
            !deployment || deployment.status === "STOPPED" || deployment.status === "FAILED" ? (
              <button
                onClick={handleStart}
                disabled={isBusy}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 hover:shadow-glow-primary"
              >
                {actionState === "starting" ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting...</>
                ) : (
                  <><Play className="w-3.5 h-3.5" /> Start Lab</>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  disabled={isBusy}
                  className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-surface-light border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-xs font-medium py-2.5 px-3 rounded-lg transition-all duration-200"
                >
                  {actionState === "stopping" ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Stopping...</>
                  ) : (
                    <><Square className="w-3.5 h-3.5" /> Stop</>
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  disabled={isBusy}
                  title="Restart lab"
                  className="flex items-center justify-center p-2.5 bg-surface hover:bg-surface-light border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground rounded-lg transition-all duration-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </>
            )
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-accent-purple/15 hover:bg-accent-purple/25 border border-accent-purple/30 text-accent-purple text-xs font-semibold py-2.5 px-3 rounded-lg transition-all duration-200"
            >
              {lab.category === "OSINT" ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5" />
              )}
              {OFFLINE_ACTION_LABEL[lab.category] ?? "Open Challenge"}
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <ChallengeModal
          slug={lab.slug}
          name={lab.name}
          description={lab.description}
          category={lab.category}
          difficulty={lab.difficulty}
          points={lab.points}
          isCompleted={completed}
          hints={lab.hints ?? []}
          resources={lab.resources ?? []}
          onClose={() => setModalOpen(false)}
          onCompleted={() => setCompleted(true)}
        />
      )}
    </>
  );
}
