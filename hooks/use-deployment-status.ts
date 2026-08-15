// ViperRange — useDeploymentStatus Hook
// ZeroDay Security Services

import { useState, useEffect, useRef, useCallback } from "react";
import type { DeploymentStatus } from "@/types";

interface DeploymentState {
  deploymentId: string;
  status: DeploymentStatus;
  publicUrl: string | null;
  readyAt: string | null;
  errorMessage: string | null;
  labName: string | null;
}

interface UseDeploymentStatusOptions {
  deploymentId: string | null;
  initialStatus?: DeploymentStatus;
  pollIntervalMs?: number;
  onReady?: (url: string) => void;
  onFailed?: (error: string) => void;
}

const TERMINAL_STATUSES: DeploymentStatus[] = ["READY", "STOPPED", "FAILED", "SLEEPING"];

export function useDeploymentStatus({
  deploymentId,
  initialStatus = "QUEUED",
  pollIntervalMs = 3000,
  onReady,
  onFailed,
}: UseDeploymentStatusOptions) {
  const [state, setState] = useState<DeploymentState | null>(
    deploymentId
      ? {
          deploymentId,
          status: initialStatus,
          publicUrl: null,
          readyAt: null,
          errorMessage: null,
          labName: null,
        }
      : null
  );
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onReadyRef = useRef(onReady);
  const onFailedRef = useRef(onFailed);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onFailedRef.current = onFailed; }, [onFailed]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/lab-status?deploymentId=${id}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to fetch status.");
        stopPolling();
        return;
      }

      const data = (await res.json()) as {
        success: boolean;
        data: DeploymentState;
      };

      if (!data.success) return;

      setState(data.data);

      if (TERMINAL_STATUSES.includes(data.data.status)) {
        stopPolling();
        if (data.data.status === "READY" && data.data.publicUrl) {
          onReadyRef.current?.(data.data.publicUrl);
        }
        if (data.data.status === "FAILED") {
          onFailedRef.current?.(data.data.errorMessage ?? "Deployment failed.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      stopPolling();
    }
  }, [stopPolling]);

  useEffect(() => {
    if (!deploymentId) return;

    // Don't poll if already in terminal state
    if (state && TERMINAL_STATUSES.includes(state.status)) return;

    setIsPolling(true);
    poll(deploymentId);

    intervalRef.current = setInterval(() => {
      poll(deploymentId);
    }, pollIntervalMs);

    return stopPolling;
  }, [deploymentId, pollIntervalMs, poll, stopPolling]);

  return {
    state,
    isPolling,
    error,
    isReady: state?.status === "READY",
    isDeploying: state
      ? ["QUEUED", "DEPLOYING", "WARMING"].includes(state.status)
      : false,
    isFailed: state?.status === "FAILED",
    stopPolling,
  };
}
