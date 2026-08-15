"use client";

import { useEffect } from "react";
import { Shield, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-3 tracking-wide">
            CRITICAL ERROR
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            A critical error occurred in ViperRange. Our team at ZeroDay Security Services has been notified.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground mb-6 bg-surface p-3 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-2 mx-auto bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
