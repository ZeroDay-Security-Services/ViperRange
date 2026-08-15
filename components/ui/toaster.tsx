"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "border-status-ready/30 bg-status-ready/10 text-status-ready",
    error: "border-primary/30 bg-primary/10 text-primary",
    info: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 space-y-2 w-80">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border glass-card shadow-card-hover animate-slide-in-up",
                colors[t.type]
              )}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm flex-1 text-foreground">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
