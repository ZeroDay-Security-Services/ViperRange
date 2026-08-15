"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  Pause,
  Play,
  Download,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getLogLevelColor, cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  timestamp: string;
}

interface DeploymentOption {
  id: string;
  labName: string;
  status: string;
}

interface LiveTerminalProps {
  initialLogs: LogEntry[];
  deployments: DeploymentOption[];
}

const LEVEL_FILTERS = ["ALL", "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];

export function LiveTerminal({ initialLogs, deployments }: LiveTerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [selectedDeployment, setSelectedDeployment] = useState<string>(
    deployments[0]?.id ?? ""
  );
  const [isConnected, setIsConnected] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pausedRef = useRef(isPaused);
  const pendingRef = useRef<LogEntry[]>([]);

  useEffect(() => {
    pausedRef.current = isPaused;
    if (!isPaused && pendingRef.current.length > 0) {
      setLogs((prev) => [...prev, ...pendingRef.current].slice(-500));
      pendingRef.current = [];
    }
  }, [isPaused]);

  const connectSSE = useCallback((deploymentId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (!deploymentId) return;

    const es = new EventSource(`/api/logs?deploymentId=${deploymentId}&stream=true`);
    eventSourceRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.onmessage = (event) => {
      try {
        const log: LogEntry = JSON.parse(event.data as string);
        if (pausedRef.current) {
          pendingRef.current.push(log);
        } else {
          setLogs((prev) => [...prev, log].slice(-500));
        }
      } catch {
        // Malformed message — ignore
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Reconnect after 5s
      setTimeout(() => connectSSE(deploymentId), 5000);
    };

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    if (selectedDeployment) {
      const cleanup = connectSSE(selectedDeployment);
      return cleanup;
    }
  }, [selectedDeployment, connectSSE]);

  // Auto-scroll
  useEffect(() => {
    if (!isPaused) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPaused]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;
    const matchesSearch =
      !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  function clearLogs() {
    setLogs([]);
    pendingRef.current = [];
  }

  function downloadLogs() {
    const content = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viperrange-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="glass-card p-3 flex flex-wrap items-center gap-2">
        {/* Deployment selector */}
        {deployments.length > 0 && (
          <select
            value={selectedDeployment}
            onChange={(e) => setSelectedDeployment(e.target.value)}
            className="bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary/40 transition-colors"
          >
            {deployments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.labName} ({d.status})
              </option>
            ))}
          </select>
        )}

        {/* Connection status */}
        <div className={cn(
          "flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border",
          isConnected
            ? "text-status-ready bg-status-ready/10 border-status-ready/20"
            : "text-muted-foreground bg-surface border-white/10"
        )}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? "LIVE" : "OFFLINE"}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-surface border border-white/10 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all font-mono"
          />
        </div>

        {/* Level filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-white/10 rounded-lg text-xs text-foreground hover:border-white/20 transition-colors font-mono"
          >
            <Filter className="w-3 h-3 text-muted-foreground" />
            {levelFilter}
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 glass-card py-1 z-20">
                {LEVEL_FILTERS.map((level) => (
                  <button
                    key={level}
                    onClick={() => { setLevelFilter(level); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-white/5 transition-colors",
                      levelFilter === level ? getLogLevelColor(level) : "text-muted-foreground"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Pause/resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume" : "Pause"}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Download */}
          <button
            onClick={downloadLogs}
            title="Download logs"
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={clearLogs}
            title="Clear terminal"
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-primary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal window */}
      <div className="terminal rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-surface/30">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-secondary/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-status-ready/80" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              ViperRange Security Terminal — ZeroDay Security Services
            </span>
          </div>
          <div className="ml-auto text-[10px] font-mono text-muted-foreground">
            {filteredLogs.length} entries
            {isPaused && pendingRef.current.length > 0 && (
              <span className="text-secondary ml-2">
                +{pendingRef.current.length} pending
              </span>
            )}
          </div>
        </div>

        {/* Log output */}
        <div className="h-[480px] overflow-y-auto thin-scrollbar p-3 space-y-0.5 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Terminal className="w-8 h-8 opacity-30" />
              <div className="text-center">
                <p className="text-sm">No logs yet.</p>
                <p className="text-[10px] mt-1">
                  {deployments.length === 0
                    ? "Start a lab to see logs here."
                    : "Waiting for telemetry..."}
                </p>
              </div>
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={log.id ?? i} className="terminal-line flex gap-2 py-0.5">
                <span className="text-muted-foreground/50 select-none shrink-0 w-16">
                  {formatTime(log.timestamp)}
                </span>
                <span
                  className={cn(
                    "shrink-0 w-14 text-right",
                    getLogLevelColor(log.level)
                  )}
                >
                  [{log.level}]
                </span>
                <span className="text-accent-cyan/60 shrink-0 w-20 truncate">
                  {log.source}
                </span>
                <span className="text-foreground/90 break-all flex-1">
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Blinking cursor */}
        <div className="px-3 py-2 border-t border-white/5">
          <span className="text-primary font-mono text-xs">
            viperrange@zeroday:~${" "}
          </span>
          <span className="inline-block w-2 h-3.5 bg-primary animate-terminal-blink align-middle" />
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground font-mono text-center">
        ⚠️ All logs marked [SIMULATED] are educational training telemetry — not live attack data from external systems.
      </p>
    </div>
  );
}
